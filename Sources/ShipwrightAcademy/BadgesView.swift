import SwiftUI

struct BadgesView: View {
    @Environment(AppModel.self) private var model
    @State private var confirmReset = false

    var body: some View {
        let store = model.store
        let earned = store.badges.filter { store.state.badges[$0.id] != nil }.count
        ScrollView {
            VStack(alignment: .leading, spacing: 24) {
                VStack(alignment: .leading, spacing: 6) {
                    Text("Badges").font(.system(size: 46, weight: .bold)).tracking(-1)
                    Text("\(earned) of \(store.badges.count) earned").font(.title3).foregroundStyle(.secondary)
                }
                GlassEffectContainer(spacing: 14) {
                    LazyVGrid(columns: [GridItem(.adaptive(minimum: 220), spacing: 14)], spacing: 14) {
                        ForEach(store.badges) { badge in
                            let has = store.state.badges[badge.id] != nil
                            HStack(spacing: 14) {
                                Image(systemName: has ? badge.symbol : "lock.fill")
                                    .font(.title2)
                                    .foregroundStyle(has ? Palette.xp : .secondary)
                                    .frame(width: 48, height: 48)
                                    .background((has ? Palette.xp : Color.secondary).opacity(0.15), in: .circle)
                                VStack(alignment: .leading, spacing: 2) {
                                    Text(badge.name).font(.headline)
                                    Text(badge.detail).font(.callout).foregroundStyle(.secondary)
                                }
                                Spacer(minLength: 0)
                            }
                            .padding(16)
                            .opacity(has ? 1 : 0.6)
                            .glassEffect(.regular, in: .rect(cornerRadius: 20))
                        }
                    }
                }

                VStack(alignment: .leading, spacing: 12) {
                    Text("Settings").font(.title2.bold())
                    GroupedList {
                        Toggle(isOn: Binding(get: { store.freeRoam }, set: { store.freeRoam = $0 })) {
                            VStack(alignment: .leading, spacing: 2) {
                                Text("Free roam")
                                Text("Unlock every topic and exam, for material you already know. Quizzes and badges still count.")
                                    .font(.callout).foregroundStyle(.secondary)
                            }
                        }
                        .toggleStyle(.switch)
                        .padding(.horizontal, 20).padding(.vertical, 14)
                        Divider().padding(.leading, 20)
                        HStack {
                            Text("Erase all XP, scores and badges")
                            Spacer()
                            Button("Reset progress…", role: .destructive) { confirmReset = true }
                        }
                        .padding(.horizontal, 20).padding(.vertical, 14)
                    }
                }
                .padding(.top, 12)
            }
            .frame(maxWidth: 900, alignment: .leading)
            .padding(.horizontal, 40)
            .padding(.vertical, 48)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle("Badges")
        .confirmationDialog("Erase all progress?", isPresented: $confirmReset) {
            Button("Erase progress", role: .destructive) { store.reset() }
        } message: {
            Text("XP, quiz scores, exam results and badges will be deleted. This cannot be undone.")
        }
    }
}
