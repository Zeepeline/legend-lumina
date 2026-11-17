'use strict';
// Audio chiptune WebAudio: musik (TRACKS) & efek suara (sfx)
// ---------------- AUDIO (chiptune WebAudio) ----------------
const AU_FILES = {
  town: 'assets/music/Whispering Breezes Village.mp3',
  townN: 'assets/music/Whispering Breezes Village.mp3',
  meadow: 'assets/music/Whispering Breezes Village.mp3',
  city: 'assets/music/Whispering Breezes Village.mp3',
  forest: 'assets/music/Mysterious & Haunting Forest Exploration.mp3',
  deepwood: 'assets/music/Mysterious & Haunting Forest Exploration.mp3',
  swamp: 'assets/music/Mysterious & Haunting Forest Exploration.mp3',
  cave: 'assets/music/Mysterious & Haunting Forest Exploration.mp3',
  boss: 'assets/music/Epic Boss Awakening.mp3',
  battle: 'assets/music/Clash of Destiny.mp3',
  field: 'assets/music/Whispering Breezes Village.mp3',   // jalan, danau, sungai, peralihan (dulu tanpa MP3 → sunyi/chiptune)
  snow: 'assets/music/Mysterious & Haunting Forest Exploration.mp3'
};
const AU = { ctx: null, on: true, cur: null, seq: null, tag: null, tagCur: null };
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
    if (AU.tag) { routeTag(AU.tag); tagSetVol(AU.tag, tagVolFor(AU.tagCur)); }
    if (AU.cur) { const c = AU.cur; AU.cur = null; playBGM(c); }
    loadSfxBuffers();
  } catch (e) { AU.ctx = null; }
}
function tone(f, t, d, type, vol, dest) { if (!f) return; const o = AU.ctx.createOscillator(), gn = AU.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f, t); gn.gain.setValueAtTime(0, t); gn.gain.linearRampToValueAtTime(vol, t + .01); gn.gain.setValueAtTime(vol, t + Math.max(.012, d - .04)); gn.gain.linearRampToValueAtTime(0, t + d); o.connect(gn); gn.connect(dest); o.start(t); o.stop(t + d + .03); }
function sweep(f0, f1, t, d, type, vol) { const o = AU.ctx.createOscillator(), gn = AU.ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + d); gn.gain.setValueAtTime(vol, t); gn.gain.linearRampToValueAtTime(0, t + d); o.connect(gn); gn.connect(_sfxDest || AU.sfx); o.start(t); o.stop(t + d + .02); }
function noise(t, d, freq, vol, f1) { const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; const f = AU.ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.setValueAtTime(freq, t); if (f1) f.frequency.exponentialRampToValueAtTime(f1, t + d); f.Q.value = .9; const gn = AU.ctx.createGain(); gn.gain.setValueAtTime(vol, t); gn.gain.exponentialRampToValueAtTime(.001, t + d); s.connect(f); f.connect(gn); gn.connect(_sfxDest || AU.sfx); s.start(t); s.stop(t + d + .02); }
const _AUDIO_POOL = {};
// volume dasar musik MP3: sengaja rendah agar SELALU di bawah efek suara & dialog (MP3 dimaster jauh lebih keras dari efek WebAudio)
const BGM_BASE_VOL = { town: .18, townN: .16, meadow: .18, city: .18, field: .18, forest: .2, deepwood: .2, swamp: .2, cave: .2, snow: .18, battle: .22, boss: .25 };
let _bgmDuck = 1.0, _wxDuck = 1.0;
// musik MP3 dialirkan lewat WebAudio (iPhone/Safari mengabaikan audio.volume → dulu musik selalu 100% di iPhone)
function routeTag(a) {
  if (!a || a._g || !AU.ctx || !AU.ctx.createMediaElementSource) return;
  try { a._src = AU.ctx.createMediaElementSource(a); a._g = AU.ctx.createGain(); a._src.connect(a._g); a._g.connect(AU.master); a.volume = 1; } catch (_) { a._g = null; }
}
function tagVolFor(name) {
  const base = BGM_BASE_VOL[name] || .18, mus = typeof OPT !== 'undefined' ? OPT.mus / 3 : 1;
  return Math.max(0, Math.min(1, base * mus * _bgmDuck * _wxDuck * (AU.on ? 1 : 0)));
}
function tagSetVol(a, v) { if (!a) return; if (a._g) a._g.gain.value = v; else a.volume = Math.max(0, Math.min(1, v)); }
function tagGetVol(a) { return a ? (a._g ? a._g.gain.value : a.volume) : 0; }
function setWeatherDuck(f) { if (_wxDuck === f) return; _wxDuck = f; if (AU.tag) tagSetVol(AU.tag, tagVolFor(AU.tagCur)); }
// suara hujan: derau putih disaring (desis hujan) + tetesan acak; menyala/mati halus
let _rain = null;
function rainSound(on) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, lvl = .06 * (typeof OPT !== 'undefined' ? OPT.sfx / 3 : 1);
  if (on && !_rain) {
    const s = AU.ctx.createBufferSource(); s.buffer = AU.noise; s.loop = true;
    const hp = AU.ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 400;
    const lp = AU.ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 2600;
    const g = AU.ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(lvl, t + 2);
    s.connect(hp); hp.connect(lp); lp.connect(g); g.connect(AU.master); s.start();
    _rain = { s, g, drip: setInterval(() => { if (AU.ctx && Math.random() < .7) noise(AU.ctx.currentTime, .03, 1800 + Math.random() * 2400, .05 + Math.random() * .05); }, 140) };
  } else if (!on && _rain) {
    const r = _rain; _rain = null; clearInterval(r.drip);
    r.g.gain.cancelScheduledValues(t); r.g.gain.setValueAtTime(r.g.gain.value, t); r.g.gain.linearRampToValueAtTime(0, t + 1.5);
    setTimeout(() => { try { r.s.stop(); } catch (_) { } }, 1700);
  } else if (on && _rain) _rain.g.gain.value = Math.min(_rain.g.gain.value, lvl) || lvl;
}
function setBgmDuck(factor = 1.0) {
  _bgmDuck = factor;
  if (typeof applyOpt === 'function') applyOpt();
}
function stopAudioTag() {
  if (AU.tag) {
    try { AU.tag.pause(); } catch (_) {}
    AU.tag = null; AU.tagCur = null;
  }
  AU.seq = null; // Bersihkan antrean chiptune lama
}
function playBGM(name) {
  if (!name) { AU.cur = null; stopAudioTag(); return; }
  if (AU.cur === name && (AU.tag && !AU.tag.paused)) return;
  AU.cur = name; AU.seq = null;
  
  if (AU_FILES[name]) {
    // satu pemutar per FILE (bukan per area): desa → padang → kota memakai lagu yang sama, jadi lagu berlanjut tanpa mulai ulang
    const file = AU_FILES[name], same = AU.tag && AU.tag === _AUDIO_POOL[file] && !AU.tag.paused;
    if (!same) stopAudioTag();
    try {
      if (!_AUDIO_POOL[file]) {
        _AUDIO_POOL[file] = new Audio(encodeURI(file));
        _AUDIO_POOL[file].loop = true;
      }
      const a = _AUDIO_POOL[file];
      routeTag(a); tagSetVol(a, tagVolFor(name));
      AU.tag = a;
      AU.tagCur = name;
      if (same) return;
      const playPromise = a.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser autoplay policy blocked until first user interaction
          const resumeAudioOnGesture = () => {
            if (AU.tag && AU.tag.paused) {
              AU.tag.play().catch(() => {});
            }
            window.removeEventListener('pointerdown', resumeAudioOnGesture);
            window.removeEventListener('keydown', resumeAudioOnGesture);
          };
          window.addEventListener('pointerdown', resumeAudioOnGesture, { once: true });
          window.addEventListener('keydown', resumeAudioOnGesture, { once: true });
        });
      }
      return;
    } catch (_) {
      stopAudioTag();
    }
  } else {
    stopAudioTag();
  }

  // Hentikan agar tidak tercampur: jika track ada di AU_FILES, JANGAN pernah membunyikan chiptune lama
  if (AU_FILES[name]) return;
  
  // Sisa trek non-musik (hanya jingle kemenangan/kekalahan sesaat victory/lose jika ada)
  const tr = TRACKS[name]; if (!tr) return;
  const t0 = AU.ctx.currentTime + .08;
  AU.seq = { tr, vs: tr.v.map(v => ({ n: v.n, i: 0, t: t0, type: v.type, vol: v.vol, done: false })) };
}
setInterval(() => {
  if (AU.tag) return; const q = AU.seq; if (!q || !AU.ctx) return; const sp = 60 / q.tr.bpm;
  for (const v of q.vs) { while (!v.done && v.t < AU.ctx.currentTime + .3) { const n = v.n[v.i]; const d = n.b * sp; tone(n.f, v.t, d * .9, v.type, v.vol, AU.music); v.t += d; v.i++; if (v.i >= v.n.length) { if (q.tr.loop) v.i = 0; else v.done = true; } } }
}, 60);
const SFX_FILES = {
  swing: 'assets/audio/swing_light.wav',
  swing_heavy: 'assets/audio/swing_heavy.wav',
  hit: 'assets/audio/hit_punch_heavy.ogg',
  hit_punch: 'assets/audio/hit_punch_med.ogg',
  crit: 'assets/audio/hit_deep.wav',
  chop: 'assets/audio/slash_chop.ogg',
  slice: 'assets/audio/slash_slice.ogg',
  metal: 'assets/audio/hit_metal.ogg',
  hurt: 'assets/audio/hit_heavy.wav'
};
const _SFX_BUFFERS = {};

function loadSfxBuffers() {
  if (!AU.ctx) return;
  for (const [k, url] of Object.entries(SFX_FILES)) {
    if (_SFX_BUFFERS[k]) continue;
    fetch(url)
      .then(res => res.arrayBuffer())
      .then(buf => AU.ctx.decodeAudioData(buf))
      .then(decoded => { _SFX_BUFFERS[k] = decoded; })
      .catch(() => {});
  }
}

function playBufferSfx(k, vol = 1.0, rate = 1.0) {
  if (!AU.ctx || !_SFX_BUFFERS[k]) return false;
  try {
    const src = AU.ctx.createBufferSource();
    src.buffer = _SFX_BUFFERS[k];
    if (rate !== 1.0) src.playbackRate.value = rate;
    const gn = AU.ctx.createGain();
    const sfxVol = (typeof OPT !== 'undefined' ? OPT.sfx / 3 : 1) * vol;
    gn.gain.value = Math.max(0, Math.min(1.5, sfxVol));
    src.connect(gn);
    gn.connect(_sfxDest || AU.sfx || AU.master);
    src.start();
    return true;
  } catch (_) {
    return false;
  }
}

let _lastSfx = {}, _sfxDest = null;
function sfx(n, rate = 1) {
  if (!AU.ctx) return; const t = AU.ctx.currentTime, D = _sfxDest || AU.sfx, r = rate > 0 ? rate : 1;
  if (_lastSfx[n] && t - _lastSfx[n] < .04) return; _lastSfx[n] = t;

  if (n === 'swing') {
    if (playBufferSfx('swing', 0.85, (0.95 + Math.random() * 0.1) * r)) return;
  } else if (n === 'hit') {
    if (playBufferSfx('hit', 1.0, (0.95 + Math.random() * 0.1) * r)) return;
  } else if (n === 'crit') {
    if (playBufferSfx('crit', 1.1, (0.95 + Math.random() * 0.1) * r)) return;
  } else if (n === 'hurt') {
    if (playBufferSfx('hurt', 0.9, (0.95 + Math.random() * 0.1) * r)) return;
  }

  switch (n) {
    case 'cur': tone(990 * r, t, .035, 'square', .16, D); break;
    case 'ok': tone(660 * r, t, .05, 'square', .22, D); tone(990 * r, t + .05, .07, 'square', .22, D); break;
    case 'back': tone(520 * r, t, .05, 'square', .22, D); tone(330 * r, t + .05, .07, 'square', .22, D); break;
    case 'buzz': tone(110 * r, t, .16, 'square', .3, D); break;
    case 'bird': { const f = (2200 + Math.random() * 900) * r; for (let i = 0; i < 2 + Math.floor(Math.random() * 3); i++) { tone(f + i * 140, t + i * .09, .05, 'sine', .05, D); tone(f * 1.25, t + i * .09 + .03, .03, 'sine', .035, D); } break; }
    case 'cricket': for (let i = 0; i < 6; i++) tone(4200 * r, t + i * .045, .018, 'square', .012, D); break;
    case 'owl': tone(420 * r, t, .22, 'sine', .05, D); tone(360 * r, t + .28, .32, 'sine', .05, D); break;
    case 'frog': tone(160 * r, t, .07, 'square', .04, D); tone(140 * r, t + .1, .09, 'square', .04, D); break;
    case 'creak': tone(90 * r, t, .5, 'sawtooth', .015, D); break;
    case 'wind': noise(t, 1.6, 500, .03); break;
    case 'drip': tone(1500 * r, t, .04, 'sine', .05, D); tone(1100 * r, t + .04, .06, 'sine', .03, D); break;
    case 'flap': noise(t, .12, 1200, .05); noise(t + .1, .1, 1200, .04); break;
    case 'splash': noise(t, .18, 900, .06); break;
    case 'blip': tone(1250 * r, t, .018, 'square', .05, D); break;
    case 'swing': noise(t, .09, 3800, .45, 1200); break;
    case 'hit': noise(t, .12, 1500, .8); tone(160 * r, t, .07, 'square', .22, D); break;
    case 'crit': noise(t, .2, 2600, 1); tone(240 * r, t, .06, 'square', .3, D); tone(120 * r, t + .06, .12, 'square', .3, D); break;
    case 'hurt': noise(t, .18, 600, .9); sweep(240 * r, 80 * r, t, .16, 'sawtooth', .22); break;
    case 'fire': noise(t, .3, 500, .7, 2500); sweep(180 * r, 520 * r, t, .2, 'sawtooth', .1); break;
    case 'boom': noise(t, .35, 300, 1, 80); sweep(160 * r, 40 * r, t, .3, 'square', .2); break;
    case 'heal': [523, 659, 784, 1047].forEach((f, i) => tone(f * r, t + i * .07, .18, 'sine', .32, D)); break;
    case 'die': sweep(700 * r, 80 * r, t, .3, 'square', .18); noise(t, .2, 900, .5); break;
    case 'lvl': [523, 659, 784, 1047, 1319, 1568].forEach((f, i) => tone(f * r, t + i * .07, .14, 'square', .2, D)); break;
    case 'chest': [784, 988, 1175, 1568].forEach((f, i) => tone(f * r, t + i * .08, .16, 'square', .2, D)); break;
    case 'coin': tone(1320 * r, t, .05, 'square', .15, D); tone(1760 * r, t + .05, .1, 'square', .15, D); break;
    case 'bush': noise(t, .08, 1400, .14, 600); tone(480 * r, t, .04, 'triangle', .05, D); break;
    case 'save': [880, 1175, 1568].forEach((f, i) => tone(f * r, t + i * .08, .12, 'triangle', .3, D)); break;
    case 'spore': sweep(400, 200, t, .15, 'triangle', .2); break;
    case 'jump': sweep(200, 600, t, .12, 'square', .12); break;
    case 'roar': noise(t, .6, 250, 1, 900); sweep(120, 60, t, .5, 'sawtooth', .25); break;
    case 'ice': [1568, 2093, 1760, 2349, 2637].forEach((f, i) => tone(f, t + i * .04, .12, 'triangle', .28, D)); noise(t, .25, 5000, .4, 2000); break;
    case 'step': noise(t, .03, 900, .15); break;
    case 'bell':
      [440, 880, 1320, 1760].forEach((f, i) => tone(f, t, .9 - i * .15, 'sine', .22 / (i + 1), D));
      tone(220, t, 1.2, 'triangle', .28, D);
      break;
    case 'quack':
      sweep(420, 310, t, .11, 'sawtooth', .25);
      sweep(400, 280, t + .12, .12, 'sawtooth', .22);
      break;
    case 'water':
      noise(t, .14, 1100, .07, 700);
      tone(1200, t + .02, .05, 'sine', .04, D);
      tone(1400, t + .08, .06, 'sine', .04, D);
      break;
  }
}
