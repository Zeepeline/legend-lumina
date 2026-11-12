// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Gelombang 13: Sinergi Perlengkapan, Taktik & Eksplorasi Malam', () => {
  test('Set perlengkapan, loadouts, buyback, dan custom pins terdefinisi', async ({ page }) => {
    await page.goto('http://localhost:8000');
    await page.waitForTimeout(1000);

    const check = await page.evaluate(() => {
      return {
        hasSets: typeof SETS !== 'undefined' && !!SETS.pemula && typeof activeSets === 'function',
        hasLoadouts: Array.isArray(S.loadouts) && S.loadouts.length === 3,
        hasBuyback: Array.isArray(S.buyback),
        hasPins: typeof S.pins === 'object'
      };
    });

    expect(check.hasSets).toBe(true);
    expect(check.hasLoadouts).toBe(true);
    expect(check.hasBuyback).toBe(true);
    expect(check.hasPins).toBe(true);
  });
});
