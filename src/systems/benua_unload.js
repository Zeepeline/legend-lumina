'use strict';
// Mode benua: buang petak objek yang jauh dari Arka (memori). Mencatat semua yang dibuat spawnObj per petak lalu menghancurkannya.
const UNLOAD_FAR = 1700, UNLOAD_EVERY = 1.5; // px dari Arka; detik antar-pemeriksaan
{
  const W = World.prototype, spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    if (!this.M || !this.M.benua || !Array.isArray(o)) return spawn0.apply(this, arguments);
    const ch = this.children.list.length, wl = this.walls.getChildren().length, it = this.inter.length, li = this.lights.length, fa = this.fades.length;
    const r = spawn0.apply(this, arguments);
    const k = Math.floor(o[1] / OBJ_CELL) + ',' + Math.floor(o[2] / OBJ_CELL), rec = (this.cellRec = this.cellRec || new Map());
    if (!rec.has(k)) rec.set(k, { objs: [], walls: [], inter: [], lights: [], fades: [] });
    const R = rec.get(k);
    R.objs.push(...this.children.list.slice(ch)); R.walls.push(...this.walls.getChildren().slice(wl));
    R.inter.push(...this.inter.slice(it)); R.lights.push(...this.lights.slice(li)); R.fades.push(...this.fades.slice(fa));
    return r;
  };
}

Object.assign(World.prototype, {
  unloadFar(dt) {
    if (!this.cellRec || (this.unT = (this.unT || 0) - dt) > 0) return;
    this.unT = UNLOAD_EVERY;
    const px = this.pl.x, py = this.pl.y, C = OBJ_CELL;
    for (const [k, R] of this.cellRec) {
      const [i, j] = k.split(',').map(Number);
      if (Math.hypot((i + .5) * C - px, (j + .5) * C - py) < UNLOAD_FAR) continue;
      const gone = new Set([...R.objs, ...R.walls]);
      for (const o of gone) if (o && o.active) o.destroy();
      const drop = a => { const s = new Set(a); return x => !s.has(x); };
      this.inter = this.inter.filter(drop(R.inter));
      this.lights = this.lights.filter(drop(R.lights));
      this.fades = this.fades.filter(drop(R.fades));
      if (this.cullL) this.cullL = this.cullL.filter(c => !gone.has(c.o));
      this.cellRec.delete(k);
      if (this.objCells) this.objCells.delete(k);
    }
  }
});

{
  const W = World.prototype, up0 = W.update;
  W.update = function (t, dl) {
    up0.call(this, t, dl);
    if (this.M && this.M.benua && this.pl && !this.passive) {
      this.unloadFar(Math.min(dl, 100) / 1000);
    }
  };
}
