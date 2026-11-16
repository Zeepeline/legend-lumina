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
function foamTex(sc) { // T544: tekstur buih ombak tepi pantai (Cobo #5)
  if (sc.textures.exists('shorefoam')) return;
  const [c, x] = mk(6, 2);
  x.fillStyle = 'rgba(240,248,255,0.92)'; x.fillRect(0, 0, 6, 1);
  x.fillStyle = 'rgba(180,225,255,0.5)'; x.fillRect(1, 1, 4, 1);
  sc.textures.addCanvas('shorefoam', c);
}
function isShorelineAt(M, x, y, ox, oy) {
  if (!M || M.indoor) return false;
  const R = M.river;
  if (R && Math.abs(Math.abs(y - riverY(R, x)) - R.w / 2) < 4.5 && !(x >= R.bridge[0] && x <= R.bridge[1])) return true;
  const L = typeof pondsAll === 'function' ? pondsAll(M) : null;
  if (L && L.length && typeof waterE === 'function') {
    const e = waterE(L, x, y, ox, oy);
    if (e >= 0.94 && e <= 1.05) return true;
  }
  return false;
}
Object.assign(World.prototype, {
  updFlow(dt) {
    if (G.title || (this.M && this.M.indoor) || typeof WORLD_POS === 'undefined') return;
    flowTex(this); foamTex(this);
    if (!this._flow || this._flowM !== this.M) {
      (this._flow || []).forEach(f => f.img.destroy()); this._flow = [];
      (this._shoreFoam || []).forEach(f => f.img.destroy()); this._shoreFoam = [];
      this._flowM = this.M;
    }
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
    // T544: buih ombak pasang surut tepi air (siklus 3.2 detik)
    for (let k = 0; k < 2 && this._shoreFoam.length < 32; k++) {
      const rx = cam.x + Math.random() * cam.width, ry = cam.y + Math.random() * cam.height;
      if (!isShorelineAt(this.M, rx, ry, off[0], off[1])) continue;
      const img = this.add.image(rx, ry, 'shorefoam').setDepth(-9.4e5).setAlpha(0);
      this._shoreFoam.push({ img, x: rx, y: ry, life: 3.2, t: Math.random() * 3.2 });
    }
    for (let i = this._shoreFoam.length - 1; i >= 0; i--) {
      const sf = this._shoreFoam[i]; sf.t += dt;
      if (sf.t >= sf.life) sf.t -= sf.life;
      const wave = Math.sin(sf.t / sf.life * Math.PI * 2);
      const a = wave > 0 ? wave * 0.82 : Math.max(0, 0.28 + wave * 0.28);
      sf.img.setAlpha(a).setScale(1 + Math.max(0, wave) * 0.35, 1);
      if (sf.x < cam.x - 30 || sf.x > cam.right + 30 || sf.y < cam.y - 30 || sf.y > cam.bottom + 30) {
        sf.img.destroy(); this._shoreFoam.splice(i, 1);
      }
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
