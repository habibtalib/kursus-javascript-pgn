// ─────────────────────────────────────────────────────────────────────────────
// Latihan 01 — S1 · DOM Selection & Traversal
// Buka: http://localhost:5500/?l=01   → lihat Console (F12). Sasaran: semua ✅.
// Rujukan: hari-3/README.md §S1. Jangan ubah index.html — baca strukturnya (Elements panel).
// ─────────────────────────────────────────────────────────────────────────────
import { semak, ringkasan } from './lib/semak.js';

// TODO 1 — Pilih elemen utama.
//   senarai: <ul id="senarai-laporan">  → guna getElementById
//   borang : <form id="borang-laporan"> → guna querySelector
//   petaEl : <div id="peta" role="region"> → guna querySelector dengan pemilih atribut
const senarai = null; // TODO
const borang = null; // TODO
const petaEl = null; // TODO
semak('1a senarai ialah <ul>', senarai?.tagName === 'UL');
semak('1b borang ialah <form>', borang instanceof HTMLFormElement);
semak('1c peta dijumpai', petaEl?.id === 'peta');

// TODO 2 — Pilih SEMUA <option> dalam #tapis-status (querySelectorAll).
//   Tukar NodeList → array nilai (o.value), buang nilai kosong "Semua status".
//   Petua: Array.from(nodeList, fnPeta) atau [...nodeList].map(...)
const nilaiStatus = []; // TODO
console.log('2  nilai status:', nilaiStatus);
semak('2  4 status (tanpa "Semua")', nilaiStatus.join() === 'baharu,dalam-tindakan,selesai,ditolak');

// TODO 3 — Akses medan borang melalui borang.elements (ikut atribut name).
//   Destructuring: const { tajuk, lat, lng } = borang.elements;
const tajuk = null; // TODO
const lat = null; // TODO
const lng = null; // TODO
semak('3a medan tajuk wajib', tajuk?.required === true);
semak('3b lat ialah input number', lat?.type === 'number' && lng?.type === 'number');
semak('3c had lat = 0.8..7.5', lat?.min === '0.8' && lat?.max === '7.5');

// TODO 4 — Merentas pokok DOM bermula dari input lat.
//   a) NAIK ke <fieldset> terdekat (closest), TURUN ke <legend> (querySelector)
//   b) elemen adik seterusnya selepas lat (nextElementSibling) → sepatutnya p.ralat
//   c) induk borang (parentElement)
//   d) bilangan anak elemen <main> (children.length)
const legend = null; // TODO a
const ralatLat = null; // TODO b
semak('4a closest(fieldset) → legend "Lokasi"', legend?.textContent.startsWith('Lokasi'));
semak('4b adik lat ialah p.ralat', ralatLat?.matches('p.ralat'));
semak('4c induk borang ialah <aside>', false /* TODO: borang.parentElement... */);
semak('4d <main> ada 3 anak', false /* TODO */);

// TODO 5 — Baca atribut data-ralat-untuk pada ralatLat melalui dataset (camelCase!).
semak('5  dataset.ralatUntuk === "lat"', false /* TODO */);

// TODO 6 — Tulis fungsi cariRalat(nama) yang memulangkan <p data-ralat-untuk="nama"> dalam borang.
const cariRalat = (nama) => null; // TODO: pemilih atribut + template literal
semak('6  cariRalat("tajuk") dijumpai', cariRalat('tajuk')?.tagName === 'P');

// TODO 7 — <template id="tpl-laporan">. Ramal dahulu: adakah document.querySelector('.kad-tajuk') jumpa?
//   Kemudian pilih .kad-tajuk melalui tpl.content.
const tpl = null; // TODO
semak('7a querySelector tidak nampak isi template', document.querySelector('.kad-tajuk') === null);
semak('7b tpl.content nampak', tpl?.content.querySelector('.kad-tajuk') != null);

// TODO 8 — Berapa <button> dalam dokumen? Ramal dahulu, kemudian kira.
const bilButang = 0; // TODO
console.log('8  bilangan <button>:', bilButang);
semak('8  hanya 1 butang (submit) — butang dalam template tidak dikira', bilButang === 1);

ringkasan('Latihan 01');
