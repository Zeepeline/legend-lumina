'use strict';
// POHON GAYA SPROUT LANDS — pohon biasa di wilayah luar (GRASS_EDGE.maps) memakai pohon dari deco_sprout_objs.png (3×),
// dengan varian warna per jenis (gelap hutan, salju, rawa) & goyang angin buatan kode (8 frame: tajuk bergeser, batang diam).
// Jenis & perilaku objek tidak berubah (tabrakan, pudar saat di belakang, bayangan) — hanya tekstur & animasinya.
// Kunci tekstur pohon lama (i_treeA, treeAd, apel, jeruk, redwood, …) dialihkan ke pohon Sprout (SPROUT_TREE_ALIAS); gambar lama dihapus.
const SPROUT_TREES = {
  on: true, scale: 3, frames: 8, amp: 2, fps: 5,
  src: { big: [20, 1, 24, 31], tall: [1, 0, 14, 29] }, /* potongan lembar [x, y, w, h] */
  // jenis objek → [bentuk, varian warna]
  map: { treeA: ['big', ''], treeB: ['big', ''], verdant_tree: ['big', ''], bigtree: ['big', ''], pine: ['tall', ''],
    treeAd: ['big', 'd'], treeBd: ['big', 'd'], pined: ['tall', 'd'], treeSn: ['big', 'sn'], treeSw: ['big', 'sw'],
    treeRedwood: ['giant', 'd'], tree_redwood: ['giant', 'd'], treeWoodsRound: ['big', 'd'], treeWoodsPine: ['tall', 'd'],
    treeOak: ['big', ''], treePine: ['tall', ''], meadowwillow: ['big', 'sw'] },
};
// warna tajuk (piksel hijau) per varian
function sproutTreeTint(v, r, g, b) {
  if (v === 'fa' || v === 'fb' || v === 'fo') return [r, g, b]; /* pohon buah: daun asli */
  if (v === 'd') return [r * .74, g * .8, b * .86];
  if (v === 'sw') return [r * .82, g * .8, b * .66];
  if (v === 'sn') { /* salju: gelap-terang tajuk diperkuat → biru keabu (bayangan) sampai putih (salju) */
    const L = Math.min(1, Math.max(0, ((r + g + b) / 765 - .42) / .32));
    return [128 + 122 * L, 150 + 104 * L, 176 + 78 * L];
  }
  return [r, g, b];
}
// sedikit polesan di piksel asli (sebelum 3×): gerombol daun terang di atas, daun gelap di bawah, garis kulit kayu & bayangan tajuk di batang
function sproutTreePolish(d, w, h) {
  const at = (x, y) => (y * w + x) * 4;
  const leaf = (x, y) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return 0; const i = at(x, y); return d[i + 3] > 128 && d[i + 1] > d[i] + 4 && d[i + 1] >= d[i + 2];
  };
  const bark = (x, y) => { const i = at(x, y); return d[i + 3] > 128 && d[i] > d[i + 1] && d[i + 1] > d[i + 2] && d[i] - d[i + 2] > 40; };
  const add = (x, y, k) => { const i = at(x, y); for (let j = 0; j < 3; j++) d[i + j] = Math.max(0, Math.min(255, d[i + j] + k)); };
  let top = h, bot = 0; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (leaf(x, y)) { top = Math.min(top, y); bot = Math.max(bot, y); }
  for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 2; x++) {
    if (!(leaf(x, y) && leaf(x + 1, y) && leaf(x - 1, y) && leaf(x, y - 1) && leaf(x, y + 1) && leaf(x + 1, y + 1))) continue;
    const t = (y - top) / Math.max(1, bot - top), r = hash(x, y, 77);
    if (t < .6 && r < .14 && x < w * .75) { add(x, y, 30); add(x + 1, y, 20); } /* gerombol daun kena cahaya (kiri-atas) */
    else if (t > .45 && r > .86) { add(x, y, -24); add(x + 1, y + 1, -16); } /* daun dalam bayangan */
  }
  const cols = []; for (let x = 0; x < w; x++) for (let y = 0; y < h; y++) if (bark(x, y)) { cols.push(x); break; }
  const cx = cols.length ? cols[Math.floor(cols.length / 2)] : -1;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!bark(x, y)) continue;
    { const i = at(x, y); d[i] *= .9; d[i + 1] *= .8; d[i + 2] *= .74; } /* batang cokelat lebih hangat & tua */
    if (leaf(x, y - 1) || leaf(x, y - 2)) add(x, y, -34); /* bayangan tajuk di pangkal atas batang */
    else if (x === cx - 1 && y % 3 !== 0) add(x, y, -24); /* garis kulit kayu */
    else if (x === cx + 1 && y % 3 === 1) add(x, y, 18); /* kilap kulit kayu */
  }
}
// pohon raksasa (pengganti redwood) digambar kode di piksel asli 40×78 dengan palet tajuk dari pohon Sprout besar:
// batang + akar menjalar + lumut, dahan di sela tajuk, gumpal daun berlapis (lengkung gelap & tepi terang), rumput di kaki
function sproutGiantSrc(im) {
  const w = 40, h = 78, cx = 20, [c, x] = mk(w, h), out = x.createImageData(w, h), d = out.data;
  const [, px] = mk(24, 31); px.drawImage(im, 20, 1, 24, 31, 0, 0, 24, 31); const pd = px.getImageData(0, 0, 24, 31).data, gs = [];
  for (let i = 0; i < pd.length; i += 4) {
    if (pd[i + 3] > 128 && pd[i + 1] > pd[i] + 4 && !gs.some(g => g[0] === pd[i] && g[1] === pd[i + 1])) gs.push([pd[i], pd[i + 1], pd[i + 2]]);
  }
  gs.sort((a, b) => (a[0] + a[1] + a[2]) - (b[0] + b[1] + b[2]));
  const gq = t => gs[Math.min(gs.length - 1, Math.max(0, Math.round(t * (gs.length - 1))))];
  const put = (X, Y, col, a = 255) => {
    X = Math.round(X); Y = Math.round(Y); if (X < 0 || Y < 0 || X >= w || Y >= h) return;
    const i = (Y * w + X) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = a;
  };
  const line = (x0, y0, x1, y1, col, th = 1) => {
    const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0) * 2);
    for (let k = 0; k <= n; k++) { const t = k / n, X = x0 + (x1 - x0) * t, Y = y0 + (y1 - y0) * t; for (let o = 0; o < th; o++) put(X + o, Y, col); }
  };
  const BK = { o: [74, 40, 36], d: [112, 56, 42], m: [148, 80, 56], l: [180, 104, 72] }, MOSS = [110, 140, 72], MOSS2 = [140, 170, 88];
  for (let Y = 70; Y < 78; Y++) for (let X = 2; X < 38; X++) { /* bayangan tanah */
    const e = ((X - cx) / 17) ** 2 + ((Y - 73.5) / 3.8) ** 2; if (e < 1) put(X, Y, [60, 90, 50], 70);
  }
  // akar menjalar (garis tepi dulu, isi di atasnya)
  const roots = [[cx - 3, 64, cx - 12, 74], [cx + 3, 64, cx + 12, 74], [cx - 1, 67, cx - 4, 76], [cx + 2, 67, cx + 6, 75]];
  for (const [a0, b0, a1, b1] of roots) { line(a0 - 1, b0, a1 - 1, b1, BK.o, 4); }
  for (const [a0, b0, a1, b1] of roots) { line(a0, b0, a1, b1, BK.m, 2); line(a0, b0 - 1, a1, b1 - 1, BK.l, 1); }
  // batang
  for (let Y = 32; Y < 72; Y++) {
    const half = Y > 63 ? 4.5 + (Y - 63) * .6 : 4.5;
    for (let X = Math.round(cx - half); X <= Math.round(cx - 1 + half); X++) {
      const edge = X === Math.round(cx - half) || X === Math.round(cx - 1 + half), rel = (X - (cx - half)) / (2 * half);
      let col = edge ? BK.o : rel < .28 ? BK.l : rel > .72 ? BK.d : BK.m;
      if (!edge && (X === cx - 1 || X === cx + 2) && (Y + X) % 5 < 3) col = BK.d; /* alur kulit kayu */
      if (!edge && Y > 62 && hash(X, Y, 81) < (Y - 62) / 14 && X < cx + 1) col = hash(X, Y, 82) < .5 ? MOSS : MOSS2; /* lumut di pangkal */
      put(X, Y, col);
    }
  }
  // lapisan daun dalam (gelap) di belakang gumpal: menutup semua rongga tajuk
  const clumps = [[cx, 9, 7.5], [cx - 8, 17, 7], [cx + 8, 18, 7], [cx, 23, 7.5], [cx - 11, 31, 6.2], [cx + 11, 32, 6.2], [cx - 4, 37, 6], [cx + 5, 38, 5.6]];
  const inMass = (X, Y) => clumps.some(([ox, oy, r]) => Math.hypot(X + .5 - ox, Y + .5 - oy) <= r + 1.5) ||
    ((X + .5 - cx) / 15) ** 2 + ((Y + .5 - 24) / 17) ** 2 <= 1;
  for (let Y = 0; Y < 46; Y++) for (let X = 0; X < w; X++) {
    if (!inMass(X, Y)) continue;
    const rim = !inMass(X - 1, Y) || !inMass(X + 1, Y) || !inMass(X, Y - 1) || !inMass(X, Y + 1);
    put(X, Y, rim ? gq(0) : hash(X, Y, 85) < .12 ? gq(.28) : gq(.14));
  }
  // dahan (terlihat di sela gumpal daun)
  for (const [x0, y0, x1, y1] of [[cx, 46, cx - 11, 35], [cx, 44, cx + 11, 36], [cx, 36, cx - 9, 23], [cx, 34, cx + 9, 24], [cx, 28, cx, 14]]) {
    line(x0, y0 + 1, x1, y1 + 1, BK.o, 2); line(x0, y0, x1, y1, BK.d, 2);
  }
  // gumpal daun berlapis (atas dulu, bawah menimpa → lapisan)
  for (const [ox, oy, r] of clumps) for (let Y = Math.floor(oy - r); Y <= oy + r; Y++) for (let X = Math.floor(ox - r); X <= ox + r; X++) {
    const dx = X + .5 - ox, dy = Y + .5 - oy, dd = Math.hypot(dx, dy); if (dd > r) continue;
    const lit = (-dx - dy) / (r * 1.4); let t = .45 + lit * .45 + (dd < r * .5 ? .05 : 0);
    if (dy > 0 && Math.abs(dd - r * .58) < .6) t -= .3; /* lengkung daun berlapis (gelap) */
    if (dy < -r * .3 && dd > r - 2.2 && dd <= r - 1 && (X + Y) % 3) t += .25; /* tepi atas kena cahaya */
    put(X, Y, dd > r - 1 ? gq(0) : gq(t));
  }
  // rumput kecil di kaki pohon
  const GR = gq(.6), GR2 = gq(.85);
  for (let k = 0; k < 9; k++) {
    const X = Math.round(4 + hash(k, 1, 83) * 32), Y = Math.round(72 + hash(k, 2, 83) * 4); if (Math.abs(X - cx) < 4) continue;
    put(X, Y, GR); put(X, Y - 1, GR2); if (hash(k, 3, 83) < .5) { put(X - 1, Y, GR); put(X + 1, Y - 1, GR); }
  }
  x.putImageData(out, 0, 0); return c;
}
// buah di tajuk (piksel asli): apel merah (fa), jeruk oranye (fo), apel belum berbuah = kuncup hijau muda (fb)
function sproutFruit(d, w, h, v) {
  const C = v === 'fa' ? [[214, 52, 52], [246, 120, 104]] : v === 'fo' ? [[236, 132, 34], [252, 196, 92]] : [[164, 206, 96], [196, 232, 128]];
  const leaf = (x, y) => { if (x < 1 || y < 1 || x >= w - 1 || y >= h - 1) return 0; const i = (y * w + x) * 4; return d[i + 3] > 128 && d[i + 1] > d[i] + 4; };
  let n = 0;
  for (let y = 2; y < h * .72 && n < 9; y++) for (let x = 2; x < w - 2 && n < 9; x++) {
    if (hash(x, y, 79) > (v === 'fb' ? .05 : .07)) continue;
    if (!(leaf(x, y) && leaf(x + 1, y) && leaf(x, y + 1) && leaf(x + 1, y + 1) && leaf(x - 1, y) && leaf(x, y - 1))) continue;
    for (const [dx, dy, k] of [[0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 1, 0]]) {
      const i = ((y + dy) * w + x + dx) * 4; d[i] = C[k][0]; d[i + 1] = C[k][1]; d[i + 2] = C[k][2];
    }
    n++;
  }
}
// rumput kecil di kaki pohon biasa (piksel asli, setelah dipotong dari lembar)
function sproutTreeTufts(d, w, h, seed) {
  const bark = (x, y) => { const i = (y * w + x) * 4; return d[i + 3] > 128 && d[i] > d[i + 1] && d[i + 1] > d[i + 2]; };
  let ty = -1, l = w, r = 0;
  for (let y = h - 1; y >= 0 && ty < 0; y--) for (let x = 0; x < w; x++) if (bark(x, y)) ty = y;
  if (ty < 0) return;
  for (let x = 0; x < w; x++) if (bark(x, ty)) { l = Math.min(l, x); r = Math.max(r, x); }
  const put = (X, Y, c) => {
    if (X < 0 || Y < 0 || X >= w || Y >= h) return; const i = (Y * w + X) * 4; if (d[i + 3] > 128 && !(d[i + 1] > d[i])) return;
    d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = 255;
  };
  for (const [X, k] of [[l - 1, 0], [r + 1, 1], [l - 3, 2], [r + 3, 3]]) {
    if (hash(seed, k, 84) < .3) continue; put(X, ty, [120, 162, 72]); put(X, ty - 1, [156, 196, 96]);
  }
}
// tekstur strip 8 frame + anim '<key>_sway' (sekali untuk seluruh game)
function sproutTreeTex(sc, shape, v) {
  const key = 'spTree_' + shape + (v ? '_' + v : ''), T = sc.textures;
  if (T.exists(key)) return key;
  const im = IMGEL.deco_sprout_objs; if (!im) return null;
  const [sx, sy, sw, sh] = SPROUT_TREES.src[shape] || [0, 0, 40, 78], S = SPROUT_TREES.scale, W = sw * S, H = sh * S;
  const P = SPROUT_TREES.amp + 1, F = SPROUT_TREES.frames;
  const gi = shape === 'giant', [s1, x1] = mk(sw, sh);
  x1.drawImage(gi ? sproutGiantSrc(im) : im, gi ? 0 : sx, gi ? 0 : sy, sw, sh, 0, 0, sw, sh);
  const one = x1.getImageData(0, 0, sw, sh); sproutTreePolish(one.data, sw, sh);
  if (v && v[0] === 'f') sproutFruit(one.data, sw, sh, v);
  if (!gi) sproutTreeTufts(one.data, sw, sh, sw);
  x1.putImageData(one, 0, 0);
  const [b0, x0] = mk(W, H); x0.imageSmoothingEnabled = false; x0.drawImage(s1, 0, 0, W, H);
  const base = x0.getImageData(0, 0, W, H), d = base.data;
  for (let i = 0; i < d.length; i += 4) {
    if (!d[i + 3] || !(d[i + 1] > d[i] + 4 && d[i + 1] >= d[i + 2])) continue;
    const c = sproutTreeTint(v, d[i], d[i + 1], d[i + 2]); d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2];
  }
  const FW = W + P * 2, [cv, x] = mk(FW * F, H), out = x.createImageData(FW * F, H), o = out.data, Hc = Math.round(H * .74); /* tajuk = 74% atas */
  for (let f = 0; f < F; f++) {
    const ph = Math.sin(f / F * Math.PI * 2);
    for (let y = 0; y < H; y++) {
      const w = y < Hc ? Math.pow((Hc - y) / Hc, 1.3) : 0, dx = Math.round(SPROUT_TREES.amp * ph * w);
      for (let xx = 0; xx < W; xx++) {
        const si = (y * W + xx) * 4; if (!d[si + 3]) continue;
        const di = (y * FW * F + f * FW + xx + P + dx) * 4;
        o[di] = d[si]; o[di + 1] = d[si + 1]; o[di + 2] = d[si + 2]; o[di + 3] = d[si + 3];
      }
    }
  }
  x.putImageData(out, 0, 0);
  const t = T.addCanvas(key, cv); for (let f = 0; f < F; f++) t.add(f, 0, f * FW, 0, FW, H);
  const fr = [...Array(F).keys()].map(i => ({ key, frame: i }));
  if (!sc.anims.exists(key + '_sway')) sc.anims.create({ key: key + '_sway', frames: fr, frameRate: SPROUT_TREES.fps, repeat: -1 });
  return key;
}
// kunci tekstur pohon lama → pohon Sprout (gambar pohon lama sudah dihapus): dipakai juga oleh kanopi hutan, apel, editor
const SPROUT_TREE_ALIAS = { i_treeA: ['big', ''], treeAd: ['big', 'd'], treeSn: ['big', 'sn'], tree_redwood: ['giant', 'd'], i_bigtree: ['big', 'd'],
  bigtree: ['big', 'd'], tree_apple_fruit: ['big', 'fa'], tree_apple_bare: ['big', 'fb'], tree_orange_fruit: ['big', 'fo'],
  meadowwillow: ['big', 'sw'], owltree: ['big', 'd'], honeytree: ['big', ''], wishtree: ['big', ''], treeBd: ['big', 'd'],
  pine: ['tall', ''], pined: ['tall', 'd'], round: ['big', 'd'], pear: ['big', 'fb'] };
function sproutTreeAlias(sc) {
  const T = sc.textures, A = sc.anims;
  for (const [k, [shape, v]] of Object.entries(SPROUT_TREE_ALIAS)) {
    const src = sproutTreeTex(sc, shape, v); if (!src || k === src) continue;
    const s0 = T.get(src).getSourceImage(), [im, xc] = mk(s0.width, s0.height), F = SPROUT_TREES.frames, fw = im.width / F;
    xc.drawImage(s0, 0, 0); /* salinan sendiri: tekstur lama yang dihapus tidak ikut membawa kanvas pohon Sprout */
    if (T.exists(k)) T.remove(k);
    const t = T.addCanvas(k, im); for (let f = 0; f < F; f++) t.add(f, 0, f * fw, 0, fw, im.height);
    if (A.exists(k + '_sway')) A.remove(k + '_sway');
    A.create({ key: k + '_sway', frames: [...Array(F).keys()].map(i => ({ key: k, frame: i })), frameRate: SPROUT_TREES.fps, repeat: -1 });
  }
}
const _buildTexturesTrees = buildTextures;
buildTextures = function (sc) {
  const r = _buildTexturesTrees.apply(this, arguments);
  if (SPROUT_TREES.on && sc && sc.textures) sproutTreeAlias(sc);
  return r;
};
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    const s = _spawn0.apply(this, arguments), m = SPROUT_TREES.map[o[0]];
    if (!s || !m || !SPROUT_TREES.on) return s;
    const key = sproutTreeTex(this, m[0], m[1]); if (!key) return s;
    const x = o[1], y = o[2];
    if (s.anims) s.anims.stop();
    s.setTexture(key, 0).setScale(1).setFlipX(hash(Math.round(x), Math.round(y), 71) < .5);
    s.play({ key: key + '_sway', startFrame: Math.abs(Math.round(x * 7 + y * 13)) % SPROUT_TREES.frames });
    s.anims.timeScale = .85 + Math.abs(Math.sin(x * 12.9898 + y * 78.233)) * .3;
    const fd = this.fades && this.fades.find(f => f.s === s), D = OBJ[o[0]];
    if (fd) { fd.l = x - s.width / 2 + 8; fd.r = x + s.width / 2 - 8; fd.t = y - s.height + 6; fd.b = y - (D && D.col ? D.col[1] + D.col[2] : 4); }
    return s;
  };
})();
