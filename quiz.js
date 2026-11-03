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
  checklistUrl: 'midnight-protocol.html',
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
const COUNT_FLOOR = 600;
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
  { text: "Fever of 38°C / 100.4°F or higher", short: "fever" },
  { text: "Green or yellow-green vomit, or forceful vomiting after most feeds", short: "green or forceful vomiting" },
  { text: "Blood in the stool", short: "blood in stool" },
  { text: "Poor feeding or refusing feeds", short: "poor feeding" },
  { text: "Unusually sleepy, limp, or very hard to wake", short: "sleepy, limp or hard to wake" },
  { text: "Trouble breathing, or blue lips or face", short: "breathing trouble" },
  { text: "A hair wrapped tightly around a finger, toe, or genitals", short: "hair tourniquet" },
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
  {
    q: "When does your baby cry most intensely?",
    sub: "Think about the pattern over the last few days. Pick the one that fits most nights.",
    single: true,
    opts: [
      ["Consistently in the evening, usually 5PM to midnight, regardless of feeding",      {GUT:0,NS:3,FM:0}, null, null, "The crying is concentrated in the evening."],
      ["During or shortly after feeding, often arching away from the breast or bottle",    {GUT:2,NS:0,FM:2}, null, null, "You reported repeated feeding-related discomfort."],
      ["Seemingly randomly throughout the day with no clear pattern",                      {GUT:1,NS:1,FM:1}, null, null, "The crying doesn't follow an obvious time-of-day pattern."],
      ["Consistently 1 to 3 hours after a feed, like clockwork",                           {GUT:1,NS:0,FM:4}, null, null, "The crying follows a consistent delay after feeds."],
    ]
  },
  {
    q: "What does your baby's cry sound like?",
    sub: "Pick the closest match.",
    single: true,
    opts: [
      ["High-pitched, continuous, and intense from the very first second, with no build-up", {GUT:0,NS:4,FM:0}, null, null, "The cry starts high-pitched and intense with no build-up."],
      ["Starts softer and escalates over 10 to 15 minutes into inconsolable",               {GUT:2,NS:1,FM:0}, null, null, "The cry builds gradually rather than starting at full intensity."],
      ["Comes in waves: crying, pause, crying again, with legs pulled to chest",            {GUT:3,NS:0,FM:0}, null, null, "The crying comes in waves, with legs pulled toward the chest."],
      ["Grunting, straining, or gulping sounds, especially in the first few minutes after a feed", {GUT:1,NS:0,FM:3}, null, null, "You noted grunting or straining sounds after feeds."],
    ]
  },
  {
    q: "What does your baby's body do during a crying episode?",
    sub: "Physical signs can hint at where to start. Pick the most common one.",
    single: true,
    opts: [
      ["Legs pulled toward the chest, abdomen visibly tight or distended",                 {GUT:4,NS:0,FM:0}, null, null, "The abdomen appears tight or distended during episodes."],
      ["Full-body tension: arching back, fists clenched, face red and straining",          {GUT:0,NS:4,FM:0}, null, null, "The body shows full tension, arching, and clenched fists."],
      ["Pulls off the breast or bottle repeatedly, coughs or sputters mid-feed",           {GUT:0,NS:0,FM:4}, null, null, "Your baby pulls off or coughs mid-feed."],
      ["Inconsolable regardless of position, nothing seems to help at all",                {GUT:1,NS:1,FM:1}, null, null, "Nothing about position changes how consolable your baby is."],
    ]
  },
  {
    q: "What has already been tried with little or no effect?",
    sub: "Knowing what you've already tried helps avoid repeating it.",
    opts: [
      ["Gripe water and simethicone gas drops, tried multiple brands",                     {GUT:3,NS:0,FM:0}, null, "gripe water or gas drops"],
      ["Rocking, bouncing, swinging: baby calms briefly then starts again",                {GUT:0,NS:3,FM:0}, null, "rocking, bouncing, or swinging"],
      ["A sound machine or app, didn't help or only helped briefly",                       {GUT:0,NS:1,FM:0}, null, "a sound machine"],
      ["Changing feeding positions or how often you feed, without a real difference",      {GUT:1,NS:0,FM:3}, null, "changing feeding position or frequency"],
    ]
  },
  {
    q: "How does your baby typically respond when being held during a crying episode?",
    sub: "Pick the closest match.",
    single: true,
    opts: [
      ["Calms somewhat when held face-down with gentle pressure on the abdomen",           {GUT:3,NS:0,FM:0}, null, null, "Face-down pressure holding brings some relief."],
      ["Calms briefly when moved rhythmically, but starts again when movement stops",      {GUT:0,NS:4,FM:0}, null, null, "Rhythmic movement calms your baby only while it continues."],
      ["Wants to stay upright after feeds, unsettled lying flat or being reclined",        {GUT:0,NS:0,FM:4}, null, null, "Your baby wants to stay upright after feeds."],
      ["Inconsistent: sometimes holding helps, sometimes it makes things worse",           {GUT:1,NS:1,FM:1}, null, null, "Holding helps inconsistently."],
    ]
  },
  {
    q: "What does your baby's stool look like?",
    sub: "Stool can hint at gut-related causes. Pick the one that's typical right now.",
    single: true,
    opts: [
      ["Green, frothy, or mucousy, sometimes with a strong smell",                         {GUT:3,NS:0,FM:0}, null, null, "Stool has been green, frothy, or mucousy."],
      ["Normal yellow seedy (breastfed) or tan (formula), no stool changes noted",         {GUT:0,NS:1,FM:1}],
      ["Infrequent, less than once a day, with apparent straining",                        {GUT:2,NS:0,FM:0}, null, null, "Bowel movements have been infrequent, with straining."],
      ["Not sure, haven't noticed a pattern",                                              {GUT:0,NS:0,FM:0}],
    ]
  },
  {
    q: "What is your baby's feeding situation?",
    sub: "Feeding method changes which steps make sense. Pick one.",
    single: true,
    opts: [
      ["Exclusively breastfed",                                                            {GUT:1,NS:0,FM:0}, "Breastfed"],
      ["Formula-fed, from birth or switched recently",                                     {GUT:0,NS:0,FM:2}, "Formula-fed", null, "Feeding is formula, from birth or a recent switch."],
      ["Mixed feeding, breast and formula",                                                {GUT:0,NS:0,FM:1}, "Mixed"],
      ["I've eliminated dairy from my diet already and the crying hasn't changed",         {GUT:0,NS:1,FM:1}, "Breastfed", null, "Dairy has already been eliminated with no change."],
    ]
  },
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

/* ── SECURE SUBSCRIPTION ─────────────────────────────────────────────── */
async function subscribeToMailerLite(name, email, colcType, detail, status) {
  if (suppressSubscribe) return;
  const confidencePct = getConfidencePct();
  const utm = getStoredUTMs();

  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        baby_name:         babyName,
        feeding_method:    feedingMethod || 'Not specified',
        tried_items:       triedItems.join(', '),
        group_id:          CFG.group_id,
        assessment_id:     ASSESSMENT_ID,
        lead_source:       UTM_SOURCE,
        quiz_status:       status,
        quiz_version:      '2.2',
        red_flag:          redFlagStatus,
        purchase_status:   'pending',
        ...utm,
      })
    });
  } catch(e) {
    console.warn('Subscribe proxy silent error:', e);
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

  const all = RED_FLAG_OPTIONS.map(o => o.text).concat(['None of these']);
  all.forEach((text, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.setAttribute('role', 'checkbox');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');
    div.innerHTML = `<span class="opt-text">${text}</span><span class="opt-check" aria-hidden="true"></span>`;
    div.onclick = () => toggleRedFlag(i, div);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRedFlag(i, div); } };
    box.appendChild(div);
  });
  applyLogHint(qIndex);
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
  document.getElementById('qCount').textContent = `${qIndex + 1} / ${QUESTIONS.length}`;
  document.getElementById('progressFill').style.width = `${(qIndex / QUESTIONS.length) * 100}%`;
  document.getElementById('qText').textContent = q.q;
  document.getElementById('qSub').textContent  = q.sub;

  const hintEl = document.getElementById('multiHint');
  if (hintEl) hintEl.textContent = q.single ? 'Select one' : 'Select all that apply';

  const box = document.getElementById('optionsBox');
  box.innerHTML = '';
  selectedMap.clear();

  const btn = document.getElementById('continueBtn');
  btn.classList.remove('visible');
  btn.textContent = 'Continue';

  q.opts.forEach((o, i) => {
    const div = document.createElement('div');
    div.className = 'option';
    div.setAttribute('role', q.single ? 'radio' : 'checkbox');
    div.setAttribute('aria-checked', 'false');
    div.setAttribute('tabindex', '0');
    div.innerHTML = `<span class="opt-text">${o[0]}</span><span class="opt-check" id="chk${i}" aria-hidden="true"></span>`;
    div.style.animation = `rise .35s ${i * .07}s ease both`;
    div.onclick = () => toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null, o[4] || null); } };
    box.appendChild(div);
  });
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

async function showResult() {
  hide('analysisScreen');

  const type = getPrimaryType(scores);
  const R = RESULTS[type];

  subscribeToMailerLite(userName, userEmail, R.type, R.mailerliteField, 'completed');

  try {
    localStorage.setItem('colic_type', type);
    localStorage.setItem('colic_name', userName);
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
  const url = `${CFG.productUrl}?ref=${ASSESSMENT_ID}&wanted=true&utm_source=quiz&utm_medium=assessment&utm_campaign=${UTM_SOURCE}`;
  window.location.href = url;
}

function viewProduct() {
  trackPathClick('blueprint_view');
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
    const type = getPrimaryType(scores);
    const R = RESULTS[type];
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true, // the page navigates away right after this call
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        website: '',
        consent: !!userConsent,
        colic_type: R.type,
        colic_type_detail: R.mailerliteField,
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
      }),
    }).catch(e => console.warn('Path click tracking failed silently:', e));
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
