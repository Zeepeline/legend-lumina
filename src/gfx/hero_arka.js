'use strict';
// Sprite sheet lengkap Arka dari ChatGPT (assets/img/hero/hero_arka.png).
// Atlas: frame 48×40, kaki di baris paling bawah, tengah badan di x 24. Satu baris = satu animasi 4 frame. "side" menghadap kanan (kiri = flipX).
// Pemutar animasi: setiap akhir update scene, frame pemain dipilih dari keadaannya (mati, berguling, kena pukul, serang, sihir, busur, jalan, diam).
const HERO_FW = 48, HERO_FH = 40;
const HERO_ROW = {
  idle_down: 0, walk_down: 1, idle_up: 2, walk_up: 3, idle_side: 4, walk_side_a: 5, walk_side: 6, atk1_down: 7, atk2_down: 8, atk1_up: 9,
  atk2_up: 10, atk1_side: 11, atk2_side: 12, atk3_down: 13, atk3_up: 14, atk3_side: 15, heavy_down: 16, heavy_up: 17, heavy_side: 18,
  roll_down: 19, roll_up: 20, roll_side: 21, hurt: 22, die: 23, rise: 24, cast_down: 25, cast_up: 26, cast_side: 27, bow_down: 28,
  bow_side_a: 29, bow_side: 30, bow_up: 31, fish_cast: 32, fish_pull: 33, pick: 34, hoe: 35, cheer: 36, cheer_b: 37, sleep: 38
};
IMG_LIST.push('hero_arka', 'hero_mc2');
// Tokoh utama: 'mc2' = tokoh baru (rambut hijau, tunik merah; hero_mc2.png, atlas sama + baris 39–40 = jalan 8 frame) · 'arka' = Arka lama.
// Pilihan di Pengaturan › Tokoh utama (localStorage 'lumina_mc'). Aset Arka lama tidak dihapus.
const HERO_SKIN = (() => { try { return localStorage.getItem('lumina_mc') || 'mc2'; } catch (_) { return 'mc2'; } })();
let HERO_W8 = false, HERO_W8U = false, HERO_W8D = false, HERO_BLINK = false; /* jalan 8 frame: samping (baris 39–40), atas (41–42), bawah (43–44) */
let HERO_SWD = false; /* tebasan samping berpedang digambar di sprite (tokoh baru) */
// geometri frame skin aktif: ukuran sel, titik tengah-kaki, skala tinggi tubuh terhadap Arka (dipakai sword_hand.js)
let HERO_G = { fw: HERO_FW, fh: HERO_FH, cx: 24, fy: 40, k: 1 };
function heroSkinToggle() { /* Pengaturan › Tokoh utama */
  try { localStorage.setItem('lumina_mc', HERO_SKIN === 'arka' ? 'mc2' : 'arka'); } catch (_) { }
  if (!G.title && G.scene) saveGame(G.scene); location.reload();
}
function regHeroArka(T) {
  const isSlave = (typeof S !== 'undefined' && (S.skin === 'slave' || S.outfit === 'slave')) ||
    (typeof location !== 'undefined' && /[?&]skin=slave\b/.test(location.search));
  const mc2 = HERO_SKIN === 'mc2' && IMGEL.hero_mc2 && IMGEL.hero_mc2.height >= 56 * 41; /* tokoh baru (sel 64×56, ±50 px) belum punya versi tawanan */
  HERO_G = mc2 ? { fw: 64, fh: 56, cx: 32, fy: 56, k: 1.38 } : { fw: HERO_FW, fh: HERO_FH, cx: 24, fy: 40, k: 1 };
  const FW = HERO_G.fw, FH = HERO_G.fh;
  const img = mc2 ? IMGEL.hero_mc2 : (isSlave && IMGEL.hero_slave) ? IMGEL.hero_slave : (IMGEL.hero_arka || IMGEL.hero_slave);
  if (T.exists('ch_hero')) T.remove('ch_hero');
  const t = T.addImage('ch_hero', img);
  for (const k in HERO_ROW) for (let i = 0; i < 4; i++) t.add(k + i, 0, i * FW, HERO_ROW[k] * FH, FW, FH);
  HERO_W8 = !!mc2; HERO_W8U = !!mc2 && img.height >= FH * 43; HERO_W8D = !!mc2 && img.height >= FH * 45;
  HERO_BLINK = !!mc2 && img.height >= FH * 47; HERO_SWD = !!mc2; /* baris 45–46: diam bawah/samping mata terpejam */
  if (HERO_W8) for (let i = 0; i < 8; i++) t.add('walk8s_' + i, 0, (i % 4) * FW, (39 + (i >> 2)) * FH, FW, FH);
  if (HERO_W8U) for (let i = 0; i < 8; i++) t.add('walk8u_' + i, 0, (i % 4) * FW, (41 + (i >> 2)) * FH, FW, FH);
  if (HERO_BLINK) for (let i = 0; i < 8; i++) t.add('blink_' + (i < 4 ? 'down' : 'side') + (i % 4), 0, (i % 4) * FW, (45 + (i >> 2)) * FH, FW, FH);
  if (HERO_W8D) for (let i = 0; i < 8; i++) t.add('walk8d_' + i, 0, (i % 4) * FW, (43 + (i >> 2)) * FH, FW, FH);
  // nama frame lama (dipakai kode lama sebelum pemutar menimpa): down0..3 / up0..3 / side0..3
  for (const d of ['down', 'up', 'side']) ['idle_' + d + '0', 'walk_' + d + '0', 'walk_' + d + '2', 'atk1_' + d + '1'].forEach((f, i) => {
    const r = HERO_ROW[f.slice(0, -1)]; t.add(d + i, 0, +f.slice(-1) * FW, r * FH, FW, FH);
  });
}
function heroFrame(sc, dt) {
  const pl = sc.pl; if (!pl || !pl.body || !pl.active) return;
  const A = pl._ha || (pl._ha = { k: '', t: 0 }), sd = pl.dir === 'left' || pl.dir === 'right' ? 'side' : (pl.dir || 'down');
  for (const k of ['_hurt', '_cast', '_bow', '_heavy', '_atk', '_roll']) if (pl[k] > 0) pl[k] -= dt;
  let k, f, fps = 0, once = false;
  const moving = pl.body.velocity.length() > 8;
  if (pl.dead) { k = 'die'; fps = 6; once = true; }
  else if (pl._emote) { /* pose khusus dari systems/juice.js: { k, f | fps, loop, t } */
    const E = pl._emote; k = E.k; if (E.f != null) f = E.f; else { fps = E.fps || 8; once = !E.loop; }
    if (E.t != null && (E.t -= dt) <= 0) pl._emote = null;
  }
  else if (pl._roll > 0) { k = 'roll_' + sd; f = Math.min(3, Math.floor((.3 - pl._roll) / .075)); }
  else if (pl._heavy > 0) { k = 'heavy_' + sd; f = Math.min(3, 2 + Math.floor((.45 - Math.min(.45, pl._heavy)) / .2)); }
  else if (sc.charged) { k = 'heavy_' + sd; f = Math.floor(sc.t * 6) % 2; }
  else if (pl._hurt > 0) { k = 'hurt'; f = sd === 'side' ? 2 + (pl._hurt < .12 ? 1 : 0) : (pl._hurt < .12 ? 1 : 0); }
  else if (pl._bow > 0) { k = sd === 'side' ? 'bow_side' : sd === 'up' ? 'cast_up' : 'bow_down'; f = Math.min(3, Math.floor((.4 - pl._bow) / .1)); }
  else if (pl._cast > 0) { k = 'cast_' + sd; f = Math.min(3, Math.floor((.4 - pl._cast) / .1)); }
  else if (pl._atk > 0) {
    const c = pl.combo || 1, fin = c === 3 || c === 5; k = (fin ? 'atk3_' : c === 2 ? 'atk2_' : 'atk1_') + sd;
    /* ritme tak rata: ancang singkat → ayun cepat → tahan di benturan → pulih (bukan 4 frame sama panjang) */
    const D = fin ? .4 : .28, u = (D - Math.min(D, pl._atk)) / D; f = u < .16 ? 0 : u < .3 ? 1 : u < .62 ? 2 : 3;
    /* tokoh baru: pose serang hanya sekejap (ala Dimraeth), sisa waktu kembali ke pose siap */
    if (HERO_SWD) { f = u < .1 ? 0 : u < .3 ? 1 : u < .5 ? 2 : u < .68 ? 3 : -1; if (f < 0) { k = 'idle_' + sd; f = 0; } }
  }
  else if (moving) {
    const w8 = sd === 'up' ? (HERO_W8U ? 'walk8u_' : 'walk_up') : sd === 'down' && HERO_W8D ? 'walk8d_' : 'walk8s_';
    k = HERO_W8 ? w8 : 'walk_' + sd;
    fps = (k.startsWith('walk8') ? 12 : 9) * Math.min(1.4, Math.max(.7, pl.body.velocity.length() / 70)); } /* 8 frame → 12 fps */
  else { k = 'idle_' + sd; fps = HERO_BLINK ? 2.5 : 4; } /* diam: bernapas pelan */
  if (A.k !== k) { A.k = k; A.t = 0; } else A.t += dt;
  if (f == null) { const n = Math.floor(A.t * fps); f = once ? Math.min(3, n) : n % (k.startsWith('walk8') ? 8 : 4); }
  if (pl.anims.isPlaying) pl.anims.stop();
  let name = k + f;
  if (HERO_BLINK && k.startsWith('idle_') && sd !== 'up' && (performance.now() / 1000) % 3.7 > 3.58) name = 'blink_' + sd + f; /* kedip sesekali */
  if (pl.frame.name !== name) pl.setFrame(name);
  pl.flipX = sd === 'side' && pl.dir === 'left'; /* gambar depan/belakang tidak dicerminkan */
}
{ const W = World.prototype, _cr = W.create;
  W.create = function (data) {
    const r = _cr.apply(this, arguments);
    if (this.pl && IMGEL.hero_arka) {
      this.pl.body.setSize(10, 6).setOffset((HERO_G.fw - 10) / 2, HERO_G.fh - 7);
      if (!this._heroHook) { this._heroHook = 1; this.events.on('postupdate', (t, d) => heroFrame(this, Math.min(.1, d / 1000))); }
    }
    return r;
  };
  const wrap = (fn, after) => {
    const o = W[fn]; if (!o) return;
    W[fn] = function () {
      const pl = this.pl, s0 = pl && [S.hp, S.mp, pl.atkCd], r = o.apply(this, arguments);
      if (pl) after.call(this, pl, s0); return r;
    };
  };
  wrap('attack', function (pl, s0) { if (pl.atkCd > s0[2] && !pl._bow) pl._atk = (pl.combo === 3 || pl.combo === 5) ? .4 : .28; });
  wrap('dash', function (pl) { if (pl.dashStartT === this.t) { pl._roll = .3; pl._atk = 0; } });
  wrap('hurtPlayer', function (pl, s0) { if (S.hp < s0[0]) pl._hurt = .25; });
  wrap('magic', function (pl, s0) { if (S.mp < s0[1] || pl.atkCd !== s0[2]) pl._cast = .4; });
  wrap('shootArrow', function (pl) { pl._bow = .4; pl._atk = 0; });
  wrap('spin', function (pl) { pl._heavy = .45; });
}
