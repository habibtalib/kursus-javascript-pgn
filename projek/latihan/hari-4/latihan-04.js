// ─────────────────────────────────────────────────────────────────────────────
// Latihan 04 — S3 · Pepijat yang ESLint tangkap, dan yang ia tidak tangkap (Lab 4.3)
// Jalankan: node latihan-04.js   (atau butang Jalankan di Pelatih — tiada npm, tiada DOM)
// Kod di bawah datang dari src/semak-lint.js (Lab 4.3, langkah 3). ESLint melaporkan `no-undef` dan
// `eqeqeq` — di sini anda lihat KESAN sebenar pepijat itu apabila kod berjalan, kemudian membaikinya.
// Setiap bahagian BERDIRI SENDIRI: A, B dan C hanya guna pembantu sedia di bawah.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): jalankan fn; jika ia melempar error, pulangkan nama error itu.
function cuba(fn) {
  try {
    return fn();
  } catch (e) {
    return `ralat: ${e.name}`;
  }
}
const laporan = [
  { properties: { id: 'LPR-0001', status: 'baharu' } },
  { properties: { id: 'LPR-0002', status: 'selesai' } },
  { properties: { id: 'LPR-0005', status: 'dalam-tindakan' } },
  { properties: { id: 'LPR-0009', status: 'selesai' } },
  { properties: { id: 'LPR-0004', status: 'ditolak' } },
];

// ── A. no-undef: nama variable salah eja ─────────────────────────────────────
// ESLint: "'jumlh' is not defined  no-undef". Jalankan dahulu: apa yang berlaku?
// TODO A: baiki fungsi supaya ia memulangkan bilangan laporan yang BELUM selesai.
function kiraBelumSelesai(features) {
  let jumlah = 0;
  for (const f of features) {
    if (f.properties.status === 'selesai') continue;
    jumlah++;
  }
  return jumlh;
}

console.log('A1 belum selesai:', cuba(() => kiraBelumSelesai(laporan))); // ⇒ A1 belum selesai: 3

// ── B. eqeqeq: == menukar jenis data ─────────────────────────────────────────
// Medan keluasan borang: '' bermaksud "belum diisi"; nombor 0 ialah nilai SAH (tapak tanpa keluasan).
// ESLint: "Expected '===' and instead saw '=='  eqeqeq". RAMAL dahulu apa yang `0 == ''` pulangkan.
// TODO B: baiki supaya HANYA string kosong dianggap 'tiada'.
function statusKeluasan(nilai) {
  if (nilai == '') return 'tiada';
  return 'ada';
}

console.log('B1', ['', 0, '0', 12].map(statusKeluasan).join(' ')); // ⇒ B1 tiada ada ada ada

// ── C. Lint lulus, tetapi logik masih salah ──────────────────────────────────
// Selepas `break` yang tidak tercapai dibuang, ESLint tidak mengadu lagi. Tetapi warnaStatus('ditolak') → ?
// TODO C: lengkapkan: baharu '#dbeafe', dalam-tindakan '#fef3c7', selesai '#d1fae5', ditolak '#fee2e2',
//         selain itu (default) '#e5e7eb'.
function warnaStatus(status) {
  switch (status) {
    case 'baharu':
      return '#dbeafe';
    case 'selesai':
      return '#d1fae5';
  }
}

console.log('C1', ['baharu', 'dalam-tindakan', 'selesai', 'ditolak'].map(warnaStatus).join(' ')); // ⇒ C1 #dbeafe #fef3c7 #d1fae5 #fee2e2
console.log('C2 status tidak dikenali:', warnaStatus('rahsia')); // ⇒ C2 status tidak dikenali: #e5e7eb
