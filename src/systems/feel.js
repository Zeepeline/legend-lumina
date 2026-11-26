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
    const newFx = e.affix === 'fire' ? ['burn', 3, 0.8] : e.D.fx;
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
    if (!OPT.lite && e.spr && e.spr.preFX && this.renderer?.type === Phaser.WEBGL) {
      const gCol = { fire: 0xff6b20, fast: 0x55d8ff, tough: 0xc078ff, swarm: 0x90f048 }[e.affix] || 0xc078ff;
      try { e.spr.preFX.addGlow(gCol, 3, 0, false, 0.12, 8); } catch (_) {}
    }
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
      e.spdM = 1.25;
      if (e.st === 'chase' && s.body) s.body.velocity.scale(1.25);
      if (e.cd > 0) e.cd -= dt * 0.25;
      if (e.flash <= 0) s.setTint(Math.sin(this.t * 12) > 0 ? 0xff5555 : 0xffa07a);
      if (e.enrageT <= 0) { e.spdM = 1; s.clearTint(); }
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
      if (typeof setEnemyFlipX === 'function') setEnemyFlipX(this, e, s.body?.velocity.x || 0);
    }
    // meteran waspada tersinkron dengan enemyAggroR/enemyWarnR & ekologi tidur
    const aggR0 = typeof enemyAggroR === 'function' ? enemyAggroR(this, e) : 120;
    const aggR = e.sleeping ? Math.min(aggR0, 32) : aggR0;
    const warnR = typeof enemyWarnR === 'function' ? enemyWarnR(this, e) : 165;
    if (e.calmT > 0) {
      e.calmT -= dt;
      e.alert = 0;
    } else if (!e.alert && !e.sleeping && d < warnR && d >= aggR) { e.alert = 1; markOver(this, e, '?', '#fff3c0'); }
    else if (e.alert !== 2 && d < aggR && !pl.dead) { e.sleeping = false; e.alert = 2; markOver(this, e, '!', '#ff5a3a'); sfx('jump'); }
    else if (e.alert && d > warnR + 65) e.alert = 0;
    if (e.sleeping) return;
    // ancang-ancang: tanda ! + kedip setiap kali musuh mulai bersiap menyerang
    const wind = ['wind', 'swind', 'cwind', 'throw'].includes(e.st);
    if (wind && (!e.wasWind || !e.mk)) {
      markOver(this, e, '!', '#ffd84a');
      this.tweens.add({ targets: s, scaleX: e.sc * 1.12, duration: 80, yoyo: true, repeat: 1 });
      // T550: Cincin peringatan bahaya luar layar saat musuh elit/boss bersiap menyerang (Cobo #16)
      if (e.elite || e.boss) this.dangerFrom(s.x, s.y);
    }
    e.wasWind = wind;
    // T538: Squash saat ancang-ancang & stretch saat menerjang (Cobo #12)
    const atkSt = ['atk', 'dash', 'lunge', 'run', 'swoop', 'charge'].includes(e.st);
    if (wind) {
      s.setScale(e.sc * 1.15, e.sc * 0.85);
    } else if (atkSt) {
      s.setScale(e.sc * 0.9, e.sc * 1.2);
    } else if (Math.abs(s.scaleX - e.sc) > 0.01 || Math.abs(s.scaleY - e.sc) > 0.01) {
      const curX = s.scaleX, curY = s.scaleY;
      s.setScale(
        Math.abs(curX - e.sc) < 0.02 ? e.sc : curX + (e.sc - curX) * Math.min(1, dt * 10),
        Math.abs(curY - e.sc) < 0.02 ? e.sc : curY + (e.sc - curY) * Math.min(1, dt * 10)
      );
    }
    // T501: Jendela Hukuman (vulnT = 0.9s) setelah serangan menerjang/berat meleset
    if (atkSt) {
      e._wasAtkSt = true; if (pl.inv > .85) e._atkHit = true;
    } else if (e._wasAtkSt) {
      e._wasAtkSt = false;
      if (!e._atkHit && d < 95) {
        e.vulnT = .9; markOver(this, e, '★', '#ffe88a');
        if (this.jxPostureBreak) this.jxPostureBreak(s.x, s.y - s.displayHeight * 0.5);
        else if (this.jx) this.jx('star', s.x, s.y - s.displayHeight - 4, 3, { tint: 0xffe88a });
      }
      e._atkHit = false;
    }
    if (e.vulnT > 0) e.vulnT -= dt;
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
  // penanda bahaya: serangan dari luar layar (T471)
  dangerFrom(sx, sy) {
    const v = this.cameras.main.worldView, pl = this.pl;
    const dx = sx - pl.x, dy = sy - pl.y;
    if (v && v.width > 0 && v.contains(sx, sy) && Math.hypot(dx, dy) < 180) return;
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
// Elite mengamuk saat kawan biasa tumbang (T310) & Slow-mo musuh terakhir kawanan (T295)
const _killEnemy = World.prototype.killEnemy;
World.prototype.killEnemy = function (e) {
  const x = e.spr?.x, y = e.spr?.y, pl = this.pl;
  let activeBefore = 0;
  if (pl && this.enemies) {
    activeBefore = this.enemies.filter(o => o.hp > 0 && !o.boss && Math.hypot(o.spr.x - pl.x, o.spr.y - pl.y) < 220).length;
  }
  _killEnemy.call(this, e);
  if (pl && activeBefore >= 3 && this.enemies) {
    const remain = this.enemies.filter(o => o.hp > 0 && !o.boss && Math.hypot(o.spr.x - pl.x, o.spr.y - pl.y) < 220).length;
    if (remain === 0) {
      this.time.timeScale = 0.25;
      this.physics.world.timeScale = 0.25;
      if (typeof sfx === 'function') sfx('crit');
      setTimeout(() => {
        if (this.time) { this.time.timeScale = 1; this.physics.world.timeScale = 1; }
      }, 250);
    }
  }
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
// T540: Napas halus karakter Arka saat diam (Cobo #19)
const _feelCr = World.prototype.create;
World.prototype.create = function () {
  this._xraySpr = null;
  const r = _feelCr.apply(this, arguments);
  if (!this._feelHook) {
    this._feelHook = 1;
    this.events.on('shutdown', () => { this._xraySpr = null; });
    this.events.on('postupdate', () => {
      if (!this.sys || !this.sys.isActive() || !this.add) return;
      const pl = this.pl;
      if (!pl || pl.dead || !pl.body || !pl.texture) return;
      const moving = pl.body.velocity.length() > 2;
      const busy = (pl.atkT || 0) > 0 || (pl.inv || 0) > 0 || pl.isClimbing || pl.rolling;
      if (!moving && !busy) {
        pl.scaleY = 1 + Math.sin(this.t * 3.927) * 0.012;
      } else if (pl.scaleY !== 1 && !busy) {
        pl.scaleY = 1;
      }
      // Kanopi pohon sudah otomatis tembus pandang (alpha 0.55 di world.js),
      // matikan sprite siluet duplikat agar tidak tampak 2 Arka saat dash di balik pohon.
      if (this._xraySpr && this._xraySpr.scene && this._xraySpr.visible) {
        this._xraySpr.setVisible(false);
      }
      // T563: Efek Rumput & Semak Terbelah Saat Berjalan (Zelda: Minish Cap, Eastward)
      if (moving && this.bushes && this.bushes.length && !OPT.lite) {
        this._bT = (this._bT || 0) + 1;
        if (this._bT % 8 === 0) {
          for (let i = 0; i < this.bushes.length; i++) {
            const b = this.bushes[i];
            if (!b || !b.active || b._sway) continue;
            if (Math.abs(pl.x - b.x) > 24 || Math.abs(pl.y - b.y) > 24) continue;
            const dx = pl.x - b.x, dy = pl.y - (b.y - 6);
            if (dx * dx + dy * dy < 576) {
              b._sway = 1;
              const rot = pl.body.velocity.x > 0 ? 0.12 : -0.12;
              this.tweens.add({
                targets: b, scaleY: 0.8, scaleX: 1.15, rotation: rot, duration: 110, yoyo: true,
                onComplete: () => { b.scaleY = 1; b.scaleX = 1; b.rotation = 0; b._sway = 0; }
              });
              if (this.jx) this.jx('pop', b.x, b.y - 4, 1, { tint: 0x76b852 });
            }
          }
        }
      }
      // T574: Hembusan Angin Tebasan Bilah Pedang Terhadap Tanaman (Zelda: BOTW, Ghost of Tsushima)
      const isAtk = (pl._atk > 0) || (pl._heavy > 0) || ((pl.atkT || 0) > 0);
      if (isAtk) {
        if (!pl._swWind && this.bushes && this.bushes.length && !OPT.lite) {
          pl._swWind = 1;
          const facing = pl.flipX ? -1 : 1;
          for (let i = 0; i < this.bushes.length; i++) {
            const b = this.bushes[i];
            if (!b || !b.active || b._sway) continue;
            if (Math.abs(pl.x - b.x) > 40 || Math.abs(pl.y - b.y) > 40) continue;
            const dx = b.x - pl.x, dy = b.y - pl.y;
            if (dx * dx + dy * dy < 1600) {
              b._sway = 1;
              this.tweens.add({
                targets: b, scaleY: 0.72, scaleX: 1.25, rotation: facing * 0.22, duration: 90, yoyo: true,
                onComplete: () => { b.scaleY = 1; b.scaleX = 1; b.rotation = 0; b._sway = 0; }
              });
              if (this.jx) this.jx('pop', b.x, b.y - 4, 1, { tint: 0x5cb85c });
            }
          }
        }
      } else {
        pl._swWind = 0;
      }
    });
  }
  return r;
};
