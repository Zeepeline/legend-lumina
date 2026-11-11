'use strict';
// Bangunan & properti buatan kode
// ---------- rumah atap oranye ----------
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

function artSwampTotem() {
  const [c, x] = mk(26, 32);
  // Base wet mossy stone pedestal with water bowl
  ellF(x, '#3a443e', 13, 27, 10, 4);
  ellF(x, '#4a584e', 13, 26, 8, 3);
  ellF(x, '#58d8c8', 13, 26, 5, 2); // pure spring water in stone basin
  px(x, '#ffffff', 14, 26);

  // Carved wooden pole
  fr(x, '#5a4230', 9, 8, 8, 18);
  fr(x, '#7a5a42', 10, 8, 6, 18);
  fr(x, '#3a2a1e', 9, 8, 1, 18);
  fr(x, '#3a2a1e', 16, 8, 1, 18);

  // Totem smiling guardian mask carving
  fr(x, '#9a7656', 10, 9, 6, 8);
  px(x, '#2a1a10', 11, 11); // eyes
  px(x, '#2a1a10', 14, 11);
  fr(x, '#2a1a10', 11, 14, 4, 1); // serene smile
  px(x, '#50c878', 10, 8); // moss on top
  px(x, '#50c878', 15, 8);

  // Top crossbeam for bamboo chimes
  fr(x, '#7a5a42', 4, 6, 18, 2);
  fr(x, '#9a7656', 5, 6, 16, 1);

  // Hanging bamboo pipes
  // Left pipe
  fr(x, '#88b858', 5, 8, 2, 7);
  fr(x, '#b0d878', 6, 8, 1, 7);
  px(x, '#4a7030', 5, 11);
  // Center-left pipe
  fr(x, '#88b858', 8, 8, 1, 5);
  // Center-right pipe
  fr(x, '#88b858', 17, 8, 1, 5);
  // Right pipe
  fr(x, '#88b858', 19, 8, 2, 8);
  fr(x, '#b0d878', 20, 8, 1, 8);
  px(x, '#4a7030', 19, 12);

  // Small feather or leafy charm on right
  px(x, '#e86a5a', 21, 11);
  px(x, '#ffd23a', 21, 12);

  return outline(c, '#1a241e');
}

function artTeaTable() {
  const [c, x] = mk(28, 22);
  // Bamboo mat floor spread
  ellF(x, '#c8b47e', 14, 16, 12, 5);
  ellF(x, '#e0cca0', 14, 15, 10, 4);

  // Low wooden tea table
  fr(x, '#7a5438', 6, 11, 16, 5);
  fr(x, '#9a704c', 7, 10, 14, 2);
  fr(x, '#5a3820', 6, 15, 2, 4);
  fr(x, '#5a3820', 20, 15, 2, 4);

  // Steaming teapot / kettle in center
  fr(x, '#4a5058', 12, 7, 5, 4);
  fr(x, '#7a8088', 13, 6, 3, 2);
  px(x, '#9aa0a8', 11, 8); // spout
  px(x, '#3a3e44', 17, 8); // handle

  // White steam rising
  fr(x, '#ffffff', 14, 3, 1, 2);
  px(x, '#e8f4fc', 15, 2);

  // Twin ceramic cups on sides
  fr(x, '#7ad0a0', 8, 9, 3, 3); // green tea cup
  px(x, '#38a868', 9, 9);
  fr(x, '#7ad0a0', 18, 9, 3, 3);
  px(x, '#38a868', 19, 9);

  return outline(c, '#281c14');
}

function artDockBoat() {
  const [c, x] = mk(44, 22);
  // Water ripple underneath
  ellF(x, '#2a6a88', 22, 17, 19, 4.5);
  ellF(x, '#4a8aa8', 22, 16, 16, 3.5);

  // Wooden hull
  fr(x, '#8a5a32', 4, 8, 36, 7);
  fr(x, '#a87444', 6, 8, 32, 3);
  fr(x, '#6a4224', 8, 14, 28, 2);
  fr(x, '#5a3a20', 6, 6, 32, 2);

  // Wooden seats
  fr(x, '#c89a5a', 14, 7, 3, 5);
  fr(x, '#c89a5a', 26, 7, 3, 5);

  // Oar resting across
  fr(x, '#d8b070', 10, 5, 24, 2);

  // Brass lantern on bow (right)
  fr(x, '#e8a838', 37, 3, 4, 5);
  fr(x, '#fff090', 38, 4, 2, 3); // warm light glow
  px(x, '#6a4218', 38, 2); // lantern cap

  // Tied rope to mooring post on left
  fr(x, '#7a5a3a', 0, 8, 4, 8); // wooden dock post
  fr(x, '#d8c090', 4, 10, 5, 1); // hemp rope

  return outline(c, '#241a12');
}

function artCoffeeKettle() {
  const [c, x] = mk(24, 24);
  // Charcoal stones on ground
  ellF(x, '#2a2828', 12, 19, 10, 4);
  ellF(x, '#443e3e', 12, 18, 8, 3);
  // Glowing charcoal embers
  fr(x, '#e84a14', 10, 18, 4, 2);
  px(x, '#ff9a28', 11, 18);

  // Black cast-iron kettle on tripod
  fr(x, '#3a383c', 7, 10, 10, 8);
  fr(x, '#58545a', 8, 9, 8, 3);
  fr(x, '#242226', 7, 17, 10, 1);
  px(x, '#6a666e', 6, 12); // spout
  px(x, '#6a666e', 5, 11);
  // Kettle handle arch
  fr(x, '#6a666e', 10, 5, 4, 1);
  fr(x, '#3a383c', 9, 6, 1, 3);
  fr(x, '#3a383c', 14, 6, 1, 3);

  // Fragrant steam rising
  fr(x, '#ffffff', 5, 8, 1, 2);
  px(x, '#e8f4fc', 6, 7);

  // Wooden cup beside kettle
  fr(x, '#8a5a36', 18, 13, 4, 5);
  fr(x, '#2a1a10', 19, 13, 2, 1); // black coffee inside

  return outline(c, '#18161a');
}

function artStreetDrum() {
  const [c, x] = mk(26, 26);
  // Shadow on ground
  ellF(x, '#2a241e', 13, 22, 10, 4);

  // Wooden cylindrical barrel drum
  fr(x, '#6a4224', 6, 9, 14, 13);
  fr(x, '#8a5a32', 8, 9, 10, 13);
  fr(x, '#52321a', 6, 9, 2, 13);
  fr(x, '#52321a', 18, 9, 2, 13);

  // Crossed rope tensioners on drum sides
  for (let i = 0; i < 4; i++) {
    px(x, '#d8c49a', 7 + i * 3, 11 + (i % 2) * 5);
    px(x, '#d8c49a', 8 + i * 3, 15 - (i % 2) * 4);
  }

  // Taut leather drum skin top
  ellF(x, '#caa472', 13, 9, 7, 3.5);
  ellF(x, '#e2c08e', 13, 8, 6, 2.5);
  fr(x, '#b48a58', 12, 8, 2, 1);

  // Twin wooden drumsticks crossed in front
  fr(x, '#d8a86c', 3, 6, 8, 2); // left stick angled
  px(x, '#f0d09a', 3, 6); // head
  fr(x, '#d8a86c', 16, 6, 8, 2); // right stick angled
  px(x, '#f0d09a', 23, 6);

  return outline(c, '#1e140c');
}

function artBellows() {
  const [c, x] = mk(24, 22);
  // Ground shadow
  ellF(x, '#2a2018', 12, 18, 9, 3.5);

  // Triangular accordion leather bellows chamber
  fr(x, '#7a4e2c', 4, 10, 14, 8);
  fr(x, '#9a643a', 5, 11, 12, 6);
  // Accordion leather folds / pleats
  for (let i = 0; i < 3; i++) {
    fr(x, '#5a3418', 7 + i * 4, 10, 1, 8);
    fr(x, '#c88c5a', 8 + i * 4, 11, 1, 6);
  }

  // Wooden end-plates
  fr(x, '#5a3820', 3, 9, 2, 10);
  fr(x, '#5a3820', 17, 9, 2, 10);

  // Iron nozzle pointing right (toward forge)
  fr(x, '#5a6068', 19, 13, 4, 3);
  fr(x, '#8a929e', 19, 13, 4, 1);
  fr(x, '#2a2e34', 22, 14, 1, 1); // nozzle hole

  // Wooden pumping lever on top
  fr(x, '#8a5a32', 2, 5, 12, 2);
  fr(x, '#a87444', 3, 5, 10, 1);
  // Lever hinge & handle
  fr(x, '#3a2212', 3, 7, 2, 3);
  fr(x, '#d89c62', 1, 4, 3, 3); // round wooden grip

  return outline(c, '#181008');
}

function artRingBooth() {
  const [c, x] = mk(32, 28);
  // Ground shadow
  ellF(x, '#24201c', 16, 23, 14, 4);

  // Wooden carnival table
  fr(x, '#6a4224', 4, 13, 24, 10);
  fr(x, '#8a5a32', 5, 14, 22, 8);
  fr(x, '#523218', 4, 21, 24, 2);

  // Stepped tier on table for bottles
  fr(x, '#523218', 6, 11, 20, 3);
  fr(x, '#7a4e2c', 7, 11, 18, 1);

  // Row of colored glass bottles on the steps
  // Green bottle
  fr(x, '#38a858', 8, 7, 3, 5);
  px(x, '#78e898', 8, 7);
  px(x, '#f0d8a0', 9, 6); // cork
  // Ruby red bottle
  fr(x, '#d82838', 13, 6, 3, 6);
  px(x, '#ffa0a8', 13, 6);
  px(x, '#f0d8a0', 14, 5);
  // Gold bottle
  fr(x, '#e8a820', 18, 7, 3, 5);
  px(x, '#ffe070', 18, 7);
  px(x, '#f0d8a0', 19, 6);
  // Blue bottle
  fr(x, '#2878d8', 23, 6, 3, 6);
  px(x, '#88c0ff', 23, 6);
  px(x, '#f0d8a0', 24, 5);

  // Striped festive awning roof (red & cream canopy)
  fr(x, '#e83838', 2, 2, 28, 4);
  for (let i = 0; i < 5; i++) {
    fr(x, '#fff2d0', 3 + i * 6, 2, 3, 4);
  }
  // Wooden awning poles
  fr(x, '#6a4224', 3, 6, 2, 8);
  fr(x, '#6a4224', 27, 6, 2, 8);

  // Wicker basket with rattan rings in front
  fr(x, '#b48a54', 12, 17, 8, 5);
  ellF(x, '#8a5e30', 16, 17, 4, 1.5);
  // Rattan rings sticking out
  ellF(x, '#ffd070', 14, 16, 2, 2);
  ellF(x, '#ffd070', 18, 16, 2, 2);

  return outline(c, '#1a1410');
}

function artArcheryTarget() {
  const [c, x] = mk(26, 28);
  // Ground shadow
  ellF(x, '#242018', 13, 25, 10, 3.5);

  // Tripod wooden wooden legs
  fr(x, '#6a4e32', 8, 14, 2, 12);
  fr(x, '#6a4e32', 16, 14, 2, 12);
  fr(x, '#4a3420', 12, 16, 2, 10);

  // Round straw-bale target face
  ellF(x, '#c8a452', 13, 11, 10, 10);
  ellF(x, '#e8c468', 13, 11, 9, 9);

  // Concentric target rings
  // Outer white ring
  ellF(x, '#ffffff', 13, 11, 7, 7);
  // Middle red ring
  ellF(x, '#d83838', 13, 11, 5, 5);
  // Inner white ring
  ellF(x, '#ffffff', 13, 11, 3, 3);
  // Bullseye center (golden-red)
  ellF(x, '#e82424', 13, 11, 1.8, 1.8);
  px(x, '#ffd84a', 13, 11);

  // Arrows sticking out
  // Arrow 1 in outer ring
  px(x, '#3a2412', 17, 8);
  fr(x, '#f0f0f0', 18, 7, 2, 1);
  // Arrow 2 near bullseye
  px(x, '#3a2412', 14, 11);
  fr(x, '#f0f0f0', 15, 10, 2, 1);

  return outline(c, '#1e140c');
}

function artLakeLighthouse() {
  const [c, x] = mk(36, 52);
  // Ground rocky foundation shadow
  ellF(x, '#2a3038', 18, 48, 16, 4);

  // Stone tower base
  fr(x, '#5a6470', 10, 36, 16, 12);
  fr(x, '#7a8694', 12, 36, 12, 12);
  // Stone masonry line
  for (let y = 38; y < 48; y += 4) {
    fr(x, '#444e58', 10, y, 16, 1);
  }

  // Wooden mid-tower tapering up
  fr(x, '#8a5e38', 12, 18, 12, 18);
  fr(x, '#a8784c', 13, 18, 10, 18);
  fr(x, '#6a4628', 12, 18, 2, 18);
  fr(x, '#6a4628', 22, 18, 2, 18);
  // Window slit
  fr(x, '#241a10', 17, 24, 2, 5);
  px(x, '#ffea78', 17, 25);

  // Observation deck walkway & railing
  fr(x, '#4a321a', 8, 16, 20, 2);
  fr(x, '#6a4628', 9, 14, 18, 2);
  // Railing bars
  for (let i = 9; i <= 26; i += 3) {
    fr(x, '#8a5e38', i, 12, 1, 3);
  }
  fr(x, '#4a321a', 8, 12, 20, 1);

  // Glass lantern chamber housing
  fr(x, '#60b8e8', 12, 6, 12, 6);
  fr(x, '#b4e8ff', 13, 7, 10, 4);
  // Golden brass beacon lamp core
  fr(x, '#e8a820', 16, 7, 4, 4);
  fr(x, '#ffffff', 17, 8, 2, 2); // bright radiant flame

  // Conical metal copper roof on top
  for (let i = 0; i < 6; i++) {
    fr(x, '#388868', 12 + i, 5 - i, 12 - i * 2, 1);
  }
  // Finial spire tip
  fr(x, '#ffd050', 17, -1, 2, 2);

  return outline(c, '#182026');
}

function artCraftTable() {
  const c = mkC(24, 20), ctx = c.getContext("2d");
  // Wooden low table top
  ctx.fillStyle = "#8a5832";
  ctx.fillRect(2, 6, 20, 6);
  ctx.fillStyle = "#633c1d";
  ctx.fillRect(2, 11, 20, 2);
  // Table legs
  ctx.fillStyle = "#4a2a12";
  ctx.fillRect(4, 12, 3, 7);
  ctx.fillRect(17, 12, 3, 7);
  // Parchment paper roll on top
  ctx.fillStyle = "#f5ebd2";
  ctx.fillRect(4, 3, 6, 4);
  ctx.fillStyle = "#d8caa0";
  ctx.fillRect(4, 6, 6, 1);
  // Folded paper boat mini on table
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(13, 5); ctx.lineTo(18, 5); ctx.lineTo(16, 7); ctx.lineTo(14, 7); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(15, 3); ctx.lineTo(17, 5); ctx.lineTo(15, 5); ctx.closePath();
  ctx.fill();
  // Small ceramic candle bowl
  ctx.fillStyle = "#9c4a2f";
  ctx.fillRect(19, 4, 3, 3);
  // Candle flame glow
  ctx.fillStyle = "#ffdd44";
  ctx.fillRect(20, 2, 1, 2);
  return c;
}

function artPaperBoat() {
  const c = mkC(12, 10), ctx = c.getContext("2d");
  // Paper boat hull
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(1, 5); ctx.lineTo(11, 5); ctx.lineTo(9, 9); ctx.lineTo(3, 9); ctx.closePath();
  ctx.fill();
  // Crease shadow
  ctx.fillStyle = "#d0dce8";
  ctx.beginPath();
  ctx.moveTo(6, 5); ctx.lineTo(11, 5); ctx.lineTo(9, 9); ctx.lineTo(6, 9); ctx.closePath();
  ctx.fill();
  // Sail triangle
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.moveTo(6, 1); ctx.lineTo(9, 5); ctx.lineTo(6, 5); ctx.closePath();
  ctx.fill();
  // Little candle flame in center
  ctx.fillStyle = "#ffaa22";
  ctx.fillRect(5, 3, 2, 2);
  ctx.fillStyle = "#ffffaa";
  ctx.fillRect(5, 4, 1, 1);
  return c;
}

function artArmWrestleTable() {
  const c = mkC(26, 22), ctx = c.getContext("2d");
  // Heavy round wooden tabletop with reinforced iron rim
  ctx.fillStyle = "#5a341a";
  ctx.fillRect(3, 7, 20, 6);
  ctx.fillStyle = "#3d2210";
  ctx.fillRect(3, 12, 20, 2);
  // Heavy center pillar and base
  ctx.fillStyle = "#2c170a";
  ctx.fillRect(10, 13, 6, 7);
  ctx.fillRect(7, 19, 12, 2);
  // Red leather elbow pads
  ctx.fillStyle = "#a82e2e";
  ctx.fillRect(5, 5, 4, 3);
  ctx.fillRect(17, 5, 4, 3);
  // Metal edge studs
  ctx.fillStyle = "#d0d8e0";
  ctx.fillRect(3, 8, 1, 1);
  ctx.fillRect(22, 8, 1, 1);
  // Chalk dust & grip markings
  ctx.fillStyle = "#f0f0f0";
  ctx.fillRect(12, 6, 2, 2);
  return c;
}

function artKnifeTarget() {
  const c = mkC(26, 28), ctx = c.getContext("2d");
  // Wall mount post / plank
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(11, 2, 4, 24);

  // Round oak barrel lid target
  ctx.fillStyle = "#6d4c41";
  ctx.beginPath();
  ctx.arc(13, 14, 11, 0, Math.PI * 2);
  ctx.fill();

  // Iron rim band
  ctx.strokeStyle = "#37474f";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(13, 14, 10.5, 0, Math.PI * 2);
  ctx.stroke();

  // Outer ring (white chalk)
  ctx.strokeStyle = "#d7ccc8";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(13, 14, 7.5, 0, Math.PI * 2);
  ctx.stroke();

  // Middle ring (red paint)
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(13, 14, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Center bullseye (gold / white)
  ctx.fillStyle = "#fff9c4";
  ctx.beginPath();
  ctx.arc(13, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Embedded daggers stuck in wood
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(6, 9, 4, 1);
  ctx.fillStyle = "#c62828";
  ctx.fillRect(4, 9, 2, 1); // Handle

  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(16, 17, 4, 1);
  ctx.fillStyle = "#212121";
  ctx.fillRect(19, 17, 2, 1); // Handle

  return c;
}

function artCanalPier() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Wooden canal pier platform
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(4, 10, 20, 8);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(4, 16, 20, 3);

  // Pilings into water
  ctx.fillStyle = "#271c19";
  ctx.fillRect(5, 18, 3, 7);
  ctx.fillRect(20, 18, 3, 7);

  // Small race start flag pole
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(6, 2, 2, 10);
  // Triangle flag (Red and yellow)
  ctx.fillStyle = "#e53935";
  ctx.beginPath();
  ctx.moveTo(8, 2); ctx.lineTo(15, 5); ctx.lineTo(8, 8); ctx.closePath();
  ctx.fill();

  // Floating toy boats in canal water
  // Red boat
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(10, 18, 5, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 16, 1, 2);

  // Green boat
  ctx.fillStyle = "#388e3c";
  ctx.fillRect(17, 20, 5, 2);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(19, 18, 1, 2);

  // Water ripple lines
  ctx.strokeStyle = "#4fc3f7";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(2, 22); ctx.lineTo(9, 22);
  ctx.moveTo(15, 24); ctx.lineTo(26, 24);
  ctx.stroke();

  return c;
}

function artWeatherVane() {
  const c = mkC(24, 38), ctx = c.getContext("2d");
  // Wooden mount pole
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(11, 14, 2, 24);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(10, 32, 4, 6);

  // Brass central sphere mount
  ctx.fillStyle = "#ffca28";
  ctx.beginPath();
  ctx.arc(12, 14, 3, 0, Math.PI * 2);
  ctx.fill();

  // 4 Compass arms (U, T, S, B)
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(4, 13, 16, 2); // Horizontal W-E
  ctx.fillRect(11, 7, 2, 14); // Vertical N-S

  // Cardinal letters / markings
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(4, 12, 1, 1);
  ctx.fillRect(19, 12, 1, 1);
  ctx.fillRect(11, 6, 2, 1);

  // Rotating brass rooster vane on top
  ctx.fillStyle = "#ffb300";
  // Rooster body
  ctx.beginPath();
  ctx.ellipse(12, 4, 4, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  // Comb on head
  ctx.fillStyle = "#e53935";
  ctx.fillRect(14, 1, 2, 2);
  // Tail feathers
  ctx.fillStyle = "#ffa000";
  ctx.beginPath();
  ctx.moveTo(9, 4); ctx.lineTo(6, 1); ctx.lineTo(8, 6); ctx.closePath();
  ctx.fill();
  // Beak
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(16, 4, 2, 1);

  return c;
}

function artClockworkTower() {
  const c = mkC(32, 54), ctx = c.getContext("2d");
  // Stone tower base and pillars
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(8, 20, 16, 32);
  ctx.fillStyle = "#90a4ae";
  ctx.fillRect(6, 44, 20, 8);
  ctx.fillRect(8, 50, 16, 2);

  // Arched glass inspection window
  ctx.fillStyle = "#37474f";
  ctx.fillRect(11, 28, 10, 14);
  // Brass gears visible inside window
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(14, 33, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffa000";
  ctx.beginPath();
  ctx.arc(18, 37, 2.5, 0, Math.PI * 2);
  ctx.fill();
  // Glass gleam
  ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
  ctx.beginPath();
  ctx.moveTo(11, 40); ctx.lineTo(19, 28); ctx.lineTo(21, 28); ctx.lineTo(13, 40); ctx.closePath();
  ctx.fill();

  // Clock face upper section
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(7, 10, 18, 12);
  // Dial rim (bronze/brass)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(16, 16, 6, 0, Math.PI * 2);
  ctx.fill();
  // Dial face (cream white)
  ctx.fillStyle = "#fffde7";
  ctx.beginPath();
  ctx.arc(16, 16, 4.5, 0, Math.PI * 2);
  ctx.fill();
  // Clock hands
  ctx.fillStyle = "#263238";
  ctx.fillRect(16, 13, 1, 3);
  ctx.fillRect(16, 16, 3, 1);

  // Copper pointed roof spire
  ctx.fillStyle = "#00897b";
  ctx.beginPath();
  ctx.moveTo(16, 1); ctx.lineTo(25, 10); ctx.lineTo(7, 10); ctx.closePath();
  ctx.fill();
  // Spire pinnacle ball
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(15, 0, 2, 2);

  return c;
}

function artHighStriker() {
  const c = mkC(26, 52), ctx = c.getContext("2d");
  // Heavy wooden base platform
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(2, 42, 22, 9);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(2, 48, 22, 3);

  // Spring strike pad
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(6, 40, 7, 3);
  ctx.fillStyle = "#ff5252";
  ctx.fillRect(7, 39, 5, 1);

  // Large sledgehammer leaning against base
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(17, 32, 2, 14); // Handle
  ctx.fillStyle = "#455a64";
  ctx.fillRect(15, 30, 6, 4); // Iron head

  // Tower vertical guide post
  ctx.fillStyle = "#795548";
  ctx.fillRect(7, 6, 5, 34);
  // Color scale markers (Red, Yellow, Green)
  ctx.fillStyle = "#43a047";
  ctx.fillRect(8, 7, 3, 8); // Top green
  ctx.fillStyle = "#fdd835";
  ctx.fillRect(8, 16, 3, 10); // Mid yellow
  ctx.fillStyle = "#e53935";
  ctx.fillRect(8, 27, 3, 12); // Low red

  // Center slider wire & slug
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(9, 6, 1, 34);
  ctx.fillStyle = "#37474f";
  ctx.fillRect(8, 36, 3, 3); // Slug at bottom

  // Top brass gong bell
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.arc(9.5, 4, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(9, 2, 2, 2);

  return c;
}

function artViolinStand() {
  const c = mkC(26, 22), ctx = c.getContext("2d");
  // Open violin hard case
  ctx.fillStyle = "#2c1d11";
  ctx.fillRect(3, 7, 20, 11);
  ctx.fillStyle = "#1b1109";
  ctx.fillRect(3, 15, 20, 3);

  // Red velvet interior lining
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(4, 8, 18, 9);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(5, 9, 16, 7);

  // Sheet music page
  ctx.fillStyle = "#fffde7";
  ctx.fillRect(5, 10, 6, 5);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(6, 11, 4, 1);
  ctx.fillRect(6, 13, 4, 1);

  // Violin body inside case
  ctx.fillStyle = "#ff8f00";
  ctx.beginPath();
  ctx.ellipse(15, 12, 3.5, 2.2, Math.PI * 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e65100";
  ctx.fillRect(17, 11, 3, 1); // Fingerboard neck

  // Small coin tip cup beside case
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(22, 16, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(21, 15, 2, 1); // Coin shine

  // Dried red rose beside case
  ctx.fillStyle = "#c62828";
  ctx.fillRect(1, 14, 2, 2);
  ctx.fillStyle = "#33691e";
  ctx.fillRect(2, 16, 1, 2);

  return c;
}

function artBirdHouse() {
  const c = mkC(22, 34), ctx = c.getContext("2d");
  // Wooden mounting post
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(10, 16, 2, 18);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(9, 28, 4, 6);

  // Birdhouse main box
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(6, 8, 10, 9);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(6, 14, 10, 3);

  // Entrance hole
  ctx.fillStyle = "#271a13";
  ctx.beginPath();
  ctx.arc(11, 11, 2, 0, Math.PI * 2);
  ctx.fill();

  // Perch peg
  ctx.fillStyle = "#bcaaa4";
  ctx.fillRect(10, 14, 2, 2);

  // Thatched straw peaked roof
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.moveTo(11, 3); ctx.lineTo(18, 9); ctx.lineTo(4, 9); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(5, 8, 12, 1);

  // Feeding seed tray hanging below
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(5, 17, 12, 2);
  // Yellow seeds on tray
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(7, 16, 8, 1);

  // Little brown sparrow perched on top roof
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(15, 4, 1.8, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(16, 4, 1.5, 1); // Beak

  return c;
}

function artWoodenLoom() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Upright wooden loom frame
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(3, 4, 3, 20);
  ctx.fillRect(20, 4, 3, 20);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(2, 22, 22, 3);
  ctx.fillRect(4, 5, 18, 2);

  // Warp yarn roller beam on top
  ctx.fillStyle = "#fff8e1";
  ctx.fillRect(6, 7, 14, 2);

  // Vertical yarn threads (white / cream)
  ctx.fillStyle = "#fafafa";
  for (let x = 7; x <= 18; x += 2) {
    ctx.fillRect(x, 9, 1, 10);
  }

  // Woven cloth section (red and cream pattern)
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(6, 15, 14, 5);
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(6, 17, 14, 1);

  // Wooden reed comb / shuttle bar in middle
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(5, 13, 16, 2);
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(15, 12, 3, 1); // Flying shuttle bobbin

  // Foot treadle pedals below
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(9, 21, 3, 2);
  ctx.fillRect(14, 21, 3, 2);

  return c;
}

function artPottersWheel() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Workbench low frame
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(2, 14, 22, 10);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(2, 20, 22, 4);

  // Rotating round pottery wheel disk
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.ellipse(13, 13, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#bcaaa4";
  ctx.beginPath();
  ctx.ellipse(13, 12, 7.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Spinning red terracotta clay mound
  ctx.fillStyle = "#d84315";
  ctx.beginPath();
  ctx.ellipse(13, 10, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff8a65";
  ctx.fillRect(12, 6, 2, 4); // Vase neck being pulled up

  // Small water sponge bowl beside wheel
  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.arc(4, 15, 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4fc3f7";
  ctx.fillRect(3, 14, 2, 2);

  // Finished little clay vases drying beside wheel
  ctx.fillStyle = "#bf360c";
  ctx.fillRect(21, 10, 3, 5);
  ctx.fillStyle = "#d84315";
  ctx.fillRect(22, 8, 1, 2);

  return c;
}

function artCheeseBarrel() {
  const c = mkC(24, 26), ctx = c.getContext("2d");
  // Oak aging barrel body
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(4, 9, 16, 15);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(4, 21, 16, 3);

  // Black iron barrel hoops
  ctx.fillStyle = "#263238";
  ctx.fillRect(3, 11, 18, 2);
  ctx.fillRect(3, 19, 18, 2);

  // White cheesecloth drape on side
  ctx.fillStyle = "#eceff1";
  ctx.beginPath();
  ctx.moveTo(3, 8); ctx.lineTo(7, 8); ctx.lineTo(5, 17); ctx.closePath();
  ctx.fill();

  // Golden wheel of cheese on top
  ctx.fillStyle = "#ffca28";
  ctx.beginPath();
  ctx.ellipse(12, 7, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.ellipse(12, 6, 5.5, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Red wax coating rind on edge
  ctx.strokeStyle = "#d32f2f";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(12, 7, 7, 3.5, 0, 0, Math.PI * 2);
  ctx.stroke();

  // Small cheese wedge cut out
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.moveTo(12, 6); ctx.lineTo(16, 4.5); ctx.lineTo(15, 8); ctx.closePath();
  ctx.fill();

  // Cheese knife handle
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(17, 3, 4, 1.5);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(19, 2, 2, 3);

  return c;
}

function artStonePestle() {
  const c = mkC(24, 24), ctx = c.getContext("2d");
  // Small wooden worktable
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(2, 12, 20, 10);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(2, 18, 20, 4);

  // Granite mortar bowl
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.arc(11, 11, 6, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(11, 11, 5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crushed green herb paste inside mortar
  ctx.fillStyle = "#43a047";
  ctx.fillRect(8, 11, 6, 2);
  ctx.fillStyle = "#81c784";
  ctx.fillRect(9, 11, 4, 1);

  // Stone pestle standing tilted inside bowl
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.moveTo(10, 12); ctx.lineTo(15, 4); ctx.lineTo(17, 5); ctx.lineTo(12, 13); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(15, 4, 2, 2); // Handle top

  // Small white ceramic salve jar on side
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(18, 9, 4, 5);
  ctx.fillStyle = "#795548";
  ctx.fillRect(19, 8, 2, 1); // Cork stopper

  // Dried herb leaves on table
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(3, 11, 3, 2);
  ctx.fillRect(4, 10, 2, 1);

  return c;
}

function artBirdBath() {
  const c = mkC(24, 28), ctx = c.getContext("2d");
  // Marble pedestal base
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(8, 22, 8, 4);
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(6, 25, 12, 2);

  // Pillar column with leaf relief
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(10, 11, 4, 11);
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(10, 14, 4, 1);
  ctx.fillRect(10, 18, 4, 1);

  // Shallow marble basin bowl
  ctx.fillStyle = "#cfd8dc";
  ctx.beginPath();
  ctx.ellipse(12, 11, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clear serene water inside basin
  ctx.fillStyle = "#4fc3f7";
  ctx.beginPath();
  ctx.ellipse(12, 10.5, 8.5, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Little floating lily pad
  ctx.fillStyle = "#66bb6a";
  ctx.beginPath();
  ctx.ellipse(8, 10.5, 2, 1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Yellow canary bird perched on edge
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(17, 8, 2.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(19, 8, 1.5, 1); // Beak
  ctx.fillStyle = "#ffa000";
  ctx.fillRect(15, 9, 2, 2); // Tail

  return c;
}

function artSkewerCamp() {
  const c = mkC(26, 26), ctx = c.getContext("2d");
  // Stone hearth ring
  ctx.fillStyle = "#455a64";
  ctx.beginPath();
  ctx.ellipse(13, 17, 11, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#263238";
  ctx.beginPath();
  ctx.ellipse(13, 18, 9, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Glowing charcoal embers in center
  ctx.fillStyle = "#bf360c";
  ctx.beginPath();
  ctx.ellipse(13, 17, 6, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff5722";
  ctx.fillRect(11, 16, 4, 2);
  ctx.fillStyle = "#ffeb3b";
  ctx.fillRect(12, 17, 2, 1);

  // Forked branch skewer holder stakes
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(4, 9, 2, 11);
  ctx.fillRect(20, 9, 2, 11);

  // Horizontal cinnamon skewer stick across
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(3, 11, 20, 2);

  // 3 Roasted red apples with golden honey glaze on skewer
  // Apple 1
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(8, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(7, 10, 2, 2); // Honey glaze shine

  // Apple 2
  ctx.fillStyle = "#c62828";
  ctx.beginPath();
  ctx.arc(13, 12, 3.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(12, 10, 2, 2);

  // Apple 3
  ctx.fillStyle = "#d32f2f";
  ctx.beginPath();
  ctx.arc(18, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(17, 10, 2, 2);

  return c;
}

function artStreetGaslamp() {
  const c = mkC(22, 44), ctx = c.getContext("2d");
  // Wrought iron base
  ctx.fillStyle = "#263238";
  ctx.fillRect(8, 38, 6, 6);
  ctx.fillStyle = "#102027";
  ctx.fillRect(7, 41, 8, 3);

  // Tall iron post
  ctx.fillStyle = "#37474f";
  ctx.fillRect(10, 14, 2, 24);

  // Brass valve knob on post
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(8, 26, 2, 2);

  // Ornamental bracket curves
  ctx.fillStyle = "#263238";
  ctx.fillRect(7, 13, 8, 2);
  ctx.fillRect(8, 11, 6, 2);

  // Four-sided glass lamp housing
  ctx.fillStyle = "#455a64";
  ctx.fillRect(6, 4, 10, 8);
  // Clear glowing warm glass
  ctx.fillStyle = "#fff9c4";
  ctx.fillRect(7, 5, 8, 6);

  // Bright warm orange-gold gas flame inside
  ctx.fillStyle = "#ff9800";
  ctx.beginPath();
  ctx.ellipse(11, 8, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffff55";
  ctx.fillRect(10.5, 7, 1, 2);

  // Pointed copper cap roof
  ctx.fillStyle = "#00695c";
  ctx.beginPath();
  ctx.moveTo(11, 0); ctx.lineTo(17, 4); ctx.lineTo(5, 4); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(10, 0, 2, 1); // Pinnacle finial

  return c;
}

function artBarberChair() {
  const c = mkC(26, 32), ctx = c.getContext("2d");
  // Heavy cast iron base and hydraulic pedal
  ctx.fillStyle = "#37474f";
  ctx.fillRect(8, 26, 8, 4);
  ctx.fillStyle = "#263238";
  ctx.fillRect(6, 29, 12, 2);

  // Hydraulic chrome pillar
  ctx.fillStyle = "#b0bec5";
  ctx.fillRect(11, 20, 3, 6);

  // Red leather padded seat and armrests
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(7, 16, 11, 5);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(8, 16, 9, 3);

  // High backrest and headrest
  ctx.fillStyle = "#b71c1c";
  ctx.fillRect(8, 8, 9, 8);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(9, 9, 7, 6);
  // Headrest pillow
  ctx.fillStyle = "#c62828";
  ctx.fillRect(9, 5, 7, 3);

  // Polished chrome armrests
  ctx.fillStyle = "#cfd8dc";
  ctx.fillRect(5, 14, 2, 6);
  ctx.fillRect(18, 14, 2, 6);

  // Barber pole cylinder beside chair (red, white, blue spirals)
  ctx.fillStyle = "#37474f";
  ctx.fillRect(21, 6, 3, 20);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(22, 8, 2, 16);
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(22, 10, 2, 3);
  ctx.fillRect(22, 18, 2, 3);
  ctx.fillStyle = "#1976d2";
  ctx.fillRect(22, 14, 2, 3);
  // Brass ball finial on top of pole
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(21, 5, 3, 2);

  // Mirror frame on small side table
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(1, 10, 4, 14);
  ctx.fillStyle = "#81d4fa";
  ctx.fillRect(2, 11, 2, 8); // Glass gleam

  return c;
}

// Ayakan tepung gandum kayu tradisional (24x20)
function artGrainSifter() {
  const c = mkC(24, 20);
  // Meja kayu penyangga
  c.f('#5c4033', 3, 10, 18, 2);
  c.f('#3e2723', 4, 12, 2, 7);
  c.f('#3e2723', 18, 12, 2, 7);
  c.f('#4e342e', 10, 12, 4, 7);
  // Wadah / mangkuk kayu besar di bawah
  c.f('#6d4c41', 5, 8, 14, 4);
  c.f('#ffffff', 6, 9, 12, 3); // gundukan tepung putih
  c.f('#fff9c4', 7, 8, 10, 2);
  // Bingkai lingkaran ayakan kayu & kawat saringan
  c.f('#8d6e63', 3, 3, 18, 5);
  c.f('#bcaaa4', 4, 4, 16, 3);
  c.f('#cfd8dc', 5, 4, 14, 2); // kawat saringan abu-abu
  c.f('#ffd54f', 7, 3, 4, 2); // biji gandum di atas ayakan
  c.f('#ffb300', 13, 3, 4, 2);
  // Tangkai bulir gandum hiasan di samping meja
  c.f('#8d6e63', 1, 6, 1, 10);
  c.f('#fbc02d', 0, 4, 3, 3);
  c.f('#f57f17', 1, 2, 2, 3);
  return outline(c, '#2a1a08');
}

// Bangku tukang sol sepatu kulit tradisional (24x20)
function artCobblerBench() {
  const c = mkC(24, 20);
  // Bangku kayu kokoh
  c.f('#4e342e', 3, 11, 18, 3);
  c.f('#3e2723', 4, 14, 2, 5);
  c.f('#3e2723', 18, 14, 2, 5);
  // Balok tumpuan pijakan sepatu
  c.f('#6d4c41', 10, 8, 4, 3);
  // Cetakan kayu sol sepatu (wooden last)
  c.f('#d7ccc8', 5, 8, 5, 3);
  c.f('#bcaaa4', 7, 7, 3, 2);
  // Kaleng semir hitam lilin lebah terbuka & sikat bulu kuda
  c.f('#212121', 15, 9, 3, 2);
  c.f('#ffb300', 16, 9, 1, 1); // semir lilin lebah
  c.f('#8d6e63', 19, 8, 3, 2); // gagang sikat
  c.f('#424242', 19, 10, 3, 1); // bulu sikat kuda
  // Potongan kulit samak cokelat di bawah bangku
  c.f('#795548', 7, 16, 5, 2);
  c.f('#a1887f', 13, 16, 4, 2);
  return outline(c, '#211510');
}

// Panggung wayang boneka kayu mini bertirai merah (26x24)
function artPuppeteerStage() {
  const c = mkC(26, 24);
  // Kaki penyangga panggung kayu
  c.f('#4e342e', 4, 18, 3, 5);
  c.f('#4e342e', 19, 18, 3, 5);
  // Meja / kotak dasar panggung kayu
  c.f('#5c4033', 2, 14, 22, 5);
  c.f('#3e2723', 2, 18, 22, 1);
  c.f('#d7ccc8', 4, 15, 18, 2); // papan lantai panggung
  // Tiang samping panggung
  c.f('#8d6e63', 3, 2, 2, 13);
  c.f('#8d6e63', 21, 2, 2, 13);
  // Atap kanopi panggung ungu berenda emas
  c.f('#4a148c', 2, 1, 22, 3);
  c.f('#ffd54f', 2, 4, 22, 1);
  // Tirai beledu merah tersingkap di kiri & kanan
  c.f('#c62828', 4, 3, 4, 10);
  c.f('#b71c1c', 5, 4, 2, 8);
  c.f('#c62828', 18, 3, 4, 10);
  c.f('#b71c1c', 19, 4, 2, 8);
  c.f('#ffd54f', 7, 7, 2, 1); // tali pengikat tirai emas
  c.f('#ffd54f', 17, 7, 2, 1);
  // Papan latar panggung biru langit & awan
  c.f('#90caf9', 8, 4, 10, 8);
  c.f('#ffffff', 10, 5, 6, 2);
  c.f('#81c784', 8, 11, 10, 2); // bukit hijau latar
  // Boneka ksatria kecil & boneka naga bertali
  c.f('#9e9e9e', 9, 8, 3, 4); // ksatria perak
  c.f('#e53935', 10, 7, 1, 1); // bulu helm merah
  c.f('#ffd54f', 8, 9, 1, 2); // pedang kecil
  c.f('#43a047', 14, 8, 4, 4); // naga hijau
  c.f('#ffb300', 17, 9, 1, 2); // sayap naga
  // Benang tali boneka transparan putih ke atas
  c.f('#e0e0e0', 10, 3, 1, 5);
  c.f('#e0e0e0', 15, 3, 1, 5);
  return outline(c, '#211510');
}

// Jam matahari batu pualam kuno (22x22)
function artSundial() {
  const c = mkC(22, 22);
  // Dasar tugu pualam bertingkat
  c.f('#cfd8dc', 5, 17, 12, 3);
  c.f('#b0bec5', 4, 19, 14, 2);
  c.f('#90a4ae', 3, 20, 16, 2);
  // Tiang pilar pualam silinder
  c.f('#eceff1', 7, 8, 8, 9);
  c.f('#cfd8dc', 9, 8, 4, 9);
  c.f('#81c784', 6, 11, 2, 5); // sulur ivy kecil melilit
  c.f('#4caf50', 14, 13, 2, 4);
  // Piringan bundar jam matahari (cakram pualam)
  c.f('#b0bec5', 2, 4, 18, 5);
  c.f('#ffffff', 3, 3, 16, 5);
  c.f('#eceff1', 4, 2, 14, 5);
  // Garis-garis ukiran jam romawi kuno
  c.f('#78909c', 6, 4, 1, 2);
  c.f('#78909c', 11, 3, 1, 2);
  c.f('#78909c', 15, 4, 1, 2);
  c.f('#78909c', 7, 6, 1, 1);
  c.f('#78909c', 14, 6, 1, 1);
  // Jarum segitiga perunggu gnomon (miring ke tengah)
  c.f('#f57f17', 10, 1, 2, 4);
  c.f('#ffb300', 11, 2, 2, 3);
  c.f('#ffd54f', 11, 1, 1, 2);
  // Bayangan tajam gnomon di piringan
  c.f('#546e7a', 12, 4, 4, 2);
  return outline(c, '#263238');
}
