// Bundles content/*.js section files into the macOS app's curriculum.json, in path order.
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ORDER = ['think', 'foundations', 'systems', 'build', 'ship', 'maintain', 'agents', 'graphics', 'engines', 'unity', 'cases'];
const root = path.join(__dirname, '..');
const ctx = { window: {} };
for (const id of ORDER) {
  const file = path.join(root, 'content', id + '.js');
  if (!fs.existsSync(file)) { console.warn('missing ' + file); continue; }
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), ctx, { filename: file });
}
const sections = ctx.window.CURRICULUM_SECTIONS.sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
const out = path.join(root, 'Sources/ShipwrightAcademy/Resources/curriculum.json');
fs.writeFileSync(out, JSON.stringify(sections));
console.log(`${sections.length} sections, ${sections.reduce((n, s) => n + s.topics.length, 0)} topics -> ${path.relative(root, out)}`);
