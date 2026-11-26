'use strict';
// Ekologi Spawn & Perilaku Paket B: zona aman permukiman, validasi air/tembok, ritme siang-malam/hujan, & respawn habitat
const SAFE_ZONES = {
  meadow: [{ x: 40, y: 90, w: 505, h: 315 }],
};
const SAFE_TOWN_MAPS = new Set(['village', 'kgate', 'kpasar', 'kakademi', 'kbawah', 'kpermukiman']);
const DIURNAL_MOBS = new Set(['bee', 'boar', 'slime', 'slimer', 'slimeb']);
const NOCTURNAL_MOBS = new Set(['bat', 'batc', 'wolf', 'wolfs', 'wisp', 'ghost', 'snake']);
const RAIN_MOBS = new Set(['frog', 'bounty_frog', 'slimep', 'slimeb']);

function inSafeZone(mapId, x, y) {
  const zones = SAFE_ZONES[mapId];
  if (!zones) return false;
  for (const z of zones) {
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return true;
  }
  return false;
}

function isWaterAt(M, x, y) {
  if (!M) return false;
  if (x < 0 || y < 0 || x >= M.w || y >= M.h) return true;
  if (typeof grassEdgeData === 'function') {
    const E = grassEdgeData(M);
    if (E && E.Wm && typeof GRASS_EDGE !== 'undefined') {
      const c = Math.floor(x / GRASS_EDGE.cell), r = Math.floor(y / GRASS_EDGE.cell);
      if (c >= 0 && r >= 0 && c < E.cols && r < E.rows && E.Wm[r * E.cols + c]) return true;
      return false;
    }
  }
  if (M.ponds && typeof pondsAll === 'function' && typeof waterE === 'function') {
    const PL = pondsAll(M), [GX, GY] = typeof waterGXY === 'function' ? waterGXY(M) : [0, 0];
    if (PL.length && waterE(PL, x, y, GX, GY) < 1.08) return true;
  }
  if (M.river && typeof riverY === 'function') {
    const R = M.river, onBr = R.bridge && x >= R.bridge[0] && x <= R.bridge[1];
    if (!onBr && Math.abs(y - riverY(R, x)) < (R.w || 40) / 2 + 6) return true;
  }
  return false;
}

function isWallAt(sc, x, y) {
  if (!sc || !sc.walls || !sc.walls.children) return false;
  const entries = sc.walls.children.entries || [];
  for (const w of entries) {
    const b = w && w.body;
    if (!b || !w.active) continue;
    if (x >= b.x - 8 && x <= b.x + b.width + 8 && y >= b.y - 8 && y <= b.y + b.height + 8) return true;
  }
  return false;
}

function enemyEcoSightMul(sc, e) {
  if (!e) return 1;
  if (e.sleeping) return 0.5;
  const night = typeof isNight === 'function' && isNight();
  if (night && NOCTURNAL_MOBS.has(e.type)) return 1.15;
  if (night && DIURNAL_MOBS.has(e.type)) return 0.6;
  if (sc && sc.weather === 'rain' && e.type === 'bee') return 0.75;
  return 1;
}

Object.assign(World.prototype, {
  _isSpawnSafe(x, y, fly, opts) {
    const M = this.M;
    if (!M) return true;
    const mw = M.w || 1024, mh = M.h || 1024;
    if (x < 48 || x > mw - 48 || y < 48 || y > mh - 48) return false;
    if (!(opts && opts.allowSafe) && inSafeZone(M.id, x, y)) return false;
    if (!fly && (isWaterAt(M, x, y) || isWallAt(this, x, y))) return false;
    if (opts && opts.avoidPl && this.pl && Math.hypot(x - this.pl.x, y - this.pl.y) <= 76) return false;
    return true;
  },
  findSafeSpawn(x, y, minR = 0, maxR = 110, fly = false, opts = {}) {
    if (minR <= 0 && this._isSpawnSafe(x, y, fly, opts)) return [Math.round(x), Math.round(y)];
    const startR = Math.max(18, minR);
    for (let rad = startR; rad <= Math.max(startR, maxR); rad += 18) {
      for (let i = 0; i < 12; i++) {
        const ang = (i / 12) * Math.PI * 2 + (rad * 0.05);
        const cx = Math.round(x + Math.cos(ang) * rad);
        const cy = Math.round(y + Math.sin(ang) * rad);
        if (this._isSpawnSafe(cx, cy, fly, opts)) return [cx, cy];
      }
    }
    return null;
  },
  updHabitatRespawn(dt) {
    if (this.passive || G.title || G.lock > 0 || this.bossOn || this.trans || !this.M) return;
    const m = this.M.id;
    if (!m || this.M.indoor || SAFE_TOWN_MAPS.has(m)) return;
    this._respT = (this._respT == null ? 4 : this._respT) - dt;
    if (this._respT > 0) return;
    this._respT = 4;
    const slainMap = S.slainT && S.slainT[m];
    if (!slainMap) return;
    const alive = (this.enemies || []).filter(o => o.hp > 0).length;
    if (alive >= 42) return;
    const nowH = typeof gameHours === 'function' ? gameHours() : ((S.day || 1) * 24 + (S.time || 0));
    const pl = this.pl;
    for (const [k, rec] of Object.entries(slainMap)) {
      if (!rec || !ENEMY[rec.type]) { delete slainMap[k]; continue; }
      if (nowH - rec.t < 6) continue;
      if (pl && Math.hypot(pl.x - rec.x, pl.y - rec.y) <= 420) continue;
      const pos = this.findSafeSpawn(rec.x, rec.y, 12, 48, ENEMY[rec.type].fly, { avoidPl: true });
      if (!pos) continue;
      if (S.slain && S.slain[m]) delete S.slain[m][k];
      delete slainMap[k];
      const e = this.spawnEnemy(rec.type, pos[0], pos[1], { exact: 1 });
      if (e) e._spawnKey = k;
      break;
    }
  },
});

(() => {
  const W = World.prototype;
  const _spEco = W.spawnEnemy;
  W.spawnEnemy = function (type, x, y, opt) {
    const e = _spEco.apply(this, arguments);
    if (!e || e.boss || (opt && opt.exact)) return e;
    if (!this._isSpawnSafe(e.spr.x, e.spr.y, e.D && e.D.fly, { allowSafe: false })) {
      const pos = this.findSafeSpawn(e.spr.x, e.spr.y, 0, 120, e.D && e.D.fly);
      if (pos) {
        e.spr.setPosition(pos[0], pos[1]);
        e.home = { x: pos[0], y: pos[1] };
        if (e.sh) e.sh.setPosition(pos[0], pos[1] - 1 + (e.D?.fly ? 10 : 0));
      }
    }
    return e;
  };

  const _updEco = W.updEnemy;
  W.updEnemy = function (e, dt, locked) {
    if (!e || e.hp <= 0 || !e.spr || !e.spr.active) return _updEco.apply(this, arguments);
    const s = e.spr, M = this.M;
    if (!e.boss && !e.leash && M && inSafeZone(M.id, s.x, s.y)) {
      e.leash = true;
      e.packAggro = false;
      e.alert = 0;
    }
    const night = typeof isNight === 'function' && isNight();
    const hd = e.home ? Math.hypot(e.home.x - s.x, e.home.y - s.y) : 0;
    const d = this.pl ? Math.hypot(this.pl.x - s.x, this.pl.y - s.y) : 999;
    const diurnalSleep = night && DIURNAL_MOBS.has(e.type) && !e.boss && !e.wasAggro && !e.packAggro && (e.alert || 0) < 2 && hd < 76;
    if (!locked && diurnalSleep) {
      e.sleeping = true;
      s.setVelocity(0);
      if (this.pl && !this.pl.dead && d < 32) {
        e.sleeping = false;
        e.alert = 2;
        if (typeof markOver === 'function') markOver(this, e, '!', '#ff5a3a');
      } else {
        e._zzzT = (e._zzzT || 0) - dt;
        if (e._zzzT <= 0) {
          e._zzzT = 3.6;
          if (this.pl && d < 220) popWorld(s.x, s.y - 20, 'Zzz', 'xp');
        }
        return;
      }
    } else if (e.sleeping && (!night || e.wasAggro || e.packAggro || (e.alert || 0) >= 2)) {
      e.sleeping = false;
    }

    _updEco.apply(this, arguments);
    if (locked || e.hp <= 0 || !s.active || !s.body || e.sleeping) return;
    if (night && NOCTURNAL_MOBS.has(e.type) && (e.alert === 2 || e.st === 'chase')) {
      s.body.velocity.scale(1.08);
    }
    if (this.weather === 'rain') {
      if (RAIN_MOBS.has(e.type)) {
        s.body.velocity.scale(1.12);
        if (e.cd > 0) e.cd = Math.max(0, e.cd - dt * 0.15);
      } else if (e.type === 'bee') {
        s.body.velocity.scale(0.75);
      }
    }
  };

  const _hitEco = W.hitEnemy;
  W.hitEnemy = function (e, base, crit, nx, ny) {
    if (e && e.sleeping && e.hp > 0) {
      e.sleeping = false;
      e.alert = 2;
      e.packAggro = true;
      base = Math.round(base * 1.35);
      if (e.spr && e.spr.active) popWorld(e.spr.x, e.spr.y - 24, 'SERGAP! x1.35', 'crit');
    }
    return _hitEco.call(this, e, base, crit, nx, ny);
  };

  const _klEco = W.killEnemy;
  W.killEnemy = function (e) {
    if (e && !e.boss && !e.D?.isBounty && !e.D?.story && e._spawnKey && this.M && !this.M.indoor) {
      S.slainT = S.slainT || {};
      const m = this.M.id;
      S.slainT[m] = S.slainT[m] || {};
      S.slainT[m][e._spawnKey] = {
        t: typeof gameHours === 'function' ? gameHours() : ((S.day || 1) * 24 + (S.time || 0)),
        type: e.type,
        x: e.home ? e.home.x : e.spr.x,
        y: e.home ? e.home.y : e.spr.y,
      };
    }
    return _klEco.apply(this, arguments);
  };

  const _upEco = W.update;
  W.update = function (time, dms) {
    _upEco.apply(this, arguments);
    this.updHabitatRespawn(this.dt || Math.min(dms, 50) / 1000);
  };

  if (typeof sleepToMorning === 'function') {
    const _slpEco = sleepToMorning;
    sleepToMorning = function () { // eslint-disable-line no-global-assign
      if (S) S.slainT = {};
      return _slpEco.apply(this, arguments);
    };
  }
})();
