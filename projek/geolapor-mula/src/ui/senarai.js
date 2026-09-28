// ui/senarai.js — Senarai laporan. TODO [H4-S2]: pindah kod Hari 3 anda ke sini.
// Hari 5: modul ini akan ditulis semula sebagai pasangSenarai(ul, { store, tindakan }).
/* eslint-disable no-unused-vars -- fail rangka (stub): buang baris ini apabila anda melaksanakan fungsi */

/**
 * Lukis senarai laporan dalam <ul id="senarai">.
 * - Guna createElement + textContent (TANPA innerHTML)
 * - Delegasi event: SATU listener 'click' pada <ul>, cari li dengan e.target.closest('li[data-id]')
 * @param {HTMLUListElement} ul
 * @param {object[]} features
 * @param {{ onPilih?: (id: string) => void }} pilihan
 */
export function renderSenarai(ul, features, { onPilih } = {}) {
  // TODO
  throw new Error('TODO [H4-S2]: renderSenarai belum dilaksanakan');
}
