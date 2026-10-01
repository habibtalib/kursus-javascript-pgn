// ─────────────────────────────────────────────────────────────────────────────
// Latihan 02 — S1 · Selector & keadaan terbitan (state/pemilih.js)
// Jalankan: node latihan-02.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C, D mengikut apa-apa susunan.
// Rujukan: hari-5/README.md §1.5 (selector) · §1.7 (peta: [lng, lat] → [lat, lng])
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// SEDIA: fungsi Hari 1 (utils/geo.js) — guna semula, jangan ubah.
function tapisLaporan(features, { kategori, status, q } = {}) {
  const cari = q?.trim().toLowerCase();
  return features.filter(({ properties: p }) => {
    if (kategori && p.kategori !== kategori) return false;
    if (status && p.status !== status) return false;
    if (cari && !p.tajuk?.toLowerCase().includes(cari)) return false;
    return true;
  });
}
function kiraIkut(features, medan) {
  return features.reduce((kiraan, { properties }) => {
    const nilai = properties?.[medan] ?? '(tiada)';
    kiraan[nilai] = (kiraan[nilai] ?? 0) + 1;
    return kiraan;
  }, {});
}

// SEDIA: data sintetik — 6 laporan. GeoJSON: coordinates = [lng, lat].
const laporan = (id, kategori, status, tajuk, lng, lat) => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [lng, lat] },
  properties: { id, kategori, status, tajuk },
});
const semua = [
  laporan('LPR-0001', 'infrastruktur', 'baharu', 'Papan tanda sempadan rosak', 101.6958, 2.9264),
  laporan('LPR-0002', 'tanah', 'baharu', 'Tanah runtuh di cerun jalan', 101.6505, 2.9223),
  laporan('LPR-0003', 'alam-sekitar', 'dalam-tindakan', 'Sungai tercemar minyak', 101.7112, 2.9395),
  laporan('LPR-0004', 'tanah', 'selesai', 'Pencerobohan tanah kerajaan', 101.6801, 2.9012),
  laporan('LPR-0005', 'utiliti', 'selesai', 'Lampu jalan padam', 101.6633, 2.9150),
  laporan('LPR-0006', 'infrastruktur', 'ditolak', 'Jalan berlubang', 101.7020, 2.9301),
];
const keadaan = { laporan: semua, penapis: { kategori: '', status: '', q: '' }, dipilihId: null };

// ── A. memoAkhir — ingat hasil terakhir ────────────────────────────────────
// TODO A: memoAkhir(fn) memulangkan fungsi (...arg) yang:
//   - memanggil fn(...arg) HANYA jika arg berbeza (rujukan ===) daripada panggilan terakhir
//   - jika sama, pulangkan hasil lama tanpa memanggil fn
function memoAkhir(fn) {
  return fn; // ← tulis sendiri (sekarang ia memanggil fn setiap kali)
}

function bahagianA() {
  let panggilan = 0;
  const tambah = memoAkhir((a, b) => {
    panggilan++;
    return a + b;
  });
  console.log('A1', tambah(1, 2), tambah(1, 2), tambah(2, 2), 'panggilan:', panggilan); // ⇒ A1 3 3 4 panggilan: 2

  const tapisMemo = memoAkhir(tapisLaporan);
  const p = { kategori: 'tanah' };
  const r1 = tapisMemo(semua, p);
  console.log('A2', r1 === tapisMemo(semua, p), r1 === tapisMemo(semua, { ...p })); // ⇒ A2 true false
}
await jalankan(bahagianA);

// ── B. pilihLaporanDitapis & pilihLaporanDipilih ───────────────────────────
// TODO B1: pilihLaporanDitapis(s) → laporan yang lulus s.penapis (guna tapisLaporan SEDIA)
// TODO B2: pilihLaporanDipilih(s) → laporan dengan id === s.dipilihId, atau null jika tiada
const pilihLaporanDitapis = (s) => []; // ← tulis sendiri
const pilihLaporanDipilih = (s) => null; // ← tulis sendiri

function bahagianB() {
  const s = { ...keadaan, penapis: { kategori: 'tanah', status: '', q: '' } };
  console.log('B1', pilihLaporanDitapis(s).map((f) => f.id).join(',')); // ⇒ B1 LPR-0002,LPR-0004
  const s2 = { ...keadaan, penapis: { kategori: '', status: '', q: 'JALAN' } };
  console.log('B2', pilihLaporanDitapis(s2).length); // ⇒ B2 3
  console.log('B3', pilihLaporanDipilih({ ...keadaan, dipilihId: 'LPR-0003' })?.properties.tajuk, '|', pilihLaporanDipilih({ ...keadaan, dipilihId: 'LPR-9999' })); // ⇒ B3 Sungai tercemar minyak | null
}
await jalankan(bahagianB);

// ── C. pilihRingkasan — statistik dari selector ────────────────────────────
// TODO C: pilihRingkasan(s) → { jumlah, dipapar, ikutStatus }
//   jumlah     = bilangan SEMUA laporan (s.laporan.length)
//   dipapar    = bilangan laporan yang lulus s.penapis   (guna tapisLaporan SEDIA)
//   ikutStatus = kiraIkut(laporan yang lulus penapis, 'status')   (SEDIA)
const pilihRingkasan = (s) => ({ jumlah: 0, dipapar: 0, ikutStatus: {} }); // ← tulis sendiri

function bahagianC() {
  const r = pilihRingkasan({ ...keadaan, penapis: { kategori: 'tanah', status: '', q: '' } });
  console.log('C1', `${r.dipapar} daripada ${r.jumlah} laporan dipapar`); // ⇒ C1 2 daripada 6 laporan dipapar
  console.log('C2', JSON.stringify(r.ikutStatus)); // ⇒ C2 {"baharu":1,"selesai":1}
  const semuaR = pilihRingkasan(keadaan);
  console.log('C3', semuaR.dipapar, JSON.stringify(semuaR.ikutStatus)); // ⇒ C3 6 {"baharu":2,"dalam-tindakan":1,"selesai":2,"ditolak":1}
}
await jalankan(bahagianC);

// ── D. Ke mana peta terbang? GeoJSON [lng, lat] → Leaflet [lat, lng] ───────
// TODO D: keLatLng(f) → [lat, lng] untuk peta.flyTo([lat, lng], 16)
//   petua: const [lng, lat] = f.geometry.coordinates;
const keLatLng = (f) => f.geometry.coordinates; // ← pepijat: ini [lng, lat]!

function bahagianD() {
  const [lat, lng] = keLatLng(semua[0]);
  console.log('D1', JSON.stringify([lat, lng]), 'lat sah:', Math.abs(lat) <= 90); // ⇒ D1 [2.9264,101.6958] lat sah: true
  console.log('D2', JSON.stringify(keLatLng(semua[2]))); // ⇒ D2 [2.9395,101.7112]
}
await jalankan(bahagianD);
