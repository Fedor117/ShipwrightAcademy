// Inserts a topic-part file into a section after a given topic, and appends optional exam questions.
//   node scripts/insert-topic.js <section.js> <afterTopicId> <topic-part.js> [exam.json]
// Re-running replaces a topic with the same id; exam questions already present (same text) are skipped.
const fs = require('fs');
const vm = require('vm');

const [file, afterId, partFile, examFile] = process.argv.slice(2);
const load = (f) => { const ctx = { window: {} }; vm.runInNewContext(fs.readFileSync(f, 'utf8'), ctx, { filename: f }); return ctx.window; };
const section = load(file).CURRICULUM_SECTIONS[0];
const [topic] = load(partFile).TOPIC_PART;

const existing = section.topics.findIndex((t) => t.id === topic.id);
if (existing >= 0) section.topics.splice(existing, 1);
const at = section.topics.findIndex((t) => t.id === afterId);
if (at < 0) { console.error(`no topic ${afterId} in ${file}`); process.exit(1); }
section.topics.splice(at + 1, 0, topic);

let added = 0;
if (examFile) {
  const have = new Set(section.exam.map((q) => q.q));
  for (const q of JSON.parse(fs.readFileSync(examFile, 'utf8'))) if (!have.has(q.q)) { section.exam.push(q); added++; }
}

fs.writeFileSync(file, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
console.log(`inserted ${topic.id} after ${afterId} in ${file}; +${added} exam questions`);
