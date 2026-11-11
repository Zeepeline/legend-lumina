'use strict';
// Mulai game Phaser
// ---------------- MULAI ----------------
S = newState();
let game = null;
loadImgs().then(() => {
  game = new Phaser.Game({
    type: Phaser.AUTO, parent: 'screen', width: VW, height: VH, pixelArt: true, roundPixels: true, backgroundColor: '#1a2a1a',
    physics: { default: 'arcade', arcade: { debug: false, fixedStep: false } }, scale: { mode: Phaser.Scale.NONE }, scene: [World],
    input: { keyboard: false, mouse: false, touch: false, gamepad: false }, audio: { noAudio: true }, banner: false,
  });
  game.events.once('ready', () => { setTimeout(() => { SCREEN.insertBefore(game.canvas, SCREEN.firstChild); titleScreen(); }, 50); });
});
window.__game = { get S() { return S; }, G, MAPS, press, Input, get sc() { return G.scene; }, newState, saveGame, loadSave, ITEMS };
