'use strict';
// Navigasi scene: pindah peta (goto, memuat ulang scene) & penjaga awal cerita (guardStop). Mode benua membungkus goto (benua_scene.js).
Object.assign(World.prototype, {
  goto(map, x, y, dir, extra = {}) {
    if (this.trans) return; this.trans = true;
    FADE.style.opacity = 1; S.map = map; S.x = x; S.y = y; S.dir = dir; saveGame(null);
    setTimeout(() => this.scene.restart(Object.assign({ map, x, y, dir }, extra)), 360);
  },
  async guardStop() {
    G.lock++; const g = this.npcs.find(n => n.n.id === 'guard'); if (g) this.face(g, 'down');
    await say('Tunggu! Hutan sedang berbahaya. Temui Tetua Bram di rumah pohon dulu.', 'Penjaga'); G.lock--;
  },
});
