'use strict';
// LAHAN PERTANIAN GAYA SPROUT — aset lengkap kebun:
// - tanah garapan berbingkai kayu dengan alur bedengan (`farm_soil_<w>x<h>`), versi basah saat hujan/irigasi (`_wet`);
// - tanaman 4 tahap per benih: gundukan benih → kecambah → muda → siap panen (`crop_<benih>_0..3`):
//   seed = kubis/sayur, seed_b = semak beri, seed_h = daun obat, seed_flower = bunga;
// - properti: orang-orangan sawah, gembor (penyiram), karung benih, keranjang panen, talang irigasi (muncul bila
//   irigasi dipasang). Semua piksel 2× palet Sprout (SPROUT_PROPS), digambar sekali saat buildTextures.
const FARM_ART = {
  soil: { ol: '#6e4a36', dk: '#7f563c', md: '#946a48', lt: '#a87c56', hi: '#bd9168' },
  wet: { ol: '#4e3426', dk: '#5c3e2c', md: '#6c4a34', lt: '#7c5840', hi: '#8c6648' },
  leaf: { ol: '#3f6a3c', dk: '#55894a', md: '#6fa85a', lt: '#97c870', hi: '#bfe29a' },
  stages: ['seed', 'seed_b', 'seed_h', 'seed_flower'],
};
// tanah garapan: bingkai papan, alur bedengan mendatar tiap 12 px, gumpalan tanah acak
function farmSoilTex(sc, w, h, wet) {
  const k = 'farm_soil_' + w + 'x' + h + (wet ? '_wet' : ''); if (sc.textures.exists(k)) return k;
  const W = Math.ceil(w / 2) + 2, H = Math.ceil(h / 2) + 2, P = wet ? FARM_ART.wet : FARM_ART.soil, B = SPROUT_PROPS.W;
  const c = spProp(W, H, (r, p) => {
    r(0, 0, W, H, B.ol); r(1, 1, W - 2, H - 2, B.bs); r(1, 1, W - 2, 1, B.hi); r(1, H - 2, W - 2, 1, B.dk); /* bingkai papan */
    r(2, 2, W - 4, H - 4, P.ol); r(2, 3, W - 4, H - 5, P.md);
    for (let y = 3; y < H - 3; y += 6) { /* bedengan */
      r(3, y, W - 6, 1, P.lt); r(3, y + 1, W - 6, 2, P.md); r(3, y + 3, W - 6, 1, P.dk); r(3, y + 4, W - 6, 1, P.ol);
    }
    const rx = (i, s) => 3 + Math.floor(hash(i, 1, s) * (W - 6)), ry = (i, s) => 3 + Math.floor(hash(i, 2, s) * (H - 6));
    for (let i = 0; i < W * H / 14; i++) p(rx(i, 41), ry(i, 41), hash(i, 3, 41) < .5 ? P.hi : P.dk); /* gumpalan */
    if (wet) for (let i = 0; i < W * H / 40; i++) p(rx(i, 42), ry(i, 42), '#9cc8e0'); /* kilau basah */
  });
  sc.textures.addCanvas(k, c);
  return k;
}
// tanaman: n = tahap 0..3 (0 gundukan, 1 kecambah, 2 muda, 3 siap panen)
function farmCrop(seed, n) {
  const L = FARM_ART.leaf, S = FARM_ART.soil;
  return spProp(10, 12, (r, p) => {
    r(2, 10, 6, 2, S.ol); r(3, 10, 4, 1, S.lt); /* gundukan */
    if (n === 0) { p(4, 10, S.hi); p(5, 9, S.dk); return; }
    if (n === 1) { /* kecambah dua daun */
      r(4, 7, 1, 3, L.dk); r(2, 6, 2, 2, L.ol); r(5, 6, 2, 2, L.ol); p(2, 6, L.lt); p(6, 6, L.lt); p(3, 7, L.md); p(5, 7, L.md); return;
    }
    const blob = (cx, cy, rx, ry, ol, md, lt) => { /* gumpal bulat bergaris tepi, terang kiri-atas */
      for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / (ry + .5)) ** 2)); r(cx - w, cy + y, w * 2, 1, ol); }
      for (let y = -ry + 1; y <= ry - 1; y++) { const w = Math.round((rx - 1) * Math.sqrt(1 - (y / ry) ** 2)); r(cx - w, cy + y, w * 2, 1, md); }
      r(cx - Math.round(rx / 2), cy - ry + 1, Math.max(1, rx - 1), 1, lt); p(cx - Math.round(rx / 2), cy - ry + 2, lt);
    };
    if (seed === 'seed') { /* kubis: daun luar mengembang, kepala pucat di tengah saat siap panen */
      if (n === 2) { blob(5, 7, 4, 3, L.ol, L.md, L.lt); p(5, 6, L.dk); }
      else { blob(5, 6, 5, 4, L.ol, L.md, L.lt); blob(5, 6, 3, 2, '#7fa860', '#c8e8a0', '#e6f6c8'); p(5, 6, '#a8d080'); }
    } else if (seed === 'seed_b') { /* semak beri */
      if (n === 2) blob(5, 7, 4, 3, L.ol, L.md, L.lt);
      else {
        blob(5, 6, 5, 4, L.ol, L.md, L.lt);
        for (const [X, Y] of [[3, 5], [6, 4], [5, 7], [2, 7], [7, 7]]) { p(X, Y, '#c8304c'); p(X, Y - 1, '#e8607a'); } /* buah beri */
      }
    } else if (seed === 'seed_h') { /* daun obat: tangkai tegak berdaun runcing */
      const t = n === 3 ? 2 : 4;
      for (const X of [3, 5, 7]) { r(X, t + 1, 1, 9 - t, L.dk); r(X - 1, t + 2, 1, 2, L.lt); r(X + 1, t + 3, 1, 2, L.md); p(X, t, L.hi); }
      if (n === 3) for (const X of [3, 5, 7]) { p(X, t - 1, '#d8e8ff'); p(X - 1, t, '#a8c8f8'); } /* bunga kecil */
    } else { /* bunga */
      r(4, n === 3 ? 4 : 6, 2, n === 3 ? 6 : 4, L.dk); r(2, 8, 2, 1, L.md); r(6, 7, 2, 1, L.md);
      if (n === 2) { r(4, 4, 2, 2, L.lt); p(4, 4, '#f0a0c0'); }
      else { r(3, 0, 4, 4, '#c04a7a'); r(2, 1, 6, 2, '#c04a7a'); r(3, 1, 4, 2, '#f08ab4'); p(3, 1, '#fcd0e0'); r(4, 1, 2, 2, '#f6d860'); } /* mekar */
    }
  });
}
const FARM_PROPS = {
  scarecrow: () => spProp(14, 22, (r, p) => {
    const W = SPROUT_PROPS.W, H = SPROUT_PROPS.H;
    r(6, 8, 2, 14, W.ol); r(6, 8, 1, 13, W.md); r(4, 21, 6, 1, W.ol); /* tiang */
    r(0, 9, 14, 2, W.ol); r(1, 9, 12, 1, W.bs); /* palang */
    r(4, 3, 6, 5, H.ol); r(5, 4, 4, 3, H.lt); p(5, 5, '#3a2a20'); p(8, 5, '#3a2a20'); r(6, 6, 2, 1, '#c0485a'); /* kepala karung */
    r(2, 0, 10, 2, '#7a4a2e'); r(4, 0, 6, 1, '#a06a3e'); r(3, 2, 8, 1, '#5e3826'); /* topi caping */
    r(3, 9, 8, 8, '#4a6aa0'); r(4, 10, 6, 6, '#6a8ac8'); r(6, 12, 2, 2, '#e8c860'); r(3, 13, 8, 1, '#3a5a8a'); /* baju tambalan */
    for (const [X, Y] of [[1, 11], [12, 11], [4, 17], [9, 17]]) { p(X, Y, H.md); p(X, Y + 1, H.dk); } /* jerami menjuntai */
  }),
  watercan: () => spProp(11, 8, (r, p) => {
    const M = { ol: '#4e6470', md: '#7f9eae', lt: '#a8c4d2', hi: '#d6e8f0' };
    r(2, 2, 6, 6, M.ol); r(3, 3, 4, 4, M.md); r(3, 3, 1, 4, M.lt); p(3, 3, M.hi); /* badan */
    r(3, 0, 4, 1, M.ol); r(2, 1, 1, 2, M.ol); r(7, 1, 1, 2, M.ol); /* pegangan */
    r(8, 3, 1, 1, M.ol); r(9, 2, 1, 1, M.ol); r(10, 1, 1, 2, M.ol); p(10, 1, M.lt); /* corong */
  }),
  seedsack: () => spProp(10, 11, (r, p) => {
    const C = { ol: '#7a6040', md: '#c8aa78', lt: '#e0c898', dk: '#a88a5a' };
    r(2, 0, 6, 2, C.ol); r(3, 0, 4, 1, C.dk); r(1, 2, 8, 9, C.ol); r(2, 3, 6, 7, C.md); r(2, 3, 2, 6, C.lt); r(7, 4, 1, 6, C.dk); /* karung */
    r(3, 5, 4, 3, '#5a8a3a'); p(4, 6, '#9ad070'); p(5, 5, '#9ad070'); /* gambar daun */
    r(3, 1, 4, 1, '#8a5a32'); /* tali */
  }),
  basket: () => spProp(12, 9, (r, p) => {
    const W = SPROUT_PROPS.W;
    r(0, 3, 12, 6, W.ol); r(1, 4, 10, 4, W.bs); for (let X = 2; X < 11; X += 2) r(X, 4, 1, 4, W.md); r(1, 4, 10, 1, W.hi); /* anyaman */
    r(2, 1, 3, 3, '#e8782a'); r(5, 0, 3, 3, '#c8304c'); r(8, 1, 3, 3, '#8ac04a'); p(2, 1, '#ffb070'); p(5, 0, '#f07a8a'); p(8, 1, '#c8e88a'); /* hasil panen */
  }),
  trough: () => spProp(14, 6, (r, p) => {
    const W = SPROUT_PROPS.W;
    r(0, 0, 14, 6, W.ol); r(1, 1, 12, 3, '#5aa8d8'); r(1, 1, 12, 1, '#9ad6f4'); r(3, 2, 2, 1, '#d6f2ff'); r(1, 4, 12, 1, W.md); /* talang berisi air */
    r(1, 5, 2, 1, W.dk); r(11, 5, 2, 1, W.dk);
  }),
};
(() => {
  const _bt = buildTextures;
  buildTextures = function (sc) {
    const res = _bt.apply(this, arguments);
    if (!sc || !sc.textures) return res;
    try {
      for (const s of FARM_ART.stages) for (let n = 0; n < 4; n++) {
        const k = 'crop_' + s + '_' + n; if (!sc.textures.exists(k)) sc.textures.addCanvas(k, farmCrop(s, n));
      }
      for (const k in FARM_PROPS) if (!sc.textures.exists('farm_' + k)) sc.textures.addCanvas('farm_' + k, FARM_PROPS[k]());
    } catch (e) { console.warn('farm_art', e); }
    return res;
  };
  /* entri OBJ scarecrow/seedsack/basket/watercan ada di world/objects.js */
})();
// kebun memakai aset baru: tanah berbingkai, tanaman per tahap & jenis benih, talang irigasi
Object.assign(World.prototype, {
  spawnGarden() {
    this.garden = this.M.gardens.map((g, i) => {
      const [gx, gy, gw, gh] = g, spr = [], soil = this.add.image(gx, gy, farmSoilTex(this, gw, gh, false)).setOrigin(0).setDepth(-9e5 + 6);
      const cols = 3, rows = gh >= 40 ? 2 : 1;
      for (let k = 0; k < cols * rows; k++) {
        const X = gx + gw * ((k % cols) + .5) / cols, Y = gy + 8 + (gh - 10) * (Math.floor(k / cols) + .75) / rows;
        const im = this.add.image(Math.round(X), Math.round(Y), 'crop_seed_0').setOrigin(.5, 1).setDepth(Y).setVisible(false);
        spr.push(im);
      }
      const trough = this.add.image(gx + gw / 2, gy + gh + 9, 'farm_trough').setOrigin(.5, 1).setDepth(gy + gh + 9).setVisible(false);
      this.inter.push({ rect: [gx - 8, gy - 12, gw + 16, gh + 24], fn: () => this.tendPlot(i) });
      return { spr, soil, trough, g };
    });
    this.updGarden(true);
  },
  updGarden(force) {
    this.gT = (this.gT || 0) - this.dt; if (!force && this.gT > 0) return; this.gT = 1;
    const F = S.farm || {}, rain = this.weather === 'rain';
    this.garden.forEach((G, i) => {
      const p = S.garden[i], st = this.plotState(i), irr = F.irrig && F.irrig[this.M.id + i];
      const [gx, gy, gw, gh] = G.g, wet = rain || irr || (p && p.fast);
      G.soil.setTexture(farmSoilTex(this, gw, gh, !!wet)); G.trough.setVisible(!!irr);
      let n = 0; if (p) { const f = (gameHours() - p.t) / Math.max(.01, plotHours(p)); n = st === 'ripe' ? 3 : f < .15 ? 0 : f < .55 ? 1 : 2; }
      const key = 'crop_' + (p && FARM_ART.stages.includes(p.seed) ? p.seed : 'seed') + '_' + n;
      G.spr.forEach(s => { s.setVisible(st !== 'empty'); if (st !== 'empty') s.setTexture(key); });
    });
  },
});
