import Foundation
import Observation

struct TopicProgress: Codable {
    var best = 0
    var total = 5
    var attempts = 0
    var passed = false
    var perfect = false
    var failedOnce = false
    var lastPassAt: Date?
    var reviewStage = 0
}

struct ExamProgress: Codable {
    var best = 0          // percent
    var attempts = 0
    var passed = false
    var perfect = false
    var failedOnce = false
}

/// A question in the mistakes deck. Keyed by ProgressStore.mistakeKey, not by position, so content can reorder.
struct Mistake: Codable {
    var section: String
    var topic: String     // topic id, or "exam" for the section exam pool
    var missedAt: Date
    var streak = 0        // right answers in a row in mistakes reviews
}

struct ProgressState: Codable {
    var xp = 0
    var topics: [String: TopicProgress] = [:]
    var exams: [String: ExamProgress] = [:]
    var days: [String] = []
    var badges: [String: Date] = [:]
    var reviews = 0
    var freeRoam = false
    var mistakes: [String: Mistake]?   // optional so older progress.json still decodes
    // Also optional for older progress.json.
    var mistakesCleared: Int?
    var solved: SolvedCounts?
    var xpByDay: [String: Int]?        // "yyyy-MM-dd" (local) -> XP earned that day, last 120 days
}

/// Right answers by question kind, for the spot-the-bug and ordering badges.
struct SolvedCounts: Codable {
    var line = 0
    var order = 0
}

struct Badge: Identifiable {
    let id: String
    let name: String
    let detail: String
    let symbol: String
    /// (current, target) toward the badge, shown on locked badges. Clamped by ProgressStore.progress(_:).
    let progress: (ProgressStore) -> (current: Int, target: Int)
    let test: (ProgressStore) -> Bool
}

enum Rules {
    static let topicPass = 0.8   // 4 of 5
    static let examPass = 0.8
    static let reviewDays = [3, 7, 21, 60]
    static let mistakeClearStreak = 2   // right answers in a row, in mistakes reviews, to clear a question
    static let mistakeSession = 10
    static let levels: [(Int, String)] = [
        (0, "Intern"), (200, "Apprentice"), (600, "Junior Engineer"), (1200, "Engineer"),
        (2000, "Senior Engineer"), (3000, "Staff Engineer"), (4500, "Principal Engineer"), (6500, "Distinguished Engineer"),
        (8500, "Fellow"), (11000, "Senior Fellow"), (14000, "Chief Engineer"), (17500, "Master Shipwright"),
    ]
    static let heatSteps = [1, 50, 150, 300]   // activity heatmap: day XP at which buckets 1...4 start
    static let heatWeeks = 12
}

/// What happened at the end of a quiz or exam, for the result screen.
struct QuizOutcome {
    let correct: Int
    let total: Int
    let passed: Bool
    let gains: [(String, Int)]
    let newBadges: [Badge]
    let levelUp: String?
    var cleared: [Question] = []
    var percent: Int { Int((Double(correct) / Double(total) * 100).rounded()) }
}

@Observable
@MainActor
final class ProgressStore {
    private(set) var state = ProgressState()
    /// Set by a passed spaced review that left no other reviews due; read by the inboxzero badge in finish().
    @ObservationIgnored private var inboxZeroNow = false
    let sections = Curriculum.sections
    /// Every quiz and exam question by mistake key, with where it lives.
    let questionIndex: [String: (si: Int, ti: Int?, question: Question)] = {
        var index: [String: (si: Int, ti: Int?, question: Question)] = [:]
        for (si, section) in Curriculum.sections.enumerated() {
            for q in section.exam { index[ProgressStore.mistakeKey(q)] = (si, nil, q) }
            for (ti, topic) in section.topics.enumerated() {
                for q in topic.quiz { index[ProgressStore.mistakeKey(q)] = (si, ti, q) }
            }
        }
        return index
    }()

    private let fileURL: URL = {
        let dir = FileManager.default.urls(for: .applicationSupportDirectory, in: .userDomainMask)[0]
            .appendingPathComponent("ShipwrightAcademy", isDirectory: true)
        try? FileManager.default.createDirectory(at: dir, withIntermediateDirectories: true)
        return dir.appendingPathComponent("progress.json")
    }()

    init() {
        if let data = try? Data(contentsOf: fileURL),
           let saved = try? JSONDecoder().decode(ProgressState.self, from: data) {
            state = saved
        }
        // Questions whose content is gone from the curriculum drop out silently.
        if !sections.isEmpty { state.mistakes = state.mistakes?.filter { questionIndex[$0.key] != nil } }
    }

    private func save() {
        if let data = try? JSONEncoder().encode(state) {
            try? data.write(to: fileURL, options: .atomic)
        }
    }

    // MARK: Lookups

    private func key(_ si: Int, _ ti: Int) -> String { sections[si].id + "/" + sections[si].topics[ti].id }
    func topic(_ si: Int, _ ti: Int) -> TopicProgress { state.topics[key(si, ti)] ?? TopicProgress() }
    func exam(_ si: Int) -> ExamProgress { state.exams[sections[si].id] ?? ExamProgress() }

    var freeRoam: Bool {
        get { state.freeRoam }
        set { state.freeRoam = newValue; save() }
    }

    // MARK: Unlocking

    func sectionUnlocked(_ si: Int) -> Bool {
        guard !state.freeRoam, let prev = Curriculum.previousInTrack(si) else { return true }
        return exam(prev).passed
    }

    func topicUnlocked(_ si: Int, _ ti: Int) -> Bool {
        if state.freeRoam { return true }
        guard sectionUnlocked(si) else { return false }
        return ti == 0 || topic(si, ti - 1).passed
    }

    func examUnlocked(_ si: Int) -> Bool {
        if state.freeRoam { return true }
        return sectionUnlocked(si) && sections[si].topics.indices.allSatisfy { topic(si, $0).passed }
    }

    func reviewDue(_ si: Int, _ ti: Int) -> Bool {
        let t = topic(si, ti)
        guard t.passed, t.reviewStage < Rules.reviewDays.count, let last = t.lastPassAt else { return false }
        return Date().timeIntervalSince(last) >= Double(Rules.reviewDays[t.reviewStage]) * 86_400
    }

    func passedCount(_ si: Int) -> Int { sections[si].topics.indices.filter { topic(si, $0).passed }.count }

    var totals: (passed: Int, topics: Int, exams: Int) {
        var passed = 0, exams = 0
        for si in sections.indices {
            passed += passedCount(si)
            if exam(si).passed { exams += 1 }
        }
        return (passed, Curriculum.topicCount, exams)
    }

    enum Step: Equatable { case topic(Int, Int), exam(Int), review(Int, Int) }

    var nextStep: Step? {
        for si in sections.indices {
            for ti in sections[si].topics.indices where !topic(si, ti).passed && topicUnlocked(si, ti) {
                return .topic(si, ti)
            }
            if !exam(si).passed && examUnlocked(si) { return .exam(si) }
        }
        for si in sections.indices {
            for ti in sections[si].topics.indices where reviewDue(si, ti) { return .review(si, ti) }
        }
        return nil
    }

    /// The section the learner is working in: the first one whose exam is not passed.
    var currentSection: Int {
        sections.indices.first { !exam($0).passed } ?? max(sections.count - 1, 0)
    }

    // MARK: Mistakes deck

    /// FNV-1a over the question's UTF-16 content, base 36; matches mistakeKey in app.js.
    nonisolated static func mistakeKey(_ q: Question) -> String {
        var h: UInt32 = 0x811c9dc5
        for u in ([q.q] + q.options + q.steps + (q.code.map { [$0] } ?? [])).joined(separator: "\u{0}").utf16 { h = (h ^ UInt32(u)) &* 0x01000193 }
        return String(h, radix: 36)
    }

    /// Deck keys, oldest miss first.
    var mistakeDeck: [String] {
        (state.mistakes ?? [:]).filter { questionIndex[$0.key] != nil }
            .sorted { ($0.value.missedAt, $0.key) < ($1.value.missedAt, $1.key) }
            .map(\.key)
    }

    func mistake(_ key: String) -> Mistake? { state.mistakes?[key] }

    // MARK: Level, streak

    func level(for xp: Int? = nil) -> (number: Int, name: String, floor: Int, next: Int?) {
        let xp = xp ?? state.xp
        var i = 0
        while i + 1 < Rules.levels.count && xp >= Rules.levels[i + 1].0 { i += 1 }
        let next = i + 1 < Rules.levels.count ? Rules.levels[i + 1].0 : nil
        return (i + 1, Rules.levels[i].1, Rules.levels[i].0, next)
    }

    var levelFraction: Double {
        let l = level()
        guard let next = l.next else { return 1 }
        return Double(state.xp - l.floor) / Double(next - l.floor)
    }

    private static let dayFormat: DateFormatter = {
        let f = DateFormatter()
        f.dateFormat = "yyyy-MM-dd"
        return f
    }()

    static func dayKey(_ date: Date) -> String { dayFormat.string(from: date) }

    // MARK: Activity heatmap

    /// XP earned on a day. Days studied before XP was tracked per day count as active (bucket 1) with nil XP.
    func dayXP(_ date: Date) -> (xp: Int?, active: Bool) {
        let k = Self.dayKey(date)
        if let xp = state.xpByDay?[k] { return (xp, true) }
        return (nil, state.days.contains(k))
    }

    /// 0 (none) to 4, by Rules.heatSteps. A day with a finished session is at least 1, even with 0 XP.
    func heatBucket(_ date: Date) -> Int {
        let d = dayXP(date)
        guard d.active else { return 0 }
        return max(1, Rules.heatSteps.filter { (d.xp ?? 0) >= $0 }.count)
    }

    /// Monday of the current week, at the start of the day.
    var weekStart: Date {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        let sinceMonday = (cal.component(.weekday, from: today) + 5) % 7
        return cal.date(byAdding: .day, value: -sinceMonday, to: today)!
    }

    var weekXP: Int {
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        var d = weekStart, sum = 0
        while d <= today {
            sum += dayXP(d).xp ?? 0
            d = cal.date(byAdding: .day, value: 1, to: d)!
        }
        return sum
    }

    var bestDayXP: Int { state.xpByDay?.values.max() ?? 0 }

    var streak: Int {
        let days = Set(state.days)
        let cal = Calendar.current
        var d = Date()
        if !days.contains(Self.dayFormat.string(from: d)) { d = cal.date(byAdding: .day, value: -1, to: d)! }
        var n = 0
        while days.contains(Self.dayFormat.string(from: d)) {
            n += 1
            d = cal.date(byAdding: .day, value: -1, to: d)!
        }
        return n
    }

    // MARK: Badges

    /// (current, target) toward a badge, current clamped to target.
    func progress(_ b: Badge) -> (current: Int, target: Int) {
        let p = b.progress(self)
        return (min(max(p.current, 0), p.target), p.target)
    }

    private func passedExams(track: String) -> (current: Int, target: Int) {
        let idx = sections.indices.filter { sections[$0].trackName == track }
        return (idx.filter { exam($0).passed }.count, idx.count)
    }

    private static func cameBack(_ s: ProgressStore) -> Bool {
        s.state.topics.values.contains { $0.passed && $0.failedOnce } || s.state.exams.values.contains { $0.passed && $0.failedOnce }
    }

    @ObservationIgnored lazy var badges: [Badge] = {
        let one = { (b: Bool) in (current: b ? 1 : 0, target: 1) }
        var list: [Badge] = [
            Badge(id: "first", name: "First Commit", detail: "Pass your first topic quiz.", symbol: "checkmark.seal",
                  progress: { ($0.totals.passed, 1) }) { $0.totals.passed >= 1 },
            Badge(id: "flawless", name: "Zero Defects", detail: "Answer every question right on a topic quiz.", symbol: "star",
                  progress: { s in one(s.state.topics.values.contains { $0.perfect }) }) { $0.state.topics.values.contains { $0.perfect } },
            Badge(id: "comeback", name: "Root Caused", detail: "Pass a quiz or exam you previously failed.", symbol: "arrow.uturn.up",
                  progress: { one(ProgressStore.cameBack($0)) }) { ProgressStore.cameBack($0) },
            Badge(id: "boss", name: "Gatekeeper", detail: "Pass your first section exam.", symbol: "door.left.hand.open",
                  progress: { ($0.totals.exams, 1) }) { $0.totals.exams >= 1 },
            Badge(id: "streak3", name: "On Call", detail: "Study three days in a row.", symbol: "flame",
                  progress: { ($0.streak, 3) }) { $0.streak >= 3 },
            Badge(id: "streak7", name: "Release Train", detail: "Study seven days in a row.", symbol: "tram",
                  progress: { ($0.streak, 7) }) { $0.streak >= 7 },
            Badge(id: "review5", name: "Spaced Out", detail: "Complete five spaced reviews.", symbol: "arrow.trianglehead.2.clockwise",
                  progress: { ($0.state.reviews, 5) }) { $0.state.reviews >= 5 },
            Badge(id: "half", name: "Halfway Merged", detail: "Pass half of all topics.", symbol: "circle.lefthalf.filled",
                  progress: { ($0.totals.passed, ($0.totals.topics + 1) / 2) }) { s in
                let t = s.totals
                return t.topics > 0 && t.passed * 2 >= t.topics
            },
            Badge(id: "mistakes10", name: "Debugger", detail: "Clear 10 questions from your mistakes deck.", symbol: "ladybug",
                  progress: { ($0.state.mistakesCleared ?? 0, 10) }) { ($0.state.mistakesCleared ?? 0) >= 10 },
            Badge(id: "mistakes50", name: "Bug Bounty", detail: "Clear 50 questions from your mistakes deck.", symbol: "ant",
                  progress: { ($0.state.mistakesCleared ?? 0, 50) }) { ($0.state.mistakesCleared ?? 0) >= 50 },
            Badge(id: "bugspot5", name: "Spot the Bug", detail: "Find the bug in five spot-the-bug questions.", symbol: "scope",
                  progress: { ($0.state.solved?.line ?? 0, 5) }) { ($0.state.solved?.line ?? 0) >= 5 },
            Badge(id: "order5", name: "Pipeline Builder", detail: "Put five sequences in the right order.", symbol: "list.number",
                  progress: { ($0.state.solved?.order ?? 0, 5) }) { ($0.state.solved?.order ?? 0) >= 5 },
            Badge(id: "inboxzero", name: "Inbox Zero", detail: "Finish a spaced review with no other reviews due.", symbol: "tray",
                  progress: { one($0.state.badges["inboxzero"] != nil || $0.inboxZeroNow) }) { $0.inboxZeroNow },
        ]
        for (si, section) in sections.enumerated() {
            list.append(Badge(id: "sec-" + section.id, name: section.title, detail: "Pass the \(section.title) section exam.", symbol: section.symbol,
                              progress: { ($0.passedCount(si) + ($0.exam(si).passed ? 1 : 0), section.topics.count + 1) }) { $0.exam(si).passed })
        }
        list.append(Badge(id: "track-software", name: "Full Stack", detail: "Pass every Software Engineering exam.", symbol: "server.rack",
                          progress: { $0.passedExams(track: "Software Engineering") }) { s in
            let t = s.passedExams(track: "Software Engineering")
            return t.target > 0 && t.current == t.target
        })
        list.append(Badge(id: "track-games", name: "Game Ready", detail: "Pass every Game Development exam.", symbol: "gamecontroller",
                          progress: { $0.passedExams(track: "Game Development") }) { s in
            let t = s.passedExams(track: "Game Development")
            return t.target > 0 && t.current == t.target
        })
        list.append(Badge(id: "all", name: "Shipwright", detail: "Pass every section exam.", symbol: "sailboat",
                          progress: { ($0.totals.exams, $0.sections.count) }) { s in
            !s.sections.isEmpty && s.totals.exams == s.sections.count
        })
        return list
    }()

    // MARK: Recording results

    func recordTopic(_ si: Int, _ ti: Int, correct: Int, total: Int, isReview: Bool) -> QuizOutcome {
        var t = topic(si, ti)
        let passed = Double(correct) / Double(total) >= Rules.topicPass
        var gains: [(String, Int)] = []
        var reviewed = false
        t.attempts += 1
        t.total = total
        if correct > t.best { gains.append(("Improved score", (correct - t.best) * 10)); t.best = correct }
        if passed && !t.passed {
            gains.append(("Topic passed", 50))
            t.passed = true
            t.lastPassAt = Date()
            t.reviewStage = 0
        } else if passed && isReview {
            gains.append(("Spaced review", 20))
            t.reviewStage += 1
            t.lastPassAt = Date()
            state.reviews += 1
            reviewed = true
        }
        if correct == total && !t.perfect { gains.append(("Perfect score", 25)); t.perfect = true }
        if !passed { t.failedOnce = true }
        state.topics[key(si, ti)] = t
        if reviewed {
            inboxZeroNow = !sections.indices.contains { si in sections[si].topics.indices.contains { reviewDue(si, $0) } }
        }
        return finish(correct: correct, total: total, passed: passed, gains: gains)
    }

    func recordExam(_ si: Int, correct: Int, total: Int) -> QuizOutcome {
        var e = exam(si)
        let passed = Double(correct) / Double(total) >= Rules.examPass
        let pct = Int((Double(correct) / Double(total) * 100).rounded())
        var gains: [(String, Int)] = []
        e.attempts += 1
        e.best = max(e.best, pct)
        if passed && !e.passed { gains.append(("Section exam passed", 250)); e.passed = true }
        if correct == total && !e.perfect { gains.append(("Flawless exam", 100)); e.perfect = true }
        if !passed { e.failedOnce = true }
        state.exams[sections[si].id] = e
        return finish(correct: correct, total: total, passed: passed, gains: gains)
    }

    /// Wrong answers from a topic quiz, review or exam (question, topic index or nil for the exam pool). Saved by the record call that follows.
    func recordMisses(_ si: Int, _ misses: [(Question, Int?)]) {
        var deck = state.mistakes ?? [:]
        for (q, ti) in misses {
            deck[Self.mistakeKey(q)] = Mistake(section: sections[si].id, topic: ti.map { sections[si].topics[$0].id } ?? "exam", missedAt: Date())
        }
        state.mistakes = deck
    }

    /// Right answers from any session, counted by question kind. Saved by the record call that follows.
    func recordSolved(_ results: [(Question, Bool)]) {
        var solved = state.solved ?? SolvedCounts()
        for (q, correct) in results where correct {
            switch q.kind {
            case .line: solved.line += 1
            case .order: solved.order += 1
            case .mc: break
            }
        }
        state.solved = solved
    }

    func recordMistakes(_ results: [(Question, Bool)]) -> QuizOutcome {
        var deck = state.mistakes ?? [:]
        var cleared: [Question] = []
        for (q, correct) in results {
            let k = Self.mistakeKey(q)
            guard var m = deck[k] else { continue }
            if !correct { m.streak = 0; m.missedAt = Date(); deck[k] = m }
            else if m.streak + 1 >= Rules.mistakeClearStreak { deck[k] = nil; cleared.append(q) }
            else { m.streak += 1; deck[k] = m }
        }
        state.mistakes = deck
        let n = cleared.count
        var gains: [(String, Int)] = []
        if n > 0 {
            gains.append(("Mistake cleared", n * 15))
            state.mistakesCleared = (state.mistakesCleared ?? 0) + n
        }
        var outcome = finish(correct: results.filter(\.1).count, total: results.count, passed: n > 0, gains: gains)
        outcome.cleared = cleared
        return outcome
    }

    private func finish(correct: Int, total: Int, passed: Bool, gains: [(String, Int)]) -> QuizOutcome {
        let before = level().number
        let gained = gains.reduce(0) { $0 + $1.1 }
        state.xp += gained
        let today = Self.dayKey(Date())
        if !state.days.contains(today) { state.days = Array((state.days + [today]).suffix(120)) }
        // XP per day for the heatmap; a session with no XP still records the day. Keeps the last 120 days.
        var byDay = state.xpByDay ?? [:]
        byDay[today, default: 0] += gained
        let cutoff = Self.dayKey(Calendar.current.date(byAdding: .day, value: -119, to: Date())!)
        state.xpByDay = byDay.filter { $0.key >= cutoff }
        var fresh: [Badge] = []
        for b in badges where state.badges[b.id] == nil && b.test(self) {
            state.badges[b.id] = Date()
            fresh.append(b)
        }
        inboxZeroNow = false
        save()
        let after = level()
        return QuizOutcome(correct: correct, total: total, passed: passed, gains: gains, newBadges: fresh,
                           levelUp: after.number > before ? after.name : nil)
    }

    func reset() {
        state = ProgressState()
        save()
    }
}
