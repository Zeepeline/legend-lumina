'use strict';
// TEPI RUMPUT BERPETAK (autotile 47 bentuk) — percobaan, hanya untuk peta di GRASS_EDGE.maps.
// Peta rumput dibaca dari gambar tanah peta (gnd_<peta>_custom): kotak `cell` px dianggap rumput bila ≥ thr hijau.
// Tiap kotak rumput memilih petak tepi dari lembar Sprout Lands (assets/img/ground/gnd_edge_sprout.png, 16 px)
// sesuai 8 tetangganya. Petak hanya memberi BENTUK & bayangan tepi; warnanya tetap tekstur GRASS (world/grass.js).
// Rumput & jalan lama di luar petak diganti tanah satu gaya (DIRT_S: rata + kerikil + bayangan di bawah tepi rumput).
const GRASS_EDGE = { on: true, sheet: 'gnd_edge_sprout', water: 'gnd_water_sprout', cell: 16, q: 2, thr: .5, sand: 1,
  maps: ['village', 'river', 'lake', 'meadow', 'forest', 'deepwood', 'road', 'swamp', 'snow', 'kgate', 'kpasar', 'kakademi', 'kbawah', 'kpermukiman'],
  caves: ['cave'] }; /* gua: autotile yang sama, kelas dari jalur gua (biome_ground.js BIOME.cave) */
// palet khas per wilayah (id peta): air & pita pasir/lumpur/salju; selain ini memakai WATER_S / SAND_S
const EDGE_PAL = {
  swamp: { water: { base: [120, 152, 128], deep: [104, 136, 116], shallow: [136, 168, 140], line: [188, 208, 184], spark: [150, 182, 156] },
    sand: { base: [150, 124, 92], dark: [124, 100, 74], mid: [138, 112, 84], light: [170, 146, 110] } },
  snow: { water: { base: [168, 212, 228], deep: [148, 198, 222], shallow: [190, 226, 236], line: [242, 250, 252], spark: [222, 242, 250] },
    sand: { base: [236, 242, 246], dark: [206, 216, 228], mid: [222, 230, 240], light: [250, 252, 254] } },
  kgate: { road: 'cobble', greyRoad: 1 }, kpasar: { road: 'cobble', greyRoad: 1 }, kakademi: { road: 'cobble', greyRoad: 1 },
  kbawah: { road: 'cobble', greyRoad: 1 }, kpermukiman: { road: 'cobble', greyRoad: 1 },
};
// paving batu kota gaya Sprout: petak 32 px berulang (batu bulat acak, nat gelap, sisi atas terang), dibuat sekali
const COBBLE = { tile: null, stone: [[206, 198, 186], [196, 188, 178], [214, 206, 192]], grout: [150, 140, 134], hi: [230, 224, 212], lo: [178, 170, 160] };
function cobbleTile() {
  if (COBBLE.tile) return COBBLE.tile;
  const T = 32, G = 4, C = T / G, seeds = [], out = new Uint8Array(T * T * 3);
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    seeds.push([i * C + 2 + hash(i, j, 61) * (C - 4), j * C + 2 + hash(i, j, 62) * (C - 4), (hash(i, j, 63) * 3) | 0]);
  }
  for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
    let d1 = 1e9, d2 = 1e9, best = null;
    for (const s of seeds) for (let oy = -T; oy <= T; oy += T) for (let ox = -T; ox <= T; ox += T) {
      const d = Math.hypot(x - s[0] - ox, (y - s[1] - oy) * 1.15); if (d < d1) { d2 = d1; d1 = d; best = [s, ox, oy]; } else if (d < d2) d2 = d;
    }
    const [s, , oy] = best, dy = y - s[1] - oy, e = d2 - d1;
    const c = e < 1.3 ? COBBLE.grout : e < 2.4 && dy < 0 ? COBBLE.hi : e < 2.4 && dy > 0 ? COBBLE.lo : COBBLE.stone[s[2]];
    out.set(c, (y * T + x) * 3);
  }
  return (COBBLE.tile = out);
}
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
  if (b > r + 25 && b > g + 4) return 4; /* air = lebih biru daripada hijau (rumput toska rawa bukan air) */
  if (isGreen(r, g, b) || (g >= r - 6 && g > b + 60)) return 1; /* + rumput kekuningan */
  if (l < 120) return 2; /* garis hitam tepi jalan lama → tanah */
  if (r > b + 30 && r >= g) return g > r * .84 ? 3 : 2;
  return 0;
}
const isGreen = (r, g, b) => (g > r + 10 && g > b + 8) || (g > r + 25 && b < g + 45 && b > r); /* + bintik toska rumput lama */
// kisi 0/1 → rapikan (buang kotak terpencil, tutup lubang kecil); tepi peta = salin kotak terdekat
function edgeClean(G, cols, rows, n0 = 2, n1 = 6) {
  for (let it = 0; it < 2; it++) {
    const P = G.slice();
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      let n = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        if (!i && !j) continue; const cc = Math.min(cols - 1, Math.max(0, c + i)), rr = Math.min(rows - 1, Math.max(0, r + j)); n += P[rr * cols + cc];
      }
      const k = r * cols + c; if (P[k] && n <= n0) G[k] = 0; else if (!P[k] && n >= n1) G[k] = 1;
    }
  }
}
// kisi 0/1 → petak autotile [kolom, baris] per kotak (-1 = kosong)
function edgeTiles(G, cols, rows) {
  const at = (c, r) => G[Math.min(rows - 1, Math.max(0, r)) * cols + Math.min(cols - 1, Math.max(0, c))];
  const tile = new Int16Array(cols * rows * 2).fill(-1);
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (!G[r * cols + c]) continue;
    const N = at(c, r - 1), E = at(c + 1, r), Sx = at(c, r + 1), W = at(c - 1, r);
    const sig = '' + N + E + Sx + W + (N & E & at(c + 1, r - 1)) + (Sx & E & at(c + 1, r + 1)) + (Sx & W & at(c - 1, r + 1)) + (N & W & at(c - 1, r - 1));
    const opts = GRASS_EDGE_MAP[sig] || GRASS_EDGE_MAP['11111111'], o = opts[(c * 7 + r * 13) % opts.length];
    tile[(r * cols + c) * 2] = o[0]; tile[(r * cols + c) * 2 + 1] = o[1];
  }
  return tile;
}
// sekali per peta: kelas piksel + 3 lapis petak (pasir/daratan, tanah, rumput) di atas air
function grassEdgeData(M) {
  const C = grassEdgeData.c || (grassEdgeData.c = {}); if (C[M.id] !== undefined) return C[M.id];
  const sheet = getTileData(GRASS_EDGE.sheet); if (!sheet) return null; /* gambar belum dimuat: jangan disimpan */
  let src = M.customGround && IMGEL[M.customGround];
  if (GRASS_EDGE.caves.includes(M.id)) src = caveClassSrc(M); /* gua: dinding batu = "rumput", lantai = "tanah" */
  if (!src && !M.customGround) { /* peta tanpa gambar (kota): tanah prosedural dirender utuh sekali sebagai sumber kelas */
    if (grassEdgeData.busy) return null; grassEdgeData.busy = 1;
    try { src = genGround(M); } finally { grassEdgeData.busy = 0; }
  }
  if (!src) return null;
  const S = GRASS_EDGE.cell, cols = Math.ceil(M.w / S), rows = Math.ceil(M.h / S);
  const Q = GRASS_EDGE.q, Wd = Math.ceil(M.w / Q), Hd = Math.ceil(M.h / Q);
  const [, x] = mk(Wd, Hd); x.imageSmoothingEnabled = false; x.drawImage(src, 0, 0, M.w / Q, M.h / Q); /* kelas di 1/Q resolusi */
  const D = x.getImageData(0, 0, Wd, Hd).data;
  const K = new Uint8Array(Wd * Hd);
  const grey = (EDGE_PAL[M.id] || {}).greyRoad;
  for (let j = 0, i = 0; j < K.length; j++, i += 4) {
    let k = edgeClass(D[i], D[i + 1], D[i + 2]);
    const sp = Math.max(D[i], D[i + 1], D[i + 2]) - Math.min(D[i], D[i + 1], D[i + 2]);
    if (!k && grey && sp < 40 && D[i] + D[i + 1] + D[i + 2] > 200) k = 2; /* paving lama → jalan */
    K[j] = k;
  }
  { /* air harus genangan nyata: ≥ 60% air dalam kotak 9×9, selain itu bintik rumput toska → rumput */
    const I = new Uint32Array((Wd + 1) * (Hd + 1)), R = Math.round(4 / Q);
    for (let y = 0; y < Hd; y++) {
      let run = 0; for (let xx = 0; xx < Wd; xx++) { run += K[y * Wd + xx] >= 4 ? 1 : 0; I[(y + 1) * (Wd + 1) + xx + 1] = I[y * (Wd + 1) + xx + 1] + run; }
    }
    for (let y = 0; y < Hd; y++) for (let xx = 0; xx < Wd; xx++) {
      const j = y * Wd + xx; if (K[j] < 4) continue;
      const x0 = Math.max(0, xx - R), y0 = Math.max(0, y - R), x1 = Math.min(Wd, xx + R + 1), y1 = Math.min(Hd, y + R + 1);
      const n = I[y1 * (Wd + 1) + x1] - I[y0 * (Wd + 1) + x1] - I[y1 * (Wd + 1) + x0] + I[y0 * (Wd + 1) + x0];
      if (n < (x1 - x0) * (y1 - y0) * .6) K[j] = 1;
    }
  }
  const nG = new Float32Array(cols * rows), nW = new Float32Array(cols * rows), tot = new Float32Array(cols * rows);
  for (let y = 0; y < Hd; y++) for (let xx = 0; xx < Wd; xx++) {
    const k = ((y * Q / S) | 0) * cols + ((xx * Q / S) | 0), c = K[y * Wd + xx]; tot[k]++; if (c === 1) nG[k]++; else if (c >= 4) nW[k]++;
  }
  const N = cols * rows, Wm = new Uint8Array(N), G = new Uint8Array(N);
  for (let k = 0; k < N; k++) { Wm[k] = nW[k] / tot[k] >= .5 ? 1 : 0; G[k] = nG[k] / tot[k] >= GRASS_EDGE.thr ? 1 : 0; }
  edgeClean(Wm, cols, rows); edgeClean(G, cols, rows);
  // daratan = bukan air; pita pasir = daratan selebar GRASS_EDGE.sand kotak dari air; tanah & rumput di luar pita
  const land = new Uint8Array(N), strip = new Uint8Array(N), dirt = new Uint8Array(N), grass = new Uint8Array(N), R = GRASS_EDGE.sand;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const k = r * cols + c; land[k] = 1 - Wm[k]; let nearW = 0;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      const kk = Math.min(rows - 1, Math.max(0, r + j)) * cols + Math.min(cols - 1, Math.max(0, c + i)); if (Wm[kk]) nearW = 1;
    }
    strip[k] = land[k] && nearW; dirt[k] = land[k] && !nearW; grass[k] = G[k] && dirt[k];
  }
  edgeClean(grass, cols, rows);
  const dep = new Uint8Array(N); for (let k = 0; k < N; k++) dep[k] = Wm[k] ? 99 : 0; /* jarak (kotak) dari daratan */
  for (let pass = 0; pass < 2; pass++) for (let r0 = 0; r0 < rows; r0++) for (let c0 = 0; c0 < cols; c0++) {
    const r = pass ? rows - 1 - r0 : r0, c = pass ? cols - 1 - c0 : c0, k = r * cols + c; if (!dep[k]) continue;
    const dr = pass ? 1 : -1; let v = dep[k];
    if (r + dr >= 0 && r + dr < rows) v = Math.min(v, dep[k + dr * cols] + 1);
    if (c + dr >= 0 && c + dr < cols) v = Math.min(v, dep[k + dr] + 1);
    dep[k] = v;
  }
  const tl = { sand: edgeTiles(land, cols, rows), dirt: edgeTiles(dirt, cols, rows), grass: edgeTiles(grass, cols, rows) };
  const mB = new Uint8Array(N), mD = new Uint8Array(N); for (let k = 0; k < N; k++) { mB[k] = dep[k] >= 2 ? 1 : 0; mD[k] = dep[k] >= 4 ? 1 : 0; }
  edgeClean(mB, cols, rows, 3, 9); edgeClean(mD, cols, rows, 3, 9); tl.wb = edgeTiles(mB, cols, rows); tl.wd = edgeTiles(mD, cols, rows);
  return (C[M.id] = { cols, rows, tl, sheet, K, kw: Wd, Wm, dep, grass, dirt, strip, wt: getTileData(GRASS_EDGE.water) });
}
// dipanggil genGround untuk gambar tanah per peta; true = tanah sudah final (grassPass dilewati)
function grassEdgeCanvas(ctx, W, H, RX, RY, X0, Y0, M) {
  if (!GRASS_EDGE.on || !(GRASS_EDGE.maps.includes(M.id) || GRASS_EDGE.caves.includes(M.id)) || typeof grassTiles !== 'function') return false;
  if (grassEdgeData.busy) return false;
  const E = grassEdgeData(M), T = grassTiles(); if (!E || !T) return false;
  const PL = EDGE_PAL[M.id] || {}, WS = PL.water || WATER_S, SS = PL.sand || SAND_S;
  const S = GRASS_EDGE.cell, sc = S / 16, sh = E.sheet, sw = sh.w, im = ctx.getImageData(0, 0, W, H), D = im.data;
  const a = [0, 0, 0], q = [0, 0, 0], BI = typeof biomeOf === 'function' ? biomeOf(M) : null, bo = [0, 0, 0]; /* biome_ground.js */
  const cover = (tile, lx, ly) => { /* indeks piksel lembar bila (lx,ly) tertutup petak lapis itu, selain itu -1 */
    const c = (lx / S) | 0, r = (ly / S) | 0; if (lx < 0 || ly < 0 || c >= E.cols || r >= E.rows) return -1;
    const k = (r * E.cols + c) * 2; if (tile[k] < 0) return -1;
    const px = ((lx % S) / sc) | 0, py = ((ly % S) / sc) | 0, si = ((tile[k + 1] * 16 + py) * sw + tile[k] * 16 + px) * 4;
    return sh[si + 3] > 128 ? si : -1;
  };
  const TG = E.tl.grass, TD = E.tl.dirt, TS = E.tl.sand;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4, lx = RX + x, ly = RY + y, X = X0 + x, Y = Y0 + y, si = cover(TG, lx, ly);
    if (si >= 0) {
      const px = ((lx % S) / sc) | 0, py = ((ly % S) / sc) | 0, fi = (py * sw + px) * 4;
      const f = Math.min(1.25, Math.max(.55, (sh[si] + sh[si + 1] + sh[si + 2]) / Math.max(1, sh[fi] + sh[fi + 1] + sh[fi + 2])));
      const n = vnoise(X, Y, GRASS.patch, 11); grassTex(T[0], X, Y, a);
      if (n < .4) { const t = grassSS(.3, .4, n); grassTex(T[2], X, Y, q); for (let j = 0; j < 3; j++) a[j] = q[j] + (a[j] - q[j]) * t; }
      else if (n > .62) { const t = grassSS(.62, .72, n); grassTex(T[1], X, Y, q); for (let j = 0; j < 3; j++) a[j] += (q[j] - a[j]) * t; }
      const o = D[i] + D[i + 1] + D[i + 2], fl = isGreen(D[i], D[i + 1], D[i + 2]) ? Math.min(1.15, Math.max(.8, o / GRASS.ref)) : 1.15;
      D[i] = a[0] * f * fl; D[i + 1] = a[1] * f * fl; D[i + 2] = a[2] * f * fl;
      if (BI && biomeMask(M, BI, lx, ly, X, Y)) { /* salju / rumput rawa */
        biomeRamp(BI, D[i], D[i + 1], D[i + 2], bo); biomeDot(BI, X, Y, bo); D[i] = bo[0]; D[i + 1] = bo[1]; D[i + 2] = bo[2];
      }
      continue;
    }
    const j = ((ly / GRASS_EDGE.q) | 0) * E.kw + ((lx / GRASS_EDGE.q) | 0); if (!E.K[j]) continue; /* batu dll. → biarkan */
    const h = hash(X >> 1, Y >> 1, 91), v = vnoise(X, Y, 48, 92), inD = cover(TD, lx, ly) >= 0; let c;
    if (inD || cover(TS, lx, ly) >= 0) { /* tanah atau pita pasir: warna rata + kerikil + bayangan di bawah lapis di atasnya */
      const bm = !BI || biomeMask(M, BI, lx, ly, X, Y); /* 0 = peralihan ke wilayah tetangga → palet biasa */
      const P = inD ? (BI && BI.dirt && bm ? BI.dirt : DIRT_S) : bm ? SS : SAND_S;
      c = h < .012 ? P.dark : h < .03 ? P.light : h < .05 ? P.mid : P.base;
      if (inD && PL.road === 'cobble') { /* jalan kota: paving batu; bayangan rumput = digelapkan */
        const t = cobbleTile(), ti = ((((Y % 32) + 32) % 32) * 32 + (((X % 32) + 32) % 32)) * 3, up = (dx, dy) => cover(TG, lx + dx, ly + dy) >= 0;
        const k = up(0, -1) || up(0, -2) ? .78 : up(0, -3) || up(-1, 0) || up(1, 0) ? .9 : 1;
        D[i] = t[ti] * k; D[i + 1] = t[ti + 1] * k; D[i + 2] = t[ti + 2] * k; continue;
      }
      const up = (dx, dy) => cover(TG, lx + dx, ly + dy) >= 0 || (!inD && cover(TD, lx + dx, ly + dy) >= 0);
      if (up(0, -1) || up(0, -2)) c = P.dark; else if (up(0, -3) || up(-1, 0) || up(1, 0)) c = P.mid;
      else if (!inD && (cover(TS, lx, ly + 1) < 0 || cover(TS, lx, ly + 2) < 0)) c = P.mid; /* pasir basah di tepi air */
      const k = .97 + v * .06; D[i] = c[0] * k; D[i + 1] = c[1] * k; D[i + 2] = c[2] * k; continue;
    }
    // air gaya Sprout: rata, dangkal di kotak tepi, garis tepi tipis menempel daratan, kilau dari lembar air
    const edge = cover(TS, lx - 1, ly) >= 0 || cover(TS, lx + 1, ly) >= 0 || cover(TS, lx, ly - 1) >= 0 || cover(TS, lx, ly + 1) >= 0;
    const wb = !BI || biomeMask(M, BI, lx, ly, X, Y), WP = wb ? WS : WATER_S; /* air beku/keruh memudar ke air biasa di perbatasan */
    c = edge ? WP.line : !wb ? WP.base : cover(E.tl.wd, lx, ly) >= 0 ? WP.deep : cover(E.tl.wb, lx, ly) >= 0 ? WP.base : WP.shallow;
    const wt = E.wt; if (wt && !edge && hash(Math.floor(X / 16), Math.floor(Y / 16), 95) < .28) {
      const tx = Math.floor(X / 16), ty = Math.floor(Y / 16), ox = (hash(tx, ty, 93) * 16) | 0, oy = (hash(tx, ty, 94) * 16) | 0;
      const wi = ((((Y + oy) % 16 + 16) % 16) * wt.w + (((X + ox) % 16 + 16) % 16)) * 4; if (wt[wi] > 165) c = WP.spark;
    }
    D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2];
  }
  if (GRASS_EDGE.caves.includes(M.id) && typeof caveFaces === 'function') caveFaces(D, W, H, RX, RY, X0, E, lx => lx, (lx, ly) => cover(TG, lx, ly) >= 0);
  ctx.putImageData(im, 0, 0);
  if (typeof fitClipGround === 'function') fitClipGround(ctx, W, H, X0, Y0, M); /* tumpang-tindih benua: hanya pemilik titik yang tampil */
  return true;
}
