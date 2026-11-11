'use strict';
// Pohon, semak, batu, dekorasi alam
// ---------- palet ----------
const LEAF = ['#2e5a40', '#44805f', '#5fbf68', '#85e07a', '#c4f48e'];
const LEAF_F = ['#21422e', '#356a4c', '#4a9a58', '#6cc06c', '#a6e08a'];
const BARK = ['#5a3a30', '#7a5446', '#a06a52', '#c48c66'];
// daun bergumpal (dipakai pohon, semak)
function foliage(x, blobs, pal, seed = 1) {
  for (const b of blobs) {
    const R = Math.ceil(b.r) + 1, k = b.k || Math.max(9, Math.round(b.r * .9)), ph = b.p != null ? b.p : b.x * .37 + b.y * .21;
    for (let j = -R; j <= R; j++) for (let i = -R; i <= R; i++) {
      const d = Math.hypot(i, j), a = Math.atan2(j, i);
      const re = b.r * (1 - .07 * Math.abs(Math.sin(a * k / 2 + ph))) - (hash(Math.round(a * 9), b.x, 3) > .7 ? .8 : 0);
      if (d > re) continue;
      const nx = i / b.r, ny = j / b.r;
      const X = b.x + i, Y = b.y + j;
      const n = hash(X >> 1, Y >> 1, seed) * .7 + hash(X, Y, seed + 1) * .3;
      const l = -(nx * .5 + ny * .86) + (n - .5) * .5;
      let col;
      if (d > re - 1.6 && ny > -.15) col = pal[1];
      else if (l > .62) col = pal[4]; else if (l > .2) col = pal[3]; else if (l > -.3) col = pal[2]; else col = pal[1];
      px(x, col, X, Y);
    }
    // gumpalan daun kecil agar tekstur terasa rimbun
    const nC = Math.floor(b.r * b.r / 14);
    for (let q = 0; q < nC; q++) {
      const a = hash(q, b.x, seed + 5) * Math.PI * 2, rr = Math.sqrt(hash(q, b.y, seed + 6)) * (b.r - 3);
      const X = b.x + Math.cos(a) * rr, Y = b.y + Math.sin(a) * rr, cr = 2 + hash(q, 9, seed) * 1.6;
      const l = -(Math.cos(a) * rr / b.r * .5 + Math.sin(a) * rr / b.r * .86);
      if (l < -.25) continue;
      const top = l > .45 ? pal[4] : pal[3], mid = l > .45 ? pal[3] : pal[2];
      for (let j = -Math.ceil(cr); j <= cr; j++) for (let i = -Math.ceil(cr); i <= cr; i++) {
        const dd = i * i + j * j; if (dd > cr * cr) continue;
        px(x, j > cr * .45 ? pal[2] : (j < -cr * .2 && i < cr * .3 ? top : mid), X + i, Y + j);
      }
    }
  }
}
function trunk(x, cx, y0, y1, w0, w1, pal) {
  for (let y = y0; y <= y1; y++) {
    const t = (y - y0) / Math.max(1, y1 - y0), hw = (w0 + (w1 - w0) * t) / 2;
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const u = i / hw; let c = u < -.45 ? pal[2] : u < .38 ? pal[1] : pal[0];
      if (u < -.78) c = pal[3];
      if (hash(Math.round((cx + i) / 2), Math.floor(y / 5) + (i & 1), 7) > .8 && u > -.78) c = shade(c, -.22);
      px(x, c, cx + i, y);
    }
  }
}
function root(x, x0, y0, x1, y1, r0, r1, pal) {
  const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
  for (let s = 0; s <= n; s++) {
    const t = s / n, cx = x0 + (x1 - x0) * t, cy = y0 + (y1 - y0) * t - Math.sin(t * Math.PI) * 3, r = r0 + (r1 - r0) * t;
    for (let j = -Math.ceil(r); j <= r; j++) for (let i = -Math.ceil(r); i <= r; i++) {
      if (i * i + j * j > r * r) continue;
      px(x, j < -r * .3 ? pal[2] : j > r * .4 ? pal[0] : pal[1], cx + i, cy + j);
    }
  }
}
// ---------- POHON BESAR (rumah pohon tetua) ----------
function artBigTree() {
  const W = 236, H = 228, cx = 118, [c, x] = mk(W, H);
  root(x, cx - 18, 200, cx - 66, 218, 10, 3, BARK); root(x, cx + 20, 200, cx + 68, 218, 10, 3, BARK);
  trunk(x, cx, 110, 212, 54, 74, BARK);
  root(x, cx - 30, 204, cx - 52, 220, 7, 2, BARK); root(x, cx + 30, 204, cx + 46, 221, 6, 2, BARK); root(x, cx - 4, 208, cx - 18, 222, 5, 2, BARK);
  // pintu melengkung
  const dx = cx - 22, dw = 20, dy = 176, dh = 37;
  for (let y = dy; y < dy + dh; y++) for (let i = 0; i < dw; i++) {
    const ax = i - dw / 2 + .5, ay = y - (dy + 10);
    if (ay < 0 && ax * ax + ay * ay > 100) continue;
    const edge = i === 0 || i === dw - 1 || (ay < 0 && ax * ax + ay * ay > 72);
    px(x, edge ? '#3e2414' : (i % 5 === 2 ? '#6e4222' : (i < 4 ? '#a8673a' : '#93592e')), dx + i, y);
  }
  fr(x, '#3e2414', dx + 1, dy + 22, dw - 2, 1);
  fr(x, '#ffd84a', dx + 15, dy + 21, 2, 2);
  fr(x, '#c8c2b2', dx - 2, dy + dh, dw + 4, 3); fr(x, '#e6e0d0', dx - 1, dy + dh, dw + 2, 1);
  // jendela bulat menyala
  ellF(x, '#3e2414', cx + 12, 158, 7, 7); ellF(x, '#d8b04a', cx + 12, 158, 5.5, 5.5); ellF(x, '#fff0a0', cx + 12, 158, 4, 4); ellF(x, '#ffffff', cx + 11, 157, 1.5, 1.5);
  fr(x, '#3e2414', cx + 12, 152, 1, 12); fr(x, '#3e2414', cx + 6, 158, 12, 1);
  // lentera kecil
  fr(x, '#3e2414', cx - 32, 168, 1, 6); fr(x, '#3e2414', cx - 35, 174, 7, 1); fr(x, '#ffe27a', cx - 34, 175, 5, 6); fr(x, '#fff8d0', cx - 33, 176, 2, 3); fr(x, '#3e2414', cx - 35, 181, 7, 1);
  // tangga melingkar di kanan
  const steps = [];
  for (let i = 0; i < 10; i++) steps.push([cx + 46 - i * 2 + Math.round(7 * Math.sin(i * .55)), 214 - i * 7]);
  for (let i = steps.length - 1; i >= 0; i--) {
    const [sx, sy] = steps[i];
    fr(x, '#4a2e18', sx - 1, sy - 1, 18, 7); fr(x, '#b07a46', sx, sy, 16, 4); fr(x, '#d9a466', sx, sy, 16, 1); fr(x, '#7a4e2c', sx, sy + 4, 16, 1);
    fr(x, '#5e3b20', sx + 14, sy - 9, 2, 10);
  }
  for (let i = 0; i < steps.length - 1; i++) {
    const [ax, ay] = steps[i], [bx, by] = steps[i + 1];
    for (let t = 0; t <= 1; t += .1) px(x, '#8a5a32', ax + 15 + (bx - ax) * t, ay - 9 + (by - ay) * t);
  }
  // kanopi
  const B = [[-46, 46, 29], [0, 36, 34], [46, 46, 29], [-72, 76, 25], [-28, 66, 31], [28, 66, 31], [72, 76, 25],
    [-82, 108, 20], [-44, 104, 28], [0, 100, 31], [44, 104, 28], [82, 108, 20], [-60, 130, 17], [-22, 134, 20], [22, 134, 20], [60, 130, 17]];
  foliage(x, B.map(([a, b, r]) => ({ x: cx + Math.round(a * 1.12), y: b + 2, r: r + 2 })), LEAF, 3);
  // kilau cahaya di atas
  for (let i = 0; i < 40; i++) { const a = hash(i, 1, 9) * Math.PI, r = hash(i, 2, 9) * 40; const X = cx - 20 + Math.cos(a) * r - 10, Y = 26 + hash(i, 3, 9) * 30; if (x.getImageData(X, Y, 1, 1).data[3]) px(x, '#c8f088', X, Y); }
  return outline(c, '#24201a');
}
// ---------- pohon buah ----------
function artFruitTree(fruit, seed) {
  const W = 52, H = 64, cx = 26, [c, x] = mk(W, H);
  root(x, cx - 2, 58, cx - 9, 62, 3, 1, BARK); root(x, cx + 2, 58, cx + 9, 62, 3, 1, BARK);
  trunk(x, cx, 34, 61, 6, 8, BARK);
  const B = [[0, 16, 14], [-12, 24, 11], [12, 24, 11], [-7, 33, 10], [8, 33, 10], [0, 26, 12]];
  foliage(x, B.map(([a, b, r]) => ({ x: cx + a, y: b, r })), LEAF, seed);
  const pos = [[-8, 14], [6, 10], [13, 22], [-14, 24], [-4, 28], [9, 31], [-10, 35], [2, 19], [16, 30], [-1, 37]];
  const [f0, f1] = fruit === 'apple' ? ['#e5372c', '#ff8a7a'] : fruit === 'orange' ? ['#ff9420', '#ffd08a'] : ['#e4d840', '#fff8a0'];
  pos.forEach(([a, b], i) => {
    if (hash(i, seed, 4) < .15) return;
    const X = cx + a, Y = b; fr(x, shade(f0, -.35), X - 1, Y, 3, 2); fr(x, f0, X - 1, Y - 1, 3, 2); px(x, f1, X - 1, Y - 1);
  });
  return outline(c, '#24201a');
}
function artRoundTree(seed, pal = LEAF_F) {
  const W = 48, H = 60, cx = 24, [c, x] = mk(W, H);
  trunk(x, cx, 36, 57, 6, 8, BARK);
  const B = [[0, 15, 13], [-11, 23, 11], [11, 23, 11], [-6, 32, 10], [7, 32, 10]];
  foliage(x, B.map(([a, b, r]) => ({ x: cx + a + Math.round((hash(a, b, seed) - .5) * 3), y: b, r })), pal, seed);
  return outline(c, '#1a2416');
}
// ---------- pinus ----------
function artPine(seed, dark) {
  const W = 38, H = 58, cx = 19, [c, x] = mk(W, H);
  const P = dark ? ['#1a3a32', '#28584a', '#367858', '#56a06a'] : ['#1e4636', '#2e6a50', '#40905e', '#66b874'];
  trunk(x, cx, 46, 56, 5, 6, BARK);
  const tiers = [[3, 17, 8], [12, 29, 12], [22, 41, 15], [32, 50, 17]];
  for (const [t0, t1, hwMax] of tiers) {
    for (let y = t0; y <= t1; y++) {
      const tt = (y - t0) / (t1 - t0); let hw = 2 + tt * (hwMax - 2);
      if (y >= t1 - 1) hw -= (hash(y, seed, 3) * 2);
      for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
        const u = i / hw;
        if (y === t1 && (i & 3) === 0 && Math.abs(u) > .2) continue;
        let col = u < -.35 ? P[3] : u < .3 ? P[2] : P[1];
        if (y >= t1 - 1) col = P[1];
        if (hash(cx + i, y, seed) > .86 && u < .3) col = shade(col, .15);
        if (u > .7 || (y >= t1 - 2 && u > .1)) col = P[0];
        px(x, col, cx + i, y);
      }
    }
  }
  return outline(c, '#0e2216');
}
function artBush(seed, flowers) {
  const W = 26, H = 18, [c, x] = mk(W, H);
  foliage(x, [{ x: 8, y: 10, r: 6.5 }, { x: 17, y: 10, r: 6.5 }, { x: 13, y: 7, r: 6.5 }], LEAF, seed);
  if (flowers) {
    const cols = { pink: ['#f58ac4', '#ffd0e8'], white: ['#ffffff', '#fff6c0'], purple: ['#b48aea', '#e0ccff'], yellow: ['#ffd84a', '#fff4b0'] }[flowers];
    for (let i = 0; i < 9; i++) {
      const X = 4 + Math.round(hash(i, seed, 1) * 17), Y = 3 + Math.round(hash(i, seed, 2) * 10);
      if (!x.getImageData(X, Y, 1, 1).data[3]) continue;
      px(x, cols[0], X, Y); px(x, cols[0], X + 1, Y); px(x, cols[0], X, Y + 1); px(x, cols[1], X + 1, Y + 1);
    }
  }
  return outline(c, '#1d3a1c');
}
function artRock(seed) { const [c, x] = mk(20, 14); ellF(x, '#8a857e', 10, 8, 8, 5); ellF(x, '#aaa59c', 9, 7, 7, 4); ellF(x, '#c8c3b8', 7, 5, 3, 2); if (seed % 2) { ellF(x, '#5e9a3a', 12, 4, 3, 1.5); } return outline(c, '#3a3630'); }
function artLog() { const [c, x] = mk(32, 14); fr(x, '#7a4e2c', 4, 3, 24, 9); fr(x, '#9a6838', 4, 3, 24, 3); for (let i = 6; i < 26; i += 5) fr(x, '#5e3b20', i, 6, 3, 1); ellF(x, '#c8945a', 27, 7, 3.5, 4.5); ellF(x, '#a8743e', 27, 7, 2, 2.8); ellF(x, '#7a4e2c', 4, 7, 3, 4.5); return outline(c, '#3a2418'); }
function artStump() { const [c, x] = mk(18, 14); fr(x, '#7a4e2c', 3, 5, 12, 7); fr(x, '#9a6838', 3, 5, 4, 7); ellF(x, '#c8945a', 9, 5, 6, 2.5); ellF(x, '#a8743e', 9, 5, 3, 1.2); return outline(c, '#3a2418'); }
function artMushDeco() { const [c, x] = mk(14, 12); const m = (X, Y, s) => { fr(x, '#f0e6d0', X, Y, 2, 4); ellF(x, '#e04a3a', X + 1, Y, s, s * .6); px(x, '#ffffff', X - 1, Y - 1); px(x, '#ffffff', X + 2, Y); }; m(4, 6, 3); m(9, 7, 2.2); return outline(c, '#3a1a1a'); }
function artHay() { const [c, x] = mk(26, 20); ellF(x, '#c8a03a', 13, 11, 11, 8); ellF(x, '#e8c85a', 12, 9, 9, 6); for (let i = 0; i < 14; i++) px(x, '#a8802a', 4 + hash(i, 1, 9) * 18, 5 + hash(i, 2, 9) * 11); fr(x, '#8a5a2a', 2, 10, 22, 1); return outline(c, '#4a3410'); }
function artStalag(seed) { const [c, x] = mk(18, 26); for (let y = 2; y < 24; y++) { const hw = 1 + (y - 2) / 22 * 7; for (let i = Math.round(-hw); i <= Math.round(hw); i++) { const u = i / hw; px(x, u < -.3 ? '#8a8296' : u < .4 ? '#6a6276' : '#4e4858', 9 + i, y); } } ellF(x, '#4e4858', 9, 23, 8, 2); if (seed % 2) { ellF(x, '#6a6276', 14, 21, 3, 4); } return outline(c, '#1e1a24'); }
function artCrystals(seed, col = ['#3a8ee0', '#7ad0ff', '#d8f6ff']) {
  const [c, x] = mk(22, 22);
  const sh = [[11, 20, 4, 14], [6, 20, 3, 9], [16, 20, 3, 10]];
  for (const [cx, by, hw, h] of sh) for (let y = by - h; y <= by; y++) { const t = (y - (by - h)) / h, w = Math.min(hw, t * hw * 2.2); for (let i = Math.round(-w); i <= Math.round(w); i++) px(x, i < 0 ? col[1] : col[0], cx + i, y); px(x, col[2], cx - 1, y); }
  return outline(c, '#101a30');
}
function artBones() { const [c, x] = mk(20, 10); fr(x, '#e8e2d0', 2, 6, 12, 2); fr(x, '#e8e2d0', 1, 5, 2, 4); fr(x, '#e8e2d0', 13, 5, 2, 4); ellF(x, '#f0ead8', 15, 4, 4, 3.5); fr(x, '#2a2030', 13, 3, 2, 2); fr(x, '#2a2030', 16, 3, 2, 2); return outline(c, '#3a3040'); }
function artBramble() {
  const [c, x] = mk(24, 20);
  ellF(x, '#6a4a2a', 12, 10, 10, 7);
  ellF(x, '#8a6238', 11, 9, 8, 5);
  for (let i = 0; i < 16; i++) {
    const a = hash(i, 3, 7) * Math.PI * 2, r = 5 + hash(i, 8, 2) * 5;
    const px0 = 12 + Math.cos(a) * r, py0 = 10 + Math.sin(a) * r;
    px(x, '#4a2c14', px0, py0);
    px(x, '#c89a58', px0 + 1, py0 - 1);
  }
  return outline(c, '#2a1408');
}
function artPebbles() {
  const [c, x] = mk(18, 12);
  // Tumpukan batu kerikil pipih halus di tepi air
  ellF(x, '#7a767e', 9, 8, 7, 3);
  ellF(x, '#9a949c', 8, 7, 6, 2.5);
  ellF(x, '#b8b2ba', 7, 6, 4, 1.8);
  ellF(x, '#8a8894', 12, 5, 4, 2);
  ellF(x, '#aba8b4', 11, 4.5, 3, 1.4);
  px(x, '#ffffff', 6, 5);
  px(x, '#ffffff', 11, 4);
  return outline(c, '#2a2630');
}
function artBloom() {
  const [c, x] = mk(18, 16);
  // Pot tanah liat kecil
  fr(x, '#a85a32', 4, 10, 10, 5);
  fr(x, '#c87a4a', 3, 9, 12, 2);
  // Daun hijau segar
  px(x, '#3f8a34', 5, 8); px(x, '#6cc04a', 4, 7);
  px(x, '#3f8a34', 12, 8); px(x, '#6cc04a', 13, 7);
  // Mahkota bunga mekar 3 kuncup warna-warni
  ellF(x, '#ff5a8a', 9, 5, 4, 4);
  ellF(x, '#ffd84a', 9, 5, 2, 2);
  ellF(x, '#9ad4ff', 6, 6, 2.5, 2.5);
  ellF(x, '#d08aff', 12, 6, 2.5, 2.5);
  px(x, '#ffffff', 8, 4);
  return outline(c, '#2a1408');
}
function artCaveMouth() {
  const W = 92, H = 70, [c, x] = mk(W, H);
  for (let y = 0; y < H; y++) for (let i = 0; i < W; i++) {
    const dx = (i - W / 2) / (W / 2), dy = (y - H) / H; const e = dx * dx + dy * dy * 1.1;
    if (e > 1) continue;
    const n = hash(i >> 2, y >> 2, 4);
    let col = n > .6 ? '#8a8494' : n > .3 ? '#7a7484' : '#6a6474';
    if (dy < -.75 + Math.abs(dx) * .1) col = shade(col, .15);
    const inner = (dx * dx) / .3 + ((y - H) / (H * .72)) ** 2;
    if (inner < 1) col = inner < .7 ? '#0a080e' : '#1e1a26';
    px(x, col, i, y);
  }
  for (let i = 0; i < 8; i++) ellF(x, '#4f9a3a', 10 + i * 10, 6 + Math.abs(4 - i) * 3, 4, 2.4);
  return outline(c, '#1e1a24');
}

function artFrostFlower() {
  const [c, x] = mk(20, 20);
  // Snow base mound
  ellF(x, '#d8eef8', 10, 16, 8, 3.5);
  ellF(x, '#ffffff', 10, 15, 6, 2.5);

  // Pale frozen stem and leafy base
  fr(x, '#629cb8', 9, 10, 2, 6);
  px(x, '#4a829e', 8, 13);
  px(x, '#7ac0de', 11, 13);

  // Crystalline ice petals
  ellF(x, '#9adbf8', 10, 7, 6, 6);
  ellF(x, '#c8f0ff', 10, 7, 4, 4);

  // Crystal star shape
  fr(x, '#ffffff', 9, 4, 2, 6);
  fr(x, '#ffffff', 7, 6, 6, 2);
  px(x, '#58b8e8', 6, 6);
  px(x, '#58b8e8', 13, 6);
  px(x, '#58b8e8', 9, 3);
  px(x, '#58b8e8', 10, 10);

  // Glowing pure center core (sweet nectar droplet)
  px(x, '#eefcff', 9, 7);
  px(x, '#eefcff', 10, 7);

  return outline(c, '#1e384c');
}

function artPigeonsSpot() {
  const [c, x] = mk(26, 20);
  // Paving stones and scattered grain dots
  ellF(x, '#8a8898', 13, 15, 11, 4.5);
  ellF(x, '#a8a6b6', 13, 14, 9, 3.5);

  // Scattered grain seeds
  px(x, '#ffd860', 10, 14);
  px(x, '#ffd860', 14, 15);
  px(x, '#ffd860', 8, 16);
  px(x, '#ffd860', 17, 14);

  // Pigeon 1 (pecking ground, center-left)
  ellF(x, '#8892a0', 9, 11, 4, 3);
  ellF(x, '#b0b8c8', 8, 10, 2.5, 2);
  px(x, '#4a6078', 6, 12); // pecking head
  px(x, '#f08030', 5, 13); // beak
  px(x, '#58c080', 8, 9);  // green iridescent neck
  px(x, '#2a2830', 12, 10); // wing tip

  // Pigeon 2 (looking up, right)
  ellF(x, '#8892a0', 17, 10, 4, 3);
  ellF(x, '#b0b8c8', 18, 9, 2.5, 2);
  px(x, '#4a6078', 19, 7); // head up
  px(x, '#f08030', 20, 7); // beak
  px(x, '#d858a0', 18, 8); // purple iridescent neck
  px(x, '#2a2830', 15, 10); // wing tip

  // Pigeon 3 (small, pecking behind)
  ellF(x, '#707a88', 13, 8, 3, 2);
  px(x, '#f08030', 11, 9);

  return outline(c, '#24222c');
}

function artLotusPondSpot() {
  const [c, x] = mk(26, 22);
  // Water ripples
  ellF(x, '#2a6a60', 13, 14, 11, 6);
  ellF(x, '#3a8a7c', 13, 13, 9, 4.5);

  // Big green lily pad
  ellF(x, '#2d7c38', 11, 13, 8, 4.5);
  ellF(x, '#44a852', 11, 12, 7, 3.5);
  // Cutout notch on lily pad
  px(x, '#3a8a7c', 15, 12);
  px(x, '#3a8a7c', 16, 12);

  // Blooming pink lotus flower on right
  ellF(x, '#f078a8', 18, 9, 4, 3.5);
  ellF(x, '#ffaed0', 18, 8, 3, 2.5);
  fr(x, '#ffffff', 18, 7, 1, 2);
  px(x, '#ffd850', 18, 9); // golden yellow stamen

  // Cute green frog sitting on left of lily pad
  ellF(x, '#60c83a', 8, 9, 3.5, 2.8); // frog body
  ellF(x, '#82e850', 8, 8, 2.5, 1.8);
  px(x, '#1c3412', 6, 8); // black eyes
  px(x, '#ffffff', 6, 7);
  px(x, '#1c3412', 10, 8);
  px(x, '#ffffff', 10, 7);
  px(x, '#48a824', 6, 11); // webbed back feet
  px(x, '#48a824', 10, 11);

  return outline(c, '#142e26');
}

function artCoffeeShrub() {
  const [c, x] = mk(22, 22);
  // Ground soil
  ellF(x, '#5a4632', 11, 18, 9, 3.5);

  // Bush body dark green leaves
  ellF(x, '#245a2c', 11, 12, 9, 7);
  ellF(x, '#347c3c', 10, 11, 7, 5.5);
  ellF(x, '#50a858', 9, 9, 4, 3);

  // Ripe red coffee cherries cluster
  // Cluster left
  ellF(x, '#c82424', 6, 12, 2, 2);
  px(x, '#ff6a6a', 6, 11);
  ellF(x, '#961414', 5, 14, 1.8, 1.8);

  // Cluster center
  ellF(x, '#c82424', 11, 14, 2.2, 2.2);
  px(x, '#ff6a6a', 11, 13);
  ellF(x, '#e03030', 13, 13, 1.8, 1.8);
  px(x, '#ff8080', 13, 12);

  // Cluster right
  ellF(x, '#c82424', 16, 11, 2, 2);
  px(x, '#ff6a6a', 16, 10);
  ellF(x, '#961414', 15, 13, 1.6, 1.6);

  // Branches
  fr(x, '#4a3220', 10, 15, 2, 5);

  return outline(c, '#14281a');
}

function artOrchidRock() {
  const [c, x] = mk(26, 22);
  // Wet river stone base
  ellF(x, '#4a5860', 13, 16, 11, 5);
  ellF(x, '#6a7c88', 13, 15, 9, 4);
  ellF(x, '#8aa0b0', 11, 14, 5, 2);

  // River water ripple at edge
  ellF(x, '#3a8ab8', 6, 17, 4, 1.5);
  px(x, '#ffffff', 6, 17);

  // Green hanging orchid leaves
  fr(x, '#246838', 9, 10, 2, 5);
  fr(x, '#348848', 12, 11, 2, 4);
  px(x, '#58b868', 8, 12);
  px(x, '#58b868', 14, 13);

  // Blue river orchid blossom 1 (left)
  ellF(x, '#58a8f0', 9, 7, 3.5, 3);
  ellF(x, '#9ad0ff', 9, 6, 2.2, 1.8);
  px(x, '#dff2ff', 9, 6);
  px(x, '#e070c8', 9, 8); // violet lip center

  // Blue river orchid blossom 2 (right)
  ellF(x, '#58a8f0', 15, 8, 3, 2.5);
  ellF(x, '#9ad0ff', 15, 7, 2, 1.5);
  px(x, '#e070c8', 15, 9);

  return outline(c, '#142028');
}

function artCanaryPerch() {
  const [c, x] = mk(24, 26);
  // Ground mossy mound
  ellF(x, '#4a5440', 12, 22, 9, 3.5);

  // Slender willow wood pole / perch branch
  fr(x, '#6a5238', 11, 6, 3, 17);
  fr(x, '#8a6a48', 12, 6, 1, 17);
  // Horizontal branch fork
  fr(x, '#6a5238', 5, 10, 14, 2);
  fr(x, '#8a6a48', 6, 10, 12, 1);

  // Little yellow canary bird perched on left of branch
  ellF(x, '#ffcf30', 8, 7, 3.5, 2.8); // yellow body
  ellF(x, '#ffe468', 8, 6, 2.5, 1.8);
  px(x, '#2a1a10', 6, 6); // eye
  px(x, '#f07820', 5, 7); // tiny orange beak
  px(x, '#e0a818', 10, 8); // wing / tail
  px(x, '#4a3218', 7, 10); // claw on branch
  px(x, '#4a3218', 9, 10);

  // Little green willow leaf sprouting
  px(x, '#58b858', 17, 9);
  px(x, '#388838', 18, 10);

  return outline(c, '#1e1c18');
}

function artWoodlandShrine() {
  const [c, x] = mk(26, 32);
  // Mossy stone base
  ellF(x, '#424e44', 13, 27, 10, 4);
  ellF(x, '#58685c', 13, 26, 8, 3);
  // Soft emerald moss creeping up
  px(x, '#38a854', 6, 26);
  px(x, '#5cd878', 7, 25);
  px(x, '#38a854', 19, 27);

  // Ancient Forest Maiden stone statue
  // Lower gown / robe
  fr(x, '#76847c', 9, 14, 8, 12);
  fr(x, '#96a69e', 10, 14, 6, 12);
  fr(x, '#58665e', 9, 24, 8, 2);

  // Leafy vine sash around waist
  fr(x, '#38a854', 9, 17, 8, 2);
  px(x, '#78f098', 11, 17);
  px(x, '#78f098', 15, 18);

  // Stone torso & cupped hands holding water basin
  fr(x, '#96a69e', 10, 10, 6, 5);
  // Small stone basin with holy rainwater
  fr(x, '#627068', 10, 12, 6, 4);
  fr(x, '#68d4f0', 11, 12, 4, 2); // pure glowing rain water
  px(x, '#ffffff', 12, 12);

  // Serene maiden face & braided hair
  ellF(x, '#b4c4bc', 13, 7, 4, 4);
  fr(x, '#586860', 10, 4, 6, 3); // stone hair crown
  px(x, '#424e48', 11, 7); // gentle closed eyes
  px(x, '#424e48', 14, 7);

  // Tiny pink flower bud in hair
  px(x, '#f078a8', 9, 4);
  px(x, '#ffffff', 9, 5);

  return outline(c, '#18241c');
}

function artIceHole() {
  const c = mkC(28, 22), ctx = c.getContext("2d");
  // Snow / frost mound outer rim
  ctx.fillStyle = "#d0e6f8";
  ctx.beginPath();
  ctx.ellipse(14, 11, 13, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  // Bright ice glaze
  ctx.fillStyle = "#eef8ff";
  ctx.beginPath();
  ctx.ellipse(14, 10, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  // Deep cold water opening
  ctx.fillStyle = "#1e4d75";
  ctx.beginPath();
  ctx.ellipse(14, 11, 8, 5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Deeper abyss center
  ctx.fillStyle = "#0c2844";
  ctx.beginPath();
  ctx.ellipse(14, 12, 6, 3.5, 0, 0, Math.PI * 2);
  ctx.fill();
  // Translucent ice rim reflection & cracks
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(14, 9, 7.5, Math.PI * 0.8, Math.PI * 1.8);
  ctx.stroke();
  // Cracks radiating outwards
  ctx.strokeStyle = "#aed2ee";
  ctx.beginPath();
  ctx.moveTo(7, 11); ctx.lineTo(4, 13);
  ctx.moveTo(21, 10); ctx.lineTo(24, 8);
  ctx.moveTo(15, 16); ctx.lineTo(16, 19);
  ctx.stroke();
  return c;
}

function artWishTree() {
  const c = mkC(48, 56), ctx = c.getContext("2d");
  // Trunk and ancient twisted roots
  ctx.fillStyle = "#5a3d24";
  ctx.fillRect(20, 32, 8, 22);
  ctx.fillRect(16, 44, 16, 10);
  // Root flares
  ctx.fillStyle = "#3e2815";
  ctx.beginPath();
  ctx.moveTo(14, 54); ctx.lineTo(20, 42); ctx.lineTo(28, 42); ctx.lineTo(34, 54); ctx.closePath();
  ctx.fill();
  // Moss on trunk base
  ctx.fillStyle = "#557a3e";
  ctx.fillRect(18, 48, 4, 4);
  ctx.fillRect(26, 46, 3, 5);

  // Big lush canopy layers
  ctx.fillStyle = "#265428";
  ctx.beginPath();
  ctx.arc(24, 22, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#357037";
  ctx.beginPath();
  ctx.arc(20, 18, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#4a944a";
  ctx.beginPath();
  ctx.arc(24, 15, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#66b860";
  ctx.beginPath();
  ctx.arc(22, 11, 10, 0, Math.PI * 2);
  ctx.fill();

  // Hanging colorful wish ribbons (Red, Gold, Cyan/Blue, White)
  // Red ribbon
  ctx.fillStyle = "#e03b3b";
  ctx.fillRect(16, 28, 2, 8);
  ctx.fillRect(17, 36, 2, 4);
  // Gold ribbon
  ctx.fillStyle = "#f5c538";
  ctx.fillRect(22, 30, 2, 10);
  ctx.fillRect(23, 40, 2, 3);
  // Blue/Cyan ribbon
  ctx.fillStyle = "#42a5f5";
  ctx.fillRect(29, 29, 2, 9);
  ctx.fillRect(30, 38, 2, 4);
  // White ribbon
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 26, 2, 7);

  // Small wooden chime / bell
  ctx.fillStyle = "#c28847";
  ctx.fillRect(25, 27, 3, 4);
  ctx.fillStyle = "#ffe082";
  ctx.fillRect(26, 31, 1, 3);

  return c;
}

function artIceChasm() {
  const c = mkC(28, 32), ctx = c.getContext("2d");
  // Frozen blue glacier rock formation
  ctx.fillStyle = "#2c4866";
  ctx.fillRect(4, 8, 20, 22);
  ctx.fillStyle = "#1e344d";
  ctx.fillRect(6, 12, 16, 18);

  // Translucent glowing cyan ice fissure
  ctx.fillStyle = "#4dd0e1";
  ctx.beginPath();
  ctx.moveTo(14, 4); ctx.lineTo(19, 14); ctx.lineTo(15, 24); ctx.lineTo(17, 30);
  ctx.lineTo(12, 30); ctx.lineTo(10, 20); ctx.lineTo(13, 10); ctx.closePath();
  ctx.fill();

  // Core glow
  ctx.fillStyle = "#e0f7fa";
  ctx.beginPath();
  ctx.moveTo(14, 7); ctx.lineTo(17, 14); ctx.lineTo(14, 22);
  ctx.lineTo(12, 17); ctx.closePath();
  ctx.fill();

  // Hanging crystal frost moss tufts
  ctx.fillStyle = "#26a69a";
  ctx.fillRect(8, 16, 4, 6);
  ctx.fillRect(18, 12, 4, 7);
  ctx.fillRect(15, 22, 5, 5);

  ctx.fillStyle = "#80cbc4";
  ctx.fillRect(9, 18, 2, 5);
  ctx.fillRect(19, 14, 2, 6);
  ctx.fillRect(16, 24, 2, 4);

  // Frost edges and snow cap on top
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(5, 6, 18, 3);
  ctx.fillRect(8, 4, 12, 2);

  return c;
}

function artStoneCairn() {
  const c = mkC(24, 26), ctx = c.getContext("2d");
  // Base flat boulder
  ctx.fillStyle = "#4a5a68";
  ctx.beginPath();
  ctx.ellipse(12, 22, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#323e48";
  ctx.beginPath();
  ctx.ellipse(12, 23, 8, 2.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Second flat river stone
  ctx.fillStyle = "#637788";
  ctx.beginPath();
  ctx.ellipse(12, 17, 7.5, 3.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#7b91a3";
  ctx.beginPath();
  ctx.ellipse(11, 16, 5.5, 2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Third rounded stone
  ctx.fillStyle = "#556b7c";
  ctx.beginPath();
  ctx.ellipse(12, 12, 5.5, 2.8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#8ba5ba";
  ctx.beginPath();
  ctx.ellipse(11, 11, 3.8, 1.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top balancing pebble
  ctx.fillStyle = "#6c8498";
  ctx.beginPath();
  ctx.ellipse(12, 7, 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#a1bfd6";
  ctx.beginPath();
  ctx.ellipse(11, 6.5, 2, 1.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Tiny water moss patches on base
  ctx.fillStyle = "#437854";
  ctx.fillRect(5, 21, 3, 2);
  ctx.fillRect(16, 20, 2, 2);

  return c;
}

function artMeadowWillow() {
  const c = mkC(46, 54), ctx = c.getContext("2d");
  // Trunk and sloping roots
  ctx.fillStyle = "#63432a";
  ctx.fillRect(20, 28, 7, 24);
  ctx.fillStyle = "#4a2f1b";
  ctx.fillRect(17, 44, 13, 8);

  // Drooping willow branch dome
  ctx.fillStyle = "#33691e";
  ctx.beginPath();
  ctx.arc(23, 22, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#558b2f";
  ctx.beginPath();
  ctx.arc(23, 19, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#7cb342";
  ctx.beginPath();
  ctx.arc(22, 16, 14, 0, Math.PI * 2);
  ctx.fill();

  // Weeping hanging vine strands
  ctx.fillStyle = "#8bc34a";
  // Left streamers
  ctx.fillRect(8, 22, 2, 16);
  ctx.fillRect(12, 24, 2, 18);
  ctx.fillRect(16, 26, 2, 15);
  // Center streamers
  ctx.fillRect(21, 28, 2, 14);
  ctx.fillRect(25, 27, 2, 15);
  // Right streamers
  ctx.fillRect(29, 25, 2, 17);
  ctx.fillRect(33, 23, 2, 18);
  ctx.fillRect(37, 21, 2, 14);

  // Wild yellow asters and pink blossoms under tree
  ctx.fillStyle = "#fbc02d";
  ctx.fillRect(12, 48, 2, 2);
  ctx.fillRect(32, 49, 2, 2);
  ctx.fillStyle = "#f06292";
  ctx.fillRect(15, 50, 2, 2);
  ctx.fillRect(29, 47, 2, 2);

  return c;
}

function artHollowMangrove() {
  const c = mkC(46, 52), ctx = c.getContext("2d");
  // Stilt stilt roots splaying in muddy water
  ctx.fillStyle = "#3e2e1e";
  ctx.beginPath();
  ctx.moveTo(14, 50); ctx.lineTo(21, 34); ctx.lineTo(25, 34); ctx.lineTo(32, 50); ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#2c1f13";
  ctx.beginPath();
  ctx.moveTo(10, 52); ctx.lineTo(19, 36); ctx.lineTo(22, 36); ctx.lineTo(16, 52); ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(36, 52); ctx.lineTo(27, 36); ctx.lineTo(24, 36); ctx.lineTo(30, 52); ctx.closePath();
  ctx.fill();

  // Main trunk with hollow cavity
  ctx.fillStyle = "#543d2b";
  ctx.fillRect(19, 22, 8, 16);
  // Hollow cavity in trunk
  ctx.fillStyle = "#1e140d";
  ctx.beginPath();
  ctx.ellipse(23, 29, 3, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Amber resin drop in hollow
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(22, 30, 2, 3);
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(22, 30, 1, 1);

  // Small coconut shell container mounted on root
  ctx.fillStyle = "#795548";
  ctx.beginPath();
  ctx.arc(23, 37, 3, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(22, 36, 2, 1);

  // Swamp mangrove canopy
  ctx.fillStyle = "#1b4d2e";
  ctx.beginPath();
  ctx.arc(23, 16, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.arc(21, 13, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#43a047";
  ctx.beginPath();
  ctx.arc(24, 11, 10, 0, Math.PI * 2);
  ctx.fill();

  // Water ripples at root base
  ctx.strokeStyle = "#4e6a55";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.ellipse(23, 49, 14, 2, 0, 0, Math.PI * 2);
  ctx.stroke();

  return c;
}

function artClimberLedge() {
  const c = mkC(36, 34), ctx = c.getContext("2d");
  // Stone ledge base
  ctx.fillStyle = "#4a4f54";
  ctx.fillRect(4, 20, 28, 12);
  ctx.fillStyle = "#33373b";
  ctx.fillRect(4, 28, 28, 4);

  // Wooden anchor stake and post
  ctx.fillStyle = "#795548";
  ctx.fillRect(10, 8, 4, 18);
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(10, 16, 4, 10);

  // Thick climbing rope coil
  ctx.fillStyle = "#d7ccc8";
  ctx.fillRect(8, 12, 8, 5);
  ctx.fillRect(9, 17, 6, 4);

  // Explorer leather satchel
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(20, 16, 10, 8);
  ctx.fillStyle = "#5d4037";
  ctx.fillRect(20, 19, 10, 2);
  ctx.fillStyle = "#ffd54f";
  ctx.fillRect(24, 19, 2, 2);

  // Small blue swift bird perched / entangled on rope
  ctx.fillStyle = "#1e88e5";
  ctx.beginPath();
  ctx.arc(13, 10, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#0d47a1";
  ctx.fillRect(10, 11, 4, 3);
  ctx.fillStyle = "#ffb300";
  ctx.fillRect(15, 10, 2, 1); // Beak

  // Green cliff moss
  ctx.fillStyle = "#558b2f";
  ctx.fillRect(4, 20, 4, 3);
  ctx.fillRect(26, 21, 6, 2);

  return c;
}

function artHoneyTree() {
  const c = mkC(48, 54), ctx = c.getContext("2d");
  // Ancient oak trunk
  ctx.fillStyle = "#4e342e";
  ctx.fillRect(20, 26, 9, 26);
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(17, 42, 15, 10);

  // Large deep canopy
  ctx.fillStyle = "#1b5e20";
  ctx.beginPath();
  ctx.arc(24, 20, 21, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2e7d32";
  ctx.beginPath();
  ctx.arc(22, 16, 17, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#388e3c";
  ctx.beginPath();
  ctx.arc(25, 13, 13, 0, Math.PI * 2);
  ctx.fill();

  // Branch extending with hanging beehive
  ctx.fillStyle = "#3e2723";
  ctx.fillRect(11, 24, 10, 4);

  // Honeycomb hive (oval layered honey comb)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.ellipse(14, 32, 5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#ffa000";
  ctx.fillRect(11, 30, 6, 2);
  ctx.fillRect(12, 33, 4, 2);

  // Golden honey droplet dripping from hive
  ctx.fillStyle = "#fff59d";
  ctx.fillRect(13, 37, 2, 3);
  ctx.fillStyle = "#ffca28";
  ctx.fillRect(14, 41, 1, 2);

  // Little buzzing bees
  ctx.fillStyle = "#ffee58";
  ctx.fillRect(7, 28, 2, 2);
  ctx.fillRect(18, 36, 2, 2);
  ctx.fillStyle = "#212121";
  ctx.fillRect(8, 29, 1, 1);
  ctx.fillRect(19, 37, 1, 1);

  return c;
}

function artTempleKoiPond() {
  const c = mkC(36, 30), ctx = c.getContext("2d");
  // Outer carved stone basin rim
  ctx.fillStyle = "#5c6b73";
  ctx.beginPath();
  ctx.ellipse(18, 15, 17, 13, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark stone inner ledge
  ctx.fillStyle = "#3a4750";
  ctx.beginPath();
  ctx.ellipse(18, 16, 15, 11, 0, 0, Math.PI * 2);
  ctx.fill();

  // Clear serene blue temple water
  ctx.fillStyle = "#29b6f6";
  ctx.beginPath();
  ctx.ellipse(18, 15, 14, 10, 0, 0, Math.PI * 2);
  ctx.fill();

  // Deeper water depth gradient
  ctx.fillStyle = "#0288d1";
  ctx.beginPath();
  ctx.ellipse(18, 16, 11, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  // Swimming golden & red koi fish silhouettes under water
  // Koi 1 (Golden-white)
  ctx.fillStyle = "#ffb300";
  ctx.beginPath();
  ctx.ellipse(14, 14, 5, 2.2, Math.PI * 0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(13, 13, 2, 2);
  // Red patch
  ctx.fillStyle = "#d32f2f";
  ctx.fillRect(15, 14, 2, 1);

  // Koi 2 (Red-orange)
  ctx.fillStyle = "#f4511e";
  ctx.beginPath();
  ctx.ellipse(22, 17, 4.5, 2, -Math.PI * 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(23, 16, 2, 1);

  // Floating green lotus pads
  ctx.fillStyle = "#43a047";
  ctx.beginPath();
  ctx.ellipse(9, 12, 3, 2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(25, 12, 3.5, 2.2, 0, 0, Math.PI * 2);
  ctx.fill();

  // Moss on stone rim
  ctx.fillStyle = "#689f38";
  ctx.fillRect(5, 18, 4, 2);
  ctx.fillRect(27, 8, 3, 2);

  // Water ripple highlight
  ctx.strokeStyle = "#e1f5fe";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(18, 14, 8, Math.PI * 0.2, Math.PI * 0.8);
  ctx.stroke();

  return c;
}

function artChrysanthemumRock() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Granite boulder
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.ellipse(14, 18, 12, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(14, 20, 10, 4, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snow cap on boulder top
  ctx.fillStyle = "#eceff1";
  ctx.beginPath();
  ctx.ellipse(14, 14, 11, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ffffff";
  ctx.beginPath();
  ctx.ellipse(13, 13, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Dark green foliage leaves in rock crevices
  ctx.fillStyle = "#2e7d32";
  ctx.fillRect(8, 12, 3, 4);
  ctx.fillRect(15, 11, 4, 4);
  ctx.fillRect(20, 13, 3, 3);

  // Blooming bright gold Snow Chrysanthemum flowers
  // Flower 1
  ctx.fillStyle = "#ffd600";
  ctx.beginPath();
  ctx.arc(10, 11, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6f00";
  ctx.fillRect(9, 10, 2, 2); // Center eye

  // Flower 2
  ctx.fillStyle = "#ffea00";
  ctx.beginPath();
  ctx.arc(17, 9, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#f57f17";
  ctx.fillRect(16, 8, 2, 2);

  // Flower 3
  ctx.fillStyle = "#ffd600";
  ctx.beginPath();
  ctx.arc(22, 12, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff6f00";
  ctx.fillRect(21, 11, 2, 2);

  return c;
}

function artRiverStone() {
  const c = mkC(28, 22), ctx = c.getContext("2d");
  // Shallow river water base
  ctx.fillStyle = "#4fc3f7";
  ctx.beginPath();
  ctx.ellipse(14, 15, 13, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Water ripple lines
  ctx.strokeStyle = "#e1f5fe";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(14, 15, 11, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();

  // Bottom flat river stone
  ctx.fillStyle = "#546e7a";
  ctx.beginPath();
  ctx.ellipse(13, 14, 10, 5, -Math.PI * 0.05, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#37474f";
  ctx.beginPath();
  ctx.ellipse(13, 15, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Top tilted river stone
  ctx.fillStyle = "#78909c";
  ctx.beginPath();
  ctx.ellipse(15, 10, 7.5, 4, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#b0bec5";
  ctx.beginPath();
  ctx.ellipse(14, 9, 5, 2.5, Math.PI * 0.08, 0, Math.PI * 2);
  ctx.fill();

  // Water moss
  ctx.fillStyle = "#33691e";
  ctx.fillRect(7, 13, 3, 2);
  ctx.fillRect(18, 12, 3, 2);

  // Tiny water foam dots
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(4, 15, 1, 1);
  ctx.fillRect(23, 14, 1, 1);

  return c;
}

function artGeodeRock() {
  const c = mkC(28, 26), ctx = c.getContext("2d");
  // Outer rough volcanic boulder crust
  ctx.fillStyle = "#424242";
  ctx.beginPath();
  ctx.ellipse(14, 15, 12, 9, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.ellipse(14, 17, 10, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Mineral rind layer
  ctx.fillStyle = "#616161";
  ctx.beginPath();
  ctx.ellipse(14, 13, 9, 6.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Crystal cavity opening (purple glowing amethyst)
  ctx.fillStyle = "#7b1fa2";
  ctx.beginPath();
  ctx.ellipse(14, 13, 6.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Brilliant crystalline amethyst spikes
  ctx.fillStyle = "#ba68c8";
  ctx.fillRect(11, 11, 2, 3);
  ctx.fillRect(15, 12, 3, 2);
  ctx.fillRect(13, 14, 2, 2);

  // Sparkling highlights inside geode
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(12, 11, 1, 1);
  ctx.fillRect(16, 12, 1, 1);
  ctx.fillRect(14, 14, 1, 1);

  // Small crystal fragments around base
  ctx.fillStyle = "#ab47bc";
  ctx.fillRect(6, 18, 2, 2);
  ctx.fillRect(20, 17, 2, 2);

  return c;
}

function artOwlTree() {
  const c = mkC(46, 54), ctx = c.getContext("2d");
  // Ancient oak trunk
  ctx.fillStyle = "#4a3525";
  ctx.fillRect(19, 26, 9, 26);
  ctx.fillStyle = "#332215";
  ctx.fillRect(16, 42, 15, 10);

  // Deep green forest canopy
  ctx.fillStyle = "#1b4d2e";
  ctx.beginPath();
  ctx.arc(23, 19, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#2d6a4f";
  ctx.beginPath();
  ctx.arc(21, 15, 16, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#40916c";
  ctx.beginPath();
  ctx.arc(24, 12, 12, 0, Math.PI * 2);
  ctx.fill();

  // Natural hollow cavity in branch
  ctx.fillStyle = "#1e140d";
  ctx.beginPath();
  ctx.ellipse(23, 30, 4.5, 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Wise owl perched in the hollow
  // Body (warm brown)
  ctx.fillStyle = "#8d6e63";
  ctx.beginPath();
  ctx.ellipse(23, 31, 3.5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Belly plumage (cream)
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.ellipse(23, 32, 2, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // Large round glowing yellow eyes
  ctx.fillStyle = "#ffd54f";
  ctx.beginPath();
  ctx.arc(21.5, 29, 1.8, 0, Math.PI * 2);
  ctx.arc(24.5, 29, 1.8, 0, Math.PI * 2);
  ctx.fill();

  // Black pupils
  ctx.fillStyle = "#212121";
  ctx.beginPath();
  ctx.arc(21.5, 29, 0.9, 0, Math.PI * 2);
  ctx.arc(24.5, 29, 0.9, 0, Math.PI * 2);
  ctx.fill();

  // Small orange beak
  ctx.fillStyle = "#ff8f00";
  ctx.fillRect(22.5, 30, 1, 1.5);

  // Moss on trunk base
  ctx.fillStyle = "#557a3e";
  ctx.fillRect(17, 46, 3, 3);
  ctx.fillRect(27, 48, 3, 2);

  return c;
}

function artFossilBed() {
  const c = mkC(30, 28), ctx = c.getContext("2d");
  // Clay / limestone cliff face
  ctx.fillStyle = "#8d6e63";
  ctx.fillRect(4, 8, 22, 18);
  ctx.fillStyle = "#6d4c41";
  ctx.fillRect(4, 20, 22, 6);

  // Layered strata bands
  ctx.fillStyle = "#a1887f";
  ctx.fillRect(4, 11, 22, 2);
  ctx.fillRect(4, 16, 22, 2);

  // Ammonite fossil spiral shell carved in rock
  ctx.fillStyle = "#d7ccc8";
  ctx.beginPath();
  ctx.arc(15, 14, 5.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#efebe9";
  ctx.beginPath();
  ctx.arc(15, 14, 3.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "#a1887f";
  ctx.beginPath();
  ctx.arc(15, 14, 2, 0, Math.PI * 2);
  ctx.fill();

  // Spiral ridges
  ctx.strokeStyle = "#8d6e63";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(15, 14, 4.5, 0, Math.PI * 1.5);
  ctx.stroke();

  // Ancient fish bone impression beside it
  ctx.fillStyle = "#eceff1";
  ctx.fillRect(7, 18, 5, 1);
  ctx.fillRect(9, 17, 1, 3);
  ctx.fillRect(11, 17, 1, 3);

  // Limestone rubble pebbles at base
  ctx.fillStyle = "#bcaaa4";
  ctx.fillRect(5, 23, 3, 2);
  ctx.fillRect(19, 22, 4, 3);
  ctx.fillRect(23, 24, 3, 2);

  // Top moss on rock
  ctx.fillStyle = "#558b2f";
  ctx.fillRect(5, 7, 20, 2);

  return c;
}
