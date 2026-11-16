# Audit Keseimbangan & Kurva Level (T493)

Dokumen ini berisi hasil analisis kurva perkembangan level (EXP) pemain dan laju perolehan EXP dari musuh di tiap wilayah Benua Lumina.

---

## 1. Rumus Kebutuhan EXP Naik Level
Rumus kebutuhan EXP pemain (`src/core/state.js:94`):
$$\text{need}(lv) = 12 \cdot lv + 6 \cdot (lv - 1)^2$$

| Dari Level | Ke Level | EXP Dibutuhkan | Kumulatif EXP dari Lv 1 |
|:---:|:---:|:---:|:---:|
| 1 | 2 | 12 | 12 |
| 2 | 3 | 30 | 42 |
| 3 | 4 | 60 | 102 |
| 4 | 5 | 102 | 204 |
| 5 | 6 | 156 | 360 |
| 6 | 7 | 222 | 582 |
| 7 | 8 | 300 | 882 |
| 8 | 9 | 390 | 1272 |
| 9 | 10 | 492 | 1764 |
| 10 | 11 | 606 | 2370 |
| 11 | 12 | 732 | 3102 |
| 12 | 13 | 870 | 3972 |

---

## 2. Tabel Audit Kurva Level per Wilayah

*Catatan: 1 Kunjungan dihitung membersihkan semua musuh standar di wilayah tersebut sekali putaran.*

| Wilayah | Rekomendasi Level | Jumlah Musuh | EXP Rata-rata / Musuh | Total EXP per Kunjungan | Target Bab Berikutnya | EXP Naik ke Target | Estimasi Kunjungan | Evaluasi Alur |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---|
| **Hutan Lumina** (`forest`) | Lv 3 | 30 | 15.4 EXP | 461 EXP | Lv 4 (Hutan Dalam) | 60 EXP | **0.13 kunjungan** | ⚠️ Terlalu mudah (< 1) |
| **Hutan Dalam** (`deepwood`) | Lv 4 | 18 | 21.0 EXP | 378 EXP | Lv 5 (Padang Angin) | 102 EXP | **0.27 kunjungan** | ⚠️ Terlalu mudah (< 1) |
| **Padang Angin** (`meadow`) | Lv 5 | 24 | 28.1 EXP | 674 EXP | Lv 7 (Gua Batu) | 378 EXP (Lv 5→7) | **0.56 kunjungan** | ⚠️ Cepat (< 1) |
| **Jalan Raya Lama** (`road`) | Lv 6 | 15 | 22.3 EXP | 335 EXP | Lv 7 (Gua Batu) | 222 EXP | **0.66 kunjungan** | Seimbang / Transisi |
| **Gua Batu** (`cave`) | Lv 7 | 16 | 45.6 EXP | 730 EXP | Lv 8 (Rawa Senja) | 300 EXP | **0.41 kunjungan** | ⚠️ Cepat (< 1) |
| **Rawa Senja** (`swamp`) | Lv 8 | 17 | 46.6 EXP | 792 EXP | Lv 10 (Puncak Beku) | 882 EXP (Lv 8→10) | **1.11 kunjungan** | ✅ Ideal (1 - 2) |
| **Danau Cermin** (`lake`) | Lv 8 | 7 | 32.9 EXP | 230 EXP | Lv 10 (Puncak Beku) | 882 EXP | **3.83 kunjungan** | ⚠️ Terlalu grind (> 3) |
| **Puncak Beku** (`snow`) | Lv 10 | 17 | 41.3 EXP | 702 EXP | Lv 12 (Kota Lumina) | 1338 EXP (Lv 10→12) | **1.91 kunjungan** | ✅ Ideal (1 - 2) |

---

## 3. Temuan Kunci
1. **Danau Cermin (`lake`) Terlalu Sedikit Musuh / Grind Tinggi:**
   * Di `lake`, hanya ada 7 musuh dengan total 230 EXP per sapuan. Jika pemain hanya mengandalkan Danau Cermin untuk bersiap ke Puncak Beku/Kota Lumina, butuh hampir 4 kali bolak-balik (3.83 kunjungan).
2. **Awal Permainan (`forest` & `deepwood`) Terlalu Cepat Naik Level:**
   * Satu kali jalan di Hutan Lumina memberikan 461 EXP, padahal untuk naik dari Lv 3 ke Lv 4 hanya butuh 60 EXP. Pemain langsung melesat ke Lv 5–6 sebelum menyelesaikan Bab 1.
3. **Puncak Beku (`snow`) & Rawa Senja (`swamp`) Sudah Sangat Pas:**
   * Rasio kunjungan berada di rentang 1.1 hingga 1.9 kunjungan untuk mencapai level tantangan berikutnya (tidak grind membosankan, namun tetap menantang).

---

## 4. Usulan Penyesuaian (Untuk Diputuskan Pemilik / Claude)
*(Sesuai instruksi T493, data `src/data/enemies.js` tidak diubah langsung dalam tugas ini).*

1. **Danau Cermin (`lake`):**
   * Tambahkan 3–4 monster air/rawa di pesisir selatan (misal: +3 `frog` / `wisp`) atau naikkan drop exp ikan monster, sehingga total EXP Danau Cermin mendekati ~450 EXP per kunjungan (rasio turun ke ~2 kunjungan).
2. **Kepadatan Hutan Lumina (`forest`):**
   * EXP Slime (4 EXP) sudah bagus, namun jumlah musuh (30 ekor) membuat total EXP awal membengkak. Alternatif: kurangi 5–8 musuh non-esensial di jalur utama desa agar Arka tidak overleveled sebelum menginjak Padang Angin.
3. **Kurva Need Level Menengah:**
   * Rumus $12 \cdot lv + 6 \cdot (lv-1)^2$ terasa sangat landai di Lv 1–4. Bisa dipertimbangkan penyesuaian dasar ke $18 \cdot lv + 8 \cdot (lv-1)^2$ jika ingin tempo awal lebih berbobot.
