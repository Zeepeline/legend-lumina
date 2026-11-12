import { test, expect } from '@playwright/test';
import * as h from './helpers.js';

test.describe('Gelombang 17 - Peti Mimic, Slime Emas, Jimat Kepulangan, & Debug Menu', () => {
  test('Sistem Gelombang 17 terdaftar dan berfungsi dengan benar', async ({ page }) => {
    await h.loadGame(page);

    // 1. Cek Musuh Baru di ENEMY
    const enemyCheck = await h.G(page, () => {
      return {
        hasMimic: !!ENEMY.mimic,
        hasGoldSlime: !!ENEMY.gold_slime
      };
    });
    expect(enemyCheck.hasMimic).toBe(true);
    expect(enemyCheck.hasGoldSlime).toBe(true);

    // 2. Cek Item Baru di ITEMS (Hearthstone & Serangga)
    const itemCheck = await h.G(page, () => {
      return {
        hasHearthstone: !!ITEMS.hearthstone,
        hasBugBeetle: !!ITEMS.bug_beetle,
        hasBugButterfly: !!ITEMS.bug_butterfly,
        hasBugDragonfly: !!ITEMS.bug_dragonfly,
        hasBugFirefly: !!ITEMS.bug_firefly
      };
    });
    expect(itemCheck.hasHearthstone).toBe(true);
    expect(itemCheck.hasBugBeetle).toBe(true);
    expect(itemCheck.hasBugButterfly).toBe(true);
    expect(itemCheck.hasBugDragonfly).toBe(true);
    expect(itemCheck.hasBugFirefly).toBe(true);

    // 3. Cek Perabot Rak Trofi di FCAT
    const fcatCheck = await h.G(page, () => {
      return {
        hasTrophyShelf: !!FCAT.trophy
      };
    });
    expect(fcatCheck.hasTrophyShelf).toBe(true);

    // 4. Cek Menu Pengembang / Debug Menu Function
    const debugCheck = await h.G(page, () => {
      return {
        hasDebugFn: typeof openDebugMenu === 'function'
      };
    });
    expect(debugCheck.hasDebugFn).toBe(true);

    // 5. Cek Kompas Arah di DOM HUD
    const compassCheck = await h.G(page, () => {
      const compEl = document.getElementById('hCompass');
      return {
        hasCompass: !!compEl,
        compassText: compEl ? compEl.textContent : ''
      };
    });
    expect(compassCheck.hasCompass).toBe(true);
    expect(compassCheck.compassText).toContain('🧭');
  });
});
