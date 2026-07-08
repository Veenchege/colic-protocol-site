interface QuizProgressProps {
  currentStep: number   // 0-indexed, 0 to 4
  totalSteps:  number   // always 5
}

const STEP_LABELS = [
  'Baby age',
  'Feeding method',
  'Cry pattern',
  'Symptoms',
  'What you have tried',
]

export default function QuizProgress({
  currentStep,
  totalSteps,
}: QuizProgressProps) {
  const percent = Math.round(((currentStep) / totalSteps) * 100)

  return (
    <div className="w-full">
      {/* Top row */}
      <div className="flex items-center justify-between mb-2">
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-terra">
          {STEP_LABELS[currentStep] ?? 'Complete'}
        </p>
        <p className="font-mono text-[10px] tracking-[0.08em] text-muted2">
          {currentStep + 1} of {totalSteps}
        </p>
      </div>

      {/* Progress track */}
      <div
        className="w-full h-1 bg-border2 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Quiz progress: question ${currentStep + 1} of ${totalSteps}`}
      >
        <div
          className="h-full bg-terra rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}
