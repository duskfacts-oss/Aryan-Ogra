const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const pre=$('.preloader');
window.addEventListener('load',()=>setTimeout(()=>pre.classList.add('done'),900));

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

// Cursor + magnetic interactions on desktop.
const dot=$('.cursor-dot'), ring=$('.cursor-ring'), label=$('.cursor-label');
let mx=innerWidth/2,my=innerHeight/2,rx=mx,ry=my;
window.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;if(dot){dot.style.left=mx+'px';dot.style.top=my+'px'}});
function cursorLoop(){rx+=(mx-rx)*.16;ry+=(my-ry)*.16;if(ring){ring.style.left=rx+'px';ring.style.top=ry+'px';label.style.left=rx+'px';label.style.top=ry+'px'}requestAnimationFrame(cursorLoop)}cursorLoop();
$$('[data-cursor],a,button,.magnetic').forEach(el=>{el.addEventListener('mouseenter',()=>{ring?.classList.add('big');if(label){label.textContent=el.dataset.cursor||'GO';label.style.opacity=el.dataset.cursor?'1':'0'}});el.addEventListener('mouseleave',()=>{ring?.classList.remove('big');if(label)label.style.opacity='0'})});

// Magnetic buttons.
if(matchMedia('(pointer:fine)').matches){$$('.magnetic').forEach(el=>el.addEventListener('mousemove',e=>{const r=el.getBoundingClientRect();el.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.12}px,${(e.clientY-r.top-r.height/2)*.12}px)`}));$$('.magnetic').forEach(el=>el.addEventListener('mouseleave',()=>el.style.transform=''))}

// Gentle tilt on featured card.
const tilt=$('.tilt');if(tilt&&matchMedia('(pointer:fine)').matches){tilt.addEventListener('mousemove',e=>{const r=tilt.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;tilt.style.transform=`perspective(900px) rotateX(${-y*5}deg) rotateY(${x*5}deg) rotate(0deg) scale(1.01)`});tilt.addEventListener('mouseleave',()=>tilt.style.transform='')}

// Portfolio hover playback.
$$('.project').forEach(card=>{const v=card.querySelector('video');card.addEventListener('mouseenter',()=>v.play().catch(()=>{}));card.addEventListener('mouseleave',()=>{v.pause();v.currentTime=0});});

// Filters.
$$('.filters button').forEach(btn=>btn.addEventListener('click',()=>{$$('.filters button').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;$$('.project').forEach(c=>{const show=f==='all'||c.dataset.type.includes(f);c.style.display=show?'':'none'})}));

// Modal project viewer.
const modal=$('#modal'),mv=$('#modalVideo'),mt=$('#modalTitle'),mc=$('#modalCat');
function openProject(card){mv.src=card.dataset.video;mt.textContent=card.dataset.title;mc.textContent=card.dataset.cat;modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';mv.play().catch(()=>{})}
function closeProject(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');mv.pause();mv.removeAttribute('src');mv.load();document.body.style.overflow=''}
$$('.project,.open-project').forEach(el=>el.addEventListener('click',e=>{if(e.target.closest('.open-project')||el.classList.contains('project'))openProject(el.closest('.project')||el)}));
$('.hero-play').addEventListener('click',()=>openProject({dataset:{video:'assets/EDIT.mp4',title:'Coca-Cola Concept',cat:'PRODUCT / MOTION / SHORT-FORM'}}));
$('.modal-close').addEventListener('click',closeProject);modal.addEventListener('click',e=>{if(e.target===modal)closeProject()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeProject();closeStartDialog()}});

// Start-a-project confirmation.
const startDialog=$('#startDialog'), dialogYes=$('#dialogYes'), dialogNo=$('#dialogNo');
function openStartDialog(){startDialog.classList.add('open');startDialog.setAttribute('aria-hidden','false');document.body.style.overflow='hidden'}
function closeStartDialog(){startDialog.classList.remove('open');startDialog.setAttribute('aria-hidden','true');document.body.style.overflow=''}
$$('.start-project').forEach(el=>el.addEventListener('click',e=>{e.preventDefault();openStartDialog()}));
dialogYes?.addEventListener('click',()=>{closeStartDialog();setTimeout(()=>$('#contact')?.scrollIntoView({behavior:'smooth'}),80)});
dialogNo?.addEventListener('click',closeStartDialog);
startDialog?.addEventListener('click',e=>{if(e.target===startDialog)closeStartDialog()});
// Request form.
$('#requestForm').addEventListener('submit',e=>{e.preventDefault();const d=new FormData(e.currentTarget);const subject=encodeURIComponent('Editing request from '+d.get('name'));const body=encodeURIComponent(`Name: ${d.get('name')}\nEmail: ${d.get('email')}\n\nProject brief:\n${d.get('message')}`);window.location.href=`mailto:duskfacts@gmail.com?subject=${subject}&body=${body}`});

// Small parallax for the background grid.
window.addEventListener('scroll',()=>{document.documentElement.style.setProperty('--scrollY',window.scrollY)});
