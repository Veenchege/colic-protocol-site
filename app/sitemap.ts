import type { MetadataRoute } from 'next'
import { getAllPosts } from '@/lib/blog'

/**
 * app/sitemap.ts
 *
 * Next.js App Router convention — generates /sitemap.xml automatically.
 * Blog posts are pulled from lib/blog.ts, so every new .mdx file you add
 * to content/blog/ appears here on the next build with zero manual edits.
 *
 * priority / changeFrequency are hints only — Google has said publicly it
 * mostly ignores them, but they cost nothing to set sensibly and some
 * other crawlers (Bing, and internal site-search tools) do use them.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colicprotocol.baby'
  const posts = getAllPosts()

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`,                  changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${siteUrl}/quiz`,               changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/blueprint`,          changeFrequency: 'monthly', priority: 0.9 },
    { url: `${siteUrl}/checklist`,          changeFrequency: 'monthly', priority: 0.8 },
    { url: `${siteUrl}/blog`,               changeFrequency: 'weekly',  priority: 0.8 },
    { url: `${siteUrl}/about`,              changeFrequency: 'monthly', priority: 0.6 },
    { url: `${siteUrl}/privacy-policy`,     changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${siteUrl}/terms`,              changeFrequency: 'yearly',  priority: 0.2 },
    { url: `${siteUrl}/medical-disclaimer`, changeFrequency: 'yearly',  priority: 0.2 },
  ]

  const blogRoutes: MetadataRoute.Sitemap = posts.map((post) => ({
    url:            `${siteUrl}/blog/${post.slug}`,
    lastModified:   new Date(post.date),
    changeFrequency: 'monthly' as const,
    priority:       0.7,
  }))

  return [...staticRoutes, ...blogRoutes]
}
