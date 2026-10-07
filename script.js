const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
window.addEventListener('load',()=>setTimeout(()=>$('#loader')?.classList.add('done'),650));
const menu=$('#menuBtn'), nav=$('#navLinks'); menu?.addEventListener('click',()=>nav.classList.toggle('open')); $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1}); $$('.reveal').forEach(x=>obs.observe(x));
const cursor=$('#cursor'),ring=$('#cursorRing'); if(cursor&&ring && matchMedia('(pointer:fine)').matches){addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px'}); $$('.magnetic,.project,.reel-btn').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('big'));el.addEventListener('mouseleave',()=>ring.classList.remove('big'))})}
$$('.tilt').forEach(el=>el.addEventListener('mousemove',e=>{if(!matchMedia('(pointer:fine)').matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`translate(-50%,-50%) rotateY(${x*7}deg) rotateX(${-y*7}deg) rotate(-4deg)`;el.style.transition='none'})); $$('.tilt').forEach(el=>el.addEventListener('mouseleave',()=>{el.style.transform='translate(-50%,-50%) rotate(-5deg)';el.style.transition='.5s ease'}));
const fallbackProjects=[{title:'Your Best Project',category:'Best Project · Motion Edit',number:'01',label:'BEST\nPROJECT'},{title:'Short Form Energy',category:'Shorts / Reels',number:'02',label:'SHORT\nFORM'},{title:'Gaming Motion',category:'Gaming Edit',number:'03',label:'GAME\nON'},{title:'Experimental Motion',category:'Motion Graphics',number:'04',label:'MOVE\nDIFFERENT'}];
function renderProjects(items){const grid=$('#workGrid');grid.innerHTML='';items.forEach((p,i)=>{const a=document.createElement('article');a.className='project reveal';a.innerHTML=`<div class="project-visual"><div class="project-fallback"><span class="project-number">${p.number||String(i+1).padStart(2,'0')}</span><span class="project-play">▶</span><div class="project-label">${(p.label||p.title).replaceAll('\n','<br>')}</div></div>${p.src?`<video class="project-video" src="${p.src}" muted loop playsinline preload="metadata"></video>`:''}<div class="project-overlay"></div></div><div class="project-meta"><div><h3>${p.title}</h3><p>${p.category}</p></div><span>↗</span></div>`;grid.appendChild(a);a.addEventListener('click',()=>openViewer(p));a.addEventListener('mouseenter',()=>a.querySelector('video')?.play().catch(()=>{}));a.addEventListener('mouseleave',()=>{const v=a.querySelector('video');if(v){v.pause();v.currentTime=0}});obs.observe(a)});$('#projectCount').textContent=String(items.length).padStart(2,'0')+' PROJECTS';$('#emptyWork').style.display=items.some(x=>x.src)?'none':'block'}
async function loadProjects(){try{const r=await fetch('projects.php',{cache:'no-store'});if(!r.ok)throw 0;const data=await r.json();renderProjects(data.length?data:fallbackProjects)}catch{renderProjects(fallbackProjects)}}
function openViewer(p){if(!p.src)return;const v=$('#viewerVideo');v.src=p.src;$('#viewerTitle').textContent=p.title;$('#viewerCategory').textContent=p.category;$('#viewer').classList.add('open');$('#viewer').setAttribute('aria-hidden','false');v.play().catch(()=>{})}function closeViewer(){const v=$('#viewerVideo');v.pause();v.removeAttribute('src');v.load();$('#viewer').classList.remove('open');$('#viewer').setAttribute('aria-hidden','true')}$('#viewerClose')?.addEventListener('click',closeViewer);$('#viewer')?.addEventListener('click',e=>{if(e.target.id==='viewer')closeViewer()});addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
$('#reelBtn')?.addEventListener('click',()=>{const first=document.querySelector('.project-video');if(first){openViewer({src:first.currentSrc||first.src,title:'Aryan Ogra — Showreel',category:'Selected Work'})}else document.querySelector('#work')?.scrollIntoView({behavior:'smooth'})});
loadProjects();

// Extra motion: magnetic controls + pointer glow + scroll progress
const root=document.documentElement;
const progress=document.createElement('div');progress.className='scroll-progress';document.body.appendChild(progress);
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${h?scrollY/h:0})`},{passive:true});
if(matchMedia('(pointer:fine)').matches){
  $$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.10}px,${(e.clientY-r.top-r.height/2)*.10}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  const glow=document.createElement('div');glow.className='pointer-glow';document.body.appendChild(glow);
  addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
}


// Background music control: starts only after a user gesture (browser autoplay rules).
const bgMusic = $('#bgMusic');
const musicToggle = $('#musicToggle');
let musicOn = false;
if (bgMusic && musicToggle) {
  bgMusic.volume = 0.18;
  const label = musicToggle.querySelector('.music-label');
  const setMusicUI = on => {
    musicOn = on;
    musicToggle.classList.toggle('playing', on);
    musicToggle.setAttribute('aria-pressed', String(on));
    musicToggle.setAttribute('aria-label', on ? 'Turn background music off' : 'Turn background music on');
    if (label) label.textContent = on ? 'MUSIC ON' : 'MUSIC On';
  };
  const fadeTo = (target, duration = 450) => {
    const start = bgMusic.volume;
    const begin = performance.now();
    const tick = now => {
      const t = Math.min(1, (now - begin) / duration);
      bgMusic.volume = start + (target - start) * t;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  musicToggle.addEventListener('click', async () => {
    if (!musicOn) {
      try {
        bgMusic.volume = 0;
        await bgMusic.play();
        fadeTo(0.18, 650);
        setMusicUI(true);
      } catch {
        setMusicUI(false);
      }
    } else {
      fadeTo(0, 350);
      setTimeout(() => bgMusic.pause(), 360);
      setMusicUI(false);
    }
  });
  bgMusic.addEventListener('ended', () => setMusicUI(true));
}

/* MAX FEATURE PACK */
const projectState={items:[],filter:'all',query:'',current:0};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function applyProjectFilters(){
  const grid=$('#workGrid'); if(!grid)return;
  const cards=[...grid.querySelectorAll('.project')]; let shown=0;
  cards.forEach((card,i)=>{const p=projectState.items[i]||{};const hay=(p.title+' '+p.category).toLowerCase();const f=projectState.filter==='all'||hay.includes(projectState.filter);const q=!projectState.query||hay.includes(projectState.query);const ok=f&&q;card.classList.toggle('hidden',!ok);if(ok){shown++;card.classList.remove('match-pop');requestAnimationFrame(()=>card.classList.add('match-pop'))}});
  $('#projectCount').textContent=String(shown).padStart(2,'0')+' PROJECTS';
}
function setupProjectTools(){
  $$('#filterTabs button').forEach(btn=>btn.addEventListener('click',()=>{$$('#filterTabs button').forEach(x=>x.classList.remove('active'));btn.classList.add('active');projectState.filter=btn.dataset.filter||'all';applyProjectFilters()}));
  $('#projectSearch')?.addEventListener('input',e=>{projectState.query=e.target.value.trim().toLowerCase();applyProjectFilters()});
}
setupProjectTools();
const oldRenderProjects=renderProjects;
renderProjects=function(items){projectState.items=items;oldRenderProjects(items);if($('#statProjects')) $('#statProjects').textContent=String(items.length).padStart(2,'0');setupProjectTools();applyProjectFilters();};

// Viewer navigation
function openViewerAt(index){const p=projectState.items[index];if(!p?.src)return;projectState.current=index;openViewer(p);$('#viewerPrev').disabled=projectState.items.length<2;$('#viewerNext').disabled=projectState.items.length<2}
$('#viewerPrev')?.addEventListener('click',()=>{let i=projectState.current-1;if(i<0)i=projectState.items.length-1;openViewerAt(i)});
$('#viewerNext')?.addEventListener('click',()=>{let i=projectState.current+1;if(i>=projectState.items.length)i=0;openViewerAt(i)});
$('#viewerFull')?.addEventListener('click',()=>{$('#viewerVideo')?.requestFullscreen?.()});
const originalOpenViewer=openViewer;openViewer=function(p){const i=projectState.items.findIndex(x=>x.src===p.src);if(i>=0)projectState.current=i;originalOpenViewer(p)};

// Copy-to-clipboard chips + toast
const toast=$('#toast');let toastTimer;function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>toast.classList.remove('show'),1800)}
$$('[data-copy]').forEach(btn=>btn.addEventListener('click',async()=>{try{await navigator.clipboard.writeText(btn.dataset.copy);showToast('Copied to clipboard')}catch{showToast(btn.dataset.copy)}}));

// Back to top
const backTop=$('#backTop');addEventListener('scroll',()=>backTop?.classList.toggle('show',scrollY>700),{passive:true});backTop?.addEventListener('click',()=>scrollTo({top:0,behavior:'smooth'}));

// Keyboard shortcuts / command palette
const palette=$('#palette'),paletteInput=$('#paletteInput'),paletteList=$('#paletteList');
const commands=[['Home','Go to top','#home'],['Work','View selected work','#work'],['Services','View services','#services'],['About','Read about Aryan','#about'],['Contact','Request an edit','#contact'],['Music','Toggle background music','music'],['Fullscreen work','Open first video','first-video']];
function drawCommands(q=''){const list=commands.filter(c=>(c[0]+' '+c[1]).toLowerCase().includes(q.toLowerCase()));paletteList.innerHTML=list.map((c,i)=>`<div class="palette-item ${i===0?'active':''}" data-action="${c[2]}"><b>${esc(c[0])}</b><span>${esc(c[1])}</span></div>`).join('');$$('.palette-item').forEach(x=>x.addEventListener('click',()=>runCommand(x.dataset.action)))}
function runCommand(a){palette.classList.remove('open');palette.setAttribute('aria-hidden','true');if(a.startsWith('#'))document.querySelector(a)?.scrollIntoView({behavior:'smooth'});else if(a==='music')musicToggle?.click();else if(a==='first-video'){$('#workGrid .project:not(.hidden)')?.click()}}
function openPalette(){drawCommands();palette.classList.add('open');palette.setAttribute('aria-hidden','false');setTimeout(()=>paletteInput?.focus(),30)}
palette?.addEventListener('click',e=>{if(e.target===palette){palette.classList.remove('open');palette.setAttribute('aria-hidden','true')}});paletteInput?.addEventListener('input',e=>drawCommands(e.target.value));
addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openPalette()}if(e.key==='Escape'){palette?.classList.remove('open');palette?.setAttribute('aria-hidden','true')}});

// Contact shortcut
$('#contactForm')?.addEventListener('keydown',e=>{if((e.ctrlKey||e.metaKey)&&e.key==='Enter')$('#contactForm').requestSubmit()});

// Active nav link based on section visibility
const sections=[...document.querySelectorAll('main section[id]')];const navMap=new Map($$('.nav-links a').map(a=>[a.getAttribute('href'),a]));const activeObs=new IntersectionObserver(entries=>entries.forEach(en=>{if(en.isIntersecting){navMap.forEach(a=>a.classList.remove('active'));navMap.get('#'+en.target.id)?.classList.add('active')}}),{rootMargin:'-35% 0px -55%'});sections.forEach(s=>activeObs.observe(s));

// Pause background effects/videos when tab is hidden; restore music state when visible.
document.addEventListener('visibilitychange',()=>{if(document.hidden){document.querySelectorAll('.project-video').forEach(v=>v.pause())}});
