// jana-data.mjs — Jana SEMUA data geospatial sintetik untuk kursus JS-PGN-5.
//
// Guna:  cd projek/data/jana && npm install && npm run jana
//
// Output (ditulis semula setiap kali dijalankan; deterministik — benih PRNG tetap):
//   projek/data/sempadan-zon.geojson      5 zon Polygon (EPSG:4326)
//   projek/data/sempadan-zon-rso.zip      zon sama sebagai Shapefile dalam EPSG:3375 (GDM2000 / Peninsula RSO)
//   projek/data/sungai.geojson            3 LineString
//   projek/data/kemudahan.gpkg            GeoPackage, jadual `kemudahan` (Point, EPSG:4326)
//   projek/data/kemudahan.kml / .kmz      titik kemudahan sama (KMZ = zip berisi doc.kml)
//   projek/data/dem-putrajaya.tif         GeoTIFF Float32, 1 band, 100×100, EPSG:4326
//   projek/data/sampel.las                LAS 1.2, format titik 1, 1,000 titik, EPSG:3375
//   projek/api/data/lapisan/*.geojson     lapisan rujukan untuk /api/lapisan/:id
//   projek/api/data/asal/laporan.json     40 laporan sintetik (salinan asal untuk reset)
//   projek/api/data/laporan.json          salinan kerja (yang diubah oleh API)
//
// SEMUA data ialah SINTETIK (rekaan) — bukan data PGN/JUPEM sebenar.

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import proj4 from 'proj4';
import JSZip from 'jszip';
import initSqlJs from 'sql.js';
import { writeArrayBuffer } from 'geotiff';
import area from '@turf/area';

const require = createRequire(import.meta.url);
const shpwrite = require('@mapbox/shp-write');
const tokml = require('tokml');

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR_DATA = join(__dirname, '..');
const DIR_API_DATA = join(__dirname, '..', '..', 'api', 'data');

// ---------------------------------------------------------------------------
// Unjuran: EPSG:3375 — GDM2000 / Peninsula RSO (Hotine Oblique Mercator, varian A)
// Disemak silang dengan pyproj/PROJ (EPSG:3375): (101.69, 2.93) → (410363.20, 324278.14)
// ---------------------------------------------------------------------------
export const RSO_PROJ =
  '+proj=omerc +lat_0=4 +lonc=102.25 +alpha=323.0257964666666 +k=0.99984 ' +
  '+x_0=804671 +y_0=0 +no_uoff +gamma=323.1301023611111 +ellps=GRS80 ' +
  '+towgs84=0,0,0,0,0,0,0 +units=m +no_defs';
proj4.defs('EPSG:3375', RSO_PROJ);

// WKT1 gaya OGC/GDAL untuk fail .prj (EPSG:3375, dijana oleh PROJ). Dipilih berbanding
// WKT gaya ESRI ("Rectified_Skew_Orthomorphic_Natural_Origin") kerana proj4js (dan shpjs)
// tidak dapat menghurai varian ESRI tersebut, manakala QGIS/GDAL membaca kedua-duanya.
export const RSO_PRJ_WKT =
  'PROJCS["GDM2000 / Peninsula RSO",GEOGCS["GDM2000",DATUM["Geodetic_Datum_of_Malaysia_2000",' +
  'SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6742"]],' +
  'PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],' +
  'AUTHORITY["EPSG","4742"]],PROJECTION["Hotine_Oblique_Mercator"],PARAMETER["latitude_of_center",4],' +
  'PARAMETER["longitude_of_center",102.25],PARAMETER["azimuth",323.0257964666666],' +
  'PARAMETER["rectified_grid_angle",323.1301023611111],PARAMETER["scale_factor",0.99984],' +
  'PARAMETER["false_easting",804671],PARAMETER["false_northing",0],UNIT["metre",1,AUTHORITY["EPSG","9001"]],' +
  'AXIS["Easting",EAST],AXIS["Northing",NORTH],AUTHORITY["EPSG","3375"]]';

// Kotak kawasan kajian (sekitar Putrajaya/Cyberjaya): [minLng, minLat, maxLng, maxLat]
export const BBOX = [101.66, 2.88, 101.74, 2.97];

// ---------------------------------------------------------------------------
// PRNG berbenih (mulberry32) — supaya output sama setiap kali dijana
// ---------------------------------------------------------------------------
function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260928);
const antara = (min, max) => min + rand() * (max - min);
const pilih = (senarai) => senarai[Math.floor(rand() * senarai.length)];
const bundar = (n, dp) => Math.round(n * 10 ** dp) / 10 ** dp;

const fc = (features) => ({ type: 'FeatureCollection', features });

// ---------------------------------------------------------------------------
// 1. Sempadan zon — grid 3 lajur × 4 baris nod, nod dalaman diganjak sedikit.
//    Zon jiran berkongsi nod yang sama → jubinan tepat tanpa celah/tindih.
// ---------------------------------------------------------------------------
function janaZon() {
  const lngs = [101.66, 101.70, 101.74];
  const lats = [2.88, 2.91, 2.94, 2.97];
  // nod[i][j] = [lng, lat] ; i = lajur, j = baris
  const nod = lngs.map((lng, i) =>
    lats.map((lat, j) => {
      const tepiX = i === 0 || i === lngs.length - 1;
      const tepiY = j === 0 || j === lats.length - 1;
      const dx = tepiX ? 0 : antara(-0.006, 0.006);
      const dy = tepiY ? 0 : antara(-0.004, 0.004);
      return [bundar(lng + dx, 6), bundar(lat + dy, 6)];
    }),
  );
  const n = (i, j) => nod[i][j];
  // Cincin arah lawan jam (RFC 7946), ditutup semula ke titik pertama
  const sel = (i, j) => [n(i, j), n(i + 1, j), n(i + 1, j + 1), n(i, j + 1), n(i, j)];

  const takrif = [
    { kod: 'ZON-A', nama: 'Zon Presint Barat Laut', cincin: sel(0, 2) },
    { kod: 'ZON-B', nama: 'Zon Presint Timur Laut', cincin: sel(1, 2) },
    { kod: 'ZON-C', nama: 'Zon Presint Barat', cincin: sel(0, 1) },
    { kod: 'ZON-D', nama: 'Zon Presint Timur', cincin: sel(1, 1) },
    {
      kod: 'ZON-E',
      nama: 'Zon Presint Selatan',
      // dua sel bawah digabung
      cincin: [n(0, 0), n(1, 0), n(2, 0), n(2, 1), n(1, 1), n(0, 1), n(0, 0)],
    },
  ];
  return fc(
    takrif.map(({ kod, nama, cincin }) => {
      const geometry = { type: 'Polygon', coordinates: [cincin] };
      const keluasan_ha = bundar(area({ type: 'Feature', geometry, properties: {} }) / 10000, 2);
      return { type: 'Feature', id: kod, properties: { kod, nama, keluasan_ha }, geometry };
    }),
  );
}

// ---------------------------------------------------------------------------
// 2. Sungai — 3 LineString berliku (sinus + hingar kecil)
// ---------------------------------------------------------------------------
function haversineKm([lng1, lat1], [lng2, lat2]) {
  const R = 6371.0088;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function janaSungai() {
  const garis = (mula, akhir, bil, amplitud, kitaran) => {
    const [x0, y0] = mula;
    const [x1, y1] = akhir;
    // vektor normal untuk liku
    const panjang = Math.hypot(x1 - x0, y1 - y0);
    const nx = -(y1 - y0) / panjang;
    const ny = (x1 - x0) / panjang;
    const koordinat = [];
    for (let k = 0; k <= bil; k++) {
      const t = k / bil;
      const liku = Math.sin(t * Math.PI * kitaran) * amplitud + antara(-0.0006, 0.0006) * (k % bil ? 1 : 0);
      koordinat.push([bundar(x0 + (x1 - x0) * t + nx * liku, 6), bundar(y0 + (y1 - y0) * t + ny * liku, 6)]);
    }
    return koordinat;
  };
  const takrif = [
    { kod: 'SG-01', nama: 'Sungai Latihan Utama', koordinat: garis([101.675, 2.97], [101.715, 2.88], 40, 0.006, 3) },
    { kod: 'SG-02', nama: 'Sungai Latihan Timur', koordinat: garis([101.74, 2.945], [101.699, 2.925], 24, 0.003, 2) },
    { kod: 'SG-03', nama: 'Anak Sungai Latihan', koordinat: garis([101.66, 2.905], [101.708, 2.898], 20, 0.002, 2) },
  ];
  return fc(
    takrif.map(({ kod, nama, koordinat }) => {
      let km = 0;
      for (let i = 1; i < koordinat.length; i++) km += haversineKm(koordinat[i - 1], koordinat[i]);
      return {
        type: 'Feature',
        id: kod,
        properties: { kod, nama, panjang_km: bundar(km, 2) },
        geometry: { type: 'LineString', coordinates: koordinat },
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// 3. Kemudahan — 12 titik
// ---------------------------------------------------------------------------
function janaKemudahan() {
  const takrif = [
    ['Sekolah Kebangsaan Latihan 1', 'sekolah'],
    ['Sekolah Menengah Latihan 2', 'sekolah'],
    ['Klinik Kesihatan Latihan', 'klinik'],
    ['Klinik Komuniti Presint', 'klinik'],
    ['Balai Polis Latihan', 'balai-polis'],
    ['Masjid Latihan Presint', 'masjid'],
    ['Surau Taman Latihan', 'masjid'],
    ['Taman Rekreasi Tasik Latihan', 'taman'],
    ['Taman Permainan Presint', 'taman'],
    ['Perpustakaan Awam Latihan', 'perpustakaan'],
    ['Balai Bomba Latihan', 'bomba'],
    ['Dewan Serbaguna Latihan', 'dewan'],
  ];
  return fc(
    takrif.map(([nama, jenis], i) => {
      const kod = `KMD-${String(i + 1).padStart(2, '0')}`;
      const koordinat = [bundar(antara(101.665, 101.735), 5), bundar(antara(2.885, 2.965), 5)];
      return {
        type: 'Feature',
        id: kod,
        properties: { kod, nama, jenis },
        geometry: { type: 'Point', coordinates: koordinat },
      };
    }),
  );
}

// ---------------------------------------------------------------------------
// 4. Laporan (untuk mock API) — 40 rekod. LPR-0001 = laporan contoh.
// ---------------------------------------------------------------------------
const TAJUK = {
  infrastruktur: [
    'Papan tanda sempadan rosak',
    'Lampu jalan tidak berfungsi',
    'Jalan berlubang di simpang',
    'Longkang tersumbat berhampiran jejantas',
    'Pagar keselamatan patah',
    'Penanda aras (benchmark) hilang',
    'Tiang GPS rujukan senget',
  ],
  'alam-sekitar': [
    'Pembuangan sampah haram',
    'Pokok tumbang menghalang laluan',
    'Air sungai berubah warna',
    'Hakisan tebing sungai',
    'Pembakaran terbuka dikesan',
  ],
  tanah: [
    'Tanah runtuh kecil di cerun',
    'Pencerobohan tanah kerajaan',
    'Batu sempadan lot tercabut',
    'Mendapan tanah di tapak projek',
    'Kerja tanah tanpa papan maklumat',
  ],
  utiliti: [
    'Paip air bocor di bahu jalan',
    'Kabel elektrik terdedah',
    'Penutup lubang utiliti hilang',
    'Tiang telekomunikasi condong',
    'Pili bomba rosak',
  ],
  'lain-lain': [
    'Kenderaan ditinggalkan',
    'Papan iklan tanpa permit',
    'Gerai sementara di rizab jalan',
    'Grafiti pada dinding awam',
  ],
};
const CATATAN = [
  'Perlu pemeriksaan lanjut oleh pasukan teknikal.',
  'Gambar diambil semasa lawatan tapak pagi tadi.',
  'Dilaporkan oleh orang awam, disahkan di lokasi.',
  'Keadaan boleh membahayakan pengguna jalan.',
  'Mohon tindakan segera sebelum musim hujan.',
  'Lokasi berhampiran laluan pejalan kaki.',
  'Sudah dimaklumkan kepada pihak berkuasa tempatan.',
  '',
];
const KATEGORI = ['infrastruktur', 'alam-sekitar', 'tanah', 'utiliti', 'lain-lain'];
const STATUS = ['baharu', 'baharu', 'baharu', 'dalam-tindakan', 'dalam-tindakan', 'dalam-tindakan', 'selesai', 'selesai', 'ditolak'];

function isoMalaysia(ms) {
  // Format ISO 8601 dengan zon +08:00 (waktu Malaysia)
  const d = new Date(ms + 8 * 3600 * 1000);
  return d.toISOString().replace(/\.\d{3}Z$/, '+08:00');
}

function janaLaporan() {
  const hasil = [];
  const mulaMs = Date.parse('2026-08-01T00:00:00+08:00');
  const akhirMs = Date.parse('2026-09-20T18:00:00+08:00');
  for (let i = 1; i <= 40; i++) {
    const id = `LPR-${String(i).padStart(4, '0')}`;
    let kategori;
    let tajuk;
    let status;
    let catatan;
    let koordinat;
    let dicipta;
    let dikemaskini;
    if (i === 1) {
      // Rekod contoh rujukan (LPR-0001)
      kategori = 'infrastruktur';
      tajuk = 'Papan tanda sempadan rosak';
      status = 'baharu';
      catatan = 'Tiang condong, perlu ganti.';
      koordinat = [101.6958, 2.9264];
      dicipta = dikemaskini = '2026-09-01T09:15:00+08:00';
    } else {
      // taburan seimbang (8 setiap kategori) tetapi susunan bercampur
      kategori = KATEGORI[(i * 3) % KATEGORI.length];
      tajuk = pilih(TAJUK[kategori]);
      status = pilih(STATUS);
      catatan = pilih(CATATAN);
      koordinat = [bundar(antara(101.662, 101.738), 4), bundar(antara(2.882, 2.968), 4)];
      // waktu pejabat 8 pagi – 6 petang, minit bundar 5
      const hari = Math.floor(antara(0, (akhirMs - mulaMs) / 86400000));
      const minit = Math.floor(antara(8 * 60, 18 * 60) / 5) * 5;
      const ciptaMs = mulaMs + hari * 86400000 + minit * 60000;
      dicipta = isoMalaysia(ciptaMs);
      dikemaskini = status === 'baharu' ? dicipta : isoMalaysia(ciptaMs + Math.floor(antara(1, 96)) * 3600000);
    }
    hasil.push({
      type: 'Feature',
      id,
      geometry: { type: 'Point', coordinates: koordinat },
      properties: {
        id,
        tajuk,
        kategori,
        status,
        catatan,
        pelapor: `pegawai${((i - 1) % 5) + 1}@latihan.test`,
        dicipta,
        dikemaskini,
      },
    });
  }
  return hasil;
}

// ---------------------------------------------------------------------------
// 5. Shapefile dalam EPSG:3375 (zip: .shp .shx .dbf .prj)
// ---------------------------------------------------------------------------
async function janaShapefileRso(zon) {
  const zonRso = fc(
    zon.features.map((f) => ({
      type: 'Feature',
      properties: { ...f.properties },
      geometry: {
        type: 'Polygon',
        coordinates: f.geometry.coordinates.map((cincin) =>
          cincin.map((xy) => proj4('EPSG:4326', 'EPSG:3375', xy).map((v) => bundar(v, 3))),
        ),
      },
    })),
  );
  const zip = await shpwrite.zip(zonRso, {
    outputType: 'nodebuffer',
    compression: 'DEFLATE',
    types: { polygon: 'sempadan-zon-rso' },
    prj: RSO_PRJ_WKT,
  });
  return zip;
}

// ---------------------------------------------------------------------------
// 6. GeoPackage (sql.js) — ikut spesifikasi OGC GeoPackage 1.4
// ---------------------------------------------------------------------------
function gpkgTitik(lng, lat, srsId = 4326) {
  // GeoPackageBinary: header 8 bait + WKB Point (21 bait), little-endian
  const buf = Buffer.alloc(8 + 21);
  buf.write('GP', 0, 'ascii'); // magic
  buf.writeUInt8(0, 2); // versi 0 (= 1)
  buf.writeUInt8(0b00000001, 3); // flags: bit0=1 little-endian, envelope=0 (tiada), bukan kosong
  buf.writeInt32LE(srsId, 4);
  buf.writeUInt8(1, 8); // WKB byte order: 1 = little-endian
  buf.writeUInt32LE(1, 9); // WKB geometry type: 1 = Point
  buf.writeDoubleLE(lng, 13);
  buf.writeDoubleLE(lat, 21);
  return new Uint8Array(buf);
}

async function janaGeoPackage(kemudahan) {
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(`PRAGMA application_id = 1196444487;`); // 'GPKG'
  db.run(`PRAGMA user_version = 10400;`); // GeoPackage 1.4.0
  db.run(`
    CREATE TABLE gpkg_spatial_ref_sys (
      srs_name TEXT NOT NULL,
      srs_id INTEGER NOT NULL PRIMARY KEY,
      organization TEXT NOT NULL,
      organization_coordsys_id INTEGER NOT NULL,
      definition TEXT NOT NULL,
      description TEXT
    );
    CREATE TABLE gpkg_contents (
      table_name TEXT NOT NULL PRIMARY KEY,
      data_type TEXT NOT NULL,
      identifier TEXT UNIQUE,
      description TEXT DEFAULT '',
      last_change DATETIME NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
      min_x DOUBLE, min_y DOUBLE, max_x DOUBLE, max_y DOUBLE,
      srs_id INTEGER,
      CONSTRAINT fk_gc_r_srs_id FOREIGN KEY (srs_id) REFERENCES gpkg_spatial_ref_sys(srs_id)
    );
    CREATE TABLE gpkg_geometry_columns (
      table_name TEXT NOT NULL,
      column_name TEXT NOT NULL,
      geometry_type_name TEXT NOT NULL,
      srs_id INTEGER NOT NULL,
      z TINYINT NOT NULL,
      m TINYINT NOT NULL,
      CONSTRAINT pk_geom_cols PRIMARY KEY (table_name, column_name),
      CONSTRAINT uk_gc_table_name UNIQUE (table_name),
      CONSTRAINT fk_gc_tn FOREIGN KEY (table_name) REFERENCES gpkg_contents(table_name),
      CONSTRAINT fk_gc_srs FOREIGN KEY (srs_id) REFERENCES gpkg_spatial_ref_sys (srs_id)
    );
  `);
  const WKT_4326 =
    'GEOGCS["WGS 84",DATUM["WGS_1984",SPHEROID["WGS 84",6378137,298.257223563,AUTHORITY["EPSG","7030"]],' +
    'AUTHORITY["EPSG","6326"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],' +
    'UNIT["degree",0.0174532925199433,AUTHORITY["EPSG","9122"]],AXIS["Latitude",NORTH],' +
    'AXIS["Longitude",EAST],AUTHORITY["EPSG","4326"]]';
  const srs = db.prepare('INSERT INTO gpkg_spatial_ref_sys VALUES (?,?,?,?,?,?)');
  srs.run(['Undefined cartesian SRS', -1, 'NONE', -1, 'undefined', 'undefined cartesian coordinate reference system']);
  srs.run(['Undefined geographic SRS', 0, 'NONE', 0, 'undefined', 'undefined geographic coordinate reference system']);
  srs.run(['WGS 84 geodetic', 4326, 'EPSG', 4326, WKT_4326, 'longitude/latitude coordinates in decimal degrees on the WGS 84 spheroid']);
  srs.free();

  db.run(`
    CREATE TABLE kemudahan (
      fid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
      geom POINT,
      kod TEXT,
      nama TEXT,
      jenis TEXT
    );
  `);
  const xs = kemudahan.features.map((f) => f.geometry.coordinates[0]);
  const ys = kemudahan.features.map((f) => f.geometry.coordinates[1]);
  db.run(
    `INSERT INTO gpkg_contents (table_name, data_type, identifier, description, last_change, min_x, min_y, max_x, max_y, srs_id)
     VALUES ('kemudahan', 'features', 'kemudahan', 'Kemudahan awam sintetik (latihan)', '2026-09-26T00:00:00.000Z', ?, ?, ?, ?, 4326)`,
    [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)],
  );
  db.run(`INSERT INTO gpkg_geometry_columns VALUES ('kemudahan', 'geom', 'POINT', 4326, 0, 0)`);
  const ins = db.prepare('INSERT INTO kemudahan (geom, kod, nama, jenis) VALUES (?,?,?,?)');
  for (const f of kemudahan.features) {
    const [lng, lat] = f.geometry.coordinates;
    const { kod, nama, jenis } = f.properties;
    ins.run([gpkgTitik(lng, lat), kod, nama, jenis]);
  }
  ins.free();
  const bait = db.export();
  db.close();
  return Buffer.from(bait);
}

// ---------------------------------------------------------------------------
// 7. KML (tokml) & KMZ (JSZip — fail utama mesti bernama doc.kml)
// ---------------------------------------------------------------------------
function janaKml(kemudahan) {
  return tokml(kemudahan, {
    name: 'nama',
    description: 'jenis',
    documentName: 'Kemudahan (sintetik)',
    documentDescription: 'Data latihan kursus JS-PGN-5 — bukan data sebenar',
  });
}

async function janaKmz(kml) {
  const zip = new JSZip();
  zip.file('doc.kml', kml);
  return zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' });
}

// ---------------------------------------------------------------------------
// 8. DEM GeoTIFF — Float32, 100×100, EPSG:4326 (ketinggian sintetik dalam meter)
// ---------------------------------------------------------------------------
export function ketinggian(lng, lat) {
  // Permukaan licin: cerun + 3 bukit Gaussian + lembah sungai
  const [minLng, minLat, maxLng, maxLat] = BBOX;
  const u = (lng - minLng) / (maxLng - minLng);
  const v = (lat - minLat) / (maxLat - minLat);
  const bukit = (cu, cv, tinggi, lebar) => tinggi * Math.exp(-((u - cu) ** 2 + (v - cv) ** 2) / (2 * lebar ** 2));
  const lembah = -12 * Math.exp(-((u - (0.19 + 0.5 * (1 - v))) ** 2) / (2 * 0.04 ** 2));
  return 25 + 15 * v + bukit(0.25, 0.75, 55, 0.12) + bukit(0.8, 0.3, 40, 0.1) + bukit(0.6, 0.85, 25, 0.08) + lembah;
}

function janaDem() {
  const lebar = 100;
  const tinggi = 100;
  const [minLng, minLat, maxLng, maxLat] = BBOX;
  const dx = (maxLng - minLng) / lebar;
  const dy = (maxLat - minLat) / tinggi;
  const nilai = new Float32Array(lebar * tinggi);
  for (let r = 0; r < tinggi; r++) {
    for (let c = 0; c < lebar; c++) {
      // pusat piksel; baris 0 = utara
      const lng = minLng + (c + 0.5) * dx;
      const lat = maxLat - (r + 0.5) * dy;
      nilai[r * lebar + c] = bundar(ketinggian(lng, lat), 2);
    }
  }
  const metadata = {
    height: tinggi,
    width: lebar,
    ModelPixelScale: [dx, dy, 0],
    ModelTiepoint: [0, 0, 0, minLng, maxLat, 0],
    GTModelTypeGeoKey: 2, // geografi
    GTRasterTypeGeoKey: 1, // PixelIsArea
    GeographicTypeGeoKey: 4326,
    GeogCitationGeoKey: 'WGS 84',
  };
  return Buffer.from(writeArrayBuffer(nilai, metadata));
}

// ---------------------------------------------------------------------------
// 9. LAS 1.2 — penulis binari manual, format titik 1 (28 bait/titik), EPSG:3375
// ---------------------------------------------------------------------------
function janaLas(bilTitik = 1000) {
  // Kawasan kecil ~ 600 m × 600 m di tengah kawasan kajian
  const titik = [];
  for (let k = 0; k < bilTitik; k++) {
    const lng = antara(101.695, 101.7005);
    const lat = antara(2.925, 2.9305);
    const [x, y] = proj4('EPSG:4326', 'EPSG:3375', [lng, lat]);
    const tanah = ketinggian(lng, lat);
    // 80% tanah (kelas 2), 20% tumbuhan tinggi (kelas 5)
    const veg = rand() < 0.2;
    const z = veg ? tanah + antara(3, 18) : tanah + antara(-0.15, 0.15);
    titik.push({ x, y, z, kelas: veg ? 5 : 2, intensiti: Math.floor(antara(80, 2000)), masa: 400000 + k * 0.01 });
  }
  const skala = 0.01;
  const minX = Math.min(...titik.map((t) => t.x));
  const minY = Math.min(...titik.map((t) => t.y));
  const minZ = Math.min(...titik.map((t) => t.z));
  const maxX = Math.max(...titik.map((t) => t.x));
  const maxY = Math.max(...titik.map((t) => t.y));
  const maxZ = Math.max(...titik.map((t) => t.z));
  const offX = Math.floor(minX);
  const offY = Math.floor(minY);
  const offZ = 0;

  // VLR GeoKeyDirectoryTag (LASF_Projection / 34735): EPSG:3375
  const kunci = [1, 1, 0, 3, 1024, 0, 1, 1, 3072, 0, 1, 3375, 3076, 0, 1, 9001];
  const VLR_HDR = 54;
  const vlrData = Buffer.alloc(kunci.length * 2);
  kunci.forEach((v, i) => vlrData.writeUInt16LE(v, i * 2));

  const HDR = 227;
  const REC = 28;
  const offsetTitik = HDR + VLR_HDR + vlrData.length;
  const buf = Buffer.alloc(offsetTitik + bilTitik * REC);

  // --- Public Header Block (LAS 1.2) ---
  buf.write('LASF', 0, 'ascii');
  buf.writeUInt16LE(0, 4); // File Source ID
  buf.writeUInt16LE(0, 6); // Global Encoding (0 = GPS week time)
  // GUID 8..23 dibiarkan sifar
  buf.writeUInt8(1, 24); // Version Major
  buf.writeUInt8(2, 25); // Version Minor
  buf.write('LATIHAN JS-PGN-5'.padEnd(32, '\0'), 26, 'ascii'); // System Identifier
  buf.write('jana-data.mjs'.padEnd(32, '\0'), 58, 'ascii'); // Generating Software
  buf.writeUInt16LE(269, 90); // Day of year (26 Sep 2026)
  buf.writeUInt16LE(2026, 92); // Year
  buf.writeUInt16LE(HDR, 94); // Header Size
  buf.writeUInt32LE(offsetTitik, 96); // Offset to point data
  buf.writeUInt32LE(1, 100); // Number of VLRs
  buf.writeUInt8(1, 104); // Point Data Format ID
  buf.writeUInt16LE(REC, 105); // Point Data Record Length
  buf.writeUInt32LE(bilTitik, 107); // Number of point records
  buf.writeUInt32LE(bilTitik, 111); // Points by return [1] (semua pulangan pertama)
  // [2..5] = 0
  buf.writeDoubleLE(skala, 131);
  buf.writeDoubleLE(skala, 139);
  buf.writeDoubleLE(skala, 147);
  buf.writeDoubleLE(offX, 155);
  buf.writeDoubleLE(offY, 163);
  buf.writeDoubleLE(offZ, 171);
  // Nilai min/maks dibundar ke grid skala supaya sama dengan titik yang disimpan
  const kuantum = (v, off) => Math.round((v - off) / skala) * skala + off;
  buf.writeDoubleLE(kuantum(maxX, offX), 179);
  buf.writeDoubleLE(kuantum(minX, offX), 187);
  buf.writeDoubleLE(kuantum(maxY, offY), 195);
  buf.writeDoubleLE(kuantum(minY, offY), 203);
  buf.writeDoubleLE(kuantum(maxZ, offZ), 211);
  buf.writeDoubleLE(kuantum(minZ, offZ), 219);

  // --- VLR ---
  let p = HDR;
  buf.writeUInt16LE(0, p); // Reserved
  buf.write('LASF_Projection'.padEnd(16, '\0'), p + 2, 'ascii');
  buf.writeUInt16LE(34735, p + 18); // Record ID: GeoKeyDirectoryTag
  buf.writeUInt16LE(vlrData.length, p + 20);
  buf.write('GeoKeyDirectoryTag EPSG:3375'.padEnd(32, '\0'), p + 22, 'ascii');
  vlrData.copy(buf, p + VLR_HDR);

  // --- Rekod titik (format 1) ---
  p = offsetTitik;
  for (const t of titik) {
    buf.writeInt32LE(Math.round((t.x - offX) / skala), p);
    buf.writeInt32LE(Math.round((t.y - offY) / skala), p + 4);
    buf.writeInt32LE(Math.round((t.z - offZ) / skala), p + 8);
    buf.writeUInt16LE(t.intensiti, p + 12);
    buf.writeUInt8(0b00001001, p + 14); // return number 1, number of returns 1
    buf.writeUInt8(t.kelas, p + 15); // classification
    buf.writeInt8(0, p + 16); // scan angle rank
    buf.writeUInt8(0, p + 17); // user data
    buf.writeUInt16LE(1, p + 18); // point source ID
    buf.writeDoubleLE(t.masa, p + 20); // GPS time
    p += REC;
  }
  return buf;
}

// ---------------------------------------------------------------------------
// Utama
// ---------------------------------------------------------------------------
const json = (obj) => JSON.stringify(obj, null, 2) + '\n';

async function utama() {
  await mkdir(join(DIR_API_DATA, 'asal'), { recursive: true });
  await mkdir(join(DIR_API_DATA, 'lapisan'), { recursive: true });

  const zon = janaZon();
  const sungai = janaSungai();
  const kemudahan = janaKemudahan();
  const laporan = janaLaporan();

  const tulis = async (laluan, isi) => {
    await writeFile(laluan, isi);
    console.log('✔', laluan.replace(join(__dirname, '..', '..') + '/', 'projek/'), `(${isi.length} bait)`);
  };

  await tulis(join(DIR_DATA, 'sempadan-zon.geojson'), json(zon));
  await tulis(join(DIR_DATA, 'sungai.geojson'), json(sungai));
  await tulis(join(DIR_DATA, 'sempadan-zon-rso.zip'), await janaShapefileRso(zon));
  await tulis(join(DIR_DATA, 'kemudahan.gpkg'), await janaGeoPackage(kemudahan));
  const kml = janaKml(kemudahan);
  await tulis(join(DIR_DATA, 'kemudahan.kml'), kml);
  await tulis(join(DIR_DATA, 'kemudahan.kmz'), await janaKmz(kml));
  await tulis(join(DIR_DATA, 'dem-putrajaya.tif'), janaDem());
  await tulis(join(DIR_DATA, 'sampel.las'), janaLas(1000));

  // Lapisan rujukan & laporan untuk mock API
  await tulis(join(DIR_API_DATA, 'lapisan', 'sempadan-zon.geojson'), json(zon));
  await tulis(join(DIR_API_DATA, 'lapisan', 'sungai.geojson'), json(sungai));
  await tulis(join(DIR_API_DATA, 'lapisan', 'kemudahan.geojson'), json(kemudahan));
  await tulis(join(DIR_API_DATA, 'asal', 'laporan.json'), json(laporan));
  await tulis(join(DIR_API_DATA, 'laporan.json'), json(laporan));

  console.log('\nSelesai. Jalankan `npm run semak` untuk mengesahkan setiap fail.');
}

utama().catch((err) => {
  console.error('Gagal menjana data:', err);
  process.exit(1);
});
