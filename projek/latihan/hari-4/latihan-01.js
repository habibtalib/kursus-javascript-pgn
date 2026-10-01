// ─────────────────────────────────────────────────────────────────────────────
// Latihan 01 — S1 · Semver (^ dan ~) & dependencies vs devDependencies
// Jalankan: node latihan-01.js   (atau butang Jalankan di Pelatih — tiada npm, tiada rangkaian)
// Setiap bahagian BERDIRI SENDIRI: A, B dan C hanya guna pembantu sedia di bawah.
// ─────────────────────────────────────────────────────────────────────────────

// Pembantu SEDIA (jangan ubah): '2.24.1' → [2, 24, 1] (NOMBOR, bukan string).
const bacaVersi = (versi) => versi.split('.').map(Number);

// Semua pakej GeoLapor (projek/geolapor-mula), BELUM diasingkan. Bahagian C mengasingkannya.
const semuaPakej = {
  '@eslint/js': '^9.39.5', // konfigurasi "recommended" ESLint
  '@loaders.gl/core': '^4.5.2', // baca LAS dalam browser
  '@loaders.gl/las': '^4.5.2',
  '@mapbox/shp-write': '^0.4.3', // eksport Shapefile dari browser
  '@tmcw/togeojson': '^7.1.2', // KML → GeoJSON dalam browser
  '@turf/turf': '^7.4.0', // analisis ruang dalam browser
  eslint: '^9.39.5', // linter (Lab 4.3)
  'eslint-config-prettier': '^10.1.8', // matikan peraturan ESLint yang bertembung dengan Prettier
  geotiff: '^3.0.5', // baca GeoTIFF dalam browser
  globals: '^17.12.0', // senarai global browser untuk eslint.config.js
  jszip: '^3.10.2', // baca/tulis .zip dalam browser
  leaflet: '^1.9.4', // peta
  prettier: '^3.9.9', // formatter (Lab 4.3)
  proj4: '^2.22.0', // RSO → WGS84 dalam browser
  shpjs: '^6.2.0', // baca Shapefile dalam browser
  'sql.js': '^1.14.2', // baca GeoPackage dalam browser
  tokml: '^0.4.0', // eksport KML dari browser
  vite: '^7.3.6', // dev server & build (Lab 4.2)
};

// ── A. Julat caret ^ ─────────────────────────────────────────────────────────
// TODO A: bolehCaret(versi, asas) → true jika `^asas` membenarkan `versi`.
//   - versi mesti >= asas (banding MAJOR, kemudian MINOR, kemudian PATCH — sebagai NOMBOR)
//   - MAJOR >= 1: MAJOR mesti sama        (^2.22.0 → 2.x.x, ≥ 2.22.0)
//   - MAJOR 0   : MINOR mesti sama juga   (^0.4.3 → 0.4.x, ≥ 0.4.3 — cth. tokml, shp-write)
function bolehCaret(versi, asas) {
  return false;
}

console.log('A1', ['3.0.0', '2.24.1', '2.21.9', '2.22.0'].filter((v) => bolehCaret(v, '2.22.0'))); // ⇒ A1 [ '2.24.1', '2.22.0' ]
console.log('A2', ['0.4.9', '0.5.0', '1.0.0'].filter((v) => bolehCaret(v, '0.4.3'))); // ⇒ A2 [ '0.4.9' ]
console.log('A3', bolehCaret('2.100.0', '2.22.0')); // ⇒ A3 true

// ── B. Julat tilde ───────────────────────────────────────────────────────────
// TODO B: bolehTilde(versi, asas) → true jika julat tilde (`~asas`) membenarkan `versi`:
//   MAJOR dan MINOR mesti sama, PATCH >= PATCH asas. Banding sebagai NOMBOR: 10 > 9.
function bolehTilde(versi, asas) {
  return false;
}

console.log('B1', ['2.22.0', '2.22.7', '2.23.0', '3.0.0', '2.21.9'].filter((v) => bolehTilde(v, '2.22.0'))); // ⇒ B1 [ '2.22.0', '2.22.7' ]
console.log('B2', bolehTilde('2.22.10', '2.22.9')); // ⇒ B2 true

// ── C. dependencies vs devDependencies ──────────────────────────────────────
// TODO C1: isi ALAT_DEV dengan nama pakej yang HANYA diperlukan semasa MEMBANGUN
//          (build, lint, format). Kod ini tidak sampai ke browser pengguna.
const ALAT_DEV = [];

// TODO C2: asingkan(pakej, alatDev) → { dependencies, devDependencies }: dua objek BAHARU
//          (jangan ubah `pakej`). Nama dalam alatDev → devDependencies, selebihnya → dependencies.
function asingkan(pakej, alatDev) {
  return { dependencies: { ...pakej }, devDependencies: {} };
}

const { dependencies, devDependencies } = asingkan(semuaPakej, ALAT_DEV);
console.log('C1 dependencies:', Object.keys(dependencies).length, 'pakej'); // ⇒ C1 dependencies: 12 pakej
console.log('C2 devDependencies:', Object.keys(devDependencies).sort().join(', ')); // ⇒ C2 devDependencies: @eslint/js, eslint, eslint-config-prettier, globals, prettier, vite
console.log('C3 npm ci --omit=dev memasang vite?', 'vite' in dependencies ? 'ya' : 'tidak'); // ⇒ C3 npm ci --omit=dev memasang vite? tidak
