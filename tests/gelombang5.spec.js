const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 5: atribut, kerajinan, alat, panah, umpan', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  await h.goto(page, 'meadow', 600, 400, 'up');
  const r = await h.G(page, () => {
    const sc = window.__game.sc, pl = sc.pl; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000));
    S.lv = 4; attrInit(); const ap = S.ap; const a0 = stat().atk; S.attr.str += 2; S.ap -= 2; const a1 = stat().atk;
    Object.assign(S.inv, { ore: 2, spore: 3, herb: 3, pelt: 1, wool: 1, feather: 1, bone: 1, berry: 1, jelly: 1 });
    // buat bom seperti di menu
    const R = CRAFT.find(c => c.id === 'bomb'); for (const [k, n] of Object.entries(R.need)) addItem(k, -n); addItem('bomb', 1);
    S.tools = ['bomb', 'smoke']; addItem('smoke', 1); updToolBtns();
    const btn = getComputedStyle(document.getElementById('bX1')).display !== 'none';
    const e = sc.spawnEnemy('slime', pl.x, pl.y - 60); pl.dir = 'up'; const hp0 = e.hp; window.__tE = e;
    pl.atkCd = 0; sc.useSlot(1); const frz = e.frz > 0;
    pl.atkCd = 0; sc.useSlot(0);
    return { ap, a0, a1, btn, frz, bombLeft: S.inv.bomb || 0, hp0, eid: sc.enemies.indexOf(e) };
  });
  await page.waitForTimeout(1200);
  const hp1 = await h.G(page, () => window.__tE.hp);
  console.log(r, hp1);
  expect(r.ap).toBe(9); expect(r.a1).toBe(r.a0 + 2); expect(r.btn).toBe(true); expect(r.frz).toBe(true); expect(r.bombLeft).toBe(0); expect(hp1).toBeLessThan(r.hp0);
});
