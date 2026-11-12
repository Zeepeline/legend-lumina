import { test, expect } from '@playwright/test';
import * as h from './helpers.js';

test.describe('Gelombang 14 - Penambangan, Permata Soket, Rintangan, & Fitur Lanjutan', () => {
  test('Sistem Gelombang 14 terdaftar dan berfungsi dengan benar', async ({ page }) => {
    await h.loadGame(page);

    // 1. Cek State Default & Socket
    const stateCheck = await h.G(page, () => {
      return {
        hasSocket: typeof S.socket === 'object',
        hasDailyFeats: typeof S.dailyFeats === 'object',
        hasNewItems: typeof S.newItems === 'object',
        hasMinedStat: typeof S.st?.mined === 'number'
      };
    });
    expect(stateCheck.hasSocket).toBe(true);
    expect(stateCheck.hasDailyFeats).toBe(true);
    expect(stateCheck.hasNewItems).toBe(true);
    expect(stateCheck.hasMinedStat).toBe(true);

    // 2. Cek Penambahan Item Baru Menandai S.newItems
    const newBadgeCheck = await h.G(page, () => {
      addItem('ore', 2);
      const isNew = !!S.newItems['ore'];
      return { isNew, qty: S.inv['ore'] };
    });
    expect(newBadgeCheck.isNew).toBe(true);
    expect(newBadgeCheck.qty).toBeGreaterThanOrEqual(2);

    // 3. Cek Tantangan Harian (Daily Feats)
    const dailyFeatsCheck = await h.G(page, () => {
      if (typeof DAILY_FEATS_DEF !== 'undefined') {
        return {
          keys: Object.keys(DAILY_FEATS_DEF),
          hasOpenFn: typeof openDailyFeats === 'function'
        };
      }
      return null;
    });
    expect(dailyFeatsCheck).not.toBeNull();
    expect(dailyFeatsCheck.keys.length).toBeGreaterThan(0);
    expect(dailyFeatsCheck.hasOpenFn).toBe(true);

    // 4. Cek Efek Soket Permata pada Status
    const socketStatCheck = await h.G(page, () => {
      S.eq.wpn = 'wsword';
      S.socket = S.socket || {};
      S.socket['wsword'] = 'ore'; // Memberikan bonus serang +3
      const s1 = stat();
      delete S.socket['wsword'];
      const s0 = stat();
      return { diffAtk: s1.atk - s0.atk };
    });
    expect(socketStatCheck.diffAtk).toBe(3);

    // 5. Cek Objek minestone & bombbarrel di OBJ
    const objCheck = await h.G(page, () => {
      return {
        hasMinestone: !!OBJ.minestone,
        hasBombbarrel: !!OBJ.bombbarrel,
        hasBramble: !!OBJ.bramble
      };
    });
    expect(objCheck.hasMinestone).toBe(true);
    expect(objCheck.hasBombbarrel).toBe(true);
    expect(objCheck.hasBramble).toBe(true);
  });
});
