'use strict';
// Interior gaya lembar pemilik (assets/raw/interior/sheet_interior.png → tools/gen_interior.py → assets/img/int_*.png).
// Ruang ber-`sheet: 1`: dinding plester + balok kayu, lantai papan, bingkai kayu tebal, tikar & tangga batu di pintu,
// perabot `furn2: [[nama, x, y(bawah)], ...]` (x tengah, y dasar) dipanggang urut y. Dinding tabrakan dibuat otomatis.
const INT_SIZE = { fireplace: [28, 44], bed_red: [28, 39], bed_blue: [28, 39], wardrobe: [26, 37], bookshelf: [31, 38], hutch: [24, 32], chest: [20, 27],
  chest_iron: [21, 28], cupboard: [23, 26], barrel: [18, 27], stove: [23, 35], jarshelf: [37, 29], workbench: [40, 27], bench: [47, 26],
  table_flower: [55, 31], table_tea: [38, 33], flowerstand: [10, 30], drawer: [28, 33], table_cloth: [40, 26], chair: [16, 25], table_round: [22, 24],
  stool_sq: [18, 23], stool: [15, 23], crate: [22, 24], stool_low: [19, 21], rug_red: [34, 36], rug_green: [44, 36], rug_blue: [41, 33],
  planter_flowers: [23, 33], candlestand: [14, 35], bookcase_low: [33, 34], cupboard_fruit: [22, 35], pots: [24, 19], bucket: [14, 16], tub: [15, 17],
  utensil_rack: [32, 23], sofa: [36, 29], bucket2: [18, 20], sack: [19, 20], box_small: [19, 16], washtub: [21, 18], plant_palm: [21, 32],
  pot_flower_w: [18, 29], pot_flower_r: [19, 27], planter_box: [25, 26], plant_tall: [21, 34], painting: [33, 23], clock: [18, 38], banner_red: [19, 36],
  banner_blue: [19, 35], plant_table: [27, 24], lantern: [13, 22], plant_small: [16, 24], stairs: [37, 39], door: [34, 41] };
IMG_LIST.push(...Object.keys(INT_SIZE).map(k => 'int_' + k));
const INT_FLAT = /^rug_/, INT_WALL = /^(painting|banner_red|banner_blue|lantern)$/;   // tanpa tabrakan
// karpet dibentangkan 9-slice (bingkai & sudut 1:1 tetap tajam, tengah diisi pola polos, motif asli di tengah)
const INT_RUG = { rug_red: [72, 64], rug_green: [84, 64], rug_blue: [76, 60] };
function intDims(n) { return INT_RUG[n] || INT_SIZE[n] || [16, 16]; }
function rug9(x, im, X, Y, w, h) {
  const W0 = im.width, H0 = im.height, m = 7, cw = W0 - 2 * m, ch = H0 - 2 * m;
  for (let yy = m; yy < h - m; yy += 4) for (let xx = m; xx < w - m; xx += 4)                  // tengah polos
    x.drawImage(im, m + 1, m + 1, 4, 4, X + xx, Y + yy, Math.min(4, w - m - xx), Math.min(4, h - m - yy));
  for (let xx = m; xx < w - m; xx += cw) { const ww = Math.min(cw, w - m - xx);                  // tepi atas & bawah
    x.drawImage(im, m, 0, ww, m, X + xx, Y, ww, m); x.drawImage(im, m, H0 - m, ww, m, X + xx, Y + h - m, ww, m); }
  for (let yy = m; yy < h - m; yy += ch) { const hh = Math.min(ch, h - m - yy);                  // tepi kiri & kanan
    x.drawImage(im, 0, m, m, hh, X, Y + yy, m, hh); x.drawImage(im, W0 - m, m, m, hh, X + w - m, Y + yy, m, hh); }
  for (const [sx, sy, dx, dy] of [[0, 0, 0, 0], [W0 - m, 0, w - m, 0], [0, H0 - m, 0, h - m], [W0 - m, H0 - m, w - m, h - m]])
    x.drawImage(im, sx, sy, m, m, X + dx, Y + dy, m, m);
  x.drawImage(im, m, m, cw, ch, X + Math.round((w - cw) / 2), Y + Math.round((h - ch) / 2), cw, ch);  // motif asli di tengah
}
function genRoomSheet(M) {
  const mw = (M && M.w) || 320, mh = (M && M.h) || 320;
  const [c, x] = mk(mw, mh), [rx, ry, rw, rh] = (M && M.room) || [20, 20, mw - 40, mh - 40];
  const F = (col, a, b, w, h) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
  x.imageSmoothingEnabled = false;
  F('#140e0c', 0, 0, M.w, M.h);
  // lantai papan melintang: tinggi papan 6 px, panjang acak, sambungan gelap, sedikit mata kayu
  x.save(); x.beginPath(); x.rect(rx, ry, rw, rh); x.rect(140, ry + rh, 40, 10); x.clip();
  const FL = ['#c18349', '#ca8b4f', '#cf9353', '#b97c45', '#d6995a'];
  for (let r = 0; r * 6 < rh + 24; r++) {
    let X = rx - Math.floor(hash(r, 1, 7) * 40);
    while (X < rx + rw) {
      const L = 26 + Math.floor(hash(X, r, 8) * 40), y = ry + r * 6, col = FL[Math.floor(hash(X, r, 9) * FL.length)];
      F(col, X, y, L, 6); F('#d9a466', X, y, L, 1); F('#7c4a2a', X, y + 5, L, 1); F('#7c4a2a', X + L - 1, y, 1, 6);
      if (hash(X, r, 10) < .3) F('#9a6236', X + 6 + Math.floor(hash(X, r, 11) * (L - 12)), y + 2, 2, 1);
      X += L;
    }
  }
  x.restore();
  // dinding belakang: plester krem + balok atas + papan kayu bawah (wainscot) + tiang
  F('#e9c7a1', rx, ry - 36, rw, 30);
  for (let i = 0; i < 90; i++)
    F(hash(i, 3, 12) < .5 ? '#ddb88f' : '#f1d4b0', rx + Math.floor(hash(i, 1, 12) * rw), ry - 34 + Math.floor(hash(i, 2, 12) * 26), 2, 1);
  F('#8b5132', rx, ry - 8, rw, 8); F('#a9703f', rx, ry - 8, rw, 1); F('#5e3420', rx, ry - 1, rw, 1);
  F('#6d3b24', rx, ry - 40, rw, 5); F('#a3683c', rx, ry - 40, rw, 1);
  for (let X = rx; X < rx + rw; X += 52) { F('#6d3b24', X, ry - 36, 4, 30); F('#a3683c', X, ry - 36, 1, 30); }
  for (const wx of M.windows || []) {
    F('#4a2a18', wx - 1, ry - 32, 16, 14); F('#7ec4ee', wx, ry - 31, 14, 12);
    F('#d6f2ff', wx + 1, ry - 30, 4, 4); F('#4a2a18', wx + 6, ry - 31, 2, 12); F('#4a2a18', wx, ry - 26, 14, 1);
  }
  // bingkai kayu tebal (kiri, kanan, atas, bawah dengan celah pintu)
  const frame = (a, b, w, h) => {
    F('#2a140c', a - 1, b - 1, w + 2, h + 2); F('#7c4628', a, b, w, h);
    F('#a46a3c', a, b, w, 1); F('#5a3018', a, b + h - 1, w, 1);
  };
  frame(rx - 10, ry - 48, rw + 20, 8); frame(rx - 10, ry - 48, 10, rh + 58); frame(rx + rw, ry - 48, 10, rh + 58);
  const dl = 140, dr = 180; frame(rx - 10, ry + rh, dl - rx + 10, 10); frame(dr, ry + rh, rx + rw - dr + 10, 10);
  // pintu: tikar merah & tangga batu
  F('#3a2a26', dl, ry + rh + 10, dr - dl, 14); for (let i = 0; i < 3; i++) F(i % 2 ? '#a8a4a0' : '#bcb8b2', dl + 1 + i * 13, ry + rh + 11, 12, 12);
  F('#8a2e24', dl + 6, ry + rh - 2, dr - dl - 12, 7); F('#c8503c', dl + 8, ry + rh - 1, dr - dl - 16, 5); F('#e8b060', dl + 8, ry + rh + 1, dr - dl - 16, 1);
  // perabot (urut y), karpet duluan
  const L = (M.furn2 || []).slice().sort((a, b) => (INT_FLAT.test(b[0]) - INT_FLAT.test(a[0])) || a[2] - b[2]);
  for (const [n, X, Y, flip] of L) {
    const im = IMGEL['int_' + n]; if (!im) continue; const [w, h] = intDims(n);
    x.save(); if (flip) { x.translate(Math.round(X), 0); x.scale(-1, 1); x.translate(-Math.round(X), 0); }
    if (INT_RUG[n]) rug9(x, im, Math.round(X - w / 2), Math.round(Y - h), w, h); else x.drawImage(im, Math.round(X - w / 2), Math.round(Y - h), w, h);
    x.restore();
  }
  return c;
}
const _genRoom0 = genRoom;
genRoom = function (M) { return M.sheet ? genRoomSheet(M) : _genRoom0(M); };
// dinding tabrakan dari perabot (bagian bawah ±45% tinggi), dibuat sekali saat dimuat
function sheetWalls(M) {
  for (const [n, X, Y] of M.furn2 || []) {
    if (INT_FLAT.test(n) || INT_WALL.test(n)) continue; const [w, h] = intDims(n), hh = Math.max(8, Math.round(h * .45));
    M.walls.push([Math.round(X - w / 2 + 2), Math.round(Y - hh), Math.max(6, w - 4), hh - 2]);
  }
}
// daftarkan sprite interior sebagai tekstur Phaser (dipakai perabot rumah Arka yang bisa dipindah)
function regIntTex(T) { for (const k in INT_SIZE) { const n = 'int_' + k, img = IMGEL[n]; if (img && !T.exists(n)) T.addImage(n, img); } }
