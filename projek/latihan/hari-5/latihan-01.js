// ─────────────────────────────────────────────────────────────────────────────
// Latihan 01 — S1 · Store pub/sub: ciptaStore (state/store.js)
// Jalankan: node latihan-01.js   (atau butang Jalankan dalam platform)
// Setiap bahagian BERDIRI SENDIRI: buat (dan jalankan) A, B, C, D mengikut apa-apa susunan.
// Rujukan: hari-5/README.md §1.3 (store) · §1.4 (immutable)
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan satu bahagian dan tunggu ia siap.
// Jika bahagian itu ralat, mesej dicetak dan bahagian seterusnya tetap berjalan.
async function jalankan(bahagian) {
  try {
    await bahagian();
  } catch (e) {
    console.log(`❌ ${bahagian.name}:`, e.message);
  }
}

// ── A. set(): objek separa ATAU fungsi ─────────────────────────────────────
// TODO A: kiraTampalan(keadaan, kemaskiniAtauFungsi) memulangkan TAMPALAN (objek separa):
//   - jika kemaskiniAtauFungsi ialah fungsi → panggil dengan `keadaan` dan pulangkan hasilnya
//   - jika tidak → pulangkan kemaskiniAtauFungsi seperti biasa
//   petua: typeof x === 'function'
function kiraTampalan(keadaan, kemaskiniAtauFungsi) {
  return {}; // ← tulis sendiri
}

function bahagianA() {
  const s = { kiraan: 1, memuat: false };
  console.log('A1', JSON.stringify(kiraTampalan(s, { memuat: true }))); // ⇒ A1 {"memuat":true}
  console.log('A2', JSON.stringify(kiraTampalan(s, (k) => ({ kiraan: k.kiraan + 1 })))); // ⇒ A2 {"kiraan":2}
}
await jalankan(bahagianA);

// ── B. Langkau jika tiada perubahan (Object.is setiap key) ─────────────────
// TODO B: adaPerubahan(keadaan, tampalan) → true jika SEKURANG-KURANGNYA satu key dalam `tampalan`
//   mempunyai nilai yang BUKAN rujukan sama dengan keadaan[key].
//   petua: Object.keys(tampalan).some((k) => !Object.is(keadaan[k], tampalan[k]))
function adaPerubahan(keadaan, tampalan) {
  return true; // ← tulis sendiri
}

function bahagianB() {
  const laporan = [{ id: 'LPR-0001' }];
  const s = { memuat: false, laporan };
  console.log('B1', adaPerubahan(s, { memuat: false }), adaPerubahan(s, { memuat: true })); // ⇒ B1 false true
  laporan.push({ id: 'LPR-0002' }); // MUTASI: array yang SAMA
  console.log('B2', adaPerubahan(s, { laporan }), adaPerubahan(s, { laporan: [...laporan] })); // ⇒ B2 false true
}
await jalankan(bahagianB);

// ── C. Pelanggan: langgan() memulangkan nyahlanggan ────────────────────────
// TODO C: ciptaPemancar() memulangkan { langgan(fn), terbit(...arg) }:
//   - simpan pelanggan dalam new Set()
//   - langgan(fn) menambah fn dan MEMULANGKAN fungsi yang membuang fn semula
//   - terbit(...arg) memanggil setiap pelanggan dengan arg yang sama
function ciptaPemancar() {
  return {
    langgan(fn) {
      return () => {}; // ← tulis sendiri
    },
    terbit(...arg) {},
  };
}

function bahagianC() {
  const jejak = [];
  const p = ciptaPemancar();
  const nyahA = p.langgan((n) => jejak.push(`a${n}`));
  p.langgan((n) => jejak.push(`b${n}`));
  p.terbit(1);
  console.log('C1', jejak.join(',')); // ⇒ C1 a1,b1
  nyahA();
  p.terbit(2);
  console.log('C2', jejak.join(',')); // ⇒ C2 a1,b1,b2
}
await jalankan(bahagianC);

// ── D. ciptaStore lengkap (README §1.3) ────────────────────────────────────
// TODO D: tulis ciptaStore(keadaanAwal) SENDIRI dan LENGKAP — jangan panggil fungsi A–C
//   (bahagian ini mesti berjalan walaupun A–C belum siap):
//   - let keadaan = { ...keadaanAwal }        (salinan sendiri)
//   - dapat()  → keadaan semasa
//   - set(x)   → tampalan (objek ATAU fungsi); langkau jika tiada perubahan;
//                keadaan = { ...lama, ...tampalan } (objek BAHARU); panggil setiap pelanggan fn(baru, lama)
//   - langgan(fn) → daftar; pulangkan nyahlanggan
function ciptaStore(keadaanAwal) {
  return {
    dapat() {
      return keadaanAwal; // ← salinan sendiri, bukan objek pemanggil
    },
    set(kemaskiniAtauFungsi) {},
    langgan(fn) {
      return () => {};
    },
  };
}

function bahagianD() {
  const awal = { kiraan: 0 };
  const store = ciptaStore(awal);
  awal.kiraan = 99; // mengubah objek asal TIDAK menyentuh store
  console.log('D1', store.dapat().kiraan); // ⇒ D1 0

  const jejak = [];
  const nyahlanggan = store.langgan((baru, lama) => jejak.push(`${lama.kiraan}→${baru.kiraan}`));
  store.set({ kiraan: 1 });
  store.set((s) => ({ kiraan: s.kiraan + 1 }));
  console.log('D2', jejak.join(' ')); // ⇒ D2 0→1 1→2

  store.set({ kiraan: 2 }); // tiada perubahan → pelanggan TIDAK dipanggil
  console.log('D3', jejak.length); // ⇒ D3 2

  const lama = store.dapat();
  store.set({ memuat: true });
  console.log('D4', lama === store.dapat(), lama.memuat, store.dapat().memuat); // ⇒ D4 false undefined true

  nyahlanggan();
  store.set({ kiraan: 50 }); // senyap — tiada pelanggan lagi
  console.log('D5', jejak.length, store.dapat().kiraan); // ⇒ D5 3 50
}
await jalankan(bahagianD);
