const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const fine = matchMedia('(pointer:fine)').matches;
const esc = (s) => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* Preloader (with a fallback so it can never get stuck) */
const pre = $('.preloader');
const hidePre = () => pre?.classList.add('done');
window.addEventListener('load', () => setTimeout(hidePre, 700));
setTimeout(hidePre, 4000);

/* Reveal on scroll: observes EVERY .reveal element (before, only project cards were observed,
   so the hero, services, about and contact stayed invisible). */
const observer = new IntersectionObserver((entries) => entries.forEach(e => {
  if (e.isIntersecting) { e.target.classList.add('visible'); observer.unobserve(e.target); }
}), { threshold: .12 });
$$('.reveal').forEach(el => observer.observe(el));

/* Project data */
const known = {
  'EDIT': ['Coca-Cola Concept', 'shorts motion', 'PRODUCT / MOTION / SHORT-FORM'],
  'gaming': ['Game Edit', 'gaming', 'GAMING / PACE / CAPTIONS'],
  'patipolio': ['Personal Growth', 'shorts', 'SHORT-FORM / STORYTELLING'],
  'portfolio': ['Creativity Motion', 'motion', 'MOTION / TRANSITIONS / DESIGN'],
  'potopolio': ['Meta Story', 'shorts motion', 'SHORT-FORM / RHYTHM / VISUALS'],
  '1006-2': ['Steal an Egg', 'gaming', 'GAMING / PACE / EDITING']
};

function describe(file) {
  const base = file.replace(/\.mp4$/i, '');
  if (known[base]) return known[base];
  const l = base.toLowerCase();
  const title = base.replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, c => c.toUpperCase()) || 'Untitled Edit';
  if (/gam(e|ing)/.test(l)) return [title, 'gaming', 'GAMING / PACE / EDITING'];
  if (/motion|graphic/.test(l)) return [title, 'motion', 'MOTION / EDITING / RHYTHM'];
  return [title, 'shorts', 'SHORT-FORM / EDITING'];
}

function createCard(file, index) {
  const path = `assets/${encodeURIComponent(file)}`;
  const [title, type, cat] = describe(file);
  const a = document.createElement('article');
  a.className = 'project reveal';
  Object.assign(a.dataset, { type, video: path, title, cat, cursor: 'OPEN' });
  a.tabIndex = 0;
  a.setAttribute('role', 'button');
  a.setAttribute('aria-label', `Open ${title}`);
  a.innerHTML = `
    <div class="project-media">
      <video muted loop playsinline preload="metadata" poster="assets/${encodeURIComponent(file.replace(/\.mp4$/i, '.jpg'))}" src="${esc(path)}"></video>
      <div class="project-overlay"></div>
      <span class="project-index">${String(index + 1).padStart(2, '0')}</span>
      <span class="open-project" aria-hidden="true">↗</span>
      <span class="play-hint">HOVER TO PLAY</span>
    </div>
    <div class="project-info"><div><span>${esc(cat)}</span><h3>${esc(title)}</h3></div><b>↗</b></div>`;
  return a;
}

/* Touch screens have no hover, so play cards while they are on screen */
const autoplay = new IntersectionObserver((entries) => entries.forEach(e => {
  const v = $('video', e.target);
  if (!v) return;
  if (e.isIntersecting) v.play().catch(() => {}); else v.pause();
}), { threshold: .6 });

function bindCard(card) {
  const v = $('video', card);
  if (fine) {
    card.addEventListener('mouseenter', () => v.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { v.pause(); v.currentTime = 0; });
  } else {
    $('.play-hint', card).textContent = 'TAP TO OPEN';
    autoplay.observe(card);
  }
  card.addEventListener('click', () => openProject(card));
  card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openProject(card); } });
  observer.observe(card);
}

function updateCounts() {
  const cards = $$('.project');
  const n = (t) => cards.filter(c => c.dataset.type.includes(t)).length;
  const counts = { all: cards.length, shorts: n('shorts'), gaming: n('gaming'), motion: n('motion') };
  $$('.filters button').forEach(b => {
    const sup = $('sup', b);
    if (sup) sup.textContent = String(counts[b.dataset.filter] ?? 0).padStart(2, '0');
  });
}

function setupFilters() {
  $$('.filters button').forEach(btn => btn.addEventListener('click', () => {
    $$('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.project').forEach(c => { c.style.display = (f === 'all' || c.dataset.type.includes(f)) ? '' : 'none'; });
  }));
}

async function getJSON(url) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${url} → ${r.status}`);
  return r.json();
}

/* Primary source: projects.json (kept up to date by the GitHub Action, as README says).
   Fallback: GitHub API. project-order.json sets the display order. */
async function getFiles() {
  try {
    const list = await getJSON('projects.json');
    const files = list.map(p => p.file).filter(f => /\.mp4$/i.test(f || ''));
    if (files.length) return files;
  } catch (e) { console.warn('projects.json unavailable, trying GitHub API', e); }
  const api = await getJSON('https://api.github.com/repos/duskfacts-oss/Aryan-Ogra/contents/assets?ref=main');
  return api.filter(f => f.type === 'file' && /\.mp4$/i.test(f.name)).map(f => f.name);
}

async function loadProjects() {
  const grid = $('#projectGrid');
  if (!grid) return;
  try {
    let files = await getFiles();
    try {
      const order = await getJSON('project-order.json');
      const rank = f => { const i = order.indexOf(f); return i === -1 ? 999 : i; };
      files = [...files].sort((a, b) => rank(a) - rank(b));
    } catch { /* order file is optional */ }
    grid.innerHTML = '';
    if (!files.length) { grid.innerHTML = '<div class="projects-loading">ADD MP4 FILES TO /assets TO SHOW THEM HERE.</div>'; return; }
    files.forEach((f, i) => { const c = createCard(f, i); grid.appendChild(c); bindCard(c); });
    updateCounts();
    setupFilters();
  } catch (err) {
    grid.innerHTML = '<div class="projects-loading">PROJECTS COULD NOT LOAD. REFRESH OR CHECK THE /assets FOLDER.</div>';
    console.error(err);
  }
}

/* Cursor + magnetic buttons (desktop only) */
const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
if (fine && dot && ring && label) {
  let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
  addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; dot.style.left = mx + 'px'; dot.style.top = my + 'px'; });
  (function loop() {
    rx += (mx - rx) * .16; ry += (my - ry) * .16;
    ring.style.left = label.style.left = rx + 'px';
    ring.style.top = label.style.top = ry + 'px';
    requestAnimationFrame(loop);
  })();
  // Event delegation, so cards added later also get the cursor effect
  document.addEventListener('mouseover', e => {
    const el = e.target.closest('[data-cursor],a,button,.magnetic');
    ring.classList.toggle('big', !!el);
    label.textContent = el?.dataset.cursor || '';
    label.style.opacity = el?.dataset.cursor ? '1' : '0';
  });
  $$('.magnetic').forEach(el => {
    el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .12}px,${(e.clientY - r.top - r.height / 2) * .12}px)`; });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
  const tilt = $('.tilt');
  if (tilt) {
    tilt.addEventListener('mousemove', e => { const r = tilt.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; tilt.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 5}deg) scale(1.01)`; });
    tilt.addEventListener('mouseleave', () => { tilt.style.transform = ''; });
  }
}

/* Overlays: project viewer, start dialog, success screen */
const modal = $('#modal'), mv = $('#modalVideo'), mt = $('#modalTitle'), mc = $('#modalCat');
const startDialog = $('#startDialog'), success = $('#successScreen');
let lastFocus = null;

const setOpen = (el, open) => {
  el.classList.toggle('open', open);
  el.setAttribute('aria-hidden', String(!open));
  document.body.style.overflow = $$('.modal.open,.start-dialog.open,.success-screen.open').length ? 'hidden' : '';
};

function openProject(card) {
  lastFocus = document.activeElement;
  mv.src = card.dataset.video; mt.textContent = card.dataset.title; mc.textContent = card.dataset.cat;
  setOpen(modal, true);
  mv.play().catch(() => {});
  $('.modal-close').focus();
}
function closeProject() {
  setOpen(modal, false);
  mv.pause(); mv.removeAttribute('src'); mv.load();
  lastFocus?.focus?.();
}
$('.hero-play')?.addEventListener('click', () => openProject({ dataset: { video: 'assets/EDIT.mp4', title: 'Coca-Cola Concept', cat: 'PRODUCT / MOTION / SHORT-FORM' } }));
$('.modal-close')?.addEventListener('click', closeProject);
modal?.addEventListener('click', e => { if (e.target === modal) closeProject(); });

/* "Start a project" buttons now open the dialog (the HTML and CSS existed, the JS did not) */
$$('.start-project').forEach(b => b.addEventListener('click', e => {
  e.preventDefault();
  lastFocus = document.activeElement;
  setOpen(startDialog, true);
  $('#dialogYes').focus();
}));
$('#dialogYes')?.addEventListener('click', () => {
  setOpen(startDialog, false);
  $('#contact')?.scrollIntoView({ behavior: 'smooth' });
  setTimeout(() => $('#requestForm [name=name]')?.focus({ preventScroll: true }), 600);
});
$('#dialogNo')?.addEventListener('click', () => { setOpen(startDialog, false); lastFocus?.focus?.(); });
startDialog?.addEventListener('click', e => { if (e.target === startDialog) setOpen(startDialog, false); });
$('#successClose')?.addEventListener('click', () => { setOpen(success, false); $('#top')?.scrollIntoView({ behavior: 'smooth' }); });

document.addEventListener('keydown', e => {
  if (e.key !== 'Escape') return;
  if (modal.classList.contains('open')) closeProject();
  if (startDialog.classList.contains('open')) setOpen(startDialog, false);
  if (success.classList.contains('open')) setOpen(success, false);
});

/* Request form: full brief in the email, live step counter, success screen */
const form = $('#requestForm');
if (form) {
  const fields = ['name', 'email', 'service', 'platform', 'deadline', 'message'];
  const step = $('#formStep');
  const refresh = () => { const done = fields.filter(n => form.elements[n]?.value.trim()).length; if (step) step.textContent = `${String(done).padStart(2, '0')} / 06`; };
  form.addEventListener('input', refresh);
  form.addEventListener('submit', e => {
    e.preventDefault();
    const d = new FormData(form);
    const subject = encodeURIComponent(`Editing request from ${d.get('name')}`);
    const body = encodeURIComponent(
      `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\nPlatform: ${d.get('platform')}\nDeadline: ${d.get('deadline')}\n\nProject brief:\n${d.get('message')}`);
    setOpen(success, true);
    window.location.href = `mailto:duskfacts@gmail.com?subject=${subject}&body=${body}`;
    form.reset(); refresh();
  });
}

/* Background music: calm cinematic loop (assets/background-music.mp3).
   Browsers block sound until the visitor interacts, so it starts on the first click, tap or key press.
   The SOUND button mutes it, and once muted it stays muted. */
const music = $('#bgMusic'), soundBtn = $('#soundToggle');
if (music && soundBtn) {
  music.volume = .22;
  let muted = false;
  const state = $('span', soundBtn);
  const show = on => { if (state) state.textContent = on ? 'ON' : 'OFF'; soundBtn.setAttribute('aria-pressed', String(on)); };
  const play = async () => { try { await music.play(); show(true); } catch { show(false); } };
  show(false);
  const first = e => {
    removeEventListener('pointerdown', first); removeEventListener('keydown', first);
    if (!muted && !soundBtn.contains(e.target) && music.paused) play();
  };
  addEventListener('pointerdown', first); addEventListener('keydown', first);
  soundBtn.addEventListener('click', () => {
    if (music.paused) { muted = false; play(); } else { muted = true; music.pause(); show(false); }
  });
  music.addEventListener('error', () => { soundBtn.hidden = true; }, true);
}

loadProjects();

/* Theme studio: presets + custom colors, saved in localStorage */
(() => {
  const presets = {
    'Neon':     { bg: '#08080a', a: '#d9ff35', b: '#ff43b8', p: '#f3f1e9' },
    'Coral':    { bg: '#1c0a0c', a: '#ff7a59', b: '#ffb36b', p: '#fbeede' },
    'Maroon':   { bg: '#12060a', a: '#c4324f', b: '#ff9a62', p: '#f8e9dc' },
    'Ocean':    { bg: '#06101a', a: '#36e7ff', b: '#7c8cff', p: '#e9f3f7' },
    'Violet':   { bg: '#0d0818', a: '#b794ff', b: '#ff6fb5', p: '#f1ecf9' },
    'Mono':     { bg: '#0a0a0a', a: '#f2f2f2', b: '#9a9a9a', p: '#ececec' }
  };
  const root = document.documentElement, KEY = 'ao-theme';
  const ids = { bg: '#cBg', a: '#cAccent', b: '#cAccent2', p: '#cPaper' };
  const lum = hex => { const [r, g, b] = [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16) / 255).map(v => v <= .03928 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4); return .2126 * r + .7152 * g + .0722 * b; };
  const darken = hex => { let h = hex; for (let i = 0; i < 12 && lum(h) > .12; i++) h = '#' + [1, 3, 5].map(k => Math.round(parseInt(h.slice(k, k + 2), 16) * .8).toString(16).padStart(2, '0')).join(''); return h; };
  let current = presets.Neon;
  const apply = (t, save = true) => {
    t = { ...t, bg: darken(t.bg) };
    current = t;
    root.style.setProperty('--bg', t.bg); root.style.setProperty('--lime', t.a); root.style.setProperty('--pink', t.b);
    root.style.setProperty('--paper', t.p); root.style.setProperty('--on-accent', lum(t.a) > .35 ? '#111' : '#fff');
    $('meta[name=theme-color]')?.setAttribute('content', t.a);
    Object.entries(ids).forEach(([k, sel]) => { const i = $(sel); if (i) i.value = t[k]; });
    $$('#presets button').forEach(b => b.classList.toggle('active', JSON.stringify(presets[b.dataset.name]) === JSON.stringify(t)));
    if (save) try { localStorage.setItem(KEY, JSON.stringify(t)); } catch { /* private mode */ }
  };
  const box = $('#presets');
  Object.entries(presets).forEach(([name, t]) => {
    const b = document.createElement('button');
    b.type = 'button'; b.dataset.name = name;
    b.innerHTML = `<i style="background:linear-gradient(90deg,${t.bg} 40%,${t.a} 40% 70%,${t.b} 70%)"></i>${name.toUpperCase()}`;
    b.addEventListener('click', () => apply(t));
    box.appendChild(b);
  });
  Object.entries(ids).forEach(([k, sel]) => $(sel)?.addEventListener('input', e => apply({ ...current, [k]: e.target.value })));
  $('#themeReset')?.addEventListener('click', () => { apply(presets.Neon, false); try { localStorage.removeItem(KEY); } catch { } });
  const btn = $('#themeBtn'), panel = $('#themePanel');
  btn?.addEventListener('click', () => { const o = panel.classList.toggle('open'); btn.setAttribute('aria-expanded', String(o)); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') panel.classList.remove('open'); });
  document.addEventListener('pointerdown', e => { if (!panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove('open'); });
  let saved = null; try { saved = JSON.parse(localStorage.getItem(KEY)); } catch { }
  apply(saved && saved.bg && saved.a ? saved : presets.Neon, false);
})();
