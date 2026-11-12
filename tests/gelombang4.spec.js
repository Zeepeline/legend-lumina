const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 4: lagu wilayah, musik dinamis, langkah, suara jarak', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  const r = await h.G(page, () => {
    const sc = window.__game.sc;
    const songs = ['snow', 'swamp', 'forest', 'kpasar', 'village'].map(id => bgmFor({ id, bgm: id === 'kpasar' || id === 'village' ? 'town' : 'field' }));
    const tracksOk = ['snow', 'swamp', 'city', 'forest', 'townN', 'battle'].every(k => TRACKS[k].v[0].n.length > 4);
    let err = null; try { auInit(); sfxAt('die', sc.pl.x + 100, sc.pl.y, sc); for (const k of ['grass', 'snow', 'stone', 'wood', 'water', 'dirt']) stepSound(k); } catch (e) { err = e.message; }
    return { songs, tracksOk, ground: sc.groundAt(sc.pl.x, sc.pl.y), err };
  });
  console.log(r);
  expect(r.songs.slice(0, 4)).toEqual(['snow', 'swamp', 'forest', 'city']); expect(r.tracksOk).toBe(true); expect(r.err).toBe(null);
  await h.goto(page, 'meadow', 600, 400, 'up');
  const b = await h.G(page, () => { const sc = window.__game.sc; OPT.dynMus = true; sc.enemies.forEach(e => e.spr.setPosition(3000, 3000)); const e = sc.spawnEnemy('slime', sc.pl.x, sc.pl.y - 60); e.alert = 2; sc.bgmT = 0; sc.updSound(.1); return AU.cur; });
  await page.waitForTimeout(600);
  expect(await h.G(page, () => AU.cur)).toBe('battle');
});
