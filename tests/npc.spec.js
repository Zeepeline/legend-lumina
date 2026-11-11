// NPC beraktivitas: tidak ada NPC yang diam terus; warga pulang saat malam
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('NPC bergerak & beraktivitas', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await h.boot(page); await h.newGame(page);
  for (const m of ['village', 'kpasar']) {
    await h.G(page, () => { window.__game.S.time = 10; });
    await h.goto(page, m, m === 'village' ? 520 : 800, m === 'village' ? 640 : 900, 'down');
    const p0 = await h.G(page, () => window.__game.sc.npcs.map(n => [n.n.id, Math.round(n.spr.x), Math.round(n.spr.y)]));
    await page.waitForTimeout(9000);
    if (m === 'kpasar') await page.screenshot({ path: '/tmp/npc-' + m + '.png' });
    const p1 = await h.G(page, () => window.__game.sc.npcs.map(n => [n.n.id, Math.round(n.spr.x), Math.round(n.spr.y), n.role, n.st]));
    const moved = p1.filter((p, i) => Math.hypot(p[1] - p0[i][1], p[2] - p0[i][2]) > 6).length;
    console.log(m, 'bergerak', moved + '/' + p1.length, JSON.stringify(p1.map(p => p[0] + ':' + p[3] + ':' + p[4])));
    expect(moved).toBeGreaterThan(p1.length * .5);
  }
  await h.G(page, () => { window.__game.S.time = 22; }); await page.waitForTimeout(20000);
  const away = await h.G(page, () => window.__game.sc.npcs.filter(n => n.away).length);
  console.log('pulang malam', away); expect(away).toBeGreaterThan(0);
  h.noErrors(errors);
});
