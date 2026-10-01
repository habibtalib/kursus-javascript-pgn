// ─────────────────────────────────────────────────────────────────────────────
// Latihan 03 — S1 · Tindakan dengan API palsu: muatLaporan, pilih, tukarPenapis (state/tindakan.js)
// Jalankan: node latihan-03.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B mengikut apa-apa susunan.
// Tiada mock API, tiada rangkaian: `api` DISUNTIK — di sini objek palsu (README §1.6).
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

// SEDIA: data sintetik & keadaan awal.
const laporan = (id, status) => ({
  type: 'Feature',
  id,
  geometry: { type: 'Point', coordinates: [101.69, 2.92] },
  properties: { id, status, kategori: 'tanah', tajuk: `Laporan ${id}` },
});
const keadaanAwal = () => ({
  laporan: [],
  penapis: { kategori: '', status: '', q: '' },
  dipilihId: null,
  memuat: false,
  ralat: null,
  notis: null,
});
// SEDIA: key yang berubah antara dua keadaan (seperti logger store dalam Lab 5.1 langkah 6).
const keyBerubah = (baru, lama) => Object.keys(baru).filter((k) => baru[k] !== lama[k]);

// ── A. muatLaporan(store, api) ─────────────────────────────────────────────
// TODO A: async muatLaporan(store, api):
//   1. store.set({ memuat: true, ralat: null })
//   2. try: const fc = await api.senaraiLaporan();  store.set({ laporan: fc.features, memuat: false })
//   3. catch (ralat): store.set({ memuat: false, ralat: ralat.message })
async function muatLaporan(store, api) {
  // ← tulis sendiri
}

async function bahagianA() {
  const store = ciptaStore(keadaanAwal());
  const jejak = [];
  store.langgan((s) => jejak.push(s.memuat));
  const api = { senaraiLaporan: async () => ({ type: 'FeatureCollection', features: [laporan('LPR-0009', 'baharu')] }) };
  await muatLaporan(store, api);
  console.log('A1', 'memuat:', jejak.join(' → '), '| laporan:', store.dapat().laporan.length); // ⇒ A1 memuat: true → false | laporan: 1

  const storeGagal = ciptaStore(keadaanAwal());
  const apiGagal = { senaraiLaporan: async () => { throw new Error('Pelayan tidak dapat dihubungi'); } };
  await muatLaporan(storeGagal, apiGagal);
  const { memuat, ralat, laporan: senarai } = storeGagal.dapat();
  console.log('A2', memuat, ralat, senarai.length); // ⇒ A2 false Pelayan tidak dapat dihubungi 0
}
await jalankan(bahagianA);

// ── B. pilih(store, id) & tukarPenapis(store, tampalan) ────────────────────
// TODO B1: pilih(store, id) → store.set({ dipilihId: id })
// TODO B2: tukarPenapis(store, tampalan) → penapis BAHARU yang menggabungkan penapis lama + tampalan
//   petua: store.set((s) => ({ penapis: { ...s.penapis, ...tampalan } }))
//   ⚠️ JANGAN ubah s.penapis terus — store tidak akan nampak perubahan (rujukan sama).
function pilih(store, id) {
  // ← tulis sendiri
}
function tukarPenapis(store, tampalan) {
  // ← tulis sendiri
}

function bahagianB() {
  const store = ciptaStore({ ...keadaanAwal(), laporan: [laporan('LPR-0001', 'baharu'), laporan('LPR-0002', 'selesai')] });
  const log = [];
  store.langgan((baru, lama) => log.push(keyBerubah(baru, lama).join('+')));

  pilih(store, 'LPR-0002');
  console.log('B1', store.dapat().dipilihId, '| berubah:', log.join(', ')); // ⇒ B1 LPR-0002 | berubah: dipilihId

  log.length = 0;
  tukarPenapis(store, { kategori: 'tanah' });
  tukarPenapis(store, { q: 'jalan' });
  console.log('B2', JSON.stringify(store.dapat().penapis)); // ⇒ B2 {"kategori":"tanah","status":"","q":"jalan"}
  console.log('B3', 'berubah:', log.join(', ')); // ⇒ B3 berubah: penapis, penapis
}
await jalankan(bahagianB);
