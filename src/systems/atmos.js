'use strict';
// Suasana cahaya & kabut (wilayah aktif saja):
// - lapisan kabut berlapis (2 lembar noise lembut, parallax & bergeser) untuk cuaca 'fog'; lebih tebal pagi hari
// - cahaya hangat berkedip untuk SEMUA lampu di layar saat malam (lampu besar sudah punya `this.glows`) + lentera kecil di sekitar Arka
// - pendar jendela rumah hangat (Cozy Window Bloom - Cobo #4) menyala keemasan saat senja hingga malam
// - butiran debu emas melayang (siang/sore) & bara api lembut (malam) ala suasana Dimraeth
const ATMOS_POOL = 36, MOTE_POOL = 18;
function fogSheetTex(sc) {
  if (sc.textures.exists('fogsheet')) return;
  const N = 256, [c, x] = mk(N, N), D = x.createImageData(N, N), d = D.data;
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {      // noise berulang mulus (tiled) 2 oktaf
    const v = vnoise(i, j, 64, 301) * .65 + vnoise(i, j, 24, 302) * .35, w = (a, b) => vnoise(a, b, 64, 301) * .65 + vnoise(a, b, 24, 302) * .35;
    const fx = i / N, fy = j / N, t = v * (1 - fx) * (1 - fy) + w(i - N, j) * fx * (1 - fy) + w(i, j - N) * (1 - fx) * fy + w(i - N, j - N) * fx * fy;
    const a = Math.max(0, Math.min(1, (t - .32) * 2.2)), o = (j * N + i) * 4;
    d[o] = 232; d[o + 1] = 238; d[o + 2] = 240; d[o + 3] = Math.round(a * 200);
  }
  x.putImageData(D, 0, 0); sc.textures.addCanvas('fogsheet', c);
}
function moteTex(sc) {
  if (sc.textures.exists('mote_dot')) return;
  const [c, x] = mk(4, 4); x.fillStyle = '#ffffff';
  x.fillRect(1, 0, 2, 4); x.fillRect(0, 1, 4, 2);
  sc.textures.addCanvas('mote_dot', c);
}
function godrayTex(sc) {
  if (sc.textures.exists('godray_beam')) return;
  const [c, x] = mk(64, 180);
  const grad = x.createLinearGradient(0, 0, 32, 180);
  grad.addColorStop(0, 'rgba(255, 255, 220, 0.45)');
  grad.addColorStop(0.5, 'rgba(255, 250, 190, 0.22)');
  grad.addColorStop(1, 'rgba(255, 250, 190, 0)');
  x.fillStyle = grad;
  x.beginPath();
  x.moveTo(12, 0); x.lineTo(36, 0); x.lineTo(54, 180); x.lineTo(0, 180);
  x.closePath();
  x.fill();
  sc.textures.addCanvas('godray_beam', c);
}
function cloudShadowTex(sc) {
  if (sc.textures.exists('cloud_shadow')) return;
  const N = 256, [c, x] = mk(N, N);
  x.fillStyle = 'rgba(10, 20, 35, 0.45)';
  x.beginPath();
  x.ellipse(70, 70, 60, 38, 0.2, 0, Math.PI * 2);
  x.ellipse(180, 160, 75, 48, -0.15, 0, Math.PI * 2);
  x.ellipse(140, 95, 50, 32, 0.1, 0, Math.PI * 2);
  x.fill();
  sc.textures.addCanvas('cloud_shadow', c);
}
Object.assign(World.prototype, {
  updAmbientMotes(dt, outdoor, cave, n) {
    if (OPT.lite || (!outdoor && !cave)) {
      if (this._moteP) for (const m of this._moteP) m.img.setVisible(false);
      return;
    }
    moteTex(this);
    if (!this._moteP) {
      this._moteP = [];
      const vw = typeof VW !== 'undefined' ? VW : 480, vh = typeof VH !== 'undefined' ? VH : 270;
      for (let i = 0; i < MOTE_POOL; i++) {
        const img = this.add.image(rnd(0, vw), rnd(0, vh), 'mote_dot')
          .setScrollFactor(0).setDepth(1.92e5).setBlendMode(Phaser.BlendModes.ADD);
        this._moteP.push({
          img, x: rnd(0, vw), y: rnd(0, vh),
          speed: rnd(12, 28), ph: rnd(0, 6.28), bA: rnd(0.25, 0.6)
        });
      }
    }
    const vw = typeof VW !== 'undefined' ? VW : 480, vh = typeof VH !== 'undefined' ? VH : 270;
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    const isEmber = outdoor && (n > 0.45 || h >= 19.5 || h < 4.5);
    const isDusk = outdoor && h >= 15.5 && h < 19.5;
    const isMorning = outdoor && h >= 5.0 && h < 11.5;
    const isDeepwood = this.M && this.M.id === 'deepwood';
    let tint = 0xfffae8; // siang: sinar matahari netral lembut
    if (isDeepwood) tint = 0x8aff9a; // Hutan Dalam: spora fosfor lumut hijau mistis
    else if (cave) tint = 0x88c8ff; // gua: kristal pendar biru
    else if (isEmber) tint = 0xff7028; // malam: bara api hangat
    else if (isDusk) tint = 0xffcb50; // sore: debu senja keemasan
    else if (isMorning) tint = 0xf0f8ff; // pagi: embun putih segar
    for (const m of this._moteP) {
      m.img.setVisible(true);
      m.img.setTint(tint);
      if (isEmber) { // bara api melayang ke atas
        m.y -= (m.speed * 0.9 + 8) * dt;
        m.x += (Math.sin(this.t * 2 + m.ph) * 14 + 6) * dt;
        if (m.y < -8) { m.y = vh + 8; m.x = rnd(0, vw); }
      } else { // debu emas melayang santai ke kanan-bawah
        m.x += (m.speed + Math.cos(this.t * 1.2 + m.ph) * 8) * dt;
        m.y += (m.speed * 0.35 + Math.sin(this.t * 1.5 + m.ph) * 10) * dt;
        if (m.x > vw + 8) { m.x = -8; m.y = rnd(0, vh); }
        if (m.y > vh + 8) { m.y = -8; m.x = rnd(0, vw); }
      }
      const alphaPulse = m.bA * (0.7 + Math.sin(this.t * 2.5 + m.ph) * 0.3);
      m.img.setPosition(m.x, m.y).setAlpha(alphaPulse);
    }
  },

  // T564: Kupu-Kupu Siang & Kunang-Kunang Malam Reaktif (Stardew Valley, Sea of Stars)
  updCritters(dt, outdoor) {
    if (OPT.lite || !outdoor) {
      if (this._critters) for (const c of this._critters) c.img.setVisible(false);
      return;
    }
    moteTex(this);
    if (!this._critters) {
      this._critters = [];
      for (let i = 0; i < 6; i++) {
        const img = this.add.image(0, 0, 'mote_dot').setDepth(1.9e5).setBlendMode(Phaser.BlendModes.ADD);
        this._critters.push({ img, x: 0, y: 0, vx: 0, vy: 0, t: Math.random() * 10, active: false });
      }
    }
    const pl = this.pl; if (!pl) return;
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    const isNight = h >= 19 || h < 5;
    const tint = isNight ? 0xb8ff60 : (this.M && this.M.id === 'meadow' ? 0xffec78 : 0x7be4ff);
    for (const c of this._critters) {
      if (!c.active) {
        c.x = pl.x + (Math.random() * 2 - 1) * 160;
        c.y = pl.y + (Math.random() * 2 - 1) * 120;
        c.active = true;
      }
      c.t += dt;
      const dx = c.x - pl.x, dy = c.y - pl.y, distSq = dx * dx + dy * dy;
      if (distSq < 784) {
        const invD = 90 / (Math.sqrt(distSq) || 1);
        c.vx += dx * invD; c.vy += dy * invD;
      }
      c.vx *= 0.92; c.vy *= 0.92;
      const wanderX = Math.sin(c.t * 2.2) * 18, wanderY = Math.cos(c.t * 1.8) * 14;
      c.x += (c.vx + wanderX) * dt; c.y += (c.vy + wanderY) * dt;
      if (distSq > 57600) c.active = false;
      const flap = isNight ? 1 : Math.abs(Math.sin(c.t * 16));
      const pulseA = isNight ? (0.4 + 0.5 * Math.sin(c.t * 3.5)) : 0.85;
      c.img.setVisible(true).setPosition(c.x, c.y).setTint(tint)
        .setScale(flap * 0.8 + 0.3, 0.9).setAlpha(pulseA);
    }
  },

  // T566: Hembusan Angin & Guguran Daun Melayang (Octopath Traveler, Ghost of Tsushima)
  updWindGust(dt, outdoor) {
    if (OPT.lite || !outdoor) return;
    this._gustT = (this._gustT || 0) + dt;
    if (this._gustT > 14) {
      this._gustT = 0;
      moteTex(this);
      const cam = this.cameras.main;
      const isSnow = this.M && this.M.ground === 'snow';
      const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
      const isDusk = h >= 16 && h < 19.5;
      const tint = isSnow ? 0xe2f4f8 : (isDusk ? 0xf0932b : 0x6ab04c);
      const n = rnd(4, 7);
      for (let i = 0; i < n; i++) {
        const startX = cam.scrollX + rnd(-20, cam.width * 0.7);
        const startY = cam.scrollY + rnd(-30, 40);
        const leaf = this.add.image(startX, startY, 'mote_dot')
          .setDepth(1.95e5).setTint(tint).setScale(rnd(0.8, 1.4), rnd(0.5, 0.9)).setAlpha(0.9);
        this.tweens.add({
          targets: leaf,
          x: startX + rnd(180, 260), y: startY + rnd(120, 180),
          rotation: rnd(3, 8), alpha: 0, duration: rnd(1800, 2600), ease: 'Sine.easeOut',
          onComplete: () => { leaf.destroy(); }
        });
      }
    }
  },

  // T567: Berkas Sinar Matahari Menembus Kanopi Hutan (Sea of Stars, Secret of Mana)
  updGodRays(dt, outdoor) {
    const isForest = this.M && (this.M.id === 'forest' || this.M.id === 'deepwood' || this.M.id === 'ruins');
    const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
    const isDay = outdoor && isForest && h >= 6.5 && h <= 15.5 && !OPT.lite;
    if (!isDay) {
      if (this._godRays) for (const r of this._godRays) r.setVisible(false);
      return;
    }
    godrayTex(this);
    const vw = typeof VW !== 'undefined' ? VW : 480;
    if (!this._godRays) {
      this._godRays = [];
      const offsets = [0.15, 0.42, 0.68, 0.88];
      for (let i = 0; i < 4; i++) {
        const ray = this.add.image(vw * offsets[i], 12, 'godray_beam')
          .setScrollFactor(0).setDepth(1.94e5).setOrigin(0.5, 0).setRotation(-0.24);
        this._godRays.push(ray);
      }
    }
    for (let i = 0; i < this._godRays.length; i++) {
      const r = this._godRays[i];
      const pulseA = 0.12 + Math.sin(this.t * 1.4 + i * 1.5) * 0.04;
      r.setVisible(true).setAlpha(pulseA).setScale(1.2 + Math.sin(this.t * 0.8 + i) * 0.1, 1.4);
    }
  },

  // T584: Panji Berombak Tertiup Angin & Efek Suasana Kota Megah (Ghost of Tsushima, Sea of Stars)
  updBanners(dt) {
    if (!this.banners || !this.banners.length) return;
    const isStormy = this.weather === 'rain' || this.weather === 'storm';
    const waveSp = isStormy ? 5.2 : 3.2;
    const waveAmp = isStormy ? 0.12 : 0.07;
    for (let i = 0; i < this.banners.length; i++) {
      const b = this.banners[i];
      if (!b || !b.active || !b.visible) continue;
      b.rotation = Math.sin(this.t * waveSp + b.x * 0.04) * waveAmp;
      b.scaleX = 1 + Math.sin(this.t * (waveSp * 1.5) + b.y * 0.05) * 0.04;
    }
  },

  updAtmos(dt) {
    if (G.title || !this.M) return;
    if (this.M.indoor && this._bgM !== this.M) { this._bgM = this.M; this.cameras.main.setBackgroundColor('#0e0907'); } /* luar ruangan sempit: gelap, bukan hijau */
    const outdoor = !this.M.indoor && !this.M.dark, cave = this.M && this.M.ground === 'cave';
    const n = typeof nightAmt === 'function' ? nightAmt() : 0;
    this.updAmbientMotes(dt, outdoor, cave, n);
    this.updCritters(dt, outdoor);
    this.updWindGust(dt, outdoor);
    this.updGodRays(dt, outdoor);
    this.updBanners(dt);
    if (this._atmosM !== this.M || !this._fogL || !this._fogL[0].active) {
      (this._fogL || []).forEach(o => o.destroy()); (this._glP || []).forEach(o => o.destroy()); fogSheetTex(this);
      if (this._canopyL && this._canopyL.active) this._canopyL.destroy();
      if (this._cloudL && this._cloudL.active) this._cloudL.destroy();
      cloudShadowTex(this);
      this._cloudL = outdoor && !cave && !OPT.lite ? this.add.tileSprite(0, 0, VW, VH, 'cloud_shadow')
        .setOrigin(0).setScrollFactor(0).setDepth(-9.2e5).setAlpha(0.08) : null;
      this._canopyL = (this.M && this.M.id === 'deepwood' && this.textures.exists('canopy_overhang'))
        ? this.add.tileSprite(0, 0, VW, 52, 'canopy_overhang').setOrigin(0).setScrollFactor(0).setDepth(1.98e5).setAlpha(0.92) : null;
      this._fogL = [0, 1].map(k => this.add.tileSprite(0, 0, VW, VH, 'fogsheet').setOrigin(0).setScrollFactor(0).setDepth(1.9e5 + k).setAlpha(0)
        .setTileScale(k ? 1.6 : 1.1));
      this._glP = []; this._lant = null; this._atmosM = this.M; this._fogA = 0;
    }
    // kabut: target alpha menurut cuaca & jam (pagi lebih tebal), berubah halus
    const h = S.time || 12, morning = h >= 4 && h < 9 ? 1 : h >= 17 && h < 20 ? .6 : .35;
    const isDw = this.M && this.M.id === 'deepwood';
    const want = outdoor && (this.weather === 'fog' ? .3 + .35 * morning : (isDw ? .22 : 0));
    this._fogA += (want - this._fogA) * Math.min(1, dt * .8);
    const cam = this.cameras.main;
    if (this._canopyL && this._canopyL.active) {
      this._canopyL.tilePositionX = cam.scrollX * .18 + Math.sin(this.t * .8) * 3;
      this._canopyL.setVisible(isDw);
    }
    this._fogL.forEach((f, k) => {
      f.setAlpha(this._fogA * (k ? .7 : 1)).setVisible(this._fogA > .01);
      f.tilePositionX = cam.scrollX * (k ? .55 : .3) + this.t * (k ? 7 : 4);
      f.tilePositionY = cam.scrollY * (k ? .55 : .3) + this.t * (k ? 1.5 : .8);
      f.setTint(n > .3 ? 0x8090b8 : (isDw ? 0x88b090 : 0xffffff));
    });
    // T571: Bayangan Awan Melintas di Tanah (Chrono Trigger, Dragon Quest XI)
    if (this._cloudL && this._cloudL.active) {
      this._cloudL.setVisible(outdoor && !cave && n < 0.65);
      this._cloudL.tilePositionX = cam.scrollX * 0.25 + this.t * 8;
      this._cloudL.tilePositionY = cam.scrollY * 0.25 - this.t * 4;
    }
    // cahaya hangat lampu kecil + lentera Arka saat malam
    const ga = outdoor ? Math.max(0, Math.min(.6, (n - .12) * 1.4)) : 0, fogBoost = 1 + this._fogA * .8;
    if (!this._lant) this._lant = this.add.image(0, 0, 'nlL').setTint(0xffd890).setBlendMode(Phaser.BlendModes.ADD).setDepth(2e5 + 2);
    const pl = this.pl;
    this._lant.setVisible(ga > 0 && !!pl).setAlpha(ga * .45);
    if (pl) this._lant.setPosition(pl.x, pl.y - 12).setScale((.55 + Math.sin(this.t * 4) * .02) * fogBoost);
    let used = 0;
    const isNightDusk = outdoor && (h >= 16.2 || h < 6.2 || n > 0.08);
    if (ga > 0 || isNightDusk) {
      const v = cam.worldView, duskA = Math.max(ga, Math.min(.55, h >= 16.2 && h <= 19 ? (h - 16.2) * .2 : 0));
      for (const L of this.lights) {
        if ((!L.small && !L.window) || used >= ATMOS_POOL || L.x < v.x - 40 || L.x > v.right + 40 || L.y < v.y - 40 || L.y > v.bottom + 40) continue;
        const isWin = !!L.window, curA = isWin ? duskA : ga;
        if (curA <= 0) continue;
        const g = this._glP[used] || (this._glP[used] = this.add.image(0, 0, 'nlW').setBlendMode(Phaser.BlendModes.ADD).setDepth(2e5 + 1));
        const flicker = .82 + Math.sin(this.t * 4.2 + L.x * .1) * .12 + Math.cos(this.t * 6.5 + L.y * .1) * .06;
        g.setVisible(true).setPosition(L.x, L.y).setScale((isWin ? .65 : .9) * fogBoost).setTint(isWin ? 0xffbe4e : 0xffb050).setAlpha(curA * flicker);
        used++;
      }
    }
    for (let i = used; i < this._glP.length; i++) this._glP[i].setVisible(false);
    if (this.glows && fogBoost > 1) for (const g of this.glows) g.setScale(fogBoost);
  }
});
