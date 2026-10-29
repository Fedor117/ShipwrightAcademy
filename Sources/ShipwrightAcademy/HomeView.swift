import SwiftUI

struct HomeView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let store = model.store
        ScrollView {
            VStack(spacing: 44) {
                hero
                today
                ActivityHeatmap()
                ForEach(Curriculum.tracks, id: \.name) { track in
                    VStack(alignment: .leading, spacing: 14) {
                        Text(track.name).font(.title2.bold())
                        GlassEffectContainer(spacing: 16) {
                            LazyVGrid(columns: [GridItem(.adaptive(minimum: 270), spacing: 16)], spacing: 16) {
                                ForEach(Array(track.sections.enumerated()), id: \.element) { n, si in
                                    SectionCard(si: si, number: n + 1, section: model.sections[si], unlocked: store.sectionUnlocked(si))
                                }
                            }
                        }
                    }
                }
            }
            .frame(maxWidth: 980)
            .padding(.horizontal, 40)
            .padding(.vertical, 56)
            .frame(maxWidth: .infinity)
        }
        .background(LiquidBackdrop())
        .navigationTitle("Today")
    }

    private var hero: some View {
        let store = model.store
        return VStack(spacing: 18) {
            Text("Shipwright Academy").font(.title2.weight(.semibold)).foregroundStyle(.tint)
            Text("Think. Build.\nShip. Maintain.")
                .font(.system(size: 68, weight: .bold))
                .tracking(-1.6)
                .multilineTextAlignment(.center)
            Text("\(Curriculum.topicCount) topics, from how computers work to directing AI agents and building games in Unity. Pass each quiz to move on. Pass each exam to unlock what's next.")
                .font(.title3)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .frame(maxWidth: 620)
            HStack(spacing: 14) {
                if let step = store.nextStep {
                    Button { model.go(to: step) } label: {
                        Text(label(for: step)).padding(.horizontal, 6)
                    }
                    .buttonStyle(.glassProminent)
                    .controlSize(.extraLarge)
                    .keyboardShortcut(model.searchFocused ? nil : .defaultAction)
                }
                let deck = store.mistakeDeck.count
                if deck > 0 {
                    Button("Review \(min(deck, Rules.mistakeSession)) \(deck == 1 ? "mistake" : "mistakes")") { model.startMistakes() }
                        .buttonStyle(.glass)
                        .controlSize(.extraLarge)
                }
                Button("View badges") { model.select(.badges) }
                    .buttonStyle(.glass)
                    .controlSize(.extraLarge)
            }
            .padding(.top, 6)
        }
    }

    private func label(for step: ProgressStore.Step) -> String {
        switch step {
        case .topic(let si, let ti): "Continue: \(model.sections[si].topics[ti].title)"
        case .review(let si, let ti): "Review: \(model.sections[si].topics[ti].title)"
        case .exam(let si): "Take the \(model.sections[si].title) exam"
        }
    }

    private var today: some View {
        let store = model.store
        let si = store.currentSection
        let section = model.sections[si]
        let level = store.level()
        let passed = store.passedCount(si)
        return HStack(spacing: 44) {
            ActivityRings(values: [
                (store.levelFraction, Palette.xp),
                (Double(passed) / Double(max(section.topics.count, 1)), Palette.topics),
                (Double(min(store.streak, 7)) / 7, Palette.streak),
            ])
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("TODAY").font(.caption.weight(.semibold)).tracking(0.8).foregroundStyle(.secondary)
                    Text(level.next.map { "You're \($0 - store.state.xp) XP from the next level." } ?? "Top level reached.")
                        .font(.system(size: 30, weight: .bold))
                        .tracking(-0.5)
                }
                Grid(alignment: .leading, horizontalSpacing: 28, verticalSpacing: 4) {
                    GridRow {
                        Text("Level XP").foregroundStyle(.secondary)
                        Text(section.title).foregroundStyle(.secondary).lineLimit(1)
                        Text("Streak").foregroundStyle(.secondary)
                    }
                    GridRow {
                        stat("\(store.state.xp)", level.next.map { "/\($0)" } ?? "", Palette.xp)
                        stat("\(passed)", "/\(section.topics.count) topics", Palette.topics)
                        stat("\(store.streak)", "/7 days", Palette.streak)
                    }
                }
                .font(.body)
            }
            Spacer(minLength: 0)
        }
        .padding(36)
        .glassEffect(.regular, in: .rect(cornerRadius: 30))
    }

    private func stat(_ value: String, _ unit: String, _ color: Color) -> some View {
        Text("\(Text(value).font(.system(size: 28, weight: .semibold)).foregroundStyle(color))\(Text(unit).font(.body).foregroundStyle(.secondary))")
            .monospacedDigit()
    }
}

/// Last Rules.heatWeeks weeks of study: one column per week (oldest left), rows Monday to Sunday, shaded by that day's XP.
struct ActivityHeatmap: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let store = model.store
        let cal = Calendar.current
        let today = cal.startOfDay(for: Date())
        let start = cal.date(byAdding: .day, value: -7 * (Rules.heatWeeks - 1), to: store.weekStart)!
        let weeks: [[Date?]] = (0..<Rules.heatWeeks).map { w in
            (0..<7).map { d in
                let day = cal.date(byAdding: .day, value: w * 7 + d, to: start)!
                return day > today ? nil : day
            }
        }
        let activeDays = weeks.joined().compactMap { $0 }.filter { store.heatBucket($0) > 0 }.count
        return VStack(alignment: .leading, spacing: 16) {
            HStack(alignment: .firstTextBaseline) {
                Text("ACTIVITY").font(.caption.weight(.semibold)).tracking(0.8).foregroundStyle(.secondary)
                Spacer()
                Text("This week: \(store.weekXP) XP").monospacedDigit()
                Text("Best day: \(store.bestDayXP) XP").monospacedDigit().foregroundStyle(.secondary).padding(.leading, 16)
            }
            .font(.callout)
            HStack(alignment: .top, spacing: 4) {
                VStack(alignment: .trailing, spacing: 4) {
                    ForEach(Array(["Mon", "", "Wed", "", "Fri", "", "Sun"].enumerated()), id: \.offset) { _, label in
                        Text(label).font(.caption2).foregroundStyle(.secondary).frame(height: 16)
                    }
                }
                .padding(.trailing, 4)
                ForEach(weeks.indices, id: \.self) { w in
                    VStack(spacing: 4) {
                        ForEach(0..<7, id: \.self) { d in
                            if let day = weeks[w][d] {
                                cell(store.heatBucket(day))
                                    .help("\(ProgressStore.dayKey(day)): \(store.dayXP(day).xp ?? 0) XP")
                            } else {
                                Color.clear.frame(width: 16, height: 16)
                            }
                        }
                    }
                }
                Spacer(minLength: 0)
            }
            .accessibilityElement(children: .ignore)
            .accessibilityLabel("Activity over the last \(Rules.heatWeeks) weeks: \(activeDays) active days. This week \(store.weekXP) XP. Best day \(store.bestDayXP) XP.")
        }
        .padding(28)
        .glassEffect(.regular, in: .rect(cornerRadius: 30))
    }

    private func cell(_ bucket: Int) -> some View {
        let opacity: [Double] = [0, 0.3, 0.5, 0.75, 1]
        return RoundedRectangle(cornerRadius: 4)
            .fill(bucket == 0 ? Color.secondary.opacity(0.15) : Color.accentColor.opacity(opacity[bucket]))
            .frame(width: 16, height: 16)
    }
}

struct SectionCard: View {
    @Environment(AppModel.self) private var model
    let si: Int
    let number: Int
    let section: CourseSection
    let unlocked: Bool

    var body: some View {
        let store = model.store
        let done = store.passedCount(si)
        Button { model.select(.section(si)) } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack {
                    Image(systemName: section.symbol).font(.title2).foregroundStyle(unlocked ? Color.accentColor : .secondary)
                    Spacer()
                    if store.exam(si).passed {
                        Chip(text: "Exam \(store.exam(si).best)%", color: .green, symbol: "checkmark")
                    } else if !unlocked {
                        Image(systemName: "lock.fill").foregroundStyle(.tertiary)
                    }
                }
                Text("Section \(number)").font(.caption.weight(.semibold)).foregroundStyle(.secondary)
                Text(section.title).font(.title3.bold()).foregroundStyle(unlocked ? .primary : .secondary)
                Text(section.tagline).font(.callout).foregroundStyle(.secondary).lineLimit(3, reservesSpace: true)
                ProgressView(value: Double(done), total: Double(section.topics.count))
                    .tint(.green)
                Text("\(done) of \(section.topics.count) topics").font(.caption).foregroundStyle(.secondary).monospacedDigit()
            }
            .padding(20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .contentShape(.rect(cornerRadius: 22))
        }
        .buttonStyle(.plain)
        .glassEffect(.regular.interactive(), in: .rect(cornerRadius: 22))
    }
}
