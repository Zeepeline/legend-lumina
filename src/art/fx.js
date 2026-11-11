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
