import Link from 'next/link'

const SOCIALS = [
  { label: 'TikTok',    handle: '@colicprotocol', href: 'https://tiktok.com/@colicprotocol' },
  { label: 'Instagram', handle: '@colicprotocol', href: 'https://instagram.com/colicprotocol' },
  { label: 'Pinterest', handle: '@colicprotocol', href: 'https://pinterest.com/colicprotocol' },
]

const NAV_LINKS = [
  { label: 'The Science',        href: '/about' },
  { label: 'Blog',                href: '/blog' },
  { label: 'Free Checklist',      href: '/checklist' },
  { label: 'The Blueprint',       href: '/blueprint' },
  { label: 'Privacy Policy',      href: '/privacy-policy' },
  { label: 'Medical Disclaimer',  href: '/medical-disclaimer' },
  { label: 'Terms of Use',        href: '/terms' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-warm border-t border-border2 mt-28">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-14 md:py-18">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-12">

          <div>
            <p className="font-serif text-2xl font-semibold text-brown mb-3">Colic Protocol</p>
            <p className="text-sm text-muted leading-relaxed max-w-[240px]">
              Evidence-based infant colic management built by an Epidemiologist.
              Based on Savino et al., Pediatrics 2010.
            </p>
          </div>

          <div>
            <p className="kicker mb-4">Navigation</p>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-2.5">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link href={href} className="text-sm text-muted hover:text-terra transition-colors duration-150">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          <div>
            <p className="kicker mb-4">Follow @colicprotocol</p>
            <ul className="flex flex-col gap-2.5">
              {SOCIALS.map(({ label, handle, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-muted hover:text-terra transition-colors duration-150 group"
                    aria-label={`${label} — ${handle}`}
                  >
                    <span className="font-mono text-[10px] tracking-wide uppercase text-muted2 group-hover:text-terra/70 transition-colors w-16 shrink-0">
                      {label}
                    </span>
                    <span>{handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 mb-6">
          <p className="text-xs text-muted2 leading-relaxed max-w-2xl">
            <strong className="text-muted font-medium">Medical disclaimer:</strong>{' '}
            The information on this website and in the Colic Protocol products is for informational
            purposes only and does not constitute medical advice, diagnosis, or treatment. Always
            consult a qualified healthcare professional for any concerns about your baby&apos;s
            health. If your baby has a fever above 38°C, difficulty breathing, or you are concerned
            about their welfare, contact emergency services immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-muted2 tracking-wide">© {year} Colic Protocol. All rights reserved.</p>
          <p className="font-mono text-[11px] text-muted2 tracking-wide">colicprotocol.baby</p>
        </div>
      </div>
    </footer>
  )
}
