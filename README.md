# Shipwright Academy

A course in CS fundamentals, engineering practice, building with AI agents, and game development. It has 11 sections and 81 topics across two tracks. Each topic has a lesson with animated SVG figures, a 6-question quiz and spaced reviews, and each section ends in an exam.

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

Lesson blocks are `p`, `h`, `list`, `code`, `callout` (`tip`, `warn` or `agent`), `figure` and `patterns`. Each topic needs at least one `agent` callout, exactly one `patterns` block (signal → move cheat sheet) and exactly 6 quiz questions. Figures follow the contract in [content/FIGURES.md](content/FIGURES.md).

| Script | Purpose |
| --- | --- |
| `validate-content.js content/*.js` | Checks the schema, figure rules and quiz balance |
| `check-rules.js` | Checks that the web and macOS apps use the same progression rules, section order and cheat sheet Markdown template |
| `build-curriculum.js` | Regenerates `curriculum.json` |
| `build-cases.js` | Assembles `content/cases.js` from `figures/cases/` |
| `insert-topic.js`, `insert-figure.js` | Add or replace a single topic or figure |
| `apply-figures.js`, `apply-patterns.js`, `apply-questions.js` | Apply batch manifests to a section file |
| `figure-gallery.html` | Previews every figure in one place |

Each script's header comment documents its arguments.

### Adding a section

Add its id in **all** of these places: `ORDER` in `app.js` and in `scripts/build-curriculum.js`, a `<script>` tag in `index.html`, and an SF Symbol in `Curriculum.swift`. `check-rules.js` catches the first three if they disagree.

## Progression rules

| Rule | Value |
| --- | --- |
| Pass mark | 80% for topic quizzes and section exams |
| Spaced reviews | 3, 7, 21 and 60 days after passing |
| XP | Topic passed +50, review +20, perfect +25, +10 per answer above your previous best, exam passed +250, flawless exam +100 |
| Levels | Intern (0 XP) to Distinguished Engineer (6500 XP) |

These rules are written twice, once in `app.js` and once in `ProgressStore.swift` (`Rules`). Change both, then run `node scripts/check-rules.js`.

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
