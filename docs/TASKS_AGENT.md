# TASKS_AGENT — tugas kecil berdampak (untuk agen dengan konteks terbatas)

**Cara kerja (WAJIB, supaya tidak kebanyakan analisis):**
1. Ambil **SATU** tugas teratas yang statusnya `[ ]`. Jangan gabung tugas. Jangan "sekalian" merapikan hal lain.
2. Baca **hanya** file & baris yang disebut di tugas (pakai `grep -n`). Jangan baca dokumen desain kecuali disebut.
3. Ubah sesedikit mungkin. Jangan mengganti nama fungsi, memindah file, atau mengubah arsitektur.
4. Jalankan `npm run check` (harus lulus) + cek yang tertulis di tugas. Tidak perlu full test suite.
5. Commit 1 tugas = 1 commit (`fix:`/`feat:` + nomor tugas), tandai `[x]` di file ini, push.
6. Kalau tugas ternyata lebih besar dari perkiraan (>80 baris perubahan) atau langkahnya tidak cocok dengan kode: **berhenti**, tulis catatan di bawah tugas itu, lanjut ke tugas lain.
Mode Benua (satu peta): buka game dengan `?benua=1`. Di konsol: `__game.sc.M.benua` (1 = mode benua), `__game.sc.regId` (wilayah sekarang), `WORLD_POS[id]` = posisi global wilayah.

---

## A. Mode Benua — port fitur kecil (prioritas)

### [ ] T1. Cuaca kabut Rawa Senja di mode benua
- File: `src/systems/benua_scene.js`, fungsi `updBenua`, blok setelah `this.regId = id;`.
- Masalah: cuaca ditentukan sekali di `create` dari `M.id` (`src/scene/world.js` baris ±78, `this.weather = M.id === 'swamp' ? 'fog' : ...`); di benua `M.id` = `'benua'`.
- Langkah: saat wilayah berubah, jika `id === 'swamp'` dan `this.weather !== 'fog'` → `this.weather = 'fog'`, lalu `this.dropActiveFx(); this.makeActiveFx();`. Jika keluar dari swamp dan cuaca `'fog'` → `this.weather = 'clear'` + buat ulang efek yang sama.
- Cek: `?benua=1`, konsol `__game.sc.goto('swamp', 640, 400, 'down')` → kabut muncul; `goto('meadow', 600, 500)` → kabut hilang.

### [ ] T2. Wisp malam di mode benua
- File: `src/systems/benua_scene.js` fungsi `spawnRegionFx(id)`.
- Asal: `src/scene/world.js` (cari `isNight() && (M.id === 'forest' || M.id === 'meadow')`) memunculkan 4 `wisp` di tengah jalan `M.paths`.
- Langkah: di `spawnRegionFx`, jika `!G.title && isNight() && (id === 'forest' || id === 'meadow')`, salin loop itu memakai `this.M.paths` (sudah koordinat global karena `regionClone`).
- Cek: set `S.time = 1` lalu muat ulang dengan `?benua=1`, teleport ke hutan → ada wisp.

### [ ] T3. Pedagang keliling (Kang Kembara) di mode benua
- File: `src/systems/benua_scene.js` `spawnRegionFx(id)`; asal di `src/scene/world.js` (cari `isMerchantHere(M.id)` dan `posMap`).
- Langkah: jika `typeof isMerchantHere === 'function' && isMerchantHere(id)` dan `posMap[id]` ada → `this.spawnNpc({ id: 'kembara', ch: 'hunter', name: 'Kang Kembara', x: pos.x + this.M._ox, y: pos.y + this.M._oy, dir: pos.dir, wander: 12 })`. Salin `posMap` ke konstanta `KEMBARA_POS` di atas file (jangan ubah world.js).
- Cek: konsol `isMerchantHere('village')`; kalau true, Kang Kembara ada di desa mode benua.

### [ ] T4. Banner wilayah tidak berkedip saat bolak-balik di perbatasan
- File: `src/systems/benua_scene.js` `updBenua`, baris `banner(R.name, ...)`.
- Langkah: simpan `this.lastBanner = { id, t: this.t }`; tampilkan banner hanya jika `id` beda dengan banner terakhir ATAU sudah > 20 detik (`this.t - this.lastBanner.t > 20`).
- Cek: berjalan bolak-balik di garis desa ↔ Jalan Desa–Padang: banner tidak muncul berulang.

### [ ] T5. Kucing desa & Mochi: periksa posisi
- File: `src/systems/benua_scene.js` `spawnRegionFx`. Cek visual saja: `S.side.mochi = 3; S.pet = 0` lalu muat ulang `?benua=1` → kucing ada di dekat rumah desa (bukan di hutan pengisi). Jika salah posisi, catat koordinatnya di bawah tugas ini (jangan refactor).

## B. Visual & kenyamanan

### [ ] T6. Garis tipis di perbatasan dua wilayah bertanah sama
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

### [ ] T9. world.js di bawah 400 baris
- File: `src/scene/world.js` (399–421 baris, batas 400). Pindahkan metode `goto(...)` dan `guardStop()` (cari dengan grep) ke file baru `src/systems/scene_nav.js` sebagai `Object.assign(World.prototype, { goto(...) {...}, async guardStop() {...} });`.
- Daftarkan `<script src="src/systems/scene_nav.js"></script>` di `index.html` **tepat setelah** `src/scene/world.js` (sebelum `benua_scene.js` yang membungkus `goto`!).
- Cek: `npm run check`; buka game, masuk & keluar rumah berfungsi.

### [ ] T10. Cicil utang baris panjang (1 file per tugas, ulangi)
- Pilih 1 file dari `tools/size-baseline.json` dengan angka `long` kecil (1–5). Pecah baris > 160 karakter menjadi beberapa baris **tanpa mengubah logika** (pisah di `;` atau `,`).
- Jalankan `node tools/check-size.js --update` setelahnya (angka harus turun). Cek: `npm run check`, buka game sebentar.

### [ ] T11. Tes menu yang ketinggalan
- `grep -rn "'menu'" tests/*.spec.js` → semua tes yang membuka menu utama lalu `down N` harus mengikuti susunan baru: Tas, Jelajah(Jurnal/Peta/Riwayat), Karakter(Atribut/Jurus/Pohon Bakat), Kerajinan, Koleksi, Fitur, Simpan, Pengaturan, Tutup (lihat `src/ui/menus.js` `mainMenu`). Contoh yang sudah benar: `tests/bab4.spec.js` baris 9–11, `tests/belajar.spec.js`.
- Cek: jalankan hanya tes yang diubah.

---
Tugas besar (JANGAN diambil agen ini; dikerjakan sesi khusus): port Bab 4–5 (`spawnCh4`/`spawnCh5`) ke mode benua, suasana alam (`ambient.js`), rahasia/rumah/kandang, peta mini benua, streaming objek benua (kinerja), lalu menjadikan benua bawaan. Rinciannya di `docs/HANDOFF_OPENWORLD.md` bagian 0b.
