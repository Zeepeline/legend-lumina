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
// Lapisan tanah: wilayah aktif (offset 0,0) + wilayah tetangga di posisinya (systems/openworld.js)
function gLayer(M, ox, oy) { return { M, ox, oy, cols: Math.ceil(M.w / GT), rows: Math.ceil(M.h / GT) }; }
Object.assign(World.prototype, {
  initGround(data) {
    const M = this.M; this.gImgs = new Map(); this.gL = []; this.gStream = !M.indoor && !G.title && !window.STREAM_OFF; // STREAM_OFF: hanya untuk tes perbandingan
    if (glOn(M)) { this.gStream = false; this.cameras.main.setBackgroundColor('rgba(0,0,0,0)'); return; } // tanah digambar lapisan bersama GL
    if (!this.gStream) { if (!this.textures.exists('gs_' + M.id)) this.textures.addCanvas('gs_' + M.id, bakeGround(this, M)); this.add.image(0, 0, 'gs_' + M.id).setOrigin(0).setDepth(-1e6); return; }
    if (M.benua) this.gL = M.regions.map(id => gLayer(MAPS[id], WORLD_POS[id][0], WORLD_POS[id][1])); /* benua: tanah tiap wilayah di posisi globalnya */
    else this.gL.push(gLayer(M, 0, 0));
    // potongan di sekitar titik masuk dibuat langsung agar layar pertama sudah lengkap
    const x = data.cam ? data.cam.x + VW / 2 : (data.x || S.x), y = data.cam ? data.cam.y + VH / 2 : (data.y || S.y);
    this.gFillView(x - VW / 2, y - VH / 2);
  },
  gFillView(vx, vy) { for (const L of this.gL) for (const [i, j] of this.gNeed(L, vx, vy, 0)) this.gEnsure(L, i, j, true); },
  // daftar potongan lapisan L yang dibutuhkan untuk tampilan (koordinat wilayah aktif), terdekat dulu
  gNeed(L, vx, vy, ring) {
    const lx = vx - L.ox, ly = vy - L.oy;
    const i0 = Math.max(0, Math.floor(lx / GT) - ring), j0 = Math.max(0, Math.floor(ly / GT) - ring);
    const i1 = Math.min(L.cols - 1, Math.floor((lx + VW) / GT) + ring), j1 = Math.min(L.rows - 1, Math.floor((ly + VH) / GT) + ring);
    const cx = (lx + VW / 2) / GT, cy = (ly + VH / 2) / GT, out = [];
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) out.push([i, j, Math.hypot(i + .5 - cx, j + .5 - cy)]);
    return out.sort((a, b) => a[2] - b[2]);
  },
  gEnsure(L, i, j, force) {
    const M = L.M, k = gtKey(M, i, j);
    if (!this.textures.exists(k)) {
      if (!force && this.gSpent >= GT_BUDGET) return false;
      const a = performance.now(), w = Math.min(GT, M.w - i * GT), h = Math.min(GT, M.h - j * GT);
      const c = bakeGround(this, M, [i * GT, j * GT, w, h]); this.textures.addCanvas(k, c);
      const o = groundOverview(M); o.c.getContext('2d').drawImage(c, i * GT / 4, j * GT / 4, w / 4, h / 4); o.v++;
      this.gSpent += performance.now() - a; this.gBaked = (this.gBaked || 0) + 1;
    }
    GTC.delete(k); GTC.set(k, this.t || 0);
    if (!this.gImgs.has(k)) this.gImgs.set(k, this.add.image(L.ox + i * GT, L.oy + j * GT, k).setOrigin(0).setDepth(-1e6));
    return true;
  },
  updGround() {
    if (!this.gStream) return; this.gSpent = 0; const v = this.cameras.main.worldView, want = new Set();
    for (const L of this.gL) {
      if (v.right < L.ox - GT * GT_MARGIN || v.x > L.ox + L.M.w + GT * GT_MARGIN || v.bottom < L.oy - GT * GT_MARGIN || v.y > L.oy + L.M.h + GT * GT_MARGIN) continue;
      for (const [i, j] of this.gNeed(L, v.x, v.y, GT_MARGIN)) {
        want.add(gtKey(L.M, i, j)); const X = L.ox + i * GT, Y = L.oy + j * GT;
        this.gEnsure(L, i, j, X < v.right && X + GT > v.x && Y < v.bottom && Y + GT > v.y);
      }
    }
    // gambar potongan jauh dilepas dari layar (teksturnya tetap disimpan sampai LRU penuh)
    for (const [k, img] of this.gImgs) if (!want.has(k)) { const X = img.x + GT / 2, Y = img.y + GT / 2; if (Math.abs(X - (v.x + VW / 2)) > VW + GT * 3 || Math.abs(Y - (v.y + VH / 2)) > VH + GT * 3) { img.destroy(); this.gImgs.delete(k); } }
    // LRU: buang tekstur tertua yang tidak sedang ditampilkan
    if (GTC.size > GT_MAX) for (const k of GTC.keys()) { if (GTC.size <= GT_MAX) break; if (this.gImgs.has(k)) continue; GTC.delete(k); if (this.textures.exists(k)) this.textures.remove(k); }
  },
});
