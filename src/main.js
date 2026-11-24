'use strict';
// Mulai game Phaser
// Kunci zoom browser (cubit, double-tap, Ctrl+roda, Ctrl +/-). iOS Safari mengabaikan user-scalable=no, jadi perlu JS.
(() => {
  const stop = e => e.preventDefault(), opt = { passive: false };
  for (const ev of ['gesturestart', 'gesturechange', 'gestureend']) document.addEventListener(ev, stop, opt);
  document.addEventListener('touchmove', e => { if (e.touches.length > 1 || (e.scale && e.scale !== 1)) e.preventDefault(); }, opt);
  let last = 0;
  document.addEventListener('touchend', e => {
    const t = Date.now();
    if (t - last < 320 && !e.target.closest('textarea')) e.preventDefault();
    last = t;
  }, opt);
  document.addEventListener('dblclick', stop, opt);
  window.addEventListener('wheel', e => { if (e.ctrlKey) e.preventDefault(); }, opt);
  window.addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && ['+', '-', '=', '0'].includes(e.key)) e.preventDefault(); });
})();
// ---------------- MULAI ----------------
S = newState();
let game = null;
loadImgs().then(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'screen', width: VW, height: VH, pixelArt: true, roundPixels: true, backgroundColor: '#5ea338',
    fps: { target: 60, min: 30, smoothStep: true },
    physics: { default: 'arcade', arcade: { debug: false, fixedStep: false } }, scale: { mode: Phaser.Scale.NONE }, scene: [World],
    input: { keyboard: false, mouse: false, touch: false, gamepad: false }, audio: { noAudio: true }, banner: false,
  });
  game.events.once('ready', () => {
    if (typeof applyLite === 'function') applyLite();
    setTimeout(() => { SCREEN.insertBefore(game.canvas, SCREEN.firstChild); titleScreen(); }, 50);
  });
});
window.__game = { get S() { return S; }, G, MAPS, press, Input, get sc() { return G.scene; }, newState, saveGame, loadSave, ITEMS };
window.god = window.immortal = function () {
  G.god = !G.god; if (G.god) S.hp = 99999; updHud();
  if (G.scene && G.scene.pl) popWorld(G.scene.pl.x, G.scene.pl.y - 30, G.god ? 'IMMORTAL ON' : 'IMMORTAL OFF', G.god ? 'gold' : 'hurt');
  return G.god ? 'Immortal: AKTIF' : 'Immortal: MATI';
};
// PWA: daftarkan service worker untuk production offline; di localhost buang cache agar perubahan langsung terbaca.
if ('serviceWorker' in navigator && /^https?:/.test(location.protocol) && !location.pathname.endsWith('/dist/game.html')) {
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    navigator.serviceWorker.getRegistrations().then(regs => { for (const r of regs) r.unregister(); });
    if ('caches' in window) caches.keys().then(ks => Promise.all(ks.map(k => caches.delete(k))));
  } else {
    navigator.serviceWorker.register('sw.js').catch(() => { });
  }
}
