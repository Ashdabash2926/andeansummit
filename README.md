# Andean Summit

Website rebuild for **Andean Summit** — a trekking, climbing and adventure agency based in Huaraz, Peru, operating in the Cordillera Blanca and Huayhuash since 2012.

Mobile-first static site with multilingual support (EN / ES / FR / DE).

## Run locally

```bash
python3 -m http.server 8765
open http://localhost:8765
```

No build step required.

## Deploy

GitHub Pages: push to `main` on `Ashdabash2926/andeansummit`.

## Tech

- HTML + custom CSS (mobile-first) + vanilla JS
- Google Fonts: Fraunces, Inter, JetBrains Mono
- Sharp (via `tools/compress-images`) for WebP image optimisation
- IntersectionObserver for scroll reveals
- LocalStorage for language persistence

See `CLAUDE.md` for the full file map and contribution notes.
