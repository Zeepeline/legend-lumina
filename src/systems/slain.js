'use strict';
// Paket A (T469, T484, T485, T486) & Paket B Gelombang 18 (T528–T531: Spell Wheel, Relik, Sekutu Tempur, Ujian Bayangan)
Object.assign(ITEMS, {
  relic_blood: {
    n: 'Cincin Darah Purba', k: 'acc', mag: 3, price: 180, sell: 75,
    d: 'Relik Dimraeth: kerusakan mantra +20%. Saat MP habis, mantra bisa dirapal dengan HP.'
  },
  relic_shadow: {
    n: 'Jimat Langkah Bayangan', k: 'acc', spd: .06, price: 180, sell: 75,
    d: 'Relik Dimraeth: berguling menembus musuh menyayat mereka dengan efek Luka (Bleed).'
  },
  relic_vora: {
    n: 'Segel Vora', k: 'acc', atk: 2, def: 2, price: 200, sell: 85,
    d: 'Relik Dimraeth: tebasan kombo terakhir memulihkan +4 HP dan +8 Stamina.'
  },
  ally_horn: {
    n: 'Peluit Sekutu Lumina', k: 'use', tool: 'ally_horn', price: 90, sell: 35,
    d: 'Panggil sekutu akrab untuk ikut bertempur di sisimu selama 25 detik.'
  },
});
Object.assign(ICONS_DEF, {
  relic_blood: ['shard', { C: '#d82a3a', L: '#ff8a9a', D: '#681018' }],
  relic_shadow: ['shard', { C: '#5a3a88', L: '#b89aff', D: '#24143c' }],
  relic_vora: ['shard', { C: '#e8b03a', L: '#fff0a0', D: '#785014' }],
  ally_horn: ['flask', { C: '#e8c050', L: '#fff4b8', D: '#7a5a18', G: '#d8e8f0', W: '#ffffff', K: '#6a3e1e' }],
});
CRAFT.push(
  { id: 'relic_blood', n: 1, need: { shard: 2, ecto: 1 } },
  { id: 'relic_shadow', n: 1, need: { pelt: 2, bone: 2 } },
  { id: 'relic_vora', n: 1, need: { ore: 2, shard: 2 } },
  { id: 'ally_horn', n: 1, need: { bone: 1, feather: 2 } }
);
{
  const W = World.prototype;
  // T469: perluas sedikit batas zona pemicu bos agar tidak terhalang dekorasi baru
  const chk0 = W.checkZones;
  W.checkZones = function () {
    const r = chk0.apply(this, arguments);
    if (!this.bossOn && this.pl && !this.pl.dead && this.M && this.M.bosses) {
      const pl = this.pl;
      for (const B of this.M.bosses) {
        if (S.stage < B.need || S.flags[B.flag]) continue;
        const z = B.zone;
        if (pl.x > z[0] - 28 && pl.x < z[0] + z[2] + 28 && pl.y > z[1] - 36 && pl.y < z[1] + z[3] + 28) {
          this.startBoss(B); break;
        }
      }
    }
    return r;
  };
  // T484: Musuh non-boss yang sudah dikalahkan tetap mati sampai Arka tidur / ganti hari
  const sp0 = W.spawnEnemy;
  W.spawnEnemy = function (type, x, y, opt) {
    if (typeof S !== 'undefined' && S) {
      if (S._slainDay !== S.day) { S.slain = {}; S._slainDay = S.day; }
      const mapId = (this.M && this.M.id) || 'village', key = Math.round(x) + '_' + Math.round(y);
      const D = ENEMY[type];
      const isBoss = D && (BOSS_AI.includes(D.ai) || D.boss);
      if (!isBoss && this._inCreateSpawn && S.slain && S.slain[mapId] && S.slain[mapId][key]) {
        return null;
      }
    }
    const e = sp0.apply(this, arguments);
    if (e) e._spawnKey = Math.round(x) + '_' + Math.round(y);
    return e;
  };
  const cr0 = W.create;
  W.create = function () {
    this._inCreateSpawn = true;
    try { return cr0.apply(this, arguments); } finally { this._inCreateSpawn = false; }
  };
  const kl0 = W.killEnemy;
  W.killEnemy = function (e) {
    if (e && !e.boss && e._spawnKey && this.M) {
      S.slain = S.slain || {};
      const m = this.M.id;
      S.slain[m] = S.slain[m] || {};
      S.slain[m][e._spawnKey] = 1;
    }
    if (e && e.boss && S.mercy && this.M) delete S.mercy[this.M.id];
    return kl0.apply(this, arguments);
  };
  const slp0 = sleepToMorning;
  sleepToMorning = function () { // eslint-disable-line no-global-assign
    if (S) S.slain = {};
    return slp0.apply(this, arguments);
  };
  // T486: Bantuan kalah berulang (Berkat Lumina setelah >= 3 kalah di wilayah yang sama)
  const def0 = W.defeat;
  W.defeat = async function () {
    const map = (this.M && this.M.id) || 'village';
    S.deaths = S.deaths || {};
    S.deaths[map] = (S.deaths[map] || 0) + 1;
    const r = await def0.apply(this, arguments);
    if (S.deaths[map] >= 3 && !(S.mercy && S.mercy[map])) {
      S.mercy = S.mercy || {};
      S.mercy[map] = 1;
      const F = flaskOf(); F.n = F.max + 1; updHud();
      popWorld(this.pl.x, this.pl.y - 32, 'Berkat Lumina Aktif!', 'heal');
    }
    return r;
  };
  // T486 (-15% dmg saat Berkat Lumina aktif) & T528–T530 (Relik, Spell Wheel, Sekutu Tempur)
  const hrt0 = W.hurtPlayer;
  W.hurtPlayer = function (atk, sx, sy, fx) {
    if (this.M && S.mercy && S.mercy[this.M.id]) atk = Math.max(1, Math.round(atk * .85));
    return hrt0.call(this, atk, sx, sy, fx);
  };
  // T529: Relik Cincin Darah Purba (rapal mantra dengan HP saat MP kurang, +20% dmg mantra)
  const mg0 = W.magic;
  W.magic = function () {
    if (S.eq && S.eq.acc === 'relic_blood' && S.spell && learned(S.spell)) {
      const needMp = (JURUS[S.spell] && JURUS[S.spell].mp) || 3;
      if (S.mp < needMp && S.hp > needMp * 2) {
        const lack = needMp - S.mp;
        S.hp -= lack * 2; S.mp += lack;
        popWorld(this.pl.x, this.pl.y - 30, `-${lack * 2} HP (Darah)`, 'hurt');
      }
    }
    return mg0.apply(this, arguments);
  };
  const ht0 = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (S.eq && S.eq.acc === 'relic_blood' && (this.curElem || this._inShots)) {
      base = Math.round(base * 1.2);
    }
    if (S.eq && S.eq.acc === 'relic_vora' && this.pl && this.pl.combo === 5 && !this.curElem && !this._inShots) {
      const st = stat();
      S.hp = Math.min(st.maxhp, S.hp + 4);
      S.sta = Math.min(st.maxsta || 100, (S.sta || 0) + 8);
      updHud();
    }
    return ht0.call(this, e, base, crit, nx, ny);
  };
  // T530: Peluit Sekutu Lumina (ally_horn)
  const ut0 = W.useTool;
  W.useTool = function (id) {
    if (id === 'ally_horn') {
      this.summonCompanion();
      return true;
    }
    return ut0.apply(this, arguments);
  };
  // Update tiap frame: panah penunjuk Jejak Cahaya (T485), Relik Bayangan (T529), Sekutu Tempur (T530)
  const up0 = W.update;
  W.update = function (time, dl) {
    up0.call(this, time, dl);
    if (this.passive || G.title || !this.pl || this.pl.dead) return;
    const dt = Math.min(dl, 100) / 1000;
    this.updLostArrow();
    if (S.eq && S.eq.acc === 'relic_shadow' && this.pl.dashT > 0) {
      for (const e of this.enemies || []) {
        if (e.hp > 0 && Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y) < 22) {
          if (this.bleedEnemy) this.bleedEnemy(e, 2, 3);
        }
      }
    }
    if (this._comp && this._comp.t > 0) this.updCompanion(dt);
  };
}
Object.assign(World.prototype, {
  // T485: Panah kecil penunjuk arah menuju Jejak Cahaya bila di wilayah yang sama
  updLostArrow() {
    const L = S.lost;
    const same = L && (this.M.benua || this.M.id === L.map);
    if (!same) { if (this._lostArr) { this._lostArr.destroy(); this._lostArr = null; } return; }
    let gx = L.x, gy = L.y;
    if (this.M.benua && WORLD_POS[L.map]) { gx += WORLD_POS[L.map][0]; gy += WORLD_POS[L.map][1]; }
    const d = Math.hypot(gx - this.pl.x, gy - this.pl.y);
    if (d < 45) { if (this._lostArr) { this._lostArr.destroy(); this._lostArr = null; } return; }
    if (!this._lostArr || !this._lostArr.active) {
      this._lostArr = this.add.text(0, 0, '✦➤', { fontSize: '10px', color: '#ffe28a', stroke: '#1a0e08', strokeThickness: 2 }).setOrigin(.5).setDepth(9400);
    }
    const ang = Math.atan2(gy - this.pl.y, gx - this.pl.x);
    this._lostArr.setPosition(this.pl.x + Math.cos(ang) * 24, this.pl.y - 10 + Math.sin(ang) * 24).setRotation(ang);
  },
  // T528: Ganti cepat di antara 5 mantra pada Roda Mantra (Spell Wheel)
  cycleSpell() {
    const spells = ['fire', 'nova', 'venom', 'heal', 'holy'].filter(k => learned(k));
    if (!spells.length) return;
    S.spellWheel = spells.slice(0, 5);
    const idx = S.spellWheel.indexOf(S.spell);
    S.spell = S.spellWheel[(idx + 1) % S.spellWheel.length];
    sfx('cur'); updHud();
    if (this.pl) popWorld(this.pl.x, this.pl.y - 32, '✦ ' + JURUS[S.spell].n, 'mpc');
  },
  // T530: Panggil Sekutu Tempur selama 25 detik
  summonCompanion() {
    if (this._comp && this._comp.s && this._comp.s.active) {
      this._comp.s.destroy();
    }
    const pl = this.pl, s = this.add.sprite(pl.x - 16, pl.y + 4, 'hunter', 'down0').setOrigin(.5, 1).setDepth(pl.y);
    this.sparkle(s.x, s.y - 10, 'spark', 16); sfx('fanfare');
    popWorld(pl.x, pl.y - 30, 'Raka Bergabung!', 'heal');
    this._comp = { s, t: 25, atkCd: .5 };
  },
  updCompanion(dt) {
    const c = this._comp, s = c.s, pl = this.pl;
    c.t -= dt; c.atkCd -= dt;
    if (c.t <= 0 || !s.active) { if (s.active) { this.puff(s.x, s.y); s.destroy(); } this._comp = null; return; }
    let foe = null, bd = 160;
    for (const e of this.enemies || []) {
      if (e.hp <= 0) continue;
      const d = Math.hypot(e.spr.x - s.x, e.spr.y - s.y);
      if (d < bd) { bd = d; foe = e; }
    }
    const tx = foe ? foe.spr.x : pl.x - 18, ty = foe ? foe.spr.y : pl.y + 6;
    const dx = tx - s.x, dy = ty - s.y, d = Math.hypot(dx, dy) || 1;
    if (d > (foe ? 20 : 14)) {
      s.x += (dx / d) * 115 * dt; s.y += (dy / d) * 115 * dt; s.setDepth(s.y);
    }
    if (foe && d < 28 && c.atkCd <= 0) {
      c.atkCd = 1.1; sfx('swing');
      this.hitEnemy(foe, Math.max(3, Math.round(stat().atk * .75)), false, dx / d, dy / d);
    }
  },
  // T531: Ujian Bayangan dari Meja Peta & Prasasti Markas
  async startShadowTrial() {
    G.lock--;
    try {
      const pl = this.pl;
      banner('UJIAN BAYANGAN DIMULAI!', 'KALAHKAN PROYEKSI ELIT', true, 1800);
      sfx('roar');
      const e = this.spawnEnemy('wolf', pl.x, Math.max(100, pl.y - 42));
      if (e) {
        this.makeElite(e);
        e.spr.setTint(0x9a6ad8);
      }
    } finally { G.lock++; }
  },
});
