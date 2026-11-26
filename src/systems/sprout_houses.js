'use strict';
// RUMAH GAYA SPROUT — bangunan desa/kota digambar ulang lewat kode (piksel 2×, garis tepi cokelat lembut, palet hangat),
// identitas tiap bangunan dipertahankan (warna atap, kerangka kayu, cerobong, tenda toko, sayap samping, tungku pandai besi, kios).
// Ukuran kanvas = ukuran gambar GPT lama (tata letak & tabrakan tidak berubah). Gambar GPT diganti di IMGEL sebelum buildTextures.
// Matikan: SPROUT_HOUSES.on = false.
const SP_PAL = {
  o: [72, 48, 42], pl: [[246, 236, 212], [228, 212, 184], [192, 172, 146]], wd: [[188, 130, 88], [152, 98, 64], [108, 68, 48]],
  red: [[240, 126, 102], [208, 88, 72], [156, 58, 56]], brown: [[196, 138, 92], [162, 108, 72], [120, 78, 56]],
  blue: [[126, 214, 228], [58, 152, 180], [28, 86, 118]],
  st: [[216, 212, 202], [172, 164, 156], [122, 114, 112]], gl: [[176, 218, 230], [120, 170, 200]], gl_hi: [250, 254, 255],
  door: [[172, 112, 72], [126, 78, 50]], fl: [[236, 96, 114], [252, 206, 90], [246, 158, 192]], lf: [[120, 172, 86], [84, 134, 64]],
  fire: [[255, 220, 114], [248, 144, 62], [202, 72, 52]], gold: [[255, 224, 118], [228, 178, 58]],
  shut_sage: [[108, 152, 122], [76, 114, 90]], shut_blue: [[114, 138, 168], [80, 104, 134]],
  smoke: [[246, 248, 252], [218, 226, 234], [182, 194, 206]], stripe: [[248, 242, 230], [216, 76, 70]],
  fruit: [[238, 84, 68], [252, 188, 70], [148, 198, 80]],
};
const SPROUT_HOUSES = {
  on: true,
  // kunci gambar → [lebar, tinggi, resep]
  list: {
    gpt_i_houseA: [100, 132, { roof: 'red', wall: 'pl', chim: 1, dormer: 1, hc: 114 }],
    houseA: [100, 132, { roof: 'red', wall: 'pl', chim: 1, dormer: 1, hc: 114 }],
    gpt_i_houseB: [100, 132, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 114 }],
    houseB: [100, 132, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 114 }],
    gpt_i_houseC: [100, 132, { roof: 'red', wall: 'pl', chim: 1, awning: 1, hc: 114 }],
    houseC: [100, 132, { roof: 'red', wall: 'pl', chim: 1, awning: 1, hc: 114 }],
    gpt_v_house_red_cottage: [131, 120, { roof: 'red', wall: 'pl', chim: 1, wide: 1, dormer: 1, hc: 112 }],
    gpt_v_house_brown_cottage: [117, 120, { roof: 'brown', wall: 'pl', chim: 1, wing: 1, hc: 112 }],
    gpt_v_blacksmith_forge: [135, 125, { roof: 'red', wall: 'pl', chim: 1, smith: 1, wide: 1, hc: 114 }],
    houseBlue: [136, 124, { roof: 'blue', wall: 'pl', chim: 1, dormer: 1, wing: 1, porch: 1, wide: 1, hc: 114 }],
    gpt_v_house_blue: [136, 124, { roof: 'blue', wall: 'pl', chim: 1, dormer: 1, wing: 1, porch: 1, wide: 1, hc: 114 }],
    gpt_i_market: [100, 78, { stall: 1 }], market: [100, 78, { stall: 1 }],
    gpt_v_market_stall: [110, 85, { stall: 1 }],
  },
};
// rumah 3/4: dinding depan plester & kerangka kayu + dinding samping kanan teduh + atap pelana bergenteng rapi
function spHouse(W, H, R) {
  const w = Math.round(W / 2), h = Math.round(H / 2), [c, x] = mk(w, h), im = x.createImageData(w, h), d = im.data, P = SP_PAL;
  const put = (X, Y, col, a = 255) => {
    X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= w || Y >= h || !col) return;
    const i = (Y * w + X) * 4;
    if (a < 255) {
      const s = a / 255, inv = 1 - s;
      d[i] = Math.round(col[0] * s + d[i] * inv); d[i + 1] = Math.round(col[1] * s + d[i + 1] * inv);
      d[i + 2] = Math.round(col[2] * s + d[i + 2] * inv); d[i + 3] = Math.min(255, Math.max(d[i + 3], a));
    } else {
      d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
    }
  };
  const rect = (x0, y0, rw, rh, col, a = 255) => { for (let y = y0; y < y0 + rh; y++) for (let X = x0; X < x0 + rw; X++) put(X, y, col, a); };
  const box = (x0, y0, rw, rh, fill, ol = P.o) => { rect(x0, y0, rw, rh, ol); rect(x0 + 1, y0 + 1, rw - 2, rh - 2, fill); };
  const base = h - 4;
  if (R.stall) { spStall(w, h, base, put, rect, box); x.putImageData(im, 0, 0); return spScale(c, W, H); }
  for (let y = base - 3; y <= base + 3; y++) for (let X = 2; X < w - 2; X++) {
    const e = ((X - w * .52) / (w * .45)) ** 2 + ((y - base + .5) / 3.2) ** 2;
    if (e < 1) put(X, y, [64, 88, 56], Math.round(70 * (1 - e)));
  }
  const Hc = Math.round((R.hc || 114) / 2), RC = P[R.roof];
  const D = R.wing ? 9 : R.smith ? 11 : Math.round(w * (R.wide ? .20 : .22));
  const Dy = Math.round(D * .45);
  const fw = R.wing ? Math.min(22, Math.round(w * .45)) : R.smith ? Math.round(w * .48) : Math.round(w * (R.wide ? .54 : .50));
  const fx = Math.round((w - fw - D) / 2) + (R.wing ? 7 : 0) - (R.awning ? 2 : 0) + (R.smith ? 4 : 0);
  const wh = Math.round(Hc * .38), wy = base - wh, rh = Math.round(Hc * .44);
  if (R.wing) {
    const wx = fx - 11, ww = 10;
    spBox3d(put, w, wx, ww, base - Math.round(wh * .76), base, 7, 3, Math.round(rh * .58), RC, 'wood');
    for (let i = 0; i < 3; i++) {
      box(wx + 1 + i * 3, base - 4, 3, 5, P.wd[1]); rect(wx + 1 + i * 3, base - 3, 2, 3, P.wd[0]); put(wx + 2 + i * 3, base - 2, P.wd[2]);
    }
  }
  if (R.smith) {
    const sx = fx - 16;
    box(sx, base - 16, 15, 17, P.st[1]); rect(sx + 1, base - 16, 13, 2, P.st[0]);
    box(sx + 3, base - 10, 9, 8, P.fire[2]); rect(sx + 4, base - 9, 7, 6, P.fire[1]); rect(sx + 5, base - 8, 5, 4, P.fire[0]);
    put(sx + 6, base - 7, [255, 255, 230]); put(sx + 7, base - 7, [255, 255, 230]);
    put(sx + 5, base - 12, P.fire[0]); put(sx + 9, base - 13, P.fire[1]); put(sx + 7, base - 15, P.fire[0]);
    box(sx + 5, base - 26, 6, 11, P.st[2]); rect(sx + 6, base - 25, 2, 9, P.st[1]); rect(sx + 4, base - 27, 8, 2, P.st[0]);
    put(sx + 8, base - 29, P.smoke[1], 200); put(sx + 9, base - 31, P.smoke[0], 160);
    box(sx + 2, base - 5, 4, 5, P.wd[2]); rect(sx + 1, base - 7, 6, 3, P.st[1]); rect(sx, base - 7, 2, 1, P.st[0]); rect(sx + 2, base - 8, 4, 1, P.st[0]);
    box(sx + 11, base - 5, 5, 5, P.wd[1]); rect(sx + 12, base - 4, 3, 2, P.gl[1]);
  }
  const g = spBox3d(put, w, fx, fw, wy, base, D, Dy, rh, RC, 'plaster');
  // pintu lengkung kokoh + engsel besi + kenop kuningan + tangga batu bertingkat
  const dw = 9, dh = 13, dx = Math.round(fx + fw * .48 - dw / 2), dy = base - dh + 1;
  box(dx, dy, dw, dh, P.door[0]); put(dx, dy, null); put(dx + dw - 1, dy, null);
  rect(dx + 1, dy + 1, dw - 2, 1, P.door[0]); rect(dx + 3, dy + 2, 1, dh - 2, P.door[1]); rect(dx + 6, dy + 2, 1, dh - 2, P.door[1]);
  put(dx + 1, dy + 3, P.o); put(dx + 2, dy + 3, P.st[2]); put(dx + 1, dy + dh - 4, P.o); put(dx + 2, dy + dh - 4, P.st[2]);
  put(dx + dw - 3, dy + Math.round(dh * .55), P.gold[0]); put(dx + dw - 3, dy + Math.round(dh * .55) + 1, P.gold[1]);
  rect(dx - 1, base + 1, dw + 2, 2, P.st[1]); rect(dx - 1, base + 1, dw + 2, 1, P.st[0]); rect(dx, base + 2, dw, 1, P.st[2]);
  if (R.porch) {
    const px = dx - 2, pw = dw + 4, pwy = dy - 2, pay = pwy - 4;
    box(px, pay, pw, pwy - pay + 2, RC[0]);
    rect(px, pwy + 2, 1, base - (pwy + 2), P.wd[1]);
    rect(px + pw - 1, pwy + 2, 1, base - (pwy + 2), P.wd[2]);
  }
  // lentera dinding antik menyala hangat
  const lx = dx + dw + 2, ly = dy + 3;
  put(lx - 1, ly + 1, P.o); box(lx, ly, 3, 5, P.fire[0]); rect(lx + 1, ly + 1, 1, 3, [255, 255, 235]); put(lx + 1, ly - 1, P.o);
  rect(lx - 2, ly, 1, 4, P.fire[1], 80); rect(lx + 3, ly, 1, 4, P.fire[1], 80);
  // jendela depan berdaun jendela + kilau kaca + kotak bunga
  const shutCol = R.roof === 'red' ? P.shut_sage : P.shut_blue;
  for (const jx of [fx + Math.round(fw * .13), fx + Math.round(fw * .86) - 7]) {
    if (R.awning && jx > dx) continue;
    const jy = wy + Math.round(wh * .26);
    rect(jx - 3, jy, 2, 8, shutCol[0]); rect(jx - 3, jy + 2, 2, 1, shutCol[1]); rect(jx - 3, jy + 5, 2, 1, shutCol[1]);
    rect(jx + 8, jy, 2, 8, shutCol[0]); rect(jx + 8, jy + 2, 2, 1, shutCol[1]); rect(jx + 8, jy + 5, 2, 1, shutCol[1]);
    box(jx, jy, 7, 8, P.gl[0]);
    put(jx + 1, jy + 2, P.gl_hi); put(jx + 2, jy + 3, P.gl_hi); put(jx + 4, jy + 2, P.gl_hi); put(jx + 5, jy + 3, P.gl_hi);
    rect(jx + 1, jy + 4, 5, 1, P.wd[1]); rect(jx + 3, jy + 1, 1, 6, P.wd[1]);
    box(jx - 1, jy + 8, 9, 3, P.wd[2]);
    for (let k = 0; k < 4; k++) { put(jx + k * 2, jy + 7, P.lf[k % 2]); put(jx + 1 + k * 2, jy + 7, P.fl[k % 3]); put(jx + k * 2, jy + 8, P.fl[(k + 1) % 3]); }
  }
  // jendela samping teralis kayu
  const sjx = g.x1 + Math.round(D * .35), sjy = wy + Math.round(wh * .28) - Math.round(D * .35 * Dy / D);
  box(sjx, sjy, 5, 6, P.gl[1]); rect(sjx + 1, sjy + 2, 3, 1, P.wd[2]); rect(sjx + 2, sjy + 1, 1, 4, P.wd[2]);
  // jendela loteng atap depan (dormer)
  if (R.dormer) {
    const dmx = Math.round(fx + fw * .35), dmy = wy - Math.round(rh * .42);
    box(dmx - 1, dmy - 4, 8, 4, RC[0]); put(dmx + 3, dmy - 5, P.o);
    box(dmx, dmy, 6, 6, P.pl[0]); rect(dmx + 1, dmy + 1, 4, 4, P.gl[0]); put(dmx + 2, dmy + 2, P.gl_hi); rect(dmx + 1, dmy + 3, 4, 1, P.wd[1]);
  }
  // jendela loteng bulat di pelana samping
  const ax = g.ax, ay = g.ay;
  for (let ddy = -2; ddy <= 2; ddy++) for (let ddx = -2; ddx <= 2; ddx++) {
    if (ddx * ddx + ddy * ddy <= 4) put(ax + ddx, ay + Math.round(rh * .46) + ddy, ddx * ddx + ddy * ddy >= 3 ? P.o : P.gl[1]);
  }
  put(ax, ay + Math.round(rh * .46), P.wd[1]);
  // cerobong batu & kepulan asap mungil lembut
  if (R.chim) {
    const cx = fx + Math.round(fw * .72), cy = wy - Math.round(rh * .58);
    box(cx, cy - 8, 7, 12, P.st[1]); rect(cx, cy - 9, 7, 2, P.st[0]);
    rect(cx + 1, cy - 7, 2, 8, P.st[0]); rect(cx + 4, cy - 7, 2, 9, P.st[2]); rect(cx + 1, cy - 9, 5, 1, P.o);
    const puffs = [[cx + 3, cy - 11, 1.3, P.smoke[0], 220], [cx + 5, cy - 14, 1.8, P.smoke[0], 190],
      [cx + 8, cy - 18, 2.4, P.smoke[1], 150], [cx + 11, cy - 22, 2.8, P.smoke[2], 90]];
    for (const [px, py, pr, pcol, palpha] of puffs) {
      if (py - pr < 2) continue;
      for (let sy = -Math.ceil(pr); sy <= Math.ceil(pr); sy++) for (let sx = -Math.ceil(pr); sx <= Math.ceil(pr); sx++) {
        if (sx * sx + sy * sy <= pr * pr && py + sy >= 2) put(px + sx, py + sy, pcol, palpha);
      }
    }
  }
  // tenda toko bergaris & etalase dagangan
  if (R.awning) {
    const aax = fx + fw - 4, aay = wy + Math.round(wh * .2);
    for (let k = 0; k < 18; k++) {
      const drop = Math.floor(k / 5);
      for (let y = 0; y < 6; y++) put(aax + k, aay + y + drop, P.stripe[(k >> 1) & 1]);
      put(aax + k, aay + 6 + drop + (k % 3 === 1 ? 1 : 0), P.o);
    }
    rect(aax + 16, aay + 7, 1, base - (aay + 7), P.wd[2]);
    box(aax + 1, base - 7, 15, 8, P.wd[1]); rect(aax + 2, base - 7, 13, 1, P.wd[0]);
    for (let k = 0; k < 6; k++) { put(aax + 3 + k * 2, base - 8, P.fruit[k % 3]); put(aax + 4 + k * 2, base - 9, P.fruit[(k + 1) % 3]); }
  }
  if (R.smith) {
    rect(fx - 2, wy + 2, 1, 9, P.wd[2]); rect(fx - 9, wy + 2, 8, 1, P.wd[2]);
    box(fx - 10, wy + 4, 9, 8, P.wd[0]); put(fx - 6, wy + 6, P.st[2]); put(fx - 5, wy + 6, P.st[2]); rect(fx - 6, wy + 7, 2, 4, P.wd[2]);
  }
  // tong kayu di pekarangan
  if (!R.smith) {
    const bx = g.x1 + D + (R.awning ? 10 : 2);
    if (bx + 6 <= w - 2) {
      box(bx, base - 7, 6, 8, P.wd[1]); rect(bx + 1, base - 7, 4, 1, P.wd[0]);
      rect(bx + 1, base - 5, 4, 1, P.o); rect(bx + 1, base - 2, 4, 1, P.o);
    }
  }
  // semak bunga di sudut rumah
  for (const sx of [Math.max(4, fx - (R.wing ? 18 : 4)), Math.min(w - 5, g.x1 + D + (R.awning ? 8 : 7))]) {
    if (R.smith && sx < fx) continue;
    for (let y = -4; y <= 0; y++) for (let X = -3; X <= 3; X++) if ((X * X) / 10 + (y * y) / 18 <= 1) put(sx + X, base + y, (X + y) % 3 ? P.lf[0] : P.lf[1]);
    put(sx - 1, base - 3, P.fl[0]); put(sx + 2, base - 2, P.fl[1]); put(sx, base - 1, P.fl[2]);
  }
  // pagar kayu desa
  for (const [px0, pw] of [
    [2, Math.max(0, fx - (R.wing ? 20 : 6) - 2)],
    [g.x1 + D + (R.awning ? 12 : 9), Math.max(0, w - (g.x1 + D + (R.awning ? 12 : 9)) - 2)]
  ]) {
    if (pw < 4) continue;
    rect(px0, base - 3, pw, 1, P.wd[1]); rect(px0, base - 1, pw, 1, P.wd[2]);
    for (let X = px0; X < px0 + pw; X += 4) { rect(X, base - 6, 2, 7, P.wd[1]); rect(X + 1, base - 6, 1, 7, P.wd[2]); put(X, base - 7, P.wd[0]); }
  }
  x.putImageData(im, 0, 0); return spScale(c, W, H);
}
// satu bangunan 3/4: dinding depan [hx, hx+hw), dinding samping D (naik Dy), atap pelana genteng berarsir indah
function spBox3d(put, w, hx, hw, wy, base, D, Dy, rH, RC, side) {
  const P = SP_PAL, x1 = hx + hw - 1, wood = side === 'wood';
  const fill = (pts, colAt) => {
    const ys = pts.map(p => p[1]), y0 = Math.floor(Math.min(...ys)), y1 = Math.ceil(Math.max(...ys));
    for (let y = y0; y <= y1; y++) {
      const xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= y + .5 && by > y + .5) || (by <= y + .5 && ay > y + .5)) xs.push(ax + ((y + .5 - ay) * (bx - ax)) / (by - ay));
      }
      if (xs.length < 2) continue; xs.sort((a, b) => a - b);
      const L = Math.round(xs[0]), R = Math.round(xs[xs.length - 1]) - 1;
      for (let X = L; X <= R; X++) put(X, y, colAt(X, y, X === L || X === R));
    }
  };
  const seg = (xa, ya, xb, yb, col, th = 1) => {
    const n = Math.ceil(Math.max(Math.abs(xb - xa), Math.abs(yb - ya)));
    for (let k = 0; k <= n; k++) for (let o = 0; o < th; o++) put(xa + ((xb - xa) * k) / n + o, ya + ((yb - ya) * k) / n, col);
  };
  // dinding samping (teduh dalam bayangan)
  fill([[x1, wy], [x1 + D, wy - Dy], [x1 + D, base - Dy], [x1, base]], (X, y, e) => {
    if (e) return P.o; if (wood) return y % 3 ? P.wd[2] : P.o;
    if (X >= x1 + D - 2) return P.wd[2];
    const curBase = base - Math.round(((X - x1) / D) * Dy);
    return y >= curBase - 3 ? P.st[2] : P.pl[2];
  });
  // dinding depan (plester hangat + balok kayu sudut + fondasi batu alam)
  fill([[hx, wy], [x1 + 1, wy], [x1 + 1, base + 1], [hx, base + 1]], (X, y, e) => {
    if (e || y === base) return P.o; if (wood) return y % 3 ? P.wd[1] : P.wd[2];
    if (y <= wy + 2) return P.pl[2];
    if (y >= base - 3) {
      const isMortar = (X % 4 === 0 && y === base - 1) || (X % 4 === 2 && y === base - 2) || y === base - 3;
      return isMortar ? P.st[2] : (X + y) % 3 === 0 ? P.st[0] : P.st[1];
    }
    if (X === hx + 1 || X === hx + 2 || X === x1 - 1 || X === x1) return X === hx + 1 ? P.wd[0] : P.wd[1];
    if (y === wy + 3 || y === wy + Math.round((base - wy) * .46)) return P.wd[1];
    if (X === hx + Math.round(hw * .32) || X === hx + Math.round(hw * .68)) return P.wd[1];
    return X > hx + hw * .8 ? P.pl[1] : P.pl[0];
  });
  // segitiga pelana di samping kanan
  const ax = x1 + Math.round(D * .5), ay = wy - Math.round(Dy * .5) - rH;
  fill([[x1, wy], [x1 + D, wy - Dy], [ax, ay]], (X, y, e) => e ? P.o : wood ? P.wd[2] : Math.abs(X - ax) <= 1 && y > ay + 3 ? P.wd[2] : P.pl[2]);
  // bidang atap depan genteng teratur
  const e0 = [hx - 3, wy + 2], e1 = [x1 + 3, wy + 2], r0 = [hx - 3 + Math.round(D * .5), ay], r1 = [ax + 1, ay];
  fill([e0, e1, r1, r0], (X, y, e) => {
    if (e || y <= Math.round(ay)) return P.o;
    if (y >= wy + 1) return P.wd[2];
    if (y <= ay + 2) return (X % 3 === 0) ? RC[0] : RC[1];
    const distFromEaves = (wy + 2 - y), course = Math.floor(distFromEaves / 3), sub = distFromEaves % 3;
    const seam = (X + course * 3) % 5 === 0;
    if (sub === 0) return RC[2];
    if (sub === 2) return seam ? RC[2] : RC[0];
    return seam ? RC[2] : RC[1];
  });
  // lis pelana kiri (bargeboard) & kanan
  seg(hx - 3, wy + 2, r0[0], ay, P.wd[0], 2); seg(hx - 4, wy + 2, r0[0] - 1, ay, P.o, 1);
  seg(x1 + 3, wy + 2, ax + 1, ay, P.o);
  fill([[ax, ay], [ax + 3, ay], [x1 + D + 4, wy - Dy + 2], [x1 + D + 1, wy - Dy + 2]], (X, y, e) => e ? P.o : RC[2]);
  seg(ax, ay, x1 + D + 1, wy - Dy + 2, P.o); seg(ax + 3, ay, x1 + D + 4, wy - Dy + 2, P.o);
  return { x1, ax, ay };
}
// kios pasar: tenda bergaris melengkung, tiang kayu penyangga, etalase buah bertingkat & lentera
function spStall(w, h, base, put, rect, box) {
  const P = SP_PAL, x0 = Math.round(w * .12), sw = Math.round(w * .72);
  rect(x0 + 2, base - 26, 2, 26, P.wd[2]); rect(x0 + sw - 3, base - 26, 2, 26, P.wd[2]);
  for (let i = 0; i < 5; i++) { put(x0 + 3 + i, base - 23 + i, P.wd[1]); put(x0 + sw - 4 - i, base - 23 + i, P.wd[2]); }
  for (let y = 0; y < 9; y++) {
    const ins = Math.round((8 - y) / 2);
    for (let X = x0 - 3 + ins; X < x0 + sw + 3 - ins; X++) {
      const isEdge = y === 0 || X === x0 - 3 + ins || X === x0 + sw + 2 - ins;
      put(X, base - 33 + y, isEdge ? P.o : P.stripe[((X - x0) >> 2) & 1]);
    }
  }
  for (let X = x0 - 3; X < x0 + sw + 3; X++) put(X, base - 24 + ((X >> 1) & 1), P.o);
  box(x0, base - 11, sw, 12, P.wd[1]); rect(x0 + 1, base - 11, sw - 2, 1, P.wd[0]);
  for (let k = 0; k < sw - 6; k += 3) {
    put(x0 + 3 + k, base - 12, P.fruit[(k >> 1) % 3]); put(x0 + 4 + k, base - 13, P.fruit[((k >> 1) + 1) % 3]);
    put(x0 + 3 + k, base - 14, P.fruit[((k >> 1) + 2) % 3]);
  }
  box(x0 + sw + 1, base - 7, 8, 8, P.wd[0]); rect(x0 + sw + 2, base - 4, 6, 1, P.wd[2]);
  box(x0 - 7, base - 6, 6, 7, P.pl[1]); put(x0 - 5, base - 7, P.wd[2]);
  rect(x0 + sw - 2, base - 28, 1, 6, P.wd[2]); box(x0 + sw - 3, base - 22, 3, 4, P.fire[0]);
}
function spScale(c, W, H) { const [o, x] = mk(W, H); x.imageSmoothingEnabled = false; x.drawImage(c, 0, 0, W, H); o._sprout = 1; return o; }
if (typeof window !== 'undefined') window.artHouseBlue = () => spHouse(136, 124, SPROUT_HOUSES.list.houseBlue[2]);
const _buildTexturesHouses = buildTextures;
buildTextures = function (sc) {
  if (SPROUT_HOUSES.on && !buildTextures.housesDone) {
    for (const [k, [W, H, R]] of Object.entries(SPROUT_HOUSES.list)) if (IMGEL[k]) IMGEL[k] = spHouse(W, H, R);
    buildTextures.housesDone = 1;
  }
  return _buildTexturesHouses.apply(this, arguments);
};
