import SwiftUI

struct SearchView: View {
    @Environment(AppModel.self) private var model

    var body: some View {
        let terms = Search.terms(model.searchText)
        let groups = terms.map(Search.run) ?? []
        let hits = groups.reduce(0) { $0 + $1.hits.count }
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: terms == nil ? "Type at least \(SearchRules.minQuery) letters"
                        : "\(hits) match\(hits == 1 ? "" : "es") in \(groups.count) place\(groups.count == 1 ? "" : "s")")
                    Text("Search").font(.system(size: 46, weight: .bold)).tracking(-1)
                }
                if terms != nil, groups.isEmpty {
                    Text("No lessons match “\(model.searchText.trimmingCharacters(in: .whitespaces))”.")
                        .font(.title3).foregroundStyle(.secondary)
                }
                ForEach(groups) { group in
                    SearchGroupView(group: group, terms: terms ?? [])
                }
            }
            .frame(maxWidth: 860, alignment: .leading)
            .padding(.horizontal, 40)
            .padding(.vertical, 48)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle("Search")
    }
}

struct SearchGroupView: View {
    @Environment(AppModel.self) private var model
    let group: SearchGroup
    let terms: [String]

    var body: some View {
        let section = model.sections[group.si]
        let open = model.searchOpenable(group.si, group.ti)
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 6) {
                Text(section.title).foregroundStyle(.secondary)
                if let ti = group.ti {
                    Text("·").foregroundStyle(.tertiary)
                    Text(section.topics[ti].title).fontWeight(.semibold)
                }
                Spacer()
                if !open { Chip(text: "Locked", symbol: "lock.fill") }
            }
            .font(.callout)
            .padding(.horizontal, 4)
            GroupedList {
                ForEach(Array(group.hits.prefix(SearchRules.perTopic).enumerated()), id: \.offset) { i, hit in
                    if i > 0 { Divider().padding(.leading, 126) }
                    Button { model.open(hit) } label: {
                        HStack(alignment: .firstTextBaseline, spacing: 14) {
                            Text(hit.label.uppercased())
                                .font(.system(size: 11, weight: .semibold, design: .monospaced))
                                .tracking(0.6)
                                .foregroundStyle(.tertiary)
                                .frame(width: 92, alignment: .leading)
                            Text(Search.snippet(hit.text, terms: terms))
                                .foregroundStyle(.secondary)
                                .frame(maxWidth: .infinity, alignment: .leading)
                        }
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .contentShape(.rect)
                    }
                    .buttonStyle(.plain)
                    .disabled(!open)
                }
            }
            .opacity(open ? 1 : 0.6)
            if group.hits.count > SearchRules.perTopic {
                Text("+\(group.hits.count - SearchRules.perTopic) more in this \(group.ti == nil ? "section" : "topic")")
                    .font(.callout).foregroundStyle(.tertiary).padding(.horizontal, 4)
            }
        }
    }
}
