import SwiftUI
import Observation

enum SidebarItem: Hashable {
    case home
    case section(Int)
    case mistakes
    case badges
}

enum Route: Hashable {
    case lesson(Int, Int)
    case quiz
    case result
    case search
    case cheatSheet(Int)
}

struct QuizItem: Identifiable {
    let id = UUID()
    let question: Question
    /// Display order of the original option indexes (mc), or the starting arrangement of step indexes (order).
    let order: [Int]
    /// The topic this question came from, for exam answer review.
    let topicIndex: Int?
    /// Set in mistakes reviews, where items come from many sections.
    var sectionIndex: Int?
}

struct QuizAnswer {
    /// mc: the original option index. line: the line index.
    let chosen: Int?
    /// order: the learner's arrangement of original step indexes.
    let arranged: [Int]
    let correct: Bool
}

@Observable
@MainActor
final class QuizSession {
    enum Kind: Equatable {
        case topic(Int, Int)
        case exam(Int)
        case mistakes
    }

    let kind: Kind
    let isReview: Bool
    let items: [QuizItem]
    var index = 0
    var picked: Int?
    /// order questions: the current arrangement of original step indexes.
    var arranged: [Int] = []
    var answers: [QuizAnswer] = []

    var checked: Bool { answers.count > index }
    var current: QuizItem { items[index] }
    var isLast: Bool { index == items.count - 1 }
    var canCheck: Bool { current.question.kind == .order || picked != nil }
    var sectionIndex: Int {
        switch kind {
        case .topic(let si, _), .exam(let si): si
        case .mistakes: current.sectionIndex ?? 0
        }
    }

    init(kind: Kind, isReview: Bool, items: [QuizItem]) {
        self.kind = kind
        self.isReview = isReview
        self.items = items
        arranged = items.first?.order ?? []
    }

    func check() {
        guard canCheck, !checked else { return }
        let q = current.question
        let correct = q.kind == .order ? arranged == Array(q.steps.indices) : picked == q.answer
        answers.append(QuizAnswer(chosen: picked, arranged: arranged, correct: correct))
    }

    func move(_ pos: Int, by delta: Int) {
        let to = pos + delta
        guard !checked, arranged.indices.contains(pos), arranged.indices.contains(to) else { return }
        arranged.swapAt(pos, to)
    }

    func advance() {
        guard checked, !isLast else { return }
        index += 1
        picked = nil
        arranged = current.order
    }
}

struct Toast: Identifiable {
    let id = UUID()
    let symbol: String
    let text: String
}

@Observable
@MainActor
final class AppModel {
    let store = ProgressStore()
    var sidebar: SidebarItem? = .home
    var path: [Route] = []
    var session: QuizSession?
    var outcome: QuizOutcome?
    var toasts: [Toast] = []
    var searchText = ""
    /// Bumped by the Search menu commands; ContentView focuses the search field.
    var searchFocusRequests = 0
    /// While the search field has focus, screen shortcuts (quiz digits, Return) stand down, as on the web.
    var searchFocused = false
    /// Lesson block to scroll to once the lesson opens (see Search).
    var lessonAnchor: String?

    var sections: [CourseSection] { store.sections }

    func select(_ item: SidebarItem) {
        sidebar = item
        path = []
    }

    func openLesson(_ si: Int, _ ti: Int) {
        lessonAnchor = nil
        path = [.lesson(si, ti)]
    }

    /// Shows results while there is a query and returns to the previous screen when it is cleared.
    func searchChanged() {
        let active = !searchText.trimmingCharacters(in: .whitespaces).isEmpty
        if active, path.last != .search { path.append(.search) }
        else if !active, path.last == .search { path.removeLast() }
    }

    /// Focusing the field shows the results for the current query again, like the web.
    func searchFocusChanged(_ focused: Bool) {
        searchFocused = focused
        if focused { searchChanged() }
    }

    func searchOpenable(_ si: Int, _ ti: Int?) -> Bool {
        ti.map { store.topicUnlocked(si, $0) } ?? true
    }

    func open(_ hit: SearchEntry) {
        guard searchOpenable(hit.si, hit.ti) else { return }
        session = nil
        if let ti = hit.ti {
            lessonAnchor = hit.anchor
            path = [.lesson(hit.si, ti)]
        } else {
            select(.section(hit.si))
        }
    }

    /// Enter in the search field: open the best result that is not locked.
    func openFirstResult() {
        guard let terms = Search.terms(searchText),
              let hit = Search.run(terms).first(where: { searchOpenable($0.si, $0.ti) })?.hits.first else { return }
        open(hit)
    }

    func go(to step: ProgressStore.Step) {
        switch step {
        case .topic(let si, let ti), .review(let si, let ti): openLesson(si, ti)
        case .exam(let si): startExam(si)
        }
    }

    func startQuiz(_ si: Int, _ ti: Int) {
        let topic = sections[si].topics[ti]
        let items = topic.quiz.shuffled().map { makeItem($0, topicIndex: ti) }
        session = QuizSession(kind: .topic(si, ti), isReview: store.reviewDue(si, ti), items: items)
        path = [.lesson(si, ti), .quiz]
    }

    func startExam(_ si: Int) {
        let section = sections[si]
        var items = section.exam.map { makeItem($0, topicIndex: nil) }
        for (ti, topic) in section.topics.enumerated() {
            if let q = topic.quiz.randomElement() { items.append(makeItem(q, topicIndex: ti)) }
        }
        session = QuizSession(kind: .exam(si), isReview: false, items: items.shuffled())
        path = [.quiz]
    }

    func startMistakes() {
        let items = store.mistakeDeck.prefix(Rules.mistakeSession).compactMap { k -> QuizItem? in
            guard let e = store.questionIndex[k] else { return nil }
            var item = makeItem(e.question, topicIndex: e.ti)
            item.sectionIndex = e.si
            return item
        }
        guard !items.isEmpty else { return }
        session = QuizSession(kind: .mistakes, isReview: false, items: items)
        path = [.quiz]
    }

    /// "Section · Topic" (or "Section · Section exam") for an item in a mistakes review.
    func originTitle(_ item: QuizItem) -> String {
        guard let si = item.sectionIndex else { return "" }
        return sections[si].title + " · " + (item.topicIndex.map { sections[si].topics[$0].title } ?? "Section exam")
    }

    private func makeItem(_ q: Question, topicIndex: Int?) -> QuizItem {
        switch q.kind {
        case .mc: QuizItem(question: q, order: Array(q.options.indices).shuffled(), topicIndex: topicIndex)
        case .order: QuizItem(question: q, order: scrambled(q.steps.count), topicIndex: topicIndex)
        case .line: QuizItem(question: q, order: [], topicIndex: topicIndex)
        }
    }

    /// A shuffle of 0..<n that is never already in order.
    private func scrambled(_ n: Int) -> [Int] {
        let sorted = Array(0..<n)
        guard n > 1 else { return sorted }
        var order = sorted.shuffled()
        while order == sorted { order.shuffle() }
        return order
    }

    func finishQuiz() {
        guard let session, session.answers.count == session.items.count else { return }
        let correct = session.answers.filter(\.correct).count
        let total = session.items.count
        let result: QuizOutcome
        if session.kind != .mistakes {
            store.recordMisses(session.sectionIndex, zip(session.items, session.answers).filter { !$1.correct }.map { ($0.0.question, $0.0.topicIndex) })
        }
        switch session.kind {
        case .topic(let si, let ti):
            result = store.recordTopic(si, ti, correct: correct, total: total, isReview: session.isReview)
        case .exam(let si):
            result = store.recordExam(si, correct: correct, total: total)
        case .mistakes:
            result = store.recordMistakes(zip(session.items, session.answers).map { ($0.question, $1.correct) })
        }
        outcome = result
        path = Array(path.dropLast()) + [.result]
        if let level = result.levelUp { toast("arrow.up.circle.fill", "Level up: \(level)") }
        for badge in result.newBadges { toast(badge.symbol, "Badge earned: \(badge.name)") }
    }

    func leaveQuiz() {
        session = nil
        path = Array(path.dropLast())
    }

    func toast(_ symbol: String, _ text: String) {
        let t = Toast(symbol: symbol, text: text)
        withAnimation(.spring) { toasts.append(t) }
        Task {
            try? await Task.sleep(for: .seconds(4))
            withAnimation(.easeOut) { toasts.removeAll { $0.id == t.id } }
        }
    }
}
