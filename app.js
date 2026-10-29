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
  const DAY = 86400000;
  const LEVELS = [
    [0, 'Intern'], [200, 'Apprentice'], [600, 'Junior Engineer'], [1200, 'Engineer'],
    [2000, 'Senior Engineer'], [3000, 'Staff Engineer'], [4500, 'Principal Engineer'], [6500, 'Distinguished Engineer'],
  ];

  // ---------- State & persistence ----------
  const LS_KEY = 'shipwright-academy.v1';
  const blank = () => ({ v: 1, xp: 0, topics: {}, exams: {}, days: [], badges: {}, reviews: 0, freeRoam: false, updatedAt: 0 });
  let state = blank();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (raw) state = Object.assign(blank(), JSON.parse(raw));
  } catch (e) { /* storage unavailable: start fresh */ }

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
        state = Object.assign(blank(), JSON.parse(remote.json));
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
  const reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ICON = {
    flame: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22c4 0 7-3 7-7 0-4-3-6-4-9-1 2-2 3-3 3 0-3-1-5-3-7 0 4-4 7-4 13 0 4 3 7 7 7z"/></svg>',
    medal: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="14" r="6"/><path d="M8.5 9.2 6 2h4l2 5 2-5h4l-2.5 7.2"/></svg>',
    lock: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    check: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    gate: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 21V8l8-5 8 5v13"/><path d="M9 21v-6h6v6"/></svg>',
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

  // ---------- Badges ----------
  const BADGES = [
    { id: 'first', name: 'First Commit', desc: 'Pass your first topic quiz.', test: () => counts().passed >= 1 },
    { id: 'flawless', name: 'Zero Defects', desc: 'Answer every question right on a topic quiz.', test: () => Object.values(state.topics).some((t) => t.perfect) },
    { id: 'comeback', name: 'Root Caused', desc: 'Pass a quiz or exam you previously failed.', test: () => Object.values(state.topics).concat(Object.values(state.exams)).some((t) => t.passed && t.failedOnce) },
    { id: 'boss', name: 'Gatekeeper', desc: 'Pass your first section exam.', test: () => counts().exams >= 1 },
    { id: 'streak3', name: 'On Call', desc: 'Study three days in a row.', test: () => streak() >= 3 },
    { id: 'streak7', name: 'Release Train', desc: 'Study seven days in a row.', test: () => streak() >= 7 },
    { id: 'review5', name: 'Spaced Out', desc: 'Complete five spaced reviews.', test: () => state.reviews >= 5 },
    { id: 'half', name: 'Halfway Merged', desc: 'Pass half of all topics.', test: () => { const c = counts(); return c.topics > 0 && c.passed >= c.topics / 2; } },
  ].concat(SECTIONS.map((s) => ({ id: 'sec-' + s.id, name: s.title, desc: 'Pass the ' + s.title + ' section exam.', test: () => !!estate(s.id).passed })))
   .concat([{ id: 'all', name: 'Shipwright', desc: 'Pass every section exam.', test: () => SECTIONS.length > 0 && counts().exams === SECTIONS.length }]);

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
        else if (b.type === 'figure') add(ti, 'figure', b.caption, a);
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
    $('#stats').innerHTML =
      '<div class="lvl" title="' + esc(syncLabel) + '"><div class="lvl-top"><span>Lv ' + L.n + ' <b>' + esc(L.name) + '</b></span><span>' + state.xp + (L.next ? ' / ' + L.next : '') + ' XP</span></div>' +
      '<div class="meter"><i style="width:' + Math.round(L.pct * 100) + '%"></i></div></div>' +
      '<span class="stat" title="Day streak">' + ICON.flame + '<b>' + st + '</b><span class="hide-sm">day' + (st === 1 ? '' : 's') + '</span></span>' +
      '<button class="icon-btn" type="button" data-action="badges">' + ICON.medal + '<b>' + earned + '</b><span class="hide-sm">/ ' + BADGES.length + '</span></button>';
  }

  function confetti() {
    if (reduced) return;
    const c = $('#confetti');
    c.hidden = false;
    const ctx = c.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    ctx.scale(dpr, dpr);
    const css = getComputedStyle(document.documentElement);
    const colors = ['--accent', '--xp', '--ok'].map((v) => css.getPropertyValue(v).trim());
    const ps = Array.from({ length: 110 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 120, y: innerHeight * 0.38,
      vx: (Math.random() - 0.5) * 12, vy: -Math.random() * 12 - 4,
      w: 5 + Math.random() * 5, h: 8 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4,
      c: colors[Math.floor(Math.random() * colors.length)],
    }));
    const t0 = performance.now();
    (function frame(t) {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      ps.forEach((p) => { p.vy += 0.35; p.x += p.vx; p.y += p.vy; p.r += p.vr; ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.c; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore(); });
      if (t - t0 < 1800) requestAnimationFrame(frame); else { ctx.clearRect(0, 0, innerWidth, innerHeight); c.hidden = true; }
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

    SECTIONS.forEach((s, si) => {
      const open = sectionUnlocked(si);
      const done = s.topics.filter((t) => tstate(s.id, t.id).passed).length;
      const ex = estate(s.id);
      const n = TRACKS.find((t) => t.sections.includes(si)).sections.indexOf(si);
      if (n === 0 && TRACKS.length > 1) html += '<h2 class="track-title">' + esc(trackOf(s)) + '</h2>';
      html += '<section class="section" id="sec-' + esc(s.id) + '"><div class="sec-head"><div><span class="eyebrow">Section ' + (n + 1) + '</span><h2>' + esc(s.title) + '</h2><p>' + md(s.tagline) + '</p></div>' +
        '<div class="sec-meta"><span>' + done + ' / ' + s.topics.length + '</span><div class="meter sec-meter"><i style="width:' + Math.round(done / s.topics.length * 100) + '%"></i></div>' +
        (ex.passed ? '<span class="pill pill-ok">' + ICON.check + ' Exam ' + ex.best + '%</span>' : '') + '</div></div>';
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

  function renderTopic(si, ti) {
    const s = SECTIONS[si], t = s.topics[ti];
    const ts = tstate(s.id, t.id);
    const blocks = t.lesson.map((b, bi) => {
      const at = ' id="blk-' + bi + '"';
      if (b.type === 'h') return '<h3' + at + '>' + md(b.text) + '</h3>';
      // Figure SVG is curriculum content checked by scripts/validate-content.js (no scripts, handlers or external refs).
      if (b.type === 'figure') return '<figure class="fig"' + at + '><div class="fig-art">' + b.svg + '</div><figcaption>' + md(b.caption) + '</figcaption></figure>';
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

  function makeQ(q, src) {
    return { q: q.q, options: q.options, answer: q.answer, explain: q.explain, src, order: shuffle(q.options.map((_, i) => i)) };
  }
  function startQuiz(si, ti) {
    const s = SECTIONS[si], t = s.topics[ti];
    session = { kind: 'topic', si, ti, review: reviewDue(s.id, t.id), qs: shuffle(t.quiz).map((q) => makeQ(q, ti)), i: 0, picked: null, checked: false, answers: [] };
    view = { name: 'quiz' }; render(); window.scrollTo(0, 0);
  }
  function startExam(si) {
    const s = SECTIONS[si];
    const fromTopics = s.topics.map((t, ti) => makeQ(t.quiz[Math.floor(Math.random() * t.quiz.length)], ti));
    session = { kind: 'exam', si, qs: shuffle(s.exam.map((q) => makeQ(q, null)).concat(fromTopics)), i: 0, picked: null, checked: false, answers: [] };
    view = { name: 'quiz' }; render(); window.scrollTo(0, 0);
  }

  function renderQuiz() {
    const S = session, s = SECTIONS[S.si];
    const q = S.qs[S.i];
    const title = S.kind === 'exam' ? s.title + ' · Section exam' : s.topics[S.ti].title;
    const pips = S.qs.map((_, i) => {
      const a = S.answers[i];
      return '<span class="pip ' + (a ? (a.correct ? 'ok' : 'bad') : (i === S.i ? 'cur' : '')) + '"></span>';
    }).join('');
    const letters = 'ABCDE';
    const opts = q.order.map((orig, pos) => {
      let cls = '';
      if (S.checked) { if (orig === q.answer) cls = 'right'; else if (orig === S.picked) cls = 'wrong'; }
      else if (orig === S.picked) cls = 'sel';
      return '<button type="button" class="opt ' + cls + '" data-action="pick" data-o="' + orig + '"' + (S.checked ? ' disabled' : '') + '><span class="key">' + letters[pos] + '</span><span>' + md(q.options[orig]) + '</span></button>';
    }).join('');
    let fb = '';
    if (S.checked) {
      const ok = S.picked === q.answer;
      fb = '<div class="feedback ' + (ok ? 'ok' : 'bad') + '"><b>' + (ok ? 'Correct' : 'Not quite') + '</b>' + md(q.explain) + '</div>';
    }
    const last = S.i === S.qs.length - 1;
    app.innerHTML = '<div class="narrow">' +
      '<nav class="crumbs"><button type="button" data-action="quit">Leave ' + (S.kind === 'exam' ? 'exam' : 'quiz') + '</button><span>·</span><span>Progress is not saved until you finish</span></nav>' +
      '<div class="quiz-top"><h1>' + esc(title) + '</h1><span class="pill pill-mute">Question ' + (S.i + 1) + ' of ' + S.qs.length + '</span></div>' +
      '<div class="pips">' + pips + '</div>' +
      '<div class="qcard"><h2>' + md(q.q) + '</h2><div class="opts" role="group" aria-label="Answers">' + opts + '</div>' + fb +
      '<div class="quiz-actions">' + (S.checked
        ? '<button class="btn btn-primary" data-action="next">' + (last ? 'See results' : 'Next question') + '</button>'
        : '<button class="btn btn-primary" data-action="check"' + (S.picked === null ? ' disabled' : '') + '>Check answer</button>') + '</div>' +
      '<div class="hint">Keys: 1–' + q.options.length + ' to choose, Enter to continue</div></div></div>';
  }

  function finish() {
    const S = session, s = SECTIONS[S.si];
    const correct = S.answers.filter((a) => a.correct).length;
    const total = S.qs.length;
    const pct = Math.round(correct / total * 100);
    const gains = [];
    const now = Date.now();
    let passed;
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
    } else {
      const es = state.exams[s.id] = Object.assign({ best: 0, attempts: 0 }, state.exams[s.id]);
      passed = correct / total >= EXAM_PASS;
      es.attempts++;
      if (pct > es.best) es.best = pct;
      if (passed && !es.passed) { gains.push(['Section exam passed', 250]); es.passed = true; es.passedAt = now; }
      if (correct === total && !es.perfect) { gains.push(['Flawless exam', 100]); es.perfect = true; }
      if (!passed) es.failedOnce = true;
    }
    const xp = gains.reduce((a, g) => a + g[1], 0);
    const lvBefore = levelInfo(state.xp).n;
    state.xp += xp;
    const d = today();
    if (!state.days.includes(d)) { state.days.push(d); state.days = state.days.slice(-120); }
    const fresh = checkBadges();
    save();
    const lvAfter = levelInfo(state.xp);
    view = { name: 'result', data: { kind: S.kind, si: S.si, ti: S.ti, correct, total, pct, passed, gains, qs: S.qs, answers: S.answers } };
    session = null;
    render();
    window.scrollTo(0, 0);
    if (passed) confetti();
    if (lvAfter.n > lvBefore) toast('<span class="seal">' + ICON.medal + '</span><span>Level up: <b>' + esc(lvAfter.name) + '</b></span>');
    fresh.forEach((b, i) => setTimeout(() => toast('<span class="seal">' + ICON.medal + '</span><span>Badge earned: <b>' + esc(b.name) + '</b></span>'), 400 + i * 500));
  }

  function renderResult() {
    const r = view.data, s = SECTIONS[r.si];
    const passMark = r.kind === 'exam' ? EXAM_PASS : TOPIC_PASS;
    const C = 2 * Math.PI * 60;
    const color = r.passed ? 'var(--ok)' : 'var(--bad)';
    const ring = '<div class="score-ring"><svg viewBox="0 0 140 140"><circle cx="70" cy="70" r="60" fill="none" stroke="var(--rule)" stroke-width="12"/>' +
      '<circle cx="70" cy="70" r="60" fill="none" stroke="' + color + '" stroke-width="12" stroke-linecap="round" stroke-dasharray="' + (C * r.pct / 100).toFixed(1) + ' ' + C.toFixed(1) + '"/></svg><span class="v">' + r.pct + '%</span></div>';
    const what = r.kind === 'exam' ? s.title + ' exam' : s.topics[r.ti].title;
    let headline, body;
    if (r.passed) {
      headline = r.kind === 'exam' ? 'Section cleared' : 'Topic passed';
      body = 'You scored ' + r.correct + ' of ' + r.total + ' on ' + esc(what) + '.' + (r.kind === 'exam' && nextInTrack(r.si) >= 0 ? ' ' + esc(SECTIONS[nextInTrack(r.si)].title) + ' is now open.' : '');
    } else {
      headline = 'Retake required';
      body = 'You scored ' + r.correct + ' of ' + r.total + '. The pass mark is ' + Math.round(passMark * 100) + '%. Review the explanations below, revisit the material, then try again. Questions and answer order are reshuffled each attempt.';
    }
    const gains = r.gains.length ? '<div class="xp-gain">' + r.gains.map((g) => '<span class="pill pill-xp">+' + g[1] + ' XP · ' + esc(g[0]) + '</span>').join('') + '</div>' : '<div class="xp-gain"><span class="pill pill-mute">No new XP this attempt</span></div>';

    let weak = '';
    if (r.kind === 'exam' && !r.passed) {
      const missed = {};
      r.answers.forEach((a, i) => { if (!a.correct && r.qs[i].src !== null) missed[r.qs[i].src] = true; });
      const ids = Object.keys(missed).map(Number);
      if (ids.length) weak = '<div class="weak"><h3>Topics to revisit</h3><div class="btn-row">' + ids.map((ti) => '<button class="btn btn-ghost" data-action="topic" data-si="' + r.si + '" data-ti="' + ti + '">' + esc(s.topics[ti].title) + '</button>').join('') + '</div></div>';
    }
    const actions = [];
    if (!r.passed) actions.push(r.kind === 'exam' ? '<button class="btn btn-primary" data-action="exam" data-si="' + r.si + '">Retake exam</button>' : '<button class="btn btn-primary" data-action="quiz" data-si="' + r.si + '" data-ti="' + r.ti + '">Retake quiz</button>');
    if (!r.passed && r.kind === 'topic') actions.push('<button class="btn btn-ghost" data-action="topic" data-si="' + r.si + '" data-ti="' + r.ti + '">Reread the lesson</button>');
    if (r.passed) {
      const nx = nextStep();
      if (nx && nx.kind === 'exam') actions.push('<button class="btn btn-primary" data-action="exam" data-si="' + nx.si + '">Next: ' + esc(SECTIONS[nx.si].title) + ' exam</button>');
      else if (nx && nx.kind === 'topic') actions.push('<button class="btn btn-primary" data-action="topic" data-si="' + nx.si + '" data-ti="' + nx.ti + '">Next: ' + esc(SECTIONS[nx.si].topics[nx.ti].title) + '</button>');
    }
    actions.push('<button class="btn btn-ghost" data-action="home">Back to path</button>');

    const letters = 'ABCDE';
    const review = r.qs.map((q, i) => {
      const a = r.answers[i];
      const pos = (o) => letters[q.order.indexOf(o)];
      return '<div class="rv ' + (a.correct ? '' : 'miss') + '"><span class="rt">' + (q.src !== null && r.kind === 'exam' ? esc(s.topics[q.src].title) : 'Question ' + (i + 1)) + '</span><span class="rq">' + md(q.q) + '</span>' +
        (a.correct ? '<span class="ra">Your answer: ' + pos(q.answer) + '. ' + md(q.options[q.answer]) + '</span>'
          : '<span class="ra">Your answer: ' + pos(a.chosen) + '. ' + md(q.options[a.chosen]) + '</span><span class="ra"><strong>Correct: ' + pos(q.answer) + '. ' + md(q.options[q.answer]) + '</strong></span>') +
        '<span class="ra">' + md(q.explain) + '</span></div>';
    }).join('');

    app.innerHTML = '<div class="narrow"><div class="result">' + ring + '<h1>' + headline + '</h1><p>' + body + '</p>' + gains + weak + '<div class="btn-row" style="justify-content:center">' + actions.join('') + '</div></div>' +
      '<h3 style="margin:30px 0 0;font-size:20px">Answer review</h3><div class="review-list">' + review + '</div></div>';
  }

  let confirmReset = false;
  function renderBadges() {
    const earned = BADGES.filter((b) => state.badges[b.id]).length;
    app.innerHTML = '<div class="narrow" style="max-width:860px"><nav class="crumbs"><button type="button" data-action="home">Path</button><span>/</span><span>Badges</span></nav>' +
      '<h1 class="page-title">Badges</h1><p class="page-sub">' + earned + ' of ' + BADGES.length + ' earned. ' + esc(syncLabel) + '.</p>' +
      '<div class="badges">' + BADGES.map((b) => '<div class="badge ' + (state.badges[b.id] ? '' : 'off') + '"><span class="seal">' + (state.badges[b.id] ? ICON.medal : ICON.lock) + '</span><div><b>' + esc(b.name) + '</b><span>' + esc(b.desc) + '</span></div></div>').join('') + '</div>' +
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
    if (a === 'exam') return startExam(si);
    if (a === 'quit') { const S = session; session = null; return go(S.kind === 'exam' ? { name: 'home' } : { name: 'topic', si: S.si, ti: S.ti }); }
    if (a === 'pick' && session && !session.checked) { session.picked = +el.dataset.o; return renderQuiz(); }
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
    S.answers[S.i] = { chosen: S.picked, correct: S.picked === S.qs[S.i].answer };
    renderQuiz();
  }
  function advance() {
    const S = session;
    if (!S || !S.checked) return;
    if (S.i === S.qs.length - 1) return finish();
    S.i++; S.picked = null; S.checked = false;
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
    if (n >= 1 && n <= q.options.length && !session.checked) { session.picked = q.order[n - 1]; renderQuiz(); }
    else if (e.key === 'Enter') { e.preventDefault(); session.checked ? advance() : check(); }
  });

  render();
})();
