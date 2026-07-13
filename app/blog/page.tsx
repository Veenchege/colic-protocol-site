import type { Metadata } from 'next'
import Header   from '@/components/layout/Header'
import Footer   from '@/components/layout/Footer'
import BlogCard from '@/components/ui/BlogCard'
import Button   from '@/components/ui/Button'
import { getAllPosts } from '@/lib/blog'

/* ─── Metadata ───────────────────────────────────────────────── */
export const metadata: Metadata = {
  title:       'Evidence-Based Colic Research — Colic Protocol Blog',
  description: 'Clinical explanations of infant colic — the Tiger Hold, L. reuteri DSM 17938, brown noise, and the three-system model. Written by an Epidemiologist.',
  robots:      { index: true, follow: true },
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function BlogIndexPage() {
  const posts = getAllPosts()

  return (
    <>
      <Header />

      <main id="main-content">

        {/* ── Header ── */}
        <section className="bg-paper py-14 md:py-20 border-b border-border2">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            <p className="kicker text-terra mb-4">
              Evidence-based colic research
            </p>
            <h1 className="font-serif font-bold text-brown text-3xl md:text-[48px] leading-snug mb-4">
              The clinical record.
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed max-w-prose">
              Every post is built from primary literature — not parenting
              opinions, not anecdote. Citations included. Written by an
              Epidemiologist who treated infant colic as a data problem.
            </p>
          </div>
        </section>

        {/* ── Posts grid ── */}
        <section className="bg-paper py-14 md:py-20">
          <div className="max-w-5xl mx-auto px-6 md:px-12">
            {posts.length === 0 ? (
              <div className="text-center py-16">
                <p className="font-serif text-xl text-muted italic">
                  Posts are being migrated. Check back shortly.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {posts.map((post) => (
                  <BlogCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="bg-surface py-12 md:py-16 border-t border-border2">
          <div className="max-w-3xl mx-auto px-6 md:px-12 text-center">
            <h2 className="font-serif font-bold text-brown text-2xl md:text-3xl leading-snug mb-3">
              Ready to apply the research tonight?
            </h2>
            <p className="text-muted text-sm leading-relaxed mb-6 max-w-md mx-auto">
              The free checklist puts the protocol into a four-stage format
              usable one-handed at 3AM.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button href="/quiz" variant="primary" size="md">
                Find your baby&apos;s colic type — free
              </Button>
              <Button href="/checklist" variant="secondary" size="md">
                Download checklist directly
              </Button>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  )
}
