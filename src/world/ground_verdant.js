'use strict';
// Tanah Verdant (Padang, Hutan, Desa) meniru assets/reference/target_padang.png.
// Logika sama dengan tools/gen_ground_preview.py. Petak: tools/gen_ground_ref.py → assets/img/gnd_*.png, ornamen deco_*.png.
const VERDANT = { forest: 1, meadow: 1, village: 1 };
const VBAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const VDECO = ['tuft', 'sprout_a', 'sprout_b', 'sprout_c', 'flower_w', 'flower_w2', 'flower_w3', 'flower_b', 'flower_b2', 'flowers', 'flowers_w',
  'mushroom', 'pebble', 'pebbles', 'reeds', ...['w', 'p', 'y', 'v'].flatMap(c => [1, 2, 3].map(n => 'fl_' + c + n))];
IMG_LIST.push('gnd_grass', 'gnd_grass_light', 'gnd_grass_dark', 'gnd_dirt', ...VDECO.map(k => 'deco_' + k));
let VT = null;
function verdantTiles() {
  if (VT) return VT;
  const t = ['gnd_grass', 'gnd_grass_light', 'gnd_grass_dark', 'gnd_dirt'].map(getTileData);
  if (t.every(Boolean)) VT = t;
  return VT;
}
const vMod = v => ((v % 128) + 128) % 128;
// nilai bercak tanah (0..1) pada koordinat global
const vDirtN = (X, Y) => vnoise(X, Y, 30, 13) * .75 + vnoise(X, Y, 9, 14) * .25;
const vDirtT = M => M.ground === 'village' ? .70 : M.ground === 'forest' ? .76 : .74;
// warna tanah verdant per piksel (X, Y global); null = petak belum termuat
function verdantPix(M, X, Y, path) {
  const T = verdantTiles(); if (!T) return null;
  const t = VBAY[(Y & 3) * 4 + (X & 3)] / 16 - .5, ti = (vMod(Y) * 128 + vMod(X)) * 4;
  let s;
  if (path || vDirtN(X, Y) > vDirtT(M) + t * .05) s = T[3];
  else {
    const v = vnoise(X, Y, 56, 11) * .75 + vnoise(X, Y, 20, 12) * .25;
    s = v > .6 + t * .1 ? T[1] : v < .4 + t * .1 ? T[2] : T[0];
  }
  return [s[ti], s[ti + 1], s[ti + 2]];
}
// ornamen: grid 22 px global + geser acak, digambar ke kanvas tanah (x sudah ditranslasi -RX,-RY)
function verdantDeco(x, M, rect, GX, GY, sd, near) {
  const [RX, RY, RW, RH] = rect, C = 22, fm = M.flowers ? 2 : 1, forest = M.ground === 'forest';
  const W = [['tuft', .18], ['sprout_c', .03], ['sprout_a', .015], ['fl_w', .12 * fm], ['fl_p', .07 * fm], ['fl_y', .04 * fm], ['fl_v', .03 * fm],
    ['mushroom', forest ? .01 : 0]];
  for (let cy = Math.floor((RY + GY - 24) / C); cy <= Math.floor((RY + RH + GY) / C); cy++) {
    for (let cx = Math.floor((RX + GX - 24) / C); cx <= Math.floor((RX + RW + GX) / C); cx++) {
      const X = cx * C + Math.floor(hash(cx, cy, 61) * 16) - GX, Y = cy * C + Math.floor(hash(cx, cy, 62) * 16) - GY;
      if (X < 0 || Y < 0 || X > M.w - 8 || Y > M.h - 8) continue;
      if (sd(X + 4, Y + 6) < 4 || near(X + 4, Y + 6)) continue;
      let r = hash(cx, cy, 63), k = null;
      if (vDirtN(X + GX + 4, Y + GY + 6) > vDirtT(M)) k = r < .12 ? 'pebble' : null;
      else for (const [n, p] of W) { if (r < p) { k = n; break; } r -= p; }
      if (!k) continue;
      if (k.startsWith('fl_')) k += 1 + Math.floor(hash(cx, cy, 64) * 3);
      const im = IMGEL['deco_' + k]; if (!im) continue;
      if (X + im.width < RX || X > RX + RW || Y + im.height < RY || Y > RY + RH) continue;
      x.drawImage(im, X, Y);
    }
  }
}
// kaki batu/semak/tunggul ditumbuhi rumput (dipanggil bakeGround setelah bayangan; x ditranslasi -RX,-RY)
const VBASE = /rock|bush|stump|log/;
function verdantBase(x, M, rect) {
  if (!VERDANT[M.ground] || M.indoor) return;
  const im = IMGEL.deco_tuft; if (!im) return;
  if (!M._vbase) M._vbase = mapObjects(M).filter(o => VBASE.test(o[0]) && OBJ[o[0]]).map(o => [o[1], o[2], (OBJ[o[0]].col || [16])[0] + 8]);
  const [RX, RY, RW, RH] = rect || [0, 0, M.w, M.h];
  for (const [ox, oy, w] of M._vbase) {
    if (ox + w < RX - 16 || ox - w > RX + RW + 16 || oy < RY - 8 || oy - 20 > RY + RH) continue;
    const n = 3 + Math.floor(hash(ox, oy, 71) * 3);
    for (let k = 0; k < n; k++) {
      const X = Math.round(ox + (hash(ox, oy, 72 + k) - .5) * w * 1.15 - im.width / 2), Y = Math.round(oy - im.height + 3 + hash(ox, oy, 80 + k) * 4);
      x.drawImage(im, X, Y);
    }
  }
}
// air sungai & danau gaya Verdant: biru-hijau dalam, tepi dangkal berdither, riak garis pendek (X, Y global; t 0 = tengah, 1 = tepi)
const VWC = { deep: [40, 96, 126], mid: [52, 122, 150], shal: [80, 156, 168], line: [150, 212, 214], spark: [218, 244, 238] };
function verdantWater(t, X, Y) {
  const b = VBAY[(Y & 3) * 4 + (X & 3)] / 16 - .5, v = t + b * .07 + vnoise(X, Y, 64, 21) * .25 - .12;
  let c = v > .8 ? VWC.shal : v > .45 ? VWC.mid : VWC.deep;
  const cx = Math.floor(X / 14), cy = Math.floor(Y / 7);
  if (t < .85 && hash(cx, cy, 91) < .22) {
    const x0 = cx * 14 + Math.floor(hash(cx, cy, 92) * 8), y0 = cy * 7 + Math.floor(hash(cx, cy, 93) * 5), L = 2 + Math.floor(hash(cx, cy, 94) * 4);
    if (Y === y0 && X >= x0 && X < x0 + L) c = L > 4 ? VWC.spark : VWC.line;
  }
  return c;
}
// tepi air: sisi utara = dinding tanah kecil (terlihat dari selatan), sisi selatan = garis gelap tipis; null = rumput biasa
function verdantBank(M, d, X, Y, north) {
  if (d < 1.2) return [36, 60, 40];
  if (north && d < 3.6) return (VBAY[(Y & 3) * 4 + (X & 3)] < 6 ? [82, 64, 44] : [106, 84, 56]);
  if (!north && d < 2.4) { const c = verdantPix(M, X, Y); return c && c.map(v => v * .72); }
  return null;
}
