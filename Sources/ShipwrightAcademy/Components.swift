import SwiftUI

/// Inline `code` and **bold** from the curriculum text.
func inline(_ text: String) -> AttributedString {
    (try? AttributedString(markdown: text, options: .init(interpretedSyntax: .inlineOnlyPreservingWhitespace)))
        ?? AttributedString(text)
}

enum Palette {
    static let xp = Color.orange
    static let topics = Color.green
    static let streak = Color.blue
    static let card = Color(nsColor: .controlBackgroundColor)
}

/// Soft, slowly shifting colour field behind content so the glass has something to refract.
struct Backdrop: View {
    @Environment(\.colorScheme) private var scheme

    var body: some View {
        let light: [Color] = [
            .init(red: 0.93, green: 0.95, blue: 1.00), .init(red: 0.97, green: 0.96, blue: 1.00), .init(red: 1.00, green: 0.95, blue: 0.92),
            .init(red: 0.90, green: 0.96, blue: 0.99), .init(red: 0.98, green: 0.98, blue: 0.99), .init(red: 0.95, green: 0.93, blue: 1.00),
            .init(red: 0.95, green: 0.99, blue: 0.95), .init(red: 0.96, green: 0.97, blue: 1.00), .init(red: 0.92, green: 0.95, blue: 1.00),
        ]
        let dark: [Color] = [
            .init(red: 0.06, green: 0.08, blue: 0.16), .init(red: 0.09, green: 0.07, blue: 0.15), .init(red: 0.14, green: 0.08, blue: 0.08),
            .init(red: 0.04, green: 0.10, blue: 0.14), .init(red: 0.07, green: 0.07, blue: 0.09), .init(red: 0.10, green: 0.06, blue: 0.16),
            .init(red: 0.05, green: 0.11, blue: 0.08), .init(red: 0.06, green: 0.07, blue: 0.11), .init(red: 0.05, green: 0.08, blue: 0.16),
        ]
        MeshGradient(
            width: 3, height: 3,
            points: [[0, 0], [0.5, 0], [1, 0], [0, 0.5], [0.55, 0.45], [1, 0.5], [0, 1], [0.5, 1], [1, 1]],
            colors: scheme == .dark ? dark : light
        )
        .ignoresSafeArea()
    }
}

/// Home screen only: soft colour pooled at the window edges that drifts like liquid and slowly
/// cycles through a curated palette, over a calm neutral centre. Runs entirely as Core Animation
/// layer animations, so the app does no per-frame work; holds still when Reduce Motion is on.
struct LiquidBackdrop: NSViewRepresentable {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    func makeNSView(context: Context) -> LiquidBackdropView { LiquidBackdropView() }

    func updateNSView(_ view: LiquidBackdropView, context: Context) {
        view.animated = !reduceMotion
    }
}

final class LiquidBackdropView: NSView {
    /// Blob centres in unit space; most sit on or just past an edge so the middle stays calm.
    private static let homes: [CGPoint] = [
        CGPoint(x: -0.04, y: 0.08), CGPoint(x: 0.38, y: -0.12), CGPoint(x: 0.8, y: -0.08),
        CGPoint(x: 1.1, y: 0.42), CGPoint(x: 0.94, y: 1.1), CGPoint(x: 0.5, y: 1.14),
        CGPoint(x: -0.1, y: 0.72),
    ]
    /// Curated cycle (blue, purple, red, amber, green, teal): hues that blend cleanly.
    private static let palette: [NSColor] = [
        NSColor(srgbRed: 0.26, green: 0.52, blue: 0.96, alpha: 1), NSColor(srgbRed: 0.63, green: 0.26, blue: 0.96, alpha: 1),
        NSColor(srgbRed: 0.92, green: 0.26, blue: 0.21, alpha: 1), NSColor(srgbRed: 0.98, green: 0.74, blue: 0.02, alpha: 1),
        NSColor(srgbRed: 0.20, green: 0.66, blue: 0.33, alpha: 1), NSColor(srgbRed: 0.14, green: 0.76, blue: 0.88, alpha: 1),
    ]

    private let field = CALayer()
    private var builtSize = CGSize.zero
    var animated = true { didSet { if animated != oldValue { rebuild() } } }

    override init(frame: NSRect) {
        super.init(frame: frame)
        wantsLayer = true
        layer?.addSublayer(field)
        rebuild()
    }

    required init?(coder: NSCoder) { fatalError("init(coder:) is not used") }

    override func layout() {
        super.layout()
        // Blob geometry is in points, so rebuild when the window size changes.
        if bounds.size != builtSize { rebuild() }
    }

    override func viewDidChangeEffectiveAppearance() {
        super.viewDidChangeEffectiveAppearance()
        rebuild()
    }

    private func rebuild() {
        let dark = effectiveAppearance.bestMatch(from: [.darkAqua, .aqua]) == .darkAqua
        layer?.backgroundColor = (dark ? NSColor(srgbRed: 0.07, green: 0.07, blue: 0.09, alpha: 1) : NSColor(white: 0.985, alpha: 1)).cgColor
        let strength: CGFloat = dark ? 0.5 : 0.42
        let size = bounds.size
        builtSize = size
        CATransaction.begin()
        CATransaction.setDisableActions(true)
        defer { CATransaction.commit() }
        field.frame = bounds
        field.sublayers?.forEach { $0.removeFromSuperlayer() }
        guard size.width > 0, size.height > 0 else { return }
        let diameter = 0.6 * max(size.width, size.height)
        let at = { (p: CGPoint) in CGPoint(x: p.x * size.width, y: p.y * size.height) }

        for (i, home) in Self.homes.enumerated() {
            let blob = CAGradientLayer()
            blob.type = .radial
            blob.startPoint = CGPoint(x: 0.5, y: 0.5)
            blob.endPoint = CGPoint(x: 1, y: 1)
            blob.locations = [0, 0.25, 0.5, 0.75, 1]
            blob.bounds = CGRect(x: 0, y: 0, width: diameter, height: diameter)
            blob.position = at(home)
            let start = (i * 5) % Self.palette.count  // neighbours start on different colours
            blob.colors = Self.stops(Self.palette[start], strength)
            field.addSublayer(blob)
            guard animated else { continue }
            let d = Double(i)

            // Drift: a slow closed loop around the home position.
            let drift = CAKeyframeAnimation(keyPath: "position")
            drift.values = (0...4).map { k -> NSValue in
                // A closed loop: start and end at home, three waypoints around it.
                guard k > 0 && k < 4 else { return NSValue(point: at(home)) }
                let a = Double(k) / 4 * 2 * .pi + d
                return NSValue(point: at(CGPoint(x: home.x + 0.09 * cos(a), y: home.y + 0.08 * sin(a * 1.3))))
            }
            drift.calculationMode = .cubic
            drift.duration = 38 + d * 6
            drift.repeatCount = .infinity
            blob.add(drift, forKey: "drift")

            // Colour: walk the whole palette, offset per blob, about two minutes per lap.
            let hue = CAKeyframeAnimation(keyPath: "colors")
            hue.values = (0...Self.palette.count).map { k in Self.stops(Self.palette[(start + k) % Self.palette.count], strength) }
            hue.duration = 120 + d * 9
            hue.repeatCount = .infinity
            blob.add(hue, forKey: "hue")

            // Swell: blobs grow and fade on their own rhythm so the mix keeps changing.
            let swell = CABasicAnimation(keyPath: "transform.scale")
            swell.fromValue = 0.8
            swell.toValue = 1.15
            swell.duration = 11 + d * 2.5
            swell.autoreverses = true
            swell.repeatCount = .infinity
            swell.timingFunction = CAMediaTimingFunction(name: .easeInEaseOut)
            blob.add(swell, forKey: "swell")
        }
    }

    private static func stops(_ c: NSColor, _ strength: CGFloat) -> [CGColor] {
        // Eased falloff so the blob has no visible rim.
        [1, 0.62, 0.3, 0.09, 0].map { c.withAlphaComponent(strength * $0).cgColor }
    }
}

struct Ring: View {
    let fraction: Double
    let color: Color
    var lineWidth: CGFloat = 14

    var body: some View {
        ZStack {
            Circle().stroke(color.opacity(0.2), lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: max(0.001, min(1, fraction)))
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
        .animation(.spring(duration: 0.8), value: fraction)
    }
}

/// Three concentric rings, outermost first.
struct ActivityRings: View {
    let values: [(Double, Color)]
    var size: CGFloat = 180
    var lineWidth: CGFloat = 18

    var body: some View {
        ZStack {
            ForEach(values.indices, id: \.self) { i in
                Ring(fraction: values[i].0, color: values[i].1, lineWidth: lineWidth)
                    .padding(CGFloat(i) * (lineWidth + 4) + lineWidth / 2)
            }
        }
        .frame(width: size, height: size)
        .accessibilityElement()
        .accessibilityLabel("Progress rings")
    }
}

/// Inset grouped list container, like iOS Settings.
struct GroupedList<Content: View>: View {
    @ViewBuilder var content: Content

    var body: some View {
        VStack(spacing: 0) { content }
            .background(Palette.card, in: .rect(cornerRadius: 18))
            .overlay(RoundedRectangle(cornerRadius: 18).strokeBorder(.separator.opacity(0.5), lineWidth: 0.5))
    }
}

struct Chip: View {
    let text: String
    var color: Color = .secondary
    var symbol: String?

    var body: some View {
        HStack(spacing: 4) {
            if let symbol { Image(systemName: symbol) }
            Text(text)
        }
        .font(.callout.weight(.medium))
        .foregroundStyle(color)
        .padding(.horizontal, 10)
        .padding(.vertical, 4)
        .background(color.opacity(0.12), in: .capsule)
    }
}

/// Numbered / checked / locked dot used on topic rows.
struct StepDot: View {
    enum State { case done, open, locked }
    let state: State
    let number: Int

    var body: some View {
        ZStack {
            Circle().fill(fill)
            switch state {
            case .done: Image(systemName: "checkmark").font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
            case .open: Text("\(number)").font(.system(size: 13, weight: .semibold)).foregroundStyle(.white)
            case .locked: Image(systemName: "lock.fill").font(.system(size: 11)).foregroundStyle(.secondary)
            }
        }
        .frame(width: 28, height: 28)
    }

    private var fill: Color {
        switch state {
        case .done: .green
        case .open: .accentColor
        case .locked: .secondary.opacity(0.15)
        }
    }
}

struct Eyebrow: View {
    let text: String
    var color: Color = .secondary
    var body: some View {
        Text(text).font(.subheadline.weight(.semibold)).foregroundStyle(color)
    }
}
