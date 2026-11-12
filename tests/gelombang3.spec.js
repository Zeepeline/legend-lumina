const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 3: kombo, elit, waspada, ancang-ancang, bahaya', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  await h.goto(page, 'meadow', 600, 400, 'up');
  const r = await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000));
    // kombo
    const combos = []; for (let i = 0; i < 3; i++) { pl.atkCd = 0; sc.attack(); combos.push(pl.combo); sc.t += .2; }
    // elit
    const e = sc.spawnEnemy('slime', pl.x, pl.y - 140); const hp0 = e.max; sc.makeElite(e);
    // meteran waspada
    sc.updFeel(e, .016, false); const a1 = e.alert;
    e.spr.setPosition(pl.x, pl.y - 60); sc.updFeel(e, .016, false); const a2 = e.alert;
    // ancang-ancang
    e.st = 'wind'; sc.updFeel(e, .016, false); const warned = !!e.mk && e.mk.text === '!';
    // bahaya dari luar layar
    pl.inv = 0; sc.hurtPlayer(1, pl.x + 900, pl.y); const dg = !!document.querySelector('.danger.right.on');
    // elit tumbang
    const el0 = S.elites || 0; sc.killEnemy(e);
    return { combos, elite: e.max > hp0 * 2, a1, a2, warned, dg, elites: (S.elites || 0) - el0 };
  });
  console.log(r);
  expect(r.combos).toEqual([1, 2, 3]); expect(r.elite).toBe(true); expect(r.a1).toBe(1); expect(r.a2).toBe(2);
  expect(r.warned).toBe(true); expect(r.dg).toBe(true); expect(r.elites).toBe(1);
});
