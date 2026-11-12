// @ts-check
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test.describe('Gelombang 23 Features', () => {
  test.beforeEach(async ({ page }) => {
    await h.goto(page);
    await h.startNewGame(page);
  });

  test('G23: Cek Opsi Layout Skala & Padding Tombol Virtual (#74)', async ({ page }) => {
    const optCheck = await h.G(page, () => {
      return {
        hasBtnScale: OPT.btnScale !== undefined,
        hasBtnPad: OPT.btnPad !== undefined
      };
    });
    expect(optCheck.hasBtnScale).toBe(true);
    expect(optCheck.hasBtnPad).toBe(true);
  });

  test('G23: Cek Dapur Rumah Arka (#497) & Pewarna Bunga (#418)', async ({ page }) => {
    const craftHomeCheck = await h.G(page, () => {
      const homeItems = S.home?.items || [];
      const hasStove = homeItems.some(i => i.t === 'stove');
      return {
        hasStove,
        hasDyeRed: !!ITEMS['dye_red'],
        hasDyeBlue: !!ITEMS['dye_blue'],
        hasDyeGold: !!ITEMS['dye_gold'],
        hasDyePurple: !!ITEMS['dye_purple'],
        dyeCraft: CRAFT.some(c => c.id === 'dye_red')
      };
    });
    expect(craftHomeCheck.hasStove).toBe(true);
    expect(craftHomeCheck.hasDyeRed).toBe(true);
    expect(craftHomeCheck.hasDyeBlue).toBe(true);
    expect(craftHomeCheck.hasDyeGold).toBe(true);
    expect(craftHomeCheck.hasDyePurple).toBe(true);
    expect(craftHomeCheck.dyeCraft).toBe(true);
  });

  test('G23: Cek Skuad Goblin Pemanah & Dukun (#181 & #183)', async ({ page }) => {
    const enemyCheck = await h.G(page, () => {
      return {
        hasArcher: !!ENEMY['goblin_archer'],
        hasShaman: !!ENEMY['goblin_shaman'],
        inMeadowArcher: MAPS.meadow.enemies.some(e => e[0] === 'goblin_archer'),
        inMeadowShaman: MAPS.meadow.enemies.some(e => e[0] === 'goblin_shaman')
      };
    });
    expect(enemyCheck.hasArcher).toBe(true);
    expect(enemyCheck.hasShaman).toBe(true);
    expect(enemyCheck.inMeadowArcher).toBe(true);
    expect(enemyCheck.inMeadowShaman).toBe(true);
  });

  test('G23: Cek Kurir Kilat (#442) & Balai Lelang (#40)', async ({ page }) => {
    const npcCheck = await h.G(page, () => {
      const kgateNpcs = MAPS.kgate.npcs;
      const kpasarNpcs = MAPS.kpasar.npcs;
      const hasCourier = kgateNpcs.some(n => n.id === 'courier');
      const hasAuctioneer = kpasarNpcs.some(n => n.id === 'auctioneer');
      return {
        hasCourier,
        hasAuctioneer,
        hasCourierParcel: !!ITEMS['courier_parcel'],
        hasAntiqueRelic: !!ITEMS['antique_relic']
      };
    });
    expect(npcCheck.hasCourier).toBe(true);
    expect(npcCheck.hasAuctioneer).toBe(true);
    expect(npcCheck.hasCourierParcel).toBe(true);
    expect(npcCheck.hasAntiqueRelic).toBe(true);
  });
});
