'use strict';
// Peta benua Lumina (overlay utuh semua wilayah dengan drag & zoom)
function openWorldMap(sc) {
  if (document.getElementById('wmap')) return;
  G.lock++;
  let timer = null;
  const overlay = document.createElement('div');
  overlay.id = 'wmap';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', background: 'rgba(10,18,14,.95)',
    zIndex: '50', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
  });

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;width:min(94vw, 540px);margin-bottom:6px;';

  const title = document.createElement('div');
  title.textContent = 'PETA BENUA LUMINA';
  title.style.cssText = 'color:#f4d068;font-family:monospace;font-size:13px;font-weight:bold;letter-spacing:1px;';
  header.appendChild(title);

  const controls = document.createElement('div');
  controls.style.cssText = 'display:flex;gap:6px;align-items:center;';

  const btnFocus = document.createElement('button');
  btnFocus.className = 'opt';
  btnFocus.textContent = '🎯 Fokus Arka';
  btnFocus.style.cssText = 'padding:2px 8px;font-size:11px;cursor:pointer;';
  controls.appendChild(btnFocus);

  const btnZoomOut = document.createElement('button');
  btnZoomOut.className = 'opt';
  btnZoomOut.textContent = '−';
  btnZoomOut.style.cssText = 'padding:2px 8px;font-size:13px;font-weight:bold;cursor:pointer;';
  controls.appendChild(btnZoomOut);

  const btnZoomIn = document.createElement('button');
  btnZoomIn.className = 'opt';
  btnZoomIn.textContent = '+';
  btnZoomIn.style.cssText = 'padding:2px 8px;font-size:13px;font-weight:bold;cursor:pointer;';
  controls.appendChild(btnZoomIn);

  header.appendChild(controls);
  overlay.appendChild(header);

  const canvas = document.createElement('canvas');
  const maxW = Math.min(window.innerWidth - 20, 540);
  const maxH = Math.min(window.innerHeight - 100, 380);
  canvas.width = maxW;
  canvas.height = maxH;
  canvas.style.cssText = 'border:2px solid #5a4228;border-radius:4px;box-shadow:0 0 12px rgba(0,0,0,.8);background:#1a2e16;cursor:grab;touch-action:none;';
  overlay.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const hint = document.createElement('div');
  hint.textContent = 'Geser / drag untuk menjelajahi peta · Scroll / tombol + − untuk zoom';
  hint.style.cssText = 'color:#a0b898;font-size:11px;font-family:sans-serif;margin-top:6px;text-align:center;';
  overlay.appendChild(hint);

  const btnClose = document.createElement('button');
  btnClose.className = 'opt';
  btnClose.textContent = 'Tutup';
  btnClose.style.cssText = 'margin-top:8px;padding:5px 24px;cursor:pointer;font-size:12px;';
  overlay.appendChild(btnClose);

  const closeMap = () => {
    if (timer) { clearInterval(timer); timer = null; }
    overlay.remove();
    G.lock--;
  };
  btnClose.onclick = closeMap;

  // Hitung bounds global benua
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
  const pad = 16;
  const baseScale = Math.min((canvas.width - pad * 2) / worldW, (canvas.height - pad * 2) / worldH);

  let zoom = 1.0;
  // Offset pan dalam koordinat layar canvas
  let panX = (canvas.width - worldW * baseScale) / 2;
  let panY = (canvas.height - worldH * baseScale) / 2;

  // Dapatkan posisi pemain global
  let globalPx = minX + worldW / 2, globalPy = minY + worldH / 2;
  if (sc && sc.pl) {
    globalPx = sc.pl.x;
    globalPy = sc.pl.y;
    if (!sc.M?.benua && sc.M?.id && WORLD_POS[sc.M.id]) {
      globalPx += WORLD_POS[sc.M.id][0];
      globalPy += WORLD_POS[sc.M.id][1];
    }
  }

  const focusPlayer = () => {
    const s = baseScale * zoom;
    panX = canvas.width / 2 - (globalPx - minX) * s;
    panY = canvas.height / 2 - (globalPy - minY) * s;
  };

  btnFocus.onclick = () => { focusPlayer(); drawMap(blinkState); };
  btnZoomIn.onclick = () => { changeZoom(1.3, canvas.width / 2, canvas.height / 2); };
  btnZoomOut.onclick = () => { changeZoom(1 / 1.3, canvas.width / 2, canvas.height / 2); };

  function changeZoom(factor, cx, cy) {
    const newZoom = Math.max(0.7, Math.min(4.5, zoom * factor));
    if (newZoom === zoom) return;
    const ratio = newZoom / zoom;
    panX = cx - (cx - panX) * ratio;
    panY = cy - (cy - panY) * ratio;
    zoom = newZoom;
    drawMap(blinkState);
  }

  // Pointer drag & gestures
  let isDragging = false;
  let dragStartX = 0, dragStartY = 0;
  const activePointers = new Map();
  let initialPinchDist = 0;

  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture(e.pointerId);
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (activePointers.size === 1) {
      isDragging = true;
      dragStartX = e.clientX - panX;
      dragStartY = e.clientY - panY;
      canvas.style.cursor = 'grabbing';
    } else if (activePointers.size === 2) {
      const [p1, p2] = Array.from(activePointers.values());
      initialPinchDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }
  });

  canvas.addEventListener('pointermove', e => {
    if (!activePointers.has(e.pointerId)) return;
    activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    if (activePointers.size === 2) {
      const [p1, p2] = Array.from(activePointers.values());
      const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (initialPinchDist > 0 && Math.abs(dist - initialPinchDist) > 5) {
        const factor = dist / initialPinchDist;
        const midX = (p1.x + p2.x) / 2 - canvas.getBoundingClientRect().left;
        const midY = (p1.y + p2.y) / 2 - canvas.getBoundingClientRect().top;
        changeZoom(factor, midX, midY);
        initialPinchDist = dist;
      }
    } else if (isDragging) {
      panX = e.clientX - dragStartX;
      panY = e.clientY - dragStartY;
      drawMap(blinkState);
    }
  });

  const endDrag = e => {
    activePointers.delete(e.pointerId);
    try { canvas.releasePointerCapture(e.pointerId); } catch (_) {}
    if (activePointers.size === 0) {
      isDragging = false;
      canvas.style.cursor = 'grab';
    } else if (activePointers.size === 1) {
      const p = Array.from(activePointers.values())[0];
      dragStartX = p.x - panX;
      dragStartY = p.y - panY;
    }
  };

  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);

  canvas.addEventListener('wheel', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const factor = e.deltaY < 0 ? 1.2 : 0.833;
    changeZoom(factor, mx, my);
  }, { passive: false });

  // Gambar peta benua
  const drawMap = (blink) => {
    ctx.fillStyle = '#172714';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const s = baseScale * zoom;

    // Gambar grid latar halus
    ctx.strokeStyle = 'rgba(255,255,255,.03)';
    ctx.lineWidth = 1;
    const gridSize = Math.max(30, Math.round(120 * s));
    const startGX = ((panX % gridSize) + gridSize) % gridSize;
    const startGY = ((panY % gridSize) + gridSize) % gridSize;
    ctx.beginPath();
    for (let x = startGX; x < canvas.width; x += gridSize) { ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); }
    for (let y = startGY; y < canvas.height; y += gridSize) { ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); }
    ctx.stroke();

    for (const id of regList) {
      const pos = WORLD_POS[id], m = MAPS[id];
      if (!pos || !m) continue;
      const rx = panX + (pos[0] - minX) * s;
      const ry = panY + (pos[1] - minY) * s;
      const rw = (m.w || 1024) * s;
      const rh = (m.h || 1024) * s;

      // Culling jika di luar layar
      if (rx + rw < 0 || rx > canvas.width || ry + rh < 0 || ry > canvas.height) continue;

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
        ctx.fillStyle = 'rgba(0,0,0,.78)';
        ctx.fillRect(rx, ry, rw, rh);
      }

      // Garis tepi wilayah
      ctx.strokeStyle = visited ? 'rgba(255,230,120,.25)' : 'rgba(0,0,0,.4)';
      ctx.lineWidth = 1;
      ctx.strokeRect(rx, ry, rw, rh);

      // Teks nama wilayah (lewati wilayah peralihan)
      if (!m.peralihan) {
        const fontSize = Math.max(9, Math.min(14, Math.round(10 * Math.sqrt(zoom))));
        ctx.font = `bold ${fontSize}px monospace`;
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
      const pCanvasX = panX + (globalPx - minX) * s;
      const pCanvasY = panY + (globalPy - minY) * s;

      // Efek lingkar radar Arka
      ctx.beginPath();
      ctx.arc(pCanvasX, pCanvasY, blink ? 7 : 5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 230, 60, .35)';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(pCanvasX, pCanvasY, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ffe033';
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#000000';
      ctx.stroke();

      // Label "Kamu"
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.fillStyle = '#000';
      ctx.fillText('Arka', pCanvasX + 1, pCanvasY - 7);
      ctx.fillStyle = '#ffe033';
      ctx.fillText('Arka', pCanvasX, pCanvasY - 8);
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
          const qcx = panX + (qx - minX) * s;
          const qcy = panY + (qy - minY) * s;

          ctx.fillStyle = '#ff4444';
          ctx.beginPath();
          ctx.arc(qcx, qcy, 6, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();

          ctx.fillStyle = '#ffffff';
          ctx.font = '10px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('★', qcx, qcy + 3.5);
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
