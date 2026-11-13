'use strict';
// Status pemain (S), simpan/muat, rumus stat
// =====================================================================
//  GAME (Phaser 3): data, status, inventaris, misi, scene dunia
// =====================================================================
const SAVE_BASE = 'legenda_lumina_arpg_v2';
const slotKey = i => i ? SAVE_BASE + '_s' + i : SAVE_BASE;
let SAVE_SLOT = (() => { try { return +localStorage.getItem('legenda_lumina_slot') || 0; } catch (_) { return 0; } })();
let SAVE_KEY = slotKey(SAVE_SLOT);
function setSlot(i) { SAVE_SLOT = i; SAVE_KEY = slotKey(i); try { localStorage.setItem('legenda_lumina_slot', i); } catch (_) { } }
// ringkasan slot untuk layar pilih slot (fitur #79)
function slotInfo(i) { const s = readSaveRaw(slotKey(i)); if (!s) return null; const m = MAPS[s.map]; return { lv: s.lv, map: m ? m.name : s.map, gold: s.gold, when: s.savedAt ? new Date(s.savedAt).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '' }; }
const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
let S = null;
// Pengaturan perangkat (bukan bagian save game): musik/efek 0-4, getar, goyang layar
const OPT_KEY = 'legenda_lumina_opt';
// Tingkat kesulitan (fitur #15): pengali kerusakan musuh & HP musuh
const DIFF = [{ n: 'Santai', dmg: .55, hp: .75 }, { n: 'Normal', dmg: 1, hp: 1 }, { n: 'Sulit', dmg: 1.45, hp: 1.35 }];
const GAME_VERSION = '1.29.0';
const OPT = Object.assign({ mus: 3, sfx: 3, vib: true, shake: true, fps: false, diff: 1, txt: 1, hpbar: true, tips: true, mini: true, btnSize: 1, btnAlpha: 0, btnScale: 1, btnPad: 1, steps: true, dynMus: true, font: 1, lite: false, toast: true, colorblind: false, filter: 0 }, (() => { try { return JSON.parse(localStorage.getItem(OPT_KEY)) || {}; } catch (_) { return {}; } })());
function saveOpt() { try { localStorage.setItem(OPT_KEY, JSON.stringify(OPT)); } catch (_) { } applyOpt(); }
function applyOpt() { if (!AU.ctx) return; AU.music.gain.value = .09 * OPT.mus / 3; AU.sfx.gain.value = .2 * OPT.sfx / 3; AU.master.gain.value = AU.on ? 1 : 0; }
function newState() { return { lv: 1, exp: 0, hp: 42, mp: 14, sta: 100, gold: 20, inv: { potion: 3, ether: 1, wsword: 1, cloth: 1 }, eq: { wpn: 'wsword', arm: 'cloth', acc: null, altWpn: null }, stage: 0, side: { patok: 0, mochi: 0, darto: 0, joko: 0 }, flags: {}, seen: { village: 1 }, map: 'village', x: 512, y: 380, dir: 'up', time: 8, day: 1, kills: {}, ach: {}, st: { fish: 0, harvest: 0, kills: 0, bosses: 0, goldEarned: 0, steps: 0, crafted: 0, cooked: 0, mined: 0, barrels: 0, trees: 0, playTime: 0, backstabs: 0 }, garden: [null, null], pet: false, petDog: false, flowerPlots: [null, null], warps: { village: 1 }, up: {}, buff: {}, lore: {}, learn: {}, mast: {}, spell: null, bounties: {}, bountiesDone: {}, fishLog: {}, tipsDone: {}, locked: {}, titles: ['Petualang Pemula'], title: 'Petualang Pemula', boardDay: 0, boardDone: {}, loadouts: [null, null, null], buyback: [], pins: {}, socket: {}, dailyFeats: {}, newItems: {}, mail: [], readMail: {}, spent: { village: 0, city: 0 }, alchemyRecipes: {}, viewpoints: {}, shards: {}, bank: { gold: 0, day: 1 }, records: {}, outfit: 'default', runePillars: {}, homeStyle: { floor: 'wood', wall: 'wood' }, arenaRank: 0, talents: { war: [0, 0, 0], mag: [0, 0, 0], exp: [0, 0, 0] }, bento: [], courierTimer: null, auctionWon: {} }; }
function eqv(k) {
  let v = 0;
  for (const s of ['wpn', 'arm', 'acc']) { const id = S.eq[s], it = ITEMS[id]; if (!it) continue; if (it[k]) v += it[k]; const u = (S.up && S.up[id]) || 0; if (u && s === 'wpn' && k === 'atk') v += UPG.wpn * u; if (u && s === 'arm' && k === 'def') v += UPG.arm * u; }
  return v;
}
// Upgrade perlengkapan (+1..+5) di Pak Besi: tambahan per tingkat
const UPG = { wpn: 3, arm: 2, max: 5 };
const itemName = id => ITEMS[id].n + ((S.up && S.up[id]) ? ' +' + S.up[id] : '');
// Bonus masakan aktif (S.buff[jenis] = sisa detik)
const BUFF = { atk: { n: 'Kuat', ic: '⚔', mul: 1.2 }, def: { n: 'Kebal', ic: '🛡', mul: 1.25 }, warm: { n: 'Hangat', ic: '♨' }, spd: { n: 'Ringan', ic: '🍃', mul: 1.2 }, rested: { n: 'Bugar', ic: '✨', mul: 1.05 } };
const buffOn = k => S.buff && S.buff[k] > 0;
function stat() {
  const l = S.lv;
  const tBonus = (typeof TITLES !== 'undefined' && S.title && TITLES[S.title]) || {};
  const tAtk = tBonus.atk || 0, tDef = tBonus.def || 0, tHp = tBonus.maxhp || 0, tSpd = tBonus.spd || 0;
  // Bonus Set Perlengkapan (#22)
  const sets = typeof activeSets === 'function' ? activeSets() : [];
  let sAtk = 0, sDef = 0, sHp = 0, sSpd = 0, sMag = 0, sRegen = 0;
  for (const set of sets) {
    if (set.atk) sAtk += set.atk;
    if (set.def) sDef += set.def;
    if (set.maxhp) sHp += set.maxhp;
    if (set.spd) sSpd += set.spd;
    if (set.mag) sMag += set.mag;
    if (set.regen) sRegen += set.regen;
  }
  // Bonus Soket Permata Senjata (#23)
  let gemAtk = 0;
  const curWpn = S.eq?.wpn;
  if (curWpn && S.socket && S.socket[curWpn] === 'ore') {
    gemAtk += 3;
  }
  // Bonus Bakat Keahlian Arka (#17)
  const T = S.talents || { war: [0, 0, 0], mag: [0, 0, 0], exp: [0, 0, 0] };
  const talSpd = (T.exp[0] || 0) * 0.06; // Langkah Ringan: +6% / +12% / +18%
  const talMag = (T.mag[1] || 0) * 2;    // Ledakan Mistik: +2 / +4 / +6 Mag
  return {
    maxhp: 34 + l * 8 + tHp + sHp,
    maxmp: 12 + l * 2,
    maxsta: 100 + (T.exp[1] || 0) * 15,
    atk: Math.round((6 + l * 2 + eqv('atk') + tAtk + sAtk + gemAtk) * (buffOn('atk') ? BUFF.atk.mul : 1)),
    def: Math.round((1 + l + eqv('def') + tDef + sDef) * (buffOn('def') ? BUFF.def.mul : 1)),
    mag: 9 + l * 3 + eqv('mag') + sMag + talMag,
    spd: Math.round(((1 + eqv('spd') + tSpd + sSpd + talSpd) * (buffOn('spd') ? BUFF.spd.mul : 1)) * 100) / 100,
    regen: eqv('regen') + sRegen + (T.mag[2] || 0) // Pancaran Jiwa: regen MP
  };
}
function need(lv) { return 12 * lv + 6 * (lv - 1) * (lv - 1); }
const has = (id, n = 1) => (S.inv[id] || 0) >= n;
function addItem(id, n = 1) {
  S.inv[id] = (S.inv[id] || 0) + n;
  if (S.inv[id] <= 0) delete S.inv[id];
  else if (n > 0) {
    // Fitur #375: Tanda Item Baru di Tas
    S.newItems = S.newItems || {};
    S.newItems[id] = true;
  }
}
function hasSave() { return !!readSaveRaw(); }
function saveGame(sc) {
  try {
    if (sc && sc.pl) { S.x = Math.round(sc.pl.x); S.y = Math.round(sc.pl.y); S.dir = sc.pl.dir; S.map = sc.M.id; if (sc.M.benua) benuaLocalize(sc); }
    S.ver = GAME_VERSION; S.savedAt = Date.now(); const data = JSON.stringify(S);
    // cadangan bergilir (fitur #963): simpan salinan lama paling lama tiap 5 menit, maksimal 3
    try { const now = Date.now(), last = +localStorage.getItem(SAVE_KEY + '_bkt') || 0, old = localStorage.getItem(SAVE_KEY);
      if (old && now - last > 300000) { for (let i = 2; i > 0; i--) { const v = localStorage.getItem(SAVE_KEY + '_bk' + (i - 1)); if (v) localStorage.setItem(SAVE_KEY + '_bk' + i, v); } localStorage.setItem(SAVE_KEY + '_bk0', old); localStorage.setItem(SAVE_KEY + '_bkt', now); } } catch (_) { }
    localStorage.setItem(SAVE_KEY, data); return true;
  } catch (_) { return false; }
}
// Pemulihan (fitur #964): bila save utama rusak, pakai cadangan terbaru yang masih utuh
function readSaveRaw(K = SAVE_KEY) {
  for (const k of [K, K + '_bk0', K + '_bk1', K + '_bk2']) { try { const s = JSON.parse(localStorage.getItem(k)); if (s && s.lv) { if (k !== K) console.warn('Save utama rusak, memakai cadangan', k); return s; } } catch (_) { } }
  return null;
}
function loadSave() {
  try {
    const s = readSaveRaw();
    if (s && s.lv) {
      S = Object.assign(newState(), s);
      S.st = Object.assign({ fish: 0, harvest: 0, kills: 0, bosses: 0, goldEarned: 0, steps: 0, crafted: 0, cooked: 0, playTime: 0 }, S.st || {});
      S.locked = S.locked || {};
      S.titles = S.titles || ['Petualang Pemula'];
      S.title = S.title || 'Petualang Pemula';
      S.boardDone = S.boardDone || {};
      S.loadouts = S.loadouts || [null, null, null];
      S.buyback = S.buyback || [];
      S.pins = S.pins || {};
      S.socket = S.socket || {};
      S.dailyFeats = S.dailyFeats || {};
      S.newItems = S.newItems || {};
      S.mail = S.mail || [];
      S.readMail = S.readMail || {};
      S.spent = S.spent || { village: 0, city: 0 };
      S.alchemyRecipes = S.alchemyRecipes || {};
      S.viewpoints = S.viewpoints || {};
      S.shards = S.shards || {};
      if (!S.eq.altWpn) S.eq.altWpn = null;
      if (!MAPS[S.map]) S.map = 'village';
      if (!s.tipsDone && (S.stage > 1 || S.lv > 2)) S.tipsDone = { all: 1 };
      if (!s.learn) {
        if (S.stage >= 1 || S.lv > 1) S.learn.fire = 1;
        if (S.lv >= 2) S.learn.dash = 1;
        if (S.lv >= 3) S.learn.spin = 1;
        if (S.lv >= 5) S.learn.nova = 1;
        S.spell = S.learn.fire ? 'fire' : null;
      }
      return true;
    }
  } catch (_) { }
  return false;
}
if (typeof layout === 'function') layout(); // terapkan skala tombol kustom (#74) setelah OPT siap
