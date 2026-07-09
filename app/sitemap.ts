import { MetadataRoute } from 'next'
import { BLOG_POSTS } from '@/lib/blog-data.generated'

const BASE_URL = 'https://colicprotocol.baby'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/blueprint',
    '/checklist',
    '/medical-disclaimer',
    '/privacy-policy',
    '/quiz',
    '/terms',
  ].map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
  }))

  const blogRoutes = BLOG_POSTS.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }))

  return [...staticRoutes, ...blogRoutes]
}
