import Link from 'next/link'

/* ─── Social handle data ─────────────────────────────────────── */
const SOCIALS = [
  { label: 'TikTok',     handle: '@colicprotocol', href: 'https://tiktok.com/@colicprotocol'     },
  { label: 'Instagram',  handle: '@colicprotocol', href: 'https://instagram.com/colicprotocol'   },
  { label: 'Pinterest',  handle: '@colicprotocol', href: 'https://pinterest.com/colicprotocol'   },
]

const NAV_LINKS = [
  { label: 'The Science',       href: '/about'              },
  { label: 'Blog',              href: '/blog'               },
  { label: 'Free Checklist',    href: '/checklist'          },
  { label: 'The Blueprint',     href: '/blueprint'          },
  { label: 'Privacy Policy',    href: '/privacy-policy'     },
  { label: 'Medical Disclaimer',href: '/medical-disclaimer' },
  { label: 'Terms of Use',      href: '/terms'              },
]

/* ─── Component ──────────────────────────────────────────────── */
export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-surface border-t border-border2 mt-24">
      <div className="max-w-6xl mx-auto px-5 md:px-8 py-12 md:py-16">

        {/* ── Top row ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 mb-10">

          {/* Brand */}
          <div>
            <p className="font-serif text-xl font-semibold text-brown mb-2">
              Colic Protocol
            </p>
            <p className="text-xs text-muted leading-relaxed max-w-[220px]">
              Evidence-based infant colic management built by an
              Epidemiologist. Based on Savino et al., Pediatrics 2010.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted2 mb-4">
              Navigation
            </p>
            <nav aria-label="Footer navigation">
              <ul className="flex flex-col gap-2">
                {NAV_LINKS.map(({ label, href }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-xs text-muted hover:text-terra transition-colors duration-150"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Social */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-muted2 mb-4">
              Follow @colicprotocol
            </p>
            <ul className="flex flex-col gap-2">
              {SOCIALS.map(({ label, handle, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs text-muted hover:text-terra transition-colors duration-150 group"
                    aria-label={`${label} — ${handle}`}
                  >
                    <span className="font-mono text-[9px] tracking-wide uppercase text-muted2 group-hover:text-terra/70 transition-colors w-16 shrink-0">
                      {label}
                    </span>
                    <span>{handle}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Medical disclaimer ── */}
        <div className="border-t border-border pt-8 mb-6">
          <p className="text-[11px] text-muted2 leading-relaxed max-w-2xl">
            <strong className="text-muted font-medium">Medical disclaimer:</strong>{' '}
            The information on this website and in the Colic Protocol products
            is for informational purposes only and does not constitute medical
            advice, diagnosis, or treatment. Always consult a qualified
            healthcare professional for any concerns about your baby&apos;s
            health. If your baby has a fever above 38°C, difficulty breathing,
            or you are concerned about their welfare, contact emergency
            services immediately.
          </p>
        </div>

        {/* ── Copyright ── */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-mono text-[10px] text-muted2 tracking-wide">
            © {year} Colic Protocol. All rights reserved.
          </p>
          <p className="font-mono text-[10px] text-muted2 tracking-wide">
            colicprotocol.baby
          </p>
        </div>
      </div>
    </footer>
  )
}
