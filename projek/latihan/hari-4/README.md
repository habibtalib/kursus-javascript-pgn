# Latihan Hari 4 — Logik tooling, format & storage

Hari 4 kebanyakannya kerja terminal (npm, Vite, ESLint) dalam `projek/geolapor-mula`. Fail di sini ialah **logik tulen** di sebalik kerja itu: tiada `npm install`, tiada rangkaian, tiada DOM atau browser API. Setiap fail boleh dijalankan dan disemak terus di Pelatih (butang **Jalankan**), atau dengan `node`. Output jangkaan ada dalam komen `// ⇒`. Penerangan penuh: [`hari-4/lab.md`](../../../hari-4/lab.md).

| Fail | Lab / sesi | Topik | Checkpoint |
|------|-----------|-------|------------|
| `latihan-01.js` | 4.1 · S1 | Julat `^` / `~`, `dependencies` vs `devDependencies` | Lab 4.1 |
| `latihan-02.js` | 4.2 · S2 | `tapisLaporan` + `kiraIkut` pada 40 laporan (`data/laporan.js`) | Checkpoint B |
| `latihan-03.js` | 4.2 · S2 | Had 10 aksara DBF, nama bertembung, darjah vs meter (RSO) | Checkpoint C |
| `latihan-04.js` | 4.3 · S3 | Kesan pepijat `no-undef` dan `eqeqeq`; `switch` tanpa `default` yang lint tidak tangkap | Lab 4.3 |
| `latihan-05.js` | 4.4 · S4 | JSON selamat, cache TTL 24 j, draf dibuang selepas berjaya dihantar | Lab 4.4 |
| `data/laporan.js` | — | 40 laporan (salinan ringkas `projek/api/data/asal/laporan.json`) | |

```bash
cd projek/latihan/hari-4
node latihan-01.js                 # versi anda
```

Setiap fail dibahagi kepada bahagian `// ── A. …`, `// ── B. …`. Setiap bahagian berdiri sendiri (hanya guna pembantu sedia di atas fail), jadi anda boleh menjalankan dan menyemak satu bahagian pada satu masa.
