import SwiftUI
import Observation

enum SidebarItem: Hashable {
    case home
    case section(Int)
    case badges
}

enum Route: Hashable {
    case lesson(Int, Int)
    case quiz
    case result
    case search
}

struct QuizItem: Identifiable {
    let id = UUID()
    let question: Question
    /// Display order of the original option indexes.
    let order: [Int]
    /// The topic this question came from, for exam answer review.
    let topicIndex: Int?
}

struct QuizAnswer {
    let chosen: Int
    let correct: Bool
}

@Observable
@MainActor
final class QuizSession {
    enum Kind: Equatable {
        case topic(Int, Int)
        case exam(Int)
    }

    let kind: Kind
    let isReview: Bool
    let items: [QuizItem]
    var index = 0
    var picked: Int?
    var answers: [QuizAnswer] = []

    var checked: Bool { answers.count > index }
    var current: QuizItem { items[index] }
    var isLast: Bool { index == items.count - 1 }
    var sectionIndex: Int {
        switch kind {
        case .topic(let si, _), .exam(let si): si
        }
    }

    init(kind: Kind, isReview: Bool, items: [QuizItem]) {
        self.kind = kind
        self.isReview = isReview
        self.items = items
    }

    func check() {
        guard let picked, !checked else { return }
        answers.append(QuizAnswer(chosen: picked, correct: picked == current.question.answer))
    }

    func advance() {
        guard checked, !isLast else { return }
        index += 1
        picked = nil
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

    private func makeItem(_ q: Question, topicIndex: Int?) -> QuizItem {
        QuizItem(question: q, order: Array(q.options.indices).shuffled(), topicIndex: topicIndex)
    }

    func finishQuiz() {
        guard let session, session.answers.count == session.items.count else { return }
        let correct = session.answers.filter(\.correct).count
        let total = session.items.count
        let result: QuizOutcome
        switch session.kind {
        case .topic(let si, let ti):
            result = store.recordTopic(si, ti, correct: correct, total: total, isReview: session.isReview)
        case .exam(let si):
            result = store.recordExam(si, correct: correct, total: total)
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
