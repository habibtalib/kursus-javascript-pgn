# Lab Hari 2 — Asynchronous JavaScript & Web API Integration

[⬅️ README Hari 2](./README.md) · [🗂️ Fail latihan](../projek/latihan/hari-2/)

> **Peraturan lab:** Hari ini **dua terminal** sentiasa terbuka — **A**: mock API (`npm start`, jangan tutup), **B**: latihan. Dan **DevTools → Network** sentiasa terbuka bila menggunakan browser. Setiap kali sesuatu "tidak berfungsi", lihat tiga tempat mengikut tertib: (1) log terminal A, (2) tab Network, (3) Console.

> 🪟 **Pengguna Windows:** jalankan arahan terminal dalam **Git Bash** (terminal lalai VS Code — lihat [persediaan §2.5](../docs/persediaan.md#25-terminal-vs-code-di-windows--git-bash)). Arahan PowerShell disediakan untuk langkah utama.

| Lab | Sesi | Fail | Hasil |
|-----|------|------|-------|
| 2.1 | S1 9.00–11.00 | `latihan-01.js`, `latihan-02.js`, `curl` / Thunder Client | Event loop diramal; callback hell dirasai; HTTP & CORS diperhati secara langsung |
| 2.2 | S2 11.00–1.00 | `latihan-03.js`, `latihan-04.js`, `latihan-05.js` | Promise dicipta & di-chain; 3 layer dimuat dengan 4 kombinator |
| 2.3 | S3 2.30–3.30 | `latihan-06.js` | `async/await`, loading state, sequential vs parallel, 4 jenis error |
| 2.4 | S4 3.30–5.00 | `latihan-07.js`, **`services/api.js`**, `latihan-08.js` (+ ⭐ 09, 10) | `node semak.js` **10/10** ✅ |

---

## Lab 2.1 — Konsep Async, Mock API & HTTP (S1)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Call stack, queue, event loop: B1 · Bab 10 (Making Things Happen with Events) — ms. 182–184 (**PDF 206–208**)
> - Sync vs async, callback: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 198–202 (**PDF 222–226**)
> - HTTP & CORS: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 216–220 (**PDF 240–244**)

### 🎯 Objektif
- Meramal susunan output event loop dan menerangkan dengan 3 peraturan (O1)
- Menulis callback dan mengalami masalah callback hell
- Menghidupkan mock API dan memeriksa HTTP request/response dengan `curl`, Thunder Client dan tab Network; memerhati preflight CORS (O2)

### Prasyarat
- Hari 1 selesai (`utils/geo.js` 6/6)
- README §1.1–1.10
- Node 22+; (pilihan) sambungan VS Code **Thunder Client** atau aplikasi **Postman**

### Langkah — event loop & callback (tanpa rangkaian)

1. Terminal B:

   ```bash
   cd projek/latihan/hari-2
   ```

   Buka `latihan-01.js`. Pada baris `// Tulis ramalan anda di sini`, tulis susunan 7 huruf (A–G) **sebelum** menjalankan. Kemudian:

   ```bash
   node latihan-01.js
   ```

   Bandingkan. Isi TODO A2 dengan tiga peraturan (README §1.3).

2. Bahagian B: ramal berapa ms, jalankan, kemudian **dalam browser** (langkah 8 untuk menghidang) tukar `300` kepada `5000`, buka `?latihan=01`, dan cuba skrol/pilih teks semasa loop berjalan. Pulihkan kepada `300`.

3. Buka `latihan-02.js`. **Bahagian A**:

   ```js
   muatLapisanCb('sungai', (ralat, data) => {
     if (ralat) {
       console.log('A ❌', ralat.message);
       return;
     }
     console.log('A2 sungai:', data.features.length, 'feature');
   });
   console.log('A1 permintaan dihantar — baris ini keluar DAHULU');
   ```

4. **Bahagian B** — tulis piramid tiga aras (salin struktur dari README §1.4, tambah pengiraan):

   ```js
   muatLapisanCb('sempadan-zon', (r1, zon) => {
     if (r1) return console.log('B ❌', r1.message);
     muatLapisanCb('sungai', (r2, sungai) => {
       if (r2) return console.log('B ❌', r2.message);
       muatLapisanCb('kemudahan', (r3, kemudahan) => {
         if (r3) return console.log('B ❌', r3.message);
         const jumlah = zon.features.length + sungai.features.length + kemudahan.features.length;
         const ms = Math.round(performance.now() - mula);
         console.log(`B ✅ 3 lapisan, ${jumlah} feature, ≈${ms} ms`);
       });
     });
   });
   ```

5. **Bahagian C**: `muatLapisanCb('jalan-raya', (ralat) => console.log('C ❌', ralat?.message));`

6. **Bahagian D**: jalankan dahulu **tanpa** perubahan. Proses Node **ranap** dengan `TypeError` — perhatikan bahawa `D1` tidak pernah dicetak. Kemudian betulkan:

   ```js
   setTimeout(() => {
     try {
       null.features;
     } catch (e) {
       console.log('D2', e.name);
     }
   }, 800);
   ```

### Langkah — mock API & HTTP

7. **Terminal A** (baharu):

   ```bash
   cd projek/api
   npm start
   ```

   Biarkan berjalan. Buka <http://localhost:3000/api/kesihatan> dalam browser → `{"ok":true,"masa":"…"}`. Buka juga <http://localhost:3000/> untuk senarai endpoint.

8. **Terminal C** (atau Live Server) — hidangkan folder latihan untuk browser:

   ```bash
   cd projek/latihan/hari-2
   npx serve . -l 5500
   ```

   Buka <http://localhost:5500/> → penunjuk mesti **🟢 Mock API hidup**.

9. **`curl` — baca** (Windows: jalankan dalam Git Bash, atau guna blok PowerShell di bawah):

   ```bash
   curl -i http://localhost:3000/api/kesihatan
   curl "http://localhost:3000/api/laporan?status=baharu&had=2"
   curl -i http://localhost:3000/api/laporan/LPR-9999
   curl -i "http://localhost:3000/api/kesihatan?gagal=1"
   curl -s -o /dev/null -w "%{http_code} %{time_total}s\n" "http://localhost:3000/api/kesihatan?lambat=1500"
   ```

   **Windows (PowerShell):**

   ```powershell
   $r = Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/kesihatan
   $r.StatusCode; $r.Headers['Content-Type']; $r.Content
   Invoke-RestMethod "http://localhost:3000/api/laporan?status=baharu&had=2"
   # 4xx/5xx: Windows PowerShell membaling ralat, jadi tangkap untuk melihat kod status & badan
   try { Invoke-WebRequest -UseBasicParsing http://localhost:3000/api/laporan/LPR-9999 } catch { $_.Exception.Response.StatusCode.value__; $_.Exception.Response.ContentType; $_.ErrorDetails.Message }
   try { Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/kesihatan?gagal=1" } catch { $_.Exception.Response.StatusCode.value__; $_.Exception.Response.ContentType; $_.ErrorDetails.Message }
   (Measure-Command { Invoke-WebRequest -UseBasicParsing "http://localhost:3000/api/kesihatan?lambat=1500" }).TotalSeconds
   ```

   Untuk setiap satu, catat **kod status** dan **Content-Type**.

10. **`curl` — tulis** (perhatikan setiap header):

    ```bash
    # Tanpa kunci → ?
    curl -i -X POST http://localhost:3000/api/laporan \
      -H "Content-Type: application/json" \
      -d '{"tajuk":"Ujian curl — longkang tersumbat","kategori":"infrastruktur","lat":2.93,"lng":101.69}'

    # Dengan kunci → 201. Salin ID dari respons (cth LPR-0041)
    curl -i -X POST http://localhost:3000/api/laporan \
      -H "Content-Type: application/json" \
      -H "X-API-Key: latihan-pgn-2026" \
      -d '{"tajuk":"Ujian curl — longkang tersumbat","kategori":"infrastruktur","lat":2.93,"lng":101.69}'

    # Gantikan LPR-0041 dengan ID anda
    curl -i -X PATCH http://localhost:3000/api/laporan/LPR-0041 \
      -H "Content-Type: application/json" -H "X-API-Key: latihan-pgn-2026" \
      -d '{"status":"selesai"}'

    curl -i -X DELETE http://localhost:3000/api/laporan/LPR-0041 -H "X-API-Key: latihan-pgn-2026"
    ```

    **Windows (PowerShell):**

    ```powershell
    $url   = 'http://localhost:3000/api/laporan'
    $kunci = @{ 'X-API-Key' = 'latihan-pgn-2026' }
    $jenis = 'application/json; charset=utf-8'
    $badan = @{ tajuk = 'Ujian curl — longkang tersumbat'; kategori = 'infrastruktur'; lat = 2.93; lng = 101.69 } | ConvertTo-Json -Depth 10

    # Tanpa kunci → ?
    try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri $url -ContentType $jenis -Body $badan } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }

    # Dengan kunci → 201. Salin ID dari respons (cth LPR-0041)
    $r = Invoke-WebRequest -UseBasicParsing -Method Post -Uri $url -Headers $kunci -ContentType $jenis -Body $badan
    $r.StatusCode; $r.Headers['Location']; $r.Content

    # Gantikan LPR-0041 dengan ID anda
    $r = Invoke-WebRequest -UseBasicParsing -Method Patch -Uri "$url/LPR-0041" -Headers $kunci -ContentType $jenis `
      -Body (@{ status = 'selesai' } | ConvertTo-Json -Depth 10)
    $r.StatusCode; $r.Content

    $r = Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "$url/LPR-0041" -Headers $kunci
    $r.StatusCode    # 204
    ```

11. **Thunder Client / Postman** — ulang langkah 10 secara grafik:
    - *New Request* → `POST` → `http://localhost:3000/api/laporan`
    - Tab **Headers**: `X-API-Key` = `latihan-pgn-2026`
    - Tab **Body → JSON**: `{ "tajuk": "Ujian Thunder", "kategori": "tanah", "lat": 2.91, "lng": 101.71 }`
    - *Send* → 201. Kemudian cuba `"lat": 101.71, "lng": 2.91` (terbalik) → **422**. Baca `medan`.
    - Simpan dalam Collection **GeoLapor**.

12. **Preflight CORS** — tiru apa yang browser lakukan:

    ```bash
    curl -i -X OPTIONS http://localhost:3000/api/laporan \
      -H "Origin: http://localhost:5500" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: content-type,x-api-key"
    ```

    **Windows (PowerShell):**

    ```powershell
    $r = Invoke-WebRequest -UseBasicParsing -Method Options -Uri http://localhost:3000/api/laporan -Headers @{
      'Origin'                         = 'http://localhost:5500'
      'Access-Control-Request-Method'  = 'POST'
      'Access-Control-Request-Headers' = 'content-type,x-api-key'
    }
    $r.StatusCode; $r.Headers
    ```

    Cari tiga header `Access-Control-Allow-*` dalam response.

13. **Tab Network** — dalam tab browser `http://localhost:5500/`, buka DevTools → **Network** → penapis **Fetch/XHR**. Muat semula: anda nampak `kesihatan` (200). Klik baris itu → tab **Headers** → cari `Origin: http://localhost:5500` (request) dan `Access-Control-Allow-Origin: *` (response).

### ✅ Checkpoint

- `latihan-01`: ramalan anda ditulis; output sebenar `A · E · G · C · D · F · B`, dan `B2 … ≈300 ms`.
- `latihan-02`: `A1` sebelum `A2`; `B ✅ 3 lapisan, 16 feature, ≈600 ms`; `C ❌ Lapisan 'jalan-raya' tidak wujud`; `D2 TypeError` (tiada ranap).
- Jadual anda:

  | Request | Status | Content-Type |
  |------------|--------|--------------|
  | GET `/api/kesihatan` | 200 OK | `application/json` |
  | GET `/api/laporan?…` | 200 | `application/geo+json` |
  | GET `/api/laporan/LPR-9999` | 404 Not Found | `application/json` |
  | `?gagal=1` | 500 Internal Server Error | `application/json` |
  | `?lambat=1500` | 200, `time_total` ≈ **1.5 s** | |
  | POST tanpa key | **401** Unauthorized | |
  | POST dengan key | **201** Created + `Location: /api/laporan/LPR-00xx` | `application/geo+json` |
  | PATCH | 200 | |
  | DELETE | **204** No Content (tiada badan) | — |
  | OPTIONS (preflight) | **204** + `Access-Control-Allow-Origin: *` | — |

- Log terminal A menunjukkan setiap request anda, cth `POST   /api/laporan → 201 (2 ms)`.

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `Port 3000 sedang digunakan` | Mock API sudah berjalan (terminal lain) atau `npx serve` tanpa `-l` | Guna yang sedia ada; atau hentikan proses lain. `serve` mesti `-l 5500` |
| `curl: (7) Failed to connect to localhost port 3000` | Mock API tidak berjalan | Terminal A: `npm start` |
| PowerShell: `Invoke-WebRequest : A parameter cannot be found that matches parameter name 'X'` | `curl` = alias PowerShell | Taip `curl.exe`, atau guna Git Bash / Thunder Client |
| `400 JSON tidak sah dalam badan permintaan` | Petikan dalam `-d` rosak (cmd.exe) | Git Bash, atau Thunder Client |
| Penunjuk 🔴 dalam halaman walaupun API hidup | Halaman dibuka melalui `file://` | Guna `http://localhost:5500` |
| `latihan-02` ranap sebelum bahagian B siap | TypeError D sebelum B | Pastikan tunda D ialah `800` |

### ⭐ Cabaran
1. Dalam tab Network, klik kanan request `kesihatan` → **Copy → Copy as cURL (bash)**. Tampal dalam terminal. Berapa banyak header yang browser hantar yang anda tidak tulis sendiri?
2. `curl -i -X PUT http://localhost:3000/api/laporan/LPR-0001 -H "X-API-Key: latihan-pgn-2026"` → apakah kod status dan header `Allow`? Kenapa API ini tidak menyokong PUT?
3. `curl "http://localhost:3000/api/laporan?bbox=101.67,2.90,101.72,2.95" | head -c 300` — tukar bbox kepada kawasan Cyberjaya sahaja. Berapa laporan? (Petua: gunakan `bboxDari()` Hari 1 untuk mencari julat.)

---

## Lab 2.2 — Promise Handling & 3 Layer GeoJSON (S2)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - Mencipta & chaining Promise: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 202–206 (**PDF 226–230**)
> - `.catch`, rejection yang tidak di-handle: B7 · Bab 7 (Error Handling and Debugging) — ms. 656–659 (**PDF 680–683**)

### 🎯 Objektif
Mencipta Promise, meratakan callback hell dengan chaining, menggunakan `fetch` sebagai Promise, dan memilih kombinator yang betul untuk memuat layer `sempadan-zon`, `sungai`, `kemudahan` (O3).

### Prasyarat
- Lab 2.1 checkpoint lulus; mock API berjalan (terminal A)
- README §2.1–2.6

### Langkah — `latihan-03.js` (Promise tanpa rangkaian)

1. **A** — `tunggu`:

   ```js
   const tunggu = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
   ```

2. **B** — promisify:

   ```js
   function muatLapisan(id) {
     return new Promise((resolve, reject) => {
       muatLapisanCb(id, (ralat, data) => {
         if (ralat) reject(ralat);
         else resolve(data);
       });
     });
   }
   ```

   Padam baris `p.catch(() => {});` — tidak diperlukan lagi.

3. **C** — ratakan callback hell (letak selepas `const kiraan = {};`):

   ```js
   tunggu(10)
     .then(() => muatLapisan('sempadan-zon'))
     .then((zon) => {
       kiraan.zon = zon.features.length;
       return muatLapisan('sungai');
     })
     .then((sungai) => {
       kiraan.sungai = sungai.features.length;
       return muatLapisan('kemudahan');
     })
     .then((kemudahan) => {
       kiraan.kemudahan = kemudahan.features.length;
       console.log('C1', kiraan, `≈${Math.round(performance.now() - mula)} ms`);
       return muatLapisan('jalan-raya');
     })
     .then(() => console.log('C2 (dilangkau)'))
     .catch((ralat) => console.log('C3 ❌', ralat.message))
     .finally(() => console.log('C4 finally'));
   ```

4. **D** — nyahkomen blok D, tulis ramalan, jalankan.

5. **E** — cari pepijat: tambah `return` di hadapan `muatLapisan('kemudahan')` dan buang `.catch(() => {})`. Jalankan semula — `E1 data =` kini objek.

### Langkah — `latihan-04.js` (`fetch` + `.then`)

6. **A**:

   ```js
   function bahagianA() {
     return fetch(`${API_URL}/api/kesihatan`)
       .then((res) => {
         console.log('A1', res.status, res.ok, res.statusText);
         console.log('A2', res.headers.get('content-type'));
         return res.json();
       })
       .then((data) => console.log('A3', data));
   }
   ```

7. **B** dan **C**:

   ```js
   function bahagianB() {
     return fetch(`${API_URL}/api/kategori`)
       .then((res) => res.json())
       .then((kategori) => console.log('B1', kategori.length, kategori.map((k) => k.kod).join(', ')));
   }

   function bahagianC() {
     return fetch(`${API_URL}/api/laporan/LPR-9999`)
       .then((res) => {
         console.log('C1', res.ok, res.status);
         return res.json();
       })
       .then((badan) => console.log('C2', badan.ralat));
   }
   ```

8. **D** — `URLSearchParams`:

   ```js
   function bahagianD() {
     const qs = new URLSearchParams({ status: 'baharu', q: 'jalan', had: 5 });
     const url = `${API_URL}/api/laporan?${qs}`;
     console.log('D1', url);
     return fetch(url)
       .then((res) => {
         console.log('D2', res.headers.get('content-type'), res.headers.get('x-jumlah'));
         return res.json();
       })
       .then((fc) => {
         console.log('D3', fc.type, fc.features.length <= 5);
         for (const { id, properties: p } of fc.features) console.log('D4', id, p.status, p.tajuk);
       });
   }
   ```

9. **E** — `ambilJson` dengan semakan `res.ok`:

   ```js
   function ambilJson(url) {
     return fetch(url).then((res) => {
       if (!res.ok) throw new Error(`HTTP ${res.status}`);
       return res.json();
     });
   }
   ```

10. Jalankan dalam **browser** juga: `http://localhost:5500/?latihan=04`. Dalam Network, klik request `laporan?status=…` → tab **Preview** → kembangkan `features[0].geometry.coordinates`. Susunan apa?

### Langkah — `latihan-05.js` (kombinator)

11. **A** — `Promise.all`:

    ```js
    function bahagianA() {
      const mula = performance.now();
      const janji = LAPISAN.map((id) => ambilJson(`${API_URL}/api/lapisan/${id}?lambat=1000`));
      return Promise.all(janji).then(([zon, sungai, kemudahan]) => {
        console.log('A1', zon.features.length, sungai.features.length, kemudahan.features.length, masa(mula));
      });
    }
    ```

12. **B** — `all` dengan satu gagal, dan **C** — `allSettled`:

    ```js
    function bahagianB() {
      const janji = [
        ambilJson(`${API_URL}/api/lapisan/sempadan-zon`),
        ambilJson(`${API_URL}/api/lapisan/sungai?gagal=1`),
        ambilJson(`${API_URL}/api/lapisan/kemudahan`),
      ];
      return Promise.all(janji)
        .then(() => console.log('B1 (tidak dicetak)'))
        .catch((e) => console.log('B2 ❌ all gagal kerana:', e.message));
    }

    function bahagianC() {
      const janji = LAPISAN.map((id) => ambilJson(`${API_URL}/api/lapisan/${id}${id === 'sungai' ? '?gagal=1' : ''}`));
      return Promise.allSettled(janji).then((hasil) => {
        hasil.forEach((h, i) => {
          if (h.status === 'fulfilled') console.log('C', LAPISAN[i], '✅', h.value.features.length, 'feature');
          else console.log('C', LAPISAN[i], '❌', h.reason.message);
        });
        const berjaya = hasil.filter((h) => h.status === 'fulfilled').length;
        console.log('C', `${berjaya}/${hasil.length} lapisan dimuat — peta tetap dipapar`);
      });
    }
    ```

13. **D** — `race` dan **E** — `any`:

    ```js
    function bahagianD() {
      return Promise.race([ambilJson(`${API_URL}/api/lapisan/sungai?lambat=2000`), tamatMasa(500)])
        .then(() => console.log('D1 (tidak dicetak)'))
        .catch((e) => console.log('D2 ⏱️', e.message));
    }

    function bahagianE() {
      const cermin = [`${API_URL}/api/lapisan/kemudahan?gagal=1`, `${API_URL}/api/lapisan/kemudahan?lambat=300`];
      return Promise.any(cermin.map(ambilJson))
        .then((fc) => console.log('E1 ✅ any:', fc.features.length, 'feature dari cermin yang hidup'))
        .then(() => Promise.any([ambilJson(`${API_URL}/api/kesihatan?gagal=1`), ambilJson(`${API_URL}/api/tiada`)]))
        .catch((e) => console.log('E2 ❌', e.name, e.errors.length, 'ralat'));
    }
    ```

14. Jalankan `?latihan=05` dalam browser dengan tab Network terbuka. Untuk bahagian A, perhatikan lajur **Waterfall**: tiga bar bermula **serentak**. Untuk D, perhatikan request `sungai?lambat=2000` masih **tamat selepas 2 s** walaupun `race` sudah "kalah" pada 500 ms.

### ✅ Checkpoint

```bash
node latihan-03.js
```
```text
A1 true [object Promise]
C1 { zon: 5, sungai: 3, kemudahan: 8 } ≈610 ms
C3 ❌ Lapisan 'jalan-raya' tidak wujud
C4 finally
D1 ❌ Nilai 20 terlalu besar
D2 selepas pulih: 0
E1 data = { type: 'FeatureCollection', features: [ … ] }
```

```bash
node latihan-04.js
```
```text
A1 200 true OK
A2 application/json; charset=utf-8
B1 5 infrastruktur, alam-sekitar, tanah, utiliti, lain-lain
C1 false 404
C2 Laporan LPR-9999 tidak dijumpai
D1 http://localhost:3000/api/laporan?status=baharu&q=jalan&had=5
D2 application/geo+json; charset=utf-8 1
E2 ❌ HTTP 404
```

```bash
node latihan-05.js
```
```text
A1 5 3 12 ≈1000 ms
B2 ❌ all gagal kerana: HTTP 500 — /api/lapisan/sungai?gagal=1
C sempadan-zon ✅ 5 feature
C sungai ❌ HTTP 500 — /api/lapisan/sungai?gagal=1
C kemudahan ✅ 12 feature
C 2/3 lapisan dimuat — peta tetap dipapar
D2 ⏱️ Tamat masa 500 ms
E1 ✅ any: 12 feature dari cermin yang hidup
E2 ❌ AggregateError 2 ralat
```
(Masa boleh berbeza ±100 ms. Bilangan `x-jumlah`/feature bergantung data — selepas `npm run reset-data`, nilai di atas.)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `C1 { zon: 5 }` sahaja, kemudian `C4` | `return` tertinggal dalam `.then` | Setiap `.then` yang memulakan kerja mesti `return` Promise itu |
| `E2 ❌ …` tidak dicetak; B/C gagal senyap | `ambilJson` tidak menyemak `res.ok` | `if (!res.ok) throw …` |
| `TypeError: fetch failed` (Node) / `Failed to fetch` (browser) | Mock API mati | Terminal A: `npm start` |
| `A1 … ≈3000 ms` | `await`/`.then` di dalam loop — sequential | Cipta semua Promise dahulu (`map`), kemudian `Promise.all` |
| `SyntaxError: Unexpected token '<'` pada `res.json()` | URL salah → server pulangkan bukan JSON | Semak URL dalam Network |
| `Uncaught (in promise)` dalam Console | Chaining tanpa `.catch` | Tambah `.catch` di hujung |
| Console merah: `Failed to load resource: the server responded with a status of 500` walaupun kod anda menangkap error | Chrome sentiasa melog response 4xx/5xx — ia **bukan** error kod anda | Normal untuk `?gagal=1`/404 yang disengajakan. Error kod sebenar kelihatan sebagai `Uncaught …` |

### ⭐ Cabaran
1. Tulis `denganTimeout(janji, ms)` menggunakan `Promise.race` yang boleh digunakan semula: `await denganTimeout(ambilJson(url), 500)`.
2. Guna `GET /api/lapisan` dahulu untuk mendapat senarai layer, **kemudian** muat semua secara parallel menggunakan medan `url` setiap item (sequential → parallel dalam satu chain).
3. Ukur: 10 request `?lambat=200` dengan `Promise.all` — adakah masa ≈200 ms? Cuba 50. Apa yang anda perhatikan dalam Waterfall (had sambungan browser per hos)?

---

## Lab 2.3 — Async/Await, Loading State & Jenis Error (S3)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - `async`/`await`: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 206–210 (**PDF 230–234**)
> - Jenis error, `try…catch` dalam fungsi async: B7 · Bab 7 (Error Handling and Debugging) — ms. 651–653, 659–660 (**PDF 675–677, 683–684**)

### 🎯 Objektif
Menulis semula kod Promise dengan `async/await`, mengurus keadaan loading dengan `try…catch…finally`, membandingkan sequential vs parallel, dan mengelaskan 4 jenis error (O4).

### Prasyarat
- Lab 2.2 checkpoint lulus; mock API berjalan
- README §3.1–3.5

### Langkah — `latihan-06.js`

1. **A** — `ambilJson` versi `async`:

   ```js
   async function ambilJson(url) {
     const res = await fetch(url);
     const data = await res.json().catch(() => null);
     if (!res.ok) {
       const ralat = new Error(data?.ralat ?? `HTTP ${res.status}`);
       ralat.status = res.status;
       throw ralat;
     }
     return data;
   }
   ```

2. **B** — loading state:

   ```js
   async function muatDenganStatus(label, url) {
     console.log(`B ⏳ ${label}: memuatkan…`);
     try {
       const fc = await ambilJson(url);
       console.log(`B ✅ ${label}: ${fc.features.length} feature`);
       return fc;
     } catch (e) {
       console.log(`B ❌ ${label}: ${e.message}`);
       return null;
     } finally {
       console.log(`B ⏹️ ${label}: tutup penunjuk loading`);
     }
   }
   ```

3. **C** — tulis ramalan masa dahulu, kemudian:

   ```js
   async function bersiri() {
     const mula = performance.now();
     const hasil = [];
     for (const id of LAPISAN) {
       hasil.push(await ambilJson(`${API_URL}/api/lapisan/${id}?lambat=1000`));
     }
     console.log('C1 bersiri:', hasil.length, 'lapisan', masa(mula));
   }

   async function selari() {
     const mula = performance.now();
     const hasil = await Promise.all(LAPISAN.map((id) => ambilJson(`${API_URL}/api/lapisan/${id}?lambat=1000`)));
     console.log('C2 selari :', hasil.length, 'lapisan', masa(mula));
   }
   ```

4. **D** — pengelas error:

   ```js
   function kelaskan(e) {
     if (e.name === 'TypeError') return 'RANGKAIAN (pelayan mati / CORS / URL salah)';
     if (e.status >= 500) return `PELAYAN (${e.status}) — cuba lagi kemudian`;
     if (e.status === 404) return 'TIDAK DIJUMPAI (404)';
     if (e.status >= 400) return `PERMINTAAN SALAH (${e.status})`;
     return 'LAIN';
   }
   ```

5. **E** — jalankan, perhatikan `≈0 ms`. Betulkan dengan:

   ```js
   await Promise.all(LAPISAN.map((id) => ambilJson(`${API_URL}/api/lapisan/${id}?lambat=300`)));
   console.log('E2 semua lapisan benar-benar siap dalam', masa(mula));
   ```

6. **Eksperimen rangkaian (browser)** — buka `?latihan=06`:
   - DevTools → Network → *No throttling* ▾ → **Slow 4G**. Muat semula. Perhatikan masa bahagian B & C bertambah.
   - Tukar kepada **Offline**. Muat semula latihan (halaman mungkin dari cache) — semua request menjadi `RANGKAIAN`.
   - Pulihkan **No throttling**.

7. **Eksperimen server mati** — dalam terminal A tekan `Ctrl+C`. Jalankan `node latihan-06.js`. Apakah jenis error bahagian B? Hidupkan semula `npm start`.

### ✅ Checkpoint

```bash
node latihan-06.js
```
```text
B ⏳ sungai: memuatkan…
B ✅ sungai: 3 feature
B ⏹️ sungai: tutup penunjuk loading
B ⏳ sungai (gagal): memuatkan…
B ❌ sungai (gagal): Ralat pelayan disimulasikan (?gagal=1)
B ⏹️ sungai (gagal): tutup penunjuk loading
C1 bersiri: 3 lapisan ≈3000 ms
C2 selari : 3 lapisan ≈1000 ms
D port salah → RANGKAIAN (pelayan mati / CORS / URL salah)
D ?gagal=1   → PELAYAN (500) — cuba lagi kemudian
D id tiada   → TIDAK DIJUMPAI (404)
D bbox rosak → PERMINTAAN SALAH (400)
E1 forEach "selesai" dalam ≈0 ms — tetapi fetch belum siap!
```

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `SyntaxError: await is only valid in async functions and the top level bodies of modules` | `await` dalam fungsi biasa, atau fail bukan modul | Tambah `async` pada fungsi; pastikan `package.json` `"type": "module"` / `<script type="module">` |
| `B ❌` mencetak `HTTP 500` bukan mesej server | Tidak membaca `data?.ralat` | Baca badan **sebelum** `throw` |
| `⏹️` tidak dicetak bila gagal | Kod tutup loading dalam `try` | Pindah ke `finally` |
| `C2 selari ≈3000 ms` | Promise masih dicipta **dan** di-`await` satu-satu dalam loop | Cipta semua dahulu dengan `map` (tanpa `await` di dalamnya), kemudian `await Promise.all(…)` sekali |
| `D port salah → LAIN` | Node melontar `TypeError` dengan `cause`; anda menyemak `e.message` | Semak `e.name === 'TypeError'` |

### ⭐ Cabaran
1. Tulis `muatSemuaLapisan()` yang menggabungkan `allSettled` + `async/await` dan memulangkan `{ berjaya: {id: fc}, gagal: [id…] }`.
2. Tulis `muatDenganHad(senaraiUrl, had = 2)` — muat berpuluh URL tetapi **maksimum 2 serentak** (petua: pool pekerja dengan `while` + `shift()`).
3. Top-level await: dalam Console browser (bukan modul), `await fetch('http://localhost:3000/api/kesihatan')` juga berfungsi. Kenapa? (Chrome DevTools membalut input Console.)

---

## Lab 2.4 — Fetch API Integration → `services/api.js` (S4)

> 📖 **Bacaan buku** — *JavaScript All-in-One For Dummies* (Minnick, 2023), pengayaan selepas sesi. Halaman PDF = muka surat cetak + 24.
>
> - `fetch`, Response, error, opsyen (method, header, body): B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 210–216 (**PDF 234–240**)
> - JSON hantar & terima: B1 · Bab 11 (Writing Asynchronous JavaScript) — ms. 220–222 (**PDF 244–246**)

### 🎯 Objektif
Menggunakan `fetch` untuk operasi tulis (POST/PATCH/DELETE) dengan header yang betul, mengendali 401/422/204, membatalkan request (O5), dan membina modul **`services/api.js`** yang lulus 10/10 ujian (O6).

### Prasyarat
- Lab 2.3 checkpoint lulus; mock API berjalan
- README §4.1–4.6

### Langkah — `latihan-07.js` (fetch mentah, 20 minit)

1. Jalankan fail seperti asal — bahagian A sudah siap: `A 401 Unauthorized`.

2. **B** — 422:

   ```js
   res = await fetch(`${API_URL}/api/laporan`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
     body: JSON.stringify({ tajuk: 'Abc', kategori: 'jalan', lat: 101.69, lng: 2.93 }),
   });
   const b = await cetakRespons('B', res);
   for (const [medan, mesej] of Object.entries(b.medan ?? {})) console.log('B  ·', medan, '→', mesej);
   ```

3. **C** — 201:

   ```js
   res = await fetch(`${API_URL}/api/laporan`, {
     method: 'POST',
     headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
     body: JSON.stringify({
       tajuk: 'Ujian Lab 7 — longkang tersumbat',
       kategori: 'infrastruktur',
       catatan: 'Dicipta oleh latihan-07.js',
       lat: 2.9301,
       lng: 101.6902,
     }),
   });
   cipta = await res.json();
   console.log('C', res.status, cipta.id, cipta.geometry.coordinates, res.headers.get('location'));
   ```

4. **D & E** — PATCH, DELETE, GET semula:

   ```js
   res = await fetch(`${API_URL}/api/laporan/${cipta.id}`, {
     method: 'PATCH',
     headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
     body: JSON.stringify({ status: 'dalam-tindakan' }),
   });
   const kemas = await res.json();
   console.log('D', res.status, kemas.properties.status, kemas.properties.tajuk);

   res = await fetch(`${API_URL}/api/laporan/${cipta.id}`, { method: 'DELETE', headers: { 'X-API-Key': API_KEY } });
   await cetakRespons('E1', res);
   res = await fetch(`${API_URL}/api/laporan/${cipta.id}`);
   console.log('E2', res.status);
   ```

5. **F & G** — pembatalan:

   ```js
   const pengawal = new AbortController();
   setTimeout(() => pengawal.abort(), 300);
   try {
     await fetch(`${API_URL}/api/laporan?lambat=3000`, { signal: pengawal.signal });
   } catch (e) {
     console.log('F', e.name);
   }

   try {
     await fetch(`${API_URL}/api/laporan?lambat=3000`, { signal: AbortSignal.timeout(1000) });
   } catch (e) {
     console.log('G', e.name);
   }
   ```

6. Jalankan `?latihan=07` dalam **browser**. Dalam Network cari: (a) baris **preflight** sebelum POST pertama, (b) tab **Payload** untuk POST, (c) status `(canceled)` untuk F.

### Langkah — `services/api.js` (40 minit)

7. Jalankan penyemak dahulu:

   ```bash
   node semak.js
   ```
   → `0/10 lulus`. Setiap TODO di bawah menghijaukan satu atau lebih ujian.

8. **TODO 1 — `ApiError`** (→ ✅ ApiError):

   ```js
   export class ApiError extends Error {
     constructor(mesej, status, medan) {
       super(mesej);
       this.name = 'ApiError';
       this.status = status;
       this.medan = medan ?? null;
     }
   }
   ```

9. **TODO 2 — header**:

   ```js
   const headers = { Accept: 'application/json' };
   if (body !== undefined) headers['Content-Type'] = 'application/json';
   if (method !== 'GET') headers['X-API-Key'] = API_KEY;
   ```

10. **TODO 3 & 4 — isyarat & fetch penuh**:

    ```js
    const isyaratTimeout = AbortSignal.timeout(timeoutMs);
    const isyarat = signal ? AbortSignal.any([signal, isyaratTimeout]) : isyaratTimeout;

    let respons;
    try {
      respons = await fetch(`${API_URL}${laluan}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: isyarat,
      });
    } catch (ralat) {
      // TODO 5 di sini
    }
    ```

11. **TODO 5 — terjemah network error** (ganti `throw ralat;` dalam `catch`):

    ```js
    if (ralat.name === 'TimeoutError') throw new ApiError(`Tiada respons dalam ${timeoutMs / 1000} saat`, 0);
    if (ralat.name === 'AbortError') throw ralat;
    throw new ApiError('Tidak dapat menghubungi pelayan. Adakah mock API sedang berjalan?', 0);
    ```

12. **TODO 6–8 — 204, content-type, `res.ok`** (ganti `return respons.json();`):

    ```js
    if (respons.status === 204) return null;

    const jenis = respons.headers.get('content-type') ?? '';
    const data = jenis.includes('json') ? await respons.json() : null;

    if (!respons.ok) {
      throw new ApiError(data?.ralat ?? `HTTP ${respons.status} ${respons.statusText}`, respons.status, data?.medan);
    }
    return data;
    ```

13. **TODO 9 — `bina(tapisan)`**:

    ```js
    function bina(tapisan) {
      const qs = new URLSearchParams();
      for (const [kunci, nilai] of Object.entries(tapisan)) {
        if (nilai === undefined || nilai === null || nilai === '') continue;
        qs.set(kunci, Array.isArray(nilai) ? nilai.join(',') : String(nilai));
      }
      const teks = qs.toString();
      return teks ? `?${teks}` : '';
    }
    ```

14. **TODO 10 — 8 fungsi baki**. Contoh dua; tulis enam lagi sendiri mengikut jadual README §4.4:

    ```js
    export function dapatkanLaporan(id) {
      return mintaJson(`/api/laporan/${encodeURIComponent(id)}`);
    }

    export function ciptaLaporan(data) {
      return mintaJson('/api/laporan', { method: 'POST', body: data });
    }
    ```

15. `node semak.js` sehingga **10/10**.

### Langkah — `latihan-08.js` (20 minit)

16. Lengkapkan TODO 1–8. Rujuk struktur dalam README §4.4 ("Guna") dan corak carian dalam §4.3. Mulakan dengan `mesejPengguna`:

    ```js
    function mesejPengguna(e) {
      if (e.name === 'AbortError') return null;
      if (!(e instanceof ApiError)) return `Ralat tidak dijangka: ${e.message}`;
      if (e.status === 0) return `📡 ${e.message}`;
      if (e.status === 401) return '🔑 Tiada kebenaran (kunci API)';
      if (e.status === 404) return `🔍 ${e.message}`;
      if (e.status === 422) return `✏️ Semak borang: ${Object.keys(e.medan ?? {}).join(', ')}`;
      if (e.status >= 500) return '🛠️ Pelayan bermasalah — cuba sebentar lagi';
      return e.message;
    }
    ```

    Kemudian bahagian A:

    ```js
    const [kategori, lapisan, statistik] = await Promise.all([senaraiKategori(), senaraiLapisan(), dapatkanStatistik()]);
    console.log('A1', kategori.length, 'kategori ·', lapisan.map((l) => l.id).join(', '));
    console.log('A2', 'jumlah laporan =', statistik.jumlah, statistik.ikutStatus);
    ```

    Teruskan B (kitaran CRUD), C (loop `senario` dengan `try/catch`) dan ⭐ D (`cari(q)` dengan `AbortController`).

### ✅ Checkpoint

```bash
node latihan-07.js
```
```text
A 401 Unauthorized { ralat: 'Kunci API tidak sah' }
B 422 Unprocessable Entity { ralat: 'Data laporan tidak sah', medan: { … } }
B  · tajuk → Tajuk wajib, 5–120 aksara
B  · kategori → Kategori mesti salah satu: infrastruktur, alam-sekitar, tanah, utiliti, lain-lain
B  · lat → Latitud mesti dalam Malaysia (0.8–7.5)
B  · lng → Longitud mesti dalam Malaysia (99.5–119.5)
C 201 LPR-0041 [ 101.6902, 2.9301 ] /api/laporan/LPR-0041
D 200 dalam-tindakan Ujian Lab 7 — longkang tersumbat
E1 204 No Content (tiada badan)
E2 404
F AbortError
G TimeoutError
```

```bash
node semak.js
```
```text
✅ ApiError
✅ senaraiKategori
✅ senaraiLaporan + tapisan
✅ dapatkanLaporan 404
✅ ciptaLaporan 422
✅ cipta → kemaskini → padam
✅ lapisan & statistik
✅ mintaJson timeout → ApiError 0
✅ mintaJson 500
✅ AbortController pemanggil

10/10 lulus (./services/api.js)
```

```bash
node latihan-08.js
```
```text
A1 5 kategori · sempadan-zon, sungai, kemudahan
A2 jumlah laporan = 40 { baharu: 18, 'dalam-tindakan': 11, selesai: 8, ditolak: 3 }
…
B3 padam     null
B4 true 404 🔍 Laporan LPR-00xx tidak dijumpai
C 422     → ✏️ Semak borang: tajuk, kategori, lat, lng
C 500     → 🛠️ Pelayan bermasalah — cuba sebentar lagi
C timeout → 📡 Tiada respons dalam 0.5 saat
D ⏭️ "j" dibatalkan
D ⏭️ "ja" dibatalkan
D ✅ "jalan" → 4 padanan
```
(ID `LPR-00xx` dan jumlah bergantung data semasa. `npm run reset-data` dalam `projek/api` memulihkan 40 rekod asal.)

### 🧯 Masalah lazim

| Gejala | Punca | Penyelesaian |
|--------|-------|--------------|
| `✅ senaraiKategori` tetapi `❌ senaraiLaporan + tapisan — senaraiLaporan memulangkan null…` | Semak `includes('application/json')` — laporan ialah `application/geo+json` | Semak `includes('json')` |
| `400 JSON tidak sah` | `body: data` tanpa `JSON.stringify` | Stringify dalam `mintaJson` — **bukan** dalam setiap fungsi |
| `401` pada PATCH/DELETE | Header `X-API-Key` hanya ditambah untuk POST | Syarat `method !== 'GET'` |
| `padamLaporan` → `SyntaxError: Unexpected end of JSON input` | `res.json()` pada 204 | `if (respons.status === 204) return null;` **sebelum** membaca badan |
| `AbortController pemanggil` gagal: dapat `ApiError` | `AbortError` diterjemah kepada ApiError | `if (ralat.name === 'AbortError') throw ralat;` sebelum baris umum |
| `TypeError: AbortSignal.any is not a function` | Browser/Node lama | Chrome ≥ 116, Node ≥ 20. Alternatif: timeout manual (README §4.3 "di sebalik tabir") |
| Browser: `blocked by CORS policy … x-api-key is not allowed` | Server lain tanpa `Access-Control-Allow-Headers` | Mock API kita membenarkannya — pastikan URL `localhost:3000`, bukan server lain |
| Data bersepah (laporan ujian bertimbun) | Latihan dijalankan banyak kali | `cd projek/api && npm run reset-data` |

### ⭐ Cabaran
1. **Latihan 09 (`latihan-09.js`) — retry dengan backoff.** Lengkapkan `bolehCubaSemula` dan `denganCubaSemula` (README §4.7). Checkpoint:
   ```text
   A ↻ cubaan 1 gagal (500) — cuba lagi dalam ≈300 ms
   A ↻ cubaan 2 gagal (500) — cuba lagi dalam ≈600 ms
   A ✅ selepas 3 panggilan: true
   B ❌ 404 selepas 1 panggilan
   ```
2. **Latihan 10 (`latihan-10.js`) — `api.data.gov.my`** (jika ada internet). Checkpoint: `1 true 3` diikuti 3 baris harga dengan tarikh terkini dahulu. Tiada internet? Pastikan mesej `❌ API awam tidak dapat dicapai` muncul — bukan ranap.
3. Tambah fungsi `export function senaraiSemuaLaporan(tapisan)` yang mengambil **semua halaman** menggunakan `had=10` dan `mula` sehingga `features.length < 10` (penomboran). Bandingkan jumlah dengan medan `jumlah`.
4. Buka `http://localhost:5500/?latihan=08` → DevTools → **Sources** → cari `latihan-pgn-2026`. Inilah sebabnya key dalam frontend bukan rahsia (README §4.6).
