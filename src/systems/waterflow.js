'use strict';
// Animasi air mengalir: garis riak terang tipis bergerak searah aliran sungai (hulu → hilir = urutan elips `ponds`,
// sungai berliku `river` = ke timur). Di danau: riak pelan bergeser. Hanya di sekitar layar, maks ±70 garis.
const FLOW_MAX = 70;
// arah aliran di titik global (gx, gy): { x, y, v } atau null bila bukan air (tepi air juga null agar riak tidak menempel batu)
function waterFlowAt(gx, gy) {
  for (const id in WORLD_POS) {
    const M = MAPS[id]; if (!M || M.indoor || GROUND[M.ground] && GROUND[M.ground].ice) continue;
    const [ox, oy] = WORLD_POS[id], x = gx - ox, y = gy - oy;
    if (x < 0 || y < 0 || x > M.w || y > M.h) continue;
    const R = M.river;
    if (R && Math.abs(y - riverY(R, x)) < R.w / 2 - 5 && !(x >= R.bridge[0] && x <= R.bridge[1])) {
      const dy = (riverY(R, x + 6) - riverY(R, x - 6)) / 12, n = Math.hypot(1, dy); return { x: 1 / n, y: dy / n, v: 34 };
    }
    const L = pondsAll(M); if (!L.length || waterE(L, x, y, ox, oy) > .8) return null;
    const B = pondsBase(M); let bi = -1, bd = 1e9;
    for (let i = 0; i < B.length; i++) { const d = Math.hypot((x - B[i][0]) / B[i][2], (y - B[i][1]) / B[i][3]); if (d < bd) { bd = d; bi = i; } }
    const P = B[bi], a = B[bi - 1], b = B[bi + 1], ok = q => q && Math.min(q[2], q[3]) <= 92 && Math.hypot(q[0] - P[0], q[1] - P[1]) < 130;
    if (!P || Math.min(P[2], P[3]) > 92 || (!ok(a) && !ok(b))) return { x: .9, y: .3, v: 5 };   // danau: riak pelan
    const f = ok(b) ? b : P, s = ok(a) ? a : P, dx = f[0] - s[0], dy = f[1] - s[1], n = Math.hypot(dx, dy) || 1;
    return { x: dx / n, y: dy / n, v: 30 };
  }
  return null;
}
function flowTex(sc) {
  if (sc.textures.exists('flowln')) return;
  const [c, x] = mk(9, 2);
  for (let i = 0; i < 9; i++) { const a = Math.sin(i / 8 * Math.PI); x.fillStyle = `rgba(226,242,255,${(a * .95).toFixed(2)})`; x.fillRect(i, 0, 1, 1); }
  x.fillStyle = 'rgba(40,94,172,.55)'; x.fillRect(2, 1, 5, 1);   // bayangan riak
  sc.textures.addCanvas('flowln', c);
}
Object.assign(World.prototype, {
  updFlow(dt) {
    if (G.title || (this.M && this.M.indoor) || typeof WORLD_POS === 'undefined') return;
    flowTex(this);
    if (!this._flow || this._flowM !== this.M) { (this._flow || []).forEach(f => f.img.destroy()); this._flow = []; this._flowM = this.M; }
    const cam = this.cameras.main.worldView, off = this.M.benua ? [0, 0] : (WORLD_POS[this.M.id] || [0, 0]);
    for (let k = 0; k < 3 && this._flow.length < FLOW_MAX; k++) {
      const x = cam.x + Math.random() * cam.width, y = cam.y + Math.random() * cam.height, d = waterFlowAt(x + off[0], y + off[1]);
      if (!d) continue;
      const img = this.add.image(x, y, 'flowln').setDepth(-9.5e5).setAlpha(0).setRotation(Math.atan2(d.y, d.x));
      if (d.v < 10) img.setScale(.8, 1);
      this._flow.push({ img, d, t: 0, life: 1.4 + Math.random() * 1.4, sp: d.v * (.75 + Math.random() * .5), chk: 0 });
    }
    for (let i = this._flow.length - 1; i >= 0; i--) {
      const f = this._flow[i]; f.t += dt; f.chk += dt;
      f.img.x += f.d.x * f.sp * dt; f.img.y += f.d.y * f.sp * dt; f.img.setAlpha(Math.sin(Math.min(1, f.t / f.life) * Math.PI) * .8);
      let dead = f.t >= f.life;
      if (!dead && f.chk > .3) { f.chk = 0; const d = waterFlowAt(f.img.x + off[0], f.img.y + off[1]); if (!d) dead = true; else { f.d = d; f.img.setRotation(Math.atan2(d.y, d.x)); } }
      if (dead) { f.img.destroy(); this._flow.splice(i, 1); }
    }
  }
});
const _updFlow0 = World.prototype.update;
World.prototype.update = function (time, dms) {
  const r = _updFlow0.call(this, time, dms);
  if (!this.passive && this.dt) { try { this.updFlow(this.dt); } catch (e) { /* animasi air tidak boleh menghentikan game */ } }
  if (!this.passive && this === G.scene && this.dt) { try { this.updAtmos(this.dt); } catch (e) { /* suasana tidak boleh menghentikan game */ } }
  if (!this.passive && this === G.scene) { const wet = this.weather === 'rain' && !(this.M && this.M.indoor) && !G.title; rainSound(wet); setWeatherDuck(wet ? .7 : 1); }
  return r;
};
