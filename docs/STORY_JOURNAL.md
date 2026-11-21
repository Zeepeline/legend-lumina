# Jurnal & Catatan Diskusi Cerita — Legenda Lumina

> Dokumen ini dikelola bersama antara pemilik proyek dan **Story Agent**.
> Berisi catatan ide, riset narasi, keputusan plot, rancangan bab baru, dan draf dialog sebelum diimplementasikan ke kode game (`src/data/story.js`, `src/data/quests.js`, `src/npc/`, dll).
>
> **Aturan Tetap:**
> - Ikuti prinsip 3 lapis tujuan (Immediate, Mid-term, Long-term) dari `docs/GAME_DESIGN.md`.
> - Jaga konsistensi dengan `docs/BENUA_LUMINA.md` dan `docs/DUNIA_FANTASI.md`.
> - **Jangan pernah membahas atau membocorkan isi `docs/SPOILER_ENDING.md` dengan pemilik.**

---

## Ringkasan Status Cerita Saat Ini (Baseline)

- **Status Narasi**: **RESET KE TITIK 0 (BLANK CANVAS)**
  - Seluruh skenario cerita lama (Bab 1–5, Morgath, Kryos, patok, mimpi buruk akar, arsip Akademi) dan dialog interaksi lama telah dinonaktifkan / dihapus total dari kode permainan.
  - Dunia game saat ini beroperasi dalam mode **Sandbox Eksplorasi Bebas** tanpa quest lock dan tanpa dialog otomatis yang memblokir pemain.
  - Membuka lembaran baru yang benar-benar bersih bagi pemilik dan Story Agent untuk merancang alur cerita, dialog, dan skenario baru dari awal.

---

## Log Diskusi & Keputusan Cerita

*(Entri diskusi baru akan dicatat di bawah ini oleh Story Agent)*

### [2026-11-21] Pembuatan Aset Visual Baru untuk Prolog & Bab 1
- **Status**: SELESAI DIIMPLEMENTASIKAN DI KODE
- **File Kode**: `src/art/story_props.js`, `index.html`, `src/gfx/textures.js`, `src/world/objects.js`, `src/world/spawn/spawn_2.js`.
- **Daftar Aset Baru**:
  1. `mila_grave`: Makam pohon Mila dengan nisan kayu sederhana bertali pita merah dan taburan bunga liar.
  2. `ruined_shack`: Gubuk reyot Arka di awal (atap bocor, dinding papan lapuk dan miring sebelum direnovasi).
  3. `slaver_cage`: Kerangkeng kayu berlumpur dengan pintu rantai dan gembok kuningan kusam.
  4. `prisoner_wagon`: Gerobak pengangkut tahanan berterali jeruji besi/kayu di atas dua roda besar.
  5. `slaver_tent`: Tenda kanvas compang-camping markas kapten pemburu budak dengan tambalan kulit kasar.
  6. `slaver_barricade`: Pancang kayu runcing menyilang bertali rotan untuk barikade pertahanan sarang.
  7. `reflection_spring`: Mata air pegunungan jernih alami di lereng bebatuan tepi sungai untuk momen penamaan Arka.
  8. `burnt_ruin`: Puing balok kayu arang hitam sisa lumbung terbakar dengan sisa bara api menyala.
  9. `mud_tracks`, `dropped_torch`, `cloth_scrap`: Properti pelacakan jejak di hutan (alur roda gerobak amblas, obor padam jatuh, sobekan kain berdarah).
- **Interaksi Objek**: `mila_grave`, `reflection_spring`, dan `slaver_cage` dilengkapi dialog inspeksi saat didekati pemain.

### [2026-11-20] Reset Total Seluruh Skenario & Dialog Lama (Clean Slate)
- **Status**: SELESAI DITERAPKAN DI KODE
- **Keputusan Pemilik**: Menghapus seluruh dialog dan skenario dalam sejarah game/proyek ini. Benar-benar mengulang dari 0 agar tidak ada logika lama yang saling tumpang tindih, tidak ada dialog penjaga/prolog yang berulang atau memblokir layar, dan pemain dapat bergerak bebas.
- **Implementasi Kode**:
  1. `src/npc/dialog.js`: Seluruh switch case dialog cerita lama dihapus. Interaksi NPC biasa kini menggunakan sapaan ringan mengambang (`popWorld`), sementara toko/bengkel/penginapan tetap fungsional.
  2. `src/systems/chapter4.js` & `src/systems/chapter5.js`: `storyTalk` dan `ch5Talk` dinonaktifkan.
  3. `src/systems/prolog.js` & `src/systems/scene_nav.js`: Seluruh event dialog otomatis (`guardStop`, `spawnProlog`, dll.) telah dibersihkan.
  4. `src/data/quests.js`: Semua stage misi lama diubah menjadi mode eksplorasi bebas tanpa tanda panah pembatas.
  5. `src/ui/widgets.js`: Kotak dialog `say()` dilengkapi tombol tutup langsung (✕) dan responsif terhadap tombol aksi.

### [2026-11-19] Inisiasi Story Agent & Jurnal Cerita
- **Status**: Sistem Siap
- **Ringkasan**: Agent khusus narasi (`story_agent` / `story-architect`) resmi dibentuk untuk mendampingi pemilik dalam berdiskusi, merancang babak cerita selanjutnya, menyusun dialog emosional, serta mencatat setiap kesepakatan plot secara rapi dan berkelanjutan.

### [2026-11-19] Perombakan Asal-Usul MC: Survival & Struggle di Awal Cerita
- **Status**: SELESAI DIIMPLEMENTASIKAN KE KODE (v1.49.2)
- **File Kode**: `src/systems/prolog.js`, `src/core/state.js` (`newState()`), `src/ui/title.js`, `src/data/items.js` (`branch`, `cloth_torn`, `bread_mila`), `src/data/quests.js`.
- **Konsep Inti**:
  1. **Bukan Pahlawan Sejak Awal**: Tokoh utama adalah seorang buruh/budak kasar yang melarikan diri atau jatuh ke sungai berarus deras hingga hanyut jauh ke hilir.
  2. **Terdampar Sendirian (No Rescue)**:
     - Dia **tidak ditemukan oleh siapa pun**. Bangun sendirian dalam kondisi basah kuyup, memar, dan kedinginan di bebatuan tepi sungai.
     - Tidak ada kamar hangat atau tabib yang menyambut. Semua dimulai dari titik terendah.
  3. **Amnesia & Sistem Penamaan Karakter**:
     - MC tidak mengingat namanya sendiri saat siuman.
     - **Momen Penamaan Terpilih**: Bukan langsung di detik pertama bangun. MC harus melewati ujian survival awal terlebih dahulu (mengatasi dingin, lapar, dan bahaya rimba). Saat menemukan mata air/telaga kecil yang jernih untuk membersihkan darah dan lumpur di wajahnya, ia menatap pantulannya di permukaan air.
     - Di momen hening refleksi itu, muncul kilasan bisikan suara samar masa lalu yang memanggil sebuah nama. Di titik inilah pemain menginput/menentukan nama karakter (default: Arka).
  4. **Unsur "Struggle" di Awal Permainan (Gameplay & Narasi Selaras)**:
     - **Fisik Lemah & Dingin**: Langkah kaki awal terseok-seok, pandangan sedikit buram sesaat, stamina sangat cepat habis jika memaksakan diri.
     - **Improvisasi Alat Bertahan Hidup**: Tidak punya pedang atau tameng besi. Menggunakan dahan kayu patah (*wooden branch*) dan batu kali untuk mengusir predator liar tepi sungai (ular rawa/hewan buas kecil) atau membuka semak berduri.
     - **Kebutuhan Dasar**: Mengumpulkan buah liar/jamur hutan atau membasuh luka dingin untuk mengembalikan sedikit stamina dan HP.
  5. **Transisi Menuju Desa Lumina**:
     - Dari lereng bukit/tebing setelah mata air jernih, MC melihat kepulan asap cerobong dari kejauhan (Desa Lumina).
     - **Reaksi Warga**: Di batas desa/ladang, warga atau penjaga bersikap waspada dan curiga melihat sosok orang asing berpenampilan compang-camping dengan bekas luka belenggu di tangannya.
     - **Membuktikan Diri Lewat Kerja Kasar**: MC tidak langsung dielu-elukan. Ia diizinkan berteduh sementara di gubuk tua kosong yang rusak (calon Rumah Arka) dengan syarat harus membantu pekerjaan kasar desa: memotong kayu, membersihkan ladang dari hama, atau membantu angkat beban.
     - Dari keringat dan kerja keras inilah MC perlahan diterima oleh warga desa, membangun ikatan emosional, dan melatih ketangguhan fisiknya.

### [2026-11-19] Desain Awal Permainan: Kehidupan Membumi & Pengenalan Fitur (Grounded Pacing)
- **Status**: Disepakati
- **Prinsip Pacing Awal**:
  1. **Tanpa Bencana Akbar / Kristal Sakti di Awal**:
     - Di desa **tidak ada peristiwa besar yang heboh** (tidak ada monster raksasa menyerang mendadak, tidak ada ledakan kristal suci).
     - Alur cerita berjalan membumi (*grounded / slice-of-life survival*), berfokus pada adaptasi manusia biasa yang mencoba hidup damai.
  2. **Pengenalan Fitur Utama Terintegrasi Cerita**:
     - **Menebang Pohon (*Logging*)**: Mengumpulkan kayu bakar dan bahan papan untuk menambal atap dan dinding gubuk yang bocor.
     - **Bercocok Tanam (*Farming*)**: Mengolah petak tanah tandus di samping gubuk untuk menanam benih sayur/umbi sebagai cadangan pangan mandiri.
     - **Berburu & Meramu (*Hunting & Gathering*)**: Memasang perangkap atau memburu hewan kecil (kelinci hutan/ayam liar) serta memetik jamur liar di tepi hutan untuk bahan makanan dan memasak.
     - **Memancing (*Fishing*)**: Memancing di tepi sungai desa yang tenang untuk santapan malam.
  3. **Ikatan Emosional yang Tumbuh Alami**:
     - Pemain benar-benar merasakan kedamaian dan kehangatan desa lewat rutinitas harian yang menenangkan.
     - Hubungan dengan warga (Lina, Bram, pandai besi, dll.) terjalin lewat interaksi wajar bertetangga, bukan karena MC dipuja sebagai penyelamat.
     - Ketika kelak di kemudian hari ada keanehan kecil yang mengancam ketenangan ini, pemain secara emosional terdorong untuk melindunginya karena desa itu adalah hasil jerih payahnya sendiri.

### [2026-11-19] Titik Balik Krisis: Serbuan Pemburu Budak di Malam Badai (The Ruthless Raid)
- **Status**: Disepakati (Arah Gelap / Dark Fantasy)
- **Suasana & Pemicu**:
  - Terjadi setelah beberapa hari MC menikmati kehidupan damai di desa (sudah bertani, menambal atap gubuk, dan akrab dengan warga).
  - Malam hari saat hujan badai lebat dan guntur menggelegar, meredam suara langkah kaki para penyusup.
- **Peristiwa Serbuan**:
  - Desa diserang oleh komplotan bersenjata: **Pemburu Liar (Outlaw Slavers / Bandit Liar)** yang beroperasi di perbatasan hutan dan lembah liar.
  - Alasan memilih pemburu liar: Memberikan **ruang perkembangan bertahap bagi MC** (skala ancaman dimulai dari gerombolan liar jalanan yang realistis, sebelum kelak menyentuh faksi besar).
  - Mereka menyerang saat hujan badai malam, membakar lumbung hasil panen, menjarah ternak, dan memperlakukan warga desa seperti mangsa tak berdaya.
- **Kematian Karakter yang Berdampak (Emotional Death - Anak Kecil Desa)**:
  - Korban tewas adalah **seorang anak kecil desa yang polos dan yatim piatu** (misal: "Mila" / bocah kecil yang selama hari-hari awal setia mampir ke kebun samping gubuk MC membawakan roti sisa atau buah hutan, dan selalu tersenyum memanggil MC *"Kakak"*).
  - Saat badai dan jeritan terjadi, anak kecil ini berlari ketakutan mencari perlindungan ke arah MC di tengah kobaran api.
  - Sebelum MC sempat meraih tangannya, salah satu pemburu liar membabat/menikamnya tanpa belas kasihan hanya untuk menyingkirkannya dari jalan.
  - Anak itu roboh di lumpur berdarah, menghembuskan napas terakhir di pelukan MC yang membeku dalam duka dan amarah yang tak terhingga.
- **Pertarungan Hidup-Mati Pertama MC**:
  - Trauma masa lalu MC sebagai mantan budak bertabrakan langsung dengan kenyataan pahit: *ia tidak bisa lari dari kekejaman dunia.*
  - MC mengambil alat kerja kasarnya (kapak penebang kayu atau sabit ladang), menerjang para pemburu budak dalam pertempuran berdarah (*Souls-lite combat* melawan musuh manusia berpedang).
  - MC membunuh pemburu budak untuk pertama kalinya dengan tangannya sendiri, lalu merebut pedang besi pertama miliknya dari jasad musuh.
- **Dampak Pasca Serbuan (Aftermath & Call to Action)**:
  - Penyerang yang tersisa kabur ke kegelapan, berhasil menyeret dan menculik beberapa pemuda/gadis desa dalam belenggu rantai.
  - Desa hancur terbakar, rintihan duka warga menggema di tengah air hujan.
  - MC menyadari bahwa sekadar sembunyi dan hidup pasif tidak akan pernah memberinya kedamaian.
  - **Tujuan Nyata Lahir**: Mengejar rombongan pemburu liar itu ke perkemahan tersembunyi mereka di hutan/lembah, membebaskan warga yang diculik, dan membalaskan dendam darah anak kecil yang tak berdosa.

### [2026-11-19] Babak Pemakaman & Awal Pengejaran: Sumpah di Bawah Pohon (The Burial & The Vow)
- **Status**: Disepakati
- **Adegan Pemakaman Personal (Emotional Weight)**:
  - Di pagi yang dingin berselimut kabut dan abu sisa kebakaran, MC **menggali liang kubur dengan tangannya sendiri** di bawah pohon rindang di tepi batas desa.
  - MC membaringkan jasad anak kecil tersebut, menimbunnya dengan tanah basah, dan menancapkan sebilah nisan kayu sederhana atau batu kali sebagai penanda makam.
  - MC mengambil kenang-kenangan kecil (pita rambut / kain berdarah peninggalan anak itu) lalu mengikatkannya di pergelangan tangannya—tepat menutupi bekas luka belenggu besi perbudakannya.
  - Simbolisme: Pergelangan tangan yang dulu diikat rantai kepasrahan, kini diikat pita janji pelindung dan keadilan.
- **Tekad Memburu (The Pursuit Begins)**:
  - MC tidak menunggu bantuan atau membiarkan warga desa yang tua dan terluka menanggung beban ini.
  - Berbekal pedang besi rampasan dari pemburu budak yang ia bunuh semalam dan insting bertahan hidup di alam liar, MC melangkah meninggalkan desa seorang diri.
  - Misi utama babak ini: **Melacak jejak roda gerobak, patahan ranting, dan bekas darah** para pemburu liar yang mengarah ke hutan lebat dan ngarai bebatuan.

### [2026-11-19] Babak Pengejaran & Penyerbuan Sarang Pemburu Liar (The Slaver Hideout)
- **Status**: Disepakati Penuh (Final Blueprint Prolog & Bab 1 Baru)
- **Struktur Alur Gameplay & Narasi**:
  1. **Fase Pelacakan Hutan (*Tracking Phase*)**:
     - MC menyusuri hutan lebat yang basah berkabut pasca-badai.
     - Melacak jejak fisik: bekas roda gerobak yang amblas di lumpur, dahan patah, obor padam, dan ceceran kain warga.
     - Ancaman predator liar (serigala/anjing hutan) yang terpicu bau darah di jalan setapak.
  2. **Pos Pengintai Terluar (*The Slaver Outpost*)**:
     - Pos jaga kecil berisi 2–3 pemburu liar di sekitar api unggun perbatasan ngarai.
     - Menguji mekanik *stealth sneak attack* atau duel *Souls-lite* menjaga stamina dan jarak serang.
     - Dari pos ini, MC mengamankan kunci jeruji atau peta kasar menuju perkemahan utama mereka.
  3. **Benteng / Sarang Utama (*The Slaver Camp / Rocky Gorge*)**:
     - Berada di lembah batu tersembunyi / reruntuhan galian tambang tua.
     - Warga desa yang diculik dikurung di dalam kandang kayu/besi berlumpur, bersiap dipindahkan.
  4. **Boss Pertama: Pemimpin Pemburu Liar (*The Slaver Captain*)**:
     - **Profil**: Manusia kejam berotot kekar, beringas, bersenjata kapak berat dua tangan atau cemeti berduri.
     - **Dialog/Sikap**: Menghina MC sebagai "budak rongsokan yang berani lari dan sok jadi pahlawan".
     - **Pola Pertarungan (*Souls-lite*)**: Serangan ayunan berat bertenaga dengan jeda pemulihan (*punish window*) yang jelas untuk digulingi, cambukan jarak menengah, dan tendangan pendobrak.
  5. **Pembebasan & Penutup Babak 1**:
     - Mengalahkan sang pemimpin, membebaskan warga desa dari belenggu.
     - Di tenda pemimpin, MC menemukan dokumen kontrak upeti / daftar pesanan budak bertanda segel khusus, memberi petunjuk awal bahwa ada faksi penguasa yang lebih besar di luar sana.
     - MC memandu warga desa yang selamat kembali ke Desa Lumina, disambut haru dan rasa hormat tulus dari seluruh penduduk desa. MC kini bukan lagi "orang asing yang dicurigai", melainkan bagian tak terpisahkan dari desa.
