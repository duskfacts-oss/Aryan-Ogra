const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

const pre = $('.preloader');
window.addEventListener('load', () => setTimeout(() => pre?.classList.add('done'), 700));

const observer = new IntersectionObserver((entries) => entries.forEach(e => {
  if (e.isIntersecting) e.target.classList.add('visible');
}), { threshold: .12 });

function titleFromFile(name) {
  const base = name.replace(/\.mp4$/i, '').replace(/[-_]+/g, ' ').trim();
  const known = {
    'EDIT': 'Coca-Cola Concept',
    'gaming': 'Game Edit',
    'patipolio': 'Personal Growth',
    'portfolio': 'Portfolio Motion',
    'potopolio': 'Creative Short',
    '1006 2': 'Gaming Edit'
  };
  if (known[base]) return known[base];
  return base.replace(/\b\w/g, c => c.toUpperCase()) || 'Untitled Edit';
}

function projectMeta(name) {
  const lower = name.toLowerCase();
  const known = {
    'edit.mp4': ['shorts motion', 'PRODUCT / MOTION / SHORT-FORM'],
    'gaming.mp4': ['gaming', 'GAMING / PACE / CAPTIONS'],
    'patipolio.mp4': ['shorts', 'SHORT-FORM / STORYTELLING'],
    'portfolio.mp4': ['motion', 'MOTION / TRANSITIONS / DESIGN'],
    'potopolio.mp4': ['shorts motion', 'SHORT-FORM / RHYTHM / VISUALS'],
    '1006-2.mp4': ['gaming', 'GAMING / PACE / EDITING']
  };
  if (known[lower]) return known[lower];
  if (lower.includes('gaming') || lower.includes('game')) return ['gaming', 'GAMING / PACE / EDITING'];
  if (lower.includes('motion') || lower.includes('portfolio') || lower.includes('edit')) return ['motion', 'MOTION / EDITING / RHYTHM'];
  return ['shorts', 'SHORT-FORM / EDITING'];
}

function createCard(project, index) {
  const fileName = project.file || project.name;
  const path = `assets/${encodeURIComponent(fileName)}`;
  const title = project.title || titleFromFile(fileName);
  const [type, cat] = project.type ? [project.type, project.category || 'EDITING'] : projectMeta(fileName);
  const poster = project.poster ? ` poster="assets/${encodeURIComponent(project.poster)}"` : '';
  const article = document.createElement('article');
  article.className = `project reveal ${index % 3 === 1 ? 'project-wide' : ''}`;
  article.dataset.type = type;
  article.dataset.video = path;
  article.dataset.title = title;
  article.dataset.cat = cat;
  article.dataset.cursor = 'OPEN';
  article.innerHTML = `
    <div class="project-media">
      <video muted loop playsinline preload="metadata"${poster} src="${path}"></video>
      <div class="project-overlay"></div>
      <span class="project-index">${String(index + 1).padStart(2, '0')}</span>
      <button class="open-project" type="button" aria-label="Open ${title}">↗</button>
      <span class="play-hint">HOVER TO PLAY</span>
    </div>
    <div class="project-info"><div><span>${cat}</span><h3>${title}</h3></div><b>↗</b></div>`;
  return article;
}

function attachProjectBehavior() {
  $$('.project').forEach(card => {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';
    const v = card.querySelector('video');
    card.addEventListener('mouseenter', () => v?.play().catch(() => {}));
    card.addEventListener('mouseleave', () => { if (v) { v.pause(); v.currentTime = 0; } });
    card.addEventListener('click', e => {
      if (e.target.closest('.open-project') || e.currentTarget.classList.contains('project')) openProject(card);
    });
    observer.observe(card);
  });
}

function updateCounts() {
  const cards = [...$$('.project')];
  const counts = {
    all: cards.length,
    shorts: cards.filter(c => c.dataset.type.includes('shorts')).length,
    gaming: cards.filter(c => c.dataset.type.includes('gaming')).length,
    motion: cards.filter(c => c.dataset.type.includes('motion')).length
  };
  $$('.filters button').forEach(btn => {
    const sup = btn.querySelector('sup');
    if (sup) sup.textContent = counts[btn.dataset.filter] ?? 0;
  });
}

function setupFilters() {
  $$('.filters button').forEach(btn => btn.addEventListener('click', () => {
    $$('.filters button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    $$('.project').forEach(c => c.style.display = f === 'all' || c.dataset.type.includes(f) ? '' : 'none');
  }));
}

async function loadProjects() {
  const grid = $('#projectGrid');
  if (!grid) return;
  try {
    // projects.json is generated automatically by GitHub Actions whenever an MP4 is added to assets/.
    const response = await fetch(`projects.json?v=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('projects.json unavailable');
    const projects = await response.json();
    grid.innerHTML = '';
    projects.forEach((project, i) => grid.appendChild(createCard(project, i)));
    if (!projects.length) grid.innerHTML = '<div class="projects-loading">ADD MP4 FILES TO /assets TO SHOW THEM HERE.</div>';
    updateCounts();
    attachProjectBehavior();
    setupFilters();
  } catch (err) {
    grid.innerHTML = '<div class="projects-loading">PROJECTS ARE UPDATING. WAIT A FEW SECONDS AND REFRESH.</div>';
    console.error(err);
  }
}

const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; if (dot) { dot.style.left = mx + 'px'; dot.style.top = my + 'px'; } });
function cursorLoop() { rx += (mx - rx) * .16; ry += (my - ry) * .16; if (ring) { ring.style.left = rx + 'px'; ring.style.top = ry + 'px'; label.style.left = rx + 'px'; label.style.top = ry + 'px'; } requestAnimationFrame(cursorLoop); }
cursorLoop();

function bindCursor() {
  $$('[data-cursor],a,button,.magnetic').forEach(el => {
    el.addEventListener('mouseenter', () => { ring?.classList.add('big'); if (label) { label.textContent = el.dataset.cursor || 'GO'; label.style.opacity = el.dataset.cursor ? '1' : '0'; } });
    el.addEventListener('mouseleave', () => { ring?.classList.remove('big'); if (label) label.style.opacity = '0'; });
  });
}
bindCursor();

if (matchMedia('(pointer:fine)').matches) {
  $$('.magnetic').forEach(el => el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); el.style.transform = `translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`; }));
  $$('.magnetic').forEach(el => el.addEventListener('mouseleave', () => el.style.transform = ''));
}

const tilt = $('.tilt');
if (tilt && matchMedia('(pointer:fine)').matches) {
  tilt.addEventListener('mousemove', e => { const r = tilt.getBoundingClientRect(), x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5; tilt.style.transform = `perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) rotate(0deg) scale(1.01)`; });
  tilt.addEventListener('mouseleave', () => tilt.style.transform = '');
}

const modal = $('#modal'), mv = $('#modalVideo'), mt = $('#modalTitle'), mc = $('#modalCat');
function openProject(card) { mv.src = card.dataset.video; mt.textContent = card.dataset.title; mc.textContent = card.dataset.cat; modal.classList.add('open'); modal.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; mv.play().catch(() => {}); }
function closeProject() { modal.classList.remove('open'); modal.setAttribute('aria-hidden', 'true'); mv.pause(); mv.removeAttribute('src'); mv.load(); document.body.style.overflow = ''; }
$('.hero-play')?.addEventListener('click', () => openProject({dataset:{video:'assets/EDIT.mp4', title:'Coca-Cola Concept', cat:'PRODUCT / MOTION / SHORT-FORM'}}));
$('.modal-close')?.addEventListener('click', closeProject);
modal?.addEventListener('click', e => { if (e.target === modal) closeProject(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeProject(); });

$('#requestForm')?.addEventListener('submit', e => { e.preventDefault(); const d = new FormData(e.currentTarget); const subject = encodeURIComponent('Editing request from ' + d.get('name')); const body = encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\n\nProject brief:\n${d.get('message')}`); window.location.href = `mailto:duskfacts@gmail.com?subject=${subject}&body=${body}`; });
window.addEventListener('scroll', () => document.documentElement.style.setProperty('--scrollY', window.scrollY));

loadProjects();
