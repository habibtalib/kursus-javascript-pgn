# Kursus Pengaturcaraan JavaScript — PGN (5 Hari)

**28 Sep – 2 Okt 2026** · Bilik Latihan KBS, Aras 14 · Peserta: Pusat Geospatial Negara (PGN)

Kursus hands-on JavaScript moden — dari sintaks ES6+ hingga API, DOM, tooling dan seni bina frontend — **dijalin dengan kes guna geospatial**: peta web, JSON/GeoJSON, integrasi API, serta baca/tulis format Shapefile, GeoPackage, GeoJSON, KML/KMZ, GeoTIFF, ECW dan LAS/LAZ.

## Projek berjalan: GeoLapor

Setiap hari menambah ciri pada satu aplikasi sebenar — **GeoLapor**, sistem laporan tapak geospatial (data sintetik sekitar Putrajaya):

| Hari | Tema (aturcara) | GeoLapor bertambah… |
|------|-----------------|---------------------|
| 1 | Modern JavaScript (ES6+) Core Syntax | `utils/geo.js` — olah GeoJSON dengan `map/filter/reduce` |
| 2 | Asynchronous JavaScript & Web API Integration | `services/api.js` — GET/POST/PATCH/DELETE ke mock API |
| 3 | DOM Manipulation & Event Handling | Peta Leaflet, senarai, borang laporan |
| 4 | Web Development Tooling & Ecosystem | Vite + npm, ESLint, browser storage, **import/eksport format geospatial** |
| 5 | State Management & Modern Frontend Architecture | Store berpusat, seni bina berlapis, demo projek |

## Mula di sini

| Anda… | Buka |
|-------|------|
| Peserta | [`docs/persediaan.md`](./docs/persediaan.md) → `hari-N/README.md` → `hari-N/lab.md` |
| Kod | [`projek/`](./projek/) — mock API, data sampel, latihan, GeoLapor (mula) |

## Struktur

```text
JADUAL.md
hari-1/ … hari-5/    README.md (objektif + nota) · lab.md
nota/                nota topikal (asas JS → async → DOM → peta → format geospatial → seni bina)
docs/                persediaan, cheat sheet, rujukan, glosari, rubrik, penilaian kendiri
slides/              dek slaid HTML (offline)
projek/              api/ · data/ · latihan/ · geolapor-mula/
```

## Mula pantas

> 🪟 **Windows:** pasang **Git for Windows** dan jadikan **Git Bash** terminal lalai VS Code ([`docs/persediaan.md` §2.4–2.5](./docs/persediaan.md#25-terminal-vs-code-di-windows--git-bash)). Semua arahan bash dalam kursus berfungsi tanpa diubah. Untuk langkah utama, versi **Windows PowerShell** turut disediakan.

```bash
cd projek/api && npm start                   # mock API → http://localhost:3000
cd projek/geolapor-mula && npm install && npm run dev
```

**Windows (PowerShell):**

```powershell
# Terminal 1 — mock API → http://localhost:3000
cd projek/api
npm start
# Terminal 2 (baharu)
cd projek/geolapor-mula
npm install
npm run dev
```

---

*Semua data adalah sintetik untuk latihan — bukan data rasmi PGN/JUPEM.*
