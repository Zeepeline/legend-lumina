# TASKS_AGENT — tugas kecil berdampak (untuk agen dengan konteks terbatas)

**Cara kerja (WAJIB, supaya tidak kebanyakan analisis):**
1. Ambil **SATU** tugas teratas yang statusnya `[ ]`. Jangan gabung tugas. Jangan "sekalian" merapikan hal lain.
2. Baca **hanya** file & baris yang disebut di tugas (pakai `grep -n`). Jangan baca dokumen desain kecuali disebut.
3. Ubah sesedikit mungkin. Jangan mengganti nama fungsi, memindah file, atau mengubah arsitektur.
4. Jalankan `npm run check` (harus lulus) + cek yang tertulis di tugas. Tidak perlu full test suite.
5. Commit 1 tugas = 1 commit (`fix:`/`feat:` + nomor tugas), tandai `[x]` di file ini, push.
6. Kalau tugas ternyata lebih besar dari perkiraan (>80 baris perubahan) atau langkahnya tidak cocok dengan kode: **berhenti**, tulis catatan di bawah tugas itu, lanjut ke tugas lain.

**FILE TERKUNCI (milik sesi tugas besar — agen ini DILARANG mengubahnya, termasuk saat T10):**
`src/systems/benua.js`, `src/systems/benua_scene.js`, `src/scene/world.js`, `src/systems/regions.js`, `src/systems/groundlayer.js`,
`src/systems/openworld.js`, `src/systems/stream.js`, `src/systems/wilds.js`, `src/systems/ambient.js`, `src/systems/explore.js`,
`src/systems/chapter4.js`, `src/systems/chapter5.js`, `src/systems/home.js`, `src/systems/ranch.js`, `src/systems/perf.js`,
`src/ui/map.js`, `src/world/layout.js`, `docs/HANDOFF_OPENWORLD.md`. Kalau sebuah tugas butuh mengubah file ini → berhenti, catat.

Mode Benua (satu peta): buka game dengan `?benua=1`. Di konsol: `__game.sc.M.benua` (1 = mode benua), `__game.sc.regId` (wilayah sekarang), `WORLD_POS[id]` = posisi global wilayah.

---

## A. (dipindah) Port fitur kecil mode Benua — DIKERJAKAN SESI TUGAS BESAR, bukan agen ini
Kabut rawa, wisp malam, pedagang keliling, banner perbatasan, posisi kucing/Mochi (dulu T1–T5) memakai file terkunci.

## B. Visual & kenyamanan

### [x] T6. Garis tipis di perbatasan dua wilayah bertanah sama
- File: `src/world/ground.js`, baris `const n = vnoise(x, y, 26, 1) * .55 + vnoise(x, y, 8, 2) * .45;` (±baris 138).
- Penyebab: noise rumput memakai koordinat lokal → pola di tepi dua wilayah tidak menyambung.
- Langkah: di awal `genGround` tambahkan `const GX = (typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id]) ? WORLD_POS[M.id][0] : 0, GY = ...[1] : 0;` lalu ganti **hanya baris itu** menjadi `vnoise(x + GX, y + GY, 26, 1) * .55 + vnoise(x + GX, y + GY, 8, 2) * .45`.
- Jangan ubah baris noise lain. Fungsi harus tetap murni (tanpa acak global).
- Cek: perbatasan Hutan Lumina ↔ Rimba Peralihan (`goto('forest', 30, 600)`) tidak ada garis lurus.

### [ ] T7. Ikon item yang hilang
- Konsol game memperingatkan `Ikon cadangan dipakai untuk item: ...` (antara lain `amethyst_gem`, `frost_moss`, `flower_crown`, `honey_jar`, `sandalwood_comb`; buka game, catat daftar lengkapnya dari konsol).
- File: `src/art/items.js`, tabel `ICONS_DEF`. Tambahkan entri per item dengan meniru entri item serupa (mis. permata → contoh ikon permata yang sudah ada, bunga → ikon bunga). Ikuti palet `docs/ART_BIBLE.md` bagian 2 saja.
- Satu commit boleh berisi semua ikon. Cek: konsol tidak lagi menampilkan peringatan untuk item itu.

### [ ] T8. Cari & perbaiki "Failed to load resource" saat boot
- Buka game di Chrome desktop → DevTools → Network, filter status 404/failed saat memuat. Catat URL-nya.
- Jika file aset salah nama/hilang di `IMG_LIST` (`src/gfx/textures.js`) → betulkan namanya atau hapus entri yang tidak dipakai. Jika itu permintaan service worker/manifest, catat saja.

## C. Kerapian kode (aman, mekanis)

### [ ] T10. Cicil utang baris panjang (1 file per tugas, ulangi)
- Pilih 1 file dari `tools/size-baseline.json` dengan angka `long` kecil (1–5) yang **TIDAK** ada di daftar file terkunci. Pecah baris > 160 karakter menjadi beberapa baris **tanpa mengubah logika** (pisah di `;` atau `,`).
- Jalankan `node tools/check-size.js --update` setelahnya (angka harus turun). Cek: `npm run check`, buka game sebentar.

### [ ] T11. Tes menu yang ketinggalan
- `grep -rn "'menu'" tests/*.spec.js` → semua tes yang membuka menu utama lalu `down N` harus mengikuti susunan baru: Tas, Jelajah(Jurnal/Peta/Riwayat), Karakter(Atribut/Jurus/Pohon Bakat), Kerajinan, Koleksi, Fitur, Simpan, Pengaturan, Tutup (lihat `src/ui/menus.js` `mainMenu`). Contoh yang sudah benar: `tests/bab4.spec.js` baris 9–11, `tests/belajar.spec.js`.
- Cek: jalankan hanya tes yang diubah.

---
Tugas besar (JANGAN diambil agen ini; dikerjakan sesi khusus): port fitur kecil benua (bekas T1–T5), `world.js` < 400 baris (bekas T9), port Bab 4–5 (`spawnCh4`/`spawnCh5`) ke mode benua, suasana alam (`ambient.js`), rahasia/rumah/kandang, peta mini benua, streaming objek benua (kinerja), lalu menjadikan benua bawaan. Rinciannya di `docs/HANDOFF_OPENWORLD.md` bagian 0b.
