# SEO and Growth: what's built, and what you need to do manually

This covers the parts of "rank for colic on Google" that are actual settings and
accounts, not code. None of it can be done from inside a codebase.

---

## 1. What was added to the site itself

- **`/robots.txt`** and **`/sitemap.xml`** — both generated automatically
  (`app/robots.ts`, `app/sitemap.ts`). The sitemap pulls every blog post from
  `lib/blog.ts`, so a new `.mdx` file in `content/blog/` appears in the sitemap
  on the next build with zero manual editing.
- **Organization + WebSite structured data** on every page (`app/layout.tsx`).
  This is what lets Google associate the site with a real entity rather than
  a bag of unrelated pages.
- **FAQPage structured data** on the homepage FAQ section — this is the
  single highest-value schema addition for a small site, since it's what
  makes the accordion questions eligible to show directly in Google search
  results as expandable snippets, without anyone clicking through first.
- **BlogPosting + BreadcrumbList structured data** on every blog post,
  generated from the post's own frontmatter automatically.
- **3 new blog posts** seeded to round out the category taxonomy you already
  had (`diagnosis` and `timeline` had zero posts before this; `techniques`
  had nothing for the formula-feeding audience specifically). These follow
  the exact same InlineCTA placement and citation pattern as your two
  existing posts, so future posts you write yourself have five examples to
  match instead of two.

## 2. Getting indexed on Google (do this once, takes about 15 minutes)

Search engines don't find a new site on their own with any speed. You have
to tell them it exists.

1. **Google Search Console** — go to [search.google.com/search-console](https://search.google.com/search-console),
   add `colicprotocol.baby` as a property. Verify ownership via the DNS TXT
   record method (Cloudflare makes this easy: paste the TXT record Google
   gives you into your domain's DNS settings, propagates in minutes).
2. **Submit the sitemap** — inside Search Console, go to Sitemaps, submit
   `https://colicprotocol.baby/sitemap.xml`. This tells Google every URL on
   the site in one shot instead of waiting for it to crawl and discover them.
3. **Request indexing on your 3 or 4 most important pages specifically** —
   homepage, `/quiz`, `/blueprint`, and your best blog post. Use the URL
   Inspection tool in Search Console, paste each URL, click "Request
   Indexing." This doesn't guarantee same-day indexing but it moves you to
   the front of the queue instead of waiting for organic crawl discovery,
   which can otherwise take weeks for a low-authority new domain.
4. **Bing Webmaster Tools** — smaller volume than Google, but it's the same
   15-minute process at [bing.com/webmasters](https://www.bing.com/webmasters)
   and Bing's index also feeds ChatGPT's and Copilot's web search, which is
   a real and growing source of traffic now.
5. **Check back in Search Console weekly for the first month.** The Coverage
   and Performance reports will tell you if pages are actually getting
   indexed and what queries are already showing impressions, before you've
   done any deliberate keyword targeting.

## 3. Keyword strategy specific to this niche

You already have real prevalence data sitting in `lib/quiz-logic.ts`
(gut 60-70%, nervous system 20-30%, acoustic 30-40% of cases) and a real
content pattern in your two original posts. The highest-value keyword targets
for a new domain are not the highest-volume terms, they're the ones with
enough intent and specificity that a small site can actually rank for them
within months rather than years:

- **High-intent, low-competition, buy first**: "l reuteri colic dosage",
  "tiger hold colic technique", "paced bottle feeding gassy baby", "brown
  noise vs white noise colic" — these are specific enough that most
  competing content is thin or wrong, which is exactly where a genuinely
  detailed, cited post can outrank a Happiest Baby or Taking Cara Babies
  page that only mentions the topic in passing.
- **Medium-intent, worth the next batch of posts**: "colic vs reflux",
  "formula fed baby colic remedies", "when does colic peak", "signs of gut
  imbalance in newborn" — informational, but the searcher is close to
  wanting a protocol, not just an answer.
- **Avoid leading with**: single-word or generic terms like "colic" or
  "baby crying" alone. These are dominated by Mayo Clinic, WebMD, and the
  hospital systems behind PURPLE, and a new domain will not out-rank
  established medical authority sites on the generic term for a long time,
  regardless of content quality. Rank on the specific, differentiated
  long-tail queries first; the generic term follows once the domain has
  accumulated enough authority, not before.

Each new post should target one keyword phrase, use it in the H1, the
`description` frontmatter field, and naturally 2-3 times in the body. Don't
force it beyond that. Content written for keyword density instead of the
actual reader reads exactly like what it is, and Google's own ranking
systems are specifically tuned to penalize it now, not reward it.

## 4. Backlinks (the part with no code involved)

A backlink is another website linking to yours. It remains one of the
strongest ranking signals there is, and it's also the slowest one to build
honestly. Some concrete, real avenues for a health/parenting niche site:

- **HARO / Featured.com** — this shut down in 2024 under Cision and was
  relaunched free in April 2025 by Featured.com (helpareporter.com). It's
  back, active, and free as of 2026: sign up as a source, you'll get 3 daily
  digest emails of journalist queries, and reply to any parenting, infant
  health, or evidence-based-medicine query where "Epidemiologist" is a
  genuinely relevant credential. A single quote picked up by a mid-size
  outlet is worth more than months of guest posting. **Qwoted** is a
  comparable, also-active alternative worth signing up for in parallel.
- **Parenting and mom-blog guest posts** — genuinely slower and lower-yield
  than it used to be, but a well-targeted guest post on a mid-authority
  parenting blog (not a link farm, an actual publication with real
  readership) with a bio link back to a specific blog post, not just the
  homepage, still works.
- **Digital PR angle specific to this brand**: "an epidemiologist applied
  population-research methodology to his own daughter's colic" is a
  genuinely pitchable human-interest-plus-expertise story for parenting
  and health journalists, distinct from a generic product pitch. That's
  the actual HARO/Qwoted pitch angle, not "check out my product."
  Pitch this as a story, not as a customer, and match the specific
  research/story-mirror language already in your Positioning Doc and
  Authority & Trust Reference (not the "epidemiologist and dad" framing
  as the lead, per what's already documented in the Authority doc about
  leading with the diagnosis claim first, credential as supporting proof,
  not the hook, that reasoning holds for a press pitch too).
- **Directories and resource pages**: search `"colic" "resources" inurl:links`
  and similar patterns for parenting-org resource pages that link out to
  helpful sites, and email a short, specific pitch to be added. Low
  individual value per link, meaningful in aggregate for a brand-new domain.
- **Do not** buy links, do not use link exchange networks, do not use
  automated blog-comment link tools. Google's spam systems catch these
  reliably now, and a manual action penalty is far more damaging than slow
  organic growth. The Facebook Sniper strategy already in your persona doc
  and the TikTok/Instagram/Pinterest presence you already have are also,
  incidentally, a real source of branded search volume over time (people
  searching "colic protocol" by name), which is itself a ranking signal
  Google weighs even though it isn't a backlink.

## 5. What actually moves the needle, roughly in order

1. Fix any remaining funnel-breaking issues before any of the above (per
   your own Master Document's stated priority order, this still applies).
2. Get indexed (Section 2), this is a blocker for everything else and
   takes 15 minutes.
3. Publish consistently against the keyword list in Section 3. Five posts
   is a start, not a finish line. Monthly cadence beats a burst of ten
   posts followed by silence, both for Google's crawl patterns and for
   actually building the "clinical record" positioning your own blog
   header already claims.
4. Backlinks (Section 4) compound slowly. Start now, expect months not
   weeks before it shows up in rankings.
5. Re-check Search Console's Performance report monthly. It will show you
   which queries you're already getting impressions for but not clicks,
   which is usually the cheapest possible next thing to fix (a title tag
   or meta description rewrite costs nothing and can lift click-through
   rate on a query you're already ranking for).
