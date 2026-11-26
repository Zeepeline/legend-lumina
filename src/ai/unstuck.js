'use strict';
// Aturan Lepas-Sangkut Musuh Saat Mengejar (T468) — membandingkan posisi nyata lintas frame
(() => {
  const SKIP_ST = new Set(['wind', 'swind', 'cwind', 'cast', 'rec', 'stun', 'calling', 'atk', 'frog_wind', 'walk_wind']);
  const _origUpdEnemy = World.prototype.updEnemy;
  World.prototype.updEnemy = function (e, dt, locked) {
    if (!e || e.hp <= 0 || !e.spr || !e.spr.active) {
      return _origUpdEnemy.apply(this, arguments);
    }

    _origUpdEnemy.apply(this, arguments);

    const s = e.spr, pl = this.pl;
    if (!s.active || !s.body || e.hp <= 0 || locked || dt <= 0) {
      e._stuckT = 0;
      if (s && s.active) { e._lastX = s.x; e._lastY = s.y; }
      return;
    }

    const cantMove = e.boss || e.sleeping || e.ambushing || e.staggerT > 0 ||
      (e.hurtT || 0) > 0 || (e.kb || 0) > 0 || (e.calmT || 0) > 0 || SKIP_ST.has(e.st);
    const dx = pl ? pl.x - s.x : 0, dy = pl ? pl.y - s.y : 0, d = Math.hypot(dx, dy) || 1;
    const isChasing = !cantMove && pl && !pl.dead && d >= 36 && d <= 260;

    if (!isChasing) {
      e._stuckT = 0; e._unstuckT = 0;
      e._lastX = s.x; e._lastY = s.y;
      return;
    }

    if (e._unstuckT > 0) {
      e._unstuckT -= dt;
      const spd = (e.D && e.D.spd) || 45, side = e._unstuckSide || 1;
      const perpX = (-dy / d) * side, perpY = (dx / d) * side;
      s.setVelocity(perpX * spd * 0.9, perpY * spd * 0.9);
      if (typeof setEnemyFlipX === 'function') setEnemyFlipX(this, e, s.body.velocity.x);
      e._lastX = s.x; e._lastY = s.y;
      return;
    }

    const vMag = Math.hypot(s.body.velocity.x, s.body.velocity.y);
    const moved = e._lastX != null ? Math.hypot(s.x - e._lastX, s.y - e._lastY) : 999;
    e._lastX = s.x; e._lastY = s.y;

    if (vMag <= 12) {
      e._stuckT = 0;
      return;
    }

    if (moved < Math.max(0.4, vMag * dt * 0.18)) {
      e._stuckT = (e._stuckT || 0) + dt;
      if (e._stuckT >= 0.45) {
        e._stuckT = 0;
        e._unstuckT = 0.45;
        const pLx = -dy / d, pLy = dx / d;
        const losR = !this.hasLineOfSight || this.hasLineOfSight(s.x, s.y, s.x + pLx * 36, s.y + pLy * 36);
        const losL = !this.hasLineOfSight || this.hasLineOfSight(s.x, s.y, s.x - pLx * 36, s.y - pLy * 36);
        if (losR && !losL) e._unstuckSide = 1;
        else if (losL && !losR) e._unstuckSide = -1;
        else e._unstuckSide = e._unstuckSide === 1 ? -1 : 1;
      }
    } else {
      e._stuckT = Math.max(0, (e._stuckT || 0) - dt * 0.6);
    }
  };
})();
