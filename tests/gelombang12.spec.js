// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Gelombang 12: Ekonomi, Papan Permintaan, Gelar, Statistik & QoL Tas', () => {
  test('Sistem Gelar, Statistik, Papan Permintaan & Jual Cepat Sampah terdefinisi', async ({ page }) => {
    // Validasi sintaks dan objek di browser
    await page.goto('http://localhost:8000');
    await page.waitForTimeout(1000);

    const check = await page.evaluate(() => {
      return {
        hasEconomy: typeof openNoticeBoard === 'function',
        hasTitles: typeof TITLES !== 'undefined' && !!TITLES['Penebas Rimba'],
        hasStats: typeof openStatsAndTitles === 'function',
        hasRecipes: typeof openRecipeBook === 'function',
        hasMerchantSchedule: typeof isMerchantHere === 'function'
      };
    });

    expect(check.hasEconomy).toBe(true);
    expect(check.hasTitles).toBe(true);
    expect(check.hasStats).toBe(true);
    expect(check.hasRecipes).toBe(true);
    expect(check.hasMerchantSchedule).toBe(true);
  });
});
