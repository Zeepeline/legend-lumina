# WORLD & REGION DESIGN RULES
## Legenda Lumina

Dokumen ini mengatur bagaimana agent harus merancang, memperluas, dan mengevaluasi dunia Legenda Lumina.

---

## 1. Fokus Pengembangan Saat Ini

**Prioritas utama adalah Benua Lumina.**

Benua lain sudah ada sebagai fondasi dunia:

- Benua Barat
- Benua Timur
- Kepulauan Selatan
- Benua Utara
- Wilayah Terlarang

Namun, untuk pengembangan saat ini, **jangan memperluas detail benua lain secara berlebihan** kecuali dibutuhkan untuk lore, foreshadowing, atau hubungan dunia.

Benua Lumina harus terlebih dahulu terasa seperti benua yang benar-benar hidup dan memiliki sejarah.

Jangan memperlakukan Benua Lumina sebagai sekadar kumpulan 6 map awal.

---

# 2. Struktur Benua Lumina

Struktur dasar Benua Lumina:

```text
Benua Lumina
│
├── Desa & Permukiman
│   ├── Desa Lumina
│   ├── Desa Nelayan
│   ├── Desa Petani
│   ├── Desa Pegunungan
│   └── Desa Penambang
│
├── Kota
│   ├── Kota Lumina
│   ├── Kota Pelabuhan
│   └── Kota Perdagangan
│
├── Wilayah Alam
│   ├── Hutan Lumina
│   ├── Padang Angin
│   ├── Rawa Senja
│   ├── Pegunungan
│   └── Puncak Beku
│
├── Lokasi Khusus
│   ├── Gua Batu
│   ├── Kuil Kuno
│   ├── Reruntuhan
│   └── Benteng Lama
│
└── Wilayah Rahasia
    └── ???
```

Daftar ini adalah **struktur world-building**, bukan daftar semua map yang wajib langsung dibuat.

Nama atau lokasi yang belum memiliki alasan kuat tidak boleh dipaksakan masuk hanya untuk memenuhi jumlah.

---

# 3. Setiap Lokasi Harus Memiliki Alasan untuk Ada

Jangan membuat lokasi hanya karena:

- membutuhkan map baru;
- membutuhkan tempat untuk quest;
- membutuhkan dungeon;
- membutuhkan boss;
- ingin memperbesar world map;
- atau ingin membuat dunia terlihat besar.

Setiap lokasi harus memiliki alasan geografis, sosial, ekonomi, sejarah, budaya, atau cerita.

Sebelum membuat lokasi baru, tanyakan:

1. Mengapa tempat ini berada di sini?
2. Siapa yang tinggal atau pernah tinggal di sini?
3. Mereka hidup dari apa?
4. Apa hubungan tempat ini dengan lokasi lain?
5. Apa sejarah tempat ini?
6. Apa konflik lokalnya?
7. Apa yang membuat tempat ini berbeda?
8. Apa yang dapat ditemukan pemain di sini?
9. Apa yang berubah setelah pemain datang?
10. Mengapa tempat ini penting bagi dunia Legenda Lumina?

Jika jawabannya hanya "karena game membutuhkan area baru", desain tersebut belum cukup kuat.

---

# 4. Ukuran Area Tidak Harus Seragam

**Jangan menggunakan ukuran map yang sama untuk semua jenis lokasi.**

Ukuran harus mengikuti fungsi, populasi, kepentingan cerita, dan kompleksitas gameplay.

Tidak masalah jika suatu wilayah sangat luas.

Justru dunia harus memiliki perbedaan skala agar terasa alami.

Gunakan prinsip:

```text
Ukuran Area ≠ Jumlah Pentingnya Lokasi

Ukuran Area = fungsi + geografi + populasi + aktivitas + gameplay
```

---

# 5. Hierarki Ukuran Lokasi

## Desa

Desa biasanya lebih kecil daripada kota.

Namun desa tidak harus kecil secara ekstrem.

Desa dapat memiliki:

- rumah penduduk;
- ladang;
- jalan utama;
- area pasar;
- tempat ibadah;
- bengkel;
- sumur;
- kandang;
- kebun;
- area kerja;
- jalan menuju alam sekitar;
- tempat tersembunyi;
- bangunan penting untuk quest.

Desa yang memiliki fungsi ekonomi atau sejarah penting boleh lebih besar.

Contoh:

```text
Desa kecil
→ area padat, sedikit bangunan

Desa berkembang
→ beberapa bagian permukiman + ladang + fasilitas

Desa besar
→ beberapa distrik kecil + fasilitas ekonomi + area luar
```

Jangan mengecilkan desa hanya karena disebut "desa".

---

# 6. Kota

**Kota harus terasa jauh lebih besar daripada desa.**

Kota tidak boleh hanya menjadi:

```text
10 rumah + shop + inn + NPC
```

dan disebut kota.

Kota dapat memiliki beberapa distrik:

```text
Kota
│
├── Gerbang
├── Permukiman
├── Pasar
├── Distrik Dagang
├── Bengkel
├── Penginapan
├── Distrik Pemerintahan
├── Distrik Guild
├── Pelabuhan / kawasan industri
└── area khusus
```

Tidak semua kota harus memiliki semua distrik.

Namun kota besar harus menunjukkan:

- populasi;
- aktivitas;
- perdagangan;
- struktur sosial;
- perbedaan antar kawasan;
- kehidupan NPC;
- sejarah;
- hubungan dengan wilayah lain.

**Jika sebuah kota secara logis membutuhkan area yang sangat luas, buatlah luas.**

Jangan memadatkan kota secara tidak wajar hanya agar ukuran map mudah dibuat.

---

# 7. Kota Tidak Harus Satu Map

Kota besar boleh dibagi menjadi beberapa area.

Contoh:

```text
Kota Lumina
├── Gerbang Kota
├── Distrik Pasar
├── Distrik Penduduk
├── Distrik Bangsawan
├── Guild
└── Istana
```

Tetapi pembagian ini harus terasa sebagai **satu kota yang sama**, bukan kumpulan map yang tidak berhubungan.

Gunakan landmark, jalan, arsitektur, NPC, dan sistem transportasi untuk mempertahankan identitas kota.

---

# 8. Wilayah Alam Boleh Sangat Luas

Wilayah alam **tidak harus berukuran seperti satu map kecil**.

Contoh:

```text
Hutan Lumina
├── Hutan Selatan
├── Jalur Sungai
├── Hutan Dalam
├── Area Reruntuhan
└── Wilayah Tersembunyi
```

Satu wilayah alam dapat memiliki:

- beberapa zona;
- jalan utama;
- jalur alternatif;
- landmark;
- sungai;
- danau;
- tebing;
- gua;
- reruntuhan;
- tempat berburu;
- monster habitat;
- NPC;
- rahasia;
- perubahan berdasarkan waktu/cuaca.

Jika secara geografis sebuah hutan harus terasa luas, **jangan dipaksa menjadi area kecil hanya demi efisiensi implementasi.**

---

# 9. Wilayah Alam Harus Memiliki Identitas

Jangan membuat:

```text
Hutan A
Hutan B
Hutan C
```

yang hanya berbeda warna.

Setiap wilayah alam harus mempunyai identitas ekologis dan naratif.

Contoh:

### Hutan Lumina

Harus memiliki alasan mengapa berbeda dari hutan lain.

Identitas dapat berasal dari:

- flora;
- fauna;
- fenomena Lumina;
- sejarah;
- masyarakat sekitar;
- cuaca;
- struktur geografis;
- legenda;
- hubungan dengan cerita utama.

---

# 10. Lokasi Khusus Tidak Harus Besar, tetapi Harus Padat Makna

Kategori:

```text
Lokasi Khusus
├── Gua Batu
├── Kuil Kuno
├── Reruntuhan
└── Benteng Lama
```

tidak harus sebesar kota.

Namun lokasi tersebut harus mempunyai **kepadatan cerita atau gameplay yang tinggi**.

Contoh:

```text
Gua Batu
→ tambang + jalur bawah tanah + misteri

Kuil Kuno
→ puzzle + sejarah + simbol

Reruntuhan
→ eksplorasi + lore + environmental storytelling

Benteng Lama
→ sejarah perang + dungeon + konflik
```

Jangan menjadikan setiap lokasi khusus sebagai:

```text
masuk → monster → puzzle → boss → selesai
```

Bentuk gameplay harus bervariasi.

---

# 11. Lokasi Khusus Bisa Memiliki Sub-Area

Lokasi khusus yang penting boleh berkembang menjadi kompleks.

Contoh:

```text
Benteng Lama
│
├── Gerbang
├── Halaman
├── Barak
├── Ruang Komando
├── Penjara
├── Bawah Tanah
└── Ruang Rahasia
```

Jangan menentukan ukuran berdasarkan kategori "dungeon".

Tentukan berdasarkan kebutuhan tempat tersebut.

---

# 12. Wilayah Rahasia

Wilayah Rahasia tidak perlu langsung didefinisikan.

```text
Wilayah Rahasia
└── ???
```

Boleh tetap menjadi misteri sampai lore Benua Lumina berkembang.

Jangan membuat secret area hanya karena game membutuhkan secret area.

Lokasi rahasia harus memiliki alasan mengapa:

- tersembunyi;
- sulit ditemukan;
- dilupakan;
- disegel;
- tidak diketahui masyarakat;
- atau sengaja disembunyikan.

---

# 13. Hubungan Antar Lokasi Adalah Prioritas

Lokasi tidak boleh berdiri sebagai pulau cerita.

Gunakan hubungan:

```text
Desa
↓
menghasilkan sesuatu
↓
Kota
↓
diperdagangkan
↓
Pelabuhan
↓
dibawa ke wilayah lain
↓
muncul konflik / informasi
↓
kembali memengaruhi Desa
```

Contoh:

```text
Desa Penambang
    ↓
menghasilkan mineral
    ↓
Kota Perdagangan
    ↓
mineral diproses
    ↓
Kota Pelabuhan
    ↓
senjata dikirim ke kerajaan lain
    ↓
konflik politik
    ↓
perang
    ↓
Benua Lumina terkena dampaknya
```

Hubungan seperti ini membuat dunia terasa hidup.

---

# 14. Lokasi Lama Harus Tetap Relevan

Jangan menganggap lokasi lama selesai selamanya setelah quest-nya selesai.

Pemain boleh kembali ke lokasi lama dan menemukan:

- NPC baru;
- perubahan lingkungan;
- informasi baru;
- konsekuensi quest;
- akses baru;
- rahasia baru;
- hubungan dengan lokasi lain;
- perubahan sosial;
- dampak perang;
- perubahan ekonomi.

Sebuah lokasi dapat memiliki **makna baru setelah pemain mengetahui informasi baru**.

---

# 15. Jangan Membuat Semua Tempat untuk Protagonis

Dunia harus terasa seperti sudah ada sebelum protagonis datang.

Penduduk harus memiliki:

- pekerjaan;
- hubungan;
- masalah;
- kebiasaan;
- sejarah;
- kepentingan;
- konflik;
- aktivitas.

Jangan membuat seluruh dunia terasa seperti NPC hanya menunggu pemain datang untuk memberikan quest.

---

# 16. Jangan Semua Konflik Berhubungan Langsung dengan Main Quest

Tidak semua masalah harus:

> "Ini terkait dengan kekuatan jahat utama."

Beberapa konflik harus benar-benar lokal.

Contoh:

- konflik antar keluarga;
- perebutan lahan;
- masalah perdagangan;
- pencurian;
- konflik antar guild;
- perselisihan desa;
- bencana alam;
- masalah sumber daya;
- konflik budaya.

Namun beberapa konflik lokal **boleh perlahan terhubung dengan cerita besar**.

---

# 17. Jangan Menggunakan Formula Map yang Sama

Hindari:

```text
Map
↓
Quest
↓
Dungeon
↓
Boss
↓
Reward
↓
Map baru
```

secara berulang.

Variasikan struktur:

```text
Eksplorasi
Investigasi
NPC
Perjalanan
Puzzle
Konflik sosial
Combat
Dungeon
Discovery
Event dunia
Boss
Konsekuensi
Revisit
```

Boss adalah klimaks, bukan kewajiban setiap lokasi.

---

# 18. Skala Dunia Harus Terasa Bertumbuh

Pada awal permainan, pemain belum perlu mengetahui seluruh Benua Lumina.

Dunia dapat dibuka secara bertahap:

```text
Desa Lumina
↓
wilayah sekitar
↓
desa lain
↓
kota
↓
jalur perdagangan
↓
pelabuhan
↓
wilayah lain
↓
benua lain
```

Tujuan desainnya adalah membuat pemain berpikir:

> "Ternyata dunia ini jauh lebih besar daripada yang saya kira."

Jangan langsung menunjukkan seluruh dunia sekaligus.

---

# 19. Jangan Takut Membuat Area Besar

Jika sebuah tempat secara desain membutuhkan ukuran besar:

**buat besar.**

Jangan mengurangi skala dunia hanya karena:

- jumlah tile banyak;
- proses pembuatan lebih lama;
- implementasi lebih kompleks;
- asset lebih banyak.

Namun ukuran besar harus mempunyai alasan.

Area besar yang kosong dan tidak memiliki aktivitas adalah masalah.

Area besar dengan:

- landmark;
- jalur;
- NPC;
- resource;
- event;
- rahasia;
- variasi medan;
- cerita lingkungan;

dapat menjadi bagian penting dari pengalaman eksplorasi.

---

# 20. Ukuran dan Kepadatan Harus Seimbang

Gunakan prinsip:

```text
Area kecil
→ kepadatan tinggi

Area besar
→ variasi + landmark + perjalanan

Kota besar
→ kepadatan sosial

Alam besar
→ eksplorasi + perjalanan

Dungeon
→ kepadatan gameplay

Lokasi rahasia
→ kepadatan misteri
```

Jangan mengisi area besar hanya dengan memperbanyak monster atau resource.

---

# 21. Setiap Lokasi Harus Memiliki Identitas yang Mudah Diingat

Setelah keluar dari suatu tempat, pemain idealnya dapat menjawab:

> "Apa yang membuat tempat itu berbeda?"

Jika jawabannya hanya:

> "Karena warnanya hijau."

berarti identitas tempat belum cukup kuat.

Identitas dapat berasal dari kombinasi:

- budaya;
- arsitektur;
- karakter;
- ekonomi;
- sejarah;
- konflik;
- musik;
- cuaca;
- flora/fauna;
- gameplay;
- legenda;
- hubungan dengan lokasi lain.

---

# 22. Prinsip Utama

**Jangan mengejar jumlah lokasi. Kejar kedalaman dunia.**

Tetapi jangan pula takut memiliki banyak lokasi.

Target yang benar adalah:

> **Banyak lokasi + masing-masing memiliki identitas + hubungan + fungsi + sejarah.**

Benua Lumina boleh memiliki puluhan lokasi jika semuanya memiliki alasan keberadaan yang jelas.

Lebih baik memiliki:

```text
20 lokasi yang saling terhubung
```

daripada:

```text
6 lokasi yang terasa seperti template
```

dan lebih baik lagi:

```text
30 lokasi
yang membentuk satu ekosistem dunia
```

daripada:

```text
30 biome yang berdiri sendiri.
```

---

# 23. Aturan untuk Agent

Sebelum menambahkan wilayah, kota, desa, dungeon, atau lokasi baru, agent harus melakukan **World Design Review**.

Evaluasi:

```text
[ ] Apa fungsi lokasi ini?
[ ] Apa identitasnya?
[ ] Mengapa lokasi ini berada di sini?
[ ] Siapa yang tinggal/beraktivitas di sini?
[ ] Apa sejarahnya?
[ ] Apa konflik lokalnya?
[ ] Apa hubungan dengan lokasi lain?
[ ] Apakah ukurannya sesuai dengan fungsi?
[ ] Apakah lokasi ini membutuhkan sub-area?
[ ] Apakah gameplay-nya berbeda dari lokasi lain?
[ ] Apakah lokasi ini memberi sesuatu yang baru kepada pemain?
[ ] Apakah lokasi lama menjadi lebih bermakna karena lokasi ini?
[ ] Apakah lokasi ini hanya filler?
```

Jika sebagian besar jawaban tidak jelas, **jangan langsung implementasikan lokasi tersebut.**

Agent harus terlebih dahulu mengusulkan desainnya.

---

# 24. Prinsip Akhir

**Legenda Lumina harus terasa seperti dunia yang memiliki kehidupan sendiri, bukan kumpulan level yang dibuat untuk menampung gameplay.**

Dunia harus terasa sudah ada sebelum protagonis datang.

Protagonis bukan pencipta dunia.

Protagonis adalah seseorang yang **perlahan menemukan dunia yang sudah memiliki sejarah, budaya, konflik, hubungan, dan rahasia sendiri.**