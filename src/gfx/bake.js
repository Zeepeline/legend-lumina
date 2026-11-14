'use strict';
// Panggang bayangan objek ke tekstur tanah
const SHC = {};
function bakeGround(sc, M, rect) {
  const g = genGround(M, rect); if (M.indoor) return g;
  const [RX, RY, RW, RH] = rect || [0, 0, M.w, M.h];
  const c = g, x = c.getContext('2d'); x.setTransform(1, 0, 0, 1, -RX, -RY); // gambar langsung di kanvas tanah (tanpa salin)
  x.globalAlpha = M.dark ? .55 : .36;
  const I = shadowIndex(sc, M), ids = new Set();
  for (let j = Math.floor(RY / SHB); j <= Math.floor((RY + RH - 1) / SHB); j++) {
    for (let i = Math.floor(RX / SHB); i <= Math.floor((RX + RW - 1) / SHB); i++) {
      for (const n of I.grid.get(i + ',' + j) || []) ids.add(n);
    }
  }
  for (const n of [...ids].sort((a, b) => a - b)) {
    const e = I.list[n];
    if (e[2] < RX || e[0] > RX + RW || e[3] < RY || e[1] > RY + RH) continue;
    x.drawImage(e[4].c, e[0], e[1]);
  }
  x.globalAlpha = 1; verdantBase(x, M, rect); x.setTransform(1, 0, 0, 1, 0, 0); return c;
}
// indeks bayangan per kotak SHB piksel: setiap potongan tanah hanya menggambar bayangan yang menyentuhnya
const SHB = 128;
function shadowIndex(sc, M) {
  if (M._shIdx) return M._shIdx;
  const list = [], grid = new Map();
  for (const o of mapObjects(M).slice().sort((a, b) => a[2] - b[2])) {
    const d = OBJ[o[0]]; if (!d.sh) continue;
    let C = SHC[d.key];
    if (!C) {
      const tex = sc.textures.get(d.key), f = tex.has(0) ? tex.get(0) : tex.get();
      C = SHC[d.key] = shadowCanvas(tex.getSourceImage(), f.cutX, f.cutY, f.cutWidth, f.cutHeight);
      C.w = f.cutWidth;
    }
    const x0 = Math.round(o[1] - C.w / 2 - C.pad), y0 = Math.round(o[2] + 3 - C.shH - C.pad), n = list.length;
    list.push([x0, y0, x0 + C.c.width, y0 + C.c.height, C]);
    for (let j = Math.floor(y0 / SHB); j <= Math.floor((y0 + C.c.height) / SHB); j++) {
      for (let i = Math.floor(x0 / SHB); i <= Math.floor((x0 + C.c.width) / SHB); i++) {
        const k = i + ',' + j;
        let b = grid.get(k);
        if (!b) grid.set(k, b = []);
        b.push(n);
      }
    }
  }
  return M._shIdx = { list, grid };
}
