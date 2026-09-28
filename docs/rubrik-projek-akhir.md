# Rubrik Projek Akhir — Demo GeoLapor

[← Indeks docs](./README.md) · [Hari 5](../hari-5/README.md) · [Borang penilaian kendiri](./borang-penilaian-kendiri.md)

> **Bila:** Hari 5, S3 (3.00–4.30 ptg, Jumaat 2 Okt 2026), bahagian demo.
> **Siapa:** peserta berpasangan (atau kumpulan kecil 3 orang). **Setiap ahli mesti bercakap.**
> **Tempoh:** **7 minit** setiap kumpulan (6 minit demo + 1 minit soalan panel), ditambah 1 minit pertukaran.
> **Tujuan:** membuktikan peserta **boleh membina dan menerangkan** aplikasi JavaScript yang menggunakan API dan data geospatial. Ini bukan pertandingan reka bentuk grafik.

---

## 1. Syarat minimum (*gate*) — wajib lulus semua

Kumpulan yang gagal mana-mana *gate* **tidak lulus** walaupun markah ≥ 60, sehingga isu itu dibaiki dan ditunjukkan semula kepada jurulatih (dibenarkan pada hari yang sama, sebelum penutup).

| # | Gate | Cara panel menyemak (≤ 30 saat) |
|---|------|--------------------------------|
| G1 | **Aplikasi berjalan**: mock API (`node server.mjs`) dan GeoLapor (`npm run dev` atau Live Server) dibuka tanpa error merah yang menghalang | Muat semula halaman; Console tiada `Uncaught` semasa aliran utama |
| G2 | **Tiada `innerHTML` dengan data pengguna** (tajuk, catatan, nama fail); data dipapar melalui `textContent` / `createElement` | Panel cipta laporan bertajuk `<img src=x onerror=alert(1)>`. **Tiada `alert`** muncul; teks dipapar seperti biasa |
| G3 | **Susunan `[lng, lat]` betul**: laporan baharu yang diklik di Putrajaya muncul di Putrajaya, dan disimpan sebagai `coordinates: [101.x, 2.x]` | Klik peta → hantar → semak response dalam Network / `GET /api/laporan/:id` |
| G4 | **Data sintetik sahaja**: tiada data PGN/JUPEM sebenar, emel sebenar atau API key sebenar dalam kod; key hanya `latihan-pgn-2026` | Imbas `src/` & `.env*`; emel `@latihan.test` |

---

## 2. Kriteria & pemberat (100 markah)

| # | Kriteria | Pemberat | Cemerlang (100 %) | Baik (75 %) | Memuaskan (50 %) | Perlu dibaiki (≤ 25 %) |
|---|----------|----------|-------------------|-------------|------------------|------------------------|
| K1 | **Fungsi API / CRUD** | **25** | GET senarai (dengan penapis query), GET satu, POST, PATCH status, DELETE semuanya berfungsi melalui `services/api.js`; error 401/404/422/500 dipaparkan kepada pengguna dengan mesej BM yang jelas (422 → error per medan); ada keadaan *loading*; guna `AbortController`/timeout | CRUD lengkap; error 422 & network error dipaparkan; *loading* ada | GET + POST berfungsi; error hanya dalam Console | Hanya GET, atau `fetch` bertaburan dalam fail UI tanpa semakan `res.ok` |
| K2 | **Peta & layer** | **20** | Laporan dipapar sebagai marker berwarna ikut kategori; ≥ 2 layer rujukan (`sempadan-zon`, `sungai`, `kemudahan`) dengan layer control; klik peta → isi lat/lng borang; klik senarai → zum & buka popup; ⭐ clustering / muat ikut `bbox` | Marker + popup + ≥ 1 layer rujukan + klik peta isi koordinat | Marker dipapar; interaksi terhad | Peta tidak dipapar atau marker di lokasi salah |
| K3 | **Format fail geospatial** | **15** | Import ≥ 2 format (cth Shapefile zip EPSG:3375 diunjur semula dengan proj4 + KML/KMZ) dipapar di peta; eksport GeoJSON **dan** ≥ 1 format lain (KML/Shapefile); ⭐ GeoTIFF/LAS: papar metadata (saiz, bbox, bilangan titik) | Import 1 format bukan GeoJSON + eksport GeoJSON | Eksport GeoJSON sahaja | Tiada import/eksport |
| K4 | **Kualiti kod** | **15** | `npm run lint` bersih; Prettier digunakan; nama jelas & konsisten; fungsi kecil; tiada kod mati / `console.log` sisa; ujian `node --test` untuk `utils/geo.js` **lulus** | Lint ≤ 3 amaran; ada ≥ 1 ujian lulus | Kod berfungsi tetapi fungsi panjang, nama tidak konsisten, lint banyak amaran | Kod sukar dibaca; salin-tampal berulang; tiada lint |
| K5 | **State & arkitektur** | **15** | Satu store (`ciptaStore`) sebagai sumber kebenaran tunggal; UI melanggan store; kemas kini immutable; keadaan terbitan (senarai ditapis, statistik) dikira dan tidak disimpan; penapis di-sync ke URL (`URLSearchParams`); layer jelas `ui/ → state/ → services/ → utils/` tanpa import terbalik; ⭐ optimistic update + rollback | Store digunakan untuk laporan & penapis; peta + senarai sentiasa sync; struktur folder ikut corak yang diajar | Store wujud tetapi sebahagian UI masih membaca/mengubah variable global | Tiada store; keadaan bertaburan dalam DOM dan variable global |
| K6 | **Demo & penerangan** | **10** | Aliran demo lancar ikut skrip masa; setiap ahli menerangkan satu bahagian; menjawab soalan "terangkan baris ini" dengan tepat, termasuk *kenapa* | Demo lancar; jawapan betul tetapi ringkas | Demo tersekat tetapi dipulihkan; jawapan separa | Tidak dapat menerangkan kod sendiri |

**Pengiraan:** markah kriteria = pemberat × peratus tahap. Contoh: K1 tahap *Baik* = 25 × 75 % = **18.75**. Panel boleh memberi nilai di antara tahap (cth 20/25) dengan justifikasi ringkas.

---

## 3. Kriteria lulus

| Keputusan | Syarat |
|-----------|--------|
| ✅ **Lulus** | Semua gate G1–G4 lulus **dan** jumlah ≥ **60 / 100** |
| 🌟 **Lulus dengan cemerlang** | Lulus **dan** jumlah ≥ **85 / 100** **dan** sekurang-kurangnya satu ⭐ (clustering, bbox loading, optimistic update, GeoTIFF/LAS) |
| 🔁 **Belum lulus** | Mana-mana gate gagal, atau jumlah < 60. Pelan susulan: baiki item yang gagal dan hantar rakaman skrin / repo kepada jurulatih dalam **2 minggu** |

> Status lulus projek akhir ialah **salah satu** input kepada sijil. Kehadiran dan syarat lain ditentukan oleh penganjur.

---

## 4. Skrip masa demo (7 minit)

| Minit | Segmen | Apa yang ditunjukkan | Kriteria |
|-------|--------|----------------------|----------|
| 0:00–0:30 | Pengenalan | Nama ahli; satu ayat: "GeoLapor kami boleh…" | K6 |
| 0:30–2:30 | **Aliran API** | Muat senarai → tapis ikut kategori/status/carian → cipta laporan baharu (klik peta isi koordinat) → tunjuk **error 422** (hantar borang kosong) → PATCH status ke `dalam-tindakan` → DELETE. Buka tab **Network** sekurang-kurangnya sekali. | K1, K2, G3 |
| 2:30–3:30 | **Peta & layer** | Togol layer rujukan; klik senarai → zum; ⭐ clustering / muat ikut bbox | K2 |
| 3:30–4:30 | **Format fail** | Import Shapefile/KML sampel dari `projek/data/`; eksport GeoJSON/KML dan buka fail hasil | K3 |
| 4:30–6:00 | **Bawah tudung** | Tunjuk struktur `src/`, `state/store.js`, satu pelanggan (`langgan`), `npm run lint`, `node --test` | K4, K5 |
| 6:00–7:00 | **Soalan panel** | 1–2 soalan dari [§6](#6-bank-soalan-terangkan-satu-baris-kod) kepada ahli yang **dipilih panel** | K6 |

**Logistik:** jika > 6 kumpulan, jalankan **2 panel selari** (jurulatih + pembantu jurulatih), supaya demo muat dalam ±45 minit. Kumpulan seterusnya bersedia (mock API hidup, `npm run reset-data` sudah dijalankan) semasa kumpulan sebelumnya sedang demo.

> 💡 **Pelan B:** jika laptop gagal semasa demo, kumpulan boleh demo dari laptop jurulatih menggunakan repo mereka (zip / USB). Sebab itu repo perlu disimpan di luar `node_modules`, dan sandaran perlu disediakan sebelum rehat tengah hari.

---

## 5. Helaian markah (satu per kumpulan)

```text
Kumpulan: ________________   Ahli: ____________________________________
Panel: ___________________   Masa mula: ______   Masa tamat: ______

GATE                                           Lulus  Gagal   Catatan
G1 Aplikasi berjalan                            [ ]    [ ]    ______________
G2 Tiada innerHTML + data pengguna (ujian XSS)  [ ]    [ ]    ______________
G3 [lng, lat] betul (Putrajaya)                 [ ]    [ ]    ______________
G4 Data sintetik / tiada key sebenar            [ ]    [ ]    ______________

KRITERIA                        Pemberat   C(100%) B(75%) M(50%) P(≤25%)  Markah
K1 Fungsi API / CRUD               25        [ ]     [ ]    [ ]    [ ]     _____
K2 Peta & layer                    20        [ ]     [ ]    [ ]    [ ]     _____
K3 Format fail geospatial          15        [ ]     [ ]    [ ]    [ ]     _____
K4 Kualiti kod                     15        [ ]     [ ]    [ ]    [ ]     _____
K5 State & arkitektur              15        [ ]     [ ]    [ ]    [ ]     _____
K6 Demo & penerangan               10        [ ]     [ ]    [ ]    [ ]     _____
                                                               JUMLAH    _____ / 100
⭐ Cabaran dicapai: [ ] clustering  [ ] bbox loading  [ ] optimistic update  [ ] GeoTIFF/LAS  [ ] lain: ____

Keputusan:  [ ] Lulus   [ ] Lulus cemerlang   [ ] Belum lulus
Satu kekuatan: ______________________________________________
Satu cadangan penambahbaikan: _______________________________
Tandatangan panel: ____________________
```

---

## 6. Bank soalan "terangkan satu baris kod"

Panel memilih **baris dalam kod kumpulan itu sendiri** dan bertanya kepada ahli yang **tidak** sedang memegang tetikus. Jawapan yang baik menerangkan **apa** dan **kenapa**.

| # | Tunjuk baris / tanya | Jawapan yang dicari |
|---|----------------------|---------------------|
| 1 | `if (!res.ok) throw new ApiError(...)` | `fetch` hanya reject untuk network error; 4xx/5xx tetap *resolve*, jadi kita semak `res.ok` sendiri |
| 2 | `if (res.status === 204) return null;` | DELETE berjaya tanpa badan; `res.json()` akan gagal jika dipanggil |
| 3 | `headers: { 'X-API-Key': … }` | Mock API perlukan API key untuk POST/PATCH/DELETE (401 jika tiada). Key dalam frontend **bukan rahsia**; sistem sebenar guna log masuk/token dari server |
| 4 | `L.marker([lat, lng])` selepas `const [lng, lat] = f.geometry.coordinates` | GeoJSON `[lng, lat]`, Leaflet `[lat, lng]`; destructuring bernama mengelak tersilap |
| 5 | `li.textContent = f.properties.tajuk` | Elak XSS; `innerHTML` akan melaksanakan HTML/skrip dalam tajuk |
| 6 | `store.set((s) => ({ penapis: { ...s.penapis, kategori } }))` | Kemas kini immutable: objek baharu membolehkan pelanggan mengesan perubahan; `...s.penapis` mengekalkan medan lain |
| 7 | `const nyahlanggan = store.langgan(render)` | Daftar listener; fungsi pulangan membuang listener (elak kebocoran memori / render berganda) |
| 8 | `const ditapis = tapisLaporan(laporan, penapis)` (dalam render, bukan disimpan) | Keadaan terbitan: dikira daripada sumber supaya tidak pernah out of sync |
| 9 | `new URLSearchParams(location.search)` | Simpan penapis dalam URL: boleh dikongsi, dan butang *back* berfungsi |
| 10 | `await Promise.all([...])` | Muat beberapa layer serentak; gagal jika satu gagal (bandingkan `allSettled`) |
| 11 | `AbortSignal.timeout(8000)` / `controller.abort()` | Batalkan request lambat atau request lama apabila pengguna menaip carian baharu |
| 12 | `proj4('EPSG:3375', 'EPSG:4326', [x, y])` | Shapefile dalam meter Peninsula RSO; Leaflet/GeoJSON perlukan darjah WGS 84 |
| 13 | `await shp(arrayBuffer)` | shpjs membaca zip (.shp/.dbf/.prj) → GeoJSON; `.prj` menentukan CRS |
| 14 | `L.geoJSON(fc).addTo(peta)` vs `lapisan.clearLayers(); lapisan.addData(fc)` | Guna semula layer, bukan cipta layer baharu setiap render |
| 15 | `markerClusterGroup()` / `turf.simplify(...)` | Prestasi: kurangkan bilangan DOM marker / bilangan bucu |
| 16 | `import { … } from '../services/api.js'` dalam `ui/…` | Arah dependency: UI → state → service → util, tidak pernah sebaliknya |
| 17 | `import.meta.env.VITE_API_URL` | Konfigurasi ikut persekitaran (Vite); nilai `VITE_*` **didedahkan** kepada browser |
| 18 | `localStorage.setItem('draf', JSON.stringify(data))` | Simpan draf borang luar talian; hanya string; jangan simpan rahsia |
| 19 | `catch (err) { … } finally { butang.disabled = false; }` | `finally` sentiasa dijalankan, jadi butang dipulihkan walaupun berlaku error |
| 20 | Satu ujian dalam `geo.test.js` | Apa yang diuji, kenapa kes itu penting (cth koordinat terbalik ditolak oleh `dalamMalaysia`) |

---

## 7. Maklum balas kepada kumpulan

Selepas semua demo, jurulatih memberi **satu kekuatan dan satu cadangan** kepada setiap kumpulan (bertulis pada helaian markah), serta **3 corak umum** yang dilihat merentas kumpulan untuk seluruh kelas. Peserta kemudian mengisi lajur **Selepas** dalam [`borang-penilaian-kendiri.md`](./borang-penilaian-kendiri.md) dan borang penilaian rasmi penganjur.
