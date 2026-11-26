'use strict';
// Gelombang 16 (T508–T517): Gerakan & Posisi (Movement & Positioning) ala Dimraeth
// - T508: Kurva kecepatan berguling 3 fase (Burst -> Glide -> Landing Recovery + debu mendarat)
// - T509: Roll-Attack / Dash-Strike (tekan Serang di ujung berguling: tusukan laju +30% jangkauan, 1.25x dmg, sambung kombo 2)
// - T510: Lock-On Strafe & Backstep (hadap musuh terkunci, jalan mundur 0.85x, ketuk Dash tanpa arah = lompat mundur hemat stamina)
// - T511: Weighted Combo Footwork (langkah maju bertahap per kombo 1..5 + belok arah analog ±45°)
// - T512: Dodge-Cancel Recovery (potong sisa pemulihan ayunan < 45% dengan berguling)
// - T513: Inertia & Pivot Turn Dust (akselerasi/deselerasi mulus + debu tumpuan saat balik arah lari > 135°)
// - T514: Strafing While Channelling (melangkah pelan 45% saat menahan sihir / tarik-bidik sambil menghadap sasaran)
// - T515: Terrain Tactical Footing (jalan setapak +10% spd & hemat stamina lari 25%; rawa/air dangkal -18% spd & roll pendek kecuali Sepatu Angin)
// - T516: Body Blocking & Roll-Through (badan musuh menahan langkah jalan biasa, tapi berguling menerobos & menyenggol musuh kecil)
// - T517: Tech-Roll / Ukemi Recovery (tekan Dash di ujung terpental pl.kb < 0.12 untuk jungkir pulih cepat)

(() => {
  const W = World.prototype;
  const ROLL_DUR = 0.24;
  const ROLL_LAND_T = 0.06;

  // Cek apakah Arka berada di atas jalan setapak atau rawa/air dangkal (T515)
  function getTerrainState(sc, x, y) {
    const M = sc.M;
    if (!M || M.indoor) return 'normal';
    if (!M._sdFn && typeof makeSD === 'function') {
      try { M._sdFn = makeSD(M); } catch (_) { M._sdFn = null; }
    }
    const onPath = M._sdFn ? M._sdFn(x, y) < 0 : false;
    if (onPath) return 'path';
    const gType = typeof groundAt === 'function' ? groundAt(x, y) : '';
    if (gType === 'shallow' || gType === 'water' || M.ground === 'swamp') return 'bog';
    return 'normal';
  }

  // T515: Pengaruh medan pada speedMul
  const _speedMul0 = W.speedMul;
  W.speedMul = function () {
    let mul = _speedMul0 ? _speedMul0.call(this) : 1;
    const pl = this.pl;
    if (!pl || pl.dead) return mul;
    const ter = getTerrainState(this, pl.x, pl.y);
    pl._terrain = ter;
    if (ter === 'path') {
      const inCombat = this.enemies && this.enemies.some(e => e.hp > 0 && e.alert === 2 && Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) < 180);
      if (!inCombat) mul *= 1.1;
    } else if (ter === 'bog' && S.eq?.acc !== 'boots') {
      mul *= 0.82;
    }
    // T510: Strafe mundur saat lock-on sedikit lebih lambat & taktis (0.85x)
    if (pl._strafingBack) mul *= 0.85;
    // T514: Gerak melambat taktis saat menahan mantra / membidik
    if (pl._channellingMove) mul *= 0.45;
    return mul;
  };

  // T515: Hemat stamina lari 25% di atas jalan setapak
  const _updSta0 = W.updStamina;
  W.updStamina = function (dt, isSprinting, isMoving) {
    const s0 = S.sta;
    const r = _updSta0.call(this, dt, isSprinting, isMoving);
    if (isSprinting && isMoving && this.pl && this.pl._terrain === 'path' && s0 != null && S.sta < s0) {
      S.sta = Math.min(s0, S.sta + (s0 - S.sta) * 0.25);
    }
    return r;
  };

  // T512, T517, T510, T508: Bungkus dash()
  const _dash0 = W.dash;
  W.dash = function () {
    const pl = this.pl;
    if (!pl || pl.dead) return;

    // T517: Pulih Pijakan Cepat Saat Terpental (Tech-Roll / Ukemi Recovery)
    if (pl.kb > 0 && pl.kb < 0.14 && S.sta >= 12) {
      pl.kb = 0;
      this.dashCd = 0;
      pl.dashT = 0;
      const v = Input.vec();
      let dx = v.x, dy = v.y;
      if (Math.hypot(dx, dy) < 0.2) [dx, dy] = DIRV[pl.dir] || [0, 1];
      const l = Math.hypot(dx, dy) || 1;
      dx /= l; dy /= l;
      S.sta = Math.max(0, S.sta - 10);
      pl.dashT = 0.18;
      pl._rollKind = 'ukemi';
      pl.dashStartT = this.t;
      pl.dvx = dx * 260;
      pl.dvy = dy * 260;
      pl.inv = Math.max(pl.inv, 0.22);
      this.dashCd = 0.55;
      pl._roll = 0.24;
      sfx('jump');
      popWorld(pl.x, pl.y - 28, 'PULIH!', 'heal');
      if (this.rollFx) this.rollFx();
      return;
    }

    // T512: Dodge-Cancel Recovery (potong sisa pemulihan ayunan bila sudah lewat fase aktif)
    const wt = (ITEMS[S.eq?.wpn] || {}).wt || 'sword';
    const wLock = (typeof WEAPON_STYLE !== 'undefined' && WEAPON_STYLE[wt]) ? WEAPON_STYLE[wt].lock : 0.22;
    if (pl.atkT > 0 && pl.atkT <= wLock * 0.55) {
      pl.atkT = 0;
      pl.atkCd = Math.min(pl.atkCd, 0.08);
      if (this.sword) { if (this.swordRest) this.swordRest(); else this.sword.setVisible(false); } /* gerak membatalkan ayunan: pedang tetap dipegang */
    }

    // T510: Backstep saat mengunci target & menekan Dash tanpa arah analog
    const v = Input.vec(), m = Math.hypot(v.x, v.y);
    const lockE = this.lockE && this.lockE.hp > 0 && this.lockE.spr?.active ? this.lockE : null;
    if (lockE && m < 0.2 && this.dashCd <= 0 && (!pl.dashT || pl.dashT <= 0) && learned('dash')) {
      const cost = typeof soulCost === 'function' ? Math.round(soulCost(SOUL.roll) * 0.6) : 13;
      if (S.sta != null && S.sta < cost) {
        popWorld(pl.x, pl.y - 30, 'Lelah!', 'mpc'); sfx('buzz'); return;
      }
      if (S.sta != null) { S.sta = Math.max(0, S.sta - cost); this.staDelay = 0.55; }
      const ex = lockE.spr.x - pl.x, ey = lockE.spr.y - pl.y, el = Math.hypot(ex, ey) || 1;
      const bx = -ex / el, by = -ey / el;
      pl.dir = Math.abs(ex) > Math.abs(ey) ? (ex > 0 ? 'right' : 'left') : (ey > 0 ? 'down' : 'up');
      pl.dashT = 0.14;
      pl.dashStartT = this.t;
      pl._rollKind = 'backstep';
      pl._rollDirX = bx; pl._rollDirY = by;
      pl.dvx = bx * 275; pl.dvy = by * 275;
      pl.inv = Math.max(pl.inv, 0.18);
      this.dashCd = 0.5;
      pl._rollEndT = this.t + 0.14;
      sfx('jump');
      this.puff(pl.x, pl.y);
      return;
    }

    const wasDash = pl.dashT > 0;
    const r = _dash0.apply(this, arguments);
    if (!wasDash && pl.dashT > 0.1) {
      // T508 & T515: Kurva kecepatan 3 fase & penyesuaian jarak di lumpur/air dangkal
      const bogMul = (pl._terrain === 'bog' && S.eq?.acc !== 'boots') ? 0.85 : 1;
      const l = Math.hypot(pl.dvx, pl.dvy) || 1;
      pl._rollDirX = (pl.dvx / l) * bogMul;
      pl._rollDirY = (pl.dvy / l) * bogMul;
      pl.dashT = ROLL_DUR;
      pl._rollKind = 'roll';
      pl._rollLanded = false;
      pl._rollEndT = this.t + ROLL_DUR;
    }
    return r;
  };

  // T509 & T511: Serangan Keluar dari Berguling (Dash-Strike) & Langkah Maju Bertahap per Kombo
  const _attack0 = W.attack;
  W.attack = function (isHeavy) {
    const pl = this.pl;
    if (!pl || pl.dead) return _attack0.apply(this, arguments);

    // T509: Cek apakah menekan Serang di ujung berguling atau sesaat setelah selesai berguling/backstep
    const inRollWindow = pl._rollKind !== 'lunge' && ((pl.dashT > 0 && pl.dashT < 0.11) || (pl._rollEndT && this.t - pl._rollEndT < 0.16));
    if (inRollWindow && pl.atkCd <= 0.08 && !isHeavy) {
      pl.dashT = 0;
      pl._rollEndT = 0;
      pl.atkCd = 0;
      this._isDashStrike = true;
    }

    // T511: Koreksi sudut hadap & langkah kombo hingga ±45° mengikuti arah analog
    const v = Input.vec(), m = Math.hypot(v.x, v.y);
    if (m > 0.25 && !this.lockE) {
      pl.dir = Math.abs(v.x) > Math.abs(v.y) ? (v.x > 0 ? 'right' : 'left') : (v.y > 0 ? 'down' : 'up');
    }

    const prevAtkCd = pl.atkCd;
    let r;
    try {
      r = _attack0.apply(this, arguments);
    } finally {
      if (this._isDashStrike && pl.atkCd > prevAtkCd) {
        // Dash-Strike: meluncur maju 28 px, kombo langsung ke-2, bonus jangkauan
        pl.combo = 2;
        const [dx, dy] = DIRV[pl.dir] || [0, 1];
        pl.dashT = 0.09;
        pl._rollKind = 'lunge';
        pl.dvx = dx * 310;
        pl.dvy = dy * 310;
        popWorld(pl.x, pl.y - 28, 'SERBU!', 'crit');
        sfx('swing');
        // Hit tambahan dengan jangkauan +30% untuk Dash-Strike
        const st = stat(), hx = pl.x + dx * 22, hy = pl.y - 6 + dy * 22;
        const dsId = (this.swingId = (this.swingId || 0) + 1);
        for (const e of this.enemies) {
          if (e.hp <= 0 || e.lastSwing === dsId) continue;
          const ey = e.spr.y - (e.D.r || 10) * (e.sc || 1) * 0.8;
          if (Math.hypot(e.spr.x - hx, ey - hy) < 22 + (e.D.r || 10) * (e.sc || 1)) {
            e.lastSwing = dsId;
            this.hitEnemy(e, st.atk, true, dx * 1.4, dy * 1.4);
          }
        }
      } else if (pl.atkCd > prevAtkCd && (!pl._rollKind || pl._rollKind === 'lunge')) {
        // T511: Weighted Combo Footwork (dorongan kaki bertahap per kombo 1..5 + arah analog ±45°)
        const c = pl.combo || 1;
        const stepSpd = [0, 85, 95, 125, 135, 185][c] || 100;
        const stepDur = c === 5 ? 0.11 : 0.07;
        let [dx, dy] = DIRV[pl.dir] || [0, 1];
        if (m > 0.25) {
          const baseAng = Math.atan2(dy, dx), joyAng = Math.atan2(v.y, v.x);
          let diff = joyAng - baseAng;
          while (diff > Math.PI) diff -= Math.PI * 2;
          while (diff < -Math.PI) diff += Math.PI * 2;
          const clamped = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, diff));
          dx = Math.cos(baseAng + clamped);
          dy = Math.sin(baseAng + clamped);
        }
        pl.dashT = stepDur;
        pl._rollKind = 'lunge';
        pl.dvx = dx * stepSpd;
        pl.dvy = dy * stepSpd;
      }
      this._isDashStrike = false;
    }
    return r;
  };

  // Bungkus hitEnemy saat Dash-Strike aktif agar mendapat 1.25x damage
  const _hitEnemy0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (this._isDashStrike) {
      base = (base || 0) * 1.25;
      crit = true;
    }
    return _hitEnemy0.call(this, e, base, crit, nx, ny);
  };

  // Update per-frame untuk T508, T510, T513, T514, T516
  const _update0 = W.update;
  W.update = function (time, dms) {
    const dt = Math.min(dms, 50) / 1000;
    const pl = this.pl;
    const locked = !!UIH || G.lock > 0 || G.title || this.trans;

    if (pl && !pl.dead && !locked && !this.passive) {
      const v = Input.vec(), m = Math.hypot(v.x, v.y);
      const isShift = !!(Input.keys?.dash && S.sta > 0);
      const lockE = (this.lockE && this.lockE.hp > 0 && this.lockE.spr?.active) ? this.lockE : null;

      // T514: Cek apakah sedang menahan sihir atau menarik garis bidik (Strafing While Channelling)
      const isAiming = !!(Input.aim && Input.aim.on && Input.aim.drag);
      const isHoldingCast = !!(Input.keys?.b || this.holdA > 0.25);
      pl._channellingMove = (isAiming || isHoldingCast) && pl.dashT <= 0;

      // T510: Lock-On Strafe (ketika mengunci musuh dalam jarak < 180 px dan tidak lari penuh)
      pl._strafingBack = false;
      if (lockE && !isShift && Math.hypot(lockE.spr.x - pl.x, lockE.spr.y - pl.y) < 180) {
        const ex = lockE.spr.x - pl.x, ey = lockE.spr.y - pl.y;
        if (m > 0.15 && (v.x * ex + v.y * ey) < -0.1) {
          pl._strafingBack = true;
        }
      }
    }

    _update0.call(this, time, dms);

    if (!pl || pl.dead || locked || this.passive || !pl.body) return;
    const v = Input.vec(), m = Math.hypot(v.x, v.y);

    // T508: Kurva kecepatan 3 fase saat berguling (Burst -> Glide -> Landing Recovery)
    if (pl.dashT > 0 && pl._rollKind === 'roll') {
      const rem = pl.dashT;
      let spd = 210;
      if (rem > ROLL_DUR - 0.10) spd = 340; // Fase 1: Burst (0 - 0.10s)
      else if (rem > ROLL_LAND_T) spd = 215; // Fase 2: Glide (0.10 - 0.18s)
      else {
        spd = 55; // Fase 3: Landing Recovery (0.18 - 0.24s)
        if (!pl._rollLanded) {
          pl._rollLanded = true;
          if (pl._terrain === 'bog' && this.sparkle) this.sparkle(pl.x, pl.y - 2, 'dot', 4);
          else if (this.puff) this.puff(pl.x, pl.y - 1);
        }
      }
      pl.dvx = (pl._rollDirX || 0) * spd;
      pl.dvy = (pl._rollDirY || 0) * spd;
      pl.setVelocity(pl.dvx, pl.dvy);

      // T516: Roll-Through — saat berguling menerobos kepungan, senggol musuh kecil di jalur roll
      for (const e of this.enemies) {
        if (e.hp <= 0 || e.boss || !e.spr?.active) continue;
        const dx = e.spr.x - pl.x, dy = e.spr.y - pl.y, d = Math.hypot(dx, dy) || 1;
        if (d < e.D.r * e.sc + 12 && (e.kb || 0) <= 0) {
          e.kb = 0.08;
          e.kbx = (dx / d) * 95;
          e.kby = (dy / d) * 95;
        }
      }
      return;
    }

    if (pl.dashT <= 0 && pl._rollKind) pl._rollKind = null;

    // T513: Inertia (akselerasi & pengereman halus) & Pivot Turn Dust
    if (pl.dashT <= 0 && pl.kb <= 0 && !pl.isClimbing) {
      const targetVx = pl.body.velocity.x, targetVy = pl.body.velocity.y;
      const prevVx = pl._smoothVx || 0, prevVy = pl._smoothVy || 0;
      const prevSpd = Math.hypot(prevVx, prevVy), curSpd = Math.hypot(targetVx, targetVy);

      // Deteksi Pivot Turn (> 135 derajat saat berlari cepat)
      if (prevSpd > 65 && curSpd > 55) {
        const dot = (prevVx * targetVx + prevVy * targetVy) / (prevSpd * curSpd);
        if (dot < -0.65 && (!pl._pivotCd || this.t > pl._pivotCd)) {
          pl._pivotCd = this.t + 0.35;
          pl._pivotPauseT = 0.045;
          if (this.puff) this.puff(pl.x, pl.y - 1);
        }
      }

      if (pl._pivotPauseT > 0) {
        pl._pivotPauseT -= dt;
        pl.setVelocity(targetVx * 0.25, targetVy * 0.25);
        pl._smoothVx = targetVx * 0.25;
        pl._smoothVy = targetVy * 0.25;
      } else {
        const rate = curSpd > prevSpd ? Math.min(1, dt / 0.055) : Math.min(1, dt / 0.045);
        pl._smoothVx = prevVx + (targetVx - prevVx) * rate;
        pl._smoothVy = prevVy + (targetVy - prevVy) * rate;
        pl.setVelocity(pl._smoothVx, pl._smoothVy);
      }

      // T516: Body Blocking — saat berjalan biasa (tidak sedang roll), badan musuh menahan langkah Arka
      for (const e of this.enemies) {
        if (e.hp <= 0 || !e.spr?.active || e.D?.fly) continue;
        const dx = pl.x - e.spr.x, dy = pl.y - e.spr.y, d = Math.hypot(dx, dy) || 1;
        const minR = (e.D.r || 10) * (e.sc || 1) + 7;
        if (d < minR) {
          const push = (minR - d) * 14;
          pl.setVelocity(pl.body.velocity.x + (dx / d) * push, pl.body.velocity.y + (dy / d) * push);
        }
      }
    }

    // T510 & T514: Pertahankan arah hadap ke target terkunci atau arah bidikan
    const lockE = (this.lockE && this.lockE.hp > 0 && this.lockE.spr?.active) ? this.lockE : null;
    if (Input.aim && Input.aim.on && Input.aim.drag) {
      const ax = Input.aim.x, ay = Input.aim.y;
      pl.dir = Math.abs(ax) > Math.abs(ay) ? (ax > 0 ? 'right' : 'left') : (ay > 0 ? 'down' : 'up');
      pl.flipX = pl.dir === 'left';
    } else if (lockE && !(Input.keys?.dash && m > 0.5) && Math.hypot(lockE.spr.x - pl.x, lockE.spr.y - pl.y) < 180) {
      const ex = lockE.spr.x - pl.x, ey = lockE.spr.y - pl.y;
      pl.dir = Math.abs(ex) > Math.abs(ey) ? (ex > 0 ? 'right' : 'left') : (ey > 0 ? 'down' : 'up');
      pl.flipX = pl.dir === 'left';
    }
  };
})();
