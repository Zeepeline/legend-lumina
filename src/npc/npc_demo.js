'use strict';
// Pembantu uji visual animasi NPC (konsol): __game.sc.npcDemo() menaruh barisan NPC di dekat pemain, tiap NPC memainkan satu aksi; npcDemoClear() menghapus.
const NPC_DEMO_ACTS = ['talk', 'wary', 'cheer', 'panic', 'mourn', 'pray', 'hurt', 'fall', 'die', 'captive', 'offer', 'walk'];
const NPC_DEMO_CH = ['mila', 'elder', 'girl', 'farmer', 'guard', 'child'];
Object.assign(World.prototype, {
  /* chs: array ch (default 6 contoh), acts: array aksi (default semua). 2 baris x 6, pemain di tengah. */
  npcDemo(chs, acts) {
    this.npcDemoClear();
    const C = chs && chs.length ? chs : NPC_DEMO_CH, L = acts && acts.length ? acts : NPC_DEMO_ACTS, pl = this.pl, out = [];
    L.forEach((act, i) => {
      const ch = C[i % C.length]; if (!this.textures.exists('ch_' + ch)) return;
      const x = Math.round(pl.x - 70 + (i % 6) * 28), y = Math.round(pl.y - 44 + Math.floor(i / 6) * 76);
      this.spawnNpc({ id: 'demo_' + i, ch, name: 'Demo', x, y, dir: 'down', still: true });
      const o = this.npcs[this.npcs.length - 1]; o.demo = true; this.npcBrainInit(o);
      const opts = act === 'walk' ? { to: { x: x + 30, y: y + 6 }, dur: 8 } : act === 'panic' ? { dur: 6 } : { hold: true };
      this.npcAct(o, act, opts); out.push(o);
    });
    return out.length;
  },
  npcDemoClear() {
    for (const o of this.npcs.filter(n => n.demo)) {
      this.npcActEnd(o); this.npcEmoteClear(o);
      for (const k of ['spr', 'sh', 'mark', 'emo', 'bub']) if (o[k] && o[k].destroy) o[k].destroy();
      this.npcs.splice(this.npcs.indexOf(o), 1);
      const i = this.inter.findIndex(v => v.npc === o); if (i >= 0) this.inter.splice(i, 1);
    }
  },
});
