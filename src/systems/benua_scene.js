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
const KEMBARA_POS = { // posisi lokal pedagang keliling (sama dengan posMap di scene/world.js)
  village: { x: 740, y: 460, dir: 'left' }, meadow: { x: 480, y: 360, dir: 'down' }, lake: { x: 380, y: 520, dir: 'up' },
  forest: { x: 520, y: 480, dir: 'down' }, city: { x: 420, y: 350, dir: 'right' },
};
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
    this.objCells = new Set(); this.streamObjs(99); // petak di sekitar titik masuk langsung dibuat
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
    run(() => this.spawnCh4()); run(() => this.spawnCh5()); run(() => this.initSecrets());
    if (M.ranch) run(() => this.spawnRanch());
    if (!G.title && isNight() && (id === 'forest' || id === 'meadow') && (M.paths || []).length) run(() => { // wisp malam
      for (let i = 0; i < 4; i++) {
        const P = M.paths[(i * 3 + 2) % M.paths.length];
        this.spawnEnemy('wisp', (P[0] + P[2]) / 2 + rnd(-30, 30), (P[1] + P[3]) / 2 + rnd(-20, 20));
      }
    });
    const K = KEMBARA_POS[id]; // pedagang keliling
    if (K && typeof isMerchantHere === 'function' && isMerchantHere(id)) {
      run(() => this.spawnNpc({ id: 'kembara', ch: 'hunter', name: 'Kang Kembara', x: K.x + M._ox, y: K.y + M._oy, dir: K.dir, wander: 12 }));
    }
  },
  // muat petak objek terdekat yang belum dibuat (maks `budget` petak); objek diam langsung ikut culling (perf.js)
  streamObjs(budget) {
    const M = this.M, pl = this.pl, C = OBJ_CELL, R = Math.ceil(OBJ_NEAR / C), ci = Math.floor(pl.x / C), cj = Math.floor(pl.y / C), want = [];
    for (let j = cj - R; j <= cj + R; j++) for (let i = ci - R; i <= ci + R; i++) {
      const k = i + ',' + j; if (this.objCells.has(k) || !M.cells.has(k)) continue;
      const d = Math.hypot((i + .5) * C - pl.x, (j + .5) * C - pl.y); if (d < OBJ_NEAR + C) want.push([d, k]);
    }
    want.sort((a, b) => a[0] - b[0]);
    for (const [, k] of want.slice(0, budget)) {
      this.objCells.add(k);
      for (const o of M.cells.get(k)) {
        const s = this.spawnObj(o);
        if (!this.cullL || !s || s.body || !(s.type === 'Image' || s.type === 'Sprite') || s.displayWidth > 420 || s.displayHeight > 420) continue;
        this.cullL.push({ o: s, x: s.x, y: s.y, r: Math.max(s.displayWidth, s.displayHeight) + CULL_PAD });
        if (s.type === 'Sprite' && !(s.anims && s.anims.isPlaying)) this.sys.updateList.remove(s);
      }
    }
    if (want.length) this.cullAt = null;
  },
  // suasana alam (ambient.js) dibuat ulang untuk wilayah yang sedang dimasuki; batas lebar/tinggi = tepi kanan/bawah global
  benuaAmbient(id) {
    for (const o of this.ambObjs || []) if (o.active) o.destroy();
    if (this.ambInter) this.inter = this.inter.filter(i => !this.ambInter.has(i));
    this.amb = null; this.envCfg = null;
    const before = new Set(this.children.list), interBefore = new Set(this.inter), keep = this.M, [ox, oy] = WORLD_POS[id];
    this.M = Object.assign(regionClone(id), { w: ox + MAPS[id].w, h: oy + MAPS[id].h });
    try { this.spawnAmbient(); } catch (e) { console.warn('benua: suasana', id, e); } finally { this.M = keep; }
    this.ambObjs = this.children.list.filter(o => !before.has(o)); this.ambInter = new Set(this.inter.filter(i => !interBefore.has(i)));
  },
  // cuaca per wilayah: kabut di rawa
  benuaWeather(id) {
    const want = id === 'swamp' ? 'fog' : this.weather === 'fog' ? 'clear' : this.weather;
    if (want === this.weather) return;
    this.weather = want; this.dropActiveFx(); this.makeActiveFx();
  },
  // tiap frame (dipanggil dari updRegions): wilayah tempat Arka berada → S.map, nama, musik; hutan pengisi
  updBenua(dt, first) {
    if ((this.wildT -= dt) <= 0) { this.wildT = .4; this.updWilds(); }
    if ((this.regT -= dt) > 0 && !first) return; this.regT = .25;
    if (!first) this.streamObjs(2);
    const pl = this.pl, id = first || regionAt(pl.x, pl.y); if (!id) return;
    // awal cerita: penjaga melarang masuk hutan (dulu lewat pintu tepi)
    if (S.stage === 0 && (id === 'forest' || (MAPS[id].peralihan || []).includes('forest')) && !this.bossOn) {
      pl.setPosition(this.safeXY[0], this.safeXY[1]); pl.body.reset(this.safeXY[0], this.safeXY[1]); if (!G.lock) this.guardStop(); return;
    }
    this.safeXY = [pl.x, pl.y];
    if (id === this.regId) return;
    const R = MAPS[id], was = this.regId; this.regId = id; this.R = R; S.map = id; S.seen[id] = 1;
    if (G.title) return;
    this.benuaWeather(id); this.benuaAmbient(id); this.ch5Enter(id);
    if (!this.bossOn) playBGM(this.weather === 'rain' ? null : bgmFor(R));
    const lb = this.lastBanner; // banner tidak berulang saat bolak-balik di perbatasan
    if (was && (!lb || lb.id !== id || this.t - lb.t > 20)) {
      banner(R.name, id === 'village' ? 'SELAMAT DATANG DI' : 'MEMASUKI'); this.lastBanner = { id, t: this.t };
    }
    if (was) updHud();
  },
});
for (const k of ['wildCanopyTex', 'updWilds', 'makeWild']) World.prototype[k] = GroundLayer.prototype[k];
// peta mini & kabut peta di mode benua: tampilkan wilayah tempat Arka berada (koordinat diterjemahkan ke lokal wilayah)
for (const k of ['updMinimap', 'updFog']) {
  const f0 = World.prototype[k];
  World.prototype[k] = function (dt) {
    if (!this.M.benua || !this.regId) return f0.call(this, dt);
    this['_' + k] = (this['_' + k] || 0) - dt; if (this['_' + k] > 0) return; this['_' + k] = .25;
    const [ox, oy] = WORLD_POS[this.regId], keep = { M: this.M, pl: this.pl, npcs: this.npcs, enemies: this.enemies, qGoal: this.qGoal };
    const loc = s => ({ x: s.x - ox, y: s.y - oy, visible: s.visible });
    this.M = MAPS[this.regId]; this.pl = loc(keep.pl);
    if (k === 'updMinimap') {
      this.npcs = keep.npcs.map(n => ({ spr: loc(n.spr) })); this.enemies = keep.enemies.map(e => ({ hp: e.hp, spr: loc(e.spr) }));
      this.qGoal = keep.qGoal && { x: keep.qGoal.x - ox, y: keep.qGoal.y - oy };
    }
    try { return f0.call(this, 1); } finally { Object.assign(this, keep); }
  };
}
// peta besar di mode benua: buka peta wilayah tempat Arka berada (scene "tampilan wilayah" berkoordinat lokal)
{
  const openMapNew0 = openMapNew;
  openMapNew = function (sc) { // eslint-disable-line no-global-assign
    if (!sc || !sc.M || !sc.M.benua || !sc.regId) return openMapNew0(sc);
    const [ox, oy] = WORLD_POS[sc.regId], loc = s => ({ x: s.x - ox, y: s.y - oy, visible: s.visible });
    const view = Object.create(sc, {
      M: { value: MAPS[sc.regId] }, pl: { value: Object.assign(loc(sc.pl), { dir: sc.pl.dir }) },
      npcs: { value: sc.npcs.map(n => Object.assign({}, n, { spr: loc(n.spr) })) },
      enemies: { value: sc.enemies.map(e => Object.assign({}, e, { spr: loc(e.spr) })) },
    });
    return openMapNew0(view);
  };
}
