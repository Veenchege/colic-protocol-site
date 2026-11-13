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
    if (res.ok) {
      const data = await res.json();
      if (Number.isFinite(data.completed) && data.completed > 0) {
        ASSESSMENT_COUNT_LIVE = Math.max(data.completed, COUNT_FLOOR);
      }
    }
  } catch(e) {}
  paintCount();
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

/* ══════════════════════════════════════════════════════════════════════
   QUESTIONS
   Each option: [display text, score weights {GUT, NS, FM}, feeding tag
   (Q7 only, null elsewhere), tried tag (Q4 only, null elsewhere),
   reason line shown in the answer audit].
   Scoring weights are heuristic starting points, not validated against
   outcomes. Q1, Q2, Q3, Q5, Q6 and Q7 are single-select, Q4 is multi.
   ══════════════════════════════════════════════════════════════════════ */
const QUESTIONS = [
  // Q1: AGE WITH GRAPH ON TOP + INTEGER SELECTOR BELOW
  {
    q: "How many weeks old is your baby today?",
    sub: "Crying follows a well-documented biological curve: rising in early weeks, peaking around week 6 to 8, and easing by week 12.",
    single: true,
    isIntegerAge: true
  },

  // Q2: TOTAL CRYING DURATION WITH 24-HOUR INTERACTIVE CLOCK
  {
    q: "On a typical complete day and night, approximately how long does your baby cry in total?",
    sub: "Measures total daily burden to establish an objective baseline for tracking in the Midnight Protocol.",
    single: true,
    isDurationClock: true,
    opts: [
      ["Less than 1 hour total", {GUT:0,NS:0,FM:0}, null, null, "Mild daily fussiness", 15, "#698457", "< 1 Hour", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 14 14"/></svg>`],
      ["1 to 2 hours total", {GUT:0,NS:0,FM:0}, null, null, "Moderate daily unsettled periods", 45, "#BE933B", "1-2 Hours", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 12"/></svg>`],
      ["2 to 3 hours total", {GUT:0,NS:0,FM:0}, null, null, "Meets common clinical colic criteria (Wessel 'Rule of 3s')", 75, "#BA5731", "2-3 Hours (Colic Threshold)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 18 13"/></svg>`],
      ["3 to 5 hours total", {GUT:0,NS:0,FM:0}, null, null, "Severe daily crying load", 120, "#853A1D", "3-5 Hours (Severe Load)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 17"/></svg>`],
      ["More than 5 hours total", {GUT:0,NS:0,FM:0}, null, null, "Intense prolonged infant distress", 180, "#222C1D", "5+ Hours (Prolonged Distress)", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 12 18"/></svg>`],
      ["I am not sure / varies day to day", {GUT:0,NS:0,FM:0}, null, null, "Unpredictable daily totals", 360, "#7A6856", "Unpredictable Variance", `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9" stroke-dasharray="3,3"/><polyline points="12 7 12 12 15 15"/></svg>`]
    ]
  },

  // Q3: DIRECT FEEDING OBSERVATIONS (Observable Pattern: Feeding Mechanics Cluster)
  {
    q: "When your baby is feeding, which of these do you regularly notice?",
    sub: "Direct observations during feeding differentiate mechanical aerophagia (air swallowing) from general evening fussiness.",
    single: false,
    opts: [
      ["Repeatedly pulls away from breast or bottle, arches back, or fusses", {GUT:0,NS:0,FM:1}, null, null, "Aerophagia / flow rate discomfort sign", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12c-3 0-6 4-10 4-2.5 0-4-2-4-4s1.5-4 4-4c4 0 7 4 10 4z"/></svg>`],
      ["Coughs, sputters, or seems to struggle with milk flow speed", {GUT:0,NS:0,FM:1}, null, null, "Swallow coordination or fast let-down sign", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v6M8 6l8 0M7 16c1.5 2 4.5 2 6 0"/><circle cx="12" cy="19" r="1.5" fill="currentColor"/></svg>`],
      ["Milk repeatedly leaks from corners of mouth while sucking", {GUT:0,NS:0,FM:1}, null, null, "Incomplete lip seal / latch vacuum loss", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a6 6 0 0 0 6-6c0-4-6-10-6-10S6 11 6 15a6 6 0 0 0 6 6z"/></svg>`],
      ["Makes frequent clicking or smacking sounds while feeding", {GUT:0,NS:0,FM:1}, null, null, "Breaking suction during swallow sequence", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`],
      ["Feeds are consistently exhausting, frantic, or take over 45 minutes", {GUT:0,NS:0,FM:1}, null, null, "Fatigue or mechanical feeding inefficiency", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 8 14"/></svg>`],
      ["Feeds usually look comfortable with coordinated swallowing", {GUT:0,NS:0,FM:0}, null, null, "No observable mechanical feeding struggle", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`],
      ["None of these / I am not sure", {GUT:0,NS:0,FM:0}, null, null, "Uncertain or no obvious feed difficulty", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`]
    ]
  },

  // Q4: CRY TIMING RELATIVE TO FEEDS
  {
    q: "When does the crying usually happen in relation to feeding?",
    sub: "Connects distress onset to gastric transit times.",
    single: true,
    opts: [
      ["Crying consistently starts during feeds or within 15 to 20 minutes after", {GUT:0,NS:0,FM:2}, null, null, "Immediate mechanical or upper esophageal distress", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2 2M10 2h4M12 2v3"/></svg>`],
      ["Crying happens in waves throughout the day or night, unrelated to feeds", {GUT:2,NS:0,FM:0}, null, null, "Paroxysmal visceral cramping pattern", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 12c2.5-4 5-4 7.5 0s5 4 7.5 0 5-4 7.5 0"/></svg>`],
      ["Crying predictably clusters in late afternoon/evening (5 PM to midnight)", {GUT:0,NS:2,FM:0}, null, null, "Classic diurnal sensory saturation ('witching hour')", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v2M4.93 4.93l1.41 1.41M2 12h2M20 12h2M19.07 4.93l-1.41 1.41"/><path d="M22 17H2M16 17a4 4 0 0 0-8 0"/></svg>`],
      ["Unpredictable / occurs at different times with no pattern", {GUT:0,NS:0,FM:0}, null, null, "No consistent temporal link", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="8" r="2"/><circle cx="10" cy="16" r="2"/><circle cx="19" cy="17" r="2"/></svg>`]
    ]
  },

  // Q5: VISCERAL & DIGESTIVE SIGNS (Observable Pattern: Gut Visceral Cluster)
  {
    q: "Apart from crying, which digestive clues have you repeatedly noticed?",
    sub: "Observable visceral responses to intestinal gas and abdominal pressure.",
    single: false,
    opts: [
      ["Pulls knees tightly to chest with a firm, swollen, or tight tummy", {GUT:1,NS:0,FM:0}, null, null, "Classic abdominal guarding posture", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="4"/><path d="M8 12c2-2 6-2 8 0"/></svg>`],
      ["Noticeable pause or visible relief in crying after passing gas or stool", {GUT:1,NS:0,FM:0}, null, null, "Decompression provides temporary pain relief", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 9a2 2 0 0 1-2 2H6l-4 4M20 4l-4 4M18 18a3 3 0 0 1-3 3h-4"/></svg>`],
      ["Frequent very loose, frothy, explosive, or green stools", {GUT:1,NS:0,FM:0}, null, null, "Altered gut transit and fermentation", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><path d="M8 12c1.5 2 4.5 2 6 0"/></svg>`],
      ["Strains uncomfortably for long periods with hard, infrequent stools", {GUT:1,NS:0,FM:0}, null, null, "Infant dyschezia or delayed stool transit", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg>`],
      ["Frequent wet burps, hiccups, or sour regurgitation after feeds", {GUT:0,NS:0,FM:1}, null, null, "Upper gastrointestinal reflux signs", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a7 7 0 0 0-7 7v4a7 7 0 0 0 14 0v-4a7 7 0 0 0-7-7z"/><path d="M12 9v4"/></svg>`],
      ["Normal yellow/seedy stools with no obvious pain", {GUT:0,NS:0,FM:0}, null, null, "Healthy typical bowel movements", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6L9 17l-5-5"/></svg>`],
      ["None of these observed", {GUT:0,NS:0,FM:0}, null, null, "No distinct digestive signals", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>`]
    ]
  },

  // Q6: SOOTHING & CALMING RESPONSE (Observable Pattern)
  {
    q: "Which calming position produces the clearest reduction in crying?",
    sub: "Differential response to counter-pressure, vestibular motion, or upright posture.",
    single: true,
    opts: [
      ["Settles noticeably with tummy-down pressure (Tiger Hold across forearm)", {GUT:2,NS:0,FM:0}, null, null, "Gentle upward abdominal counter-pressure eases visceral cramping", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="10" width="18" height="6" rx="3"/><circle cx="7" cy="13" r="1.5" fill="currentColor"/></svg>`],
      ["Settles best when kept upright over shoulder (45°–90°); cries when flat", {GUT:0,NS:0,FM:2}, null, null, "Gravity assists esophageal comfort and prevents regurgitation", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>`],
      ["Settles only with continuous rhythmic bouncing/walking; screams if stopped", {GUT:0,NS:2,FM:0}, null, null, "State-regulation dependent on continuous vestibular input", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3a9 9 0 0 0-9 9c0 3.5 2 6.5 5 8M12 21a9 9 0 0 0 9-9c0-3.5-2-6.5-5-8"/></svg>`],
      ["Almost nothing helps / equally hard to soothe in all positions", {GUT:0,NS:0,FM:0}, null, null, "Resistant to common holds", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="9" y1="12" x2="15" y2="12"/></svg>`]
    ]
  },

  // Q7: FEEDING METHOD (Personalization Router - 0 points)
  {
    q: "How is your baby currently fed?",
    sub: "Personalizes your protocol without distorting the starting-point pattern.",
    single: true,
    opts: [
      ["Exclusively breastfed", {GUT:0,NS:0,FM:0}, "Breastfed", null, "Eligible for latch & probiotic guidance (Savino 2010)", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21a6 6 0 0 0 6-6c0-4-6-10-6-10S6 11 6 15a6 6 0 0 0 6 6z"/></svg>`],
      ["Exclusively formula-fed", {GUT:0,NS:0,FM:0}, "Formula-fed", null, "Leads with paced feeding and bottle mechanics (Sung 2014 caveat)", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2h4M9 5h6"/><rect x="7" y="7" width="10" height="13" rx="2.5"/><line x1="7" y1="11" x2="11" y2="11"/><line x1="7" y1="14" x2="13" y2="14"/></svg>`],
      ["Combination of breast milk and formula", {GUT:0,NS:0,FM:0}, "Mixed", null, "Mixed feeding protocol", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 16a4 4 0 0 0 4-4c0-2-4-6-4-6s-4 4-4 6a4 4 0 0 0 4 4z"/><rect x="13" y="8" width="8" height="11" rx="2"/></svg>`],
      ["Expressed breast milk (bottle-fed)", {GUT:0,NS:0,FM:0}, "Bottle-fed", null, "Focuses on paced bottle mechanics", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="7" y="7" width="10" height="13" rx="2.5"/><path d="M12 11c1 1.5 1 2.5 0 3"/></svg>`]
    ]
  },

  // Q8: PREVIOUSLY TRIED REMEDIES (Personalization - 0 points)
  {
    q: "Which of these have you already tried?",
    sub: "Prevents your customized plan from sending you back through steps that already failed.",
    single: false,
    opts: [
      ["Gas drops (simethicone)", {GUT:0,NS:0,FM:0}, null, "gas drops", "Over-the-counter anti-foaming agent", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="m19 11-8-8-8.5 8.5a5 5 0 0 0 7 7L18 10"/><path d="m5 2 5 5"/><circle cx="19" cy="18" r="2" fill="#BA5731"/></svg>`],
      ["Gripe water", {GUT:0,NS:0,FM:0}, null, "gripe water", "Herbal / sodium bicarbonate liquid", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="8" width="8" height="12" rx="2"/><path d="M8 8V5h4v3M16 11l3 3-2 2-3-3"/></svg>`],
      ["Sound machines / brown noise", {GUT:0,NS:0,FM:0}, null, "brown noise", "Continuous acoustic calming", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`],
      ["Paced bottle feeding or different bottles/nipples", {GUT:0,NS:0,FM:0}, null, "paced feeding or bottles", "Feeding flow modifications", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 14l12-4 2 6-12 4z"/><circle cx="6" cy="15" r="1.5" fill="currentColor"/></svg>`],
      ["Changing formula brand or type", {GUT:0,NS:0,FM:0}, null, "changing formula", "Nutritional trial", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="5" y="6" width="14" height="15" rx="3"/><line x1="5" y1="10" x2="19" y2="10"/><path d="M9 3h6v3H9z"/></svg>`],
      ["Adjusting mother's diet (if breastfeeding)", {GUT:0,NS:0,FM:0}, null, "dietary changes", "Elimination of dairy/irritants", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 7c-2 3-1 6 2 7 2 1 3 0 3-2-1-3-3-4-5-5z"/></svg>`],
      ["Rhythmic bouncing, driving, or tight swaddling", {GUT:0,NS:0,FM:0}, null, "bouncing or swaddling", "Vestibular / sensory techniques", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a5 5 0 0 0-5 5v10a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5z"/><path d="M7 10l10 4M7 14l10-4"/></svg>`],
      ["None of these yet", {GUT:0,NS:0,FM:0}, null, null, "Starting fresh tonight", null, null, null, `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`]
    ]
  }
];

/* ══════════════════════════════════════════════════════════════════════
   RESULTS
   Wording follows Master Document v17 and Frameworks v1.3: the three
   patterns are practical starting points, not proven causes. No dB
   figures. Savino 2010 is always paired with Sung 2014. Formula-fed and
   mixed babies lead with feeding and soothing, not the probiotic.
   `steps` and `quickSteps` may be functions of feeding method.
   ══════════════════════════════════════════════════════════════════════ */
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
const PREVALENCE = { NS: 52, GUT: 25, FM: 23 };

/* ── SESSION IDENTIFIERS ─────────────────────────────────────────────── */
/* 10 random characters from a 32-letter alphabet with no 0/O/1/I, drawn from
   crypto. The old 5-digit ID had only 100,000 values, so with a few hundred
   rows two parents could share an ID, and the upsert on assessment_id would
   overwrite the other parent's email and result. 256 % 32 is 0, so there is
   no modulo bias. Still matches /^CP-[A-Za-z0-9-]{3,40}$/. */
const ASSESSMENT_ID = (() => {
  const year = new Date().getFullYear();
  const ALPHA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(10);
  try { crypto.getRandomValues(bytes); }
  catch (e) { for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256); }
  let rand = '';
  for (let i = 0; i < bytes.length; i++) rand += ALPHA[bytes[i] % 32];
  return `CP-${year}-${rand}`;
})();

/* ── STATE ───────────────────────────────────────────────────────────── */
let userName = '', userEmail = '', userConsent = false, babyAgeWeeks = null, babyName = '', qIndex = 0;
let suppressSubscribe = false;
let resultShown = false; // true only once the result screen is on screen

let qTimerInterval = null, qTimerSeconds = 0;
function startQTimer(){
  qTimerSeconds = 0;
  paintQTimer();
  if (qTimerInterval) clearInterval(qTimerInterval);
  qTimerInterval = setInterval(() => { qTimerSeconds++; paintQTimer(); }, 1000);
}
function stopQTimer(){
  if (qTimerInterval) { clearInterval(qTimerInterval); qTimerInterval = null; }
}
function paintQTimer(){
  const el = document.getElementById('qTimer');
  if (!el) return;
  const m = Math.floor(qTimerSeconds / 60), s = qTimerSeconds % 60;
  el.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
}
let feedingMethod = '';
let scores = {GUT:0, NS:0, FM:0};
let triedItems = [];
let typeReasons = {GUT:[], NS:[], FM:[]};
const selectedMap = new Map();
const quizStartedAt = Date.now(); // simple bot-speed trap

function getConfidencePct() {
  const total = scores.GUT + scores.NS + scores.FM;
  const dominant = Math.max(scores.GUT, scores.NS, scores.FM);
  return total > 0 ? Math.round((dominant / total) * 100) : 0;
}

function sendEvent(name, params) {
  try {
    if (typeof gtag === 'function') {
      gtag('event', name, params);
    }
  } catch (e) {}
}

/* ── SECURE SUBSCRIPTION ─────────────────────────────────────────────── */
async function subscribeToMailerLite(name, email, colcType, detail, status) {
  if (suppressSubscribe) return;
  const confidencePct = getConfidencePct();
  const utm = getStoredUTMs();

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        email,
        name,
        website: '',
        consent: !!userConsent,
        colic_type:        colcType,
        colic_type_detail: detail,
        // Before the result exists the score is 0 and means nothing, so
        // only send it once the quiz is completed.
        confidence_pct:    status === 'completed' ? confidencePct : null,
        baby_age_weeks:    babyAgeWeeks,
        baby_age_range:    classifyAge(babyAgeWeeks).range,
        baby_name:         babyName,
        feeding_method:    feedingMethod || 'Not specified',
        tried_items:       triedItems.join(', '),
        group_id:          CFG.group_id,
        assessment_id:     ASSESSMENT_ID,
        lead_source:       UTM_SOURCE,
        quiz_status:       status,
        quiz_version:      '2.3',
        red_flag:          redFlagStatus,
        purchase_status:   'pending',
        ...utm,
      })
    });
    if (!res.ok) {
      sendEvent('lead_capture_failed', { colic_type: colcType || 'Unassigned', ml_status: res.status });
    } else {
      const data = await res.json().catch(() => ({}));
      if (data && data.mailerlite_synced === false) {
        sendEvent('lead_capture_failed', {
          colic_type: colcType || 'Unassigned',
          ml_status: typeof data.ml_status === 'number' ? data.ml_status : 0
        });
      }
    }
  } catch(e) {
    console.warn('Subscribe proxy silent error:', e);
    sendEvent('lead_capture_failed', { colic_type: colcType || 'Unassigned', ml_status: 0 });
  }
}

/* ── HELPERS ─────────────────────────────────────────────────────────── */
const show = id => document.getElementById(id).classList.remove('hidden');
const hide = id => document.getElementById(id).classList.add('hidden');
const escHtml = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');

const DEFAULT_PLACEHOLDERS = {
  nameInput: 'Your first name',
  emailInput: 'Your email address',
  ageInput: "Baby's age in weeks",
};
function shake(id, msg) {
  const el = document.getElementById(id);
  el.style.borderColor = '#c4603a';
  el.placeholder = msg;
  setTimeout(() => {
    el.style.borderColor = '';
    el.placeholder = DEFAULT_PLACEHOLDERS[id] || '';
  }, 2200);
}

/* ── FLOW ────────────────────────────────────────────────────────────── */
function startQuiz() {
  startLiveCountdown();
  const name    = document.getElementById('nameInput').value.trim();
  const email   = document.getElementById('emailInput').value.trim();
  const ageRaw  = document.getElementById('ageInput').value.trim();
  const honeypot = document.getElementById('hpField').value;
  const consentBox = document.getElementById('consentCheck');

  if (!name)                                          return shake('nameInput', 'Please enter your name');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return shake('emailInput', 'Please enter a valid email');
  if (!ageRaw)                                         return shake('ageInput', "Please enter baby's age in weeks");
  const ageNum = Number(ageRaw);
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 52) return shake('ageInput', 'Enter age in weeks, 0 to 52');
  if (!consentBox.checked) {
    consentBox.closest('.consent-row').style.outline = '1.5px solid #c2513a';
    consentBox.closest('.consent-row').style.borderRadius = '8px';
    setTimeout(() => { consentBox.closest('.consent-row').style.outline = ''; }, 2000);
    consentBox.focus();
    return;
  }

  userName     = name;
  userEmail    = email;
  userConsent  = true;
  babyAgeWeeks = ageNum;
  babyName     = ((document.getElementById('babyNameInput') || {}).value || '').trim().slice(0, 40);

  scores = {GUT:0, NS:0, FM:0};
  feedingMethod = '';
  triedItems = [];
  typeReasons = {GUT:[], NS:[], FM:[]};
  qIndex = 0;
  selectedMap.clear();
  rfSelected.clear();
  redFlagStatus = 'pending';

  if (honeypot || (Date.now() - quizStartedAt) < 1500) {
    console.warn('Submission flagged as likely automated, proceeding without subscribing.');
    suppressSubscribe = true;
  } else {
    // Capture the lead now, before the safety check and questions.
    // red_flag is 'pending' until the safety screen is answered.
    subscribeToMailerLite(userName, userEmail, 'Unassigned', 'Quiz Started', 'started');
  }

  hide('landingScreen');
  renderRedFlag();
  show('redFlagScreen');
}

/* ── SAFETY CHECK SCREENS ────────────────────────────────────────────── */
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
    // "None" is exclusive
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
    subscribeToMailerLite(userName, userEmail, 'Unassigned', 'Safety check passed', 'started');
    hide('redFlagScreen');
    show('quizScreen');
    startQTimer();
    renderQuestion();
    return;
  }

  const labels = flagged.map(i => RED_FLAG_OPTIONS[i].short);
  redFlagStatus = 'flagged: ' + labels.join(', ');
  subscribeToMailerLite(userName, userEmail, 'Unassigned', 'Safety check flagged', 'red_flag');
  sendEvent('red_flag_stop', { colic_type: 'Unassigned' });
  document.getElementById('rfStopList').textContent = labels.join(', ');
  hide('redFlagScreen');
  show('redFlagStopScreen');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function backFromRedFlagStop() {
  hide('redFlagStopScreen');
  redFlagStatus = 'pending';
  renderRedFlag();
  show('redFlagScreen');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ── QUESTIONS ───────────────────────────────────────────────────────── */
/* Pre-fill from the parent's own tracker log (written by tracker.html to
   sessionStorage 'cp_signals'). Only Q1, Q4, Q6, Q7 can be answered from a log.
   Every pre-selected answer can be changed. */
function applyLogHint(i) {
  document.querySelectorAll('.log-hint').forEach((n) => n.remove());
  try {
    const s = JSON.parse(sessionStorage.getItem('cp_signals') || 'null');
    if (!s) return;
    const v = s[{ 0: 'q1', 3: 'q4', 5: 'q6', 6: 'q7' }[i]];
    if (v === undefined || v === null) return;
    const els = document.querySelectorAll('#optionsBox .option');
    (Array.isArray(v) ? v : [v]).forEach((ix) => { if (els[ix]) els[ix].click(); });
    const n = document.createElement('div');
    n.className = 'q-sub log-hint';
    n.textContent = 'Suggested from your log (' + s.n + ' entries over ' + s.days + ' days). Change it if it is wrong.';
    document.getElementById('optionsBox').before(n);
  } catch (e) {}
}

function renderQuestion() {
  const q = QUESTIONS[qIndex];
  const stepNum = qIndex + 1;
  const total = QUESTIONS.length;
  const pct = Math.round((stepNum / total) * 100);

  const remaining = total - stepNum;
  const zCountdown = document.getElementById('zCountdown');
  if (zCountdown) {
    zCountdown.textContent = remaining === 0 ? "Final step! Almost finished" : `${remaining} question${remaining > 1 ? 's' : ''} left`;
  }

  document.getElementById('qCount').textContent = `Question ${stepNum} of ${total}`;
  const stepPctEl = document.getElementById('stepPctText');
  if (stepPctEl) stepPctEl.textContent = `${pct}% Complete`;
  document.getElementById('progressFill').style.width = `${pct}%`;

  // Advance Crawling Baby
  const clampedPct = Math.min(pct, 95);
  const marker = document.getElementById('crawlerMarker');
  if (marker) {
    marker.style.left = `${clampedPct}%`;
    marker.classList.add('step-active');
    setTimeout(() => marker.classList.remove('step-active'), 400);
  }

  document.getElementById('qText').textContent = q.q;
  document.getElementById('qSub').textContent  = q.sub;

  const hintEl = document.getElementById('multiHint');
  if (hintEl) hintEl.textContent = q.single ? 'Select one' : 'Select all that apply';

  const box = document.getElementById('optionsBox');
  box.innerHTML = '';
  selectedMap.clear();

  // Clear any existing special visual containers
  const existingSpecial = document.getElementById('dynamicSpecialVisualBox');
  if (existingSpecial) existingSpecial.remove();

  // SPECIAL CASE: QUESTION 1 AGE (GRAPH ON TOP + INTEGER SELECTOR BELOW)
  if (q.isIntegerAge) {
    renderAgeQuestion();
    return;
  }

  // SPECIAL CASE: QUESTION 2 CRYING DURATION (24H CLOCK ON TOP)
  if (q.isDurationClock) {
    renderDurationClock(q);
  }

  const btn = document.getElementById('continueBtn');
  btn.classList.remove('visible');
  btn.textContent = (qIndex === total - 1) ? 'Generate Starting-Point Plan →' : 'Continue';

  q.opts.forEach((o, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.setAttribute('role', q.single ? 'radio' : 'checkbox');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');

    const visualHtml = o[8] ? `<div class="opt-visual">${o[8]}</div>` : '';
    div.innerHTML = `<span class="opt-check" id="chk${i}" aria-hidden="true"></span>${visualHtml}<span class="opt-text">${o[0]}</span>`;
    div.style.animation = `rise .35s ${i * .07}s ease both`;
    div.onclick = () => toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null); } };
    box.appendChild(div);
  });
  applyLogHint(qIndex);
}


// MATHEMATICAL COORDINATES ALONG BARR (2009) CRYING CURVE (Weeks 0 to 16)
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

// CLASSIFY INTEGER AGE INTO COHORTS FOR CONTINUITY (0-2, 3-5, 6-8, 9-12, 12+)
function classifyAge(w) {
  const num = parseInt(w, 10) || 6;
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
      milestone: "<strong>The Escalation Phase:</strong> Evening crying begins clustering ('the witching hour'). The infant's sensory awareness expands rapidly, while visceral peristalsis surges. Parents often start trying gas drops or gripe water during this window."
    };
  } else if (num <= 8) {
    return {
      weeks: num,
      range: "6 to 8 weeks",
      bracket: "6-8",
      tag: "6 to 8 weeks · Peak Colic Window",
      status: "Biological Crying Peak (Barr 2009)",
      milestone: "<strong>The Developmental Peak:</strong> Infant crying commonly reaches its maximum daily duration and intensity (often 2 to 3+ hours daily per Barr 2009). The sensory threshold is at its most reactive point, while biological self-soothing circuitry is still immature. This is the hardest stretch, not a parental failure."
    };
  } else if (num <= 12) {
    return {
      weeks: num,
      range: "9 to 12 weeks",
      bracket: "9-12",
      tag: "9 to 12 weeks · The Turning Point",
      status: "Developmental Easing",
      milestone: "<strong>The Turning Point:</strong> Crying duration begins to drop for many babies. Sleep intervals lengthen slightly; the gut microbiome diversifies and oral motor latch mechanics mature."
    };
  } else {
    return {
      weeks: num,
      range: "Older than 12 weeks",
      bracket: "12+",
      tag: "Older than 12 weeks · Settled Horizon",
      status: "Late Infancy Transition",
      milestone: "<strong>The Easing Window:</strong> Colic typically eases by about 3 to 4 months as circadian rhythm and melatonin regulation stabilize. If intense, inconsolable crying persists past 12-16 weeks, consult your pediatrician to rule out food sensitivities or other clinical factors."
    };
  }
}

let currentAgeWeeks = 6;
let autoAdvanceTimer = null;

function setAgeWeeks(val) {
  const num = Math.min(16, Math.max(1, parseInt(val, 10) || 1));
  currentAgeWeeks = num;
  babyAgeWeeks = num;

  const numEl = document.getElementById('ageValDisplay');
  if (numEl) numEl.textContent = num;

  const slider = document.getElementById('ageSlider');
  if (slider) slider.value = num;

  document.querySelectorAll('.aic-chip').forEach(btn => {
    btn.classList.remove('active');
  });
  const matchingChip = document.getElementById('chip-' + num);
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

// RENDER QUESTION 1: DEVELOPMENTAL CRYING CURVE GRAPH ON TOP + INTEGER INPUT BELOW
function renderAgeQuestion() {
  const box = document.getElementById('optionsBox');
  const selectedWeeks = babyAgeWeeks || currentAgeWeeks;
  currentAgeWeeks = selectedWeeks;
  const classification = classifyAge(selectedWeeks);
  const coords = getCurveCoords(selectedWeeks);

  const graphCard = document.createElement('div');
  graphCard.id = 'dynamicSpecialVisualBox';
  graphCard.className = 'dev-curve-card';

  graphCard.innerHTML = `
    <div class="dcc-header">
      <div class="dcc-badge">Developmental Crying Timeline (Barr 2009)</div>
      <div class="dcc-title">Where Your Baby Sits on the Biological Crying Curve</div>
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
        <text x="500" y="160" font-family="'DM Mono', monospace" font-size="11" fill="#7A6856" text-anchor="middle">Wk 16</text>

        <path d="M 40 140 L 40 135 C 90 130, 150 95, 205 35 C 240 35, 290 85, 360 120 C 420 135, 470 138, 500 140 Z" fill="url(#curveShade)"/>
        <path d="M 40 135 C 90 130, 150 95, 205 35 C 240 35, 290 85, 360 120 C 420 135, 470 138, 500 140" fill="none" stroke="#BA5731" stroke-width="3" stroke-linecap="round"/>

        <line x1="213" y1="35" x2="213" y2="140" stroke="#BA5731" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.6"/>
        <circle cx="213" cy="35" r="4.5" fill="#BA5731"/>

        <g id="curvePinGroup" transform="translate(${coords.x}, ${coords.y})" style="transition: transform 0.4s cubic-bezier(0.2, 0.8, 0.3, 1);">
          <line id="curvePinLine" x1="0" y1="0" x2="0" y2="${140 - coords.y}" stroke="#261B14" stroke-width="1.8" stroke-dasharray="2,2"/>
          <circle cx="0" cy="0" r="8" fill="#fff" stroke="#BA5731" stroke-width="3"/>
          <circle cx="0" cy="0" r="3" fill="#BA5731"/>
          <g transform="translate(0, -22)">
            <rect x="-55" y="-13" width="110" height="20" rx="6" fill="#261B14"/>
            <text id="curvePinText" x="0" y="1" font-family="'DM Mono', monospace" font-size="9" font-weight="700" fill="#fff" text-anchor="middle">Week ${selectedWeeks}${selectedWeeks === 6 ? ' (Peak)' : ''}</text>
          </g>
        </g>
      </svg>
    </div>
  `;
  box.appendChild(graphCard);

  const inputCard = document.createElement('div');
  inputCard.className = 'age-integer-card';
  inputCard.innerHTML = `
    <div class="aic-label">Set Your Baby's Exact Age in Weeks:</div>

    <div class="aic-stepper-wrap">
      <button type="button" class="aic-step-btn" onclick="adjustAgeWeeks(-1)">&minus;</button>
      <div class="aic-val-box">
        <span class="aic-val-num" id="ageValDisplay">${selectedWeeks}</span>
        <span class="aic-val-unit">weeks old</span>
      </div>
      <button type="button" class="aic-step-btn" onclick="adjustAgeWeeks(1)">&plus;</button>
    </div>

    <div class="aic-slider-wrap">
      <input type="range" id="ageSlider" min="1" max="16" value="${selectedWeeks}" step="1" oninput="setAgeWeeks(this.value)" class="aic-slider"/>
      <div class="aic-slider-ticks">
        <span>1w</span>
        <span>3w</span>
        <span style="color:var(--terra);font-weight:700">6w (Peak)</span>
        <span>9w</span>
        <span style="color:var(--sage);font-weight:700">12w (Easing)</span>
        <span>16w</span>
      </div>
    </div>

    <div class="aic-chips-wrap">
      <button type="button" class="aic-chip ${selectedWeeks === 2 ? 'active' : ''}" id="chip-2" onclick="setAgeWeeks(2)">2 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks === 4 ? 'active' : ''}" id="chip-4" onclick="setAgeWeeks(4)">4 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks === 6 ? 'active' : ''}" id="chip-6" onclick="setAgeWeeks(6)">6 weeks (Peak)</button>
      <button type="button" class="aic-chip ${selectedWeeks === 8 ? 'active' : ''}" id="chip-8" onclick="setAgeWeeks(8)">8 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks === 10 ? 'active' : ''}" id="chip-10" onclick="setAgeWeeks(10)">10 weeks</button>
      <button type="button" class="aic-chip ${selectedWeeks >= 12 ? 'active' : ''}" id="chip-12" onclick="setAgeWeeks(12)">12+ weeks</button>
    </div>

    <div class="aic-classification-box">
      <div class="aic-class-header">
        <span class="aic-class-tag" id="ageClassTag">${classification.tag}</span>
        <span class="aic-class-status" id="ageClassStatus">${classification.status}</span>
      </div>
      <div class="aic-milestone-text" id="ageClassMilestone">
        ${classification.milestone}
      </div>
    </div>
  `;
  box.appendChild(inputCard);

  const btn = document.getElementById('continueBtn');
  btn.classList.add('visible');
  btn.textContent = `Continue with ${selectedWeeks} Weeks →`;
}

// RENDER QUESTION 2: 24-HOUR INTERACTIVE ANALOG CLOCK
function renderDurationClock(q) {
  const selected = Array.from(selectedMap.keys());
  const clockCard = document.createElement('div');
  clockCard.id = 'dynamicSpecialVisualBox';
  clockCard.className = 'duration-clock-card';

  let chosenAngle = 0;
  let chosenColor = '#BA5731';
  let chosenVal = 'Tap an option below to highlight crying hours';
  let chosenSub = 'Visualizes what fraction of your baby\'s 24 hours is consumed by crying.';

  if (selected.length > 0) {
    const opt = q.opts[selected[0]];
    chosenAngle = opt[5] || 60;
    chosenColor = opt[6] || '#BA5731';
    chosenVal = opt[7] || opt[0];
    chosenSub = opt[4];
  }

  const rad = (chosenAngle - 90) * Math.PI / 180;
  const endX = 60 + 48 * Math.cos(rad);
  const endY = 60 + 48 * Math.sin(rad);
  const largeArc = chosenAngle > 180 ? 1 : 0;
  const arcPath = chosenAngle > 0 && chosenAngle < 360
    ? `M 60 60 L 60 12 A 48 48 0 ${largeArc} 1 ${endX.toFixed(1)} ${endY.toFixed(1)} Z`
    : (chosenAngle === 360 ? `M 60 12 A 48 48 0 1 1 59.9 12 Z` : '');

  clockCard.innerHTML = `
    <div class="dcc-clock-left">
      <svg class="analog-clock-svg" viewBox="0 0 120 120" width="94" height="94">
        <circle cx="60" cy="60" r="54" fill="#FAF4EC" stroke="#261B14" stroke-width="2.5"/>
        <circle cx="60" cy="18" r="3.5" fill="#BE933B" title="Day (Noon)"/>
        <circle cx="60" cy="102" r="3.5" fill="#222C1D" title="Night (Midnight)"/>
        <circle cx="18" cy="60" r="2.5" fill="#7A6856"/>
        <circle cx="102" cy="60" r="2.5" fill="#7A6856"/>
        ${arcPath ? `<path d="${arcPath}" fill="${chosenColor}" fill-opacity="0.35" stroke="${chosenColor}" stroke-width="1.5"/>` : ''}
        <line x1="60" y1="60" x2="${(60 + 26 * Math.cos((chosenAngle - 90) * Math.PI / 180)).toFixed(1)}" y2="${(60 + 26 * Math.sin((chosenAngle - 90) * Math.PI / 180)).toFixed(1)}" stroke="#261B14" stroke-width="3" stroke-linecap="round"/>
        <line x1="60" y1="60" x2="60" y2="20" stroke="#BA5731" stroke-width="2" stroke-linecap="round" style="transform-origin:60px 60px; transform:rotate(${(chosenAngle * 6) % 360}deg); transition:transform 0.4s ease;"/>
        <circle cx="60" cy="60" r="4" fill="#261B14"/>
      </svg>
    </div>
    <div class="dcc-clock-right">
      <div class="dcc-clock-kicker">24-Hour Day & Night Burden</div>
      <div class="dcc-clock-val">${chosenVal}</div>
      <div class="dcc-clock-sub">${chosenSub}</div>
    </div>
  `;

  const box = document.getElementById('optionsBox');
  box.parentNode.insertBefore(clockCard, box);
}

function toggleOption(idx, weights, el, single, feeding, triedTag, reason) {
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

  if (single) {
    const wasSelected = selectedMap.has(idx);
    document.querySelectorAll('#optionsBox .option').forEach(deselect);
    selectedMap.clear();
    if (!wasSelected) {
      selectedMap.set(idx, { weights, feeding, triedTag, reason });
      select(el);
    }
  } else {
    if (selectedMap.has(idx)) {
      selectedMap.delete(idx);
      deselect(el);
    } else {
      selectedMap.set(idx, { weights, feeding, triedTag, reason });
      select(el);
    }
  }

  const btn = document.getElementById('continueBtn');
  if (selectedMap.size > 0) {
    btn.classList.add('visible');
    btn.textContent = selectedMap.size === 1 ? 'Continue' : `Continue (${selectedMap.size} selected)`;
  } else {
    btn.classList.remove('visible');
  }
}

function advanceQ() {
  selectedMap.forEach(sel => {
    Object.keys(sel.weights).forEach(k => { scores[k] += sel.weights[k]; });
    if (sel.feeding) feedingMethod = sel.feeding;
    if (sel.triedTag) triedItems.push(sel.triedTag);

    const text = sel.triedTag
      ? `You have already tried ${sel.triedTag} without a meaningful change.`
      : sel.reason;

    if (text) {
      Object.keys(sel.weights).forEach(k => {
        if (sel.weights[k] > 0) typeReasons[k].push({ text, weight: sel.weights[k] });
      });
    }
  });
  qIndex++;
  selectedMap.clear();

  const card = document.getElementById('quizScreen');
  card.style.opacity = '0';
  card.style.transform = 'translateY(-8px)';

  setTimeout(() => {
    if (qIndex < QUESTIONS.length) {
      renderQuestion();
    } else {
      stopQTimer();
      hide('quizScreen');
      showAnalysis();
      return;
    }
    card.style.transition = 'none';
    card.style.opacity = '1';
    card.style.transform = 'translateY(0)';
    requestAnimationFrame(() => {
      card.style.transition = 'opacity .3s, transform .3s';
    });
  }, 200);
}

function showAnalysis() {
  show('analysisScreen');
  setTimeout(showResult, 2800);
}

/* Highest score wins. Exact tie order: GUT, then FM, then NS. */
function getPrimaryType(s) {
  let best = 'GUT', bestVal = -Infinity;
  ['GUT', 'FM', 'NS'].forEach(k => {
    if (s[k] > bestVal) { bestVal = s[k]; best = k; }
  });
  return best;
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
      summary: "How to hold the bottle horizontal so your baby controls the swallow rate, stops gulping air, and breathes rhythmically."
    },
    flipple_latch: {
      url: "/blog/breastfeeding-latch-technique.html",
      tag: "Feeding Mechanics · Breast",
      title: "The Flipple Technique for a Deep, Air-Free Latch",
      summary: "A step-by-step method to achieve an asymmetric latch that prevents painful nipple clicking and stops milk leaking from the mouth."
    },
    best_bottles: {
      url: "/blog/best-bottles-feeding-positions-colic.html",
      tag: "Feeding Mechanics · Equipment",
      title: "Best Bottle Venting & Semi-Upright Feeding Positions",
      summary: "Comparing bottom-vented versus standard bottles and how positioning reduces aerophagia."
    },
    tiger_hold: {
      url: "/blog/tiger-hold-guide.html",
      tag: "Gut Visceral · Physical Hold",
      title: "How to Do the Tiger Hold Correctly for Gas Relief",
      summary: "Tummy-down forearm positioning that uses gentle upward palm counter-pressure to ease visceral intestinal spasms."
    },
    gentle_burping: {
      url: "/blog/gentle-burping-techniques.html",
      tag: "Gut Visceral · Decompression",
      title: "Gentle Burping & Gastrointestinal Decompression",
      summary: "Rotational burping techniques that release trapped air without jarring or forceful back pounding."
    },
    l_reuteri: {
      url: "/blog/l-reuteri-evidence.html",
      tag: "Gut Microbiome · Evidence",
      title: "L. Reuteri DSM 17938: What the Clinical Trials Show",
      summary: "Examining the Savino 2010 breastfed trial and Sung 2014 null results. Talk to your pediatrician before starting any supplement."
    },
    witching_room: {
      url: "/blog/witching-hour-room-setup.html",
      tag: "Nervous System · Environment",
      title: "The Witching Hour Room Setup: Sensory Dampening",
      summary: "Dim lighting, quiet steady brown noise across the room on a timer, and removing visual stimulation 30 minutes before evening fussiness."
    },
    swaddling_moro: {
      url: "/blog/swaddling-moro-reflex-colic.html",
      tag: "Nervous System · Sensory Holding",
      title: "Swaddling, the Moro Reflex, and State Regulation",
      summary: "Containing involuntary startle responses to help overstimulated nervous systems transition into sleep."
    },
    colic_timeline: {
      url: "/blog/colic-timeline-when-does-it-end.html",
      tag: "Foundational · Timeline",
      title: "The Colic Timeline: When Does It Peak and When Does It Ease?",
      summary: "Why infant crying typically peaks around week 6 and eases by 3 to 4 months, backed by the Barr 2009 developmental curve."
    },
    why_remedies_stop: {
      url: "/blog/why-colic-remedies-stop-working.html",
      tag: "Foundational · Structure",
      title: "Why Colic Remedies Seem to Work, Then Stop",
      summary: "The reason cycling through 5 different remedies in one week creates confusion, and how a 72-hour log clarifies the pattern."
    }
  };

  function addGuideCard(g) {
    const a = document.createElement('a');
    a.className = 'guide-card';
    a.href = g.url;
    a.target = '_blank';
    a.rel = 'noopener';
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
      if (vsTitle) vsTitle.textContent = "Demonstration: Baby Tongue Position & Milk Transfer Mechanics";
      if (vsDesc) vsDesc.textContent = "How proper tongue cupping past the lower gum prevents nipple compression, clicking, and air swallowing.";
      if (vsLinkBtn) {
        vsLinkBtn.href = "https://www.tiktok.com/@colicprotocol/video/7681719767215901965";
        vsLinkBtn.textContent = "Watch Latch & Tongue Video (TikTok) →";
      }
    } else {
      addGuideCard(blogGuides.paced_bottle);
      addGuideCard(blogGuides.best_bottles);
      if (vsTitle) vsTitle.textContent = "314k-View Video: Paced Bottle Feeding Position & 4 Steps";
      if (vsDesc) vsDesc.textContent = "Holding the bottle nearly horizontal so milk covers the teat opening without rapidly pouring into baby's mouth.";
      if (vsLinkBtn) {
        vsLinkBtn.href = "https://www.tiktok.com/@colicprotocol/video/7694054422434827534";
        vsLinkBtn.textContent = "Watch Paced Feeding Video (314k Views) →";
      }
    }
  } else if (type === 'GUT') {
    addGuideCard(blogGuides.tiger_hold);
    addGuideCard(blogGuides.gentle_burping);
    if (isBreast) addGuideCard(blogGuides.l_reuteri);

    if (vsTitle) vsTitle.textContent = "683k-View Reel: Why Patting Harder When Your Baby Won't Burp Doesn't Work";
    if (vsDesc) vsDesc.textContent = "Why sudden strikes lock the esophageal sphincter, and how upward spine alignment releases trapped gas gently.";
    if (vsLinkBtn) {
      vsLinkBtn.href = "https://www.tiktok.com/@colicprotocol/video/7673678040236444942";
      vsLinkBtn.textContent = "Watch Burping Technique Video (683k Views) →";
    }
  } else {
    addGuideCard(blogGuides.witching_room);
    addGuideCard(blogGuides.swaddling_moro);

    if (vsTitle) vsTitle.textContent = "Top Settling Video: Upright Posture, Gravity & Gentle Settling Rhythm";
    if (vsDesc) vsDesc.textContent = "How 10-15 minutes of gentle upright resting rhythm allows the gas to rise naturally while calming the startle reflex.";
    if (vsLinkBtn) {
      vsLinkBtn.href = "https://www.tiktok.com/@colicprotocol/video/7660020460431740173";
      vsLinkBtn.textContent = "Watch Settling & Burping Rhythm Video →";
    }
  }
}

async function showResult() {
  hide('analysisScreen');

  const type = getPrimaryType(scores);
  const R = RESULTS[type];

  subscribeToMailerLite(userName, userEmail, R.type, R.mailerliteField, 'completed');
  sendEvent('quiz_complete', { colic_type: R.type });

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
  document.getElementById('stickyType').textContent = R.type;

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

  paintCount();
  resultShown = true;
  show('resultScreen');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

/* ── OFFER BUTTONS ───────────────────────────────────────────────────────
   Two routes out of the offer card:
   goToProduct()  -> Gumroad checkout directly (tracked as 'blueprint')
   viewProduct()  -> /blueprint product page (tracked as 'blueprint_view')
   window.location.href rather than window.open, because in-app browsers
   (TikTok, Instagram) handle new tabs inconsistently. */
function goToProduct() {
  trackPathClick('blueprint');
  const type = getPrimaryType(scores);
  const R = RESULTS[type];
  sendEvent('blueprint_checkout_click', {
    colic_type: R.type,
    surface: 'quiz_result',
    transport_type: 'beacon'
  });
  const url = `${CFG.productUrl}?ref=${ASSESSMENT_ID}&wanted=true&utm_source=quiz&utm_medium=assessment&utm_campaign=${UTM_SOURCE}`;
  window.location.href = url;
}

function viewProduct() {
  trackPathClick('blueprint_view');
  const type = getPrimaryType(scores);
  const R = RESULTS[type];
  sendEvent('blueprint_view_click', {
    colic_type: R.type,
    surface: 'quiz_result',
    transport_type: 'beacon'
  });
  const url = `${CFG.productPageUrl}?ref=${encodeURIComponent(ASSESSMENT_ID)}` +
    `&utm_source=quiz&utm_medium=assessment_view&utm_campaign=${encodeURIComponent(UTM_SOURCE)}`;
  window.location.href = url;
}

function goToChecklist() {
  if (!resultShown) return; // the sticky bar must never act before a result exists
  trackPathClick('checklist');
  const type = getPrimaryType(scores);
  // Same-origin handoff: Midnight Protocol reads this so the parent isn't
  // asked for email and consent a second time. sessionStorage keeps the
  // email out of the URL and out of referrer headers.
  // ATTRIBUTION: the visitor's original UTMs already sit in sessionStorage
  // 'cp_utm' (captureUTMs above) and Midnight Protocol reads them from there.
  // The handoff link deliberately carries NO utm_* params, only its own
  // `handoff` param. utm_source=quiz here used to overwrite the real source
  // (instagram, tiktok...) in MailerLite and Supabase, label every Midnight
  // bridge purchase as quiz/result_page, and start a new GA4 campaign session.
  try {
    sessionStorage.setItem('cp_lead', JSON.stringify({ babyName: babyName,
      name: userName,
      email: userEmail,
      age: babyAgeWeeks,
      consent: true,
    }));
  } catch(e){}
  const url = `${CFG.checklistUrl}?type=${type}` +
    `&confidence=${getConfidencePct()}` +
    `&aid=${encodeURIComponent(ASSESSMENT_ID)}` +
    `&name=${encodeURIComponent(userName)}` +
    `&age=${encodeURIComponent(babyAgeWeeks != null ? babyAgeWeeks : '')}` +
    `&handoff=quiz_result`;
  window.location.href = url;
}

/* ── WHO USES THIS ASSESSMENT ────────────────────────────────────────── */
function renderPrevalenceBar(type) {
  const box = document.getElementById('prevalenceBox');
  const pct = PREVALENCE[type];
  box.innerHTML = `
    <div class="eyebrow-mini">Who uses this assessment</div>
    <p class="prevalence-note">About <strong>${pct} in 100</strong> parents who completed this assessment in September landed on ${RESULTS[type].type} as their closest fit. That describes the parents using this tool, not how common each pattern is in colic.</p>
    <div class="prevalence-track"><div class="prevalence-fill" style="width:${pct}%"></div></div>
    <div class="prevalence-labels"><span class="here">● ${RESULTS[type].type}, you're here</span><span>The other two patterns</span></div>
  `;
}

/* ── TRIED-ITEMS CALLBACK ────────────────────────────────────────────── */
function buildTriedFailureLine(type) {
  if (!triedItems.length) return null;

  const list = triedItems.length === 1
    ? triedItems[0]
    : triedItems.slice(0, -1).join(', ') + ' and ' + triedItems[triedItems.length - 1];

  const reasons = {
    GUT: `Trials have not shown that gas drops beat placebo, so short relief from them doesn't tell you whether they worked.`,
    NS: `Rocking, bouncing and sound can calm some babies for a few minutes and then stop working when they stop. Changing several things at once also makes it hard to tell what helped.`,
    FM: `Changing one feeding detail at a time, and writing down how the next few hours go, is the clearest way to see whether feeding is involved.`,
  };

  return `You told us you'd already tried <strong>${list}</strong>. ${reasons[type]}`;
}

/* ── PROFILE CARD ────────────────────────────────────────────────────── */
function buildProfileNarrative() {
  const feedingPhrase = {
    'Breastfed': 'breastfed',
    'Formula-fed': 'formula-fed',
    'Mixed': 'mixed breast and formula fed',
  }[feedingMethod] || 'feeding';

  let sentence = `${escHtml(userName)}, you told us about a ${babyAgeWeeks}-week-old who's ${feedingPhrase}`;

  if (triedItems.length) {
    const list = triedItems.length === 1
      ? triedItems[0]
      : triedItems.slice(0, -1).join(', ') + ' and ' + triedItems[triedItems.length - 1];
    const verb = triedItems.length === 1 ? "hasn't" : "haven't";
    sentence += `, and that <strong>${list}</strong> ${verb} been enough on ${triedItems.length === 1 ? 'its' : 'their'} own`;
  }

  sentence += `. Here's the starting point that fits best.`;
  return sentence;
}

/* ── ANSWER AUDIT ────────────────────────────────────────────────────── */
function buildAnswerAudit(type) {
  const feedingPhrase = {
    'Breastfed': 'breastfed',
    'Formula-fed': 'formula-fed',
    'Mixed': 'mixed breast and formula fed',
  }[feedingMethod] || null;

  const lines = [`Your baby is ${babyAgeWeeks} week${babyAgeWeeks === 1 ? '' : 's'} old.`];
  if (feedingPhrase) lines.push(`Your baby is ${feedingPhrase}.`);

  const seen = new Set(lines);
  typeReasons[type]
    .slice()
    .sort((a, b) => b.weight - a.weight)
    .forEach(r => {
      if (lines.length >= 6) return;
      if (seen.has(r.text)) return;
      seen.add(r.text);
      lines.push(r.text);
    });

  const items = lines.map(l => `<li>${l}</li>`).join('');

  return `
    <div class="audit-title">Why your answers point toward this pattern</div>
    <ul class="audit-list">${items}</ul>
    <p class="audit-close">Those answers are what moved your result toward this pattern.</p>
  `;
}

/* ── SCORE PANEL ─────────────────────────────────────────────────────── */
function renderScorePanel(s, primaryType) {
  const total = s.GUT + s.NS + s.FM;
  const pctOf = k => total > 0 ? Math.round((s[k] / total) * 100) : 0;
  const order = ['GUT', 'NS', 'FM'].slice().sort((a, b) => s[b] - s[a]);

  const rows = order.map(k => {
    const isPrimary = k === primaryType;
    return `
      <div class="score-row${isPrimary ? '' : ' is-secondary'}">
        <div class="score-row-head">
          <div class="score-name">${RESULTS[k].type}${isPrimary ? '<span class="primary-tag">Closest fit</span>' : ''}</div>
          <div class="score-val">${pctOf(k)}</div>
        </div>
        <div class="score-track"><div class="score-fill" data-pct="${pctOf(k)}"></div></div>
      </div>`;
  }).join('');

  const gap = pctOf(order[0]) - pctOf(order[1]);
  const closeCall = gap < 10
    ? ` Your top two are close, ${RESULTS[order[0]].type} and ${RESULTS[order[1]].type}. Start with the first. If nothing shifts after a fair trial, look at the second.`
    : '';

  const box = document.getElementById('scorePanel');
  box.innerHTML = `
    <div class="score-panel-head">
      <div class="score-panel-title">How your answers lined up</div>
      <div class="score-panel-scale">Scale: 0&ndash;100</div>
    </div>
    ${rows}
    <div class="score-panel-foot">These reflect your answers, not a diagnosis.${closeCall}</div>
  `;

  requestAnimationFrame(() => {
    setTimeout(() => {
      box.querySelectorAll('.score-fill').forEach(f => {
        f.style.width = f.getAttribute('data-pct') + '%';
      });
    }, 150);
  });
}

/* ── QUICK ACTION ────────────────────────────────────────────────────── */
function renderQuickAction(type) {
  const R = RESULTS[type];
  const qs = typeof R.quickSteps === 'function' ? R.quickSteps(feedingMethod) : R.quickSteps;
  const stepsHtml = qs.map(s => `<li>${s}</li>`).join('');
  document.getElementById('quickAction').innerHTML = `
    <div class="qa-eyebrow">Free, right now</div>
    <div class="qa-title">${R.quickTitle}</div>
    <ol class="qa-steps">${stepsHtml}</ol>
    <p class="qa-note">These are a first move, not a fix. No technique works every time. The full list, with how strong the evidence is for each step, is in "What to try tonight" below.</p>
  `;
}

/* ── REFRAME ─────────────────────────────────────────────────────────── */
function buildReframeLine(type, name) {
  return `What you just tried can help tonight. It may not change tomorrow evening, because colic usually peaks around week 6 and eases by about 3 to 4 months, and nobody can promise a date. That is a long stretch on little sleep, and it is not you failing. <strong>Trying one change at a time and keeping a short log is the cheapest way to see a pattern, with or without the Blueprint.</strong>`;
}

/* ── WHAT THE BLUEPRINT OFFERS, IN THREE LINES ───────────────────────── */
function buildAngleStrip(type) {
  const a = RESULTS[type].angles;
  return `
    <div class="angle-row"><div class="angle-tag">Solution</div><div class="angle-text">${a.solution}</div></div>
    <div class="angle-row"><div class="angle-tag">Shortcut</div><div class="angle-text">${a.shortcut}</div></div>
    <div class="angle-row"><div class="angle-tag">Feeling</div><div class="angle-text">${a.feeling}</div></div>
  `;
}

/* ── GUARANTEE ───────────────────────────────────────────────────────────
   Assessment-volume proof only. Nothing here implies buyers or refunds. */
function buildGuaranteeProof(type, name) {
  const countSpan = `<span class="assessment-count-value">${shownCount()}</span>+`;
  return `${countSpan} assessments have been completed. About <strong>${PREVALENCE[type]} in 100</strong> of September's completers landed on ${RESULTS[type].type} too, so this isn't an unusual read.`;
}

function renderGuaranteeCard(type, name) {
  document.getElementById('guaranteeCard').innerHTML = `
    <p class="guarantee-proof">${buildGuaranteeProof(type, name)}</p>
    <div class="guarantee-card-label">72-Hour Guarantee</div>
    <p class="gc-body">If it doesn't produce a meaningful shift in 72 hours, reply and I'll make it right. <strong>You keep the Blueprint either way.</strong> The 72 hours covers the first changes, like feeding, positioning and soothing. It is not a promise about any single product.</p>
  `;
}

/* ── PATH-CLICK TRACKING ─────────────────────────────────────────────────
   path_clicked values: 'checklist' | 'blueprint' | 'blueprint_view' | 'dm'.
   subscribe.js must list each of these or it drops the value. */
function trackPathClick(path) {
  try {
    try {
      localStorage.setItem('colic_path_clicked', path);
    } catch(e){}
    const type = getPrimaryType(scores);
    const R = RESULTS[type] || {};
    const payload = JSON.stringify({
      email: userEmail,
      name: userName,
      website: '',
      consent: !!userConsent,
      colic_type: R.type || '',
      colic_type_detail: R.mailerliteField || '',
      feeding_method: feedingMethod || 'Not specified',
      baby_age_weeks: babyAgeWeeks,
      baby_name: babyName,
      confidence_pct: getConfidencePct(),
      tried_items: triedItems.join(', '),
      group_id: CFG.group_id,
      assessment_id: ASSESSMENT_ID,
      lead_source: UTM_SOURCE,
      quiz_status: 'completed',
      quiz_version: '2.2',
      red_flag: redFlagStatus,
      path_clicked: path,
      purchase_status: 'pending',
      ...getStoredUTMs(),
    });

    let sent = false;
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      try {
        const blob = new Blob([payload], { type: 'application/json' });
        sent = navigator.sendBeacon('/api/subscribe', blob);
      } catch (e) {}
    }

    if (!sent && typeof fetch === 'function') {
      fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: payload,
      }).catch(e => console.warn('Path click tracking failed silently:', e));
    }
  } catch(e) {
    console.warn('trackPathClick error:', e);
  }
}

/* ── DM-TO-VINCENT PATH ──────────────────────────────────────────────── */
function buildDMMessage(R) {
  const feeding = (feedingMethod || 'not specified').toLowerCase();
  let msg = `Hi Vincent, I just completed the Colic Protocol assessment (${ASSESSMENT_ID}). My closest fit was ${R.type}. My baby is ${babyAgeWeeks} weeks old and ${feeding}.`;
  if (triedItems.length) {
    msg += ` I've already tried ${triedItems.join(', ')}, without much luck.`;
  }
  msg += ` I'd like to talk through what this could mean.`;
  return msg;
}

async function copyDMMessage() {
  const text = document.getElementById('dmMessageBox').textContent;
  const btn = document.getElementById('dmCopyBtn');
  const original = btn.textContent;
  let copied = false;

  try {
    await navigator.clipboard.writeText(text);
    copied = true;
  } catch(e) {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      copied = document.execCommand('copy');
      document.body.removeChild(ta);
    } catch(e2) { copied = false; }
  }

  btn.textContent = copied ? 'Copied ✓' : 'Select the text above';
  setTimeout(() => { btn.textContent = original; }, 2200);
}

function goToDM() {
  trackPathClick('dm');
  window.location.href = CFG.dmUrl;
}

/* ── SCROLL POLISH ───────────────────────────────────────────────────── */
if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const banner = document.getElementById('resultBanner');
  const stickyBar = document.getElementById('stickyBar');
  if (banner && stickyBar) {
    const bannerObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        stickyBar.classList.toggle('show', resultShown && !entry.isIntersecting);
      });
    }, { threshold: 0 });
    bannerObserver.observe(banner);
  }
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
