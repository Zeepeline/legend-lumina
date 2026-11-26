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
const NPC_SCALES = {
  mila: 0.86, child: 0.88, girl: 0.94, rudi: 0.96, kb1: 0.94, kb4: 0.94, ka2: 0.96,
  guard: 1.05, smith: 1.05, hunter: 1.26, gj1: 1.28, gj2: 1.28, kp8: 1.28, sambo: 1.26,
  elder: 1.00, hermit: 1.16, ka4: 1.16, temple_priest: 1.00, priest: 1.00,
  inn: 1.00, farmer: 1.00, woman: 1.00, mom: 1.00, joko: 1.22, wati: 1.20, darma: 1.22, lestari: 1.20,
  merchant: 1.00, kmerchant: 1.22, bayu: 1.22, ratih: 1.18, gun: 1.22, pancing: 1.22,
  default: 1.20
};
const WORK = {
  smith: { objs: ['anvil', 'anvilBesi', 'forge', 'bellows'], icon: ['🔨', '🔥', '⚒'], fx: 'spark', dur: [4, 8] },
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
    const id = o.n.id, M = this.M, s = o.spr;
    o.role = o.n.role || NPC_ROLE[id] || NPC_ROLE[o.ch] || (o.n.lines ? 'citizen' : 'citizen');
    o.story = STORY_NPC.includes(id) || !!o.n.story;
    o.leash = o.n.leash || (o.story ? (M.indoor ? 50 : 90) : M.indoor ? 60 : 380);
    o.st = 'think'; o.t = rnd(.3, 2); o.goal = null; o.stuck = 0; o.lx = s.x; o.ly = s.y;
    // Standardisasi proporsi rasio sebanding Arka (T576)
    const sc = (NPC_SHEETS[id] && NPC_SCALES[o.ch]) || NPC_SCALES[id] || NPC_SCALES[o.ch] || NPC_SCALES[o.role] || NPC_SCALES.default;
    o.baseSc = sc; s.setScale(sc);
    if (o.sh) o.sh.setScale(sc * 1.05, sc * 0.9);
    if (s.body) s.body.setSize(Math.round(11 * sc), Math.round(6 * sc)).setOffset(Math.round((s.width - 11 * sc) / 2), Math.round(s.height - 7 * sc));
    o.turnDelay = 0; o.socialCd = rnd(6, 14); o.stepT = 0;
    // tempat kerja terdekat dari pos asal
    const W = WORK[o.role]; o.work = [];
    if (W) for (const [t, x, y] of M.objs || []) if (W.objs.includes(t) && Math.hypot(x - o.home.x, y - o.home.y) < o.leash + 60) o.work.push([x, y + 14]);
    if (o.role === 'farmer') for (const [gx, gy, gw, gh] of M.gardens || []) { /* tepi bawah petak kebun */
      if (Math.hypot(gx - o.home.x, gy - o.home.y) < o.leash + 60) o.work.push([gx + gw / 2, gy + gh + 12]);
    }
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
    // T379: Reaksi terhadap hujan
    const isRain = this.weather === 'rain' && !M.indoor && !M.dark;
    if (isRain && o.role !== 'guard' && o.role !== 'gate') {
      if (o.role === 'child' && Math.random() < 0.3) {
        return { x: h.x + rnd(-1, 1) * o.leash * .6, y: h.y + rnd(-1, 1) * o.leash * .4, act: 'play', dur: rnd(1, 2), run: true };
      }
      if (M.doors && M.doors.length) {
        const d = M.doors.map(d => [d[0], d[1] + 8]).sort((a, b) => Math.hypot(a[0] - s.x, a[1] - s.y) - Math.hypot(b[0] - s.x, b[1] - s.y))[0];
        return { x: d[0], y: d[1], act: o.story ? 'shelter' : 'home', dur: rnd(8, 16), run: true };
      }
    }
    // T380: Pagi hari (06:00-08:00): membuka toko & menyapu / menyalakan tungku
    const curHour = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    if (curHour >= 6 && curHour < 8 && !isRain) {
      if (['vendor', 'inn'].includes(o.role) && Math.random() < 0.6) {
        return { x: h.x + rnd(-6, 6), y: h.y + 10, act: 'sweep', dur: rnd(4, 7) };
      }
      if (o.role === 'smith' && Math.random() < 0.6) {
        return { x: h.x + rnd(-8, 8), y: h.y + 12, act: 'kindle', dur: rnd(5, 8) };
      }
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
  npcWalkAnim(o, dx, dy) {
    const dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    let animDir = dir === 'left' || dir === 'right' ? 'side' : dir, flip = dir === 'left';
    if (NPC_FR[o.ch]?.dir8 && Math.hypot(dx, dy) > 1) {
      const sec = (Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) + 8) % 8;
      animDir = ['side', 'down_side', 'down', 'down_side', 'side', 'up_side', 'up', 'up_side'][sec];
      flip = sec === 3 || sec === 4 || sec === 5;
      if (flip && sec !== 4 && NPC_FR[o.ch].left) { animDir += '_l'; flip = false; } /* diagonal kiri bergambar sendiri: senjata tidak pindah tangan */
    }
    if (dir !== o.dir || animDir !== o.animDir || flip !== o.spr.flipX || !o.walking) {
      if (o.walking && o.dir && ((dir === 'left' && o.dir === 'right') || (dir === 'right' && o.dir === 'left') || (dir === 'up' && o.dir === 'down') || (dir === 'down' && o.dir === 'up'))) {
        o.turnDelay = 0.12;
      }
      const k = o.ch + '_' + animDir, an = this.anims.get(k), len = an ? an.frames.length : 0;
      const sf0 = o.walking && o.spr.anims.isPlaying && o.spr.anims.currentFrame ? Math.max(0, o.spr.anims.currentFrame.index - 1) : 0;
      const sf = len ? sf0 % len : 0;
      o.dir = dir; o.animDir = animDir; o.spr.flipX = flip;
      if (len) o.spr.play({ key: k, startFrame: sf }, true);
    }
    o.walking = true;
  },
  npcBrain(o, dt, locked, dPl) {
    const s = o.spr; if (!o.role) this.npcBrainInit(o);
    if (o.emoT > 0) { o.emoT -= dt; o.emo.setPosition(s.x, s.y - 30 * (o.baseSc || 1)); if (o.emoT <= 0) o.emo.setVisible(false); }
    // pulang / keluar rumah
    if (o.away) { if (!isNight() && Math.random() < dt * .3) { o.away = false; s.setVisible(true); s.body.enable = true; o.sh.setVisible(true); o.st = 'think'; o.t = .5; } return; }
    // perlambatan lembut saat pemain mendekat / dialog terkunci (T575 anti-sentak)
    if (locked || (dPl < 32 && !G.title)) {
      const curSp = Math.hypot(s.body.velocity.x, s.body.velocity.y);
      if (o.walking || curSp > 2) {
        s.body.velocity.x *= Math.max(0, 1 - dt * 10);
        s.body.velocity.y *= Math.max(0, 1 - dt * 10);
        if (curSp < 3) { s.setVelocity(0); o.walking = false; s.anims.stop(); this.face(o, o.dir); }
      }
      if (dPl < 32 && !locked && o.st !== 'greet') {
        const dx = this.pl.x - s.x, dy = this.pl.y - s.y;
        this.face(o, Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'));
        o.st = 'greet'; o.t = 1.2;
      }
      return;
    }
    if (o.st === 'greet') { o.t -= dt; if (o.t <= 0) o.st = 'think'; return; }
    o.t -= dt;
    if (o.st === 'think') { if (o.t > 0) return; o.goal = this.npcPickGoal(o); this.npcRoute(o, dPl); return; }
    if (o.st === 'walk') {
      if (o.turnDelay > 0) { o.turnDelay -= dt; s.setVelocity(0); return; }
      const g = o.goal, P = g.path;
      while (P && P.length > 1 && Math.hypot(P[0][0] - s.x, P[0][1] - s.y) < 6) P.shift();
      const end = !P || P.length < 2, [wx, wy] = P && P.length ? P[0] : [g.x, g.y];
      const dx = wx - s.x, dy = wy - s.y, d = Math.hypot(dx, dy);
      if (end && d < 5) { /* tiba: berhenti penuh (dulu digas lagi sehingga berputar di titik tujuan) */
        s.setVelocity(0); o.walking = false; s.anims.stop();
        if (g.act === 'home') {
          o.away = true; s.setVisible(false); s.body.enable = false; o.sh.setVisible(false); if (o.emo) o.emo.setVisible(false); return;
        }
        g.here = true; o.st = 'act'; o.t = g.dur || 3; o.actT = 0; this.npcActStart(o, g); return;
      }
      if (o.t <= 0) { this.npcGiveUp(o); return; }
      // Target speed dengan deselerasi lembut di ujung rute & akselerasi lerp (T575)
      let sp = g.spd || (g.run ? 48 : o.role === 'elder' ? 22 : o.role === 'guard' ? 26 : o.role === 'child' ? 36 : 29);
      if (this.weather === 'rain' && !this.M.indoor) sp *= 1.25;
      if (end && d < 20) sp *= Math.max(0.3, d / 20);
      const targetVx = (dx / (d || 1)) * sp, targetVy = (dy / (d || 1)) * sp;
      const curVx = s.body.velocity.x, curVy = s.body.velocity.y;
      const accel = Math.min(1, dt * 8.5);
      s.setVelocity(curVx + (targetVx - curVx) * accel, curVy + (targetVy - curVy) * accel);
      this.npcWalkAnim(o, dx, dy);
      // macet (menabrak tembok/objek): geser ke samping, lalu menyerah & pilih tujuan lain
      o.stuck += dt;
      if (o.stuck > .7) {
        const moved = Math.hypot(s.x - o.lx, s.y - o.ly); o.stuck = 0; o.lx = s.x; o.ly = s.y;
        if (moved >= 4) o.fails = 0;
        else if ((o.fails = (o.fails || 0) + 1) > 3) this.npcGiveUp(o);
        else if (o.fails === 2) g.path = npcFindPath(this, s.x, s.y, g.x, g.y);
      }
      return;
    }
    if (o.st === 'act') { o.actT -= dt; if (o.actT <= 0) this.npcActTick(o, o.goal); if (o.t <= 0) { if (o.goal && o.goal.done && o.goal.here) o.goal.done(); o.st = 'think'; o.t = rnd(.4, 1.6); } }
  },
  /* mulai berjalan: dekat pemain → cari jalan mengitari tembok; tujuan buntu → menyerah & pilih lain */
  npcRoute(o, dPl) {
    const s = o.spr, g = o.goal; o.st = 'walk'; o.stuck = 0; o.fails = 0; o.lx = s.x; o.ly = s.y;
    o.t = 8 + Math.hypot(g.x - s.x, g.y - s.y) / 14;
    if (dPl > 900) return;
    g.path = npcFindPath(this, s.x, s.y, g.x, g.y); if (!g.path) this.npcGiveUp(o);
  },
  npcGiveUp(o) {
    if (o.goal && o.goal.fail) o.goal.fail();
    o.spr.setVelocity(0); o.walking = false; o.spr.anims.stop(); o.fails = 0; o.st = 'think'; o.t = rnd(.5, 1.5);
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
    else if (g.act === 'sweep') { o.actT = rnd(1.2, 2); this.face(o, pick(['left', 'right', 'down'])); this.npcEmote(o, '🧹', 1.2); }
    else if (g.act === 'kindle') { o.actT = rnd(1.2, 2); this.face(o, 'up'); this.npcEmote(o, '🔥', 1.2); this.sparkle(s.x, s.y - 12, 'smoke', 2); }
    else if (g.act === 'shelter') { o.actT = rnd(2, 4); this.face(o, 'down'); if (Math.random() < .3) this.npcEmote(o, '🌧', 1.4); }
    else {
      // Gestur mikro idle (T577)
      o.actT = rnd(1.5, 3.2);
      const dice = Math.random();
      if (dice < .35) { this.face(o, pick(['left', 'right', 'down'])); }
      else if (dice < .6 && o.baseSc) {
        s.scaleY = o.baseSc * 1.04;
        this.time.delayedCall(220, () => { if (s.active) s.scaleY = o.baseSc; });
      }
      if (Math.random() < .25) this.npcEmote(o, pick(['🎵', '😊', '☕', '📖', '✨', '🍎', '💭', '☀️', '👀']), 1.4);
    }
  },
});

// Kode objek interaktif memanggil this.popWorld(...) dari scene: arahkan ke fungsi global popWorld (ui/widgets.js)
World.prototype.popWorld = function (...a) { return popWorld(...a); };
