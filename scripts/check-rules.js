// Checks that the web app (app.js) and the macOS app (ProgressStore.swift, Search.swift) apply the same progression and search rules,
// that every place listing the section order agrees, and that both cheat sheet Markdown renderers use the same template.
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
same('mistake clear streak',
  Number(one(js, /MISTAKE_CLEAR_STREAK\s*=\s*(\d+)/, 'MISTAKE_CLEAR_STREAK in app.js')),
  Number(one(swift, /mistakeClearStreak\s*=\s*(\d+)/, 'Rules.mistakeClearStreak')));
same('mistakes session size',
  Number(one(js, /MISTAKE_SESSION\s*=\s*(\d+)/, 'MISTAKE_SESSION in app.js')),
  Number(one(swift, /mistakeSession\s*=\s*(\d+)/, 'Rules.mistakeSession')));
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
// Interactive figures: same CSP, base stylesheet and --fig-* theme variables in both hosts.
const interactive = read('Sources/ShipwrightAcademy/InteractiveFigureView.swift');
same('interactive CSP',
  one(js, /INTERACTIVE_CSP\s*=\s*"([^"]+)"/, 'INTERACTIVE_CSP in app.js'),
  one(interactive, /static let csp\s*=\s*"([^"]+)"/, 'Interactive.csp'));
const concat = (s) => [...(s || '').matchAll(/(['"])((?:(?!\1).)*)\1/g)].map((m) => m[2]).join('');
same('interactive base CSS',
  concat(one(js, /INTERACTIVE_BASE\s*=\s*([\s\S]*?);\n/, 'INTERACTIVE_BASE in app.js')),
  concat(one(interactive, /static let base\s*=\s*([\s\S]*?)\n\n/, 'Interactive.base')));
const figVars = (s) => [...new Set([...(s || '').matchAll(/--fig-([\w-]+)\s*:/g)].map((m) => m[1]))].sort();
const webVars = [...(one(js, /FIG_VARS\s*=\s*\[([^\]]*)\]/, 'FIG_VARS in app.js') || '').matchAll(/'([\w-]+)'/g)].map((m) => m[1]).sort();
same('figure theme variables (app.js vs index.html)', webVars, figVars(read('index.html')));
same('figure theme variables (app.js vs FigureView.swift)', webVars,
  figVars(one(read('Sources/ShipwrightAcademy/FigureView.swift'), /let figureTheme = """([\s\S]*?)"""/, 'figureTheme in FigureView.swift')));

// Section order: app.js, the curriculum bundler, index.html script tags, and the content files on disk.
const order = (src, file) => JSON.parse(one(src, /ORDER\s*=\s*(\[[^\]]*\])/, `ORDER in ${file}`)?.replace(/'/g, '"') || '[]');
const webOrder = order(js, 'app.js');
same('section order (app.js vs build-curriculum.js)', webOrder, order(read('scripts/build-curriculum.js'), 'build-curriculum.js'));
same('section order (app.js vs index.html scripts)', webOrder,
  [...read('index.html').matchAll(/src="content\/([\w-]+)\.js"/g)].map((m) => m[1]));
const onDisk = fs.readdirSync(path.join(root, 'content')).filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, '')).filter((id) => !webOrder.includes(id));
if (onDisk.length) errs.push(`content/ files not in ORDER: ${onDisk.join(', ')}`);

// Cheat sheet Markdown: both renderers must use the same template, so their string literals must match in order.
const lits = (body, q) => [...(body || '').matchAll(new RegExp(q + '((?:[^' + q + '\\\\]|\\\\.)*)' + q, 'g'))].map((m) => m[1]);
same('cheat sheet Markdown template',
  lits(one(js, /function cheatMarkdown\(s\) \{([\s\S]*?)\n  \}\n/, 'cheatMarkdown in app.js'), "'"),
  lits(one(read('Sources/ShipwrightAcademy/CheatSheetView.swift'), /static func markdown\(_ s: CourseSection\) -> String \{([\s\S]*?)\n    \}\n/, 'CheatSheet.markdown in CheatSheetView.swift'), '"'));

if (errs.length) { errs.forEach((e) => console.log('FAIL ' + e)); process.exit(1); }
console.log('ok: web and macOS rules match');
