import Link from 'next/link'
import { type BlogPostMeta, CATEGORY_LABELS } from '@/lib/blog'

export default function BlogCard({ post }: { post: BlogPostMeta }) {
  const { slug, title, description, date, category, readingTime } = post

  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    year:  'numeric',
    month: 'long',
    day:   'numeric',
  })

  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col bg-card border border-border2 rounded-card p-6
                 hover:border-terra/40 transition-colors duration-150"
    >
      {/* Category + reading time */}
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-terra
                         bg-terra/8 border border-terra/20 px-2 py-1 rounded">
          {CATEGORY_LABELS[category]}
        </span>
        <span className="font-mono text-[9px] tracking-[0.06em] uppercase text-muted2">
          {readingTime} min read
        </span>
      </div>

      {/* Title */}
      <h2 className="font-serif font-semibold text-brown text-lg leading-snug mb-2
                     group-hover:text-terra transition-colors duration-150">
        {title}
      </h2>

      {/* Description */}
      <p className="text-xs text-muted leading-relaxed flex-1 mb-4">
        {description}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="font-mono text-[9px] tracking-wide text-muted2">
          {formattedDate}
        </span>
        <span className="font-mono text-[9px] tracking-wide text-terra
                         group-hover:translate-x-0.5 transition-transform duration-150">
          Read &rarr;
        </span>
      </div>
    </Link>
  )
}
