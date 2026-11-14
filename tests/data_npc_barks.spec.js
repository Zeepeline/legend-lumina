const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test('setiap NPC di semua MAPS memiliki entri NPC_BARKS yang valid', async ({ page }) => {
  const errors = await h.boot(page);
  const failures = await page.evaluate(() => {
    const fails = [];
    for (const [mapId, map] of Object.entries(MAPS)) {
      if (!map.npcs || !Array.isArray(map.npcs)) continue;
      for (const npc of map.npcs) {
        const barks = (typeof NPC_BARKS !== 'undefined') && (NPC_BARKS[npc.id] || (npc.ch && NPC_BARKS[npc.ch]));
        if (!barks || !Array.isArray(barks) || barks.length === 0) {
          fails.push(`Map ${mapId}: NPC ${npc.id} (ch: ${npc.ch || '-'}) tidak memiliki NPC_BARKS`);
        }
      }
    }
    return fails;
  });

  expect(failures).toEqual([]);
  h.noErrors(errors);
});
