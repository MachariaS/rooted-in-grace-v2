# Rooted in Grace

A storytelling and community website for Rooted in Grace, built so the
founder can publish stories, podcast episodes, journal posts, and events
herself — no developer needed after launch.

Stories that remind us we're not walking alone.

## Stack

- **[Astro](https://astro.build)** — static site generation, vanilla CSS (no framework/component library)
- **[Decap CMS](https://decapcms.org)** at `/admin` — git-based, editorial workflow (draft → review → publish)
- **Netlify** — hosting, Netlify Identity + Git Gateway for CMS login, Netlify Forms for the newsletter/story/contact forms

## Content model

Six collections, all editable at `/admin` and backed by Markdown/JSON files
in `src/content/`:

| Collection | Purpose | Location |
|---|---|---|
| Stories | "From the Sidewalk" personal stories | `src/content/stories/` |
| Podcast | Episodes with Spotify/Apple/YouTube links | `src/content/podcast/` |
| Journal | Short reflections, categorized | `src/content/journal/` |
| Grace Notes | Short daily/weekly reflections | `src/content/graceNotes/` |
| Events | Upcoming + past gatherings | `src/content/events/` |
| Settings | Site-wide singleton (tagline, links, disclaimer) | `src/content/settings/settings.json` |

Schemas are defined in [src/content/config.ts](src/content/config.ts) and
mirrored field-for-field in [public/admin/config.yml](public/admin/config.yml)
for the CMS.

Each collection ships with one sample entry (`isSample: true`) so the site
never shows a blank page before real content exists.

## Project structure

```
src/
  components/     Reusable UI: cards, header/footer, forms, empty states
  content/        The 6 collections + their Zod schemas (config.ts)
  layouts/        BaseLayout.astro — shared shell, SEO, fonts, identity widget
  lib/            Small shared helpers (e.g. journal category list)
  pages/          File-based routes
  styles/         global.css — design tokens + all site styles
public/
  admin/          Decap CMS config + entry HTML
  images/uploads/ CMS-uploaded media lands here
  scripts/        site.js — nav toggle, scroll-reveal
```

## Local development

```bash
npm install
npm run dev
```

Visit `http://localhost:4321`. The CMS admin (`/admin`) won't fully log in
locally without a Netlify Identity instance — test CMS login on the deployed
site.

```bash
npm run build      # outputs static site to dist/
npm run preview    # serve the built dist/ locally
```

## Deployment

See [DEPLOY.md](DEPLOY.md) for the full GitHub → Netlify → Identity →
invite-the-founder walkthrough.

## Editing content

See [EDITING-GUIDE.md](EDITING-GUIDE.md) — a plain-language guide for the
founder covering logging in, publishing a story, adding an event, marking a
recording, and updating the community link.

## Design tokens

Colors, type, and spacing live as CSS custom properties at the top of
[src/styles/global.css](src/styles/global.css):

- **Colors:** deep forest `#26301F`, forest-deep `#1B2416`, moss `#5C6B45`,
  sage `#A9B18D`, sage-pale `#E4E6D4`, cream `#F7F2E3`, cream-warm `#FBF8EE`,
  bark `#6B4E36`, gold `#C9A24B`, gold-soft `#E8CB7E`
- **Type:** Cormorant Garamond (display), Great Vibes (script accents only),
  Karla (body/UI)

## Notes

- The newsletter form posts to Netlify Forms today. The swap point for a
  future MailerLite/Buttondown integration is commented directly in
  [src/components/NewsletterForm.astro](src/components/NewsletterForm.astro).
- Events move from "Upcoming" to "Past Gatherings" automatically based on
  their date, at build time — see DEPLOY.md for the scheduled-rebuild note.
- The wellness disclaimer text in the footer is a CMS field
  (`wellnessDisclaimer` in Site Settings) — legally review it there rather
  than in code.
