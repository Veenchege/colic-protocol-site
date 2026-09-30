/* Colic Protocol site search. One file, no dependencies.
   Add <script src="/search.js" defer></script> before </body> on any page.
   To add a new post to search, append an entry to DATA (or paste from the blog cards). */
(function(){
'use strict';
var DATA=[{"u": "/quiz.html", "c": "page", "t": "Free 90-Second Colic Assessment", "d": "Find out whether gut, nervous system, or feeding mechanics is driving your baby's crying.", "r": ""}, {"u": "/midnight-protocol.html", "c": "page", "t": "Midnight Protocol: Crying Right Now?", "d": "A guided, timed step-by-step protocol for tonight.", "r": ""}, {"u": "/blueprint.html", "c": "page", "t": "The Calm Baby Blueprint", "d": "The complete diagnostic and management system, with the 72-hour guarantee.", "r": ""}, {"u": "/about.html", "c": "page", "t": "About Vincent", "d": "The epidemiologist and dad behind Colic Protocol, and the story of his daughter Zion.", "r": ""}, {"u": "/blog/breastfeeding-latch-technique.html", "c": "techniques", "t": "Your Baby Is Latched. But Are They Actually Feeding?", "d": "When a baby doesn't attach deeply enough to the breast, they swallow more air with every suck. The three latch signals to observe, the Flipple technique, and how fast milk flow and true oversupply are two different problems requiring different fixes.", "r": "9 min read"}, {"u": "/blog/infant-gut-microbiome-colic.html", "c": "evidence", "t": "Infant Gut Microbiome and Colic: What the Research Shows", "d": "The full evidence base, including the 32-trial meta-analysis most content never cites, and why strain specificity is the detail that actually matters.", "r": "8 min read"}, {"u": "/blog/gripe-water-vs-gas-drops.html", "c": "evidence", "t": "Gripe Water vs Gas Drops for Colic: What the Research Actually Shows", "d": "Neither product has passed a randomized controlled trial for colic. Comparing two evidence-free products is the wrong question. Here's the right one.", "r": "8 min read"}, {"u": "/blog/does-gripe-water-work.html", "c": "evidence", "t": "Does Gripe Water Work for Colic? A Parent's Guide to the Evidence", "d": "It calmed the baby for fifteen minutes, then the crying came back. That's not a coincidence. What to try tonight instead.", "r": "6 min read"}, {"u": "/blog/gut-vs-nervous-system-colic.html", "c": "diagnosis", "t": "Gut Colic vs Nervous System Colic: What's Actually Causing the Crying", "d": "The two most common root-cause types, compared directly. Why the same technique can help one baby and do nothing for the other.", "r": "8 min read"}, {"u": "/blog/acoustic-overload-newborn.html", "c": "diagnosis", "t": "Acoustic Overload in Newborns: The Colic Trigger Nobody Talks About", "d": "The least-known of the three root-cause systems. Why brown noise works and white noise doesn't, and the common soothing mistakes.", "r": "7 min read"}, {"u": "/blog/why-colic-remedies-stop-working.html", "c": "diagnosis", "t": "Why Colic Remedies Stop Working (And What's Actually Going On)", "d": "You're not doing it wrong. Single-system fixes applied to a multi-system problem create temporary relief, not resolution.", "r": "7 min read"}, {"u": "/blog/how-to-survive-colic.html", "c": "support", "t": "How to Survive Colic Without Losing Your Mind", "d": "Your stress is part of the picture, not a side issue. What genuinely helps, what to tell your partner, and the decision tree for tonight.", "r": "7 min read"}, {"u": "/blog/nervous-system-dysregulation-colic.html", "c": "diagnosis", "t": "Nervous System Dysregulation and Colic: Why Evenings Are Worse", "d": "The most common self-identified type in our own quiz data, but the one with zero standalone content until now. Why rocking harder backfires, and why brown noise works when louder doesn't.", "r": "7 min read"}, {"u": "/blog/colic-vs-reflux.html", "c": "diagnosis", "t": "Colic vs. Reflux: How to Tell the Difference", "d": "Both look like an unhappy, crying baby. The pattern differences that actually separate them, and when it's a pediatrician conversation instead of a protocol conversation.", "r": "6 min read"}, {"u": "/blog/formula-fed-baby-colic.html", "c": "diagnosis", "t": "Colic in a Formula-Fed Baby: What's Actually Different", "d": "The core probiotic trial behind most colic content was conducted in breastfed infants only. What the evidence does and doesn't say for formula-fed babies, and what to fix first.", "r": "7 min read"}, {"u": "/blog/cry-types-newborn-guide.html", "c": "techniques", "t": "Hunger Cry, Pain Cry, or Overtired Cry: How to Tell Them Apart", "d": "\"Listen closer\" isn't specific enough advice. The patterns worth learning first, and why a colic cry and a pain cry are the hardest two to tell apart.", "r": "6 min read"}, {"u": "/blog/which-type-of-colic-diagnosis.html", "c": "diagnosis", "t": "Gut, Nervous System, or Acoustic: How to Tell Which Type of Colic Your Baby Has", "d": "Three root causes produce very different signals once you know what to look for. A signal-by-signal breakdown, and why guessing wastes the first two weeks.", "r": "7 min read"}, {"u": "/blog/l-reuteri-evidence.html", "c": "evidence", "t": "L. reuteri DSM 17938 for Colic: What the Actual Trial Found", "d": "Savino et al., 2010, is the study behind the 74% figure you've probably seen. Here's what it actually tested, on whom, and what it doesn't tell you.", "r": "8 min read"}, {"u": "/blog/tiger-hold-guide.html", "c": "techniques", "t": "The Tiger Hold for Colic: Step-by-Step, With the Mechanism Behind It", "d": "Why face-down, forward-facing pressure at a specific rhythm works when rocking alone doesn't, and the two most common ways parents get the position wrong.", "r": "6 min read"}, {"u": "/blog/paced-bottle-feeding-technique.html", "c": "techniques", "t": "Paced Bottle Feeding for a Gassy, Colicky Baby: The Exact Technique", "d": "Bottle angle controls how much air a baby swallows with every feed. The exact positioning and pause rhythm, and why standard advice gets the angle backwards.", "r": "6 min read"}, {"u": "/blog/colic-timeline-when-does-it-end.html", "c": "timeline", "t": "When Does Colic Peak, and When Does It End? A Week-by-Week Timeline", "d": "Colic follows a predictable age curve even though no single evening feels predictable. Why week 6 is the hardest, and what the curve doesn't tell you.", "r": "6 min read"}, {"u": "/blog/colic-relief-root-cause-guide.html", "c": "diagnosis", "t": "Colic Relief That Actually Works: A Root-Cause Guide", "d": "Not a list of products to try next. A map of which of three systems is likely driving your baby's crying, and what the evidence says works for each.", "r": "9 min read"}, {"u": "/blog/is-my-baby-colicky-signs-symptoms.html", "c": "diagnosis", "t": "Is My Baby Colicky? Signs, Symptoms, and When It's Something Else", "d": "Colic has a real clinical definition, not just \"cries a lot.\" How to tell colic apart from reflux, hunger, and normal newborn fussiness.", "r": "5 min read"}, {"u": "/blog/colic-3-3-3-rule.html", "c": "diagnosis", "t": "The 3-3-3 Rule for Colic: What It Gets Right and What It Misses", "d": "The \"rule of threes\" comes from a real 1954 study. What it actually measured, and why the clinical field has since moved past making parents wait for it.", "r": "4 min read"}, {"u": "/blog/colic-myths-vs-facts.html", "c": "evidence", "t": "Colic Myths vs. Facts", "d": "Gripe water, gas drops, and pacifiers are the most common things parents try or hear. What the actual trial data says about each.", "r": "5 min read"}, {"u": "/blog/when-to-call-doctor-colic-red-flags.html", "c": "diagnosis", "t": "When to Call the Doctor: Red Flags Beyond Typical Colic", "d": "Most colic is not dangerous and resolves on its own. The specific pattern that's worth a real conversation with your pediatrician, and why.", "r": "5 min read"}, {"u": "/blog/colic-long-term-development.html", "c": "evidence", "t": "Colic and Long-Term Development: What the Research Actually Shows", "d": "A five-year follow-up study has a real answer, and it's more reassuring than most parents expect, with one honest exception.", "r": "4 min read"}, {"u": "/blog/foods-that-make-colic-worse.html", "c": "evidence", "t": "Foods That Make Colic Worse: The Dairy and Diet Connection", "d": "For breastfed babies, what a mother eats can matter more than what she's told to try next. The actual trial behind the dairy-elimination approach.", "r": "5 min read"}, {"u": "/blog/breastfeeding-and-colic.html", "c": "evidence", "t": "Breastfeeding and Colic: The Evidence-Based Playbook", "d": "The strongest colic RCT evidence to date was conducted specifically in breastfed infants. What it actually found and what it doesn't cover.", "r": "5 min read"}, {"u": "/blog/probiotics-for-colic-strain-matters.html", "c": "evidence", "t": "Probiotics for Colic: Why Strain Matters More Than the Word \"Probiotic\"", "d": "Not all probiotics have colic evidence behind them. The research points to one specific strain and dose, not the category broadly.", "r": "5 min read"}, {"u": "/blog/colic-holds-beyond-tiger-hold.html", "c": "techniques", "t": "Colic Holds and Positions Beyond Tiger Hold", "d": "Tiger Hold isn't the only physical technique with a real mechanism behind it. Two more, and when each one fits better.", "r": "5 min read"}, {"u": "/blog/swaddling-moro-reflex-colic.html", "c": "techniques", "t": "Can Swaddling Help a Colicky Baby? Safety and the Moro Reflex", "d": "Real sleep-efficiency evidence, and a real, non-optional safety rule that goes with it. Both matter equally here.", "r": "5 min read"}, {"u": "/blog/witching-hour-room-setup.html", "c": "techniques", "t": "Room Setup for the Witching Hour: Light, Sound, and Cortisol", "d": "The 5 to 7pm crying window isn't about boredom. It's a nervous system already at its daily limit. How to work with that instead of against it.", "r": "4 min read"}, {"u": "/blog/infant-massage-colic.html", "c": "techniques", "t": "Gentle Infant Massage for Gas and Nervous System Calm", "d": "A structured massage sequence outperformed rocking in a real controlled trial. What the study actually tested, and where it fits.", "r": "5 min read"}, {"u": "/blog/best-bottles-feeding-positions-colic.html", "c": "techniques", "t": "Best Bottles and Feeding Positions to Reduce Colic", "d": "The angle of the bottle matters more than the brand. The mechanism behind air intake during bottle feeding, and the position that cuts it substantially.", "r": "5 min read"}, {"u": "/blog/gentle-burping-techniques.html", "c": "techniques", "t": "Gentle Burping Techniques That Actually Release Gas", "d": "Most burping advice focuses on effort, patting harder, longer sessions, when the actual lever is position. What the mechanism says.", "r": "4 min read"}, {"u": "/blog/colic-diary-tracking.html", "c": "techniques", "t": "Colic Diary: What to Track and Why It Matters", "d": "Tracking colic isn't about proving something to your pediatrician. It's how you separate what's actually working from what just happened to coincide.", "r": "4 min read"}, {"u": "/blog/signs-colic-is-improving.html", "c": "timeline", "t": "Signs Your Baby's Colic Is Improving", "d": "Improvement rarely arrives as one dramatic quiet night. It shows up first in small, easy-to-miss shifts. What to actually watch for.", "r": "4 min read"}, {"u": "/blog/colic-postpartum-mental-health.html", "c": "support", "t": "Colic and Postpartum Mental Health: What's Normal and When to Get Support", "d": "Colic and maternal mental health are genuinely connected, per real research, not just an assumption. What the evidence shows and what to do with it.", "r": "5 min read"}, {"u": "/blog/pacifier-use-and-colic-evidence.html", "c": "evidence", "t": "Pacifier Use and Colic: What the Evidence Actually Shows", "d": "Pacifiers are widely recommended for infant sleep safety. The evidence for pacifiers reducing colic specifically is weaker than most parents are told.", "r": "4 min read"}];
var LABEL={diagnosis:'Diagnosis',evidence:'Evidence',techniques:'Techniques',timeline:'Timeline',support:'Support',page:'Page'};

var css='\
.cps-btn{background:none;border:1px solid var(--border2,rgba(36,26,18,.17));border-radius:9px;width:38px;height:36px;display:inline-flex;align-items:center;justify-content:center;color:var(--ink,#241A12);cursor:pointer;flex-shrink:0;transition:border-color .15s,color .15s}\
.cps-btn:hover{border-color:var(--terra,#BC5A33);color:var(--terra,#BC5A33)}\
.cps-btn svg{width:17px;height:17px}\
.cps-mob{display:none;align-items:center;gap:8px;margin-left:auto;margin-right:6px}\
.mobile-nav .cps-mob-link{display:flex;align-items:center;gap:8px;background:none;border:1px solid var(--border2,rgba(36,26,18,.17));border-radius:10px;padding:11px 14px;font:500 16px var(--sans,sans-serif);color:var(--ink,#241A12);cursor:pointer;text-align:left;width:100%}\
.cps-ov{position:fixed;inset:0;z-index:1000;background:rgba(35,43,30,.55);backdrop-filter:blur(3px);display:none;align-items:flex-start;justify-content:center;padding:8vh 16px 16px}\
.cps-ov.open{display:flex}\
.cps-box{background:var(--card,#FFFCF7);border-radius:16px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:100%;max-width:640px;max-height:80vh;display:flex;flex-direction:column;overflow:hidden}\
.cps-head{display:flex;align-items:center;gap:10px;padding:14px 16px;border-bottom:1px solid var(--border,rgba(36,26,18,.1))}\
.cps-head svg{width:18px;height:18px;flex-shrink:0;color:var(--muted,#7A6A56)}\
.cps-in{flex:1;border:none;outline:none;background:transparent;font:500 17px var(--sans,sans-serif);color:var(--ink,#241A12);min-width:0}\
.cps-esc{font:11px var(--mono,monospace);color:var(--muted2,#9C8C77);border:1px solid var(--border2,rgba(36,26,18,.17));border-radius:5px;padding:2px 6px;background:none;cursor:pointer}\
.cps-list{overflow-y:auto;padding:8px;list-style:none;margin:0}\
.cps-item a{display:block;padding:12px 14px;border-radius:10px;color:inherit;text-decoration:none}\
.cps-item a:hover,.cps-item.sel a{background:var(--terra-d,rgba(188,90,51,.10))}\
.cps-meta{font:600 10px var(--mono,monospace);letter-spacing:.08em;text-transform:uppercase;color:var(--terra,#BC5A33);margin-bottom:3px}\
.cps-meta span{color:var(--muted2,#9C8C77);font-weight:400;margin-left:8px}\
.cps-title{font:700 17px/1.3 var(--serif,Georgia,serif);color:var(--ink,#241A12)}\
.cps-desc{font:13px/1.5 var(--sans,sans-serif);color:var(--muted,#7A6A56);margin-top:3px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}\
.cps-empty{padding:26px 18px;font:14px/1.6 var(--sans,sans-serif);color:var(--muted,#7A6A56);text-align:center}\
.cps-empty a{color:var(--terra,#BC5A33);font-weight:600}\
.cps-hint{padding:8px 18px 4px;font:600 10px var(--mono,monospace);letter-spacing:.1em;text-transform:uppercase;color:var(--muted2,#9C8C77)}\
mark.cps-hl{background:rgba(192,150,63,.3);color:inherit;border-radius:2px;padding:0 1px}\
@media(max-width:860px){.cps-mob{display:inline-flex}}\
';
var st=document.createElement('style');st.textContent=css;document.head.appendChild(st);

var ICON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
var lastFocus=null,sel=-1,results=[];

function esc(s){return s.replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
function norm(s){return s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function tokens(q){return norm(q).split(/[^a-z0-9.]+/).filter(function(t){return t.length>0;});}

DATA.forEach(function(x){x._t=norm(x.t);x._d=norm(x.d);x._c=norm(LABEL[x.c]||x.c);});

function search(q){
  var tk=tokens(q);if(!tk.length)return[];
  var out=[];
  DATA.forEach(function(x){
    var score=0;
    for(var i=0;i<tk.length;i++){
      var t=tk[i],s=0;
      if(x._t.indexOf(t)>-1)s+=(new RegExp('\\b'+t.replace(/\./g,'\\.')).test(x._t)?6:3);
      if(x._c.indexOf(t)>-1)s+=2;
      if(x._d.indexOf(t)>-1)s+=1;
      if(!s)return;            /* every word must match somewhere */
      score+=s;
    }
    out.push([score,x]);
  });
  out.sort(function(a,b){return b[0]-a[0];});
  return out.slice(0,8).map(function(p){return p[1];});
}
function hl(text,tk){
  var h=esc(text);
  tk.forEach(function(t){if(t.length<2)return;
    h=h.replace(new RegExp('('+t.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+')(?![^<]*>)','gi'),'<mark class="cps-hl">$1</mark>');});
  return h;
}

var ov=document.createElement('div');ov.className='cps-ov';ov.setAttribute('role','dialog');ov.setAttribute('aria-modal','true');ov.setAttribute('aria-label','Search the site');
ov.innerHTML='<div class="cps-box"><div class="cps-head">'+ICON+'<input class="cps-in" type="search" placeholder="Search posts and pages" autocomplete="off" aria-label="Search"><button class="cps-esc" type="button" aria-label="Close search">Esc</button></div><ul class="cps-list" role="listbox"></ul></div>';
document.body.appendChild(ov);
var input=ov.querySelector('.cps-in'),list=ov.querySelector('.cps-list');

function render(){
  var q=input.value.trim(),tk=tokens(q);
  if(!q){
    results=DATA.filter(function(x){return x.c==='page';});
    list.innerHTML='<li class="cps-hint">Quick links</li>'+results.map(row.bind(null,[])).join('');
    sel=-1;return;
  }
  results=search(q);
  if(!results.length){
    list.innerHTML='<li class="cps-empty">Nothing matched "'+esc(q)+'". Try a simpler word like <em>gas</em>, <em>probiotic</em>, or <em>bottle</em>, or <a href="/quiz.html">take the 90-second assessment</a> to find your baby\'s main pattern.</li>';
    sel=-1;track(q,0);return;
  }
  list.innerHTML=results.map(row.bind(null,tk)).join('');
  sel=0;mark();track(q,results.length);
}
function row(tk,x,i){
  return '<li class="cps-item" role="option" data-i="'+i+'"><a href="'+x.u+'"><div class="cps-meta">'+esc(LABEL[x.c]||x.c)+(x.r?'<span>'+esc(x.r)+'</span>':'')+'</div><div class="cps-title">'+hl(x.t,tk)+'</div><div class="cps-desc">'+hl(x.d,tk)+'</div></a></li>';
}
function mark(){
  var it=list.querySelectorAll('.cps-item');
  for(var i=0;i<it.length;i++)it[i].classList.toggle('sel',i===sel);
  if(it[sel])it[sel].scrollIntoView({block:'nearest'});
}
var tt;function track(q,n){clearTimeout(tt);tt=setTimeout(function(){
  if(typeof gtag==='function')gtag('event','search',{search_term:q.slice(0,80),results:n});},700);}

function open(){
  lastFocus=document.activeElement;ov.classList.add('open');document.body.style.overflow='hidden';
  input.value='';render();setTimeout(function(){input.focus();},20);
}
function close(){ov.classList.remove('open');document.body.style.overflow='';if(lastFocus&&lastFocus.focus)lastFocus.focus();}

input.addEventListener('input',render);
ov.querySelector('.cps-esc').addEventListener('click',close);
ov.addEventListener('mousedown',function(e){if(e.target===ov)close();});
input.addEventListener('keydown',function(e){
  var n=list.querySelectorAll('.cps-item').length;
  if(e.key==='ArrowDown'&&n){e.preventDefault();sel=(sel+1)%n;mark();}
  else if(e.key==='ArrowUp'&&n){e.preventDefault();sel=(sel-1+n)%n;mark();}
  else if(e.key==='Enter'&&results[sel]){window.location.href=results[sel].u;}
});
document.addEventListener('keydown',function(e){
  var tag=(document.activeElement&&document.activeElement.tagName)||'';
  var typing=/INPUT|TEXTAREA|SELECT/.test(tag)||(document.activeElement&&document.activeElement.isContentEditable);
  if(e.key==='Escape'&&ov.classList.contains('open')){close();}
  else if((e.key==='k'&&(e.ctrlKey||e.metaKey))||(e.key==='/'&&!typing)){e.preventDefault();open();}
  else if(e.key==='Tab'&&ov.classList.contains('open')){ /* keep focus inside dialog */
    var f=ov.querySelectorAll('input,button,a');var first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});

/* inject buttons into existing nav (no edits to page HTML needed) */
function mk(cls){var b=document.createElement('button');b.type='button';b.className=cls;b.setAttribute('aria-label','Search');b.innerHTML=ICON;b.addEventListener('click',open);return b;}
var links=document.querySelector('.nav-links');
if(links){var pill=links.querySelector('.nav-pill');var b=mk('cps-btn');links.insertBefore(b,pill||null);}
var toggle=document.querySelector('.nav-toggle');
if(toggle&&toggle.parentNode){var w=document.createElement('div');w.className='cps-mob';w.appendChild(mk('cps-btn'));toggle.parentNode.insertBefore(w,toggle);}
})();
