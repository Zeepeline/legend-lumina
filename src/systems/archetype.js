'use strict';
// T505: Archetype Gabungan 2 Aliran Jurus (Hybrid Class Bonus ala Dimraeth)
const ARCHETYPES = {
  battlemage: {
    id: 'battlemage',
    n: 'Keringat & Bara (Battlemage)',
    short: 'Keringat & Bara',
    d: 'Pedang/Kapak + Sihir: setelah merapal mantra, tebasan fisik dalam 2 dtk menyala (+25% dmg & bakar).'
  },
  ranger: {
    id: 'ranger',
    n: 'Pengintai Senja (Shadow Ranger)',
    short: 'Pengintai Senja',
    d: 'Busur/Tombak + Dash: setelah Dash atau Lolos, serangan berikutnya pasti Kritikal.'
  },
  paladin: {
    id: 'paladin',
    n: 'Penjaga Kristal (Paladin)',
    short: 'Penjaga Kristal',
    d: 'Sihir Cahaya/Perisai + Senjata jarak dekat: menahan serangan memulihkan 5% stamina & meredam 20% dmg.'
  }
};
function getArchetype() {
  if (typeof S === 'undefined' || !S) return ARCHETYPES.battlemage;
  const wt = (typeof ITEMS !== 'undefined' && S.eq && ITEMS[S.eq.wpn] && ITEMS[S.eq.wpn].wt) || 'sword';
  const hasDash = (S.learn && S.learn.dash) || (S.mast && S.mast.dash > 0);
  const hasHoly = (S.learn && (S.learn.heal || S.learn.holy)) || (S.eq && S.eq.acc === 'cshield') || S.spell === 'heal' || S.spell === 'holy';
  if ((wt === 'bow' || wt === 'spear') && hasDash) return ARCHETYPES.ranger;
  if (hasHoly && wt !== 'bow') return ARCHETYPES.paladin;
  return ARCHETYPES.battlemage;
}
{
  const W = World.prototype;
  const magic0 = W.magic;
  W.magic = function () {
    const mp0 = S.mp, r = magic0.apply(this, arguments);
    if (S.mp < mp0) this._bmFlameT = this.t + 2.2;
    return r;
  };
  const cast0 = W.castSpell;
  if (cast0) W.castSpell = function () {
    const mp0 = S.mp, r = cast0.apply(this, arguments);
    if (S.mp < mp0) this._bmFlameT = this.t + 2.2;
    return r;
  };
  const dash0 = W.dash;
  W.dash = function () {
    const r = dash0.apply(this, arguments);
    if (this.pl && this.pl.dashStartT === this.t) this._rangerCritT = this.t + 2.2;
    return r;
  };
  const hit0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (e && e.hp > 0 && this.pl && !this.pl.dead) {
      const arch = getArchetype().id;
      if (arch === 'battlemage' && !this.curElem && !this._inShots && this.t < (this._bmFlameT || 0)) {
        this._bmFlameT = 0;
        base = Math.round(base * 1.25);
        if (this.burnEnemy) this.burnEnemy(e, 2, 2);
        popWorld(e.spr.x, e.spr.y - 22, 'BARA! +25%', '#ff8a3a');
      } else if (arch === 'ranger' && (this.t < (this._rangerCritT || 0) || this.pl.perfectDodged)) {
        this._rangerCritT = 0;
        crit = true;
        popWorld(e.spr.x, e.spr.y - 22, 'BIDIK SENJA!', 'crit');
      }
    }
    return hit0.call(this, e, base, crit, nx, ny);
  };
  const hurt0 = W.hurtPlayer;
  W.hurtPlayer = function (atk, sx, sy, fx) {
    if (getArchetype().id === 'paladin' && this.pl && !this.pl.dead && this.pl.inv <= 0 && !G.lock) {
      const maxSta = stat().maxsta || 100;
      S.sta = Math.min(maxSta, (S.sta || 0) + Math.round(maxSta * .05));
      atk = Math.max(1, Math.round(atk * .8));
      popWorld(this.pl.x, this.pl.y - 34, 'PERISAI KRISTAL!', '#8ae8ff');
      updHud();
    }
    return hurt0.call(this, atk, sx, sy, fx);
  };
}
