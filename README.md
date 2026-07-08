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

## Architecture

Lihat [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).
