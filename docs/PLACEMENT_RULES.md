# Aturan Penempatan Objek & Aset (WAJIB untuk semua agent)

Dokumen ini ada karena agent sebelumnya menaruh objek sembarangan: api unggun di dekat alun-alun desa, sumur di tengah jalan, tumpukan kayu menutup pintu, batu di dalam air, dan gambar yang salah potong (potongan rumput dinamai "pohon", jalan pasir dinamai "sumur").

**Sebelum push, jalankan:**

```
node tools/check-layout.js      # harus "0 masalah"
npm run check                   # sintaks + daftar skrip + tata letak
```

Kalau ada MASALAH, perbaiki dulu. Jangan menghapus atau melemahkan aturan di pemeriksa supaya lolos.

---

## 1. Setiap objek harus punya alasan berada di situ

Sebelum menaruh objek, jawab: **siapa yang menaruhnya di dunia, dan kenapa di titik itu?**

- Api unggun ada di kemah, pos istirahat, atau alam liar, **bukan** di alun-alun desa atau kota.
- Sumur ada di halaman atau dekat rumah, **bukan** di tengah jalan.
- Tumpukan kayu ada di samping bengkel atau rumah, **tidak** menutup pintu.
- Peralatan kerja (lumpang, alat tenun, tungku) ada di dekat pemilik atau tempat kerjanya, misalnya di depan rumah pengrajin, bukan tersebar acak.
- Benda kota (tiang lampu gas, papan sasaran) tidak muncul di hutan, dan benda hutan (api unggun, tulang, jamur, akar) tidak muncul di permukiman.

## 2. Jangan menghalangi

| Larangan | Alasan |
| --- | --- |
| Objek di **jalan setapak** (`paths`) | Jalan adalah rute pemain, tidak boleh ada yang menghalangi. Taruh di **tepi** jalan (≥ setengah lebar jalan + 10 px dari porosnya). |
| Objek di **depan pintu** rumah (34 px ke bawah dari titik pintu) | Pemain tidak bisa masuk. |
| Objek di dekat **pintu keluar peta** (`exits`) | Pemain terjebak. |
| Objek **menimpa NPC** | NPC terkubur atau tak bisa diajak bicara. |
| Objek **bertumpuk** dengan objek lain | Terlihat rusak dan berkedip. |
| Objek **di dalam air** (`ponds`) | Kecuali benda air: teratai, perahu, dermaga, kerikil. |
| Objek di luar atau di tepi batas peta | Tidak terlihat atau tidak terjangkau. |

## 3. Kepadatan & ritme

- **Permukiman:** objek mengelompok per fungsi (pasar, bengkel, kebun), dengan ruang lega di antaranya. Alun-alun tetap lapang.
- **Alam:** objek interaktif jarang-jarang, sekitar 1 per layar, supaya terasa sebagai **penemuan**. Jangan menaruh 5 objek interaktif berdempetan.
- **Jangan menambah objek interaktif baru tanpa tempat yang masuk akal.** Kalau tidak yakin, usulkan dulu ke pemilik (lihat `docs/WORLD_DESIGN.md`).

## 4. Pengecualian yang disengaja

Kalau penempatan "melanggar" tapi memang disengaja oleh desain (misalnya air mancur di tengah alun-alun, pintu rumah pohon di batang pohon, atau batu yang melingkari pulau kuil di danau), beri tanda dengan **alasan yang jelas**:

```js
['fountain', 800, 640, { ok: 'air mancur di tengah alun-alun pasar' }]
```

Tanda `ok` tanpa alasan, atau dengan alasan terlalu pendek, akan ditolak pemeriksa.

## 5. Aset gambar

- **Periksa hasil potongan dengan mata sebelum dipakai.** Buat lembar kontak (perbesar 4×) dan pastikan isinya memang benda yang dimaksud. Gambar `well.png` dulu ternyata potongan jalan pasir, dan `treeWoodsBig.png` ternyata potongan rumput di air.
- Nama file harus sesuai isi gambar.
- Gambar yang salah potong dipindah ke `assets/raw/salah-potong/`, jangan dipakai.
- Setiap nama di `IMG_LIST` harus punya file di `assets/img/`, dan setiap `OBJ` yang memakai `i_<nama>` harus ada di `IMG_LIST` (pemeriksa mengecek keduanya).
- Objek gambar-kode: fungsi `art<Nama>()` dengan `mkC(w, h)`, lalu tekstur didaftarkan otomatis.
- Item baru: buat ikonnya di `ICONS_DEF` (`art/items.js`). Ikon cadangan otomatis hanya jaring pengaman.

## 6. Setelah menaruh objek

1. `node tools/check-layout.js` → 0 masalah.
2. Lihat screenshot area itu (tes Playwright atau browser), jangan hanya percaya angka koordinat.
3. Catat singkat di bagian Status `AGENTS.md`, maksimal 1 baris per fitur. Jangan menulis paragraf panjang.
