# BUILDING_RULES — Kaidah Baku Bangunan 3/4 Top-Down RPG Legenda Lumina

Dokumen ini menjadi standar resmi pembuatan dan pemutakhiran seluruh aset bangunan **Legenda Lumina**, mengacu pada prototipe [sp_house_proto.png](file:///Users/herlambang/Documents/legend-lumina/assets/img/buildings/sp_house_proto.png) serta kaidah klasik *Minish Cap*, *Slynyrd*, dan *Dimraeth*.

## 1. Proyeksi Kamera: High-Angle 3/4 Top-Down Oblique (*Front-Gable*)
- **Sudut kamera menukik ~45°–55° ke bawah**, selaras penuh dengan aset sumur [sp_b_well.png](file:///Users/herlambang/Documents/legend-lumina/assets/img/buildings/sp_b_well.png) dan rumah pelana depan [sp_house_proto.png](file:///Users/herlambang/Documents/legend-lumina/assets/img/buildings/sp_house_proto.png).
- **Fasad depan horizontal lurus (0°)** dan seluruh tiang/tepi dinding vertikal tegak lurus **(90°)** tanpa titik hilang.
- **Atap *Front-Gable* (Pelana Menghadap Depan):** balok bubungan utama membentang **vertikal ke atas/belakang layar** di tengah, memperlihatkan segitiga pelana depan yang diapit **dua lereng atap kiri dan kanan yang mundur ke atas** (mempertegas kedalaman top-down 3D). Untuk toko bersayap (`houseC`) dipakai variasi L/*cross-gable*, dan untuk bengkel (`blacksmith`) badan utama *front-gable* + kanopi kerja samping.
- **Larangan keras:** JANGAN memakai rotasi **isometrik 45°** (dinding bawah miring diagonal), JANGAN membuat atap *side-gable* datar dengan sudut kamera landai yang bertabrakan dengan sumur, dan JANGAN mencampur sudut kamera berbeda dalam satu wilayah.

## 2. Anti-*Mixel* & Integritas Kisi (*Texel Density*)
- Setiap bangunan WAJIB digambar pada **kanvas logis 1×**, lalu diperbesar tepat **`2×` (`Image.NEAREST`)** menjadi ukuran akhir PNG di `assets/img/buildings/`.
- Saat memproses gambar konsep AI via skrip ([tools/build_house_proto.py](file:///Users/herlambang/Documents/legend-lumina/tools/build_house_proto.py) / [tools/build_buildings_v2.py](file:///Users/herlambang/Documents/legend-lumina/tools/build_buildings_v2.py)):
  1. Hapus latar `#347A74` memakai *flood-fill* dari 4 tepi + bersihkan 1–2 px pinggiran toska.
  2. Kecilkan ke ukuran logis menggunakan **`Image.BOX`** (DILARANG memakai `LANCZOS` atau `UnsharpMask`).
  3. Binerisasi alpha (`>= 120 → 255`, sisanya `0`) dan buang piksel yatim (`< 3` px).
  4. Kuantisasi `MEDIANCUT` tanpa dither ke **`<= 24` warna** sambil mengunci warna kaca jendela & nyala api.
  5. Skala bulat `2× NEAREST` → metrik **`block_2x2` WAJIB `(1.0, 1.0)`**.

## 3. Skala terhadap `hero_mc2` (`24×48` px) & Deretan Peta
- **Jangkar skala (*Door Scale Anchor*):** tokoh utama `hero_mc2` memiliki ukuran badan terlihat `24×48` px. Tinggi bukaan/lengkung pintu bangunan wajib berkisar **`44–54` px** (`~30–34%` tinggi total bangunan 1 lantai) dengan lebar **`28–36` px** agar karakter tidak terlihat menyundul atap.
- **Pembagian vertikal:** **Atap `45–55%`** · **Dinding depan `35–45%`** · **Fondasi cobblestone `~10%`**.
- **Batas lebar untuk kota padat (`kbawah`, `dx = 118` px):** bangunan yang dipakai bersama di kota seperti `houseB` (`136×168`) dan `houseC` (`140×168`) wajib menjaga `col[0] <= 100` px agar deretan rumah `dx = 118` px tetap menyisakan gang aman bagi pemain.

| Tipe | Kanvas Logis → Akhir | `col` | `sh` | Fungsi & Identitas |
|---|---|---|---|---|
| `houseProto` | `80×84` → `160×168` | `[118, 46, 2]` | `[68, 9]` | Rumah Arka (atap terakota + gudang kayu kanan) |
| `houseA` | `72×80` → `144×160` | `[98, 44, 2]` | `[60, 8]` | Pondok warga beratap terakota + jendela loteng |
| `houseB` | `68×84` → `136×168` | `[96, 44, 2]` | `[58, 8]` | Rumah 1,5 lantai ramping atap cokelat kastanye |
| `houseC` | `70×84` → `140×168` | `[98, 44, 2]` | `[60, 8]` | Toko/Penginapan atap merah anggur + tenda merah-krem |
| `houseRed` / `houseBrown` | `74×78` → `148×156` | `[102, 44, 2]` | `[62, 8]` | Pondok jingga-karat & varian atap cokelat-zaitun |
| `blacksmith` | `82×80` → `164×160` | `[104, 46, 2]` | `[68, 9]` | Bengkel atap slate arang + tungku terbuka kanan |

## 4. Pencahayaan, Palet, & *Pixel Cluster*
- **Arah cahaya terkunci dari kiri-atas:** **lereng atap sisi kiri & depan-kiri lebih terang** dengan sorotan kuning-krem hangat, sedangkan **lereng atap sisi kanan jatuh ke nada teduh** (bayangan ungu-biru dingin).
- **Cucuran atap (*overhang*):** tepi atap pelana menjorok keluar melewati sisi kiri, kanan, dan atas segitiga dinding, membentuk **bayangan jatuh gelap ungu-cokelat** tepat di bawah balok lis miring pada dinding.
- **Atap *pixel cluster*:** gambar susunan genteng memakai 3–4 nada klaster warna lembut mengikuti arah lereng; **DILARANG menggambar garis hitam pekat mengelilingi tiap keping genteng**.
- **Outline hangat:** seluruh piksel nyaris hitam diganti ke **cokelat umber gelap `(46, 30, 34)`**.
- **Kaca jendela malam (`town_lights.js`):** setiap kaca jendela memakai 2 nada **biru-slate gelap `(44, 62, 90)` dan `(68, 92, 128)`** (`B >= R`, `L < 175`) yang terpisah tegas oleh palang kusen kayu cokelat agar menyala oranye hangat saat malam tanpa meluber ke bingkai.

## 5. Aturan Engine & Checklist QA
- Pivot sprite bangunan selalu tengah-bawah (`setOrigin(0.5, 1)`, `depth = y`).
- Kotak tabrakan `col` hanya menutup **`~28–35%` tapak dasar** (bangunan tidak boleh memblokir area atap).
- Setiap bangunan tinggi `>= 100` px wajib memiliki **`fade: 1`**, bayangan tanah **`sh`** (`sh[0] <= width`), posisi cerobong **`chim: [dx, dy]`**, serta kotak jendela di **`TOWN_WIN`** (`src/systems/town_lights.js`).
- Sebelum menganggap selesai, wajib lolos:
  1. `node tools/check-buildings.js` (`0 masalah`),
  2. `node tools/check-layout.js` (`0 masalah`),
  3. Tes visual Playwright & inspeksi gambar siang, belakang atap (*fade*), dan malam.

## 6. Templat Prompt AI Baku (*High-Angle Front-Gable*)
> Crisp 16-bit high-angle (~50-degree) 3/4 top-down oblique RPG fantasy village [DESKRIPSI BANGUNAN], matching the exact upward pitched front-gable camera perspective of the reference well and cottage: strictly horizontal 0-degree flat stone foundation along the bottom and 90-degree vertical wall posts — NO 45-degree isometric rotation, NO horizontal-ridge flat facade. Features a thick timber ridge-beam running VERTICALLY upward/backward down the center peak of a steeply pitched front-facing triangular gable roof showing BOTH left (sunlit top-left) and right (shaded) roof slopes receding upward, ~48% total height in roof, shaded in soft 3-4 tone pixel clusters WITHOUT harsh black outlines around individual shingles, overhanging gable eaves casting a thick dark purple-brown shadow band onto the top wall, warm umber dark outlines (`#2E1E22`), generous LARGE arched wooden door (~32% total height), 4-pane window with deep slate-blue glass (`#3A5272`) and wooden shutters, cobblestone foundation. Centered isolated object with generous margin on flat solid teal background (`#347A74`), no ground shadow, no grass, no text, no frame.
