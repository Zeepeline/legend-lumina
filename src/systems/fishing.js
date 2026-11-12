'use strict';
// Gelombang 9: mancing tarik-ulur (#51, #571), ikan per jam (#572) & cuaca (#573), ukuran & rekor (#575),
// ikan legendaris per wilayah (#576), akuarium di rumah (#583)
Object.assign(ITEMS, {
  trout: { n: 'Ikan Trout', k: 'use', hp: 35, sell: 9, d: 'Ikan arus deras, paling aktif pagi hari. Pulihkan 35 HP.' },
  catfish: { n: 'Ikan Lele', k: 'use', hp: 40, sell: 10, d: 'Penghuni air keruh yang keluar malam hari. Pulihkan 40 HP.' },
  eel: { n: 'Belut Senja', k: 'mat', sell: 22, d: 'Licin dan gesit. Muncul saat senja di sungai.' },
  leg_forest: { n: 'Koi Penjaga Hutan', k: 'key', sell: 0, d: 'Ikan legendaris kolam Hutan Lumina. Sisiknya seperti daun emas.' },
  leg_swamp: { n: 'Lele Purba Rawa', k: 'key', sell: 0, d: 'Ikan legendaris Rawa Senja, kumisnya sepanjang lengan.' },
  leg_river: { n: 'Sidat Petir', k: 'key', sell: 0, d: 'Ikan legendaris Jalur Sungai Senja. Hanya muncul saat hujan.' },
});
Object.assign(ICONS_DEF, {
  trout: ['blob', { C: '#8aa870', L: '#d8e8b0', D: '#4a6a3a', E: '#2a3a20' }],
  catfish: ['blob', { C: '#6a5a4a', L: '#a89878', D: '#3a2e24', E: '#1a1410' }],
  eel: ['blob', { C: '#c87a3a', L: '#f0b070', D: '#7a4418', E: '#3a2008' }],
  leg_forest: ['blob', { C: '#f0c040', L: '#fff0a0', D: '#b07a10', E: '#5a3a00' }],
  leg_swamp: ['blob', { C: '#4a6a48', L: '#8ab080', D: '#24382a', E: '#0a1a0e' }],
  leg_river: ['blob', { C: '#6a8ae0', L: '#c8d8ff', D: '#2a4aa0', E: '#ffe060' }],
});
// w: peta (null = semua), t: jam [mulai, akhir), wx: cuaca, cm: ukuran, d: kesulitan 1–5, r: bobot peluang
const FISH = [
  { id: 'fish', cm: [18, 40], d: 1, r: 40, h: 'Hampir semua air tawar, kapan saja' },
  { id: 'trout', w: ['forest', 'river', 'deepwood'], t: [5, 11], cm: [25, 55], d: 2, r: 30, h: 'Arus jernih hutan & sungai, pagi hari (05–11)' },
  { id: 'catfish', w: ['swamp', 'meadow', 'river'], t: [19, 5], cm: [30, 80], d: 3, r: 30, h: 'Air keruh, malam hari (19–05)' },
  { id: 'eel', w: ['river', 'swamp'], t: [16, 20], cm: [40, 90], d: 3, r: 22, h: 'Sungai & rawa saat senja (16–20)' },
  { id: 'moonfish', t: [20, 4], cm: [20, 45], d: 3, r: 18, h: 'Perairan tenang, tengah malam (20–04)' },
  { id: 'rainfish', wx: 'rain', cm: [22, 50], d: 2, r: 35, h: 'Hanya saat hujan' },
  { id: 'gfish', cm: [15, 30], d: 4, r: 8, h: 'Langka di mana saja' },
  { id: 'oldboot', cm: [26, 30], d: 1, r: 10, h: 'Sampah di dasar air' },
  { id: 'leg_forest', w: ['forest'], t: [5, 8], cm: [90, 130], d: 5, r: 2, leg: 1, h: 'Kolam Hutan Lumina, fajar (05–08), pakai umpan' },
  { id: 'leg_swamp', w: ['swamp'], t: [0, 3], cm: [140, 200], d: 5, r: 2, leg: 1, h: 'Rawa Senja, lewat tengah malam (00–03), pakai umpan' },
  { id: 'leg_river', w: ['river'], wx: 'rain', cm: [110, 160], d: 5, r: 3, leg: 1, h: 'Jalur Sungai Senja saat hujan, pakai umpan' },
];
const inHours = (t, h) => t[0] <= t[1] ? h >= t[0] && h < t[1] : h >= t[0] || h < t[1];
function fishPool(sc, baited) {
  const h = S.time, rain = sc.weather === 'rain', L = S.fishLog || {};
  return FISH.filter(F => (!F.w || F.w.includes(sc.M.id)) && (!F.t || inHours(F.t, h)) && (!F.wx || (F.wx === 'rain' && rain)) && (!F.leg || (baited && !(L[F.id] && L[F.id].count))));
}
function pickFish(pool, baited) { const W = pool.map(F => F.r * (baited && F.d >= 3 ? 2.2 : 1) * (baited && F.id === 'oldboot' ? .3 : 1)); let r = Math.random() * W.reduce((a, b) => a + b, 0); for (let i = 0; i < pool.length; i++) { r -= W[i]; if (r <= 0) return pool[i]; } return pool[0]; }
function logFish(id, cm) { S.fishLog = S.fishLog || {}; let e = S.fishLog[id]; if (typeof e !== 'object' || !e) e = S.fishLog[id] = { count: +e || 0 }; e.count++; const rec = !e.max || cm > e.max; if (rec) e.max = cm; return rec && e.count > 1; }
// mini-game tarik-ulur: tahan A untuk menggulung (tegangan naik), lepas saat ikan menyentak
function tugGame(F) {
  return new Promise(res => {
    const w = document.createElement('div'); w.id = 'tug'; w.innerHTML = `<div class="tg-h">${F.leg ? '★ IKAN LEGENDARIS! ★' : 'Tarik!'} <small>tahan SERANG untuk menggulung · lepas saat tali merah</small></div><div class="tg-row"><span>Tali</span><div class="tg-bar"><i class="tg-t"></i></div></div><div class="tg-row"><span>Gulung</span><div class="tg-bar"><i class="tg-p"></i></div></div>`;
    UI.appendChild(w);
    let ten = 20, prog = 0, pull = 0, pullT = 1, time = 0, held = false, last = performance.now(), done = false;
    const prev = UIH, h = () => { }; h.tap = true; UIH = h; // tekanan ditelan; status tahan dibaca dari Input.keys.a / jari di kotak ini
    const down = () => held = true, up = () => held = false; w.addEventListener('pointerdown', e => { e.stopPropagation(); down(); }); window.addEventListener('pointerup', up);
    const tick = () => {
      if (done) return; const now = performance.now(), dt = Math.min(.05, (now - last) / 1000); last = now; time += dt;
      const hold = held || Input.keys.a;
      pullT -= dt; if (pullT <= 0) { pull = pull ? 0 : 1; pullT = pull ? rnd(.5, .9 + F.d * .15) : rnd(.8, 1.8 - F.d * .15); }
      const k = .55 + F.d * .22;
      if (hold) { prog += dt * (pull ? 6 : 22) / k; ten += dt * (pull ? 95 : 22) * k; } else { ten -= dt * 55; prog -= dt * (pull ? 7 * k : 1.5); }
      ten = clamp(ten, 0, 100); prog = clamp(prog, 0, 100);
      w.querySelector('.tg-t').style.width = ten + '%'; w.querySelector('.tg-t').classList.toggle('hot', ten > 75 || pull);
      w.querySelector('.tg-p').style.width = prog + '%'; w.classList.toggle('pull', !!pull);
      if (pull && Math.random() < dt * 6) sfx('cur');
      const end = r => { done = true; UIH = prev; window.removeEventListener('pointerup', up); w.remove(); res(r); };
      if (ten >= 100) return end('snap'); if (prog >= 100) return end('ok'); if (time > 14 + F.d * 2) return end('lost');
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}
World.prototype.fish = async function (f) {
  if (!has('rod')) return talk(null, ['Airnya beriak... ada ikan di sini! Kamu butuh Pancing (dijual di kios Bu Sari).']);
  if (this.fishing) return; this.fishing = true; G.lock++;
  try {
    const pl = this.pl, bob = this.add.image(f[0], f[1] - 2, 'dot').setTint(0xff4a3a).setScale(2).setDepth(f[1] + 1);
    const line = this.add.graphics().setDepth(f[1] + 1); line.lineStyle(1, 0xffffff, .8).lineBetween(pl.x + 4, pl.y - 18, f[0], f[1] - 2);
    const baited = has('bait'); if (baited) { addItem('bait', -1); popWorld(pl.x, pl.y - 34, 'umpan dipasang', 'xp'); }
    sfx('swing'); popWorld(f[0], f[1] - 16, '...', 'xp');
    await sleep(rnd(1200, 3200) * (baited ? .7 : 1));
    sfx('crit'); this.tweens.add({ targets: bob, y: f[1] + 2, duration: 80, yoyo: true, repeat: 4 }); popWorld(f[0], f[1] - 18, '!', 'crit');
    const hit = await new Promise(res => { const prev = UIH; let done = false; const h = k => { if (done) return; if (k === 'a' || k === 'tap') { done = true; UIH = prev; res(true); } }; h.tap = true; UIH = h; setTimeout(() => { if (!done) { done = true; UIH = prev; res(false); } }, 900); });
    if (!hit) { bob.destroy(); line.destroy(); await say('Terlambat! Ikannya lepas. Tekan SERANG tepat saat tanda ! muncul.', 'Mancing'); return; }
    const F = pickFish(fishPool(this, baited), baited);
    const r = F.d <= 1 && !F.leg ? 'ok' : await tugGame(F);
    bob.destroy(); line.destroy();
    if (r === 'snap') { sfx('buzz'); this.camShake(120, .004); await say(F.leg ? 'TALINYA PUTUS! Bayangan raksasa itu menghilang ke dasar air...' : 'Talinya putus! Jangan menarik saat tali memerah.', 'Mancing'); return; }
    if (r === 'lost') { sfx('back'); await say('Ikannya berhasil kabur. Gulung lebih sabar.', 'Mancing'); return; }
    const cm = Math.round(rnd(F.cm[0], F.cm[1])), rec = F.id !== 'oldboot' && logFish(F.id, cm);
    addItem(F.id); if (F.id !== 'oldboot') S.st.fish++; sfx('chest'); updHud(); this.sparkle(pl.x, pl.y - 12, F.leg ? 'doto' : 'dotg', F.leg ? 24 : 10);
    if (F.id === 'moonfish' && S.mp < stat().maxmp) { S.mp = Math.min(stat().maxmp, S.mp + 45); updHud(); }
    const nm = ITEMS[F.id].n;
    if (F.leg) { S.flags['legfish_' + F.id] = 1; banner(nm, 'IKAN LEGENDARIS', true, 2600); await say(`Kamu menaklukkan ${nm}! Panjangnya ${cm} cm. Ikan ini bisa dipajang di akuarium rumah.`, 'Mancing'); }
    else if (F.id === 'oldboot') await say('Yah... cuma sepatu butut.', 'Mancing');
    else await say(`Dapat ${nm}! Panjang ${cm} cm${rec ? ' — REKOR BARU!' : ''}.`, 'Mancing');
    achCheck(this);
  } finally { this.fishing = false; G.lock--; }
};
// Buku Ikan baru: semua jenis, habitat, jumlah, rekor
async function openFishLogNew() {
  S.fishLog = S.fishLog || {}; const cnt = id => { const e = S.fishLog[id]; return typeof e === 'object' && e ? e.count : +e || 0; };
  const got = FISH.filter(F => cnt(F.id) > 0).length;
  const w = win('menu', `<div class="mh">Buku Ikan · ${got}/${FISH.length}</div><div class="bgrid">` + FISH.map(F => {
    const c = cnt(F.id), e = S.fishLog[F.id];
    const st = 'display:block;text-align:center;padding:4px';
    return c ? `<div class="bc" style="${st}"><div class="fic">${icon(F.id)}</div><b>${ITEMS[F.id].n}${F.leg ? ' ★' : ''}</b><div class="fx">${c}× · rekor ${e && e.max ? e.max + ' cm' : '-'}</div><div class="fh">${F.h}</div></div>`
      : `<div class="bc unk" style="${st}"><div class="fic">❔</div><b>${F.leg ? '★ ???' : '???'}</b><div class="fh">${F.h}</div></div>`;
  }).join('') + `</div><div class="mf">Jam & cuaca menentukan ikan yang datang. Umpan memanggil ikan besar.</div>`);
  Object.assign(w.style, { left: '8px', right: '8px', top: '8px', bottom: '34px', overflow: 'auto' });
  await choose({ items: [{ t: 'Kembali' }], x: 110, bottom: 6 }); w.remove();
}
// ---- akuarium di Rumah Arka ----
FCAT.tank = { n: 'Akuarium', p: 120, w: 34, h: 26, act: 'aqua', d: 'Pajang sampai 4 ikan tangkapanmu.' };
function artTank() { const [c, x] = mk(36, 28); fr(x, '#5a3a24', 0, 20, 36, 8); fr(x, '#8a5a34', 1, 21, 34, 2); fr(x, '#3a6a8a', 1, 2, 34, 19); fr(x, '#6ab0d8', 2, 3, 32, 17); fr(x, '#9ad0f0', 2, 3, 32, 3); fr(x, '#c8a870', 2, 17, 32, 3); fr(x, '#5fbf68', 6, 11, 2, 7); fr(x, '#5fbf68', 27, 9, 2, 9); fr(x, '#ffffff', 4, 5, 2, 6); return c; }
const _furnTex = furnTex;
furnTex = function (sc, t, v) { if (t !== 'tank') return _furnTex(sc, t, v); if (!sc.textures.exists('hf_tank')) sc.textures.addCanvas('hf_tank', artTank()); return 'hf_tank'; };
const _useFurn = World.prototype.useFurn;
World.prototype.useFurn = async function (o) {
  if (FCAT[o.f.t].act !== 'aqua') return _useFurn.call(this, o);
  G.lock++;
  try {
    o.f.fish = o.f.fish || []; const can = FISH.map(F => F.id).filter(id => id !== 'oldboot' && has(id));
    const r = await choose({ head: `Akuarium · ${o.f.fish.length}/4`, x: 30, y: 50, w: 250, items: [...can.map(id => ({ t: 'Masukkan ' + ITEMS[id].n, dis: o.f.fish.length >= 4 })), ...o.f.fish.map(id => ({ t: 'Ambil ' + ITEMS[id].n })), { t: 'Tutup' }] });
    if (r < 0) return;
    if (r < can.length) { addItem(can[r], -1); o.f.fish.push(can[r]); sfx('ok'); }
    else if (r < can.length + o.f.fish.length) { const id = o.f.fish.splice(r - can.length, 1)[0]; addItem(id, 1); sfx('back'); }
    this.tankFish(o); saveGame(this);
  } finally { G.lock--; }
};
World.prototype.tankFish = function (o) {
  (o.swim || []).forEach(s => s.destroy()); o.swim = [];
  (o.f.fish || []).forEach((id, i) => { const s = this.add.image(o.f.x + 8 + i * 6, o.f.y + 8 + (i % 2) * 5, 'ic_' + id).setScale(.45).setDepth(o.s.depth + 1); o.swim.push(s);
    this.tweens.add({ targets: s, x: o.f.x + 28 - i * 3, duration: rnd(1600, 2600), yoyo: true, repeat: -1, ease: 'Sine.easeInOut', onYoyo: () => s.setFlipX(true), onRepeat: () => s.setFlipX(false) }); });
};
const _pfs = World.prototype.placeFurnSprite;
World.prototype.placeFurnSprite = function (f) { const o = _pfs.call(this, f); if (f.t === 'tank') this.tankFish(o); return o; };
const _rfs = World.prototype.removeFurnSprite;
World.prototype.removeFurnSprite = function (o) { (o.swim || []).forEach(s => s.destroy()); return _rfs.call(this, o); };
