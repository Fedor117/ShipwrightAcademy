import SwiftUI

/// Search rules, mirrored in app.js (scripts/check-rules.js compares them).
/// Every query term must prefix a word of one entry; entries group by topic, best kind weight first.
enum SearchRules {
    static let minQuery = 2
    static let snippet = 160
    static let lead = 40
    static let perTopic = 3
    static let kinds: [String: (label: String, weight: Int)] = [
        "section": ("Section", 3), "title": ("Title", 3), "summary": ("Summary", 1),
        "h": ("Heading", 2), "keyPoint": ("Key point", 2), "pattern": ("Pattern", 2),
        "p": ("Paragraph", 1), "list": ("List", 1), "tip": ("Tip", 1), "warn": ("Pitfall", 1), "agent": ("With agents", 1), "figure": ("Figure", 1),
    ]
}

struct SearchEntry: Hashable {
    let si: Int
    /// nil for a section title.
    let ti: Int?
    let kind: String
    /// Scroll target in the lesson: "blk-<n>" or "kp-<n>"; nil means the top.
    let anchor: String?
    let text: String
    let words: [String]
    let order: Int

    var label: String { SearchRules.kinds[kind]?.label ?? kind }
    var weight: Int { SearchRules.kinds[kind]?.weight ?? 1 }
}

struct SearchGroup: Identifiable {
    let si: Int
    let ti: Int?
    var hits: [SearchEntry]
    var score: Int
    let order: Int
    var id: Int { order }
}

enum Search {
    static func fold(_ s: String) -> String { s.folding(options: [.caseInsensitive, .diacriticInsensitive], locale: nil) }
    static func words(_ s: String) -> [String] { fold(s).split { !($0.isLetter || $0.isNumber) }.map(String.init) }

    /// Built once: the curriculum is static.
    static let index: [SearchEntry] = {
        var out: [SearchEntry] = []
        func add(_ si: Int, _ ti: Int?, _ kind: String, _ text: String, _ anchor: String?) {
            let t = text.replacingOccurrences(of: "**", with: "").replacingOccurrences(of: "`", with: "")
            out.append(SearchEntry(si: si, ti: ti, kind: kind, anchor: anchor, text: t, words: words(t), order: out.count))
        }
        for (si, s) in Curriculum.sections.enumerated() {
            add(si, nil, "section", s.title, nil)
            for (ti, t) in s.topics.enumerated() {
                add(si, ti, "title", t.title, nil)
                add(si, ti, "summary", t.summary, nil)
                for (bi, b) in t.lesson.enumerated() {
                    let a = "blk-\(bi)"
                    switch b.type {
                    case "h", "p": add(si, ti, b.type, b.text ?? "", a)
                    case "list": for i in b.items ?? [] { add(si, ti, "list", i, a) }
                    case "callout": add(si, ti, SearchRules.kinds[b.kind ?? ""] != nil ? b.kind! : "tip", b.text ?? "", a)
                    case "figure", "interactive": add(si, ti, "figure", b.caption ?? "", a)
                    case "patterns": for p in b.patterns ?? [] { add(si, ti, "pattern", [p.signal, p.use, p.why].joined(separator: " · "), a) }
                    default: break
                    }
                }
                for (ki, k) in t.keyPoints.enumerated() { add(si, ti, "keyPoint", k, "kp-\(ki)") }
            }
        }
        return out
    }()

    /// Unique query terms, or nil while the query is too short to search.
    static func terms(_ query: String) -> [String]? {
        var seen = Set<String>()
        let terms = words(query).filter { seen.insert($0).inserted }
        return terms.joined().count >= SearchRules.minQuery ? terms : nil
    }

    static func run(_ terms: [String]) -> [SearchGroup] {
        var groups: [SearchGroup] = []
        var slot: [String: Int] = [:]
        for e in index where terms.allSatisfy({ t in e.words.contains { $0.hasPrefix(t) } }) {
            let k = "\(e.si)/\(e.ti ?? -1)"
            if slot[k] == nil {
                slot[k] = groups.count
                groups.append(SearchGroup(si: e.si, ti: e.ti, hits: [], score: 0, order: e.order))
            }
            groups[slot[k]!].hits.append(e)
            groups[slot[k]!].score = max(groups[slot[k]!].score, e.weight)
        }
        for i in groups.indices {
            groups[i].hits.sort { ($0.weight, -$0.order) > ($1.weight, -$1.order) }
        }
        return groups.sorted { ($0.score, $0.hits.count, -$0.order) > ($1.score, $1.hits.count, -$1.order) }
    }

    /// A window of `text` around the first match, with matching words highlighted.
    static func snippet(_ text: String, terms: [String]) -> AttributedString {
        let chars = Array(text)
        let hit = { (w: ArraySlice<Character>) in let f = fold(String(w)); return terms.contains { f.hasPrefix($0) } }
        var s = 0, e = chars.count
        if e > SearchRules.snippet {
            let pos = wordRanges(chars[...]).first { hit(chars[$0]) }?.lowerBound ?? 0
            s = max(0, pos - SearchRules.lead)
            if s > 0, let sp = chars[s...].firstIndex(of: " "), sp < pos { s = sp + 1 }
            e = min(chars.count, s + SearchRules.snippet)
            if e < chars.count, let sp = chars[...e].lastIndex(of: " "), sp > pos { e = sp }
        }
        let part = chars[s..<e]
        var out = AttributedString(s > 0 ? "…" : "")
        var last = part.startIndex
        for r in wordRanges(part) where hit(part[r]) {
            out += AttributedString(String(part[last..<r.lowerBound]))
            var mark = AttributedString(String(part[r]))
            mark.backgroundColor = Palette.xp.opacity(0.25)
            mark.foregroundColor = .primary
            out += mark
            last = r.upperBound
        }
        out += AttributedString(String(part[last...]) + (e < chars.count ? "…" : ""))
        return out
    }

    private static func wordRanges(_ chars: ArraySlice<Character>) -> [Range<Int>] {
        var ranges: [Range<Int>] = []
        var i = chars.startIndex
        while i < chars.endIndex {
            guard chars[i].isLetter || chars[i].isNumber else { i += 1; continue }
            let start = i
            while i < chars.endIndex, chars[i].isLetter || chars[i].isNumber { i += 1 }
            ranges.append(start..<i)
        }
        return ranges
    }
}
