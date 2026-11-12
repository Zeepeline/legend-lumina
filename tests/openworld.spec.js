// Dunia terbuka Tahap 1: semua sambungan tepi bisa diseberangi tanpa layar hitam
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('menyeberang semua tepi wilayah tanpa layar hitam', async ({ page }) => {
  test.setTimeout(900000);
  const errors = await h.boot(page); await h.newGame(page); await h.flush(page);
  await h.G(page, () => { OPT.tips = false; S.stage = 30; window.__fade = 0; const f = () => { window.__fade = Math.max(window.__fade, +FADE.style.opacity || 0); requestAnimationFrame(f); }; requestAnimationFrame(f); });
  const pairs = await h.G(page, () => Object.entries(NEIGH).flatMap(([a, L]) => L.map(n => { const e = n.ex; return { a, b: n.to, side: n.side, x: e.x + e.w / 2, y: e.y + e.h / 2, auto: !!n.auto, w: MAPS[a].w, h: MAPS[a].h }; })));
  const res = [];
  for (const p0 of pairs) {
   /* tetangga tanpa pintu (auto): cukup bisa diseberangi di salah satu titik sepanjang perbatasan (pohon/air boleh menghalangi sebagian) */
   const shifts = p0.auto ? [0, -90, 90, -180, 180] : [0], vert = p0.side === 'N' || p0.side === 'S'; let okAny = false, last = null;
   for (const sh of shifts) {
    if (okAny) break;
    const p = { ...p0, x: vert ? Math.min(p0.w - 80, Math.max(80, p0.x + sh)) : p0.x, y: vert ? p0.y : Math.min(p0.h - 80, Math.max(80, p0.y + sh)) };
    const back = { E: [-70, 0], W: [70, 0], N: [0, 70], S: [0, -70] }[p.side], dir = { E: 'right', W: 'left', N: 'up', S: 'down' }[p.side];
    await h.goto(page, p.a, p.x + back[0], p.y + back[1], dir);
    // tunggu teleport (yang memakai layar hitam) benar-benar selesai sebelum mengukur penyeberangan
    await page.waitForFunction(a => window.__game.sc.M.id === a && !window.__game.sc.trans && !(+FADE.style.opacity), p.a, { timeout: 15000 }); await page.waitForTimeout(300);
    await h.G(page, () => { window.__fade = 0; for (const sc of [window.__game.sc, ...REG.values()]) (sc.enemies || []).forEach(e => { e.hp = 0; e.spr.setPosition(-9999, -9999); }); window.__game.sc.pl.inv = 99; S.hp = 999; /* monster wilayah tetangga juga hidup sekarang */ });
    let ok = false;
    for (let attempt = 0; attempt < (p0.auto ? 1 : 2) && !ok; attempt++) { // 1 percobaan ulang: saat CPU sibuk teleport/monster bisa mengganggu
      if (attempt) { await h.goto(page, p.a, p.x + back[0], p.y + back[1], dir); await page.waitForFunction(a => window.__game.sc.M.id === a && !window.__game.sc.trans && !(+FADE.style.opacity), p.a, { timeout: 15000 }); await page.waitForTimeout(300); await h.G(page, () => { window.__fade = 0; for (const sc of [window.__game.sc, ...REG.values()]) (sc.enemies || []).forEach(e => { e.hp = 0; e.spr.setPosition(-9999, -9999); }); window.__game.sc.pl.inv = 99; S.hp = 999; /* monster wilayah tetangga juga hidup sekarang */ }); }
      await h.G(page, d => window.__game.Input.held.push(d), dir);
      try { await page.waitForFunction(b => window.__game.sc.M.id === b, p.b, { timeout: 10000 }); ok = true; } catch (_) { }
      await h.G(page, () => { window.__game.Input.held.length = 0; });
    }
    last = { ...p, ok, fade: await h.G(page, () => window.__fade) }; okAny = ok;
   }
    res.push(last);
  }
  console.log(res.map(r => `${r.a} -${r.side}-> ${r.b}: ${r.ok ? 'OK' : 'GAGAL'} fade=${r.fade}`).join('\n'));
  expect(res.filter(r => !r.ok).map(r => r.a + '→' + r.b)).toEqual([]);
  expect(res.every(r => r.fade === 0)).toBe(true);
  h.noErrors(errors);
});
