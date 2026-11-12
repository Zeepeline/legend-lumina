'use strict';
// Gelombang B: tanah per chunk (streaming). Hanya potongan di sekitar layar yang dibuat, sisanya dibuat
// bertahap tiap frame dengan jatah waktu, potongan jauh dibuang (LRU). genGround/bakeGround menggambar
// per potongan dengan hasil identik piksel-per-piksel dengan versi utuh. Fondasi dunia mulus.
const GT = 64, GT_MAX = 1100, GT_BUDGET = 4, GT_MARGIN = 2; // ukuran potongan, maks potongan di memori, ms/frame, cincin potongan di luar layar
const GTC = new Map(); // kunci tekstur → waktu terakhir dipakai (LRU, lintas peta)
const GOV = {};        // ringkasan ¼ ukuran per peta untuk peta besar & peta mini
function gtKey(M, i, j) { return 'gt:' + M.id + ':' + i + ':' + j; }
function groundOverview(M) {
  let o = GOV[M.id]; if (o) return o;
  const c = document.createElement('canvas'); c.width = Math.ceil(M.w / 4); c.height = Math.ceil(M.h / 4);
  const x = c.getContext('2d'); x.fillStyle = (GROUND[M.ground] && GROUND[M.ground].g && GROUND[M.ground].g[0]) || '#6a9a4e'; x.fillRect(0, 0, c.width, c.height);
  return GOV[M.id] = { c, v: 0 };
}
Object.assign(World.prototype, {
  initGround(data) {
    const M = this.M; this.gImgs = new Map(); this.gStream = !M.indoor && !G.title && !window.STREAM_OFF; // STREAM_OFF: hanya untuk tes perbandingan
    if (!this.gStream) { if (!this.textures.exists('gs_' + M.id)) this.textures.addCanvas('gs_' + M.id, bakeGround(this, M)); this.add.image(0, 0, 'gs_' + M.id).setOrigin(0).setDepth(-1e6); return; }
    this.gCols = Math.ceil(M.w / GT); this.gRows = Math.ceil(M.h / GT);
    // potongan di sekitar titik masuk dibuat langsung (tanpa jatah waktu) agar layar pertama sudah lengkap
    const x = data.x || S.x, y = data.y || S.y;
    for (const [i, j] of this.gNeed(x - VW / 2, y - VH / 2, 0)) this.gEnsure(i, j, true);
  },
  // daftar potongan yang dibutuhkan untuk tampilan ini, terdekat dulu
  gNeed(vx, vy, ring) {
    const i0 = Math.max(0, Math.floor(vx / GT) - ring), j0 = Math.max(0, Math.floor(vy / GT) - ring);
    const i1 = Math.min(this.gCols - 1, Math.floor((vx + VW) / GT) + ring), j1 = Math.min(this.gRows - 1, Math.floor((vy + VH) / GT) + ring);
    const cx = (vx + VW / 2) / GT, cy = (vy + VH / 2) / GT, L = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) L.push([i, j, Math.hypot(i + .5 - cx, j + .5 - cy)]);
    return L.sort((a, b) => a[2] - b[2]);
  },
  gEnsure(i, j, force) {
    const M = this.M, k = gtKey(M, i, j);
    if (!this.textures.exists(k)) {
      if (!force && this.gSpent >= GT_BUDGET) return false;
      const a = performance.now(), w = Math.min(GT, M.w - i * GT), h = Math.min(GT, M.h - j * GT);
      const c = bakeGround(this, M, [i * GT, j * GT, w, h]); this.textures.addCanvas(k, c);
      const o = groundOverview(M); o.c.getContext('2d').drawImage(c, i * GT / 4, j * GT / 4, w / 4, h / 4); o.v++;
      this.gSpent += performance.now() - a; this.gBaked = (this.gBaked || 0) + 1;
    }
    GTC.delete(k); GTC.set(k, this.t || 0);
    if (!this.gImgs.has(k)) this.gImgs.set(k, this.add.image(i * GT, j * GT, k).setOrigin(0).setDepth(-1e6));
    return true;
  },
  updGround() {
    if (!this.gStream) return; this.gSpent = 0; const v = this.cameras.main.worldView;
    const need = this.gNeed(v.x, v.y, GT_MARGIN), want = new Set();
    for (const [i, j] of need) { want.add(gtKey(this.M, i, j)); const inView = i * GT < v.right && (i + 1) * GT > v.x && j * GT < v.bottom && (j + 1) * GT > v.y; this.gEnsure(i, j, inView); }
    // gambar potongan jauh dilepas dari layar (teksturnya tetap disimpan sampai LRU penuh)
    for (const [k, img] of this.gImgs) if (!want.has(k)) { const [, , i, j] = k.split(':'); if (Math.abs(i * GT + GT / 2 - (v.x + VW / 2)) > VW + GT * 3 || Math.abs(j * GT + GT / 2 - (v.y + VH / 2)) > VH + GT * 3) { img.destroy(); this.gImgs.delete(k); } }
    // LRU: buang tekstur tertua yang tidak sedang ditampilkan
    if (GTC.size > GT_MAX) for (const k of GTC.keys()) { if (GTC.size <= GT_MAX) break; if (this.gImgs.has(k)) continue; GTC.delete(k); if (this.textures.exists(k)) this.textures.remove(k); }
  },
});
