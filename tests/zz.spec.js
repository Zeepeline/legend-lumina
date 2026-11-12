const { test } = require('@playwright/test'); const h = require('./helpers');
test('d', async ({ page }) => { test.setTimeout(150000); const errors = []; page.on('pageerror', e => errors.push(e.message)); await h.boot(page); await h.newGame(page); await h.flush(page); await h.G(page, () => { OPT.tips = false; S.stage = 30; });
  const e = await h.G(page, () => { const e = MAPS.pl_forest_river.exits.find(e => e.to === 'river'); return [e.x + e.w / 2, e.y + e.h / 2]; });
  for (let k = 0; k < 3; k++) {
    await h.goto(page, 'pl_forest_river', e[0] - 70, e[1], 'right'); await page.waitForFunction(() => window.__game.sc.M.id === 'pl_forest_river' && !window.__game.sc.trans && !(+FADE.style.opacity), null, { timeout: 15000 }); await page.waitForTimeout(300 + k * 1500);
    await h.G(page, () => { window.__game.sc.enemies.forEach(e => { e.hp = 0; e.spr.setPosition(-9999, -9999); }); window.__game.sc.pl.inv = 99; window.__game.Input.held.push('right'); });
    await page.waitForTimeout(3000); await h.G(page, () => window.__game.Input.held.length = 0);
    console.log('R' + k + ' ' + JSON.stringify(await h.G(page, () => { const sc = window.__game.sc; return { map: sc.M.id, pl: [Math.round(sc.pl.x), Math.round(sc.pl.y)], reg: [...REG.keys()], blocked: sc.pl.body.blocked.right, wb: sc.physics.world.bounds.right }; })));
  }
  console.log('E ' + errors.join('|'));
});
