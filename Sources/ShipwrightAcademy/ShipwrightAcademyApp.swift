import SwiftUI
import AppKit

@main
struct ShipwrightAcademyApp: App {
    @State private var model = AppModel()

    init() {
        // Lets `swift run` show a normal Dock app; a bundled .app does this on its own.
        NSApplication.shared.setActivationPolicy(.regular)
    }

    var body: some Scene {
        WindowGroup("Shipwright Academy") {
            ContentView()
                .environment(model)
                .frame(minWidth: 980, minHeight: 660)
        }
        .defaultSize(width: 1280, height: 840)
        .windowToolbarStyle(.unified)
        .commands {
            CommandGroup(replacing: .textEditing) {
                Button("Search Lessons") { model.searchFocusRequests += 1 }.keyboardShortcut("f")
                Button("Quick Search") { model.searchFocusRequests += 1 }.keyboardShortcut("k")
            }
        }
    }
}

struct ContentView: View {
    @Environment(AppModel.self) private var model
    @FocusState private var searchFocused: Bool

    var body: some View {
        @Bindable var model = model
        NavigationSplitView {
            Sidebar()
                .navigationSplitViewColumnWidth(min: 230, ideal: 260, max: 320)
        } detail: {
            NavigationStack(path: $model.path) {
                root
                    .navigationDestination(for: Route.self) { route in
                        switch route {
                        case .lesson(let si, let ti): LessonView(si: si, ti: ti)
                        case .quiz: QuizView()
                        case .result: ResultView()
                        case .search: SearchView()
                        case .cheatSheet(let si): CheatSheetView(si: si)
                        }
                    }
            }
            .toolbar { ToolbarItem(placement: .primaryAction) { StatsBar() } }
        }
        .searchable(text: $model.searchText, placement: .sidebar, prompt: "Search lessons")
        .searchFocused($searchFocused)
        .onSubmit(of: .search) { model.openFirstResult() }
        .onChange(of: model.searchText) { model.searchChanged() }
        .onChange(of: model.searchFocusRequests) { searchFocused = true }
        .onChange(of: searchFocused) { model.searchFocusChanged(searchFocused) }
        .overlay(alignment: .top) { ToastStack() }
        .onAppear { NSApplication.shared.activate() }
    }

    @ViewBuilder private var root: some View {
        switch model.sidebar ?? .home {
        case .home: HomeView()
        case .section(let si): SectionView(si: si)
        case .mistakes: MistakesView()
        case .badges: BadgesView()
        }
    }
}

struct Sidebar: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let store = model.store
        List(selection: Binding(get: { model.sidebar }, set: { if let v = $0 { model.select(v) } })) {
            Label("Today", systemImage: "circle.circle").tag(SidebarItem.home)
            ForEach(Curriculum.tracks, id: \.name) { track in
                Section(track.name) {
                    ForEach(track.sections, id: \.self) { si in
                        let section = model.sections[si]
                        HStack {
                            Label(section.title, systemImage: section.symbol)
                            Spacer()
                            if store.exam(si).passed {
                                Image(systemName: "checkmark.circle.fill").foregroundStyle(.green)
                            } else if !store.sectionUnlocked(si) {
                                Image(systemName: "lock.fill").foregroundStyle(.tertiary).font(.caption)
                            } else {
                                Text("\(store.passedCount(si))/\(section.topics.count)")
                                    .font(.caption).monospacedDigit().foregroundStyle(.secondary)
                            }
                        }
                        .tag(SidebarItem.section(si))
                    }
                }
            }
            Section {
                let deck = store.mistakeDeck.count
                if deck > 0 || model.sidebar == .mistakes {
                    Label("Mistakes", systemImage: "arrow.uturn.backward.circle").badge(deck).tag(SidebarItem.mistakes)
                }
                Label("Badges", systemImage: "medal").tag(SidebarItem.badges)
            }
        }
        .listStyle(.sidebar)
    }
}

struct StatsBar: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let store = model.store
        let level = store.level()
        HStack(spacing: 14) {
            HStack(spacing: 8) {
                Ring(fraction: store.levelFraction, color: Palette.xp, lineWidth: 4).frame(width: 18, height: 18)
                VStack(alignment: .leading, spacing: 0) {
                    Text("Level \(level.number) · \(level.name)").font(.caption.weight(.semibold))
                    Text(level.next.map { "\(store.state.xp) / \($0) XP" } ?? "\(store.state.xp) XP")
                        .font(.caption2).foregroundStyle(.secondary).monospacedDigit()
                }
            }
            Label("\(store.streak)", systemImage: "flame.fill")
                .labelStyle(.titleAndIcon)
                .foregroundStyle(store.streak > 0 ? Palette.xp : .secondary)
                .monospacedDigit()
                .help("Day streak")
        }
        .padding(.horizontal, 8)
    }
}

struct ToastStack: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        GlassEffectContainer(spacing: 8) {
            VStack(spacing: 8) {
                ForEach(model.toasts) { t in
                    Label(t.text, systemImage: t.symbol)
                        .font(.callout.weight(.semibold))
                        .padding(.horizontal, 18)
                        .padding(.vertical, 10)
                        .glassEffect(.regular.tint(Palette.xp.opacity(0.25)), in: .capsule)
                        .transition(.move(edge: .top).combined(with: .opacity))
                }
            }
        }
        .padding(.top, 60)
        .allowsHitTesting(false)
    }
}
