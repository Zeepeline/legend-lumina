'use strict';
// T442, T445 & Elevated Border Cliffs:
// Sistem tebing bertingkat (Tier 1 & Tier 2) di area perbatasan luar peta.
// Area perbatasan ditinggikan 1-2 tingkat dataran lebih tinggi dari playable zone.
// Jalur dan pintu keluar otomatis dipasangi lereng tanjakan (verdant_cliff_slope) yang bisa dilalui.
(function () {
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  function pathIntersects(M, x, y, radius) {
    if (!M.paths || !M.paths.length) return false;
    for (const p of M.paths) {
      if (!Array.isArray(p)) continue;
      if (p.length === 5 && typeof p[0] === 'number') {
        const ax = p[0], ay = p[1], bx = p[2], by = p[3];
        const dAB = dist(ax, ay, bx, by);
        if (dAB === 0) continue;
        const u = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (dAB * dAB)));
        const px = ax + u * (bx - ax), py = ay + u * (by - ay);
        if (dist(x, y, px, py) <= radius) return true;
      } else if (Array.isArray(p[0])) {
        for (let i = 0; i < p.length - 1; i++) {
          const ax = p[i][0], ay = p[i][1], bx = p[i + 1][0], by = p[i + 1][1];
          const dAB = dist(ax, ay, bx, by);
          if (dAB === 0) continue;
          const u = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / (dAB * dAB)));
          const px = ax + u * (bx - ax), py = ay + u * (by - ay);
          if (dist(x, y, px, py) <= radius) return true;
        }
      }
    }
    return false;
  }

  function isSlope(M, cx, cy, radius) {
    const rad = radius || 48;
    if (pathIntersects(M, cx, cy, rad)) return true;
    if (M.exits && M.exits.length) {
      for (const ex of M.exits) {
        const ecx = ex.x + (ex.w || 16) / 2, ecy = ex.y + (ex.h || 16) / 2;
        if (dist(cx, cy, ecx, ecy) <= rad + 28) return true;
      }
    }
    const b = M.border;
    if (b) {
      if (b.gap && cy >= b.bottom - 45 && cx >= b.gap[0] - 25 && cx <= b.gap[1] + 25) return true;
      if (b.gapT && cy <= b.top + 45 && cx >= b.gapT[0] - 25 && cx <= b.gapT[1] + 25) return true;
      if (b.gapL && cx <= b.left + 45 && cy >= b.gapL[0] - 25 && cy <= b.gapL[1] + 25) return true;
      if (b.gapR && cx >= b.right - 45 && cy >= b.gapR[0] - 25 && cy <= b.gapR[1] + 25) return true;
    }
    return false;
  }

  function isInWater(M, cx, cy) {
    if (M.river) {
      const R = M.river;
      const ry = R.y + Math.sin(cx * (R.k || 0.009)) * (R.amp || 30);
      if (Math.abs(cy - ry) < (R.w || 36) / 2 + 15) return true;
    }
    if (M.ponds && M.ponds.length) {
      for (const P of M.ponds) {
        const dx = (cx - P[0]) / (P[2] || 25), dy = (cy - P[1]) / (P[3] || 25);
        if (dx * dx + dy * dy < 1.15) return true;
      }
    }
    return false;
  }

  function isBlocked(M, cx, cy) {
    if (M.npcs) {
      for (const n of M.npcs) if (dist(cx, cy, n.x, n.y) < 42) return true;
    }
    const KEY_OBJS = ['bigtree', 'shrine', 'woodlandshrine', 'ranch', 'stele', 'crystal', 'fence', 'house'];
    if (M.objs) {
      for (const o of M.objs) {
        if (KEY_OBJS.some(k => o[0].includes(k)) && dist(cx, cy, o[1], o[2]) < 45) return true;
      }
    }
    if (M.ranch) {
      const R = M.ranch;
      if (cx >= R.x - 20 && cx <= R.x + R.w + 20 && cy >= R.y - 20 && cy <= R.y + R.h + 20) return true;
    }
    return false;
  }

  function getBorderSegments(M) {
    if (M.indoor || !M.borderCliffs) return [];
    if (M.id && (M.id.startsWith('k') || M.id.startsWith('pl_'))) return [];
    const b = M.border;
    if (!b) return [];
    const segs = [];
    const l = b.left, r = b.right, t = b.top, bot = b.bottom;

    segs.push([l, t, r, t, 'S', 2]);
    segs.push([l, t + 45, r, t + 45, 'S', 1]);
    segs.push([l, bot - 45, r, bot - 45, 'N', 1]);
    segs.push([l, bot, r, bot, 'N', 2]);
    segs.push([l, t + 45, l, bot - 45, 'E', 2]);
    segs.push([l + 45, t + 45, l + 45, bot - 45, 'E', 1]);
    segs.push([r, t + 45, r, bot - 45, 'W', 2]);
    segs.push([r - 45, t + 45, r - 45, bot - 45, 'W', 1]);
    return segs;
  }

  function buildCliffData(M) {
    if (M._cliffsBuilt) return;
    M._cliffsBuilt = true;

    const bSegs = getBorderSegments(M);
    const allCliffs = (M.cliffs || []).concat(bSegs);
    if (!allCliffs.length) return;

    M._cliffObjs = [];
    M._cliffWalls = [];
    const isSnow = (M.ground === 'snow');

    allCliffs.forEach(cSeg => {
      const [x1, y1, x2, y2, dir, tier] = cSeg;
      const totalLen = dist(x1, y1, x2, y2);
      if (totalLen <= 0) return;
      const steps = Math.max(1, Math.round(totalLen / 100));
      const dx = (x2 - x1) / steps, dy = (y2 - y1) / steps;

      for (let s = 0; s <= steps; s++) {
        const cx = Math.round(x1 + dx * s);
        const cy = Math.round(y1 + dy * s);
        if (isInWater(M, cx, cy) || isBlocked(M, cx, cy)) continue;

        const isCorner = (s === 0 || s === steps);
        const onSlope = isSlope(M, cx, cy, 48);

        let type = 'verdant_cliff_straight';
        if (onSlope) {
          type = 'verdant_cliff_slope';
        } else if (isCorner) {
          type = 'verdant_cliff_corner';
        }

        const extra = {};
        if (dir === 'N') extra.flipY = true;
        if (dir === 'W') extra.flipX = true;
        if (isSnow) extra.tint = 0xd8eeff;
        if (tier === 2) extra.tier2 = true;
        const vert = dir === 'E' || dir === 'W'; if (vert) extra.vert = 1; /* tebing tegak: gambar & tembok tegak */

        M._cliffObjs.push([type, cx, cy, extra]);

        if (!onSlope) {
          if (vert) M._cliffWalls.push([cx - 14, cy - 50, 28, 100]);
          else M._cliffWalls.push([cx - 45, cy - 12, 90, 24]);
        }
      }
    });
  }

  const origMapObjects = typeof mapObjects === 'function' ? mapObjects : null;
  if (origMapObjects) {
    mapObjects = function (M) {
      if (!M) return [];
      buildCliffData(M);
      const list = origMapObjects(M);
      if (M._cliffObjs && M._cliffObjs.length) {
        return list.concat(M._cliffObjs);
      }
      return list;
    };
  }

  const origMapWalls = typeof mapWalls === 'function' ? mapWalls : null;
  if (origMapWalls) {
    mapWalls = function (M) {
      if (!M) return [];
      buildCliffData(M);
      const walls = origMapWalls(M);
      if (M._cliffWalls && M._cliffWalls.length) {
        return walls.concat(M._cliffWalls);
      }
      return walls;
    };
  }
})();
