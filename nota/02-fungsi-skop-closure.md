# 02 · Fungsi, Scope, Hoisting & Closure

> Nota topikal (rujukan merentas hari) · Indeks: [`README.md`](./README.md)

## Objektif nota

- **Menulis** fungsi dalam tiga bentuk (deklarasi, ungkapan, arrow) dan **memilih** bentuk yang sesuai.
- **Menggunakan** default parameter, rest parameter dan nilai pulangan (termasuk memulangkan objek).
- **Menerangkan** scope global/fungsi/blok, hoisting dan *Temporal Dead Zone* (TDZ), dan **meramal** output kod `var` vs `let` dalam loop.
- **Membina** closure untuk menyimpan keadaan peribadi (pembilang ID, cache, `debounce`).
- **Menerangkan** perbezaan `this` dalam fungsi biasa vs arrow function.

---

## 1. Kenapa fungsi?

Tanpa fungsi, kiraan jarak antara dua laporan akan disalin di lima tempat. Apabila formula perlu dibaiki, anda perlu ingat kelima-limanya. Fungsi memberi:

1. **Nama** kepada satu idea (`jarakKm` lebih jelas daripada 6 baris trigonometri).
2. **Satu tempat** untuk dibaiki dan diuji (`node --test` Hari 5).
3. **Guna semula** — modul `utils/geo.js` Hari 1 digunakan sehingga Hari 5.

> **Fungsi yang baik:** satu tugas, nama kata kerja, input melalui parameter, output melalui `return`, **tiada kesan sampingan tersembunyi** (tidak mengubah variable luar secara senyap).

---

## 2. Tiga bentuk fungsi

```js
// 1. Deklarasi fungsi — di-hoist sepenuhnya (boleh dipanggil sebelum ditulis)
function formatKoordinat([lng, lat], perpuluhan = 5) {
  return `${lat.toFixed(perpuluhan)}, ${lng.toFixed(perpuluhan)}`;
}

// 2. Ungkapan fungsi — nilai yang disimpan dalam variable
const labelKategori = function (kod) {
  return kod.replace('-', ' ');
};

// 3. Arrow function (ES6) — ringkas; tiada `this`/`arguments` sendiri
const keRad = (darjah) => (darjah * Math.PI) / 180;
const kuasaDua = (x) => x * x;                     // return tersirat
const cipta = (tajuk) => ({ tajuk, status: 'baharu' }); // ⚠️ objek perlu dalam ( )
```

| Bentuk | Hoisting | `this` sendiri | Guna bila |
|--------|----------|----------------|-----------|
| Deklarasi `function f() {}` | Ya (boleh panggil sebelum) | Ya | Fungsi utama modul (`export function jarakKm`) |
| Ungkapan `const f = function () {}` | Tidak (TDZ) | Ya | Jarang; bila perlu nama dalaman untuk rekursi |
| Arrow `const f = () => {}` | Tidak (TDZ) | **Tidak** — ambil dari luar | Callback (`map`, `filter`, `addEventListener`, `then`) |

> ⚠️ **Arrow yang memulangkan objek:** `() => { tajuk: 'x' }` memulangkan `undefined` — `{` dibaca sebagai blok, `tajuk:` sebagai *label*. Balut dengan kurungan: `() => ({ tajuk: 'x' })`.

---

## 3. Parameter & nilai pulangan

### 3.1 Default parameter

```js
function senaraiUrl(had = 20, mula = 0) {
  return `/api/laporan?had=${had}&mula=${mula}`;
}
senaraiUrl();          // → '/api/laporan?had=20&mula=0'
senaraiUrl(10);        // → '/api/laporan?had=10&mula=0'
senaraiUrl(undefined, 40); // → '/api/laporan?had=20&mula=40'
senaraiUrl(null);      // → '/api/laporan?had=null&mula=0'  ⚠️ null TIDAK mencetuskan default
```

Nilai default hanya digunakan apabila argumen `undefined` (tidak dihantar), bukan `null` atau `0`.

### 3.2 Objek pilihan (options object) + destructuring

Apabila fungsi ada lebih daripada 2–3 parameter pilihan, susunan jadi sukar diingat. Guna **satu objek**:

```js
// ❌ tapisLaporan(features, 'tanah', '', 'runtuh') — apa maksud '' ?
// ✅ nama parameter kelihatan di tempat panggilan
function tapisLaporan(features, { kategori = '', status = '', q = '' } = {}) {
  const cari = q.trim().toLowerCase();
  return features.filter(({ properties: p }) =>
    (!kategori || p.kategori === kategori) &&
    (!status || p.status === status) &&
    (!cari || p.tajuk.toLowerCase().includes(cari)));
}

tapisLaporan(features, { kategori: 'tanah', q: 'runtuh' });
tapisLaporan(features);   // `= {}` di hujung membolehkan panggilan tanpa objek
```

Corak yang sama digunakan oleh `mintaJson(laluan, { method, body, signal, timeoutMs })` dalam `services/api.js` (Hari 2).

### 3.3 Parameter rest

```js
function gabungId(...ids) {           // ids ialah ARRAY sebenar
  return ids.join(',');
}
gabungId('LPR-0001', 'LPR-0002');     // → 'LPR-0001,LPR-0002'

function log(tahap, ...mesej) {
  console[tahap]('[GeoLapor]', ...mesej); // spread semula semasa memanggil
}
log('warn', 'Lapisan', 'sungai', 'lambat dimuat');
```

### 3.4 `return` — satu nilai, tetapi boleh jadi objek

```js
function statistikRingkas(features) {
  const jumlah = features.length;
  const selesai = features.filter((f) => f.properties.status === 'selesai').length;
  return { jumlah, selesai, peratus: jumlah ? Math.round((selesai / jumlah) * 100) : 0 };
}
const { jumlah, peratus } = statistikRingkas(features);
```

> ⚠️ **`return` di baris sendiri:** `return` diikuti baris baharu → JavaScript memasukkan `;` secara automatik (ASI) dan memulangkan `undefined`. Mulakan nilai pada baris yang sama dengan `return`.
> ```js
> return          // ❌ → return;
>   { ok: true };
> return {        // ✅
>   ok: true,
> };
> ```

---

## 4. Scope

**Scope** = kawasan kod di mana sesuatu nama boleh dilihat.

| Scope | Dicipta oleh | `let`/`const` | `var` |
|------|--------------|---------------|-------|
| Global | Fail skrip klasik | Global | Global + jadi `window.x` |
| Modul | Setiap fail `type="module"` | Scope modul (tidak bocor) | Scope modul |
| Fungsi | `function`, arrow | Dalam fungsi | Dalam fungsi |
| Blok | `{ }` — `if`, `for`, `while` | **Dalam blok** | ⚠️ Bocor keluar blok |

```js
function semak(laporan) {
  if (laporan.status === 'baharu') {
    var mesejVar = 'var bocor keluar blok';
    let mesejLet = 'let kekal dalam blok';
  }
  console.log(mesejVar);   // → 'var bocor keluar blok'
  console.log(mesejLet);   // ❌ ReferenceError: mesejLet is not defined
}
```

Scope **bersarang** membentuk *scope chain*: kod dalam boleh melihat variable luar, bukan sebaliknya.

```js
const API_ASAS = 'http://localhost:3000';        // scope modul
function urlLaporan(id) {
  const laluan = `/api/laporan/${id}`;            // scope fungsi
  return `${API_ASAS}${laluan}`;                  // nampak API_ASAS (luar)
}
console.log(laluan);                              // ❌ ReferenceError
```

> 💡 **Setiap modul ES mempunyai scope sendiri.** `const API_ASAS` dalam `api.js` tidak bertembung dengan `API_ASAS` dalam `main.js`. Ini sebab utama kita guna `type="module"` sejak Hari 1: tiada lagi pencemaran global.

---

## 5. Hoisting & Temporal Dead Zone

Sebelum kod berjalan, enjin mendaftarkan semua pengisytiharan dalam scope ("hoisting"). Tetapi setiap jenis diperlakukan berbeza:

```js
console.log(sapa('Aina'));     // ✅ 'Salam, Aina' — deklarasi fungsi di-hoist PENUH
function sapa(nama) { return `Salam, ${nama}`; }

console.log(x);                // undefined — var di-hoist, NILAI tidak
var x = 5;

console.log(y);                // ❌ ReferenceError: Cannot access 'y' before initialization
let y = 5;                     //    y wujud tetapi dalam TDZ sehingga baris ini

console.log(kira(2));          // ❌ ReferenceError — const + arrow = TDZ juga
const kira = (n) => n * 2;
```

**TDZ** (Temporal Dead Zone) ialah tempoh dari awal scope hingga baris pengisytiharan `let`/`const`. Error TDZ adalah **baik**: ia memberitahu anda terus, berbanding `var` yang diam-diam memberi `undefined`.

---

## 6. `var` dalam loop — soalan temu duga klasik

```js
const pemasaVar = [];
for (var i = 0; i < 3; i++) {
  pemasaVar.push(() => i);
}
console.log(pemasaVar.map((f) => f()));  // → [3, 3, 3]  satu `i` dikongsi

const pemasaLet = [];
for (let j = 0; j < 3; j++) {
  pemasaLet.push(() => j);
}
console.log(pemasaLet.map((f) => f()));  // → [0, 1, 2]  `j` baharu setiap pusingan
```

Dalam GeoLapor: jika anda memasang `click` pada 40 marker dalam loop `var`, **setiap** marker akan membuka laporan terakhir. Dengan `let` (atau `for…of` + `const`), setiap marker ingat laporannya sendiri.

---

## 7. Closure

**Closure** = fungsi + variable dari scope di mana ia **dicipta**, yang kekal hidup walaupun fungsi luar sudah selesai.

### 7.1 Keadaan peribadi

```js
function ciptaPenjanaId(awalan) {
  let kiraan = 0;                       // peribadi — tiada siapa boleh ubah dari luar
  return () => {
    kiraan += 1;
    return `${awalan}-${String(kiraan).padStart(4, '0')}`;
  };
}

const idDraf = ciptaPenjanaId('DRAF');
idDraf();   // → 'DRAF-0001'
idDraf();   // → 'DRAF-0002'
const idLain = ciptaPenjanaId('UJI');
idLain();   // → 'UJI-0001'   (closure berasingan)
```

> Ini **idea yang sama** dengan `ciptaStore(keadaanAwal)` Hari 5: `keadaan` dan `pelanggan` disimpan dalam closure; dunia luar hanya boleh menggunakan `dapat()`, `set()` dan `langgan()`. Lihat [nota 13](./13-state-dan-arkitektur.md).

### 7.2 Cache ringkas (memoization)

```js
function ciptaCache(fungsiAmbil) {
  const simpanan = new Map();               // closure
  return async (kunci) => {
    if (simpanan.has(kunci)) return simpanan.get(kunci);
    const nilai = await fungsiAmbil(kunci);
    simpanan.set(kunci, nilai);
    return nilai;
  };
}
// const dapatkanLapisanCache = ciptaCache(dapatkanLapisan);
// await dapatkanLapisanCache('sungai'); // panggilan kedua tiada fetch
```

### 7.3 `debounce` — tunggu pengguna berhenti menaip

Kotak carian `q` memanggil `/api/laporan?q=…`. Tanpa debounce, menaip "sempadan" menghantar **8 request**.

```js
function debounce(fn, tunggu = 300) {
  let pemasa;                               // closure: diingat antara panggilan
  return (...args) => {
    clearTimeout(pemasa);                   // batalkan panggilan sebelumnya
    pemasa = setTimeout(() => fn(...args), tunggu);
  };
}

// const cariDebounce = debounce((q) => muatLaporan({ q }), 300);
// inputCari.addEventListener('input', (e) => cariDebounce(e.target.value));
```

Digunakan semula pada Hari 5 (prestasi peta: `moveend` → muat ikut `bbox`).

---

## 8. `this` — ringkas dan praktikal

`this` dalam fungsi biasa ditentukan oleh **cara fungsi dipanggil**, bukan di mana ia ditulis. Arrow function **tiada** `this` sendiri — ia mengambil `this` dari scope luar.

```js
const pengira = {
  jumlah: 0,
  tambahBiasa() {
    [1, 2, 3].forEach(function (n) {
      // this di sini BUKAN pengira (undefined dalam strict mode)
    });
  },
  tambahArrow() {
    [1, 2, 3].forEach((n) => {
      this.jumlah += n;           // ✅ this = pengira (diambil dari tambahArrow)
    });
  },
};
pengira.tambahArrow();
pengira.jumlah;                   // → 6
```

> 💡 **Dalam kursus ini** kita jarang perlukan `this`: modul kita menggunakan fungsi biasa + closure, bukan kelas. Pengecualian: `class ApiError extends Error` (Hari 2) dan pustaka seperti Leaflet (`L.Map`). Jika `this` mengelirukan, itu tanda baik untuk guna fungsi biasa dengan parameter.

> ⚠️ **Event listener:** dalam `el.addEventListener('click', function () { this })`, `this` ialah elemen. Dalam versi arrow, `this` ialah scope luar. Gunakan `event.currentTarget` — jelas dan tidak bergantung pada bentuk fungsi.

---

## 9. Fungsi tulen (pure) vs kesan sampingan

```js
// ❌ tidak tulen — bergantung & mengubah keadaan luar
let semuaLaporan = [];
function tambahLaporan(f) {
  semuaLaporan.push(f);         // mutasi global
}

// ✅ tulen — input sama → output sama; tiada mutasi
function denganLaporan(senarai, f) {
  return [...senarai, f];       // array BAHARU
}
```

Fungsi tulen mudah **diuji** (`assert.deepEqual(denganLaporan([], f), [f])`), mudah **difahami**, dan selamat digunakan dalam store Hari 5. Semua fungsi dalam `utils/geo.js` (`jarakKm`, `tapisLaporan`, `kiraIkut`, `bboxDari`, `dalamMalaysia`, `formatKoordinat`) adalah tulen.

---

## ⚠️ Kesilapan lazim

| Kesilapan | Gejala | Pembetulan |
|-----------|--------|------------|
| `() => { a: 1 }` | Pulang `undefined` | `() => ({ a: 1 })` |
| Lupa `return` dalam fungsi berbadan `{ }` | `undefined` di tempat panggilan | Tambah `return`, atau guna arrow ringkas tanpa `{}` |
| `return` diikuti baris baharu | `undefined` | Mula nilai di baris `return` |
| Panggil `const f = () => …` sebelum ditulis | `Cannot access 'f' before initialization` | Susun semula, atau guna deklarasi `function` |
| `var` dalam loop + callback | Semua callback nampak nilai terakhir | `let` / `for…of` dengan `const` |
| Harap `null` mencetuskan default parameter | `had=null` dalam URL | Hantar `undefined` atau guna `??` dalam badan fungsi |
| Fungsi mengubah array input | Data dalam store/senarai berubah senyap | Pulang salinan (`[...arr]`, `{...obj}`) |
| Guna `this` dalam arrow sebagai method objek | `this` = `undefined` | Method biasa `nama() {}` untuk method objek |

---

## 📖 Bacaan buku

> *JavaScript All-in-One For Dummies* (Minnick, 2023) — pengayaan selepas nota ini. Halaman PDF = muka surat cetak + 24.
>
> - **Fungsi, parameter default/rest, arrow function, hoisting** — B1 · Bab 8 (Writing and Running Functions), *Functions: An Introduction; Writing Functions; Declaring Anonymous functions* — ms. 140–154 (**PDF 164–178**)
> - **`let`/`const`, jenis data, scope** — B1 · Bab 3 (Using Data), *Making Variables with let; Making Constants with const; Taking a Look at the Data Types; Getting a Handle on Scope* — ms. 63–80 (**PDF 87–104**)


## Rujukan rasmi

- MDN — Functions (guide): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Functions>
- MDN — Arrow function expressions: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Arrow_functions>
- MDN — Default parameters: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/Default_parameters>
- MDN — Rest parameters: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/rest_parameters>
- MDN — Closures: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures>
- MDN — Hoisting: <https://developer.mozilla.org/en-US/docs/Glossary/Hoisting>
- MDN — `let` (Temporal Dead Zone): <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let>
- MDN — `this`: <https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this>

## Digunakan pada Hari N

| Hari | Sesi | Bahagian nota |
|------|------|---------------|
| 1 | S1 · Variable Management & Scope | §4 (scope), §5 (hoisting, TDZ), §6 (`var` vs `let` dalam loop) |
| 1 | S2 · Modern Strings & Functions | §2 (tiga bentuk), §3 (default, objek pilihan, rest, return), §7.1 (closure), §9 (fungsi tulen) → `formatKoordinat()`, `jarakKm()` |
| 2 | S4 · Fetch API Integration | §3.2 (objek pilihan `mintaJson(laluan, {…})`), §7.2 (cache) |
| 3 | S3 · Event Handling | §6 (marker dalam loop), §7.3 (`debounce` carian), §8 (`this` vs `currentTarget`) |
| 5 | S1 · State Management | §7.1 (closure → `ciptaStore`), §9 (fungsi tulen → selector) |
