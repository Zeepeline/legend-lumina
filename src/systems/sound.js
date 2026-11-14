'use strict';
// Suara gelombang 4: lagu per wilayah (#86), musik dinamis (#87), desa malam (#911),
// suara jauh-dekat (#919), langkah kaki sesuai tanah (#88)
Object.assign(TRACKS, {
  // salju: pelan, dingin, banyak ruang kosong
  snow: { bpm: 76, loop: true, v: [
    { s: 'B4:2 F#5:1 E5:1 D5:2 R:1 A4:1 B4:2 D5:1 E5:1 F#5:4 G5:2 F#5:1 E5:1 D5:2 R:1 B4:1 A4:2 F#4:1 A4:1 B4:4', type: 'triangle', vol: .7 },
    { s: 'B2:4 G2:4 D3:4 A2:4 B2:4 G2:4 A2:4 F#2:4', type: 'sine', vol: .9 }] },
  // rawa: berat, mengambang, nada miring
  swamp: { bpm: 70, loop: true, v: [
    { s: 'D4:1.5 F4:0.5 G#4:2 A4:1 G#4:1 F4:2 D4:2 R:2 C#4:1 D4:1 F4:1.5 E4:0.5 D4:4 R:2', type: 'triangle', vol: .7 },
    { s: 'D2:3 D2:1 C#2:4 D2:3 D2:1 A1:4 D2:3 D2:1 C#2:4 A#1:4 A1:4', type: 'sawtooth', vol: .25 }] },
  // kota: ramai, cepat, terang
  city: { bpm: 132, loop: true, v: [
    { s: 'C5:0.5 E5:0.5 G5:1 A5:0.5 G5:0.5 E5:1 F5:0.5 E5:0.5 D5:1 G4:1 C5:0.5 D5:0.5 E5:1 G5:1 C6:2 A5:0.5 G5:0.5 F5:1 E5:0.5 D5:0.5 C5:1 D5:1 E5:1 C5:2', type: 'square', vol: .28 },
    { s: 'C3:1 G3:1 C3:1 G3:1 F2:1 C3:1 G2:1 D3:1 C3:1 G3:1 E3:1 G3:1 F2:1 C3:1 G2:1 C3:1', type: 'triangle', vol: .9 }] },
  // hutan: sunyi dan sedikit mencekam
  forest: { bpm: 88, loop: true, v: [
    { s: 'A4:2 C5:1 B4:1 G#4:2 E4:2 A4:1 B4:1 C5:1 D5:1 E5:3 R:1 F5:1 E5:1 D5:1 C5:1 B4:2 G#4:2 A4:4', type: 'triangle', vol: .75 },
    { s: 'A2:4 F2:4 E2:4 E2:4 A2:4 D2:4 E2:4 A2:4', type: 'triangle', vol: .8 }] },
  // desa malam: versi lembut lagu desa
  townN: { bpm: 80, loop: true, v: [
    { s: 'E5:2 D5:1 C5:1 D5:2 G4:2 C5:3 D5:1 E5:4 F5:2 E5:1 D5:1 C5:2 A4:2 B4:3 C5:1 D5:4', type: 'sine', vol: .8 },
    { s: 'C3:4 A2:4 F2:4 G2:4 C3:4 A2:4 F2:4 G2:4', type: 'sine', vol: .8 }] },
  // pertarungan biasa
  battle: { bpm: 150, loop: true, v: [
    { s: 'A4:0.5 A4:0.5 C5:0.5 A4:0.5 D5:0.5 A4:0.5 E5:1 D5:0.5 C5:0.5 B4:0.5 G4:0.5 A4:2 A4:0.5 A4:0.5 C5:0.5 A4:0.5 E5:0.5 A4:0.5 G5:1 F5:0.5 E5:0.5 D5:0.5 B4:0.5 E5:2', type: 'square', vol: .3 },
    { s: 'A2:0.5 A3:0.5 A2:0.5 A3:0.5 F2:0.5 F3:0.5 F2:0.5 F3:0.5 G2:0.5 G3:0.5 G2:0.5 G3:0.5 E2:0.5 E3:0.5 E2:0.5 E3:0.5 A2:0.5 A3:0.5 A2:0.5 A3:0.5 F2:0.5 F3:0.5 F2:0.5 F3:0.5 G2:0.5 G3:0.5 E2:0.5 E3:0.5 E2:1 E2:1', type: 'triangle', vol: .9 }] },
});
for (const k of ['snow', 'swamp', 'city', 'forest', 'townN', 'battle']) TRACKS[k].v.forEach(v => v.n = parseSeq(v.s));

// lagu dasar sesuai peta & waktu
function bgmFor(M) {
  if (!M) return null; const id = M.id, night = typeof isNight === 'function' && isNight();
  let b = M.bgm;
  if (id === 'snow') b = 'snow'; else if (id === 'swamp') b = 'swamp';
  else if (id === 'forest' || id === 'deepwood') b = 'forest';
  else if (/^k/.test(id) && M.bgm === 'town') b = 'city';
  if (night && (b === 'town' || b === 'city') && !M.indoor) b = 'townN';
  return b;
}
// pergantian lagu dengan memudar
function swapBGM(name, fadeSec = 1) {
  if (AU.cur === name) return;
  if (!AU.ctx) return playBGM(name);
  const g = AU.music.gain, v = .09 * OPT.mus / 3, t = AU.ctx.currentTime;
  const fo = Math.min(.5, fadeSec * .5), fi = Math.max(.5, fadeSec * .5);
  g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + fo);
  setTimeout(() => {
    playBGM(name); if (!AU.ctx) return;
    const t2 = AU.ctx.currentTime; g.cancelScheduledValues(t2); g.setValueAtTime(0, t2); g.linearRampToValueAtTime(v, t2 + fi);
  }, Math.round(fo * 1000));
}
// suara berjarak + arah kiri/kanan
function sfxAt(n, x, y, sc) {
  sc = sc || (window.__game && window.__game.sc); if (!AU.ctx || !sc || !sc.pl) return sfx(n);
  const dx = x - sc.pl.x, d = Math.hypot(dx, y - sc.pl.y), k = Math.max(0, 1 - d / 420); if (k <= .03) return;
  const g = AU.ctx.createGain(); g.gain.value = .25 + .75 * k * k;
  let out = g; if (AU.ctx.createStereoPanner) { const p = AU.ctx.createStereoPanner(); p.pan.value = clamp(dx / 260, -.8, .8); g.connect(p); out = p; }
  out.connect(AU.sfx); _sfxDest = g; try { sfx(n); } finally { _sfxDest = null; }
  setTimeout(() => { try { out.disconnect(); g.disconnect(); } catch (_) { } }, 1500);
}
// bunyi langkah per jenis tanah
let _stepLeft = false;
function stepSound(kind) {
  if (!AU.ctx || !OPT.steps) return;
  const t = AU.ctx.currentTime, D = AU.sfx;
  _stepLeft = !_stepLeft;
  const pMul = 1 + (Math.random() * 0.12 - 0.06);
  const vMul = _stepLeft ? 0.92 : 1.05;
  switch (kind) {
    case 'snow': noise(t, .07, 2600 * pMul, .22 * vMul, 1400 * pMul); break;
    case 'stone': noise(t, .025, 2200 * pMul, .18 * vMul); tone(180 * pMul, t, .02, 'square', .05 * vMul, D); break;
    case 'wood': tone(140 * pMul, t, .04, 'triangle', .35 * vMul, D); noise(t, .02, 700 * pMul, .1 * vMul); break;
    case 'water': noise(t, .09, 900 * pMul, .25 * vMul, 2400 * pMul); break;
    case 'dirt': noise(t, .04, 600 * pMul, .2 * vMul); break;
    default: noise(t, .05, 1500 * pMul, .14 * vMul, 900 * pMul); // rumput
  }
}
function segD(px, py, x1, y1, x2, y2) { const vx = x2 - x1, vy = y2 - y1, l = vx * vx + vy * vy || 1, u = clamp(((px - x1) * vx + (py - y1) * vy) / l, 0, 1); return Math.hypot(px - x1 - vx * u, py - y1 - vy * u); }
Object.assign(World.prototype, {
  groundAt(x, y) {
    const M = this.M;
    if (M.indoor || M.ground === 'room') return 'wood';
    for (const [px, py, rx, ry] of M.ponds || []) if (((x - px) / (rx + 6)) ** 2 + ((y - py) / (ry + 4)) ** 2 < 1) return 'water';
    const onPath = (M.paths || []).some(([x1, y1, x2, y2, w]) => segD(x, y, x1, y1, x2, y2) < (w || 12) * .7);
    if (M.ground === 'snow') return 'snow';
    if (M.ground === 'cave') return 'stone';
    if (onPath) return M.ground === 'village' ? 'stone' : 'dirt';
    return M.ground === 'village' ? 'stone' : 'grass';
  },
  updSound(dt) {
    if (G.title) return; const pl = this.pl;
    // langkah
    const v = pl.body ? Math.hypot(pl.body.velocity.x, pl.body.velocity.y) : 0;
    if (v > 20 && !pl.dead && !G.lock) { this.stepT = (this.stepT || 0) - dt * (v / 90); if (this.stepT <= 0) { this.stepT = .36; stepSound(this.groundAt(pl.x, pl.y)); } } else this.stepT = .1;
    // musik dinamis
    this.bgmT = (this.bgmT || 0) - dt; if (this.bgmT > 0) return; this.bgmT = .5;
    if (this.bossOn || this.trans || pl.dead || AU.cur === 'victory' || AU.cur === 'lose' || this.weather === 'rain') return;
    if (!OPT.dynMus) return;
    const fight = this.enemies.some(e => e.hp > 0 && !e.boss && e.alert === 2 && Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) < 180);
    if (fight) this.calmT = 4; else this.calmT = (this.calmT || 0) - .5;
    const want = this.calmT > 0 ? 'battle' : bgmFor(this.M);
    if (want && want !== AU.cur) swapBGM(want, 1);
  },
});
