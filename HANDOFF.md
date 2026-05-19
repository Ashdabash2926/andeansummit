# Andean Summit — How to update the website

Welcome! This site has a small built-in admin so you can update it whenever
you need to, without writing any code. Below is everything you need to know.

## Where to log in

Open this URL in any browser (on a computer is easiest — works on phone too):

**<https://andeansummit.com/admin/>** *(or <https://ashdabash2926.github.io/andeansummit/admin/> if the custom domain isn't set up yet)*

You'll see a **"Login with GitHub"** button. Click it once, sign in with the
GitHub account that's been added as a collaborator on the site, and you're in.

## What you can edit

The admin home page shows three sections:

### 📅 Departures *(the main one — update this often!)*

This is the **"Departing soon"** widget on the homepage. The website
automatically picks the soonest upcoming departure that's still open and
shows it as a live countdown.

**To add a new departure:**
1. Click **📅 Departures**
2. Click **+ Add Departure**
3. Pick the tour from the dropdown (e.g. "Santa Cruz Trek (4 days · trek)")
4. Pick a start date with the calendar
5. Set how many spots are left
6. Pick a status:
   - **Open** — accepting bookings, shown on the homepage
   - **Few spots remaining** — also shown, but with an urgency badge
   - **Fully booked** — hidden from the website
   - **Cancelled** — hidden from the website
7. Click **Save**
8. Wait about a minute — the change goes live automatically.

You can have as many upcoming departures listed as you want. The site shows
only the soonest open one.

### 🏔  Tours

This is your full catalogue: name, summary, days, max altitude, difficulty
and photo. You probably won't change this often, but if a tour's description
needs updating or you want to replace its photo, this is the place.

**To edit a tour:** Click **🏔  Tours** → click **All tours** → find the
tour you want and update the fields → **Save**.

⚠️ **Do not change the slug** of an existing tour — it's the internal id
that links departures to tours.

### 🖼  Gallery

The photos that scroll across the bottom of the homepage.

**To add a new photo:** Click **🖼  Gallery** → click **+ Add Image** →
drag a JPG/PNG/WebP onto the photo field → write a short caption → **Save**.

**Tip:** photos look best when they're roughly the same shape (taller than
wide, like a phone screen). The site automatically crops them to fit.

## How long do changes take to appear?

About **30–60 seconds** after you hit Save. The page rebuilds automatically.
Refresh the website in another tab to see the change.

## Something went wrong / I broke something

Every change is saved in a history log. If you accidentally delete something
you didn't mean to, message Ash with the date and time of the change and it
can be restored exactly.

## Pro tips

- You can save and come back later — drafts aren't automatically published
  until you click Save.
- You can edit on your phone, but a computer is easier for typing.
- If the admin doesn't load, check you're signed into the right GitHub
  account — go to <https://github.com> and check the avatar in the top right.

## Help

If something isn't working:

1. Refresh the page first
2. Try logging out and back in (top-right corner of the admin)
3. If that doesn't fix it, message Ash

---

## ⚙️ Technical reference (Ash + future devs)

- The site is a static HTML/CSS/JS site served from GitHub Pages
  (repo: `Ashdabash2926/andeansummit`, branch: `main`).
- Editable content lives in three JSON files: `data/departures.json`,
  `data/tours.json`, `data/gallery.json`.
- The admin is **Decap CMS** (open source, formerly Netlify CMS), loaded
  from a CDN in `admin/index.html`. Configuration is in `admin/config.yml`.
- GitHub OAuth is brokered by a tiny Cloudflare Worker — see
  `workers/andean-cms-auth/README.md` for setup.
- The site reads JSON via `fetch()` at page load — no rebuild step needed.
  GitHub Pages serves the new JSON within seconds of a commit.
- To migrate ownership: transfer the GitHub repo, transfer or recreate the
  Cloudflare Worker, share the OAuth client secrets via a password manager.
