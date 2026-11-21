'use strict';
// Gambar properti & bangunan cerita baru (Prolog & Bab 1): Makam Mila, Gubuk Reyot, Sarang Pemburu Liar, dll.
// Gaya: Art Bible Lumina (cahaya kiri-atas, outline berwarna, palet terpadu).

function artMilaGrave() {
  const W = 32, H = 28, [c, x] = mk(W, H);
  // gundukan tanah basah
  ellF(x, '#442e18', 16, 21, 13, 6);
  ellF(x, '#624424', 16, 20, 11, 4);
  ellF(x, '#7e5830', 16, 19, 8, 3);
  // batu kali kecil penahan tanah
  for (const [bx, by, br] of [[6, 22, 3], [25, 23, 2.5], [10, 24, 2], [21, 24, 2.5]]) {
    ellF(x, '#58524a', bx, by, br, br * 0.7);
    ellF(x, '#968f84', bx - 0.5, by - 0.5, br * 0.7, br * 0.5);
  }
  // nisan kayu sederhana (vertikal)
  fr(x, '#3e2412', 15, 6, 4, 15);
  fr(x, '#6c4422', 15, 6, 2, 14);
  fr(x, '#9e683a', 15, 7, 1, 13);
  // palang horizontal nisan
  fr(x, '#3e2412', 11, 10, 12, 3);
  fr(x, '#6c4422', 11, 10, 12, 2);
  fr(x, '#9e683a', 12, 10, 10, 1);
  // pita merah peninggalan Mila yang diikatkan di persilangan kayu
  fr(x, '#8a1818', 14, 9, 6, 5);
  fr(x, '#d82828', 15, 9, 4, 4);
  fr(x, '#ff5a5a', 15, 10, 2, 2);
  // ujung pita menjuntai ke kanan bawah
  px(x, '#d82828', 18, 14); px(x, '#ff5a5a', 19, 15); px(x, '#8a1818', 19, 16);
  // bunga liar kecil di samping gundukan
  fr(x, '#3a7824', 21, 17, 2, 4);
  px(x, '#ffffff', 20, 16); px(x, '#ffe066', 21, 16); px(x, '#ffffff', 22, 16);
  fr(x, '#3a7824', 8, 19, 2, 3);
  px(x, '#ff90aa', 8, 18);
  return outline(c);
}

function artRuinedShack() {
  const W = 76, H = 64, [c, x] = mk(W, H);
  const wall = '#543b24', wallD = '#362414', wallL = '#785434';
  const tim = '#281a0e', timL = '#8a5c34';
  // dinding utama lapuk
  fr(x, wall, 12, 30, 52, 28);
  fr(x, wallD, 12, 30, 52, 3);
  fr(x, wallD, 60, 30, 4, 28);
  // papan-papan dinding bergaris retak
  for (let y = 35; y < 58; y += 5) fr(x, tim, 12, y, 52, 1);
  // lubang menganga di dinding kayu
  fr(x, '#1e140a', 20, 38, 8, 6);
  fr(x, '#1e140a', 48, 42, 6, 5);
  // tiang penyangga miring (kiri dan kanan)
  for (let i = 0; i < 26; i++) {
    px(x, timL, 13 + Math.floor(i * 0.08), 31 + i);
    px(x, tim, 14 + Math.floor(i * 0.08), 31 + i);
    px(x, timL, 62 - Math.floor(i * 0.08), 31 + i);
    px(x, tim, 63 - Math.floor(i * 0.08), 31 + i);
  }
  // pintu kayu lapuk miring setengah terbuka
  const dx = 32, dy = 36;
  fr(x, '#180f08', dx, dy, 14, 22); // interior gelap
  for (let y = dy; y < dy + 21; y++) {
    const ox = Math.floor((y - dy) * 0.15);
    fr(x, '#624226', dx + 2 + ox, y, 9, 1);
    px(x, '#8e623a', dx + 2 + ox, y);
    px(x, '#362212', dx + 10 + ox, y);
  }
  // fondasi batu runtuh
  for (let i = 10; i <= 65; i += 4) {
    ellF(x, '#645e56', i, 58, 3, 2);
    ellF(x, '#8a847a', i - 0.5, 57.5, 2, 1.5);
  }
  // atap jerami lapuk bocor
  const peak = 6, eave = 33;
  for (let y = peak; y <= eave; y++) {
    const hw = 4 + (y - peak) * (33 / (eave - peak));
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const X = 38 + i;
      // lubang besar atap bocor di sisi kanan atas (x: 44..56, y: 12..24)
      if (X > 43 && X < 56 && y > 11 && y < 24) {
        // perlihatkan rusuk kayu patah di dalam lubang
        if ((X + y) % 5 === 0) px(x, '#442a16', X, y);
        continue;
      }
      let col = i < 0 ? '#988458' : '#7c6a44';
      if ((X + y) % 4 === 0) col = '#5a4c2e';
      if (y === eave || Math.abs(i) >= Math.round(hw) - 1) col = '#3e341e';
      px(x, col, X, y);
    }
  }
  // jerami mencuat tak beraturan di pinggir atap
  for (let i = 6; i <= 70; i += 3) {
    const len = ((i * 7) % 5);
    fr(x, '#7c6a44', i, eave, 1, len);
    px(x, '#988458', i, eave + len);
  }
  // lumut dan sulur tanaman merambat
  fr(x, '#3a6624', 14, 46, 3, 10);
  fr(x, '#4e8632', 15, 48, 2, 6);
  fr(x, '#3a6624', 56, 50, 4, 7);
  return outline(c);
}

function artSlaverCage() {
  const W = 46, H = 40, [c, x] = mk(W, H);
  // dasar lumpur
  ellF(x, '#362212', 23, 34, 18, 5);
  ellF(x, '#50341c', 23, 33, 15, 3.5);
  // bayangan interior gelap
  fr(x, '#181008', 7, 10, 32, 24);
  // jerami kotor di lantai kandang
  for (let i = 8; i < 38; i += 2) px(x, '#847044', i, 33 + (i % 2));
  // terali jeruji kayu/besi vertikal
  for (let gx = 9; gx <= 37; gx += 4) {
    fr(x, '#2a221a', gx, 10, 2, 24);
    fr(x, '#54585c', gx, 10, 1, 24); // kilau besi kusam
  }
  // balok rangka kayu luar (kiri, kanan, atas, bawah, tengah)
  fr(x, '#5e3a20', 5, 8, 36, 4); // atas
  fr(x, '#8a5632', 5, 8, 36, 1);
  fr(x, '#3e2412', 5, 11, 36, 1);
  fr(x, '#5e3a20', 5, 31, 36, 4); // bawah
  fr(x, '#5e3a20', 5, 8, 4, 27);  // tiang kiri
  fr(x, '#8a5632', 5, 8, 1, 27);
  fr(x, '#5e3a20', 37, 8, 4, 27); // tiang kanan
  fr(x, '#3e2412', 40, 8, 1, 27);
  fr(x, '#4e3018', 5, 20, 36, 3); // palang penguat tengah
  // gembok & rantai besi di pintu depan
  fr(x, '#727880', 20, 18, 6, 7);
  fr(x, '#444850', 21, 19, 4, 5);
  fr(x, '#cca038', 21, 20, 4, 4); // gembok kuningan kusam
  px(x, '#1a1810', 22, 22);
  // terpal sobek di atas kandang
  for (let i = 6; i < 28; i++) {
    const ty = 7 - Math.floor(Math.sin((i - 6) / 22 * Math.PI) * 3);
    px(x, '#7e725a', i, ty);
    px(x, '#544c3a', i, ty + 1);
  }
  return outline(c);
}

function artPrisonerWagon() {
  const W = 56, H = 40, [c, x] = mk(W, H);
  // lumpur dasar
  ellF(x, '#342010', 28, 35, 22, 4);
  // badan gerobak kayu
  fr(x, '#4e321a', 10, 16, 40, 13);
  fr(x, '#724c28', 10, 16, 40, 2);
  fr(x, '#2e1c0e', 10, 28, 40, 1);
  // garis sambungan papan
  fr(x, '#2e1c0e', 10, 20, 40, 1);
  fr(x, '#2e1c0e', 10, 24, 40, 1);
  // terali jeruji kurungan di atas gerobak
  fr(x, '#140c06', 12, 6, 36, 10); // gelap di balik jeruji
  for (let jx = 13; jx <= 46; jx += 4) {
    fr(x, '#282420', jx, 6, 2, 10);
    fr(x, '#626870', jx, 6, 1, 10);
  }
  fr(x, '#5c3a20', 10, 5, 40, 3); // atap terali kayu
  fr(x, '#7e5230', 10, 5, 40, 1);
  // tongkat penarik di depan gerobak
  fr(x, '#624024', 2, 23, 9, 2);
  fr(x, '#3a2414', 2, 24, 9, 1);
  // dua roda kayu bundar besar
  const drawWheel = (wx, wy) => {
    ellF(x, '#2a1a0e', wx, wy, 7, 7);
    ellF(x, '#684424', wx, wy, 6, 6);
    ellF(x, '#1c120a', wx, wy, 4, 4);
    fr(x, '#845832', wx - 5, wy, 11, 1); // jari-jari horizontal
    fr(x, '#845832', wx, wy - 5, 1, 11); // jari-jari vertikal
    ellF(x, '#383a40', wx, wy, 2, 2);   // poros besi tengah
    px(x, '#7a8088', wx - 0.5, wy - 0.5);
  };
  drawWheel(18, 31);
  drawWheel(42, 31);
  return outline(c);
}

function artSlaverTent() {
  const W = 68, H = 48, [c, x] = mk(W, H);
  // tiang kayu tengah mencuat di puncak
  fr(x, '#724a28', 33, 2, 2, 8);
  px(x, '#9e6a3a', 33, 2);
  // kain tenda bentuk prisma kerucut kasar
  const topY = 6, botY = 40;
  for (let y = topY; y <= botY; y++) {
    const hw = 3 + (y - topY) * (28 / (botY - topY));
    for (let i = Math.round(-hw); i <= Math.round(hw); i++) {
      const X = 34 + i;
      let col = i < -2 ? '#9c9074' : (i > 6 ? '#5e5644' : '#7e745c');
      if (Math.abs(i) < 2) col = '#a69a7e'; // sorotan lipatan tengah
      if ((X * 3 + y * 7) % 19 === 0) col = '#524a3a'; // noda kusam
      px(x, col, X, y);
    }
  }
  // tambalan kain kulit kasar di atap tenda
  fr(x, '#583a22', 18, 20, 8, 6);
  fr(x, '#744e30', 18, 20, 8, 1);
  px(x, '#2a180c', 17, 22); px(x, '#2a180c', 26, 22); // jahitan
  // bukaan pintu tenda di depan
  for (let y = 18; y <= botY; y++) {
    const dw = (y - 18) * (9 / (botY - 18));
    for (let i = Math.round(-dw); i <= Math.round(dw); i++) {
      px(x, '#1c1610', 34 + i, y);
    }
  }
  // tali pengencang dan pasak tanah
  for (let i = 0; i < 6; i++) {
    px(x, '#b49e7a', 6 + i, botY - i);
    px(x, '#b49e7a', 61 - i, botY - i);
  }
  fr(x, '#5a3a1e', 5, botY, 2, 4);
  fr(x, '#5a3a1e', 61, botY, 2, 4);
  return outline(c);
}

function artSlaverBarricade() {
  const W = 36, H = 26, [c, x] = mk(W, H);
  // tiga pancang kayu runcing menyilang
  const drawStake = (x0, y0, x1, y1) => {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    for (let s = 0; s <= len; s += 0.8) {
      const px0 = Math.round(x0 + (dx * s) / len), py0 = Math.round(y0 + (dy * s) / len);
      px(x, '#6e4624', px0, py0);
      px(x, '#966436', px0 - 1, py0);
      px(x, '#3e2410', px0 + 1, py0);
    }
  };
  drawStake(8, 22, 14, 4);  // pancang kiri runcing
  drawStake(28, 22, 22, 4); // pancang kanan runcing
  drawStake(10, 8, 26, 22); // silang pengikat
  drawStake(26, 8, 10, 22);
  // ujung runcing diasah tajam
  px(x, '#b8824a', 14, 4); px(x, '#b8824a', 22, 4);
  // ikatan tali rotan di persilangan
  fr(x, '#b8924e', 16, 13, 5, 4);
  fr(x, '#84622a', 16, 14, 5, 2);
  // batu penahan di tanah
  ellF(x, '#625c54', 18, 23, 10, 3);
  return outline(c);
}

function artReflectionSpring() {
  const W = 38, H = 26, [c, x] = mk(W, H);
  // bibir kolam dari batu kali alami
  ellF(x, '#565046', 19, 13, 17, 10);
  for (let a = 0; a < Math.PI * 2; a += 0.6) {
    const rx = 19 + Math.cos(a) * 14, ry = 13 + Math.sin(a) * 7.5;
    ellF(x, '#7a7468', rx, ry, 3.5, 2.5);
    ellF(x, '#9e9688', rx - 0.5, ry - 0.5, 2.5, 1.8);
  }
  // air jernih berkilau
  ellF(x, '#1c4a5c', 19, 13, 12, 6);
  ellF(x, '#2e7a96', 19, 13, 10, 5);
  ellF(x, '#48b2d4', 18, 12.5, 8, 3.5);
  ellF(x, '#88e0fc', 17, 12, 5, 2);
  // sorot kilau putih refleksi di permukaan air
  px(x, '#ffffff', 16, 11); px(x, '#ffffff', 17, 11); px(x, '#ffffff', 18, 11);
  px(x, '#ffffff', 17, 12);
  // sedikit lumut hijau segar di tepi batu
  fr(x, '#3c7828', 7, 10, 3, 2);
  fr(x, '#4ea034', 28, 14, 3, 2);
  return outline(c);
}

function artBurntRuin() {
  const W = 52, H = 36, [c, x] = mk(W, H);
  // tumpukan abu hitam di tanah
  ellF(x, '#242020', 26, 26, 20, 7);
  ellF(x, '#3a3434', 26, 25, 16, 5);
  // balok-balok kayu arang hangus patah
  const drawLog = (x0, y0, x1, y1) => {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy);
    for (let s = 0; s <= len; s += 0.8) {
      const px0 = Math.round(x0 + (dx * s) / len), py0 = Math.round(y0 + (dy * s) / len);
      px(x, '#141212', px0, py0);
      px(x, '#2c2828', px0 - 1, py0);
      px(x, '#0c0a0a', px0 + 1, py0);
    }
  };
  drawLog(8, 28, 38, 14);
  drawLog(14, 16, 44, 26);
  drawLog(22, 30, 28, 10);
  // bara api kecil yang masih menyala di sela arang
  for (const [fx, fy] of [[24, 22], [28, 20], [18, 25], [33, 23]]) {
    px(x, '#841808', fx - 1, fy);
    px(x, '#e83c12', fx, fy);
    px(x, '#ff9624', fx, fy - 1);
    px(x, '#ffe066', fx + 1, fy);
  }
  return outline(c);
}

function artMudTracks() {
  const W = 28, H = 16, [c, x] = mk(W, H);
  // dua alur bekas roda gerobak di lumpur
  for (let i = 0; i < 24; i++) {
    const y1 = 4 + Math.floor(Math.sin(i * 0.15) * 2);
    const y2 = 10 + Math.floor(Math.sin(i * 0.15) * 2);
    px(x, '#2c1a0e', 2 + i, y1);     // alur atas
    px(x, '#442a18', 2 + i, y1 + 1);
    px(x, '#2c1a0e', 2 + i, y2);     // alur bawah
    px(x, '#442a18', 2 + i, y2 + 1);
    // genangan air tipis di cekungan roda
    if (i > 6 && i < 18) {
      px(x, '#1a2c38', 2 + i, y1);
      px(x, '#1a2c38', 2 + i, y2);
    }
  }
  return c;
}

function artDroppedTorch() {
  const W = 18, H = 12, [c, x] = mk(W, H);
  // tangkai kayu miring
  for (let i = 0; i < 11; i++) {
    px(x, '#6e4624', 3 + i, 9 - Math.floor(i * 0.4));
    px(x, '#422812', 3 + i, 10 - Math.floor(i * 0.4));
  }
  // kepala obor berlilit kain gosong
  fr(x, '#1c1614', 12, 3, 4, 4);
  fr(x, '#362a26', 12, 3, 4, 1);
  // abu hitam berhamburan di tanah
  px(x, '#242020', 16, 5); px(x, '#242020', 15, 6); px(x, '#3a3434', 17, 6);
  return outline(c);
}

function artClothScrap() {
  const W = 14, H = 12, [c, x] = mk(W, H);
  // sobekan kain pakaian warna krem/biru lusuh
  fr(x, '#88a4b8', 3, 4, 6, 4);
  fr(x, '#b2cadc', 3, 4, 6, 1);
  px(x, '#627c8e', 8, 8); px(x, '#627c8e', 9, 7);
  // noda darah merah kering di sobekan kain
  px(x, '#7e1c1c', 5, 5); px(x, '#a82c2c', 6, 5); px(x, '#581010', 6, 6);
  return outline(c);
}
