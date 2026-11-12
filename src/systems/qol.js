'use strict';
// Kenyamanan (gelombang 1 docs/PROGRES_FITUR.md): ikon interaksi (#851–852), jeda otomatis (#877), bilah HP musuh (#904),
// rincian naik level (#888), coba lagi sebelum boss (#180)
Object.assign(World.prototype, {
  // ikon kecil di atas benda/NPC yang bisa disentuh, plus label tombol aksi berubah
  updInteractHint() {
    if (!this.iHint) { this.iHint = this.add.text(0, 0, '', { fontFamily: 'sans-serif', fontSize: '12px', stroke: '#2a1c14', strokeThickness: 3, color: '#fff3c0' }).setOrigin(.5, 1).setDepth(1.98e5); this.iHintT = 0; }
    this.iHintT -= this.dt || .016; if (this.iHintT > 0) return; this.iHintT = .12;
    const f = this.front(11); let best = null, bd = 1e9;
    if (!G.lock && !this.pl.dead) for (const it of this.inter) {
      if (it.rect) { const [rx, ry, rw, rh] = it.rect; if (f.x > rx && f.x < rx + rw && f.y > ry && f.y < ry + rh) { best = it; bd = 0; } continue; }
      const x = it.npc ? it.npc.spr.x : it.x, y = it.npc ? it.npc.spr.y - 3 : it.y, d = Math.hypot(x - f.x, y - f.y); if (d < it.r + 6 && d < bd) { bd = d; best = it; }
    }
    const btn = document.getElementById('bA');
    if (!best) { this.iHint.setVisible(false); if (btn && btn.dataset.ctx) { btn.innerHTML = '⚔<small>SERANG</small>'; delete btn.dataset.ctx; } return; }
    const npc = best.npc, src = String(best.fn), kind = npc ? 'bicara' : /openChest/.test(src) ? 'buka' : /enterRoom|goto/.test(src) ? 'masuk' : /Lore|text|readLore/.test(src) ? 'baca' : /harvest|fish|garden|pick/i.test(src) ? 'ambil' : 'periksa';
    const icon = { bicara: '💬', buka: '🗝', masuk: '🚪', baca: '📜', ambil: '✋', periksa: '❕' }[kind];
    const x = npc ? npc.spr.x : best.rect ? best.rect[0] + best.rect[2] / 2 : best.x, y = npc ? npc.spr.y - 34 : (best.rect ? best.rect[1] : best.y - 18);
    this.iHint.setText(icon).setPosition(x, y + Math.sin(this.t * 5) * 1.5).setVisible(true);
    if (btn && btn.dataset.ctx !== kind) { btn.dataset.ctx = kind; btn.innerHTML = icon + '<small>' + kind.toUpperCase() + '</small>'; }
  },
  // bilah HP kecil di atas musuh yang sudah terluka (bukan boss; boss punya bilah sendiri)
  updEnemyBars() {
    if (!this.eBar) this.eBar = this.add.graphics().setDepth(1.97e5);
    const g = this.eBar; g.clear(); if (!OPT.hpbar) return;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.boss || e.hp >= e.max || !e.spr.visible) continue;
      const s = e.spr, w = 18, x = Math.round(s.x - w / 2), y = Math.round(s.y - s.displayHeight - 6), p = Math.max(0, e.hp / e.max);
      g.fillStyle(0x1a1420, .8).fillRect(x - 1, y - 1, w + 2, 4); g.fillStyle(p > .5 ? 0x6ad04a : p > .25 ? 0xf0c040 : 0xe84a3a, 1).fillRect(x, y, Math.ceil(w * p), 2);
    }
  },
  // coba lagi tepat sebelum boss (#180): dipanggil dari defeat() bila kalah saat melawan boss
  async retryBoss() {
    const r = await choose({ head: 'Kamu tumbang...', x: 60, y: 120, w: 180, cancel: false, items: [{ t: 'Coba lagi dari depan arena' }, { t: 'Bangun di penginapan' }] });
    return r === 0;
  },
});
// rincian naik level (#888)
function levelUpDetail(oldLv) {
  const lv = S.lv; S.lv = oldLv; const a = stat(); S.lv = lv; const b = stat();
  const rows = [['HP Maks', 'maxhp'], ['MP Maks', 'maxmp'], ['Serang', 'atk'], ['Tahan', 'def'], ['Sihir', 'mag']].filter(([, k]) => b[k] !== a[k]).map(([n, k]) => `${n} ${a[k]} → <b>${b[k]}</b> <span style="color:#7ad05a">+${b[k] - a[k]}</span>`);
  const w = win('menu lvpop', `<div class="mh">LEVEL ${lv}!</div>` + rows.map(r => `<div class="qr">${r}</div>`).join(''));
  Object.assign(w.style, { left: '50%', top: '30%', transform: 'translateX(-50%)', minWidth: '170px', pointerEvents: 'none' });
  setTimeout(() => { w.style.transition = 'opacity .5s'; w.style.opacity = 0; setTimeout(() => w.remove(), 600); }, 2600);
}
// jeda otomatis saat aplikasi/tab disembunyikan (#877)
document.addEventListener('visibilitychange', () => {
  const g = window.__game && window.__game.sc; if (!g || !g.scene) return;
  try { if (document.hidden) { g.scene.pause(); if (AU.ctx) AU.ctx.suspend(); if (!G.title) saveGame(g); } else { g.scene.resume(); if (AU.ctx) AU.ctx.resume(); } } catch (_) { }
});
// ---------------- TUTORIAL BERTAHAP (#73) ----------------
// Tips muncul sekali saat situasinya terjadi (bukan rentetan di awal). Bisa dimatikan di Pengaturan.
const TIPS = [
  { id: 'gerak', when: sc => S.stage === 0, txt: 'Geser <b>joystick kiri</b> (atau WASD/panah) untuk berjalan.' },
  { id: 'bicara', when: sc => sc.iHint && sc.iHint.visible && sc.iHint.text === '💬', txt: 'Tombol aksi berubah jadi <b>BICARA</b> saat dekat orang. Tekan untuk berbicara.' },
  { id: 'misi', when: sc => S.stage >= 1, txt: 'Kartu <b>★ MISI</b> di kanan atas menunjukkan tujuan. Ikuti <b>panah kuning</b> di tepi layar. Ketuk kartunya untuk Jurnal.' },
  { id: 'serang', when: sc => sc.enemies.some(e => e.hp > 0 && Math.hypot(e.spr.x - sc.pl.x, e.spr.y - sc.pl.y) < 150), txt: 'Ada monster! Tekan <b>⚔ SERANG</b>. Jaga jarak dan pukul saat ia lengah.' },
  { id: 'sihir', when: sc => S.learn && S.learn.fire, txt: 'Ketuk <b>SIHIR</b> untuk bola api. <b>Tarik</b> tombolnya untuk membidik sendiri.' },
  { id: 'obat', when: sc => S.hp < stat().maxhp * .45, txt: 'HP menipis! Tekan <b>♥ OBAT</b> untuk minum ramuan.' },
  { id: 'tas', when: sc => Object.keys(S.inv).length > 6, txt: 'Barangmu bertambah. Buka <b>TAS</b> untuk memakai perlengkapan dan melihat bahan.' },
  { id: 'peta', when: sc => Object.keys(S.seen || {}).length >= 2, txt: 'Buka <b>PETA</b> untuk melihat wilayah, jalan keluar, dan tujuan misi.' },
  { id: 'simpan', when: sc => sc.t > 120, txt: 'Permainan <b>tersimpan otomatis</b> (ikon 💾). Kamu juga bisa menyimpan di MENU.' },
];
function showTip(html) {
  let e = document.getElementById('tip'); if (e) e.remove();
  e = document.createElement('div'); e.id = 'tip'; e.innerHTML = '💡 ' + html + '<small>ketuk untuk tutup</small>'; UI.appendChild(e);
  const close = () => { e.classList.add('off'); setTimeout(() => e.remove(), 300); }; e.onpointerdown = ev => { ev.stopPropagation(); close(); }; setTimeout(close, 7000);
}
Object.assign(World.prototype, {
  updTips(dt) {
    if (G.title || G.lock || !OPT.tips || !S.tipsDone || S.tipsDone.all || this.M.indoor && S.stage > 0) return;
    this.tipT = (this.tipT || 2) - dt; if (this.tipT > 0) return; this.tipT = 1;
    if (document.getElementById('tip')) return;
    const T = TIPS.find(t => !S.tipsDone[t.id] && t.when(this)); if (!T) return;
    S.tipsDone[T.id] = 1; showTip(T.txt); this.tipT = 9;
  },
  // ---------------- PETA MINI (#82) ----------------
  updMinimap(dt) {
    const M = this.M; let c = document.getElementById('mini');
    if (!OPT.mini || G.title || M.indoor) { if (c) c.style.display = 'none'; return; }
    if (!c) { c = document.createElement('canvas'); c.id = 'mini'; c.width = 96; c.height = 96; UI.appendChild(c); c.onpointerdown = ev => { ev.stopPropagation(); if (!G.lock) openMap(this); }; }
    c.style.display = '';
    this.miniT = (this.miniT || 0) - dt; if (this.miniT > 0) return; this.miniT = .25;
    const W = 96, k = W / Math.max(M.w, M.h), ox = (W - M.w * k) / 2, oy = (W - M.h * k) / 2, x = c.getContext('2d');
    if (this.miniFor !== M.id) { // lapisan diam: tanah, jalan, air, tembok, pintu keluar
      this.miniFor = M.id; const b = document.createElement('canvas'); b.width = b.height = W; const y = b.getContext('2d');
      y.fillStyle = M.ground === 'snow' ? '#dfe8f0' : M.ground === 'cave' ? '#4a4458' : M.ground === 'swamp' ? '#4e6a48' : '#6a9a4e'; y.fillRect(ox, oy, M.w * k, M.h * k);
      y.strokeStyle = M.ground === 'village' ? '#d8cdb8' : '#c8a870'; y.lineCap = 'round';
      for (const [x1, y1, x2, y2, w] of M.paths || []) { y.lineWidth = Math.max(1.5, (w || 12) * k * 1.4); y.beginPath(); y.moveTo(ox + x1 * k, oy + y1 * k); y.lineTo(ox + x2 * k, oy + y2 * k); y.stroke(); }
      y.fillStyle = '#4aa6e0'; for (const [px, py, rx, ry] of M.ponds || []) { y.beginPath(); y.ellipse(ox + px * k, oy + py * k, rx * k, ry * k, 0, 0, 7); y.fill(); }
      y.fillStyle = 'rgba(30,24,40,.55)'; for (const [wx, wy, ww, wh] of M.walls || []) y.fillRect(ox + wx * k, oy + wy * k, Math.max(1, ww * k), Math.max(1, wh * k));
      y.fillStyle = '#ffd84a'; for (const e of M.exits || []) y.fillRect(ox + e.x * k - 1, oy + e.y * k - 1, Math.max(3, e.w * k), Math.max(3, e.h * k));
      this.miniBase = b;
    }
    x.clearRect(0, 0, W, W); x.drawImage(this.miniBase, 0, 0);
    x.fillStyle = '#fff3c0'; for (const n of this.npcs) if (n.spr.visible) x.fillRect(ox + n.spr.x * k - 1, oy + n.spr.y * k - 1, 2, 2);
    x.fillStyle = '#e84a3a'; for (const e of this.enemies) if (e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 260) x.fillRect(ox + e.spr.x * k - 1, oy + e.spr.y * k - 1, 2, 2);
    const q = this.qGoal; if (q) { x.fillStyle = '#ffd84a'; x.font = '9px sans-serif'; x.fillText('★', ox + q.x * k - 4, oy + q.y * k + 3); }
    const px = ox + this.pl.x * k, py = oy + this.pl.y * k; x.fillStyle = '#ffffff'; x.strokeStyle = '#2a1c14'; x.lineWidth = 1.5; x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fill(); x.stroke();
  },
});
// ukuran & transparansi tombol layar (#74 sebagian)
function applyPadOpt() { const r = document.documentElement.style; r.setProperty('--bs', [.85, 1, 1.15, 1.3][OPT.btnSize != null ? OPT.btnSize : 1]); r.setProperty('--ba', [1, .75, .5][OPT.btnAlpha || 0]); }
applyPadOpt();
// simpan saat halaman ditutup/dimuat ulang (#910)
window.addEventListener('pagehide', () => { const g = window.__game && window.__game.sc; if (g && !G.title && g.pl && !g.pl.dead) saveGame(g); });
