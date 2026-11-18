'use strict';
// Pemain (Arka) & serigala untuk prototipe isometrik. Posisi di koordinat dunia (x, y), tinggi z dari zAt().
// Prinsip rasa tempur: komitmen (ayunan mengunci gerak), langkah maju saat menebas, hit-stop tepat di frame benturan,
// musuh bereaksi dengan badan (terhuyung + terpental), ancang-ancang musuh jelas (cincin di tanah) dan hanya satu
// serigala menyerang pada satu waktu (adil & terbaca), lalu ada jeda pulih untuk dibalas.
const HERO_ROWS = { idle_down: 0, walk_down: 1, idle_up: 2, walk_up: 3, idle_side: 4, walk_side: 6, atk1_down: 7, atk2_down: 8, atk1_up: 9,
  atk2_up: 10, atk1_side: 11, atk2_side: 12, atk3_down: 13, atk3_up: 14, atk3_side: 15, roll_down: 19, roll_up: 20, roll_side: 21, hurt: 22, die: 23 };
const COMBO = [ // per pukulan: durasi kunci, frame benturan, langkah maju, damage, hit-stop, dorongan
  { t: .3, hit: .1, step: 70, dmg: 9, hs: .06, kb: 150, row: 'atk1_' },
  { t: .3, hit: .1, step: 70, dmg: 9, hs: .06, kb: 150, row: 'atk2_' },
  { t: .46, hit: .2, step: 120, dmg: 18, hs: .13, kb: 260, row: 'atk3_' },
];
function dirOf(sx, sy) { return Math.abs(sx) > Math.abs(sy) * .8 ? 'side' : sy < 0 ? 'up' : 'down'; }
function isoDirOf(sx, sy) {
  const ax = Math.abs(sx), ay = Math.abs(sy);
  if (ay > 0 && ax < ay * .45) return { row: sy < 0 ? 4 : 0, flip: false };
  if (ax > 0 && ay < ax * .45) return { row: 2, flip: sx < 0 };
  return { row: sy < 0 ? 3 : 1, flip: sx < 0 };
}

// gerak dengan tabrakan: batas peta, air, tebing (lompatan tinggi), rumah (persegi), objek (lingkaran)
function isoMove(sc, a, vx, vy, dt) {
  const tryP = (nx, ny) => {
    const R = a.rad || 5, MW = sc.MW || IMAP.N * ISO.T, MH = sc.MH || IMAP.N * ISO.T;
    const X0 = sc.MX0 || 0, Y0 = sc.MY0 || 0; /* dunia terbuka: koordinat bisa negatif (desa prototipe di titik 0) */
    if (nx < X0 + R || ny < Y0 + R || nx > MW - R || ny > MH - R) return false;
    if (sc.wallAt && sc.wallAt(nx, ny, R)) return false; /* tembok asli peta game */
    const tx = Math.floor(nx / ISO.T), ty = Math.floor(ny / ISO.T);
    if (sc.ter && sc.ter[ty] && sc.ter[ty][tx] === 'water') return false;
    if (Math.abs(zAt(nx, ny) - zAt(a.x, a.y)) > .3) return false;
    for (const h of sc.houses) if (nx > h.x - R && nx < h.x + h.w + R && ny > h.y - R && ny < h.y + h.d + R) return false;
    for (const p of sc.solids) { const d = Math.hypot(nx - p.x, ny - p.y); if (d < p.r + R && d < Math.hypot(a.x - p.x, a.y - p.y)) return false; }
    return true;
  };
  const nx = a.x + vx * dt, ny = a.y + vy * dt;
  if (tryP(nx, ny)) { a.x = nx; a.y = ny; return true; }
  if (tryP(nx, a.y)) { a.x = nx; return true; }
  if (tryP(a.x, ny)) { a.y = ny; return true; }
  return false;
}

// Lembar diam isometrik (hero_idle_iso.png) desainnya beda dengan Arka asli → tidak dipakai sampai lembar Arka 8 arah yang sama desainnya siap
const ISO_IDLE_SHEET = false;
class IsoHero {
  constructor(sc, x, y) {
    Object.assign(this, { sc, x, y, z: 0, hp: 100, max: 100, st: 'move', t: 0, combo: 0, comboWin: 0, fsx: 0, fsy: 1, kbx: 0, kby: 0, inv: 0, rad: 5 });
    this.sh = sc.add.image(0, 0, 'fx_shadow').setScale(.7);
    const key = ISO_IDLE_SHEET && sc.textures.exists('hero_iso_idle') ? 'hero_iso_idle' : 'hero';
    this.spr = sc.add.sprite(0, 0, key, 0).setOrigin(.5, .92);
  }
  face(sx, sy) { if (sx || sy) { const n = Math.hypot(sx, sy); this.fsx = sx / n; this.fsy = sy / n; } }
  frame(row, f) {
    if (row === 'idle_' && ISO_IDLE_SHEET && this.sc.textures.exists('hero_iso_idle')) {
      if (this.spr.texture.key !== 'hero_iso_idle') this.spr.setTexture('hero_iso_idle');
      const d = isoDirOf(this.fsx, this.fsy);
      this.spr.setFrame(d.row * 4 + (Math.min(3, f) || 0));
      this.spr.flipX = d.flip;
      return;
    }
    if (this.spr.texture.key !== 'hero') this.spr.setTexture('hero');
    const d = dirOf(this.fsx, this.fsy), key = HERO_ROWS[row + (row.endsWith('_') ? d : '')] ?? HERO_ROWS[row];
    this.spr.setFrame(key * 4 + Math.min(3, f)); this.spr.flipX = d === 'side' && this.fsx < 0;
  }
  update(dt) {
    const sc = this.sc; this.t += dt; this.inv -= dt; this.comboWin -= dt;
    if (this.st === 'dead') { this.frame('die', Math.floor(this.t * 5)); return; }
    if (this.st === 'hurt') {
      isoMove(sc, this, this.kbx, this.kby, dt); this.kbx *= .86; this.kby *= .86; this.frame('hurt', this.t < .12 ? 0 : 1);
      if (this.t > .28) this.st = 'move';
      return;
    }
    if (this.st === 'roll') {
      const k = Math.max(0, 1 - this.t / .34), sp = 60 + 170 * k, [dx, dy] = scr2world(this.fsx, this.fsy);
      isoMove(sc, this, dx * sp, dy * sp, dt); this.frame('roll_', Math.floor(this.t / .085));
      if (this.t % .07 < dt) sc.fxDust(this.x, this.y, this.fsx, this.fsy);
      if (this.t > .34) this.st = 'move';
      return;
    }
    if (this.st === 'atk') {
      const C = COMBO[this.combo], [dx, dy] = scr2world(this.fsx, this.fsy);
      if (this.t < C.hit) isoMove(sc, this, dx * C.step, dy * C.step, dt);
      if (!this.hitDone && this.t >= C.hit) { this.hitDone = true; sc.heroStrike(this, C); }
      this.frame(C.row, Math.floor(this.t / C.t * 4));
      if (IN.atk && this.t > C.t * .55 && this.combo < 2) { IN.eat('atk'); this.startAtk(this.combo + 1); return; }
      if (IN.roll && this.t > C.hit + .04) { IN.eat('roll'); this.startRoll(); return; }
      if (this.t >= C.t) { this.st = 'move'; this.comboWin = .28; }
      return;
    }
    // gerak bebas
    if (IN.roll) { IN.eat('roll'); this.face(IN.mx, IN.my); this.startRoll(); return; }
    if (IN.atk) { IN.eat('atk'); this.face(IN.mx, IN.my); this.startAtk(this.comboWin > 0 && this.combo < 2 ? this.combo + 1 : 0); return; }
    const m = Math.hypot(IN.mx, IN.my);
    if (m > .1) {
      this.face(IN.mx, IN.my); const [dx, dy] = scr2world(IN.mx, IN.my), sp = 78 * Math.min(1, m);
      isoMove(sc, this, dx * sp, dy * sp, dt); this.frame('walk_', Math.floor(this.t * 9) % 4);
    } else this.frame('idle_', Math.floor(this.t * 4) % 4);
  }
  startAtk(i) { this.st = 'atk'; this.t = 0; this.combo = i; this.hitDone = false; this.sc.sfx('swing', i); }
  startRoll() { this.st = 'roll'; this.t = 0; this.inv = .3; this.sc.sfx('roll'); }
  hurt(dmg, fx, fy) {
    if (this.inv > 0 || this.st === 'dead') return false;
    this.hp = Math.max(0, this.hp - dmg); this.inv = .6; const n = Math.hypot(this.x - fx, this.y - fy) || 1;
    this.kbx = (this.x - fx) / n * 190; this.kby = (this.y - fy) / n * 190; this.st = this.hp > 0 ? 'hurt' : 'dead'; this.t = 0; return true;
  }
}

let WOLF_TOKEN = null; // hanya satu serigala boleh ancang-ancang/menerjang sekaligus
class IsoWolf {
  constructor(sc, x, y) {
    Object.assign(this, { sc, x, y, z: 0, hp: 34, max: 34, st: 'idle', t: rndR(0, 1), kbx: 0, kby: 0, rad: 7, fl: 0, orb: Math.random() * 6.28 });
    this.sh = sc.add.image(0, 0, 'fx_shadow').setScale(1.2, 1);
    this.spr = sc.add.sprite(0, 0, 'wolf_hd', 0).setOrigin(.5, .86).setScale(.42);
    this.spr.play('w_idle');
  }
  play(k) { if (this.spr.anims.currentAnim?.key !== k) this.spr.play(k, true); }
  faceTo(px) { this.spr.flipX = px > isoX(this.x, this.y); }
  update(dt) {
    const sc = this.sc, P = sc.hero, dx = P.x - this.x, dy = P.y - this.y, d = Math.hypot(dx, dy) || 1; this.t += dt;
    if (this.st === 'dead') return;
    if (this.st === 'hurt') {
      isoMove(sc, this, this.kbx, this.kby, dt); this.kbx *= .85; this.kby *= .85;
      if (this.t > .38) { this.st = 'chase'; this.t = 0; this.play('w_run'); }
      return;
    }
    if (this.st === 'idle') {
      if (d < 150) { this.st = 'chase'; this.t = 0; sc.fxAlert(this); sc.sfx('growl'); this.play('w_howl'); }
      return;
    }
    if (this.st === 'chase') {
      if (this.t < .5 && this.spr.anims.currentAnim?.key === 'w_howl') return;
      const mine = WOLF_TOKEN === this || !WOLF_TOKEN || !sc.wolves.includes(WOLF_TOKEN) || WOLF_TOKEN.st === 'dead';
      // bukan giliran menyerang: mengitari pemain di jarak aman
      const want = mine ? 30 : 58; this.orb += dt * .6;
      const tx = mine ? P.x - dx / d * want : P.x + Math.cos(this.orb) * want, ty = mine ? P.y - dy / d * want : P.y + Math.sin(this.orb) * want;
      const ex = tx - this.x, ey = ty - this.y, ed = Math.hypot(ex, ey);
      if (ed > 4) { const sp = mine ? 74 : 54; isoMove(sc, this, ex / ed * sp, ey / ed * sp, dt); this.play('w_run'); } else this.play('w_idle');
      this.faceTo(isoX(P.x, P.y));
      if (mine && d < 44 && this.t > .35) { WOLF_TOKEN = this; this.st = 'wind'; this.t = 0; this.lx = P.x; this.ly = P.y; sc.fxTele(this, .6); sc.sfx('growl'); }
      return;
    }
    if (this.st === 'wind') { // ancang-ancang: merunduk, bergetar, membidik posisi pemain
      this.spr.anims.stop(); this.spr.setFrame(28); this.lx += (P.x - this.lx) * dt * 3; this.ly += (P.y - this.ly) * dt * 3;
      this.faceTo(isoX(P.x, P.y));
      if (this.t > .6) { this.st = 'lunge'; this.t = 0; const n = Math.hypot(this.lx - this.x, this.ly - this.y) || 1; this.vx = (this.lx - this.x) / n; this.vy = (this.ly - this.y) / n; this.hitP = false; this.play('w_pounce'); sc.sfx('lunge'); }
      return;
    }
    if (this.st === 'lunge') {
      const sp = 250 * Math.max(.2, 1 - this.t / .3); isoMove(sc, this, this.vx * sp, this.vy * sp, dt);
      if (this.t % .05 < dt) sc.fxDust(this.x, this.y, ...world2scr(this.vx, this.vy));
      if (!this.hitP && d < 15 && Math.abs(P.z - this.z) < .5) { this.hitP = true; if (P.hurt(14, this.x, this.y)) sc.heroHit(14); }
      if (this.t > .3) { this.st = 'rec'; this.t = 0; this.play('w_idle'); }
      return;
    }
    if (this.st === 'rec') { // jeda pulih: celah untuk membalas
      if (this.t > .75) { this.st = 'chase'; this.t = 0; if (WOLF_TOKEN === this) WOLF_TOKEN = null; }
    }
  }
  hurt(dmg, fx, fy, kb) {
    this.hp -= dmg; const n = Math.hypot(this.x - fx, this.y - fy) || 1;
    this.kbx = (this.x - fx) / n * kb; this.kby = (this.y - fy) / n * kb;
    if (WOLF_TOKEN === this) WOLF_TOKEN = null;
    if (this.hp <= 0) { this.st = 'dead'; this.t = 0; return true; }
    this.st = 'hurt'; this.t = 0; this.play('w_hurt'); return false;
  }
}
