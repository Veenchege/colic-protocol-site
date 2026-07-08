'use client'

import { useState, useCallback } from 'react'
import { type QuizAnswers } from '@/lib/quiz-logic'
import QuizLanding   from './QuizLanding'
import QuizProgress  from './QuizProgress'
import QuizStep, { type Question } from './QuizStep'
import QuizAnalyzing from './QuizAnalyzing'
import QuizResults   from './QuizResults'

/* ─── Questions — all single-select, 8 total ─────────────────── */
const QUESTIONS: Question[] = [
  {
    id:    'babyAge',
    label: 'Question 1 of 8',
    title: 'How old is your baby right now?',
    hint:  'Colic intensity varies significantly by week.',
    type:  'single',
    options: [
      { value: '0-3w',  label: '0 to 3 weeks' },
      { value: '3-6w',  label: '3 to 6 weeks' },
      { value: '6-8w',  label: '6 to 8 weeks', sublabel: 'Statistical peak' },
      { value: '8-12w', label: '8 to 12 weeks' },
      { value: '12w+',  label: '12 weeks or older' },
    ],
  },
  {
    id:    'cryTiming',
    label: 'Question 2 of 8',
    title: 'When does the crying happen most?',
    hint:  'Timing is the strongest single diagnostic signal.',
    type:  'single',
    options: [
      { value: 'evenings',    label: 'Consistently in the evening', sublabel: '5PM to midnight, regardless of feeding' },
      { value: 'feeding',     label: 'During or right after feeding', sublabel: 'May indicate reflux, not colic' },
      { value: 'random',      label: 'Randomly throughout the day', sublabel: 'No clear pattern' },
      { value: 'environment', label: 'Whenever the environment changes', sublabel: 'New sounds, visitors, lights' },
    ],
  },
  {
    id:    'crySound',
    label: 'Question 3 of 8',
    title: 'What does the cry sound like?',
    hint:  'The acoustic pattern carries diagnostic information.',
    type:  'single',
    options: [
      { value: 'instant',    label: 'High-pitched, intense from the first second', sublabel: 'No build-up' },
      { value: 'escalating', label: 'Starts softer, escalates over 10 to 15 minutes' },
      { value: 'waves',      label: 'Comes in waves, legs pulled to chest' },
      { value: 'whiny',      label: 'Whiny and fussy, not piercing' },
    ],
  },
  {
    id:    'bodySignals',
    label: 'Question 4 of 8',
    title: 'What does your baby\'s body do while crying?',
    hint:  'Physical signals point to specific root causes.',
    type:  'single',
    options: [
      { value: 'knees',        label: 'Legs pulled to chest, tight belly' },
      { value: 'arching',      label: 'Arches back, fists clenched, red-faced' },
      { value: 'startles',     label: 'Startles at sound, easily overwhelmed' },
      { value: 'inconsolable', label: 'Inconsolable regardless of position' },
    ],
  },
  {
    id:    'triedBefore',
    label: 'Question 5 of 8',
    title: 'What have you tried the most?',
    hint:  'Pick the one thing you\'ve relied on most.',
    type:  'single',
    options: [
      { value: 'gripewater_gasdrops', label: 'Gripe water or gas drops' },
      { value: 'rocking_bouncing',    label: 'Rocking, bouncing, swinging' },
      { value: 'whitenoise',          label: 'A white noise machine' },
      { value: 'feeding_changes',     label: 'Changing feeding position or frequency' },
      { value: 'nothing',             label: 'Nothing has worked consistently' },
    ],
  },
  {
    id:    'holdResponse',
    label: 'Question 6 of 8',
    title: 'How does your baby respond to being held during crying?',
    type:  'single',
    options: [
      { value: 'facedown_calms',  label: 'Calms somewhat when held face-down' },
      { value: 'rhythmic_calms',  label: 'Calms when moved rhythmically, restarts when you stop' },
      { value: 'touch_escalates', label: 'Escalates when touched during the worst episodes' },
      { value: 'inconsistent',    label: 'Inconsistent, sometimes helps, sometimes worse' },
    ],
  },
  {
    id:    'stoolType',
    label: 'Question 7 of 8',
    title: 'What does your baby\'s stool look like?',
    hint:  'Gut presentation provides direct microbiome data.',
    type:  'single',
    options: [
      { value: 'green_frothy', label: 'Green, frothy, or mucousy' },
      { value: 'normal',       label: 'Normal, no changes noted' },
      { value: 'infrequent',   label: 'Infrequent, with visible straining' },
      { value: 'unsure',       label: 'Not sure, haven\'t noticed a pattern' },
    ],
  },
  {
    id:    'feedingMethod',
    label: 'Question 8 of 8',
    title: 'What is your baby\'s feeding situation?',
    hint:  'This determines which protocol track applies.',
    type:  'single',
    options: [
      { value: 'breast',  label: 'Exclusively breastfed' },
      { value: 'formula', label: 'Formula-fed' },
      { value: 'mixed',   label: 'Mixed feeding' },
    ],
  },
]

const ANSWER_FIELDS: (keyof QuizAnswers)[] = [
  'babyAge', 'cryTiming', 'crySound', 'bodySignals',
  'triedBefore', 'holdResponse', 'stoolType', 'feedingMethod',
]

const TOTAL_QUESTIONS = QUESTIONS.length // 8

const DEFAULT_ANSWERS: QuizAnswers = {
  babyAge:       '3-6w',
  cryTiming:     'evenings',
  crySound:      'instant',
  bodySignals:   'knees',
  triedBefore:   'nothing',
  holdResponse:  'inconsistent',
  stoolType:     'unsure',
  feedingMethod: 'breast',
}

type FlowState = 'landing' | number | 'analyzing' | 'results'

export default function QuizContainer() {
  const [flow, setFlow]       = useState<FlowState>('landing')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [answers, setAnswers] = useState<QuizAnswers>(DEFAULT_ANSWERS)
  const [touched, setTouched] = useState<Set<number>>(new Set()) // which questions have a real user selection

  /* ── Landing complete → start questions ── */
  const handleLandingComplete = useCallback((n: string, e: string) => {
    setName(n)
    setEmail(e)
    setFlow(0)
  }, [])

  /* ── Question selection (single-select only, always overwrites) ── */
  const handleSelect = useCallback((questionIndex: number, value: string) => {
    const field = ANSWER_FIELDS[questionIndex]
    setAnswers((prev) => ({ ...prev, [field]: value }))
    setTouched((prev) => new Set(prev).add(questionIndex))
  }, [])

  const handleNext = useCallback(() => {
    if (typeof flow !== 'number') return
    if (flow < TOTAL_QUESTIONS - 1) {
      setFlow(flow + 1)
    } else {
      setFlow('analyzing')
    }
  }, [flow])

  const handleBack = useCallback(() => {
    if (typeof flow !== 'number') return
    setFlow(Math.max(0, flow - 1))
  }, [flow])

  /* ── Analyzing finished → fire completion write, show results ── */
  const handleAnalyzingDone = useCallback(() => {
    // Fire-and-forget in the background. QuizResults computes the report
    // client-side from the same deterministic logic, so the UI never
    // blocks on this network call succeeding.
    fetch('/api/quiz-submit', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, name, answers }),
    }).catch(() => {
      // Silent — results still render from client-side computation.
    })
    setFlow('results')
  }, [email, name, answers])

  /* ── Render ── */
  if (flow === 'landing') {
    return <QuizLanding onComplete={handleLandingComplete} />
  }

  if (flow === 'analyzing') {
    return <QuizAnalyzing onDone={handleAnalyzingDone} />
  }

  if (flow === 'results') {
    return <QuizResults answers={answers} name={name} />
  }

  // flow is a number 0-7 — question view
  const questionIndex = flow
  const question      = QUESTIONS[questionIndex]
  const field          = ANSWER_FIELDS[questionIndex]
  const currentValue   = answers[field] as string
  const hasSelection   = touched.has(questionIndex) || questionIndex === 0
  // Question 0 (babyAge) has a sensible default pre-selected conceptually,
  // but we still require an explicit tap so the UI doesn't silently skip —
  // canGoNext below enforces that properly.

  return (
    <div className="flex flex-col gap-8">
      <QuizProgress currentStep={questionIndex} totalSteps={TOTAL_QUESTIONS} />
      <QuizStep
        question={question}
        selected={touched.has(questionIndex) ? [currentValue] : []}
        onSelect={(value) => handleSelect(questionIndex, value)}
        onNext={handleNext}
        onBack={handleBack}
        canGoBack={questionIndex > 0}
        canGoNext={touched.has(questionIndex)}
      />
    </div>
  )
}
