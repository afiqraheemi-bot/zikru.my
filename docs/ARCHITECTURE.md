# ZIKRU.my Architecture

ZIKRU.my is a mobile-first static PWA. It is intentionally small so it can be hosted on GitHub Pages, Cloudflare Pages, Netlify, Vercel, or any static hosting provider.

## Project layout

```text
.
├── index.html              # Vite HTML entry and app shell markup
├── public/                 # Files served from the web root
│   ├── CNAME
│   ├── manifest.webmanifest
│   ├── sw.js
│   └── assets/icon.svg
├── src/
│   ├── main.js             # App state, interactions, storage, audio, PWA registration
│   └── styles/app.css      # Product UI and responsive mobile layout
└── package.json            # Development, build, preview, and CI check scripts
```

## Runtime model

- Client-only app, no backend dependency.
- Daily state is stored in `localStorage` under `zikru-v1`.
- Current daily reset uses a fixed `RESET_HOUR` of 6am. A future backend or prayer-time provider can replace this with zone-aware Subuh timing.
- The service worker caches the app shell and then opportunistically caches fetched assets.
- GitHub Pages deployment is handled by `.github/workflows/deploy-pages.yml`.

## Quality gate

Run this before shipping:

```bash
npm run check
```

`npm run check` currently performs a production Vite build.
