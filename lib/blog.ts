/**
 * lib/blog.ts
 *
 * Zero filesystem dependency. Reads from lib/blog-data.generated.ts,
 * which is produced by scripts/build-blog-data.mjs before Next.js runs.
 *
 * This file used to call fs.readFileSync directly, which risked a broken
 * build on Cloudflare's Workers runtime (no fs support at the edge, and
 * OpenNext's bundler has a documented history of pulling fs-touching
 * code into the edge bundle even when it's logically build-time-only).
 * Moving the file reading into a separate prebuild script removes that
 * risk entirely rather than hoping the adapter handles it gracefully.
 *
 * If BLOG_POSTS is missing, run `npm run dev` or `npm run build` once,
 * the prebuild/predev script generates it automatically.
 */

import { BLOG_POSTS } from './blog-data.generated'

/* ─── Types ──────────────────────────────────────────────────── */
export type BlogCategory = 'techniques' | 'evidence' | 'timeline' | 'diagnosis'
export type ColiTypeTag  = 'GUT' | 'NS' | 'ACOUSTIC' | 'ALL'

export interface BlogPostFrontmatter {
  title:       string
  description: string
  date:        string
  slug:        string
  keyword:     string
  category:    BlogCategory
  readingTime: number
  coliType:    ColiTypeTag
}

export interface BlogPost extends BlogPostFrontmatter {
  content: string
}

export type BlogPostMeta = BlogPostFrontmatter

/* ─── Get all slugs ──────────────────────────────────────────── */
export function getAllSlugs(): string[] {
  return BLOG_POSTS.map((p) => p.slug)
}

/* ─── Get one post (with content) ───────────────────────────── */
export function getPostBySlug(slug: string): BlogPost | null {
  const post = BLOG_POSTS.find((p) => p.slug === slug)
  if (!post) return null
  return post as BlogPost
}

/* ─── Get all posts (metadata only, already sorted newest first) ── */
export function getAllPosts(): BlogPostMeta[] {
  return BLOG_POSTS.map(({ content: _content, ...meta }) => meta as BlogPostMeta)
}

/* ─── Category label map ─────────────────────────────────────── */
export const CATEGORY_LABELS: Record<BlogCategory, string> = {
  techniques: 'Technique',
  evidence:   'Evidence',
  timeline:   'Timeline',
  diagnosis:  'Diagnosis',
}
