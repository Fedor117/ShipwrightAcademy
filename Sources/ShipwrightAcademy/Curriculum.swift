import Foundation

/// A quiz or exam question. `kind` defaults to multiple choice; see README "Questions".
struct Question: Codable, Hashable {
    enum Kind: String, Codable { case mc, order, line }

    let kind: Kind
    let q: String
    /// mc: the choices.
    let options: [String]
    /// mc: index of the correct option. line: 0-based index of the buggy line.
    let answer: Int
    let explain: String
    /// mc (optional, "predict the output") and line: a snippet shown with the question.
    let code: String?
    let lang: String?
    /// order: the steps in the correct order.
    let steps: [String]

    var lines: [String] { (code ?? "").components(separatedBy: "\n") }

    init(from decoder: Decoder) throws {
        let c = try decoder.container(keyedBy: CodingKeys.self)
        kind = try c.decodeIfPresent(Kind.self, forKey: .kind) ?? .mc
        q = try c.decode(String.self, forKey: .q)
        options = try c.decodeIfPresent([String].self, forKey: .options) ?? []
        answer = try c.decodeIfPresent(Int.self, forKey: .answer) ?? 0
        explain = try c.decode(String.self, forKey: .explain)
        code = try c.decodeIfPresent(String.self, forKey: .code)
        lang = try c.decodeIfPresent(String.self, forKey: .lang)
        steps = try c.decodeIfPresent([String].self, forKey: .steps) ?? []
    }
}

struct LessonBlock: Codable, Hashable {
    let type: String
    let text: String?
    let items: [String]?
    let lang: String?
    let kind: String?
    // Figure blocks (content/FIGURES.md)
    let id: String?
    let caption: String?
    let svg: String?
    // Interactive blocks (content/INTERACTIVE.md): sandboxed HTML and its height in points
    let html: String?
    let height: Int?
    // Patterns blocks: signal you notice -> move to make
    let patterns: [PatternItem]?
}

struct PatternItem: Codable, Hashable {
    let signal: String
    let use: String
    let why: String
}

struct Topic: Codable, Hashable, Identifiable {
    let id: String
    let title: String
    let minutes: Int
    let summary: String
    let lesson: [LessonBlock]
    let keyPoints: [String]
    let quiz: [Question]
}

struct CourseSection: Codable, Hashable, Identifiable {
    let id: String
    let track: String?
    let title: String
    let tagline: String
    let intro: String
    let topics: [Topic]
    let exam: [Question]

    /// Sections unlock in order within a track; tracks run side by side.
    var trackName: String { track ?? "Software Engineering" }

    var symbol: String {
        switch id {
        case "graphics": "cube.transparent"
        case "engines": "gearshape.2"
        case "unity": "gamecontroller"
        case "cases": "puzzlepiece.extension"
        case "think": "brain.head.profile"
        case "foundations": "cpu"
        case "systems": "network"
        case "build": "hammer"
        case "ship": "shippingbox"
        case "maintain": "wrench.and.screwdriver"
        case "agents": "sparkles"
        default: "book"
        }
    }

    /// Questions in the section exam: the exam pool plus one drawn from each topic quiz.
    var examLength: Int { exam.count + topics.count }
}

enum Curriculum {
    static let sections: [CourseSection] = {
        guard let url = Bundle.module.url(forResource: "curriculum", withExtension: "json"),
              let data = try? Data(contentsOf: url),
              let sections = try? JSONDecoder().decode([CourseSection].self, from: data)
        else { return [] }
        return sections
    }()

    static var topicCount: Int { sections.reduce(0) { $0 + $1.topics.count } }

    /// Track names in first-appearance order, each with its section indexes.
    static let tracks: [(name: String, sections: [Int])] = {
        var result: [(name: String, sections: [Int])] = []
        for (i, s) in sections.enumerated() {
            if let t = result.firstIndex(where: { $0.name == s.trackName }) { result[t].sections.append(i) }
            else { result.append((s.trackName, [i])) }
        }
        return result
    }()

    static func previousInTrack(_ si: Int) -> Int? {
        sections[..<si].lastIndex { $0.trackName == sections[si].trackName }
    }

    static func nextInTrack(_ si: Int) -> Int? {
        sections[(si + 1)...].firstIndex { $0.trackName == sections[si].trackName }
    }
}
