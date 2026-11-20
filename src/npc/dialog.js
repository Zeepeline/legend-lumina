'use strict';
// Percakapan NPC fungsional & interaksi bersih (bebas dari dialog skenario cerita lama)
Object.assign(World.prototype, {
  npcHasQuest() {
    return false; // Seluruh quest cerita lama dinonaktifkan
  },
  async talkNpc(o) {
    const id = o.n.id, nm = o.n.name, pl = this.pl;
    const dir = Math.abs(pl.x - o.spr.x) > Math.abs(pl.y - o.spr.y) ? (pl.x > o.spr.x ? 'right' : 'left') : (pl.y > o.spr.y ? 'down' : 'up');
    if (o.walking) { o.spr.setVelocity(0); o.walking = false; }
    this.face(o, dir);

    // NPC dengan fungsi spesifik (Toko, Tempa, Penginapan, Hewan, Mini-game)
    switch (id) {
      case 'merchant': return this.shop();
      case 'smith': return this.smithy();
      case 'inn': return this.innTalk();
      case 'farmer':
        if (typeof this.openDirectBarter === 'function') return this.openDirectBarter();
        break;
      case 'ayam': return this.feedAnimal('Ayam Desa', 'berry', 'egg', 'Petooook');
      case 'domba': return this.feedAnimal('Domba Padang', 'veg', 'wool', 'Mbeeek');
      case 'chick_master': return this.startChickenRace();
      case 'dice_gambler': return this.playTavernDice(o.spr.x, o.spr.y);
      case 'arena_master': return this.talkArenaMaster();
      case 'night_merchant': return this.talkNightMerchant();
      case 'courier': return this.talkCourier();
      case 'auctioneer': return this.talkAuctioneer();
    }

    // NPC umum: sapaan mengambang ringan di dunia (tanpa jendela dialog pemblokir input)
    sfx('blip');
    const msg = pick(['Halo, petualang!', 'Selamat menikmati harimu.', 'Udara terasa begitu segar.', 'Hati-hati di jalan ya!']);
    popWorld(o.spr.x, o.spr.y - 20, nm + ': ' + msg, 'heal');
  },
  async shop() {
    G.lock++;
    for (; ;) {
      const rel = S.rel?.merchant || 0;
      const m = await choose({
        head: `Kios Bu Sari · ${S.gold} G`,
        x: 80, y: 50, w: 170,
        items: [
          { t: 'Beli' },
          { t: 'Jual barang' },
          { t: 'Keluar' }
        ],
        foot: (i) => ['Beli perbekalan petualang.', 'Jual hasil buruan & panen.', 'Tutup toko.'][i]
      });
      if (m === 0) {
        const items = ['potion', 'hipotion', 'antidote', 'ether', 'seed', 'seed_b', 'seed_h', 'seed_flower', 'leather_pouch', 'feed', 'rod', 'lockpick'];
        await buyMenu('Kios Bu Sari', items);
      } else if (m === 1) {
        await sellMenu();
      } else break;
    }
    G.lock--;
  },
  async smithy() {
    G.lock++;
    for (; ;) {
      const m = await choose({
        head: `Bengkel Pak Besi · ${S.gold} G`,
        x: 70, y: 50, w: 156,
        items: [
          { t: 'Beli perlengkapan' },
          { t: 'Tempa dengan bahan' },
          { t: 'Tingkatkan (+1)' },
          { t: 'Keluar' }
        ],
        foot: (i) => ['Beli senjata & zirah standar.', 'Tempa perlengkapan langka dengan bahan monster.', 'Tingkatkan stat perlengkapan (+1..+5).', 'Tutup bengkel.'][i]
      });
      if (m === 0) await buyMenu('Bengkel Pak Besi', ['isword', 'ispear', 'hbow', 'chain']);
      else if (m === 1) await forgeMenu();
      else if (m === 2) await upgradeMenu();
      else break;
    }
    G.lock--;
  },
  async innTalk() {
    G.lock++;
    const m = await choose({ head: 'Penginapan Bu Rina', x: 70, y: 50, w: 150, items: [{ t: 'Menginap', r: '10 G' }, { t: 'Masak' }, { t: 'Keluar' }] });
    if (m === 1) { await cookMenu(); G.lock--; return; }
    if (m === 0) {
      if (S.gold < 10) { sfx('buzz'); popWorld(this.pl.x, this.pl.y - 20, 'Uang tidak cukup (butuh 10 G)', 'crit'); }
      else {
        S.gold -= 10; await fadeTo(1); sleepToMorning(); const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; updHud(); sfx('heal');
        await sleep(500); await fadeTo(0); saveGame(this); sfx('save');
        popWorld(this.pl.x, this.pl.y - 20, 'Tidur nyenyak. HP & MP pulih!', 'heal');
      }
    }
    G.lock--;
  },
});
