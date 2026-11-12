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
