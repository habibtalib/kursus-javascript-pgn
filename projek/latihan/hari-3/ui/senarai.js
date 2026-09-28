// ui/senarai.js — KOD SEDIA (versi siap Latihan 02) supaya Latihan 04 & 05 tidak bergantung pada kod anda.
// Prinsip: data pengguna HANYA masuk DOM melalui textContent / atribut — tidak pernah innerHTML.
import { formatKoordinat } from '../utils/geo.js';

const LABEL_STATUS = {
  baharu: 'Baharu',
  'dalam-tindakan': 'Dalam tindakan',
  selesai: 'Selesai',
  ditolak: 'Ditolak',
};

/**
 * Bina satu <li> kad laporan daripada <template id="tpl-laporan">.
 * @param {object} feature GeoJSON Feature laporan
 * @param {Map<string, {nama: string, warna: string}>} kategori indeks kod → {nama, warna}
 * @returns {HTMLLIElement}
 */
export function kadLaporan(feature, kategori = new Map()) {
  const tpl = document.getElementById('tpl-laporan');
  const li = tpl.content.firstElementChild.cloneNode(true);
  const { id, tajuk, kategori: kod, status } = feature.properties;
  const info = kategori.get(kod);

  li.dataset.id = id;
  li.querySelector('.kad-tajuk').textContent = tajuk;
  li.querySelector('.kad-kategori').textContent = info?.nama ?? kod;
  const elStatus = li.querySelector('.kad-status');
  elStatus.textContent = LABEL_STATUS[status] ?? status;
  elStatus.classList.add(`status-${status}`);
  li.querySelector('.kad-koordinat').textContent = `📍 ${formatKoordinat(feature.geometry.coordinates)}`;
  if (info?.warna) li.style.borderLeftColor = info.warna;
  return li;
}

/**
 * Render semua kad sekali gus (satu reflow) — DocumentFragment + replaceChildren.
 * @param {HTMLUListElement} ul
 * @param {object[]} features
 * @param {Map} kategori
 */
export function renderSenarai(ul, features, kategori) {
  if (features.length === 0) {
    const li = document.createElement('li');
    li.className = 'kosong';
    li.textContent = 'Tiada laporan sepadan dengan tapisan.';
    ul.replaceChildren(li);
    return;
  }
  const serpihan = document.createDocumentFragment();
  for (const f of features) serpihan.append(kadLaporan(f, kategori));
  ul.replaceChildren(serpihan);
}

/** Isi <select> dengan pilihan kategori (kekalkan <option> pertama "Semua"/"pilih"). */
export function isiPilihanKategori(select, senarai) {
  const pertama = select.options[0];
  select.replaceChildren(pertama, ...senarai.map(({ kod, nama }) => new Option(nama, kod)));
}

/** [{kod,nama,warna}] → Map(kod → {nama, warna}) untuk carian O(1). */
export function indeksKategori(senarai) {
  return new Map(senarai.map(({ kod, nama, warna }) => [kod, { nama, warna }]));
}
