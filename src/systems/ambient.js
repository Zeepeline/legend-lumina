'use strict';
// Suasana alam: hewan kecil yang bereaksi ke pemain, kunang-kunang, ikan melompat, bayangan awan, berkas cahaya, kabut, suara latar, tanaman yang bisa dipungut.
// Atur per peta di ENV. Jumlah sengaja kecil agar terasa hidup tapi tidak ramai.
const ENV = {
  village:  { bird: 4, fly: 3, firefly: 6, cloud: 1, herb: 2 },
  forest:   { bird: 5, fly: 4, crit: ['rabbit', 'squirrel', 'deer'], ncrit: 4, firefly: 14, fish: 1, cloud: 1, ray: 1, herb: 5, snd: ['bird', 'owl'] },
  deepwood: { bird: 3, fly: 2, flyTint: [0xc8a0ff, 0x8ae8ff], crit: ['squirrel', 'deer'], ncrit: 3, firefly: 24, fish: 1, ray: 1, fog: 1, herb: 7, snd: ['owl', 'creak'] },
  meadow:   { bird: 6, fly: 7, crit: ['rabbit', 'rabbit', 'deer'], ncrit: 4, firefly: 10, cloud: 1, herb: 4 },
  river:    { bird: 4, fly: 4, crit: ['rabbit'], ncrit: 2, firefly: 14, fish: 3, cloud: 1, herb: 5, snd: ['bird', 'frog'] },
  lake:     { bird: 3, fly: 3, firefly: 18, fish: 2, cloud: 1, herb: 3, snd: ['bird', 'frog'] },
  road:     { bird: 4, fly: 3, crit: ['rabbit', 'deer'], ncrit: 3, cloud: 1, herb: 4 },
  swamp:    { bird: 2, birdTint: 0x4a4a5a, firefly: 22, fireTint: 0xa0ffa0, fog: 1, herb: 3, snd: ['frog', 'creak'] },
  snow:     { cloud: 1, snd: ['wind'] },
  cave:     { snd: ['drip'] },
  kgate: { bird: 3, birdTint: 0xb8b8c8, cloud: 1 }, kpasar: { bird: 4, birdTint: 0xb8b8c8, cloud: 1 }, kakademi: { bird: 3, birdTint: 0xb8b8c8, fly: 2, cloud: 1 }, kbawah: { bird: 2, birdTint: 0xb8b8c8 },
};
// ---- tekstur kecil (piksel) ----
function artCritters(T) {
  const one = (k, rows, pal) => T.addCanvas(k, outline(renderMap(rows, pal), '#241c24'));
  const two = (k, a, b, pal) => { const c1 = outline(renderMap(a, pal), '#241c24'), c2 = outline(renderMap(b, pal), '#241c24'); const st = strip([c1, c2]); addStrip({ textures: T }, k, st); };
  two('cr_bird', ['..BB..', 'BBBBW.', '.BBB..', '..K...'], ['B....B', '.BBBB.', '..BBW.', '......'], { B: '#8a6a4a', W: '#f0c040', K: '#5a3a2a' });
  two('cr_fly', ['P.P', 'PKP', 'P.P'], ['...', 'PKP', '...'], { P: '#ffffff', K: '#3a2a3a' });
  two('cr_rabbit', ['.W.W..', '.WWW..', 'WEWWW.', '.WWWWW', '.W..W.'], ['......', '.W.W..', 'WEWWWW', '.WWWW.', 'W....W'], { W: '#e8e0d4', E: '#3a2a2a' });
  two('cr_squirrel', ['.TT...', 'T..BB.', 'T.BEB.', 'TTBBB.', '..B.B.'], ['......', 'TT.BB.', 'T.BEB.', 'TTBBB.', '.B..B.'], { T: '#c86a2a', B: '#a85a2a', E: '#2a1a1a' });
  // hewan dari aset pemilik (assets/img/ani_*.png): diperkecil rapi (kelipatan piksel), frame ke-2 melompat 1 piksel
  const fromImg = (k, img, sc) => { const w = Math.round(32 * sc), h = Math.round(32 * sc), frs = [0, 1].map(f => { const [c, x] = mk(w, h + 1); x.imageSmoothingEnabled = false; x.drawImage(img, 0, f ? 0 : 1, w, h); return c; }); addStrip({ textures: T }, k, strip(frs)); };
  for (const [k, sc] of [['rabbit', .5], ['squirrel', .5], ['deer', 1]]) { const img = IMGEL['ani_' + k]; if (img) { if (T.exists('cr_' + k)) T.remove('cr_' + k); fromImg('cr_' + k, img, sc); } else if (k === 'deer') fromImg('cr_deer', IMGEL.ani_rabbit || document.createElement('canvas'), 1); }
  one('cr_fish', ['..BB..', '.BBBBT', 'BEBBB.', '.BBBBT', '..BB..'], { B: '#8ab0d8', E: '#1a2a3a', T: '#5a80b0' });
  one('cr_herb', ['G.G.G', '.GLG.', 'G.L.G', '..L..'], { G: '#4ab83a', L: '#2a7a2a' });
  one('cr_berry', ['.GG..', 'GRGR.', '.RRG.', 'GRR..'], { G: '#3a8a3a', R: '#d83a5a' });
  one('cr_mush', ['..RR..', '.RRRR.', 'RRWWRR', '..SS..', '..SS..'], { R: '#9a6238', W: '#d8a878', S: '#f0e6d0' });
  one('cr_gmush', ['..BB..', '.BBBB.', 'BBWWBB', '..SS..', '..SS..'], { B: '#3a8ad8', W: '#a0e0ff', S: '#e0f4ff' });
  const soft = (k, w, h, col, a) => { const [c, x] = mk(w, h); const g = x.createRadialGradient(w / 2, h / 2, 1, w / 2, h / 2, w / 2); g.addColorStop(0, `rgba(${col},${a})`); g.addColorStop(1, `rgba(${col},0)`); x.fillStyle = g; x.save(); x.scale(1, h / w); x.fillRect(0, 0, w, w); x.restore(); T.addCanvas(k, c); };
  soft('cr_cloud', 220, 120, '20,24,50', .5); soft('cr_fog', 200, 120, '235,240,255', .55); soft('cr_glow', 16, 16, '255,250,170', 1); { const [c, x] = mk(16, 16); const g = x.createRadialGradient(8, 8, 0, 8, 8, 8); g.addColorStop(0, 'rgba(255,255,230,1)'); g.addColorStop(.25, 'rgba(255,250,170,.9)'); g.addColorStop(1, 'rgba(255,240,120,0)'); x.fillStyle = g; x.fillRect(0, 0, 16, 16); T.removeKey ? T.remove('cr_glow') : 0; T.addCanvas('cr_glow2', c); }
  const [c, x] = mk(60, 220); const g = x.createLinearGradient(0, 0, 0, 220); g.addColorStop(0, 'rgba(255,248,200,0)'); g.addColorStop(.35, 'rgba(255,248,200,.5)'); g.addColorStop(1, 'rgba(255,248,200,0)'); x.fillStyle = g; x.fillRect(10, 0, 40, 220); T.addCanvas('cr_ray', c);
}
Object.assign(World.prototype, {
  spawnAmbient() {
    this.amb = []; this.ambT = 0; this.sndT = rnd(3, 8); this.cloudsA = []; this.herbS = [];
    const E = this.envCfg = ENV[this.M.id]; if (!E || G.title) return;
    const A = this.anims; if (!A.exists('cr_bird_f')) { for (const k of ['cr_bird', 'cr_fly', 'cr_rabbit', 'cr_squirrel', 'cr_deer']) A.create({ key: k + '_f', frames: A.generateFrameNumbers ? [{ key: k, frame: 0 }, { key: k, frame: 1 }] : [], frameRate: k === 'cr_bird' ? 10 : k === 'cr_fly' ? 8 : 6, repeat: -1 }); }
    const M = this.M, cam = this.cameras.main;
    const near = (r = 220) => [clamp(this.pl.x + rnd(-r, r), 40, M.w - 40), clamp(this.pl.y + rnd(-r, r), 60, M.h - 40)];
    this.ambNear = near;
    for (let i = 0; i < (E.bird || 0); i++) this.addBird(...near(260));
    for (let i = 0; i < (E.fly || 0); i++) this.addFly(...near(240));
    for (let i = 0; i < (E.ncrit || 0); i++) this.addCrit(...near(260));
    for (let i = 0; i < (E.firefly || 0); i++) { const [x, y] = near(280), s = this.add.image(x, y, 'cr_glow2').setScale(rnd(.45, .75)).setTint(E.fireTint || 0xfff6a0).setBlendMode(Phaser.BlendModes.ADD).setDepth(1.5e5).setAlpha(0); this.amb.push({ k: 'fire', s, hx: x, hy: y, ph: rnd(0, 6) }); }
    if (E.cloud) for (let i = 0; i < 3; i++) { const s = this.add.image(rnd(0, M.w), rnd(0, M.h), 'cr_cloud').setScale(rnd(1.4, 2.4), rnd(1.2, 1.8)).setDepth(2).setAlpha(.0); this.cloudsA.push(s); }
    if (E.fog) for (let i = 0; i < 5; i++) { const [x, y] = near(300), s = this.add.image(x, y, 'cr_fog').setScale(rnd(1.2, 2)).setDepth(1.4e5).setAlpha(.22); this.amb.push({ k: 'fog', s, vx: rnd(4, 10) * (Math.random() < .5 ? -1 : 1) }); }
    if (E.ray) for (let i = 0; i < 3; i++) { const [x, y] = near(200), s = this.add.image(x, y - 60, 'cr_ray').setRotation(-.45).setBlendMode(Phaser.BlendModes.ADD).setDepth(1.45e5).setAlpha(0); this.amb.push({ k: 'ray', s, ph: rnd(0, 6) }); }
    // tanaman obat & beri: di tepi jalan setapak
    const segs = M.paths || []; for (let i = 0; i < (E.herb || 0) && segs.length; i++) {
      const [x1, y1, x2, y2, w] = segs[Math.floor(Math.random() * segs.length)], t = Math.random(), off = (w || 12) + rnd(10, 22), nx = -(y2 - y1), ny = x2 - x1, l = Math.hypot(nx, ny) || 1, sg = Math.random() < .5 ? 1 : -1;
      const x = clamp(x1 + (x2 - x1) * t + nx / l * off * sg, 50, M.w - 50), y = clamp(y1 + (y2 - y1) * t + ny / l * off * sg, 70, M.h - 50), berry = Math.random() < .4;
      const s = this.add.image(x, y, berry ? 'cr_berry' : 'cr_herb').setOrigin(.5, 1).setDepth(y); this.herbS.push({ s, it: berry ? 'berry' : 'herb' });
    }
    // jamur liar di area hutan, rawa, dan gua
    const isForestOrDark = ['forest', 'deepwood', 'swamp', 'cave'].includes(M.id);
    if (isForestOrDark) {
      const mushCount = M.id === 'deepwood' ? 5 : 3;
      for (let i = 0; i < mushCount; i++) {
        const [mx, my] = near(220);
        const isGlow = M.id === 'cave' || M.id === 'swamp' || (M.id === 'deepwood' && Math.random() < .4);
        const s = this.add.image(mx, my, isGlow ? 'cr_gmush' : 'cr_mush').setOrigin(.5, 1).setDepth(my);
        this.herbS.push({ s, it: isGlow ? 'gmush' : 'mush' });
      }
    }
  },
  addBird(x, y) { const E = this.envCfg, s = this.add.sprite(x, y, 'cr_bird', 0).setOrigin(.5, 1).setDepth(y); if (E.birdTint) s.setTint(E.birdTint); this.amb.push({ k: 'bird', s, st: 'peck', t: rnd(.5, 2) }); },
  addFly(x, y) { const E = this.envCfg, s = this.add.sprite(x, y, 'cr_fly').play('cr_fly_f').setTint((E.flyTint || [0xffe070, 0xff9ad8, 0x9ad8ff, 0xffffff])[Math.floor(Math.random() * (E.flyTint ? E.flyTint.length : 4))]).setDepth(1.3e5); this.amb.push({ k: 'fly', s, hx: x, hy: y, ph: rnd(0, 6) }); },
  addCrit(x, y) { const E = this.envCfg, k = E.crit[Math.floor(Math.random() * E.crit.length)], s = this.add.sprite(x, y, 'cr_' + k, 0).setOrigin(.5, 1).setDepth(y); this.amb.push({ k: 'crit', s, st: 'idle', t: rnd(.5, 3), vx: 0, vy: 0 }); },
  updAmbient(dt) {
    if (!this.amb) return; const pl = this.pl, cam = this.cameras.main, night = isNight(), E = this.envCfg; if (!E) return;
    const view = cam.worldView, off = (s, m = 120) => s.x < view.x - m || s.x > view.right + m || s.y < view.y - m || s.y > view.bottom + m;
    for (let i = this.amb.length - 1; i >= 0; i--) {
      const a = this.amb[i], s = a.s, d = Math.hypot(s.x - pl.x, s.y - pl.y);
      if (a.k === 'bird') {
        if (a.st === 'peck') { a.t -= dt; if (a.t <= 0) { a.t = rnd(.4, 1.8); s.setFrame(s.frame.name === 0 ? 1 : 0); s.flipX = Math.random() < .5; } if (d < 46 || (night && Math.random() < dt * .1)) { a.st = 'fly'; s.play('cr_bird_f'); a.vx = (s.x > pl.x ? 1 : -1) * rnd(60, 100); a.vy = -rnd(50, 80); s.setDepth(1.6e5); sfx('flap'); } }
        else { s.x += a.vx * dt; s.y += a.vy * dt; s.flipX = a.vx < 0; if (off(s, 40)) { s.destroy(); this.amb.splice(i, 1); this.time.delayedCall(rnd(4000, 9000), () => { if (this.amb && !night) this.addBird(...this.ambOff()); }); } }
      } else if (a.k === 'fly') {
        s.setVisible(!night && this.weather !== 'rain'); a.ph += dt; s.x = a.hx + Math.sin(a.ph * 1.3) * 26 + Math.sin(a.ph * 3.1) * 6; s.y = a.hy + Math.cos(a.ph * .9) * 16 - 14;
        if (d < 30) { a.hx += (s.x - pl.x) * dt * 2; a.hy += (s.y - pl.y) * dt * 2; }
        // Tangkap serangga jika pemain berada sangat dekat
        if (!G.lock && s.visible && d < 18) {
          const tint = s.tintTopLeft;
          let itemId = 'bfly_gold';
          if (tint === 0x9ad8ff || this.M.id === 'lake' || this.M.id === 'river') itemId = 'bfly_blue';
          else if (tint === 0xff9ad8 || this.M.id === 'village') itemId = 'bfly_pink';
          addItem(itemId, 1);
          sfx('chest');
          this.sparkle(s.x, s.y, 'dot', 10);
          popWorld(s.x, s.y - 12, '★ ' + ITEMS[itemId].n, 'heal');
          updHud();
          s.destroy();
          this.amb.splice(i, 1);
          this.time.delayedCall(rnd(5000, 10000), () => { if (this.amb && !isNight()) this.addFly(...this.ambOff()); });
          continue;
        }
        if (off(s, 260)) { [a.hx, a.hy] = this.ambOff(); }
      } else if (a.k === 'crit') {
        a.t -= dt;
        if (a.st === 'idle') { if (a.t <= 0) { a.t = rnd(.6, 2.5); s.setFrame(Math.random() < .5 ? 1 : 0); if (Math.random() < .4) { a.st = 'hop'; a.t = .5; a.vx = rnd(-30, 30); a.vy = rnd(-20, 20); s.play('cr_' + s.texture.key.slice(3) + '_f'); } } if (d < 56) { a.st = 'run'; a.t = 1.6; const l = d || 1; a.vx = (s.x - pl.x) / l * 120; a.vy = (s.y - pl.y) / l * 120; s.play('cr_' + s.texture.key.slice(3) + '_f'); } }
        else { s.x += a.vx * dt; s.y += a.vy * dt; s.setDepth(s.y); s.flipX = a.vx > 0; if (a.t <= 0) { a.st = 'idle'; a.t = rnd(1, 3); s.anims.stop(); } }
        if (off(s, 300)) { const [x, y] = this.ambOff(); s.setPosition(x, y); a.st = 'idle'; }
      } else if (a.k === 'fire') {
        a.ph += dt; const on = night || this.M.id === 'deepwood'; s.setAlpha(on ? (.45 + Math.sin(a.ph * 2.3) * .45) : 0);
        s.x = a.hx + Math.sin(a.ph * .7) * 20; s.y = a.hy + Math.sin(a.ph * 1.1) * 12;
        // Tangkap kunang-kunang di malam hari saat didekati
        if (!G.lock && on && s.alpha > 0.4 && d < 18) {
          addItem('firefly_item', 1);
          sfx('chest');
          this.sparkle(s.x, s.y, 'doto', 12);
          popWorld(s.x, s.y - 12, '★ Kunang Botol', 'heal');
          updHud();
          s.destroy();
          this.amb.splice(i, 1);
          continue;
        }
        if (off(s, 260)) { [a.hx, a.hy] = this.ambNear(260); }
      } else if (a.k === 'fog') { s.x += a.vx * dt; if (off(s, 260)) { const [x, y] = this.ambNear(300); s.setPosition(x, y); } }
      else if (a.k === 'ray') { a.ph += dt * .5; s.setAlpha(night || this.weather === 'rain' ? 0 : .1 + Math.sin(a.ph) * .07); if (off(s, 200)) { const [x, y] = this.ambNear(180); s.setPosition(x, y - 60); } }
    }
    for (const c of this.cloudsA) { c.x += 9 * dt; c.y += 3 * dt; c.setAlpha(night ? 0 : .35); if (c.x > this.M.w + 200) { c.x = -200; c.y = rnd(0, this.M.h); } }
    // ikan melompat
    if (E.fish && this.M.ponds && Math.random() < dt * .25 * E.fish) { const P = this.M.ponds[Math.floor(Math.random() * this.M.ponds.length)], a = rnd(0, 6.28), r = Math.sqrt(Math.random()) * .7, x = P[0] + Math.cos(a) * P[2] * r, y = P[1] + Math.sin(a) * P[3] * r;
      if (Math.abs(x - pl.x) < 220 && Math.abs(y - pl.y) < 300) { const f = this.add.image(x, y, 'cr_fish').setDepth(y + 1), dir = Math.random() < .5 ? -1 : 1; f.flipX = dir > 0; this.tweens.add({ targets: f, x: x + dir * 18, duration: 600 }); this.tweens.add({ targets: f, y: y - 16, duration: 300, yoyo: true, ease: 'Quad.easeOut', onComplete: () => { f.destroy(); this.ripple(x + dir * 18, y); } }); this.ripple(x, y); sfx('splash'); } }
    // tanaman: pungut dengan berjalan di atasnya
    for (let i = this.herbS.length - 1; i >= 0; i--) { const h = this.herbS[i]; if (Math.hypot(h.s.x - pl.x, h.s.y - pl.y) < 12) { addItem(h.it); sfx('blip'); popWorld(h.s.x, h.s.y - 16, '+' + ITEMS[h.it].n, 'xp'); this.tweens.add({ targets: h.s, y: h.s.y - 10, alpha: 0, duration: 300, onComplete: () => h.s.destroy() }); this.herbS.splice(i, 1); } }
    // suara latar
    this.sndT -= dt; if (this.sndT <= 0) { this.sndT = rnd(3, 9); const L = night ? ['cricket', ...(E.snd || []).filter(k => k !== 'bird')] : (E.snd || (E.bird ? ['bird'] : [])).filter(k => k !== 'owl'); if (L.length && this.weather !== 'rain') sfx(L[Math.floor(Math.random() * L.length)]); }
    // Dinamika cuaca alami (Peralihan cerah / hujan berkala)
    if (!this.M.indoor && !this.M.dark && this.M.id !== 'swamp' && this.M.id !== 'snow' && !G.title) {
      this._weatherT = (this._weatherT || 0) + dt;
      if (this._weatherT > 180) { // Cek tiap 3 menit
        this._weatherT = 0;
        const willRain = Math.random() < 0.25;
        if (willRain && this.weather !== 'rain') {
          this.weather = 'rain';
          banner('Hujan turun membasahi tanah...', 'CUACA', false, 2000);
          playBGM(null);
        } else if (!willRain && this.weather === 'rain') {
          this.weather = 'clear';
          banner('Hujan telah reda. Langit kembali cerah.', 'CUACA', false, 2000);
          playBGM(bgmFor(this.M));
        }
      }
    }
    // Cuaca Ekstrem: Sambaran Petir di Padang Angin & Rawa Senja (#68)
    if (!this.M.indoor && !G.lock && !G.title && (this.M.id === 'meadow' || this.M.id === 'swamp')) {
      this._stormT = (this._stormT || 0) + dt;
      if (this._stormT > 8) { // Tiap 8 detik ada peluang sambaran badai
        this._stormT = 0;
        if (Math.random() < 0.35) {
          const lx = clamp(pl.x + rnd(-110, 110), 50, this.M.w - 50);
          const ly = clamp(pl.y + rnd(-90, 90), 50, this.M.h - 50);
          // Tanda bahaya sambaran petir di tanah selama 1 detik
          const mark = this.add.circle(lx, ly, 22, 0xffeb3b, 0.45).setDepth(ly - 1);
          this.tweens.add({ targets: mark, scaleX: 1.3, scaleY: 1.3, alpha: 0.8, yoyo: true, repeat: 2, duration: 250 });
          this.time.delayedCall(1000, () => {
            mark.destroy();
            // Sambaran petir!
            this.cameras.main.flash(80, 255, 255, 255);
            sfx('boom');
            this.camShake(180, 0.008);
            this.sparkle(lx, ly - 10, 'spark', 24);
            popWorld(lx, ly - 22, '⚡ SAMBARAN PETIR!', 'crit');
            // Efek sambaran mengenai sekitar radius 34 px
            if (Math.hypot(pl.x - lx, pl.y - ly) < 34) {
              this.hurtPlayer(18, lx, ly);
            }
            for (const e of this.enemies) {
              if (e.hp > 0 && Math.hypot(e.spr.x - lx, e.spr.y - ly) < 40) {
                this.hitEnemy(e, 45, false, 0, 0);
                this.burnEnemy(e, 5, 2);
              }
            }
          });
        }
      }
    }
    // Badai Salju Tebal di Puncak Beku (#68): memperlambat langkah Arka bila tidak berstatus hangat
    if (this.M.id === 'snow' && !G.lock) {
      if (typeof buffOn === 'function' && !buffOn('warm')) {
        pl.snowSlow = true;
      } else {
        pl.snowSlow = false;
      }
    } else if (pl.snowSlow) {
      pl.snowSlow = false;
    }
  },
  ambOff() { const v = this.cameras.main.worldView, M = this.M, side = Math.floor(Math.random() * 4); return [clamp(side === 0 ? v.x - 60 : side === 1 ? v.right + 60 : rnd(v.x, v.right), 40, M.w - 40), clamp(side === 2 ? v.y - 60 : side === 3 ? v.bottom + 60 : rnd(v.y, v.bottom), 60, M.h - 40)]; },
  ripple(x, y) { const g = this.add.graphics().setDepth(y), o = { r: 2 }; this.tweens.add({ targets: o, r: 12, duration: 600, onUpdate: () => { g.clear(); g.lineStyle(1, 0xffffff, .8 - o.r / 15).strokeEllipse(x, y, o.r * 2, o.r); }, onComplete: () => g.destroy() }); },
});
// ---- penunjuk arah misi: panah di tepi layar bila tujuan di luar layar, bintang memantul bila terlihat ----
function artQuestArrow(T) {
  const [c, x] = mk(18, 18); x.fillStyle = '#ffd84a'; x.beginPath(); x.moveTo(17, 9); x.lineTo(3, 2); x.lineTo(7, 9); x.lineTo(3, 16); x.closePath(); x.fill();
  x.strokeStyle = '#3a2410'; x.lineWidth = 1.5; x.stroke(); T.addCanvas('qarrow', c);
  const [c2, y] = mk(14, 14); y.fillStyle = '#ffd84a'; y.strokeStyle = '#3a2410'; y.lineWidth = 1.2; y.beginPath();
  for (let i = 0; i < 10; i++) { const r = i % 2 ? 2.8 : 6.4, a = -Math.PI / 2 + i * Math.PI / 5; y.lineTo(7 + Math.cos(a) * r, 7 + Math.sin(a) * r); } y.closePath(); y.fill(); y.stroke(); T.addCanvas('qstar', c2);
}
Object.assign(World.prototype, {
  updQuestGuide(dt) {
    if (!this.qArrow) { this.qArrow = this.add.image(0, 0, 'qarrow').setScale(1.5).setScrollFactor(0).setDepth(2.1e5).setVisible(false); this.qStar = this.add.image(0, 0, 'qstar').setScale(1.3).setDepth(2.05e5).setVisible(false); this.qT = 0; }
    this.qT -= dt; if (this.qT <= 0) { this.qT = .4; this.qGoal = G.title ? null : questTarget(this.M); const qd = document.querySelector('#quest .qd'); if (qd) qd.textContent = this.qGoal ? ' · ' + Math.round(Math.hypot(this.qGoal.x - this.pl.x, this.qGoal.y - this.pl.y) / 8) + ' m' : ''; }
    const q = this.qGoal, A = this.qArrow, St = this.qStar; if (!q || G.lock) { A.setVisible(false); St.setVisible(false); return; }
    const v = this.cameras.main.worldView, m = 26, inView = q.x > v.x + m && q.x < v.right - m && q.y > v.y + m && q.y < v.bottom - m;
    if (inView) { A.setVisible(false); St.setVisible(true).setPosition(q.x, q.y - 26 + Math.sin(this.t * 4) * 3); return; }
    St.setVisible(false);
    const cx = v.width / 2, cy = v.height / 2, dx = q.x - (v.x + cx), dy = q.y - (v.y + cy), a = Math.atan2(dy, dx);
    const k = Math.min((cx - 18) / Math.abs(dx || 1e-6), (cy - 18) / Math.abs(dy || 1e-6));
    A.setVisible(true).setRotation(a).setPosition(cx + dx * k, cy + dy * k).setAlpha(.75 + Math.sin(this.t * 5) * .25);
  },
});
