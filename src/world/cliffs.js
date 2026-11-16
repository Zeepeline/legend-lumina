'use strict';
// T442 & T445: Data tebing M.cliffs = [[x1, y1, x2, y2, 'S'|'N'|'E'|'W'], ...]
// Membentangkan verdant_cliff_straight tiap 100 px, verdant_cliff_corner di sambungan/ujung,
// verdant_cliff_slope bila bersilangan dengan jalur M.paths.
// Pada peta salju (M.ground === 'snow'), aset tebing diberi tint salju atau dialihkan ke varian salju.
(function () {
  function dist(x1, y1, x2, y2) { return Math.hypot(x2 - x1, y2 - y1); }

  function pathIntersects(M, x, y, radius) {
    if (!M.paths || !M.paths.length) return false;
    for (const p of M.paths) {
      if (!Array.isArray(p)) continue;
      // Format paths: [x1, y1, x2, y2, w] atau array titik [[x1, y1], [x2, y2], ...]
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

  function buildCliffData(M) {
    if (M._cliffsBuilt) return;
    M._cliffsBuilt = true;
    if (!M.cliffs || !M.cliffs.length) return;
    M._cliffObjs = [];
    M._cliffWalls = [];
    const isSnow = (M.ground === 'snow');

    M.cliffs.forEach(cSeg => {
      const [x1, y1, x2, y2, dir] = cSeg;
      const totalLen = dist(x1, y1, x2, y2);
      if (totalLen <= 0) return;
      const steps = Math.max(1, Math.round(totalLen / 100));
      const dx = (x2 - x1) / steps, dy = (y2 - y1) / steps;

      for (let s = 0; s <= steps; s++) {
        const cx = Math.round(x1 + dx * s);
        const cy = Math.round(y1 + dy * s);
        const isCorner = (s === 0 || s === steps);
        const onSlope = pathIntersects(M, cx, cy, 45);

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
        M._cliffObjs.push([type, cx, cy, extra]);

        if (!onSlope) {
          // Wall tabrakan selebar segmen (tebal 24)
          const wx = cx - 45, wy = cy - 12;
          M._cliffWalls.push([wx, wy, 90, 24]);
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
