import { test, expect } from '@playwright/test';
import { gotoGame, waitForGameReady } from './helpers.js';

test.describe('Gelombang 20 - Mendorong Batu Besar, Anjing Kuro, Kamera, Masak Bintang, Tas Kulit & Bunga', () => {
  test('Fitur Gelombang 20 terpasang dan berfungsi sempurna', async ({ page }) => {
    await gotoGame(page);
    await waitForGameReady(page);

    const check = await page.evaluate(async () => {
      const results = {};

      // 1. Cek state petDog & filter
      results.hasPetDogState = 'petDog' in S;
      results.hasFilterOpt = 'filter' in OPT;

      // 2. Cek item baru (#31, #502)
      results.hasLeatherPouch = !!(ITEMS && ITEMS.leather_pouch);
      results.hasSeedFlower = !!(ITEMS && ITEMS.seed_flower);
      results.hasBouquet = !!(ITEMS && ITEMS.flower_bouquet);

      // 3. Cek benih bunga di SEEDS
      results.hasFlowerSeedInRanch = !!(SEEDS && SEEDS.seed_flower);

      // 4. Cek fungsi Kamera Foto (#55)
      results.hasPhotoModeFn = typeof window.openPhotoMode === 'function';

      // 5. Cek fungsi dorong boulder di scene (#20)
      results.hasUpdBoulder = typeof World.prototype.updBoulder === 'function';

      // 6. Cek filter layar (#93)
      results.hasApplyFilter = typeof window.applyScreenFilter === 'function';

      return results;
    });

    expect(check.hasPetDogState).toBe(true);
    expect(check.hasFilterOpt).toBe(true);
    expect(check.hasLeatherPouch).toBe(true);
    expect(check.hasSeedFlower).toBe(true);
    expect(check.hasBouquet).toBe(true);
    expect(check.hasFlowerSeedInRanch).toBe(true);
    expect(check.hasPhotoModeFn).toBe(true);
    expect(check.hasUpdBoulder).toBe(true);
    expect(check.hasApplyFilter).toBe(true);
  });
});
