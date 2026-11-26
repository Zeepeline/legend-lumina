# NPC_ROSTER — Daftar NPC Kota & Desa + Spesifikasi Sprite Sheet

Dokumen ini untuk **agent pembuat sprite sheet**. Isinya:
1. format lembar,
2. pustaka animasi frame demi frame,
3. daftar setiap NPC: penampilan, lokasi, jadwal, dan baris animasi yang wajib digambar.

Kode yang memakainya:
- `src/npc/life_roles.js`: peran & kegiatan
- `src/npc/life_plan.js`: jadwal & tempat kerja
- `src/npc/life_duos.js`: interaksi antar-NPC
- `src/npc/life_sheet.js`: pemasang lembar
- `src/world/maps/cast.js`: daftar pemeran

Saat ini semua NPC di bawah memakai **sprite pengganti** (karakter lama yang dipakai ulang), dan gerak kerjanya disimulasikan kode (dorong, angguk, ikon, partikel). Begitu lembar aslinya dipasang, game otomatis memakai frame asli.

---

## 0. Cara kerja singkat (wajib dibaca agent)

1. **Satu NPC = satu file PNG:** `assets/img/npc/npc_sheet_<id>.png`. `<id>` adalah kolom **ID** di daftar bagian 4, misalnya `npc_sheet_gk2.png`.
2. **Ukuran frame 48×48 piksel, 8 kolom.** Tinggi lembar = jumlah baris × 48. Frame yang tidak dipakai di ujung baris dibiarkan **transparan penuh**; game memotongnya otomatis.
3. **Baris 0–4 selalu sama untuk semua NPC** (jalan 3 arah, diam/napas, bicara). **Baris 5 dan seterusnya** = animasi kegiatan, berurutan persis seperti kolom "Baris kegiatan" milik NPC itu.
4. **Pemasangan:** tambahkan satu baris di `NPC_SHEETS` dalam `src/npc/life_sheet.js`, misalnya `gk2: ['train', 'salute', 'spar_attack', 'spar_block'],`. Isinya nama animasi baris 5, 6, 7, … sesuai urutan di lembar.
5. Jalankan `python3 tools/bundle.py && npm run check`, lalu buka game dan lihat NPC-nya.

### Aturan gambar (agar senada dengan aset pemilik)
- **Gaya:** pixel art 16-bit, sudut pandang 3/4 dari atas (seperti bangunan Garnisun & kios Pasar Raya), garis luar gelap 1 px (cokelat tua/hitam kecokelatan, bukan hitam murni), bayangan berarsir 2–3 tingkat, palet hangat "Senja Emas" (lihat `docs/ART_BIBLE.md`).
- **Ukuran tokoh:**
  - Dewasa: tinggi ±30–32 px dari ubun-ubun sampai telapak.
  - Anak: ±24 px.
  - Lansia: ±28 px dan agak bungkuk.
  - Tokoh berdiri di **tengah frame (x = 24)** dan **telapak kaki menyentuh baris piksel paling bawah (y = 47)**. Ruang kosong di atas dan samping dipakai untuk senjata, alat, dan gerak.
- **Latar transparan asli** (alpha 0). Jangan latar kotak-kotak, jangan bayangan di tanah (game menambah bayangan sendiri), jangan teks.
- **Identitas konsisten** di semua frame: warna rambut, pakaian, aksesoris, dan proporsi sama persis. Jangan menambah warna di luar palet tokoh itu.
- **Arah:** baris samping digambar **menghadap KANAN**; game mencerminkan sendiri untuk kiri. Arah animasi kegiatan mengikuti kolom "Arah" di pustaka (bagian 3).
- **Gerak:** pakai *squash & stretch* kecil (±1 px), langkah kaki jelas, dan perpindahan berat badan. Animasi harus terbaca di ukuran kecil, jadi hindari detail di bawah 1 px.

---

## 1. Format lembar

| Baris | Nama | Frame | Arah | fps | Ulang |
|---|---|---|---|---|---|
| 0 | `walk_down` | 4 | bawah (menghadap kamera) | 8 | ya |
| 1 | `walk_up` | 4 | atas (punggung) | 8 | ya |
| 2 | `walk_side` | 4 | kanan | 8 | ya |
| 3 | `idle` | 6 (2 bawah, 2 samping, 2 atas) | campuran | — | ditukar game tiap 2,6 dtk |
| 4 | `talk` | 4 | bawah | 6 | 2× |
| 5+ | kegiatan (lihat NPC) | ≤ 8 | lihat pustaka | lihat pustaka | sekali per pemicu |

---

## 2. Baris tetap (semua NPC)

### Baris 0 — `walk_down` (4 frame, 8 fps)
- **F0 (kontak kiri):** kaki kiri maju (telapak kiri 1 px lebih rendah dari kanan), kaki kanan di belakang. Lengan kanan berayun ke depan dan lengan kiri ke belakang. Badan di posisi dasar.
- **F1 (lintas):** kedua kaki hampir sejajar, kaki kanan sedang terangkat 1 px. Lengan di sisi badan. **Badan & kepala naik 1 px.**
- **F2 (kontak kanan):** cermin F0: kaki kanan maju, lengan kiri ke depan. Badan di posisi dasar.
- **F3 (lintas):** cermin F1: kaki kiri terangkat 1 px, badan naik 1 px.
- Alat atau senjata yang dibawa (tombak, sapu, kecapi) ikut bergoyang 1 px berlawanan dengan langkah.

### Baris 1 — `walk_up` (4 frame, 8 fps)
Urutan sama dengan baris 0, tetapi tokoh membelakangi kamera. Rambut dan bagian belakang pakaian (tudung, jubah, tas) terlihat. Ayunan lengan tampak dari belakang, tumit terlihat saat kaki terangkat.

### Baris 2 — `walk_side` (4 frame, 8 fps, menghadap kanan)
- **F0:** kaki depan (kanan) menjejak jauh ke depan, kaki belakang lurus di belakang. Lengan dekat kamera berayun ke belakang.
- **F1:** kaki belakang melintas dan terangkat setinggi lutut. Badan naik 1 px.
- **F2:** kaki kiri menjejak di depan, kaki kanan di belakang. Lengan dekat kamera berayun ke depan.
- **F3:** kaki kanan melintas dan terangkat. Badan naik 1 px.

### Baris 3 — `idle` (6 frame; game memakai kolom 0/1, 2/3, 4/5 sesuai arah)
- **Kol 0 (diam bawah):** berdiri santai menghadap kamera, berat badan di satu kaki, lengan rileks.
- **Kol 1 (napas bawah):** dada dan bahu naik 1 px, kepala naik 1 px. Mata boleh berkedip (kelopak 1 px).
- **Kol 2 (diam samping):** profil kanan, posisi santai.
- **Kol 3 (napas samping):** bahu naik 1 px.
- **Kol 4 (diam atas):** membelakangi kamera.
- **Kol 5 (napas atas):** bahu naik 1 px.

### Baris 4 — `talk` (4 frame, 6 fps, menghadap bawah)
- **F0:** mulut tertutup, tangan di sisi badan.
- **F1:** mulut terbuka 1 px, kepala mengangguk turun 1 px.
- **F2:** tangan kanan terangkat setinggi dada dengan telapak terbuka (gestur menjelaskan).
- **F3:** mulut terbuka, tangan mulai turun, kepala kembali tegak.

Dipakai saat dialog dengan pemain dan setiap kali NPC berbicara dalam adegan antar-NPC.

---

## 3. Pustaka animasi kegiatan (baris 5+)

Kolom **Arah**:
- `samping`: menghadap kanan; game mencerminkan untuk kiri.
- `atas`: membelakangi kamera, menghadap benda.
- `bawah`: menghadap kamera.

Semua animasi diputar **sekali** setiap kali dipicu (jedanya ±0,6–3 dtk), lalu tokoh kembali ke frame diam. Karena itu, **frame terakhir harus mendekati pose diam.**

### Militer
**`train` — memukul boneka latihan** · 6 frame · samping · 10 fps
- F0: kuda-kuda: kaki terbuka selebar bahu, lutut ditekuk, senjata (tombak/pedang kayu) dipegang dua tangan di depan dada.
- F1: ancang-ancang: badan memutar ke belakang, senjata ditarik ke belakang bahu kanan, berat di kaki belakang.
- F2: langkah maju setengah, senjata mulai mengayun mendatar, ada garis gerak tipis di belakang ujung senjata.
- F3: **hantaman**: lengan lurus ke depan, ujung senjata 6–8 px di depan badan (mengenai boneka), badan condong ke depan, rambut/jubah tersentak ke belakang.
- F4: pantulan: senjata terpental sedikit ke atas, badan mulai tegak.
- F5: kembali ke kuda-kuda F0 dengan napas (bahu naik 1 px).

**`spar_attack` — menyerang lawan tanding** · 5 frame · samping · 12 fps
- F0: kuda-kuda tanding, senjata latihan di depan.
- F1: maju selangkah, senjata diangkat tinggi di atas kepala.
- F2: tebasan turun diagonal, ujung senjata di depan badan setinggi pinggang.
- F3: tahan sebentar dengan badan condong maju dan kaki depan menekuk dalam.
- F4: mundur ke kuda-kuda.

**`spar_block` — menangkis** · 4 frame · samping · 8 fps
- F0: kuda-kuda.
- F1: senjata diangkat melintang di depan wajah (atau perisai diangkat).
- F2: terdorong mundur 1–2 px, ada percikan kecil (2–3 piksel kuning) di titik benturan, mata menyipit.
- F3: kembali ke kuda-kuda.

**`salute` — memberi hormat** · 4 frame · samping · 6 fps
- F0: berdiri tegap, tumit rapat, senjata tegak di sisi.
- F1: tangan kanan naik ke dahi (atau kepalan ke dada untuk prajurit bertombak).
- F2: tahan: dagu terangkat, dada membusung 1 px.
- F3: tangan turun kembali ke sisi.

**`shoot` — memanah sasaran** · 7 frame · atas (punggung, membidik ke utara) · 8 fps
- F0: berdiri menyamping ke sasaran, busur di tangan kiri menunjuk ke bawah.
- F1: mengambil anak panah dari tabung di punggung (tangan kanan ke bahu).
- F2: memasang anak panah, busur terangkat setinggi dada.
- F3: menarik tali: siku kanan ke belakang setinggi telinga, busur melengkung jelas.
- F4: tahan bidikan, bahu tegang.
- F5: **lepas**: tali kembali lurus, tangan kanan terbuka ke belakang, ada garis kecil di depan busur (anak panah melesat; game menambah panah terbang).
- F6: busur turun, kembali ke posisi F0.

**`inspect` — kapten memeriksa barisan** · 5 frame · samping · 6 fps
- F0: berdiri tegap, tangan bertaut di punggung.
- F1: mencondongkan badan sedikit, mengamati.
- F2: tangan kanan menunjuk ke depan (memberi koreksi).
- F3: mengepalkan tangan di depan dada (menyemangati).
- F4: kembali bertaut tangan di punggung.

### Kandang & bayaran
**`groom` — menyikat kuda / mengaduk jerami** · 6 frame · samping · 6 fps
- F0: berdiri memegang sikat kuda (atau garpu jerami) di depan badan.
- F1: lengan menjulur ke depan setinggi bahu dan menyikat ke kanan.
- F2: sikat bergerak ke kiri, ada serpihan debu/bulu kecil.
- F3: membungkuk, menyikat lebih rendah (kaki kuda).
- F4: tegak lagi dan mengusap keringat di dahi dengan punggung tangan.
- F5: kembali ke F0.

**`sharpen` — mengasah pedang** · 6 frame · bawah · 8 fps
- F0: setengah jongkok, pedang di pangkuan, batu asah di tangan kanan.
- F1: batu asah di pangkal bilah.
- F2: batu bergeser ke tengah bilah, ada 2 percikan putih.
- F3: batu sampai di ujung bilah, ada 1 percikan.
- F4: mengangkat pedang setinggi mata, memeriksa ketajaman (kilau 1 px di bilah).
- F5: kembali ke F0.

### Pasar
**`arrange` — menata dagangan di kios** · 6 frame · bawah · 6 fps
- F0: berdiri di depan kios, kedua tangan memegang barang khas kiosnya (botol ramuan, roti, pedang, gulungan, sayur).
- F1: membungkuk sedikit, meletakkan barang di meja (setinggi pinggang).
- F2: tangan merapikan barang ke kiri.
- F3: tangan merapikan ke kanan.
- F4: tegak sambil mengusap tangan di celemek.
- F5: tersenyum menghadap kamera (siap melayani).

**`call` — berseru menawarkan dagangan** · 4 frame · bawah · 6 fps
- F0: tangan kanan di sisi mulut (corong).
- F1: mulut terbuka lebar, badan condong ke depan 1 px.
- F2: tangan kiri mengangkat contoh barang tinggi-tinggi.
- F3: kembali tegak dan tersenyum.

**`give` — menyerahkan barang / paket** · 4 frame · samping · 6 fps
- F0: memegang barang (bungkusan kertas, botol, paket) di depan dada.
- F1: lengan menjulur ke depan, barang di ujung tangan.
- F2: tangan terbuka, barang sudah berpindah (tidak terlihat lagi).
- F3: tangan kembali, mengangguk sopan.

**`pay` — membayar dengan koin** · 4 frame · samping · 6 fps
- F0: merogoh kantong kecil di pinggang.
- F1: mengeluarkan koin emas (2×2 px berkilau).
- F2: tangan menjulur menyerahkan koin.
- F3: menerima bungkusan, memeluknya di dada, tersenyum.

**`refuse` — menolak tawaran** · 4 frame · samping · 6 fps
- F0: tangan terlipat di dada.
- F1: kepala menggeleng ke kiri.
- F2: kepala menggeleng ke kanan.
- F3: berbalik setengah, bahu terangkat (kesal ringan).

**`browse` — melihat-lihat barang** · 5 frame · atas · 4 fps
- F0: berdiri membelakangi kamera menghadap kios.
- F1: kepala menoleh ke kiri (melihat barang di sisi kiri).
- F2: kepala menoleh ke kanan.
- F3: tangan kanan terulur menyentuh barang di meja.
- F4: tangan ditarik, menimbang-nimbang (dagu disentuh).

### Hiburan & keramaian
**`play` — memainkan alat musik** · 6 frame · bawah · 6 fps (alat musik sesuai NPC)
- F0: memeluk alat (kecapi di pangkuan / seruling di bibir / rebab), kaki mengetuk.
- F1: jari kanan memetik ke bawah (kecapi) atau jari menutup lubang (seruling); badan bergoyang ke kiri 1 px.
- F2: petikan ke atas, kepala sedikit miring.
- F3: badan bergoyang ke kanan 1 px, mata terpejam menikmati.
- F4: petikan kuat, ada not musik kecil (opsional, 3×3 px) di atas alat.
- F5: kembali ke F0.

**`drum` — menabuh gendang** · 6 frame · bawah · 10 fps
- F0: gendang di depan (dikalungkan atau di tanah), dua tangan terangkat.
- F1: tangan kiri memukul (tangan menyentuh kulit gendang, kulit melesak 1 px).
- F2: tangan kiri naik, tangan kanan turun.
- F3: tangan kanan memukul.
- F4: kedua tangan memukul bersamaan (aksen), badan merendah 1 px.
- F5: kedua tangan terangkat lagi, tersenyum lebar.

**`announce` — juru warta membacakan maklumat** · 6 frame · bawah · 6 fps
- F0: memegang gulungan tertutup di tangan kanan.
- F1: membuka gulungan dengan dua tangan, gulungan menjuntai ke bawah.
- F2: membaca: mulut terbuka, kepala menunduk ke gulungan.
- F3: kepala terangkat, tangan kiri menunjuk ke depan (berseru ke warga).
- F4: membaca lagi (sama dengan F2, mulut berbeda).
- F5: menggulung kembali.

**`clap` — penonton bertepuk tangan** · 4 frame · samping · 8 fps
- F0: telapak tangan terpisah setinggi dada.
- F1: telapak bertemu (tepuk).
- F2: terpisah.
- F3: bertemu dengan senyum lebar.

**`laugh` — tertawa** · 4 frame · samping · 8 fps
- F0: memegang perut.
- F1: kepala mendongak, mulut terbuka lebar.
- F2: badan membungkuk ke depan 1 px.
- F3: mengusap mata (air mata tawa 1 px), tegak kembali.

**`cheers` — bersulang** · 4 frame · bawah · 6 fps
- F0: duduk atau berdiri dengan cangkir kayu di tangan.
- F1: cangkir diangkat tinggi.
- F2: cangkir "bertemu" ke arah samping dengan cipratan busa 2 px.
- F3: meminum, kepala mendongak.

**`drink` — makan/minum di penginapan** · 5 frame · bawah · 4 fps
- F0: duduk (pantat di tepi frame bawah, lutut ditekuk), cangkir di meja imajiner setinggi pinggang.
- F1: mengangkat cangkir ke mulut.
- F2: minum, kepala mendongak sedikit.
- F3: menurunkan cangkir, menyeka mulut.
- F4: menghela napas puas, bahu turun.

### Ibadah, balai & akademi
**`pray` — berdoa di kuil** · 5 frame · atas · 4 fps
- F0: berdiri menghadap kuil, kedua tangan di sisi.
- F1: berlutut dengan satu lutut.
- F2: kedua tangan dikatupkan di depan dada, kepala menunduk.
- F3: tahan; ada titik cahaya keemasan kecil (2 px) melayang di atas tangan.
- F4: berdiri kembali.

**`stamp` — juru tulis mengecap berkas** · 4 frame · atas · 8 fps
- F0: berdiri di depan meja atau papan, setumpuk kertas di tangan kiri.
- F1: tangan kanan mengangkat cap kayu.
- F2: **cap dihentakkan** (tangan turun cepat, garis gerak), kertas bergetar.
- F3: mengangkat kertas bercap merah, memeriksanya.

**`lecture` — guru mengajar** · 6 frame · bawah · 6 fps
- F0: memegang buku tebal terbuka di tangan kiri.
- F1: telunjuk kanan terangkat ("perhatikan!").
- F2: menunjuk ke samping, ke papan.
- F3: menutup buku dengan satu tangan (sedikit hentakan).
- F4: tangan terbuka ke depan (bertanya kepada murid).
- F5: kembali ke F0.

**`study` — murid belajar/mencatat** · 5 frame · atas · 4 fps
- F0: memegang buku catatan dan pena bulu.
- F1: menulis (pena bergerak ke kanan).
- F2: menulis (pena kembali ke kiri).
- F3: berhenti, menggaruk kepala dengan ujung pena (bingung).
- F4: lampu ide: kepala terangkat, mata membesar.

**`read` — membaca di arsip** · 4 frame · bawah · 3 fps
- F0: memegang buku terbuka setinggi dada.
- F1: mata bergerak ke kanan.
- F2: membalik halaman (halaman terangkat setengah).
- F3: halaman jatuh, kepala mengangguk kecil.

**`stargaze` — ahli bintang meneropong** · 4 frame · atas · 3 fps
- F0: berdiri di belakang teropong berkaki tiga, tangan di teropong.
- F1: membungkuk, mata ditempelkan ke lensa.
- F2: tangan memutar roda pengatur teropong.
- F3: tegak, menunjuk ke langit.

### Kerja kota & desa
**`draw` — menimba air di sumur** · 6 frame · atas · 6 fps
- F0: berdiri di bibir sumur, tangan memegang engkol katrol.
- F1: memutar engkol ke atas.
- F2: memutar engkol ke bawah.
- F3: meraih ember yang naik (ember basah, tetesan biru 1 px).
- F4: mengangkat ember ke bibir sumur.
- F5: menuang ke ember sendiri / meletakkan ember di tanah.

**`sweep` — menyapu jalan** · 6 frame · samping · 8 fps
- F0: sapu lidi dipegang dua tangan, ujung sapu di tanah di depan.
- F1: sapuan ke kiri (ujung sapu bergeser ke belakang), ada debu 2–3 px.
- F2: sapu terangkat sedikit.
- F3: sapuan ke kanan.
- F4: berhenti, meluruskan punggung (tangan di pinggang).
- F5: kembali ke F0.

**`light` — menyalakan lentera jalan** · 6 frame · atas · 6 fps
- F0: memegang galah panjang dengan sumbu menyala di ujungnya (tinggi galah ±40 px, bisa melewati batas atas frame; potong saja di tepi frame).
- F1: mengangkat galah tinggi.
- F2: ujung galah menyentuh lentera (di luar frame), lidah api membesar.
- F3: menahan, berjinjit.
- F4: menurunkan galah.
- F5: memanggul galah di bahu.

**`tendlight` — penjaga mercusuar mengisi minyak** · 5 frame · atas · 5 fps
- F0: memegang kendi minyak.
- F1: mengangkat kendi ke arah lampu.
- F2: menuang (aliran minyak 1 px keemasan).
- F3: menyeka kaca lampu dengan kain.
- F4: menurunkan kendi.

**`prune` — tukang kebun memangkas** · 6 frame · samping · 6 fps
- F0: memegang gunting kebun besar dengan dua tangan.
- F1: membuka gunting.
- F2: mengatupkan gunting, 2–3 daun kecil berjatuhan.
- F3: berjongkok, memangkas bagian bawah.
- F4: membuka gunting lagi.
- F5: berdiri, menyeka kening.

**`mill` — penggiling mengangkut karung gandum** · 6 frame · samping · 6 fps
- F0: membungkuk meraih karung goni di tanah.
- F1: mengangkat karung ke dada.
- F2: memanggul karung di bahu, badan sedikit miring.
- F3: berjalan di tempat (langkah berat).
- F4: menurunkan karung, debu tepung putih 2–3 px.
- F5: menepuk tangan membersihkan tepung.

**`warm` — musafir menghangatkan diri di api unggun** · 4 frame · atas · 4 fps
- F0: duduk bersila menghadap api (punggung ke kamera).
- F1: kedua telapak tangan dijulurkan ke depan.
- F2: menggosok kedua tangan.
- F3: menarik tangan ke dada, bahu berselimut mantel.

**`fish` (pemancing, opsional)** · 6 frame · samping · 6 fps
- F0: memegang joran.
- F1: mengayun joran ke belakang.
- F2: melempar (tali melengkung ke depan).
- F3: menunggu: duduk diam, joran miring.
- F4: menyentak (ikan menggigit).
- F5: menarik ikan kecil berkilau.

---

## 4. Daftar NPC

Nama di judul = nama di game. "Nama usulan" = NPC lama yang namanya belum diganti di game (boleh dipakai saat menggambar).

Format setiap NPC:

> **ID · Nama** — peran · lokasi (koordinat lokal peta) · sprite sementara
> **Penampilan:** …
> **Baris kegiatan (baris 5+ berurutan):** …

Jam kerja per peran ada di bagian 6. Di luar jam kerja NPC berjalan-jalan, duduk, dan mengobrol. Saat malam, warga biasa pulang ke rumah, sedangkan prajurit berpatroli.

### 4.1 Gerbang Kota — Garnisun (`kgate`, barat gapura)

**gk1 · Kapten Bratasena** — `captain` · 410,262 depan Markas · sementara `guard_spear`
- **Penampilan:** pria ±45 tahun, tegap. Kumis tebal beruban di ujung, alis tebal. Zirah dada baja dengan lambang matahari keemasan, jubah pendek merah tua di bahu kiri, sarung pedang di pinggang, sepatu bot kulit cokelat. Topi baja terbuka berjambul bulu merah.
- **Baris kegiatan:** `inspect`, `salute`

**gk2 · Prajurit Anggara** — `soldier` · 330,500 · sementara `guard_spear`
- **Penampilan:** pria muda ±20 tahun, rambut cokelat pendek berantakan. Tunik bantalan abu-abu berlapis kulit, pelindung lengan kulit, celana cokelat. Membawa tombak latihan kayu (ujung dibungkus kain).
- **Baris kegiatan:** `train`, `salute`, `spar_attack`, `spar_block`

**gk5 · Prajurit Tegar** — `soldier` · 680,380 depan Barak Prajurit · sementara `guard_spear`
- **Penampilan:** pria ±30 tahun, badan besar, kepala plontos, jenggot pendek hitam. Zirah rantai di atas tunik biru tua, perisai bundar kayu di punggung, pedang pendek.
- **Baris kegiatan:** `train`, `salute`, `spar_attack`, `spar_block`

**gk6 · Prajurit Dimas** — `soldier` · 470,520 · sementara `guard_spear`
- **Penampilan:** pria ±18 tahun, kurus jangkung, rambut hitam diikat ekor kuda pendek. Tunik bantalan krem, ikat pinggang merah, pedang kayu latihan.
- **Baris kegiatan:** `train`, `salute`, `spar_attack`, `spar_block`

**gk7 · Prajurit Sekar** — `soldier` · 262,520 · sementara `guard`
- **Penampilan:** perempuan ±22 tahun, rambut hitam dikepang satu panjang, ikat kepala merah. Zirah kulit cokelat kemerahan, pelindung bahu kiri dari baja, tombak latihan.
- **Baris kegiatan:** `train`, `salute`, `spar_attack`, `spar_block`

**gk3 · Pemanah Raka** — `archer` · 380,590 · sementara `guard_spear`
- **Penampilan:** pria ±25 tahun, rambut pirang gelap sebahu, tudung hijau lumut diturunkan ke punggung. Rompi kulit, sarung lengan pemanah di lengan kiri, tabung anak panah di punggung (bulu panah merah), busur panjang kayu.
- **Baris kegiatan:** `shoot`, `salute`

**gk8 · Pemanah Laras** — `archer` · 440,714 · sementara `wati`
- **Penampilan:** perempuan ±24 tahun, rambut cokelat kemerahan dikuncir tinggi. Tunik hijau zaitun dengan ikat pinggang kulit, celana cokelat, busur pendek melengkung, tabung panah di pinggang kanan.
- **Baris kegiatan:** `shoot`, `salute`

**gk4 · Pak Sardi si Tukang Kuda** — `stablehand` · 536,226 depan Kandang Kuda · sementara `farmer`
- **Penampilan:** pria ±50 tahun, kulit sawo matang, topi jerami lebar, kemeja linen krem lengan digulung, celemek kulit cokelat, sepatu bot berlumpur. Sikat kuda menggantung di ikat pinggang, sesekali membawa garpu jerami.
- **Baris kegiatan:** `groom`

**merc1 · Perekrut Tentara Bayaran** (nama usulan: Gerda Taring Besi) — `merc` · 1030,668 depan Barak Bayaran · sementara `guard_spear`
- **Penampilan:** perempuan ±35 tahun, kekar. Rambut merah dicukur sisi, bekas luka di pipi kiri. Zirah kulit hitam bertabur paku, jubah bulu serigala di bahu, kapak satu tangan.
- **Baris kegiatan:** `sharpen`, `spar_attack`, `spar_block`

**gk9 · Tentara Bayaran Rangga** — `merc` · 960,690 · sementara `hunter`
- **Penampilan:** pria ±30 tahun, rambut gondrong diikat, cambang tipis. Mantel kulit panjang cokelat tua, sabuk dengan banyak kantong, pedang panjang di punggung.
- **Baris kegiatan:** `sharpen`, `spar_attack`, `spar_block`

**gk10 · Tentara Bayaran Wulan** — `merc` · 1100,700 · sementara `nila`
- **Penampilan:** perempuan ±28 tahun, rambut putih keperakan pendek, mata tajam. Zirah sisik biru baja, tudung kelabu, dua belati di pinggang.
- **Baris kegiatan:** `sharpen`, `spar_attack`, `spar_block`

**courier · Budi Kurir Kilat** — `courier` · 1080,720 · sementara `boy`
- **Penampilan:** remaja ±14 tahun, rambut jabrik cokelat, topi pet biru, kemeja kuning, tas selempang besar berisi gulungan surat, sandal tali.
- **Baris kegiatan:** `give`

### 4.2 Distrik Pasar (`kpasar`) — Pasar Raya

Pedagang kios berdiri di depan kios masing-masing (y 562 deret utara, y 892 deret selatan).

**st1 · Nenek Saga** — `stall` (Kios Ramuan, 470,540) · sementara `hermit`
- **Penampilan:** nenek ±75 tahun, bungkuk, rambut putih disanggul dengan tusuk konde kayu. Selendang ungu tua bermotif bintang, kacamata bundar kecil. Botol-botol kecil tergantung di ikat pinggang.
- **Baris kegiatan:** `arrange`, `call`, `give` · di `arrange` ia memegang botol ramuan ungu bercahaya.

**st2 · Pak Darto** — `stall` (Kios Daging & Roti, 590,540) · sementara `smith`
- **Penampilan:** pria ±45 tahun, gemuk, kepala botak, kumis melintang. Celemek putih bernoda, lengan baju digulung, handuk kecil di bahu.
- **Baris kegiatan:** `arrange`, `call`, `give` · memegang roti panjang atau paha ayam panggang.

**st3 · Gilang** — `stall` (Kios Senjata, 1010,540) · sementara `hunter`
- **Penampilan:** pria ±30 tahun, berotot, rambut hitam pendek. Rompi kulit tanpa lengan, sarung tangan pandai besi, bekas jelaga di pipi.
- **Baris kegiatan:** `arrange`, `call`, `give` · memegang pedang yang dipamerkan di kedua telapak tangan.

**st4 · Ki Arsa** — `stall` (Kios Gulungan & Peta, 1130,540) · sementara `elder`
- **Penampilan:** kakek ±70 tahun, jenggot putih panjang sampai dada, jubah biru tinta dengan noda tinta, topi kerucut pendek, pena bulu terselip di telinga.
- **Baris kegiatan:** `arrange`, `call`, `give` · memegang gulungan peta.

**st5 · Bu Ratna** — `stall` (Kios Pangan, 470,870) · sementara `woman`
- **Penampilan:** wanita ±40 tahun, rambut hitam disanggul dengan kain kuning, kebaya hijau daun, celemek motif kotak-kotak.
- **Baris kegiatan:** `arrange`, `call`, `give` · memegang toples madu dan roda keju.

**st6 · Arsa Muda** — `stall` (Kios Gulungan & Peta, 590,870) · sementara `darma`
- **Penampilan:** cucu Ki Arsa, pemuda ±19 tahun, rambut ikal cokelat, kacamata, rompi biru tinta (meniru kakeknya), banyak gulungan di ketiak.
- **Baris kegiatan:** `arrange`, `call`, `give`

**st7 · Laras** — `stall` (Kios Ramuan, 1010,870) · sementara `lestari`
- **Penampilan:** cucu Nenek Saga, gadis ±17 tahun, rambut hitam lurus berponi, gaun ungu muda, keranjang daun obat di lengan.
- **Baris kegiatan:** `arrange`, `call`, `give`

**st8 · Bimo** — `stall` (Kios Senjata, 1130,870) · sementara `guard`
- **Penampilan:** adik Gilang, pria ±22 tahun, bertubuh besar, rambut cepak, kaus zirah rantai pendek, ikat kepala hitam.
- **Baris kegiatan:** `arrange`, `call`, `give` · memegang busur atau zirah.

**ps1 · Nyonya Melati** — `shopper` · 840,600 · sementara `mom`
- **Penampilan:** wanita bangsawan ±35 tahun, gaun merah muda berenda, payung kecil, keranjang anyaman.
- **Baris kegiatan:** `browse`, `pay`, `refuse`, `clap`

**ps2 · Pak Harun** — `shopper` · 760,820 · sementara `farmer`
- **Penampilan:** petani ±55 tahun dari Desa Kincir, topi caping, sarung cokelat, karung kosong di bahu.
- **Baris kegiatan:** `browse`, `pay`, `refuse`, `clap`

**kp1 · Warga** (nama usulan: Bu Indri) — `shopper` · 700,760 · sementara `woman`
- **Penampilan:** ibu ±40 tahun, kerudung krem, baju cokelat muda, bakul bambu di pinggang.
- **Baris kegiatan:** `browse`, `pay`, `refuse`, `clap`

**kp4 · Gadis Kota** (nama usulan: Mirah) — `shopper` · 520,660 · sementara `girl`
- **Penampilan:** gadis ±15 tahun, rambut kepang dua, gaun biru muda, pita kuning.
- **Baris kegiatan:** `browse`, `pay`, `refuse`, `clap`

**kp7 · Warga** (nama usulan: Pak Sugeng) — `shopper` · 300,640 · sementara `woman`
- **Penampilan:** pria ±50 tahun, peci hitam, kemeja batik cokelat, membawa ayam di tangan.
- **Baris kegiatan:** `browse`, `pay`, `refuse`, `clap`

**ps3 · Kirana si Pemetik Kecapi** — `musician` · 760,690 dekat air mancur · sementara `inn`
- **Penampilan:** wanita ±25 tahun, rambut hijau toska panjang bergelombang, gaun penari jingga dengan selendang, kecapi kayu berukir. Gelang kaki berlonceng.
- **Baris kegiatan:** `play` (kecapi)

**ps4 · Mang Ujang** — `sweeper` · 800,800 · sementara `gun`
- **Penampilan:** pria ±60 tahun, kurus, topi caping lusuh, baju lurik, sapu lidi panjang, pengki di pinggang.
- **Baris kegiatan:** `sweep`

**ps5 · Pak Lentera** — `lamplighter` · 620,640 · sementara `joko`
- **Penampilan:** pria ±50 tahun, jangkung, mantel abu-abu panjang, topi bundar, galah penyulut berujung api, lentera kecil di pinggang.
- **Baris kegiatan:** `light`

**ps6 · Romo Anom** — `priest` (kuil alun-alun, 800,470) · sementara `priest`
- **Penampilan:** pria ±60 tahun, kepala plontos, jubah putih bersulam emas, kalung tasbih kayu, membawa lilin.
- **Baris kegiatan:** `pray`

**ps7 · Tole si Kurir Pasar** — `courier` · 980,640 · sementara `child`
- **Penampilan:** anak ±12 tahun, kaus kuning kebesaran, celana pendek, kotak kayu kiriman di pelukan.
- **Baris kegiatan:** `give`

### 4.3 Distrik Permukiman (`kpermukiman`)

**pm1 · Juru Warta Bram** — `crier` (sumur/Balai Dewan) · 760,430 · sementara `merchant`
- **Penampilan:** pria ±40 tahun, berperut buncit, topi bersayap bulu merah, mantel biru dengan lambang kota, lonceng tangan di pinggang, gulungan maklumat.
- **Baris kegiatan:** `announce`

**pm2 · Pak Wiryo** — `official` (Balai Dewan) · 650,420 · sementara `elder`
- **Penampilan:** juru tulis ±60 tahun, kacamata bertali, jas kuning gading berkancing, setumpuk kertas, cap kayu.
- **Baris kegiatan:** `stamp`

**pm3 · Bu Sumi** — `water` (sumur alun-alun) · 740,560 · sementara `woman`
- **Penampilan:** wanita ±45 tahun, kain jarik cokelat, kemben hijau, ember kayu, rambut digelung.
- **Baris kegiatan:** `draw`

**pm4 · Romo Gita** — `priest` (kuil permukiman) · 650,660 · sementara `priest`
- **Penampilan:** wanita ±50 tahun, jubah putih berkerudung tipis keemasan, membawa pedupaan kecil berasap.
- **Baris kegiatan:** `pray`

**pm5 · Bu Ani** — warga (gosip, menonton) · 520,520 · sementara `mom`
- **Penampilan:** ibu ±35 tahun, daster bunga ungu, rambut dikuncir, membawa tampah.
- **Baris kegiatan:** `clap`, `laugh`

**pm6 · Bu Tini** — warga · 560,530 · sementara `lestari`
- **Penampilan:** ibu ±38 tahun, kebaya merah bata, kerudung hitam, kipas anyaman.
- **Baris kegiatan:** `clap`, `laugh`

**pm7 · Pak Damar** — `lamplighter` · 900,520 · sementara `farmer`
- **Penampilan:** pria ±45 tahun, gempal, mantel cokelat, topi kain, galah penyulut, wajah ramah berpipi merah.
- **Baris kegiatan:** `light`

### 4.4 Distrik Akademi (`kakademi`)

**ac1 · Guru Wening** — `teacher` (papan pengumuman 592,628) · 592,660 · sementara `lestari`
- **Penampilan:** wanita ±40 tahun, jubah akademi biru tua berkerah emas, rambut hitam disanggul tinggi dengan tusuk kristal, buku tebal bersampul kulit.
- **Baris kegiatan:** `lecture`

**ac2 · Murid Tara** — `student` · 560,690 · sementara `girl`
- **Penampilan:** gadis ±14 tahun, seragam akademi (rompi biru, kemeja putih, rok/celana abu), rambut cokelat pendek, tas kulit.
- **Baris kegiatan:** `study`, `clap`

**ac3 · Murid Bagas** — `student` · 630,700 · sementara `child`
- **Penampilan:** anak lelaki ±12 tahun, seragam akademi kebesaran, rambut jabrik hitam, plester di hidung.
- **Baris kegiatan:** `study`, `clap`

**ac4 · Murid Sinta** — `student` · 600,722 · sementara `mila`
- **Penampilan:** gadis ±13 tahun, rambut panjang perak dikepang, seragam akademi, buku mantra memeluk di dada.
- **Baris kegiatan:** `study`, `clap`

**ka1 · Murid Akademi** (nama usulan: Nala) — `student` · 600,700 · sementara `girl`
- **Penampilan:** gadis ±16 tahun, seragam akademi, rambut merah sebahu, syal biru.
- **Baris kegiatan:** `study`, `clap`

**ka3 · Murid Akademi** (nama usulan: Ardi) — `student` · 1000,700 · sementara `woman`
- **Penampilan:** pemuda ±17 tahun, seragam akademi, rambut pirang rapi, kacamata, setumpuk buku.
- **Baris kegiatan:** `study`, `clap`

**ac5 · Pak Taman** — `gardener` (rumah kaca, pagar hidup) · 1150,600 · sementara `farmer`
- **Penampilan:** pria ±55 tahun, topi anyaman lebar, celemek hijau berkantong, sepatu bot karet, gunting kebun besar.
- **Baris kegiatan:** `prune`

**ac6 · Ahli Bintang Orion** — `astronomer` (teropong, malam) · 700,520 · sementara `witch`
- **Penampilan:** pria ±65 tahun, jubah ungu malam bertabur bintang perak, topi kerucut lebar, jenggot abu-abu, kacamata lensa ganda.
- **Baris kegiatan:** `stargaze`

**ac7 · Kadet Wira** — `soldier` (lapangan latihan Akademi) · 270,580 · sementara `guard`
- **Penampilan:** pemuda ±16 tahun, seragam kadet (tunik putih bersabuk biru), pedang kayu, ikat kepala putih.
- **Baris kegiatan:** `train`, `salute`, `spar_attack`, `spar_block`

**ac8 · Kadet Nara** — `archer` (sasaran Akademi) · 455,580 · sementara `wati`
- **Penampilan:** gadis ±16 tahun, seragam kadet, rambut hitam pendek, busur pendek kayu muda.
- **Baris kegiatan:** `shoot`, `salute`

**ac9 · Pak Sapu** — `sweeper` · 700,600 · sementara `gun`
- **Penampilan:** pria ±55 tahun, seragam pelayan akademi (rompi biru, kemeja putih), sapu ijuk.
- **Baris kegiatan:** `sweep`

### 4.5 Kota Bawah (`kbawah`)

**bw1 · Kiko si Penabuh** — `drummer` (gendang jalanan) · 720,676 · sementara `child`
- **Penampilan:** anak lelaki ±11 tahun, kaus robek merah, celana tambalan, ikat kepala, kaki telanjang, gendang kecil dikalungkan.
- **Baris kegiatan:** `drum`, `laugh`

**bw2 · Pengamen Seruling (Mbak Ratri)** — `musician` · 600,700 · sementara `ratih`
- **Penampilan:** wanita ±28 tahun, tudung cokelat lusuh, rok tambal-sulam, seruling bambu, topi terbalik di depan kaki untuk koin.
- **Baris kegiatan:** `play` (seruling)

**bw3 · Mbok Jum** — `sweeper` · 500,560 · sementara `mom`
- **Penampilan:** nenek ±65 tahun, kain jarik pudar, kerudung lusuh, sapu lidi pendek, punggung bungkuk.
- **Baris kegiatan:** `sweep`

### 4.6 Desa & alam

**vl1 · Mbak Sari** — `water` (sumur desa) · `village` 470,400 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** gadis desa ±20 tahun, rambut hitam dikepang dua, baju hijau pupus, rok cokelat berikat krem.
- **Baris kegiatan:** `draw`

**vl2 · Pak Obor** — `lamplighter` · `village` 600,300 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria ±40 tahun berikat kepala cokelat tua, baju koko krem lengan digulung, sarung gelap bermotif.
- **Baris kegiatan:** `light`

**vl3 · Mas Tarno** — `citizen` (warga desa biasa) · `village` 560,440 · lembar dari gambar pemilik (HAND, `tools/npc_desa/build.py`, 8 arah)
- **Penampilan:** pria muda berambut cokelat, tunik biru, sabuk kulit, celana gelap, sepatu cokelat.
- **Baris kegiatan:** `laugh`

**vl4 · Nenek Sumi** — `citizen` (warga desa biasa) · `village` 440,470 · lembar dari gambar pemilik (HAND, `tools/npc_desa/build.py`, 8 arah)
- **Penampilan:** nenek berambut abu disanggul, baju marun, celemek cokelat, sepatu cokelat.
- **Baris kegiatan:** `laugh`

**vl5 · Mbak Ningsih** — `citizen` (warga desa biasa) · `village` 660,370 · lembar dari gambar pemilik (HAND, `tools/npc_desa/build.py`, 8 arah)
- **Penampilan:** perempuan berambut cokelat disanggul rendah, rompi jingga, gaun hijau zaitun, sepatu cokelat.
- **Baris kegiatan:** `laugh`

**kn1 · Kesatria Arvan** — `guard` (berpatroli di desa) · `village` 520,500 · lembar dari gambar pemilik (HAND, `tools/npc_desa/build.py`, 8 arah; sel 80×56; pedang, lambang & warna desain sendiri — gambar acuan tidak disalin)
- **Penampilan:** kesatria muda berambut cokelat tua, zirah perak, jubah toska tua berlambang bintang emas, mata toska, pedang panjang bergagang emas dipanggul di bahu.
- **Baris kegiatan:** `laugh`

**hunter · Pemburu Raka** — pemburu (`JOBS.forest.hunter`) · `forest` 600,90 · lembar dari gambar GPT pemilik (HAND)
- **Penampilan:** pemburu muda berambut hijau, syal marun, mantel cokelat-merah, celemek krem bertanda hijau, tabung anak panah, busur kayu.
- **Baris kegiatan:** `bow`, `sit`

**farmer · Pak Darto** — petani (`JOBS.village.farmer`) · `village` 330,235 · lembar dari gambar GPT pemilik (HAND)
- **Penampilan:** petani bertopi jerami lebar, kemeja krem, syal merah, celana kodok biru, sarung tangan kulit.
- **Baris kegiatan:** `hoe`, `water`, `harvest`, `sit`

**guard · Penjaga** — penjaga desa (`JOBS.village.guard`) · `village` 470,652 · lembar dari gambar GPT pemilik (HAND)
- **Penampilan:** kesatria muda berhelm baja jambul merah, jubah merah, zirah, perisai biru bersalib emas, pedang pendek.
- **Baris kegiatan:** `slash`, `sit`

**smith · Pak Besi** — pandai besi (`JOBS.village.smith`, `src/npc/job_smith.js`) · `village` 720,435 · lembar dari gambar GPT pemilik (HAND); baris 4 kolom 7 = landasan peta
- **Penampilan:** pria kekar berambut & berjanggut lebat, kemeja krem digulung, celemek dan sarung tangan kulit.
- **Baris kegiatan:** `hammer`, `sit`

**mira · Mira** — penyihir desa (`JOBS.village.mira`) · `village` 600,350 · lembar asli dari gambar GPT pemilik (HAND, tidak ditimpa generator)
- **Penampilan:** gadis penyihir, topi runcing ungu bergesper emas, rambut ungu panjang, mantel marun bertepi emas, gaun krem.
- **Baris kegiatan:** `read`, `cast`

**girl · Lina** — penyulam muda & pemilik Mochi (`citizen`) · `village` 380,235 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** gadis muda ceria berambut cokelat kastanye dikepang samping dengan pita hijau muda, blus krem lengan pendek, gaun pinafore hijau lumut bercelemek krem, sepatu bot cokelat tua.
- **Baris kegiatan:** `laugh`, `clap`

**merchant · Bu Sari** — pedagang kios & apoteker desa (`JOBS.village.merchant`) · `village` 730,245 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** wanita ramah berambut cokelat tua disanggul dengan ikat kepala terakota, blus krem lengan digulung, rompi dan rok panjang hijau zaitun bercelemek krem serta kantong herba di sabuk kulit.
- **Baris kegiatan:** `sweep`, `arrange`, `give`

**elder · Tetua Bram** — tetua desa (`JOBS.village.elder`) · `village` 486,95 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria sepuh berambut dan berjanggut putih-abu rapi, jubah panjang biru-abu gelap berlis emas, selendang bahu cokelat hangat, kemeja dalam krem.
- **Baris kegiatan:** `sweep`, `read`

**woman · Bu Lastri** — ibu warga desa (`JOBS.village.woman`) · `village` 250,445 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** wanita ramah berambut gelap disanggul rendah, blus krem, gaun merah-bata bercelemek masak krem-putih bersih.
- **Baris kegiatan:** `sweep`, `draw`

**child · Dodi** — anak desa (`citizen`) · `village` 540,410 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah, proporsi anak)
- **Penampilan:** anak lelaki berambut cokelat pendek agak acak, kemeja krem berrompi biru lembut, celana selutut dan bot cokelat tua.
- **Baris kegiatan:** `laugh`, `clap`

**chick_master · Kiki Penggembala** — penggembala ayam (`JOBS.village.chick_master`) · `village` 820,330 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah, proporsi anak)
- **Penampilan:** anak lincah bertopi jerami berpita merah-oranye, tunik kuning-okre berkantong pakan di pinggang, celana dan bot cokelat tua.
- **Baris kegiatan:** `sweep`, `laugh`

**joko · Pak Joko** — petani & penggiling (`JOBS.meadow.joko`) · `meadow` 340,290 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria petani berikat kepala kain krem-cokelat, kemeja biru-abu lengan digulung, celemek goni cokelat muda, celana dan bot cokelat tua.
- **Baris kegiatan:** `harvest`, `mill`

**wati · Wati** — pekebun Desa Kincir (`JOBS.meadow.wati`) · `meadow` 180,290 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** wanita pekebun berambut cokelat disanggul berpita kuning-krem, blus krem, gaun biru-hijau debu bercelemek kebun cokelat-krem.
- **Baris kegiatan:** `hoe`, `harvest`

**darma · Darma** — tukang kayu (`JOBS.meadow.darma`) · `meadow` 520,290 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria berambut cokelat pendek dan berkumis tipis, kemeja krem lengan digulung, rompi kulit bersabuk perkakas, celana biru-abu gelap, bot cokelat.
- **Baris kegiatan:** `hammer`

**bayu · Pedagang Bayu** — pedagang hasil bumi (`JOBS.meadow.bayu`) · `meadow` 248,372 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria pedagang berambut cokelat bergelombang, kemeja krem bersyal biru tua dan rompi marun hangat, kantong koin di sabuk.
- **Baris kegiatan:** `arrange`, `sweep`

**md1 · Pak Giling** — `miller` (kincir angin) · `meadow` 260,232 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** pria ±50 tahun berbadan agak berisi, topi kain abu-krem, kumis abu-abu, kemeja krem berdebu tepung dan celemek goni pucat.
- **Baris kegiatan:** `mill`

**md2 · Tole Pemancing** — `fisher` (dermaga) · `meadow` 660,780 · lembar bergaya MC (`HAND`, `tools/npc_desa/build_mc_npc.py`, 8 arah)
- **Penampilan:** remaja ±15 tahun bertopi caping bambu, kaus biru sedang, celana selutut digulung, sandal cokelat.
- **Baris kegiatan:** `fish`

**lk1 · Penjaga Mercusuar Tirta** — `lightkeeper` · `lake` 1100,470 · sementara `hermit`
- **Penampilan:** pria tua ±70 tahun, jenggot putih pendek, mantel nelayan kuning tebal, topi rajut, kendi minyak.
- **Baris kegiatan:** `tendlight`

**lk2 · Musafir Kelana** — `traveler` (api unggun danau) · `lake` 1080,594 · sementara `hunter`
- **Penampilan:** pria ±35 tahun, mantel perjalanan hijau gelap, ransel besar dengan gulungan selimut, tongkat jalan.
- **Baris kegiatan:** `warm`

**rd1 · Musafir Gani** — `traveler` (api unggun Jalan Raya Lama) · `road` 590,552 · sementara `darma`
- **Penampilan:** pedagang keliling ±45 tahun, sorban cokelat, rompi bertambal, tas pikul.
- **Baris kegiatan:** `warm`, `laugh`

**rd2 · Musafir Laila** — `traveler` · `road` 530,556 · sementara `woman`
- **Penampilan:** wanita ±30 tahun, jubah perjalanan biru debu, kerudung, kantong air kulit.
- **Baris kegiatan:** `warm`, `laugh`

### 4.7 Dalam ruangan

**in1 · Pelanggan Bagus** — `patron` · Penginapan Seribu Lentera (`kinn`) 110,200 · sementara `farmer`
- **Penampilan:** pria ±40 tahun, pipi merah, kemeja longgar, cangkir kayu besar.
- **Baris kegiatan:** `drink`, `cheers`

**in2 · Pelanggan Rini** — `patron` · `kinn` 200,220 · sementara `woman`
- **Penampilan:** wanita ±30 tahun, rambut ikal pendek, gaun cokelat, mangkuk sup.
- **Baris kegiatan:** `drink`, `cheers`

**in3 · Musafir Arif** — `patron` · Penginapan Daun Emas (`inn`) 110,170 · sementara `hunter`
- **Penampilan:** pemuda ±25 tahun, jaket kulit, ransel di kursi, peta terbuka.
- **Baris kegiatan:** `drink`, `cheers`

**tp1 · Calon Imam Dewi** — `priest` · Kuil Penjaga Cahaya (`temple`) 130,240 · sementara `girl`
- **Penampilan:** gadis ±17 tahun, jubah putih polos (tanpa sulaman emas), rambut hitam diikat rapi, membawa lilin.
- **Baris kegiatan:** `pray`

**ar1 · Pustakawan Ki Lontar** — `scholar` · Arsip Akademi (`arsip`) 160,220 · sementara `elder`
- **Penampilan:** kakek ±80 tahun, sangat kurus, kacamata tebal, jubah cokelat tua, setumpuk lontar.
- **Baris kegiatan:** `read`

**ar2 · Peneliti Ayu** — `scholar` · `arsip` 100,250 · sementara `lestari`
- **Penampilan:** wanita ±28 tahun, jubah akademi hijau tua, rambut sebahu, kaca pembesar.
- **Baris kegiatan:** `read`

---

## 5. Interaksi antar-NPC (adegan)

Setiap ±2 detik `life_duos.js` mencari pasangan NPC di sekitar pemain (radius 480 px), maksimal 3 adegan sekaligus. Satu NPC baru boleh ikut adegan lagi setelah jeda 25–45 detik.

| Adegan | Pelaku | Jalannya | Animasi yang dipakai |
|---|---|---|---|
| Tawar-menawar | pembeli/warga ↔ pedagang | pembeli berjalan ke samping pedagang → 4 kalimat bergantian → membayar atau menolak | `talk`, `pay`, `refuse`, `give` |
| Tanding latihan | prajurit ↔ prajurit, bayaran ↔ bayaran | bertemu di tengah → "Siap?" / "Maju!" → 6 serangan bergantian dengan percikan → saling memuji | `talk`, `spar_attack`, `spar_block` |
| Hormat | kapten → prajurit/pemanah | kapten mendekat (`inspect`) → prajurit menoleh dan memberi hormat → kapten memberi arahan | `inspect`, `salute`, `talk` |
| Kejar-kejaran | anak ↔ anak | "Kamu yang jaga!" → kejar → "Kena!" → bergantian | jalan (berlari), `laugh` |
| Gosip | warga, musafir, penimba air, pelanggan | berjalan mendekat → 4 kalimat tentang harga roti, serigala, festival, Akademi, petualang dari Desa Lumina | `talk`, `laugh` |
| Menonton | penonton → pemusik/penabuh/juru warta/guru (yang sedang tampil) | penonton mendekat, menghadap, lalu tepuk tangan atau berseru; ke pemusik memberi koin | `clap`, `pay` |
| Bersulang | pelanggan ↔ pelanggan | saling menghadap → "Bersulang!" / "Untuk Lumina!" | `cheers` |
| Antar paket | kurir → pedagang | kurir berlari ke pedagang → menyerahkan paket → pedagang berterima kasih | `give`, `talk` |

Adegan langsung batal bila pemain membuka dialog atau sebuah adegan cerita mengambil alih NPC.

---

## 6. Jadwal harian per peran (jam game)

| Peran | Jam kerja | Di luar jam kerja | Malam |
|---|---|---|---|
| prajurit, pemanah | 06–18 latihan | jalan-jalan | patroli jalan garnisun |
| kapten | 06–22 memeriksa | — | patroli |
| tukang kuda | 05–20 | jalan-jalan | pulang |
| tentara bayaran | 07–23 mengasah | — | tetap di sekitar barak |
| pedagang kios | 07–19 menata/berseru | jalan-jalan | pulang |
| pembeli | 08–18 berkeliling kios | jalan-jalan | pulang |
| pemusik, penabuh | 09/10–22/23 | jalan-jalan | pulang |
| juru warta | 08–18 | jalan-jalan | pulang |
| imam | 05–21 berdoa | — | tetap di kuil |
| penimba air | 06–18 | jalan-jalan | pulang |
| juru tulis | 08–16 | jalan-jalan | pulang |
| guru / murid | 08–16 / 07–17 | jalan-jalan | pulang |
| tukang kebun | 06–17 | jalan-jalan | pulang |
| ahli bintang | 18–05 meneropong | jalan-jalan | tetap di teropong |
| penyapu | 05–19 | jalan-jalan | pulang |
| tukang lampu | 16–21 keliling lentera | jalan-jalan | pulang |
| penggiling | 06–18 | jalan-jalan | pulang |
| penjaga mercusuar, musafir, pelanggan, pustakawan | sepanjang hari | — | tetap di tempat |

Hujan: warga tanpa tugas malam berteduh di pintu terdekat, sedangkan prajurit dan imam tetap beraktivitas.

---

## 7. Daftar periksa sebelum menyerahkan lembar

- [ ] Ukuran = 384 × (48 × jumlah baris); latar transparan asli (cek dengan membukanya di atas warna hijau).
- [ ] Baris 0–4 lengkap; baris 5+ sesuai urutan "Baris kegiatan" NPC itu.
- [ ] Kaki menyentuh dasar frame di semua frame (kecuali saat melompat atau berjinjit); tokoh di tengah frame.
- [ ] Baris samping menghadap kanan.
- [ ] Warna, pakaian, dan aksesoris sama di semua frame.
- [ ] Frame terakhir animasi kegiatan kembali dekat ke pose diam.
- [ ] Sudah didaftarkan di `NPC_SHEETS` (`src/npc/life_sheet.js`), lalu `npm run check` bersih.
