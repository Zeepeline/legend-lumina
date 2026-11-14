'use strict';
// Muat gambar & daftarkan semua tekstur/animasi ke Phaser
// ---------------- TEKSTUR ----------------
const ICONS = {}, IMGEL = {};
// Gambar dari gambar referensi ada di assets/img/<nama>.png → tekstur Phaser 'i_<nama>'
const IMG_LIST = [
  "apple1", "bench", "bigtree", "bushG1", "bushG2", "bushP", "bushP2", "bushW",
  "fountain", "houseA", "houseB", "houseC", "market", "orange1", "planter", "pot",
  "treeA", "treeWoodsPine", "stumpWoods",
  "lampPost", "crateCart", "benchWood", "hero_custom", "mon_slime_hd", "mon_wolf_hd", "mon_wolf_elite_hd", "mon_goblin_hd", "mon_goblin_archer_hd",
  "mon_goblin_shaman",
  "goblin_fortress", "goblin_gate", "goblin_hut", "goblin_tower", "goblin_cage", "goblin_forge", "goblin_shrine",
  "goblin_cauldron", "goblin_totem", "goblin_torch", "goblin_wagon", "goblin_banner"
, 'npc_elder', 'npc_smith', 'npc_merchant', 'npc_farmer', 'npc_inn', 'npc_guard', 'npc_hunter', 'npc_hermit', 'npc_nila', 'npc_joko', 'npc_girl', 'npc_child', 'npc_woman', 'npc_mom', 'npc_ratih', 'npc_wati', 'npc_darma', 'npc_bayu', 'npc_lestari', 'npc_gun', 'npc_priest', 'ani_rabbit', 'ani_squirrel', 'ani_deer', 'ani_owl', 'ani_duck'];
function loadImgs() { return Promise.all(IMG_LIST.map(k => new Promise(r => { const i = new Image(); i.onload = () => { IMGEL[k] = i; r(); }; i.onerror = () => { console.error('Gagal memuat gambar', k); r(); }; i.src = (window.IMG_INLINE && IMG_INLINE[k]) || 'assets/img/' + k + '.png'; }))); }
function addStrip(scene, key, st) { const t = scene.textures.addCanvas(key, st.c); for (let i = 0; i < st.n; i++) t.add(i, 0, i * st.fw, 0, st.fw, st.fh); }
function darkTree(img) { const [c, x] = mk(img.width, img.height); x.drawImage(img, 0, 0); const d = x.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) { if (!d.data[i + 3]) continue; const [h, s, l] = rgb2hsl(d.data[i], d.data[i + 1], d.data[i + 2]); const hx = hsl2hex(hueToward(h, 165, 14), Math.min(1, s * 1.02), l * .78); const [r, g, b] = h2r(hx); d.data[i] = r; d.data[i + 1] = g; d.data[i + 2] = b; } x.putImageData(d, 0, 0); return c; }
// Potret NPC dari aset pemilik (assets/img/npc_<ch>.png, 32×32). Frame dibuat dengan layout yang sama (down/up/side × 4).
const NPC_W = 32, NPC_H = 32;
function regPortrait(T, k) {
  const img = IMGEL['npc_' + k]; const c = document.createElement('canvas'); c.width = NPC_W * 12; c.height = NPC_H; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
  for (let i = 0; i < 12; i++) x.drawImage(img, i * NPC_W, (i % 4 === 1 || i % 4 === 2) ? -1 : 0);
  const t = T.addCanvas('ch_' + k, c); ['down', 'up', 'side'].forEach((d, di) => { for (let f = 0; f < 4; f++) t.add(d + f, 0, (di * 4 + f) * NPC_W, 0, NPC_W, NPC_H); });
}
function regChar(T, k) {
  if (k === 'hero' && IMGEL.hero_custom) {
    const img = IMGEL.hero_custom;
    const t = T.addImage('ch_' + k, img);
    ['down', 'up', 'side'].forEach((d, di) => {
      for (let f = 0; f < 4; f++) t.add(d + f, 0, (di * 4 + f) * CH_FW, 0, CH_FW, CH_FH);
    });
    return;
  }
  if (IMGEL['npc_' + k]) return regPortrait(T, k);
  const st = artChar(CHARS[k][0], CHARS[k][1]);
  const t = T.addCanvas('ch_' + k, st.c);
  ['down', 'up', 'side'].forEach((d, di) => {
    for (let f = 0; f < 4; f++) t.add(d + f, 0, (di * 4 + f) * CH_FW, 0, CH_FW, CH_FH);
  });
}
function buildTextures(sc) {
  const T = sc.textures, one = (k, c) => T.addCanvas(k, c);
  for (const k in IMGEL) {
    if (IMGEL[k]) T.addImage('i_' + k, IMGEL[k]);
  }
  one('treeAd', darkTree(IMGEL.treeA)); one('treeBd', darkTree(IMGEL.treeA));
  one('pear', artFruitTree('pear', 3)); one('round', artRoundTree(4)); one('pine', artPine(5)); one('pined', artPine(6, 1));
  one('bush', artBush(1)); one('bushy', artBush(5, 'yellow')); one('bushv', artBush(4, 'purple'));
  one('barrel', artBarrel()); one('crate', artCrate()); one('sign', artSign()); one('fence', artFence()); one('lamp', artLamp());
  one('board', artBoard()); one('campfire', artCampfire());
  one('rock', artRock(1)); one('log', artLog()); one('stump', artStump()); one('mush', artMushDeco()); one('shrine', artShrine());
  one('chest', artChest(false)); one('chesto', artChest(true)); one('hay', artHay()); one('windmill', artWindmill()); one('blades', artBlades());
  one('cavemouth', artCaveMouth()); one('stalag', artStalag(1)); one('cryst', artCrystals(1)); one('crystp', artCrystals(2, ['#8a3ae0', '#c88aff', '#f4e0ff'])); one('bones', artBones());
  one('anvil', artAnvil()); one('forge', artForge()); addStrip(sc, 'barrier', artBarrier());
  addStrip(sc, 'crystal', artCrystal(false)); addStrip(sc, 'crystal_lit', artCrystal(true));
  CHARS.smith = [{ H: '#3a2a20', C: '#7a5a4a', P: '#4a3a3a', K: '#3a2a20', S: '#e8b48a' }, { apron: 1, beard: 1 }];
  CHARS.gchief = [{ H: '#c83a2a', S: '#6ab84a', C: '#7a5a3a', P: '#4a3a2a', E: '#ff3a2a', r: '#4a983a', R: '#e8c050' }, { ears: 1, scarf: 1 }];
  if (!CHARS.boy) CHARS.boy = CHARS.child;
  for (const k in CHARS) regChar(T, k);
  addStrip(sc, 'slime', artMon('slime')); addStrip(sc, 'slimeb', artMon('slime', { G: '#5aa8f0', D: '#2a5aa8', L: '#e0f4ff' }));
  addStrip(sc, 'slimer', artMon('slime', { G: '#f0604a', D: '#a02a1a', L: '#ffe0d8' })); addStrip(sc, 'slimei', artMon('slime', { G: '#b4ecff', D: '#5aa8d8', L: '#ffffff', E: '#1a3a6a' }));
  addStrip(sc, 'bat', artMon('bat')); addStrip(sc, 'batc', artMon('bat', { W: '#4a3a6a', B: '#2a1a3a', E: '#ff4a6a' })); addStrip(sc, 'shroom', artMon('shroom'));
  addStrip(sc, 'squeen', artMon('shroom', { R: '#a050e8', W: '#ffe0ff', S: '#f4e4cc' }));
  for (const m of ['wolf', 'boar', 'bee', 'snake', 'plant', 'ghost', 'golem']) addStrip(sc, m, artMon(m));
  addStrip(sc, 'cat0', artMon('cat')); addStrip(sc, 'cat1', artMon('cat', { G: '#f0a050', W: '#fff0dc' })); addStrip(sc, 'fox0', artMon('fox')); addStrip(sc, 'cat2', artMon('cat', { G: '#f4f0f8', W: '#ffffff' }));
  addStrip(sc, 'chick0', artMon('chicken', { W: '#ffffff', B: '#e2d8c4', R: '#e83a3a' }));
  addStrip(sc, 'chick1', artMon('chicken', { W: '#d83a2a', B: '#8a1a14', R: '#ffd23a' }));
  addStrip(sc, 'chick2', artMon('chicken', { W: '#e8c040', B: '#9a7018', R: '#e83a3a' }));
  addStrip(sc, 'duck0', artMon('duck', { G: '#227838', B: '#8a5a32', D: '#4a2c14' }));
  addStrip(sc, 'duck1', artMon('duck', { G: '#f0e8d0', B: '#d8ccb0', D: '#9a8c70', Y: '#ff9a14' }));
  one('sword0', artSword(false)); one('sword1', artSword(true)); one('wspear', artSpear()); one('waxe', artAxe()); one('wbow', artBow()); one('arrow', artArrow());
  addStrip(sc, 'slash', artSlash()); addStrip(sc, 'fire', artFire()); one('spore', artSpore()); one('seed', artSeed()); one('bone', artBone()); one('rockshot', artRockShot());
  one('venom', (() => { const [c, x] = mk(8, 8); ellF(x, '#b44ae0', 4, 4, 3, 3); px(x, '#f0c0ff', 3, 3); return outline(c); })());
  addStrip(sc, 'coin', artCoin()); one('potion', artPotion());
  one('dot', artDot('#ffffff', 1)); one('dotg', artDot('#bff09a', 1)); one('doto', artDot('#ffb04a', 1)); one('smoke', artSmoke()); one('spark', artSpark());
  one('leaf', (() => { const [c, x] = mk(5, 4); fr(x, '#85e07a', 1, 0, 3, 3); fr(x, '#44805f', 0, 2, 2, 2); return c; })());
  one('petal', (() => { const [c, x] = mk(4, 3); fr(x, '#ffc4e0', 0, 0, 3, 2); fr(x, '#ff9ac8', 1, 1, 3, 2); return c; })());
  addStrip(sc, 'fly', artButterfly()); addStrip(sc, 'fly2', (() => { const s = artButterfly(); const x = s.c.getContext('2d'); x.globalCompositeOperation = 'source-atop'; x.fillStyle = 'rgba(120,200,255,.75)'; x.fillRect(0, 0, s.c.width, s.c.height); return s; })());
  one('shadow', artShadowSoft(16, 6)); one('shadowb', artShadowSoft(34, 11)); one('fog', artFog()); one('rain', artRain()); one('glider', artGlider()); addStrip(sc, 'ripple', artRipple()); one('sprout', artSprout(0)); one('ripe', artSprout(1));
  addStrip(sc, 'wolfs', artMon('wolf', { G: '#e4ecf8', D: '#9aaecb', W: '#ffffff', E: '#4ad0ff', K: '#4a5a7a' })); addStrip(sc, 'slimef', artMon('slime', { G: '#ff8a3a', D: '#c0401a', L: '#fff0a0', E: '#3a1000' }));
  addStrip(sc, 'salam', artMon('snake', { G: '#e8642a', L: '#ffd060', E: '#2a0a00', R: '#ffe83a' })); addStrip(sc, 'golemi', artMon('golem', { R: '#a8cce6', D: '#6a8eb6', L: '#e2f4ff', E: '#ffffff', M: '#f4fbff', C: '#3a506e' }));
  addStrip(sc, 'snakei', artMon('snake', { G: '#9ad4f4', L: '#f0faff', E: '#1a2a5a', R: '#4a8aff' }));
  addStrip(sc, 'wisp', artWisp()); addStrip(sc, 'frog', artMon('frog')); addStrip(sc, 'slimep', artMon('slime', { G: '#a060d0', D: '#5a2a8a', L: '#f0d8ff' }));
  one('gate', artGate()); one('boulder', artBoulder()); one('plate', artPlate());
  one('treeSw', (() => { const c = darkTree(IMGEL.treeA), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height); for (let i = 0; i < d.data.length; i += 4) { if (!d.data[i + 3]) continue; const [h, s2, l] = rgb2hsl(d.data[i], d.data[i + 1], d.data[i + 2]); const [r, g, b] = h2r(hsl2hex(hueToward(h, 90, 30), s2 * .7, l * .95)); d.data[i] = r; d.data[i + 1] = g; d.data[i + 2] = b; } x.putImageData(d, 0, 0); return c; })()); one('treeSn', (() => { const c = darkTree(IMGEL.treeA), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), H = c.height; for (let i = 0; i < d.data.length; i += 4) { if (!d.data[i + 3]) continue; const yy = Math.floor(i / 4 / c.width) / H; const [h, s2, l] = rgb2hsl(d.data[i], d.data[i + 1], d.data[i + 2]); if (h > 50 && h < 170) { const k = yy < .25 ? .75 : yy < .55 ? .5 : .3; const [r, g, b] = h2r(hsl2hex(hueToward(h, 200, 60), s2 * .35, l + (1 - l) * k)); d.data[i] = r; d.data[i + 1] = g; d.data[i + 2] = b; } } x.putImageData(d, 0, 0); return c; })()); one('brazier', artBrazier()); one('bramble', artBramble()); one('bell', artBell()); one('bloom', artBloom()); one('dummy', artDummy()); one('pebbles', artPebbles()); one('telescope', artTelescope()); one('altar', artShrineAltar()); one('fieldoven', artFieldOven()); one('dripstone', artDripStalactite()); one('frostflower', artFrostFlower()); one('totem', artSwampTotem()); one('pigeons', artPigeonsSpot()); one('teatable', artTeaTable()); one('lotuspad', artLotusPondSpot()); one('dockboat', artDockBoat()); one('coffeeshrub', artCoffeeShrub()); one('coffeekettle', artCoffeeKettle()); one('orchidrock', artOrchidRock()); one('canaryperch', artCanaryPerch()); one('woodlandshrine', artWoodlandShrine()); one('bellows', artBellows()); one('ringbooth', artRingBooth()); one('archerytarget', artArcheryTarget()); one('lakelighthouse', artLakeLighthouse()); one('streetdrum', artStreetDrum()); one('warp0', artWarp(false)); one('stele', artStele()); artCritters(T); artQuestArrow(T); one('root', artRoot()); one('gatehouse', artGatehouse()); one('cwall', artCityWall()); one('academy', artAcademy()); one('boat', artBoat()); one('relief', artRelief()); one('sealdoor0', artSealDoor(false)); one('sealdoor1', artSealDoor(true)); one('warp1', artWarp(true)); one('icegate', artIceGate()); one('icebolt', artIceBolt());
  one('light', artLight(80)); one('lights', artLight(36)); one('nlL', artLightP(54, .9)); one('nlS', artLightP(38, .85)); one('nlW', artLightP(18, .75));
  for (const id in ITEMS) { const c = artIcon(ICON_OF[id] && id === 'stonearm' ? 'chain' : id); one('ic_' + id, c); ICONS[id] = c.toDataURL(); }
  const A = sc.anims, fr2 = (k, n) => [...Array(n).keys()].map(i => ({ key: k, frame: i }));
  A.create({ key: 'crystal_lit', frames: fr2('crystal_lit', 4), frameRate: 5, repeat: -1 });
  A.create({ key: 'barrier', frames: fr2('barrier', 3), frameRate: 6, repeat: -1 });
  A.create({ key: 'slash', frames: fr2('slash', 3), frameRate: 26 });
  A.create({ key: 'fire', frames: fr2('fire', 2), frameRate: 10, repeat: -1 });
  A.create({ key: 'coin', frames: fr2('coin', 4), frameRate: 9, repeat: -1 });
  A.create({ key: 'ripple', frames: fr2('ripple', 3), frameRate: 4, repeat: -1 });
  for (const k of ['slime', 'slimeb', 'slimer', 'slimei', 'bat', 'batc', 'shroom', 'squeen', 'cat0', 'cat1', 'cat2', 'fox0', 'wolf', 'boar', 'bee', 'snake', 'plant', 'ghost', 'golem', 'wisp', 'frog', 'slimep', 'wolfs', 'slimef', 'salam', 'golemi', 'snakei', 'chick0', 'chick1', 'chick2', 'duck0', 'duck1'])
    A.create({ key: k + '_mv', frames: fr2(k, 2), frameRate: k === 'bat' || k === 'batc' || k === 'bee' ? 12 : k === 'wolf' || k === 'wolfs' ? 8 : 5, repeat: -1 });
  for (const k of ['fly', 'fly2']) A.create({ key: k, frames: fr2(k, 2), frameRate: 8, repeat: -1 });
  // Daftarkan otomatis objek yang teksturnya belum ada: cari fungsi global art<Nama> yang cocok (tanpa peduli huruf besar), atau alias gambar
  const ALIAS = { i_cart: 'i_crateCart', i_treePine: 'i_treeWoodsPine', i_treeOak: 'i_stumpWoods', i_rockWoods: 'rock' };
  const artFns = Object.keys(window).filter(n => /^art[A-Z]/.test(n) && typeof window[n] === 'function');
  for (const [k, o] of Object.entries(OBJ)) {
    if (T.exists(o.key)) continue;
    const want = ('art' + o.key).toLowerCase(), fn = artFns.find(n => n.toLowerCase() === want) || artFns.find(n => n.toLowerCase() === ('art' + k).toLowerCase());
    try { if (fn) { const c = window[fn](); if (c) { T.addCanvas(o.key, c.c || c); continue; } } } catch (e) { console.warn('Gagal menggambar', o.key, e); }
    const al = ALIAS[o.key]; if (al && T.exists(al)) { T.addImage(o.key, T.get(al).getSourceImage()); continue; }
    console.warn('Objek tanpa tekstur:', k, '→', o.key);
  }
  for (const k in CHARS) for (const d of ['down', 'up', 'side']) A.create({ key: k + '_' + d, frames: [1, 0, 2, 0].map(f => ({ key: 'ch_' + k, frame: d + f })), frameRate: 8, repeat: -1 });
  if (typeof applyGptSwap === 'function') applyGptSwap(T, A);
  if (typeof applyGptMonsters === 'function') applyGptMonsters(sc); /* sprite monster GPT (gfx/gptmonsters.js) */
  if (IMGEL.mon_slime_hd) {
    if (!T.exists('slime_hd')) sc.textures.addSpriteSheet('slime_hd', IMGEL.mon_slime_hd, { frameWidth: 100, frameHeight: 100 });
    const regA = (k, st, ed, fps, r) => {
      if (!A.exists(k)) A.create({ key: k, frames: A.generateFrameNumbers('slime_hd', { start: st, end: ed }), frameRate: fps, repeat: r });
    };
    regA('slime_hd_idle', 0, 5, 7, -1); regA('slime_hd_hop', 7, 13, 11, -1);
    regA('slime_hd_atk', 14, 20, 12, 0); regA('slime_hd_hurt', 21, 23, 10, 0);
    regA('slime_hd_die', 28, 34, 9, 0); regA('slime_hd_mv', 7, 13, 11, -1);
    regA('slime_idle', 0, 5, 7, -1); regA('slime_hop', 7, 13, 11, -1);
    regA('slime_atk', 14, 20, 12, 0); regA('slime_hurt', 21, 23, 10, 0);
    regA('slime_die', 28, 34, 9, 0);
  }
  ICONS.coin = (() => { const s = artCoin(); const [c, x] = mk(10, 10); x.drawImage(s.c, 0, 0); return c.toDataURL(); })();
}
