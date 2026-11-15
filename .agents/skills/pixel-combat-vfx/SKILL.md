---
name: pixel-combat-vfx
description: >-
  Panduan dan alur kerja pembuatan animasi serangan jarak dekat (Melee Slash, Multi-Hit
  Combo, Charge Attack, Ground-Wind Shockwave, dan On-Hit Impact Burst) bergaya pixel-art
  action RPG (ala Godot battle VFX). Gunakan skill ini setiap kali membuat, merevisi,
  atau mengintegrasikan aset VFX pertarungan, ayunan senjata, kombo, atau charge attack.
---

# Pixel-Art Combat VFX & Weapon Choreography Skill

Gunakan skill ini saat merancang atau mengimplementasikan efek visual pertarungan (**Melee Slash**, **Multi-Hit Combo**, **Charge Attack**, **Ground-Wind**, dan **On-Hit Impact Burst**) agar terasa tajam, organik, dan menyatu secara fisik dengan gerakan karakter serta senjata.

---

## 1. Aturan Emas: Sebab-Akibat Fisik (*Physical Cause & Effect*)

1. **VFX Adalah Akibat dari Senjata, Bukan Objek Mandiri**:
   - Urutan kausalitas wajib:
     $$\text{Postur Tubuh} \longrightarrow \text{Titik Genggam Tangan } (hx, hy) \longrightarrow \text{Lintasan Bilah } (\theta_{\text{start}} \to \theta_{\text{end}}) \longrightarrow \text{Jejak Udara (Whiff)} \longrightarrow \text{Semburan Benturan di Titik Luka (On-Hit)}$$
2. **Dilarang Menaruh Efek Tanpa Sebab**:
   - **Jangan** menaruh efek angin atau debu acak di belakang punggung/kepala karakter jika senjata tidak melewati area tersebut.
   - **Jangan** memunculkan busur tebasan pada frame *Windup* (ancang-ancang) sebelum senjata benar-benar bergerak mengayun.
   - **Jangan** membuat efek seperti proyektil bulan sabit yang terbang menjauh dari karakter (*No Ranged Projectile Appearance*).
3. **Bentuk Siluet Organik & Tajam (*Silhouette-First Crisp Pixels*)**:
   - Gunakan **piksel putih murni (`#FFFFFF`)** dengan tepi tajam (*crisp hard pixels*, `Image.NEAREST`) untuk menguji bahasa animasi siluet terlebih dahulu (warna/tint ditambahkan kemudian di engine).
   - **Jangan** menggunakan poligon segitiga/kotak lurus yang kaku (`polygon` bersudut lurus) atau gambar AI beresolusi tinggi yang di-*downscale* (menghasilkan *blur/pillow-shading*).
   - Gunakan kurva organik meruncing (*Quadratic Bézier tapered wisps* dan persamaan sapuan sudut polar).

---

## 2. Pemisahan Mutlak: *Whiff (Tebas Angin)* vs *On-Hit (Kena Musuh)*

Jangan pernah menggabungkan busur ayunan pedang dengan ledakan benturan besar dalam satu gambar statis. Pisahkan menjadi **2 sistem independen**:

### A. Lapis 1 — Jejak Sapuan Bilah (*Weapon Swing Smear* / `vfx_swing_combo.png`)
- **Kapan Muncul**: Selalu muncul setiap kali senjata diayunkan (baik menebas udara kosong maupun mengenai target).
- **Anatomi Fisik**:
  - Merupakan udara yang baru saja dibelah oleh bilah pedang dari sudut awal $\theta_{\text{start}}$ menuju sudut saat ini $\theta_{\text{end}}$ dengan poros di tangan $(hx, hy)$.
  - **Ekor Belakang ($u = 0$)**: Meruncing tipis di $\theta_{\text{start}}$.
  - **Tepi Depan ($u = 1$)**: Bagian paling tebal **wajib menempel 100% rapat di sepanjang bilah pedang pada posisi $\theta_{\text{end}}$**.
  - **Fase Peluruhan (*Decay $\to$ Sparks*)**: Ekor awal menguap searah gerakan menuju ujung bilah, menyisakan pita tipis lalu 2–3 percikan kecil.

### B. Lapis 2 — Semburan Benturan Musuh (*Directional On-Hit Burst* / `vfx_hit_impact.png`)
- **Kapan Muncul**: **HANYA** dipicu saat bilah senjata benar-benar mengenai hitbox musuh (`hitFx(e, crit)`).
- **Anatomi Fisik**:
  - **Enemy White Hit-Flash**: Sprite musuh berkedip putih murni (`setTintFill(0xffffff)`) selama `55–65 ms` bersamaan dengan *hitstop*.
  - **Titik Asal & Vektor Arah**: Semburan muncul tepat di titik kontak bilah dengan tubuh musuh, dan menyembur keluar mengikuti **vektor arah gaya sabetan pedang** (miring ke kanan-bawah saat tebas turun, terangkat ke kanan-atas saat sabet naik, lurus mendatar saat tusukan, atau menyapu tanah saat *Finisher*).

---

## 3. Koreografi Postur Karakter & Penguncian Tangan (*Hand-Locked Weapon*)

1. **Siklus Postur Tubuh (`pl.atkPose`)**:
   - Karakter tidak boleh diam membeku di satu frame selama menyerang.
   - Sikluskan postur:
     - **Windup (`0–35 ms`)**: `side1` (menarik kuda-kuda) atau `side3` (untuk sabetan balik).
     - **Active Lunge & Impact (`35–125 ms`)**: `side2` (badan membungkuk rendah menerjang maju + dorongan fisik `lunge`).
     - **Follow-Through (`125–195 ms`)**: `side3` sebelum kembali ke `side0` (*idle*).
2. **Penguncian Gagang di Tangan (`hx, hy`)**:
   - Gagang pedang dan poros busur tebasan dikunci pada koordinat telapak tangan karakter (mis. `(15, 19)` pada kanvas `20×26` `side2`), ditambah piksel kepalan tangan di atas gagang agar senjata terlihat benar-benar digenggam.

---

## 4. Desain *Multi-Hit Combo* (5 Serangan Beruntun)

Rancang setiap tahap kombo dengan kontras arah ayunan, kecepatan, dan bentuk siluet:

| Tahap | Nama Serangan | Sudut Ayunan ($\theta_{\text{start}} \to \theta_{\text{end}}$) | Bentuk Jejak Bilah (`vfx_swing_combo`) | Vektor *On-Hit Impact* |
|---|---|---|---|---|
| **Hit 1** | *Downward Diagonal Slash* | `-85° → +22°` | Busur melengkung dari kanan-atas ke kanan-bawah | `+24°` (kanan-bawah) |
| **Hit 2** | *Upward Reverse Slash* | `+58° → -48°` | Sabetan balik melengkung dari kanan-bawah ke kanan-atas | `-34°` (kanan-atas) |
| **Hit 3** | *Wide Horizontal Sweep* | `-42° → +8°` | Sapuan mendatar melebar (`rx_scale = 1.22`) | `+4°` (mendatar) |
| **Hit 4** | *Piercing Lunge Thrust* | `0°` (tusukan lurus `+9 px`) | Selubung kompresi udara kerucut *Mach* di sepanjang bilah | `0°` (tembus lurus) |
| **Hit 5** | *Heavy Overhead Finisher* | `-95° → +32°` | Busur tebasan tebal dari atas kepala menghantam ke tanah | `+18°` (*Heavy Burst*) |

---

## 5. Desain *Charge Attack* (Gelombang Angin Tanah Meluas & Tebasan Putar 360°)

1. **Fase Menahan Tombol (*Expanding Ground-Wind Shockwave*)**:
   - **Tubuh Karakter Tetap Bersih**: Karakter merendahkan kuda-kuda (`side1`) dengan pedang ditarik ke pinggang belakang (`-145°` s/d `-152°`, bilah menyala putih dengan kilatan `+` di ujungnya saat *charge* penuh). **Jangan** menutupi tubuh/kepala dengan pilar vertikal.
   - **Aset Angin Tanah yang Meluas (`vfx_charge_spin` Frame `0..2`)**:
     - Hanya gelombang angin di tanah tepat di bawah kaki yang **semakin meluas secara radial ke kiri-kanan semakin lama tombol ditahan**:
       - *Hold Awal (`< 0.32s`)*: Cincin angin kecil di kaki (`radius ~12 px`).
       - *Hold Sedang (`0.32–0.62s`)*: Gelombang angin melebar (`radius ~21 px`) dengan ekor angin melengkung naik di ujung kiri-kanan.
       - *Hold Lama (`> 0.62s`)*: Gelombang angin meluas lebar (`radius ~34 px` + `scaleX` terus bertambah hingga `1.55×`) dengan cincin lapis kedua di bagian dalam.
2. **Fase Pelepasan (*360° Spiral Cleave & Sequential Hit Timing*)**:
   - **Sabetan Awal (*Release Whip*)**: Pedang menyabet area depan lebih dulu $\rightarrow$ musuh di depan langsung terkena tebasan pada `0 ms`.
   - **Putaran Penuh (*360° Cyclone Peak*)**: Karakter memutar badan (`flipX`) menyapu punggungnya $\rightarrow$ jejak bilah membentuk pusaran elips 360° (`rx = 1.28, ry = 0.78`), dan musuh di belakang terkena tebasan `70 ms` kemudian sesuai urutan lewatnya bilah pedang.
   - Radius dan damage tebasan 360° ikut membesar (`hMul` hingga `1.4×`) sebanding dengan lamanya pemain menahan tombol.

---

## 6. Fisika & Anatomi Partikel Sekunder (Hasil Studi `pixelfx`)

Koreografi tubuh dan ayunan bilah utama wajib mengikuti aturan di Bagian 1–5, sedangkan untuk **efek partikel sekunder** (percikan baja, serpihan angin, debu lantai, bara, dan serpihan benturan), gunakan 10 prinsip fisika & anatomi partikel dari `patch-gg/pixelfx`:

1. **`SPARK` (Percikan Benturan Baja — *Two-Tone Velocity Streak & Floor Bounce*)**:
   - **Bentuk**: Garis kecepatan 2-warna sepanjang vektor gerak $(u_x, u_y)$ dengan panjang proporsional terhadap laju $L = \min(9, 1 + v \cdot 0.022)$ (bukan titik bulat 1×1).
   - **Warna**: Kepala ($45\%$ depan) berwarna panas (`#ffffff` $\to$ `#fff3a6`), ekor ($55\%$ belakang) berwarna lebih dingin (`#ff8a2a` $\to$ `#f2561d`).
   - **Fisika**: Meluncur cepat ($150\text{–}400\text{ px/s}$), gravitasi sedang ($g = 420\text{ px/s}^2$), *air drag* ($2.2/\text{s}$), dan **memantul saat menyentuh lantai** ($v_y \leftarrow -0.45 |v_y|$, $v_x \leftarrow 0.7 v_x$).
2. **`MOTE` (Serpihan Angin Bilah / *Blade Shavings*)**:
   - Terkelupas (*flung off*) dari tepi luar busur ayunan pedang (`r = R_outer`) searah tangen ayunan + sentrifugal keluar; digambar sebagai garis tipis memanjang tanpa gravitasi ($g = 0$, *drag* ringan $0.6/\text{s}$), kepala terang dan ekor `55%` lebih redup.
3. **`DOTTED TRACE` (Jejak Residu Dither di Ekor Tebasan)**:
   - Saat busur tebasan (*smear*) menyusut pada fase *Decay*, tinggalkan deretan titik-titik tipis (`1 px`) tepat di garis keliling luar lintasan ujung pedang (`R_outer - 0.5`) yang terurai lewat *Ordered Bayer 4×4 Dither*.
4. **`STREAK` (Garis Hisap Konvergensi saat *Charge / Windup*)**:
   - Muncul di radius luar ($14\text{–}26\text{ px}$) lalu **dipercepat masuk** menuju titik fokus senjata ($v \leftarrow v + 3v \cdot dt$), dengan ujung depan putih tajam dan ekor bergradasi.
5. **`GRIT` (Kerikil Kecil / *Hot Chips* yang Berhenti di Tanah)**:
   - Terpental dengan gravitasi penuh ($g = 950\text{ px/s}^2$), memantul sekali di tanah ($v_y \leftarrow -0.25 v_y$), lalu **berhenti diam di permukaan tanah ($v_x = v_y = 0$)** selama beberapa milidetik sebelum menghilang. Digambar `1×1` atau `2×2` dengan sisi bawah lebih gelap (`0.7×`).
6. **`SHARD` & `CHUNK` (Serpihan Tajam & Bongkahan Batu Berfaset yang Berputar)**:
   - Memiliki sudut rotasi $\theta$ dan kecepatan putar $\omega$ ($\theta \leftarrow \theta + \omega \cdot dt$). Digambar dengan **pencahayaan 3-sisi** (sisi kiri-atas `light`, tengah `body`, sisi bawah-kanan `shade`, plus `1 px` *dark outline* `#1a1422`), dan memicu 1–2 kepulan `DUST` kecil saat mendarat.
7. **`EMBER` (Bara Mengambang dengan Turbulensi Sinus)**:
   - Bergerak naik perlahan ($v_y = -30\text{ px/s}$) sambil meliuk organik dengan gelombang sinus ganda ($v_x \mathrel{+}= \cos(2.3t + \text{seed})\cdot 45\,dt$, $v_y \mathrel{+}= \sin(3t + \text{seed})\cdot 20\,dt$) dan berkedip (*flicker*) menjelang padam.
8. **`SMOKE` & `DUST` (Kepulan Asap/Debu 3-Lapis Bervolume)**:
   - Digambar di layer belakang (`back`) menggunakan **3 cakram transparan bertumpuk**: cakram dasar, inti bawah yang lebih pekat (`0.74r`), dan **tudung atas yang terkena cahaya (`lit cap`)** saat kepulan masih muda (`age < 0.5`).
9. **`BROKEN RING` (Cincin Kejut yang Retak Menjadi Busur Sabit)**:
   - Cincin kejut (*shockwave ring*) retak terbelah menjadi 5–7 segmen busur sabit dengan celah (*gap*) yang makin melebar dan ujung yang meruncing.
10. **`BLADE GLINT / SPARKLE`, *Ordered Bayer Dither*, & Larangan Percikan Api pada Hit Fisik Biasa**:
    - Munculkan kilau bintang 4-lengan (`CROSS` + `DIAG` dengan inti `WHITE` 1px) di awal/akhir sabetan pedang.
    - **Jangan** memunculkan percikan api kuning/oranye/merah (`sparkle('spark'/'doto')` atau `SPARK` api) saat tebasan senjata fisik biasa mengenai musuh (`hitFx`) — cukup gunakan *White Hit-Flash* + semburan benturan putih `vfx_hit_impact` + `MOTE`/`DOTTED TRACE` pada ayunan bilah.
    - **Jangan** memudarkan partikel keras (`MOTE`, `SHARD`, `GRIT`, `DOTTED TRACE`) dengan *alpha blend* halus yang membuat piksel kabur; gunakan **4×4 Ordered Bayer Dither**.

---

## 7. Prinsip Animasi & *Smear Interpolation* ala `t3ssel8r`

Berdasarkan studi video devlog `t3ssel8r` (*"Making an Animation for my 3D Pixel Art Game"* — `youtu.be/1FrIBkuq0ZI`):

1. **Cylindrical / Polar Smear Mesh (`4:05 smear interpolation`)**:
   - Jangan menginterpolasi pedang secara linear di antara dua frame (yang menyebabkan *chord clipping* menembus badan atau gerak lambat).
   - Interpolasikan posisi gagang (*Hilt*) dan ujung pedang (*Tip*) dalam **koordinat polar mengelilingi poros bahu/tubuh**, lalu rentangkan **jaring pita *Smear* (*Swept Quad Fan*)** yang menghubungkan lintasan $(\text{Hilt}(u), \text{Tip}(u))$ dari $\theta_{t-1}$ hingga menempel rapat di bilah pada $\theta_t$.
   - **Lompatan *Snappy***: Aksi tebasan besar melompat langsung dari **Pose Windup Ekstrem** ke **Pose Ekstensi Penuh + Smear Sabit** dalam 1 langkah tajam.
2. **Rantai Kinematika Tubuh & *Counter-Balance* (`4:47 animation second pass`)**:
   - **Coiling**: Lutut menekuk rendah, torso memuntir ke belakang, senjata ditarik jauh ke belakang bahu.
   - **Center-of-Mass Shift & Whip Chain**: Kaki tumpuan dan titik pusat massa bergeser maju **mendahului** ayunan tangan ($\text{Kaki} \to \text{Pinggul} \to \text{Bahu} \to \text{Siku} \to \text{Tangan} \to \text{Pedang}$).
   - **Counter-Balance Arm & Overshoot**: Tangan bebas (kiri) terentang ke belakang sebagai penyeimbang saat tangan kanan menebas ke depan, disertai sedikit *overshoot* sebelum *settle*.
3. **Secondary Motion / Overlapping Action (`6:03 secondary motion and tweaks`)**:
   - Jubah, syal, dan rambut bergerak dengan **fase tertinggal (*phase-lagged second-order dynamics*)**: berkibar ke belakang saat badan menerjang maju (*lunge*), dan **masih mengayun sedikit ke depan (*overshoot whip*)** selama 1–2 frame saat tubuh berhenti mendadak di akhir tebasan.

---

## 8. Prosedur Wajib: *Preview First* Sebelum Mengubah Kode Game

Setiap kali diminta membuat atau merevisi VFX:
1. Buat skrip Python (`PIL.Image`) untuk menghasilkan spritesheet PNG dan merender **2 file preview**:
   - **GIF Animasi Berdampingan** (*Kolom Kiri: Tebas Angin / Whiff* vs *Kolom Kanan: Kena Musuh / On-Hit Impact*) dengan `Image.NEAREST`.
   - **Lembar Breakdown Puncak (*Peak Frame Sheet*)** yang menampilkan tiap tahap secara berurutan.
2. Tampilkan ke pengguna di dalam artifact markdown (`RequestFeedback: true`) dan tunggu persetujuan sebelum mengedit file game (`src/systems/combat_fx.js`, `src/gfx/textures.js`, dll.).

