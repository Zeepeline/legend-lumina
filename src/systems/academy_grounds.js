'use strict';
// HALAMAN AKADEMI — aset dari lembar gambar pemilik (latar ungu dibersihkan, diperkecil sama dengan gambar Akademi):
// pagar besi berpilar, gerbang lengkung, tiang lentera, bangku, papan pengumuman, patung, air mancur, boneka latihan,
// sasaran panah, rak senjata, peti/tong, pot tanaman, tembok batu berlumut, rumah kaca (Taman Akademi). File: assets/img/buildings/sp_b_acad_<nama>.png,
// tekstur 'acad_<nama>' dipasang lewat REF_HOUSES.tex (ref_houses.js). Objek OBJ: acad<nama> (world/objects.js).
const ACAD_ART = ['fence', 'post', 'gate', 'lamp', 'bench', 'board', 'statue', 'fountain', 'dummy', 'target', 'rack',
  'crates', 'crates2', 'pottree', 'topiary', 'cypress', 'wall', 'greenhouse', 'dorm'].map(n => 'acad_' + n);
REF_HOUSES.tex.push(...ACAD_ART);
IMG_LIST.push(...ACAD_ART.map(k => 'sp_b_' + k));
// Gerbang Kota (gambar pemilik): gapura dua menara + tembok kota panjang kiri/kanan (dirangkai dari gambar tembok)
REF_HOUSES.tex.push('gatehouse', 'citywall_l', 'citywall_r');
IMG_LIST.push('sp_b_gatehouse', 'sp_b_citywall_l', 'sp_b_citywall_r');
