'use strict';
// Pertarungan: serangan, sihir, ramuan, damage, drop, EXP, proyektil, kalah
// pts: titik kena [jarak dari pemain, radius]; mul: pengali damage; kb: pengali dorongan
const WEAPON_STYLE = {
  sword: { cd: .32, lock: .2, pts: [[14, 15]], mul: 1, crit: .1, kb: 1, fxs: 1 },
  spear: { cd: .38, lock: .22, pts: [[12, 9], [22, 9], [31, 9]], mul: 1, crit: .12, kb: .7, fxs: 1 },
  axe: { cd: .62, lock: .34, pts: [[13, 21]], mul: 1.25, crit: .18, kb: 1.6, fxs: 1.45, delay: 110 },
  bow: { cd: .42, lock: .16 },
};
Object.assign(World.prototype, {
  // Gaya serang per jenis senjata (ITEMS[..].wt): sword (default), spear, axe, bow
  attack() {
    const pl = this.pl; if (pl.atkCd > 0) return;
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword', W = WEAPON_STYLE[wt];
    pl.atkCd = W.cd; pl.atkT = W.lock; sfx(wt === 'bow' ? 'jump' : 'swing');
    if (wt === 'bow') return this.shootArrow();
    // kombo 3 pukulan (#2): ketuk beruntun, pukulan ke-3 lebih kuat & mendorong jauh
    pl.combo = this.t - (pl.lastAtk || -9) < W.cd + .45 ? (pl.combo || 0) % 3 + 1 : 1; pl.lastAtk = this.t;
    const fin = pl.combo === 3, cMul = fin ? 1.6 : pl.combo === 2 ? 1.1 : 1, cKb = fin ? 1.9 : 1;
    if (fin) { pl.atkCd += .18; this.time.delayedCall(40, () => sfx('crit')); popWorld(pl.x, pl.y - 30, 'KOMBO!', 'crit'); }
    const [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), ox = pl.x + dx * 3, oy = pl.y - 9 + dy * 2;
    if (wt !== 'spear') {
      const sl = this.add.sprite(ox, oy, 'slash').setOrigin(4 / 28, .5).setRotation(ang).setDepth(pl.y + (dy < 0 ? -2 : 3)).setFlipY((dx < 0) !== (pl.combo === 2)).setScale(W.fxs * (fin ? 1.35 : 1)); if (fin) sl.setTint(0xffe08a);
      sl.play('slash'); sl.once('animationcomplete', () => sl.destroy());
    }
    const tier = { wsword: 0 }[S.eq.wpn] ?? 1;
    const sw = this.sword.setTexture(wt === 'spear' ? 'wspear' : wt === 'axe' ? 'waxe' : 'sword' + tier).setVisible(true).setPosition(ox + dx * 2, oy + 2).setFlipY(dx < 0).setDepth(pl.y + (dy < 0 ? -3 : 4));
    sw.setTint(S.eq.wpn === 'csword' ? 0x8ae8ff : S.eq.wpn === 'ssword' ? 0xc8d8ff : 0xffffff);
    if (wt === 'spear') { sw.setRotation(ang).setPosition(ox - dx * 6, oy + 2); this.tweens.add({ targets: sw, x: ox + dx * 10, y: oy + 2 + dy * 10, duration: 90, yoyo: true, onComplete: () => sw.setVisible(false) }); }
    else { sw.setRotation(ang - (wt === 'axe' ? 1.8 : 1.3)); this.tweens.add({ targets: sw, rotation: ang + (wt === 'axe' ? 1.8 : 1.2), duration: wt === 'axe' ? 230 : 150, ease: wt === 'axe' ? 'Quad.easeIn' : 'Linear', onComplete: () => sw.setVisible(false) }); }
    pl.anims.stop(); pl.setFrame((pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir) + '3');
    const st = stat(), hit = new Set();
    const doHit = () => {
      for (const [k, r] of W.pts) {
        const hx = pl.x + dx * k, hy = pl.y - 6 + dy * k;
        for (const e of this.enemies) {
          if (e.hp <= 0 || hit.has(e)) continue; const ey = e.spr.y - e.D.r * e.sc * .8 - (e.D.fly ? 6 : 0);
          if (Math.hypot(e.spr.x - hx, ey - hy) < r + e.D.r * e.sc) {
            hit.add(e); const crit = Math.random() < W.crit + (st.crit || 0); const n = Math.hypot(e.spr.x - pl.x, e.spr.y - pl.y) || 1;
            // Deteksi Serangan dari Belakang / Backstab (#13)
            let isBackstab = false;
            if (e.dir && pl.dir) {
              const eDirV = DIRV[e.dir] || [0, 1], plDirV = DIRV[pl.dir] || [0, 1];
              // Menghadap ke arah yang hampir sama (musuh membelakangi Arka)
              if (eDirV[0] === plDirV[0] && eDirV[1] === plDirV[1]) {
                isBackstab = true;
              }
            }
            const curWpnId = S.eq?.wpn; // dipakai efek Belati Rembulan, permata & senjata legendaris di bawah
            // Belati Rembulan Danau (selalu kritikal saat malam)
            const isNightTime = S.time >= 19 || S.time < 5;
            if (curWpnId === 'leg_moon' && isNightTime) {
              isBackstab = true;
            }
            const finalCrit = crit || isBackstab;
            const finalDmg = st.atk * W.mul * cMul * (isBackstab ? 1.8 : 1);
            if (isBackstab && e.hp > 0) {
              popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 16, 'PUNGGUNG!', 'crit');
              sfx('crit');
            }
            this.hitEnemy(e, finalDmg, finalCrit, (e.spr.x - pl.x) / n * W.kb * cKb, (e.spr.y - pl.y) / n * W.kb * cKb);
            const frz = (ITEMS[S.eq.wpn] || {}).frz; if (frz && Math.random() < frz) this.freezeEnemy(e, 1.2);
            // Efek Permata Senjata (#23)
            const curGem = curWpnId && S.socket && S.socket[curWpnId];
            // Efek Senjata Legendaris (#33)
            if (curWpnId === 'leg_sun') {
              this.sparkle(e.spr.x, e.spr.y - 10, 'doto', 6);
              if (typeof applyStatus === 'function') applyStatus(e, 'burn', 3);
            } else if (curWpnId === 'leg_quake') {
              this.camShake(100, .005);
              sfx('boom');
            }
            if (curGem === 'shard' && Math.random() < 0.25) {
              this.freezeEnemy(e, 1.2);
            } else if (curGem === 'spore' && typeof applyStatus === 'function') {
              applyStatus(e, 'poison', 4);
            } else if (curGem === 'amethyst_gem' && finalCrit) {
              const healAmt = 3;
              S.hp = Math.min(stat().maxhp, S.hp + healAmt);
              popWorld(pl.x, pl.y - 20, `+${healAmt} HP (Hisap)`, 'heal');
              updHud();
            }
          }
        }
      }
    };
    if (W.delay) this.time.delayedCall(W.delay, doHit); else doHit();
  },
  shootArrow() {
    const pl = this.pl, st = stat(), a = this.aimAngle(), dx = Math.cos(a), dy = Math.sin(a);
    pl.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); pl.flipX = pl.dir === 'left';
    pl.anims.stop(); pl.setFrame((pl.dir === 'left' || pl.dir === 'right' ? 'side' : pl.dir) + '3');
    const b = this.sword.setTexture('wbow').setVisible(true).setPosition(pl.x + dx * 6, pl.y - 9 + dy * 4).setRotation(a).setFlipY(false).clearTint().setDepth(pl.y + (dy < 0 ? -3 : 4));
    this.time.delayedCall(180, () => b.setVisible(false));
    const s = this.add.image(pl.x + dx * 8, pl.y - 9 + dy * 6, 'arrow').setRotation(a);
    const sharp = has('sarrow'); if (sharp) { addItem('sarrow', -1); s.setTint(0xffe08a); }
    const isShadowBow = S.eq?.wpn === 'leg_shadow';
    if (isShadowBow) s.setTint(0xc8a0ff);
    this.shots.push({ s, gx: pl.x + dx * 8, gy: pl.y + dy * 6, vx: dx * 270, vy: dy * 270, life: .7, kind: 'arrow', mine: 1, dmg: st.atk * .8 * (sharp ? 1.6 : 1), pierce: sharp || isShadowBow });
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
    if (!S.spell || !learned(S.spell)) { Input.castAng = null; popWorld(pl.x, pl.y - 30, 'Belum bisa sihir', 'xp'); sfx('buzz'); return; }
    if (S.spell === 'nova') { Input.castAng = null; return this.nova(); }
    if (S.spell !== 'fire') { Input.castAng = null; return this.castSpell(S.spell); }
    if (S.mp < 3) { Input.castAng = null; popWorld(pl.x, pl.y - 30, 'MP kurang!', 'mpc'); sfx('buzz'); return; }
    const a = this.aimAngle(), dx = Math.cos(a), dy = Math.sin(a);
    S.mp -= 3; updHud(); pl.atkCd = .4; pl.atkT = .18; sfx('fire');
    pl.dir = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up'); pl.flipX = pl.dir === 'left';
    const big = S.eq.acc === 'ring';
    const s = this.add.sprite(pl.x + dx * 8, pl.y - 9 + dy * 6, 'fire').play('fire').setRotation(a).setScale(big ? 1.3 : 1);
    this.shots.push({ s, gx: pl.x + dx * 8, gy: pl.y + dy * 6, vx: dx * 200, vy: dy * 200, life: .85, kind: 'fire', mine: 1, dmg: st.mag * (1 + .25 * (tierOf('fire') - 1)) }); s.setScale(1 + .15 * (tierOf('fire') - 1)); useJurus(this, 'fire');
  },
  drink() {
    const st = stat(), id = has('potion') ? 'potion' : has('hipotion') ? 'hipotion' : null;
    if (!id) { popWorld(this.pl.x, this.pl.y - 30, 'Ramuan habis', 'hurt'); sfx('buzz'); return; }
    if (S.hp >= st.maxhp) { popWorld(this.pl.x, this.pl.y - 30, 'HP penuh', 'heal'); return; }
    this.useItem(id);
  },
  useItem(id) {
    const it = ITEMS[id], st = stat(); if (it.tool) return this.useTool(id);
    if (it.hp) { if (S.hp >= st.maxhp && !it.buff) { sfx('buzz'); return false; } const h = Math.min(it.hp, st.maxhp - S.hp); S.hp += h; popWorld(this.pl.x, this.pl.y - 28, '+' + h, 'heal'); }
    if (it.mp) { if (S.mp >= st.maxmp && !it.buff) { sfx('buzz'); return false; } const h = Math.min(it.mp, st.maxmp - S.mp); S.mp += h; popWorld(this.pl.x, this.pl.y - 28, '+' + h + ' MP', 'mpc'); }
    if (it.buff) { for (const [k, sec] of it.buff) S.buff[k] = Math.max(S.buff[k] || 0, sec); popWorld(this.pl.x, this.pl.y - 40, it.buff.map(([k]) => BUFF[k].n).join(' & ') + '!', 'xp'); updStatusHud(this); }
    if (it.cure) { if (!Object.keys(this.pst).length && !it.hp) { sfx('buzz'); return false; } this.cure(); popWorld(this.pl.x, this.pl.y - 40, 'pulih!', 'heal'); }
    addItem(id, -1); sfx('heal'); this.sparkle(this.pl.x, this.pl.y - 10, it.mp ? 'dot' : 'dotg'); updHud(); return true;
  },
  // Bekukan dunia sebentar (detik) agar pukulan terasa berat. Getar HP jika didukung.
  hitStop(sec, vib = 0) {
    if (G.title || this.pl.dead) return;
    this.hsT = Math.max(this.hsT, sec); this.physics.pause(); this.anims.pauseAll(); this.tweens.timeScale = .05;
    if (vib && OPT.vib && navigator.vibrate) try { navigator.vibrate(vib); } catch (_) { }
  },
  hitEnemy(e, base, crit, nx, ny) {
    if (this.pl.dead || e.hp <= 0 || !e.spr.active) return;
    if (e.faded) { popWorld(e.spr.x, e.spr.y - 20, 'tembus!', 'mpc'); return; }
    const hasPoise = (e.D.r >= 12 || e.elite || e.boss);
    if (hasPoise && e.poise == null) e.poise = (e.boss || e.elite) ? 5 : 3;
    const isStagger = (e.staggerT || 0) > 0;
    let dmg = Math.max(1, Math.round(base * rnd(.9, 1.1) * (crit ? 1.7 : 1) - e.D.def * .5));
    if (isStagger) dmg = Math.round(dmg * 1.25);
    let label = (OPT.colorblind ? (crit ? `[KRIT!] ${dmg}` : `${dmg}`) : (crit ? dmg + '!' : '' + dmg));
    let style = crit ? 'crit' : '';
    e.hp -= dmg; popWorld(e.spr.x, e.spr.y - e.spr.displayHeight - 2 - (e.D.fly ? 10 : 0), label, style);
    sfx(crit ? 'crit' : 'hit'); if (crit) shake();
    const fatal = e.hp <= 0;
    this.hitStop(e.boss && fatal ? .22 : fatal || crit ? .085 : .045, crit || fatal ? 25 : 12);
    if (crit || fatal || e.boss) this.camShake(fatal ? 110 : 80, fatal ? .005 : .003);
    e.spr.setTintFill(0xffffff); e.flash = .09;
    let breakPoise = false;
    if (hasPoise && !isStagger) {
      e.poise--;
      if (e.poise <= 0) {
        breakPoise = true; e.staggerT = 0.8; e.hurtT = 0.8;
        popWorld(e.spr.x, e.spr.y - 24, 'TERHUYUNG!', 'crit'); sfxAt('crit', e.spr.x, e.spr.y, this);
        this.time.delayedCall(800, () => { if (e.hp > 0) e.poise = (e.boss || e.elite) ? 5 : 3; });
      }
    }
    const heavy = e.boss || e.D.ai === 'golem' || e.D.ai === 'turret';
    const canKb = !hasPoise || breakPoise || isStagger;
    if (canKb) {
      const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
      const wMul = wt === 'axe' ? 1.4 : wt === 'spear' ? 1.15 : 1;
      const kbScale = Math.max(0.3, wMul / (1 + Math.max(0, (e.D.r - 8)) / 10));
      const kb = (heavy ? (e.D.ai === 'turret' ? 0 : 40) : 175) * kbScale;
      e.kb = heavy ? .06 : .17; e.kbx = nx * kb; e.kby = ny * kb;
    } else { e.kb = 0; }
    // squash saat terkena
    this.tweens.add({ targets: e.spr, scaleX: e.sc * 1.2, scaleY: e.sc * .82, duration: 60, yoyo: true });
    if (e.st === 'wind' && !e.boss && canKb) e.st = 'chase';
    const isHd = e.D?.tex === 'slime_hd' || e.D?.tex === 'wolf_hd' || e.D?.tex === 'wolf_elite_hd' ||
      e.D?.tex === 'goblin_hd' || e.D?.tex === 'goblin_archer_hd';
    if (isHd && e.spr?.anims && e.hp > 0 && canKb) {
      e.hurtT = 0.32; e.spr.play(e.D.tex + '_hurt', true);
    }
    const sp = this.add.image(e.spr.x + rnd(-3, 3), e.spr.y - e.spr.displayHeight / 2, 'spark').setDepth(e.spr.y + 5);
    this.tweens.add({ targets: sp, scale: 1.8, alpha: 0, duration: 200, onComplete: () => sp.destroy() });
    if (e.boss) bossBar(e.D.name, e.hp / e.max);
    if (e.hp <= 0) this.killEnemy(e);
  },
  killEnemy(e) {
    // Mekanik Kerangka Bangkit Kembali (#208)
    if (e.type === 'skel' && !e.hasReanimated && (!this.curElem || this.curElem !== 'fire')) {
      e.hasReanimated = true;
      e.reanimating = 3.5;
      e.hp = 0;
      e.spr.body.enable = false;
      e.spr.setTint(0xcccccc);
      sfxAt('hit', e.spr.x, e.spr.y, this);
      popWorld(e.spr.x, e.spr.y - 16, '💀 Tulang Bergetar...', 'crit');
      this.tweens.add({ targets: e.spr, scaleY: e.sc * 0.4, scaleX: e.sc * 1.3, duration: 200, yoyo: true, repeat: 6 });
      this.time.delayedCall(3500, () => {
        if (e.spr && e.spr.active && e.reanimating > 0) {
          e.reanimating = 0;
          e.hp = Math.floor(e.maxhp * 0.5);
          e.spr.body.enable = true;
          e.spr.clearTint();
          sfxAt('magic', e.spr.x, e.spr.y, this);
          this.sparkle(e.spr.x, e.spr.y - 10, 'spark', 12);
          popWorld(e.spr.x, e.spr.y - 20, '💀 BANGKIT KEMBALI!', 'crit');
        }
      });
      return;
    }
    e.hp = 0; e.spr.body.enable = false; sfxAt('die', e.spr.x, e.spr.y, this);
    const x = e.spr.x, y = e.spr.y;
    this.sparkle(x, y - 8, 'dot', 14);
    for (let i = 0; i < 4; i++) this.time.delayedCall(i * 40, () => this.puff(x + rnd(-8, 8), y - rnd(0, 10)));
    this.tweens.killTweensOf(e.spr);
    const isDeadHd = e.D?.tex === 'slime_hd' || e.D?.tex === 'wolf_hd' || e.D?.tex === 'wolf_elite_hd' ||
      e.D?.tex === 'goblin_hd' || e.D?.tex === 'goblin_archer_hd';
    if (isDeadHd && e.spr?.anims) {
      e.spr.play(e.D.tex + '_die', true);
      this.time.delayedCall(650, () => { if (e.spr?.active) { e.spr.destroy(); e.sh?.destroy(); } });
    } else {
      this.tweens.add({
        targets: e.spr, alpha: 0, scaleX: e.sc * 1.4, scaleY: e.sc * .3, duration: 260,
        onComplete: () => { e.spr.destroy(); e.sh.destroy(); }
      });
    }
    const isNight = e.nightVariant || (S.time >= 19 || S.time < 5);
    const goldMultiplier = isNight ? 1.35 : 1;
    const expMultiplier = isNight ? 1.3 : 1;
    const g = Math.round(ri(...e.D.gold) * goldMultiplier); const nc = Math.min(6, Math.max(1, Math.ceil(g / 3)));
    for (let i = 0; i < nc; i++) this.drop(x, y, 'coin', Math.ceil(g / nc));
    if (e.D.drop && Math.random() < e.D.drop[1]) this.drop(x, y, 'item', e.D.drop[0]);
    if (Math.random() < (e.boss ? 1 : .07)) this.drop(x, y, 'item', 'potion');
    if (e.elite) { this.drop(x, y, 'item', ELITE_LOOT[ri(0, ELITE_LOOT.length - 1)]); popWorld(x, y - 30, 'Elit tumbang!', 'crit'); S.elites = (S.elites || 0) + 1; if (!S.tmap && Math.random() < .25) this.giveTreasureMap(); }
    if (e.mk) e.mk.destroy(); if (e.aura) e.aura.destroy();
    S.kills[e.type] = (S.kills[e.type] || 0) + 1;
    // Rekap statistik kill (Fitur #25 & #18)
    S.st = S.st || {}; S.st.kills = (S.st.kills || 0) + 1;
    if (e.boss) S.st.bosses = (S.st.bosses || 0) + 1;
    if (e.D && e.D.isBounty && !S.bountiesDone[e.type]) {
      S.bountiesDone[e.type] = true;
      const bData = (typeof CITY_BOUNTIES !== 'undefined') ? CITY_BOUNTIES.find(b => b.id === e.type) : null;
      const rew = bData ? bData.rew : 200;
      S.gold += rew;
      sfx('fanfare');
      banner(`${e.D.name} Tumbang!`, 'BURONAN DITAKLUKKAN', true, 2500);
      popWorld(x, y - 36, `+${rew} G Hadiah Buronan!`, 'gold');
    }
    if (typeof checkTitles === 'function') checkTitles();
    this.gainExp(Math.round(e.D.exp * expMultiplier), x, y);
    // Raja Slime Membelah Diri (#197)
    if (e.type === 'king_slime') {
      sfxAt('magic', x, y, this);
      popWorld(x, y - 24, '💧 MEMBELAH DIRI!', 'crit');
      this.time.delayedCall(200, () => {
        this.spawnEnemy('slime', x - 16, y - 10);
        this.spawnEnemy('slime', x + 16, y - 10);
        this.spawnEnemy('slime', x, y + 14);
      });
    }
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
    // Magnet Rampasan Koin & Material Otomatis (#169)
    // Radius magnet dasar 70 px
    const magnetRadius = 70;
    for (const p of this.picks) {
      p.t -= dt; if (p.t > 0 || p.got) continue; const dx = pl.x - p.s.x, dy = pl.y - 4 - p.s.y, d = Math.hypot(dx, dy);
      if (d < magnetRadius && !pl.dead) {
        const pullSpeed = d < 38 ? 200 : 140;
        p.s.x += dx / d * Math.min(d, pullSpeed * dt);
        p.s.y += dy / d * Math.min(d, pullSpeed * dt);
        p.s.setDepth(p.s.y);
      }
      if (d < 12) {
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
    let up = false; while (S.exp >= need(S.lv)) { S.exp -= need(S.lv); S.lv++; up = true; } if (up) { attrInit(); this.time.delayedCall(3600, () => popWorld(this.pl.x, this.pl.y - 36, '+3 poin atribut (MENU)', 'xp')); }
    if (up) {
      const old = S.lv - 1; let k = 0; for (const J of []) if (S.lv >= J.lv && !S.flags['sk' + J.lv]) { S.flags['sk' + J.lv] = 1; this.time.delayedCall(1800 + k++ * 2200, () => { banner(J.n, 'JURUS BARU', false, 2000); popWorld(this.pl.x, this.pl.y - 36, J.d, 'xp'); }); }
      const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp; sfx('lvl'); banner('LEVEL ' + S.lv + '!', 'NAIK LEVEL', true, 1600); this.time.delayedCall(1700, () => levelUpDetail(old));
      const pl = this.pl, g = this.add.graphics().setDepth(pl.y + 2), o = { r: 4 };
      this.tweens.add({ targets: o, r: 34, duration: 600, onUpdate: () => { g.clear(); g.lineStyle(2, 0xffe27a, 1 - o.r / 34).strokeEllipse(pl.x, pl.y - 2, o.r * 2, o.r); }, onComplete: () => g.destroy() });
      this.sparkle(pl.x, pl.y - 12, 'doto', 18);
    }
    updHud();
  },
  hurtPlayer(atk, sx, sy, fx) {
    const pl = this.pl; if (pl.inv > 0 || pl.dead || G.lock > 0 || UIH) return;
    if (pl.dashT > 0) return; if (this.night && isNight()) atk *= 1.15;
    const dmg = Math.max(1, Math.round((atk * rnd(.85, 1.15) - stat().def * .6) * DIFF[OPT.diff].dmg));
    S.hp = Math.max(0, S.hp - dmg); popWorld(pl.x, pl.y - 28, '-' + dmg, 'hurt'); sfx('hurt'); this.hitStop(.06, 40); if (S.hp > 0) this.inflict(fx);
    pl.inv = 1; const dx = pl.x - sx, dy = pl.y - sy, n = Math.hypot(dx, dy) || 1; pl.kb = .14; pl.kbx = dx / n * 170; pl.kby = dy / n * 170;
    pl.setTintFill(0xff4a4a); this.time.delayedCall(90, () => pl.clearTint()); this.dangerFrom(sx, sy); this.hurtAnim();
    this.camShake(120, .006); updHud();
    if (S.hp <= 0) this.defeat();
  },
  eShoot(e, kind, angles, dmg, abs) {
    const P = PROJ[kind], s = e.spr, pl = this.pl, base = abs ? 0 : Math.atan2(pl.y - s.y, pl.x - s.x);
    sfxAt('spore', s.x, s.y, this);
    for (const a of angles) {
      const sp = this.add.image(s.x, s.y - 8, P.key);
      this.shots.push({ s: sp, gx: s.x, gy: s.y, vx: Math.cos(base + a) * P.spd, vy: Math.sin(base + a) * P.spd, life: 2.6, kind, dmg, spin: P.spin, enemy: 1, fx: P.fx || e.D.fx });
    }
  },
  shockwave(x, y, R, atk) {
    const tg = this.add.graphics().setDepth(y - 2);
    const fill = { p: 0 };
    this.tweens.add({
      targets: fill, p: 1, duration: 500,
      onUpdate: () => {
        tg.clear();
        tg.lineStyle(2, 0xff3a3a, .75).strokeEllipse(x, y, R * 2, R * 1.2);
        tg.fillStyle(0xff4433, .22).fillEllipse(x, y, R * 2 * fill.p, R * 1.2 * fill.p);
      },
      onComplete: () => {
        tg.destroy();
        sfxAt('boom', x, y, this); this.camShake(250, .012);
        const g = this.add.graphics().setDepth(y - 1); const o = { r: 6 };
        this.tweens.add({
          targets: o, r: R, duration: 300,
          onUpdate: () => {
            g.clear();
            g.lineStyle(3, 0xfff0b0, 1 - o.r / R * .6).strokeEllipse(x, y, o.r * 2, o.r * 1.2);
            g.lineStyle(1, 0xffffff, .8).strokeEllipse(x, y, o.r * 1.6, o.r * .9);
          },
          onComplete: () => g.destroy()
        });
        const p = this.add.particles(x, y, 'smoke', {
          lifespan: 600, speed: { min: 30, max: 70 }, angle: { min: 160, max: 380 },
          scale: { start: .8, end: 1.6 }, alpha: { start: .6, end: 0 }, emitting: false, tint: 0xd8c8a0
        }).setDepth(y + 1);
        p.explode(14); this.time.delayedCall(700, () => p.destroy());
        const pl = this.pl;
        if (Math.hypot(pl.x - x, (pl.y - y) * 1.5) < R) this.hurtPlayer(atk, x, y);
      }
    });
  },
  updShots(dt, locked) {
    if (locked) return;
    for (const p of this.shots) {
      p.life -= dt; p.gx += p.vx * dt; p.gy += p.vy * dt; p.s.setPosition(p.gx, p.gy - 9).setDepth(p.gy + 2);
      if (p.spin) p.s.rotation += dt * 14;
      let dead = p.life <= 0;
      if (!dead && this.physics.overlapRect(p.gx - 2, p.gy - 3, 4, 4, false, true).length) dead = true;
      this._curShot = p;
      if (!dead && p.mine) for (const e of this.enemies) { if (e.hp > 0 && !(p.hitSet && p.hitSet.has(e)) && Math.hypot(e.spr.x - p.gx, e.spr.y - e.D.r * e.sc * .7 - (e.D.fly ? 6 : 0) - (p.gy - 4)) < e.D.r * e.sc + 6) { const n = Math.hypot(p.vx, p.vy); this.hitEnemy(e, p.dmg, false, p.vx / n, p.vy / n); if (p.kind === 'fire') this.burnEnemy(e, p.dmg * .2, 2); if (p.pierce) { (p.hitSet = p.hitSet || new Set()).add(e); continue; } dead = true; break; } }
      if (!dead && p.enemy && Math.hypot(this.pl.x - p.gx, this.pl.y - 4 - p.gy) < 8) { this.hurtPlayer(p.dmg, p.gx - p.vx, p.gy - p.vy, p.fx); dead = true; }
      if (dead) { p.dead = true; p.s.destroy(); if (p.kind === 'fire') this.sparkle(p.gx, p.gy - 8, 'doto', 8); }
    }
    this.shots = this.shots.filter(p => !p.dead);
  },
  async defeat() {
    const pl = this.pl; pl.dead = true; pl.setVelocity(0); G.lock++; playBGM('lose'); bossBar(null);
    this.tweens.add({ targets: pl, angle: 90, alpha: .4, duration: 500 });
    await sleep(1300);
    const B = this.curBoss;
    if (B && B.zone !== undefined && this.bossOn) { G.lock--; const again = await this.retryBoss(); G.lock++;
      if (again) { await fadeTo(1); const st0 = stat(); S.hp = st0.maxhp; S.mp = st0.maxmp; G.lock--; this.trans = true; const z = B.zone; this.scene.restart({ map: this.M.id, x: z ? z[0] + z[2] / 2 : this.pl.x, y: z ? z[1] + z[3] + 40 : this.pl.y + 60, dir: 'up' }); return; } }
    await fadeTo(1);
    S.gold = Math.floor(S.gold / 2); const st = stat(); S.hp = st.maxhp; S.mp = st.maxmp;
    G.lock--; this.trans = true;
    this.scene.restart({ map: 'inn', x: 160, y: 200, dir: 'down', quiet: true, after: async () => { await sleep(400); await talk('Bu Rina', ['Syukurlah kamu sadar! Pemburu menemukanmu pingsan dan membawamu ke sini.', 'Separuh uangmu hilang entah ke mana... Musuh yang kamu lawan masih menunggu di sana. Siapkan ramuan dan perlengkapan yang lebih kuat, ya.']); } });
  },
});
