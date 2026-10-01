# 11 · Tooling: npm, Vite, ESLint & Prettier

> Nota topikal · Indeks: [`./README.md`](./README.md)

## Objektif nota

Selepas membaca nota ini, anda boleh:

- **Menggunakan** npm untuk memulakan projek, memasang pakej (`dependencies` vs `devDependencies`), membaca semver (`^`, `~`) dan **menerangkan** peranan `package-lock.json` serta `npm ci`.
- **Mencipta** projek Vite 7 (vanilla), menjalankan `dev`/`build`/`preview`, dan **mengkonfigur** `import.meta.env.VITE_API_URL` serta `server.proxy` untuk mengelak CORS semasa pembangunan.
- **Menulis** `eslint.config.js` (ESLint 9 flat config) dan konfigurasi Prettier 3 yang tidak bercanggah, lalu **membaiki** amaran lint.
- **Mengikut** konvensyen penamaan kursus (fungsi/variable, kelas, constant, fail).

---

## 1. Kenapa perlu tooling? (Hari 1–3 vs Hari 4–5)

Hari 1–3 kita menulis HTML + `<script type="module">` terus — tiada pemasangan, tiada build. Itu sengaja: supaya anda faham **JavaScript sebenar** tanpa "sihir".

Tetapi apabila aplikasi membesar:

| Masalah tanpa tooling | Penyelesaian |
|-----------------------|-------------|
| Salin `leaflet.js`, `turf.min.js`, `proj4.js` secara manual; versi tidak diketahui | **npm** — senarai dependency + versi tepat dalam `package.json` & lockfile |
| Puluhan `<script>` / `import` dari CDN; lambat, tidak boleh luar talian | **Vite** — gabung & kecilkan (*bundle & minify*) menjadi beberapa fail |
| URL API ditulis keras (`http://localhost:3000`) — perlu ubah untuk produksi | **`.env`** + `import.meta.env` |
| Setiap orang gaya kod berbeza; pepijat `==` vs `===` terlepas | **ESLint** (kualiti) + **Prettier** (format) |

---

## 2. npm

### 2.1 Arahan teras

```bash
node -v                 # v22.x (LTS) atau lebih baharu
npm -v

npm init -y             # cipta package.json asas
npm install leaflet@1.9 @turf/turf@7 proj4            # → dependencies (dihantar ke browser)
npm install -D vite@7 eslint@9 @eslint/js@9 globals prettier@3 eslint-config-prettier
                                                       # → devDependencies (alat pembangunan sahaja)
npm uninstall tokml
npm ls --depth=0        # apa yang dipasang
npm outdated            # versi lebih baharu yang ada
npm audit               # kelemahan keselamatan diketahui dalam dependency
npx eslint .            # jalankan binari pakej tempatan (node_modules/.bin)
```

### 2.2 `package.json` GeoLapor (contoh)

```json
{
  "name": "geolapor",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint .",
    "format": "prettier --write .",
    "test": "node --test"
  },
  "dependencies": {
    "@turf/turf": "^7.2.0",
    "leaflet": "^1.9.4",
    "proj4": "^2.15.0"
  },
  "devDependencies": {
    "@eslint/js": "^9.39.0",
    "eslint": "^9.39.0",
    "eslint-config-prettier": "^10.1.0",
    "globals": "^16.0.0",
    "prettier": "^3.6.0",
    "vite": "^7.3.0"
  }
}
```

- `"type": "module"` → fail `.js` dianggap ES module (`import`/`export`) dalam Node.
- `"private": true` → elak `npm publish` tidak sengaja.
- `scripts` → `npm run dev`, `npm run lint`, `npm test` (singkatan untuk `npm run test`).

### 2.3 Semver: `MAJOR.MINOR.PATCH`

| Julat | Maksud | Contoh `^1.9.4` / `~1.9.4` membenarkan |
|-------|--------|----------------------------------------|
| `^1.9.4` | Serasi — MINOR & PATCH boleh naik | `1.9.5`, `1.10.0` — **bukan** `2.0.0` |
| `~1.9.4` | PATCH sahaja | `1.9.5` — **bukan** `1.10.0` |
| `1.9.4` | Tepat | `1.9.4` sahaja |
| `^0.4.3` | Untuk `0.x`, `^` hanya benarkan PATCH | `0.4.4` — **bukan** `0.5.0` |

MAJOR naik = **perubahan memecah** (*breaking change*). Contoh sebenar: Turf 6 → 7 menukar gaya import; ESLint 8 → 9 menukar format konfigurasi; Vite dan ESLint kini sudah ada versi major lebih baharu (Vite 8, ESLint 10) — sebab itu kursus ini **menyemat** `vite@7` dan `eslint@9`.

### 2.4 `package-lock.json` & `npm ci`

- `package.json` = **julat** yang dibenarkan. `package-lock.json` = **versi tepat** yang benar-benar dipasang (termasuk dependency transitif).
- **Commit** lockfile ke Git. Tanpanya, dua komputer boleh memasang versi berbeza → "berfungsi di mesin saya".
- `npm install` — boleh mengemas kini lockfile. `npm ci` — pasang **tepat** mengikut lockfile, padam `node_modules` dahulu, gagal jika tidak sepadan. Guna `npm ci` untuk CI, server, dan **persediaan kit luar talian** kursus.

> 💡 **Tip (bilik latihan tanpa internet):** Sediakan repo dengan `npm ci` **sebelum** hari kursus; salin keseluruhan folder termasuk `node_modules/`. Lihat [`../docs/persediaan.md`](../docs/persediaan.md).

---

## 3. Vite 7

### 3.1 Cipta projek

```bash
npm create vite@7 geolapor -- --template vanilla   # semat versi 7 (latest kini 8)
cd geolapor
npm install
npm run dev        # http://localhost:5173 — hot module replacement (HMR)
npm run build      # → dist/ (fail diminify + hash nama)
npm run preview    # hidang dist/ untuk semakan sebelum deploy
```

Struktur template vanilla (disahkan dengan create-vite 7):

```text
geolapor/
├── index.html          ← titik masuk (BUKAN dalam public/) — Vite baca <script type="module" src="/src/main.js">
├── package.json
├── public/             ← disalin APA ADANYA ke dist/ (tiada hash): favicon, data/ statik besar
│   └── vite.svg
└── src/                ← kod & aset yang diproses (import, hash, minify)
    ├── main.js
    ├── counter.js      ← padam (demo)
    ├── javascript.svg
    └── style.css
```

| Letak di | Bila | Rujuk sebagai |
|----------|------|---------------|
| `src/` | Diimport oleh JS/CSS; mahu hash cache-busting | `import url from './ikon.png'` |
| `public/` | Fail yang dirujuk dengan URL tetap, tidak diimport | `/data/sempadan-zon.geojson` (laluan akar) |

### 3.2 Environment variable

```bash
# .env                  — default semua mod
VITE_API_URL=http://localhost:3000
# .env.production       — hanya untuk `vite build`
VITE_API_URL=/api
```

```js
// src/services/api.js
const ASAS = import.meta.env.VITE_API_URL ?? '';     // string, diganti semasa build
console.log(import.meta.env.MODE, import.meta.env.DEV); // 'development' true (dev) · 'production' false (build)
```

Diuji dengan Vite 7.3: variable **tanpa** prefiks `VITE_` (cth `KUNCI_RAHSIA`) menjadi `undefined` dalam bundle — Vite sengaja menyekatnya. Tetapi ingat:

> ⚠️ **Semua `VITE_*` ada dalam JavaScript yang dihantar ke browser — boleh dibaca sesiapa.** `.env` frontend **bukan** tempat rahsia. Key mock `latihan-pgn-2026` boleh diletak di sini *hanya kerana ia palsu*. Key sebenar → server/proxy. Tambah `.env.local` dan `.env.*.local` ke `.gitignore`.

### 3.3 `vite.config.js` — proxy untuk mengelak CORS

```js
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      // Browser minta http://localhost:5173/api/laporan → Vite hantar ke http://localhost:3000/api/laporan
      // Browser nampak ASAL SAMA → tiada semakan CORS langsung.
      '/api': { target: 'http://localhost:3000', changeOrigin: true },
      '/data': { target: 'http://localhost:3000', changeOrigin: true },
      // Contoh GeoServer tempatan:
      // '/geoserver': { target: 'http://localhost:8080', changeOrigin: true },
    },
  },
  build: {
    sourcemap: true, // peta sumber → DevTools tunjuk kod asal (nota 14)
  },
});
```

Dengan proxy, `VITE_API_URL` boleh dikosongkan (`''`) dan kod memanggil `/api/laporan` secara relatif. Dalam produksi, web server (Nginx/IIS) melakukan tugas proxy yang sama.

> 💡 **Tip:** Proxy **hanya** berfungsi untuk `npm run dev`. `npm run preview` juga menyokong `preview.proxy`, tetapi `dist/` yang dihantar ke server sebenar bergantung pada konfigurasi server itu.

### 3.4 Import pustaka dalam Vite

```js
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';        // CSS pun boleh diimport
import * as turf from '@turf/turf';
import proj4 from 'proj4';
import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'; // ?url → dapatkan URL fail, bukan kandungan
import dataZon from './data/zon.json';      // JSON diimport sebagai objek
```

---

## 4. ESLint 9 (flat config)

ESLint mengesan **pepijat & amalan buruk** (bukan gaya). ESLint 9 menggunakan satu fail `eslint.config.js` (format `.eslintrc` lama tidak lagi default).

```js
// eslint.config.js — diuji dengan ESLint 9.39
import js from '@eslint/js';
import globals from 'globals';
import prettier from 'eslint-config-prettier';

export default [
  // 1. Abaikan output build & salinan vendor
  { ignores: ['dist/', 'node_modules/', 'public/vendor/'] },

  // 2. Peraturan disyorkan (no-undef, no-unused-vars, no-unreachable, ...)
  js.configs.recommended,

  // 3. Kod aplikasi (browser)
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 2024,
      sourceType: 'module',
      globals: { ...globals.browser },     // window, document, fetch, localStorage ...
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],   // _param dibenarkan tidak digunakan
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],                                // == dilarang
      'prefer-const': 'error',
      'no-var': 'error',
      // Peraturan projek: larang innerHTML
      'no-restricted-syntax': [
        'error',
        {
          selector: "AssignmentExpression[left.property.name='innerHTML']",
          message: 'Jangan guna innerHTML dengan data — guna textContent / createElement.',
        },
      ],
    },
  },

  // 4. Fail ujian & konfigurasi berjalan dalam Node
  {
    files: ['**/*.test.js', 'vite.config.js', 'eslint.config.js'],
    languageOptions: { globals: { ...globals.node } },
  },

  // 5. MESTI terakhir — matikan peraturan gaya yang bercanggah dengan Prettier
  prettier,
];
```

Output sebenar pada fail contoh:

```text
src/contoh.js
  1:1   error    Unexpected var, use let or const instead                          no-var
  3:9   error    Expected '===' and instead saw '=='                               eqeqeq
  3:17  warning  Unexpected console statement. Only these console methods ...      no-console
  4:3   error    Jangan guna innerHTML dengan data — guna textContent / createElement  no-restricted-syntax
  5:7   error    'y' is never reassigned. Use 'const' instead                      prefer-const
```

> 💡 Varian lebih ketat wujud: `no-restricted-properties` untuk `innerHTML` **dan** `outerHTML` (menangkap sebarang akses, bukan hanya tugasan). Kedua-dua cara sah; pilih satu untuk pasukan anda.

> 💡 Menariknya, template Vite sendiri (`main.js`, `counter.js`) melanggar peraturan `innerHTML` kita. Itu markup **statik** (tiada data pengguna) jadi tidak berbahaya — tetapi kita padam fail demo itu dan membina UI dengan `createElement`.

```bash
npx eslint .            # semak
npx eslint . --fix      # baiki automatik yang selamat (cth prefer-const)
```

---

## 5. Prettier 3

Prettier **memformat** kod (inden, petikan, koma) — tiada perbincangan gaya lagi dalam semakan kod.

```json
// .prettierrc.json
{
  "singleQuote": true,
  "semi": true,
  "printWidth": 100,
  "trailingComma": "all"
}
```

```text
# .prettierignore
dist
node_modules
public/vendor
package-lock.json
```

```bash
npx prettier --check .   # CI: gagal jika ada fail belum diformat
npx prettier --write .   # format semua
```

**ESLint vs Prettier:** ESLint = *adakah kod ini betul/selamat?* · Prettier = *adakah kod ini kemas?* `eslint-config-prettier` memastikan ESLint tidak mengadu tentang perkara yang Prettier uruskan.

### VS Code

Pasang sambungan **ESLint** (`dbaeumer.vscode-eslint`) dan **Prettier** (`esbenp.prettier-vscode`), kemudian `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
}
```

---

## 6. Konvensyen penamaan kursus

| Jenis | Gaya | Contoh |
|-------|------|--------|
| Variable & fungsi | `camelCase` (BM dibenarkan) | `senaraiLaporan`, `jarakKm`, `lapisanAktif` |
| Fungsi boolean | awalan `adakah`/`is`/`has` atau kata sifat | `dalamMalaysia`, `adakahSah` |
| Kelas / pembina | `PascalCase` | `ApiError` |
| Constant | `UPPER_SNAKE_CASE` | `RSO_PROJ`, `KUNCI_API`, `WARNA_KATEGORI` |
| Fail modul | `kebab-case` atau satu perkataan huruf kecil | `store.js`, `geo.js`, `peta.js`, `sempadan-zon.geojson` |
| Medan data API | ikut kontrak API tepat (lihat `projek/api/README.md`) | `tajuk`, `kategori`, `dikemaskini` |
| Variable DOM | nama jelas + jenis | `butangHantar`, `borangLaporan`, `elSenarai` |

> ⚠️ Jangan campur bahasa dalam **satu** nama (`getLaporanList`). Pilih satu gaya per nama; kursus ini menetapkan nama BM untuk fungsi modul GeoLapor.

---

## ⚠️ Kesilapan lazim

| Simptom | Punca | Pembetulan |
|---------|-------|------------|
| `Cannot use import statement outside a module` (Node) | Tiada `"type": "module"` | Tambah dalam `package.json` atau guna `.mjs` |
| `npm create vite@latest` memasang Vite 8 | `latest` telah bergerak | `npm create vite@7 …` |
| ESLint: `Could not find config file` / `.eslintrc` diabaikan | ESLint 9 perlukan `eslint.config.js` | Tulis flat config (§4) |
| `'document' is not defined` (no-undef) | `globals.browser` tidak ditetapkan | Tambah `languageOptions.globals` |
| `import.meta.env.API_URL` → `undefined` | Tiada prefiks `VITE_` | Namakan `VITE_API_URL`; restart `npm run dev` selepas ubah `.env` |
| CORS error dalam dev walaupun API jalan | Memanggil `http://localhost:3000` terus | Guna `server.proxy` + URL relatif `/api/...` |
| `dist/` kosong/rosak selepas `npm run build` dibuka terus (file://) | Modul ES tidak dimuat dari `file://` | `npm run preview` atau hidang melalui server |
| Pasukan dapat versi pakej berbeza | Lockfile tidak di-commit / guna `npm install` | Commit `package-lock.json`, guna `npm ci` |
| `node_modules/` masuk Git | `.gitignore` tiada | Tambah `node_modules`, `dist`, `.env.local` |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) — pengayaan selepas nota ini. Halaman PDF = muka surat cetak + 24.
>
> - **npm, `package.json`, semver, `scripts`** — B6 · Bab 1 (Building from Scratch), *Why You Need a Build Tool; Managing Dependencies with npm; Writing a dev Script* — ms. 496–506 (**PDF 520–530**)
> - **Kenapa bundler, dev server, build, aset statik** — B6 · Bab 2 (Optimizing and Bundling), *Automating Your Build Script* — ms. 513–521 (**PDF 537–545**)
> - **Projek Vite** — B3 · Bab 1 (Getting Started with React), *Initializing a Project with Vite* — ms. 271–278 (**PDF 295–302**)
> - **ESLint** — B6 · Bab 3 (Testing Your JavaScript), *Using a Linter* — ms. 536–541 (**PDF 560–565**)
> - **Prettier** — B1 · Bab 2 (Filling Your JavaScript Toolbox), *Getting prettier* — ms. 44–47 (**PDF 68–71**)
> - **Konvensyen penamaan** — B1 · Bab 1 & Bab 3, *JavaScript programmers use camelCase and underscores (Bab 1); Naming variables; Naming constants (Bab 3)* — ms. 32–33, 66–67 (**PDF 56–57, 90–91**)


## Rujukan rasmi

- npm — `package.json`: <https://docs.npmjs.com/cli/v11/configuring-npm/package-json> · `npm ci`: <https://docs.npmjs.com/cli/v11/commands/npm-ci> · `npm audit`: <https://docs.npmjs.com/cli/v11/commands/npm-audit> · Semver: <https://docs.npmjs.com/about-semantic-versioning> · <https://semver.org/>
- Node.js — keluaran & LTS: <https://nodejs.org/en/about/previous-releases>
- Vite — Panduan: <https://vite.dev/guide/> · Env & mod: <https://vite.dev/guide/env-and-mode> · `server.proxy`: <https://vite.dev/config/server-options> · Aset statik: <https://vite.dev/guide/assets>
- ESLint — Konfigurasi flat: <https://eslint.org/docs/latest/use/configure/configuration-files> · Bermula: <https://eslint.org/docs/latest/use/getting-started>
- Prettier — Konfigurasi: <https://prettier.io/docs/configuration> · eslint-config-prettier: <https://github.com/prettier/eslint-config-prettier>
- globals: <https://github.com/sindresorhus/globals>

*Diuji untuk nota ini: create-vite 7.1, Vite 7.3.6, ESLint 9.39.5, Prettier 3.x, Node 26 (serasi Node 22 LTS).*

## Digunakan pada Hari N

- **Hari 4 (utama)** — S1: npm; S2: Vite + `.env` + proxy; S3: ESLint + Prettier + konvensyen penamaan.
- **Hari 5** — S2: struktur folder & build; S3: `npm run lint`, `npm test`, `npm audit` dalam senarai semak.
