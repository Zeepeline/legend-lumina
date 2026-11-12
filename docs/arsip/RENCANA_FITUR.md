# 100 Rencana Fitur (di luar cerita)

**Prioritas:** P1 = paling terasa bagi pemain, P2 = penting, P3 = pelengkap.
**Ukuran:** K = kecil (≤ 1 sesi), S = sedang, B = besar.
Fitur yang sudah ada di game tidak dimasukkan. Saat mengerjakan, tetap patuhi `docs/PLACEMENT_RULES.md`, `docs/NPC_RULES.md`, dan `docs/WORLD_DESIGN.md`.

---

## A. Pertarungan (1–15)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 1 | Ancang-ancang serangan musuh | Kilatan atau tanda "!" sebelum musuh menyerang, supaya menghindar terasa adil | P1 | S |
| 2 | Kombo pedang 3 pukulan | Ketuk SERANG beruntun, pukulan ke-3 lebih kuat dan mendorong musuh | P1 | S |
| 3 | Menangkis (parry) | Tekan tepat sebelum kena pukul: musuh goyah, serangan balik kritis | P2 | S |
| 4 | Musuh elit | Versi bercahaya dengan pola serangan tambahan dan hadiah langka, jarang muncul | P1 | S |
| 5 | Kelemahan elemen | Musuh es lemah api, musuh api lemah es; angka kerusakan berwarna | P2 | K |
| 6 | Kunci target | Ketuk musuh untuk mengunci bidikan sihir dan panah | P2 | S |
| 7 | Serangan udara musuh terbang | Kelelawar menukik dengan pola, bukan sekadar mengejar | P3 | K |
| 8 | Musuh berkelompok | Serigala mengepung dari dua sisi, goblin pemanah berdiri di belakang | P2 | S |
| 9 | Pemanggilan bantuan musuh | Goblin meniup terompet memanggil teman bila dibiarkan | P3 | K |
| 10 | Rintangan medan tempur | Duri, lumpur yang memperlambat, tong yang bisa meledak | P2 | S |
| 11 | Pertarungan arena | Gelombang musuh bertahap di Kota Lumina dengan peringkat dan hadiah | P2 | B |
| 12 | Boss ulangan (rematch) | Lawan lagi boss lama versi lebih sulit di kuil khusus | P3 | S |
| 13 | Pukulan kritis dari belakang | Serangan dari punggung musuh selalu kritis (gaya mengendap) | P3 | K |
| 14 | Penanda bahaya di layar | Garis merah di tepi layar saat diserang dari luar layar | P2 | K |
| 15 | Mode tingkat kesulitan | Santai / Normal / Sulit; bisa diganti kapan saja di Pengaturan | P1 | K |

## B. Karakter & Pertumbuhan (16–25)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 16 | Poin atribut | Tiap naik level dapat 3 poin untuk Kekuatan / Sihir / Ketahanan / Kelincahan | P1 | S |
| 17 | Pohon bakat | Cabang Pedang, Sihir, Penjelajah dengan bakat pasif | P2 | B |
| 18 | Gelar | Gelar dari pencapaian, misalnya "Pemburu Serigala" dengan bonus kecil | P3 | K |
| 19 | Stamina | Lari dan dash memakai stamina; makanan memulihkannya | P3 | S |
| 20 | Kemampuan jelajah | Memanjat tanaman rambat, berenang di air dangkal, mendorong batu besar (membuka area lama) | P1 | B |
| 21 | Kostum & warna baju | Ubah penampilan Arka tanpa mengubah statistik | P3 | S |
| 22 | Set perlengkapan | Memakai 3 bagian satu set memberi bonus khusus | P2 | S |
| 23 | Batu permata | Sisipkan permata di senjata: api, es, racun, pencuri HP | P2 | S |
| 24 | Ketahanan senjata | Senjata bisa aus, diperbaiki di Pak Besi (bisa dimatikan di Pengaturan) | P3 | K |
| 25 | Statistik pemain | Halaman total musuh dikalahkan, langkah, ikan, waktu main | P3 | K |

## C. Peralatan, Item & Kerajinan (26–37)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 26 | Meja kerajinan | Buat ramuan, panah, umpan, dan bom dari bahan alam | P1 | S |
| 27 | Alkimia | Campur 2–3 herba jadi ramuan dengan efek acak yang dicatat di buku resep | P2 | S |
| 28 | Buku resep | Resep ditemukan dari NPC, peti, dan buku; tercatat di menu | P2 | K |
| 29 | Bom & alat lempar | Bom api, bom asap, jaring, dipasang di slot alat | P2 | S |
| 30 | Slot alat cepat | 2 tombol alat (bom, ramuan) yang bisa dipilih sendiri | P1 | S |
| 31 | Kantong & batas tas | Tas punya kapasitas; beli kantong lebih besar (bisa dimatikan) | P3 | K |
| 32 | Peti penyimpanan rumah | Simpan barang di rumah Arka | P2 | K |
| 33 | Senjata legendaris | 5 senjata unik tersembunyi di dunia dengan efek khusus | P2 | S |
| 34 | Perbandingan perlengkapan | Panah ↑↓ hijau/merah saat memilih senjata atau baju | P1 | K |
| 35 | Urutkan & saring tas | Urut berdasarkan jenis, nilai, atau baru | P2 | K |
| 36 | Jual cepat barang sampah | Tombol jual semua barang tidak berguna | P3 | K |
| 37 | Penilaian kelangkaan | Warna nama item: biasa, langka, epik, legendaris | P2 | K |

## D. Ekonomi & Perdagangan (38–45)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 38 | Harga dinamis | Harga berbeda tiap kota dan berubah mingguan | P3 | S |
| 39 | Pedagang keliling berjadwal | Muncul di peta berbeda tiap hari dengan barang langka | P2 | K |
| 40 | Lelang | Tawar-menawar barang langka di Kota Lumina | P3 | S |
| 41 | Toko pemain | Sewa lapak di pasar, jual hasil panen dan kerajinan otomatis | P3 | B |
| 42 | Bank & bunga | Simpan koin, dapat bunga kecil | P3 | K |
| 43 | Barter dengan NPC | Tukar barang langsung tanpa koin | P3 | K |
| 44 | Diskon langganan | Sering belanja di satu toko memberi diskon | P3 | K |
| 45 | Papan permintaan barang | NPC meminta barang tertentu dengan imbalan berbeda tiap hari | P2 | S |

## E. Kehidupan & Aktivitas Santai (46–60)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 46 | Rumah Arka | Rumah pribadi yang bisa ditata perabotnya | P1 | B |
| 47 | Peternakan | Pelihara ayam, sapi, domba; hasil telur, susu, wol harian | P2 | B |
| 48 | Kebun lebih luas | Banyak petak, jenis benih musiman, penyiram otomatis | P2 | S |
| 49 | Musim | Semi/panas/gugur/dingin mengubah warna dunia, tanaman, ikan, dan monster | P2 | B |
| 50 | Memasak lebih dalam | Mini-game memasak (aduk, waktu angkat) dengan kualitas bintang | P3 | S |
| 51 | Memancing lebih dalam | Mini-game tarik-ulur, jenis ikan per lokasi dan jam, ikan raksasa | P2 | S |
| 52 | Menambang | Titik tambang di gua: bijih, permata, fosil | P2 | S |
| 53 | Menebang & kayu | Kayu untuk kerajinan dan perbaikan jembatan | P3 | S |
| 54 | Menangkap serangga lebih lengkap | Koleksi serangga dengan album | P3 | K |
| 55 | Album foto | Mode foto: ambil gambar pemandangan, simpan ke galeri | P2 | S |
| 56 | Mancing di laut | Perahu kecil di danau atau laut dengan ikan berbeda | P3 | S |
| 57 | Menunggang kuda | Sewa kuda di Kota Lumina, lebih cepat di jalan raya | P2 | B |
| 58 | Peliharaan tambahan | Anjing pelacak harta, burung pembawa barang | P3 | S |
| 59 | Festival bulanan | Acara kota berganti: panen, lentera, lomba lari | P2 | S |
| 60 | Mini-game kartu | Permainan kartu koleksi melawan NPC | P3 | B |

## F. Eksplorasi & Dunia (61–72)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 61 | Kabut peta | Peta terbuka bertahap sesuai area yang dilalui | P1 | S |
| 62 | Penanda pribadi di peta | Pemain menaruh ikon sendiri di peta | P2 | K |
| 63 | Rahasia tersembunyi | Dinding retak, semak yang bisa dibakar, jalan tersembunyi berhadiah | P1 | S |
| 64 | Gua acak (dungeon) | Gua bertingkat dengan tata letak berubah tiap masuk | P2 | B |
| 65 | Teka-teki lingkungan | Cermin cahaya, tombol berat, aliran air | P2 | S |
| 66 | Peta harta karun | Peta sobek menunjuk lokasi harta | P2 | K |
| 67 | Titik pemandangan | Tempat tinggi yang membuka peta sekitar plus pemandangan indah | P3 | K |
| 68 | Cuaca berbahaya | Badai petir, salju tebal yang memperlambat, kabut tebal | P3 | S |
| 69 | Siang-malam memengaruhi musuh | Monster berbeda muncul di malam hari, lebih kuat, hadiah lebih baik | P2 | K |
| 70 | Jembatan & jalan pintas | Perbaiki jembatan rusak untuk membuka jalan pintas | P2 | S |
| 71 | Ensiklopedia dunia | Catatan tumbuhan, hewan, lokasi yang terisi saat dijumpai | P3 | S |
| 72 | Kompas & jam di HUD | Petunjuk arah utara dan jam yang lebih jelas | P3 | K |

## G. Antarmuka & Kenyamanan (73–85)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 73 | Tutorial singkat | Petunjuk interaktif di 5 menit pertama (gerak, serang, bicara, tas) | P1 | S |
| 74 | Tata letak tombol bisa diatur | Geser dan ubah ukuran tombol layar | P1 | S |
| 75 | Kecepatan teks & lewati dialog | Atur kecepatan, tahan untuk mempercepat | P1 | K |
| 76 | Ukuran huruf | Huruf kecil / sedang / besar | P2 | K |
| 77 | Mode buta warna | Palet aman untuk angka kerusakan dan penanda | P3 | K |
| 78 | Getar & suara per kategori | Atur volume musik, efek, suara alam terpisah | P2 | K |
| 79 | Slot simpan ganda | 3 slot simpan + simpan manual di mana saja | P1 | S |
| 80 | Simpan ke awan | Sinkron save lewat akun (Google/GitHub) | P3 | B |
| 81 | Notifikasi kecil | Pesan item didapat bertumpuk rapi di pojok | P2 | K |
| 82 | Peta mini | Peta kecil di pojok layar (bisa disembunyikan) | P1 | S |
| 83 | Mode landscape lebih baik | Tata letak khusus layar mendatar dan tablet | P2 | S |
| 84 | Pencarian di menu | Cari item, resep, monster | P3 | K |
| 85 | Bahasa Inggris | Pilihan bahasa untuk pemain luar | P3 | B |

## H. Audio & Visual (86–93)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 86 | Musik per wilayah | Lagu khas tiap wilayah (salju, rawa, kota, arsip) | P1 | S |
| 87 | Musik dinamis | Musik berubah saat bertarung, malam, dan di dekat boss | P2 | S |
| 88 | Langkah kaki sesuai tanah | Bunyi rumput, batu, salju, kayu berbeda | P3 | K |
| 89 | Animasi serang & terkena pukul | Frame khusus Arka saat menyerang, terluka, jatuh | P1 | S |
| 90 | Air beranimasi | Riak dan kilau bergerak di kolam serta sungai | P2 | S |
| 91 | Rumput bergoyang | Rumput tinggi bergoyang saat dilewati | P3 | K |
| 92 | Lampu dinamis | Obor dan lentera berkedip, bayangan pemain dari lampu | P3 | S |
| 93 | Efek layar opsional | Filter hangat, vinyet, butir film (bisa dimatikan) | P3 | K |

## I. Sosial, Teknis & Lainnya (94–100)

| # | Fitur | Isi | Prio | Ukuran |
|---|---|---|---|---|
| 94 | Pencapaian lebih banyak | 50+ pencapaian dengan hadiah kosmetik | P2 | K |
| 95 | Papan skor lokal | Rekor arena, mancing, dan lomba | P3 | K |
| 96 | Tantangan harian | 3 tugas kecil berganti tiap hari | P2 | S |
| 97 | New Game+ | Main ulang dengan level dan perlengkapan terbawa, musuh lebih kuat | P2 | S |
| 98 | Mode pengembang | Menu debug tersembunyi untuk menguji (teleport, beri item) | P2 | K |
| 99 | Optimasi HP kelas bawah | Mode hemat baterai: partikel dan bayangan dikurangi | P1 | S |
| 100 | Bagikan tangkapan layar | Tombol simpan gambar layar langsung ke galeri HP | P3 | K |

---

## Usulan urutan pengerjaan (P1 dulu)

1. **Kenyamanan dasar:** 73 Tutorial, 75 Kecepatan teks, 79 Slot simpan ganda, 82 Peta mini, 74 Tombol bisa diatur, 15 Tingkat kesulitan, 34 Perbandingan perlengkapan.
2. **Rasa bertarung:** 1 Ancang-ancang, 2 Kombo, 4 Musuh elit, 89 Animasi serang, 86 Musik per wilayah.
3. **Pertumbuhan & jelajah:** 16 Poin atribut, 26 Meja kerajinan, 30 Slot alat, 61 Kabut peta, 63 Rahasia, 20 Kemampuan jelajah.
4. **Kehidupan:** 46 Rumah Arka, 99 Optimasi HP, lalu P2 sesuai minat pemilik.
