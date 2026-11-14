const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('setiap monster di ENEMY memiliki BESTIARY_TEXT[id].hab dan .tip yang valid', async ({ page }) => {
  const errors = await h.boot(page);
  const failures = await page.evaluate(() => {
    const fails = [];
    if (typeof ENEMY === 'undefined') return ['ENEMY tidak terdefinisi'];
    if (typeof BESTIARY_TEXT === 'undefined') return ['BESTIARY_TEXT tidak terdefinisi'];
    for (const id of Object.keys(ENEMY)) {
      const b = BESTIARY_TEXT[id];
      if (!b) {
        fails.push(`Monster '${id}' tidak memiliki entri di BESTIARY_TEXT`);
      } else {
        if (!b.hab || typeof b.hab !== 'string' || b.hab.trim().length === 0) {
          fails.push(`Monster '${id}' tidak memiliki field 'hab' yang valid`);
        }
        if (!b.tip || typeof b.tip !== 'string' || b.tip.trim().length === 0) {
          fails.push(`Monster '${id}' tidak memiliki field 'tip' yang valid`);
        }
      }
    }
    return fails;
  });

  expect(failures).toEqual([]);
  h.noErrors(errors);
});
