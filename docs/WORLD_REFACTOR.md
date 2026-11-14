# Blueprint Refactor Desain Dunia — Benua Lumina
Status: **USULAN, menunggu persetujuan pemilik.** Belum ada perubahan peta. Dasar: saran "World Design Refactor" pemilik (dunia fantasi yang
masuk akal, bukan diagram). Pratinjau sebelum (kiri) | sesudah (kanan): `assets/reference/wref_cmp_barat.png`, `wref_cmp_timur.png`
(prototipe disuntik saat tes, bukan kode game).

## 1. Diagnosis (diukur dari data peta, 20 wilayah luar ruang)
| Masalah | Angka | Contoh |
|---|---|---|
| Lapangan bundar (`discs`) di hampir tiap titik | **74** | Hutan 11, Padang 9, Distrik Pasar 8, Hutan Dalam 7, Puncak Beku 6, Rawa 6 |
| Ruas jalan lurus sejajar sumbu (horizontal/vertikal sempurna) | **82 dari 142** | Desa 19/20, Kota Bawah 7/7, semua peralihan 3/3 |
| Jalan memancar dari satu titik (pola diagram) | Puncak Beku (bentuk "pohon"), Hutan Dalam, Rawa (cincin) | |
| Jalan peralihan berbentuk huruf L kaku | 7 dari 7 wilayah peralihan | `buildPeralihan` di `src/world/layout.js` |
| Tepi hutan = baris pohon rapi | semua wilayah ber-`border` | `borderTrees` di `src/world/ground.js` |
| Pohon tersebar rata (jarak minimum sama) | semua `trees` | `scatter` di `src/world/ground.js` |
Sudah beres sebelum blueprint ini: sungai menyambung & berliku, danau bertepi asimetris (`src/world/water.js`, v1.33–1.34).

## 2. Prinsip yang dipakai (dari saran pemilik, disesuaikan ke mesin game)
1. **Bentuk diubah lewat cara MENGGAMBAR, bukan memindah lokasi.** Data `paths`/`discs` tetap; mesin membelokkan & mengacak tepinya secara deterministik.
   Titik ujung jalan (pintu, gerbang, NPC, misi) TIDAK bergeser → konektivitas & misi aman.
2. **Kota direncanakan, alam tidak.** Jalan batu (`path: 'stone'`) di Akademi & Gerbang Kota tetap lurus (kampus/benteng = direncanakan).
   Kota Bawah & Distrik Pasar: jalan utama tetap, gang dibuat berliku (sesuai GEOGRAFI §7 abad pertengahan). Jalan tanah di alam: selalu berliku.
3. **Lapangan bundar hanya bila beralasan secara arsitektur** (alun-alun kota, arena boss, lingkar batu ritual). Sisanya: tepi tak beraturan & lebih kecil.
4. **Hierarki 3 tingkat:** penanda besar (kota, kastil, dungeon besar) → penanda sedang (desa, kemah, reruntuhan) → detail (batu, semak, bunga).

## 3. Perubahan mesin (bertahap, tiap tahap bisa dicek & dibatalkan)
| Tahap | Isi | File | Risiko |
|---|---|---|---|
| A. Jalan berliku | ruas jalan TANAH > 120 px dipecah tiap ±60 px & dibelokkan (amplitudo ≤ 9% panjang, maks 46 px, ujung tetap); lebar ±15% | `makeSD` di `ground.js` (+ file baru `world/organic.js`) | objek buatan tangan yang menempel jalan bisa tertimpa → dicek `check-layout` |
| B. Tepi tak beraturan | tepi jalan & lapangan diberi noise ±5 px; lapangan non-arsitektur diperkecil ke 70% | sama | rendah |
| C. Jalan peralihan | huruf L → kurva S lembut antara dua pintu | `buildPeralihan` di `layout.js` | rendah |
| D. Tepi hutan alami | baris `borderTrees` → kedalaman acak 1–4 pohon + teluk & tanjung dari noise | `borderTrees` | tabrakan tepi peta tetap dari `walls` |
| E. Vegetasi berkelompok | `scatter`: peluang pohon dikalikan masker noise (rumpun rapat + padang terbuka), jumlah total sama | `scatter` | kinerja sama |
| F. Data per wilayah | buang/ubah lapangan tanpa alasan, ganti pola memancar (Puncak Beku, Hutan Dalam, Rawa) jadi jalur utama + cabang | `maps/*.js` | perlu cek misi & NPC |

## 4. Rencana per wilayah (tahap F)
| Wilayah | Identitas (tetap) | Ubah |
|---|---|---|
| Desa Lumina | desa tani, alun-alun sumur | jalan batu dalam desa tetap; jalan keluar desa jadi tanah berliku; 19 ruas sejajar sumbu → sisakan jalan utama |
| Hutan Lumina | hutan lebat, sungai | 11 lapangan → 4 (yang ada objek/misi); sisanya tepi acak kecil |
| Padang Angin | padang terbuka, Desa Kincir | 9 lapangan → kincir & kemah saja; jalan panjang lurus ke timur → berliku mengikuti tepi sungai |
| Puncak Beku | gunung salju | pola "pohon" memancar → satu jalan zig-zag naik lereng + 2 cabang buntu ke gua/puncak |
| Hutan Dalam | hutan tua, Reruntuhan | 7 lapangan & jaringan memancar → jalur utama berliku + reruntuhan dengan jejak bangunan (bukan lingkaran) |
| Rawa Senja | rawa, delta | cincin jalan → jalan papan (boardwalk) berliku di antara kolam |
| Distrik Akademi, Gerbang Kota | kampus & benteng direncanakan | TETAP lurus/simetris (beralasan arsitektur) |
| Distrik Pasar, Kota Bawah | kota abad pertengahan | jalan utama tetap; gang berliku; alun-alun pasar baji (lihat TASKS_AGENT gelombang 10) |
| Danau Cermin, Jalur Sungai Senja, Jalan Raya Lama | danau, sungai, jalan antarkota | jalan mengikuti tepi air / kontur; jembatan otomatis sudah ada |

## 5. Yang TIDAK diubah
Ukuran peta & batas main · posisi kota/desa/dungeon/NPC/pintu · aset gambar (tanpa persetujuan) · identitas tiap wilayah · tata kota Akademi & Gerbang.

## 6. Kriteria terima
Dari Peta Benua (tombol PETA → Peta Benua) dunia terlihat seperti daratan fantasi yang bisa dijelajah: tidak ada pola lingkaran berulang,
tidak ada jaringan memancar simetris, jalan alam tidak lurus sejajar sumbu, tepi hutan tidak lurus. `npm run check` 0 masalah,
`check-layout` tanpa masalah baru, semua pintu & misi tetap tercapai (tes `openworld`, `bab*`).
