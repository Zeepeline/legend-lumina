'use strict';
// Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
