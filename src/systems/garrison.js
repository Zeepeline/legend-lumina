'use strict';
// GARNISUN KOTA — aset dari gambar pemilik (latar kotak-kotak palsu dibersihkan: kantong latar yang memperlihatkan
// kotak putih dihapus, bilah senjata abu polos dipertahankan). Barak, Markas Pengawal (menara lonceng), Kandang Kuda,
// dan perlengkapan lapangan latihan. File: assets/img/buildings/sp_b_gar_<nama>.png; objek OBJ: gar<nama> (world/objects.js).
// Letak: kgate x 40–720 (peta dilebarkan ke barat), bangunan melingkari lapangan latihan di sebelah ujung tembok kota.
const GAR_ART = ['barracks', 'barracks2', 'hall', 'stable', 'dummy', 'target', 'target2', 'target3', 'pen', 'rack', 'shields', 'bag', 'supply',
  'barricade', 'hayrack'].map(n => 'gar_' + n);
REF_HOUSES.tex.push(...GAR_ART);
IMG_LIST.push(...GAR_ART.map(k => 'sp_b_' + k));
