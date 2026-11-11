const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('kartu misi dan panah penunjuk arah', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.G(page, () => { window.__game.S.stage = 17; window.__game.updHud && 0; });
  await h.goto(page, 'village', 600, 600, 'down'); await page.waitForTimeout(800);
  const st = await h.G(page, () => [window.__game.sc.qArrow.visible, document.getElementById('quest').innerText]);
  console.log(JSON.stringify(st)); expect(st[0]).toBe(true);
  await h.G(page, () => { window.__game.S.stage = 5; }); await h.goto(page, 'village', 486, 400, 'up'); await page.waitForTimeout(800);
  h.noErrors(errors);
});
