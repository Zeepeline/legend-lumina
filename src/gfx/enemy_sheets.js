'use strict';
// Lembar musuh baru dari ChatGPT (assets/raw/enemy/<id>.png → tools/gen_enemy.py → assets/img/esh_<id>.png).
// Atlas 4 frame × 6 baris: idle, move, wind (ancang-ancang), atk, hurt (0-1 kena, 2-3 terhuyung), alert (siaga). Menghadap KANAN.
// Varian (warna/ukuran) memakai lembar yang sama lewat keepTint/scale (gfx/gptmonsters.js). Musuh biasa mati = putih memudar (combat.js).
const ESH = {
  ghost: { fw: 52, fh: 48, use: { ghost: { r: 9 } }, near: 34 }, /* AI hantu tak punya status serang: dekat pemain = cakar */
  golem: { fw: 64, fh: 63, use: { golem: { r: 13 }, golemi: { keepTint: 0xbfe2ff, r: 13 }, golemk: { keepTint: 0xe6d2a8, scale: 1.5, r: 18 } } },
};
IMG_LIST.push(...Object.keys(ESH).map(k => 'esh_' + k));
function regEnemySheets(sc) {
  const T = sc.textures, A = sc.anims;
  for (const id in ESH) {
    const E = ESH[id], key = 'esh_' + id, img = IMGEL[key]; if (!img) continue;
    if (!T.exists(key)) T.addSpriteSheet(key, img, { frameWidth: E.fw, frameHeight: E.fh });
    const mk = (n, row, fps, rep) => {
      if (A.exists(key + '_' + n)) return;
      A.create({ key: key + '_' + n, frames: A.generateFrameNumbers(key, { start: row * 4, end: row * 4 + 3 }), frameRate: fps, repeat: rep });
    };
    mk('idle', 0, 5, -1); mk('mv', 1, 7, -1); mk('wind', 2, 7, 0); mk('atk', 3, E.near ? 8 : 12, E.near ? -1 : 0); mk('alert', 5, 8, 0);
    for (const t in E.use) {
      if (!ENEMY[t]) continue;
      ENEMY[t].tex = key; ENEMY[t].esh = 1; if (E.near) ENEMY[t].eshNear = E.near;
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
    if (pl) s.flipX = pl.x < s.x;
    if (e.alert === 2 && !X.al) { X.al = 1; e._alertT = .55; } else if (e.alert !== 2) X.al = 0;
    if (e._alertT > 0) e._alertT -= dt; if (e._hurtT > 0) e._hurtT -= dt;
    let a;
    if (e._hurtT > 0) { s.anims.stop(); s.setFrame(16 + (e._hurtT < .15 ? 1 : 0)); X.a = 'hurt'; continue; }
    if (e.staggerT > 0 || e.frozen > 0) { s.anims.stop(); s.setFrame(18 + (Math.floor(sc.t * 4) % 2)); X.a = 'stag'; continue; }
    if (['wind', 'swind', 'cwind', 'throw'].includes(e.st)) a = 'wind';
    else if (['atk', 'lunge', 'run', 'shoot', 'charge', 'slam'].includes(e.st) || (e.st === 'rec' && e.t > .55)) a = 'atk';
    else if (D.eshNear && pl && Math.hypot(pl.x - s.x, pl.y - s.y) < D.eshNear && !e.faded) a = 'atk';
    else if (e._alertT > 0) a = 'alert';
    else a = s.body && s.body.velocity.length() > 6 ? 'mv' : 'idle';
    if (X.a !== a) { X.a = a; s.play(key + '_' + a, true); }
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
