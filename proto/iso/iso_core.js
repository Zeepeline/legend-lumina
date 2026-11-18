'use strict';
// Prototipe isometrik (cabang iso-proto). Logika dunia tetap kartesius (px "dunia", 1 ubin = 16), tampilan diproyeksikan 2:1:
//   layarX = x - y,  layarY = (x + y) / 2 - z * ZH.   Kedalaman gambar = x + y (+ tinggi).
// Kontrol relatif layar (joystick ke kanan = jalan ke kanan layar), dipetakan balik ke kartesius.
const ISO = { T: 16, ZH: 26, VH: 270 };
function isoX(x, y) { return x - y; }
function isoY(x, y, z = 0) { return (x + y) / 2 - z * ISO.ZH; }
// arah layar (sx, sy) → arah dunia (dx, dy) ternormalisasi
function scr2world(sx, sy) { const dx = sy + sx / 2, dy = sy - sx / 2, n = Math.hypot(dx, dy) || 1; return [dx / n, dy / n]; }
// arah dunia → arah layar
function world2scr(dx, dy) { return [dx - dy, (dx + dy) / 2]; }
const clampN = (v, a, b) => Math.max(a, Math.min(b, v));
const rndR = (a, b) => a + Math.random() * (b - a);
function hash2(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 2147483647) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

// ── masukan: keyboard + joystick & tombol sentuh ──
const IN = { mx: 0, my: 0, atk: false, roll: false, _atkQ: 0, _rollQ: 0 };
function isoInput(sc) {
  const K = sc.input.keyboard.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,J,K,SPACE,SHIFT');
  sc.input.keyboard.on('keydown-J', () => IN._atkQ = .2); sc.input.keyboard.on('keydown-SPACE', () => IN._atkQ = .2);
  sc.input.keyboard.on('keydown-K', () => IN._rollQ = .2); sc.input.keyboard.on('keydown-SHIFT', () => IN._rollQ = .2);
  sc.input.addPointer(2);
  const ui = sc.ui, W = () => sc.scale.width, H = () => sc.scale.height;
  const JR = 58; /* kontrol besar untuk HP (permintaan pemilik) */
  const base = ui.add.circle(0, 0, JR, 0xffffff, .12).setStrokeStyle(3, 0xffffff, .4);
  const knob = ui.add.circle(0, 0, 26, 0xffffff, .4);
  const rest = () => { base.setPosition(JR + 30, H() - JR - 26).setAlpha(.55); knob.setPosition(base.x, base.y).setAlpha(.55); };
  const btn = (k, col, r) => {
    const c = ui.add.circle(0, 0, r, col, .28).setStrokeStyle(2, 0xffffff, .5);
    const t = ui.add.text(0, 0, k, { fontFamily: 'monospace', fontSize: '12px', color: '#fff', stroke: '#1a140a', strokeThickness: 3 }).setOrigin(.5);
    return { c, t, r };
  };
  const bA = btn('SERANG', 0xd2643c, 42), bR = btn('GULING', 0x3c8cd2, 31);
  const place = () => {
    bA.c.setPosition(W() - 62, H() - 66); bA.t.setPosition(W() - 62, H() - 66);
    bR.c.setPosition(W() - 150, H() - 40); bR.t.setPosition(W() - 150, H() - 40); if (joyId < 0) rest();
  };
  let joyId = -1, jx = 0, jy = 0;
  place(); sc.scale.on('resize', place);
  const hitB = (b, p) => Math.hypot(p.x - b.c.x, p.y - b.c.y) < b.r + 12;
  ui.input.on('pointerdown', p => {
    if (hitB(bA, p)) { IN._atkQ = .2; bA.c.setFillStyle(0xd2643c, .6); return; }
    if (hitB(bR, p)) { IN._rollQ = .2; bR.c.setFillStyle(0x3c8cd2, .6); return; }
    if (p.x < W() * .5 && joyId < 0) { joyId = p.id; jx = p.x; jy = p.y; base.setPosition(jx, jy).setAlpha(1); knob.setPosition(jx, jy).setAlpha(1); }
  });
  ui.input.on('pointermove', p => {
    if (p.id !== joyId) return; let dx = p.x - jx, dy = p.y - jy; const d = Math.hypot(dx, dy), m = JR - 10;
    if (d > m) { dx = dx / d * m; dy = dy / d * m; } knob.setPosition(jx + dx, jy + dy); IN.jsx = dx / m; IN.jsy = dy / m;
  });
  const up = p => {
    bA.c.setFillStyle(0xd2643c, .28); bR.c.setFillStyle(0x3c8cd2, .28);
    if (p.id === joyId) { joyId = -1; IN.jsx = IN.jsy = 0; rest(); }
  };
  ui.input.on('pointerup', up); ui.input.on('pointerupoutside', up);
  IN.poll = dt => {
    let sx = (K.D.isDown || K.RIGHT.isDown ? 1 : 0) - (K.A.isDown || K.LEFT.isDown ? 1 : 0);
    let sy = (K.S.isDown || K.DOWN.isDown ? 1 : 0) - (K.W.isDown || K.UP.isDown ? 1 : 0);
    if (IN.jsx || IN.jsy) { sx = IN.jsx; sy = IN.jsy; }
    const m = Math.hypot(sx, sy); IN.mx = m > .2 ? sx / Math.max(1, m) : 0; IN.my = m > .2 ? sy / Math.max(1, m) : 0;
    IN.atk = IN._atkQ > 0; IN.roll = IN._rollQ > 0; IN._atkQ -= dt; IN._rollQ -= dt;
  };
  IN.eat = k => { IN['_' + k + 'Q'] = 0; IN[k] = false; };
}
