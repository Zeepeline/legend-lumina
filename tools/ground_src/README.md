# Sumber tanah benua (gaya Sprout)

`gnd_<id>_custom.png` di sini adalah SUMBER untuk `python3 tools/seam_ground.py`, yang menulis
`godot/assets/art/ground/gnd_<id>_custom.png` (ukuran disamakan dengan kotak wilayah di `godot/core/world_layout.gd`,
jalan disambung di perbatasan, batas wilayah dibuat bergelombang).

- village, meadow, kgate, kpasar, kakademi, kbawah, kpermukiman: gambar tanah yang sudah ada (tidak diubah).
- lake, forest, deepwood, river, road, snow, swamp: dulu gambar kelas mentah (rumput hijau-toska + bintik tanah).
  Bintik tanah kecil yang bukan jalan dibuang, lalu dirender dengan autotile Sprout + biome versi web lama
  (commit b4a5fae, `genGround()` di src/world/ground.js) sehingga gayanya sama dengan desa.

Ubah sumber di sini lalu jalankan ulang `seam_ground.py` dari akar repo; jangan sunting gambar di godot/ langsung.
