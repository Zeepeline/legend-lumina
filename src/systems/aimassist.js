'use strict';
// Sistem Aim Assist untuk Layar Sentuh / Mobile (T481)
// Mengarahkan pl.dir ke musuh hidup terdekat (< 70 px) saat SERANG ditekan tanpa lock-on.

if (typeof OPT !== 'undefined' && OPT.assist === undefined) {
  OPT.assist = true;
}

(() => {
  const _origAttack = World.prototype.attack;
  World.prototype.attack = function () {
    const isTouch = document.body.classList.contains('touch') || (Input && Input.joy && (Input.joy.x !== 0 || Input.joy.y !== 0));
    const assistOn = OPT.assist !== false;
    const lockActive = this.lockR && this.lockR.visible && this.lockE && this.lockE.hp > 0;

    if (isTouch && assistOn && !lockActive && this.pl && !this.pl.dead && !G.lock) {
      const pl = this.pl;
      let nearest = null;
      let minDist = 70;

      if (Array.isArray(this.enemies)) {
        for (const e of this.enemies) {
          if (!e || e.hp <= 0 || !e.spr || !e.spr.active) continue;
          const ex = e.spr.x;
          const ey = e.spr.y - (e.spr.displayHeight ? e.spr.displayHeight / 2 : 0);
          const d = Math.hypot(ex - pl.x, ey - pl.y);
          if (d < minDist) {
            minDist = d;
            nearest = { x: ex, y: ey };
          }
        }
      }

      if (nearest) {
        const dx = nearest.x - pl.x;
        const dy = nearest.y - pl.y;
        if (Math.abs(dx) >= Math.abs(dy)) {
          pl.dir = dx >= 0 ? 'right' : 'left';
        } else {
          pl.dir = dy >= 0 ? 'down' : 'up';
        }
      }
    }

    return _origAttack.apply(this, arguments);
  };
})();
