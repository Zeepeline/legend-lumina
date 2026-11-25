'use strict';
// Pedang terkunci & DIGENGGAM di tangan Arka. Sprite serangan Arka (hero_arka.png, frame 48×40, kaki di (24,39)) digambar TANPA pedang;
// pedang = gambar tempelan `this.sword` (art/sword_art.js, titik putar = TENGAH GAGANG). Agar tampak digenggam:
// 1) titik genggam = kepalan di frame yang tampil (tabel HERO_HAND = perkiraan awal, dikoreksi ke pusat piksel kulit terdekat);
//    pivot pedang tepat di titik itu (tanpa dorongan maju yang dulu menggeser gagang ke depan kepalan);
// 2) gambar kepalan menggenggam (`fist_grip`) di atas gagang, ikut berputar bersama pedang, di semua fase (ayun & siaga).
// Fase: ayun (`_off`, dari swingSword) → siaga (`_hold`: pedang terkulai di sisi badan) → sarung (`_shT`: melayang ke punggung) → pedang di punggung.
// Indeks tabel = frame animasi 0-3 (ancang → tebas → lanjut). Samping menghadap kanan; kiri = cermin. Atas/bawah = tangan kanan layar.
const HERO_HAND = {
  side: [[27, 27], [31, 26], [33, 26], [30, 27]],
  down: [[31, 30], [32, 28], [35, 27.5], [31, 30.5]],
  up: [[31, 29], [32, 28], [33, 24.5], [31, 29]]
};
/* siaga: titik tangan di sisi badan relatif kaki [dx, dy, sudut(bawah/atas)]; waktu siaga sebelum disarungkan */
const SWORD_CARRY = { side: [2, -11, 0], down: [8, -9, 1.3], up: [8, -11, 1.45] }, SWORD_HOLD_MS = 1800, SWORD_SHEATH_MS = 260;
const CARRY_HAND = [23.5, 34.5]; /* perkiraan tangan dekat saat siaga, tampak samping (dikoreksi handAnchor) */
const HC_R = 6; let HC_CACHE = {}, HC_SRC = null;
/* pusat kepalan pada frame yang sedang tampil: rata-rata piksel kulit terang dalam radius HC_R dari perkiraan tabel (cache per frame) */
function handAnchor(pl, tx, ty) {
  const fr = pl.frame, src = pl.texture.getSourceImage(); if (src !== HC_SRC) { HC_SRC = src; HC_CACHE = {}; } /* ganti skin → cache dibuang */
  const key = pl.texture.key + '_' + fr.name; let c = HC_CACHE[key]; if (c) return c;
  c = HC_CACHE[key] = { ax: tx + .5, ay: ty + .5 };
  try {
    const W = fr.cutWidth, H = fr.cutHeight, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently: true }); g.drawImage(src, fr.cutX, fr.cutY, W, H, 0, 0, W, H);
    const d = g.getImageData(0, 0, W, H).data; let sx = 0, sy = 0, n = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4, r = d[i], gg = d[i + 1], b = d[i + 2];
      const skin = d[i + 3] > 200 && r >= 232 && gg >= 185 && gg <= 228 && b >= 140 && b <= 195 && r - b > 40;
      if (skin && Math.hypot(x - tx, y - ty) <= HC_R) { sx += x + .5; sy += y + .5; n++; }
    }
    if (n >= 3) { c.ax = sx / n; c.ay = sy / n; }
  } catch (e) { /* pakai perkiraan tabel */ }
  return c;
}
/* tokoh baru + senjata jenis pedang → pedang tempelan (tangan, siaga, punggung) disembunyikan */
function heroNoSword() { return HERO_SWD && ((ITEMS[S.eq.wpn] || {}).wt || 'sword') === 'sword'; }
Object.assign(World.prototype, {
  /* koordinat dunia telapak tangan pada frame serangan f (0-3) menurut arah pl.dir (perkiraan tabel) */
  heroHand(pl, f) {
    const left = pl.dir === 'left', sd = pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir;
    const h = HERO_HAND[sd][Math.max(0, Math.min(3, f | 0))], k = HERO_G.k;
    return { x: pl.x + (h[0] - 24) * k * (left && sd === 'side' ? -1 : 1), y: pl.y - (40 - h[1]) * k };
  },
  /* pose pedang di punggung: gagang menyembul di atas bahu (samping/depan: di belakang badan; belakang: melintang di punggung) */
  sheathPose(pl) {
    const d = pl.dir, side = d === 'left' || d === 'right', L = d === 'left';
    return {
      x: pl.x + (side ? (L ? 6 : -6) : (d === 'up' ? 4 : 7)) * HERO_G.k, y: pl.y - 16 * HERO_G.k, /* tinggi bahu (kepala chibi besar: ±-18 ke atas = wajah) */
      rot: side ? (L ? Math.PI - .95 : .95) : 2.35, depth: pl.y + (d === 'up' ? .6 : -.6)
    };
  },
  /* pedang di punggung saat tidak dipegang (tidak menebas, tidak siaga) */
  sheathSword() {
    const pl = this.pl, sw = this.sword, wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
    const show = pl && pl.active && !pl.dead && !G.title && wt !== 'bow' && !heroNoSword()
      && !(sw && sw.visible) && !pl._emote && !this.fishing && pl.visible && !this._swlOn;
    let sh = this._sheath; if (sh && !sh.active) sh = this._sheath = null;
    if (!show) { if (sh) sh.setVisible(false); return; }
    const tier = { wsword: 0 }[S.eq.wpn] ?? 1, tex = wt === 'spear' ? 'wspear' : wt === 'axe' ? 'waxe' : 'sword' + tier;
    if (!sh) sh = this._sheath = this.add.image(0, 0, tex).setOrigin(.1, .5);
    const P = this.sheathPose(pl);
    if (sh.texture.key !== tex) sh.setTexture(tex);
    sh.setOrigin(swordOriginX(tex), .5).setVisible(true).setRotation(P.rot).setPosition(P.x, P.y).setDepth(P.depth)
      .setTint(S.eq.wpn === 'csword' ? 0x8ae8ff : S.eq.wpn === 'ssword' ? 0xc8d8ff : 0xffffff);
  },
  /* selesai menebas (atau gerak membatalkan ayunan): pedang TETAP di tangan, Arka siaga sebentar, baru disarungkan */
  swordRest() {
    const sw = this.sword; if (!sw || !sw.visible) return;
    this.tweens.killTweensOf(sw); sw._off = null; sw._seq = (sw._seq || 0) + 1; sw._shT = 0; sw.setAlpha(1);
    sw._hold = this.time.now + SWORD_HOLD_MS;
  },
  /* kepalan menggenggam di atas gagang (pivot pedang), ikut berputar; `on` false → sembunyi */
  gripFist(sw, on) {
    let f = this._fist; if (f && !f.active) f = this._fist = null;
    if (!on) { if (f) f.setVisible(false); return; }
    if (!f) f = this._fist = this.add.image(0, 0, 'fist_grip').setOrigin(.5, .5);
    f.setVisible(true).setPosition(sw.x, sw.y).setRotation(sw.rotation).setFlipY(sw.flipY).setDepth(sw.depth + .5);
  },
  /* tiap frame setelah pemutar animasi Arka: ayun → pedang di kepalan frame yang tampil; siaga → di sisi badan; sarung → melayang ke punggung */
  swordToHand() { this.swordToHand0(); this.sheathSword(); },
  swordToHand0() {
    const pl = this.pl, sw = this.sword; if (!sw) return;
    if (!sw.visible) { sw._off = null; sw._hold = 0; sw._shT = 0; this.gripFist(sw, false); return; } /* disembunyikan jalur lain → buang sisa keadaan */
    if (!pl || pl.dead) { sw._hold = 0; sw._shT = 0; if (pl) sw.setVisible(false); this.gripFist(sw, false); return; }
    sw.setOrigin(swordOriginX(sw.texture.key), .5);
    /* tokoh baru (HERO_SWD): pedang tempelan lama TIDAK dipakai untuk senjata pedang — bilah ada di gambar tebasan pemilik */
    if (heroNoSword()) { sw.setAlpha(0); this.gripFist(sw, false); return; }
    sw.setAlpha(1);
    if (!sw._off) { if (sw._hold || sw._shT) this.swordCarry(pl, sw, this.time.now); else this.gripFist(sw, false); return; }
    const m = /^(?:atk\d|heavy)_(down|up|side)(\d)$/.exec(pl.frame && pl.frame.name || '');
    if (!m) { this.gripFist(sw, false); return; }
    const G = HERO_G, sd = m[1], h = HERO_HAND[sd][+m[2]], c = handAnchor(pl, G.cx + (h[0] - 24) * G.k, G.fy - (40 - h[1]) * G.k);
    const mir = sd === 'side' && pl.dir === 'left' ? -1 : 1;
    sw.setPosition(pl.x + (c.ax - G.cx) * mir + sw._off.x, pl.y - (G.fy - c.ay) + sw._off.y);
    this.gripFist(sw, true);
  },
  /* siaga: pedang terkulai di tangan sisi badan (ujung ke bawah-depan), mengikuti gerak halus; habis waktu → melayang ke punggung */
  swordCarry(pl, sw, now) {
    const d = pl.dir, side = d === 'left' || d === 'right', mir = d === 'left' ? -1 : 1, A = Phaser.Math.Angle;
    if (sw._hold && now >= sw._hold) { sw._hold = 0; sw._shT = now; sw._from = { x: sw.x, y: sw.y, r: sw.rotation }; }
    if (sw._shT) { /* menuju sarung: tangan melepas, pedang melayang */
      this.gripFist(sw, false);
      const p = Math.min(1, (now - sw._shT) / SWORD_SHEATH_MS), e = p * p * (3 - 2 * p), P = this.sheathPose(pl), F = sw._from;
      sw.setPosition(F.x + (P.x - F.x) * e, F.y + (P.y - F.y) * e).setRotation(F.r + A.Wrap(P.rot - F.r) * e).setDepth(P.depth + (p < 1 ? 1.2 : 0));
      if (p >= 1) { sw.setVisible(false); sw._shT = 0; }
      return;
    }
    const C = SWORD_CARRY[side ? 'side' : d];
    let tx = pl.x + C[0] * HERO_G.k * (side ? mir : 1), ty = pl.y + C[1] * HERO_G.k;
    if (side && pl.frame) { /* tangan sprite yang sebenarnya (frame diam/jalan): ±(28,31) di frame; mirror untuk kiri */
      const G = HERO_G, c = handAnchor(pl, G.cx + (CARRY_HAND[0] - 24) * G.k, G.fy - (40 - CARRY_HAND[1]) * G.k);
      tx = pl.x + (c.ax - G.cx) * mir; ty = pl.y - (G.fy - c.ay);
    }
    const tr = side ? (mir < 0 ? Math.PI - 1.15 : 1.15) : C[2], k = .45;
    sw.setPosition(sw.x + (tx - sw.x) * k, sw.y + (ty - sw.y) * k).setRotation(sw.rotation + A.Wrap(tr - sw.rotation) * k);
    sw.setFlipY(d === 'left'); this.gripFist(sw, true);
  }
});
{ const W = World.prototype, _cr = W.create;
  W.create = function () {
    const r = _cr.apply(this, arguments); this._fist = null; this._sheath = null;
    if (!this._swordHook) { this._swordHook = 1; this.events.on('postupdate', () => this.swordToHand()); }
    return r;
  };
}
