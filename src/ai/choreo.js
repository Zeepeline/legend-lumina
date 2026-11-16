'use strict';
// Gelombang 17 (T518–T527): Koreografi Musuh, Bos & Taktik Pertemuan ala Dimraeth
// T518 (Combo Chain), T519 (Delayed Telegraph), T520 (Poise Bar & Runtuh), T521 (Ranged Hop),
// T522 (Backswing), T523 (Pack Command & Shield Wall), T524 (Hazard Zones), T525 (Phase 2 Overdrive),
// T526 (Gold/Red Glint), T527 (Flawless Boss Bonus & Slow-Mo Finisher)

(() => {
  const W = World.prototype;

  // T526: Kilat tanda serang (Emas = bisa ditangkis, Merah = tak tertangkis)
  function spawnGlint(sc, e, unparriable) {
    const s = e.spr; if (!s || !s.active) return;
    const gx = s.x + (s.flipX ? -8 : 8), gy = s.y - (s.displayHeight || 20) * 0.65;
    const g = sc.add.graphics().setDepth(s.y + 8), col = unparriable ? 0xff2a2a : 0xffdf5a, o = { sc: 0.3, a: 1 };
    sc.tweens.add({
      targets: o, sc: unparriable ? 1.35 : 1.05, a: 0, duration: unparriable ? 420 : 280, ease: 'Quad.easeOut',
      onUpdate: () => {
        if (!g.active) return; g.clear();
        const cx = s.active ? s.x + (s.flipX ? -8 : 8) : gx, cy = s.active ? s.y - (s.displayHeight || 20) * 0.65 : gy, r = 10 * o.sc;
        g.lineStyle(unparriable ? 2.5 : 2, col, o.a);
        g.lineBetween(cx - r, cy, cx + r, cy); g.lineBetween(cx, cy - r, cx, cy + r);
        if (unparriable) { const d = r * 0.7; g.lineBetween(cx - d, cy - d, cx + d, cy + d); g.lineBetween(cx - d, cy + d, cx + d, cy - d); }
      },
      onComplete: () => g.destroy()
    });
  }

  // T524: Zona Bahaya Bertahan di Tanah (Lingering Hazard Zone)
  W.spawnHazardZone = function (x, y, kind, dur = 3.2) {
    if (!this.M || this.M.indoor) return;
    if (!this._hazards) this._hazards = [];
    if (this._hazards.length >= 8) { const old = this._hazards.shift(); if (old.g && old.g.active) old.g.destroy(); }
    const g = this.add.graphics().setDepth(-8.5e5);
    const col = kind === 'fire' ? 0xff5a22 : kind === 'ice' ? 0x7ad8ff : 0x6ae04a;
    this._hazards.push({ x, y, r: 18, kind, col, t: dur, maxT: dur, tickT: 0, g });
  };

  // T520: Inisialisasi Poise pada Bos dan Musuh Elit saat spawn
  const _spawnEnemy0 = W.spawnEnemy;
  W.spawnEnemy = function (type, x, y, opt) {
    const e = _spawnEnemy0.apply(this, arguments);
    if (e && (e.boss || e.elite || e.type === 'golem' || e.type === 'golemi' || e.type === 'goblin_elite' || e.type === 'bounty_wolf')) {
      e.maxPoise = e.boss ? 100 : 45; e.poise = e.maxPoise; e.poiseRegenT = 0;
    }
    return e;
  };

  // T520 & T527: Bungkus hitEnemy untuk Poise, Eksekusi Runtuh, dan Slow-Mo Finisher Bos
  const _hitEnemy0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (!e || e.hp <= 0) return _hitEnemy0.apply(this, arguments);
    const pl = this.pl, isHeavy = this._isHeavyAttack || this._isHeavy || (pl && pl._heavy > 0), isFinisher = pl && pl.combo === 5;

    if (e._poiseBroken && e.staggerT > 0 && !this._inShots) {
      base = Math.round(base * 2.2); crit = true;
      e._poiseBroken = false; e.staggerT = 0.25; e.poise = e.maxPoise || 45;
      popWorld(e.spr.x, e.spr.y - (e.spr.displayHeight || 20) - 22, 'RUNTUH! x2.2', 'crit');
      sfx('boom'); this.hitStop(0.14, 45); this.camShake(180, 0.009);
    } else if (e.maxPoise && !this._inShots) {
      const pDmg = isHeavy ? 28 : isFinisher ? 18 : 8;
      e.poise = Math.max(0, (e.poise ?? e.maxPoise) - pDmg); e.poiseRegenT = 4.0;
      if (e.poise <= 0 && (e.staggerT || 0) <= 0) {
        e._poiseBroken = true; e.staggerT = 2.0; e.vulnT = 2.0; e.st = 'rec'; e.t = 2.0;
        e.spr.setVelocity(0); if (this.atkTok) this.atkTok.delete(e);
        popWorld(e.spr.x, e.spr.y - (e.spr.displayHeight || 20) - 18, 'TERHUYUNG!', '#ffe066');
        sfx('boom'); this.camShake(140, 0.007);
      }
    }

    const wasBossAlive = e.boss && e.hp > 0;
    const r = _hitEnemy0.call(this, e, base, crit, nx, ny);

    if (wasBossAlive && e.hp <= 0 && !this._bossFinisherPlayed) {
      this._bossFinisherPlayed = true;
      this.time.timeScale = 0.25; this.physics.world.timeScale = 0.25;
      const cam = this.cameras?.main;
      if (cam) this.tweens.add({ targets: cam, zoom: 1.12, duration: 180, yoyo: true, hold: 150, onComplete: () => { cam.zoom = 1; } });
      setTimeout(() => { if (this.time) { this.time.timeScale = 1; this.physics.world.timeScale = 1; } }, 600);
    }
    return r;
  };

  // T526 & T527: Bungkus hurtPlayer untuk Unparriable & penghitung hit Bos
  const _hurtPlayer0 = W.hurtPlayer;
  W.hurtPlayer = function (atk, sx, sy, fx) {
    const pl = this.pl;
    if (pl && sx != null && sy != null) {
      const att = (this.enemies || []).find(o => o.hp > 0 && Math.hypot(o.spr.x - sx, o.spr.y - sy) < 32);
      if (att && att.unparriable && pl.swingT != null) pl.swingT = null;
      if (att && att.delayedMult && ['lunge', 'run', 'dash', 'charge', 'slam', 'smash'].includes(att.st)) atk *= att.delayedMult;
    }
    const hp0 = S.hp, prevParries = S.parries || 0;
    const r = _hurtPlayer0.call(this, atk, sx, sy, fx);
    if (S.hp < hp0 && this.bossOn) this._bossHitsTaken = (this._bossHitsTaken || 0) + 1;
    if ((S.parries || 0) > prevParries && sx != null && sy != null) {
      const pr = (this.enemies || []).find(o => o.hp > 0 && Math.hypot(o.spr.x - sx, o.spr.y - sy) < 64);
      if (pr && pr.maxPoise) {
        pr.poise = Math.max(0, (pr.poise ?? pr.maxPoise) - 35); pr.poiseRegenT = 4.0;
        if (pr.poise <= 0) { pr._poiseBroken = true; pr.staggerT = 2.0; pr.vulnT = 2.0; pr.st = 'rec'; pr.t = 2.0; }
      }
    }
    return r;
  };

  // T527: Flawless Boss Bonus
  const _startBoss0 = W.startBoss, _bossDown0 = W.bossDown;
  if (_startBoss0) W.startBoss = function () { this._bossHitsTaken = 0; this._bossFinisherPlayed = false; return _startBoss0.apply(this, arguments); };
  if (_bossDown0) {
    W.bossDown = async function (e) {
      const flawless = (this._bossHitsTaken || 0) <= 1;
      const r = await _bossDown0.apply(this, arguments);
      if (flawless && this.pl) {
        const bonusGold = Math.round(((e.D && e.D.gold && e.D.gold[1]) || 120) * 0.5);
        S.gold += bonusGold; addItem('shard', 1); updHud();
        banner('KEMENANGAN SEMPURNA!', '+' + bonusGold + ' G & +1 Pecahan Es', true, 2200); sfx('lvl');
      }
      return r;
    };
  }

  // T524 & T525: Bungkus shockwave dan updShots untuk zona bahaya & 3 cincin Fase 2
  const _shockwave0 = W.shockwave;
  W.shockwave = function (x, y, R, atk, isSubRing) {
    const r = _shockwave0.call(this, x, y, R, atk);
    if (!isSubRing) {
      const c = (this.enemies || []).find(o => o.hp > 0 && Math.hypot(o.spr.x - x, o.spr.y - y) < 24);
      if (c && (c.type === 'golemi' || c.type === 'kryos')) this.spawnHazardZone(x, y, 'ice', 3.2);
      if (c && c.boss && c.p2) {
        this.time.delayedCall(260, () => { if (this.scene && !this.trans) this.shockwave(x, y, Math.round(R * 1.32), Math.round(atk * 0.85), true); });
        this.time.delayedCall(520, () => { if (this.scene && !this.trans) this.shockwave(x, y, Math.round(R * 1.65), Math.round(atk * 0.75), true); });
      }
    }
    return r;
  };

  const _updShots0 = W.updShots;
  W.updShots = function (dt, locked) {
    const before = (this.shots || []).filter(p => p.enemy && !p.dead);
    const r = _updShots0.call(this, dt, locked);
    for (const p of before) {
      if (p.dead && (/venom|spore|fire|ice/.test(p.kind))) {
        const hzKind = /fire/.test(p.kind) ? 'fire' : /ice/.test(p.kind) ? 'ice' : 'poison';
        this.spawnHazardZone(p.gx, p.gy, hzKind, 3.2);
      }
    }
    return r;
  };

  // Koreografi per-musuh setiap frame
  const _updEnemy0 = W.updEnemy;
  W.updEnemy = function (e, dt, locked) {
    if (!e || e.hp <= 0 || locked) return _updEnemy0.call(this, e, dt, locked);
    const s = e.spr, pl = this.pl, D = e.D;
    if (!s || !s.active || !pl || pl.dead) return _updEnemy0.call(this, e, dt, locked);

    if (e.maxPoise) {
      if (e.poiseRegenT > 0) e.poiseRegenT -= dt;
      else if (e.poise < e.maxPoise && (e.staggerT || 0) <= 0) e.poise = Math.min(e.maxPoise, e.poise + dt * 10);
    }
    if (e.staggerT > 0) {
      e.staggerT -= dt; s.setVelocity(0);
      if (e.staggerT <= 0) e._poiseBroken = false;
      return;
    }

    const dx = pl.x - s.x, dy = pl.y - s.y, d = Math.hypot(dx, dy) || 1, prevSt = e.st;

    // T521: Manuver Mundur Pemanah/Dukun
    if (e.evadeCd > 0) e.evadeCd -= dt;
    const isRanged = D.ai === 'shoot' || e.type === 'goblin_archer' || e.type === 'goblin_shaman' || D.ai === 'wboss';
    if (isRanged && d < 48 && (e.evadeCd || 0) <= 0 && !['wind', 'cast', 'tele', 'rec'].includes(e.st)) {
      e.evadeCd = 4.5;
      const awayAng = Math.atan2(s.y - pl.y, s.x - pl.x);
      let hx = Math.cos(awayAng), hy = Math.sin(awayAng);
      if (s.x + hx * 55 < 50 || s.x + hx * 55 > this.M.w - 50) hx = -hy;
      if (s.y + hy * 55 < 50 || s.y + hy * 55 > this.M.h - 50) hy = hx;
      e.kb = 0.18; e.kbx = hx * 290; e.kby = hy * 290;
      sfxAt('jump', s.x, s.y, this); this.puff(s.x, s.y); popWorld(s.x, s.y - 22, 'Lompat Mundur!', 'xp');
      this.time.delayedCall(120, () => {
        if (e.hp > 0 && s.active) this.eShoot(e, e.type === 'goblin_shaman' || D.ai === 'wboss' ? 'venom' : 'seed', [0], D.atk);
      });
      return;
    }

    // T522: Sapuan Putar Anti-Kepung
    const isBigFoe = e.boss || e.type === 'golem' || e.type === 'golemi' || e.type === 'goblin_elite';
    if (isBigFoe && d < 44) {
      const facingRight = D.ch ? (e.fd === 'side' && !s.flipX) : s.flipX;
      const plBehind = (facingRight && pl.x < s.x - 4) || (!facingRight && pl.x > s.x + 4);
      if (plBehind) {
        e._backT = (e._backT || 0) + dt;
        if (e._backT > 1.1 && (!e._sweepCd || this.t > e._sweepCd)) {
          e._backT = 0; e._sweepCd = this.t + 4.0; e.st = 'wind'; e.t = 0.28; s.setVelocity(0);
          popWorld(s.x, s.y - (s.displayHeight || 24) - 14, 'SAPUAN!', 'crit'); spawnGlint(this, e, false);
          this.time.delayedCall(280, () => {
            if (e.hp <= 0 || !s.active) return;
            s.flipX = !s.flipX; sfxAt('swing', s.x, s.y, this);
            if (this.enemyRingFx) this.enemyRingFx(s.x, s.y, 0xffd080, 1.0);
            if (Math.hypot(pl.x - s.x, pl.y - s.y) < 52) {
              this.hurtPlayer(D.atk * 1.15, s.x, s.y);
              const n = Math.hypot(pl.x - s.x, pl.y - s.y) || 1;
              pl.kb = 0.22; pl.kbx = ((pl.x - s.x) / n) * 230; pl.kby = ((pl.y - s.y) / n) * 230;
            }
            e.st = 'rec'; e.t = 0.65;
          });
          return;
        }
      } else e._backT = Math.max(0, (e._backT || 0) - dt);
    }

    // T523: Komando Serbu Kawanan
    const isCommander = e.type === 'goblin_elite' || e.type === 'goblin_shaman' || e.type === 'gchief';
    if (isCommander && d < 200) {
      e._cmdCd = (e._cmdCd || 3.5) - dt;
      if (e._cmdCd <= 0) {
        const allies = (this.enemies || []).filter(o => o !== e && o.hp > 0 && /goblin/.test(o.type) && Math.hypot(o.spr.x - s.x, o.spr.y - s.y) < 160);
        if (allies.length >= 2) {
          e._cmdCd = 7.0; popWorld(s.x, s.y - (s.displayHeight || 24) - 16, 'SERANG!', 'crit'); sfxAt('roar', s.x, s.y, this);
          allies.slice(0, 2).forEach(al => { al._packBoostT = 3.0; al.enrageT = 3.0; if (this.atkTok) this.atkTok.add(al); });
        } else e._cmdCd = 2.5;
      }
    }

    _updEnemy0.call(this, e, dt, locked);

    if (e._packBoostT > 0) { e._packBoostT -= dt; if (s.body && e.st === 'chase') s.body.velocity.scale(1.2); }
    if (e.role === 'depan' && e.st === 'chase' && d > 42 && d < 140) {
      const ra = (this.enemies || []).find(o => o !== e && o.hp > 0 &&
        (o.D.ai === 'shoot' || o.type === 'goblin_shaman') && Math.hypot(o.spr.x - s.x, o.spr.y - s.y) < 150);
      if (ra) {
        const gx = (ra.spr.x + pl.x) * 0.5, gy = (ra.spr.y + pl.y) * 0.5, gdx = gx - s.x, gdy = gy - s.y, gd = Math.hypot(gdx, gdy) || 1;
        if (gd > 12) s.setVelocity((gdx / gd) * D.spd * 0.75, (gdy / gd) * D.spd * 0.75);
      }
    }

    // T519 & T526: Variasi Ayunan Tertunda & Glint
    const isWindNow = ['wind', 'swind', 'cwind'].includes(e.st), wasWindBefore = ['wind', 'swind', 'cwind'].includes(prevSt);
    if (isWindNow && !wasWindBefore) {
      const canDelay = e.boss || e.elite || e.type === 'golem' || e.type === 'golemi' || D.ai === 'elite_brute';
      if (canDelay && !e._inComboChain && Math.random() < 0.35) {
        e.t *= 1.45; e.delayedMult = 1.3; e.unparriable = true;
        markOver(this, e, '!!', '#ff7a22'); spawnGlint(this, e, true);
      } else {
        e.delayedMult = 1;
        e.unparriable = (e.st === 'swind' || e.st === 'cwind' || (e.boss && e.p2 && Math.random() < 0.4));
        spawnGlint(this, e, e.unparriable);
      }
    }

    // T525: Bayangan ilusi Morgath Fase 2
    if (D.ai === 'wboss' && e.p2 && prevSt === 'tele' && e.st === 'rec') {
      const cx = clamp(pl.x + (s.x < pl.x ? 65 : -65), 90, this.M.w - 90), cy = clamp(pl.y + rnd(-40, 40), 90, this.M.h - 90);
      const mr = this.add.image(cx, cy, s.texture.key, s.frame.name).setOrigin(0.5, 1).setTint(0xc88aff).setAlpha(0.65).setDepth(cy);
      this.sparkle(cx, cy - 10, 'dotg', 8);
      this.time.delayedCall(320, () => {
        if (e.hp > 0 && !this.trans) this.eShoot({ spr: { x: cx, y: cy }, D }, 'venom', [Math.atan2(pl.y - cy, pl.x - cx)], Math.round(D.atk * 0.75), true);
        this.tweens.add({ targets: mr, alpha: 0, duration: 250, onComplete: () => mr.destroy() });
      });
    }

    // T518 & T501: Serangan Berantai & Jendela Hukuman
    if (['lunge', 'run', 'dash', 'charge', 'slam'].includes(prevSt) && e.st === 'rec') {
      const canChain = e.boss || e.elite || e.type === 'goblin_elite' || e.type === 'golem' || e.type === 'bounty_wolf';
      const maxChain = (e.boss && e.p2) ? 2 : 1;
      e._chainCount = e._chainCount || 0;
      if (canChain && e._chainCount < maxChain && d < 56 && Math.random() < 0.65) {
        e._chainCount++; e._inComboChain = true; e.st = 'wind'; e.t = 0.22;
        e.lx = dx / d; e.ly = dy / d; s.setVelocity(e.lx * 65, e.ly * 65); spawnGlint(this, e, false);
      } else {
        if (e._chainCount > 0) e.t = 1.1;
        e._chainCount = 0; e._inComboChain = false; e.unparriable = false; e.delayedMult = 1;
        if (d < 90) { e.vulnT = 0.95; if (this.jx) this.jx('star', s.x, s.y - (s.displayHeight || 20) - 4, 2, { tint: 0xffe88a }); }
      }
    }
    if (e.vulnT > 0) e.vulnT -= dt;
  };

  // Update per-frame untuk menggambar Poise Bar & Zona Bahaya Tanah
  const _update0 = W.update;
  W.update = function (time, dms) {
    _update0.call(this, time, dms);
    if (this.passive || G.title || !this.pl) return;
    const dt = Math.min(dms, 50) / 1000;

    if (this.bars && this.enemies) {
      for (const e of this.enemies) {
        if (e.hp <= 0 || !e.maxPoise || !e.spr?.active) continue;
        const w = e.boss ? 26 : 16, x = Math.round(e.spr.x - w / 2), y = Math.round(e.spr.y - e.spr.displayHeight - (e.D.fly ? 10 : 0));
        this.bars.fillStyle(0x1a1408, 0.85).fillRect(x - 1, y, w + 2, 2);
        this.bars.fillStyle(e._poiseBroken ? 0xff5a3a : 0xffd24a, 1).fillRect(x, y, Math.ceil(w * Math.max(0, e.poise) / e.maxPoise), 1.5);
      }
    }

    if (this._hazards && this._hazards.length) {
      const pl = this.pl;
      for (let i = this._hazards.length - 1; i >= 0; i--) {
        const hz = this._hazards[i]; hz.t -= dt;
        if (hz.t <= 0 || !hz.g.active) { if (hz.g && hz.g.active) hz.g.destroy(); this._hazards.splice(i, 1); continue; }
        const alpha = Math.min(1, hz.t / 0.8) * 0.28;
        hz.g.clear();
        hz.g.fillStyle(hz.col, alpha).fillEllipse(hz.x, hz.y, hz.r * 2, hz.r * 1.3);
        hz.g.lineStyle(1, hz.col, alpha * 1.6).strokeEllipse(hz.x, hz.y, hz.r * 2, hz.r * 1.3);
        if (!pl.dead && pl.dashT <= 0 && Math.hypot(pl.x - hz.x, (pl.y - hz.y) * 1.3) < hz.r) {
          hz.tickT += dt;
          if (hz.tickT >= 0.45) { hz.tickT = 0; this.inflict([hz.kind, 2.5, 1]); }
        } else hz.tickT = Math.max(0, hz.tickT - dt);
      }
    }
  };
})();
