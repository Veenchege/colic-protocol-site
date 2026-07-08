import type { Metadata } from 'next'
import { notFound }    from 'next/navigation'
import { MDXRemote }   from 'next-mdx-remote/rsc'
import Header          from '@/components/layout/Header'
import Footer          from '@/components/layout/Footer'
import InlineCTA       from '@/components/ui/InlineCTA'
import Button          from '@/components/ui/Button'
import { ColiTypeBadge } from '@/components/ui/Badge'
import {
  getPostBySlug,
  getAllSlugs,
  CATEGORY_LABELS,
  type BlogPost,
} from '@/lib/blog'

/* ─── Static params — build all blog slugs at deploy time ────── */
export async function generateStaticParams() {
  return getAllSlugs().map((slug) => ({ slug }))
}

/* ─── Dynamic metadata from frontmatter ─────────────────────── */
export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = getPostBySlug(params.slug)
  if (!post) return {}

  return {
    title:       `${post.title} | Colic Protocol`,
    description: post.description,
    alternates:  { canonical: `/blog/${post.slug}` },
    openGraph: {
      title:       post.title,
      description: post.description,
      url:         `/blog/${post.slug}`,
      type:        'article',
      publishedTime: post.date,
    },
    keywords: [post.keyword, 'infant colic', 'colic protocol', 'baby crying'],
  }
}

/* ─── MDX component map ──────────────────────────────────────── */
// Components available inside .mdx files.
// Usage in MDX: <InlineCTA /> or <InlineCTA variant="compact" />
const MDX_COMPONENTS = {
  InlineCTA,
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function BlogPostPage({
  params,
}: {
  params: { slug: string }
}) {
  const post: BlogPost | null = getPostBySlug(params.slug)

  if (!post) notFound()

  const {
    title,
    description,
    date,
    category,
    readingTime,
    coliType,
    content,
  } = post

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })

  return (
    <>
      <Header />

      <main id="main-content">

        {/* ── Post header ── */}
        <section className="bg-bg py-12 md:py-16 border-b border-border2">
          <div className="max-w-2xl mx-auto px-5 md:px-8">

            {/* Category + reading time */}
            <div className="flex flex-wrap items-center gap-3 mb-5">
              <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra
                               bg-terra/8 border border-terra/20 px-2 py-1 rounded">
                {CATEGORY_LABELS[category]}
              </span>
              {coliType !== 'ALL' && <ColiTypeBadge coliType={coliType} />}
              <span className="font-mono text-[9px] tracking-[0.06em] uppercase text-muted2">
                {readingTime} min read
              </span>
            </div>

            {/* Title */}
            <h1 className="font-serif font-bold text-brown text-3xl md:text-[44px] leading-snug mb-4">
              {title}
            </h1>

            {/* Description */}
            <p className="text-muted text-base leading-relaxed mb-5">
              {description}
            </p>

            {/* Meta row */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div>
                <p className="text-xs font-semibold text-brown">Vincent</p>
                <p className="font-mono text-[9px] tracking-wide uppercase text-muted2">
                  Epidemiologist · {formattedDate}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── Article body ── */}
        <article className="bg-bg py-12 md:py-16">
          <div className="max-w-2xl mx-auto px-5 md:px-8">
            {/*
              Tailwind Typography prose styles.
              Requires: npm install @tailwindcss/typography
              Add to globals.css: @plugin "@tailwindcss/typography"
              Or in Tailwind v4 config: plugins: [require('@tailwindcss/typography')]
            */}
            <div className="prose prose-stone prose-sm md:prose-base max-w-none
                            prose-headings:font-serif prose-headings:font-bold prose-headings:text-brown
                            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                            prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
                            prose-p:text-muted prose-p:leading-relaxed
                            prose-strong:text-brown prose-strong:font-semibold
                            prose-a:text-terra prose-a:underline prose-a:underline-offset-2
                            prose-blockquote:border-terra prose-blockquote:text-muted prose-blockquote:italic
                            prose-code:text-terra prose-code:bg-terra/8 prose-code:px-1 prose-code:rounded
                            prose-li:text-muted prose-li:leading-relaxed">
              <MDXRemote source={content} components={MDX_COMPONENTS} />
            </div>
          </div>
        </article>

        {/* ── End-of-post full InlineCTA ── */}
        <div className="max-w-2xl mx-auto px-5 md:px-8 pb-12">
          <InlineCTA variant="default" />
        </div>

        {/* ── Back to blog + quiz CTA ── */}
        <section className="bg-surface border-t border-border2 py-10">
          <div className="max-w-2xl mx-auto px-5 md:px-8 flex flex-col sm:flex-row
                          items-start sm:items-center justify-between gap-5">
            <Button href="/blog" variant="ghost" size="sm">
              &larr; All articles
            </Button>
            <Button href="/quiz" variant="primary" size="sm">
              Find your baby&apos;s colic type &rarr;
            </Button>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
