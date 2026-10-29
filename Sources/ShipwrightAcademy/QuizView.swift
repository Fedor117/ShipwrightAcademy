import SwiftUI

struct QuizView: View {
    @Environment(AppModel.self) private var model
    @Namespace private var glass

    var body: some View {
        if let session = model.session {
            content(session)
        } else {
            ContentUnavailableView("No quiz in progress", systemImage: "checklist")
        }
    }

    private func content(_ s: QuizSession) -> some View {
        let item = s.current
        let section = model.sections[s.sectionIndex]
        let title: String = switch s.kind {
        case .topic(_, let ti): section.topics[ti].title
        case .exam: "\(section.title) · Section exam"
        }
        return ScrollView {
            VStack(spacing: 28) {
                HStack(spacing: 5) {
                    ForEach(s.items.indices, id: \.self) { i in
                        Capsule().fill(pipColor(s, i)).frame(height: 5)
                    }
                }
                .accessibilityLabel("Question \(s.index + 1) of \(s.items.count)")

                VStack(spacing: 12) {
                    Eyebrow(text: title)
                    Text(inline(item.question.q))
                        .font(.system(size: 30, weight: .bold))
                        .tracking(-0.5)
                        .multilineTextAlignment(.center)
                        .fixedSize(horizontal: false, vertical: true)
                }
                .padding(.top, 18)

                GlassEffectContainer(spacing: 10) {
                    VStack(spacing: 10) {
                        ForEach(Array(item.order.enumerated()), id: \.element) { pos, orig in
                            option(s, pos: pos, orig: orig)
                        }
                    }
                }

                if s.checked, let answer = s.answers.last {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(answer.correct ? "Correct." : "Not quite.")
                            .font(.headline)
                            .foregroundStyle(answer.correct ? .green : .red)
                        Text(inline(item.question.explain)).font(.body).lineSpacing(3)
                    }
                    .padding(20)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .glassEffect(.regular, in: .rect(cornerRadius: 18))
                    .transition(.opacity.combined(with: .move(edge: .bottom)))
                }

                VStack(spacing: 10) {
                    Button(s.checked ? (s.isLast ? "See results" : "Next question") : "Check answer") {
                        withAnimation(.spring(duration: 0.35)) {
                            if !s.checked { s.check() } else if s.isLast { model.finishQuiz() } else { s.advance() }
                        }
                    }
                    .buttonStyle(.glassProminent)
                    .controlSize(.extraLarge)
                    .keyboardShortcut(model.searchFocused ? nil : .defaultAction)
                    .disabled(s.picked == nil)

                    Text("Press 1–\(item.order.count) to choose, Return to continue.")
                        .font(.caption).foregroundStyle(.secondary)
                }
                .padding(.top, 4)
            }
            .frame(maxWidth: 760)
            .padding(.horizontal, 40)
            .padding(.vertical, 40)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle("Question \(s.index + 1) of \(s.items.count)")
        .navigationBarBackButtonHidden()
        .toolbar {
            ToolbarItem(placement: .navigation) {
                Button(s.kind == .exam(s.sectionIndex) ? "Leave exam" : "Leave quiz", systemImage: "xmark") { model.leaveQuiz() }
                    .help("Progress is not saved until you finish")
            }
        }
    }

    private func option(_ s: QuizSession, pos: Int, orig: Int) -> some View {
        let item = s.current
        let isAnswer = orig == item.question.answer
        let isPicked = orig == s.picked
        let state: (tint: Color?, symbol: String?) = {
            if s.checked {
                if isAnswer { return (.green, "checkmark") }
                if isPicked { return (.red, "xmark") }
                return (nil, nil)
            }
            return (isPicked ? .accentColor : nil, nil)
        }()
        let letters = Array("ABCDE")
        return Button {
            withAnimation(.spring(duration: 0.3)) { s.picked = orig }
        } label: {
            HStack(spacing: 14) {
                ZStack {
                    Circle().fill(state.tint ?? Color.secondary.opacity(0.15))
                    if let symbol = state.symbol {
                        Image(systemName: symbol).font(.system(size: 12, weight: .bold)).foregroundStyle(.white)
                    } else {
                        Text(String(letters[pos])).font(.system(size: 13, weight: .semibold, design: .rounded))
                            .foregroundStyle(state.tint == nil ? Color.secondary : .white)
                    }
                }
                .frame(width: 28, height: 28)
                Text(inline(item.question.options[orig]))
                    .font(.system(size: 17))
                    .multilineTextAlignment(.leading)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer(minLength: 0)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 15)
            .contentShape(.rect(cornerRadius: 18))
        }
        .buttonStyle(.plain)
        .disabled(s.checked)
        .keyboardShortcut(model.searchFocused ? nil : KeyboardShortcut(KeyEquivalent(Character("\(pos + 1)")), modifiers: []))
        .glassEffect(state.tint.map { Glass.regular.tint($0.opacity(0.3)).interactive() } ?? .regular.interactive(),
                     in: .rect(cornerRadius: 18))
        .glassEffectID(orig, in: glass)
    }

    private func pipColor(_ s: QuizSession, _ i: Int) -> Color {
        if i < s.answers.count { return s.answers[i].correct ? .green : .red }
        if i == s.index { return .accentColor }
        return .secondary.opacity(0.25)
    }
}
