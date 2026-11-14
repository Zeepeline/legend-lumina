# GEOGRAFI — aturan dunia, sungai, kota & penanda (Benua Lumina)

Acuan untuk semua tugas peta/bangunan/sungai. Koordinat GLOBAL = koordinat lokal + `WORLD_POS[id]` (`src/world/layout.js`).
Ringkas: (1) air mengalir dari tinggi ke rendah & sungai BERGABUNG, tidak bercabang (kecuali delta di rawa); (2) tiap wilayah punya
penanda besar & isi menarik di dekatnya; (3) kota disusun menurut fungsi, jalan bertingkat, ruang jalan cukup.

## 1. Prinsip (hasil riset game & kartografi)
- **Gravitasi & penanda (Zelda: Breath of the Wild):** penanda besar menarik pemain mendekat; hadiah/rahasia diletakkan di sekitarnya.
- **Aturan segitiga (BotW):** gundukan/batu/bukit berukuran BERAGAM menutup sebagian pandangan → rasa penasaran "ada apa di baliknya".
- **Air:** mengalir menurun ke danau/rawa/laut; anak sungai bergabung ke sungai utama; tidak membentuk lingkaran; percabangan hanya di delta datar.
- **Kota (perencanaan kota & desa ala Stardew/Pokémon):** alun-alun di tengah, bangunan menghadap jalan/alun-alun, jarak antarbangunan
  ±48–64 px (3–4 petak), fungsi menentukan letak (pandai besi dekat gerbang jalan, kebun & kandang di pinggir, penginapan di jalan utama).
- **Jalan bertingkat:** jalan utama antar-wilayah lebar (radius 14–16), jalan kampung (10–12), setapak (8–9). Setiap ujung jalan menuju sesuatu.

## 2. Peta ketinggian benua (tinggi → rendah)
| Ketinggian | Wilayah |
|---|---|
| 5 (puncak) | Puncak Beku `snow` (timur laut) |
| 4 (dataran tinggi) | Kota Lumina `kgate/kpasar/kakademi/kbawah`, Jalan Raya Lama `road` (utara) |
| 3 (padang) | Padang Angin `meadow`, peralihan `pl_meadow_snow` |
| 2 (lembah) | Desa Lumina `village`, Danau Cermin `lake` (cekungan barat) |
| 1 (dataran rendah) | Hutan Lumina `forest`, Hutan Dalam `deepwood`, Jalur Sungai Senja `river` |
| 0 (rawa/muara) | Rawa Senja `swamp` (tenggara) — ujung semua aliran |
Tebing/lereng (`ls_*_cliff`) diletakkan pada perpindahan ketinggian; jalan yang melewatinya diberi tanjakan (celah tanpa tebing).

## 3. Sistem sungai (koordinat GLOBAL, air = rangkaian elips `ponds: [cx, cy, rx, ry]` di data peta)
Rangkaian elips: jarak antarpusat ≤ 1,4 × rx agar menyambung; lebar sungai utama ry/rx 40–60, anak sungai 22–32.
**Sungai Senja (utama):** mata air (5200, 1150) di Puncak Beku → selatan, keluar tepi bawah `snow` di x≈5150 → `pl_meadow_snow` x≈5150 →
masuk `meadow` (5150, 2600), berkelok ke tenggara → keluar tepi bawah `meadow` di x≈5600 → `pl_meadow_swamp` lurus ke selatan di x≈5600 →
masuk `river` (5600, 4112) → turun ke (5600, 4712) lalu berkelok ke TIMUR → keluar tepi kanan `river` di y≈4712 → `pl_river_swamp` y≈4712 →
masuk `swamp` (7552, 4712) → **delta**: pecah menjadi 2–3 alur menuju genangan rawa (satu-satunya tempat percabangan).
**Anak Sungai Cermin:** keluar dari Danau Cermin sisi tenggara → tepi bawah `lake` di x≈2932 → masuk `forest` dari utara (2932, 4112) →
bergabung dengan sungai hutan yang sudah ada (`forest.river`, y lokal 600 = global 4712) → mengalir ke timur → `pl_forest_river` y≈4712 →
masuk `river` dari barat (4552, 4712) → **bergabung** dengan Sungai Senja di sekitar (5600, 4712).
**Penyeberangan:** tiap jalan yang memotong air: celah 32–40 px dalam rangkaian elips (arungan) dengan `pebbles` & `rock` di kedua sisi;
jalan utama boleh memakai jembatan yang sudah ada (`river.bridge` di hutan). Jangan menaruh objek/NPC/musuh di atas air.

## 4. Penanda per wilayah (pakai objek yang SUDAH ada di `OBJ`; cek `grep -n "^  nama:" src/world/objects.js`)
| Wilayah | Penanda (usulan) | Catatan |
|---|---|---|
| village | alun-alun + sumur/lampu + papan | pusat desa, jalan memancar dari sini |
| meadow | kincir angin (`windmill`) di bukit | terlihat dari jalan desa |
| snow | puncak + prasasti (`stele`) | dekat mata air Sungai Senja |
| forest | pohon terbesar/ reruntuhan di tengah | jalan setapak melingkar mendekatinya |
| river | kincir tua (sudah ada di (1800,160)) | tambahkan arungan dekatnya |
| swamp | pohon mati raksasa / reruntuhan di delta | |
| lake | pulau/kuil kecil di danau (jika objek ada) | |
| kota | menara jam (`clockworktower`) di akademi | terlihat dari gerbang |

## 5. Checklist sebelum push perubahan peta
`npm run check` 0 masalah · tidak ada objek/NPC/musuh/peti di air · pintu & jalan keluar tidak tertutup · air menyambung di tepi wilayah
(cek koordinat global kedua sisi, selisih ≤ 20 px) · ikuti `docs/PLACEMENT_RULES.md`.

## 7. Perencanaan permukiman ala city builder (TheoTown / Cities: Skylines)
Rumah tidak ditaruh sembarangan: tiap bangunan punya **fungsi (zona)**, memancarkan **pengaruh** (bising/bau/nyaman), butuh **layanan** dalam
jangkauan, dan dihubungkan **jalan bertingkat** agar arus warga (rumah→kerja→pasar) tidak macet. Data: `src/data/zoning.js` (tabel di bawah).

**Zona (warna di tampilan `?zona=1`):**
| Zona | Isi (contoh objek) | Letak |
|---|---|---|
| Hunian (hijau) | rumah warga | inti yang terlindung; dekat taman/sumur/kuil; jauh dari bising & bau |
| Dagang (biru) | toko, kios, kedai, penginapan | di jalan utama & alun-alun (butuh dilewati orang); boleh jadi **penyangga** antara kerja & hunian |
| Kerja (kuning) | pandai besi, gudang, penggilingan/kincir, tambang, penyamakan | di pinggir, dekat gerbang/jalan utama agar gerobak tidak melintasi hunian |
| Tani (cokelat) | kebun, ladang, kandang | pinggiran, berpagar, akses jalan kampung |
| Umum (ungu) | balai, kuil, akademi, pos jaga, sumur, alun-alun, taman | tersebar sesuai jangkauan layanan |
Urutan ideal dari luar ke dalam: **Kerja/Tani → Dagang/Taman → Hunian**. Pola selang-seling rumah–toko–rumah dihindari kecuali warung kecil.

**Pengaruh (radius px, diukur dari tengah bangunan):** pandai besi bising 120 · penyamakan/kandang bau 140 · penggilingan bising 100 ·
pasar/kedai ramai 80 · taman/pohon rindang nyaman 100 · kuil tenang 120. Rumah di dalam radius bising/bau = **tidak puas**.
**Jangkauan layanan (setiap rumah harus masuk):** sumur/air 220 · pos jaga/penjaga 320 · toko kebutuhan/pasar 320 · kuil/penyembuh 420 · taman/alun-alun 260.
**Jalan bertingkat (radius `paths`):** utama 14–16 (gerbang ↔ alun-alun ↔ pasar ↔ zona kerja) · penghubung 10–12 (antar-blok) · lokal 8–9 (hanya ke pintu).
Jalan lokal TIDAK boleh menjadi jalan pintas antara dua jalan utama (cegah "lalu lintas tembus" di hunian). Titik sempit yang dilewati > 6 rute
rumah→kerja NPC = macet → lebarkan atau beri jalur alternatif.
**Kepuasan rumah** = 100 − 30 (tiap pengaruh buruk) − 15 (tiap layanan tak terjangkau) + 10 (taman dalam jangkauan), batas 0–100. Target rata-rata ≥ 75.
