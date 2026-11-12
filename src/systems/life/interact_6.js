'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async feedPond(px, py) {
    if (this._feedingPond) return;
    this._feedingPond = true;
    G.lock++;

    // Tentukan opsi pakan yang dimiliki
    const opts = ['Lempar Remah Roti Kering (Gratis)'];
    if (has('seed')) opts.push('Tabur Benih Sayur Segar (1x)');
    if (has('berry')) opts.push('Lempar Buah Beri Manis (1x)');
    opts.push('Batal');

    const choice = await choose('Ingin melempar apa ke air kolam?', opts);
    if (choice === -1 || choice === opts.length - 1) {
      this._feedingPond = false;
      G.lock--;
      return;
    }

    const pl = this.pl;
    const selected = opts[choice];
    let baitName = 'Remah Roti';
    let luckyBonus = 0;

    if (selected.includes('Benih Sayur')) {
      addItem('seed', -1);
      baitName = 'Benih Sayur';
      luckyBonus = 0.2;
      updHud();
    } else if (selected.includes('Buah Beri')) {
      addItem('berry', -1);
      baitName = 'Buah Beri Manis';
      luckyBonus = 0.35;
      updHud();
    }

    // Animasi melempar umpan ke air
    sfx('swing');
    const crumb = this.add.image(pl.x, pl.y - 12, 'dotg').setScale(1.8).setDepth(py + 10);
    this.tweens.add({
      targets: crumb,
      x: px,
      y: py,
      duration: 450,
      ease: 'Quad.easeOut',
      onComplete: () => {
        crumb.destroy();
        sfx('splash');
        this.ripple(px, py);
        this.ripple(px + 8, py - 4);
      }
    });

    await sleep(550);

    // Efek bebek / ikan berenang mendekat
    const hasDuck = !this.M.dark && this.M.id !== 'cave' && this.M.id !== 'swamp';
    let duckSpr = null;
    if (hasDuck) {
      const startX = px + (Math.random() < .5 ? -50 : 50);
      const startY = py + rnd(-10, 10);
      duckSpr = this.add.sprite(startX, startY, Math.random() < .5 ? 'duck0' : 'duck1')
        .play((Math.random() < .5 ? 'duck0' : 'duck1') + '_mv')
        .setDepth(py + 1);
      duckSpr.flipX = startX > px;
      this.ripple(startX, startY);

      this.tweens.add({
        targets: duckSpr,
        x: px + (startX > px ? 14 : -14),
        y: py,
        duration: 700,
        ease: 'Sine.easeOut',
        onComplete: () => {
          sfx('quack');
          popWorld(px, py - 18, '🦆 Kwek! ♥', 'heal');
          this.ripple(px, py);
        }
      });
      await sleep(800);
    } else {
      // Ikan melompat menyambar
      const fishSpr = this.add.image(px, py, 'cr_fish').setDepth(py + 2);
      this.tweens.add({
        targets: fishSpr,
        y: py - 14,
        duration: 250,
        yoyo: true,
        onComplete: () => {
          fishSpr.destroy();
          sfx('splash');
          this.ripple(px, py);
          popWorld(px, py - 16, '🐟 Gluk! ♥', 'heal');
        }
      });
      await sleep(600);
    }

    // Hadiah kejutan dari dasar kolam (koin / cacing umpan / ikan kecil)
    const roll = Math.random() + luckyBonus;
    if (roll > 0.75) {
      const rewardCoin = rnd(4, 9);
      S.gold += rewardCoin;
      sfx('coin');
      updHud();
      this.sparkle(px, py - 8, 'doto', 12);
      await say(`Bebek dan ikan berebut ${baitName}! Gerakan mereka mengaduk dasar kolam hingga memunculkan koin tua berkilau (+${rewardCoin} G)!`, 'Kolam Riak');
    } else if (roll > 0.5 && !has('worm')) {
      addItem('seed', 1);
      sfx('chest');
      updHud();
      await say(`Bebek yang gembira menyelam dan meninggalkan biji tumbuhan air langka di tepian kolam! (+1 Benih Sayur)`, 'Kolam Riak');
    } else {
      await say(`Kawanan bebek dan ikan menikmati ${baitName} dengan riang! Riak-riak air berkilau menyejukkan hati.`, 'Kolam Riak');
    }

    // Bersihkan bebek setelah makan dan berenang pergi
    if (duckSpr) {
      this.tweens.add({
        targets: duckSpr,
        x: duckSpr.x + (duckSpr.flipX ? 60 : -60),
        alpha: 0,
        duration: 1200,
        delay: 500,
        onComplete: () => duckSpr.destroy()
      });
    }

    this._feedingPond = false;
    G.lock--;
  },
  async lookThroughTelescope(tx, ty) {
    if (this._usingTelescope) return;
    this._usingTelescope = true;
    G.lock++;

    const isN = isNight();
    sfx('click');

    const opt = await choose('Teropong Astronomi Observatorium', [
      'Teropong Langit dan Pemandangan',
      'Tinggalkan'
    ]);

    if (opt !== 0) {
      this._usingTelescope = false;
      G.lock--;
      return;
    }

    // Effect transition
    this.cameras.main.flash(350, 255, 255, 255);
    sfx('bell');

    if (!isN) {
      // Day time: Grand vista across Lumina
      await say('Kamu mengarahkan lensa teropong kuningan ke cakrawala benua Lumina yang disinari mentari...', 'Teropong Astronomi');
      const vistaList = [
        'Di kejauhan utara, puncak salju abadi Gunung Kryos tampak berkilau keperakan di balik halimun tipis.',
        'Ke arah barat daya, kincir-kincir angin Padang Angin berputar perlahan ditiup sepoi angin padang rumput.',
        'Ke arah selatan, permukaan Danau Cermin memantulkan langit biru bak cermin raksasa yang menawan hati.',
        'Dari ketinggian teras observatorium, atap-atap merah dan hiruk pikuk Distrik Pasar Kota Lumina terlihat damai.'
      ];
      for (const msg of vistaList) {
        await say(msg, 'Pandangan Cakrawala');
      }
      popWorld(tx, ty - 26, 'Pemandangan Megah!', 'gold');
    } else {
      // Night time: Celestial constellations & MP restored
      await say('Kamu mengarahkan lensa fokus ke kubah langit malam yang dipenuhi jutaan bintang berkilauan...', 'Teropong Astronomi');
      
      // Star sparkles around the telescope
      for (let i = 0; i < 12; i++) {
        this.time.delayedCall(i * 120, () => {
          this.sparkle(tx + rnd(-24, 24), ty - rnd(16, 48), [0xfff9a6, 0xaeeeff, 0xffffff][i % 3]);
        });
      }

      const constells = [
        { name: 'Rasi Pedang Lumina', desc: 'Gugusan 7 bintang tegak menyerupai bilah pedang penumpas kegelapan leluhur.' },
        { name: 'Rasi Naga Es Kryos', desc: 'Bintang-bintang biru pucat di utara yang meliuk anggun menjaga puncak es.' },
        { name: 'Rasi Sayap Penjaga', desc: 'Sepasang sayap cahaya yang melambangkan perlindungan abadi Dewi Cahaya Lumina.' }
      ];
      const picked = constells[Math.floor(Math.random() * constells.length)];

      await say("Lensa astronomi menangkap pendaran mistis dari: **" + picked.name + "**!\n" + picked.desc, "Langit Bintang");

      const st = stat();
      S.mp = st.maxmp;
      updHud();
      sfx('bell');
      popWorld(tx, ty - 26, 'Pikiran Terang! (MP Penuh)', 'crit');
      await say('Harmoni pendaran bintang-bintang di angkasa menjernihkan pikiran dan mengisi penuh energi batinmu (+MP Penuh)!', 'Teropong Astronomi');
    }

    this._usingTelescope = false;
    G.lock--;
  },
  async talkPriestElian(o) {
    await talk(o.n.name, [
      'Damai menyertaimu, musafir muda.',
      'Kuil ini didirikan oleh para Penjaga Cahaya untuk menjaga kemurnian Danau Cermin dan menerangi jiwa-jiwa yang tersesat.',
      'Jika hatimu gundah atau tubuhmu lelah oleh pertarungan, berdoalah di Altar Cahaya atau berikan sedekah lilin untuk memohon perlindungan sang Dewi.'
    ]);
  },
  async interactShrineAltar(ax, ay) {
    if (this._inShrineAltar) return;
    this._inShrineAltar = true;
    G.lock++;

    sfx('click');
    const opt = await choose('Altar Kuil Penjaga Cahaya', [
      'Berdoa Khusyuk di Hadapan Altar (Pulihkan Jiwa)',
      'Sedekah Minyak Lilin (10 G) - Berkah Perlindungan',
      'Derma Kedermawanan Peziarah (30 G) - Air Suci Kuil',
      'Tinggalkan Altar'
    ]);

    if (opt === 0) {
      // Berdoa Khusyuk
      this.cameras.main.flash(350, 255, 255, 255);
      sfx('bell');
      for (let i = 0; i < 8; i++) {
        this.time.delayedCall(i * 100, () => {
          this.sparkle(this.pl.x + rnd(-16, 16), this.pl.y - rnd(10, 36), [0xfff4c2, 0xaeeeff, 0xffffff][i % 3]);
        });
      }

      // Cure status effects
      S.status = {};
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 20);
      S.mp = Math.min(st.maxmp, S.mp + 15);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, 'Hati Tenang (Status Pulih)', 'gold');
      await say('Kamu menundukkan kepala dalam doa yang hening di hadapan nyala lilin suci.\nHati dan pikiranmu terasa jernih, segala racun dan kelelahan sirna dari tubuhmu (+20 HP, +15 MP).', 'Altar Cahaya');
    } else if (opt === 1) {
      // Sedekah Lilin (10 G)
      if (S.gold < 10) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk bersedekah minyak lilin (butuh 10 G).', 'Kotak Sedekah');
      } else {
        S.gold -= 10;
        sfx('coin');
        this.time.delayedCall(250, () => sfx('bell'));
        this.cameras.main.flash(400, 255, 240, 180);

        for (let i = 0; i < 14; i++) {
          this.time.delayedCall(i * 90, () => {
            this.sparkle(this.pl.x + rnd(-20, 20), this.pl.y - rnd(8, 42), 0xffe27a);
          });
        }

        S.status = {};
        // Add blessing buff DEF
        S.buff.def = Math.max(S.buff.def || 0, 180); // 3 menit
        updHud();
        popWorld(this.pl.x, this.pl.y - 22, 'Berkah Perlindungan (DEF +25%)!', 'crit');
        await say('Gemerincing koin jatuh ke dalam kotak sedekah kayu. Nyala lilin di altar berpendar keemasan menyelimuti tubuhmu.\n"Semoga Cahaya senantiasa melindungi langkahmu, petualang muda." (Pertahanan naik selama 3 menit).', 'Berkah Cahaya');
      }
    } else if (opt === 2) {
      // Derma Peziarah (30 G)
      if (S.gold < 30) {
        sfx('hit');
        await say('Koin emasmu tidak mencukupi untuk berderma (butuh 30 G).', 'Kotak Sedekah');
      } else {
        S.gold -= 30;
        sfx('coin');
        this.time.delayedCall(200, () => sfx('bell'));
        this.cameras.main.flash(500, 230, 250, 255);

        for (let i = 0; i < 18; i++) {
          this.time.delayedCall(i * 80, () => {
            this.sparkle(this.pl.x + rnd(-22, 22), this.pl.y - rnd(6, 44), [0x7ad8ff, 0xfff0a0, 0xffffff][i % 3]);
          });
        }

        S.status = {};
        const st = stat();
        S.hp = st.maxhp;
        S.mp = st.maxmp;
        S.buff.def = Math.max(S.buff.def || 0, 300); // 5 menit
        addItem('holy_water', 1);
        updHud();
        sfx('chest');
        popWorld(this.pl.x, this.pl.y - 24, 'Dapat Air Suci Kuil & Pulih Penuh!', 'gold');
        await say('Kotak sedekah berdentang merdu. Pendeta Elian tersenyum penuh haru dan menyerahkan guci kecil berisi air berkah murni:\n"Kedermawananmu sangat berarti bagi para peziarah kuil. Terimalah Air Suci Kuil ini untuk menemanimu menembus pekatnya kegelapan." (+1 Air Suci Kuil, HP & MP Penuh, DEF naik)!', 'Derma Suci');
      }
    }

    this._inShrineAltar = false;
    G.lock--;
  },
  async interactSwampTotem(tx, ty) {
    if (this._inSwampTotem) return;
    this._inSwampTotem = true;
    G.lock++;

    sfx('creak');
    const hasOffering = has('mush') || has('berry');

    const opt = await choose('Totem Penjaga Rawa Senja', [
      'Basuh Air Murni Totem (Sembuhkan Racun & Pulihkan 30 HP/MP)',
      'Bunyikan Lonceng Bambu (Ketenangan Jiwa)',
      hasOffering ? 'Beri Persembahan Hasil Alam (1x Jamur / Beri)' : 'Beri Persembahan Hasil Alam (Perlu Jamur/Beri)',
      'Tinggalkan'
    ]);

    if (opt === 0) {
      // Basuh air murni
      sfx('water');
      this.cameras.main.flash(250, 200, 255, 230);
      for (let i = 0; i < 7; i++) {
        this.sparkle(this.pl.x + rnd(-12, 12), this.pl.y - rnd(6, 30), 0x58d8c8);
      }

      // Cure status
      S.status = {};
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 30);
      S.mp = Math.min(st.maxmp, S.mp + 30);
      updHud();
      popWorld(this.pl.x, this.pl.y - 20, '🌿 Racun Terbersihkan!', 'gold');
      await say('Kamu membasuh muka dan tangan dengan air mata air jernih di ceruk batu totem.\nHawa sejuk meredakan sengatan racun rawa, tubuh dan energimu terasa bugar kembali (+30 HP, +30 MP)!', 'Penyucian Rawa');
    } else if (opt === 1) {
      // Bunyikan lonceng bambu
      for (let i = 0; i < 4; i++) {
        this.time.delayedCall(i * 140, () => {
          sfx('step');
          this.sparkle(tx + rnd(-10, 10), ty - rnd(14, 28), 0xb0d878);
        });
      }
      await sleep(650);
      popWorld(tx, ty - 22, '🎋 Klok... Klik... Kluk...', 'crit');
      await say('Bilah-bilah bambu beradu lembut ditiup angin rawa menghasilkan nada ritmis yang menentramkan.\nKabut tebal di sekitarmu serasa menipis, membawa ketenangan bagi jiwamu yang lelah.', 'Lonceng Bambu');
    } else if (opt === 2) {
      // Persembahan
      if (!hasOffering) {
        sfx('hit');
        await say('Kamu tidak membawa Jamur Hutan ataupun Buah Beri untuk diletakkan di altar persembahan.', 'Altar Totem');
      } else {
        if (has('mush')) addItem('mush', -1);
        else addItem('berry', -1);

        sfx('chest');
        this.cameras.main.flash(300, 220, 255, 200);
        for (let i = 0; i < 10; i++) {
          this.sparkle(tx + rnd(-12, 12), ty - rnd(8, 26), [0x50c878, 0xffd23a, 0xffffff][i % 3]);
        }

        const coin = rnd(12, 20);
        S.gold += coin;
        updHud();
        popWorld(tx, ty - 22, '✨ Berkah Roh Rawa (+' + coin + ' G)!', 'gold');
        await say('Pendaran hangat melingkari ukiran kayu totem. Roh penunggu rawa tersenyum damai menerima sesajen manismu.\nSebuah kantung kecil berisi koin rawa kuno muncul di atas batu (+' + coin + ' G)!', 'Berkah Alam');
      }
    }

    this._inSwampTotem = false;
    G.lock--;
  },
});
