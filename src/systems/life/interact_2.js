'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
      "Paman Gani tersenyum lega sambil menyeka dahi: " +
      "\"Terima kasih banyak atas bantuanmu, Arka! Berkatmu, para pejalan malam tidak akan tersesat!\"" + bonusReward
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
    this.popWorld(cx - 5, cy - 26, "Tssss...", "#ffab91");
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
});
