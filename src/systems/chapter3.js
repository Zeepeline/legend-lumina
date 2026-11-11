'use strict';
// Bab 3: obor kuno, gerbang es, Naga Es Kryos (AI 'dboss')
Object.assign(World.prototype, {
  spawnTorches() {
    this.torchS = [];
    this.M.torches.forEach(([x, y], i) => {
      const s = this.add.image(x, y, 'brazier').setOrigin(.5, 1).setDepth(y); this.shadow(x, y, 9, 3); this.wall(x - 8, y - 8, 16, 8);
      const fl = this.add.sprite(x, y - 11, 'fire').play('fire').setRotation(-Math.PI / 2).setScale(1.2).setDepth(y + 1).setVisible(!!S.flags['torch' + i]);
      this.lights.push({ x, y: y - 12 }); this.torchS.push(fl);
      this.inter.push({ x, y: y + 4, r: 16, fn: () => this.lightTorch(i) });
    });
  },
  spawnCaveTorches() {
    this.caveTorchS = [];
    (this.M.caveTorches || []).forEach(([x, y], i) => {
      const s = this.add.image(x, y, 'brazier').setOrigin(.5, 1).setDepth(y); this.shadow(x, y, 9, 3); this.wall(x - 8, y - 8, 16, 8);
      const lit = !!S.flags['cave_torch_' + i];
      const fl = this.add.sprite(x, y - 11, 'fire').play('fire').setRotation(-Math.PI / 2).setScale(1.2).setDepth(y + 1).setVisible(lit);
      if (lit) this.lights.push({ x, y: y - 12, big: 1 });
      this.caveTorchS.push(fl);
      this.inter.push({
        x, y: y + 4, r: 18,
        fn: async () => {
          if (S.flags['cave_torch_' + i]) {
            await talk(null, ['Api obor menerangi sudut gelap lorong gua. Hawa dingin terusir.']);
            return;
          }
          G.lock++;
          if (S.spell === 'fire' || (ITEMS[S.eq.wpn] && ITEMS[S.eq.wpn].k === 'wpn')) {
            S.flags['cave_torch_' + i] = 1;
            sfx('fire');
            fl.setVisible(true).setScale(.2);
            this.tweens.add({ targets: fl, scale: 1.2, duration: 400 });
            this.sparkle(x, y - 12, 'doto', 14);
            popWorld(x, y - 18, '🔥 Menyala!', 'crit');
            this.lights.push({ x, y: y - 12, big: 1 });
            const totalLit = [0, 1, 2].filter(k => S.flags['cave_torch_' + k]).length;
            if (totalLit === 3 && !S.flags.cave_torches) {
              S.flags.cave_torches = 1;
              sfx('lvl');
              banner('Cahaya Api Menerangi Gua!', 'TEKA-TEKI SELESAI', true, 2500);
              await sleep(1000);
              this.spawnChest({ id: 'g_torch', x: 420, y: 640, item: 'gold100' });
              await say('Ketiga obor di lorong gua telah menyala terang! Sebuah peti harta muncul di ruang tengah gua!', 'Gua Batu');
              saveGame(this);
            } else {
              await say(`Obor lorong menyala hangat! (${totalLit}/3 obor dinyalakan)`);
            }
          } else {
            await say('Mangkok obor batu kuno ini padam dan dingin. Gunakan api atau senjata untuk menyalakannya.');
          }
          G.lock--;
        }
      });
    });
  },
  async lightTorch(i) {
    if (S.flags['torch' + i]) return talk(null, ['Api obor kuno menyala hangat. Salju di sekitarnya mulai mencair.']);
    if (S.stage < 11) return talk(null, ['Obor batu kuno. Dingin dan padam... ada ukiran naga di tepinya.']);
    S.flags['torch' + i] = 1; sfx('fire'); this.torchS[i].setVisible(true).setScale(.2); this.tweens.add({ targets: this.torchS[i], scale: 1.2, duration: 400 });
    const [x, y] = this.M.torches[i]; this.sparkle(x, y - 14, 'doto', 16);
    const n = [0, 1, 2].filter(k => S.flags['torch' + k]).length;
    if (n < 3) {
      banner('Obor Kuno ' + n + '/3', 'MENYALA', false, 1600);
      await sleep(600); sfx('roar'); popWorld(x, y - 30, 'Penjaga bangkit!', 'hurt');
      for (const t of ['wolfs', 'wolfs']) { const a = rnd(0, 6.28), m = this.spawnEnemy(t, x + Math.cos(a) * 46, y + Math.sin(a) * 30); this.sparkle(m.spr.x, m.spr.y - 6, 'dot', 8); }
      updHud(); return;
    }
    S.stage = 12; updHud(); banner('Gerbang es mencair!', 'OBOR 3/3', true, 2200);
    await sleep(900); await talk(null, ['Di sisi obor terakhir ada relief yang tersingkap salju yang mencair: seorang wanita mengangkat tangan bercahaya. Di telapaknya... tanda daun, sama seperti tanganmu.']); learn('relief_obor');
    await sleep(800); this.openIceGate(); await say('Ketiga obor menyala! Gerbang es di utara mencair. Naga Es menunggu di puncak.');
    saveGame(this);
  },
  spawnIceGate() {
    const [x, y, w, h] = this.M.iceGate; this.iceWall = this.wall(x, y, w, h);
    this.iceG = this.add.image(x + w / 2, y + h, 'icegate').setOrigin(.5, 1).setDepth(y + h);
  },
  openIceGate() {
    if (!this.iceG) return; this.iceWall.destroy(); sfx('ice'); this.camShake(300, .006);
    const g = this.iceG; this.iceG = null; this.sparkle(g.x, g.y - 12, 'dot', 24);
    this.tweens.add({ targets: g, alpha: 0, scaleY: .2, duration: 700, onComplete: () => g.destroy() });
  },
  // Naga Es: kejar, terjang, semburan es berbentuk kipas, fase 2: panggil bantuan + hujan es melingkar + hentakan
  updDragon(e, dt, dx, dy, d) {
    const s = e.spr, D = e.D; if (!e.awake) { s.setVelocity(0); return; }
    if (!e.summoned && e.hp < e.max * .5) { this.summon(e); e.spdM = 1.35; return; }
    if (e.st === 'roar') { s.setVelocity(0); if (e.t <= 0) { s.clearTint(); e.st = 'idle'; e.t = .8; } return; }
    s.anims.timeScale = e.st === 'dash' ? 3 : 1.2;
    const m = e.spdM || 1;
    if (e.st === 'idle' || e.st === 'chase') {
      e.st = 'chase'; s.setVelocity(dx / d * D.spd * .8 * m, dy / d * D.spd * .8 * m); s.flipX = dx > 0;
      if (e.t <= 0) {
        s.setVelocity(0); e.lx = dx / d; e.ly = dy / d; const r = Math.random();
        if (d < 140 && r < .35) { e.st = 'wind'; e.t = .5; s.setTint(0xa8e0ff); }
        else if (r < .7) { e.st = 'breath'; e.t = .55; s.setTint(0xd8f4ff); sfx('ice'); }
        else if (e.summoned) { e.st = 'stomp'; e.t = .6; s.setTint(0xffe0a0); }
        else { e.st = 'ring'; e.t = .6; s.setTint(0x8ad0ff); }
      }
    } else if (e.st === 'wind') { if (e.t <= 0) { e.st = 'dash'; e.t = .55; s.clearTint(); s.setVelocity(e.lx * 280 * m, e.ly * 280 * m); sfx('swing'); } }
    else if (e.st === 'dash') { if (e.t <= 0 || s.body.blocked.left || s.body.blocked.right || s.body.blocked.up || s.body.blocked.down) { e.st = 'rec'; e.t = .6; s.setVelocity(0); } }
    else if (e.st === 'breath') { if (e.t <= 0) { s.clearTint(); this.eShoot(e, 'ice', e.summoned ? [-.5, -.3, -.1, .1, .3, .5] : [-.36, -.12, .12, .36], D.atk - 6); e.st = 'rec'; e.t = .55; } }
    else if (e.st === 'ring') { if (e.t <= 0) { s.clearTint(); this.eShoot(e, 'ice', [...Array(10).keys()].map(i => i / 10 * Math.PI * 2 + this.t), D.atk - 8, true); e.st = 'rec'; e.t = .7; } }
    else if (e.st === 'stomp') { if (e.t <= 0) { s.clearTint(); this.shockwave(s.x, s.y, 78, D.atk); e.st = 'rec'; e.t = .8; } }
    else if (e.st === 'rec') { s.setVelocity(0); if (e.t <= 0) { e.st = 'chase'; e.t = rnd(1, 1.7) / m; } }
  },
});
