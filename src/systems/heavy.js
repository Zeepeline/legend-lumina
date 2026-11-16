'use strict';
// Serangan Berat (Heavy Attack) (T482)
// Tahan SERANG >= 0.4 detik lalu lepas: kerusakan x1.8, stamina x2, poise musuh -2, garis ayunan lebih tebal. Tetap bisa ditangkis musuh elit.

(() => {
  const W = World.prototype;
  const _origAttack = W.attack;
  const _origHitEnemy = W.hitEnemy;

  // Tangani event 'heavy' dari input.q di pump()
  const _origPump = W.pump;
  W.pump = function () {
    if (Input.q.length) {
      for (let i = 0; i < Input.q.length; i++) {
        if (Input.q[i] === 'heavy') {
          Input.q.splice(i, 1);
          if (!UIH && G.lock <= 0 && !this.trans && !this.pl?.dead && !G.title) {
            this.actionA(true);
          }
          break;
        }
      }
    }
    return _origPump.apply(this, arguments);
  };

  // Bungkus actionA agar meneruskan parameter isHeavy
  const _origActionA = W.actionA;
  W.actionA = function (isHeavy) {
    if (!isHeavy) return _origActionA.apply(this, arguments);
    const f = this.front(11);
    let best = null, bd = 1e9;
    for (const it of this.inter) {
      if (it.rect) {
        const [rx, ry, rw, rh] = it.rect;
        if (f.x > rx && f.x < rx + rw && f.y > ry && f.y < ry + rh && bd > 5) {
          bd = 5; best = it;
        }
        continue;
      }
      const x = it.npc ? it.npc.spr.x : it.x, y = it.npc ? it.npc.spr.y - 3 : it.y;
      const d = Math.hypot(x - f.x, y - f.y);
      if (d < it.r && d < bd) { bd = d; best = it; }
    }
    if (best) {
      this.pl.setVelocity(0);
      sfx('ok');
      best.fn();
      return;
    }
    this.attack(true);
  };

  // Bungkus attack untuk serangan berat
  W.attack = function (isHeavy) {
    const pl = this.pl;
    if (!pl || pl.dead) return;

    if (isHeavy) {
      this._isHeavyAttack = true;
      if (typeof S !== 'undefined' && S && S.sta != null) {
        const wt = (ITEMS[S.eq.wpn] && ITEMS[S.eq.wpn].wt) || 'sword';
        const cost = typeof soulCost === 'function' ? soulCost(SOUL.atk[wt] || 12) : 12;
        S.sta = Math.max(0, S.sta - cost);
      }
      popWorld(pl.x, pl.y - 28, 'BERAT!', 'crit');
      this.camShake(80, 0.004);
    }

    try {
      return _origAttack.call(this);
    } finally {
      this._isHeavyAttack = false;
    }
  };

  // Modifikasi hitEnemy saat serangan berat
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (this._isHeavyAttack && e && e.hp > 0) {
      base = (base || 0) * 1.8;
      if (e.poise != null) {
        e.poise = Math.max(0, e.poise - 1);
      }
      this.camShake(110, 0.006);
    }
    return _origHitEnemy.call(this, e, base, crit, nx, ny);
  };
})();
