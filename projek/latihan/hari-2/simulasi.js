// simulasi.js — "server palsu" dalam memori untuk S1–S2 (tiada rangkaian diperlukan).
// Meniru muat layer yang mengambil masa, gaya callback Node: callback(ralat, data).

const LAPISAN_PALSU = {
  'sempadan-zon': { type: 'FeatureCollection', features: new Array(5).fill({ type: 'Feature' }) },
  sungai: { type: 'FeatureCollection', features: new Array(3).fill({ type: 'Feature' }) },
  kemudahan: { type: 'FeatureCollection', features: new Array(8).fill({ type: 'Feature' }) },
};

const TUNDA_MS = { 'sempadan-zon': 300, sungai: 200, kemudahan: 100 };

/**
 * Muat satu layer selepas beberapa ratus ms. Gaya callback "error dahulu".
 * @param {string} id
 * @param {(ralat: Error | null, data?: object) => void} callback
 */
export function muatLapisanCb(id, callback) {
  setTimeout(() => {
    const data = LAPISAN_PALSU[id];
    if (!data) {
      callback(new Error(`Lapisan '${id}' tidak wujud`));
      return;
    }
    callback(null, structuredClone(data));
  }, TUNDA_MS[id] ?? 150);
}
