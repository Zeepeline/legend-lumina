'use strict';
// Peta benua Lumina (overlay utuh semua wilayah)
function openWorldMap(sc) {
  if (document.getElementById('wmap')) return;
  G.lock++;
  let timer = null;
  const overlay = document.createElement('div');
  overlay.id = 'wmap';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(10,18,14,.94)',
    zIndex: '50', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  });

  const title = document.createElement('div');
  title.textContent = 'PETA BENUA LUMINA';
  title.style.cssText = 'color:#f4d068;font-family:monospace;font-size:14px;font-weight:bold;margin-bottom:8px;letter-spacing:1px;';
  overlay.appendChild(title);

  const canvas = document.createElement('canvas');
  const maxW = Math.min(window.innerWidth - 24, 480);
  const maxH = Math.min(window.innerHeight - 80, 360);
  canvas.width = maxW;
  canvas.height = maxH;
  canvas.style.cssText = 'border:2px solid #5a4228;border-radius:4px;box-shadow:0 0 10px rgba(0,0,0,.7);background:#244a1c;';
  overlay.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const btnClose = document.createElement('button');
  btnClose.className = 'opt';
  btnClose.textContent = 'Tutup';
  btnClose.style.cssText = 'margin-top:10px;padding:6px 20px;cursor:pointer;';
  overlay.appendChild(btnClose);

  const closeMap = () => {
    if (timer) { clearInterval(timer); timer = null; }
    overlay.remove();
    G.lock--;
  };
  btnClose.onclick = closeMap;

  // Gambar peta benua
  const drawMap = (blink) => {
    ctx.fillStyle = '#244a1c';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Hitung bounds global
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    const regList = (typeof buildBenua === 'function') ? buildBenua().regions : Object.keys(WORLD_POS);
    for (const id of regList) {
      const pos = WORLD_POS[id], m = MAPS[id];
      if (!pos || !m) continue;
      minX = Math.min(minX, pos[0]);
      minY = Math.min(minY, pos[1]);
      maxX = Math.max(maxX, pos[0] + (m.w || 1024));
      maxY = Math.max(maxY, pos[1] + (m.h || 1024));
    }
    const worldW = (maxX - minX) || 1;
    const worldH = (maxY - minY) || 1;
    const pad = 12;
    const scale = Math.min((canvas.width - pad * 2) / worldW, (canvas.height - pad * 2) / worldH);
    const ox = (canvas.width - worldW * scale) / 2;
    const oy = (canvas.height - worldH * scale) / 2;

    for (const id of regList) {
      const pos = WORLD_POS[id], m = MAPS[id];
      if (!pos || !m) continue;
      const rx = ox + (pos[0] - minX) * scale;
      const ry = oy + (pos[1] - minY) * scale;
      const rw = (m.w || 1024) * scale;
      const rh = (m.h || 1024) * scale;

      if (typeof groundOverview === 'function') {
        try {
          const ov = groundOverview(m);
          if (ov) ctx.drawImage(ov, rx, ry, rw, rh);
        } catch (_) {}
      } else {
        ctx.fillStyle = '#3a6830';
        ctx.fillRect(rx, ry, rw, rh);
      }

      // Gelapkan jika belum pernah dikunjungi
      const visited = !!(S.seen && S.seen[id]);
      if (!visited) {
        ctx.fillStyle = 'rgba(0,0,0,.75)';
        ctx.fillRect(rx, ry, rw, rh);
      }

      // Teks nama wilayah (lewati wilayah peralihan)
      if (!m.peralihan) {
        ctx.font = '10px monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#000000';
        const txt = visited ? (m.name || id) : '???';
        ctx.fillText(txt, rx + rw / 2 + 1, ry + rh / 2 + 1);
        ctx.fillStyle = visited ? '#ffffff' : '#888888';
        ctx.fillText(txt, rx + rw / 2, ry + rh / 2);
      }
    }

    // Posisi Pemain (Arka)
    if (sc && sc.pl) {
      let px = sc.pl.x, py = sc.pl.y;
      if (!sc.M?.benua && sc.M?.id && WORLD_POS[sc.M.id]) {
        px += WORLD_POS[sc.M.id][0];
        py += WORLD_POS[sc.M.id][1];
      }
      const pCanvasX = ox + (px - minX) * scale;
      const pCanvasY = oy + (py - minY) * scale;

      ctx.beginPath();
      ctx.arc(pCanvasX, pCanvasY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe033';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();
    }

    // Bintang / Penanda Misi
    if (blink && typeof questTarget === 'function' && sc && sc.M) {
      try {
        const q = questTarget(sc.M);
        if (q && typeof q.x === 'number') {
          let qx = q.x, qy = q.y;
          if (!sc.M.benua && sc.M.id && WORLD_POS[sc.M.id]) {
            qx += WORLD_POS[sc.M.id][0];
            qy += WORLD_POS[sc.M.id][1];
          }
          const qcx = ox + (qx - minX) * scale;
          const qcy = oy + (qy - minY) * scale;

          ctx.fillStyle = '#ff4444';
          ctx.beginPath();
          ctx.arc(qcx, qcy, 5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      } catch (_) {}
    }
  };

  let blinkState = true;
  drawMap(blinkState);
  timer = setInterval(() => {
    blinkState = !blinkState;
    drawMap(blinkState);
  }, 400);

  document.body.appendChild(overlay);
}

// Tombol Benua di peta biasa
{
  const om0 = typeof openMapNew === 'function' ? openMapNew : null;
  if (om0) {
    openMapNew = function (sc) { // eslint-disable-line no-global-assign
      const r = om0.apply(this, arguments);
      const w = document.getElementById('mapw');
      if (w && !w.querySelector('.btnBenua')) {
        const b = document.createElement('button');
        b.className = 'btnBenua';
        b.textContent = 'Peta Benua';
        b.onclick = () => openWorldMap(sc);
        w.appendChild(b);
      }
      return r;
    };
  }
}
