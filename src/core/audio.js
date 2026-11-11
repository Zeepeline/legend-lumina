'use strict';
// Audio chiptune WebAudio: musik (TRACKS) & efek suara (sfx)
// ---------------- AUDIO (chiptune WebAudio) ----------------
const AU = { ctx: null, on: true, cur: null, seq: null };
const NI = { C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5, 'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11 };
function nf(n) { if (n === 'R') return 0; const m = n.match(/^([A-G]#?)(\d)$/); return 440 * Math.pow(2, (NI[m[1]] + (m[2] - 4) * 12 - 9) / 12); }
function parseSeq(s) { return s.trim().split(/\s+/).map(t => { const [n, b] = t.split(':'); return { f: nf(n), b: +b }; }); }
const bossBass = ['A2', 'F2', 'A2', 'E2', 'F2', 'D2', 'E2', 'A2'].map(r => { const o = r.replace(/\d/, d => +d + 1); return (`${r}:0.5 ${o}:0.5 `).repeat(4); }).join('');
const TRACKS = {
  town: { bpm: 104, loop: true, v: [
    { s: 'E5:1 D5:0.5 C5:0.5 D5:1 G4:1 C5:1.5 D5:0.5 E5:2 F5:1 E5:0.5 D5:0.5 C5:1 A4:1 B4:1.5 C5:0.5 D5:2 E5:1 D5:0.5 C5:0.5 D5:1 G4:1 C5:1 E5:1 G5:2 F5:1 E5:0.5 D5:0.5 E5:1 D5:1 C5:4', type: 'square', vol: .32 },
    { s: 'C3:1 G3:1 E3:1 G3:1 A2:1 E3:1 C3:1 E3:1 F2:1 C3:1 A2:1 C3:1 G2:1 D3:1 B2:1 D3:1 C3:1 G3:1 E3:1 G3:1 A2:1 E3:1 C3:1 E3:1 F2:1 C3:1 G2:1 D3:1 C3:2 G2:2', type: 'triangle', vol: .9 }] },
  field: { bpm: 128, loop: true, v: [
    { s: 'A4:1 C5:1 E5:2 D5:1 C5:1 B4:2 A4:1 B4:1 C5:1 E5:1 D5:4 C5:1 D5:1 E5:2 G5:1 F5:1 E5:2 D5:1 C5:1 B4:1 G4:1 A4:4', type: 'square', vol: .32 },
    { s: 'A2:2 A2:2 G2:2 G2:2 F2:2 F2:2 E2:2 E2:2 A2:2 A2:2 C3:2 C3:2 D3:2 D3:2 E2:2 E2:2', type: 'triangle', vol: .9 }] },
  meadow: { bpm: 116, loop: true, v: [
    { s: 'G4:1 B4:1 D5:1 G5:1 F#5:1 D5:1 E5:2 C5:1 E5:1 G5:1 E5:1 D5:4 B4:1 D5:1 G5:1 B5:1 A5:1 G5:1 E5:2 F#5:1 E5:1 D5:1 A4:1 G4:4', type: 'square', vol: .3 },
    { s: 'G2:2 D3:2 C3:2 G2:2 A2:2 E3:2 D3:4 G2:2 D3:2 E3:2 C3:2 D3:2 D3:2 G2:4', type: 'triangle', vol: .9 }] },
  cave: { bpm: 84, loop: true, v: [
    { s: 'E4:2 G4:1 B4:1 A4:2 F4:2 E4:2 D4:1 E4:1 B3:4 E4:2 G4:1 B4:1 C5:2 B4:1 A4:1 G4:2 F#4:2 E4:4', type: 'triangle', vol: .8 },
    { s: 'E2:4 C2:4 A1:4 B1:4 E2:4 C2:4 D2:4 B1:4', type: 'triangle', vol: .7 }] },
  boss: { bpm: 168, loop: true, v: [
    { s: 'E5:0.5 E5:0.5 D5:0.5 E5:0.5 F5:1 E5:1 D5:0.5 C5:0.5 D5:1 A4:2 C5:0.5 C5:0.5 B4:0.5 C5:0.5 D5:1 C5:1 B4:0.5 A4:0.5 G#4:1 E4:2 A4:0.5 B4:0.5 C5:0.5 D5:0.5 E5:1 A5:1 G5:0.5 F5:0.5 E5:1 D5:2 C5:0.5 D5:0.5 E5:0.5 C5:0.5 B4:1 G#4:1 A4:4', type: 'square', vol: .3 },
    { s: bossBass, type: 'triangle', vol: .95 }] },
  victory: { bpm: 150, loop: false, v: [
    { s: 'G4:0.5 C5:0.5 E5:0.5 G5:1.5 E5:0.5 G5:3', type: 'square', vol: .4 },
    { s: 'C3:1 G3:1 C4:1.5 G3:0.5 C3:3', type: 'triangle', vol: .9 }] },
  lose: { bpm: 76, loop: false, v: [{ s: 'E4:1 D4:1 C4:1 B3:3', type: 'triangle', vol: .9 }, { s: 'A2:3 E2:3', type: 'triangle', vol: .6 }] }
};
for (const k in TRACKS) TRACKS[k].v.forEach(v => v.n = parseSeq(v.s));
function auInit() {
  if (AU.ctx) { if (AU.ctx.state === 'suspended') AU.ctx.resume(); return; }
  try {
    const C = window.AudioContext || window.webkitAudioContext; if (!C) return; AU.ctx = new C();
    AU.master = AU.ctx.createGain(); AU.master.gain.value = AU.on ? 1 : 0; AU.master.connect(AU.ctx.destination);
    AU.music = AU.ctx.createGain(); AU.music.gain.value = .09; AU.music.connect(AU.master);
    AU.sfx = AU.ctx.createGain(); AU.sfx.gain.value = .2; AU.sfx.connect(AU.master); if (typeof applyOpt === 'function') applyOpt();
    const len = AU.ctx.sampleRate; AU.noise = AU.ctx.createBuffer(1, len, AU.ctx.sampleRate); const d = AU.noise.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    if (AU.cur) { const c = AU.cur; AU.cur = null; playBGM(c); }
  } catch (e) { AU.ctx = null; }
}
function tone(f, t, d, type, vol, dest) { if (!f) return; const o = AU.ctx.createOscillator(), gn = AU.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .01); gn.gain.setValueAtTime(vol, t + Math.max(.012, d - .04)); gn.gain.linearRampToValueAtTime(0, t + d); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + d + .03); }
function sweep(f0, f1, t, d, type, vol) { const o = AU.ctx.createOscillator(), gn = AU.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.linearRampToValueAtTime(0, t + d); o.connect(gn); gn.connect(AU.sfx); o.start(t); o.stop(t + d + .02); }
function noise(t, d, freq, vol, f1) { const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + d); f.Q.value = .9; const gn = AU.ctx.createGain(); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(gn); gn.connect(AU.sfx); s.start(t); s.stop(t + d + .02); }
function playBGM(name) {
  if (AU.cur === name && (AU.seq || !AU.ctx)) return;
  AU.cur = name; AU.seq = null; if (!AU.ctx || !name) return;
  const tr = TRACKS[name], t0 = AU.ctx.currentTime + .08;
  AU.seq = { tr, vs: tr.v.map(v => ({ n: v.n, i: 0, t: t0, type: v.type, vol: v.vol, done: false })) };
}
setInterval(() => {
  const q = AU.seq; if (!q || !AU.ctx) return; const sp = 60 / q.tr.bpm;
  for (const v of q.vs) { while (!v.done && v.t < AU.ctx.currentTime + .3) { const n = v.n[v.i]; const d = n.b * sp; tone(n.f, v.t, d * .9, v.type, v.vol, AU.music); v.t += d; v.i++; if (v.i >= v.n.length) { if (q.tr.loop) v.i = 0; else v.done = true; } } }
}, 60);
let _lastSfx = {};
function sfx(n) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, D = AU.sfx;
  if (_lastSfx[n] && t - _lastSfx[n] < .04) return; _lastSfx[n] = t;
  switch (n) {
    case 'cur': tone(990, t, .035, 'square', .16, D); break;
    case 'ok': tone(660, t, .05, 'square', .22, D); tone(990, t + .05, .07, 'square', .22, D); break;
    case 'back': tone(520, t, .05, 'square', .22, D); tone(330, t + .05, .07, 'square', .22, D); break;
    case 'buzz': tone(110, t, .16, 'square', .3, D); break;
    case 'blip': tone(1250, t, .018, 'square', .05, D); break;
    case 'swing': noise(t, .09, 3800, .45, 1200); break;
    case 'hit': noise(t, .12, 1500, .8); tone(160, t, .07, 'square', .22, D); break;
    case 'crit': noise(t, .2, 2600, 1); tone(240, t, .06, 'square', .3, D); tone(120, t + .06, .12, 'square', .3, D); break;
    case 'hurt': noise(t, .18, 600, .9); sweep(240, 80, t, .16, 'sawtooth', .22); break;
    case 'fire': noise(t, .3, 500, .7, 2500); sweep(180, 520, t, .2, 'sawtooth', .1); break;
    case 'boom': noise(t, .35, 300, 1, 80); sweep(160, 40, t, .3, 'square', .2); break;
    case 'heal': [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * .07, .18, 'sine', .32, D)); break;
    case 'die': sweep(700, 80, t, .3, 'square', .18); noise(t, .2, 900, .5); break;
    case 'lvl': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f, t + i * .07, .14, 'square', .2, D)); break;
    case 'chest': [784, 988, 1175, 1568].forEach((f, i) => tone(f, t + i * .08, .16, 'square', .2, D)); break;
    case 'coin': tone(1320, t, .05, 'square', .15, D); tone(1760, t + .05, .1, 'square', .15, D); break;
    case 'save': [880, 1175, 1568].forEach((f, i) => tone(f, t + i * .08, .12, 'triangle', .3, D)); break;
    case 'spore': sweep(400, 200, t, .15, 'triangle', .2); break;
    case 'jump': sweep(200, 600, t, .12, 'square', .12); break;
    case 'roar': noise(t, .6, 250, 1, 900); sweep(120, 60, t, .5, 'sawtooth', .25); break;
    case 'ice': [1568, 2093, 1760, 2349, 2637].forEach((f, i) => tone(f, t + i * .04, .12, 'triangle', .28, D)); noise(t, .25, 5000, .4, 2000); break;
    case 'step': noise(t, .03, 900, .15); break;
  }
}
