'use strict';
// Input keyboard, joystick, tombol sentuh, dan layout layar
// ---------------- INPUT ----------------
// Input.held: arah dari keyboard; Input.joy: vektor analog dari joystick; Input.q: tombol yang ditekan
const Input = { held: [], joy: { x: 0, y: 0, on: false }, q: [], keys: {}, aim: { on: false, x: 0, y: 0 }, castAng: null };
function press(k) { auInit(); Input.q.push(k); }
const KEYMAP = { ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', KeyZ: 'a', Space: 'a', Enter: 'a', KeyJ: 'a', KeyX: 'b', KeyK: 'b', Backspace: 'back', KeyQ: 'item', KeyE: 'item', KeyL: 'item', Escape: 'menu', KeyC: 'nova', ShiftLeft: 'dash', ShiftRight: 'dash', KeyV: 'dash', KeyM: 'map', Tab: 'map', KeyP: 'map', KeyI: 'bag', KeyB: 'bag' };
const ISDIR = { up: 1, down: 1, left: 1, right: 1 };
addEventListener('keydown', e => {
  const k = KEYMAP[e.code]; if (!k) return; e.preventDefault();
  if (ISDIR[k]) { if (!Input.held.includes(k)) Input.held.push(k); press(k); }
  else if (!e.repeat) { Input.keys[k] = true; press(k); }
});
addEventListener('keyup', e => { const k = KEYMAP[e.code]; if (!k) return; if (ISDIR[k]) { const i = Input.held.indexOf(k); if (i >= 0) Input.held.splice(i, 1); } else Input.keys[k] = false; });
addEventListener('blur', () => { Input.held.length = 0; Input.keys = {}; Input.joy.x = Input.joy.y = 0; });
Input.vec = () => {
  let x = 0, y = 0;
  for (const d of Input.held) { if (d === 'left') x = -1; if (d === 'right') x = 1; if (d === 'up') y = -1; if (d === 'down') y = 1; }
  if (Input.held.length) { const l = Math.hypot(x, y) || 1; return { x: x / l, y: y / l }; }
  return { x: Input.joy.x, y: Input.joy.y };
};
function enableTouch() { if (!document.body.classList.contains('touch')) { document.body.classList.add('touch'); layout(); } }
if (matchMedia('(pointer:coarse)').matches || ('ontouchstart' in window && navigator.maxTouchPoints > 0)) document.body.classList.add('touch');
addEventListener('touchstart', enableTouch, { passive: true });
(function () {
  const joy = $('joy'), knob = $('knob'); let pid = null, lastDir = null, rep = null;
  function upd(e) {
    const r = joy.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R); const l = Math.hypot(dx, dy), m = R * .62;
    if (l > m) { dx *= m / l; dy *= m / l; }
    knob.style.transform = `translate(${dx}px,${dy}px)`;
    let nx = dx / m, ny = dy / m; const L = Math.hypot(nx, ny);
    if (L < .2) { nx = ny = 0; } else { const s = Math.min(1, (L - .2) / .6 + .35); nx = nx / L * s; ny = ny / L * s; }
    Input.joy.x = nx; Input.joy.y = ny;
    // arah diskrit untuk menu
    const d = L < .55 ? null : Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : (dy > 0 ? 'down' : 'up');
    if (d !== lastDir) { clearInterval(rep); lastDir = d; if (d) { Input.q.push('j' + d); rep = setInterval(() => Input.q.push('j' + d), 190); } }
  }
  function end() { pid = null; Input.joy.x = Input.joy.y = 0; knob.style.transform = ''; clearInterval(rep); lastDir = null; }
  joy.addEventListener('pointerdown', e => { e.preventDefault(); auInit(); pid = e.pointerId; try { joy.setPointerCapture(pid); } catch (_) { } upd(e); });
  joy.addEventListener('pointermove', e => { if (e.pointerId === pid) upd(e); });
  joy.addEventListener('pointerup', end); joy.addEventListener('pointercancel', end); joy.addEventListener('lostpointercapture', end);
  // tombol SIHIR: tarik untuk membidik, lepas untuk menembak; ketuk = bidik otomatis
  (function () {
    const b = $('bB'); let pid = null, cx = 0, cy = 0;
    b.addEventListener('pointerdown', e => { e.preventDefault(); auInit(); pid = e.pointerId; try { b.setPointerCapture(pid); } catch (_) { } b.classList.add('on'); const r = b.getBoundingClientRect(); cx = r.left + r.width / 2; cy = r.top + r.height / 2; Input.aim = { on: true, x: 0, y: 0, t0: performance.now() }; if (UIH) { press('b'); Input.aim.on = false; pid = null; } });
    b.addEventListener('pointermove', e => { if (e.pointerId !== pid) return; const dx = e.clientX - cx, dy = e.clientY - cy, l = Math.hypot(dx, dy); Input.aim.x = l > 14 ? dx / l : 0; Input.aim.y = l > 14 ? dy / l : 0; Input.aim.drag = l > 14; b.style.transform = `translate(${Math.max(-26, Math.min(26, dx * .4))}px,${Math.max(-26, Math.min(26, dy * .4))}px)`; });
    const end = e => { if (pid === null || (e && e.pointerId !== pid)) return; pid = null; b.classList.remove('on'); b.style.transform = ''; const a = Input.aim; Input.castAng = a.drag ? Math.atan2(a.y, a.x) : null; Input.aim = { on: false, x: 0, y: 0 }; press(!a.drag && performance.now() - a.t0 > 450 ? 'nova' : 'b'); };
    b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
  })();
  document.querySelectorAll('.btn').forEach(b => {
    if (b.id === 'bB') return;
    b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); Input.keys[b.dataset.k] = true; press(b.dataset.k); });
    const up = () => { b.classList.remove('on'); Input.keys[b.dataset.k] = false; };
    b.addEventListener('pointerup', up); b.addEventListener('pointerleave', up); b.addEventListener('pointercancel', up);
  });
  SCREEN.addEventListener('pointerdown', () => auInit());
})();
let UISCALE = 1;
function layout() {
  const vw = innerWidth, vh = innerHeight, touch = document.body.classList.contains('touch'), land = vw > vh;
  let aw = vw - 10, ah = vh - 10;
  if (touch && !land) ah = vh - 222; if (touch && land) aw = vw - 2 * 180; if (!touch) ah = vh - 36;
  const s = Math.max(.6, Math.min(aw / VW, ah / VH));
  const w = Math.floor(VW * s), h = Math.floor(VH * s);
  SCREEN.style.width = w + 'px'; SCREEN.style.height = h + 'px'; UISCALE = w / VW; UI.style.transform = `scale(${UISCALE})`;
}
UI.style.height = VH + 'px';
addEventListener('resize', layout); layout();
