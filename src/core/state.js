'use strict';
// Status pemain (S), simpan/muat, rumus stat
// =====================================================================
//  GAME (Phaser 3): data, status, inventaris, misi, scene dunia
// =====================================================================
const SAVE_KEY = 'legenda_lumina_arpg_v2';
const DIRV = { down: [0, 1], up: [0, -1], left: [-1, 0], right: [1, 0] };
let S = null;
// Pengaturan perangkat (bukan bagian save game): musik/efek 0-4, getar, goyang layar
const OPT_KEY = 'legenda_lumina_opt';
const OPT = Object.assign({ mus: 3, sfx: 3, vib: true, shake: true }, (() => { try { return JSON.parse(localStorage.getItem(OPT_KEY)) || {}; } catch (_) { return {}; } })());
function saveOpt() { try { localStorage.setItem(OPT_KEY, JSON.stringify(OPT)); } catch (_) { } applyOpt(); }
function applyOpt() { if (!AU.ctx) return; AU.music.gain.value = .09 * OPT.mus / 3; AU.sfx.gain.value = .2 * OPT.sfx / 3; AU.master.gain.value = AU.on ? 1 : 0; }
function newState() { return { lv: 1, exp: 0, hp: 42, mp: 14, gold: 20, inv: { potion: 3, ether: 1, wsword: 1, cloth: 1 }, eq: { wpn: 'wsword', arm: 'cloth', acc: null }, stage: 0, side: { patok: 0, mochi: 0, darto: 0, joko: 0 }, flags: {}, seen: { village: 1 }, map: 'village', x: 512, y: 380, dir: 'up', time: 8, day: 1, kills: {}, ach: {}, st: { fish: 0, harvest: 0 }, garden: [null, null], pet: false, warps: { village: 1 }, up: {}, buff: {}, lore: {}, learn: {}, mast: {}, spell: null }; }
function eqv(k) {
  let v = 0;
  for (const s of ['wpn', 'arm', 'acc']) { const id = S.eq[s], it = ITEMS[id]; if (!it) continue; if (it[k]) v += it[k]; const u = (S.up && S.up[id]) || 0; if (u && s === 'wpn' && k === 'atk') v += UPG.wpn * u; if (u && s === 'arm' && k === 'def') v += UPG.arm * u; }
  return v;
}
// Upgrade perlengkapan (+1..+5) di Pak Besi: tambahan per tingkat
const UPG = { wpn: 3, arm: 2, max: 5 };
const itemName = id => ITEMS[id].n + ((S.up && S.up[id]) ? ' +' + S.up[id] : '');
// Bonus masakan aktif (S.buff[jenis] = sisa detik)
const BUFF = { atk: { n: 'Kuat', ic: '⚔', mul: 1.2 }, def: { n: 'Kebal', ic: '🛡', mul: 1.25 }, warm: { n: 'Hangat', ic: '♨' } };
const buffOn = k => S.buff && S.buff[k] > 0;
function stat() { const l = S.lv; return { maxhp: 34 + l * 8, maxmp: 12 + l * 2, atk: Math.round((6 + l * 2 + eqv('atk')) * (buffOn('atk') ? BUFF.atk.mul : 1)), def: Math.round((1 + l + eqv('def')) * (buffOn('def') ? BUFF.def.mul : 1)), mag: 9 + l * 3 + eqv('mag'), spd: 1 + eqv('spd'), regen: eqv('regen') }; }
function need(lv) { return 12 * lv + 6 * (lv - 1) * (lv - 1); }
const has = (id, n = 1) => (S.inv[id] || 0) >= n;
function addItem(id, n = 1) { S.inv[id] = (S.inv[id] || 0) + n; if (S.inv[id] <= 0) delete S.inv[id]; }
function hasSave() { try { return !!localStorage.getItem(SAVE_KEY); } catch (_) { return false; } }
function saveGame(sc) { try { if (sc && sc.pl) { S.x = Math.round(sc.pl.x); S.y = Math.round(sc.pl.y); S.dir = sc.pl.dir; S.map = sc.M.id; } localStorage.setItem(SAVE_KEY, JSON.stringify(S)); return true; } catch (_) { return false; } }
function loadSave() { try { const s = JSON.parse(localStorage.getItem(SAVE_KEY)); if (s && s.lv) { S = Object.assign(newState(), s); if (!MAPS[S.map]) S.map = 'village'; if (!s.learn) { if (S.stage >= 1 || S.lv > 1) S.learn.fire = 1; if (S.lv >= 2) S.learn.dash = 1; if (S.lv >= 3) S.learn.spin = 1; if (S.lv >= 5) S.learn.nova = 1; S.spell = S.learn.fire ? 'fire' : null; } return true; } } catch (_) { } return false; }
