(function () {
  'use strict';

  // ---------- Curriculum ----------
  const ORDER = ['think', 'foundations', 'systems', 'build', 'ship', 'maintain', 'agents', 'graphics', 'engines', 'unity', 'cases'];
  const SECTIONS = (window.CURRICULUM_SECTIONS || [])
    .slice()
    .sort((a, b) => ORDER.indexOf(a.id) - ORDER.indexOf(b.id));
  // Sections unlock in order within a track; tracks run side by side.
  const trackOf = (s) => s.track || 'Software Engineering';
  const TRACKS = [];
  SECTIONS.forEach((s, si) => {
    let t = TRACKS.find((x) => x.name === trackOf(s));
    if (!t) TRACKS.push(t = { name: trackOf(s), sections: [] });
    t.sections.push(si);
  });
  function prevInTrack(si) {
    for (let i = si - 1; i >= 0; i--) if (trackOf(SECTIONS[i]) === trackOf(SECTIONS[si])) return i;
    return -1;
  }
  function nextInTrack(si) {
    for (let i = si + 1; i < SECTIONS.length; i++) if (trackOf(SECTIONS[i]) === trackOf(SECTIONS[si])) return i;
    return -1;
  }

  const TOPIC_PASS = 0.8;   // 4 of 5
  const EXAM_PASS = 0.8;
  const REVIEW_DAYS = [3, 7, 21, 60];
  const MISTAKE_CLEAR_STREAK = 2;   // right answers in a row, in mistakes reviews, to clear a question
  const MISTAKE_SESSION = 10;
  const DAY = 86400000;
  const LEVELS = [
    [0, 'Intern'], [200, 'Apprentice'], [600, 'Junior Engineer'], [1200, 'Engineer'],
    [2000, 'Senior Engineer'], [3000, 'Staff Engineer'], [4500, 'Principal Engineer'], [6500, 'Distinguished Engineer'],
    [8500, 'Fellow'], [11000, 'Senior Fellow'], [14000, 'Chief Engineer'], [17500, 'Master Shipwright'],
  ];
  const HEAT_STEPS = [1, 50, 150, 300];   // day XP at which the activity heatmap reaches buckets 1-4
  const HEAT_WEEKS = 12;
  const XP_DAYS_KEPT = 120;

  // Mistakes deck: questions are keyed by a hash of their content, so sections and quizzes can reorder freely.
  function mistakeKey(q) {
    const s = [q.q].concat(q.options || [], q.steps || [], q.code != null ? [q.code] : []).join('\u0000');
    let h = 0x811c9dc5;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
    return (h >>> 0).toString(36);
  }
  const QINDEX = {};
  SECTIONS.forEach((s, si) => {
    s.exam.forEach((q) => { QINDEX[mistakeKey(q)] = { si, ti: null, q }; });
    s.topics.forEach((t, ti) => t.quiz.forEach((q) => { QINDEX[mistakeKey(q)] = { si, ti, q }; }));
  });

  // ---------- State & persistence ----------
  const LS_KEY = 'shipwright-academy.v1';
  const blank = () => ({ v: 1, xp: 0, topics: {}, exams: {}, days: [], badges: {}, reviews: 0, freeRoam: false, mistakes: {},
    mistakesCleared: 0, solved: { line: 0, order: 0 }, xpByDay: {}, updatedAt: 0 });
  // Older saves lack the newer fields; blank() fills them in.
  const load = (json) => { const s = Object.assign(blank(), JSON.parse(json)); s.solved = Object.assign({ line: 0, order: 0 }, s.solved); return s; };
  let state = blank();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = load(raw);
  } catch (e) { /* storage unavailable: start fresh */ }
  pruneMistakes();

  let remoteRef = null;
  let syncLabel = 'Saved in this browser';
  let pushTimer = null;
  let pushing = false;

  function save() {
    state.updatedAt = Date.now();
    try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
    if (remoteRef) {
      clearTimeout(pushTimer);
      pushTimer = setTimeout(pushRemote, 800);
    }
  }
  async function pushRemote() {
    if (!remoteRef) return;
    if (pushing) { pushTimer = setTimeout(pushRemote, 800); return; }
    pushing = true;
    try { await remoteRef.set({ json: JSON.stringify(state), updatedAt: state.updatedAt }); }
    catch (e) { syncLabel = 'Saved in this browser (account sync failed)'; renderStats(); }
    pushing = false;
  }
  (async function connect() {
    if (!window.claude || !window.claude.use) return;
    try {
      const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
      if (!db || !user) return;
      const id = await user.id();
      if (!id) return;
      remoteRef = db.collection('data/users/' + id).doc('progress');
      const snap = await remoteRef.get();
      const remote = snap.exists ? snap.data() : null;
      if (remote && remote.updatedAt > state.updatedAt) {
        state = load(remote.json);
        pruneMistakes();
        try { localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
        syncLabel = 'Synced to your account';
        if (!session) render();
        else renderStats();
      } else {
        syncLabel = 'Synced to your account';
        if (state.updatedAt > 0) pushRemote();
        renderStats();
      }
    } catch (e) { /* stay local */ }
  })();

  // ---------- Helpers ----------
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function md(s) {
    const parts = String(s).split(/(`[^`]+`)/g);
    return parts.map((p) => {
      if (/^`[^`]+`$/.test(p)) return '<code>' + esc(p.slice(1, -1)) + '</code>';
      return esc(p).replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    }).join('');
  }
  const today = (t) => { const d = new Date(t || Date.now()); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const key = (sid, tid) => sid + '/' + tid;
  const tstate = (sid, tid) => state.topics[key(sid, tid)] || {};
  const estate = (sid) => state.exams[sid] || {};
  const patternsOf = (t) => (t.lesson.find((b) => b.type === 'patterns') || {}).patterns || [];
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-3-1-5-3-7 0 4-4 7-4 13 0 4 3 7 7 7z"/></svg>',
    medal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="6"/><path d="M8.5 9.2 6 2h4l2 5 2-5h4l-2.5 7.2"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    gate: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/></svg>',
    undo: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 7v6h6"/><path d="M3 13a9 9 0 1 0 3-7.7L3 8"/></svg>',
    sheet: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h8M9 17h6"/></svg>',
    repeat: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 2l4 4-4 4"/><path d="M3 11V9a3 3 0 0 1 3-3h15"/><path d="M7 22l-4-4 4-4"/><path d="M21 13v2a3 3 0 0 1-3 3H3"/></svg>',
  };

  // ---------- Progress rules ----------
  function sectionUnlocked(si) {
    const prev = prevInTrack(si);
    if (state.freeRoam || prev < 0) return true;
    return !!estate(SECTIONS[prev].id).passed;
  }
  function topicUnlocked(si, ti) {
    if (state.freeRoam) return true;
    if (!sectionUnlocked(si)) return false;
    if (ti === 0) return true;
    const s = SECTIONS[si];
    return !!tstate(s.id, s.topics[ti - 1].id).passed;
  }
  function examUnlocked(si) {
    if (state.freeRoam) return true;
    const s = SECTIONS[si];
    return sectionUnlocked(si) && s.topics.every((t) => tstate(s.id, t.id).passed);
  }
  function reviewDue(sid, tid) {
    const t = tstate(sid, tid);
    if (!t.passed) return false;
    const stage = t.reviewStage || 0;
    if (stage >= REVIEW_DAYS.length) return false;
    return Date.now() - (t.lastPassAt || 0) >= REVIEW_DAYS[stage] * DAY;
  }
  function levelInfo(xp) {
    let i = 0;
    while (i + 1 < LEVELS.length && xp >= LEVELS[i + 1][0]) i++;
    const cur = LEVELS[i][0];
    const next = LEVELS[i + 1] ? LEVELS[i + 1][0] : null;
    return { n: i + 1, name: LEVELS[i][1], cur, next, pct: next ? (xp - cur) / (next - cur) : 1 };
  }
  function streak() {
    const set = new Set(state.days);
    let d = Date.now();
    if (!set.has(today(d))) d -= DAY;
    let n = 0;
    while (set.has(today(d))) { n++; d -= DAY; }
    return n;
  }
  // Activity heatmap: XP per local day. A day with a finished session (an xpByDay entry, even 0, or a `days` entry from older saves) is at least bucket 1.
  const heatLevel = (xp) => HEAT_STEPS.filter((x) => xp >= x).length;
  function recordXP(d, xp) {
    state.xpByDay[d] = (state.xpByDay[d] || 0) + xp;
    const now = new Date();
    const cutoff = today(new Date(now.getFullYear(), now.getMonth(), now.getDate() - (XP_DAYS_KEPT - 1)).getTime());
    Object.keys(state.xpByDay).forEach((k) => { if (k < cutoff) delete state.xpByDay[k]; });
  }
  // HEAT_WEEKS columns of Monday..Sunday, oldest first; the last column is the current week.
  function activity() {
    const now = new Date();
    const dow = (now.getDay() + 6) % 7;
    const days = new Set(state.days);
    const cells = [];
    for (let i = 0; i < HEAT_WEEKS * 7; i++) {
      const d = today(new Date(now.getFullYear(), now.getMonth(), now.getDate() - dow - (HEAT_WEEKS - 1) * 7 + i).getTime());
      const has = Object.prototype.hasOwnProperty.call(state.xpByDay, d);
      const xp = has ? state.xpByDay[d] : 0;
      cells.push({ d, xp, future: i > (HEAT_WEEKS - 1) * 7 + dow, level: has || days.has(d) ? Math.max(1, heatLevel(xp)) : 0 });
    }
    const week = cells.slice((HEAT_WEEKS - 1) * 7).reduce((a, c) => a + c.xp, 0);
    const best = Object.values(state.xpByDay).reduce((a, x) => Math.max(a, x), 0);
    return { cells, week, best, active: cells.filter((c) => c.level > 0).length };
  }
  function counts() {
    let topics = 0, passed = 0, exams = 0;
    SECTIONS.forEach((s) => {
      topics += s.topics.length;
      s.topics.forEach((t) => { if (tstate(s.id, t.id).passed) passed++; });
      if (estate(s.id).passed) exams++;
    });
    return { topics, passed, exams };
  }
  function nextStep() {
    for (let si = 0; si < SECTIONS.length; si++) {
      const s = SECTIONS[si];
      for (let ti = 0; ti < s.topics.length; ti++) {
        const t = s.topics[ti];
        if (!tstate(s.id, t.id).passed && topicUnlocked(si, ti)) return { kind: 'topic', si, ti };
      }
      if (!estate(s.id).passed && examUnlocked(si)) return { kind: 'exam', si };
    }
    for (let si = 0; si < SECTIONS.length; si++) {
      const s = SECTIONS[si];
      for (let ti = 0; ti < s.topics.length; ti++) if (reviewDue(s.id, s.topics[ti].id)) return { kind: 'review', si, ti };
    }
    return null;
  }

  // ---------- Mistakes deck ----------
  // Questions whose content is gone from the curriculum drop out silently.
  function pruneMistakes() {
    if (!SECTIONS.length) return;
    Object.keys(state.mistakes).forEach((k) => { if (!QINDEX[k]) delete state.mistakes[k]; });
  }
  function miss(k, sid, tid) {
    state.mistakes[k] = { section: sid, topic: tid, missedAt: Date.now(), streak: 0 };
  }
  // Oldest miss first.
  const mistakeDeck = () => Object.keys(state.mistakes).filter((k) => QINDEX[k])
    .sort((a, b) => state.mistakes[a].missedAt - state.mistakes[b].missedAt || (a < b ? -1 : 1));
  const originTitle = (si, ti) => SECTIONS[si].title + ' · ' + (ti === null ? 'Section exam' : SECTIONS[si].topics[ti].title);

  // ---------- Badges ----------
  // progress() gives [current, target] for the bar on locked badges (same targets as Badge.progress in ProgressStore.swift).
  const upTo = (cur, target) => [Math.min(cur, target), target];
  const trackExams = (name) => {
    const ss = SECTIONS.filter((s) => trackOf(s) === name);
    return [ss.filter((s) => estate(s.id).passed).length, ss.length];
  };
  let inboxZero = false;   // set by finish() for the session being scored
  const BADGES = [
    { id: 'first', name: 'First Commit', desc: 'Pass your first topic quiz.', test: () => counts().passed >= 1, progress: () => upTo(counts().passed, 1) },
    { id: 'flawless', name: 'Zero Defects', desc: 'Answer every question right on a topic quiz.', test: () => Object.values(state.topics).some((t) => t.perfect), progress: () => [0, 1] },
    { id: 'comeback', name: 'Root Caused', desc: 'Pass a quiz or exam you previously failed.', test: () => Object.values(state.topics).concat(Object.values(state.exams)).some((t) => t.passed && t.failedOnce), progress: () => [0, 1] },
    { id: 'boss', name: 'Gatekeeper', desc: 'Pass your first section exam.', test: () => counts().exams >= 1, progress: () => upTo(counts().exams, 1) },
    { id: 'streak3', name: 'On Call', desc: 'Study three days in a row.', test: () => streak() >= 3, progress: () => upTo(streak(), 3) },
    { id: 'streak7', name: 'Release Train', desc: 'Study seven days in a row.', test: () => streak() >= 7, progress: () => upTo(streak(), 7) },
    { id: 'review5', name: 'Spaced Out', desc: 'Complete five spaced reviews.', test: () => state.reviews >= 5, progress: () => upTo(state.reviews, 5) },
    { id: 'half', name: 'Halfway Merged', desc: 'Pass half of all topics.', test: () => { const c = counts(); return c.topics > 0 && c.passed >= c.topics / 2; }, progress: () => { const c = counts(); return upTo(c.passed, Math.ceil(c.topics / 2)); } },
    { id: 'mistakes10', name: 'Debugger', desc: 'Clear 10 questions from your mistakes deck.', test: () => state.mistakesCleared >= 10, progress: () => upTo(state.mistakesCleared, 10) },
    { id: 'mistakes50', name: 'Bug Bounty', desc: 'Clear 50 questions from your mistakes deck.', test: () => state.mistakesCleared >= 50, progress: () => upTo(state.mistakesCleared, 50) },
    { id: 'bugspot5', name: 'Spot the Bug', desc: 'Find the bug in five spot-the-bug questions.', test: () => state.solved.line >= 5, progress: () => upTo(state.solved.line, 5) },
    { id: 'order5', name: 'Pipeline Builder', desc: 'Put five sequences in the right order.', test: () => state.solved.order >= 5, progress: () => upTo(state.solved.order, 5) },
    { id: 'inboxzero', name: 'Inbox Zero', desc: 'Finish a spaced review with no other reviews due.', test: () => inboxZero, progress: () => [0, 1] },
  ].concat(SECTIONS.map((s) => ({ id: 'sec-' + s.id, name: s.title, desc: 'Pass the ' + s.title + ' section exam.', test: () => !!estate(s.id).passed,
    progress: () => upTo(s.topics.filter((t) => tstate(s.id, t.id).passed).length + (estate(s.id).passed ? 1 : 0), s.topics.length + 1) })))
   .concat([
     { id: 'track-software', name: 'Full Stack', desc: 'Pass every Software Engineering exam.', test: () => { const [n, of] = trackExams('Software Engineering'); return of > 0 && n === of; }, progress: () => trackExams('Software Engineering') },
     { id: 'track-games', name: 'Game Ready', desc: 'Pass every Game Development exam.', test: () => { const [n, of] = trackExams('Game Development'); return of > 0 && n === of; }, progress: () => trackExams('Game Development') },
     { id: 'all', name: 'Shipwright', desc: 'Pass every section exam.', test: () => SECTIONS.length > 0 && counts().exams === SECTIONS.length, progress: () => upTo(counts().exams, SECTIONS.length) },
   ]);

  function checkBadges() {
    const fresh = [];
    BADGES.forEach((b) => { if (!state.badges[b.id] && b.test()) { state.badges[b.id] = Date.now(); fresh.push(b); } });
    return fresh;
  }

  // ---------- Search ----------
  // Same rules as SearchRules in Search.swift (scripts/check-rules.js compares them).
  // Every query term must prefix a word of one entry; entries group by topic, best kind weight first.
  const SEARCH_MIN = 2;
  const SEARCH_SNIPPET = 160;
  const SEARCH_LEAD = 40;
  const SEARCH_PER_TOPIC = 3;
  const SEARCH_KINDS = {
    section: ['Section', 3], title: ['Title', 3], summary: ['Summary', 1],
    h: ['Heading', 2], keyPoint: ['Key point', 2], pattern: ['Pattern', 2],
    p: ['Paragraph', 1], list: ['List', 1], tip: ['Tip', 1], warn: ['Pitfall', 1], agent: ['With agents', 1], figure: ['Figure', 1],
  };
  const fold = (s) => String(s).normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  const words = (s) => fold(s).match(/[\p{L}\p{N}]+/gu) || [];
  const WORD = /[\p{L}\p{N}\p{M}]+/gu;
  const INDEX = [];
  SECTIONS.forEach((s, si) => {
    const add = (ti, kind, text, anchor) => {
      const t = String(text).replace(/\*\*|`/g, '');
      INDEX.push({ si, ti, kind, anchor, text: t, words: words(t), order: INDEX.length });
    };
    add(-1, 'section', s.title, 'sec-' + s.id);
    s.topics.forEach((t, ti) => {
      add(ti, 'title', t.title, null);
      add(ti, 'summary', t.summary, null);
      t.lesson.forEach((b, bi) => {
        const a = 'blk-' + bi;
        if (b.type === 'h' || b.type === 'p') add(ti, b.type, b.text, a);
        else if (b.type === 'list') b.items.forEach((i) => add(ti, 'list', i, a));
        else if (b.type === 'callout') add(ti, SEARCH_KINDS[b.kind] ? b.kind : 'tip', b.text, a);
        else if (b.type === 'figure' || b.type === 'interactive') add(ti, 'figure', b.caption, a);
        else if (b.type === 'patterns') b.patterns.forEach((p) => add(ti, 'pattern', [p.signal, p.use, p.why].join(' · '), a));
      });
      t.keyPoints.forEach((k, ki) => add(ti, 'keyPoint', k, 'kp-' + ki));
    });
  });
  const weight = (e) => SEARCH_KINDS[e.kind][1];
  function search(q) {
    const terms = [...new Set(words(q))];
    if (terms.join('').length < SEARCH_MIN) return null;
    const groups = new Map();
    INDEX.forEach((e) => {
      if (!terms.every((t) => e.words.some((w) => w.startsWith(t)))) return;
      const k = e.si + '/' + e.ti;
      if (!groups.has(k)) groups.set(k, { si: e.si, ti: e.ti, hits: [], score: 0, order: e.order });
      const g = groups.get(k);
      g.hits.push(e);
      g.score = Math.max(g.score, weight(e));
    });
    const list = [...groups.values()];
    list.forEach((g) => g.hits.sort((a, b) => weight(b) - weight(a) || a.order - b.order));
    list.sort((a, b) => b.score - a.score || b.hits.length - a.hits.length || a.order - b.order);
    return { terms, groups: list };
  }
  function snippet(text, terms) {
    const hit = (w) => { const f = fold(w); return terms.some((t) => f.startsWith(t)); };
    let s = 0, e = text.length;
    if (e > SEARCH_SNIPPET) {
      let pos = 0;
      for (const m of text.matchAll(WORD)) if (hit(m[0])) { pos = m.index; break; }
      s = Math.max(0, pos - SEARCH_LEAD);
      if (s > 0) { const sp = text.indexOf(' ', s); if (sp >= 0 && sp < pos) s = sp + 1; }
      e = Math.min(text.length, s + SEARCH_SNIPPET);
      if (e < text.length) { const sp = text.lastIndexOf(' ', e); if (sp > pos) e = sp; }
    }
    const part = text.slice(s, e);
    let out = '', last = 0;
    for (const m of part.matchAll(WORD)) {
      if (!hit(m[0])) continue;
      out += esc(part.slice(last, m.index)) + '<mark>' + esc(m[0]) + '</mark>';
      last = m.index + m[0].length;
    }
    return (s > 0 ? '…' : '') + out + esc(part.slice(last)) + (e < text.length ? '…' : '');
  }

  // ---------- UI chrome ----------
  function toast(html) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = html;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 4200);
  }
  function renderStats() {
    const L = levelInfo(state.xp);
    const st = streak();
    const earned = Object.keys(state.badges).length;
    const deck = mistakeDeck().length;
    $('#stats').innerHTML =
      '<div class="lvl" title="' + esc(syncLabel) + '"><div class="lvl-top"><span>Lv ' + L.n + ' <b>' + esc(L.name) + '</b></span><span>' + state.xp + (L.next ? ' / ' + L.next : '') + ' XP</span></div>' +
      '<div class="meter"><i style="width:' + Math.round(L.pct * 100) + '%"></i></div></div>' +
      '<span class="stat" title="Day streak">' + ICON.flame + '<b>' + st + '</b><span class="hide-sm">day' + (st === 1 ? '' : 's') + '</span></span>' +
      (deck ? '<button class="icon-btn" type="button" data-action="mistakes" title="Review mistakes">' + ICON.undo + '<b>' + deck + '</b><span class="hide-sm">mistake' + (deck === 1 ? '' : 's') + '</span></button>' : '') +
      '<button class="icon-btn" type="button" data-action="badges">' + ICON.medal + '<b>' + earned + '</b><span class="hide-sm">/ ' + BADGES.length + '</span></button>';
  }

  // big: the level-up burst, with more pieces from three points that fall for longer.
  function confetti(big) {
    if (reduced) return;
    const c = $('#confetti');
    c.hidden = false;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = ['--accent', '--xp', '--ok'].map((v) => css.getPropertyValue(v).trim());
    const ps = Array.from({ length: big ? 280 : 110 }, (_, i) => ({
      x: innerWidth * (big ? [0.5, 0.2, 0.8][i % 3] : 0.5) + (Math.random() - 0.5) * 120, y: innerHeight * (big ? 0.45 : 0.38),
      vx: (Math.random() - 0.5) * (big ? 16 : 12), vy: -Math.random() * (big ? 16 : 12) - 4,
      w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => { p.vy += big ? 0.28 : 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (t - t0 < (big ? 3400 : 1800)) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); c.hidden = true; }
    })(t0);
  }

  // ---------- Views ----------
  let view = { name: 'home' };
  let session = null;
  const app = $('#app');

  function go(v) {
    view = v; session = v.name === 'quiz' ? session : null; render(); window.scrollTo(0, 0);
    const el = v.anchor && document.getElementById(v.anchor);
    if (el) { el.scrollIntoView({ block: 'center' }); el.classList.add('hit-flash'); }
  }

  function render() {
    renderStats();
    if (!SECTIONS.length) { app.innerHTML = '<div class="empty">The course content did not load. Reload the page to try again.</div>'; return; }
    if (view.name === 'home') return renderHome();
    if (view.name === 'topic') return renderTopic(view.si, view.ti);
    if (view.name === 'quiz') return renderQuiz();
    if (view.name === 'result') return renderResult();
    if (view.name === 'badges') return renderBadges();
    if (view.name === 'search') return renderSearch();
    if (view.name === 'cheat') return renderCheat(view.si);
  }

  function renderHome() {
    const c = counts();
    const nx = nextStep();
    let next = '';
    if (nx) {
      const s = SECTIONS[nx.si];
      if (nx.kind === 'exam') {
        next = '<span class="eyebrow">Up next · Section exam</span><h2>' + esc(s.title) + ' exam</h2><p>Covers every topic in the section. Score ' + Math.round(EXAM_PASS * 100) + '% or more to unlock the next section.</p>' +
          '<div class="btn-row"><button class="btn btn-primary" data-action="exam" data-si="' + nx.si + '">Start the exam</button></div>';
      } else {
        const t = s.topics[nx.ti];
        next = '<span class="eyebrow">' + (nx.kind === 'review' ? 'Review due · ' : 'Up next · ') + esc(s.title) + '</span><h2>' + esc(t.title) + '</h2><p>' + md(t.summary) + '</p>' +
          '<div class="btn-row"><button class="btn btn-primary" data-action="topic" data-si="' + nx.si + '" data-ti="' + nx.ti + '">' + (nx.kind === 'review' ? 'Review topic' : (tstate(s.id, t.id).attempts ? 'Continue' : 'Start lesson')) + '</button>' +
          (nx.kind === 'review' ? '<button class="btn btn-ghost" data-action="quiz" data-si="' + nx.si + '" data-ti="' + nx.ti + '">Straight to quiz</button>' : '') + '</div>';
      }
    } else {
      next = '<span class="eyebrow">Path complete</span><h2>Every exam passed</h2><p>Keep the knowledge fresh: topics come back for review after 3, 7, 21 and 60 days.</p>';
    }

    let html = '<section class="hero"><div class="hero-copy"><span class="eyebrow">From first principles to shipping with agents</span>' +
      '<h1>Learn to think, build, ship and maintain software</h1>' +
      '<p>' + SECTIONS.length + ' sections and ' + c.topics + ' topics, from how computers work to directing AI agents and building games in Unity. Each topic ends in a quiz you must pass to move on. Each section ends in an exam. Score below the bar and you retake it.</p></div>' +
      '<div class="next-card">' + next + '</div></section>';

    html += '<div class="kpis">' +
      '<div class="kpi"><b>' + c.passed + '<span style="font-size:15px;color:var(--ink-3)"> / ' + c.topics + '</span></b><span>Topics passed</span></div>' +
      '<div class="kpi"><b>' + c.exams + '<span style="font-size:15px;color:var(--ink-3)"> / ' + SECTIONS.length + '</span></b><span>Section exams</span></div>' +
      '<div class="kpi"><b>' + state.xp + '</b><span>Total XP</span></div>' +
      '<div class="kpi"><b>' + streak() + '</b><span>Day streak</span></div></div>';
    const deck = mistakeDeck().length;
    if (deck) html += '<div class="mistakes-bar"><span>' + ICON.undo + '<span><b>' + deck + (deck === 1 ? ' question' : ' questions') + '</b> in your mistakes deck. Answer each right ' + MISTAKE_CLEAR_STREAK + ' times in a row to clear it.</span></span>' +
      '<button class="btn btn-ghost" data-action="mistakes">Review mistakes</button></div>';
    html += renderHeat();

    SECTIONS.forEach((s, si) => {
      const open = sectionUnlocked(si);
      const done = s.topics.filter((t) => tstate(s.id, t.id).passed).length;
      const ex = estate(s.id);
      const n = TRACKS.find((t) => t.sections.includes(si)).sections.indexOf(si);
      if (n === 0 && TRACKS.length > 1) html += '<h2 class="track-title">' + esc(trackOf(s)) + '</h2>';
      html += '<section class="section" id="sec-' + esc(s.id) + '"><div class="sec-head"><div><span class="eyebrow">Section ' + (n + 1) + '</span><h2>' + esc(s.title) + '</h2><p>' + md(s.tagline) + '</p></div>' +
        '<div class="sec-meta"><span>' + done + ' / ' + s.topics.length + '</span><div class="meter sec-meter"><i style="width:' + Math.round(done / s.topics.length * 100) + '%"></i></div>' +
        (ex.passed ? '<span class="pill pill-ok">' + ICON.check + ' Exam ' + ex.best + '%</span>' : '') +
        '<button class="icon-btn" type="button" data-action="cheat" data-si="' + si + '">' + ICON.sheet + 'Cheat sheet</button></div></div>';
      if (!open) html += '<div class="locked-note">' + ICON.lock + ' Pass the ' + esc(SECTIONS[prevInTrack(si)].title) + ' exam to unlock this section.</div>';
      html += '<ol class="route">';
      s.topics.forEach((t, ti) => {
        const ts = tstate(s.id, t.id);
        const un = topicUnlocked(si, ti);
        const due = reviewDue(s.id, t.id);
        const cls = ts.passed ? 'done' : (un ? 'open' : '');
        let side = '<span>' + t.minutes + ' min</span>';
        if (ts.passed) side = (due ? '<span class="pill pill-acc">' + ICON.repeat + ' Review due</span>' : '<span class="pill pill-ok">' + ts.best + ' / ' + ts.total + '</span>') + '<span>' + t.minutes + ' min</span>';
        else if (ts.attempts) side = '<span class="pill pill-bad">Best ' + ts.best + ' / ' + ts.total + '</span><span>Retry</span>';
        html += '<li><button type="button" class="station ' + cls + '" ' + (un ? 'data-action="topic" data-si="' + si + '" data-ti="' + ti + '"' : 'aria-disabled="true"') + '>' +
          '<span class="node">' + (ts.passed ? ICON.check : (un ? ti + 1 : ICON.lock)) + '</span>' +
          '<span class="st-body"><span class="st-title">' + esc(t.title) + '</span><span class="st-sub">' + md(t.summary) + '</span></span>' +
          '<span class="st-side">' + side + '</span></button></li>';
      });
      const eu = examUnlocked(si);
      let eside = '<span>' + (s.exam.length + s.topics.length) + ' questions</span>';
      if (ex.passed) eside = '<span class="pill pill-ok">Passed ' + ex.best + '%</span><span>Retake anytime</span>';
      else if (ex.attempts) eside = '<span class="pill pill-bad">Best ' + ex.best + '%</span><span>Retake required</span>';
      html += '<li><button type="button" class="station exam ' + (ex.passed ? 'done' : (eu ? 'open' : '')) + '" ' + (eu ? 'data-action="exam" data-si="' + si + '"' : 'aria-disabled="true"') + '>' +
        '<span class="node">' + (ex.passed ? ICON.check : (eu ? ICON.gate : ICON.lock)) + '</span>' +
        '<span class="st-body"><span class="st-title">Section exam</span><span class="st-sub">' + (eu || ex.passed ? 'Covers the whole section. Pass mark ' + Math.round(EXAM_PASS * 100) + '%.' : 'Unlocks when every topic above is passed.') + '</span></span>' +
        '<span class="st-side">' + eside + '</span></button></li></ol></section>';
    });
    app.innerHTML = html;
  }

  function renderHeat() {
    const a = activity();
    const label = (d) => new Date(d + 'T00:00').toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    const cells = a.cells.map((c) => c.future ? '<i class="heat-cell" data-l="none"></i>'
      : '<i class="heat-cell" data-l="' + c.level + '" title="' + esc(label(c.d)) + ': ' + c.xp + ' XP"></i>').join('');
    const summary = 'Activity over the last ' + HEAT_WEEKS + ' weeks: ' + a.active + ' active day' + (a.active === 1 ? '' : 's') + ', ' + a.week + ' XP this week, best day ' + a.best + ' XP.';
    return '<section class="heat"><div class="heat-head"><h2>Activity</h2><span>Last ' + HEAT_WEEKS + ' weeks</span></div>' +
      '<div class="heat-body"><div class="heat-days" aria-hidden="true"><span>Mon</span><span></span><span>Wed</span><span></span><span>Fri</span><span></span><span></span></div>' +
      '<div class="heat-grid" role="img" aria-label="' + esc(summary) + '">' + cells + '</div>' +
      '<div class="heat-stats"><span>This week: <b>' + a.week + ' XP</b></span><span>Best day: <b>' + a.best + ' XP</b></span>' +
      '<span class="heat-key" aria-hidden="true">Less' + [0, 1, 2, 3, 4].map((l) => '<i class="heat-cell" data-l="' + l + '"></i>').join('') + 'More</span></div></div></section>';
  }

  // ---------- Interactive figures (content/INTERACTIVE.md) ----------
  // Sandboxed without allow-same-origin, so the frame cannot read the page: it gets the theme as values, by srcdoc and postMessage.
  const FIG_VARS = ['ink', 'muted', 'line', 'bg', 'panel', 'accent', 'accent2', 'ok', 'bad', 'warn'];
  const INTERACTIVE_CSP = "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:";
  const INTERACTIVE_BASE = 'html,body{margin:0;height:100%;overflow:hidden;background:transparent;color:var(--fig-ink)}' +
    'body{font-size:14px;line-height:1.4;-webkit-user-select:none;user-select:none}' +
    'button{font:inherit;color:var(--fig-ink);background:var(--fig-panel);border:1px solid var(--fig-line);border-radius:8px;padding:4px 12px;cursor:pointer}' +
    'input{accent-color:var(--fig-accent)}:focus-visible{outline:2px solid var(--fig-accent);outline-offset:2px}' +
    '@media (prefers-reduced-motion: reduce){*{animation:none!important;transition:none!important}}';
  function figTheme() {
    const cs = getComputedStyle(document.documentElement);
    return FIG_VARS.map((k) => '--fig-' + k + ':' + cs.getPropertyValue('--fig-' + k).trim()).join(';') +
      ';color-scheme:' + (cs.getPropertyValue('color-scheme').trim() === 'dark' ? 'dark' : 'light') + ';font-family:' + getComputedStyle(document.body).fontFamily;
  }
  function interactiveDoc(b) {
    return '<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="' + INTERACTIVE_CSP + '">' +
      '<style id="fig-theme">:root{' + figTheme() + '}</style><style>' + INTERACTIVE_BASE + '</style>' +
      '<script>addEventListener("message",function(e){if(e.source===parent&&e.data&&typeof e.data.figTheme==="string")document.getElementById("fig-theme").textContent=":root{"+e.data.figTheme+"}"})<\/script>' +
      '</head><body>' + b.html + '</body></html>';
  }
  const retheme = (f) => f.contentWindow && f.contentWindow.postMessage({ figTheme: figTheme() }, '*');
  const rethemeAll = () => document.querySelectorAll('iframe.ia-frame').forEach(retheme);
  document.addEventListener('load', (e) => { if (e.target.classList && e.target.classList.contains('ia-frame')) retheme(e.target); }, true);
  if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', rethemeAll);
  new MutationObserver(rethemeAll).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] });

  function renderTopic(si, ti) {
    const s = SECTIONS[si], t = s.topics[ti];
    const ts = tstate(s.id, t.id);
    const blocks = t.lesson.map((b, bi) => {
      const at = ' id="blk-' + bi + '"';
      if (b.type === 'h') return '<h3' + at + '>' + md(b.text) + '</h3>';
      // Figure SVG is curriculum content checked by scripts/validate-content.js (no scripts, handlers or external refs).
      if (b.type === 'figure') return '<figure class="fig"' + at + '><div class="fig-art">' + b.svg + '</div><figcaption>' + md(b.caption) + '</figcaption></figure>';
      if (b.type === 'interactive') return '<figure class="fig"' + at + '><div class="fig-art fig-ia"><iframe class="ia-frame" sandbox="allow-scripts" title="' + esc(b.caption) + '" style="height:' + Math.min(520, Math.max(200, b.height | 0)) + 'px" srcdoc="' + esc(interactiveDoc(b)) + '"></iframe></div><figcaption>' + md(b.caption) + '</figcaption></figure>';
      if (b.type === 'patterns') return '<section class="patterns"' + at + '><h3>Patterns</h3><p class="pat-hint">When you notice the signal, reach for the move.</p><ol>' +
        b.patterns.map((p) => '<li class="pat"><span class="pat-k">When</span><p class="pat-signal">' + md(p.signal) + '</p><span class="pat-k">Use</span><p class="pat-use">' + md(p.use) + '</p><p class="pat-why">' + md(p.why) + '</p></li>').join('') + '</ol></section>';
      if (b.type === 'list') return '<ul' + at + '>' + b.items.map((i) => '<li>' + md(i) + '</li>').join('') + '</ul>';
      if (b.type === 'code') return '<pre' + at + ' data-lang="' + esc(b.lang || '') + '"><code>' + esc(b.text) + '</code></pre>';
      if (b.type === 'callout') {
        const label = { tip: 'Tip', warn: 'Pitfall', agent: 'With agents' }[b.kind] || 'Note';
        return '<div' + at + ' class="callout callout-' + esc(b.kind) + '"><span class="c-label">' + label + '</span><div>' + md(b.text) + '</div></div>';
      }
      return '<p' + at + '>' + md(b.text) + '</p>';
    }).join('');
    const status = ts.passed ? '<span class="pill pill-ok">' + ICON.check + ' Passed ' + ts.best + ' / ' + ts.total + '</span>' : (ts.attempts ? '<span class="pill pill-bad">Not passed yet</span>' : '');
    const due = reviewDue(s.id, t.id) ? '<span class="pill pill-acc">' + ICON.repeat + ' Review due · +20 XP</span>' : '';
    const prev = ti > 0 ? { si, ti: ti - 1 } : null;
    app.innerHTML = '<div class="narrow">' +
      '<nav class="crumbs"><button type="button" data-action="home">Path</button><span>/</span><span>' + esc(s.title) + '</span><span>/</span><span>Topic ' + (ti + 1) + ' of ' + s.topics.length + '</span></nav>' +
      '<header class="lesson-head"><h1>' + esc(t.title) + '</h1><p>' + md(t.summary) + '</p><div class="meta-row"><span class="pill pill-mute">' + t.minutes + ' min read</span><span class="pill pill-mute">' + t.quiz.length + '-question quiz</span>' + status + due + '</div></header>' +
      '<article class="prose">' + blocks + '</article>' +
      '<aside class="keypoints"><h3>Key points</h3><ul>' + t.keyPoints.map((k, ki) => '<li id="kp-' + ki + '">' + md(k) + '</li>').join('') + '</ul></aside>' +
      '<div class="lesson-cta"><p>Score ' + Math.ceil(TOPIC_PASS * t.quiz.length) + ' of ' + t.quiz.length + ' to pass' + (ts.passed ? '. Retaking can raise your best score.' : ' and unlock the next topic.') + '</p>' +
      '<div class="btn-row">' + (prev ? '<button class="btn btn-ghost" data-action="topic" data-si="' + prev.si + '" data-ti="' + prev.ti + '">Previous topic</button>' : '') +
      '<button class="btn btn-primary" data-action="quiz" data-si="' + si + '" data-ti="' + ti + '">' + (ts.attempts ? 'Retake the quiz' : 'Take the quiz') + '</button></div></div></div>';
  }

  // Question kinds (README "Questions"): mc (options + answer, optional code), order (steps), line (code + answer line).
  // session.picked holds the learner's answer: an option index (mc), a line index (line) or an arrangement of step indexes (order).
  const kindOf = (q) => q.kind || 'mc';
  const codeLines = (q) => String(q.code || '').split('\n');
  function scrambled(n) {
    const sorted = [...Array(n).keys()];
    if (n < 2) return sorted;
    let o;
    do o = shuffle(sorted); while (o.every((v, i) => v === i));
    return o;
  }
  function makeQ(q, src) {
    const kind = kindOf(q);
    const order = kind === 'mc' ? shuffle(q.options.map((_, i) => i)) : kind === 'order' ? scrambled(q.steps.length) : [];
    return { kind, q: q.q, options: q.options, answer: q.answer, steps: q.steps, code: q.code, lang: q.lang, explain: q.explain, src, k: mistakeKey(q), order };
  }
  const firstPick = (q) => (q.kind === 'order' ? q.order.slice() : null);
  const isRight = (q, picked) => (q.kind === 'order' ? picked.every((v, i) => v === i) : picked === q.answer);
  function startQuiz(si, ti) {
    const s = SECTIONS[si], t = s.topics[ti];
    session = { kind: 'topic', si, ti, review: reviewDue(s.id, t.id), qs: shuffle(t.quiz).map((q) => makeQ(q, ti)), i: 0, checked: false, answers: [] };
    session.picked = firstPick(session.qs[0]);
    view = { name: 'quiz' }; render(); window.scrollTo(0, 0);
  }
  function startExam(si) {
    const s = SECTIONS[si];
    const fromTopics = s.topics.map((t, ti) => makeQ(t.quiz[Math.floor(Math.random() * t.quiz.length)], ti));
    session = { kind: 'exam', si, qs: shuffle(s.exam.map((q) => makeQ(q, null)).concat(fromTopics)), i: 0, checked: false, answers: [] };
    session.picked = firstPick(session.qs[0]);
    view = { name: 'quiz' }; render(); window.scrollTo(0, 0);
  }

  function startMistakes() {
    const qs = mistakeDeck().slice(0, MISTAKE_SESSION).map((k) => Object.assign(makeQ(QINDEX[k].q, QINDEX[k].ti), { si: QINDEX[k].si }));
    if (!qs.length) return go({ name: 'home' });
    session = { kind: 'mistakes', si: qs[0].si, qs, i: 0, picked: firstPick(qs[0]), checked: false, answers: [] };
    view = { name: 'quiz' }; render(); window.scrollTo(0, 0);
  }

  function renderQuiz() {
    const S = session, s = SECTIONS[S.si];
    const q = S.qs[S.i];
    const title = S.kind === 'mistakes' ? 'Mistakes · ' + originTitle(q.si, q.src) : S.kind === 'exam' ? s.title + ' · Section exam' : s.topics[S.ti].title;
    const pips = S.qs.map((_, i) => {
      const a = S.answers[i];
      return '<span class="pip ' + (a ? (a.correct ? 'ok' : 'bad') : (i === S.i ? 'cur' : '')) + '"></span>';
    }).join('');
    const letters = 'ABCDE';
    const mark = (i) => (S.checked ? (i === q.answer ? 'right' : (i === S.picked ? 'wrong' : '')) : (i === S.picked ? 'sel' : ''));
    let opts;
    if (q.kind === 'order') {
      opts = '<ol class="steps" aria-label="Steps, top to bottom">' + S.picked.map((orig, pos) => '<li class="step ' + (S.checked ? (orig === pos ? 'right' : 'wrong') : '') + '"><span class="key">' + (pos + 1) + '</span><span>' + md(q.steps[orig]) + '</span>' +
        (S.checked ? '' : '<span class="mv"><button type="button" data-action="up" data-p="' + pos + '" aria-label="Move up"' + (pos === 0 ? ' disabled' : '') + '>&uarr;</button>' +
          '<button type="button" data-action="down" data-p="' + pos + '" aria-label="Move down"' + (pos === S.picked.length - 1 ? ' disabled' : '') + '>&darr;</button></span>') + '</li>').join('') + '</ol>';
    } else if (q.kind === 'line') {
      opts = codeBlock(q, (line, i) => '<button type="button" class="cl ' + mark(i) + '" data-action="pick" data-o="' + i + '" aria-label="Line ' + (i + 1) + '"' + (S.checked ? ' disabled' : '') + '>' + line + '</button>');
    } else {
      opts = (q.code ? codeBlock(q) : '') + '<div class="opts" role="group" aria-label="Answers">' + q.order.map((orig, pos) =>
        '<button type="button" class="opt ' + mark(orig) + '" data-action="pick" data-o="' + orig + '"' + (S.checked ? ' disabled' : '') + '><span class="key">' + letters[pos] + '</span><span>' + md(q.options[orig]) + '</span></button>').join('') + '</div>';
    }
    let fb = '';
    if (S.checked) {
      const ok = S.answers[S.i].correct;
      let fix = '';
      if (!ok && q.kind === 'line') fix = '<p>The bug is on line ' + (q.answer + 1) + '.</p>';
      if (!ok && q.kind === 'order') fix = '<p>Correct order:</p><ol>' + q.steps.map((x) => '<li>' + md(x) + '</li>').join('') + '</ol>';
      fb = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? 'Correct' : 'Not quite') + '</b>' + fix + md(q.explain) + '</div>';
    }
    const hint = q.kind === 'order' ? 'Use the arrows to put the steps in order, then Enter to check'
      : q.kind === 'line' ? 'Click the line with the bug (keys 1–' + Math.min(9, codeLines(q).length) + '), Enter to continue'
      : 'Keys: 1–' + q.options.length + ' to choose, Enter to continue';
    const last = S.i === S.qs.length - 1;
    app.innerHTML = '<div class="narrow">' +
      '<nav class="crumbs"><button type="button" data-action="quit">Leave ' + ({ exam: 'exam', mistakes: 'review' }[S.kind] || 'quiz') + '</button><span>·</span><span>Progress is not saved until you finish</span></nav>' +
      '<div class="quiz-top"><h1>' + esc(title) + '</h1><span class="pill pill-mute">Question ' + (S.i + 1) + ' of ' + S.qs.length + '</span></div>' +
      '<div class="pips">' + pips + '</div>' +
      '<div class="qcard"><h2>' + md(q.q) + '</h2>' + opts + fb +
      '<div class="quiz-actions">' + (S.checked
        ? '<button class="btn btn-primary" data-action="next">' + (last ? 'See results' : 'Next question') + '</button>'
        : '<button class="btn btn-primary" data-action="check"' + (S.picked === null ? ' disabled' : '') + '>Check answer</button>') + '</div>' +
      '<div class="hint">' + hint + '</div></div></div>';
  }
  // Numbered code lines; `wrap(lineHtml, i)` turns each line into a pickable element.
  function codeBlock(q, wrap) {
    const lines = codeLines(q).map((l, i) => {
      const html = '<span class="ln">' + (i + 1) + '</span><code>' + (esc(l) || ' ') + '</code>';
      return wrap ? wrap(html, i) : '<span class="cl">' + html + '</span>';
    });
    return '<pre class="qcode"' + (q.lang ? ' data-lang="' + esc(q.lang) + '"' : '') + (wrap ? ' role="group" aria-label="Code lines"' : '') + '>' + lines.join('') + '</pre>';
  }

  function finish() {
    const S = session, s = SECTIONS[S.si];
    const correct = S.answers.filter((a) => a.correct).length;
    const total = S.qs.length;
    const pct = Math.round(correct / total * 100);
    const gains = [];
    const now = Date.now();
    let passed, cleared = [];
    if (S.kind !== 'mistakes') S.answers.forEach((a, i) => { if (!a.correct) miss(S.qs[i].k, s.id, S.qs[i].src === null ? 'exam' : s.topics[S.qs[i].src].id); });
    if (S.kind === 'topic') {
      const t = s.topics[S.ti];
      const k = key(s.id, t.id);
      const ts = state.topics[k] = Object.assign({ best: 0, total, attempts: 0 }, state.topics[k]);
      passed = correct / total >= TOPIC_PASS;
      ts.attempts++;
      ts.total = total;
      if (correct > ts.best) { gains.push(['Improved score', (correct - ts.best) * 10]); ts.best = correct; }
      if (passed && !ts.passed) { gains.push(['Topic passed', 50]); ts.passed = true; ts.firstPassAt = now; ts.lastPassAt = now; ts.reviewStage = 0; }
      else if (passed && S.review) { gains.push(['Spaced review', 20]); ts.reviewStage = (ts.reviewStage || 0) + 1; ts.lastPassAt = now; state.reviews++; }
      if (correct === total && !ts.perfect) { gains.push(['Perfect score', 25]); ts.perfect = true; }
      if (!passed) ts.failedOnce = true;
    } else if (S.kind === 'exam') {
      const es = state.exams[s.id] = Object.assign({ best: 0, attempts: 0 }, state.exams[s.id]);
      passed = correct / total >= EXAM_PASS;
      es.attempts++;
      if (pct > es.best) es.best = pct;
      if (passed && !es.passed) { gains.push(['Section exam passed', 250]); es.passed = true; es.passedAt = now; }
      if (correct === total && !es.perfect) { gains.push(['Flawless exam', 100]); es.perfect = true; }
      if (!passed) es.failedOnce = true;
    } else {
      S.qs.forEach((q, i) => {
        const m = state.mistakes[q.k];
        if (!m) return;
        if (!S.answers[i].correct) { m.streak = 0; m.missedAt = now; }
        else if (++m.streak >= MISTAKE_CLEAR_STREAK) { delete state.mistakes[q.k]; cleared.push(i); }
      });
      const n = cleared.length;
      if (n) { gains.push(['Mistake cleared', n * 15]); state.mistakesCleared = (state.mistakesCleared || 0) + n; }
      passed = n > 0;
    }
    S.answers.forEach((a, i) => { const k = S.qs[i].kind; if (a.correct && (k === 'line' || k === 'order')) state.solved[k]++; });
    // Inbox Zero: a passed spaced review that leaves no topic with a review due.
    inboxZero = gains.some((g) => g[0] === 'Spaced review') && !SECTIONS.some((x) => x.topics.some((t) => reviewDue(x.id, t.id)));
    const xp = gains.reduce((a, g) => a + g[1], 0);
    const lvBefore = levelInfo(state.xp).n;
    state.xp += xp;
    const d = today();
    if (!state.days.includes(d)) { state.days.push(d); state.days = state.days.slice(-120); }
    recordXP(d, xp);
    const fresh = checkBadges();
    inboxZero = false;
    save();
    const lvAfter = levelInfo(state.xp);
    const levelUp = lvAfter.n > lvBefore ? lvAfter : null;
    view = { name: 'result', data: { kind: S.kind, si: S.si, ti: S.ti, correct, total, pct, passed, gains, cleared, qs: S.qs, answers: S.answers, levelUp } };
    session = null;
    render();
    window.scrollTo(0, 0);
    if (levelUp) confetti(true);
    else if (passed && S.kind !== 'mistakes') confetti();
    fresh.forEach((b, i) => setTimeout(() => toast('<span class="seal">' + ICON.medal + '</span><span>Badge earned: <b>' + esc(b.name) + '</b></span>'), 400 + i * 500));
  }

  function renderResult() {
    const r = view.data, s = SECTIONS[r.si];
    const passMark = r.kind === 'exam' ? EXAM_PASS : TOPIC_PASS;
    const C = 2 * Math.PI * 60;
    const color = r.kind === 'mistakes' ? 'var(--accent)' : r.passed ? 'var(--ok)' : 'var(--bad)';
    const ring = '<div class="score-ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="none" stroke="var(--rule)" stroke-width="12"/>' +
      '<circle cx="70" cy="70" r="60" fill="none" stroke="' + color + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * r.pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="v">' + r.pct + '%</span></div>';
    const L = r.levelUp;
    const levelCard = L ? '<div class="level-up" role="status"><span class="seal">' + ICON.medal + '</span><div><span class="eyebrow">Level up</span><b>Level ' + L.n + ' · ' + esc(L.name) + '</b>' +
      '<span>' + (L.next ? (L.next - state.xp) + ' XP to ' + esc(LEVELS[L.n][1]) : 'Top level reached') + '</span></div></div>' : '';
    const what = r.kind === 'exam' ? s.title + ' exam' : r.kind === 'mistakes' ? 'Mistakes review' : s.topics[r.ti].title;
    let headline, body;
    if (r.kind === 'mistakes') {
      const left = mistakeDeck().length, n = r.cleared.length;
      headline = n ? 'Cleared ' + n + (n === 1 ? ' mistake' : ' mistakes') : 'Mistakes reviewed';
      body = 'You answered ' + r.correct + ' of ' + r.total + ' right. A question leaves the deck after ' + MISTAKE_CLEAR_STREAK + ' right answers in a row here. ' + (left ? left + ' left in your deck.' : 'Your deck is empty.');
    } else if (r.passed) {
      headline = r.kind === 'exam' ? 'Section cleared' : 'Topic passed';
      body = 'You scored ' + r.correct + ' of ' + r.total + ' on ' + esc(what) + '.' + (r.kind === 'exam' && nextInTrack(r.si) >= 0 ? ' ' + esc(SECTIONS[nextInTrack(r.si)].title) + ' is now open.' : '');
    } else {
      headline = 'Retake required';
      body = 'You scored ' + r.correct + ' of ' + r.total + '. The pass mark is ' + Math.round(passMark * 100) + '%. Review the explanations below, revisit the material, then try again. Questions and answer order are reshuffled each attempt.';
    }
    const gains = r.gains.length ? '<div class="xp-gain">' + r.gains.map((g) => '<span class="pill pill-xp">+' + g[1] + ' XP · ' + esc(g[0]) + '</span>').join('') + '</div>' : '<div class="xp-gain"><span class="pill pill-mute">No new XP this attempt</span></div>';

    let weak = '';
    if (r.cleared && r.cleared.length) weak = '<div class="weak cleared"><h3>Cleared from your deck</h3><ul>' + r.cleared.map((i) => '<li>' + md(r.qs[i].q) + '</li>').join('') + '</ul></div>';
    if (r.kind === 'exam' && !r.passed) {
      const missed = {};
      r.answers.forEach((a, i) => { if (!a.correct && r.qs[i].src !== null) missed[r.qs[i].src] = true; });
      const ids = Object.keys(missed).map(Number);
      if (ids.length) weak = '<div class="weak"><h3>Topics to revisit</h3><div class="btn-row">' + ids.map((ti) => '<button class="btn btn-ghost" data-action="topic" data-si="' + r.si + '" data-ti="' + ti + '">' + esc(s.topics[ti].title) + '</button>').join('') + '</div></div>';
    }
    const actions = [];
    if (r.kind === 'mistakes') { if (mistakeDeck().length) actions.push('<button class="btn btn-primary" data-action="mistakes">Review more mistakes</button>'); }
    else if (!r.passed) actions.push(r.kind === 'exam' ? '<button class="btn btn-primary" data-action="exam" data-si="' + r.si + '">Retake exam</button>' : '<button class="btn btn-primary" data-action="quiz" data-si="' + r.si + '" data-ti="' + r.ti + '">Retake quiz</button>');
    if (!r.passed && r.kind === 'topic') actions.push('<button class="btn btn-ghost" data-action="topic" data-si="' + r.si + '" data-ti="' + r.ti + '">Reread the lesson</button>');
    if (r.passed && r.kind !== 'mistakes') {
      const nx = nextStep();
      if (nx && nx.kind === 'exam') actions.push('<button class="btn btn-primary" data-action="exam" data-si="' + nx.si + '">Next: ' + esc(SECTIONS[nx.si].title) + ' exam</button>');
      else if (nx && nx.kind === 'topic') actions.push('<button class="btn btn-primary" data-action="topic" data-si="' + nx.si + '" data-ti="' + nx.ti + '">Next: ' + esc(SECTIONS[nx.si].topics[nx.ti].title) + '</button>');
    }
    actions.push('<button class="btn btn-ghost" data-action="home">Back to path</button>');

    const letters = 'ABCDE';
    const review = r.qs.map((q, i) => {
      const a = r.answers[i];
      const pos = (o) => letters[q.order.indexOf(o)];
      const say = (label, html, strong) => '<span class="ra">' + (strong ? '<strong>' : '') + label + ': ' + html + (strong ? '</strong>' : '') + '</span>';
      let ans;
      if (q.kind === 'order') {
        const list = (o) => o.map((x, n) => (n + 1) + '. ' + md(q.steps[x])).join(' &nbsp;');
        ans = say('Your order', list(a.chosen)) + (a.correct ? '' : say('Correct', list(q.steps.map((_, n) => n)), true));
      } else if (q.kind === 'line') {
        const line = (n) => 'line ' + (n + 1) + ': <code>' + esc(codeLines(q)[n].trim()) + '</code>';
        ans = say('Your answer', line(a.chosen)) + (a.correct ? '' : say('Correct', line(q.answer), true));
      } else {
        ans = say('Your answer', pos(a.chosen) + '. ' + md(q.options[a.chosen])) + (a.correct ? '' : say('Correct', pos(q.answer) + '. ' + md(q.options[q.answer]), true));
      }
      return '<div class="rv ' + (a.correct ? '' : 'miss') + '"><span class="rt">' + (r.kind === 'mistakes' ? esc(originTitle(q.si, q.src)) : q.src !== null && r.kind === 'exam' ? esc(s.topics[q.src].title) : 'Question ' + (i + 1)) + '</span><span class="rq">' + md(q.q) + '</span>' +
        (q.code ? '<pre class="rcode">' + esc(q.code) + '</pre>' : '') + ans + '<span class="ra">' + md(q.explain) + '</span></div>';
    }).join('');

    app.innerHTML = '<div class="narrow"><div class="result">' + levelCard + ring + '<h1>' + headline + '</h1><p>' + body + '</p>' + gains + weak + '<div class="btn-row" style="justify-content:center">' + actions.join('') + '</div></div>' +
      '<h3 style="margin:30px 0 0;font-size:20px">Answer review</h3><div class="review-list">' + review + '</div></div>';
  }

  // Cheat sheet Markdown: same template as CheatSheet.markdown in CheatSheet.swift (README, "Cheat sheets").
  function cheatMarkdown(s) {
    const out = ['# ' + s.title + ' cheat sheet', '', s.tagline];
    s.topics.forEach((t, ti) => {
      out.push('', '## ' + (ti + 1) + '. ' + t.title, '', t.summary, '', '**Key points**', '');
      t.keyPoints.forEach((k) => out.push('- ' + k));
      const ps = patternsOf(t);
      if (ps.length) { out.push('', '**Patterns**', ''); ps.forEach((p) => out.push('- ' + p.signal + ' → **' + p.use + '**. ' + p.why)); }
    });
    return out.join('\n') + '\n';
  }
  // Every topic is shown; ones not passed yet are dimmed unless free roam is on.
  function renderCheat(si) {
    const s = SECTIONS[si];
    const n = TRACKS.find((t) => t.sections.includes(si)).sections.indexOf(si);
    const topics = s.topics.map((t, ti) => {
      const studied = state.freeRoam || !!tstate(s.id, t.id).passed;
      const ps = patternsOf(t);
      return '<li class="cheat-topic' + (studied ? '' : ' dim') + '"><div class="cheat-th"><h2><span class="cheat-n">' + (ti + 1) + '.</span> ' + esc(t.title) + '</h2>' +
        (studied ? '' : '<span class="pill pill-mute">Not yet studied</span>') + '</div><p class="cheat-sum">' + md(t.summary) + '</p>' +
        '<h3>Key points</h3><ul>' + t.keyPoints.map((k) => '<li>' + md(k) + '</li>').join('') + '</ul>' +
        (ps.length ? '<h3>Patterns</h3><ul class="cheat-pats">' + ps.map((p) => '<li><span class="pat-k">When</span> ' + md(p.signal) + ' <span class="cheat-arrow">→</span> <strong>' + md(p.use) + '</strong><span class="cheat-why">' + md(p.why) + '</span></li>').join('') + '</ul>' : '') + '</li>';
    }).join('');
    app.innerHTML = '<div class="narrow cheat" style="max-width:860px">' +
      '<nav class="crumbs no-print"><button type="button" data-action="home">Path</button><span>/</span><span>' + esc(s.title) + '</span><span>/</span><span>Cheat sheet</span></nav>' +
      '<header class="cheat-head"><span class="eyebrow">' + esc(trackOf(s)) + ' · Section ' + (n + 1) + ' · Cheat sheet</span><h1 class="page-title">' + esc(s.title) + '</h1><p class="page-sub">' + md(s.tagline) + '</p>' +
      '<div class="btn-row no-print"><button class="btn btn-primary" data-action="cheat-print">Print / Save as PDF</button><button class="btn btn-ghost" data-action="cheat-copy" data-si="' + si + '">Copy as Markdown</button></div></header>' +
      '<ol class="cheat-list">' + topics + '</ol></div>';
  }
  function copyText(text) {
    const done = (ok) => toast(ok ? 'Copied as Markdown' : 'Copy failed: your browser blocked clipboard access');
    const fallback = () => {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { /* unsupported */ }
      ta.remove(); done(ok);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), fallback);
    else fallback();
  }

  let confirmReset = false;
  function renderBadges() {
    const earned = BADGES.filter((b) => state.badges[b.id]).length;
    app.innerHTML = '<div class="narrow" style="max-width:860px"><nav class="crumbs"><button type="button" data-action="home">Path</button><span>/</span><span>Badges</span></nav>' +
      '<h1 class="page-title">Badges</h1><p class="page-sub">' + earned + ' of ' + BADGES.length + ' earned. ' + esc(syncLabel) + '.</p>' +
      '<div class="badges">' + BADGES.map((b) => {
        const at = state.badges[b.id];
        let foot;
        if (at) foot = '<small class="b-foot">Earned ' + esc(new Date(at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })) + '</small>';
        else {
          const [cur, target] = b.progress();
          foot = '<small class="b-foot"><span class="meter b-meter" role="progressbar" aria-label="' + esc(b.name) + ' progress" aria-valuemin="0" aria-valuemax="' + target + '" aria-valuenow="' + cur + '"><i style="width:' + (target ? Math.round(cur / target * 100) : 0) + '%"></i></span>' + cur + '/' + target + '</small>';
        }
        return '<div class="badge ' + (at ? '' : 'off') + '"><span class="seal">' + (at ? ICON.medal : ICON.lock) + '</span><div><b>' + esc(b.name) + '</b><span>' + esc(b.desc) + '</span>' + foot + '</div></div>';
      }).join('') + '</div>' +
      '<div class="settings"><h3 style="font-size:18px">Settings</h3>' +
      '<label style="display:flex;gap:10px;align-items:flex-start;font-size:15px;max-width:60ch"><input type="checkbox" id="free-roam" data-action="freeroam"' + (state.freeRoam ? ' checked' : '') + ' style="margin-top:5px"> <span><b>Free roam.</b> Unlock every topic and exam, for when you already know some of the material. Quizzes still count and badges still apply.</span></label>' +
      (confirmReset
        ? '<div class="danger-confirm">Erase all XP, scores and badges? This cannot be undone. <button class="btn btn-ghost" data-action="reset-yes" style="color:var(--bad);border-color:var(--bad)">Erase progress</button><button class="btn btn-ghost" data-action="reset-no">Cancel</button></div>'
        : '<div><button class="btn btn-ghost" data-action="reset">Reset progress</button></div>') +
      '</div></div>';
  }

  let searchFrom = null;   // view to return to when the search is cleared
  let searchActive = 0;
  function renderSearch() {
    const r = search(view.q);
    let body;
    if (!r) body = '<div class="empty">Type at least ' + SEARCH_MIN + ' letters to search.</div>';
    else if (!r.groups.length) body = '<div class="empty">No lessons match “' + esc(view.q.trim()) + '”.</div>';
    else {
      let n = 0;
      body = '<div class="results" role="listbox" id="results" aria-label="Search results">' + r.groups.map((g) => {
        const s = SECTIONS[g.si], t = s.topics[g.ti];
        const open = !t || topicUnlocked(g.si, g.ti);
        const rows = g.hits.slice(0, SEARCH_PER_TOPIC).map((e) => {
          const attrs = open
            ? 'id="hit-' + n + '" role="option" data-action="hit" data-n="' + (n++) + '" data-si="' + e.si + '" data-ti="' + e.ti + '"' + (e.anchor ? ' data-anchor="' + esc(e.anchor) + '"' : '')
            : 'aria-disabled="true"';
          return '<li><button type="button" class="hit" ' + attrs + '><span class="hit-kind">' + SEARCH_KINDS[e.kind][0] + '</span><span class="hit-snip">' + snippet(e.text, r.terms) + '</span></button></li>';
        }).join('');
        const more = g.hits.length > SEARCH_PER_TOPIC ? '<p class="hit-more">+' + (g.hits.length - SEARCH_PER_TOPIC) + ' more in this ' + (t ? 'topic' : 'section') + '</p>' : '';
        return '<section class="hit-group' + (open ? '' : ' locked') + '"><div class="hit-head"><span>' + esc(s.title) + (t ? ' · <b>' + esc(t.title) + '</b>' : '') + '</span>' +
          (open ? '' : '<span class="pill pill-mute">' + ICON.lock + ' Locked</span>') + '</div><ol>' + rows + '</ol>' + more + '</section>';
      }).join('') + '</div>';
      const hits = r.groups.reduce((a, g) => a + g.hits.length, 0);
      body = '<p class="page-sub">' + hits + ' match' + (hits === 1 ? '' : 'es') + ' in ' + r.groups.length + ' place' + (r.groups.length === 1 ? '' : 's') + '. ↑ ↓ to move, Enter to open, Esc to close.</p>' + body;
    }
    app.innerHTML = '<div class="narrow"><nav class="crumbs"><button type="button" data-action="home">Path</button><span>/</span><span>Search</span></nav>' +
      '<h1 class="page-title">Search</h1>' + body + '</div>';
    moveHit(0);
  }
  function moveHit(d) {
    const hits = app.querySelectorAll('.hit[data-n]');
    searchActive = hits.length ? Math.max(0, Math.min(hits.length - 1, searchActive + d)) : 0;
    hits.forEach((h, i) => { h.classList.toggle('active', i === searchActive); h.setAttribute('aria-selected', i === searchActive); });
    if (hits[searchActive]) { qEl.setAttribute('aria-activedescendant', hits[searchActive].id); if (d) hits[searchActive].scrollIntoView({ block: 'nearest' }); }
    else qEl.removeAttribute('aria-activedescendant');
  }
  const qEl = $('#q');
  const kbd = $('.search kbd');
  if (kbd && !/Mac|iPhone|iPad/.test(navigator.userAgent)) kbd.textContent = 'Ctrl K';
  function showSearch() {
    if (!qEl.value.trim()) { if (view.name === 'search') closeSearch(); return; }
    const entering = view.name !== 'search';
    if (entering) searchFrom = view;
    view = { name: 'search', q: qEl.value };
    searchActive = 0;
    render();
    if (entering) window.scrollTo(0, 0);
  }
  function closeSearch() {
    view = searchFrom || { name: 'home' };
    searchFrom = null;
    render();
  }
  qEl.addEventListener('input', showSearch);
  qEl.addEventListener('focus', () => { if (view.name !== 'search') showSearch(); });
  qEl.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { e.preventDefault(); moveHit(e.key === 'ArrowDown' ? 1 : -1); }
    else if (e.key === 'Enter') { e.preventDefault(); const h = app.querySelector('.hit.active'); if (h) h.click(); }
    else if (e.key === 'Escape') { e.preventDefault(); if (qEl.value) { qEl.value = ''; showSearch(); } else qEl.blur(); }
  });

  // ---------- Events ----------
  document.addEventListener('click', (e) => {
    const el = e.target.closest('[data-action]');
    if (!el || el.getAttribute('aria-disabled') === 'true') return;
    const a = el.dataset.action;
    const si = +el.dataset.si, ti = +el.dataset.ti;
    if (a === 'home') return go({ name: 'home' });
    if (a === 'badges') { confirmReset = false; return go({ name: 'badges' }); }
    if (a === 'topic') return go({ name: 'topic', si, ti });
    if (a === 'hit') {
      searchFrom = null; qEl.blur();
      return go(ti < 0 ? { name: 'home', anchor: el.dataset.anchor } : { name: 'topic', si, ti, anchor: el.dataset.anchor });
    }
    if (a === 'quiz') return startQuiz(si, ti);
    if (a === 'cheat') return go({ name: 'cheat', si });
    if (a === 'cheat-print') return window.print();
    if (a === 'cheat-copy') return copyText(cheatMarkdown(SECTIONS[si]));
    if (a === 'exam') return startExam(si);
    if (a === 'mistakes') return startMistakes();
    if (a === 'quit') { const S = session; session = null; return go(S.kind === 'topic' ? { name: 'topic', si: S.si, ti: S.ti } : { name: 'home' }); }
    if (a === 'pick' && session && !session.checked) { session.picked = +el.dataset.o; return renderQuiz(); }
    if ((a === 'up' || a === 'down') && session && !session.checked) return move(+el.dataset.p, a === 'up' ? -1 : 1);
    if (a === 'check') return check();
    if (a === 'next') return advance();
    if (a === 'freeroam') { state.freeRoam = el.checked; save(); return; }
    if (a === 'reset') { confirmReset = true; return renderBadges(); }
    if (a === 'reset-no') { confirmReset = false; return renderBadges(); }
    if (a === 'reset-yes') { state = blank(); confirmReset = false; save(); return go({ name: 'home' }); }
  });
  $('#brand').addEventListener('click', () => go({ name: 'home' }));

  function check() {
    const S = session;
    if (!S || S.picked === null || S.checked) return;
    S.checked = true;
    S.answers[S.i] = { chosen: S.picked, correct: isRight(S.qs[S.i], S.picked) };
    renderQuiz();
  }
  function move(p, d) {
    const o = session.picked, to = p + d;
    if (to < 0 || to >= o.length) return;
    [o[p], o[to]] = [o[to], o[p]];
    renderQuiz();
    // Keep keyboard focus on the moved step's arrow (or its other arrow at the ends).
    const btn = $('[data-action="' + (d < 0 ? 'up' : 'down') + '"][data-p="' + to + '"]');
    (btn && !btn.disabled ? btn : $('[data-action="' + (d < 0 ? 'down' : 'up') + '"][data-p="' + to + '"]')).focus();
  }
  function advance() {
    const S = session;
    if (!S || !S.checked) return;
    if (S.i === S.qs.length - 1) return finish();
    S.i++; S.picked = firstPick(S.qs[S.i]); S.checked = false;
    renderQuiz();
    window.scrollTo(0, 0);
  }
  document.addEventListener('keydown', (e) => {
    const typing = e.target.closest && e.target.closest('input, textarea, [contenteditable]');
    if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey) && !e.altKey) { e.preventDefault(); qEl.focus(); qEl.select(); return; }
    if (e.key === '/' && !typing && !e.metaKey && !e.ctrlKey && !e.altKey) { e.preventDefault(); qEl.focus(); qEl.select(); return; }
    if (typing || view.name !== 'quiz' || !session || e.metaKey || e.ctrlKey || e.altKey) return;
    const q = session.qs[session.i];
    const n = parseInt(e.key, 10);
    const choices = q.kind === 'mc' ? q.options.length : q.kind === 'line' ? codeLines(q).length : 0;
    if (n >= 1 && n <= choices && !session.checked) { session.picked = q.kind === 'mc' ? q.order[n - 1] : n - 1; renderQuiz(); }
    else if (e.key === 'Enter') {
      e.preventDefault(); // also stops Enter on a focused step arrow from moving it again
      if (!session.checked && e.target.matches && e.target.matches('button.cl')) session.picked = +e.target.dataset.o;
      session.checked ? advance() : check();
    }
  });

  render();
})();
