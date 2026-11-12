'use strict';
// Perilaku khusus saat objek dunia dibuat (OBJ_SPAWN[tipe]); dipanggil spawnObj, this = scene World
const OBJ_SPAWN = {};
Object.assign(OBJ_SPAWN, {
  shrine(s, x, y, opt, d, type) {
    { this.wall(x - 56, y - 30, 14, 12); this.wall(x + 42, y - 30, 14, 12); s.setDepth(y - 60); }
  },
  cavemouth(s, x, y, opt, d, type) {
    { s.setDepth(y - 30); this.wall(x - 46, y - 40, 22, 40); this.wall(x + 24, y - 40, 22, 40); }
  },
  sign(s, x, y, opt, d, type) {
    this.inter.push({ x, y: y + 2, r: 14, fn: async () => { if (opt.lore && !opt.text) return this.readLore(opt.lore); await talk(null, [opt.text]); if (opt.lore) learn(opt.lore); } });
  },
  forge(s, x, y, opt, d, type) {
    this.add.particles(x, y - 22, 'doto', { lifespan: 700, speedY: { min: -30, max: -12 }, speedX: { min: -8, max: 8 }, alpha: { start: 1, end: 0 }, frequency: 160 }).setDepth(y + 1);
    this.lights.push({ x, y: y - 14, big: 1 });
  },
  pebbles(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 20,
      fn: async () => {
        await this.playStoneSkipping(x, y);
      }
    });
  },
  telescope(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.lookThroughTelescope(x, y);
      }
    });
  },
  altar(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.interactShrineAltar(x, y);
      }
    });
  },
  fieldoven(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.roastHarvest(x, y);
      }
    });
  },
  dripstone(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.harvestCaveStalactite(x, y);
      }
    });
  },
  frostflower(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.harvestFrostFlower(x, y);
      }
    });
  },
  totem(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.interactSwampTotem(x, y);
      }
    });
  },
  pigeons(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.feedCityPigeons(x, y);
      }
    });
  },
  teatable(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.interactTeaTable(x, y);
      }
    });
  },
  lotuspad(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.interactLotusPond(x, y);
      }
    });
  },
  dockboat(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 26,
      fn: async () => {
        await this.interactLakeBoat(x, y, s);
      }
    });
    this.inter.push({
      x, y: y + 4, r: 24,
      fn: async () => {
        if (this.onBoat) {
          this.onBoat = false;
          sfx('ok');
          popWorld(this.pl.x, this.pl.y - 20, 'Turun dari Perahu', 'heal');
          await say('Kamu menambatkan perahu di dermaga dan kembali ke daratan.');
        } else {
          const ok = await ask('Naiki perahu dayung untuk menjelajahi danau dalam?');
          if (ok) {
            this.onBoat = true;
            sfx('swim');
            popWorld(this.pl.x, this.pl.y - 20, 'Menaiki Perahu Dayung!', 'heal');
            const act = await choose({
              head: 'Perahu Dayung Danau Cermin',
              items: [
                { t: '🎣 Mancing di Danau Dalam' },
                { t: '⛵ Dayung ke Pulau Kuil Tengah' },
                { t: 'Tetap di Perahu' }
              ]
            });
            if (act === 0) {
              // Mancing Danau Dalam
              G.lock++;
              sfx('cast');
              popWorld(this.pl.x, this.pl.y - 24, 'Melempar Kail ke Palung Dalam...', 'heal');
              await sleep(1500);
              const isNight = S.time >= 19 || S.time < 5;
              const caught = isNight ? (Math.random() < 0.6 ? 'moon_fish' : 'lake_catfish') : (Math.random() < 0.6 ? 'lake_catfish' : 'fish');
              addItem(caught, 1);
              sfx('fanfare');
              banner(`MENDAPAT ${ITEMS[caught].n}!`, 'TANGKAPAN DANAU DALAM', true, 2200);
              popWorld(this.pl.x, this.pl.y - 24, `+1 ${ITEMS[caught].n}!`, 'gold');
              updHud();
              G.lock--;
            } else if (act === 1) {
              // Dayung ke pulau tengah
              sfx('swim');
              this.pl.setPosition(560, 560);
              popWorld(560, 540, 'Tiba di Pulau Kuil Tengah!', 'heal');
              this.onBoat = false;
            }
          }
        }
      }
    });
  },
  coffeeshrub(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        await this.harvestCoffeeShrub(x, y);
      }
    });
  },
  coffeekettle(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.brewCharcoalCoffee(x, y);
      }
    });
  },
  orchidrock(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.harvestRiverOrchid(x, y);
      }
    });
  },
  canaryperch(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.whistleToCanary(x, y, s);
      }
    });
  },
  woodlandshrine(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.interactWoodlandShrine(x, y);
      }
    });
  },
  bellows(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.pumpBlacksmithBellows(x, y, s);
      }
    });
  },
  ringbooth(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 26,
      fn: async () => {
        await this.playRingToss(x, y, s);
      }
    });
  },
  archerytarget(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 26,
      fn: async () => {
        await this.playArcheryChallenge(x, y, s);
      }
    });
  },
  lakelighthouse(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 28,
      fn: async () => {
        await this.interactLighthouse(x, y, s);
      }
    });
  },
  streetdrum(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 26,
      fn: async () => {
        await this.playStreetDrum(x, y, s);
      }
    });
  },
  dummy(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        await this.strikeDummy(s, x, y);
      }
    });
  },
  pot(s, x, y, opt, d, type) {
    const potId = `${x}_${y}`;
    if (S.flags && S.flags[`bloom_${this.M.id}_${potId}`]) s.setTexture('bloom');
    this.inter.push({
      x, y: y + 2, r: 16,
      fn: async () => {
        await this.waterFloral(s, x, y, potId);
      }
    });
  },
  well(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 4, r: 18,
      fn: async () => {
        G.lock++;
        sfx('splash');
        const st = stat();
        S.hp = Math.min(st.maxhp, S.hp + 15);
        updHud();
        this.sparkle(x, y - 10, 'dotg', 8);
        await say('Menimba air sumur yang dingin dan meminumnya segar. HP pulih 15 poin!');
        G.lock--;
      }
    });
  },
  apple1(s, x, y, opt, d, type) {
    const isOrange = type === 'orange1';
    this.inter.push({
      x, y: y - 10, r: 20,
      fn: async () => {
        G.lock++;
        sfx('swing');
        this.tweens.add({
          targets: s, angle: 4, duration: 70, yoyo: true, repeat: 4,
          onComplete: () => { s.angle = 0; }
        });
        this.puff(x, y - 6);
        
        for (let i = 0; i < 4; i++) {
          const leaf = this.add.image(x + rnd(-16, 16), y - 24, 'leaf').setDepth(y + 1);
          this.tweens.add({
            targets: leaf,
            y: y + rnd(-4, 6),
            x: leaf.x + rnd(-12, 12),
            angle: rnd(-30, 30),
            alpha: 0,
            duration: rnd(600, 900),
            onComplete: () => leaf.destroy()
          });
        }

        const roll = Math.random();
        if (roll < 0.35) {
          const fruitId = isOrange ? 'orange' : 'apple';
          addItem(fruitId, 1);
          sfx('blip');
          updHud();
          this.sparkle(x, y - 12, 'dotg', 8);
          popWorld(x, y - 20, `+${ITEMS[fruitId].n}`, 'xp');
          await say(`Kamu menggoyang dahan pohon dengan kuat. Buah ${ITEMS[fruitId].n} yang ranum jatuh ke tanganmu!`);
        } else if (roll < 0.55) {
          const coinGain = rnd(4, 9);
          S.gold += coinGain;
          sfx('coin');
          updHud();
          this.sparkle(x, y - 12, 'doto', 10);
          popWorld(x, y - 20, `+${coinGain} G`, 'gold');
          await say(`Terdengar bunyi gemerincing dari sela dahan! Seseorang tampaknya pernah menyembunyikan koin tua di sini (+${coinGain} G).`);
        } else if (roll > 0.88) {
          sfx('buzz');
          sfx('hurt');
          this.camShake(180, .005);
          const st = stat();
          const dmg = Math.min(S.hp - 1, 8);
          if (dmg > 0) S.hp -= dmg;
          updHud();
          addItem('honey', 1);
          popWorld(this.pl.x, this.pl.y - 18, `-${dmg} HP (Sengatan Lebah!)`, 'crit');
          await say(`DENGG!! Kawanan lebah liar terusik dari sarangnya dan menyengatmu (-${dmg} HP), namun kamu berhasil mengamankan Sarang Madu Liar! (+1 Madu Liar)`);
        } else {
          await say('Kamu menggoyang pohon. Dedaunan berguguran tertiup angin sepoi-sepoi, namun belum ada buah yang jatuh.');
        }
        G.lock--;
      }
    });
  },
  bench(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 16,
      fn: async () => {
        G.lock++;
        sfx('heal');
        const st = stat();
        S.hp = Math.min(st.maxhp, S.hp + 20);
        S.mp = Math.min(st.maxmp, S.mp + 10);
        updHud();
        this.sparkle(x, y - 10, 'dotg', 12);
        await say('Duduk santai sejenak di bangku kayu sambil menghirup udara segar. HP pulih 20 poin & MP pulih 10 poin!');
        G.lock--;
      }
    });
  },
  bell(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 4, r: 24,
      fn: async () => {
        await this.ringVillageBell(s, x, y);
      }
    });
  },
  campfire(s, x, y, opt, d, type) {
    this.lights.push({ x, y: y - 12, big: 1 });
    this.add.particles(x, y - 14, 'doto', { lifespan: 600, speedY: { min: -24, max: -8 }, speedX: { min: -6, max: 6 }, scale: { start: .9, end: 0 }, alpha: { start: 1, end: 0 }, frequency: 120 }).setDepth(y + 1);
    this.inter.push({
      x, y: y + 4, r: 24,
      fn: async () => {
        await this.interactCampfire(x, y);
      }
    });
  },
  alchemytable(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 24,
      fn: async () => {
        if (typeof openAlchemyTable === 'function') await openAlchemyTable();
        else await say('Meja eksperimen alkimia.');
      }
    });
  },
  scenicbench(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 22,
      fn: async () => {
        G.lock++;
        sfx('heal');
        this.sparkle(x, y - 8, 'dotg', 10);
        const st = stat();
        S.hp = Math.min(st.maxhp, S.hp + 30);
        S.mp = Math.min(st.maxmp, S.mp + 20);
        S.viewpoints = S.viewpoints || {};
        S.viewpoints[this.M.id] = true;
        updHud();
        await say(`Duduk santai di titik pemandangan alam yang indah. Angin bertiup sepoi-sepoi menyejukkan hati. (HP +30, MP +20).`);
        G.lock--;
      }
    });
  },
  mailbox(s, x, y, opt, d, type) {
    this.inter.push({
      x, y: y + 2, r: 20,
      fn: async () => {
        if (typeof openMailbox === 'function') await openMailbox();
        else await say('Kotak surat kayu di depan rumah Arka.');
      }
    });
  },
});
