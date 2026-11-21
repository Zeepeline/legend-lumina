'use strict';
// AI Ronin Siber (Pendekar Pedang Pengembara): mobilitas lincah, tebasan sabit, shadow blink & multi-dash
Object.assign(World.prototype, {
  updSamurai(e, dt, dx, dy, d, aggro) {
    const s = e.spr, D = e.D, pl = this.pl;
    if (!pl || pl.dead || e.hp <= 0) { s.setVelocity(0); return; }
    e.skillCd = (e.skillCd || 2.0) - dt;
    e.blinkCd = (e.blinkCd || 4.2) - dt;
    e.dashCd = (e.dashCd || 6.5) - dt;
    e.t = (e.t || 0) - dt;

    const p2 = e.hp < (e.max || 540) * 0.55;

    // 1. Eksekusi Tebasan Kilat Beruntun (Ultimate Multi-Dash)
    if (e.st === 'ult_dash') {
      s.setVelocity(e.cvx, e.cvy);
      if (Math.random() < 0.4 && this.jx) this.jx('spark', s.x, s.y - 12, 2, { tint: 0x00f5ff });
      if (d < 36 && !e._hitPl) {
        e._hitPl = true;
        this.hurtPlayer(D.atk * 1.4, s.x, s.y);
        this.camShake(180, .007);
        sfxAt('swing', s.x, s.y, this);
      }
      if (e.t <= 0) {
        e._dashStep = (e._dashStep || 1) + 1;
        if (e._dashStep <= 3) {
          const ang = Math.atan2(pl.y - s.y, pl.x - s.x) + (e._dashStep % 2 === 0 ? 0.8 : -0.8);
          e.cvx = Math.cos(ang) * D.spd * 3.4;
          e.cvy = Math.sin(ang) * D.spd * 3.4;
          e.t = 0.18; e._hitPl = false;
          sfxAt('jump', s.x, s.y, this);
        } else {
          e.st = 'alert'; e.t = 0.65; s.setVelocity(0);
          this.time.delayedCall(320, () => {
            if (e.hp <= 0) return;
            sfxAt('crit', s.x, s.y, this);
            this.camShake(220, .01);
            if (this.jx) this.jx('spark', pl.x, pl.y - 8, 8, { tint: 0x00f5ff });
            popWorld(s.x, s.y - 28, 'KLIK!', 'crit');
            if (Math.hypot(pl.x - s.x, pl.y - s.y) < 72) {
              this.hurtPlayer(D.atk * 1.6, s.x, s.y);
            }
          });
        }
      }
      return;
    }

    // 2. Sedang dalam ancang-ancang atau serang
    if (e.st === 'wind' || e.st === 'alert' || e.st === 'atk') {
      if (e.t <= 0) {
        if (e.st === 'wind') {
          e.st = 'atk'; e.t = 0.22;
          const ang = Math.atan2(dy, dx);
          s.setVelocity(Math.cos(ang) * D.spd * 2.6, Math.sin(ang) * D.spd * 2.6);
          sfxAt('swing', s.x, s.y, this);
          this.time.delayedCall(90, () => {
            if (e.hp <= 0 || !pl || pl.dead) return;
            if (Math.hypot(pl.x - s.x, pl.y - s.y) < 46) {
              this.hurtPlayer(D.atk * 1.25, s.x, s.y);
              this.camShake(120, .005);
            }
          });
        } else {
          e.st = 'idle'; s.setVelocity(0);
        }
      }
      return;
    }

    // 3. Logika Tempur Aktif (Aggro)
    if (aggro) {
      s.flipX = dx < 0;

      // P2 Ultimate: Multi-Dash Zig-Zag
      if (p2 && e.dashCd <= 0 && d < 180) {
        e.dashCd = rnd(6.0, 9.0);
        e.st = 'alert'; e.t = 0.4; s.setVelocity(0);
        markOver(this, e, '!', '#00f5ff');
        popWorld(s.x, s.y - 28, 'KILAT SIBER!', 'purp');
        sfxAt('cur', s.x, s.y, this);
        this.time.delayedCall(400, () => {
          if (e.hp <= 0) return;
          e.st = 'ult_dash'; e._dashStep = 1; e._hitPl = false; e.t = 0.2;
          const ang = Math.atan2(dy, dx);
          e.cvx = Math.cos(ang) * D.spd * 3.6;
          e.cvy = Math.sin(ang) * D.spd * 3.6;
          sfxAt('jump', s.x, s.y, this);
        });
        return;
      }

      // Skill: Shadow Blink (Teleportasi ke belakang Arka)
      if (e.blinkCd <= 0 && (d > 75 || Math.random() < 0.35)) {
        e.blinkCd = rnd(3.8, 5.5);
        this.puff(s.x, s.y);
        if (this.jx) this.jx('spark', s.x, s.y, 6, { tint: 0x00f5ff });
        const [pdx, pdy] = DIRV[pl.dir] || [1, 0];
        s.setPosition(pl.x - pdx * 32, pl.y - pdy * 32);
        this.puff(s.x, s.y);
        sfxAt('jump', s.x, s.y, this);
        e.st = 'wind'; e.t = 0.28; s.setVelocity(0);
        markOver(this, e, '!', '#00f5ff');
        return;
      }

      // Skill: Lunge Strike (Tebasan Cepat)
      if (e.skillCd <= 0 && d < 65) {
        e.skillCd = rnd(2.0, 3.2);
        e.st = 'wind'; e.t = 0.32; s.setVelocity(0);
        markOver(this, e, '!', '#ffd84a');
        if (this.jx) this.jx('spark', s.x + (dx > 0 ? 12 : -12), s.y - 10, 3, { tint: 0x8ae8ff });
        return;
      }

      // Pergerakan Taktis (Mengitari pemain / Footwork)
      const idealDist = 48;
      const tang = Math.atan2(dy, dx) + (d < idealDist ? 1.8 : 0.4);
      s.setVelocity(Math.cos(tang) * D.spd, Math.sin(tang) * D.spd);
    } else {
      if (e.t <= 0) {
        e.t = rnd(1.5, 3.0);
        const a = rnd(0, 6.28);
        s.setVelocity(Math.cos(a) * D.spd * 0.45, Math.sin(a) * D.spd * 0.45);
      }
      if (Math.abs(s.body.velocity.x) > 2) s.flipX = s.body.velocity.x < 0;
    }
  }
});
