# Deploying Rooted in Grace

This is a step-by-step guide to get this site live on the internet, with a
working CMS the founder can log into. It assumes no prior experience with
Netlify or GitHub.

Total time: about 20–30 minutes.

---

## 0. What you're deploying

- A static website built with **Astro** (fast, no server to maintain)
- A content editor at **/admin** powered by **Decap CMS** (free, no separate account needed — it uses your Netlify login)
- Forms (newsletter, story submissions, contact) handled by **Netlify Forms** (free tier: 100 submissions/month)

You will need:
- A GitHub account (to hold the code)
- A Netlify account (free tier) — sign up at netlify.com with your GitHub account for the easiest setup

---

## 1. Push the code to GitHub

If this project isn't already in a GitHub repository:

```bash
cd rooted-in-grace-astro
git init
git add -A
git commit -m "Initial commit: Rooted in Grace"
```

Then create a repo on GitHub and push (replace `YOUR-USERNAME`):

```bash
gh repo create rooted-in-grace --public --source=. --remote=origin --push
```

(No `gh` CLI? Create the repo manually at github.com/new, then run the
`git remote add origin ...` and `git push -u origin main` commands GitHub
shows you.)

---

## 2. Connect the repo to Netlify

1. Go to [app.netlify.com](https://app.netlify.com) and log in.
2. Click **Add new site → Import an existing project**.
3. Choose **GitHub**, authorize Netlify, and select the `rooted-in-grace` repo.
4. Build settings should auto-detect from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Click **Deploy site**. The first build takes 1–2 minutes.

You'll get a random URL like `random-name-123.netlify.app`. You can rename
it under **Site configuration → General → Site details → Change site name**,
or attach a custom domain under **Domain management**.

---

## 3. Turn on Netlify Identity (so the founder can log in)

1. In your Netlify site dashboard, go to **Site configuration → Identity**.
2. Click **Enable Identity**.
3. Under **Registration**, set it to **Invite only** (so strangers can't sign
   themselves up as editors).
4. Scroll to **Services → Git Gateway** and click **Enable Git Gateway**.
   This is what lets the CMS commit content changes back to GitHub on the
   founder's behalf, without her needing her own GitHub account or a
   personal access token.

---

## 4. Invite the founder as a CMS user

1. Still under **Identity**, click **Invite users**.
2. Enter her email address and send the invite.
3. She'll get an email with a link to set a password.
4. Once that's done, she can log in and edit content at:

   **`https://YOUR-SITE-NAME.netlify.app/admin/`**

That's the whole CMS login flow — no GitHub account needed on her end.

---

## 5. Confirm forms are working

Netlify automatically detects the forms in this project (`grace-notes-signup`,
`share-your-story`, `contact`) the first time it builds the site, because
they're already marked `data-netlify="true"` in the HTML.

To check:
1. Go to **Site configuration → Forms** in the Netlify dashboard.
2. You should see all three forms listed after the first deploy.
3. Submit a test entry on the live site to confirm it shows up under
   **Forms → [form name] → Submissions**.

Optional: set up **Forms → Notifications** to email you when someone submits,
so you don't have to check the dashboard manually.

---

## 6. Update placeholder links before sharing publicly

A few placeholder values need real ones — all editable from `/admin → Site Settings`, no code required:

- **Community Join URL** — currently a placeholder WhatsApp link
- **Spotify / Apple / YouTube URLs** — currently placeholders
- **Contact email**
- **Social links** (Instagram, Facebook)

Also worth doing before wide launch:
- Replace the founder portrait placeholder on the About page with a real photo (`/admin → Pages` doesn't cover this — it's a hard-coded section; ask your developer to swap it, or request an "About photo" field be added to Site Settings).
- Update `site` in `astro.config.mjs` and `site_url` in `public/admin/config.yml` to your real domain once you have one, then redeploy.

---

## 7. Every future update deploys automatically

Once connected, any content change made through `/admin` (or any code push to
the `main` branch) triggers a new Netlify build and deploy automatically —
usually live within 1–2 minutes. Nothing else to run.

Note: because this is a static site, a scheduled event's status only flips
from "upcoming" to "past" the next time the site rebuilds (i.e., the next
time someone publishes something, or you trigger a manual "Deploy site" from
the Netlify dashboard). If you want events to flip exactly at midnight
regardless of other activity, set up a free **Netlify scheduled build**
(Site configuration → Build & deploy → Build hooks, paired with a free cron
service like cron-job.org hitting the hook once daily).
