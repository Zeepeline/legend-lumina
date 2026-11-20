'use strict';
// Bab 5 "Kota Seribu Lentera" (perjalanan & kota, tanpa boss): longsor, Jalan Raya Lama, Kota Lumina, Kota Bawah, Arsip Akademi
// Tahap: 19 tanya Ratih → 20 bantu longsor → 21 jalan raya → 22 cari Rudi → 23 temui Lestari → 24 bahan dapur umum → 25 baca arsip (4) → 26 lapor Lestari → 27 selesai
const ARSIP = ['arsip_selene', 'arsip_rongga', 'arsip_bram', 'arsip_morgath'];
Object.assign(World.prototype, {
  spawnCh5() {
    const M = this.M, ox = M._ox || 0, oy = M._oy || 0; /* _ox/_oy: mode benua (koordinat global) */
    if (M.id === 'lake' && !S.flags.road_open) {
      this.ch5O = [ox, oy];
      this.slideWall = this.wall(760 + ox, 40 + oy, 120, 60);
      this.slideS = [[790, 96], [816, 84], [842, 92], [770, 110], [806, 112], [860, 104]].map(([x, y]) => [x + ox, y + oy]).map(([x, y]) => this.add.image(x, y, 'i_rock' in this.textures.list ? 'i_rock' : 'rock').setOrigin(.5, 1).setDepth(y));
    }
    if (M.id === 'kgate' && M._ox === undefined) this.ch5Enter('kgate');
  },
  ch5Enter(id) { // dipanggil saat masuk wilayah (mode benua: dari updBenua)
    if (id === 'kgate' && S.stage === 21) { S.stage = 22; updHud(); this.time.delayedCall(900, () => banner('Kota Seribu Lentera', 'BAB 5 · KOTA LUMINA', true, 3000)); saveGame(this); }
  },
  async clearSlide() {
    G.lock++;
    await talk('Pak Gun', ['Itu dia! Monster batu keluar lagi dari reruntuhan! Tolong, anak muda!']);
    G.lock--;
    sfx('roar'); this.camShake(300, .005);
    const [sox, soy] = this.ch5O || [0, 0];
    this.slideWave = [[700, 180], [940, 180], [820, 230]].map(([x, y]) => this.spawnEnemy('golem', x + sox, y + soy)); for (const e of this.slideWave) { e.hp = e.max = Math.round(e.hp * 1.6); }
    const chk = this.time.addEvent({ delay: 400, loop: true, callback: async () => {
      if (this.slideWave.some(e => e.hp > 0)) return;
      chk.remove(); S.flags.road_open = 1; this.slideWall.destroy(); sfx('boom'); this.camShake(400, .006);
      for (const s of this.slideS) this.tweens.add({ targets: s, alpha: 0, y: s.y - 10, duration: 700, onComplete: () => s.destroy() });
      S.stage = 21; updHud(); await sleep(700);
      await talk('Pak Gun', ['Terima kasih! Dengan monster itu pergi, batu-batu ini mudah disingkirkan.', 'Jalan Raya Lama terbuka lagi. Ikuti ke utara, Kota Lumina setengah hari perjalanan. Hati-hati, serigala suka mengikuti kafilah.']);
      banner('Tempuh Jalan Raya Lama', 'PERJALANAN', false, 2400); saveGame(this);
    } });
  },
  arsipRead(id) {
    if (S.stage !== 25 || !ARSIP.includes(id)) return;
    const n = ARSIP.filter(k => S.lore[k]).length;
    if (n < 4) banner('Catatan arsip ' + n + '/4', 'PENYELIDIKAN', false, 1500);
    else { S.stage = 26; updHud(); this.time.delayedCall(1600, () => banner('Ceritakan kepada Guru Lestari', 'PENYELIDIKAN', false, 2400)); saveGame(this); }
  },
  // Dialog cerita lama dinetralkan
  async ch5Talk() { return false; },
});
