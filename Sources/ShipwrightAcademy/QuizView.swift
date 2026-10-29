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

                switch item.question.kind {
                case .mc:
                    if item.question.code != nil { CodeLines(question: item.question) }
                    GlassEffectContainer(spacing: 10) {
                        VStack(spacing: 10) {
                            ForEach(Array(item.order.enumerated()), id: \.element) { pos, orig in
                                option(s, pos: pos, orig: orig)
                            }
                        }
                    }
                case .line:
                    CodeLines(question: item.question, picked: s.picked, checked: s.checked) { i in
                        withAnimation(.spring(duration: 0.3)) { s.picked = i }
                    }
                case .order:
                    GlassEffectContainer(spacing: 10) {
                        VStack(spacing: 10) {
                            ForEach(Array(s.arranged.enumerated()), id: \.element) { pos, orig in
                                step(s, pos: pos, orig: orig)
                            }
                        }
                    }
                }

                if s.checked, let answer = s.answers.last {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(answer.correct ? "Correct." : "Not quite.")
                            .font(.headline)
                            .foregroundStyle(answer.correct ? .green : .red)
                        if !answer.correct, item.question.kind == .line {
                            Text("The bug is on line \(item.question.answer + 1).").font(.body.weight(.semibold))
                        }
                        if !answer.correct, item.question.kind == .order {
                            Text(inline("Correct order: " + item.question.steps.enumerated().map { "\($0 + 1). \($1)" }.joined(separator: "  ")))
                                .font(.body.weight(.semibold))
                        }
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
                    .keyboardShortcut(.defaultAction)
                    .disabled(!s.canCheck)

                    Text(hint(item))
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
        .keyboardShortcut(KeyEquivalent(Character("\(pos + 1)")), modifiers: [])
        .glassEffect(state.tint.map { Glass.regular.tint($0.opacity(0.3)).interactive() } ?? .regular.interactive(),
                     in: .rect(cornerRadius: 18))
        .glassEffectID(orig, in: glass)
    }

    private func step(_ s: QuizSession, pos: Int, orig: Int) -> some View {
        let tint: Color? = s.checked ? (pos == orig ? .green : .red) : nil
        return HStack(spacing: 14) {
            ZStack {
                Circle().fill(tint ?? Color.secondary.opacity(0.15))
                Text("\(pos + 1)").font(.system(size: 13, weight: .semibold, design: .rounded))
                    .foregroundStyle(tint == nil ? Color.secondary : .white)
            }
            .frame(width: 28, height: 28)
            Text(inline(s.current.question.steps[orig]))
                .font(.system(size: 17))
                .multilineTextAlignment(.leading)
                .fixedSize(horizontal: false, vertical: true)
            Spacer(minLength: 0)
            if !s.checked {
                Button("Move up", systemImage: "chevron.up") { withAnimation(.spring(duration: 0.3)) { s.move(pos, by: -1) } }
                    .disabled(pos == 0)
                Button("Move down", systemImage: "chevron.down") { withAnimation(.spring(duration: 0.3)) { s.move(pos, by: 1) } }
                    .disabled(pos == s.arranged.count - 1)
            }
        }
        .labelStyle(.iconOnly)
        .buttonStyle(.borderless)
        .padding(.horizontal, 18)
        .padding(.vertical, 15)
        .glassEffect(tint.map { Glass.regular.tint($0.opacity(0.3)) } ?? .regular, in: .rect(cornerRadius: 18))
        .glassEffectID(orig, in: glass)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("Position \(pos + 1): \(s.current.question.steps[orig])")
    }

    private func hint(_ item: QuizItem) -> String {
        switch item.question.kind {
        case .mc: "Press 1–\(item.order.count) to choose, Return to continue."
        case .line: "Click the line with the bug (or press its number), then Return."
        case .order: "Use the arrows to put the steps in order, then press Return."
        }
    }

    private func pipColor(_ s: QuizSession, _ i: Int) -> Color {
        if i < s.answers.count { return s.answers[i].correct ? .green : .red }
        if i == s.index { return .accentColor }
        return .secondary.opacity(0.25)
    }
}

/// A code snippet with numbered lines. With `pick`, each line is a button ("spot the bug").
struct CodeLines: View {
    let question: Question
    var picked: Int? = nil
    var checked = false
    var pick: ((Int) -> Void)? = nil

    var body: some View {
        let lines = question.lines
        let width = String(lines.count).count
        ScrollView(.horizontal, showsIndicators: false) {
            VStack(alignment: .leading, spacing: 0) {
                ForEach(lines.indices, id: \.self) { i in
                    let row = HStack(spacing: 14) {
                        Text(String(repeating: " ", count: width - String(i + 1).count) + "\(i + 1)")
                            .foregroundStyle(Color(white: 0.5))
                        Text(lines[i].isEmpty ? " " : lines[i]).foregroundStyle(Color(white: 0.95))
                        Spacer(minLength: 0)
                    }
                    .font(.system(size: 13.5, design: .monospaced))
                    .padding(.horizontal, 20)
                    .padding(.vertical, 3)
                    .background(tint(i).opacity(0.35))
                    .contentShape(.rect)
                    if let pick {
                        Button { pick(i) } label: { row }
                            .buttonStyle(.plain)
                            .disabled(checked)
                            .accessibilityLabel("Line \(i + 1): \(lines[i])")
                            .keyboardShortcut(i < 9 ? KeyboardShortcut(KeyEquivalent(Character("\(i + 1)")), modifiers: []) : nil)
                    } else {
                        row
                    }
                }
            }
            .padding(.vertical, 14)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color(red: 0.11, green: 0.11, blue: 0.12), in: .rect(cornerRadius: 18))
        .overlay(alignment: .topTrailing) {
            if let lang = question.lang, !lang.isEmpty {
                Text(lang.uppercased()).font(.caption2.weight(.semibold)).foregroundStyle(Color(white: 0.6)).padding(10)
            }
        }
    }

    private func tint(_ i: Int) -> Color {
        if checked {
            if i == question.answer { return .green }
            if i == picked { return .red }
        } else if i == picked {
            return .accentColor
        }
        return .clear
    }
}
