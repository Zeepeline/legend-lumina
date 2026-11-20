'use strict';
// Event & aktivitas Kota Lumina: Gelanggang Tarung (Arena), Pasar Malam, Ekspedisi Kurir, Balai Lelang
Object.assign(World.prototype, {
  async talkArenaMaster() {
    G.lock++;
    try {
      const rank = S.arenaRank || 0;
      const rankTitles = ['Petarung Baru', 'Gladiator Kota', 'Juara Gelanggang'];
      const rankTitle = rankTitles[Math.min(2, rank)];
      const r = await choose({
        head: `Gelanggang Tarung Kota Lumina (${rankTitle})`,
        x: 40, y: 50, w: 230,
        items: [
          { t: '⚔ Mulai Ujian 3 Gelombang', r: 'Biaya 20 G' },
          { t: 'Tanya Peraturan Gelanggang' },
          { t: 'Kembali' }
        ],
        foot: i => ['Hadapi 3 gelombang musuh bertahap tanpa jeda!', 'Pelajari aturan dan hadiah gelanggang', ''][i] || ''
      });
      if (r === 0) {
        if (S.gold < 20) {
          sfx('buzz');
          await say('Biaya pendaftaran gelanggang adalah 20 G. Kumpulkan uang dulu, kawan!', 'Pengawas Gelanggang');
          return;
        }
        S.gold -= 20;
        updHud();
        await say('Bagus! Bersiaplah, pintu gelanggang ditutup! Kalahkan 3 gelombang monster!', 'Pengawas Gelanggang');
        await this.startCityArena();
      } else if (r === 1) {
        await talk('Pengawas Gelanggang', [
          'Di gelanggang ini, kamu akan menghadapi 3 gelombang monster tanpa istirahat.',
          'Gelombang 1: Slime Merah & Tawon.\nGelombang 2: Serigala & Tengkorak.\nGelombang 3: Golem Kuat & Babi Hutan.',
          'Jika berhasil bertahan dan menumbangkan semuanya, kamu berhak membawa pulang 250 G, Medali Gladiator, dan Gelar Juara Gelanggang!'
        ]);
      }
    } finally {
      G.lock--;
    }
  },
  async startCityArena() {
    banner('GELOMBANG 1 / 3', 'ARENA DIMULAI', true, 2000);
    playBGM('boss');
    sfx('warn');
    const spawnEnemy = (type, x, y) => {
      this.spawnEnemy(type, x, y);
    };

    // Wave 1
    spawnEnemy('slimer', 650, 640);
    spawnEnemy('bee', 750, 640);
    spawnEnemy('bee', 700, 760);

    const waitWaveClear = () => new Promise(res => {
      const timer = this.time.addEvent({
        delay: 500,
        loop: true,
        callback: () => {
          const alive = this.enemies.filter(e => e.hp > 0).length;
          if (alive === 0 || this.pl.dead) {
            timer.remove();
            res(!this.pl.dead);
          }
        }
      });
    });

    let ok = await waitWaveClear();
    if (!ok) return;

    // Wave 2
    banner('GELOMBANG 2 / 3', 'ARENA BERLANJUT', true, 2000);
    sfx('warn');
    spawnEnemy('wolf', 620, 660);
    spawnEnemy('wolf', 760, 660);
    spawnEnemy('skel', 700, 780);

    ok = await waitWaveClear();
    if (!ok) return;

    // Wave 3
    banner('GELOMBANG 3 / 3', 'GELOMBANG TERAKHIR', true, 2200);
    sfx('fanfare');
    spawnEnemy('golem', 700, 680);
    spawnEnemy('boar', 640, 740);
    spawnEnemy('boar', 760, 740);

    ok = await waitWaveClear();
    if (!ok) return;

    // Menang Arena!
    S.arenaRank = Math.max(S.arenaRank || 0, 1);
    S.gold += 250;
    S.exp += 300;
    S.titles = S.titles || [];
    if (!S.titles.includes('Juara Gelanggang')) {
      S.titles.push('Juara Gelanggang');
    }
    sfx('fanfare');
    banner('ARENA BERHASIL DITAKLUKKAN!', 'JUARA GELANGGANG', true, 3000);
    updHud();
    playBGM(bgmFor(this.M));
    await say(
      'LUAR BIASA! Seluruh penonton bersorak! Kamu menaklukkan 3 gelombang arena!\nKamu menerima 250 G, 300 EXP, dan gelar: Juara Gelanggang!',
      'Pengawas Gelanggang'
    );
  },
  async talkNightMerchant() {
    const isNight = S.time >= 19 || S.time < 5;
    if (!isNight) {
      await say('Ssst... Kios kami baru buka saat malam tiba (jam 19.00 - 05.00). Datanglah nanti saat lentera menyala!', 'Pedagang Pasar Malam');
      return;
    }
    G.lock++;
    try {
      const items = ['amethyst_gem', 'fbomb', 'candle', 'lunchbox', 'seed_flower', 'leather_pouch'];
      await buyMenu('Pasar Malam Eksotis Lumina', items);
    } finally {
      G.lock--;
    }
  },
  async talkCourier() {
    G.lock++;
    try {
      if (has('courier_parcel')) {
        await say('Kamu masih memegang paket kilat yang belum diantarkan! Segera kirimkan ke penerima sebelum waktu habis!', 'Budi Kurir Kilat');
        return;
      }
      const r = await choose({
        head: 'Loket Ekspedisi Kilat Lumina',
        items: [
          { t: '📦 Ambil Tugas Antar ke Tetua Bram (Desa)', r: 'Hadiah: 150 G' },
          { t: 'Tanya Cara Kerja Kurir' },
          { t: 'Tutup' }
        ],
        foot: i => ['Antar paket kilat dalam 180 detik ke Desa Lumina!', 'Pelajari sistem kurir kilat', ''][i] || ''
      });
      if (r === 0) {
        addItem('courier_parcel', 1);
        S.courierTimer = { target: 'elder', time: 180 };
        sfx('chest');
        updHud();
        banner('MISI KURIR DIMULAI!', 'ANTAR KE TETUA BRAM', true, 2200);
        await say('Terima kasih! Paket ini sangat mendesak. Bawa ke Tetua Bram di Desa Lumina secepatnya!', 'Budi Kurir Kilat');
      } else if (r === 1) {
        await talk('Budi Kurir Kilat', [
          'Kami melayani pengantaran surat dan bahan berharga antarkota dan desa.',
          'Waktu sangat berharga bagi seorang kurir! Pastikan kamu tiba di tempat penerima sebelum paket kedaluwarsa.',
          'Selesaikan tugas dan kamu akan diberi imbalan koin melimpah!'
        ]);
      }
    } finally {
      G.lock--;
    }
  },
  async talkAuctioneer() {
    G.lock++;
    try {
      await say('Selamat datang di Balai Lelang Pasar Lumina! Hari ini kami melelang: Artefak Kuno Aurel bertatahkan emas!', 'Juru Lelang Bastian');
      let bid = 120;
      for (let round = 1; round <= 3; round++) {
        const choice = await choose({
          head: `LELANG ARTEFAK KUNO (Tawaran: ${bid} G)`,
          items: [
            { t: `Naikkan Tawaran +20 G (${bid + 20} G)` },
            { t: `Naikkan Tawaran +50 G (${bid + 50} G)` },
            { t: 'Mundur dari Lelang' }
          ]
        });
        if (choice === 0) bid += 20;
        else if (choice === 1) bid += 50;
        else {
          await say('Sayang sekali... Seorang kolektor kaya dari kota atas memenangkan artefak tersebut.', 'Juru Lelang Bastian');
          return;
        }

        sfx('cur');
        if (round < 3) {
          const npcBids = ['Saudagar Kain menaikkan tawaran!', 'Kolektor Seni menaikkan tawaran!'];
          bid += 30;
          await say(`${npcBids[round - 1]} Tawaran sekarang: ${bid} G! Ada yang berani lebih tinggi?`, 'Juru Lelang Bastian');
        }
      }

      // Ketukan palu ke-3!
      sfx('save');
      await say(`Tawaran ${bid} G! Satu... Dua... Tiga... TERJUAL kepada anak muda ini!`, 'Juru Lelang Bastian');
      if (S.gold < bid) {
        sfx('buzz');
        await say('Waduh! Koinmu tidak mencukupi untuk menebus tawaran lelangmu!', 'Juru Lelang Bastian');
      } else {
        S.gold -= bid;
        addItem('antique_relic', 1);
        S.auctionWon = S.auctionWon || {};
        S.auctionWon['antique_relic'] = true;
        sfx('fanfare');
        banner('MENANG LELANG!', 'ARTEFAK KUNO AUREL', true, 2600);
        popWorld(this.pl.x, this.pl.y - 24, '+1 Artefak Kuno Aurel!', 'gold');
        updHud();
        await say('Selamat! Artefak Kuno peradaban Aurel kini resmi menjadi milikmu!', 'Juru Lelang Bastian');
      }
    } finally {
      G.lock--;
    }
  },
});
