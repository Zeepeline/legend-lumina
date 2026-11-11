'use strict';
// Panggang bayangan objek ke tekstur tanah
const SHC = {};
function bakeGround(sc, M) {
  const g = genGround(M); if (M.indoor) return g;
  const [c, x] = mk(M.w, M.h); x.drawImage(g, 0, 0);
  x.globalAlpha = M.dark ? .55 : .36;
  for (const o of mapObjects(M).slice().sort((a, b) => a[2] - b[2])) {
    const d = OBJ[o[0]]; if (!d.sh) continue;
    let C = SHC[d.key]; if (!C) { const tex = sc.textures.get(d.key), f = tex.has(0) ? tex.get(0) : tex.get(); C = SHC[d.key] = shadowCanvas(tex.getSourceImage(), f.cutX, f.cutY, f.cutWidth, f.cutHeight); C.w = f.cutWidth; }
    x.drawImage(C.c, Math.round(o[1] - C.w / 2 - C.pad), Math.round(o[2] + 3 - C.shH - C.pad));
  }
  x.globalAlpha = 1; return c;
}
