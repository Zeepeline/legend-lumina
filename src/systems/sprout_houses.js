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
// rumah 3/4: dinding depan (terang) + dinding samping kanan menjorok ke belakang (gelap), atap pelana:
// bidang miring depan bergenteng + segitiga pelana di sisi samping; cahaya dari kiri-depan
function spHouse(W, H, R) {
  const w = Math.round(W / 2), h = Math.round(H / 2), [c, x] = mk(w, h), im = x.createImageData(w, h), d = im.data, P = SP_PAL;
  const put = (X, Y, col) => {
    X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= w || Y >= h || !col) return;
    const i = (Y * w + X) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
  };
  const rect = (x0, y0, rw, rh, col) => { for (let y = y0; y < y0 + rh; y++) for (let X = x0; X < x0 + rw; X++) put(X, y, col); };
  const box = (x0, y0, rw, rh, fill, ol = P.o) => { rect(x0, y0, rw, rh, ol); rect(x0 + 1, y0 + 1, rw - 2, rh - 2, fill); };
  const base = h - 3;
  if (R.stall) { spStall(w, h, base, put, rect, box); x.putImageData(im, 0, 0); return spScale(c, W, H); }
  for (let y = base - 3; y <= base + 2; y++) for (let X = 1; X < w - 1; X++) { /* bayangan tanah */
    const e = ((X - w * .55) / (w * .47)) ** 2 + ((y - base + .5) / 3) ** 2; if (e < 1) { const i = (y * w + X) * 4; d[i] = 70; d[i + 1] = 96;
    d[i + 2] = 60; d[i + 3] = 64; }
  }
  const Hc = Math.round((R.hc || 96) / 2), RC = P[R.roof];
  const D = Math.round(w * (R.wide ? .19 : .2)), Dy = Math.round(D * .5); /* kedalaman samping (ke kanan-atas) */
  const fw = Math.round(w * (R.wide ? .54 : .48)), fx = Math.round((w - fw - D) / 2) + (R.wing ? 5 : 0) - (R.awning ? 4 : 0);
  const wh = Math.round(Hc * .34), wy = base - wh, rh = Math.round(Hc * .44); /* tinggi dinding & tinggi atap di atas lis */
  const house = (hx, hw, hy, hD, hDy, rH, RCc, wallSide) => spBox3d(put, d, w, hx, hw, hy, base, hD, hDy, rH, RCc, wallSide);
  if (R.wing) house(fx - 14, 13, base - Math.round(wh * .75), 9, 5, Math.round(rh * .55), RC, 'wood');
  if (R.smith) { /* tungku batu menyala di kiri */
    const sx = fx - 13; box(sx, base - 13, 13, 14, P.st[1]); rect(sx + 1, base - 13, 11, 1, P.st[0]); box(sx + 3, base - 8, 7, 6, P.fire[2]);
    rect(sx + 4, base - 7, 5, 4, P.fire[1]); rect(sx + 5, base - 6, 3, 2, P.fire[0]); box(sx + 4, base - 20, 5, 8, P.st[2]);
    rect(sx + 5, base - 19, 1, 6, P.st[1]);
  }
  const g = house(fx, fw, wy, D, Dy, rh, RC, 'plaster');
  // pintu lengkung + tangga + lentera
  const dx = Math.round(fx + fw / 2 - 3), dy = base - 9;
  box(dx, dy, 7, 10, P.door[0]); put(dx, dy, null); put(dx + 6, dy, null); rect(dx + 3, dy + 1, 1, 8, P.door[1]); put(dx + 5, dy + 5, P.fl[1]);
  rect(dx - 1, base + 1, 9, 2, P.st[1]); rect(dx - 1, base + 1, 9, 1, P.st[0]); box(dx + 8, dy + 1, 3, 4, P.fire[0]); put(dx + 9, dy, P.o);
  // jendela depan (+ daun jendela & kotak bunga)
  const shut = R.roof === 'red' ? [96, 140, 110] : [92, 120, 160];
  for (const jx of [fx + Math.round(fw * .12), fx + Math.round(fw * .88) - 6]) {
    if (R.awning && jx > dx) continue;
    rect(jx - 2, wy + 5, 2, 6, shut); rect(jx + 6, wy + 5, 2, 6, shut); box(jx, wy + 5, 6, 6, P.gl[0]);
    rect(jx + 1, wy + 8, 4, 1, P.wd[1]); rect(jx + 3, wy + 6, 1, 4, P.wd[1]); put(jx + 1, wy + 6, [236, 246, 248]);
    rect(jx, wy + 11, 6, 2, P.wd[2]); for (let k = 0; k < 3; k++) { put(jx + 1 + k * 2, wy + 10, P.fl[k % 3]); put(jx + 2 + k * 2, wy + 10, P.lf[0]); }
  }
  // jendela kecil di dinding samping (miring mengikuti kedalaman)
  for (let k = 0; k < 4; k++) for (let y = 0; y < 5; y++) {
    put(g.x1 + 3 + k, wy + 6 + y - Math.round((3 + k) * Dy / D), k === 0 || k === 3 || y === 0 || y === 4 ? P.o : P.gl[1]);
  }
  // cerobong di bidang atap
  if (R.chim) { const cx = fx + Math.round(fw * .7), cy = wy - Math.round(rh * .55); box(cx, cy - 6, 6, 9, P.st[1]); rect(cx, cy - 7, 6, 2, P.st[2]);
  rect(cx + 1, cy - 5, 1, 6, P.st[0]); rect(cx + 4, cy - 5, 1, 7, P.st[2]); }
  // tenda toko bergaris + meja dagangan (kanan depan)
  if (R.awning) {
    const ax = fx + fw - 3, ay = wy + 4;
    for (let k = 0; k < 15; k++) for (let y = 0; y < 5; y++) put(ax + k, ay + y + Math.floor(k / 5), P.stripe[(k >> 1) & 1]);
    for (let k = 0; k < 15; k++) put(ax + k, ay + 5 + Math.floor(k / 5), P.o);
    box(ax + 1, base - 5, 13, 6, P.wd[1]); rect(ax + 2, base - 5, 11, 1, P.wd[0]); for (let k = 0; k < 5; k++) put(ax + 3 + k * 2, base - 6, P.fruit[k % 3]);
  }
  if (R.smith) { /* landasan & papan gantung */
    box(dx + 11, base - 3, 9, 3, P.st[2]); rect(dx + 13, base, 5, 2, P.st[2]); rect(dx + 12, base - 2, 7, 1, P.st[0]);
    rect(fx - 2, wy + 1, 1, 8, P.wd[2]); rect(fx - 8, wy + 1, 7, 1, P.wd[2]); box(fx - 9, wy + 3, 8, 7, P.wd[0]); box(fx - 7, wy + 5, 4, 3, P.st[2]);
  }
  // semak bunga, pagar & tong
  for (const sx of [fx - (R.wing ? 17 : 3), g.x1 + D + (R.awning ? 9 : 2)]) {
    if (R.smith && sx < fx) continue;
    for (let y = -4; y <= 0; y++) for (let X = -3; X <= 3; X++) if (X * X / 9 + y * y / 16 <= 1) put(sx + X, base + y, (X + y) % 3 ? P.lf[0] : P.lf[1]);
    put(sx - 1, base - 3, P.fl[0]); put(sx + 2, base - 2, P.fl[2]);
  }
  for (const [px0, pw] of [[1, Math.max(0, fx - (R.wing ? 19 : 6))], [g.x1 + D + 6, w - (g.x1 + D + 6) - 1]]) {
    if (pw < 3) continue; rect(px0, base - 2, pw, 1, P.wd[1]); rect(px0, base, pw, 1, P.wd[2]);
    for (let X = px0; X < px0 + pw; X += 3) { rect(X, base - 4, 1, 6, P.wd[2]); put(X, base - 4, P.wd[0]); }
  }
  x.putImageData(im, 0, 0); return spScale(c, W, H);
}
// satu bangunan 3/4: dinding depan [hx, hx+hw), dinding samping selebar hD (naik hDy), atap pelana setinggi rH di atas lis
function spBox3d(put, d, w, hx, hw, wy, base, D, Dy, rH, RC, side) {
  const P = SP_PAL, x1 = hx + hw - 1, wood = side === 'wood';
  const fill = (pts, colAt) => { /* isi poligon cembung per baris */
    const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs = []; for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) xs.push(ax + (y + .5 - ay) * (bx - ax) / (by - ay)); }
      if (xs.length < 2) continue; xs.sort((a, b) => a - b); const L = Math.round(xs[0]), R = Math.round(xs[xs.length - 1]) - 1;
      for (let X = L; X <= R; X++) put(X, y, colAt(X, y, X === L || X === R));
    }
  };
  // dinding samping (gelap) + kerangka
  const sideCol = (X, y, e) => e ? P.o : wood ? (y % 3 ? P.wd[2] : P.o) : (X === x1 + D - 1 ? P.wd[2] : P.pl[2]);
  fill([[x1, wy], [x1 + D, wy - Dy], [x1 + D, base - Dy], [x1, base]], sideCol);
  // dinding depan
  fill([[hx, wy], [x1 + 1, wy], [x1 + 1, base + 1], [hx, base + 1]], (X, y, e) => {
    if (e || y === base) return P.o; if (wood) return y % 3 ? P.wd[1] : P.wd[2];
    if (y < wy + 2) return P.pl[2]; /* bayangan lis */
    if (X === hx + 1 || X === x1 - 1 || X === hx + Math.round(hw * .3) || X === hx + Math.round(hw * .7) || y === wy + 3) return P.wd[1]; /* kerangka kayu */
    if (y >= base - 2) return y === base - 2 ? P.st[0] : P.st[1]; /* pondasi batu */
    return X > hx + hw * .82 ? P.pl[1] : P.pl[0];
  });
  // segitiga pelana di samping (di atas dinding samping)
  const ax = x1 + D / 2, ay = wy - Dy / 2 - rH;
  fill([[x1, wy], [x1 + D, wy - Dy], [ax, ay]], (X, y, e) => e ? P.o : wood ? P.wd[2] : (Math.abs(X - ax) < 1 && y > ay + 2 && y < ay + 5 ? P.wd[1] : P.pl[1]));
  // bidang atap depan: dari lis (menjorok 2 px) sampai bubungan (geser ke belakang)
  const e0 = [hx - 3, wy + 2], e1 = [x1 + 2, wy + 2], r0 = [hx - 3 + D / 2, ay], r1 = [ax + 1, ay];
  fill([e0, e1, r1, r0], (X, y, e) => {
    if (e || y <= Math.round(ay)) return P.o;
    const v = (wy + 2 - y) / (wy + 2 - ay), row = Math.floor(v * rH / 3), sub = (v * rH / 3) % 1;
    if (y >= wy + 1) return RC[2]; /* tepi lis */
    if (v > .9) return RC[0]; /* kilap bubungan */
    return sub < .3 ? ((X + row) % 3 === 0 ? RC[2] : RC[1]) : sub > .75 && X % 3 === 1 ? RC[0] : RC[1];
  });
  // lis atap: tepi kanan atap depan (ke puncak pelana) & atap belakang tampak di sisi kanan pelana
  const seg = (xa, ya, xb, yb, col, th = 1) => { const n = Math.ceil(Math.max(Math.abs(xb - xa), Math.abs(yb - ya)));
  for (let k = 0; k <= n; k++) for (let o = 0; o < th; o++) put(xa + (xb - xa) * k / n + o, ya + (yb - ya) * k / n, col); };
  seg(x1 + 2, wy + 2, ax + 1, ay, P.o);
  fill([[ax, ay], [ax + 3, ay], [x1 + D + 3, wy - Dy + 2], [x1 + D, wy - Dy + 2]], (X, y, e) => e ? P.o : RC[2]); /* atap belakang (tebal) */
  seg(ax, ay, x1 + D, wy - Dy, P.o);
  if (!wood) { const vx = Math.round(ax), vy = Math.round(ay + rH * .45);
  for (let k = -1; k <= 1; k++) for (let y = 0; y < 3; y++) put(vx + k, vy + y, k && y !== 1 ? P.o : P.wd[2]); } /* lubang angin pelana */
  return { x1, ax, ay };
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
