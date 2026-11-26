"use strict"; // Pertarungan (bagian 2): hit-stop, damage musuh, musuh tumbang, drop & pungut barang
Object.assign(World.prototype, {
  // Bekukan dunia sebentar (detik) agar pukulan terasa berat. Getar HP jika didukung.
  hitStop(sec, vib = 0) {
    if (G.title || this.pl.dead) return;
    this.hsT = Math.max(this.hsT, sec);
    this.physics.pause();
    this.anims.pauseAll();
    this.tweens.timeScale = 0.05;
    if (vib && OPT.vib && navigator.vibrate)
      try {
        navigator.vibrate(vib);
      } catch (_) {}
  },
  hitEnemy(e, base, crit, nx, ny) {
    if (this.pl.dead || e.hp <= 0 || !e.spr.active) return;
    if (e.faded) {
      popWorld(e.spr.x, e.spr.y - 20, "tembus!", "mpc");
      return;
    }
    const hasPoise = e.D.r >= 12 || e.elite || e.boss;
    if (hasPoise && e.poise == null) e.poise = e.boss || e.elite ? 5 : 3;
    const isStagger = (e.staggerT || 0) > 0;
    let dmg = Math.max(
      1,
      Math.round(base * rnd(0.9, 1.1) * (crit ? 1.7 : 1) - e.D.def * 0.5),
    );
    if (isStagger) dmg = Math.round(dmg * 1.25);
    let label = OPT.colorblind
      ? crit
        ? `[KRIT!] ${dmg}`
        : `${dmg}`
      : crit
        ? dmg + "!"
        : "" + dmg;
    let style = crit ? "crit" : "";
    e.hp -= dmg;
    popWorld(
      e.spr.x,
      e.spr.y - e.spr.displayHeight - 2 - (e.D.fly ? 10 : 0),
      label,
      style,
    );
    sfx(crit ? "crit" : "hit");
    if (crit) shake();
    const fatal = e.hp <= 0;
    const isComboFin = this.pl?.combo === 5 || this.pl?.combo === 3;
    const hsDur =
      e.boss && fatal
        ? 0.24
        : fatal
          ? 0.14
          : crit
            ? 0.12
            : isComboFin
              ? 0.095
              : 0.065;
    const hsVib = fatal || crit ? 35 : isComboFin ? 24 : 14;
    this.hitStop(hsDur, hsVib);
    if (crit || fatal || e.boss || isComboFin)
      this.camShake(
        fatal ? 120 : crit || isComboFin ? 80 : 50,
        fatal ? 0.005 : 0.003,
      );
    e.spr.setTintFill(0xffffff);
    e.flash = 0.09;
    let breakPoise = false;
    if (hasPoise && !isStagger) {
      e.poise--;
      if (e.poise <= 0) {
        breakPoise = true;
        e.staggerT = 0.8;
        e.hurtT = 0.8;
        popWorld(e.spr.x, e.spr.y - 24, "TERHUYUNG!", "crit");
        sfxAt("crit", e.spr.x, e.spr.y, this);
        this.time.delayedCall(800, () => {
          if (e.hp > 0) e.poise = e.boss || e.elite ? 5 : 3;
        });
      }
    }
    const heavy = e.boss || e.D.ai === "golem" || e.D.ai === "turret";
    const canKb = !hasPoise || breakPoise || isStagger;
    if (canKb) {
      const wt = (ITEMS[S.eq.wpn] || {}).wt || "sword";
      const wMul = wt === "axe" ? 1.4 : wt === "spear" ? 1.15 : 1;
      const kbScale = Math.max(0.3, wMul / (1 + Math.max(0, e.D.r - 8) / 10));
      const kb = (heavy ? (e.D.ai === "turret" ? 0 : 40) : 175) * kbScale;
      e.kb = heavy ? 0.06 : 0.17;
      e.kbx = nx * kb;
      e.kby = ny * kb;
    } else {
      e.kb = 0;
    }
    // Reaksi badan elastis (squash membal berbobot)
    const baseSc = e.sc || 1;
    this.tweens.add({
      targets: e.spr,
      scaleX: baseSc * 1.32,
      scaleY: baseSc * 0.72,
      duration: 55,
      yoyo: true,
      ease: "Quad.easeOut",
      onComplete: () => {
        if (e.spr && e.spr.active) {
          e.spr.scaleX = baseSc;
          e.spr.scaleY = baseSc;
        }
      },
    });
    if (e.st === "wind" && !e.boss && canKb) e.st = "chase";
    const isHd = [
      "slime_hd",
      "wolf_hd",
      "wolf_elite_hd",
      "goblin_hd",
      "goblin_archer_hd",
      "goblin_shaman",
    ].includes(e.D?.tex);
    if (isHd && e.spr?.anims && e.hp > 0 && canKb) {
      e.hurtT = 0.32;
      e.spr.play(e.D.tex + "_hurt", true);
    }
    if (e.boss) bossBar(e.D.name, e.hp / e.max);
    if (e.hp <= 0) this.killEnemy(e);
  },
  killEnemy(e) {
    // Mekanik Kerangka Bangkit Kembali (#208)
    if (
      e.type === "skel" &&
      !e.hasReanimated &&
      (!this.curElem || this.curElem !== "fire")
    ) {
      e.hasReanimated = true;
      e.reanimating = 3.5;
      e.hp = 0;
      e.spr.body.enable = false;
      e.spr.setTint(0xcccccc);
      sfxAt("hit", e.spr.x, e.spr.y, this);
      popWorld(e.spr.x, e.spr.y - 16, "💀 Tulang Bergetar...", "crit");
      this.tweens.add({
        targets: e.spr,
        scaleY: e.sc * 0.4,
        scaleX: e.sc * 1.3,
        duration: 200,
        yoyo: true,
        repeat: 6,
      });
      this.time.delayedCall(3500, () => {
        if (e.spr && e.spr.active && e.reanimating > 0) {
          e.reanimating = 0;
          e.hp = Math.floor(e.maxhp * 0.5);
          e.spr.body.enable = true;
          e.spr.clearTint();
          sfxAt("magic", e.spr.x, e.spr.y, this);
          this.sparkle(e.spr.x, e.spr.y - 10, "spark", 12);
          popWorld(e.spr.x, e.spr.y - 20, "💀 BANGKIT KEMBALI!", "crit");
        }
      });
      return;
    }
    e.hp = 0;
    e.spr.body.enable = false;
    sfxAt("die", e.spr.x, e.spr.y, this);
    const x = e.spr.x,
      y = e.spr.y;
    this.sparkle(x, y - 8, "dot", 14);
    for (let i = 0; i < 4; i++)
      this.time.delayedCall(i * 40, () =>
        this.puff(x + rnd(-8, 8), y - rnd(0, 10)),
      );
    this.tweens.killTweensOf(e.spr);
    const isDeadHd =
      (e.D?.tex && e.D.tex.startsWith("slime_hd")) ||
      [
        "wolf_hd",
        "wolf_elite_hd",
        "goblin_hd",
        "goblin_archer_hd",
        "goblin_shaman",
      ].includes(e.D?.tex);
    if (!e.boss) {
      /* musuh biasa: membeku jadi putih lalu pudar (tanpa animasi mati, hemat aset) */
      const s = e.spr;
      s.anims?.stop();
      s.setTintFill(0xffffff);
      e.sh?.setVisible(false);
      this.tweens.add({
        targets: s,
        alpha: 0,
        scaleX: e.sc * 1.12,
        scaleY: e.sc * 1.12,
        y: s.y - 3,
        duration: 380,
        delay: 90,
        ease: "Quad.easeIn",
        onComplete: () => {
          s.destroy();
          e.sh?.destroy();
        },
      });
    } else if (isDeadHd && e.spr?.anims) {
      e.spr.play(e.D.tex + "_die", true);
      this.time.delayedCall(650, () => {
        if (e.spr?.active) {
          e.spr.destroy();
          e.sh?.destroy();
        }
      });
    } else {
      this.tweens.add({
        targets: e.spr,
        alpha: 0,
        scaleX: e.sc * 1.4,
        scaleY: e.sc * 0.3,
        duration: 260,
        onComplete: () => {
          e.spr.destroy();
          e.sh.destroy();
        },
      });
    }
    const isNight = e.nightVariant || S.time >= 19 || S.time < 5;
    const goldMultiplier = isNight ? 1.35 : 1;
    const expMultiplier = isNight ? 1.3 : 1;
    const g = Math.round(ri(...e.D.gold) * goldMultiplier);
    const nc = Math.min(6, Math.max(1, Math.ceil(g / 3)));
    for (let i = 0; i < nc; i++) this.drop(x, y, "coin", Math.ceil(g / nc));
    if (e.D.drop && Math.random() < e.D.drop[1])
      this.drop(x, y, "item", e.D.drop[0]);
    if (Math.random() < (e.boss ? 1 : 0.07)) this.drop(x, y, "item", "potion");
    if (e.elite) {
      this.drop(x, y, "item", ELITE_LOOT[ri(0, ELITE_LOOT.length - 1)]);
      popWorld(x, y - 30, "Elit tumbang!", "crit");
      S.elites = (S.elites || 0) + 1;
      if (!S.tmap && Math.random() < 0.25) this.giveTreasureMap();
    }
    if (e.mk) e.mk.destroy();
    if (e.aura) e.aura.destroy();
    S.kills[e.type] = (S.kills[e.type] || 0) + 1;
    // Rekap statistik kill (Fitur #25 & #18)
    S.st = S.st || {};
    S.st.kills = (S.st.kills || 0) + 1;
    if (e.boss) S.st.bosses = (S.st.bosses || 0) + 1;
    if (e.D && e.D.isBounty && !S.bountiesDone[e.type]) {
      S.bountiesDone[e.type] = true;
      const bData =
        typeof CITY_BOUNTIES !== "undefined"
          ? CITY_BOUNTIES.find((b) => b.id === e.type)
          : null;
      const rew = bData ? bData.rew : 200;
      S.gold += rew;
      sfx("fanfare");
      banner(`${e.D.name} Tumbang!`, "BURONAN DITAKLUKKAN", true, 2500);
      popWorld(x, y - 36, `+${rew} G Hadiah Buronan!`, "gold");
    }
    if (typeof checkTitles === "function") checkTitles();
    this.gainExp(Math.round(e.D.exp * expMultiplier), x, y);
    // Raja Slime Membelah Diri (#197)
    if (e.type === "king_slime") {
      sfxAt("magic", x, y, this);
      popWorld(x, y - 24, "💧 MEMBELAH DIRI!", "crit");
      this.time.delayedCall(200, () => {
        for (const [ox, oy] of [
          [-16, -10],
          [16, -10],
          [0, 14],
        ])
          this.spawnEnemy("slime", x + ox, y + oy);
      });
    }
    if (e.boss) this.bossDown(e);
    else achCheck(this);
  },
  drop(x, y, kind, val) {
    const s = this.add
      .sprite(x, y - 4, kind === "coin" ? "coin" : "ic_" + val)
      .setOrigin(0.5, 1)
      .setDepth(y);
    if (kind === "coin") s.play("coin");
    const tx = x + rnd(-14, 14),
      ty = y + rnd(-8, 10);
    this.tweens.add({ targets: s, x: tx, duration: 380, ease: "Cubic.out" });
    this.tweens.add({
      targets: s,
      y: { from: y - 4, to: ty - 16 },
      duration: 180,
      ease: "Quad.out",
      onComplete: () => {
        this.tweens.add({
          targets: s,
          y: ty,
          duration: 180,
          ease: "Bounce.out",
          onComplete: () => {
            this.tweens.add({
              targets: s,
              scaleX: 1.25,
              scaleY: 0.78,
              duration: 60,
              yoyo: true,
            });
          },
        });
      },
    });
    this.picks.push({ s, kind, val, t: 0.45 });
  },
  updPicks(dt) {
    const pl = this.pl,
      magnetRadius = 70;
    for (const p of this.picks) {
      p.t -= dt;
      if (p.t > 0 || p.got) continue;
      const dx = pl.x - p.s.x,
        dy = pl.y - 4 - p.s.y,
        d = Math.hypot(dx, dy);
      if (d < magnetRadius && !pl.dead) {
        const pullSpeed = 120 + (1 - d / magnetRadius) * 200,
          cv = Math.sin((p.s.x + p.s.y) * 0.05) * 26 * dt;
        p.s.x += (dx / d) * Math.min(d, pullSpeed * dt) - (dy / d) * cv;
        p.s.y += (dy / d) * Math.min(d, pullSpeed * dt) + (dx / d) * cv;
        p.s.setDepth(p.s.y);
      }
      if (d < 12) {
        p.got = true;
        p.s.destroy();
        const now = this.t || 0,
          semi =
            !this._pickT || now - this._pickT > 0.8
              ? (this._pickN = 0)
              : Math.min(8, ++this._pickN);
        this._pickT = now;
        const r = 1 + semi * 0.06;
        if (p.kind === "coin") {
          S.gold += p.val;
          sfx("coin", r);
          popWorld(pl.x, pl.y - 30, "+" + p.val + "G", "gold");
        } else {
          addItem(p.val);
          sfx("chest", r);
          popWorld(pl.x, pl.y - 30, "+" + (ITEMS[p.val]?.n || p.val), "heal");
        }
        updHud();
      }
    }
    this.picks = this.picks.filter((p) => !p.got);
  },
});
