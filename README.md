# Colic Protocol — Local Setup

This is the assembled project from all 8 build sections. Every file is
already in its correct destination. Follow these steps in order.

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

**You can run the site locally without real MailerLite keys.** Every page
renders and the quiz UI works end to end. The only thing that fails without
a real key is the final POST to MailerLite when you submit the quiz email
form or the footer subscribe form — you will see a clear error message in
that case, not a crash.

Leave `NEXT_PUBLIC_GUMROAD_CHECKLIST` and `NEXT_PUBLIC_GUMROAD_BLUEPRINT` as
the placeholder URLs for now, or point them at your real Gumroad product
pages if you already have them live.

## 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 5. What to check first

- `/` — homepage, all 12 sections
- `/quiz` — the 5-question quiz, complete it once to see the results page and email form
- `/checklist` — direct download landing page
- `/blueprint` — the sales page
- `/about` — founder and science page
- `/blog` — should show 2 posts (Tiger Hold guide, L. reuteri evidence)
- `/blog/tiger-hold-guide` — confirms MDX rendering works
- `/privacy-policy`, `/medical-disclaimer`, `/terms` — legal pages

## Known gaps — not blockers, but real

These will not break the local build. They matter before you point a real
domain at this and start sending traffic.

| Gap | Impact | Fix |
|---|---|---|
| No favicon (`/public/favicon.ico`) | Browser tab shows default icon | Generate or supply a 32x32 .ico file |
| No OG image (`/public/images/og-image.png`) | Social shares (WhatsApp, Facebook, Twitter) show broken preview | Generate a 1200x630 image, brand colours |
| No apple-touch-icon | iOS home screen bookmark looks generic | Generate a 180x180 .png |
| No photo of Vincent | About page and homepage OriginStory render text-only, which was the deliberate original design, but a real photo is your strongest trust signal per your own persona research | Supply a photo when ready |
| `testimonials.ts` is an empty array | Testimonials section does not render anywhere on the site — this is intentional until real testimonials exist | Add entries once Nurul/Cassie/Jayant (or others) reply with permission |
| `hello@colicprotocol.com` used in legal pages | Not a real inbox yet | Set up the inbox or swap the address before launch |
| MailerLite keys unset | Quiz and footer subscribe forms will show an error on submit | Add real keys to `.env.local` |

## Deploying later

When you are ready to buy the domain and deploy:

1. Push this folder to a GitHub repo
2. Import the repo in Vercel
3. Add all `.env.local` variables to Vercel → Project → Settings → Environment Variables
4. Point your domain's DNS at Vercel (CNAME to `cname.vercel-dns.com`)

Do this after you have confirmed locally that everything works the way you
want it to — that is the point of testing locally first.
