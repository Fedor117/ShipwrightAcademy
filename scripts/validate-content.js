// Checks curriculum files against the content schema.
//   node scripts/validate-content.js content/think.js [...]        section files (window.CURRICULUM_SECTIONS.push)
//   node scripts/validate-content.js --topics content/parts/x.js    topic-part files (window.TOPIC_PART = [...])
const fs = require('fs');
const vm = require('vm');

const args = process.argv.slice(2);
const topicsMode = args[0] === '--topics';
const files = topicsMode ? args.slice(1) : args;
let failed = false;

// Question kinds (README "Questions"): mc (default), order, line.
const kindOf = (x) => x.kind || 'mc';
function checkQuestion(x, p, errs) {
  const str = (v, k) => { if (typeof v !== 'string' || !v.trim()) errs.push(`${p}.${k} must be a non-empty string`); };
  const none = (...ks) => ks.forEach((k) => { if (k in x) errs.push(`${p}.${k} is not used by kind "${kindOf(x)}"`); });
  str(x.q, 'q'); str(x.explain, 'explain');
  if (x.lang !== undefined) str(x.lang, 'lang');
  const k = kindOf(x);
  if (k === 'mc') {
    if (!Array.isArray(x.options) || x.options.length < 2 || x.options.length > 5) errs.push(`${p}.options must have 2-5 items`);
    else x.options.forEach((o, i) => { if (typeof o !== 'string' || !o.trim()) errs.push(`${p}.options[${i}] empty`); });
    if (!Number.isInteger(x.answer) || x.answer < 0 || !x.options || x.answer >= x.options.length) errs.push(`${p}.answer out of range`);
    if (x.code !== undefined) str(x.code, 'code');
    if (x.lang !== undefined && x.code === undefined) errs.push(`${p}.lang needs code`);
    none('steps');
  } else if (k === 'order') {
    if (!Array.isArray(x.steps) || x.steps.length < 3 || x.steps.length > 6) errs.push(`${p}.steps must have 3-6 items`);
    else {
      x.steps.forEach((o, i) => { if (typeof o !== 'string' || !o.trim()) errs.push(`${p}.steps[${i}] empty`); });
      if (new Set(x.steps).size !== x.steps.length) errs.push(`${p}.steps must be distinct`);
    }
    none('options', 'answer', 'code', 'lang');
  } else if (k === 'line') {
    str(x.code, 'code');
    const lines = typeof x.code === 'string' ? x.code.split('\n') : [];
    if (lines.length < 3) errs.push(`${p}.code needs >= 3 lines`);
    if (!Number.isInteger(x.answer) || x.answer < 0 || x.answer >= lines.length) errs.push(`${p}.answer must be a 0-based line index of code`);
    else if (!lines[x.answer].trim()) errs.push(`${p}.answer points at a blank line`);
    none('options', 'steps');
  } else errs.push(`${p}.kind must be mc|order|line, got ${JSON.stringify(x.kind)}`);
}

// Figures are inline SVG rendered in both apps; see content/FIGURES.md for the contract.
const figureIds = new Set();
function checkFigure(b, p, errs) {
  if (typeof b.id !== 'string' || !/^[a-z][a-z0-9-]{2,40}$/.test(b.id)) { errs.push(`${p}.id must be kebab-case`); return; }
  if (figureIds.has(b.id)) errs.push(`${p}.id "${b.id}" is not unique`);
  figureIds.add(b.id);
  if (typeof b.caption !== 'string' || !b.caption.trim()) errs.push(`${p}.caption required`);
  const svg = b.svg;
  if (typeof svg !== 'string' || !/^<svg[\s>]/.test(svg.trim()) || !/<\/svg>\s*$/.test(svg)) { errs.push(`${p}.svg must be one <svg>...</svg> element`); return; }
  const open = svg.match(/^<svg[^>]*>/)[0];
  if (!/viewBox="0 0 \d+ \d+"/.test(open)) errs.push(`${p}.svg needs viewBox="0 0 W H"`);
  if (/\swidth=|\sheight=/.test(open)) errs.push(`${p}.svg root must not set width/height (it scales to the column)`);
  if (!/role="img"/.test(open) || !/aria-label="[^"]{10,}"/.test(open)) errs.push(`${p}.svg root needs role="img" and a descriptive aria-label`);
  if (svg.length > 14000) errs.push(`${p}.svg is ${svg.length} chars; keep under 14000`);
  if (/<script|<foreignObject|<image|<iframe|\son[a-z]+=|javascript:|href="(?!#)/i.test(svg)) errs.push(`${p}.svg contains a forbidden element or attribute`);
  if (/#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(svg.replace(/url\(#[^)]+\)|href="#[^"]+"/g, ''))) errs.push(`${p}.svg uses a literal colour; use var(--fig-*) only`);
  const style = (svg.match(/<style>([\s\S]*?)<\/style>/) || [])[1] || '';
  const prefix = b.id + '-';
  for (const m of style.matchAll(/@keyframes\s+([\w-]+)/g)) if (!m[1].startsWith(prefix)) { errs.push(`${p} keyframes "${m[1]}" must start with "${prefix}"`); break; }
  // An inline <style> applies to the whole page, so every selector must target this figure only.
  const rules = style.replace(/@keyframes[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '').replace(/@media[^{]*\{/g, '');
  for (const m of rules.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
    const bad = m[1].split(',').map((s) => s.trim()).filter((s) => s && !s.startsWith('.' + prefix) && !s.startsWith('#' + prefix));
    if (bad.length) { errs.push(`${p} selector "${bad[0]}" must start with ".${prefix}" (an inline style leaks to the whole page)`); break; }
  }
  for (const m of svg.matchAll(/\sid="([^"]+)"/g)) if (!m[1].startsWith(prefix)) { errs.push(`${p} element id "${m[1]}" must start with "${prefix}"`); break; }
  for (const m of svg.matchAll(/var\((--[\w-]+)/g)) if (!/^--fig-(ink|muted|line|bg|panel|accent|accent2|ok|bad|warn)$/.test(m[1])) { errs.push(`${p} unknown colour variable ${m[1]}`); break; }
}

function checkPatterns(b, p, errs) {
  if (!Array.isArray(b.patterns) || b.patterns.length < 4 || b.patterns.length > 12) { errs.push(`${p}.patterns needs 4-12 items`); return; }
  const uses = new Set();
  b.patterns.forEach((x, i) => {
    const q = `${p}.patterns[${i}]`;
    for (const [k, max] of [['signal', 130], ['use', 50], ['why', 240]]) {
      if (typeof x[k] !== 'string' || !x[k].trim()) errs.push(`${q}.${k} must be a non-empty string`);
      else if (x[k].length > max) errs.push(`${q}.${k} is ${x[k].length} chars; keep under ${max}`);
      else if (/\n/.test(x[k])) errs.push(`${q}.${k} must be one line`);
    }
    if (uses.has(x.use)) errs.push(`${q}.use "${x.use}" repeats in this topic`);
    uses.add(x.use);
  });
}

function checkTopic(t, p, errs) {
  for (const k of ['id', 'title', 'summary']) if (typeof t[k] !== 'string' || !t[k].trim()) errs.push(`${p}.${k} must be a non-empty string`);
  if (!Number.isInteger(t.minutes)) errs.push(`${p}.minutes must be an integer`);
  if (!Array.isArray(t.lesson) || t.lesson.length < 6) errs.push(`${p}.lesson needs >= 6 blocks`);
  (t.lesson || []).forEach((b, i) => {
    const bp = `${p}.lesson[${i}]`;
    if (!['p', 'h', 'list', 'code', 'callout', 'figure', 'patterns'].includes(b.type)) errs.push(`${bp}.type invalid: ${b.type}`);
    if (b.type === 'figure') checkFigure(b, bp, errs);
    else if (b.type === 'patterns') checkPatterns(b, bp, errs);
    else if (b.type === 'list') { if (!Array.isArray(b.items) || !b.items.length) errs.push(`${bp}.items required`); }
    else if (typeof b.text !== 'string' || !b.text.trim()) errs.push(`${bp}.text required`);
    if (b.type === 'callout' && !['tip', 'warn', 'agent'].includes(b.kind)) errs.push(`${bp}.kind must be tip|warn|agent`);
  });
  if (!(t.lesson || []).some((b) => b.type === 'callout' && b.kind === 'agent')) errs.push(`${p} needs one callout of kind "agent"`);
  if ((t.lesson || []).filter((b) => b.type === 'patterns').length !== 1) errs.push(`${p} needs exactly one "patterns" block (signal -> move cheat sheet)`);
  if (!Array.isArray(t.keyPoints) || t.keyPoints.length < 3) errs.push(`${p}.keyPoints needs >= 3`);
  if (!Array.isArray(t.quiz) || t.quiz.length !== 6) errs.push(`${p}.quiz must have exactly 6 questions (5 on the lesson, 1 on its patterns)`);
  (t.quiz || []).forEach((x, i) => checkQuestion(x, `${p}.quiz[${i}]`, errs));
}

function checkBalance(all, errs) {
  // Answer balance and giveaways only make sense for multiple choice.
  const questions = all.filter((x) => kindOf(x) === 'mc' && Array.isArray(x.options));
  const counts = {};
  questions.forEach((x) => { counts[x.answer] = (counts[x.answer] || 0) + 1; });
  const max = Math.max(...Object.values(counts));
  if (questions.length >= 10 && max / questions.length > 0.45) errs.push(`answer index distribution is skewed: ${JSON.stringify(counts)}`);
  const giveaways = questions.filter((x) => {
    const L = x.options.map((o) => o.length);
    const m = Math.max(...L);
    const second = [...L].sort((a, b) => b - a)[1];
    return L[x.answer] === m && m > second * 1.3;
  });
  if (giveaways.length) errs.push(`${giveaways.length} question(s) where the correct option is >30% longer than every other: ${giveaways.map((x) => JSON.stringify(x.q.slice(0, 50))).join('; ')}`);
  if (/�/.test(JSON.stringify(all)))errs.push('contains U+FFFD replacement character');
}

for (const file of files) {
  const errs = [];
  const ctx = { window: {} };
  try { vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file }); }
  catch (e) { console.log(`FAIL ${file}: does not execute: ${e.message}`); failed = true; continue; }

  let questions = [];
  if (topicsMode) {
    const list = ctx.window.TOPIC_PART;
    if (!Array.isArray(list) || !list.length) errs.push('must set window.TOPIC_PART to a non-empty array of topics');
    else list.forEach((t, i) => { checkTopic(t, `topics[${i}]`, errs); questions.push(...(t.quiz || [])); });
  } else {
    const list = ctx.window.CURRICULUM_SECTIONS;
    if (!Array.isArray(list) || list.length !== 1) { console.log(`FAIL ${file}: must push exactly one section`); failed = true; continue; }
    const s = list[0];
    for (const k of ['id', 'title', 'tagline', 'intro']) if (typeof s[k] !== 'string' || !s[k].trim()) errs.push(`section.${k} must be a non-empty string`);
    if (!Array.isArray(s.topics) || s.topics.length < 4) errs.push('section.topics needs >= 4 topics');
    const ids = new Set();
    (s.topics || []).forEach((t, i) => { checkTopic(t, `topics[${i}]`, errs); if (ids.has(t.id)) errs.push(`topics[${i}].id duplicate`); ids.add(t.id); });
    if (!Array.isArray(s.exam) || s.exam.length < 12) errs.push('section.exam needs >= 12 questions');
    (s.exam || []).forEach((x, i) => checkQuestion(x, `exam[${i}]`, errs));
    questions = [...(s.topics || []).flatMap((t) => t.quiz || []), ...(s.exam || [])];
  }
  checkBalance(questions, errs);
  if (errs.length) { failed = true; console.log(`FAIL ${file}:\n  ` + errs.join('\n  ')); }
  else console.log(`OK ${file}: ${questions.length} questions, ${fs.statSync(file).size} bytes`);
}
process.exit(failed ? 1 : 0);
