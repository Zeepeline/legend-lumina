'use strict';
// Pertarungan: serangan, sihir, ramuan, damage, drop, EXP, proyektil, kalah
Object.assign(World.prototype, {
  attack() {
    const pl = this.pl; if (pl.atkCd > 0) return;
    pl.atkCd = .32; pl.atkT = .2; sfx('swing');
    const [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), ox = pl.x + dx * 3, oy = pl.y - 9 + dy * 2;
    const sl = this.add.sprite(ox, oy, 'slash').setOrigin(4 / 28, .5).setRotation(ang).setDepth(pl.y + (dy < 0 ? -2 : 3)).setFlipY(dx < 0);
    sl.play('slash'); sl.once('animationcomplete', () => sl.destroy());
    const tier = { wsword: 0, isword: 1, ssword: 1, csword: 1 }[S.eq.wpn] || 0;
    const sw = this.sword.setTexture('sword' + tier).setVisible(true).setPosition(ox + dx * 2, oy + 2).setRotation(ang - 1.3).setFlipY(dx < 0);
    sw.setTint(S.eq.wpn === 'csword' ? 0x8ae8ff : S.eq.wpn === 'ssword' ? 0xc8d8ff : 0xffffff);
    this.tweens.add({ targets: sw, rotation: ang + 1.2, duration: 150, onComplete: () => sw.setVisible(false) });
    pl.anims.stop(); pl.setFrame((pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir) + '3');
    const hx = pl.x + dx * 14, hy = pl.y - 6 + dy * 13, st = stat();
    for (const e of this.enemies) {
      if (e.hp <= 0) continue; const ey = e.spr.y - e.D.r * e.sc * .8 - (e.D.fly ? 6 : 0);
      if (Math.hypot(e.spr.x - hx, ey - hy) < 15 + e.D.r * e.sc) {
        const crit = Math.random() < .1; const n = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) || 1;
        this.hitEnemy(e, st.atk, crit, (e.spr.x - pl.x) / n, (e.spr.y - pl.y) / n);
      }
    }
  },
  // sihir: arah dari tarikan tombol / arah gerak / musuh terdekat / arah hadap
  aimAngle() {
    const pl = this.pl;
    if (Input.castAng != null) { const a = Input.castAng; Input.castAng = null; return a; }
    const v = Input.vec(); if (Math.hypot(v.x, v.y) > .3) return Math.atan2(v.y, v.x);
    const [fx, fy] = DIRV[pl.dir]; let best = null, bs = 1e9;
    for (const e of this.enemies) { if (e.hp <= 0 || e.faded) continue; const dx = e.spr.x - pl.x, dy = e.spr.y - 6 - (pl.y - 6), d = Math.hypot(dx, dy); if (d > 190) continue; const front = (dx * fx + dy * fy) / d; const score = d - front * 70; if (score < bs) { bs = score; best = e; } }
    if (best) return Math.atan2(best.spr.y - best.D.r * best.sc * .6 - (pl.y - 6), best.spr.x - pl.x);
    return Math.atan2(fy, fx);
  },
  magic() {
    const pl = this.pl, st = stat(); if (pl.atkCd > 0) { Input.castAng = null; return; }
    if (S.mp < 3) { Input.castAng = null; popWorld(pl.x, pl.y - 30, 'MP kurang!', 'mpc'); sfx('buzz'); return; }
    const a = this.aimAngle(), dx = Math.cos(a), dy = Math.sin(a);
    S.mp -= 3; updHud(); pl.atkCd = .4; pl.atkT = .18; sfx('fire');
    pl.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); pl.flipX = pl.dir === 'left';
    const big = S.eq.acc === 'ring';
    const s = this.add.sprite(pl.x + dx * 8, pl.y - 9 + dy * 6, 'fire').play('fire').setRotation(a).setScale(big ? 1.3 : 1);
    this.shots.push({ s, gx: pl.x + dx * 8, gy: pl.y + dy * 6, vx: dx * 200, vy: dy * 200, life: .85, kind: 'fire', dmg: st.mag });
  },
  drink() {
    const st = stat(), id = has('potion') ? 'potion' : has('hipotion') ? 'hipotion' : null;
    if (!id) { popWorld(this.pl.x, this.pl.y - 30, 'Ramuan habis', 'hurt'); sfx('buzz'); return; }
    if (S.hp >= st.maxhp) { popWorld(this.pl.x, this.pl.y - 30, 'HP penuh', 'heal'); return; }
    this.useItem(id);
  },
  useItem(id) {
    const it = ITEMS[id], st = stat();
    if (it.hp) { if (S.hp >= st.maxhp) { sfx('buzz'); return false; } const h = Math.min(it.hp, st.maxhp - S.hp); S.hp += h; popWorld(this.pl.x, this.pl.y - 28, '+' + h, 'heal'); }
    if (it.mp) { if (S.mp >= st.maxmp) { sfx('buzz'); return false; } const h = Math.min(it.mp, st.maxmp - S.mp); S.mp += h; popWorld(this.pl.x, this.pl.y - 28, '+' + h + ' MP', 'mpc'); }
    addItem(id, -1); sfx('heal'); this.sparkle(this.pl.x, this.pl.y - 10, it.mp ? 'dot' : 'dotg'); updHud(); return true;
  },
  hitEnemy(e, base, crit, nx, ny) {
    if (this.pl.dead || e.hp <= 0 || !e.spr.active) return;
    if (e.faded) { popWorld(e.spr.x, e.spr.y - 20, 'tembus!', 'mpc'); return; }
    const dmg = Math.max(1, Math.round(base * rnd(.9, 1.1) * (crit ? 1.7 : 1) - e.D.def * .5));
    e.hp -= dmg; popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 2 - (e.D.fly ? 10 : 0), crit ? dmg + '!' : '' + dmg, crit ? 'crit' : '');
    sfx(crit ? 'crit' : 'hit'); if (crit) shake();
    e.spr.setTintFill(0xffffff); e.flash = .09;
    const heavy = e.boss || e.D.ai === 'golem' || e.D.ai === 'turret';
    const kb = heavy ? (e.D.ai === 'turret' ? 0 : 40) : 175; e.kb = heavy ? .06 : .17; e.kbx = nx * kb; e.kby = ny * kb;
    // squash saat terkena
    this.tweens.add({ targets: e.spr, scaleX: e.sc * 1.2, scaleY: e.sc * .82, duration: 60, yoyo: true });
    if (e.st === 'wind' && !e.boss) e.st = 'chase';
    const sp = this.add.image(e.spr.x + rnd(-3, 3), e.spr.y - e.spr.displayHeight / 2, 'spark').setDepth(e.spr.y + 5); this.tweens.add({ targets: sp, scale: 1.8, alpha: 0, duration: 200, onComplete: () => sp.destroy() });
    if (e.boss) bossBar(e.D.name, e.hp / e.max);
    if (e.hp <= 0) this.killEnemy(e);
  },
  killEnemy(e) {
    e.hp = 0; e.spr.body.enable = false; sfx('die');
    const x = e.spr.x, y = e.spr.y;
    this.sparkle(x, y - 8, 'dot', 14);
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 40, () => this.puff(x + rnd(-8, 8), y - rnd(0, 10)));
    this.tweens.killTweensOf(e.spr);
    this.tweens.add({ targets: e.spr, alpha: 0, scaleX: e.sc * 1.4, scaleY: e.sc * .3, duration: 260, onComplete: () => { e.spr.destroy(); e.sh.destroy(); } });
    const g = ri(...e.D.gold); const nc = Math.min(6, Math.max(1, Math.ceil(g / 3)));
    for (let i = 0; i < nc; i++) this.drop(x, y, 'coin', Math.ceil(g / nc));
    if (e.D.drop && Math.random() < e.D.drop[1]) this.drop(x, y, 'item', e.D.drop[0]);
    if (Math.random() < (e.boss ? 1 : .07)) this.drop(x, y, 'item', 'potion');
    S.kills[e.type] = (S.kills[e.type] || 0) + 1;
    this.gainExp(e.D.exp, x, y);
    if (e.boss) this.bossDown(e); else achCheck(this);
  },
  drop(x, y, kind, val) {
    const s = this.add.sprite(x, y - 4, kind === 'coin' ? 'coin' : 'ic_' + val).setOrigin(.5, 1).setDepth(y); if (kind === 'coin') s.play('coin');
    const tx = x + rnd(-14, 14), ty = y + rnd(-8, 10);
    this.tweens.add({ targets: s, x: tx, duration: 380 }); this.tweens.add({ targets: s, y: { from: y - 4, to: ty - 14 }, duration: 190, ease: 'Quad.out', onComplete: () => this.tweens.add({ targets: s, y: ty, duration: 190, ease: 'Bounce.out' }) });
    this.picks.push({ s, kind, val, t: .45 });
  },
  updPicks(dt) {
    const pl = this.pl;
    for (const p of this.picks) {
      p.t -= dt; if (p.t > 0 || p.got) continue; const dx = pl.x - p.s.x, dy = pl.y - 4 - p.s.y, d = Math.hypot(dx, dy);
      if (d < 38 && !pl.dead) { p.s.x += dx / d * Math.min(d, 170 * dt); p.s.y += dy / d * Math.min(d, 170 * dt); p.s.setDepth(p.s.y); }
      if (d < 7) {
        p.got = true; p.s.destroy();
        if (p.kind === 'coin') { S.gold += p.val; sfx('coin'); popWorld(pl.x, pl.y - 30, '+' + p.val + 'G', 'gold'); }
        else { addItem(p.val); sfx('chest'); popWorld(pl.x, pl.y - 30, '+' + ITEMS[p.val].n, 'heal'); }
        updHud();
      }
    }
    this.picks = this.picks.filter(p => !p.got);
  },
  gainExp(n, x, y) {
    S.exp += n; popWorld(x, y - 22, '+' + n + ' EXP', 'xp');
    let up = false; while (S.exp >= need(S.lv)) { S.exp -= need(S.lv); S.lv++; up = true; }
    if (up) {
      const old = S.lv - 1; let k = 0; for (const J of SKILLS) if (S.lv >= J.lv && !S.flags['sk' + J.lv]) { S.flags['sk' + J.lv] = 1; this.time.delayedCall(1800 + k++ * 2200, () => { banner(J.n, 'JURUS BARU', false, 2000); popWorld(this.pl.x, this.pl.y - 36, J.d, 'xp'); }); }
      const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; sfx('lvl'); banner('LEVEL ' + S.lv + '!', 'NAIK LEVEL', true, 1600);
      const pl = this.pl, g = this.add.graphics().setDepth(pl.y + 2), o = { r: 4 };
      this.tweens.add({ targets: o, r: 34, duration: 600, onUpdate: () => { g.clear(); g.lineStyle(2, 0xffe27a, 1 - o.r / 34).strokeEllipse(pl.x, pl.y - 2, o.r * 2, o.r); }, onComplete: () => g.destroy() });
      this.sparkle(pl.x, pl.y - 12, 'doto', 18);
    }
    updHud();
  },
  hurtPlayer(atk, sx, sy) {
    const pl = this.pl; if (pl.inv > 0 || pl.dead || G.lock > 0 || UIH) return;
    if (pl.dashT > 0) return; if (this.night && isNight()) atk *= 1.15;
    const dmg = Math.max(1, Math.round(atk * rnd(.85, 1.15) - stat().def * .6));
    S.hp = Math.max(0, S.hp - dmg); popWorld(pl.x, pl.y - 28, '-' + dmg, 'hurt'); sfx('hurt');
    pl.inv = 1; const dx = pl.x - sx, dy = pl.y - sy, n = Math.hypot(dx, dy) || 1; pl.kb = .14; pl.kbx = dx / n * 170; pl.kby = dy / n * 170;
    pl.setTintFill(0xff4a4a); this.time.delayedCall(90, () => pl.clearTint());
    this.cameras.main.shake(120, .006); updHud();
    if (S.hp <= 0) this.defeat();
  },
  eShoot(e, kind, angles, dmg, abs) {
    const P = PROJ[kind], s = e.spr, pl = this.pl, base = abs ? 0 : Math.atan2(pl.y - s.y, pl.x - s.x);
    sfx('spore');
    for (const a of angles) {
      const sp = this.add.image(s.x, s.y - 8, P.key);
      this.shots.push({ s: sp, gx: s.x, gy: s.y, vx: Math.cos(base + a) * P.spd, vy: Math.sin(base + a) * P.spd, life: 2.6, kind, dmg, spin: P.spin, enemy: 1 });
    }
  },
  shockwave(x, y, R, atk) {
    sfx('boom'); this.cameras.main.shake(250, .012);
    const g = this.add.graphics().setDepth(y - 1); const o = { r: 6 };
    this.tweens.add({ targets: o, r: R, duration: 300, onUpdate: () => { g.clear(); g.lineStyle(3, 0xfff0b0, 1 - o.r / R * .6).strokeEllipse(x, y, o.r * 2, o.r * 1.2); g.lineStyle(1, 0xffffff, .8).strokeEllipse(x, y, o.r * 1.6, o.r * .9); }, onComplete: () => g.destroy() });
    const p = this.add.particles(x, y, 'smoke', { lifespan: 600, speed: { min: 30, max: 70 }, angle: { min: 160, max: 380 }, scale: { start: .8, end: 1.6 }, alpha: { start: .6, end: 0 }, emitting: false, tint: 0xd8c8a0 }).setDepth(y + 1); p.explode(14); this.time.delayedCall(700, () => p.destroy());
    const pl = this.pl; if (Math.hypot(pl.x - x, (pl.y - y) * 1.5) < R) this.hurtPlayer(atk, x, y);
  },
  updShots(dt, locked) {
    if (locked) return;
    for (const p of this.shots) {
      p.life -= dt; p.gx += p.vx * dt; p.gy += p.vy * dt; p.s.setPosition(p.gx, p.gy - 9).setDepth(p.gy + 2);
      if (p.spin) p.s.rotation += dt * 14;
      let dead = p.life <= 0;
      if (!dead && this.physics.overlapRect(p.gx - 2, p.gy - 3, 4, 4, false, true).length) dead = true;
      if (!dead && p.kind === 'fire') for (const e of this.enemies) { if (e.hp > 0 && Math.hypot(e.spr.x - p.gx, e.spr.y - e.D.r * e.sc * .7 - (e.D.fly ? 6 : 0) - (p.gy - 4)) < e.D.r * e.sc + 6) { const n = Math.hypot(p.vx, p.vy); this.hitEnemy(e, p.dmg, false, p.vx / n, p.vy / n); dead = true; break; } }
      if (!dead && p.enemy && Math.hypot(this.pl.x - p.gx, this.pl.y - 4 - p.gy) < 8) { this.hurtPlayer(p.dmg, p.gx - p.vx, p.gy - p.vy); dead = true; }
      if (dead) { p.dead = true; p.s.destroy(); if (p.kind === 'fire') this.sparkle(p.gx, p.gy - 8, 'doto', 8); }
    }
    this.shots = this.shots.filter(p => !p.dead);
  },
  async defeat() {
    const pl = this.pl; pl.dead = true; pl.setVelocity(0); G.lock++; playBGM('lose'); bossBar(null);
    this.tweens.add({ targets: pl, angle: 90, alpha: .4, duration: 500 });
    await sleep(1300); await fadeTo(1);
    S.gold = Math.floor(S.gold / 2); const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp;
    G.lock--; this.trans = true;
    this.scene.restart({ map: 'inn', x: 160, y: 200, dir: 'down', quiet: true, after: async () => { await sleep(400); await talk('Bu Rina', ['Syukurlah kamu sadar! Pemburu menemukanmu pingsan dan membawamu ke sini.', 'Separuh uangmu hilang entah ke mana... Musuh yang kamu lawan masih menunggu di sana. Siapkan ramuan dan perlengkapan yang lebih kuat, ya.']); } });
  },
});
