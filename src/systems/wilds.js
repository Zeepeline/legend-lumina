'use strict';
// Hutan lebat pengisi celah kosong antarwilayah (dunia terbuka): tidak ada lagi area hitam. Digambar di lapisan tanah
// bersama (scene GL, koordinat global; systems/groundlayer.js), hanya celah di dekat kamera (dibuat/dibuang tiap 0,4 s).
// Celah dihitung sekali dari WORLD_POS (kompresi koordinat): tekstur kanopi + deretan pohon sungguhan di tepi celah.
const WILD_MARGIN = 1600, WILD_NEAR = 900, WILD_TILE = 256;
let WILD_RECTS = null;
function outdoorRects() {
  return Object.entries(WORLD_POS).filter(([id]) => MAPS[id] && !MAPS[id].indoor && MAPS[id].ground !== 'room')
    .map(([id, p]) => [p[0], p[1], p[0] + MAPS[id].w, p[1] + MAPS[id].h]);
}
function inRegion(R, x, y) { return R.some(r => x >= r[0] && x < r[2] && y >= r[1] && y < r[3]); }
function wildRects() {
  if (WILD_RECTS) return WILD_RECTS;
  const R = outdoorRects(), X = new Set(), Y = new Set();
  const bx0 = Math.min(...R.map(r => r[0])) - WILD_MARGIN, by0 = Math.min(...R.map(r => r[1])) - WILD_MARGIN;
  const bx1 = Math.max(...R.map(r => r[2])) + WILD_MARGIN, by1 = Math.max(...R.map(r => r[3])) + WILD_MARGIN;
  X.add(bx0); X.add(bx1); Y.add(by0); Y.add(by1);
  for (const r of R) { X.add(r[0]); X.add(r[2]); Y.add(r[1]); Y.add(r[3]); }
  const xs = [...X].sort((a, b) => a - b), ys = [...Y].sort((a, b) => a - b), rows = [];
  for (let j = 0; j + 1 < ys.length; j++) { // gabung sel kosong berurutan per baris
    const runs = []; let st = null;
    for (let i = 0; i + 1 < xs.length; i++) {
      const empty = !inRegion(R, (xs[i] + xs[i + 1]) / 2, (ys[j] + ys[j + 1]) / 2);
      if (empty && st === null) st = xs[i];
      if (!empty && st !== null) { runs.push([st, xs[i]]); st = null; }
    }
    if (st !== null) runs.push([st, xs[xs.length - 1]]);
    rows.push(runs.map(([a, b]) => [a, ys[j], b, ys[j + 1]]));
  }
  const out = []; // gabung vertikal bila rentang x sama
  for (const row of rows) for (const r of row) {
    const up = out.find(o => o[0] === r[0] && o[2] === r[2] && o[3] === r[1]);
    if (up) up[3] = r[3]; else out.push(r.slice());
  }
  WILD_RECTS = out;
  return out;
}
function wildTreeKeys(sc) { return ['treeAd', 'treeBd', 'pined'].map(t => OBJ[t] && OBJ[t].key).filter(k => k && sc.textures.exists(k)); }
Object.assign(GroundLayer.prototype, {
  wildCanopyTex() {
    if (this.textures.exists('wildcanopy')) return 'wildcanopy';
    const T = WILD_TILE, [c, x] = mk(T, T), keys = wildTreeKeys(this);
    x.fillStyle = '#284e1e'; x.fillRect(0, 0, T, T);
    for (let i = 0; i < 260; i++) { // bintik lantai hutan
      x.fillStyle = ['#2f5a23', '#22441a', '#355f27'][i % 3]; x.fillRect(Math.floor(hash(i, 1, 71) * T), Math.floor(hash(i, 2, 71) * T), 3, 2);
    }
    const imgs = keys.map(k => this.textures.get(k).getSourceImage());
    for (let row = 0; row < 9; row++) for (let col = 0; col < 7; col++) { // pohon rapat, dibungkus agar menyambung
      const n = row * 7 + col, im = imgs[Math.floor(hash(n, 3, 72) * imgs.length)]; if (!im) continue;
      const px = col * (T / 7) + (hash(n, 4, 72) - .5) * 20 + (row % 2) * 18, py = row * (T / 9) + (hash(n, 5, 72) - .5) * 10;
      for (const dx of [-T, 0, T]) for (const dy of [-T, 0, T]) x.drawImage(im, Math.round(px + dx - im.width / 2), Math.round(py + dy - im.height + 14));
    }
    this.textures.addCanvas('wildcanopy', c);
    return 'wildcanopy';
  },
  // buat isi celah yang dekat kamera, buang yang jauh
  updWilds() {
    const v = this.cameras.main.worldView, R = wildRects();
    R.forEach((r, ri) => {
      const near = r[2] > v.x - WILD_NEAR && r[0] < v.right + WILD_NEAR && r[3] > v.y - WILD_NEAR && r[1] < v.bottom + WILD_NEAR;
      const has = this.wild.get(ri);
      if (near && !has) this.wild.set(ri, this.makeWild(r));
      else if (!near && has) { for (const o of has) o.destroy(); this.wild.delete(ri); }
    });
  },
  makeWild(r) {
    const out = [], key = this.wildCanopyTex(), R = outdoorRects(), keys = wildTreeKeys(this);
    const ts = this.add.tileSprite(r[0], r[1], r[2] - r[0], r[3] - r[1], key).setOrigin(0).setDepth(-1.1e6);
    ts.tilePositionX = r[0]; ts.tilePositionY = r[1]; out.push(ts); // pola menyambung di koordinat global
    if (!keys.length) return out;
    // deretan pohon di tepi celah yang bersentuhan dengan wilayah
    const edge = (x0, y0, x1, y1, ox, oy) => {
      const L = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(L / 26);
      for (let i = 0; i <= n; i++) {
        const gx = x0 + (x1 - x0) * i / Math.max(1, n), gy = y0 + (y1 - y0) * i / Math.max(1, n);
        if (!inRegion(R, gx - ox * 3, gy - oy * 3)) continue;
        const j = hash(Math.round(gx), Math.round(gy), 73), tx = gx + ox * (10 + j * 8), ty = gy + oy * (10 + j * 8) + (oy < 0 ? 0 : 22);
        out.push(this.add.image(Math.round(tx), Math.round(ty), keys[Math.floor(j * 97) % keys.length]).setOrigin(.5, 1).setDepth(ty));
      }
    };
    edge(r[0], r[1], r[2], r[1], 0, 1); edge(r[0], r[3], r[2], r[3], 0, -1); edge(r[0], r[1], r[0], r[3], 1, 0); edge(r[2], r[1], r[2], r[3], -1, 0);
    return out;
  },
});
