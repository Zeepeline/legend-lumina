'use strict';
// Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async harvestRiverOrchid(ox, oy) {
    if (this._harvestingOrchid) return;
    this._harvestingOrchid = true;
    G.lock++;

    sfx('water');
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 90, () => {
        this.sparkle(ox + rnd(-8, 8), oy - rnd(4, 18), [0x58a8f0, 0x9ad0ff, 0xffffff][i % 3]);
      });
    }
    await sleep(400);

    addItem('river_orchid', 1);
    updHud();
    sfx('chest');
    popWorld(ox, oy - 22, '🌸 Anggrek Biru Air (+35 MP)!', 'crit');
    await say('Kamu memetik bunga anggrek biru air yang mekar segar di sela batu kali berlumut.\nAroma semerbaknya menyerap kesegaran air sungai, mampu menjernihkan pikiran dan meredakan lelah (+1 Anggrek Biru Air)!', 'Anggrek Sungai');

    this._harvestingOrchid = false;
    G.lock--;
  },
});
