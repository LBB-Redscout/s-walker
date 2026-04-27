#!/usr/bin/env node
/**
 * S. Walker — site builder
 * Usage: node build.js
 * Output: dist/index.html (self-contained, ~3MB with embedded audio)
 */

const fs   = require('fs');
const path = require('path');

const c   = JSON.parse(fs.readFileSync('content.json', 'utf8'));
const col = c.colors;

// ── Load audio (optional — skip if file missing) ──
let audioSrc = '';
const audioPath = 'audio/unverified.mp3';
if (fs.existsSync(audioPath)) {
  const b64 = fs.readFileSync(audioPath).toString('base64');
  audioSrc = `data:audio/mpeg;base64,${b64}`;
  console.log(`  ✓ Audio embedded (${(b64.length / 1024 / 1024).toFixed(1)} MB)`);
} else {
  console.warn(`  ⚠  No audio found at ${audioPath} — player will be silent`);
}

// ── Helpers ──
const esc = s => s
  .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
  .replace(/"/g,'&quot;');

const safe = s => s   // allow <strong> through, escape everything else
  .replace(/&(?!amp;|lt;|gt;|quot;)/g, '&amp;')
  .replace(/'/g, '\u2019')
  .replace(/--/g, '\u2014')
  .replace(/\.\.\./g, '\u2026');

const nl2br = s => s.replace(/\n/g, '<br>');

// ── Render sections ──
const renderOffers = () => c.offers.map(o => `
  <div class="offer rv d${c.offers.indexOf(o)+1}">
    <div class="offer-tag">${safe(o.tag)}</div>
    <h2>${nl2br(safe(o.title))}</h2>
    <div class="offer-body">${safe(o.body)}</div>
    <div class="offer-facts">
      ${o.facts.map(f => `<div class="offer-fact">${safe(f)}</div>`).join('')}
    </div>
  </div>`).join('');

const renderTalks = () => c.talks.map((t, i) => `
  <div class="talk rv d${i+1}">
    <div class="talk-n">0${i+1}</div>
    <div class="talk-body">
      <div class="talk-title">${safe(t.title)}</div>
      <div class="talk-desc">${safe(t.desc)}</div>
    </div>
  </div>`).join('');

const renderTestimonials = () => c.testimonials.map((t, i) => `
  <div class="tc rv d${(i%4)+1}">
    <div class="tq">&ldquo;${safe(t.quote)}&rdquo;</div>
    <div class="ta">${safe(t.attr)}</div>
  </div>`).join('');

const renderContactItems = () => c.contact.items.map(item => `
  <div class="ci">
    <div class="ci-k">${safe(item.label)}</div>
    <div class="ci-v">${safe(item.value)}</div>
    ${item.note ? `<div class="ci-n">${safe(item.note)}</div>` : ''}
  </div>`).join('');

const renderAboutParagraphs = () => c.about.paragraphs.map((p,i) => `
  <p class="rv d${i+1}">${safe(p).replace(/&lt;strong&gt;/g,'<strong>').replace(/&lt;\/strong&gt;/g,'</strong>')}</p>`).join('');

// ── CSS ──
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@0,600;0,700;1,400;1,600&display=swap');
*{margin:0;padding:0;box-sizing:border-box}
html{scroll-behavior:smooth}
body{background:${col.bg_primary};color:${col.text_primary};font-family:"Inter",sans-serif;-webkit-font-smoothing:antialiased;overflow-x:hidden}

nav{position:fixed;top:0;left:0;right:0;z-index:900;padding:0 56px;height:62px;display:flex;align-items:center;justify-content:space-between;transition:background .4s,border-color .4s;border-bottom:1px solid transparent}
nav.on{background:rgba(12,11,9,.9);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border-color:rgba(242,237,228,.07)}
.nav-name{font-size:17px;font-weight:800;letter-spacing:-.5px;color:${col.text_primary};opacity:0;transition:opacity .4s}
nav.on .nav-name{opacity:1}.nav-name{text-decoration:none;cursor:pointer}.nav-name{text-decoration:none}
.nav-links{display:flex;gap:44px;list-style:none}
.nav-links a{font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(242,237,228,.85);text-decoration:none;transition:color .2s}
.nav-links a:hover{color:${col.text_primary}}

.hero{position:relative;width:100%;height:100svh;overflow:hidden;display:flex;flex-direction:column;justify-content:flex-end;background:${col.bg_primary}}
.hero-img{position:absolute;inset:0;background:url('${c.photos.hero}') center center/cover no-repeat;will-change:transform}
.hero-img.ken{animation:kenburns 12s ease-in-out forwards}
@keyframes kenburns{0%{transform:scale(1.06)}100%{transform:scale(1)}}
.hero-dim{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(12,11,9,.08) 0%,rgba(12,11,9,0) 20%,rgba(12,11,9,.25) 55%,rgba(12,11,9,.82) 80%,rgba(12,11,9,.97) 100%)}
.hero-body{position:relative;z-index:2;padding:0 72px 80px;max-width:920px}
.hero-pre{font-size:10px;font-weight:700;letter-spacing:4px;text-transform:uppercase;color:rgba(242,237,228,.95);margin-bottom:18px}
.hero-name{font-family:"Inter",sans-serif;font-size:clamp(80px,12vw,168px);font-weight:900;line-height:.87;letter-spacing:-4px;color:${col.text_primary};margin-bottom:28px}
.hero-name em{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:600;color:${col.accent};letter-spacing:-2px}
.hero-line{font-size:clamp(17px,1.8vw,22px);font-weight:400;line-height:1.55;color:rgba(242,237,228,.95);max-width:520px}
.hero-scroll{position:absolute;right:72px;bottom:48px;z-index:2;display:flex;flex-direction:column;align-items:center;gap:10px;font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(242,237,228,.25)}
.hero-scroll-line{width:1px;height:52px;background:rgba(242,237,228,.15);transform-origin:top;animation:spulse 2.2s ease-in-out infinite}
@keyframes spulse{0%,100%{opacity:.15;transform:scaleY(.4)}50%{opacity:.4;transform:scaleY(1)}}
@keyframes up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.hero-pre{animation:up .6s ease .5s both}.hero-name{animation:up .8s ease .65s both}.hero-line{animation:up .6s ease .85s both}

.about{display:grid;grid-template-columns:1fr 1fr;min-height:88vh}
.about-photo{background:url('${c.photos.about}') center center/cover no-repeat;position:relative;overflow:hidden}
.about-photo::after{content:"";position:absolute;inset:0;background:linear-gradient(to right,rgba(12,11,9,0) 55%,rgba(12,11,9,.5) 100%)}
.about-text{background:${col.bg_primary};padding:88px 80px;display:flex;flex-direction:column;justify-content:center;border-left:1px solid rgba(242,237,228,.06)}
.section-label{font-size:10px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(242,237,228,.7);margin-bottom:40px}
.about-text p{font-size:18px;font-weight:400;line-height:1.75;color:rgba(242,237,228,.7);margin-bottom:20px}
.about-text p:last-of-type{margin-bottom:0}
.about-text strong{color:${col.text_primary};font-weight:700}
.about-sig{margin-top:44px;padding-top:28px;border-top:1px solid rgba(242,237,228,.08);font-size:10px;font-weight:500;color:rgba(242,237,228,.6);line-height:2.4;text-transform:uppercase;letter-spacing:.3px}

.break{position:relative;height:65vh;overflow:hidden;display:flex;align-items:center;justify-content:center}
.break-img{position:absolute;inset:0;background:url('${c.photos.break}') center 35%/cover no-repeat}
.break-dim{position:absolute;inset:0;background:rgba(12,11,9,.52)}
.break-quote{position:relative;z-index:2;text-align:center;padding:0 12%;font-size:clamp(22px,3.2vw,40px);font-weight:700;line-height:1.35;color:${col.text_primary};max-width:900px}
.break-quote span{display:block;margin-top:24px;font-size:10px;font-weight:600;letter-spacing:3px;text-transform:uppercase;color:rgba(242,237,228,.85)}

.offers{background:${col.bg_primary};border-top:1px solid rgba(242,237,228,.06)}
.offers-top{padding:80px 72px 0;display:flex;align-items:baseline;justify-content:space-between}
.offers-top-note{font-family:"Cormorant Garamond",serif;font-size:20px;font-style:italic;color:rgba(242,237,228,.7)}
.offers-grid{display:grid;grid-template-columns:1fr 1fr;margin-top:52px;border-top:1px solid rgba(242,237,228,.06)}
.offer{padding:64px 72px;border-right:1px solid rgba(242,237,228,.06);transition:background .25s}
.offer:last-child{border-right:none}
.offer:hover{background:rgba(242,237,228,.02)}
.offer-tag{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${col.accent};margin-bottom:20px}
.offer h2{font-size:40px;font-weight:800;line-height:1.05;color:${col.text_primary};letter-spacing:-1px;margin-bottom:18px}
.offer-body{font-size:17px;font-weight:500;line-height:1.8;color:rgba(242,237,228,.90)}
.offer-facts{margin-top:32px;padding-top:24px;border-top:1px solid rgba(242,237,228,.06);display:flex;flex-direction:column;gap:9px}
.offer-fact{font-size:11px;font-weight:500;color:rgba(242,237,228,.65);display:flex;align-items:baseline;gap:12px}
.offer-fact::before{content:"—";color:${col.accent_dark};flex-shrink:0}

.talks{border-top:1px solid rgba(242,237,228,.06)}
.talks-head{padding:80px 72px 0}
.talk{display:grid;grid-template-columns:88px 1fr;border-top:1px solid rgba(242,237,228,.06);margin-top:40px;cursor:default;transition:background .2s}
.talk:hover{background:rgba(242,237,228,.02)}
.talk-n{padding:52px 0 52px 72px;font-size:56px;font-weight:900;color:rgba(242,237,228,.06);line-height:1}
.talk-body{padding:52px 72px 52px 0}
.talk-title{font-size:24px;font-weight:700;line-height:1.3;color:${col.text_primary};letter-spacing:-.3px;margin-bottom:12px}
.talk-desc{font-size:15px;font-weight:500;line-height:1.85;color:rgba(242,237,228,.72);max-width:600px}

.pod{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(242,237,228,.06);min-height:560px}
.pod-left{background:#080806;padding:80px 72px;display:flex;flex-direction:column;justify-content:center;border-right:1px solid rgba(242,237,228,.05)}
.pod-tag{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:${col.accent};margin-bottom:18px}
.pod-title{font-size:72px;font-weight:900;line-height:.88;color:${col.text_primary};letter-spacing:-3px;margin-bottom:8px}
.pod-sub{font-size:12px;font-weight:500;color:rgba(242,237,228,.25);margin-bottom:44px}
.wf{display:flex;align-items:center;gap:2px;height:40px;margin-bottom:16px}
.wf .b{width:2.5px;border-radius:2px;background:${col.accent};opacity:.14;transition:opacity .06s}
.wf .b.pl{opacity:.55}.wf .b.ac{animation:bw .55s ease-in-out infinite alternate}
@keyframes bw{0%{opacity:.14;transform:scaleY(.45)}100%{opacity:.65;transform:scaleY(1.4)}}
.pt{height:2px;background:rgba(242,237,228,.06);border-radius:1px;margin-bottom:20px;position:relative;cursor:pointer}
.pf{position:absolute;top:0;left:0;height:100%;background:${col.accent};border-radius:1px;width:0}
.play-row{display:flex;align-items:center;gap:20px}
.pbtn{width:52px;height:52px;border-radius:50%;border:1.5px solid rgba(143,170,112,.35);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;flex-shrink:0}
.pbtn:hover{background:rgba(143,170,112,.1);border-color:${col.accent}}
.pbtn svg{fill:${col.accent}}
.ts{font-size:11px;font-weight:500;color:rgba(242,237,228,.2)}
.pod-right{background:#060604;padding:80px 80px;display:flex;flex-direction:column;justify-content:center}
.pod-right h3{font-size:36px;font-weight:700;line-height:1.25;color:${col.text_primary};letter-spacing:-.5px;margin-bottom:28px}
.pod-right p{font-size:15px;font-weight:400;line-height:1.85;color:rgba(242,237,228,.45);margin-bottom:12px}

.words{border-top:1px solid rgba(242,237,228,.06)}
.words-hed{padding:80px 72px 0;font-size:clamp(40px,5.5vw,64px);font-weight:900;line-height:1.0;letter-spacing:-2px;color:${col.text_primary}}
.words-hed em{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:400;color:${col.accent};letter-spacing:-1px}
.tgrid{display:grid;grid-template-columns:1fr 1fr 1fr;gap:1px;background:rgba(242,237,228,.06);margin-top:64px}
.tc{background:${col.bg_primary};padding:48px 44px;transition:background .2s}
.tc:nth-child(2n){background:#0a0908}
.tc:hover{background:#111009}
.tq{font-size:17px;font-weight:400;line-height:1.68;color:rgba(242,237,228,.78);margin-bottom:20px}
.ta{font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(242,237,228,.25)}

.sub{background:#161e10;padding:88px 72px;border-top:1px solid rgba(242,237,228,.04);display:grid;grid-template-columns:1fr auto;gap:64px;align-items:center}
.sub-tag{font-size:9px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:rgba(160,200,130,.35);margin-bottom:14px}
.sub h3{font-size:40px;font-weight:800;letter-spacing:-1px;line-height:1.1;color:#c8ddb8;margin-bottom:14px}
.sub p{font-size:15px;font-weight:400;line-height:1.85;color:rgba(160,200,130,.4);max-width:500px}
.sub-right{display:flex;flex-direction:column;align-items:flex-end;gap:16px;flex-shrink:0}
.sub-num{font-size:68px;font-weight:900;color:#c8ddb8;line-height:.9;text-align:right;letter-spacing:-2px}
.sub-num small{display:block;font-size:9px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:rgba(160,200,130,.3);margin-top:6px}
.sub-btn{padding:15px 36px;background:${col.accent_dark};color:#c8ddb8;border:none;cursor:pointer;font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;transition:background .2s;white-space:nowrap}
.sub-btn:hover{background:#2e4020}
.sub-note{font-size:9px;font-weight:500;color:rgba(160,200,130,.2);letter-spacing:.5px;text-align:right}

.contact{background:#080806;padding:120px 72px;border-top:1px solid rgba(242,237,228,.04);display:grid;grid-template-columns:1fr 1fr;gap:80px;align-items:start}
.contact-l h2{font-size:clamp(56px,7.5vw,92px);font-weight:900;line-height:.92;letter-spacing:-3px;color:${col.text_primary};margin-bottom:24px}
.contact-l h2 em{font-family:"Cormorant Garamond",serif;font-style:italic;font-weight:600;color:${col.accent}}
.contact-l p{font-size:15px;font-weight:400;line-height:1.85;color:rgba(242,237,228,.3);max-width:420px}
.contact-r{padding-top:8px}
.ci{margin-bottom:36px}
.ci-k{font-size:9px;font-weight:700;letter-spacing:2.5px;text-transform:uppercase;color:${col.accent};margin-bottom:8px}
.ci-v{font-size:22px;font-weight:600;color:${col.text_primary}}
.ci-n{font-size:13px;color:rgba(242,237,228,.25);margin-top:4px}
.cta{display:inline-block;margin-top:8px;padding:17px 44px;background:${col.accent_dark};color:#c8ddb8;border:none;cursor:pointer;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;transition:background .2s}
.cta:hover{background:#2e4020}

footer{background:#060604;padding:24px 72px;border-top:1px solid rgba(242,237,228,.04);display:flex;justify-content:space-between;align-items:center}
.foot-n{font-size:15px;font-weight:800;color:rgba(242,237,228,.3)}
.foot-d{font-size:9px;font-weight:500;color:rgba(242,237,228,.15);letter-spacing:.5px}

.rv{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s ease}
.rv.in{opacity:1;transform:none}
.rv.d1{transition-delay:.1s}.rv.d2{transition-delay:.2s}.rv.d3{transition-delay:.3s}.rv.d4{transition-delay:.4s}

@media(max-width:880px){
  nav{padding:0 24px}.nav-links{display:none}
  .hero-body{padding:0 28px 60px}.hero-scroll{display:none}
  .about{grid-template-columns:1fr}.about-photo{height:65vw}.about-text{padding:56px 28px}
  .offers-top{padding:56px 28px 0;flex-direction:column;gap:12px}
  .offers-grid{grid-template-columns:1fr;margin-top:32px}
  .offer{padding:48px 28px;border-right:none;border-bottom:1px solid rgba(242,237,228,.06)}
  .talks-head{padding:56px 28px 0}
  .talk{grid-template-columns:52px 1fr}
  .talk-n{padding:36px 0 36px 28px;font-size:36px}.talk-body{padding:36px 28px 36px 0}
  .pod{grid-template-columns:1fr;min-height:auto}.pod-left,.pod-right{padding:56px 28px}
  .pod-title{font-size:52px}
  .words-hed{padding:56px 28px 0}.tgrid{grid-template-columns:1fr}.tc{padding:40px 28px}
  .sub{grid-template-columns:1fr;padding:56px 28px;gap:36px}.sub-right{align-items:flex-start}
  .contact{grid-template-columns:1fr;padding:72px 28px;gap:48px}
  footer{padding:20px 28px;flex-direction:column;gap:8px;text-align:center}
}
`;

// ── JS ──
const JS = `
const himg = document.getElementById('himg');
setTimeout(() => himg.classList.add('ken'), 100);
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('on', window.scrollY > 80), {passive:true});
const obs = new IntersectionObserver(entries => {
  entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('in'); });
}, {threshold:.1, rootMargin:'0px 0px -20px 0px'});
document.querySelectorAll('.rv').forEach(el => obs.observe(el));
const wfEl = document.getElementById('wf');
const bars = [];
for(let i=0;i<90;i++){const b=document.createElement('div');b.className='b';b.style.height=(Math.random()*30+4)+'px';wfEl.appendChild(b);bars.push(b);}
const aud = document.getElementById('aud');
const pbtn=document.getElementById('pb'), picon=document.getElementById('pi');
const pfEl=document.getElementById('pf'), tsEl=document.getElementById('ts'), ptEl=document.getElementById('pt');
let raf=null;
const fmt=s=>(!isFinite(s)||isNaN(s))?'0:00':\`\${Math.floor(s/60)}:\${String(Math.floor(s%60)).padStart(2,'0')}\`;
function tick(){
  const p=aud.currentTime/(aud.duration||1);
  const n=Math.floor(p*bars.length);
  bars.forEach((b,i)=>{b.classList.remove('pl','ac');if(i<n-1)b.classList.add('pl');else if(i===n-1||i===n)b.classList.add('ac');});
  pfEl.style.width=(p*100)+'%';
  tsEl.textContent=fmt(aud.currentTime)+' / '+fmt(aud.duration);
  if(!aud.paused)raf=requestAnimationFrame(tick);
}
pbtn.addEventListener('click',()=>{
  if(aud.paused){aud.play();picon.innerHTML="<rect x='3' y='2' width='5' height='20' rx='1'/><rect x='16' y='2' width='5' height='20' rx='1'/>";raf=requestAnimationFrame(tick);}
  else{aud.pause();picon.innerHTML="<polygon points='3,2 22,12 3,22'/>";cancelAnimationFrame(raf);bars.forEach(b=>b.classList.remove('ac'));}
});
aud.addEventListener('ended',()=>{picon.innerHTML="<polygon points='3,2 22,12 3,22'/>";bars.forEach(b=>b.classList.remove('ac'));pfEl.style.width='100%';});
ptEl.addEventListener('click',e=>{aud.currentTime=((e.clientX-ptEl.getBoundingClientRect().left)/ptEl.offsetWidth)*(aud.duration||0);tick();});
aud.addEventListener('loadedmetadata',()=>tsEl.textContent='0:00 / '+fmt(aud.duration));
document.getElementById('ctabtn').addEventListener('click',function(){const t=this.textContent;this.textContent="He won\\u2019t Zoom.";setTimeout(()=>this.textContent=t,2800);});
document.getElementById('subbtn').addEventListener('click',function(){const t=this.textContent;this.textContent="One dispatch. Ever.";setTimeout(()=>this.textContent=t,2500);});
`;

// ── Assemble HTML ──
const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(c.meta.title)}</title>
<style>${CSS}</style>
</head>
<body>

<nav id="nav">
  <a href="#top" class="nav-name">${esc(c.meta.title)}</a>
  <ul class="nav-links">
    <li><a href="#about">About</a></li>
    <li><a href="#work">Work</a></li>
    <li><a href="#listen">Listen</a></li>
    <li><a href="#contact">Book</a></li>
    <li><a href="https://www.linkedin.com/in/s-walker-pnw1962/" target="_blank">LinkedIn</a></li>
  </ul>
</nav>

<section class="hero">
  <div class="hero-img" id="himg"></div>
  <div class="hero-dim"></div>
  <div class="hero-body">
    <div class="hero-pre">${safe(c.hero.eyebrow)}</div>
    <h1 class="hero-name">${safe(c.hero.name_top)}<br><em>${safe(c.hero.name_bot)}</em></h1>
    <p class="hero-line">${safe(c.hero.tagline)}</p>
  </div>
  <div class="hero-scroll"><div class="hero-scroll-line"></div>Scroll</div>
</section>

<section class="about" id="about">
  <div class="about-photo"></div>
  <div class="about-text">
    <div class="section-label rv">About</div>
    ${renderAboutParagraphs()}
    <div class="about-sig rv">${c.about.footnote.map(safe).join('<br>')}</div>
  </div>
</section>

<div class="break">
  <div class="break-img"></div>
  <div class="break-dim"></div>
  <div class="break-quote rv">
    ${safe(c.break_quote)}
    <span>Resilience Strategist &middot; Pacific Northwest</span>
  </div>
</div>

<section class="offers" id="work">
  <div class="offers-top">
    <div class="section-label rv">What he does</div>
    <div class="offers-top-note rv d1">He doesn&rsquo;t come to you.</div>
  </div>
  <div class="offers-grid">${renderOffers()}</div>
</section>

<section class="talks">
  <div class="talks-head"><div class="section-label rv">Signature talks</div></div>
  ${renderTalks()}
</section>

<section class="pod" id="listen">
  <div class="pod-left rv">
    <div class="pod-tag">Listen</div>
    <div class="pod-title">${safe(c.podcast.title)}</div>
    <div class="pod-sub">${safe(c.podcast.subtitle)}</div>
    <div class="wf" id="wf"></div>
    <div class="pt" id="pt"><div class="pf" id="pf"></div></div>
    <div class="play-row">
      <button class="pbtn" id="pb"><svg id="pi" width="20" height="20" viewBox="0 0 24 24"><polygon points="3,2 22,12 3,22"/></svg></button>
      <span class="ts" id="ts">0:00 / 2:20</span>
    </div>
  </div>
  <div class="pod-right rv d2">
    <h3>${nl2br(safe(c.podcast.copy_hed))}</h3>
    <p>${safe(c.podcast.copy_p1)}</p>
    <p>${safe(c.podcast.copy_p2)}</p>
  </div>
</section>

<section class="words">
  <div class="words-hed rv">What people say<br>after they <em>find</em> him.</div>
  <div class="tgrid">${renderTestimonials()}</div>
</section>

<section class="sub" id="substack">
  <div>
    <div class="sub-tag rv">${safe(c.substack.tag)}</div>
    <h3 class="rv d1">${nl2br(safe(c.substack.title))}</h3>
    <p class="rv d2">${safe(c.substack.body)}</p>
  </div>
  <div class="sub-right rv d2">
    <div class="sub-num">${safe(c.substack.dispatch_count)}<small>${safe(c.substack.dispatch_label)}</small></div>
    <button class="sub-btn" id="subbtn">Subscribe</button>
    <div class="sub-note">${safe(c.substack.url)}</div>
  </div>
</section>

<section class="contact" id="contact">
  <div class="contact-l rv">
    <h2>${safe(c.contact.heading_top)}<br>to <em>${safe(c.contact.heading_bot)}</em></h2>
    <p>${safe(c.contact.body)}</p>
  </div>
  <div class="contact-r rv d2">
    ${renderContactItems()}
    <button class="cta" id="ctabtn">${safe(c.contact.cta)}</button>
  </div>
</section>

<footer>
  <div class="foot-n">${esc(c.meta.title)}</div>
  <div class="foot-d">${esc(c.meta.url_linkedin)} &middot; ${esc(c.meta.url_substack)}</div>
</footer>

<audio id="aud" preload="auto">${audioSrc ? `<source src="${audioSrc}" type="audio/mpeg">` : ''}</audio>
<script>${JS}<\/script>
</body>
</html>`;

// ── Write output ──
if (!fs.existsSync('dist')) fs.mkdirSync('dist');
fs.writeFileSync('dist/index.html', HTML);
const size = fs.statSync('dist/index.html').size;
console.log(`  ✓ Built dist/index.html (${(size/1024/1024).toFixed(1)} MB)`);
