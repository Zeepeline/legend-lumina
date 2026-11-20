# HANDOFF — Tampilan isometrik di game utama

Pemilik memilih: tampilan isometrik dipasang DI GAME UTAMA (bukan prototipe), supaya semua fitur ikut. Saklar `?iso=1` (diingat
`localStorage.lumina_iso`), `?iso=0` mematikan. Prototipe terpisah tetap di `iso.html` + `proto/iso/` (acuan gaya: desa, pohon alami, angin).

## Tahap 1 (selesai, v1.49.0) — `src/systems/isoview.js`
- Kamera World/GL: matriks proyeksi 2:1 (`Camera.prototype.preRender`), `worldView` = kotak dunia terlihat, zoom ×`ISO_ZOOM` (.72).
- Objek tegak (depth > −5e5): selama render diputar −45° & diskala (0,707; 1,414), dipulihkan setelah render; depth + x (iso).
- Objek layar (scrollFactor 0): kompensasi penuh. Partikel tidak dikompensasi (posisi tetap terproyeksi).
- `Input.vec()` layar → dunia; kamera tanpa batas peta saat iso. Ruang dalam/judul tetap top-down.

## Aset Ubin Isometrik & Ketinggian (19-11-2026) — `proto/iso/`
- Ubin rumput belah ketupat 2:1 (`I023`, `assets/img/iso/tiles/grass_00`..`15`).
- Ubin jalan batu / paving alun-alun 2:1 (`I025`, `assets/img/iso/tiles_stone/stone_00`..`15`).
- Balok elevasi tebing batu (`I029`, `assets/img/iso/blocks/block_00`..`15`, tangga batu `cliff_stairs`, tanjakan, pantai air).
- Lembar komposit in-game `assets/img/iso/iso_tileset_32x16.png` ($128 \times 240$: baris 0–3 rumput murni, baris 4–7 auto-tile batu 16 arah, baris 8–11 auto-tile jalan tanah 16 arah dari `I024`, baris 12–13 variasi tengah padat batu & tanah, baris 14 overlay 4 sudut dalam rumput).
- Auto-tiling terarah 4-sisi + 4-sudut (`tools/build_iso_autotiles.py`, `proto/iso/iso_art.js`, `proto/iso/iso_map.js` via `roadMask` & `tileVariant`): pinggiran rumput hanya muncul pada sisi ubin jalan yang menyentuh rumput (`NE/SE/SW/NW`), sudut dalam ditambal bersih, ubin rumput bebas dari petak tanah acak, dan masker `inDia` padat menghilangkan celah kisi putih 1 px antar ubin.
- Pembersihan sambungan (*seam cleaning*): halo magenta dihapus, outline AI dipangkas (*inward sampling*), dan tepian belah ketupat `inDia` dibuat rapat tanpa garis grid pemisah.
- Integrasi dunia terbuka penuh (`proto/iso/iso_world.js` & `iso_map.js`): `buildProto` di dunia terbuka kini memakai tileset rumput, jalan batu (pusat desa) + jalan tanah (jalur luar), dan tangga baru yang mencakup 100% seluruh wilayah Desa Lumina ($1024 \times 712$, kisi ubin diperluas dari $40 \times 40$ menjadi $67 \times 49$ ubin: $tx \in [-13..53], ty \in [-4..44]$), meniadakan sisa kanvas hijau polos di pinggiran desa. Jalan keluar menuju Padang, Danau, dan Hutan tersambung rapi.

## Sisa (urut prioritas)
1. Malam & cahaya (`camStep` night/dark: titik hapus memakai `L.x - scrollX` top-down) → proyeksikan posisi lampu.
2. Arah hadap Arka/serangan: `pl.dir` dari vektor dunia → sprite menghadap diagonal; pertimbangkan arah dari vektor layar.
3. Bidik/ketuk (`Input.aim`, pointer → dunia) belum dikonversi.
4. Tanah GL `updWilds` (hutan pengisi) & pohon: cek kedalaman/bayangan; angin shader (proto `iso_nature.js`) bisa dipindah.
5. Bangunan sudut 3/4 top-down: aset isometrik (docs/TASKS_GPT_ISO.md).
6. Performa HP: banyak objek dikompensasi tiap frame; pakai cull.js yang sudah ada.
