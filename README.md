# Colic Protocol — Local Setup

Every file is already in its correct destination. Follow these steps in order.

## 1. Prerequisites

- Node.js 18.18 or newer (check with `node -v`)
- npm (ships with Node)

## 2. Install dependencies

From inside this folder:

```bash
npm install
```

## 3. Set up environment variables

```bash
cp .env.local.example .env.local
```

Open `.env.local` and fill in real values for:

- `MAILERLITE_API_KEY` — from MailerLite dashboard → Integrations → API
- `MAILERLITE_GROUP_CHECKLIST` — your MailerLite group ID
- `MAILERLITE_GROUP_QUIZ` — your MailerLite group ID
- `NEXT_PUBLIC_SITE_URL` — set to `https://colicprotocol.baby` in production;
  this now also drives the sitemap, robots.txt, and structured data URLs, not
  just Open Graph tags, so it needs to be set correctly before deploying.

**You can run the site locally without real MailerLite keys.** Every page
renders and the quiz UI works end to end. The only thing that fails without
a real key is the final POST to MailerLite when you submit the quiz email
form or the footer subscribe form, you will see a clear error message in
that case, not a crash.

`NEXT_PUBLIC_GUMROAD_CHECKLIST` and `NEXT_PUBLIC_GUMROAD_BLUEPRINT` already
default to your real product URLs directly in code
(`colicprotocol.gumroad.com/l/midnight-emergency-checklist` and
`colicprotocol.gumroad.com/l/TheCalmBabyBlueprint`), so these env vars are
optional overrides now, not required.

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The `predev` and `prebuild` scripts run `scripts/build-blog-data.mjs`
automatically, which reads every `.mdx` file in `content/blog/` and writes
`lib/blog-data.generated.ts`. That generated file is gitignored on purpose,
do not hand-edit it, and do not worry if it's missing after a fresh clone,
it's rebuilt the moment you run `dev` or `build`.

## 5. What to check first

- `/` — homepage, all 12 sections
- `/quiz` — 8-question quiz with email capture before the first question
  (this is intentional, see the comment at the top of
  `app/api/quiz-submit/route.ts`, it's what lets an incomplete quiz still
  get a MailerLite "started" tag for a follow-up email)
- `/checklist` — direct download landing page
- `/blueprint` — the sales page
- `/about` — founder and science page
- `/blog` — should show **5** posts (2 original: Tiger Hold guide, L. reuteri
  evidence; 3 new: which type of colic your baby has, the colic timeline,
  paced bottle feeding)
- `/blog/tiger-hold-guide` — confirms MDX rendering works
- `/sitemap.xml` and `/robots.txt` — new, generated automatically
- `/privacy-policy`, `/medical-disclaimer`, `/terms` — legal pages

See `SEO_AND_GROWTH.md` for what to do with Search Console, sitemaps, and
backlinks once this is deployed. That part can't be done from inside a
codebase, it's covered separately there.

## Known gaps — not blockers, but real

| Gap | Impact | Fix |
|---|---|---|
| No photo of Vincent (`public/images/vincent.jpg`) | `OriginStory` falls back to a "V." mark cleanly, this was already handled correctly, it's just not a photo yet | Supply a photo when ready, it will appear automatically, no code change needed |
| No ESLint config file | `next.config.mjs` sets `eslint: { ignoreDuringBuilds: false }`, meaning a real `next build` will try to run lint and currently has no config to run against | Run `npx next lint` once locally and follow its setup prompt, or add a minimal `.eslintrc.json` extending `next/core-web-vitals` |
| MailerLite keys unset | Quiz and footer subscribe forms will show an error on submit | Add real keys to `.env.local` |
| Frontmatter `slug` field on `tiger-hold-guide.mdx` doesn't match its actual URL | The real slug is the filename (`tiger-hold-guide`), not the frontmatter `slug: "tiger-hold-colic-guide"` value, `build-blog-data.mjs` uses the filename and silently ignores the frontmatter field | Not urgent, just don't rename the file expecting the frontmatter slug to take effect, it doesn't. New posts added this round use matching filename/frontmatter slugs to avoid the same confusion going forward |

## Deploying

This is built for **Cloudflare Pages** via the OpenNext adapter
(`wrangler.jsonc`, `@opennextjs/cloudflare` in `devDependencies`), not
Vercel. To deploy:

1. Push this folder to a GitHub repo
2. Connect the repo in the Cloudflare Pages dashboard, or deploy directly
   with `npx wrangler pages deploy` after building
3. Add every `.env.local` variable to Cloudflare Pages → Settings →
   Environment Variables (as **secrets** for `MAILERLITE_API_KEY`
   specifically, never as a plain build variable)
4. Point `colicprotocol.baby`'s DNS at Cloudflare (it's already presumably
   on Cloudflare given the domain setup described in your own Master
   Document, so this may already be done)

Do this after confirming locally that everything works the way you want it
to, that's the point of testing locally first.

---

## Changelog: this pass

Starting point was the uploaded `colic-protocol-site-v2.zip`, the real
production codebase. Nothing architectural was changed, the quiz's two-phase
MailerLite capture, the MDX blog pipeline, the Cloudflare/OpenNext setup,
were all left exactly as they were. What changed:

- **Fixed a real bug**: `OriginStory.tsx` was a Server Component passing an
  `onError` function prop directly to an `<img>` tag, which Next.js App
  Router does not allow and which would have failed `npm run build` the
  first time anyone actually ran it. Extracted the image-with-fallback into
  a new small Client Component, `components/ui/FounderPhoto.tsx`. Verified
  with a real `next build`, not just inspection.
- **Fixed 114 em-dash violations** across the codebase (titles, meta
  descriptions, FAQ answers, quiz result copy, body text) that were
  breaking your own no-em-dash brand rule, the one `build-blog-data.mjs`
  already enforces for MDX frontmatter but which never got applied to the
  actual page components. Replaced with hyphens, matching the exact
  substitution your own blog posts already use. Left developer-facing code
  comments untouched, this only touched user-visible and screen-reader-
  visible text.
- **Added SEO infrastructure that was missing entirely**: `app/robots.ts`,
  `app/sitemap.ts` (auto-includes every blog post), Organization + WebSite
  structured data site-wide, FAQPage structured data on the homepage FAQ,
  BlogPosting + BreadcrumbList structured data on every post.
- **Added 3 new blog posts** to fill gaps in your existing category
  taxonomy (`diagnosis` and `timeline` had zero posts, `techniques` had
  nothing for formula-feeding specifically).
- **Confirmed correct, changed nothing**: both Gumroad URLs were already
  the real ones you sent, not placeholders.
- **Confirmed nothing to remove**: there was no permission-gating comment
  attached to Cassie's testimonial in this codebase specifically, that flag
  existed in an earlier, separate deliverable. It's live here as-is.
- Everything else (quiz logic, MailerLite integration, component structure,
  copy voice, page composition) is untouched from what was uploaded.

## Changelog: deployment fix (this pass)

Your Cloudflare Pages build failed with:

```
TypeError [ERR_PARSE_ARGS_UNEXPECTED_POSITIONAL]: Unexpected argument 'build'.
```

**What was actually wrong**: `package.json` had `"@opennextjs/cloudflare": "^0.3.0"`,
which resolved to `0.3.10`. That version's CLI predates the current
`opennextjs-cloudflare build / preview / deploy` subcommand structure, it
only understood flags, not a positional `build` argument. The `build`
subcommand itself is correct, current, official syntax, the installed
package was just too old to know it.

**Why the fix isn't just "install latest"**: `@opennextjs/cloudflare@1.20.2`
(current latest) requires Next.js `>=15.5.21 <16 || >=16.2.11` as a peer
dependency. This project is on Next.js `14.2.35`. Jumping to the latest
adapter version would have forced a Next.js 14 → 15/16 major upgrade on top
of it, a much bigger, riskier change than a build-config fix, with its own
breaking changes (async `cookies()`/`headers()`/`params`, etc.) that would
need separate, careful verification against every page and API route in
this project.

**What was actually done, and verified for real**:

1. Bisected npm's version history and confirmed `@opennextjs/cloudflare@1.15.1`
   is the newest release that still declares Next.js 14.2.35 as a
   compatible peer (`1.16.0` onward drops Next 14 support entirely). Pinned
   to that exact version, not a caret range, so a future `npm install`
   can't silently drift onto a version that breaks the peer requirement
   again.
2. Added `open-next.config.ts` at the project root. Current
   `@opennextjs/cloudflare` versions require this file to exist; the old
   0.3.x line didn't, so it was never added.
3. Added `initOpenNextCloudflareForDev()` to `next.config.mjs`, required
   since the 0.4 line for local `next dev` to work correctly against the
   Cloudflare bindings.
4. **Ran the actual failing command** (`npx opennextjs-cloudflare build`)
   in a real environment after the fix, not just inspected the config. It
   completed successfully end to end: all 22 routes built, `.open-next/worker.js`
   and `.open-next/assets` generated, matching exactly what `wrangler.jsonc`'s
   `pages_build_output_dir` expects.

**One thing to actually do**: commit the updated `package-lock.json` (or
whichever lockfile your setup generates) alongside `package.json` after
running `npm install` yourself once, so Cloudflare's build installs the
exact same dependency tree that was just verified, rather than re-resolving
ranges fresh on every build.

