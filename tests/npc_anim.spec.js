// Animasi NPC (docs/NPC_ANIM.md). Playwright belum terpasang di lingkungan pembuat; spesifikasi ini belum pernah dijalankan.
const { test, expect } = require('@playwright/test');
const { boot, newGame, G, noErrors } = require('./helpers');

test('aksi NPC: mulai, menetap, berakhir bersih', async ({ page }) => {
  const errors = await boot(page); await newGame(page);
  const r = await G(page, async () => {
    const sc = window.__game.sc, o = sc.npcs.find(n => n.ch === 'girl') || sc.npcs[0], out = {};
    sc.npcAct(o, 'mourn'); out.mourn = sc.npcActName(o);
    sc.npcAct(o, 'die', { from: sc.pl }); await new Promise(r => setTimeout(r, 900)); out.die = sc.npcActName(o) + ':' + o.spr.frame.name;
    sc.npcActEnd(o); out.end = sc.npcActName(o);
    sc.npcAct(o, 'captive'); out.chain = o.act.fx.length; sc.npcActEnd(o);
    sc.npcEmote(o, 'tear', 1); out.bub = !!o.bub;
    out.demo = sc.npcDemo(); sc.npcDemoClear(); out.lock = window.__game.G.lock;
    return out;
  });
  expect(r.mourn).toBe('mourn'); expect(r.die).toBe('die:lie'); expect(r.end).toBe(null);
  expect(r.chain).toBe(1); expect(r.bub).toBe(true); expect(r.demo).toBeGreaterThan(5); expect(r.lock).toBe(0);
  noErrors(errors);
});

test('talkNpc menyalakan lalu membersihkan aksi talk', async ({ page }) => {
  const errors = await boot(page); await newGame(page);
  const r = await G(page, async () => {
    const sc = window.__game.sc, o = sc.npcs.find(n => n.n.id === 'girl') || sc.npcs[0];
    const p = sc.talkNpc(o), mid = sc.npcActName(o); await p; await new Promise(r => setTimeout(r, 1600));
    return [mid, sc.npcActName(o)];
  });
  expect(r[0]).toBe('talk'); expect(r[1]).toBe(null);
  noErrors(errors);
});
