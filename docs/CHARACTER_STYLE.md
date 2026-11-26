# Gaya Karakter (WAJIB untuk semua tokoh: Arka, NPC, humanoid)

Keputusan pemilik (24 Nov 2026): desain E (`assets/templates/npc/sari_desain_E.png` / `.aseprite`) adalah model gaya SEMUA karakter.
Menggantikan aturan v1.89.7 "warna rata tanpa bayangan". Belum ada sprite game yang diganti; ukuran akhir menunggu keputusan pemilik.

## 1. Palet bersama (11 warna, `assets/templates/npc/karakter.gpl`)
| Kode | Hex | Peran |
|---|---|---|
| hitam | `#000000` | massa bayangan (bukan sekadar garis tepi) |
| marun | `#5a1821` | bayangan merah, sepatu, sarung tangan |
| merah | `#b1271a` | rambut/kain merah |
| zaitun | `#afaf36` | kain/rambut terang |
| hijau | `#7b9345` | bayangan zaitun |
| biru | `#3e5580` | kain, bayangan dingin |
| biru tua | `#2d3161` | bayangan rambut & kain biru |
| kulit | `#f0c271` | kulit |
| oranye | `#cf7345` | bayangan kulit, kilau |
| mawar | `#ac4a4a` | tepi kulit sisi gelap |
| krem | `#edd6bb` | kain terang, gigi |
Identitas tokoh = pembagian palet ini; jangan menambah warna per tokoh.

## 2. Angka patokan (diukur dari referensi pemilik, tokoh ±46 px)
- Hitam 20–25% badan, piksel gelap 37–45%; hitam mengisi bawah dagu, ketiak, pinggang, sela kaki.
- ±30% tepi siluet TANPA garis gelap (sisi terang kulit/rambut langsung bertemu latar).
- Isi kiri-kanan mirip ≤ 33%: pose 3/4, satu lengan beda fungsi, satu kaki maju.
- Bayangan bergeser warna: kulit → oranye → mawar, merah → marun, zaitun → hijau → biru, rambut → biru tua.

## 3. Wajah
- Kepala 3/4; telinga di sisi jauh; poni satu sapuan + bayangan oranye tipis di dahi.
- Mata garis tegak 1×2 px, yang dekat tepi 1 px LEBIH TINGGI (kepala miring). Kulit bersih tanpa titik merona.
- Rahang menyempit, dipotong helai rambut. Dagu langsung bertemu kain leher, tanpa leher.
- Mulut: oranye + 2 px krem, sebaris di bawah mata rendah; tanpa garis gelap melintang.

## 4. Rambut, tangan, kaki
- Rambut: 3–4 helai terpisah garis gelap, kilau 2–4 px, ujung acak biru tua.
- Tangan: jari terbaca (selang-seling kulit/oranye/mawar); alat benar-benar digenggam.
- Kaki: betis 4 px (mawar kiri, oranye kanan), celah antar kaki jelas, ujung sepatu hitam.

## 5. Hak cipta
Pose, rambut, dan wajah tokoh baru digambar sendiri. Wajah desain E masih salinan piksel referensi:
jangan dipasang di game sebelum pemilik memastikan asal referensi atau wajahnya digambar ulang.
