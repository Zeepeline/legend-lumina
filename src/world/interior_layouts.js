'use strict';
// Interior = gambar ruangan pemilik apa adanya (assets/img/int_room1..3.png, skala sama dengan perabot lembar → rasio & bentuk identik).
// Tiap ruangan: ukuran peta = ukuran gambar, kamera zoom 2, tembok & perabot padat digambar persegi (koordinat piksel gambar).
// Seluruh tapak perabot dibuat padat sehingga pemain tak pernah tampak "masuk" ke perabot yang dipanggang di latar.
const INT_ROOMS = {
  // Rumah Arka = ruang 1 (perapian, rak, ranjang merah, meja bunga di karpet merah)
  home: { bg: 'room1', w: 127, h: 111, door: [44, 72, 92], entry: [58, 86], board: [75, 46], guest: [84, 74],
    solid: [[93, 42, 24, 14], [95, 56, 22, 11], [33, 56, 42, 22], [10, 64, 14, 28], [103, 72, 14, 20]],
    use: [[88, 48, 'bed'], [39, 46, 'stove'], [17, 46, 'wardrobe']] },
  // Penginapan = ruang 2 (rak toples, meja tulis, karpet hijau, peti & tong)
  inn: { bg: 'room2', w: 136, h: 112, door: [54, 83, 92], entry: [68, 86],
    solid: [[92, 42, 34, 6], [11, 42, 13, 9], [111, 48, 15, 16], [10, 60, 26, 32], [100, 65, 26, 27]],
    doors: [[30, 42, 0], [100, 44, 1]], npcs: [[66, 50]] },
  // Rumah Pohon Tetua = ruang 3 (dua rak buku, lemari, ranjang biru, meja bundar + lilin di karpet merah)
  elderhome: { bg: 'room3', w: 127, h: 109, door: [48, 77, 88], entry: [62, 82],
    solid: [[10, 42, 14, 23], [93, 42, 23, 14], [50, 52, 23, 24], [73, 52, 13, 22], [103, 53, 11, 12], [103, 68, 14, 20], [10, 72, 26, 16]],
    doors: [[27, 42, 0], [41, 42, 1], [57, 42, 2]], chests: [[79, 42]], vault: [24, 68] },
  // Rumah Lina = ruang 1 dicerminkan
  linahome: { bg: 'room1', flip: 1, w: 127, h: 111, door: [55, 83, 92], entry: [69, 86],
    solid: [[10, 42, 24, 14], [10, 56, 22, 11], [52, 56, 42, 22], [103, 64, 14, 28], [10, 72, 14, 20]],
    doors: [[52, 42, 0]], npcs: [[88, 50]] },
};
IMG_LIST.push('int_room1', 'int_room2', 'int_room3');
for (const id in INT_ROOMS) {
  const M = MAPS[id], R = INT_ROOMS[id]; if (!M) continue; const [dl, dr, fb] = R.door;
  Object.assign(M, { w: R.w, h: R.h, sheet: 1, bgImg: R.bg, bgFlip: R.flip, furn: [], furn2: [], windows: [], zoom: 2,
    entry: R.entry, board: R.board, guest: R.guest,
    room: [10, 42, R.w - 20, fb - 42], solid: R.solid, sheetUse: R.use, vaultAt: R.vault });
  M.walls = [[0, 0, R.w, 42], [0, 0, 10, R.h], [R.w - 10, 0, 10, R.h], [0, fb, dl, R.h - fb], [dr, fb, R.w - dr, R.h - fb], ...R.solid];
  M.exits = M.exits.map(e => Object.assign({}, e, { x: dl, y: fb + 8, w: dr - dl, h: R.h - fb - 8 }));
  if (R.doors) M.doors = R.doors.map(([x, y, k]) => { const d = M.doors[k].slice(); d[0] = x; d[1] = y; return d; });
  if (R.npcs) R.npcs.forEach(([x, y], i) => Object.assign(M.npcs[i], { x, y }));
  if (R.chests) R.chests.forEach(([x, y], i) => Object.assign(M.chests[i], { x, y }));
  if (R.vault) M.objs = [];
}
// latar ruangan = gambar asli (dicerminkan bila perlu)
const _genRoomSheet0 = genRoomSheet;
genRoomSheet = function (M) {
  if (!M.bgImg) return _genRoomSheet0(M);
  const [c, x] = mk(M.w, M.h), im = IMGEL['int_' + M.bgImg]; x.imageSmoothingEnabled = false; x.fillStyle = '#0e0907'; x.fillRect(0, 0, M.w, M.h);
  if (im) { if (M.bgFlip) { x.translate(M.w, 0); x.scale(-1, 1); } x.drawImage(im, 0, 0); }
  return c;
};
// perabot bawaan gambar yang bisa dipakai (ranjang, perapian, lemari) + brankas desa di tumpukan peti
{ const _sh = World.prototype.spawnHome;
  World.prototype.spawnHome = function () {
    _sh.call(this); const M = this.M;
    for (const [x, y, t] of M.sheetUse || []) this.inter.push({ x, y, r: 14, fn: () => this.useFurn({ f: { t } }) });
    const vault = async () => {
      if (typeof openVillageVault === 'function') await openVillageVault(this); else await say('Brankas besi kokoh Balai Desa Lumina.');
    };
    if (M.vaultAt) this.inter.push({ x: M.vaultAt[0], y: M.vaultAt[1], r: 16, fn: vault });
  };
}
// rumah Arka: area tata perabot = lantai gambar
Object.assign(ROOM_IN, { x: 10, y: 14, r: 117, b: 92, fy: 42 });
Object.assign(DOOR_LANE, { x: 40, y: 76, r: 76, b: 111 });
const _homeInit0 = homeInit;
homeInit = function () {
  const H = _homeInit0();
  if (H.owned && !H.lay3) { /* perabot lama → gudang */
    H.lay3 = 1; H.store = H.store || {}; for (const f of H.items) H.store[f.t] = (H.store[f.t] || 0) + 1; H.items = [];
  }
  return H;
};
// perabot rumah Arka memakai sprite lembar yang sama
Object.assign(FCAT.bed, { tex: 'int_bed_red', w: 28, h: 39 });
Object.assign(FCAT.bed_cozy, { tex: 'int_bed_blue', w: 28, h: 39 });
Object.assign(FCAT.table, { tex: 'int_table_flower', w: 55, h: 31 });
Object.assign(FCAT.shelf, { tex: 'int_bookshelf', w: 31, h: 38 });
Object.assign(FCAT.rug, { tex: 'int_rug_red', w: 34, h: 36 });
Object.assign(FCAT.stove, { tex: 'int_fireplace', w: 28, h: 44, n: 'Perapian & Tungku' });
Object.assign(FCAT.craft, { tex: 'int_workbench', w: 40, h: 27 });
Object.assign(FCAT.box, { tex: 'int_chest', w: 20, h: 27 });
Object.assign(FCAT.alchemy, { tex: 'int_jarshelf', w: 37, h: 29 });
Object.assign(FCAT.trophy, { tex: 'int_bookcase_low', w: 33, h: 34 });
Object.assign(FCAT.wardrobe, { tex: 'int_wardrobe', w: 26, h: 37 });
Object.assign(FCAT.plant, { tex: 'int_plant_palm', w: 21, h: 32 });
// peti di ruangan bergambar: peti yang sudah ada di gambar dipakai (sprite peti disembunyikan)
{ const _sc = World.prototype.spawnChest;
  World.prototype.spawnChest = function (c) {
    if (!this.M.bgImg) return _sc.call(this, c);
    const s = this.add.image(c.x, c.y, S.flags[c.id] ? 'chesto' : 'chest').setVisible(false);
    this.inter.push({ x: c.x, y: c.y + 4, r: 14, fn: () => this.openChest(c, s) }); return s;
  };
}
// masuk interior bergambar selalu dari pintu; kamera zoom 2 tanpa batas (pemusatan di camStep)
{ const _cr = World.prototype.create;
  World.prototype.create = function (data) {
    const M = MAPS[(data && data.map) || 'village']; if (M && M.entry) [data.x, data.y] = M.entry;
    const r = _cr.call(this, data), cam = this.cameras.main; cam.setZoom((M && M.zoom) || 1); if (M && M.zoom) cam.removeBounds(); return r;
  };
}
