'use strict';
// SPRITE SHEET NPC — tempat memasang lembar sprite hasil gambar (agent pemilik) tanpa mengubah kode lain.
// Cara pasang: simpan PNG di assets/img/npc/npc_sheet_<id>.png (id = id NPC di peta, mis. 'gk2'), lalu tambahkan
//   <id>: ['<anim baris 6>', '<anim baris 7>', ...]   ke NPC_SHEETS di bawah (urutan = urutan baris di lembar, lihat docs/NPC_ROSTER.md).
// Format lembar: frame 48×48, 8 kolom; kaki tokoh menyentuh dasar frame, tokoh di tengah. Baris tetap:
//   0 jalan ke bawah (4) · 1 jalan ke atas (4) · 2 jalan ke samping, menghadap KANAN (4) · 3 diam/napas: bawah 2, samping 2, atas 2
//   4 bicara menghadap bawah (4) · 5 dst. = animasi kegiatan (≤ 8 frame, sesuai dokumen; frame kosong di ujung baris dibiarkan transparan).
// Hasil: tekstur 'ch_s_<id>' dengan nama frame standar (down0..3, up0..3, side0..3, br<arah>, nod<arah>) + '<anim>0..n',
// anim Phaser 's_<id>_<arah>' (jalan) & 's_<id>__<anim>' (kegiatan, diputar oleh lifeAnim). NPC dengan id itu otomatis memakai lembarnya.
const NPC_SHEETS = { // {{GEN}} dibuat tools/gen_npc_sheets.py dari docs/NPC_ROSTER.md (urutan = baris 5+ di lembar)
  gk1: ['inspect', 'salute'],
  gk2: ['train', 'salute', 'spar_attack', 'spar_block'],
  gk5: ['train', 'salute', 'spar_attack', 'spar_block'],
  gk6: ['train', 'salute', 'spar_attack', 'spar_block'],
  gk7: ['train', 'salute', 'spar_attack', 'spar_block'],
  gk3: ['shoot', 'salute'],
  gk8: ['shoot', 'salute'],
  gk4: ['groom'],
  merc1: ['sharpen', 'spar_attack', 'spar_block'],
  gk9: ['sharpen', 'spar_attack', 'spar_block'],
  gk10: ['sharpen', 'spar_attack', 'spar_block'],
  courier: ['give'],
  st1: ['arrange', 'call', 'give'],
  st2: ['arrange', 'call', 'give'],
  st3: ['arrange', 'call', 'give'],
  st4: ['arrange', 'call', 'give'],
  st5: ['arrange', 'call', 'give'],
  st6: ['arrange', 'call', 'give'],
  st7: ['arrange', 'call', 'give'],
  st8: ['arrange', 'call', 'give'],
  ps1: ['browse', 'pay', 'refuse', 'clap'],
  ps2: ['browse', 'pay', 'refuse', 'clap'],
  kp1: ['browse', 'pay', 'refuse', 'clap'],
  kp4: ['browse', 'pay', 'refuse', 'clap'],
  kp7: ['browse', 'pay', 'refuse', 'clap'],
  ps3: ['play'],
  ps4: ['sweep'],
  ps5: ['light'],
  ps6: ['pray'],
  ps7: ['give'],
  pm1: ['announce'],
  pm2: ['stamp'],
  pm3: ['draw'],
  pm4: ['pray'],
  pm5: ['clap', 'laugh'],
  pm6: ['clap', 'laugh'],
  pm7: ['light'],
  ac1: ['lecture'],
  ac2: ['study', 'clap'],
  ac3: ['study', 'clap'],
  ac4: ['study', 'clap'],
  ka1: ['study', 'clap'],
  ka3: ['study', 'clap'],
  ac5: ['prune'],
  ac6: ['stargaze'],
  ac7: ['train', 'salute', 'spar_attack', 'spar_block'],
  ac8: ['shoot', 'salute'],
  ac9: ['sweep'],
  bw1: ['drum', 'laugh'],
  bw2: ['play'],
  bw3: ['sweep'],
  vl1: ['draw'],
  vl2: ['light'],
  md1: ['mill'],
  md2: ['fish'],
  lk1: ['tendlight'],
  lk2: ['warm'],
  rd1: ['warm', 'laugh'],
  rd2: ['warm', 'laugh'],
  in1: ['drink', 'cheers'],
  in2: ['drink', 'cheers'],
  in3: ['drink', 'cheers'],
  tp1: ['pray'],
  ar1: ['read'],
  ar2: ['read'],
}; // {{/GEN}}
const NPC_SHEET_FW = 48; // kecepatan frame per animasi (sama dengan docs/NPC_ROSTER.md)
const NPC_SHEET_FPS = {
  walk: 8, default: 8, train: 10, spar_attack: 12, spar_block: 8, shoot: 8, salute: 6, inspect: 6, groom: 6, sharpen: 8, arrange: 6, call: 6,
  give: 6, pay: 6, refuse: 6, browse: 4, clap: 8, laugh: 8, play: 6, announce: 6, pray: 4, draw: 6, stamp: 8, lecture: 6, study: 4, prune: 6,
  stargaze: 3, sweep: 8, light: 6, drink: 4, cheers: 6, fish: 6, read: 3, drum: 10, mill: 6, tendlight: 5, warm: 4,
};
IMG_LIST.push(...Object.keys(NPC_SHEETS).map(id => 'npc_sheet_' + id));
function regNpcSheet(sc, id, anims) {
  const T = sc.textures, A = sc.anims, img = IMGEL['npc_sheet_' + id], F = NPC_SHEET_FW, key = 's_' + id;
  if (!img || img.width < F * 4 || T.exists('ch_' + key)) return; // file belum ada (kanvas kosong 32×32)
  const t = T.addImage('ch_' + key, img), at = (name, c, r) => t.add(name, 0, c * F, r * F, F, F);
  ['down', 'up', 'side'].forEach((d, r) => { for (let c = 0; c < 4; c++) at(d + c, c, r); });
  at('brdown', 1, 3); at('brside', 3, 3); at('brup', 5, 3);
  for (let c = 0; c < 4; c++) at('talk' + c, c, 4);
  A.create({ key: key + '__talk', frames: [0, 1, 2, 3].map(c => ({ key: 'ch_' + key, frame: 'talk' + c })), frameRate: 6, repeat: 1 });
  at('noddown', 1, 4); at('nodside', 1, 4); at('nodup', 1, 4);
  const rows = Math.floor(img.height / F);
  anims.forEach((name, i) => {
    const r = 5 + i; if (r >= rows) return;
    const fr = []; for (let c = 0; c < 8; c++) { at(name + c, c, r); fr.push(name + c); }
    // frame kosong di ujung baris tidak diputar
    const cv = document.createElement('canvas'); cv.width = F * 8; cv.height = F; const g = cv.getContext('2d');
    g.drawImage(img, 0, r * F, F * 8, F, 0, 0, F * 8, F);
    let n = 8; while (n > 1 && !g.getImageData((n - 1) * F, 0, F, F).data.some((v, j) => j % 4 === 3 && v > 0)) n--;
    const frames = fr.slice(0, n).map(f => ({ key: 'ch_' + key, frame: f }));
    A.create({ key: key + '__' + name, frames, frameRate: NPC_SHEET_FPS[name] || NPC_SHEET_FPS.default, repeat: 0 });
  });
  const walk = { down: ['down0', 'down1', 'down2', 'down3'], up: ['up0', 'up1', 'up2', 'up3'], side: ['side0', 'side1', 'side2', 'side3'] };
  NPC_FR[key] = { walk, top: 0, poses: true };
  NPC_SCALES[key] = 1; /* lembar 48×48 sudah berukuran asli: jangan diperbesar 1,2× seperti potret 32 px */
  for (const d of ['down', 'up', 'side']) {
    A.create({ key: key + '_' + d, frames: walk[d].map(f => ({ key: 'ch_' + key, frame: f })), frameRate: NPC_SHEET_FPS.walk, repeat: -1 });
  }
}
{
  const bt0 = buildTextures;
  buildTextures = function (sc) { const r = bt0.apply(this, arguments); for (const id in NPC_SHEETS) regNpcSheet(sc, id, NPC_SHEETS[id]); return r; };
  const spawn0 = World.prototype.spawnNpc;
  World.prototype.spawnNpc = function (n) {
    if (n && NPC_SHEETS[n.id] && this.textures.exists('ch_s_' + n.id)) n = Object.assign({}, n, { ch: 's_' + n.id });
    return spawn0.call(this, n);
  };
}
// arah gambar tiap animasi kegiatan (side = menghadap kanan, dicerminkan bila NPC menghadap kiri)
const LIFE_ANIM_FACE = {
  shoot: 'up', browse: 'up', pray: 'up', draw: 'up', stamp: 'up', study: 'up', stargaze: 'up', light: 'up', tendlight: 'up', warm: 'up',
  arrange: 'down', call: 'down', play: 'down', announce: 'down', lecture: 'down', drink: 'down', read: 'down', drum: 'down', talk: 'down', cheers: 'down',
};
/* putar animasi kegiatan dari lembar (bila ada); false = pakai gerak pengganti */
World.prototype.lifeAnim = function (o, name) {
  const k = o.ch + '__' + name; if (!this.anims.exists(k)) return false;
  const f = LIFE_ANIM_FACE[name] || 'side'; if (f !== 'side') o.spr.flipX = false; else if (o.dir !== 'left' && o.dir !== 'right') o.spr.flipX = false;
  o.spr.play(k); o.poseUntil = this.t + this.anims.get(k).duration / 1000 + .1; return true;
};
