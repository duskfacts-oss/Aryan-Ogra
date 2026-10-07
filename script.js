const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const pre=$('.preloader');
window.addEventListener('load',()=>setTimeout(()=>pre?.classList.add('done'),700));

let projects=[];
const titleMap={
  'EDIT.mp4':'Coca-Cola Concept','gaming.mp4':'Game Edit','patipolio.mp4':'Personal Growth','portfolio.mp4':'Portfolio Motion','potopolio.mp4':'Creative Short','1006-2.mp4':'Gaming Edit'
};
const catMap={
  'EDIT.mp4':['shorts','motion','PRODUCT / MOTION / SHORT-FORM'],
  'gaming.mp4':['gaming','GAMING / PACE / CAPTIONS'],
  'patipolio.mp4':['shorts','SHORT-FORM / STORYTELLING'],
  'portfolio.mp4':['motion','MOTION / TRANSITIONS / DESIGN'],
  'potopolio.mp4':['shorts','motion','SHORT-FORM / RHYTHM / VISUALS'],
  '1006-2.mp4':['gaming','GAMING / ACTION / EDITING']
};
function infer(file){
 const n=file.toLowerCase();
 if(/gaming|game|valorant|minecraft|fortnite|1006/.test(n)) return ['gaming','GAMING / EDITING'];
 if(/motion|portfolio|logo|animation/.test(n)) return ['motion','MOTION / DESIGN'];
 return ['shorts','SHORT-FORM / EDITING'];
}
function makeProject(file,i){
 const m=catMap[file]; const inferred=infer(file); const types=m?.slice(0,-1) || [inferred[0]];
 const cat=m?.at(-1) || inferred[1];
 const title=titleMap[file] || file.replace(/\.mp4$/i,'').replace(/[-_]+/g,' ').replace(/\b\w/g,x=>x.toUpperCase());
 return {file,title,types,cat,index:String(i+1).padStart(2,'0')};
}
function posterFor(file){return `assets/${file.replace(/\.mp4$/i,'.jpg')}`}
function renderProjects(){
 const grid=$('#projectGrid'); if(!grid)return;
 grid.innerHTML='';
 projects.forEach((p)=>{
   const card=document.createElement('article'); card.className='project reveal'; card.dataset.type=p.types.join(' '); card.dataset.video=`assets/${p.file}`; card.dataset.title=p.title; card.dataset.cat=p.cat; card.dataset.cursor='OPEN';
   card.innerHTML = `
  <div class="project-media">
    <video
      preload="auto"
      muted
      loop
      playsinline
      src="./assets/${p.file}">
    </video>

    <div class="project-overlay"></div>
    <span class="project-index">${p.index}</span>
    <button class="open-project" aria-label="Open ${p.title}">↗</button>
    <span class="play-hint">HOVER TO PLAY</span>
  </div>

  <div class="project-info">
    <div>
      <span>${p.cat}</span>
      <h3>${p.title}</h3>
    </div>
    <b>↗</b>
  </div>
`;<div class="project-overlay"></div><span class="project-index">${p.index}</span><button class="open-project" aria-label="Open ${p.title}">↗</button><span class="play-hint">HOVER TO PLAY</span></div><div class="project-info"><div><span>${p.cat}</span><h3>${p.title}</h3></div><b>↗</b></div>`;
   grid.appendChild(card);
   const v=card.querySelector('video');
   card.addEventListener('mouseenter',()=>{   v.load();   v.play().catch(err=>console.log('Video play error:',err)); });
   card.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0});
   card.addEventListener('click',e=>{if(e.target.closest('.open-project')||e.currentTarget===card)openProject(card)});
   observer?.observe(card);
 });
 updateCounts();
}
function updateCounts(){
 $('#countAll').textContent=projects.length;
 $('#countShorts').textContent=projects.filter(p=>p.types.includes('shorts')).length;
 $('#countGaming').textContent=projects.filter(p=>p.types.includes('gaming')).length;
 $('#countMotion').textContent=projects.filter(p=>p.types.includes('motion')).length;
}
async function loadProjects(){
 try{
   const r=await fetch(`projects.json?v=${Date.now()}`,{cache:'no-store'});
   if(!r.ok)throw new Error('projects.json missing');
   const list=await r.json();
   projects=list.map((x,i)=>makeProject(x.file||x,i));
 }catch(e){
   const files=['EDIT.mp4','gaming.mp4','patipolio.mp4','portfolio.mp4','potopolio.mp4','1006-2.mp4'];
   projects=files.map((f,i)=>makeProject(f,i));
 }
 renderProjects();
}

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));
loadProjects();

const dot=$('.cursor-dot'),ring=$('.cursor-ring'),label=$('.cursor-label');let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(dot){dot.style.left=mx+'px';dot.style.top=my+'px'}});
function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';label.style.left=rx+'px';label.style.top=ry+'px'}requestAnimationFrame(cursorLoop)}cursorLoop();
function bindCursor(){ $$('[data-cursor],a,button,.magnetic').forEach(el=>{if(el.dataset.bound)return;el.dataset.bound='1';el.addEventListener('mouseenter',()=>{ring?.classList.add('big');if(label){label.textContent=el.dataset.cursor||'GO';label.style.opacity=el.dataset.cursor?'1':'0'}});el.addEventListener('mouseleave',()=>{ring?.classList.remove('big');if(label)label.style.opacity='0'})}); }
bindCursor();
if(matchMedia('(pointer:fine)').matches){document.addEventListener('mousemove',e=>{$$('.magnetic').forEach(el=>{if(el.matches(':hover')){const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`}})});$$('.magnetic').forEach(el=>el.addEventListener('mouseleave',()=>el.style.transform=''));}
const tilt=$('.tilt');if(tilt&&matchMedia('(pointer:fine)').matches){tilt.addEventListener('mousemove',e=>{const r=tilt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) scale(1.01)`});tilt.addEventListener('mouseleave',()=>tilt.style.transform='')}

$$('.filters button').forEach(btn=>btn.addEventListener('click',()=>{ $$('.filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;$$('.project').forEach(c=>{c.style.display=f==='all'||c.dataset.type.includes(f)?'':'none'}) }));
const modal=$('#modal'),mv=$('#modalVideo'),mt=$('#modalTitle'),mc=$('#modalCat');
function openProject(card){mv.src=card.dataset.video;mt.textContent=card.dataset.title;mc.textContent=card.dataset.cat;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';mv.play().catch(()=>{})}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');mv.pause();mv.removeAttribute('src');mv.load();document.body.style.overflow=''}
$('.hero-play')?.addEventListener('click',()=>openProject({dataset:{video:'assets/EDIT.mp4',title:'Coca-Cola Concept',cat:'PRODUCT / MOTION / SHORT-FORM'}}));
$('.modal-close')?.addEventListener('click',closeProject);modal?.addEventListener('click',e=>{if(e.target===modal)closeProject()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProject();closeStartDialog()}});
const startDialog=$('#startDialog'),dialogYes=$('#dialogYes'),dialogNo=$('#dialogNo');
function openStartDialog(){startDialog.classList.add('open');startDialog.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeStartDialog(){startDialog.classList.remove('open');startDialog.setAttribute('aria-hidden','true');document.body.style.overflow=''}
$$('.start-project').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openStartDialog()}));
dialogYes?.addEventListener('click',()=>{closeStartDialog();setTimeout(()=>$('#contact')?.scrollIntoView({behavior:'smooth'}),80)});dialogNo?.addEventListener('click',closeStartDialog);startDialog?.addEventListener('click',e=>{if(e.target===startDialog)closeStartDialog()});
$('#requestForm')?.addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const subject=encodeURIComponent('Editing request from '+d.get('name'));const body=encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\nService: ${d.get('service')}\nPlatform: ${d.get('platform')}\nDeadline: ${d.get('deadline')}\n\nProject brief:\n${d.get('message')}`);document.querySelector('#successScreen')?.classList.add('open');document.querySelector('#successScreen')?.setAttribute('aria-hidden','false');window.location.href=`mailto:duskfacts@gmail.com?subject=${subject}&body=${body}`});
window.addEventListener('scroll',()=>document.documentElement.style.setProperty('--scrollY',window.scrollY));

// Interface sound toggle + editing easter egg
let soundOn=true, audioCtx=null;
function uiBeep(){ if(!soundOn) return; audioCtx ||= new (window.AudioContext||window.webkitAudioContext)(); const o=audioCtx.createOscillator(), g=audioCtx.createGain(); o.frequency.value=520; g.gain.value=.025; o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+.045); }
$('#soundToggle')?.addEventListener('click',()=>{soundOn=!soundOn;$('#soundToggle span').textContent=soundOn?'ON':'OFF';uiBeep()});
document.addEventListener('click',e=>{if(e.target.closest('button,.button,a'))uiBeep()});
$('#successClose')?.addEventListener('click',()=>{const x=$('#successScreen');x?.classList.remove('open');x?.setAttribute('aria-hidden','true')});
let keys=''; document.addEventListener('keydown',e=>{keys=(keys+e.key.toLowerCase()).slice(-6); if(keys==='editor'){document.body.classList.toggle('edit-mode'); uiBeep();}});
