'use strict';
// AI musuh biasa (hop, fly, shoot, turret, lunge, walk, charge, ghost, golem)
Object.assign(World.prototype, {
  updEnemy(e, dt, locked) {
    const s = e.spr, D = e.D, pl = this.pl, sc = e.sc;
    if (e.hp <= 0) { s.setVelocity(0); return; }
    e.sh.setPosition(s.x, s.y - 1 + (D.fly ? 10 : 0)).setDepth(s.y - .5); s.setDepth(s.y + (D.fly ? 12 : 0));
    if (e.flash > 0) { e.flash -= dt; if (e.flash <= 0) { s.clearTint(); if (['wind', 'swind', 'cwind', 'throw'].includes(e.st)) s.setTint(0xffa07a); else if (e.p2) s.setTint(0xffb8a8); } }
    if (e.kb > 0) { e.kb -= dt; s.setVelocity(e.kbx, e.kby); return; }
    if (locked) { s.setVelocity(0); return; }
    if (e.hurtT > 0) { e.hurtT -= dt; s.setVelocity(0); return; }
    if (this.enemyStatus(e, dt)) return;

    const dx = pl.x - s.x, dy = pl.y - s.y, d = Math.hypot(dx, dy) || 1;
    const aggro = !pl.dead && d < (e.boss ? 420 : 120);
    const hx = e.home.x - s.x, hy = e.home.y - s.y, hd = Math.hypot(hx, hy) || 1;
    e.t -= dt; e.cd -= dt;

    // Panggilan Bala Bantuan Musuh Terdesak (#9)
    if (!e.calledBackup && !e.boss && (e.type === 'goblin' || e.type === 'wolf' || e.type === 'boar') && e.hp < e.max * 0.35 && aggro) {
      e.calledBackup = true;
      e.st = 'calling';
      s.setVelocity(0);
      popWorld(s.x, s.y - 20, 'BAHAYA! MENGGELAR BANTUAN!', 'crit');
      sfxAt('crit', s.x, s.y, this);
      this.time.delayedCall(450, () => {
        if (e.hp > 0 && this.enemies.length < 12) {
          const spawnX = clamp(s.x + rnd(-80, 80), 40, this.M.w - 40);
          const spawnY = clamp(s.y + rnd(-80, 80), 40, this.M.h - 40);
          this.puff(spawnX, spawnY);
          this.spawnEnemy(e.type, spawnX, spawnY);
          popWorld(spawnX, spawnY - 14, '+Bala Bantuan!', 'crit');
        }
        e.st = 'idle';
      });
      return;
    }

    // Musuh teralihkan oleh Petasan Pengalih (#410)
    if (e.distracted > 0) {
      e.distracted -= dt;
      const dtx = (e.distractTx || s.x) - s.x;
      const dty = (e.distractTy || s.y) - s.y;
      const dtl = Math.hypot(dtx, dty) || 1;
      s.flipX = dtx > 0;
      if (dtl > 18) {
        s.setVelocity((dtx / dtl) * D.spd * 0.7, (dty / dtl) * D.spd * 0.7);
      } else {
        s.setVelocity(0, 0);
      }
      return;
    }

    const wander = (spd) => { if (e.t <= 0) { e.t = rnd(1, 2.4); const a = rnd(0, 6.28), go = Math.random() < .6; s.setVelocity(hd > 60 ? hx / hd * spd : go ? Math.cos(a) * spd * .7 : 0, hd > 60 ? hy / hd * spd : go ? Math.sin(a) * spd * .7 : 0); } };
    switch (D.ai) {
      case 'flee': {
        // AI Slime Emas: selalu kabur menjauh dari Arka
        const fleeAng = Math.atan2(s.y - pl.y, s.x - pl.x);
        s.setVelocity(Math.cos(fleeAng) * D.spd, Math.sin(fleeAng) * D.spd);
        e.fleeT = (e.fleeT || 12) - dt;
        if (e.fleeT <= 0 && e.hp > 0) {
          e.hp = 0;
          this.puff(s.x, s.y);
          s.destroy();
          e.sh.destroy();
          popWorld(s.x, s.y - 12, 'Slime Emas Kabur!', 'mpc');
        }
        break;
      }
      case 'hop':
        if (D.tex === 'slime_hd' && aggro && d < 65 && (e.cd || 0) <= 0 && e.st !== 'atk') {
          e.st = 'atk'; e.t = 0.65; e.cd = rnd(2.2, 3.8);
          s.setVelocity((dx / d) * D.spd * 2.2, (dy / d) * D.spd * 2.2);
          s.play('slime_hd_atk', true); s.flipX = dx < 0;
          break;
        }
        if (e.st === 'atk') {
          if (e.t <= 0) {
            e.st = 'idle'; e.t = rnd(.5, 1); s.setVelocity(0);
            s.play('slime_hd_idle', true); this.puff(s.x, s.y);
          }
          break;
        }
        if (e.t <= 0) {
          if (e.st === 'hop') {
            e.st = 'idle'; e.t = rnd(.45, 1); s.setVelocity(0);
            if (D.tex === 'slime_hd' && s.anims) s.play('slime_hd_idle', true);
            else this.tweens.add({ targets: s, scaleX: sc * 1.25, scaleY: sc * .78, duration: 70, yoyo: true });
          } else {
            e.st = 'hop'; e.t = .36; const a = aggro ? Math.atan2(dy, dx) + rnd(-.35, .35) : (hd > 60 ? Math.atan2(hy, hx) : rnd(0, 6.28));
            s.setVelocity(Math.cos(a) * D.spd * 1.7, Math.sin(a) * D.spd * 1.7);
            if (D.tex === 'slime_hd') {
              if (s.anims) s.play('slime_hd_hop', true);
              if (s.body.velocity.x < -3) s.flipX = true; else if (s.body.velocity.x > 3) s.flipX = false;
            } else {
              this.tweens.add({ targets: s, scaleX: sc * .85, scaleY: sc * 1.2, duration: 120, yoyo: true });
            }
          }
        }
        if (D.tex === 'slime_hd' && !s.anims.isPlaying && e.st !== 'atk') s.play(e.st === 'hop' ? 'slime_hd_hop' : 'slime_hd_idle', true);
        s.anims.timeScale = e.st === 'hop' ? 2 : .8; break;
      case 'fly': {
        // Serangan Menukik Musuh Terbang (#7)
        if (aggro && d >= 40 && d <= 95 && !e.swoopCooldown && e.st !== 'swoop' && e.st !== 'recover') {
          if (!e.swoopPrep) {
            e.swoopPrep = 0.25; // ancang-ancang sekejap
            s.setVelocity(0, -15);
            this.sparkle(s.x, s.y - 8, 'spark', 4);
          } else {
            e.swoopPrep -= dt;
            if (e.swoopPrep <= 0) {
              e.swoopPrep = 0;
              e.st = 'swoop';
              e.swoopT = 0.55;
              e.swoopTx = pl.x;
              e.swoopTy = pl.y;
              sfx('swing');
              this.tweens.add({ targets: s, scaleY: sc * 1.3, scaleX: sc * 0.8, duration: 120, yoyo: true });
            }
          }
        }
        if (e.st === 'swoop') {
          e.swoopT -= dt;
          const svx = e.swoopTx - s.x, svy = e.swoopTy - s.y, svl = Math.hypot(svx, svy) || 1;
          s.setVelocity((svx / svl) * D.spd * 2.2, (svy / svl) * D.spd * 2.2);
          s.flipX = svx > 0;
          if (e.swoopT <= 0 || svl < 14) {
            e.st = 'recover';
            e.swoopT = 0.4;
            e.swoopCooldown = 2.5; // jeda antar-menukik
            s.setVelocity(0, -D.spd * 0.8);
          }
          break;
        }
        if (e.st === 'recover') {
          e.swoopT -= dt;
          s.setVelocity(0, -D.spd * 0.6);
          if (e.swoopT <= 0) e.st = null;
          break;
        }
        if (e.swoopCooldown > 0) e.swoopCooldown -= dt;
        e.ph += dt * 5; let tx, ty;
        if (aggro) { tx = pl.x + Math.cos(e.ph * .6) * 22; ty = pl.y - 6 + Math.sin(e.ph * .9) * 16; } else { tx = e.home.x + Math.cos(e.ph * .3) * 40; ty = e.home.y + Math.sin(e.ph * .45) * 26; }
        const vx = tx - s.x, vy = ty - s.y, vl = Math.hypot(vx, vy) || 1; const sp = aggro ? D.spd : D.spd * .6;
        s.setVelocity(vx / vl * sp, vy / vl * sp + Math.sin(e.ph * 2) * 12); s.flipX = vx > 0; break;
      }
      case 'ghost': {
        e.phT -= dt;
        if (e.phT <= 0) { e.faded = !e.faded; e.phT = e.faded ? 1.6 : rnd(2.5, 3.5); this.tweens.add({ targets: s, alpha: e.faded ? .22 : .9, duration: 250 }); }
        e.ph += dt * 3; const tx = aggro ? pl.x + Math.cos(e.ph) * 26 : e.home.x + Math.cos(e.ph * .5) * 40, ty = aggro ? pl.y - 4 + Math.sin(e.ph * 1.3) * 18 : e.home.y + Math.sin(e.ph * .7) * 30;
        const vx = tx - s.x, vy = ty - s.y, vl = Math.hypot(vx, vy) || 1, sp = D.spd * (e.faded ? 1.5 : 1);
        s.setVelocity(vx / vl * sp, vy / vl * sp); s.flipX = vx > 0; break;
      }
      case 'shoot':
        if (D.ch) { if (aggro && d > 70) s.setVelocity(dx / d * D.spd, dy / d * D.spd); else if (aggro && d < 46) s.setVelocity(-dx / d * D.spd, -dy / d * D.spd); else if (aggro) s.setVelocity(0); else wander(D.spd * .6); }
        else if (e.t <= 0) { e.t = rnd(1, 2); const a = aggro && d > 55 ? Math.atan2(dy, dx) : rnd(0, 6.28); const go = aggro || hd < 50; s.setVelocity(go ? Math.cos(a) * D.spd : hx / hd * D.spd, go ? Math.sin(a) * D.spd : hy / hd * D.spd); }
        e.shootT -= dt;
        if (aggro && e.shootT <= 0 && d < 150) { e.shootT = rnd(1.8, 2.8); if (!D.ch) s.setVelocity(0); this.eShoot(e, D.proj, D.proj === 'bone' ? [-.12, .12] : [0], D.atk); this.tweens.add({ targets: s, scaleY: sc * .85, scaleX: sc * 1.15, duration: 90, yoyo: true }); }
        if (D.ch) this.charAnim(e); break;
      case 'turret':
        s.setVelocity(0); e.shootT -= dt; s.flipX = dx > 0;
        if (aggro && e.shootT <= 0 && d < 160) { e.shootT = 2.4; this.eShoot(e, 'seed', [-.32, 0, .32], D.atk); this.tweens.add({ targets: s, scaleY: 1.15, duration: 100, yoyo: true }); }
        s.anims.timeScale = aggro ? 1.6 : .6; break;
      case 'shaman': {
        // Dukun Goblin (#183): Menjaga jarak dan memulihkan HP kawan
        if (aggro && d < 65) s.setVelocity(-dx / d * D.spd, -dy / d * D.spd);
        else if (aggro && d > 120) s.setVelocity(dx / d * D.spd, dy / d * D.spd);
        else wander(D.spd * .4);
        e.healT = (e.healT || 3.5) - dt;
        if (e.healT <= 0) {
          e.healT = 4.0;
          const allies = this.enemies.filter(o => o.hp > 0 && Math.hypot(s.x - o.spr.x, s.y - o.spr.y) < 110);
          if (allies.length > 0) {
            sfxAt('heal', s.x, s.y, this);
            this.sparkle(s.x, s.y - 12, 'dotg', 10);
            for (const al of allies) {
              al.hp = Math.min(al.max, al.hp + 15);
              popWorld(al.spr.x, al.spr.y - 20, '+15 HP', 'heal');
            }
          }
        }
        if (D.ch) this.charAnim(e);
        break;
      }
      case 'walk':
        if (aggro) {
          // Musuh Berkelompok & Pengepungan (#8)
          let angleOffset = 0;
          const otherAggro = this.enemies.filter(o => o !== e && o.hp > 0 && Math.hypot(pl.x - o.spr.x, pl.y - o.spr.y) < 180);
          if (otherAggro.length > 0) {
            const myIdx = this.enemies.indexOf(e);
            angleOffset = (myIdx % 2 === 0 ? 0.75 : -0.75);
          }
          const baseAng = Math.atan2(dy, dx) + angleOffset;
          s.setVelocity(Math.cos(baseAng) * D.spd, Math.sin(baseAng) * D.spd);
        } else wander(D.spd * .6);
        if (D.side) s.flipX = s.body.velocity.x > 0; break;
      case 'lunge':
        if (e.st === 'idle' || e.st === 'chase') {
          if (aggro) {
            e.st = 'chase'; s.setVelocity(dx / d * D.spd, dy / d * D.spd);
            if (d < (D.side ? 44 : 34) && e.t <= 0) { e.st = 'wind'; e.t = D.side ? .32 : .42; s.setVelocity(0); e.lx = dx / d; e.ly = dy / d; s.setTint(0xffa07a); }
          } else wander(28);
        } else if (e.st === 'wind') { if (e.t <= 0) { e.st = 'lunge'; e.t = .22; s.clearTint(); s.setVelocity(e.lx * 210, e.ly * 210); sfxAt('swing', s.x, s.y, this); } }
        else if (e.st === 'lunge') { if (e.t <= 0) { e.st = 'rec'; e.t = .55; s.setVelocity(0); } }
        else if (e.st === 'rec') { if (e.t <= 0) { e.st = 'chase'; e.t = .3; } }
        if (D.ch) this.charAnim(e); else s.flipX = (e.st === 'wind' ? e.lx : s.body.velocity.x) > 0; break;
      case 'charge':
        if (e.st === 'idle' || e.st === 'chase') {
          if (aggro && d < 140 && e.cd <= 0) { e.st = 'wind'; e.t = .6; s.setVelocity(0); e.lx = dx / d; e.ly = dy / d; s.setTint(0xffa07a); s.flipX = dx > 0; }
          else if (aggro) s.setVelocity(dx / d * D.spd * .6, dy / d * D.spd * .6); else wander(D.spd * .5);
          if (s.body.velocity.x) s.flipX = s.body.velocity.x > 0;
        } else if (e.st === 'wind') { s.x += Math.sin(this.t * 60) * .6; if (e.t <= 0) { e.st = 'run'; e.t = .9; s.clearTint(); s.setVelocity(e.lx * 220, e.ly * 220); sfxAt('roar', s.x, s.y, this); } }
        else if (e.st === 'run') {
          s.anims.timeScale = 3; this.dustE = (this.dustE || 0) - dt; if (this.dustE <= 0) { this.dustE = .08; this.puff(s.x, s.y); }
          const b = s.body.blocked; if (b.left || b.right || b.up || b.down) { e.st = 'stun'; e.t = 1.2; s.setVelocity(0); this.camShake(100, .004); popWorld(s.x, s.y - 20, 'pusing!', 'xp'); }
          else if (e.t <= 0) { e.st = 'rec'; e.t = .6; s.setVelocity(0); }
        } else if (e.st === 'stun' || e.st === 'rec') { s.anims.timeScale = .5; if (e.t <= 0) { e.st = 'chase'; e.cd = rnd(1, 2); s.anims.timeScale = 1; } }
        break;
      case 'golem':
        if (e.st === 'wind') { s.setVelocity(0); if (e.t <= 0) { e.st = 'rec'; e.t = .9; s.clearTint(); this.shockwave(s.x, s.y, 42, D.atk); } }
        else if (e.st === 'rec') { s.setVelocity(0); if (e.t <= 0) e.st = 'chase'; }
        else { if (aggro) s.setVelocity(dx / d * D.spd, dy / d * D.spd); else wander(D.spd * .6); if (aggro && d < 36 && e.cd <= 0) { e.st = 'wind'; e.t = .65; e.cd = 2.2; s.setTint(0xffa07a); sfxAt('jump', s.x, s.y, this); } }
        s.flipX = dx > 0; break;
      case 'boss': case 'gboss': this.updBoss(e, dt, dx, dy, d); break;
      case 'qboss': this.updQueen(e, dt, dx, dy, d); break;
      case 'sboss': this.updSnake(e, dt, dx, dy, d); break;
      case 'wboss': this.updWitch(e, dt, dx, dy, d); break;
      case 'dboss': this.updDragon(e, dt, dx, dy, d); break;
    }
    if (e.slow > 0) { e.slow -= dt; s.body.velocity.scale(.5); if (e.flash <= 0) s.setTint(0xa8dcff); if (e.slow <= 0) s.clearTint(); }
    const cy = s.y - D.r * sc * .6 - (D.fly ? 6 : 0);
    if (!e.faded && Math.abs(pl.x - s.x) < D.r * sc + 5 && Math.abs(pl.y - 4 - cy) < D.r * sc + 6) this.hurtPlayer(D.atk * (['lunge', 'run', 'dash', 'charge'].includes(e.st) ? 1.35 : 1), s.x, s.y, D.fx);
  },
  charAnim(e) {
    const s = e.spr, vx = s.body.velocity.x, vy = s.body.velocity.y, k = e.D.tex.slice(3);
    if (Math.abs(vx) + Math.abs(vy) < 5) { s.anims.stop(); s.setFrame((e.fd || 'down') + (['wind', 'swind', 'cwind', 'throw'].includes(e.st) ? '3' : '0')); return; }
    const d = Math.abs(vx) > Math.abs(vy) ? 'side' : vy > 0 ? 'down' : 'up'; e.fd = d; s.flipX = vx < 0 && d === 'side';
    if (s.anims.currentAnim?.key !== k + '_' + d || !s.anims.isPlaying) s.play(k + '_' + d);
  },
});
