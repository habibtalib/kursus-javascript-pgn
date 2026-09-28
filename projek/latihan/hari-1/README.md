# Latihan Hari 1 — Modern JavaScript (ES6+) Core Syntax

Fail latihan **tanpa build** (tiada npm install). Setiap latihan ialah satu ES module dengan `TODO`; output jangkaan ditulis dalam komen `// ⇒`. Penerangan penuh: [`hari-1/lab.md`](../../../hari-1/lab.md).

| Fail | Sesi | Topik |
|------|------|-------|
| `latihan-01.js` | S1 | var/let/const, `typeof`, operator, if/else, switch, for/while/do…while |
| `latihan-02.js` | S1 | Objek laporan = GeoJSON Feature, FeatureCollection, scope, hoisting |
| `latihan-03.js` | S2 | Template literal, method string, fungsi, default parameter/rest, closure |
| `latihan-04.js` | S3 | Destructuring, spread/rest, `?.`, `??`, `===` |
| `latihan-05.js` | S4 | `map/filter/reduce/find/some/every/toSorted`, `JSON.parse/stringify` |
| `latihan-06.js` + `utils/geo.js` | S4 | ES Modules — bina modul `utils/geo.js` (API dikunci) |
| `data/laporan-contoh.js` | — | FeatureCollection sintetik (10 laporan; **LPR-0010 sengaja terbalik**) |
| `semak.js` | S4 | Penyemak automatik `utils/geo.js` (Node) |

## Cara jalankan

### Pilihan A — Node (paling cepat untuk Hari 1)

Hari 1 ialah logik tulen (tiada DOM), jadi semua latihan boleh dijalankan terus dengan Node 22+:

```bash
cd projek/latihan/hari-1
node latihan-01.js                 # versi anda
node semak.js                      # semak utils/geo.js anda → sasaran 6/6 ✅
```

`package.json` mengandungi `"type": "module"` — itulah yang membolehkan Node memahami `import`/`export` dalam fail `.js`.

### Pilihan B — Browser (Chrome/Edge)

ES module **tidak** berfungsi melalui `file://` (browser menyekat `import` atas sebab keselamatan CORS). Hidangkan folder melalui server HTTP:

```bash
# VS Code: klik kanan index.html → "Open with Live Server"  (port 5500)
# atau
npx serve . -l 5500
```

Buka `http://localhost:5500/?latihan=01`. Output dipapar dalam halaman **dan** DevTools → Console.

> ⚠️ Jangan guna port **3000** — ia dikhaskan untuk mock API (Hari 2). `npx serve` tanpa `-l` memilih 3000 secara default.
