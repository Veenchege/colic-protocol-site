/* ─── Types ──────────────────────────────────────────────────── */
export interface QuestionOption {
  value:      string
  label:      string
  sublabel?:  string   // small clarifying text shown below the label
}

export interface Question {
  id:       string
  label:    string         // eyebrow / category label
  title:    string         // the actual question text
  hint?:    string         // shown below the title
  type:     'single' | 'multi'
  options:  QuestionOption[]
}

interface QuizStepProps {
  question:    Question
  selected:    string[]    // current selected value(s)
  onSelect:    (value: string) => void
  onNext:      () => void
  onBack:      () => void
  canGoBack:   boolean
  canGoNext:   boolean     // false for single-select with no selection yet
}

/* ─── Component ──────────────────────────────────────────────── */
export default function QuizStep({
  question,
  selected,
  onSelect,
  onNext,
  onBack,
  canGoBack,
  canGoNext,
}: QuizStepProps) {
  const isMulti = question.type === 'multi'

  return (
    <div className="flex flex-col gap-6">

      {/* Question header */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-3">
          {question.label}
        </p>
        <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-2">
          {question.title}
        </h2>
        {question.hint && (
          <p className="text-xs text-muted2 leading-relaxed">{question.hint}</p>
        )}
        {isMulti && (
          <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 mt-2">
            Select all that apply
          </p>
        )}
      </div>

      {/* Options */}
      <div
        className="grid grid-cols-1 gap-2"
        role={isMulti ? 'group' : 'radiogroup'}
        aria-label={question.title}
      >
        {question.options.map(({ value, label, sublabel }) => {
          const isSelected = selected.includes(value)

          return (
            <button
              key={value}
              type="button"
              onClick={() => onSelect(value)}
              role={isMulti ? 'checkbox' : 'radio'}
              aria-checked={isSelected}
              className={[
                'w-full text-left px-4 py-3.5 rounded-card border-2 transition-all duration-150',
                'focus-visible:outline-2 focus-visible:outline-terra focus-visible:outline-offset-2',
                'flex items-start gap-3',
                isSelected
                  ? 'border-terra bg-terra/8 text-brown'
                  : 'border-border2 bg-card text-muted hover:border-terra/50 hover:bg-terra/4',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              {/* Selection indicator */}
              <span
                className={[
                  'flex-shrink-0 mt-0.5 transition-all duration-150',
                  isMulti
                    ? 'w-4 h-4 rounded border-2 flex items-center justify-center'
                    : 'w-4 h-4 rounded-full border-2 flex items-center justify-center',
                  isSelected
                    ? 'border-terra bg-terra'
                    : 'border-muted2 bg-transparent',
                ]
                  .filter(Boolean)
                  .join(' ')}
                aria-hidden="true"
              >
                {isSelected && (
                  isMulti ? (
                    /* Checkmark */
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1.5 5l2.5 2.5L8.5 2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : (
                    /* Radio dot */
                    <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                  )
                )}
              </span>

              {/* Label */}
              <span className="flex flex-col gap-0.5 min-w-0">
                <span className="text-sm font-medium leading-snug">{label}</span>
                {sublabel && (
                  <span className="text-[11px] text-muted2 leading-relaxed font-normal">
                    {sublabel}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        {/* Back */}
        {canGoBack ? (
          <button
            type="button"
            onClick={onBack}
            className="text-sm text-muted hover:text-terra transition-colors duration-150 flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M19 12H5M12 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
        ) : (
          <span />
        )}

        {/* Next */}
        <button
          type="button"
          onClick={onNext}
          disabled={!canGoNext}
          className={[
            'inline-flex items-center gap-2 px-6 py-3 rounded-btn text-sm font-medium',
            'transition-all duration-150 min-h-[44px]',
            canGoNext
              ? 'bg-terra text-white hover:bg-terra/90 cursor-pointer'
              : 'bg-border2 text-muted2 cursor-not-allowed',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {isMulti ? 'Continue' : 'Next'}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
