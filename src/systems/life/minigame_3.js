'use strict';
// Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
