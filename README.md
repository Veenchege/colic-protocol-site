# Colic Protocol — Static HTML Site

Plain HTML + CSS + JS, no build step, no framework. Every page is one file
you can open and edit directly. This is deliberately the simpler of the two
approaches explored for this project, chosen over the Next.js version.

## What changed in this pass

- **Testimonial flag removed.** Cassie's quote on the homepage no longer has
  a permission-confirmation comment attached, per your request. It's live
  as-is now. Worth knowing: the flag was there because permission for
  public website use (distinct from the original Instagram post) hadn't
  been explicitly confirmed as of the last dashboard note. That fact hasn't
  changed, only the comment reminding you of it has been removed.
- **Gumroad links updated to the real ones**, both `blueprint.html` and
  `quiz.html`'s result screen now point to
  `https://colicprotocol.gumroad.com/l/TheCalmBabyBlueprint` with UTM
  parameters attached, replacing the placeholder `/l/blueprint` slug from
  the earlier draft.
- **Quiz rearchitected for two-phase capture.** This is the biggest
  functional change. Name and email are now collected on the *first*
  screen, before any question is shown, not after the last one. Submitting
  that form fires an immediate MailerLite subscribe call tagged
  `quiz_status: "started"` with no `colic_type` yet, then the visitor
  proceeds into the questions. A second call fires after a result is
  computed, tagged `quiz_status: "completed"` with the actual result.
  This is what lets an abandoned quiz still register in MailerLite instead
  of silently vanishing, set up two automations on the same group: one
  triggered by `quiz_status=started` that nudges after a delay if the
  subscriber hasn't since flipped to `completed`, one triggered by
  `quiz_status=completed` that sends the actual result. Verified end to
  end with a real browser test (Playwright), not just read through: the
  started call fires with an empty `colic_type` before any question
  renders, the completed call fires with the real result after the last
  one, exactly 2 calls total, zero JS errors.
- **Blog section added.** `/blog.html` plus 5 posts in `/blog/`. Two
  (`tiger-hold-guide.html`, `l-reuteri-evidence.html`) are original
  content matching what the separate Next.js exploration had established
  as the site's citation and voice pattern. Three are new
  (`which-type-of-colic-diagnosis.html`, `colic-timeline-when-does-it-end.html`,
  `paced-bottle-feeding-technique.html`), filling categories (diagnosis,
  timeline, formula-feeding technique) that had zero coverage. Every post
  has its own `BlogPosting` + `BreadcrumbList` structured data, matching
  meta description and Open Graph tags, and 3 inline CTAs back to the quiz
  or Blueprint.
- **SEO additions**: `Organization` + `WebSite` structured data on the
  homepage, `FAQPage` structured data on the Blueprint page's existing FAQ
  section (this is the one most likely to actually produce a visible
  change in search results, expandable FAQ snippets directly in Google),
  `sitemap.xml` rewritten to include the blog index, all 5 posts, and the
  legal pages that were previously missing from it entirely.
- Nav and footer on `index.html`, `about.html`, and `blueprint.html` now
  link to `/blog.html`. Legal pages were left with their minimal
  back-to-home header, unchanged, no need to add a full nav there.

## Known, unresolved (carried over, not new)

- **Founder photo**: still a placeholder initials avatar. No photo of
  Vincent exists in any uploaded file. Swap `.found-avatar` in `index.html`
  and `about.html` for a real `<img>` whenever one exists, no other change
  needed.
- **Testimonial permission**: the flag comment is gone per your request,
  but the underlying fact it was flagging, written permission for public
  website use hasn't been separately confirmed as of the last dashboard
  note, hasn't changed. Worth a direct check with Cassie if that hasn't
  happened since.

## File structure

```
/index.html                    Homepage
/quiz.html                     90-second assessment, two-phase capture (see above)
/about.html                    Founder page, Zion story, credential-scope explanation
/blueprint.html                $47 sales page, now with FAQPage structured data
/blog.html                     Blog index, 5 posts, category filter
/blog/*.html                   5 individual posts
/privacy.html, /terms.html, /medical-disclaimer.html
/robots.txt
/sitemap.xml                   Now includes blog + legal pages
/_headers                      Security headers (Cloudflare Pages)
/_redirects                    Redirect rules (currently empty, notes only)
/images/                       Blueprint cover, checklist preview, 11 illustrated diagrams
/functions/api/subscribe.js    Cloudflare Pages Function → MailerLite proxy, now with quiz_status
```

## Deploying to Cloudflare Pages

1. Push this folder to a GitHub repo, or drag-and-drop deploy it directly
   in the Cloudflare Pages dashboard.
2. **Build settings:** none needed. Build command: empty. Output
   directory: `/` (the repo root).
3. **Environment variables** (Pages project → Settings → Environment
   variables, set for both *Production* and *Preview*, then redeploy):
   - `MAILERLITE_API_KEY` — from MailerLite → Integrations → API
   - `MAILERLITE_GROUP_ID` — the subscriber group this assessment feeds into
   - `ALLOWED_ORIGIN` — `https://colicprotocol.baby`
4. **MailerLite custom fields** (Subscribers → Fields → Create field, type:
   Text), create these once if they don't already exist:
   - `name`, `colic_type`, `quiz_status`, `utm_source`, `utm_medium`,
     `utm_campaign`, `utm_term`, `utm_content`
5. **Build the two MailerLite automations** the two-phase capture is
   actually for, on the same group:
   - Trigger: `quiz_status` equals `started` → wait some interval (say 20
     minutes to a few hours) → add a condition step checking whether
     `quiz_status` is still `started` (not `completed`) → if still
     `started`, send a "you started, come finish" email; if it's flipped
     to `completed`, exit the automation without sending, they already
     got the result email from the other automation.
   - Trigger: `quiz_status` equals `completed` → send the actual result
     email, can reference the `colic_type` field to personalize it.
6. Point `colicprotocol.baby` at this Pages project once verified end to
   end on the `*.pages.dev` preview URL first.
7. **Before repointing any bio link:** actually submit the quiz on the
   live preview URL and confirm two things in MailerLite: a subscriber
   appears immediately after just the name/email step (before answering
   any question), tagged `started`, and that same subscriber flips to
   `completed` with the right `colic_type` after finishing. Don't skip
   this, Master Doc v11 and the dashboard both flag past incidents of a
   broken bio link and an unconfirmed broadcast send, this is the same
   category of mistake.

## Verification performed on this build

Not just written and handed over. Checked with actual tooling before
delivery:

- Every internal link and image reference across all 13 HTML files
  resolves to a real file (45 files checked, zero broken references).
- Every inline `<script>` block parses with `node --check`, zero syntax
  errors.
- Every JSON-LD block parses as valid JSON, zero errors.
- `functions/api/subscribe.js` parses with `node --check`.
- No horizontal overflow at 1280px or 390px viewport widths, checked with
  a real headless browser across the homepage and all 5 blog posts.
- All images load successfully (naturalWidth > 0 check), zero broken
  images.
- The full quiz flow, landing form through 5 questions to result, run
  end to end in a real browser: confirmed the `started` MailerLite call
  fires immediately on form submit with no `colic_type`, confirmed the
  `completed` call fires after the result with the correct `colic_type`,
  confirmed exactly 2 calls total, zero JS errors during the whole flow.
- The blog category filter (All / Diagnosis / Evidence / Techniques /
  Timeline) tested interactively, confirmed it correctly shows/hides the
  right post count per category.
