'use strict';
// Sprite monster dari lembar GPT pemilik (assets/img/monsters/mon_<key>.png, strip 2 frame).
// Tekstur lama (slime, wolf, …) digambar ULANG di kanvasnya sendiri (ukuran sama) agar animasi <key>_mv tetap sah.
// Kunci baru g_<id> = musuh khusus/boss yang dulu meminjam sprite monster lain → tekstur & animasi baru, ENEMY[id].tex diganti.
const GPT_MON = ['slime', 'slimeb', 'slimer', 'slimei', 'slimep', 'slimef', 'snake', 'boar', 'frog', 'salam',
  'bat', 'batc', 'bee', 'wisp', 'shroom', 'plant', 'squeen', 'ghost', 'golem', 'golemi'];
const GPT_MON_NEW = ['gold_slime', 'gsnake', 'golemk', 'kryos', 'bounty_frog', 'bounty_gargoyle', 'king_slime'];
IMG_LIST.push(...GPT_MON.map(k => 'mon_' + k), ...GPT_MON_NEW.map(id => 'mon_g_' + id));
function applyGptMonsters(sc) {
  const T = sc.textures, A = sc.anims;
  for (const k of GPT_MON) {
    const img = IMGEL['mon_' + k]; if (!img || !T.exists(k)) continue;
    const t = T.get(k), cv = t.getSourceImage();
    if (!cv.getContext || cv.width !== img.width || cv.height !== img.height) continue; // ukuran beda → biarkan sprite lama
    const x = cv.getContext('2d'); x.clearRect(0, 0, cv.width, cv.height); x.drawImage(img, 0, 0);
    if (t.refresh) t.refresh();
  }
  for (const id of GPT_MON_NEW) {
    const img = IMGEL['mon_g_' + id], D = ENEMY[id]; if (!img || !D) continue;
    const key = 'g_' + id, fw = img.width / 2;
    if (!T.exists(key)) { const t = T.addImage(key, img); t.add(0, 0, 0, 0, fw, img.height); t.add(1, 0, fw, 0, fw, img.height); }
    if (!A.exists(key + '_mv')) A.create({ key: key + '_mv', frames: [{ key, frame: 0 }, { key, frame: 1 }], frameRate: 5, repeat: -1 });
    D.tex = key;
  }
  const hd = IMGEL.mon_slime_hd;
  if (hd) {
    const regSlimeSet = (key, srcImg) => {
      if (!T.exists(key)) sc.textures.addSpriteSheet(key, srcImg, { frameWidth: 100, frameHeight: 100 });
      const regA = (k, st, ed, fps, r) => {
        if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers(key, { start: st, end: ed }), frameRate: fps, repeat: r });
      };
      regA(key + '_idle', 0, 5, 7, -1);
      regA(key + '_hop', 7, 13, 11, -1);
      regA(key + '_atk', 14, 20, 11, 0);
      regA(key + '_hurt', 21, 23, 10, 0);
      regA(key + '_die', 28, 34, 9, 0);
      regA(key + '_mv', 7, 13, 11, -1);
    };
    const recolorSlime = (fn) => {
      const cv = document.createElement('canvas'); cv.width = hd.width; cv.height = hd.height;
      const ctx = cv.getContext('2d'); ctx.drawImage(hd, 0, 0);
      const idata = ctx.getImageData(0, 0, cv.width, cv.height), d = idata.data;
      for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 0) fn(d, i);
      ctx.putImageData(idata, 0, 0); return cv;
    };
    regSlimeSet('slime_hd', hd);
    const c = (r, g, b) => [Math.min(255, r), Math.min(255, g), Math.min(255, b)];
    const variants = [
      ['slime_hd_red', 'slimer', 0.48, (d, i) => {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        [d[i], d[i + 1], d[i + 2]] = c(Math.round(b * .96), Math.round(r * .5 + g * .22), Math.round(r * .55 + g * .28));
      }],
      ['slime_hd_ice', 'slimei', 0.50, (d, i) => {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        [d[i], d[i + 1], d[i + 2]] = c(Math.round(b * .55 + r * .45), Math.round(b * .92 + g * .12), b + 15);
      }],
      ['slime_hd_poison', 'slimep', 0.52, (d, i) => {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        [d[i], d[i + 1], d[i + 2]] = c(Math.round(g * .55 + r * .35), Math.round(b * .95), Math.round(r * .45 + g * .3));
      }],
      ['slime_hd_fire', 'slimef', 0.52, (d, i) => {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        [d[i], d[i + 1], d[i + 2]] = c(b + 10, Math.round(b * .52 + g * .35), Math.round(r * .55));
      }],
      ['slime_hd_gold', 'gold_slime', 0.48, (d, i) => {
        const [r, g, b] = [d[i], d[i + 1], d[i + 2]];
        [d[i], d[i + 1], d[i + 2]] = c(b + 12, Math.round(b * .84 + g * .14), Math.round(r * .65 + g * .15));
      }]
    ];
    for (const [k, ename, scVal, fn] of variants) {
      regSlimeSet(k, recolorSlime(fn));
      if (ENEMY[ename]) { ENEMY[ename].tex = k; ENEMY[ename].scale = scVal; delete ENEMY[ename].keepTint; }
    }
    if (ENEMY.slime) { ENEMY.slime.tex = 'slime_hd'; ENEMY.slime.scale = 0.46; }
    if (ENEMY.slimeb) { ENEMY.slimeb.tex = 'slime_hd'; ENEMY.slimeb.scale = 0.52; }
    if (ENEMY.king_slime) { ENEMY.king_slime.tex = 'slime_hd'; ENEMY.king_slime.scale = 0.95; }
  }
  const whd = IMGEL.mon_wolf_hd;
  if (whd) {
    if (!T.exists('wolf_hd')) sc.textures.addSpriteSheet('wolf_hd', whd, { frameWidth: 128, frameHeight: 96 });
    const regW = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('wolf_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regW('wolf_hd_idle', 0, 6, 8, -1);
    regW('wolf_hd_walk', 7, 13, 10, -1);
    regW('wolf_hd_run', 14, 20, 12, -1);
    regW('wolf_hd_bite', 21, 25, 11, 0);
    regW('wolf_hd_pounce', 28, 32, 11, 0);
    regW('wolf_hd_hurt', 35, 39, 10, 0);
    regW('wolf_hd_die', 42, 45, 8, 0);
    regW('wolf_hd_howl', 49, 54, 9, 0);
    regW('wolf_hd_mv', 7, 13, 10, -1);
    if (ENEMY.wolf) { ENEMY.wolf.tex = 'wolf_hd'; ENEMY.wolf.scale = 0.44; }
    // serigala salju & Taring Perak memakai Forest Wolf (strip 2 frame lama dihapus), dibedakan warna tetap
    if (ENEMY.wolfs) Object.assign(ENEMY.wolfs, { tex: 'wolf_hd', scale: 0.46, keepTint: 0xd4eaff });
    if (ENEMY.bounty_wolf) Object.assign(ENEMY.bounty_wolf, { tex: 'wolf_hd', scale: 0.6, keepTint: 0xc8c8dc });
  }
  const wehd = IMGEL.mon_wolf_elite_hd;
  if (wehd) {
    if (!T.exists('wolf_elite_hd')) sc.textures.addSpriteSheet('wolf_elite_hd', wehd, { frameWidth: 168, frameHeight: 116 });
    const regWE = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('wolf_elite_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regWE('wolf_elite_hd_idle', 0, 6, 8, -1);
    regWE('wolf_elite_hd_walk', 7, 13, 10, -1);
    regWE('wolf_elite_hd_run', 14, 19, 12, -1);
    regWE('wolf_elite_hd_bite', 21, 25, 11, 0);
    regWE('wolf_elite_hd_pounce', 28, 31, 10, 0);
    regWE('wolf_elite_hd_hurt', 35, 39, 10, 0);
    regWE('wolf_elite_hd_die', 42, 46, 8, 0);
    regWE('wolf_elite_hd_howl', 49, 52, 8, 0);
    regWE('wolf_elite_hd_mv', 7, 13, 10, -1);
    if (ENEMY.bounty_wolf) { ENEMY.bounty_wolf.tex = 'wolf_elite_hd'; ENEMY.bounty_wolf.scale = 0.56; }
  }
  const ghd = IMGEL.mon_goblin_hd;
  if (ghd) {
    if (!T.exists('goblin_hd')) sc.textures.addSpriteSheet('goblin_hd', ghd, { frameWidth: 120, frameHeight: 84 });
    const regG = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regG('goblin_hd_idle', 0, 9, 8, -1);
    regG('goblin_hd_walk', 10, 19, 10, -1);
    regG('goblin_hd_run', 20, 29, 12, -1);
    regG('goblin_hd_bite', 30, 33, 10, 0);
    regG('goblin_hd_slash', 40, 45, 11, 0);
    regG('goblin_hd_hurt', 50, 55, 10, 0);
    regG('goblin_hd_die', 60, 64, 8, 0);
    regG('goblin_hd_mv', 10, 19, 10, -1);
    if (ENEMY.goblin) { ENEMY.goblin.tex = 'goblin_hd'; ENEMY.goblin.scale = 0.46; delete ENEMY.goblin.ch; }
  }
  const gahd = IMGEL.mon_goblin_archer_hd;
  if (gahd) {
    if (!T.exists('goblin_archer_hd')) sc.textures.addSpriteSheet('goblin_archer_hd', gahd, { frameWidth: 120, frameHeight: 84 });
    const regGA = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_archer_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regGA('goblin_archer_hd_idle', 0, 7, 8, -1);
    regGA('goblin_archer_hd_walk', 8, 15, 9, -1);
    regGA('goblin_archer_hd_run', 16, 24, 11, -1);
    regGA('goblin_archer_hd_shoot', 25, 29, 9, 0);
    regGA('goblin_archer_hd_rain', 30, 34, 9, 0);
    regGA('goblin_archer_hd_melee', 35, 40, 9, 0);
    regGA('goblin_archer_hd_hurt', 41, 45, 8, 0);
    regGA('goblin_archer_hd_die', 46, 50, 8, 0);
    regGA('goblin_archer_hd_mv', 8, 15, 9, -1);
    if (ENEMY.goblin_archer) {
      ENEMY.goblin_archer.tex = 'goblin_archer_hd';
      ENEMY.goblin_archer.scale = 0.46;
      delete ENEMY.goblin_archer.ch;
    }
  }
  const gehd = IMGEL.mon_goblin_elite;
  if (gehd) {
    if (!T.exists('goblin_elite')) sc.textures.addSpriteSheet('goblin_elite', gehd, { frameWidth: 100, frameHeight: 84 });
    const regGE = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_elite', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regGE('goblin_elite_idle', 0, 6, 8, -1);
    regGE('goblin_elite_walk', 8, 14, 9, -1);
    regGE('goblin_elite_run', 16, 22, 11, -1);
    regGE('goblin_elite_smash', 24, 28, 10, 0);
    regGE('goblin_elite_sweep', 29, 31, 9, 0);
    regGE('goblin_elite_charge', 32, 35, 11, -1);
    regGE('goblin_elite_hurt', 36, 38, 10, 0);
    regGE('goblin_elite_die', 40, 42, 7, 0);
    regGE('goblin_elite_roar', 43, 44, 6, -1);
    regGE('goblin_elite_mv', 8, 14, 9, -1);
    if (ENEMY.goblin_elite) {
      ENEMY.goblin_elite.tex = 'goblin_elite';
      ENEMY.goblin_elite.scale = 1.0;
      delete ENEMY.goblin_elite.ch;
    }
  }
  const gsh = IMGEL.mon_goblin_shaman;
  if (gsh) {
    if (!T.exists('goblin_shaman')) sc.textures.addSpriteSheet('goblin_shaman', gsh, { frameWidth: 56, frameHeight: 48 });
    const regGS = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('goblin_shaman', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regGS('goblin_shaman_idle', 0, 7, 8, -1);
    regGS('goblin_shaman_walk', 8, 15, 9, -1);
    regGS('goblin_shaman_cast', 16, 20, 10, 0);
    regGS('goblin_shaman_hurt', 24, 26, 9, 0);
    regGS('goblin_shaman_die', 32, 34, 8, 0);
    regGS('goblin_shaman_mv', 8, 15, 9, -1);
    if (ENEMY.goblin_shaman) {
      ENEMY.goblin_shaman.tex = 'goblin_shaman';
      ENEMY.goblin_shaman.scale = 0.78;
      delete ENEMY.goblin_shaman.ch;
    }
  }
}

// warna tetap (keepTint) & animasi hurt varian slime_hd_* saat kena pukul
{ const _se = World.prototype.spawnEnemy, _he = World.prototype.hitEnemy;
  World.prototype.spawnEnemy = function () {
    const e = _se.apply(this, arguments), K = e && e.D && e.D.keepTint;
    if (K) { const s = e.spr, clr = s.clearTint; s.clearTint = function () { clr.call(this); return this.setTint(K); }; s.setTint(K); }
    return e;
  };
  World.prototype.hitEnemy = function (e) {
    const kb0 = e && e.kb, r = _he.apply(this, arguments);
    if (e && e.hp > 0 && e.kb > (kb0 || 0) && e.D?.tex?.startsWith('slime_hd_') && e.spr?.anims) {
      e.hurtT = 0.32; e.spr.play(e.D.tex + '_hurt', true);
    }
    return r;
  };
}
