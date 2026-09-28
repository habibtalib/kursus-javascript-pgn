// ─────────────────────────────────────────────────────────────────────────────
// Latihan 04 — S3 · Destructuring, spread/rest, ?. , ?? , perbandingan ketat
// Jalankan: node latihan-04.js   atau   index.html?latihan=04
// ─────────────────────────────────────────────────────────────────────────────
import { laporanContoh } from './data/laporan-contoh.js';

// TODO 0: dengan destructuring array, ambil elemen ke-1 dan ke-3 (langkau ke-2)
const pertama = laporanContoh.features[0]; // ← tukar kepada: const [pertama, , ketiga] = ...
const ketiga = laporanContoh.features[2];
const keenam = laporanContoh.features[5]; // LPR-0006 (catatan: null)

// ── A. Destructuring ───────────────────────────────────────────────────────
// TODO A1–A2: SATU pernyataan destructuring yang mengeluarkan id, tajuk, status, lng, lat daripada `pertama`
const id = undefined;
const tajuk = undefined;
const status = undefined;
const lng = undefined;
const lat = undefined;
console.log('A1', id, tajuk, status); // ⇒ A1 LPR-0001 Papan tanda sempadan rosak baharu
console.log('A2', lng, lat); // ⇒ A2 101.6958 2.9264
console.log('A3', ketiga.id); // ⇒ A3 LPR-0003

// TODO A4: namakan semula kategori → kat; beri keutamaan nilai default 'biasa'
const kat = undefined;
const keutamaan = undefined;
console.log('A4', kat, keutamaan); // ⇒ A4 infrastruktur biasa

// TODO A5–A6: RAMAL — nilai default destructuring vs ??
const { catatan = 'Tiada catatan' } = keenam.properties;
console.log('A5', catatan); // ⇒ RAMAL: ______
console.log('A6', keenam.properties.catatan ?? 'Tiada catatan'); // ⇒ RAMAL: ______

// ── B. Destructuring dalam parameter ───────────────────────────────────────
// TODO B1: ringkas(feature) → 'LPR-0001:baharu' (destructure dalam senarai parameter)
const ringkas = (feature) => '';
console.log('B1', ringkas(pertama), ringkas(keenam)); // ⇒ B1 LPR-0001:baharu LPR-0006:dalam-tindakan

// TODO B2: keLeaflet([lng, lat]) → [lat, lng]
const keLeaflet = (koordinat) => koordinat;
console.log('B2', keLeaflet(pertama.geometry.coordinates)); // ⇒ B2 [ 2.9264, 101.6958 ]

// TODO B3: tukar nilai a dan b dalam SATU baris
let a = 2.935;
let b = 101.701;
console.log('B3', a, b); // ⇒ B3 101.701 2.935

// ── C. Spread ──────────────────────────────────────────────────────────────
// TODO C1: `dikemas` = salinan `pertama` dengan properties.status 'selesai' — TANPA mengubah `pertama`
const dikemas = pertama;
console.log('C1', pertama.properties.status, '→', dikemas.properties.status); // ⇒ C1 baharu → selesai

// TODO C2: Math.max / Math.min dengan spread atas semuaLat
const semuaLat = laporanContoh.features.slice(0, 3).map((f) => f.geometry.coordinates[1]);
console.log('C2' /* , ?, ? */); // ⇒ C2 2.9395 2.9147

// TODO C3: gabung 2 feature pertama + feature dari indeks 8 ke atas dengan [...x, ...y]
const gabung = [];
console.log('C3', gabung.length); // ⇒ C3 4

// C4–C5: RAMAL — salinan cetek vs dalam
const cetek = { ...pertama };
console.log('C4', cetek.properties === pertama.properties); // ⇒ RAMAL: ______
const dalam = structuredClone(pertama);
dalam.properties.status = 'UJI';
console.log('C5', dalam.properties === pertama.properties, pertama.properties.status); // ⇒ RAMAL: ______

// ── D. Rest dalam destructuring ────────────────────────────────────────────
// TODO D1: buang `id` dan `pelapor` daripada properties; kumpul selebihnya dalam `awam`
const awam = {};
console.log('D1', Object.keys(awam).join(',')); // ⇒ D1 tajuk,kategori,status,catatan,dicipta,dikemaskini

// ── E. Optional chaining ───────────────────────────────────────────────────
// TODO E1–E3: akses tanpa error walaupun medan tiada
console.log('E1' /* , pertama.properties.lampiran[0].url  ← ini akan RALAT; betulkan dengan ?. */); // ⇒ E1 undefined
console.log('E2' /* , … ?? 'tiada lampiran' */); // ⇒ E2 tiada lampiran
const respons = null;
console.log('E3' /* , respons.features.length ← betulkan */); // ⇒ E3 0

// ── F. ?? lawan || — RAMAL ─────────────────────────────────────────────────
const tetapan = { had: 0, tajukLalai: '' };
console.log('F1', tetapan.had || 50, tetapan.had ?? 50); // ⇒ RAMAL: ______
console.log('F2', tetapan.tajukLalai || '(tiada)', JSON.stringify(tetapan.tajukLalai ?? '(tiada)')); // ⇒ ______

// TODO F3: guna ??= dan ||= supaya output sepadan
const opsyen = { had: null };
console.log('F3', opsyen); // ⇒ F3 { had: 20, mula: 0 }

// ── G. Perbandingan ketat — RAMAL ──────────────────────────────────────────
console.log('G1', '0' == 0, '0' === 0, [] == false, NaN === NaN, Object.is(NaN, NaN)); // ⇒ ______
// TODO G2: ternary — '🆕' jika status baharu, selainnya '✔️'
const lencana = '';
console.log('G2', lencana); // ⇒ G2 🆕
