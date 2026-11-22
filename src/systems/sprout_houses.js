'use strict';
// RUMAH GAYA SPROUT — bangunan desa/kota digambar ulang lewat kode (piksel 2×, garis tepi cokelat lembut, palet hangat),
// identitas tiap bangunan dipertahankan (warna atap, kerangka kayu, cerobong, tenda toko, sayap samping, tungku pandai besi, kios).
// Ukuran kanvas = ukuran gambar GPT lama (tata letak & tabrakan tidak berubah). Gambar GPT diganti di IMGEL sebelum buildTextures.
// Matikan: SPROUT_HOUSES.on = false.
const SP_PAL = {
  o: [78, 52, 46], pl: [[244, 232, 206], [226, 210, 182], [196, 176, 150]], wd: [[182, 124, 84], [150, 96, 64], [112, 70, 50]],
  red: [[236, 124, 100], [206, 88, 72], [160, 60, 58]], brown: [[194, 136, 90], [162, 106, 72], [124, 80, 58]],
  st: [[206, 200, 190], [168, 160, 154], [128, 120, 120]], gl: [[170, 214, 224], [116, 166, 196]], door: [[170, 110, 70], [128, 80, 52]],
  fl: [[234, 98, 112], [250, 204, 92], [246, 160, 190]], lf: [[118, 168, 84], [86, 132, 66]], fire: [[255, 214, 110], [246, 140, 60], [200, 70, 50]],
  stripe: [[246, 240, 228], [214, 78, 72]], fruit: [[236, 86, 70], [250, 186, 72], [150, 196, 82]],
};
const SPROUT_HOUSES = {
  on: true,
  // kunci gambar → [lebar, tinggi, resep]
  list: {
    gpt_i_houseA: [100, 132, { roof: 'red', wall: 'pl', chim: 1, hc: 91 }], houseA: [100, 132, { roof: 'red', wall: 'pl', chim: 1, hc: 91 }],
    gpt_i_houseB: [100, 132, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 100 }],
    houseB: [100, 132, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 100 }],
    gpt_i_houseC: [100, 132, { roof: 'red', wall: 'pl', chim: 1, awning: 1, hc: 96 }],
    houseC: [100, 132, { roof: 'red', wall: 'pl', chim: 1, awning: 1, hc: 96 }],
    gpt_v_house_red_cottage: [131, 120, { roof: 'red', wall: 'pl', chim: 1, wide: 1, hc: 116 }],
    gpt_v_house_brown_cottage: [117, 120, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 116 }],
    gpt_v_blacksmith_forge: [135, 125, { roof: 'red', wall: 'pl', chim: 1, smith: 1, wide: 1, hc: 120 }],
    gpt_i_market: [100, 78, { stall: 1 }], market: [100, 78, { stall: 1 }],
  },
};
function spHouse(W, H, R) {
  const w = Math.round(W / 2), h = Math.round(H / 2), [c, x] = mk(w, h), im = x.createImageData(w, h), d = im.data, P = SP_PAL;
  const put = (X, Y, col) => { X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= w || Y >= h || !col) return;
  const i = (Y * w + X) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; };
  const rect = (x0, y0, rw, rh, col) => { for (let y = y0; y < y0 + rh; y++) for (let X = x0; X < x0 + rw; X++) put(X, y, col); };
  const box = (x0, y0, rw, rh, fill, ol = P.o) => { rect(x0, y0, rw, rh, ol); rect(x0 + 1, y0 + 1, rw - 2, rh - 2, fill); };
  const base = h - 3;
  for (let y = base - 2; y <= base + 2; y++) for (let X = 2; X < w - 2; X++) { const e = ((X - w / 2) / (w * .46)) ** 2 + ((y - base) / 2.6) ** 2;
  if (e < 1) { const i = (y * w + X) * 4; d[i] = 70; d[i + 1] = 96; d[i + 2] = 60; d[i + 3] = 60; } } /* bayangan tanah */
  if (R.stall) { spStall(w, h, base, put, rect, box); x.putImageData(im, 0, 0); return spScale(c, W, H); }
  const Hc = Math.round((R.hc || 96) / 2), ww = R.wide ? Math.round(w * .6) : Math.round(w * .64), wh = Math.round(Hc * .36);
  const wx = Math.round((w - ww) / 2) + (R.wing ? 4 : 0) - (R.awning ? 4 : 0), wy = base - wh;
  const RC = P[R.roof];
  // sayap samping (rumah cokelat): bangunan kecil di kiri dengan atap rendah
  if (R.wing) {
    const sx = wx - 13, sw = 15, sy = base - 11; box(sx, sy, sw, 11, P.wd[1]);
    for (let y = sy + 2; y < base - 1; y += 3) rect(sx + 1, y, sw - 2, 1, P.wd[2]);
    spRoof(put, sx - 2, sy - 9, sw + 3, 10, RC, 3); box(sx + 4, sy + 3, 5, 5, P.gl[0]); put(sx + 6, sy + 5, P.o);
  }
  // dinding: plester krem + kerangka kayu
  box(wx, wy, ww, wh + 1, P.pl[0]);
  rect(wx + 1, wy + 1, ww - 2, 2, P.pl[2]); /* bayangan atap */
  for (const bx of [wx + 1, wx + ww - 2, wx + Math.round(ww * .3), wx + Math.round(ww * .7)]) rect(bx, wy + 1, 1, wh - 1, P.wd[1]);
  rect(wx + 1, wy + 3, ww - 2, 1, P.wd[1]);
  if (!R.smith) { rect(wx + 1, base - 2, ww - 2, 3, P.st[1]); rect(wx + 1, base - 2, ww - 2, 1, P.st[0]);
  for (let X = wx + 2; X < wx + ww - 2; X += 5) put(X, base - 1, P.st[2]); }
  rect(wx + 1, wy + Math.round(wh * .55), ww - 2, 1, P.wd[1]); /* balok tengah */
  for (let y = wy + 4; y < base - 2; y++) for (let X = wx + Math.round(ww * .78); X < wx + ww - 1; X++) { const i = (y * w + X) * 4;
  if (d[i] === P.pl[0][0]) put(X, y, P.pl[1]); } /* sisi kanan lebih gelap */
  if (R.smith) { rect(wx + 1, base - 5, ww - 2, 5, P.st[1]);
  for (let X = wx + 1; X < wx + ww - 1; X += 4) rect(X, base - 5 + (X % 8 ? 0 : 2), 1, 2, P.st[2]); rect(wx + 1, base - 5, ww - 2, 1, P.st[0]); }
  // pintu lengkung di tengah + tangga batu
  const dx = Math.round(wx + ww / 2 - 3), dy = base - 9;
  box(dx, dy, 7, 10, P.door[0]); rect(dx + 1, dy, 5, 1, P.o); put(dx, dy + 1, null); rect(dx + 3, dy + 1, 1, 8, P.door[1]); put(dx + 5, dy + 5, P.fl[1]);
  rect(dx - 1, base + 1, 9, 2, P.st[1]); rect(dx - 1, base + 1, 9, 1, P.st[0]);
  box(dx + 8, dy + 1, 3, 4, P.fire[0]); put(dx + 9, dy, P.o); /* lentera di samping pintu */
  // jendela + kotak bunga
  for (const jx of [wx + Math.round(ww * .14), wx + Math.round(ww * .86) - 6]) {
    if (R.awning && jx > dx) continue;
    rect(jx - 2, wy + 5, 2, 6, R.roof === 'red' ? [96, 140, 110] : [92, 120, 160]);
    rect(jx + 6, wy + 5, 2, 6, R.roof === 'red' ? [96, 140, 110] : [92, 120, 160]);
    box(jx, wy + 5, 6, 6, P.gl[0]); rect(jx + 1, wy + 8, 4, 1, P.wd[1]); rect(jx + 3, wy + 6, 1, 4, P.wd[1]); put(jx + 1, wy + 6, [236, 246, 248]);
    rect(jx, wy + 11, 6, 2, P.wd[2]); for (let k = 0; k < 3; k++) { put(jx + 1 + k * 2, wy + 10, P.fl[k % 3]); put(jx + 2 + k * 2, wy + 10, P.lf[0]); }
  }
  // atap genteng bergerigi
  const rh = Math.round(Hc * .5); spRoof(put, wx - 5, wy - rh + 3, ww + 10, rh, RC, Math.round(rh * .28));
  rect(wx - 4, wy + 1, ww + 8, 1, RC[2]); rect(wx - 4, wy + 2, ww + 8, 1, SP_PAL.o); /* lis atap tebal */
  const rs = Math.round(rh * .28), hl = R.roof === 'red' ? [252, 168, 140] : [222, 170, 120];
  rect(wx - 3 + rs, wy - rh + 4, ww + 6 - 2 * rs, 1, hl); /* kilap bubungan */
  if (R.chim) { const cx = wx + Math.round(ww * .72), cy = wy - rh + 1; box(cx, cy - 4, 6, 10, P.st[1]); rect(cx, cy - 5, 6, 2, P.st[2]);
  rect(cx + 1, cy - 3, 1, 7, P.st[0]); rect(cx + 3, cy, 2, 1, P.st[2]); }
  // tenda toko bergaris + meja dagangan (kanan)
  if (R.awning) {
    const ax = wx + ww - 2, ay = wy + 4;
    for (let k = 0; k < 14; k++) for (let y = 0; y < 5; y++) put(ax + k, ay + y + Math.floor(k / 5), P.stripe[(k >> 1) & 1]);
    for (let k = 0; k < 14; k++) put(ax + k, ay + 5 + Math.floor(k / 5), P.o);
    box(ax + 1, base - 5, 12, 6, P.wd[1]); for (let k = 0; k < 5; k++) put(ax + 3 + k * 2, base - 6, P.fruit[k % 3]);
  }
  // pandai besi: tungku batu menyala (kiri), landasan & papan gantung
  if (R.smith) {
    const fx = wx - 13; box(fx, base - 13, 13, 14, P.st[1]); rect(fx + 1, base - 13, 11, 1, P.st[0]); box(fx + 3, base - 8, 7, 6, P.fire[2]);
    rect(fx + 4, base - 7, 5, 4, P.fire[1]); rect(fx + 5, base - 6, 3, 2, P.fire[0]); box(fx + 4, base - 19, 5, 7, P.st[2]);
    box(dx + 11, base - 3, 9, 3, P.st[2]); rect(dx + 13, base, 5, 2, P.st[2]); rect(dx + 12, base - 2, 7, 1, P.st[0]);
    rect(wx - 2, wy + 1, 1, 8, P.wd[2]); rect(wx - 8, wy + 1, 7, 1, P.wd[2]); box(wx - 9, wy + 3, 8, 7, P.wd[0]); box(wx - 7, wy + 5, 4, 3, P.st[2]);
  }
  // pagar kayu & tong di kaki rumah
  for (const [fx, fw] of [[2, Math.max(3, wx - (R.wing ? 16 : 4) - 2)], [wx + ww + (R.awning ? 14 : 3), w - (wx + ww + (R.awning ? 14 : 3)) - 2]]) {
    if (fw < 3) continue; rect(fx, base - 2, fw, 1, P.wd[1]); rect(fx, base, fw, 1, P.wd[2]);
    for (let X = fx; X < fx + fw; X += 3) { rect(X, base - 4, 1, 6, P.wd[2]); put(X, base - 4, P.wd[0]); }
  }
  for (const sx of [wx - (R.wing ? 17 : 3), wx + ww + (R.awning ? 14 : 2)]) { /* semak bunga di samping */
    if (R.smith && sx < wx) continue;
    for (let y = -4; y <= 0; y++) for (let X = -3; X <= 3; X++) if (X * X / 9 + y * y / 16 <= 1) put(sx + X, base + y, (X + y) % 3 ? P.lf[0] : P.lf[1]);
    put(sx - 1, base - 3, P.fl[0]); put(sx + 2, base - 2, P.fl[2]);
  }
  if (!R.smith) { const bx = wx + ww - 1 + (R.awning ? 13 : 2); if (bx + 5 < w) { box(bx, base - 5, 5, 6, P.wd[1]); rect(bx + 1, base - 3, 3, 1, P.wd[2]); } }
  x.putImageData(im, 0, 0); return spScale(c, W, H);
}
// atap genteng: trapesium, baris sisik bergerigi, puncak terang
function spRoof(put, x0, y0, rw, rh, C, slope) {
  for (let y = 0; y < rh; y++) {
    const inset = Math.round((rh - 1 - y) / rh * slope), L = x0 + inset, Rr = x0 + rw - 1 - inset;
    for (let X = L; X <= Rr; X++) {
      const edge = X === L || X === Rr || y === 0 || y === rh - 1, row = (rh - 1 - y) % 3, scal = row === 0 && (X + Math.floor(y / 3)) % 3 === 0;
      put(X, y0 + y, edge ? SP_PAL.o : y < 2 ? C[0] : row === 0 ? (scal ? C[2] : C[1]) : row === 2 && X % 3 === 1 ? C[0] : C[1]);
    }
  }
}
// kios pasar: tenda bergaris di dua tiang, meja kayu berisi buah & peti
function spStall(w, h, base, put, rect, box) {
  const P = SP_PAL, x0 = Math.round(w * .14), sw = Math.round(w * .66);
  rect(x0 + 1, base - 22, 1, 22, P.wd[2]); rect(x0 + sw - 2, base - 22, 1, 22, P.wd[2]);
  for (let y = 0; y < 7; y++) {
    const ins = Math.round((6 - y) / 2);
    for (let X = x0 - 2 + ins; X < x0 + sw + 2 - ins; X++) put(X, base - 28 + y, y === 0 ? P.o : P.stripe[((X - x0) >> 2) & 1]);
  }
  for (let X = x0 - 2; X < x0 + sw + 2; X++) put(X, base - 21 + ((X >> 1) & 1), P.o);
  box(x0, base - 9, sw, 10, P.wd[1]); rect(x0 + 1, base - 9, sw - 2, 1, P.wd[0]);
  for (let k = 0; k < sw - 4; k += 2) { put(x0 + 2 + k, base - 10, P.fruit[(k >> 1) % 3]); put(x0 + 3 + k, base - 11, P.fruit[((k >> 1) + 1) % 3]); }
  box(x0 + sw + 1, base - 6, 7, 7, P.wd[0]); rect(x0 + sw + 2, base - 3, 5, 1, P.wd[2]);
  rect(x0 + sw + 4, base - 30, 1, 8, P.wd[2]); box(x0 + sw + 3, base - 24, 3, 4, P.fire[0]);
}
function spScale(c, W, H) { const [o, x] = mk(W, H); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, W, H); o._sprout = 1; return o; }
const _buildTexturesHouses = buildTextures;
buildTextures = function (sc) {
  if (SPROUT_HOUSES.on && !buildTextures.housesDone) {
    for (const [k, [W, H, R]] of Object.entries(SPROUT_HOUSES.list)) if (IMGEL[k]) IMGEL[k] = spHouse(W, H, R);
    buildTextures.housesDone = 1;
  }
  return _buildTexturesHouses.apply(this, arguments);
};
