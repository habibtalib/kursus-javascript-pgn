// server.mjs — Mock REST API GeoLapor (kursus JS-PGN-5)
//
// Hanya modul terbina dalam Node (node:http, node:fs, node:url, node:path) — TIADA dependency.
// Kontrak endpoint: lihat README.md. Jalankan:  npm start   (atau  npm run dev  untuk auto-restart)
//
// Ciri untuk pengajaran:
//   ?lambat=ms  → lengahkan response (simulasi rangkaian perlahan)
//   ?gagal=1    → paksa 500 (latih error handling)
//   X-API-Key   → wajib untuk POST/PATCH/DELETE (key LATIHAN sahaja, bukan rahsia sebenar)

import { createServer } from 'node:http';
import { readFileSync, writeFileSync, renameSync, existsSync, copyFileSync, statSync, readdirSync, createReadStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve, extname, sep } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = Number(process.env.PORT ?? 3000);
const KUNCI_API = 'latihan-pgn-2026';

const FAIL_LAPORAN = join(__dirname, 'data', 'laporan.json');
const FAIL_ASAL = join(__dirname, 'data', 'asal', 'laporan.json');
const DIR_LAPISAN = join(__dirname, 'data', 'lapisan');
const DIR_STATIK = resolve(__dirname, '..', 'data'); // projek/data → /data/

// ---------------------------------------------------------------------------
// Rujukan (nilai sah)
// ---------------------------------------------------------------------------
const KATEGORI = [
  { kod: 'infrastruktur', nama: 'Infrastruktur', warna: '#e6550d' },
  { kod: 'alam-sekitar', nama: 'Alam Sekitar', warna: '#31a354' },
  { kod: 'tanah', nama: 'Tanah', warna: '#8c6d31' },
  { kod: 'utiliti', nama: 'Utiliti', warna: '#3182bd' },
  { kod: 'lain-lain', nama: 'Lain-lain', warna: '#756bb1' },
];
const KOD_KATEGORI = KATEGORI.map((k) => k.kod);
const STATUS = ['baharu', 'dalam-tindakan', 'selesai', 'ditolak'];
const KOTAK_MALAYSIA = { minLng: 99.5, maxLng: 119.5, minLat: 0.8, maxLat: 7.5 };

const LAPISAN = [
  { id: 'sempadan-zon', nama: 'Sempadan Zon (sintetik)', jenis: 'Polygon' },
  { id: 'sungai', nama: 'Sungai (sintetik)', jenis: 'LineString' },
  { id: 'kemudahan', nama: 'Kemudahan Awam (sintetik)', jenis: 'Point' },
];

const JENIS_KANDUNGAN = {
  '.geojson': 'application/geo+json; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.zip': 'application/zip',
  '.gpkg': 'application/geopackage+sqlite3',
  '.kml': 'application/vnd.google-earth.kml+xml; charset=utf-8',
  '.kmz': 'application/vnd.google-earth.kmz',
  '.tif': 'image/tiff',
  '.tiff': 'image/tiff',
  '.las': 'application/vnd.las',
  '.laz': 'application/vnd.laszip',
  '.md': 'text/markdown; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.csv': 'text/csv; charset=utf-8',
  '.prj': 'text/plain; charset=utf-8',
};

// ---------------------------------------------------------------------------
// Penyimpanan — dibaca semula setiap request supaya `npm run reset-data`
// berkesan serta-merta walaupun server sedang berjalan.
// ---------------------------------------------------------------------------
function muatLaporan() {
  if (!existsSync(FAIL_LAPORAN)) copyFileSync(FAIL_ASAL, FAIL_LAPORAN);
  return JSON.parse(readFileSync(FAIL_LAPORAN, 'utf8'));
}

function simpanLaporan(senarai) {
  // Tulis ke fail sementara dahulu, kemudian rename (atomik) — elak fail rosak separuh jalan
  const sementara = `${FAIL_LAPORAN}.tmp`;
  writeFileSync(sementara, JSON.stringify(senarai, null, 2) + '\n');
  renameSync(sementara, FAIL_LAPORAN);
}

function idSeterusnya(senarai) {
  const maks = senarai.reduce((m, f) => Math.max(m, Number(String(f.id).replace('LPR-', '')) || 0), 0);
  return `LPR-${String(maks + 1).padStart(4, '0')}`;
}

function masaKini() {
  // ISO 8601 dalam waktu Malaysia (+08:00)
  return new Date(Date.now() + 8 * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, '+08:00');
}

// ---------------------------------------------------------------------------
// Pembantu response
// ---------------------------------------------------------------------------
class RalatHttp extends Error {
  constructor(status, ralat, tambahan = {}) {
    super(ralat);
    this.status = status;
    this.tambahan = tambahan;
  }
}

function hantarJson(res, status, badan, jenis = 'application/json; charset=utf-8', pengepala = {}) {
  res.writeHead(status, { 'Content-Type': jenis, ...pengepala });
  res.end(JSON.stringify(badan));
}

const hantarGeoJson = (res, status, badan, pengepala) =>
  hantarJson(res, status, badan, 'application/geo+json; charset=utf-8', pengepala);

function tetapkanCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');
  res.setHeader('Access-Control-Expose-Headers', 'X-Jumlah, Location');
  res.setHeader('Access-Control-Max-Age', '600');
}

function semakKunci(req) {
  if (req.headers['x-api-key'] !== KUNCI_API) {
    throw new RalatHttp(401, 'Kunci API tidak sah');
  }
}

async function bacaBadanJson(req) {
  const HAD_BAIT = 1_000_000;
  const cebisan = [];
  let saiz = 0;
  for await (const c of req) {
    saiz += c.length;
    if (saiz > HAD_BAIT) throw new RalatHttp(413, 'Badan permintaan terlalu besar (had 1 MB)');
    cebisan.push(c);
  }
  const teks = Buffer.concat(cebisan).toString('utf8').trim();
  if (!teks) throw new RalatHttp(400, 'Badan permintaan kosong — hantar JSON');
  try {
    return JSON.parse(teks);
  } catch {
    throw new RalatHttp(400, 'JSON tidak sah dalam badan permintaan');
  }
}

// ---------------------------------------------------------------------------
// Validasi — pulangkan objek { medan: mesej } (kosong = sah)
// ---------------------------------------------------------------------------
function validasiMedan(data, { separa = false } = {}) {
  const ralat = {};
  const ada = (k) => data[k] !== undefined;

  if (!separa || ada('tajuk')) {
    if (typeof data.tajuk !== 'string' || data.tajuk.trim().length < 5 || data.tajuk.trim().length > 120) {
      ralat.tajuk = 'Tajuk wajib, 5–120 aksara';
    }
  }
  if (!separa || ada('kategori')) {
    if (!KOD_KATEGORI.includes(data.kategori)) {
      ralat.kategori = `Kategori mesti salah satu: ${KOD_KATEGORI.join(', ')}`;
    }
  }
  if (ada('catatan') && data.catatan !== null) {
    if (typeof data.catatan !== 'string' || data.catatan.length > 500) {
      ralat.catatan = 'Catatan mesti teks, maksimum 500 aksara';
    }
  }
  if (separa && ada('status') && !STATUS.includes(data.status)) {
    ralat.status = `Status mesti salah satu: ${STATUS.join(', ')}`;
  }
  const { minLng, maxLng, minLat, maxLat } = KOTAK_MALAYSIA;
  if (!separa || ada('lat')) {
    if (typeof data.lat !== 'number' || !Number.isFinite(data.lat)) ralat.lat = 'Latitud wajib nombor';
    else if (data.lat < minLat || data.lat > maxLat) ralat.lat = `Latitud mesti dalam Malaysia (${minLat}–${maxLat})`;
  }
  if (!separa || ada('lng')) {
    if (typeof data.lng !== 'number' || !Number.isFinite(data.lng)) ralat.lng = 'Longitud wajib nombor';
    else if (data.lng < minLng || data.lng > maxLng) ralat.lng = `Longitud mesti dalam Malaysia (${minLng}–${maxLng})`;
  }
  if (ada('pelapor') && (typeof data.pelapor !== 'string' || !/^[^@\s]+@latihan\.test$/.test(data.pelapor))) {
    ralat.pelapor = 'Pelapor mesti e-mel @latihan.test';
  }
  return ralat;
}

// Terima { tajuk, kategori, catatan, lat, lng } ATAU GeoJSON Feature → bentuk rata
function normalkan(badan) {
  if (badan && badan.type === 'Feature') {
    const [lng, lat] = badan.geometry?.type === 'Point' ? (badan.geometry.coordinates ?? []) : [];
    return { ...(badan.properties ?? {}), lng, lat };
  }
  return badan ?? {};
}

function pastikanObjek(badan) {
  if (typeof badan !== 'object' || badan === null || Array.isArray(badan)) {
    throw new RalatHttp(400, 'Badan permintaan mesti objek JSON');
  }
}

// ---------------------------------------------------------------------------
// Handler endpoint
// ---------------------------------------------------------------------------
function senaraiLaporan(url, res) {
  const p = url.searchParams;
  let hasil = muatLaporan();

  const kategori = p.get('kategori');
  if (kategori) {
    const set = kategori.split(',').map((s) => s.trim());
    hasil = hasil.filter((f) => set.includes(f.properties.kategori));
  }
  const status = p.get('status');
  if (status) {
    const set = status.split(',').map((s) => s.trim());
    hasil = hasil.filter((f) => set.includes(f.properties.status));
  }
  const q = p.get('q')?.trim().toLowerCase();
  if (q) hasil = hasil.filter((f) => f.properties.tajuk.toLowerCase().includes(q));

  const bbox = p.get('bbox');
  if (bbox) {
    const n = bbox.split(',').map(Number);
    if (n.length !== 4 || n.some((v) => !Number.isFinite(v)) || n[0] > n[2] || n[1] > n[3]) {
      throw new RalatHttp(400, 'bbox tidak sah — format: minLng,minLat,maxLng,maxLat');
    }
    const [minLng, minLat, maxLng, maxLat] = n;
    hasil = hasil.filter(({ geometry: { coordinates: [lng, lat] } }) =>
      lng >= minLng && lng <= maxLng && lat >= minLat && lat <= maxLat,
    );
  }

  const jumlah = hasil.length;
  const mula = p.has('mula') ? Number(p.get('mula')) : 0;
  const had = p.has('had') ? Number(p.get('had')) : undefined;
  if (!Number.isInteger(mula) || mula < 0) throw new RalatHttp(400, 'mula mesti integer ≥ 0');
  if (had !== undefined && (!Number.isInteger(had) || had < 0)) throw new RalatHttp(400, 'had mesti integer ≥ 0');
  hasil = hasil.slice(mula, had === undefined ? undefined : mula + had);

  // `jumlah` = bilangan padanan sebelum had/mula (ahli asing GeoJSON — dibenarkan RFC 7946 §6.1)
  hantarGeoJson(res, 200, { type: 'FeatureCollection', jumlah, features: hasil }, { 'X-Jumlah': String(jumlah) });
}

function cariLaporan(senarai, id) {
  const i = senarai.findIndex((f) => f.id === id);
  if (i === -1) throw new RalatHttp(404, `Laporan ${id} tidak dijumpai`);
  return i;
}

async function ciptaLaporan(req, res) {
  semakKunci(req);
  const badan = await bacaBadanJson(req);
  pastikanObjek(badan);
  const data = normalkan(badan);
  const medan = validasiMedan(data);
  if (Object.keys(medan).length) throw new RalatHttp(422, 'Data laporan tidak sah', { medan });

  const senarai = muatLaporan();
  const id = idSeterusnya(senarai);
  const kini = masaKini();
  const feature = {
    type: 'Feature',
    id,
    geometry: { type: 'Point', coordinates: [data.lng, data.lat] },
    properties: {
      id,
      tajuk: data.tajuk.trim(),
      kategori: data.kategori,
      status: 'baharu',
      catatan: data.catatan ?? '',
      pelapor: data.pelapor ?? 'pegawai1@latihan.test',
      dicipta: kini,
      dikemaskini: kini,
    },
  };
  senarai.push(feature);
  simpanLaporan(senarai);
  hantarGeoJson(res, 201, feature, { Location: `/api/laporan/${id}` });
}

async function kemaskiniLaporan(req, res, id) {
  semakKunci(req);
  const senarai = muatLaporan();
  const i = cariLaporan(senarai, id);
  const badan = await bacaBadanJson(req);
  pastikanObjek(badan);
  const data = normalkan(badan);
  const BOLEH = ['tajuk', 'kategori', 'status', 'catatan', 'lat', 'lng'];
  const perubahan = Object.fromEntries(Object.entries(data).filter(([k, v]) => BOLEH.includes(k) && v !== undefined));
  if (!Object.keys(perubahan).length) {
    throw new RalatHttp(422, 'Tiada medan untuk dikemas kini', {
      medan: { _: `Hantar sekurang-kurangnya satu: ${BOLEH.join(', ')}` },
    });
  }
  const medan = validasiMedan(perubahan, { separa: true });
  if ((perubahan.lat === undefined) !== (perubahan.lng === undefined)) {
    medan[perubahan.lat === undefined ? 'lat' : 'lng'] = 'lat dan lng mesti dihantar bersama';
  }
  if (Object.keys(medan).length) throw new RalatHttp(422, 'Data kemas kini tidak sah', { medan });

  const lama = senarai[i];
  const { lat, lng, ...prop } = perubahan;
  if (prop.tajuk) prop.tajuk = prop.tajuk.trim();
  const baharu = {
    ...lama,
    geometry: lat !== undefined ? { type: 'Point', coordinates: [lng, lat] } : lama.geometry,
    properties: { ...lama.properties, ...prop, dikemaskini: masaKini() },
  };
  senarai[i] = baharu;
  simpanLaporan(senarai);
  hantarGeoJson(res, 200, baharu);
}

function padamLaporan(req, res, id) {
  semakKunci(req);
  const senarai = muatLaporan();
  const i = cariLaporan(senarai, id);
  senarai.splice(i, 1);
  simpanLaporan(senarai);
  res.writeHead(204);
  res.end();
}

function statistik(res) {
  const senarai = muatLaporan();
  const ikutKategori = Object.fromEntries(KOD_KATEGORI.map((k) => [k, 0]));
  const ikutStatus = Object.fromEntries(STATUS.map((s) => [s, 0]));
  for (const { properties: p } of senarai) {
    ikutKategori[p.kategori] = (ikutKategori[p.kategori] ?? 0) + 1;
    ikutStatus[p.status] = (ikutStatus[p.status] ?? 0) + 1;
  }
  hantarJson(res, 200, { jumlah: senarai.length, ikutKategori, ikutStatus });
}

function senaraiLapisan(req, res) {
  const asas = `http://${req.headers.host ?? `localhost:${PORT}`}`;
  hantarJson(res, 200, LAPISAN.map((l) => ({ ...l, url: `${asas}/api/lapisan/${l.id}` })));
}

function dapatkanLapisan(res, id) {
  if (!LAPISAN.some((l) => l.id === id)) throw new RalatHttp(404, `Lapisan ${id} tidak dijumpai`);
  const isi = readFileSync(join(DIR_LAPISAN, `${id}.geojson`), 'utf8');
  res.writeHead(200, { 'Content-Type': 'application/geo+json; charset=utf-8' });
  res.end(isi);
}

function hidangStatik(res, laluan) {
  // /data/<fail> → projek/data/<fail>, dengan kawalan "path traversal"
  const relatif = decodeURIComponent(laluan.replace(/^\/data\/?/, ''));
  const penuh = resolve(DIR_STATIK, relatif);
  if (penuh !== DIR_STATIK && !penuh.startsWith(DIR_STATIK + sep)) throw new RalatHttp(403, 'Akses dinafikan');
  if (penuh.split(sep).includes('node_modules')) throw new RalatHttp(404, 'Fail tidak dijumpai');
  if (!existsSync(penuh)) throw new RalatHttp(404, `Fail tidak dijumpai: /data/${relatif}`);
  const st = statSync(penuh);
  if (st.isDirectory()) {
    // Senarai fail ringkas (tanpa subfolder alat jana)
    const fail = readdirSync(penuh, { withFileTypes: true })
      .filter((d) => d.isFile())
      .map((d) => ({ nama: d.name, url: `/data/${relatif ? `${relatif.replace(/\/$/, '')}/` : ''}${d.name}` }));
    return hantarJson(res, 200, fail);
  }
  res.writeHead(200, {
    'Content-Type': JENIS_KANDUNGAN[extname(penuh).toLowerCase()] ?? 'application/octet-stream',
    'Content-Length': st.size,
  });
  createReadStream(penuh).pipe(res);
}

function indeks(res) {
  hantarJson(res, 200, {
    nama: 'GeoLapor Mock API (latihan JS-PGN-5)',
    endpoint: [
      'GET    /api/kesihatan',
      'GET    /api/kategori',
      'GET    /api/laporan?kategori=&status=&q=&bbox=minLng,minLat,maxLng,maxLat&had=&mula=',
      'GET    /api/laporan/:id',
      'POST   /api/laporan            (X-API-Key)',
      'PATCH  /api/laporan/:id        (X-API-Key)',
      'DELETE /api/laporan/:id        (X-API-Key)',
      'GET    /api/lapisan',
      'GET    /api/lapisan/:id',
      'GET    /api/statistik',
      'GET    /data/…                 (fail statik projek/data)',
    ],
    mod: { lambat: '?lambat=1500 (ms)', gagal: '?gagal=1 (paksa 500)' },
  });
}

// ---------------------------------------------------------------------------
// Penghala
// ---------------------------------------------------------------------------
function kaedahTidakDibenarkan(dibenar) {
  return new RalatHttp(405, `Kaedah tidak dibenarkan. Guna: ${dibenar.join(', ')}`, { _allow: dibenar });
}

async function halakan(req, res, url) {
  const { pathname } = url;
  const m = req.method;

  if (pathname === '/' && m === 'GET') return indeks(res);
  if (pathname === '/api/kesihatan') {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return hantarJson(res, 200, { ok: true, masa: masaKini() });
  }
  if (pathname === '/api/kategori') {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return hantarJson(res, 200, KATEGORI);
  }
  if (pathname === '/api/statistik') {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return statistik(res);
  }
  if (pathname === '/api/laporan') {
    if (m === 'GET') return senaraiLaporan(url, res);
    if (m === 'POST') return ciptaLaporan(req, res);
    throw kaedahTidakDibenarkan(['GET', 'POST']);
  }
  const padanLaporan = pathname.match(/^\/api\/laporan\/([^/]+)$/);
  if (padanLaporan) {
    const id = decodeURIComponent(padanLaporan[1]);
    if (m === 'GET') {
      const senarai = muatLaporan();
      return hantarGeoJson(res, 200, senarai[cariLaporan(senarai, id)]);
    }
    if (m === 'PATCH') return kemaskiniLaporan(req, res, id);
    if (m === 'DELETE') return padamLaporan(req, res, id);
    throw kaedahTidakDibenarkan(['GET', 'PATCH', 'DELETE']);
  }
  if (pathname === '/api/lapisan') {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return senaraiLapisan(req, res);
  }
  const padanLapisan = pathname.match(/^\/api\/lapisan\/([^/]+)$/);
  if (padanLapisan) {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return dapatkanLapisan(res, decodeURIComponent(padanLapisan[1]));
  }
  if (pathname === '/data' || pathname.startsWith('/data/')) {
    if (m !== 'GET') throw kaedahTidakDibenarkan(['GET']);
    return hidangStatik(res, pathname);
  }
  throw new RalatHttp(404, `Laluan tidak dijumpai: ${m} ${pathname}`);
}

const tidur = (ms) => new Promise((r) => setTimeout(r, ms));

const pelayan = createServer(async (req, res) => {
  const t0 = performance.now();
  res.on('finish', () => {
    const ms = (performance.now() - t0).toFixed(0);
    const jam = new Date().toLocaleTimeString('en-GB', { hour12: false });
    console.log(`[${jam}] ${req.method.padEnd(6)} ${req.url} → ${res.statusCode} (${ms} ms)`);
  });

  tetapkanCors(res);
  try {
    const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);

    // Preflight CORS (browser hantar OPTIONS sebelum POST/PATCH/DELETE dengan header tersuai)
    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      return res.end();
    }

    // Mod pengajaran: ?lambat=ms (maks 30 s) dan ?gagal=1
    const lambat = Number(url.searchParams.get('lambat'));
    if (Number.isFinite(lambat) && lambat > 0) await tidur(Math.min(lambat, 30_000));
    if (url.searchParams.get('gagal') === '1') {
      throw new RalatHttp(500, 'Ralat pelayan disimulasikan (?gagal=1)');
    }

    await halakan(req, res, url);
  } catch (err) {
    if (res.headersSent) return res.destroy();
    if (err instanceof RalatHttp) {
      const { _allow, ...tambahan } = err.tambahan;
      const pengepala = _allow ? { Allow: _allow.join(', ') } : {};
      return hantarJson(res, err.status, { ralat: err.message, ...tambahan }, undefined, pengepala);
    }
    console.error(err);
    hantarJson(res, 500, { ralat: 'Ralat dalaman pelayan' });
  }
});

pelayan.listen(PORT, () => {
  console.log(`GeoLapor mock API berjalan di http://localhost:${PORT}`);
  console.log(`  Laporan: ${muatLaporan().length} rekod (${FAIL_LAPORAN.replace(__dirname + sep, '')})`);
  console.log(`  Fail statik: http://localhost:${PORT}/data/  →  ${DIR_STATIK}`);
  console.log('  Ctrl+C untuk berhenti.\n');
});

pelayan.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} sedang digunakan. Hentikan pelayan lain atau guna: PORT=3001 npm start`);
    process.exit(1);
  }
  throw err;
});
