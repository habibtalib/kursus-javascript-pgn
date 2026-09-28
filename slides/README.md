# Slaid — JS-PGN-5

Dek slaid **Kursus Pengaturcaraan JavaScript** (5 hari, PGN — Pusat Geospatial Negara) · 28 Sep – 2 Okt 2026 · Bilik Latihan KBS, Aras 14.

| Fail | Keterangan |
|------|------------|
| `js-pgn-5.html` | Dek penuh (89 slaid), **satu fail self-contained**: CSS + JavaScript inline, fon sistem, motif kontur dalam SVG inline. **Tiada CDN, tiada rangkaian** — berfungsi luar talian. |

Kandungan patuh [`../JADUAL.md`](../JADUAL.md).

Enjin (skala pentas, navigasi, gambaran keseluruhan, nota, cetak) diadaptasi daripada dek kursus saudara `coach-codeigniter-10-hari-kkm/slides/ci-kkm-10.html`.

## Susunan dek

| Slaid | Bahagian |
|-------|----------|
| 1–11 | **Pengenalan**: kulit, agenda 5 hari, objektif kursus, GeoLapor, seni bina, model data, jadual endpoint mock API, API key & `?lambat`/`?gagal`, rentak harian, cara lab, persediaan |
| 12–26 | **Hari 1** · Modern JavaScript (ES6+) Core Syntax → `utils/geo.js` |
| 27–40 | **Hari 2** · Asynchronous JavaScript & Web API Integration → `services/api.js` |
| 41–54 | **Hari 3** · DOM Manipulation & Event Handling → halaman GeoLapor + Leaflet |
| 55–74 | **Hari 4** · Web Development Tooling & Ecosystem → Vite, format geospatial, proj4, Turf, storage |
| 75–89 | **Hari 5** · State Management & Modern Frontend Architecture → store, seni bina, ujian, demo, penutup |

Setiap hari = slaid pembahagi (nombor hari besar, tajuk aturcara, senarai sesi + masa, cip benang API/Geo) → *Objektif hari ini* → slaid konsep/kod → *Semak sebelum pulang*.

## Cara membentang

1. Buka `js-pgn-5.html` dalam Chrome, Edge atau Firefox (klik dua kali atau seret ke browser).
2. Tekan **F** untuk skrin penuh.

Pentas slaid tetap 1280×720 (16:9) dan diskala automatik mengikut saiz tetingkap.

### Pintasan papan kekunci

| Kekunci | Tindakan |
|---------|----------|
| `→` `↓` `Space` `PageDown` `N` | Slaid seterusnya |
| `←` `↑` `PageUp` `P` `Shift+Space` | Slaid sebelumnya |
| `Home` / `End` | Slaid pertama / terakhir |
| `G`, nombor, `Enter` | Lompat ke slaid (cth `G` `4` `8` `Enter` → amaran `[lng, lat]`) |
| `O` | Gambaran keseluruhan semua slaid (klik untuk lompat) |
| `F` | Skrin penuh |
| `?` | Senarai pintasan |
| `Esc` | Tutup panel |

Tetikus & sentuh: klik **separuh kiri** = sebelum, **separuh kanan** = seterusnya (klik pada blok kod tidak menukar slaid — boleh pilih teks). Pada tablet, **leret** kiri/kanan.

Pautan terus: tambah `#n` pada URL, cth `js-pgn-5.html#55` membuka pembahagi Hari 4. URL dikemas kini semasa bergerak.

Animasi peralihan ≤ 200 ms dan dimatikan automatik jika sistem menetapkan *reduce motion* (termasuk denyutan pin peta).

## Cetak ke PDF

1. Buka dek dalam **Chrome/Edge** → `Ctrl/Cmd + P`.
2. Destinasi: **Save as PDF**. Saiz kertas **A4**, orientasi **Landskap**, margin **Tiada**.
3. Hidupkan **Background graphics**.
4. Simpan. Hasil: **satu slaid setiap halaman A4 landskap (89 halaman)**, nombor halaman di penjuru.

## Cara mengedit

Setiap slaid ialah satu `<section class="slide">` di dalam `<div class="stage">`. Susunan dalam fail = susunan pembentangan; nombor slaid dikira automatik.

```html
<section class="slide codey">
  <div class="eyebrow">Hari 2 · S4 — Fetch API <span class="xy">2.9264° N, 101.6958° E</span></div>
  <h2>Tajuk slaid</h2>
  … kandungan …
  <aside class="notes"><p>Nota penceramah dalam BM.</p></aside>
</section>
```

- **Label hari** di HUD bawah datang dari `data-label` pada slaid pembahagi (cth `data-label="Hari 3 · DOM &amp; Events"`). Slaid berikutnya mewarisi label itu.
- **Slaid gelap** (latar lautan + garis kontur + graticule): tambah kelas `dark` (+ `divider` untuk pembahagi hari, `cover` untuk kulit/penutup).
- **Slaid berat kod**: tambah kelas `codey` supaya tajuk lebih padat.
- **Eyebrow** sentiasa berikon pin peta. `<span class="xy">…</span>` menambah koordinat bergaya mono selepas garis pemisah.
- **Had kandungan**: ≤ 6 butiran setiap slaid; kod ≤ ~22 baris (`sm`) atau ~26 baris (`xs`). Jika melimpah, pecahkan kepada dua slaid.

### Komponen sedia ada

| Kelas | Kegunaan |
|-------|----------|
| `.grid.c2` / `.c3` / `.c4` / `.c5` | Grid kad 2–5 lajur |
| `.split` (`.l`, `.r`, `.l2`, `.r2`) | Dua lajur (kiri lebar / kanan lebar) |
| `.card` (+ `.top`, `.side`, `.flat`, `.tint`, `.sm`) | Kad; warna jalur ikut kelas benang |
| `.m-api` `.m-json` `.m-peta` `.m-fmt` `.m-js` `.m-amber` `.m-rose` `.m-a` `.m-n` | Warna benang: API emerald, JSON sky, Peta teal, Format violet, JS kuning gelap |
| `.chip` · `.coord` · `.ext` | Cip bulat · cip koordinat (slaid gelap) · lencana sambungan fail (`.shp`) |
| `.st.baharu` / `.dalam-tindakan` / `.selesai` / `.ditolak` | Badge status laporan (enum tetap) |
| `.verb.get` / `.post` / `.patch` / `.del` | Lencana HTTP method |
| `ul.checks` / `ul.checks.done` | Objektif (kotak kosong) / hasil (kotak bertanda) — **balut teks setiap `<li>` dalam `<span>`**, tag sesi dengan `<em>S1</em>` |
| `ol.steps` (`.tight`) · `ul.list` (`.sm`, `.xs`) | Langkah bernombor · senarai berlian |
| `.callout.tip` / `.warn` / `.danger` / `.info` (+ `.sm`) | Kotak 💡 / ⚠️ / 🔐 / 📡 |
| `table.t` (+ `.sm`, `.xs`) | Jadual |
| `.flow > .node + .arr` (`.node.hot`, `.node.js`) | Aliran mendatar |
| `.eloop` · `.tree` · `.layers > .layer` · `.swap` + `.mnemo` + `.minimap` | Rajah event loop · pokok DOM · layer seni bina · amaran `[lng, lat]` |
| `dl.facts` · `.fmtgrid` · `.rgrid` · `.ftree` · `.console` | Fakta format fail · grid 3 keluarga format · grid raster · pokok folder · output terminal/Console |

### Blok kod

```html
<div class="codewrap"><div class="codebar">src/utils/geo.js<span class="lang">js</span></div>
<pre class="code sm" data-lang="js">…kod…</pre></div>
```

- Lepaskan aksara HTML dalam kod: `<` → `&lt;`, `>` → `&gt;`, `&` → `&amp;`.
- **Penyerlahan sintaks automatik** ketika dimuat untuk `data-lang="js"`, `json`, `sh`, `html` (bahasa lain dipapar tanpa warna). Jika `<pre>` sudah mengandungi `<span>`, ia tidak disentuh — boleh guna span manual: `.k` keyword, `.s` string, `.c` komen, `.f` fungsi, `.t` kelas/global, `.v` property/key JSON, `.n` nombor, `.o` operator.
- Saiz: `pre.code` (14px) · `.sm` (13px) · `.xs` (12px). Label `.lang` kuning = JS; tambah `.alt` untuk bahasa lain.
- Varian: `.codewrap.bad` (❌ contoh salah) dan `.codewrap.good` (✅ contoh betul).
- Kod mesti sah untuk **ES2024 / Node 22** dan guna nama tepat modul terkunci: `utils/geo.js` (`formatKoordinat`, `jarakKm`, `tapisLaporan`, `kiraIkut`, `bboxDari`, `dalamMalaysia`), `services/api.js` (`ApiError`, `mintaJson`, `senaraiLaporan` … `dapatkanStatistik`), `state/store.js` (`ciptaStore` → `{ dapat, set, langgan }`), `io/format.js` (`bacaFail`, `eksportGeoJSON`, `eksportKML`, `eksportShapefile`).
- Koordinat data sentiasa **`[lng, lat]`**; hanya panggilan Leaflet guna `[lat, lng]`.

## Token tema

Semua warna dan fon ditakrif sebagai CSS variable dalam `:root` di bahagian atas `<style>`. Ubah di situ sahaja.

| Token | Nilai | Kegunaan |
|-------|-------|----------|
| `--navy-950` / `--navy-900` / `--navy-800` / `--navy-700` | `#061A33` / `#0B2545` / `#13315C` / `#1D4E89` | Latar lautan dalam: kulit, pembahagi hari, blok rentak |
| `--paper` / `--surface` | `#F6F8F7` / `#FFFFFF` | Latar slaid kandungan / kad |
| `--ink` / `--ink-2` / `--muted` | `#0B1B2E` / `#2F4155` / `#5F7285` | Teks utama / badan / sekunder |
| `--emerald` / `--emerald-700` | `#10B981` / `#047857` | Benang API, kotak ✓, bar kemajuan |
| `--teal` / `--teal-700` | `#14B8A6` / `#0F766E` | Aksen utama, eyebrow, benang Peta |
| `--sky` / `--violet` | `#0EA5E9` / `#8B5CF6` | Benang JSON / Format fail |
| `--amber` / `--rose` | `#F59E0B` / `#F43F5E` | Amaran / bahaya |
| `--js` / `--js-ink` | `#F7DF1E` / `#1F1D0A` | **Tandatangan JS** — guna jarang: perkataan “JavaScript” di kulit, label kod JS, pin peta, hari semasa pada rel |
| `--glow` | `#5EEAD4` | Teks aksen & garis kontur pada slaid gelap |
| `--code-bg` / `--code-bar` | `#08172B` / `#0E2140` | Blok kod |
| `--font` | `"Inter", ui-sans-serif, system-ui, …` | Fon teks (Inter jika dipasang, jika tidak fon sistem) |
| `--mono` | `ui-monospace, "SF Mono", …` | Fon kod & koordinat |

Motif geospatial: garis kontur (SVG inline sebagai data URI dalam `.slide.dark::after`), graticule lat/long (`.slide.dark::before` + label `.gratlab`), anak panah utara (`.northarrow`), bar skala (`.scalebar`), pin berdenyut (`.bigpin` + `.pinlab`), dan bingkai peta halus (*neatline*) pada slaid kandungan.

## Semakan selepas mengedit

```bash
grep -c '<section class="slide' js-pgn-5.html   # bilangan slaid (89)
```

Kemudian buka dek, tekan `O` untuk melihat semua slaid sekali gus, dan semak tiada teks yang melimpah atau terpotong. Semakan yang dijalankan semasa membina dek ini:

- Chrome headless 1280×720: setiap slaid diaktifkan, tiada elemen melepasi zon HUD (y > 676) atau tepi sisi, tiada blok kod terpotong mendatar/menegak, setiap slaid ada nota.
- `node --check` pada skrip enjin dan pada setiap 63 blok kod JS (diekstrak sebagai modul ES).
- Tag HTML seimbang (parser `html.parser`).
- Cetak ke PDF: 89 halaman, A4 landskap (842×595 pt).
