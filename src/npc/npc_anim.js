'use strict';
// Mesin animasi NPC: npcAct/npcActEnd, napas saat diam, kait ke otak NPC (brain.js), updNpc & talkNpc. Dokumen: docs/NPC_ANIM.md
// Aman: aksi berbatas waktu (kecuali die/fall/captive yang memang menetap), selalu dibersihkan oleh npcActEnd; tidak memakai timer/tween.
Object.assign(World.prototype, {
  npcFind(id) { return this.npcs.find(n => n.n && (n.n.id === id || n.ch === id)) || null; },
  npcActName(o) { return o && o.act ? o.act.name : null; },
  /* mulai aksi: idle talk wary cheer panic mourn pray hurt fall die captive offer walk. opts: dur, hold, from, face, to, then, thenOpts, hide, ... */
  npcAct(o, act, opts = {}) {
    if (act === 'idle') { this.npcActEnd(o); return null; }
    const A = NPC_ACTS[act];
    if (!A || !o || !o.spr || !o.spr.active) return null;
    if (o.act) this.npcActClean(o);
    if (o.away) this.npcShow(o);
    if (!o.role && !(o.n && o.n.still)) this.npcBrainInit(o);
    const s = o.spr, dur = opts.hold ? Infinity : (opts.dur !== undefined ? opts.dur : (NPC_ACT_DUR[act] !== undefined ? NPC_ACT_DUR[act] : 3));
    const a = o.act = { name: act, opts, t: dur, age: 0, x0: s.x, y0: s.y, dir: o.dir || 'down', fx: [] };
    o.walking = false; s.setVelocity(0); s.anims.stop();
    A.start.call(this, o, a);
    return a;
  },
  /* sama untuk banyak NPC: list = array/fungsi penyaring; opts.stagger = jeda acak maks (detik) antar NPC */
  npcActMany(list, act, opts = {}) {
    const arr = typeof list === 'function' ? this.npcs.filter(list) : list;
    for (const o of arr) {
      const go = () => { if (o.spr && o.spr.active) this.npcAct(o, act, opts); };
      if (opts.stagger) this.time.delayedCall(Math.random() * opts.stagger * 1000, go); else go();
    }
    return arr.length;
  },
  npcActEnd(o) {
    const a = o && o.act; if (!a) return;
    this.npcActClean(o); o.act = null;
    if (!o.spr || !o.spr.active) return;
    if (a.opts.then && NPC_ACTS[a.opts.then]) { this.npcAct(o, a.opts.then, a.opts.thenOpts || {}); return; }
    if (!o.away) this.face(o, o.dir || 'down');
    o.st = 'think'; o.t = rnd(.4, 1); o.goal = null;
  },
  npcActClean(o) {
    const a = o.act, s = o.spr; if (!a) return;
    const A = NPC_ACTS[a.name]; if (A && A.end) A.end.call(this, o, a);
    for (const f of a.fx) if (f && f.destroy) f.destroy();
    a.fx = []; o.dead = false;
    if (!s || !s.active) return;
    s.clearTint(); s.setVelocity(0); if (a.lift) s.y = a.y0;
    const sc = o.baseSc || 1; s.setScale(sc); s.flipX = o.dir === 'left';
    if (o.sh) o.sh.setScale(sc * 1.05, sc * .9);
  },
  npcActUpd(o, dt) {
    const a = o.act, s = o.spr, sc = o.baseSc || 1;
    a.age += dt; a.t -= dt; o.barkCd = Math.max(o.barkCd || 0, 1); o.reactCd = Math.max(o.reactCd || 0, 1);
    s.setScale(sc);
    NPC_ACTS[a.name].tick.call(this, o, a, dt);
    if (o.act === a && a.t <= 0) this.npcActEnd(o);
  },
  /* napas halus saat berdiri diam: ganti frame diam <-> frame napas */
  npcIdleVisual(o, dt) {
    const s = o.spr; if (o.away || !s.visible || o.walking || s.anims.isPlaying || !NPC_FR[o.ch]) return;
    o.brT = (o.brT === undefined ? rnd(0, 2.6) : o.brT) + dt;
    const d = NPC_DSET(o.dir), want = o.brT % 2.6 < .8 ? 'br' + d : d + '0';
    if (s.frame.name !== want && s.texture.has(want)) s.setFrame(want);
  },
  npcHide(o) { o.away = true; o.spr.setVisible(false); if (o.spr.body) o.spr.body.enable = false; if (o.sh) o.sh.setVisible(false); this.npcEmoteClear(o); },
  npcShow(o) { o.away = false; o.spr.setVisible(true); if (o.spr.body) o.spr.body.enable = true; if (o.sh) o.sh.setVisible(true); o.st = 'think'; o.t = .5; },
  /* untuk skrip cerita: await sc.npcTalkWhile(o, say('...', 'Nama')) -> NPC mengangguk selama dialog, selalu dibersihkan */
  async npcTalkWhile(o, p) {
    const a = this.npcAct(o, 'talk', { hold: true });
    try { return await p; } finally { if (a && o.act === a) this.npcActEnd(o); }
  },
});
const _npcBrainA = World.prototype.npcBrain;
World.prototype.npcBrain = function (o, dt, locked, dPl) { if (o.act) return undefined; return _npcBrainA.call(this, o, dt, locked, dPl); };
const _updNpcA = World.prototype.updNpc;
World.prototype.updNpc = function (o, dt, locked) {
  _updNpcA.call(this, o, dt, locked);
  if (!o.spr || !o.spr.active) return;
  if (o.act) this.npcActUpd(o, dt); else this.npcIdleVisual(o, dt);
  this.npcBubbleTick(o, dt);
};
/* dialog bawaan (talkNpc): NPC mengangguk selama percakapan, tak menimpa pose cerita (die/mourn/captive/...) */
const _talkNpcA = World.prototype.talkNpc;
World.prototype.talkNpc = async function (o) {
  const own = !o.act || o.act.name === 'wary' || o.act.name === 'talk', a = own ? this.npcAct(o, 'talk', { dur: 90 }) : null;
  try { return await _talkNpcA.call(this, o); }
  finally { if (a && o.act === a) { if (a.age >= 1.2) this.npcActEnd(o); else a.t = Math.min(a.t, 1.2 - a.age); } }
};
