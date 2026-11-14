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

## 6. Status Implementasi Geografi (Gelombang 8 T332–T360)
- **Sistem Sungai Senja & Anak Sungai:** Aliran air kontinu dari hulu mata air Puncak Beku (`snow`), lereng (`pl_meadow_snow`), membelah Padang Angin (`meadow`), Dataran Senja (`pl_meadow_swamp`), Jalur Sungai Senja (`river`), hingga muara delta Rawa Senja (`swamp`). Dilengkapi Anak Sungai Cermin dari Danau Cermin (`lake`) melintasi Hutan Lumina (`forest`) dan menyatu di konfluensi Sungai Senja.
- **Tata Letak Permukiman:** Alun-alun sentral Desa Lumina dengan hierarki jalan (arteri 14–16, kampung 10–12, setapak 8–9) dan klaster fungsi teratur (bengkel, kandang, penginapan).
- **Kota Lumina:** Gerbang simetris megah (`kgate`), pasar niaga padat (`kpasar`), distrik akademi berwibawa (`kakademi`), labirin gang sempit Kota Bawah (`kbawah`), serta pos kafilah Jalan Raya Lama (`road`).
- **Eksplorasi & Ekologi:** Penanda visual utama (BotW gravity) di tiap wilayah, hadiah eksplorasi dalam radius 120 px, aturan segitiga gugus batu penghalang pandang, konsistensi flora bioma, dan tebing undakan elevasi bertingkat dengan celah tanjakan bebas hambatan.

## 7. Tata kota & desa abad pertengahan (prinsip city builder, wujud medieval)
Prinsipnya diambil dari city builder (TheoTown / Cities: Skylines): **fungsi menentukan letak**, pengaruh buruk dijauhkan, layanan terjangkau,
jalan bertingkat. Tapi WUJUDNYA abad pertengahan. Kota medieval tidak punya peraturan zonasi. Kota tumbuh alami mengelilingi kuil, pasar,
gerbang dan sungai. Perajin sejenis berkumpul dalam satu gilda, dan usaha berbau didorong ke pinggir atau ke hilir. Data: `src/data/zoning.js`.

**Yang TIDAK dipakai (terlalu modern):** grid kotak-kotak; zona hunian murni terpisah dari toko; taman kota sebagai pusat; jalan lurus semua.

**Kawasan (warna di tampilan `?zona=1`):**
| Kawasan | Isi (contoh objek) | Letak |
|---|---|---|
| Rumah-toko (hijau) | houseA–D + kios/papan toko di depan; penginapan, kedai | **berderet rapat di sepanjang jalan utama**; toko di bawah, tinggal di atas |
| Gilda perajin (kuning) | anvil, forge, bellows, potterswheel, woodenloom, crafttable | satu **jalan/gang khusus** per kerajinan ("Gang Pandai Besi"), dekat pasar/gerbang |
| Usaha kotor (cokelat) | penyamakan, pencelupan, jagal, kandang, hay, windmill (bising) | **di luar tembok atau di hilir sungai**, searah angin menjauh dari kota |
| Tani (cokelat muda) | ladang, kebun, fence, hay, kandang ayam/babi | di luar tembok/pinggir desa; kebun kecil boleh di halaman belakang rumah |
| Pusat umum (ungu) | kuil/shrine/altar, alun-alun pasar (market, fountain/well), balai gilda, bell, board | **inti kota**: kuil + pasar berdampingan di pertemuan jalan utama |
| Pertahanan (abu) | cwall, gatehouse, pos jaga, brazier/lamp | tembok mengelilingi inti; gerbang di ujung tiap jalan utama |
| Kawasan atas (emas) | rumah besar, akademi, rumah bangsawan | tanah **lebih tinggi** (utara benua: Kota Lumina/Akademi), lebih lega & tenang |

**Kavling memanjang (burgage plot):** tiap rumah di jalan utama = kavling sempit-panjang (lebar 56–80 px menghadap jalan, dalam 140–200 px).
Depan: pintu/kios menempel jalan (≤ 24 px). Belakang: halaman berisi 1–3 dari sumur, woodpile, barrel/crate, kebun kecil, kandang ayam, jemuran.
Gang belakang (radius 8) boleh menyusuri ujung kavling. Ini yang membuat kota terasa padat dan hidup tanpa menaruh rumah sembarangan.

**Pola jalan:** jalan utama (radius 14–16) dari **tiap gerbang ke alun-alun pasar**; nama jalan = nama gerbang ("Jalan Gerbang Timur").
Alun-alun pasar berbentuk **baji/segitiga atau melebar** di pertemuan jalan, bukan kotak sempurna. Jalan penghubung (10–12) dan gang (8–9) **berliku**
(belok tiap 120–200 px, lebar tak seragam). Gang boleh buntu ke halaman; gang tidak boleh menjadi jalan pintas antara dua jalan utama.
Jembatan/arung di tempat sungai menyempit; pasar sering dekat jembatan.

**Pengaruh (radius px):** pandai besi bising 120 · penyamakan/pencelupan/jagal/kandang bau 140 (bau mengalir ke **hilir**: radius ×1.5 ke arah aliran) ·
kincir bising 100 · pasar/kedai ramai 80 (baik untuk toko, buruk bila tepat di sebelah rumah kawasan atas) · kuil tenang 120 · pohon rindang/halaman 60 nyaman.
**Layanan (setiap rumah harus masuk):** sumur 220 · pos jaga/penjaga malam 320 · pasar/toko 320 · kuil/shrine 420 · kedai 360.
Kota besar: **tiap distrik punya kedai dan shrine sendiri** (Pasar, Akademi, Kota Bawah masing-masing).
**Kepuasan rumah** = 100 − 30 (tiap pengaruh buruk) − 15 (tiap layanan tak terjangkau) + 10 (halaman belakang berisi) + 5 (dekat kuil), batas 0–100.
Target rata-rata ≥ 75; kawasan atas ≥ 85; Kota Bawah boleh 60–70 (miskin & padat itu cerita, asal tetap terlayani sumur & penjaga).

**Desa vs kota:** desa = tanpa tembok batu (pagar kayu), satu jalan utama + alun-alun kecil dengan sumur & shrine, rumah renggang dengan halaman besar,
ladang langsung di belakang. Kota = tembok + gerbang, rumah-toko berdempet, ≥ 1 gang gilda, usaha kotor di luar tembok/hilir.
