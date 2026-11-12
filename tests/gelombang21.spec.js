// @ts-check
const { test, expect } = require('@playwright/test');
const h = require('./helpers');

test.describe('Gelombang 21 Features', () => {
  test.beforeEach(async ({ page }) => {
    await h.loadGame(page); // membuka game & memulai permainan baru
  });

  test('G21: Cek Batangan Logam di ITEMS dan CRAFT', async ({ page }) => {
    const hasItems = await h.G(page, () => {
      return {
        iron_bar: !!ITEMS['iron_bar'],
        crystal_bar: !!ITEMS['crystal_bar']
      };
    });
    expect(hasItems.iron_bar).toBe(true);
    expect(hasItems.crystal_bar).toBe(true);

    const hasCraft = await h.G(page, () => {
      return {
        hasIronCraft: CRAFT.some(c => c.id === 'iron_bar'),
        hasCrystCraft: CRAFT.some(c => c.id === 'crystal_bar')
      };
    });
    expect(hasCraft.hasIronCraft).toBe(true);
    expect(hasCraft.hasCrystCraft).toBe(true);
  });

  test('G21: Cek Papan Buronan di Gerbang Kota & Map Enemies', async ({ page }) => {
    const checkBounty = await h.G(page, () => {
      const kgateObjs = MAPS.kgate.objs;
      const hasBoard = kgateObjs.some(o => o[0] === 'bounty_board');
      return {
        hasBoard,
        bountyWolf: !!ENEMY['bounty_wolf'],
        bountyFrog: !!ENEMY['bounty_frog'],
        bountyGargoyle: !!ENEMY['bounty_gargoyle']
      };
    });
    expect(checkBounty.hasBoard).toBe(true);
    expect(checkBounty.bountyWolf).toBe(true);
    expect(checkBounty.bountyFrog).toBe(true);
    expect(checkBounty.bountyGargoyle).toBe(true);
  });

  test('G21: Cek Pengawas Arena di Kota Bawah & Status Arena Rank', async ({ page }) => {
    const arenaCheck = await h.G(page, () => {
      const kbawahNpcs = MAPS.kbawah.npcs;
      const hasArenaMaster = kbawahNpcs.some(n => n.id === 'arena_master');
      return {
        hasArenaMaster,
        arenaRank: S.arenaRank !== undefined
      };
    });
    expect(arenaCheck.hasArenaMaster).toBe(true);
    expect(arenaCheck.arenaRank).toBe(true);
  });

  test('G21: Cek Buff Bugar & Desain Rumah di S.homeStyle', async ({ page }) => {
    const homeCheck = await h.G(page, () => {
      return {
        buffRested: !!BUFF.rested,
        hasHomeStyle: !!S.homeStyle,
        hasBedCozy: !!FCAT['bed_cozy']
      };
    });
    expect(homeCheck.buffRested).toBe(true);
    expect(homeCheck.hasHomeStyle).toBe(true);
    expect(homeCheck.hasBedCozy).toBe(true);
  });
});
