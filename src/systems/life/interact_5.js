'use strict';
// Objek interaktif dunia: interact — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  async interactWeatherVane(vx, vy) {
    if (this._busyVane) return;

    const c = await choose("Baling-Baling Angin Kuningan", [
      "🧭 Amati Arah Angin & Ramalan Cuaca",
      "🍃 Tarik Nafas Segar Puncak Bukit (+30 HP/MP & Nafas Angin)",
      "Kembali"
    ]);

    if (c === 1) {
      const hpGain = Math.min(30, stat("mhp") - S.hp);
      const mpGain = Math.min(30, stat("mmp") - S.mp);
      S.hp += hpGain;
      S.mp += mpGain;

      if (!S.buff) S.buff = {};
      S.buff.spd = Math.max(S.buff.spd || 0, 150);

      // Wind green sparkles
      for (let i = 0; i < 6; i++) {
        const sp = this.add.circle(this.p.x + rnd(-12, 12), this.p.y - rnd(6, 20), rnd(2, 3), 0x81c784, 0.9).setDepth(this.p.depth + 1);
        this.tweens.add({
          targets: sp,
          x: sp.x + rnd(10, 24),
          y: sp.y - rnd(10, 20),
          alpha: 0,
          duration: rnd(600, 1000),
          onComplete: () => sp.destroy()
        });
      }

      sfx("step");
      sfx("chest");

      let bonusText = "";
      if (Math.random() < 0.4) {
        const g = rnd(8, 14);
        S.g += g;
        bonusText = " Di sela roda poros baling-baling, kamu menemukan koin yang tersangkut terbawa angin +" + g + "G!";
      }

      this.popWorld(this.p.x, this.p.y - 18, "+30 HP/MP & Nafas Angin!", "#aed581");
      await say("Hembusan Angin Pegunungan", [
        "Menghirup udara bersih perbukitan Padang Angin di bawah langit yang membentang luas.",
        "Paru-parumu terisi kesegaran murni dan kakimu melangkah ringan bagai didorong angin sepoi (Langkah Ringan 2.5 menit)!" + bonusText
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyVane = true;
    G.lock++;
    sfx("creak");
    this.popWorld(vx, vy - 24, "Memutar penunjuk arah...", "#ffd54f");

    await sleep(700);
    sfx("flap");

    // Wind gusts particle
    for (let i = 0; i < 8; i++) {
      const wx = vx - 20 + i * 6;
      const wy = vy - 10 + rnd(-4, 4);
      const puff = this.add.circle(wx, wy, rnd(1.5, 3), 0xffffff, 0.8).setDepth(vy + 10);
      this.tweens.add({
        targets: puff,
        x: puff.x + rnd(30, 60),
        alpha: 0,
        duration: rnd(500, 900),
        onComplete: () => puff.destroy()
      });
    }

    await sleep(800);
    G.lock--;
    this._busyVane = false;

    const directions = ["Utara (Hawa Sejuk Pegunungan)", "Timur (Angin Lembah Cerah)", "Selatan (Angin Hangat Dataran)", "Barat (Angin Lembap Danau Cermin)"];
    const curDir = directions[rnd(0, directions.length - 1)];

    const isNight = (typeof isNightTime === "function") ? isNightTime() : false;
    let forecast = "";
    if (isNight) {
      forecast = "Malam ini langit cerah bertabur bintang perak. Angin sejuk bertiup stabil, waktu yang tepat untuk berburu ikan malam atau menatap rasi bintang di Akademi.";
    } else {
      forecast = "Angin berhembus stabil dari arah padang. Udara kaya akan kelembapan tanah subur, sangat baik untuk pertumbuhan sayur kebun dan perjalanan kafilah.";
    }

    await say("Ramalan Cuaca Padang Angin", [
      "Baling-baling ayam jantan berputar lincah dan paruhnya menunjuk mantap ke arah: " + curDir + "!",
      forecast
    ]);
  },
  async interactWishingBoat(tx, ty) {
    if (this._busyWishingBoat) return;

    const c = await choose("Meja Perahu Kertas Danau Cermin", [
      "🌸 Lipat & Hanyutkan: Harapan Kedamaian Jiwa (Pulih HP & MP)",
      "🛡️ Lipat & Hanyutkan: Harapan Langkah Tangguh (DEF +20% 3 Mnt)",
      "🕊️ Renungi Danau & Doa Syukur (+20 MP)",
      "Kembali"
    ]);

    if (c === 2) {
      const mpGain = Math.min(20, stat("mmp") - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx("water");
        this.popWorld(tx, ty - 16, "+20 MP (Ketenangan Batin)", "#a8e6cf");
      }
      await say("Renungan Tepi Danau", [
        "Angin sepoi membawa aroma air tawar dan genta kerang yang berdenting lembut.",
        "Melihat riak air danau yang memantulkan langit membuat seluruh kepenatan luruh seketika."
      ]);
      return;
    }

    if (c !== 0 && c !== 1) return;

    this._busyWishingBoat = true;
    G.lock++;
    sfx("step");
    this.popWorld(tx, ty - 16, "Melipat perahu kertas...", "#f5ebd2");

    await sleep(1000);
    sfx("menu");
    await sleep(400);

    // Launch floating paper boat onto water
    // Table is at (tx, ty), water is slightly to the right/upwards towards the lake
    const startX = tx + 14;
    const startY = ty + 4;
    const boat = this.add.image(startX, startY, "paperboat").setOrigin(0.5, 0.5).setDepth(startY + 2);

    sfx("water");
    sfx("bell");

    // Ripple effect at launch point
    const rip = this.add.circle(startX, startY + 3, 3, 0xffe6aa, 0.7).setDepth(startY + 1);
    this.tweens.add({
      targets: rip,
      scaleX: 3,
      scaleY: 1.8,
      alpha: 0,
      duration: 1000,
      repeat: 2,
      onComplete: () => rip.destroy()
    });

    // Boat drifting tween with slight swaying
    this.tweens.add({
      targets: boat,
      x: startX + 55,
      y: startY - 25,
      alpha: 0,
      duration: 3800,
      ease: "Sine.easeInOut",
      onComplete: () => boat.destroy()
    });

    // Sparkling golden trail
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        if (!boat.active) return;
        const sp = this.add.circle(boat.x + rnd(-3, 3), boat.y + rnd(2, 4), rnd(1, 2.5), 0xffdd66, 0.9).setDepth(boat.depth - 1);
        this.tweens.add({
          targets: sp,
          scale: 0.2,
          alpha: 0,
          y: sp.y + 6,
          duration: 900,
          onComplete: () => sp.destroy()
        });
      }, i * 550);
    }

    await sleep(2200);

    if (c === 0) {
      // Full HP & MP restore
      S.hp = stat("mhp");
      S.mp = stat("mmp");
      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "Pulih Penuh! HP & MP MAX", "#ffff77");
      G.lock--;
      this._busyWishingBoat = false;
      await say("Perahu Harapan: Kedamaian Jiwa", [
        "Perahu kertas kecil dengan lilin menyala meluncur anggun di atas cermin air danau.",
        "Cahayanya memantul lembut bagai kunang-kunang di permukaan Danau Cermin.",
        "Setiap helaan nafasmu kini dipenuhi kedamaian murni (HP & MP pulih sepenuhnya)!"
      ]);
    } else {
      // DEF buff
      if (!S.buff) S.buff = {};
      S.buff.def = Math.max(S.buff.def || 0, 180);
      sfx("chest");
      this.popWorld(this.p.x, this.p.y - 18, "🛡️ Berkah DEF +20% (3 Mnt)", "#70c5ff");
      G.lock--;
      this._busyWishingBoat = false;
      await say("Perahu Harapan: Langkah Tangguh", [
        "Lilin keemasan di atas perahu kertas bertahan teguh menembus riak air danau.",
        "Semangat ketabahan menyelimuti ragamu bagai perisai pelindung yang kokoh (DEF +20% selama 3 menit)!"
      ]);
    }
  },
  async interactCampfire(cf) {
    G.lock++;
    sfx('fire');
    for (;;) {
      const items = [
        { t: 'Masak Makanan Alam', d: 'Bakar ikan, buat masakan dari hasil kebun & ternak' },
        { t: 'Hangatkan Badan', d: 'Pulihkan sebagian HP & MP di dekat api' },
        { t: 'Istirahat & Tunggu Waktu', d: 'Berkemah tidur hingga fajar atau malam' },
        { t: 'Tinggalkan' }
      ];
      const sel = await choose({
        head: 'API UNGGUN PERKEMAHAN', x: 26, y: 30, w: 240,
        items,
        foot: (i) => items[i].d || 'Kembali menjelajah.'
      });
      if (sel < 0 || sel === 3) break;
      if (sel === 0) {
        await cookMenu('Masak di Api Unggun', 'Arka');
      } else if (sel === 1) {
        sfx('heal');
        const st = stat();
        const addHp = Math.min(st.maxhp - S.hp, 30);
        const addMp = Math.min(st.maxmp - S.mp, 15);
        S.hp += addHp;
        S.mp += addMp;
        updHud();
        this.sparkle(this.pl.x, this.pl.y - 10, 'doto', 12);
        popWorld(this.pl.x, this.pl.y - 18, '+HP/MP Hangat', 'heal');
        await say('Duduk mendekat ke bara api unggun. Hawa dingin terusir dan tubuh terasa bugar!');
      } else if (sel === 2) {
        const timeChoice = await choose({
          head: 'WAKTU ISTIRAHAT', x: 40, y: 40, w: 210,
          items: [
            { t: 'Tidur hingga Fajar (06:00)', d: 'Bangun di pagi hari yang cerah' },
            { t: 'Tidur hingga Malam (20:00)', d: 'Bangun di malam hari di bawah bintang' },
            { t: 'Batal' }
          ],
          foot: (i) => ['Memulihkan seluruh HP & MP.', 'Memulihkan seluruh HP & MP untuk petualangan malam.', 'Batal beristirahat.'][i]
        });
        if (timeChoice === 0 || timeChoice === 1) {
          await fadeTo(1);
          const st = stat();
          S.hp = st.maxhp;
          S.mp = st.maxmp;
          const targetHour = timeChoice === 0 ? 6 : 20;
          if (S.time >= targetHour) {
            S.day = (S.day || 0) + 1;
          }
          S.time = targetHour;
          updClock();
          updHud();
          sfx('heal');
          await sleep(600);
          await fadeTo(0);
          saveGame(this);
          sfx('save');
          if (timeChoice === 0) {
            await say('Kicau burung pagi terdengar merdu. Fajar telah tiba! Tubuhmu pulih sepenuhnya.', 'Berkemah');
          } else {
            await say('Bintang-bintang gemerlap di langit malam. Suasana hening dan sejuk. Tubuhmu pulih sepenuhnya.', 'Berkemah');
          }
        }
      }
    }
    G.lock--;
  },
  async interactFountain(x, y) {
    G.lock++;
    for (;;) {
      const act = await choose({
        head: 'AIR MANCUR DESA LUMINA', x: 26, y: 30, w: 240,
        items: [
          { t: 'Basuh Muka Air Sejuk', d: 'Segarkan diri, pulihkan 25 HP & MP' },
          { t: 'Lempar Koin Harapan', r: '5 G', d: 'Memohon berkah keberuntungan petualang' },
          { t: 'Tinggalkan' }
        ],
        foot: (i) => ['Membasuh wajah dengan mata air alami, pulihkan 25 HP & MP.', 'Melempar koin ke dasar air mancur untuk memohon berkah petualangan.', 'Kembali menjelajah.'][i]
      });
      if (act < 0 || act === 2) break;
      if (act === 0) {
        const st = stat();
        S.hp = Math.min(st.maxhp, S.hp + 25);
        S.mp = Math.min(st.maxmp, S.mp + 25);
        updHud();
        sfx('heal');
        this.sparkle(this.pl.x, this.pl.y - 12, 'dot', 14);
        popWorld(this.pl.x, this.pl.y - 18, '+25 HP/MP Segar', 'heal');
        await say('Air pegunungan yang sangat jernih dan sejuk! Lelah dan kantuk di wajahmu seketika sirna. HP & MP pulih 25 poin!', 'Air Mancur');
      } else if (act === 1) {
        if (S.gold < 5) {
          sfx('buzz');
          await say('Kamu meraba kantong... koinmu tidak cukup (butuh 5 G).', 'Air Mancur');
        } else {
          S.gold -= 5;
          updHud();
          sfx('coin');
          this.ripple(x, y - 6);
          this.sparkle(x, y - 20, 'doto', 14);
          // Berkah berkilau
          S.buff = S.buff || {};
          S.buff.atk = Math.max(S.buff.atk || 0, 300); // 5 menit buff ATK
          this.sparkle(this.pl.x, this.pl.y - 12, 'dotg', 16);
          popWorld(this.pl.x, this.pl.y - 18, '★ Berkah Air Suci! (ATK Naik)', 'crit');
          
          // Peluang kecil menemukan barang unik di dasar air mancur
          const r = Math.random();
          if (r < 0.25 && !S.flags.fountain_ring) {
            S.flags.fountain_ring = 1;
            addItem('ring', 1);
            sfx('chest');
            updHud();
            await say('Koin berdenting di dasar air mancur... pantulan air memperlihatkan sesuatu yang berkilau! Kamu menemukan Cincin Pelindung terselip di sela batu air mancur!', 'Berkah Harapan');
          } else {
            await say('Koin berdenting pelan di dasar air mancur. Permukaan air memancarkan kilau keemasan yang menenangkan jiwa! Kamu merasakan berkah kekuatan petualang selama 5 menit.', 'Berkah Harapan');
          }
        }
      }
    }
    G.lock--;
  },
  async ringVillageBell(s, bx, by) {
    if (this._bellT && this.t - this._bellT < 2.5) return;
    this._bellT = this.t;
    G.lock++;
    sfx('bell');
    
    // Animasi goyang lonceng perunggu
    this.tweens.add({
      targets: s,
      angle: 12,
      duration: 100,
      yoyo: true,
      repeat: 5,
      ease: 'Quad.easeInOut',
      onComplete: () => { s.angle = 0; }
    });

    popWorld(bx, by - 24, '🔔 DDOOONNGG!', 'gold');
    this.sparkle(bx, by - 12, 'doto', 14);

    // Kejutkan burung di sekitar agar terbang
    if (this.amb) {
      for (const a of this.amb) {
        if (a.k === 'bird' && a.st === 'peck') {
          const d = Math.hypot(a.s.x - bx, a.s.y - by);
          if (d < 220) {
            a.st = 'fly';
            a.s.play('cr_bird_f');
            a.vx = (a.s.x > bx ? 1 : -1) * rnd(80, 120);
            a.vy = -rnd(60, 90);
            sfx('flap');
          }
        }
      }
    }

    // Reaksi warga terdekat via balon ucapan (bark)
    const reacts = [
      'Dentangan yang merdu mengalun ke seluruh penjuru desa...',
      'Burung-burung di pepohonan terkejut dan terbang ke langit!',
      'Suara lonceng perunggu menandakan kedamaian Desa Lumina.'
    ];
    await say(pick(reacts), 'Lonceng Desa');

    // Sapaan spontan NPC desa jika dekat
    for (const n of this.npcs) {
      const d = Math.hypot(n.spr.x - bx, n.spr.y - by);
      if (d < 180 && typeof popBark === 'function') {
        const line = n.n.id === 'elder' ? 'Dentangan yang mengingatkan masa muda...' :
                     n.n.id === 'guard' ? 'Bukan tanda bahaya kan? Hehe.' :
                     n.n.id === 'child' ? 'Hore! Kak Arka membunyikan lonceng!' : 'Lonceng desa berdentang merdu!';
        popBark(n, line);
      }
    }

    G.lock--;
  },
});
