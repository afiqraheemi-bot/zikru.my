# zikru.my

Mobile-first PWA untuk zikir harian, target khusus, dan wirid berkumpulan.

## Features

- Kaunter zikir umum.
- Target zikir khusus.
- Wirid berkumpulan seperti Wirid Pagi dan Wirid Petang.
- Simpanan harian melalui `localStorage`.
- Reset harian selepas jam 6 pagi.
- Tema siang/malam, getaran, dan bunyi pilihan.
- PWA installable dengan manifest dan service worker.

## Tech stack

- Vite
- Vanilla JavaScript
- CSS modular di `src/styles`
- Static PWA assets di `public`

## Development

```bash
npm install
npm run dev
```

Build production:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Live Deployment

Production deploy berjalan melalui GitHub Actions workflow `Deploy Pages`.

- Push ke branch `main` akan build Vite app dan deploy folder `dist` ke GitHub Pages.
- Custom domain disimpan di `public/CNAME` sebagai `zikru.my`.
- Pastikan GitHub Pages repo diset kepada source `GitHub Actions`.
- Pastikan DNS domain `zikru.my` menghala ke GitHub Pages.

## Architecture

Lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
