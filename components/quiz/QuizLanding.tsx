'use client'

import { useState, type FormEvent } from 'react'

interface QuizLandingProps {
  onComplete: (name: string, email: string) => void
}

export default function QuizLanding({ onComplete }: QuizLandingProps) {
  const [name, setName]   = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const cleanName  = name.trim()
    const cleanEmail = email.trim()

    if (!cleanName) {
      setError('Please enter your first name.')
      return
    }
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.')
      return
    }

    setLoading(true)

    // Fire the 'started' capture. This is intentionally not blocking —
    // if the network call fails or is slow, the person still gets into
    // the quiz immediately. The completion phase will try the write
    // again with the full answer set, so a failed start-capture here
    // is not a lost lead, just a missed early signal.
    try {
      await fetch('/api/quiz-submit', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: cleanEmail, name: cleanName }),
      })
    } catch {
      // Silent — proceed regardless, matching the original quiz's
      // non-blocking capture behaviour.
    }

    onComplete(cleanName, cleanEmail)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-terra mb-3">
          Step 1 of 2 — Before we start
        </p>
        <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-2">
          Where should we send your report?
        </h2>
        <p className="text-xs text-muted2 leading-relaxed">
          8 questions, about 2 minutes. Your personalised protocol is generated
          instantly and sent to your inbox.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <label
            htmlFor="landing-name"
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 block mb-1.5"
          >
            First name
          </label>
          <input
            id="landing-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Sarah"
            autoComplete="given-name"
            className="w-full px-4 py-3 rounded-card border border-border2 bg-card text-brown text-sm
                       placeholder:text-muted2 placeholder:text-xs
                       focus:outline-none focus:border-terra transition-colors duration-150"
          />
        </div>

        <div>
          <label
            htmlFor="landing-email"
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-muted2 block mb-1.5"
          >
            Email address
          </label>
          <input
            id="landing-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
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

        {error && (
          <p role="alert" className="text-xs text-error leading-relaxed">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={[
            'w-full flex items-center justify-center gap-2 py-4 px-6 rounded-btn',
            'text-sm font-semibold tracking-wide transition-all duration-150 min-h-[52px]',
            loading
              ? 'bg-terra/60 text-white/80 cursor-not-allowed'
              : 'bg-terra text-white hover:bg-terra/90 cursor-pointer',
          ].join(' ')}
        >
          {loading ? 'Starting...' : 'Find my baby\'s colic type'}
        </button>

        <p className="text-[10px] text-muted2 leading-relaxed text-center">
          No spam. Unsubscribe at any time.
        </p>
      </form>
    </div>
  )
}
