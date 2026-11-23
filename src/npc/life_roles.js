'use strict';
// KEHIDUPAN KOTA — peran kerja tambahan untuk NPC (prajurit, pemanah, pedagang kios, pembeli, pemusik, juru warta, imam,
// penimba air, guru, murid, tukang kebun, tukang lampu, penyapu, dst.). Dipasang di atas otak NPC (brain.js):
// npcPickGoal / npcActStart / npcActTick dibungkus; peran yang tidak dikenal tetap memakai perilaku lama.
// Data NPC: { role: '<peran>', leash, shout: [...] } (lihat world/maps/cast.js). Daftar & sprite sheet: docs/NPC_ROSTER.md.
// Animasi: jika sprite sheet NPC sudah ada (npc/life_sheet.js) dipakai frame aslinya, kalau belum dipakai gerak pengganti di sini.
const LIFE_ROLES = {
  soldier: { work: /^(gardummy|garbag|acaddummy|dummy)$/, act: 'train', spot: [0, 18], dur: [6, 12], hours: [6, 18], night: 'patrol' },
  archer: { work: /^(gartarget\d?|acadtarget|archerytarget)$/, act: 'shoot', spot: [0, 64], dur: [8, 14], hours: [6, 18], night: 'patrol' },
  captain: { plan: 'inspect', hours: [6, 22], night: 'patrol' },
  stablehand: { work: /^(garstable|garhayrack|hay)$/, act: 'groom', spot: [0, 18], dur: [5, 9], hours: [5, 20] },
  merc: { work: /^(garrack|garbarricade|garsupply|barakBayaran)$/, act: 'sharpen', spot: [0, 16], dur: [5, 9], hours: [7, 23], night: 'stay' },
  stall: { work: /^(stall_\w+|market)$/, act: 'arrange', spot: [0, 16], dur: [6, 12], hours: [7, 19], p: .85 },
  shopper: { work: /^(stall_\w+|market)$/, act: 'browse', spot: [0, 26], dur: [3, 6], hours: [8, 18], p: .6 },
  musician: { work: /^(fountain|acadfountain|bench|benchWood|streetdrum)$/, act: 'play', spot: [0, 24], dur: [12, 20], hours: [9, 22], p: .85 },
  crier: { work: /^(well|balaiDewan|acadboard|bounty_board)$/, act: 'announce', spot: [0, 22], dur: [8, 14], hours: [8, 18], p: .75 },
  priest: { work: /^(shrine|altar|woodlandshrine)$/, act: 'pray', spot: [0, 20], dur: [8, 14], hours: [5, 21], night: 'stay', p: .8 },
  water: { work: /^well$/, act: 'draw', spot: [0, 16], dur: [5, 8], hours: [6, 18], p: .6 },
  official: { work: /^(balaiDewan|acadboard|bounty_board)$/, act: 'stamp', spot: [0, 20], dur: [6, 10], hours: [8, 16], p: .7 },
  teacher: { work: /^(acadboard|acadstatue|telescope)$/, act: 'lecture', spot: [0, 22], dur: [10, 16], hours: [8, 16], p: .8 },
  student: { work: /^(acadboard|acadbench|telescope|acadfountain|acadstatue)$/, act: 'study', spot: [0, 22], dur: [5, 10], hours: [7, 17], p: .6 },
  gardener: { work: /^(acadgreenhouse|acadtopiary|acadpottree|acadcypress|planter)$/, act: 'prune', spot: [0, 14], dur: [5, 9], hours: [6, 17], p: .8 },
  astronomer: { work: /^telescope$/, act: 'stargaze', spot: [0, 14], dur: [10, 18], hours: [18, 5], night: 'stay', p: .9 },
  sweeper: { plan: 'sweep', hours: [5, 19] },
  lamplighter: { plan: 'lamps', hours: [16, 21] },
  patron: { plan: 'stay', act: 'drink', dur: [6, 12], hours: [0, 24], night: 'stay' },
  scholar: { plan: 'stay', act: 'read', dur: [8, 14], hours: [0, 24], night: 'stay' },
  drummer: { work: /^streetdrum$/, act: 'drum', spot: [0, 14], dur: [10, 18], hours: [10, 23], p: .85 },
  miller: { work: /^windmill$/, act: 'mill', spot: [0, 16], dur: [6, 10], hours: [6, 18] },
  lightkeeper: { work: /^lakelighthouse$/, act: 'tendlight', spot: [0, 16], dur: [8, 14], hours: [0, 24], night: 'stay' },
  fisher: { work: /^(dock|dockboat|boat)$/, act: 'fish', spot: [0, 14], dur: [8, 14], hours: [5, 19], p: .75 },
  traveler: { work: /^campfire$/, act: 'warm', spot: [0, 26], dur: [10, 18], hours: [0, 24], night: 'stay', p: .8 },
};
// teriakan saat bekerja (muncul bila pemain dekat); NPC boleh punya n.shout sendiri
const LIFE_SHOUT = {
  soldier: ['Hiaat!', 'Satu! Dua!', 'Tangkis!', 'Lagi!'], archer: ['Tepat sasaran!', 'Meleset sedikit...', 'Tarik... lepas!'],
  captain: ['Tegakkan bahu!', 'Kuda-kuda rendah!', 'Bagus, lanjutkan!', 'Barisan, rapikan!'],
  stablehand: ['Tenang, si Belang...', 'Jerami segar!', 'Siapa mau sewa kuda?'], merc: ['Pedang tumpul tak dibayar.', 'Kontrak hari ini?'],
  stall: ['Mampir, mampir!', 'Harga pas, barang bagus!', 'Segar dari pagi!', 'Beli dua, murah!'],
  musician: ['♪ Lumina, kota seribu lentera ♪', '♪ La-la-lum... ♪', 'Terima kasih, Tuan!'],
  crier: ['Kabar! Kabar dari Balai Dewan!', 'Hari pasar dimajukan!', 'Waspada serigala di Jalan Raya Lama!', 'Festival lentera sebentar lagi!'],
  priest: ['Semoga cahaya menuntunmu.', 'Lilin baru sudah menyala.'], water: ['Airnya dingin sekali.', 'Ember ketiga...'],
  official: ['Berkas pajak, cap... cap...', 'Antre yang tertib!'], teacher: ['Cahaya adalah ingatan dunia.', 'Catat baik-baik!', 'Siapa bisa jawab?'],
  student: ['Mantra pertama... lupa lagi.', 'Ujian minggu depan!'], gardener: ['Rantingnya harus dipangkas.', 'Daunnya sehat.'],
  astronomer: ['Bintang Penunjuk sudah terbit.', 'Langit jernih malam ini.'], sweeper: ['Pagi-pagi sudah kotor lagi.', 'Minggir sebentar ya.'],
  lamplighter: ['Lentera ke dua puluh...', 'Kota Seribu Lentera tak boleh gelap.'], patron: ['Bersulang!', 'Satu gelas lagi!'],
  scholar: ['Halaman ini robek...', 'Menarik sekali.'], drummer: ['Dum-dum-tak!', 'Ayo goyang!'], miller: ['Gandum jadi tepung!'],
  lightkeeper: ['Sumbu dan minyak, sumbu dan minyak.'], traveler: ['Hangatnya api ini.', 'Besok jalan lagi ke selatan.'],
};
const lifeHour = () => (typeof S !== 'undefined' && S.time != null ? S.time : 12);
const lifeInHours = (R, h = lifeHour()) => !R.hours || (R.hours[0] <= R.hours[1] ? h >= R.hours[0] && h < R.hours[1] : h >= R.hours[0] || h < R.hours[1]);
function lifeFace(sc, o, x, y) {
  const dx = x - o.spr.x, dy = y - o.spr.y;
  sc.face(o, Math.abs(dx) > Math.abs(dy) * 1.2 ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
}
const lifeNear = (sc, o, r = 320) => sc.pl && Math.hypot(sc.pl.x - o.spr.x, sc.pl.y - o.spr.y) < r;
function lifeShout(sc, o, p = .3) {
  const L = (o.n && o.n.shout) || LIFE_SHOUT[o.role];
  if (!L || Math.random() >= p || !lifeNear(sc, o, 260) || typeof popBark !== 'function') return;
  popBark(o, pick(L)); if (o.role === 'stall' && sc.lifeAnim) sc.lifeAnim(o, 'call');
}
function lifeSfx(sc, o, n, p = .5) { if (Math.random() < p && lifeNear(sc, o, 240) && typeof sfxAt === 'function') sfxAt(n, o.spr.x, o.spr.y, sc); }
/* dorong sprite sesaat ke arah (dx,dy) lalu kembali: pengganti frame "ayun/pukul" */
function lifeLunge(sc, o, dx, dy, px = 3, ms = 110) {
  const s = o.spr, L = Math.hypot(dx, dy) || 1, ox = dx / L * px, oy = dy / L * px * .6;
  s.x += ox; s.y += oy; sc.time.delayedCall(ms, () => { if (s.active) { s.x -= ox; s.y -= oy; } });
}
function lifeBob(sc, o, px = 1, ms = 120) { const s = o.spr; s.y -= px; sc.time.delayedCall(ms, () => { if (s.active) s.y += px; }); }
/* pose rig sesaat (crouch/kneel/lean0/w_a...) bila tekstur NPC punya frame itu */
function lifePose(sc, o, f, ms = 420) {
  const s = o.spr; if (!s.texture.has(f)) return false;
  s.setFrame(f); o.poseUntil = sc.t + ms / 1000;
  sc.time.delayedCall(ms, () => { if (s.active && s.frame.name === f && !o.walking) sc.face(o, o.dir); }); return true;
}
/* sprite objek peta di (x,y) (untuk boneka yang bergoyang, sasaran panah, dsb.) */
function lifeObjSpr(sc, x, y, re) {
  for (const c of sc.children.list) if (c.texture && Math.abs(c.x - x) < 3 && Math.abs(c.y - y) < 3 && (!re || re.test(c.texture.key))) return c;
  return null;
}
function lifeWobble(sc, spr, deg = 6) {
  if (!spr || spr._wob) return; spr._wob = 1;
  sc.tweens.add({ targets: spr, angle: deg, duration: 70, yoyo: true, repeat: 1, onComplete: () => { spr.angle = 0; spr._wob = 0; } });
}
function lifeArrow(sc, x0, y0, x1, y1) {
  if (!sc.textures.exists('arrow')) return;
  const a = sc.add.image(x0, y0, 'arrow').setDepth(Math.max(y0, y1) + 2).setRotation(Math.atan2(y1 - y0, x1 - x0));
  sc.tweens.add({ targets: a, x: x1, y: y1, duration: 220, onComplete: () => { a.destroy(); sc.sparkle(x1, y1, 'doto', 3); } });
}
const LIFE_ICON = {
  train: ['💪', '⚔'], shoot: ['🏹', '🎯'], groom: ['🐴', '🌾', '🧹'], sharpen: ['⚔', '🪨'], arrange: ['🧺', '📦', '💰'], browse: ['🧐', '🤔', '🛍'],
  play: ['🎵', '🎶'], announce: ['📢', '📜'], draw: ['💧', '🪣'], stamp: ['📜', '✍'], lecture: ['📖', '☝'], study: ['📖', '✍', '💡'],
  prune: ['✂', '🌿'], stargaze: ['🔭', '✨'], sweep2: ['🧹'], light: ['🔥', '🏮'], drink: ['🍺', '🍲', '😊'], read: ['📖', '📜', '🤔'],
  drum: ['🥁', '🎵'], fish: ['🎣', '🐟'], mill: ['🌾'], tendlight: ['🔦', '✨'], warm: ['🔥', '☕'], inspect: ['👀', '☝'],
};
// aksi kerja: start(o,g) sekali saat tiba; tick(o,g) dipanggil berulang (o.actT = jeda berikutnya). this = scene World.
const LIFE_ACTS = {
  train: {
    start(o, g) { lifeFace(this, o, g.tx, g.ty); o.hit = 0; },
    tick(o, g) {
      o.actT = rnd(.6, 1); if (this.lifeAnim && this.lifeAnim(o, 'train')) { /* frame asli */ } else lifeLunge(this, o, g.tx - o.spr.x, g.ty - o.spr.y, 4);
      o.tgt = o.tgt || lifeObjSpr(this, g.ox, g.oy, /dummy|bag/); lifeWobble(this, o.tgt, o.hit++ % 2 ? -7 : 7);
      this.sparkle(g.tx, g.ty - 12, 'doto', 2); lifeSfx(this, o, 'hit', .45); if (o.hit % 5 === 0) lifeShout(this, o, .5);
    },
  },
  shoot: {
    start(o, g) { lifeFace(this, o, g.tx, g.ty); },
    tick(o, g) {
      o.actT = rnd(1.6, 2.6); const s = o.spr;
      if (!(this.lifeAnim && this.lifeAnim(o, 'shoot'))) lifeLunge(this, o, s.x - g.tx, s.y - g.ty, 2, 360); /* tarik tali busur */
      this.time.delayedCall(380, () => {
        if (!s.active) return; lifeArrow(this, s.x, s.y - 16, g.tx + rnd(-4, 4), g.ty - 18 + rnd(-4, 4));
        lifeSfx(this, o, 'swing', .5);
      });
      if (Math.random() < .25) lifeShout(this, o, .6);
    },
  },
};
// aksi sederhana: hadap sasaran, ikon kegiatan, gerak pengganti, efek, suara, teriakan
function lifeSimple(name, { face = 'tgt', pose, fx, snd, lunge, bob = 1, every = [1.2, 2.2], shout = .2, anim = name } = {}) {
  LIFE_ACTS[name] = {
    start(o, g) { if (face === 'tgt') lifeFace(this, o, g.tx, g.ty); else this.face(o, face); },
    tick(o, g) {
      o.actT = rnd(...every); const s = o.spr;
      const real = this.lifeAnim && this.lifeAnim(o, anim);
      if (!real) {
        if (pose && Math.random() < .5) lifePose(this, o, pick(pose));
        else if (lunge) lifeLunge(this, o, g.tx - s.x, g.ty - s.y, lunge); else lifeBob(this, o, bob);
      }
      if (Math.random() < .55) this.npcEmote(o, pick(LIFE_ICON[name] || ['💭']), 1.2);
      if (fx === 'dust' && this.puff) this.puff(s.x + rnd(-6, 6), s.y);
      else if (fx === 'spark') this.sparkle(g.tx, g.ty - 8, 'doto', 3);
      else if (fx === 'fire') this.sparkle(g.tx, g.ty - 26, 'doto', 2);
      else if (fx) this.sparkle(s.x + rnd(-6, 6), s.y - 22, fx, 2);
      if (snd) lifeSfx(this, o, snd, .4); lifeShout(this, o, shout);
    },
  };
}
lifeSimple('groom', { pose: ['crouch', 'lean0'], fx: 'dust' });
lifeSimple('sharpen', { pose: ['crouch'], fx: 'spark', snd: 'click' });
lifeSimple('arrange', { face: 'down', pose: ['lean0', 'crouch'], shout: .35 });
lifeSimple('browse', { face: 'tgt', every: [1.4, 2.4], shout: 0 });
lifeSimple('play', { face: 'down', fx: 'dot', every: [.8, 1.4], shout: .15 });
lifeSimple('announce', { face: 'down', bob: 2, every: [1.6, 2.6], shout: .7 });
lifeSimple('draw', { face: 'up', pose: ['crouch', 'stretch'], snd: 'water' });
lifeSimple('stamp', { face: 'up', snd: 'click', lunge: 2 });
lifeSimple('lecture', { face: 'down', bob: 1, every: [1.8, 2.8], shout: .45 });
lifeSimple('study', { face: 'tgt', every: [1.8, 3] });
lifeSimple('prune', { pose: ['crouch', 'kneel'], fx: 'dust' });
lifeSimple('stargaze', { face: 'up', fx: 'dot', every: [2.4, 3.4] });
lifeSimple('sweep2', { face: 'down', pose: ['lean0', 'lean1'], fx: 'dust', every: [.9, 1.5], anim: 'sweep' });
lifeSimple('light', { face: 'up', pose: ['stretch'], fx: 'fire', snd: 'fire', shout: .3 });
lifeSimple('drink', { face: 'down', every: [2, 3.4] });
lifeSimple('read', { face: 'up', every: [2.4, 3.6] });
lifeSimple('drum', { face: 'down', snd: 'hit', every: [.5, .8], bob: 2, shout: .1 });
lifeSimple('mill', { pose: ['crouch'], fx: 'dust' });
lifeSimple('tendlight', { face: 'up', fx: 'fire', pose: ['stretch'] });
lifeSimple('warm', { face: 'tgt', pose: ['crouch', 'kneel'], every: [2.4, 3.6] });
lifeSimple('fish', { face: 'tgt', snd: 'water', every: [2, 3.2], shout: 0 });
lifeSimple('inspect', { face: 'tgt', every: [1.6, 2.4], shout: .4 });
LIFE_ACTS.pray = {
  start(o, g) { this.face(o, 'up'); if (this.npcAct && !(this.lifeAnim && this.lifeAnim(o, 'pray'))) this.npcAct(o, 'pray', { dur: g.dur * .8 }); },
  tick(o) { o.actT = rnd(2.5, 4); if (Math.random() < .5) this.npcEmote(o, pick(['🙏', '✨', '🕯']), 1.4); lifeShout(this, o, .15); },
};
