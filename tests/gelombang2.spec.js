const { test, expect } = require('@playwright/test');
const h = require('./helpers');
test('gelombang 2: slot, riwayat, tips, peta mini', async ({ page }) => {
  await h.boot(page); await h.newGame(page);
  const r = await page.evaluate(() => {
    const sc = window.__game.sc; say('Halo uji', 'Tes');
    setSlot(2); saveGame(sc); const info = slotInfo(2); setSlot(0);
    for (let i = 0; i < 5; i++) { sc.tipT = 0; G.lock = null; sc.updTips(1); }
    OPT.mini = true; sc.miniT = 0; sc.updMinimap(1);
    return { log: DLG_LOG.some(l => (l.t || l.text || JSON.stringify(l)).includes('Halo uji')), slot: !!info, tips: Object.keys(S.tipsDone).length, mini: !!document.getElementById('mini') };
  });
  expect(r.log).toBe(true); expect(r.slot).toBe(true); expect(r.tips).toBeGreaterThan(0); expect(r.mini).toBe(true);
});
