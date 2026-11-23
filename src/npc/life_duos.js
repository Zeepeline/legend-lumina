'use strict';
// INTERAKSI ANTAR-NPC — sutradara kecil: tiap ±2 dtk mencari pasangan NPC di dekat pemain lalu memainkan adegan pendek:
// tawar-menawar (pembeli↔pedagang), tanding latihan (prajurit/bayaran), hormat (kapten→prajurit), kejar-kejaran anak,
// gosip warga, menonton pemusik/juru warta/guru, bersulang (penginapan), antar paket (kurir→pedagang).
// Selama adegan otak NPC (brain.js) dilewati (o.duo); adegan batal bila dialog/aksi cerita mulai. Data: life_roles.js.
const LIFE_DUO = { every: 2.2, radius: 480, max: 3, cd: [25, 45] };
const LIFE_GOSSIP = [
  ['Harga roti naik lagi.', 'Gandum dari Padang Angin terlambat.', 'Semoga panen musim ini bagus.', 'Semoga saja.'],
  ['Kau dengar soal serigala di jalan selatan?', 'Penjaga bilang jumlahnya bertambah.', 'Jangan keluar gerbang malam-malam.', 'Tentu tidak!'],
  ['Akademi menerima murid baru.', 'Anakku ingin ikut ujian.', 'Belajar sihir cahaya itu berat.', 'Tapi masa depannya cerah.'],
  ['Festival lentera tinggal sebentar lagi.', 'Aku sudah menjahit lampion merah.', 'Pasti indah sekali.', 'Ayo ke alun-alun bersama.'],
  ['Pedagang dari Teluk Karang datang.', 'Kainnya halus sekali.', 'Mahal, ya?', 'Tawar saja, pasti turun.'],
  ['Hujan semalam deras sekali.', 'Atap rumahku bocor.', 'Panggil tukang dari Kota Bawah.', 'Nanti sore kucari.'],
  ['Ada petualang muda dari Desa Lumina.', 'Yang membawa pedang itu?', 'Katanya berani sekali.', 'Semoga dia selamat.'],
  ['Garnisun berlatih sejak subuh.', 'Suaranya sampai ke rumahku.', 'Biar kota kita aman.', 'Betul juga.'],
];
const LIFE_HAGGLE = [
  ['Berapa harganya?', 'Tiga puluh keping.', 'Dua puluh saja, ya?', 'Dua puluh lima, harga teman.', '🛍'],
  ['Masih segar?', 'Baru datang tadi pagi!', 'Aku ambil dua.', 'Terima kasih, datang lagi!', '🛍'],
  ['Ada yang lebih murah?', 'Yang ini kualitas biasa.', 'Hmm... tidak jadi.', 'Ya sudah, lain kali.', '😤'],
];
const LIFE_LISTEN = { musician: ['👏', 'Indah sekali!'], drummer: ['👏', 'Asyik!'], crier: ['😮', 'Benarkah?!'], teacher: ['✍', 'Baik, Guru!'] };
const lifeIs = re => o => re.test(o.role);
// emosi adegan → animasi lembar sprite (docs/NPC_ROSTER.md); tanpa lembar hanya ikon
const LIFE_EMO_ANIM = { '🫡': 'salute', '👏': 'clap', '🪙': 'pay', '🛍': 'pay', '🍺': 'cheers', '📦': 'give', '😆': 'laugh', '😤': 'refuse', '💰': 'give' };
const LIFE_DUO_KINDS = [ // a = pemrakarsa, b = pasangan; move = siapa yang berjalan (tidak boleh NPC cerita)
  { k: 'haggle', a: lifeIs(/^(shopper|citizen)$/), b: lifeIs(/^(stall|vendor)$/), r: 210, w: 3, move: [0] },
  { k: 'spar', a: lifeIs(/^(soldier|merc)$/), b: (o, a) => o.role === a.role, r: 230, w: 3, move: [0, 1] },
  { k: 'tag', a: lifeIs(/^child$/), b: lifeIs(/^child$/), r: 260, w: 2, move: [0, 1] },
  { k: 'gossip', a: lifeIs(/^(citizen|shopper|water|patron|official|traveler)$/),
    b: lifeIs(/^(citizen|shopper|water|patron|official|elder|traveler)$/), r: 170, w: 3, move: [0] },
  { k: 'listen', a: o => /^(musician|crier|teacher|drummer)$/.test(o.role) && o.st === 'act' && /^(play|announce|lecture|drum)$/.test(o.goal && o.goal.act),
    b: lifeIs(/^(citizen|shopper|child|student)$/), r: 240, w: 4, move: [1] },
  { k: 'cheers', a: lifeIs(/^patron$/), b: lifeIs(/^patron$/), r: 140, w: 2, move: [] },
  { k: 'deliver', a: lifeIs(/^courier$/), b: lifeIs(/^(stall|vendor)$/), r: 600, w: 1, move: [0] },
];
function lifeDuoSteps(k, a, b) {
  const A = a.spr, B = b.spr, S = [];
  const say = (who, t, w = 2) => S.push({ do: 'say', who, t, w }), emo = (who, e) => S.push({ do: 'emo', who, e });
  if (k === 'haggle') {
    const L = pick(LIFE_HAGGLE); S.push({ do: 'go', who: 0, x: B.x + (A.x < B.x ? -22 : 22), y: B.y + rnd(-2, 2) }, { do: 'face' });
    say(0, L[0]); say(1, L[1]); say(0, L[2]); say(1, L[3]); emo(0, L[4]); emo(1, '💰'); if (L[4] === '🛍') S.push({ do: 'sfx', who: 1, n: 'coin' });
  } else if (k === 'spar') {
    const mx = (A.x + B.x) / 2, my = (A.y + B.y) / 2; S.push({ do: 'go2', p: [[mx - 15, my], [mx + 15, my]] }, { do: 'face' });
    say(0, 'Siap?', 1.2); say(1, 'Maju!', 1.2);
    for (let i = 0; i < 6; i++) S.push({ do: 'hit', who: i % 2 });
    say(0, pick(['Bagus!', 'Tangkisanmu makin kuat.']), 1.6); say(1, pick(['Lagi besok!', 'Terima kasih!']), 1.6);
  } else if (k === 'salute') {
    S.push({ do: 'faceTo', who: 1, at: 0 }); emo(1, '🫡'); say(1, pick(['Siap, Kapten!', 'Hormat, Kapten!']), 1.4);
    say(0, pick(['Bagus, lanjutkan!', 'Tegakkan bahu!', 'Kuda-kuda lebih rendah!']), 1.6);
  } else if (k === 'tag') {
    say(0, 'Kamu yang jaga!', 1); S.push({ do: 'chase', who: 1, t: rnd(4, 7) }); say(1, 'Kena!', 1); emo(0, '😆');
    S.push({ do: 'chase', who: 0, t: rnd(3, 5) }); say(0, 'Kena kamu!', 1); emo(1, '😆');
  } else if (k === 'gossip') {
    const L = pick(LIFE_GOSSIP); S.push({ do: 'go', who: 0, x: B.x + (A.x < B.x ? -22 : 22), y: B.y + rnd(-3, 3) }, { do: 'face' });
    L.forEach((t, i) => say(i % 2, t, 2.3)); emo(0, '😄'); emo(1, '👋');
  } else if (k === 'listen') {
    const ang = rnd(.3, 2.8), d = rnd(26, 44), R = LIFE_LISTEN[a.role] || ['👏', 'Bagus!'];
    S.push({ do: 'go', who: 1, x: A.x + Math.cos(ang) * d, y: A.y + Math.sin(ang) * d * .6 + 10 });
    S.push({ do: 'faceTo', who: 1, at: 0 }, { do: 'wait', t: rnd(3, 5) });
    emo(1, R[0]); say(1, R[1], 1.6); if (a.role === 'musician') { emo(1, '🪙'); S.push({ do: 'sfx', who: 1, n: 'coin' }); }
    S.push({ do: 'wait', t: rnd(2, 4) });
  } else if (k === 'cheers') {
    S.push({ do: 'face' }); say(0, 'Bersulang!', 1.4); say(1, 'Untuk Lumina!', 1.4); emo(0, '🍺'); emo(1, '🍺'); S.push({ do: 'sfx', who: 0, n: 'click' });
  } else if (k === 'deliver') {
    S.push({ do: 'go', who: 0, x: B.x + (A.x < B.x ? -22 : 22), y: B.y, run: true }, { do: 'face' }); emo(0, '📦');
    say(0, 'Kiriman untukmu!', 1.6); say(1, 'Terima kasih, cepat sekali!', 1.8); emo(1, '😊');
  }
  return S;
}
function lifeFree(sc, o) {
  return o && o.spr && o.spr.active && o.spr.visible && !o.duo && !o.act && !o.away && !(o.n && (o.n.still || o.n.noDuo)) &&
    o.st !== 'greet' && !(o.duoCd > sc.t);
}
Object.assign(World.prototype, {
  /* mulai adegan; untuk 'salute' hanya b yang dikunci (kapten tetap dikendalikan otaknya) */
  lifeDuoStart(k, a, b) {
    if (!this.lifeDuos) this.lifeDuos = [];
    const lock = k === 'salute' || k === 'listen' ? [b] : [a, b]; /* penampil & kapten tetap dikendalikan otaknya */
    if (lock.some(o => !lifeFree(this, o)) || this.lifeDuos.length >= LIFE_DUO.max + 1) return null;
    const d = { k, o: [a, b], lock, steps: lifeDuoSteps(k, a, b), i: 0, age: 0, fired: 0, tot: 0 };
    for (const o of lock) { o.duo = d; o.socialCd = 40; o.st = 'duo'; o.spr.setVelocity(0); }
    this.lifeDuos.push(d); return d;
  },
  lifeDuoEnd(d) {
    for (const o of d.lock) {
      if (o.duo !== d) continue; o.duo = null; o.duoCd = this.t + rnd(...LIFE_DUO.cd);
      if (!o.spr || !o.spr.active) continue; o.spr.setVelocity(0);
      if (o.walking) { o.walking = false; o.spr.anims.stop(); this.face(o, o.dir); } o.st = 'think'; o.t = rnd(.6, 1.6);
    }
    this.lifeDuos.splice(this.lifeDuos.indexOf(d), 1);
  },
  /* berjalan ke (x,y); true bila sudah sampai */
  lifeGo(o, x, y, run) {
    const s = o.spr, dx = x - s.x, dy = y - s.y, d = Math.hypot(dx, dy);
    if (d < 5) { s.setVelocity(0); if (o.walking) { o.walking = false; s.anims.stop(); this.face(o, o.dir); } return true; }
    const sp = (run ? 46 : 30) * Math.min(1, Math.max(.4, d / 18)); s.setVelocity(dx / d * sp, dy / d * sp); this.npcWalkAnim(o, dx, dy); return false;
  },
  lifeDuoTick(d, dt) {
    if (G.lock > 0 || d.lock.some(o => !o.spr || !o.spr.active || o.act || o.away || o.duo !== d) || d.tot > 60) return this.lifeDuoEnd(d);
    const st = d.steps[d.i]; if (!st) return this.lifeDuoEnd(d);
    d.age += dt; d.tot += dt;
    for (const o of d.lock) {
      if (!(o.emoT > 0)) continue; o.emoT -= dt;
      o.emo.setPosition(o.spr.x, o.spr.y - 30 * (o.baseSc || 1)); if (o.emoT <= 0) o.emo.setVisible(false);
    }
    const O = d.o, who = O[st.who || 0], other = O[st.who ? 0 : 1]; let done = false;
    if (st.do === 'go') done = this.lifeGo(who, st.x, st.y, st.run) || d.age > 8;
    else if (st.do === 'go2') done = (this.lifeGo(O[0], ...st.p[0]) & this.lifeGo(O[1], ...st.p[1])) || d.age > 8;
    else if (st.do === 'face') { for (const o of d.lock) lifeFace(this, o, (o === O[0] ? O[1] : O[0]).spr.x, (o === O[0] ? O[1] : O[0]).spr.y); done = true; }
    else if (st.do === 'faceTo') { lifeFace(this, who, O[st.at].spr.x, O[st.at].spr.y); done = true; }
    else if (st.do === 'say') {
      if (!d.fired) { if (lifeNear(this, who, 340)) popBark(who, st.t); if (this.lifeAnim) this.lifeAnim(who, 'talk'); d.fired = 1; }
      done = d.age > st.w;
    } else if (st.do === 'emo') {
      this.npcEmote(who, st.e, 1.4); if (LIFE_EMO_ANIM[st.e] && this.lifeAnim) this.lifeAnim(who, LIFE_EMO_ANIM[st.e]); done = true;
    }
    else if (st.do === 'sfx') { lifeSfx(this, who, st.n, 1); done = true; }
    else if (st.do === 'wait') done = d.age > st.t;
    else if (st.do === 'hit') {
      if (!d.fired) {
        const real = this.lifeAnim && this.lifeAnim(who, 'spar_attack'); if (this.lifeAnim) this.lifeAnim(other, 'spar_block');
        if (!real) lifeLunge(this, who, other.spr.x - who.spr.x, other.spr.y - who.spr.y, 6, 140); d.fired = 1;
        this.sparkle((who.spr.x + other.spr.x) / 2, (who.spr.y + other.spr.y) / 2 - 14, 'doto', 3); lifeSfx(this, who, 'hit', .8);
      }
      done = d.age > .6;
    } else if (st.do === 'chase') { // who = pengejar, other = yang dikejar
      const r = other.spr, c = who.spr, dd = Math.hypot(r.x - c.x, r.y - c.y);
      if (!d.fired || d.age - d.fired > .7) { /* lari menjauh dari pengejar, tetap di sekitar rumah */
        d.fired = d.age || .01; const n = dd || 1, h = other.home;
        d.fx = clamp(r.x + (r.x - c.x) / n * 50, h.x - 140, h.x + 140); d.fy = clamp(r.y + (r.y - c.y) / n * 36, h.y - 90, h.y + 90);
      }
      this.lifeGo(other, d.fx, d.fy, true); this.lifeGo(who, r.x, r.y, true);
      done = dd < 12 || d.age > st.t; if (done) { r.setVelocity(0); c.setVelocity(0); }
    }
    if (done) { d.i++; d.age = 0; d.fired = 0; }
  },
  lifeDirector() {
    const pl = this.pl; if (!pl || G.lock > 0 || G.title || (this.lifeDuos && this.lifeDuos.length >= LIFE_DUO.max)) return;
    const near = this.npcs.filter(o => (lifeFree(this, o) || o.st === 'act') && Math.hypot(o.spr.x - pl.x, o.spr.y - pl.y) < LIFE_DUO.radius);
    if (near.length < 2) return;
    const kinds = LIFE_DUO_KINDS.flatMap(K => Array(K.w).fill(K)).sort(() => Math.random() - .5);
    for (const K of kinds) {
      const As = near.filter(o => K.a(o) && !(K.move.includes(0) && o.story)).sort(() => Math.random() - .5);
      for (const a of As) {
        const b = near.find(o => o !== a && K.b(o, a) && !(K.move.includes(1) && o.story) && Math.hypot(o.spr.x - a.spr.x, o.spr.y - a.spr.y) < K.r);
        if (b && this.lifeDuoStart(K.k, a, b)) return;
      }
    }
  },
  lifeDuoUpd(dt) {
    if (this.lifeDuos) for (const d of this.lifeDuos.slice()) this.lifeDuoTick(d, dt);
    this.lifeDirT = (this.lifeDirT || rnd(1, 3)) - dt;
    if (this.lifeDirT <= 0) { this.lifeDirT = LIFE_DUO.every * rnd(.7, 1.3); this.lifeDirector(); }
  },
});
{
  const brain0 = World.prototype.npcBrain;
  World.prototype.npcBrain = function (o, dt, locked, dPl) { if (o.duo) return undefined; return brain0.call(this, o, dt, locked, dPl); };
  const upd0 = World.prototype.update;
  World.prototype.update = function (t, dms) {
    upd0.apply(this, arguments);
    if (!this.npcs || !this.npcs.length || (G.scene && G.scene !== this)) return;
    this.lifeDuoUpd(Math.min(.05, (dms || 16) / 1000));
  };
  const create0 = World.prototype.create; /* scene di-restart: adegan lama dibuang */
  World.prototype.create = function (...a) { this.lifeDuos = []; this.lifeDirT = 2; return create0.apply(this, a); };
}
