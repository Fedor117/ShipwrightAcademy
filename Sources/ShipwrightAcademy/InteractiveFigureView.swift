import SwiftUI
import WebKit

/// A lesson block that runs a small self-contained HTML widget (sliders, step buttons) in a
/// locked-down web view. Same contract as the web app's sandboxed iframe; see content/INTERACTIVE.md.
struct InteractiveFigureView: View {
    let html: String
    let caption: String
    let height: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            InteractiveWebView(html: html)
                .frame(height: CGFloat(min(520, max(200, height))))
                .frame(maxWidth: .infinity)
                .padding(12)
                .background(Palette.card, in: .rect(cornerRadius: 18))
                .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(.separator.opacity(0.5), lineWidth: 0.5))
                .accessibilityLabel(caption)
            Text(inline(caption)).font(.callout).foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}

enum Interactive {
    static let csp = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:"
    static let base = "html,body{margin:0;height:100%;overflow:hidden;background:transparent;color:var(--fig-ink)}" +
        "body{font-size:14px;line-height:1.4;-webkit-user-select:none;user-select:none}" +
        "button{font:inherit;color:var(--fig-ink);background:var(--fig-panel);border:1px solid var(--fig-line);border-radius:8px;padding:4px 12px;cursor:pointer}" +
        "input{accent-color:var(--fig-accent)}:focus-visible{outline:2px solid var(--fig-accent);outline-offset:2px}" +
        "@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}"

    static func page(_ html: String) -> String {
        """
        <!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="\(csp)"><style>
        \(figureTheme)
        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; }
        </style><style>\(base)</style></head><body>\(html)</body></html>
        """
    }
}

private struct InteractiveWebView: NSViewRepresentable {
    let html: String

    func makeCoordinator() -> Coordinator { Coordinator() }

    func makeNSView(context: Context) -> PassThroughWebView {
        let config = WKWebViewConfiguration()
        config.websiteDataStore = .nonPersistent()
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.preferences.javaScriptCanOpenWindowsAutomatically = false
        let view = PassThroughWebView(frame: .zero, configuration: config)
        view.setValue(false, forKey: "drawsBackground")
        view.navigationDelegate = context.coordinator
        view.loadHTMLString(Interactive.page(html), baseURL: nil)
        return view
    }

    func updateNSView(_ view: PassThroughWebView, context: Context) {}

    /// Allows the initial load only; every later navigation (links, form posts, frames) is cancelled.
    final class Coordinator: NSObject, WKNavigationDelegate {
        private var loaded = false

        func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction, decisionHandler: @escaping @MainActor (WKNavigationActionPolicy) -> Void) {
            let initial = !loaded && action.targetFrame?.isMainFrame == true
            loaded = true
            decisionHandler(initial ? .allow : .cancel)
        }

        func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) { loaded = true }
    }
}
