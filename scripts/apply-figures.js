// Applies figure manifests to a section file in one pass, so several authors can work in parallel.
//   node scripts/apply-figures.js <section.js> <manifest.json> [...]
// Manifest: [{ "topicId", "after", "id", "caption", "svgFile" }], where "after" is the index of the
// lesson block (in the file as it is now) that the figure should follow (-1 = first block).
const fs = require('fs');
const vm = require('vm');

const [file, ...manifests] = process.argv.slice(2);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const section = ctx.window.CURRICULUM_SECTIONS[0];

const entries = manifests.flatMap((m) => JSON.parse(fs.readFileSync(m, 'utf8')));
const byTopic = {};
for (const e of entries) (byTopic[e.topicId] ||= []).push(e);

let count = 0;
for (const [topicId, list] of Object.entries(byTopic)) {
  const topic = section.topics.find((t) => t.id === topicId);
  if (!topic) { console.error(`skipped: no topic ${topicId}`); continue; }
  // Insert from the bottom up so earlier indexes stay valid; keep manifest order for equal positions.
  list.map((e, i) => ({ e, i })).sort((a, b) => b.e.after - a.e.after || b.i - a.i).forEach(({ e }) => {
    const svg = fs.readFileSync(e.svgFile, 'utf8').trim().replace(/\s*\n\s*/g, ' ');
    const block = { type: 'figure', id: e.id, caption: e.caption, svg };
    const existing = topic.lesson.findIndex((b) => b.type === 'figure' && b.id === e.id);
    if (existing >= 0) topic.lesson[existing] = block;
    else topic.lesson.splice(e.after + 1, 0, block);
    count++;
  });
}

fs.writeFileSync(file, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
console.log(`applied ${count} figures to ${file}`);
