import { test, expect } from '@playwright/test';
import * as h from './helpers.js';

test.describe('Gelombang 16 - Ensiklopedia, Alkimia, Senjata Legendaris, & Pasang Terbaik', () => {
  test('Sistem Gelombang 16 terdaftar dan berfungsi dengan benar', async ({ page }) => {
    await h.loadGame(page);

    // 1. Cek State Default untuk Alkimia & Pemandangan
    const stateCheck = await h.G(page, () => {
      return {
        hasAlchemy: typeof S.alchemyRecipes === 'object',
        hasViewpoints: typeof S.viewpoints === 'object'
      };
    });
    expect(stateCheck.hasAlchemy).toBe(true);
    expect(stateCheck.hasViewpoints).toBe(true);

    // 2. Cek 5 Senjata Legendaris di ITEMS
    const legCheck = await h.G(page, () => {
      const legs = ['leg_sun', 'leg_shadow', 'leg_quake', 'leg_frost', 'leg_moon'];
      return {
        allExist: legs.every(id => !!ITEMS[id] && ITEMS[id].k === 'wpn')
      };
    });
    expect(legCheck.allExist).toBe(true);

    // 3. Cek Formula Alkimia & Ramuan Baru
    const alchemyCheck = await h.G(page, () => {
      return {
        hasElixir: !!ITEMS.elixir_life,
        hasAgility: !!ITEMS.potion_agility,
        hasFrost: !!ITEMS.potion_frostcloak,
        hasNight: !!ITEMS.potion_nightvision,
        hasFailed: !!ITEMS.potion_failed,
        hasOpenFn: typeof openAlchemyTable === 'function'
      };
    });
    expect(alchemyCheck.hasElixir).toBe(true);
    expect(alchemyCheck.hasAgility).toBe(true);
    expect(alchemyCheck.hasFrost).toBe(true);
    expect(alchemyCheck.hasNight).toBe(true);
    expect(alchemyCheck.hasFailed).toBe(true);
    expect(alchemyCheck.hasOpenFn).toBe(true);

    // 4. Cek Ensiklopedia Benua Lumina
    const encyCheck = await h.G(page, () => {
      return {
        hasEncyFn: typeof openEncyclopedia === 'function',
        hasFlora: typeof CODEX_FLORA !== 'undefined',
        hasFauna: typeof CODEX_FAUNA !== 'undefined',
        hasMineral: typeof CODEX_MINERAL !== 'undefined'
      };
    });
    expect(encyCheck.hasEncyFn).toBe(true);
    expect(encyCheck.hasFlora).toBe(true);
    expect(encyCheck.hasFauna).toBe(true);
    expect(encyCheck.hasMineral).toBe(true);

    // 5. Cek Objek Baru di Dunia
    const objCheck = await h.G(page, () => {
      return {
        hasScenicBench: !!OBJ.scenicbench,
        hasAlchemyTable: !!OBJ.alchemytable
      };
    });
    expect(objCheck.hasScenicBench).toBe(true);
    expect(objCheck.hasAlchemyTable).toBe(true);
  });
});
