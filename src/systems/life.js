'use strict';
// Interior, memancing, kebun, teka-teki batu, Mochi
Object.assign(World.prototype, {
  enterRoom(to, d) {
    if (to === 'arsip' && !S.inv.akey) { if (!G.lock && !this._lockMsg) { this._lockMsg = 1; talk(null, ['Pintu Akademi tertutup. Penjaga menggeleng: "Arsip hanya untuk guru dan yang mendapat izin."']).then(() => { this.pl.y += 14; this._lockMsg = 0; }); } return; }
    this.goto(to, 160, 226, 'up');
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
    if (hit) { const r = Math.random(), id = r < .12 ? 'gfish' : r < .24 ? 'oldboot' : 'fish'; addItem(id); if (id !== 'oldboot') S.st.fish++; sfx('chest'); updHud(); await say(id === 'gfish' ? 'WAH! Ikan Emas langka! (jual mahal di kios)' : id === 'oldboot' ? 'Yah... cuma sepatu butut.' : 'Dapat Ikan Mas!'); achCheck(this); }
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
  plotState(i) { const p = S.garden[i]; if (!p) return 'empty'; return gameHours() - p.t >= (p.fast ? 3 : 6) ? 'ripe' : 'grow'; },
  updGarden(force) { this.gT = (this.gT || 0) - this.dt; if (!force && this.gT > 0) return; this.gT = 1; this.garden.forEach((g, i) => { const st = this.plotState(i); g.spr.forEach(s => { s.setVisible(st !== 'empty'); s.setTexture(st === 'ripe' ? 'ripe' : 'sprout'); }); }); },
  async tendPlot(i) {
    const st = this.plotState(i);
    if (st === 'empty') {
      if (!has('seed')) return talk(null, ['Petak kebun ini kosong. Beli Benih Sayur di kios Bu Sari untuk menanam.']);
      addItem('seed', -1); S.garden[i] = { t: gameHours(), fast: this.weather === 'rain' }; sfx('ok'); this.updGarden(true);
      return talk(null, ['Kamu menanam benih.' + (this.weather === 'rain' ? ' Hujan membuatnya tumbuh dua kali lebih cepat!' : ' Panen sekitar 6 jam lagi (lihat jam di kanan atas).')]);
    }
    if (st === 'grow') { const left = Math.max(1, Math.ceil((S.garden[i].fast ? 3 : 6) - (gameHours() - S.garden[i].t))); return talk(null, [`Tunasnya tumbuh subur. Panen sekitar ${left} jam lagi.`]); }
    S.garden[i] = null; addItem('veg', 3); S.st.harvest++; sfx('chest'); this.updGarden(true); updHud();
    const g = this.M.gardens[i]; this.sparkle(g[0] + g[2] / 2, g[1] + g[3] / 2, 'dotg', 16);
    await talk(null, ['Panen! Dapat Sayur Segar x3.']); achCheck(this);
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
  },
  petDig() {
    const p = this.pet; popWorld(p.x, p.y - 18, 'Meong!', 'gold'); this.sparkle(p.x, p.y - 4, 'doto', 8); this.puff(p.x, p.y);
    const pool = { village: ['seed', 'potion', 'coin'], forest: ['jelly', 'pelt', 'potion', 'coin'], meadow: ['tusk', 'sting', 'seed', 'coin'], cave: ['ore', 'shard', 'coin'], swamp: ['ecto', 'hipotion', 'coin'] }[this.M.id] || ['coin'];
    const it = pick(pool); if (it === 'coin') this.drop(p.x, p.y, 'coin', ri(5, 15)); else this.drop(p.x, p.y, 'item', it);
  },
});
