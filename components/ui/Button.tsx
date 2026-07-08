import Link from 'next/link'
import { type ComponentPropsWithoutRef, type ReactNode } from 'react'

/* ─── Types ──────────────────────────────────────────────────── */
type Variant = 'primary' | 'secondary' | 'ghost'
type Size    = 'sm' | 'md' | 'lg'

interface BaseProps {
  variant?:   Variant
  size?:      Size
  children:   ReactNode
  className?: string
  external?:  boolean
}

type AsButton = BaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, keyof BaseProps> & {
    href?: undefined
  }

type AsLink = BaseProps & {
  href:      string
  onClick?:  () => void
  external?: boolean
}

type ButtonProps = AsButton | AsLink

/* ─── Style maps ─────────────────────────────────────────────── */
const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-terra text-white border border-terra ' +
    'hover:bg-terra/90 active:bg-terra/80',
  secondary:
    'bg-transparent text-terra border border-terra ' +
    'hover:bg-terra/10 active:bg-terra/15',
  ghost:
    'bg-transparent text-terra border border-transparent ' +
    'underline-offset-4 hover:underline',
}

const SIZES: Record<Size, string> = {
  sm: 'text-xs  px-5 py-2.5 tracking-wide font-medium',
  md: 'text-sm  px-6 py-3   tracking-wide font-medium',
  lg: 'text-base px-8 py-[14px] tracking-wide font-semibold',
}

/* ─── Component ──────────────────────────────────────────────── */
export default function Button({
  variant   = 'primary',
  size      = 'md',
  children,
  className = '',
  external  = false,
  href,
  ...rest
}: ButtonProps) {
  const base = [
    'inline-flex items-center justify-center gap-2',
    'rounded-btn transition-all duration-150 cursor-pointer',
    'select-none whitespace-nowrap min-h-[44px]',
    'focus-visible:outline-2 focus-visible:outline-terra focus-visible:outline-offset-2',
    VARIANTS[variant],
    SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  /* Render as external anchor */
  if (href && external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={base}
      >
        {children}
      </a>
    )
  }

  /* Render as Next.js Link */
  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  }

  /* Render as <button> */
  return (
    <button
      className={base}
      {...(rest as ComponentPropsWithoutRef<'button'>)}
    >
      {children}
    </button>
  )
}
