'use strict';
// Penyeragaman gaya: PATOKAN = pohon treeA / treeAd / treeSn (hijau alami, garis luar halus) + set Verdant yang senada.
// Aset menyimpang diganti (data peta tetap memakai nama jenis lama):
//   round → treeAd (ikut bergoyang) · bushG1/bushG2 → verdant_bush · bushy → verdant_bush_small · stump/deadtree → verdant_stump
//   pine/pined → bentuk tetap, warna daun dipetakan ke palet pinus hutan tua (i_treeWoodsPine) yang senada treeA.
Object.assign(OBJ.round, { key: 'treeAd', col: [10, 6, 2], sh: [18, 5] });
OBJ.bushG1.key = OBJ.bushG2.key = 'verdant_bush';
OBJ.bushy.key = 'verdant_bush_small';
OBJ.stump.key = 'verdant_stump'; OBJ.deadtree.key = 'verdant_stump';
OBJ_SPAWN.round = OBJ_SPAWN.treeA; OBJ_SPAWN.treeB = OBJ_SPAWN.treeA;
// warna daun: urutan kecerahan sumber dipetakan ke urutan kecerahan palet acuan (kontras & bentuk tetap)
function styleLeafPalette(img) {
  const [c, x] = mk(img.width, img.height); x.drawImage(img, 0, 0);
  const d = x.getImageData(0, 0, c.width, c.height).data, out = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200 && d[i + 1] > d[i] + 6) out.push([d[i], d[i + 1], d[i + 2]]);
  return out.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
}
function styleRecolor(img, pal) {
  const [c, x] = mk(img.width, img.height); x.drawImage(img, 0, 0);
  const D = x.getImageData(0, 0, c.width, c.height), d = D.data, idx = [];
  for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0 && d[i + 1] > d[i] + 6) idx.push(i);
  idx.sort((a, b) => (d[a] + d[a + 1] + d[a + 2]) - (d[b] + d[b + 1] + d[b + 2]));
  idx.forEach((i, n) => { const p = pal[Math.floor(n / idx.length * (pal.length - 1))]; d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2]; });
  x.putImageData(D, 0, 0); return c;
}
const _applyGptSwapStyle = applyGptSwap;
applyGptSwap = function (T, A) {
  _applyGptSwapStyle(T, A);
  const ref = IMGEL.gpt_i_treeWoodsPine; if (!ref) return;
  const pal = styleLeafPalette(ref); if (pal.length < 20) return;
  for (const k of ['pine', 'pined']) {
    const img = IMGEL['gpt_' + k]; if (!img) continue;
    if (T.exists(k)) T.remove(k);
    T.addCanvas(k, styleRecolor(img, pal));
  }
};
