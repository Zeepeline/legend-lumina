'use strict';
// Tabel aksi animasi NPC (talk, wary, cheer, panic, mourn, pray, hurt, fall/die, captive, offer, walk). Dipanggil mesin di npc_anim.js.
// Tiap aksi: start(o,a) & tick(o,a,dt) dengan this = scene World; a = o.act { name, t (sisa detik), age, opts, fx[] (objek yang dibersihkan otomatis) }.
const NPC_ACT_DUR = {
  talk: 60, wary: 6, cheer: 3, panic: 4, mourn: 30, pray: 30, hurt: .55, offer: 2.6, walk: 14, captive: Infinity, fall: Infinity, die: Infinity,
};
const NPC_DSET = d => (d === 'left' || d === 'right' ? 'side' : d || 'down');
function npcPose(o, name, flip) {
  const s = o.spr; if (!s.texture.has(name)) name = 'down0';
  if (s.frame.name !== name) s.setFrame(name);
  if (flip !== undefined) s.flipX = !!flip;
}
function npcDirTo(o, p) {
  const dx = p.x - o.spr.x, dy = p.y - o.spr.y;
  return Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
}
/* siklus jalan manual (tanpa anim Phaser): rate = frame per detik */
function npcStep(o, dir, rate, age) {
  const l = npcWalkFrames(o.ch, NPC_DSET(dir)); npcPose(o, l[Math.floor(age * rate) % l.length], dir === 'left');
}
function npcLook(sc, o, a) { a.dir = o.dir = npcDirTo(o, a.opts.face || sc.pl); }
function npcSide(o, p) { return p.x < o.spr.x ? -1 : 1; }
const NPC_ACTS = {
  talk: {
    start(o, a) { npcLook(this, o, a); a.cd = 0; },
    tick(o, a, dt) {
      a.cd -= dt; if (a.cd <= 0) { npcLook(this, o, a); a.cd = .35; }
      const ph = a.age % 1.2, nod = ph < .16 || (ph > .32 && ph < .48), D = NPC_DSET(a.dir);
      npcPose(o, nod ? 'nod' + D : D + '0', a.dir === 'left');
    },
  },
  wary: {
    start(o, a) { npcLook(this, o, a); this.npcEmote(o, a.opts.emote || '?', 1.4); },
    tick(o, a) {
      const p = a.opts.face || this.pl; npcLook(this, o, a);
      npcPose(o, Math.floor(a.age / .9) % 2 ? 'lean1' : 'lean0', p.x > o.spr.x);
      if (!a.sw && a.age > 2.4) { a.sw = 1; this.npcEmote(o, 'sweat', 1.2); }
    },
  },
  cheer: {
    start(o, a) { a.ph = Math.random(); this.npcEmote(o, a.opts.emote || 'heart', 1.4); },
    tick(o, a) {
      const p = (a.age * 2.2 + a.ph) % 1, lift = Math.sin(p * Math.PI) * 6, s = o.spr;
      a.lift = 1; s.y = a.y0 - lift; o.sh.y = a.y0 - 1; o.sh.setAlpha(.34 - lift * .02);
      npcPose(o, p < .12 || p > .9 ? 'crouch' : 'stretch', Math.floor(a.age * 2.2 + a.ph) % 2 === 1);
    },
    end(o) { o.sh.setAlpha(.34); },
  },
  panic: {
    start(o, a) { a.rt = 0; a.lx = o.spr.x; a.ly = o.spr.y; a.sk = 0; this.npcEmote(o, '!', 1.2); },
    tick(o, a, dt) {
      const s = o.spr, from = a.opts.from || this.pl;
      a.rt -= dt; a.sk += dt;
      if (a.sk > .35) { if (Math.hypot(s.x - a.lx, s.y - a.ly) < 3) a.rt = 0; a.sk = 0; a.lx = s.x; a.ly = s.y; }
      if (a.rt <= 0) { a.rt = rnd(.5, 1.1); a.ang = Math.atan2(s.y - from.y, s.x - from.x) + rnd(-.9, .9); }
      const sp = a.opts.spd || 58; s.setVelocity(Math.cos(a.ang) * sp, Math.sin(a.ang) * sp);
      const cx = Math.cos(a.ang), cy = Math.sin(a.ang);
      a.dir = o.dir = Math.abs(cx) > Math.abs(cy) * 1.05 ? (cx > 0 ? 'right' : 'left') : (cy > 0 ? 'down' : 'up');
      npcStep(o, a.dir, 13, a.age);
      if (!a.sw && a.age > 1.6) { a.sw = 1; this.npcEmote(o, 'sweat', 1.2); }
    },
    end(o, a) { if (a.opts.hide) this.npcHide(o); },
  },
  mourn: {
    start(o, a) { a.et = 0; if (a.opts.face) a.flip = npcSide(o, a.opts.face) < 0; },
    tick(o, a, dt) {
      a.et -= dt; if (a.et <= 0) { a.et = 2.6; this.npcEmote(o, 'tear', 1.4); }
      npcPose(o, a.age % 1.4 < .9 ? 'kneel' : 'kneel2', !!a.flip);
    },
  },
  pray: {
    start(o, a) { a.et = 0; },
    tick(o, a, dt) {
      npcPose(o, Math.floor(a.age / 1.8) % 2 ? 'kneel' : 'pray', false);
      a.et -= dt; if (a.et <= 0) { a.et = 1.4; if (this.sparkle) this.sparkle(o.spr.x, o.spr.y - 20 * (o.baseSc || 1), 'dot', 1); }
    },
  },
  hurt: {
    start(o, a) {
      const p = a.opts.from || this.pl; a.kx = -npcSide(o, p); o.spr.setTint(0xff6a6a);
      o.spr.setVelocity(a.kx * 70, 0); if (a.opts.emote) this.npcEmote(o, a.opts.emote, 1);
    },
    tick(o, a) { if (a.age > .12) o.spr.setVelocity(0); if (a.age > .22) o.spr.clearTint(); npcPose(o, 'hurt', a.kx < 0); },
  },
  fall: {
    start(o, a) {
      const p = a.opts.from; a.flip = a.opts.side ? a.opts.side === 'left' : (p ? p.x > o.spr.x : false);
      o.spr.setTint(0xff8080); if (a.opts.dead || a.name === 'die') o.dead = true;
    },
    tick(o, a) {
      const s = o.spr, sc = o.baseSc || 1;
      if (a.age > .2) s.clearTint();
      const f = a.age < .14 ? 'hurt' : a.age < .34 ? 'stagger' : a.age < .56 ? 'kneel' : 'lie';
      npcPose(o, f, a.flip);
      if (f === 'lie') o.sh.setScale(sc * 1.7, sc * .9);
    },
    end(o) { o.dead = false; },
  },
  captive: {
    start(o, a) {
      npcExtraTex(this); const c = this.add.image(o.spr.x, o.spr.y, 'npc_chain').setOrigin(.5, 1); a.fx.push(c); a.chain = c; a.et = rnd(1, 3);
    },
    tick(o, a, dt) {
      const s = o.spr, sc = o.baseSc || 1;
      npcPose(o, a.age % 2.6 < 2 ? 'kneel' : 'kneel2', !!a.opts.flip);
      a.chain.setPosition(Math.round(s.x), Math.round(s.y - 1)).setScale(sc).setDepth(s.y + .3);
      a.et -= dt; if (a.et <= 0 && a.opts.emote !== false) { a.et = rnd(4, 7); this.npcEmote(o, Math.random() < .5 ? 'sweat' : 'tear', 1.3); }
    },
  },
  offer: {
    start(o, a) {
      npcLook(this, o, a); const F = NPC_FR[o.ch];
      if (F && F.offer) return;
      npcExtraTex(this); const k = a.opts.item && this.textures.exists(a.opts.item) ? a.opts.item : 'npc_bread';
      a.item = this.add.image(o.spr.x, o.spr.y, k).setOrigin(.5, 1); a.fx.push(a.item);
      if (a.opts.emote) this.npcEmote(o, a.opts.emote, 1.4);
    },
    tick(o, a) {
      const s = o.spr, sc = o.baseSc || 1, F = NPC_FR[o.ch], p = a.opts.face || this.pl;
      if (F && F.offer) { npcPose(o, 'offer' + (a.age % 2.4 > 2.25 ? 1 : 0), false); return; }
      const side = npcSide(o, p), bob = Math.sin(a.age * 6) * .6;
      npcPose(o, 'lean0', p.x < s.x);
      a.item.setPosition(Math.round(s.x + side * 9 * sc), Math.round(s.y - 9 * sc + bob)).setScale(sc).setDepth(s.y + .3);
    },
  },
  walk: {
    start(o, a) { if (!a.opts.to) a.t = 0; },
    tick(o, a) {
      const s = o.spr, to = a.opts.to, dx = to.x - s.x, dy = to.y - s.y, d = Math.hypot(dx, dy);
      if (d < 2.5) { s.setVelocity(0); a.t = 0; return; }
      const sp = a.opts.spd || 30; s.setVelocity(dx / d * sp, dy / d * sp);
      a.dir = o.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
      npcStep(o, a.dir, 8, a.age);
    },
  },
};
NPC_ACTS.die = NPC_ACTS.fall;
