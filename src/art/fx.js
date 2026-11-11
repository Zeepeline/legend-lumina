'use strict';
// Efek: tebasan, api, proyektil, cahaya, bayangan
// tebasan pedang (3 frame), menghadap kanan
function artSlash() {
  const frames = [];
  const spans = [[-1.15, -.25], [-1.15, .75], [-.6, 1.15]];
  for (let f = 0; f < 3; f++) {
    const [c, x] = mk(28, 36), cx = 4, cy = 18, [a0, a1] = spans[f];
    for (let a = a0; a <= a1; a += .015) {
      const t = (a - a0) / (a1 - a0), w = Math.sin(t * Math.PI) * (f === 2 ? 3 : 5);
      for (let r = 9; r <= 19; r++) {
        if (r < 19 - w) continue;
        const col = r >= 18 ? '#ffffff' : (f === 2 ? '#cfeaff' : t > .4 ? '#e8f8ff' : '#9fd8ff');
        px(x, col, cx + Math.cos(a) * r, cy + Math.sin(a) * r);
      }
    }
    frames.push(c);
  }
  return strip(frames);
}
function artFire() {
  const frames = [];
  for (let f = 0; f < 2; f++) {
    const [c, x] = mk(16, 12);
    for (let i = 0; i < 5; i++) ellF(x, i % 2 ? '#ff6a1a' : '#ffa42a', 4 - i * .4 - f, 6 + Math.sin(i + f) * 1.4, 2.2 - i * .3, 1.6 - i * .2);
    ellF(x, '#e03a1a', 10, 6, 5, 4.5); ellF(x, '#ff8a2a', 10, 6, 4, 3.5); ellF(x, '#ffd84a', 11, 6, 2.5, 2.2); ellF(x, '#ffffff', 11, 5.5, 1, 1);
    frames.push(c);
  }
  return strip(frames);
}
function artSpore() { const [c, x] = mk(8, 8); ellF(x, '#8a3ab8', 4, 4, 3.5, 3.5); ellF(x, '#c88aff', 3.5, 3.5, 2, 2); px(x, '#ffffff', 3, 3); return c; }
function artDot(col, r) { const [c, x] = mk(r * 2 + 1, r * 2 + 1); ellF(x, col, r, r, r, r); return c; }
function artSmoke() { const [c, x] = mk(10, 10); ellF(x, '#e8e8ec', 5, 5, 4.5, 4.5); ellF(x, '#ffffff', 4, 4, 2.5, 2.5); return c; }
function artSpark() { const [c, x] = mk(9, 9); fr(x, '#ffffff', 4, 0, 1, 9); fr(x, '#ffffff', 0, 4, 9, 1); fr(x, '#fff6a0', 3, 3, 3, 3); fr(x, '#ffffff', 4, 4, 1, 1); return c; }
function artButterfly() {
  const frames = [];
  for (let f = 0; f < 2; f++) { const [c, x] = mk(8, 6); if (!f) { fr(x, '#ffb4e0', 0, 0, 3, 3); fr(x, '#ffb4e0', 5, 0, 3, 3); fr(x, '#ff8ac8', 1, 3, 2, 2); fr(x, '#ff8ac8', 5, 3, 2, 2); } else { fr(x, '#ffb4e0', 2, 1, 1, 3); fr(x, '#ffb4e0', 5, 1, 1, 3); } fr(x, '#3a2a3a', 3, 1, 2, 4); frames.push(c); }
  return strip(frames);
}
function artShadow(w, h) { const [c, x] = mk(w, h); ellF(x, '#000000', w / 2, h / 2, w / 2, h / 2); return c; }
function artBone() { const [c, x] = mk(10, 6); fr(x, '#f0ead8', 2, 2, 6, 2); fr(x, '#f0ead8', 0, 1, 3, 4); fr(x, '#f0ead8', 7, 1, 3, 4); fr(x, '#c8bea8', 2, 3, 6, 1); return outline(c, '#3a3040'); }
function artSeed() { const [c, x] = mk(7, 7); ellF(x, '#7ac84a', 3, 3, 2.6, 2.6); px(x, '#d8ff9a', 2, 2); return outline(c, '#1d3a1c'); }
function artRockShot() { const [c, x] = mk(12, 11); ellF(x, '#7a7484', 6, 6, 4.5, 4); ellF(x, '#a8a2b2', 5, 5, 2.5, 2); return outline(c, '#2a2630'); }
function artBrazier() { const [c, x] = mk(18, 16); fr(x, '#6a7488', 6, 8, 6, 8); fr(x, '#8a94a8', 7, 8, 2, 8); ellF(x, '#5a6478', 9, 6, 8.5, 3.5); ellF(x, '#8a94a8', 9, 5, 7.5, 2.6); ellF(x, '#2a2e3a', 9, 5, 5.5, 1.6); fr(x, '#4a5266', 4, 14, 10, 2); return outline(c, '#2a2c3a'); }
function artIceGate() { const [c, x] = mk(84, 34); for (let i = 0; i < 9; i++) { const w = 10, h = 22 + ((i * 7) % 11), X = i * 9 + 1; fr(x, '#9ad4f4', X, 34 - h, w, h); fr(x, '#e8f8ff', X + 2, 34 - h + 2, 2, h - 6); fr(x, '#6aa8d8', X + w - 2, 34 - h, 2, h); } return outline(c, '#3a6a9a'); }
function artIceBolt() { const [c, x] = mk(10, 8); ellF(x, '#9ad4f4', 5, 4, 4, 2.5); fr(x, '#ffffff', 3, 3, 3, 1); return outline(c, '#3a6a9a'); }
function artWarp(on) { const [c, x] = mk(16, 28); fr(x, '#6a6478', 3, 22, 10, 5); fr(x, '#8a8498', 4, 6, 8, 17); fr(x, '#aaa4b8', 5, 6, 2, 17); fr(x, '#8a8498', 5, 3, 6, 3); fr(x, '#aaa4b8', 6, 2, 3, 1); const r = on ? '#7af0ff' : '#5a5468'; fr(x, r, 7, 9, 2, 1); fr(x, r, 6, 11, 4, 1); fr(x, r, 7, 13, 2, 4); fr(x, r, 6, 18, 4, 1); if (on) { fr(x, '#ffffff', 7, 13, 1, 2); } return outline(c, '#2a2634'); }
function artStele() { const [c, x] = mk(18, 24); fr(x, '#6e6a7a', 3, 20, 12, 4); fr(x, '#9a96a6', 4, 4, 10, 17); fr(x, '#b8b4c4', 5, 4, 3, 17); fr(x, '#9a96a6', 5, 2, 8, 2); fr(x, '#5a5668', 7, 8, 5, 1); fr(x, '#5a5668', 7, 11, 4, 1); fr(x, '#5a5668', 7, 14, 5, 1); fr(x, '#5a5668', 7, 17, 3, 1); fr(x, '#7ab85a', 3, 21, 3, 2); fr(x, '#7ab85a', 13, 22, 2, 1); return outline(c, '#2e2a3a'); }
function artBoat() { const [c, x] = mk(44, 16); fr(x, '#8a5a32', 4, 6, 36, 6); fr(x, '#a87444', 6, 6, 32, 2); fr(x, '#6a4224', 8, 12, 28, 2); fr(x, '#5a3a20', 6, 4, 32, 2); fr(x, '#c89a5a', 20, 2, 2, 4); fr(x, '#8a5a32', 30, 0, 2, 8); return outline(c, '#2a1c14'); }
function artRelief() { const [c, x] = mk(40, 30); fr(x, '#8a94a8', 0, 0, 40, 30); fr(x, '#a8b2c4', 2, 2, 36, 26); fr(x, '#6a7488', 6, 20, 28, 2); fr(x, '#6a7488', 10, 8, 3, 12); fr(x, '#6a7488', 18, 5, 4, 15); fr(x, '#6a7488', 27, 9, 3, 11); fr(x, '#4a5468', 4, 23, 32, 1); fr(x, '#4a5468', 8, 25, 6, 1); fr(x, '#4a5468', 24, 25, 8, 1); fr(x, '#e8d070', 19, 3, 2, 2); return outline(c, '#2e3444'); }
function artSealDoor(open) { const [c, x] = mk(30, 38); fr(x, '#7a8498', 0, 0, 30, 38); fr(x, '#5a6478', 3, 3, 24, 35); if (open) { fr(x, '#1a1e2a', 5, 5, 20, 33); fr(x, '#3a4458', 5, 5, 20, 3); } else { fr(x, '#9aa4b8', 5, 5, 20, 33); fr(x, '#b4bed0', 6, 6, 4, 31); const g = '#5af0d0'; fr(x, g, 14, 14, 2, 8); fr(x, g, 12, 16, 6, 1); fr(x, g, 11, 18, 8, 2); fr(x, g, 12, 20, 6, 1); } return outline(c, '#2a3040'); }
function artLight(r) { const s = r * 2, [c, x] = mk(s, s); const g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.45, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); return c; }
function artRain() { const [c, x] = mk(2, 7); fr(x, '#d8ecff', 1, 0, 1, 3); fr(x, '#d8ecff', 0, 3, 1, 4); return c; }
// bayangan karakter lembut (gradasi, bukan elips keras)
function artShadowSoft(w, h) { const [c, x] = mk(w, h); x.save(); x.scale(1, h / w); const g = x.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2); g.addColorStop(0, 'rgba(10,30,20,.85)'); g.addColorStop(.6, 'rgba(10,30,20,.5)'); g.addColorStop(1, 'rgba(10,30,20,0)'); x.fillStyle = g; x.fillRect(0, 0, w, w); x.restore(); return c; }
function artFog() { const [c, x] = mk(96, 64); x.save(); x.scale(1, 64 / 96); const g = x.createRadialGradient(48, 48, 0, 48, 48, 48); g.addColorStop(0, 'rgba(230,240,235,.9)'); g.addColorStop(1, 'rgba(230,240,235,0)'); x.fillStyle = g; x.fillRect(0, 0, 96, 96); x.restore(); return c; }
function artRipple() { const fr2 = []; for (let f = 0; f < 3; f++) { const [c, x] = mk(24, 12); x.strokeStyle = 'rgba(230,250,255,' + (.9 - f * .25) + ')'; x.lineWidth = 1; x.beginPath(); x.ellipse(12, 6, 4 + f * 3.5, 2 + f * 1.6, 0, 0, 6.29); x.stroke(); fr(x, '#ffffff', 11, 5, 2, 1); fr2.push(c); } return strip(fr2); }
function artSprout(ready) { const [c, x] = mk(12, 12); if (!ready) { fr(x, '#3f8a34', 5, 5, 2, 6); fr(x, '#6cc04a', 2, 4, 3, 2); fr(x, '#6cc04a', 7, 3, 3, 2); return outline(c); } fr(x, '#ff8a2a', 4, 8, 4, 3); fr(x, '#ffd08a', 4, 8, 1, 2); for (let l = -2; l <= 2; l++) fr(x, '#4f9a34', 6 + l, 2 + Math.abs(l), 1, 6 - Math.abs(l)); return outline(c); }
// bayangan siluet: bentuk objek dipipihkan & dicondongkan ke kanan (cahaya kiri-atas), lalu diburamkan
function shadowCanvas(src, sx, sy, w, h) {
  const shH = Math.max(5, Math.round(h * .28)), shift = Math.round(h * .32), pad = 7;
  const [s1, x1] = mk(w, h); x1.drawImage(src, sx, sy, w, h, 0, 0, w, h); x1.globalCompositeOperation = 'source-in'; x1.fillStyle = '#0a2416'; x1.fillRect(0, 0, w, h);
  const [s2, x2] = mk(w + shift + pad * 2, shH + pad * 2);
  x2.setTransform(1, 0, -shift / h, shH / h, pad + shift, pad); x2.drawImage(s1, 0, 0);
  const [c, x] = mk(s2.width, s2.height); x.filter = 'blur(2.2px)'; x.drawImage(s2, 0, 0);
  return { c, pad, shH };
}
function artLightP(r, peak) { const s = r * 2, [c, x] = mk(s, s); const g = x.createRadialGradient(r, r, 0, r, r, r); g.addColorStop(0, `rgba(255,255,255,${peak})`); g.addColorStop(.5, `rgba(255,255,255,${peak * .55})`); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); return c; }
