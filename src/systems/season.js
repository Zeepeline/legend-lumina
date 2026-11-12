'use strict';
// Gelombang 10: kalender (#701), nama hari (#702), libur toko (#703), jam toko (#704),
// 4 musim (#49, #714–717) yang mengubah warna dunia (#718), partikel, kebun, ikan, dan monster
const DAYS = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const SEASONS = [
  { id: 'semi', n: 'Musim Semi', ic: '🌸', tint: 0xffe0f0, a: .06, part: { col: [0xffb8d8, 0xfff0f6], n: 1 }, d: 'Bunga mekar, benih tumbuh lebih cepat.' },
  { id: 'panas', n: 'Musim Panas', ic: '☀', tint: 0xfff0b0, a: .07, part: null, d: 'Ikan lebih besar, matahari terik.' },
  { id: 'gugur', n: 'Musim Gugur', ic: '🍂', tint: 0xffa850, a: .2, part: { col: [0xe8782a, 0xd8a030, 0xb8502a], n: 1.4 }, d: 'Daun berguguran, panen lebih melimpah.' },
  { id: 'dingin', n: 'Musim Dingin', ic: '❄', tint: 0xb8d0ff, a: .16, part: { col: [0xffffff, 0xe8f0ff], n: 2, snow: 1 }, d: 'Salju turun, tanaman lambat, monster lebih ganas.' },
];
const SEASON_DAYS = 7, SHOP_OPEN = 8, SHOP_CLOSE = 18;
const dayName = () => DAYS[(S.day || 0) % 7];
const seasonIdx = () => Math.floor((S.day || 0) / SEASON_DAYS) % 4;
const season = () => SEASONS[seasonIdx()];
const dateTxt = () => `${season().ic} ${dayName()}, ${(S.day || 0) % SEASON_DAYS + 1} ${season().n.replace('Musim ', '')} · Th ${Math.floor((S.day || 0) / (SEASON_DAYS * 4)) + 1}`;
// jam dinding: tambah tanggal & musim
const _updClock = updClock; let _dateTxt = '';
updClock = function () { _updClock(); const e = document.getElementById('hDate'); const t = dateTxt(); if (e && t !== _dateTxt) { _dateTxt = t; e.textContent = t; } };
// tanaman: semi lebih cepat, dingin lebih lambat; gugur panen +1
const _plotHours = plotHours;
plotHours = function (p) { const k = { semi: .8, panas: 1, gugur: 1, dingin: 1.6 }[season().id]; return Math.round(_plotHours(p) * k * 10) / 10; };
// ikan: panas lebih besar
const _logFish = logFish;
logFish = function (id, cm) { return _logFish(id, season().id === 'panas' ? Math.round(cm * 1.15) : cm); };
// toko: buka 08–18; bengkel libur hari Minggu
function shopShut(title) {
  const h = S.time;
  if (/Bengkel/i.test(title) && dayName() === 'Minggu') return `Bengkel libur setiap hari Minggu. Datang lagi besok, ya.`;
  if (h < SHOP_OPEN || h >= SHOP_CLOSE) return `Maaf, ${title} sudah tutup. Buka lagi pukul 08.00 sampai 18.00.`;
  return null;
}
function wrapShops() {
  if (wrapShops.done || typeof buyMenu !== 'function') return; wrapShops.done = 1;
  const b = buyMenu; buyMenu = async function (title, list) { const m = OPT.shopHours !== false && shopShut(title); if (m) { sfx('buzz'); return say(m, title); } return b.apply(this, arguments); };
  const u = upgradeMenu; upgradeMenu = async function () { const m = OPT.shopHours !== false && shopShut('Bengkel'); if (m) { sfx('buzz'); return say(m, 'Bengkel'); } return u.apply(this, arguments); };
}
// tidur sampai pagi (penginapan & ranjang rumah)
function sleepToMorning() { if (S.time >= 18) { S.day++; S.time = 7; } else if (S.time < 7) S.time = 7; }
Object.assign(World.prototype, {
  spawnSeason() {
    wrapShops(); const M = this.M; this.seaT = 0;
    if (this.seaOv) this.seaOv.destroy(); this.seaOv = null; if (this.seaW) this.seaW.destroy(); this.seaW = null; if (this.seaP) this.seaP.destroy(); this.seaP = null;
    if (G.title || M.indoor || M.ground === 'cave') return;
    const Z = season();
    if (M.ground !== 'snow') this.seaOv = this.add.rectangle(0, 0, VW, VH, Z.tint, Z.a).setOrigin(0).setScrollFactor(0).setDepth(1.9e5).setBlendMode(Phaser.BlendModes.MULTIPLY);
    if (Z.id === 'dingin' && M.ground !== 'snow') this.seaW = this.add.rectangle(0, 0, VW, VH, 0xffffff, .1).setOrigin(0).setScrollFactor(0).setDepth(1.91e5);
    if (Z.part && M.ground !== 'snow') {
      const v = this.cameras.main;
      this.seaP = this.add.particles(0, 0, 'dot', { x: { min: -20, max: VW + 20 }, y: -10, lifespan: 7000, speedY: Z.part.snow ? { min: 14, max: 26 } : { min: 18, max: 34 }, speedX: { min: -14, max: 6 },
        scale: Z.part.snow ? { min: 1, max: 1.8 } : { min: 1.2, max: 2 }, rotate: { min: 0, max: 360 }, tint: Z.part.col, frequency: 900 / Z.part.n, alpha: { start: .95, end: .6 } }).setScrollFactor(0).setDepth(1.95e5);
    }
    // monster musim dingin lebih ganas (sekali saat peta dimuat)
    if (Z.id === 'dingin') for (const e of this.enemies) if (!e.boss && !e.wintered) { e.wintered = 1; e.D = Object.assign({}, e.D, { atk: Math.round(e.D.atk * 1.12) }); }
  },
  updSeason(dt) {
    this.seaT -= dt; if (this.seaT > 0) return; this.seaT = 2;
    const id = seasonIdx(); if (this.seaFor !== id) { const first = this.seaFor == null; this.seaFor = id; if (!first && !G.title) { this.spawnSeason(); banner(season().n, season().d, true, 2600); sfx('save'); } }
  },
});
