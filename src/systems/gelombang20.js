'use strict';
// Gelombang 20 (T553–T562): 10 Trik Lanjutan Suasana & Mekanik ala Cobo / Mytheria
// T553: Monster Malam Bermata Menyala & Tepian Bara Prosedural
// T554: Boneka Latih Roh Muncul Saat Upgrade Senjata di Pandai Besi
// T555: Jejak Cakar & Tanda Wilayah Bos di Area Perbatasan
// T556: Animasi Serangan 3-Frame Tajam (Windup, Snap Strike, Recovery)
// T557: Dinding Duri Berlubang Satu (Escape Gap)
// T558: Garis Agresivitas Musuh (Aggro Tether Line)
// T559: Hamburan Serpihan Pecahan Benda Fisik (Debris Physics)
// T560: Langkah Kaki Bersuara Adaptif Sesuai Kontur Tanah
// T561: Denyut Jantung & Vinyet Merah Saat Sekarat (< 25% HP)
// T562: Api Unggun Berdenyut Pemulihan (Campfire Warm Pulse)

(() => {
  const W = World.prototype;

  // --- T559: Hamburan Serpihan Fisik Benda Hancur ---

  // --- T554: Boneka Latih Roh Muncul Saat Tempa Senjata ---
  W.spawnForgeDummy = function(x = 610, y = 330) {
    if (this._forgeDummy && this._forgeDummy.active) {
      this._forgeDummyTime = 25;
      return;
    }
    const d = OBJ.dummy || { key: 'dummy', col: [14, 8, 0], sh: [10, 3] };
    const s = this.add.sprite(x, y, d.key, 0).setOrigin(0.5, 1).setDepth(y);
    s.setTint(0x90e0ef).setAlpha(0.9);
    this.tweens.add({ targets: s, alpha: 0.55, duration: 800, yoyo: true, repeat: -1 });
    this.wall(x - 7, y - 8, 14, 8);
    this.shadow(x, y, 9, 3);
    this._forgeDummy = s;
    this._forgeDummyTime = 25;
    this.jxLevelUp(x, y);
    banner('BONEKA LATIH ROH MUNCUL!', 'Uji kekuatan senjata barumu di samping tungku (25 dtk)', true, 2600);
  };

  // --- T557: Dinding Duri Berlubang Satu (Escape Gap) ---

  // --- T562: Api Unggun Berdenyut Pemulihan ---
  W.updCampfirePulses = function(dt) {
    this._campPulseT = (this._campPulseT || 0) + dt;
    if (this._campPulseT < 1.4) return;
    this._campPulseT = 0;
    const pl = this.pl;
    if (!pl || pl.dead || G.lock) return;
    const fires = (this.M?.objs || []).filter(o => o[0] === 'campfire');
    for (const [_, fx, fy] of fires) {
      const d = Math.hypot(pl.x - fx, pl.y - fy);
      if (d < 46) {
        const st = stat();
        if (S.hp < st.maxhp || S.sta < st.maxsta) {
          S.hp = Math.min(st.maxhp, S.hp + Math.max(1, Math.round(st.maxhp * 0.04)));
          if (S.sta != null) S.sta = Math.min(st.maxsta, S.sta + 8);
          updHud();
          this.jx('star', fx, fy - 8, 4, { tint: 0xffd700 });
          popWorld(pl.x, pl.y - 18, '+PULIH', 'heal');
        }
        const pulse = this.add.circle(fx, fy - 6, 8, 0xffaa33, 0.45).setDepth(-8.5e5);
        this.tweens.add({
          targets: pulse, radius: 36, alpha: 0, duration: 750,
          onComplete: () => pulse.destroy()
        });
      }
    }
  };

  // T555: Jejak cakar & tanda wilayah buas di sekitar sarang bos
  const _initGround0 = W.initGround;
  W.initGround = function(data) {
    if (_initGround0) _initGround0.call(this, data);
    const M = this.M;
    if (!M || M.indoor || !this.groundLayer) return;
    const isBossGate = (M.id === 'forest' || M.id === 'deepwood' || M.id === 'swamp' || M.id === 'snow');
    if (isBossGate && !this._clawDecorated) {
      this._clawDecorated = true;
      const g = this.add.graphics().setDepth(-8.9e5);
      g.lineStyle(1.5, 0x3d271d, 0.45);
      const cx = M.w * 0.5, cy = M.h * 0.45;
      for (let i = -1; i <= 1; i++) {
        g.lineBetween(cx - 30 + i * 8, cy - 20, cx - 18 + i * 8, cy + 12);
        g.lineBetween(cx + 40 + i * 8, cy + 30, cx + 54 + i * 8, cy + 62);
      }
    }
  };

  // T556: 3-Frame Snappy Attack Helper

  // --- UPDATE GELOMBANG 20 TIAP FRAME ---
  const _updWorld0 = W.update;
  W.update = function(time, delta) {
    _updWorld0.call(this, time, delta);
    const dt = delta / 1000;
    if (G.title || !this.M) return;
    const pl = this.pl;

    // T553 & T558: Mata monster menyala saat malam & Garis ancaman (Aggro Tether)
    const nightTime = typeof isNight === 'function' && isNight() && !this.M.indoor;
    if (this._tetherG && this._tetherG.active) this._tetherG.clear();
    else this._tetherG = this.add.graphics().setDepth(pl ? pl.y + 10 : 1000);

    for (const e of this.enemies || []) {
      if (!e.spr || !e.spr.active || e.hp <= 0) continue;
      // T553: Mata malam menyala
      if (nightTime && !e.boss) {
        if (!e._eyeG || !e._eyeG.active) e._eyeG = this.add.graphics().setDepth(e.spr.y + 20);
        e._eyeG.clear();
        const headY = e.spr.y - (e.spr.displayHeight || 20) * 0.72;
        const headX = e.spr.x + (e.spr.flipX ? -2 : 2);
        e._eyeG.fillStyle(0xff2222, 0.95);
        e._eyeG.fillRect(headX - 2.5, headY, 1.5, 1.5);
        e._eyeG.fillRect(headX + 1.5, headY, 1.5, 1.5);
      } else if (e._eyeG && e._eyeG.active) {
        e._eyeG.clear();
      }

      // T558: Aggro Tether saat musuh elit / menerjang
      if (pl && !pl.dead && e.alert === 2 && (e.charging || e.elite || (e.tWind && e.tWind > 0))) {
        this._tetherG.lineStyle(1, 0xff2a2a, 0.45 + Math.sin(this.t * 12) * 0.25);
        this._tetherG.lineBetween(e.spr.x, e.spr.y - 12, pl.x, pl.y - 10);
      }
    }

    // T554: Timer Boneka Latih
    if (this._forgeDummy && this._forgeDummy.active) {
      this._forgeDummyTime -= dt;
      if (this._forgeDummyTime <= 0) {
        this.puff(this._forgeDummy.x, this._forgeDummy.y - 12);
        this._forgeDummy.destroy();
        this._forgeDummy = null;
      }
    }

    // T559: Simulasi Fisika Debris
    if (this._debris && this._debris.length) {
      for (let i = this._debris.length - 1; i >= 0; i--) {
        const deb = this._debris[i];
        deb.life -= dt;
        deb.vy += 320 * dt; // gravitasi
        deb.g.x += deb.vx * dt;
        deb.g.y += deb.vy * dt;
        deb.g.rotation += deb.rotSpd * dt;
        if (deb.g.y >= deb.floorY) {
          deb.g.y = deb.floorY;
          deb.vy = -deb.vy * 0.38; // pantulan
          deb.vx *= 0.65;
          deb.rotSpd *= 0.5;
        }
        if (deb.life <= 0.4) deb.g.setAlpha(deb.life / 0.4);
        if (deb.life <= 0) {
          deb.g.destroy();
          this._debris.splice(i, 1);
        }
      }
    }

    // T561: Denyut Jantung & Vinyet Merah Saat HP < 25%
    if (pl && !pl.dead) {
      const st = stat();
      const lowHp = S.hp > 0 && S.hp <= st.maxhp * 0.25;
      if (lowHp) {
        const beat = (Math.sin(this.t * 5.7) + 1) * 0.5;
        if (!this._lowHpVignette) {
          this._lowHpVignette = this.add.graphics().setScrollFactor(0).setDepth(2.5e5);
        }
        this._lowHpVignette.clear();
        this._lowHpVignette.fillStyle(0x880000, 0.14 + beat * 0.18);
        this._lowHpVignette.fillRect(0, 0, typeof VW !== 'undefined' ? VW : 480, 8);
        this._lowHpVignette.fillRect(0, (typeof VH !== 'undefined' ? VH : 270) - 8, typeof VW !== 'undefined' ? VW : 480, 8);
        this._lowHpVignette.fillRect(0, 0, 8, typeof VH !== 'undefined' ? VH : 270);
        this._lowHpVignette.fillRect((typeof VW !== 'undefined' ? VW : 480) - 8, 0, 8, typeof VH !== 'undefined' ? VH : 270);
        if (Math.sin(this.t * 5.7) > 0.96 && (!this._lastThump || this.t - this._lastThump > 0.6)) {
          this._lastThump = this.t;
          if (AU.ctx && OPT.steps) tone(70, AU.ctx.currentTime, 0.08, 'sine', 0.22, AU.sfx);
        }
      } else if (this._lowHpVignette) {
        this._lowHpVignette.clear();
      }
    }

    // T562: Api Unggun Pulih
    this.updCampfirePulses(dt);
  };
})();
