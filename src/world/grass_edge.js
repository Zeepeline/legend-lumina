'use strict';
// TEPI RUMPUT BERPETAK (autotile 47 bentuk) — percobaan, hanya untuk peta di GRASS_EDGE.maps.
// Peta rumput dibaca dari gambar tanah peta (gnd_<peta>_custom): kotak `cell` px dianggap rumput bila ≥ thr hijau.
// Tiap kotak rumput memilih petak tepi dari lembar Sprout Lands (assets/img/ground/gnd_edge_sprout.png, 16 px)
// sesuai 8 tetangganya. Petak hanya memberi BENTUK & bayangan tepi; warnanya tetap tekstur GRASS (world/grass.js).
// Rumput & jalan lama di luar petak diganti tanah satu gaya (DIRT_S: rata + kerikil + bayangan di bawah tepi rumput).
const GRASS_EDGE = { on: true, sheet: 'gnd_edge_sprout', water: 'gnd_water_sprout', cell: 16, thr: .5, maps: ['village', 'river', 'lake'] };
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
const SAND_S = { base: [232, 207, 166], dark: [210, 178, 132], mid: [220, 192, 150], light: [242, 226, 192] }; /* pasir tepi air */
const WATER_S = { /* air Sprout Lands */
  base: [155, 212, 195], deep: [139, 199, 192], shallow: [168, 221, 199], line: [226, 242, 228], spark: [177, 224, 190] };
// kelas piksel gambar peta: 0 lain (biarkan), 1 rumput, 2 tanah, 3 pasir, 4 air, 5 buih
function edgeClass(r, g, b) {
  const l = r + g + b;
  if (l >= 600 && b >= r && b >= g - 4) return 5; /* buih (putih kebiruan), bukan bunga putih */
  if (b > r + 25 && b >= g - 10) return 4;
  if (isGreen(r, g, b)) return 1;
  if (r > b + 30 && r >= g) return g > r * .84 ? 3 : 2;
  return 0;
}
// jarak chamfer (maks 255) dari piksel yang memenuhi f
function edgeDist(K, W, H, f) {
  const d = new Uint8Array(W * H); for (let i = 0; i < d.length; i++) d[i] = f(K[i]) ? 0 : 255;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x; let v = d[i]; if (x) v = Math.min(v, d[i - 1] + 1); if (y) v = Math.min(v, d[i - W] + 1); d[i] = v;
  }
  for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) {
    const i = y * W + x; let v = d[i]; if (x < W - 1) v = Math.min(v, d[i + 1] + 1); if (y < H - 1) v = Math.min(v, d[i + W] + 1); d[i] = v;
  }
  return d;
}
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
  const K = new Uint8Array(M.w * M.h), L = new Uint16Array(M.w * M.h);
  for (let j = 0, i = 0; j < K.length; j++, i += 4) { K[j] = edgeClass(D[i], D[i + 1], D[i + 2]); L[j] = D[i] + D[i + 1] + D[i + 2]; }
  { /* air harus genangan nyata: ≥ 60% air dalam kotak 9×9, selain itu bintik rumput toska → rumput */
    const W = M.w, H = M.h, I = new Uint32Array((W + 1) * (H + 1)), R = 4;
    for (let y = 0; y < H; y++) {
      let run = 0; for (let x = 0; x < W; x++) { run += K[y * W + x] >= 4 ? 1 : 0; I[(y + 1) * (W + 1) + x + 1] = I[y * (W + 1) + x + 1] + run; }
    }
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const j = y * W + x; if (K[j] < 4) continue;
      const x0 = Math.max(0, x - R), y0 = Math.max(0, y - R), x1 = Math.min(W, x + R + 1), y1 = Math.min(H, y + R + 1);
      const n = I[y1 * (W + 1) + x1] - I[y0 * (W + 1) + x1] - I[y1 * (W + 1) + x0] + I[y0 * (W + 1) + x0];
      if (n < (x1 - x0) * (y1 - y0) * .6) K[j] = 1;
    }
  }
  const dW = edgeDist(K, M.w, M.h, k => k >= 4), dL = edgeDist(K, M.w, M.h, k => k > 0 && k < 4); /* jarak ke air / ke daratan */
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
  return (C[M.id] = { cols, rows, G, tile, sheet, K, L, dW, dL, wt: getTileData(GRASS_EDGE.water) });
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
    const j = ly * M.w + lx, cls = E.K[j]; if (!cls) continue; /* batu dll. → biarkan */
    const h = hash(X >> 1, Y >> 1, 91), v = vnoise(X, Y, 48, 92); let c;
    if (cls >= 4) { /* air gaya Sprout: rata, dangkal di tepi, garis tepi tipis, kilau dari lembar air */
      const dl = E.dL[j];
      c = dl <= 1 ? WATER_S.line : dl <= 5 ? WATER_S.shallow : E.L[j] < 300 ? WATER_S.deep : WATER_S.base;
      const wt = E.wt; if (wt && dl > 3 && hash(Math.floor(X / 16), Math.floor(Y / 16), 95) < .28) {
        const cx = Math.floor(X / 16), cy = Math.floor(Y / 16), ox = (hash(cx, cy, 93) * 16) | 0, oy = (hash(cx, cy, 94) * 16) | 0;
        const wi = ((((Y + oy) % 16 + 16) % 16) * wt.w + (((X + ox) % 16 + 16) % 16)) * 4; if (wt[wi] > 165) c = WATER_S.spark;
      }
      D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; continue;
    }
    // tanah/pasir satu gaya: warna dasar rata + kerikil kecil + bayangan di bawah tepi rumput; dekat air = pasir
    const P = cls === 3 || E.dW[j] <= 3 ? SAND_S : DIRT_S;
    c = h < .012 ? P.dark : h < .03 ? P.light : h < .05 ? P.mid : P.base;
    if (P === SAND_S && E.dW[j] <= 1) c = P.mid; /* pasir basah */
    if (cover(lx, ly - 1) >= 0 || cover(lx, ly - 2) >= 0) c = P.dark;
    else if (cover(lx, ly - 3) >= 0 || cover(lx - 1, ly) >= 0 || cover(lx + 1, ly) >= 0) c = P.mid;
    const k = .97 + v * .06; D[i] = c[0] * k; D[i + 1] = c[1] * k; D[i + 2] = c[2] * k;
  }
  ctx.putImageData(im, 0, 0); return true;
}
