# Daftar Aset Sungai & Hutan Isometrik 2.5D yang Dibutuhkan

Daftar ini melengkapi aset yang belum ada di `docs/TASKS_GPT_ISO.md` agar tampilan sungai alami, pulau mini, dan hutan isometrik di game menyamai referensi visual yang disetujui.

---

## 1. Elemen Tengah Sungai (Batu Kali & Pulau Mini)
- [ ] **Batu Kali Berfaset + Lumut (`river_boulder_moss.png`)**
  - **Ukuran target:** `24×20 px` dan `16×14 px` (2–3 varian).
  - **Catatan visual:** Sudut isometrik 2:1, sisi gelap tegas `#242b33`, faset abu-biru `#647382` / `#94a6b8`, lumut hijau di puncak, dan pinggiran air cyan terang `#4ad9e2` di bagian dasar.
- [ ] **Klaster Kerikil Sungai (`river_pebble_cluster.png`)**
  - **Ukuran target:** `16×12 px`.
  - **Catatan visual:** 3–4 batu kecil menyembul dari air dangkal dengan riak cyan tipis di sekelilingnya.
- [ ] **Alang-Alang & Ekor Kucing / Cattails (`river_reeds_clump.png`)**
  - **Ukuran target:** `18×28 px`.
  - **Catatan visual:** Untuk ditanam di **pulau pasir mini tengah sungai** dan tepi sungai berpasir.
- [ ] **Teratai & Bunga Lotus Berbunga (`river_lotus_cluster.png`)**
  - **Ukuran target:** `24×18 px`.
  - **Catatan visual:** 2–3 daun teratai hijau (`#6ac445` / `#418824`) dengan 1 bunga putih krem (`#fff8e8`) berpusat kuning di sudut tenang sungai.

## 2. Animasi Permukaan & Tepian Air
- [ ] **Lembar Kilau Air & Riak Pendek (`water_shimmer_sheet.png`)**
  - **Ukuran target:** 4 frame @ `16×8 px`.
  - **Catatan visual:** Kilau bintang `+` dan goresan riak pendek cyan-mint (`#9efcf9` / `#b8fffe`) — *bukan* garis panjang — untuk efek arus mengalir.
- [ ] **Busa Ombak Tepian Bergerigi (`water_shore_foam.png`)**
  - **Ukuran target:** 3 frame @ `16×10 px`.
  - **Catatan visual:** Busa putih-cyan tipis (`#9efcf9`) yang berdenyut di batas air dan pasir basah.

## 3. Vegetasi & Hutan Isometrik 2.5D (*Understory & Canopy*)
- [ ] **Semak Bawah Hutan (*Understory Shrubs*, `iso_bush_1..3.png`)**
  - **Ukuran target:** `24×18 px` (3 varian rendah).
  - **Catatan visual:** Dipakai algoritma `scatter_iso.js` di **zona jarak pandang selatan** (depan jalan/sungai) dan di bawah kanopi pohon besar agar tidak menghalangi karakter.
- [ ] **Pohon Rindang Isometrik dengan Tajuk Terpisah (`iso_tree_canopy.png` & `iso_tree_trunk.png`)** *(opsional untuk efek Canopy Fade-Out)*
  - **Ukuran target:** `64×88 px`.
  - **Catatan visual:** Memisahkan batang + bayangan dasar dari tajuk daun agar saat Arka berjalan di belakang pohon, hanya tajuk daunnya yang memudar (`alpha 0.4`), sementara batang tetap solid.

---

> [!TIP]
> Untuk **jembatan kayu/batu isometrik** dan **tebing batu berundak**, spesifikasinya sudah tercatat di `docs/TASKS_GPT_ISO.md` (`I030`, `I035`, `I036`).
