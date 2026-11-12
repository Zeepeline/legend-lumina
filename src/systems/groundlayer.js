'use strict';
// Lapisan tanah bersama (scene 'GL', selalu paling bawah): tanah SEMUA wilayah luar ruang yang dimuat + hutan pengisi celah,
// dalam koordinat GLOBAL (WORLD_POS). Scene World (aktif & pasif) tidak menggambar tanahnya sendiri, jadi tajuk pohon yang
// menjorok melewati perbatasan tidak lagi tertimpa tanah wilayah sebelah. Kamera GL & wilayah pasif diselaraskan SETELAH
// camStep wilayah aktif (syncCams), sehingga tidak ada celah 1–3 px (garis gelap) saat bergerak.
class GroundLayer extends Phaser.Scene {
  constructor() { super({ key: 'GL' }); }
  create() {
    this.t = 0; this.gImgs = new Map(); this.gL = []; this.gStream = true; this.gIds = ''; this.wild = new Map(); this.wildT = 0;
    this.cameras.main.setBackgroundColor('#2f4a2a');
  }
  update(time, dl) {
    const dt = Math.min(dl, 100) / 1000, A = G.scene; this.t += dt;
    const on = !!(A && A.sys && A.M && glOn(A.M));
    this.cameras.main.setVisible(on); if (!on) return;
    const ids = [A.M.id, ...REG.keys()].filter(id => MAPS[id] && WORLD_POS[id]);
    if (ids.join() !== this.gIds) { this.gIds = ids.join(); this.gL = ids.map(id => gLayer(MAPS[id], WORLD_POS[id][0], WORLD_POS[id][1])); }
    this.updGround();
    if ((this.wildT -= dt) <= 0) { this.wildT = .4; this.updWilds(); }
  }
}
for (const k of ['gFillView', 'gNeed', 'gEnsure', 'updGround']) GroundLayer.prototype[k] = World.prototype[k];
// wilayah ini memakai lapisan tanah bersama?
function glOn(M) { return regionsOn() && !M.indoor && !G.title && !window.STREAM_OFF && !!WORLD_POS[M.id] && M.ground !== 'room'; }
Object.assign(World.prototype, {
  glScene() {
    let gl = this.scene.get('GL');
    if (!gl) { this.scene.add('GL', GroundLayer, true); gl = this.scene.get('GL'); }
    return gl;
  },
  // dipanggil di akhir camStep wilayah aktif: semua kamera lain mengikuti posisi kamera yang sudah final untuk frame ini
  syncCams() {
    if (this.passive || this !== G.scene || !this.cameras) return;
    const cam = this.cameras.main;
    for (const s of REG.values()) {
      if (!s.sys || !s.cameras) continue;
      const [dx, dy] = relXY(this, s); s.cameras.main.setScroll(cam.scrollX + dx, cam.scrollY + dy);
    }
    if (!glOn(this.M)) return;
    const gl = this.glScene(), P = WORLD_POS[this.M.id]; if (!gl || !gl.cameras) return;
    gl.cameras.main.setScroll(cam.scrollX + P[0], cam.scrollY + P[1]);
    if (this.scene.manager.getIndex('GL') !== 0) this.scene.manager.sendToBack('GL');
  },
});
{ // camStep (scene/world.js) dibungkus: sinkron kamera setelah kamera aktif bergerak
  const camStep0 = World.prototype.camStep;
  World.prototype.camStep = function () { camStep0.apply(this, arguments); this.syncCams(); };
}
