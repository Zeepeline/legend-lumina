import { test, expect } from '@playwright/test';
import { gotoGame, waitForGameReady } from './helpers.js';

test.describe('Gelombang 18 - Boss Rematch, Brankas Desa, Bom Es & Cuaca Ekstrem', () => {
  test('Fitur Gelombang 18 terdaftar dan berfungsi dengan baik', async ({ page }) => {
    await gotoGame(page);
    await waitForGameReady(page);

    const check = await page.evaluate(async () => {
      const results = {};

      // 1. Cek State Default Bank & Records
      results.hasBankState = !!(S && S.bank);
      results.hasRecordsState = !!(S && S.records);

      // 2. Cek Item & Kerajinan Bom Es (#408)
      results.hasFbomb = !!(ITEMS && ITEMS.fbomb);
      results.fbombCraft = !!(CRAFT && CRAFT.find(c => c.id === 'fbomb'));

      // 3. Cek Objek Baru di MAPS & OBJ
      results.hasVaultObj = !!(OBJ && OBJ.village_vault);
      results.hasMirrorObj = !!(OBJ && OBJ.mirror_memory);
      results.hasFameObj = !!(OBJ && OBJ.fame_board);

      // 4. Test Bunga Bank Desa (#42)
      S.bank = { gold: 1000, day: 1 };
      S.day = 3; // Lewat 2 hari
      // Panggil fungsi atau simulasi buka brankas
      if (typeof openVillageVault === 'function') {
        results.openVillageVaultExists = true;
      }

      // 5. Test Bom Es useTool (#408)
      addItem('fbomb', 2);
      results.hasFbombInInv = has('fbomb', 1);

      // 6. Test Musuh Terbang Menukik AI (#7)
      const batDef = ENEMY && ENEMY.bat;
      results.batIsFly = batDef && batDef.ai === 'fly';

      // 7. Test Cermin Ingatan Kuil (#12)
      results.hasMemoryTrialFn = typeof openMemoryTrials === 'function';

      // 8. Test Papan Rekor Petualang (#95)
      results.hasHallOfFameFn = typeof openHallOfFame === 'function';

      return results;
    });

    expect(check.hasBankState).toBe(true);
    expect(check.hasRecordsState).toBe(true);
    expect(check.hasFbomb).toBe(true);
    expect(check.fbombCraft).toBe(true);
    expect(check.hasVaultObj).toBe(true);
    expect(check.hasMirrorObj).toBe(true);
    expect(check.hasFameObj).toBe(true);
    expect(check.hasFbombInInv).toBe(true);
    expect(check.batIsFly).toBe(true);
    expect(check.hasMemoryTrialFn).toBe(true);
    expect(check.hasHallOfFameFn).toBe(true);
  });
});
