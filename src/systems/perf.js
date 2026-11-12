'use strict';
// Gelombang A (performa): culling objek di luar layar, entitas jauh "tidur", pengecekan berkala.
// Diukur dengan tests/perf.spec.js (PERF=1). Fondasi untuk dunia mulus (chunk streaming).
const CULL_PAD = 96, SLEEP_ENEMY = 520, SLEEP_NPC = 560, SLEEP_CRIT = 480;
Object.assign(World.prototype, {
  // kumpulkan objek diam (pohon, semak, rumah, properti) setelah peta selesai dibangun
  initCull() {
    this.cullL = []; this.cullAt = null;
    const skip = new Set([this.pl, this.pl && this.pl.sh, this.sword]);
    for (const o of this.npcs) { skip.add(o.spr); if (o.sh) skip.add(o.sh); }
    for (const e of this.enemies) { skip.add(e.spr); skip.add(e.sh); }
    for (const c of this.critters || []) { skip.add(c.s || c.spr); if (c.sh) skip.add(c.sh); }
    for (const o of this.children.list) {
      if (skip.has(o) || o.body || !(o.type === 'Image' || o.type === 'Sprite') || o.scrollFactorX !== 1) continue;
      if (o.displayWidth > 420 || o.displayHeight > 420) continue; // tanah & lapisan besar
      this.cullL.push({ o, x: o.x, y: o.y, r: Math.max(o.displayWidth, o.displayHeight) + CULL_PAD });
      // sprite diam tanpa animasi tidak perlu diproses tiap frame
      if (o.type === 'Sprite' && !(o.anims && o.anims.isPlaying)) this.sys.updateList.remove(o);
    }
    this.cullN = this.cullL.length;
  },
  updCull() {
    const L = this.cullL; if (!L || !L.length) return; const cam = this.cameras.main, v = cam.worldView;
    if (this.cullAt && Math.abs(this.cullAt[0] - v.x) < 24 && Math.abs(this.cullAt[1] - v.y) < 24 && this.cullAt[2]-- > 0) return;
    this.cullAt = [v.x, v.y, 6];
    const id = cam.id; let hidden = 0;
    for (let i = L.length - 1; i >= 0; i--) {
      const c = L[i], o = c.o;
      if (!o.active) { L.splice(i, 1); continue; }
      if (o.x !== c.x || o.y !== c.y) { o.cameraFilter = 0; L.splice(i, 1); continue; } // ternyata bergerak: jangan di-cull
      const out = c.x < v.x - c.r || c.x > v.right + c.r || c.y < v.y - c.r || c.y > v.bottom + c.r;
      o.cameraFilter = out ? id : 0; if (out) hidden++;
    }
    this.cullHidden = hidden;
  },
});
// musuh jauh tidur
const _updEnemyP = World.prototype.updEnemy;
World.prototype.updEnemy = function (e, dt, locked) {
  const pl = this.pl; if (!e.boss && pl && Math.abs(e.spr.x - pl.x) + Math.abs(e.spr.y - pl.y) > SLEEP_ENEMY * 1.3 && Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) > SLEEP_ENEMY) { if (!e.zz) { e.zz = 1; e.spr.setVelocity(0); } return; }
  e.zz = 0; return _updEnemyP.call(this, e, dt, locked);
};
const _updFeelP = World.prototype.updFeel;
World.prototype.updFeel = function (e, dt, locked) { if (e.zz) return; return _updFeelP.call(this, e, dt, locked); };
// NPC jauh: tetap menjalani rutinitas, tapi hanya 4× per detik (dt dikumpulkan)
const _updNpcP = World.prototype.updNpc;
World.prototype.updNpc = function (o, dt, locked) {
  const pl = this.pl, s = o.spr; if (!pl || locked) return _updNpcP.call(this, o, dt, locked);
  if (Math.hypot(s.x - pl.x, s.y - pl.y) > SLEEP_NPC) { o.zzT = (o.zzT || 0) + dt; if (o.zzT < .25) return; const d = Math.min(o.zzT, .5); o.zzT = 0; return _updNpcP.call(this, o, d, locked); }
  o.zzT = 0; return _updNpcP.call(this, o, dt, locked);
};
const _updCritP = World.prototype.updCritter;
World.prototype.updCritter = function (c, dt) { const s = c.s || c.spr, pl = this.pl; if (s && pl && Math.hypot(s.x - pl.x, s.y - pl.y) > SLEEP_CRIT) return; return _updCritP.call(this, c, dt); };
// ikon interaksi: 10× per detik cukup
const _updHintP = World.prototype.updInteractHint;
World.prototype.updInteractHint = function () { this.hintT = (this.hintT || 0) - (this.dt || .016); if (this.hintT > 0) return; this.hintT = .1; return _updHintP.call(this); };
