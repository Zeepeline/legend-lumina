'use strict';
// Fondasi AI Paket A: arah hadap terpadu, faksi lintas tipe, jarak pandang sinkron, bala bantuan aman, & soft separation
const ENEMY_FACTION = {
  goblin: 'goblin', goblin_archer: 'goblin', goblin_shaman: 'goblin', goblin_elite: 'goblin', gchief: 'goblin',
  slaver: 'slaver', slaver_captain: 'slaver',
  wolf: 'wolf', wolfs: 'wolf', bounty_wolf: 'wolf',
  slime: 'slime', slimeb: 'slime', slimer: 'slime', slimep: 'slime', slimef: 'slime', slimei: 'slime', king_slime: 'slime',
  skel: 'undead', ghost: 'spirit', wisp: 'spirit',
};
const SEP_SKIP = new Set([
  'wind', 'swind', 'cwind', 'cast', 'calling', 'atk', 'lunge', 'run',
  'swoop', 'charge', 'frog_atk', 'walk_atk', 'stun'
]);

function enemyFacesRight(e) {
  const D = e && e.D;
  if (!D) return false;
  const tex = D.tex || '';
  return !!(D.esh || D.ai === 'elite_brute' || D.ai === 'samurai' || D.ai === 'shaman' ||
    tex === 'goblin_archer_hd' || tex.startsWith('slime_hd'));
}

function setEnemyFlipX(sc, e, vx) {
  if (!e || !e.spr || Math.abs(vx) <= 2) return;
  if (e.D && e.D.ch && sc && typeof sc.charAnim === 'function') {
    sc.charAnim(e);
    return;
  }
  e.spr.flipX = enemyFacesRight(e) ? vx < 0 : vx > 0;
}

function enemyFaction(type) {
  return ENEMY_FACTION[type] || type;
}

function sameFaction(a, b) {
  return !!(a && b && enemyFaction(a.type) === enemyFaction(b.type));
}

function enemySight(sc, e) {
  const base = (typeof DIFF !== 'undefined' && typeof OPT !== 'undefined' && DIFF[OPT.diff]) ? DIFF[OPT.diff].sight : 150;
  const mul = typeof enemyEcoSightMul === 'function' ? enemyEcoSightMul(sc, e) : 1;
  return base * mul;
}

function enemyAggroR(sc, e) {
  return Math.round(enemySight(sc, e) * 0.8);
}

function enemyWarnR(sc, e) {
  return Math.round(enemySight(sc, e) * 1.15);
}

function alertFaction(sc, e) {
  if (!sc || !sc.enemies || !e || e.wasAggro || e.boss) return;
  e.wasAggro = true;
  const fac = enemyFaction(e.type);
  const rad = fac === 'goblin' || fac === 'slaver' ? 150 : 130;
  const sx = e.spr.x, sy = e.spr.y;
  for (const o of sc.enemies) {
    if (o === e || o.hp <= 0 || o.boss || o.packAggro || !o.spr || !o.spr.active) continue;
    if (!sameFaction(e, o)) continue;
    if (Math.hypot(o.spr.x - sx, o.spr.y - sy) < rad) {
      o.sleeping = false;
      const delay = fac === 'goblin' || fac === 'slaver' ? 240 : 340;
      sc.time.delayedCall(delay, () => {
        if (o.hp > 0 && o.spr && o.spr.active) {
          o.sleeping = false;
          o.packAggro = true;
          o.alert = 2;
          if (typeof markOver === 'function') markOver(sc, o, '!', '#ff5a3a');
        }
      });
    }
  }
}

function callEnemyBackup(sc, e) {
  const s = e.spr;
  popWorld(s.x, s.y - 20, 'BAHAYA! MENGGELAR BANTUAN!', 'crit');
  sfxAt('crit', s.x, s.y, sc);
  sc.time.delayedCall(650, () => {
    if (!s.active || e.hp <= 0) return;
    const alive = (sc.enemies || []).filter(o => o.hp > 0 && o.spr && o.spr.active);
    const nearAlive = alive.filter(o => Math.hypot(o.spr.x - s.x, o.spr.y - s.y) < 220).length;
    if (nearAlive < 6 && alive.length < 42) {
      let pos = null;
      if (typeof sc.findSafeSpawn === 'function') {
        pos = sc.findSafeSpawn(s.x, s.y, 34, 92, e.D.fly);
      } else {
        const mw = (sc.M && sc.M.w) || 1024, mh = (sc.M && sc.M.h) || 1024;
        pos = [clamp(s.x + rnd(-76, 76), 44, mw - 44), clamp(s.y + rnd(-76, 76), 44, mh - 44)];
      }
      if (pos) {
        sc.puff(pos[0], pos[1]);
        const b = sc.spawnEnemy(e.type, pos[0], pos[1], { exact: 1, backup: 1 });
        if (b) {
          b.packAggro = true;
          b.alert = 2;
          b.calledBackup = true;
        }
        popWorld(pos[0], pos[1] - 14, '+Bala Bantuan!', 'crit');
      }
    }
    e.st = 'idle';
  });
}

function applyEnemySeparation(sc, e, locked) {
  const s = e && e.spr, D = e && e.D;
  if (locked || !e || e.hp <= 0 || e.boss || e.ambushing || e.sleeping) return;
  if (e.kb > 0 || e.hurtT > 0 || e.staggerT > 0 || !s || !s.active || !s.body) return;
  if (!D || D.ai === 'turret' || SEP_SKIP.has(e.st)) return;

  const list = sc.enemies || [];
  let px = 0, py = 0;
  const er = (D.r || 8) * (e.sc || 1);
  for (let i = 0; i < list.length; i++) {
    const o = list[i];
    if (o === e || o.hp <= 0 || o.ambushing || !o.spr || !o.spr.active) continue;
    const or = ((o.D && o.D.r) || 8) * (o.sc || 1);
    const minD = (er + or) * 1.45 + 10;
    let rx = s.x - o.spr.x, ry = s.y - o.spr.y;
    let dist = Math.hypot(rx, ry);
    if (dist >= minD) continue;
    if (dist < 0.5) {
      const idx = list.indexOf(e);
      const ang = ((idx >= 0 ? idx : 0) * 2.39996) % 6.283;
      rx = Math.cos(ang); ry = Math.sin(ang); dist = 1;
    }
    const w = (minD - dist) / minD;
    px += (rx / dist) * w;
    py += (ry / dist) * w;
  }

  const mag = Math.hypot(px, py);
  if (mag < 0.02) return;
  const pushSpd = Math.min(1.15, mag) * (D.spd || 45) * 0.55;
  const vx = s.body.velocity.x + (px / mag) * pushSpd;
  const vy = s.body.velocity.y + (py / mag) * pushSpd;
  s.setVelocity(vx, vy);
}

(() => {
  if (typeof World === 'undefined') return;
  const W = World.prototype, _updPack0 = W.updEnemy;
  W.updEnemy = function (e, dt, locked) {
    _updPack0.apply(this, arguments);
    applyEnemySeparation(this, e, locked);
  };
})();
