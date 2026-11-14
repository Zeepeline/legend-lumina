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
