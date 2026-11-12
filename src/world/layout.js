'use strict';
// Tata letak dunia terbuka (Tahap 1): posisi relatif wilayah tetangga dihitung dari pasangan pintu keluar
// di tepi peta (pintu A→B di tepi timur A disejajarkan dengan pintu B→A di tepi barat B, dst.).
// Dipakai systems/openworld.js untuk menggambar wilayah tetangga & menyeberang tanpa layar hitam.
function exitSide(M, e) { return e.x < 20 ? 'W' : e.x + e.w > M.w - 20 ? 'E' : e.y < 20 ? 'N' : e.y + e.h > M.h - 20 ? 'S' : null; }
const OPP = { W: 'E', E: 'W', N: 'S', S: 'N' };
const NEIGH = {}; // id → [{ to, side, ox, oy, ex }]
(function buildNeighbors() {
  for (const A of Object.values(MAPS)) {
    if (A.indoor) continue; NEIGH[A.id] = [];
    for (const ea of A.exits || []) {
      const B = MAPS[ea.to], side = exitSide(A, ea); if (!B || B.indoor || !side) continue;
      const eb = (B.exits || []).find(e => e.to === A.id && exitSide(B, e) === OPP[side]); if (!eb) continue;
      const ca = [ea.x + ea.w / 2, ea.y + ea.h / 2], cb = [eb.x + eb.w / 2, eb.y + eb.h / 2];
      let ox, oy;
      if (side === 'E') { ox = A.w; oy = ca[1] - cb[1]; } else if (side === 'W') { ox = -B.w; oy = ca[1] - cb[1]; }
      else if (side === 'N') { oy = -B.h; ox = ca[0] - cb[0]; } else { oy = A.h; ox = ca[0] - cb[0]; }
      NEIGH[A.id].push({ to: B.id, side, ox: Math.round(ox), oy: Math.round(oy), ex: ea });
    }
  }
})();
