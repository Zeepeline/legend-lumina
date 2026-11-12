'use strict';
// Gelombang 11: hemat baterai (#99), tangkis (#3), kelemahan elemen (#5), kunci target (#6),
// warna kelangkaan (#37), notifikasi barang (#81), ukuran huruf (#76). Urutkan tas (#35) di ui/bag.js
// ---- elemen musuh ----
const ELEM = { slimei: 'ice', wolfs: 'ice', golemi: 'ice', kryos: 'ice', slimef: 'fire', salam: 'fire', plant: 'nature', shroom: 'nature', ghost: 'spirit', wisp: 'spirit' };
const WEAK = { ice: { fire: 1.7, ice: .5 }, fire: { ice: 1.7, fire: .5 }, nature: { fire: 1.5 }, spirit: { holy: 1.8 } };
const ELEM_COL = { fire: '#ff8a3a', ice: '#8ad8ff', holy: '#ffe88a' };
const _hitEnemy = World.prototype.hitEnemy;
World.prototype.hitEnemy = function (e, base, crit, nx, ny) {
  const el = this.curElem || (this._inShots && this._curShot && this._curShot.kind === 'fire' ? 'fire' : null), k = el && WEAK[ELEM[e.type]] ? WEAK[ELEM[e.type]][el] || 1 : 1;
  if (this.pl.parryCrit > 0 && !el) { crit = true; this.pl.parryCrit = 0; }
  if (k !== 1 && e.hp > 0) {
    const weakLabel = OPT.colorblind ? (k > 1 ? '[LEMAH!]' : '[KEBAL]') : (k > 1 ? 'LEMAH!' : 'tahan');
    popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 14, weakLabel, k > 1 ? (OPT.colorblind ? '#00e5ff' : ELEM_COL[el] || '#ffe66b') : '#a8a8b8');
  }
  return _hitEnemy.call(this, e, base * k, crit, nx, ny);
};
// sumber elemen: bola api = api (proyektil ditandai _curShot di updShots), nova = es, bom = api
const _updShots = World.prototype.updShots;
World.prototype.updShots = function (dt, locked) { this._inShots = true; try { return _updShots.call(this, dt, locked); } finally { this._inShots = false; this._curShot = null; } };
// nova es
const _nova = World.prototype.nova;
World.prototype.nova = function () { this.curElem = 'ice'; try { return _nova.apply(this, arguments); } finally { this.time.delayedCall(400, () => { this.curElem = null; }); } };
const _useTool = World.prototype.useTool;
World.prototype.useTool = function (id) { if (ITEMS[id].tool === 'bomb') this.time.delayedCall(600, () => { this.curElem = 'fire'; this.time.delayedCall(200, () => { this.curElem = null; }); }); return _useTool.call(this, id); };
// ---- tangkis: serang tepat sebelum terkena pukulan jarak dekat ----
const PARRY_WIN = .18;
const _attack = World.prototype.attack;
World.prototype.attack = function () { if (this.pl.atkCd <= 0) this.pl.swingT = this.t; return _attack.apply(this, arguments); };
const _hurtPlayer = World.prototype.hurtPlayer;
World.prototype.hurtPlayer = function (atk, sx, sy, fx) {
  const pl = this.pl;
  if (pl.swingT != null && this.t - pl.swingT < PARRY_WIN && pl.inv <= 0 && !pl.dead && !G.lock) {
    const e = this.enemies.filter(e => e.hp > 0 && !e.boss).sort((a, b) => Math.hypot(a.spr.x - sx, a.spr.y - sy) - Math.hypot(b.spr.x - sx, b.spr.y - sy))[0];
    if (e && Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) < 60) {
      pl.swingT = null; pl.inv = .4; pl.parryCrit = 1.5; S.parries = (S.parries || 0) + 1;
      e.kb = .2; const n = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) || 1; e.kbx = (e.spr.x - pl.x) / n * 200; e.kby = (e.spr.y - pl.y) / n * 200; e.st = 'rec'; e.t = 1;
      if (e.D && e.D.ai === 'fly') {
        // Jatuhkan musuh terbang saat ditangkis waktu menukik (#7)
        this.freezeEnemy(e, 2);
        popWorld(e.spr.x, e.spr.y - 20, 'JATUH TERSUNGKUR!', 'crit');
      }
      sfx('crit'); this.hitStop(.12, 30); this.sparkle((pl.x + e.spr.x) / 2, (pl.y + e.spr.y) / 2 - 10, 'doto', 10); popWorld(pl.x, pl.y - 34, 'TANGKIS!', 'crit'); return;
    }
  }
  return _hurtPlayer.apply(this, arguments);
};
// ---- kunci target: ketuk musuh di layar (atau tombol T) ----
Object.assign(World.prototype, {
  initLock() {
    this.lockE = null; if (this.lockR) this.lockR.destroy();
    this.lockR = this.add.graphics().setDepth(9500).setVisible(false);
    if (!this._lockIn) { this._lockIn = 1; this.input.on('pointerdown', p => { if (G.lock || G.title) return; const w = this.cameras.main.getWorldPoint(p.x, p.y); const e = this.enemies.filter(e => e.hp > 0).find(e => Math.hypot(e.spr.x - w.x, e.spr.y - e.spr.displayHeight / 2 - w.y) < 18); if (e) this.setLock(e === this.lockE ? null : e); }); }
  },
  setLock(e) { this.lockE = e; sfx(e ? 'cur' : 'back'); if (e) popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 8, 'terkunci', 'xp'); },
  cycleLock() { const L = this.enemies.filter(e => e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 200).sort((a, b) => Math.hypot(a.spr.x - this.pl.x, a.spr.y - this.pl.y) - Math.hypot(b.spr.x - this.pl.x, b.spr.y - this.pl.y)); if (!L.length) return this.setLock(null); const i = L.indexOf(this.lockE); this.setLock(i === L.length - 1 ? null : L[i + 1]); },
  updLock() {
    const e = this.lockE, g = this.lockR; if (!g) return;
    if (!e || e.hp <= 0 || !e.spr.active || Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) > 260) { if (e) this.lockE = null; g.setVisible(false); return; }
    const r = 9 + Math.sin(this.t * 6) * 1.5, x = e.spr.x, y = e.spr.y - e.spr.displayHeight / 2;
    g.clear().setVisible(true).lineStyle(1.5, 0xff5a3a, .95); for (let i = 0; i < 4; i++) { const a = i * Math.PI / 2 + this.t; g.beginPath(); g.arc(x, y, r, a, a + .9); g.strokePath(); }
  },
});
const _aim = World.prototype.aimAngle;
World.prototype.aimAngle = function () { const e = this.lockE; if (e && e.hp > 0 && Input.castAng == null) { const pl = this.pl; return Math.atan2(e.spr.y - e.D.r * e.sc * .6 - (pl.y - 6), e.spr.x - pl.x); } return _aim.call(this); };
// ---- kelangkaan barang ----
const RARE_N = ['', 'Langka', 'Epik', 'Legendaris'];
function rarity(id) { const it = ITEMS[id] || {}; if (/^leg_/.test(id) || ['csword', 'aurelring', 'cshield', 'fspear'].includes(id)) return 3; const v = it.price || (it.sell || 0) * 2; return v >= 90 ? 2 : v >= 35 ? 1 : 0; }
// ---- notifikasi barang bertumpuk ----
const TOAST = {};
function toastItem(id, n) {
  if (G.title || !ITEMS[id] || n <= 0) return; let box = document.getElementById('toasts'); if (!box) { box = document.createElement('div'); box.id = 'toasts'; UI.appendChild(box); }
  const t = TOAST[id]; if (t && t.e.isConnected) { t.n += n; t.e.querySelector('b').textContent = '+' + t.n; clearTimeout(t.tm); t.tm = setTimeout(() => t.e.remove(), 2200); return; }
  const e = document.createElement('div'); e.className = 'toast r' + rarity(id); e.innerHTML = `${icon(id)}<span>${ITEMS[id].n}</span><b>+${n}</b>`; box.appendChild(e);
  while (box.children.length > 4) box.firstChild.remove();
  TOAST[id] = { e, n, tm: setTimeout(() => e.remove(), 2200) };
}
const _addItem = addItem;
addItem = function (id, n = 1) { _addItem(id, n); if (n > 0) { (S.got = S.got || {})[id] = Date.now(); if (OPT.toast !== false) toastItem(id, n); } };
// ---- ukuran huruf & hemat baterai ----
function applyFont() { document.documentElement.style.setProperty('--fz', [.9, 1, 1.15, 1.3][OPT.font != null ? OPT.font : 1]); }
function applyLite() { const g = window.__game && window.__game.game; const L = g && g.loop; if (L) { L.fpsLimit = OPT.lite ? 30 : 0; L._limitRate = OPT.lite ? 1000 / 30 : 0; } }

// Filter Efek Layar Opsional (#93): [0: Standar, 1: Hangat Nostalgia, 2: Vinyet Bioskop, 3: Retro CRT]
function applyScreenFilter() {
  let f = document.getElementById('screen-filter-overlay');
  if (!f) {
    f = document.createElement('div');
    f.id = 'screen-filter-overlay';
    Object.assign(f.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: '99999'
    });
    document.body.appendChild(f);
  }
  const mode = OPT.lite ? 0 : (OPT.filter || 0);
  if (mode === 1) { // Hangat
    f.style.background = 'rgba(255, 190, 70, 0.12)';
    f.style.mixBlendMode = 'color-burn';
    f.style.boxShadow = 'none';
  } else if (mode === 2) { // Vinyet
    f.style.background = 'none';
    f.style.boxShadow = 'inset 0 0 70px rgba(0, 0, 0, 0.65)';
  } else if (mode === 3) { // Retro CRT
    f.style.background = 'repeating-linear-gradient(0deg, rgba(0,0,0,0.18), rgba(0,0,0,0.18) 1px, transparent 1px, transparent 2px)';
    f.style.boxShadow = 'inset 0 0 40px rgba(0,0,0,0.4)';
  } else {
    f.style.background = 'none';
    f.style.boxShadow = 'none';
  }
}

applyFont();
applyScreenFilter();
Object.assign(World.prototype, {
  initPolish() { this.initLock(); applyLite(); applyScreenFilter(); if (OPT.lite) { if (this.seaP) this.seaP.setVisible(false); } },
});
