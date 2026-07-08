import { MetadataRoute } from 'next'
import { getAllSlugs } from '@/lib/blog'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colicprotocol.baby'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                  priority: 1.0, changeFrequency: 'weekly'  },
    { url: `${SITE_URL}/quiz`,               priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/checklist`,          priority: 0.9, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/blueprint`,          priority: 0.8, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/about`,              priority: 0.7, changeFrequency: 'monthly' },
    { url: `${SITE_URL}/blog`,               priority: 0.7, changeFrequency: 'weekly'  },
    { url: `${SITE_URL}/privacy-policy`,     priority: 0.2, changeFrequency: 'yearly'  },
    { url: `${SITE_URL}/medical-disclaimer`, priority: 0.2, changeFrequency: 'yearly'  },
    { url: `${SITE_URL}/terms`,              priority: 0.2, changeFrequency: 'yearly'  },
  ]

  // Every blog post, pulled live from the generated blog data.
  // New posts appear here automatically on the next build, nobody
  // has to remember to hand-add a sitemap entry.
  const blogRoutes: MetadataRoute.Sitemap = getAllSlugs().map((slug) => ({
    url: `${SITE_URL}/blog/${slug}`,
    priority: 0.6,
    changeFrequency: 'monthly' as const,
  }))

  return [...staticRoutes, ...blogRoutes]
}
