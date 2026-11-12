# CODE_RULES — aturan menulis kode Legenda Lumina

Wajib untuk manusia & AI agent. Tujuan utamanya: **agen bisa menemukan dan mengubah kode dengan membaca sesedikit mungkin.**
Dicek otomatis oleh `npm run check` (`tools/check-size.js`, `tools/check-syntax.js`, `tools/check-layout.js`, `tools/codemap.js`).

## 1. Cara agen membaca proyek (urutan hemat konteks)
1. `AGENTS.md` (peta folder & aturan bug) → 2. `docs/CODEMAP.md` (grep nama fungsi → `file:baris`) → 3. buka **hanya** potongan file itu (`Read` dengan offset/limit).
- Jangan membaca file utuh bila CODEMAP sudah memberi baris. Jangan membaca `dist/` (hasil bundle).
- Baris ke-2 setiap file = ringkasan isi. Pertahankan.

## 2. Batas ukuran (dicek otomatis)
| Aturan | Batas | Catatan |
|---|---|---|
| Panjang file | **≤ 400 baris** | Lebih → pecah ke file baru di folder yang sama (`nama_2.js`) atau folder tema |
| Panjang baris | **≤ 160 karakter** | Utang lama dicatat di `tools/size-baseline.json`; jumlahnya **tidak boleh bertambah** |
| Panjang fungsi | ideal ≤ 60 baris, maks 120 | Lebih → pecah jadi fungsi bantu bernama jelas |
| Satu file | satu tema | mis. `systems/fishing.js` hanya memancing |
- Kalau kamu **mengurangi** utang (memecah baris panjang), jalankan `node tools/check-size.js --update` agar baseline ikut turun.
- `tools/split.py` bisa memecah file besar secara otomatis (mode `top` untuk fungsi global, `mixin` untuk `Object.assign(World.prototype, …)`), lalu tambahkan file hasilnya ke `index.html`.

## 3. Arsitektur (tetap, jangan diganti tanpa izin pemilik)
- **Phaser 3.80.1 + skrip klasik** (tanpa bundler, tanpa ES module, tanpa npm runtime). Alasan: jalan langsung di GitHub Pages & HP, bisa dibundel jadi 1 file (`tools/bundle.py`), tidak ada langkah build. **Jangan** pindah ke Vite/webpack/TypeScript/React/framework lain tanpa persetujuan pemilik.
- Semua file berbagi scope global; urutan muat = urutan `<script>` di `index.html` (`check-syntax.js` memastikan setiap file terdaftar).
- Lapisan (file hanya boleh bergantung ke lapisan di atasnya **saat dimuat**; saat runtime bebas):
  1. `core/` — util, audio, input, state & simpan
  2. `data/` — tabel data murni (item, musuh, misi). **Tanpa logika Phaser.**
  3. `art/` — pixel art buatan kode (`artNama()` → kanvas). Tanpa state game.
  4. `world/` — data peta (`maps/`), objek (`objects.js`), perilaku objek saat dibuat (`spawn/`), tata letak dunia (`layout.js`)
  5. `gfx/` — membangun tekstur & animasi
  6. `scene/world.js` — inti scene `World` (create/update/kamera). **Jangan tambah fitur di sini**, taruh di mixin.
  7. `systems/`, `ai/`, `npc/` — fitur sebagai mixin `Object.assign(World.prototype, {...})` atau fungsi global
  8. `ui/` — layar & menu DOM; `main.js` terakhir
- **Data vs logika:** angka/teks/tabel → `data/` atau konstanta di atas file; logika → fungsi. Jangan menyebar angka ajaib.
- **Registry, bukan if-panjang:** perilaku per jenis objek/musuh/item ditaruh di tabel (contoh `OBJ_SPAWN[tipe]` di `world/spawn/`, `ENEMY[tipe].ai`), bukan rantai `if (type === …)` di satu fungsi.

## 4. Pola yang dipakai
- **Fitur scene baru:** file baru `src/systems/<tema>.js`:
  ```js
  'use strict';
  // Ringkasan satu baris tentang isi file
  Object.assign(World.prototype, {
    namaMetode() { ... },
  });
  ```
  Daftarkan di `index.html` setelah `scene/world.js`.
- **Objek dunia baru dengan perilaku:** gambar `artNama()` di `art/…`, entri `OBJ` di `world/objects.js`, perilaku di `world/spawn/spawn_N.js`: `nama(s, x, y, opt, d, type) { this.inter.push({...}) }` (`this` = scene).
- **Membungkus fungsi lama** (mis. menambah efek ke `addItem`): simpan yang lama, buat yang baru memanggilnya. Jangan menimpa fungsi dari file yang dimuat **belakangan** (lihat AGENTS.md).
- **State tersimpan** hanya di `S` (dengan default di `newState()`); pengaturan perangkat di `OPT`.
- **Async UI:** `await talk()/choose()`; setiap `G.lock++` dipasangkan `G.lock--` di `finally`.

## 5. Gaya penulisan
- 2 spasi, titik koma, `'use strict'` di baris 1, `const` > `let`, tanpa `var`.
- Nama: fungsi/metode `camelCase` berupa kata kerja (`spawnGarden`, `openMapNew`); tabel data `UPPER_SNAKE` (`ITEMS`, `OBJ_SPAWN`); file `snake_case`/huruf kecil.
- Komentar & teks game dalam Bahasa Indonesia. Komentar menjelaskan **kenapa**, bukan apa.
- Satu pernyataan per baris untuk logika baru (boleh satu baris untuk getter/fungsi sangat pendek).
- Jangan menyisipkan komentar `//` di tengah pernyataan satu baris saat mengedit lewat skrip — pakai `/* */`.
- Hindari nama global ganda (cek `grep -n "nama" docs/CODEMAP.md` sebelum membuat fungsi baru).

## 6. Sebelum push
1. `npm run check` → harus lulus (sintaks, ukuran, tata letak, CODEMAP diperbarui).
2. Tes terkait (`npx playwright test tests/<terkait>.spec.js`), full suite untuk perubahan besar.
3. Commit `docs/CODEMAP.md` yang ikut berubah.
