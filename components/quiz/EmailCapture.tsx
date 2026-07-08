'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { type QuizAnswers } from '@/lib/quiz-logic'

/* ─── Types ──────────────────────────────────────────────────── */
interface EmailCaptureProps {
  answers:    QuizAnswers
  coliType:   string     // GUT | NS | ACOUSTIC | MIXED — from client-side segmentation
  /** Called when submission succeeds — lets QuizContainer show a success state */
  onSuccess?: (coliType: string) => void
}

/* ─── Component ──────────────────────────────────────────────── */
export default function EmailCapture({
  answers,
  coliType,
  onSuccess,
}: EmailCaptureProps) {
  const router = useRouter()

  const [email,   setEmail]   = useState('')
  const [name,    setName]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  const gumroadFallback =
    process.env.NEXT_PUBLIC_GUMROAD_CHECKLIST ??
    'https://colicprotocol.gumroad.com/l/midnight-emergency-checklist'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const trimmedEmail = email.trim()
    if (!trimmedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/quiz-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          email:   trimmedEmail,
          name:    name.trim() || undefined,
          answers,
        }),
      })

      const data = await res.json() as {
        success?:  boolean
        coliType?: string
        error?:    string
      }

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? 'Submission failed. Please try again.')
      }

      const confirmedType = data.coliType ?? coliType

      /* Notify parent container */
      onSuccess?.(confirmedType)

      /* Redirect to thank-you page with coli type in search params */
      router.push(`/thank-you?type=${confirmedType}`)

    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.'
      setError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Prompt */}
      <div>
        <p className="font-serif font-semibold text-brown text-lg md:text-xl leading-snug mb-1">
          Where should we send your personalised protocol?
        </p>
        <p className="text-xs text-muted leading-relaxed">
          Your email receives the{' '}
          <span className="text-terra font-medium">
            {coliType === 'GUT'      ? 'Gut Reset Protocol'        :
             coliType === 'NS'       ? 'Nervous System Protocol'   :
             coliType === 'ACOUSTIC' ? 'Acoustic Reset Protocol'   :
             'Three-System Protocol'}
          </span>{' '}
          — calibrated to your baby&apos;s specific presentation. No spam.
          Unsubscribe any time.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">

        {/* Name (optional) */}
        <div>
          <label
            htmlFor="quiz-name"
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 block mb-1.5"
          >
            First name <span className="text-muted2">(optional)</span>
          </label>
          <input
            id="quiz-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah"
            autoComplete="given-name"
            className={[
              'w-full px-4 py-3 rounded-card border bg-card text-brown text-sm',
              'placeholder:text-muted2 placeholder:text-xs',
              'focus:outline-none focus:border-terra transition-colors duration-150',
              'border-border2',
            ].join(' ')}
          />
        </div>

        {/* Email (required) */}
        <div>
          <label
            htmlFor="quiz-email"
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 block mb-1.5"
          >
            Email address <span className="text-error text-[10px]">*</span>
          </label>
          <input
            id="quiz-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
            inputMode="email"
            className={[
              'w-full px-4 py-3 rounded-card border bg-card text-brown text-sm',
              'placeholder:text-muted2 placeholder:text-xs',
              'focus:outline-none focus:border-terra transition-colors duration-150',
              error ? 'border-error' : 'border-border2',
            ].join(' ')}
          />
        </div>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="bg-error/8 border border-error/25 rounded-card p-3 flex flex-col gap-1.5"
          >
            <p className="text-xs text-error leading-relaxed">{error}</p>
            <a
              href={gumroadFallback}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-terra underline underline-offset-2 hover:text-terra/80"
            >
              Download the checklist directly instead
            </a>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={[
            'w-full flex items-center justify-center gap-2',
            'py-4 px-6 rounded-btn text-sm font-semibold tracking-wide',
            'transition-all duration-150 min-h-[52px]',
            loading
              ? 'bg-terra/60 text-white/80 cursor-not-allowed'
              : 'bg-terra text-white hover:bg-terra/90 cursor-pointer',
          ].join(' ')}
        >
          {loading ? (
            <>
              <SpinnerIcon />
              Sending your protocol...
            </>
          ) : (
            'Send my protocol'
          )}
        </button>

        {/* Legal */}
        <p className="text-[10px] text-muted2 leading-relaxed text-center">
          By submitting, you agree to receive emails from Colic Protocol.
          No spam. Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}

/* ─── Spinner ────────────────────────────────────────────────── */
function SpinnerIcon() {
  return (
    <svg
      className="animate-spin w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  )
}
