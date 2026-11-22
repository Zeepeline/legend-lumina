'use strict';
// TEPI RUMPUT BERPETAK (autotile 47 bentuk) — percobaan, hanya untuk peta di GRASS_EDGE.maps.
// Peta rumput dibaca dari gambar tanah peta (gnd_<peta>_custom): kotak `cell` px dianggap rumput bila ≥ thr hijau.
// Tiap kotak rumput memilih petak tepi dari lembar Sprout Lands (assets/img/ground/gnd_edge_sprout.png, 16 px)
// sesuai 8 tetangganya. Petak hanya memberi BENTUK & bayangan tepi; warnanya tetap tekstur GRASS (world/grass.js).
// Rumput & jalan lama di luar petak diganti tanah satu gaya (DIRT_S: rata + kerikil + bayangan di bawah tepi rumput).
const GRASS_EDGE = { on: true, sheet: 'gnd_edge_sprout', cell: 16, thr: .5, maps: ['village'] };
// tanda tangan N E S W NE SE SW NW (1 = rumput menyambung ke sisi/sudut itu) → [kolom, baris] di lembar
const GRASS_EDGE_MAP = {
  "11111111": [[0,0]], "00100000": [[0,2]], "00000000": [[1,2]], "11110100": [[6,2]], "11110010": [[7,2]], "10110000": [[8,2]], "11010000": [[9,2]],
  "10100000": [[0,3],[0,4]], "01100100": [[1,3]], "01110110": [[2,3]], "00110010": [[3,3]], "11111000": [[6,3]], "11110001": [[7,3]],
  "01110000": [[8,3]], "11100000": [[9,3]], "11101100": [[1,4]], "10110011": [[3,4]], "11111011": [[4,4]], "11111101": [[5,4]], "11100100": [[6,4]],
  "01110010": [[7,4]], "01110100": [[8,4]], "10110010": [[9,4]], "10000000": [[0,5]], "11001000": [[1,5]], "11011001": [[2,5]], "10010001": [[3,5]],
  "11110111": [[4,5]], "11111110": [[5,5]], "11011000": [[6,5]], "10110001": [[7,5]], "11101000": [[8,5]], "11010001": [[9,5]], "01000000": [[0,6]],
  "01010000": [[1,6],[2,6]], "00010000": [[3,6]], "01100000": [[4,6]], "00110000": [[5,6]], "11111100": [[6,6]], "11110110": [[7,6]],
  "11110000": [[0,7],[1,7]], "11110101": [[2,7]], "11111010": [[3,7]], "11000000": [[4,7]], "10010000": [[5,7]], "11111001": [[6,7]],
  "11110011": [[7,7]]
};
const DIRT_S = { base: [196, 154, 108], dark: [170, 121, 89], mid: [182, 137, 98], light: [220, 185, 138] }; /* palet tanah Sprout Lands */
const isGreen = (r, g, b) => (g > r + 10 && g > b + 8) || (g > r + 25 && b < g + 45 && b > r); /* + bintik toska rumput lama */
// sekali per peta: kisi rumput + petak terpilih + warna jalan
function grassEdgeData(M) {
  const C = grassEdgeData.c || (grassEdgeData.c = {}); if (C[M.id] !== undefined) return C[M.id];
  const src = IMGEL[M.customGround], sheet = getTileData(GRASS_EDGE.sheet); if (!src || !sheet) return (C[M.id] = null);
  const S = GRASS_EDGE.cell, cols = Math.ceil(M.w / S), rows = Math.ceil(M.h / S);
  const [, x] = mk(M.w, M.h); x.drawImage(src, 0, 0, M.w, M.h); const D = x.getImageData(0, 0, M.w, M.h).data;
  const cnt = new Float32Array(cols * rows), tot = new Float32Array(cols * rows); 
  for (let y = 0; y < M.h; y++) for (let xx = 0; xx < M.w; xx++) {
    const i = (y * M.w + xx) * 4, r = D[i], g = D[i + 1], b = D[i + 2], k = ((y / S) | 0) * cols + ((xx / S) | 0);
    tot[k]++; if (isGreen(r, g, b)) cnt[k]++;
  }
  const G = new Uint8Array(cols * rows); for (let k = 0; k < G.length; k++) G[k] = cnt[k] / tot[k] >= GRASS_EDGE.thr ? 1 : 0;
  for (let it = 0; it < 2; it++) { /* rapikan: buang rumput terpencil, tutup lubang kecil */
    const P = G.slice();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      let n = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        if (!i && !j) continue; const cc = c + i, rr = r + j; n += cc < 0 || rr < 0 || cc >= cols || rr >= rows ? 1 : P[rr * cols + cc];
      }
      const k = r * cols + c; if (P[k] && n <= 2) G[k] = 0; else if (!P[k] && n >= 6) G[k] = 1;
    }
  }
  const at = (c, r) => c < 0 || r < 0 || c >= cols || r >= rows ? 1 : G[r * cols + c]; /* tepi peta = rumput (menyambung) */
  const tile = new Int16Array(cols * rows * 2).fill(-1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!G[r * cols + c]) continue;
    const N = at(c, r - 1), E = at(c + 1, r), Sx = at(c, r + 1), W = at(c - 1, r);
    const sig = '' + N + E + Sx + W + (N & E & at(c + 1, r - 1)) + (Sx & E & at(c + 1, r + 1)) + (Sx & W & at(c - 1, r + 1)) + (N & W & at(c - 1, r - 1));
    const opts = GRASS_EDGE_MAP[sig] || GRASS_EDGE_MAP['11111111'], o = opts[(c * 7 + r * 13) % opts.length];
    tile[(r * cols + c) * 2] = o[0]; tile[(r * cols + c) * 2 + 1] = o[1];
  }
  return (C[M.id] = { cols, rows, G, tile, sheet });
}
// dipanggil genGround untuk gambar tanah per peta; true = rumput sudah final (grassPass dilewati)
function grassEdgeCanvas(ctx, W, H, RX, RY, X0, Y0, M) {
  if (!GRASS_EDGE.on || !GRASS_EDGE.maps.includes(M.id) || typeof grassTiles !== 'function') return false;
  const E = grassEdgeData(M), T = grassTiles(); if (!E || !T) return false;
  const S = GRASS_EDGE.cell, sc = S / 16, sh = E.sheet, sw = sh.w, im = ctx.getImageData(0, 0, W, H), D = im.data;
  const a = [0, 0, 0], q = [0, 0, 0];
  const cover = (lx, ly) => { /* indeks piksel lembar bila (lx,ly) tertutup petak rumput, selain itu -1 */
    const c = (lx / S) | 0, r = (ly / S) | 0; if (lx < 0 || ly < 0 || c >= E.cols || r >= E.rows) return -1;
    const k = (r * E.cols + c) * 2; if (E.tile[k] < 0) return -1;
    const px = ((lx % S) / sc) | 0, py = ((ly % S) / sc) | 0, si = ((E.tile[k + 1] * 16 + py) * sw + E.tile[k] * 16 + px) * 4;
    return sh[si + 3] > 128 ? si : -1;
  };
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, lx = RX + x, ly = RY + y, X = X0 + x, Y = Y0 + y, si = cover(lx, ly);
    if (si >= 0) {
      const px = ((lx % S) / sc) | 0, py = ((ly % S) / sc) | 0, fi = (py * sw + px) * 4;
      const f = Math.min(1.25, Math.max(.55, (sh[si] + sh[si + 1] + sh[si + 2]) / Math.max(1, sh[fi] + sh[fi + 1] + sh[fi + 2])));
      const n = vnoise(X, Y, GRASS.patch, 11); grassTex(T[0], X, Y, a);
      if (n < .4) { const t = grassSS(.3, .4, n); grassTex(T[2], X, Y, q); for (let j = 0; j < 3; j++) a[j] = q[j] + (a[j] - q[j]) * t; }
      else if (n > .62) { const t = grassSS(.62, .72, n); grassTex(T[1], X, Y, q); for (let j = 0; j < 3; j++) a[j] += (q[j] - a[j]) * t; }
      const o = D[i] + D[i + 1] + D[i + 2], fl = isGreen(D[i], D[i + 1], D[i + 2]) ? Math.min(1.15, Math.max(.8, o / GRASS.ref)) : 1.15;
      D[i] = a[0] * f * fl; D[i + 1] = a[1] * f * fl; D[i + 2] = a[2] * f * fl; continue;
    }
    const r0 = D[i], g0 = D[i + 1], b0 = D[i + 2];
    if (!(isGreen(r0, g0, b0) || (r0 > b0 + 30 && r0 >= g0))) continue; /* bukan rumput/tanah (air, batu) → biarkan */
    // tanah satu gaya: warna dasar rata + kerikil kecil + bayangan di bawah tepi rumput
    const h = hash(X >> 1, Y >> 1, 91), v = vnoise(X, Y, 48, 92);
    let c = h < .012 ? DIRT_S.dark : h < .03 ? DIRT_S.light : h < .05 ? DIRT_S.mid : DIRT_S.base;
    if (cover(lx, ly - 1) >= 0 || cover(lx, ly - 2) >= 0) c = DIRT_S.dark;
    else if (cover(lx, ly - 3) >= 0 || cover(lx - 1, ly) >= 0 || cover(lx + 1, ly) >= 0) c = DIRT_S.mid;
    const k = .97 + v * .06; D[i] = c[0] * k; D[i + 1] = c[1] * k; D[i + 2] = c[2] * k;
  }
  ctx.putImageData(im, 0, 0); return true;
}
