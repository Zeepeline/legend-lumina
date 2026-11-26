// Pindah peta: tekstur tanah yang sedang tampil di scene GL tidak boleh dihapus (dulu: drawImage null, game beku)
const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('pindah peta tidak menghapus tanah yang sedang tampil', async ({ page }) => {
  test.setTimeout(90_000);
  const errors = await h.boot(page); await h.newGame(page);
  const gone = await h.G(page, () => {
    const sc = window.__game.sc, gl = sc.scene.get('GL'), keys = [...gl.gImgs.keys()]; sc.cleanGroundCache();
    return { n: keys.length, gone: keys.filter(k => !sc.textures.exists(k)).length };
  });
  expect(gone.n).toBeGreaterThan(0); expect(gone.gone).toBe(0);
  await h.goto(page, 'forest', 640, 150, 'up'); await h.goto(page, 'village', 512, 380);
  await h.goto(page, 'cave', 120, 780); await h.goto(page, 'swamp', 640, 60); /* gua → rawa: LRU gua tak boleh merusak lapisan GL */
  h.noErrors(errors);
});
