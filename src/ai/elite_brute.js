'use strict';
// AI untuk musuh Brute Elite (Goblin Brute Elite, dsb)
Object.assign(World.prototype, {
  updEliteBrute(e, dt, dx, dy, d, aggro) {
    const s = e.spr, D = e.D, pl = this.pl;
    const isElite = D.tex === 'goblin_elite';
    e.rageT = (e.rageT || 0) - dt;
    e.skillCd = (e.skillCd || 2.5) - dt;
    if (e.st === 'smash' || e.st === 'sweep' || e.st === 'roar') {
      s.setVelocity(0);
      if (e.t <= 0) {
        e.st = 'idle';
        if (isElite && s.anims && s.anims.animationManager.exists('goblin_elite_idle')) {
          s.play('goblin_elite_idle', true);
        }
      }
      return;
    }
    if (e.st === 'charge') {
      s.setVelocity(e.cvx, e.cvy);
      if (isElite && s.anims && s.anims.animationManager.exists('goblin_elite_charge')) {
        s.play('goblin_elite_charge', true);
      }
      if (d < 34) {
        this.hurtPlayer(D.atk * 1.35, s.x, s.y);
        this.camShake(180, .007);
        sfxAt('boom', s.x, s.y, this);
        e.st = 'idle'; e.t = 0.5;
      }
      if (e.t <= 0) { e.st = 'idle'; e.t = 0.4; }
      return;
    }
    // Jurus Smash (Palu Berduri & Shockwave) atau Charge (Terjang)
    const isRel = typeof OPT !== 'undefined' && OPT.diff === 0;
    if (aggro && e.skillCd <= 0) {
      if (d < 50) {
        e.skillCd = rnd(3.2, 5.0);
        e.st = 'smash'; e.t = isRel ? rnd(0.38, 0.6) : rnd(0.35, 0.75);
        s.setVelocity(0); s.flipX = dx < 0;
        markOver(this, e, '!', '#ffd84a');
        if (isElite && s.anims && s.anims.animationManager.exists('goblin_elite_smash')) {
          s.play('goblin_elite_smash', true);
        }
        this.time.delayedCall(380, () => {
          if (e.hp <= 0) return;
          sfxAt('boom', s.x, s.y, this);
          this.camShake(240, .009);
          this.sparkle(s.x, s.y - 6, 'dotw', 16);
          if (Math.hypot(pl.x - s.x, pl.y - s.y) < 64) {
            this.hurtPlayer(D.atk * 1.5, s.x, s.y);
            popWorld(pl.x, pl.y - 20, 'HANTAMAN!', 'crit');
          }
        });
        return;
      } else if (d < 150 && Math.random() < 0.65) {
        e.skillCd = rnd(3.5, 5.5);
        e.st = 'cwind'; e.t = isRel ? rnd(0.35, 0.55) : rnd(0.35, 0.75);
        s.setVelocity(0); s.flipX = dx < 0;
        sfxAt('roar', s.x, s.y, this);
        const ang = Math.atan2(dy, dx);
        e.cvx = Math.cos(ang) * D.spd * 2.2;
        e.cvy = Math.sin(ang) * D.spd * 2.2;
        this.time.delayedCall(380, () => {
          if (e.hp <= 0) return;
          e.st = 'charge'; e.t = 0.85;
          s.flipX = e.cvx < 0;
        });
        return;
      }
    }
    if (aggro) {
      s.setVelocity((dx / d) * D.spd, (dy / d) * D.spd);
      s.flipX = dx < 0;
    } else {
      if (e.t <= 0) {
        e.t = rnd(1, 2.5);
        const a = rnd(0, 6.28);
        s.setVelocity(Math.cos(a) * D.spd * .5, Math.sin(a) * D.spd * .5);
      }
      if (Math.abs(s.body.velocity.x) > 2) s.flipX = s.body.velocity.x < 0;
    }
    if (isElite && s.anims && e.st !== 'charge') {
      const mv = Math.hypot(s.body.velocity.x, s.body.velocity.y) > 4;
      const key = mv ? (aggro ? 'goblin_elite_run' : 'goblin_elite_walk') : 'goblin_elite_idle';
      if (s.anims.animationManager.exists(key)) s.play(key, true);
    } else if (D.ch) this.charAnim(e);
  }
});

