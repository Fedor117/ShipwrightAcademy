// Puts a "patterns" block at the end of each topic's lesson (replacing any existing one).
//   node scripts/apply-patterns.js <section.js> <patterns.json> [...]
// patterns.json: [{ "topicId", "patterns": [{ "signal", "use", "why" }] }]; entries for other sections are ignored.
const fs = require('fs');
const vm = require('vm');

const [file, ...sources] = process.argv.slice(2);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const section = ctx.window.CURRICULUM_SECTIONS[0];

let count = 0;
for (const entry of sources.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')))) {
  const topic = section.topics.find((t) => t.id === entry.topicId);
  if (!topic) continue;
  topic.lesson = topic.lesson.filter((b) => b.type !== 'patterns');
  topic.lesson.push({ type: 'patterns', patterns: entry.patterns });
  count++;
}

fs.writeFileSync(file, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
const missing = section.topics.filter((t) => !t.lesson.some((b) => b.type === 'patterns')).map((t) => t.id);
console.log(`${file}: patterns on ${count} topics` + (missing.length ? `; missing: ${missing.join(', ')}` : ''));
