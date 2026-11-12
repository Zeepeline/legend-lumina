'use strict';
// AI boss & alur pertarungan boss
Object.assign(World.prototype, {
  summon(e) {
    const s = e.spr, D = e.D; e.summoned = true; e.st = 'roar'; e.t = .8; s.setVelocity(0); sfx('roar'); this.camShake(400, .01); s.setTint(0xff7a5a);
    banner(D.name + ' memanggil bantuan!', null, false, 1300);
    (D.adds || []).forEach((t, i, a) => { const ang = i / a.length * 6.28; const m = this.spawnEnemy(t, s.x + Math.cos(ang) * 50, s.y + Math.sin(ang) * 32); this.sparkle(m.spr.x, m.spr.y - 6, 'doto', 8); });
  },
  updBoss(e, dt, dx, dy, d) {
    const s = e.spr, D = e.D, golem = D.ai === 'gboss';
    if (!e.awake) { s.setVelocity(0); if (D.ch) s.setFrame('down0'); return; }
    if (D.phase2 && !e.p2 && e.hp < e.max * .5) {
      e.p2 = true; e.st = 'roar'; e.t = 1.2; s.setVelocity(0); sfx('roar'); this.camShake(600, .014); this.cameras.main.flash(200, 255, 120, 80);
      banner('Raja Goblin mengamuk!', 'FASE 2', true, 1500); s.setTint(0xffb8a8); e.spdM = 1.45;
      if (!e.summoned) this.summon(e); return;
    }
    if (!e.summoned && D.adds && !D.phase2 && e.hp < e.max * .5) { this.summon(e); return; }
    const spd = D.spd * (e.spdM || 1);
    if (e.st === 'idle' || e.st === 'chase') {
      e.st = 'chase'; s.setVelocity(dx / d * spd, dy / d * spd);
      if (e.t <= 0) {
        const r = Math.random(); s.setVelocity(0); e.lx = dx / d; e.ly = dy / d; e.tx = this.pl.x; e.ty = this.pl.y; sfx('jump');
        if ((golem || e.p2) && r < .38) { e.st = 'throw'; e.t = .5; s.setTint(0xb0a0ff); }
        else if (r < .7) { e.st = 'swind'; e.t = e.p2 ? .4 : .55; s.setTint(0xffc04a); }
        else { e.st = 'cwind'; e.t = e.p2 ? .45 : .6; s.setTint(0xff7a5a); }
      }
    } else if (e.st === 'throw') {
      if (e.t <= 0) { s.clearTint(); this.eShoot(e, golem ? 'rock' : 'bone', e.p2 ? [-.5, -.25, 0, .25, .5] : [-.35, 0, .35], D.atk - 4); e.st = 'rec'; e.t = .7; }
    } else if (e.st === 'swind') {
      if (e.t <= 0) { e.st = 'leap'; e.t = .42; s.clearTint(); s.setVelocity((e.tx - s.x) / .42, (e.ty - s.y) / .42); this.tweens.add({ targets: s, scaleY: e.sc * 1.15, duration: 210, yoyo: true }); }
    } else if (e.st === 'leap') {
      if (e.t <= 0) { e.st = 'rec'; e.t = e.p2 ? .5 : .8; s.setVelocity(0); this.shockwave(s.x, s.y, golem ? 62 : e.p2 ? 60 : 50, D.atk + 3); }
    } else if (e.st === 'cwind') { if (e.t <= 0) { e.st = 'charge'; e.t = .55; s.clearTint(); s.setVelocity(e.lx * 230 * (e.spdM || 1), e.ly * 230 * (e.spdM || 1)); sfx('roar'); } }
    else if (e.st === 'charge') { this.dustE = (this.dustE || 0) - dt; if (this.dustE <= 0) { this.dustE = .07; this.puff(s.x, s.y); } if (e.t <= 0) { e.st = 'rec'; e.t = .7; s.setVelocity(0); } }
    else if (e.st === 'roar') { if (e.t <= 0) { s.clearTint(); if (e.p2) s.setTint(0xffb8a8); e.st = 'chase'; e.t = 1; } }
    else if (e.st === 'rec') { if (e.t <= 0) { e.st = 'chase'; e.t = rnd(1.1, 1.9) / (e.spdM || 1); if (e.p2) s.setTint(0xffb8a8); } }
    if (D.ch) this.charAnim(e); else s.flipX = dx > 0;
  },
  updQueen(e, dt, dx, dy, d) {
    const s = e.spr, D = e.D; if (!e.awake) { s.setVelocity(0); return; }
    if (!e.summoned && e.hp < e.max * .5) { this.summon(e); return; }
    if (e.st === 'roar') { s.setVelocity(0); if (e.t <= 0) { s.clearTint(); e.st = 'idle'; } return; }
    s.setVelocity(dx / d * D.spd, dy / d * D.spd); s.flipX = dx > 0;
    e.shootT -= dt;
    if (e.shootT <= 0) {
      e.alt = !e.alt; e.shootT = e.summoned ? 1.6 : 2.1; this.tweens.add({ targets: s, scaleX: e.sc * 1.2, scaleY: e.sc * .85, duration: 120, yoyo: true });
      if (e.alt) this.eShoot(e, 'spore', [...Array(10).keys()].map(i => i / 10 * Math.PI * 2 + this.t), D.atk, true);
      else this.eShoot(e, 'spore', [-.3, -.1, .1, .3], D.atk);
    }
  },
  updSnake(e, dt, dx, dy, d) {
    const s = e.spr, D = e.D; if (!e.awake) { s.setVelocity(0); return; }
    s.anims.timeScale = e.st === 'dash' ? 3 : 1.4;
    if (e.st === 'idle' || e.st === 'chase') {
      e.st = 'chase'; s.setVelocity(dx / d * D.spd, dy / d * D.spd); s.flipX = dx > 0;
      if (e.t <= 0) { s.setVelocity(0); e.lx = dx / d; e.ly = dy / d; if (d < 130 && Math.random() < .6) { e.st = 'wind'; e.t = .45; s.setTint(0xffa07a); } else { e.st = 'spit'; e.t = .4; s.setTint(0xd08aff); } }
    } else if (e.st === 'wind') { if (e.t <= 0) { e.st = 'dash'; e.t = .5; s.clearTint(); s.setVelocity(e.lx * 260, e.ly * 260); sfx('swing'); } }
    else if (e.st === 'dash') { if (e.t <= 0 || s.body.blocked.left || s.body.blocked.right || s.body.blocked.up || s.body.blocked.down) { e.st = 'rec'; e.t = .6; s.setVelocity(0); } }
    else if (e.st === 'spit') { if (e.t <= 0) { s.clearTint(); this.eShoot(e, 'venom', [-.25, 0, .25], D.atk); e.st = 'rec'; e.t = .5; } }
    else if (e.st === 'rec') { if (e.t <= 0) { e.st = 'chase'; e.t = rnd(1, 1.8); } }
  },
  updWitch(e, dt, dx, dy, d) {
    const s = e.spr, D = e.D; if (!e.awake) { s.setVelocity(0); s.setFrame('down0'); return; }
    if (!e.summoned && e.hp < e.max * .5) { this.summon(e); e.spdM = 1.3; return; }
    if (e.st === 'roar') { s.setVelocity(0); if (e.t <= 0) { s.clearTint(); e.st = 'idle'; e.t = .8; } return; }
    if (e.st === 'idle' || e.st === 'chase') {
      e.st = 'chase'; const k = d > 80 ? 1 : -1; s.setVelocity(dx / d * D.spd * k, dy / d * D.spd * k);
      if (e.t <= 0) { const r = Math.random(); s.setVelocity(0);
        if (r < .3) { e.st = 'tele'; e.t = .35; e.faded = true; this.tweens.add({ targets: s, alpha: 0, duration: 300 }); sfx('spore'); }
        else if (r < .65) { e.st = 'cast'; e.t = .5; s.setTint(0xd08aff); }
        else { e.st = 'ring'; e.t = .6; s.setTint(0x8affc0); } }
    } else if (e.st === 'tele') { if (e.t <= 0) { const a = rnd(0, 6.28); s.setPosition(clamp(this.pl.x + Math.cos(a) * 72, 90, this.M.w - 90), clamp(this.pl.y + Math.sin(a) * 52, 90, this.M.h - 90)); e.faded = false; this.tweens.add({ targets: s, alpha: 1, duration: 250 }); this.sparkle(s.x, s.y - 12, 'dotg', 12); e.st = 'rec'; e.t = .5; } }
    else if (e.st === 'cast') { if (e.t <= 0) { s.clearTint(); this.eShoot(e, 'venom', e.summoned ? [-.4, -.2, 0, .2, .4] : [-.25, 0, .25], D.atk - 4); e.st = 'rec'; e.t = .6; } }
    else if (e.st === 'ring') { if (e.t <= 0) { s.clearTint(); this.eShoot(e, 'venom', [...Array(12).keys()].map(i => i / 12 * Math.PI * 2 + this.t), D.atk - 6, true); e.st = 'rec'; e.t = .8; } }
    else if (e.st === 'rec') { s.setVelocity(0); if (e.t <= 0) { e.st = 'chase'; e.t = rnd(1, 1.7) / (e.spdM || 1); } }
    this.charAnim(e);
  },
  async startBoss(B) {
    this.bossOn = true; G.lock++; this.curBoss = B;
    for (const o of this.enemies) if (!o.boss && Math.hypot(o.spr.x - B.x, o.spr.y - B.y) < 120) { o.spr.destroy(); o.sh.destroy(); o.hp = 0; }
    const e = this.spawnEnemy(B.type, B.x, B.y - 60); e.spr.setAlpha(0); this.bossE = e;
    const cam = this.cameras.main; this.camFollow = false; playBGM(null);
    this.tweens.add({ targets: cam, scrollX: clamp(B.x - VW / 2, this.camB.x0, this.camB.x1 - VW), scrollY: clamp(B.y - 40 - VH / 2, this.camB.y0, this.camB.y1 - VH), duration: 700, ease: 'Sine.inOut' });
    await sleep(800); sfx('roar'); cam.shake(500, .012);
    this.tweens.add({ targets: e.spr, alpha: 1, y: B.y - 20, duration: 500 }); this.sparkle(e.spr.x, B.y - 30, 'doto', 20);
    await sleep(700);
    for (const [n, t] of B.intro) await say(t, n || undefined);
    this.cx = cam.scrollX; this.cy = cam.scrollY; this.camFollow = true;
    playBGM('boss'); bossBar(e.D.name, 1);
    e.awake = true; e.t = 1.2; G.lock--;
  },
  async bossDown(e) {
    const B = this.curBoss; S.flags[B.flag] = true; bossBar(null); playBGM('victory'); G.lock++;
    this.cameras.main.flash(400, 255, 255, 230);
    for (const o of this.enemies) if (o !== e && o.hp > 0) this.killEnemy(o);
    await sleep(1400); banner(e.D.name + ' kalah!', 'MENANG', true, 1800); await sleep(1600);
    if (B.after === 'seal') {
      addItem('seal'); sfx('chest'); updHud(); const n = S.inv.seal || 0;
      banner('Pecahan Segel ' + n + '/3', 'DAPAT', false, 2000);
      await say(n >= 3 ? 'Ketiga Pecahan Segel terkumpul! Bawa ke gerbang segel di depan Kuil Kristal.' : `Kamu mendapat Pecahan Segel (${n}/3). Masih ada ${3 - n} lagi di hutan ini.`);
    }
    if (B.after === 'crystal') { await say('Grr... suara itu... berjanji... cahaya untukku...', 'Raja Goblin'); learn('suara_goblin'); S.stage = 4; updHud(); await say('Raja Goblin tumbang! Sentuh Kristal Lumina untuk memulihkan cahayanya.'); }
    if (B.after === 'witch') { await say('Kau tidak mengerti... Dia di bawah akar... menjanjikan cahaya abadi...', 'Morgath'); learn('suara_morgath'); S.stage = 8; updHud(); const c = this.M.chests.find(c => c.needFlag === 'witch'); const sp = this.spawnChest(c); this.sparkle(c.x, c.y - 8, 'doto', 20); await say('Morgath lenyap bersama kabutnya... Rawa Senja mulai terang.'); await say('Sebuah peti muncul di tempat ia berdiri. Setelah itu, laporkan ke Tetua Bram.'); }
    if (B.after === 'dragon') { await say('Bukan... Morgath... yang membangunkanku... Bisikan dari bawah tanah... ia memanggil namamu, anak cahaya...', 'Kryos'); learn('suara_kryos'); S.stage = 13; updHud(); const c = this.M.chests.find(c => c.needFlag === 'dragon'); const sp = this.spawnChest(c); this.sparkle(c.x, c.y - 8, 'dot', 20); sp.setAlpha(0); this.tweens.add({ targets: sp, alpha: 1, duration: 600 }); await say('Kryos hancur menjadi serpihan es berkilau... Badai salju mereda.'); await say('Sebuah peti muncul di puncak. Setelah itu, laporkan ke Tetua Bram!'); }
    if (B.after === 'golemchest') { const c = this.M.chests.find(c => c.needFlag === 'golem'); const s = this.spawnChest(c); this.sparkle(c.x, c.y - 8, 'doto', 20); s.setAlpha(0); this.tweens.add({ targets: s, alpha: 1, duration: 600 }); await say('Sebuah peti harta muncul dari reruntuhan Golem Purba!'); }
    this.bossOn = false; G.lock--; playBGM(bgmFor(this.M)); achCheck(this); saveGame(this);
  },
});
