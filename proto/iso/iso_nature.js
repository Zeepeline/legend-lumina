'use strict';
// Penataan pohon alami untuk dunia isometrik (pengganti "lempar dadu per kotak 16 px").
// Metode: Poisson disk sampling (Bridson) dengan jari-jari berubah mengikuti peta kepadatan dari noise:
//   kepadatan tinggi → pohon rapat (hutan), rendah → jarang / lapangan terbuka; noise 2 skala → rumpun & celah alami.
//   Aturan ekologi: inti desa lapang, tepi hutan berangsur (pohon kecil + semak di pinggir, pohon besar di dalam),
//   dekat jalan/rumah/air kosong, ukuran & jenis pohon bervariasi. Seed tetap → hasil selalu sama.
function isoRng(seed) { let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
// titik-titik Poisson berjari-jari variabel: rad(x, y) ∈ [rMin, rMax]; ok(x, y) = boleh ditempati
function poissonVar({ x0, y0, x1, y1, rMin, rMax, rad, ok, seed, k = 16, darts = 400 }) {
  const R = isoRng(seed), cs = rMin / Math.SQRT2, gw = Math.ceil((x1 - x0) / cs) + 1, gh = Math.ceil((y1 - y0) / cs) + 1;
  const grid = new Int32Array(gw * gh).fill(-1), pts = [], act = [], span = Math.ceil(rMax / cs) + 1;
  const fits = (x, y, r) => {
    if (x < x0 || y < y0 || x >= x1 || y >= y1 || !ok(x, y)) return false;
    const gx = Math.floor((x - x0) / cs), gy = Math.floor((y - y0) / cs);
    for (let j = Math.max(0, gy - span); j <= Math.min(gh - 1, gy + span); j++) for (let i = Math.max(0, gx - span); i <= Math.min(gw - 1, gx + span); i++) {
      const q = grid[j * gw + i]; if (q < 0) continue; const p = pts[q], m = (r + p.r) / 2;
      if ((p.x - x) ** 2 + (p.y - y) ** 2 < m * m) return false;
    }
    return true;
  };
  const add = (x, y, r) => { const i = pts.length; pts.push({ x, y, r }); act.push(i); grid[Math.floor((y - y0) / cs) * gw + Math.floor((x - x0) / cs)] = i; };
  for (let d = 0; d < darts; d++) { // banyak titik awal: daerah yang terpisah jalan/sungai tetap terisi
    const x = x0 + R() * (x1 - x0), y = y0 + R() * (y1 - y0), r = rad(x, y); if (fits(x, y, r)) add(x, y, r);
    while (act.length) {
      const ai = Math.floor(R() * act.length), p = pts[act[ai]]; let found = false;
      for (let t = 0; t < k; t++) {
        const a = R() * 6.2832, dd = p.r * (1 + R()), nx = p.x + Math.cos(a) * dd, ny = p.y + Math.sin(a) * dd, nr = rad(nx, ny);
        if (fits(nx, ny, nr)) { add(nx, ny, nr); found = true; break; }
      }
      if (!found) act.splice(ai, 1);
    }
  }
  return pts;
}

Object.assign(IsoWorld.prototype, {
  // pasang satu pohon (+ bayangan, + semak di kaki pohon tepi hutan); dens 0..1 menentukan ukuran & jenis
  natTree(r, x, y, dens, R, solid) {
    const sx = Math.round(isoX(x, y)), sy = Math.round(isoY(x, y, zAt(x, y)));
    const apple = dens < .5 && R() < .1, s = (apple ? .5 : .78 + R() * .34) * (.82 + .3 * dens);
    const img = this.add.image(sx, sy, apple ? 'apple1' : 'treeA').setOrigin(.5, .94).setScale(s).setDepth(x + y).setFlipX(R() < .5);
    const sh = this.add.image(sx + 7, sy - 1, 'fx_shadow').setScale(2.6 * s, 1.9 * s).setDepth(-5e4).setAlpha(.55 + .35 * dens);
    r.objs.push(img, sh); r.props.push({ img, d: x + y, al: 1, b: img.getBounds() });
    if (solid) this.solids.push({ x, y, r: 5 + 3 * s });
    if (dens > .15 && dens < .65 && R() < .4) { /* semak di tepi hutan (peralihan pohon → padang) */
      const bx = x + (R() - .5) * 22, by = y + 6 + R() * 8, k = ['bushG1', 'bushG2', 'bushP'][Math.floor(R() * 3)];
      if (this.textures.exists(k)) r.objs.push(this.add.image(isoX(bx, by), isoY(bx, by, zAt(bx, by)), k).setOrigin(.5, .9).setScale(.55 + R() * .25).setDepth(bx + by));
    }
  },
  // Desa: inti lapang, sabuk hutan berangsur di tepi denah, lahan pengisi berhutan, jalan & rumah kosong
  natVillage(r, roads, P) {
    const T = ISO.T, PN = IMAP.N * T, R = isoRng(777), cx = 24.5 * T, cy = 25.5 * T;
    const seg = (x, y, a, c, e, f) => { const vx = e - a, vy = f - c, t = clampN(((x - a) * vx + (y - c) * vy) / (vx * vx + vy * vy), 0, 1); return Math.hypot(x - a - vx * t, y - c - vy * t); };
    const roadsW = roads.map(([a, c, e, f]) => [...P(a, c), ...P(e, f)]), roadD = (x, y) => Math.min(...roadsW.map(q => seg(x, y, ...q)));
    const inP = (x, y) => x >= 0 && y >= 0 && x < PN && y < PN, inV = (x, y) => x >= r.ox && y >= r.oy && x < r.ox + r.w && y < r.oy + r.h;
    const dens = (x, y) => {
      const n = vnoise(x, y, 150, 41) * .6 + vnoise(x, y, 48, 42) * .4;
      if (!inP(x, y)) return clampN((.5 + .55 * n) * sstep(24, 80, roadD(x, y)), 0, 1); /* lahan pengisi: hutan, renggang dekat jalan */
      const e = Math.min(x, y, PN - x, PN - y), belt = sstep(120, 6, e) * (.7 + .45 * n), dc = Math.hypot(x - cx, y - cy);
      const clump = sstep(.56, .78, n) * (.35 + .65 * sstep(120, 280, dc)); /* rumpun di sela desa, makin jauh dari alun-alun makin banyak */
      return clampN(Math.max(belt, clump), 0, 1);
    };
    const grassOK = (x, y) => { for (const [dx, dy] of [[0, 0], [9, 0], [-9, 0], [0, 9], [0, -9]]) if (terrainAt(Math.floor((x + dx) / T), Math.floor((y + dy) / T)) !== 'grass') return false; return true; };
    const ok = (x, y) => {
      if (dens(x, y) < .14) return false;
      if (inP(x, y)) {
        if (!grassOK(x, y)) return false;
        if (this.houses.some(h => x > h.x - 14 && x < h.x + h.w + 14 && y > h.y - 14 && y < h.y + h.d + 14)) return false;
        if (this.solids.some(s => Math.hypot(s.x - x, s.y - y) < s.r + 10)) return false;
        return true;
      }
      if (inV(x, y)) return roadD(x, y) > 24;
      return !this.regAt(x, y); /* hutan hiasan di ruang kosong di luar wilayah */
    };
    const pts = poissonVar({ x0: r.ox - 140, y0: r.oy - 140, x1: r.ox + r.w + 140, y1: r.oy + r.h + 140, rMin: 17, rMax: 70, seed: 9101,
      rad: (x, y) => 70 - 53 * Math.pow(dens(x, y), .7), ok });
    for (const p of pts) this.natTree(r, p.x, p.y, dens(p.x, p.y), R, inP(p.x, p.y) || inV(p.x, p.y));
  },
  // hutan di luar dunia: makin jauh dari tepi wilayah makin rapat & besar (tepi berangsur, bukan pita lurus)
  natRing(r) {
    if (ISO_NOLUSH.test(r.id) && r.id !== 'snow') return;
    const M = 150, R = isoRng(hash2(r.ox | 0, r.oy | 0, 5) * 1e9);
    const out = (x, y) => Math.max(r.ox - x, x - r.ox - r.w, r.oy - y, y - r.oy - r.h);
    const dens = (x, y) => clampN(sstep(-4, 70, out(x, y)) * (.7 + .4 * vnoise(x, y, 90, 7)), 0, 1);
    const ok = (x, y) => out(x, y) > 4 && !this.regs.some(q => x > q.ox - 6 && x < q.ox + q.w + 6 && y > q.oy - 6 && y < q.oy + q.h + 6);
    const pts = poissonVar({ x0: r.ox - M, y0: r.oy - M, x1: r.ox + r.w + M, y1: r.oy + r.h + M, rMin: 16, rMax: 60, seed: (r.ox * 7 + r.oy * 13) | 0,
      rad: (x, y) => 60 - 44 * dens(x, y), ok, darts: 250 });
    for (const p of pts) this.natTree(r, p.x, p.y, Math.max(.2, dens(p.x, p.y)), R, false);
  },
  // air dari gambar lantai (sungai/kolam yang tidak ikut terekspor sebagai tembok) → kisi 4 px untuk tabrakan
  waterGrid(r, wet, mask, W, H) {
    const C = 4, w = Math.ceil(W / C), h = Math.ceil(H / C), a = new Uint8Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const x = Math.min(W - 1, i * C + 2), y = Math.min(H - 1, j * C + 2), q = y * W + x; a[j * w + i] = wet[q] && !mask[q] ? 1 : 0;
    }
    r.wat = { w, h, a };
  },
  wetAt(r, lx, ly) { const W = r.wat; if (!W) return false; const i = Math.floor(lx / 4), j = Math.floor(ly / 4); return i >= 0 && j >= 0 && i < W.w && j < W.h && W.a[j * W.w + i] === 1; },
});
