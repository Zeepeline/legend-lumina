'use strict';
// Interior, memancing, kebun, teka-teki batu, Mochi
Object.assign(World.prototype, {
  enterRoom(to, d) {
    if (to === 'arsip' && !S.inv.akey) { if (!G.lock && !this._lockMsg) { this._lockMsg = 1; talk(null, ['Pintu Akademi tertutup. Penjaga menggeleng: "Arsip hanya untuk guru dan yang mendapat izin."']).then(() => { this.pl.y += 14; this._lockMsg = 0; }); } return; }
    this.goto(to, 160, 226, 'up');
  },










  async harvestHoneyTree(tx, ty) {
    if (this._busyHoneyTree) return;

    const c = await choose("Pohon Sarang Madu Purba", [
      "🍯 Tampung Madu Emas Murni (Toples Madu)",
      "🐝 Dengarkan Dengungan Damai Lebah Hutan (+15 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(tx, ty - 26, "+15 MP Damai", "#fff59d");
      }
      await say("Dengungan Harmonis Lebah", [
        "Ribuan lebah madu bekerja tekun di antara bunga-bunga liar rimba dan rongga pohon tua.",
        "Dengungan lembut mereka berpadu dengan bisikan angin hutan, menghadirkan ketenangan jiwa."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyHoneyTree = true;
    G.lock++;
    sfx("step");
    this.popWorld(tx, ty - 28, "Mendekati sarang lebah...", "#ffca28");

    await sleep(900);
    sfx("water");

    // Golden honey droplets and sparkle animation
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(tx + rnd(-12, 12), ty - rnd(16, 32), rnd(2, 3.5), 0xffd54f, 0.9).setDepth(ty + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y + rnd(10, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("honey_jar", 1);
    sfx("chest");

    // 25% chance of gentle sting (-4 HP)
    if (Math.random() < 0.25) {
      S.hp = Math.max(1, S.hp - 4);
      sfx("hurt");
      this.popWorld(tx, ty - 24, "🐝 Aw! Disengat lebah (-4 HP)! Tapi Madu Emas Didapat!", "#ff8a80");
      G.lock--;
      this._busyHoneyTree = false;
      await say("Sengatan Manis", [
        "ZZZT! Seekor lebah penjaga menyengat jemarimu karena terkejut (-4 HP)!",
        "Namun toples kacamu kini terisi penuh dengan Madu Emas Purba yang harum semerbak!",
        "Khasiatnya luar biasa: memulihkan 50 HP, 40 MP, dan menyuntikkan stamina manis (DEF 3 menit)!"
      ]);
    } else {
      this.popWorld(tx, ty - 24, "🍯 Madu Emas Purba Didapat!", "#ffe082");
      G.lock--;
      this._busyHoneyTree = false;
      await say("Panen Madu Emas Murni", [
        "Dengan gerakan tenang dan lembut, kamu berhasil menampung lelehan Madu Emas Purba tanpa mengusik kawanan lebah!",
        "Toples madu kental ini memancarkan kilau emas alami. Konsumsi untuk memulihkan 50 HP, 40 MP & stamina berlimpah!"
      ]);
    }
  },

  async interactClimberLedge(lx, ly) {
    if (this._busyClimber) return;

    const savedBird = !!(S.savedSwift);
    const options = [
      savedBird ? "🕊️ Burung Layang Sudah Bebas" : "🕊️ Lepaskan Sayap Burung yang Tersangkut",
      "📜 Baca Buku Catatan Pemanjat Tebing (+30 HP/MP & Langkah Ringan)",
      "Kembali"
    ];

    const c = await choose("Pos Pemanjat Tebing Reruntuhan", options);

    if (c === 1) {
      const hpGain = Math.min(30, stat("mhp") - S.hp);
      const mpGain = Math.min(30, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;

      // Buff Langkah Ringan (+15% spd selama 2.5 menit = 150s)
      if (!S.buff) S.buff = {};
      S.buff.spd = Math.max(S.buff.spd || 0, 150);

      sfx("step");
      this.popWorld(lx, ly - 22, "+30 HP/MP & Langkah Ringan!", "#81c784");

      await say("Catatan Harian Pemanjat Tebing", [
        "\"Pola angin jurang berhembus teratur setiap fajar. Saat menapak tanjakan batu, kunci tumpuan tumit dan atur ritme nafas tiga hitungan.\"",
        "Inspirasi teknik pemanjat tebing menyegarkan staminamu dan membuat langkah kakimu sangat lincah (Langkah Ringan 2.5 menit)!"
      ]);
      return;
    }

    if (c === 0) {
      if (savedBird) {
        await say("Pos Tebing Teduh", [
          "Tali tambang sudah terurai rapi. Sayup-sayup di langit terdengar cericit riang burung layang-layang jurang yang terbang bebas."
        ]);
        return;
      }

      this._busyClimber = true;
      G.lock++;
      sfx("swing");
      this.popWorld(lx, ly - 26, "Mengurai simpul tali...", "#90caf9");

      await sleep(700);
      sfx("flap");

      // Bird flying up animation
      const bird = this.add.circle(lx - 2, ly - 14, 4, 0x1e88e5).setDepth(ly + 10);
      this.tweens.add({
        targets: bird,
        x: lx + rnd(-20, 20),
        y: ly - 60,
        alpha: 0,
        scale: 0.5,
        duration: 1200,
        onComplete: () => bird.destroy()
      });

      // Feather sparkles
      for (let i = 0; i < 6; i++) {
        const sp = this.add.circle(lx + rnd(-8, 8), ly - rnd(14, 24), rnd(1.5, 2.5), 0x64b5f6, 0.9).setDepth(ly + 8);
        this.tweens.add({
          targets: sp,
          y: sp.y + rnd(8, 16),
          alpha: 0,
          duration: rnd(500, 800),
          onComplete: () => sp.destroy()
        });
      }

      S.savedSwift = true;
      addItem("obsidian", 1);
      sfx("chest");
      this.popWorld(lx, ly - 24, "🕊️ Burung Bebas! Dapat Obsidian!", "#e0e0e0");
      G.lock--;
      this._busyClimber = false;

      await say("Burung Layang-Layang Tebing", [
        "SREET! Dengan hati-hati kamu memotong simpul tali yang menjepit sayapnya.",
        "Burung layang-layang biru itu mengepakkan sayapnya dengan gembira, berputar di atas kepalamu sebelum membubung ke angkasa bebas!",
        "Sebelum terbang, burung itu menjatuhkan sebutir Batu Obsidian Tebing hitam berkilauan ke telapak tanganmu!"
      ]);
      return;
    }
  },

  async interactMangroveHollow(mx, my) {
    if (this._busyMangrove) return;

    const c = await choose("Pohon Bakau Rawa Purba", [
      "🌿 Sadap Getah Kulit Kayu Bakau (Resin Aromatik)",
      "🧴 Racik Minyak Gosok Rawa (1x Getah Bakau)",
      "Kembali"
    ]);

    if (c === 0) {
      this._busyMangrove = true;
      G.lock++;
      sfx("step");
      this.popWorld(mx, my - 24, "Menyadap getah bakau...", "#ffb300");

      await sleep(800);
      sfx("water");

      // Resin droplet sparkles
      for (let i = 0; i < 5; i++) {
        const sp = this.add.circle(mx + rnd(-4, 4), my - rnd(10, 18), rnd(1.5, 2.5), 0xffb300, 0.9).setDepth(my + 8);
        this.tweens.add({
          targets: sp,
          y: sp.y + rnd(8, 16),
          alpha: 0,
          duration: rnd(400, 700),
          onComplete: () => sp.destroy()
        });
      }

      addItem("mangrove_resin", 1);
      sfx("chest");
      this.popWorld(mx, my - 22, "🌿 Getah Bakau Didapat!", "#fff59d");
      G.lock--;
      this._busyMangrove = false;

      await say("Sadapan Getah Bakau", [
        "TES... TIK! Getah resin keemasan yang kental menetes harum ke dalam wadah tempurung kelapa.",
        "Aroma getah ini sangat tajam dan segar, dibenci oleh nyamuk rawa dan serangga penyengat!"
      ]);
      return;
    }

    if (c === 1) {
      if (!has("mangrove_resin")) {
        await say("Peracikan Minyak Gosok", [
          "Kamu membutuhkan 1x Getah Bakau Rawa untuk meracik minyak gosok herbal ini!",
          "Sadap getah dari pohon bakau ini terlebih dahulu."
        ]);
        return;
      }

      this._busyMangrove = true;
      G.lock++;
      sfx("step");
      this.popWorld(mx, my - 24, "Meracik minyak herbal...", "#81c784");

      await sleep(1000);
      sfx("crit");

      addItem("mangrove_resin", -1);
      addItem("bug_balm", 1);

      // Herbal smoke aura
      for (let i = 0; i < 7; i++) {
        const sp = this.add.circle(mx + rnd(-10, 10), my - rnd(12, 24), rnd(2, 3.5), 0xa5d6a7, 0.8).setDepth(my + 10);
        this.tweens.add({
          targets: sp,
          y: sp.y - rnd(14, 28),
          alpha: 0,
          duration: rnd(600, 1000),
          onComplete: () => sp.destroy()
        });
      }

      sfx("chest");
      this.popWorld(mx, my - 22, "🧴 Minyak Gosok Rawa Selesai!", "#c8e6c9");
      G.lock--;
      this._busyMangrove = false;

      await say("Minyak Gosok Rawa", [
        "Getah bakau dipadukan dengan rempah daun rawa menghasilkan Minyak Gosok Rawa harum sereh kayu putih!",
        "Oleskan untuk memulihkan 25 HP, 15 MP, dan melindungi tubuh dengan aroma penjaga hutan (DEF 3 menit)!"
      ]);
      return;
    }
  },

  async interactMeadowWillow(wx, wy) {
    if (this._busyWillow) return;

    const c = await choose("Pohon Rindang Padang Angin", [
      "🌸 Anyam Mahkota Bunga Padang (Bunga Aster & Daun Willow)",
      "🍃 Duduk Santai di Bawah Naungan (+20 HP/MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(20, stat("mhp") - S.hp);
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;
      sfx("step");
      this.popWorld(wx, wy - 24, "+20 HP & MP (Keteduhan)", "#c8e6c9");
      await say("Keteduhan Pohon Willow", [
        "Duduk di atas rumput empuk di bawah naungan sulur hijau willow yang menari lembut diterpa angin.",
        "Aroma bunga aster dan kesegaran udara padang mengembalikan staminamu dengan damai."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyWillow = true;
    G.lock++;
    sfx("step");
    this.popWorld(wx, wy - 28, "Merangkai kelopak bunga...", "#fff59d");

    await sleep(900);
    sfx("flap");

    // Flower petal bursts (Yellow, Pink, Green)
    const colors = [0xfbc02d, 0xf06292, 0x8bc34a, 0xffeb3b];
    for (let i = 0; i < 9; i++) {
      const pColor = colors[i % colors.length];
      const p = this.add.circle(wx + rnd(-16, 16), wy - rnd(14, 28), rnd(1.5, 3), pColor, 0.9).setDepth(wy + 8);
      this.tweens.add({
        targets: p,
        x: p.x + rnd(-18, 18),
        y: p.y - rnd(12, 24),
        alpha: 0,
        duration: rnd(600, 1100),
        onComplete: () => p.destroy()
      });
    }

    addItem("flower_crown", 1);
    sfx("chest");
    this.popWorld(wx, wy - 24, "🌸 Mahkota Bunga Padang Dibuat!", "#f8bbd0");
    G.lock--;
    this._busyWillow = false;

    await say("Mahkota Bunga Padang", [
      "Jari-jarimu dengan teliti menganyam ranting lentur willow dengan bunga-bunga aster kuning bermekaran.",
      "Mahkota bunga yang harum dan ceria berhasil dibuat! Kenakan untuk memulihkan 25 HP & MP serta langkah lincah berseri!"
    ]);
  },

  async stackStoneCairn(cx, cy) {
    if (this._busyCairn) return;

    const c = await choose("Menara Batu Keseimbangan", [
      "🪨 Susun Batu & Meditasi Zen (+35 MP & Fokus Tenang)",
      "🌊 Nikmati Suasana Tepi Danau (+15 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("water");
        this.popWorld(cx, cy - 20, "+15 MP Damai", "#a8e6cf");
      }
      await say("Ketentraman Tepi Danau", [
        "Riuh gemercik air danau menyapu bebatuan kerikil dengan irama alam yang begitu menenangkan kalbu."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyCairn = true;
    G.lock++;
    sfx("step");
    this.popWorld(cx, cy - 24, "Memusatkan konsentrasi...", "#d0dce8");

    // Rock placement animation: a small rock floating down carefully
    const pebble = this.add.circle(cx, cy - 30, 3, 0x8ba5ba).setDepth(cy + 10);
    this.tweens.add({
      targets: pebble,
      y: cy - 18,
      duration: 1000,
      ease: "Sine.easeInOut",
      onComplete: () => {
        sfx("step");
        // Tiny gentle wobble on cairn
        this.tweens.add({
          targets: pebble,
          x: cx + 1,
          duration: 100,
          yoyo: true,
          repeat: 2,
          onComplete: () => pebble.destroy()
        });
      }
    });

    await sleep(1300);
    sfx("crit");

    // Ripple of serene teal light
    const rip = this.add.circle(cx, cy - 10, 4, 0x80deea, 0.8).setDepth(cy + 5);
    this.tweens.add({
      targets: rip,
      scale: 6,
      alpha: 0,
      duration: 1200,
      onComplete: () => rip.destroy()
    });

    for (let i = 0; i < 6; i++) {
      const sp = this.add.circle(cx + rnd(-10, 10), cy - rnd(10, 24), rnd(1.5, 2.5), 0xb2ebf2, 0.9).setDepth(cy + 8);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 20),
        alpha: 0,
        duration: rnd(600, 1000),
        onComplete: () => sp.destroy()
      });
    }

    // Restore MP
    const mpGain = Math.min(35, stat("mmp") - S.mp);
    S.mp += mpGain;

    // Buff Zen Focus (DEF & Warmth/Focus)
    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    // Chance to find lake shell coin
    let bonusG = "";
    if (Math.random() < 0.45) {
      const g = rnd(10, 18);
      S.g += g;
      bonusG = " Di sela batu pantai, kamu menemukan Fosil Kerang Danau bernilai +" + g + "G!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+35 MP & Fokus Tenang!", "#80deea");
    G.lock--;
    this._busyCairn = false;

    await say("Harmoni Batu Zen", [
      "KLIK! Batu pipih diletakkan di puncak menara dengan keseimbangan yang sempurna.",
      "Menara batu berdiri kokoh melawan terpaan angin danau. Pikiranmu menjadi sangat jernih dan tenang (+35 MP, DEF +20% 3 menit)!" + bonusG
    ]);
  },

  async harvestIceChasm(cx, cy) {
    if (this._busyIceChasm) return;

    const c = await choose("Ceruk Es Kristal Glasier", [
      "❄️ Panen Lumut Es Kristal (Obat Dingin)",
      "💧 Basuh Muka dengan Embun Es Glasier (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("water");
        this.popWorld(cx, cy - 20, "+20 MP (Embun Glasier)", "#80cbc4");
      }
      await say("Embun Es Murni", [
        "Tetesan embun glasier yang jernih membasuh wajahmu dengan hawa dingin yang menyentak kesegaran batin!",
        "Pikiranmu kembali tajam dan jernih seperti cermin es (+20 MP)."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyIceChasm = true;
    G.lock++;
    sfx("step");
    this.popWorld(cx, cy - 24, "Memetik di celah es...", "#80deea");

    await sleep(800);
    sfx("crit");

    // Ice crystal sparkles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(cx + rnd(-8, 8), cy + rnd(-16, 6), rnd(1.5, 3), 0x80deea, 0.9).setDepth(cy + 10);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-14, 14),
        y: sp.y - rnd(10, 22),
        alpha: 0,
        duration: rnd(400, 700),
        onComplete: () => sp.destroy()
      });
    }

    addItem("frost_moss", 1);
    sfx("chest");
    this.popWorld(cx, cy - 22, "❄️ Lumut Es Kristal Didapat!", "#e0f7fa");
    G.lock--;
    this._busyIceChasm = false;

    await say("Panen Flora Es", [
      "KREEK... KLIK! Kamu berhasil memetik rumpun Lumut Es Kristal dari rekahan dinding glasier!",
      "Lumut ini memancarkan uap dingin lembut. Jika dikonsumsi, dapat memulihkan 30 HP, 35 MP, serta memadamkan luka bakar seketika!"
    ]);
  },

  async interactWishingTree(tx, ty) {
    if (this._busyWishTree) return;

    const c = await choose("Pohon Doa Keramat Desa", [
      "🎗️ Ikat Pita Harapan Petualang (+30 HP/MP & Berkah)",
      "📜 Baca Pita Harapan Warga Desa",
      "🍃 Kagumi Semilir Angin & Denting Lonceng (+15 MP)",
      "Kembali"
    ]);

    if (c === 2) {
      const mpGain = Math.min(15, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("bell");
        this.popWorld(tx, ty - 24, "+15 MP Damai", "#a8e6cf");
      }
      await say("Semilir Angin Pohon Doa", [
        "Desau dedaunan beringin purba menyanyikan tembang kedamaian masa silam.",
        "Gemerincing lonceng kayu ditiup angin sepoi menghadirkan ketenangan batin yang sejuk."
      ]);
      return;
    }

    if (c === 1) {
      const wishes = [
        "Pita Merah Cerah (Kiki si Anak Ayam): \"Semoga induk ayamku bertelur emas dan anak-anak ayam selalu lincah bebas dari serigala!\"",
        "Pita Emas Megah (Bu Sari): \"Semoga kebun dan toko kelontong desa selalu dipenuhi senyuman para pengelana, dan warga selalu berkecukupan.\"",
        "Pita Biru Tua (Pak Besi): \"Memohon pundak yang kuat dan palu yang tabah untuk menempa perlindungan bagi generasi muda Lumina.\"",
        "Pita Putih Halus (Tetua Desa): \"Semoga pohon tua ini senantiasa memayungi anak cucu kami dengan keteduhan dan kedamaian abadi.\"",
        "Pita Hijau Muda (Lina si Penyulam): \"Semoga Arka selalu terlindungi di setiap langkah perjalanannya melintasi rimba dan pegunungan...\""
      ];
      const pick = wishes[rnd(0, wishes.length - 1)];
      sfx("menu");
      await say("Pita Harapan Warga", [
        "Kamu menyentuh salah satu untaian pita kain yang terikat di dahan rendah:",
        pick
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyWishTree = true;
    G.lock++;
    sfx("step");
    this.popWorld(tx, ty - 28, "Mengikat pita doa...", "#ffe082");

    await sleep(900);
    sfx("flap");
    sfx("bell");

    // Falling glowing leaves & sparkles
    for (let i = 0; i < 9; i++) {
      const lx = tx + rnd(-18, 18);
      const ly = ty - rnd(30, 45);
      const leaf = this.add.circle(lx, ly, rnd(2, 3), 0x76d275, 0.9).setDepth(ty + 10);
      this.tweens.add({
        targets: leaf,
        x: lx + rnd(-16, 16),
        y: ty + rnd(0, 10),
        alpha: 0,
        duration: rnd(1400, 2000),
        ease: "Sine.easeIn",
        onComplete: () => leaf.destroy()
      });
    }

    // Golden aura burst
    const aura = this.add.circle(tx, ty, 6, 0xffeb3b, 0.6).setDepth(ty + 5);
    this.tweens.add({
      targets: aura,
      scale: 5,
      alpha: 0,
      duration: 1200,
      onComplete: () => aura.destroy()
    });

    await sleep(1000);

    // HP & MP restore
    const hpGain = Math.min(30, stat("mhp") - S.hp);
    const mpGain = Math.min(30, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;
    sfx("chest");

    // Chance to find old blessed copper coin in tree roots
    let bonusText = "";
    if (Math.random() < 0.6) {
      const coinFound = rnd(8, 15);
      S.g += coinFound;
      bonusText = " Di sela akar berlumut, kamu menemukan Koin Berkah +" + coinFound + "G!";
    }

    this.popWorld(this.p.x, this.p.y - 18, "+30 HP & MP Berkah!", "#ffff55");
    G.lock--;
    this._busyWishTree = false;

    await say("Berkah Pohon Doa Purba", [
      "Pita doamu kini terikat erat di dahan beringin tua, berkibar menyatu dengan doa-doa hangat warga desa.",
      "Kehangatan sukma mengalir ke dalam nadimu, memulihkan raga dan menenangkan pikiran (+30 HP & +30 MP)!" + bonusText
    ]);
  },























  async interactBarberChair(bx, by) {
    if (this._busyBarber) return;

    const c = await choose("Kursi Pangkas Rambut Kota", [
      "✂️ Rapikan Rambut & Segarkan Wajah (10G)",
      "🪞 Bercermin di Kaca Kayu Jati (+25 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(bx, by - 24, "+25 MP (Percaya Diri)", "#81d4fa");
      }
      await say("Cermin Kayu Jati", [
        "Bayangan dirimu di cermin menatap balik dengan sorot mata penuh tekad dan ketenangan batin.",
        "Kekaguman atas perjalanan panjang yang telah kau lalui mengembalikan fokus jiwamu."
      ]);
      return;
    }

    if (c !== 0) return;

    if (S.g < 10) {
      await say("Paman Roni si Tukang Pangkas", [
        "\"Wah, koinmu kurang dari 10G, Arka! Jangan cemas, kumpulkan koin dulu dari berpetualang dan mampirlah lagi nanti!\""
      ]);
      return;
    }

    S.g -= 10;
    sfx("coin");
    this._busyBarber = true;
    G.lock++;
    this.popWorld(bx, by - 26, "Duduk santai di kursi kulit...", "#b71c1c");

    // Snip-snip scissors sequence
    await sleep(500);
    sfx("crit");
    this.popWorld(bx - 6, by - 28, "Snip-snip...", "#cfd8dc");
    await sleep(400);
    sfx("crit");
    this.popWorld(bx + 6, by - 28, "Snip!", "#ffd54f");
    await sleep(400);
    sfx("step");
    this.popWorld(bx, by - 30, "Fsssh! Tonik wangi...", "#81d4fa");

    // Foam and scent sparkles
    for (let i = 0; i < 8; i++) {
      const sp = this.add.circle(bx + rnd(-10, 10), by - rnd(14, 28), rnd(1.5, 3), 0xfff9c4, 0.9).setDepth(by + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(12, 24),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(700);

    const hpGain = Math.min(45, stat("mhp") - S.hp);
    const mpGain = Math.min(45, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    // Cure bad statuses
    if (S.status) S.status = {};

    if (!S.buff) S.buff = {};
    S.buff.spd = Math.max(S.buff.spd || 0, 180);

    let bonusComb = "";
    if (Math.random() < 0.5) {
      addItem("sandalwood_comb", 1);
      bonusComb = " Paman Roni menghadiahkan sebilah Sisir Kayu Cendana wangi berukir sulur emas!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+45 HP/MP & Pesona Segar Bugar!", "#ffff55");
    G.lock--;
    this._busyBarber = false;

    await say("Penampilan Ksatria Segar", [
      "SNIP-SNIP! Gunting perak Paman Roni bergerak lincah merapikan rambut kusut dan debu petualangan.",
      "Usapan handuk hangat dan semprotan tonik lemon kayu manis seketika menyegarkan seluruh wajah dan pikiranmu!",
      "Status buruk terhapus, pulih 45 HP & 45 MP, serta langkah riang berpesona (SPD +15% 3 menit)!" + bonusComb,
      "Paman Roni tersenyum bangga: \"Nah, lihat dirimu di cermin, Arka! Gagah dan siap menaklukkan dunia!\""
    ]);
  },

  async interactStreetGaslamp(lx, ly) {
    if (this._busyGaslamp) return;

    const c = await choose("Tiang Lentera Jalanan Kota", [
      "🔥 Nyalakan Sumbu Lentera Jalan (+35 HP/MP & Cahaya Pelindung)",
      "✨ Kagumi Pendaran Cahaya Lentera (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(lx, ly - 26, "+20 MP (Hangat Kota)", "#fff9c4");
      }
      await say("Kehangatan Malam Kota", [
        "Pendaran cahaya lentera gas menyinari trotoar batu ubin dengan kehangatan emas yang menentramkan.",
        "Kota Lumina selalu terasa bersahabat dan aman bagi setiap pengelana yang melintas."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyGaslamp = true;
    G.lock++;
    sfx("step");
    this.popWorld(lx, ly - 28, "Memutar katup minyak...", "#ffca28");

    await sleep(600);
    sfx("crit");
    this.popWorld(lx, ly - 32, "POOF-FWSH!", "#ff7043");

    // Dynamic light registration if lights array exists
    if (this.lights && Array.isArray(this.lights)) {
      this.lights.push({ x: lx, y: ly - 28, r: 55, color: 0xffca28 });
    }

    // Sparkle and fire burst particles
    for (let i = 0; i < 8; i++) {
      const sp = this.add.circle(lx + rnd(-6, 6), ly - rnd(26, 38), rnd(1.5, 3), 0xffca28, 0.9).setDepth(ly + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 20),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(800);

    const hpGain = Math.min(35, stat("mhp") - S.hp);
    const mpGain = Math.min(35, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    let bonusReward = "";
    if (Math.random() < 0.45) {
      addItem("brass_igniter", 1);
      bonusReward = " Paman Gani menghadiahkan sebutir Pemantik Kuningan berukir lambang mentari!";
    } else {
      const g = rnd(10, 16);
      S.g += g;
      bonusReward = " Paman Gani memberikan uang saku tip +" + g + "G atas bantuanmu!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+35 HP/MP & Cahaya Pelindung!", "#ffff55");
    G.lock--;
    this._busyGaslamp = false;

    await say("Lentera Jalan Kota Menyala", [
      "Api menyala terang benderang di dalam kubah kaca lentera, menebarkan pendaran cahaya oranye keemasan hangat ke seluruh penjuru jalan!",
      "Cahaya pelindung malam mengusir bayang-bayang kelam (+35 HP, +35 MP & DEF 3 menit)!",
      "Paman Gani tersenyum lega sambil menyeka dahi: \"Terima kasih banyak atas bantuanmu, Arka! Berkatmu, para pejalan malam tidak akan tersesat!\"" + bonusReward
    ]);
  },

  async interactSkewerCamp(cx, cy) {
    if (this._busySkewer) return;

    const c = await choose("Api Unggun Sate Buah Hutan", [
      "🍎 Bakar Sate Apel Madu di Bara Api (Butuh 1x Apel)",
      "🔥 Hangatkan Badan di Dekat Bara Api (+25 HP/MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(25, stat("mhp") - S.hp);
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;
      sfx("step");
      this.popWorld(cx, cy - 20, "+25 HP & MP (Kehangatan Api)", "#ffccbc");
      await say("Kehangatan Api Perkemahan", [
        "Gemeretak bara api kayu cemara memancarkan kehangatan yang meredakan hawa dingin rimba malam.",
        "Duduk santai di dekat api unggun memulihkan staminamu dengan tenang."
      ]);
      return;
    }

    if (c !== 0) return;

    if (!has("apple")) {
      await say("Pengelana Berkemah", [
        "\"Punya buah apel segar, kawan? Petiklah dari pohon apel kebun desa atau goyang dahan pohon buah!\"",
        "\"Tusukkan potongan apel ke ranting kayu manis dan panggang di atas bara ini, rasanya manis legit luar biasa!\""
      ]);
      return;
    }

    this._busySkewer = true;
    G.lock++;
    sfx("step");
    this.popWorld(cx, cy - 24, "Memutar tusukan apel di atas bara...", "#ff7043");

    // Sizzling caramel sound and smoke animation
    await sleep(500);
    sfx("step");
    this.popWorld(cx - 5, py = cy - 26, "Tssss...", "#ffab91");
    await sleep(400);
    sfx("crit");
    this.popWorld(cx + 5, cy - 26, "Krak-klik...", "#ffd54f");
    await sleep(400);
    sfx("step");

    // Warm sparks and caramel aroma particles
    for (let i = 0; i < 8; i++) {
      const sp = this.add.circle(cx + rnd(-8, 8), cy - rnd(10, 22), rnd(1.5, 3), 0xff7043, 0.9).setDepth(cy + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(14, 26),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("apple", -1);
    addItem("glazed_skewer", 1);

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "🍎 Sate Apel Bakar Madu Selesai!", "#ffff55");
    G.lock--;
    this._busySkewer = false;

    await say("Sate Apel Bakar Madu", [
      "Bara api cemara memanggang potongan apel hingga gula buah dan karamel madunya mendesis keemasan!",
      "Aroma kayu manis dan apel panggang legit menguar menggugah selera!",
      "Makan untuk memulihkan 50 HP, 35 MP serta menganugerahkan kehangatan fisik tempur (ATK 3 menit)!"
    ]);
  },

  async interactBirdBath(bx, by) {
    if (this._busyBirdBath) return;

    const c = await choose("Bejana Mandi Burung Kuil", [
      "💧 Tuangkan Air Segar & Amati Burung Mandi (+40 HP/MP & Berkah)",
      "🕊️ Duduk Menikmati Ketenangan Taman Kuil (+25 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("bell");
        this.popWorld(bx, by - 22, "+25 MP (Hening Damai)", "#81d4fa");
      }
      await say("Kedamaian Taman Kuil", [
        "Aroma dupa harum dan suara gemericik air lembut dari bejana marmer menghadirkan keteduhan jiwa.",
        "Kicauan merdu burung-burung kenari menyatu dengan semilir angin sejuk di pelataran kuil suci."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyBirdBath = true;
    G.lock++;
    sfx("water");
    this.popWorld(bx, by - 24, "Menuangkan air sejuk...", "#4fc3f7");

    await sleep(600);
    sfx("flap");
    sfx("water");

    // Splash water drops
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(bx + rnd(-8, 8), by - rnd(8, 16), rnd(1.5, 3), 0x81d4fa, 0.9).setDepth(by + 10);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-10, 10),
        y: sp.y - rnd(10, 18),
        alpha: 0,
        duration: rnd(400, 750),
        onComplete: () => sp.destroy()
      });
    }

    // Yellow canary feathers / sparkles
    for (let i = 0; i < 6; i++) {
      const gp = this.add.circle(bx + rnd(-10, 10), by - rnd(12, 24), rnd(1.5, 2.5), 0xffd54f, 0.9).setDepth(by + 12);
      this.tweens.add({
        targets: gp,
        y: gp.y - rnd(12, 22),
        alpha: 0,
        duration: rnd(600, 1000),
        onComplete: () => gp.destroy()
      });
    }

    await sleep(800);

    const hpGain = Math.min(40, stat("mhp") - S.hp);
    const mpGain = Math.min(40, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    let bonusCanary = "";
    if (Math.random() < 0.5) {
      addItem("canary_feather", 1);
      bonusCanary = " Di bibir bejana pualam, burung kenari meninggalkan sehelai Bulu Kenari Emas berkilauan!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+40 HP/MP & Berkah Kesucian!", "#ffff55");
    G.lock--;
    this._busyBirdBath = false;

    await say("Mandi Burung Kenari Suci", [
      "SPLISH-SPLASH! Burung kenari kuning berenang mengepakkan sayapnya dengan sukacita di air bejana marmer yang jernih!",
      "Percikan air murni dan kicauannya menyucikan pikiranmu, memulihkan 40 HP & 40 MP serta perlindungan batin (DEF 3 menit)!" + bonusCanary
    ]);
  },

  async interactStonePestle(px, py) {
    if (this._busyPestle) return;

    const c = await choose("Lumpang Batu Apotek Desa", [
      "🌿 Tumbuk Salep Hijau Mujarab (Butuh 1x Daun Obat)",
      "👃 Hirup Aroma Rempah Daun Segar (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(px, py - 20, "+20 MP (Aroma Herba)", "#a5d6a7");
      }
      await say("Aroma Herba Hutan", [
        "Aroma mint dingin dan perasan daun obat menguar segar dari permukaan lumpang granit.",
        "Pernafasanmu menjadi sangat lega dan pikiranmu kembali tenang."
      ]);
      return;
    }

    if (c !== 0) return;

    if (!has("herb")) {
      await say("Bu Sari si Apoteker", [
        "\"Bawalah sehelai Daun Obat (herb) yang tumbuh di tepi jalan setapak hutan kemari, Arka!\"",
        "\"Lumpang batu ini siap membantumu melumatkan daunnya menjadi Salep Hijau Mujarab untuk menutup luka!\""
      ]);
      return;
    }

    this._busyPestle = true;
    G.lock++;
    sfx("step");
    this.popWorld(px, py - 24, "Menumbuk daun obat...", "#43a047");

    // Grinding sound and rhythmic pestle beats
    await sleep(400);
    sfx("step");
    this.popWorld(px - 5, py - 26, "Dok...", "#81c784");
    await sleep(400);
    sfx("crit");
    this.popWorld(px + 5, py - 26, "Kletuk...", "#a5d6a7");
    await sleep(400);
    sfx("step");
    this.popWorld(px, py - 28, "Dok!", "#81c784");

    // Green herbal juice sparkles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(px + rnd(-10, 10), py - rnd(8, 20), rnd(1.5, 3), 0x66bb6a, 0.9).setDepth(py + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(12, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("herb", -1);
    addItem("healing_salve", 1);

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "🌿 Salep Hijau Mujarab Berhasil Diracik!", "#ffff55");
    G.lock--;
    this._busyPestle = false;

    await say("Salep Hijau Mujarab", [
      "Alu batu granit melumatkan helai-helai daun obat hingga menghasilkan pasta salep herbal hijau tua beraroma mint!",
      "Salep disimpan rapi ke dalam toples keramik. Oleskan untuk memulihkan 45 HP, 15 MP serta menyembuhkan racun tubuh (DEF 3 menit)!",
      "Bu Sari tersenyum puas: \"Racikan yang sangat halus dan padat khasiat, Arka! Simpanlah baik-baik untuk perjalananmu!\""
    ]);
  },

  async interactCheeseBarrel(bx, by) {
    if (this._busyCheese) return;

    const c = await choose("Tong Fermentasi Keju Padang", [
      "🧀 Potong & Ambil Irisan Keju Emas (+55 HP/30 MP & Keju Padang)",
      "👃 Hirup Aroma Gurih Fermentasi (+25 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(bx, by - 20, "+25 MP (Aroma Susu)", "#fff9c4");
      }
      await say("Aroma Keju Murni", [
        "Aroma harum susu matang dan mentega gurih menguar lembut dari permukaan roda keju yang mengilap.",
        "Membayangkan kelezatan makanan peternakan padang rumput mengembalikan kesegaran batinmu."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyCheese = true;
    G.lock++;
    sfx("step");
    this.popWorld(bx, by - 22, "Mengiris roda keju...", "#ffd54f");

    await sleep(750);
    sfx("crit");

    // Butter gold sparkles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(bx + rnd(-10, 10), by - rnd(8, 20), rnd(1.5, 3), 0xffd54f, 0.9).setDepth(by + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(800);

    const hpGain = Math.min(55, stat("mhp") - S.hp);
    const mpGain = Math.min(30, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    addItem("aged_cheese", 1);
    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+55 HP / +30 MP & Keju Padang Emas!", "#ffff55");
    G.lock--;
    this._busyCheese = false;

    await say("Keju Padang Emas", [
      "Pisau membelah roda keju dengan mulus, menampakkan tekstur keju padat beraroma mentega susu yang gurih!",
      "Keju bergizi tinggi ini mengenyangkan perut dan memperkuat ketahanan tubuh (+55 HP, +30 MP & DEF 3 menit)!",
      "Paman Bram tersenyum ramah: \"Nikmatilah keju fermentasi terbaik kami, anak muda! Semangat bertualang!\""
    ]);
  },

  async interactPottersWheel(wx, wy) {
    if (this._busyPotter) return;

    const c = await choose("Roda Putar Gerabah Kota", [
      "🏺 Putar Roda & Bentuk Guci Keramik (+40 HP/MP & Guci Keramik)",
      "🔍 Amati Jejeran Keramik Jemuran (+25 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(25, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(wx, wy - 20, "+25 MP (Seni Rupa)", "#ffccbc");
      }
      await say("Koleksi Gerabah Paman Tedi", [
        "Barisan cangkir, mangkok, dan guci tanah liat merah dijemur rapi di bawah sinar matahari.",
        "Aroma khas tanah liat basah dan ketelitian karya seni keramik menghadirkan kekaguman mendalam."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyPotter = true;
    G.lock++;
    sfx("step");
    this.popWorld(wx, wy - 24, "Memutar roda piringan...", "#d84315");

    await sleep(700);
    sfx("water");
    this.popWorld(wx, wy - 26, "Membelai tanah liat basah...", "#ff8a65");

    // Clay splashing and sparkle particles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(wx + rnd(-10, 10), wy - rnd(8, 20), rnd(1.5, 3), 0xff8a65, 0.9).setDepth(wy + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(900);

    const hpGain = Math.min(40, stat("mhp") - S.hp);
    const mpGain = Math.min(40, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    addItem("clay_vase", 1);
    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+40 HP/MP & Guci Keramik Halus!", "#ffff55");
    G.lock--;
    this._busyPotter = false;

    await say("Karya Seni Gerabah", [
      "Kedua tanganmu menarik tanah liat basah ke atas perlahan mengikuti putaran roda yang seimbang.",
      "Sebuah Guci Keramik Halus dengan lekuk leher ramping nan anggun berhasil kamu bentuk!",
      "Karyamu bernilai jual tinggi (25G) dan menyuntikkan kebanggaan kreatif (+40 HP/MP, DEF 3 menit)!"
    ]);
  },

  async interactWoodenLoom(lx, ly) {
    if (this._busyLoom) return;

    const c = await choose("Alat Tenun Kayu Desa", [
      "🧣 Tenun Syal Wol Hangat (Butuh 1x Bulu Domba)",
      "🔍 Amati Pola Motif Kain Tenun (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(lx, ly - 20, "+20 MP (Ketenangan Jiwa)", "#ffcdd2");
      }
      await say("Seni Tenun Leluhur", [
        "Jalinan benang lungsi dan pakan membentuk pola motif bunga matahari dan lereng bukit khas Desa Lumina.",
        "Ketelitian tangan para penenun desa menginspirasi ketenangan batin yang mendalam."
      ]);
      return;
    }

    if (c !== 0) return;

    if (!has("wool")) {
      await say("Nenek Martha", [
        "\"Bulu domba dari padang rumput sangat lembut dan hangat, anak muda!\"",
        "\"Bawalah sehelai Bulu Domba (wool) dari Padang Angin kemari, dan kita bisa menenun sehelai Syal Wol pelindung dingin yang nyaman!\""
      ]);
      return;
    }

    this._busyLoom = true;
    G.lock++;
    sfx("step");
    this.popWorld(lx, ly - 24, "Menginjak pedal tenun...", "#d32f2f");

    // Loom rhythmic weaving sound and animation
    await sleep(400);
    sfx("step");
    this.popWorld(lx - 6, ly - 26, "Kletuk...", "#ffcdd2");
    await sleep(400);
    sfx("crit");
    this.popWorld(lx + 6, ly - 26, "Klak...", "#fff9c4");
    await sleep(400);
    sfx("step");
    this.popWorld(lx, ly - 28, "Kletuk!", "#ffcdd2");

    // Wool yarn particles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(lx + rnd(-10, 10), ly - rnd(8, 20), rnd(1.5, 3), 0xef5350, 0.9).setDepth(ly + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(12, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("wool", -1);
    addItem("wool_scarf", 1);

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "🧣 Syal Wol Tenun Berhasil Dipintal!", "#ffff55");
    G.lock--;
    this._busyLoom = false;

    await say("Syal Wol Tenun Hangat", [
      "Gelendong kayu meluncur bolak-balik dengan irama teratur merajut bulu domba menjadi selembar kain yang halus.",
      "Syal Wol Tenun merah hangat berhasil diselesaikan! Gunakan untuk memulihkan 35 HP, 25 MP serta kebal dari angin dingin (DEF & Hangat 3 menit)!",
      "Nenek Martha tersenyum bangga: \"Jari-jarimu sangat terampil, Arka! Syal ini akan menjagamu tetap hangat di puncak gunung sekalipun!\""
    ]);
  },

  async interactBirdHouse(bx, by) {
    if (this._busyBirdHouse) return;

    const c = await choose("Rumah Burung Taman Desa", [
      "🌾 Isi Mangkok Pakan Benih (+30 HP/MP & Berkah)",
      "🐦 Dengarkan Kicauan Pagi Burung Pipit (+15 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(bx, by - 22, "+15 MP (Kicauan Pipit)", "#fff59d");
      }
      await say("Kicauan Burung Pipit", [
        "CHIRP-CHIRP! Burung-burung pipit kecil melompat lincah di atap jerami rumah burung.",
        "Kicauan riang mereka berpadu dengan udara pagi Desa Lumina yang segar dan menyejukkan."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyBirdHouse = true;
    G.lock++;
    sfx("step");
    this.popWorld(bx, by - 24, "Menaruh benih gandum...", "#fff59d");

    await sleep(750);
    sfx("flap");

    // Little sparrow fluttering down animation
    const bird = this.add.circle(bx + 8, by - 36, 2.5, 0x8d6e63).setDepth(by + 10);
    this.tweens.add({
      targets: bird,
      x: bx + 1,
      y: by - 14,
      duration: 600,
      ease: "Quad.easeOut",
      onComplete: () => {
        sfx("water");
        // Happy bounce
        this.tweens.add({
          targets: bird,
          y: by - 16,
          yoyo: true,
          repeat: 2,
          duration: 150
        });
      }
    });

    // Heart particles
    for (let i = 0; i < 5; i++) {
      const sp = this.add.circle(bx + rnd(-8, 8), by - rnd(14, 26), rnd(1.5, 2.5), 0xf48fb1, 0.9).setDepth(by + 12);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 20),
        alpha: 0,
        duration: rnd(600, 1000),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(900);

    const hpGain = Math.min(30, stat("mhp") - S.hp);
    const mpGain = Math.min(30, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.spd = Math.max(S.buff.spd || 0, 180);

    let bonusFeather = "";
    if (Math.random() < 0.5) {
      addItem("sparrow_feather", 1);
      bonusFeather = " Burung pipit berputar gembira dan meninggalkan sehelai Bulu Pipit Berbintik emas!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+30 HP/MP & Berkah Sahabat!", "#ffff55");
    bird.destroy();
    G.lock--;
    this._busyBirdHouse = false;

    await say("Sahabat Pipit Taman Desa", [
      "CHIRP! Burung pipit kecil melahap butiran benih dengan riang gembira!",
      "Kepedulianmu terhadap satwa desa menghangatkan hati, memulihkan 30 HP & 30 MP serta langkah riang (spd 3 menit)!" + bonusFeather
    ]);
  },

  async interactStreetViolin(vx, vy) {
    if (this._busyViolin) return;

    const c = await choose("Pojok Biola Kakek Leo", [
      "🎻 Dengarkan Gesekan Biola yang Syahdu (+40 HP/MP)",
      "🪙 Beri Apresiasi & Petik Dawai Harmonis (5G)",
      "Kembali"
    ]);

    if (c === 0) {
      this._busyViolin = true;
      G.lock++;
      sfx("step");
      this.popWorld(vx, vy - 18, "Mendengarkan melodi biola...", "#ffd54f");

      await sleep(600);
      sfx("bell");
      await sleep(400);
      sfx("bell");

      // Music note sparkles
      for (let i = 0; i < 8; i++) {
        const nx = vx + rnd(-12, 12);
        const ny = vy - rnd(10, 26);
        const note = this.add.circle(nx, ny, rnd(1.5, 3), 0xfff59d, 0.9).setDepth(vy + 10);
        this.tweens.add({
          targets: note,
          x: nx + rnd(-12, 12),
          y: ny - rnd(14, 28),
          alpha: 0,
          duration: rnd(700, 1200),
          onComplete: () => note.destroy()
        });
      }

      const hpGain = Math.min(40, stat("mhp") - S.hp);
      const mpGain = Math.min(40, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;

      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "+40 HP & MP (Damai)", "#fff59d");
      G.lock--;
      this._busyViolin = false;

      await say("Melodi Biola Jalanan", [
        "Gesekan dawai biola tua Kakek Leo mengalun puitis menyapa langit alun-alun Gerbang Kota Lumina.",
        "Melodi yang lembut menyentuh sukma, meluruhkan rasa lelah perjalanan jauhmu (+40 HP & +40 MP)!"
      ]);
      return;
    }

    if (c === 1) {
      if (S.g < 5) {
        await say("Kakek Leo", [
          "\"Jangan cemas soal koin, anak muda. Duduklah dan dengarkan musikku dengan tenang saja!\""
        ]);
        return;
      }

      S.g -= 5;
      sfx("coin");
      this._busyViolin = true;
      G.lock++;
      this.popWorld(vx, vy - 20, "Memasukkan 5G ke koper...", "#ffd54f");

      await sleep(700);
      sfx("bell");
      sfx("crit");

      // Harmonic note bursts
      for (let i = 0; i < 9; i++) {
        const sp = this.add.circle(vx + rnd(-14, 14), vy - rnd(12, 28), rnd(2, 3.5), 0xffca28, 0.9).setDepth(vy + 12);
        this.tweens.add({
          targets: sp,
          y: sp.y - rnd(16, 32),
          alpha: 0,
          duration: rnd(600, 1100),
          onComplete: () => sp.destroy()
        });
      }

      addItem("violin_string", 1);
      if (!S.buff) S.buff = {};
      S.buff.spd = Math.max(S.buff.spd || 0, 180);

      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "🎻 Harmoni Biola! (+Senar Sutra)", "#ffff55");
      G.lock--;
      this._busyViolin = false;

      await say("Harmoni Nada & Penghargaan", [
        "Kakek Leo tersenyum haru dengan mata berbinar. Bersama-sama, kalian memetik nada harmoni dawai yang merdu!",
        "Para pejalan kaki di alun-alun berhenti sejenak dan bertepuk tangan kagum!",
        "Kakek Leo: \"Terima kasih atas apresiasimu yang tulus, petualang muda! Ambillah gulungan Senar Biola Sutra murni ini (Langkah Riang 3 menit)!\""
      ]);
      return;
    }
  },

  async harvestFossilBed(fx, fy) {
    if (this._busyFossil) return;

    const c = await choose("Singkapan Fosil Purba Rawa", [
      "⛏️ Gali & Bersihkan Fosil Amonit",
      "📜 Amati Lapisan Geologi Samudra Purba (+30 HP/MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(30, stat("mhp") - S.hp);
      const mpGain = Math.min(30, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;
      sfx("step");
      this.popWorld(fx, fy - 18, "+30 HP & MP (Inspirasi Kuno)", "#d7ccc8");
      await say("Geologi Samudra Purba", [
        "Lapisan tanah liat merah bergaris kapur ini memperlihatkan endapan sedimen laut berumur jutaan tahun.",
        "Membayangkan bahwa rawa berkabut ini dahulu adalah samudra biru luas memperkaya wawasan dan menenangkan batinmu."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyFossil = true;
    G.lock++;
    sfx("step");
    this.popWorld(fx, fy - 22, "Mengupas lapisan lempung...", "#bcaaa4");

    await sleep(750);
    sfx("step");
    await sleep(350);
    sfx("flap");

    // Earthy brown and gold dust sparkles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(fx + rnd(-10, 10), fy - rnd(8, 20), rnd(1.5, 3), 0xd7ccc8, 0.9).setDepth(fy + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(10, 22),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("fossil_ammonite", 1);
    sfx("chest");

    let bonusCoin = "";
    if (Math.random() < 0.4) {
      const g = rnd(10, 18);
      S.g += g;
      bonusCoin = " Di sela batu kapur, terselip pula koin tembaga fosil kuno +" + g + "G!";
    }

    this.popWorld(fx, fy - 20, "🐚 Fosil Amonit Berhasil Digali!", "#efebe9");
    G.lock--;
    this._busyFossil = false;

    await say("Fosil Amonit Purba", [
      "TING-TIK! Lapisan kapur terkelupas sempurna, menampakkan cangkang spiral Amonit Purba utuh!",
      "Lekukan geometris cangkang membatu ini sangat indah. Koleksi berharga tinggi (35G) yang sangat disukai para sarjana Akademi!" + bonusCoin
    ]);
  },

  async playHighStriker(sx, sy) {
    if (this._busyHighStriker) return;

    await say("Boris si Raksasa Pasar", [
      "Wahahaha! Selamat datang di Tiang Uji Tenaga Martil Gong Pasar Kota Lumina!",
      "Hanya mereka yang memiliki sentakan otot baja yang sanggup membuat gong puncak berdentang! Taruhan 15 Koin Emas untuk satu ayunan godam!"
    ]);

    const c = await choose("Uji Kekuatan Pukul Martil Gong", [
      "🔨 Ayun Martil Godam Sekuat Tenaga (Taruhan 15G)",
      "💪 Tanya Tips Ayunan Boris",
      "Mundur Dulu"
    ]);

    if (c === 1) {
      await say("Boris si Raksasa Pasar", [
        "Kuncinya adalah mengunci pandangan pada meteran tenaga yang melesat naik turun!",
        "Tepat saat meteran menyentuh puncak teratas (warna emas), hantamkan godam secepat kilat dengan tombol aksi [A]!"
      ]);
      return;
    }

    if (c !== 0) return;

    if (S.g < 15) {
      await say("Boris si Raksasa Pasar", [
        "Koinmu kurang dari 15G, sobat! Pasar butuh koin untuk hadiah turnamen, cari koin dulu sana!"
      ]);
      return;
    }

    S.g -= 15;
    sfx("coin");
    this._busyHighStriker = true;
    G.lock++;

    this.popWorld(this.p.x, this.p.y - 18, "Mengangkat martil godam...", "#ffd54f");
    await sleep(700);

    // Vertical oscillation power meter
    const meterW = 14, meterH = 90;
    const cx = VW / 2, cy = VH / 2 - 10;

    const bgBox = this.add.rectangle(cx, cy, meterW + 18, meterH + 24, 0x1a1a24, 0.85).setScrollFactor(0).setDepth(2000);
    const meterBg = this.add.rectangle(cx, cy, meterW, meterH, 0x37474f).setScrollFactor(0).setDepth(2001);
    // Green top bullseye zone
    const topZone = this.add.rectangle(cx, cy - meterH / 2 + 10, meterW, 18, 0xffd54f).setScrollFactor(0).setDepth(2002);
    // Mid zone
    const midZone = this.add.rectangle(cx, cy - 8, meterW, 30, 0x43a047).setScrollFactor(0).setDepth(2003);
    // Moving slider bar
    const slider = this.add.rectangle(cx, cy, meterW + 4, 5, 0xff1744).setScrollFactor(0).setDepth(2004);
    const label = this.add.text(cx, cy - meterH / 2 - 16, "TEKAN [A] PADA PUNCAK!", {
      fontFamily: "sans-serif", fontSize: "9px", color: "#ffffaa", fontStyle: "bold", stroke: "#000", strokeThickness: 2
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2005);

    let swung = false;
    let barY = 0; // -40 (top) to +40 (bottom)
    let speed = 2.6 + rnd(0, 0.8);
    let dir = -1;

    const onSwing = () => {
      if (swung) return;
      swung = true;
    };

    const spaceKey = this.input.keyboard.addKey("SPACE");
    const jKey = this.input.keyboard.addKey("J");
    const zKey = this.input.keyboard.addKey("Z");
    spaceKey.on("down", onSwing);
    jKey.on("down", onSwing);
    zKey.on("down", onSwing);

    const tapZone = this.add.zone(0, 0, VW, VH).setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(1999);
    tapZone.on("pointerdown", onSwing);

    while (!swung) {
      await sleep(20);
      barY += speed * dir;
      if (barY < -38) { barY = -38; dir = 1; }
      if (barY > 38) { barY = 38; dir = -1; }
      slider.y = cy + barY;
    }

    spaceKey.off("down", onSwing);
    jKey.off("down", onSwing);
    zKey.off("down", onSwing);
    tapZone.destroy();
    bgBox.destroy();
    meterBg.destroy();
    topZone.destroy();
    midZone.destroy();
    slider.destroy();
    label.destroy();

    sfx("swing");
    await sleep(250);
    sfx("crit");
    this.cameras.main.shake(300, 0.015);

    // Slug sliding up animation
    const slug = this.add.circle(sx, sy + 10, 3, 0xffca28).setDepth(sy + 10);
    const distFromTop = Math.abs(barY - (-38));
    const isJackpot = distFromTop <= 7;
    const isMedium = distFromTop <= 26;

    const targetY = isJackpot ? sy - 38 : (isMedium ? sy - 18 : sy - 2);

    this.tweens.add({
      targets: slug,
      y: targetY,
      duration: 500,
      ease: "Quad.easeOut",
      onComplete: () => {
        if (isJackpot) {
          sfx("bell");
          sfx("crit");
          this.popWorld(sx, sy - 42, "🔔 DENTANG GONG! (100 POIN!)", "#ffff55");
        } else if (isMedium) {
          sfx("step");
          this.popWorld(sx, sy - 22, "Kuat! (70 Poin)", "#81c784");
        } else {
          sfx("hurt");
          this.popWorld(sx, sy - 12, "Lumayan! (40 Poin)", "#ffb74d");
        }
        setTimeout(() => slug.destroy(), 1200);
      }
    });

    await sleep(900);
    G.lock--;
    this._busyHighStriker = false;

    if (isJackpot) {
      sfx("chest");
      S.g += 40;
      addItem("mini_trophy", 1);
      if (!S.buff) S.buff = {};
      S.buff.atk = Math.max(S.buff.atk || 0, 180);
      this.popWorld(this.p.x, this.p.y - 18, "🏆 JUARA PUKUL GONG! (+40G)", "#ffff55");
      await say("Gong Puncak Berdentang!", [
        "KLAAANNGGG!! Dentangan gong tembaga membahana ke seluruh penjuru alun-alun pasar!",
        "Para pengunjung dan pedagang pasar menoleh dan bersorak kagum!",
        "Boris tertawa bangga: \"GILA! Tenaga monster! Ambillah 40 Koin Emas ini dan Piala Martil Emas sebagai bukti kekuatan fisikmu (Buff ATK 3 menit)!\""
      ]);
    } else if (isMedium) {
      sfx("coin");
      S.g += 20;
      this.popWorld(this.p.x, this.p.y - 18, "Pukulan Mantap! (+20G)", "#81c784");
      await say("Hantaman Bertenaga", [
        "Peluru timah melesat tinggi hingga mencapai tiga perempat tiang menara!",
        "Boris: \"Ototmu mantap sekali anak muda! Tinggal sedikit lagi sentakan! Ini hadiah koin 20G untukmu!\""
      ]);
    } else {
      addItem("apple", 1);
      this.popWorld(this.p.x, this.p.y - 18, "Hadiah Hiburan (+1 Apel)", "#ffb74d");
      await say("Ayunan Permulaan", [
        "Peluru timah meluncur sampai separuh tiang sebelum jatuh kembali.",
        "Boris: \"Hahaha! Ayunan yang lumayan, tapi ototmu butuh sarapan lebih banyak! Nih makan sebutir Apel Segar manis biar tenagamu berlipat!\""
      ]);
    }
  },

  async interactWiseOwl(ox, oy) {
    if (this._busyOwl) return;

    const c = await choose("Pohon Burung Hantu Bijak", [
      "🦉 Sapa Burung Hantu & Simak Petuah (+35 HP/MP & Fokus Malam)",
      "🌲 Kagumi Tatapan Tenang Burung Hantu (+15 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(ox, oy - 24, "+15 MP Hening", "#a5d6a7");
      }
      await say("Keheningan Pohon Tua", [
        "Burung hantu itu memiringkan kepalanya perlahan, menatapmu dengan mata bulat emas yang meneduhkan batin.",
        "Angin malam berhembus lembut di antara tajuk daun ek purba."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyOwl = true;
    G.lock++;
    sfx("flap");
    this.popWorld(ox, oy - 28, "Menyapa burung hantu...", "#ffd54f");

    await sleep(800);
    sfx("menu");
    await sleep(400);

    // Owl feather and golden glow sparkles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(ox + rnd(-10, 10), oy - rnd(14, 28), rnd(1.5, 3), 0xffd54f, 0.9).setDepth(oy + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(12, 22),
        alpha: 0,
        duration: rnd(600, 1000),
        onComplete: () => sp.destroy()
      });
    }

    const hpGain = Math.min(35, stat("mhp") - S.hp);
    const mpGain = Math.min(35, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.atk = Math.max(S.buff.atk || 0, 180);

    let bonusFeather = "";
    if (Math.random() < 0.45) {
      addItem("owl_feather", 1);
      bonusFeather = " Sehelai Bulu Burung Hantu halus melayang jatuh ke tanganmu!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+35 HP/MP & Fokus Malam!", "#ffff55");
    G.lock--;
    this._busyOwl = false;

    const isNight = (typeof isNightTime === "function") ? isNightTime() : false;
    let loreMsg = "";
    if (isNight) {
      loreMsg = "\"Huuu... Matahari terbenam bukan tanda kegelapan menang, Arka. Di danau dan sungai, ikan-ikan rembulan bercahaya menyongsong petualang yang terjaga.\"";
    } else {
      loreMsg = "\"Huuu... Manfaatkan terang siang untuk melangkah jauh. Namun jangan lupa kembali ke perapian hangat saat bintang fajar mulai bertebaran.\"";
    }

    await say("Petuah Burung Hantu Bijak", [
      "Burung hantu hutan mengedipkan matanya perlahan dan bersuara kukuk lembut:",
      loreMsg,
      "Kesejukan petuahnya menenangkan jiwamu, memulihkan 35 HP & 35 MP serta menajamkan fokus serangan (ATK 3 menit)!" + bonusFeather
    ]);
  },

  async harvestCrystalGeode(gx, gy) {
    if (this._busyGeode) return;

    const c = await choose("Batu Geoda Kristal Gua", [
      "⛏️ Belah Kerak Geoda & Ambil Permata Ungu",
      "🔮 Kagumi Pendaran Cahaya Kristal (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("step");
        this.popWorld(gx, gy - 18, "+20 MP (Pendaran Batin)", "#ce93d8");
      }
      await say("Cahaya Kristal Mistis", [
        "Pendaran ungu lembut dari rongga kristal geoda menyinari bebatuan lembap di lorong gua yang sunyi.",
        "Ketenangan batin meresap ke dalam pikiranmu, mengembalikan fokus magis (+20 MP)."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyGeode = true;
    G.lock++;
    sfx("step");
    this.popWorld(gx, gy - 24, "Membelah kerak batu...", "#ba68c8");

    await sleep(700);
    sfx("crit");
    this.cameras.main.shake(250, 0.012);

    // Amethyst purple crystal sparkles
    for (let i = 0; i < 8; i++) {
      const sp = this.add.circle(gx + rnd(-10, 10), gy - rnd(8, 20), rnd(2, 3.5), 0xce93d8, 0.9).setDepth(gy + 10);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-14, 14),
        y: sp.y - rnd(12, 24),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => sp.destroy()
      });
    }

    addItem("amethyst_gem", 1);
    sfx("chest");

    let bonusOre = "";
    if (Math.random() < 0.45) {
      addItem("ore", 1);
      bonusOre = " Serpihan kerak geoda juga menghasilkan 1x Bongkah Bijih Besi!";
    }

    this.popWorld(gx, gy - 20, "💎 Kristal Kecubung Didapat!", "#f3e5f5");
    G.lock--;
    this._busyGeode = false;

    await say("Permata Geoda Kristal", [
      "KLANG-KREK! Hantaman mantap membelah kerak batu vulkanik luar!",
      "Rongga dalam batu menampakkan gugusan Kristal Kecubung Gua ungu berkilauan yang sangat indah!",
      "Permata ini bernilai jual tinggi (30G) serta memancarkan energi batin pemulih 45 MP!" + bonusOre
    ]);
  },

  async interactClockworkTower(tx, ty) {
    if (this._busyClockTower) return;

    const c = await choose("Menara Jam Gerigi Akademi", [
      "⚙️ Selaraskan Putaran Roda Gigi (+45 MP & Fokus Presisi)",
      "🕰️ Amati Waktu Benua Saat Ini",
      "Kembali"
    ]);

    if (c === 1) {
      const isNight = (typeof isNightTime === "function") ? isNightTime() : false;
      const tod = isNight ? "Malam Hari (Penuh Bintang)" : "Siang Hari (Terik Matahari)";
      sfx("step");
      await say("Waktu Benua Lumina", [
        "Jarum jam kuningan berdetak presisi menunjuk waktu: " + tod + ".",
        "Mekanisme bandul tembaga berayun stabil menjaga irama waktu di seluruh penjuru kota."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyClockTower = true;
    G.lock++;
    sfx("creak");
    this.popWorld(tx, ty - 32, "Menyelaraskan tuas gerigi...", "#ffd54f");

    await sleep(700);
    sfx("crit");
    await sleep(400);
    sfx("bell");

    // Gears and clockwork sparkle particles
    for (let i = 0; i < 8; i++) {
      const sp = this.add.circle(tx + rnd(-12, 12), ty - rnd(18, 38), rnd(2, 3.5), 0x80d8ff, 0.9).setDepth(ty + 10);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(14, 28),
        alpha: 0,
        duration: rnd(600, 1100),
        onComplete: () => sp.destroy()
      });
    }

    const mpGain = Math.min(45, stat("mmp") - S.mp);
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.spd = Math.max(S.buff.spd || 0, 180);

    let bonusCog = "";
    if (Math.random() < 0.45) {
      addItem("brass_cog", 1);
      bonusCog = " Di sela laci panel mekanik, kamu menemukan sebutir Roda Gigi Kuningan presisi tinggi!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+45 MP & Fokus Presisi!", "#80d8ff");
    G.lock--;
    this._busyClockTower = false;

    await say("Harmoni Detak Waktu", [
      "DDOOONG! Roda-roda gigi kuningan berputar serempak dalam irama yang sangat presisi.",
      "Detik jam yang teratur menyelaraskan ketenangan pikiranmu, memulihkan 45 MP serta menganugerahkan Fokus Presisi (Langkah Cepat 3 menit)!" + bonusCog
    ]);
  },

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

  async interactTempleKoiPond(px, py) {
    if (this._busyKoiPond) return;

    const c = await choose("Kolam Koi Suci Kuil Penjaga Cahaya", [
      "✨ Tabur Butiran Pakan Ikan Koi (+35 HP/MP & Berkah)",
      "🧘 Duduk Merenung di Tepi Kolam Batu (+20 MP)",
      "Kembali"
    ]);

    if (c === 1) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("water");
        this.popWorld(px, py - 20, "+20 MP (Hening Kolam)", "#81d4fa");
      }
      await say("Renungan Tepi Kolam Suci", [
        "Melihat liukan tenang ikan koi di bawah bayangan daun teratai melenyapkan segala kegelisahan di dalam dada.",
        "Ketenangan batin yang syahdu mengalir lembut di sela keheningan kuil suci."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyKoiPond = true;
    G.lock++;
    sfx("step");
    this.popWorld(px, py - 24, "Menabur butiran pakan...", "#fff9c4");

    await sleep(700);
    sfx("water");

    // Ripple effect on pond
    const rip = this.add.circle(px, py, 4, 0x4fc3f7, 0.8).setDepth(py + 10);
    this.tweens.add({
      targets: rip,
      scaleX: 4,
      scaleY: 2.5,
      alpha: 0,
      duration: 1200,
      repeat: 2,
      onComplete: () => rip.destroy()
    });

    // Golden sparkles rising from water
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(px + rnd(-10, 10), py - rnd(4, 16), rnd(1.5, 3), 0xffd54f, 0.9).setDepth(py + 12);
      this.tweens.add({
        targets: sp,
        y: sp.y - rnd(12, 24),
        alpha: 0,
        duration: rnd(600, 1000),
        onComplete: () => sp.destroy()
      });
    }

    await sleep(1000);
    sfx("bell");

    const hpGain = Math.min(35, stat("mhp") - S.hp);
    const mpGain = Math.min(35, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    let bonusScale = "";
    if (Math.random() < 0.5) {
      addItem("gold_scale", 1);
      bonusScale = " Ikan koi emas terbesar menyelam dan meninggalkan sehelai Sisik Koi Emas Kuil suvenir magis!";
    }

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+35 HP/MP & Berkah Kuil!", "#ffff55");
    G.lock--;
    this._busyKoiPond = false;

    await say("Berkah Ikan Koi Suci", [
      "PLUK... Kawanan ikan koi berbelang merah dan emas berenang berbondong-bondong menyentuh permukaan air yang jernih.",
      "Kecipak riak air suci memancarkan pendaran keemasan yang menyejukkan ragamu (+35 HP & MP, DEF +20% 3 menit)!" + bonusScale
    ]);
  },

  async interactWeatherVane(vx, vy) {
    if (this._busyVane) return;

    const c = await choose("Baling-Baling Angin Kuningan", [
      "🧭 Amati Arah Angin & Ramalan Cuaca",
      "🍃 Tarik Nafas Segar Puncak Bukit (+30 HP/MP & Nafas Angin)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(30, stat("mhp") - S.hp);
      const mpGain = Math.min(30, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;

      if (!S.buff) S.buff = {};
      S.buff.spd = Math.max(S.buff.spd || 0, 150);

      // Wind green sparkles
      for (let i = 0; i < 6; i++) {
        const sp = this.add.circle(this.p.x + rnd(-12, 12), this.p.y - rnd(6, 20), rnd(2, 3), 0x81c784, 0.9).setDepth(this.p.depth + 1);
        this.tweens.add({
          targets: sp,
          x: sp.x + rnd(10, 24),
          y: sp.y - rnd(10, 20),
          alpha: 0,
          duration: rnd(600, 1000),
          onComplete: () => sp.destroy()
        });
      }

      sfx("step");
      sfx("chest");

      let bonusText = "";
      if (Math.random() < 0.4) {
        const g = rnd(8, 14);
        S.g += g;
        bonusText = " Di sela roda poros baling-baling, kamu menemukan koin yang tersangkut terbawa angin +" + g + "G!";
      }

      this.popWorld(this.p.x, this.p.y - 18, "+30 HP/MP & Nafas Angin!", "#aed581");
      await say("Hembusan Angin Pegunungan", [
        "Menghirup udara bersih perbukitan Padang Angin di bawah langit yang membentang luas.",
        "Paru-parumu terisi kesegaran murni dan kakimu melangkah ringan bagai didorong angin sepoi (Langkah Ringan 2.5 menit)!" + bonusText
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyVane = true;
    G.lock++;
    sfx("creak");
    this.popWorld(vx, vy - 24, "Memutar penunjuk arah...", "#ffd54f");

    await sleep(700);
    sfx("flap");

    // Wind gusts particle
    for (let i = 0; i < 8; i++) {
      const wx = vx - 20 + i * 6;
      const wy = vy - 10 + rnd(-4, 4);
      const puff = this.add.circle(wx, wy, rnd(1.5, 3), 0xffffff, 0.8).setDepth(vy + 10);
      this.tweens.add({
        targets: puff,
        x: puff.x + rnd(30, 60),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => puff.destroy()
      });
    }

    await sleep(800);
    G.lock--;
    this._busyVane = false;

    const directions = ["Utara (Hawa Sejuk Pegunungan)", "Timur (Angin Lembah Cerah)", "Selatan (Angin Hangat Dataran)", "Barat (Angin Lembap Danau Cermin)"];
    const curDir = directions[rnd(0, directions.length - 1)];

    const isNight = (typeof isNightTime === "function") ? isNightTime() : false;
    let forecast = "";
    if (isNight) {
      forecast = "Malam ini langit cerah bertabur bintang perak. Angin sejuk bertiup stabil, waktu yang tepat untuk berburu ikan malam atau menatap rasi bintang di Akademi.";
    } else {
      forecast = "Angin berhembus stabil dari arah padang. Udara kaya akan kelembapan tanah subur, sangat baik untuk pertumbuhan sayur kebun dan perjalanan kafilah.";
    }

    await say("Ramalan Cuaca Padang Angin", [
      "Baling-baling ayam jantan berputar lincah dan paruhnya menunjuk mantap ke arah: " + curDir + "!",
      forecast
    ]);
  },

  async playAntiqueMusicBox(bx, by) {
    if (this._busyMusicBox) return;

    const c = await choose("Kotak Musik Engkol Antik", [
      "🎵 Putar Engkol & Dengarkan Melodi (+40 HP/MP & Jiwa Damai)",
      "🔍 Amati Mekanisme Gerigi Silinder Kuningan",
      "Kembali"
    ]);

    if (c === 1) {
      await say("Mekanisme Jam Kuno", [
        "Di dalam kotak kayu mahoni berukir indah, silinder kuningan bertabur ratusan pasak kecil siap memetik bilah-bilah baja penala.",
        "Karya seni mekanik bernilai tinggi buatan maestro komposer Kota Lumina dari abad silam."
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyMusicBox = true;
    G.lock++;
    sfx("step");
    this.popWorld(bx, by - 16, "Memutar engkol kotak musik...", "#ffd54f");

    await sleep(600);
    sfx("step");
    await sleep(400);

    // Chime notes melody sequence using audio bell / menu / chimes
    sfx("bell");
    this.popWorld(bx, by - 20, "♪ Ting...", "#fff59d");
    await sleep(450);
    sfx("bell");
    this.popWorld(bx - 8, by - 24, "♫ Ting-ting...", "#ffe082");
    await sleep(400);
    sfx("bell");
    this.popWorld(bx + 8, by - 26, "♪ Taaang...", "#ffd54f");
    await sleep(450);
    sfx("bell");
    this.popWorld(bx, by - 28, "♫ Ting-tang-ting...", "#ffca28");

    // Musical sparkle notes floating up
    for (let i = 0; i < 8; i++) {
      const nx = bx + rnd(-12, 12);
      const ny = by - rnd(10, 24);
      const note = this.add.circle(nx, ny, rnd(1.5, 3), 0xfff59d, 0.9).setDepth(by + 10);
      this.tweens.add({
        targets: note,
        x: nx + rnd(-10, 10),
        y: ny - rnd(14, 28),
        alpha: 0,
        duration: rnd(700, 1200),
        onComplete: () => note.destroy()
      });
    }

    await sleep(800);

    const hpGain = Math.min(40, stat("mhp") - S.hp);
    const mpGain = Math.min(40, stat("mmp") - S.mp);
    S.hp += hpGain;
    S.mp += mpGain;

    if (!S.buff) S.buff = {};
    S.buff.def = Math.max(S.buff.def || 0, 180);

    sfx("chest");
    this.popWorld(this.p.x, this.p.y - 18, "+40 HP/MP & Jiwa Damai!", "#ffff55");
    G.lock--;
    this._busyMusicBox = false;

    await say("Melodi Kotak Musik Antik", [
      "Dentingan genta nada tinggi mengalun lembut merambat di udara ruangan penginapan yang hangat.",
      "Melodi nostalgia ini menyentuh lubuk hatimu terdalam, menyapu segala keletihan perjalanan (+40 HP/MP, Buff DEF 3 menit)!",
      "Bu Laras tersenyum hangat dari balik meja: \"Melodi yang sangat syahdu... Penginapan ini selalu terasa lebih damai saat kotak musik itu berdenting.\""
    ]);
  },

  async playCanalBoatRace(px, py) {
    if (this._busyBoatRace) return;

    await say("Kimi si Pengrajin Kayu Cilik", [
      "Wah, Kak Arka! Mau ikut Balapan Perahu Kayu Mini di kanal air?",
      "Anak-anak Kota Bawah sering mengadu perahu buatan mereka di arus kanal ini! Taruhan 15 Koin Emas, tebak perahu mana yang tercepat sampai garis jembatan!"
    ]);

    const c = await choose("Pilih Perahu Kayu Andalanmu (Taruhan 15G)", [
      "⛵ [1] Si Ombak Berani (Layar Merah - Laju Cepat)",
      "🛶 [2] Si Daun Stabil (Katamaran Hijau - Tahan Arus)",
      "⚓ [3] Si Arus Cepat (Kayu Hitam - Akselerasi)",
      "Batal Ikut"
    ]);

    if (c !== 0 && c !== 1 && c !== 2) return;

    if (S.g < 15) {
      await say("Kimi si Pengrajin Kayu Cilik", [
        "Yah, koin Kak Arka kurang dari 15G! Nanti kalau sudah punya koin, main lagi ya Kak!"
      ]);
      return;
    }

    S.g -= 15;
    sfx("coin");
    this._busyBoatRace = true;
    G.lock++;

    const boatNames = ["Si Ombak Berani (Merah)", "Si Daun Stabil (Hijau)", "Si Arus Cepat (Hitam)"];
    const chosenBoat = boatNames[c];

    this.popWorld(this.p.x, this.p.y - 18, "Memilih: " + chosenBoat, "#81d4fa");
    await sleep(700);

    // Countdown 3, 2, 1, GO!
    this.popWorld(px, py - 20, "3...", "#ffff55");
    sfx("step");
    await sleep(600);
    this.popWorld(px, py - 20, "2...", "#ffff55");
    sfx("step");
    await sleep(600);
    this.popWorld(px, py - 20, "1...", "#ffff55");
    sfx("step");
    await sleep(600);
    this.popWorld(px, py - 20, "🌊 LEPAS! MELUNCUR!", "#4fc3f7");
    sfx("water");

    // Spawn 3 toy boat sprites in canal
    const colors = [0xe53935, 0x43a047, 0x212121];
    const boats = [];
    for (let i = 0; i < 3; i++) {
      const b = this.add.circle(px - 10 + i * 10, py + 12 + i * 4, 3, colors[i]).setDepth(py + 20);
      boats.push(b);
    }

    // Dynamic boat race progress
    // Each boat moves along canal (x increases to the right)
    let distances = [0, 0, 0];
    const finishLine = 75;

    for (let step = 0; step < 7; step++) {
      await sleep(400);
      sfx("water");
      for (let i = 0; i < 3; i++) {
        const adv = rnd(8, 14) + (i === 0 ? rnd(-3, 4) : i === 1 ? 2 : rnd(-2, 3));
        distances[i] += adv;
        this.tweens.add({
          targets: boats[i],
          x: boats[i].x + adv,
          y: boats[i].y + rnd(-2, 2),
          duration: 350
        });
      }
    }

    // Determine winner
    let maxDist = -1;
    let winnerIdx = 0;
    for (let i = 0; i < 3; i++) {
      if (distances[i] > maxDist) {
        maxDist = distances[i];
        winnerIdx = i;
      }
    }

    const winnerName = boatNames[winnerIdx];
    await sleep(500);

    // Clean up boat sprites
    boats.forEach(b => b.destroy());

    G.lock--;
    this._busyBoatRace = false;

    if (winnerIdx === c) {
      sfx("chest");
      S.g += 35;
      addItem("mini_ship", 1);
      this.popWorld(this.p.x, this.p.y - 18, "🏆 PERAHUMU JUARA 1! (+35G)", "#ffff55");
      await say("Kemenangan di Kanal Air!", [
        "HOREEE! " + winnerName + " meluncur paling kencang melintasi garis jembatan hilir!",
        "Anak-anak Kota Bawah bersorak gembira bertepuk tangan di atas jembatan kayu!",
        "Kimi: \"Hebat sekali Kak Arka! Instingmu jitu! Ini 35 Koin Emas dan hadiah suvenir miniatur Perahu Layar Mini buatanku!\""
      ]);
    } else {
      sfx("step");
      addItem("apple", 1);
      this.popWorld(this.p.x, this.p.y - 18, "Juara: " + winnerName + " (+1 Apel)", "#ffb74d");
      await say("Balapan Berakhir", [
        winnerName + " berhasil menyentuh garis jembatan hilir terlebih dahulu!",
        "Perahu pilihanmu meluncur dengan gagah meski finish di urutan belakang.",
        "Kimi tersenyum ramah: \"Jangan sedih Kak Arka, balapannya seru sekali! Nih, makan sebutir Apel Segar manis dari kebun paman! Kapan-kapan kita balapan lagi ya!\""
      ]);
    }
  },

  async playKnifeToss(tx, ty) {
    if (this._busyKnifeToss) return;

    await say("Jack si Pemburu Bayangan", [
      "Heh... Mata jeli dan tangan yang tenang adalah pembeda antara pemburu dan mangsa.",
      "Taruhan 15 Koin Emas untuk 3 bilah belati lempar. Tunjukkan apakah ujung pisaumu sanggup menembus titik tengah!"
    ]);

    const c = await choose("Papan Lempar Belati Kedai", [
      "🎯 Lempar 3 Belati Baja (Taruhan 15G)",
      "🗡️ Tanya Petunjuk Lemparan Presisi",
      "Mundur Dulu"
    ]);

    if (c === 1) {
      await say("Jack si Pemburu Bayangan", [
        "Jarum bidik akan berayun ke kiri dan ke kanan. Jangan terburu-buru!",
        "Tunggu hingga jarum berada sedekat mungkin dengan titik pusat (hijau/kuning), lalu tekan tombol aksi [A] secepat kilat!"
      ]);
      return;
    }

    if (c !== 0) return;

    if (S.g < 15) {
      await say("Jack si Pemburu Bayangan", [
        "Koinmu kurang dari 15G. Di sudut remang ini, tidak ada belati gratis, kawan."
      ]);
      return;
    }

    S.g -= 15;
    sfx("coin");
    this._busyKnifeToss = true;
    G.lock++;

    let totalScore = 0;
    const meterW = 100, meterH = 12;
    const cx = VW / 2, cy = VH / 2 - 25;

    for (let round = 1; round <= 3; round++) {
      this.popWorld(this.p.x, this.p.y - 18, "Lemparan Belati " + round + "/3", "#ffe082");
      await sleep(600);

      const bgBox = this.add.rectangle(cx, cy, meterW + 8, meterH + 20, 0x1a1a24, 0.85).setScrollFactor(0).setDepth(2000);
      const meterBg = this.add.rectangle(cx, cy, meterW, meterH, 0x424242).setScrollFactor(0).setDepth(2001);
      // Outer zone (10 pts)
      const outerZone = this.add.rectangle(cx, cy, 60, meterH - 2, 0x546e7a).setScrollFactor(0).setDepth(2002);
      // Middle zone (20 pts)
      const midZone = this.add.rectangle(cx, cy, 30, meterH - 2, 0x43a047).setScrollFactor(0).setDepth(2003);
      // Center zone (50 pts)
      const centerZone = this.add.rectangle(cx, cy, 10, meterH - 2, 0xffd54f).setScrollFactor(0).setDepth(2004);
      // Moving needle
      const needle = this.add.rectangle(cx, cy, 3, meterH + 4, 0xff1744).setScrollFactor(0).setDepth(2005);
      const label = this.add.text(cx, cy - 16, "TEKAN [A] PADA TITIK PUSAT!", {
        fontFamily: "sans-serif", fontSize: "9px", color: "#ffffaa", fontStyle: "bold", stroke: "#000", strokeThickness: 2
      }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2006);

      let thrown = false;
      let needlePos = 0; // -50 to +50
      let speed = 2.4 + rnd(0, 0.8);
      let dir = 1;

      const onThrow = () => {
        if (thrown) return;
        thrown = true;
      };

      const spaceKey = this.input.keyboard.addKey("SPACE");
      const jKey = this.input.keyboard.addKey("J");
      const zKey = this.input.keyboard.addKey("Z");
      spaceKey.on("down", onThrow);
      jKey.on("down", onThrow);
      zKey.on("down", onThrow);

      const tapZone = this.add.zone(0, 0, VW, VH).setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(1999);
      tapZone.on("pointerdown", onThrow);

      while (!thrown) {
        await sleep(20);
        needlePos += speed * dir;
        if (needlePos > 48) { needlePos = 48; dir = -1; }
        if (needlePos < -48) { needlePos = -48; dir = 1; }
        needle.x = cx + needlePos;
      }

      spaceKey.off("down", onThrow);
      jKey.off("down", onThrow);
      zKey.off("down", onThrow);
      tapZone.destroy();
      bgBox.destroy();
      meterBg.destroy();
      outerZone.destroy();
      midZone.destroy();
      centerZone.destroy();
      needle.destroy();
      label.destroy();

      sfx("swing");
      await sleep(250);

      // Score evaluation
      const dist = Math.abs(needlePos);
      let pts = 0;
      let popMsg = "";
      let popCol = "";

      if (dist <= 6) {
        pts = 50;
        popMsg = "🎯 BULLSEYE! 50 Poin!";
        popCol = "#ffff55";
        sfx("crit");
      } else if (dist <= 16) {
        pts = 20;
        popMsg = "🗡️ Tepat! 20 Poin";
        popCol = "#81c784";
        sfx("step");
      } else if (dist <= 30) {
        pts = 10;
        popMsg = "10 Poin";
        popCol = "#90caf9";
        sfx("step");
      } else {
        pts = 0;
        popMsg = "Meleset!";
        popCol = "#ef5350";
        sfx("hurt");
      }

      totalScore += pts;
      this.popWorld(tx, ty - 18, popMsg, popCol);
      await sleep(700);
    }

    G.lock--;
    this._busyKnifeToss = false;

    if (totalScore >= 90) {
      sfx("chest");
      S.g += 40;
      addItem("shadow_dagger", 1);
      this.popWorld(this.p.x, this.p.y - 18, "🏆 JUARA LEMPAR BELATI! (+40G)", "#ffff55");
      await say("Juara Lempar Belati!", [
        "LUAR BIASA! Total skor: " + totalScore + " Poin! Seluruh lemparanmu menancap mantap di papan kayu!",
        "Jack tersenyum takjub sambil bertepuk tangan pelan.",
        "Jack: \"Mata elang sejati! Terimalah 40 Koin Emas ini dan sebilah Belati Pemburu Bayangan sebagai tanda penghormatanku!\""
      ]);
    } else if (totalScore >= 40) {
      sfx("coin");
      S.g += 20;
      this.popWorld(this.p.x, this.p.y - 18, "Bagus! Total: " + totalScore + " Poin (+20G)", "#81c784");
      await say("Ketangkasan Mengesankan", [
        "Total skor: " + totalScore + " Poin. Lemparan yang sangat stabil dan terarah!",
        "Jack: \"Refleksmu cukup terlatih, kawan muda. Ini hadiah koin 20G untukmu!\""
      ]);
    } else {
      addItem("potion", 1);
      this.popWorld(this.p.x, this.p.y - 18, "Total: " + totalScore + " Poin (+1 Ramuan)", "#90caf9");
      await say("Latihan Ketangkasan", [
        "Total skor: " + totalScore + " Poin.",
        "Jack: \"Bukan lemparan yang buruk untuk pemula. Tenangkan pernafasanmu sebelum melempar. Ambillah 1 Ramuan ini untuk memulihkan staminamu!\""
      ]);
    }
  },

  async playArmWrestling(tx, ty) {
    if (this._busyArmWrestle) return;

    await say("Bargo si Kuli Baja", [
      "Hahaha! Selamat datang di meja adu panco kedai Kota Bawah, kawan muda!",
      "Di sini hanya urat kawat dan tulang besi yang berbicara! Pasang taruhan 15 Koin Emas, dan buktikan apakah lenganmu sanggup merobohkanku!"
    ]);

    const c = await choose("Meja Adu Panco Kedai", [
      "💪 Terima Tantangan Bargo (Taruhan 15G)",
      "🍺 Tanya Tips Kekuatan Lengan",
      "Mundur Dulu"
    ]);

    if (c === 1) {
      await say("Bargo si Kuli Baja", [
        "Kuncinya ada pada hentakan cepat dan daya tahan nafas! Jangan ragu-ragu saat menekan tombol aksi (A) beruntun!",
        "Kekuatan pundak menyalurkan tenaga ke pergelangan tangan. Ayo minum dulu kalau belum siap!"
      ]);
      return;
    }

    if (c !== 0) return;

    if (S.g < 15) {
      await say("Bargo si Kuli Baja", [
        "Wah, kantong koinmu kurang dari 15G, sobat! Cari koin dulu sana, jangan berani-berani adu gengsi tanpa taruhan, haha!"
      ]);
      return;
    }

    S.g -= 15;
    sfx("coin");
    this._busyArmWrestle = true;
    G.lock++;

    await say("Adu Panco Dimulai!", [
      "Kedua tangan saling mengunci di atas bantalan kulit merah. Otot lengan menegang keras!",
      "SIAP... MULAI! (Tekan tombol AKSI / [A] secepat mungkin untuk menekan lengan Bargo ke meja!)"
    ]);

    // Meter overlay on screen
    let power = 0; // -50 (Bargo wins) to +50 (Player wins)
    const meterW = 120, meterH = 14;
    const cx = VW / 2, cy = VH / 2 - 20;

    const bgBox = this.add.rectangle(cx, cy, meterW + 8, meterH + 20, 0x1a1a24, 0.85).setScrollFactor(0).setDepth(2000);
    const meterBg = this.add.rectangle(cx, cy, meterW, meterH, 0x333344).setScrollFactor(0).setDepth(2001);
    const centerPin = this.add.rectangle(cx, cy, 2, meterH + 4, 0xffffff, 0.7).setScrollFactor(0).setDepth(2002);
    const bar = this.add.rectangle(cx, cy, 6, meterH - 2, 0x55ff55).setScrollFactor(0).setDepth(2003);
    const label = this.add.text(cx, cy - 18, "TEKAN [A] SECEPATNYA!", {
      fontFamily: "sans-serif", fontSize: "10px", color: "#ffffaa", fontStyle: "bold", stroke: "#000", strokeThickness: 2
    }).setOrigin(0.5, 0.5).setScrollFactor(0).setDepth(2004);

    let finished = false;
    let won = false;

    // Key listener for button mash (Input A)
    const onKeyA = () => {
      if (finished) return;
      power += 7.5;
      sfx("step");
      if (power > 50) power = 50;
      bar.x = cx + (power / 50) * (meterW / 2);
      if (power >= 48) {
        finished = true;
        won = true;
      }
    };

    // Bind to scene input or keyboard
    const spaceKey = this.input.keyboard.addKey("SPACE");
    const jKey = this.input.keyboard.addKey("J");
    const zKey = this.input.keyboard.addKey("Z");
    spaceKey.on("down", onKeyA);
    jKey.on("down", onKeyA);
    zKey.on("down", onKeyA);

    // Also virtual button A support via UI tap
    const tapZone = this.add.zone(0, 0, VW, VH).setOrigin(0, 0).setScrollFactor(0).setInteractive().setDepth(1999);
    tapZone.on("pointerdown", onKeyA);

    const startTime = Date.now();
    const duration = 6500; // 6.5 seconds

    // Game loop simulation
    while (!finished && (Date.now() - startTime < duration)) {
      await sleep(100);
      // Bargo pushes back with resistance
      power -= 2.6 + rnd(0, 1.8);
      if (power < -50) power = -50;
      bar.x = cx + (power / 50) * (meterW / 2);
      bar.setFillStyle(power > 0 ? 0x55ff55 : 0xff5555);

      if (power <= -48) {
        finished = true;
        won = false;
        break;
      }
    }

    // Cleanup input
    spaceKey.off("down", onKeyA);
    jKey.off("down", onKeyA);
    zKey.off("down", onKeyA);
    tapZone.destroy();
    bgBox.destroy();
    meterBg.destroy();
    centerPin.destroy();
    bar.destroy();
    label.destroy();

    G.lock--;
    this._busyArmWrestle = false;

    if (won) {
      sfx("crit");
      sfx("chest");
      this.cameras.main.shake(300, 0.015);
      this.popWorld(tx, ty - 20, "💥 BRAKK! ROBOH! MENANG!", "#ffff55");
      S.g += 30; // 15 back + 15 win

      // Muscle strength buff: ATK +25%
      if (!S.buff) S.buff = {};
      S.buff.atk = Math.max(S.buff.atk || 0, 180);

      await say("Kemenangan Adu Panco!", [
        "BRAAAKKK! Dengan sentakan otot sekuat baja, kamu berhasil membanting lengan kekar Bargo hingga menghantam meja!",
        "Penonton kedai dan kuli pelabuhan bersorak kagum mengelu-elukanmu!",
        "Bargo: \"Guaaahhh!! Luar biasa bertenaga! Ambillah 30 Koin Emas ini! Ototmu benar-benar padat berisi (Buff ATK +25% selama 3 menit)!\""
      ]);
    } else {
      sfx("hurt");
      this.popWorld(tx, ty - 20, "Ditekan Roboh!", "#ff6666");
      await say("Kalah Adu Panco", [
        "BRAAAK! Lengan Bargo yang perkasa akhirnya menekan tanganmu hingga terhempas ke meja.",
        "Bargo tertawa lepas: \"Hahaha! Tenagamu sudah sangat hebat anak muda, tinggal sedikit lagi! Ayo jangan kapok, minum dulu dan jajal lagi nanti!\""
      ]);
    }
  },

  async interactWishingBoat(tx, ty) {
    if (this._busyWishingBoat) return;

    const c = await choose("Meja Perahu Kertas Danau Cermin", [
      "🌸 Lipat & Hanyutkan: Harapan Kedamaian Jiwa (Pulih HP & MP)",
      "🛡️ Lipat & Hanyutkan: Harapan Langkah Tangguh (DEF +20% 3 Mnt)",
      "🕊️ Renungi Danau & Doa Syukur (+20 MP)",
      "Kembali"
    ]);

    if (c === 2) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("water");
        this.popWorld(tx, ty - 16, "+20 MP (Ketenangan Batin)", "#a8e6cf");
      }
      await say("Renungan Tepi Danau", [
        "Angin sepoi membawa aroma air tawar dan genta kerang yang berdenting lembut.",
        "Melihat riak air danau yang memantulkan langit membuat seluruh kepenatan luruh seketika."
      ]);
      return;
    }

    if (c !== 0 && c !== 1) return;

    this._busyWishingBoat = true;
    G.lock++;
    sfx("step");
    this.popWorld(tx, ty - 16, "Melipat perahu kertas...", "#f5ebd2");

    await sleep(1000);
    sfx("menu");
    await sleep(400);

    // Launch floating paper boat onto water
    // Table is at (tx, ty), water is slightly to the right/upwards towards the lake
    const startX = tx + 14;
    const startY = ty + 4;
    const boat = this.add.image(startX, startY, "paperboat").setOrigin(0.5, 0.5).setDepth(startY + 2);

    sfx("water");
    sfx("bell");

    // Ripple effect at launch point
    const rip = this.add.circle(startX, startY + 3, 3, 0xffe6aa, 0.7).setDepth(startY + 1);
    this.tweens.add({
      targets: rip,
      scaleX: 3,
      scaleY: 1.8,
      alpha: 0,
      duration: 1000,
      repeat: 2,
      onComplete: () => rip.destroy()
    });

    // Boat drifting tween with slight swaying
    this.tweens.add({
      targets: boat,
      x: startX + 55,
      y: startY - 25,
      alpha: 0,
      duration: 3800,
      ease: "Sine.easeInOut",
      onComplete: () => boat.destroy()
    });

    // Sparkling golden trail
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!boat.active) return;
        const sp = this.add.circle(boat.x + rnd(-3, 3), boat.y + rnd(2, 4), rnd(1, 2.5), 0xffdd66, 0.9).setDepth(boat.depth - 1);
        this.tweens.add({
          targets: sp,
          scale: 0.2,
          alpha: 0,
          y: sp.y + 6,
          duration: 900,
          onComplete: () => sp.destroy()
        });
      }, i * 550);
    }

    await sleep(2200);

    if (c === 0) {
      // Full HP & MP restore
      S.hp = stat("mhp");
      S.mp = stat("mmp");
      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "Pulih Penuh! HP & MP MAX", "#ffff77");
      G.lock--;
      this._busyWishingBoat = false;
      await say("Perahu Harapan: Kedamaian Jiwa", [
        "Perahu kertas kecil dengan lilin menyala meluncur anggun di atas cermin air danau.",
        "Cahayanya memantul lembut bagai kunang-kunang di permukaan Danau Cermin.",
        "Setiap helaan nafasmu kini dipenuhi kedamaian murni (HP & MP pulih sepenuhnya)!"
      ]);
    } else {
      // DEF buff
      if (!S.buff) S.buff = {};
      S.buff.def = Math.max(S.buff.def || 0, 180);
      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "🛡️ Berkah DEF +20% (3 Mnt)", "#70c5ff");
      G.lock--;
      this._busyWishingBoat = false;
      await say("Perahu Harapan: Langkah Tangguh", [
        "Lilin keemasan di atas perahu kertas bertahan teguh menembus riak air danau.",
        "Semangat ketabahan menyelimuti ragamu bagai perisai pelindung yang kokoh (DEF +20% selama 3 menit)!"
      ]);
    }
  },

  async fishIceHole(hx, hy) {
    if (this._busyFishIce) return;
    const hasRod = has('rod');
    if (!hasRod) {
      await say('Lubang Es Puncak Beku', [
        'Lapisan es danau beku dilubangi nelayan pengelana.',
        'Di dalam air biru gelap yang dingin, tampak bayangan Ikan Glasier berenang anggun.',
        '(Butuh Alat Pancing untuk memancing di lubang es ini!)'
      ]);
      // Admiring restores 10 MP
      const mpGain = Math.min(10, stat('mmp') - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx('water');
        this.popWorld(hx, hy - 14, '+10 MP (Kesejukan Es)', '#a8e6cf');
      }
      return;
    }

    const c = await choose('Lubang Pancing Es', [
      '🎣 Pancing Ikan Glasier (Uji Kesabaran)',
      '💧 Basuh Tangan dengan Air Glasier (+15 MP)',
      'Kembali'
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat('mmp') - S.mp);
      S.mp += mpGain;
      sfx('water');
      this.popWorld(hx, hy - 14, '+15 MP Segar!', '#a8e6cf');
      await say('Air Glasier Murni', [
        'Air lubang es sangat menusuk dingin, namun mengembalikan konsentrasi batinmu seketika!'
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyFishIce = true;
    G.lock++;
    sfx('step');
    this.popWorld(hx, hy - 16, 'Melempar kail ke es...', '#aed2ee');

    // Ripple effect at hole
    const rip = this.add.circle(hx, hy, 4, 0x8ac8f0, 0.7).setDepth(hy + 1);
    this.tweens.add({
      targets: rip,
      scaleX: 3.5,
      scaleY: 2,
      alpha: 0,
      duration: 1200,
      repeat: 2,
      onComplete: () => rip.destroy()
    });

    await sleep(1500);

    // Bite alert !
    sfx('menu');
    const ex = this.add.text(hx, hy - 20, '!', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ffff55', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(hy + 10);
    this.tweens.add({
      targets: ex,
      y: hy - 28,
      duration: 400,
      yoyo: true,
      onComplete: () => ex.destroy()
    });

    await sleep(600);
    sfx('water');
    sfx('chest');

    addItem('ice_fish', 1);
    S.st.fish = (S.st.fish || 0) + 1;
    if (!S.fishLog) S.fishLog = {};
    S.fishLog.ice_fish = (S.fishLog.ice_fish || 0) + 1;
    achCheck(this);

    // Splash particles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(hx + rnd(-8, 8), hy + rnd(-4, 4), rnd(2, 3), 0xe2f6ff, 0.9).setDepth(hy + 8);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-16, 16),
        y: sp.y - rnd(12, 26),
        alpha: 0,
        duration: rnd(400, 700),
        onComplete: () => sp.destroy()
      });
    }

    this.popWorld(hx, hy - 16, '🎣 Dapat Ikan Glasier!', '#e2f6ff');
    G.lock--;
    this._busyFishIce = false;

    await say('Tangkapan Danau Beku', [
      'STRIKE! Dari lubang es terangkat seekor Ikan Glasier berkilauan!',
      'Sisiknya memancarkan hawa dingin sejuk. Jika dikonsumsi, tubuh akan kebal dari udara beku ekstrem (+30 HP, +30 MP & Kebal Dingin)!'
    ]);
  },

  async fish(f) {
    if (!has('rod')) return talk(null, ['Airnya beriak... ada ikan di sini! Kamu butuh Pancing (dijual di kios Bu Sari).']);
    if (this.fishing) return; this.fishing = true; G.lock++;
    const pl = this.pl, bob = this.add.image(f[0], f[1] - 2, 'dot').setTint(0xff4a3a).setScale(2).setDepth(f[1] + 1);
    const line = this.add.graphics().setDepth(f[1] + 1); line.lineStyle(1, 0xffffff, .8).lineBetween(pl.x + 4, pl.y - 18, f[0], f[1] - 2);
    sfx('swing'); popWorld(f[0], f[1] - 16, '...', 'xp');
    await sleep(rnd(1200, 3200));
    sfx('crit'); this.tweens.add({ targets: bob, y: f[1] + 2, duration: 80, yoyo: true, repeat: 4 }); popWorld(f[0], f[1] - 18, '!', 'crit');
    const hit = await new Promise(res => { const prev = UIH; let done = false; const h = k => { if (done) return; if (k === 'a' || k === 'tap') { done = true; UIH = prev; res(true); } }; h.tap = true; UIH = h; setTimeout(() => { if (!done) { done = true; UIH = prev; res(false); } }, 700); });
    bob.destroy(); line.destroy();
    if (hit) {
      const isNightTime = isNight();
      const isRain = this.weather === 'rain';
      const r = Math.random();
      // Ikan langka keluar saat malam atau hujan
      let id = 'fish';
      if (isNightTime && r < 0.25) id = 'moonfish'; // Ikan Rembulan
      else if (isRain && r < 0.25) id = 'rainfish'; // Ikan Hujan
      else if (r < 0.12) id = 'gfish';
      else if (r < 0.22) id = 'oldboot';

      addItem(id);
      if (id !== 'oldboot') S.st.fish++;
      // Catat ke buku log pancingan
      S.fishLog = S.fishLog || {};
      if (!S.fishLog[id]) S.fishLog[id] = { count: 0, firstHour: gameHours() };
      S.fishLog[id].count++;
      sfx('chest');
      updHud();
      const fishName = ITEMS[id]?.n || id;
      if (id === 'moonfish') await say('LUAR BIASA! Menangkap Ikan Rembulan yang bersinar di kegelapan malam! (+45 MP)', 'Mancing');
      else if (id === 'rainfish') await say('Hebat! Menangkap Ikan Hujan yang hanya berenang saat cuaca basah!', 'Mancing');
      else if (id === 'gfish') await say('WAH! Ikan Emas langka! (jual mahal di kios)', 'Mancing');
      else if (id === 'oldboot') await say('Yah... cuma sepatu butut.', 'Mancing');
      else await say('Dapat Ikan Mas!', 'Mancing');
      achCheck(this);
    }
    else await say('Terlambat! Ikannya lepas. Tekan SERANG tepat saat tanda ! muncul.');
    this.fishing = false; G.lock--;
  },
  spawnGarden() {
    this.garden = this.M.gardens.map((g, i) => {
      const [gx, gy, gw, gh] = g, spr = [];
      for (let k = 0; k < 6; k++) { const X = gx + 20 + (k % 3) * 40, Y = gy + 20 + Math.floor(k / 3) * 24; spr.push(this.add.image(X, Y, 'sprout').setOrigin(.5, 1).setDepth(Y).setVisible(false)); }
      this.inter.push({ rect: [gx - 8, gy - 12, gw + 16, gh + 24], fn: () => this.tendPlot(i) });
      return { spr };
    });
    this.updGarden(true);
  },
  plotState(i) { const p = S.garden[i]; if (!p) return 'empty'; return gameHours() - p.t >= (p.fast ? 3 : 6) ? 'ripe' : 'grow'; },
  updGarden(force) { this.gT = (this.gT || 0) - this.dt; if (!force && this.gT > 0) return; this.gT = 1; this.garden.forEach((g, i) => { const st = this.plotState(i); g.spr.forEach(s => { s.setVisible(st !== 'empty'); s.setTexture(st === 'ripe' ? 'ripe' : 'sprout'); }); }); },
  async tendPlot(i) {
    const st = this.plotState(i);
    if (st === 'empty') {
      if (!has('seed')) return talk(null, ['Petak kebun ini kosong. Beli Benih Sayur di kios Bu Sari untuk menanam.']);
      addItem('seed', -1); S.garden[i] = { t: gameHours(), fast: this.weather === 'rain' }; sfx('ok'); this.updGarden(true);
      return talk(null, ['Kamu menanam benih.' + (this.weather === 'rain' ? ' Hujan membuatnya tumbuh dua kali lebih cepat!' : ' Panen sekitar 6 jam lagi (lihat jam di kanan atas).')]);
    }
    if (st === 'grow') { const left = Math.max(1, Math.ceil((S.garden[i].fast ? 3 : 6) - (gameHours() - S.garden[i].t))); return talk(null, [`Tunasnya tumbuh subur. Panen sekitar ${left} jam lagi.`]); }
    S.garden[i] = null; addItem('veg', 3); S.st.harvest++; sfx('chest'); this.updGarden(true); updHud();
    const g = this.M.gardens[i]; this.sparkle(g[0] + g[2] / 2, g[1] + g[3] / 2, 'dotg', 16);
    await talk(null, ['Panen! Dapat Sayur Segar x3.']); achCheck(this);
  },
  spawnPuzzle() {
    const P = this.M.gate;
    this.add.image(P.plate[0], P.plate[1] - 4, 'plate').setDepth(-8e5); this.lights.push({ x: P.plate[0], y: P.plate[1] - 4 });
    if (S.flags.cave_gate) { this.add.image(P.plate[0], P.plate[1], 'boulder').setOrigin(.5, 1).setDepth(P.plate[1]); return; }
    this.gateS = this.add.image(P.x, P.y, 'gate').setOrigin(.5, 1).setDepth(P.y); this.gateW = this.wall(P.x - P.w / 2, P.y - 10, P.w, 10);
    const [bx, by] = P.boulder; this.boulder = this.add.image(bx, by, 'boulder').setOrigin(.5, 1).setDepth(by); this.bW = this.wall(bx - 8, by - 10, 16, 10); this.push = 0;
    this.inter.push({ x: P.x, y: P.y + 6, r: 24, fn: () => S.flags.cave_gate ? null : talk(null, ['Gerbang besi tertutup rapat. Di ruangan barat ada pelat batu yang bercahaya... mungkin ada hubungannya.']) });
  },
  updBoulder(dt) {
    const pl = this.pl, b = this.boulder; if (!b || this.bMoving || S.flags.cave_gate) return;
    const v = Input.vec(), dx = b.x - pl.x, dy = (b.y - 5) - (pl.y - 3); let dir = null;
    if (Math.abs(dy) < 10 && Math.abs(dx) < 18 && Math.abs(v.x) > .6) dir = [Math.sign(v.x), 0];
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 15 && Math.abs(v.y) > .6) dir = [0, Math.sign(v.y)];
    if (dir && dir[0] * dx + dir[1] * dy <= 0) dir = null;
    if (!dir) { this.push = 0; return; }
    this.push += dt; if (this.push < .25) return; this.push = 0;
    const nx = b.x + dir[0] * 16, ny = b.y + dir[1] * 16;
    if (this.physics.overlapRect(nx - 7, ny - 9, 14, 8, false, true).some(z => z.gameObject !== this.bW)) { sfx('buzz'); return; }
    this.bMoving = true; sfx('step'); this.walls.remove(this.bW, true, true); this.bW = this.wall(nx - 8, ny - 10, 16, 10);
    this.tweens.add({ targets: b, x: nx, y: ny, duration: 220, onComplete: () => { b.setDepth(ny); this.bMoving = false; this.puff(nx, ny); this.checkPlate(); } });
  },
  async checkPlate() {
    const P = this.M.gate, b = this.boulder;
    if (Math.abs(b.x - P.plate[0]) > 4 || Math.abs(b.y - P.plate[1]) > 4) return;
    S.flags.cave_gate = 1; G.lock++; sfx('chest'); this.sparkle(b.x, b.y - 6, 'dot', 14); this.camShake(300, .006);
    this.walls.remove(this.gateW, true, true); this.tweens.add({ targets: this.gateS, y: this.gateS.y - 30, alpha: 0, duration: 900 });
    await sleep(600); banner('Gerbang terbuka!', 'TEKA-TEKI', false, 1600); await sleep(800); await say('Terdengar bunyi KLAK dari utara. Gerbang besi terangkat!'); G.lock--; achCheck(this); saveGame(this);
  },
  updPet(dt) {
    const pl = this.pl, p = this.pet; this.trail.push([pl.x - (pl.flipX ? -6 : 6), pl.y]); if (this.trail.length > 16) this.trail.shift();
    const [tx, ty] = this.trail[0];
    if (Math.hypot(pl.x - p.x, pl.y - p.y) > 15) { p.x += (tx - p.x) * .22; p.y += (ty - p.y) * .22; if (!p.anims.isPlaying) p.play('cat2_mv'); p.flipX = tx > p.x; }
    else { p.anims.stop(); p.setFrame(0); }
    this.digT -= dt; if (this.digT <= 0) { this.digT = rnd(40, 70); this.petDig(); }
  },
  petDig() {
    const p = this.pet; popWorld(p.x, p.y - 18, 'Meong!', 'gold'); this.sparkle(p.x, p.y - 4, 'doto', 8); this.puff(p.x, p.y);
    const pool = { village: ['seed', 'potion', 'coin'], forest: ['jelly', 'pelt', 'potion', 'coin'], meadow: ['tusk', 'sting', 'seed', 'coin'], cave: ['ore', 'shard', 'coin'], swamp: ['ecto', 'hipotion', 'coin'] }[this.M.id] || ['coin'];
    const it = pick(pool); if (it === 'coin') this.drop(p.x, p.y, 'coin', ri(5, 15)); else this.drop(p.x, p.y, 'item', it);
  },
  async bountyBoard() {
    S.bounties = S.bounties || {};
    const BOUNTY_LIST = [
      { id: 'b_berry', title: 'Pasokan Beri Manis', desc: 'Bu Sari butuh 3 Buah Beri untuk selai penginapan.', need: { item: 'berry', n: 3 }, gift: { gold: 35, exp: 20 } },
      { id: 'b_fish', title: 'Ikan Segar Kedai', desc: 'Koki penginapan butuh 2 Ikan Mas segar dari kolam.', need: { item: 'fish', n: 2 }, gift: { gold: 40, exp: 25 } },
      { id: 'b_slime', title: 'Pembersihan Lendir', desc: 'Kumpulkan 4 Lendir Slime yang mengotori jalan.', need: { item: 'jelly', n: 4 }, gift: { gold: 30, exp: 20 } },
      { id: 'b_herb', title: 'Bahan Obat Alami', desc: 'Bawakan 3 Daun Obat untuk stok ramuan desa.', need: { item: 'herb', n: 3 }, gift: { gold: 45, exp: 30 } }
    ];
    for (;;) {
      const items = BOUNTY_LIST.map(b => {
        const done = S.bounties[b.id];
        const canTurnIn = has(b.need.item, b.need.n);
        const tag = done ? '✔ SELESAI' : canTurnIn ? '★ SERAHKAN' : `${(S.inv[b.need.item] || 0)}/${b.need.n}`;
        return { t: (done ? '<s>' : '') + b.title + (done ? '</s>' : ''), r: tag };
      });
      items.push({ t: 'Tutup Papan' });
      const sel = await choose({
        head: 'PAPAN PENGUMUMAN DESA', x: 20, y: 30, w: 250,
        items,
        foot: (i) => i < BOUNTY_LIST.length ? `${BOUNTY_LIST[i].desc}<br>Imbalan: ${BOUNTY_LIST[i].gift.gold} G · ${BOUNTY_LIST[i].gift.exp} EXP` : 'Kembali bermain.'
      });
      if (sel < 0 || sel >= BOUNTY_LIST.length) break;
      const b = BOUNTY_LIST[sel];
      if (S.bounties[b.id]) {
        await say('Permintaan ini sudah kamu selesaikan sebelumnya.', 'Papan Pengumuman');
      } else if (has(b.need.item, b.need.n)) {
        addItem(b.need.item, -b.need.n);
        S.gold += b.gift.gold;
        S.exp += b.gift.exp;
        S.bounties[b.id] = 1;
        sfx('lvl');
        updHud();
        popWorld(this.pl.x, this.pl.y - 14, `+${b.gift.gold}G +${b.gift.exp}EXP`, 'gold');
        await say(`Kamu menyerahkan ${b.need.n} ${ITEMS[b.need.item].n}. Mendapat ${b.gift.gold} G dan ${b.gift.exp} EXP! Terima kasih atas bantuanmu!`, 'Papan Pengumuman');
        saveGame(this);
      } else {
        await say(`Bahan belum cukup: butuh ${b.need.n} ${ITEMS[b.need.item].n} (kamu punya ${S.inv[b.need.item] || 0}).`, 'Papan Pengumuman');
      }
    }
  },
  async feedAnimal(animalName, feedItem, rewardItem, soundText) {
    G.lock++;
    const foodName = ITEMS[feedItem]?.n || feedItem;
    const rewName = ITEMS[rewardItem]?.n || rewardItem;
    if (!has(feedItem)) {
      await say(`${animalName} mendekat dan mengendus-endus lapar... Tapi kamu tidak membawa ${foodName}.`, animalName);
    } else {
      const ok = await ask(`Beri makan 1 ${foodName} kepada ${animalName}?`, animalName, 'Beri Makan', 'Tidak');
      if (ok) {
        addItem(feedItem, -1);
        addItem(rewardItem, 1);
        sfx('heal');
        this.sparkle(this.pl.x, this.pl.y - 12, 'dotg', 12);
        popWorld(this.pl.x, this.pl.y - 20, '♥ ' + soundText, 'heal');
        updHud();
        await say(`${animalName} makan dengan lahap: "${soundText}!" Sebagai balasannya, kamu mendapatkan 1 ${rewName}!`, animalName);
        saveGame(this);
      }
    }
    G.lock--;
  },
  async interactCampfire(cf) {
    G.lock++;
    sfx('fire');
    for (;;) {
      const items = [
        { t: 'Masak Makanan Alam', d: 'Bakar ikan, buat masakan dari hasil kebun & ternak' },
        { t: 'Hangatkan Badan', d: 'Pulihkan sebagian HP & MP di dekat api' },
        { t: 'Istirahat & Tunggu Waktu', d: 'Berkemah tidur hingga fajar atau malam' },
        { t: 'Tinggalkan' }
      ];
      const sel = await choose({
        head: 'API UNGGUN PERKEMAHAN', x: 26, y: 30, w: 240,
        items,
        foot: (i) => items[i].d || 'Kembali menjelajah.'
      });
      if (sel < 0 || sel === 3) break;
      if (sel === 0) {
        await cookMenu('Masak di Api Unggun', 'Arka');
      } else if (sel === 1) {
        sfx('heal');
        const st = stat();
        const addHp = Math.min(st.maxhp - S.hp, 30);
        const addMp = Math.min(st.maxmp - S.mp, 15);
        S.hp += addHp;
        S.mp += addMp;
        updHud();
        this.sparkle(this.pl.x, this.pl.y - 10, 'doto', 12);
        popWorld(this.pl.x, this.pl.y - 18, '+HP/MP Hangat', 'heal');
        await say('Duduk mendekat ke bara api unggun. Hawa dingin terusir dan tubuh terasa bugar!');
      } else if (sel === 2) {
        const timeChoice = await choose({
          head: 'WAKTU ISTIRAHAT', x: 40, y: 40, w: 210,
          items: [
            { t: 'Tidur hingga Fajar (06:00)', d: 'Bangun di pagi hari yang cerah' },
            { t: 'Tidur hingga Malam (20:00)', d: 'Bangun di malam hari di bawah bintang' },
            { t: 'Batal' }
          ],
          foot: (i) => ['Memulihkan seluruh HP & MP.', 'Memulihkan seluruh HP & MP untuk petualangan malam.', 'Batal beristirahat.'][i]
        });
        if (timeChoice === 0 || timeChoice === 1) {
          await fadeTo(1);
          const st = stat();
          S.hp = st.maxhp;
          S.mp = st.maxmp;
          const targetHour = timeChoice === 0 ? 6 : 20;
          if (S.time >= targetHour) {
            S.day = (S.day || 0) + 1;
          }
          S.time = targetHour;
          updClock();
          updHud();
          sfx('heal');
          await sleep(600);
          await fadeTo(0);
          saveGame(this);
          sfx('save');
          if (timeChoice === 0) {
            await say('Kicau burung pagi terdengar merdu. Fajar telah tiba! Tubuhmu pulih sepenuhnya.', 'Berkemah');
          } else {
            await say('Bintang-bintang gemerlap di langit malam. Suasana hening dan sejuk. Tubuhmu pulih sepenuhnya.', 'Berkemah');
          }
        }
      }
    }
    G.lock--;
  },
  async startChickenRace() {
    G.lock++;
    await say('Kukuruyuuuk! Selamat datang di Lomba Lari Ayam Desa Lumina! Siapa ayam tercepat pilihanmu?', 'Kiki');
    const betCost = 20;
    for (;;) {
      const picks = [
        { t: '1. Si Putih Kilat (Peluang 2x lipat)', r: 'Hadiah 40 G', d: 'Kecepatan stabil dan pantang menyerah.' },
        { t: '2. Si Jago Merah (Peluang 2x lipat)', r: 'Hadiah 40 G', d: 'Cepat berlari, tapi kadang suka mematuk tanah.' },
        { t: '3. Si Belang Lincah (Peluang 3.5x)', r: 'Hadiah 70 G', d: 'Kadang santai, tapi bisa mendadak sprint kilat!' },
        { t: 'Tutup / Batal' }
      ];
      const sel = await choose({
        head: 'TARUHAN LARI AYAM · Biaya: 20 G (Punya: ' + S.gold + ' G)',
        x: 20, y: 25, w: 260,
        items: picks,
        foot: (i) => picks[i].d || 'Kembali menjelajah desa.'
      });
      if (sel < 0 || sel === 3) break;
      if (S.gold < betCost) {
        sfx('buzz');
        await say('Uangmu kurang! Butuh 20 G untuk memasang taruhan ayam jagoanmu.', 'Kiki');
        continue;
      }
      S.gold -= betCost;
      updHud();
      sfx('coin');

      const racers = [
        { name: 'Si Putih Kilat', tex: 'chick0', mult: 2, prize: 40, x: 200, y: 460 },
        { name: 'Si Jago Merah', tex: 'chick1', mult: 2, prize: 40, x: 200, y: 476 },
        { name: 'Si Belang Lincah', tex: 'chick2', mult: 3.5, prize: 70, x: 200, y: 492 },
      ];
      const chosenRacer = racers[sel];
      await say(`Taruhan 20 G dipasang pada ${chosenRacer.name}! Ayo kita menuju garis start!`, 'Kiki');

      // Setup sprite balapan
      const startX = 200, finishX = 350;
      const chickSprites = racers.map((r, idx) => {
        const spr = this.add.sprite(startX, r.y, r.tex, 0).setOrigin(.5, 1).setDepth(r.y + 10);
        spr.play(r.tex + '_mv');
        return spr;
      });

      // Hitung mundur
      sfx('ok');
      popWorld(startX + 60, 440, '3...', 'gold');
      await sleep(600);
      sfx('ok');
      popWorld(startX + 60, 440, '2...', 'gold');
      await sleep(600);
      sfx('ok');
      popWorld(startX + 60, 440, '1...', 'gold');
      await sleep(600);
      sfx('chest');
      popWorld(startX + 60, 440, 'MULAI! PETOOOK!', 'crit');

      // Animasi lari
      let winnerIdx = -1;
      const speeds = [1, 1, 1];
      const xs = [startX, startX, startX];

      while (winnerIdx === -1) {
        await sleep(100);
        for (let i = 0; i < 3; i++) {
          // Kejadian dinamis: sprint atau terhenti matuk
          const r = Math.random();
          if (i === 0) { // Si Putih (konsisten)
            speeds[0] = rnd(3.8, 5.2);
          } else if (i === 1) { // Si Jago Merah (kadang cepat, kadang bengong)
            if (r < 0.2) speeds[1] = 0.5; // bengong
            else if (r > 0.6) speeds[1] = rnd(5.5, 7.0);
            else speeds[1] = rnd(3.5, 5.0);
          } else if (i === 2) { // Si Belang (sprint liar)
            if (r < 0.3) speeds[2] = 1.0;
            else if (r > 0.65) speeds[2] = rnd(6.5, 8.5);
            else speeds[2] = rnd(3.0, 4.5);
          }
          xs[i] += speeds[i];
          chickSprites[i].x = Math.round(xs[i]);
          if (xs[i] >= finishX && winnerIdx === -1) {
            winnerIdx = i;
          }
        }
      }

      await sleep(400);
      const winner = racers[winnerIdx];
      popWorld(finishX, winner.y - 12, 'JUARA 1!', 'gold');
      this.sparkle(finishX, winner.y - 6, 'doto', 14);

      if (winnerIdx === sel) {
        sfx('lvl');
        S.gold += winner.prize;
        updHud();
        this.sparkle(this.pl.x, this.pl.y - 12, 'dotg', 18);
        popWorld(this.pl.x, this.pl.y - 18, `+${winner.prize} G MENANG!`, 'heal');
        await say(`HEBAT SEKALI! ${winner.name} menembus garis finish pertama! Kamu memenangkan hadiah ${winner.prize} G!`, 'Kiki');
        saveGame(this);
      } else {
        sfx('buzz');
        await say(`Pemenangnya adalah ${winner.name}! Ayammu kalah tipis kali ini... Jangan menyerah, ayo tanding lagi!`, 'Kiki');
      }

      // Bersihkan sprite ayam balapan
      chickSprites.forEach(s => s.destroy());
    }
    G.lock--;
  },
  async interactFountain(x, y) {
    G.lock++;
    for (;;) {
      const act = await choose({
        head: 'AIR MANCUR DESA LUMINA', x: 26, y: 30, w: 240,
        items: [
          { t: 'Basuh Muka Air Sejuk', d: 'Segarkan diri, pulihkan 25 HP & MP' },
          { t: 'Lempar Koin Harapan', r: '5 G', d: 'Memohon berkah keberuntungan petualang' },
          { t: 'Tinggalkan' }
        ],
        foot: (i) => ['Membasuh wajah dengan mata air alami, pulihkan 25 HP & MP.', 'Melempar koin ke dasar air mancur untuk memohon berkah petualangan.', 'Kembali menjelajah.'][i]
      });
      if (act < 0 || act === 2) break;
      if (act === 0) {
        const st = stat();
        S.hp = Math.min(st.maxhp, S.hp + 25);
        S.mp = Math.min(st.maxmp, S.mp + 25);
        updHud();
        sfx('heal');
        this.sparkle(this.pl.x, this.pl.y - 12, 'dot', 14);
        popWorld(this.pl.x, this.pl.y - 18, '+25 HP/MP Segar', 'heal');
        await say('Air pegunungan yang sangat jernih dan sejuk! Lelah dan kantuk di wajahmu seketika sirna. HP & MP pulih 25 poin!', 'Air Mancur');
      } else if (act === 1) {
        if (S.gold < 5) {
          sfx('buzz');
          await say('Kamu meraba kantong... koinmu tidak cukup (butuh 5 G).', 'Air Mancur');
        } else {
          S.gold -= 5;
          updHud();
          sfx('coin');
          this.ripple(x, y - 6);
          this.sparkle(x, y - 20, 'doto', 14);
          // Berkah berkilau
          S.buff = S.buff || {};
          S.buff.atk = Math.max(S.buff.atk || 0, 300); // 5 menit buff ATK
          this.sparkle(this.pl.x, this.pl.y - 12, 'dotg', 16);
          popWorld(this.pl.x, this.pl.y - 18, '★ Berkah Air Suci! (ATK Naik)', 'crit');
          
          // Peluang kecil menemukan barang unik di dasar air mancur
          const r = Math.random();
          if (r < 0.25 && !S.flags.fountain_ring) {
            S.flags.fountain_ring = 1;
            addItem('ring', 1);
            sfx('chest');
            updHud();
            await say('Koin berdenting di dasar air mancur... pantulan air memperlihatkan sesuatu yang berkilau! Kamu menemukan Cincin Pelindung terselip di sela batu air mancur!', 'Berkah Harapan');
          } else {
            await say('Koin berdenting pelan di dasar air mancur. Permukaan air memancarkan kilau keemasan yang menenangkan jiwa! Kamu merasakan berkah kekuatan petualang selama 5 menit.', 'Berkah Harapan');
          }
        }
      }
    }
    G.lock--;
  },
  async ringVillageBell(s, bx, by) {
    if (this._bellT && this.t - this._bellT < 2.5) return;
    this._bellT = this.t;
    G.lock++;
    sfx('bell');
    
    // Animasi goyang lonceng perunggu
    this.tweens.add({
      targets: s,
      angle: 12,
      duration: 100,
      yoyo: true,
      repeat: 5,
      ease: 'Quad.easeInOut',
      onComplete: () => { s.angle = 0; }
    });

    popWorld(bx, by - 24, '🔔 DDOOONNGG!', 'gold');
    this.sparkle(bx, by - 12, 'doto', 14);

    // Kejutkan burung di sekitar agar terbang
    if (this.amb) {
      for (const a of this.amb) {
        if (a.k === 'bird' && a.st === 'peck') {
          const d = Math.hypot(a.s.x - bx, a.s.y - by);
          if (d < 220) {
            a.st = 'fly';
            a.s.play('cr_bird_f');
            a.vx = (a.s.x > bx ? 1 : -1) * rnd(80, 120);
            a.vy = -rnd(60, 90);
            sfx('flap');
          }
        }
      }
    }

    // Reaksi warga terdekat via balon ucapan (bark)
    const reacts = [
      'Dentangan yang merdu mengalun ke seluruh penjuru desa...',
      'Burung-burung di pepohonan terkejut dan terbang ke langit!',
      'Suara lonceng perunggu menandakan kedamaian Desa Lumina.'
    ];
    await say(pick(reacts), 'Lonceng Desa');

    // Sapaan spontan NPC desa jika dekat
    for (const n of this.npcs) {
      const d = Math.hypot(n.spr.x - bx, n.spr.y - by);
      if (d < 180 && typeof popBark === 'function') {
        const line = n.n.id === 'elder' ? 'Dentangan yang mengingatkan masa muda...' :
                     n.n.id === 'guard' ? 'Bukan tanda bahaya kan? Hehe.' :
                     n.n.id === 'child' ? 'Hore! Kak Arka membunyikan lonceng!' : 'Lonceng desa berdentang merdu!';
        popBark(n, line);
      }
    }

    G.lock--;
  },
  async feedPond(px, py) {
    if (this._feedingPond) return;
    this._feedingPond = true;
    G.lock++;

    // Tentukan opsi pakan yang dimiliki
    const opts = ['Lempar Remah Roti Kering (Gratis)'];
    if (has('seed')) opts.push('Tabur Benih Sayur Segar (1x)');
    if (has('berry')) opts.push('Lempar Buah Beri Manis (1x)');
    opts.push('Batal');

    const choice = await choose('Ingin melempar apa ke air kolam?', opts);
    if (choice === -1 || choice === opts.length - 1) {
      this._feedingPond = false;
      G.lock--;
      return;
    }

    const pl = this.pl;
    const selected = opts[choice];
    let baitName = 'Remah Roti';
    let luckyBonus = 0;

    if (selected.includes('Benih Sayur')) {
      addItem('seed', -1);
      baitName = 'Benih Sayur';
      luckyBonus = 0.2;
      updHud();
    } else if (selected.includes('Buah Beri')) {
      addItem('berry', -1);
      baitName = 'Buah Beri Manis';
      luckyBonus = 0.35;
      updHud();
    }

    // Animasi melempar umpan ke air
    sfx('swing');
    const crumb = this.add.image(pl.x, pl.y - 12, 'dotg').setScale(1.8).setDepth(py + 10);
    this.tweens.add({
      targets: crumb,
      x: px,
      y: py,
      duration: 450,
      ease: 'Quad.easeOut',
      onComplete: () => {
        crumb.destroy();
        sfx('splash');
        this.ripple(px, py);
        this.ripple(px + 8, py - 4);
      }
    });

    await sleep(550);

    // Efek bebek / ikan berenang mendekat
    const hasDuck = !this.M.dark && this.M.id !== 'cave' && this.M.id !== 'swamp';
    let duckSpr = null;
    if (hasDuck) {
      const startX = px + (Math.random() < .5 ? -50 : 50);
      const startY = py + rnd(-10, 10);
      duckSpr = this.add.sprite(startX, startY, Math.random() < .5 ? 'duck0' : 'duck1')
        .play((Math.random() < .5 ? 'duck0' : 'duck1') + '_mv')
        .setDepth(py + 1);
      duckSpr.flipX = startX > px;
      this.ripple(startX, startY);

      this.tweens.add({
        targets: duckSpr,
        x: px + (startX > px ? 14 : -14),
        y: py,
        duration: 700,
        ease: 'Sine.easeOut',
        onComplete: () => {
          sfx('quack');
          popWorld(px, py - 18, '🦆 Kwek! ♥', 'heal');
          this.ripple(px, py);
        }
      });
      await sleep(800);
    } else {
      // Ikan melompat menyambar
      const fishSpr = this.add.image(px, py, 'cr_fish').setDepth(py + 2);
      this.tweens.add({
        targets: fishSpr,
        y: py - 14,
        duration: 250,
        yoyo: true,
        onComplete: () => {
          fishSpr.destroy();
          sfx('splash');
          this.ripple(px, py);
          popWorld(px, py - 16, '🐟 Gluk! ♥', 'heal');
        }
      });
      await sleep(600);
    }

    // Hadiah kejutan dari dasar kolam (koin / cacing umpan / ikan kecil)
    const roll = Math.random() + luckyBonus;
    if (roll > 0.75) {
      const rewardCoin = rnd(4, 9);
      S.gold += rewardCoin;
      sfx('coin');
      updHud();
      this.sparkle(px, py - 8, 'doto', 12);
      await say(`Bebek dan ikan berebut ${baitName}! Gerakan mereka mengaduk dasar kolam hingga memunculkan koin tua berkilau (+${rewardCoin} G)!`, 'Kolam Riak');
    } else if (roll > 0.5 && !has('worm')) {
      addItem('seed', 1);
      sfx('chest');
      updHud();
      await say(`Bebek yang gembira menyelam dan meninggalkan biji tumbuhan air langka di tepian kolam! (+1 Benih Sayur)`, 'Kolam Riak');
    } else {
      await say(`Kawanan bebek dan ikan menikmati ${baitName} dengan riang! Riak-riak air berkilau menyejukkan hati.`, 'Kolam Riak');
    }

    // Bersihkan bebek setelah makan dan berenang pergi
    if (duckSpr) {
      this.tweens.add({
        targets: duckSpr,
        x: duckSpr.x + (duckSpr.flipX ? 60 : -60),
        alpha: 0,
        duration: 1200,
        delay: 500,
        onComplete: () => duckSpr.destroy()
      });
    }

    this._feedingPond = false;
    G.lock--;
  },
  async playTavernDice(dealerX, dealerY) {
    G.lock++;
    await say('Yo, kawan pengelana! Mau menghangatkan malam di kedai dengan lempar dadu gading? Aturannya mudah: tebak angka ganjil atau genap!', 'Bram si Pengelana');

    for (; ;) {
      const choice = await choose({
        head: `Dadu Kedai · Koinmu: ${S.gold} G`,
        x: 60, y: 40, w: 180,
        items: [
          { t: 'Tebak GENAP (Taruhan 10 G)', d: 'Menang jika dadu 2, 4, 6 (hadiah 20 G)' },
          { t: 'Tebak GANJIL (Taruhan 10 G)', d: 'Menang jika dadu 1, 3, 5 (hadiah 20 G)' },
          { t: 'Tebak GENAP (Taruhan 25 G)', d: 'Taruhan sedang (hadiah 50 G)' },
          { t: 'Tebak GANJIL (Taruhan 25 G)', d: 'Taruhan sedang (hadiah 50 G)' },
          { t: 'Aturan Main', d: 'Penjelasan cara bermain dadu kedai' },
          { t: 'Pamit', d: 'Kembali menikmati suasana kedai' }
        ],
        foot: (i) => [
          'Pasang 10 G pada angka genap.',
          'Pasang 10 G pada angka ganjil.',
          'Pasang 25 G pada angka genap.',
          'Pasang 25 G pada angka ganjil.',
          'Dengarkan petunjuk lempar dadu.',
          'Tinggalkan meja dadu.'
        ][i]
      });

      if (choice === -1 || choice === 5) {
        await say('Sampai jumpa di meja dadu berikutnya, kawan! Semoga perjalananmu aman.', 'Bram si Pengelana');
        break;
      }

      if (choice === 4) {
        await say('Dadu berkepala enam dikocok di dalam cangkir kayu. Jika angka yang muncul sesuai tebakanmu (ganjil/genap), kamu membawa pulang hadiah 2x lipat taruhanmu!', 'Aturan Dadu');
        continue;
      }

      let bet = 10;
      let guess = 'even'; // even atau odd
      if (choice === 0) { bet = 10; guess = 'even'; }
      else if (choice === 1) { bet = 10; guess = 'odd'; }
      else if (choice === 2) { bet = 25; guess = 'even'; }
      else if (choice === 3) { bet = 25; guess = 'odd'; }

      if (S.gold < bet) {
        sfx('buzz');
        await say(`Koinmu tidak cukup (${S.gold} G). Kamu butuh minimal ${bet} G untuk taruhan ini!`, 'Bram si Pengelana');
        continue;
      }

      // Potong koin taruhan
      S.gold -= bet;
      updHud();

      const tableX = dealerX - 16;
      const tableY = dealerY + 6;

      // Kocok dadu animasi
      popWorld(tableX, tableY - 14, '🎲 Mengocok...', 'gold');
      const diceFaces = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      for (let i = 0; i < 6; i++) {
        sfx('step');
        const tempVal = rnd(1, 6);
        popWorld(tableX + rnd(-6, 6), tableY - 12 + rnd(-4, 4), diceFaces[tempVal - 1], 'xp');
        await sleep(110);
      }

      // Hasil akhir lemparan dadu
      const result = rnd(1, 6);
      const isEven = (result % 2 === 0);
      const win = (guess === 'even' && isEven) || (guess === 'odd' && !isEven);

      sfx('crit');
      popWorld(tableX, tableY - 20, `${diceFaces[result - 1]} Angka ${result}!`, isEven ? 'heal' : 'crit');
      this.sparkle(tableX, tableY - 10, 'dot', 10);
      await sleep(650);

      const typeTxt = isEven ? 'GENAP' : 'GANJIL';
      if (win) {
        const reward = bet * 2;
        S.gold += reward;
        sfx('chest');
        updHud();
        this.sparkle(tableX, tableY - 12, 'dotg', 18);
        popWorld(this.pl.x, this.pl.y - 18, `🎉 Menang! +${reward} G`, 'heal');
        await say(`Dadu berhenti di angka [${result}] (${typeTxt})! Tebakanmu tepat sekali! Bram menyerahkan ${reward} G dengan senyum lebar: "Luar biasa, instingmu tajam sekali kawan!"`, 'Bram si Pengelana');
      } else {
        sfx('buzz');
        popWorld(this.pl.x, this.pl.y - 18, 'Kalah...', 'xp');
        await say(`Dadu berhenti di angka [${result}] (${typeTxt}). Sayang sekali tebakanmu meleset! Bram tertawa ramah: "Hahaha, dewi keberuntungan tersenyum padaku kali ini! Mau coba putaran lagi, kawan?"`, 'Bram si Pengelana');
      }
    }

    G.lock--;
  },
  async waterFloral(spr, fx, fy, id) {
    if (this._wateringFloral) return;
    this._wateringFloral = true;
    G.lock++;

    const key = `bloom_${this.M.id}_${id}`;
    S.flags = S.flags || {};

    if (S.flags[key]) {
      sfx('cur');
      popWorld(fx, fy - 16, '🌸 Bunga Mekar Segar', 'heal');
      await say('Bunga ini telah disiram hari ini dan mekar dengan sangat indah!', 'Taman Bunga');
      this._wateringFloral = false;
      G.lock--;
      return;
    }

    sfx('water');
    popWorld(fx, fy - 14, '💧 Menyiram...', 'xp');

    // Partikel tetesan air menyiram
    for (let i = 0; i < 6; i++) {
      const drop = this.add.image(fx + rnd(-8, 8), fy - 22, 'dot').setScale(1.4).setTint(0x7ad0ff).setDepth(fy + 5);
      this.tweens.add({
        targets: drop,
        y: fy - 4 + rnd(-2, 4),
        alpha: 0,
        duration: 350 + i * 50,
        onComplete: () => drop.destroy()
      });
    }

    await sleep(400);

    // Animasi mekar
    sfx('heal');
    if (spr) {
      spr.setTexture('bloom');
      this.tweens.add({
        targets: spr,
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 180,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }

    this.sparkle(fx, fy - 10, 'dotg', 16);
    popWorld(fx, fy - 20, '🌸 Bunga Mekar!', 'heal');
    S.flags[key] = 1;

    // Hadiah embun segar pulihkan MP
    const st = stat();
    const mpGain = 15;
    S.mp = Math.min(st.maxmp, S.mp + mpGain);
    updHud();
    popWorld(this.pl.x, this.pl.y - 18, `+${mpGain} MP (Embun Murni)`, 'crit');

    // Spawn 1 kupu-kupu terbang elok di sekitar bunga mekar
    if (typeof this.addFly === 'function') {
      this.addFly(fx + (Math.random() < .5 ? -14 : 14), fy - 12);
    }

    // Reaksi warga terdekat jika ada (misal Lina di desa)
    for (const n of this.npcs || []) {
      const d = Math.hypot(n.spr.x - fx, n.spr.y - fy);
      if (d < 160 && typeof popBark === 'function') {
        const line = n.n.id === 'girl' ? 'Bunganya mekar indah sekali! Terima kasih Kak Arka!' :
                     n.n.id === 'child' ? 'Wah! Ada kupu-kupu datang ke bunganya!' :
                     'Aroma bunganya sungguh harum semerbak...';
        popBark(n, line);
        break;
      }
    }

    await say('Air sejuk membasahi tanah pot. Kuncup bunga perlahan mekar dengan warna-warni yang semarak! Butiran embun paginya menyegarkan energimu (+15 MP).', 'Taman Bunga');

    this._wateringFloral = false;
    G.lock--;
  },
  async strikeDummy(spr, dx, dy) {
    if (this._dummyStriking) return;
    this._dummyStriking = true;

    const pl = this.pl;
    const st = stat();
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';

    // Arahkan pemain ke arah boneka
    const dir = Math.abs(dx - pl.x) > Math.abs(dy - pl.y) ? (dx > pl.x ? 'right' : 'left') : (dy > pl.y ? 'down' : 'up');
    pl.dir = dir;
    pl.flipX = dir === 'left';
    pl.anims.stop();
    pl.setFrame((dir === 'left' || dir === 'right' ? 'side' : dir) + '3');

    // Suara ayunan dan tebasan
    sfx('swing');
    await sleep(60);

    // Animasi goyang boneka latihan
    this.tweens.add({
      targets: spr,
      angle: dir === 'left' ? -14 : 14,
      duration: 60,
      yoyo: true,
      repeat: 3,
      ease: 'Quad.easeInOut',
      onComplete: () => { spr.angle = 0; }
    });

    // Partikel serpihan jerami
    for (let i = 0; i < 5; i++) {
      const straw = this.add.image(dx + rnd(-6, 6), dy - 14 + rnd(-4, 4), 'dot').setScale(1.2).setTint(0xe0c478).setDepth(dy + 2);
      this.tweens.add({
        targets: straw,
        x: straw.x + rnd(-16, 16),
        y: dy + rnd(2, 8),
        alpha: 0,
        duration: 350 + i * 40,
        onComplete: () => straw.destroy()
      });
    }

    // Kalkulasi hit & combo
    const now = Date.now();
    this._dummyCombo = this._dummyCombo || { count: 0, lastTime: 0 };
    if (now - this._dummyCombo.lastTime < 1800) {
      this._dummyCombo.count++;
    } else {
      this._dummyCombo.count = 1;
    }
    this._dummyCombo.lastTime = now;

    const combo = this._dummyCombo.count;
    const isCrit = Math.random() < 0.3 || combo >= 5;
    const dmg = Math.round(st.atk * (isCrit ? 1.6 : 1.0) * rnd(0.9, 1.15));

    if (isCrit) {
      sfx('crit');
      this.camShake(60, .003);
      popWorld(dx, dy - 26, `🔥 ${dmg}!`, 'crit');
    } else {
      sfx('hit');
      popWorld(dx, dy - 22, `${dmg}`, 'dmg');
    }

    // Banner kombo jika beruntun
    if (combo >= 5) {
      popWorld(dx, dy - 36, `💥 ${combo} HIT COMBO!`, 'heal');
      this.sparkle(dx, dy - 14, 'doto', 12);
      // Hadiah latihan EXP kecil
      if (combo % 5 === 0) {
        this.gainExp(2, pl.x, pl.y);
      }
    } else if (combo >= 2) {
      popWorld(dx, dy - 32, `${combo} Hit!`, 'gold');
    }

    // Komentar penyemangat dari penjaga / murid terdekat
    for (const n of this.npcs || []) {
      const dist = Math.hypot(n.spr.x - dx, n.spr.y - dy);
      if (dist < 200 && typeof popBark === 'function') {
        if (combo >= 5) {
          const praise = n.n.id === 'guard' ? 'Tebasan mantap, Arka! Ototmu makin terlatih!' :
                         n.n.id?.startsWith('ka') ? 'Kombo yang luar biasa! Posturmu sempurna!' :
                         'Wah, serangannya cepat sekali!';
          popBark(n, praise);
        }
        break;
      }
    }

    await sleep(150);
    pl.setFrame((dir === 'left' || dir === 'right' ? 'side' : dir) + '0');
    this._dummyStriking = false;
  },
  async playStoneSkipping(px, py) {
    if (this._skippingStone) return;
    this._skippingStone = true;
    G.lock++;

    const ans = await ask('Ada tumpukan kerikil pipih halus di tepi perairan.\nMau melempar batu pipih melantun di atas air?', 'Lempar Batu Pipih');
    if (!ans) {
      this._skippingStone = false;
      G.lock--;
      return;
    }

    const pl = this.pl;
    // Hadapkan pemain ke arah air
    const targetDir = this.M.id === 'lake' ? (px < 560 ? 'right' : 'left') : 'up';
    pl.dir = targetDir;
    pl.flipX = targetDir === 'left';
    pl.anims.stop();
    pl.setFrame((targetDir === 'left' || targetDir === 'right' ? 'side' : targetDir) + '3');

    popWorld(pl.x, pl.y - 18, '⏱ Bidik Lemparan...', 'gold');
    sfx('cur');

    // Mini-game reaksi waktu tombol 'a'
    const startTime = Date.now();
    let hitTimeDiff = 999;
    const hitPromise = new Promise(resolve => {
      const prevHandler = UIH;
      let resolved = false;
      const h = key => {
        if (resolved) return;
        if (key === 'a' || key === 'tap') {
          resolved = true;
          UIH = prevHandler;
          const elapsed = Date.now() - startTime;
          // Target pas di ~600ms
          hitTimeDiff = Math.abs(elapsed - 600);
          resolve(true);
        }
      };
      h.tap = true;
      UIH = h;
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          UIH = prevHandler;
          resolve(false);
        }
      }, 1200);
    });

    await hitPromise;

    // Hitung jumlah pantulan
    let skips = 1;
    if (hitTimeDiff < 140) skips = 5;
    else if (hitTimeDiff < 280) skips = 4;
    else if (hitTimeDiff < 450) skips = 3;
    else if (hitTimeDiff < 700) skips = 2;
    else skips = 1;

    sfx('swing');
    await sleep(100);

    // Animasi batu meluncur dan memantul di atas air
    const throwDirX = targetDir === 'left' ? -1 : targetDir === 'right' ? 1 : (Math.random() < .5 ? -0.4 : 0.4);
    const throwDirY = targetDir === 'up' ? -1 : 0.2;
    let currX = px;
    let currY = py;

    for (let k = 1; k <= skips; k++) {
      currX += throwDirX * rnd(18, 28);
      currY += throwDirY * rnd(12, 22);

      const stoneSpr = this.add.image(currX, currY - 6, 'dot').setScale(1.3).setTint(0xc8c2b2).setDepth(currY + 2);
      this.tweens.add({
        targets: stoneSpr,
        y: currY,
        duration: 180,
        yoyo: true,
        ease: 'Quad.easeInOut',
        onComplete: () => {
          stoneSpr.destroy();
          sfx('water');
          this.ripple(currX, currY);
          this.sparkle(currX, currY - 2, 'dot', 4);
        }
      });

      popWorld(currX, currY - 14, `Pantulan ${k}!`, 'xp');
      await sleep(220);
    }

    // Efek akhir lemparan
    if (skips >= 4) {
      sfx('crit');
      this.sparkle(currX, currY - 6, 'dotg', 18);
      popWorld(currX, currY - 24, `🌊 ${skips} Pantulan Sempurna!`, 'heal');

      // Pulihkan MP petualang berkat relaksasi
      const st = stat();
      S.mp = Math.min(st.maxmp, S.mp + 20);
      updHud();

      const roll = Math.random();
      if (roll < 0.35) {
        const coin = rnd(5, 12);
        S.gold += coin;
        sfx('coin');
        updHud();
        await say(`LUAR BIASA! Batu pipih meluncur anggun dan memantul ${skips} kali di permukaan air! Pantulannya menyenggol cangkang kerang kuno mengapung ke tepian (+${coin} G & +20 MP)!`, 'Lempar Batu Pipih');
      } else {
        await say(`HEBAT! Batu pipih meluncur deras membelah riak air dan memantul ${skips} kali berturut-turut! Suasana danau yang tenang memulihkan fokus jiwamu (+20 MP).`, 'Lempar Batu Pipih');
      }
    } else if (skips >= 2) {
      popWorld(currX, currY - 20, `${skips} Pantulan!`, 'gold');
      const st = stat();
      S.mp = Math.min(st.maxmp, S.mp + 10);
      updHud();
      await say(`Batu pipih berhasil memantul ${skips} kali sebelum perlahan tenggelam ke dasar air yang sejuk (+10 MP).`, 'Lempar Batu Pipih');
    } else {
      sfx('splash');
      popWorld(currX, currY - 16, 'Cemplung!', 'dmg');
      await say('PLUP! Batu langsung tenggelam ke dalam air. Lemparan berikutnya coba tekan tombol A lebih tepat waktu saat mengayun.', 'Lempar Batu Pipih');
    }

    pl.setFrame((targetDir === 'left' || targetDir === 'right' ? 'side' : targetDir) + '0');
    this._skippingStone = false;
    G.lock--;
  },

  async lookThroughTelescope(tx, ty) {
    if (this._usingTelescope) return;
    this._usingTelescope = true;
    G.lock++;

    const isN = isNight();
    sfx('click');

    const opt = await choose('Teropong Astronomi Observatorium', [
      'Teropong Langit dan Pemandangan',
      'Tinggalkan'
    ]);

    if (opt !== 0) {
      this._usingTelescope = false;
      G.lock--;
      return;
    }

    // Effect transition
    this.cameras.main.flash(350, 255, 255, 255);
    sfx('bell');

    if (!isN) {
      // Day time: Grand vista across Lumina
      await say('Kamu mengarahkan lensa teropong kuningan ke cakrawala benua Lumina yang disinari mentari...', 'Teropong Astronomi');
      const vistaList = [
        'Di kejauhan utara, puncak salju abadi Gunung Kryos tampak berkilau keperakan di balik halimun tipis.',
        'Ke arah barat daya, kincir-kincir angin Padang Angin berputar perlahan ditiup sepoi angin padang rumput.',
        'Ke arah selatan, permukaan Danau Cermin memantulkan langit biru bak cermin raksasa yang menawan hati.',
        'Dari ketinggian teras observatorium, atap-atap merah dan hiruk pikuk Distrik Pasar Kota Lumina terlihat damai.'
      ];
      for (const msg of vistaList) {
        await say(msg, 'Pandangan Cakrawala');
      }
      popWorld(tx, ty - 26, 'Pemandangan Megah!', 'gold');
    } else {
      // Night time: Celestial constellations & MP restored
      await say('Kamu mengarahkan lensa fokus ke kubah langit malam yang dipenuhi jutaan bintang berkilauan...', 'Teropong Astronomi');
      
      // Star sparkles around the telescope
      for (let i = 0; i < 12; i++) {
        this.time.delayedCall(i * 120, () => {
          this.sparkle(tx + rnd(-24, 24), ty - rnd(16, 48), [0xfff9a6, 0xaeeeff, 0xffffff][i % 3]);
        });
      }

      const constells = [
        { name: 'Rasi Pedang Lumina', desc: 'Gugusan 7 bintang tegak menyerupai bilah pedang penumpas kegelapan leluhur.' },
        { name: 'Rasi Naga Es Kryos', desc: 'Bintang-bintang biru pucat di utara yang meliuk anggun menjaga puncak es.' },
        { name: 'Rasi Sayap Penjaga', desc: 'Sepasang sayap cahaya yang melambangkan perlindungan abadi Dewi Cahaya Lumina.' }
      ];
      const picked = constells[Math.floor(Math.random() * constells.length)];

      await say("Lensa astronomi menangkap pendaran mistis dari: **" + picked.name + "**!\n" + picked.desc, "Langit Bintang");

      const st = stat();
      S.mp = st.maxmp;
      updHud();
      sfx('bell');
      popWorld(tx, ty - 26, 'Pikiran Terang! (MP Penuh)', 'crit');
      await say('Harmoni pendaran bintang-bintang di angkasa menjernihkan pikiran dan mengisi penuh energi batinmu (+MP Penuh)!', 'Teropong Astronomi');
    }

    this._usingTelescope = false;
    G.lock--;
  },

  async talkPriestElian(o) {
    await talk(o.n.name, [
      'Damai menyertaimu, musafir muda.',
      'Kuil ini didirikan oleh para Penjaga Cahaya untuk menjaga kemurnian Danau Cermin dan menerangi jiwa-jiwa yang tersesat.',
      'Jika hatimu gundah atau tubuhmu lelah oleh pertarungan, berdoalah di Altar Cahaya atau berikan sedekah lilin untuk memohon perlindungan sang Dewi.'
    ]);
  },

  async interactShrineAltar(ax, ay) {
    if (this._inShrineAltar) return;
    this._inShrineAltar = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Altar Kuil Penjaga Cahaya', [
      'Berdoa Khusyuk di Hadapan Altar (Pulihkan Jiwa)',
      'Sedekah Minyak Lilin (10 G) - Berkah Perlindungan',
      'Derma Kedermawanan Peziarah (30 G) - Air Suci Kuil',
      'Tinggalkan Altar'
    ]);

    if (opt === 0) {
      // Berdoa Khusyuk
      this.cameras.main.flash(350, 255, 255, 255);
      sfx('bell');
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 100, () => {
          this.sparkle(this.pl.x + rnd(-16, 16), this.pl.y - rnd(10, 36), [0xfff4c2, 0xaeeeff, 0xffffff][i % 3]);
        });
      }

      // Cure status effects
      S.status = {};
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 20);
      S.mp = Math.min(st.maxmp, S.mp + 15);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, 'Hati Tenang (Status Pulih)', 'gold');
      await say('Kamu menundukkan kepala dalam doa yang hening di hadapan nyala lilin suci.\nHati dan pikiranmu terasa jernih, segala racun dan kelelahan sirna dari tubuhmu (+20 HP, +15 MP).', 'Altar Cahaya');
    } else if (opt === 1) {
      // Sedekah Lilin (10 G)
      if (S.gold < 10) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk bersedekah minyak lilin (butuh 10 G).', 'Kotak Sedekah');
      } else {
        S.gold -= 10;
        sfx('coin');
        this.time.delayedCall(250, () => sfx('bell'));
        this.cameras.main.flash(400, 255, 240, 180);

        for (let i = 0; i < 14; i++) {
          this.time.delayedCall(i * 90, () => {
            this.sparkle(this.pl.x + rnd(-20, 20), this.pl.y - rnd(8, 42), 0xffe27a);
          });
        }

        S.status = {};
        // Add blessing buff DEF
        S.buff.def = Math.max(S.buff.def || 0, 180); // 3 menit
        updHud();
        popWorld(this.pl.x, this.pl.y - 22, 'Berkah Perlindungan (DEF +25%)!', 'crit');
        await say('Gemerincing koin jatuh ke dalam kotak sedekah kayu. Nyala lilin di altar berpendar keemasan menyelimuti tubuhmu.\n"Semoga Cahaya senantiasa melindungi langkahmu, petualang muda." (Pertahanan naik selama 3 menit).', 'Berkah Cahaya');
      }
    } else if (opt === 2) {
      // Derma Peziarah (30 G)
      if (S.gold < 30) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk berderma (butuh 30 G).', 'Kotak Sedekah');
      } else {
        S.gold -= 30;
        sfx('coin');
        this.time.delayedCall(200, () => sfx('bell'));
        this.cameras.main.flash(500, 230, 250, 255);

        for (let i = 0; i < 18; i++) {
          this.time.delayedCall(i * 80, () => {
            this.sparkle(this.pl.x + rnd(-22, 22), this.pl.y - rnd(6, 44), [0x7ad8ff, 0xfff0a0, 0xffffff][i % 3]);
          });
        }

        S.status = {};
        const st = stat();
        S.hp = st.maxhp;
        S.mp = st.maxmp;
        S.buff.def = Math.max(S.buff.def || 0, 300); // 5 menit
        addItem('holy_water', 1);
        updHud();
        sfx('chest');
        popWorld(this.pl.x, this.pl.y - 24, 'Dapat Air Suci Kuil & Pulih Penuh!', 'gold');
        await say('Kotak sedekah berdentang merdu. Pendeta Elian tersenyum penuh haru dan menyerahkan guci kecil berisi air berkah murni:\n"Kedermawananmu sangat berarti bagi para peziarah kuil. Terimalah Air Suci Kuil ini untuk menemanimu menembus pekatnya kegelapan." (+1 Air Suci Kuil, HP & MP Penuh, DEF naik)!', 'Derma Suci');
      }
    }

    this._inShrineAltar = false;
    G.lock--;
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

  async interactSwampTotem(tx, ty) {
    if (this._inSwampTotem) return;
    this._inSwampTotem = true;
    G.lock++;

    sfx('creak');
    const hasOffering = has('mush') || has('berry');

    const opt = await choose('Totem Penjaga Rawa Senja', [
      'Basuh Air Murni Totem (Sembuhkan Racun & Pulihkan 30 HP/MP)',
      'Bunyikan Lonceng Bambu (Ketenangan Jiwa)',
      hasOffering ? 'Beri Persembahan Hasil Alam (1x Jamur / Beri)' : 'Beri Persembahan Hasil Alam (Perlu Jamur/Beri)',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Basuh air murni
      sfx('water');
      this.cameras.main.flash(250, 200, 255, 230);
      for (let i = 0; i < 7; i++) {
        this.sparkle(this.pl.x + rnd(-12, 12), this.pl.y - rnd(6, 30), 0x58d8c8);
      }

      // Cure status
      S.status = {};
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 30);
      S.mp = Math.min(st.maxmp, S.mp + 30);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, '🌿 Racun Terbersihkan!', 'gold');
      await say('Kamu membasuh muka dan tangan dengan air mata air jernih di ceruk batu totem.\nHawa sejuk meredakan sengatan racun rawa, tubuh dan energimu terasa bugar kembali (+30 HP, +30 MP)!', 'Penyucian Rawa');
    } else if (opt === 1) {
      // Bunyikan lonceng bambu
      for (let i = 0; i < 4; i++) {
        this.time.delayedCall(i * 140, () => {
          sfx('step');
          this.sparkle(tx + rnd(-10, 10), ty - rnd(14, 28), 0xb0d878);
        });
      }
      await sleep(650);
      popWorld(tx, ty - 22, '🎋 Klok... Klik... Kluk...', 'crit');
      await say('Bilah-bilah bambu beradu lembut ditiup angin rawa menghasilkan nada ritmis yang menentramkan.\nKabut tebal di sekitarmu serasa menipis, membawa ketenangan bagi jiwamu yang lelah.', 'Lonceng Bambu');
    } else if (opt === 2) {
      // Persembahan
      if (!hasOffering) {
        sfx('hit');
        await say('Kamu tidak membawa Jamur Hutan ataupun Buah Beri untuk diletakkan di altar persembahan.', 'Altar Totem');
      } else {
        if (has('mush')) addItem('mush', -1);
        else addItem('berry', -1);

        sfx('chest');
        this.cameras.main.flash(300, 220, 255, 200);
        for (let i = 0; i < 10; i++) {
          this.sparkle(tx + rnd(-12, 12), ty - rnd(8, 26), [0x50c878, 0xffd23a, 0xffffff][i % 3]);
        }

        const coin = rnd(12, 20);
        S.gold += coin;
        updHud();
        popWorld(tx, ty - 22, '✨ Berkah Roh Rawa (+' + coin + ' G)!', 'gold');
        await say('Pendaran hangat melingkari ukiran kayu totem. Roh penunggu rawa tersenyum damai menerima sesajen manismu.\nSebuah kantung kecil berisi koin rawa kuno muncul di atas batu (+' + coin + ' G)!', 'Berkah Alam');
      }
    }

    this._inSwampTotem = false;
    G.lock--;
  },

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

  async playStreetDrum(dx, dy, spr) {
    if (this._playingDrum) return;
    this._playingDrum = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Gendang Kayu Seniman Jalanan', [
      'Tabuh Irama Perkusi (Jam Session Meriah)',
      'Dengarkan Tabuhan Seniman Jalanan',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Drum beat sequence: DUM - TAK - DUM - DUM - TAK!
      const pattern = [
        { s: 'hit', delay: 0, offX: -4 },
        { s: 'step', delay: 180, offX: 4 },
        { s: 'hit', delay: 360, offX: -3 },
        { s: 'hit', delay: 500, offX: 3 },
        { s: 'crit', delay: 680, offX: 0 }
      ];

      for (const p of pattern) {
        this.time.delayedCall(p.delay, () => {
          sfx(p.s);
          this.sparkle(dx + p.offX + rnd(-6, 6), dy - rnd(8, 20), [0xffd23a, 0xff5a36, 0x58c0ff][rnd(0, 2)]);
        });
      }

      if (spr) {
        this.tweens.add({
          targets: spr,
          scaleY: 0.88,
          scaleX: 1.12,
          duration: 110,
          yoyo: true,
          repeat: 4,
          ease: 'Quad.easeInOut'
        });
      }

      // Bounce Arka playfully
      this.tweens.add({
        targets: this.pl,
        y: this.pl.y - 4,
        duration: 140,
        yoyo: true,
        repeat: 3,
        ease: 'Sine.easeInOut'
      });

      await sleep(950);

      // Nearby NPCs react with barks if any
      const barks = [
        'Iramanya asyik sekali!',
        'Ayo tabuh lebih kencang, Kawan!',
        'Hilang sudah semua penat hari ini!'
      ];
      let reacted = 0;
      for (const n of this.npcs || []) {
        const d = Math.hypot(n.spr.x - dx, n.spr.y - dy);
        if (d < 160 && typeof popBark === 'function') {
          popBark(n, barks[reacted % barks.length]);
          reacted++;
        }
      }

      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 20);
      S.mp = Math.min(st.maxmp, S.mp + 20);
      S.buff = S.buff || {};
      S.buff.atk = Math.max(S.buff.atk || 0, 180); // 3 menit buff ATK
      updHud();

      sfx('coin');
      const tip = rnd(10, 15);
      S.gold += tip;
      updHud();

      popWorld(dx, dy - 24, '🥁 DUM TAK DUM! (+' + tip + ' G)', 'gold');
      await say('Tabuhan gendangmu yang energik membuat anak-anak dan warga Kota Bawah bergoyang gembira!\nMusisi jalanan melemparkan koin tanda persahabatan sesama seniman (+ ' + tip + ' G, +20 HP/MP, & Buff Kuat ATK +20%)!', 'Gendang Jalanan');
    } else if (opt === 1) {
      sfx('hit');
      this.time.delayedCall(220, () => sfx('step'));
      this.time.delayedCall(440, () => sfx('crit'));
      await sleep(600);
      popWorld(dx, dy - 22, '🎶 Irama Jiwa Rakyat', 'crit');
      await say('Musisi pengelana menabuh gendang kayu dengan penghayatan mendalam. Ketukannya menceritakan suka duka kehidupan warga Kota Bawah yang tak pernah padam.', 'Seniman Jalanan');
    }

    this._playingDrum = false;
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

  async pumpBlacksmithBellows(bx, by, spr) {
    if (this._pumpingBellows) return;
    this._pumpingBellows = true;
    G.lock++;

    // Audio sequence: lever creak + strong whoosh wind + hammer clang
    sfx('creak');
    this.time.delayedCall(160, () => sfx('flap'));
    this.time.delayedCall(380, () => sfx('crit'));

    // Animate bellows lever compressing down & popping back up
    if (spr) {
      this.tweens.add({
        targets: spr,
        scaleY: 0.78,
        scaleX: 1.15,
        duration: 140,
        yoyo: true,
        repeat: 2,
        ease: 'Quad.easeInOut'
      });
    }

    // Spark shower at the forge (x + 24)
    for (let i = 0; i < 14; i++) {
      this.time.delayedCall(i * 50, () => {
        this.sparkle(bx + 24 + rnd(-8, 8), by - 12 - rnd(4, 18), [0xff4a18, 0xffa828, 0xffe840, 0xffffff][i % 4]);
      });
    }

    // Puff of soot/smoke
    this.time.delayedCall(200, () => this.puff(bx + 24, by - 24));
    await sleep(750);

    // Smith NPC reaction bark if nearby
    for (const n of this.npcs || []) {
      if (n.n.id === 'smith' || n.ch === 'smith') {
        const barks = [
          'Hembusan yang mantap! Baranya membara sempurna!',
          'Tenaga yang luar biasa, Arka! Besi ini siap ditempa!',
          'Hahaha! Panasnya pas! Dentingan palu jadi makin bernyawa!'
        ];
        if (typeof popBark === 'function') popBark(n, pick(barks));
        break;
      }
    }

    // Warmth restores 25 HP
    const st = stat();
    S.hp = Math.min(st.maxhp, S.hp + 25);
    updHud();

    // Chance for leftover ore scrap or copper tip
    const roll = Math.random();
    if (roll < 0.3) {
      addItem('ore', 1);
      updHud();
      sfx('chest');
      popWorld(bx, by - 24, 'Biji Besi Sisa Tempa (+1 Ore)!', 'crit');
      await say('Hembusan anginmu membuat bara api tungku berkobar garang!\nPak Besi puas melihat hasilnya dan memberikan segenggam serpihan bijih besi sisa tempaan (+1 Biji Besi, +25 HP)!', 'Bengkel Tempa');
    } else {
      const tip = rnd(5, 10);
      S.gold += tip;
      updHud();
      sfx('coin');
      popWorld(bx, by - 24, 'Upah Membantu (+' + tip + ' G)!', 'gold');
      await say('Bara api tungku menyemburkan lidah api keemasan yang menghangatkan seisi bengkel.\nPak Besi menepuk pundakmu dan memberikan beberapa koin upah kerja keras (+ ' + tip + ' G, +25 HP)!', 'Bengkel Tempa');
    }

    this._pumpingBellows = false;
    G.lock--;
  },

  async playRingToss(bx, by, spr) {
    if (this._playingRingToss) return;
    this._playingRingToss = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Kios Lempar Gelang Botol Bobi', [
      'Main Lempar Gelang (Biaya 15 G untuk 3 Gelang)',
      'Tanya Aturan & Hadiah',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (S.gold < 15) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk bermain lempar gelang (butuh 15 G).', 'Kios Gelang');
      } else {
        S.gold -= 15;
        updHud();
        sfx('coin');

        await say('Bobi si Pembuat Mainan tersenyum ramah:\n"Ini 3 gelang rotan pilihan! Arahkan lemparanmu dengan pas saat meteran membidik leher botol!"', 'Bobi');

        let hits = 0;
        for (let throwIdx = 1; throwIdx <= 3; throwIdx++) {
          const throwChoice = await choose('Lemparan Gelang ke-' + throwIdx + ' dari 3', [
            'Lempar Gelang Sekarang!',
            'Tarik Napas & Lempar Fokus'
          ]);

          sfx('swing');
          // Floating ring visual parabola
          for (let i = 0; i < 4; i++) {
            this.time.delayedCall(i * 90, () => {
              this.sparkle(bx + rnd(-10, 10), by - 12 - i * 4, 0xffd070);
            });
          }
          await sleep(420);

          // Success probability with slight randomness
          const isSuccess = Math.random() < 0.62;
          if (isSuccess) {
            hits++;
            sfx('bell');
            this.time.delayedCall(150, () => sfx('crit'));
            popWorld(bx, by - 24, '🎯 KLING! Masuk (' + hits + '/3)!', 'crit');
            await sleep(350);
          } else {
            sfx('step');
            popWorld(bx, by - 20, 'Pluk! Meleset!', 'dmg');
            await sleep(350);
          }
        }

        // Evaluate results
        if (hits === 3) {
          // Jackpot 3/3
          sfx('chest');
          this.cameras.main.flash(400, 255, 230, 200);
          for (let i = 0; i < 16; i++) {
            this.time.delayedCall(i * 60, () => {
              this.sparkle(bx + rnd(-16, 16), by - rnd(10, 32), [0xffd850, 0xff6a8a, 0xffffff][i % 3]);
            });
          }

          addItem('plushie', 1);
          updHud();
          popWorld(bx, by - 26, '🏆 SEMPURNA! Dapat Boneka Mochi!', 'gold');
          await say('LUAR BIASA! Ketiga gelang mendarat mulus di leher botol kaca berdenting nyaring!\nBobi bertepuk tangan kagum dan menyerahkan hadiah utama: Boneka Kucing Mochi (+1 Boneka Kucing Mochi)!', 'Juara Lempar Gelang');
        } else if (hits === 2) {
          // 2 hits -> 30 G
          S.gold += 30;
          updHud();
          sfx('coin');
          popWorld(bx, by - 24, 'Hebat! Hadiah 30 G!', 'gold');
          await say('Hebat sekali! 2 gelang berhasil mengunci leher botol! Bobi memberimu hadiah koin bonus (+30 G)!', 'Hadiah Kios');
        } else if (hits === 1) {
          // 1 hit -> Fresh Apple
          addItem('apple', 1);
          updHud();
          sfx('chest');
          popWorld(bx, by - 24, 'Dapat Apel Segar!', 'gold');
          await say('Lumayan! 1 gelang berhasil masuk. Bobi memberimu buah apel merah manis sebagai hadiah hiburan (+1 Apel Segar)!', 'Hadiah Kios');
        } else {
          popWorld(bx, by - 20, 'Coba Lagi Nanti!', 'dmg');
          await say('Sayang sekali, ketiga gelang membal di meja kayu. Jangan menyerah, coba lagi nanti ya!', 'Bobi');
        }
      }
    } else if (opt === 1) {
      await say('Aturan Main:\n- Biaya 15 G untuk 3 buah gelang rotan.\n- Masuk 1: Buah Apel Segar.\n- Masuk 2: Koin Emas 30 G.\n- Masuk 3 (Sempurna): Hadiah Utama Boneka Kucing Mochi!', 'Aturan Kios');
    }

    this._playingRingToss = false;
    G.lock--;
  },

  async playArcheryChallenge(tx, ty, spr) {
    if (this._playingArchery) return;
    this._playingArchery = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Pos Latihan Memanah Sersan Wira', [
      'Uji Ketangkasan Memanah (Biaya 10 G untuk 3 Panah)',
      'Tanya Petunjuk & Skor',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      if (S.gold < 10) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk mengikuti latihan panah (butuh 10 G).', 'Pos Panah');
      } else {
        S.gold -= 10;
        updHud();
        sfx('coin');

        await say('Sersan Wira merapikan busur latihan:\n"Tarik string busur dengan tenang, rasakan hembusan angin, dan lepaskan panah tepat ke titik tengah!"', 'Sersan Wira');

        let totalScore = 0;
        for (let shotIdx = 1; shotIdx <= 3; shotIdx++) {
          const shotChoice = await choose('Bidikan Panah ke-' + shotIdx + ' dari 3', [
            'Lepaskan Anak Panah!',
            'Tahan Napas & Lepaskan'
          ]);

          sfx('swing');
          // Arrow trail projectile flight toward target
          for (let i = 0; i < 5; i++) {
            this.time.delayedCall(i * 70, () => {
              this.sparkle(tx + rnd(-12, 12), ty - 8 - i * 3, 0xffffff);
            });
          }
          await sleep(380);

          // Accuracy probability calculation
          const roll = Math.random();
          let score = 0;
          if (roll < 0.35) {
            score = 30; // Bullseye
            sfx('crit');
            this.time.delayedCall(120, () => sfx('bell'));
            popWorld(tx, ty - 26, '🎯 TEPAT TENGAH! (30 Poin)', 'crit');
          } else if (roll < 0.75) {
            score = 20; // Mid ring
            sfx('crit');
            popWorld(tx, ty - 24, 'Bagus! Lingkar Dalam (20 Poin)', 'gold');
          } else {
            score = 10; // Outer ring
            sfx('step');
            popWorld(tx, ty - 20, 'Lingkar Luar (10 Poin)', 'gold');
          }
          totalScore += score;
          await sleep(400);
        }

        // Summary & Rewards
        if (totalScore >= 70) {
          // Excellent Score
          sfx('chest');
          this.cameras.main.flash(400, 255, 230, 200);
          for (let i = 0; i < 14; i++) {
            this.time.delayedCall(i * 70, () => {
              this.sparkle(tx + rnd(-14, 14), sy = ty - rnd(8, 28), [0xffd84a, 0xff4a4a, 0xffffff][i % 3]);
            });
          }

          const rewardGold = 35;
          S.gold += rewardGold;
          const st = stat();
          S.exp = (S.exp || 0) + 15;
          updHud();

          popWorld(tx, ty - 26, '🏆 JUARA MEMANAH! (+35 G & +15 EXP)', 'gold');
          await say('LUAR BIASA! Total skormu ' + totalScore + ' poin! Tembakanmu setajam mata elang pengintai gerbang! Sersan Wira menyerahkan hadiah utama (+35 G & +15 EXP tempur)!', 'Juara Memanah');
        } else if (totalScore >= 40) {
          const rewardGold = 15;
          S.gold += rewardGold;
          updHud();
          sfx('coin');
          popWorld(tx, ty - 24, 'Bagus! Hadiah 15 G (' + totalScore + ' Poin)', 'gold');
          await say('Hasil yang solid! Total skormu ' + totalScore + ' poin. Sersan Wira mengangguk puas dan memberimu koin hadiah (+15 G)!', 'Latihan Panah');
        } else {
          addItem('potion', 1);
          updHud();
          sfx('chest');
          popWorld(tx, ty - 22, 'Dapat 1 Ramuan! (' + totalScore + ' Poin)', 'gold');
          await say('Total skormu ' + totalScore + ' poin. Latihan yang bagus untuk melatih fokus! Sersan Wira memberimu 1x Ramuan untuk memulihkan tenaga.', 'Latihan Panah');
        }
      }
    } else if (opt === 1) {
      await say('Aturan Lapangan Tembak:\n- Biaya 10 G untuk 3 anak panah latihan.\n- Lingkar Luar: 10 Poin.\n- Lingkar Dalam: 20 Poin.\n- Titik Pusat (Bullseye): 30 Poin.\n- Skor 70+: Hadiah Utama 35 G & 15 EXP!', 'Papan Aturan');
    }

    this._playingArchery = false;
    G.lock--;
  },

  async interactLighthouse(lx, ly, spr) {
    if (this._inLighthouse) return;
    this._inLighthouse = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Mercusuar Tua Danau Cermin', [
      'Nyalakan Lentera Cermin Mercusuar (Sapu Kabut Danau)',
      'Naik ke Balkon Menara & Pandang Danau',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Light the lighthouse beacon
      sfx('fire');
      this.time.delayedCall(200, () => sfx('crit'));
      this.time.delayedCall(450, () => sfx('bell'));
      this.cameras.main.flash(600, 255, 240, 200);

      // Light glow at lantern chamber
      this.lights.push({ x: lx, y: ly - 42, r: 90 });

      // Golden and silver light sparkles cascading across lake surface
      for (let i = 0; i < 20; i++) {
        this.time.delayedCall(i * 60, () => {
          this.sparkle(lx - 40 - i * 18, ly + rnd(-20, 20), [0xffea78, 0x9ad8ff, 0xffffff][i % 3]);
        });
      }
      await sleep(900);

      const st = stat();
      S.mp = st.maxmp;
      updHud();

      popWorld(lx, ly - 36, '✨ Cahaya Mercusuar Memancar! (MP Penuh)', 'crit');

      // Check if first time lighting
      if (!S.flags.lighthouse_lit) {
        S.flags.lighthouse_lit = 1;
        addItem('lake_pearl', 1);
        updHud();
        sfx('chest');
        popWorld(lx, ly - 48, '+1 Mutiara Danau Cermin!', 'gold');
        await say('Cahaya mercusuar membelah kabut danau dengan megah, memantulkan berkas keemasan di atas permukaan air bagai jutaan cermin!\nKakek penjaga mercusuar meneteskan air mata haru:\n"Akhirnya mercusuar ini menyala kembali setelah sekian lama padam... Terimalah Mutiara Danau Cermin ini sebagai tanda terima kasih para pelaut danau!" (+1 Mutiara Danau Cermin & MP Penuh)!', 'Lentera Danau');
      } else {
        await say('Sorotan cahaya mercusuar memantul anggun di atas tenangnya Danau Cermin. Jiwamu dipenuhi ketenangan dan kejernihan batin (MP Penuh)!', 'Mercusuar Danau');
      }
    } else if (opt === 1) {
      // Look from balcony
      sfx('water');
      for (let i = 0; i < 6; i++) {
        this.sparkle(this.pl.x + rnd(-10, 10), this.pl.y - rnd(6, 20), 0x9ad8ff);
      }
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 25);
      S.mp = Math.min(st.maxmp, S.mp + 25);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, 'Panorama Indah (+25 HP/MP)', 'gold');
      await say('Dari balkon kayu mercusuar, hembusan angin sejuk bertiup lembut. Permukaan danau terbentang luas memantulkan awan putih yang berarak damai (+25 HP, +25 MP)!', 'Balkon Mercusuar');
    }

    this._inLighthouse = false;
    G.lock--;
  },

















});
