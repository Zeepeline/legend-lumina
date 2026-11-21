# Hand-off: Implementasi Efek Tebasan Penusbmic & Animasi Kombo Pedang Arka

Tanggal: 21 November 2026  
Status: **SELESAI & TERVERIFIKASI** (`npm run check` lolos, artefak & berkas Aseprite disetujui pemilik)

---

## 1. Animasi Kombo Pedang Arka di Aseprite (Versi 12-Frame Final)

- **Berkas Master Aseprite:**
  - [`assets/aseprite/arka_combo_real.aseprite`](file:///Users/herlambang/Documents/legend-lumina/assets/aseprite/arka_combo_real.aseprite) *(diedit & disetujui pemilik)*
  - [`assets/aseprite/arka_combo_prototype.aseprite`](file:///Users/herlambang/Documents/legend-lumina/assets/aseprite/arka_combo_prototype.aseprite) *(sinkron identik)*
- **Struktur 6 Layer Mandiri:**
  1. `Natural_Wind_Sparks`: Serpihan angin (*air motes*) 1px tangensial & kilatan bintang (*glint*) 1px di ujung bilah.
  2. `Hair_Dynamics`: Rambut belakang Arka yang bergerak dinamis (*phase-lagged dynamics*).
  3. `Arka_Character_Sword`: 100% Sprite Asli Arka (`hero_arka.png`) + Pedang Ksatria Baru terkunci di tangan.
  4. `Scarf_Dynamics`: Syal merah berkibar mengikuti momentum lunge dan ayunan.
  5. `Natural_Motion_Smear`: Sapuan busur polar alami (*Polar Swept Slipstream Curve*) solid `#FFFFFF`.
  6. `Shadow_Dust`: Bayangan kaki elips + kepulan debu tanah bervolume saat kaki menjejak.
- **Pedang Ksatria Baru (Deluxe Knight Longsword):**
  - Berkas: [`tools/sword_src/sword1_deluxe.png`](file:///Users/herlambang/Documents/legend-lumina/tools/sword_src/sword1_deluxe.png) ($31 \times 9\text{ px}$, jangkauan $22\text{ px}$ dari tangan).
  - Dilengkapi ujung lancip (*needle-sharp pointed tip*), pommel emas bulat, pelindung sayap emas, alur bilah (*fuller*) berkilau, dan pegangan kulit berlilit.
- **Ritme Kombo (12 Frame):**
  - **Hit 1:** *Horizontal / Diagonal Natural Slash* (Windup $\to$ Strike $\to$ Follow/Transisi).
  - **Hit 2:** *Vertical Overhead Natural Chop* (Windup $\to$ Strike $\to$ Follow/Transisi).
  - **Hit 3:** *Laminar Aerodynamic Mach Thrust* (Windup $\to$ Strike $\to$ Hold $\to$ Sheathe Recovery).

---

## 2. Upgrade Visual Efek Tebasan Utama Arka di Game

- **File Asset:** [`assets/img/vfx/vfx_swing_combo.png`](file:///Users/herlambang/Documents/legend-lumina/assets/img/vfx/vfx_swing_combo.png) ($192 \times 180$, 4 kolom $\times$ 5 baris).
- **Geometri Penusbmic (Sesuai 3 Gambar Referensi Pengguna):**
  1. **Row 0 (Hit 1 — Downward/Wide Slash):** Bentuk *faceted polygonal arc* 5 sisi (atas horizontal $\to$ diagonal $45^\circ$ $\to$ vertikal kanan $\to$ dasar horizontal).
  2. **Row 1 (Hit 2 — Diagonal Cleave):** Bentuk tebasan miring tajam (*steep dive*) menukik ke kanan-bawah.
  3. **Row 2 (Hit 3 — Wide Horizontal Sweep):** Lensa sabit meruncing ganda (*tapered crescent lens*).
  4. **Row 3 (Hit 4 / Spear — Mach Thrust):** 3 garis kecepatan horizontal lurus sejajar (*triple parallel thrust lines*) dengan panjang bertingkat.
  5. **Row 4 (Hit 5 — Heavy Overhead Finisher):** Busur tebasan raksasa membungkus kepala dengan percikan petir bercabang (*electric discharge arcs*) dan hentakan ke tanah.
- **Generator Script:** [`tools/gen_penusbmic_vfx_swing.py`](file:///Users/herlambang/Documents/legend-lumina/tools/gen_penusbmic_vfx_swing.py) & [`tools/apply_penusbmic_vfx_to_arka.py`](file:///Users/herlambang/Documents/legend-lumina/tools/apply_penusbmic_vfx_to_arka.py).

---

## 3. Animasi Kombo Bandit / Pemburu Liar di Aseprite (Versi 12-Frame Padat)

- **Berkas Master Aseprite:** [`assets/aseprite/bandit_combo.aseprite`](file:///Users/herlambang/Documents/legend-lumina/assets/aseprite/bandit_combo.aseprite) *(disetujui pemilik)*
- **Generator Script:** [`tools/create_bandit_arka_style.py`](file:///Users/herlambang/Documents/legend-lumina/tools/create_bandit_arka_style.py)
- **Style Visual:** 100% anatomi pixel art ARPG padat dan bervolume sekelas Arka (tinggi $33\text{ px}$, lebar $22\text{ px}$, bukan stickman).
- **Karakteristik Visual Bandit:** Kulit sawo matang, rambut hitam legam, ikat kepala merah lusuh (kain berkibar di layer `Headband_Dynamics`), rompi kulit cokelat tua terbuka, celana lusuh, sepatu boot.
- **Senjata:** Golok melengkung tajam (`tools/sword_src/bandit_scimitar.png`).
- **Koreografi Serangan (Liar, Brutal & Unorthodox):**
  1. **Hit 1:** *Wild Rising Hook* (sabetan menyapu dari bawah pinggul naik ke atas).
  2. **Hit 2:** *Brutal Ground Slam* (hantaman golok menghujam ke lantai dengan percikan pasir/kerikil).
  3. **Hit 3:** *Vicious Gut Stab* (dorongan bahu menerjang menusuk rendah ke perut).
- **Struktur 5 Layer:** `Bandit_Grit_Sparks`, `Headband_Dynamics`, `Bandit_Character_Weapon`, `Bandit_Motion_Smear`, `Shadow_Dust`.

---

## 4. Boss Lawan Tanding: Pendekar Ronin Siber

- **Sprite Sheet:** [`assets/img/monsters/esh_samurai.png`](file:///Users/herlambang/Documents/legend-lumina/assets/img/monsters/esh_samurai.png) ($384 \times 480$, format standar `ESH` $96 \times 80$ per frame, 4 kolom $\times$ 6 baris: `idle`, `mv`, `wind`, `atk`, `hurt`, `alert`).
- **AI Boss Khusus:** [`src/ai/samurai.js`](file:///Users/herlambang/Documents/legend-lumina/src/ai/samurai.js) (`updSamurai(e, dt, dx, dy, d, aggro)`):
  - **Paced Footwork:** Menjaga jarak taktis mengitari pemain (radius 48–65px).
  - **Lunge Strike:** Ancang-ancang dengan tanda seru (`!`) dan partikel *charge motes* $\to$ melesat menerjang dengan tebasan sabit bertenaga.
  - **Shadow Blink:** Menghilang ke dalam asap partikel $\to$ seketika muncul di belakang Arka untuk menebas balik.
  - **Phase 2 (Awakening / HP < 55%):**
    - Mengaktifkan *Ultimate Multi-Dash*: 3 kali menerjang zig-zag beruntun dengan bayangan siluet (*ghost trails*).
    - Berhenti pada pose sarungkan pedang (*Sheathe Stance*) $\to$ **KLIK!** (efek ledakan tebasan tertunda meledak di area pemain).
- **Data Musuh:** Terdaftar di [`src/data/enemies.js`](file:///Users/herlambang/Documents/legend-lumina/src/data/enemies.js) (`samurai`, HP: 540, ATK: 24, DEF: 9, SPD: 72, EXP: 350, Gold: 180-260).
- **Penempatan di Peta:** Ditambahkan di [`src/world/maps/meadow.js`](file:///Users/herlambang/Documents/legend-lumina/src/world/maps/meadow.js) di Padang Angin dekat area bukit timur ($x: 1240, y: 720$).
- **Uji Coba Cepat via Konsol:**
  ```javascript
  __game.sc.spawnEnemy('samurai', __game.sc.pl.x + 60, __game.sc.pl.y);
  ```

---

## 5. Status Integrasi Runtime Game (2026-11-21)
- **Implementasi Total Spritesheet Runtime (Non-Code Generated)**:
  - Seluruh generator stickman prosedural kode lama (`gen_humanoid_sheets.py`) untuk Pemburu Liar & Kapten telah digantikan secara permanen oleh spritesheet Chibi ARPG padat Arka:
    1. `assets/img/monsters/esh_slaver.png` (304x300, fw=76, fh=50): Bandit biasa chibi padat + golok melengkung.
    2. `assets/img/monsters/esh_slaver_captain.png` (456x480, fw=114, fh=80): Boss Kapten Pemburu berotot + kapak perang sejati (*Battleaxe*).
- **Animasi Kombo Tebasan Arka Baru (`arka_combo_real`) di Game**:
  - `tools/gen_sword_layer.py` dikalibrasi presisi dengan titik tangan `COMBO_FRAMES` dari `arka_combo_real.aseprite` -> `hero_swl0.png` & `hero_swl1.png` di-bake ulang.
  - `assets/img/vfx/vfx_swing_combo.png` diperbarui dengan motion smear sapuan pedang asli dari layer `Natural_Motion_Smear` `arka_combo_real.aseprite`.
- **Kamp Pemburu di Peta Dunia**:
  - Kamp Pemburu resmi dipasang di `src/world/maps/forest.js` klaster hutan barat (tenda, kerangkeng tawanan, gerobak, barikade) dan dihuni oleh `slaver` serta `slaver_captain`.
- **Rilis & Verifikasi**:
  - Service worker dinaikkan ke `lumina-v97`, `python3 tools/bundle.py` sukses, `npm run check` 0 masalah.
