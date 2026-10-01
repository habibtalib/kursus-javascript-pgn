// ─────────────────────────────────────────────────────────────────────────────
// Latihan 07 — S2 · Muat ikut bbox + debounce + batal request lama (utils/masa.js, ui/peta.js)
// Jalankan: node latihan-07.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C mengikut apa-apa susunan.
// Rujukan: hari-5/README.md §2.5c · Tiada peta, tiada rangkaian: sempadan & "request" di sini palsu.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}
// SEDIA: tunggu `ms` milisaat.
const tidur = (ms) => new Promise((selesai) => setTimeout(selesai, ms));

// ── A. bbox dari sempadan peta ─────────────────────────────────────────────
// TODO A: bboxDariSempadan(b) → rentetan 'minLng,minLat,maxLng,maxLat' untuk ?bbox=
//   b ialah objek seperti peta.getBounds() Leaflet: b.getWest(), b.getSouth(), b.getEast(), b.getNorth()
//   bundarkan setiap nombor: Number(n.toFixed(5)); gabung dengan ','
//   ⚠️ Kod di bawah menghantar lat dahulu — server memulangkan 0 laporan.
function bboxDariSempadan(b) {
  return [b.getSouth(), b.getWest(), b.getNorth(), b.getEast()].join(','); // ← betulkan
}

function bahagianA() {
  const sempadan = (w, s, e, n) => ({ getWest: () => w, getSouth: () => s, getEast: () => e, getNorth: () => n });
  console.log('A1', bboxDariSempadan(sempadan(101.612345678, 2.901, 101.75, 3.0000049))); // ⇒ A1 101.61235,2.901,101.75,3
  console.log('A2', bboxDariSempadan(sempadan(101.6505, 2.9012, 101.7112, 2.9395))); // ⇒ A2 101.6505,2.9012,101.7112,2.9395
}
await jalankan(bahagianA);

// ── B. debounce — hanya panggilan TERAKHIR dijalankan ──────────────────────
// TODO B: debounce(fn, ms) memulangkan fungsi (...arg) yang membatalkan pemasa sebelumnya
//   (clearTimeout) dan menjadualkan fn(...arg) selepas `ms` milisaat (setTimeout).
function debounce(fn, ms = 300) {
  return fn; // ← tulis sendiri (sekarang fn dipanggil serta-merta, setiap kali)
}

async function bahagianB() {
  const dipanggil = [];
  const d = debounce((x) => dipanggil.push(x), 100);
  d(1);
  d(2);
  d(3);
  await tidur(50);
  const sebelum = JSON.stringify(dipanggil);
  await tidur(150);
  console.log('B1', sebelum, '→', JSON.stringify(dipanggil)); // ⇒ B1 [] → [3]

  // Pan, berhenti sekejap (< 100 ms), pan lagi … kemudian berhenti lama.
  const request = [];
  const muat = debounce((bbox) => request.push(bbox), 100);
  muat('a');
  await tidur(40);
  muat('b');
  await tidur(40);
  muat('c');
  await tidur(200);
  muat('d');
  await tidur(200);
  console.log('B2', 'request:', request.join(',')); // ⇒ B2 request: c,d
}
await jalankan(bahagianB);

// SEDIA: "request" palsu — selesai selepas `ms`, atau ditolak dengan AbortError jika signal dibatalkan.
function requestPalsu(label, signal, { ms = 30, gagal = null, dibatal = [] } = {}) {
  return new Promise((ok, tolak) => {
    const pemasa = setTimeout(() => (gagal ? tolak(new Error(gagal)) : ok(label)), ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(pemasa);
      dibatal.push(label);
      tolak(new DOMException('Dibatalkan', 'AbortError'));
    });
  });
}

// ── C. Batal request lama (AbortController) ────────────────────────────────
// TODO C: muatTerkiniSahaja(muat, lukis) memulangkan async (arg) => { … } yang:
//   1. membatalkan request SEBELUMNYA yang belum selesai: pengawal?.abort()
//   2. pengawal = new AbortController();  const hasil = await muat(arg, pengawal.signal);  lukis(hasil)
//   3. AbortError BUKAN error sebenar → abaikan (jangan lukis);  error lain → lontar semula
function muatTerkiniSahaja(muat, lukis) {
  return async (arg) => {
    lukis(await muat(arg, new AbortController().signal)); // ← tulis sendiri: tiada pembatalan di sini
  };
}

async function bahagianC() {
  const dilukis = [];
  const dibatal = [];
  const m = muatTerkiniSahaja((bbox, signal) => requestPalsu(bbox, signal, { dibatal }), (hasil) => dilukis.push(hasil));
  await Promise.all([m('bbox-1'), m('bbox-2'), m('bbox-3')]);
  console.log('C1', 'dilukis:', dilukis.join(','), '| dibatal:', dibatal.join(',')); // ⇒ C1 dilukis: bbox-3 | dibatal: bbox-1,bbox-2

  const dibatal2 = [];
  const m2 = muatTerkiniSahaja((bbox, signal) => requestPalsu(bbox, signal, { gagal: 'HTTP 500', dibatal: dibatal2 }), () => {});
  const hasil = await Promise.allSettled([m2('x'), m2('y')]);
  const ralat = hasil.filter((h) => h.status === 'rejected').map((h) => h.reason.message);
  console.log('C2', 'ralat:', ralat.join(','), '| dibatal:', dibatal2.join(',')); // ⇒ C2 ralat: HTTP 500 | dibatal: x
}
await jalankan(bahagianC);
