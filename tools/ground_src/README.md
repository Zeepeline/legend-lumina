# Sumber tanah benua (gaya Sprout)

`gnd_<id>_custom.png` di sini adalah SUMBER untuk `python3 tools/seam_ground.py`, yang menulis
`godot/assets/art/ground/gnd_<id>_custom.png` (ukuran disamakan dengan kotak wilayah di `godot/core/world_layout.gd`,
jalan disambung di perbatasan, batas wilayah dibuat bergelombang).

Semua 14 wilayah memakai gaya KOTAK-KOTAK (petak Sprout 16 px; permintaan pemilik): dirender dengan autotile Sprout + biome
versi web lama (commit b4a5fae, `genGround()` di src/world/ground.js) dari gambar kelas tiap wilayah. Jalan kota = paving batu.
- lake, deepwood, river, road, snow, swamp: bintik tanah kecil yang bukan jalan dibuang dulu sebelum dirender.
- village: dua petak kebun (sayur) ditempel kembali dari gambar lama (kotak 100,356–198,486).

Ubah sumber di sini lalu jalankan ulang `seam_ground.py` dari akar repo; jangan sunting gambar di godot/ langsung.
