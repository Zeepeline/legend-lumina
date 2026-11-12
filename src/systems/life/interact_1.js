'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
