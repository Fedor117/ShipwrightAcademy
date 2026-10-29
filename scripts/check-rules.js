// Checks that the web app (app.js) and the macOS app (ProgressStore.swift, Search.swift) apply the same progression and search rules,
// and that every place listing the section order agrees.
//   node scripts/check-rules.js
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(root, p), 'utf8');
const js = read('app.js');
const swift = read('Sources/ShipwrightAcademy/ProgressStore.swift');
const errs = [];

function one(src, re, what) {
  const m = src.match(re);
  if (!m) errs.push(`could not find ${what}`);
  return m ? m[1] : null;
}
const nums = (s) => (s || '').match(/\d+(\.\d+)?/g)?.map(Number) || [];
const pairs = (s) => [...(s || '').matchAll(/\[?\(?(\d+),\s*["']([^"']+)["']/g)].map((m) => [Number(m[1]), m[2]]);
function same(what, web, mac) {
  const a = JSON.stringify(web), b = JSON.stringify(mac);
  if (Array.isArray(web) && !web.length) errs.push(`${what}: found nothing to compare (pattern out of date?)`);
  else if (a !== b) errs.push(`${what} differs\n    app.js: ${a}\n    swift:  ${b}`);
}

same('topic pass threshold',
  Number(one(js, /TOPIC_PASS\s*=\s*([\d.]+)/, 'TOPIC_PASS in app.js')),
  Number(one(swift, /topicPass\s*=\s*([\d.]+)/, 'Rules.topicPass')));
same('exam pass threshold',
  Number(one(js, /EXAM_PASS\s*=\s*([\d.]+)/, 'EXAM_PASS in app.js')),
  Number(one(swift, /examPass\s*=\s*([\d.]+)/, 'Rules.examPass')));
same('review days',
  nums(one(js, /REVIEW_DAYS\s*=\s*\[([^\]]*)\]/, 'REVIEW_DAYS in app.js')),
  nums(one(swift, /reviewDays\s*=\s*\[([^\]]*)\]/, 'Rules.reviewDays')));
same('levels',
  pairs(one(js, /LEVELS\s*=\s*\[([\s\S]*?)\];/, 'LEVELS in app.js')),
  pairs(one(swift, /levels:[^=]*=\s*\[([\s\S]*?)\]\n/, 'Rules.levels')));

// XP awards: the label and the amount (or formula) of every gain, in source order.
const gain = (s) => s.replace(/\s+/g, '').replace(/\b(ts|t)\./g, '');
same('XP awards',
  [...js.matchAll(/gains\.push\(\['([^']+)',\s*([^\]]+)\]\)/g)].map((m) => [m[1], gain(m[2])]),
  [...swift.matchAll(/gains\.append\(\("([^"]+)",\s*(.+?)\)\)/g)].map((m) => [m[1], gain(m[2])]));

// Badges: fixed ones by id/name/detail, then the per-section and final badges' wording.
const webBadges = [...js.matchAll(/\{ id: '([\w-]+)', name: '([^']+)', desc: '([^']+)'/g)].map((m) => m.slice(1));
const macBadges = [...swift.matchAll(/Badge\(id: "([\w-]+)", name: "([^"]+)", detail: "([^"]+)"/g)].map((m) => m.slice(1));
same('fixed badges', webBadges, macBadges);
same('section badge detail',
  one(js, /desc: ('Pass the ' \+ s\.title \+ '[^']*')/, 'section badge desc in app.js')?.replace(/' \+ s\.title \+ '/, '<title>').slice(1, -1),
  one(swift, /detail: "(Pass the \\\(section\.title\)[^"]*)"/, 'section badge detail in swift')?.replace('\\(section.title)', '<title>'));

// Search: thresholds and the label and weight of every kind of indexed text (SearchRules in Search.swift).
const search = read('Sources/ShipwrightAcademy/Search.swift');
[['SEARCH_MIN', 'minQuery'], ['SEARCH_SNIPPET', 'snippet'], ['SEARCH_LEAD', 'lead'], ['SEARCH_PER_TOPIC', 'perTopic']].forEach(([w, m]) =>
  same('search ' + m,
    Number(one(js, new RegExp(w + '\\s*=\\s*(\\d+)'), w + ' in app.js')),
    Number(one(search, new RegExp('static let ' + m + '\\s*=\\s*(\\d+)'), 'SearchRules.' + m))));
const kinds = (s) => [...(s || '').matchAll(/"?(\w+)"?:\s*[[(]["']([^"']+)["'],\s*(\d+)/g)].map((m) => [m[1], m[2], Number(m[3])])
  .sort((a, b) => a[0].localeCompare(b[0]));
same('search kinds',
  kinds(one(js, /SEARCH_KINDS\s*=\s*\{([\s\S]*?)\};/, 'SEARCH_KINDS in app.js')),
  kinds(one(search, /static let kinds[^=]*=\s*\[([\s\S]*?)\]\n/, 'SearchRules.kinds')));

// Section order: app.js, the curriculum bundler, index.html script tags, and the content files on disk.
const order = (src, file) => JSON.parse(one(src, /ORDER\s*=\s*(\[[^\]]*\])/, `ORDER in ${file}`)?.replace(/'/g, '"') || '[]');
const webOrder = order(js, 'app.js');
same('section order (app.js vs build-curriculum.js)', webOrder, order(read('scripts/build-curriculum.js'), 'build-curriculum.js'));
same('section order (app.js vs index.html scripts)', webOrder,
  [...read('index.html').matchAll(/src="content\/([\w-]+)\.js"/g)].map((m) => m[1]));
const onDisk = fs.readdirSync(path.join(root, 'content')).filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, '')).filter((id) => !webOrder.includes(id));
if (onDisk.length) errs.push(`content/ files not in ORDER: ${onDisk.join(', ')}`);

if (errs.length) { errs.forEach((e) => console.log('FAIL ' + e)); process.exit(1); }
console.log('ok: web and macOS rules match');
