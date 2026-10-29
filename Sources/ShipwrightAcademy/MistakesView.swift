import SwiftUI

struct MistakesView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let store = model.store
        let deck = store.mistakeDeck
        Group {
            if deck.isEmpty {
                ContentUnavailableView("No mistakes to review", systemImage: "checkmark.circle",
                                       description: Text("Questions you miss in quizzes, reviews and exams collect here."))
            } else {
                ScrollView {
                    VStack(alignment: .leading, spacing: 22) {
                        VStack(alignment: .leading, spacing: 8) {
                            Eyebrow(text: "\(deck.count) in your deck · oldest first")
                            Text("Mistakes").font(.system(size: 46, weight: .bold)).tracking(-1)
                            Text("Every question you miss lands here. Answer it right \(Rules.mistakeClearStreak) times in a row in a mistakes review to clear it.")
                                .font(.title3).foregroundStyle(.secondary)
                        }
                        Button("Review \(min(deck.count, Rules.mistakeSession)) \(deck.count == 1 ? "mistake" : "mistakes")") { model.startMistakes() }
                            .buttonStyle(.glassProminent)
                            .controlSize(.extraLarge)
                            .keyboardShortcut(.defaultAction)
                        GroupedList {
                            ForEach(deck, id: \.self) { k in
                                if let e = store.questionIndex[k] {
                                    row(e.question, origin: model.sections[e.si].title + " · " + (e.ti.map { model.sections[e.si].topics[$0].title } ?? "Section exam"),
                                        streak: store.mistake(k)?.streak ?? 0)
                                    if k != deck.last { Divider().padding(.leading, 20) }
                                }
                            }
                        }
                    }
                    .frame(maxWidth: 860, alignment: .leading)
                    .padding(.horizontal, 40)
                    .padding(.vertical, 48)
                    .frame(maxWidth: .infinity)
                }
            }
        }
        .background(Backdrop())
        .navigationTitle("Mistakes")
    }

    private func row(_ q: Question, origin: String, streak: Int) -> some View {
        HStack(alignment: .top, spacing: 14) {
            VStack(alignment: .leading, spacing: 4) {
                Text(origin).font(.caption).foregroundStyle(.secondary)
                Text(inline(q.q)).font(.body.weight(.medium))
            }
            Spacer(minLength: 12)
            if streak > 0 {
                Chip(text: "\(streak)/\(Rules.mistakeClearStreak) right", color: .green)
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
    }
}
