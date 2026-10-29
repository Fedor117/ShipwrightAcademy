import SwiftUI

struct LessonView: View {
    @Environment(AppModel.self) private var model
    let si: Int
    let ti: Int

    var body: some View {
        let store = model.store
        let section = model.sections[si]
        let topic = section.topics[ti]
        let t = store.topic(si, ti)
        let need = Int((Rules.topicPass * Double(topic.quiz.count)).rounded(.up))
        ScrollView {
            VStack(alignment: .leading, spacing: 20) {
                Eyebrow(text: "\(section.title) · Topic \(ti + 1) of \(section.topics.count)", color: .orange)
                Text(topic.title).font(.system(size: 46, weight: .bold)).tracking(-1.1)
                Text(topic.summary).font(.title2).foregroundStyle(.secondary)
                HStack(spacing: 8) {
                    Chip(text: "\(topic.minutes) min read", symbol: "clock")
                    Chip(text: "\(topic.quiz.count)-question quiz", symbol: "checklist")
                    if t.passed { Chip(text: "Passed \(t.best)/\(t.total)", color: .green, symbol: "checkmark") }
                    if store.reviewDue(si, ti) { Chip(text: "Review due · +20 XP", color: .accentColor, symbol: "arrow.trianglehead.2.clockwise") }
                }
                Divider().padding(.vertical, 10)

                ForEach(Array(topic.lesson.enumerated()), id: \.offset) { _, block in
                    BlockView(block: block)
                }

                VStack(alignment: .leading, spacing: 14) {
                    Text("Key points").font(.title2.bold())
                    ForEach(topic.keyPoints, id: \.self) { point in
                        Label { Text(inline(point)) } icon: {
                            Image(systemName: "checkmark.circle.fill").foregroundStyle(.white, .green)
                        }
                        .font(.body)
                    }
                }
                .padding(28)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.secondary.opacity(0.08), in: .rect(cornerRadius: 22))
                .padding(.top, 12)

                VStack(spacing: 12) {
                    Text(t.passed ? "Want a higher score?" : "Ready to check your understanding?").font(.title.bold())
                    Text("\(topic.quiz.count) questions. Get \(need) right to \(ti + 1 < section.topics.count ? "unlock \(section.topics[ti + 1].title)" : "unlock the section exam").")
                        .foregroundStyle(.secondary)
                        .multilineTextAlignment(.center)
                    Button(t.attempts > 0 ? "Retake quiz" : "Start quiz") { model.startQuiz(si, ti) }
                        .buttonStyle(.glassProminent)
                        .controlSize(.extraLarge)
                        .padding(.top, 4)
                }
                .padding(32)
                .frame(maxWidth: .infinity)
                .glassEffect(.regular, in: .rect(cornerRadius: 26))
                .padding(.top, 8)
            }
            .textSelection(.enabled)
            .frame(maxWidth: 700, alignment: .leading)
            .padding(.horizontal, 40)
            .padding(.vertical, 56)
            .frame(maxWidth: .infinity)
        }
        .background(Color(nsColor: .textBackgroundColor))
        .navigationTitle(topic.title)
        .toolbar {
            ToolbarItem(placement: .navigation) {
                Button("Start quiz", systemImage: "checklist") { model.startQuiz(si, ti) }
                    .help("Take the topic quiz")
            }
        }
    }
}

struct BlockView: View {
    let block: LessonBlock

    var body: some View {
        switch block.type {
        case "figure":
            FigureView(svg: block.svg ?? "", caption: block.caption ?? "")
        case "patterns":
            PatternsView(patterns: block.patterns ?? [])
        case "h":
            Text(inline(block.text ?? "")).font(.title.bold()).tracking(-0.4).padding(.top, 14)
        case "list":
            VStack(alignment: .leading, spacing: 10) {
                ForEach(block.items ?? [], id: \.self) { item in
                    HStack(alignment: .firstTextBaseline, spacing: 12) {
                        Circle().fill(.secondary).frame(width: 5, height: 5).alignmentGuide(.firstTextBaseline) { $0[.bottom] + 4 }
                        Text(inline(item)).font(.system(size: 17)).lineSpacing(4)
                    }
                }
            }
        case "code":
            ScrollView(.horizontal, showsIndicators: false) {
                Text(block.text ?? "")
                    .font(.system(size: 13.5, design: .monospaced))
                    .lineSpacing(3)
                    .foregroundStyle(Color(white: 0.95))
                    .padding(20)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(Color(red: 0.11, green: 0.11, blue: 0.12), in: .rect(cornerRadius: 18))
            .overlay(alignment: .topTrailing) {
                if let lang = block.lang, !lang.isEmpty {
                    Text(lang.uppercased()).font(.caption2.weight(.semibold)).foregroundStyle(Color(white: 0.6)).padding(10)
                }
            }
        case "callout":
            let style = calloutStyle
            HStack(alignment: .top, spacing: 14) {
                Image(systemName: style.symbol).font(.title3).foregroundStyle(style.color).frame(width: 24)
                VStack(alignment: .leading, spacing: 4) {
                    Text(style.label).font(.subheadline.weight(.semibold)).foregroundStyle(style.color)
                    Text(inline(block.text ?? "")).font(.system(size: 16)).lineSpacing(3)
                }
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(style.color.opacity(0.1), in: .rect(cornerRadius: 18))
        default:
            Text(inline(block.text ?? "")).font(.system(size: 17)).lineSpacing(5)
        }
    }

    private var calloutStyle: (label: String, symbol: String, color: Color) {
        switch block.kind {
        case "warn": ("Pitfall", "exclamationmark.triangle", .orange)
        case "agent": ("With agents", "sparkles", .blue)
        default: ("Tip", "lightbulb", .green)
        }
    }
}

/// "When you notice the signal, reach for the move" cheat sheet at the end of a lesson:
/// one card per pattern, labels in a narrow gutter so the text keeps a comfortable line length.
struct PatternsView: View {
    let patterns: [PatternItem]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Patterns").font(.title.bold()).tracking(-0.4)
            Text("When you notice the signal, reach for the move.")
                .font(.system(size: 16)).foregroundStyle(.secondary)
                .padding(.bottom, 4)
            ForEach(patterns, id: \.self) { p in
                VStack(alignment: .leading, spacing: 8) {
                    HStack(alignment: .firstTextBaseline, spacing: 14) {
                        label("When")
                        Text(inline(p.signal)).font(.system(size: 16)).lineSpacing(3)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    HStack(alignment: .firstTextBaseline, spacing: 14) {
                        label("Use")
                        VStack(alignment: .leading, spacing: 4) {
                            Text(inline(p.use)).font(.system(size: 16, weight: .semibold))
                            Text(inline(p.why)).font(.system(size: 15)).lineSpacing(3).foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }
                }
                .fixedSize(horizontal: false, vertical: true)
                .padding(.horizontal, 18)
                .padding(.vertical, 14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(.secondary.opacity(0.08), in: .rect(cornerRadius: 14))
            }
        }
        .padding(.top, 14)
    }

    private func label(_ text: String) -> some View {
        Text(text.uppercased())
            .font(.system(size: 11, weight: .semibold, design: .monospaced))
            .tracking(0.9)
            .foregroundStyle(.tertiary)
            .frame(width: 62, alignment: .leading)
    }
}
