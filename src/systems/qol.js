'use strict';
// Kenyamanan (gelombang 1 docs/arsip/PROGRES_FITUR.md): ikon interaksi (#851–852), jeda otomatis (#877), bilah HP musuh (#904),
// rincian naik level (#888), coba lagi sebelum boss (#180)
Object.assign(World.prototype, {
  // ikon kecil di atas benda/NPC yang bisa disentuh, plus label tombol aksi berubah
  updInteractHint() {
    if (!this.iHint) {
      this.iHint = this.add.text(0, 0, '', {
        fontFamily: 'sans-serif', fontSize: '11px', stroke: '#2a1c14', strokeThickness: 3, color: '#fff3c0', align: 'center'
      }).setOrigin(.5, 1).setDepth(1.98e5);
      this.iHintT = 0;
    }
    this.iHintT -= this.dt || .016; if (this.iHintT > 0) return; this.iHintT = .12;
    const f = this.front(11); let best = null, bd = 1e9;
    if (!G.lock && !this.pl.dead) for (const it of this.inter) {
      if (it.rect) { const [rx, ry, rw, rh] = it.rect; if (f.x > rx && f.x < rx + rw && f.y > ry && f.y < ry + rh) { best = it; bd = 0; } continue; }
      const x = it.npc ? it.npc.spr.x : it.x, y = it.npc ? it.npc.spr.y - 3 : it.y;
      const d = Math.hypot(x - f.x, y - f.y); if (d < it.r && d < bd) { bd = d; best = it; }
    }
    const btn = document.getElementById('bA');
    if (!best) {
      this.iHint.setVisible(false); if (this.iHintRing) this.iHintRing.clear();
      if (btn && btn.dataset.ctx) { btn.innerHTML = '⚔<small>SERANG</small>'; delete btn.dataset.ctx; } return;
    }
    // T546: Pendar garis luar objek interaktif yang siap disentuh (Cobo #9)
    const npc = best.npc;
    if (!this.iHintRing) this.iHintRing = this.add.graphics().setDepth(1.2);
    const ring = this.iHintRing; ring.clear();
    const ox = npc ? npc.spr.x : (best.rect ? best.rect[0] + best.rect[2] / 2 : best.x);
    const oy = npc ? npc.spr.y : (best.rect ? best.rect[1] + best.rect[3] : best.y);
    const or = Math.max(10, Math.min(22, (best.r || 16) * .7)), pulse = .35 + Math.sin(this.t * 5) * .22;
    ring.lineStyle(1.2, 0xffffff, pulse); ring.strokeEllipse(ox, oy - 2, or * 2, or * 1.2);
    ring.lineStyle(1, 0xffe27a, pulse * .6); ring.strokeEllipse(ox, oy - 2, or * 2.3, or * 1.38);
    const src = String(best.fn), kind = npc ? 'bicara' : /openChest/.test(src) ? 'buka' : /enterRoom|goto/.test(src) ? 'masuk' : /Lore|text|readLore/.test(src) ? 'baca' : /harvest|fish|garden|pick/i.test(src) ? 'ambil' : 'periksa';
    const icon = { bicara: '💬', buka: '🗝', masuk: '🚪', baca: '📜', ambil: '✋', periksa: '❕' }[kind];
    const name = npc ? (npc.n?.name || '') : (best.name || best.label || '');
    const txt = name ? `${icon}\n${name}` : icon;
    const x = npc ? npc.spr.x : best.rect ? best.rect[0] + best.rect[2] / 2 : best.x, y = npc ? npc.spr.y - 34 : (best.rect ? best.rect[1] : best.y - 18);
    this.iHint.setText(txt).setPosition(x, y + Math.sin(this.t * 5) * 1.5).setVisible(true).setScale(1 / (this.M.zoom || 1));
    if (btn && btn.dataset.ctx !== kind) { btn.dataset.ctx = kind; btn.innerHTML = icon + '<small>' + kind.toUpperCase() + '</small>'; }
  },
  // bilah HP kecil di atas musuh yang sudah terluka + delayed drain & penanda kunci target
  updEnemyBars() {
    if (!this.eBar) this.eBar = this.add.graphics().setDepth(1.97e5);
    const g = this.eBar; g.clear();
    const dt = Math.max(0, Math.min(0.1, this.t - (this._ebT || this.t)));
    this._ebT = this.t;
    for (const e of this.enemies) {
      const isSpec = !!(e.elite || e.D?.isBounty || e.type === 'goblin_elite');
      const isLock = this.lockE === e && e.hp > 0 && !e.boss && e.spr && e.spr.visible;
      const show = OPT.hpbar && e.hp > 0 && !e.boss && e.hp < e.max && e.spr && e.spr.visible;
      if (!show) {
        if (e.nameTag) { e.nameTag.destroy(); e.nameTag = null; }
        if (e.stTag) { e.stTag.destroy(); e.stTag = null; }
        if (isLock) {
          const s = e.spr, dy = Math.round(s.y - s.displayHeight - 8 + Math.sin(this.t * 7) * 1.2);
          g.lineStyle(1, 0x1a1420, 1).fillStyle(0xffe66b, 1).fillPoints([
            { x: s.x, y: dy - 4 }, { x: s.x + 3.5, y: dy }, { x: s.x, y: dy + 4 }, { x: s.x - 3.5, y: dy }
          ], true).strokePoints([
            { x: s.x, y: dy - 4 }, { x: s.x + 3.5, y: dy }, { x: s.x, y: dy + 4 }, { x: s.x - 3.5, y: dy }
          ], true);
        }
        continue;
      }
      const s = e.spr, w = isSpec ? 26 : 18, x = Math.round(s.x - w / 2), y = Math.round(s.y - s.displayHeight - 6), p = Math.max(0, e.hp / e.max);
      if (e._hpG == null) e._hpG = p;
      if (p < (e._hpPrev != null ? e._hpPrev : p)) e._hpGT = 0.22;
      e._hpPrev = p;
      if (p > e._hpG) e._hpG = p;
      else if (e._hpGT > 0) e._hpGT -= dt;
      else if (e._hpG > p) e._hpG = Math.max(p, e._hpG - dt * 1.45);
      g.fillStyle(0x16101a, .85).fillRect(x - 1, y - 1, w + 2, 4);
      if (isSpec) g.lineStyle(1, 0xd4a94e, .85).strokeRect(x - 1, y - 1, w + 2, 4);
      if (e._hpG > p) g.fillStyle(0xffe066, 1).fillRect(x, y, Math.ceil(w * e._hpG), 2);
      g.fillStyle(p > .5 ? 0x6ad04a : p > .25 ? 0xf0c040 : 0xe0483a, 1).fillRect(x, y, Math.ceil(w * p), 2);
      if (isSpec) {
        const nm = (e.elite && !e.D?.isBounty ? '★ ' : '') + (e.D?.name || 'Elit');
        if (!e.nameTag) {
          e.nameTag = this.add.text(s.x, y - 2, nm, {
            fontFamily: 'sans-serif', fontSize: '9px', stroke: '#1a1420', strokeThickness: 3, color: '#ffd84a'
          }).setOrigin(.5, 1).setDepth(1.98e5);
        } else {
          e.nameTag.setText(nm).setPosition(s.x, y - 2).setVisible(true);
        }
      } else if (e.nameTag) { e.nameTag.destroy(); e.nameTag = null; }
      if (isLock) {
        const dy = Math.round((isSpec ? y - 15 : y - 5) + Math.sin(this.t * 7) * 1.2);
        const pts = [{ x: s.x, y: dy - 4 }, { x: s.x + 3.5, y: dy }, { x: s.x, y: dy + 4 }, { x: s.x - 3.5, y: dy }];
        g.fillStyle(0xffe66b, 1).fillPoints(pts, true);
        g.lineStyle(1, 0x1a1420, 1).strokePoints(pts, true);
      }
      const stList = [];
      if (e.bleed > 0) stList.push([0xff4252, e.bleedStk || 1]);
      if (e.poison > 0) stList.push([0xc97aff, e.poiStk || 1]);
      if (e.burn > 0) stList.push([0xff8a3a, e.burnStk || 1]);
      if (e.frz > 0) stList.push([0x7ee0ff, 1]);
      if (stList.length) {
        let sx = x + w + 3, mxStk = 0;
        for (const [col, stk] of stList) {
          g.fillStyle(0x16101a, .9).fillRect(sx - 1, y - 1, 5, 5);
          g.fillStyle(col, 1).fillRect(sx, y, 3, 3);
          if (stk > mxStk) mxStk = stk;
          sx += 5;
        }
        if (mxStk >= 2) {
          const tx = x + w + 3 + stList.length * 5, ty = y + 1;
          if (!e.stTag) {
            e.stTag = this.add.text(tx, ty, '' + mxStk, {
              fontFamily: 'sans-serif', fontSize: '8px', stroke: '#16101a', strokeThickness: 2.5, color: '#fff4d0'
            }).setOrigin(0, 0.5).setDepth(1.98e5);
          } else {
            e.stTag.setText('' + mxStk).setPosition(tx, ty).setVisible(true);
          }
        } else if (e.stTag) { e.stTag.destroy(); e.stTag = null; }
      } else if (e.stTag) { e.stTag.destroy(); e.stTag = null; }
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
  const mini = document.getElementById('mini'); if (mini) mini.style.display = 'none';
  const w = win('menu lvpop', `<div class="mh">LEVEL ${lv}!</div>` + rows.map(r => `<div class="qr">${r}</div>`).join(''));
  Object.assign(w.style, { left: '50%', top: '24%', transform: 'translateX(-50%)', minWidth: '140px', maxWidth: '200px', zIndex: '60', pointerEvents: 'none' });
  setTimeout(() => {
    w.style.transition = 'opacity .5s';
    w.style.opacity = 0;
    setTimeout(() => { w.remove(); if (mini && OPT.mini) mini.style.display = ''; }, 600);
  }, 2600);
}
// jeda otomatis saat aplikasi/tab disembunyikan (#877, hemat baterai & daya)
document.addEventListener('visibilitychange', () => {
  try {
    const g = window.__game && window.__game.game;
    if (document.hidden) {
      if (typeof Input !== 'undefined' && Input.held) { Input.held.length = 0; Input.keys = {}; }
      if (AU.tag && !AU.tag.paused) {
        AU.tag._bgPaused = true;
        try { AU.tag.pause(); } catch (_) { }
      }
      if (AU.ctx && AU.ctx.state === 'running') {
        AU._ctxBgPaused = true;
        try { AU.ctx.suspend().catch(() => {}); } catch (_) { }
      }
      if (g && !g.isPaused) {
        g._bgPaused = true;
        try { g.pause(); } catch (_) { }
      }
    } else {
      if (AU.tag && AU.tag._bgPaused) {
        AU.tag._bgPaused = false;
        try { AU.tag.play().catch(() => {}); } catch (_) { }
      }
      if (AU.ctx && AU._ctxBgPaused) {
        AU._ctxBgPaused = false;
        try { AU.ctx.resume().catch(() => {}); } catch (_) { }
      }
      if (g && g._bgPaused) {
        g._bgPaused = false;
        try { g.resume(); } catch (_) { }
      }
    }
  } catch (_) { }
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
  e = document.createElement('div'); e.id = 'tip';
  e.innerHTML = '💡 ' + html
    + '<small>ketuk untuk tutup · <span class="tip-off" style="text-decoration:underline;cursor:pointer">jangan tampilkan tips lagi</span></small>';
  UI.appendChild(e);
  const close = () => { e.classList.add('off'); setTimeout(() => e.remove(), 300); };
  const offBtn = e.querySelector('.tip-off');
  if (offBtn) {
    offBtn.onpointerdown = ev => {
      ev.stopPropagation();
      try { localStorage.setItem('lumina_tips', '0'); } catch (_) { }
      if (S.tipsDone) S.tipsDone.all = 1;
      close();
    };
  }
  e.onpointerdown = ev => { ev.stopPropagation(); close(); }; setTimeout(close, 7000);
}
Object.assign(World.prototype, {
  updTips(dt) {
    if (G.lock) { const t = document.getElementById('tip'); if (t) t.remove(); }
    try { if (localStorage.getItem('lumina_tips') === '0') return; } catch (_) { }
    if (G.title || G.lock || !OPT.tips || !S.tipsDone || S.tipsDone.all || this.M.indoor && S.stage > 0) return;
    this.tipT = (this.tipT || 2) - dt; if (this.tipT > 0) return; this.tipT = 1;
    if (document.getElementById('tip')) return;
    const T = TIPS.find(t => !S.tipsDone[t.id] && t.when(this)); if (!T) return;
    if (S.tipsDone[T.id] === undefined) return;
    S.tipsDone[T.id] = 1; showTip(T.txt); this.tipT = 9;
  },
  updPeaceHud(dt) {
    this.hudPeaceStep = (this.hudPeaceStep || 0) + dt;
    if (this.hudPeaceStep >= 0.25) { this.hudPeaceStep = 0; if (typeof updHud === 'function') updHud(); }
  },
  // ---------------- PETA MINI (#82) ----------------
  updMinimap(dt) {
    const M = this.M; let c = document.getElementById('mini');
    const hasModal = document.querySelector('.win, .dlg') != null;
    if (!OPT.mini || G.title || M.indoor || G.lock || hasModal) { if (c) c.style.display = 'none'; return; }
    if (!c) {
      c = document.createElement('canvas'); c.id = 'mini'; c.width = 96; c.height = 96;
      try { if (localStorage.getItem('lumina_mini') === '1') c.classList.add('big'); } catch (_) {}
      UI.appendChild(c);
      c.onpointerdown = ev => {
        ev.stopPropagation();
        const big = c.classList.toggle('big');
        try { localStorage.setItem('lumina_mini', big ? '1' : '0'); } catch (_) {}
        sfx('cur');
      };
    }
    c.style.display = '';
    this.miniT = (this.miniT || 0) - dt; if (this.miniT > 0) return; this.miniT = .25;
    if (M.benua && typeof miniBenua === 'function' && miniBenua(this, c)) return; /* benua: radar dari tanah sekarang */
    const W = 96, k = W / Math.max(M.w, M.h), ox = (W - M.w * k) / 2, oy = (W - M.h * k) / 2, x = c.getContext('2d');
    if (this.miniFor !== M.id) { // lapisan diam: tanah, jalan, air, tembok, pintu keluar
      this.miniFor = M.id; const b = document.createElement('canvas'); b.width = b.height = W; const y = b.getContext('2d');
      y.fillStyle = M.ground === 'snow' ? '#dfe8f0' : M.ground === 'cave' ? '#4a4458' : M.ground === 'swamp' ? '#4e6a48' : '#6a9a4e'; y.fillRect(ox, oy, M.w * k, M.h * k);
      const now = typeof worldOverview === 'function' && typeof GRASS_EDGE !== 'undefined' && GRASS_EDGE.maps.includes(M.id);
      if (now) { y.imageSmoothingEnabled = true; y.drawImage(worldOverview(M), ox, oy, M.w * k, M.h * k); } /* tanah sekarang */
      y.strokeStyle = M.ground === 'village' ? '#d8cdb8' : '#c8a870'; y.lineCap = 'round';
      if (!now) for (const [x1, y1, x2, y2, w] of M.paths || []) { y.lineWidth = Math.max(1.5, (w || 12) * k * 1.4); y.beginPath(); y.moveTo(ox + x1 * k, oy + y1 * k); y.lineTo(ox + x2 * k, oy + y2 * k); y.stroke(); }
      y.fillStyle = '#4aa6e0'; if (!now) for (const [px, py, rx, ry] of M.ponds || []) { y.beginPath(); y.ellipse(ox + px * k, oy + py * k, rx * k, ry * k, 0, 0, 7); y.fill(); }
      y.fillStyle = 'rgba(30,24,40,.55)'; if (!now) for (const [wx, wy, ww, wh] of M.walls || []) y.fillRect(ox + wx * k, oy + wy * k, Math.max(1, ww * k), Math.max(1, wh * k));
      y.fillStyle = '#ffd84a'; for (const e of M.exits || []) y.fillRect(ox + e.x * k - 1, oy + e.y * k - 1, Math.max(3, e.w * k), Math.max(3, e.h * k));
      drawFog(y, M, k, ox, oy); this.miniBase = b;
    }
    x.clearRect(0, 0, W, W); x.drawImage(this.miniBase, 0, 0);
    x.fillStyle = '#fff3c0'; for (const n of this.npcs) if (n.spr.visible) x.fillRect(ox + n.spr.x * k - 1, oy + n.spr.y * k - 1, 2, 2);
    x.fillStyle = '#e84a3a'; for (const e of this.enemies) if (e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 260) x.fillRect(ox + e.spr.x * k - 1, oy + e.spr.y * k - 1, 2, 2);
    const q = this.qGoal; if (q) { x.fillStyle = '#ffd84a'; x.font = '9px sans-serif'; x.fillText('★', ox + q.x * k - 4, oy + q.y * k + 3); }
    const px = ox + this.pl.x * k, py = oy + this.pl.y * k; x.fillStyle = '#ffffff'; x.strokeStyle = '#2a1c14'; x.lineWidth = 1.5; x.beginPath(); x.arc(px, py, 2.6, 0, 7); x.fill(); x.stroke();
  },
  swapWeapon() {
    if (!S.eq.altWpn) {
      const otherWpn = Object.keys(S.inv).find(id => ITEMS[id] && ITEMS[id].k === 'wpn' && id !== S.eq.wpn);
      if (otherWpn) S.eq.altWpn = otherWpn;
      else { popWorld(this.pl.x, this.pl.y - 28, 'Tidak ada senjata cadangan', 'mpc'); sfx('buzz'); return; }
    }
    const cur = S.eq.wpn, next = S.eq.altWpn;
    if (!has(next)) { popWorld(this.pl.x, this.pl.y - 28, 'Senjata cadangan tidak ada', 'mpc'); sfx('buzz'); return; }
    S.eq.wpn = next; S.eq.altWpn = cur; sfx('ok'); this.sparkle(this.pl.x, this.pl.y - 12, 'spark', 6);
    popWorld(this.pl.x, this.pl.y - 28, '⇄ ' + ITEMS[next].n, 'gold'); updHud();
  },
  updStamina(dt, isSprinting, isMoving) {
    const st = stat(), maxSta = st.maxsta || 100;
    if (S.sta == null) S.sta = maxSta;
    if (isSprinting && isMoving) {
      this._wasSprinting = true;
      S.sta = Math.max(0, S.sta - dt * 18);
      if (Math.random() < .22) this.puff(this.pl.x - this.pl.body.velocity.x * .05, this.pl.y - 2);
    } else {
      if (this._wasSprinting && !isMoving && this.puff && this.pl) {
        this._wasSprinting = false;
        this.puff(this.pl.x - 3, this.pl.y - 2);
        this.puff(this.pl.x + 3, this.pl.y - 2);
      } else if (!isSprinting) this._wasSprinting = false;
      const regenRate = isMoving ? 28 : 42;
      S.sta = Math.min(maxSta, S.sta + dt * regenRate);
    }
  },
  tryClimb(v, m, dt) {
    const pl = this.pl;
    if (this.M.indoor || !pl || pl.dead || S.sta <= 0) { pl.isClimbing = false; return false; }
    // Cek tebing di depan karakter (batu alam atau dinding tebing luar ruang)
    const fx = pl.x + (v.x || 0) * 12, fy = pl.y + (v.y || (pl.dir === 'up' ? -1 : 1)) * 10;
    const isNearCliff = this.walls.getChildren().some(w => {
      const b = w.body;
      return b && Math.abs(pl.x - (b.x + b.width / 2)) < b.width / 2 + 10 && Math.abs(pl.y - (b.y + b.height / 2)) < b.height / 2 + 10;
    });
    if (isNearCliff && (Input.keys?.dash || Input.keys?.up) && S.sta > 5) {
      pl.isClimbing = true;
      S.sta = Math.max(0, S.sta - dt * 20);
      pl.setVelocity(v.x * 45, (v.y || -0.6) * 45);
      pl.setTint(0xffeedd);
      if (Math.random() < .15) this.sparkle(pl.x, pl.y - 10, 'spark', 2);
      if (S.sta <= 0) {
        pl.isClimbing = false;
        pl.clearTint();
        popWorld(pl.x, pl.y - 28, 'Stamina Habis!', 'mpc');
        sfx('buzz');
      }
      return true;
    }
    if (pl.isClimbing) { pl.isClimbing = false; pl.clearTint(); }
    return false;
  },
});
// ukuran & transparansi tombol layar (#74 sebagian)
function applyPadOpt() { const r = document.documentElement.style; r.setProperty('--bs', [.85, 1, 1.15, 1.3][OPT.btnSize != null ? OPT.btnSize : 1]); r.setProperty('--ba', [1, .75, .5][OPT.btnAlpha || 0]); }
applyPadOpt();
// simpan saat halaman ditutup/dimuat ulang (#910)
window.addEventListener('pagehide', () => { const g = window.__game && window.__game.sc; if (g && !G.title && g.pl && !g.pl.dead) saveGame(g); });

// PETA MINI BENUA — radar ±MINI_SPAN/2 px di sekitar Arka, dari gambar ringkas Peta Benua (worldmap_art.js: tanah, air,
// jembatan, pohon & bangunan sama dengan yang tampil di game) + kabut jelajah + titik NPC/musuh/tujuan.
const MINI_SPAN = 1500;
function miniBenua(sc, c) {
  if (typeof worldOverview !== 'function') return false;
  const M = sc.M, W = c.width, K = WOV_K;
  try {
    if (!miniBenua.c || miniBenua.for !== M) {
      const [cv, y] = mk(Math.ceil(M.w / K), Math.ceil(M.h / K)); y.fillStyle = '#1e3a4a'; y.fillRect(0, 0, cv.width, cv.height);
      for (const id of M.regions) {
        const R = MAPS[id], P = WORLD_POS[id];
        if (R && !R.indoor) y.drawImage(worldOverview(R), (P[0] - M.x0) / K, (P[1] - M.y0) / K);
      }
      miniBenua.c = cv; miniBenua.for = M;
    }
  } catch (e) { console.warn('miniBenua', e); return false; }
  const x = c.getContext('2d'), k = W / MINI_SPAN, px = sc.pl.x, py = sc.pl.y, ox = W / 2 - px * k, oy = W / 2 - py * k;
  x.fillStyle = '#1e3a4a'; x.fillRect(0, 0, W, W); x.imageSmoothingEnabled = true;
  const sx = (px - MINI_SPAN / 2 - M.x0) / K, sy = (py - MINI_SPAN / 2 - M.y0) / K;
  x.drawImage(miniBenua.c, sx, sy, MINI_SPAN / K, MINI_SPAN / K, 0, 0, W, W);
  if (typeof drawFog === 'function') drawFog(x, M, k, ox, oy);
  const dot = (X, Y, col, r = 1) => {
    const a = ox + X * k, b = oy + Y * k; if (a > 0 && b > 0 && a < W && b < W) { x.fillStyle = col; x.fillRect(a - r, b - r, r * 2, r * 2); }
  };
  for (const n of sc.npcs) if (n.spr.visible) dot(n.spr.x, n.spr.y, '#fff3c0');
  for (const e of sc.enemies) if (e.hp > 0 && Math.hypot(e.spr.x - px, e.spr.y - py) < 360) dot(e.spr.x, e.spr.y, '#e84a3a');
  const q = sc.qGoal; if (q) { /* tujuan: di tepi radar bila jauh */
    const a = Math.max(5, Math.min(W - 5, ox + q.x * k)), b = Math.max(6, Math.min(W - 2, oy + q.y * k));
    x.fillStyle = '#ffd84a'; x.font = '9px sans-serif'; x.fillText('★', a - 4, b + 3);
  }
  x.fillStyle = '#ffffff'; x.strokeStyle = '#2a1c14'; x.lineWidth = 1.5; x.beginPath(); x.arc(W / 2, W / 2, 2.6, 0, 7); x.fill(); x.stroke();
  return true;
}
