# Lumina Art Bible

Aturan gaya visual untuk game **Legenda Lumina**. Patokannya satu: gambar desa referensi dari pemilik proyek (lihat grup aset *Reference*). Setiap aset baru, baik digambar lewat kode, digenerate AI, maupun diambil dari paket lain, harus lolos aturan di halaman ini sebelum masuk ke game.

## 1. Rasa yang dikejar

Desa yang hangat, cerah, dan "empuk": seperti pagi musim semi. Kontrasnya lembut, warnanya jenuh tapi tidak neon, tidak ada hitam pekat. Monster boleh lucu atau sedikit seram, tapi tetap terlihat seperti mainan dari dunia yang sama.

## 2. Cahaya & bayangan

- **Cahaya selalu dari kiri-atas.** Sisi kiri/atas objek paling terang, sisi kanan/bawah paling gelap.
- **Bayangan bergeser ke biru-teal, sorotan bergeser ke kuning.** Jangan menggelapkan dengan hitam. Contoh daun: `leaf-shadow` (teal) → `leaf-base` → `leaf-highlight` (kuning-hijau).
- Setiap material punya 4–5 tingkat warna (lihat token): garis tepi, bayangan, dasar, terang, sorotan.
- **Bayangan di tanah mengikuti bentuk objeknya**: siluet objek dipipihkan jadi ±28% tingginya, dicondongkan ke kanan sejauh ±32% tingginya (cahaya dari kiri-atas), diburamkan ±2 px, warna `#0a2416` dengan transparansi ±36% (±55% di gua).
- Bayangan karakter & monster: elips bergradasi lembut, bukan elips bertepi keras.
- **Malam hari**: lapisan biru tua `#0a1238` ±68%, senja jingga `#40220c`. Lampu, jendela, tungku, wisp, dan bola api melubangi kegelapan plus pendar kuning `#ffc870`.

## 3. Garis tepi (outline)

- **Garis tepi berwarna, bukan hitam.** Warnanya adalah versi sangat gelap dari isi di sebelahnya: daun bergaris `leaf-outline`, atap bergaris `roof-outline`, kayu bergaris `wood-outline`.
- Tebal 1 piksel, di sisi luar siluet saja. Detail di dalam pakai perubahan warna, bukan garis.
- Di kode: fungsi `outline()` otomatis mengambil warna tetangga lalu menggelapkannya dengan `toneC(warna, -0.72)`.

## 4. Proporsi & ukuran

| Jenis | Ukuran di game | Catatan |
| --- | --- | --- |
| Karakter | frame 20×26 px | chibi 2 kepala: kepala ±13 px, badan 6 px, kaki 2 px |
| Rumah | ±99×131 px | atap oranye pelana menghadap depan, rangka kayu, kotak bunga |
| Pohon buah | ±60×74 px | kanopi bulat bergumpal + batang pendek |
| Pohon besar (rumah pohon) | 208×230 px | satu-satunya landmark sebesar ini di desa |
| Monster kecil | 14–20 px lebar | dibaca jelas dari siluet saja |
| Boss | monster dasar diperbesar 1.4–2.3× | tetap piksel tajam |
| Ikon item | 14×14 px | latar `ui-parchment` |

Skala acuan: objek dari gambar referensi dikecilkan **0,62×** agar karakter setinggi ±26 px cocok dengan rumah.

## 5. Tekstur

- **Daun:** gumpalan bulat bertumpuk (yang lebih bawah menutup yang atas), tiap gumpalan punya sisi terang kiri-atas dan tepi gelap di bawah. Tambah gumpalan kecil 2–3 px di dalamnya.
- **Jalan batu:** batu bulat tidak beraturan (pola voronoi 7 px), nat `stone-mortar`, sisi kiri-atas tiap batu lebih terang.
- **Rumput:** 4 tingkat `grass-1…4` diacak dengan noise lembut, ditaburi rumput liar "v" dan bunga 3 px (putih, kuning, merah muda, ungu).
- **Kayu:** papan vertikal dengan garis nat gelap tiap 4–5 px.

## 6. Karakter & animasi

- Mata 2 px tinggi warna `eye` dengan **satu titik putih kilau** di atas; pipi `blush`.
- Rambut punya garis bayangan di bawah dan sorotan di atas.
- Frame per arah (bawah, atas, samping): 0 diam, 1 langkah A (badan naik 1 px), 2 langkah B, 3 serang (lengan maju). Arah kiri = cermin dari kanan.
- Gerak monster dibantu efek *squash & stretch*: memanjang saat melompat, memipih saat mendarat atau terkena pukulan.

## 7. UI

Jendela memakai `ui-parchment` dengan bingkai `ui-wood` 2 px dan sudut `radius-win`. Teks `ui-ink`, kursor `ui-accent`, label nama pembicara `ui-green`. Font: Pixelify Sans.

## 8. Cek sebelum aset masuk game

1. Garis tepinya berwarna, bukan hitam?
2. Cahaya dari kiri-atas, bayangan kebiruan, sorotan kekuningan?
3. Warnanya bisa ditemukan (atau dekat) di token?
4. Ukurannya sesuai tabel di bagian 4?
5. Taruh di samping rumah pohon dan karakter Arka. Masih terasa dari dunia yang sama?

## 9. Template prompt untuk generate aset baru

Kalau membuat aset dengan AI generator gambar, pakai gambar referensi desa sebagai *style reference* (kalau alatnya mendukung), lalu awali prompt dengan blok gaya ini:

> cozy top-down 3/4 view pixel art, same style as the reference village image, bright spring palette, soft low-contrast shading, light from top-left, cool teal shadows and warm yellow highlights, 1px dark colored outlines (not black), chunky rounded leaf clusters, no anti-aliasing, plain flat light-green background, single isolated object, centered, no text

Lalu tambahkan objeknya, contoh:

- `…, a small stone well with a wooden roof and a bucket`
- `…, character sprite sheet of a young blacksmith, chibi 2-head proportion, 4 directions (down, up, left, right), 3 walking frames each, grid layout`
- `…, a cute red slime monster, 4 frames idle bounce animation in a row`

Tips: minta **satu objek di latar polos** supaya mudah dipotong, dan minta karakter dalam **grid lembar sprite** supaya animasinya bisa langsung dipakai. Hasilnya kirim ke Claude untuk dipotong, dibersihkan latarnya, dikecilkan ke skala 0,62×, dan diberi garis tepi sesuai aturan ini.
