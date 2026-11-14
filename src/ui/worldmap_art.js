'use strict';
// Gambar ringkas berwarna tiap wilayah untuk Peta Benua (1 piksel = WOV_K piksel dunia):
// tanah, jalan, sungai & danau (waterE), kebun, pohon, semak, batu, bangunan, tembok. Dibuat sekali per wilayah lalu disimpan.
const WOV_K = 8, WOV = {};
const WOV_TREE = /tree|pine|oak|round|pear|apple|orange|bigtree|willow|mangrove/i;
const WOV_BUSH = /bush|shrub|bramble|hay/i;
const WOV_ROCK = /rock|stone|boulder|cairn|stalag|cryst|pebble/i;
const WOV_BLD = /house|hut|inn|shop|academy|gatehouse|market|tower|fortress|lighthouse|temple|shrine|windmill|smith|forge|tavern|home/i;
function wovRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function worldOverview(M) {
  if (WOV[M.id]) return WOV[M.id];
  const W = Math.ceil(M.w / WOV_K), H = Math.ceil(M.h / WOV_K), c = document.createElement('canvas'); c.width = W; c.height = H;
  const x = c.getContext('2d'), img = x.createImageData(W, H), D = img.data;
  const GP = GROUND[M.ground] || GROUND.meadow, [GX, GY] = waterGXY(M), sd = makeSD(M), R = M.river, ponds = pondsAll(M);
  const g = (GP.g || ['#5a9a44']).map(wovRGB), ice = !!GP.ice, cave = GP.path === 'cave', verd = VERDANT[M.ground];
  const PATH = wovRGB(GP.path === 'stone' ? '#cfc5b6' : cave ? '#4a4456' : '#a8875a');
  const WAT = ice ? [[168, 216, 240], [196, 232, 248], [232, 248, 255]] : [[40, 96, 126], [52, 122, 150], [80, 156, 168]];
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const px = i * WOV_K + 4, py = j * WOV_K + 4, o = (j * W + i) * 4; let col = null;
    if (R && Math.abs(py - riverY(R, px)) < R.w / 2) col = (px >= R.bridge[0] && px <= R.bridge[1]) ? [168, 112, 62] : WAT[1];
    if (!col && ponds.length) { const e = waterE(ponds, px, py, GX, GY); if (e < 1) col = sd(px, py) < 0 ? [168, 112, 62] : WAT[e > .82 ? 2 : e > .5 || waterE.r < 70 ? 1 : 0]; }
    if (!col && sd(px, py) < 0) col = PATH;
    if (!col) {
      const v = vnoise(px + GX, py + GY, 56, 11) * .75 + vnoise(px + GX, py + GY, 20, 12) * .25;
      if (verd) col = v > .6 ? [90, 153, 58] : v < .4 ? [64, 118, 55] : [79, 138, 60];
      else col = g[v < .33 ? 0 : v < .5 ? 1 : v < .68 ? 2 : 3 % g.length] || g[0];
      if (verd && vnoise(px + GX, py + GY, 30, 13) * .75 + vnoise(px + GX, py + GY, 9, 14) * .25 > .74) col = [120, 98, 66];
    }
    D[o] = col[0]; D[o + 1] = col[1]; D[o + 2] = col[2]; D[o + 3] = 255;
  }
  x.putImageData(img, 0, 0);
  const k = 1 / WOV_K;
  for (const [gx, gy, gw, gh] of (M.gardens || [])) { x.fillStyle = '#7a5230'; x.fillRect(gx * k, gy * k, gw * k, gh * k); }
  const objs = (typeof mapObjects === 'function' ? mapObjects(M) : M.objs || []).slice().sort((a, b) => a[2] - b[2]);
  for (const o of objs) {
    const t = o[0], d = (typeof OBJ !== 'undefined' && OBJ[t]) || {}, X = o[1] * k, Y = o[2] * k, w = Math.max(8, (d.sh && d.sh[0]) || 16) * k;
    if (t === 'cwall') { x.fillStyle = '#8a8478'; x.fillRect(X - w, Y - 3, w * 2, 3); continue; }
    if (WOV_BLD.test(t) || d.mm) {
      const bw = Math.max(3, w * 1.1), bh = Math.max(3, bw * .75);
      x.fillStyle = '#3b2618'; x.fillRect(X - bw / 2 - .5, Y - bh - .5, bw + 1, bh + 1);
      x.fillStyle = /academy|temple|shrine|gatehouse/.test(t) ? '#d8d0c0' : '#b8563a'; x.fillRect(X - bw / 2, Y - bh, bw, bh * .6);
      x.fillStyle = '#e8d8b0'; x.fillRect(X - bw / 2, Y - bh * .4, bw, bh * .4); continue;
    }
    if (WOV_TREE.test(t) || WOV_TREE.test(d.key || '')) {
      const r = Math.max(1.6, w * .55), pine = /pine/i.test(t);
      x.fillStyle = pine ? '#1f4a3a' : '#24502a'; x.beginPath(); x.arc(X, Y - r * .8, r, 0, 6.29); x.fill();
      x.fillStyle = ice ? '#e8f0f8' : pine ? '#2f6a4e' : '#3d7a34'; x.beginPath(); x.arc(X - r * .25, Y - r, r * .6, 0, 6.29); x.fill(); continue;
    }
    if (WOV_BUSH.test(t)) { x.fillStyle = '#2f6a2c'; x.fillRect(X - 1, Y - 2, 2, 2); continue; }
    if (WOV_ROCK.test(t)) { x.fillStyle = '#8a8c88'; x.fillRect(X - 1, Y - 1.5, 2, 1.5); }
  }
  return WOV[M.id] = c;
}
// tombol bergaya kayu seperti tombol MENU/PETA di layar game
(function wmCss() {
  const s = document.createElement('style');
  s.textContent = '.wmb{font-family:"Pixelify Sans",monospace;font-weight:700;color:#fff3c4;background:linear-gradient(#9a6a3e,#6e4222);' +
    'border:2px solid #3b2618;border-radius:12px;box-shadow:0 3px 0 #2a1a0e,inset 0 1px 0 rgba(255,255,255,.25);padding:6px 12px;font-size:13px;' +
    'letter-spacing:1px;cursor:pointer;text-shadow:0 1px 0 #2a1a0e;min-width:40px;touch-action:manipulation}' +
    '.wmb:active{transform:translateY(2px);box-shadow:0 1px 0 #2a1a0e}.wmb.g{background:linear-gradient(#5e9a52,#3e6e34)}' +
    '.wmb.r{background:linear-gradient(#c8604a,#9a3e2e)}';
  document.head.appendChild(s);
})();
