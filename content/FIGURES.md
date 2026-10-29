# Lesson figures

A figure is a lesson block that draws a concept as inline SVG, optionally animated with CSS. The same SVG renders in the web app (inlined into the page) and the macOS app (in a WebKit view), so it must be self-contained and theme-neutral.

For figures the reader can manipulate (sliders, drag handles, step buttons), use an interactive block instead: see [INTERACTIVE.md](INTERACTIVE.md).

```js
{ type: "figure", id: "tcp-handshake", caption: "SYN, SYN-ACK, ACK: three packets before any data moves.", svg: "<svg ...>...</svg>" }
```

## Rules (enforced by `scripts/validate-content.js`)

- Root: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 W H" role="img" aria-label="...">`. No `width`/`height` on the root; it scales to the reading column (about 640 px wide). Use W = 640, H between 200 and 420.
- `id` is kebab-case and unique across the whole curriculum. Every CSS selector, `@keyframes` name and element `id` inside the SVG starts with `<id>-` (selectors as `.<id>-...`), so figures never collide when several are on one page. An inline `<style>` applies to the whole page: never use bare element selectors like `text { }`; put shared text styling on a class such as `.<id>-t`.
- Colours only through these variables (the host defines them for light and dark mode): `--fig-ink` (text, main strokes), `--fig-muted` (secondary text), `--fig-line` (grid lines, borders), `--fig-bg` (page), `--fig-panel` (box fills), `--fig-accent`, `--fig-accent2`, `--fig-ok`, `--fig-bad`, `--fig-warn`. No hex, rgb() or hsl(). `none`, `transparent` and `currentColor` are fine. Use `fill-opacity`/`stroke-opacity` for tints.
- Text: set `font-size` (13-16 for labels, 11 minimum) via a class or attribute; the font is inherited (system UI). Keep labels short and inside the viewBox.
- Animation: CSS `@keyframes` in a `<style>` inside the SVG, `animation: ... infinite` loops of 3-8 s, so the reader can watch the process repeat. The resting frame (first frame) must still read correctly, because reduced-motion users see only that. SMIL (`<animate>`) is allowed too but is also stopped for reduced motion only on the web, so prefer CSS.
- Forbidden: `<script>`, event attributes, `<foreignObject>`, `<image>`, external `href`s. Internal references (`url(#id)`, `href="#id"`) are fine.
- Under 14,000 characters.

## What makes a good figure

- It shows the mechanism, not decoration: a pipeline with data moving through it, a curve drawn to scale, a data structure changing step by step, a timeline with real proportions.
- It earns its place next to the text: something that is hard to see in prose (motion, ordering, growth, spatial relationships).
- Real labels and real numbers from the lesson. Captions say what to notice, in one sentence.
