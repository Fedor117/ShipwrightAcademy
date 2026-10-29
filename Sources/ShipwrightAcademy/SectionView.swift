import SwiftUI

struct SectionView: View {
    @Environment(AppModel.self) private var model
    let si: Int

    var body: some View {
        let store = model.store
        let section = model.sections[si]
        let unlocked = store.sectionUnlocked(si)
        ScrollView {
            VStack(alignment: .leading, spacing: 22) {
                VStack(alignment: .leading, spacing: 8) {
                    Eyebrow(text: "\(section.trackName) · \(store.passedCount(si)) of \(section.topics.count) complete")
                    Text(section.title).font(.system(size: 46, weight: .bold)).tracking(-1)
                    Text(section.tagline).font(.title3).foregroundStyle(.secondary)
                    Text(section.intro).font(.body).foregroundStyle(.secondary).padding(.top, 4)
                }

                if !unlocked, let prev = Curriculum.previousInTrack(si) {
                    Label("Pass the \(model.sections[prev].title) exam to unlock this section.", systemImage: "lock.fill")
                        .font(.callout.weight(.medium))
                        .padding(.horizontal, 16)
                        .padding(.vertical, 10)
                        .glassEffect(.regular, in: .capsule)
                }

                GroupedList {
                    ForEach(Array(section.topics.enumerated()), id: \.offset) { ti, topic in
                        TopicRow(si: si, ti: ti, topic: topic)
                        Divider().padding(.leading, 64)
                    }
                    ExamRow(si: si)
                }
            }
            .frame(maxWidth: 860, alignment: .leading)
            .padding(.horizontal, 40)
            .padding(.vertical, 48)
            .frame(maxWidth: .infinity)
        }
        .background(Backdrop())
        .navigationTitle(section.title)
    }
}

struct TopicRow: View {
    @Environment(AppModel.self) private var model
    let si: Int
    let ti: Int
    let topic: Topic

    var body: some View {
        let store = model.store
        let t = store.topic(si, ti)
        let open = store.topicUnlocked(si, ti)
        Button { model.openLesson(si, ti) } label: {
            HStack(spacing: 16) {
                StepDot(state: t.passed ? .done : (open ? .open : .locked), number: ti + 1)
                VStack(alignment: .leading, spacing: 3) {
                    Text(topic.title).font(.body.weight(.medium)).foregroundStyle(open ? .primary : .secondary)
                    Text(topic.summary).font(.callout).foregroundStyle(.secondary).lineLimit(2)
                }
                Spacer(minLength: 12)
                trailing(t, open: open)
                Image(systemName: "chevron.right").font(.caption.weight(.semibold)).foregroundStyle(.tertiary)
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 14)
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .disabled(!open)
    }

    @ViewBuilder private func trailing(_ t: TopicProgress, open: Bool) -> some View {
        if model.store.reviewDue(si, ti) {
            Chip(text: "Review due", color: .accentColor, symbol: "arrow.trianglehead.2.clockwise")
        } else if t.passed {
            Chip(text: "\(t.best)/\(t.total)", color: .green)
        } else if t.attempts > 0 {
            Chip(text: "Best \(t.best)/\(t.total)", color: .red)
        } else {
            Text("\(topic.minutes) min").font(.callout).foregroundStyle(.secondary).monospacedDigit()
        }
    }
}

struct ExamRow: View {
    @Environment(AppModel.self) private var model
    let si: Int

    var body: some View {
        let store = model.store
        let e = store.exam(si)
        let open = store.examUnlocked(si)
        let section = model.sections[si]
        Button { model.startExam(si) } label: {
            HStack(spacing: 16) {
                Image(systemName: e.passed ? "checkmark.seal.fill" : (open ? "flag.checkered" : "lock.fill"))
                    .font(.title3)
                    .foregroundStyle(e.passed ? .green : (open ? Color.accentColor : .secondary))
                    .frame(width: 28)
                VStack(alignment: .leading, spacing: 3) {
                    Text("Section Exam").font(.body.weight(.semibold)).foregroundStyle(open ? .primary : .secondary)
                    Text(open || e.passed
                         ? "\(section.examLength) questions across the whole section. Pass mark \(Int(Rules.examPass * 100))%."
                         : "Unlocks when every topic above is passed.")
                        .font(.callout).foregroundStyle(.secondary)
                }
                Spacer(minLength: 12)
                if e.passed {
                    Chip(text: "Passed \(e.best)%", color: .green)
                } else if e.attempts > 0 {
                    Chip(text: "Best \(e.best)% · retake required", color: .red)
                } else if open {
                    Text("Start").font(.callout.weight(.semibold)).foregroundStyle(.tint)
                }
            }
            .padding(.horizontal, 20)
            .padding(.vertical, 18)
            .background(.secondary.opacity(0.05))
            .contentShape(.rect)
        }
        .buttonStyle(.plain)
        .disabled(!open)
    }
}
