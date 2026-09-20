
/* ══════════════════════════════════════════════════════════════════════
   CONFIG
   API key is NEVER here. All email subscriptions go through /api/subscribe,
   a server-side proxy that reads MailerLite credentials from environment
   variables. group_id below is the existing quiz-leads group.
   ══════════════════════════════════════════════════════════════════════ */
const CFG = {
  group_id: '190431733303215887',
  productUrl: 'https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint',
  // Confirmed against the real site (index.html, checklist.html use
  // bare relative filenames throughout, e.g. href="quiz.html", not
  // clean routes) — this was a guess last pass, now corrected.
  checklistUrl: 'midnight-protocol.html',
  // Plain ig.me links (no connected Messaging API app + Icebreakers)
  // don't support a pre-filled composer message, only a `ref` param
  // delivered via webhook to a bot. So this is copy-then-paste, not
  // autofill — see copyDMMessage()/goToDM() below.
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

/* ── ASSESSMENT COUNT, DATABASE-BACKED ────────────────────────────────────
   /api/stats reads a real count from Supabase (see functions/api/stats.js)
   with a floor of 250, the honest MailerLite-sourced figure as of this
   build, confirm and update that floor if it's re-verified. The
   Supabase mirror only starts counting from whenever SUPABASE_URL /
   SUPABASE_SERVICE_KEY get set as secrets, it does not retroactively
   contain the historical MailerLite total unless that's backfilled
   separately, that's why this is a floor (max of live vs 250), not the
   raw live number, showing "3 parents have completed this" on launch
   day would be a real regression, not just an ugly number. Every
   element with class="assessment-count-value" gets updated from the
   same fetch, landing-screen trust strip and the result-page guarantee
   card both read this one value, no separate copies to keep in sync. */
let ASSESSMENT_COUNT_DISPLAY = 250;
async function loadAssessmentCount() {
  try {
    const res = await fetch('/api/stats');
    if (res.ok) {
      const data = await res.json();
      if (Number.isFinite(data.completed) && data.completed > 0) {
        ASSESSMENT_COUNT_DISPLAY = Math.max(data.completed, ASSESSMENT_COUNT_DISPLAY);
      }
    }
  } catch(e) {
    // Silent fallback, the floor number is already showing in markup.
  }
  document.querySelectorAll('.assessment-count-value').forEach(el => {
    el.textContent = ASSESSMENT_COUNT_DISPLAY;
  });
}
loadAssessmentCount();

/* ══════════════════════════════════════════════════════════════════════
   QUESTIONS
   Each option: [display text, score weights {GUT, NS, FM}, feeding tag
   (Q7 only, null elsewhere), tried tag (Q4 only, null elsewhere)]

   MIGRATION (this version): Acoustic Environment Overload is retired as
   a diagnostic bucket per the standing taxonomy decision (Master Doc
   v12). It doesn't disappear as content, brown noise still lives inside
   the Nervous System steps below, it just stops being something a baby
   gets sorted into. Feeding Mechanics takes the third slot. The old
   acoustic-diagnostic options (Q1D, Q2D, Q3C, Q5C) are replaced with
   real feeding-mechanics signal, not relabeled AC options, since "worse
   in noisy environments" and "swallows air on a steep bottle angle" are
   not the same underlying claim and scoring one as a proxy for the
   other would have quietly kept the retired bucket alive under a new
   name.

   FIX (this version): Q7 previously gave three of its four options a
   free {GUT:1} regardless of which one she picked (only the "eliminated
   dairy, no change" option had been corrected in the prior pass), so
   almost every respondent picked up a GUT point on this question no
   matter what her baby's feeding situation actually was. Formula and
   mixed feeding now carry FM signal instead of automatic GUT signal,
   since bottle-feeding is where the paced-feeding/air-intake mechanism
   actually applies. A respondent answering consistently toward one type
   clears GUT 19 / NS 20 / FM 21 (best-per-question sum), and the sum of
   every option across all seven questions runs GUT 29 / NS 25 / FM 28,
   verified by script, not by hand, before shipping this table. Close
   enough across all three that no type is structurally favored the way
   GUT was before this pass.

   FIX (confidence audit): the dashboard's confirmed finding was average
   quiz confidence sitting at 43-51% across all three types, 74-81% of
   assessments landing in the 40-59% band. The root cause traced back
   here, not to the confidence formula itself: Q1, Q2, Q3, and Q6 were
   coded as multi-select (`toggleOption`'s default, no `single` flag) even
   though each one asks for a single real-world state, not several at
   once, a baby has ONE dominant crying-time pattern, ONE dominant cry
   sound, ONE dominant physical presentation during crying, and ONE
   actual stool appearance. Multi-select on these let genuinely mixed
   answers (which most babies have to some degree) split points across
   two or three systems within a single question, which mechanically
   suppresses the dominant category's share of the total regardless of
   how clearly the underlying pattern actually points one way. Switched
   these four to single:true, matching Q7's existing pattern. Q4 (what's
   already been tried) and Q5 (response when held) stay multi-select on
   purpose, both can genuinely be true of the same baby at once. This
   raises confidence honestly, by concentrating the signal the question
   was already collecting, not by changing the underlying formula to
   produce a more flattering number from the same diluted input.
   ══════════════════════════════════════════════════════════════════════ */
const QUESTIONS = [
  {
    q: "When does your baby cry most intensely?",
    sub: "Think about the pattern over the last few days. Pick the one that fits most nights.",
    single: true,
    opts: [
      ["Consistently in the evening — usually 5PM to midnight, regardless of feeding",      {GUT:0,NS:3,FM:0}],
      ["During or shortly after feeding — often arching away from the breast or bottle",    {GUT:2,NS:0,FM:2}],
      ["Seemingly randomly throughout the day with no clear pattern",                       {GUT:1,NS:1,FM:1}],
      ["Consistently 1 to 3 hours after a feed, like clockwork",                            {GUT:1,NS:0,FM:4}],
    ]
  },
  {
    q: "What does your baby's cry sound like?",
    sub: "How a cry sounds carries real diagnostic information. Pick the closest match.",
    single: true,
    opts: [
      ["High-pitched, continuous, and intense from the very first second — no build-up",   {GUT:0,NS:4,FM:0}],
      ["Starts softer and escalates over 10–15 minutes into inconsolable",                 {GUT:2,NS:1,FM:0}],
      ["Comes in waves — crying, pause, crying again — with legs pulled to chest",         {GUT:3,NS:0,FM:0}],
      ["Grunting, straining, or gulping sounds, especially in the first few minutes after a feed", {GUT:1,NS:0,FM:3}],
    ]
  },
  {
    q: "What does your baby's body do during a crying episode?",
    sub: "Physical signals during crying point to specific root causes. Pick the most common one.",
    single: true,
    opts: [
      ["Legs pulled toward the chest, abdomen visibly tight or distended",                 {GUT:4,NS:0,FM:0}],
      ["Full-body tension — arching back, fists clenched, face red and straining",         {GUT:0,NS:4,FM:0}],
      ["Pulls off the breast or bottle repeatedly, coughs or sputters mid-feed",            {GUT:0,NS:0,FM:4}],
      ["Inconsolable regardless of position — nothing seems to help at all",               {GUT:1,NS:1,FM:1}],
    ]
  },
  {
    q: "What has already been tried with little or no effect?",
    sub: "Failed interventions are as diagnostically useful as symptoms.",
    opts: [
      ["Gripe water and simethicone gas drops — tried multiple brands",                    {GUT:3,NS:0,FM:0}, null, "gripe water or gas drops"],
      ["Rocking, bouncing, swinging — baby calms briefly then starts again",               {GUT:0,NS:3,FM:0}, null, "rocking, bouncing, or swinging"],
      ["White noise machine — didn't help or only helped briefly",                         {GUT:0,NS:1,FM:0}, null, "a white noise machine"],
      ["Changing feeding positions or how often you feed — didn't make a real difference", {GUT:1,NS:0,FM:3}, null, "changing feeding position or frequency"],
    ]
  },
  {
    q: "How does your baby typically respond when being held during a crying episode?",
    sub: "",
    opts: [
      ["Calms somewhat when held face-down with gentle pressure on the abdomen",           {GUT:3,NS:0,FM:0}],
      ["Calms briefly when moved rhythmically — but starts again when movement stops",     {GUT:0,NS:4,FM:0}],
      ["Wants to stay upright after feeds — unsettled lying flat or being reclined",        {GUT:0,NS:0,FM:4}],
      ["Inconsistent — sometimes holding helps, sometimes it makes things worse",          {GUT:1,NS:1,FM:1}],
    ]
  },
  {
    q: "What does your baby's stool look like?",
    sub: "Gut presentation provides direct microbiome data. Pick the one that's typical right now.",
    single: true,
    opts: [
      ["Green, frothy, or mucousy — sometimes with a strong smell",                        {GUT:3,NS:0,FM:0}],
      ["Normal yellow seedy (breastfed) or tan (formula) — no stool changes noted",       {GUT:0,NS:1,FM:1}],
      ["Infrequent — less than once a day — with apparent straining",                      {GUT:2,NS:0,FM:0}],
      ["Not sure — haven't noticed a pattern",                                             {GUT:0,NS:0,FM:0}],
    ]
  },
  {
    q: "What is your baby's feeding situation?",
    sub: "Feeding method affects which interventions are most effective. Pick one.",
    single: true,
    opts: [
      ["Exclusively breastfed",                                                            {GUT:1,NS:0,FM:0}, "Breastfed"],
      ["Formula-fed — has been from birth or switched recently",                           {GUT:0,NS:0,FM:2}, "Formula-fed"],
      ["Mixed feeding — breast and formula",                                               {GUT:0,NS:0,FM:1}, "Mixed"],
      ["I've eliminated dairy from my diet already and the crying hasn't changed",         {GUT:0,NS:1,FM:1}, "Breastfed"],
    ]
  },
];

/* ══════════════════════════════════════════════════════════════════════
   RESULTS
   ══════════════════════════════════════════════════════════════════════ */
/* ══════════════════════════════════════════════════════════════════════
   RESULTS
   Two jobs per type, kept deliberately separate:
   1. The diagnostic narrative ("why this pattern points here"): seeing,
      why, rulesOut, steps, monitor, bridgeLine. This is the free,
      educational half, it has to stand on its own even if she never
      looks at the offer below it.
   2. The offer ("why move from tonight's protocol to the Blueprint"):
      forBaby, whyTipsFailed, whatsDifferent, protocol, trustVincent,
      evidence. Answers a different question than section 1, "what
      should I try tonight" versus "what do I do when tonight's
      solution isn't enough", so it isn't just section 1 repeated with
      a price tag on it.
   `evidence` is a function of feedingMethod on every type, even where
   the answer doesn't actually change, so showResult() can call
   R.evidence(feedingMethod) uniformly instead of branching on type.
   ══════════════════════════════════════════════════════════════════════ */
const RESULTS = {
  GUT: {
    type: "Gut Microbiome Imbalance",
    subtitle: "Most Likely Pattern",
    emoji: "🦠",
    bannerClass: "gut-banner",
    stepClass: "gut-sn",
    prevalence: "The most common primary colic driver, present in approximately 60 to 70% of colicky infants.",

    seeing: "What you're probably seeing tonight: crying that comes in waves, legs pulled up toward a tight or distended belly, and some relief right after a big burp or a bowel movement, then the same pattern building again a few hours later.",
    why: "Colicky infants with this presentation show a consistent pattern: reduced Lactobacillus bacteria and elevated gas-producing bacteria in the gut microbiome. This imbalance creates a fermentation loop that generates pain, bloating, and the inflammation driving each crying episode. Single-symptom remedies like simethicone address the gas as a mechanical output, they cannot touch the microbial environment producing it, which is why gas drops fail consistently in clinical trials.",
    rulesOut: "This pattern is less consistent with a pure nervous-system overload, which usually starts high-pitched and immediate rather than building in waves, or with feeding mechanics alone, which tends to track tightly with time-since-feed rather than showing up with visible bloating and stool changes. That doesn't rule out a second system being involved, it just tells you which one to address first.",
    steps: [
      {title: "Start L. reuteri DSM 17938 immediately", body: "This is the specific strain, not a generic probiotic. Savino et al., Pediatrics 2010: 74% reduction in daily crying time by Day 21 in breastfed infants. The product is BioGaia Protectis Baby Drops. 5 drops daily, added to expressed breast milk or formula cooled to body temperature. Begin tonight."},
      {title: "Run the Tiger Hold for acute episodes", body: "Face-down across your forearm. Baby's belly on the muscle of your forearm, head resting in your palm. Pulse at 60 beats per minute, forward and back, not side to side. This moves trapped gas using abdominal pressure and deactivates the Moro startle reflex at the same time. Hold for a minimum of 5 minutes before assessing."},
      {title: "Brown noise at 60 to 65 dB before you pick them up", body: "Sound first, touch second. A dysregulated nervous system cannot receive touch as calming, even when gut discomfort is the primary driver. Activate brown noise at 60 to 65 decibels, minimum 7 feet from baby's head, for 30 seconds before the Tiger Hold."},
    ],
    monitor: "Watch for whether the crying eases within 30 to 60 minutes of a bowel movement or a big burp, that link is the confirming sign for this pattern. If nothing changes regardless of gas or stool, or if you see blood in the stool, projectile vomiting, or your baby isn't gaining weight as expected, treat that as a signal to talk to your pediatrician directly rather than continuing to test home interventions.",
    bridgeLine: (name) => `${name}, that's the pattern. If you want the complete management system instead of continuing to test individual techniques one at a time, that's what the Calm Baby Blueprint is for.`,

    forBaby: "Gas and bloating between feeds, relief after a burp, gripe water that hasn't held.",
    whyTipsFailed: "Gas drops have failed every randomized controlled trial run against them. Gripe water has never passed one either. Both treat the gas bubble, not the microbial imbalance producing it, which is why the relief never lasts more than a few minutes.",
    whatsDifferent: "Not another single remedy. A sequenced protocol: the exact probiotic strain and dose calibrated to how your baby feeds, paired with the physical technique that moves gas mechanically, run in the order that actually matters.",
    protocol: [
      "Diagnostic decision tree, know your baby's primary system before applying any intervention",
      "Complete gut reset protocol with exact L. reuteri DSM 17938 dosing for breastfed and formula-fed infants",
      "Tiger Hold, ILU massage, and vagus nerve sequence, technique videos included",
      "60-minute brown noise soundscape calibrated to womb frequencies (Bonus 2)",
      "Bloom Baby Tracker PWA, one-tap logging at 3AM to identify trigger patterns (Bonus 1)",
      "Cry Decoder Masterclass, train your ear to distinguish gut pain from nervous system cries (Bonus 3)",
    ],
    trustVincent: "Vincent is an epidemiologist, trained to read and weigh population-level research, not a pediatrician or a gastroenterologist. That's what the credential is actually for here: separating L. reuteri DSM 17938, the one strain with real trial data, from the dozens of generic probiotics riding on the word \"probiotic\" alone. He ran that same process on his own daughter Zion's colic first.",
    evidence: (feeding) => (feeding === 'Formula-fed' || feeding === 'Mixed')
      ? "The original 2010 trial (Savino et al., Pediatrics) was run in exclusively breastfed infants, so it isn't your baby's direct evidence and isn't cited to you as such. For bottle-fed and mixed-fed babies, the Blueprint's dosing instead draws on the broader 2020 systematic reviews (BMJ Open, Acta Paediatrica) covering the wider trial base, calibrated to feeding method."
      : "Savino et al., Pediatrics 2010: a randomized trial in exclusively breastfed infants, 74% reduction in daily crying by Day 21. Two independent systematic reviews in 2020 (BMJ Open, Acta Paediatrica) reached the same conclusion across the wider evidence base.",
    ctaBtnText: "Start the Gut Reset Protocol Tonight — $47",
    mailerliteField: "Gut Microbiome Primary",
    quickTitle: "Do this in the next 10 minutes",
    quickSteps: [
      "Warm 5 drops of L. reuteri DSM 17938 (BioGaia Protectis) to body temperature, mixed into expressed breast milk or formula.",
      "Give it now, don't wait for the next scheduled feed.",
      "While it starts working, run the Tiger Hold for 5 minutes to help move what's already trapped.",
    ],
    angles: {
      solution: "The exact strain, dose, and timing that address the microbial imbalance itself, not another gas drop treating the symptom on top of it.",
      shortcut: "Skip the rounds of gripe water and simethicone most parents cycle through before finding what the trials actually support.",
      feeling: "The gas stops being a mystery, and so does what to do about it.",
    },
  },

  NS: {
    type: "Nervous System Dysregulation",
    subtitle: "Most Likely Pattern",
    emoji: "⚡",
    bannerClass: "ns-banner",
    stepClass: "ns-sn",
    prevalence: "Present as the primary driver in approximately 20 to 30% of colic cases, and frequently missed.",

    seeing: "What you're probably seeing tonight: crying that's high-pitched and intense almost from the first second, a body that goes rigid, fists clenched, back arching, and a baby who seems to escalate the more you try rather than settle.",
    why: "The prefrontal cortex, responsible for emotional regulation, is not functional at 6 weeks. There is no neurological mechanism for self-soothing yet. When your baby's cortisol spikes during a crying episode, the only way it comes down is through external co-regulation. The pattern you're seeing is a nervous system crisis, not primarily a gut problem, and applying gut interventions to a nervous system presentation typically delays resolution by weeks rather than speeding it up.",
    rulesOut: "This pattern is less consistent with gut discomfort alone, which usually shows visible bloating, comes in waves, and eases after gas or a bowel movement, or feeding mechanics alone, which tracks with time-since-feed more than with how fast stimulation escalates things. A nervous system pattern can still have gut or feeding issues layered underneath it, this just tells you which one to address first.",
    steps: [
      {title: "Sound before touch, always", body: "Brown noise at 60 to 65 decibels, minimum 7 feet from baby's head. Activate it 30 seconds before you pick your baby up, not after. The womb environment is brown noise, not white noise, and this signals neurological safety before any additional sensory input arrives."},
      {title: "Tiger Hold at exactly 60 BPM, pulse, don't rock", body: "Face-down across your forearm. 60 beats per minute rhythmic pulse, forward and back. This specific rhythm matches a resting heartbeat and directly deactivates the Moro startle reflex keeping your baby's nervous system in a threat state. Rocking at an irregular pace doesn't achieve the same thing."},
      {title: "Warm dim light, never darkness", body: "Darkness increases cortisol in newborns. Use warm amber light at low intensity instead of turning lights off. After brown noise and the Tiger Hold are already in place, dim and warm the light as the third step, not the first."},
    ],
    monitor: "Watch for whether the crying responds faster when you catch it in the first 30 seconds versus letting it build first, that responsiveness to early intervention is the confirming sign. If your baby seems inconsolable regardless of timing, feels unusually stiff or unusually floppy, or the pattern comes with very poor feeding or weight gain, that's worth a direct conversation with your pediatrician rather than more soothing attempts.",
    bridgeLine: (name) => `${name}, you haven't been soothing incorrectly, you've been soothing out of sequence. If you want the complete management system instead of testing that sequence by trial and error, that's what the Calm Baby Blueprint is for.`,

    forBaby: "High-pitched crying from second one, a rigid body, soothing that works briefly then stops.",
    whyTipsFailed: "By night three, most parents start adding more, more bouncing, more sound, more movement, hoping something eventually lands. For a dysregulated nervous system, more input usually means more dysregulation, not less. The instinct to do more is completely understandable. It's also usually backwards.",
    whatsDifferent: "Not a single technique. A timing framework: the exact sequence (sound, then touch, then light), how long to hold each layer before moving to the next, and when to cycle back if it isn't landing, calibrated to a nervous system that can't yet regulate itself.",
    protocol: [
      "The Sound → Touch → Light timing framework with assessment checkpoints at each stage",
      "Tiger Hold with 60 BPM calibration, technique breakdown with rhythm guidance",
      "Cry Decoder Masterclass, distinguish the nervous system cry from gut pain in real time (Bonus 3)",
      "60-minute brown noise soundscape engineered to womb frequencies, use it tonight (Bonus 2)",
      "Parent regulation section, your own cortisol transmits through touch, regulate yourself first",
      "Bloom Baby Tracker PWA, log what's working at 3AM without turning on a light (Bonus 1)",
    ],
    trustVincent: "Vincent is an epidemiologist, trained to read and weigh population-level developmental research, not a pediatrician. That's what the credential is actually for here: separating what's established about newborn cortisol regulation and the Moro startle reflex from the generic soothing advice that ignores both. He ran that same process on his own daughter Zion's colic first.",
    evidence: () => "This isn't from one single colic trial the way the gut protocol is. Newborn cortisol co-regulation and the Moro startle reflex are established developmental neuroscience, applied here to a specific colic sequence, not a single study's headline number. The Sound → Touch → Light order follows directly from that physiology.",
    ctaBtnText: "Start the Nervous System Protocol Tonight — $47",
    mailerliteField: "Nervous System Primary",
    quickTitle: "Do this in the next 10 minutes",
    quickSteps: [
      "Turn on brown noise at 60 to 65 dB, at least 7 feet from her head.",
      "Wait 30 seconds before you pick her up, sound first, touch second.",
      "Lay her face-down along your forearm and pulse gently at 60 beats a minute.",
    ],
    angles: {
      solution: "The sequence that actually brings a dysregulated nervous system back down, sound then touch then light, not another single technique tested alone.",
      shortcut: "Skip the nights most parents spend cycling through soothing methods in the wrong order before finding one that holds.",
      feeling: "You stop wondering if you're doing something wrong. You start knowing exactly what tonight needs, in what order.",
    },
  },

  FM: {
    type: "Feeding Mechanics",
    subtitle: "Most Likely Pattern",
    emoji: "🍼",
    bannerClass: "feed-banner",
    stepClass: "feed-sn",
    prevalence: "Overlaps with both other systems in practice, and is the pattern most often missed entirely, since the crying shows up hours after the feed that actually caused it.",

    seeing: "What you're probably seeing tonight: fussing or crying that starts predictably 1 to 3 hours after a feed, pulling off the breast or bottle mid-feed, audible gulping or coughing while feeding, and a baby who's noticeably more settled upright than lying flat.",
    why: "A newborn's suck-swallow-breathe reflex is immature and easily overridden by a fast milk flow, a steep bottle angle, or a shallow latch. When that happens, air goes in with the milk on nearly every swallow, roughly 20% more air than a properly paced feed takes in. That air doesn't cause a problem at the feed itself. It sits, ferments over the next two to four hours, and shows up as crying that looks completely unrelated to feeding because the timing doesn't obviously connect the two.",
    rulesOut: "This pattern is less consistent with a pure gut-microbiome picture, which usually comes with visible bloating and stool changes independent of feed timing, or a pure nervous-system picture, which tends to escalate with any stimulation rather than specifically around feeds. Burping longer or harder doesn't fix this pattern, it releases what's already trapped from that feed, it doesn't change how much air the next feed adds.",
    steps: [
      {title: "Slow the flow, don't just change the position", body: "Hold your baby near-upright, not reclined, with the bottle horizontal so she's sucking for milk rather than having it fall into her mouth. Fill the nipple only half with milk so the rest is air, and pause every 20 to 30 seconds to let her breathe. Breastfeeding: check that her mouth covers the full areola, not just the nipple, a shallow latch pulls in air the same way a steep bottle angle does."},
      {title: "Burp upright, not reclined, and don't force it", body: "Hold her fully upright with her head on your shoulder, gentle patting at roughly 60 beats a minute, no jostling. Gravity lets trapped gas rise and escape on its own. Ten to fifteen minutes minimum. A burp that has to be forced usually means she was patted harder, not given the position gas actually needs to move."},
      {title: "Give her 15 minutes upright after the feed, before laying her down", body: "The 1-to-3-hour delayed crying window is air working its way through, not a new problem starting from scratch. Holding her upright for the first 15 minutes after a feed gives that air a head start toward moving down and out instead of sitting and fermenting."},
    ],
    monitor: "Watch for whether the crying tracks consistently with time-since-feed, that timing link is the confirming sign for this pattern. If instead she's arching and refusing feeds altogether, not gaining weight as expected, or the crying happens regardless of when she last ate, that's worth a direct conversation with your pediatrician about reflux or a feeding evaluation rather than more position changes at home.",
    bridgeLine: (name) => `${name}, the mechanics are fixable, and most of it isn't about willpower, it's about flow rate and timing. If you want the complete system instead of guessing at bottle angles and burping harder, that's what the Calm Baby Blueprint is for.`,

    forBaby: "Crying on a delay after feeds, gulping or pulling off mid-feed, settles better held upright.",
    whyTipsFailed: "The advice you've probably already gotten, feed slower, burp longer, try a different bottle, treats the symptom instead of the mechanism: how fast the milk is arriving relative to what a newborn's own reflexes can pace on their own. A longer burping session clears what's already trapped. It doesn't change how much air the next feed adds.",
    whatsDifferent: "Not a single tip about bottle angle. A full feeding-mechanics protocol: paced feeding technique for bottles, a latch check for breastfeeding, and the timing framework for how long to hold upright afterward, calibrated to whether your baby is breastfed, formula-fed, or mixed.",
    protocol: [
      "Diagnostic decision tree, know your baby's primary system before applying any intervention",
      "Complete paced-feeding protocol: bottle angle, nipple flow rate, and pacing breaks, plus a breastfeeding latch-assessment guide",
      "Upright-hold burping technique and the 15-minute post-feed window, step by step",
      "60-minute brown noise soundscape calibrated to womb frequencies (Bonus 2)",
      "Bloom Baby Tracker PWA, log feeds and crying timing to confirm the pattern (Bonus 1)",
      "Cry Decoder Masterclass, distinguish a feeding-mechanics cry from gut pain or nervous system distress (Bonus 3)",
    ],
    trustVincent: "Vincent is an epidemiologist, trained to read and weigh population-level research, not a lactation consultant or a pediatrician. That's what the credential is actually for here: separating the actual mechanism, flow rate versus a newborn's immature swallowing reflex, from generic \"just burp more\" advice. He ran that same process on his own daughter Zion's colic first.",
    evidence: () => "This isn't from one single colic trial the way the gut protocol is. Paced feeding, controlling flow rate so a baby isn't out-swallowing her own suck-swallow-breathe reflex, is standard pediatric and lactation-consultant feeding guidance, not one study's finding. The Blueprint applies that established feeding physiology specifically to the delayed-crying timing pattern above.",
    ctaBtnText: "Fix the Feeding Mechanics Tonight — $47",
    mailerliteField: "Feeding Mechanics Primary",
    quickTitle: "Do this at her next feed",
    quickSteps: [
      "Hold the bottle horizontal, not tipped down, so she controls the flow, not gravity.",
      "Pause every 20 to 30 seconds so she can breathe and reset.",
      "Hold her upright for 15 minutes after the feed before laying her down.",
    ],
    angles: {
      solution: "The paced-feeding and latch protocol that fixes the flow rate causing the air intake, not just more burping after the fact.",
      shortcut: "Skip the weeks of guessing at bottle angles and generic feeding advice that never names the actual mechanism.",
      feeling: "Feeding stops feeling like something you're getting wrong three times a day.",
    },
  },
};

/* Real, shared numbers, sourced from the Master Baseline Dashboard's
   completed-assessment sample (70% NS / 30% GUT at last pull). Hoisted
   here so renderPrevalenceBar() and buildGuaranteeProof() read the same
   value instead of two copies that can quietly drift apart. Update both
   uses automatically by changing this one object. */
const PREVALENCE = { NS: 70, GUT: 30 };

/* ── SESSION IDENTIFIERS ─────────────────────────────────────────────── */
const ASSESSMENT_ID = (() => {
  const year = new Date().getFullYear();
  const rand = Math.floor(Math.random() * 99999).toString().padStart(5, '0');
  return `CP-${year}-${rand}`;
})();

/* ── STATE ───────────────────────────────────────────────────────────── */
let userName = '', userEmail = '', userConsent = false, babyAgeWeeks = null, qIndex = 0;

/* Elapsed-time indicator, purely informational. Counts up from the real
   moment she clicks start, never a countdown, and nothing happens at any
   particular number. This exists to give an honest sense of momentum
   ("I'm already partway through"), not to create false urgency, that's a
   deliberate choice, see the brand voice guardrail on manipulative
   scarcity before turning this into anything that implies a deadline. */
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
// Literal text of what's already been tried (Q4), captured separately
// from scoring so the result page and the DM message can say it back
// to her, not just score against it silently.
let triedItems = [];
const selectedMap = new Map();
const quizStartedAt = Date.now(); // simple bot-speed trap

// Shared with subscribeToMailerLite() and goToChecklist() so both read the
// same number instead of two separate copies that could drift. Q1/Q2/Q3/Q6
// moved to single-select this version specifically to raise what this
// honestly measures, see the QUESTIONS comment block above, this function
// itself intentionally still just reports the true dominant/total share,
// no curve-fitting a better-looking number from the same underlying data.
function getConfidencePct() {
  const total = scores.GUT + scores.NS + scores.FM;
  const dominant = Math.max(scores.GUT, scores.NS, scores.FM);
  return total > 0 ? Math.round((dominant / total) * 100) : 0;
}

/* ── SECURE SUBSCRIPTION ─────────────────────────────────────────────── */
async function subscribeToMailerLite(name, email, colcType, detail, status) {
  const confidencePct = getConfidencePct();
  const utm = getStoredUTMs();

  try {
    await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        name,
        website: '', // honeypot passthrough, always blank for real submissions
        consent: !!userConsent,
        // Core classification
        colic_type:        colcType,
        colic_type_detail: detail,
        confidence_pct:     confidencePct,
        baby_age_weeks:    babyAgeWeeks,
        feeding_method:    feedingMethod || 'Not specified',
        tried_items:       triedItems.join(', '),
        group_id:          CFG.group_id,
        // Session tracking
        assessment_id:     ASSESSMENT_ID,
        lead_source:       UTM_SOURCE,
        quiz_status:       status,
        quiz_version:      '2.0',
        // Defaults, updated by Zapier on purchase
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
  if (!Number.isInteger(ageNum) || ageNum < 0 || ageNum > 52) return shake('ageInput', 'Enter age in weeks, 0–52');
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

  scores = {GUT:0, NS:0, FM:0};
  feedingMethod = '';
  triedItems = [];
  qIndex = 0;
  selectedMap.clear();

  if (honeypot || (Date.now() - quizStartedAt) < 1500) {
    console.warn('Submission flagged as likely automated, proceeding without subscribing.');
  } else {
    // Capture the lead now, before 7 questions and the analysis delay
    // give her a chance to drop off with zero record anywhere. A second
    // call fires on completion with the actual result.
    subscribeToMailerLite(userName, userEmail, 'Unassigned', 'Quiz Started', 'started');
  }

  hide('landingScreen');
  show('quizScreen');
  startQTimer();
  renderQuestion();
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
    div.onclick = () => toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null);
    div.onkeydown = (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleOption(i, o[1], div, !!q.single, o[2] || null, o[3] || null); } };
    box.appendChild(div);
  });
}

function toggleOption(idx, weights, el, single, feeding, triedTag) {
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
    // Radio behavior: at most one selection. Re-clicking the selected
    // option clears it, clicking a different option swaps to it.
    const wasSelected = selectedMap.has(idx);
    document.querySelectorAll('#optionsBox .option').forEach(deselect);
    selectedMap.clear();
    if (!wasSelected) {
      selectedMap.set(idx, { weights, feeding, triedTag });
      select(el);
    }
  } else {
    if (selectedMap.has(idx)) {
      selectedMap.delete(idx);
      deselect(el);
    } else {
      selectedMap.set(idx, { weights, feeding, triedTag });
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

/* Picks the highest-scoring system. Order on an exact tie is GUT, then
   FM, then NS. GUT and NS keep their documented prevalence ranges (60
   to 70% and 20 to 30%). FM doesn't have an equivalent published
   colic-prevalence figure the way the other two do, it's a design
   default for tie-breaking, not a citation-backed claim, so it isn't
   stated as a percentage anywhere in this file. Ties themselves are
   rare given how the weights are spread across seven questions; this
   only matters at all on an exact score match. */
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

  // Fire MailerLite (non-blocking, result shows regardless of API outcome)
  subscribeToMailerLite(userName, userEmail, R.type, R.mailerliteField, 'completed');

  // Store locally for back-button resilience
  try {
    localStorage.setItem('colic_type', type);
    localStorage.setItem('colic_name', userName);
  } catch(e){}

  // Banner
  const banner = document.getElementById('resultBanner');
  banner.className = `result-banner ${R.bannerClass}`;
  document.getElementById('resultBadge').innerHTML = `${R.emoji} &nbsp;${R.subtitle}`;
  document.getElementById('resultTitle').textContent = R.type;
  document.getElementById('resultPrevalence').textContent = R.prevalence;

  // Profile card: one warm sentence built from what she actually told
  // us (name, age, feeding method, what's already been tried), not a
  // data table. innerHTML because buildProfileNarrative() wraps the
  // tried-items list in <strong> on purpose, see its own comment.
  document.getElementById('profileNarrative').innerHTML = buildProfileNarrative();
  document.getElementById('profAssessmentId').textContent = ASSESSMENT_ID;

  // DM message, prebuilt from the same result data (including what's
  // been tried) so it's ready to copy the moment she wants to talk it
  // through with real context already in it
  document.getElementById('dmMessageBox').textContent = buildDMMessage(R);

  // "Why this pattern points here" — the five-part diagnostic
  // narrative. This half has to stand on its own even for someone who
  // never scrolls to the offer below it.
  document.getElementById('resultSeeing').textContent   = R.seeing;
  document.getElementById('resultWhy').textContent      = R.why;
  document.getElementById('resultRulesOut').textContent = R.rulesOut;
  document.getElementById('resultMonitor').textContent  = R.monitor;

  renderScorePanel(scores, type);
  renderQuickAction(type);
  document.getElementById('reframeBlock').innerHTML = buildReframeLine(type, userName);
  renderPrevalenceBar(type);
  document.getElementById('angleStrip').innerHTML = buildAngleStrip(type);
  renderGuaranteeCard(type, userName);
  const triedLine = buildTriedFailureLine(type);
  const triedEl = document.getElementById('triedLine');
  if (triedLine) { triedEl.innerHTML = triedLine; triedEl.style.display = ''; }
  else { triedEl.style.display = 'none'; }

  const sBox = document.getElementById('resultSteps');
  sBox.innerHTML = '';
  R.steps.forEach((s, i) => {
    sBox.innerHTML += `<div class="step-card"><div class="step-num ${R.stepClass}">${i+1}</div><div><div class="step-title">${s.title}</div><div class="step-body">${s.body}</div></div></div>`;
  });

  // Bridge line, the pivot sentence into the offer
  document.getElementById('resultBridge').textContent = R.bridgeLine(userName);

  // Sticky bar reads the same type name as the banner
  document.getElementById('stickyType').textContent = R.type;

  // Checklist path (free)
  // checklistHook stays static ("Tonight's 3 steps, guided") in the
  // compact card now, the type name is already the banner headline
  // above, repeating it here just wrapped badly at ~160px column width

  // Blueprint path (offer) — the 8-answer structure: is this for my
  // baby, why haven't the usual tips worked, what's different, what do
  // I get, why trust Vincent, what evidence, what if it doesn't help
  // (the guarantee box, static in HTML), buy (the button below).
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

  show('resultScreen');
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function goToProduct() {
  trackPathClick('blueprint');
  // Assessment ID travels into the Gumroad URL so Zapier can match
  // the purchase back to this subscriber record in MailerLite.
  // window.location.href, not window.open, since TikTok's in-app
  // browser handles the new-tab/intent handoff inconsistently across
  // Android builds. This avoids that failure mode instead of hoping
  // around it.
  // wanted=true skips Gumroad's own product page straight to checkout —
  // she's already read the full result page and the pitch, Gumroad's
  // page would just be a second, redundant sell before she can pay.
  const url = `${CFG.productUrl}?ref=${ASSESSMENT_ID}&wanted=true&utm_source=quiz&utm_medium=assessment&utm_campaign=${UTM_SOURCE}`;
  window.location.href = url;
}

function goToChecklist() {
  trackPathClick('checklist');
  // Same window.location.href reasoning as goToProduct(). type=
  // reuses the exact short code (GUT/NS/FM) getPrimaryType() already
  // returns, so the checklist doesn't need its own lookup. name/age
  // travel too so the checklist's capture form can pre-fill them
  // instead of asking twice, this is meant to feel like one
  // experience, not two tools. Email deliberately does not travel in
  // the URL (query strings end up in browser history and referrer
  // headers, an email address doesn't belong there), so the checklist
  // still asks for it once, with its own consent checkbox.
  const type = getPrimaryType(scores);
  // confidence travels too now, so Midnight Protocol can tell a decisive
  // result from a close one and word the type pre-selection honestly
  // instead of presenting every handoff with the same flat certainty.
  const url = `${CFG.checklistUrl}?type=${type}` +
    `&confidence=${getConfidencePct()}` +
    `&name=${encodeURIComponent(userName)}` +
    `&age=${encodeURIComponent(babyAgeWeeks != null ? babyAgeWeeks : '')}` +
    `&aid=${encodeURIComponent(ASSESSMENT_ID)}&utm_source=${encodeURIComponent(UTM_SOURCE)}&utm_medium=quiz_handoff&utm_campaign=checklist_handoff`;
  window.location.href = url;
}

/* ── PATH-CLICK TRACKING ─────────────────────────────────────────────────
   Separate from subscribeToMailerLite() on purpose, that call already has
   one job (record the completed assessment). This records which of the
   three result-page paths she actually took, so "does the on-page choice
   convert better than the email links" is a question with an answer
   instead of a guess. Requires a `path_clicked` custom field to exist in
   MailerLite before this ships — see subscribe.js for why that matters. */
/* ── PREVALENCE BAR ──────────────────────────────────────────────────────
   Real numbers for GUT/NS, sourced from the Master Baseline Dashboard's
   completed-assessment sample (70% NS / 30% GUT at last pull). That
   sample predates Feeding Mechanics existing as a bucket at all, so FM
   has zero completion history of its own, not a small number, zero. A
   fabricated FM percentage would be exactly the kind of unsourced stat
   this project's own QA process exists to catch, so FM gets an honest
   admission instead of a bar. Update the two numbers below once a
   fresh dashboard pull exists, don't leave last-quarter's split
   quietly presented as current forever. */
function renderPrevalenceBar(type) {
  const box = document.getElementById('prevalenceBox');

  if (type === 'FM') {
    box.innerHTML = `
      <div class="eyebrow-mini">Where you land</div>
      <p class="prevalence-note">Feeding Mechanics is the newest of the three patterns in this assessment. There isn't a large enough sample of completed assessments yet to give you an honest percentage the way we can for the other two, so we're not going to invent one.</p>
    `;
    return;
  }

  const pct = PREVALENCE[type]; // shared constant, defined near RESULTS
  const otherType = type === 'NS' ? 'GUT' : 'NS';

  box.innerHTML = `
    <div class="eyebrow-mini">Where you land</div>
    <p class="prevalence-note">About <strong>${pct} in 100</strong> parents who complete this assessment land on ${RESULTS[type].type} as the primary pattern, based on real completed assessments so far, not a textbook estimate. That number will keep moving as more parents complete it, this is where things stand right now.</p>
    <div class="prevalence-track"><div class="prevalence-fill" style="width:${pct}%"></div></div>
    <div class="prevalence-labels"><span class="here">● ${RESULTS[type].type}, you're here</span><span>${RESULTS[otherType].type}</span></div>
  `;
}

/* ── TRIED-ITEMS FAILURE LINE ────────────────────────────────────────────
   Distinct from RESULTS[type].whyTipsFailed (the generic, type-level
   answer used in the offer card). This one is dynamic, built from her
   actual Q4 selections, so it reads as a direct callback rather than a
   templated paragraph that happens to apply to her. Returns null if Q4
   was somehow skipped, showResult() hides the line entirely in that case
   rather than showing an empty callout. */
function buildTriedFailureLine(type) {
  if (!triedItems.length) return null;

  const list = triedItems.length === 1
    ? triedItems[0]
    : triedItems.slice(0, -1).join(', ') + ' and ' + triedItems[triedItems.length - 1];

  const reasons = {
    GUT: `work on the symptom, not the microbial imbalance producing it, that's the specific reason the relief never held.`,
    NS: `all add stimulation or motion. For a nervous system already in overload, that's more input, not less, which is exactly why it worked for a few minutes and then stopped.`,
    FM: `address what happens after the air is already in, not the flow rate that let it in during the feed, so the next feed just loads the same problem again.`,
  };

  return `You told us you'd already tried <strong>${list}</strong>. ${reasons[type]}`;
}

/* ── PROFILE CARD NARRATIVE ──────────────────────────────────────────────
   One sentence built from what she actually told the quiz, instead of a
   row of data chips. Returns HTML (not plain text) on purpose, the tried
   items get wrapped in <strong> so they read as "yes, we heard you",
   which is the actual point of surfacing them at all. */
function buildProfileNarrative() {
  const feedingPhrase = {
    'Breastfed': 'breastfed',
    'Formula-fed': 'formula-fed',
    'Mixed': 'mixed breast and formula fed',
  }[feedingMethod] || 'feeding';

  let sentence = `${userName}, you told us about a ${babyAgeWeeks}-week-old who's ${feedingPhrase}`;

  if (triedItems.length) {
    const list = triedItems.length === 1
      ? triedItems[0]
      : triedItems.slice(0, -1).join(', ') + ' and ' + triedItems[triedItems.length - 1];
    const verb = triedItems.length === 1 ? "hasn't" : "haven't";
    sentence += `, and that <strong>${list}</strong> ${verb} been enough on ${triedItems.length === 1 ? 'its' : 'their'} own`;
  }

  sentence += `. Here's what that most likely points to.`;
  return sentence;
}

/* ── SCORE PANEL ──────────────────────────────────────────────────────────
   Her own three scores, normalized to a 0-100 read against each other,
   primary system tagged and rendered first. Distinct from the
   prevalence bar (population comparison); this is her data specifically,
   which is the actual IKEA-effect payoff of finishing seven questions,
   a generic bucket label could have been shown after question one. */
function renderScorePanel(s, primaryType) {
  const total = s.GUT + s.NS + s.FM;
  const pctOf = k => total > 0 ? Math.round((s[k] / total) * 100) : 0;
  const order = ['GUT', 'NS', 'FM'].slice().sort((a, b) => s[b] - s[a]);

  const rows = order.map(k => {
    const isPrimary = k === primaryType;
    return `
      <div class="score-row${isPrimary ? '' : ' is-secondary'}">
        <div class="score-row-head">
          <div class="score-name">${RESULTS[k].type}${isPrimary ? '<span class="primary-tag">Primary</span>' : ''}</div>
          <div class="score-val">${pctOf(k)}</div>
        </div>
        <div class="score-track"><div class="score-fill" data-pct="${pctOf(k)}"></div></div>
      </div>`;
  }).join('');

  const box = document.getElementById('scorePanel');
  box.innerHTML = `
    <div class="score-panel-head">
      <div class="score-panel-title">Your Baby's System Scores</div>
      <div class="score-panel-scale">Scale: 0&ndash;100</div>
    </div>
    ${rows}
    <div class="score-panel-foot">These reflect your specific answers, not the group average. The bar further down shows how common your primary pattern is across everyone who's completed this assessment.</div>
  `;

  // Fill after paint so the width transition actually animates instead
  // of snapping straight to its end state.
  requestAnimationFrame(() => {
    setTimeout(() => {
      box.querySelectorAll('.score-fill').forEach(f => {
        f.style.width = f.getAttribute('data-pct') + '%';
      });
    }, 150);
  });
}

/* ── QUICK ACTION ─────────────────────────────────────────────────────────
   The free, ungated, do-it-now step, as numbered micro-steps rather
   than a paragraph. This is the reciprocity move: something real
   before any ask, and it's positioned ahead of the deeper explanation
   on the assumption most of this traffic skims rather than reads. */
function renderQuickAction(type) {
  const R = RESULTS[type];
  const stepsHtml = R.quickSteps.map(s => `<li>${s}</li>`).join('');
  document.getElementById('quickAction').innerHTML = `
    <div class="qa-eyebrow">Free, right now</div>
    <div class="qa-title">${R.quickTitle}</div>
    <ol class="qa-steps">${stepsHtml}</ol>
    <p class="qa-note">This is the first move, not the whole protocol. The full sequence, with the reasoning behind each step, is in "What to try tonight" below.</p>
  `;
}

/* ── REFRAME ──────────────────────────────────────────────────────────────
   One paragraph, no bullets, per the Loss Inventory rule. The pivot
   from "tonight" (the free step above) to "the window" (why tonight
   alone doesn't close it), which is what keeps the free step and the
   paid offer from competing instead of sequencing. */
function buildReframeLine(type, name) {
  const closingByType = {
    GUT: `the fermentation loop resets after every feed until the microbiome itself is addressed`,
    NS: `her nervous system will spike, drop, and spike again at roughly the same hour tomorrow, until it has a repeatable way back down`,
    FM: `the same air load builds again at the next feed, and the same delayed window follows it`,
  };
  const parentPhrase = name ? `as ${name}` : `as her parent`;
  return `What you just did above can quiet tonight. It won't stop this from happening again tomorrow evening, because ${closingByType[type]}. What that costs isn't only sleep. It's the version of the next few weeks you expected to have: a clear head, a partner who isn't running on the same empty tank you are, the sense that you know what you're doing ${parentPhrase}. <strong>The crying resolves on its own by around week 12 regardless.</strong> What you don't get back automatically is everything between now and then.`;
}

/* ── SOLUTION / SHORTCUT / FEELING ────────────────────────────────────────
   Made explicit and visible rather than left implicit in the prose
   around it, directly after the bridge sentence, as its payoff. */
function buildAngleStrip(type) {
  const a = RESULTS[type].angles;
  return `
    <div class="angle-row"><div class="angle-tag">Solution</div><div class="angle-text">${a.solution}</div></div>
    <div class="angle-row"><div class="angle-tag">Shortcut</div><div class="angle-text">${a.shortcut}</div></div>
    <div class="angle-row"><div class="angle-tag">Feeling</div><div class="angle-text">${a.feeling}</div></div>
  `;
}

/* ── GUARANTEE PROOF LINE ─────────────────────────────────────────────────
   Assessment-volume proof (how many parents have run this diagnostic),
   kept deliberately separate from any claim about buyers or refunds.
   Only 3 lifetime Blueprint sales exist as of this build, so a number
   here must never be worded in a way that implies 250+ people bought
   or were refunded, that would be a false, checkable claim the moment
   anyone thinks about it for two seconds. */
function buildGuaranteeProof(type, name) {
  const countSpan = `<span class="assessment-count-value">${ASSESSMENT_COUNT_DISPLAY}</span>+`;
  if (type === 'FM') {
    return `You'd be one of over ${countSpan} parents who've run this exact assessment. Feeding Mechanics is the newest of the three patterns we score for, so there isn't a large enough completed sample yet to give you an honest percentage the way we can for the other two, we're not going to invent one.`;
  }
  const pct = PREVALENCE[type];
  return `You'd be one of over ${countSpan} parents who've run this exact assessment. About <strong>${pct} in 100</strong> land on ${RESULTS[type].type} too, same as ${name || 'you'}, this isn't a rare or unusual read on your baby's pattern.`;
}

function renderGuaranteeCard(type, name) {
  document.getElementById('guaranteeCard').innerHTML = `
    <p class="guarantee-proof">${buildGuaranteeProof(type, name)}</p>
    <div class="guarantee-card-label">72-Hour Guarantee</div>
    <p class="gc-body">Start the full protocol tonight. If you're not seeing a <strong>measurable reduction in crying duration within 72 hours</strong>, email me directly and I'll refund it in full. No forms, no back-and-forth. You keep the Blueprint either way.</p>
  `;
}

function trackPathClick(path) {
  try {
    const type = getPrimaryType(scores);
    const R = RESULTS[type];
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // keepalive: this fetch's page is about to navigate away via
      // window.location.href right after this call. Without keepalive,
      // the browser can cancel an in-flight fetch mid-navigation and
      // the click never gets recorded, a classic silent-failure trap.
      keepalive: true,
      body: JSON.stringify({
        email: userEmail,
        name: userName,
        website: '',
        consent: !!userConsent,
        colic_type: R.type,
        colic_type_detail: R.mailerliteField,
        feeding_method: feedingMethod || 'Not specified',
        baby_age_weeks: babyAgeWeeks,
        tried_items: triedItems.join(', '),
        group_id: CFG.group_id,
        assessment_id: ASSESSMENT_ID,
        lead_source: UTM_SOURCE,
        quiz_status: 'completed',
        quiz_version: '2.0',
        path_clicked: path, // 'checklist' | 'blueprint' | 'dm'
        purchase_status: 'pending',
        ...getStoredUTMs(),
      }),
    }).catch(e => console.warn('Path click tracking failed silently:', e));
  } catch(e) {
    console.warn('trackPathClick error:', e);
  }
}

/* ── DM-TO-VINCENT PATH ──────────────────────────────────────────────────
   Plain ig.me/m/ links only support a `ref` param delivered via webhook
   to a connected Instagram Messaging API app with Icebreakers configured,
   confirmed against Meta's own developer docs. There is no parameter
   that pre-fills visible text in the DM composer for a regular link like
   this one. So: build the message, offer it to copy, then open the
   thread. She pastes it herself. That's the honest version of this
   feature, not a promise the platform doesn't keep. */
function buildDMMessage(R) {
  const feeding = (feedingMethod || 'not specified').toLowerCase();
  let msg = `Hi Vincent, I just completed the Colic Protocol assessment (${ASSESSMENT_ID}). My result was ${R.type}. My baby is ${babyAgeWeeks} weeks old and ${feeding}.`;
  if (triedItems.length) {
    msg += ` I've already tried ${triedItems.join(', ')}, without much luck.`;
  }
  msg += ` I'd like help understanding what this means.`;
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
    // Clipboard API is commonly blocked inside Instagram/TikTok's
    // in-app browser without a user-gesture-adjacent permission
    // prompt succeeding. Fall back to the old select+execCommand
    // trick rather than just failing silently.
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

/* ── SCROLL POLISH ────────────────────────────────────────────────────────
   Two independent observers, set up once at load:
   1. .reveal elements fade up as they enter the viewport. They live
      inside #resultScreen, which is hidden (display:none) until
      showResult() runs, IntersectionObserver handles that fine, it just
      reports non-intersecting until the container becomes visible and
      she scrolls to them.
   2. The sticky bottom bar shows once the result banner scrolls out of
      view and stays shown, it doesn't hide again further down the page,
      the footer CTAs and this one are meant to coexist, not compete.
   Both are feature-detected. No IntersectionObserver support just means
   .reveal content shows immediately and the sticky bar never appears,
   a strictly safe degrade, not a broken page. */
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
        stickyBar.classList.toggle('show', !entry.isIntersecting);
      });
    }, { threshold: 0 });
    bannerObserver.observe(banner);
  }
} else {
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('in'));
}
