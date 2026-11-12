'use strict';
// Menu utama, jurus, bestiari, pencapaian
// ---------------- MENU UTAMA ----------------
async function mainMenu(sc) {
  G.lock++; sfx('ok'); let sel = 0;
  const acts = [['Tas', 'Item, perlengkapan & bahan', () => openBag(sc)], ['Jurnal', 'Tujuan, misteri & catatan', () => openQuests()], ['Peta', 'Peta area ini', () => openMap(sc)],
    ['Jurus', 'Jurus yang sudah dikuasai', () => openSkills()], ['Atribut', 'Bagikan poin naik level', () => openAttr()], ['Kerajinan', 'Buat ramuan, bom, panah, umpan', () => openCraft(sc)],
    ['Buku Resep', 'Katalog resep tempa, kerajinan & masakan', () => openRecipeBook()],
    ['Ensiklopedia', 'Katalog flora, fauna, mineral & kemajuan dunia', () => openEncyclopedia()],
    ['Tantangan Harian', 'Aksi harian bertarung & berpetualang', () => openDailyFeats()],
    ['Statistik & Gelar', 'Rekap petualangan & bonus gelar', () => openStatsAndTitles()],
    ['Bestiari', 'Buku monster', () => openBestiary(sc)], ['Buku Ikan', 'Catatan & habitat fauna air', () => openFishLog(sc)], ['Pencapaian', 'Prestasi & hadiahnya', () => openAch()], ['Riwayat', 'Baca ulang percakapan terakhir', () => openDlgLog()],
    ['Kamera Foto', 'Abadikan momen petualangan indah', () => openPhotoMode(sc)],
    ['Simpan', 'Simpan permainan', async () => { const ok = saveGame(sc); sfx(ok ? 'save' : 'buzz'); await say(ok ? 'Permainan tersimpan.' : 'Gagal menyimpan.'); }],
    ['Pengaturan', 'Suara, getar, layar', () => openSettings()], ['Tutup', 'Kembali bermain', null]];
  for (; ;) {
    const r = await choose({ head: 'MENU', x: 8, y: 22, w: 120, start: sel, items: acts.map(([t]) => ({ t })), foot: i => acts[i][1] });
    if (r < 0 || !acts[r][2]) break; sel = r; await acts[r][2]();
  }
  G.lock--;
}
// ---------------- PENGATURAN ----------------
async function openSettings() {
  const bar = v => '■'.repeat(v) + '□'.repeat(4 - v), onoff = v => v ? 'ON' : 'OFF';
  const fs = () => !!document.fullscreenElement;
  const rows = [
    ['Musik', () => bar(OPT.mus), () => { OPT.mus = (OPT.mus + 1) % 5; }, 'Volume musik (A untuk ubah)'],
    ['Efek', () => bar(OPT.sfx), () => { OPT.sfx = (OPT.sfx + 1) % 5; sfx('ok'); }, 'Volume efek suara'],
    ['Getar', () => onoff(OPT.vib), () => { OPT.vib = !OPT.vib; if (OPT.vib && navigator.vibrate) navigator.vibrate(30); }, 'Getar HP saat memukul/terkena'],
    ['Goyang', () => onoff(OPT.shake), () => { OPT.shake = !OPT.shake; }, 'Goyang layar saat serangan kuat'],
    ['FPS Monitor', () => onoff(OPT.fps), () => { OPT.fps = !OPT.fps; const f = document.getElementById('fps-meter'); if (f) f.style.display = OPT.fps ? 'block' : 'none'; }, 'Tampilkan indikator FPS & performa'],
    ['Layar penuh', () => onoff(fs()), async () => { try { fs() ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); } catch (_) { } await sleep(150); }, 'Sembunyikan bilah browser'],
    ['Kesulitan', () => DIFF[OPT.diff].n, () => { OPT.diff = (OPT.diff + 1) % 3; }, 'Santai: musuh lebih lemah · Sulit: lebih kuat'],
    ['Kecepatan teks', () => ['Lambat', 'Normal', 'Cepat', 'Instan'][OPT.txt], () => { OPT.txt = (OPT.txt + 1) % 4; }, 'Tahan tombol A/B saat dialog untuk mempercepat'],
    ['Ukuran huruf', () => ['Kecil', 'Sedang', 'Besar', 'Sangat besar'][OPT.font], () => { OPT.font = (OPT.font + 1) % 4; applyFont(); }, 'Ukuran teks dialog, menu, dan tas'],
    ['Hemat baterai', () => onoff(OPT.lite), () => { OPT.lite = !OPT.lite; applyLite(); applyScreenFilter(); }, '30 FPS & partikel musim dimatikan'],
    ['Filter Layar', () => ['Standar', 'Hangat', 'Vinyet', 'Retro CRT'][OPT.filter || 0], () => { OPT.filter = ((OPT.filter || 0) + 1) % 4; applyScreenFilter(); }, 'Gaya visual atmosferik layar'],
    ['Mode Buta Warna', () => onoff(OPT.colorblind), () => { OPT.colorblind = !OPT.colorblind; }, 'Kontras tinggi & label teks penjelas damage'],
    ['Notifikasi barang', () => onoff(OPT.toast), () => { OPT.toast = !OPT.toast; }, 'Pesan kecil saat mendapat barang'],
    ['Musik dinamis', () => onoff(OPT.dynMus), () => { OPT.dynMus = !OPT.dynMus; }, 'Musik berubah saat bertarung'],
    ['Suara langkah', () => onoff(OPT.steps), () => { OPT.steps = !OPT.steps; }, 'Bunyi langkah sesuai jenis tanah'],
    ['Peta mini', () => onoff(OPT.mini), () => { OPT.mini = !OPT.mini; }, 'Peta kecil di pojok kiri atas (ketuk untuk peta besar)'],
    ['Tips tutorial', () => onoff(OPT.tips), () => { OPT.tips = !OPT.tips; }, 'Petunjuk singkat saat situasi baru'],
    ['Ukuran tombol', () => ['Kecil', 'Normal', 'Besar', 'Sangat besar'][OPT.btnSize], () => { OPT.btnSize = (OPT.btnSize + 1) % 4; applyPadOpt(); }, 'Ukuran tombol layar sentuh'],
    ['Transparansi tombol', () => ['Penuh', 'Sedikit', 'Banyak'][OPT.btnAlpha], () => { OPT.btnAlpha = (OPT.btnAlpha + 1) % 3; applyPadOpt(); }, 'Supaya tombol tidak menutupi layar'],
    ['Bilah HP musuh', () => onoff(OPT.hpbar), () => { OPT.hpbar = !OPT.hpbar; }, 'Bilah HP kecil di atas musuh'],
    ['Ekspor save', () => null, async () => { saveGame(G.scene); await codeDialog('out'); }, 'Salin kode save ke perangkat lain'],
    ['Impor save', () => null, async () => { if (await codeDialog('in')) { await say('Save berhasil dimuat. Game akan dibuka ulang.'); location.reload(); } }, 'Muat progres dari kode save'],
    ['Menu Debug', () => '🛠 QA', () => openDebugMenu(), 'Mode pengembang & pengujian cepat'],
    ['Kembali', () => null, null, 'Tutup pengaturan']];
  let sel = 0;
  for (; ;) {
    const r = await choose({ head: 'PENGATURAN', x: 8, y: 22, w: 150, start: sel, items: rows.map(([t, v]) => ({ t, r: v() })), foot: i => rows[i][3] });
    if (r < 0 || !rows[r][2]) break; sel = r; await rows[r][2](); saveOpt();
  }
}
// Menu Jurus: daftar jurus per aliran, tingkat penguasaan, guru, dan pilihan sihir untuk tombol SIHIR
async function openSkills() {
  const ids = Object.keys(JURUS); let sel = 0;
  for (; ;) {
    const r = await choose({ head: 'JURUS ARKA · SIHIR: ' + (S.spell ? JURUS[S.spell].n : '-'), x: 12, y: 16, w: 266, start: sel,
      items: [...ids.map(k => { const J = JURUS[k], L = learned(k); return { t: (L ? (S.spell === k ? '★ ' : '✦ ') : '🔒 ') + J.n, r: L ? ['', 'I', 'II', 'III'][tierOf(k)] : J.school }; }), { t: 'Kembali' }],
      foot: i => { if (i >= ids.length) return 'Tebasan dasar: SERANG. Jurus lain dipelajari dari guru.'; const k = ids[i], J = JURUS[k];
        if (!learned(k)) return `<b>${J.school}</b> · Guru: ${J.where}${J.can() ? '<br><i>Guru siap mengajar! Temui beliau.</i>' : '<br><i>Belum waktunya...</i>'}`;
        const t = tierOf(k), nx = MASTERY[t]; return `${J.d}${J.mp ? ` (${J.mp} MP)` : ''}<br>Penguasaan ${['', 'I', 'II', 'III'][t]}${t < 3 ? ` · ${S.mast[k] || 0}/${nx} pemakaian` : ' · MAHIR'}${J.kind === 'spell' ? '<br>Pilih: pasang di tombol SIHIR' : ''}`; } });
    if (r < 0 || r >= ids.length) return; sel = r; const k = ids[r];
    if (learned(k) && JURUS[k].kind === 'spell') { S.spell = k; sfx('ok'); } else sfx('cur');
  }
}
function enemyThumb(sc, k) { const D = ENEMY[k]; try { return sc.textures.getBase64(D.tex, D.ch ? 'down0' : 0); } catch (_) { return ''; } }
async function openBestiary(sc) {
  const list = Object.keys(ENEMY), seen = list.filter(k => S.kills[k]).length;
  const w = win('menu', `<div class="mh">Bestiari · ${seen}/${list.length} · total ${totalKills()} kalah</div><div class="bgrid">` +
    list.map(k => { const D = ENEMY[k], n = S.kills[k]; return n ? `<div class="bc${BOSS_AI.includes(D.ai) ? ' boss' : ''}"><img src="${enemyThumb(sc, k)}"><b>${D.name}</b><span>HP ${D.hp} · ATK ${D.atk} · ×${n}</span></div>` : `<div class="bc unk"><b>???</b><span>belum ditemui</span></div>`; }).join('') + `</div><div class="mf">Kalahkan semua monster biasa untuk hadiah Medali Pemburu.</div>`);
  Object.assign(w.style, { left: '8px', right: '8px', top: '8px', bottom: '34px', overflow: 'auto' });
  await choose({ items: [{ t: 'Kembali' }], x: 110, bottom: 6 }); w.remove();
}
// Buku Ikan ada di systems/fishing.js (semua jenis, petunjuk, rekor)
function openFishLog(sc) { return openFishLogNew(sc); }
async function openAch() {
  const w = win('menu', `<div class="mh">Pencapaian · ${ACH.filter(A => S.ach[A.id]).length}/${ACH.length}</div>` + ACH.map(A => `<div class="qr${S.ach[A.id] ? '' : ' done'}"><b>${S.ach[A.id] ? '★' : '☆'} ${A.n}</b> · ${A.d}<br>Hadiah: ${A.gift[0] === 'gold' ? A.gift[1] + ' G' : ITEMS[A.gift[0]].n + ' x' + A.gift[1]}</div>`).join(''));
  Object.assign(w.style, { left: '14px', right: '14px', top: '10px', bottom: '34px', overflow: 'auto' });
  await choose({ items: [{ t: 'Kembali' }], x: 110, bottom: 6 }); w.remove();
}
// ---------------- RIWAYAT DIALOG (#880) ----------------
async function openDlgLog() {
  const w = win('menu jrn', `<div class="bt"><span class="tb on">Riwayat Dialog</span><span class="gold">B: tutup</span></div><div class="jb">${DLG_LOG.length ? DLG_LOG.slice().reverse().map(d => `<div class="qr">${d.name ? `<b>${d.name}</b><br>` : ''}${d.text.replace(/</g, '&lt;')}</div>`).join('') : '<i>Belum ada percakapan.</i>'}</div>`);
  Object.assign(w.style, { left: '12px', right: '12px', top: '14px', bottom: '14px' });
  G.lock++; await new Promise(res => { const prev = UIH; UIH = k => { if (k === 'up' || k === 'down') w.querySelector('.jb').scrollTop += k === 'up' ? -50 : 50; else if (['a', 'b', 'menu', 'back'].includes(k)) { UIH = prev; res(); } }; });
  w.remove(); G.lock--;
}
// ---------------- PILIH SLOT (#79) ----------------
async function chooseSlot(mode) {
  const items = [0, 1, 2].map(i => { const f = slotInfo(i); return { t: `Slot ${i + 1}${i === SAVE_SLOT ? ' ★' : ''}`, r: f ? `Lv ${f.lv} · ${f.map}` : '(kosong)', dis: mode === 'load' && !f }; });
  const r = await choose({ head: mode === 'load' ? 'Muat dari slot' : 'Mulai baru di slot', items: [...items, { t: 'Batal' }], x: 30, y: 60, w: 240, foot: i => { if (i > 2) return ''; const f = slotInfo(i); return f ? `${f.gold} G · tersimpan ${f.when}` : 'Slot kosong'; } });
  if (r < 0 || r > 2) return -1;
  if (mode === 'new' && slotInfo(r) && !(await ask(`Slot ${r + 1} sudah berisi. Timpa dengan permainan baru?`))) return -1;
  return r;
}

// ---------------- MENU PENGEMBANG / DEBUG (#98) ----------------
async function openDebugMenu() {
  G.lock++; sfx('ok');
  for (;;) {
    const opts = [
      { t: '⚡ Pulihkan HP & MP Penuh' },
      { t: '💰 Tambah 500 G' },
      { t: '🗺 Buka Seluruh Kabut Peta' },
      { t: '🚀 Teleport: Desa Lumina', map: 'village', x: 512, y: 384 },
      { t: '🚀 Teleport: Hutan Lumina', map: 'forest', x: 640, y: 100 },
      { t: '🚀 Teleport: Padang Angin', map: 'meadow', x: 300, y: 300 },
      { t: '🚀 Teleport: Gua Batu', map: 'cave', x: 140, y: 800 },
      { t: '🚀 Teleport: Rawa Senja', map: 'swamp', x: 640, y: 100 },
      { t: '🚀 Teleport: Puncak Beku', map: 'snow', x: 640, y: 1100 },
      { t: '🚀 Teleport: Danau Cermin', map: 'lake', x: 1000, y: 500 },
      { t: '🚀 Teleport: Kota Lumina', map: 'kpasar', x: 560, y: 320 },
      { t: '🎁 Beri Semua Kunci & Alat' },
      { t: 'Tutup' }
    ];

    const r = await choose({
      head: '🛠 MODE PENGEMBANG / DEBUG',
      x: 20, y: 20, w: 260,
      items: opts,
      foot: () => 'Menu QA & Pengujian Fitur Cepat Antigravity.'
    });

    if (r < 0 || r === opts.length - 1) break;

    const opt = opts[r];
    if (r === 0) {
      const st = stat();
      S.hp = st.maxhp; S.mp = st.maxmp;
      sfx('heal'); updHud();
      await say('HP dan MP dipulihkan penuh!');
    } else if (r === 1) {
      S.gold += 500;
      sfx('coin'); updHud();
      await say('Berhasil menambahkan 500 G!');
    } else if (r === 2) {
      S.fog = S.fog || {};
      for (const k in MAPS) S.fog[k] = [];
      sfx('chest');
      await say('Seluruh kabut wilayah dunia disingkap!');
    } else if (opt.map) {
      G.lock--;
      if (G.scene) G.scene.goto(opt.map, opt.x, opt.y, 'down');
      return;
    } else if (r === 11) {
      ['key', 'lockpick', 'hearthstone', 'bomb', 'net', 'smoke', 'bait'].forEach(id => addItem(id, 5));
      sfx('chest'); updHud();
      await say('Semua kunci dan alat petualangan ditambahkan ke tas!');
    }
  }
  G.lock--;
}

// ---------------- MODE KAMERA FOTO & SNAPSHOT (#55) ----------------
async function openPhotoMode(sc) {
  if (G.lock > 0) return;
  G.lock++; sfx('ok');

  const hud = document.getElementById('hud');
  const pad = document.getElementById('pad');
  if (hud) hud.style.display = 'none';
  if (pad) pad.style.display = 'none';

  const overlay = document.createElement('div');
  overlay.id = 'photo-mode-ui';
  Object.assign(overlay.style, {
    position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
    boxSizing: 'border-box', border: '2px solid rgba(255,255,255,0.4)',
    pointerEvents: 'none', zIndex: '99998'
  });

  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'absolute', bottom: '16px', left: '50%', transform: 'translateX(-50%)',
    background: 'rgba(20,20,30,0.85)', padding: '6px 14px', borderRadius: '20px',
    display: 'flex', gap: '10px', pointerEvents: 'auto', border: '1px solid rgba(255,255,255,0.2)'
  });

  bar.innerHTML = `
    <button id="btn-snap" style="background:#ffcc00;border:none;border-radius:12px;padding:4px 12px;font-weight:bold;cursor:pointer;">📸 Jepret</button>
    <button id="btn-exit-photo" style="background:#555;color:#fff;border:none;border-radius:12px;padding:4px 12px;cursor:pointer;">✕ Keluar</button>
  `;
  overlay.appendChild(bar);
  document.body.appendChild(overlay);

  await new Promise(resolve => {
    const btnSnap = bar.querySelector('#btn-snap');
    const btnExit = bar.querySelector('#btn-exit-photo');

    btnSnap.onclick = async () => {
      sfx('save');
      overlay.style.display = 'none';
      if (sc && sc.cameras) sc.cameras.main.flash(180, 255, 255, 255);
      await sleep(150);

      const canvas = document.querySelector('canvas');
      if (canvas) {
        try {
          const dataUrl = canvas.toDataURL('image/png');
          const a = document.createElement('a');
          a.download = `lumina-photo-${Date.now()}.png`;
          a.href = dataUrl;
          a.click();
        } catch (_) {}
      }
      overlay.style.display = 'block';
      popWorld(sc.pl.x, sc.pl.y - 24, '📸 Foto Terabadikan!', 'heal');
    };

    btnExit.onclick = () => {
      sfx('back');
      resolve();
    };
  });

  overlay.remove();
  if (hud) hud.style.display = '';
  if (pad) pad.style.display = '';
  G.lock--;
}
