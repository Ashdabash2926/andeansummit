# Andean Summit — pick-up notes

Last session: 2026-05-18.

Live: <https://ashdabash2926.github.io/andeansummit/>
Repo: <https://github.com/Ashdabash2926/andeansummit>

---

## Where things stand

Site is built, deployed, and content-editable in principle. Six pages in four
languages (EN/ES/FR/DE), editorial design with cinematic hero, interactive
moments throughout. Tour catalogue, gallery, and upcoming-departures content
all now live in `data/*.json` and load at runtime via fetch.

The admin UI (Decap CMS) is set up at `/admin/` and ready — but the **OAuth
proxy hasn't been deployed yet**, so logins won't work until that's done.

---

## Next session — the one thing to finish

**Deploy the Cloudflare Worker that brokers Decap ↔ GitHub OAuth.**

Step-by-step instructions in `workers/andean-cms-auth/README.md`. Rough flow
(≈15 min):

1. Create a GitHub OAuth App at <https://github.com/settings/applications/new>
   - Homepage: `https://ashdabash2926.github.io/andeansummit/`
   - Callback (placeholder for now): `https://andean-cms-auth.<acct>.workers.dev/callback`
   - Save **Client ID** + **Client Secret**
2. `npm install -g wrangler && wrangler login`
3. `cd workers/andean-cms-auth && wrangler deploy` — note the live Worker URL
4. `wrangler secret put OAUTH_CLIENT_ID` then `wrangler secret put OAUTH_CLIENT_SECRET`
5. Go back to the GitHub OAuth App and update the callback URL to the real
   Worker URL from step 3
6. Edit `admin/config.yml` — replace
   `https://andean-cms-auth.YOUR-CF-ACCOUNT.workers.dev` with the real Worker
   URL on both `base_url` and `site_domain`, commit + push
7. Smoke test: open `/admin/`, click "Login with GitHub", add a test
   departure, confirm it appears on the home page within ~60s

When that works, the client can self-serve forever.

---

## Then — hand-off prep

- Invite the client as a Collaborator on `Ashdabash2926/andeansummit`
- Share the admin URL + a link to `HANDOFF.md` (already written, client-facing)
- Optionally record a 3-minute Loom of the admin flow
- Document Cloudflare account credentials in a password manager the client
  can access (or transfer the Worker to a Cloudflare account they control)

---

## Outstanding open items for the client

- [ ] Confirm email address — currently using placeholder `info@andeansummit.com`
- [ ] Native-speaker review of ES / FR / DE in `js/translations.js`
  (machine-translated drafts)
- [ ] Decide whether to add "Gear Rental" and "Sitemap" pages
  (currently dropped from scope)
- [ ] Confirm pricing approach — cards currently CTA to WhatsApp instead
  of showing prices

---

## Architecture (one-paragraph refresher)

Flat static site on GitHub Pages. No build step. Vanilla JS, custom CSS
(no Tailwind). Editable content in `data/*.json` fetched at runtime. Decap
CMS at `/admin/` with a tiny Cloudflare Worker doing the OAuth bridge to
GitHub. Pushing JSON via the admin → GitHub commit → Pages rebuild → live in
~30–60 s. See `CLAUDE.md` for the full file map.

## Useful files

- `CLAUDE.md` — full architecture + i18n contract + workflow conventions
- `HANDOFF.md` — client-facing instructions (don't edit without keeping it
  approachable for a non-technical reader)
- `workers/andean-cms-auth/README.md` — the deployment checklist for
  tomorrow's first job
- `data/departures.json` — four seed entries; the soonest one drives the
  homepage countdown widget
