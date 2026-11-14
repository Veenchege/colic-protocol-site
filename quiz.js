/* ══════════════════════════════════════════════════════════════════════
   CONFIG
   API key is NEVER here. All email subscriptions go through /api/subscribe,
   a server-side proxy that reads MailerLite credentials from environment
   variables.
   ══════════════════════════════════════════════════════════════════════ */
const CFG = {
  group_id: '190431733303215887',
  productUrl: 'https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint',
  productPageUrl: '/blueprint',
  checklistUrl: '/midnight-protocol',
  dmUrl: 'https://ig.me/m/colicprotocol',
};

const QUIZ_VERSION = '3.0';

/* ── UTM ATTRIBUTION ─────────────────────────────────────────────────── */
function captureUTMs(){
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source','utm_medium','utm_campaign','utm_term','utm_content'];
  if(keys.some(k => params.has(k))){
    const utm = {};
    keys.forEach(k => { utm[k] = params.get(k) || ''; });
    try { sessionStorage.setItem('cp_utm', JSON.stringify(utm)); } catch(e){}
  }
}
function getStoredUTMs(){
  try {
    const raw = sessionStorage.getItem('cp_utm');
    if(raw) return JSON.parse(raw);
  } catch(e){}
  return { utm_source:'', utm_medium:'', utm_campaign:'', utm_term:'', utm_content:'' };
}
captureUTMs();
const UTM_SOURCE = getStoredUTMs().utm_source || new URLSearchParams(window.location.search).get('utm_source') || 'direct';

/* ── ASSESSMENT COUNT ────────────────────────────────────────────────────
   /api/stats returns a live completed count. COUNT_FLOOR is the last
   verified figure, so the page never shows a lower number than it
   honestly could. The number shown is rounded DOWN to the nearest 50,
   so it always reads as a true "N+". */
const COUNT_FLOOR = 700;
let ASSESSMENT_COUNT_LIVE = COUNT_FLOOR;
function shownCount() { return Math.floor(ASSESSMENT_COUNT_LIVE / 50) * 50; }
function paintCount() {
  document.querySelectorAll('.assessment-count-value').forEach(el => {
    el.textContent = shownCount();
  });
}
async function loadAssessmentCount() {
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) return;
    const data = await res.json();
    if (typeof data.completed === 'number' && data.completed >= COUNT_FLOOR) {
      ASSESSMENT_COUNT_LIVE = data.completed;
      paintCount();
    }
  } catch(e){}
}
loadAssessmentCount();

/* ══════════════════════════════════════════════════════════════════════
   SAFETY CHECK (red flags)
   Runs after email capture and before question 1. Any selection stops
   the flow: no result, no type. The answer is saved on the email record
   as `red_flag`: 'pending' (not answered yet), 'none', or
   'flagged: <short list>'. MailerLite automations should only send the
   assessment emails when red_flag is 'pending' or 'none'.
   ══════════════════════════════════════════════════════════════════════ */
const RED_FLAG_OPTIONS = [
  { 
    text: "Fever of 38°C / 100.4°F or higher", 
    short: "fever",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z"/><circle cx="11.5" cy="18" r="2.5" fill="#BA5731"/><line x1="11.5" y1="9" x2="11.5" y2="15.5" stroke="#BA5731" stroke-width="2.5"/></svg>`
  },
  { 
    text: "Green or yellow-green vomit, or forceful vomiting after most feeds", 
    short: "green or forceful vomiting",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a9 9 0 0 0-9 9c0 4.5 3.5 8.2 8 8.9V22h2v-2.1c4.5-.7 8-4.4 8-8.9a9 9 0 0 0-9-9z"/><path d="M9 13c1 1.5 2.5 2 3 2s2-.5 3-2"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><path d="M12 15v5" stroke="#4A7C59" stroke-width="2.5"/><circle cx="12" cy="17.5" r="1.5" fill="#4A7C59"/></svg>`
  },
  { 
    text: "Blood in the stool", 
    short: "blood in stool",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="8"/><path d="M12 7v10M8 12h8" stroke="#BA5731" stroke-width="2"/></svg>`
  },
  { 
    text: "Poor feeding or refusing feeds completely", 
    short: "poor feeding",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 2h4M9 5h6"/><rect x="7" y="7" width="10" height="13" rx="2.5"/><line x1="7" y1="11" x2="11" y2="11"/><line x1="7" y1="14" x2="13" y2="14"/><line x1="4" y1="4" x2="20" y2="20" stroke="#BA5731" stroke-width="2"/></svg>`
  },
  { 
    text: "Unusually sleepy, limp, or very hard to wake", 
    short: "sleepy, limp or hard to wake",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`
  },
  { 
    text: "Trouble breathing, or blue lips or face", 
    short: "breathing trouble",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 4v8"/><path d="M12 7c-2-1.5-5-2-7 0a6 6 0 0 0 4 10c2 0 3-1 3-2"/><path d="M12 7c2-1.5 5-2 7 0a6 6 0 0 1-4 10c-2 0-3-1-3-2"/><path d="M7 11h2M15 11h2" stroke="#BA5731" stroke-width="1.5"/></svg>`
  },
  { 
    text: "A hair wrapped tightly around a finger, toe, or genitals", 
    short: "hair tourniquet",
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><path d="M12 5a7 7 0 0 1 7 7M5 12a7 7 0 0 1 7-7"/></svg>`
  }
];
const RF_NONE = RED_FLAG_OPTIONS.length; // index of "None of these"
const rfSelected = new Set();
let redFlagStatus = 'pending';

/* ── MATHEMATICAL COORDINATES ALONG TYPICAL CRYING CURVE (Weeks 0 to 16+) ─────────────────── */
function getCurveCoords(w) {
  const clampedW = Math.min(16, Math.max(0, w));
  const x = Math.round(40 + (clampedW / 16) * 460);
  let y = 135;
  if (clampedW <= 6) {
    const t = clampedW / 6;
    y = Math.round(135 - 100 * Math.sin(t * Math.PI / 2));
  } else {
    const t = (clampedW - 6) / 10;
    y = Math.round(35 + 105 * Math.sin(t * Math.PI / 2));
  }
  return { x, y };
}

/* ── CLASSIFY INTEGER AGE INTO COHORTS ─────────────────────────────────── */
function classifyAge(w) {
  const num = (typeof w === 'number') ? Math.max(0, w) : (parseInt(w, 10) || 0);
  if (num <= 2) {
    return {
      weeks: num,
      range: "0 to 2 weeks",
      bracket: "0-2",
      tag: "0 to 2 weeks · Newborn Adjustment",
      status: "Early Transition Phase",
      milestone: "<strong>Newborn Adjustment Window:</strong> Crying is typically brief and hunger-driven. Gut microbiome colonization is just beginning; infant suck-swallow coordination is learning flow pacing. Wind and frequent burping are normal as swallowing coordination stabilizes."
    };
  } else if (num <= 5) {
    return {
      weeks: num,
      range: "3 to 5 weeks",
      bracket: "3-5",
      tag: "3 to 5 weeks · The Escalation Phase",
      status: "Rising Sensory Awareness",
      milestone: "<strong>The Escalation Phase:</strong> Evening crying begins clustering. The infant's sensory awareness expands rapidly, while digestive rhythms are still adjusting. Parents often start trying gas drops or gripe water during this window."
    };
  } else if (num <= 8) {
    return {
      weeks: num,
      range: "6 to 8 weeks",
      bracket: "6-8",
      tag: "6 to 8 weeks · Peak Colic Window",
      status: "Typical Biological Crying Peak",
      milestone: "<strong>The Typical Peak Window:</strong> Infant crying commonly reaches its maximum daily duration and intensity (often 2 to 3+ hours daily). The sensory threshold is at its most reactive point, while biological self-soothing rhythm is still developing. This is the hardest stretch, not a parental failure."
    };
  } else if (num <= 12) {
    return {
      weeks: num,
      range: "9 to 12 weeks",
      bracket: "9-12",
      tag: "9 to 12 weeks · The Turning Point",
      status: "Developmental Easing",
      milestone: "<strong>The Turning Point:</strong> Crying duration begins to ease for many babies. Sleep intervals lengthen slightly; oral motor latch mechanics mature and digestive rhythms stabilize."
    };
  } else {
    return {
      weeks: num,
      range: "Older than 12 weeks",
      bracket: "12+",
      tag: "Older than 12 weeks · Settled Horizon",
      status: "Late Infancy Transition",
      milestone: "<strong>The Easing Window:</strong> Colic typically eases by about 3 to 4 months as day-night rhythm and digestive regulation settle. If intense, inconsolable crying persists past 12-16 weeks, consult your pediatrician to rule out food sensitivities or other clinical factors."
    };
  }
}

/* ══════════════════════════════════════════════════════════════════════
   QUESTIONS (SYNTHESIZED 8-QUESTION BALANCED ARCHITECTURE)
   Points are balanced across GUT, NS, FM (each up to 24-27 pts)
   preserving the natural 52-58% Nervous System baseline.
   ══════════════════════════════════════════════════════════════════════ */
const QUESTIONS = [
  // Q1: AGE & DEVELOPMENTAL CRYING CURVE
  {
    id: 'age',
    category: 'Developmental Timeline',
    q: "Where your baby sits on the typical crying curve",
    sub: "Infant crying patterns naturally peak around week 6 and ease by about 3 to 4 months. Confirm your baby's exact age.",
    isIntegerAge: true,
    opts: []
  },
  // Q2: 24-HOUR CRYING BURDEN (CLOCK)
  {
    id: 'crying_duration',
    category: 'Daily Crying Burden',
    q: "On a typical complete day and night, approximately how long does your baby cry in total?",
    sub: "Think across 24 hours (day and night combined). More than 3 hours a day meets the traditional pediatric colic threshold (Wessel criteria).",
    isDurationClock: true,
    single: true,
    opts: [
      ["Less than 1 hour total", {GUT:0,NS:0,FM:0}, null, null, "Crying is under 1 hour daily.", 10, '#698457', '< 1 hr daily', 'Mild daily fussiness'],
      ["1 to 2 hours total", {GUT:1,NS:1,FM:1}, null, null, "Crying is 1 to 2 hours daily.", 22.5, '#DDA15E', '1-2 hrs daily', 'Moderate clustering'],
      ["2 to 3 hours total", {GUT:2,NS:2,FM:2}, null, null, "Crying is 2 to 3 hours daily.", 37.5, '#DDA15E', '2-3 hrs daily', 'Borderline threshold'],
      ["3 to 4 hours total", {GUT:3,NS:3,FM:3}, null, null, "Crying meets traditional Wessel criteria (3+ hrs).", 52.5, '#BA5731', '3-4 hrs daily', 'Meets Wessel criteria (> 3 hrs)'],
      ["4 to 5 hours total", {GUT:4,NS:4,FM:4}, null, null, "Crying is 4 to 5 hours daily.", 67.5, '#BA5731', '4-5 hrs daily', 'Significant daily distress'],
      ["5 or more hours total", {GUT:4,NS:4,FM:4}, null, null, "Crying is 5+ hours daily.", 90, '#9C3D1D', '5+ hrs daily', 'Severe persistent crying'],
      ["Not sure or varies wildly", {GUT:0,NS:0,FM:0}, null, null, "Crying duration varies day to day.", 0, '#7A6856', 'Varying duration', 'Unpredictable clustering']
    ]
  },
  // Q3: CRYING TIMING & DAILY CLUSTER
  {
    id: 'timing',
    category: 'Daily Pattern',
    q: "When does your baby cry most intensely?",
    sub: "Look at the pattern over the last few days. Pick the most frequent timing.",
    single: true,
    isTimingClock: true,
    opts: [
      ["Consistently in the late afternoon or evening (5 PM to midnight), regardless of feeds", {GUT:0,NS:4,FM:0}, null, null, "Concentrated evening clustering (witching hour)"],
      ["During feeding or within 20 minutes after, often pulling away or arching", {GUT:2,NS:0,FM:4}, null, null, "Discomfort during or immediately following feeding"],
      ["In sudden waves throughout the day with legs pulled to the chest, then brief quiet", {GUT:4,NS:0,FM:0}, null, null, "Wave-like crying with legs tucked to abdomen"],
      ["Overtired distress throughout the day, startled easily, difficult to put down", {GUT:1,NS:4,FM:1}, null, null, "Sensory fatigue and frequent waking"]
    ]
  },
  // Q4: CRY ACOUSTIC & SOUND PROFILE
  {
    id: 'acoustics',
    category: 'Cry Acoustic',
    q: "What does your baby's cry sound like?",
    sub: "Listen to how the cry begins and sounds.",
    single: true,
    opts: [
      ["Sudden, piercing, continuous intensity from the very first second with no build-up", {GUT:0,NS:4,FM:0}, null, null, "Sudden high-intensity onset"],
      ["Grunting, gulping, or clicking sounds during or immediately after feeds", {GUT:1,NS:0,FM:4}, null, null, "Gulping and flow sounds during feeding"],
      ["Comes in cyclical waves: intense crying, pause, then another wave with leg straining", {GUT:4,NS:1,FM:0}, null, null, "Cyclical wave-like distress"],
      ["Starts with mild whimpering and steadily escalates over 15 minutes into inconsolable crying", {GUT:2,NS:3,FM:1}, null, null, "Gradual escalation into inconsolable crying"]
    ]
  },
  // Q5: PHYSICAL POSTURE & SOOTHING RESPONSE
  {
    id: 'body_signals',
    category: 'Physical Signals',
    q: "What does your baby's body do during crying episodes?",
    sub: "Physical postures reflect how the baby experiences discomfort.",
    single: true,
    opts: [
      ["Rigid back-arching and stiffening; calms best with rhythmic motion and dim, quiet space", {GUT:0,NS:4,FM:0}, null, null, "Rigid body arching and sensory response"],
      ["Tense tummy that softens after passing wind or a bowel movement", {GUT:4,NS:0,FM:0}, null, null, "Abdominal tension that eases with wind"],
      ["Frantic rooting, clicking latch, or calms noticeably when held upright over the shoulder", {GUT:1,NS:0,FM:4}, null, null, "Oral-motor tension and upright comfort"],
      ["Clenched fists, startles awake at small sounds, flailing arms", {GUT:0,NS:4,FM:0}, null, null, "Startle sensitivity and limb tension"]
    ]
  },
  // Q6: DIGESTIVE SIGNALS
  {
    id: 'digestive',
    category: 'Digestive Clues',
    q: "Which digestive clues have you repeatedly noticed?",
    sub: "Select all that apply. Pick 'None of these' if feeds and digestion appear straightforward.",
    multi: true,
    opts: [
      ["Frequent straining with explosive or frothy stools, or clear relief after passing wind", {GUT:3,NS:0,FM:0}, null, null, "Straining and frothy stools"],
      ["Gulping air during feeds, frequent milk spills at corners of the mouth, loud swallows", {GUT:1,NS:0,FM:3}, null, null, "Air gulping and swallowing flow"],
      ["Frequent spitting up when laid flat, clearly more comfortable kept upright after feeds", {GUT:1,NS:0,FM:3}, null, null, "Discomfort lying flat after feeding"],
      ["Evening crying clusters despite normal, comfortable daytime digestion and seedy stools", {GUT:0,NS:3,FM:0}, null, null, "Evening clustering with normal stools"],
      ["None of these noticed", {GUT:0,NS:0,FM:0, _isNone: true}, null, null, "No noticeable digestive distress", 0, null, null, null, true]
    ]
  },
  // Q7: FEEDING METHOD
  {
    id: 'feeding',
    category: 'Feeding Method',
    q: "How is your baby currently fed?",
    sub: "Helps match the starting-point steps to your feeding setup.",
    single: true,
    opts: [
      ["Directly at the breast", {GUT:2,NS:1,FM:0}, 'Breastfed', null, "Direct breastfeeding"],
      ["Expressed breast milk in a bottle", {GUT:1,NS:0,FM:3}, 'Mixed', null, "Expressed breast milk via bottle"],
      ["Formula feeding", {GUT:2,NS:0,FM:3}, 'Formula-fed', null, "Formula feeding"],
      ["Combination of breast milk and formula", {GUT:2,NS:0,FM:2}, 'Mixed', null, "Combination feeding"]
    ]
  },
  // Q8: PREVIOUS REMEDIES TRIED
  {
    id: 'tried',
    category: 'Previous Steps',
    q: "Which of these have you already tried with little or no shift?",
    sub: "Select all that apply. This avoids recommending things you've already found unhelpful.",
    multi: true,
    opts: [
      ["Simethicone gas drops", {GUT:2,NS:0,FM:0}, null, "gas drops", "Tried simethicone drops"],
      ["Gripe water", {GUT:2,NS:0,FM:0}, null, "gripe water", "Tried gripe water"],
      ["Infant probiotic drops", {GUT:2,NS:0,FM:0}, null, "probiotics", "Tried probiotics"],
      ["Paced bottle feeding or slow-flow nipples", {GUT:0,NS:0,FM:2}, null, "paced feeding", "Tried paced feeding"],
      ["Sound machine (white or brown noise)", {GUT:0,NS:2,FM:0}, null, "sound machine", "Tried sound machines"],
      ["Rhythmic motion (rocking, car rides, stroller)", {GUT:0,NS:2,FM:0}, null, "rhythmic motion", "Tried rhythmic motion"],
      ["Switching formula brands", {GUT:1,NS:0,FM:2}, null, "formula switches", "Tried formula switches"],
      ["None of these yet", {GUT:0,NS:0,FM:0, _isNone: true}, null, null, "Starting fresh without previous remedies", 0, null, null, null, true]
    ]
  }
];

const RED_FLAG = "Fever, vomiting (especially green), blood in stools, poor feeding, or a baby who seems limp or very hard to wake: call your doctor now, not later.";
const OVERWHELMED = "If you feel overwhelmed, it is safe to put your baby down on their back in their cot for a few minutes and step away.";

const TRUST_VINCENT = "Vincent is an epidemiologist. He reads and weighs research for a living. He is not a pediatrician, gastroenterologist or lactation consultant, so please keep yours in the loop. He went back to the research for his daughter Zion's colic and wrote down what he found, including where the evidence is thin.";

const isFormulaOrMixed = (f) => f === 'Formula-fed' || f === 'Mixed';

const SOOTHE_STEPS = {
  burp: {title: "Hold your baby upright and burp gently", body: "Upright against your shoulder, gentle pats, and don't force a burp. This is common practice. No study has shown one burping position is better than another.", ev: "Common practice"},
  massage: {title: "Try gentle tummy massage and slow bicycle legs", body: "Clockwise strokes with a flat hand, then slow bicycle legs finishing with a gentle knee tuck. Small studies suggest massage may reduce distress for some babies. It will not release trapped gas on command.", ev: "Small, unblinded studies"},
  hold: {title: "Supported hold, slow rhythm, quiet room", body: "A firm supported hold along your forearm with a slow, steady rhythm may calm some babies for a while. Awake and supervised only, never for sleep. Keep the room dim, with low steady sound across the room, on a timer.", ev: "No trial shows it beats other supported holds"},
};

const RESULTS = {
  GUT: {
    apiType: "Gut Microbiome Imbalance",
    type: "Gut Microbiome Imbalance",
    subtitle: "Closest Fit",
    emoji: "🦠",
    bannerClass: "gut-banner",
    stepClass: "gut-sn",
    tagline: "Crying in waves, with legs pulled up and a tight belly, often fits this pattern.",

    seeing: "What you're probably seeing tonight: crying that comes in waves, legs pulled up toward a tight or distended belly, and some relief after a big burp or a bowel movement, then the same pattern building again a few hours later.",
    why: "Crying in waves with the legs pulled up is commonly linked to gut discomfort, and some research has found differences in the gut bacteria of babies with colic. It has not been shown that those differences cause the crying, and the cause of colic is not known. Trials have not shown that simethicone gas drops beat placebo (Cochrane review), so short relief from them can't be taken as proof the gut was the problem.",
    rulesOut: "Your answers fit this pattern better than the other two, but colic is not known to split cleanly into three causes. Nervous-system overload often starts high-pitched and escalates with stimulation. Feeding mechanics often tracks with time since a feed. Your answers can touch more than one, which is why the panel above shows all three.",
    steps: (feeding) => {
      const probioticBreast = {title: "Ask your pediatrician about L. reuteri DSM 17938", body: "This is the strain used in the research, sold as BioGaia Protectis. In a 2010 trial of 50 exclusively breastfed babies it was linked to less daily crying than simethicone. A larger 2014 trial found no benefit over placebo. Pooled results suggest a modest effect at best, and trials measured response over weeks, not hours. Follow the product label and check with your pediatrician before starting.", ev: "Mixed: one small positive trial, one larger null trial"};
      const probioticFormula = {title: "About probiotics", body: "The positive trial was only in breastfed babies, and the larger trial that included formula-fed babies found no benefit. So we don't lead with it for your baby. If you want to try one, talk to your pediatrician first.", ev: "Weak for formula-fed babies"};
      const feedingFirst = {title: "Start with feeding pace", body: "Hold your baby near-upright with the bottle near-horizontal and the nipple fully covered with milk. Pause every 20 to 30 seconds. Feeds will take longer, and that is expected.", ev: "Changes flow and feed length. Colic benefit unproven"};
      return isFormulaOrMixed(feeding)
        ? [feedingFirst, SOOTHE_STEPS.burp, SOOTHE_STEPS.massage, probioticFormula]
        : [SOOTHE_STEPS.burp, SOOTHE_STEPS.massage, probioticBreast, SOOTHE_STEPS.hold];
    },
    monitor: "Watch whether the crying eases after a bowel movement or a big burp. That may fit a gut pattern, but it isn't proof, and colic changes on its own, so write down what you try and when.",
    bridgeLine: (name) => `${name}, that's one way to read it, and a place to start. If you'd rather have the steps, the tracker and the evidence in one place than keep piecing it together, that's what the Calm Baby Blueprint is for.`,

    forBaby: "Gas and bloating between feeds, relief after a burp, gripe water that hasn't held.",
    whyTipsFailed: "Trials have not shown that gas drops beat placebo, and I did not find good trial evidence for gripe water. A few minutes of calm doesn't tell you either one worked, because crying rises and falls on its own. Trying several things at once also hides which one mattered.",
    whatsDifferent: "Not another single remedy. A way to try one change at a time, in a sensible order for your starting point, with a log so you can tell what actually shifted. It covers the probiotic research honestly, including the trial that found no benefit, with separate guidance for breastfed and formula-fed babies.",
    protocol: [
      "Starting-point assessment, a deeper version of the free one",
      "Gut-focused steps, including what the probiotic research does and does not show",
      "Soothing techniques: Tiger Hold, gentle massage and positioning",
      "60-Minute Brown Noise Soundscape (Bonus 2), for quiet, low use across the room on a timer",
      "Bloom Baby Tracker App (Bonus 1), one-tap logging at 3AM",
      "Cry Decoder Masterclass (Bonus 3), learn to tell a gas cry, an overtired cry and a dysregulation cry apart by ear",
    ],
    trustVincent: TRUST_VINCENT,
    evidence: (feeding) => isFormulaOrMixed(feeding)
      ? "The 2010 trial (Savino et al., Pediatrics) was only in exclusively breastfed babies. A larger 2014 trial that included formula-fed babies (Sung et al., BMJ) found no benefit over placebo. So for your baby the Blueprint starts with feeding and soothing steps, and treats the probiotic as something to discuss with your pediatrician first."
      : "Savino et al., Pediatrics 2010: 50 exclusively breastfed babies (46 completed), with the probiotic linked to less daily crying than simethicone. Sung et al., BMJ 2014: a larger trial that included formula-fed babies found no benefit over placebo. Pooled analyses suggest a modest effect, mostly in breastfed babies, with wide uncertainty.",
    ctaBtnText: "Get the Calm Baby Blueprint, $47",
    mailerliteField: "Gut Microbiome Primary",
    quickTitle: "Try this in the next 10 minutes",
    quickSteps: () => [
      "Hold your baby upright against your shoulder and burp gently, without forcing it.",
      "Dim the room and put on low, steady sound across the room.",
      "Try a supported hold along your forearm with a slow, steady rhythm. Awake and supervised only.",
    ],
    angles: {
      solution: "A clear order to try things in, with the probiotic research laid out honestly, including the trial that found no benefit.",
      shortcut: "Less guessing between gripe water, gas drops and whatever the next forum thread says.",
      feeling: "A clear answer to \"did that help?\"",
    },
  },

  NS: {
    apiType: "Nervous System Dysregulation",
    type: "Nervous System Dysregulation",
    subtitle: "Closest Fit",
    emoji: "⚡",
    bannerClass: "ns-banner",
    stepClass: "ns-sn",
    tagline: "Crying that is intense from the first second and escalates with stimulation often fits this pattern.",

    seeing: "What you're probably seeing tonight: crying that's high-pitched and intense almost from the first second, a body that goes rigid with fists clenched and back arching, and a baby who seems to escalate the more you try.",
    why: "Young babies have limited ability to calm themselves and rely on a caregiver to help them settle. Some seem more unsettled with more stimulation, and a rhythm that calms them stops working the moment it stops. That is an observation many parents share, not a trial result, and the cause of colic is not known. It is why this pattern starts with fewer inputs rather than more.",
    rulesOut: "Your answers fit this pattern better than the other two, but colic is not known to split cleanly into three causes. Gut discomfort often comes in waves with a tight belly. Feeding mechanics often tracks with time since a feed. A baby can show signs of more than one, which is why the panel above shows all three.",
    steps: [
      {title: "Fewer inputs, quiet room", body: "Dim, calm room, screens away, and low steady sound across the room, on a timer. Keep the sound quiet. Brown noise has not been shown to reduce colic.", ev: "Common practice"},
      SOOTHE_STEPS.hold,
      {title: "Give one thing a fair try", body: "Switching techniques every 10 to 15 minutes makes it hard to tell what helped. Pick one, stay with it, and note how long the crying lasted.", ev: "Practical advice"},
      {title: "Look after yourself too", body: "A calm caregiver helps, and your own wellbeing matters in its own right. " + OVERWHELMED, ev: "Safety"},
    ],
    monitor: "Watch whether catching the crying early, in the first minute or two, goes better than letting it build. That may fit this pattern, but crying also rises and falls by itself, so a short log helps. If your baby feels unusually stiff or floppy, call your doctor.",
    bridgeLine: (name) => `${name}, nothing here says you've been doing it wrong. Trying one thing at a time and keeping a log is hard on no sleep, and that's what the Calm Baby Blueprint is built to help with.`,

    forBaby: "High-pitched crying from second one, a rigid body, soothing that works briefly then stops.",
    whyTipsFailed: "By night three, most parents start adding more: more bouncing, more sound, more movement. For some babies, more input seems to make things worse. The instinct to do more is completely understandable. Changing several things at once also makes it impossible to tell which one helped.",
    whatsDifferent: "Not a single technique. A way to try one change at a time, in a sensible order, with a log that shows what shifted, so you aren't judging a whole evening by its worst ten minutes.",
    protocol: [
      "Starting-point assessment, a deeper version of the free one",
      "Soothing steps: Tiger Hold, supported holds, a slow rhythm and a quiet room",
      "Looking after you, a section for the parent",
      "60-Minute Brown Noise Soundscape (Bonus 2), for quiet, low use across the room on a timer",
      "Bloom Baby Tracker App (Bonus 1), log what's working at 3AM",
      "Cry Decoder Masterclass (Bonus 3), learn to tell a gas cry, an overtired cry and a dysregulation cry apart by ear",
    ],
    trustVincent: TRUST_VINCENT,
    evidence: () => "No trial shows this approach shortens colic. Holding, touch and rhythm may reduce distress for some babies in the short term, but the trials are small and unblinded. The Blueprint presents these as things to try and track, not proven fixes.",
    ctaBtnText: "Get the Calm Baby Blueprint, $47",
    mailerliteField: "Nervous System Primary",
    quickTitle: "Try this in the next 10 minutes",
    quickSteps: () => [
      "Dim the room and turn on low, steady sound across the room.",
      "Pick up your baby and try a supported hold along your forearm with a slow, steady rhythm. Awake and supervised only.",
      "Stay with that one approach for a few minutes before changing anything.",
    ],
    angles: {
      solution: "A clear order to try things in, one at a time, instead of five techniques in one evening.",
      shortcut: "Less guessing about whether a technique helped or the evening just got calmer.",
      feeling: "You start to see a pattern instead of a blur.",
    },
  },

  FM: {
    apiType: "Feeding Mechanics",
    type: "Feeding Mechanics",
    subtitle: "Closest Fit",
    emoji: "🍼",
    bannerClass: "feed-banner",
    stepClass: "feed-sn",
    tagline: "Crying that follows feeds, with gulping or pulling off, often fits this pattern.",

    seeing: "What you're probably seeing tonight: fussing or crying that starts a predictable while after a feed, pulling off the breast or bottle mid-feed, audible gulping or coughing while feeding, and a baby who seems more settled upright than lying flat.",
    why: "A newborn's suck-swallow-breathe coordination is still developing, and a fast milk flow, a steep bottle angle or a shallow latch can make feeds rushed. Paced feeding slows the flow and makes feeds longer without reducing how much a baby takes. Whether that reduces colic crying has not been shown. Wind and colic often show up together, but no one has shown that wind causes colic crying.",
    rulesOut: "Your answers fit this pattern better than the other two, but colic is not known to split cleanly into three causes. Gut discomfort often shows with a tight belly and stool changes whatever the feed timing. Nervous-system overload often escalates with any stimulation, not just around feeds. No study has shown that burping longer or harder helps.",
    steps: (feeding) => [
      {title: "Slow the flow", body: (feeding === 'Breastfed'
        ? "Check that your baby's mouth covers more than the nipple, and pause if you hear gulping or clicking so they can breathe. If feeds look painful or rushed, ask a lactation consultant for a latch check."
        : "Hold your baby near-upright with the bottle near-horizontal and the nipple fully covered with milk, so they set the pace. Pause every 20 to 30 seconds and let them breathe. Feeds will take longer, and that is expected."), ev: "Changes flow and feed length. Colic benefit unproven"},
      {title: "Burp upright, gently", body: "Hold your baby upright with their head on your shoulder and use gentle pats. Don't force a burp. If none comes after a few minutes, that is fine.", ev: "Common practice. No study shows one position is better"},
      {title: "Keep them upright for a while after the feed", body: "Many parents are advised to hold their baby upright for 10 to 15 minutes after feeds, especially for babies who spit up.", ev: "Common advice, not trial-tested"},
    ],
    monitor: "Watch whether the crying tracks with time since feeds. That may fit this pattern, but it doesn't prove it. If your baby arches and refuses feeds, isn't gaining weight as expected, or vomits forcefully, talk to your pediatrician about reflux or a feeding evaluation rather than changing positions at home.",
    bridgeLine: (name) => `${name}, feeding pace is something you can change, and it costs nothing to try. If you'd like the steps, the tracker and the evidence in one place, that's what the Calm Baby Blueprint is for.`,

    forBaby: "Crying on a delay after feeds, gulping or pulling off mid-feed, settles better held upright.",
    whyTipsFailed: "The usual advice, burp longer or try a different bottle, is common practice with little trial evidence either way. Changing several things at once makes it hard to tell whether anything helped, and paced feeding itself is unproven for colic.",
    whatsDifferent: "Not a single tip about bottle angle. Paced-feeding steps, a latch check for breastfeeding, and a log of feeds and crying so you can see whether the timing really lines up, with separate steps for breastfed, formula-fed and mixed feeding.",
    protocol: [
      "Starting-point assessment, a deeper version of the free one",
      "Feeding steps: paced feeding, bottle position and a latch check, with separate steps for breastfeeding and formula-feeding",
      "Upright holds and burping, step by step",
      "60-Minute Brown Noise Soundscape (Bonus 2), for quiet, low use across the room on a timer",
      "Bloom Baby Tracker App (Bonus 1), log feeds and crying times to see if they line up",
      "Cry Decoder Masterclass (Bonus 3), learn to tell a gas cry, an overtired cry and a dysregulation cry apart by ear",
    ],
    trustVincent: TRUST_VINCENT,
    evidence: () => "Paced feeding is widely taught. It slows flow and lengthens feeds without reducing intake. No trial has shown it reduces colic crying in full-term babies, so the Blueprint presents it as a low-risk thing to try and track.",
    ctaBtnText: "Get the Calm Baby Blueprint, $47",
    mailerliteField: "Feeding Mechanics Primary",
    quickTitle: "Try this at your baby's next feed",
    quickSteps: (feeding) => feeding === 'Breastfed' ? [
      "Check that your baby's mouth covers more than the nipple.",
      "Pause if you hear gulping or clicking, so they can breathe and reset.",
      "Hold them upright for 10 to 15 minutes after the feed before laying them down.",
    ] : [
      "Hold the bottle near-horizontal with the nipple fully covered with milk, so your baby sets the pace.",
      "Pause every 20 to 30 seconds so they can breathe and reset.",
      "Hold them upright for 10 to 15 minutes after the feed before laying them down.",
    ],
    angles: {
      solution: "Paced-feeding steps and a feed-and-cry log, so you can see whether feeding really is involved.",
      shortcut: "Less guessing at bottle angles and generic feeding advice.",
      feeling: "Feeding stops feeling like something you're getting wrong three times a day.",
    },
  },
};

// Share of completed assessments by primary pattern, Sep 2026 (Dashboard v9.1).
// Describes who uses this assessment, NOT how common each pattern is in colic.


// Add MIXED / GENERAL pattern to RESULTS for all-zero / balanced edge cases
RESULTS.MIXED = {
  apiType: "General Colic Starting Point",
  type: "General Colic Starting Point",
  subtitle: "Combined starting-point pattern",
  emoji: "⚖️",
  bannerClass: "ns-banner",
  stepClass: "ns-sn",
  tagline: "Your answers show a balanced combination across feeding, digestive, and settling cues.",
  seeing: "Fussiness distributed across the day with both mild post-feed discomfort and evening restlessness.",
  why: "In early infancy, feeding mechanics, digestive stabilization, and nervous system maturation are closely connected. When symptoms are distributed evenly, the evidence supports starting with baseline soothing foundations: paced upright feeds, gentle burping pauses, and a calm low-stimulation room during evening hours.",
  rulesOut: "Does not mean an unusual or incurable condition. It reflects the normal developmental overlap common between weeks 2 and 10.",
  monitor: "Note whether slowing feed pacing or dimming evening lights produces the first noticeable shift.",
  steps: function(feedingMethod) {
    return [
      {
        title: "Paced Feeding and Upright Burping",
        body: "Hold the bottle horizontally or ensure deep latch alignment. Keep your baby upright for 10-15 minutes after feeds.",
        ev: "Reduces rapid air swallowing and subsequent stomach distension."
      },
      {
        title: "Evening Sensory Dampening",
        body: "Dim household lights 30 minutes before evening fussiness. Use continuous low brown noise across the room.",
        ev: "Helps calm overstimulated sensory pathways during the peak crying window."
      },
      {
        title: "72-Hour Observation Log",
        body: "Track feed times and crying episodes for 72 hours before changing formulas or introducing drops.",
        ev: "Avoids confounding multiple simultaneous changes."
      }
    ];
  },
  forBaby: "A complete step-by-step roadmap for babies with overlapping digestive and sensory signs.",
  whyTipsFailed: "Random tips often target one symptom while missing how feeding flow and evening overstimulation interact.",
  whatsDifferent: "Sequences adjustments in order: feeding mechanics first, then winding, then evening settling.",
  trustVincent: "I read and weigh research literature for a living. I am not a pediatrician or lactation consultant.",
  evidence: function(feedingMethod) {
    return "Trials show that systematic positioning and environmental modifications offer a reliable starting point while baby's systems mature.";
  },
  protocol: [
    "Full Paced Feeding & Upright Angle Protocols",
    "Evening Low-Stimulation Setup Guide",
    "Step-by-Step 72-Hour Symptom Tracker"
  ],
  bridgeLine: function(name) {
    return name ? name + ", here is your general starting-point protocol." : "Here is your general starting-point protocol.";
  },
  ctaBtnText: "Get the Calm Baby Blueprint",
  mailerliteField: "General Pattern",
  primaryAction: "Start with horizontal paced feeding and upright winding, then introduce evening sensory dimming.",
  angles: {
    solution: "A step-by-step 48-hour sequencing plan covering feeding, winding, and evening soothing.",
    shortcut: "Follow the 3-step sequence instead of guessing which single remedy to try.",
    feeling: "Clear structured guidance when multiple symptoms appear at once."
  }
};

const PREVALENCE = { NS: 52, GUT: 25, FM: 23, MIXED: 10 };

/* ── STATE ───────────────────────────────────────────────────────────── */
let userName = '';
let userEmail = '';
let userConsent = false;
let babyAgeWeeks = null;
let currentAgeWeeks = 6;
let babyName = '';
let scores = { GUT: 0, NS: 0, FM: 0 };
let feedingMethod = '';
let triedItems = [];
let cryingDuration = '';
let typeReasons = { GUT: [], NS: [], FM: [] };
let qIndex = 0;
let qHistory = [];
let selectedMap = new Map();
let autoAdvanceTimer = null;
let resultShown = false;
let suppressSubscribe = false;
let quizStartedAt = Date.now();
const ASSESSMENT_ID = 'CP-2026-' + Math.random().toString(36).substring(2, 7).toUpperCase();

/* ── DOM REFS ────────────────────────────────────────────────────────── */
const show = id => { const el = document.getElementById(id); if (el) el.classList.remove('hidden'); };
const hide = id => { const el = document.getElementById(id); if (el) el.classList.add('hidden'); };

function sendEvent(name, params) {
  try {
    if (typeof gtag === 'function') gtag('event', name, params);
  } catch(e){}
}

/* ── SAFE SUBSCRIPTION (MATCHED TO /functions/api/subscribe.js) ──────── */
async function subscribeToMailerLite(name, email, colcType, mlGroup, quizStatus, pathClicked = '') {
  if (suppressSubscribe || !email) return;
  const utm = getStoredUTMs();
  const ageCohort = classifyAge(babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks);

  let apiType = 'Unassigned';
  if (
    colcType === 'Gut Microbiome Imbalance' ||
    colcType === 'Nervous System Dysregulation' ||
    colcType === 'Feeding Mechanics' ||
    colcType === 'General Colic Starting Point'
  ) {
    apiType = colcType;
  } else if (RESULTS[colcType] && RESULTS[colcType].apiType) {
    apiType = RESULTS[colcType].apiType;
  }

  const payload = {
    name,
    email,
    consent: true,
    colic_type: apiType,
    colic_type_detail: cryingDuration || mlGroup || '',
    baby_name: babyName || '',
    baby_age_weeks: babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks,
    baby_age_range: ageCohort.range,
    crying_duration: cryingDuration || '',
    feeding_method: feedingMethod || 'Not specified',
    confidence_pct: getConfidencePct(),
    tried_items: triedItems.join(', '),
    lead_source: utm.utm_source || 'quiz',
    quiz_status: quizStatus || 'completed',
    quiz_version: QUIZ_VERSION,
    assessment_id: ASSESSMENT_ID,
    red_flag: redFlagStatus,
    path_clicked: pathClicked,
    ...utm
  };

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // Ensures path_clicked pings finish even during page navigation
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      sendEvent('lead_capture_failed', { colic_type: apiType, ml_status: res.status });
    }
  } catch (e) {
    console.warn('Subscribe error:', e);
    sendEvent('lead_capture_failed', { colic_type: apiType, ml_status: 0 });
  }
}

/* ── PROGRESS & NAV ──────────────────────────────────────────────────── */
function updateProgress(pct) {
  const pf = document.getElementById('progressFill');
  const cm = document.getElementById('crawlerMarker');
  if (pf) pf.style.width = pct + '%';
  if (cm) cm.style.left = 'calc(' + pct + '% - 23px)';
}

function shake(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.borderColor = '#BA5731';
  const oldPl = el.placeholder;
  el.placeholder = msg;
  setTimeout(() => {
    el.style.borderColor = '';
    el.placeholder = oldPl;
  }, 2200);
}

/* ── FLOW: START QUIZ ────────────────────────────────────────────────── */
function startQuiz() {
  scores = { GUT: 0, NS: 0, FM: 0 };
  feedingMethod = '';
  triedItems = [];
  cryingDuration = '';
  typeReasons = { GUT: [], NS: [], FM: [] };
  qIndex = 0;
  qHistory = [];
  selectedMap.clear();
  rfSelected.clear();
  redFlagStatus = 'pending';
  babyAgeWeeks = 6;
  currentAgeWeeks = 6;

  hide('landingScreen');
  renderRedFlag();
  show('redFlagScreen');
}

/* ── SAFETY CHECK ────────────────────────────────────────────────────── */
function renderRedFlag() {
  const box = document.getElementById('rfOptions');
  box.innerHTML = '';
  rfSelected.clear();
  document.getElementById('rfContinue').classList.remove('visible');

  const all = RED_FLAG_OPTIONS.concat([{
    text: 'None of these',
    visual: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#698457" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><circle cx="9" cy="10" r="1.2" fill="#698457"/><circle cx="15" cy="10" r="1.2" fill="#698457"/><path d="M8 14c1.5 2 6.5 2 8 0"/></svg>`
  }]);

  all.forEach((item, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.setAttribute('role', 'checkbox');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');
    const visualHtml = item.visual ? `<div class="opt-visual">${item.visual}</div>` : '';
    div.innerHTML = `<span class="opt-check" aria-hidden="true"></span>${visualHtml}<span class="opt-text">${item.text}</span>`;
    div.onclick = () => toggleRedFlag(i, div);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRedFlag(i, div); } };
    box.appendChild(div);
  });
}

function toggleRedFlag(i, el) {
  const nodes = document.querySelectorAll('#rfOptions .option');
  const setOn = (node, on) => {
    node.classList.toggle('selected', on);
    node.setAttribute('aria-checked', on ? 'true' : 'false');
    node.querySelector('.opt-check').textContent = on ? '✓' : '';
  };

  if (i === RF_NONE) {
    const wasOn = rfSelected.has(RF_NONE);
    rfSelected.clear();
    nodes.forEach(n => setOn(n, false));
    if (!wasOn) { rfSelected.add(RF_NONE); setOn(el, true); }
  } else {
    if (rfSelected.has(RF_NONE)) { rfSelected.delete(RF_NONE); setOn(nodes[RF_NONE], false); }
    if (rfSelected.has(i)) { rfSelected.delete(i); setOn(el, false); }
    else { rfSelected.add(i); setOn(el, true); }
  }
  document.getElementById('rfContinue').classList.toggle('visible', rfSelected.size > 0);
}

function submitRedFlag() {
  if (rfSelected.size === 0) return;
  const flagged = Array.from(rfSelected).filter(i => i !== RF_NONE).sort((a, b) => a - b);

  if (flagged.length === 0) {
    redFlagStatus = 'none';
    hide('redFlagScreen');
    show('quizScreen');
    renderQuestion();
    return;
  }

  const labels = flagged.map(i => RED_FLAG_OPTIONS[i].short);
  document.getElementById('rfStopList').textContent = labels.join(', ');
  redFlagStatus = 'flagged: ' + labels.join(', ');
  sendEvent('red_flag_stop', { colic_type: 'Unassigned', symptoms: labels.join(', ') });
  hide('redFlagScreen');
  show('redFlagStopScreen');
}

function backFromRedFlagStop() {
  hide('redFlagStopScreen');
  redFlagStatus = 'pending';
  show('redFlagScreen');
}

/* ── AGE QUESTION (DEVELOPMENTAL CRYING CURVE) ───────────────────────── */
function renderAgeQuestion() {
  const box = document.getElementById('optionsBox');
  const selectedWeeks = (babyAgeWeeks !== null && babyAgeWeeks !== undefined) ? babyAgeWeeks : (currentAgeWeeks || 6);
  currentAgeWeeks = selectedWeeks;
  const classification = classifyAge(selectedWeeks);
  const coords = getCurveCoords(selectedWeeks);

  const graphCard = document.createElement('div');
  graphCard.id = 'dynamicSpecialVisualBox';
  graphCard.className = 'dev-curve-card';

  graphCard.innerHTML = `
    <div class="dcc-header">
      <div class="dcc-badge">Developmental Crying Timeline</div>
      <div class="dcc-title">Where Your Baby Sits on the Typical Crying Curve</div>
    </div>
    <div class="dcc-graph-wrap">
      <svg viewBox="0 0 540 180" width="100%" height="auto">
        <defs>
          <linearGradient id="curveShade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#BA5731" stop-opacity="0.25"/>
            <stop offset="100%" stop-color="#BA5731" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        <line x1="40" y1="140" x2="500" y2="140" stroke="rgba(38,27,20,0.18)" stroke-width="1.5"/>
        <line x1="40" y1="85" x2="500" y2="85" stroke="rgba(38,27,20,0.06)" stroke-dasharray="4,4"/>
        <line x1="40" y1="35" x2="500" y2="35" stroke="rgba(38,27,20,0.06)" stroke-dasharray="4,4"/>
        
        <text x="40" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 0</text>
        <text x="95" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 2</text>
        <text x="150" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 4</text>
        <text x="213" y="160" font-family="'DM Mono', monospace" font-size="11" font-weight="700" fill="#BA5731" text-anchor="middle">Wk 6 (Peak)</text>
        <text x="270" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 8</text>
        <text x="330" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 10</text>
        <text x="385" y="160" font-family="'DM Mono', monospace" font-size="11" font-weight="700" fill="#698457" text-anchor="middle">Wk 12 (Ease)</text>
        <text x="445" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 14</text>
        <text x="500" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 16+</text>

        <path d="M 40 135 C 100 130, 160 55, 212.5 35 C 280 50, 360 120, 500 140 L 500 140 L 40 140 Z" fill="url(#curveShade)"/>
        <path d="M 40 135 C 100 130, 160 55, 212.5 35 C 280 50, 360 120, 500 140" fill="none" stroke="#BA5731" stroke-width="3.5" stroke-linecap="round"/>

        <g id="curvePinGroup" transform="translate(${coords.x}, ${coords.y})" style="transition: transform 0.25s ease;">
          <line id="curvePinLine" x1="0" y1="0" x2="0" y2="${140 - coords.y}" stroke="#BA5731" stroke-width="1.8" stroke-dasharray="3,3"/>
          <circle cx="0" cy="0" r="7" fill="#BA5731" stroke="#FAF4EC" stroke-width="2.5"/>
          <rect x="-42" y="-28" width="84" height="20" rx="5" fill="#261B14"/>
          <text id="curvePinText" x="0" y="-14" font-family="'DM Mono', monospace" font-size="10" font-weight="700" fill="#FAF4EC" text-anchor="middle">Week ${selectedWeeks}${selectedWeeks === 6 ? ' (Peak)' : ''}</text>
        </g>
      </svg>
    </div>
  `;
  box.appendChild(graphCard);

  const inputCard = document.createElement('div');
  inputCard.className = 'age-integer-card';
  inputCard.innerHTML = `
    <div class="aic-stepper-wrap">
      <button type="button" class="aic-step-btn" onclick="adjustAgeWeeks(-1)">&minus;</button>
      <div class="aic-val-box">
        <span class="aic-val-num" id="ageValDisplay">${selectedWeeks}</span>
        <span class="aic-val-unit">weeks old</span>
      </div>
      <button type="button" class="aic-step-btn" onclick="adjustAgeWeeks(1)">&plus;</button>
    </div>

    <div class="aic-slider-wrap">
      <input type="range" id="ageSlider" min="0" max="20" value="${selectedWeeks}" step="1" oninput="setAgeWeeks(this.value)" class="aic-slider"/>
      <div class="aic-slider-ticks">
        <span>0w</span>
        <span>3w</span>
        <span style="color:var(--terra);font-weight:700">6w (Peak)</span>
        <span>9w</span>
        <span style="color:var(--sage);font-weight:700">12w (Easing)</span>
        <span>16w+</span>
      </div>
    </div>

    <div class="aic-chips-wrap">
      <button type="button" class="aic-chip ${selectedWeeks <= 2 ? 'active' : ''}" id="chip-2" onclick="setAgeWeeks(2)">0-2 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks >= 3 && selectedWeeks <= 5 ? 'active' : ''}" id="chip-4" onclick="setAgeWeeks(4)">3-5 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks === 6 ? 'active' : ''}" id="chip-6" onclick="setAgeWeeks(6)">6 weeks (Peak)</button>
      <button type="button" class="aic-chip ${selectedWeeks >= 7 && selectedWeeks <= 8 ? 'active' : ''}" id="chip-8" onclick="setAgeWeeks(8)">7-8 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks >= 9 && selectedWeeks <= 12 ? 'active' : ''}" id="chip-10" onclick="setAgeWeeks(10)">9-12 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks > 12 ? 'active' : ''}" id="chip-12" onclick="setAgeWeeks(13)">12+ weeks</button>
    </div>

    <div class="aic-classification-box">
      <div class="aic-class-header">
        <span class="aic-class-tag" id="ageClassTag">${classification.tag}</span>
        <span class="aic-class-status" id="ageClassStatus">${classification.status}</span>
      </div>
      <div class="aic-milestone-text" id="ageClassMilestone">${classification.milestone}</div>
    </div>
  `;
  box.appendChild(inputCard);

  const btn = document.getElementById('continueBtn');
  btn.classList.add('visible');
  btn.textContent = `Continue with ${selectedWeeks} Weeks →`;
}

function setAgeWeeks(val) {
  const num = Math.min(24, Math.max(0, parseInt(val, 10) || 0));
  currentAgeWeeks = num;
  babyAgeWeeks = num;

  const numEl = document.getElementById('ageValDisplay');
  if (numEl) numEl.textContent = num;

  const slider = document.getElementById('ageSlider');
  if (slider) slider.value = num;

  document.querySelectorAll('.aic-chip').forEach(btn => btn.classList.remove('active'));
  let chipId = 'chip-6';
  if (num <= 2) chipId = 'chip-2';
  else if (num <= 5) chipId = 'chip-4';
  else if (num <= 6) chipId = 'chip-6';
  else if (num <= 8) chipId = 'chip-8';
  else if (num <= 12) chipId = 'chip-10';
  else chipId = 'chip-12';
  const matchingChip = document.getElementById(chipId);
  if (matchingChip) matchingChip.classList.add('active');

  const coords = getCurveCoords(num);
  const pinGroup = document.getElementById('curvePinGroup');
  if (pinGroup) {
    pinGroup.setAttribute('transform', 'translate(' + coords.x + ', ' + coords.y + ')');
    const lineEl = document.getElementById('curvePinLine');
    if (lineEl) lineEl.setAttribute('y2', 140 - coords.y);
    const pinText = document.getElementById('curvePinText');
    if (pinText) pinText.textContent = 'Week ' + num + (num === 6 ? ' (Peak)' : '');
  }

  const classification = classifyAge(num);
  const tagEl = document.getElementById('ageClassTag');
  if (tagEl) tagEl.textContent = classification.tag;
  const statusEl = document.getElementById('ageClassStatus');
  if (statusEl) statusEl.textContent = classification.status;
  const milestoneEl = document.getElementById('ageClassMilestone');
  if (milestoneEl) milestoneEl.innerHTML = classification.milestone;

  const btn = document.getElementById('continueBtn');
  if (btn) {
    btn.classList.add('visible');
    btn.textContent = 'Continue with ' + num + ' Weeks →';
  }
}

function adjustAgeWeeks(delta) {
  setAgeWeeks(currentAgeWeeks + delta);
}

/* ── CRYING DURATION QUESTION (24-HOUR CLOCK & CONTROLS) ─────────────── */
const DURATION_META = [
  {
    num: "< 1 hr",
    fraction: "~4% of 24h",
    tag: "Baseline Fussiness",
    status: "Within Typical Newborn Range",
    milestone: "Under 1 hour of daily crying is within the typical infant baseline expected in the early newborn weeks."
  },
  {
    num: "1 to 2 hrs",
    fraction: "~7% of 24h",
    tag: "Moderate Clustering",
    status: "Early Clustering Pattern",
    milestone: "1 to 2 hours of daily crying represents moderate clustering, common during developmental growth spurts and evening sensory overload."
  },
  {
    num: "2 to 3 hrs",
    fraction: "~11% of 24h",
    tag: "Borderline Threshold",
    status: "Approaching Colic Criteria",
    milestone: "2 to 3 hours daily approaches the traditional colic threshold; typically concentrated during late afternoon or evening witching hours."
  },
  {
    num: "3 to 4 hrs",
    fraction: "~15% of 24h",
    tag: "Wessel Colic Threshold",
    status: "Meets Pediatric Colic Criteria",
    milestone: "3 to 4 hours daily meets the traditional pediatric Wessel criteria (> 3 hours a day for 3+ days a week). Indicates elevated developmental distress."
  },
  {
    num: "4 to 5 hrs",
    fraction: "~19% of 24h",
    tag: "Significant Daily Distress",
    status: "Above Colic Threshold",
    milestone: "4 to 5 hours daily represents severe distress across both day and night, where conventional soothing tips frequently fail."
  },
  {
    num: "5+ hrs",
    fraction: "21%+ of 24h",
    tag: "Severe Persistent Crying",
    status: "High Distress Burden",
    milestone: "5 or more hours daily indicates intense, round-the-clock crying that places extraordinary exhaustion on the baby and entire family."
  },
  {
    num: "Varies",
    fraction: "Unpredictable Daily Hours",
    tag: "Unpredictable Timeline",
    status: "Varying Daily Pattern",
    milestone: "Crying duration shifts substantially from day to day, suggesting sensory or feeding triggers that occur intermittently."
  }
];

function getAnnularSectorPath(startAngle, endAngle, cx, cy, rInner, rOuter) {
  let diff = endAngle - startAngle;
  while (diff < 0) diff += 360;
  if (diff >= 360) diff = 359.99;
  if (diff <= 0.01) return '';
  const sRad = (startAngle - 90) * Math.PI / 180;
  const eRad = (startAngle + diff - 90) * Math.PI / 180;
  const x1 = (cx + rOuter * Math.cos(sRad)).toFixed(1);
  const y1 = (cy + rOuter * Math.sin(sRad)).toFixed(1);
  const x2 = (cx + rOuter * Math.cos(eRad)).toFixed(1);
  const y2 = (cy + rOuter * Math.sin(eRad)).toFixed(1);
  const x3 = (cx + rInner * Math.cos(eRad)).toFixed(1);
  const y3 = (cy + rInner * Math.sin(eRad)).toFixed(1);
  const x4 = (cx + rInner * Math.cos(sRad)).toFixed(1);
  const y4 = (cy + rInner * Math.sin(sRad)).toFixed(1);
  const largeArc = diff > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${largeArc} 0 ${x4} ${y4} Z`;
}

function getWedgePath(angle, cx, cy, r) {
  return getAnnularSectorPath(0, angle, cx, cy, 64, 104);
}

function generateClockTicks(cx, cy, r) {
  let s = '';
  // 24 main hours (cardinal, major 3-hour, and minor hours)
  for (let i = 0; i < 24; i++) {
    const angle = i * 15;
    const rad = (angle - 90) * Math.PI / 180;
    const isMajor = (i % 3 === 0);
    const isCardinal = (i % 6 === 0);
    const tickLen = isCardinal ? 10 : (isMajor ? 7 : 4.5);
    const innerR = r - tickLen;
    const x1 = (cx + innerR * Math.cos(rad)).toFixed(1);
    const y1 = (cy + innerR * Math.sin(rad)).toFixed(1);
    const x2 = (cx + r * Math.cos(rad)).toFixed(1);
    const y2 = (cy + r * Math.sin(rad)).toFixed(1);
    const strokeColor = isCardinal ? '#241A12' : (isMajor ? 'rgba(36,26,18,0.55)' : 'rgba(36,26,18,0.22)');
    const strokeWidth = isCardinal ? 1.8 : (isMajor ? 1.3 : 0.8);
    s += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-linecap="round"/>`;
  }
  // 48 half-hour micro-dots for precision instrument calibration
  for (let i = 0; i < 24; i++) {
    const angle = i * 15 + 7.5;
    const rad = (angle - 90) * Math.PI / 180;
    const dotR = r - 4;
    const x = (cx + dotR * Math.cos(rad)).toFixed(1);
    const y = (cy + dotR * Math.sin(rad)).toFixed(1);
    s += `<circle cx="${x}" cy="${y}" r="1" fill="rgba(36,26,18,0.22)"/>`;
  }
  return s;
}

/* ── TIMING QUESTION (24-HOUR DAILY CLOCK & PATTERNS) ───────────────── */
const TIMING_CLOCK_META = [
  {
    hubVal: "5 PM – 12 AM",
    hubSub: "Evening Cluster",
    tag: "Nervous System Pattern",
    status: "Classic Witching Hour Cluster",
    milestone: "Concentrated crying between 5 PM and midnight is the classic hallmark of late-day sensory accumulation, where the infant nervous system becomes overwhelmed by normal daily stimulation.",
    btnLabel: "Continue with Evening Pattern →"
  },
  {
    hubVal: "Post-Feed",
    hubSub: "Every 2.5–3 Hours",
    tag: "Feeding Mechanics Pattern",
    status: "Post-Prandial Discomfort",
    milestone: "Crying that consistently begins during feeding or within 20 minutes after indicates mechanical discomfort: air swallowing, latch fatigue, milk flow velocity mismatch, or early gastric distension.",
    btnLabel: "Continue with Feeding Pattern →"
  },
  {
    hubVal: "Sudden Waves",
    hubSub: "Intermittent Cramps",
    tag: "Gut Microbiome Pattern",
    status: "Digestive Spasm Episodes",
    milestone: "Sudden wave-like distress accompanied by tucked legs and rigid belly indicates smooth-muscle spasms and gas transit discomfort in the immature gut, independent of feeding times.",
    btnLabel: "Continue with Cramp Wave Pattern →"
  },
  {
    hubVal: "All-Day",
    hubSub: "Diffuse Fatigue",
    tag: "Sensory & Sleep Pattern",
    status: "Overtired Arousal Cycle",
    milestone: "All-day irritability with heightened startle response indicates difficulty down-regulating between sleep cycles, leading to cumulative overtired distress across the entire day.",
    btnLabel: "Continue with All-Day Pattern →"
  }
];

function getTimingWedgesSvg(idx) {
  const cx = 140, cy = 140, rIn = 64, rOut = 102;
  if (idx === 0) {
    const p = getAnnularSectorPath(255, 360, cx, cy, rIn, rOut);
    return `<path d="${p}" fill="#BC5A33" fill-opacity="0.45" stroke="#BC5A33" stroke-width="2"/>`;
  } else if (idx === 1) {
    const feeds = [0, 3, 6, 9, 12, 15, 18, 21];
    return feeds.map(h => `<path d="${getAnnularSectorPath(h * 15, h * 15 + 10, cx, cy, rIn, rOut)}" fill="#C0963F" fill-opacity="0.5" stroke="#C0963F" stroke-width="1.8"/>`).join('');
  } else if (idx === 2) {
    const waves = [2, 6.5, 10.5, 14, 18.5, 22];
    return waves.map(h => `<path d="${getAnnularSectorPath(h * 15, h * 15 + 12, cx, cy, rIn, rOut)}" fill="#BC5A33" fill-opacity="0.45" stroke="#BC5A33" stroke-width="1.8"/>`).join('');
  } else if (idx === 3) {
    const p = getAnnularSectorPath(120, 300, cx, cy, rIn, rOut);
    return `<path d="${p}" fill="#6C8759" fill-opacity="0.42" stroke="#6C8759" stroke-width="2"/>`;
  }
  return '';
}

function getTimingThresholdsSvg(idx) {
  if (idx === 0) {
    return `
      <line x1="78.2" y1="156.6" x2="26.0" y2="170.5" stroke="#BC5A33" stroke-width="1.8" stroke-dasharray="3,3"/>
      <circle cx="26.0" cy="170.5" r="3" fill="#BC5A33"/>
      <text x="22" y="184" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#BC5A33">5 PM Threshold</text>
      <line x1="140" y1="76" x2="140" y2="24" stroke="#BC5A33" stroke-width="1.8" stroke-dasharray="3,3"/>
      <circle cx="140" cy="24" r="3" fill="#BC5A33"/>
      <text x="140" y="14" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#BC5A33" text-anchor="middle">Midnight</text>
    `;
  } else if (idx === 1) {
    return `
      <rect x="65" y="4" width="150" height="17" rx="8.5" fill="#FAF5EE" stroke="#C0963F" stroke-width="1.2"/>
      <text x="140" y="15.5" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#C0963F" text-anchor="middle">Post-Feed Spikes (~20-40m)</text>
    `;
  } else if (idx === 2) {
    return `
      <rect x="65" y="4" width="150" height="17" rx="8.5" fill="#FAF5EE" stroke="#BC5A33" stroke-width="1.2"/>
      <text x="140" y="15.5" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#BC5A33" text-anchor="middle">Intermittent Cramp Spasms</text>
    `;
  } else if (idx === 3) {
    return `
      <line x1="195.4" y1="172.0" x2="242.2" y2="199.0" stroke="#6C8759" stroke-width="1.8" stroke-dasharray="3,3"/>
      <circle cx="242.2" cy="199.0" r="3" fill="#6C8759"/>
      <text x="238" y="212" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#6C8759">8 AM Start</text>
      <line x1="84.6" y1="108.0" x2="37.8" y2="81.0" stroke="#6C8759" stroke-width="1.8" stroke-dasharray="3,3"/>
      <circle cx="37.8" cy="81.0" r="3" fill="#6C8759"/>
      <text x="22" y="74" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#6C8759">8 PM Peak</text>
    `;
  }
  return '';
}

function updateTimingClock(idx) {
  const meta = TIMING_CLOCK_META[idx];
  if (!meta) return;

  const wedgesEl = document.getElementById('timingClockWedges');
  if (wedgesEl) wedgesEl.innerHTML = getTimingWedgesSvg(idx);

  const threshEl = document.getElementById('timingClockThresholds');
  if (threshEl) threshEl.innerHTML = getTimingThresholdsSvg(idx);

  const hubVal = document.getElementById('timingClockHubVal');
  if (hubVal) hubVal.textContent = meta.hubVal;

  const hubSub = document.getElementById('timingClockHubSub');
  if (hubSub) hubSub.textContent = meta.hubSub;

  const tag = document.getElementById('timingClassTag');
  if (tag) tag.textContent = meta.tag;

  const status = document.getElementById('timingClassStatus');
  if (status) status.textContent = meta.status;

  const milestone = document.getElementById('timingClassMilestone');
  if (milestone) milestone.textContent = meta.milestone;

  const btn = document.getElementById('continueBtn');
  if (btn) {
    btn.textContent = meta.btnLabel;
    btn.classList.add('visible');
  }
}

function renderDurationClockQuestion() {
  const box = document.getElementById('optionsBox');
  const q = QUESTIONS[1];

  let selectedIdx = 3;
  if (selectedMap.size > 0) {
    selectedIdx = Array.from(selectedMap.keys())[0];
  } else if (qHistory[qIndex] && qHistory[qIndex].selected.size > 0) {
    selectedIdx = Array.from(qHistory[qIndex].selected.keys())[0];
  }

  const curOpt = q.opts[selectedIdx] || q.opts[3];
  const curMeta = DURATION_META[selectedIdx] || DURATION_META[3];
  const curAngle = curOpt[5] || 52.5;
  const curColor = curOpt[6] || '#BA5731';

  selectedMap.clear();
  selectedMap.set(selectedIdx, { weights: curOpt[1], feeding: null, triedTag: null, reason: curOpt[4] });
  cryingDuration = curOpt[4] || '';

  const clockCard = document.createElement('div');
  clockCard.id = 'dynamicSpecialVisualBox';
  clockCard.className = 'dev-curve-card';

  clockCard.innerHTML = `
    <div class="dcc-header">
      <div class="dcc-badge">24-Hour Day & Night Burden</div>
      <div class="dcc-title">How Much of Your Baby's Day is Consumed by Crying</div>
    </div>
    <div class="dcc-clock-wrap">
      <svg viewBox="-8 -8 296 296" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto">
        <defs>
          <linearGradient id="q2NightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#232B1E" stop-opacity="0.10"/>
            <stop offset="100%" stop-color="#241A12" stop-opacity="0.04"/>
          </linearGradient>
          <linearGradient id="q2DayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#C0963F" stop-opacity="0.03"/>
            <stop offset="100%" stop-color="#C0963F" stop-opacity="0.12"/>
          </linearGradient>
          <radialGradient id="q2HubGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#2E2319"/>
            <stop offset="85%" stop-color="#1E1610"/>
            <stop offset="100%" stop-color="#140E0A"/>
          </radialGradient>
          <radialGradient id="bezelShine" cx="35%" cy="30%" r="65%">
            <stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.9"/>
            <stop offset="60%" stop-color="#FAF4EB"/>
            <stop offset="100%" stop-color="#ECE1CF"/>
          </radialGradient>
        </defs>

        <!-- Precision Machined Instrument Bezel -->
        <circle cx="140" cy="140" r="136" fill="none" stroke="rgba(36,26,18,0.12)" stroke-width="1.5"/>
        <circle cx="140" cy="140" r="132" fill="url(#bezelShine)" stroke="#3A2C1F" stroke-width="2.2"/>
        <circle cx="140" cy="140" r="124" fill="#FAF5EE" stroke="rgba(36,26,18,0.2)" stroke-width="1.2"/>

        <!-- 4 Brass Corner Rivets/Screws (at 45, 135, 225, 315 deg) -->
        <g id="dialScrewsQ2">
          <circle cx="230.5" cy="49.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
          <line x1="228.5" y1="47.5" x2="232.5" y2="51.5" stroke="#4A3815" stroke-width="0.8"/>
          <circle cx="230.5" cy="230.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
          <line x1="228.5" y1="232.5" x2="232.5" y2="228.5" stroke="#4A3815" stroke-width="0.8"/>
          <circle cx="49.5" cy="230.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
          <line x1="47.5" y1="228.5" x2="51.5" y2="232.5" stroke="#4A3815" stroke-width="0.8"/>
          <circle cx="49.5" cy="49.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
          <line x1="47.5" y1="51.5" x2="51.5" y2="47.5" stroke="#4A3815" stroke-width="0.8"/>
        </g>

        <!-- Day / Night Dial Quadrant Backgrounds -->
        <path d="M 16 140 A 124 124 0 0 1 264 140" fill="url(#q2NightGrad)"/>
        <path d="M 264 140 A 124 124 0 0 1 16 140" fill="url(#q2DayGrad)"/>
        <line x1="16" y1="140" x2="36" y2="140" stroke="rgba(36,26,18,0.3)" stroke-width="1.5"/>
        <line x1="244" y1="140" x2="264" y2="140" stroke="rgba(36,26,18,0.3)" stroke-width="1.5"/>

        <!-- Calibrated Radial Ticks -->
        ${generateClockTicks(140, 140, 122)}

        <!-- Concentric Guideway Tracks -->
        <circle cx="140" cy="140" r="102" fill="none" stroke="rgba(36,26,18,0.12)" stroke-width="1"/>
        <circle cx="140" cy="140" r="82" fill="none" stroke="rgba(36,26,18,0.06)" stroke-width="0.8" stroke-dasharray="2,3"/>
        <circle cx="140" cy="140" r="64" fill="none" stroke="rgba(36,26,18,0.15)" stroke-width="1"/>

        <!-- Dial Face Hour Markers with generous padding -->
        <text x="140" y="30" font-family="'DM Sans', sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="#37452F" text-anchor="middle">&#x1F319; NIGHT &middot; 12 AM</text>
        <text x="140" y="260" font-family="'DM Sans', sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="#9C7A28" text-anchor="middle">&#x2600;&#xFE0F; DAY &middot; 12 PM</text>
        <text x="250" y="143" font-family="'DM Mono', monospace" font-size="8" font-weight="700" fill="#7A6856" text-anchor="middle">6 AM</text>
        <text x="30" y="143" font-family="'DM Mono', monospace" font-size="8" font-weight="700" fill="#7A6856" text-anchor="middle">6 PM</text>

        <text x="214" y="66" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">3 AM</text>
        <text x="214" y="222" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">9 AM</text>
        <text x="66" y="222" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">3 PM</text>
        <text x="66" y="66" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">9 PM</text>

        <!-- Annular Base Track -->
        <path d="M 140 38 A 102 102 0 1 1 139.9 38 L 139.9 76 A 64 64 0 1 0 140 76 Z" fill="rgba(38,27,20,0.035)"/>

        <!-- 3h Wessel Colic Threshold benchmark (45 deg) -->
        <line x1="185.3" y1="94.7" x2="228" y2="52" stroke="#BA5731" stroke-width="2" stroke-dasharray="3,2"/>
        <circle cx="228" cy="52" r="3.5" fill="#BA5731"/>
        <rect x="202" y="32" width="68" height="15" rx="7.5" fill="#FAF5EE" stroke="#BA5731" stroke-width="1.2"/>
        <text x="236" y="42.5" font-family="'DM Mono', monospace" font-size="7.5" font-weight="700" fill="#BA5731" text-anchor="middle">3h Colic Bar</text>

        <!-- Dynamic Wedge -->
        <path id="clockArcWedge" d="${getAnnularSectorPath(0, curAngle, 140, 140, 64, 102)}" fill="${curColor}" fill-opacity="0.48" stroke="${curColor}" stroke-width="2.2" style="transition: all 0.25s ease;"/>

        <!-- Center Hub (Machined Gauge Core) -->
        <circle cx="140" cy="140" r="49" fill="#FAF5ED" stroke="rgba(36,26,18,0.2)" stroke-width="1"/>
        <circle cx="140" cy="140" r="47" fill="none" stroke="#C0963F" stroke-width="1.6"/>
        <circle cx="140" cy="140" r="45" fill="url(#q2HubGrad)" stroke="#1B130D" stroke-width="1.5"/>
        <circle cx="140" cy="140" r="43" fill="none" stroke="rgba(192,150,63,0.35)" stroke-width="1" stroke-dasharray="2,2"/>
        <text id="clockHubVal" x="140" y="136" font-family="'Cormorant Garamond', serif" font-size="22" font-weight="700" fill="#FAF5EE" text-anchor="middle">${curMeta.num}</text>
        <text id="clockHubSub" x="140" y="153" font-family="'DM Mono', monospace" font-size="8.5" font-weight="600" fill="#C0963F" text-anchor="middle">${curMeta.fraction}</text>
      </svg>
    </div>
  `;
  box.appendChild(clockCard);

  const inputCard = document.createElement('div');
  inputCard.className = 'age-integer-card';
  inputCard.innerHTML = `
    <div class="aic-stepper-wrap">
      <button type="button" class="aic-step-btn" onclick="adjustDurationIdx(-1)">&minus;</button>
      <div class="aic-val-box">
        <span class="aic-val-num" id="durValDisplay">${curMeta.num}</span>
        <span class="aic-val-unit">daily crying across 24h</span>
      </div>
      <button type="button" class="aic-step-btn" onclick="adjustDurationIdx(1)">&plus;</button>
    </div>

    <div class="aic-slider-wrap">
      <input type="range" id="durSlider" min="0" max="6" value="${selectedIdx}" step="1" oninput="setDurationIdx(this.value)" class="aic-slider"/>
      <div class="aic-slider-ticks">
        <span>&lt; 1h</span>
        <span>1-2h</span>
        <span>2-3h</span>
        <span style="color:var(--terra);font-weight:700">3-4h (Colic)</span>
        <span>4-5h</span>
        <span>5h+</span>
        <span>Varies</span>
      </div>
    </div>

    <div class="aic-chips-wrap">
      <button type="button" class="aic-chip ${selectedIdx === 0 ? 'active' : ''}" id="dur-chip-0" onclick="setDurationIdx(0)">&lt; 1 hour</button>
      <button type="button" class="aic-chip ${selectedIdx === 1 ? 'active' : ''}" id="dur-chip-1" onclick="setDurationIdx(1)">1 to 2 hours</button>
      <button type="button" class="aic-chip ${selectedIdx === 2 ? 'active' : ''}" id="dur-chip-2" onclick="setDurationIdx(2)">2 to 3 hours</button>
      <button type="button" class="aic-chip ${selectedIdx === 3 ? 'active' : ''}" id="dur-chip-3" onclick="setDurationIdx(3)">3 to 4 hours (Colic threshold)</button>
      <button type="button" class="aic-chip ${selectedIdx === 4 ? 'active' : ''}" id="dur-chip-4" onclick="setDurationIdx(4)">4 to 5 hours</button>
      <button type="button" class="aic-chip ${selectedIdx === 5 ? 'active' : ''}" id="dur-chip-5" onclick="setDurationIdx(5)">5+ hours</button>
      <button type="button" class="aic-chip ${selectedIdx === 6 ? 'active' : ''}" id="dur-chip-6" onclick="setDurationIdx(6)">Varies / Unsure</button>
    </div>

    <div class="aic-classification-box">
      <div class="aic-class-header">
        <span class="aic-class-tag" id="durClassTag">${curMeta.tag}</span>
        <span class="aic-class-status" id="durClassStatus">${curMeta.status}</span>
      </div>
      <div class="aic-milestone-text" id="durClassMilestone">${curMeta.milestone}</div>
    </div>
  `;
  box.appendChild(inputCard);

  const btn = document.getElementById('continueBtn');
  btn.classList.add('visible');
  btn.textContent = `Continue with ${curOpt[7] || curMeta.num} →`;
}

function setDurationIdx(val) {
  const idx = Math.min(6, Math.max(0, parseInt(val, 10) || 0));
  const q = QUESTIONS[1];
  const opt = q.opts[idx];
  const meta = DURATION_META[idx];

  selectedMap.clear();
  selectedMap.set(idx, { weights: opt[1], feeding: null, triedTag: null, reason: opt[4] });
  cryingDuration = opt[4] || '';

  const wedge = document.getElementById('clockArcWedge');
  if (wedge) {
    wedge.setAttribute('d', getAnnularSectorPath(0, opt[5] || 0, 140, 140, 64, 102));
    wedge.setAttribute('fill', opt[6] || '#BA5731');
    wedge.setAttribute('stroke', opt[6] || '#BA5731');
  }
  const hubVal = document.getElementById('clockHubVal');
  if (hubVal) hubVal.textContent = meta.num;
  const hubSub = document.getElementById('clockHubSub');
  if (hubSub) hubSub.textContent = meta.fraction;

  const valEl = document.getElementById('durValDisplay');
  if (valEl) valEl.textContent = meta.num;
  const slider = document.getElementById('durSlider');
  if (slider) slider.value = idx;

  for (let i = 0; i <= 6; i++) {
    const chip = document.getElementById('dur-chip-' + i);
    if (chip) chip.classList.toggle('active', i === idx);
  }

  const tagEl = document.getElementById('durClassTag');
  if (tagEl) tagEl.textContent = meta.tag;
  const statusEl = document.getElementById('durClassStatus');
  if (statusEl) statusEl.textContent = meta.status;
  const detailEl = document.getElementById('durClassMilestone');
  if (detailEl) detailEl.textContent = meta.milestone;

  const btn = document.getElementById('continueBtn');
  if (btn) btn.textContent = `Continue with ${opt[7] || meta.num} →`;
}

function adjustDurationIdx(delta) {
  const current = selectedMap.size > 0 ? Array.from(selectedMap.keys())[0] : 3;
  setDurationIdx(current + delta);
}

/* ── QUESTION RENDERING ──────────────────────────────────────────────── */
function renderQuestion() {
  const existingSpecial = document.getElementById('dynamicSpecialVisualBox');
  if (existingSpecial) existingSpecial.remove();

  selectedMap.clear();
  const q = QUESTIONS[qIndex];

  document.getElementById('zStepNum').textContent = (qIndex + 1);
  document.getElementById('qCount').textContent = `Question ${qIndex + 1} of ${QUESTIONS.length}`;
  document.getElementById('stepPctText').textContent = `${Math.round(((qIndex + 1) / QUESTIONS.length) * 100)}% Complete`;
  updateProgress(((qIndex + 1) / QUESTIONS.length) * 100);

  const backBtn = document.getElementById('backBtn');
  if (backBtn) backBtn.style.display = qIndex > 0 ? 'inline-block' : 'none';

  document.getElementById('qText').textContent = q.q;
  document.getElementById('qSub').textContent = q.sub;
  document.getElementById('multiHint').style.display = q.multi ? 'block' : 'none';

  const continueBtn = document.getElementById('continueBtn');
  continueBtn.classList.remove('visible');
  continueBtn.textContent = 'Continue';

  const box = document.getElementById('optionsBox');
  box.innerHTML = '';

  if (q.isIntegerAge) {
    renderAgeQuestion();
    return;
  }

  if (q.isDurationClock) {
    renderDurationClockQuestion();
    return;
  }

  if (q.isTimingClock) {
    const clockCard = document.createElement('div');
    clockCard.id = 'dynamicSpecialVisualBox';
    clockCard.className = 'dev-curve-card';

    clockCard.innerHTML = `
      <div class="dcc-header">
        <div class="dcc-badge">24-Hour Daily Timing Pattern</div>
        <div class="dcc-title">When Crying Clusters Across the 24-Hour Day</div>
      </div>
      <div class="dcc-clock-wrap">
        <svg viewBox="-8 -8 296 296" style="width:100%;max-width:320px;height:auto;display:block;margin:0 auto">
          <defs>
            <linearGradient id="q3NightGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#232B1E" stop-opacity="0.10"/>
              <stop offset="100%" stop-color="#241A12" stop-opacity="0.04"/>
            </linearGradient>
            <linearGradient id="q3DayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stop-color="#C0963F" stop-opacity="0.03"/>
              <stop offset="100%" stop-color="#C0963F" stop-opacity="0.12"/>
            </linearGradient>
            <radialGradient id="q3HubGrad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="#2E2319"/>
              <stop offset="85%" stop-color="#1E1610"/>
              <stop offset="100%" stop-color="#140E0A"/>
            </radialGradient>
            <radialGradient id="bezelShineQ3" cx="35%" cy="30%" r="65%">
              <stop offset="0%" stop-color="#FFFDF9" stop-opacity="0.9"/>
              <stop offset="60%" stop-color="#FAF4EB"/>
              <stop offset="100%" stop-color="#ECE1CF"/>
            </radialGradient>
          </defs>

          <!-- Precision Machined Instrument Bezel -->
          <circle cx="140" cy="140" r="136" fill="none" stroke="rgba(36,26,18,0.12)" stroke-width="1.5"/>
          <circle cx="140" cy="140" r="132" fill="url(#bezelShineQ3)" stroke="#3A2C1F" stroke-width="2.2"/>
          <circle cx="140" cy="140" r="124" fill="#FAF5EE" stroke="rgba(36,26,18,0.2)" stroke-width="1.2"/>

          <!-- 4 Brass Corner Rivets/Screws -->
          <g id="dialScrewsQ3">
            <circle cx="230.5" cy="49.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
            <line x1="228.5" y1="47.5" x2="232.5" y2="51.5" stroke="#4A3815" stroke-width="0.8"/>
            <circle cx="230.5" cy="230.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
            <line x1="228.5" y1="232.5" x2="232.5" y2="228.5" stroke="#4A3815" stroke-width="0.8"/>
            <circle cx="49.5" cy="230.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
            <line x1="47.5" y1="228.5" x2="51.5" y2="232.5" stroke="#4A3815" stroke-width="0.8"/>
            <circle cx="49.5" cy="49.5" r="3.2" fill="#C0963F" stroke="#7A5D25" stroke-width="0.8"/>
            <line x1="47.5" y1="51.5" x2="51.5" y2="47.5" stroke="#4A3815" stroke-width="0.8"/>
          </g>

          <!-- Day / Night Dial Quadrant Backgrounds -->
          <path d="M 16 140 A 124 124 0 0 1 264 140" fill="url(#q3NightGrad)"/>
          <path d="M 264 140 A 124 124 0 0 1 16 140" fill="url(#q3DayGrad)"/>
          <line x1="16" y1="140" x2="36" y2="140" stroke="rgba(36,26,18,0.3)" stroke-width="1.5"/>
          <line x1="244" y1="140" x2="264" y2="140" stroke="rgba(36,26,18,0.3)" stroke-width="1.5"/>

          <!-- Calibrated Radial Ticks -->
          ${generateClockTicks(140, 140, 122)}

          <!-- Concentric Guideway Tracks -->
          <circle cx="140" cy="140" r="102" fill="none" stroke="rgba(36,26,18,0.12)" stroke-width="1"/>
          <circle cx="140" cy="140" r="82" fill="none" stroke="rgba(36,26,18,0.06)" stroke-width="0.8" stroke-dasharray="2,3"/>
          <circle cx="140" cy="140" r="64" fill="none" stroke="rgba(36,26,18,0.15)" stroke-width="1"/>

          <!-- Dial Face Hour Markers with generous padding -->
          <text x="140" y="30" font-family="'DM Sans', sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="#37452F" text-anchor="middle">&#x1F319; NIGHT &middot; 12 AM</text>
          <text x="140" y="260" font-family="'DM Sans', sans-serif" font-size="8.5" font-weight="700" letter-spacing="0.06em" fill="#9C7A28" text-anchor="middle">&#x2600;&#xFE0F; DAY &middot; 12 PM</text>
          <text x="250" y="143" font-family="'DM Mono', monospace" font-size="8" font-weight="700" fill="#7A6856" text-anchor="middle">6 AM</text>
          <text x="30" y="143" font-family="'DM Mono', monospace" font-size="8" font-weight="700" fill="#7A6856" text-anchor="middle">6 PM</text>

          <text x="214" y="66" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">3 AM</text>
          <text x="214" y="222" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">9 AM</text>
          <text x="66" y="222" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">3 PM</text>
          <text x="66" y="66" font-family="'DM Mono', monospace" font-size="7.5" font-weight="600" fill="rgba(122,104,86,0.7)" text-anchor="middle">9 PM</text>

          <!-- Annular Base Track -->
          <path d="M 140 38 A 102 102 0 1 1 139.9 38 L 139.9 76 A 64 64 0 1 0 140 76 Z" fill="rgba(38,27,20,0.035)"/>

          <!-- Dynamic Wedges -->
          <g id="timingClockWedges"></g>

          <!-- Dynamic Threshold Lines & Badges -->
          <g id="timingClockThresholds"></g>

          <!-- Center Hub (Machined Gauge Core) -->
          <circle cx="140" cy="140" r="49" fill="#FAF5ED" stroke="rgba(36,26,18,0.2)" stroke-width="1"/>
          <circle cx="140" cy="140" r="47" fill="none" stroke="#C0963F" stroke-width="1.6"/>
          <circle cx="140" cy="140" r="45" fill="url(#q3HubGrad)" stroke="#1B130D" stroke-width="1.5"/>
          <circle cx="140" cy="140" r="43" fill="none" stroke="rgba(192,150,63,0.35)" stroke-width="1" stroke-dasharray="2,2"/>
          <text id="timingClockHubVal" x="140" y="136" font-family="'Cormorant Garamond', Georgia, serif" font-size="20" font-weight="700" fill="#FAF5EE" text-anchor="middle">Daily Cycle</text>
          <text id="timingClockHubSub" x="140" y="153" font-family="'DM Mono', monospace" font-size="8" font-weight="600" fill="#C0963F" text-anchor="middle">Tap Timing Below</text>
        </svg>
      </div>

      <div class="aic-classification-box" style="margin-top:12px">
        <div class="aic-class-header">
          <span class="aic-class-tag" id="timingClassTag">Daily Pattern</span>
          <span class="aic-class-status" id="timingClassStatus">Select a timing below</span>
        </div>
        <div class="aic-milestone-text" id="timingClassMilestone">Select the timing pattern that best matches when your baby's crying reaches its highest intensity.</div>
      </div>
    `;
    box.appendChild(clockCard);
  }

  // Restore previously saved answer if parent used Back button
  const prevSaved = qHistory[qIndex];
  const prevMap = prevSaved ? prevSaved.selected : null;

  q.opts.forEach((o, i) => {
    const div = document.createElement('div');
    div.className = 'option' + (q.single ? ' opt-radio' : '');
    div.setAttribute('role', q.single ? 'radio' : 'checkbox');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');

    const visualHtml = o[8] ? `<div class="opt-visual">${o[8]}</div>` : '';
    div.innerHTML = `<span class="opt-check" id="chk${i}" aria-hidden="true"></span>${visualHtml}<span class="opt-text">${o[0]}</span>`;
    div.onclick = () => toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null, o[0]);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null, o[0]); } };
    box.appendChild(div);

    if (prevMap && prevMap.has(i)) {
      toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null, o[0], true);
    }
  });

  applyLogHint(qIndex);
}

function applyLogHint(i) {
  document.querySelectorAll('.log-hint').forEach((n) => n.remove());
  try {
    const s = JSON.parse(sessionStorage.getItem('cp_signals') || 'null');
    if (!s) return;
    const v = s[{ 2: 'q1', 5: 'q6', 6: 'q7', 7: 'q4' }[i]];
    if (v === undefined || v === null) return;
    const els = document.querySelectorAll('#optionsBox .option');
    (Array.isArray(v) ? v : [v]).forEach((ix) => { if (els[ix]) els[ix].click(); });
  } catch(e){}
}

/* ── OPTION SELECTION & MUTUAL EXCLUSIVITY ───────────────────────────── */
function toggleOption(idx, weights, el, single, feeding, triedTag, reason, oText, isRestoring = false) {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  const deselect = (node) => {
    node.classList.remove('selected');
    node.setAttribute('aria-checked', 'false');
    node.querySelector('.opt-check').textContent = '';
  };
  const select = (node) => {
    node.classList.add('selected');
    node.setAttribute('aria-checked', 'true');
    node.querySelector('.opt-check').textContent = '✓';
  };

  const wasSelected = selectedMap.has(idx);
  const isNoneOption = !!(weights && weights._isNone) || (oText && oText.toLowerCase().includes('none of these')) || (oText && oText.toLowerCase().includes('none yet'));

  if (isNoneOption) {
    document.querySelectorAll('#optionsBox .option').forEach(deselect);
    selectedMap.clear();
    if (!wasSelected) {
      selectedMap.set(idx, { weights, feeding, triedTag, reason, isNone: true });
      select(el);
    }
  } else {
    for (const [k, v] of selectedMap.entries()) {
      if (v.isNone) {
        selectedMap.delete(k);
        const noneEl = document.querySelectorAll('#optionsBox .option')[k];
        if (noneEl) deselect(noneEl);
      }
    }
    if (single) {
      document.querySelectorAll('#optionsBox .option').forEach(deselect);
      selectedMap.clear();
      if (!wasSelected) {
        selectedMap.set(idx, { weights, feeding, triedTag, reason });
        select(el);
      }
    } else {
      if (wasSelected) {
        selectedMap.delete(idx);
        deselect(el);
      } else {
        selectedMap.set(idx, { weights, feeding, triedTag, reason });
        select(el);
      }
    }
  }

  const q = QUESTIONS[qIndex];
  if (q && q.isTimingClock) {
    updateTimingClock(idx);
  }

  const btn = document.getElementById('continueBtn');
  if (selectedMap.size > 0) {
    btn.classList.add('visible');
    if (q && q.isTimingClock && TIMING_CLOCK_META[idx]) {
      btn.textContent = TIMING_CLOCK_META[idx].btnLabel;
    } else {
      btn.textContent = selectedMap.size === 1 ? 'Continue' : `Continue (${selectedMap.size} selected)`;
    }
    if (single && !wasSelected && !isRestoring && !(q && q.isTimingClock)) {
      autoAdvanceTimer = setTimeout(() => {
        advanceQ();
      }, 420);
    }
  } else {
    btn.classList.remove('visible');
  }
}

/* ── BACK BUTTON NAVIGATION ──────────────────────────────────────────── */
function prevQ() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }
  if (qIndex <= 0) {
    hide('quizScreen');
    show('redFlagScreen');
    return;
  }

  qIndex--;
  const prevSaved = qHistory[qIndex];
  if (prevSaved) {
    scores = { ...prevSaved.scores };
    feedingMethod = prevSaved.feedingMethod;
    triedItems = [...prevSaved.triedItems];
    cryingDuration = prevSaved.cryingDuration;
    typeReasons = JSON.parse(JSON.stringify(prevSaved.typeReasons));
  }

  const card = document.getElementById('quizScreen');
  card.style.opacity = '0';
  setTimeout(() => {
    renderQuestion();
    card.style.transition = 'none';
    card.style.opacity = '1';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity .2s ease';
    });
  }, 150);
}

/* ── FORWARD ADVANCEMENT ─────────────────────────────────────────────── */
function advanceQ() {
  if (autoAdvanceTimer) {
    clearTimeout(autoAdvanceTimer);
    autoAdvanceTimer = null;
  }

  const curQ = QUESTIONS[qIndex];
  if (curQ && curQ.isIntegerAge) {
    babyAgeWeeks = currentAgeWeeks;
  }

  qHistory[qIndex] = {
    selected: new Map(selectedMap),
    scores: { ...scores },
    feedingMethod,
    triedItems: [...triedItems],
    cryingDuration,
    typeReasons: JSON.parse(JSON.stringify(typeReasons))
  };

  selectedMap.forEach(sel => {
    Object.keys(sel.weights).forEach(k => {
      if (k !== '_isNone' && scores[k] !== undefined) {
        scores[k] += sel.weights[k];
      }
    });
    if (sel.feeding) feedingMethod = sel.feeding;
    if (sel.triedTag) triedItems.push(sel.triedTag);

    if (curQ && curQ.isDurationClock) {
      cryingDuration = sel.reason || '';
    }

    const text = sel.triedTag
      ? `You have already tried ${sel.triedTag} without a meaningful change.`
      : sel.reason;

    if (text) {
      Object.keys(sel.weights).forEach(k => {
        if (k !== '_isNone' && sel.weights[k] > 0 && typeReasons[k]) {
          typeReasons[k].push({ text, weight: sel.weights[k] });
        }
      });
    }
  });

  qIndex++;
  selectedMap.clear();

  const card = document.getElementById('quizScreen');
  card.style.opacity = '0';

  setTimeout(() => {
    if (qIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      hide('quizScreen');
      show('leadCaptureScreen');
      updateProgress(100);
      return;
    }
    card.style.transition = 'none';
    card.style.opacity = '1';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity .2s ease';
    });
  }, 150);
}

/* ── PRE-RESULT LEAD CAPTURE GATE ────────────────────────────────────── */
function backFromLeadGate() {
  hide('leadCaptureScreen');
  show('quizScreen');
  qIndex = QUESTIONS.length - 1;
  renderQuestion();
}

function submitLeadAndShowResult() {
  const nameEl = document.getElementById('nameInput');
  const emailEl = document.getElementById('emailInput');
  const consentEl = document.getElementById('consentCheck');
  const hpEl = document.getElementById('hpField');
  const babyNameEl = document.getElementById('babyNameInput');

  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const babyVal = babyNameEl ? babyNameEl.value.trim().slice(0, 40) : '';
  const honeypot = hpEl ? hpEl.value : '';

  if (!name) return shake('nameInput', 'Please enter your first name');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return shake('emailInput', 'Please enter a valid email address');
  if (consentEl && !consentEl.checked) {
    const row = consentEl.closest('.consent-row');
    if (row) {
      row.style.outline = '1.5px solid #BA5731';
      setTimeout(() => { row.style.outline = ''; }, 2000);
    }
    consentEl.focus();
    return;
  }

  userName = name;
  userEmail = email;
  babyName = babyVal;
  userConsent = true;

  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];

  if (honeypot || (Date.now() - quizStartedAt) < 1500) {
    suppressSubscribe = true;
  } else {
    subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed');
  }

  hide('leadCaptureScreen');
  showAnalysis();
}

function showAnalysis() {
  show('analysisScreen');
  setTimeout(() => {
    hide('analysisScreen');
    showResult();
  }, 2200);
}

/* ── PRIMARY TYPE CALCULATION (ZERO-SAFE) ────────────────────────────── */
function getPrimaryType(s) {
  const total = (s.GUT || 0) + (s.NS || 0) + (s.FM || 0);
  if (total === 0) {
    return 'MIXED'; // Zero-safe fallback: never default to GUT with 0 confidence
  }
  let best = 'NS', bestVal = -1;
  ['NS', 'FM', 'GUT'].forEach(k => {
    if (s[k] > bestVal) { bestVal = s[k]; best = k; }
  });
  return best;
}

function getConfidencePct() {
  const total = scores.GUT + scores.NS + scores.FM;
  if (total === 0) return 0;
  const dominant = Math.max(scores.GUT, scores.NS, scores.FM);
  return Math.round((dominant / total) * 100);
}

/* ── RESULT SCREEN DISPLAY ───────────────────────────────────────────── */
function showResult() {
  hide('analysisScreen');

  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];

  subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed');
  sendEvent('quiz_complete', { colic_type: R.apiType });

  try {
    localStorage.setItem('colic_type', type);
    localStorage.setItem('colic_name', userName);
    localStorage.setItem('colic_aid', ASSESSMENT_ID);
    localStorage.setItem('colic_email', userEmail);
  } catch(e){}

  const banner = document.getElementById('resultBanner');
  banner.className = `result-banner ${R.bannerClass}`;
  document.getElementById('resultBadge').innerHTML = `${R.emoji} &nbsp;${R.subtitle}`;
  document.getElementById('resultTitle').textContent = R.type;
  document.getElementById('resultPrevalence').textContent = R.tagline;

  document.getElementById('profileNarrative').innerHTML = buildProfileNarrative();
  document.getElementById('profAssessmentId').textContent = ASSESSMENT_ID;
  document.getElementById('dmMessageBox').textContent = buildDMMessage(R);

  document.getElementById('redFlagBox').innerHTML =
    `<b>Call a doctor first if you see any of these.</b> ${RED_FLAG} ${OVERWHELMED}`;

  const closestFitContainer = document.getElementById('closestFitVisualCard');
  if (closestFitContainer) {
    closestFitContainer.innerHTML = getClosestFitVisualHtml(type);
  }

  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));

  document.getElementById('resultSeeing').textContent   = R.seeing;
  document.getElementById('resultWhy').textContent      = R.why;
  document.getElementById('resultRulesOut').textContent = R.rulesOut;
  document.getElementById('resultMonitor').textContent  = R.monitor;

  renderScorePanel(scores, type);
  document.getElementById('answerAudit').innerHTML = buildAnswerAudit(type);
  renderQuickAction(type);
  document.getElementById('reframeBlock').innerHTML = buildReframeLine(type, userName);
  renderPrevalenceBar(type);
  document.getElementById('angleStrip').innerHTML = buildAngleStrip(type);
  renderGuaranteeCard(type, userName);

  const triedLine = buildTriedFailureLine(type);
  const triedEl = document.getElementById('triedLine');
  if (triedLine) { triedEl.innerHTML = triedLine; triedEl.style.display = ''; }
  else { triedEl.style.display = 'none'; }

  const stepList = typeof R.steps === 'function' ? R.steps(feedingMethod) : R.steps;
  const sBox = document.getElementById('resultSteps');
  sBox.innerHTML = '';
  stepList.forEach((s, i) => {
    sBox.innerHTML += `<div class="step-card"><div class="step-num ${R.stepClass}">${i+1}</div><div><div class="step-title">${s.title}</div><div class="step-body">${s.body}</div><div class="step-ev">Evidence: ${s.ev}</div></div></div>`;
  });

  document.getElementById('resultBridge').textContent = R.bridgeLine(userName);
  const stickyType = document.getElementById('stickyType');
  if (stickyType) stickyType.textContent = R.type;

  document.getElementById('offerForBaby').textContent   = R.forBaby;
  document.getElementById('offerWhyFailed').textContent = R.whyTipsFailed;
  document.getElementById('offerDifferent').textContent = R.whatsDifferent;
  document.getElementById('offerTrust').textContent     = R.trustVincent;
  document.getElementById('offerEvidence').textContent  = R.evidence(feedingMethod);
  document.getElementById('ctaBtnText').textContent     = R.ctaBtnText;

  const pBox = document.getElementById('protocolList');
  pBox.innerHTML = '';
  R.protocol.forEach(item => {
    pBox.innerHTML += `<li><span class="check" aria-hidden="true">&#10003;</span>${item}</li>`;
  });

  // Render on-site step-by-step guides and video spotlights
  renderBlogAndVideoGuides(type, feedingMethod);

  paintCount();
  resultShown = true;
  show('resultScreen');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ── CLOSEST FIT PHYSIOLOGICAL VISUAL ARCHITECTURE (PEDIATRIC RADIOGRAPHIC SCAN) ── */
function getClosestFitVisualHtml(type) {
  let badge = '';
  let title = '';
  let sub = '';
  let mechanismTag = '';
  let mechanismText = '';
  let patternSpecificSvg = '';
  let callouts = '';

  if (type === 'NS') {
    badge = 'AUTONOMIC & SENSORY AXIS';
    title = 'How Sensory Overload & Autonomic Arousal Trigger Evening Clusters';
    sub = 'Radiographic projection of developing sensory cortex, vagus pathway, and cardiac regulation.';
    mechanismTag = 'NEURAL-CARDIAC FEEDBACK ARCHITECTURE';
    mechanismText = 'In young infants, sensory fatigue in the developing cerebral cortex triggers autonomic acceleration, elevating cardiac arousal and crying distress. Steady rhythmic vestibular input and low lighting activate the vagus nerve pathway to slow the cardiac cycle and restore baseline calm.';

    patternSpecificSvg = `
      <!-- Brain: Developing Cerebral Sensory Cortex with Neural Arborization -->
      <g id="brainCortex">
        <path d="M 128 44 C 145 42, 166 50, 172 64 C 178 74, 172 84, 164 88 C 154 94, 138 92, 130 84 Z" 
              fill="rgba(108,135,89,0.22)" stroke="#6C8759" stroke-width="1.6"/>
        <circle cx="144" cy="54" r="3.2" fill="#6C8759" stroke="#A4C290" stroke-width="1"/>
        <circle cx="160" cy="58" r="2.8" fill="#C0963F" stroke="#E6CE94" stroke-width="1"/>
        <circle cx="152" cy="72" r="3.2" fill="#6C8759" stroke="#A4C290" stroke-width="1"/>
        <circle cx="136" cy="68" r="2.5" fill="#6C8759"/>
        <line x1="144" y1="54" x2="160" y2="58" stroke="#6C8759" stroke-width="1.2" stroke-dasharray="2,2"/>
        <line x1="144" y1="54" x2="152" y2="72" stroke="#6C8759" stroke-width="1.2"/>
        <line x1="160" y1="58" x2="152" y2="72" stroke="#C0963F" stroke-width="1.2"/>
        <line x1="136" y1="68" x2="144" y2="54" stroke="#6C8759" stroke-width="1"/>
        <!-- Sensory Input Wavelets -->
        <path d="M 186 64 C 180 66, 176 72, 170 70" fill="none" stroke="#C0963F" stroke-width="1.8" stroke-linecap="round"/>
        <path d="M 190 70 C 184 72, 180 78, 174 76" fill="none" stroke="#C0963F" stroke-width="1.8" stroke-linecap="round"/>
      </g>

      <!-- Vagus Nerve Trunk (Cranial Nerve X) -->
      <path d="M 136 92 Q 134 114, 132 138 T 130 185" fill="none" stroke="#6C8759" stroke-width="2.4" stroke-linecap="round"/>
      <path d="M 133 134 Q 138 140, 144 146" fill="none" stroke="#6C8759" stroke-width="1.6" stroke-dasharray="2,2"/>
      <path d="M 132 144 Q 137 148, 143 152" fill="none" stroke="#6C8759" stroke-width="1.6" stroke-dasharray="2,2"/>
    `;

    callouts = `
      <!-- Callout 1: Sensory Cortex -->
      <line x1="156" y1="52" x2="224" y2="38" stroke="rgba(175,205,230,0.65)" stroke-width="1.2"/>
      <circle cx="224" cy="38" r="2.8" fill="#6C8759" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="36" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E4EBDC">Sensory Cortex</text>
      <text x="231" y="47" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Neural Arousal Threshold</text>

      <!-- Callout 2: Vagus Nerve Trunk -->
      <line x1="132" y1="118" x2="48" y2="108" stroke="rgba(175,205,230,0.65)" stroke-width="1.2"/>
      <circle cx="48" cy="108" r="2.8" fill="#6C8759" stroke="#FAF5EE" stroke-width="1"/>
      <text x="42" y="106" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E4EBDC" text-anchor="end">Vagus Nerve Axis</text>
      <text x="42" y="117" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77" text-anchor="end">Cranial Nerve X Calming</text>

      <!-- Callout 3: Cardiac Mediastinum / Pulsating Heart -->
      <line x1="158" y1="151" x2="224" y2="151" stroke="rgba(230,57,70,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="151" r="2.8" fill="#E63946" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="149" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E63946">Cardiac Rhythm</text>
      <text x="231" y="160" font-family="'DM Mono', monospace" font-size="7.5" fill="rgba(230,57,70,0.85)">Pulsating Heart (78 BPM)</text>

      <!-- Callout 4: Enteric Gut Loop -->
      <line x1="146" y1="192" x2="224" y2="204" stroke="rgba(175,205,230,0.65)" stroke-width="1.2"/>
      <circle cx="224" cy="204" r="2.8" fill="#BC5A33" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="202" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#F3E1D4">Enteric Gut Loop</text>
      <text x="231" y="213" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Microbiome Transit Axis</text>
    `;
  } else if (type === 'GUT') {
    badge = 'ENTERIC & MICROBIOME AXIS';
    title = 'How Digestive Gas & Enteric Spasms Trigger Wave-Like Distress';
    sub = 'Radiographic projection of gastric distension, enteric transit, and visceral feedback.';
    mechanismTag = 'GASTRO-AUTONOMIC FEEDBACK ARCHITECTURE';
    mechanismText = 'Immature intestinal microbiota produces transient fermentation gas that distends the delicate infant bowel walls. Smooth-muscle spasms send visceral discomfort signals along the enteric-vagal axis, causing sudden legs-tucked crying episodes independent of feeding times.';

    patternSpecificSvg = `
      <!-- Stomach & Intestinal Highlighting -->
      <path d="M 132 174 C 128 182, 132 195, 144 196 C 152 197, 156 188, 152 179 C 147 172, 137 171, 132 174 Z" 
            fill="rgba(188,90,51,0.3)" stroke="#BC5A33" stroke-width="2"/>
      <circle cx="140" cy="182" r="3" fill="#FFF" opacity="0.6"/>
      <circle cx="146" cy="188" r="2" fill="#FFF" opacity="0.6"/>

      <!-- Distended Intestinal Loops -->
      <path d="M 134 198 C 142 203, 148 200, 146 208 C 142 216, 132 212, 138 222 C 144 228, 152 221, 149 214" 
            fill="none" stroke="#BC5A33" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="141" cy="205" r="2.5" fill="#FFF" opacity="0.5"/>
      <circle cx="145" cy="216" r="2" fill="#FFF" opacity="0.5"/>

      <!-- Vagus Gut-Brain Axis -->
      <path d="M 136 92 Q 134 114, 132 138 T 130 185" fill="none" stroke="#6C8759" stroke-width="1.8" stroke-dasharray="2,2"/>
    `;

    callouts = `
      <line x1="148" y1="184" x2="224" y2="184" stroke="rgba(188,90,51,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="184" r="2.8" fill="#BC5A33" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="182" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#F3E1D4">Gastric Distension</text>
      <text x="231" y="193" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Fermentation Gas Volume</text>

      <line x1="144" y1="214" x2="224" y2="218" stroke="rgba(188,90,51,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="218" r="2.8" fill="#BC5A33" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="216" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#F3E1D4">Enteric Spasm Loop</text>
      <text x="231" y="227" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Smooth Muscle Contraction</text>

      <line x1="158" y1="151" x2="224" y2="140" stroke="rgba(230,57,70,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="140" r="2.8" fill="#E63946" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="138" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E63946">Cardiac Rhythm</text>
      <text x="231" y="149" font-family="'DM Mono', monospace" font-size="7.5" fill="rgba(230,57,70,0.85)">Pulsating Heart (78 BPM)</text>

      <line x1="132" y1="118" x2="48" y2="108" stroke="rgba(175,205,230,0.65)" stroke-width="1.2"/>
      <circle cx="48" cy="108" r="2.8" fill="#6C8759" stroke="#FAF5EE" stroke-width="1"/>
      <text x="42" y="106" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E4EBDC" text-anchor="end">Gut-Brain Vagal Axis</text>
      <text x="42" y="117" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77" text-anchor="end">Visceral Arousal Feedback</text>
    `;
  } else if (type === 'FM') {
    badge = 'ORAL-GASTRIC MOTOR AXIS';
    title = 'How Aerophagia & Fluid Dynamics Drive Post-Feed Discomfort';
    sub = 'Radiographic projection of swallow mechanics, esophageal transit, and gastric distension.';
    mechanismTag = 'SWALLOW-AEROPHAGIA ARCHITECTURE';
    mechanismText = 'A shallow latch, high milk flow velocity, or bottle angle mismatch allows micro-air swallows (aerophagia) during feeding. As the gastric fundus distends rapidly, tension on the cardiac sphincter triggers acute post-feed distress within 20 minutes of finishing a feed.';

    patternSpecificSvg = `
      <!-- Oral Cavity & Pharynx -->
      <path d="M 172 108 C 165 110, 155 114, 148 118" fill="none" stroke="#C0963F" stroke-width="2.4" stroke-linecap="round"/>
      <circle cx="166" cy="110" r="2.5" fill="#FFF" opacity="0.7"/>

      <!-- Esophagus Transit Tube -->
      <path d="M 144 122 C 140 134, 138 152, 136 170" fill="none" stroke="#C0963F" stroke-width="2.2" stroke-linecap="round"/>

      <!-- Gastric Aerophagia Air Bubble in Fundus -->
      <path d="M 132 174 C 128 182, 132 195, 144 196 C 152 197, 156 188, 152 179 C 147 172, 137 171, 132 174 Z" 
            fill="rgba(192,150,63,0.3)" stroke="#C0963F" stroke-width="2"/>
      <ellipse cx="142" cy="180" rx="6" ry="4" fill="#FFF" opacity="0.65"/>
      <ellipse cx="144" cy="189" rx="4" ry="3" fill="#FFF" opacity="0.45"/>
    `;

    callouts = `
      <line x1="168" y1="108" x2="224" y2="85" stroke="rgba(192,150,63,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="85" r="2.8" fill="#C0963F" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="83" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#EEDFB9">Pharyngeal Latch Tract</text>
      <text x="231" y="94" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Fluid Flow Velocity</text>

      <line x1="142" y1="180" x2="224" y2="180" stroke="rgba(192,150,63,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="180" r="2.8" fill="#C0963F" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="178" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#EEDFB9">Gastric Aerophagia</text>
      <text x="231" y="189" font-family="'DM Mono', monospace" font-size="7.5" fill="#9C8C77">Entrained Air Bubble</text>

      <line x1="158" y1="151" x2="224" y2="140" stroke="rgba(230,57,70,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="140" r="2.8" fill="#E63946" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="138" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E63946">Cardiac Rhythm</text>
      <text x="231" y="149" font-family="'DM Mono', monospace" font-size="7.5" fill="rgba(230,57,70,0.85)">Pulsating Heart (78 BPM)</text>
    `;
  } else {
    badge = 'MULTISYSTEM DEVELOPMENTAL AXIS';
    title = 'How Feeding, Digestion, and Sensory Input Interact Across the Day';
    sub = 'Radiographic overview of sensory accumulation, gut transit, and autonomic regulation.';
    mechanismTag = 'INTEGRATED MULTISYSTEM ARCHITECTURE';
    mechanismText = 'When multiple signs appear simultaneously, evening sensory fatigue interacts with digestive transit and feeding pace. A structured 3-step sequence addresses feeding mechanics first, then winding, and finally evening sensory dimming.';

    patternSpecificSvg = `
      <g id="brainCortex">
        <path d="M 128 44 C 145 42, 166 50, 172 64 C 178 74, 172 84, 164 88 C 154 94, 138 92, 130 84 Z" 
              fill="rgba(108,135,89,0.18)" stroke="#6C8759" stroke-width="1.4"/>
      </g>
      <path d="M 136 92 Q 134 114, 132 138 T 130 185" fill="none" stroke="#6C8759" stroke-width="1.8"/>
      <path d="M 132 174 C 128 182, 132 195, 144 196 C 152 197, 156 188, 152 179 C 147 172, 137 171, 132 174 Z" 
            fill="rgba(188,90,51,0.2)" stroke="#BC5A33" stroke-width="1.6"/>
    `;

    callouts = `
      <line x1="156" y1="52" x2="224" y2="45" stroke="rgba(175,205,230,0.65)" stroke-width="1.2"/>
      <circle cx="224" cy="45" r="2.8" fill="#6C8759" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="43" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E4EBDC">Sensory Cortex</text>

      <line x1="158" y1="151" x2="224" y2="140" stroke="rgba(230,57,70,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="140" r="2.8" fill="#E63946" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="138" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#E63946">Cardiac Rhythm</text>

      <line x1="146" y1="184" x2="224" y2="195" stroke="rgba(188,90,51,0.7)" stroke-width="1.2"/>
      <circle cx="224" cy="195" r="2.8" fill="#BC5A33" stroke="#FAF5EE" stroke-width="1"/>
      <text x="231" y="193" font-family="'DM Sans', sans-serif" font-size="9.5" font-weight="700" fill="#F3E1D4">Enteric Gut</text>
    `;
  }

  return `
    <div style="background:#090E13;border-radius:18px;border:1px solid #1C2733;padding:16px;box-shadow:0 14px 40px rgba(0,0,0,0.35);position:relative;overflow:hidden;margin:18px 0">
      <!-- Radiograph Header Scan Metadata -->
      <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(175,205,230,0.12);padding-bottom:8px;margin-bottom:12px;font-family:'DM Mono',monospace;font-size:8px;color:rgba(175,205,230,0.6);letter-spacing:0.08em;text-transform:uppercase">
        <span>MODALITY: DIGITAL RADIOGRAPHIC PROJECTION</span>
        <span style="color:#6C8759">FOV: 240mm &bull; 78 BPM RHYTHM</span>
        <span>LATERAL PROFILE (SAGITTAL)</span>
      </div>

      <div style="position:relative;width:100%;display:flex;justify-content:center">
        <svg viewBox="-85 0 440 270" style="width:100%;max-width:410px;height:auto;display:block">
          <defs>
            <radialGradient id="xrayGlow" cx="40%" cy="45%" r="60%">
              <stop offset="0%" stop-color="#142230" stop-opacity="0.9"/>
              <stop offset="60%" stop-color="#0E1620" stop-opacity="0.7"/>
              <stop offset="100%" stop-color="#080C10" stop-opacity="0.95"/>
            </radialGradient>
            <pattern id="xrayGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(140,180,210,0.04)" stroke-width="0.8"/>
            </pattern>
          </defs>

          <style>
            @keyframes heartPulseGlow {
              0%, 100% { opacity: 0.25; }
              20% { opacity: 0.95; }
              40% { opacity: 0.35; }
              60% { opacity: 0.85; }
              80% { opacity: 0.25; }
            }
            @keyframes cardiacWave {
              0%, 100% { opacity: 0.15; }
              20% { opacity: 0.9; }
              40% { opacity: 0.25; }
              60% { opacity: 0.75; }
              80% { opacity: 0.15; }
            }
            .heart-glow-ring {
              animation: heartPulseGlow 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
            .cardiac-pulse-circle {
              animation: cardiacWave 1.25s cubic-bezier(0.4, 0, 0.2, 1) infinite;
            }
          </style>

          <!-- Film Screen Background with Medical Calibration Grid -->
          <rect x="-80" y="4" width="430" height="262" rx="14" fill="url(#xrayGlow)"/>
          <rect x="-80" y="4" width="430" height="262" rx="14" fill="url(#xrayGrid)"/>

          <!-- Calibration Crosshairs & Corner Scales -->
          <path d="M -72 18 L -66 18 M -72 18 L -72 24" stroke="rgba(175,205,230,0.3)" stroke-width="1"/>
          <path d="M 342 18 L 336 18 M 342 18 L 342 24" stroke="rgba(175,205,230,0.3)" stroke-width="1"/>
          <path d="M -72 258 L -66 258 M -72 258 L -72 252" stroke="rgba(175,205,230,0.3)" stroke-width="1"/>
          <path d="M 342 258 L 336 258 M 342 258 L 342 252" stroke="rgba(175,205,230,0.3)" stroke-width="1"/>

          <!-- 1. SOFT TISSUE RADIOGRAPHIC CONTOUR (Infant Profile in True Lateral Perspective) -->
          <path d="M 122 36 
                   C 142 36, 172 44, 185 64 
                   C 192 75, 194 88, 184 98 
                   C 182 100, 180 102, 178 102 
                   L 182 108 
                   C 184 110, 182 113, 178 114
                   L 175 116
                   C 178 118, 177 122, 173 124
                   C 168 126, 162 126, 158 132
                   C 154 138, 156 150, 158 165
                   C 162 188, 160 215, 152 232
                   C 146 244, 126 248, 114 242
                   C 102 236, 100 220, 102 195
                   C 104 165, 102 135, 104 105
                   C 106 72, 110 36, 122 36 Z" 
                fill="rgba(225,240,255,0.025)" stroke="rgba(175,205,230,0.22)" stroke-width="1.2"/>

          <!-- 2. RADIOPAQUE SKELETAL SYSTEM -->
          <!-- Cranial Vault (Frontal, Parietal, Occipital Bones with Fontanelles) -->
          <path d="M 125 40 
                   C 144 40, 168 48, 178 66 
                   C 184 76, 182 88, 174 94 
                   C 164 100, 142 100, 130 92 
                   C 120 84, 115 62, 125 40 Z" 
                fill="none" stroke="rgba(225,242,255,0.7)" stroke-width="1.8"/>

          <!-- Coronal & Lambdoid Sutures -->
          <path d="M 148 42 C 150 54, 147 68, 144 78" fill="none" stroke="rgba(175,205,230,0.4)" stroke-width="0.9" stroke-dasharray="2,2"/>
          <path d="M 130 46 C 126 58, 124 72, 126 84" fill="none" stroke="rgba(175,205,230,0.35)" stroke-width="0.9" stroke-dasharray="2,2"/>
          <!-- Anterior Fontanelle Notch -->
          <ellipse cx="150" cy="42" rx="4" ry="2.2" fill="rgba(108,135,89,0.2)" stroke="rgba(175,205,230,0.5)" stroke-width="1"/>

          <!-- Facial Bones & Mandible (Jawbone) -->
          <path d="M 172 96 C 176 102, 174 108, 168 112 C 160 116, 148 116, 142 108" fill="none" stroke="rgba(225,242,255,0.6)" stroke-width="1.4"/>
          <circle cx="166" cy="80" r="5.5" fill="none" stroke="rgba(175,205,230,0.3)" stroke-width="1"/>

          <!-- Cervical Spine (C1-C7 Stacked Vertebral Bodies) -->
          <g id="cervicalSpine">
            <rect x="126" y="98" width="8" height="4.2" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="125" y="104" width="8.5" height="4.2" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="124" y="110" width="9" height="4.2" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="123" y="116" width="9.5" height="4.2" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="122" y="122" width="10" height="4.2" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
          </g>

          <!-- Thoracic & Lumbar Spine (T1-T12, Gentle Infant C-Curve) -->
          <g id="thoracolumbarSpine">
            <rect x="121" y="128" width="10" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="120" y="135" width="10.5" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="119" y="142" width="11" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="118" y="149" width="11" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="117" y="156" width="11" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="117" y="163" width="11" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="118" y="170" width="11.5" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="119" y="177" width="12" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="121" y="184" width="12" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="123" y="191" width="12.5" height="4.5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
            <rect x="126" y="198" width="12.5" height="5" rx="1.5" fill="rgba(225,242,255,0.25)" stroke="rgba(225,242,255,0.7)" stroke-width="1"/>
          </g>

          <!-- Clavicle (Collarbone) -->
          <path d="M 132 126 Q 142 124, 154 128" fill="none" stroke="rgba(225,242,255,0.75)" stroke-width="1.8" stroke-linecap="round"/>

          <!-- Rib Cage (Curved Translucent Pediatric Rib Pairs) -->
          <g id="ribCage" stroke="rgba(225,242,255,0.5)" stroke-width="1.3" fill="none" stroke-linecap="round">
            <path d="M 128 132 C 138 131, 150 134, 155 138"/>
            <path d="M 127 138 C 139 137, 152 141, 157 146"/>
            <path d="M 126 144 C 139 143, 153 148, 158 154"/>
            <path d="M 125 151 C 139 150, 153 155, 157 162"/>
            <path d="M 124 158 C 138 157, 152 163, 155 170"/>
            <path d="M 124 165 C 136 165, 148 171, 152 178"/>
            <path d="M 125 172 C 135 172, 144 178, 147 185"/>
          </g>

          <!-- Diaphragm Dome -->
          <path d="M 124 168 Q 140 165, 154 172" fill="none" stroke="rgba(175,205,230,0.5)" stroke-width="1.4" stroke-dasharray="4,2"/>

          <!-- Pattern Specific Anatomy Layer -->
          ${patternSpecificSvg}

          <!-- 3. THE BRIGHT RED PULSATING HEART (Cardiac Mediastinum Focal Point) -->
          <!-- Cardiac shockwave & pulse rings (Strictly opacity animation - Rule 9) -->
          <circle cx="147" cy="151" r="19" fill="none" stroke="#E63946" stroke-width="1.2" class="cardiac-pulse-circle"/>
          <circle cx="147" cy="151" r="15" fill="#E63946" class="heart-glow-ring"/>

          <!-- Anatomical Cardiac Silhouette (Ventricles + Ascending Aorta Arch) -->
          <path d="M 145 142 Q 145 134, 149 132 T 153 140" fill="none" stroke="#C9182B" stroke-width="2" stroke-linecap="round"/>
          <line x1="147" y1="133" x2="147" y2="128" stroke="#C9182B" stroke-width="1.2"/>
          <line x1="150" y1="133" x2="152" y2="129" stroke="#C9182B" stroke-width="1.2"/>

          <g transform="translate(147, 151)">
            <path d="M 0 9 C -7 3, -11 -3, -11 -9 A 6 6 0 0 1 0 -7 A 6 6 0 0 1 11 -9 C 11 -3, 7 3, 0 9 Z" 
                  fill="#E63946" stroke="#C9182B" stroke-width="1.4"/>
            <circle cx="-3.5" cy="-6" r="1.6" fill="#FFF" opacity="0.8"/>
          </g>

          <!-- 4. CLINICAL CALLOUT ANNOTATIONS -->
          ${callouts}
        </svg>
      </div>

      <!-- Radiographic Interpretation Strip -->
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(175,205,230,0.12);border-radius:10px;padding:10px 14px;margin-top:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-family:'DM Mono',monospace;font-size:9px;font-weight:700;color:#6C8759;letter-spacing:0.08em;text-transform:uppercase">${mechanismTag}</span>
          <span style="font-family:'DM Mono',monospace;font-size:8px;color:rgba(175,205,230,0.5)">LATERAL RADIOGRAPHIC VIEW</span>
        </div>
        <p style="font-family:'DM Sans',sans-serif;font-size:12px;color:rgba(250,244,236,0.82);line-height:1.5;margin:0">
          ${mechanismText}
        </p>
      </div>
    </div>
  `;
}

/* ── BLOG GUIDES & PROVEN MARKETING VIDEO SPOTLIGHTS ── */
function renderBlogAndVideoGuides(type, feedMethod) {
  const guideGrid = document.getElementById('guideCardGrid');
  if (!guideGrid) return;
  guideGrid.innerHTML = '';

  const blogGuides = {
    paced_bottle: {
      url: "/blog/paced-bottle-feeding-technique.html",
      tag: "Feeding Mechanics · Bottle",
      title: "Paced Bottle Feeding: The Exact Angle and Flow Control",
      summary: "How holding the bottle horizontal allows your baby to control swallow speed, preventing air gulping."
    },
    flipple_latch: {
      url: "/blog/breastfeeding-latch-technique.html",
      tag: "Feeding Mechanics · Breast",
      title: "The Flipple Technique for a Deep Latch",
      summary: "Step-by-step positioning for an asymmetric latch that supports an airtight seal and comfortable feeding."
    },
    tiger_hold: {
      url: "/blog/tiger-hold-guide.html",
      tag: "Physical Soothing · Technique",
      title: "How to Do the Upright Forearm Hold for Comfort",
      summary: "Tummy-down forearm carrying that uses gentle upward palm support to soothe physical discomfort."
    },
    gentle_burping: {
      url: "/blog/gentle-burping-techniques.html",
      tag: "Winding · Decompression",
      title: "Gentle Burping & Upright Winding Positions",
      summary: "Rotational and forward-lean positions that help release wind without jarring or forceful back patting."
    },
    gripe_vs_drops: {
      url: "/blog/gripe-water-vs-gas-drops.html",
      tag: "Remedies · Evidence",
      title: "Gripe Water vs Gas Drops: What the Evidence Shows",
      summary: "Examining clinical trial findings on simethicone and herbal water compared to placebo."
    },
    witching_room: {
      url: "/blog/witching-hour-room-setup.html",
      tag: "Nervous System · Environment",
      title: "The Evening Room Setup: Lowering Sensory Stimulation",
      summary: "Dim lighting, quiet steady sound across the room, and removing visual stimulation before evening fussiness."
    },
    l_reuteri: {
      url: "/blog/l-reuteri-evidence.html",
      tag: "Gut Microbiome · Evidence",
      title: "L. Reuteri DSM 17938: What the Clinical Trials Show",
      summary: "Examining the Savino 2010 breastfed trial and Sung 2014 null results. Talk to your pediatrician before starting any supplement."
    }
  };

  function addGuideCard(g) {
    if (!g) return;
    const a = document.createElement('a');
    a.href = g.url;
    a.className = 'guide-card';
    a.innerHTML = `
      <div class="guide-tag">${g.tag}</div>
      <div class="guide-title">${g.title}</div>
      <div class="guide-summary">${g.summary}</div>
      <div class="guide-cta">Read step-by-step technique guide &rarr;</div>
    `;
    guideGrid.appendChild(a);
  }

  const vsTitle = document.getElementById('vsTitle');
  const vsDesc = document.getElementById('vsDesc');
  const vsLinkBtn = document.getElementById('vsLinkBtn');
  const isBreast = (feedMethod || '').toLowerCase().includes('breast');

  if (type === 'FM') {
    if (isBreast) {
      addGuideCard(blogGuides.flipple_latch);
      addGuideCard(blogGuides.gentle_burping);
      if (vsTitle) vsTitle.textContent = "Technique Video: Deep Latch Alignment";
      if (vsDesc) vsDesc.textContent = "Demonstration of breast positioning to prevent air gaps and clicking swallows during feeds.";
    } else {
      addGuideCard(blogGuides.paced_bottle);
      addGuideCard(blogGuides.gentle_burping);
      if (vsTitle) vsTitle.textContent = "Technique Video: Horizontal Paced Bottle Feeding";
      if (vsDesc) vsDesc.textContent = "Holding the bottle nearly horizontal so milk covers the nipple opening without gravity forcing excess flow.";
    }
    if (vsLinkBtn) {
      vsLinkBtn.href = "https://instagram.com/colicprotocol";
      vsLinkBtn.textContent = "Watch Demonstration on Instagram &rarr;";
    }
  } else if (type === 'GUT') {
    addGuideCard(blogGuides.gentle_burping);
    addGuideCard(blogGuides.tiger_hold);
    if (isBreast) addGuideCard(blogGuides.l_reuteri);
    else addGuideCard(blogGuides.gripe_vs_drops);

    if (vsTitle) vsTitle.textContent = "Technique Video: Gentle Upright Winding";
    if (vsDesc) vsDesc.textContent = "How upward spine posture and gentle torso rotation help release wind without hard back slapping.";
    if (vsLinkBtn) {
      vsLinkBtn.href = "https://instagram.com/colicprotocol";
      vsLinkBtn.textContent = "Watch Demonstration on Instagram &rarr;";
    }
  } else {
    // NS or MIXED
    addGuideCard(blogGuides.witching_room);
    addGuideCard(blogGuides.tiger_hold);

    if (vsTitle) vsTitle.textContent = "Technique Video: Upright Forearm Soothing Hold";
    if (vsDesc) vsDesc.textContent = "Demonstration of steady forearm support, dim lighting, and continuous calming rhythm during evening clusters.";
    if (vsLinkBtn) {
      vsLinkBtn.href = "https://instagram.com/colicprotocol";
      vsLinkBtn.textContent = "Watch Demonstration on Instagram &rarr;";
    }
  }
}

/* ── SCORE PANEL & AUDIT ─────────────────────────────────────────────── */
function renderScorePanel(s, primaryType) {
  const total = s.GUT + s.NS + s.FM;
  const pctOf = k => total > 0 ? Math.round((s[k] / total) * 100) : 33;
  const order = ['NS', 'FM', 'GUT'].slice().sort((a, b) => (s[b] || 0) - (s[a] || 0));

  const rows = order.map(k => {
    const isPrimary = k === primaryType;
    return `
      <div class="score-row${isPrimary ? '' : ' is-secondary'}">
        <div class="score-row-head">
          <div class="score-name">${RESULTS[k].type}${isPrimary ? '<span class="primary-tag">Closest fit</span>' : ''}</div>
          <div class="score-val">${pctOf(k)}%</div>
        </div>
        <div class="score-track"><div class="score-fill" style="width: ${pctOf(k)}%;"></div></div>
      </div>`;
  }).join('');

  const container = document.getElementById('scorePanel');
  if (container) {
    container.innerHTML = `
      <div class="score-panel-title">Score breakdown across the three patterns</div>
      ${rows}
    `;
  }
}

function buildAnswerAudit(type) {
  const reasons = typeReasons[type] || [];
  const lines = [];
  const seen = new Set();
  reasons.slice().sort((a, b) => b.weight - a.weight).forEach(r => {
    if (lines.length >= 6) return;
    if (seen.has(r.text)) return;
    seen.add(r.text);
    lines.push(r.text);
  });
  if (lines.length === 0) {
    lines.push("Your answers reflect a combination of early developmental adjustments across digestion and settling.");
  }
  const items = lines.map(l => `<li>${l}</li>`).join('');
  return `
    <div class="audit-title">Why your answers point toward this pattern</div>
    <ul class="audit-list">${items}</ul>
    <p class="audit-close">Those answers are what moved your result toward this starting point.</p>
  `;
}

function renderQuickAction(type) {
  const el = document.getElementById('quickAction');
  if (!el) return;
  const R = RESULTS[type] || RESULTS['MIXED'];
  el.innerHTML = `
    <div class="qa-eyebrow">First Recommended Adjustment</div>
    <div class="qa-text">${R.primaryAction || R.subtitle}</div>
  `;
}

function buildProfileNarrative() {
  const name = babyName || 'your baby';
  const age = classifyAge(babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks).range;
  return `Based on the answers provided for ${name} (${age}), here is your customized starting-point pattern evaluation.`;
}

function buildReframeLine(type, name) {
  const R = RESULTS[type] || RESULTS['MIXED'];
  return `<p class="reframe-text">Remember: Colic usually peaks around week 6 and eases by about 3 to 4 months. ${R.tagline}</p>`;
}

function renderPrevalenceBar(type) {
  const el = document.getElementById('prevalenceBox');
  if (!el) return;
  const prev = PREVALENCE[type] || 33;
  el.innerHTML = `<div class="prevalence-note">About <strong>${prev} in 100</strong> parents completing this assessment land on this pattern.</div>`;
}

function buildAngleStrip(type) {
  const a = (RESULTS[type] || RESULTS['MIXED']).angles;
  return `
    <div class="angle-row"><div class="angle-tag">Solution</div><div class="angle-text">${a.solution}</div></div>
    <div class="angle-row"><div class="angle-tag">Shortcut</div><div class="angle-text">${a.shortcut}</div></div>
    <div class="angle-row"><div class="angle-tag">Feeling</div><div class="angle-text">${a.feeling}</div></div>
  `;
}

function renderGuaranteeCard(type, name) {
  const card = document.getElementById('guaranteeCard');
  if (!card) return;
  card.innerHTML = `
    <div class="guarantee-card-label">72-Hour Guarantee</div>
    <p class="gc-body">If it doesn't produce a meaningful shift in 72 hours, reply and I'll make it right. You keep the Blueprint either way. The 72 hours covers the first changes, like feeding, positioning and soothing. It is not a promise about any single product.</p>
  `;
}

function buildTriedFailureLine(type) {
  if (triedItems.length === 0) return '';
  return `You noted already trying ${triedItems.join(', ')} without lasting relief. That is common when remedies don't address the primary starting-point pattern.`;
}

function goToProduct() {
  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];
  sendEvent('blueprint_checkout_click', { colic_type: R.apiType, surface: 'quiz_result' });
  subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed', 'blueprint');
  const url = `${CFG.productUrl}?ref=${encodeURIComponent(ASSESSMENT_ID)}&wanted=true&utm_source=quiz&utm_medium=assessment&utm_campaign=${encodeURIComponent(UTM_SOURCE)}`;
  window.location.href = url;
}

function viewProduct() {
  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];
  sendEvent('blueprint_view_click', { colic_type: R.apiType, surface: 'quiz_result' });
  subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed', 'blueprint_view');
  const url = `${CFG.productPageUrl}?ref=${encodeURIComponent(ASSESSMENT_ID)}&utm_source=quiz&utm_medium=assessment_view&utm_campaign=${encodeURIComponent(UTM_SOURCE)}`;
  window.location.href = url;
}

function goToChecklist() {
  if (!resultShown) return;
  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];
  subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed', 'checklist');
  try {
    sessionStorage.setItem('cp_lead', JSON.stringify({
      babyName: babyName,
      name: userName,
      email: userEmail,
      age: babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks,
      consent: true,
    }));
  } catch (e) {}
  const ageVal = babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks;
  const url = `${CFG.checklistUrl}?type=${type}&confidence=${getConfidencePct()}&aid=${encodeURIComponent(ASSESSMENT_ID)}&name=${encodeURIComponent(userName)}&age=${encodeURIComponent(ageVal)}&handoff=quiz_result`;
  window.location.href = url;
}

function buildDMMessage(R) {
  const ageStr = classifyAge(babyAgeWeeks !== null ? babyAgeWeeks : currentAgeWeeks).range;
  return `Hi Vincent, I just finished the Colic Protocol assessment (ID: ${ASSESSMENT_ID}). My baby is ${ageStr} and our result was ${R.type}. Can you review our result?`;
}

function copyDMMessage() {
  const text = document.getElementById('dmMessageBox').textContent;
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      const b = document.getElementById('dmCopyBtn');
      if (b) { b.textContent = 'Copied!'; setTimeout(() => { b.textContent = 'Copy message'; }, 2000); }
    });
  }
}

function goToDM() {
  const type = getPrimaryType(scores);
  const R = RESULTS[type] || RESULTS['MIXED'];
  sendEvent('dm_open_click', { surface: 'quiz_result' });
  subscribeToMailerLite(userName, userEmail, R.apiType, R.mailerliteField, 'completed', 'dm');
  window.open(CFG.dmUrl, '_blank', 'noopener');
}
