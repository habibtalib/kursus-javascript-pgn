// ─────────────────────────────────────────────────────────────────────────────
// Latihan 05 — S4 · Logik storage: JSON selamat, cache TTL, draf borang (Lab 4.4)
// Jalankan: node latihan-05.js   (atau butang Jalankan di Pelatih — tiada browser, tiada rangkaian)
// Logik yang sama anda tulis dalam projek/geolapor-mula/src/services/cache.js dan main.js. Di sini storage
// browser diganti dengan `storanPalsu()` (API sama: getItem/setItem/removeItem, nilai sentiasa STRING)
// dan jam diganti dengan nombor `sekarang` supaya hasilnya tepat setiap kali.
// Setiap bahagian BERDIRI SENDIRI: A, B dan C hanya guna pembantu sedia di bawah.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): storage palsu yang berkelakuan seperti storage browser.
function storanPalsu() {
  const data = new Map();
  return {
    getItem: (kunci) => (data.has(kunci) ? data.get(kunci) : null),
    setItem: (kunci, nilai) => data.set(kunci, String(nilai)),
    removeItem: (kunci) => data.delete(kunci),
  };
}
const JAM = 60 * 60 * 1000;

// ── A. bacaLocal / simpanLocal dengan JSON ──────────────────────────────────
// TODO A1: simpan(stor, kunci, nilai) → stor.setItem(kunci, JSON.stringify(nilai))
// TODO A2: baca(stor, kunci, lalai = null) → JSON.parse nilai; jika tiada ATAU JSON rosak → lalai
//          (balut JSON.parse dengan try…catch).
function simpan(stor, kunci, nilai) {}

function baca(stor, kunci, lalai = null) {
  return undefined;
}

const storA = storanPalsu();
simpan(storA, 'geolapor:penapis', { status: 'selesai', q: 'papan' });
console.log('A1', baca(storA, 'geolapor:penapis')); // ⇒ A1 { status: 'selesai', q: 'papan' }
simpan(storA, 'geolapor:peta', new Map([['zum', 12]]));
console.log('A2 Map selepas JSON:', baca(storA, 'geolapor:peta')); // ⇒ A2 Map selepas JSON: {}
storA.setItem('geolapor:rosak', '{tidak sah');
console.log('A3 JSON rosak:', baca(storA, 'geolapor:rosak', 'lalai'), '·', 'tiada:', baca(storA, 'geolapor:tiada', 'lalai')); // ⇒ A3 JSON rosak: lalai · tiada: lalai

// ── B. Cache dengan TTL ─────────────────────────────────────────────────────
// Rekod cache ialah { nilai, masa } — `masa` = bila disimpan (ms). TTL 24 jam, seperti cache layer Lab 4.4.
// TODO B: bacaCache(rekod, sekarang, { terimaLuput = false } = {})
//   - tiada rekod → null
//   - umur (sekarang - rekod.masa) < TTL_MS → rekod.nilai
//   - sudah luput → null, KECUALI terimaLuput (API mati: data lama lebih baik daripada peta kosong) → rekod.nilai
const TTL_MS = 24 * JAM;
function bacaCache(rekod, sekarang, { terimaLuput = false } = {}) {
  return undefined;
}

const rekod = { nilai: 'sempadan-zon (5 feature)', masa: 0 };
console.log('B1 selepas 1 jam:', bacaCache(rekod, 1 * JAM)); // ⇒ B1 selepas 1 jam: sempadan-zon (5 feature)
console.log('B2 selepas 25 jam:', bacaCache(rekod, 25 * JAM)); // ⇒ B2 selepas 25 jam: null
console.log('B3 luput + API mati:', bacaCache(rekod, 25 * JAM, { terimaLuput: true })); // ⇒ B3 luput + API mati: sempadan-zon (5 feature)
console.log('B4 tiada rekod:', bacaCache(undefined, 0)); // ⇒ B4 tiada rekod: null

// ── C. Draf borang dibuang HANYA selepas berjaya dihantar ───────────────────
// TODO C: async hantarDraf(stor, hantar):
//   1. baca draf dari stor.getItem('geolapor:draf-borang') (JSON)
//   2. await hantar(draf)
//   3. BERJAYA → stor.removeItem('geolapor:draf-borang') dan pulangkan 'dihantar'
//      GAGAL (hantar melempar error) → JANGAN buang draf; pulangkan 'gagal: ' + e.message
async function hantarDraf(stor, hantar) {
  return 'belum';
}

const draf = JSON.stringify({ tajuk: 'Longkang tersumbat', kategori: 'utiliti' });
const storC1 = storanPalsu();
storC1.setItem('geolapor:draf-borang', draf);
const hasilC1 = await hantarDraf(storC1, async (data) => ({ id: 'LPR-0041', ...data }));
console.log('C1', hasilC1, '· draf:', storC1.getItem('geolapor:draf-borang')); // ⇒ C1 dihantar · draf: null

const storC2 = storanPalsu();
storC2.setItem('geolapor:draf-borang', draf);
const hasilC2 = await hantarDraf(storC2, async () => {
  throw new Error('Failed to fetch');
});
console.log('C2', hasilC2, '· draf kekal:', storC2.getItem('geolapor:draf-borang') === draf); // ⇒ C2 gagal: Failed to fetch · draf kekal: true
