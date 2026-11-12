// @ts-check
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test.describe('Gelombang 22 Features', () => {
  test.beforeEach(async ({ page }) => {
    await h.loadGame(page); // membuka game & memulai permainan baru
  });

  test('G22: Cek Pohon Bakat Keahlian Arka (#17) & Talents Initial State', async ({ page }) => {
    const talentCheck = await h.G(page, () => {
      return {
        hasTalentsState: !!S.talents,
        hasWarBranch: Array.isArray(S.talents?.war),
        hasMagBranch: Array.isArray(S.talents?.mag),
        hasExpBranch: Array.isArray(S.talents?.exp),
        hasTalentDefs: typeof TALENT_DEFS !== 'undefined',
        hasOpenTalentTree: typeof openTalentTree === 'function'
      };
    });
    expect(talentCheck.hasTalentsState).toBe(true);
    expect(talentCheck.hasWarBranch).toBe(true);
    expect(talentCheck.hasMagBranch).toBe(true);
    expect(talentCheck.hasExpBranch).toBe(true);
    expect(talentCheck.hasTalentDefs).toBe(true);
    expect(talentCheck.hasOpenTalentTree).toBe(true);
  });

  test('G22: Cek Raja Slime (#197) di ENEMY & Peta Meadow', async ({ page }) => {
    const enemyCheck = await h.G(page, () => {
      const kingSlime = ENEMY['king_slime'];
      const meadowEnemies = MAPS.meadow.enemies;
      const inMeadow = meadowEnemies.some(e => e[0] === 'king_slime');
      return {
        hasKingSlime: !!kingSlime,
        inMeadow
      };
    });
    expect(enemyCheck.hasKingSlime).toBe(true);
    expect(enemyCheck.inMeadow).toBe(true);
  });

  test('G22: Cek Kotak Bekal (#438) & Lilin Sarang Lebah (#425) di ITEMS & CRAFT', async ({ page }) => {
    const itemCheck = await h.G(page, () => {
      return {
        lunchbox: !!ITEMS['lunchbox'],
        candle: !!ITEMS['candle'],
        candleCraft: CRAFT.some(c => c.id === 'candle'),
        hasBentoState: Array.isArray(S.bento)
      };
    });
    expect(itemCheck.lunchbox).toBe(true);
    expect(itemCheck.candle).toBe(true);
    expect(itemCheck.candleCraft).toBe(true);
    expect(itemCheck.hasBentoState).toBe(true);
  });

  test('G22: Cek Pedagang Pasar Malam (#460) di Kota Bawah & Ikan Danau Dalam (#56)', async ({ page }) => {
    const cityLakeCheck = await h.G(page, () => {
      const kbawahNpcs = MAPS.kbawah.npcs;
      const hasNightMerchant = kbawahNpcs.some(n => n.id === 'night_merchant');
      return {
        hasNightMerchant,
        lakeCatfish: !!ITEMS['lake_catfish'],
        moonFish: !!ITEMS['moon_fish']
      };
    });
    expect(cityLakeCheck.hasNightMerchant).toBe(true);
    expect(cityLakeCheck.lakeCatfish).toBe(true);
    expect(cityLakeCheck.moonFish).toBe(true);
  });
});
