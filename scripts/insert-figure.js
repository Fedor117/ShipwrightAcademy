// Inserts (or replaces) a figure or interactive block in a section file.
//   node scripts/insert-figure.js <section.js> <topicId> <afterBlockIndex> <figureId> <file.svg> "<caption>"
//   node scripts/insert-figure.js <section.js> <topicId> <afterBlockIndex> <figureId> <file.html> "<caption>" <height>
// afterBlockIndex is the index of the lesson block the figure should follow (-1 = first).
// A .html source makes an interactive block (content/INTERACTIVE.md); <height> is its height in px (200-520).
// If a block with the same id already exists it is replaced in place and afterBlockIndex is ignored.
const fs = require('fs');
const vm = require('vm');

const [file, topicId, after, figId, srcFile, caption, height] = process.argv.slice(2);
const interactive = /\.html$/.test(srcFile || '');
if (!caption || (interactive && !height)) { console.error('usage: insert-figure.js <section.js> <topicId> <afterBlockIndex> <figureId> <file.svg|file.html> "<caption>" [height]'); process.exit(2); }

const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const section = ctx.window.CURRICULUM_SECTIONS[0];
const topic = section.topics.find((t) => t.id === topicId);
if (!topic) { console.error(`no topic "${topicId}" in ${file}; topics: ${section.topics.map((t) => t.id).join(', ')}`); process.exit(1); }

const src = fs.readFileSync(srcFile, 'utf8').trim();
const block = interactive
  ? { type: 'interactive', id: figId, caption, height: Number(height), html: src }
  : { type: 'figure', id: figId, caption, svg: src.replace(/\s*\n\s*/g, ' ') };
const existing = topic.lesson.findIndex((b) => (b.type === 'figure' || b.type === 'interactive') && b.id === figId);
if (existing >= 0) topic.lesson[existing] = block;
else topic.lesson.splice(Number(after) + 1, 0, block);

fs.writeFileSync(file, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
console.log(`${existing >= 0 ? 'replaced' : 'inserted'} ${figId} in ${topicId} at block ${existing >= 0 ? existing : Number(after) + 1}`);
