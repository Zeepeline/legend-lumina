'use strict';
// Objek interaktif dunia: minigame — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
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

        await say(
          'Sersan Wira merapikan busur latihan:\n' +
          '"Tarik string busur dengan tenang, rasakan hembusan angin, dan lepaskan panah tepat ke titik tengah!"',
          'Sersan Wira'
        );

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
              this.sparkle(tx + rnd(-14, 14), ty - rnd(8, 28), [0xffd84a, 0xff4a4a, 0xffffff][i % 3]);
            });
          }

          const rewardGold = 35;
          S.gold += rewardGold;
          const st = stat();
          S.exp = (S.exp || 0) + 15;
          updHud();

          popWorld(tx, ty - 26, '🏆 JUARA MEMANAH! (+35 G & +15 EXP)', 'gold');
          await say(
            'LUAR BIASA! Total skormu ' + totalScore + ' poin! Tembakanmu setajam mata elang pengintai gerbang! ' +
            'Sersan Wira menyerahkan hadiah utama (+35 G & +15 EXP tempur)!',
            'Juara Memanah'
          );
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
          await say(
            'Total skormu ' + totalScore + ' poin. Latihan yang bagus untuk melatih fokus! ' +
            'Sersan Wira memberimu 1x Ramuan untuk memulihkan tenaga.',
            'Latihan Panah'
          );
        }
      }
    } else if (opt === 1) {
      await say(
        'Aturan Lapangan Tembak:\n' +
        '- Biaya 10 G untuk 3 anak panah latihan.\n' +
        '- Lingkar Luar: 10 Poin.\n' +
        '- Lingkar Dalam: 20 Poin.\n' +
        '- Titik Pusat (Bullseye): 30 Poin.\n' +
        '- Skor 70+: Hadiah Utama 35 G & 15 EXP!',
        'Papan Aturan'
      );
    }

    this._playingArchery = false;
    G.lock--;
  },
});
