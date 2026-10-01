// ─────────────────────────────────────────────────────────────────────────────
// Latihan 05 — S1 · Optimistic update dengan rollback: tukarStatus (state/tindakan.js)
// Jalankan: node latihan-05.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B mengikut apa-apa susunan.
// Rujukan: hari-5/README.md §1.4 (immutable) · §1.9 (optimistic update)
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// SEDIA: store pub/sub (README §1.3 — anda menulisnya sendiri dalam latihan-01.js).
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

// SEDIA: gantiLaporanSedia — versi siap Bahagian A, supaya Bahagian B berdiri sendiri.
const gantiLaporanSedia = (senarai, id, fn) => senarai.map((f) => (f.id === id ? fn(f) : f));

// SEDIA: data sintetik.
const laporan = (id, status) => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [101.69, 2.92] },
  properties: { id, status, kategori: 'tanah', tajuk: `Laporan ${id}` },
});
const keadaanAwal = () => ({
  laporan: [laporan('LPR-0001', 'baharu'), laporan('LPR-0002', 'baharu')],
  penapis: { kategori: '', status: '', q: '' },
  dipilihId: null,
  memuat: false,
  ralat: null,
  notis: null,
});

// ── A. Ganti SATU rekod tanpa mutasi ───────────────────────────────────────
// TODO A: gantiLaporan(senarai, id, fn) → array BAHARU: rekod dengan f.id === id diganti dengan fn(f),
//   rekod lain dikekalkan (rujukan sama). Array asal TIDAK diubah.
//   petua: senarai.map((f) => (f.id === id ? fn(f) : f))
function gantiLaporan(senarai, id, fn) {
  const f = senarai.find((x) => x.id === id);
  if (f) f.properties.status = fn(f).properties.status; // ← MUTASI! tulis semula tanpa mengubah `senarai`
  return senarai;
}

function bahagianA() {
  const asal = keadaanAwal().laporan;
  const baru = gantiLaporan(asal, 'LPR-0001', (f) => ({ ...f, properties: { ...f.properties, status: 'selesai' } }));
  console.log('A1', baru[0].properties.status, asal[0].properties.status); // ⇒ A1 selesai baharu
  console.log('A2', 'array baharu:', baru !== asal, '| rekod lain sama:', baru[1] === asal[1]); // ⇒ A2 array baharu: true | rekod lain sama: true
}
await jalankan(bahagianA);

// ── B. tukarStatus: optimistik → sahkan dengan server → rollback jika gagal ─
// TODO B: async tukarStatus(store, api, id, statusBaru) — README §1.9:
//   1. const asal = store.dapat().laporan.find((f) => f.id === id);  if (!asal) return;
//   2. OPTIMISTIK: store.set((s) => ({ laporan: gantiLaporanSedia(s.laporan, id, (f) => ({ ...f, properties: { ...f.properties, status: statusBaru } })) }))
//   3. try:   const dariPelayan = await api.kemaskiniLaporan(id, { status: statusBaru });
//             store.set((s) => ({ laporan: gantiLaporanSedia(s.laporan, id, () => dariPelayan) }))
//   4. catch (ralat): ROLLBACK rekod itu SAHAJA (() => asal) DAN
//             notis: { jenis: 'ralat', mesej: `Status ${id} tidak disimpan: ${ralat.message}` }
async function tukarStatus(store, api, id, statusBaru) {
  // ← tulis sendiri (pesimistik = tunggu server dahulu — itu BUKAN optimistik)
}

async function bahagianB() {
  // Berjaya: UI berubah SEBELUM server menjawab, kemudian diganti versi server.
  const store = ciptaStore(keadaanAwal());
  let semasaPatch = null;
  const api = {
    kemaskiniLaporan: async (id, data) => {
      semasaPatch = store.dapat().laporan[0].properties.status; // apa yang pengguna nampak semasa menunggu
      return { ...laporan(id, data.status), properties: { ...laporan(id, data.status).properties, dikemaskini: '2026-10-02T09:00:00Z' } };
    },
  };
  await tukarStatus(store, api, 'LPR-0001', 'selesai');
  console.log('B1', 'semasa PATCH:', semasaPatch, '| selepas:', store.dapat().laporan[0].properties.dikemaskini); // ⇒ B1 semasa PATCH: selesai | selepas: 2026-10-02T09:00:00Z

  // Gagal: optimistik → rollback + notis; rekod lain tidak disentuh.
  const store2 = ciptaStore(keadaanAwal());
  const dilihat = [];
  store2.langgan((s) => dilihat.push(s.laporan[0].properties.status));
  const apiGagal = { kemaskiniLaporan: async () => { throw new Error('Pelayan tidak dapat dihubungi'); } };
  await tukarStatus(store2, apiGagal, 'LPR-0001', 'selesai');
  console.log('B2', dilihat.join(' → '), '| LPR-0002:', store2.dapat().laporan[1].properties.status); // ⇒ B2 selesai → baharu | LPR-0002: baharu
  console.log('B3', store2.dapat().notis?.jenis, store2.dapat().notis?.mesej); // ⇒ B3 ralat Status LPR-0001 tidak disimpan: Pelayan tidak dapat dihubungi
}
await jalankan(bahagianB);
