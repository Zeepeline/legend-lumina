'use strict';
// Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
