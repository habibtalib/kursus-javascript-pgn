# Lab Hari 1 — Modern JavaScript (ES6+) Core Syntax

[⬅️ README Hari 1](./README.md) · [🗂️ Fail latihan](../projek/latihan/hari-1/)

> **Peraturan lab:** Setiap latihan ada baris `// ⇒ RAMAL: ______`. **Tulis ramalan anda dahulu**, kemudian jalankan. Ramalan yang salah bukan kegagalan — ia tepat di mana pembelajaran berlaku. Bandingkan dengan jurulatih atau pasangan anda hanya selepas checkpoint atau jika tersekat > 10 minit.

| Lab | Sesi | Fail | Hasil |
|-----|------|------|-------|
| 1.0 | S1 (15 min pertama) | — | Node, editor & server tempatan sedia |
| 1.1 | S1 9.00–11.00 | `latihan-01.js`, `latihan-02.js` | Asas: variable, jenis, kawalan aliran, loop; laporan GeoJSON pertama |
| 1.2 | S2 11.00–1.00 | `latihan-03.js` | `formatKoordinat()`, `jarakKm()`, closure `buatPenjanaId()` |
| 1.3 | S3 2.30–3.30 | `latihan-04.js` | Destructuring & operator moden atas `laporanContoh` |
| 1.4 | S4 3.30–5.00 | `latihan-05.js`, `utils/geo.js`, `latihan-06.js` | **`utils/geo.js`** — `node semak.js` 6/6 ✅ |

---

## Lab 1.0 — Persediaan (S1, 15 minit pertama)

### 🎯 Objektif
Menyediakan persekitaran untuk menjalankan fail latihan melalui Node **dan** browser.

### Prasyarat
- Komputer makmal dengan VS Code, Chrome/Edge, Node.js 22+
- Salinan repo kursus (folder `kursus-javascript-pgn-5-hari`)

### Langkah

1. Buka terminal (VS Code: `` Ctrl+` ``) dan semak versi:

   ```bash
   node --version    # v22.x atau lebih tinggi
   npm --version
   ```

2. Masuk ke folder latihan dan jalankan latihan 01 untuk membuktikan Node berfungsi (TODO belum diisi lagi — itu tidak mengapa untuk langkah ini):

   ```bash
   cd projek/latihan/hari-1
   node latihan-01.js
   ```

3. Hidangkan folder yang sama untuk browser (pilih **satu**):

   - VS Code: pasang sambungan **Live Server** → klik kanan `index.html` → *Open with Live Server*
   - Terminal kedua: `npx serve . -l 5500`

4. Buka `http://localhost:5500/?latihan=01` dan tekan `F12` → tab **Console**.

### ✅ Checkpoint
- Terminal mencetak baris `A1 …` tanpa ralat (nilai tepat belum penting di sini — TODO diisi dalam Lab 1.1).
- Halaman browser memaparkan output yang sama dalam kotak `<pre>` **dan** dalam Console.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `SyntaxError: Cannot use import statement outside a module` | Menjalankan Node dari folder lain (tiada `package.json` `"type": "module"`) | `cd projek/latihan/hari-1` dahulu |
| Halaman kosong, Console: *blocked by CORS policy* / *Failed to load module script* | Dibuka melalui `file://` | Guna Live Server / `npx serve` |
| `npx serve` bertanya "Ok to proceed?" | Kali pertama memuat turun pakej | Taip `y`. Tiada internet? Guna Live Server |
| Port 5500 sibuk | Live Server sudah berjalan | Guna tab yang sudah dibuka, atau `-l 5501` |

### ⭐ Cabaran
Dalam Console browser, taip `document.title = 'Saya di Hari 1'` dan perhatikan tab. Anda baru mengubah DOM — topik Hari 3.

---

## Lab 1.1 — Asas → Moden: Variable, Jenis, Kawalan Aliran & GeoJSON Pertama (S1)

### 🎯 Objektif
- Memilih `const`/`let` dengan betul dan meramal `typeof` (O1)
- Menulis `if…else`, `switch` dan empat jenis loop (O2)
- Membina laporan sebagai GeoJSON Feature & FeatureCollection; meramal kelakuan scope & hoisting (O3)

### Prasyarat
- Lab 1.0 selesai
- README §1.1–1.10 telah diterangkan

### Langkah — `latihan-01.js`

1. Buka `latihan-01.js`. **Bahagian A** — isi `KATEGORI_SAH` dan naikkan pembilang:

   ```js
   const KATEGORI_SAH = ['infrastruktur', 'alam-sekitar', 'tanah', 'utiliti', 'lain-lain'];
   let bilanganDiproses = 0;
   bilanganDiproses = bilanganDiproses + 1;
   ```

   Kemudian untuk A2 tambah `laporan.status = 'dalam-tindakan';` **selepas** pengisytiharan `const laporan`. Jalankan `node latihan-01.js`. Tiada error — kenapa? (README §1.4)

2. **Bahagian B** — isi loop `typeof`:

   ```js
   for (const nilai of contohNilai) {
     jenis.push(typeof nilai);
   }
   ```

   Sebelum menjalankan, tulis ramalan 8 jenis pada kertas. Kemudian lengkapkan B2 dan B3:

   ```js
   console.log('B2', Array.isArray([101.6958, 2.9264]), contohNilai[3] === null);
   console.log('B3', typeof NaN, Number.isNaN(Number('abc')));
   ```

3. **Bahagian C** — **jangan ubah kod**. Tulis ramalan untuk C1–C4 dalam komen, jalankan, dan bulatkan yang salah. Bincang dengan rakan sebelah: kenapa `'5' + 3` dan `'5' - 3` berbeza?

4. **Bahagian D** — tulis `if…else if…else`:

   ```js
   if (lat < 0.8 || lat > 7.5) {
     zon = 'Di luar julat latitud Malaysia';
   } else if (lat < 3.0) {
     zon = 'Selatan Lembah Klang';
   } else {
     zon = 'Utara Lembah Klang';
   }
   ```

5. **Bahagian E** — di dalam loop `for…of`, tulis `switch`:

   ```js
   switch (status) {
     case 'baharu':
       label = 'Baharu';
       break;
     case 'dalam-tindakan':
       label = 'Dalam Tindakan';
       break;
     case 'selesai':
     case 'ditolak':
       label = 'Ditutup';
       break;
     default:
       label = 'Status tidak sah';
   }
   ```

   Eksperimen: buang `break` selepas `'Baharu'` dan jalankan semula. Apa label untuk `baharu`? Pulihkan `break`.

6. **Bahagian F1** — loop `for` dengan `continue`:

   ```js
   for (let i = 0; i < senaraiKoordinat.length; i++) {
     const lng = senaraiKoordinat[i][0];
     const latTitik = senaraiKoordinat[i][1];
     if (lng < 99.5 || lng > 119.5 || latTitik < 0.8 || latTitik > 7.5) {
       console.log('F1', i, 'LUAR kotak Malaysia');
       continue;
     }
     bilanganSah++;
   }
   ```

7. **F2** (`while`), **F3** (`do…while`), **F4** (`break`):

   ```js
   // F2
   let nombor = 1;
   idBaharu = 'LPR-' + String(nombor).padStart(4, '0');
   while (idDigunakan.includes(idBaharu)) {
     nombor++;
     idBaharu = 'LPR-' + String(nombor).padStart(4, '0');
   }

   // F3
   do {
     cubaan++;
     berjaya = cubaan >= 3;
   } while (!berjaya && cubaan < 5);

   // F4
   for (const pasangan of statusIkutId) {
     if (pasangan[1] === 'selesai') {
       pertamaSelesai = pasangan[0];
       break;
     }
   }
   ```

### Langkah — `latihan-02.js`

8. **Bahagian A** — lengkapkan objek `laporan` mengikut struktur laporan GeoLapor (lihat `data/laporan-contoh.js` untuk contoh). Perhatikan `coordinates: [101.6958, 2.9264]` — **lng dahulu**. Kemudian:

   ```js
   console.log('A2', laporan.geometry.coordinates[0]);
   console.log('A3', laporan.geometry.coordinates[1]);
   console.log('A4', laporan.properties[medan]);
   laporan.properties.keutamaan = 'tinggi';
   delete laporan.properties.keutamaan;
   console.log('A5', Object.keys(laporan.properties).length);
   ```

9. **Bahagian B** — bina koleksi dan tambah 2 feature:

   ```js
   const koleksi = { type: 'FeatureCollection', features: [laporan] };
   koleksi.features.push({
     type: 'Feature',
     id: 'LPR-0002',
     geometry: { type: 'Point', coordinates: [101.688, 2.9395] },
     properties: { id: 'LPR-0002', tajuk: 'Longgokan sisa binaan', kategori: 'alam-sekitar', status: 'dalam-tindakan' },
   });
   // … push LPR-0003 dengan cara sama

   for (const f of koleksi.features) {
     if (f.properties.status === 'baharu') bilanganBaharu++;
   }
   for (const k in laporan.geometry) {
     kunci.push(k);
   }
   ```

10. **Bahagian C, D, E** — **ramal dahulu** output setiap baris (tulis dalam komen), kemudian jalankan `node latihan-02.js`. Untuk E, ramal juga **susunan** baris E0, E1, E2.

### ✅ Checkpoint

```bash
node latihan-01.js
```
Output mesti mengandungi (tepat):
```text
A1 5 1
B1 string | number | boolean | object | undefined | object | object | function
D1 Selatan Lembah Klang
E baharu → Baharu
E ditolak → Ditutup
F1 sah = 2
F2 LPR-0004
F3 cubaan = 3 berjaya = true
F4 LPR-0004
```

```bash
node latihan-02.js
```
```text
A5 8
B1 3
B2 baharu = 2
B3 type,coordinates
C2 var bocor keluar dari blok
C3 undefined
D1 undefined
D2 ReferenceError
E0 baris ini keluar bila?
E1 var 3        ← tiga kali
E2 let 0 / 1 / 2
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `TypeError: Assignment to constant variable` | Menetapkan semula `const` (cth `bilanganDiproses = …` pada `const`) | Tukar kepada `let` — hanya bila memang perlu |
| `E baharu → Dalam Tindakan` | `break` tertinggal | Tambah `break` di hujung setiap `case` |
| Loop `while` tidak berhenti (terminal tergantung) | Lupa `nombor++` dalam badan | `Ctrl+C`, tambah kenaikan |
| `SyntaxError: Identifier 'x' has already been declared` | `let`/`const` diisytihar dua kali dalam scope sama | Buang salah satu, atau tukar nama |
| `A2 undefined` | `coordinates` masih `[]` | Isi `[101.6958, 2.9264]` |

### ⭐ Cabaran
1. Tulis loop yang mencetak jadual darab 1–5 menggunakan **dua** loop `for` bersarang dan template literal (preview S2).
2. Tambah feature LPR-0004 dengan koordinat **sengaja terbalik**. Tulis loop yang mengesan dan mencetak ID-nya menggunakan syarat bahagian F1.
3. Tukar `switch` dalam bahagian E kepada **objek carian**: `const LABEL = { baharu: 'Baharu', … }; label = LABEL[status] ?? 'Status tidak sah';`. Mana lebih mudah diselenggara?

---

## Lab 1.2 — Modern Strings & Functions (S2)

### 🎯 Objektif
- Membina teks dengan template literal & string method
- Menulis fungsi dalam tiga bentuk dengan default parameter & rest
- Menulis closure `buatPenjanaId()` dan fungsi GeoLapor `formatKoordinat()` & `jarakKm()` (O4)

### Prasyarat
- Lab 1.1 checkpoint lulus
- README §2.1–2.7

### Langkah — `latihan-03.js`

1. **A1** — template literal berbilang baris:

   ```js
   const tajuk = f.properties.tajuk.trim();
   const ringkasan = `[${f.id}] ${tajuk}
     Kategori : ${f.properties.kategori.toUpperCase()}
     Status   : ${f.properties.status === 'baharu' ? '🆕 Baharu' : f.properties.status}`;
   ```

2. **B1–B4** — lengkapkan setiap `console.log`:

   ```js
   console.log('B1', 'LPR-0007'.split('-'));
   console.log('B2', 'LPR-0007'.startsWith('LPR-'), tajuk.includes('sempadan'));
   console.log('B3', String(42).padStart(4, '0'), `LPR-${String(42).padStart(4, '0')}`);
   console.log('B4', 'alam-sekitar'.replaceAll('-', ' '));
   ```
   B5 — **ramal** dahulu.

3. **C** — tiga bentuk fungsi:

   ```js
   function formatKoordinat([lng, lat], dp = 5) {
     return `${lat.toFixed(dp)}, ${lng.toFixed(dp)}`;
   }
   const keRadian = function (darjah) {
     return (darjah * Math.PI) / 180;
   };
   const labelKategori = (kod) => kod.replaceAll('-', ' ').toUpperCase();
   ```

   Perhatikan tandatangan `formatKoordinat([lng, lat], dp = 5)` — destructuring dalam parameter (akan diterangkan penuh dalam S3). Input `[lng, lat]`, output **`"lat, lng"`**.

4. **D** — `jarakKm()` (haversine). Salin formula dari README §2.7 **menaip sendiri** (jangan tampal) supaya anda membaca setiap baris:

   ```js
   const JEJARI_BUMI_KM = 6371;
   function jarakKm([lng1, lat1], [lng2, lat2]) {
     const dLat = keRadian(lat2 - lat1);
     const dLng = keRadian(lng2 - lng1);
     const a = Math.sin(dLat / 2) ** 2 + Math.cos(keRadian(lat1)) * Math.cos(keRadian(lat2)) * Math.sin(dLng / 2) ** 2;
     return 2 * JEJARI_BUMI_KM * Math.asin(Math.sqrt(a));
   }
   ```

5. **E** — parameter rest & default:

   ```js
   function purata(...nombor) {
     if (nombor.length === 0) return 0;
     let jumlah = 0;
     for (const n of nombor) jumlah += n;
     return jumlah / nombor.length;
   }
   const sapa = (nama = 'Pegawai', jabatan = 'PGN') => `Salam ${nama} (${jabatan})`;
   ```

6. **F** — closure:

   ```js
   function buatPenjanaId(awalan = 'LPR', mula = 1) {
     let seterusnya = mula;
     return () => `${awalan}-${String(seterusnya++).padStart(4, '0')}`;
   }
   ```

   Soalan: bolehkah kod di luar fungsi mengubah `seterusnya` secara terus? Cuba `console.log(seterusnya)` di luar — apa berlaku?

7. **G** — fungsi tertib tinggi:

   ```js
   function prosesSemua(senarai, fn) {
     const hasil = [];
     for (const item of senarai) hasil.push(fn(item));
     return hasil;
   }
   ```

### ✅ Checkpoint

```bash
node latihan-03.js
```
```text
A1 [LPR-0001] Papan tanda sempadan rosak
  Kategori : INFRASTRUKTUR
  Status   : 🆕 Baharu
B3 0042 LPR-0042
C1 2.92640, 101.69580
C2 2.93, 101.70
C3 3.1416 ALAM SEKITAR
D1 5.05 km
D2 0
E1 2.9294 0
E2 Salam Pegawai (PGN) | Salam Aina (PGN) | Salam Pegawai (JUPEM)
F1 LPR-0011 LPR-0012 UJI-0001 LPR-0013
G1 [ '2.926, 101.696', '2.922, 101.650' ]
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `C1 101.69580, 2.92640` | lat/lng tertukar dalam template | Output teks: `${lat…}, ${lng…}` |
| `D1 NaN km` | `keRadian` masih memulangkan `0`/tiada `return`, atau salah tulis `Math.asin` | Semak setiap fungsi memulangkan nilai |
| `D1 562.xx km` | Terlupa tukar darjah → radian | Bungkus beza & `cos` dengan `keRadian()` |
| `F1 LPR-0011 LPR-0011 …` | `seterusnya` diisytihar **di dalam** fungsi yang dipulangkan | Isytihar dalam `buatPenjanaId`, di luar arrow |
| `TypeError: lat.toFixed is not a function` | Koordinat string (`'2.93'`) | `Number(x)` sebelum format |
| Arrow memulangkan `undefined` | Guna `{ }` tanpa `return` | Tambah `return`, atau buang `{ }` |

### ⭐ Cabaran
1. Tulis `formatDMS(darjahPerpuluhan)` → `"2° 55' 35.0\""` (darjah, minit, saat). Petua: `Math.trunc`, `% 1 * 60`.
2. Kira jarak **Putrajaya → Kota Kinabalu** `[116.0735, 5.9804]`. Adakah jawapan anda ~1,600 km?
3. Tulis `buatPembilang()` yang memulangkan **objek** `{ tambah(), kurang(), nilai() }` berkongsi satu variable peribadi.

---

## Lab 1.3 — Destructuring & Operators (S3)

### 🎯 Objektif
Mengekstrak dan mengemas kini data laporan dengan destructuring, spread/rest, `?.`, `??` dan `===` — tanpa mengubah data asal (O5).

### Prasyarat
- Lab 1.2 checkpoint lulus
- README §3.1–3.7

### Langkah — `latihan-04.js`

1. **Baris import & TODO 0** — gantikan tiga baris pertama dengan destructuring array:

   ```js
   const [pertama, , ketiga] = laporanContoh.features;
   ```

2. **A1–A2** — padam lima baris `const … = undefined` dan gantikan dengan **satu** pernyataan:

   ```js
   const {
     id,
     properties: { tajuk, status },
     geometry: {
       coordinates: [lng, lat],
     },
   } = pertama;
   ```

3. **A4** — namakan semula & nilai default (padam dua baris `undefined`):

   ```js
   const { kategori: kat, keutamaan = 'biasa' } = pertama.properties;
   ```

4. **A5–A6** — **ramal**, jalankan, terangkan kenapa A5 bukan `'Tiada catatan'`.

5. **B1–B3**:

   ```js
   const ringkas = ({ id, properties: { status } }) => `${id}:${status}`;
   const keLeaflet = ([lng, lat]) => [lat, lng];
   [a, b] = [b, a];   // letak selepas `let b = …`
   ```

6. **C1–C3** — spread:

   ```js
   const dikemas = {
     ...pertama,
     properties: { ...pertama.properties, status: 'selesai', dikemaskini: '2026-09-10T10:00:00+08:00' },
   };
   console.log('C2', Math.max(...semuaLat), Math.min(...semuaLat));
   const gabung = [...laporanContoh.features.slice(0, 2), ...laporanContoh.features.slice(8)];
   ```

   **C4–C5** — ramal dahulu. Kemudian eksperimen: tambah `cetek.properties.status = 'ROSAK';` dan cetak `pertama.properties.status`. Buang baris itu selepas melihat kesannya.

7. **D1** — rest untuk membuang medan peribadi:

   ```js
   const { id: _id, pelapor, ...awam } = pertama.properties;
   ```

8. **E1–E3** — optional chaining:

   ```js
   console.log('E1', pertama.properties.lampiran?.[0]?.url);
   console.log('E2', pertama.properties.lampiran?.[0]?.url ?? 'tiada lampiran');
   console.log('E3', respons?.features?.length ?? 0);
   ```

9. **F3** — logical assignment:

   ```js
   opsyen.had ??= 20;
   opsyen.mula ||= 0;
   ```

10. **G2**: `const lencana = pertama.properties.status === 'baharu' ? '🆕' : '✔️';`

### ✅ Checkpoint

```bash
node latihan-04.js
```
```text
A1 LPR-0001 Papan tanda sempadan rosak baharu
A2 101.6958 2.9264
A4 infrastruktur biasa
A5 null
A6 Tiada catatan
B1 LPR-0001:baharu LPR-0006:dalam-tindakan
B2 [ 2.9264, 101.6958 ]
B3 101.701 2.935
C1 baharu → selesai
C4 true
C5 false baharu
D1 tajuk,kategori,status,catatan,dicipta,dikemaskini
E2 tiada lampiran
E3 0
F1 50 0
F3 { had: 20, mula: 0 }
G1 true false true false true
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `SyntaxError: Identifier 'id' has already been declared` | Baris `const id = undefined` belum dipadam | Padam baris placeholder sebelum destructuring |
| `C1 selesai → selesai` | `dikemas = pertama` (rujukan sama) atau spread cetek sahaja | Spread **dua aras**: `{ ...pertama, properties: { ...pertama.properties, … } }` |
| `TypeError: Cannot read properties of undefined (reading '0')` | `lampiran[0]` tanpa `?.` | `lampiran?.[0]` — perhatikan `?.` sebelum `[` |
| `B3 2.935 101.701` | Swap diletak sebelum `let a/b` | Letak `[a, b] = [b, a];` selepas pengisytiharan |
| `SyntaxError` pada baris `[a, b] = [b, a]` | Baris sebelumnya tiada `;` dan bermula dengan `[` | Tambah `;` di hujung baris sebelumnya |

### ⭐ Cabaran
1. Tulis `kemasStatus(feature, statusBaharu)` yang memulangkan feature baharu dengan `status` dan `dikemaskini: new Date().toISOString()` — tanpa mengubah input. Buktikan dengan `===`.
2. Tulis `betulkanTerbalik(feature)` yang memulangkan salinan dengan koordinat ditukar **hanya jika** `[lng, lat]` jatuh di luar kotak tetapi `[lat, lng]` jatuh di dalam.
3. Ramal: `const { a = 1 } = { a: null }; const { b = 1 } = { b: undefined }; console.log(a, b);`

---

## Lab 1.4 — Modern Array Methods, JSON & ES Modules → `utils/geo.js` (S4)

### 🎯 Objektif
Memproses `laporanContoh` dengan array method & JSON, kemudian membina dan menguji modul **`utils/geo.js`** mengikut API dikunci (O6).

### Prasyarat
- Lab 1.3 checkpoint lulus
- README §4.1–4.5

### Langkah — `latihan-05.js` (35 minit)

1. **A1–A2**:

   ```js
   tindanan.push('LPR-0003');
   const dikeluarkan = tindanan.pop();
   features.forEach((f) => {
     if (f.properties.kategori === 'utiliti') n++;
   });
   ```
   (Tukar `const dikeluarkan = undefined` kepada baris di atas.)

2. **B–D**:

   ```js
   const senaraiId = features.map((f) => f.id);
   const baharu = features.filter((f) => f.properties.status === 'baharu');
   console.log('D1', features.find((f) => f.id === 'LPR-0007')?.properties.tajuk);
   console.log('D2', features.find((f) => f.id === 'LPR-9999'));
   console.log('D3', features.findIndex((f) => f.id === 'LPR-0004'));

   const dalamKotak = ([lng, lat]) => lng >= 99.5 && lng <= 119.5 && lat >= 0.8 && lat <= 7.5;
   console.log('D4', features.some((f) => f.properties.status === 'ditolak'));
   console.log('D5', features.every((f) => dalamKotak(f.geometry.coordinates)));
   const rosak = features.filter((f) => !dalamKotak(f.geometry.coordinates)).map((f) => f.id);
   ```

3. **E1** — `reduce`:

   ```js
   const ikutKategori = features.reduce((acc, f) => {
     const k = f.properties.kategori;
     acc[k] = (acc[k] ?? 0) + 1;
     return acc;
   }, {});
   ```

4. **F1** — `toSorted` (tidak mengubah asal):

   ```js
   const terkini = features.toSorted((a, b) => b.properties.dicipta.localeCompare(a.properties.dicipta));
   ```

5. **G1** — chaining:

   ```js
   const ringkasan = features
     .filter((f) => dalamKotak(f.geometry.coordinates))
     .filter((f) => f.properties.status !== 'selesai' && f.properties.status !== 'ditolak')
     .map(({ id, properties: { tajuk } }) => `${id} ${tajuk}`)
     .slice(0, 3);
   ```

6. **H1–H5** — JSON:

   ```js
   const teks = JSON.stringify(laporanContoh);
   const semula = JSON.parse(teks);
   console.log('H3', JSON.stringify({ id: 'LPR-0001', lokasi: [101.6958, 2.9264] }, null, 2));
   try {
     JSON.parse("{'id': 'LPR-0001'}");
   } catch (ralat) {
     console.log('H5', ralat.name);
   }
   ```

### Langkah — `utils/geo.js` (40 minit)

7. Buka `utils/geo.js`. Jalankan penyemak **sebelum** menulis apa-apa:

   ```bash
   node semak.js
   ```
   Anda akan melihat `0/6 lulus`. Matlamat: **6/6**. Kerja satu fungsi pada satu masa, jalankan `node semak.js` selepas setiap fungsi.

8. **TODO 1 `formatKoordinat`** dan **TODO 2 `jarakKm`** — pindahkan kod anda dari Latihan 03 (C1 & D). Pastikan `jarakKm` menggunakan destructuring parameter `([lng1, lat1], [lng2, lat2])` dan `JEJARI_BUMI_KM`.

9. **TODO 3 `tapisLaporan`**:

   ```js
   export function tapisLaporan(features, { kategori, status, q } = {}) {
     const carian = q?.trim().toLowerCase();
     return features.filter(({ properties: p }) => {
       if (kategori && p.kategori !== kategori) return false;
       if (status && p.status !== status) return false;
       if (carian && !p.tajuk.toLowerCase().includes(carian)) return false;
       return true;
     });
   }
   ```

   Soalan: kenapa `kategori: ''` diabaikan secara automatik? (Petua: truthy/falsy, README §1.5.)

10. **TODO 4 `kiraIkut`** — sama seperti E1 di atas, tetapi medan ialah parameter:

    ```js
    export function kiraIkut(features, medan) {
      return features.reduce((kiraan, f) => {
        const nilai = f.properties?.[medan] ?? '(tiada)';
        kiraan[nilai] = (kiraan[nilai] ?? 0) + 1;
        return kiraan;
      }, {});
    }
    ```

11. **TODO 6 `dalamMalaysia`** (buat sebelum 5 — lebih mudah):

    ```js
    export function dalamMalaysia([lng, lat]) {
      const { minLng, maxLng, minLat, maxLat } = KOTAK_MALAYSIA;
      return lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat;
    }
    ```

12. **TODO 5 `bboxDari`** — versi asas (Point sahaja) dahulu:

    ```js
    export function bboxDari(features) {
      if (features.length === 0) return null;
      const lngs = features.map((f) => f.geometry.coordinates[0]);
      const lats = features.map((f) => f.geometry.coordinates[1]);
      return [Math.min(...lngs), Math.min(...lats), Math.max(...lngs), Math.max(...lats)];
    }
    ```

    Jalankan `node semak.js`. Ujian LineString akan gagal — itulah ⭐ langkah 13.

13. ⭐ **Sokong semua jenis geometri** — gantikan dengan versi rekursif dari README §4.5 (`semuaKoordinat` + `flatMap`). Jalankan `node semak.js` → **6/6**.

### Langkah — `latihan-06.js` (10 minit)

14. Lengkapkan TODO 3 dan TODO 4:

    ```js
    const sah = features.filter((f) => dalamMalaysia(f.geometry.coordinates));
    const rosak = features.filter((f) => !dalamMalaysia(f.geometry.coordinates));

    const terdekat = sah
      .map((f) => ({ id: f.id, km: jarakKm(PEJABAT, f.geometry.coordinates) }))
      .toSorted((a, b) => a.km - b.km)
      .slice(0, 3)
      .map(({ id, km }) => `${id} (${km.toFixed(2)} km)`);
    ```

15. Buka dalam browser: `http://localhost:5500/?latihan=06`. Dalam DevTools → tab **Network**, muat semula dan perhatikan **tiga** fail `.js` dimuatkan (latihan-06, geo, laporan-contoh) — setiap `import` ialah satu HTTP request.

### ✅ Checkpoint

```bash
node semak.js
```
```text
✅ formatKoordinat
✅ jarakKm
✅ tapisLaporan
✅ kiraIkut
✅ bboxDari
✅ dalamMalaysia

6/6 lulus (./utils/geo.js)
```

```bash
node latihan-06.js
```
```text
1 sah=9 rosak=LPR-0010
2 2.92640, 101.69580
3 [ 'LPR-0001 (0.28 km)', 'LPR-0002 (1.65 km)', 'LPR-0003 (2.23 km)' ]
4a 4
4b [ 'LPR-0003' ]
4c [ 'LPR-0001', 'LPR-0003' ]
4d 9
5 { baharu: 4, 'dalam-tindakan': 2, selesai: 2, ditolak: 1 }
6a [ 101.644, 2.9012, 101.722, 2.9555 ]
6b [ 2.935, 2.9012, 101.722, 101.701 ]
6c null
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `SyntaxError: The requested module './utils/geo.js' does not provide an export named 'jarakKm'` | Terlupa `export`, atau salah eja nama | `export function jarakKm…` — nama **tepat** ikut fail rangka |
| `Cannot find module …/utils/geo` | Tiada sambungan `.js` dalam `import` | `'./utils/geo.js'` |
| `tapisLaporan` → `dapat 9 · jangka 4` | Fungsi masih memulangkan `features` asal | Guna `filter` dan `return false` untuk yang ditolak |
| `q tidak peka huruf besar/kecil` gagal | Lupa `toLowerCase()` pada **kedua-dua** belah | `p.tajuk.toLowerCase().includes(carian)` |
| `kiraIkut` → `{ undefined: 9 }` | Guna `f.properties.medan` (medan literal bernama "medan") | `f.properties[medan]` — kurungan untuk nama dinamik |
| `bboxDari([])` → `[Infinity, Infinity, -Infinity, -Infinity]` | Tiada semakan array kosong | `if (titik.length === 0) return null;` |
| `[ 1, 10, 9 ]` semasa isih jarak | `sort()` tanpa pembanding | `.toSorted((a, b) => a.km - b.km)` |

### ⭐ Cabaran
1. Tambah fungsi `export function titikTengah(features)` yang memulangkan purata `[lng, lat]` semua Point. Tulis ujian anda sendiri dalam `semak.js` (salin corak objek `ujian`).
2. Tulis `kumpulIkut(features, medan)` yang memulangkan `{ nilai: [feature, …] }` (bukan bilangan) menggunakan `reduce` — atau cuba `Object.groupBy` (ES2024).
3. Simpan `JSON.stringify(laporanContoh, null, 2)` ke fail dengan Node: `import { writeFileSync } from 'node:fs'` → `laporan.geojson`. Seret fail itu ke <https://geojson.io> (jika ada internet) — titik mana yang jatuh di tempat pelik?
