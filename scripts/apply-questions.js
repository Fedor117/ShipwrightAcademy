// Appends one extra question per topic to its quiz (skipped if the same question text is already there).
//   node scripts/apply-questions.js <section.js> <questions.json> [...]
// questions.json: [{ "topicId", "question": { "q", "options", "answer", "explain" } }]; other sections' entries are ignored.
const fs = require('fs');
const vm = require('vm');

const [file, ...sources] = process.argv.slice(2);
const ctx = { window: {} };
vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
const section = ctx.window.CURRICULUM_SECTIONS[0];

let count = 0;
for (const { topicId, question } of sources.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8')))) {
  const topic = section.topics.find((t) => t.id === topicId);
  if (!topic || topic.quiz.some((q) => q.q === question.q)) continue;
  topic.quiz.push(question);
  count++;
}

fs.writeFileSync(file, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
console.log(`${file}: +${count} questions`);
