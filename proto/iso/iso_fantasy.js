'use strict';
// Sentuhan dunia fantasi kadar sedang (docs/DUNIA_FANTASI.md): Kristal Utama di akar Pohon Induk dengan sinar & batu melayang,
// kristal kecil, bunga lentera bercahaya, lentera kristal, debu cahaya teal, dan kutub "rusak": kristal retak ungu + duri di sarang serigala.
function crystalCanvas(sz, rot) {
  const prisms = [[0, 0, 1], [-.42, .1, .62], [.4, .14, .55], [-.18, .22, .4], [.2, .26, .34]];
  const W = Math.ceil(sz * 1.4), H = Math.ceil(sz * 1.25), c = mkCanvas(W, H), x = c.getContext('2d'), bx = W / 2, by = H - 2;
  const C = rot ? ['#8a8296', '#6a627a', '#4e465e', '#c49ae8'] : ['#bff4ee', '#7fe0d8', '#4fb0aa', '#f4fffd'];
  for (const [ox, oy, k] of prisms.sort((a, b) => b[2] - a[2])) {
    const w = sz * .26 * k + 3, h = sz * k, px = bx + ox * sz, py = by - oy * sz * .2;
    poly(x, [[px - w, py - 2], [px, py + w * .35], [px, py - h + w * .3], [px - w, py - h + 2]], C[0]);
    poly(x, [[px, py + w * .35], [px + w, py - 2], [px + w, py - h + 2], [px, py - h + w * .3]], C[2]);
    poly(x, [[px - w, py - h + 2], [px, py - h + w * .3], [px + w, py - h + 2], [px, py - h - w * .5]], C[3]);
    poly(x, [[px - w * .45, py - 3], [px - w * .2, py - 3], [px - w * .2, py - h * .8], [px - w * .45, py - h * .78]], C[1]);
    if (rot) { x.strokeStyle = '#c070f0'; x.lineWidth = 1; x.beginPath(); x.moveTo(px - w * .6, py - h * .2); x.lineTo(px + w * .2, py - h * .55); x.lineTo(px - w * .3, py - h * .8); x.stroke(); }
  }
  crispAlpha(c); return c;
}
function flowerCanvas(col) {
  const c = mkCanvas(7, 9), x = c.getContext('2d'); x.fillStyle = '#2f5a1a'; x.fillRect(3, 3, 1, 6); x.fillRect(1, 6, 2, 1); x.fillRect(4, 5, 2, 1);
  x.fillStyle = col; x.fillRect(2, 0, 3, 3); x.fillStyle = '#ffffff'; x.fillRect(3, 1, 1, 1); return c;
}
function thornCanvas() {
  const c = mkCanvas(12, 12), x = c.getContext('2d'); x.fillStyle = '#1e1824';
  for (const [a, b, h] of [[2, 11, 9], [6, 11, 11], [9, 11, 7]]) for (let i = 0; i < h; i++) x.fillRect(a + Math.round(Math.sin(i * .7) * .8), b - i, i < h - 2 ? 2 : 1, 1);
  x.fillStyle = '#7a4a9a'; x.fillRect(6, 4, 1, 1); x.fillRect(2, 6, 1, 1); return c;
}
function isoFantasy(sc) {
  const T = sc.textures, add = (k, c) => { if (!T.exists(k)) T.addCanvas(k, c); };
  add('cr_big', crystalCanvas(34, false)); add('cr_sm', crystalCanvas(14, false)); add('cr_rot', crystalCanvas(22, true));
  add('fl_lantern', flowerCanvas('#7fe0f0')); add('fl_gold', flowerCanvas('#ffe08a')); add('thorn', thornCanvas());
  const at = (tx, ty) => [(tx + .5) * ISO.T, (ty + .5) * ISO.T], scr = (x, y) => [isoX(x, y), isoY(x, y, zAt(x, y))];
  const glow = (sx, sy, r, col, a, depth) => {
    const g = sc.add.circle(sx, sy, r, col, a).setBlendMode('ADD').setDepth(depth);
    sc.tweens.add({ targets: g, alpha: a * .45, scale: .85, duration: rndR(1400, 2200), yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }); return g;
  };
  // Kristal Utama di akar Pohon Induk (dataran tinggi)
  const [kx, ky] = at(6.2, 8), [ksx, ksy] = scr(kx, ky);
  sc.add.image(ksx, ksy, 'cr_big').setOrigin(.5, .95).setDepth(kx + ky);
  sc.solids.push({ x: kx, y: ky, r: 12 });
  glow(ksx, ksy - 22, 30, 0x7fe0d8, .3, kx + ky + 1); glow(ksx, ksy - 22, 12, 0xe8fffb, .45, kx + ky + 2);
  const beam = sc.add.rectangle(ksx, ksy - 30, 12, 900, 0x9ff0e8, .3).setOrigin(.5, 1).setBlendMode('ADD').setDepth(9e5 - 10);
  const beam2 = sc.add.rectangle(ksx, ksy - 30, 4, 900, 0xffffff, .55).setOrigin(.5, 1).setBlendMode('ADD').setDepth(9e5 - 9);
  sc.tweens.add({ targets: [beam, beam2], alpha: '*=.55', duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  for (let i = 0; i < 7; i++) { // batu melayang mengitari kristal
    const a = i / 7 * 6.28, r = 26 + (i % 3) * 7, rock = sc.add.image(ksx + Math.cos(a) * r, ksy - 26 + Math.sin(a) * r * .45, 'gpt_verdant_rock_med')
      .setScale(.18 + (i % 3) * .08).setDepth(kx + ky + (Math.sin(a) > 0 ? 3 : -3));
    sc.tweens.add({ targets: rock, y: rock.y - 4, duration: rndR(1500, 2400), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', delay: i * 220 });
  }
  sc.crystalPos = [ksx, ksy - 20];
  // kristal kecil di tepi tebing, alun-alun & kolam
  for (const [tx, ty] of [[12, 3], [2, 12], [9, 13], [31, 15], [38, 21], [20, 28], [13, 31]]) {
    const [x, y] = at(tx, ty); if (terrainAt(tx, ty) === 'water') continue; const [sx, sy] = scr(x, y);
    sc.add.image(sx, sy, 'cr_sm').setOrigin(.5, .95).setDepth(x + y); glow(sx, sy - 8, 9, 0x7fe0d8, .2, x + y + 1); sc.solids.push({ x, y, r: 4 });
  }
  // batu melayang besar di atas tebing dataran tinggi
  for (const [tx, ty, s] of [[15, 2, .9], [2, 15, .7], [11, 6, .55]]) {
    const [x, y] = at(tx, ty), [sx, sy] = scr(x, y), r = sc.add.image(sx, sy - 34, 'gpt_verdant_rock_large').setScale(s).setDepth(x + y + 40);
    sc.add.image(sx + 4, sy, 'fx_shadow').setScale(2 * s, 1.4 * s).setDepth(-5e4).setAlpha(.6);
    sc.tweens.add({ targets: r, y: r.y - 5, duration: 2600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }
  // bunga lentera: di kebun, sekitar rumah & alun-alun (menyala lembut)
  for (let i = 0; i < 70; i++) {
    const tx = Math.floor(hash2(i, 3, 77) * IMAP.N), ty = Math.floor(hash2(i, 9, 78) * IMAP.N), k = terrainAt(tx, ty);
    const nearHome = IMAP.houses.some(h => Math.abs(tx - h.t[0] - h.t[2] / 2) < 5 && Math.abs(ty - h.t[1] - h.t[3] / 2) < 5);
    if (k !== 'grass' || !(nearHome || tx + ty < IMAP.plateauS)) continue;
    const x = (tx + hash2(i, 1, 79)) * ISO.T, y = (ty + hash2(i, 2, 80)) * ISO.T, [sx, sy] = scr(x, y), gold = hash2(i, 5, 81) < .3;
    sc.add.image(sx, sy, gold ? 'fl_gold' : 'fl_lantern').setOrigin(.5, 1).setDepth(x + y);
    glow(sx, sy - 8, 4, gold ? 0xffe08a : 0x7fe0f0, .3, x + y + 1);
  }
  // lentera kristal di tiang lampu
  for (const p of sc.props) if (p.img.texture.key === 'lampPost') glow(p.img.x + 1, p.img.y - p.img.displayHeight * .82, 7, 0x9ff0ff, .35, p.x + p.y + 2);
  // kutub rusak: kristal retak + duri + debu ungu di sarang serigala
  const [rx, ry] = at(IMAP.rot[0], IMAP.rot[1]), [rsx, rsy] = scr(rx, ry);
  sc.add.image(rsx, rsy, 'cr_rot').setOrigin(.5, .95).setDepth(rx + ry); glow(rsx, rsy - 12, 16, 0xa060d8, .18, rx + ry + 1); sc.solids.push({ x: rx, y: ry, r: 8 });
  for (let i = 0; i < 14; i++) {
    const a = hash2(i, 0, 90) * 6.28, d = 14 + hash2(i, 1, 91) * 26, x = rx + Math.cos(a) * d, y = ry + Math.sin(a) * d, [sx, sy] = scr(x, y);
    sc.add.image(sx, sy, 'thorn').setOrigin(.5, 1).setDepth(x + y).setFlipX(i % 2 === 0);
  }
  // debu cahaya teal di sekitar Kristal Utama & ungu di sarang rusak
  sc.add.particles(ksx, ksy - 20, 'fx_dot', { lifespan: 3200, frequency: 140, speedY: { min: -14, max: -5 }, speedX: { min: -6, max: 6 },
    x: { min: -40, max: 40 }, y: { min: -10, max: 20 }, scale: { min: .5, max: 1 }, tint: [0x9ff0e8, 0xe8fffb], blendMode: 'ADD',
    alpha: { start: .9, end: 0 } }).setDepth(9e5 - 8);
  sc.add.particles(rsx, rsy - 10, 'fx_dot', { lifespan: 2600, frequency: 260, speedY: { min: -10, max: -3 }, x: { min: -24, max: 24 }, y: { min: -6, max: 10 },
    scale: { min: .4, max: .8 }, tint: 0xa060d8, alpha: { start: .8, end: 0 } }).setDepth(9e5 - 8);
}
