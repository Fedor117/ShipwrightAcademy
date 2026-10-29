// Assembles content/cases.js (Game Case Studies) from the topic-part files in figures/cases/.
//   node scripts/build-cases.js
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.join(__dirname, '..');
const dir = path.join(root, 'figures/cases');
const IDS = ['case-chess', 'case-platformer', 'case-kart-racer', 'case-fps', 'case-open-world-rpg', 'case-competitive-multiplayer'];

const section = {
  id: 'cases',
  track: 'Game Development',
  title: 'Game Case Studies',
  tagline: 'Six classic games taken apart: the components, the algorithms and why the choices work.',
  intro: 'The earlier sections teach the parts: rendering, the loop, physics, AI, networking, Unity. This one puts them together. Each topic tears down one classic kind of game: a chess engine, a 2D platformer, a kart racer, a first-person shooter, an open-world RPG and a competitive multiplayer game. For each you see which subsystems it needs, the algorithms inside them, the decisions a team makes and why those decisions hold up, including what the alternatives would cost. The aim is to recognise the shape of a game before you write a line of it, and to judge whether a design, or code an agent proposes, fits that shape.',
  topics: [],
  exam: [],
};

for (const id of IDS) {
  const ctx = { window: {} };
  vm.runInNewContext(fs.readFileSync(path.join(dir, id + '.js'), 'utf8'), ctx, { filename: id });
  section.topics.push(ctx.window.TOPIC_PART[0]);
  section.exam.push(...JSON.parse(fs.readFileSync(path.join(dir, id + '.exam.json'), 'utf8')));
}
// Exam questions that span several case studies.
section.exam.push(...JSON.parse(fs.readFileSync(path.join(dir, 'cases-extra.exam.json'), 'utf8')));

const out = path.join(root, 'content/cases.js');
fs.writeFileSync(out, 'window.CURRICULUM_SECTIONS = window.CURRICULUM_SECTIONS || [];\nwindow.CURRICULUM_SECTIONS.push(' + JSON.stringify(section, null, 2) + ');\n');
console.log(`${section.topics.length} topics, ${section.exam.length} exam questions -> content/cases.js`);
