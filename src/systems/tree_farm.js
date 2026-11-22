'use strict';
// MENANAM POHON — bibit dibeli di kios Bu Sari, dipakai dari tas → ditanam di rumput di depan Arka (wilayah luar ruang).
// Tumbuh menurut jam game: bibit (<20 j) → pohon muda (<60 j) → pohon dewasa. Pohon dewasa bisa ditebang (3 ayunan →
// Kayu Gelondong `log`), meninggalkan tunggul yang lapuk sendiri setelah 48 jam. Pohon apel dewasa berbuah tiap 24 jam
// (petik → Apel Segar ×3). Data di `S.ptrees` [{ id, k: 'oak'|'apple', reg, x, y (lokal wilayah), t, cut, pick }].
const TREE_FARM = {
  kinds: { oak: { item: 'sapling_oak', tex: 'i_treeA', young: 20, mature: 60, log: 4 },
    apple: { item: 'sapling_apple', tex: 'tree_apple_fruit', bare: 'tree_apple_bare', scale: .53, young: 24, mature: 72, log: 3, fruit: 24 } },
  gap: 40, stump: 48,
};
Object.assign(ITEMS, {
  sapling_oak: { n: 'Bibit Pohon Ek', k: 'use', price: 30, sell: 10,
    d: 'Tanam di rumput (pakai dari tas). Tumbuh jadi pohon dalam ±2,5 hari; bisa ditebang untuk kayu.' },
  sapling_apple: { n: 'Bibit Pohon Apel', k: 'use', price: 55, sell: 18, d: 'Tanam di rumput. Dewasa dalam 3 hari, berbuah apel tiap hari; bisa ditebang.' },
});
Object.assign(ITEMS, { /* tanaman kebun baru */
  seed_carrot: { n: 'Benih Wortel', k: 'mat', price: 6, sell: 2, d: 'Ditanam di petak kebun. Panen Wortel ×4 (7 jam).' },
  seed_wheat: { n: 'Benih Gandum', k: 'mat', price: 5, sell: 2, d: 'Ditanam di petak kebun. Panen Gandum ×5 (9 jam).' },
  seed_pumpkin: { n: 'Benih Labu', k: 'mat', price: 12, sell: 4, d: 'Ditanam di petak kebun. Panen Labu Besar ×1 (12 jam), harga jual tinggi.' },
  carrot: { n: 'Wortel', k: 'use', hp: 22, sell: 5, d: 'Pulihkan 22 HP. Renyah dan manis.' },
  wheat: { n: 'Gandum', k: 'mat', sell: 4, d: 'Bulir gandum kering. Bahan roti dan pakan ternak.' },
  pumpkin: { n: 'Labu Besar', k: 'use', hp: 60, sell: 30, d: 'Pulihkan 60 HP. Labu jingga besar, laku mahal di pasar.' },
});
Object.assign(SEEDS, { seed_carrot: { out: 'carrot', n: 4, h: 7 }, seed_wheat: { out: 'wheat', n: 5, h: 9 }, seed_pumpkin: { out: 'pumpkin', n: 1, h: 12 } });
Object.assign(ICONS_DEF, {
  seed_carrot: ['blob', { C: '#f08a2e', L: '#ffc070', D: '#a8501e', E: '#5a3a1a' }],
  seed_wheat: ['blob', { C: '#e8c058', L: '#f6e09a', D: '#a8803a', E: '#5a4a1a' }],
  seed_pumpkin: ['blob', { C: '#e8b878', L: '#f8e0b0', D: '#a8783a', E: '#5a3a1a' }],
  carrot: ['blob', { C: '#f08a2e', L: '#ffc070', D: '#a8501e', E: '#3a6a2a' }],
  wheat: ['blob', { C: '#e8c058', L: '#f6e09a', D: '#a8803a', E: '#6a5020' }],
  pumpkin: ['blob', { C: '#e8782a', L: '#ffb070', D: '#9a4a1a', E: '#4a6a2a' }],
  sapling_oak: ['blob', { C: '#6fa85a', L: '#a8d880', D: '#3f6a3c', E: '#7a4c2e' }],
  sapling_apple: ['blob', { C: '#7ab85a', L: '#d0f0a0', D: '#3f6a3c', E: '#c8304c' }],
});
const ptreeList = () => (S.ptrees = S.ptrees || []);
// bibit: batang kecil + 3 daun (kanvas 2× gaya Sprout)
function ptreeSaplingTex(sc, apple) {
  const k = apple ? 'ptree_sap_apple' : 'ptree_sap'; if (sc.textures.exists(k)) return k;
  const L = FARM_ART.leaf, W = SPROUT_PROPS.W;
  sc.textures.addCanvas(k, spProp(10, 14, (r, p) => {
    r(4, 6, 2, 7, W.ol); r(4, 6, 1, 6, W.md); r(2, 12, 6, 2, FARM_ART.soil.ol); r(3, 12, 4, 1, FARM_ART.soil.lt);
    for (const [X, Y] of [[1, 4], [6, 2], [3, 0]]) { r(X, Y, 4, 3, L.ol); r(X + 1, Y + 1, 2, 1, L.lt); p(X + 1, Y, L.md); }
    if (apple) { p(2, 6, '#c8304c'); p(7, 4, '#e86070'); }
  }));
  return k;
}
function ptreeStage(p) {
  const K = TREE_FARM.kinds[p.k], h = gameHours() - p.t;
  return p.cut != null ? 'stump' : h < K.young ? 'sap' : h < K.mature ? 'young' : 'mature';
}
// koordinat scene: benua = global, peta tunggal = lokal
function ptreePos(sc, p) {
  if (sc.M.benua) { const P = WORLD_POS[p.reg]; return P ? [P[0] + p.x, P[1] + p.y] : null; }
  return p.reg === sc.M.id ? [p.x, p.y] : null;
}
Object.assign(World.prototype, {
  plantTree(id) {
    const kind = Object.keys(TREE_FARM.kinds).find(k => TREE_FARM.kinds[k].item === id), pl = this.pl, M = this.M;
    if (!kind || M.indoor) { say('Bibit hanya bisa ditanam di luar ruangan.'); return false; }
    const d = { up: [0, -20], down: [0, 22], left: [-20, 4], right: [20, 4] }[pl.dir] || [0, 22];
    const x = Math.round(pl.x + d[0]), y = Math.round(pl.y + d[1]);
    const reg = M.benua ? regionOwner(x, y) : M.id, R = MAPS[reg], P = M.benua ? WORLD_POS[reg] : [0, 0];
    const E = R && typeof grassEdgeData === 'function' && grassEdgeData(R); if (!E) { say('Tanah di sini tidak bisa ditanami.'); return false; }
    const lx = x - P[0], ly = y - P[1], c = Math.floor(lx / 16), r = Math.floor((ly - 4) / 16), k = r * E.cols + c;
    const no = t => { sfx('buzz'); say(t); return false; };
    if (c < 0 || r < 0 || c >= E.cols || r >= E.rows || !E.grass[k] || E.Wm[k]) return no('Bibit butuh tanah berumput, bukan jalan, pasir, atau air.');
    if (this.physics.overlapRect(x - 10, y - 10, 20, 12, false, true).length) return no('Terlalu sempit, ada benda di situ.');
    if (ptreeList().some(q => q.reg === reg && Math.hypot(q.x - lx, q.y - ly) < TREE_FARM.gap)) return no('Terlalu dekat dengan pohon yang kamu tanam.');
    ptreeList().push({ id: 'pt' + Date.now().toString(36), k: kind, reg, x: lx, y: ly, t: gameHours() });
    addItem(id, -1); sfx('ok'); this.puff(x, y - 2); updHud(); this.ptreeSync(true);
    say(ITEMS[id].n + ' ditanam. Siram dengan sabar — pohon tumbuh dalam beberapa hari.');
    return true;
  },
  ptreeSync(force) {
    this.ptT = (this.ptT || 0) - (this.dt || .016); if (!force && this.ptT > 0) return; this.ptT = 1;
    const on = this.ptSpr = this.ptSpr || new Map(), list = ptreeList(), now = gameHours();
    for (let i = list.length - 1; i >= 0; i--) if (list[i].cut != null && now - list[i].cut > TREE_FARM.stump) list.splice(i, 1); /* tunggul lapuk */
    const keep = new Set();
    for (const p of list) {
      const pos = ptreePos(this, p); if (!pos) continue;
      const K = TREE_FARM.kinds[p.k], st = ptreeStage(p), fruit = p.k === 'apple' && st === 'mature' && now - (p.pick || p.t + K.mature) >= K.fruit;
      const sig = st + (fruit ? 'f' : ''); keep.add(p.id);
      const cur = on.get(p.id); if (cur && cur.sig === sig) continue;
      if (cur) this.ptreeDrop(cur);
      on.set(p.id, this.ptreeMake(p, pos, st, fruit, sig));
    }
    for (const [id, o] of on) if (!keep.has(id)) { this.ptreeDrop(o); on.delete(id); }
  },
  ptreeMake(p, [x, y], st, fruit, sig) {
    const K = TREE_FARM.kinds[p.k], o = { sig, objs: [], wall: null, inter: null };
    let s;
    if (st === 'sap') s = this.add.image(x, y, ptreeSaplingTex(this, p.k === 'apple')).setOrigin(.5, 1);
    else if (st === 'stump') s = this.add.image(x, y, this.textures.exists('spStump') ? 'spStump' : 'verdant_stump').setOrigin(.5, 1);
    else {
      const tex = p.k === 'apple' && !fruit ? K.bare : K.tex;
      s = this.add.sprite(x, y, tex, 0).setOrigin(.5, p.k === 'apple' ? .96 : 1).setScale((K.scale || 1) * (st === 'young' ? .62 : 1));
      if (this.anims.exists(tex + '_sway')) s.play({ key: tex + '_sway', startFrame: Math.abs(Math.round(x + y)) % 8 });
      o.wall = this.wall(x - 6, y - 8, 12, 6);
      if (st === 'mature') this.fades.push(o.fade = { s, l: x - 30, r: x + 30, t: y - 90, b: y - 10 });
    }
    s.setDepth(y); o.objs.push(s);
    if (st === 'mature' || st === 'stump') { o.inter = { x, y: y + 4, r: 24, fn: () => this.ptreeUse(p, st, fruit) }; this.inter.push(o.inter); }
    else {
      const t = st === 'sap' ? 'Bibit kecil ini baru tumbuh. Tunggu beberapa hari lagi.' : 'Pohon muda ini terus tumbuh. Sebentar lagi dewasa.';
      o.inter = { x, y: y + 4, r: 18, fn: () => say(t) }; this.inter.push(o.inter);
    }
    return o;
  },
  ptreeDrop(o) {
    for (const s of o.objs) s.destroy();
    if (o.wall) o.wall.destroy();
    if (o.inter) { const i = this.inter.indexOf(o.inter); if (i >= 0) this.inter.splice(i, 1); }
    if (o.fade) { const i = this.fades.indexOf(o.fade); if (i >= 0) this.fades.splice(i, 1); }
  },
  async ptreeUse(p, st, fruit) {
    const K = TREE_FARM.kinds[p.k];
    if (st === 'stump') {
      const r = await choose({ head: 'Tunggul pohon', items: [{ t: 'Cabut tunggul' }, { t: 'Biarkan' }], foot: () => 'Lahan bisa ditanami lagi.' });
      if (r === 0) { ptreeList().splice(ptreeList().indexOf(p), 1); sfx('hit'); this.ptreeSync(true); }
      return;
    }
    const items = [...(fruit ? [{ t: 'Petik apel' }] : []), { t: 'Tebang pohon' }, { t: 'Batal' }];
    const foot = j => items[j].t === 'Tebang pohon' ? 'Dapat Kayu Gelondong ×' + K.log + '. Tunggul tersisa.' : '';
    const r = await choose({ head: p.k === 'apple' ? 'Pohon Apel' : 'Pohon Ek', items, foot });
    if (r < 0 || items[r].t === 'Batal') return;
    const pos = ptreePos(this, p); if (!pos) return;
    if (items[r].t === 'Petik apel') {
      p.pick = gameHours(); addItem('apple', 3); sfx('chest'); popWorld(pos[0], pos[1] - 60, '+Apel ×3', 'gold'); updHud(); this.ptreeSync(true); return;
    }
    const o = this.ptSpr && this.ptSpr.get(p.id), s = o && o.objs[0];
    G.lock++;
    try {
      for (let i = 0; i < 3; i++) {
        sfx('hit'); this.puff(pos[0] + rnd(-8, 8), pos[1] - 6); this.sparkle(pos[0], pos[1] - 12, 'spark', 4);
        if (s) this.tweens.add({ targets: s, angle: 4, duration: 60, yoyo: true, repeat: 1, onComplete: () => { s.angle = 0; } });
        await new Promise(res => this.time.delayedCall(260, res));
      }
      sfx('boom'); this.camShake(100, .005);
      if (s) await new Promise(res => this.tweens.add({ targets: s, angle: 80, alpha: 0, duration: 420, ease: 'Quad.in', onComplete: res }));
      p.cut = gameHours(); addItem('log', K.log); if (fruit) addItem('apple', 2);
      S.st = S.st || {}; S.st.trees = (S.st.trees || 0) + 1;
      popWorld(pos[0], pos[1] - 24, '+Kayu Gelondong ×' + K.log, 'gold'); updHud(); this.ptreeSync(true);
    } finally { G.lock--; }
  },
});
(() => {
  const W = World.prototype, _use = W.useItem, _up = W.update;
  W.useItem = function (id) { return id && id.startsWith('sapling_') ? this.plantTree(id) : _use.apply(this, arguments); };
  W.update = function () {
    _up.apply(this, arguments);
    if (this.M && !this.M.indoor && this.pl && S && (!G.scene || G.scene === this)) try { this.ptreeSync(false); } catch (e) { console.warn('tree_farm', e); }
  };
})();
