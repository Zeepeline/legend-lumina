'use strict';
// Monster versi garang: bentuk baru (mata menyala, taring, tanduk, duri) + pencahayaan otomatis. Menimpa MON lama, kunci palet tetap sama agar varian warna jalan.
// anim: 'walk' (kaki bergantian), 'squash' (memantul), 'bob' (melayang). Satu frame cukup; frame ke-2 dibuat otomatis kecuali f berisi 2 frame.
Object.assign(MON, {
  slime: { pal: { G: '#4ec43c', L: '#d8ffc8', E: '#10200e', D: '#23701e', W: '#fff8e8', R: '#ff5a2a' }, anim: 'squash', f: [[
    '......DDDD......', '....DDGGGGDD....', '...DGGLLGGGGD...', '..DGGLLGGGGGGD..', '..DGLGGGGGGGGD..', '.DGGEEGGGGEEGGD.', '.DGGGREGGERGGGD.', '.DGGGEEGGEEGGGD.',
    'DGGGGGGGGGGGGGGD', 'DGGEWEWEWEWEGGGD', 'DGGGEEEEEEEEGGGD', '.DGGGGGGGGGGGGD.', '..DDGDDDDDDDGDD.', '....D......D....']] },
  bat: { pal: { W: '#5a3a8a', B: '#3a2058', E: '#ff3a2a', F: '#ffffff', R: '#8a5ac0' }, f: [
    ['W..................W', 'WW................WW', 'WRW.....B..B.....WRW', 'WRBW....BBBB....WBRW', 'WRWBW..BBBBBB..WBWRW', 'WR.BBWBBEBBEBBWBB.RW', 'W...BBBBBBBBBBBB...W', '......BFBBBBFB......', '......BBFBBFBB......', '.......BBBBBB.......', '........B..B........'],
    ['....................', '........B..B........', '........BBBB........', '.......BBBBBB.......', '....WWBBEBBEBBWW....', '..WWRRBBBBBBBBRRWW..', '.WRRW.BFBBBBFB.WRRW.', 'WRRW..BBFBBFBB..WRRW', 'WRW....BBBBBB....WRW', 'WW......B..B......WW', 'W..................W']] },
  wolf: { pal: { G: '#7e889e', D: '#4a5470', W: '#f2f4fa', E: '#ffd23a', K: '#26262e' }, anim: 'walk', legs: 4, f: [[
    '..D..D................', '..DD.DD................', '.DGGGGGD....D.D.D.....', 'DGGEGGGGDDDDGDGDGD....', 'GGGGGGGGGGGGGGGGGGD.DD', 'WWKGGGGGGGGGGGGGGGGDD.',
    'WKWKGGGGGGGGGGGGGGGD..', '.WWDGGGGGDDDDGGGGGD...', '..DGGGD......DGGGD....', '..DGGD.......DGGD.....', '..DGD.........DGD.....', '..KK..........KK......']] },
  boar: { pal: { B: '#8a5a36', D: '#5a3820', P: '#e8988a', W: '#fffbe8', E: '#ff4a2a', K: '#2a1810', H: '#3a2414' }, anim: 'walk', legs: 3, f: [[
    '......H.H.H.H.........', '....HHHHHHHHHHH.......', '...BBBBBBBBBBBBBB.....', '..BEBBBBBBBBBBBBBBH...', '.WBBBBBBBBBBBBBBBBBH..', 'WWPPBBBBBBBBBBBBBBB...',
    'W.PPKBBBBDDDDBBBBBB...', '.W.BBBDDDDDDDDDDBB....', '...DBBD.......DBBD....', '...DBD........DBD.....', '...KK.........KK......']] },
  snake: { pal: { G: '#5aa83a', L: '#d8f088', E: '#ff3a1a', R: '#e83a5a', D: '#2e6a22' }, anim: 'walk', legs: 4, f: [[
    '...DGGGGD.........', '..DGGGGGGD........', '.DGGEGGEGGD.......', '.DGGLGGLGGD.......', '..DGLLLLGD........', '...DRLLRD.........', '....R.GGD.........', '......GGGD........',
    '.....DGLGGD...DG..', '...DGGGLLGGDDGGGD.', '..DGLLGGGGLLGGGD..', '...DDGGGGGGGGDD...']] },
  golem: { pal: { R: '#7a7486', D: '#4a4458', L: '#aaa4b6', E: '#5af0ff', M: '#5a9a4a', C: '#ffb43a' }, anim: 'walk', legs: 4, f: [[
    '......DDDDDDDD........', '.....DRRRRRRRRD.......', '....DRLLRRRRRRRD......', '....DRLRRRRRRRRD......', '....DREERRRREERD......', '..MMDRRRRRRRRRRDMM....', '.DRRDDRRRCCRRRDDRRD...', 'DRLLRRRRCCCCRRRRRLRD..',
    'DRLRRDRRRCCRRRRDRRRD..', 'DRRRDDRRRRRRRRRDDRRD..', '.DRRD.DRRRRRRRRD.DRRD.', '.DMMD.DRRRRRRRRD.DMMD.', '..DD..DRRDDDDRRD..DD..', '......DRRD..DRRD......', '......DRRD..DRRD......', '.....DDDDD..DDDDD.....']] },
  ghost: { pal: { W: '#e8eeff', S: '#a8b8e0', K: '#1a1a3a', M: '#6a4a9a' }, anim: 'bob', f: [[
    '.....WWWWWW.....', '...WWWWWWWWWW...', '..WWSWWWWWWWWW..', '.WWSWWWWWWWWWWW.', '.WWKKWWWWWKKWWW.', '.WWKKKWWWKKKWWW.', 'WWWWKWWWWWKWWWWW', 'WWWWWWMMMWWWWWWS',
    'WWWWWMKKKMWWWWS.', 'SWWWWWMMMWWWWWS.', '.SWWWWWWWWWWWS..', '..SWWS.SWWS.SS..', '...SS...SS......']] },
  shroom: { pal: { R: '#c82a3a', W: '#fff4e8', S: '#e8d0a8', E: '#ff3a1a', F: '#5a3a22' }, anim: 'squash', f: [[
    '.....RRRRRR.....', '...RRWWRRRRRR...', '..RRWWRRRRWWRR..', '.RRRRRRRRRWWRRR.', 'RRWWRRRRRRRRRWWR', 'RWWWRRRRRRRRRWWR', '.RRRRRRRRRRRRRR.', '...FSSSSSSSSF...',
    '...SFFSSSSFFS...', '...SSESSSSESS...', '...SSSFFFFSSS...', '...SSFWFWFFSS...', '....SSSSSSSS....', '...FF.SSSS.FF...']] },
  bee: { pal: { Y: '#ffc82a', K: '#1e1618', W: '#d8f0ff', E: '#ff3a1a', S: '#e8e8e8' }, f: [
    ['..WW...WW.....', '.WWWW.WWWW....', '..WWW.WWW.....', '....KYKYKYK...', '..EKYKYKYKYK..', '.KKKYKYKYKYKS.', '..KKYKYKYKYKSS', '...KYKYKYKK...', '....K..K......'],
    ['..............', '..............', '....KYKYKYK...', '..EKYKYKYKYK..', '.KKKYKYKYKYKS.', '..KKYKYKYKYKSS', '.WWWYKYKYKK...', 'WWWWWWWWK.....', '.WW..WW.......']] },
  plant: { pal: { P: '#d83a7a', Y: '#ffd84a', K: '#3a0a1a', R: '#ff5a5a', G: '#4a9a3a', L: '#6ac85a', D: '#2a6a2a', W: '#fffbe8' }, anim: 'squash', f: [[
    '...PPPP..PPPP...', '..PPYPPPPPPYPP..', '.PPPPPPPPPPPPPP.', '.PKKKKKKKKKKKKP.', '.PKWKWKWKWKWKKP.', '.PKRRRRRRRRRRKP.', '.PKWKWKWKWKWKKP.', '.PPPPPPPPPPPPPP.',
    '..PPPYPPPPYPPP..', '....DDGGGGDD....', '..L..DGGGGD..L..', '.LLL..GGGG..LLL.', 'LLLLL.DGGD.LLLLL', '.LL...DGGD...LL.', '.....DGGGGD.....', '....DDDDDDDD....']] },
  frog: { pal: { G: '#4a8a3a', L: '#c8dc8a', W: '#ffffff', E: '#ff3a1a', D: '#1e3a16' }, anim: 'squash', f: [[
    '.....WW....WW.....', '....WEEW..WEEW....', '...GGEWGGGGWEGG...', '..GGGGGGGGGGGGGG..', '.GGLGGLGGGGLGGLGG.', '.GGGGGGGGGGGGGGGG.', 'GDDDDDDDDDDDDDDDDG', '.GLLLLLLLLLLLLLLG.',
    'GGGLLLLLLLLLLLLGGG', 'GG.GGG......GGG.GG', 'G...GG......GG...G']] },
});
// ---- pencahayaan: kiri-atas terang (kekuningan), bawah-kanan gelap (kebiruan), sesuai ART_BIBLE ----
function mixHex(a, b, t) { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return A.map((v, i) => Math.round(v + (B[i] - v) * t)); }
function shadeMon(c, pal) {
  const x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height), W = c.width, H = c.height, D = d.data;
  const op = (i, j) => i >= 0 && j >= 0 && i < W && j < H && D[(j * W + i) * 4 + 3] > 0;
  const glow = Object.values(pal).filter(h => { const [r, g, b] = mixHex(h, h, 0); return Math.max(r, g, b) > 200 && (Math.max(r, g, b) - Math.min(r, g, b)) > 120; });
  const src = new Uint8ClampedArray(D);
  for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
    const k = (j * W + i) * 4; if (!src[k + 3]) continue;
    const hex = '#' + [0, 1, 2].map(n => src[k + n].toString(16).padStart(2, '0')).join('');
    if (glow.includes(hex)) continue; // mata menyala tidak diredupkan
    let tone = 0; if (!op(i, j - 1)) tone += .28; if (!op(i - 1, j)) tone += .12; if (!op(i, j + 1)) tone -= .3; if (!op(i + 1, j)) tone -= .12; tone -= (j / H) * .14;
    const [r, g, b] = tone > 0 ? mixHex(hex, '#fff2c0', tone) : mixHex(hex, '#1c1840', -tone);
    D[k] = r; D[k + 1] = g; D[k + 2] = b;
  }
  x.putImageData(d, 0, 0); return c;
}
// frame ke-2 otomatis
function monFrame2(rows, anim, legs = 3) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length)), R = rows.map(r => r.padEnd(w, '.'));
  if (anim === 'walk') return R.map((r, j) => j < h - legs ? r : [...r].map((_, i) => i < w / 2 ? (r[i - 1] || '.') : (r[i + 1] || '.')).join(''));
  if (anim === 'bob') return [...R.slice(1), '.'.repeat(w)];
  // squash: lebih pendek 1 baris & sedikit melebar
  const out = R.filter((_, j) => j !== Math.floor(h / 2)).map(r => '.' + r.slice(0, w - 1));
  return ['.'.repeat(w), ...out.map((r, j) => j > out.length - 4 ? (r[1] + r.slice(0, w - 1)).slice(0, w) : r)];
}
artMon = function (name, palOver) {
  const m = MON[name], pal = Object.assign({}, m.pal, palOver || {});
  const frames = m.f.length > 1 ? m.f : [m.f[0], monFrame2(m.f[0], m.anim || 'bob', m.legs)];
  const fr0 = frames.map(rows => { const c = shadeMon(renderMap(rows, pal), pal); return outline(c, name === 'cat' || name === 'fox' ? '#3a2a2a' : '#140c1c'); });
  const w = Math.max(...fr0.map(c => c.width)) + 2, h = Math.max(...fr0.map(c => c.height)) + 2;
  return strip(fr0.map(c => { const [f, x] = mk(w, h); x.drawImage(c, 1, h - c.height - 1); return f; }));
};
