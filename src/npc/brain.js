'use strict';
// "Otak" NPC: setiap NPC punya rutinitas sesuai perannya (bekerja, berkeliling, mengobrol, duduk, berpatroli), pulang saat malam.
// Aturan: docs/NPC_RULES.md. Peran ditentukan dari id/ch NPC lewat NPC_ROLE; NPC cerita (STORY_NPC) tidak pernah jauh dari posnya.
const NPC_ROLE = {
  smith: 'smith', farmer: 'farmer', joko: 'farmer', wati: 'farmer', merchant: 'vendor', kmerchant: 'vendor', bayu: 'vendor', kafilah: 'vendor',
  guard: 'guard', gj1: 'gate', gj2: 'gate', ka5: 'gate', kp8: 'guard', hunter: 'hunter', sambo: 'hunter', elder: 'elder', ka4: 'elder',
  girl: 'child', child: 'child', rudi: 'child', kb1: 'child', kb4: 'child', ka2: 'child', inn: 'inn', lestari: 'cook', hermit: 'hermit',
  nila: 'keeper', gun: 'worker', ratih: 'fisher', pancing: 'fisher', darma: 'clerk',
};
// NPC penting cerita: tetap di sekitar pos (radius kecil), tidak pulang saat malam
const STORY_NPC = ['elder', 'girl', 'farmer', 'merchant', 'child', 'smith', 'inn', 'hunter', 'hermit', 'nila', 'ratih', 'gun', 'rudi', 'lestari', 'wati', 'darma', 'ka4', 'ka5', 'kmerchant', 'joko', 'bayu', 'sambo', 'pancing', 'kafilah', 'gj1', 'gj2'];
// tempat kerja per peran (jenis objek di peta) & ikon kegiatan
const WORK = {
  smith: { objs: ['anvil', 'forge', 'bellows'], icon: ['🔨', '🔥', '⚒'], fx: 'spark', dur: [4, 8] },
  farmer: { objs: ['hay', 'fence', 'fieldoven', 'windmill', 'cheesebarrel'], icon: ['🌱', '💧', '🌾'], fx: 'dust', dur: [4, 9] },
  vendor: { objs: ['market', 'crate', 'barrel', 'crateCart'], icon: ['🧺', '📦', '💰', '📢'], dur: [4, 8] },
  inn: { objs: ['counter', 'table', 'bed'], icon: ['🧹', '🍲', '🛏'], dur: [3, 6] },
  cook: { objs: ['pot', 'barrel', 'crate'], icon: ['🍲', '🥕', '🔥'], fx: 'steam', dur: [4, 8] },
  hunter: { objs: ['campfire', 'log', 'stump', 'archerytarget'], icon: ['🏹', '👣', '🔥'], dur: [4, 8] },
  elder: { objs: ['bench', 'benchWood', 'bigtree', 'fountain', 'shrine', 'stele'], icon: ['📖', '☕', '🤔'], dur: [5, 10] },
  hermit: { objs: ['totem', 'pot', 'mush', 'stump'], icon: ['🌿', '🔮', '🍄'], dur: [4, 9] },
  keeper: { objs: ['brazier', 'rock', 'stump'], icon: ['❄', '👀', '🔥'], dur: [4, 9] },
  worker: { objs: ['rock', 'log', 'crate'], icon: ['⛏', '🪨', '💦'], fx: 'dust', dur: [3, 6] },
  fisher: { objs: ['dockboat', 'boat', 'hay', 'log'], icon: ['🎣', '🐟', '🪝'], dur: [5, 10] },
  clerk: { objs: ['crate', 'barrel', 'sign', 'fence'], icon: ['📜', '✍', '📏'], dur: [4, 8] },
};
const SEATS = ['bench', 'benchWood', 'log', 'stump'];
const SOCIAL = ['fountain', 'market', 'board', 'sign', 'lamp', 'lampPost', 'planter', 'well', 'bench', 'benchWood', 'pigeons', 'shrine', 'stele', 'telescope', 'clockworktower'];
const IDLE_ICON = ['💬', '🎵', '👋', '😊', '☀', '🍎', '❗', '❓'];

Object.assign(World.prototype, {
  npcBrainInit(o) {
    const id = o.n.id, M = this.M;
    o.role = o.n.role || NPC_ROLE[id] || NPC_ROLE[o.ch] || (o.n.lines ? 'citizen' : 'citizen');
    o.story = STORY_NPC.includes(id) || !!o.n.story;
    o.leash = o.n.leash || (o.story ? (M.indoor ? 50 : 90) : M.indoor ? 60 : 380);
    o.st = 'think'; o.t = rnd(.3, 2); o.goal = null; o.stuck = 0; o.lx = o.spr.x; o.ly = o.spr.y;
    // tempat kerja terdekat dari pos asal
    const W = WORK[o.role]; o.work = [];
    if (W) for (const [t, x, y] of M.objs || []) if (W.objs.includes(t) && Math.hypot(x - o.home.x, y - o.home.y) < o.leash + 60) o.work.push([x, y + 14]);
    if (o.role === 'farmer' && M.garden) for (const g of [].concat(M.garden)) if (g && g.x) o.work.push([g.x, g.y + 16]);
    o.emo = this.add.text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '11px' }).setOrigin(.5, 1).setDepth(1.95e5).setVisible(false);
  },
  npcEmote(o, txt, sec = 1.8) { if (!o.emo) return; o.emo.setText(txt).setVisible(true); o.emoT = sec; },
  npcPickGoal(o) {
    const M = this.M, s = o.spr, h = o.home, night = isNight() && !M.indoor;
    const inLeash = ([x, y]) => Math.hypot(x - h.x, y - h.y) <= o.leash;
    const fromObjs = types => (M.objs || []).filter(([t]) => types.includes(t)).map(([, x, y]) => [x + rnd(-14, 14), y + rnd(14, 24)]).filter(inLeash);
    // malam: warga biasa pulang
    if (night && !o.story && o.role !== 'guard' && o.role !== 'gate' && M.doors && M.doors.length) {
      const d = M.doors.map(d => [d[0], d[1] + 8]).sort((a, b) => Math.hypot(a[0] - s.x, a[1] - s.y) - Math.hypot(b[0] - s.x, b[1] - s.y))[0];
      return { x: d[0], y: d[1], act: 'home' };
    }
    const r = Math.random();
    if (o.role === 'gate') return { x: h.x + rnd(-10, 10), y: h.y + rnd(-6, 6), act: 'watch', dur: rnd(4, 8) };
    if (o.role === 'guard') { const P = (M.paths || []).filter(p => inLeash([p[0], p[1]]) || inLeash([p[2], p[3]])); const p = P.length ? P[Math.floor(Math.random() * P.length)] : null; return p ? { x: p[0] + (p[2] - p[0]) * Math.random(), y: p[1] + (p[3] - p[1]) * Math.random(), act: 'watch', dur: rnd(2, 4) } : { x: h.x + rnd(-60, 60), y: h.y + rnd(-40, 40), act: 'watch', dur: 3 }; }
    if (o.role === 'child') { if (r < .7) return { x: h.x + rnd(-1, 1) * o.leash * .8, y: h.y + rnd(-1, 1) * o.leash * .5, act: 'play', dur: rnd(.5, 1.5), run: true }; }
    if (WORK[o.role] && o.work.length && r < .65) { const w = o.work[Math.floor(Math.random() * o.work.length)]; return { x: w[0] + rnd(-8, 8), y: w[1], act: 'work', dur: rnd(...WORK[o.role].dur) }; }
    if (r < .8) { const seats = fromObjs(SEATS); if (seats.length && Math.random() < .35) { const p = seats[Math.floor(Math.random() * seats.length)]; return { x: p[0], y: p[1] - 10, act: 'sit', dur: rnd(5, 12) }; }
      const soc = fromObjs(SOCIAL); if (soc.length) { const p = soc[Math.floor(Math.random() * soc.length)]; return { x: p[0], y: p[1], act: 'look', dur: rnd(2, 6) }; } }
    // berjalan santai di sekitar pos, atau mendekati warga lain untuk mengobrol
    const other = this.npcs.filter(n => n !== o && !n.away && n.spr.visible && Math.hypot(n.spr.x - s.x, n.spr.y - s.y) < 160 && inLeash([n.spr.x, n.spr.y]));
    if (other.length && Math.random() < .4) { const n = other[Math.floor(Math.random() * other.length)]; return { x: n.spr.x + (s.x < n.spr.x ? -18 : 18), y: n.spr.y, act: 'chat', with: n, dur: rnd(3, 7) }; }
    return { x: h.x + rnd(-1, 1) * Math.min(o.leash, 120), y: h.y + rnd(-1, 1) * Math.min(o.leash, 80), act: 'look', dur: rnd(1.5, 4) };
  },
  npcWalkAnim(o, dx, dy) { const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); if (dir !== o.dir || !o.walking) { o.dir = dir; o.spr.flipX = dir === 'left'; o.spr.play(o.ch + '_' + (dir === 'left' || dir === 'right' ? 'side' : dir), true); } o.walking = true; },
  npcBrain(o, dt, locked, dPl) {
    const s = o.spr; if (!o.role) this.npcBrainInit(o);
    if (o.emoT > 0) { o.emoT -= dt; o.emo.setPosition(s.x, s.y - 30); if (o.emoT <= 0) o.emo.setVisible(false); }
    // pulang / keluar rumah
    if (o.away) { if (!isNight() && Math.random() < dt * .3) { o.away = false; s.setVisible(true); s.body.enable = true; o.sh.setVisible(true); o.st = 'think'; o.t = .5; } return; }
    // berhenti saat pemain mendekat / dialog
    if (locked || (dPl < 30 && !G.title)) { if (o.walking) { s.setVelocity(0); o.walking = false; s.anims.stop(); this.face(o, o.dir); } if (dPl < 30 && !locked && o.st !== 'greet') { const dx = this.pl.x - s.x, dy = this.pl.y - s.y; this.face(o, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up')); o.st = 'greet'; o.t = 1; } return; }
    if (o.st === 'greet') { o.t -= dt; if (o.t <= 0) o.st = 'think'; return; }
    o.t -= dt;
    if (o.st === 'think') { if (o.t > 0) return; o.goal = this.npcPickGoal(o); o.st = 'walk'; o.t = 12; o.stuck = 0; o.lx = s.x; o.ly = s.y; return; }
    if (o.st === 'walk') {
      const g = o.goal, dx = g.x - s.x, dy = g.y - s.y, d = Math.hypot(dx, dy);
      if (d < 6 || o.t <= 0) { s.setVelocity(0); o.walking = false; s.anims.stop();
        if (g.act === 'home') { o.away = true; s.setVisible(false); s.body.enable = false; o.sh.setVisible(false); if (o.emo) o.emo.setVisible(false); return; }
        o.st = 'act'; o.t = g.dur || 3; o.actT = 0; this.npcActStart(o, g); return; }
      const sp = g.run ? 52 : o.role === 'guard' ? 26 : 30; s.setVelocity(dx / d * sp, dy / d * sp); this.npcWalkAnim(o, dx, dy);
      // macet (menabrak tembok/objek): geser ke samping, lalu menyerah & pilih tujuan lain
      o.stuck += dt; if (o.stuck > .7) { const moved = Math.hypot(s.x - o.lx, s.y - o.ly); o.stuck = 0; o.lx = s.x; o.ly = s.y; if (moved < 4) { o.goal = { x: s.x + rnd(-40, 40), y: s.y + rnd(-30, 30), act: 'look', dur: .5 }; if (++o.fails > 2) { o.fails = 0; o.st = 'think'; o.t = rnd(.5, 1.5); s.setVelocity(0); } } else o.fails = 0; }
      return;
    }
    if (o.st === 'act') { o.actT -= dt; if (o.actT <= 0) this.npcActTick(o, o.goal); if (o.t <= 0) { o.st = 'think'; o.t = rnd(.4, 1.6); } }
  },
  npcActStart(o, g) {
    if (g.act === 'chat' && g.with && g.with.spr.visible) { const w = g.with; this.face(o, w.spr.x > o.spr.x ? 'right' : 'left'); if (w.st !== 'walk') { this.face(w, w.spr.x > o.spr.x ? 'left' : 'right'); w.st = 'act'; w.t = Math.max(w.t, g.dur); w.goal = { act: 'chat' }; w.actT = 1; } }
    else if (g.act === 'work' || g.act === 'look' || g.act === 'watch') this.face(o, Math.random() < .5 ? 'up' : pick(['left', 'right', 'down']));
    else if (g.act === 'sit') this.face(o, 'down');
  },
  npcActTick(o, g) {
    const s = o.spr, near = Math.hypot(this.pl.x - s.x, this.pl.y - s.y) < 170, W = WORK[o.role];
    if (g.act === 'work' && W) { o.actT = rnd(1, 1.8); if (Math.random() < .6) this.npcEmote(o, pick(W.icon), 1.2);
      s.y -= 1; this.time.delayedCall(120, () => { if (s.active) s.y += 1; });
      if (W.fx === 'spark') { this.sparkle(s.x + (s.flipX ? -8 : 8), s.y - 10, 'doto', 4); if (near) sfx('hit'); }
      else if (W.fx === 'dust' && this.puff) this.puff(s.x + rnd(-6, 6), s.y);
      else if (W.fx === 'steam') this.sparkle(s.x, s.y - 18, 'dot', 2); }
    else if (g.act === 'chat') { o.actT = rnd(1, 2); this.npcEmote(o, pick(['💬', '😄', '🤔', '❗', '😮', '👍']), 1.2); }
    else if (g.act === 'play') { o.actT = .5; if (Math.random() < .3) this.npcEmote(o, pick(['😆', '🏃', '⭐', '🎈']), 1); }
    else if (g.act === 'sit') { o.actT = rnd(2, 4); if (Math.random() < .5) this.npcEmote(o, pick(['☕', '📖', '😌', '🎵']), 1.6); }
    else if (g.act === 'watch') { o.actT = rnd(1.2, 2.4); this.face(o, pick(['left', 'right', 'down', 'up'])); if (Math.random() < .2) this.npcEmote(o, '👀', 1.2); }
    else { o.actT = rnd(1.5, 3); this.face(o, pick(['left', 'right', 'down', 'up'])); if (Math.random() < .25) this.npcEmote(o, pick(IDLE_ICON), 1.4); }
  },
});

// Kode objek interaktif memanggil this.popWorld(...) dari scene: arahkan ke fungsi global popWorld (ui/widgets.js)
World.prototype.popWorld = function (...a) { return popWorld(...a); };
