const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
window.addEventListener('load',()=>setTimeout(()=>$('#loader')?.classList.add('done'),650));
const menu=$('#menuBtn'), nav=$('#navLinks'); menu?.addEventListener('click',()=>nav.classList.toggle('open')); $$('.nav-links a').forEach(a=>a.addEventListener('click',()=>nav.classList.remove('open')));
const obs=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.1}); $$('.reveal').forEach(x=>obs.observe(x));
const cursor=$('#cursor'),ring=$('#cursorRing'); if(cursor&&ring && matchMedia('(pointer:fine)').matches){addEventListener('mousemove',e=>{cursor.style.left=e.clientX+'px';cursor.style.top=e.clientY+'px';ring.style.left=e.clientX+'px';ring.style.top=e.clientY+'px'}); $$('.magnetic,.project,.reel-btn').forEach(el=>{el.addEventListener('mouseenter',()=>ring.classList.add('big'));el.addEventListener('mouseleave',()=>ring.classList.remove('big'))})}
$$('.tilt').forEach(el=>el.addEventListener('mousemove',e=>{if(!matchMedia('(pointer:fine)').matches)return;const r=el.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;el.style.transform=`translate(-50%,-50%) rotateY(${x*7}deg) rotateX(${-y*7}deg) rotate(-4deg)`;el.style.transition='none'})); $$('.tilt').forEach(el=>el.addEventListener('mouseleave',()=>{el.style.transform='translate(-50%,-50%) rotate(-5deg)';el.style.transition='.5s ease'}));
const PROJECTS = [
  // Add your videos here. Example:
  // {src:'assets/my-edit.mp4', title:'My Gaming Edit', category:'Gaming Edit', number:'01', label:'MY\nEDIT'},
];

function renderProjects(items){
  const grid=$('#workGrid');
  grid.innerHTML='';
  items.forEach((p,i)=>{
    const a=document.createElement('article');
    a.className='project reveal';
    a.innerHTML=`<div class="project-visual"><div class="project-fallback"><span class="project-number">${p.number||String(i+1).padStart(2,'0')}</span><span class="project-play">▶</span><div class="project-label">${(p.label||p.title).replaceAll('\\n','<br>')}</div></div>${p.src?`<video class="project-video" src="${p.src}" muted loop playsinline preload="metadata"></video>`:''}<div class="project-overlay"></div></div><div class="project-meta"><div><h3>${escapeHtml(p.title)}</h3><p>${escapeHtml(p.category||'Video Edit')}</p></div><span>↗</span></div>`;
    grid.appendChild(a);
    const v=a.querySelector('video');
    a.addEventListener('click',()=>openViewer(p));
    a.addEventListener('mouseenter',()=>v?.play().catch(()=>{}));
    a.addEventListener('mouseleave',()=>{if(v){v.pause();v.currentTime=0}});
    obs.observe(a);
  });
  $('#projectCount').textContent=String(items.length).padStart(2,'0')+' PROJECTS';
  $('#emptyWork').style.display=items.length?'none':'block';
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
renderProjects(PROJECTS);

function openViewer(p){
  if(!p.src)return;
  const v=$('#viewerVideo');
  v.src=p.src;
  $('#viewerTitle').textContent=p.title;
  $('#viewerCategory').textContent=p.category||'Video Edit';
  $('#viewer').classList.add('open');
  $('#viewer').setAttribute('aria-hidden','false');
  v.play().catch(()=>{});
}
function closeViewer(){
  const v=$('#viewerVideo');
  v.pause();v.removeAttribute('src');v.load();
  $('#viewer').classList.remove('open');
  $('#viewer').setAttribute('aria-hidden','true');
}
$('#viewerClose')?.addEventListener('click',closeViewer);
$('#viewer')?.addEventListener('click',e=>{if(e.target.id==='viewer')closeViewer()});
addEventListener('keydown',e=>{if(e.key==='Escape')closeViewer()});
$('#reelBtn')?.addEventListener('click',()=>{
  const first=PROJECTS.find(p=>p.src);
  if(first) openViewer(first);
  else document.querySelector('#work')?.scrollIntoView({behavior:'smooth'});
});

// Extra motion: magnetic controls + pointer glow + scroll progress
const root=document.documentElement;
const progress=document.createElement('div');progress.className='scroll-progress';document.body.appendChild(progress);
addEventListener('scroll',()=>{const h=document.documentElement.scrollHeight-innerHeight;progress.style.transform=`scaleX(${h?scrollY/h:0})`},{passive:true});
if(matchMedia('(pointer:fine)').matches){
  $$('.magnetic').forEach(el=>{el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.10}px,${(e.clientY-r.top-r.height/2)*.10}px)`});el.addEventListener('mouseleave',()=>el.style.transform='')});
  const glow=document.createElement('div');glow.className='pointer-glow';document.body.appendChild(glow);
  addEventListener('mousemove',e=>{glow.style.left=e.clientX+'px';glow.style.top=e.clientY+'px'},{passive:true});
}
