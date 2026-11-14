'use strict';
// Pertarungan Souls-lite "menantang tapi adil" (arah Dimraeth, docs/GAME_DESIGN.md bag. Pertarungan):
// - serangan & berguling (dash, sudah kebal sesaat) memakan stamina; stamina berhenti pulih sebentar setelah dipakai
// - Botol Cahaya: penyembuh isi ulang (S.flask), terisi penuh di patung teleport, saat tidur, dan saat bangkit setelah kalah
// - kalah: separuh emas tertinggal sebagai "Jejak Cahaya" di tempat jatuh; ambil kembali sebelum kalah lagi (S.lost)
// Kesulitan Santai (OPT.diff 0) memotong biaya stamina separuh.
const SOUL = { atk: { sword: 12, spear: 14, axe: 20, bow: 8 }, roll: 22, regenDelay: .7, flaskHeal: .45, flaskT: .55, lostR: 18 };
function flaskOf() {
  const maxF = (typeof OPT !== 'undefined' && OPT.diff === 2) ? 2 : 3;
  if (!S.flask) S.flask = { n: maxF, max: maxF };
  else S.flask.max = maxF;
  if (S.flask.n > S.flask.max) S.flask.n = S.flask.max;
  return S.flask;
}
function soulCost(n) { return OPT.diff === 0 ? Math.round(n / 2) : n; }
function refillFlask(sc) {
  const F = flaskOf(); if (F.n >= F.max) return;
  F.n = F.max; updHud(); if (sc && sc.pl) popWorld(sc.pl.x, sc.pl.y - 30, 'Botol Cahaya terisi ' + F.n + '/' + F.max, 'heal');
}
{
  const W = World.prototype;
  // stamina: biaya serangan & berguling
  const spend = (sc, n) => {
    if (S.sta == null) S.sta = stat().maxsta || 100;
    if (S.sta < Math.min(n, 6)) {
      if (!sc.tiredT || sc.t - sc.tiredT > 1) { sc.tiredT = sc.t; popWorld(sc.pl.x, sc.pl.y - 30, 'Lelah!', 'mpc'); sfx('buzz'); }
      return false;
    }
    S.sta = Math.max(0, S.sta - n); sc.staDelay = SOUL.regenDelay; return true;
  };
  const attack0 = W.attack;
  W.attack = function () {
    const pl = this.pl; if (!pl || pl.dead || pl.atkCd > 0) return attack0.apply(this, arguments);
    const wt = (ITEMS[S.eq.wpn] && ITEMS[S.eq.wpn].wt) || 'sword';
    if (!spend(this, soulCost(SOUL.atk[wt] || 12))) return;
    return attack0.apply(this, arguments);
  };
  const dash0 = W.dash;
  W.dash = function () {
    if (this.dashCd > 0 || (this.pl && this.pl.dashT > 0)) return dash0.apply(this, arguments);
    if (!spend(this, soulCost(SOUL.roll))) return;
    return dash0.apply(this, arguments);
  };
  const updSta0 = W.updStamina; // jeda pulih setelah memakai stamina
  W.updStamina = function (dt, sprint, moving) {
    if (this.staDelay > 0) { this.staDelay -= dt; if (!(sprint && moving)) return; }
    return updSta0.call(this, dt, sprint, moving);
  };
  // Botol Cahaya dulu, ramuan biasa bila botol habis
  const drink0 = W.drink;
  W.drink = function () {
    const F = flaskOf(), st = stat(), pl = this.pl;
    if (F.n <= 0 || this.flaskT > 0) return drink0.apply(this, arguments);
    if (S.hp >= st.maxhp) { popWorld(pl.x, pl.y - 30, 'HP penuh', 'heal'); return; }
    F.n--; this.flaskT = SOUL.flaskT; sfx('ok'); updHud(); // minum butuh waktu: rentan diserang (adil, bukan instan)
    this.time.delayedCall(SOUL.flaskT * 1000, () => {
      if (!this.pl || this.pl.dead) return; const h = Math.round(stat().maxhp * SOUL.flaskHeal);
      S.hp = Math.min(stat().maxhp, S.hp + h); popWorld(this.pl.x, this.pl.y - 30, '+' + h, 'heal');
      this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 10); updHud();
    });
  };
  const useWarp0 = W.useWarp;
  W.useWarp = function () { refillFlask(this); return useWarp0.apply(this, arguments); };
  // kalah: catat Jejak Cahaya (separuh emas yang hilang) di tempat jatuh
  const defeat0 = W.defeat;
  W.defeat = async function () {
    const pl = this.pl, g0 = S.gold;
    let map = this.M.id, x = pl.x, y = pl.y;
    if (this.M.benua && typeof regionAt === 'function') { map = regionAt(x, y) || this.regId; x -= WORLD_POS[map][0]; y -= WORLD_POS[map][1]; }
    const had = S.lost;
    const r = await defeat0.apply(this, arguments);
    if (S.gold < g0 && !this.M.indoor) {
      S.lost = { map, x: Math.round(x), y: Math.round(y), gold: g0 - S.gold };
      if (had) S.lostGone = had.gold; // jejak lama hilang selamanya
    }
    const F = flaskOf(); F.n = F.max;
    return r;
  };
  // tiap frame: hitung mundur & Jejak Cahaya
  const update0 = W.update;
  W.update = function (time, dl) {
    update0.call(this, time, dl);
    if (this.passive || G.title || !this.pl) return;
    soulHudWrap();
    const dt = Math.min(dl, 100) / 1000; if (this.flaskT > 0) this.flaskT -= dt;
    this.updLost();
  };
}
Object.assign(World.prototype, {
  updLost() {
    const L = S.lost;
    if (!L) { if (this.lostS) { this.lostS.destroy(); this.lostS = null; } return; }
    let gx = L.x, gy = L.y;
    if (this.M.benua) { if (!WORLD_POS[L.map] || !isOutdoorRegion(L.map)) return; gx += WORLD_POS[L.map][0]; gy += WORLD_POS[L.map][1]; }
    else if (this.M.id !== L.map) { if (this.lostS) { this.lostS.destroy(); this.lostS = null; } return; }
    if (!this.lostS || !this.lostS.active) {
      this.lostS = this.add.image(gx, gy, 'spark').setOrigin(.5, 1).setScale(1.8).setTint(0xffe28a).setDepth(gy);
      this.tweens.add({ targets: this.lostS, alpha: .35, scale: 2.4, duration: 700, yoyo: true, repeat: -1 });
      this.lights.push({ x: gx, y: gy - 6, small: 1 });
    }
    if (this.pl.dead || Math.hypot(this.pl.x - gx, this.pl.y - gy) > SOUL.lostR) return;
    S.gold += L.gold; S.lost = null; this.lostS.destroy(); this.lostS = null; sfx('chest'); updHud();
    popWorld(gx, gy - 24, 'Jejak Cahaya: +' + L.gold + ' G', 'gold'); this.sparkle(gx, gy - 10, 'doto', 16);
  },
});
{ // tidur memulihkan Botol Cahaya
  const sleep0 = sleepToMorning;
  sleepToMorning = function () { const r = sleep0.apply(this, arguments); refillFlask(G.scene); return r; }; // eslint-disable-line no-global-assign
}
// HUD tombol OBAT: "botol/maks · ramuan" (updHud ada di ui/widgets.js yang dimuat belakangan → dibungkus saat runtime)
let soulHudOn = false;
function soulHudWrap() {
  if (soulHudOn || typeof updHud !== 'function') return; soulHudOn = true;
  const u0 = updHud;
  updHud = function () { // eslint-disable-line no-global-assign
    const r = u0.apply(this, arguments), e = document.getElementById('hPot'), F = flaskOf();
    if (e && F) {
      let dots = '';
      for (let i = 0; i < F.max; i++) dots += (i < F.n) ? '●' : '○';
      const pCount = (S.inv.potion || 0) + (S.inv.hipotion || 0);
      e.innerHTML = `<span class="f-dots">${dots}</span><small class="p-num">${pCount}</small>`;
    }
    return r;
  };
  updHud();
}
