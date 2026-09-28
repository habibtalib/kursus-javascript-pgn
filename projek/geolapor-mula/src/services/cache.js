// services/cache.js — Browser storage. TODO [H4-S4].
//   localStorage : kecil, sync, string (JSON.stringify/parse) → penapis & draf borang
//   IndexedDB    : besar, async, objek → cache layer GeoJSON
// ⚠️ Balut dengan try…catch — mod peribadi / kuota penuh boleh melempar error.
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

export function bacaLocal(kunci, lalai = null) {
  throw new Error('TODO [H4-S4]: bacaLocal');
}

export function simpanLocal(kunci, nilai) {
  throw new Error('TODO [H4-S4]: simpanLocal');
}

/** IndexedDB: indexedDB.open('geolapor', 1) → onupgradeneeded: createObjectStore('lapisan') */
export async function dapatkanCache(kunci) {
  throw new Error('TODO [H4-S4]: dapatkanCache');
}

export async function simpanCache(kunci, nilai) {
  throw new Error('TODO [H4-S4]: simpanCache');
}
