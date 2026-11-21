---
name: pixellab-pixel-art-mastery
description: Panduan dan metodologi pembuatan sprite karakter, rotasi 8 arah, anatomi, color ramping, dan animasi pixel art berkualitas tinggi hasil bedah teknologi PixelLab AI v3.
---

# PixelLab Pixel Art Mastery — Panduan Standar Karakter & Animasi

Skill ini merangkum seluruh prinsip desain, anatomi, palet warna (*color ramping*), hierarki sendi (*skeleton rigging*), dan kurva animasi yang diekstrak langsung dari analisis generasi **PixelLab AI v3 & Pixminimax**.

Gunakan skill ini setiap kali merancang, menggambar dengan kode, mengevaluasi, atau mengoreksi sprite karakter Arka, NPC, maupun monster di Legenda Lumina.

---

## 1. Spesifikasi Teknis & Grid Standar

- **Ukuran Kanvas Standar:** $48 \times 48$ piksel (dapat diperluas ke $68 \times 68$ piksel untuk animasi serangan/combo agar senjata, tendangan, dan efek busur tebasan tidak terpotong tepi kanvas).
- **Ukuran Siluet Tubuh Aktif:** Lebar $22 - 26$ px, Tinggi $32 - 36$ px.
- **Sudut Pandang (*View*):** `low top-down` (~$20^\circ$ kemiringan kamera, khas JRPG 16-bit klasik seperti Chrono Trigger / Secret of Mana).
- **Proporsi Tubuh (Chibi Heroic 2.5 - 3 Head):**
  - **Kepala + Rambut:** $\sim 18$ px ($\sim 45\%$ tinggi total). Memberikan ruang untuk rambut *spiky* berdimensi dan ekspresi wajah anime yang tajam.
  - **Torso / Badan:** $\sim 10$ px ($\sim 25\%$ tinggi total). Memuat kerah jaket, rompi, dan sabuk gesper.
  - **Kaki & Celana:** $\sim 6$ px ($\sim 18\%$ tinggi total).
  - **Sepatu Bot:** $\sim 4$ px ($\sim 12\%$ tinggi total). Sol tebal menapak kokoh di tanah.

---

## 2. Aturan Palet Warna & Color Ramping (4-Tier Hue-Shifting)

PixelLab menghasilkan sprite bersih karena **TIDAK PERNAH menggunakan gradasi acak (*no dithering/no pixel soup*)**. Setiap elemen material dikunci dalam sistem **4 lapis warna bertingkat (*4-tier ramp*)** dengan pergeseran rona (*hue-shifting*):

### A. Rambut Cokelat Kastanye (Chestnut Brown)
| Tingkat | Peran | Kode Hex | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Highlight** | Pantulan cahaya atas | `#c17b2c` / `#ad6428` | Hangat kekuningan |
| **Base Tone** | Warna dasar rambut | `#77361a` | Cokelat sedang |
| **Shadow** | Bayangan lipatan helai | `#552214` | Cokelat gelap |
| **Dark Rim** | Garis batas / oklusi | `#461a11` / `#000000` | Mendekati hitam, kontur tegas |

### B. Jaket Biru Petualang (Royal Traveler Blue)
| Tingkat | Peran | Kode Hex | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Highlight** | Tepi bahu & lipatan | `#3164ab` | Biru terang kaya |
| **Base Tone** | Warna badan jaket | `#23386b` | Royal blue klasik |
| **Shadow** | Bayangan bawah ketiak/lipatan | `#203160` | Biru tua dingin |
| **Dark Rim** | Batas pakaian & sabuk | `#141b3c` | Biru malam pekat |

### C. Kulit Wajah & Tangan (Anime Flesh)
| Tingkat | Peran | Kode Hex | Karakteristik |
| :--- | :--- | :--- | :--- |
| **Light Core** | Pipi & dahi terang | `#ffe0c0` | Krem bersih |
| **Base Skin** | Wajah & jari-jari | `#f9cba0` | Warna kulit alami |
| **Shadow** | Bayangan leher di bawah dagu | `#ab834e` | Emas kecokelatan |

---

## 3. Anatomi 8 Arah Rotasi (Multi-Angle Consistency)

PixelLab menjaga konsistensi karakter di 8 arah rotasi dengan aturan hierarki berikut:

1. **South (Tampak Depan Penuh):**
   - Dada simetris, kerah terbuka membentuk huruf V.
   - Sabuk dan gesper berada tepat di tengah horizontal.
   - Kedua tangan menggantung rileks di samping paha dengan telapak terbuka ke dalam (posisi socket).
2. **South-East / South-West ($45^\circ$ Serong Depan):**
   - Pose paling dinamis untuk pergerakan ARPG top-down.
   - Bahu depan terlihat lebih lebar 2-3 px dibanding bahu belakang.
   - Hidung dan mata terlihat menyamping dengan mata belakang lebih sempit 1 px (*perspective foreshortening*).
3. **East / West (Tampak Samping Murni):**
   - Siluet hidung mancung runcing 1 px.
   - Rambut menjuntai ke belakang dengan volume tebal.
   - Dada condong ke depan, punggung sedikit melengkung.
4. **North (Tampak Belakang Penuh):**
   - Seluruh wajah tertutup rambut belakang bervolume.
   - Garis kerah melingkar di belakang leher.
   - Sabuk melintang lurus tanpa gesper depan.

---

## 4. Pola Gerak Animasi Dasar & Siklus Berjalan

### A. Siklus Nafas Diam (Breathing Idle — 4 Frame)
- **Frame 0 (Rest):** Posisi tubuh dasar.
- **Frame 1 (Inhale):** Torso naik $+1$ px, bahu sedikit melebar, lengan terangkat $0.5^\circ$.
- **Frame 2 (Peak):** Puncak nafas tertahan, ujung rambut belakang bereaksi naik $+1$ px (*secondary motion*).
- **Frame 3 (Exhale):** Torso dan kepala turun kembali ke posisi Frame 0.

### B. Siklus Berjalan (Walking Gait — 4 Frame)
- **Frame 0 (Contact 1):** Kaki kanan melangkah ke depan, kaki kiri menjulur ke belakang. Lengan kanan mengayun ke belakang, lengan kiri ke depan.
- **Frame 1 (Passing / Recoil):** Badan turun $-1$ px (*drop step*), kedua kaki berpapasan di tengah.
- **Frame 2 (Contact 2):** Kaki kiri melangkah ke depan, kaki kanan menjulur ke belakang. Lengan kiri mengayun ke belakang, lengan kanan ke depan.
- **Frame 3 (High Point):** Badan naik $+1$ px saat kaki belakang mendorong tanah (*push-off*).

---

## 5. Pola Gerak Tempur & Rangkaian Multi-Hit Combo (Combat Mastery)

### A. Kuda-Kuda Siap Tempur (Fight Stance Idle — 8 Frame)
- Posisi kaki lebih melebar dibanding idle santai.
- Lutut ditekuk $2$ px lebih rendah untuk kestabilan (*low center of gravity*).
- Ritme pernafasan memantul berulang (*bouncy martial bob*) pada interval 120 ms per frame.
- Kedua telapak tangan diangkat sejajar dada/perut, siap mencabut senjata atau merespons serangan.

### B. Struktur Rantai Combo 10-Gerakan (32 - 40 Frame Flurry)
Rantai kombo spektakuler tidak hanya mengulang ayunan pedang yang sama, melainkan memadukan **variasi gerak fisik (*momentum sequencing*)**:

| Urutan Gerakan | Tipe Serangan | Perubahan Fisik & Efek Visual |
| :---: | :--- | :--- |
| **1 - 2** | **Double Slash** | Ayunan silang ganda (diagonal turun lalu menyapu naik). |
| **3** | **Straight Thrust** | Kaki menerjang lurus, bilah menusuk horizontal (*piercing line*). |
| **4** | **High Martial Kick** | Kaki depan diangkat menendang tinggi, pedang ditahan di pinggang belakang. |
| **5** | **Spinning Backslash** | Putaran badan $360^\circ$ dengan busur tebasan sabit raksasa (*crescent arc*). |
| **6** | **Rising Uppercut** | Tebasan memotong dari bawah ke atas, mengangkat tubuh musuh. |
| **7** | **Aerial Jump Slash** | Melompat ke udara, membelah ke arah bawah (*downward vertical drop*). |
| **8** | **Roundhouse Kick** | Tendangan memutar menyapu area depan. |
| **9 - 10** | **Finishing Ground Slam** | Hantaman dua tangan ke tanah dengan gelombang angin kejut (*shockwave burst*). |

**Kaidah Efek Visual Tebasan (*Slash Trail / Arc*):**
- Warna busur tebasan: Inti putih terang (`#ffffff`), lapisan kedua biru muda cerah (`#60a5fa` / `#93c5fd`), dan tepi luar biru pekat (`#1d4ed8`).
- Ketebalan busur: 2-3 piksel padat melengkung, meruncing di kedua ujungnya.
- Efek tebasan hanya muncul pada frame ayunan tercepat (durasi 70-80 ms), lalu menghilang pada frame tumpuan/recovery.

---

## 6. Kaidah Emas Socket Senjata (Zero-Floating Rule)

1. **Jangan Membakar Senjata ke Sprite Tubuh:** Sprite karakter harus selalu memiliki telapak tangan/sarung tangan kosong (*empty glove socket*).
2. **Handle Intersect:** Gagang pedang harus digambar menembus sumbu tengah kepalan tangan.
3. **Finger Clamp:** Minimal 2-3 baris piksel jari tangan harus digambar **DI ATAS** gagang pedang (*overlapping layer*).
4. **Zero Gap Crossguard:** Pelindung tangan (*crossguard*) harus menempel persis (jarak 0 piksel) pada sisi atas kepalan tangan.
