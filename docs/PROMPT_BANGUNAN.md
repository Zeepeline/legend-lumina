# Prompt gambar bangunan (gaya referensi rumah pemilik)

Acuan gaya: `assets/img/buildings/ref_house_small.png` & `ref_house_big.png` — pixel art, garis tepi gelap tegas,
dinding plester krem berkerangka kayu cokelat tua, fondasi batu abu-abu, atap genteng slate, daun jendela kayu,
**sudut pandang 3/4 agak dari atas** (bidang atap terlihat luas), satu bangunan di tengah, **latar polos satu warna**.

Pasang hasilnya: kirim gambar ke sesi Claude, atau jalankan
`python3 tools/import_building.py <gambar> <tekstur>` (latar & bingkai dibuang otomatis, ukuran kanvas mengikuti tekstur).

## Templat (salin, ganti bagian [ ... ])

> Pixel art game RPG top-down, satu bangunan: [DESKRIPSI]. Gaya sama persis dengan gambar referensi rumah terlampir:
> garis tepi gelap tegas, plester krem dengan kerangka kayu cokelat tua, fondasi batu abu-abu, atap genteng slate,
> daun jendela kayu. Sudut pandang 3/4 sedikit dari atas sehingga atap/bagian atas terlihat jelas, cahaya dari kiri atas.
> Bangunan utuh di tengah, tidak terpotong, tanpa tanah/rumput/bayangan di sekitarnya, latar polos warna toska rata
> (#347A74), tanpa teks, tanpa bingkai. Rasio gambar [RASIO].

(Lampirkan juga gambar referensi rumah saat membuat prompt.)

## Daftar bangunan

| Tekstur (untuk import) | Deskripsi | Rasio |
|---|---|---|
| `academy` | Akademi sihir besar 2 lantai: dinding plester berkerangka kayu, lantai bawah batu, atap slate biru besar, menara jam di tengah dengan panji biru, pintu ganda besar di tengah dengan tangga batu, banyak jendela berdaun | 4:3 lebar |
| `i_market` | Kios pasar kayu: 4 tiang, tenda kain bergaris merah-krem (atap tenda terlihat dari atas), meja papan penuh buah & sayur, peti kayu di samping | 4:3 lebar |
| `well` | Sumur desa: cincin batu bulat berisi air, dua tiang kayu, atap slate kecil berpelana, engkol, tali & ember | 1:1 |
| `windmill` | Badan kincir angin TANPA baling-baling: menara bulat plester berkerangka kayu, kaki batu, atap kerucut slate, pintu & jendela kecil, poros kayu di bagian atas depan | 3:4 tegak |
| `blades` | Baling-baling kincir saja (4 lengan kayu berlayar kain krem berkisi), menghadap depan, poros di tengah | 1:1 |
| `shrine` | Kuil/titik teleport: panggung batu bulat datar dengan lingkaran rune bercahaya toska, dua tiang lentera batu beratap slate kecil | 16:9 lebar |
| `i_fountain` | Air mancur alun-alun: kolam batu bulat bertingkat dua, air biru, pancuran di puncak | 1:1 |
| `gatehouse` | Gerbang kastil kota: dua menara batu beratap slate runcing, gapura lengkung dengan pintu kayu besar, panji biru | 3:2 lebar |
| `cwall` | Satu ruas tembok kota batu dengan merlon (bergerigi) di atas | 1:1 |
| `ctower` | Menara tembok kota bulat dari batu, atap slate runcing | 2:3 tegak |
| `i_houseA` / `i_houseB` / `i_houseC` | Ganti rumah A (atap merah) / B (atap cokelat, bersayap) / C (toko atap merah dengan tenda) | 1:1 |
