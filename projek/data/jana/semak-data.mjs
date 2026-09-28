// semak-data.mjs — Sahkan setiap fail dalam projek/data/ dengan MEMBACANYA SEMULA
// menggunakan pustaka yang sama seperti dalam kursus (Hari 4):
//   shpjs · sql.js · @tmcw/togeojson + @xmldom/xmldom · jszip · geotiff · @loaders.gl/las + core · proj4
//
// Guna:  cd projek/data/jana && npm run semak
// Keluar dengan kod 1 jika mana-mana semakan gagal.

import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import shp, { parseShp, parseDbf } from 'shpjs';
import initSqlJs from 'sql.js';
import { kml as kmlKeGeoJSON } from '@tmcw/togeojson';
import { DOMParser } from '@xmldom/xmldom';
import JSZip from 'jszip';
import { fromArrayBuffer } from 'geotiff';
import { parse } from '@loaders.gl/core';
import { LASLoader } from '@loaders.gl/las';
import proj4 from 'proj4';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIR = join(__dirname, '..');

const RSO_PROJ =
  '+proj=omerc +lat_0=4 +lonc=102.25 +alpha=323.0257964666666 +k=0.99984 ' +
  '+x_0=804671 +y_0=0 +no_uoff +gamma=323.1301023611111 +ellps=GRS80 ' +
  '+towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

// Kotak kawasan kajian + sedikit margin
const KAWASAN = [101.65, 2.87, 101.75, 2.98];
const dalamKawasan = ([lng, lat]) =>
  lng >= KAWASAN[0] && lng <= KAWASAN[2] && lat >= KAWASAN[1] && lat <= KAWASAN[3];

const bacaAB = async (nama) => {
  const b = await readFile(join(DIR, nama));
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
};

let gagal = 0;
async function semak(nama, fn) {
  try {
    const ringkasan = await fn();
    console.log(`✔ ${nama.padEnd(26)} ${ringkasan}`);
  } catch (err) {
    gagal++;
    console.error(`✘ ${nama.padEnd(26)} ${err.message}`);
  }
}

// Semua koordinat (rata) daripada FeatureCollection
const semuaKoordinat = (fc) =>
  fc.features.flatMap((f) => {
    const g = f.geometry;
    if (g.type === 'Point') return [g.coordinates];
    if (g.type === 'LineString') return g.coordinates;
    if (g.type === 'Polygon') return g.coordinates.flat();
    if (g.type === 'MultiPolygon') return g.coordinates.flat(2);
    throw new Error(`Jenis geometri tidak dijangka: ${g.type}`);
  });

await semak('sempadan-zon.geojson', async () => {
  const fc = JSON.parse(await readFile(join(DIR, 'sempadan-zon.geojson'), 'utf8'));
  assert.equal(fc.type, 'FeatureCollection');
  assert.equal(fc.features.length, 5);
  for (const f of fc.features) {
    assert.equal(f.geometry.type, 'Polygon');
    for (const k of ['kod', 'nama', 'keluasan_ha']) assert.ok(k in f.properties, `tiada medan ${k}`);
  }
  assert.ok(semuaKoordinat(fc).every(dalamKawasan));
  return `5 Polygon · ${fc.features.map((f) => f.properties.kod).join(', ')}`;
});

await semak('sungai.geojson', async () => {
  const fc = JSON.parse(await readFile(join(DIR, 'sungai.geojson'), 'utf8'));
  assert.equal(fc.features.length, 3);
  assert.ok(fc.features.every((f) => f.geometry.type === 'LineString'));
  assert.ok(semuaKoordinat(fc).every(dalamKawasan));
  return `3 LineString · ${fc.features.map((f) => `${f.properties.nama} (${f.properties.panjang_km} km)`).join(', ')}`;
});

await semak('sempadan-zon-rso.zip', async () => {
  const ab = await bacaAB('sempadan-zon-rso.zip');
  // (a) Baca mentah (tanpa unjuran semula) — koordinat mesti dalam meter RSO
  const zip = await JSZip.loadAsync(ab);
  const nama = Object.keys(zip.files);
  for (const ext of ['.shp', '.shx', '.dbf', '.prj']) {
    assert.ok(nama.some((n) => n.endsWith(ext)), `tiada fail ${ext} dalam zip`);
  }
  const prj = await zip.file(/\.prj$/)[0].async('string');
  assert.match(prj, /Peninsula RSO|Hotine_Oblique_Mercator|3375/i, '.prj bukan RSO');
  const shpBuf = await zip.file(/\.shp$/)[0].async('arraybuffer');
  const dbfBuf = await zip.file(/\.dbf$/)[0].async('arraybuffer');
  const geom = parseShp(shpBuf);
  const atribut = parseDbf(dbfBuf);
  assert.equal(geom.length, 5);
  assert.equal(atribut.length, 5);
  const [x, y] = geom[0].coordinates[0][0];
  assert.ok(x > 400000 && x < 420000 && y > 310000 && y < 335000, `koordinat bukan RSO: ${x}, ${y}`);
  // (b) Unjur semula dengan proj4 → mesti jatuh dalam kawasan kajian
  const wgs = proj4(RSO_PROJ, 'EPSG:4326', [x, y]);
  assert.ok(dalamKawasan(wgs), `unjuran semula di luar kawasan: ${wgs}`);
  // (c) shpjs penuh (ia juga membaca .prj & mengunjur ke WGS84 secara automatik)
  const auto = await shp(ab);
  const fc = Array.isArray(auto) ? auto[0] : auto;
  assert.equal(fc.features.length, 5);
  const [lngA, latA] = fc.features[0].geometry.coordinates[0][0];
  assert.ok(Math.abs(lngA - wgs[0]) < 1e-6 && Math.abs(latA - wgs[1]) < 1e-6, 'shpjs+.prj tidak sepadan dengan RSO_PROJ');
  return `5 poligon · RSO (${x.toFixed(0)}, ${y.toFixed(0)}) → WGS84 (${wgs[0].toFixed(5)}, ${wgs[1].toFixed(5)}) · medan: ${Object.keys(atribut[0]).join(', ')}`;
});

await semak('kemudahan.gpkg', async () => {
  const SQL = await initSqlJs();
  const db = new SQL.Database(new Uint8Array(await bacaAB('kemudahan.gpkg')));
  const [[appId]] = db.exec('PRAGMA application_id')[0].values;
  assert.equal(appId, 0x47504b47, 'application_id bukan GPKG');
  const kandungan = db.exec("SELECT table_name, data_type, srs_id FROM gpkg_contents")[0].values;
  assert.deepEqual(kandungan[0], ['kemudahan', 'features', 4326]);
  const [[kolum, jenis]] = db.exec(
    "SELECT column_name, geometry_type_name FROM gpkg_geometry_columns WHERE table_name='kemudahan'",
  )[0].values;
  assert.equal(kolum, 'geom');
  assert.equal(jenis, 'POINT');
  const baris = db.exec('SELECT geom, kod, nama FROM kemudahan')[0].values;
  const titik = baris.map(([blob]) => {
    // Header GeoPackage: 'GP', versi, flags, srs_id, [envelope], kemudian WKB
    assert.equal(String.fromCharCode(blob[0], blob[1]), 'GP');
    const flags = blob[3];
    const saizEnvelope = [0, 32, 48, 48, 64][(flags >> 1) & 0b111];
    const dv = new DataView(blob.buffer, blob.byteOffset, blob.byteLength);
    const le = (flags & 1) === 1;
    assert.equal(dv.getInt32(4, le), 4326);
    const w = 8 + saizEnvelope;
    const wkbLE = blob[w] === 1;
    assert.equal(dv.getUint32(w + 1, wkbLE), 1, 'WKB bukan Point');
    return [dv.getFloat64(w + 5, wkbLE), dv.getFloat64(w + 13, wkbLE)];
  });
  assert.ok(titik.every(dalamKawasan));
  db.close();
  return `${baris.length} titik · contoh ${baris[0][1]} ${baris[0][2]} @ ${titik[0].map((v) => v.toFixed(5)).join(', ')}`;
});

const bacaKml = (teks) => kmlKeGeoJSON(new DOMParser().parseFromString(teks, 'text/xml'));

await semak('kemudahan.kml', async () => {
  const fc = bacaKml(await readFile(join(DIR, 'kemudahan.kml'), 'utf8'));
  assert.equal(fc.features.length, 12);
  assert.ok(fc.features.every((f) => f.geometry.type === 'Point'));
  assert.ok(semuaKoordinat(fc).every(dalamKawasan));
  assert.ok(fc.features[0].properties.kod, 'ExtendedData kod hilang');
  return `12 Placemark · contoh "${fc.features[0].properties.name}"`;
});

await semak('kemudahan.kmz', async () => {
  const zip = await JSZip.loadAsync(await bacaAB('kemudahan.kmz'));
  const doc = zip.file('doc.kml');
  assert.ok(doc, 'tiada doc.kml dalam KMZ');
  const fc = bacaKml(await doc.async('string'));
  assert.equal(fc.features.length, 12);
  return `doc.kml → 12 Placemark`;
});

await semak('dem-putrajaya.tif', async () => {
  const tiff = await fromArrayBuffer(await bacaAB('dem-putrajaya.tif'));
  const img = await tiff.getImage();
  assert.equal(img.getWidth(), 100);
  assert.equal(img.getHeight(), 100);
  assert.equal(img.getSamplesPerPixel(), 1);
  assert.equal(img.getBitsPerSample(), 32);
  assert.equal(img.getSampleFormat(), 3, 'bukan Float');
  const geokunci = img.getGeoKeys();
  assert.equal(geokunci.GeographicTypeGeoKey, 4326);
  const bbox = img.getBoundingBox();
  bbox.forEach((v, i) => assert.ok(Math.abs(v - [101.66, 2.88, 101.74, 2.97][i]) < 1e-9, `bbox salah: ${bbox}`));
  const [band] = await img.readRasters();
  assert.ok(band instanceof Float32Array);
  let min = Infinity;
  let max = -Infinity;
  for (const v of band) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  assert.ok(min > 0 && max < 200, `julat ketinggian pelik: ${min}–${max}`);
  return `100×100 Float32 · EPSG:${geokunci.GeographicTypeGeoKey} · bbox ${bbox.map((v) => v.toFixed(2)).join(', ')} · ${min.toFixed(1)}–${max.toFixed(1)} m`;
});

await semak('sampel.las', async () => {
  const ab = await bacaAB('sampel.las');
  const dv = new DataView(ab);
  const tandatangan = String.fromCharCode(...new Uint8Array(ab, 0, 4));
  assert.equal(tandatangan, 'LASF');
  const versi = `${dv.getUint8(24)}.${dv.getUint8(25)}`;
  assert.equal(versi, '1.2');
  const data = await parse(ab, LASLoader, { worker: false, las: { shape: 'mesh' } });
  assert.equal(data.header.vertexCount, 1000);
  const { mins, maxs, pointsFormatId } = data.loaderData;
  assert.equal(pointsFormatId, 1);
  // Semak bbox header sepadan dengan titik sebenar
  const pos = data.attributes.POSITION.value;
  let zMin = Infinity;
  let zMax = -Infinity;
  for (let i = 2; i < pos.length; i += 3) {
    if (pos[i] < zMin) zMin = pos[i];
    if (pos[i] > zMax) zMax = pos[i];
  }
  assert.ok(Math.abs(zMin - mins[2]) < 0.02 && Math.abs(zMax - maxs[2]) < 0.02, 'julat Z header ≠ titik');
  const tengah = proj4(RSO_PROJ, 'EPSG:4326', [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2]);
  assert.ok(dalamKawasan(tengah), `pusat LAS di luar kawasan: ${tengah}`);
  return `LAS ${versi} · format ${pointsFormatId} · ${data.header.vertexCount} titik · Z ${mins[2].toFixed(2)}–${maxs[2].toFixed(2)} m · pusat ≈ ${tengah.map((v) => v.toFixed(4)).join(', ')}`;
});

console.log(gagal ? `\n${gagal} semakan GAGAL.` : '\nSemua fail sah.');
process.exit(gagal ? 1 : 0);
