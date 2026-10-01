// ─────────────────────────────────────────────────────────────────────────────
// Latihan 08 — S3 · Latih-tubi debugging P1–P4 + handler error global
// Jalankan: node latihan-08.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C, D, E mengikut apa-apa susunan.
// Bahagian A–D mengandungi pepijat TANAMAN dari Lab 5.3 langkah 1. Jalankan dahulu, baca output,
// cari punca (ramal panel DevTools yang akan anda guna), kemudian betulkan SATU baris.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// SEDIA: store pub/sub (README §1.3).
function ciptaStore(keadaanAwal) {
  let keadaan = { ...keadaanAwal };
  const pelanggan = new Set();
  return {
    dapat: () => keadaan,
    set(x) {
      const tampalan = typeof x === 'function' ? x(keadaan) : x;
      if (!tampalan || !Object.keys(tampalan).some((k) => !Object.is(keadaan[k], tampalan[k]))) return;
      const lama = keadaan;
      keadaan = { ...keadaan, ...tampalan };
      for (const fn of [...pelanggan]) fn(keadaan, lama);
    },
    langgan(fn) {
      pelanggan.add(fn);
      return () => pelanggan.delete(fn);
    },
  };
}
// SEDIA: data sintetik.
const laporan = (id, lng, lat) => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { id, status: 'baharu', kategori: 'tanah', tajuk: `Laporan ${id}` },
});

// ── A. P1 — "Klik laporan → peta terbang ke Artik" ─────────────────────────
// TODO A: betulkan zumKeLaporan supaya flyTo menerima [lat, lng] (GeoJSON menyimpan [lng, lat]).
function zumKeLaporan(peta, f) {
  peta.flyTo(f.geometry.coordinates, 16); // ← P1
}

function bahagianA() {
  const panggilan = [];
  const petaPalsu = { flyTo: (latlng, zum) => panggilan.push(`flyTo(${JSON.stringify(latlng)}, ${zum})`) };
  zumKeLaporan(petaPalsu, laporan('LPR-0001', 101.6958, 2.9264));
  console.log('A1', panggilan.join(' ')); // ⇒ A1 flyTo([2.9264,101.6958], 16)
}
await jalankan(bahagianA);

// ── B. P2 — "Senarai kosong; error reading 'filter'" ───────────────────────
// TODO B: betulkan muatLaporan (petua: apakah jenis `fc`? cetak dan lihat).
async function muatLaporan(store, api) {
  const fc = api.senaraiLaporan(); // ← P2
  store.set({ laporan: fc.features });
}

async function bahagianB() {
  const store = ciptaStore({ laporan: [] });
  const api = { senaraiLaporan: async () => ({ type: 'FeatureCollection', features: [laporan('LPR-0001', 101.69, 2.92), laporan('LPR-0002', 101.65, 2.92)] }) };
  await muatLaporan(store, api);
  console.log('B1', 'laporan:', store.dapat().laporan?.length); // ⇒ B1 laporan: 2
}
await jalankan(bahagianB);

// ── C. P3 — "Laporan baharu tidak muncul sehingga penapis ditukar" ─────────
// TODO C: betulkan tambahLaporan supaya pelanggan store dimaklumkan (petua: README §1.4).
function tambahLaporan(store, baru) {
  const s = store.dapat();
  s.laporan.push(baru); // ← P3
  store.set({ laporan: s.laporan });
}

function bahagianC() {
  const store = ciptaStore({ laporan: [laporan('LPR-0001', 101.69, 2.92), laporan('LPR-0002', 101.65, 2.92)] });
  let dipanggil = 0;
  store.langgan(() => dipanggil++);
  tambahLaporan(store, laporan('LPR-0003', 101.7, 2.93));
  console.log('C1', 'pelanggan dipanggil:', dipanggil, '| laporan:', store.dapat().laporan.length); // ⇒ C1 pelanggan dipanggil: 1 | laporan: 3
}
await jalankan(bahagianC);

// ── D. P4 — "Carian memulangkan keputusan pelik" ───────────────────────────
// TODO D: betulkan urlCarian supaya q dikod dengan betul (petua: URLSearchParams).
function urlCarian(q) {
  return `/api/laporan?q=${q}`; // ← P4
}

function bahagianD() {
  // Apa yang SERVER nampak sebagai q (seperti panel Network → Payload):
  const diterima = (url) => JSON.stringify(new URL(url, 'http://geolapor.test').searchParams.get('q'));
  console.log('D1', 'server menerima q =', diterima(urlCarian('Jalan 2 & 3'))); // ⇒ D1 server menerima q = "Jalan 2 & 3"
  console.log('D2', 'server menerima q =', diterima(urlCarian('sungai #1'))); // ⇒ D2 server menerima q = "sungai #1"
}
await jalankan(bahagianD);

// ── E. Handler error global — jaring keselamatan terakhir ──────────────────
// TODO E: pasangPengendaliRalat(sasaran, store) — dalam main.js, sasaran ialah objek global browser
//   (addEventListener pada window). Daftar DUA listener:
//   - 'error'              → store.set({ notis: { jenis: 'ralat', mesej: 'Ralat tidak dijangka. Sila muat semula halaman.' } })
//   - 'unhandledrejection' → store.set({ notis: { jenis: 'ralat', mesej: 'Operasi gagal. Cuba lagi.' } })
//   (dalam projek anda, log juga butiran teknikal ke console.error — README §3.2)
function pasangPengendaliRalat(sasaran, store) {
  // ← tulis sendiri
}

function bahagianE() {
  const sasaran = new EventTarget(); // pengganti objek global browser
  const store = ciptaStore({ notis: null });
  pasangPengendaliRalat(sasaran, store);
  const notis = () => (store.dapat().notis ? `${store.dapat().notis.jenis} | ${store.dapat().notis.mesej}` : 'tiada notis');

  sasaran.dispatchEvent(Object.assign(new Event('error'), { error: new Error('ujian global') }));
  console.log('E1', notis()); // ⇒ E1 ralat | Ralat tidak dijangka. Sila muat semula halaman.
  store.set({ notis: null });
  sasaran.dispatchEvent(Object.assign(new Event('unhandledrejection'), { reason: new Error('ujian promise') }));
  console.log('E2', notis()); // ⇒ E2 ralat | Operasi gagal. Cuba lagi.
}
await jalankan(bahagianE);
