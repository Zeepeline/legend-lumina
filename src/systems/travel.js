'use strict';
// Teleport: patung batu di tiap wilayah. Sentuh untuk mengaktifkan, lalu pindah instan ke patung lain yang aktif.
const WARPS = {
  village: [548, 604], forest: [670, 162], meadow: [230, 372], cave: [166, 760], swamp: [672, 172],
  snow: [680, 1052], lake: [1080, 440], kpasar: [860, 1060], deepwood: [700, 420], river: [1240, 860]
};
for (const id in WARPS) { const M = MAPS[id]; (M.discs = M.discs || []).push([WARPS[id][0], WARPS[id][1], 22]); }
Object.assign(World.prototype, {
  spawnWarp() {
    const W = WARPS[this.M.id]; if (!W) return; const [x, y] = W, on = !!S.warps[this.M.id];
    this.warpS = this.add.image(x, y, on ? 'warp1' : 'warp0').setOrigin(.5, 1).setDepth(y); this.shadow(x, y, 8, 3); this.wall(x - 7, y - 7, 14, 7);
    this.lights.push({ x, y: y - 14, small: !on });
    this.inter.push({ x, y: y + 4, r: 16, fn: () => this.useWarp() });
  },
  async useWarp() {
    const id = this.M.id; G.lock++;
    try {
      if (!S.warps[id]) {
        S.warps[id] = 1; this.warpS.setTexture('warp1'); sfx('save'); this.sparkle(WARPS[id][0], WARPS[id][1] - 16, 'dot', 18);
        banner('Patung Teleport aktif', MAPS[id].name, false, 1800); saveGame(this);
        await say('Rune di patung menyala biru. Sekarang kamu bisa teleport ke sini dari patung lain.');
      }
      const list = Object.keys(WARPS).filter(k => S.warps[k] && k !== id);
      if (!list.length) { await say('Belum ada patung lain yang aktif. Temukan patung serupa di wilayah lain!'); return; }
      const r = await choose({ head: 'TELEPORT', x: 60, y: 40, w: 170, items: [...list.map(k => ({ t: MAPS[k].name })), { t: 'Batal' }] });
      if (r < 0 || r >= list.length) return;
      const k = list[r]; sfx('ice'); this.cameras.main.flash(250, 180, 220, 255);
      await sleep(250); this.goto(k, WARPS[k][0], WARPS[k][1] + 18, 'down');
    } finally { G.lock--; }
  },
});
