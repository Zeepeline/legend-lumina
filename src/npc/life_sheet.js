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
  vl3: ['laugh'],
  vl4: ['laugh'],
  vl5: ['laugh'],
  kn1: ['laugh'],
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
  mira: ['read', 'cast'],
  smith: ['hammer', 'sit'],
  guard: ['slash', 'sit'],
  farmer: ['hoe', 'water', 'harvest', 'sit'],
  hunter: ['bow', 'sit'],
}; // {{/GEN}}
const NPC_SHEET_FW = 48; // kecepatan frame per animasi (sama dengan docs/NPC_ROSTER.md)
const NPC_SHEET_DIM = { kn1: [80, 56] }; // sel khusus (lebar, tinggi) untuk tokoh bersenjata besar; lainnya 48×48
const NPC_SHEET_FPS = {
  walk: 8, default: 8, train: 10, spar_attack: 12, spar_block: 8, shoot: 8, salute: 6, inspect: 6, groom: 6, sharpen: 8, arrange: 6, call: 6,
  give: 6, pay: 6, refuse: 6, browse: 4, clap: 8, laugh: 8, play: 6, announce: 6, pray: 4, draw: 6, stamp: 8, lecture: 6, study: 4, prune: 6,
  stargaze: 3, sweep: 8, light: 6, drink: 4, cheers: 6, fish: 6, read: 3, drum: 10, mill: 6, tendlight: 5, warm: 4, cast: 6,
  hammer: 16, slash: 16, hoe: 12, bow: 10, water: 8, harvest: 4, sit: 1,
};
IMG_LIST.push(...Object.keys(NPC_SHEETS).map(id => 'npc_sheet_' + id));
// urutan frame (frame diulang = ditahan): ancang-ancang lama, ayun cepat, hantam, pulih
const NPC_SHEET_SEQ = {
  bow: [0, 0, 1, 2, 2, 2, 2, 2, 3, 3, 0, 0],
  hoe: [0, 1, 1, 1, 1, 2, 2, 3, 3, 0], harvest: [0, 1, 0, 1, 2, 3, 2, 2],
  hammer: [0, 0, 0, 0, 1, 2, 2, 2, 3, 3], slash: [0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 4, 4],
};
function regNpcSheet(sc, id, anims) {
  const T = sc.textures, A = sc.anims, img = IMGEL['npc_sheet_' + id], [F, FH] = NPC_SHEET_DIM[id] || [NPC_SHEET_FW, NPC_SHEET_FW], key = 's_' + id;
  if (!img || img.width < F * 4 || T.exists('ch_' + key)) return; // file belum ada (kanvas kosong 32×32)
  const t = T.addImage('ch_' + key, img), at = (name, c, r) => t.add(name, 0, c * F, r * FH, F, FH);
  const cols = Math.min(8, Math.floor(img.width / F)), cv = document.createElement('canvas');
  cv.width = F * cols; cv.height = FH; const g = cv.getContext('2d');
  const rowLen = (r, min) => {
    g.clearRect(0, 0, cv.width, FH); g.drawImage(img, 0, r * FH, cv.width, FH, 0, 0, cv.width, FH);
    let n = cols; while (n > min && !g.getImageData((n - 1) * F, 0, F, FH).data.some((v, j) => j % 4 === 3 && v > 0)) n--;
    return n;
  };
  const walk = {}, dirs = ['down', 'up', 'side'];
  dirs.forEach((d, r) => {
    const n = rowLen(r, 4); walk[d] = [];
    for (let c = 0; c < n; c++) { at(d + c, c, r); walk[d].push(d + c); }
  });
  at('brdown', 1, 3); at('brside', 3, 3); at('brup', 5, 3);
  for (let c = 0; c < 4; c++) at('talk' + c, c, 4);
  A.create({ key: key + '__talk', frames: [0, 1, 2, 3].map(c => ({ key: 'ch_' + key, frame: 'talk' + c })), frameRate: 6, repeat: 1 });
  at('noddown', 1, 4); at('nodside', 1, 4); at('nodup', 1, 4);
  const rows = Math.floor(img.height / FH);
  anims.forEach((name, i) => {
    const r = 5 + i; if (r >= rows) return;
    const fr = []; for (let c = 0; c < 8; c++) { at(name + c, c, r); fr.push(name + c); }
    // frame kosong di ujung baris tidak diputar
    const n = rowLen(r, 1);
    const seq = NPC_SHEET_SEQ[name], frames = (seq && n > Math.max(...seq) ? seq.map(j => fr[j]) : fr.slice(0, n)).map(f => ({ key: 'ch_' + key, frame: f }));
    A.create({ key: key + '__' + name, frames, frameRate: NPC_SHEET_FPS[name] || NPC_SHEET_FPS.default, repeat: 0 });
  });
  if (rows >= 5 + anims.length + 2) {
    [['down_side', 5 + anims.length], ['up_side', 5 + anims.length + 1]].forEach(([d, r]) => {
      const n = rowLen(r, 4); walk[d] = []; dirs.push(d);
      for (let c = 0; c < n; c++) { at(d + c, c, r); walk[d].push(d + c); }
    });
  }
  const left = rows >= 5 + anims.length + 4; // 2 baris tambahan: diagonal kiri depan & belakang (tanpa cermin)
  if (left) [['down_side_l', 7], ['up_side_l', 8]].forEach(([d, k]) => {
    const r = k + anims.length, n = rowLen(r, 4); walk[d] = []; dirs.push(d);
    for (let c = 0; c < n; c++) { at(d + c, c, r); walk[d].push(d + c); }
  });
  NPC_FR[key] = { left, walk, top: FH - NPC_SHEET_FW, poses: true, dir8: !!(walk.down_side && walk.up_side) };
  NPC_SCALES[key] = 1; /* lembar 48×48 sudah berukuran asli: jangan diperbesar 1,2× seperti potret 32 px */
  for (const d of dirs) {
    const fr = walk[d];
    A.create({ key: key + '_' + d, frames: fr.map(f => ({ key: 'ch_' + key, frame: f })), frameRate: fr.length > 4 ? 10 : NPC_SHEET_FPS.walk, repeat: -1 });
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
  cast: 'down', hammer: 'down', sit: 'down',
};
/* putar animasi kegiatan dari lembar (bila ada); false = pakai gerak pengganti */
World.prototype.lifeAnim = function (o, name) {
  const k = o.ch + '__' + name; if (!this.anims.exists(k)) return false;
  const f = LIFE_ANIM_FACE[name] || 'side'; if (f !== 'side') o.spr.flipX = false; else if (o.dir !== 'left' && o.dir !== 'right') o.spr.flipX = false;
  o.spr.play(k); o.poseUntil = this.t + this.anims.get(k).duration / 1000 + .1; return true;
};
