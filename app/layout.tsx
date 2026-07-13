import type { Metadata } from 'next'
import { Fraunces, Inter, DM_Mono } from 'next/font/google'
import './globals.css'

/* ─── Fonts ─────────────────────────────────────────────────── */
const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-dm-mono',
  display: 'swap',
})

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title: {
    default: 'Colic Protocol — Evidence-Based Infant Colic Management',
    template: '%s | Colic Protocol',
  },
  description:
    'The evidence-based infant colic management protocol built by an Epidemiologist. Free 3AM Emergency Checklist. Based on Savino et al., Pediatrics 2010. Used in 20+ countries.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colicprotocol.baby'
  ),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: '/',
    siteName: 'Colic Protocol',
    images: [
      {
        url: '/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Colic Protocol — Evidence-Based Infant Colic Management',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
}

/* ─── GTM snippet ────────────────────────────────────────────── */
// Only injects when NEXT_PUBLIC_GTM_ID is set.
// No Meta Pixel. No other third-party scripts. Ever.
function GTMScript() {
  const gtmId = process.env.NEXT_PUBLIC_GTM_ID
  if (!gtmId) return null
  return (
    <>
      <script
        id="gtm-script"
        dangerouslySetInnerHTML={{
          __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');`,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  )
}

/* ─── Root Layout ────────────────────────────────────────────── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${inter.variable} ${dmMono.variable}`}
    >
      <head>
        <GTMScript />
      </head>
      <body>{children}</body>
    </html>
  )
}
