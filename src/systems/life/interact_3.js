'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
