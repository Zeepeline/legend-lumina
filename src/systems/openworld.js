'use strict';
// Dunia terbuka Tahap 1: wilayah tetangga digambar menempel di tepi wilayah aktif (tanah + objek),
// kamera bebas melewati tepi, dan Arka menyeberang tanpa layar hitam. Setiap wilayah tetap memakai
// koordinatnya sendiri, jadi skrip cerita & sistem per wilayah tetap jalan (lihat world/layout.js).
const OW_BAND = 520; // objek wilayah tetangga digambar sampai sejauh ini dari tepi
Object.assign(World.prototype, {
  initOpen(data) {
    const M = this.M; this.owN = []; this.owObjs = [];
    this.camB = { x0: 0, y0: 0, x1: M.w, y1: M.h };
    if (G.title || M.indoor || !NEIGH[M.id] || !this.gStream) return;
    for (const n of NEIGH[M.id]) {
      const B = MAPS[n.to]; this.owN.push(n);
      this.gL.push(gLayer(B, n.ox, n.oy));
      // batas kamera & dunia fisika diperluas ke arah tetangga (secukupnya untuk satu layar)
      const r = { x0: n.ox, y0: n.oy, x1: n.ox + B.w, y1: n.oy + B.h };
      if (n.side === 'E') this.camB.x1 = Math.max(this.camB.x1, Math.min(r.x1, M.w + VW));
      if (n.side === 'W') this.camB.x0 = Math.min(this.camB.x0, Math.max(r.x0, -VW));
      if (n.side === 'S') this.camB.y1 = Math.max(this.camB.y1, Math.min(r.y1, M.h + VH));
      if (n.side === 'N') this.camB.y0 = Math.min(this.camB.y0, Math.max(r.y0, -VH));
      // objek diam tetangga di dekat tepi (hanya gambar; tabrakan nyata ada setelah menyeberang)
      for (const o of mapObjects(B)) {
        const gx = o[1] + n.ox, gy = o[2] + n.oy, d = OBJ[o[0]]; if (!d || !this.textures.exists(d.key)) continue;
        const dx = Math.max(0 - gx, gx - M.w, 0), dy = Math.max(0 - gy, gy - M.h, 0); if (Math.max(dx, dy) > OW_BAND) continue;
        const s = this.add.image(gx, gy, d.key, 0).setOrigin(.5, 1).setDepth(gy); if (o[3] && o[3].flip) s.setFlipX(true);
        this.owObjs.push(s);
      }
    }
    const B = this.camB; this.physics.world.setBounds(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0);
    this.cameras.main.setBackgroundColor('#2f4a2a');
    if (data.cam) { this.cx = data.cam.x; this.cy = data.cam.y; this.cameras.main.setScroll(Math.round(this.cx), Math.round(this.cy)); }
    for (const L of this.gL) if (L.ox || L.oy) for (const [i, j] of this.gNeed(L, this.cx, this.cy, 0)) this.gEnsure(L, i, j, true);
  },
  // pintu tepi yang sudah mulus: tidak memakai transisi layar hitam lagi
  owSeamless(ex) { return this.owN && this.owN.some(n => n.ex === ex); },
  updCross() {
    if (!this.owN || !this.owN.length || this.trans || G.lock || this.bossOn) return;
    const pl = this.pl, M = this.M; if (pl.x >= 0 && pl.x <= M.w && pl.y >= 0 && pl.y <= M.h) return;
    const n = this.owN.find(n => { const B = MAPS[n.to]; return pl.x >= n.ox && pl.x <= n.ox + B.w && pl.y >= n.oy && pl.y <= n.oy + B.h; });
    if (!n) return;
    if (n.to === 'forest' && S.stage === 0) { pl.setPosition(clamp(pl.x, 4, M.w - 4), clamp(pl.y, 4, M.h - 4)); this.guardStop(); return; }
    // ganti wilayah aktif tanpa layar hitam: posisi & kamera dipindah ke koordinat wilayah baru
    this.trans = true; const cam = this.cameras.main, x = Math.round(pl.x - n.ox), y = Math.round(pl.y - n.oy);
    S.map = n.to; S.x = x; S.y = y; S.dir = pl.dir;
    this.scene.restart({ map: n.to, x, y, dir: pl.dir, seamless: true, quiet: false, cam: { x: cam.scrollX - n.ox, y: cam.scrollY - n.oy } });
  },
});
