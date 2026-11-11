'use strict';
// Menu utama, jurus, bestiari, pencapaian
// ---------------- MENU UTAMA ----------------
async function mainMenu(sc) {
  G.lock++; sfx('ok'); let sel = 0;
  const acts = [['Tas', 'Item, perlengkapan & bahan', () => openBag(sc)], ['Jurnal', 'Tujuan, misteri & catatan', () => openQuests()], ['Peta', 'Peta area ini', () => openMap(sc)],
    ['Jurus', 'Jurus yang sudah dikuasai', () => openSkills()], ['Bestiari', 'Buku monster', () => openBestiary(sc)], ['Pencapaian', 'Prestasi & hadiahnya', () => openAch()],
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
    ['Layar penuh', () => onoff(fs()), async () => { try { fs() ? await document.exitFullscreen() : await document.documentElement.requestFullscreen(); } catch (_) { } await sleep(150); }, 'Sembunyikan bilah browser'],
    ['Ekspor save', () => null, async () => { saveGame(G.scene); await codeDialog('out'); }, 'Salin kode save ke perangkat lain'],
    ['Impor save', () => null, async () => { if (await codeDialog('in')) { await say('Save berhasil dimuat. Game akan dibuka ulang.'); location.reload(); } }, 'Muat progres dari kode save'],
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
async function openAch() {
  const w = win('menu', `<div class="mh">Pencapaian · ${ACH.filter(A => S.ach[A.id]).length}/${ACH.length}</div>` + ACH.map(A => `<div class="qr${S.ach[A.id] ? '' : ' done'}"><b>${S.ach[A.id] ? '★' : '☆'} ${A.n}</b> · ${A.d}<br>Hadiah: ${A.gift[0] === 'gold' ? A.gift[1] + ' G' : ITEMS[A.gift[0]].n + ' x' + A.gift[1]}</div>`).join(''));
  Object.assign(w.style, { left: '14px', right: '14px', top: '10px', bottom: '34px', overflow: 'auto' });
  await choose({ items: [{ t: 'Kembali' }], x: 110, bottom: 6 }); w.remove();
}
