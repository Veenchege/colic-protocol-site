import type { MetadataRoute } from 'next'

/**
 * app/robots.ts
 *
 * Next.js App Router convention — this file generates /robots.txt
 * automatically at build time. No static robots.txt needed alongside it;
 * having both would conflict (Next.js would 404 on this route if a static
 * one exists in /public).
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colicprotocol.baby'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',        // server routes, nothing to index
          '/thank-you',   // post-purchase confirmation, not a landing page
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  }
}
