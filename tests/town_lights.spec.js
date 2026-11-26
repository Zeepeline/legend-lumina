// Lampu jalan di tepi jalan (bukan di tengah) & jendela rumah menyala hanya saat malam, tepat di gambar jendela
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('lampu jalan berada di tepi jalan', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  const r = await h.G(page, () => ['village', 'kgate', 'kpasar', 'kpermukiman', 'kakademi', 'kbawah'].flatMap(id => {
    const M = MAPS[id], L = mapObjects(M), E = grassEdgeData(M), S = GRASS_EDGE.cell;
    return L.filter(o => TOWN_LIGHTS.lampRx.test(o[0])).map(o => {
      const k = Math.floor((o[2] - 3) / S) * E.cols + Math.floor(o[1] / S);
      return { id, o: o.slice(0, 3).join(), road: !E.Wm[k] && !E.grass[k] && !E.strip[k] };
    });
  }));
  console.log(await h.G(page, () => JSON.stringify(Object.keys(MAPS).filter(k => MAPS[k]._lampLog).map(k => [k, MAPS[k]._lampLog]))));
  expect(r.length).toBeGreaterThan(30); expect(r.filter(x => x.road)).toEqual([]); h.noErrors(errors);
});
test('jendela menyala malam, padam siang', async ({ page }) => {
  const errors = await h.boot(page); await h.newGame(page);
  const at = async t => { await h.G(page, t => { window.__game.S.time = t; }, t); await page.waitForTimeout(400);
    return h.G(page, () => window.__game.sc.winL.map(w => w.g.alpha)); };
  const day = await at(12), night = await at(21);
  expect(day.length).toBeGreaterThan(5); expect(Math.max(...day)).toBe(0); expect(Math.min(...night)).toBeGreaterThan(.5);
  h.noErrors(errors);
});
