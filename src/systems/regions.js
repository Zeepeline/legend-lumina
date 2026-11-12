'use strict';
// Dunia satu peta (langkah 1): wilayah di sekitar Arka berjalan BERSAMAAN sebagai scene World pasif
// (NPC, monster, hewan hidup; kamera diselaraskan dengan WORLD_POS). Hanya wilayah aktif (G.scene) yang
// memegang pemain, input, HUD, musik, waktu & efek layar. Menyeberang = serah-terima kendali ke wilayah
// yang sudah berjalan, tanpa memuat ulang. Tiap wilayah tetap memakai koordinat lokalnya (skrip cerita aman).
const REG_LOAD = 960, REG_KEEP = 1400, REG_MAX = 7;
const REG = new Map(); // id peta → scene pasif
let regSeq = 0;
function regionsOn() { return !window.REGIONS_OFF; }
function wposOf(id) { return WORLD_POS[id]; }
function relXY(from, to) { const a = wposOf(from.M.id), b = wposOf(to.M.id); return [a[0] - b[0], a[1] - b[1]]; } // titik di `from` → koordinat `to`
function removeRegions(except) { for (const [id, s] of REG) { if (s === except) continue; REG.delete(id); try { s.scene.remove(); } catch (_) { } } }
Object.assign(World.prototype, {
  // ---- wilayah pasif ----
  initPassive(data) {
    const pl = this.pl; pl.ghost = true; pl.setVisible(false); pl.sh.setVisible(false); pl.body.enable = false;
    this.camFollow = false; const cam = this.cameras.main; cam.removeBounds(); cam.transparent = true; cam.setBackgroundColor('rgba(0,0,0,0)');
    if (data.cam) { this.cx = data.cam.x; this.cy = data.cam.y; cam.setScroll(Math.round(this.cx), Math.round(this.cy)); }
    this.scene.sendToBack();
  },
  updPassive(dt) {
    const A = G.scene; if (!A || A === this || !A.pl || !A.M || !wposOf(A.M.id)) return;
    const [dx, dy] = relXY(A, this), pl = this.pl, ap = A.pl;
    pl.x = ap.x + dx; pl.y = ap.y + dy; pl.dead = ap.dead; pl.inv = ap.inv; pl.dir = ap.dir;
    const locked = !!UIH || G.lock > 0 || A.trans || G.title;
    for (const o of this.npcs) this.updNpc(o, dt, locked);
    for (const c of this.critters) this.updCritter(c, dt);
    for (const e of this.enemies) if (e.hp > 0) { this.updEnemy(e, dt, locked); this.updFeel(e, dt, locked); }
    this.enemies = this.enemies.filter(e => e.hp > 0);
    this.updShots(dt, locked); this.updPicks(dt);
    this.bars.clear();
    for (const e of this.enemies) if (!e.boss && e.hp > 0 && e.hp < e.max) { const w = 16, x = Math.round(e.spr.x - w / 2), y = Math.round(e.spr.y - e.spr.displayHeight - 4 - (e.D.fly ? 10 : 0)); this.bars.fillStyle(0x1a0a0a, .85).fillRect(x - 1, y - 1, w + 2, 4); this.bars.fillStyle(0xff5a4a, 1).fillRect(x, y, Math.ceil(w * e.hp / e.max), 2); }
    if (this.garden) this.updGarden();
    this.updRanch(dt); this.updGround(); this.updCull();
  },
  // ---- wilayah aktif: muat/buang wilayah di sekitar & selaraskan kamera ----
  updRegions(dt) {
    if (!regionsOn() || this.passive || G.title || this.M.indoor || !wposOf(this.M.id)) return;
    this.regT = (this.regT || 0) - dt;
    if (this.regT <= 0) {
      this.regT = .3; const P = wposOf(this.M.id), gx = P[0] + this.pl.x, gy = P[1] + this.pl.y;
      const dist = id => { const W = wposOf(id), M = MAPS[id]; return Math.hypot(Math.max(W[0] - gx, 0, gx - W[0] - M.w), Math.max(W[1] - gy, 0, gy - W[1] - M.h)); };
      for (const [id, s] of REG) if (id === this.M.id || dist(id) > REG_KEEP || !s.sys) { REG.delete(id); if (s !== this) try { s.scene.remove(); } catch (_) { } }
      const want = Object.keys(WORLD_POS).filter(id => id !== this.M.id && MAPS[id] && !MAPS[id].indoor && !REG.has(id) && dist(id) < REG_LOAD).sort((a, b) => dist(a) - dist(b));
      if (want.length && REG.size < REG_MAX) this.addRegion(want[0]); // satu per giliran agar tidak tersendat
      this.regBounds();
    }
    // kamera wilayah pasif mengikuti kamera aktif (posisi global sama)
    const cam = this.cameras.main;
    for (const s of REG.values()) { if (!s.sys || !s.cameras) continue; const [dx, dy] = relXY(this, s); s.cameras.main.setScroll(cam.scrollX + dx, cam.scrollY + dy); }
  },
  addRegion(id) {
    const key = 'R' + (++regSeq) + '_' + id, sc = new World(); sc.sys.settings.key = key;
    const [dx, dy] = relXY(this, { M: MAPS[id] }), cam = this.cameras.main;
    this.scene.add(key, sc, true, { map: id, passive: true, x: this.pl.x + dx, y: this.pl.y + dy, dir: 'down', cam: { x: cam.scrollX + dx, y: cam.scrollY + dy }, quiet: true });
    REG.set(id, sc);
  },
  // batas kamera & dunia fisika = gabungan wilayah aktif + wilayah yang termuat (koordinat lokal aktif)
  regBounds() {
    const M = this.M, b = { x0: 0, y0: 0, x1: M.w, y1: M.h };
    for (const s of REG.values()) { if (!s.M) continue; const [dx, dy] = relXY(s, this); b.x0 = Math.min(b.x0, dx); b.y0 = Math.min(b.y0, dy); b.x1 = Math.max(b.x1, dx + s.M.w); b.y1 = Math.max(b.y1, dy + s.M.h); }
    this.camB = b; this.cameras.main.setBounds(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0); this.physics.world.setBounds(b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0);
  },
  // ---- serah-terima kendali ke wilayah yang sudah berjalan ----
  owHandoff(B) {
    const A = this, cam = A.cameras.main, [dx, dy] = relXY(A, B), ap = A.pl, bp = B.pl;
    // pemain pindah ke B
    bp.setPosition(ap.x + dx, ap.y + dy); bp.dir = ap.dir; bp.flipX = ap.flipX; bp.ghost = false; bp.setVisible(true); bp.sh.setVisible(true); bp.body.enable = true;
    for (const k of ['atkCd', 'atkT', 'inv', 'kb', 'kbx', 'kby', 'dashT', 'dvx', 'dvy', 'dead']) bp[k] = ap[k];
    bp.setVelocity(ap.body.velocity.x, ap.body.velocity.y); if (ap.anims.currentAnim) bp.play(ap.anims.currentAnim.key, true); else bp.setFrame(ap.frame.name);
    // A menjadi pasif
    ap.ghost = true; ap.setVisible(false); ap.sh.setVisible(false); ap.setVelocity(0); ap.body.enable = false;
    A.dropActiveFx(); for (const k of ['seaOv', 'seaW', 'seaP']) if (A[k]) { A[k].destroy(); A[k] = null; }
    if (A.iHint) A.iHint.setVisible(false); if (A.qArrow) { A.qArrow.setVisible(false); A.qStar.setVisible(false); } if (A.lockR) A.lockR.setVisible(false); A.aimG.clear();
    A.passive = true; A.camFollow = false; A.cameras.main.removeBounds(); A.cameras.main.setBackgroundColor('rgba(0,0,0,0)');
    // B menjadi aktif
    REG.delete(B.M.id); REG.set(A.M.id, A);
    B.passive = false; G.scene = B; B.trans = false; B.mpT = 0; B.owN = (NEIGH[B.M.id] || []).slice(); // sambungan mulus wilayah baru
    S.map = B.M.id; S.seen[B.M.id] = 1; S.x = Math.round(bp.x); S.y = Math.round(bp.y); S.dir = bp.dir;
    B.makeActiveFx(); B.spawnSeason(); B.initPolish();
    B.camFollow = true; B.cx = cam.scrollX + dx; B.cy = cam.scrollY + dy; B.cameras.main.setScroll(Math.round(B.cx), Math.round(B.cy));
    B.scene.bringToTop(); B.regT = 0; B.regBounds();
    if (B.weather !== 'rain') playBGM(bgmFor(B.M)); banner(B.M.name, 'MEMASUKI'); updHud(); achCheck(B);
  },
});
// serangan monster wilayah pasif mengenai Arka di wilayah aktif
const _hurtRegion = World.prototype.hurtPlayer;
World.prototype.hurtPlayer = function (atk, sx, sy, fx) {
  if (!this.passive) return _hurtRegion.apply(this, arguments);
  const A = G.scene; if (!A || A === this || !A.M || !wposOf(A.M.id)) return; const [dx, dy] = relXY(this, A);
  return A.hurtPlayer(atk, sx + dx, sy + dy, fx);
};
// wilayah aktif dimulai ulang (pintu rumah, gua, teleport, kalah): wilayah pasif dibuang
const _gotoRegion = World.prototype.goto;
World.prototype.goto = function () { if (!this.passive) removeRegions(this); return _gotoRegion.apply(this, arguments); };
