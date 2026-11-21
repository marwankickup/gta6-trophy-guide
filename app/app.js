// Leonida Trophy Guide — tracker + guide + roadmap for GTA VI's 55 PS5 trophies.
// All data comes from data/trophies.json (same origin, fetched once). Progress lives in
// localStorage and can be exported to / imported from a JSON file. No network requests.
const STORAGE_KEY = 'leonida-trophy-guide-v1';
const KIND_LABELS = {
  story: 'Story', collectible: 'Collectible', activity: 'Activity',
  combat: 'Combat', exploration: 'Exploration', money: 'Money',
  misc: 'Misc', platinum: 'Platinum',
};
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];

const params = new URLSearchParams(location.search);
const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const roadmap = data.roadmap || [];

let earned = new Set(readStoredEarned());

const listEl = document.getElementById('trophyList');
const emptyEl = document.getElementById('emptyState');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind');
const gradeEl = document.getElementById('grade');
const earnedEl = document.getElementById('earned');
const missableEl = document.getElementById('missableOnly');
const spoilerEl = document.getElementById('spoiler');

applyUrlStaging();

function readStoredEarned() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(raw)) return [];
    const ids = new Set(trophies.map((t) => t.id));
    return raw.filter((v) => ids.has(v) || trophies.some((t) => t.name === v));
  } catch {
    return [];
  }
}

function saveEarned() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned]));
}

function applyUrlStaging() {
  // Staging hooks for screenshots and tests: ?check=1,2,3 checks trophies,
  // ?expand=28 opens a guide, ?spoiler=1 / ?missable=1 / ?kind= / ?grade= /
  // ?search= / ?view=roadmap pre-set the controls. ?check= replaces the set.
  const check = params.get('check');
  if (check) {
    earned = new Set(check.split(',').map((s) => Number(s.trim())).filter((n) => trophies.some((t) => t.id === n)));
    saveEarned();
  }
  if (params.get('spoiler') === '1') spoilerEl.checked = true;
  if (params.get('missable') === '1') missableEl.checked = true;
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('earned')) earnedEl.value = params.get('earned');
  if (params.get('search')) searchEl.value = params.get('search');
  if (params.get('view') === 'roadmap') showView('roadmap');
}

function isHidden(t) {
  return spoilerEl.checked && t.kind === 'story' && !earned.has(t.id);
}

function visibleTrophies() {
  const q = searchEl.value.trim().toLowerCase();
  return trophies.filter((t) => {
    if (kindEl.value !== 'all' && t.kind !== kindEl.value) return false;
    if (gradeEl.value !== 'all' && t.grade !== gradeEl.value) return false;
    if (earnedEl.value === 'earned' && !earned.has(t.id)) return false;
    if (earnedEl.value === 'unearned' && earned.has(t.id)) return false;
    if (missableEl.checked && !t.missable) return false;
    if (q && !(t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.guide.toLowerCase().includes(q))) return false;
    return true;
  });
}

function gradeBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge ' + t.grade;
  b.textContent = t.grade;
  return b;
}

function kindBadge(t) {
  const b = document.createElement('span');
  b.className = 'badge kind';
  b.textContent = KIND_LABELS[t.kind] || t.kind;
  return b;
}

function missableBadge() {
  const b = document.createElement('span');
  b.className = 'badge missable';
  b.textContent = 'Missable';
  return b;
}

function sourceList(t) {
  const p = document.createElement('p');
  p.className = 'sources';
  p.textContent = 'Sources: ';
  (t.sources || []).forEach((s, i) => {
    if (i > 0) p.append(document.createTextNode(' · '));
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    p.append(a);
  });
  return p;
}

function renderTrophy(t) {
  const li = document.createElement('li');
  li.className = 'trophy' + (earned.has(t.id) ? ' earned' : '');
  li.dataset.id = String(t.id);

  const head = document.createElement('div');
  head.className = 'trophy-head';

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.className = 'trophy-check';
  box.checked = earned.has(t.id);
  box.setAttribute('aria-label', 'Mark ' + t.name + ' as earned');
  box.addEventListener('change', () => {
    if (box.checked) earned.add(t.id);
    else earned.delete(t.id);
    saveEarned();
    renderAll();
  });
  head.append(box);

  const title = document.createElement('div');
  title.className = 'trophy-title';
  const name = document.createElement('h3');
  name.className = 'trophy-name';
  if (isHidden(t)) {
    const span = document.createElement('span');
    span.className = 'hidden-name';
    span.textContent = 'Hidden story trophy';
    name.append(span);
  } else {
    name.textContent = t.name;
  }
  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = isHidden(t) ? 'Hidden until earned — turn off “Hide story spoilers” to reveal it.' : t.description;
  title.append(name, desc);

  const badges = document.createElement('div');
  badges.className = 'badges';
  badges.append(gradeBadge(t), kindBadge(t));
  if (t.missable) badges.append(missableBadge());
  title.append(badges);
  head.append(title);

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'guide-toggle';
  toggle.textContent = 'Guide ▸';
  toggle.setAttribute('aria-expanded', 'false');
  head.append(toggle);

  const guide = document.createElement('div');
  guide.className = 'guide';
  guide.hidden = true;
  if (!isHidden(t)) {
    const text = document.createElement('p');
    text.textContent = t.guide;
    guide.append(text);
    if (t.missable && t.missableNote) {
      const note = document.createElement('p');
      note.className = 'missable-note';
      note.textContent = '⚠ Missable: ' + t.missableNote;
      guide.append(note);
    }
    guide.append(sourceList(t));
  } else {
    const text = document.createElement('p');
    text.textContent = 'This guide is hidden while spoilers are on. Earn the trophy, or turn off “Hide story spoilers”, to read it.';
    guide.append(text);
  }

  toggle.addEventListener('click', () => {
    guide.hidden = !guide.hidden;
    toggle.textContent = guide.hidden ? 'Guide ▸' : 'Guide ▾';
    toggle.setAttribute('aria-expanded', String(!guide.hidden));
  });

  li.append(head, guide);
  return li;
}

function renderProgress() {
  const total = trophies.length;
  const done = earned.size;
  const pct = Math.round((done / total) * 100);
  document.getElementById('progressText').textContent = `${done} of ${total} earned`;
  document.getElementById('progressPct').textContent = pct + '%';
  document.getElementById('progressFill').style.width = pct + '%';
  const counts = GRADE_ORDER.map((g) => {
    const inGrade = trophies.filter((t) => t.grade === g);
    const got = inGrade.filter((t) => earned.has(t.id)).length;
    return `${g}: ${got}/${inGrade.length}`;
  }).join(' · ');
  document.getElementById('gradeCounts').innerHTML = '';
  document.getElementById('gradeCounts').textContent = counts;
  const others = trophies.filter((t) => t.grade !== 'platinum').length;
  const othersDone = [...earned].filter((id) => trophies.find((t) => t.id === id && t.grade !== 'platinum')).length;
  document.getElementById('platinumLine').textContent =
    `Platinum “Vice Got a Price!” — ${othersDone} of ${others} other trophies earned.` +
    (othersDone === others ? ' Platinum unlocked!' : '');
}

function renderList() {
  const shown = visibleTrophies();
  listEl.replaceChildren(...shown.map(renderTrophy));
  const expand = params.get('expand');
  if (expand) {
    for (const id of expand.split(',')) {
      const li = listEl.querySelector(`[data-id="${Number(id.trim())}"]`);
      if (li) li.querySelector('.guide-toggle').click();
    }
  }
  document.getElementById('resultCount').textContent = `Showing ${shown.length} of ${trophies.length} trophies`;
  emptyEl.hidden = shown.length !== 0;
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapList');
  ol.replaceChildren();
  for (const stage of roadmap) {
    const li = document.createElement('li');
    const h = document.createElement('h3');
    const num = document.createElement('span');
    num.className = 'stage-num';
    num.textContent = String(stage.stage);
    h.append(num, document.createTextNode(stage.title));
    const p = document.createElement('p');
    p.textContent = stage.text;
    const chips = document.createElement('ul');
    chips.className = 'roadmap-trophies';
    for (const t of trophies.filter((x) => x.stage === stage.stage)) {
      const chip = document.createElement('li');
      if (earned.has(t.id)) chip.className = 'done';
      chip.textContent = (isHidden(t) ? 'Hidden story trophy' : t.name) + (t.missable ? ' ⚠' : '');
      chips.append(chip);
    }
    li.append(h, p, chips);
    ol.append(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
}

function showView(view) {
  const tracker = view === 'tracker';
  document.getElementById('trackerView').hidden = !tracker;
  document.getElementById('roadmapView').hidden = tracker;
  document.getElementById('tabTracker').classList.toggle('active', tracker);
  document.getElementById('tabRoadmap').classList.toggle('active', !tracker);
  document.getElementById('tabTracker').setAttribute('aria-pressed', String(tracker));
  document.getElementById('tabRoadmap').setAttribute('aria-pressed', String(!tracker));
}

document.getElementById('tabTracker').addEventListener('click', () => showView('tracker'));
document.getElementById('tabRoadmap').addEventListener('click', () => showView('roadmap'));
for (const el of [searchEl, kindEl, gradeEl, earnedEl, missableEl, spoilerEl]) {
  el.addEventListener('input', renderList);
  el.addEventListener('change', renderList);
}
spoilerEl.addEventListener('change', renderAll);

document.getElementById('exportBtn').addEventListener('click', () => {
  const payload = {
    game: 'Grand Theft Auto VI',
    platform: 'PlayStation 5',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort((a, b) => a - b),
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

document.getElementById('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const raw = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(raw)) throw new Error('no earned list');
    const ids = new Set(trophies.map((t) => t.id));
    const next = new Set();
    for (const v of raw) {
      if (typeof v === 'number' && ids.has(v)) next.add(v);
      const byName = trophies.find((t) => t.name === v);
      if (byName) next.add(byName.id);
    }
    earned = next;
    saveEarned();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
  e.target.value = '';
});

document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies? This cannot be undone.')) {
    earned = new Set();
    saveEarned();
    renderAll();
  }
});

renderAll();

// Test hook: counts and state for the screenshot/test harness.
window.__trophyGuide = {
  total: trophies.length,
  earnedCount: () => earned.size,
  visibleCount: () => visibleTrophies().length,
  missable: () => trophies.filter((t) => t.missable).map((t) => t.name),
};
