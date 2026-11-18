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
