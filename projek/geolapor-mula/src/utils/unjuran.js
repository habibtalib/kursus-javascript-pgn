// utils/unjuran.js — Tukar koordinat antara CRS dengan proj4. TODO [H4-S2].
//   EPSG:4326 WGS84 (darjah) · EPSG:3375 GDM2000 / Peninsula RSO (meter) · EPSG:3857 Web Mercator
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */
import proj4 from 'proj4';

/** Definisi proj4 EPSG:3375 (disemak dengan PROJ/pyproj) — DIBERI. */
export const RSO_PROJ =
  '+proj=omerc +lat_0=4 +lonc=102.25 +alpha=323.0257964666666 +k=0.99984 ' +
  '+x_0=804671 +y_0=0 +no_uoff +gamma=323.1301023611111 +ellps=GRS80 ' +
  '+towgs84=0,0,0,0,0,0,0 +units=m +no_defs';

proj4.defs('EPSG:3375', RSO_PROJ);

/**
 * TODO: reproject SETIAP koordinat dalam FeatureCollection ke EPSG:4326.
 * Petua: proj4(dariEpsg, 'EPSG:4326').forward([x, y]); geometri Polygon = array cincin → array titik.
 * Uji: projek/data/sempadan-zon-rso.zip (koordinat ~ 410000, 324000 → ~101.69, 2.93)
 */
export function keWgs84(fc, dariEpsg = 'EPSG:3375') {
  throw new Error('TODO [H4-S2]: keWgs84');
}
