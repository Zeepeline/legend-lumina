const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('semua pencapaian di ACH memiliki ID unik dan ok() tidak melempar error pada state baru', async ({ page }) => {
  const errors = await h.boot(page);
  const failures = await page.evaluate(() => {
    const fails = [];
    if (typeof ACH === 'undefined' || !Array.isArray(ACH)) return ['ACH tidak terdefinisi atau bukan array'];
    const seenIds = new Set();
    for (const a of ACH) {
      if (!a.id) {
        fails.push(`Pencapaian '${a.n || 'tanpa nama'}' tidak memiliki ID`);
      } else if (seenIds.has(a.id)) {
        fails.push(`Duplikasi pencapaian dengan ID '${a.id}'`);
      }
      seenIds.add(a.id);

      if (typeof a.ok !== 'function') {
        fails.push(`Pencapaian '${a.id}' tidak memiliki fungsi ok()`);
      } else {
        try {
          const res = a.ok();
          if (typeof res !== 'boolean') {
            fails.push(`Pencapaian '${a.id}' fungsi ok() mengembalikan tipe bukan boolean: ${typeof res}`);
          }
        } catch (e) {
          fails.push(`Pencapaian '${a.id}' fungsi ok() melempar error: ${e.message}`);
        }
      }
    }
    return fails;
  });

  expect(failures).toEqual([]);
  h.noErrors(errors);
});
