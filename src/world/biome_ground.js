'use strict';
// TANAH BIOME — rumput Sprout di wilayah khas diberi warna biomenya (dipakai grassEdgeCanvas, grass_edge.js):
//   snow  = salju (rumput → putih kebiruan, terang-gelap & bentuk tepi petak tetap), jalan = tanah beku keabu-abuan;
//   swamp = rumput rawa zaitun-keruh, jalan = lumpur gelap.
// Warna diambil dari kecerahan piksel rumput hasil autotile (tangga warna `ramp`, gelap→terang), jadi bercak & bayangan
// tepi petak ikut terbaca. Di tepi peta yang bersambung ke wilayah lain, biome memudar berbentuk bercak sepanjang `fade` px
// (bukan garis lurus) sehingga peralihan ke Padang Angin / Hutan terlihat alami.
const BIOME = {
  on: true,
  snow: {
    ramp: [[120, 140, 168], [168, 188, 210], [206, 220, 234], [232, 240, 247], [250, 252, 255]],
    dirt: { base: [176, 168, 164], dark: [146, 138, 140], mid: [160, 152, 152], light: [204, 198, 196] }, fade: 200,
  },
  swamp: {
    ramp: [[52, 72, 50], [76, 98, 62], [98, 120, 72], [122, 142, 86], [150, 164, 104]],
    dirt: { base: [120, 98, 72], dark: [92, 74, 56], mid: [106, 86, 64], light: [140, 118, 88] }, fade: 200,
  },
  lum: [60, 215], /* rentang kecerahan rumput → ujung tangga */
};
// tanah musiman (musim dari season.js): gugur = rumput keemasan + daun gugur, dingin = bercak salju; wilayah ber-biome sendiri tetap
BIOME.season = {
  gugur: { ramp: [[86, 92, 40], [128, 124, 50], [170, 148, 60], [204, 170, 78], [228, 198, 108]], patch: .3, fade: 0,
    dots: [[214, 104, 44], [190, 70, 40], [232, 160, 60]], dotP: .03 },
  dingin: { ramp: [[150, 168, 196], [190, 206, 224], [222, 232, 242], [240, 245, 250], [252, 253, 255]], patch: .46, fade: 0 },
};
const biomeSeasonId = () => {
  try { return typeof seasonIdx === 'function' && typeof S !== 'undefined' && S ? SEASONS[seasonIdx()].id : ''; } catch (e) { return ''; }
};
function biomeOf(M) {
  if (!BIOME.on || !M) return null;
  const own = BIOME[M.id] || BIOME[M.ground]; if (own) return own;
  return M.indoor ? null : BIOME.season[biomeSeasonId()] || null;
}
// sisi peta yang bersambung ke wilayah lain, per potongan 32 px → jarak ke tepi itu menentukan pudar
function biomeSides(M) {
  if (M._bioS) return M._bioS;
  const P = typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id], own = typeof regionOwner === 'function';
  const seg = n => new Uint8Array(Math.ceil(n / 32) + 1), S = { t: seg(M.w), b: seg(M.w), l: seg(M.h), r: seg(M.h) };
  if (P && own && typeof BENUA !== 'undefined' && BENUA) {
    for (let i = 0; i < S.t.length; i++) { const x = P[0] + i * 32 + 16; S.t[i] = !!regionOwner(x, P[1] - 24); S.b[i] = !!regionOwner(x, P[1] + M.h + 24); }
    for (let i = 0; i < S.l.length; i++) { const y = P[1] + i * 32 + 16; S.l[i] = !!regionOwner(P[0] - 24, y); S.r[i] = !!regionOwner(P[0] + M.w + 24, y); }
  }
  return (M._bioS = S);
}
// 1 = biome penuh, 0 = rumput biasa (bercak berderau di dekat tepi yang bersambung)
function biomeMask(M, B, lx, ly, X, Y) {
  if (B.patch) return vnoise(X, Y, 130, 81) * .7 + vnoise(X, Y, 28, 82) * .3 > B.patch ? 1 : 0; /* musim: bercak */
  const S = biomeSides(M), f = B.fade;
  let d = f;
  if (S.t[(lx / 32) | 0]) d = Math.min(d, ly);
  if (S.b[(lx / 32) | 0]) d = Math.min(d, M.h - ly);
  if (S.l[(ly / 32) | 0]) d = Math.min(d, lx);
  if (S.r[(ly / 32) | 0]) d = Math.min(d, M.w - lx);
  if (d >= f) return 1;
  return d / f + (vnoise(X, Y, 40, 77) - .5) * .9 + (vnoise(X, Y, 12, 78) - .5) * .25 > .5 ? 1 : 0;
}
function biomeRamp(B, r, g, b, o) {
  const R = B.ramp, L = .3 * r + .59 * g + .11 * b, t = Math.max(0, Math.min(.999, (L - BIOME.lum[0]) / (BIOME.lum[1] - BIOME.lum[0]))) * (R.length - 1);
  const k = t | 0, u = t - k, A = R[k], C = R[k + 1];
  o[0] = A[0] + (C[0] - A[0]) * u; o[1] = A[1] + (C[1] - A[1]) * u; o[2] = A[2] + (C[2] - A[2]) * u;
  return o;
}
// daun gugur di atas rumput (titik 2×2 piksel)
function biomeDot(B, X, Y, o) {
  if (!B.dots || hash(X >> 1, Y >> 1, 83) >= B.dotP) return false;
  const c = B.dots[Math.floor(hash(X >> 1, Y >> 1, 84) * B.dots.length)]; o[0] = c[0]; o[1] = c[1]; o[2] = c[2];
  return true;
}
