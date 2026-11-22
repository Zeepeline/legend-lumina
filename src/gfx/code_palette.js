'use strict';
// T439: Selaraskan warna objek KODE ke palet treeA / Verdant
// T440: Garis luar seragam 1 px berwarna (warna tetangga * 0.45, bukan hitam murni)
(function () {
  function toVerdant(canvas) {
    if (typeof location !== 'undefined' && location.search && location.search.includes('verdantpal=0')) return canvas;
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;
    const imgData = ctx.getImageData(0, 0, w, h);
    const d = imgData.data;

    // 7 warna daun treeA / Verdant (diurutkan dari gelap ke terang)
    const LEAF_PAL = [
      [34, 60, 24],
      [48, 85, 34],
      [65, 115, 46],
      [84, 142, 58],
      [112, 172, 72],
      [142, 198, 88],
      [176, 218, 112]
    ];
    // Palet cokelat kayu Verdant
    const WOOD_PAL = [
      [58, 38, 22],
      [82, 54, 30],
      [108, 72, 42],
      [136, 92, 54],
      [164, 114, 70]
    ];

    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 30) continue;
      const r = d[i], g = d[i + 1], b = d[i + 2];
      // Hijau daun (g > r + 20 dan g > b + 10)
      if (g > r + 18 && g > b + 8) {
        const bright = (r + g + b) / 3;
        const norm = Math.max(0, Math.min(1, bright / 255));
        const p = LEAF_PAL[Math.floor(norm * (LEAF_PAL.length - 1))];
        d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2];
      } else if (r > g && g > b && (r - b) > 30) {
        // Cokelat kayu
        const bright = (r + g + b) / 3;
        const norm = Math.max(0, Math.min(1, bright / 255));
        const p = WOOD_PAL[Math.floor(norm * (WOOD_PAL.length - 1))];
        d[i] = p[0]; d[i + 1] = p[1]; d[i + 2] = p[2];
      }
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  function applyVerdantOutline(canvas) {
    const w = canvas.width, h = canvas.height;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return canvas;
    const d = ctx.getImageData(0, 0, w, h).data;
    const hasPixel = (i, j) => i >= 0 && j >= 0 && i < w && j < h && d[(j * w + i) * 4 + 3] > 40;

    const [outCanvas, ox] = mk(w, h);
    for (let j = 0; j < h; j++) {
      for (let i = 0; i < w; i++) {
        if (hasPixel(i, j)) continue;
        let r = 0, g = 0, b = 0, n = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
          if (hasPixel(i + dx, j + dy)) {
            const idx = ((j + dy) * w + (i + dx)) * 4;
            r += d[idx]; g += d[idx + 1]; b += d[idx + 2]; n++;
          }
        }
        if (!n) continue;
        // Warna tetangga * 0.45 (garis luar gelap berwarna, bukan hitam pekat)
        const darkR = Math.round((r / n) * 0.45);
        const darkG = Math.round((g / n) * 0.45);
        const darkB = Math.round((b / n) * 0.45);
        ox.fillStyle = `rgb(${darkR},${darkG},${darkB})`;
        ox.fillRect(i, j, 1, 1);
      }
    }
    ctx.globalCompositeOperation = 'destination-over';
    ctx.drawImage(outCanvas, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    return canvas;
  }

  // Objek KODE non-karakter yang diselaraskan
  const CODE_OBJS = [
    'barrel', 'crate', 'sign', 'fence', 'lamp', 'dock', 'board', 'campfire',
    'rock', 'log', 'mush', 'shrine', 'chest', 'chesto', 'hay', 'windmill',
    'stalag', 'cryst', 'crystp', 'bones', 'anvil', 'forge', 'pear', 'bramble',
    'bell', 'bloom', 'dummy', 'pebbles', 'totem', 'fieldoven', 'root'
  ];

  const origBuildTextures = typeof buildTextures === 'function' ? buildTextures : null;
  if (origBuildTextures) {
    buildTextures = function (sc) {
      origBuildTextures(sc);
      const T = sc.textures;
      CODE_OBJS.forEach(key => {
        if (!T.exists(key)) return;
        const src = T.get(key).getSourceImage();
        if (src && src.getContext) {
          toVerdant(src);
          applyVerdantOutline(src);
          const tx = T.get(key); /* tekstur gambar biasa tidak punya update() */
          if (tx.update) tx.update(); else if (tx.source && tx.source[0] && tx.source[0].update) tx.source[0].update();
        }
      });
    };
  }
})();
