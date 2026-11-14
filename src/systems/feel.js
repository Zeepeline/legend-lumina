'use strict';
// Rasa bertarung (gelombang 3): ancang-ancang (#1), kombo (#2), musuh elit (#4),
// penanda bahaya (#14), animasi terkena (#89 sebagian), meteran waspada (#120), musuh menghindar (#146)
const ELITE_RATE = .06, ELITE_LOOT = ['shard', 'hipotion', 'ether'];
const DODGERS = ['fly', 'lunge', 'ghost'];
const LEVEL_WILAYAH = { village: 1, forest: 3, deepwood: 4, meadow: 5, river: 6, cave: 7, swamp: 8, snow: 10, city: 12, k1: 12, k2: 12, k3: 12, k4: 12 };
function markOver(sc, e, txt, col) {
  if (e.mk) e.mk.destroy();
  const s = e.spr, t = sc.add.text(s.x, s.y - s.displayHeight - 8, txt, { fontFamily: 'monospace', fontSize: '13px', fontStyle: 'bold', color: col, stroke: '#1a0e08', strokeThickness: 3 }).setOrigin(.5, 1).setDepth(9000);
  e.mk = t; t.setScale(.4); sc.tweens.add({ targets: t, scale: 1, duration: 120, ease: 'Back.easeOut' });
  sc.time.delayedCall(650, () => { if (e.mk === t) e.mk = null; sc.tweens.add({ targets: t, alpha: 0, y: t.y - 6, duration: 200, onComplete: () => t.destroy() }); });
}
function dangerEdge(side) {
  const id = 'dg_' + side; let d = document.getElementById(id);
  if (!d) { d = document.createElement('div'); d.id = id; d.className = 'danger ' + side; UI.appendChild(d); }
  d.classList.remove('on'); void d.offsetWidth; d.classList.add('on');
}
Object.assign(World.prototype, {
  makeElite(e) {
    e.elite = true; e.hp = e.max = Math.round(e.max * 2.2 * 1.25);
    const affixes = ['fast', 'tough', 'fire', 'swarm'];
    e.affix = affixes[Math.floor(Math.random() * affixes.length)];
    const afName = { fast: 'Cepat', tough: 'Keras', fire: 'Membara', swarm: 'Beranak' }[e.affix];
    e.affixName = afName;
    const afAtk = e.D.atk || 5, afDef = Math.round((e.D.def || 0) * 1.25), afSpd = e.D.spd || 50;
    const newDef = e.affix === 'tough' ? Math.round(afDef * 1.5) + 2 : afDef;
    const newSpd = e.affix === 'fast' ? Math.round(afSpd * 1.3) : afSpd;
    const newFx = e.affix === 'fire' ? 'burn' : e.D.fx;
    e.D = Object.assign({}, e.D, {
      atk: Math.round(afAtk * 1.3), def: newDef, spd: newSpd, fx: newFx,
      exp: (e.D.exp || 10) * 3, gold: (e.D.gold || [1, 2]).map(g => g * 3),
      name: `${e.D.name || ''} Elit [${afName}]`
    });
    if (e.type === 'wolf' && this.textures.exists('wolf_elite_hd')) {
      e.D.tex = 'wolf_elite_hd'; e.sc = 0.52;
      e.spr.setTexture('wolf_elite_hd'); e.spr.play('wolf_elite_hd_idle', true);
    } else e.sc *= 1.15;
    e.spr.setScale(e.sc); e.eT = 3;
    const auraCol = e.affix === 'fire' ? 0xff4a20 : e.affix === 'fast' ? 0x4ae8ff : e.affix === 'tough' ? 0xa0a0a0 : 0x88e040;
    e.aura = this.add.ellipse(e.spr.x, e.spr.y, 26 * e.sc, 10 * e.sc, auraCol, .35).setDepth(e.spr.y - 1);
    this.tweens.add({ targets: e.aura, alpha: .1, scaleX: 1.3, scaleY: 1.3, duration: 600, yoyo: true, repeat: -1 });
  },
  // dipanggil tiap frame sesudah updEnemy
  updFeel(e, dt, locked) {
    const s = e.spr; if (locked || e.hp <= 0) return;
    if (e.mk) e.mk.setPosition(s.x, s.y - s.displayHeight - 8 - (e.D.fly ? 10 : 0));
    if (e.aura) e.aura.setPosition(s.x, s.y).setDepth(s.y - 1);
    if (e.boss) return;
    const pl = this.pl, d = Math.hypot(pl.x - s.x, pl.y - s.y);
    // musuh penyergap di semak (T311)
    if (e.ambushing) {
      s.setVelocity(0);
      if (d < 60 && !pl.dead) {
        e.ambushing = false; e.spr.setAlpha(1);
        if (e.sh) e.sh.setAlpha(0.22);
        markOver(this, e, '!', '#ff3a3a');
        sfxAt('jump', s.x, s.y, this); this.puff(s.x, s.y);
        e.alert = 2; e.st = 'chase';
      }
      return;
    }
    // status elite mengamuk saat temannya tumbang (T310)
    if (e.elite && (e.enrageT || 0) > 0) {
      e.enrageT -= dt;
      e.spdM = (e.spdM || 1) * 1.25;
      if (e.cd > 0) e.cd -= dt * 0.25;
      if (e.flash <= 0) s.setTint(Math.sin(this.t * 12) > 0 ? 0xff5555 : 0xffa07a);
      if (e.enrageT <= 0) s.clearTint();
    }
    // penetapan peran kelompok bila >= 3 musuh mengejar Arka (T298)
    this.roleT = (this.roleT || 0) - dt;
    if (this.roleT <= 0) {
      this.roleT = 1;
      const aggros = (this.enemies || []).filter(o => o.hp > 0 && !o.boss && (o.alert === 2 || o.packAggro));
      if (aggros.length >= 3) {
        const ranged = aggros.filter(o => o.D.ai === 'shoot' || o.D.ai === 'shaman');
        const melees = aggros.filter(o => o.D.ai !== 'shoot' && o.D.ai !== 'shaman')
          .sort((a, b) => Math.hypot(pl.x - a.spr.x, pl.y - a.spr.y) - Math.hypot(pl.x - b.spr.x, pl.y - b.spr.y));
        ranged.forEach(o => { o.role = 'belakang'; });
        if (melees[0]) melees[0].role = 'depan';
        for (let i = 1; i < melees.length; i++) melees[i].role = 'pengapit';
      } else {
        aggros.forEach(o => { o.role = null; });
      }
    }
    // penyesuaian navigasi berdasarkan peran
    if (e.role === 'pengapit' && e.st === 'chase' && !['wind', 'swind', 'lunge', 'charge'].includes(e.st)) {
      const idx = (this.enemies || []).indexOf(e);
      const flankSide = (idx % 2 === 0 ? 1 : -1) * 1.35;
      const baseAng = Math.atan2(pl.y - s.y, pl.x - s.x) + flankSide;
      s.setVelocity(Math.cos(baseAng) * e.D.spd * 0.9, Math.sin(baseAng) * e.D.spd * 0.9);
      if (s.body?.velocity.x) s.flipX = s.body.velocity.x > 0;
    }
    // meteran waspada: ? saat curiga, ! saat mengejar
    if (!e.alert && d < 165 && d >= 120) { e.alert = 1; markOver(this, e, '?', '#fff3c0'); }
    else if (e.alert !== 2 && d < 120 && !pl.dead) { e.alert = 2; markOver(this, e, '!', '#ff5a3a'); sfx('jump'); }
    else if (e.alert && d > 230) e.alert = 0;
    // ancang-ancang: tanda ! + kedip setiap kali musuh mulai bersiap menyerang
    const wind = ['wind', 'swind', 'cwind', 'throw'].includes(e.st);
    if (wind && !e.wasWind) { markOver(this, e, '!', '#ffd84a'); this.tweens.add({ targets: s, scaleX: e.sc * 1.12, duration: 80, yoyo: true, repeat: 1 }); }
    e.wasWind = wind;
    if (e.D.ai === 'shoot' && e.alert === 2 && e.shootT < .35 && !e.shootWarn) { e.shootWarn = 1; markOver(this, e, '!', '#ffd84a'); }
    if (e.shootT > .5) e.shootWarn = 0;
    // pola tambahan musuh elit: lingkaran peluru
    if (e.elite && e.alert === 2) { e.eT -= dt; if (e.eT <= .5 && !e.eW) { e.eW = 1; markOver(this, e, '!!', '#ffd84a'); } if (e.eT <= 0) { e.eT = rnd(3.5, 5); e.eW = 0; this.eShoot(e, 'seed', [0, 1, 2, 3, 4, 5, 6, 7].map(i => i * Math.PI / 4), Math.round(e.D.atk * .7), true); } }
    // musuh cerdas mengelak saat Arka mulai mengayunkan senjata di depannya (T299)
    const isSmart = e.type === 'goblin' || e.type === 'bounty_wolf' || (e.elite && (e.type === 'wolf' || e.type === 'wolfs')) || e.type === 'goblin_chief';
    if (e.swingDodgeCd > 0) e.swingDodgeCd -= dt;
    if (isSmart && (e.swingDodgeCd || 0) <= 0 && pl.swingT != null && (this.t - pl.swingT < .08) && d <= 42) {
      e.swingDodgeCd = 2.0;
      if (Math.random() < .25) {
        const side = Math.random() < .5 ? 1 : -1;
        const nx = -(pl.y - s.y) / d, ny = (pl.x - s.x) / d;
        e.kb = .14; e.kbx = (nx * side * 130) - ((pl.x - s.x) / d * 70); e.kby = (ny * side * 130) - ((pl.y - s.y) / d * 70);
        popWorld(s.x, s.y - 20, 'Elak!', 'xp'); this.puff(s.x, s.y);
      }
    }
    // musuh gesit menghindar dari bola api/panah
    if (DODGERS.includes(e.D.ai) && (e.dodgeCd = (e.dodgeCd || 0) - dt) <= 0) {
      for (const p of this.shots) {
        if (!p.mine) continue; const rx = s.x - p.gx, ry = s.y - p.gy, ahead = (rx * p.vx + ry * p.vy) / Math.hypot(p.vx, p.vy);
        if (ahead > 0 && ahead < 55 && Math.abs(rx * p.vy - ry * p.vx) / Math.hypot(p.vx, p.vy) < 14) {
          e.dodgeCd = 2.5; if (Math.random() < .45) { const n = Math.hypot(p.vx, p.vy), side = Math.random() < .5 ? 1 : -1; e.kb = .16; e.kbx = -p.vy / n * 190 * side; e.kby = p.vx / n * 190 * side; popWorld(s.x, s.y - 22, 'menghindar!', 'xp'); this.puff(s.x, s.y); }
          break;
        }
      }
    }
  },
  // penanda bahaya: serangan dari luar layar
  dangerFrom(sx, sy) {
    const v = this.cameras.main.worldView; if (v.contains(sx, sy)) return;
    const pl = this.pl, dx = sx - pl.x, dy = sy - pl.y;
    dangerEdge(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'bottom' : 'top'));
  },
  // animasi terkena pukul pada Arka
  hurtAnim() { const pl = this.pl; this.tweens.add({ targets: pl, scaleX: 1.15, scaleY: .85, duration: 70, yoyo: true }); },
  // garis pandang (Line of Sight) menembus rintangan padat (T303)
  hasLineOfSight(x1, y1, x2, y2) {
    if (!this.walls || !this.walls.children) return true;
    const dx = x2 - x1, dy = y2 - y1, dist = Math.hypot(dx, dy);
    const steps = Math.floor(dist / 14), walls = this.walls.children.entries;
    for (let i = 1; i < steps; i++) {
      const px = x1 + (dx / dist) * (i * 14), py = y1 + (dy / dist) * (i * 14);
      for (const w of walls) {
        if (!w.body) continue;
        const b = w.body;
        if (px >= b.x && px <= b.x + b.width && py >= b.y && py <= b.y + b.height) return false;
      }
    }
    return true;
  },
});
// Penyesuaian ketangguhan musuh sesuai wilayah & level Arka (T307) serta penyergapan (T311)
const _spawnEnemy = World.prototype.spawnEnemy;
World.prototype.spawnEnemy = function (type, x, y, opt) {
  const e = _spawnEnemy.call(this, type, x, y);
  if (e && !e.boss && typeof S !== 'undefined' && S.lv) {
    const areaLv = LEVEL_WILAYAH[this.M?.id] || 4;
    const diffLv = Math.max(0, S.lv - areaLv);
    const k = Math.min(1.4, 1 + 0.06 * diffLv);
    if (k > 1) {
      e.hp = Math.round(e.hp * k);
      e.max = Math.round(e.max * k);
      e.D = Object.assign({}, e.D, { hp: e.hp, def: Math.round((e.D.def || 0) * k) });
    }
  }
  if (e && opt && opt.ambush) {
    e.ambush = true; e.ambushing = true;
    e.spr.setAlpha(0.15); if (e.sh) e.sh.setAlpha(0.06);
  }
  return e;
};
// Elite mengamuk saat kawan biasa tumbang di dekatnya (T310)
const _killEnemy = World.prototype.killEnemy;
World.prototype.killEnemy = function (e) {
  const x = e.spr?.x, y = e.spr?.y;
  _killEnemy.call(this, e);
  if (x != null && y != null && this.enemies) {
    for (const o of this.enemies) {
      if (o !== e && o.elite && !o.boss && o.hp > 0 && Math.hypot(o.spr.x - x, o.spr.y - y) < 150) {
        o.enrageT = 6.0;
        popWorld(o.spr.x, o.spr.y - 24, 'MENGAMUK!', 'crit');
        sfxAt('roar', o.spr.x, o.spr.y, this);
        markOver(this, o, '!!', '#ff3a3a');
      }
    }
  }
};
