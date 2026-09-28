// io/format.js — Baca & tulis format vektor. TODO [H4-S2].
//   .geojson/.json → JSON.parse(await file.text())
//   .zip (Shapefile) → shpjs: import { parseShp, parseDbf, combine } from 'shpjs' (+ JSZip untuk .prj)
//                      .prj GDM2000 / Peninsula RSO → keWgs84(fc) dari utils/unjuran.js
//   .gpkg → sql.js: import initSqlJs from 'sql.js'; import wasmUrl from 'sql.js/dist/sql-wasm.wasm?url'
//           baca gpkg_geometry_columns → SELECT * FROM jadual → hurai header "GP" + WKB
//   .kml → import { kml } from '@tmcw/togeojson'; new DOMParser().parseFromString(teks, 'text/xml')
//   .kmz → JSZip.loadAsync(buffer) → zip.file('doc.kml')
//   Eksport: tokml (KML), @mapbox/shp-write (Shapefile zip), Blob + <a download>
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

/** @param {File} file @returns {Promise<object>} GeoJSON FeatureCollection (EPSG:4326) */
export async function bacaFail(file) {
  throw new Error(`TODO [H4-S2]: bacaFail(${file?.name})`);
}

export function eksportGeoJSON(fc, nama = 'laporan') {
  throw new Error('TODO [H4-S2]: eksportGeoJSON');
}

export function eksportKML(fc, nama = 'laporan') {
  throw new Error('TODO [H4-S2]: eksportKML');
}

export async function eksportShapefile(fc, nama = 'laporan') {
  throw new Error('TODO [H4-S2]: eksportShapefile');
}
