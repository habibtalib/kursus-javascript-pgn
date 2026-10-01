# Nota Pelajar — Hari 2: Asynchronous JavaScript & Web API Integration

Nota rujukan penuh untuk Hari 2. Baca bersama slaid dan lab hari ini.

**Kandungan:**

- Nota 05 — Asynchronous JavaScript — Event Loop, Promise & `async`/`await`
- Nota 06 — HTTP, REST & Fetch API — Bekerja dengan API Secara Profesional

**Nota sokongan:** Nota 04 (Edaran Hari 1) — Array, Objek & JSON — GeoJSON sebagai Data JavaScript; Nota 14 (Edaran Hari 5) — Debugging, Error Handling, Ujian & Amalan Terbaik.

---

## 05 · Asynchronous JavaScript — Event Loop, Promise & `async`/`await`

> Nota topikal (rujukan merentas hari) · Indeks: `README.md`

### Objektif nota

- **Menerangkan** bagaimana JavaScript yang *single-threaded* boleh menunggu API tanpa membekukan halaman (call stack, Web API, task queue, microtask queue, event loop).
- **Meramal** susunan output kod yang mencampurkan kod synchronous, `setTimeout`, `Promise.then` dan `await`.
- **Menukar** kod callback kepada Promise, dan Promise kepada `async`/`await` dengan `try…catch…finally`.
- **Memilih** `Promise.all`, `allSettled`, `race` atau `any` mengikut keperluan (cth memuat 3 layer GeoJSON serentak).
- **Membatalkan** request dengan `AbortController` dan menetapkan tamat masa dengan `AbortSignal.timeout()`.

---

### 1. Kenapa asynchronous?

`GET /api/laporan?lambat=2000` mengambil 2 saat. Jika JavaScript **menunggu secara synchronous**, selama 2 saat itu:

- peta tidak boleh diseret, butang tidak bertindak balas, animasi *spinner* pun beku;
- browser mungkin memaparkan "Halaman tidak bertindak balas".

JavaScript hanya ada **satu thread** untuk kod anda. Penyelesaiannya: **mulakan** kerja yang lambat (rangkaian, pemasa, baca fail), **serahkan** kepada browser, dan **teruskan** kod lain. Apabila kerja itu siap, browser menjadualkan *callback* anda untuk dijalankan kemudian.

```mermaid
flowchart LR
    CS[Call stack<br/>kod anda] -->|fetch, setTimeout| WA[Web API browser<br/>network, timer]
    WA -->|selesai| MQ[Microtask queue<br/>Promise.then, await]
    WA -->|selesai| TQ[Task queue<br/>setTimeout, event klik]
    MQ -->|diutamakan| EL{Event loop}
    TQ --> EL
    EL -->|bila stack kosong| CS
```

---

### 2. Event loop — peraturan

1. Jalankan semua kod **synchronous** hingga call stack kosong.
2. Kosongkan **SEMUA microtask** (Promise `then/catch/finally`, sambungan selepas `await`, `queueMicrotask`).
3. Ambil **SATU task** (callback `setTimeout`, event `click`, mesej), jalankan.
4. Kosongkan semua microtask lagi. Browser mungkin melukis semula skrin.
5. Ulang dari 3.

```js
console.log('1 segerak mula');
setTimeout(() => console.log('5 task: setTimeout 0'), 0);
Promise.resolve().then(() => console.log('3 microtask: then'));
queueMicrotask(() => console.log('4 microtask: queueMicrotask'));
console.log('2 segerak tamat');

// Output (disahkan dengan Node 22+ dan Chrome):
// 1 segerak mula
// 2 segerak tamat
// 3 microtask: then
// 4 microtask: queueMicrotask
// 5 task: setTimeout 0
```

> 💡 **`setTimeout(fn, 0)` bukan "sekarang".** Ia bermaksud "selepas kod synchronous **dan** semua microtask selesai, dan sekurang-kurangnya 0 ms". Ia tetap menunggu giliran.

`await` juga memecahkan fungsi kepada dua: bahagian sebelum `await` berjalan secara synchronous; bahagian selepasnya ialah microtask.

```js
async function muat() {
  console.log('B dalam async sebelum await');
  await null;
  console.log('D selepas await');
}
console.log('A');
muat();
console.log('C');
// → A, B dalam async sebelum await, C, D selepas await
```

> ⚠️ **Kod synchronous yang berat tetap membekukan UI** walaupun dalam fungsi `async`. Mengira `turf.simplify` pada 50,000 verteks dalam loop ialah kerja CPU, bukan rangkaian — `async` tidak membantu. (Penyelesaian: kurangkan data, *Web Worker* — sebutan Hari 5.)

---

### 3. Dari callback ke Promise ke `async`/`await`

#### 3.1 Callback — dan "callback hell"

```js
// Gaya lama: fungsi yang menerima callback (err, data)
function ambilJson(url, callback) {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = () => callback(null, JSON.parse(xhr.responseText));
  xhr.onerror = () => callback(new Error('Rangkaian gagal'));
  xhr.send();
}

// Muat kategori → laporan → layer zon, secara sequential:
ambilJson('/api/kategori', (err, kategori) => {
  if (err) return papar(err);
  ambilJson('/api/laporan', (err, laporan) => {
    if (err) return papar(err);
    ambilJson('/api/lapisan/sempadan-zon', (err, zon) => {
      if (err) return papar(err);
      lukis(kategori, laporan, zon);       // piramid → "callback hell"
    });
  });
});
```

Masalah: bersarang ke kanan, error perlu disemak di setiap tahap, dan sukar untuk menjalankan tiga request **serentak**.

#### 3.2 Promise — objek "nilai masa depan"

Promise mempunyai tiga keadaan: **pending** → **fulfilled** (dengan nilai) atau **rejected** (dengan sebab). Sekali settled, keadaannya tidak berubah.

```js
// Mencipta Promise sendiri (jarang — fetch sudah memulangkan Promise)
function tunggu(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Membalut API callback lama kepada Promise
function ambilJsonP(url) {
  return new Promise((resolve, reject) => {
    ambilJson(url, (err, data) => (err ? reject(err) : resolve(data)));
  });
}

// Chaining: setiap then menerima pulangan then sebelumnya
fetch('http://localhost:3000/api/laporan')
  .then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);   // throw → lompat ke catch
    return res.json();                                     // pulang Promise → di-chain
  })
  .then((fc) => console.log(`${fc.features.length} laporan`))
  .catch((ralat) => console.error('Gagal:', ralat.message))
  .finally(() => console.log('Sembunyikan spinner'));
```

> ⚠️ **Lupa `return` dalam `then`** → `then` seterusnya menerima `undefined`, dan error dari Promise dalaman tidak ditangkap.

#### 3.3 `async` / `await` — Promise yang dibaca seperti kod synchronous

```js
async function muatLaporan() {
  const spinner = document.querySelector('#spinner');
  spinner.hidden = false;
  try {
    const res = await fetch('http://localhost:3000/api/laporan?lambat=1500');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const fc = await res.json();
    return fc.features;
  } catch (ralat) {
    console.error('Gagal memuat laporan:', ralat);
    return [];                     // default selamat untuk UI
  } finally {
    spinner.hidden = true;         // SENTIASA dijalankan — berjaya atau gagal
  }
}
```

| Peraturan | Penjelasan |
|-----------|------------|
| `async function` **sentiasa** memulangkan Promise | `muatLaporan()` → `Promise<Feature[]>`; pemanggil perlu `await` juga |
| `await` hanya dalam `async` (atau tahap atas modul) | `<script type="module">` membenarkan *top-level await* |
| `throw` dalam `async` = Promise di-reject | Ditangkap oleh `try…catch` pemanggil atau `.catch()` |
| `finally` untuk kerja pembersihan | Sembunyi spinner, aktifkan semula butang |

> 💡 **Hari 2 S3:** cuba `?gagal=1` (paksa 500) dan `?lambat=3000` pada URL di atas. Perhatikan spinner tetap disembunyikan oleh `finally` dalam kedua-dua kes.

---

### 4. Sequential vs parallel

```js
// ❌ SEQUENTIAL — jumlah masa = 1s + 1s + 1s = 3s (ketiga-tiganya bebas antara satu sama lain!)
const zon = await dapatkanLapisan('sempadan-zon');
const sungai = await dapatkanLapisan('sungai');
const kemudahan = await dapatkanLapisan('kemudahan');

// ✅ PARALLEL — mulakan semua, tunggu bersama: ≈ 1s
const [zon2, sungai2, kemudahan2] = await Promise.all([
  dapatkanLapisan('sempadan-zon'),
  dapatkanLapisan('sungai'),
  dapatkanLapisan('kemudahan'),
]);
```

Guna **sequential** hanya jika request kedua **memerlukan** hasil pertama (cth POST laporan → dapat `id` → GET `/api/laporan/:id`).

> ⚠️ **`await` dalam `forEach` tidak menunggu.** `ids.forEach(async (id) => await padamLaporan(id))` memulakan semua dan terus ke baris seterusnya. Guna `for…of` (sequential) atau `await Promise.all(ids.map(padamLaporan))` (parallel).

---

### 5. Pengumpul Promise

| Method | Resolve bila | Reject bila | Guna dalam GeoLapor |
|--------|--------------|--------------|---------------------|
| `Promise.all([...])` | **Semua** berjaya → array nilai (ikut susunan input) | **Satu** gagal (serta-merta) | Kategori + laporan + statistik — semua perlu untuk paparan awal |
| `Promise.allSettled([...])` | Semua settled (berjaya atau gagal) | Tidak pernah | 3 layer rujukan — papar yang berjaya, amaran untuk yang gagal |
| `Promise.race([...])` | **Pertama** settled (berjaya **atau** gagal) | Pertama gagal | Tamat masa manual (lama; kini guna `AbortSignal.timeout`) |
| `Promise.any([...])` | **Pertama berjaya** | Semua gagal → `AggregateError` | Cuba beberapa tile server/mirror, guna yang terpantas |

```js
const ID_LAPISAN = ['sempadan-zon', 'sungai', 'kemudahan'];

const keputusan = await Promise.allSettled(ID_LAPISAN.map((id) => dapatkanLapisan(id)));

keputusan.forEach((k, i) => {
  if (k.status === 'fulfilled') {
    tambahLapisan(ID_LAPISAN[i], k.value);           // k.value = FeatureCollection
  } else {
    notis(`Lapisan ${ID_LAPISAN[i]} gagal: ${k.reason.message}`);
  }
});
// Satu layer gagal TIDAK menghalang dua lagi dipaparkan.
```

Output disahkan (Node 22+): `allSettled` memulangkan `[{ status: 'fulfilled', value }, { status: 'rejected', reason }]`; `Promise.any` dengan semua gagal akan throw `AggregateError` dengan `errors` sebagai array.

---

### 6. Pembatalan & tamat masa: `AbortController`

#### 6.1 Kenapa batal?

Pengguna menaip "papan" dalam carian → 5 request dihantar. Jawapan untuk "pa" mungkin tiba **selepas** jawapan "papan" (rangkaian tidak menjamin susunan) → senarai menunjukkan hasil yang salah. Penyelesaian: **batalkan** request lama sebelum menghantar yang baharu.

```js
let pengawalCari = null;

async function cari(q) {
  pengawalCari?.abort();                    // batal request sebelumnya (jika ada)
  pengawalCari = new AbortController();
  try {
    const res = await fetch(`http://localhost:3000/api/laporan?q=${encodeURIComponent(q)}&lambat=800`, {
      signal: pengawalCari.signal,
    });
    const fc = await res.json();
    paparSenarai(fc.features);
  } catch (ralat) {
    if (ralat.name === 'AbortError') return;  // dibatalkan sengaja — BUKAN error untuk pengguna
    notis('Carian gagal');
  }
}
```

#### 6.2 Tamat masa

```js
// Moden (Chrome 103+, Node 17.3+): isyarat yang batal sendiri selepas N ms
try {
  const res = await fetch('http://localhost:3000/api/laporan?lambat=10000', {
    signal: AbortSignal.timeout(5000),
  });
} catch (ralat) {
  if (ralat.name === 'TimeoutError') notis('Pelayan terlalu lambat (5 s)');
  else if (ralat.name === 'AbortError') { /* dibatal pengguna */ }
  else notis('Rangkaian gagal');           // TypeError: Failed to fetch
}

// Gabung: batal oleh pengguna ATAU tamat masa (Chrome 116+, Node 20.3+)
const pengawal = new AbortController();
const isyarat = AbortSignal.any([pengawal.signal, AbortSignal.timeout(5000)]);
```

| `ralat.name` | Punca | Tindakan UI |
|--------------|-------|-------------|
| `AbortError` | `controller.abort()` dipanggil | Senyap |
| `TimeoutError` | `AbortSignal.timeout(ms)` tamat | "Pelayan lambat, cuba lagi" |
| `TypeError` | Network error, CORS, server mati | "Tidak dapat menghubungi pelayan" |

Inilah apa yang dibungkus oleh `mintaJson(laluan, { method, body, signal, timeoutMs })` dalam `services/api.js`: ia menerima `signal` pemanggil, menambah tamat masa `timeoutMs`, dan menukar semua error di atas kepada `ApiError(mesej, status, medan)`. Butiran penuh dalam Nota 06 (Edaran Hari 2) §8.

---

### 7. Corak berguna

#### 7.1 Tunggu + cuba semula (retry) dengan backoff

```js
const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

async function denganCubaSemula(fn, { cubaan = 3, asasMs = 300 } = {}) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (ralat) {
      const bolehUlang = ralat.status === undefined || ralat.status >= 500;  // rangkaian/5xx sahaja
      if (i >= cubaan || !bolehUlang) throw ralat;
      await tunggu(asasMs * 2 ** (i - 1));          // 300, 600, 1200 ms …
    }
  }
}
// const fc = await denganCubaSemula(() => senaraiLaporan());
```

> ⚠️ **Jangan retry POST secara automatik** — anda mungkin mencipta laporan pendua jika request pertama sebenarnya berjaya tetapi jawapan hilang. Retry hanya untuk GET (idempotent) — lihat Nota 06 (Edaran Hari 2) §9.

#### 7.2 Error yang tidak ditangkap

```js
// Promise di-reject tanpa catch → "Uncaught (in promise)" dalam console
muatLaporan();                    // jika muatLaporan throw, tiada siapa tangkap

// Jaring keselamatan global (Hari 5) — log, jangan ganti try…catch
window.addEventListener('unhandledrejection', (e) => {
  console.error('Promise tidak ditangkap:', e.reason);
});
```

---

### ⚠️ Kesilapan lazim

| Kesilapan | Gejala | Pembetulan |
|-----------|--------|------------|
| Lupa `await` | `fc.features` → `undefined`; console menunjukkan `Promise {<pending>}` | `await` setiap panggilan async |
| `await` dalam fungsi bukan `async` | `SyntaxError: await is only valid in async functions` | Tandakan fungsi `async` |
| `await` sequential untuk kerja bebas | Muat 3× lebih lambat | `Promise.all` |
| `forEach(async …)` | Kod terus berjalan sebelum selesai | `for…of` atau `Promise.all(map)` |
| `Promise.all` untuk layer pilihan | Satu gagal → semua hilang | `allSettled` |
| Anggap `fetch` akan throw pada 404/500 | Tiada error, data pelik | Semak `res.ok` (lihat nota 06) |
| Papar `AbortError` kepada pengguna | Notis "Ralat" setiap kali menaip | `if (ralat.name === 'AbortError') return;` |
| Tiada `finally` | Spinner kekal selepas error | Sembunyi dalam `finally` |
| Retry POST | Laporan pendua | Retry GET / 5xx sahaja |

---

### Rujukan rasmi

- MDN — Asynchronous JavaScript (pengenalan): <https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Async_JS>
- MDN — Using promises: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises>
- MDN — `async function`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/async_function>
- MDN — `Promise.allSettled()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled>
- MDN — `Promise.any()`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/any>
- MDN — `AbortController`: <https://developer.mozilla.org/en-US/docs/Web/API/AbortController>
- MDN — `AbortSignal.timeout()`: <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/timeout_static>
- MDN — In depth: Microtasks and the JavaScript runtime environment: <https://developer.mozilla.org/en-US/docs/Web/API/HTML_DOM_API/Microtask_guide/In_depth>
- HTML Standard — Event loops: <https://html.spec.whatwg.org/multipage/webappapis.html#event-loops>

### Digunakan pada Hari N

| Hari | Sesi | Bahagian nota |
|------|------|---------------|
| 2 | S1 · Asynchronous Programming Concepts | §1–2 (event loop, task/microtask), §3.1 (callback hell) |
| 2 | S2 · Promise Handling | §3.2 (mencipta & chaining), §5 (`all/allSettled/race/any`) → muat 3 layer GeoJSON serentak |
| 2 | S3 · Async / Await Syntax | §3.3 (`try…catch…finally`), §4 (sequential vs parallel) — simulasi `?lambat=` & `?gagal=` |
| 2 | S4 · Fetch API Integration | §6 (`AbortController`, `AbortSignal.timeout`) → `mintaJson` |
| 3 | S3 · Event Handling | §6.1 (batal carian lama) |
| 5 | S1 · State Management | §7.1 (retry), §7.2 (`unhandledrejection`) |

---

## 06 · HTTP, REST & Fetch API — Bekerja dengan API Secara Profesional

> Nota topikal (rujukan merentas hari) · Indeks: `README.md`
> Nota ini ialah **nota paling penting** untuk benang API kursus. Ia dirujuk dari Hari 2 hingga Hari 5.

### Objektif nota

- **Menerangkan** anatomi request & response HTTP (method, URL, header, badan, kod status) dan **memetakan** setiap endpoint GeoLapor kepada method REST yang betul.
- **Menulis** panggilan `fetch` untuk GET/POST/PATCH/DELETE dengan header, badan JSON, semakan `res.ok`, tamat masa dan pembatalan — dan **membungkusnya** dalam `mintaJson()` + `ApiError`.
- **Menerangkan** CORS (termasuk preflight `OPTIONS`) dan **mendiagnos** CORS error dalam DevTools.
- **Membandingkan** corak pengesahan (API key, Bearer/JWT, cookie sesi) dan **menerangkan** kenapa key sebenar tidak boleh berada dalam kod frontend.
- **Menguji** setiap endpoint dengan `curl`, Postman / Thunder Client atau fail `.http` sebelum menulis kod UI.

---

### 1. Kenapa API ialah benang utama kursus?

Sistem geospatial moden jarang berdiri sendiri. Peta di browser mengambil **laporan** dari satu API, **layer** dari GeoServer, **data terbuka** dari `api.data.gov.my`, dan menghantar **kemas kini** kembali. Frontend yang baik:

1. tahu **apa** yang diminta (method + URL + query + header + badan),
2. tahu **apa** yang boleh dijawab (kod status + badan JSON + header),
3. mengendali **setiap jenis kegagalan** dengan mesej yang berguna kepada pengguna,
4. boleh **diuji tanpa UI** (curl/Postman) supaya pepijat dapat dipisahkan: *server* atau *browser*?

```mermaid
sequenceDiagram
    participant UI as UI (borang/peta)
    participant S as services/api.js
    participant F as fetch()
    participant API as Mock API :3000
    UI->>S: ciptaLaporan({ tajuk, kategori, lat, lng })
    S->>F: POST /api/laporan + header + JSON
    F->>API: HTTP request
    API-->>F: 201 + Feature  /  422 { ralat, medan }
    F-->>S: Response
    S-->>UI: Feature  /  throw ApiError(mesej, 422, medan)
```

---

### 2. Anatomi HTTP

```http
POST /api/laporan?lambat=500 HTTP/1.1          ← method · laluan · query
Host: localhost:3000
Content-Type: application/json                 ← jenis badan yang DIHANTAR
Accept: application/json                       ← jenis badan yang DIMAHU
X-API-Key: latihan-pgn-2026                    ← pengesahan (latihan)

{"tajuk":"Longkang tersumbat","kategori":"utiliti","catatan":"","lat":2.9264,"lng":101.6958}
```

```http
HTTP/1.1 201 Created                           ← kod status
Content-Type: application/json
Access-Control-Allow-Origin: *                 ← CORS

{"type":"Feature","id":"LPR-0041","geometry":{…},"properties":{…}}
```

#### 2.1 Method & REST

**REST** = sumber (*resource*) dikenal pasti oleh URL; method HTTP menyatakan **tindakan**.

| Method | Maksud | Idempotent? | Selamat? | GeoLapor |
|--------|--------|-------------|----------|----------|
| `GET` | Baca | ✅ | ✅ (tiada perubahan) | `GET /api/laporan`, `/api/laporan/:id`, `/api/kategori`, `/api/lapisan/:id`, `/api/statistik` |
| `POST` | Cipta (server jana ID) | ❌ (2× = 2 rekod) | ❌ | `POST /api/laporan` → 201 |
| `PUT` | Ganti keseluruhan | ✅ | ❌ | (tidak digunakan) |
| `PATCH` | Kemas kini sebahagian | ⚠️ biasanya | ❌ | `PATCH /api/laporan/:id` `{ status }` → 200 |
| `DELETE` | Padam | ✅ | ❌ | `DELETE /api/laporan/:id` → 204 |
| `OPTIONS` | Tanya kebenaran (CORS preflight) | ✅ | ✅ | Dihantar **browser**, bukan anda |

**Idempotent** = menghantar dua kali memberi keadaan akhir yang sama. Ini menentukan apa yang **selamat untuk dicuba semula** (§9).

#### 2.2 Kod status

| Kod | Nama | Bila | Tindakan frontend |
|-----|------|------|-------------------|
| **200** | OK | GET/PATCH berjaya | Guna badan |
| **201** | Created | POST berjaya | Guna `Feature` baharu (ada `id`) |
| **204** | No Content | DELETE berjaya | **Jangan** `res.json()` — tiada badan |
| 301/302/307/308 | Redirect | URL berpindah | `fetch` ikut secara automatik |
| 304 | Not Modified | Cache sah (ETag) | Browser urus |
| **400** | Bad Request | JSON rosak, query tidak sah | Pepijat kod — log |
| **401** | Unauthorized | Tiada / salah key (`X-API-Key`) | "Sila log masuk" / semak key |
| **403** | Forbidden | Dikenal pasti tetapi tiada kebenaran | "Anda tiada akses" |
| **404** | Not Found | `LPR-9999` tiada / URL salah | "Laporan tidak dijumpai" |
| 405 | Method Not Allowed | `DELETE /api/kategori` | Pepijat kod |
| 409 | Conflict | Versi bercanggah | Muat semula & cuba lagi |
| **422** | Unprocessable Content | Validasi gagal → `{ ralat, medan }` | Papar error **di sebelah medan** borang |
| 429 | Too Many Requests | Had kadar (cth Nominatim 1 req/s) | Tunggu (`Retry-After`) |
| **500** | Internal Server Error | Pepijat server / `?gagal=1` | "Ralat pelayan, cuba lagi" — boleh retry |
| 502/503/504 | Bad Gateway / Unavailable / Timeout | Proksi / server sibuk | Boleh retry dengan backoff |

> 💡 **Ingat julat:** 2xx berjaya · 3xx pergi ke tempat lain · **4xx salah anda** (klien) · **5xx salah server**. `res.ok` = `true` untuk 200–299 sahaja.

#### 2.3 Header penting

| Header | Arah | Contoh | Nota |
|--------|------|--------|------|
| `Content-Type` | Kedua-dua | `application/json`, `application/geo+json` | **Wajib** bila menghantar badan JSON |
| `Accept` | Request | `application/json` | Minta format tertentu |
| `X-API-Key` | Request | `latihan-pgn-2026` | Header tersuai (awalan `X-` konvensyen lama) |
| `Authorization` | Request | `Bearer eyJhbGci…` | Standard untuk token |
| `Access-Control-Allow-Origin` | Response | `*` / `http://localhost:5173` | CORS (§5) |
| `Cache-Control`, `ETag` | Response | `max-age=3600` | Cache layer statik |
| `Retry-After` | Response | `2` | Untuk 429/503 |
| `Link` | Response | `<…?mula=20>; rel="next"` | Pagination (§7) |
| `User-Agent` | Request | (browser tetapkan) | Nominatim memerlukan pengenalan aplikasi |

---

### 3. `fetch` — asas yang betul

#### 3.1 GET dengan query

```js
const API = 'http://localhost:3000';

const qs = new URLSearchParams({ kategori: 'infrastruktur', status: 'baharu', had: '20' });
qs.set('bbox', [101.60, 2.88, 101.75, 2.98].join(','));  // minLng,minLat,maxLng,maxLat (koma → %2C, server nyahkod)
qs.set('q', 'papan tanda');                               // ruang dikod → 'papan+tanda'

const res = await fetch(`${API}/api/laporan?${qs}`);
if (!res.ok) throw new Error(`HTTP ${res.status}`);       // ⚠️ fetch TIDAK throw pada 404/500
const fc = await res.json();                               // FeatureCollection
console.log(fc.features.length);
```

> ⚠️ **Dua langkah, dua `await`.** `fetch()` selesai apabila **header** tiba; `res.json()` membaca dan mem-parse **badan**. Badan hanya boleh dibaca **sekali** (`res.json()` kemudian `res.text()` → `TypeError: body used already`).

#### 3.2 POST JSON

```js
const res = await fetch(`${API}/api/laporan`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',          // tanpa ini server tidak tahu badan ialah JSON
    'X-API-Key': 'latihan-pgn-2026',
  },
  body: JSON.stringify({                          // ⚠️ mesti string, bukan objek
    tajuk: 'Longkang tersumbat',
    kategori: 'utiliti',
    catatan: 'Air bertakung selepas hujan.',
    lat: 2.9264,
    lng: 101.6958,
  }),
});
if (res.status === 422) {
  const { ralat, medan } = await res.json();      // { tajuk: 'Tajuk wajib diisi', … }
}
```

API membenarkan POST menerima `{ tajuk, kategori, catatan, lat, lng }` **atau** `Feature` penuh (lihat `projek/api/README.md`). Borang biasanya menghantar bentuk rata; import fail menghantar `Feature`.

#### 3.3 PATCH & DELETE

```js
await fetch(`${API}/api/laporan/LPR-0001`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json', 'X-API-Key': 'latihan-pgn-2026' },
  body: JSON.stringify({ status: 'dalam-tindakan' }),   // HANYA medan yang berubah
});

const r = await fetch(`${API}/api/laporan/LPR-0001`, {
  method: 'DELETE',
  headers: { 'X-API-Key': 'latihan-pgn-2026' },
});
r.status;          // → 204 — jangan panggil r.json()
```

---

### 4. Membungkus: `services/api.js` (Hari 2 S4)

Kenapa satu modul? Kerana **setiap** komponen UI tidak patut tahu tentang URL asas, header, key, tamat masa, atau cara membaca badan error. Satu pintu = satu tempat untuk dibaiki, diuji dan diganti (cth bila bertukar dari mock API ke API sebenar).

```js
// src/services/api.js — satu-satunya pintu ke API
const API_ASAS = import.meta.env?.VITE_API_URL ?? 'http://localhost:3000'; // Hari 4: .env Vite
const KUNCI_API = 'latihan-pgn-2026';        // ⚠️ key LATIHAN sahaja — lihat §6

export class ApiError extends Error {
  /**
   * @param {string} mesej  mesej mesra pengguna (BM)
   * @param {number} status kod HTTP; 0 = rangkaian / tamat masa
   * @param {Record<string,string>|null} medan error validasi 422 ikut medan
   */
  constructor(mesej, status = 0, medan = null) {
    super(mesej);
    this.name = 'ApiError';
    this.status = status;
    this.medan = medan;
  }
  get bolehCubaSemula() {                     // rangkaian, 429, 5xx
    return this.status === 0 || this.status === 429 || this.status >= 500;
  }
}

export async function mintaJson(laluan, { method = 'GET', body, signal, timeoutMs = 8000 } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (method !== 'GET') headers['X-API-Key'] = KUNCI_API;

  // Gabung isyarat pemanggil (batal) + tamat masa
  const isyarat = [signal, AbortSignal.timeout(timeoutMs)].filter(Boolean);

  let res;
  try {
    res = await fetch(`${API_ASAS}${laluan}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.any(isyarat),
    });
  } catch (ralat) {
    if (ralat.name === 'AbortError') throw ralat;          // dibatal sengaja — biar pemanggil abaikan
    if (ralat.name === 'TimeoutError') {
      throw new ApiError(`Pelayan tidak menjawab dalam ${timeoutMs / 1000} saat`, 0);
    }
    throw new ApiError('Tidak dapat menghubungi pelayan. Semak sambungan atau mock API.', 0);
  }

  if (res.status === 204) return null;                     // DELETE berjaya — tiada badan

  const teks = await res.text();                           // baca SEKALI, parse sendiri
  let data = null;
  if (teks) {
    try {
      data = JSON.parse(teks);
    } catch {
      throw new ApiError(`Respons bukan JSON (HTTP ${res.status})`, res.status);
    }
  }

  if (!res.ok) {
    throw new ApiError(data?.ralat ?? `Permintaan gagal (HTTP ${res.status})`, res.status, data?.medan ?? null);
  }
  return data;
}

// ---- Satu fungsi bagi setiap endpoint ----
export function senaraiLaporan(penapis = {}, { signal } = {}) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(penapis)) {          // langkau nilai kosong
    if (v !== undefined && v !== null && v !== '') qs.set(k, Array.isArray(v) ? v.join(',') : String(v));
  }
  const s = qs.toString();
  return mintaJson(`/api/laporan${s ? `?${s}` : ''}`, { signal });
}
export const dapatkanLaporan = (id) => mintaJson(`/api/laporan/${encodeURIComponent(id)}`);
export const ciptaLaporan = (data) => mintaJson('/api/laporan', { method: 'POST', body: data });
export const kemaskiniLaporan = (id, tampalan) =>
  mintaJson(`/api/laporan/${encodeURIComponent(id)}`, { method: 'PATCH', body: tampalan });
export const padamLaporan = (id) => mintaJson(`/api/laporan/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const senaraiKategori = () => mintaJson('/api/kategori');
export const senaraiLapisan = () => mintaJson('/api/lapisan');
export const dapatkanLapisan = (id) => mintaJson(`/api/lapisan/${encodeURIComponent(id)}`);
export const dapatkanStatistik = () => mintaJson('/api/statistik');
```

Kod ini diuji terhadap server mock (Node 22+): 404 → `ApiError(…, 404)`; 422 → `medan = { tajuk: '…' }`; `?gagal=1` → status 500, `bolehCubaSemula === true`; tamat masa → status 0; halaman HTML → "Respons bukan JSON"; DELETE → `null`; batal → `AbortError` di-throw semula.

Penggunaan di UI:

```js
import { ciptaLaporan, ApiError } from './services/api.js';

try {
  const baharu = await ciptaLaporan({ tajuk, kategori, catatan, lat, lng });
  notis(`Laporan ${baharu.id} dihantar`);
} catch (ralat) {
  if (ralat instanceof ApiError && ralat.status === 422) paparRalatMedan(ralat.medan);  // nota 07
  else notis(ralat.message, 'ralat');
}
```

> 💡 **Kenapa `res.text()` + `JSON.parse` dan bukan terus `res.json()`?** Supaya kita boleh (a) mengendali badan kosong, dan (b) memberi mesej jelas bila server memulangkan HTML (punca `Unexpected token '<'`).

---

### 5. CORS — kenapa browser menyekat, bukan server

**Same-origin policy:** skrip dari `http://localhost:5173` (Vite) tidak boleh membaca response dari `http://localhost:3000` (API) — asal (*origin* = skema + hos + port) berbeza — **kecuali** server membenarkannya melalui header CORS.

```mermaid
sequenceDiagram
    participant P as Browser (localhost:5173)
    participant A as API (localhost:3000)
    Note over P: fetch POST + Content-Type: application/json + X-API-Key
    P->>A: OPTIONS /api/laporan (preflight)<br/>Origin, Access-Control-Request-Method: POST<br/>Access-Control-Request-Headers: content-type, x-api-key
    A-->>P: 204 · Access-Control-Allow-Origin: *<br/>Allow-Methods: GET,POST,PATCH,DELETE<br/>Allow-Headers: Content-Type, X-API-Key
    P->>A: POST /api/laporan (sebenar)
    A-->>P: 201 · Access-Control-Allow-Origin: *
```

| Request | Preflight? |
|------------|-----------|
| `GET` tanpa header tersuai | Tidak ("simple request") |
| `POST` dengan `Content-Type: application/json` | **Ya** |
| Mana-mana dengan `X-API-Key` atau `Authorization` | **Ya** |
| `PATCH`, `DELETE` | **Ya** |

**Fakta penting:**

1. CORS dikuatkuasa oleh **browser**. `curl` dan Postman tidak peduli CORS — jadi "berfungsi di Postman, gagal di browser" hampir selalu CORS.
2. CORS error **tidak boleh dibaiki dari frontend**. Server mesti menghantar header, **atau** request dihantar melalui proksi pada asal yang sama.
3. Dalam JavaScript, CORS error kelihatan sebagai `TypeError: Failed to fetch` tanpa butiran (sengaja, atas sebab keselamatan). Butiran penuh ada dalam **console** dan tab **Network**.
4. Mock API kursus menghantar `Access-Control-Allow-Origin: *` supaya anda boleh fokus pada JS.

#### Proksi dev Vite (apabila API tiada CORS)

```js
// vite.config.js — browser bercakap dengan :5173; Vite meneruskan ke server
import { defineConfig } from 'vite';
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000',                        // /api/laporan → :3000/api/laporan
      '/geoserver': { target: 'http://geoserver.dalaman.test:8080', changeOrigin: true },
    },
  },
});
```

Dengan proksi, `VITE_API_URL` boleh jadi kosong dan kod memanggil `/api/laporan` (asal sama). Dalam produksi, peranan ini dimainkan oleh **reverse proxy** (Nginx/Apache/IIS) jabatan — corak biasa untuk mengintegrasi GeoServer atau API dalaman PGN tanpa membuka CORS (lihat Nota 08 (Edaran Hari 3)).

> ⚠️ **`mode: 'no-cors'` bukan penyelesaian.** Ia menghasilkan response *opaque*: `res.ok === false`, `status === 0`, badan kosong. Request "berjaya" tetapi anda tidak boleh membaca apa-apa.

---

### 6. Corak pengesahan (auth)

| Corak | Bagaimana | Kelebihan | Risiko / nota |
|-------|-----------|-----------|---------------|
| **API key** dalam header (`X-API-Key`) | Key statik untuk aplikasi | Mudah; sesuai server-ke-server | Key dalam JS frontend = **awam**. Sesiapa boleh buka DevTools → Sources/Network dan salin |
| **Bearer token / JWT** (`Authorization: Bearer …`) | Pengguna log masuk → server beri token bertempoh | Per pengguna, tamat tempoh, boleh ditarik balik (dengan usaha) | Simpan di memori; `localStorage` terdedah kepada XSS; perlu *refresh* |
| **Cookie sesi** (`HttpOnly; Secure; SameSite`) | Server set cookie; browser hantar automatik | JS tidak boleh baca (`HttpOnly`) → tahan XSS | Perlu perlindungan CSRF; `fetch(url, { credentials: 'include' })` untuk asal lain |
| **OAuth 2.0 / OIDC** (SSO jabatan) | Log masuk melalui pembekal identiti | Satu log masuk, MFA | Konfigurasi lebih kompleks; guna pustaka rasmi |
| **Backend-for-Frontend (BFF) / proksi** | Browser → server anda → API luar (server tambah key) | Key sebenar **tidak pernah** sampai ke browser | Perlu komponen server (Node.js, PHP, dll.) |

#### Kenapa `latihan-pgn-2026` "dibenarkan" dalam kursus?

Ia **key palsu untuk mock API tempatan** — tiada data sebenar, tiada perkhidmatan berbayar. Tujuannya mengajar **mekanik** header dan kod 401. Dalam sistem sebenar:

- **Jangan sekali-kali** letak key rahsia (Google Maps berbayar, API key dalaman, kata laluan DB) dalam JS frontend, `.env` Vite (`VITE_*` **dimasukkan ke dalam bundle** — awam!), atau repositori Git.
- Key yang *memang* awam (cth key peta yang dihadkan kepada domain anda) mesti dihadkan di konsol pembekal (*referrer restriction*, kuota).
- Key rahsia tinggal di **server** (proksi/BFF). Frontend hanya menghantar identiti pengguna (cookie/token).

```js
// Bearer token (corak — bukan untuk mock API)
const res = await fetch('/api/laporan', {
  headers: { Authorization: `Bearer ${tokenDalamMemori}` },
});
if (res.status === 401) arahkanKeLogMasuk();

// Cookie sesi merentas asal
await fetch('https://api.dalaman.test/laporan', { credentials: 'include' });
```

---

### 7. Pagination

`/api/laporan` hanya ada ≈40 rekod, tetapi sistem sebenar mungkin ada 400,000 titik. Jangan muat semua sekali gus.

#### 7.1 Offset (`had` + `mula`) — digunakan mock API

```js
// Halaman 3 dengan 20 rekod sehalaman → mula = (3 - 1) × 20 = 40
const halaman = 3, saizHalaman = 20;
const fc = await senaraiLaporan({ had: saizHalaman, mula: (halaman - 1) * saizHalaman });

// Ambil SEMUA halaman (hati-hati — hanya untuk set kecil/eksport)
async function semuaLaporan(penapis = {}, had = 50) {
  const semua = [];
  for (let mula = 0; ; mula += had) {
    const { features } = await senaraiLaporan({ ...penapis, had, mula });
    semua.push(...features);
    if (features.length < had) break;          // halaman tidak penuh = halaman terakhir
  }
  return semua;
}
```

| Jenis | Contoh | Kelebihan | Kelemahan |
|-------|--------|-----------|-----------|
| **Offset** | `?had=20&mula=40` | Mudah; boleh lompat ke halaman N | Rekod baharu semasa menyelak → pendua/tertinggal; lambat pada offset besar |
| **Cursor** | `?had=20&selepas=LPR-0040` | Stabil, pantas | Tiada lompat ke halaman N |
| **Header `Link`** (RFC 8288) | `Link: <…?mula=60>; rel="next"` | Server beritahu URL seterusnya | Perlu parse header |
| **Spatial (bbox)** | `?bbox=minLng,minLat,maxLng,maxLat` | Muat hanya kawasan yang kelihatan di peta | Muat semula setiap `moveend` (guna debounce — Hari 5) |

```js
// Membaca header Link (jika API menyediakannya — cth GitHub API)
function pautanSeterusnya(res) {
  const link = res.headers.get('Link') ?? '';
  return link.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
}
```

---

### 8. Taksonomi error → `ApiError`

Setiap kegagalan mesti dipetakan kepada **satu** bentuk yang UI faham.

| Jenis error | Bagaimana dikesan | `ApiError.status` | Mesej UI (contoh) | Retry? |
|-------------|-------------------|-------------------|-------------------|--------|
| **Network** (server mati, CORS, DNS, luar talian) | `fetch` throw `TypeError` | `0` | "Tidak dapat menghubungi pelayan" | ✅ (GET) |
| **Tamat masa** | `TimeoutError` dari `AbortSignal.timeout` | `0` | "Pelayan tidak menjawab dalam 8 saat" | ✅ (GET) |
| **Dibatal** | `AbortError` | — (dibaling semula, bukan `ApiError`) | *(senyap)* | ❌ |
| **401 / 403** | `res.status` | `401` / `403` | "Kunci API tidak sah" / "Tiada akses" | ❌ |
| **404** | `res.status` | `404` | "Laporan tidak dijumpai" | ❌ |
| **422 validasi** | `res.status` + badan `{ ralat, medan }` | `422`, `medan` diisi | Error di sebelah setiap medan | ❌ (baiki input) |
| **429** | `res.status` | `429` | "Terlalu banyak permintaan" | ✅ selepas `Retry-After` |
| **5xx** | `res.status` | `500–504` | "Ralat pelayan, cuba sebentar lagi" | ✅ (GET) |
| **Parse** (HTML/badan rosak) | `JSON.parse` throw | status asal | "Respons bukan JSON" | ❌ (pepijat konfigurasi) |

> 💡 **Status `0`** ialah konvensyen kursus untuk "tiada response HTTP langsung". Ia membezakan "server kata tidak" (4xx/5xx) daripada "server tidak dapat dihubungi".

---

### 9. Cuba semula (retry) dengan backoff — hanya bila selamat

```js
import { ApiError } from './services/api.js';

const tunggu = (ms) => new Promise((r) => setTimeout(r, ms));

/** Cuba semula fn() untuk error sementara sahaja (rangkaian, 429, 5xx). */
export async function denganCubaSemula(fn, { cubaan = 3, asasMs = 400 } = {}) {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (ralat) {
      const sementara = ralat instanceof ApiError && ralat.bolehCubaSemula;
      if (!sementara || i >= cubaan) throw ralat;
      const jeda = asasMs * 2 ** (i - 1) + Math.random() * 100;   // backoff eksponen + jitter
      console.warn(`Cubaan ${i} gagal (${ralat.status}); cuba lagi dalam ${Math.round(jeda)} ms`);
      await tunggu(jeda);
    }
  }
}

// ✅ GET — idempotent
const fc = await denganCubaSemula(() => senaraiLaporan({ kategori: 'tanah' }));
// ❌ JANGAN: denganCubaSemula(() => ciptaLaporan(data))  → laporan pendua
```

**Peraturan:** retry automatik hanya untuk **GET (dan PUT/DELETE yang benar-benar idempotent)** dan hanya untuk **error sementara** (0, 429, 5xx). Jangan retry 4xx — request yang sama akan gagal sama. Untuk POST, biar pengguna menekan "Cuba lagi" selepas melihat keadaan, atau gunakan *idempotency key* jika API menyokong.

**Jitter** (rawak kecil) mengelakkan 30 peserta kursus mencuba semula pada milisaat yang sama selepas mock API dimulakan semula.

---

### 10. Menguji API tanpa UI

Uji endpoint **dahulu**. Jika `curl` berjaya tetapi browser gagal → masalah di frontend (atau CORS). Jika `curl` pun gagal → masalah di server atau data.

#### 10.1 `curl` — semua endpoint GeoLapor

```bash
# Kesihatan
curl -s http://localhost:3000/api/kesihatan

# Kategori & layer
curl -s http://localhost:3000/api/kategori
curl -s http://localhost:3000/api/lapisan
curl -s http://localhost:3000/api/lapisan/sempadan-zon | head -c 300

# Senarai dengan penapis (petik URL — & ialah aksara khas shell)
curl -s "http://localhost:3000/api/laporan?kategori=infrastruktur&status=baharu&had=5&mula=0"
curl -s "http://localhost:3000/api/laporan?bbox=101.66,2.90,101.72,2.95"
curl -s -G http://localhost:3000/api/laporan --data-urlencode "q=papan tanda"   # kod ruang untuk anda

# Satu laporan + 404
curl -s -i http://localhost:3000/api/laporan/LPR-0001
curl -s -i http://localhost:3000/api/laporan/LPR-9999        # → 404 {"ralat": "…"}

# Cipta — tanpa key (401), tidak sah (422), sah (201)
curl -s -i -X POST http://localhost:3000/api/laporan \
  -H "Content-Type: application/json" \
  -d '{"tajuk":"Ujian curl","kategori":"utiliti","catatan":"","lat":2.9264,"lng":101.6958}'
curl -s -i -X POST http://localhost:3000/api/laporan \
  -H "Content-Type: application/json" -H "X-API-Key: latihan-pgn-2026" \
  -d '{"tajuk":"","kategori":"bukan-kategori","lat":101.6958,"lng":2.9264}'
curl -s -i -X POST http://localhost:3000/api/laporan \
  -H "Content-Type: application/json" -H "X-API-Key: latihan-pgn-2026" \
  -d '{"tajuk":"Ujian curl","kategori":"utiliti","catatan":"Dari terminal","lat":2.9264,"lng":101.6958}'

# Kemas kini status & padam (ganti LPR-0041 dengan id yang dipulangkan di atas)
curl -s -X PATCH http://localhost:3000/api/laporan/LPR-0041 \
  -H "Content-Type: application/json" -H "X-API-Key: latihan-pgn-2026" \
  -d '{"status":"dalam-tindakan"}'
curl -s -i -X DELETE http://localhost:3000/api/laporan/LPR-0041 -H "X-API-Key: latihan-pgn-2026"   # → 204

# Statistik
curl -s http://localhost:3000/api/statistik

# Mod pengajaran: kependaman & kegagalan
curl -s -w "\nmasa: %{time_total}s\n" "http://localhost:3000/api/laporan?lambat=2000" -o /dev/null
curl -s -i "http://localhost:3000/api/laporan?gagal=1"            # → 500

# Lihat preflight CORS seperti browser
curl -s -i -X OPTIONS http://localhost:3000/api/laporan \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: content-type,x-api-key"
```

**Windows (PowerShell):**

```powershell
$api   = 'http://localhost:3000'
$kunci = @{ 'X-API-Key' = 'latihan-pgn-2026' }
$jenis = 'application/json; charset=utf-8'
# Nota: untuk 4xx/5xx Windows PowerShell membaling ralat → try { … } catch { kod status; badan }

# Kesihatan
Invoke-RestMethod "$api/api/kesihatan"

# Kategori & layer
Invoke-RestMethod "$api/api/kategori"
Invoke-RestMethod "$api/api/lapisan"
(Invoke-WebRequest -UseBasicParsing "$api/api/lapisan/sempadan-zon").Content.Substring(0, 300)

# Senarai dengan penapis (petik URL — & juga aksara khas dalam PowerShell)
Invoke-RestMethod "$api/api/laporan?kategori=infrastruktur&status=baharu&had=5&mula=0"
Invoke-RestMethod "$api/api/laporan?bbox=101.66,2.90,101.72,2.95"
Invoke-RestMethod "$api/api/laporan" -Body @{ q = 'papan tanda' }   # GET + -Body hashtable → query string dikodkan

# Satu laporan + 404
$r = Invoke-WebRequest -UseBasicParsing "$api/api/laporan/LPR-0001"; $r.StatusCode; $r.Content
try { Invoke-WebRequest -UseBasicParsing "$api/api/laporan/LPR-9999" } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }   # → 404 {"ralat": "…"}

# Cipta — tanpa key (401), tidak sah (422), sah (201)
$tanpaKunci = @{ tajuk = 'Ujian curl'; kategori = 'utiliti'; catatan = ''; lat = 2.9264; lng = 101.6958 } | ConvertTo-Json -Depth 10
$tidakSah   = @{ tajuk = ''; kategori = 'bukan-kategori'; lat = 101.6958; lng = 2.9264 } | ConvertTo-Json -Depth 10
$sah        = @{ tajuk = 'Ujian curl'; kategori = 'utiliti'; catatan = 'Dari terminal'; lat = 2.9264; lng = 101.6958 } | ConvertTo-Json -Depth 10
try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$api/api/laporan" -ContentType $jenis -Body $tanpaKunci } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
try { Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$api/api/laporan" -Headers $kunci -ContentType $jenis -Body $tidakSah } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }
$r = Invoke-WebRequest -UseBasicParsing -Method Post -Uri "$api/api/laporan" -Headers $kunci -ContentType $jenis -Body $sah
$r.StatusCode; $r.Headers['Location']; $r.Content

# Kemas kini status & padam (ganti LPR-0041 dengan id yang dipulangkan di atas)
Invoke-RestMethod -Method Patch -Uri "$api/api/laporan/LPR-0041" -Headers $kunci -ContentType $jenis `
  -Body (@{ status = 'dalam-tindakan' } | ConvertTo-Json -Depth 10)
(Invoke-WebRequest -UseBasicParsing -Method Delete -Uri "$api/api/laporan/LPR-0041" -Headers $kunci).StatusCode   # → 204

# Statistik
Invoke-RestMethod "$api/api/statistik"

# Mod pengajaran: kependaman & kegagalan
"masa: {0}s" -f (Measure-Command { Invoke-WebRequest -UseBasicParsing "$api/api/laporan?lambat=2000" }).TotalSeconds
try { Invoke-WebRequest -UseBasicParsing "$api/api/laporan?gagal=1" } catch { $_.Exception.Response.StatusCode.value__; $_.ErrorDetails.Message }   # → 500

# Lihat preflight CORS seperti browser
$r = Invoke-WebRequest -UseBasicParsing -Method Options -Uri "$api/api/laporan" -Headers @{
  'Origin'                         = 'http://localhost:5173'
  'Access-Control-Request-Method'  = 'POST'
  'Access-Control-Request-Headers' = 'content-type,x-api-key'
}
$r.StatusCode; $r.Headers
```

| Pilihan `curl` | Maksud |
|----------------|--------|
| `-s` | Senyap (tiada bar kemajuan) |
| `-i` | Tunjuk header response (lihat kod status!) |
| `-X METHOD` | Method HTTP |
| `-H "K: V"` | Header |
| `-d '…'` | Badan (memaksa POST jika tiada `-X`) |
| `-G --data-urlencode` | Tambah query yang dikod ke URL GET |
| `-w "%{http_code}"` | Cetak kod status / masa |

> 💡 **Windows:** dalam PowerShell, `curl` mungkin alias `Invoke-WebRequest`. Guna `curl.exe` dan petikan berganda dengan `\"` di dalam JSON, atau gunakan Git Bash / fail `.http` di bawah.

> 💡 Salurkan output melalui `| npx --yes json` atau `| python -m json.tool` untuk JSON yang kemas (atau `jq` jika dipasang).

#### 10.2 VS Code REST Client — fail `.http` (disyorkan)

Pasang sambungan **REST Client** (Huachao Mao). Simpan fail berikut sebagai `projek/api/geolapor.http`; klik *Send Request* di atas setiap blok.

```http
@asas = http://localhost:3000
@kunci = latihan-pgn-2026

### Kesihatan
GET {{asas}}/api/kesihatan

### Senarai ditapis
GET {{asas}}/api/laporan?kategori=infrastruktur&had=5

### Cipta laporan
# @name cipta
POST {{asas}}/api/laporan
Content-Type: application/json
X-API-Key: {{kunci}}

{
  "tajuk": "Ujian REST Client",
  "kategori": "tanah",
  "catatan": "Dari fail .http",
  "lat": 2.9264,
  "lng": 101.6958
}

### Kemas kini laporan yang baru dicipta (guna id dari response di atas)
PATCH {{asas}}/api/laporan/{{cipta.response.body.id}}
Content-Type: application/json
X-API-Key: {{kunci}}

{ "status": "selesai" }

### Padam
DELETE {{asas}}/api/laporan/{{cipta.response.body.id}}
X-API-Key: {{kunci}}
```

Fail `.http` ialah **dokumentasi hidup** — simpan dalam Git bersama kod.

#### 10.3 Postman & Thunder Client

| Alat | Kelebihan | Nota |
|------|-----------|------|
| **Postman** | Koleksi, environment variable, skrip ujian, dokumentasi | Aplikasi berasingan; ciri penuh memerlukan akaun |
| **Thunder Client** | Dalam VS Code, ringan, GUI mirip Postman | Beberapa ciri (koleksi dalam Git) kini berbayar |
| **REST Client** (`.http`) | Teks biasa, boleh di-commit, percuma | Tiada GUI — itulah kelebihannya |
| **DevTools → Network** | Lihat request **sebenar** browser (header, CORS, masa) | Klik kanan → *Copy as cURL* untuk ulang dalam terminal |

Aliran yang disyorkan dalam Postman/Thunder Client: cipta *environment* `asas = http://localhost:3000`, `kunci = latihan-pgn-2026`; simpan request dalam koleksi "GeoLapor"; tambah ujian ringkas (Postman *Tests*: `pm.response.to.have.status(201)`).

> 💡 **Copy as cURL** (DevTools → Network → klik kanan request) ialah cara terpantas untuk menghasilkan semula pepijat browser dalam terminal — dan untuk menghantar laporan pepijat yang tepat kepada pasukan backend.

---

### 11. API awam: `api.data.gov.my`

Portal data terbuka kerajaan Malaysia menyediakan API REST tanpa key, dengan CORS dibuka (`Access-Control-Allow-Origin: *`, disemak September 2026).

```js
// Penduduk Selangor, tahun terkini dahulu (nilai dalam ribu)
const url = new URL('https://api.data.gov.my/data-catalogue/');   // ⚠️ garis condong di hujung
url.search = new URLSearchParams({
  id: 'population_state',
  filter: 'Selangor@state',        // nilai@lajur
  sort: '-date',                   // '-' = menurun
  limit: '5',
});

try {
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const baris = await res.json();  // array objek
  console.table(baris.map(({ date, age, population }) => ({ date, age, population })));
} catch (ralat) {
  console.warn('data.gov.my tidak dapat dicapai — guna mock API:', ralat.message);
}
```

> ⚠️ Tanpa `/` di hujung (`/data-catalogue?id=…`), server memulangkan **301** ke `/data-catalogue/?id=…`. `fetch` mengikutnya secara automatik, tetapi ia satu perjalanan rangkaian tambahan — tulis URL penuh.

> ⚠️ **Bilik latihan mungkin tiada internet stabil.** Semua lab boleh disiapkan dengan mock API sahaja; contoh ini ialah ⭐ cabaran. Untuk Nominatim (geocoding): maksimum 1 request/saat, kenal pasti aplikasi anda, dan jangan guna untuk geocoding pukal.

---

### ⚠️ Kesilapan lazim

| Kesilapan | Gejala | Pembetulan |
|-----------|--------|------------|
| Anggap `fetch` throw pada 404/500 | Kod "berjaya" dengan data error | Semak `res.ok` (atau guna `mintaJson`) |
| `body: objek` tanpa `JSON.stringify` | Server terima `[object Object]` → 400/422 | `JSON.stringify(badan)` |
| Lupa `Content-Type: application/json` | Server tidak parse badan → 422 "tajuk wajib" walaupun diisi | Tambah header |
| `res.json()` pada 204 | `SyntaxError: Unexpected end of JSON input` | Semak `status === 204` |
| `Unexpected token '<'` | Server pulang HTML (404 Vite, halaman error) | Semak URL/`VITE_API_URL` dalam tab Network |
| Membaca badan dua kali | `body used already` | Baca sekali, simpan dalam variable |
| Membina query dengan `+` string | `q=papan & tiang` memecahkan URL | `URLSearchParams` / `encodeURIComponent` |
| Hantar `lat`/`lng` terbalik | 422 atau titik di luar Malaysia | `dalamMalaysia([lng, lat])` sebelum hantar |
| Cuba "baiki" CORS di frontend | `no-cors` → response kosong | Header CORS di server atau proksi |
| Key sebenar dalam `VITE_*` | Key terdedah dalam bundle | Key di server (BFF/proksi) |
| Retry POST secara automatik | Laporan pendua | Retry GET + error sementara sahaja |
| Tiada tamat masa | Spinner berputar selama-lamanya | `AbortSignal.timeout(timeoutMs)` |
| PATCH menghantar keseluruhan objek | Menimpa medan yang diubah orang lain | Hantar medan yang berubah sahaja |

---

### Rujukan rasmi

- MDN — HTTP overview: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview>
- MDN — HTTP response status codes: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Status>
- MDN — HTTP request methods: <https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Methods>
- MDN — Using the Fetch API: <https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch>
- MDN — `Response.ok`: <https://developer.mozilla.org/en-US/docs/Web/API/Response/ok>
- MDN — `URLSearchParams`: <https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams>
- MDN — Cross-Origin Resource Sharing (CORS): <https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CORS>
- MDN — `AbortSignal.any()`: <https://developer.mozilla.org/en-US/docs/Web/API/AbortSignal/any_static>
- RFC 9110 — HTTP Semantics: <https://www.rfc-editor.org/rfc/rfc9110>
- RFC 8288 — Web Linking (header `Link`): <https://www.rfc-editor.org/rfc/rfc8288>
- OWASP — REST Security Cheat Sheet: <https://cheatsheetseries.owasp.org/cheatsheets/REST_Security_Cheat_Sheet.html>
- Vite — `server.proxy`: <https://vite.dev/config/server-options#server-proxy>
- curl — manual: <https://curl.se/docs/manpage.html>
- VS Code REST Client: <https://marketplace.visualstudio.com/items?itemName=humao.rest-client>
- Thunder Client: <https://www.thunderclient.com/>
- Postman — Learning Center: <https://learning.postman.com/>
- data.gov.my — Dokumentasi API: <https://developer.data.gov.my/>
- Nominatim — Usage Policy: <https://operations.osmfoundation.org/policies/nominatim/>

### Digunakan pada Hari N

| Hari | Sesi | Bahagian nota |
|------|------|---------------|
| 2 | S1 · Asynchronous Programming Concepts | §1–2 (HTTP, REST, kod status) — mock API dihidupkan; §10.1 (`curl`) |
| 2 | S3 · Async / Await Syntax | §8 (taksonomi error) dengan `?lambat=` & `?gagal=` |
| 2 | S4 · Fetch API Integration | §3 (GET/POST/PATCH/DELETE), §4 (`services/api.js` + `ApiError`), §7 (pagination `had`/`mula`), §10.2–10.3 (`.http`, Postman/Thunder Client), §11 ⭐ |
| 3 | S4 · Form Handling | §3.2 & §8 (422 + `medan`) → paparan error borang |
| 4 | S2 · Module Bundlers & Build Tools | §4 (`import.meta.env.VITE_API_URL`), §5 (proksi Vite), §6 (`VITE_*` adalah awam) |
| 5 | S1 · State Management | §9 (retry), §8 (rollback optimistic update bila `ApiError`) |
| 5 | S2 · Modern Frontend Architecture | §5–6 (CORS, proksi, auth ke API sistem sedia ada) |
