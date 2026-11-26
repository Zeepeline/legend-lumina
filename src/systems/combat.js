"use strict"; // Pertarungan: serangan, bidik panah & sihir api
// pts: titik kena [jarak dari pemain, radius]; mul: pengali damage; kb: pengali dorongan
const WEAPON_STYLE = {
  sword: {
    cd: 0.32,
    lock: 0.2,
    pts: [[14, 15]],
    mul: 1,
    crit: 0.1,
    kb: 1,
    fxs: 1,
    delay: 55,
  } /* delay = kena saat bilah menyapu, bukan sebelum bergerak */,
  spear: {
    cd: 0.38,
    lock: 0.22,
    pts: [
      [12, 9],
      [22, 9],
      [31, 9],
    ],
    mul: 1,
    crit: 0.12,
    kb: 0.7,
    fxs: 1,
    delay: 40,
  },
  axe: {
    cd: 0.62,
    lock: 0.34,
    pts: [[13, 21]],
    mul: 1.25,
    crit: 0.18,
    kb: 1.6,
    fxs: 1.45,
    delay: 110,
  },
  bow: { cd: 0.42, lock: 0.16 },
};
Object.assign(World.prototype, {
  // Gaya serang per jenis senjata (ITEMS[..].wt): sword (default), spear, axe, bow
  attack() {
    const pl = this.pl;
    if (pl.atkCd > 0) {
      if (pl.atkCd <= 0.15 && !this.atkBuf) {
        this.atkBuf = true;
        this.time.delayedCall(pl.atkCd * 1000 + 5, () => {
          this.atkBuf = false;
          if (!this.pl.dead && !G.lock) this.attack();
        });
      }
      return;
    }
    this.atkBuf = false;
    const wt = (ITEMS[S.eq.wpn] || {}).wt || "sword",
      W = WEAPON_STYLE[wt];
    pl.combo =
      this.t - (pl.lastAtk || -9) < W.cd + 0.5
        ? ((pl.combo || 0) % (wt === "sword" ? 3 : 5)) + 1
        : 1;
    pl.lastAtk = this.t;
    const fin = (wt === "sword" && pl.combo === 3) || pl.combo === 5,
      cMul = [1, 1, 1.25, 1.85, 1.38, 1.85][pl.combo] || 1,
      cKb = fin ? 2.1 : pl.combo >= 2 ? 1.3 : 1;
    pl.atkCd = W.cd;
    pl.atkT = W.lock;
    sfx(wt === "bow" ? "jump" : fin || wt === "axe" ? "swing_heavy" : "swing");
    if (wt === "bow") return this.shootArrow();
    if (fin) {
      pl.atkCd += 0.18;
      this.time.delayedCall(40, () => sfx("crit"));
      popWorld(pl.x, pl.y - 30, "KOMBO!", "crit");
    }
    const [dx, dy] = DIRV[pl.dir],
      ang = Math.atan2(dy, dx),
      ox = pl.x + dx * 3,
      oy = pl.y - 9 + dy * 2;
    // Langkah maju bertumpu saat menebas (Forward Lunge kinetik)
    const lungeDist = fin ? 9 : pl.combo >= 3 ? 6 : 4;
    if (pl.body) {
      pl.body.setVelocity(dx * lungeDist * 28, dy * lungeDist * 28);
      this.time.delayedCall(fin ? 90 : 60, () => {
        if (pl.body && !pl.dead) pl.body.setVelocity(0, 0);
      });
    }
    if (wt !== "spear" && !this.textures.exists("vfx_swing_combo")) {
      const sl = this.add
        .sprite(ox, oy, "slash")
        .setOrigin(4 / 28, 0.5)
        .setRotation(ang)
        .setDepth(pl.y + (dy < 0 ? -2 : 3))
        .setFlipY(dx < 0 !== (pl.combo === 2))
        .setScale(W.fxs * (fin ? 1.35 : 1));
      if (fin) sl.setTint(0xffe08a);
      sl.play("slash");
      sl.once("animationcomplete", () => sl.destroy());
    }
    const tier = { wsword: 0 }[S.eq.wpn] ?? 1;
    const sw = this.sword
      .setTexture(
        wt === "spear" ? "wspear" : wt === "axe" ? "waxe" : "sword" + tier,
      )
      .setVisible(true)
      .setPosition(ox + dx * 2, oy + 2)
      .setFlipY(dx < 0)
      .setDepth(pl.y + (dy < 0 ? -3 : 4));
    sw.setTint(
      S.eq.wpn === "csword"
        ? 0x8ae8ff
        : S.eq.wpn === "ssword"
          ? 0xc8d8ff
          : 0xffffff,
    );
    if (wt === "spear") {
      sw.setRotation(ang).setPosition(ox - dx * 6, oy + 2);
      this.tweens.add({
        targets: sw,
        x: ox + dx * 10,
        y: oy + 2 + dy * 10,
        duration: 90,
        yoyo: true,
        onComplete: () => sw.setVisible(false),
      });
    } else {
      sw.setRotation(ang - (wt === "axe" ? 1.8 : 1.3));
      this.tweens.add({
        targets: sw,
        rotation: ang + (wt === "axe" ? 1.8 : 1.2),
        duration: wt === "axe" ? 230 : 150,
        ease: wt === "axe" ? "Quad.easeIn" : "Linear",
        onComplete: () => sw.setVisible(false),
      });
    }
    pl.anims.stop();
    pl.setFrame(
      (pl.dir === "left" || pl.dir === "right" ? "side" : pl.dir) + "3",
    );
    const st = stat(),
      hit = new Set(),
      curSwing = (this.swingId = (this.swingId || 0) + 1);
    const doHit = () => {
      for (const [k, r] of W.pts) {
        const hx = pl.x + dx * k,
          hy = pl.y - 6 + dy * k;
        for (const e of this.enemies) {
          if (e.hp <= 0 || hit.has(e) || e.lastSwing === curSwing) continue;
          const ey = e.spr.y - e.D.r * e.sc * 0.8 - (e.D.fly ? 6 : 0);
          if (Math.hypot(e.spr.x - hx, ey - hy) < r + e.D.r * e.sc) {
            hit.add(e);
            e.lastSwing = curSwing;
            const crit = Math.random() < W.crit + (st.crit || 0);
            const n = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) || 1;
            // Deteksi Serangan dari Belakang / Backstab (#13)
            let isBackstab = false;
            if (e.dir && pl.dir && e.dir === pl.dir) isBackstab = true;
            const curWpnId = S.eq?.wpn,
              isNightTime = S.time >= 19 || S.time < 5;
            if (curWpnId === "leg_moon" && isNightTime) isBackstab = true;
            const finalCrit = crit || isBackstab,
              finalDmg = st.atk * W.mul * cMul * (isBackstab ? 1.8 : 1);
            if (isBackstab && e.hp > 0) {
              popWorld(
                e.spr.x,
                e.spr.y - e.spr.displayHeight - 16,
                "DARI BELAKANG!",
                "purp",
              );
              sfx("crit");
              this.hitStop(0.12, 28);
              this.camShake(100, 0.005);
              S.st = S.st || {};
              S.st.backstabs = (S.st.backstabs || 0) + 1;
            }
            this.hitEnemy(
              e,
              finalDmg,
              finalCrit,
              ((e.spr.x - pl.x) / n) * W.kb * cKb,
              ((e.spr.y - pl.y) / n) * W.kb * cKb,
            );
            const frz = (ITEMS[S.eq.wpn] || {}).frz;
            if (frz && Math.random() < frz) this.freezeEnemy(e, 1.2);
            const curGem = curWpnId && S.socket && S.socket[curWpnId];
            if (curWpnId === "leg_sun") {
              this.sparkle(e.spr.x, e.spr.y - 10, "doto", 6);
              if (typeof applyStatus === "function") applyStatus(e, "burn", 3);
            } else if (curWpnId === "leg_quake") {
              this.camShake(100, 0.005);
              sfx("boom");
            }
            if (curGem === "shard" && Math.random() < 0.25)
              this.freezeEnemy(e, 1.2);
            else if (curGem === "spore" && typeof applyStatus === "function")
              applyStatus(e, "poison", 4);
            else if (curGem === "amethyst_gem" && finalCrit) {
              S.hp = Math.min(stat().maxhp, S.hp + 3);
              popWorld(pl.x, pl.y - 20, "+3 HP (Hisap)", "heal");
              updHud();
            }
          }
        }
      }
    };
    if (W.delay) this.time.delayedCall(W.delay, doHit);
    else doHit();
  },
  shootArrow() {
    const pl = this.pl,
      st = stat(),
      a = this.aimAngle(),
      dx = Math.cos(a),
      dy = Math.sin(a);
    pl.dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    pl.flipX = pl.dir === "left";
    pl.anims.stop();
    pl.setFrame(
      (pl.dir === "left" || pl.dir === "right" ? "side" : pl.dir) + "3",
    );
    const b = this.sword
      .setTexture("wbow")
      .setVisible(true)
      .setPosition(pl.x + dx * 6, pl.y - 9 + dy * 4)
      .setRotation(a)
      .setFlipY(false)
      .clearTint()
      .setDepth(pl.y + (dy < 0 ? -3 : 4));
    this.time.delayedCall(180, () => b.setVisible(false));
    const s = this.add
      .image(pl.x + dx * 8, pl.y - 9 + dy * 6, "arrow")
      .setRotation(a);
    const sharp = has("sarrow");
    if (sharp) {
      addItem("sarrow", -1);
      s.setTint(0xffe08a);
    }
    const isShadowBow = S.eq?.wpn === "leg_shadow";
    if (isShadowBow) s.setTint(0xc8a0ff);
    this.shots.push({
      s,
      gx: pl.x + dx * 8,
      gy: pl.y + dy * 6,
      vx: dx * 270,
      vy: dy * 270,
      life: 0.7,
      kind: "arrow",
      mine: 1,
      dmg: st.atk * 0.8 * (sharp ? 1.6 : 1),
      pierce: sharp || isShadowBow,
    });
  },
  // sihir: arah dari tarikan tombol / arah gerak / musuh terdekat / arah hadap
  aimAngle() {
    const pl = this.pl;
    if (Input.castAng != null) {
      const a = Input.castAng;
      Input.castAng = null;
      return a;
    }
    const v = Input.vec();
    if (Math.hypot(v.x, v.y) > 0.3) return Math.atan2(v.y, v.x);
    const [fx, fy] = DIRV[pl.dir];
    let best = null,
      bs = 1e9;
    for (const e of this.enemies) {
      if (e.hp <= 0 || e.faded) continue;
      const dx = e.spr.x - pl.x,
        dy = e.spr.y - 6 - (pl.y - 6),
        d = Math.hypot(dx, dy);
      if (d > 190) continue;
      const front = (dx * fx + dy * fy) / d;
      const score = d - front * 70;
      if (score < bs) {
        bs = score;
        best = e;
      }
    }
    if (best)
      return Math.atan2(
        best.spr.y - best.D.r * best.sc * 0.6 - (pl.y - 6),
        best.spr.x - pl.x,
      );
    return Math.atan2(fy, fx);
  },
  magic() {
    const pl = this.pl,
      st = stat();
    if (pl.atkCd > 0) {
      Input.castAng = null;
      return;
    }
    if (!S.spell || !learned(S.spell)) {
      Input.castAng = null;
      popWorld(pl.x, pl.y - 30, "Belum bisa sihir", "xp");
      sfx("buzz");
      return;
    }
    if (S.spell === "nova") {
      Input.castAng = null;
      return this.nova();
    }
    if (S.spell !== "fire") {
      Input.castAng = null;
      return this.castSpell(S.spell);
    }
    if (S.mp < 3) {
      Input.castAng = null;
      popWorld(pl.x, pl.y - 30, "MP kurang!", "mpc");
      sfx("buzz");
      return;
    }
    const a = this.aimAngle(),
      dx = Math.cos(a),
      dy = Math.sin(a);
    S.mp -= 3;
    updHud();
    pl.atkCd = 0.4;
    pl.atkT = 0.18;
    sfx("fire");
    pl.dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    pl.flipX = pl.dir === "left";
    const big = S.eq.acc === "ring";
    const s = this.add
      .sprite(pl.x + dx * 8, pl.y - 9 + dy * 6, "fire")
      .play("fire")
      .setRotation(a)
      .setScale(big ? 1.3 : 1);
    if (!OPT.lite && s.preFX && this.renderer?.type === Phaser.WEBGL) {
      try {
        s.preFX.addGlow(0xff7722, 2, 0, false, 0.1, 8);
      } catch (_) {}
    }
    this.shots.push({
      s,
      gx: pl.x + dx * 8,
      gy: pl.y + dy * 6,
      vx: dx * 200,
      vy: dy * 200,
      life: 0.85,
      kind: "fire",
      mine: 1,
      dmg: st.mag * (1 + 0.25 * (tierOf("fire") - 1)),
    });
    s.setScale(1 + 0.15 * (tierOf("fire") - 1));
    useJurus(this, "fire");
  },
});
