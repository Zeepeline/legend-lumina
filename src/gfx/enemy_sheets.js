'use strict';
// Lembar musuh baru dari ChatGPT (assets/img/monsters/esh_<id>.png).
// Atlas 4 frame × 6 baris: idle, move, wind (ancang-ancang), atk, hurt (0-1 kena, 2-3 terhuyung), alert (siaga). Menghadap KANAN.
// Varian (warna/ukuran) memakai lembar yang sama lewat keepTint/scale (gfx/gptmonsters.js). Musuh biasa mati = putih memudar (combat.js).
const ESH = {
  ghost: { fw: 52, fh: 48, use: { ghost: { r: 9 } }, near: 34 }, /* AI hantu tak punya status serang: dekat pemain = cakar */
  /* humanoid digambar kode (tools/gen_humanoid_sheets.py): skel melempar tulang → 'shoot' dibaca ancang-ancang (eshShoot) */
  skel: { fw: 76, fh: 54, use: { skel: { r: 7, eshShoot: 1 } } },
  slaver: { fw: 76, fh: 50, use: { slaver: { r: 7 } } }, /* Pemburu Liar & Kapten (tools/gen_slaver_sheets.py) */
  slaver_captain: { fw: 114, fh: 80, use: { slaver_captain: { r: 12 } } },
  gchief: { fw: 90, fh: 60, use: { gchief: { r: 9 } } },
  gking: { fw: 94, fh: 64, use: { gking: { r: 12 } } },
  witch: { fw: 94, fh: 56, use: { witch: { r: 10 } } },
  mimic: { fw: 64, fh: 44, use: { mimic: { r: 8 } } },
  samurai: { fw: 96, fh: 80, use: { samurai: { r: 12 } } },
  golem: { fw: 64, fh: 63, use: { golem: { r: 13 }, golemi: { keepTint: 0xbfe2ff, r: 13 }, golemk: { keepTint: 0xe6d2a8, scale: 1.5, r: 18 } } },
  frog: { fw: 40, fh: 33, use: { frog: { r: 8 }, bounty_frog: { scale: 1.55, keepTint: 0x9cff82, r: 12 } } },
  boar: { fw: 42, fh: 35, use: { boar: { r: 9 } } },
  bee: { fw: 30, fh: 29, use: { bee: { r: 6 } } },
  plant: { fw: 44, fh: 42, use: { plant: { r: 8 } } },
  snake: { fw: 38, fh: 33, use: { snake: { r: 7 }, gsnake: { scale: 1.85, r: 11 }, kryos: { scale: 2.3, keepTint: 0xb8eeff, r: 14 } } },
  wisp: { fw: 34, fh: 31, use: { wisp: { r: 6 } }, near: 36 },
  shroom: { fw: 40, fh: 37, use: { shroom: { r: 8 }, squeen: { scale: 1.75, keepTint: 0xf0b8ff, r: 12 } } },
  bat: { fw: 32, fh: 31, use: { bat: { r: 7 }, batc: { keepTint: 0x98c8ff, r: 7 }, bounty_gargoyle: { scale: 1.45, keepTint: 0xff7a6a, r: 11 } } },
  salam: { fw: 40, fh: 30, use: { salam: { r: 7 } } },
};
IMG_LIST.push(...Object.keys(ESH).map(k => 'esh_' + k));
function regEnemySheets(sc) {
  const T = sc.textures, A = sc.anims;
  for (const id in ESH) {
    const E = ESH[id], key = 'esh_' + id, img = IMGEL[key]; if (!img) continue;
    if (T.exists(key) && T.get(key).frameTotal <= 1) T.remove(key); /* buildTextures sudah memasang gambar utuh dengan nama sama → ganti jadi spritesheet */
    if (!T.exists(key)) T.addSpriteSheet(key, img, { frameWidth: E.fw, frameHeight: E.fh });
    const mk = (n, row, fps, rep) => {
      if (A.exists(key + '_' + n)) return;
      A.create({ key: key + '_' + n, frames: A.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: fps, repeat: rep });
    };
    mk('idle', 0, 5, -1); mk('mv', 1, 7, -1); mk('wind', 2, 7, 0); mk('atk', 3, E.near ? 8 : 12, E.near ? -1 : 0); mk('alert', 5, 8, 0);
    for (const t in E.use) {
      if (!ENEMY[t]) continue;
      ENEMY[t].tex = key; ENEMY[t].esh = 1; delete ENEMY[t].ch; /* sprite kode 9-frame (charAnim) tak dipakai lagi */ if (E.near) ENEMY[t].eshNear = E.near;
      Object.assign(ENEMY[t], E.use[t]); if (!E.use[t].scale) delete ENEMY[t].scale;
    }
  }
}
{ const _ag = typeof applyGptMonsters === 'function' ? applyGptMonsters : null;
  applyGptMonsters = function (sc) { if (_ag) _ag(sc); regEnemySheets(sc); };
}
// pemilih animasi: dijalankan setelah AI tiap frame (AI lama mengatur flipX untuk sprite yang menghadap kiri → ditimpa di sini)
function eshFrame(sc, dt) {
  const pl = sc.pl; if (!sc.enemies) return;
  for (const e of sc.enemies) {
    const s = e.spr, D = e.D; if (!D || !D.esh || e.hp <= 0 || !s.active) continue;
    const key = D.tex, X = e._esh || (e._esh = { a: '', al: 0 });
    const vx = s.body ? s.body.velocity.x : 0, vy = s.body ? s.body.velocity.y : 0, spd = Math.hypot(vx, vy);
    if (e.alert === 2 && !X.al) { X.al = 1; e._alertT = .55; } else if (e.alert !== 2) X.al = 0;
    if (e._alertT > 0) e._alertT -= dt; if (e._hurtT > 0) e._hurtT -= dt;
    let a; if (e.st !== 'smash') X.sm = 0;
    const isWind = ['wind', 'swind', 'cwind', 'throw', 'cast', 'ring', 'spit', 'calling', 'frog_wind', 'walk_wind'].includes(e.st)
      || (D.eshShoot && e.st === 'shoot') || e.swoopPrep > 0 || e._preShoot > 0;
    const isAtk = ['atk', 'lunge', 'run', 'shoot', 'charge', 'slam', 'leap', 'swoop', 'frog_atk', 'walk_atk'].includes(e.st)
      || (e.st === 'rec' && e.t > .55) || e._postShoot > 0;
    if (!e.fleeing && !e.leash && (e.alert >= 2 || isWind || isAtk || (pl && Math.hypot(pl.x - s.x, pl.y - s.y) < 120))) {
      if (pl) s.flipX = pl.x < s.x;
    } else if (Math.abs(vx) > 6) {
      s.flipX = vx < -6;
    }
    if (e._hurtT > 0) { s.anims.stop(); s.setFrame(16 + (e._hurtT < .15 ? 1 : 0)); X.a = 'hurt'; continue; }
    if (e.st === 'stun' || e.staggerT > 0 || e.frozen > 0) {
      s.anims.stop(); s.setFrame(18 + (Math.floor(sc.t * 4) % 2)); X.a = 'stag'; continue;
    }
    if (e.st === 'smash') { X.sm = X.sm || sc.time.now; a = sc.time.now - X.sm < 380 ? 'wind' : 'atk'; }
    else if (isWind) a = 'wind';
    else if (isAtk) a = 'atk';
    else if (D.eshNear && pl && Math.hypot(pl.x - s.x, pl.y - s.y) < D.eshNear && !e.faded) a = 'atk';
    else if (e._alertT > 0 || e.st === 'roar') a = 'alert';
    else a = spd > 6 ? 'mv' : 'idle';
    if (X.a !== a) { X.a = a; s.play(key + '_' + a, true); }
    if (s.anims) s.anims.timeScale = a === 'mv' ? clamp(spd / Math.max(20, D.spd || 40), .75, 1.5) : 1;
  }
}
{ const W = World.prototype, _cr = W.create, _hit = W.hitEnemy;
  W.create = function () {
    const r = _cr.apply(this, arguments);
    if (!this._eshHook) { this._eshHook = 1; this.events.on('postupdate', (t, d) => eshFrame(this, Math.min(.1, d / 1000))); }
    return r;
  };
  W.hitEnemy = function (e) { const r = _hit.apply(this, arguments); if (e && e.D && e.D.esh && e.hp > 0) e._hurtT = .28; return r; };
}
