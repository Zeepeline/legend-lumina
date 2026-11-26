'use strict';
// BAYANGAN OBJEK — elips lembut di kaki setiap objek luar ruang (semak, batu, tunggul, bunga, jamur, pinus, pohon buah,
// tong, peti, lampu, pagar, …), KECUALI bangunan & benda datar di tanah. Pohon berawalan 'tree' sudah dapat bayangan
// bergerak dari tree_shadows.js. Lebar bayangan mengikuti lebar kaki gambar (baris bawah yang terisi).
// Ukuran dari tekstur 'objsh' (frame per lebar); gambar diam → ikut di-cull perf.js di luar layar.
const OBJ_SHADOW = {
  on: true, alpha: .34, alphaDark: .5, minW: 14, maxW: 84, step: 4,
  skip: new RegExp(['house|inn|shop|smith|forge|chapel|church|guild|hall|barn|tower|windmill|gatehouse|gate|cwall|citywall|ctower|academy',
    'fortress|castle|palace|temple|stall|market|dock|bridge|cavemouth|shrine|cliff|rug|carpet|path|portal|spLily|ripple',
    'clutter|island|puddle|water|well|fountain|wall'].join('|'), 'i'),
};
function objShadowTex(sc) {
  if (sc.textures.exists('objsh')) return;
  const { minW, maxW, step } = OBJ_SHADOW, n = Math.floor((maxW - minW) / step) + 1, H = Math.ceil(maxW * .38) + 2;
  const [c, x] = mk(maxW + 2, H * n);
  for (let k = 0; k < n; k++) {
    const w = minW + k * step, h = Math.max(5, Math.round(w * .36)), cy = k * H + H / 2;
    for (let y = 0; y < H; y++) for (let X = 0; X < maxW + 2; X++) { /* elips padat bertepi lembut 1 px */
      const e = ((X + .5 - (maxW + 2) / 2) / (w / 2)) ** 2 + ((k * H + y + .5 - cy) / (h / 2)) ** 2;
      if (e <= 1) { x.fillStyle = e > .72 ? 'rgba(20,24,16,.55)' : 'rgb(20,24,16)'; x.fillRect(X, k * H + y, 1, 1); }
    }
  }
  const t = sc.textures.addCanvas('objsh', c);
  for (let k = 0; k < n; k++) t.add(k, 0, 0, k * H, maxW + 2, H);
  objShadowTex.H = H;
}
// lebar kaki gambar (px) per tekstur+frame, disimpan
function objFootW(sc, s) {
  const C = objFootW.c || (objFootW.c = {}), key = s.texture.key + '|' + s.frame.name; if (C[key] !== undefined) return C[key];
  const f = s.frame, im = f.source.image; let w = f.width;
  try {
    const [, x] = mk(f.cutWidth, f.cutHeight); x.drawImage(im, f.cutX, f.cutY, f.cutWidth, f.cutHeight, 0, 0, f.cutWidth, f.cutHeight);
    const d = x.getImageData(0, 0, f.cutWidth, f.cutHeight).data, W = f.cutWidth, H = f.cutHeight;
    for (let y = H - 1, rows = 0; y >= 0 && rows < 4; y--) { /* 4 baris terbawah yang berisi → lebar terbesar */
      let l = W, r = -1; for (let X = 0; X < W; X++) if (d[(y * W + X) * 4 + 3] > 100) { if (X < l) l = X; r = X; }
      if (r >= 0) { rows++; w = rows === 1 ? r - l + 1 : Math.max(w, r - l + 1); }
    }
  } catch (e) { /* kanvas tercemar → pakai lebar frame */ }
  return (C[key] = w);
}
// satu objek → bayangan (dipanggil pemindai); s._shd = sudah diproses
function objShadowAdd(sc, s) {
  const key = s.texture && s.texture.key; if (s._shdK === key) return; s._shdK = key; /* ditolak untuk tekstur ini; dicek lagi bila tekstur berganti */
  if (!key || key === '__MISSING' || OBJ_SHADOW.skip.test(key)) return;
  if (s.displayWidth > 220 || s.displayHeight > 260 || s.originY < .9) return;
  s._shd = 1;
  const isTree = /tree|pine|apple|orange|redwood|willow|round|pear|owl|honey|wish|spTree/.test(key);
  const fw = Math.abs(s.scaleX) * objFootW(sc, s) * (isTree ? 2.4 : 1.35) + 6; /* pohon: kaki = batang → bayangan selebar tajuk */
  const { minW, maxW, step } = OBJ_SHADOW, k = Math.max(0, Math.min(Math.floor((maxW - minW) / step), Math.round((fw - minW) / step)));
  const sh = sc.add.image(Math.round(s.x + 1), Math.round(s.y - 1), 'objsh', k).setDepth(s.y - 2) /* tepat di bawah objeknya (seperti bayangan pohon) */
    .setAlpha(sc.M.dark ? OBJ_SHADOW.alphaDark : OBJ_SHADOW.alpha);
  if (sc.cullL) {
    const pad = typeof CULL_PAD !== 'undefined' ? CULL_PAD : 96;
    sc.cullL.push({ o: sh, x: sh.x, y: sh.y, r: Math.max(sh.displayWidth, sh.displayHeight) + pad });
    sc.cullAt = null;
  }
  s.once('destroy', () => { if (sh.active) sh.destroy(); });
}
// pindai objek diam baru (properti, semak, batu, pohon buah, …) — tokoh, musuh, hewan & pemain dilewati
function objShadowScan(sc) {
  if (!OBJ_SHADOW.on || !sc.M || sc.M.indoor || !sc.children) return;
  objShadowTex(sc);
  const skip = new Set([sc.pl, sc.pet]);
  for (const o of sc.npcs || []) skip.add(o.spr);
  for (const e of sc.enemies || []) skip.add(e.spr);
  for (const c of sc.critters || []) skip.add(c.s || c.spr);
  for (const o of sc.children.list) {
    if (o._shd || skip.has(o) || o.body || !(o.type === 'Image' || o.type === 'Sprite') || o.scrollFactorX !== 1) continue;
    if (Math.abs(o.depth - o.y) > 4) continue; /* bukan objek berdiri (lapisan tanah, efek, dll.) — bisa berubah, jangan ditandai */
    objShadowAdd(sc, o);
  }
}
(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _up0 = W.update;
  W.update = function (time, delta) {
    _up0.apply(this, arguments);
    const n = this.children ? this.children.list.length : 0; /* pindai bila ada objek baru, atau tiap ±1 dtk */
    this._shdT = (this._shdT || 0) - (delta || 16);
    if (n !== this._shdN || this._shdT <= 0) {
      this._shdN = n; this._shdT = 4000;
      try { objShadowScan(this); } catch (e) { OBJ_SHADOW.on = false; console.warn('object_shadows', e); }
    }
  };
})();
