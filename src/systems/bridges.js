'use strict';
// JEMBATAN KAYU GAYA SPROUT — di titik penyeberangan lama (sungai Hutan M.river.bridge, jembatan kecil Danau).
// Tanah luar ruang kini dari gambar peta (tanpa jembatan), jadi jembatan digambar sebagai lapisan datar di atas air.
// Panjang & arah otomatis: dari kisi air grass_edge (Wm) dicari penyeberangan terpendek (mendatar / tegak) di titik itu.
const BRIDGES = {
  on: true, width: 48, depth: -9e5 + 3,
  list: { /* id peta → fungsi titik tengah [x, y] (koordinat lokal) */
    forest: M => { const R = M.river, x = (R.bridge[0] + R.bridge[1]) / 2; return [[x, riverY(R, x)]]; },
    lake: () => [[859, 711]],
  },
  wood: [[226, 180, 122], [204, 156, 100], [184, 136, 86], [160, 112, 68]], dark: [96, 58, 36], ol: [62, 38, 28], hi: [244, 212, 156],
};
// penyeberangan di (x, y): cari jalur air terpendek → { axis 'v'|'h', a, b } (a..b = rentang di sumbu jalan, piksel lokal)
function bridgeFit(M, x, y) {
  const E = typeof grassEdgeData === 'function' && grassEdgeData(M); if (!E || !E.Wm) return null;
  const S = GRASS_EDGE.cell, c0 = Math.floor(x / S), r0 = Math.floor(y / S);
  const W = (c, r) => c >= 0 && r >= 0 && c < E.cols && r < E.rows && E.Wm[r * E.cols + c];
  let rc = r0, cc = c0; /* titik tengah mungkin sedikit di luar air: geser ke sel air terdekat */
  if (!W(cc, rc)) {
    let best = null;
    for (let d = 1; d < 6 && !best; d++) for (const [i, j] of [[0, d], [0, -d], [d, 0], [-d, 0]]) if (W(c0 + i, r0 + j)) { best = [c0 + i, r0 + j]; break; }
    if (!best) return null; [cc, rc] = best;
  }
  const run = (dc, dr) => {
    let a = 0, b = 0; while (W(cc - dc * (a + 1), rc - dr * (a + 1)) && a < 40) a++; while (W(cc + dc * (b + 1), rc + dr * (b + 1)) && b < 40) b++;
    return [a, b];
  };
  const [va, vb] = run(0, 1), [ha, hb] = run(1, 0), v = va + vb <= ha + hb;
  /* ujung masuk 1,5 kotak ke daratan agar menempel ke tanah di kedua sisi */
  if (v) return { axis: 'v', c: cc * S + S / 2, a: (rc - va) * S - S * 1.5, b: (rc + vb + 1) * S + S * 1.5 };
  return { axis: 'h', c: rc * S + S / 2, a: (cc - ha) * S - S * 1.5, b: (cc + hb + 1) * S + S * 1.5 };
}
// gambar jembatan (piksel 2×): papan melintang, celah gelap, pagar kayu bertiang di kedua sisi
function bridgeArt(len, axis) {
  const P = BRIDGES, w = P.width / 2, L = Math.round(len / 2), vert = axis === 'v';
  const [c, x] = mk(vert ? w : L, vert ? L : w), im = x.createImageData(c.width, c.height), d = im.data;
  const put = (u, v, col) => { /* u = sepanjang jalan, v = melintang */
    const X = vert ? v : u, Y = vert ? u : v; if (X < 0 || Y < 0 || X >= c.width || Y >= c.height) return;
    const i = (Y * c.width + X) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255;
  };
  for (let u = 0; u < L; u++) for (let v = 3; v < w - 3; v++) { /* papan 4 px, tiap papan nada sendiri */
    const p = u % 4, k = Math.floor(u / 4), base = P.wood[Math.floor(hash(k, 3, 41) * 3)];
    let col = p === 3 ? P.dark : p === 0 ? P.wood[0] : base;
    if (p !== 3 && hash(k, Math.floor(v / 6), 42) < .08 && v % 6 === 2) col = P.wood[3]; /* serat/paku */
    put(u, v, col);
  }
  for (let u = 0; u < L; u++) { put(u, 3, P.ol); put(u, w - 4, P.ol); } /* tepi lantai */
  for (const v0 of [0, w - 3]) { /* pagar: balok 3 px (terang di sisi cahaya) */
    for (let u = 0; u < L; u++) { put(u, v0, P.ol); put(u, v0 + 1, v0 ? P.wood[2] : P.hi); put(u, v0 + 2, P.ol); }
    for (let u = 0; u < L; u += 12) { /* tiang */
      for (let k = 0; k < 4; k++) for (let j = -1; j < 4; j++) put(u + k, v0 + j, k === 0 || k === 3 || j === -1 || j === 3 ? P.ol : P.wood[1]);
      put(u + 1, v0, P.hi);
    }
  }
  for (let v = 0; v < w; v++) for (const u of [0, L - 1]) put(u, v, P.ol); /* ujung */
  x.putImageData(im, 0, 0);
  const [o, ox] = mk(c.width * 2, c.height * 2); ox.imageSmoothingEnabled = false; ox.drawImage(c, 0, 0, o.width, o.height); return o;
}
function bridgesFor(sc, M, ox, oy) {
  const f = BRIDGES.list[M.id]; if (!f || !BRIDGES.on) return;
  for (const [x, y] of f(M)) {
    const B = bridgeFit(M, x, y); if (!B) continue;
    const len = Math.max(48, B.b - B.a), key = 'bridge_' + B.axis + len;
    if (!sc.textures.exists(key)) sc.textures.addCanvas(key, bridgeArt(len, B.axis));
    const cx = B.axis === 'v' ? B.c : (B.a + B.b) / 2, cy = B.axis === 'v' ? (B.a + B.b) / 2 : B.c;
    sc.add.image(ox + cx, oy + cy, key).setDepth(BRIDGES.depth);
  }
}
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _up0 = W.update;
  W.update = function () {
    _up0.apply(this, arguments);
    if (this._brDone === this.M || !this.M) return; /* sekali per peta (scene dimulai ulang → M baru) */
    if (typeof grassEdgeData !== 'function') return;
    const M = this.M;
    try {
      if (M.benua) {
        for (const id in BRIDGES.list) if (MAPS[id] && WORLD_POS[id] && !grassEdgeData(MAPS[id])) return; /* tunggu gambar */
        for (const id in BRIDGES.list) if (MAPS[id] && WORLD_POS[id]) bridgesFor(this, MAPS[id], WORLD_POS[id][0], WORLD_POS[id][1]);
      }
      else { if (BRIDGES.list[M.id] && !grassEdgeData(M)) return; bridgesFor(this, M, 0, 0); }
    } catch (e) { BRIDGES.on = false; console.warn('bridges', e); }
    this._brDone = M;
  };
})();
