'use strict';
// Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async harvestRiverStone(rx, ry) {
    if (this._busyRiverStone) return;

    const c = await choose("Batu Kali Sungai Senja", [
      "🦐 Singkap Batu & Tangkap Udang Kali",
      "🌊 Basuh Kaki di Air Sungai Dangkal (+20 HP/MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(20, stat("mhp") - S.hp);
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;
      sfx("water");
      this.popWorld(rx, ry - 18, "+20 HP & MP Segar!", "#81d4fa");
      await say("Kesejukan Air Sungai", [
        "Air sungai yang mengalir jernih membasuh kakimu dengan kesejukan alami.",
        "Rasa pegal perjalanan meluruh terbawa arus air kali yang lembut."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyRiverStone = true;
    G.lock++;
    sfx("step");
    this.popWorld(rx, ry - 22, "Menyingkap batu kali...", "#90a4ae");

    await sleep(700);
    sfx("water");

    // Splash water drops and foam
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(rx + rnd(-10, 10), ry - rnd(4, 14), rnd(1.5, 3), 0x81d4fa, 0.9).setDepth(ry + 10);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-12, 12),
        y: sp.y - rnd(10, 20),
        alpha: 0,
        duration: rnd(400, 750),
        onComplete: () => sp.destroy()
      });
    }

    addItem("river_prawn", 1);
    sfx("chest");

    let bonusCoin = "";
    if (Math.random() < 0.4) {
      const g = rnd(5, 10);
      S.g += g;
      bonusCoin = " Di sela pasir basah, kamu menemukan koin tembaga tua +" + g + "G!";
    }

    this.popWorld(rx, ry - 20, "🦐 Udang Kali Tertangkap!", "#ff8a65");
    G.lock--;
    this._busyRiverStone = false;

    await say("Udang Kali Air Tawar", [
      "SPLASH! Seekor Udang Kali Segar melompat lincah dari balik batu yang terangkat!",
      "Dengan gerakan sigap, kamu berhasil menangkapnya! Dagingnya manis gurih, cocok dibakar dengan olesan madu di perapian!" + bonusCoin
    ]);
  },
  async harvestSnowChrysanthemum(cx, cy) {
    if (this._busyChrys) return;

    const c = await choose("Bunga Krisan Salju Emas", [
      "🌼 Petik Kuntum Krisan Salju (Herba Penghangat)",
      "☕ Seduh Teh Krisan Madu (1x Krisan & 1x Madu Emas)",
      "🌬️ Hirup Aroma Hangat Krisan (+25 HP/MP)",
      "Kembali"
    ]);

    if (c === 2) {
      const hpGain = Math.min(25, stat("mhp") - S.hp);
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;
      sfx("step");
      this.popWorld(cx, cy - 20, "+25 HP/MP (Aroma Herbal)", "#fff59d");
      await say("Aroma Krisan Salju", [
        "Aroma manis herbal menguar lembut dari kelopak krisan kuning yang kokoh menembus dinginnya salju.",
        "Hawa hangat menjalar lembut ke dalam dada, mengusir dingin yang menusuk tulang."
      ]);
      return;
    }

    if (c === 0) {
      this._busyChrys = true;
      G.lock++;
      sfx("step");
      this.popWorld(cx, cy - 24, "Memetik kuntum krisan...", "#ffd54f");

      await sleep(750);
      sfx("flap");

      // Yellow pollen sparkles
      for (let i = 0; i < 6; i++) {
        const sp = this.add.circle(cx + rnd(-10, 10), cy - rnd(8, 20), rnd(1.5, 3), 0xffd600, 0.9).setDepth(cy + 10);
        this.tweens.add({
          targets: sp,
          y: sp.y - rnd(10, 22),
          alpha: 0,
          duration: rnd(500, 900),
          onComplete: () => sp.destroy()
        });
      }

      addItem("snow_chrys", 1);
      sfx("chest");
      this.popWorld(cx, cy - 22, "🌼 Krisan Salju Didapat!", "#fff59d");
      G.lock--;
      this._busyChrys = false;

      await say("Panen Bunga Krisan Salju", [
        "Kuntum krisan kuning cerah yang harum berhasil dipetik dari celah batu bersalju!",
        "Kelopak bunga ini berkhasiat menghangatkan tubuh dan menjadi bahan seduhan teh obat penangkal badai beku."
      ]);
      return;
    }

    if (c === 1) {
      if (!has("snow_chrys") || !has("honey_jar")) {
        await say("Seduhan Teh Krisan Madu", [
          "Kamu membutuhkan 1x Krisan Salju Emas dan 1x Toples Madu Emas untuk menyeduh teh hangat ini!",
          "Petik bunganya di sini dan dapatkan Madu Emas di pohon purba Hutan Dalam."
        ]);
        return;
      }

      this._busyChrys = true;
      G.lock++;
      sfx("step");
      this.popWorld(cx, cy - 24, "Menyeduh teh hangat...", "#ffb300");

      await sleep(1000);
      sfx("water");
      sfx("crit");

      addItem("snow_chrys", -1);
      addItem("honey_jar", -1);
      addItem("chrys_tea", 1);

      // Warm steam aura
      for (let i = 0; i < 7; i++) {
        const sp = this.add.circle(cx + rnd(-8, 8), cy - rnd(10, 22), rnd(2, 3.5), 0xfff9c4, 0.8).setDepth(cy + 12);
        this.tweens.add({
          targets: sp,
          y: sp.y - rnd(16, 28),
          alpha: 0,
          duration: rnd(600, 1100),
          onComplete: () => sp.destroy()
        });
      }

      sfx("chest");
      this.popWorld(cx, cy - 22, "☕ Teh Krisan Madu Jadi!", "#fff9c4");
      G.lock--;
      this._busyChrys = false;

      await say("Teh Krisan Madu Panas", [
        "Seduhan kelopak krisan salju dan madu hutan mendidih menebarkan aroma semerbak yang menggugah selera!",
        "Minum untuk memulihkan 45 HP, 45 MP, serta memberikan kekebalan hawa dingin & perlindungan (DEF & Hangat 3 menit)!"
      ]);
      return;
    }
  },
  async roastHarvest(rx, ry) {
    if (this._roastingHarvest) return;
    this._roastingHarvest = true;
    G.lock++;

    sfx('click');
    const hasVeg = has('veg');
    const hasCorn = has('apple') || has('orange');

    const opt = await choose('Tungku Tanah Liat Petani', [
      hasVeg ? 'Bakar Sayur Segar (1x Sayur Segar) - Buat Sayur Bakar Gurih' : 'Bakar Sayur Segar (Perlu Sayur Segar)',
      'Tanya Tips Bertani ke Petani',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (!hasVeg) {
        sfx('hit');
        await say('Kamu belum memiliki Sayur Segar di tas. Tanamlah benih di petak kebun dan siram setiap hari!', 'Tungku Kebun');
      } else {
        addItem('veg', -1);
        sfx('fire');
        // Puffs of smoke and pleasant roasting sound
        for (let i = 0; i < 4; i++) {
          this.time.delayedCall(i * 180, () => {
            this.puff(rx, ry - 14);
            sfx('step');
          });
        }
        await sleep(750);

        addItem('roast_veg', 1);
        updHud();
        sfx('chest');
        popWorld(rx, ry - 20, '🌽 Sayur Bakar Harum!', 'gold');
        await say('Bara sekam hangat mendesis lembut mematangkan sayuran kebun hingga harum semerbak!\nKulit luarnya renyah kecokelatan dan dalamnya manis lembut. (+1 Sayur Bakar Gurih)!', 'Panen Hangat');
      }
    } else if (opt === 1) {
      await say('Pak Tani tersenyum ramah menyeka keringat di dahinya:\n"Tanah desa ini sangat subur berkat perlindungan Pohon Induk. Kalau menanam benih saat hari hujan lebat, tanaman akan tumbuh jauh lebih cepat dan segar!"', 'Petani Desa');
    }

    this._roastingHarvest = false;
    G.lock--;
  },
  async harvestCaveStalactite(cx, cy) {
    if (this._harvestingStalactite) return;
    this._harvestingStalactite = true;
    G.lock++;

    sfx('drip');
    const opt = await choose('Ceruk Stalaktit Berair', [
      'Tampung Tetesan Air Murni Stalaktit',
      'Petik Lumut Zamrud Lembap',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Tampung air
      for (let i = 0; i < 3; i++) {
        this.time.delayedCall(i * 160, () => {
          sfx('drip');
          this.sparkle(cx + rnd(-6, 6), cy - rnd(4, 20), 0x7ad8ff);
        });
      }
      await sleep(600);

      addItem('cave_water', 1);
      updHud();
      sfx('bell');
      popWorld(cx, cy - 22, '💧 Air Stalaktit (+35 MP)!', 'crit');
      await say('Tetes demi tetes air mineral dingin menetes lembut dari ujung stalaktit purba ke dalam wadahmu.\nAirnya terasa sangat segar dan menenangkan hawa panas (+1 Air Murni Stalaktit)!', 'Air Gua');
    } else if (opt === 1) {
      // Petik lumut
      sfx('step');
      for (let i = 0; i < 5; i++) {
        this.sparkle(cx + rnd(-10, 10), cy - rnd(2, 16), 0x3ac87a);
      }
      await sleep(350);

      addItem('cave_moss', 1);
      updHud();
      sfx('chest');
      popWorld(cx, cy - 22, '🌿 Lumut Zamrud Didapat!', 'gold');
      await say('Kamu memetik gumpalan lumut zamrud yang tumbuh lebat di bebatuan basah.\nLumut ini terasa dingin menyegarkan di jemarimu, cocok sebagai peredam racun alami (+1 Lumut Zamrud Gua)!', 'Lumut Gua');
    }

    this._harvestingStalactite = false;
    G.lock--;
  },
  async harvestFrostFlower(fx, fy) {
    if (this._harvestingFrostFlower) return;
    this._harvestingFrostFlower = true;
    G.lock++;

    sfx('ice');
    const opt = await choose('Bunga Salju Abadi', [
      'Hisap Nektar Es Kristal (Pulihkan 40 MP & Kebal Dingin)',
      'Petik Kelopak Bunga Salju',
      'Kagumi Keindahan Bunga'
    ]);

    if (opt === 0) {
      // Hisap nektar
      sfx('crit');
      this.cameras.main.flash(300, 200, 240, 255);
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 90, () => {
          this.sparkle(fx + rnd(-8, 8), fy - rnd(4, 18), [0x9adbf8, 0xffffff, 0xc8f0ff][i % 3]);
        });
      }

      const st = stat();
      S.mp = Math.min(st.maxmp, S.mp + 40);
      S.buff.warm = Math.max(S.buff.warm || 0, 180); // 3 menit kebal dingin
      updHud();
      popWorld(fx, fy - 22, '❄️ Nektar Es Segar (+40 MP)!', 'crit');
      await say('Setetes nektar es murni terasa dingin manis menyegarkan di lidahmu.\nPikiranmu menjadi sangat jernih dan tubuhmu terasa kebal dari gigilan hawa dingin (+40 MP & Hangat)!', 'Bunga Salju');
    } else if (opt === 1) {
      // Petik kelopak
      sfx('step');
      for (let i = 0; i < 5; i++) {
        this.sparkle(fx + rnd(-8, 8), fy - rnd(2, 16), 0x9adbf8);
      }
      await sleep(300);

      addItem('frost_flower', 1);
      updHud();
      sfx('chest');
      popWorld(fx, fy - 22, '🌸 Bunga Salju Didapat!', 'gold');
      await say('Kamu memetik kelopak bunga kristal salju dengan sangat hati-hati.\nKelopaknya memancarkan aroma mint sejuk yang menenangkan jiwa (+1 Bunga Salju Abadi)!', 'Kelopak Salju');
    } else if (opt === 2) {
      await say('Kelopak biru kristal mekar anggun di atas hamparan salju putih abadi, berkilauan bak permata di bawah semilir angin dingin pegunungan.', 'Pesona Salju');
    }

    this._harvestingFrostFlower = false;
    G.lock--;
  },
  async harvestCoffeeShrub(cx, cy) {
    if (this._harvestingCoffee) return;
    this._harvestingCoffee = true;
    G.lock++;

    sfx('step');
    for (let i = 0; i < 6; i++) {
      this.time.delayedCall(i * 80, () => {
        this.sparkle(cx + rnd(-8, 8), cy - rnd(4, 16), 0xc82424);
      });
    }
    await sleep(350);

    const count = rnd(1, 2);
    addItem('coffee_bean', count);
    updHud();
    sfx('chest');
    popWorld(cx, cy - 22, '☕ Biji Kopi Matang (+' + count + ')!', 'gold');
    await say('Kamu memetik buah kopi merah ranum dari semak liar pegunungan.\nBiji kopi ini beraroma harum tanah yang kuat, sangat nikmat jika diseduh di atas bara arang (+ ' + count + ' Biji Kopi Liar)!', 'Semak Kopi Liar');

    this._harvestingCoffee = false;
    G.lock--;
  },
  async brewCharcoalCoffee(bx, by) {
    if (this._brewingCoffee) return;
    this._brewingCoffee = true;
    G.lock++;

    sfx('fire');
    const hasBeans = (S.inv.coffee_bean || 0) >= 2;

    const opt = await choose('Ketel Kopi Arang Pos Musafir', [
      hasBeans ? 'Seduh Kopi Arang Panas (2x Biji Kopi Liar)' : 'Seduh Kopi Arang Panas (Perlu 2 Biji Kopi)',
      'Bagi Secangkir Kopi Hangat ke Kusir Kafilah',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (!hasBeans) {
        sfx('hit');
        await say('Kamu butuh minimal 2 Biji Kopi Liar untuk diseduh. Petiklah dari semak kopi di lereng bukit!', 'Ketel Kopi');
      } else {
        addItem('coffee_bean', -2);
        sfx('water');
        this.cameras.main.flash(200, 255, 230, 200);

        for (let i = 0; i < 6; i++) {
          this.time.delayedCall(i * 120, () => {
            this.puff(bx, by - 14);
            sfx('step');
          });
        }
        await sleep(700);

        addItem('coffee_cup', 1);
        updHud();
        sfx('chest');
        popWorld(bx, by - 22, '☕ Kopi Arang Panas Selesai!', 'gold');
        await say('Air mendidih mendesis saat dituangkan ke bubuk kopi tumbuk di atas bara arang!\nAroma pekat yang menggugah selera memenuhi pos musafir (+1 Kopi Arang Panas)!', 'Seduhan Kopi');
      }
    } else if (opt === 1) {
      if (!has('coffee_cup')) {
        sfx('hit');
        await say('Kamu belum memiliki Kopi Arang Panas di tas untuk dibagikan ke Kusir Kafilah.', 'Pos Kafilah');
      } else {
        addItem('coffee_cup', -1);
        sfx('chest');
        this.cameras.main.flash(250, 255, 240, 220);

        const tip = rnd(15, 25);
        S.gold += tip;
        updHud();
        sfx('coin');
        popWorld(bx, by - 22, 'Kusir Bahagia (+' + tip + ' G)!', 'gold');
        await say('Kusir Kafilah menyeruput kopi hitam panas dengan mata berbinar-binar:\n"Luar biasa! Rasa pahit legit dan hangatnya menendang rasa kantukku setelah menempuh perjalanan jauh dari selatan! Terimalah koin ini sebagai ucapan terima kasihku, anak muda!" (+ ' + tip + ' G)!', 'Kusir Kafilah');
      }
    }

    this._brewingCoffee = false;
    G.lock--;
  },
});
