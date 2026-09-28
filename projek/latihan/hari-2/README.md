# Latihan Hari 2 — Asynchronous JavaScript & Web API Integration

Fail latihan **tanpa build**. Setiap latihan ialah satu ES module dengan `TODO`; output jangkaan dalam komen `// ⇒`. Penerangan penuh: [`hari-2/lab.md`](../../../hari-2/lab.md).

| Fail | Sesi | Topik | Perlu mock API? |
|------|------|-------|:---:|
| `latihan-01.js` | S1 | Call stack, event loop, task vs microtask | – |
| `latihan-02.js` | S1 | Callback & callback hell (`simulasi.js`) | – |
| `latihan-03.js` | S2 | Cipta Promise, promisify, chaining `.then/.catch/.finally` | – |
| `latihan-04.js` | S2 | `fetch` GET: status, header, JSON, 404 | ✅ |
| `latihan-05.js` | S2 | `Promise.all/allSettled/race/any` — 3 layer GeoJSON | ✅ |
| `latihan-06.js` | S3 | `async/await`, `try…catch…finally`, sequential vs parallel, jenis error | ✅ |
| `latihan-07.js` | S4 | `fetch` POST/PATCH/DELETE, `X-API-Key`, 401/422/204, `AbortController` | ✅ |
| `services/api.js` + `latihan-08.js` | S4 | Modul **`services/api.js`** (API dikunci) + kitaran CRUD | ✅ |
| `latihan-09.js` ⭐ | S4 | Cuba semula dengan exponential backoff | ✅ |
| `latihan-10.js` ⭐ | S4 | API awam `api.data.gov.my` (perlu internet) | – |
| `semak.js` | S4 | Penyemak automatik `services/api.js` (10 ujian) | ✅ |

## 1. Hidupkan mock API (terminal A — biarkan berjalan)

```bash
cd projek/api
npm start            # → GeoLapor mock API berjalan di http://localhost:3000
```

Semak: buka <http://localhost:3000/api/kesihatan> → `{"ok":true,"masa":"…"}`.
Data rosak selepas banyak ujian? `npm run reset-data` (dalam `projek/api`).

## 2. Jalankan latihan (terminal B)

### Pilihan A — Node 22+ (`fetch` terbina dalam Node)

```bash
cd projek/latihan/hari-2
node latihan-04.js                 # versi anda
node semak.js                      # semak services/api.js anda → sasaran 10/10 ✅
```

### Pilihan B — Browser (disyorkan untuk melihat tab **Network**)

```bash
npx serve . -l 5500      # atau VS Code Live Server (port 5500)
```

Buka `http://localhost:5500/?latihan=04`. Penunjuk di atas halaman memberitahu sama ada mock API hidup.

> ⚠️ **Jangan** hidangkan latihan pada port 3000 — port itu milik mock API. `npx serve` tanpa `-l` memilih 3000.
> ⚠️ `file://` memecahkan ES module **dan** fetch — sentiasa guna server HTTP.

## Nota

- `semak.js`, `latihan-07.js` dan `latihan-08.js` **mencipta dan memadam** satu laporan ujian. ID baharu (cth `LPR-0041`) bergantung pada data semasa.
- Key `latihan-pgn-2026` ialah key **latihan** — sebarang key dalam kod frontend boleh dibaca oleh sesiapa (DevTools → Sources). Lihat README Hari 2 §4.6.
