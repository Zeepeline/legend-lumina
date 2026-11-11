'use strict';
// Gerak NPC & hewan
Object.assign(World.prototype, {
  updNpc(o, dt, locked) {
    const s = o.spr; s.setDepth(s.y); o.sh.setPosition(s.x, s.y - 1).setDepth(s.y - .5); if (o.mark) o.mark.y = s.y - 31 + Math.sin(this.t * 6) * 1.5;
    if (!o.n.wander || locked) {
      if (o.walking) { s.setVelocity(0); o.walking = false; this.face(o, o.dir); }
      if (!o.n.wander) { o.t -= dt; if (o.t < 0 && !locked) { o.t = rnd(2, 5); if (Math.random() < .35) this.face(o, pick(['down', 'left', 'right', o.n.dir])); } }
      return;
    }
    const near = Math.hypot(this.pl.x - s.x, this.pl.y - s.y) < 28;
    o.t -= dt;
    if (o.walking && (o.t <= 0 || near)) { o.walking = false; s.setVelocity(0); this.face(o, o.dir); o.t = rnd(1.5, 4); }
    else if (!o.walking && o.t <= 0 && !near) {
      const hx = o.home.x - s.x, hy = o.home.y - s.y; let dir;
      if (Math.hypot(hx, hy) > o.n.wander) dir = Math.abs(hx) > Math.abs(hy) ? (hx > 0 ? 'right' : 'left') : (hy > 0 ? 'down' : 'up'); else dir = pick(['up', 'down', 'left', 'right']);
      const [dx, dy] = DIRV[dir]; s.setVelocity(dx * 26, dy * 26); o.dir = dir; o.walking = true; o.t = rnd(.6, 1.4);
      s.flipX = dir === 'left'; s.play(o.ch + '_' + (dir === 'left' || dir === 'right' ? 'side' : dir));
    }
  },
  updCritter(c, dt) {
    if (c.fly) { c.ph += dt * c.sp; c.s.x = c.ax + Math.sin(c.ph * 1.3) * 60 + Math.sin(c.ph * 3.1) * 8; c.s.y = c.ay + Math.sin(c.ph * .9) * 40 + Math.cos(c.ph * 4) * 5; c.s.setDepth(c.s.y + 40); return; }
    const s = c.s; c.sh.setPosition(s.x, s.y - 1).setDepth(s.y - .5); s.setDepth(s.y);
    const d = Math.hypot(this.pl.x - s.x, this.pl.y - s.y);
    if (c.busy) return; c.t -= dt;
    if (c.t <= 0 || (d < 22 && !G.title)) {
      const flee = d < 22; let tx, ty;
      if (flee) { const n = d || 1; tx = s.x + (s.x - this.pl.x) / n * 46; ty = s.y + (s.y - this.pl.y) / n * 30; }
      else { tx = c.home.x + rnd(-46, 46); ty = c.home.y + rnd(-26, 26); }
      tx = clamp(tx, 60, this.M.w - 60); ty = clamp(ty, 130, this.M.h - 60);
      const dist = Math.hypot(tx - s.x, ty - s.y); c.busy = true; s.flipX = tx > s.x; s.play(c.key + '_mv'); s.anims.timeScale = flee ? 2.5 : 1;
      this.tweens.add({ targets: s, x: tx, y: ty, duration: dist / (flee ? 70 : 20) * 1000, onComplete: () => { c.busy = false; s.anims.stop(); s.setFrame(0); c.t = rnd(2, 5); } });
    }
  },
});
