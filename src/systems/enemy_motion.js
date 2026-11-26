'use strict';
// H10: Sistem gerakan halus, inersia kecepatan, telegrafi & kinematika bernapas seluruh monster
(() => {
  const W = World.prototype;
  const _upd = W.updEnemy;
  const _cr = W.create;
  const SNAP_ST = new Set(['lunge', 'run', 'swoop', 'atk', 'slam', 'leap', 'charge', 'frog_atk', 'walk_atk']);
  const WIND_ST = new Set(['wind', 'swind', 'cwind', 'throw', 'cast', 'ring', 'spit', 'calling', 'frog_wind', 'walk_wind']);

  function handleCustomEshAtk(sc, e, dt, pl) {
    const s = e.spr, D = e.D;
    if (!D.esh || !['hop', 'walk'].includes(D.ai) || e.fleeing || e.leash || e.frozen > 0 || e.staggerT > 0) return false;
    const dx = pl.x - s.x, dy = pl.y - s.y, d = Math.hypot(dx, dy) || 1;
    const aggro = !pl.dead && d < (e.boss ? 420 : DIFF[OPT.diff].sight);
    const windKey = D.ai === 'hop' ? 'frog_wind' : 'walk_wind';
    const atkKey = D.ai === 'hop' ? 'frog_atk' : 'walk_atk';
    const triggerR = D.ai === 'hop' ? 58 : 48;

    if (e.st === windKey) {
      e.t -= dt;
      s.setVelocity(0);
      s.flipX = dx < 0;
      if (e.t <= 0) {
        e.st = atkKey;
        e.t = D.ai === 'hop' ? .28 : .25;
        e.lx = dx / d; e.ly = dy / d;
        s.setVelocity(e.lx * D.spd * 2.35, e.ly * D.spd * 2.35);
        sfxAt('swing', s.x, s.y, sc);
        if (e.type === 'bounty_frog') sc.sparkle(s.x, s.y - 6, 'dotg', 5);
        else if (e.type === 'salam') sc.sparkle(s.x, s.y - 6, 'doto', 5);
      }
      return true;
    }
    if (e.st === atkKey) {
      e.t -= dt;
      if (e.t <= 0) {
        e.st = 'idle'; e.t = .4; e.cd = D.ai === 'hop' ? 2.1 : 1.8;
        s.setVelocity(0);
        return false;
      }
      const cy = s.y - D.r * e.sc * .6;
      if (!e.faded && Math.abs(pl.x - s.x) < D.r * e.sc + 6 && Math.abs(pl.y - 4 - cy) < D.r * e.sc + 6) {
        sc.hurtPlayer(Math.round(D.atk * 1.2), s.x, s.y, D.fx);
      }
      return true;
    }
    if (aggro && d < triggerR && (e.cd || 0) <= 0 && !WIND_ST.has(e.st) && !SNAP_ST.has(e.st)) {
      e.st = windKey;
      e.t = D.ai === 'hop' ? .36 : .32;
      e.cd = D.ai === 'hop' ? 2.2 : 1.9;
      s.setVelocity(0);
      s.flipX = dx < 0;
      return true;
    }
    return false;
  }

  W.updEnemy = function (e, dt, locked) {
    const s = e && e.spr, D = e && e.D, sc = e && e.sc;
    if (!s || !D || e.hp <= 0) return _upd.apply(this, arguments);
    if (e._preShoot > 0) e._preShoot = Math.max(0, e._preShoot - dt);
    if (e._postShoot > 0) e._postShoot = Math.max(0, e._postShoot - dt);
    const prevShootT = e.shootT || 0;

    let customDone = false;
    if (!locked && !e.kb && e.hurtT <= 0 && !(e.distracted > 0)) {
      if (this.enemyStatus && this.enemyStatus(e, dt)) return;
      customDone = handleCustomEshAtk(this, e, dt, this.pl);
    }
    if (customDone) {
      e.sh.setPosition(s.x, s.y - 1 + (D.fly ? 10 : 0)).setDepth(s.y - .5);
      s.setDepth(s.y + (D.fly ? 12 : 0));
      if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) s.clearTint(); }
      e.cd = Math.max(0, (e.cd || 0) - dt);
      e._svx = s.body ? s.body.velocity.x : 0;
      e._svy = s.body ? s.body.velocity.y : 0;
      return;
    }

    _upd.apply(this, arguments);
    if (!s.active || !s.body || e.hp <= 0) return;

    if (D.esh && ['shoot', 'turret'].includes(D.ai) && this.pl && !this.pl.dead) {
      const d = Math.hypot(this.pl.x - s.x, this.pl.y - s.y);
      const aggro = d < DIFF[OPT.diff].sight;
      if (aggro && d < 165 && e.shootT > 0 && e.shootT <= .28) e._preShoot = .28;
      if (prevShootT <= .08 && (e.shootT || 0) > 1.2) e._postShoot = .26;
    }

    const tvx = s.body.velocity.x, tvy = s.body.velocity.y;
    if (locked || e.kb > 0 || e.hurtT > 0 || SNAP_ST.has(e.st) || e.st === 'stun') {
      e._svx = tvx; e._svy = tvy;
      return;
    }
    if (e._svx == null) { e._svx = tvx; e._svy = tvy; }
    const alpha = Math.min(1, dt * (D.fly ? 7.5 : 11.5));
    e._svx += (tvx - e._svx) * alpha;
    e._svy += (tvy - e._svy) * alpha;
    if (Math.hypot(e._svx, e._svy) < 1.2 && Math.hypot(tvx, tvy) < 1.2) { e._svx = 0; e._svy = 0; }
    s.setVelocity(e._svx, e._svy);
  };

  const ELEM_AURA = {
    wisp: 0x70f8ff, salam: 0xff6e2a, slimef: 0xff8030, slimep: 0x80f058,
    slimei: 0xa4ecff, gold_slime: 0xffe466, golemi: 0x9ce4ff, kryos: 0xb0f0ff
  };

  function enemyKinematicsStep(sc, dt) {
    if (!sc.enemies || sc.passive) return;
    const t = sc.t || 0, pl = sc.pl;
    for (const e of sc.enemies) {
      const s = e && e.spr, D = e && e.D, sc0 = e.sc || 1;
      if (!s || !s.active || !D || e.hp <= 0) continue;

      const auraTint = ELEM_AURA[e.type];
      if (!OPT.lite && auraTint && sc.jx && pl && Math.hypot(pl.x - s.x, pl.y - s.y) < 220 && Math.random() < dt * 2.4) {
        sc.jx('mote', s.x, s.y - 10, 1, { tint: auraTint, rx: 7, ry: 5 });
      }

      const vx = s.body ? s.body.velocity.x : 0, vy = s.body ? s.body.velocity.y : 0;
      const spd = Math.hypot(vx, vy);
      const inWind = WIND_ST.has(e.st) || e.swoopPrep > 0 || (e._preShoot > 0);
      const inAtk = SNAP_ST.has(e.st) || e._postShoot > 0;

      if (e.flash <= 0 && e.hurtT <= 0 && !sc.tweens.isTweening(s)) {
        if (inWind) {
          const wob = Math.sin(t * 48) * .03;
          s.setScale(sc0 * (1.09 + wob), sc0 * (.91 - wob));
          s.rotation = Math.sin(t * 52) * .04;
        } else if (inAtk) {
          s.setScale(sc0 * 1.12, sc0 * .91);
          s.rotation = clamp(vx * .0009, -.08, .08);
        } else if (spd > 8) {
          const hop = Math.abs(Math.sin(t * 11 + (e.ph || 0)));
          s.setScale(sc0 * (1 - hop * .05), sc0 * (1 + hop * .05));
          s.rotation = clamp(vx * .0011, -.09, .09);
        } else {
          const br = Math.sin(t * 3.6 + (e.ph || 0));
          s.setScale(sc0 * (1 + br * .032), sc0 * (1 - br * .032));
          s.rotation *= Math.max(0, 1 - dt * 12);
        }
      }

      if (e.sh && e.sh.active) {
        const baseSh = D.scale && !D.esh ? .85 : Math.max(.45, Math.min(1.15, (D.r || 8) / 11));
        if (D.fly) {
          const hover = Math.sin(t * 5 + (e.ph || 0));
          e.sh.setScale(baseSh * (.68 - hover * .08)).setAlpha(.38 + hover * .06);
        } else if (D.ai === 'hop') {
          const inAir = e.st === 'hop' || e.st === 'frog_atk';
          e.sh.setScale(baseSh * (inAir ? .72 : 1)).setAlpha(inAir ? .45 : .75);
          if (e._wasAir && !inAir && !OPT.lite) sc.puff(s.x, s.y);
          e._wasAir = inAir;
        }
      }

      if (!OPT.lite && inAtk && spd > 95) {
        e._ghostT = (e._ghostT || 0) - dt;
        if (e._ghostT <= 0) {
          e._ghostT = .075;
          const gh = sc.add.image(s.x, s.y, s.texture.key, s.frame.name).setOrigin(.5, 1)
            .setScale(sc0).setFlipX(s.flipX).setTint(0xffa88a).setAlpha(.36).setDepth(s.y - 2);
          sc.tweens.add({ targets: gh, alpha: 0, duration: 160, onComplete: () => gh.destroy() });
        }
      }
    }
  }

  W.create = function () {
    const r = _cr.apply(this, arguments);
    if (!this._emHook) {
      this._emHook = 1;
      this.events.on('postupdate', (tm, d) => enemyKinematicsStep(this, Math.min(.1, d / 1000)));
    }
    return r;
  };
})();
