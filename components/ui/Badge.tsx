import { type ReactNode } from 'react'

/* ─── Types ──────────────────────────────────────────────────── */
export type BadgeVariant =
  | 'gut' | 'ns' | 'acoustic' | 'mixed'
  | 'success' | 'warning' | 'error' | 'muted'
  | 'terra' | 'sage' | 'gold'

interface BadgeProps {
  variant?:   BadgeVariant
  children:   ReactNode
  className?: string
  dot?:       boolean
}

/* ─── Style map ──────────────────────────────────────────────── */
/* `ns` (Nervous System) previously referenced an undefined `purple`
   token and silently rendered Tailwind's default violet-500 — off
   brand, and inconsistent with the terra/mauve/sage system used
   everywhere else. Mapped to --color-mauve, which was defined and
   unused until this fix. */
const STYLES: Record<BadgeVariant, string> = {
  gut:      'bg-terra/10    text-terra   border-terra/25',
  ns:       'bg-mauve/12    text-mauve   border-mauve/30',
  acoustic: 'bg-sage/10     text-sage    border-sage/30',
  mixed:    'bg-gold/10     text-gold    border-gold/30',
  success:  'bg-success/10  text-success border-success/25',
  warning:  'bg-gold/10     text-gold    border-gold/30',
  error:    'bg-error/10    text-error   border-error/25',
  muted:    'bg-muted2/10   text-muted   border-muted2/25',
  terra:    'bg-terra/10    text-terra   border-terra/25',
  sage:     'bg-sage/10     text-sage    border-sage/30',
  gold:     'bg-gold/10     text-gold    border-gold/30',
}

const DOT_COLOURS: Record<BadgeVariant, string> = {
  gut: 'bg-terra', ns: 'bg-mauve', acoustic: 'bg-sage', mixed: 'bg-gold',
  success: 'bg-success', warning: 'bg-gold', error: 'bg-error',
  muted: 'bg-muted2', terra: 'bg-terra', sage: 'bg-sage', gold: 'bg-gold',
}

/* ─── Colic type labels ──────────────────────────────────────── */
export const COLI_TYPE_LABELS: Record<string, string> = {
  GUT: 'Gut-Primary Colic', NS: 'Nervous System Colic',
  ACOUSTIC: 'Acoustic Colic', MIXED: 'Multi-System Colic',
}

export const COLI_TYPE_VARIANTS: Record<string, BadgeVariant> = {
  GUT: 'gut', NS: 'ns', ACOUSTIC: 'acoustic', MIXED: 'mixed',
}

/* ─── Component ──────────────────────────────────────────────── */
export default function Badge({
  variant = 'muted', children, className = '', dot = false,
}: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center gap-1.5',
        'font-mono text-[10px] tracking-[0.07em] uppercase',
        'px-2.5 py-1 rounded-full border',
        'whitespace-nowrap leading-none',
        STYLES[variant],
        className,
      ].filter(Boolean).join(' ')}
    >
      {dot && (
        <span
          className={['inline-block w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLOURS[variant]].join(' ')}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  )
}

export function ColiTypeBadge({ coliType, className }: { coliType: string; className?: string }) {
  return (
    <Badge variant={COLI_TYPE_VARIANTS[coliType] ?? 'muted'} dot className={className}>
      {COLI_TYPE_LABELS[coliType] ?? coliType}
    </Badge>
  )
}
