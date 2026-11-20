'use strict';
// Layar judul
// ---------------- LAYAR JUDUL ----------------
async function titleScreen() {
  const t = document.createElement('div'); t.id = 'title';
  t.innerHTML =
    `<div class="logo"><small>LEGENDA</small>LUMINA</div>` +
    `<div class="sub">— ACTION RPG —</div>` +
    `<div class="hint" id="verClick">versi ${GAME_VERSION} · ` +
    `<span id="btnCleanCache" style="cursor:pointer;text-decoration:underline;">Bersihkan Cache</span></div>`;
  UI.appendChild(t); showHud(false);
  let vClicks = 0;
  const vc = t.querySelector('#verClick');
  if (vc) vc.addEventListener('pointerdown', async e => {
    e.stopPropagation();
    vClicks++;
    if (vClicks >= 5) {
      vClicks = 0;
      sfx('crit');
      await openDebugMenu();
    }
  });
  const btnClean = t.querySelector('#btnCleanCache');
  if (btnClean) btnClean.addEventListener('pointerdown', async e => {
    e.stopPropagation();
    btnClean.textContent = 'Membersihkan...';
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        for (const r of regs) await r.unregister();
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const k of keys) await caches.delete(k);
      }
    } catch (_) {}
    location.reload();
  });
  const anySlot = [0, 1, 2].some(i => slotInfo(i));
  const r = await choose({
    items: [{ t: 'Mulai Baru' }, { t: 'Lanjutkan', dis: !hasSave() }, { t: 'Impor Kode' }, { t: 'Pilih Slot', dis: !anySlot }],
    start: hasSave() ? 1 : 0, cancel: false,
    style: { left: '50%', transform: 'translateX(-50%)', bottom: '30px', width: '110px' }
  });
  if (r === 3) { const s = await chooseSlot('load'); if (s >= 0) setSlot(s); t.remove(); return titleScreen(); }
  if (r === 0 && [0, 1, 2].some(i => slotInfo(i))) { const s = await chooseSlot('new'); if (s < 0) { t.remove(); return titleScreen(); } setSlot(s); }
  if (r === 2) { t.remove(); if (await codeDialog('in')) { location.reload(); return; } return titleScreen(); }
  auInit(); t.remove(); await fadeTo(1);
  if (r === 1 && loadSave()) { G.title = false; G.scene.scene.restart({ map: S.map, x: S.x, y: S.y, dir: S.dir }); }
  else {
    S = newState(); G.title = false;
    S.flags.prolog_done = 1; S.flags.prolog_village = 1; S.flags.prolog_named = 1;
    S.heroName = S.heroName || 'Arka'; S.stage = 0; addItem('isword', 1); addItem('potion', 3);
    S.eq.wpn = 'isword'; updHud();
    G.scene.scene.restart({ map: 'village', x: 512, y: 556, dir: 'down', quiet: false });
  }
}
