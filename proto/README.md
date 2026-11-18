# Prototipe isometrik (terpisah dari game utama)

Buka `iso.html` (lokal: `python3 -m http.server 8000` → http://localhost:8000/iso.html; live: https://zeepeline.github.io/legend-lumina/iso.html).
Tidak memakai kode `src/` sama sekali dan tidak dimuat `index.html`, jadi game utama tidak terpengaruh.

- `iso_core.js` proyeksi 2:1 (logika dunia kartesius → layar), masukan joystick/tombol/keyboard (WASD, J serang, K guling).
- `iso_art.js` ubin belah ketupat & rumah isometrik prosedural gaya Senja Emas, tekstur efek.
- `iso_map.js` Desa Lumina versi isometrik 40×40 ubin: dataran tinggi + tebing + tangga, alun-alun, jalan, kolam, ladang, rumah, pohon.
- `iso_actors.js` Arka (kombo 3 dengan langkah maju & hit-stop, guling i-frame) dan serigala (mengitari, ancang-ancang dengan cincin di tanah,
  menerjang, jeda pulih; hanya satu serigala menyerang sekaligus).
- `iso_scene.js` scene, urutan kedalaman (rumah relatif pemain), tembus pandang, efek, suara berlapis WebAudio, HUD, gelombang serigala.
- `iso_fantasy.js` sentuhan dunia fantasi (`docs/DUNIA_FANTASI.md`): Kristal Utama + sinar + batu melayang di akar Pohon Induk, kristal kecil,
  bunga lentera, lentera kristal, debu cahaya, dan tanah rusak + kristal retak ungu + duri di sarang serigala.

## Dunia terbuka isometrik (bawaan `iso.html`)
- Semua wilayah luar ruang menyatu di posisi global mode benua (`maps/world.json` dari `node tools/export_iso_world.js`); wilayah dimuat saat
  Arka ≤700 px dan dibuang saat >1500 px (`ISO_LOAD`/`ISO_DROP`). Pintu antar wilayah luar diabaikan (menyambung langsung); gua/dalam ruangan = halaman `?peta=<id>`.
- **Desa Lumina = denah prototipe** (`buildProto`): titik 0 dunia = pojok denah 640×640 di dalam kotak desa asli (geser 192, 36); tanah bertingkat
  (`zAt` hanya di dalam denah), rumah & alun-alun prototipe, lahan pengisi berhutan + 3 jalan ke Danau/Hutan/Padang. Jembatan otomatis (`bridges`).
- Cuaca: `__iso.cuaca("hujan")` / `__iso.cuaca("cerah")` di konsol, atau `iso.html?cuaca=hujan`.
- Kamera zoom ×0,62, gaya lembut (`bakeGroundSoft` + `softScene`; rumput wilayah lain diganti tekstur gnd_grass lewat `lushGrass`), hutan lebat di tepi dunia (`forestRing`).

## Peta asli game dalam isometrik
- `iso.html` / `iso.html?peta=<id>` membuka **peta asli game** (21 peta luar: desa, hutan, padang, gua, rawa, salju, danau, jalan raya, 4 distrik kota,
  hutan dalam, sungai, 7 jalur penghubung `pl_*`). Pilih peta lewat menu kanan atas; pintu antar peta berfungsi. Desa prototipe lama: `?peta=proto`.
- `iso_world.js` (`IsoWorld`): lantai top-down asli + tempelan tanah dipanggang lalu diproyeksikan 2:1 per potongan 2048 px; objek asli di posisi
  terproyeksi (origin/skala/flip sama); tembok persegi asli (kisi 64 px) untuk tabrakan; pintu → `?peta=<tujuan>&x=&y=`. Musuh sementara = serigala.
- Data: `node tools/export_iso_maps.js [id ...]` (server di :8010) → `proto/iso/maps/<id>.json`, `<id>_ground.webp`, `tex/*.png`, `index.json`.
  Ekspor ulang setelah peta game berubah.
