const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('setiap item di ITEMS memiliki deskripsi minimal 25 karakter', async ({ page }) => {
  const errors = await h.boot(page);
  const failures = await page.evaluate(() => {
    const fails = [];
    if (typeof ITEMS === 'undefined') return ['ITEMS tidak terdefinisi'];
    for (const [id, item] of Object.entries(ITEMS)) {
      if (!item.d || typeof item.d !== 'string' || item.d.trim().length < 25) {
        fails.push(`Item '${id}' deskripsi kurang dari 25 karakter: "${item.d || ''}" (${item.d ? item.d.length : 0})`);
      }
    }
    return fails;
  });

  expect(failures).toEqual([]);
  h.noErrors(errors);
});
