import SwiftUI

struct ResultView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        if let session = model.session, let outcome = model.outcome {
            content(session, outcome)
        } else {
            ContentUnavailableView("No result yet", systemImage: "chart.pie")
        }
    }

    private func content(_ s: QuizSession, _ o: QuizOutcome) -> some View {
        let section = model.sections[s.sectionIndex]
        let isExam: Bool = if case .exam = s.kind { true } else { false }
        let isMistakes = s.kind == .mistakes
        let passMark = isExam ? Rules.examPass : Rules.topicPass
        let what: String = switch s.kind {
        case .topic(_, let ti): section.topics[ti].title
        case .exam: "\(section.title) · Section exam"
        case .mistakes: "Mistakes review"
        }
        let missedTopics = Array(Set(s.items.indices.compactMap { i in s.answers[i].correct ? nil : s.items[i].topicIndex })).sorted()

        return ScrollView {
            VStack(spacing: 28) {
                if o.levelUp != nil { LevelUpCard() }
                VStack(spacing: 16) {
                    ZStack {
                        Ring(fraction: Double(o.correct) / Double(o.total), color: isMistakes ? .accentColor : o.passed ? .green : .orange, lineWidth: 22)
                        VStack(spacing: 2) {
                            Text("\(o.percent)%").font(.system(size: 44, weight: .bold)).monospacedDigit()
                            Text(isMistakes ? "\(o.correct) of \(o.total) right" : "pass \(Int(passMark * 100))%").font(.subheadline.weight(.medium)).foregroundStyle(.secondary)
                        }
                    }
                    .frame(width: 180, height: 180)
                    Eyebrow(text: what)
                    Text(isMistakes ? (o.cleared.isEmpty ? "Mistakes reviewed." : "Cleared \(o.cleared.count) \(o.cleared.count == 1 ? "mistake" : "mistakes").")
                         : o.passed ? (isExam ? "Section cleared." : "Topic passed.") : "Almost there.")
                        .font(.system(size: 46, weight: .bold)).tracking(-1)
                    Text(isMistakes
                         ? "You got \(o.correct) of \(o.total). A question leaves the deck after \(Rules.mistakeClearStreak) right answers in a row here. \(model.store.mistakeDeck.count) left in your deck."
                         : o.passed
                         ? "You got \(o.correct) of \(o.total).\(isExam ? Curriculum.nextInTrack(s.sectionIndex).map { " \(model.sections[$0].title) is now open." } ?? "" : "")"
                         : "You got \(o.correct) of \(o.total). The pass mark is \(Int(passMark * 100))%, so this needs a retake. Questions and answer order change each attempt.")
                        .font(.title3).foregroundStyle(.secondary).multilineTextAlignment(.center).frame(maxWidth: 520)
                    HStack(spacing: 8) {
                        if o.gains.isEmpty {
                            Chip(text: "No new XP this attempt")
                        } else {
                            ForEach(o.gains, id: \.0) { g in Chip(text: "+\(g.1) XP · \(g.0)", color: .orange) }
                        }
                    }
                    actions(s, o, isExam: isExam).padding(.top, 8)
                }
                .padding(.vertical, 44)
                .padding(.horizontal, 32)
                .frame(maxWidth: .infinity)
                .glassEffect(.regular, in: .rect(cornerRadius: 30))

                if !o.cleared.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Cleared from your deck").font(.title2.bold())
                        GroupedList {
                            ForEach(o.cleared.indices, id: \.self) { i in
                                Label { Text(inline(o.cleared[i].q)) } icon: { Image(systemName: "checkmark.circle.fill").foregroundStyle(.green) }
                                    .frame(maxWidth: .infinity, alignment: .leading)
                                    .padding(.horizontal, 20).padding(.vertical, 14)
                                if i < o.cleared.count - 1 { Divider().padding(.leading, 20) }
                            }
                        }
                    }
                }

                if isExam && !o.passed && !missedTopics.isEmpty {
                    VStack(alignment: .leading, spacing: 10) {
                        Text("Revisit these first").font(.title2.bold())
                        GroupedList {
                            ForEach(missedTopics, id: \.self) { ti in
                                Button { model.openLesson(s.sectionIndex, ti) } label: {
                                    HStack {
                                        Text(section.topics[ti].title)
                                        Spacer()
                                        let n = s.items.indices.filter { s.items[$0].topicIndex == ti && !s.answers[$0].correct }.count
                                        Text("\(n) missed").foregroundStyle(.red).monospacedDigit()
                                        Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(.tertiary)
                                    }
                                    .padding(.horizontal, 20).padding(.vertical, 14).contentShape(.rect)
                                }
                                .buttonStyle(.plain)
                                if ti != missedTopics.last { Divider().padding(.leading, 20) }
                            }
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text("Answer review").font(.title2.bold())
                    GroupedList {
                        ForEach(s.items.indices, id: \.self) { i in
                            ReviewRow(item: s.items[i], answer: s.answers[i],
                                      topicTitle: isMistakes ? model.originTitle(s.items[i]) : isExam ? s.items[i].topicIndex.map { section.topics[$0].title } : nil,
                                      number: i + 1)
                            if i < s.items.count - 1 { Divider().padding(.leading, 56) }
                        }
                    }
                }
            }
            .frame(maxWidth: 780)
            .padding(.horizontal, 40)
            .padding(.vertical, 48)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle(isMistakes ? "Mistakes review" : o.passed ? "Passed" : "Retake required")
    }

    @ViewBuilder
    private func actions(_ s: QuizSession, _ o: QuizOutcome, isExam: Bool) -> some View {
        HStack(spacing: 12) {
            if s.kind == .mistakes {
                if !model.store.mistakeDeck.isEmpty {
                    Button("Review more mistakes") { model.startMistakes() }.buttonStyle(.glassProminent)
                }
            } else if !o.passed {
                switch s.kind {
                case .topic(let si, let ti):
                    Button("Retake quiz") { model.startQuiz(si, ti) }.buttonStyle(.glassProminent)
                    Button("Reread the lesson") { model.openLesson(si, ti) }.buttonStyle(.glass)
                case .exam(let si):
                    Button("Retake exam") { model.startExam(si) }.buttonStyle(.glassProminent)
                case .mistakes:
                    EmptyView()
                }
            } else if let step = model.store.nextStep {
                Button(nextLabel(step)) { model.go(to: step) }.buttonStyle(.glassProminent)
            }
            Button("Back to path") { model.path = [] }.buttonStyle(.glass)
        }
        .controlSize(.extraLarge)
    }

    private func nextLabel(_ step: ProgressStore.Step) -> String {
        switch step {
        case .topic(let si, let ti): "Next: \(model.sections[si].topics[ti].title)"
        case .review(let si, let ti): "Review: \(model.sections[si].topics[ti].title)"
        case .exam(let si): "Next: \(model.sections[si].title) exam"
        }
    }
}

/// Shown above the score when a session crossed one or more level thresholds.
struct LevelUpCard: View {
    @Environment(AppModel.self) private var model
    @State private var shown = false

    var body: some View {
        let store = model.store
        let level = store.level()
        HStack(spacing: 22) {
            Image(systemName: "arrow.up.circle.fill")
                .font(.system(size: 60, weight: .semibold))
                .foregroundStyle(.white, Palette.xp)
                .symbolEffect(.bounce.up.byLayer, options: .repeat(3), value: shown)
                .symbolEffect(.breathe, isActive: shown)
            VStack(alignment: .leading, spacing: 4) {
                Eyebrow(text: "Level up", color: Palette.xp)
                Text("Level \(level.number) · \(level.name)")
                    .font(.system(size: 34, weight: .bold)).tracking(-0.6)
                Text(level.next.map { "\($0 - store.state.xp) XP to \(Rules.levels[level.number].1)" } ?? "Top level reached")
                    .font(.title3).foregroundStyle(.secondary).monospacedDigit()
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 32)
        .padding(.vertical, 26)
        .frame(maxWidth: .infinity)
        .glassEffect(.regular.tint(Palette.xp.opacity(0.25)), in: .rect(cornerRadius: 30))
        .scaleEffect(shown ? 1 : 0.85)
        .opacity(shown ? 1 : 0)
        .accessibilityElement(children: .combine)
        .onAppear { withAnimation(.spring(duration: 0.6, bounce: 0.45)) { shown = true } }
    }
}

struct ReviewRow: View {
    let item: QuizItem
    let answer: QuizAnswer
    let topicTitle: String?
    let number: Int

    var body: some View {
        let q = item.question
        let letters = Array("ABCDE")
        let letter = { (orig: Int) in String(letters[item.order.firstIndex(of: orig) ?? 0]) }
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: answer.correct ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.title3)
                .foregroundStyle(.white, answer.correct ? .green : .red)
            VStack(alignment: .leading, spacing: 6) {
                Text(topicTitle ?? "Question \(number)").font(.caption).foregroundStyle(.secondary)
                Text(inline(q.q)).font(.body.weight(.semibold))
                if q.code != nil {
                    Text(q.code ?? "").font(.system(size: 12.5, design: .monospaced)).foregroundStyle(.secondary)
                }
                switch q.kind {
                case .mc:
                    let chosen = answer.chosen ?? q.answer
                    if answer.correct {
                        Text("Your answer: \(letter(q.answer)). \(inline(q.options[q.answer]))").foregroundStyle(.secondary)
                    } else {
                        Text("Your answer: \(letter(chosen)). \(inline(q.options[chosen]))").foregroundStyle(.secondary)
                        Text("Correct: \(letter(q.answer)). \(inline(q.options[q.answer]))").bold()
                    }
                case .line:
                    let lines = q.lines
                    let line = { (i: Int) in "line \(i + 1): `\(lines[i].trimmingCharacters(in: .whitespaces))`" }
                    let chosen = answer.chosen ?? q.answer
                    Text(inline("Your answer: " + line(chosen))).foregroundStyle(.secondary)
                    if !answer.correct { Text(inline("Correct: " + line(q.answer))).bold() }
                case .order:
                    let list = { (order: [Int]) in order.enumerated().map { "\($0 + 1). \(q.steps[$1])" }.joined(separator: "  ") }
                    Text(inline("Your order: " + list(answer.arranged))).foregroundStyle(.secondary)
                    if !answer.correct { Text(inline("Correct: " + list(Array(q.steps.indices)))).bold() }
                }
                Text(inline(q.explain)).font(.callout).foregroundStyle(.secondary)
            }
            .textSelection(.enabled)
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
    }
}
