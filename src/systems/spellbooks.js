'use strict';
// T503: Varian Lepas Mantra (Quick-Cast vs Charged Spell >= 0,35 dtk) & T504: Buku Mantra (Spellbooks)
const SPELLBOOK_INFO = {
  fire: { n: 'Kitab Bara Purba', title: 'BOLA API BERCABANG', msg: 'Modifikasi aktif: Bola Api kini membelah menjadi 2 proyektil bara!' },
  dash: { n: 'Kitab Langkah Bayangan', title: 'BAYANGAN PELEDAK', msg: 'Modifikasi aktif: Dash meninggalkan bayangan yang meledak melukai musuh!' },
  thorn: { n: 'Kitab Duri Rawa', title: 'PERISAI DURI', msg: 'Modifikasi aktif: Menahan serangan memantulkan 25% kerusakan & meracuni penyerang!' },
};
{
  const W = World.prototype;
  const pump0 = W.pump;
  W.pump = function () {
    if (Input.q.length) {
      for (let i = 0; i < Input.q.length; i++) {
        if (Input.q[i] === 'b_charged') {
          Input.q.splice(i, 1);
          if (!UIH && G.lock <= 0 && !this.trans && !this.pl?.dead && !G.title) {
            this.pl.atkCd = 0;
            this.magic(true);
          }
          break;
        }
      }
    }
    return pump0.apply(this, arguments);
  };
  const useItem0 = W.useItem;
  W.useItem = function (id) {
    const it = ITEMS[id];
    if (it && it.spellbook) {
      const k = it.spellbook;
      S.spellbooks = S.spellbooks || {};
      if (S.spellbooks[k]) {
        popWorld(this.pl.x, this.pl.y - 28, 'Sudah dikuasai!', 'xp');
        sfx('buzz');
        return false;
      }
      S.spellbooks[k] = 1;
      addItem(id, -1); sfx('fanfare');
      this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 18);
      const info = SPELLBOOK_INFO[k];
      banner(info.title, info.n.toUpperCase(), true, 2200);
      popWorld(this.pl.x, this.pl.y - 32, info.title + '!', 'crit');
      updHud();
      return true;
    }
    return useItem0.apply(this, arguments);
  };
  // T503: Charged Spell (tahan B >= 0,35 dtk) + T504: Bola Api bercabang 2 (S.spellbooks.fire)
  const magic0 = W.magic;
  W.magic = function (forceCharged) {
    const pl = this.pl; if (!pl || pl.dead) return;
    const charged = !!(forceCharged || (Input.holdB || 0) >= .35 || (this._holdBT || 0) >= .35);
    Input.holdB = 0; this._holdBT = 0;
    this._castingCharged = charged;
    const shotsBefore = this.shots ? this.shots.length : 0;
    const mp0 = S.mp;
    try {
      const r = magic0.apply(this, arguments);
      if (S.mp < mp0) {
        this._lastCastT = this.t;
        const newShot = this.shots && this.shots.length > shotsBefore ? this.shots[this.shots.length - 1] : null;
        if (charged) {
          const extraMp = Math.min(S.mp, Math.max(1, Math.ceil((mp0 - S.mp) * .5)));
          S.mp -= extraMp; updHud();
          this.spawnChargeCircle(pl.x, pl.y);
          popWorld(pl.x, pl.y - 34, 'MANTRA PENUH!', 'crit');
          if (newShot && newShot.kind === 'fire') {
            newShot.pierce = true; newShot.dmg = Math.round(newShot.dmg * 1.5);
            newShot.chargedFire = true; newShot.s.setScale((newShot.s.scaleX || 1) * 1.45);
          }
        }
        if (newShot && newShot.kind === 'fire' && S.spellbooks && S.spellbooks.fire) {
          const a = Math.atan2(newShot.vy, newShot.vx), spd = Math.hypot(newShot.vx, newShot.vy) || 200;
          newShot.vx = Math.cos(a - .12) * spd; newShot.vy = Math.sin(a - .12) * spd; newShot.s.setRotation(a - .12);
          const a2 = a + .14, s2 = this.add.sprite(newShot.gx, newShot.gy - 9, 'fire').play('fire').setRotation(a2).setScale(newShot.s.scaleX);
          this.shots.push({
            s: s2, gx: newShot.gx, gy: newShot.gy, vx: Math.cos(a2) * spd, vy: Math.sin(a2) * spd,
            life: newShot.life, kind: 'fire', mine: 1, dmg: Math.round(newShot.dmg * .75), pierce: newShot.pierce
          });
        }
      }
      return r;
    } finally { this._castingCharged = false; }
  };
  const cast0 = W.castSpell;
  if (cast0) W.castSpell = function (id) {
    const r = cast0.apply(this, arguments);
    if (this._castingCharged && this.pl) {
      for (const e of this.enemies || []) {
        if (e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 105) {
          this.hitEnemy(e, Math.round(stat().mag * .45), false, 0, 0);
        }
      }
    }
    return r;
  };
  // T504: Dash meninggalkan bayangan peledak (S.spellbooks.dash)
  const dash0 = W.dash;
  W.dash = function () {
    const pl = this.pl, x0 = pl && pl.x, y0 = pl && pl.y;
    const r = dash0.apply(this, arguments);
    if (pl && pl.dashStartT === this.t && S.spellbooks && S.spellbooks.dash) {
      const sh = this.add.ellipse(x0, y0 - 6, 16, 22, 0x9a6ad8, .65).setDepth(y0);
      this.tweens.add({
        targets: sh, scaleX: 1.4, scaleY: 1.4, alpha: .15, duration: 420,
        onComplete: () => {
          sh.destroy();
          if (!this.pl || this.pl.dead) return;
          sfxAt('boom', x0, y0, this);
          if (this.jx) this.jx('spark', x0, y0 - 8, 12, { tint: 0xc89aff });
          const dmg = Math.max(2, Math.round(stat().mag * .85));
          for (const e of this.enemies || []) {
            if (e.hp > 0 && Math.hypot(e.spr.x - x0, e.spr.y - y0) < 42) {
              this.hitEnemy(e, dmg, false, (e.spr.x - x0) / 30, (e.spr.y - y0) / 30);
            }
          }
        }
      });
    }
    return r;
  };
  // T504: Perisai Duri memantulkan 25% kerusakan (S.spellbooks.thorn)
  const hurt0 = W.hurtPlayer;
  W.hurtPlayer = function (atk, sx, sy, fx) {
    const hp0 = S.hp, r = hurt0.apply(this, arguments);
    if (S.hp < hp0 && S.spellbooks && S.spellbooks.thorn && sx != null && sy != null) {
      const refDmg = Math.max(1, Math.round((atk || 4) * .25));
      for (const e of this.enemies || []) {
        if (e.hp > 0 && Math.hypot(e.spr.x - sx, e.spr.y - sy) < 48) {
          e.hp = Math.max(0, e.hp - refDmg);
          if (this.poisonEnemy) this.poisonEnemy(e, 2, 3);
          popWorld(e.spr.x, e.spr.y - 20, 'DURI! -' + refDmg, '#8ae86a');
          if (e.hp <= 0) this.killEnemy(e);
          break;
        }
      }
    }
    return r;
  };
  // Bara tanah dari Bola Api Besar (T503) & cincin isi daya saat menahan B
  const upd0 = W.update;
  W.update = function (time, dl) {
    const dt = Math.min(dl, 100) / 1000;
    if (!this.passive && !G.title && !G.lock && this.pl && !this.pl.dead) {
      if (Input.keys.b || (Input.aim && Input.aim.on)) {
        this._holdBT = (this._holdBT || 0) + dt;
        if (this._holdBT >= .25 && Math.random() < dt * 12 && this.jx) {
          this.jx('mote', this.pl.x, this.pl.y - 4, 1, { tint: 0xffb04a, rx: 10, ry: 4 });
        }
      } else this._holdBT = 0;
      for (const p of this.shots || []) {
        if (p.chargedFire && (!p._embT || this.t - p._embT > .14)) {
          p._embT = this.t;
          this.spawnEmber(p.gx, p.gy);
        }
      }
      this.updEmbers(dt);
    }
    return upd0.call(this, time, dl);
  };
}
Object.assign(World.prototype, {
  spawnChargeCircle(x, y) {
    const g = this.add.graphics().setDepth(y - 1), o = { r: 6 };
    this.tweens.add({
      targets: o, r: 28, duration: 280,
      onUpdate: () => {
        g.clear(); g.lineStyle(2, 0xffd25a, 1 - o.r / 30).strokeEllipse(x, y - 2, o.r * 2, o.r * 1.1);
      },
      onComplete: () => g.destroy()
    });
    if (this.jx) this.jx('spark', x, y - 6, 10, { tint: 0xffe08a });
  },
  spawnEmber(x, y) {
    this._embers = this._embers || [];
    const s = this.add.ellipse(x, y - 2, 14, 7, 0xff6a2a, .45).setDepth(y - 2);
    this._embers.push({ x, y, t: 2, tick: .4, s });
  },
  updEmbers(dt) {
    if (!this._embers || !this._embers.length) return;
    for (const em of this._embers) {
      em.t -= dt; em.tick -= dt;
      if (em.tick <= 0) {
        em.tick = .5;
        if (this.jx) this.jx('mote', em.x, em.y - 4, 1, { tint: 0xff8a3a, rx: 5, ry: 2 });
        for (const e of this.enemies || []) {
          if (e.hp > 0 && Math.hypot(e.spr.x - em.x, e.spr.y - em.y) < 18) {
            if (this.burnEnemy) this.burnEnemy(e, 2, 2);
          }
        }
      }
      if (em.t <= 0) em.s.destroy();
    }
    this._embers = this._embers.filter(em => em.t > 0);
  },
});
