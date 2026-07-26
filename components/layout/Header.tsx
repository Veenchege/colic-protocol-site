'use client'

import Link from 'next/link'
import { useState } from 'react'
import Button from '@/components/ui/Button'

/**
 * Permanent dark chrome — on every page, not just the homepage hero.
 * On the homepage it blends seamlessly into the night hero below it.
 * On light-body pages it reads as a fixed brand bar (Stripe/Linear
 * pattern), consistent regardless of what background the page content
 * itself uses.
 */
export default function Header() {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 bg-night border-b border-night-line">
      <div className="max-w-6xl mx-auto px-5 md:px-8">
        <div className="h-[68px] flex items-center justify-between">

          <Link
            href="/"
            className="font-serif text-[21px] font-medium text-cream-text tracking-tight shrink-0"
            onClick={close}
          >
            Colic Protocol
          </Link>

          <nav className="hidden md:flex items-center gap-9" aria-label="Main navigation">
            <NavLink href="/about">The Science</NavLink>
            <NavLink href="/blog">Blog</NavLink>
            <Button href="/checklist" variant="primary" size="sm">
              Free Checklist
            </Button>
          </nav>

          <button
            className="md:hidden p-2 -mr-2 text-cream-text/70 hover:text-terra transition-colors rounded focus-visible:outline-2 focus-visible:outline-terra"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={open}
            aria-controls="mobile-nav"
          >
            {open ? <IconX /> : <IconMenu />}
          </button>
        </div>

        {open && (
          <nav
            id="mobile-nav"
            className="md:hidden border-t border-night-line pt-5 pb-6 flex flex-col gap-5"
            aria-label="Mobile navigation"
          >
            <NavLink href="/about" onClick={close}>The Science</NavLink>
            <NavLink href="/blog" onClick={close}>Blog</NavLink>
            <Button href="/checklist" variant="primary" size="md" className="self-start" onClick={close}>
              Free Checklist
            </Button>
          </nav>
        )}
      </div>
    </header>
  )
}

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link href={href} onClick={onClick} className="text-[15px] text-cream-text/65 hover:text-terra transition-colors duration-150">
      {children}
    </Link>
  )
}

function IconMenu() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function IconX() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
