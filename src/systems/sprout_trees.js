'use strict';
// POHON GAYA SPROUT LANDS — pohon biasa di wilayah luar (GRASS_EDGE.maps) memakai pohon dari deco_sprout_objs.png (3×),
// dengan varian warna per jenis (gelap hutan, salju, rawa) & goyang angin buatan kode (8 frame: tajuk bergeser, batang diam).
// Jenis & perilaku objek tidak berubah (tabrakan, pudar saat di belakang, bayangan) — hanya tekstur & animasinya.
// Pohon apel (berbuah) & redwood (Hutan Dalam) tidak diganti.
const SPROUT_TREES = {
  on: true, scale: 3, frames: 8, amp: 2, fps: 5,
  src: { big: [20, 1, 24, 31], tall: [1, 0, 14, 29] }, /* potongan lembar [x, y, w, h] */
  // jenis objek → [bentuk, varian warna]
  map: { treeA: ['big', ''], treeB: ['big', ''], verdant_tree: ['big', ''], bigtree: ['big', ''], pine: ['tall', ''],
    treeAd: ['big', 'd'], treeBd: ['big', 'd'], pined: ['tall', 'd'], treeSn: ['big', 'sn'], treeSw: ['big', 'sw'] },
};
// warna tajuk (piksel hijau) per varian
function sproutTreeTint(v, r, g, b) {
  if (v === 'd') return [r * .74, g * .8, b * .86];
  if (v === 'sw') return [r * .82, g * .8, b * .66];
  if (v === 'sn') { /* salju: gelap-terang tajuk diperkuat → biru keabu (bayangan) sampai putih (salju) */
    const L = Math.min(1, Math.max(0, ((r + g + b) / 765 - .42) / .32));
    return [128 + 122 * L, 150 + 104 * L, 176 + 78 * L];
  }
  return [r, g, b];
}
// tekstur strip 8 frame + anim '<key>_sway' (sekali untuk seluruh game)
function sproutTreeTex(sc, shape, v) {
  const key = 'spTree_' + shape + (v ? '_' + v : ''), T = sc.textures;
  if (T.exists(key)) return key;
  const im = IMGEL.deco_sprout_objs; if (!im) return null;
  const [sx, sy, sw, sh] = SPROUT_TREES.src[shape], S = SPROUT_TREES.scale, W = sw * S, H = sh * S;
  const P = SPROUT_TREES.amp + 1, F = SPROUT_TREES.frames;
  const [b0, x0] = mk(W, H); x0.imageSmoothingEnabled = false; x0.drawImage(im, sx, sy, sw, sh, 0, 0, W, H);
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
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    const s = _spawn0.apply(this, arguments), m = SPROUT_TREES.map[o[0]];
    if (!s || !m || !SPROUT_TREES.on || typeof sproutRegionAt !== 'function' || !sproutRegionAt(this, o[1], o[2])) return s;
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
