import { type QuizAnswers, buildQuizReport } from '@/lib/quiz-logic'
import { ColiTypeBadge } from '@/components/ui/Badge'
import GuaranteeBlock from '@/components/sections/GuaranteeBlock'

const URGENCY_COPY: Record<string, string> = {
  peak:        'You are at the statistical peak of infant colic, week 6. This is the hardest point on a documented physiological curve.',
  approaching: 'Your baby is approaching the colic peak. Starting now compresses the timeline before episodes intensify further.',
  early:       'Your baby is in the early colic window. Starting now is earlier than most parents do.',
  resolving:   'Your baby may be moving past the peak colic window. The protocol still compresses the remaining timeline.',
}

interface QuizResultsProps {
  answers: QuizAnswers
  name:    string
}

export default function QuizResults({ answers, name }: QuizResultsProps) {
  const report = buildQuizReport(answers)
  const {
    coliType, urgency, prevalence, headline, science,
    mistakes, steps, ctaHook, ctaBody, ctaConsequence,
    protocolList, ctaBtnText, refluxFlag, failureMessage,
  } = report

  const gumroadBlueprint =
    process.env.NEXT_PUBLIC_GUMROAD_BLUEPRINT ??
    'https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint'
  const gumroadChecklist =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  return (
    <div className="flex flex-col gap-6">

      {/* ── Report header ── */}
      <div className="bg-card border border-border2 rounded-card p-7 flex flex-col gap-5">
        <div>
          <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-muted2 mb-2">
            {name ? `${name}'s report` : 'Your report'}
          </p>
          <ColiTypeBadge coliType={coliType} />
        </div>

        <h2 className="font-serif font-bold text-brown text-xl md:text-2xl leading-snug">
          {headline}
        </h2>

        <p className="font-mono text-[10px] tracking-[0.06em] text-muted2 leading-relaxed">
          {prevalence}
        </p>

        <div>
          <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 mb-2">
            What is happening
          </p>
          <p className="text-sm text-muted leading-relaxed">{science}</p>
        </div>

        {failureMessage && (
          <p className="text-xs text-muted leading-relaxed italic border-t border-border pt-4">
            {failureMessage}
          </p>
        )}

        {refluxFlag && (
          <div className="bg-gold/8 border border-gold/25 rounded-card p-4">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-gold mb-1">
              Note, possible reflux
            </p>
            <p className="text-xs text-muted leading-relaxed">
              Crying during or right after feeding can indicate reflux rather
              than classic colic. If symptoms persist, discuss with your
              pediatrician alongside this protocol.
            </p>
          </div>
        )}

        <p className="font-mono text-[10px] tracking-[0.06em] text-muted2 leading-relaxed border-t border-border pt-4">
          {URGENCY_COPY[urgency]}
        </p>
      </div>

      {/* ── 3 mistakes ── */}
      <div className="bg-card border border-border2 rounded-card p-7">
        <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-error mb-4">
          3 mistakes parents with this type make
        </p>
        <div className="flex flex-col gap-3">
          {mistakes.map((m, i) => (
            <div key={i} className="flex gap-3">
              <span className="font-serif font-bold text-error text-lg leading-none flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <p className="text-xs text-muted leading-relaxed">{m}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3-step protocol ── */}
      <div className="bg-terra/5 border border-terra/20 rounded-card p-7">
        <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra mb-4">
          Your 3-step protocol, start tonight
        </p>
        <div className="flex flex-col gap-4">
          {steps.map((s, i) => (
            <div key={i} className="flex gap-3">
              <span className="w-7 h-7 rounded-full bg-terra flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="font-mono text-[10px] text-white font-semibold">{i + 1}</span>
              </span>
              <div>
                <p className="text-sm font-semibold text-brown mb-1">{s.title}</p>
                <p className="text-xs text-muted leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── CTA section ── */}
      <div className="bg-brown rounded-card p-7 flex flex-col gap-4">
        <p className="font-serif font-semibold text-white text-lg leading-snug">
          {ctaHook(name || 'Here\'s the thing')}
        </p>
        <p className="text-xs text-white/70 leading-relaxed">{ctaBody}</p>
        <p className="text-xs text-white/60 leading-relaxed italic border-l-2 border-terra pl-3">
          {ctaConsequence}
        </p>

        <div>
          <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-gold mb-3">
            The Blueprint includes
          </p>
          <ul className="flex flex-col gap-2 mb-5">
            {protocolList.map((item) => (
              <li key={item} className="flex gap-2 text-xs text-white/80 leading-relaxed">
                <span className="text-success flex-shrink-0">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={gumroadBlueprint}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full text-center bg-terra text-white font-semibold text-sm py-4 px-6 rounded-btn
                     hover:bg-terra/90 transition-colors duration-150"
        >
          {ctaBtnText}
        </a>
      </div>

      {/* ── Guarantee ── */}
      <GuaranteeBlock showCTA={false} />

      {/* ── No-purchase option ── */}
      <p className="text-center text-xs text-muted2 leading-relaxed">
        Not ready to buy?{' '}
        <a
          href={gumroadChecklist}
          target="_blank"
          rel="noopener noreferrer"
          className="text-terra underline underline-offset-2 hover:text-terra/80"
        >
          Download the free checklist instead
        </a>
        , your report has already been emailed to you either way.
      </p>
    </div>
  )
}
