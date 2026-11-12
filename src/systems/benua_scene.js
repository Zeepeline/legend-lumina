'use strict';
// Mode Benua di scene World: pembangunan peta gabungan, pelacakan wilayah tempat Arka berada, teleport tanpa memuat ulang.
{ // create dibungkus: wilayah luar ruang → peta benua; lalu batas fisika/kamera & fitur per wilayah
  const create0 = World.prototype.create;
  World.prototype.create = function (data) {
    data = benuaData(data || {});
    if (data.map === 'benua') buildBenua();
    create0.call(this, data);
    if (this.M.benua) this.initBenua(data);
  };
  const goto0 = World.prototype.goto;
  World.prototype.goto = function (map, x, y, dir, extra = {}) {
    if (!(this.M.benua && isOutdoorRegion(map) && !Object.keys(extra).length)) return goto0.call(this, map, x, y, dir, extra);
    const [ox, oy] = WORLD_POS[map], pl = this.pl, cam = this.cameras.main; // teleport di dalam benua: tanpa memuat ulang
    pl.setPosition(x + ox, y + oy); pl.body.reset(x + ox, y + oy); pl.dir = dir || pl.dir;
    this.cx = pl.x - VW / 2; this.cy = pl.y - 12 - VH / 2; cam.setScroll(Math.round(this.cx), Math.round(this.cy));
    S.map = map; S.x = x; S.y = y; this.regId = null; this.trans = false;
  };
}
Object.assign(World.prototype, {
  initBenua(data) {
    const M = this.M, cam = this.cameras.main, pl = this.pl;
    this.physics.world.setBounds(M.x0, M.y0, M.w, M.h);
    cam.setBounds(M.x0, M.y0, M.w, M.h); cam.setBackgroundColor('#2f4a2a');
    this.camB = { x0: M.x0, y0: M.y0, x1: M.x0 + M.w, y1: M.y0 + M.h };
    this.cx = clamp(pl.x - VW / 2, this.camB.x0, this.camB.x1 - VW); this.cy = clamp(pl.y - 12 - VH / 2, this.camB.y0, this.camB.y1 - VH);
    cam.setScroll(Math.round(this.cx), Math.round(this.cy));
    for (const r of wildRects()) this.wall(r[0], r[1], r[2] - r[0], r[3] - r[1]); // celah hutan lebat tidak bisa dimasuki
    this.wild = new Map(); this.wildT = 0; this.regId = null; this.regT = 0; this.safeXY = [pl.x, pl.y];
    for (const id of M.regions) this.withRegion(id, () => this.spawnRegionFx(id));
    this.updBenua(0, data.region);
  },
  // jalankan fn dengan this.M = salinan wilayah id berkoordinat global (agar spawnX lama menaruh benda di tempat yang benar)
  withRegion(id, fn) {
    const keep = this.M, w0 = WARPS[id]; this.M = regionClone(id);
    if (w0) WARPS[id] = shiftDeep(w0, WORLD_POS[id][0], WORLD_POS[id][1]);
    try { fn(); } catch (e) { console.warn('benua: fitur wilayah', id, e); } finally { this.M = keep; if (w0) WARPS[id] = w0; }
  },
  spawnRegionFx(id) {
    const M = this.M, P = WARPS[id]; // satu kegagalan tidak boleh menghentikan pembangunan benua
    const run = f => { try { f(); } catch (e) { console.warn('benua:', id, e); } };
    if (M.gardens) run(() => this.spawnGarden());
    if (M.torches) run(() => this.spawnTorches());
    if (P) run(() => this.spawnWarp());
    if (M.iceGate && S.stage < 12) run(() => this.spawnIceGate());
    if (M.crystal) run(() => this.spawnCrystal());
    if (M.barrier && !S.flags.seal_open) run(() => this.spawnBarrier());
    if (M.mochi && S.side.mochi === 1) run(() => this.spawnMochi());
    if (id === 'village' && S.side.mochi === 3 && !S.pet) run(() => this.spawnCritter(['cat', 586 + M._ox, 300 + M._oy, 2]));
  },
  // tiap frame (dipanggil dari updRegions): wilayah tempat Arka berada → S.map, nama, musik; hutan pengisi
  updBenua(dt, first) {
    if ((this.wildT -= dt) <= 0) { this.wildT = .4; this.updWilds(); }
    if ((this.regT -= dt) > 0 && !first) return; this.regT = .25;
    const pl = this.pl, id = first || regionAt(pl.x, pl.y); if (!id) return;
    // awal cerita: penjaga melarang masuk hutan (dulu lewat pintu tepi)
    if (S.stage === 0 && (id === 'forest' || (MAPS[id].peralihan || []).includes('forest')) && !this.bossOn) {
      pl.setPosition(this.safeXY[0], this.safeXY[1]); pl.body.reset(this.safeXY[0], this.safeXY[1]); if (!G.lock) this.guardStop(); return;
    }
    this.safeXY = [pl.x, pl.y];
    if (id === this.regId) return;
    const R = MAPS[id], was = this.regId; this.regId = id; this.R = R; S.map = id; S.seen[id] = 1;
    if (!this.bossOn && !G.title) playBGM(this.weather === 'rain' ? null : bgmFor(R));
    if (was && !G.title) { banner(R.name, id === 'village' ? 'SELAMAT DATANG DI' : 'MEMASUKI'); updHud(); }
  },
});
for (const k of ['wildCanopyTex', 'updWilds', 'makeWild']) World.prototype[k] = GroundLayer.prototype[k];
