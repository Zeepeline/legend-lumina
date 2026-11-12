'use strict';
// Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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
});
