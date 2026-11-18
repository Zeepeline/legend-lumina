'use strict';
// Desa Lumina versi isometrik (prototipe). Satuan ubin = 16 px dunia. Peta 40×40 ubin.
// "Atas layar" = x+y kecil. Dataran tinggi (z=1) di pojok atas dengan tangga batu, desa di tengah, padang serigala di bawah.
const IMAP = {
  N: 40,
  plaza: [24, 24, 4.2],
  houses: [ // tapak ubin [tx, ty, w, d] + gaya
    { t: [13, 25, 4, 3], roof: ['#c9a24e', '#a8843c', '#8a6a2e'], chimney: 1 },
    { t: [27, 14, 4, 3], roof: ['#b0583c', '#8e4430', '#6e3426'] },
    { t: [14, 18, 3, 3], roof: ['#c9a24e', '#a8843c', '#8a6a2e'], wallCol: '#d9c39a', wallColDk: '#b39a70' },
    { t: [31, 23, 4, 3], roof: ['#b0583c', '#8e4430', '#6e3426'], chimney: 1 },
    { t: [22, 32, 4, 3], roof: ['#9a7a4a', '#7d6038', '#62492a'], wallCol: '#cfb48a', wallColDk: '#a98e64', name: 'Rumah Arka' },
  ],
  pond: [35, 18, 3.2],
  rot: [30.5, 31.5, 2.4], /* tanah rusak di sekitar kristal retak (sarang serigala) */
  farms: [[6, 26, 5, 5]],
  paths: [ // ruas jalan tanah [tx1, ty1, tx2, ty2, lebar ubin]
    [24, 24, 10.5, 8.5, 1.6], [24, 24, 34, 12, 1.4], [24, 24, 24, 30, 1.5], [24, 24, 38, 30, 1.4], [24, 24, 12, 29, 1.3], [24, 30, 31, 33, 1.6],
  ],
  // tangga dari dataran tinggi: zona miring (jumlah ubin s = tx+ty antara 14.5..18, selisih d = tx-ty antara -1..3)
  ramp: { s0: 14.6, s1: 18, d0: -.6, d1: 2.6 },
  plateauS: 16,
};
// tinggi (dalam satuan lantai) di posisi dunia (px)
function zAt(x, y) {
  const s = (x + y) / ISO.T, d = (x - y) / ISO.T, R = IMAP.ramp;
  if (d >= R.d0 && d <= R.d1 && s >= R.s0 && s <= R.s1) return clampN((R.s1 - s) / (R.s1 - R.s0), 0, 1);
  return s < IMAP.plateauS ? 1 : 0;
}
function segDist(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, t = clampN(((px - ax) * vx + (py - ay) * vy) / (vx * vx + vy * vy || 1), 0, 1);
  return Math.hypot(px - ax - vx * t, py - ay - vy * t);
}
// jenis tanah per ubin
function terrainAt(tx, ty) {
  const cx = tx + .5, cy = ty + .5, P = IMAP.plaza, wob = (hash2(tx, ty, 9) - .5) * .7;
  if (Math.hypot(cx - IMAP.pond[0], cy - IMAP.pond[1]) < IMAP.pond[2] + wob * .6) return 'water';
  if (Math.hypot(cx - IMAP.rot[0], cy - IMAP.rot[1]) < IMAP.rot[2] + wob) return 'rot';
  for (const [fx, fy, fw, fh] of IMAP.farms) if (tx >= fx && tx < fx + fw && ty >= fy && ty < fy + fh) return 'farm';
  if (Math.hypot(cx - P[0], cy - P[1]) < P[2] + wob * .3) return 'stone';
  const R = IMAP.ramp, s = cx + cy, d = cx - cy; if (d >= R.d0 && d <= R.d1 && s >= R.s0 - .3 && s <= R.s1 + .2) return 'stone';
  for (const [ax, ay, bx, by, w] of IMAP.paths) if (segDist(cx, cy, ax, ay, bx, by) < w * .5 + wob * .35 + .25) return 'dirt';
  if (s < IMAP.plateauS && hash2(tx, ty, 4) < .05) return 'dirt';
  return 'grass';
}

// panggang seluruh tanah ke satu kanvas; kembalikan { c, ox, oy } (ox,oy = posisi layar titik dunia 0,0 di kanvas)
function bakeGround() {
  const N = IMAP.N, T = ISO.T, ox = N * T + 24, oy = ISO.ZH + 24, W = N * 2 * T + 48, H = N * T + ISO.ZH + 64;
  const c = mkCanvas(W, H), x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  const cache = {}, tile = (k, v) => cache[k + v] || (cache[k + v] = tileCanvas(k, v));
  const ter = [], zt = [];
  for (let ty = 0; ty < N; ty++) { ter[ty] = []; zt[ty] = []; for (let tx = 0; tx < N; tx++) { ter[ty][tx] = terrainAt(tx, ty); zt[ty][tx] = zAt((tx + .5) * T, (ty + .5) * T); } }
  const scr = (tx, ty, z) => [ox + (tx - ty) * T - T, oy + (tx + ty) * T / 2 - z * ISO.ZH];
  const order = []; for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) order.push([tx, ty]);
  // urut: lantai rendah dulu, lalu menurut x+y
  order.sort((a, b) => (zt[a[1]][a[0]] - zt[b[1]][b[0]]) || (a[0] + a[1] - b[0] - b[1]));
  for (const [tx, ty] of order) {
    const z = zt[ty][tx], k = ter[ty][tx], [sx, sy] = scr(tx, ty, z);
    // muka tebing di bawah ubin yang lebih tinggi dari tetangga depannya (kiri-bawah: ty+1, kanan-bawah: tx+1)
    const zl = ty + 1 < N ? zt[ty + 1][tx] : 0, zr = tx + 1 < N ? zt[ty][tx + 1] : 0;
    const face = (dz, left) => {
      const h = Math.round(dz * ISO.ZH); if (h < 2) return;
      for (let i = 0; i < 16; i++) for (let j = 0; j < h; j++) {
        const px = left ? sx + i : sx + 16 + i, py = (left ? sy + 8 + i / 2 : sy + 16 - i / 2) + j, n = hash2(tx * 16 + i, ty * 16 + j, left ? 1 : 2);
        const pal = left ? PAL.cliffL : PAL.cliffR, strata = (j + Math.floor(hash2(tx, i >> 2, 3) * 3)) % 7 === 0;
        x.fillStyle = j < 2 ? PAL.grassRim : j > h - 3 ? PAL.cliffRoot : strata || n < .06 ? PAL.cliffRoot : pal[Math.floor(n * 3)];
        x.fillRect(Math.floor(px), Math.floor(py), 1, 1);
      }
    };
    face(z - zl, true); face(z - zr, false);
    x.drawImage(tile(k, Math.floor(hash2(tx, ty, 1) * 4)), sx, sy);
  }
  // tepi rumput bergerigi daun di atas jalan/batu/tanah garapan (rumput "menjorok" lembut)
  for (const [tx, ty] of order) {
    if (ter[ty][tx] !== 'grass') continue; const z = zt[ty][tx], [sx, sy] = scr(tx, ty, z);
    const nb = [[0, -1, 16, 4], [1, 0, 24, 8], [0, 1, 16, 12], [-1, 0, 8, 8]];
    for (const [dx, dy] of nb) {
      const qx = tx + dx, qy = ty + dy; if (qx < 0 || qy < 0 || qx >= N || qy >= N) continue;
      const k2 = ter[qy][qx]; if (k2 === 'grass' || k2 === 'water' || Math.abs(zt[qy][qx] - z) > .1) continue;
      for (let i = 0; i < 4; i++) {
        const t = (i + .5) / 4, ex = dx === 1 ? 16 + t * 16 : dx === -1 ? t * 16 : dy === -1 ? 16 + t * 16 : t * 16;
        const ey = dx === 1 ? t * 8 + 8 : dx === -1 ? t * 8 : dy === -1 ? t * 8 : 8 + t * 8;
        const bx = sx + ex + (dx - dy) * 2.2, by = sy + ey + (dx + dy) * 1.1, r = 1.6 + hash2(tx * 5 + i, ty, 7) * 1.4;
        x.fillStyle = PAL.grassRim; x.beginPath(); x.ellipse(Math.round(bx), Math.round(by + 1), r + .5, r * .7, 0, 0, 7); x.fill();
        x.fillStyle = PAL.grass[hash2(i, tx, ty) < .5 ? 0 : 3]; x.beginPath(); x.ellipse(Math.round(bx), Math.round(by), r, r * .6, 0, 0, 7); x.fill();
      }
    }
  }
  crispAlpha(c);
  return { c, ox, oy, ter, zt };
}

// objek dunia: [kunci gambar, tx, ty, skala, tabrak radius px]
function isoProps() {
  const P = [], N = IMAP.N, used = new Set(), ter = (tx, ty) => terrainAt(tx, ty);
  const add = (k, tx, ty, s = 1, r = 6, o = {}) => { P.push(Object.assign({ k, x: (tx + .5) * ISO.T, y: (ty + .5) * ISO.T, s, r }, o)); used.add(tx + ',' + ty); };
  add('gpt_v_village_well', 24, 24, .5, 12);
  add('bigtree', 4, 6, 1, 30, { tree: 1 }); add('benchWood', 4, 10, 1, 6); add('lampPost', 10, 4, 1, 3); add('lampPost', 6, 10, 1, 3);
  add('lampPost', 20, 21, 1, 3); add('lampPost', 27, 27, 1, 3); add('benchWood', 26, 20, 1, 6); add('gpt_barrel', 18, 23, 1, 4); add('gpt_barrel', 19, 23, 1, 4);
  add('crateCart', 29, 21, 1, 10);
  const inHouse = (tx, ty) => IMAP.houses.some(h => tx >= h.t[0] - 1 && tx <= h.t[0] + h.t[2] && ty >= h.t[1] - 1 && ty <= h.t[1] + h.t[3]);
  // pohon: sabuk hutan di tepi peta + rumpun di dataran tinggi & padang
  for (let ty = 0; ty < N; ty++) for (let tx = 0; tx < N; tx++) {
    if (used.has(tx + ',' + ty) || ter(tx, ty) !== 'grass' || inHouse(tx, ty)) continue;
    const edge = Math.min(tx, ty, N - 1 - tx, N - 1 - ty), h = hash2(tx, ty, 21), s = tx + ty;
    const arena = tx >= 25 && tx <= 37 && ty >= 28 && ty <= 37;
    const dens = arena ? (edge < 2 ? .5 : .01) : edge < 2 ? .55 : edge < 4 ? .2 : s < IMAP.plateauS ? .07 : (s > 56 && Math.abs(tx - ty) > 8) ? .06 : .015;
    if (h < dens) { add(hash2(tx, ty, 22) < .15 ? 'apple1' : 'treeA', tx, ty, hash2(tx, ty, 22) < .15 ? .5 : .8 + hash2(tx, ty, 23) * .35, 7, { tree: 1 }); continue; }
    const h2 = hash2(tx, ty, 31);
    if (h2 < .05) add(['bushG1', 'bushG2', 'bushP'][Math.floor(hash2(tx, ty, 32) * 3)], tx, ty, .7, 5);
    else if (h2 < .065) add(hash2(tx, ty, 33) < .5 ? 'gpt_verdant_rock_med' : 'gpt_verdant_stump', tx, ty, .8, 6);
    else if (h2 < .2) P.push({ k: ['deco_fl_y1', 'deco_fl_p2', 'deco_tuft', 'deco_pebbles', 'deco_mushroom'][Math.floor(hash2(tx, ty, 34) * 5)],
      x: (tx + hash2(tx, ty, 35)) * ISO.T, y: (ty + hash2(tx, ty, 36)) * ISO.T, s: 1, r: 0, flat: 1 });
  }
  // hutan di luar batas peta (hiasan, tanpa tabrakan) agar tidak ada ruang kosong di tepi
  for (let t = -4; t < N + 4; t++) for (let k = 1; k <= 4; k++) for (const [tx, ty] of [[t, -k], [-k, t], [t, N - 1 + k], [N - 1 + k, t]]) {
    if (hash2(tx + 99, ty + 99, k) < .62) P.push({ k: 'treeA', x: (tx + hash2(tx, ty, 51)) * ISO.T, y: (ty + hash2(tx, ty, 52)) * ISO.T, s: .85 + hash2(tx, ty, 53) * .4, r: 0, tree: 1 });
  }
  return P;
}
