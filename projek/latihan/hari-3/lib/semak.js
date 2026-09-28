// lib/semak.js — semakan kendiri ringkas di Console. semak('label', syarat) → ✅ / ❌
let lulus = 0;
let gagal = 0;

export function semak(label, syarat) {
  let ok = false;
  try {
    ok = typeof syarat === 'function' ? Boolean(syarat()) : Boolean(syarat);
  } catch (ralat) {
    console.error(`❌ ${label} — ralat: ${ralat.message}`);
    gagal++;
    return false;
  }
  if (ok) lulus++;
  else gagal++;
  console.log(`${ok ? '✅' : '❌'} ${label}`);
  return ok;
}

export function ringkasan(tajuk = 'Semakan') {
  const warna = gagal === 0 ? 'color: green' : 'color: #b42318';
  console.log(`%c${tajuk}: ${lulus} lulus, ${gagal} belum`, `font-weight: bold; ${warna}`);
}
