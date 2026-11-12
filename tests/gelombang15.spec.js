import { test, expect } from '@playwright/test';
import * as h from './helpers.js';

test.describe('Gelombang 15 - Eksplorasi, Kotak Surat, & Kenyamanan Tempur', () => {
  test('Sistem Gelombang 15 terdaftar dan berfungsi dengan benar', async ({ page }) => {
    await h.loadGame(page);

    // 1. Cek State Default untuk Kotak Surat, Toko, & Senjata Cadangan
    const stateCheck = await h.G(page, () => {
      return {
        hasMail: Array.isArray(S.mail),
        hasReadMail: typeof S.readMail === 'object',
        hasSpent: typeof S.spent === 'object',
        altWpnField: 'altWpn' in S.eq
      };
    });
    expect(stateCheck.hasMail).toBe(true);
    expect(stateCheck.hasReadMail).toBe(true);
    expect(stateCheck.hasSpent).toBe(true);
    expect(stateCheck.altWpnField).toBe(true);

    // 2. Cek Tukar Cepat Senjata (#372)
    const swapCheck = await h.G(page, () => {
      S.inv.isword = 1;
      S.eq.wpn = 'wsword';
      S.eq.altWpn = 'isword';
      if (typeof G.scene.swapWeapon === 'function') {
        G.scene.swapWeapon();
        return { curWpn: S.eq.wpn, altWpn: S.eq.altWpn };
      }
      return null;
    });
    expect(swapCheck).not.toBeNull();
    expect(swapCheck.curWpn).toBe('isword');
    expect(swapCheck.altWpn).toBe('wsword');

    // 3. Cek Kotak Surat Rumah Arka (#485)
    const mailboxCheck = await h.G(page, () => {
      return {
        hasMailboxObj: !!OBJ.mailbox,
        hasBrokenbridgeObj: !!OBJ.brokenbridge,
        hasMailFn: typeof openMailbox === 'function'
      };
    });
    expect(mailboxCheck.hasMailboxObj).toBe(true);
    expect(mailboxCheck.hasBrokenbridgeObj).toBe(true);
    expect(mailboxCheck.hasMailFn).toBe(true);

    // 4. Cek Pencapaian Baru & Gelar Ekstra (#94)
    const achCheck = await h.G(page, () => {
      const achIds = ACH.map(a => a.id);
      const titleKeys = Object.keys(TITLES);
      return {
        hasBridgeAch: achIds.includes('bridge1'),
        hasMineAch: achIds.includes('mine5'),
        hasBarrelAch: achIds.includes('barrel3'),
        hasSocketAch: achIds.includes('socket1'),
        hasBridgeTitle: titleKeys.includes('Pembuka Rintangan'),
        hasHammerTitle: titleKeys.includes('Si Palu Batu')
      };
    });
    expect(achCheck.hasBridgeAch).toBe(true);
    expect(achCheck.hasMineAch).toBe(true);
    expect(achCheck.hasBarrelAch).toBe(true);
    expect(achCheck.hasSocketAch).toBe(true);
    expect(achCheck.hasBridgeTitle).toBe(true);
    expect(achCheck.hasHammerTitle).toBe(true);

    // 5. Cek Info Sumber Item (#376)
    const srcCheck = await h.G(page, () => {
      return {
        oreSrc: !!ITEMS.ore?.src,
        shardSrc: !!ITEMS.shard?.src,
        honeySrc: !!ITEMS.honey?.src
      };
    });
    expect(srcCheck.oreSrc).toBe(true);
    expect(srcCheck.shardSrc).toBe(true);
    expect(srcCheck.honeySrc).toBe(true);
  });
});
