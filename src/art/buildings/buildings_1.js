'use strict';
// Gambar bangunan & properti buatan kode (1) — isi: lihat docs/CODEMAP.md
function artHouse(v) {
  const W = 86, H = 108, [c, x] = mk(W, H);
  const roofs = ['#ee8530', '#f0782a', '#ec8f36', '#e97a2e', '#f28a34', '#e8802a'];
  const R = roofs[v % roofs.length], Rl = shade(R, .28), Rd = shade(R, -.2), Rdd = shade(R, -.42);
  const wall = '#f8e9c8', wallD = '#e4cc9c', tim = '#8a5a32', timD = '#5e3b20';
  const L = 10, Rr = 75, wy = 56, fy = 94;
  // dinding
  fr(x, wall, L, wy, Rr - L + 1, fy - wy);
  fr(x, wallD, L, wy, Rr - L + 1, 4);
  fr(x, wallD, Rr - 3, wy, 4, fy - wy);
  // rangka kayu
  fr(x, tim, L, wy, 2, fy - wy); fr(x, tim, Rr - 1, wy, 2, fy - wy); fr(x, tim, L, wy + 4, Rr - L + 1, 2);
  for (let i = 0; i < 8; i++) { px(x, timD, L + 2 + i, wy + 6 + i); px(x, timD, Rr - 2 - i, wy + 6 + i); }
  // fondasi batu
  for (let xx = L - 1; xx <= Rr + 1; xx++) for (let y = fy; y < fy + 7; y++) {
    const row = Math.floor((y - fy) / 3), off = row % 2 ? 3 : 0, mort = (y - fy) % 3 === 2 || (xx + off) % 7 === 0;
    px(x, mort ? '#857f78' : (hash(Math.floor((xx + off) / 7), row, v) > .5 ? '#b5afa6' : '#a29c93'), xx, y);
  }
  // pintu
  const dx = 35, dw = 16, dy = 66;
  for (let y = dy; y < fy; y++) for (let i = 0; i < dw; i++) {
    const ax = i - dw / 2 + .5, ay = y - (dy + 8);
    if (ay < 0 && ax * ax + ay * ay > 64) continue;
    const edge = i === 0 || i === dw - 1 || (ay < 0 && ax * ax + ay * ay > 44);
    px(x, edge ? timD : (i % 4 === 1 ? '#7e4a26' : (i < 3 ? '#b8784a' : '#a2643a')), dx + i, y);
  }
  fr(x, '#ffd84a', dx + 12, dy + 15, 2, 2);
  fr(x, '#cfc8b8', dx - 2, fy, dw + 4, 3); fr(x, '#ebe5d6', dx - 1, fy, dw + 2, 1);
  // jendela + kotak bunga
  const win = (wx, wy2) => {
    fr(x, timD, wx - 1, wy2 - 1, 14, 13); fr(x, '#8fd0ee', wx, wy2, 12, 11);
    fr(x, '#c8eeff', wx, wy2, 12, 3); fr(x, '#d8f6ff', wx + 1, wy2 + 1, 3, 4);
    fr(x, timD, wx + 5, wy2, 2, 11); fr(x, timD, wx, wy2 + 5, 12, 1);
    fr(x, '#7a4a26', wx - 2, wy2 + 12, 16, 4); fr(x, '#9a643a', wx - 2, wy2 + 12, 16, 1);
    const fl = ['#ff6a8a', '#ffd84a', '#ffffff', '#c86aff', '#ff8a3a'];
    for (let i = 0; i < 7; i++) { const fx = wx - 1 + i * 2; fr(x, '#3f8a34', fx, wy2 + 10, 2, 2); px(x, fl[(i + v) % fl.length], fx, wy2 + 9 + (i % 2)); }
  };
  win(16, 67); win(58, 67);
  // atap
  const peak = 3, eave = 60, top = 4;
  for (let y = peak; y <= eave; y++) {
    const hw = 7 + (y - peak) * (36 / (eave - peak));
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const X = 43 + i; if (X < 0 || X >= W) continue;
      const ly = (y - top) % 5, row = Math.floor((y - top) / 5), off = row % 2 ? 3 : 0;
      let col = i < 0 ? mix(R, Rl, .35) : R;
      if (ly === 4) col = Rd; else if ((X + off) % 6 === 0 && ly < 3) col = shade(col, -.1);
      else if (ly === 0) col = shade(col, .12);
      const edge = hw - Math.abs(i);
      if (edge < 2.2) col = Rdd; else if (edge < 3.4) col = i < 0 ? Rl : R;
      if (y >= eave - 1) col = Rdd;
      px(x, col, X, y);
    }
  }
  // segitiga gable depan
  const gp = 26, gb = 56, ghw = 22;
  for (let y = gp; y <= gb; y++) {
    const hw = (y - gp) * (ghw / (gb - gp));
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const edge = hw - Math.abs(i);
      let col = edge < 2 ? Rdd : edge < 4 ? timD : wall;
      if (col === wall && y > gb - 3) col = wallD;
      px(x, col, 43 + i, y);
    }
  }
  fr(x, tim, 21, gb - 1, 45, 2);
  fr(x, tim, 42, gp + 6, 2, gb - gp - 6);
  ellF(x, timD, 43, 44, 5.5, 5.5); ellF(x, '#8fd0ee', 43, 44, 4, 4); ellF(x, '#d8f6ff', 42, 43, 1.6, 1.6); fr(x, timD, 42, 39, 2, 10);
  // cerobong
  const chx = 60;
  for (let y = 1; y < 28; y++) for (let i = 0; i < 9; i++) {
    const row = Math.floor(y / 3), mort = y % 3 === 2 || (i + (row % 2 ? 2 : 0)) % 4 === 0;
    px(x, mort ? '#6a666e' : (i < 3 ? '#b2aeb4' : '#9a969e'), chx + i, y);
  }
  fr(x, '#5a565e', chx - 1, 0, 11, 3); fr(x, '#7e7a82', chx - 1, 0, 11, 1); fr(x, '#2a2630', chx + 1, 0, 7, 1);
  return outline(c, '#3a2418');
}
// ---------- air mancur (3 frame) ----------
function artFountain() {
  const frames = [];
  for (let f = 0; f < 3; f++) {
    const W = 74, H = 62, cx = 37, [c, x] = mk(W, H);
    ellF(x, '#7e786e', cx, 44, 35, 15); ellF(x, '#bdb6aa', cx, 42, 35, 15); ellF(x, '#e2ddd2', cx, 41, 34, 14);
    fr(x, '#9e978b', cx - 35, 44, 71, 8); ellF(x, '#8e877b', cx, 52, 35, 6);
    for (let i = -34; i <= 34; i += 7) fr(x, '#857e72', cx + i, 45, 1, 7);
    ellF(x, '#2e7ac0', cx, 42, 29, 10.5); ellF(x, '#4aa6e2', cx, 43, 28, 9.5);
    for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + f * .5, r = 10 + (i % 3) * 5; fr(x, '#a8e8ff', Math.round(cx + Math.cos(a) * r * 1.6), Math.round(43 + Math.sin(a) * r * .5), 3, 1); }
    fr(x, '#9e978b', cx - 4, 22, 9, 20); fr(x, '#d6d0c4', cx - 4, 22, 3, 20); fr(x, '#857e72', cx + 3, 22, 2, 20);
    ellF(x, '#8e877b', cx, 23, 13, 5); ellF(x, '#e2ddd2', cx, 22, 13, 4.5); ellF(x, '#4aa6e2', cx, 22, 10, 3); ellF(x, '#a8e8ff', cx - 3, 21, 3, 1);
    fr(x, '#bdb6aa', cx - 2, 10, 5, 12); fr(x, '#e2ddd2', cx - 2, 10, 2, 12); ellF(x, '#d6d0c4', cx, 10, 3.5, 2);
    for (let s = -1; s <= 1; s += 2) for (let t = 0; t < 12; t++) {
      const X = cx + s * (3 + t * 1.15), Y = 7 + t * .2 + t * t * .14;
      if ((t + f) % 3 !== 0) { px(x, '#d8f6ff', X, Y); px(x, '#7ccff2', X, Y + 1); }
    }
    for (let s = -1; s <= 1; s += 2) for (let t = 0; t < 14; t++) {
      const X = cx + s * (12 + t * .55), Y = 24 + t * 1.3;
      if ((t + f) % 3 !== 1) { px(x, '#d8f6ff', X, Y); px(x, '#7ccff2', X + s, Y); }
    }
    for (let t = 0; t < 3; t++) px(x, '#ffffff', cx + Math.round(Math.sin(f * 2 + t * 2) * 6), 4 - t);
    frames.push(outline(c, '#4a443c'));
  }
  return strip(frames);
}
function artWell() {
  const W = 32, H = 40, cx = 16, [c, x] = mk(W, H);
  fr(x, '#6e4222', 3, 4, 3, 26); fr(x, '#6e4222', 26, 4, 3, 26); fr(x, '#9a643a', 3, 4, 1, 26); fr(x, '#9a643a', 26, 4, 1, 26);
  for (let i = 0; i < 6; i++) { fr(x, '#c0582a', 1 + i, 4 - i * .5, 30 - i * 2, 1); }
  fr(x, '#a04420', 0, 4, 32, 2); fr(x, '#e07a3a', 4, 0, 24, 2); fr(x, '#d0682e', 2, 2, 28, 2);
  fr(x, '#5e3b20', 6, 10, 20, 2); fr(x, '#3a2a1a', cx, 12, 1, 8);
  fr(x, '#8a5a32', cx - 3, 18, 7, 5); fr(x, '#b07a46', cx - 3, 18, 7, 1); fr(x, '#5e3b20', cx - 3, 20, 7, 1);
  ellF(x, '#8e877b', cx, 30, 14, 6); fr(x, '#9e978b', 2, 28, 29, 8); ellF(x, '#8e877b', cx, 36, 14, 3.5);
  for (let y = 28; y < 37; y++) for (let i = 2; i < 31; i++) { const row = Math.floor((y - 28) / 3), m = (y - 28) % 3 === 2 || (i + (row % 2 ? 3 : 0)) % 6 === 0; if (m) px(x, '#6e685e', i, y); else if (i < 8) px(x, '#bab3a6', i, y); }
  ellF(x, '#d6d0c4', cx, 28, 14, 5); ellF(x, '#2a3a4a', cx, 28, 10, 3); ellF(x, '#3a5a7a', cx, 28.5, 8, 2);
  return outline(c, '#3a2a1e');
}
function artStall() {
  const W = 70, H = 56, [c, x] = mk(W, H);
  fr(x, '#5e3b20', 4, 10, 3, 42); fr(x, '#5e3b20', 63, 10, 3, 42);
  // atap kain bergaris
  for (let y = 4; y < 18; y++) for (let i = 0; i < 70; i++) { const st = Math.floor(i / 7) % 2; px(x, y > 15 ? (st ? '#c83a3a' : '#e8e0d0') : (st ? '#e8524a' : '#fff6e6'), i, y); }
  for (let i = 0; i < 10; i++) { ellF(x, Math.floor(i) % 2 ? '#c83a3a' : '#e8e0d0', 3.5 + i * 7, 18, 3.5, 2.5); }
  fr(x, '#8a5a32', 0, 2, 70, 3); fr(x, '#b07a46', 0, 2, 70, 1);
  // meja
  fr(x, '#8a5a32', 2, 32, 66, 20); for (let i = 2; i < 68; i += 6) fr(x, '#6e4222', i, 34, 1, 18);
  fr(x, '#c08a50', 0, 30, 70, 4); fr(x, '#e0aa6a', 0, 30, 70, 1);
  // keranjang buah
  const bask = (bx, col, hl) => { fr(x, '#a87a3a', bx, 25, 14, 6); fr(x, '#7a5422', bx, 28, 14, 1);
    for (let i = 0; i < 6; i++) { const X = bx + 1 + (i % 3) * 4, Y = 21 + Math.floor(i / 3) * 3; fr(x, col, X, Y, 4, 4); px(x, hl, X + 1, Y + 1); } };
  bask(4, '#e5372c', '#ff9a8a'); bask(20, '#ff9420', '#ffd08a'); bask(36, '#6cbc3a', '#b4ec7a'); bask(52, '#b83a6a', '#f08ab0');
  return outline(c, '#3a2418');
}
function artBoard() {
  const [c, x] = mk(26, 26);
  fr(x, '#6e4222', 11, 14, 4, 12); // tiang
  fr(x, '#b07a46', 2, 2, 22, 14); // papan
  fr(x, '#d09a5e', 2, 2, 22, 2); // highlight
  fr(x, '#8a5a32', 2, 14, 22, 2); // bayangan bawah
  // kertas pengumuman tempel
  fr(x, '#fff8e8', 5, 5, 7, 8); fr(x, '#d85a3a', 8, 4, 2, 2); // pin merah
  fr(x, '#fff8e8', 14, 5, 8, 8); fr(x, '#5a8ad8', 17, 4, 2, 2); // pin biru
  fr(x, '#8a7a6a', 6, 8, 5, 1); fr(x, '#8a7a6a', 6, 10, 4, 1);
  fr(x, '#8a7a6a', 15, 8, 6, 1); fr(x, '#8a7a6a', 15, 10, 5, 1);
  return outline(c, '#3a2418');
}
function artCampfire() {
  const [c, x] = mk(28, 22);
  // batu melingkar
  ellF(x, '#6a6476', 14, 16, 12, 5);
  ellF(x, '#4a4456', 14, 16, 8, 3);
  // kayu bakar silang
  for (let i = 0; i < 3; i++) {
    fr(x, '#7a4e2c', 6 + i * 5, 12, 7, 3);
    fr(x, '#5e3b20', 6 + i * 5, 14, 7, 1);
  }
  // bara api
  ellF(x, '#ff5a2a', 14, 13, 6, 3);
  ellF(x, '#ffd84a', 14, 12, 3, 2);
  return outline(c, '#2a1a14');
}
function artBench() { const [c, x] = mk(30, 16); fr(x, '#5e3b20', 3, 8, 3, 7); fr(x, '#5e3b20', 24, 8, 3, 7); fr(x, '#9a643a', 1, 2, 28, 3); fr(x, '#b07a46', 1, 2, 28, 1); fr(x, '#9a643a', 0, 7, 30, 3); fr(x, '#c08a50', 0, 7, 30, 1); fr(x, '#5e3b20', 4, 5, 2, 2); fr(x, '#5e3b20', 24, 5, 2, 2); return outline(c, '#3a2418'); }
function artBarrel() { const [c, x] = mk(16, 18); for (let y = 1; y < 17; y++) { const hw = 6 + Math.sin((y - 1) / 15 * Math.PI) * 1.5; for (let i = Math.round(-hw); i <= Math.round(hw); i++) { const u = i / hw; px(x, (y === 4 || y === 13) ? '#5a5258' : u < -.4 ? '#b07a46' : u < .4 ? '#9a643a' : '#7a4e2c', 8 + i, y); } } ellF(x, '#c08a50', 8, 2, 5.5, 1.5); return outline(c, '#3a2418'); }
function artCrate() { const [c, x] = mk(16, 16); fr(x, '#b07a46', 1, 1, 14, 14); fr(x, '#8a5a32', 1, 1, 14, 2); fr(x, '#8a5a32', 1, 13, 14, 2); fr(x, '#8a5a32', 1, 1, 2, 14); fr(x, '#8a5a32', 13, 1, 2, 14); for (let i = 0; i < 10; i++) { px(x, '#7a4e2c', 3 + i, 3 + i); px(x, '#7a4e2c', 4 + i, 3 + i); } fr(x, '#d09a5e', 1, 1, 14, 1); return outline(c, '#3a2418'); }
function artSign() { const [c, x] = mk(22, 22); fr(x, '#6e4222', 10, 8, 3, 13); fr(x, '#b07a46', 1, 2, 20, 10); fr(x, '#d09a5e', 1, 2, 20, 1); fr(x, '#8a5a32', 1, 11, 20, 1); fr(x, '#5e3b20', 4, 5, 14, 1); fr(x, '#5e3b20', 4, 8, 10, 1); return outline(c, '#3a2418'); }
function artFence() { const [c, x] = mk(18, 14); fr(x, '#9a643a', 2, 1, 3, 13); fr(x, '#9a643a', 13, 1, 3, 13); fr(x, '#b07a46', 0, 4, 18, 2); fr(x, '#b07a46', 0, 9, 18, 2); fr(x, '#d09a5e', 2, 1, 1, 12); fr(x, '#d09a5e', 13, 1, 1, 12); return outline(c, '#3a2418'); }
function artLamp() { const [c, x] = mk(12, 30); fr(x, '#3a3440', 5, 8, 2, 20); fr(x, '#3a3440', 3, 27, 6, 2); fr(x, '#3a3440', 2, 2, 8, 2); fr(x, '#ffe27a', 3, 4, 6, 5); fr(x, '#fff8d0', 4, 5, 2, 3); fr(x, '#3a3440', 3, 9, 6, 1); fr(x, '#3a3440', 5, 0, 2, 2); return outline(c, '#1e1a24'); }
// ---------- kuil kristal (hutan) ----------
function artShrine() {
  const W = 120, H = 70, cx = 60, [c, x] = mk(W, H);
  ellF(x, '#6e685e', cx, 50, 58, 18); ellF(x, '#b8b2a6', cx, 47, 58, 18); ellF(x, '#d6d0c4', cx, 46, 54, 16);
  for (let i = 0; i < 26; i++) { const a = i / 26 * Math.PI * 2; fr(x, '#9e978b', Math.round(cx + Math.cos(a) * 45), Math.round(46 + Math.sin(a) * 13), 4, 1); }
  ellF(x, '#9e978b', cx, 46, 20, 7); ellF(x, '#c8c2b6', cx, 45, 19, 6); ellF(x, '#7ad8ff', cx, 45, 12, 3.5);
  const pil = (X) => { fr(x, '#9e978b', X - 4, 8, 9, 40); fr(x, '#d6d0c4', X - 4, 8, 3, 40); fr(x, '#7e786e', X + 3, 8, 2, 40); fr(x, '#bdb6aa', X - 6, 4, 13, 5); fr(x, '#e2ddd2', X - 6, 4, 13, 1); fr(x, '#bdb6aa', X - 6, 46, 13, 4); fr(x, '#4f9a3a', X - 4, 30, 3, 6); px(x, '#6cc04a', X - 3, 31); };
  pil(14); pil(106);
  return outline(c, '#3a3630');
}
function artCrystal(lit) {
  const frames = [];
  for (let f = 0; f < 4; f++) {
    const [c, x] = mk(22, 34), cx = 11;
    const P = lit ? ['#2a8ad0', '#5ad0ff', '#a8f0ff', '#ffffff'] : ['#4a5a7a', '#6a7a9a', '#8a9aba', '#b0c0d8'];
    for (let y = 2; y < 30; y++) {
      const t = y < 10 ? (y - 2) / 8 : 1 - (y - 10) / 20 * .55; const hw = 1 + t * 8;
      for (let i = Math.round(-hw); i <= Math.round(hw); i++) { const u = i / hw; px(x, u < -.4 ? P[2] : u < .1 ? P[1] : P[0], cx + i, y); }
    }
    for (let y = 4; y < 26; y++) px(x, P[3], cx - 2, y);
    if (lit) { const s = [[3, 6], [18, 10], [2, 22], [19, 26]][f]; px(x, '#ffffff', s[0], s[1]); px(x, '#a8f0ff', s[0] + 1, s[1]); px(x, '#a8f0ff', s[0] - 1, s[1]); px(x, '#a8f0ff', s[0], s[1] - 1); px(x, '#a8f0ff', s[0], s[1] + 1); }
    frames.push(outline(c, lit ? '#14406a' : '#2a3040'));
  }
  return strip(frames);
}
function artChest(open) {
  const [c, x] = mk(18, 16);
  if (!open) { fr(x, '#9a5a2a', 1, 3, 16, 12); fr(x, '#b8743a', 1, 3, 16, 5); fr(x, '#d8954e', 1, 3, 16, 1); fr(x, '#7a4420', 1, 8, 16, 1); fr(x, '#e8c050', 1, 7, 16, 2); fr(x, '#e8c050', 1, 3, 2, 12); fr(x, '#e8c050', 15, 3, 2, 12); fr(x, '#ffe27a', 7, 7, 4, 4); fr(x, '#5a3a1a', 8, 9, 2, 1); }
  else { fr(x, '#5a2a10', 2, 1, 14, 5); fr(x, '#9a5a2a', 1, 0, 16, 3); fr(x, '#e8c050', 1, 0, 16, 1); fr(x, '#2a1408', 2, 6, 14, 3); fr(x, '#9a5a2a', 1, 8, 16, 7); fr(x, '#e8c050', 1, 8, 2, 7); fr(x, '#e8c050', 15, 8, 2, 7); fr(x, '#e8c050', 1, 8, 16, 1); }
  return outline(c, '#2a1408');
}
function artWindmill() {
  const W = 56, H = 96, [c, x] = mk(W, H), cx = 28;
  for (let y = 30; y < 92; y++) { const hw = 13 + (y - 30) / 62 * 9; for (let i = Math.round(-hw); i <= Math.round(hw); i++) { const u = i / hw, row = Math.floor(y / 5), m = y % 5 === 4 || (i + 40 + (row % 2) * 4) % 8 === 0; px(x, m ? '#9a8e7e' : u < -.4 ? '#efe4d0' : u < .45 ? '#ddd0b8' : '#c4b69c', cx + i, y); } }
  for (let y = 12; y < 34; y++) { const hw = (y - 12) / 22 * 17 + 2; for (let i = Math.round(-hw); i <= Math.round(hw); i++) px(x, (y + 100) % 4 === 0 ? '#9a3a2a' : i < 0 ? '#e0644a' : '#c84a34', cx + i, y); }
  fr(x, '#6e4222', cx - 6, 74, 12, 18); fr(x, '#8a5430', cx - 5, 75, 10, 17); fr(x, '#ffd84a', cx + 2, 83, 2, 2);
  fr(x, '#5e3b20', cx - 5, 48, 10, 10); fr(x, '#8fd0ee', cx - 4, 49, 8, 8); fr(x, '#5e3b20', cx - 1, 49, 2, 8);
  return outline(c, '#3a2a1e');
}
function artBlades() {
  const S = 80, [c, x] = mk(S, S), cx = S / 2;
  for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2;
    for (let r = 4; r < 38; r++) for (let w = -1; w <= 1; w++) px(x, '#6e4222', cx + Math.cos(a) * r - Math.sin(a) * w, cx + Math.sin(a) * r + Math.cos(a) * w);
    for (let r = 10; r < 37; r++) for (let w = 2; w < 9; w++) { const lat = (r % 6 === 0 || w === 8); px(x, lat ? '#8a6a4a' : '#f4ecd8', cx + Math.cos(a) * r - Math.sin(a) * w, cx + Math.sin(a) * r + Math.cos(a) * w); }
  }
  ellF(x, '#5e3b20', cx, cx, 4, 4); ellF(x, '#a87444', cx - 1, cx - 1, 2, 2);
  return outline(c, '#3a2a1e');
}
function artPond() { return null; }
function artBarrier() { const frames = []; for (let f = 0; f < 3; f++) { const [c, x] = mk(84, 46); for (let y = 0; y < 44; y++) for (let i = 0; i < 84; i++) { const w = Math.sin(i * .25 + y * .15 + f * 2) * .5 + .5; if ((i + y + f) % 3 === 0) continue; x.fillStyle = `rgba(${150 + w * 100},${120 + w * 60},255,${.18 + w * .35 * (1 - y / 60)})`; x.fillRect(i, y, 1, 1); } for (let k = 0; k < 6; k++) { const X = (k * 15 + f * 5) % 84, Y = 6 + (k * 11 + f * 7) % 34; x.fillStyle = '#ffffff'; x.fillRect(X, Y, 1, 1); } frames.push(c); } return strip(frames); }
function artAnvil() { const [c, x] = mk(30, 22); fr(x, '#5a5466', 6, 4, 20, 6); fr(x, '#8a8494', 6, 4, 20, 2); fr(x, '#5a5466', 2, 4, 6, 3); fr(x, '#4a4456', 11, 10, 10, 6); fr(x, '#7a5446', 4, 16, 24, 5); fr(x, '#a06a52', 4, 16, 24, 2); return outline(c); }
function artForge() { const [c, x] = mk(34, 34); for (let y = 6; y < 32; y++) for (let i = 2; i < 32; i++) { const row = Math.floor(y / 4), m = y % 4 === 3 || (i + (row % 2) * 3) % 6 === 0; px(x, m ? '#6a5a5a' : i < 10 ? '#b8a8a0' : '#9a8a84', i, y); } fr(x, '#2a1a1a', 8, 16, 18, 12); fr(x, '#ff8a2a', 10, 20, 14, 8); fr(x, '#ffd84a', 13, 22, 8, 6); fr(x, '#ffffff', 16, 25, 2, 2); fr(x, '#6a5a5a', 12, 0, 10, 7); return outline(c); }
function artGate() { const [c, x] = mk(58, 34); fr(x, '#4a4456', 0, 0, 58, 5); fr(x, '#8a8494', 0, 0, 58, 2); for (let i = 3; i < 58; i += 7) { fr(x, '#5a5466', i, 5, 3, 28); fr(x, '#9a94a4', i, 5, 1, 28); } fr(x, '#4a4456', 0, 18, 58, 3); return outline(c); }
function artBoulder() { const [c, x] = mk(20, 18); ellF(x, '#6a6476', 10, 10, 8.5, 7); ellF(x, '#8a8494', 9, 9, 7, 5.5); ellF(x, '#b4aebe', 7, 6, 3, 2); px(x, '#4e4858', 13, 12); px(x, '#4e4858', 11, 14); return outline(c); }
function artPlate() { const [c, x] = mk(20, 14); ellF(x, '#3a3644', 10, 7, 9, 6); ellF(x, '#7a7484', 10, 6.5, 8, 5); ellF(x, '#5ac8ff', 10, 6.5, 3, 2); return c; }
function artBell() {
  const [c, x] = mk(24, 28);
  // Tiang kayu gantungan lonceng
  fr(x, '#6a4228', 2, 0, 20, 3);
  fr(x, '#4a2c14', 3, 3, 3, 24);
  fr(x, '#4a2c14', 18, 3, 3, 24);
  fr(x, '#8a5a32', 4, 3, 1, 24);
  fr(x, '#8a5a32', 19, 3, 1, 24);
  // Lonceng perunggu
  ellF(x, '#d08a28', 12, 10, 5, 4);
  fr(x, '#e8a83a', 8, 10, 8, 8);
  ellF(x, '#ffd25a', 12, 18, 6.5, 2.5);
  ellF(x, '#b06c1a', 12, 19, 5.5, 1.5);
  // Bandul & tali
  fr(x, '#f0d8a0', 11, 20, 2, 4);
  ellF(x, '#8a5014', 12, 24, 2, 2);
  return outline(c, '#2a1608');
}
function artDummy() {
  const [c, x] = mk(20, 28);
  // Tiang kayu berdiri & penyangga silang
  fr(x, '#6a4228', 9, 8, 3, 19);
  fr(x, '#4a2c14', 4, 25, 13, 2);
  fr(x, '#8a5a32', 9, 8, 1, 18);
  // Kepala karung jerami
  ellF(x, '#d8bc78', 10, 6, 5, 5);
  ellF(x, '#f4dc9a', 9, 5, 3.5, 3.5);
  // Mata & mulut jahitan silang
  px(x, '#4a3418', 8, 5); px(x, '#4a3418', 12, 5);
  px(x, '#4a3418', 9, 8); px(x, '#4a3418', 10, 8); px(x, '#4a3418', 11, 8);
  // Badan jerami diikat tali
  fr(x, '#c8a860', 6, 11, 9, 11);
  fr(x, '#e0c478', 7, 11, 4, 11);
  // Lengan kayu silang membentang
  fr(x, '#7a5030', 2, 13, 17, 3);
  fr(x, '#9a6838', 2, 13, 17, 1);
  // Tali pengikat dada
  fr(x, '#5a3a1e', 6, 15, 9, 1);
  fr(x, '#5a3a1e', 6, 18, 9, 1);
  return outline(c, '#2a1808');
}
function artTelescope() {
  const [c, x] = mk(22, 26);
  // Kaki tripod kayu berkaki tiga
  fr(x, '#5a3820', 10, 10, 2, 14);
  fr(x, '#4a2c14', 5, 12, 2, 12);
  fr(x, '#4a2c14', 15, 12, 2, 12);
  // Sendi dudukan logam kuningan
  ellF(x, '#d09428', 11, 10, 3, 2.5);
  ellF(x, '#ffd84a', 10, 9.5, 2, 1.5);
  // Tabung teropong miring menengadah ke langit
  for (let i = 0; i < 11; i++) {
    const tx = 4 + i;
    const ty = 12 - i;
    fr(x, '#d89a24', tx, ty, 3, 3);
    fr(x, '#ffe05a', tx, ty, 3, 1);
  }
  // Lensa depan besar & lensa intip belakang
  fr(x, '#f0b43a', 14, 1, 4, 3);
  fr(x, '#7ad8ff', 15, 2, 2, 2); // Kaca lensa berkilau biru
  px(x, '#ffffff', 15, 2);
  fr(x, '#a87418', 3, 12, 3, 2);
  return outline(c, '#241408');
}

function artShrineAltar() {
  const [c, x] = mk(32, 28);
  // Base pedestal stone/marble
  fr(x, '#7a8498', 2, 18, 28, 10);
  fr(x, '#9aa4b8', 4, 16, 24, 3);
  fr(x, '#c4cede', 3, 16, 26, 1);
  fr(x, '#5a6274', 2, 26, 28, 2);

  // Table top with golden cloth
  fr(x, '#e8d070', 4, 12, 24, 5);
  fr(x, '#fff0a0', 5, 12, 22, 1);
  fr(x, '#c8a838', 4, 16, 24, 1);
  fr(x, '#3a4458', 8, 18, 16, 1);

  // Donation box (wooden slot) on right side
  fr(x, '#8a5a32', 20, 9, 7, 7);
  fr(x, '#a87444', 21, 9, 5, 2);
  fr(x, '#2a1a10', 22, 11, 3, 1); // coin slot

  // Holy Chalice / Basin on left side with holy water
  fr(x, '#ffd870', 5, 8, 6, 6);
  fr(x, '#7ad8ff', 6, 8, 4, 2); // water glow
  fr(x, '#ffd870', 7, 12, 2, 2);

  // Twin holy candles in center
  fr(x, '#f8f4e8', 13, 7, 2, 6);
  fr(x, '#f8f4e8', 16, 6, 2, 7);
  // Flames (warm yellow & bright core)
  fr(x, '#ff9a28', 13, 4, 2, 3);
  fr(x, '#ffffff', 13, 5, 2, 1);
  fr(x, '#ff9a28', 16, 3, 2, 3);
  fr(x, '#ffffff', 16, 4, 2, 1);

  return outline(c, '#242a38');
}

function artFieldOven() {
  const [c, x] = mk(26, 22);
  // Reddish-clay oven dome
  ellF(x, '#8a4e32', 13, 15, 11, 6);
  ellF(x, '#b46842', 13, 14, 10, 5);
  ellF(x, '#c87c54', 12, 12, 8, 4);

  // Oven mouth opening (hollow dark)
  ellF(x, '#2a140e', 13, 15, 6, 3.5);
  // Glowing embers inside
  fr(x, '#e85a20', 10, 14, 6, 2);
  fr(x, '#ffb432', 11, 15, 4, 1);
  fr(x, '#ffffff', 12, 15, 2, 1);

  // Chimney vent on top
  fr(x, '#8a4e32', 11, 3, 4, 6);
  fr(x, '#b46842', 12, 3, 2, 6);
  fr(x, '#5a2e1e', 11, 2, 4, 1);

  // Wooden rack on side with roasted corn/sweet potato
  fr(x, '#5a3a24', 2, 16, 5, 2);
  fr(x, '#ffcf40', 3, 14, 4, 2); // roasted corn
  px(x, '#a85420', 4, 14); // grill marks
  px(x, '#a85420', 5, 15);

  return outline(c, '#24140c');
}

function artDripStalactite() {
  const [c, x] = mk(24, 30);
  // Base wet rock cluster
  ellF(x, '#3a3444', 12, 25, 10, 4);
  ellF(x, '#4e4858', 12, 24, 8, 3);

  // Wet pool / moss patch
  ellF(x, '#2a885a', 7, 26, 5, 2.5); // green moss
  px(x, '#5ad888', 6, 25);
  px(x, '#7affaa', 8, 26);
  ellF(x, '#4ab8e8', 15, 25, 4, 2); // puddle water reflection
  px(x, '#ffffff', 16, 25);

  // Stalagmite rising
  for (let y = 6; y < 25; y++) {
    const hw = 1 + (y - 6) / 19 * 6;
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const u = i / hw;
      px(x, u < -.25 ? '#8a8296' : u < .4 ? '#6a6276' : '#4e4858', 12 + i, y);
    }
  }

  // Droplet on the tip
  ellF(x, '#7ad8ff', 12, 5, 2, 2.5);
  px(x, '#ffffff', 12, 4);

  // Emerald cave moss creeping on the side of stone
  px(x, '#2a885a', 7, 18);
  px(x, '#3ac87a', 8, 17);
  px(x, '#5ad888', 8, 18);
  px(x, '#2a885a', 16, 20);
  px(x, '#3ac87a', 15, 21);

  return outline(c, '#1e1a24');
}

