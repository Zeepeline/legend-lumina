'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async feedCityPigeons(px, py) {
    if (this._feedingPigeons) return;
    this._feedingPigeons = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Kawanan Merpati Alun-Alun Kota', [
      'Tabur Remah Benih Gandum (Beri Makan)',
      'Hampiri Perlahan & Elus Sayap',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Tabur benih
      sfx('step');
      for (let i = 0; i < 6; i++) {
        this.time.delayedCall(i * 100, () => {
          this.sparkle(px + rnd(-14, 14), py - rnd(2, 14), 0xffd860);
          sfx('step');
        });
      }
      await sleep(650);

      // Flap sound of happy pigeons flocking
      sfx('flap');
      popWorld(px, py - 20, '🐦 Kur-kur! Merpati Senang!', 'gold');

      // Chance for feather or small silver coin
      const roll = Math.random();
      if (roll < 0.5) {
        addItem('feather', 1);
        updHud();
        sfx('chest');
        popWorld(px, py - 32, '🪶 Bulu Merpati Halus!', 'crit');
        await say('Kawanan merpati kota berbondong-bondong mematuk remah gandum dengan riang!\nSalah satu burung mengepakkan sayapnya dan meninggalkan sehelai bulu perak halus di ubin batu (+1 Bulu Merpati Halus)!', 'Merpati Kota');
      } else {
        const coin = rnd(3, 7);
        S.gold += coin;
        updHud();
        sfx('coin');
        popWorld(px, py - 32, '+' + coin + ' G Koin Temuan!', 'gold');
        await say('Merpati-merpati mematuk tanah dengan gesit. Di sela-sela lantai batu, paruh mereka menyingkap koin receh yang terselip (+ ' + coin + ' G)!', 'Merpati Kota');
      }
    } else if (opt === 1) {
      // Mengagetkan / mendekat perlahan
      sfx('flap');
      for (let i = 0; i < 8; i++) {
        this.sparkle(px + rnd(-16, 16), py - rnd(6, 26), 0xffffff);
      }
      popWorld(px, py - 22, 'FLAP FLAP! Merpati Membumbung!', 'dmg');
      await say('Mendengar derap langkahmu yang mendekat, kawanan merpati serentak mengepakkan sayap dan membubung anggun ke udara melintasi megahnya gerbang kota!', 'Kawanan Burung');
    }

    this._feedingPigeons = false;
    G.lock--;
  },
  async interactTeaTable(tx, ty) {
    if (this._inTeaTable) return;
    this._inTeaTable = true;
    G.lock++;

    sfx('creak');
    const opt = await choose('Kedai Teh Desa Kincir', [
      'Seruput Teh Mint Hangat (Pulihkan HP/MP & Langkah Ringan)',
      'Beli Bekal Teh Mint Kincir (15 G)',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Seruput teh gratis
      sfx('water');
      this.cameras.main.flash(250, 240, 255, 230);
      for (let i = 0; i < 6; i++) {
        this.time.delayedCall(i * 100, () => {
          this.puff(this.pl.x + rnd(-8, 8), this.pl.y - rnd(12, 28));
          this.sparkle(this.pl.x + rnd(-12, 12), this.pl.y - rnd(6, 24), 0x7ad0a0);
        });
      }

      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 30);
      S.mp = Math.min(st.maxmp, S.mp + 25);
      S.buff = S.buff || {};
      S.buff.spd = Math.max(S.buff.spd || 0, 120); // 2 menit kecepatan jalan +20%
      updHud();
      popWorld(this.pl.x, this.pl.y - 22, '🍵 Sluuurp... Segar! (+Langkah Ringan)', 'gold');
      await say('Kamu menyeruput secangkir teh daun mint hangat yang harum di bawah semilir angin padang rumput.\nAroma segar menyejukkan dada dan membuat langkah kakimu terasa begitu ringan (+30 HP, +25 MP, Kecepatan Jalan naik 2 menit)!', 'Kedai Teh');
    } else if (opt === 1) {
      // Beli bekal teh (15 G)
      if (S.gold < 15) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk membeli bekal Teh Mint Kincir (butuh 15 G).', 'Kedai Teh');
      } else {
        S.gold -= 15;
        addItem('tea_flask', 1);
        updHud();
        sfx('coin');
        this.time.delayedCall(200, () => sfx('chest'));
        popWorld(this.pl.x, this.pl.y - 22, '+1 Teh Mint Kincir!', 'crit');
        await say('Paman penjaga kedai membungkus botol bambu berisi teh mint segar yang masih hangat:\n"Bawalah ini untuk perjalananmu melintasi bukit-bukit padang rumput, anak muda!" (+1 Teh Mint Kincir)!', 'Kedai Teh');
      }
    }

    this._inTeaTable = false;
    G.lock--;
  },
  async interactLotusPond(lx, ly) {
    if (this._inLotusPond) return;
    this._inLotusPond = true;
    G.lock++;

    sfx('frog');
    const hasSeed = has('seed');

    const opt = await choose('Rumpun Teratai & Kodok Rawa', [
      hasSeed ? 'Tabur Benih Teratai Air (1x Benih Sayur)' : 'Tabur Benih Teratai Air (Perlu Benih Sayur)',
      'Dengarkan Nyanyian Kodok Rawa (Ketenangan Jiwa)',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (!hasSeed) {
        sfx('hit');
        await say('Kamu tidak membawa benih untuk ditabur ke dalam air kolam teratai.', 'Kolam Teratai');
      } else {
        addItem('seed', -1);
        sfx('water');
        this.cameras.main.flash(250, 255, 220, 240);

        for (let i = 0; i < 8; i++) {
          this.time.delayedCall(i * 90, () => {
            this.sparkle(lx + rnd(-12, 12), ly - rnd(4, 20), [0xf078a8, 0xffaed0, 0x60c83a][i % 3]);
          });
        }
        await sleep(400);

        sfx('frog');
        this.time.delayedCall(200, () => sfx('water'));
        popWorld(lx, ly - 20, '🪷 Teratai Mekar & 🐸 Kroak!', 'gold');

        addItem('frog_oil', 1);
        updHud();
        sfx('chest');
        popWorld(lx, ly - 32, '+1 Minyak Kodok Rawa!', 'crit');
        await say('Benih teratai mekar dengan cepat di atas riak air rawa!\nKodok hijau melompat gembira dari daun ke daun sambil berbunyi *KROAAAK* dan meninggalkan sebotol minyak teratai licin di atas daun (+1 Minyak Kodok Rawa)!', 'Teratai Rawa');
      }
    } else if (opt === 1) {
      // Dengarkan nyanyian kodok
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 180, () => {
          sfx('frog');
          this.sparkle(lx + rnd(-8, 8), ly - rnd(4, 16), 0x60c83a);
        });
      }
      await sleep(600);

      const st = stat();
      S.mp = Math.min(st.maxmp, S.mp + 15);
      updHud();
      popWorld(lx, ly - 20, '🐸 Kroak... Kroak... (+15 MP)', 'gold');
      await say('Kodok rawa mengedipkan matanya yang bulat lucu sambil menyanyikan irama berderik yang menentramkan suasana rawa (+15 MP)!', 'Nyanyian Rawa');
    }

    this._inLotusPond = false;
    G.lock--;
  },
  async interactLakeBoat(bx, by, spr) {
    if (this._inLakeBoat) return;
    this._inLakeBoat = true;
    G.lock++;

    sfx('creak');
    const opt = await choose('Perahu Nelayan Danau Cermin', [
      'Goyang Haluan & Dengarkan Riak Danau (Ketenangan Jiwa)',
      'Nyalakan Lentera Minyak di Haluan Perahu',
      'Periksa Kolong Bangku & Jaring Ikan',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Goyang haluan perahu
      sfx('creak');
      this.time.delayedCall(250, () => sfx('water'));

      if (spr) {
        this.tweens.add({
          targets: spr,
          y: by - 3,
          angle: 2.5,
          duration: 350,
          yoyo: true,
          repeat: 2,
          ease: 'Sine.easeInOut'
        });
      }

      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 120, () => {
          this.sparkle(bx + rnd(-16, 16), by - rnd(2, 10), [0x7ad0ff, 0x4aa8e8, 0xffffff][i % 3]);
        });
      }
      await sleep(800);

      const st = stat();
      S.mp = Math.min(st.maxmp, S.mp + 20);
      updHud();
      popWorld(bx, by - 22, '🌊 Riak Danau Sejuk (+20 MP)', 'gold');
      await say('Perahu kayu berayun lembut memecah riak danau yang sebening kaca.\nSuara gemercik air dan derit kayu membawamu larut dalam kedamaian Danau Cermin (+20 MP)!', 'Riak Danau');
    } else if (opt === 1) {
      // Nyalakan lentera
      sfx('fire');
      this.lights.push({ x: bx + 14, y: by - 14, r: 50 });
      for (let i = 0; i < 10; i++) {
        this.time.delayedCall(i * 90, () => {
          this.sparkle(bx + 14 + rnd(-4, 4), by - 14 - rnd(2, 10), [0xffd850, 0xff9a28, 0xffffff][i % 3]);
        });
      }
      popWorld(bx + 14, by - 24, '✨ Lentera Menyala Hangat!', 'crit');
      await say('Sumbu lentera minyak di haluan perahu menyala terang berpendar keemasan.\nPendarannya terpantul indah di atas permukaan Danau Cermin seperti bintang yang jatuh ke air!', 'Lentera Perahu');
    } else if (opt === 2) {
      // Periksa kolong jaring
      sfx('step');
      const roll = Math.random();
      if (roll < 0.45) {
        addItem('fish', 1);
        updHud();
        sfx('chest');
        popWorld(bx, by - 22, '🐟 Ikan Mas Segar Tertinggal!', 'gold');
        await say('Di balik gulungan jaring basah, kamu menemukan seekor ikan segar yang tertinggal dari tangkapan nelayan (+1 Ikan Mas)!', 'Temuan Perahu');
      } else {
        const coin = rnd(6, 12);
        S.gold += coin;
        updHud();
        sfx('coin');
        popWorld(bx, by - 22, '+' + coin + ' G Koin Danau!', 'gold');
        await say('Di bawah papan duduk kayu yang lapuk, jemarimu menemukan beberapa koin perak kuno terselip (+ ' + coin + ' G)!', 'Temuan Perahu');
      }
    }

    this._inLakeBoat = false;
    G.lock--;
  },
  async whistleToCanary(cx, cy, spr) {
    if (this._whistlingCanary) return;
    this._whistlingCanary = true;
    G.lock++;

    // Melody whistle tones
    sfx('bell');
    this.time.delayedCall(200, () => sfx('click'));
    this.time.delayedCall(400, () => sfx('bell'));

    if (spr) {
      this.tweens.add({
        targets: spr,
        y: cy - 4,
        duration: 150,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });
    }

    for (let i = 0; i < 8; i++) {
      this.time.delayedCall(i * 100, () => {
        this.sparkle(cx + rnd(-10, 10), cy - rnd(10, 24), [0xffcf30, 0xffe468, 0xffffff][i % 3]);
      });
    }
    await sleep(750);

    const st = stat();
    S.hp = Math.min(st.maxhp, S.hp + 20);
    S.mp = Math.min(st.maxmp, S.mp + 20);
    updHud();

    popWorld(cx, cy - 24, '🎵 Kicau Kenari Merdu! (+20 HP/MP)', 'gold');

    const roll = Math.random();
    if (roll < 0.4) {
      const coin = rnd(5, 10);
      S.gold += coin;
      updHud();
      sfx('coin');
      popWorld(cx, cy - 36, '+' + coin + ' G Koin Sarang!', 'gold');
      await say('Kamu bersiul lembut menirukan nada kicauan burung kenari.\nBurung kenari melompat-lompat riang di dahan sambil membalas siulanmu merdu! Dari sela sarangnya, sebutir koin perak jatuh ke rumput (+ ' + coin + ' G & Pulih 20 HP/MP)!', 'Burung Kenari Liar');
    } else {
      await say('Alunan siulanmu bersahut-sahutan merdu dengan kicauan burung kenari di atas dahan willow.\nMelodi sungai yang damai memulihkan semangat dan energimu (+20 HP & +20 MP)!', 'Kicau Kenari');
    }

    this._whistlingCanary = false;
    G.lock--;
  },
  async interactWoodlandShrine(sx, sy) {
    if (this._inWoodlandShrine) return;
    this._inWoodlandShrine = true;
    G.lock++;

    sfx('bell');
    const flowers = ['river_orchid', 'frost_flower', 'bfly_pink', 'herb'];
    const availableFlower = flowers.find(f => has(f));

    const opt = await choose('Patung Penjaga Hutan Kuno', [
      availableFlower ? 'Persembahkan Bunga Alami (' + ITEMS[availableFlower].n + ') - Berkah Alam' : 'Persembahkan Bunga Alami (Perlu Herba/Bunga/Kupu)',
      'Basuh Muka dengan Air Bejana Hujan Suci (+25 HP/MP)',
      'Baca Prasasti Kearifan Kuno',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (!availableFlower) {
        sfx('hit');
        await say('Kamu belum memiliki bunga atau herba alami di tas untuk dipersembahkan di bejana patung.', 'Altar Hutan');
      } else {
        addItem(availableFlower, -1);
        sfx('water');
        this.time.delayedCall(250, () => sfx('bell'));
        this.cameras.main.flash(350, 200, 255, 220);

        for (let i = 0; i < 12; i++) {
          this.time.delayedCall(i * 80, () => {
            this.sparkle(sx + rnd(-14, 14), sy - rnd(6, 26), [0x38a854, 0x78f098, 0xffffff][i % 3]);
          });
        }
        await sleep(650);

        // Cure status
        S.status = {};
        const st = stat();
        S.mp = st.maxmp;
        S.buff = S.buff || {};
        S.buff.def = Math.max(S.buff.def || 0, 180); // 3 menit buff DEF
        updHud();

        popWorld(sx, sy - 24, '🌿 Berkah Penjaga Hutan! (MP Penuh & DEF)', 'crit');
        await say('Kelopak bunga mengapung anggun di atas air bejana suci. Mata patung memancarkan pendaran hijau zamrud yang hangat!\nSemilir angin hutan berhembus lembut menyapu racun dan lelah dari tubuhmu (Status Pulih, MP Penuh, & Perlindungan Alam naik 3 menit)!', 'Berkah Hutan');
      }
    } else if (opt === 1) {
      // Basuh air bejana
      sfx('water');
      for (let i = 0; i < 6; i++) {
        this.sparkle(this.pl.x + rnd(-10, 10), this.pl.y - rnd(6, 24), 0x68d4f0);
      }
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 25);
      S.mp = Math.min(st.maxmp, S.mp + 25);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, '💧 Air Bejana Segar (+25 HP/MP)', 'gold');
      await say('Air hujan pegunungan yang tertampung di bejana batu terasa dingin dan murni menyejukkan wajahmu (+25 HP, +25 MP)!', 'Bejana Suci');
    } else if (opt === 2) {
      await say('Ukiran aksara kuno di kaki patung berbunyi:\n"Hormatilah setiap ranting yang tumbuh dan air yang mengalir, maka alam semesta akan melindungimu dari jerat kegelapan."', 'Prasasti Kuno');
    }

    this._inWoodlandShrine = false;
    G.lock--;
  },
});
