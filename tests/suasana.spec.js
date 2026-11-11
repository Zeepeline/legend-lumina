const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('suasana alam: hewan, kunang-kunang, tanaman', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = await h.boot(page); await h.newGame(page);
  for (const [m, x, y, t] of [['forest', 640, 600, 10], ['deepwood', 1500, 980, 21], ['meadow', 700, 500, 12], ['river', 1000, 760, 21]]) {
    await h.G(page, t => { window.__game.S.time = t; window.__game.sc.weather = 'clear'; }, t);
    await h.goto(page, m, x, y, 'down'); await h.G(page, () => window.__game.sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)));
    await page.waitForTimeout(2500); await 
    console.log(m, await h.G(page, () => [window.__game.sc.amb.length, window.__game.sc.herbS.length].join('/')));
  }
  const got = await h.G(page, () => { const sc = window.__game.sc, hb = sc.herbS[0]; if (!hb) return 'none'; sc.pl.setPosition(hb.s.x, hb.s.y); return hb.it; });
  await page.waitForTimeout(400); if (got !== 'none') expect((await h.S(page)).inv[got]).toBeGreaterThan(0);
  h.noErrors(errors);
});
