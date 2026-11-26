"use strict"; // Pertarungan (bagian 3): ramuan/item, EXP, damage ke pemain, proyektil & gelombang kejut musuh
Object.assign(World.prototype, {
  drink() {
    const st = stat(),
      id = has("potion") ? "potion" : has("hipotion") ? "hipotion" : null;
    if (!id) {
      popWorld(this.pl.x, this.pl.y - 30, "Ramuan habis", "hurt");
      sfx("buzz");
      return;
    }
    if (S.hp >= st.maxhp) {
      popWorld(this.pl.x, this.pl.y - 30, "HP penuh", "heal");
      return;
    }
    this.useItem(id);
  },
  useItem(id) {
    const it = ITEMS[id],
      st = stat();
    if (it.tool) return this.useTool(id);
    if (it.hp) {
      if (S.hp >= st.maxhp && !it.buff) {
        sfx("buzz");
        return false;
      }
      S.hp = Math.min(st.maxhp, S.hp + it.hp);
      popWorld(
        this.pl.x,
        this.pl.y - 28,
        "+" + Math.min(it.hp, st.maxhp - S.hp),
        "heal",
      );
    }
    if (it.mp) {
      if (S.mp >= st.maxmp && !it.buff) {
        sfx("buzz");
        return false;
      }
      S.mp = Math.min(st.maxmp, S.mp + it.mp);
      popWorld(
        this.pl.x,
        this.pl.y - 28,
        "+" + Math.min(it.mp, st.maxmp - S.mp) + " MP",
        "mpc",
      );
    }
    if (it.buff) {
      for (const [k, sec] of it.buff) S.buff[k] = Math.max(S.buff[k] || 0, sec);
      popWorld(
        this.pl.x,
        this.pl.y - 40,
        it.buff.map(([k]) => BUFF[k].n).join(" & ") + "!",
        "xp",
      );
      updStatusHud(this);
    }
    if (it.cure) {
      if (!Object.keys(this.pst).length && !it.hp) {
        sfx("buzz");
        return false;
      }
      this.cure();
      popWorld(this.pl.x, this.pl.y - 40, "pulih!", "heal");
    }
    addItem(id, -1);
    sfx("heal");
    this.sparkle(this.pl.x, this.pl.y - 10, it.mp ? "dot" : "dotg");
    updHud();
    return true;
  },
  gainExp(n, x, y) {
    S.exp += n;
    popWorld(x, y - 22, "+" + n + " EXP", "xp");
    const pl = this.pl;
    for (let i = 0, c = ri(3, 5); i < c; i++) {
      const orb = this.add
        .image(x + rnd(-8, 8), y + rnd(-8, 8), "doto")
        .setTint(0x8ae8ff)
        .setScale(rnd(0.8, 1.3))
        .setDepth(y + 10);
      this.tweens.add({
        targets: orb,
        x: { value: () => pl.x, ease: "Quad.easeIn" },
        y: { value: () => pl.y - 10, ease: "Quad.easeIn" },
        duration: rnd(350, 480),
        onComplete: () => {
          orb.destroy();
          this.sparkle(pl.x, pl.y - 10, "doto", 1);
        },
      });
    }
    let up = false;
    while (S.exp >= need(S.lv)) {
      S.exp -= need(S.lv);
      S.lv++;
      up = true;
    }
    if (up) {
      attrInit();
      this.time.delayedCall(3600, () =>
        popWorld(this.pl.x, this.pl.y - 36, "+3 poin atribut (MENU)", "xp"),
      );
      const old = S.lv - 1,
        st = stat();
      S.hp = st.maxhp;
      S.mp = st.maxmp;
      sfx("lvl");
      banner("LEVEL " + S.lv + "!", "NAIK LEVEL", true, 1600);
      this.time.delayedCall(1700, () => levelUpDetail(old));
      const g = this.add.graphics().setDepth(pl.y + 2),
        o = { r: 4 };
      this.tweens.add({
        targets: o,
        r: 34,
        duration: 600,
        onUpdate: () => {
          g.clear();
          g.lineStyle(2, 0xffe27a, 1 - o.r / 34).strokeEllipse(
            pl.x,
            pl.y - 2,
            o.r * 2,
            o.r,
          );
        },
        onComplete: () => g.destroy(),
      });
      this.sparkle(pl.x, pl.y - 12, "doto", 18);
    }
    updHud();
  },
  hurtPlayer(atk, sx, sy, fx) {
    const pl = this.pl;
    if (G.god || pl.inv > 0 || pl.dead || G.lock > 0 || UIH) {
      if (
        pl._rollKind !== "lunge" &&
        (pl.dashT > 0 || this.t - (pl.dashStartT || 0) <= 0.2) &&
        !pl.perfectDodged
      ) {
        pl.perfectDodged = true;
        popWorld(pl.x, pl.y - 32, "Lolos!", "heal");
        sfx("crit");
        this.time.timeScale = this.physics.world.timeScale = 0.3;
        setTimeout(() => {
          if (this.time) this.time.timeScale = this.physics.world.timeScale = 1;
        }, 120);
        S.sta = Math.min(stat().maxsta || 100, (S.sta || 0) + 10);
        updHud();
      }
      return;
    }
    if (pl.dashT > 0 && pl._rollKind !== "lunge") return;
    if (this.night && isNight()) atk *= 1.15;
    const dmg = Math.max(
      1,
      Math.round(
        (atk * rnd(0.85, 1.15) - stat().def * 0.6) * DIFF[OPT.diff].dmg,
      ),
    );
    S.hp = Math.max(0, S.hp - dmg);
    popWorld(pl.x, pl.y - 28, "-" + dmg, "hurt");
    sfx("hurt");
    this.hitStop(0.06, 40);
    if (S.hp > 0) this.inflict(fx);
    pl.inv = 1;
    const dx = pl.x - sx,
      dy = pl.y - sy,
      n = Math.hypot(dx, dy) || 1;
    pl.kb = 0.14;
    pl.kbx = (dx / n) * 170;
    pl.kby = (dy / n) * 170;
    pl.setTintFill(0xff4a4a);
    this.time.delayedCall(90, () => pl.clearTint());
    this.dangerFrom(sx, sy);
    this.hurtAnim();
    this.camShake(120, 0.006);
    updHud();
    if (S.hp <= 0) this.defeat();
  },
  eShoot(e, kind, angles, dmg, abs) {
    const P = PROJ[kind],
      s = e.spr,
      pl = this.pl,
      base = abs ? 0 : Math.atan2(pl.y - s.y, pl.x - s.x);
    sfxAt("spore", s.x, s.y, this);
    const tint = /venom|spore/.test(kind)
      ? 0x80ff60
      : /ice/.test(kind)
        ? 0x80e0ff
        : 0xffb060;
    for (const a of angles) {
      const sp = this.add.image(s.x, s.y - 8, P.key).setTint(tint);
      const sh = this.add
        .image(s.x, s.y, "shadow")
        .setScale(0.35)
        .setAlpha(0.3)
        .setDepth(s.y - 1);
      this.shots.push({
        s: sp,
        sh,
        age: 0,
        gx: s.x,
        gy: s.y,
        vx: Math.cos(base + a) * P.spd,
        vy: Math.sin(base + a) * P.spd,
        life: 2.6,
        kind,
        dmg,
        spin: P.spin,
        enemy: 1,
        fx: P.fx || e.D.fx,
      });
    }
  },
  shockwave(x, y, R, atk) {
    const tg = this.add.graphics().setDepth(y - 2);
    const fill = { p: 0 };
    this.tweens.add({
      targets: fill,
      p: 1,
      duration: 500,
      onUpdate: () => {
        tg.clear();
        tg.lineStyle(2, 0xff3a3a, 0.75).strokeEllipse(x, y, R * 2, R * 1.2);
        tg.fillStyle(0xff4433, 0.22).fillEllipse(
          x,
          y,
          R * 2 * fill.p,
          R * 1.2 * fill.p,
        );
      },
      onComplete: () => {
        tg.destroy();
        sfxAt("boom", x, y, this);
        this.camShake(250, 0.012);
        const g = this.add.graphics().setDepth(y - 1);
        const o = { r: 6 };
        this.tweens.add({
          targets: o,
          r: R,
          duration: 300,
          onUpdate: () => {
            g.clear();
            g.lineStyle(3, 0xfff0b0, 1 - (o.r / R) * 0.6).strokeEllipse(
              x,
              y,
              o.r * 2,
              o.r * 1.2,
            );
            g.lineStyle(1, 0xffffff, 0.8).strokeEllipse(
              x,
              y,
              o.r * 1.6,
              o.r * 0.9,
            );
          },
          onComplete: () => g.destroy(),
        });
        const p = this.add
          .particles(x, y, "smoke", {
            lifespan: 600,
            speed: { min: 30, max: 70 },
            angle: { min: 160, max: 380 },
            scale: { start: 0.8, end: 1.6 },
            alpha: { start: 0.6, end: 0 },
            emitting: false,
            tint: 0xd8c8a0,
          })
          .setDepth(y + 1);
        p.explode(14);
        this.time.delayedCall(700, () => p.destroy());
        const pl = this.pl;
        if (Math.hypot(pl.x - x, (pl.y - y) * 1.5) < R)
          this.hurtPlayer(atk, x, y);
      },
    });
  },
  updShots(dt, locked) {
    if (locked) return;
    for (const p of this.shots) {
      p.life -= dt;
      p.age = (p.age || 0) + dt;
      const spdScale = p.enemy && p.age < 0.1 ? 0.5 : 1;
      p.gx += p.vx * dt * spdScale;
      p.gy += p.vy * dt * spdScale;
      p.s.setPosition(p.gx, p.gy - 9).setDepth(p.gy + 2);
      if (p.sh) p.sh.setPosition(p.gx, p.gy).setDepth(p.gy - 1);
      if (p.spin) p.s.rotation += dt * 14;
      let dead = p.life <= 0;
      if (
        !dead &&
        this.physics.overlapRect(p.gx - 2, p.gy - 3, 4, 4, false, true).length
      )
        dead = true;
      this._curShot = p;
      if (!dead && p.mine)
        for (const e of this.enemies) {
          if (
            e.hp > 0 &&
            !(p.hitSet && p.hitSet.has(e)) &&
            Math.hypot(
              e.spr.x - p.gx,
              e.spr.y - e.D.r * e.sc * 0.7 - (e.D.fly ? 6 : 0) - (p.gy - 4),
            ) <
              e.D.r * e.sc + 6
          ) {
            const n = Math.hypot(p.vx, p.vy);
            this.hitEnemy(e, p.dmg, false, p.vx / n, p.vy / n);
            if (p.kind === "fire") this.burnEnemy(e, p.dmg * 0.2, 2);
            if (p.pierce) {
              (p.hitSet = p.hitSet || new Set()).add(e);
              continue;
            }
            dead = true;
            break;
          }
        }
      if (
        !dead &&
        p.enemy &&
        Math.hypot(this.pl.x - p.gx, this.pl.y - 4 - p.gy) < 8
      ) {
        this.hurtPlayer(p.dmg, p.gx - p.vx, p.gy - p.vy, p.fx);
        dead = true;
      }
      if (dead) {
        p.dead = true;
        p.s.destroy();
        if (p.sh) p.sh.destroy();
        if (p.kind === "fire") this.sparkle(p.gx, p.gy - 8, "doto", 8);
      }
    }
    this.shots = this.shots.filter((p) => !p.dead);
  },
  async defeat() {
    const pl = this.pl;
    pl.dead = true;
    pl.setVelocity(0);
    G.lock++;
    playBGM("lose");
    bossBar(null);
    this.tweens.add({ targets: pl, angle: 90, alpha: 0.4, duration: 500 });
    await sleep(1300);
    const B = this.curBoss;
    if (B && B.zone !== undefined && this.bossOn) {
      G.lock--;
      const again = await this.retryBoss();
      G.lock++;
      if (again) {
        await fadeTo(1);
        const st0 = stat();
        S.hp = st0.maxhp;
        S.mp = st0.maxmp;
        G.lock--;
        this.trans = true;
        const z = B.zone;
        this.scene.restart({
          map: this.M.id,
          x: z ? z[0] + z[2] / 2 : this.pl.x,
          y: z ? z[1] + z[3] + 40 : this.pl.y + 60,
          dir: "up",
        });
        return;
      }
    }
    await fadeTo(1);
    S.gold = Math.floor(S.gold / 2);
    const st = stat();
    S.hp = st.maxhp;
    S.mp = st.maxmp;
    G.lock--;
    this.trans = true;
    this.scene.restart({
      map: "inn",
      x: 160,
      y: 200,
      dir: "down",
      quiet: true,
      after: async () => {
        await sleep(400);
        await talk("Bu Rina", [
          "Syukurlah kamu sadar! Pemburu menemukanmu pingsan dan membawamu ke sini.",
          "Separuh uangmu hilang entah ke mana... Musuh yang kamu lawan masih menunggu di sana. Siapkan ramuan dan perlengkapan yang lebih kuat, ya.",
        ]);
      },
    });
  },
});
