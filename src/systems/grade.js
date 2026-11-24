'use strict';
// Sistem Rona Wilayah & Transisi Antar Wilayah Halus (v1.52.0 - ala 36 Bioma Cobo Makes Games / Mytheria)
// Setiap bioma memiliki tanda tangan palet warna (ColorMatrix) yang unik dan berkarakter kuat.
// Saat Arka melangkah mendekati perbatasan wilayah di dunia terbuka, rona warna berinterpolasi secara mulus (lerp S-curve)
// tanpa sentakan visual, menyatu sempurna dengan pencahayaan waktu (pagi, siang, sore keemasan, malam).
// Kamera scene World & GL (GroundLayer) diselaraskan sehingga seluruh objek, tanah, dan karakter menyatu harmonis.

const ID_M = [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0];

// Profil rona warna khas per bioma (tanda tangan atmosfer visual)
const BIOME_GRADE = {
  village:  [1.05, 0.02, 0.00, 0, 2,  0.01, 1.03, 0.00, 0, 1,  0.00, 0.01, 0.95, 0, -2,  0, 0, 0, 1, 0], // Kehangatan desa ramah & jernih
  meadow:   [1.03, 0.03, 0.00, 0, 2,  0.01, 1.07, 0.01, 0, 3,  0.00, 0.01, 0.96, 0, -1,  0, 0, 0, 1, 0], // Padang rumput cerah berlimpah mentari
  forest:   [0.96, 0.04, 0.00, 0, -2, 0.02, 1.06, 0.02, 0, 2,  0.00, 0.02, 0.92, 0, -3,  0, 0, 0, 1, 0], // Kanopi zamrud dalam & kayu hangat
  deepwood: [0.88, 0.06, 0.02, 0, -5, 0.03, 1.05, 0.04, 0, 1,  0.02, 0.06, 0.94, 0, 3,   0, 0, 0, 1, 0], // Hutan lumut magis berkabut misterius
  swamp:    [0.90, 0.04, 0.04, 0, -7, 0.02, 1.02, 0.06, 0, -2, 0.03, 0.08, 1.05, 0, 5,   0, 0, 0, 1, 0], // Rawa lembap berkabut & pendar spora
  snow:     [0.95, 0.02, 0.06, 0, 3,  0.02, 0.98, 0.05, 0, 3,  0.03, 0.06, 1.14, 0, 8,   0, 0, 0, 1, 0], // Puncak beku kristal salju & es dingin
  cave:     [0.92, 0.02, 0.04, 0, -8, 0.02, 0.92, 0.04, 0, -5, 0.04, 0.04, 1.06, 0, -1,  0, 0, 0, 1, 0], // Batuan slate gelap & kilau kristal
  lake:     [0.97, 0.02, 0.03, 0, 1,  0.01, 1.02, 0.03, 0, 2,  0.02, 0.04, 1.08, 0, 5,   0, 0, 0, 1, 0], // Danau jernih pantulan biru langit
  road:     [1.05, 0.03, 0.00, 0, 3,  0.02, 1.02, 0.00, 0, 1,  0.00, 0.01, 0.93, 0, -3,  0, 0, 0, 1, 0], // Jalur lintas tanah kering & batu kuno
  city:     [1.02, 0.01, 0.01, 0, 2,  0.01, 1.01, 0.01, 0, 1,  0.01, 0.01, 1.02, 0, 2,   0, 0, 0, 1, 0], // Kota kerajaan batu mulia & panji megah
};

function biomeBaseMatrix(id, ground) {
  if (BIOME_GRADE[id]) return BIOME_GRADE[id];
  if (ground && BIOME_GRADE[ground]) return BIOME_GRADE[ground];
  return BIOME_GRADE.village;
}

function lerpMatrix(out, a, b, t) {
  const s = t * t * (3 - 2 * t); // Kurva S-curve halus
  for (let i = 0; i < 20; i++) out[i] = a[i] + (b[i] - a[i]) * s;
  return out;
}

// Menghitung target rona warna berdasarkan bioma aktif + interpolasi perbatasan tetangga + siklus waktu
const TRANS_BAND = 240; // Pita peralihan perbatasan mulus (px)
function calcTargetGrade(sc, out) {
  if (OPT.lite || !OPT.grade || !sc.M || sc.M.indoor) {
    for (let i = 0; i < 20; i++) out[i] = ID_M[i];
    return out;
  }
  const mid = sc.M.id, baseM = biomeBaseMatrix(mid, sc.M.ground);
  let blendTarget = baseM, blendWeight = 0;

  // Cek kedekatan dengan perbatasan wilayah tetangga (open world)
  if (sc.pl && sc.owN && sc.owN.length && typeof WORLD_POS !== 'undefined' && WORLD_POS[mid]) {
    const pl = sc.pl, Mw = sc.M.w, Mh = sc.M.h;
    for (const n of sc.owN) {
      if (!n || !n.to || !MAPS[n.to] || MAPS[n.to].indoor) continue;
      let dist = 1e9;
      if (n.side === 'S') dist = Mh - pl.y;
      else if (n.side === 'N') dist = pl.y;
      else if (n.side === 'E') dist = Mw - pl.x;
      else if (n.side === 'W') dist = pl.x;
      if (dist >= 0 && dist < TRANS_BAND) {
        const w = Math.max(0, Math.min(0.5, (1 - dist / TRANS_BAND) * 0.5));
        if (w > blendWeight) {
          blendWeight = w;
          blendTarget = biomeBaseMatrix(n.to, MAPS[n.to].ground);
        }
      }
    }
  }

  // Interpolasi bioma dasar dengan bioma tetangga
  if (blendWeight > 0.001) lerpMatrix(out, baseM, blendTarget, blendWeight * 2);
  else for (let i = 0; i < 20; i++) out[i] = baseM[i];

  // Penyesuaian rona waktu: sore keemasan & malam sejuk
  const h = (typeof S !== 'undefined' && S.time != null) ? S.time : 12;
  const nAmt = typeof nightAmt === 'function' ? nightAmt() : 0;
  if (h >= 15.5 && h <= 18.8) {
    const duskT = Math.sin((h - 15.5) / 3.3 * Math.PI) * 0.42; // Rona senja hangat
    out[0] += duskT * 0.10; out[4] += duskT * 12;
    out[6] += duskT * 0.05; out[9] += duskT * 4;
    out[12] -= duskT * 0.08; out[14] -= duskT * 6;
  } else if (nAmt > 0.15) {
    const nightT = Math.min(1, (nAmt - 0.15) * 1.3) * 0.35; // Rona malam biru sejuk
    out[0] -= nightT * 0.08; out[4] -= nightT * 10;
    out[6] -= nightT * 0.04; out[9] -= nightT * 6;
    out[12] += nightT * 0.12; out[14] += nightT * 8;
  }
  return out;
}

function applyGradeFX(sc, cam, m) {
  if (sc.game.renderer.type !== Phaser.WEBGL || !cam.postFX) return false;
  if (OPT.lite || !OPT.grade) {
    if (cam._gradeFX) { try { cam.postFX.remove(cam._gradeFX); } catch (_) {} cam._gradeFX = null; }
    return false;
  }
  let fx = cam._gradeFX;
  if (!fx) fx = cam._gradeFX = cam.postFX.addColorMatrix();
  fx.set(m);
  return true;
}

{ const W = World.prototype, _cr = W.create;
  W.create = function () {
    const r = _cr.apply(this, arguments);
    this._curGrade = ID_M.slice();
    this._targetGrade = ID_M.slice();
    calcTargetGrade(this, this._curGrade);
    applyGradeFX(this, this.cameras.main, this._curGrade);
    if (!this._gradeHook) {
      this._gradeHook = 1;
      this.events.on('postupdate', (_, dl) => {
        if (G.scene !== this || !this.M) return;
        const dt = Math.min(dl || 16, 100) / 1000;
        calcTargetGrade(this, this._targetGrade);
        // Lerp mulus tanpa sentakan pergerakan
        let changed = false;
        const speed = Math.min(1, dt * 4.5);
        for (let i = 0; i < 20; i++) {
          const diff = this._targetGrade[i] - this._curGrade[i];
          if (Math.abs(diff) > 0.0005) { this._curGrade[i] += diff * speed; changed = true; }
        }
        if (changed || !this.cameras.main._gradeFX) {
          applyGradeFX(this, this.cameras.main, this._curGrade);
          const gl = this.scene.get('GL');
          if (gl && gl.cameras && gl.cameras.main) applyGradeFX(gl, gl.cameras.main, this._curGrade);
        }
      });
    }
    return r;
  };
}
