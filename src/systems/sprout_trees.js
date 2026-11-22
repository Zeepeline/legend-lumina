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
// tekstur strip 8 frame + anim '<key>_sway' (sekali untuk seluruh game)
function sproutTreeTex(sc, shape, v) {
  const key = 'spTree_' + shape + (v ? '_' + v : ''), T = sc.textures;
  if (T.exists(key)) return key;
  const im = IMGEL.deco_sprout_objs; if (!im) return null;
  const [sx, sy, sw, sh] = SPROUT_TREES.src[shape], S = SPROUT_TREES.scale, W = sw * S, H = sh * S;
  const P = SPROUT_TREES.amp + 1, F = SPROUT_TREES.frames;
  const [s1, x1] = mk(sw, sh); x1.drawImage(im, sx, sy, sw, sh, 0, 0, sw, sh);
  const one = x1.getImageData(0, 0, sw, sh); sproutTreePolish(one.data, sw, sh); x1.putImageData(one, 0, 0);
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
