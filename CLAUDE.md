# Andean Summit — Project notes for Claude

Multilingual (EN/ES/FR/DE) static website for **Andean Summit**, a trekking, climbing and adventure agency based in Huaraz, Peru. Operates in the Cordillera Blanca and Huayhuash since 2012. Ash is rebuilding this site on a volunteer basis.

## Stack

Flat static — **HTML + Tailwind utilities NOT used here**; instead a hand-rolled CSS file (`css/styles.css`) with CSS custom properties. Vanilla JS only. No build step.

Deploy target: **GitHub Pages** on `Ashdabash2926/andeansummit` (push to main = live).

## File map

```
index.html              home (editorial hero, 5 categories, 3 featured tours, why, gallery, CTA)
tours.html              all 28 expeditions, filterable by category, rendered from js/tours-data.js
about.html              mission / vision / team (3 split sections)
history.html            Huaraz / Peru info, tabbed (button toggle, no router)
accommodation.html      Sleep & Summit lodge
contact.html            WhatsApp / phone / email / OSM map
css/styles.css          all styling (custom properties + mobile-first media queries)
js/translations.js      { en, es, fr, de } dictionary keyed by data-i18n attr
js/components.js        injects <nav> + <footer> into #nav-mount / #footer-mount on every page
js/main.js              language toggle, mobile menu, nav scroll state, IntersectionObserver reveals
js/tours-data.js        single source of truth — 28 tour objects (name, days, altitude, difficulty, image)
js/tours.js             tours.html filter + render
images/hero/*.webp      one hero image per page
images/tours/*.webp     scraped from the live andeansummit.com, compressed via tools/compress-images
images/gallery/*.webp   gallery strip imagery
```

## i18n contract

- HTML ships with English baseline.
- Every translatable element carries `data-i18n="dot.key"`. `main.js` swaps innerHTML on load and on toggle.
- Newlines (`\n`) in dictionary strings are converted to `<br>`.
- `data-i18n-attr="placeholder:some.key"` swaps attributes.
- `localStorage.lang` persists; falls back to `navigator.language` for first visit.
- **ES/FR/DE are machine-translated drafts** — flag for native review before launch.

## Adding a new tour

1. Append an object to `js/tours-data.js` with `{ slug, category, days, altitudeM, difficulty, image, nameEN, summaryEN }`.
2. Drop the image into `images/tours/<slug>.webp` (compress via `node /Users/ash/Projects/tools/compress-images/compress.mjs <src> <dst>` first).
3. That's it — `tours.html` re-renders automatically. No template edits needed.

## Adding a new language

1. Add a fifth top-level key to `window.TRANSLATIONS` in `js/translations.js`.
2. Add the locale code to `SUPPORTED` in `js/main.js`.
3. Add a `<button data-lang="xx">XX</button>` block to the language switch in `js/components.js`.
4. Add label mapping in `js/tours.js` (`CATEGORY_LABEL`, `DIFFICULTY_LABEL`).

## Visual tokens

Defined in `:root` of `css/styles.css`. Forest green base + alpine orange accent + cream page background. Fonts: Fraunces (display), Inter (body), JetBrains Mono (mono labels).

## Workflow

- Local server: `python3 -m http.server 8765` then `open http://localhost:8765`.
- Commit + push: `git acp "message"` (workspace alias — see top-level `/Users/ash/Projects/CLAUDE.md`).
- Image compression: `node /Users/ash/Projects/tools/compress-images/compress.mjs <input> <output>`.

## Gotchas

- The site is fully client-rendered for nav/footer — anything that needs the chrome to exist must wait for the `components:ready` event (see `main.js` init pattern).
- Reveal animations use IntersectionObserver. If you screenshot with Puppeteer fullPage, set `prefers-reduced-motion: reduce` or elements outside the initial viewport will stay invisible.
- The phone number `+51 990221361` and address `Pasaje Wuamashraju 692, Huaraz` come from the live site — verify with client before printing on collateral.
- Email `info@andeansummit.com` was inferred — **confirm with client before launch**.

## Open items for client

- Confirm email address.
- Native-speaker review for ES/FR/DE translations.
- Decide whether "Gear rental", "Sitemap" pages should be added (dropped from v1).
- Final pricing — currently no prices shown on cards; "Enquire on WhatsApp" CTA replaces them.
