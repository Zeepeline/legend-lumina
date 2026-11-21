'use strict';
// Aset genggaman pedang Arka (dibuat kode, palet sama dengan senjata lama): pedang beresolusi lebih halus + kepalan menggenggam.
// Pedang: pommel 2 · gagang berlilit 4 · pelindung 2 · bilah 11 · ujung 1 (+ garis tepi 1 px → 22×6). TITIK PUTAR = TENGAH GAGANG
// (SWORD_PIVOT), jadi kepalan yang menutup tengah gagang tampak benar-benar menggenggam. Kepalan: 4×4 piksel (kulit + garis jari + tepi eksplisit).
const SWORD_HD_MAP = [
  "......Gg............",
  "PPKBKBGgWWWWWWWWWWWW",
  "PPBKBKGgLLLLLLLLLLL.",
  "......Gg............"
];
const SWORD_HD_PAL = {
  1: { P: '#e8c050', K: '#6a3e1e', B: '#8a5a32', G: '#f4d070', g: '#c8962a', W: '#e8f0ff', L: '#8a96b0' },
  0: { P: '#b08a5a', K: '#5a3a20', B: '#7a5230', G: '#c89a58', g: '#8a5a32', W: '#e8c090', L: '#b08a5a' }
};
const SWORD_PIVOT = { sword0: 5 / 22, sword1: 5 / 22 }; /* origin X (0..1) = tengah gagang; senjata lain tetap .1 */
function swordOriginX(key) { return SWORD_PIVOT[key] ?? .1; }
function artSwordHD(tier) { return outline(renderMap(SWORD_HD_MAP, SWORD_HD_PAL[tier]), '#2a1c2a'); }
function artFistGrip() { /* tepi eksplisit (outline() otomatis menggelapkan warna kulit jadi merah); 4 px lebar = panjang gagang */
  const rows = [".oo.", "oSSo", "osdo", ".oo."];
  return renderMap(rows, { o: '#5a2a3a', S: '#fdcfa4', s: '#e6936f', d: '#aa584d' });
}
function regSwordArt(T) {
  const put = (key, c) => { if (T.exists(key)) T.remove(key); T.addCanvas(key, c); };
  put('sword0', artSwordHD(0)); put('sword1', artSwordHD(1)); put('fist_grip', artFistGrip());
}
{ const _bt = typeof buildTextures === 'function' ? buildTextures : null;
  if (_bt) buildTextures = function (sc) { const r = _bt.apply(this, arguments); regSwordArt(sc.textures); return r; };
}
