'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
