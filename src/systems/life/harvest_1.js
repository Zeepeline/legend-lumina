'use strict';
// Objek interaktif dunia: harvest — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
