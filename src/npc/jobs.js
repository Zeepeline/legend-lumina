'use strict';
// Mesin pekerjaan berurutan (JOBS di job_data.js): ambil alat/barang → kerjakan → antar → ulang, dengan alat di tangan & barang yang benar-benar dibawa.
// Langkah baru maju bila SELESAI dikerjakan; disela dialog/pemain → langkah yang sama diulang. Dimuat setelah life_plan.js.
const JOB_ITEMS = { // gambar kode, warna rata + garis tepi; [lebar, tinggi, kotak: x,y,w,h,warna]
  watercan: [9, 8, [0, 2, 7, 6, '#3a3450'], [1, 3, 5, 4, '#6f9fbf'], [7, 3, 2, 2, '#3a3450']],
  basket: [12, 9, [0, 3, 12, 6, '#4a3020'], [1, 4, 10, 4, '#b8834a'], [2, 1, 3, 3, '#6aa84a'], [6, 0, 4, 4, '#d8643c']],
  bucket: [9, 9, [0, 1, 9, 8, '#3a2a20'], [1, 2, 7, 6, '#9a6a3a'], [1, 2, 7, 2, '#7ac0e0']],
  crate: [12, 10, [0, 0, 12, 10, '#4a3020'], [1, 1, 10, 8, '#b8834a'], [1, 4, 10, 1, '#4a3020']],
  hay: [12, 8, [0, 0, 12, 8, '#6a4a18'], [1, 1, 10, 6, '#e0b850']],
  sack: [10, 10, [0, 2, 10, 8, '#5a4630'], [1, 3, 8, 6, '#d8c49a'], [3, 0, 4, 3, '#5a4630']],
  wood: [13, 6, [0, 0, 13, 6, '#3a2418'], [1, 1, 11, 4, '#8a5a30']],
  iron: [10, 4, [0, 0, 10, 4, '#2a2a34'], [1, 1, 8, 2, '#e8783c']],
  t_hoe: [12, 13, [8, 0, 2, 13, '#7a5030'], [1, 0, 8, 2, '#8a8a98']],
  t_hammer: [9, 11, [4, 3, 2, 8, '#7a5030'], [0, 0, 9, 4, '#6a6a78']],
  t_broom: [7, 14, [3, 0, 2, 9, '#7a5030'], [0, 9, 7, 5, '#d8b050']],
  t_axe: [9, 12, [5, 0, 2, 12, '#7a5030'], [0, 0, 6, 5, '#9a9aa8']],
};
const JOB_ACTS = { // tool: alat diayun · every: jeda · fx: efek · snd: bunyi · anim: baris lembar sprite bila ada
  take: { every: 1, dur: 1.4 }, put: { every: 1, dur: 1.6 }, rest: { every: 3, icon: ['😌', '☕'], anim: 'sit' },
  hoe: { tool: 't_hoe', every: 1, fx: 'dust', snd: 'click', anim: 'hoe', hit: 420 },
  hammer: { tool: 't_hammer', every: .8, fx: 'spark', snd: 'hit', anim: 'hammer', hit: 310 },
  chop: { tool: 't_axe', every: 1, fx: 'dust', snd: 'hit' }, sweep: { tool: 't_broom', every: .8, fx: 'dust', anim: 'sweep' },
  water: { every: .7, fx: 'drop', snd: 'water', anim: 'water', held: 1 },
  harvest: { every: 2, fx: 'dust', bob: 2, anim: 'harvest' },
  draw: { every: 1.2, fx: 'drop', snd: 'water', anim: 'draw', bob: 2 },
  wash: { every: .8, fx: 'drop', bob: 2 }, wipe: { every: 1, icon: ['✨'], bob: 1 }, stoke: { every: .9, fx: 'fire', snd: 'fire' },
  feed: { every: 1, fx: 'dust', bob: 1 }, mill: { every: 1.2, fx: 'dust', bob: 1, anim: 'mill' },
  serve: { every: 2.4, icon: ['🧺', '💰', '📦'], anim: 'arrange' }, read: { every: 3, icon: ['📖'], anim: 'read' },
  aim: { every: 2.4, fx: 'arrow', snd: 'swing', anim: 'bow', hit: 800, bob: 1 },
  drill: { every: 1.7, fx: 'spark', snd: 'swing', anim: 'slash', hit: 320, bob: 1 },
  cast: { every: 2.2, fx: 'magic', snd: 'heal', anim: 'cast' },
  inspect: { every: 2, icon: ['👀'] }, watch: { every: 1.6, look: 1 },
};
function jobTex(sc, name) {
  const k = 'job_' + name; if (sc.textures.exists(k)) return k;
  const [w, h, ...R] = JOB_ITEMS[name], c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); for (const [x, y, rw, rh, col] of R) { g.fillStyle = col; g.fillRect(x, y, rw, rh); }
  sc.textures.addCanvas(k, c); return k;
}
/* pekerjaan & geseran koordinat NPC ini (peta biasa atau Benua) */
function jobOf(sc, o) {
  const id = o.n.reg || sc.M.id, J = JOBS[id] && JOBS[id][o.n.id]; if (!J) return null;
  const off = sc.M.benua ? WORLD_POS[id] : [0, 0]; return { J, id, ox: off[0], oy: off[1] };
}
/* NPC yang sedang menjadi tujuan misi tetap di pos (penanda misi berkoordinat tetap) */
function jobPinned(o, K) {
  const g = STAGE_GOAL[S.stage]; return !!g && g[0] === K.id && Math.hypot(g[1] + K.ox - o.home.x, g[2] + K.oy - o.home.y) < 110;
}
function jobCarry(sc, o, name) {
  if (o.carry) { o.carry.destroy(); o.carry = null; }
  if (name) o.carry = sc.add.image(o.spr.x, o.spr.y, jobTex(sc, name)).setOrigin(.5, 1);
}
/* anak panah melesat dari busur ke sasaran */
function jobArrow(sc, s, g) {
  const rot = Math.atan2(g.ty - 12 - (s.y - 18), g.tx - s.x), a = sc.add.rectangle(s.x, s.y - 18, 9, 1, 0xe7e4d0).setDepth(s.y + 2).setRotation(rot);
  sfxAt('swing', s.x, s.y, sc);
  sc.tweens.add({ targets: a, x: g.tx, y: g.ty - 12, duration: 160, onComplete: () => {
    a.destroy(); sc.puff(g.tx, g.ty - 10); sfxAt('hit', g.tx, g.ty, sc);
  } });
}
function jobToolOff(o) { if (o.tool) { o.tool.destroy(); o.tool = null; } }
/* barang yang diantar tergeletak sebentar di tempat tujuan */
function jobDropPile(sc, x, y, name) {
  const im = sc.add.image(x + rnd(-7, 7), y + rnd(0, 5), jobTex(sc, name)).setOrigin(.5, 1).setDepth(y - 1);
  sc.time.delayedCall(40000, () => { if (im.active) im.destroy(); });
}
function jobGoal(sc, o, K) {
  const st = K.J.steps[(o.jobI || 0) % K.J.steps.length], A = JOB_ACTS[st.do], x = st.x + K.ox, y = st.y + K.oy;
  return { x, y, act: 'job', job: st, dur: st.dur || A.dur || 4, tx: st.tx != null ? st.tx + K.ox : x, ty: st.ty != null ? st.ty + K.oy : y + 20,
    done: () => jobDone(sc, o, st), fail: () => { if ((o.jobFail = (o.jobFail || 0) + 1) > 1) { o.jobFail = 0; o.jobI = (o.jobI || 0) + 1; } } };
}
function jobDone(sc, o, st) {
  jobToolOff(o); o.jobFail = 0; o.jobI = (o.jobI || 0) + 1; o.jobCount = (o.jobCount || 0) + 1;
  if (st.drop) { const held = o.carry; jobCarry(sc, o, null); if (held && st.drop !== 'none') jobDropPile(sc, o.spr.x, o.spr.y + 4, st.drop); }
  if (st.take) jobCarry(sc, o, st.take);
}
{
  const pick0 = World.prototype.npcPickGoal;
  World.prototype.npcPickGoal = function (o) {
    const K = jobOf(this, o), away = !K || jobPinned(o, K) || !lifeInHours(K.J);
    const bad = K && o.role !== 'guard' && !this.M.indoor && (isNight() || this.weather === 'rain');
    jobToolOff(o); if (away || bad) { jobCarry(this, o, null); return pick0.call(this, o); }
    return jobGoal(this, o, K);
  };
  const start0 = World.prototype.npcActStart;
  World.prototype.npcActStart = function (o, g) {
    if (g.act !== 'job') return start0.call(this, o, g);
    lifeFace(this, o, g.tx, g.ty); o.actT = .2;
    const A = JOB_ACTS[g.job.do], drawn = A.anim && this.anims.exists(o.ch + '__' + A.anim); /* alat sudah tergambar di lembar */
    if (A.tool && !drawn) o.tool = this.add.image(o.spr.x, o.spr.y, jobTex(this, A.tool)).setOrigin(.8, 1);
    if (o.tool) o.tool.swing = 0;
    if (g.job.say && lifeNear(this, o, 220)) popBark(o, g.job.say);
  };
  const tick0 = World.prototype.npcActTick;
  World.prototype.npcActTick = function (o, g) {
    if (g.act !== 'job') return tick0.call(this, o, g);
    if (!g.here) { o.actT = .5; return undefined; } /* berhenti menyapa di jalan: belum bekerja */
    const A = JOB_ACTS[g.job.do], s = o.spr; o.actT = A.every * rnd(.9, 1.15);
    if (!lifeNear(this, o, 500)) return undefined;
    if (A.look) this.face(o, pick(['left', 'right', 'down', 'up']));
    const played = !!A.anim && this.lifeAnim(o, A.anim);
    if (played) o.poseUntil = Math.max(o.poseUntil, this.t + o.actT + .15); /* tahan frame terakhir sampai ulangan berikutnya */
    else if (A.tool || A.bob) {
      if (A.tool && o.tool) this.tweens.add({ targets: o.tool, swing: { from: 0, to: 1 }, duration: 170, yoyo: true });
      lifeBob(this, o, A.bob || 1);
    }
    const mx = (s.x + g.tx) / 2, my = (s.y + g.ty) / 2;
    if (A.hit || A.fx === 'spark') {
      const hit = () => {
        if (!s.active || o.st !== 'act') return;
        if (A.fx === 'arrow') { jobArrow(this, s, g); return; }
        if (A.fx === 'dust') this.puff(s.x + (o.dir === 'left' ? -13 : 13), s.y);
        else this.sparkle(g.tx, g.ty - 10, 'doto', 5);
        lifeSfx(this, o, A.snd, .5);
      };
      if (played && A.hit) this.time.delayedCall(A.hit, hit); else hit();
    }
    else if (A.fx === 'dust' && this.puff) this.puff(mx, my);
    else if (A.fx === 'fire') this.sparkle(g.tx, g.ty - 14, 'doto', 3);
    else if (A.fx === 'magic') this.sparkle(g.tx, g.ty - 12, 'dot', 5);
    else if (A.fx === 'drop') this.sparkle(mx, my, 'dot', 3);
    if (A.snd && !A.hit && A.fx !== 'spark') lifeSfx(this, o, A.snd, .5);
    if (A.icon && Math.random() < .35) this.npcEmote(o, pick(A.icon), 1.2);
    return undefined;
  };
  const upd0 = World.prototype.updNpc;
  World.prototype.updNpc = function (o, dt, locked) {
    upd0.call(this, o, dt, locked);
    const s = o.spr; if (!s || !s.active) return;
    if (o.tool && (o.st !== 'act' || o.duo || o.act)) jobToolOff(o);
    const side = o.dir === 'left' ? -1 : 1, d = o.dir === 'up' ? -.4 : .4;
    if (o.carry) {
      const A = o.st === 'act' && o.goal && o.goal.job ? JOB_ACTS[o.goal.job.do] : null;
      const drawn = A && A.held && this.anims.exists(o.ch + '__' + A.anim); /* barang sudah tergambar di lembar */
      const fx = o.dir === 'left' || o.dir === 'right' ? side * 7 : 0;
      o.carry.setPosition(Math.round(s.x + fx), Math.round(s.y - 7)).setDepth(s.y + d).setVisible(s.visible && !drawn);
    }
    if (o.tool) {
      o.tool.setPosition(Math.round(s.x + side * 8), Math.round(s.y - 5)).setDepth(s.y + d).setVisible(s.visible);
      o.tool.setFlipX(side > 0).setAngle(side * (-35 + 80 * (o.tool.swing || 0)));
    }
  };
}
