'use strict';
// Rencana tujuan NPC berperan LIFE_ROLES (life_roles.js): jam kerja, tempat kerja (objek peta di dekat pos), patroli malam,
// keliling lampu, menyapu jalan, memeriksa prajurit. Peran lain → otak lama (brain.js). Dimuat setelah npc_anim.js.
function lifeWorkList(sc, o, R) {
  if (o.lifeW && o.lifeWm === sc.M) return o.lifeW;
  const h = o.home, rad = (o.n && o.n.workR) || o.leash + 40, out = [];
  for (const ob of sc.M.objs || []) if (R.work.test(ob[0]) && Math.hypot(ob[1] - h.x, ob[2] - h.y) < rad) out.push(ob);
  o.lifeWm = sc.M; return (o.lifeW = out);
}
function lifePathPt(sc, o) {
  const h = o.home, r = Math.min(o.leash, 320);
  const P = (sc.M.paths || []).filter(p => Math.hypot(p[0] - h.x, p[1] - h.y) < r || Math.hypot(p[2] - h.x, p[3] - h.y) < r);
  if (!P.length) return [h.x + rnd(-40, 40), h.y + rnd(-30, 30)];
  const p = pick(P), t = Math.random(); return [p[0] + (p[2] - p[0]) * t, p[1] + (p[3] - p[1]) * t];
}
const lifePatrol = (sc, o) => { const [x, y] = lifePathPt(sc, o); return { x, y, act: 'watch', dur: rnd(2, 4) }; };
function lifeStay(sc, o, act, dur = [4, 8]) {
  const h = o.home; return { x: h.x + rnd(-18, 18), y: h.y + rnd(-10, 10), act, dur: rnd(...dur), tx: h.x, ty: h.y - 30 };
}
const LIFE_PLANS = {
  inspect(sc, o) { // kapten mendekati prajurit/pemanah yang sedang berlatih
    const L = sc.npcs.filter(n => n !== o && /^(soldier|archer)$/.test(n.role) && !n.away && n.spr.visible &&
      Math.hypot(n.spr.x - o.home.x, n.spr.y - o.home.y) < 460);
    if (!L.length) return lifePatrol(sc, o);
    const n = pick(L), side = Math.random() < .5 ? -1 : 1;
    return { x: n.spr.x + side * 24, y: n.spr.y + 6, act: 'inspect', dur: rnd(4, 7), tx: n.spr.x, ty: n.spr.y - 10, with: n };
  },
  sweep(sc, o) { const [x, y] = lifePathPt(sc, o); return { x, y, act: 'sweep2', dur: rnd(5, 9), tx: x, ty: y + 10 }; },
  lamps(sc, o) { // tukang lampu berkeliling dari lentera ke lentera
    if (!o.lamps || o.lampsM !== sc.M) {
      o.lampsM = sc.M; o.lampI = 0;
      o.lamps = (sc.M.objs || []).filter(b => /^(lamp|gpt_city_lamp|lampPost|acadlamp)$/.test(b[0]) && Math.hypot(b[1] - o.home.x, b[2] - o.home.y) < 620)
        .sort((a, b) => Math.atan2(a[2] - o.home.y, a[1] - o.home.x) - Math.atan2(b[2] - o.home.y, b[1] - o.home.x));
    }
    if (!o.lamps.length) return null;
    const b = o.lamps[o.lampI++ % o.lamps.length];
    return { x: b[1] + 8, y: b[2] + 10, act: 'light', dur: rnd(2.5, 4), tx: b[1], ty: b[2] - 40 };
  },
  stay(sc, o, R) { return lifeStay(sc, o, R.act, R.dur); },
};
function lifePlan(sc, o, R) {
  if (R.plan) return LIFE_PLANS[R.plan](sc, o, R);
  const L = lifeWorkList(sc, o, R); if (!L.length) return null;
  const ob = pick(L), ty = ob[2] - (R.act === 'shoot' ? 18 : 10);
  return { x: ob[1] + R.spot[0] + rnd(-8, 8), y: ob[2] + R.spot[1] + rnd(-2, 4), act: R.act, dur: rnd(...R.dur), tx: ob[1], ty, ox: ob[1], oy: ob[2] };
}
{
  const pick0 = World.prototype.npcPickGoal;
  World.prototype.npcPickGoal = function (o) {
    const R = LIFE_ROLES[o.role]; if (!R) return pick0.call(this, o);
    const out = !this.M.indoor, night = out && isNight(), rain = out && this.weather === 'rain';
    if ((night || rain) && !R.night) return pick0.call(this, o); // pulang / berteduh seperti warga lain
    if (!lifeInHours(R)) {
      if (night && R.night === 'patrol') return lifePatrol(this, o);
      if (night && R.night === 'stay') return lifeStay(this, o, 'look', [3, 6]);
      return pick0.call(this, o); // di luar jam kerja: jalan-jalan, duduk, mengobrol
    }
    if (Math.random() < (R.p != null ? R.p : .72)) { const g = lifePlan(this, o, R); if (g) return g; }
    return night && R.night === 'patrol' ? lifePatrol(this, o) : pick0.call(this, o);
  };
  const start0 = World.prototype.npcActStart, tick0 = World.prototype.npcActTick;
  World.prototype.npcActStart = function (o, g) {
    const A = LIFE_ACTS[g.act]; if (!A) return start0.call(this, o, g);
    o.actT = .2; o.tgt = null; A.start.call(this, o, g);
    if (g.with && this.lifeDuoStart) this.lifeDuoStart('salute', o, g.with);
  };
  World.prototype.npcActTick = function (o, g) { const A = LIFE_ACTS[g.act]; return A ? A.tick.call(this, o, g) : tick0.call(this, o, g); };
  // pose kerja sesaat tidak langsung ditimpa frame napas (npc_anim.js)
  const idle0 = World.prototype.npcIdleVisual;
  World.prototype.npcIdleVisual = function (o, dt) { if (o.poseUntil && this.t < o.poseUntil) return; return idle0.call(this, o, dt); };
}
