import SwiftUI
import WebKit

/// A lesson figure: inline SVG with CSS animation, rendered by WebKit so the same
/// source works here and in the web app. See content/FIGURES.md.
struct FigureView: View {
    let svg: String
    let caption: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            SVGWebView(svg: svg)
                .aspectRatio(aspect, contentMode: .fit)
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Palette.card, in: .rect(cornerRadius: 18))
                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(.separator.opacity(0.5), lineWidth: 0.5))
                .accessibilityElement()
                .accessibilityLabel(label)
            Text(inline(caption)).font(.callout).foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }

    /// Width / height from the root viewBox.
    private var aspect: CGFloat {
        guard let range = svg.range(of: #"viewBox="0 0 (\d+(?:\.\d+)?) (\d+(?:\.\d+)?)""#, options: .regularExpression) else { return 16 / 9 }
        let nums = svg[range].split(whereSeparator: { !"0123456789.".contains($0) }).compactMap { Double($0) }
        guard nums.count >= 4, nums[3] > 0 else { return 16 / 9 }
        return nums[2] / nums[3]
    }

    private var label: String {
        guard let range = svg.range(of: #"aria-label="[^"]*""#, options: .regularExpression) else { return caption }
        return String(svg[range].dropFirst("aria-label=\"".count).dropLast())
    }
}

private struct SVGWebView: NSViewRepresentable {
    let svg: String

    func makeNSView(context: Context) -> PassThroughWebView {
        let view = PassThroughWebView(frame: .zero, configuration: WKWebViewConfiguration())
        view.setValue(false, forKey: "drawsBackground")
        view.loadHTMLString(Self.page(svg), baseURL: nil)
        return view
    }

    func updateNSView(_ view: PassThroughWebView, context: Context) {}

    private static func page(_ svg: String) -> String {
        """
        <!doctype html><html><head><meta charset="utf-8"><style>
        :root { --fig-ink:#1d1d1f; --fig-muted:#6e6e73; --fig-line:#d2d2d7; --fig-bg:#ffffff; --fig-panel:#f2f2f5;
                --fig-accent:#0071e3; --fig-accent2:#8e44c9; --fig-ok:#1f9d55; --fig-bad:#d93a2b; --fig-warn:#c77d00; color-scheme: light dark; }
        @media (prefers-color-scheme: dark) {
          :root { --fig-ink:#f2f2f5; --fig-muted:#a1a1a6; --fig-line:#3a3a3c; --fig-bg:#1c1c1e; --fig-panel:#2c2c2e;
                  --fig-accent:#4ea1ff; --fig-accent2:#c18cf0; --fig-ok:#4cd07d; --fig-bad:#ff6b5e; --fig-warn:#ffb340; }
        }
        @media (prefers-reduced-motion: reduce) { * { animation: none !important; } }
        html, body { margin:0; padding:0; background:transparent; overflow:hidden; }
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; -webkit-user-select:none; }
        svg { display:block; width:100%; height:auto; }
        </style></head><body>\(svg)</body></html>
        """
    }
}

/// Lets the lesson's ScrollView receive wheel events that land on a figure.
private final class PassThroughWebView: WKWebView {
    override func scrollWheel(with event: NSEvent) {
        nextResponder?.scrollWheel(with: event)
    }
}
