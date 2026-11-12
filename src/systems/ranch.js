'use strict';
// Gelombang 8: peternakan (#47), kandang ayam (#514), kandang sapi (#515), kasih sayang hewan (#519),
// benih beragam (#48 sebagian), irigasi (#505)
Object.assign(ITEMS, {
  milk: { n: 'Susu Segar', k: 'use', hp: 30, mp: 10, price: 14, sell: 7, d: 'Susu sapi kandang sendiri. Pulihkan 30 HP & 10 MP.' },
  seed_b: { n: 'Benih Beri', k: 'mat', price: 6, sell: 2, d: 'Ditanam di petak kebun. Panen Buah Beri ×4 (8 jam).' },
  seed_h: { n: 'Benih Daun Obat', k: 'mat', price: 5, sell: 2, d: 'Ditanam di petak kebun. Panen Daun Obat ×4 (5 jam).' },
  feed: { n: 'Pakan Ternak', k: 'mat', price: 3, sell: 1, d: 'Makanan ayam, domba, dan sapi.' },
});
Object.assign(ICONS_DEF, {
  milk: ['flask', { C: '#f8f8f0', L: '#ffffff', D: '#b8c0c8', E: '#8a9aa8', G: '#e8f0f8' }],
  seed_b: ['blob', { C: '#c84a7a', L: '#ff9ac0', D: '#7a2a4a', E: '#3a1a2a' }],
  seed_h: ['blob', { C: '#5fbf68', L: '#a8e8a0', D: '#2a7a3a', E: '#1a4a20' }],
  feed: ['blob', { C: '#d8b860', L: '#f8e0a0', D: '#9a7a30', E: '#6a5020' }],
});
const SEEDS = {
  seed: { out: 'veg', n: 3, h: 6 },
  seed_b: { out: 'berry', n: 4, h: 8 },
  seed_h: { out: 'herb', n: 4, h: 5 },
  seed_flower: { out: 'flower_bouquet', n: 1, h: 5 }
};
const STOCK = {
  hen: { n: 'Ayam', p: 80, out: 'egg', tex: 'chick0', snd: 'Petok!' },
  sheep: { n: 'Domba', p: 150, out: 'wool', tex: 'rn_sheep', snd: 'Mbeee~' },
  cow: { n: 'Sapi', p: 220, out: 'milk', tex: 'rn_cow', snd: 'Mooo~' },
};
const RANCH_MAX = 6, IRRIG_PRICE = 250;
function farmInit() { if (!S.farm) S.farm = { animals: [], irrig: {} }; return S.farm; }
const today = () => S.day || 0;
// sprite domba & sapi (2 bingkai: diam, melangkah), gaya ART_BIBLE: garis tepi berwarna, cahaya kiri-atas
function rnTextures(sc) {
  if (sc.textures.exists('rn_sheep')) return;
  const draw = (kind, f) => { const [c, x] = mk(22, 18), P = (col, a, b, w, h) => fr(x, col, a, b, w, h);
    const leg = f ? 1 : 0;
    if (kind === 'sheep') { P('#6a6070', 5, 13 + leg, 2, 4); P('#6a6070', 15, 13 - leg + 1, 2, 4); P('#9a8e9a', 3, 4, 16, 10); P('#f4f0e8', 4, 3, 14, 10); P('#ffffff', 5, 3, 8, 4); P('#d8d0c8', 4, 11, 14, 2); P('#4a3e4a', 15, 5, 6, 6); P('#6a5a6a', 16, 6, 4, 4); P('#ffffff', 19, 7, 1, 1); }
    else { P('#5a4a3a', 4, 12 + leg, 2, 5); P('#5a4a3a', 15, 12 - leg + 1, 2, 5); P('#7a6a5a', 2, 4, 17, 10); P('#f8f4ec', 3, 4, 15, 8); P('#2a2a32', 6, 5, 4, 3); P('#2a2a32', 12, 8, 3, 3); P('#e8d8c8', 3, 11, 15, 2); P('#f8f4ec', 15, 2, 6, 7); P('#2a2a32', 16, 3, 2, 2); P('#ffb0b8', 17, 7, 4, 2); P('#c8a060', 15, 1, 1, 2); P('#c8a060', 20, 1, 1, 2); }
    return c; };
  for (const k of ['sheep', 'cow']) { const [c, x] = mk(44, 18); x.drawImage(draw(k, 0), 0, 0); x.drawImage(draw(k, 1), 22, 0); sc.textures.addSpriteSheet('rn_' + k, c, { frameWidth: 22, frameHeight: 18 }); sc.anims.create({ key: 'rn_' + k + '_mv', frames: sc.anims.generateFrameNumbers('rn_' + k, { start: 0, end: 1 }), frameRate: 3, repeat: -1 }); }
}
Object.assign(World.prototype, {
  spawnRanch() {
    this.herd = []; const R = this.M.ranch; if (!R || G.title) return; rnTextures(this); const F = farmInit();
    // pagar kayu (tabrakan sudah di data peta: walls)
    const g = this.add.graphics().setDepth(R.y + 2), post = (x, y) => { g.fillStyle(0x7a5030).fillRect(x - 2, y - 8, 4, 10); g.fillStyle(0xb88050).fillRect(x - 1, y - 8, 2, 2); };
    g.fillStyle(0x9a6a3a); g.fillRect(R.x, R.y - 4, R.w, 3); g.fillRect(R.x, R.y + 1, R.w, 2);
    for (let x = R.x; x <= R.x + R.w; x += 16) post(x, R.y + 2);
    const gb = this.add.graphics().setDepth(R.y + R.h + 4); gb.fillStyle(0x9a6a3a); gb.fillRect(R.x, R.y + R.h - 2, R.w, 3); gb.fillRect(R.x, R.y + R.h + 3, R.w, 2);
    for (let x = R.x; x <= R.x + R.w; x += 16) { gb.fillStyle(0x7a5030).fillRect(x - 2, R.y + R.h - 6, 4, 12); }
    const gs = this.add.graphics().setDepth(R.y + 50); gs.fillStyle(0x9a6a3a);
    for (const [x0] of [[R.x], [R.x + R.w - 4]]) for (let y = R.y; y < R.y + R.h; y += 4) { if (x0 === R.x && y >= R.gate[0] && y < R.gate[1]) continue; gs.fillRect(x0 + 1, y, 3, 3); }
    // papan kandang
    this.add.text(R.x + 30, R.y - 16, '🐔 Kandang Arka', { fontFamily: 'monospace', fontSize: '8px', color: '#fff3c0', stroke: '#3a2416', strokeThickness: 3 }).setOrigin(.5, 1).setDepth(R.y + 3);
    this.inter.push({ x: R.x - 8, y: (R.gate[0] + R.gate[1]) / 2, r: 18, fn: () => this.ranchMenu() });
    F.animals.forEach((a, i) => this.spawnStock(a, i));
  },
  spawnStock(a, i) {
    const R = this.M.ranch, D = STOCK[a.k], x = R.x + 24 + (i % 3) * 38, y = R.y + 28 + Math.floor(i / 3) * 14;
    const s = this.add.sprite(x, y, D.tex, 0).setOrigin(.5, 1).setDepth(y); s.play(D.tex === 'chick0' ? 'chick0_mv' : D.tex + '_mv');
    const o = { a, s, t: rnd(0, 2), vx: 0, vy: 0 }; this.herd.push(o);
    this.inter.push(o.it = { x, y, r: 16, fn: () => this.tendStock(o) });
  },
  updRanch(dt) {
    const R = this.M.ranch; if (!R || !this.herd || G.lock) return;
    for (const o of this.herd) {
      o.t -= dt; if (o.t <= 0) { o.t = rnd(1.5, 4); const go = Math.random() < .55, a = rnd(0, 6.28); o.vx = go ? Math.cos(a) * 12 : 0; o.vy = go ? Math.sin(a) * 8 : 0; }
      const s = o.s; s.x = clamp(s.x + o.vx * dt, R.x + 14, R.x + R.w - 14); s.y = clamp(s.y + o.vy * dt, R.y + 22, R.y + R.h - 6); s.setDepth(s.y);
      if (o.vx) s.flipX = o.vx > 0; s.anims.timeScale = o.vx || o.vy ? 1 : .3; o.it.x = s.x; o.it.y = s.y;
      // tanda siap dipanen
      const ready = o.a.fed === today() && o.a.got !== today();
      if (ready && !o.mk) o.mk = this.add.text(s.x, s.y - 20, '✦', { fontSize: '9px', color: '#ffd84a', stroke: '#3a2416', strokeThickness: 2 }).setOrigin(.5).setDepth(9000);
      if (!ready && o.mk) { o.mk.destroy(); o.mk = null; }
      if (o.mk) o.mk.setPosition(s.x, s.y - 20 + Math.sin(this.t * 4) * 2);
    }
  },
  async tendStock(o) {
    const a = o.a, D = STOCK[a.k]; G.lock++;
    try {
      const hearts = '♥'.repeat(Math.min(5, Math.floor(a.love / 2))) || '♡';
      const ready = a.fed === today() && a.got !== today();
      const r = await choose({ head: `${a.name} (${D.n}) ${hearts}`, x: 40, y: 60, w: 230, items: [
        { t: 'Elus', r: a.pet === today() ? 'sudah' : '', dis: a.pet === today() },
        { t: 'Beri pakan', r: a.fed === today() ? 'sudah' : 'Pakan/Sayur', dis: a.fed === today() },
        { t: 'Ambil ' + ITEMS[D.out].n, dis: !ready }, { t: 'Tutup' }],
        foot: i => ['Elus tiap hari: hewan makin sayang, hasilnya makin banyak.', 'Pakai Pakan Ternak (atau Sayur Segar). Hewan yang makan hari ini memberi hasil.', ready ? 'Siap diambil!' : 'Beri pakan dulu hari ini.', ''][i] });
      if (r === 0) { a.pet = today(); a.love = Math.min(10, (a.love || 0) + 1); sfx('heal'); this.sparkle(o.s.x, o.s.y - 10, 'dotg', 8); popWorld(o.s.x, o.s.y - 22, D.snd + ' ♥', 'heal'); }
      else if (r === 1) { const food = has('feed') ? 'feed' : has('veg') ? 'veg' : null; if (!food) { sfx('buzz'); await say('Kamu tidak punya Pakan Ternak atau Sayur Segar. Pakan dijual di kios Bu Sari dan di papan kandang.', 'Kandang'); } else { addItem(food, -1); a.fed = today(); sfx('ok'); popWorld(o.s.x, o.s.y - 22, 'nyam!', 'xp'); } }
      else if (r === 2) { const n = (a.love || 0) >= 6 ? 2 : 1; addItem(D.out, n); a.got = today(); S.farmGot = (S.farmGot || 0) + n; sfx('chest'); updHud(); popWorld(o.s.x, o.s.y - 22, '+' + n + ' ' + ITEMS[D.out].n, 'crit'); }
    } finally { G.lock--; }
  },
  async ranchMenu() {
    const F = farmInit(); G.lock++;
    try {
      if (!homeInit().owned) { await say('Kandang ini milik rumah sebelah. Kalau kamu membeli rumahnya, kandang ini ikut jadi milikmu.', 'Kandang'); return; }
      for (; ;) {
        const r = await choose({ head: `Kandang Arka · ${F.animals.length}/${RANCH_MAX} · ${S.gold} G`, x: 30, y: 40, w: 260,
          items: [...Object.keys(STOCK).map(k => ({ t: 'Beli ' + STOCK[k].n, r: STOCK[k].p + ' G', dis: F.animals.length >= RANCH_MAX })), { t: 'Beli Pakan Ternak ×5', r: '15 G' }, { t: 'Tutup' }],
          foot: i => i < 3 ? `${STOCK[Object.keys(STOCK)[i]].n} memberi ${ITEMS[STOCK[Object.keys(STOCK)[i]].out].n} tiap hari setelah diberi pakan.` : i === 3 ? 'Satu pakan untuk satu hewan per hari.' : '' });
        if (r < 0 || r > 3) return;
        if (r === 3) { if (S.gold < 15) { sfx('buzz'); continue; } S.gold -= 15; addItem('feed', 5); sfx('chest'); updHud(); continue; }
        const k = Object.keys(STOCK)[r], D = STOCK[k];
        if (S.gold < D.p) { sfx('buzz'); await say('Uangmu belum cukup.', 'Kandang'); continue; }
        S.gold -= D.p; updHud(); const names = { hen: ['Kiko', 'Ciko', 'Mimi', 'Ponti'], sheep: ['Kapas', 'Bolu', 'Awan'], cow: ['Manis', 'Belang', 'Susi'] }[k];
        const a = { k, name: names[F.animals.filter(x => x.k === k).length % names.length], love: 0 }; F.animals.push(a); this.spawnStock(a, F.animals.length - 1); sfx('chest');
        await say(`${a.name} si ${D.n} sekarang tinggal di kandangmu!`, 'Kandang');
      }
    } finally { G.lock--; }
  },
});
function plotHours(p) { const base = SEEDS[p.seed || 'seed'].h; const irr = S.farm && S.farm.irrig && S.farm.irrig[p.plot]; return p.fast || irr ? base / 2 : base; }
World.prototype.plantPlot = async function (i) {
  const F = farmInit(), key = this.M.id + i, seeds = Object.keys(SEEDS).filter(k => has(k));
  const items = [...seeds.map(k => ({ t: 'Tanam ' + ITEMS[k].n, r: 'x' + S.inv[k] })), { t: F.irrig[key] ? 'Irigasi terpasang ✓' : 'Pasang irigasi', r: F.irrig[key] ? '' : IRRIG_PRICE + ' G', dis: !!F.irrig[key] }, { t: 'Tutup' }];
  const r = await choose({ head: 'Petak kebun kosong', x: 40, y: 60, w: 240, items, foot: j => j < seeds.length ? ITEMS[seeds[j]].d : j === seeds.length ? 'Saluran air: petak ini selalu tumbuh 2× lebih cepat.' : (seeds.length ? '' : 'Beli benih di kios Bu Sari.') });
  if (r < 0 || r > seeds.length) return;
  if (r === seeds.length) { if (S.gold < IRRIG_PRICE) { sfx('buzz'); return say('Uangmu belum cukup untuk irigasi.', 'Kebun'); } S.gold -= IRRIG_PRICE; F.irrig[key] = 1; updHud(); sfx('chest'); return say('Saluran irigasi terpasang. Petak ini tumbuh dua kali lebih cepat!', 'Kebun'); }
  const k = seeds[r]; addItem(k, -1); S.garden[i] = { t: gameHours(), fast: this.weather === 'rain', seed: k, plot: key }; sfx('ok'); this.updGarden(true);
  return talk(null, ['Kamu menanam ' + ITEMS[k].n + '. Panen sekitar ' + plotHours(S.garden[i]) + ' jam lagi' + (this.weather === 'rain' ? ' (hujan mempercepat!)' : '') + '.']);
};
