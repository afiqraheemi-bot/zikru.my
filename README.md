# zikru.my

Webapp zikir harian ringkas untuk mobile:

- Kaunter zikir umum.
- Target zikir khusus.
- Wirid berkumpulan seperti Wirid Pagi dan Wirid Petang.
- Simpanan harian melalui `localStorage`.
- Reset harian selepas jam 6 pagi.
- Tema siang/malam, getaran, dan bunyi pilihan.
- PWA asas dengan manifest dan service worker.

## Jalankan

```bash
python3 -m http.server 5173
```

Buka `http://localhost:5173`.

Untuk deploy, host folder ini sebagai static site.
