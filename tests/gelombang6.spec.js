const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 6: kabut, rahasia, peta harta, peta zoom', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  await h.goto(page, 'meadow', 600, 400, 'up'); await page.waitForTimeout(800);
  const r = await h.G(page, () => {
    const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000));
    const seen = (S.fog.meadow.match(/1/g) || []).length;
    const secs = sc.secrets.map(s => ({ kind: s.kind, x: s.x, y: s.y, onPath: (sc.M.paths || []).some(([a, b, c, d, w]) => segD(s.x, s.y, a, b, c, d) < (w || 12)), water: sc.groundAt(s.x, s.y) === 'water' }));
    const bush = sc.secrets.find(s => s.kind === 'bush'); const g0 = S.gold;
    sc.shots.push({ s: sc.add.image(0, 0, 'dot'), gx: bush.x, gy: bush.y - 4, vx: 1, vy: 0, life: 1, kind: 'fire', mine: 1, dmg: 1 }); sc.updSecrets();
    return { seen, secs, opened: !!S.flags[bush.id], gold: S.gold - g0, tmap: !!S.tmap, inv: S.inv.tmap };
  });
  console.log(JSON.stringify(r));
  expect(r.seen).toBeGreaterThan(0); expect(r.secs.length).toBe(3); expect(r.secs.every(s => !s.onPath && !s.water)).toBe(true);
  expect(r.opened).toBe(true); expect(r.gold).toBeGreaterThan(0); expect(r.tmap).toBe(true); expect(r.inv).toBe(1);
  await page.waitForTimeout(1500); await h.flush(page);
  // gali harta: pindahkan ke peta tujuan
  const T = await h.G(page, () => S.tmap); await h.goto(page, T.map, T.x, T.y + 10, 'up'); await page.waitForTimeout(500);
  const g0 = await h.G(page, () => S.gold);
  await h.G(page, () => { const sc = window.__game.sc; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); sc.pl.setPosition(S.tmap.x, S.tmap.y + 6); });
  await h.G(page, () => { window.__game.sc.tIt.fn(); }); await page.waitForTimeout(1500); await h.flush(page);
  expect(await h.G(page, () => S.gold)).toBeGreaterThan(g0 + 100);
  // peta: buka, zoom, tutup
  await h.press(page, 'map', 1, 300); await h.press(page, 'up', 1, 200);
  expect(await h.G(page, () => !!document.getElementById('mapw'))).toBe(true);
  await h.press(page, 'b', 1, 300); expect(await h.G(page, () => !document.getElementById('mapw'))).toBe(true);
  h.noErrors(errors);
});
