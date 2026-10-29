import SwiftUI
import AppKit
import UniformTypeIdentifiers

extension Topic {
    /// The topic's patterns block (signal -> move), empty if it has none.
    var patterns: [PatternItem] { lesson.first { $0.type == "patterns" }?.patterns ?? [] }
}

enum CheatSheet {
    /// Same template as cheatMarkdown in app.js (README, "Cheat sheets"); check-rules.js compares their string literals.
    static func markdown(_ s: CourseSection) -> String {
        var out = ["# " + s.title + " cheat sheet", "", s.tagline]
        for (ti, t) in s.topics.enumerated() {
            out += ["", "## " + String(ti + 1) + ". " + t.title, "", t.summary, "", "**Key points**", ""]
            out += t.keyPoints.map { "- " + $0 }
            let ps = t.patterns
            if !ps.isEmpty { out += ["", "**Patterns**", ""]; out += ps.map { "- " + $0.signal + " → **" + $0.use + "**. " + $0.why } }
        }
        return out.joined(separator: "\n") + "\n"
    }

    /// US Letter pages, black on white. A topic's heading and key points stay with its first pattern,
    /// and pages break only between patterns, never inside one.
    @MainActor static func pdf(_ s: CourseSection, studied: (Int) -> Bool) -> Data {
        let page = CGSize(width: 612, height: 792), margin: CGFloat = 48
        let width = page.width - margin * 2
        var pieces: [(view: AnyView, before: CGFloat)] = [(AnyView(CheatHeader(section: s, print: true)), 0)]
        for (ti, t) in s.topics.enumerated() {
            let ps = t.patterns
            pieces.append((AnyView(VStack(alignment: .leading, spacing: 8) {
                CheatTopicHead(number: ti + 1, topic: t, studied: studied(ti), print: true)
                if let first = ps.first {
                    CheatLabel(text: "Patterns").padding(.top, 4)
                    CheatPatternRow(pattern: first, print: true)
                }
            }), 26))
            pieces += ps.dropFirst().map { (AnyView(CheatPatternRow(pattern: $0, print: true)), 8) }
        }
        let data = NSMutableData()
        var box = CGRect(origin: .zero, size: page)
        guard let consumer = CGDataConsumer(data: data as CFMutableData),
              let ctx = CGContext(consumer: consumer, mediaBox: &box, nil) else { return Data() }
        var y = margin, open = false
        for piece in pieces {
            let renderer = ImageRenderer(content: piece.view
                .frame(width: width, alignment: .leading)
                .font(.callout)
                .foregroundStyle(.black)
                .environment(\.colorScheme, .light))
            renderer.proposedSize = ProposedViewSize(width: width, height: nil)
            renderer.render { size, draw in
                if open && y + piece.before + size.height <= page.height - margin {
                    y += piece.before
                } else {
                    if open { ctx.endPDFPage() }
                    ctx.beginPDFPage(nil)
                    open = true
                    y = margin
                }
                ctx.saveGState()
                ctx.translateBy(x: margin, y: page.height - y - size.height)
                draw(ctx)
                ctx.restoreGState()
                y += size.height
            }
        }
        if open { ctx.endPDFPage() }
        ctx.closePDF()
        return data as Data
    }
}

struct CheatSheetView: View {
    @Environment(AppModel.self) private var model
    let si: Int

    /// Every topic is shown; ones not passed yet are dimmed unless free roam is on.
    private func studied(_ ti: Int) -> Bool { model.store.freeRoam || model.store.topic(si, ti).passed }

    var body: some View {
        let section = model.sections[si]
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                CheatHeader(section: section).padding(.bottom, 8)
                ForEach(Array(section.topics.enumerated()), id: \.offset) { ti, topic in
                    CheatTopic(number: ti + 1, topic: topic, studied: studied(ti))
                        .padding(22)
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Palette.card, in: .rect(cornerRadius: 18))
                        .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(.separator.opacity(0.5), lineWidth: 0.5))
                        .opacity(studied(ti) ? 1 : 0.5)
                }
            }
            .textSelection(.enabled)
            .frame(maxWidth: 860, alignment: .leading)
            .padding(.horizontal, 40)
            .padding(.vertical, 48)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle("\(section.title) Cheat Sheet")
        .toolbar {
            ToolbarItemGroup(placement: .navigation) {
                Button("Copy as Markdown", systemImage: "doc.on.doc") {
                    NSPasteboard.general.clearContents()
                    NSPasteboard.general.setString(CheatSheet.markdown(section), forType: .string)
                    model.toast("doc.on.doc", "Copied as Markdown")
                }
                .help("Copy the cheat sheet as Markdown")
                Button("Export PDF…", systemImage: "arrow.down.doc") { exportPDF(section) }
                    .help("Save the cheat sheet as a PDF")
            }
        }
    }

    private func exportPDF(_ section: CourseSection) {
        let data = CheatSheet.pdf(section, studied: studied)
        let panel = NSSavePanel()
        panel.allowedContentTypes = [.pdf]
        panel.nameFieldStringValue = "\(section.title) cheat sheet.pdf"
        panel.begin { response in
            guard response == .OK, let url = panel.url else { return }
            do { try data.write(to: url) } catch {
                Task { @MainActor in model.toast("exclamationmark.triangle", "Could not save the PDF") }
            }
        }
    }
}

struct CheatHeader: View {
    let section: CourseSection
    var print = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Eyebrow(text: "\(section.trackName) · Cheat sheet")
            Text(section.title).font(.system(size: print ? 28 : 40, weight: .bold)).tracking(-0.8)
            Text(inline(section.tagline)).font(print ? .body : .title3).foregroundStyle(.secondary)
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

struct CheatTopic: View {
    let number: Int
    let topic: Topic
    let studied: Bool

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            CheatTopicHead(number: number, topic: topic, studied: studied)
            if !topic.patterns.isEmpty {
                CheatLabel(text: "Patterns").padding(.top, 4)
                ForEach(topic.patterns, id: \.self) { CheatPatternRow(pattern: $0) }
            }
        }
    }
}

/// Title, summary and key points; the PDF keeps this together with the topic's first pattern.
struct CheatTopicHead: View {
    let number: Int
    let topic: Topic
    let studied: Bool
    var print = false

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("\(number).").foregroundStyle(.secondary).monospacedDigit()
                Text(topic.title)
                Spacer(minLength: 8)
                if !studied {
                    if print { Text("Not yet studied").font(.caption).foregroundStyle(.secondary) }
                    else { Chip(text: "Not yet studied", symbol: "book.closed") }
                }
            }
            .font(print ? .headline : .title3.bold())
            Text(inline(topic.summary)).foregroundStyle(.secondary)
            CheatLabel(text: "Key points").padding(.top, 4)
            ForEach(topic.keyPoints, id: \.self) { point in
                HStack(alignment: .firstTextBaseline, spacing: 8) {
                    Text("•").foregroundStyle(.secondary)
                    Text(inline(point))
                }
            }
        }
        .fixedSize(horizontal: false, vertical: true)
    }
}

struct CheatPatternRow: View {
    let pattern: PatternItem
    var print = false

    var body: some View {
        Grid(alignment: .leadingFirstTextBaseline, horizontalSpacing: 10, verticalSpacing: 2) {
            GridRow {
                CheatLabel(text: "When").frame(width: 40, alignment: .leading)
                Text(inline(pattern.signal))
            }
            GridRow {
                CheatLabel(text: "Use")
                VStack(alignment: .leading, spacing: 2) {
                    Text(inline(pattern.use)).fontWeight(.semibold)
                    Text(inline(pattern.why)).foregroundStyle(.secondary).font(print ? .caption : .callout)
                }
            }
        }
        .fixedSize(horizontal: false, vertical: true)
        .padding(.bottom, 4)
    }
}

struct CheatLabel: View {
    let text: String

    var body: some View {
        Text(text.uppercased())
            .font(.system(size: 10, weight: .semibold, design: .monospaced))
            .tracking(0.8)
            .foregroundStyle(.tertiary)
    }
}
