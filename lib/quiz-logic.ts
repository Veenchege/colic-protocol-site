/**
 * lib/quiz-logic.ts
 *
 * REBUILT to match the live quiz flow: email captured before any question,
 * 8 single-select questions (no multi-select anywhere), full report-style
 * results with mistakes list, step protocol, and CTA copy per colic type.
 *
 * Shared between:
 *   - QuizContainer.tsx (client — drives the question flow)
 *   - /api/quiz-submit/route.ts (server — final segmentation before MailerLite write)
 *
 * Keep this file dependency-free.
 */

/* ─── Types ──────────────────────────────────────────────────── */

export type ColiType = 'GUT' | 'NS' | 'ACOUSTIC' | 'MIXED'
export type FeedingMethod = 'breast' | 'formula' | 'mixed'
export type BabyAge = '0-3w' | '3-6w' | '6-8w' | '8-12w' | '12w+'
export type UrgencyLevel = 'peak' | 'approaching' | 'early' | 'resolving'

/**
 * Every question is single-select. One string value per field.
 * No arrays, no multi-select anywhere in this flow.
 */
export interface QuizAnswers {
  babyAge:      BabyAge
  cryTiming:    string   // Q2 — when the crying happens
  crySound:     string   // Q3 — the acoustic pattern of the cry
  bodySignals:  string   // Q4 — physical signs during crying
  triedBefore:  string   // Q5 — the single thing tried most
  holdResponse: string   // Q6 — response to being held
  stoolType:    string   // Q7 — stool presentation
  feedingMethod: FeedingMethod // Q8 — feeding situation, drives track selection
}

interface SystemScores {
  gut: number
  ns:  number
  ac:  number
}

export interface QuizReport {
  coliType:        ColiType
  urgency:         UrgencyLevel
  prevalence:      string
  headline:        string
  science:         string
  mistakes:        string[]        // exactly 3
  steps:           { title: string; body: string }[]  // exactly 3
  ctaHook:         (name: string) => string
  ctaBody:         string
  ctaConsequence:  string
  protocolList:    string[]        // Blueprint component/bonus list
  ctaBtnText:      string
  refluxFlag:      boolean
  dayNightFlag:    boolean
  failureMessage:  string
}

/* ─── Scoring tables — one weight set per selected option ────── */
/* Keys must match the `value` fields used in QuizContainer's question data. */

const CRY_TIMING_SCORES: Record<string, SystemScores> = {
  evenings: { gut: 1, ns: 2, ac: 1 },   // consistently 5PM–midnight
  feeding:  { gut: 2, ns: 0, ac: 0 },   // during/after feeding — reflux flag
  random:   { gut: 1, ns: 1, ac: 0 },   // no clear pattern
  environment: { gut: 0, ns: 2, ac: 2 }, // any environment change
}

const CRY_SOUND_SCORES: Record<string, SystemScores> = {
  instant:   { gut: 0, ns: 3, ac: 1 },  // high-pitched, no build-up
  escalating:{ gut: 2, ns: 1, ac: 0 },  // softens then escalates
  waves:     { gut: 3, ns: 0, ac: 0 },  // waves, legs to chest
  whiny:     { gut: 1, ns: 0, ac: 1 },  // fussy not piercing
}

const BODY_SIGNALS_SCORES: Record<string, SystemScores> = {
  knees:    { gut: 3, ns: 0, ac: 0 },   // legs to chest, tight belly
  arching:  { gut: 1, ns: 3, ac: 0 },   // full-body tension, arching
  startles: { gut: 0, ns: 2, ac: 3 },   // startles at sound, overwhelmed
  inconsolable: { gut: 1, ns: 2, ac: 1 }, // nothing helps regardless
}

const TRIED_BEFORE_SCORES: Record<string, SystemScores> = {
  gripewater_gasdrops: { gut: 2, ns: 1, ac: 0 },
  rocking_bouncing:    { gut: 0, ns: 2, ac: 1 },
  whitenoise:          { gut: 0, ns: 1, ac: 3 },
  feeding_changes:     { gut: 2, ns: 0, ac: 0 },
  nothing:             { gut: 0, ns: 0, ac: 0 },
}

const HOLD_RESPONSE_SCORES: Record<string, SystemScores> = {
  facedown_calms:   { gut: 2, ns: 1, ac: 0 },
  rhythmic_calms:   { gut: 0, ns: 3, ac: 0 },
  touch_escalates:  { gut: 0, ns: 1, ac: 3 },
  inconsistent:     { gut: 1, ns: 2, ac: 1 },
}

const STOOL_SCORES: Record<string, SystemScores> = {
  green_frothy: { gut: 3, ns: 0, ac: 0 },
  normal:       { gut: 0, ns: 2, ac: 1 },
  infrequent:   { gut: 2, ns: 1, ac: 0 },
  unsure:       { gut: 0, ns: 0, ac: 0 },
}

/* ─── Urgency from age ───────────────────────────────────────── */

export function getUrgencyLevel(age: BabyAge): UrgencyLevel {
  switch (age) {
    case '6-8w': return 'peak'
    case '3-6w': return 'approaching'
    case '0-3w': return 'early'
    default:      return 'resolving'
  }
}

const PREVALENCE: Record<ColiType, string> = {
  GUT:      'The most common primary driver, present in roughly 60 to 70% of colic cases.',
  NS:       'Present as the primary driver in roughly 20 to 30% of cases, and frequently missed.',
  ACOUSTIC: 'Often overlooked as a standalone driver, contributing significantly in roughly 30 to 40% of cases.',
  MIXED:    'A multi-system presentation. Single-remedy approaches fail by design against this pattern.',
}

/* ─── Core segmentation ──────────────────────────────────────── */

export function determineColiType(answers: QuizAnswers): ColiType {
  const scores: SystemScores = { gut: 0, ns: 0, ac: 0 }

  const add = (s: SystemScores | undefined) => {
    if (!s) return
    scores.gut += s.gut
    scores.ns  += s.ns
    scores.ac  += s.ac
  }

  add(CRY_TIMING_SCORES[answers.cryTiming])
  add(CRY_SOUND_SCORES[answers.crySound])
  add(BODY_SIGNALS_SCORES[answers.bodySignals])
  add(TRIED_BEFORE_SCORES[answers.triedBefore])
  add(HOLD_RESPONSE_SCORES[answers.holdResponse])
  add(STOOL_SCORES[answers.stoolType])

  const max = Math.max(scores.gut, scores.ns, scores.ac)
  if (max < 4) return 'MIXED'

  const dominant = Object.entries(scores).filter(([, v]) => v === max)
  if (dominant.length > 1) return 'MIXED'

  const sorted = Object.values(scores).sort((a, b) => b - a)
  if (sorted[0] - sorted[1] <= 2) return 'MIXED'

  if (scores.gut === max) return 'GUT'
  if (scores.ns  === max) return 'NS'
  return 'ACOUSTIC'
}

/* ─── Report content per type ────────────────────────────────── */

const REPORTS: Record<
  ColiType,
  Omit<QuizReport, 'coliType' | 'urgency' | 'prevalence' | 'refluxFlag' | 'dayNightFlag' | 'failureMessage'>
> = {
  GUT: {
    headline: 'Your baby\'s gut is producing the inflammation driving the crying.',
    science:
      'Colicky infants with this presentation show a consistent pattern: reduced Lactobacillus bacteria and elevated gas-producing Proteobacteria in the gut microbiome. This creates a fermentation loop generating pain, bloating, and the inflammation behind each episode. Simethicone treats the gas as a mechanical output. It cannot touch the microbial environment producing it.',
    mistakes: [
      'Continuing with simethicone or gripe water. Neither has passed a randomised controlled trial for colic, and neither addresses the microbial imbalance driving gas production.',
      'Treating episodes in isolation without addressing the recurring root. Managing the crying nightly without gut repair means the pattern continues until it resolves on its own, typically around 12 weeks.',
      'Using a generic probiotic. Strain specificity matters. The only strain with published RCT evidence for infant colic is L. reuteri DSM 17938, sold as BioGaia Protectis. Generic blends do not carry this data.',
    ],
    steps: [
      { title: 'Start L. reuteri DSM 17938 tonight', body: 'The specific strain, not a generic probiotic. Savino et al., Pediatrics 2010: 74% reduction in daily crying time by Day 21 in breastfed infants. 5 drops daily added to expressed milk or formula, cooled to body temperature.' },
      { title: 'Run the Tiger Hold for acute episodes', body: 'Face-down across your forearm, belly on the muscle, head in your palm. Pulse at 60 beats per minute, forward and back. Moves trapped gas while deactivating the Moro startle reflex. Hold for five minutes minimum.' },
      { title: 'Brown noise before you pick your baby up', body: '60 to 65 decibels, minimum seven feet from the head. Sound before touch, always. A dysregulated nervous system cannot receive touch as calming until the acoustic layer is in place.' },
    ],
    ctaHook: (name) => `${name}, you now know what has been causing this. Not a guess, a documented physiological pattern with a specific protocol.`,
    ctaBody:
      'The three steps above start tonight. What they cannot give you is the full dosing calibration for your baby\'s feeding method, the decision tree for when more than one system is involved, or the timing framework for assessing whether the protocol is working. That is the Blueprint.',
    ctaConsequence:
      'Every week the gut imbalance runs without intervention is another week of the same pattern nightly. It resolves on its own at 10 to 12 weeks. The L. reuteri protocol compresses that window, but only with the correct strain, dose, and timing. Generic probiotics do not carry this data.',
    protocolList: [
      'Diagnostic decision tree — confirm gut is the primary system before committing to the protocol',
      'Full L. reuteri DSM 17938 dosing calibration for breastfed and formula-fed infants',
      'Tiger Hold, ILU massage, and vagus nerve sequence with technique breakdowns',
      '60-minute brown noise soundscape calibrated to womb frequencies',
      'Bloom Baby Tracker app — one-tap logging at 3AM to confirm the pattern is breaking',
      'Cry Decoder audio — distinguish gut pain from nervous system cries',
    ],
    ctaBtnText: 'Start the Gut Reset Protocol — $47',
  },

  NS: {
    headline: 'Your baby\'s nervous system is stuck in a chronic threat state.',
    science:
      'The prefrontal cortex, responsible for emotional regulation, is not functional at six weeks. There is no neurological mechanism for self-soothing at this age. The pattern you are seeing, high-pitched, continuous from the first second, intensifying with more stimulation, is a nervous system crisis, not primarily a gut problem. Gut interventions applied to this presentation delay resolution by weeks.',
    mistakes: [
      'Waiting for the crying to peak before intervening. By full intensity, the cortisol cascade is already running. Intervention works better in the first 30 seconds of distress.',
      'Adding stimulation during episodes, talking, eye contact, multiple position changes. A dysregulated nervous system reads extra input as extra threat.',
      'Running sound, touch, and light in the wrong order. Touch before sound adds a sensory demand to an already overloaded system.',
    ],
    steps: [
      { title: 'Sound before touch, always', body: 'Brown noise at 60 to 65 decibels, minimum seven feet from the head, active for 30 seconds before you pick your baby up. This is not optional sequencing.' },
      { title: 'Tiger Hold at exactly 60 BPM', body: 'Face-down, forearm pressure, pulse forward and back at one beat per second. This specific rhythm deactivates the Moro startle reflex keeping the nervous system in threat mode.' },
      { title: 'Warm dim light, never darkness', body: 'Darkness increases cortisol in newborns. Warm amber light at low intensity, introduced as the third step after sound and touch are established.' },
    ],
    ctaHook: (name) => `${name}, you have not been soothing incorrectly. You have been soothing out of sequence. That is a different problem with a specific fix.`,
    ctaBody:
      'The sequence above works tonight. What it cannot give you is the 15-minute timing framework for assessing each layer, when to cycle back to sound if touch is not working, or how to adjust when the gut system is also involved. That is the Blueprint.',
    ctaConsequence:
      'A dysregulated nervous system does not respond to more effort. Faster rocking and louder noise consistently make episodes worse. The sequence is the protocol. Starting it correctly tonight is the difference between managing the episode and shortening it.',
    protocolList: [
      'The sound, touch, light timing framework with assessment checkpoints at each stage',
      'Tiger Hold with full 60 BPM rhythm calibration and technique breakdown',
      'Cry Decoder audio — distinguish the nervous system cry from gut pain in real time',
      '60-minute brown noise soundscape engineered to womb frequencies',
      'Parent regulation section — your cortisol transmits through touch, regulate yourself first',
      'Bloom Baby Tracker app — log what is working at 3AM without turning on a light',
    ],
    ctaBtnText: 'Start the Nervous System Protocol — $47',
  },

  ACOUSTIC: {
    headline: 'Your baby\'s environment is actively working against their nervous system.',
    science:
      'The womb is a continuous low-frequency acoustic space, maternal heartbeat, blood flow, digestion, all within the brown noise range. A newborn\'s nervous system spent nine months calibrated to that frequency. The typical home environment sits above it. White noise sits above womb frequency and can worsen the response. Brown noise at the correct volume and distance is the specific correction.',
    mistakes: [
      'Using white noise. It is high-frequency and can overstimulate an already sensitised nervous system. Brown noise is the correct intervention.',
      'Placing the speaker too close or too loud. The correct specification is 60 to 65 decibels, minimum seven feet from the head, roughly the volume of a shower heard across a room.',
      'Treating sound as a last resort instead of the first step. The acoustic layer must be established before touch, not added afterward.',
    ],
    steps: [
      { title: 'Replace all white noise with brown noise tonight', body: 'Low-frequency, slow rolling pattern matching womb acoustics. 60 to 65 decibels, minimum seven feet from the head.' },
      { title: 'Establish sound before the crying escalates', body: 'Brown noise active 15 minutes before the typical witching hour onset, not after distress peaks. The signal needs to register as safety while the baby is still relatively calm.' },
      { title: 'Reduce daytime acoustic load', body: 'TV, podcasts, and irregular household sound add to a cumulative threshold. Consistent brown noise during daytime sleep lowers the baseline the evening dysregulation builds from.' },
    ],
    ctaHook: (name) => `${name}, your baby is not unusually sensitive. The environment has been sending the wrong signal. That is correctable starting tonight.`,
    ctaBody:
      'The three steps above correct the immediate environment. What they cannot give you is the engineered soundscape calibrated to exact womb frequency specifications, or the full integration protocol showing how the acoustic layer works alongside physical holds and gut repair. That is the Blueprint.',
    ctaConsequence:
      'Acoustic dysregulation compounds across the day. The witching hour is the accumulation of a full day of suboptimal acoustic input reaching a threshold, not a random evening event. Fixing only the night environment manages episodes without preventing them.',
    protocolList: [
      '60-minute brown noise soundscape engineered to womb frequency specifications',
      'Acoustic environment design guide — speaker placement, volume calibration, room setup',
      'The sound, touch, light timing framework and full integration protocol',
      'Tiger Hold technique breakdown as the physical complement to the acoustic layer',
      'Bloom Baby Tracker app — track which acoustic adjustments produce measurable results',
      'Cry Decoder audio — identify acoustic-sensitivity cry patterns in real time',
    ],
    ctaBtnText: 'Fix the Acoustic Environment — $47',
  },

  MIXED: {
    headline: 'Your baby has a multi-system colic presentation.',
    science:
      'Single remedies have failed because this is not a single-system problem. Gut microbiome imbalance, nervous system dysregulation, and the acoustic environment are all contributing simultaneously, each reinforcing the others. That is why the Tiger Hold works briefly then stops, or brown noise calms but the gas pain returns.',
    mistakes: [
      'Treating the symptom without diagnosing which system is primary. Gripe water does not work on sensory overload. The Tiger Hold does not work on a dairy-sensitive gut.',
      'Inconsistent application. The nervous system learns patterns through repetition. Skipping nights resets the conditioning the protocol depends on.',
      'Treating only the baby, not the parent. Your cortisol transmits through touch. Parent regulation is a documented component, not optional comfort advice.',
    ],
    steps: [
      { title: 'Sound first', body: 'Brown noise at 60 to 65 decibels, minimum seven feet from the head, before any physical contact.' },
      { title: 'Touch second', body: 'Tiger Hold at 60 BPM, face-down, forearm pressure, rhythmic pulse for five minutes minimum.' },
      { title: 'Gut reset alongside both', body: 'L. reuteri DSM 17938 running simultaneously as a 21-day protocol while the sound and touch layers manage nightly episodes.' },
    ],
    ctaHook: (name) => `${name}, you now have the framework. Three systems, sequenced intervention. What is missing is the architecture that makes them work together.`,
    ctaBody:
      'The sequence above is the framework. What it cannot give you is the diagnostic protocol to identify which system is primary in your baby, or the sequencing rules for running all three simultaneously without one intervention undermining another. That is the Blueprint.',
    ctaConsequence:
      'Multi-system colic does not resolve faster by trying harder on one system. It resolves by running all three correctly, in sequence, at the same time. That is the sequencing architecture the Blueprint provides.',
    protocolList: [
      'Diagnostic decision tree — identify which system is primary before sequencing intervention',
      'Full L. reuteri DSM 17938 dosing protocol running alongside physical and acoustic layers',
      'Tiger Hold, ILU massage, and vagus nerve sequence with technique breakdowns',
      '60-minute brown noise soundscape calibrated to womb frequencies',
      'Bloom Baby Tracker app — one-tap logging to see which system is improving first',
      'Cry Decoder audio — distinguish which system is driving each individual episode',
    ],
    ctaBtnText: 'Start the Full Three-System Protocol — $47',
  },
}

/* ─── Build full report ──────────────────────────────────────── */

export function buildQuizReport(answers: QuizAnswers): QuizReport {
  const coliType = determineColiType(answers)
  const urgency  = getUrgencyLevel(answers.babyAge)
  const base     = REPORTS[coliType]

  const refluxFlag    = answers.cryTiming === 'feeding'
  const dayNightFlag  = false // reserved — no night-only option in the 8-question set below; kept for future use

  const failedProducts: string[] = []
  if (answers.triedBefore === 'gripewater_gasdrops') {
    failedProducts.push(
      'gripe water and gas drops (neither has passed a randomised controlled trial for colic, and simethicone failed the Cochrane review outright)'
    )
  }

  const failureMessage =
    failedProducts.length > 0
      ? `You have tried ${failedProducts.join(' and ')}. That is not failure on your part, those products have no clinical evidence behind them.`
      : ''

  return {
    coliType,
    urgency,
    prevalence: PREVALENCE[coliType],
    failureMessage,
    refluxFlag,
    dayNightFlag,
    ...base,
  }
}

/* ─── MailerLite field map ───────────────────────────────────── */

export function buildMailerLiteFields(answers: QuizAnswers, coliType: ColiType) {
  return {
    colic_type:     coliType,
    feeding_method: answers.feedingMethod,
    baby_age:       answers.babyAge,
    lead_source:    'website_quiz',
  }
}
