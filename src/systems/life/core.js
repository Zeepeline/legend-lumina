'use strict';
// Objek interaktif dunia: core — isi: lihat docs/CODEMAP.md
Object.assign(World.prototype, {
  enterRoom(to, d) {
    if (to === 'home' && !homeInit().owned) return this.buyHome();
    if (to === 'arsip' && !S.inv.akey) { if (!G.lock && !this._lockMsg) { this._lockMsg = 1; talk(null, ['Pintu Akademi tertutup. Penjaga menggeleng: "Arsip hanya untuk guru dan yang mendapat izin."']).then(() => { this.pl.y += 14; this._lockMsg = 0; }); } return; }
    this.goto(to, 160, 226, 'up');
  },
  async fishIceHole(hx, hy) {
    if (this._busyFishIce) return;
    const hasRod = has('rod');
    if (!hasRod) {
      await say('Lubang Es Puncak Beku', [
        'Lapisan es danau beku dilubangi nelayan pengelana.',
        'Di dalam air biru gelap yang dingin, tampak bayangan Ikan Glasier berenang anggun.',
        '(Butuh Alat Pancing untuk memancing di lubang es ini!)'
      ]);
      // Admiring restores 10 MP
      const mpGain = Math.min(10, stat('mmp') - S.mp);
      if (mpGain > 0) {
        S.mp += mpGain;
        sfx('water');
        this.popWorld(hx, hy - 14, '+10 MP (Kesejukan Es)', '#a8e6cf');
      }
      return;
    }

    const c = await choose('Lubang Pancing Es', [
      '🎣 Pancing Ikan Glasier (Uji Kesabaran)',
      '💧 Basuh Tangan dengan Air Glasier (+15 MP)',
      'Kembali'
    ]);

    if (c === 1) {
      const mpGain = Math.min(15, stat('mmp') - S.mp);
      S.mp += mpGain;
      sfx('water');
      this.popWorld(hx, hy - 14, '+15 MP Segar!', '#a8e6cf');
      await say('Air Glasier Murni', [
        'Air lubang es sangat menusuk dingin, namun mengembalikan konsentrasi batinmu seketika!'
      ]);
      return;
    }

    if (c !== 0) return;

    this._busyFishIce = true;
    G.lock++;
    sfx('step');
    this.popWorld(hx, hy - 16, 'Melempar kail ke es...', '#aed2ee');

    // Ripple effect at hole
    const rip = this.add.circle(hx, hy, 4, 0x8ac8f0, 0.7).setDepth(hy + 1);
    this.tweens.add({
      targets: rip,
      scaleX: 3.5,
      scaleY: 2,
      alpha: 0,
      duration: 1200,
      repeat: 2,
      onComplete: () => rip.destroy()
    });

    await sleep(1500);

    // Bite alert !
    sfx('menu');
    const ex = this.add.text(hx, hy - 20, '!', {
      fontFamily: 'sans-serif', fontSize: '18px', color: '#ffff55', fontStyle: 'bold', stroke: '#000', strokeThickness: 3
    }).setOrigin(0.5, 1).setDepth(hy + 10);
    this.tweens.add({
      targets: ex,
      y: hy - 28,
      duration: 400,
      yoyo: true,
      onComplete: () => ex.destroy()
    });

    await sleep(600);
    sfx('water');
    sfx('chest');

    addItem('ice_fish', 1);
    S.st.fish = (S.st.fish || 0) + 1;
    if (!S.fishLog) S.fishLog = {};
    S.fishLog.ice_fish = (S.fishLog.ice_fish || 0) + 1;
    achCheck(this);

    // Splash particles
    for (let i = 0; i < 7; i++) {
      const sp = this.add.circle(hx + rnd(-8, 8), hy + rnd(-4, 4), rnd(2, 3), 0xe2f6ff, 0.9).setDepth(hy + 8);
      this.tweens.add({
        targets: sp,
        x: sp.x + rnd(-16, 16),
        y: sp.y - rnd(12, 26),
        alpha: 0,
        duration: rnd(400, 700),
        onComplete: () => sp.destroy()
      });
    }

    this.popWorld(hx, hy - 16, '🎣 Dapat Ikan Glasier!', '#e2f6ff');
    G.lock--;
    this._busyFishIce = false;

    await say('Tangkapan Danau Beku', [
      'STRIKE! Dari lubang es terangkat seekor Ikan Glasier berkilauan!',
      'Sisiknya memancarkan hawa dingin sejuk. Jika dikonsumsi, tubuh akan kebal dari udara beku ekstrem (+30 HP, +30 MP & Kebal Dingin)!'
    ]);
  },
  async fish(f) {
    if (!has('rod')) return talk(null, ['Airnya beriak... ada ikan di sini! Kamu butuh Pancing (dijual di kios Bu Sari).']);
    if (this.fishing) return; this.fishing = true; G.lock++;
    const pl = this.pl, bob = this.add.image(f[0], f[1] - 2, 'dot').setTint(0xff4a3a).setScale(2).setDepth(f[1] + 1);
    const line = this.add.graphics().setDepth(f[1] + 1); line.lineStyle(1, 0xffffff, .8).lineBetween(pl.x + 4, pl.y - 18, f[0], f[1] - 2);
    sfx('swing'); popWorld(f[0], f[1] - 16, '...', 'xp');
    await sleep(rnd(1200, 3200));
    sfx('crit'); this.tweens.add({ targets: bob, y: f[1] + 2, duration: 80, yoyo: true, repeat: 4 }); popWorld(f[0], f[1] - 18, '!', 'crit');
    const hit = await new Promise(res => { const prev = UIH; let done = false; const h = k => { if (done) return; if (k === 'a' || k === 'tap') { done = true; UIH = prev; res(true); } }; h.tap = true; UIH = h; setTimeout(() => { if (!done) { done = true; UIH = prev; res(false); } }, 700); });
    bob.destroy(); line.destroy();
    if (hit) {
      const isNightTime = isNight();
      const isRain = this.weather === 'rain';
      const baited = has('bait'); if (baited) { addItem('bait', -1); popWorld(this.pl.x, this.pl.y - 34, 'umpan dipakai', 'xp'); }
      const r = Math.random() * (baited ? .55 : 1);
      // Ikan langka keluar saat malam atau hujan
      let id = 'fish';
      if (isNightTime && r < 0.25) id = 'moonfish'; // Ikan Rembulan
      else if (isRain && r < 0.25) id = 'rainfish'; // Ikan Hujan
      else if (r < 0.12) id = 'gfish';
      else if (r < 0.22) id = 'oldboot';

      addItem(id);
      if (id !== 'oldboot') S.st.fish++;
      // Catat ke buku log pancingan
      S.fishLog = S.fishLog || {};
      if (!S.fishLog[id]) S.fishLog[id] = { count: 0, firstHour: gameHours() };
      S.fishLog[id].count++;
      sfx('chest');
      updHud();
      const fishName = ITEMS[id]?.n || id;
      if (id === 'moonfish') await say('LUAR BIASA! Menangkap Ikan Rembulan yang bersinar di kegelapan malam! (+45 MP)', 'Mancing');
      else if (id === 'rainfish') await say('Hebat! Menangkap Ikan Hujan yang hanya berenang saat cuaca basah!', 'Mancing');
      else if (id === 'gfish') await say('WAH! Ikan Emas langka! (jual mahal di kios)', 'Mancing');
      else if (id === 'oldboot') await say('Yah... cuma sepatu butut.', 'Mancing');
      else await say('Dapat Ikan Mas!', 'Mancing');
      achCheck(this);
    }
    else await say('Terlambat! Ikannya lepas. Tekan SERANG tepat saat tanda ! muncul.');
    this.fishing = false; G.lock--;
  },
  spawnGarden() {
    this.garden = this.M.gardens.map((g, i) => {
      const [gx, gy, gw, gh] = g, spr = [];
      for (let k = 0; k < 6; k++) { const X = gx + 20 + (k % 3) * 40, Y = gy + 20 + Math.floor(k / 3) * 24; spr.push(this.add.image(X, Y, 'sprout').setOrigin(.5, 1).setDepth(Y).setVisible(false)); }
      this.inter.push({ rect: [gx - 8, gy - 12, gw + 16, gh + 24], fn: () => this.tendPlot(i) });
      return { spr };
    });
    this.updGarden(true);
  },
  plotState(i) { const p = S.garden[i]; if (!p) return 'empty'; return gameHours() - p.t >= plotHours(p) ? 'ripe' : 'grow'; },
  updGarden(force) { this.gT = (this.gT || 0) - this.dt; if (!force && this.gT > 0) return; this.gT = 1; this.garden.forEach((g, i) => { const st = this.plotState(i); g.spr.forEach(s => { s.setVisible(st !== 'empty'); s.setTexture(st === 'ripe' ? 'ripe' : 'sprout'); }); }); },
  async tendPlot(i) {
    const st = this.plotState(i);
    if (st === 'empty') {
      return this.plantPlot(i);
    }
    if (st === 'grow') { const left = Math.max(1, Math.ceil(plotHours(S.garden[i]) - (gameHours() - S.garden[i].t))); return talk(null, [`Tunasnya tumbuh subur. Panen sekitar ${left} jam lagi.`]); }
    const SD = SEEDS[S.garden[i].seed || 'seed']; S.garden[i] = null; addItem(SD.out, SD.n); S.st.harvest++; sfx('chest'); this.updGarden(true); updHud();
    const g = this.M.gardens[i]; this.sparkle(g[0] + g[2] / 2, g[1] + g[3] / 2, 'dotg', 16);
    await talk(null, [`Panen! Dapat ${ITEMS[SD.out].n} x${SD.n}.`]); achCheck(this);
  },
  spawnPuzzle() {
    const P = this.M.gate;
    this.add.image(P.plate[0], P.plate[1] - 4, 'plate').setDepth(-8e5); this.lights.push({ x: P.plate[0], y: P.plate[1] - 4 });
    if (S.flags.cave_gate) { this.add.image(P.plate[0], P.plate[1], 'boulder').setOrigin(.5, 1).setDepth(P.plate[1]); return; }
    this.gateS = this.add.image(P.x, P.y, 'gate').setOrigin(.5, 1).setDepth(P.y); this.gateW = this.wall(P.x - P.w / 2, P.y - 10, P.w, 10);
    const [bx, by] = P.boulder; this.boulder = this.add.image(bx, by, 'boulder').setOrigin(.5, 1).setDepth(by); this.bW = this.wall(bx - 8, by - 10, 16, 10); this.push = 0;
    this.inter.push({ x: P.x, y: P.y + 6, r: 24, fn: () => S.flags.cave_gate ? null : talk(null, ['Gerbang besi tertutup rapat. Di ruangan barat ada pelat batu yang bercahaya... mungkin ada hubungannya.']) });
  },
  updBoulder(dt) {
    const pl = this.pl, b = this.boulder; if (!b || this.bMoving || S.flags.cave_gate) return;
    const v = Input.vec(), dx = b.x - pl.x, dy = (b.y - 5) - (pl.y - 3); let dir = null;
    if (Math.abs(dy) < 10 && Math.abs(dx) < 18 && Math.abs(v.x) > .6) dir = [Math.sign(v.x), 0];
    else if (Math.abs(dx) < 10 && Math.abs(dy) < 15 && Math.abs(v.y) > .6) dir = [0, Math.sign(v.y)];
    if (dir && dir[0] * dx + dir[1] * dy <= 0) dir = null;
    if (!dir) { this.push = 0; return; }
    this.push += dt; if (this.push < .25) return; this.push = 0;
    const nx = b.x + dir[0] * 16, ny = b.y + dir[1] * 16;
    if (this.physics.overlapRect(nx - 7, ny - 9, 14, 8, false, true).some(z => z.gameObject !== this.bW)) { sfx('buzz'); return; }
    this.bMoving = true; sfx('step'); this.walls.remove(this.bW, true, true); this.bW = this.wall(nx - 8, ny - 10, 16, 10);
    this.tweens.add({ targets: b, x: nx, y: ny, duration: 220, onComplete: () => { b.setDepth(ny); this.bMoving = false; this.puff(nx, ny); this.checkPlate(); } });
  },
  async checkPlate() {
    const P = this.M.gate, b = this.boulder;
    if (Math.abs(b.x - P.plate[0]) > 4 || Math.abs(b.y - P.plate[1]) > 4) return;
    S.flags.cave_gate = 1; G.lock++; sfx('chest'); this.sparkle(b.x, b.y - 6, 'dot', 14); this.camShake(300, .006);
    this.walls.remove(this.gateW, true, true); this.tweens.add({ targets: this.gateS, y: this.gateS.y - 30, alpha: 0, duration: 900 });
    await sleep(600); banner('Gerbang terbuka!', 'TEKA-TEKI', false, 1600); await sleep(800); await say('Terdengar bunyi KLAK dari utara. Gerbang besi terangkat!'); G.lock--; achCheck(this); saveGame(this);
  },
  updPet(dt) {
    const pl = this.pl, p = this.pet; this.trail.push([pl.x - (pl.flipX ? -6 : 6), pl.y]); if (this.trail.length > 16) this.trail.shift();
    const [tx, ty] = this.trail[0];
    if (Math.hypot(pl.x - p.x, pl.y - p.y) > 15) { p.x += (tx - p.x) * .22; p.y += (ty - p.y) * .22; if (!p.anims.isPlaying) p.play('cat2_mv'); p.flipX = tx > p.x; }
    else { p.anims.stop(); p.setFrame(0); }
    this.digT -= dt; if (this.digT <= 0) { this.digT = rnd(40, 70); this.petDig(); }

    // Fitur #58: Anjing Pelacak Harta ("Kuro")
    if (S.petDog) {
      if (!this.dogBarkT) this.dogBarkT = 0;
      this.dogBarkT -= dt;
      if (this.dogBarkT <= 0) {
        this.dogBarkT = 5.0;
        // Cari peti, rahasia, atau titik galian terdekat
        const nearestChest = (this.M.chests || []).find(c => !S.flags[c.id] && Math.hypot(c.x - pl.x, c.y - pl.y) < 130);
        const nearestSecret = (this.secrets || []).find(s => Math.hypot(s.x - pl.x, s.y - pl.y) < 130);
        if (nearestChest || nearestSecret) {
          sfx('step');
          popWorld(p.x, p.y - 20, '🐕 Guk! Guk! (Harta Dekat!)', 'gold');
          this.sparkle(p.x, p.y - 6, 'spark', 10);
        }
      }
    }
  },
  petDig() {
    const p = this.pet; popWorld(p.x, p.y - 18, 'Meong!', 'gold'); this.sparkle(p.x, p.y - 4, 'doto', 8); this.puff(p.x, p.y);
    const pool = { village: ['seed', 'potion', 'coin'], forest: ['jelly', 'pelt', 'potion', 'coin'], meadow: ['tusk', 'sting', 'seed', 'coin'], cave: ['ore', 'shard', 'coin'], swamp: ['ecto', 'hipotion', 'coin'] }[this.M.id] || ['coin'];
    const it = pick(pool); if (it === 'coin') this.drop(p.x, p.y, 'coin', ri(5, 15)); else this.drop(p.x, p.y, 'item', it);
  },
  async bountyBoard() {
    S.bounties = S.bounties || {};
    const BOUNTY_LIST = [
      { id: 'b_berry', title: 'Pasokan Beri Manis', desc: 'Bu Sari butuh 3 Buah Beri untuk selai penginapan.', need: { item: 'berry', n: 3 }, gift: { gold: 35, exp: 20 } },
      { id: 'b_fish', title: 'Ikan Segar Kedai', desc: 'Koki penginapan butuh 2 Ikan Mas segar dari kolam.', need: { item: 'fish', n: 2 }, gift: { gold: 40, exp: 25 } },
      { id: 'b_slime', title: 'Pembersihan Lendir', desc: 'Kumpulkan 4 Lendir Slime yang mengotori jalan.', need: { item: 'jelly', n: 4 }, gift: { gold: 30, exp: 20 } },
      { id: 'b_herb', title: 'Bahan Obat Alami', desc: 'Bawakan 3 Daun Obat untuk stok ramuan desa.', need: { item: 'herb', n: 3 }, gift: { gold: 45, exp: 30 } }
    ];
    for (;;) {
      const items = BOUNTY_LIST.map(b => {
        const done = S.bounties[b.id];
        const canTurnIn = has(b.need.item, b.need.n);
        const tag = done ? '✔ SELESAI' : canTurnIn ? '★ SERAHKAN' : `${(S.inv[b.need.item] || 0)}/${b.need.n}`;
        return { t: (done ? '<s>' : '') + b.title + (done ? '</s>' : ''), r: tag };
      });
      items.push({ t: 'Tutup Papan' });
      const sel = await choose({
        head: 'PAPAN PENGUMUMAN DESA', x: 20, y: 30, w: 250,
        items,
        foot: (i) => i < BOUNTY_LIST.length ? `${BOUNTY_LIST[i].desc}<br>Imbalan: ${BOUNTY_LIST[i].gift.gold} G · ${BOUNTY_LIST[i].gift.exp} EXP` : 'Kembali bermain.'
      });
      if (sel < 0 || sel >= BOUNTY_LIST.length) break;
      const b = BOUNTY_LIST[sel];
      if (S.bounties[b.id]) {
        await say('Permintaan ini sudah kamu selesaikan sebelumnya.', 'Papan Pengumuman');
      } else if (has(b.need.item, b.need.n)) {
        addItem(b.need.item, -b.need.n);
        S.gold += b.gift.gold;
        S.exp += b.gift.exp;
        S.bounties[b.id] = 1;
        sfx('lvl');
        updHud();
        popWorld(this.pl.x, this.pl.y - 14, `+${b.gift.gold}G +${b.gift.exp}EXP`, 'gold');
        await say(`Kamu menyerahkan ${b.need.n} ${ITEMS[b.need.item].n}. Mendapat ${b.gift.gold} G dan ${b.gift.exp} EXP! Terima kasih atas bantuanmu!`, 'Papan Pengumuman');
        saveGame(this);
      } else {
        await say(`Bahan belum cukup: butuh ${b.need.n} ${ITEMS[b.need.item].n} (kamu punya ${S.inv[b.need.item] || 0}).`, 'Papan Pengumuman');
      }
    }
  },
  async feedAnimal(animalName, feedItem, rewardItem, soundText) {
    G.lock++;
    const foodName = ITEMS[feedItem]?.n || feedItem;
    const rewName = ITEMS[rewardItem]?.n || rewardItem;
    if (!has(feedItem)) {
      await say(`${animalName} mendekat dan mengendus-endus lapar... Tapi kamu tidak membawa ${foodName}.`, animalName);
    } else {
      const ok = await ask(`Beri makan 1 ${foodName} kepada ${animalName}?`, animalName, 'Beri Makan', 'Tidak');
      if (ok) {
        addItem(feedItem, -1);
        addItem(rewardItem, 1);
        sfx('heal');
        this.sparkle(this.pl.x, this.pl.y - 12, 'dotg', 12);
        popWorld(this.pl.x, this.pl.y - 20, '♥ ' + soundText, 'heal');
        updHud();
        await say(`${animalName} makan dengan lahap: "${soundText}!" Sebagai balasannya, kamu mendapatkan 1 ${rewName}!`, animalName);
        saveGame(this);
      }
    }
    G.lock--;
  },
  async waterFloral(spr, fx, fy, id) {
    if (this._wateringFloral) return;
    this._wateringFloral = true;
    G.lock++;

    const key = `bloom_${this.M.id}_${id}`;
    S.flags = S.flags || {};

    if (S.flags[key]) {
      sfx('cur');
      popWorld(fx, fy - 16, '🌸 Bunga Mekar Segar', 'heal');
      await say('Bunga ini telah disiram hari ini dan mekar dengan sangat indah!', 'Taman Bunga');
      this._wateringFloral = false;
      G.lock--;
      return;
    }

    sfx('water');
    popWorld(fx, fy - 14, '💧 Menyiram...', 'xp');

    // Partikel tetesan air menyiram
    for (let i = 0; i < 6; i++) {
      const drop = this.add.image(fx + rnd(-8, 8), fy - 22, 'dot').setScale(1.4).setTint(0x7ad0ff).setDepth(fy + 5);
      this.tweens.add({
        targets: drop,
        y: fy - 4 + rnd(-2, 4),
        alpha: 0,
        duration: 350 + i * 50,
        onComplete: () => drop.destroy()
      });
    }

    await sleep(400);

    // Animasi mekar
    sfx('heal');
    if (spr) {
      spr.setTexture('bloom');
      this.tweens.add({
        targets: spr,
        scaleX: 1.35,
        scaleY: 1.35,
        duration: 180,
        yoyo: true,
        repeat: 1,
        ease: 'Sine.easeInOut'
      });
    }

    this.sparkle(fx, fy - 10, 'dotg', 16);
    popWorld(fx, fy - 20, '🌸 Bunga Mekar!', 'heal');
    S.flags[key] = 1;

    // Hadiah embun segar pulihkan MP
    const st = stat();
    const mpGain = 15;
    S.mp = Math.min(st.maxmp, S.mp + mpGain);
    updHud();
    popWorld(this.pl.x, this.pl.y - 18, `+${mpGain} MP (Embun Murni)`, 'crit');

    // Spawn 1 kupu-kupu terbang elok di sekitar bunga mekar
    if (typeof this.addFly === 'function') {
      this.addFly(fx + (Math.random() < .5 ? -14 : 14), fy - 12);
    }

    // Reaksi warga terdekat jika ada (misal Lina di desa)
    for (const n of this.npcs || []) {
      const d = Math.hypot(n.spr.x - fx, n.spr.y - fy);
      if (d < 160 && typeof popBark === 'function') {
        const line = n.n.id === 'girl' ? 'Bunganya mekar indah sekali! Terima kasih Kak Arka!' :
                     n.n.id === 'child' ? 'Wah! Ada kupu-kupu datang ke bunganya!' :
                     'Aroma bunganya sungguh harum semerbak...';
        popBark(n, line);
        break;
      }
    }

    await say('Air sejuk membasahi tanah pot. Kuncup bunga perlahan mekar dengan warna-warni yang semarak! Butiran embun paginya menyegarkan energimu (+15 MP).', 'Taman Bunga');

    this._wateringFloral = false;
    G.lock--;
  },
});
