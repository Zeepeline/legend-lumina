'use strict';
// Layar judul
// ---------------- LAYAR JUDUL ----------------
async function titleScreen() {
  const t = document.createElement('div'); t.id = 'title';
  t.innerHTML = `<div class="logo"><small>LEGENDA</small>LUMINA</div><div class="sub">— ACTION RPG —</div><div class="hint">Phaser 3 · 4 wilayah · 21 jenis musuh</div>`;
  UI.appendChild(t); showHud(false);
  const r = await choose({ items: [{ t: 'Mulai Baru' }, { t: 'Lanjutkan', dis: !hasSave() }, { t: 'Impor Kode' }], start: hasSave() ? 1 : 0, cancel: false, style: { left: '50%', transform: 'translateX(-50%)', bottom: '30px', width: '110px' } });
  if (r === 2) { t.remove(); if (await codeDialog('in')) { location.reload(); return; } return titleScreen(); }
  auInit(); t.remove(); await fadeTo(1);
  if (r === 1 && loadSave()) { G.title = false; G.scene.scene.restart({ map: S.map, x: S.x, y: S.y, dir: S.dir }); }
  else {
    S = newState(); G.title = false;
    G.scene.scene.restart({ map: 'village', x: 512, y: 384, dir: 'up', quiet: true, after: async () => {
      await sleep(500); banner('Desa Lumina', 'SELAMAT DATANG DI', false, 1600); await sleep(1700);
      await talk('Lina', ['Arka! Akhirnya kamu bangun.', 'Tetua Bram mencarimu dari tadi. Beliau ada di rumah pohon besar, tepat di depanmu!']);
    } });
  }
}
