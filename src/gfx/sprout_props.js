'use strict';
// PROPERTI GAYA SPROUT — peti, tong, jerami, api unggun (4 frame), dermaga, perahu, papan tanda, pagar, lampu, pot bunga
// (i_pot dulu kosong = tak terlihat tapi menghalangi), akar & semak duri.
// Gambar lama (kotak/oval cokelat polos, diwarnai gelap oleh code_palette.js) diganti piksel 2× berpalet Sprout Lands
// (kayu #90625d–#e8cfa6 seperti tunggul/batang Sprout; dermaga & perahu sewarna jembatan bridges.js). Ukuran ≈ kanvas lama,
// jadi tabrakan & letak tidak berubah. Dipasang setelah buildTextures (dimuat paling akhir, setelah code_palette.js).
const SPROUT_PROPS = {
  on: true, scale: 2,
  W: { ol: '#7a4c47', dk: '#90625d', md: '#b68962', bs: '#c49a6c', lt: '#dcb98a', hi: '#e8cfa6' },
  B: { ol: '#5e3b2c', dk: '#8a5a3a', md: '#b0784a', bs: '#cc9a62', lt: '#e2b47a', hi: '#f4d49c' }, /* kayu jembatan */
  S: { ol: '#545959', dk: '#6b7470', md: '#818b83', lt: '#9da89a', hi: '#c1c8b9' },
  H: { ol: '#97703a', dk: '#b98d45', md: '#d6ad57', lt: '#e9cb72', hi: '#f6e3a0', tw: '#8a5a32' },
  F: ['#d9472b', '#f08a32', '#ffc94a', '#fff2b0'],
  G: { ol: '#4b6b4f', dk: '#5f7a79', md: '#6e967c', lt: '#97bb8e', hi: '#aed499', th: '#c49a6c' },
};
// kanvas asli w×h → 2×; d(r, p) menggambar dengan r(x, y, w, h, warna) & p(x, y, warna)
function spProp(w, h, d) {
  const [c, x] = mk(w, h);
  const r = (X, Y, W, H, col) => { x.fillStyle = col; x.fillRect(X, Y, W, H); }, p = (X, Y, col) => r(X, Y, 1, 1, col);
  p.ctx = x; /* untuk menempel potongan gambar */
  d(r, p);
  const s = SPROUT_PROPS.scale, [o, ox] = mk(w * s, h * s); ox.imageSmoothingEnabled = false; ox.drawImage(c, 0, 0, w * s, h * s);
  return o;
}
const SP_PROP_ART = {
  crate: () => spProp(9, 9, (r, p) => {
    const W = SPROUT_PROPS.W;
    r(0, 1, 9, 8, W.ol); r(1, 2, 7, 2, W.lt); r(1, 2, 7, 1, W.hi); r(1, 4, 7, 1, W.dk); /* tutup & tepi */
    r(1, 5, 7, 3, W.bs); r(1, 5, 1, 3, W.lt); r(7, 5, 1, 3, W.md); r(4, 5, 1, 3, W.md); /* muka depan & sambungan papan */
    p(2, 7, W.dk); p(3, 6, W.dk); p(5, 6, W.dk); p(6, 5, W.dk); /* palang */
  }),
  barrel: () => spProp(8, 9, (r, p) => {
    const W = SPROUT_PROPS.W, S = SPROUT_PROPS.S;
    r(1, 0, 6, 1, W.ol); r(0, 1, 8, 7, W.ol); r(1, 8, 6, 1, W.ol);
    r(1, 1, 6, 1, W.lt); r(2, 1, 4, 1, W.md); /* tutup */
    r(1, 2, 6, 5, W.bs); r(1, 2, 1, 5, W.lt); r(6, 2, 1, 5, W.md); r(4, 2, 1, 5, W.md); /* bilah */
    r(1, 3, 6, 1, S.md); r(1, 6, 6, 1, S.md); p(2, 3, S.hi); p(2, 6, S.hi); /* simpai */
    r(2, 7, 4, 1, W.dk);
  }),
  hay: () => spProp(13, 10, (r, p) => {
    const H = SPROUT_PROPS.H;
    r(1, 1, 11, 1, H.ol); r(0, 2, 13, 7, H.ol); r(1, 9, 11, 1, H.ol);
    r(1, 2, 11, 2, H.lt); r(2, 2, 9, 1, H.hi); r(1, 4, 11, 1, H.dk); r(1, 5, 11, 4, H.md); /* atas terang, muka depan */
    for (let i = 0; i < 14; i++) p(1 + Math.floor(hash(i, 1, 51) * 11), 5 + Math.floor(hash(i, 2, 51) * 4), i % 2 ? H.lt : H.dk); /* jerami */
    for (const X of [4, 8]) { r(X, 2, 1, 7, H.tw); p(X, 4, H.ol); } /* tali */
  }),
  sign: () => spProp(11, 11, (r, p) => {
    const W = SPROUT_PROPS.W;
    r(4, 6, 3, 5, W.ol); r(5, 6, 1, 4, W.md); /* tiang */
    r(0, 0, 11, 7, W.ol); r(1, 1, 9, 5, W.bs); r(1, 1, 9, 1, W.hi); r(1, 5, 9, 1, W.md);
    r(2, 3, 6, 1, W.dk); r(3, 4, 4, 1, W.dk); p(1, 1, W.lt); p(9, 1, W.lt); /* tulisan */
  }),
  fence: () => spProp(9, 7, (r, p) => {
    const W = SPROUT_PROPS.W;
    for (const X of [0, 6]) { r(X, 0, 3, 7, W.ol); r(X + 1, 1, 1, 5, W.lt); p(X + 1, 0, W.hi); } /* tiang */
    for (const Y of [1, 4]) { r(2, Y, 5, 2, W.ol); r(3, Y, 3, 1, W.bs); } /* palang */
  }),
  boat: () => spProp(22, 8, (r, p) => {
    const B = SPROUT_PROPS.B;
    r(3, 1, 16, 1, B.ol); r(1, 2, 20, 4, B.ol); r(3, 6, 16, 1, B.ol); p(0, 3, B.ol); p(0, 4, B.ol); p(21, 3, B.ol); p(21, 4, B.ol);
    r(3, 2, 16, 1, B.lt); r(2, 3, 18, 2, B.md); r(3, 5, 16, 1, B.dk); /* bibir & lambung dalam */
    r(4, 3, 14, 2, B.dk); for (const X of [7, 14]) r(X, 2, 2, 4, B.bs); /* dasar & bangku */
    r(5, 7, 12, 1, 'rgba(40,70,90,.35)'); /* bayang air */
  }),
  dock: () => spProp(22, 29, (r, p) => {
    const B = SPROUT_PROPS.B;
    for (const X of [2, 17]) { r(X, 23, 3, 6, B.ol); r(X + 1, 23, 1, 5, B.dk); } /* tiang pancang */
    r(0, 0, 22, 25, B.ol);
    for (let y = 1; y < 24; y += 3) { r(1, y, 20, 2, B.bs); r(1, y, 20, 1, B.lt); r(1 + Math.floor(hash(y, 1, 61) * 14), y + 1, 4, 1, B.md); }
    r(1, 0, 1, 25, B.dk); r(20, 0, 1, 25, B.dk); /* balok sisi */
    r(17, 0, 3, 4, B.ol); r(18, 0, 1, 3, B.lt); p(18, 0, B.hi); r(16, 2, 5, 1, B.md); /* tonggak tambat + tali */
  }),
  root: () => spProp(35, 17, (r, p) => {
    const W = SPROUT_PROPS.W;
    const pt = (cx, cy, rx, ry, a) => { const R = a * Math.PI / 180; return [Math.round(cx - Math.cos(R) * rx), Math.round(cy - Math.sin(R) * ry)]; };
    const arch = (cx, cy, rx, ry, t) => {
      for (let a = 0; a <= 180; a += 2) { const [X, Y] = pt(cx, cy, rx, ry, a); r(X - 1, Y - 1, t + 2, t + 2, W.ol); } /* garis luar */
      for (let a = 0; a <= 180; a += 2) { const [X, Y] = pt(cx, cy, rx, ry, a); r(X, Y, t, t, a < 90 ? W.md : W.dk); if (a > 30 && a < 120) p(X, Y, W.lt); }
    };
    arch(17, 15, 14, 12, 3); /* lengkung akar */
    r(1, 13, 5, 3, W.ol); r(29, 13, 5, 3, W.ol); r(2, 14, 3, 1, W.md); r(30, 14, 3, 1, W.dk); /* pangkal menancap */
  }),
  lamp: () => spProp(6, 15, (r, p) => {
    const W = SPROUT_PROPS.W, M = '#5b4a52';
    r(1, 0, 4, 1, M); r(0, 1, 6, 1, M); /* atap */
    r(0, 2, 6, 4, M); r(1, 2, 4, 3, '#ffd77e'); r(1, 2, 2, 1, '#fff2c4'); p(4, 4, '#f0b452'); /* kaca bercahaya */
    r(0, 5, 6, 1, M); r(1, 6, 4, 9, W.ol); r(2, 6, 1, 8, W.lt); r(3, 6, 1, 8, W.md); /* tiang kayu */
    r(0, 13, 6, 2, W.ol); r(1, 13, 4, 1, W.dk); /* kaki */
  }),
  i_pot: () => spProp(12, 14, (r, p) => {
    const T = { ol: '#8a4a3a', dk: '#b05e44', md: '#cc7650', lt: '#e09468', hi: '#f2b48a' }, G = SPROUT_PROPS.G;
    r(3, 1, 6, 6, G.ol); r(1, 3, 10, 4, G.ol); r(4, 2, 4, 4, G.md); r(2, 4, 8, 2, G.md); r(4, 2, 2, 2, G.lt); p(4, 2, G.hi); /* daun */
    r(7, 3, 2, 2, '#e88aa0'); p(7, 3, '#f8c0cc'); r(3, 5, 2, 1, G.lt); /* bunga */
    r(1, 7, 10, 2, T.ol); r(2, 7, 8, 1, T.lt); r(2, 8, 8, 1, T.dk); /* bibir pot */
    r(2, 9, 8, 4, T.ol); r(3, 9, 6, 4, T.md); r(3, 9, 1, 4, T.lt); r(8, 9, 1, 4, T.dk); r(3, 13, 6, 1, T.ol); /* badan */
  }),
  stalag: () => spProp(10, 14, (r, p) => {
    const S = SPROUT_PROPS.S;
    for (let y = 0; y < 13; y++) {
      const hw = Math.round(1 + y * .32); r(5 - hw, y, hw * 2, 1, S.ol); if (hw > 1) r(6 - hw, y, hw * 2 - 2, 1, S.md);
    }
    for (let y = 2; y < 12; y++) { const hw = Math.round(1 + y * .32); p(6 - hw, y, S.lt); if (y > 4) p(4 + Math.round(hw / 2), y, S.dk); }
    p(4, 1, S.hi); p(4, 2, S.hi); r(1, 13, 8, 1, S.ol); r(2, 12, 6, 1, S.dk); /* pucuk terang, pangkal */
  }),
  stele: () => spProp(9, 12, (r, p) => {
    const S = SPROUT_PROPS.S;
    r(2, 0, 5, 1, S.ol); r(1, 1, 7, 10, S.ol); r(0, 10, 9, 2, S.ol);
    r(2, 1, 5, 9, S.md); r(2, 1, 1, 9, S.lt); r(3, 1, 3, 1, S.hi); r(6, 2, 1, 8, S.dk); r(1, 10, 7, 1, S.dk); /* batu */
    r(3, 3, 3, 1, '#7fa6b8'); p(4, 4, '#7fa6b8'); r(3, 6, 3, 1, '#7fa6b8'); p(3, 7, '#9fc6d4'); /* rune pudar */
  }),
  bones: () => spProp(10, 5, (r, p) => {
    const B = { ol: '#9c8a74', md: '#e6dcc4', hi: '#fbf5e6' };
    r(0, 1, 6, 4, B.ol); r(1, 2, 4, 2, B.md); r(1, 2, 4, 1, B.hi); p(0, 1, B.md); p(5, 1, B.md); p(0, 4, B.md); p(5, 4, B.md); /* tulang */
    r(6, 0, 4, 4, B.ol); r(7, 1, 2, 2, B.md); p(7, 1, B.hi); p(8, 2, '#5a4c40'); r(6, 4, 3, 1, B.ol); /* tengkorak kecil */
  }),
  dummy: () => spProp(10, 14, (r, p) => {
    const W = SPROUT_PROPS.W, H = SPROUT_PROPS.H;
    r(4, 9, 2, 5, W.ol); r(4, 9, 1, 4, W.md); r(2, 13, 6, 1, W.ol); /* tiang */
    r(3, 0, 4, 4, H.ol); r(4, 1, 2, 2, H.md); p(4, 1, H.hi); /* kepala jerami */
    r(0, 4, 10, 2, W.ol); r(1, 4, 8, 1, W.bs); /* palang lengan */
    r(2, 4, 6, 6, H.ol); r(3, 5, 4, 4, H.md); r(3, 5, 4, 1, H.lt); r(2, 7, 6, 1, H.tw); /* badan + tali */
    p(5, 6, '#c0485a'); /* sasaran */
  }),
  i_bench: () => spProp(24, 17, (r, p) => {
    const W = SPROUT_PROPS.W;
    for (const X of [2, 19]) { r(X, 10, 3, 7, W.ol); r(X + 1, 10, 1, 6, W.md); } /* kaki */
    r(0, 0, 24, 5, W.ol); r(1, 1, 22, 3, W.bs); r(1, 1, 22, 1, W.hi); r(1, 3, 22, 1, W.md); /* sandaran */
    r(0, 6, 24, 5, W.ol); r(1, 7, 22, 3, W.lt); r(1, 7, 22, 1, W.hi); r(1, 9, 22, 1, W.md); /* dudukan */
    for (const X of [3, 20]) r(X, 4, 1, 3, W.dk);
  }),
  shrine: () => spProp(60, 35, (r, p) => {
    const S = SPROUT_PROPS.S, G = ['#8fd8e8', '#bfeef4', '#e8fbff'];
    const ell = (cx, cy, rx, ry, col) => {
      for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y / ry) ** 2)); r(cx - w, cy + y, w * 2, 1, col); }
    };
    ell(30, 25, 27, 9, S.ol); ell(30, 24, 26, 8, S.dk); ell(30, 23, 25, 7, S.md); ell(30, 23, 19, 5, S.ol); /* cincin batu */
    ell(30, 23, 18, 4, G[0]); ell(30, 22, 12, 2, G[1]); r(26, 22, 6, 1, G[2]); /* kolam cahaya */
    for (let a = 0; a < 12; a++) { const R = a / 12 * 6.283, X = Math.round(30 + Math.cos(R) * 22), Y = Math.round(23 + Math.sin(R) * 6); p(X, Y, S.hi); }
    for (const X of [4, 53]) { /* tiang lentera */
      r(X, 4, 3, 21, S.ol); r(X + 1, 5, 1, 19, S.lt); r(X - 1, 22, 5, 3, S.ol);
      r(X - 1, 0, 5, 5, S.ol); r(X, 1, 3, 3, '#ffe9a0'); p(X, 1, '#fff8d8');
    }
  }),
  bramble: () => spProp(11, 9, (r, p) => {
    const G = SPROUT_PROPS.G;
    r(1, 2, 9, 6, G.ol); r(2, 1, 7, 8, G.ol); r(2, 2, 7, 6, G.md); r(3, 2, 5, 2, G.lt); p(4, 2, G.hi); r(2, 6, 7, 1, G.dk);
    for (const [X, Y] of [[1, 3], [9, 4], [5, 0], [0, 6], [10, 6], [7, 8]]) p(X, Y, G.th); /* duri */
    p(6, 4, '#c0485a'); p(3, 5, '#c0485a'); /* buah beri */
  }),
};
// api unggun 4 frame: batu melingkar + kayu bersilang + lidah api bergerak
function spCampfire(f) {
  return spProp(14, 13, (r, p) => {
    const S = SPROUT_PROPS.S, W = SPROUT_PROPS.W, F = SPROUT_PROPS.F;
    for (let a = 0; a < 360; a += 30) { const R = a * Math.PI / 180, X = Math.round(7 + Math.cos(R) * 5.6) - 1, Y = Math.round(10 + Math.sin(R) * 2.2) - 1;
      r(X, Y, 3, 2, S.ol); p(X + 1, Y, a > 180 ? S.hi : S.lt); }
    r(3, 9, 8, 2, W.ol); r(4, 9, 6, 1, W.md); r(5, 8, 4, 3, W.ol); r(6, 8, 2, 2, W.bs); /* kayu */
    const hgt = [3, 5, 7, 6, 4, 2], cols = [4, 5, 6, 7, 8, 9];
    cols.forEach((X, i) => {
      const h = hgt[i] + Math.round(Math.sin(f * 1.6 + i * 1.3) * 1.2);
      for (let k = 0; k < h; k++) { const Y = 9 - k, t = k / Math.max(1, h - 1), edge = i === 0 || i === 5;
        p(X, Y, edge || t > .75 ? F[0] : t > .45 ? F[1] : i > 1 && i < 4 && t < .3 ? F[3] : F[2]); }
    });
  });
}
// semak berbunga (bushW putih, bushP merah muda) = semak Sprout + bunga kecil, dipakai lewat SPROUT_DECO.swap
function spFlowerBush(petal, core) {
  const im = typeof IMGEL !== 'undefined' && IMGEL.deco_sprout_objs; if (!im) return null;
  return spProp(16, 16, (r, p) => {
    p.ctx.drawImage(im, 16, 48, 16, 16, 0, 0, 16, 16);
    for (const [X, Y] of [[4, 5], [10, 4], [7, 8], [3, 10], [11, 10]]) { /* bunga plus: kelopak 4 + putik */
      for (const [i, j] of [[0, -1], [-1, 0], [1, 0], [0, 1]]) p(X + i, Y + j, petal);
      p(X, Y, core);
    }
  });
}
const _buildTexturesProps = buildTextures;
buildTextures = function (sc) {
  const res = _buildTexturesProps.apply(this, arguments);
  if (!SPROUT_PROPS.on || !sc || !sc.textures) return res;
  const T = sc.textures;
  try {
    for (const k in SP_PROP_ART) { const c = SP_PROP_ART[k](); if (T.exists(k)) T.remove(k); T.addCanvas(k, c); }
    for (const [k, a, b] of [['spBushW', '#f4f1e6', '#f2c85a'], ['spBushP', '#f0a0c0', '#fbe08a'], ['spBushB', '#9cc4f0', '#f4f1e6']]) {
      const c = spFlowerBush(a, b); if (!c) continue; if (T.exists(k)) T.remove(k); T.addCanvas(k, c);
    }
    const sw = { bushW: 'spBushW', bushP: 'spBushP', bushP2: 'spBushP', bushv: 'spBushB', bushy: 'spBushP' };
    if (typeof SPROUT_DECO !== 'undefined') Object.assign(SPROUT_DECO.swap, sw);
    const fr = [0, 1, 2, 3].map(spCampfire), w = fr[0].width, h = fr[0].height, [cv, x] = mk(w * 4, h);
    fr.forEach((c, i) => x.drawImage(c, i * w, 0));
    if (T.exists('campfire')) T.remove('campfire');
    const t = T.addCanvas('campfire', cv); for (let i = 0; i < 4; i++) t.add(i, 0, i * w, 0, w, h);
    if (sc.anims.exists('campfire_burn')) sc.anims.remove('campfire_burn');
    sc.anims.create({ key: 'campfire_burn', frames: [0, 1, 2, 3].map(i => ({ key: 'campfire', frame: i })), frameRate: 7, repeat: -1 });
  } catch (e) { SPROUT_PROPS.on = false; console.warn('sprout_props', e); }
  return res;
};
(() => {
  if (typeof OBJ_SPAWN === 'undefined') return;
  const c0 = OBJ_SPAWN.campfire;
  OBJ_SPAWN.campfire = function (s, x) {
    if (SPROUT_PROPS.on && s.anims && this.anims.exists('campfire_burn')) s.play({ key: 'campfire_burn', startFrame: Math.abs(Math.round(x)) % 4 });
    return c0 ? c0.apply(this, arguments) : undefined;
  };
})();
