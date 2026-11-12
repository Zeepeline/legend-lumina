import { test, expect } from '@playwright/test';
import { gotoGame, waitForGameReady } from './helpers.js';

test.describe('Gelombang 19 - Lemari Pakaian, Tamu Rumah, Tebang Pohon & Teka-teki Pilar Runa', () => {
  test('Fitur Gelombang 19 terdaftar dan siap dimainkan', async ({ page }) => {
    await gotoGame(page);
    await waitForGameReady(page);

    const check = await page.evaluate(async () => {
      const results = {};

      // 1. Cek Outfit & Rune Pillars state
      results.hasOutfit = S && typeof S.outfit === 'string';
      results.hasRuneState = S && !!S.runePillars;

      // 2. Cek Item Petasan Pengalih (#410)
      results.hasFirecracker = !!(ITEMS && ITEMS.firecracker);
      results.hasFirecrackerCraft = !!(CRAFT && CRAFT.find(c => c.id === 'firecracker'));

      // 3. Cek Objek Baru di MAPS & OBJ
      results.hasDeadtreeObj = !!(OBJ && OBJ.deadtree);
      results.hasRunePillarObj = !!(OBJ && OBJ.rune_pillar);

      // 4. Cek Lemari Pakaian di FCAT (#21)
      results.hasWardrobe = !!(FCAT && FCAT.wardrobe);

      // 5. Cek Direct Barter Function (#43)
      results.hasDirectBarterFn = typeof World.prototype.openDirectBarter === 'function';

      // 6. Cek Mode Buta Warna (#77)
      results.hasColorblindOpt = 'colorblind' in OPT;

      return results;
    });

    expect(check.hasOutfit).toBe(true);
    expect(check.hasRuneState).toBe(true);
    expect(check.hasFirecracker).toBe(true);
    expect(check.hasFirecrackerCraft).toBe(true);
    expect(check.hasDeadtreeObj).toBe(true);
    expect(check.hasRunePillarObj).toBe(true);
    expect(check.hasWardrobe).toBe(true);
    expect(check.hasDirectBarterFn).toBe(true);
    expect(check.hasColorblindOpt).toBe(true);
  });
});
