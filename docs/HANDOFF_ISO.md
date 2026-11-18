# HANDOFF — Tampilan isometrik di game utama

Pemilik memilih: tampilan isometrik dipasang DI GAME UTAMA (bukan prototipe), supaya semua fitur ikut. Saklar `?iso=1` (diingat
`localStorage.lumina_iso`), `?iso=0` mematikan. Prototipe terpisah tetap di `iso.html` + `proto/iso/` (acuan gaya: desa, pohon alami, angin).

## Tahap 1 (selesai, v1.49.0) — `src/systems/isoview.js`
- Kamera World/GL: matriks proyeksi 2:1 (`Camera.prototype.preRender`), `worldView` = kotak dunia terlihat, zoom ×`ISO_ZOOM` (.72).
- Objek tegak (depth > −5e5): selama render diputar −45° & diskala (0,707; 1,414), dipulihkan setelah render; depth + x (iso).
- Objek layar (scrollFactor 0): kompensasi penuh. Partikel tidak dikompensasi (posisi tetap terproyeksi).
- `Input.vec()` layar → dunia; kamera tanpa batas peta saat iso. Ruang dalam/judul tetap top-down.

## Sisa (urut prioritas)
1. Malam & cahaya (`camStep` night/dark: titik hapus memakai `L.x - scrollX` top-down) → proyeksikan posisi lampu.
2. Arah hadap Arka/serangan: `pl.dir` dari vektor dunia → sprite menghadap diagonal; pertimbangkan arah dari vektor layar.
3. Bidik/ketuk (`Input.aim`, pointer → dunia) belum dikonversi.
4. Tanah GL `updWilds` (hutan pengisi) & pohon: cek kedalaman/bayangan; angin shader (proto `iso_nature.js`) bisa dipindah.
5. Bangunan sudut 3/4 top-down: aset isometrik (docs/TASKS_GPT_ISO.md).
6. Performa HP: banyak objek dikompensasi tiap frame; pakai cull.js yang sudah ada.
