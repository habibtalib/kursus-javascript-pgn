# Lab Hari 4 — Tooling, Format Geospatial & Browser Storage

[⬅️ README Hari 4](./README.md) · [🗂️ Data sampel](../projek/data/)

> **Peraturan lab:** Hari ini banyak **arahan terminal**. Baca output setiap arahan sebelum meneruskan, kerana 80% masalah tooling kelihatan dalam 3 baris terakhir output. Kod rujukan penuh untuk setiap fail diberi di bawah (semuanya telah dibina dan diuji dengan Vite 7.3 + data kursus). Taip atau salin **satu bahagian pada satu masa**, simpan, dan lihat hasilnya di browser sebelum bahagian seterusnya.

| Lab | Sesi | Folder | Hasil |
|-----|------|--------|-------|
| 4.1 | S1 9.00–11.00 | `~/latihan-npm/` + `projek/geolapor-mula` | npm init/install/semver/lockfile/scripts; `npm run periksa`; pakej GeoLapor dipasang |
| 4.2 | S2 11.00–1.00 (+ lanjutan) | `~/demo-vite/` + `projek/geolapor-mula` | Vite dev/build/preview; GeoLapor dipindah; import/eksport format |
| 4.3 | S3 2.30–3.30 | `projek/geolapor-mula` | `npm run lint` 0 error; `semak-lint.js` 10 → 0; Prettier |
| 4.4 | S4 3.30–5.00 | `projek/geolapor-mula` | Penapis & draf `localStorage`; cache layer IndexedDB; ujian luar talian |

> 💡 **Nota:** kod dalam lab ini membina versi Hari 4 (tanpa store). Hari 5 menambah `state/store.js` di atasnya, jadi struktur akan menjadi lebih maju berbanding lab hari ini — itu normal.

---

## Lab 4.1 — Package Management (S1)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - npm, `package.json`, semver, `scripts`: B6 · Bab 1 (Building from Scratch) — ms. 496–506 (**PDF 520–530**)

### 🎯 Objektif
Menggunakan `npm init`, `install` (`-D`), semver, lockfile (`npm ci`), `scripts`, `npx`, `audit`; memasang pakej GeoLapor; memadankan format → pakej.

### Prasyarat
- `node -v` ≥ 22, `npm -v` ≥ 10
- Internet ke `registry.npmjs.org` (atau cermin/proksi jabatan: README §1.8). **Jurulatih:** jika internet tidak stabil, sediakan cache `~/.npm` atau tarball dahulu

### Langkah

1. **Projek npm pertama** (di luar repo kursus):

   ```bash
   mkdir ~/latihan-npm && cd ~/latihan-npm
   npm init -y
   npm pkg set type=module
   npm pkg set private=true --json
   cat package.json
   ```

2. **Pasang dengan versi lama dengan sengaja** (untuk eksperimen semver nanti):

   ```bash
   npm install proj4@2.19.0 @turf/turf@7
   npm ls --depth=0
   ```

   Buka `package.json` (`"proj4": "^2.19.0"`) dan `package-lock.json` (cari `"node_modules/proj4"` → `"version": "2.19.0"`). Berapa banyak pakej dalam lockfile berbanding dalam `dependencies`? Kenapa?

3. **Skrip pertama.** Cipta `periksa.mjs`:

   ```js
   // periksa.mjs — bukti pakej npm berfungsi dalam Node (tanpa browser)
   import proj4 from 'proj4';
   import { point, distance, polygon, area } from '@turf/turf';

   proj4.defs(
     'EPSG:3375',
     '+proj=omerc +lat_0=4 +lonc=102.25 +alpha=323.0257964666666 +k=0.99984 +x_0=804671 +y_0=0 +no_uoff +gamma=323.1301023611111 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs',
   );

   const lpr0001 = [101.6958, 2.9264]; // [lng, lat]
   const [x, y] = proj4('EPSG:4326', 'EPSG:3375', lpr0001);
   console.log(`LPR-0001 dalam RSO: E ${x.toFixed(2)} m, N ${y.toFixed(2)} m`);

   const km = distance(point(lpr0001), point([101.7086, 2.9442]), { units: 'kilometers' });
   console.log(`Jarak ke titik kedua: ${km.toFixed(3)} km`);

   const kotak = polygon([[[101.68, 2.92], [101.7, 2.92], [101.7, 2.94], [101.68, 2.94], [101.68, 2.92]]]);
   console.log(`Keluasan kotak: ${(area(kotak) / 10_000).toFixed(1)} ha`);
   const pakej = await import('proj4/package.json', { with: { type: 'json' } });
   console.log(`proj4 versi dipasang: ${pakej.default.version}`);
   ```

   ```bash
   npm pkg set scripts.periksa="node periksa.mjs"
   npm run periksa
   ```

   Output dijangka:

   ```text
   LPR-0001 dalam RSO: E 411007.11 m, N 323878.55 m
   Jarak ke titik kedua: 2.437 km
   Keluasan kotak: 493.9 ha
   proj4 versi dipasang: 2.19.0
   ```

4. **Semver dalam tindakan:**

   ```bash
   npm view proj4 version        # terkini
   npm outdated                  # Current 2.19.0 · Wanted 2.22.x · Latest 2.22.x
   npm update                    # naik ke "Wanted" (dalam julat ^2.19.0)
   npm run periksa               # versi kini 2.22.x
   grep proj4 package.json       # julat kekal "^2.19.0"
   ```

   > Perhatikan: `npm update` mengemas kini **lockfile** dan `node_modules`, tetapi julat dalam `package.json` masih `^2.19.0` kerana 2.22 sudah memenuhinya. Lockfile ialah rekod apa yang **sebenarnya** dipasang.

5. **Lockfile vs `npm ci`:**

   ```bash
   rm -rf node_modules
   npm ci                                    # pasang TEPAT dari lockfile
   npm pkg set dependencies.jszip="^3.10.2"  # ubah package.json TANPA install
   npm ci                                    # ❌ EUSAGE: package.json dan lockfile tidak sepadan
   npm pkg delete dependencies.jszip
   npm ci                                    # ✅
   ```

6. **devDependencies, `npx`, `audit`:**

   ```bash
   npm install -D eslint@9
   npx eslint --version          # v9.x (binari dari node_modules/.bin)
   npm audit
   npm ls --depth=0              # eslint dalam devDependencies
   ```

7. **Pakej GeoLapor:**

   ```bash
   cd <repo>/projek/geolapor-mula
   npm install                   # (atau npm ci — lockfile disediakan)
   npm ls --depth=0
   ```

   Padankan setiap pakej dengan format/kegunaannya (README §1.9) dalam jadual kosong ini, **tanpa melihat README dahulu**:

   | Pakej | Format / kegunaan | Baca atau tulis? |
   |-------|-------------------|------------------|
   | `shpjs` | | |
   | `@mapbox/shp-write` | | |
   | `sql.js` | | |
   | `@tmcw/togeojson` | | |
   | `tokml` | | |
   | `jszip` | | |
   | `geotiff` | | |
   | `@loaders.gl/las` | | |
   | `proj4` | | |
   | `@turf/turf` | | |

   Soalan: pakej mana untuk **ECW**? (Jawapan: tiada. Kenapa? README §2.B.9)

### ✅ Checkpoint
- `npm run periksa` mencetak E 411007.11 / N 323878.55
- Anda boleh menerangkan: `^` vs `~`; kenapa `npm ci` gagal pada langkah 5; beza `dependencies`/`devDependencies`
- `projek/geolapor-mula/node_modules` wujud; `npm ls leaflet` → `leaflet@1.9.4`

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `ETIMEDOUT` / `ECONNRESET` | Proksi/firewall jabatan | `npm config set proxy …` / `https-proxy …` atau registry cermin (README §1.8) |
| `SyntaxError: Cannot use import statement outside a module` | Tiada `"type": "module"` dan fail `.js` | `npm pkg set type=module` atau namakan fail `.mjs` |
| `EACCES` semasa `npm i -g` | Pemasangan global tanpa kebenaran | Elakkan `-g`; guna `npx` atau pasang dalam projek |
| `npm WARN EBADENGINE` | Versi Node lebih lama daripada `engines` | Naik taraf ke Node 22 LTS |
| `npm ci` sangat perlahan / gagal | Tiada lockfile, atau cache kosong tanpa internet | Commit lockfile; `npm ci --prefer-offline` |

### ⭐ Cabaran
1. `npm view leaflet versions --json`: cari versi 2.x (alpha/beta). Kenapa `^1.9.4` **tidak** akan memasangnya?
2. Tambah skrip `"semak": "npm run periksa && npm audit --omit=dev"`. Apakah maksud `&&`?
3. Guna `npm pack` untuk mencipta tarball pakej `latihan-npm`, kemudian `npm install ../latihan-npm/latihan-npm-1.0.0.tgz` dalam folder lain. (Corak ini berguna untuk rangkaian tertutup.)

---

## Lab 4.2 — Module Bundlers & Build Tools + Format Geospatial (S2)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Kenapa bundler, dev server, build, aset statik: B6 · Bab 2 (Optimizing and Bundling) — ms. 513–521 (**PDF 537–545**)
> - Projek Vite: B3 · Bab 1 (Getting Started with React) — ms. 271–278 (**PDF 295–302**)
> - `import()` dinamik: B1 · Bab 12 (Using JavaScript Modules) — ms. 229 (**PDF 253**)

### 🎯 Objektif
(A) Mencipta, menjalankan dan membina projek Vite 7. (B) Memindahkan GeoLapor Hari 3 ke `projek/geolapor-mula`. (C) Membaca/menulis GeoJSON, Shapefile (RSO → WGS84), GeoPackage, KML/KMZ. (D, lanjutan) GeoTIFF, LAS, Turf.

### Prasyarat
- Lab 4.1 ✅; mock API berjalan (`cd projek/api && npm start`)
- Kod Hari 1–3 anda (atau `projek/latihan/hari-1/utils/geo.js` & `projek/latihan/hari-3/services/api.js` yang telah anda siapkan)

### Bahagian A — Demo Vite (±25 minit)

1. Cipta projek (versi **dipin**, rujuk README §1.4):

   ```bash
   cd ~
   npm create vite@8.3.0 demo-vite -- --template vanilla --no-interactive
   cd demo-vite
   npm install
   npm ls vite                # vite@7.3.x
   npm run dev                # → http://localhost:5173
   ```

2. **HMR:** buka `src/main.js`, tukar teks `Hello Vite!` → `Salam PGN!`. Simpan. Halaman dikemas kini **tanpa** muat semula penuh.

3. **Pakej npm dalam browser:**

   ```bash
   npm install leaflet
   ```

   Gantikan `src/main.js`:

   ```js
   import 'leaflet/dist/leaflet.css';
   import L from 'leaflet';

   const bekas = document.createElement('div');
   bekas.style.height = '400px';
   document.querySelector('#app').replaceChildren(bekas); // buang kandungan template Vite
   const peta = L.map(bekas).setView([2.9264, 101.6958], 13);
   L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap' }).addTo(peta);
   L.marker([2.9264, 101.6958]).addTo(peta);
   console.log('Mod:', import.meta.env.MODE, '· API:', import.meta.env.VITE_API_URL);
   ```

   Buka tab **Network**: `leaflet.js?v=…` datang dari `/node_modules/.vite/deps/`, iaitu pra-bundel Vite.

4. **Environment variable:** cipta `.env.development`:

   ```bash
   echo "VITE_API_URL=http://localhost:3000" > .env.development
   ```

   Muat semula. Console: `Mod: development · API: http://localhost:3000`.

5. **Build & preview:**

   ```bash
   npm run build              # → dist/
   ls dist/assets             # nama ber-hash: index-XXXX.js, index-XXXX.css
   npm run preview            # → http://localhost:4173
   ```

   Di `:4173`, perhatikan **dua** masalah:
   - Console: `API: undefined` (kenapa? `.env.development` tidak dibaca oleh build)
   - Ikon marker **pecah** (README §2.A.7)

6. **Baiki kedua-duanya:**

   ```bash
   mv .env.development .env
   ```

   ```js
   // src/main.js: tambah selepas import L
   import iconUrl from 'leaflet/dist/images/marker-icon.png';
   import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
   import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
   delete L.Icon.Default.prototype._getIconUrl;
   L.Icon.Default.mergeOptions({ iconUrl, iconRetinaUrl, shadowUrl });
   ```

   `npm run build && npm run preview`: ikon kelihatan, API betul. **Pengajaran: sentiasa uji build, bukan dev sahaja.**

7. Buka `dist/assets/index-*.js` dan cari (Ctrl+F) `localhost:3000`. Nilai `VITE_*` ada dalam teks biasa, jadi ia **tidak rahsia**.

### Bahagian B — Pindah GeoLapor ke Vite (±50 minit)

8. Sediakan projek:

   ```bash
   cd <repo>/projek/geolapor-mula
   cp .env.example .env        # VITE_API_URL & VITE_API_KEY
   npm run dev                 # → http://localhost:5173 (peta kosong + panel)
   grep -rn "TODO \[H4-S2\]" src   # senarai kerja S2
   ```

   Lihat Console: tiada error, dan peta Putrajaya dipapar (`ciptaPeta` sudah disediakan). Setiap fail rangka bermula dengan `/* eslint-disable no-unused-vars … */`. **Buang baris itu** apabila anda melengkapkan fail tersebut (Lab 4.3 akan memeriksanya).

9. **`src/utils/geo.js`**: salin modul Hari 1 anda (atau `projek/latihan/hari-1/utils/geo.js` yang telah anda siapkan) dan gantikan seluruh fail. Nama dan tandatangan mesti ikut fail rangka `src/utils/geo.js`.

10. **`src/services/api.js`**: salin `projek/latihan/hari-3/services/api.js` (atau versi Hari 2 anda). Gantikan **hanya** bahagian atas:

    ```js
    // services/api.js — layer servis (Hari 2) dipindah ke Vite (Hari 4).
    // `?.` kerana import.meta.env hanya wujud dalam Vite (dalam `node --test` ia undefined).
    const API_URL = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000';
    // Key LATIHAN sahaja — nilai VITE_* dibenamkan dalam bundle dan boleh dibaca sesiapa.
    const API_KEY = import.meta.env?.VITE_API_KEY ?? 'latihan-pgn-2026';
    ```

    (Buang `export const API_URL = 'http://localhost:3000'` dan `const API_KEY = 'latihan-pgn-2026'` versi Hari 3.)

11. **`src/ui/notis.js`**:

    ```js
    // ui/notis.js — Notis ringkas (#notis).
    let pemasa;

    export function paparNotis(mesej, jenis = 'info') {
      const kotak = document.getElementById('notis');
      kotak.textContent = mesej;
      kotak.dataset.jenis = jenis;
      kotak.hidden = false;
      clearTimeout(pemasa);
      pemasa = setTimeout(() => (kotak.hidden = true), 4000);
    }
    ```

12. **`src/ui/senarai.js`**: kad Hari 3 disesuaikan dengan kelas CSS projek ini (`item-laporan`, `titik-kategori`, `item-tajuk`, `item-meta`, `dipilih`):

    ```js
    // ui/senarai.js — Senarai laporan (dipindah dari Hari 3).
    import { formatKoordinat } from '../utils/geo.js';

    let pilihSemasa = null; // handler terkini — delegasi dipasang SEKALI sahaja

    export function renderSenarai(ul, features, { onPilih, warnaKategori = {} } = {}) {
      pilihSemasa = onPilih;
      if (!ul.dataset.delegasi) {
        ul.dataset.delegasi = 'ya';
        ul.addEventListener('click', (e) => {
          const li = e.target.closest('li[data-id]');
          if (li && ul.contains(li)) pilihSemasa?.(li.dataset.id);
        });
      }

      const serpihan = document.createDocumentFragment();
      for (const f of features) {
        const { id, tajuk, kategori, status } = f.properties;
        const li = document.createElement('li');
        li.className = 'item-laporan';
        li.dataset.id = id;
        li.tabIndex = 0;

        const titik = document.createElement('span');
        titik.className = 'titik-kategori';
        titik.style.background = warnaKategori[kategori] ?? '#888';
        const tajukEl = document.createElement('span');
        tajukEl.className = 'item-tajuk';
        tajukEl.textContent = tajuk; // textContent — tajuk ialah input pengguna
        const meta = document.createElement('span');
        meta.className = 'item-meta';
        meta.textContent = `${id} · ${kategori} · ${status} · ${formatKoordinat(f.geometry.coordinates)}`;

        li.append(titik, tajukEl, meta);
        serpihan.append(li);
      }
      ul.replaceChildren(serpihan);
    }

    export function tandaDipilih(ul, id) {
      for (const li of ul.querySelectorAll('.dipilih')) li.classList.remove('dipilih');
      const li = ul.querySelector(`li[data-id="${CSS.escape(id)}"]`);
      li?.classList.add('dipilih');
      li?.scrollIntoView({ block: 'nearest' });
    }
    ```

    > Kenapa `dataset.delegasi`? `renderSenarai` dipanggil **setiap kali** penapis berubah. Tanpa pengawal ini, setiap panggilan menambah listener baharu, dan satu klik akan memanggil `onPilih` 5, 10, 20 kali.

13. **`src/ui/statistik.js`**:

    ```js
    // ui/statistik.js — Panel statistik (#statistik).
    import { kiraIkut } from '../utils/geo.js';

    export function renderStatistik(kotak, features) {
      const jumlah = document.createElement('p');
      jumlah.textContent = `Jumlah dipapar: ${features.length}`;
      const bahagian = [jumlah];
      for (const medan of ['kategori', 'status']) {
        const h = document.createElement('h3');
        h.textContent = `Ikut ${medan}`;
        const ul = document.createElement('ul');
        for (const [nilai, bil] of Object.entries(kiraIkut(features, medan))) {
          const li = document.createElement('li');
          li.textContent = `${nilai}: ${bil}`;
          ul.append(li);
        }
        bahagian.push(h, ul);
      }
      kotak.replaceChildren(...bahagian);
    }
    ```

14. **`src/ui/peta.js`**: kekalkan `ciptaPeta` (sudah siap). Gantikan dua fungsi TODO:

    ```js
    /** Popup SELAMAT — elemen DOM, bukan string HTML. */
    function kandunganPopup({ properties: p }) {
      const div = document.createElement('div');
      const b = document.createElement('strong');
      b.textContent = p.tajuk;
      const meta = document.createElement('p');
      meta.textContent = `${p.id} · ${p.kategori} · ${p.status}`;
      div.append(b, meta);
      if (p.catatan) {
        const c = document.createElement('p');
        c.textContent = p.catatan;
        div.append(c);
      }
      return div;
    }

    let lapisanLaporan = null; // lukisan sebelumnya (dibuang sebelum lukis semula)

    export function lukisLaporan(peta, features, { warnaKategori = {}, onPilih } = {}) {
      lapisanLaporan?.remove();
      const indeks = new Map();
      lapisanLaporan = L.geoJSON(
        { type: 'FeatureCollection', features },
        {
          pointToLayer: (f, latlng) =>
            L.circleMarker(latlng, {
              radius: 7,
              color: '#fff',
              weight: 2,
              fillColor: warnaKategori[f.properties.kategori] ?? '#888',
              fillOpacity: 0.9,
            }),
          onEachFeature: (f, layer) => {
            layer.bindPopup(() => kandunganPopup(f));
            layer.on('click', (e) => {
              L.DomEvent.stopPropagation(e); // jangan cetuskan klik PETA (isi koordinat borang)
              onPilih?.(f.properties.id);
            });
            indeks.set(f.properties.id, layer);
          },
        },
      ).addTo(peta);
      return { lapisan: lapisanLaporan, indeks };
    }

    export function paparGeoJSON(peta, fc, gaya = {}) {
      return L.geoJSON(fc, {
        style: () => ({ color: '#d95f02', weight: 2, fillOpacity: 0.15, ...gaya }),
        pointToLayer: (_f, latlng) =>
          L.circleMarker(latlng, { radius: 5, color: '#d95f02', fillColor: '#d95f02', fillOpacity: 0.8, ...gaya }),
        onEachFeature: (f, layer) => {
          const p = f.properties ?? {};
          const label = p.nama ?? p.name ?? p.kod ?? p.tajuk ?? '(tanpa nama)';
          layer.bindTooltip(document.createTextNode(String(label))); // nod teks — bukan HTML
        },
      }).addTo(peta);
    }
    ```

    > `L.circleMarker` (bukan `L.marker`) mengelakkan terus masalah ikon pecah dalam build (Bahagian A langkah 5).

15. **`src/ui/penapis.js`** (versi S2; S4 menambah `localStorage`):

    ```js
    // ui/penapis.js — Borang penapis (#penapis: name="kategori" | "status" | "q").
    function debounce(fn, ms = 300) {
      let pemasa;
      return (...args) => {
        clearTimeout(pemasa);
        pemasa = setTimeout(() => fn(...args), ms);
      };
    }

    export function sediakanPenapis(form, { onUbah }) {
      const hantar = () => onUbah(Object.fromEntries(new FormData(form)));
      form.addEventListener('change', (e) => {
        if (e.target.tagName === 'SELECT') hantar();
      });
      form.addEventListener('input', debounce((e) => e.target.name === 'q' && hantar(), 300));
      form.addEventListener('reset', () => setTimeout(hantar)); // selepas browser mengosongkan medan
      return {}; // S4: pulangkan penapis yang dipulihkan
    }
    ```

16. **`src/ui/borang.js`** (versi S2; S4 menambah draf). Borang ini tiada `minlength/min/max`, jadi validasi dibuat dalam JS:

    ```js
    // ui/borang.js — Borang laporan baharu (#borang), dipindah dari Hari 3.
    import { dalamMalaysia } from '../utils/geo.js';

    function paparRalat(form, nama, teks) {
      const p = form.querySelector(`.ralat-medan[data-ralat="${nama}"]`);
      if (p) p.textContent = teks ?? '';
      form.elements[nama]?.setAttribute('aria-invalid', teks ? 'true' : 'false');
    }

    function kosongkanRalat(form) {
      for (const p of form.querySelectorAll('.ralat-medan')) p.textContent = '';
    }

    /** Validasi klien → { medan: mesej }. Kosong = sah. (Server tetap mengesahkan semula.) */
    export function validasi({ tajuk, kategori, catatan, lat, lng }) {
      const r = {};
      const t = tajuk.trim();
      if (t.length < 5 || t.length > 120) r.tajuk = 'Tajuk 5–120 aksara.';
      if (!kategori) r.kategori = 'Pilih satu kategori.';
      if (catatan.length > 500) r.catatan = 'Catatan maksimum 500 aksara.';
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) r.lat = 'Klik peta untuk memilih lokasi.';
      else if (!dalamMalaysia([lng, lat])) r.lat = 'Lokasi di luar Malaysia.';
      return r;
    }

    export function sediakanBorang(form, { onHantar }) {
      form.addEventListener('input', (e) => {
        if (e.target.name) paparRalat(form, e.target.name, '');
      });
      form.addEventListener('reset', () => kosongkanRalat(form));

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        kosongkanRalat(form);
        const d = Object.fromEntries(new FormData(form));
        const data = {
          tajuk: d.tajuk.trim(),
          kategori: d.kategori,
          catatan: d.catatan,
          lat: d.lat === '' ? NaN : Number(d.lat),
          lng: d.lng === '' ? NaN : Number(d.lng),
        };

        const ralat = validasi(data);
        if (Object.keys(ralat).length) {
          for (const [nama, teks] of Object.entries(ralat)) paparRalat(form, nama, teks);
          form.elements[Object.keys(ralat)[0]]?.focus();
          return;
        }

        const butang = form.querySelector('button[type="submit"]');
        butang.disabled = true;
        try {
          await onHantar(data);
          form.reset();
        } catch (err) {
          if (err.status === 422 && err.medan) {
            for (const [nama, teks] of Object.entries(err.medan)) paparRalat(form, nama, teks);
          } else {
            paparRalat(form, '_umum', err.message);
          }
        } finally {
          butang.disabled = false;
        }
      });
    }

    /** Isi medan lat/lng daripada klik peta. lngLat = [lng, lat] (susunan GeoJSON) */
    export function isiKoordinat(form, [lng, lat]) {
      form.elements.lat.value = lat.toFixed(6);
      form.elements.lng.value = lng.toFixed(6);
      form.elements.lat.dispatchEvent(new Event('input', { bubbles: true }));
    }
    ```

17. **`src/main.js`, bahagian 1–4.** Gantikan seluruh `main.js` dengan kod di bawah. (Bahagian 5–7 ditambah dalam Bahagian C, D dan Lab 4.4.)

    ```js
    // main.js — Titik masuk GeoLapor (Hari 4: Vite + npm).
    import 'leaflet/dist/leaflet.css';
    import './style.css';
    import L from 'leaflet';
    import { mintaJson, senaraiLaporan, senaraiKategori, ciptaLaporan } from './services/api.js';
    import { ciptaPeta, lukisLaporan, paparGeoJSON } from './ui/peta.js';
    import { renderSenarai, tandaDipilih } from './ui/senarai.js';
    import { sediakanBorang, isiKoordinat } from './ui/borang.js';
    import { sediakanPenapis } from './ui/penapis.js';
    import { renderStatistik } from './ui/statistik.js';
    import { paparNotis } from './ui/notis.js';

    const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
    const $ = (pemilih) => document.querySelector(pemilih);

    const peta = ciptaPeta($('#peta'));
    const ul = $('#senarai');
    const borang = $('#borang');
    const penapisForm = $('#penapis');

    let laporanDipapar = []; // Feature yang sedang dipapar (untuk eksport & analisis)
    let indeks = new Map(); // id → layer
    let idDipilih = null;
    let pengawal = null;

    // ── 1. Status API ──────────────────────────────────────────────────────
    const lencana = $('#status-api');
    mintaJson('/api/kesihatan', { timeoutMs: 3000 })
      .then(() => {
        lencana.textContent = 'API: dalam talian';
        lencana.classList.add('ok');
      })
      .catch(() => {
        lencana.textContent = 'API: luar talian';
        lencana.classList.add('gagal');
      });

    // ── 2. Kategori → warna + pilihan <select> ────────────────────────────
    const warnaKategori = {};
    const penapisAwal = sediakanPenapis(penapisForm, { onUbah: (p) => muatLaporan(p) });
    try {
      for (const { kod, nama, warna } of await senaraiKategori()) {
        warnaKategori[kod] = warna;
        penapisForm.elements.kategori.append(new Option(nama, kod));
        borang.elements.kategori.append(new Option(nama, kod));
      }
      penapisForm.elements.kategori.value = penapisAwal.kategori ?? ''; // pulihkan selepas pilihan wujud
    } catch (err) {
      paparNotis(`Kategori gagal dimuat: ${err.message}`, 'ralat');
    }

    // ── 3. Laporan: senarai + peta + statistik ────────────────────────────
    function pilih(id) {
      idDipilih = id;
      const layer = indeks.get(id);
      if (!layer) return;
      peta.flyTo(layer.getLatLng(), 17, { duration: 0.6 });
      layer.openPopup();
      tandaDipilih(ul, id);
    }

    async function muatLaporan(penapis = Object.fromEntries(new FormData(penapisForm))) {
      pengawal?.abort();
      pengawal = new AbortController();
      const status = $('#senarai-status');
      status.textContent = 'Memuat…';
      try {
        const fc = await senaraiLaporan(penapis, { signal: pengawal.signal });
        laporanDipapar = fc.features;
        renderSenarai(ul, laporanDipapar, { onPilih: pilih, warnaKategori });
        ({ indeks } = lukisLaporan(peta, laporanDipapar, { warnaKategori, onPilih: pilih }));
        renderStatistik($('#statistik'), laporanDipapar);
        status.textContent = `${laporanDipapar.length} laporan`;
      } catch (err) {
        if (err.name === 'AbortError') return;
        status.textContent = `⚠️ ${err.message}`;
      }
    }

    $('#butang-zum-semua').addEventListener('click', () => {
      const kumpulan = L.featureGroup([...indeks.values()]);
      if (kumpulan.getLayers().length) peta.fitBounds(kumpulan.getBounds(), { padding: [20, 20] });
    });

    // ── 4. Borang + klik peta ─────────────────────────────────────────────
    peta.on('click', (e) => {
      isiKoordinat(borang, [e.latlng.lng, e.latlng.lat]); // ⚠️ fungsi menerima [lng, lat]
      $('#panel-borang').open = true;
    });

    sediakanBorang(borang, {
      onHantar: async (data) => {
        const feature = await ciptaLaporan(data); // error 422 dilempar semula → borang.js papar per medan
        paparNotis(`✅ ${feature.properties.id} dicipta`, 'berjaya');
        await muatLaporan();
        pilih(feature.properties.id);
      },
    });

    // (Bahagian 5–8: Lab 4.2C/D & 4.4)

    await muatLaporan(penapisAwal);
    ```

    > `API_URL` dan `paparGeoJSON` belum digunakan (ESLint akan memberi amaran). Ia diperlukan dalam Bahagian C.

### ✅ Checkpoint B
- `http://localhost:5173`: lencana **API: dalam talian**, 40 laporan dalam senarai & peta, statistik dipapar
- Tapis status **selesai** → 8 laporan; cari `papan` → 2
- Klik item senarai → peta terbang + popup + item disorot; klik peta → lat/lng terisi; hantar laporan → notis ✅
- `npm run build && npm run preview` → sama di `:4173`

### Bahagian C — Format vektor: baca & tulis (±40 minit)

18. **`src/utils/unjuran.js`**: kekalkan `RSO_PROJ` (diberi). Gantikan `keWgs84`:

    ```js
    /** Guna `tukar` pada SETIAP pasangan koordinat, apa jua jenis geometri. */
    function petaKoordinat(geometry, tukar) {
      if (!geometry) return geometry;
      if (geometry.type === 'GeometryCollection') {
        return { ...geometry, geometries: geometry.geometries.map((g) => petaKoordinat(g, tukar)) };
      }
      // Kedalaman array: Point 0 · LineString/MultiPoint 1 · Polygon/MultiLineString 2 · MultiPolygon 3
      const aras = { Point: 0, MultiPoint: 1, LineString: 1, MultiLineString: 2, Polygon: 2, MultiPolygon: 3 }[
        geometry.type
      ];
      const turun = (c, a) => (a === 0 ? tukar(c) : c.map((x) => turun(x, a - 1)));
      return { ...geometry, coordinates: turun(geometry.coordinates, aras) };
    }

    export function keWgs84(fc, dariEpsg = 'EPSG:3375') {
      const penukar = proj4(dariEpsg, 'EPSG:4326');
      const tukar = ([x, y, ...lain]) => [...penukar.forward([x, y]), ...lain]; // kekalkan Z jika ada
      return { ...fc, features: fc.features.map((f) => ({ ...f, geometry: petaKoordinat(f.geometry, tukar) })) };
    }

    /** Semakan pantas: adakah koordinat pertama kelihatan seperti meter (bukan darjah)? */
    export function nampakMeter(fc) {
      const cari = (c) => (typeof c[0] === 'number' ? c : cari(c[0]));
      const [x, y] = cari(fc.features[0]?.geometry?.coordinates ?? [0, 0]);
      return Math.abs(x) > 180 || Math.abs(y) > 90;
    }
    ```

    Uji di Console browser (Vite membenarkan import laluan `/src/…`):

    ```js
    const { keWgs84 } = await import('/src/utils/unjuran.js');
    keWgs84({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: {}, geometry: { type: 'Point', coordinates: [411007.11, 323878.55] } }] }).features[0].geometry.coordinates;
    // → [101.6958…, 2.9264…]
    ```

19. **`src/io/format.js`**: gantikan seluruh fail:

    ```js
    // io/format.js — Baca & tulis format vektor dalam browser. Semua bacaan → FeatureCollection EPSG:4326.
    import JSZip from 'jszip';
    import { parseShp, parseDbf, combine } from 'shpjs';
    import { kml } from '@tmcw/togeojson';
    import initSqlJs from 'sql.js';
    import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url';
    import tokml from 'tokml';
    import shpwrite from '@mapbox/shp-write';
    import { keWgs84, nampakMeter } from '../utils/unjuran.js';

    const sambungan = (nama) => nama.slice(nama.lastIndexOf('.')).toLowerCase();

    export async function bacaFail(file) {
      switch (sambungan(file.name)) {
        case '.geojson':
        case '.json':
          return bacaGeoJSON(await file.text());
        case '.zip':
          return bacaShapefileZip(await file.arrayBuffer());
        case '.gpkg':
          return bacaGeoPackage(await file.arrayBuffer());
        case '.kml':
          return bacaKml(await file.text());
        case '.kmz':
          return bacaKmz(await file.arrayBuffer());
        default:
          throw new Error(`Format tidak disokong: ${file.name}`);
      }
    }

    // ── GeoJSON ────────────────────────────────────────────────────────────
    function bacaGeoJSON(teks) {
      const json = JSON.parse(teks);
      if (json.type === 'FeatureCollection') return json;
      if (json.type === 'Feature') return { type: 'FeatureCollection', features: [json] };
      throw new Error('Bukan GeoJSON Feature/FeatureCollection');
    }

    // ── Shapefile (.zip) ───────────────────────────────────────────────────
    async function bacaShapefileZip(buffer) {
      const zip = await JSZip.loadAsync(buffer);
      const shp = zip.file(/\.shp$/i)[0];
      if (!shp) throw new Error('Tiada .shp dalam zip');
      const asas = shp.name.slice(0, -4);
      const cari = (ext) =>
        zip.file(new RegExp(`^${asas.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.${ext}$`, 'i'))[0];
      const [shpBuf, dbfBuf, prj] = await Promise.all([
        shp.async('arraybuffer'),
        cari('dbf')?.async('arraybuffer'),
        cari('prj')?.async('string'),
      ]);

      let fc = combine([parseShp(shpBuf), dbfBuf ? parseDbf(dbfBuf) : undefined]); // koordinat mentah
      if (prj && /3375|RSO|Rectified_Skew|Hotine/i.test(prj)) fc = keWgs84(fc, 'EPSG:3375');
      else if (nampakMeter(fc)) throw new Error('Koordinat dalam meter tetapi CRS tidak dikenali (.prj tiada/lain)');
      return fc;
    }

    // ── GeoPackage (.gpkg) ─────────────────────────────────────────────────
    let janjiSql;
    const dapatkanSql = () => (janjiSql ??= initSqlJs({ locateFile: () => sqlWasmUrl }));

    async function bacaGeoPackage(buffer) {
      const SQL = await dapatkanSql();
      const db = new SQL.Database(new Uint8Array(buffer));
      try {
        const [hasil] = db.exec('SELECT table_name, column_name, srs_id FROM gpkg_geometry_columns');
        if (!hasil) throw new Error('Tiada jadual ciri dalam GeoPackage');
        const features = [];
        for (const [jadual, lajur, srsId] of hasil.values) {
          const stmt = db.prepare(`SELECT * FROM "${jadual.replaceAll('"', '""')}"`);
          const ciri = [];
          while (stmt.step()) {
            const { [lajur]: geom, ...properties } = stmt.getAsObject();
            ciri.push({ type: 'Feature', properties, geometry: gpkgTitik(geom) });
          }
          stmt.free();
          const fc = { type: 'FeatureCollection', features: ciri };
          features.push(...(srsId === 3375 ? keWgs84(fc).features : ciri));
        }
        return { type: 'FeatureCollection', features };
      } finally {
        db.close();
      }
    }

    /** GeoPackageBinary → Point (asas: jenis WKB 1 sahaja). */
    function gpkgTitik(blob) {
      const dv = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
      if (dv.getUint8(0) !== 0x47 || dv.getUint8(1) !== 0x50) throw new Error('Geometri GPKG tidak sah');
      const envelope = [0, 32, 48, 48, 64][(dv.getUint8(3) >> 1) & 0b111];
      const o = 8 + envelope;
      const le = dv.getUint8(o) === 1;
      const jenis = dv.getUint32(o + 1, le) % 1000; // 1001/2001/3001 = Point Z/M/ZM
      if (jenis !== 1) throw new Error(`Jenis WKB ${jenis} belum disokong (asas: Point)`);
      return { type: 'Point', coordinates: [dv.getFloat64(o + 5, le), dv.getFloat64(o + 13, le)] };
    }

    // ── KML / KMZ ──────────────────────────────────────────────────────────
    function bacaKml(teks) {
      const dom = new DOMParser().parseFromString(teks, 'text/xml');
      if (dom.querySelector('parsererror')) throw new Error('KML rosak (XML tidak sah)');
      return kml(dom);
    }

    async function bacaKmz(buffer) {
      const zip = await JSZip.loadAsync(buffer);
      const utama = zip.file('doc.kml') ?? zip.file(/\.kml$/i)[0];
      if (!utama) throw new Error('Tiada .kml dalam KMZ');
      return bacaKml(await utama.async('string'));
    }

    // ── Eksport ────────────────────────────────────────────────────────────
    function muatTurun(blob, namaFail) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = namaFail;
      document.body.append(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    export function eksportGeoJSON(fc, nama = 'laporan') {
      muatTurun(new Blob([JSON.stringify(fc, null, 2)], { type: 'application/geo+json' }), `${nama}.geojson`);
    }

    export function eksportKML(fc, nama = 'laporan') {
      const teks = tokml(fc, { name: 'tajuk', description: 'catatan', documentName: nama });
      muatTurun(new Blob([teks], { type: 'application/vnd.google-earth.kml+xml' }), `${nama}.kml`);
    }

    export async function eksportShapefile(fc, nama = 'laporan') {
      const blob = await shpwrite.zip(fc, { outputType: 'blob', compression: 'DEFLATE', types: { point: nama } });
      muatTurun(blob, `${nama}.zip`);
    }
    ```

20. **`src/main.js`, bahagian 6** (import/eksport). Tampal **sebelum** baris `await muatLaporan(penapisAwal);`:

    ```js
    // ── 6. Import / eksport fail geospatial (pustaka dimuat DINAMIK) ─────
    const panelFail = $('#panel-fail');
    const maklumat = panelFail.querySelector('.maklumat');

    function paparMaklumat(baris) {
      const dl = document.createElement('dl');
      for (const [k, v] of baris) {
        const dt = document.createElement('dt');
        dt.textContent = k;
        const dd = document.createElement('dd');
        dd.textContent = v;
        dl.append(dt, dd);
      }
      maklumat.replaceChildren(dl);
    }

    async function prosesFail(fail) {
      const ext = fail.name.slice(fail.name.lastIndexOf('.')).toLowerCase();
      try {
        // (Bahagian D: cabang .tif dan .las ditambah di sini)
        const { bacaFail } = await import('./io/format.js'); // chunk berasingan dalam build
        const fc = await bacaFail(fail);
        const lapisan = paparGeoJSON(peta, fc);
        peta.fitBounds(lapisan.getBounds(), { padding: [20, 20] });
        paparMaklumat([
          ['Fail', fail.name],
          ['Bilangan ciri', String(fc.features.length)],
          ['Medan', Object.keys(fc.features[0]?.properties ?? {}).join(', ')],
        ]);
        paparNotis(`${fail.name}: ${fc.features.length} ciri`, 'berjaya');
      } catch (err) {
        console.error(err);
        paparNotis(`Gagal membaca ${fail.name}: ${err.message}`, 'ralat');
      }
    }

    panelFail.querySelector('input[type="file"]').addEventListener('change', async (e) => {
      for (const fail of e.target.files) await prosesFail(fail);
      e.target.value = ''; // benarkan fail sama dipilih semula
    });

    // Seret-lepas ke atas peta
    const zonLepas = $('#peta');
    zonLepas.addEventListener('dragover', (e) => e.preventDefault()); // WAJIB supaya 'drop' berlaku
    zonLepas.addEventListener('drop', async (e) => {
      e.preventDefault();
      for (const fail of e.dataTransfer.files) await prosesFail(fail);
    });

    // Sampel dari mock API (/data/…) → File (sama seperti pengguna memilih fail)
    panelFail.querySelector('[data-muat-sampel]').addEventListener('click', async () => {
      const nama = panelFail.querySelector('select[name="sampel"]').value;
      const res = await fetch(`${API_URL}/data/${nama}`);
      if (!res.ok) return paparNotis(`Sampel ${nama}: HTTP ${res.status}`, 'ralat');
      await prosesFail(new File([await res.blob()], nama));
    });

    panelFail.addEventListener('click', async (e) => {
      const format = e.target.closest('[data-eksport]')?.dataset.eksport;
      if (!format) return;
      const fc = { type: 'FeatureCollection', features: laporanDipapar };
      const io = await import('./io/format.js');
      if (format === 'geojson') io.eksportGeoJSON(fc, 'laporan');
      if (format === 'kml') io.eksportKML(fc, 'laporan');
      if (format === 'shp') await io.eksportShapefile(fc, 'laporan');
    });
    ```

21. **Uji setiap format** (panel *Fail geospatial* → pilih sampel → **Muat sampel**, atau seret fail dari `projek/data/` ke atas peta):

    | Sampel | Jangkaan |
    |--------|----------|
    | `sempadan-zon-rso.zip` | 5 poligon **mengelilingi Putrajaya**; medan `kod, nama, keluasan_h` (**10 aksara!**) |
    | `sungai.geojson` | 3 garis; medan `kod, nama, panjang_km` |
    | `kemudahan.gpkg` | 12 titik; medan `fid, kod, nama, jenis` |
    | `kemudahan.kml` | 12 titik; medan `name, description, kod, nama, jenis` |
    | `kemudahan.kmz` | Sama seperti KML |

22. **Eksperimen RSO (5 minit):** dalam `bacaShapefileZip`, komenkan sementara baris `if (prj && …) fc = keWgs84(…)`. Muat `sempadan-zon-rso.zip`. Apa berlaku? (Error "meter tetapi CRS tidak dikenali", kerana `nampakMeter` menangkapnya.) Buang juga cabang `else if` sekejap: di manakah peta terbang? Pulihkan kedua-duanya.

23. **Eksport:** klik **GeoJSON**, **KML**, **Shapefile**. Tiga fail dimuat turun. **Pusingan penuh:** seret `laporan.zip` yang baru dimuat turun kembali ke peta. 40 titik muncul di tempat asal. Buka `laporan.kml` dalam Google Earth / QGIS jika ada.

24. **Lihat pemisahan kod:**

    ```bash
    npm run build
    ```

    Cari `format-*.js` dan `sql-wasm-*.wasm` dalam output. Ia **berasingan** daripada `index-*.js` kerana `import()` dinamik.

### ✅ Checkpoint C
- 5 format vektor dipapar di tempat yang betul; zon RSO berada di Putrajaya
- Anda boleh menerangkan kenapa `keluasan_ha` menjadi `keluasan_h`
- 3 fail eksport dimuat turun; `laporan.zip` boleh diimport semula

### Bahagian D — Lanjutan: GeoTIFF, LAS, Turf (overflow / selepas S4 / kerja rumah)

25. **`src/io/raster.js`**: gantikan seluruh fail:

    ```js
    // io/raster.js — GeoTIFF dengan geotiff.js.
    // ECW: tiada pustaka JS — tukar dahulu: gdal_translate -of COG input.ecw output.tif (atau QGIS).
    import { fromArrayBuffer } from 'geotiff';

    export async function bacaGeoTIFF(arrayBuffer) {
      const tiff = await fromArrayBuffer(arrayBuffer);
      const imej = await tiff.getImage();
      const [nilai] = await imej.readRasters(); // band pertama
      const noData = imej.getGDALNoData();
      let min = Infinity;
      let max = -Infinity;
      for (const v of nilai) {
        if (Number.isNaN(v) || v === noData) continue;
        if (v < min) min = v;
        if (v > max) max = v;
      }
      return { lebar: imej.getWidth(), tinggi: imej.getHeight(), bbox: imej.getBoundingBox(), min, max, nilai };
    }

    /** Nilai piksel di [lng, lat] (raster EPSG:4326), atau null jika di luar. */
    export function nilaiDi({ lebar, tinggi, bbox: [minX, minY, maxX, maxY], nilai }, [lng, lat]) {
      const lajur = Math.floor(((lng - minX) / (maxX - minX)) * lebar);
      const baris = Math.floor(((maxY - lat) / (maxY - minY)) * tinggi); // baris 0 = utara
      if (lajur < 0 || lajur >= lebar || baris < 0 || baris >= tinggi) return null;
      return nilai[baris * lebar + lajur];
    }

    /** Raster → data URL PNG kelabu (rendah = gelap) untuk L.imageOverlay. */
    export function rasterKeDataUrl({ lebar, tinggi, min, max, nilai }) {
      const kanvas = document.createElement('canvas');
      kanvas.width = lebar;
      kanvas.height = tinggi;
      const ctx = kanvas.getContext('2d');
      const imej = ctx.createImageData(lebar, tinggi);
      for (let i = 0; i < nilai.length; i++) {
        const t = Math.round(((nilai[i] - min) / (max - min || 1)) * 255);
        imej.data.set([t, t, t, Number.isNaN(nilai[i]) ? 0 : 200], i * 4);
      }
      ctx.putImageData(imej, 0, 0);
      return kanvas.toDataURL('image/png');
    }
    ```

26. **`src/io/lidar.js`**: gantikan seluruh fail:

    ```js
    // io/lidar.js — Maklumat asas LAS dengan @loaders.gl/las.
    import { parse } from '@loaders.gl/core';
    import { LASLoader } from '@loaders.gl/las';

    export async function bacaLAS(arrayBuffer) {
      const dv = new DataView(arrayBuffer);
      const tandatangan = String.fromCharCode(...new Uint8Array(arrayBuffer, 0, 4));
      if (tandatangan !== 'LASF') throw new Error('Bukan fail LAS (tiada "LASF")');
      const versi = `${dv.getUint8(24)}.${dv.getUint8(25)}`;

      const data = await parse(arrayBuffer, LASLoader, { worker: false, las: { shape: 'mesh' } });
      const { mins, maxs } = data.loaderData;
      return {
        versi,
        bilanganTitik: data.header.vertexCount,
        bbox: [mins[0], mins[1], maxs[0], maxs[1]],
        julatZ: [mins[2], maxs[2]],
      };
    }
    ```

27. **`main.js` → `prosesFail`**: gantikan komen `// (Bahagian D: …)` dengan:

    ```js
    if (ext === '.tif' || ext === '.tiff') {
      const { bacaGeoTIFF, nilaiDi, rasterKeDataUrl } = await import('./io/raster.js');
      const r = await bacaGeoTIFF(await fail.arrayBuffer());
      const [minX, minY, maxX, maxY] = r.bbox;
      L.imageOverlay(rasterKeDataUrl(r), [[minY, minX], [maxY, maxX]], { opacity: 0.6 }).addTo(peta); // [lat, lng]!
      const contoh = laporanDipapar[0];
      paparMaklumat([
        ['Saiz', `${r.lebar} × ${r.tinggi}`],
        ['bbox', r.bbox.map((v) => v.toFixed(4)).join(', ')],
        ['Min / maks', `${r.min.toFixed(2)} / ${r.max.toFixed(2)}`],
        [contoh ? `Nilai di ${contoh.id}` : 'Nilai', contoh ? String(nilaiDi(r, contoh.geometry.coordinates)?.toFixed(2)) : '-'],
      ]);
      return;
    }
    if (ext === '.las' || ext === '.laz') {
      const { bacaLAS } = await import('./io/lidar.js');
      const las = await bacaLAS(await fail.arrayBuffer());
      paparMaklumat([
        ['Versi', las.versi],
        ['Bilangan titik', las.bilanganTitik.toLocaleString('ms-MY')],
        ['bbox (meter RSO)', las.bbox.map((v) => v.toFixed(1)).join(', ')],
        ['Julat Z', las.julatZ.map((v) => v.toFixed(2)).join(' – ')],
      ]);
      return;
    }
    ```

    Uji: `dem-putrajaya.tif` → `100 × 100`, bbox `101.6600, 2.8800, 101.7400, 2.9700`, min/maks `13.36 / 89.27`, **nilai di LPR-0001 = 23.46** (penapis kosong). `sampel.las` → versi `1.2`, `1,000` titik, bbox `410918.9, 323724.1, 411529.2, 324331.1`, Z `22.20 – 50.98`.

28. **`main.js`, bahagian 7** (Turf). Tampal sebelum `await muatLaporan(penapisAwal);`. (Guna `dapatkanLapisan` terus buat masa ini. Lab 4.4 menukarnya kepada `muatLapisan` bercache.)

    ```js
    // ── 7. Analisis Turf ──────────────────────────────────────────────────
    const panelAnalisis = $('#panel-analisis');
    let lapisanPenampan = null;
    panelAnalisis.addEventListener('click', async (e) => {
      const turf = await import('@turf/turf'); // Turf juga dimuat dinamik
      const titik = turf.featureCollection(laporanDipapar);
      if (e.target.closest('[data-kira-zon]')) {
        const zon = await dapatkanLapisan('sempadan-zon'); // Lab 4.4: → (await muatLapisan('sempadan-zon')).fc
        const baris = zon.features.map((z) => {
          const tr = document.createElement('tr');
          for (const teks of [z.properties.kod, z.properties.nama, turf.pointsWithinPolygon(titik, z).features.length]) {
            const td = document.createElement('td');
            td.textContent = teks;
            tr.append(td);
          }
          return tr;
        });
        panelAnalisis.querySelector('.jadual').replaceChildren(...baris);
      }
      if (e.target.closest('[data-penampan]')) {
        const pusat = laporanDipapar.find((f) => f.properties.id === idDipilih);
        if (!pusat) return paparNotis('Pilih satu laporan dahulu', 'amaran');
        const km = Number(panelAnalisis.querySelector('[name="km"]').value);
        const kawasan = turf.buffer(pusat, km, { units: 'kilometers' });
        const dalam = turf.pointsWithinPolygon(titik, kawasan).features.filter((f) => f.properties.id !== idDipilih);
        lapisanPenampan?.remove();
        lapisanPenampan = paparGeoJSON(peta, kawasan, { color: '#7b61ff', fillOpacity: 0.1 });
        panelAnalisis.querySelector('.hasil-penampan').textContent =
          `${dalam.length} laporan dalam ${km} km: ${dalam.map((f) => f.properties.id).join(', ') || '-'}`;
      }
      if (e.target.closest('[data-buang-penampan]')) lapisanPenampan?.remove();
    });
    ```

    Tambah `dapatkanLapisan` pada import `./services/api.js`. Uji: **Kira laporan per zon** → A 5 · B 7 · C 10 · D 3 · E 15 (data asal, `npm run reset-data`). Pilih LPR-0001 → **Penampan** 0.5 km → `1 laporan dalam 0.5 km: LPR-0011`.

### ✅ Checkpoint D
- DEM & LAS memaparkan nilai di atas; imej DEM kelabu bertindih pada Putrajaya
- Jadual zon = 40 laporan jumlahnya; penampan LPR-0001 menemui LPR-0011

### 🧯 Masalah lazim (Lab 4.2)

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `npm create vite` memasang Vite 8 | Tidak dipin | `npm create vite@8.3.0 … --template vanilla` (template Vite ^7.3) |
| `Failed to resolve import "leaflet"` | Pakej tidak dipasang dalam projek ini | `npm install` dalam folder projek |
| `import.meta.env.VITE_API_URL` undefined | Tiada `.env` / tanpa awalan `VITE_` / hanya `.env.development` dalam build | `cp .env.example .env`; mulakan semula `npm run dev` |
| `Error: TODO [H4-S2]: … belum dilaksanakan` | Fungsi rangka belum diganti | Lengkapkan fail itu (lihat nama fungsi dalam mesej) |
| Zon RSO tidak kelihatan / di Atlantik | `keWgs84` tidak dipanggil atau `.prj` tidak dikesan | Semak regex `.prj`; `console.log(fc.features[0].geometry.coordinates[0][0])` |
| `sql-wasm.wasm` 404 / `CompileError` | `locateFile` tidak menunjuk ke aset Vite | `import sqlWasmUrl from 'sql.js/dist/sql-wasm.wasm?url'` + `locateFile: () => sqlWasmUrl` |
| Drop fail membuka fail dalam tab | Tiada `preventDefault()` pada `dragover` | Tambah listener `dragover` |
| DEM terbalik / teranjak | `imageOverlay` diberi `[lng, lat]` | Bounds Leaflet: `[[minLat, minLng], [maxLat, maxLng]]` |
| `Jenis WKB 3 belum disokong` | GPKG poligon (parser asas hanya Point) | ⭐ Cabaran 2, atau tanya jurulatih untuk melihat parser WKB penuh |

### ⭐ Cabaran
1. **Klik peta → ketinggian:** simpan raster terakhir dalam variable; dalam `peta.on('click')` papar `nilaiDi(raster, [lng, lat])` dalam notis.
2. **WKB penuh:** lanjutkan `gpkgTitik` untuk LineString (2) dan Polygon (3). Bandingkan hasil dengan rakan atau jurulatih.
3. **LAS → peta:** ambil 200 titik pertama dari `data.attributes.POSITION.value` (x, y, z berselang), reproject setiap `[x, y]` dengan `proj4('EPSG:3375', 'EPSG:4326', …)`, dan papar sebagai `circleMarker` berwarna ikut `classification` (2 = coklat, 5 = hijau).
4. **COG dari URL:** guna `fromUrl()` geotiff.js pada `http://localhost:3000/data/dem-putrajaya.tif` dan perhatikan tab Network (request `Range`).

---

## Lab 4.3 — Code Quality & Coding Standards (S3)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - ESLint: B6 · Bab 3 (Testing Your JavaScript) — ms. 536–541 (**PDF 560–565**)
> - Prettier: B1 · Bab 2 (Filling Your JavaScript Toolbox) — ms. 44–47 (**PDF 68–71**)
> - Konvensyen penamaan: B1 · Bab 1 & Bab 3 — ms. 32–33, 66–67 (**PDF 56–57, 90–91**)

### 🎯 Objektif
Menjalankan ESLint 9 dan Prettier pada GeoLapor, memahami setiap peraturan dalam `eslint.config.js`, membaiki amaran sebenar, dan menyemak konvensyen penamaan.

### Prasyarat
- Lab 4.2 Bahagian B ✅ (atau sekurang-kurangnya beberapa fail dilengkapkan)
- Sambungan VS Code **ESLint** + **Prettier** (pilihan tetapi disyorkan)

### Langkah

1. **Lint pertama:**

   ```bash
   cd projek/geolapor-mula
   npm run lint
   ```

   Baca setiap baris. Dua jenis mesej lazim pada peringkat ini:
   - `Unused eslint-disable directive (no problems were reported from 'no-unused-vars')`: anda melengkapkan fail tetapi **terlupa** membuang baris `/* eslint-disable no-unused-vars … */` rangka. Buang baris itu.
   - `'…' is defined but never used`: import sisa (cth `paparGeoJSON` sebelum Bahagian C), atau `keadaanAwal` dalam `state/store.js`. Yang kedua ialah rangka **Hari 5**, jadi biarkan.

2. **Fahami konfigurasi.** Buka `eslint.config.js` dan terangkan kepada rakan setiap blok: `ignores`, `js.configs.recommended`, `languageOptions.globals`, `rules`, blok `*.config.js` (Node), dan `prettier` **terakhir**. Kemudian tambah satu peraturan dalam blok `rules`:

   ```js
   'no-console': ['warn', { allow: ['warn', 'error', 'info'] }],
   ```

   `npm run lint` sekali lagi. Adakah `console.log` tinggal dalam kod anda?

3. **Fail latihan dengan 10 masalah sebenar.** Cipta `src/semak-lint.js`:

   ```js
   // src/semak-lint.js — fail latihan S3: masalah sebenar untuk dibaiki
   import { senaraiLaporan, ApiError } from './services/api.js';
   import { formatKoordinat } from './utils/geo.js';

   var jumlah = 0;

   export async function paparLaporan(ul, tapisan) {
     let data = await senaraiLaporan(tapisan);
     console.log('dapat', data.features.length);
     for (const f of data.features) {
       if (f.properties.status == 'selesai') continue;
       const li = document.createElement('li');
       li.innerHTML = `<b>${f.properties.tajuk}</b>`;
       ul.append(li);
       jumlah++;
     }
     return jumlh;
   }

   export function warnaStatus(status) {
     switch (status) {
       case 'baharu':
         return '#dbeafe';
       case 'selesai':
         return '#d1fae5';
         break;
     }
   }
   ```

   ```bash
   npx eslint src/semak-lint.js
   ```

   Jangkaan (dengan peraturan `no-console` dari langkah 2):

   ```text
    2:26  warning  'ApiError' is defined but never used          no-unused-vars
    3:10  warning  'formatKoordinat' is defined but never used   no-unused-vars
    5:1   error    Unexpected var, use let or const instead       no-var
    5:5   warning  'jumlah' is assigned a value but never used    no-unused-vars
    8:7   error    'data' is never reassigned. Use 'const' …      prefer-const
    9:3   warning  Unexpected console statement …                 no-console
   11:29  error    Expected '===' and instead saw '=='            eqeqeq
   13:5   error    'innerHTML' is restricted from being used …    no-restricted-properties
   17:10  error    'jumlh' is not defined                         no-undef
   26:7   error    Unreachable code                               no-unreachable
   ✖ 10 problems (6 errors, 4 warnings)
   ```

4. `npx eslint --fix src/semak-lint.js`: **2** dibaiki automatik (`var` → `let`, `let data` → `const`). Baiki **8** yang tinggal **dengan tangan**, dan fikirkan maksud setiap satu:
   - `jumlh` → `jumlah` (pepijat sebenar: `ReferenceError` semasa berjalan!)
   - `==` → `===`
   - `li.innerHTML = …` → `const b = document.createElement('b'); b.textContent = f.properties.tajuk; li.append(b);`
   - buang `break` yang tidak tercapai; buang import tidak digunakan; buang/ubah `console.log`
   - `jumlah` "never used": ia dinaikkan tetapi tidak pernah **dibaca**. Kembalikan ia (`return jumlah;`), dan amaran hilang.

   Kemudian: `npx eslint src/semak-lint.js` → tiada output. **Soalan:** `warnaStatus('ditolak')` memulangkan apa? ESLint tidak mengadu. **Lint tidak menangkap semua pepijat logik.**

5. Padam `src/semak-lint.js`. `npm run lint` → **0 error** (amaran `store.js` Hari 5 dibenarkan).

6. **Prettier:**

   ```bash
   npx prettier --check .       # fail mana tidak berformat?
   npm run format               # prettier --write .
   git diff --stat              # (jika dalam git) apa yang berubah
   ```

   Buka `.prettierrc`: `printWidth: 110`, `singleQuote`, `trailingComma: "all"`. Tukar `printWidth` kepada 80, `npm run format`, lihat kesannya, dan pulihkan kepada 110.

7. **VS Code (5 minit):** `Ctrl+Shift+P` → *Preferences: Open Workspace Settings (JSON)*:

   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "editor.codeActionsOnSave": { "source.fixAll.eslint": "explicit" }
   }
   ```

   Tulis `var x = 1 == 2` dalam mana-mana fail dan simpan. Perhatikan garis merah dan pembetulan automatik.

8. **Semakan penamaan (pasangan, 10 minit):** tukar fail dengan rakan. Senaraikan 3 nama yang **tidak** ikut README §3.5 (cth `data2`, `x`, `handle`, boolean tanpa awalan, fungsi tanpa kata kerja). Cadangkan nama baharu. **Jangan** tukar nama API dikunci.

9. **Pintu kualiti akhir:**

   ```bash
   npm run lint && npm run build && npm run preview
   ```

### ✅ Checkpoint
- `npm run lint` → 0 error; tiada `eslint-disable` rangka yang tertinggal dalam fail yang sudah dilengkapkan
- `semak-lint.js`: 10 → 0 (dan dipadam)
- `npx prettier --check .` lulus

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `ESLint couldn't find an eslint.config.(js\|mjs\|cjs) file` | Menjalankan di folder salah | `cd projek/geolapor-mula` |
| `'document' is not defined` (no-undef) | `globals.browser` tiada untuk fail itu | Semak `files` + `languageOptions.globals` |
| `'process' is not defined` dalam `vite.config.js` | Fail konfigurasi ialah Node | Blok `files: ['*.config.js']` dengan `globals.node` |
| Prettier & ESLint "bergaduh" (simpan → berubah → merah) | `eslint-config-prettier` tiada / tidak terakhir | Pastikan `prettier` elemen **terakhir** array |
| `.eslintrc.json` tidak dibaca | ESLint 9 menggunakan flat config | Pindah ke `eslint.config.js` |

### ⭐ Cabaran
1. Tambah peraturan `complexity: ['warn', 10]` dan `max-lines-per-function: ['warn', 60]`. Fungsi mana dalam `main.js` melanggarnya? Pecahkan kepada fungsi kecil.
2. Tambah skrip `"semak": "npm run lint && prettier --check . && npm run build"`, iaitu satu arahan sebelum setiap penyerahan.
3. Tulis JSDoc untuk `bacaFail` dan `keWgs84`, dan perhatikan autolengkap VS Code bertambah baik.

---

## Lab 4.4 — Browser Storage (S4)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Pilihan storage browser (gambaran): B2 · Bab 1 (What a Web Browser Does) — ms. 239–240 (**PDF 263–264**)
> - `localStorage` sebagai property `window`: B2 · Bab 2 (Programming the Browser) — ms. 247–248 (**PDF 271–272**)

### 🎯 Objektif
Melaksanakan `services/cache.js` (localStorage + IndexedDB), menyimpan penapis & draf borang, cache layer rujukan dengan TTL, dan menguji behaviour luar talian.

### Prasyarat
- Lab 4.2 Bahagian B ✅; DevTools → tab **Application** dikenali
- README §S4

### Langkah

1. **Terokai di Console (10 minit):**

   ```js
   localStorage.setItem('ujian', 5); typeof localStorage.getItem('ujian');   // "string"!
   localStorage.setItem('objek', { a: 1 }); localStorage.getItem('objek');   // "[object Object]" ❌
   localStorage.setItem('objek', JSON.stringify({ a: 1, t: new Date(), m: new Map([['x', 1]]) }));
   JSON.parse(localStorage.getItem('objek'));                                // t = string, m = {} ❌
   sessionStorage.setItem('tab', 'A');  // buka tab kedua ke URL sama → sessionStorage.getItem('tab') → null
   (await navigator.storage.estimate());                                      // { usage, quota }
   localStorage.clear(); sessionStorage.clear();
   ```

2. **`src/services/cache.js`**: gantikan seluruh fail (tambah juga `buangLocal` & `kosongkanCache`):

   ```js
   // services/cache.js — Browser storage.
   //   localStorage : kecil, sync, string (JSON) → penapis & draf borang
   //   IndexedDB    : besar, async, objek → cache layer GeoJSON
   // ⚠️ Jangan simpan token/kata laluan/data peribadi di sini.

   export function bacaLocal(kunci, lalai = null) {
     try {
       const teks = localStorage.getItem(kunci);
       return teks === null ? lalai : JSON.parse(teks);
     } catch {
       return lalai;
     }
   }

   export function simpanLocal(kunci, nilai) {
     try {
       localStorage.setItem(kunci, JSON.stringify(nilai));
     } catch (err) {
       console.warn('localStorage gagal:', err);
     }
   }

   export function buangLocal(kunci) {
     try {
       localStorage.removeItem(kunci);
     } catch {
       /* abaikan */
     }
   }

   const TTL_MS = 24 * 60 * 60 * 1000; // 1 hari
   let janjiDb;

   function bukaDb() {
     janjiDb ??= new Promise((resolve, reject) => {
       const req = indexedDB.open('geolapor', 1);
       req.onupgradeneeded = () => req.result.createObjectStore('lapisan');
       req.onsuccess = () => resolve(req.result);
       req.onerror = () => reject(req.error);
     });
     return janjiDb;
   }

   async function transaksi(mod, kerja) {
     const db = await bukaDb();
     return new Promise((resolve, reject) => {
       const tx = db.transaction('lapisan', mod);
       const req = kerja(tx.objectStore('lapisan'));
       tx.oncomplete = () => resolve(req.result);
       tx.onerror = () => reject(tx.error);
     });
   }

   /** Nilai cache, atau null jika tiada / luput / IndexedDB gagal. */
   export async function dapatkanCache(kunci, { terimaLuput = false } = {}) {
     try {
       const rekod = await transaksi('readonly', (s) => s.get(kunci));
       if (!rekod) return null;
       return terimaLuput || Date.now() - rekod.masa < TTL_MS ? rekod.nilai : null;
     } catch {
       return null;
     }
   }

   export async function simpanCache(kunci, nilai) {
     try {
       await transaksi('readwrite', (s) => s.put({ nilai, masa: Date.now() }, kunci));
     } catch (err) {
       console.warn('IndexedDB gagal:', err);
     }
   }

   export async function kosongkanCache() {
     try {
       await transaksi('readwrite', (s) => s.clear());
     } catch {
       /* abaikan */
     }
   }
   ```

3. **Penapis diingati** (`src/ui/penapis.js`): tambah import dan ubah `sediakanPenapis`:

   ```js
   import { bacaLocal, simpanLocal } from '../services/cache.js';

   const KUNCI_PENAPIS = 'geolapor:penapis';

   export function sediakanPenapis(form, { onUbah }) {
     const hantar = () => {
       const penapis = Object.fromEntries(new FormData(form));
       simpanLocal(KUNCI_PENAPIS, penapis);
       onUbah(penapis);
     };

     // Pulihkan (nilai kategori dipulihkan dalam main.js selepas pilihan diisi dari API)
     const simpanan = bacaLocal(KUNCI_PENAPIS, {});
     for (const [nama, nilai] of Object.entries(simpanan)) {
       if (form.elements[nama]) form.elements[nama].value = nilai;
     }

     form.addEventListener('change', (e) => {
       if (e.target.tagName === 'SELECT') hantar();
     });
     form.addEventListener('input', debounce((e) => e.target.name === 'q' && hantar(), 300));
     form.addEventListener('reset', () => setTimeout(hantar));
     return simpanan;
   }
   ```

   Uji: tapis status **selesai** + cari `papan` → muat semula (F5). Penapis dan senarai kekal. Lihat **Application → Local Storage → geolapor:penapis**.

4. **Draf borang: versi NAIF dahulu** (`src/ui/borang.js`). Tambah di atas:

   ```js
   import { bacaLocal, simpanLocal, buangLocal } from '../services/cache.js';

   const KUNCI_DRAF = 'geolapor:draf-borang';

   function debounce(fn, ms = 500) {
     let pemasa;
     return (...args) => {
       clearTimeout(pemasa);
       pemasa = setTimeout(() => fn(...args), ms);
     };
   }
   ```

   Dalam `sediakanBorang`, **gantikan** dua listener `input` dan `reset` yang sedia ada dengan:

   ```js
   const draf = bacaLocal(KUNCI_DRAF);
   if (draf) {
     for (const [nama, nilai] of Object.entries(draf)) {
       if (form.elements[nama]) form.elements[nama].value = nilai;
     }
   }
   const simpanDraf = debounce(() => simpanLocal(KUNCI_DRAF, Object.fromEntries(new FormData(form))), 500);
   form.addEventListener('input', (e) => {
     if (e.target.name) paparRalat(form, e.target.name, '');
     simpanDraf();
   });
   form.addEventListener('reset', () => {
     kosongkanRalat(form);
     buangLocal(KUNCI_DRAF);
   });
   ```

   Uji: taip tajuk → F5 → tajuk dipulihkan ✅.

5. **Cari pepijat (10 minit).** Isi borang lengkap (tajuk, klik peta), kemudian **pilih kategori dan terus klik Hantar** dalam masa < ½ saat. Laporan berjaya dicipta dan borang dikosongkan. Sekarang lihat **Application → Local Storage**. Adakah `geolapor:draf-borang` masih wujud? Kenapa? *(Petunjuk: pemasa debounce masih berjalan ketika `reset` membuang draf.)*

   **Pembetulan:** debounce yang boleh dibatalkan:

   ```js
   /** debounce dengan .batal() — perlu untuk membatalkan simpanan draf yang masih tertunda. */
   function debounce(fn, ms = 500) {
     let pemasa;
     const tertunda = (...args) => {
       clearTimeout(pemasa);
       pemasa = setTimeout(() => fn(...args), ms);
     };
     tertunda.batal = () => clearTimeout(pemasa);
     return tertunda;
   }
   ```

   ```js
   form.addEventListener('reset', () => {
     simpanDraf.batal(); // ❗ tanpa ini, simpanan tertunda menulis semula draf (kosong) SELEPAS dibuang
     kosongkanRalat(form);
     buangLocal(KUNCI_DRAF);
   });
   ```

   Ulang ujian: draf hilang selepas berjaya ✅.

6. **Cache layer rujukan (`main.js`, bahagian 5).** Tambah import `senaraiLapisan, dapatkanLapisan` dari `./services/api.js` dan `dapatkanCache, simpanCache, kosongkanCache` dari `./services/cache.js`. Tampal sebelum bahagian 6:

   ```js
   // ── 5. Layer rujukan (cache-first IndexedDB, TTL 24 j) ──────────────
   async function muatLapisan(id) {
     const cache = await dapatkanCache(id);
     if (cache) return { fc: cache, sumber: 'cache' };
     try {
       const fc = await dapatkanLapisan(id);
       await simpanCache(id, fc);
       return { fc, sumber: 'api' };
     } catch (err) {
       const luput = await dapatkanCache(id, { terimaLuput: true }); // lebih baik data lama daripada kosong
       if (luput) return { fc: luput, sumber: 'cache (luput)' };
       throw err;
     }
   }

   const lapisanRujukan = new Map(); // id → L.GeoJSON
   async function sediakanLapisan() {
     const bekas = $('#senarai-lapisan');
     let meta;
     try {
       meta = await senaraiLapisan();
     } catch {
       meta = [
         { id: 'sempadan-zon', nama: 'Sempadan Zon' },
         { id: 'sungai', nama: 'Sungai' },
         { id: 'kemudahan', nama: 'Kemudahan' },
       ]; // luar talian: senarai tetap, data dari cache
     }
     bekas.replaceChildren(
       ...meta.map(({ id, nama }) => {
         const label = document.createElement('label');
         const kotak = document.createElement('input');
         kotak.type = 'checkbox';
         kotak.value = id;
         label.append(kotak, ` ${nama}`);
         kotak.addEventListener('change', async () => {
           if (!kotak.checked) return lapisanRujukan.get(id)?.remove();
           try {
             const { fc, sumber } = await muatLapisan(id);
             lapisanRujukan.get(id)?.remove();
             lapisanRujukan.set(id, paparGeoJSON(peta, fc, id === 'sungai' ? { color: '#1d7fd1' } : {}));
             paparNotis(`${nama}: ${fc.features.length} ciri (${sumber})`, 'info');
           } catch (err) {
             kotak.checked = false;
             paparNotis(`${nama} gagal: ${err.message}`, 'ralat');
           }
         });
         return label;
       }),
     );
   }
   sediakanLapisan();
   $('#butang-kosong-cache').addEventListener('click', async () => {
     await kosongkanCache();
     paparNotis('Cache lapisan dikosongkan', 'info');
   });
   ```

   Dalam bahagian 7 (Turf), tukar `const zon = await dapatkanLapisan('sempadan-zon');` → `const { fc: zon } = await muatLapisan('sempadan-zon');`.

   Uji: tanda **Sempadan Zon** → notis `(api)`. Nyahtanda, tanda semula → `(cache)`. **Application → IndexedDB → geolapor → lapisan**: rekod `{ nilai, masa }`.

7. **Status rangkaian (`main.js`, bahagian 8):**

   ```js
   window.addEventListener('offline', () => paparNotis('Luar talian — draf borang disimpan dalam pelayar', 'amaran'));
   window.addEventListener('online', () => paparNotis('Kembali dalam talian', 'berjaya'));
   ```

8. **Ujian luar talian (simulasi pegawai lapangan):**
   1. Tanda **Sempadan Zon** sekali (supaya dicache). Mula taip laporan (jangan hantar).
   2. **Hentikan mock API** (Ctrl+C di terminal API). Muat semula halaman (F5).
   3. Jangkaan: lencana **API: luar talian**; draf borang **masih ada**; tanda **Sempadan Zon** → `(cache)` ✅; tanda **Sungai** (belum pernah dicache) → notis error yang jelas (bukan skrin putih).
   4. Hidupkan semula API. Hantar draf dan pastikan ia berjaya dan draf dibuang.

   > ⚠️ Mod **Network → Offline** DevTools menyekat **semua** request, termasuk dev server Vite. Jangan tekan F5 dalam mod itu (halaman tidak akan dimuat). Gunakannya untuk menguji event `offline`/`online` dan klik layer **tanpa** muat semula.

9. **Semakan keselamatan (5 minit, berpasangan):** buka **Application → Local Storage / IndexedDB**. Senaraikan semua yang disimpan GeoLapor. Adakah apa-apa di situ yang **tidak sepatutnya** disimpan (README §4.4)? Di mana `VITE_API_KEY` boleh dilihat? (Jawapan: dalam bundle JS, bukan storage. Kedua-duanya awam.)

### ✅ Checkpoint
- Penapis & draf dipulihkan selepas F5; draf dibuang selepas berjaya dihantar (walaupun hantar dengan pantas)
- Layer kali kedua dari `(cache)`; dengan API mati, layer bercache masih dipapar
- DevTools → Application menunjukkan `geolapor:penapis`, `geolapor:draf-borang` dan IndexedDB `geolapor/lapisan`
- `npm run lint && npm run build` lulus

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `[object Object]` dalam storage | `setItem` tanpa `JSON.stringify` | Guna `simpanLocal` |
| `SyntaxError: Unexpected token` semasa baca | Nilai lama bukan JSON | `bacaLocal` dengan `try…catch` pulangkan nilai default; padam key dalam DevTools |
| Penapis kategori tidak dipulihkan | Nilai ditetapkan **sebelum** `<option>` wujud | Tetapkan semula selepas `senaraiKategori()` (bahagian 2) |
| `NotFoundError: … object stores was not found` | DB versi 1 sudah wujud tanpa store (percubaan awal) | DevTools → IndexedDB → *Delete database*, atau naikkan versi ke 2 |
| Cache tidak pernah dikemas kini | TTL panjang, data API berubah | Butang **Kosongkan cache lapisan**; atau kurangkan `TTL_MS` semasa ujian |
| `QuotaExceededError` | Menyimpan GeoJSON besar dalam localStorage | Data besar → IndexedDB |
| Draf kembali selepas hantar | Pemasa debounce tidak dibatalkan | `simpanDraf.batal()` dalam `reset` (langkah 5) |

### ⭐ Cabaran
1. **Stale-while-revalidate:** papar layer dari cache serta-merta, kemudian `dapatkanLapisan` di latar belakang, dan jika data berbeza, kemas kini peta + cache.
2. **Baris gilir luar talian:** jika `ciptaLaporan` gagal dengan `status === 0`, simpan laporan dalam IndexedDB store `baris-gilir`, dan hantar semula semua semasa event `online`. (Preview corak "background sync".)
3. **Fail diimport kekal:** simpan `File` yang diimport terus dalam IndexedDB (structured clone menyokong `Blob`, jadi tiada stringify) dan muat semula semasa halaman dibuka.
4. **Kuota:** papar `navigator.storage.estimate()` dalam panel Statistik (MB digunakan / GB kuota).

---

## 🏁 Penutup hari

Demo 3 minit (pasangan):

1. `npm run build && npm run preview`: aplikasi berjalan dari `dist/`
2. Muat `sempadan-zon-rso.zip` → zon di Putrajaya; terangkan satu ayat tentang RSO → WGS84
3. Eksport Shapefile → import semula
4. Hentikan API → F5 → draf & layer bercache masih ada
5. `npm run lint` → 0 error
