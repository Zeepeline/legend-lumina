'use strict';
// H1: Perombakan Busur (tahan bidik laser + tembakan penuh / volley 3 panah) & HUD amunisi dinamis
(() => {
  const s = document.createElement('style');
  s.textContent = '#hud-ammo{position:absolute;bottom:6px;right:6px;display:none;align-items:center;' +
    'gap:5px;padding:2px 7px;border-radius:10px;background:rgba(14,12,24,.84);border:1px solid rgba(255,214,120,.55);' +
    'color:#ffe8a8;font:700 10px "Pixelify Sans",monospace;text-shadow:0 1px 0 #000;z-index:12;pointer-events:none}' +
    '#hud-ammo.hot{border-color:#ffd055;color:#fff4c2}';
  document.head.appendChild(s);
})();

function ensureAmmoHud() {
  if (typeof UI === 'undefined' || !UI) return null;
  let el = document.getElementById('hud-ammo');
  if (!el) {
    el = document.createElement('div');
    el.id = 'hud-ammo';
    UI.appendChild(el);
  }
  return el;
}

function updAmmoHud() {
  const el = ensureAmmoHud();
  if (!el || typeof S === 'undefined' || !S) return;
  const wt = (typeof ITEMS !== 'undefined' && S.eq && ITEMS[S.eq.wpn] && ITEMS[S.eq.wpn].wt) || 'sword';
  if (wt !== 'bow' || (typeof G !== 'undefined' && G.title)) {
    el.style.display = 'none';
    return;
  }
  const n = (S.inv && S.inv.sarrow) || 0;
  el.style.display = 'flex';
  el.classList.toggle('hot', n > 0);
  el.innerHTML = `<span>🏹 Tajam: <b>${n}</b></span><span style="opacity:.7">·</span><span>∞ Biasa</span>`;
}

(() => {
  const updHud0 = updHud;
  updHud = function () { // eslint-disable-line no-global-assign
    updHud0.apply(this, arguments);
    updAmmoHud();
  };

  const W = World.prototype;

  function fireChargedBow(sc, tier) {
    const pl = sc.pl;
    if (!pl || pl.dead) return;
    sc._bowFiredAt = performance.now();
    const st = stat(), a = sc.aimAngle(), dx = Math.cos(a), dy = Math.sin(a);
    pl.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    pl.flipX = pl.dir === 'left';
    pl.atkCd = .32;
    pl.atkT = .18;
    pl.anims.stop();
    pl.setFrame((pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir) + '3');

    const b = sc.sword.setTexture('wbow').setVisible(true).setPosition(pl.x + dx * 6, pl.y - 9 + dy * 4)
      .setRotation(a).setFlipY(false).setTint(tier >= 2 ? 0xff9a55 : 0xffe08a).setDepth(pl.y + (dy < 0 ? -3 : 4));
    sc.time.delayedCall(200, () => b.setVisible(false));

    const sharp = has('sarrow');
    if (sharp) addItem('sarrow', -1);
    const angles = tier >= 2 ? [a, a - .16, a + .16] : [a];
    const spd = tier >= 2 ? 410 : 370;
    const baseMul = tier >= 2 ? 2.15 : 1.9;
    angles.forEach((ang, idx) => {
      const vx = Math.cos(ang), vy = Math.sin(ang);
      const s = sc.add.image(pl.x + vx * 8, pl.y - 9 + vy * 6, 'arrow').setRotation(ang);
      s.setTint(tier >= 2 && idx === 0 ? 0xff7040 : 0xffe07a);
      sc.shots.push({
        s, gx: pl.x + vx * 8, gy: pl.y - 9 + vy * 6, vx: vx * spd, vy: vy * spd,
        life: .95, kind: 'arrow', mine: 1,
        dmg: st.atk * (idx === 0 ? baseMul : 1.15) * (sharp ? 1.5 : 1),
        pierce: true, _forceCrit: tier >= 2 && idx === 0
      });
    });

    sfx(tier >= 2 ? 'crit' : 'swing_heavy');
    sc.camShake(tier >= 2 ? 120 : 75, tier >= 2 ? .005 : .003);
    popWorld(pl.x, pl.y - 30, tier >= 2 ? 'TEMBAKAN MAUT!' : 'BIDIK PENUH!', 'crit');
    if (sc.jx) sc.jx('spark', pl.x + dx * 12, pl.y - 8 + dy * 8, tier >= 2 ? 12 : 7, { tint: 0xffd26a });
    updHud();
  }

  function clearAimGfx(sc) {
    if (sc._bowAimGfx) sc._bowAimGfx.clear();
    if (sc.pl) sc.pl._channellingMove = false;
  }

  function isNearInter(sc) {
    const f = sc.front ? sc.front(11) : { x: sc.pl.x, y: sc.pl.y };
    for (const it of sc.inter || []) {
      if (it.rect) {
        const [rx, ry, rw, rh] = it.rect;
        if (f.x > rx && f.x < rx + rw && f.y > ry && f.y < ry + rh) return true;
        continue;
      }
      const x = it.npc ? it.npc.spr.x : it.x, y = it.npc ? it.npc.spr.y - 3 : it.y;
      if (Math.hypot(x - f.x, y - f.y) < it.r) return true;
    }
    return false;
  }

  function drawAimLaser(sc, t) {
    if (!sc._bowAimGfx) sc._bowAimGfx = sc.add.graphics().setDepth(9990);
    const g = sc._bowAimGfx, pl = sc.pl;
    g.clear();
    if (t < .16) return;
    const a = sc.aimAngle(), dx = Math.cos(a), dy = Math.sin(a);
    const ox = pl.x + dx * 8, oy = pl.y - 9 + dy * 6;
    const tier = t >= .85 ? 2 : t >= .45 ? 1 : 0;
    const col = tier === 2 ? 0xff5a3a : tier === 1 ? 0xffe066 : 0xb8f0ff;
    const len = 155 + Math.min(80, t * 70);
    for (let d = 10; d < len; d += 12) {
      const al = (1 - d / len) * (tier > 0 ? .92 : .68);
      const ex = ox + dx * Math.min(len, d + 7), ey = oy + dy * Math.min(len, d + 7);
      g.lineStyle(3, 0x181010, al * .7);
      g.beginPath(); g.moveTo(ox + dx * d, oy + dy * d); g.lineTo(ex, ey); g.strokePath();
      g.lineStyle(tier === 2 ? 2 : 1.5, col, al);
      g.beginPath(); g.moveTo(ox + dx * d, oy + dy * d); g.lineTo(ex, ey); g.strokePath();
    }
    const tx = ox + dx * len, ty = oy + dy * len;
    const r = tier === 2 ? 7 + Math.sin(sc.t * 18) * 1.5 : 5.5;
    g.lineStyle(3, 0x181010, .75); g.strokeCircle(tx, ty, r);
    g.lineStyle(1.6, col, .95); g.strokeCircle(tx, ty, r);
    const pct = Math.min(1, t / .85);
    g.fillStyle(col, .95).fillRect(pl.x - 10, pl.y + 4, Math.round(20 * pct), 2);
  }

  const actionA0 = W.actionA;
  W.actionA = function (isHeavy) {
    const wt = (ITEMS[S.eq?.wpn] || {}).wt || 'sword';
    if (wt === 'bow' && isHeavy && !isNearInter(this)) {
      if (performance.now() - (this._bowFiredAt || 0) > 120) {
        const t = Math.max(this._bowChargeT || 0, this._bowPrevHold || 0);
        fireChargedBow(this, t >= .85 ? 2 : 1);
      }
      this._bowChargeT = 0; this._bowPrevHold = 0; this._bowWasHeld = false;
      clearAimGfx(this);
      return;
    }
    return actionA0.apply(this, arguments);
  };

  const shoot0 = W.shootArrow;
  W.shootArrow = function () {
    const r = shoot0.apply(this, arguments);
    updAmmoHud();
    return r;
  };

  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (this._curShot && this._curShot._forceCrit) crit = true;
    return hit0.call(this, e, base, crit, nx, ny);
  };

  const upd0 = W.update;
  W.update = function (time, dms) {
    const dt = Math.min(dms || 16, 50) / 1000;
    const wt = (ITEMS[S.eq?.wpn] || {}).wt || 'sword';
    const locked = !!UIH || G.lock > 0 || G.title || this.trans;
    if (!this.passive && this.pl && !this.pl.dead && !locked && wt === 'bow') {
      if (Input.keys && Input.keys.a && !isNearInter(this)) {
        this._bowWasHeld = true;
        this._bowChargeT = (this._bowChargeT || 0) + dt;
        this._bowPrevHold = this._bowChargeT;
        if (this._bowChargeT >= .16) {
          this.pl._channellingMove = true;
          drawAimLaser(this, this._bowChargeT);
          if (Math.random() < dt * 8 && this.jx) {
            this.jx('mote', this.pl.x, this.pl.y - 8, 1, { tint: this._bowChargeT >= .85 ? 0xff7040 : 0xffe066, rx: 6, ry: 4 });
          }
        }
      } else if (this._bowWasHeld) {
        const held = this._bowChargeT || 0;
        this._bowWasHeld = false;
        clearAimGfx(this);
        if (held >= .45 && performance.now() - (this._bowFiredAt || 0) > 120) {
          fireChargedBow(this, held >= .85 ? 2 : 1);
        }
        this._bowChargeT = 0;
      }
    } else if (this._bowWasHeld || this._bowAimGfx) {
      this._bowWasHeld = false;
      this._bowChargeT = 0;
      clearAimGfx(this);
    }
    return upd0.apply(this, arguments);
  };
})();
