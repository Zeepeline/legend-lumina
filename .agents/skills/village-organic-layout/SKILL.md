---
name: village-organic-layout
description: >-
  Panduan dan prinsip desain tata letak desa organik (Desa Lumina),
  penataan sumur pusat, jalan tanah meliuk alami (dirt roads),
  klaster pekarangan rumah warga, kebun samping, dan penempatan
  pepohonan rimbun beranimasi (wind sway) tanpa garis kaku.
  Gunakan skill ini setiap kali merancang, memodifikasi, atau memvalidasi
  tata letak desa dan permukiman di Legenda Lumina.
---

# Village Organic Layout & Settlement Design Skill

Panduan standar untuk merancang tata letak desa (*village / town layout*), jalan tanah alami, dan klaster permukiman organik berbasis tile RPG top-down di Legenda Lumina.

---

## 1. Prinsip Utama: Organik vs Kaku

Desa fantasi klasik yang hidup dan asri memiliki prinsip:
1. **Tidak Ada Garis Siku-Siku Kaku 90°**: Jalanan desa bukan jalan kota modern berpaving grid. Jalan setapak tanah liat (*dirt roads*) harus meliuk lembut mengikuti kontur tanah dan pekarangan alami.
2. **Pusat Desa Alami (Village Green / Pelataran Asimetris)**:
   - Titik tengah berupa **Sumur Desa bertutup genteng** (`gpt_v_village_well.png`), dikelilingi pelataran tanah tak beraturan (`discs` bertumpuk asimetris, bukan `rings` bundar sempurna).
   - Rumah-rumah warga berkelompok di sepanjang jalan utama (*street village* Eropa), bukan melingkar rata seperti diagram. Jalan bertemu di pelataran dari arah tak simetris.
3. **Pekarangan & Kebun di Samping Rumah**:
   - Lahan tani / kebun sayur (seperti kebun wortel Bu Lastri) diletakkan di **samping rumah**, bukan di tengah jalan atau memotong sirkulasi warga.
   - Pagar kayu (`fence`) membingkai kebun secara rapi dan menyisakan celah masuk.
4. **Pepohonan Membingkai Bangunan (*Foliage Framing*)**:
   - Pohon-pohon rindang (`treeA` dengan animasi *wind sway*) diletakkan di belakang dan samping bangunan untuk menciptakan kedalaman dan nuansa alami.

---

## 2. Struktur Tata Letak Desa Lumina (Kanvas 1024 × 712)

```
                       [Utara: Pohon Tetua Bram (512, 80)]
                                     |
    [NW: Pondok Kayu (180, 215)]     |     [NE: Penginapan Daun Emas (630, 213)]
    [NW: Rumah Merah (355, 213)]     |     [NE: Kios Bu Sari (746, 222)]
                  \                  |                  /
                   \             (512, 248)            /
                    \                |                /
    [W: Kebun (110, 365)] ---- [SUMUR DESA] ---- [E: Bengkel Besi (742, 411)]
    [W: Rumah Cokelat (245, 390)] (512, 345)     [E: Kandang Arka (840, 310)]
                    /                |                \
                   /             (440, 560)            \
                  /                  |                  \
    [SW: Danau Cermin & Kolam]       |       [SE: Rumah Tepi Sungai (680, 530)]
                           [S: Rumah Arka (512, 556)]
                                     |
                       [Jembatan Kayu (512, 640)]
                                     |
                       [Selatan: Hutan Lumina (y > 676)]
```

---

## 3. Sistem Jalan Tanah Alami (*Dirt Road System*)

Di `src/world/ground.js`:
```javascript
GROUND.village = {
  g: ['#427a36', '#4c8c3e', '#589c44', '#68ac4c'],
  edge: '#38682a',
  path: 'dirt', // Menggunakan palet tanah lempung hangat berkerikil
  tuft: '#346428',
  tuft2: '#7ac456'
};
```

### Konfigurasi Jalur di `src/world/maps/village.js`
- **Plaza Tengah (Cincin Tanah Mengitari Sumur)**:
  `rings: [[512, 345, 102, 84, 24]]` (sumur di 512, 345 dengan radius ring 102x84).
- **Percabangan Jalan Meliuk**:
  - Arteri Utara: `[512, 248, 526, 182, 14], [526, 182, 510, 110, 14]`.
  - Arteri Barat: `[412, 345, 350, 380, 13], [350, 380, 320, 440, 13], [320, 440, 260, 500, 13]`.
  - Arteri Timur: `[610, 305, 698, 296, 13], [698, 296, 795, 244, 13]`.
  - Arteri Selatan: `[452, 420, 408, 472, 14], [408, 472, 440, 560, 14], [512, 640, 512, 712, 16]`.
  - Setapak Penghubung Pintu Rumah: Radius 8–11 px menyambung lembut ke depan teras.

---

## 4. Penataan Pepohonan Beranimasi (*Wind Sway*)

Gunakan sprite animasi 8-frame `treeA` (`assets/img/gpt_i_treeA.png`) yang digerakkan oleh `OBJ_SPAWN.treeA` / `OBJ_SPAWN.treeOak`:
- **Aturan Kotak Tabrakan**: Batang pohon memiliki collision kecil `[10, 6, 2]`. Jarak tabrakan terhadap poros jalan harus $> \text{radius} / 2 + 2$ px agar lolos `check-layout.js`.
- **Z-Ordering & Kanopi**: Tajuk pohon yang rimbun berada di atas karakter (depth = y dasar pohon), memberi efek teduh saat berjalan di bawahnya.
- **Penyebaran Alami**:
  - Klaster NW: `(140, 110), (120, 180), (290, 95), (360, 90), (430, 95), (430, 170)`.
  - Klaster NE: `(590, 95), (660, 90), (730, 95), (800, 110), (820, 175), (880, 210)`.
  - Klaster W & Kebun: `(70, 310), (140, 290), (60, 400), (65, 480), (120, 500)`.
  - Klaster E & S: `(790, 480), (850, 460), (820, 520), (620, 590), (730, 590)`.
  - Tepi Perairan: `(230, 610), (300, 620), (460, 70), (564, 70)`.

---

## 5. Checklist Validasi Tata Letak

Setiap kali melakukan penyesuaian pada peta desa:
1. Jalankan `node tools/check-layout.js` — **wajib 0 masalah**.
2. Pastikan pintu rumah (`doors`) berjarak $\le 36$ px dari setapak agar NPC dan pemain mudah keluar masuk.
3. Area kandang (`M.ranch`) tidak boleh bersinggungan dengan pohon atau bangunan.
4. Jangan menambahkan baris kode lebih dari 160 karakter (`node tools/check-size.js`).
5. Jalankan `python3 tools/bundle.py` dan naikkan versi `sw.js` agar perubahan langsung terlihat di browser.


---

## 6. Halaman Belakang Tiap Rumah (Burgage Plot)
- Setiap rumah warga memiliki pekarangan belakang (sisi jauh dari jalan) yang fungsional dan hidup:
  - Tumpukan kayu bakar (`woodpile` / `log`), tong air (`barrel`), peti perkakas (`crate`), pot tanaman (`pot`), atau jerami (`hay`).
  - Pagar kayu (`fence`) 2–4 segmen membentuk huruf L terbuka (bukan kotak kaku tertutup).

---

## 7. Zona Fungsi Desa (GEOGRAFI §7)
- **Zona Bersih & Tenang**: Permukiman warga, penginapan, dan rumah tetua diposisikan terpisah dari sumber bising/bau.
- **Zona Bising & Kerja**: Bengkel pandai besi (`smith`), kandang hewan (`ranch`), dan penempaan ditaruh di sisi luar/tepi hilir agar asap dan kebisingan tidak mengganggu pusat desa.
- **Zona Pertanian & Perairan**: Lahan tani dan kebun ditaruh di tepian luar pekarangan dekat sumber air.
