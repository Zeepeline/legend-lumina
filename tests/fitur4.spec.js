// Teleport, kode save, upgrade, masak
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('teleport, kode save, upgrade, masak', async ({ page }, info) => {
  test.setTimeout(150_000);
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { const S = window.__game.S; S.lv = 30; S.hp = 999; S.stage = 14; S.gold = 5000; Object.assign(S.inv, { fish: 3, veg: 5, gfish: 1, jelly: 3, ore: 20, shard: 10 }); });
  // aktifkan semua patung, foto tiap patung
  for (const m of ['village', 'forest', 'meadow', 'cave', 'swamp', 'snow']) {
    const W = await h.G(page, m => WARPS[m], m);
    await h.goto(page, m, W[0], W[1] + 16, 'up');
    await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
    await h.press(page, 'a', 1, 500); await h.flush(page); await page.waitForTimeout(300);
    await info.attach('warp-' + m, { body: await page.screenshot(), contentType: 'image/png' });
    await h.press(page, 'b', 1, 300); await h.flush(page);
  }
  expect(Object.keys((await h.S(page)).warps).length).toBe(6);
  // teleport dari salju ke desa (desa = pilihan pertama)
  await h.press(page, 'a', 1, 500); await h.flush(page); await h.press(page, 'a', 1, 400);
  await page.waitForFunction(() => window.__game.sc.M.id === 'village' && !window.__game.sc.trans, null, { timeout: 10000 });
  // masak di penginapan
  await h.goto(page, 'inn', 160, 226, 'up');
  const innId = await h.G(page, () => window.__game.sc.npcs[0].n.id);
  await h.faceNpc(page, innId); await h.press(page, 'a', 1, 400);
  await h.press(page, 'down', 1, 150); await h.press(page, 'a', 1, 300); // Masak
  await h.press(page, 'a', 1, 400); await h.press(page, 'a', 1, 400); await h.flush(page); // Ikan Bakar → porsi: 1 piring (#388)
  await h.press(page, 'b', 1, 300); await h.flush(page);
  expect((await h.S(page)).inv.f_fish).toBe(1);
  await h.G(page, () => window.__game.sc.useItem('f_fish'));
  const atkBuff = await h.G(page, () => [window.__game.S.buff.atk > 0, document.getElementById('hSt')?.textContent]);
  expect(atkBuff[0]).toBe(true);
  // upgrade senjata
  const atk0 = await h.G(page, () => stat().atk);
  await h.G(page, () => { const S = window.__game.S; S.up = {}; });
  await h.G(page, async () => { for (let i = 0; i < 2; i++) { const id = window.__game.S.eq.wpn, C = upgCost(id); window.__game.S.gold -= C.gold; window.__game.S.up[id] = (window.__game.S.up[id] || 0) + 1; } });
  expect(await h.G(page, () => stat().atk)).toBeGreaterThan(atk0);
  expect(await h.G(page, () => itemName(window.__game.S.eq.wpn))).toContain('+2');
  // kode save bolak-balik
  const ok = await h.G(page, () => { const c = saveCode(); const o = readCode(c); return o && o.up && o.gold === window.__game.S.gold && readCode('sampah') === null; });
  expect(ok).toBe(true);
  h.noErrors(errors);
});
