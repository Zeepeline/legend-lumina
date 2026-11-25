'use strict';
// Pedang Arka yang DIGAMBAR PER FRAME (assets/img/hero/hero_swl{0,1}.png ← tools/gen_sword_layer.py). Pedang + kepalan sudah menempel di tangan
// pada tiap frame tubuh, jadi tidak ada penyetelan piksel saat main: lapisan memakai NAMA FRAME YANG SAMA dengan tubuh (atk1_side2, idle_down1, ...).
// Dipakai untuk pedang biasa: tebasan (frame atk*) → siaga (frame diam/jalan, SWORD_HOLD_MS) → disarungkan (pedang tempelan terbang ke punggung,
// sword_hand.js). Jurus (heavy/charge/spin), tombak, kapak, busur tetap memakai pedang tempelan lama.
const SWL_FW = 80, SWL_FH = 112, SWL_FEET = 96 / 112; /* kaki di y=96 dari 112 (ruang bawah untuk ujung bilah) */
const SWL_ROWS = ['idle_down', 'walk_down', 'idle_up', 'walk_up', 'idle_side', 'walk_side_a', 'walk_side', 'atk1_down', 'atk2_down', 'atk1_up', 'atk2_up',
  'atk1_side', 'atk2_side', 'atk3_down', 'atk3_up', 'atk3_side', 'heavy_down', 'heavy_up', 'heavy_side'];
const SWL_HAND = { side: [-.5, -5.5, -.25], down: [8, -9, -1.2], up: [8, -11, -1.2] }; /* titik tangan siaga relatif kaki + sudut (untuk terbang ke sarung) */
IMG_LIST.push('hero_swl0', 'hero_swl1');
function regSwordLayer(T) {
  for (const t of [0, 1]) {
    const im = IMGEL['hero_swl' + t], k = 'swl' + t; if (!im || im.width < SWL_FW * 4) continue; /* berkas hilang → pedang tempelan lama */
    if (T.exists(k)) T.remove(k);
    const tx = T.addImage(k, im);
    SWL_ROWS.forEach((n, r) => { for (let f = 0; f < 4; f++) tx.add(n + f, 0, f * SWL_FW, r * SWL_FH, SWL_FW, SWL_FH); });
  }
}
{ const _bt = typeof buildTextures === 'function' ? buildTextures : null;
  if (_bt) buildTextures = function (sc) { const r = _bt.apply(this, arguments); regSwordLayer(sc.textures); return r; };
}
const _bakeStd = World.prototype.swordToHand;
Object.assign(World.prototype, {
  bakeOn(wt) { return wt === 'sword' && this.textures.exists('swl1') && HERO_G.k === 1; }, /* lapisan pedang digambar untuk frame Arka saja */
  /* hentikan lapisan dan lepas pedang tempelan terbang ke punggung dari posisi tangan */
  bakeSheath(pl) {
    const sw = this.sword, d = pl.dir, side = d === 'left' || d === 'right', mir = d === 'left' ? -1 : 1, H = SWL_HAND[side ? 'side' : d];
    const tier = { wsword: 0 }[S.eq.wpn] ?? 1;
    sw.setTexture('sword' + tier).setOrigin(swordOriginX('sword' + tier), .5).setVisible(true).setAlpha(1).setFlipY(d === 'left').setDepth(pl.y + 1)
      .setTint(S.eq.wpn === 'csword' ? 0x8ae8ff : S.eq.wpn === 'ssword' ? 0xc8d8ff : 0xffffff);
    const r = side ? (mir < 0 ? Math.PI - H[2] : H[2]) : H[2];
    sw._off = null; sw._hold = 0; sw._shT = this.time.now; sw._from = { x: pl.x + H[0] * (side ? mir : 1), y: pl.y + H[1], r }; sw.setRotation(r);
  },
  swordBake() {
    const pl = this.pl, sw = this.sword, B = this._bk || (this._bk = { hold: 0 }), now = this.time.now;
    let L = this._swl; if (L && !L.active) L = this._swl = null;
    const was = !!(L && L.visible), off = () => { if (L) L.setVisible(false); this._swlOn = false; };
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
    if (!pl || !pl.active || pl.dead || G.title || !this.bakeOn(wt)) { B.hold = 0; off(); return; }
    if (sw && sw.visible) { B.hold = 0; off(); return; } /* pedang tempelan aktif (jurus / terbang ke sarung) */
    const fn = pl.frame && pl.frame.name || '', side = pl.dir === 'left' || pl.dir === 'right';
    const busy = pl._roll > 0 || pl._hurt > 0 || pl._cast > 0 || pl._bow > 0 || pl._emote || this.fishing || !pl.visible;
    const atk = (pl._atk > 0 && /^atk\d_/.test(fn)) || ((pl._heavy > 0 || this.charged) && /^heavy_/.test(fn));
    if (busy) { if (was) this.bakeSheath(pl); B.hold = 0; off(); return; }
    if (atk) B.hold = now + SWORD_HOLD_MS;
    const tier = { wsword: 0 }[S.eq.wpn] ?? 1, key = 'swl' + tier;
    if ((atk || (B.hold > now && /^(idle|walk)_/.test(fn))) && this.textures.get(key).has(fn)) {
      if (!L) L = this._swl = this.add.image(0, 0, key, fn).setOrigin(.5, SWL_FEET);
      if (!side) pl.flipX = false; /* frame bawah/atas digambar tanpa cermin */
      L.setTexture(key, fn).setVisible(true).setPosition(pl.x, pl.y).setFlipX(side && pl.dir === 'left')
        .setDepth(pl.depth + (atk && pl.dir === 'up' ? -.2 : .2))
        .setTint(S.eq.wpn === 'csword' ? 0x8ae8ff : S.eq.wpn === 'ssword' ? 0xc8d8ff : 0xffffff);
      this._swlOn = true; return;
    }
    if (was) this.bakeSheath(pl); /* waktu siaga habis (atau frame tak dikenal) → sarungkan */
    B.hold = 0; off();
  },
  swordToHand() { this.swordBake(); return _bakeStd.apply(this, arguments); }
});
