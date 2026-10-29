# Interactive figures

An interactive figure is a lesson block that lets the reader move something: a slider, a draggable point, a Step button. It is a small HTML fragment with inline `<style>` and `<script>` that runs in a locked-down frame in both apps. Use it where changing a parameter and watching the result teaches more than an animation does. Everything else should stay a static SVG [figure](FIGURES.md).

```js
{ type: "interactive", id: "engines-blend-explorer", caption: "Slide the speed: ...", height: 360, html: "<style>...</style><div>...</div><script>...</script>" }
```

Keep the source in `figures/interactive/<id>.html` and insert or replace it with:

```bash
node scripts/insert-figure.js content/engines.js engines-animation 11 engines-blend-explorer figures/interactive/engines-blend-explorer.html "<caption>" 360
```

## How it is hosted

| | Web (`app.js`) | macOS (`InteractiveFigureView.swift`) |
| --- | --- | --- |
| Container | `<iframe sandbox="allow-scripts" srcdoc>`, never `allow-same-origin` | `WKWebView` with JavaScript on and a non-persistent data store |
| Network | Blocked by the CSP below | Blocked by the CSP below; every navigation after the first load is cancelled |
| Theme | `--fig-*` values copied from the page, re-sent by `postMessage` when the colour scheme or `data-theme` changes | `--fig-*` light and dark values, following the app's appearance |
| Size | Column width × `height` px | Column width × `height` pt |

The host wraps `html` in a document whose `<head>` has:

- `Content-Security-Policy: default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:`
- the `--fig-*` variables, the base font and a small base stylesheet: transparent background, `overflow: hidden`, 14 px text, `--fig-*`-styled `button`s, `accent-color` for inputs, a focus ring, and no CSS animations or transitions under `prefers-reduced-motion`.

The CSP, base stylesheet and variable names are written in both apps. `scripts/check-rules.js` fails if they disagree.

## Rules (enforced by `scripts/validate-content.js`)

- `id` is kebab-case and unique across the curriculum, in the same namespace as figure ids. `caption` is required. `height` is an integer from 200 to 520.
- `html` is a fragment under 20,000 characters. No `<!doctype>`, `<html>`, `<head>` or `<body>`, because the host supplies the document.
- No network, storage or escape hatches: no `http:`/`https:` or `//` URLs, `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, `localStorage`, `sessionStorage`, `indexedDB`, `document.cookie`, `window.open`, `top.`/`parent.`/`opener.` access, `<iframe>`, `<object>`, `<embed>`, `<meta>`, `<base>`, `<link>`, `<form>`, `<script src>` or `@import`.
- Colours only through `var(--fig-*)`, the same ten variables as figures. No hex, `rgb()` or `hsl()`, and never use `prefers-color-scheme`, because the host sets the variables. Avoid `#` followed by hex-like letters anywhere (for example `'#add'`): use `getElementById`.
- Controls are real elements: at least one `<input type="range">` or `<button>`, and every `<input>` has a `<label for>` or `aria-label`. Pointer dragging is a bonus and never the only way to change a value. Put changing readouts in an `<output>` (with `aria-live="polite"` for step-by-step messages).
- Motion: any `requestAnimationFrame`, `setInterval`, `@keyframes` or `animation:` must be paired with a `prefers-reduced-motion` check. Nothing animates until the reader asks. Under reduced motion a Run button jumps to the end state.

## Authoring tips

- Lay out as a full-height flex column: an `<svg viewBox="0 0 640 H">` with `flex: 1; min-height: 0` above a row of controls. The SVG then scales to any column width without overflowing `height`.
- Build SVG content with `innerHTML` strings (`createElementNS` would need the SVG namespace URL, which the URL rule rejects). Inside the frame, styles cannot leak, so bare selectors are fine.
- Use the lesson's numbers and terms: the same thresholds, grid, formula and labels as the paragraph and static figure it extends. Place the block right after the block it illustrates.
- Check it in node before inserting: run the `<script>` against a stub `document` and drive its controls to catch runtime errors and wrong numbers.
