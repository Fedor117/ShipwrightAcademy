# Shipwright Academy

A course in CS fundamentals, engineering practice, building with AI agents, and game development. It has 11 sections and 81 topics across two tracks. Each topic has a lesson with animated SVG figures (some with interactive versions), a 6-question quiz and spaced reviews, and each section ends in an exam.

| Track | Sections |
| --- | --- |
| Software Engineering | How to Think, CS Foundations, Systems & the Web, Building Software, Shipping, Maintaining, Building with AI Agents |
| Game Development | Computer Graphics, Game Engines, Unity, Game Case Studies |

Sections unlock in order within a track, and the two tracks run side by side.

There are two front ends over the same content:

- **macOS app** (`Sources/`): a SwiftUI app for macOS 26 that uses native Liquid Glass (`glassEffect`, `GlassEffectContainer`, `.glass` button styles).
- **Web app** (`index.html`, `app.js`): a single page that loads `content/*.js` directly. It can be published as a claude.ai Artifact, and progress syncs to the viewer's account when the `db` and `user` capabilities are available.

## Build and run

```bash
./scripts/build-app.sh
open "build/Shipwright Academy.app"
```

`build-app.sh` checks rule parity, regenerates `curriculum.json`, builds a release binary and wraps it in an ad-hoc-signed `.app`. For a debug build, run `node scripts/build-curriculum.js && swift run`, or open `Package.swift` in Xcode.

To run the web app locally, start a static server from the repo root and open `http://localhost:8765`:

```bash
python3 -m http.server 8765
```

## Content

`content/<section>.js` is the source of truth. Each file pushes one section onto `window.CURRICULUM_SECTIONS`. `scripts/build-curriculum.js` bundles these files into `Sources/ShipwrightAcademy/Resources/curriculum.json` for the macOS app. That file is generated, so never edit it by hand.

Lesson blocks are `p`, `h`, `list`, `code`, `callout` (`tip`, `warn` or `agent`), `figure`, `interactive` and `patterns`. Each topic needs at least one `agent` callout, exactly one `patterns` block (signal → move cheat sheet) and exactly 6 quiz questions. Figures follow the contract in [content/FIGURES.md](content/FIGURES.md). Interactive figures (sliders and step buttons in a sandboxed frame, sources in `figures/interactive/`) follow [content/INTERACTIVE.md](content/INTERACTIVE.md).

| Script | Purpose |
| --- | --- |
| `validate-content.js content/*.js` | Checks the schema, figure and interactive-figure rules, and quiz balance |
| `check-rules.js` | Checks that the web and macOS apps use the same progression rules (levels, XP, badges with their order and progress formulas, the counters behind the new badges, heatmap steps and XP-per-day retention), section order, search rules, cheat sheet Markdown template and interactive-figure sandbox (CSP, base CSS, theme variables) |
| `build-curriculum.js` | Regenerates `curriculum.json` |
| `build-cases.js` | Assembles `content/cases.js` from `figures/cases/` |
| `insert-topic.js`, `insert-figure.js` | Add or replace a single topic, or a figure (`.svg`) or interactive figure (`.html`) |
| `apply-figures.js`, `apply-patterns.js`, `apply-questions.js` | Apply batch manifests to a section file |
| `figure-gallery.html` | Previews every figure in one place |

Each script's header comment documents its arguments.

### Questions

Topic quizzes and section exams share one question schema. Every question has `q` and `explain`. The optional `kind` picks the type and defaults to `"mc"`. Kinds can be mixed freely, and an exam shuffles them together.

| Kind | Fields | The learner |
| --- | --- | --- |
| `mc` (default) | `options` (2-5), `answer` (correct option index), optional `code` + `lang` | Picks one option. With `code`, the snippet is shown above the options, for "predict the output" questions. |
| `order` | `steps` (3-6, distinct, in the correct order) | Gets the steps shuffled and puts them in order with up/down buttons. It counts as correct only if the whole order matches. |
| `line` | `code` (at least 3 lines), optional `lang`, `answer` (0-based index of the buggy line) | Clicks the line with the bug ("spot the bug"). Lines are shown numbered from 1. |

```js
{ q: 'What does this print?', code: 'a = [1]\nb = a\nb.append(2)\nprint(len(a))', lang: 'python', options: ['1', '2'], answer: 1, explain: '...' }
{ kind: 'order', q: 'Order these from slowest- to fastest-growing.', steps: ['`O(1)`', '`O(log n)`', '`O(n)`'], explain: '...' }
{ kind: 'line', q: 'Click the line with the bug.', code: 'def f(xs):\n    for i in range(len(xs) + 1):\n        print(xs[i])', lang: 'python', answer: 1, explain: '...' }
```

`validate-content.js` checks the fields of each kind and rejects fields a kind does not use. The answer-balance and giveaway checks apply only to `mc` questions. `steps` and `options` support inline `code` and `**bold**`. `code` is shown verbatim.

### Adding a section

Add its id in **all** of these places: `ORDER` in `app.js` and in `scripts/build-curriculum.js`, a `<script>` tag in `index.html`, and an SF Symbol in `Curriculum.swift`. `check-rules.js` catches the first three if they disagree.

## Progression rules

| Rule | Value |
| --- | --- |
| Pass mark | 80% for topic quizzes and section exams |
| Spaced reviews | 3, 7, 21 and 60 days after passing |
| XP | Topic passed +50, review +20, perfect +25, +10 per answer above your previous best, exam passed +250, flawless exam +100, mistake cleared +15 |
| Mistakes deck | Up to 10 questions per review, oldest miss first; a question clears after 2 right answers in a row |
| Levels | 12: Intern (0), Apprentice (200), Junior Engineer (600), Engineer (1200), Senior Engineer (2000), Staff Engineer (3000), Principal Engineer (4500), Distinguished Engineer (6500), Fellow (8500), Senior Fellow (11000), Chief Engineer (14000), Master Shipwright (17500 XP) |
| Activity heatmap | Day XP buckets: 0, 1-49, 50-149, 150-299, 300+ (`HEAT_STEPS` / `Rules.heatSteps`), at least 1 on any day with a finished session; XP per day kept for 120 days |

### Levels

When a quiz, exam, spaced review or mistakes review crosses one or more level thresholds, the result screen shows a level-up card above the score ("Level N · Name" and "N XP to <next level name>", or "Top level reached"); it replaces the level-up toast, with a bigger celebration than a normal pass: a longer, larger confetti burst on the web and a glass card with a symbol effect on macOS.

### Badges

Locked badges show a progress bar and "current/target"; earned badges show the date they were earned. Progress is clamped to the target.

| Badge | Earned when | Progress |
| --- | --- | --- |
| First Commit (`first`) | You pass a topic quiz | passed topics / 1 |
| Zero Defects (`flawless`) | A topic quiz is all right | 0/1 |
| Root Caused (`comeback`) | You pass a quiz or exam you failed before | 0/1 |
| Gatekeeper (`boss`) | You pass a section exam | passed exams / 1 |
| On Call, Release Train (`streak3`, `streak7`) | You study 3 or 7 days in a row | current streak / 3 or 7 |
| Spaced Out (`review5`) | You complete 5 spaced reviews | reviews / 5 |
| Halfway Merged (`half`) | You pass half of all topics | passed topics / ⌈topics ÷ 2⌉ |
| Debugger, Bug Bounty (`mistakes10`, `mistakes50`) | You clear 10 or 50 questions from the mistakes deck | cleared / 10 or 50 |
| Spot the Bug (`bugspot5`) | You answer 5 spot-the-bug (`line`) questions right | right `line` answers / 5 |
| Pipeline Builder (`order5`) | You answer 5 `order` questions right | right `order` answers / 5 |
| Inbox Zero (`inboxzero`) | A passed spaced review leaves no topic with a review due | 0/1 |
| One per section (`sec-<id>`) | You pass that section's exam | (passed topics + exam passed) / (topics + 1) |
| Full Stack, Game Ready (`track-software`, `track-games`) | You pass every exam in the Software Engineering or Game Development track | passed exams in the track / sections in it |
| Shipwright (`all`) | You pass every section exam | passed exams / sections |

Right `line` and `order` answers count in every kind of session (topic quiz, review, exam, mistakes review). Progress keeps `mistakesCleared` and `solved` (`line`, `order`) counters for these badges.

### Activity heatmap

The home screen shows the last 12 weeks as a grid: one column per week (Monday to Sunday, oldest on the left, the current week on the right, future days left empty). Each finished session adds its XP to the day in `xpByDay` (local `yyyy-MM-dd`), and a session with no XP still records the day with 0. A cell's shade comes from that day's XP: 0, 1-49, 50-149, 150-299 or 300+ map to buckets 0-4, except that any day with a finished session (an `xpByDay` entry, even 0, or a date in `days` from older saves) is at least bucket 1. Days with no session are bucket 0. Next to the grid: XP this week (from Monday) and the best day.

### Mistakes deck

Every question answered wrong in a topic quiz, spaced review or section exam goes into the mistakes deck. "Review mistakes" (home screen, header button on the web, sidebar on macOS) drills only those questions, with no pass mark. A question leaves the deck after 2 right answers in a row inside mistakes reviews; a wrong answer anywhere resets its run. Each cleared question earns +15 XP.

Deck entries are keyed by a hash of the question's text, options, order steps and code, in that order (`mistakeKey` in `app.js` and `ProgressStore.swift`), not by position, so reordering topics or questions is safe. Every question kind (mc, order, line) can land in the deck and is reviewed with the normal quiz screen. Editing any of those fields gives the question a new key, and the old entry is dropped silently the next time progress loads.

These rules are written twice, once in `app.js` and once in `ProgressStore.swift` (`Rules`). Change both, then run `node scripts/check-rules.js`.

## Search

Both apps search the whole course: section and topic titles, summaries, headings, paragraphs, list items, callouts, figure and interactive figure captions, key points and patterns. Code blocks and quiz questions are not indexed.

- **Open it:** on the web, use the field in the header (⌘K / Ctrl+K or `/`), then ↑ ↓ to move, Enter to open and Esc to close. On macOS, use the sidebar search field (⌘F or ⌘K), and Return opens the top result. In both apps, focusing the field again shows the results for the current query, and while you type, quiz shortcuts (1–5, Return) are ignored.
- **Matching:** every word you type must match the start of a word in the same piece of text. Case, accents and `**`/`` ` `` markup are ignored, so `cache inval` finds "invalidating caches". Queries shorter than 2 letters show no results.
- **Ranking:** titles first, then headings, key points and patterns, then body text. Results are grouped by topic and each topic shows its best 3 matches.
- **Locks:** locked topics are listed and marked locked, but can't be opened unless free roam is on. Picking a result opens the lesson and scrolls to the matching block.

The index is built from the curriculum at launch, so new content is searchable with no extra step. The thresholds and the label and weight for each kind of text are written twice: `SEARCH_*` in `app.js` and `SearchRules` in `Search.swift`. `check-rules.js` compares them.

## Cheat sheets

Each section has a one-page cheat sheet that lists every topic in order, with its summary, key points and patterns. On the web, open it with **Cheat sheet** in the section header on the path. On macOS, use **Cheat sheet** in the section's toolbar.

- The cheat sheet is always available. A topic you have not passed yet is dimmed and marked "Not yet studied", unless free roam is on.
- **Print / Save as PDF** (web) uses the browser's print dialog with a print stylesheet: no app chrome, black on white. **Export PDF…** (macOS) writes US Letter pages. In both, a page never breaks inside a pattern, and a topic's heading stays with its key points.
- **Copy as Markdown** gives the same text in both apps. It does not include progress. The template is:

```
# <section title> cheat sheet

<section tagline>

## <n>. <topic title>

<topic summary>

**Key points**

- <key point>

**Patterns**

- <signal> → **<use>**. <why>
```

Topics are separated by one blank line, and the text ends with a newline. The template is written twice: `cheatMarkdown` in `app.js` and `CheatSheet.markdown` in `CheatSheetView.swift`. `check-rules.js` checks that their string literals match. The cheat sheet uses the content as it is, so authors need nothing extra: a topic's `summary`, `keyPoints` and `patterns` block should make sense on their own, without the rest of the lesson.

## Progress

- macOS: `~/Library/Application Support/ShipwrightAcademy/progress.json`
- Web: `localStorage` key `shipwright-academy.v1`, plus account sync when published as an Artifact
