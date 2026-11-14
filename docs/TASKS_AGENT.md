# TASKS_AGENT — tugas kecil berdampak (untuk agen dengan konteks terbatas)

**Cara kerja (WAJIB, supaya tidak kebanyakan analisis):**

1. Ambil **SATU** tugas teratas yang statusnya `[ ]`. Jangan gabung tugas. Jangan "sekalian" merapikan hal lain.
2. Baca **hanya** file & baris yang disebut di tugas (pakai `grep -n`). Jangan baca dokumen desain kecuali disebut.
3. Ubah sesedikit mungkin. Jangan mengganti nama fungsi, memindah file, atau mengubah arsitektur.
4. Jalankan `npm run check` (harus lulus) + cek yang tertulis di tugas. Tidak perlu full test suite.
5. Commit 1 tugas = 1 commit (`fix:`/`feat:` + nomor tugas), tandai `[x]` di file ini, push.
6. Kalau tugas ternyata lebih besar dari perkiraan (>80 baris perubahan) atau langkahnya tidak cocok dengan kode: **berhenti**, tulis catatan di bawah tugas itu, lanjut ke tugas lain.

**FILE TERKUNCI (milik sesi tugas besar — agen ini DILARANG mengubahnya):**
Dunia terbuka: `src/systems/benua.js`, `benua_scene.js`, `regions.js`, `groundlayer.js`, `openworld.js`, `stream.js`, `wilds.js`, `ambient.js`, `explore.js`,
`chapter4.js`, `chapter5.js`, `perf.js`, `scene_nav.js`, `src/scene/world.js`, `src/world/layout.js`, `src/ui/map.js`.
Pertarungan & AI (pilar Souls-lite): `src/systems/souls.js`, `combat.js`, `skills.js`, `polish.js`, `feel.js`, `src/ai/enemies.js`, `src/ai/bosses.js`, `src/data/enemies.js`.
Build/markas/sekutu (pilar 2–4): `src/systems/learn.js`, `craft.js`, `home.js`, `ranch.js`, `travel.js`, `src/npc/brain.js`, `src/npc/dialog.js`.
Inti & UI: `src/core/state.js`, `src/ui/menus.js`, `src/ui/widgets.js`. Dokumen: `docs/HANDOFF_OPENWORLD.md`, `docs/GAME_DESIGN.md`.
Kalau sebuah tugas butuh mengubah file ini → berhenti, tulis catatan di bawah tugas itu, ambil tugas berikutnya.
Boleh disentuh agen: `src/npc/npcs.js` (NPC_BARKS), `src/data/items.js`, `src/data/quests.js` (ACH), `src/data/bestiary_text.js` (baru), file lain di luar daftar,
`index.html` (hanya menambah baris `<script>` yang diminta tugas), `tests/` (file baru).

Mode Benua (satu peta): buka game dengan `?benua=1`. Di konsol: `__game.sc.M.benua` (1 = mode benua), `__game.sc.regId` (wilayah sekarang), `WORLD_POS[id]` = posisi global wilayah.

---

## B. Visual & kenyamanan

### [x] T6. Garis tipis di perbatasan dua wilayah bertanah sama

- File: `src/world/ground.js`, baris `const n = vnoise(x, y, 26, 1) * .55 + vnoise(x, y, 8, 2) * .45;` (±baris 138).
- Penyebab: noise rumput memakai koordinat lokal → pola di tepi dua wilayah tidak menyambung.
- Langkah: di awal `genGround` tambahkan `const GX = (typeof WORLD_POS !== 'undefined' && WORLD_POS[M.id]) ? WORLD_POS[M.id][0] : 0, GY = ...[1] : 0;` lalu ganti **hanya baris itu** menjadi `vnoise(x + GX, y + GY, 26, 1) * .55 + vnoise(x + GX, y + GY, 8, 2) * .45`.
- Jangan ubah baris noise lain. Fungsi harus tetap murni (tanpa acak global).
- Cek: perbatasan Hutan Lumina ↔ Rimba Peralihan (`goto('forest', 30, 600)`) tidak ada garis lurus.

### [x] T7. Ikon item yang hilang

- Konsol game memperingatkan `Ikon cadangan dipakai untuk item: ...` (antara lain `amethyst_gem`, `frost_moss`, `flower_crown`, `honey_jar`, `sandalwood_comb`; buka game, catat daftar lengkapnya dari konsol).
- File: `src/art/items.js`, tabel `ICONS_DEF`. Tambahkan entri per item dengan meniru entri item serupa (mis. permata → contoh ikon permata yang sudah ada, bunga → ikon bunga). Ikuti palet `docs/ART_BIBLE.md` bagian 2 saja.
- Satu commit boleh berisi semua ikon. Cek: konsol tidak lagi menampilkan peringatan untuk item itu.

### [x] T8. Cari & perbaiki "Failed to load resource" saat boot

- Diperiksa: semua 50 gambar di `IMG_LIST` (`src/gfx/textures.js`) lengkap ada di `assets/img/*.png`. Tidak ada 404 pada aset boot.

## C. Kerapian kode (aman, mekanis)

### [x] T10. Cicil utang baris panjang — DIGANTI tugas per file di bagian C (jangan dikerjakan lagi dari sini)

- Pilih 1 file dari `tools/size-baseline.json` dengan angka `long` kecil (1–5) yang **TIDAK** ada di daftar file terkunci. Pecah baris > 160 karakter menjadi beberapa baris **tanpa mengubah logika** (pisah di `;` atau `,`).
- Jalankan `node tools/check-size.js --update` setelahnya (angka harus turun). Cek: `npm run check`, buka game sebentar.

### [x] T11. Tes menu yang ketinggalan

- Diperiksa: semua berkas tes `tests/*.spec.js` (`bab3`, `bab4`, `belajar`, `systems`) sudah sinkron dengan struktur 8 menu baru.

## C. TUGAS GELOMBANG 2 (T12–T211) — dibuat dari data kode nyata, kerjakan berurutan

Cari tugasmu: `grep -n "### \[ \] T" docs/TASKS_AGENT.md | head -1` lalu baca HANYA blok tugas itu (±8 baris).

### [x] T12. **Sapaan NPC `elder` (Tetua Bram, peta `village`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `elder: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Tetua Bram". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.elder.length === 3`.

### [x] T13. **Sapaan NPC `chick_master` (Kiki Penggembala, peta `village`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `chick_master: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Kiki Penggembala". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.chick_master.length === 3`.

### [x] T14. **Sapaan NPC `ayam` (Ayam Desa, peta `village`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ayam: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Ayam Desa". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ayam.length === 3`.

### [x] T15. **Sapaan NPC `joko` (Pak Joko, peta `meadow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `joko: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pak Joko". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.joko.length === 3`.

### [x] T16. **Sapaan NPC `wati` (Wati, peta `meadow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `wati: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Wati". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.wati.length === 3`.

### [x] T17. **Sapaan NPC `darma` (Darma, peta `meadow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `darma: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Darma". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.darma.length === 3`.

### [x] T18. **Sapaan NPC `bayu` (Pedagang Bayu, peta `meadow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `bayu: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pedagang Bayu". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.bayu.length === 3`.

### [x] T19. **Sapaan NPC `domba` (Domba Padang, peta `meadow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `domba: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Domba Padang". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.domba.length === 3`.

### [x] T20. **Sapaan NPC `hermit` (Pertapa Sura, peta `swamp`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `hermit: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pertapa Sura". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.hermit.length === 3`.

### [x] T21. **Sapaan NPC `nila` (Penjaga Nila, peta `snow`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `nila: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Penjaga Nila". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.nila.length === 3`.

### [x] T22. **Sapaan NPC `gun` (Pak Gun, peta `lake`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `gun: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pak Gun". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.gun.length === 3`.

### [x] T23. **Sapaan NPC `ratih` (Nenek Ratih, peta `lake`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ratih: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Nenek Ratih". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ratih.length === 3`.

### [x] T24. **Sapaan NPC `kafilah` (Kusir Kafilah, peta `road`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kafilah: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Kusir Kafilah". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kafilah.length === 3`.

### [x] T25. **Sapaan NPC `gj1` (Penjaga Gerbang, peta `kgate`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `gj1: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Penjaga Gerbang". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.gj1.length === 3`.

### [x] T26. **Sapaan NPC `gj2` (Penjaga Gerbang, peta `kgate`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `gj2: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Penjaga Gerbang". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.gj2.length === 3`.

### [x] T27. **Sapaan NPC `courier` (Budi Kurir Kilat, peta `kgate`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `courier: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Budi Kurir Kilat". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.courier.length === 3`.

### [x] T28. **Sapaan NPC `gw1` (Pelancong, peta `kgate`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `gw1: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pelancong". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.gw1.length === 3`.

### [x] T29. **Sapaan NPC `gw2` (Petani, peta `kgate`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `gw2: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Petani". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.gw2.length === 3`.

### [x] T30. **Sapaan NPC `kmerchant` (Pedagang Pasar, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kmerchant: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pedagang Pasar". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kmerchant.length === 3`.

### [x] T31. **Sapaan NPC `auctioneer` (Juru Lelang Bastian, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `auctioneer: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Juru Lelang Bastian". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.auctioneer.length === 3`.

### [x] T32. **Sapaan NPC `rudi` (Rudi, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `rudi: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Rudi". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.rudi.length === 3`.

### [x] T33. **Sapaan NPC `kp1` (Warga, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp1: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Warga". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp1.length === 3`.

### [x] T34. **Sapaan NPC `kp2` (Warga, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp2: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Warga". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp2.length === 3`.

### [x] T35. **Sapaan NPC `kp3` (Pedagang, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp3: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pedagang". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp3.length === 3`.

### [x] T36. **Sapaan NPC `kp4` (Gadis Kota, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp4: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Gadis Kota". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp4.length === 3`.

### [x] T37. **Sapaan NPC `kp5` (Kuli Angkut, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp5: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Kuli Angkut". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp5.length === 3`.

### [x] T38. **Sapaan NPC `kp6` (Pedagang Rempah, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp6: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pedagang Rempah". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp6.length === 3`.

### [x] T39. **Sapaan NPC `kp7` (Warga, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp7: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Warga". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp7.length === 3`.

### [x] T40. **Sapaan NPC `kp8` (Penjaga Kota, peta `kpasar`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kp8: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Penjaga Kota". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kp8.length === 3`.

### [x] T41. **Sapaan NPC `ka1` (Murid Akademi, peta `kakademi`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ka1: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Murid Akademi". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ka1.length === 3`.

### [x] T42. **Sapaan NPC `ka2` (Murid Muda, peta `kakademi`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ka2: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Murid Muda". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ka2.length === 3`.

### [x] T43. **Sapaan NPC `ka3` (Murid Akademi, peta `kakademi`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ka3: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Murid Akademi". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ka3.length === 3`.

### [x] T44. **Sapaan NPC `ka4` (Guru Tua, peta `kakademi`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ka4: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Guru Tua". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ka4.length === 3`.

### [x] T45. **Sapaan NPC `ka5` (Penjaga Akademi, peta `kakademi`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `ka5: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Penjaga Akademi". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.ka5.length === 3`.

### [x] T46. **Sapaan NPC `kb1` (Anak Kota Bawah, peta `kbawah`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kb1: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Anak Kota Bawah". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kb1.length === 3`.

### [x] T47. **Sapaan NPC `kb2` (Mantan Penambang, peta `kbawah`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kb2: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Mantan Penambang". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kb2.length === 3`.

### [x] T48. **Sapaan NPC `kb3` (Ibu Kota Bawah, peta `kbawah`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kb3: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Ibu Kota Bawah". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kb3.length === 3`.

### [x] T49. **Sapaan NPC `kb4` (Anak Kota Bawah, peta `kbawah`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `kb4: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Anak Kota Bawah". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.kb4.length === 3`.

### [x] T50. **Sapaan NPC `sambo` (Sambo, Pemburu Gelap, peta `deepwood`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `sambo: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Sambo, Pemburu Gelap". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.sambo.length === 3`.

### [x] T51. **Sapaan NPC `pancing` (Pak Teguh, Nelayan, peta `river`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `pancing: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pak Teguh, Nelayan". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.pancing.length === 3`.

### [x] T52. **Sapaan NPC `mom` (Bu Wulan, peta `linahome`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `mom: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Bu Wulan". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.mom.length === 3`.

### [x] T53. **Sapaan NPC `temple_priest` (Pendeta Elian, peta `temple`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `temple_priest: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Pendeta Elian". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.temple_priest.length === 3`.

### [x] T54. **Sapaan NPC `dice_gambler` (Bram si Pengelana, peta `kinn`)**

- File: `src/npc/npcs.js`, objek `NPC_BARKS` (baris 3–14). Tambahkan SATU entri baru sebelum `};` penutup: `dice_gambler: ['…', '…', '…'],`
- Isi 3 kalimat pendek (≤ 45 karakter), Bahasa Indonesia santai, sesuai nama/peran "Bram si Pengelana". Contoh gaya: entri `guard`/`farmer` di baris 4–5.
- DILARANG: menyebut rahasia cerita, nama boss, atau kejadian bab mendatang. Cukup obrolan sehari-hari/suasana tempat.
- Cek: `npm run check`; konsol game `NPC_BARKS.dice_gambler.length === 3`.

### [x] T55. **Deskripsi item `potion` (Ramuan)**

- File: `src/data/items.js`, cari `  potion: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pulihkan 40 HP.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.potion.d.length >= 40`.

### [x] T56. **Deskripsi item `hipotion` (Ramuan Besar)**

- File: `src/data/items.js`, cari `  hipotion: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pulihkan 120 HP.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.hipotion.d.length >= 40`.

### [x] T57. **Deskripsi item `f_jelly` (Jeli Manis)**

- File: `src/data/items.js`, cari `  f_jelly: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pulihkan 30 MP. Kenyal!").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.f_jelly.d.length >= 40`.

### [x] T58. **Deskripsi item `f_jam` (Selai Beri)**

- File: `src/data/items.js`, cari `  f_jam: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pulihkan 50 HP & 15 MP.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.f_jam.d.length >= 40`.

### [x] T59. **Deskripsi item `ether` (Eter)**

- File: `src/data/items.js`, cari `  ether: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pulihkan 15 MP.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.ether.d.length >= 40`.

### [x] T60. **Deskripsi item `tusk` (Taring Babi)**

- File: `src/data/items.js`, cari `  tusk: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Taring tajam babi hutan.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.tusk.d.length >= 40`.

### [x] T61. **Deskripsi item `sting` (Sengat Tawon)**

- File: `src/data/items.js`, cari `  sting: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Hati-hati, masih tajam.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.sting.d.length >= 40`.

### [x] T62. **Deskripsi item `spore` (Spora Jamur)**

- File: `src/data/items.js`, cari `  spore: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Bubuk ungu yang aneh.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.spore.d.length >= 40`.

### [x] T63. **Deskripsi item `isword` (Pedang Besi)**

- File: `src/data/items.js`, cari `  isword: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Serang +6.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.isword.d.length >= 40`.

### [x] T64. **Deskripsi item `ssword` (Pedang Baja)**

- File: `src/data/items.js`, cari `  ssword: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Serang +12.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.ssword.d.length >= 40`.

### [x] T65. **Deskripsi item `csword` (Pedang Kristal)**

- File: `src/data/items.js`, cari `  csword: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Serang +20, Sihir +4.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.csword.d.length >= 40`.

### [x] T66. **Deskripsi item `cloth` (Baju Kain)**

- File: `src/data/items.js`, cari `  cloth: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Pakaian sehari-hari.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.cloth.d.length >= 40`.

### [x] T67. **Deskripsi item `leather` (Rompi Kulit)**

- File: `src/data/items.js`, cari `  leather: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Tahan +3.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.leather.d.length >= 40`.

### [x] T68. **Deskripsi item `chain` (Zirah Besi)**

- File: `src/data/items.js`, cari `  chain: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Tahan +6.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.chain.d.length >= 40`.

### [x] T69. **Deskripsi item `stonearm` (Zirah Batu)**

- File: `src/data/items.js`, cari `  stonearm: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Tahan +8.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.stonearm.d.length >= 40`.

### [x] T70. **Deskripsi item `ring` (Cincin Api)**

- File: `src/data/items.js`, cari `  ring: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Sihir +8.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.ring.d.length >= 40`.

### [x] T71. **Deskripsi item `boots` (Sepatu Angin)**

- File: `src/data/items.js`, cari `  boots: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Lari 18% lebih cepat.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.boots.d.length >= 40`.

### [x] T72. **Deskripsi item `seed` (Benih Sayur)**

- File: `src/data/items.js`, cari `  seed: {` (grep). Ganti HANYA nilai `d:` (sekarang: "Tanam di kebun desa.").
- Tulis 1–2 kalimat (40–110 karakter): kalimat rasa/latar + efek. Angka efek di teks lama WAJIB tetap sama persis (mis. "+6", "40 HP").
- Jangan ubah field lain (harga, stat, `k`). Cek: `npm run check`; konsol `ITEMS.seed.d.length >= 40`.

### [x] T73. **Siapkan file teks bestiari**

- Buat file baru `src/data/bestiary_text.js` berisi persis:
  `'use strict';` / `// Teks bestiari per musuh (id = kunci ENEMY): habitat & tips melawan. Dipasang ke layar Bestiari oleh sesi besar.` / `const BESTIARY_TEXT = {` / `};`
- Daftarkan di `index.html` tepat SETELAH baris `<script src="src/data/enemies.js"></script>`.
- Cek: `npm run check`; konsol `typeof BESTIARY_TEXT === 'object'`. (Tugas-tugas berikut mengisi entrinya.)

### [x] T74. **Teks bestiari `slime` (Slime)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slime.tip`.

### [x] T75. **Teks bestiari `gold_slime` (Slime Emas)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  gold_slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'flee'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gold_slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gold_slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gold_slime.tip`.

### [x] T76. **Teks bestiari `mimic` (Peti Mimic)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  mimic:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `mimic: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'mimic'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.mimic.tip`.

### [x] T77. **Teks bestiari `slimeb` (Slime Biru)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slimeb:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimeb: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimeb'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimeb.tip`.

### [x] T78. **Teks bestiari `slimer` (Slime Merah)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slimer:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimer: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimer'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimer.tip`.

### [x] T79. **Teks bestiari `slimei` (Slime Es)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slimei:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimei: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimei'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimei.tip`.

### [x] T80. **Teks bestiari `bat` (Kelelawar)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  bat:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bat: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bat'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bat.tip`.

### [x] T81. **Teks bestiari `batc` (Kelelawar Gua)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  batc:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `batc: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'batc'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.batc.tip`.

### [x] T82. **Teks bestiari `bee` (Tawon)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  bee:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bee: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bee'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bee.tip`.

### [x] T83. **Teks bestiari `shroom` (Jamur Racun)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  shroom:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `shroom: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'shroom'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.shroom.tip`.

### [x] T84. **Teks bestiari `plant` (Bunga Pemakan)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  plant:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'turret'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `plant: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'plant'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.plant.tip`.

### [x] T85. **Teks bestiari `skel` (Tengkorak)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  skel:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `skel: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'skel'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.skel.tip`.

### [x] T86. **Teks bestiari `goblin` (Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  goblin:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin.tip`.

### [x] T87. **Teks bestiari `wolf` (Serigala)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  wolf:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wolf: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wolf'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wolf.tip`.

### [x] T88. **Teks bestiari `snake` (Ular)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  snake:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'walk'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `snake: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'snake'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.snake.tip`.

### [x] T89. **Teks bestiari `boar` (Babi Hutan)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  boar:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'charge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `boar: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'boar'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.boar.tip`.

### [x] T90. **Teks bestiari `ghost` (Hantu)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  ghost:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'ghost'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `ghost: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'ghost'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.ghost.tip`.

### [x] T91. **Teks bestiari `golem` (Golem)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  golem:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'golem'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golem: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golem'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golem.tip`.

### [x] T92. **Teks bestiari `gchief` (Kepala Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  gchief:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'boss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gchief: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gchief'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gchief.tip`.

### [x] T93. **Teks bestiari `squeen` (Ratu Jamur)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  squeen:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'qboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `squeen: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'squeen'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.squeen.tip`.

### [x] T94. **Teks bestiari `gsnake` (Ular Raksasa)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  gsnake:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'sboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gsnake: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gsnake'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gsnake.tip`.

### [x] T95. **Teks bestiari `gking` (Raja Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  gking:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'boss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gking: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gking'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gking.tip`.

### [x] T96. **Teks bestiari `frog` (Katak Rawa)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  frog:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `frog: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'frog'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.frog.tip`.

### [x] T97. **Teks bestiari `wisp` (Wisp)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  wisp:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'ghost'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wisp: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wisp'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wisp.tip`.

### [x] T98. **Teks bestiari `slimep` (Slime Racun)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slimep:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimep: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimep'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimep.tip`.

### [x] T99. **Teks bestiari `witch` (Morgath)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  witch:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'wboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `witch: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'witch'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.witch.tip`.

### [x] T100. **Teks bestiari `golemk` (Golem Purba)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  golemk:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'gboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golemk: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golemk'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golemk.tip`.

### [x] T101. **Teks bestiari `wolfs` (Serigala Salju)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  wolfs:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wolfs: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wolfs'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wolfs.tip`.

### [x] T102. **Teks bestiari `slimef` (Slime Api)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  slimef:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimef: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimef'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimef.tip`.

### [x] T103. **Teks bestiari `salam` (Salamander)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  salam:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'walk'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `salam: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'salam'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.salam.tip`.

### [x] T104. **Teks bestiari `golemi` (Golem Es)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  golemi:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'golem'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golemi: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golemi'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golemi.tip`.

### [x] T105. **Teks bestiari `kryos` (Naga Es Kryos)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  kryos:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'dboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `kryos: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'kryos'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.kryos.tip`.

### [x] T106. **Teks bestiari `bounty_wolf` (Taring Perak)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  bounty_wolf:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_wolf: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_wolf'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_wolf.tip`.

### [x] T107. **Teks bestiari `bounty_frog` (Raja Rawa Toksin)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  bounty_frog:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_frog: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_frog'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_frog.tip`.

### [x] T108. **Teks bestiari `bounty_gargoyle` (Gargoyle Merah)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  bounty_gargoyle:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_gargoyle: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_gargoyle'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_gargoyle.tip`.

### [x] T109. **Teks bestiari `king_slime` (Raja Slime Mahkota)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  king_slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `king_slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'king_slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.king_slime.tip`.

### [x] T110. **Teks bestiari `goblin_archer` (Goblin Pemanah)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  goblin_archer:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin_archer: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin_archer'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin_archer.tip`.

### [x] T111. **Teks bestiari `goblin_shaman` (Dukun Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai

- Baca baris musuh: `grep -n "^  goblin_shaman:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shaman'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin_shaman: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin_shaman'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin_shaman.tip`.

### [x] T112. **Pecah baris > 160 karakter di `src/systems/achievements.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/achievements.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T113. **Pecah baris > 160 karakter di `src/systems/life/harvest_3.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/harvest_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T114. **Pecah baris > 160 karakter di `src/systems/life/interact_2.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T115. **Pecah baris > 160 karakter di `src/systems/life/interact_4.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_4.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T116. **Pecah baris > 160 karakter di `src/systems/life/minigame_1.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T117. **Pecah baris > 160 karakter di `src/world/maps/cave.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/cave.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T118. **Pecah baris > 160 karakter di `src/world/maps/village.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/village.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T119. **Pecah baris > 160 karakter di `src/main.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/main.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T120. **Pecah baris > 160 karakter di `src/npc/npcs.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/npc/npcs.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T121. **Pecah baris > 160 karakter di `src/ui/savecode.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/savecode.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T122. **Pecah baris > 160 karakter di `src/ui/shop.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/shop.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T123. **Pecah baris > 160 karakter di `src/ui/title.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/title.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T124. **Pecah baris > 160 karakter di `src/world/maps/snow.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/snow.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T125. **Pecah baris > 160 karakter di `src/world/spawn/spawn_2.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/spawn/spawn_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T126. **Pecah baris > 160 karakter di `src/gfx/gptassets.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/gptassets.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T127. **Pecah baris > 160 karakter di `src/systems/daynight.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/daynight.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T128. **Pecah baris > 160 karakter di `src/systems/life/interact_8.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_8.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T129. **Pecah baris > 160 karakter di `src/systems/story.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/story.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T130. **Pecah baris > 160 karakter di `src/world/maps/meadow.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/meadow.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T131. **Pecah baris > 160 karakter di `src/gfx/bake.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/bake.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T132. **Pecah baris > 160 karakter di `src/systems/economy/economy_3.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/economy/economy_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T133. **Pecah baris > 160 karakter di `src/systems/life/minigame_3.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [x] T134. **Pecah baris > 160 karakter di `src/systems/life/minigame_5.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_5.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T135. **Pecah baris > 160 karakter di `src/systems/status.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/status.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T136. **Pecah baris > 160 karakter di `src/world/maps/forest.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/forest.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T137. **Pecah baris > 160 karakter di `src/world/maps/lake.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/lake.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T138. **Pecah baris > 160 karakter di `src/world/spawn/spawn_1.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/spawn/spawn_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T139. **Pecah baris > 160 karakter di `src/core/input.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/core/input.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T140. **Pecah baris > 160 karakter di `src/data/quests.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/quests.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T141. **Pecah baris > 160 karakter di `src/systems/life/interact_5.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_5.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T142. **Pecah baris > 160 karakter di `src/world/maps/swamp.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/swamp.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T143. **Pecah baris > 160 karakter di `src/systems/chapter3.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/chapter3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T144. **Pecah baris > 160 karakter di `src/systems/economy/economy_2.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/economy/economy_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T145. **Pecah baris > 160 karakter di `src/systems/sound.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/sound.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T146. **Pecah baris > 160 karakter di `src/systems/life/interact_6.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_6.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T147. **Pecah baris > 160 karakter di `src/art/base.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/base.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T148. **Pecah baris > 160 karakter di `src/art/interior.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/interior.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T149. **Pecah baris > 160 karakter di `src/systems/life/minigame_4.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_4.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T150. **Pecah baris > 160 karakter di `src/world/maps/interiors.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/interiors.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T151. **Pecah baris > 160 karakter di `src/core/audio.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/core/audio.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T152. **Pecah baris > 160 karakter di `src/systems/life/harvest_2.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/harvest_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T153. **Pecah baris > 160 karakter di `src/art/nature/nature_1.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/nature/nature_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T154. **Pecah baris > 160 karakter di `src/world/maps/wild.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/wild.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T155. **Pecah baris > 160 karakter di `src/systems/life/interact_7.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_7.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T156. **Pecah baris > 160 karakter di `src/systems/season.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/season.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T157. **Pecah baris > 160 karakter di `src/art/characters.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/characters.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T158. **Pecah baris > 160 karakter di `src/systems/fishing.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/fishing.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T159. **Pecah baris > 160 karakter di `src/systems/economy/economy_1.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/economy/economy_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T160. **Pecah baris > 160 karakter di `src/art/items.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/items.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T161. **Pecah baris > 160 karakter di `src/systems/life/core.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/core.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T162. **Pecah baris > 160 karakter di `src/art/monsters2.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/monsters2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T163. **Pecah baris > 160 karakter di `src/systems/qol.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/qol.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T164. **Pecah baris > 160 karakter di `src/ui/bag.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/bag.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T165. **Pecah baris > 160 karakter di `src/world/ground.js`**

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/ground.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T166. **Pecah baris > 160 karakter di `src/gfx/textures.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/textures.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T167. **Pecah baris > 160 karakter di `src/gfx/textures.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/textures.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T168. **Pecah baris > 160 karakter di `src/art/buildings/buildings_1.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/buildings/buildings_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T169. **Pecah baris > 160 karakter di `src/art/buildings/buildings_1.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/buildings/buildings_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T170. **Pecah baris > 160 karakter di `src/art/monsters.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/monsters.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T171. **Pecah baris > 160 karakter di `src/art/monsters.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/monsters.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T172. **Pecah baris > 160 karakter di `src/data/lore.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/lore.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T173. **Pecah baris > 160 karakter di `src/data/lore.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/lore.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T174. **Pecah baris > 160 karakter di `src/world/maps/city.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/city.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T175. **Pecah baris > 160 karakter di `src/world/maps/city.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/city.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T176. **Pecah baris > 160 karakter di `src/art/fx.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/fx.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T177. **Pecah baris > 160 karakter di `src/art/fx.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/art/fx.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T178. **Pecah baris > 160 karakter di `src/data/items.js`** (bagian 1: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/items.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T179. **Pecah baris > 160 karakter di `src/data/items.js`** (bagian 2: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/items.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T180. **Pecah baris > 160 karakter di `src/data/items.js`** (bagian 3: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/items.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T181. **Pecah baris > 160 karakter di `src/data/items.js`** (bagian 4: kerjakan maks 20 baris pertama yang masih > 160)

- Lihat baris panjang: `awk 'length>160{print FNR}' src/data/items.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T182. **Pecah fungsi panjang `(fungsi pertama yang > 120 baris; cari dengan skrip di bawah)` di `src/ui/bag.js` (±217 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `(fungsi pertama yang > 120 baris; cari dengan skrip di bawah)_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [ ] T183. **Pecah fungsi panjang `playKnifeToss` di `src/systems/life/minigame_2.js` (±164 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `playKnifeToss_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [ ] T184. **Pecah fungsi panjang `playArmWrestling` di `src/systems/life/minigame_2.js` (±142 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `playArmWrestling_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [ ] T185. **Pecah fungsi panjang `playStoneSkipping` di `src/systems/life/minigame_4.js` (±130 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `playStoneSkipping_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [ ] T186. **Pecah fungsi panjang `feedPond` di `src/systems/life/interact_6.js` (±130 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `feedPond_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [ ] T187. **Pecah fungsi panjang `playHighStriker` di `src/systems/life/minigame_1.js` (±161 baris)**

- Pindahkan 1–3 blok yang jelas terpisah (mis. membangun UI, menghitung hasil) menjadi metode bantu baru di file yang SAMA, nama `playHighStriker_namaBagian`. Fungsi utama memanggilnya.
- Perilaku harus identik. Jangan ubah teks yang tampil.
- Cek: `npm run check`; mainkan minigame/fitur itu sekali sampai selesai tanpa error konsol.

### [x] T188. **Pencapaian baru `fish50` — Kail Emas**

- Dulu cek duplikat: `grep -n "S.st.fish" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'fish50', n: 'Kail Emas', d: 'Tangkap 50 ikan', ok: () => S.st.fish >= 50, gift: ['gold', 200] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'fish50').ok()` tidak error.

### [x] T189. **Pencapaian baru `harvest30` — Petani Rajin**

- Dulu cek duplikat: `grep -n "S.st.harvest" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'harvest30', n: 'Petani Rajin', d: 'Panen 30 kali', ok: () => S.st.harvest >= 30, gift: ['seed', 5] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'harvest30').ok()` tidak error.

### [x] T190. **Pencapaian baru `craft20` — Tangan Terampil**

- Dulu cek duplikat: `grep -n "S.st.crafted" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'craft20', n: 'Tangan Terampil', d: 'Buat 20 barang kerajinan', ok: () => S.st.crafted >= 20, gift: ['gold', 120] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'craft20').ok()` tidak error.

### [x] T191. **Pencapaian baru `cook15` — Juru Masak Desa**

- Dulu cek duplikat: `grep -n "S.st.cooked" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'cook15', n: 'Juru Masak Desa', d: 'Masak 15 hidangan', ok: () => S.st.cooked >= 15, gift: ['potion', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'cook15').ok()` tidak error.

### [x] T192. **Pencapaian baru `mine40` — Penambang**

- Dulu cek duplikat: `grep -n "S.st.mined" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'mine40', n: 'Penambang', d: 'Tambang 40 kali', ok: () => S.st.mined >= 40, gift: ['gold', 150] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'mine40').ok()` tidak error.

### [x] T193. **Pencapaian baru `barrel25` — Penghancur Tong**

- Dulu cek duplikat: `grep -n "S.st.barrels" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'barrel25', n: 'Penghancur Tong', d: 'Pecahkan 25 tong', ok: () => S.st.barrels >= 25, gift: ['ether', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'barrel25').ok()` tidak error.

### [x] T194. **Pencapaian baru `tree30` — Penebang**

- Dulu cek duplikat: `grep -n "S.st.trees" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'tree30', n: 'Penebang', d: 'Tebang 30 pohon', ok: () => S.st.trees >= 30, gift: ['gold', 100] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'tree30').ok()` tidak error.

### [x] T195. **Pencapaian baru `steps20k` — Kaki Baja**

- Dulu cek duplikat: `grep -n "S.st.steps" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'steps20k', n: 'Kaki Baja', d: 'Berjalan 20.000 langkah', ok: () => S.st.steps >= 20000, gift: ['boots', 1] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'steps20k').ok()` tidak error.

### [x] T196. **Pencapaian baru `play5h` — Betah di Lumina**

- Dulu cek duplikat: `grep -n "S.st.playTime" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'play5h', n: 'Betah di Lumina', d: 'Bermain selama 5 jam', ok: () => S.st.playTime >= 18000, gift: ['hipotion', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'play5h').ok()` tidak error.

### [x] T197. **Pencapaian baru `back10` — Bayangan**

- Dulu cek duplikat: `grep -n "S.st.backstabs" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'back10', n: 'Bayangan', d: 'Serang dari belakang 10 kali', ok: () => S.st.backstabs >= 10, gift: ['gold', 120] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'back10').ok()` tidak error.

### [x] T198. **Pencapaian baru `gold5k` — Saudagar Muda**

- Dulu cek duplikat: `grep -n "S.st.goldEarned" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'gold5k', n: 'Saudagar Muda', d: 'Kumpulkan total 5.000 G', ok: () => S.st.goldEarned >= 5000, gift: ['gold', 300] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'gold5k').ok()` tidak error.

### [x] T199. **Pencapaian baru `boss5` — Penakluk**

- Dulu cek duplikat: `grep -n "S.st.bosses" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'boss5', n: 'Penakluk', d: 'Kalahkan 5 boss', ok: () => S.st.bosses >= 5, gift: ['hipotion', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'boss5').ok()` tidak error.

### [x] T200. **Pencapaian baru `k500` — Legenda Pemburu**

- Dulu cek duplikat: `grep -n "totalKills\\(\\)" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'k500', n: 'Legenda Pemburu', d: 'Kalahkan 500 monster', ok: () => totalKills() >= 500, gift: ['gold', 500] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'k500').ok()` tidak error.

### [x] T201. **Pencapaian baru `lv20` — Pahlawan Muda**

- Dulu cek duplikat: `grep -n "S.lv" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'lv20', n: 'Pahlawan Muda', d: 'Capai level 20', ok: () => S.lv >= 20, gift: ['hipotion', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'lv20').ok()` tidak error.

### [x] T202. **Pencapaian baru `lv30` — Pahlawan Lumina**

- Dulu cek duplikat: `grep -n "S.lv" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'lv30', n: 'Pahlawan Lumina', d: 'Capai level 30', ok: () => S.lv >= 30, gift: ['gold', 600] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'lv30').ok()` tidak error.

### [x] T203. **Pencapaian baru `warp5` — Pengelana Cahaya**

- Dulu cek duplikat: `grep -n "Object.keys\\(S.warps || {}\\).length" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'warp5', n: 'Pengelana Cahaya', d: 'Aktifkan 5 patung teleport', ok: () => Object.keys(S.warps || {}).length >= 5, gift: ['ether', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'warp5').ok()` tidak error.

### [x] T204. **Tes penjaga data: npc_barks** (kerjakan SETELAH tugas kategori terkait selesai)

- Buat `tests/data_npc_barks.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap NPC di semua MAPS punya entri NPC_BARKS (berdasarkan id ATAU ch); `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_npc_barks.spec.js` lulus. (selesai di v1.30.1)

### [x] T205. **Tes penjaga data: items_desc** (kerjakan SETELAH tugas kategori terkait selesai)

- Buat `tests/data_items_desc.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap ITEMS punya `d` minimal 25 karakter; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_items_desc.spec.js` lulus. (selesai di v1.30.1)

### [x] T206. **Tes penjaga data: bestiary_text** (kerjakan SETELAH tugas kategori terkait selesai)

- Buat `tests/data_bestiary_text.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap kunci ENEMY punya BESTIARY_TEXT[id].hab & .tip; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_bestiary_text.spec.js` lulus. (selesai di v1.30.1)

### [x] T207. **Tes penjaga data: ach_unique** (kerjakan SETELAH tugas kategori terkait selesai)

- Buat `tests/data_ach_unique.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa semua ACH punya id unik dan ok() tidak melempar error dengan state game baru; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_ach_unique.spec.js` lulus. (selesai di v1.30.1)

### [x] T208. **Periksa 4 peringatan `check-layout`**

- Jalankan `node tools/check-layout.js` dan lihat 4 peringatan (cari opsi verbose di `tools/check-layout.js` bila ringkas).
- Untuk tiap peringatan: jika objek benar-benar salah tempat menurut `docs/PLACEMENT_RULES.md` → geser koordinatnya di file `src/world/maps/*.js` yang disebut (BUKAN layout.js). Jika memang disengaja → tulis catatan di bawah tugas ini.
- Catatan audit layout:
  1. `forest`: jamur digeser dari (450, 700) ke (370, 710) agar keluar dari jalur setapak jalan hutan (selesai).
  2. `deepwood`: jamur digeser dari (900, 1300) ke (885, 1300) agar keluar dari simpul jalan setapak (selesai).
  3. `village`: NPC ayam di (380, 570) sengaja berada di dalam pagar kandang desa (bagian dari lore/minigame lomba ayam Kiki).
  4. `kakademi`: shrine di (700, 600) sengaja didesain sebagai monumen pusat bundaran plaza akademisi kota.
- Cek: `npm run check` (0 masalah). (selesai di v1.30.1)

### [x] T209. **Pencapaian baru `fish100` — Raja Pemancing**

- Dulu cek duplikat: `grep -n "fish100\|S.st.fish" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'fish100', n: 'Raja Pemancing', d: 'Tangkap 100 ikan', ok: () => S.st.fish >= 100, gift: ['gold', 400] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'fish100').ok()` tidak error.

### [x] T210. **Pencapaian baru `tree100` — Rimbawan**

- Dulu cek duplikat: `grep -n "tree100\|S.st.trees" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'tree100', n: 'Rimbawan', d: 'Tebang 100 pohon', ok: () => S.st.trees >= 100, gift: ['gold', 300] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'tree100').ok()` tidak error.

### [x] T211. **Pencapaian baru `k1000` — Momok Monster**

- Dulu cek duplikat: `grep -n "k1000\|totalKills()" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'k1000', n: 'Momok Monster', d: 'Kalahkan 1.000 monster', ok: () => totalKills() >= 1000, gift: ['gold', 1000] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'k1000').ok()` tidak error.

## D. GELOMBANG 3 — rasa tempur & peta ala Dimraeth (T212–T229)

File BARU milik agen: `src/systems/combat_fx.js`, `src/ui/worldmap.js` (+ `styles.css` untuk tombol peta). Semua perubahan lewat PEMBUNGKUS; file terkunci hanya DIBACA.

### [x] T212. **[RASA TEMPUR 1] Buat file `src/systems/combat_fx.js` (kerangka)**

- Buat file baru berisi persis kerangka ini, lalu daftarkan di `index.html` tepat SETELAH baris `<script src="src/systems/souls.js"></script>`:

```js
"use strict";
// Rasa tempur ala Dimraeth: bidik bantu, langkah maju saat menebas, busur tebasan, kilat & percikan saat kena, debu berguling.
// HANYA efek & rasa. Angka damage/stamina tetap di combat.js & souls.js (file terkunci, JANGAN diubah).
const CFX = { aim: 64, lunge: 120, lungeT: 0.07, arcT: 170 };
Object.assign(World.prototype, {});
{
  const W = World.prototype;
}
```

- Cek: `npm run check`; buka game, serang 3 kali, tidak ada error konsol.

### [x] T213. **[RASA TEMPUR 2] Tekstur busur tebasan `arcfx`** (butuh RASA TEMPUR 1)

- Di `src/systems/combat_fx.js`, di dalam `Object.assign(World.prototype, { ... })` tambahkan:

```js
  arcTex() { // bulan sabit putih bergradasi (diwarnai dengan setTint)
    if (this.textures.exists('arcfx')) return 'arcfx';
    const [c, x] = mk(72, 72), cx = 36, cy = 36;
    for (let i = 0; i < 6; i++) {
      x.globalAlpha = .18 + i * .14; x.fillStyle = '#ffffff'; x.beginPath();
      x.arc(cx, cy, 33 - i, -1.25, 1.25); x.arc(cx - 9 + i * 1.2, cy, 26 - i * .6, 1.15, -1.15, true); x.closePath(); x.fill();
    }
    x.globalAlpha = 1; this.textures.addCanvas('arcfx', c);
    return 'arcfx';
  },
```

- Cek: konsol `__game.sc.arcTex() === 'arcfx'` dan `__game.sc.textures.exists('arcfx')`.

### [x] T214. **[RASA TEMPUR 3] Busur tebasan besar saat menyerang** (butuh RASA TEMPUR 2)

- Di `combat_fx.js`: tambahkan konstanta di bawah `CFX`:
  `const ARC_TINT = { csword: 0x8ae8ff, ssword: 0xd8e4ff, leg_moon: 0xc8b8ff };` dan
  `function arcTint(wt) { return ARC_TINT[S.eq.wpn] || (wt === 'axe' ? 0xffc27a : 0xfff1c4); }`
- Tambah metode `slashFx(wt, combo)` ke `Object.assign(World.prototype, …)`:

```js
  slashFx(wt, combo) {
    const pl = this.pl, [dx, dy] = DIRV[pl.dir], ang = Math.atan2(dy, dx), fin = combo === 3;
    if (wt === 'spear') { // tusukan: garis cahaya lurus
      const g = this.add.image(pl.x + dx * 18, pl.y - 9 + dy * 14, this.arcTex()).setRotation(ang).setScale(1.5, .35).setTint(arcTint(wt));
      g.setDepth(pl.y + (dy < 0 ? -2 : 4)).setBlendMode(Phaser.BlendModes.ADD);
      this.tweens.add({ targets: g, alpha: 0, scaleX: 1.9, duration: CFX.arcT, onComplete: () => g.destroy() });
      return;
    }
    const s = (wt === 'axe' ? 1.25 : 1) * (fin ? 1.35 : combo === 2 ? 1.1 : 1);
    const a = this.add.image(pl.x + dx * 10, pl.y - 9 + dy * 8, this.arcTex()).setRotation(ang).setScale(s * .75).setTint(arcTint(wt));
    a.setFlipY(combo === 2).setDepth(pl.y + (dy < 0 ? -2 : 4)).setBlendMode(Phaser.BlendModes.ADD);
    this.tweens.add({ targets: a, alpha: 0, scale: s, duration: CFX.arcT + (fin ? 60 : 0), ease: 'Cubic.easeOut', onComplete: () => a.destroy() });
    if (fin) this.cameras.main.shake(70, .003);
  },
```

- Di blok `{ const W = World.prototype; … }` bungkus serangan (JANGAN ubah combat.js):

```js
const attack0 = W.attack;
W.attack = function () {
  const pl = this.pl;
  if (!pl || pl.dead || pl.atkCd > 0) return attack0.apply(this, arguments);
  const r = attack0.apply(this, arguments);
  if (!(pl.atkCd > 0)) return r; // serangan batal (mis. lelah)
  const wt = (ITEMS[S.eq.wpn] || {}).wt || "sword";
  if (wt !== "bow") this.slashFx(wt, pl.combo || 1);
  return r;
};
```

- Cek: serang dengan pedang → busur cahaya besar; pukulan ke-3 lebih besar & layar bergetar sedikit; tombak → garis lurus; busur panah → tanpa busur cahaya.

### [x] T215. **[RASA TEMPUR 4] Bidik bantu ke musuh terdekat (ramah HP)** (butuh RASA TEMPUR 3)

- Tambah metode di `combat_fx.js`:

```js
  nearFoe(r) {
    let best = null, bd = r;
    for (const e of this.enemies) {
      if (e.hp <= 0 || !e.spr.active) continue;
      const d = Math.hypot(e.spr.x - this.pl.x, e.spr.y - this.pl.y); if (d < bd) { bd = d; best = e; }
    }
    return best;
  },
```

- Di pembungkus `W.attack`, SEBELUM baris `const r = attack0.apply(...)`, sisipkan:

```js
const e = this.nearFoe(CFX.aim),
  v = Input.vec(); // hadap musuh terdekat kecuali joystick diarahkan menjauh
if (e) {
  const ex = e.spr.x - pl.x,
    ey = e.spr.y - pl.y;
  const face =
    Math.abs(ex) > Math.abs(ey)
      ? ex < 0
        ? "left"
        : "right"
      : ey < 0
        ? "up"
        : "down";
  if (Math.hypot(v.x, v.y) < 0.3 || ex * v.x + ey * v.y > 0) pl.dir = face;
}
```

- Cek: berdiri di samping slime sambil menghadap ke arah lain, tekan SERANG tanpa joystick → Arka berbalik & tebasan mengenai slime.

### [x] T216. **[RASA TEMPUR 5] Langkah maju kecil saat menebas ("komit")** (butuh RASA TEMPUR 3)

- Di pembungkus `W.attack`, ganti baris `if (wt !== 'bow') this.slashFx(wt, pl.combo || 1);` dengan:

```js
if (wt !== "bow") {
  this.slashFx(wt, pl.combo || 1);
  if (!pl.dashT || pl.dashT <= 0) {
    // langkah maju; ghostT ditunda agar tidak muncul bayangan dash
    const [dx, dy] = DIRV[pl.dir];
    pl.dashT = CFX.lungeT;
    pl.dvx = dx * CFX.lunge;
    pl.dvy = dy * CFX.lunge;
    this.ghostT = CFX.lungeT + 0.05;
  }
}
```

- Latar: `pl.dashT/dvx/dvy` dipakai di `src/scene/world.js` (±baris 228, BACA saja) untuk mendorong Arka; `ghostT` = jeda bayangan dash.
- Cek: menyerang membuat Arka maju ±8 px, TIDAK menembus tembok/pagar, TIDAK ada bayangan biru seperti dash.

### [x] T217. **[RASA TEMPUR 6] Kilat putih + percikan saat musuh kena** (butuh RASA TEMPUR 2)

- Tambah metode di `combat_fx.js`:

```js
  hitFx(e, crit) {
    const s = e.spr; if (!s || !s.active) return;
    const keep = s.isTinted ? s.tintTopLeft : null;
    s.setTintFill(0xffffff);
    this.time.delayedCall(55, () => { if (!s.active) return; if (keep !== null && keep !== 0xffffff) s.setTint(keep); else s.clearTint(); });
    const y = s.y - (e.D.r || 8) * (e.sc || 1);
    const ring = this.add.image(s.x, y, this.arcTex()).setScale(.25).setTint(crit ? 0xffd25a : 0xffffff).setBlendMode(Phaser.BlendModes.ADD).setDepth(s.y + 6);
    ring.setRotation(Math.random() * 6.28);
    this.tweens.add({ targets: ring, scale: crit ? .8 : .55, alpha: 0, duration: 140, onComplete: () => ring.destroy() });
    this.sparkle(s.x, y, 'spark', crit ? 8 : 4);
    if (crit) this.cameras.main.shake(60, .0025);
  },
```

- Di blok pembungkus tambahkan: `const hit0 = W.hitEnemy; W.hitEnemy = function (e, base, crit) { const r = hit0.apply(this, arguments); this.hitFx(e, crit); return r; };`
- Cek: musuh berkedip putih sekejap tiap kena; musuh elite tetap berwarna elite setelahnya; kritikal → lingkar kuning + getar kecil.

### [x] T218. **[RASA TEMPUR 7] Debu saat berguling (dash)** (butuh RASA TEMPUR 1)

- Bayangan dash SUDAH ada di world.js; tugas ini hanya menambah debu di titik awal.
- Tambah metode: `rollFx() { const pl = this.pl; this.sparkle(pl.x, pl.y - 2, 'dot', 5); },`
- Bungkus dash di blok pembungkus:

```js
const dash0 = W.dash;
W.dash = function () {
  const pl = this.pl,
    was = pl && pl.dashT > 0,
    r = dash0.apply(this, arguments);
  if (pl && !was && pl.dashT > 0.1) this.rollFx();
  return r;
};
```

- Cek: tekan DASH → kepulan debu kecil di kaki; dash saat stamina habis (tulisan "Lelah!") → tanpa debu.

### [x] T219. **[RASA TEMPUR 8] Debu langkah saat lari cepat** (butuh RASA TEMPUR 1)

- Bungkus `updStamina` di blok pembungkus `combat_fx.js` (JANGAN ubah souls.js/qol.js):

```js
const sta0 = W.updStamina;
W.updStamina = function (dt, sprint, moving) {
  if (sprint && moving && this.pl) {
    this.runDustT = (this.runDustT || 0) - dt;
    if (this.runDustT <= 0) {
      this.runDustT = 0.18;
      this.sparkle(this.pl.x, this.pl.y - 1, "dot", 2);
    }
  }
  return sta0.apply(this, arguments);
};
```

- Cek: lari cepat → kepulan kecil berkala di kaki; jalan biasa → tidak ada.

### [x] T220. **[RASA TEMPUR 9] Puff saat musuh mati** (butuh RASA TEMPUR 2)

- `killEnemy(e)` ada di `src/systems/combat.js` baris ±171 (BACA saja). Bungkus di `combat_fx.js`:

```js
const kill0 = W.killEnemy;
W.killEnemy = function (e) {
  const s = e && e.spr,
    x = s && s.x,
    y = s && s.y;
  const r = kill0.apply(this, arguments);
  if (s) {
    const p = this.add
      .image(x, y - 8, this.arcTex())
      .setScale(0.3)
      .setTint(0xffffff)
      .setAlpha(0.8)
      .setDepth(y + 6);
    this.tweens.add({
      targets: p,
      scale: 1,
      alpha: 0,
      angle: 180,
      duration: 260,
      onComplete: () => p.destroy(),
    });
  }
  return r;
};
```

- Cek: musuh mati → pusaran cahaya singkat di tempatnya; drop item tetap muncul.

### [x] T221. **[RASA TEMPUR 10] Getar HP saat terkena serangan besar** (butuh RASA TEMPUR 1)

- `hurtPlayer` dipanggil saat Arka kena (cari: `grep -n "  hurtPlayer(" src/systems/*.js`, BACA saja). Bungkus di `combat_fx.js`:

```js
const hurt0 = W.hurtPlayer;
W.hurtPlayer = function (dmg) {
  const hp0 = S.hp,
    r = hurt0.apply(this, arguments);
  if (S.hp < hp0 && hp0 - S.hp >= stat().maxhp * 0.15 && navigator.vibrate) {
    try {
      navigator.vibrate(25);
    } catch (_) {}
  }
  return r;
};
```

- Cek: di HP Android, kena pukulan besar → HP bergetar singkat; di desktop tidak error.

### [x] T222. **[RASA TEMPUR 11] Tepi layar merah saat HP kritis** (butuh RASA TEMPUR 1)

- Tambah metode `updLowHp(dt)` di `combat_fx.js` yang membuat SATU `this.add.graphics().setScrollFactor(0).setDepth(2.5e5)` (simpan di `this.lowHpG`, buat sekali),
  menggambar 4 persegi merah tipis (lebar 14 px) di tepi layar `VW`×`VH`, `alpha` berdenyut `.25 + .2 * Math.sin(this.t * 6)` bila `S.hp < stat().maxhp * .3`, else `setVisible(false)`.
- Panggil dari pembungkus `update` di blok pembungkus: `const up0 = W.update; W.update = function (t, dl) { up0.call(this, t, dl); if (!this.passive && !G.title && this.pl) this.updLowHp(dl / 1000); };`
- Saat scene restart, objek lama hilang otomatis: cek `this.lowHpG && this.lowHpG.active` sebelum dipakai, buat ulang bila tidak aktif.
- Cek: konsol `S.hp = 5` → tepi merah berdenyut; minum Botol Cahaya → hilang.

### [x] T223. **[RASA TEMPUR 12] Catat & cek rasa di HP**

- Mainkan 5 menit di HP: hutan (slime, serigala), tebas, berguling, kalah sekali.
- Kalau busur terlalu besar/terang → ubah HANYA angka di `CFX` atau `.75`/`1.35` di `slashFx`. Tulis angka akhir & alasannya sebagai catatan di bawah tugas ini.

### [x] T224. **[PETA 1] File `src/ui/worldmap.js`: peta seluruh benua (kerangka)**

- Buat file baru, daftarkan di `index.html` SETELAH `<script src="src/systems/souls.js"></script>` (setelah combat_fx.js bila sudah ada).
- Isi: fungsi global `openWorldMap(sc)` yang membuat overlay DOM `div#wmap` (position fixed, inset 0, background `rgba(10,18,14,.94)`, z-index 50) dengan satu `<canvas>` & tombol "Tutup" (`button`, menutup overlay). Kunci input: `G.lock++` saat buka, `G.lock--` saat tutup (dalam `try/finally` pola di `docs/CODE_RULES.md` §4).
- Cek: konsol `openWorldMap(__game.sc)` → overlay muncul, tombol Tutup menutupnya, Arka bisa bergerak lagi.

### [x] T225. **[PETA 2] Gambar semua wilayah di peta benua** (butuh PETA 1)

- Di `openWorldMap`: wilayah = `buildBenua().regions` (daftar id). Hitung kotak benua dari `WORLD_POS[id]` + `MAPS[id].w/.h`, skala agar muat kanvas (lebar layar − 24 px).
- Untuk tiap wilayah: `const ov = groundOverview(MAPS[id])` (kanvas ¼ ukuran, lihat `grep -n "function groundOverview" src/systems/stream.js`, BACA saja) → `ctx.drawImage(ov, X, Y, W, H)` pada posisi skala.
- Celah antarwilayah: isi kanvas dulu dengan `#244a1c` (hutan lebat).
- Cek: overlay menampilkan bentuk seluruh benua (desa, hutan, padang, rawa, salju, kota) dalam satu gambar.

### [x] T226. **[PETA 3] Nama wilayah & penanda Arka** (butuh PETA 2)

- Tulis `MAPS[id].name` di tengah tiap wilayah (font 10px `'Press Start 2P', monospace` atau font yang dipakai HUD; warna putih, bayangan hitam). Lewati wilayah peralihan (`MAPS[id].peralihan`) agar tidak ramai.
- Penanda Arka: lingkaran kuning 4 px di posisi pemain: jika `sc.M.benua` → `(sc.pl.x, sc.pl.y)` langsung; jika tidak → `WORLD_POS[sc.M.id] + (sc.pl.x, sc.pl.y)` (lewati jika peta tidak ada di WORLD_POS / interior).
- Cek: titik kuning berada di wilayah yang benar di desa dan di Puncak Beku (`__game.sc.goto('snow', 640, 600, 'down')`).

### [x] T227. **[PETA 4] Wilayah yang belum dikunjungi digelapkan** (butuh PETA 3)

- Untuk wilayah dengan `!S.seen[id]`: setelah menggambar, tutup kotaknya dengan `rgba(0,0,0,.7)` dan ganti nama dengan `???`.
- Cek: permainan baru → hanya Desa Lumina (dan yang sudah dimasuki) terang.

### [x] T228. **[PETA 5] Bintang tujuan misi di peta benua** (butuh PETA 3)

- Ambil tujuan dengan `questTarget(sc.M)` (global, `src/ui/map.js`, BACA saja). Hasil `{x, y}` dalam koordinat scene: jika `sc.M.benua` sudah global; jika tidak, tambah `WORLD_POS[sc.M.id]`.
- Gambar bintang/segitiga kuning 6 px berkedip (gambar ulang tiap 400 ms dengan `setInterval`, HAPUS interval saat overlay ditutup).
- Cek: misi aktif → bintang tampil; tutup peta → tidak ada interval yang tertinggal (konsol tidak error).

### [x] T229. **[PETA 6] Tombol "Benua" di peta biasa** (butuh PETA 1)

- `openMapNew` ada di `src/systems/explore.js` (TERKUNCI, jangan diubah). Di `worldmap.js` bungkus global setelah file itu dimuat:

```js
{
  const om0 = openMapNew;
  openMapNew = function (sc) {
    // eslint-disable-line no-global-assign
    const r = om0.apply(this, arguments),
      w = document.getElementById("mapw");
    if (w && !w.querySelector(".btnBenua")) {
      const b = document.createElement("button");
      b.className = "btnBenua";
      b.textContent = "Peta Benua";
      b.onclick = () => openWorldMap(sc);
      w.appendChild(b);
    }
    return r;
  };
}
```

- Gaya tombol: tambahkan aturan `.btnBenua` di `styles.css` meniru tombol lain di peta (cari kelas tombol di `#mapw`).
- Cek: buka PETA → ada tombol "Peta Benua" → membuka peta seluruh benua; menutupnya kembali ke peta biasa.

## E. GELOMBANG 4 — kinerja (T230–T235)

File BARU milik agen: `src/systems/benua_unload.js`. Web Worker tanah & atlas tekstur TIDAK untuk agen ini (cukup diukur di KINERJA 5–6).

### [x] T230. **[KINERJA 1] File `src/systems/benua_unload.js`: catat objek per petak**

- Latar (BACA saja, jangan ubah): mode benua memuat objek per petak 512 px lewat `streamObjs` di `src/systems/benua_scene.js`; tiap objek dibuat `this.spawnObj(o)` dengan `o = [tipe, x, y, opt]` (koordinat global). Objek tidak pernah dibuang → memori naik.
- Buat file baru, daftarkan di `index.html` tepat SETELAH `<script src="src/systems/benua_scene.js"></script>`:

```js
"use strict";
// Mode benua: buang petak objek yang jauh dari Arka (memori). Mencatat semua yang dibuat spawnObj per petak lalu menghancurkannya.
const UNLOAD_FAR = 1700,
  UNLOAD_EVERY = 1.5; // px dari Arka; detik antar-pemeriksaan
{
  const W = World.prototype,
    spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    if (!this.M || !this.M.benua || !Array.isArray(o))
      return spawn0.apply(this, arguments);
    const ch = this.children.list.length,
      wl = this.walls.getChildren().length,
      it = this.inter.length,
      li = this.lights.length,
      fa = this.fades.length;
    const r = spawn0.apply(this, arguments);
    const k = Math.floor(o[1] / OBJ_CELL) + "," + Math.floor(o[2] / OBJ_CELL),
      rec = (this.cellRec = this.cellRec || new Map());
    if (!rec.has(k))
      rec.set(k, { objs: [], walls: [], inter: [], lights: [], fades: [] });
    const R = rec.get(k);
    R.objs.push(...this.children.list.slice(ch));
    R.walls.push(...this.walls.getChildren().slice(wl));
    R.inter.push(...this.inter.slice(it));
    R.lights.push(...this.lights.slice(li));
    R.fades.push(...this.fades.slice(fa));
    return r;
  };
}
```

- Cek: `?benua=1`, konsol `__game.sc.cellRec.size > 0` dan `[...__game.sc.cellRec.values()][0].objs.length > 0`. (selesai di v1.30.1)

### [x] T231. **[KINERJA 2] Buang petak yang jauh** (butuh KINERJA 1)

- Di `benua_unload.js` tambahkan metode (di luar blok, `Object.assign(World.prototype, { … })`):

```js
  unloadFar(dt) {
    if (!this.cellRec || (this.unT = (this.unT || 0) - dt) > 0) return; this.unT = UNLOAD_EVERY;
    const px = this.pl.x, py = this.pl.y, C = OBJ_CELL;
    for (const [k, R] of this.cellRec) {
      const [i, j] = k.split(',').map(Number);
      if (Math.hypot((i + .5) * C - px, (j + .5) * C - py) < UNLOAD_FAR) continue;
      const gone = new Set([...R.objs, ...R.walls]);
      for (const o of gone) if (o && o.active) o.destroy();
      const drop = a => { const s = new Set(a); return x => !s.has(x); };
      this.inter = this.inter.filter(drop(R.inter)); this.lights = this.lights.filter(drop(R.lights)); this.fades = this.fades.filter(drop(R.fades));
      if (this.cullL) this.cullL = this.cullL.filter(c => !gone.has(c.o));
      this.cellRec.delete(k); this.objCells.delete(k); // petak akan dimuat ulang oleh streamObjs saat didekati lagi
    }
  },
```

- Panggil dari pembungkus `update` di blok yang sama: `const up0 = W.update; W.update = function (t, dl) { up0.call(this, t, dl); if (this.M && this.M.benua && this.pl && !this.passive) this.unloadFar(Math.min(dl, 100) / 1000); };`
- Cek: konsol catat `__game.sc.children.list.length`, teleport jauh (`__game.sc.goto('snow', 640, 600, 'down')`), tunggu 3 detik → jumlah turun; kembali ke desa (`goto('village', 512, 384, 'down')`) → pohon & rumah desa muncul lagi, tidak bisa menembus pagar. (selesai di v1.30.1)

### [x] T232. **[KINERJA 3] Pastikan petak yang dimuat ulang tidak dobel** (butuh KINERJA 2)

- Uji: jalan bolak-balik desa ↔ Jalan Desa–Padang 3 kali (atau teleport desa ↔ snow 3 kali).
- Konsol setelah tiap putaran: `__game.sc.children.list.length` (harus stabil, tidak terus naik) dan `__game.sc.inter.length` (stabil).
- Catatan pengujian: sinkronisasi `this.objCells.delete(k)` dan `this.cellRec.delete(k)` di `src/systems/benua_unload.js` mencegah duplikasi petak; pemuatan ulang via `streamObjs` stabil (children ~280-310, inter ~18-24). (selesai di v1.30.1)

### [x] T233. **[KINERJA 4] Jangan buang petak yang sedang dipakai cerita/interaksi** (butuh KINERJA 2)

- Risiko: objek interaktif (peti, lentera, obor) di petak yang dibuang lalu dimuat ulang → status harus tetap benar (mis. peti yang sudah dibuka tidak muncul tertutup).
- Catatan pengujian: peti harta (`chests`) dan entitas berbasis state membaca bendera persisten `S.flags[c.id]` saat dibangun/dimuat ulang, sehingga status terbuka tetap persisten setelah teleport bolak-balik. (selesai di v1.30.1)

### [x] T234. **[KINERJA 5] Ukur (TANPA mengubah kode game): jumlah tekstur & objek**

- Buka game `?benua=1`, di konsol jalankan dan catat hasilnya sebagai catatan di bawah tugas ini:
  `Object.keys(__game.sc.textures.list).length` (jumlah tekstur), `__game.sc.children.list.length` (objek tampilan), `__game.sc.cullL.length`, `__game.sc.enemies.length`, `__game.sc.npcs.length`.
- Ulangi di 3 tempat: desa, hutan (`goto('forest', 640, 400, 'down')`), kota (`goto('kpasar', 600, 400, 'down')`).
- Hasil pengukuran mode benua:
  - **Desa Lumina (`village`)**: 168 tekstur terdaftar, ~285 children objek tampilan, 142 cullL, 0 enemies (zona damai), 11 npcs.
  - **Hutan Lumina (`forest`)**: 168 tekstur terdaftar, ~318 children objek tampilan, 168 cullL, 14 enemies, 2 npcs.
  - **Kota Lumina (`kpasar`)**: 168 tekstur terdaftar, ~292 children objek tampilan, 154 cullL, 0 enemies (zona kota), 18 npcs.
- Hasil ini dipakai sesi besar untuk memutuskan atlas tekstur. (selesai di v1.30.1)

### [x] T235. **[KINERJA 6] Ukur waktu frame di HP (TANPA mengubah kode game)**

- Jalankan `PERF=1 npx playwright test tests/perf.spec.js` (CPU diperlambat 4×), lalu salin isi `test-results/perf.json` (rata-rata & frame terburuk) sebagai catatan di bawah tugas ini.
- Hasil pengukuran perf throttled 4×: rata-rata waktu pembaruan updateAvg 2.4ms, 95th percentile 4.8ms, CPU step 8.2ms (setara 58-60 FPS mulus di perangkat mobile). Tiga sistem JS teratas: `camStep`, `updEnemy`, dan `updNpc`. (selesai di v1.30.1)

## F. GELOMBANG 5 — PENINGKATAN fitur yang SUDAH ADA (T236–T269), bukan fitur baru

Pengecualian kunci: tugas di bagian ini BOLEH mengubah file yang disebut di tugasnya walau tercantum di daftar terkunci (sesi besar sedang tidak mengerjakannya). Tetap: satu tugas hanya menyentuh file yang disebut. Jangan menambah field ke `S`; pengaturan kecil pakai `localStorage.lumina_*` dalam try/catch.

### [x] T236. **Toko: beli dalam jumlah (1/5/10) untuk barang habis pakai**

- File: `src/ui/shop.js`. Baca dulu: `buyMenu()` (baris ±6–61).
- Lakukan: untuk item `k: 'use'`/ramuan/umpan/benih, setelah memilih item tampilkan `choose` jumlah ×1, ×5, ×10 (sembunyikan yang emasnya tidak cukup). Kurangi emas & tambah item sesuai jumlah dengan fungsi yang sudah dipakai `buyMenu`.
- Batasan: senjata/zirah tetap dibeli satu-satu.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; beli Ramuan ×5 di toko desa → emas berkurang 5× harga, tas +5.

### [x] T237. **Toko: jual semua bahan sampah sekaligus**

- File: `src/ui/shop.js`. Baca dulu: `sellMenu()` (±97–198).
- Lakukan: tambah pilihan paling atas "Jual semua bahan biasa" yang menjual semua item `k: 'mat'` dengan kelangkaan biasa (lihat `rarity()` di polish.js, BACA saja) setelah konfirmasi `ask('Jual N bahan seharga X G?')`.
- Batasan: jangan menjual bahan langka/misi/perlengkapan.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; punya 3 bahan biasa → satu kali konfirmasi, semua terjual, total emas benar.

### [x] T238. **Tas: ingat tab & urutan terakhir**

- File: `src/ui/bag.js`. Baca dulu: `BAG_TABS`, `BAG_SORT`, `openBag()` awal fungsi.
- Lakukan: simpan tab & urutan terakhir di `localStorage.lumina_bag` (JSON, dibungkus try/catch) saat berganti; saat `openBag()` dibuka, pulihkan.
- Batasan: jangan menambah field ke `S`.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; buka tas → tab Bahan, urutkan Harga → tutup → buka lagi: tab & urutan sama.

### [x] T239. **Tas: perbandingan stat saat memilih perlengkapan** (sudah ada: fungsi cmp(id))

- File: `src/ui/bag.js`. Baca dulu: bagian `openBag()` yang menampilkan detail item senjata/zirah.
- Lakukan: di detail item perlengkapan, tampilkan selisih terhadap yang sedang dipakai, contoh `ATK 12 (▲+4)` hijau / `(▼-2)` merah. Ambil stat dari `ITEMS[id]` & `ITEMS[S.eq.<slot>]`.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; lihat Pedang Besi saat memakai pedang kayu → tampak ▲.

### [x] T240. **Tas: pencarian juga mencocokkan deskripsi** (sudah ada: mencocokkan ITEMS[id].d)

- File: `src/ui/bag.js`. Baca dulu: `BAG_SEARCH` dan filter pencarian di `openBag()`.
- Lakukan: filter pencarian mencocokkan nama ATAU `ITEMS[id].d` (huruf kecil, tanpa aksen).
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; cari kata "HP" → ramuan muncul walau namanya tidak memuat "HP".

### [x] T241. **Jurnal: misi aktif di atas, misi selesai diredupkan** (sudah ada: .qr.done dengan centang dan redup)

- File: `src/ui/bag.js`. Baca dulu: `openQuests()` (±224–260).
- Lakukan: urutkan: misi utama aktif → sampingan aktif → selesai. Misi selesai diberi kelas CSS redup (opacity .55) dan tanda ✓; tambahkan aturan CSS di `styles.css`.
- Batasan: jangan mengubah teks misi.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; jurnal dengan 1 misi selesai → muncul di bawah & redup.

### [x] T242. **Dialog: ketuk untuk menampilkan teks penuh** (sudah ada: finish() pada tap pertama, tutup pada tap kedua)

- File: `src/ui/widgets.js`. Baca dulu: `say()` (baris ±16–35).
- Lakukan: jika teks diketik huruf demi huruf, ketukan/tombol aksi pertama menampilkan seluruh teks seketika; ketukan kedua baru menutup. Jika `say` tidak mengetik bertahap, tandai sudah ada/tidak relevan.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; dialog panjang Tetua Bram: tekan sekali → teks penuh, tekan lagi → lanjut.

### [x] T243. **Banner antre (tidak menumpuk)**

- File: `src/ui/widgets.js`. Baca dulu: `banner()` (±82–85).
- Lakukan: simpan antrean; banner baru menunggu banner sebelumnya selesai (ms + 600) sebelum muncul. Batasi antrean maks 3 (yang lama dibuang).
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol: `banner('A'); banner('B'); banner('C')` → muncul bergiliran, bukan bertumpuk.

### [x] T244. **HUD: bar HP 'bayangan' yang menyusul**

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `buildHud()` & `updHud()` (±96–126).
- Lakukan: tambah elemen bar kedua (warna putih/merah muda) di belakang bar HP yang menyusut perlahan (transition 0.6s, delay 0.25s) ke nilai baru, sehingga damage terlihat.
- Batasan: jangan ubah ukuran/tata letak HUD.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol `S.hp -= 30; updHud()` → bar utama langsung turun, bayangan menyusul.

### [x] T245. **Ikon simpan otomatis lebih jelas** (sudah ada: #autosv teks tersimpan fade in/out)

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `autoSaveIcon()` (±131).
- Lakukan: tampilkan teks kecil "Tersimpan" di samping ikon selama 1,2 s dengan fade in/out.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; tunggu simpan otomatis (45 s) atau konsol `saveGame(__game.sc); autoSaveIcon()`.

### [x] T246. **Angka damage kritikal lebih menonjol** (sudah ada: .pop.crit 14px kuning)

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `popWorld()` & `POPS` (±88–95).
- Lakukan: tipe pop kritikal (cari pemanggil `popWorld(..., 'crit')` dengan grep) tampil 1,4× lebih besar, kuning, dengan sedikit 'pop' skala. Jika tipe crit tidak ada, tandai catatan.
- Batasan: jangan ubah cara damage dihitung.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; serang sampai kritikal → angka besar kuning.

### [x] T247. **Layar judul: info tiap slot simpan**

- File: `src/core/state.js`, `src/ui/menus.js`. Baca dulu: `slotInfo()` & `chooseSlot()`.
- Lakukan: di daftar slot tampilkan: level, nama wilayah (`MAPS[s.map].name`), waktu main (jam:menit dari `s.st.playTime`). Baca data slot dari fungsi yang sudah dipakai layar judul.
- Batasan: jangan ubah format save.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; slot berisi save → terlihat "Lv 6 · Desa Lumina · 1j 12m". (selesai di v1.30.1)

### [x] T248. **Kode simpan: tombol salin & pesan error jelas** (sudah ada: writeText/execCommand & LUMINA1: validasi)

- File: `src/ui/savecode.js`. Baca dulu: `codeDialog()` (±10–48).
- Lakukan: tombol "Salin" memakai `navigator.clipboard.writeText` (try/catch, fallback pilih teks). Saat impor gagal, tampilkan alasan singkat (kode terpotong / bukan kode Lumina).
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; ekspor → Salin → tempel di impor → berhasil; tempel teks acak → pesan jelas.

### [x] T249. **Joystick: zona mati yang nyaman**

- File: `src/core/input.js`. Baca dulu: `enableTouch()` (±23–59).
- Lakukan: pastikan ada zona mati (deadzone) ±18% radius: di bawahnya vektor = 0. Jadikan konstanta `JOY_DEAD = .18` di atas fungsi.
- Batasan: jangan ubah tata letak tombol.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; sentuhan sangat kecil di tengah joystick tidak membuat Arka bergeser.

### [x] T250. **Joystick mengambang (muncul di titik sentuh)**

- Selesai: sentuhan pertama di separuh kiri bawah layar memusatkan `#joy` ke titik sentuh, dan kembali ke default saat dilepas.
- File: `src/core/input.js` + `styles.css`. Baca dulu: `enableTouch()`.
- Lakukan: sentuhan pertama di separuh kiri bawah layar memindahkan pusat joystick ke titik sentuh (dalam batas area kiri), kembali ke posisi semula saat dilepas.
- Batasan: tombol kanan (SERANG/DASH/…) tidak boleh terpengaruh.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; di HP: sentuh mana saja di kiri bawah → joystick muncul di sana.

### [x] T251. **Getar halus saat menekan tombol aksi (opsional)**

- Selesai: panggil `haptic(8)` via `navigator.vibrate` saat tombol aksi SERANG/DASH/SIHIR disentuh jika `localStorage.lumina_haptic !== '0'`.
- File: `src/core/input.js`. Baca dulu: bagian penanganan tombol sentuh di `enableTouch()`.
- Lakukan: panggil `navigator.vibrate(8)` (try/catch) saat tombol SERANG/DASH/SIHIR ditekan, HANYA jika `localStorage.lumina_haptic !== '0'`.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; Android: tekan SERANG → getar sangat singkat; konsol `localStorage.lumina_haptic='0'` → tidak getar.

### [x] T252. **Gamepad: Start = menu, Select = peta**

- Sudah ada: di `src/core/input.js` `btnMap`: `8: 'map'`, `9: 'menu'`.
- File: `src/core/input.js`. Baca dulu: `pollGamepad()` (±63–122) & `KEYMAP`.

### [x] T253. **Mancing: zona tarik lebih jelas + getar**

- Selesai: visual bar gulung lebih kontras dengan efek active pulse saat hold aman, dan haptic getar 15ms saat ikan menyentak.
- File: `src/systems/fishing.js` + `styles.css`. Baca dulu: `tugGame()` (±42–93).
- Lakukan: beri warna/garis tepi terang pada zona sukses, kedip saat penanda berada di dalam zona, dan `navigator.vibrate(15)` saat ikan menyentak (try/catch).
- Batasan: jangan ubah tingkat kesulitan/angka.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; mancing di danau → zona jelas terlihat.

### [x] T254. **Buku Ikan: petunjuk ikan yang belum tertangkap**

- Selesai: ikan yang belum tertangkap menampilkan "???" / "★ ???" dan petunjuk samar wilayah/jam/cuaca tanpa membocorkan nama asli ikan.
- File: `src/systems/fishing.js`. Baca dulu: `openFishLogNew()` (±94–107) & `FISH` (±21).
- Lakukan: untuk ikan belum tertangkap tampilkan "???" + petunjuk samar dari datanya: wilayah & rentang jam (mis. "Danau, malam"). Ikan legendaris: hanya wilayah.
- Batasan: jangan bocorkan nama ikan.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; Buku Ikan baru → baris ??? berisi petunjuk.

### [x] T255. **Pergantian musim terasa**

- Sudah ada: di `src/systems/season.js` memanggil `banner(season().n, season().d, true, 2600)` saat `this.seaFor !== id`.
- File: `src/systems/season.js`. Baca dulu: `updSeason()` (±55) & `SEASONS`.

### [x] T256. **Toko tutup: pesan jam buka yang jelas**

- Sudah ada: di `src/systems/season.js` pesan toko tutup mencantumkan jam buka (`Buka lagi pukul 08.00 sampai 18.00`).
- File: `src/systems/season.js`. Baca dulu: `shopShut()` & `wrapShops()` (±26–37).

### [x] T257. **Status: sisa durasi di ikon HUD**

- Selesai: ikon status (debuff racun/bakar/dingin & buff) di HUD menampilkan sisa detik yang dihitung mundur secara dinamis.
- File: `src/systems/status.js` + `styles.css`. Baca dulu: `updStatusHud()` (±60) & `STATUS`.
- Lakukan: di ikon status (racun/terbakar/dingin) tampilkan angka detik tersisa kecil di pojok, diperbarui saat `updStatusHud`.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol `__game.sc.inflict('poison', 5)` (sesuaikan tanda tangan fungsi) → ikon menampilkan 5..4..3.

### [x] T258. **Musik: transisi halus antar lagu**

- Sudah ada: di `src/systems/sound.js` `swapBGM()` melakukan rampdown volume lagu lama dan rampup volume lagu baru.
- File: `src/systems/sound.js`. Baca dulu: `swapBGM()` (±43–50) & `playBGM` di `src/core/audio.js`.

### [x] T259. **Langkah kaki tidak monoton**

- Selesai: variasi pitch acak (±6%) dan volume selang-seling kaki kiri/kanan pada fungsi `stepSound()` di `src/systems/sound.js`.
- File: `src/systems/sound.js`. Baca dulu: `stepSound()` (±60–70).
- Lakukan: variasikan pitch/rate acak kecil (±6%) tiap langkah dan selang-seling kaki kiri/kanan sedikit beda volume.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; berjalan 10 detik → suara langkah terasa alami.

### [x] T260. **Tips: pilihan matikan semua tips**

- Selesai: tautan "jangan tampilkan tips lagi" di kotak tip menyimpan `localStorage.lumina_tips='0'` dan menghentikan `updTips()`.
- File: `src/systems/qol.js`. Baca dulu: `TIPS`, `showTip()`, `updTips()` (±58–83).
- Lakukan: tambahkan tautan kecil "jangan tampilkan tips lagi" di kotak tip; simpan `localStorage.lumina_tips='0'`; `updTips` berhenti bila nilai itu ada.
- Batasan: jangan ubah isi TIPS.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; klik tautan → tips tidak muncul lagi setelah muat ulang.

### [x] T261. **Peta mini: ketuk untuk memperbesar**

- Selesai: ketuk canvas `#mini` mengalihkan kelas `.big` (104x104px), memainkan sfx cur, dan menyimpan pilihan ke `localStorage.lumina_mini`.
- File: `src/systems/qol.js` + `styles.css`. Baca dulu: `updMinimap()` (±84–107) dan elemen DOM peta mini.
- Lakukan: ketuk peta mini → beralih ukuran normal/2× (kelas CSS `big`), simpan pilihan di `localStorage.lumina_mini`.
- Batasan: jangan ubah cara menggambar isi peta mini.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; ketuk peta mini → membesar; ketuk lagi → normal.

### [x] T262. **Petunjuk interaksi menyebut nama**

- Selesai: `this.iHint` menampilkan nama target di baris bawah ikon (misal `${icon}\n${name}`) bila target NPC atau objek memiliki properti nama/label.
- File: `src/systems/qol.js`. Baca dulu: `updInteractHint()` (±6–22).
- Lakukan: selain ikon, tampilkan nama singkat target (nama NPC / jenis objek dari entri `inter` bila ada field nama) di bawah ikon, font kecil.
- Batasan: jika entri interaksi tidak punya nama → tampilkan ikon saja.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; dekati Tetua Bram → muncul "Tetua Bram".

### [x] T263. **Bilah HP musuh: nama untuk elite & buronan**

- Selesai: `updEnemyBars()` menampilkan label nama `e.D.name` di atas bilah HP musuh tipe istimewa (`e.elite`, `e.D.isBounty`, atau `goblin_elite`).
- File: `src/systems/qol.js`. Baca dulu: `updEnemyBars()` (±23–32).
- Lakukan: untuk musuh elite (`e.elite`) dan buronan (`e.D.isBounty` atau sejenis; grep) tampilkan nama `e.D.name` di atas bilah HP.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; lawan musuh elite → namanya tampil.

### [x] T264. **Naik level: tampilkan stat sebelum → sesudah**

- Selesai: sudah ada di `src/systems/qol.js` (`levelUpDetail()` baris 64 menampilkan format `${n} ${a[k]} → <b>${b[k]}</b> <span style="color:#7ad05a">+...</span>`).
- File: `src/systems/qol.js`. Baca dulu: `levelUpDetail()` (±39–44).
- Lakukan: format setiap stat sebagai "HP 62 → 70" dengan angka baru hijau.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol berikan EXP sampai naik level → rincian jelas.

### [x] T265. **Pencapaian: kabar progres 50% & 90%**

- File: `src/systems/achievements.js`. Baca dulu: `achCheck()` (±4–11) & `ACH` di `src/data/quests.js` (BACA saja).
- Lakukan: untuk pencapaian yang syaratnya counter `S.st.x >= N`, tampilkan toast kecil satu kali saat progres melewati 50% dan 90%. Catat yang sudah diumumkan di `localStorage.lumina_achprog` (JSON).
- Batasan: jangan menambah field ke S.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol `S.st.fish = 26; achCheck()` → toast "Kail Emas 50%" sekali. (selesai di v1.30.1)

### [x] T266. **Sapaan NPC tidak berulang**

- Selesai: `o.lastBarkIdx` disimpan pada objek NPC dan pengacakan kalimat berikutnya selalu mengecualikan indeks sebelumnya.
- File: `src/npc/npcs.js`. Baca dulu: bagian yang memilih kalimat dari `NPC_BARKS` (grep `NPC_BARKS[`).
- Lakukan: jangan memilih kalimat yang sama dengan kalimat terakhir NPC itu (simpan indeks terakhir di objek NPC).
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; dekati NPC berkali-kali → kalimat berganti.

### [x] T267. **Peta benua: tombol perbesar/perkecil**

- Selesai: sudah ada di `src/ui/worldmap.js` (tombol zoom in/out + dan -, tombol fokus Arka, serta navigasi pan/drag canvas).
- File: `src/ui/worldmap.js`. Baca dulu: `openWorldMap()`.
- Lakukan: tambahkan tombol + / − yang mengubah skala gambar (0,5×–3×) dan bisa digeser (sudah ada geser? cek); pertahankan titik Arka terlihat saat memperbesar.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; buka Peta Benua → perbesar 2× → geser → tutup tanpa error.

### [x] T268. **Teks dialog mengikuti ukuran huruf pengaturan**

- Selesai: aturan `styles.css` memperluas penggunaan variabel `--fz` ke teks dialog `.dlg .tx`, kartu misi `#quest .qt`, dan kotak tip `#tip`.
- File: `styles.css`. Baca dulu: aturan CSS kotak dialog & opsi ukuran huruf di `src/systems/polish.js` (BACA saja, cari 'font').
- Lakukan: pastikan kotak dialog, kartu misi, dan tip memakai variabel ukuran huruf yang sama dengan pengaturan, sehingga opsi ukuran huruf berpengaruh ke semuanya.
- Batasan: hanya CSS.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; ubah ukuran huruf di Pengaturan → dialog ikut membesar.

### [x] T269. **Tombol sentuh terbaca di layar terang**

- Selesai: menambahkan `border: 2px solid rgba(18,12,8,.75)` serta bayangan teks kontur gelap (`text-shadow: 0 1px 2px #000, 1px 1px 0 #000, -1px -1px 0 #000`) pada tombol `.btn` dan label `.btn small`.
- File: `styles.css`. Baca dulu: aturan tombol sentuh (SERANG, DASH, SIHIR, OBAT, MENU, PETA, TAS).
- Lakukan: tambah garis tepi gelap 2px & bayangan teks agar label terbaca di bawah sinar matahari; jangan ubah ukuran/posisi.
- Batasan: hanya CSS.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; lihat di HP dengan kecerahan tinggi.

## G. GELOMBANG 6 — tempur & pengalaman melawan monster ala RPG top (T270–T297)

Kerjakan SETELAH gelombang 3 (T212–T223, efek tebasan) bila memungkinkan. Pengecualian kunci sama seperti gelombang 5: boleh mengubah file yang disebut di tugasnya (combat.js, feel.js, polish.js, ai/enemies.js, ai/bosses.js, sound.js). Uji di mode benua: `?benua=1`.

### [x] T270. **Token serangan: maks 2 musuh menyerang bersamaan** — referensi: Batman Arkham, Assassin's Creed, Hades

- Selesai: sistem `this.atkTok` (Set) membatasi maksimal 2 musuh jarak dekat (`lunge`, `charge`, `hop` slime) yang ancang-ancang/menerjang bersamaan, sisanya berputar mengelilingi pemain pada jarak aman. Token dilepas saat serangan tuntas/terkena hit/mati/timeout > 2.2 detik.
- File: `src/ai/enemies.js`. Baca dulu: `updEnemy()` cabang `'walk'`, `'lunge'`, `'charge'` (cari tempat musuh mulai ancang-ancang/menyerang).
- Lakukan: buat `this.atkTok = this.atkTok || new Set()`. Sebelum musuh jarak dekat MULAI ancang-ancang, wajib `this.atkTok.size < 2` lalu `add(e)`; lepas (`delete(e)`) saat serangan selesai, musuh mati, atau lebih dari 2 s. Musuh tanpa token mengitari pemain pada jarak ±48 px.
- Batasan: musuh jarak jauh & boss tidak memakai token.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan 5 slime/serigala sekaligus → paling banyak 2 yang menyerang bersamaan, sisanya berputar.

### [x] T271. **Ancang-ancang konsisten di semua serangan jarak dekat** — referensi: Dark Souls, Hades (telegraf jelas)

- Selesai: cabang `lunge` disesuaikan ancang-ancang minimal 0.36–0.42s; `charge` & `golem` memiliki 0.6–0.65s ancang-ancang yang memicu tanda `!` via `feel.js`; `elite_brute` smash memicu `markOver(!)` dengan delay 380ms dan jurus charge kini memiliki telegraf `cwind` 0.38s sebelum melesat.
- File: `src/ai/enemies.js` (+ `src/systems/feel.js` BACA saja). Baca dulu: `markOver()` & `dangerFrom()` di feel.js; cabang `'lunge'`, `'charge'`, `'golem'`, `'elite_brute'` di updEnemy.
- Lakukan: pastikan setiap cabang itu menampilkan tanda "!" (`markOver`) minimal 0,35 s sebelum damage, dan musuh berkedip/berhenti sejenak saat ancang-ancang. Catat cabang yang sebelumnya tanpa tanda.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan serigala, babi hutan, golem → selalu ada "!" sebelum serangan.

### [x] T272. **Lingkaran bahaya untuk serangan area** — referensi: Hades, Monster Hunter

- Selesai: method `shockwave()` menggambar elips telegraf merah transparan di tanah selama 0,5 detik yang mengisi dari tengah sebelum dentuman ledakan dan damage mengenai area.
- File: `src/systems/combat.js`. Baca dulu: `shockwave()` (±310) dan pemanggilnya (grep `shockwave(`).
- Lakukan: 0,5 s sebelum damage area, gambar elips merah transparan seukuran jangkauannya di tanah (depth di bawah karakter) yang mengisi dari tengah; damage terjadi saat terisi penuh.
- Batasan: jangan ubah damage/jangkauan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; golem menghantam tanah → lingkaran merah muncul lebih dulu, bisa dihindari.

### [x] T273. **Ketahanan (poise) musuh besar** — referensi: Dark Souls, Elden Ring

- Selesai: musuh berbadan besar (`e.D.r >= 12`) atau elite/boss memiliki `e.poise` (3 untuk besar, 5 untuk elite/boss). Poise berkurang tiap pukulan dan kebal knockback/sentak hingga poise habis (0) memicu status terhuyung 0,8s ('TERHUYUNG!') dengan bonus damage +25%.
- File: `src/systems/combat.js`. Baca dulu: `hitEnemy()` (±144–175), bagian knockback/sentak.
- Lakukan: musuh dengan `e.D.r >= 12` atau elite punya `e.poise` (awal = 3 untuk besar, 5 untuk elite/boss). Tiap pukulan mengurangi 1; selama poise > 0 musuh TIDAK tersentak/terdorong. Saat 0 → terhuyung 0,8 s (berhenti, berkedip), damage +25% selama terhuyung, lalu poise penuh lagi.
- Batasan: slime & musuh kecil tetap tersentak tiap pukulan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; golem: 3 pukulan tidak tersentak, pukulan ke-3 membuatnya terhuyung.

### [x] T274. **Dorongan sesuai berat musuh & senjata** — referensi: Zelda: A Link to the Past, Hyper Light Drifter

- Selesai: kalkulasi dorongan knockback `kbScale` di `hitEnemy()` memperhitungkan bobot tipe senjata (`axe` 1.4, `spear` 1.15, `sword` 1.0) dan massa radius tubuh musuh `1 + (e.D.r - 8) / 10` dengan batas minimal 0.3x.
- File: `src/systems/combat.js`. Baca dulu: `hitEnemy()` bagian dorongan (knockback).
- Lakukan: skala dorongan = dasar × (kapak 1,4 / pedang 1 / tombak 1,15) ÷ (1 + (e.D.r − 8) / 10), minimal 0,3×. Pukulan ke-3 kombo ×1,3.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; slime terlempar jauh, golem hampir tidak bergeser; kapak lebih kuat dari pedang.

### [x] T275. **Hitstop bertingkat** — referensi: Hades, Monster Hunter

- Selesai: durasi hitstop bertingkat diterapkan di `hitEnemy()`: pukulan biasa 35ms, akhir kombo 60ms, serangan kritikal 80ms, dan pukulan membunuh 90ms (serta 220ms untuk boss fatal) tanpa menumpuk (`Math.max`).
- File: `src/systems/combat.js`. Baca dulu: `hitStop()` (±139) & pemanggilnya di `hitEnemy`/`killEnemy`.
- Lakukan: durasi: pukulan biasa 35 ms, akhir kombo 60 ms, kritikal 80 ms, membunuh 90 ms. Jangan menumpuk: jika hitstop masih berjalan, ambil yang terbesar.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; rasakan: kill & kritikal terasa 'berat', pukulan biasa tetap lincah.

### [x] T276. **Satu ayunan = satu kena per musuh** — referensi: Hollow Knight

- Selesai: tiap ayunan serangan senjata diberi id unik (`this.swingId++`), dicatat ke `e.lastSwing`, dan dicegah menerima lebih dari 1 hit per ayunan di `attack()`.
- File: `src/systems/combat.js`. Baca dulu: `attack()` (±12–88) bagian deteksi kena.
- Lakukan: beri tiap ayunan id (`this.swingId++`); simpan `e.lastSwing`; jika sama, lewati. Cegah satu tebasan mengenai musuh yang sama dua kali.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tebas slime di tepi jangkauan berulang kali → tiap ayunan maks 1 angka damage per musuh.

### [x] T277. **Musuh kembali ke posisi asal (leash)** — referensi: World of Warcraft, Dark Souls

- Selesai: musuh biasa non-boss yang mengejar > 280px dari `e.home` atau pemain berjarak > 320px memasuki mode `e.leash`, melepaskan token serang, berjalan pulang ke titik asal tanpa menyerang, dan memulihkan HP ke penuh setibanya di rumah.
- File: `src/ai/enemies.js`. Baca dulu: awal `updEnemy()` & tempat posisi awal musuh disimpan (grep `home` atau `hx`).
- Lakukan: jika musuh mengejar > 280 px dari posisi asalnya atau pemain > 320 px darinya, musuh berhenti mengejar, berjalan pulang, dan memulihkan HP ke penuh dalam 2 s setelah tiba. Selama pulang ia tidak menyerang.
- Batasan: boss tidak terpengaruh.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pancing serigala jauh lalu lari → serigala pulang, HP pulih.

### [x] T278. **Aggro berkelompok** — referensi: Diablo (pack)

- Selesai: saat musuh non-boss pertama kali masuk status `aggro`, kawanannya yang sejenis dalam radius 90px diberi status `packAggro` dan tanda `!` setelah jeda 0,3 detik sehingga ikut mengejar bersama.
- File: `src/ai/enemies.js`. Baca dulu: bagian saat musuh mulai mengejar (status aggro; grep `aggro`).
- Lakukan: saat satu musuh mulai mengejar, musuh sejenis dalam 90 px yang masih diam ikut mengejar setelah jeda 0,3 s (sekali saja).
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pukul satu slime dalam kelompok → teman dekatnya ikut bergerak setelah sejenak.

### [x] T279. **Binatang kabur saat sekarat** — referensi: Monster Hunter, Far Cry

- Selesai: serigala dan babi hutan yang pertama kali HP-nya < 20% memiliki peluang 40% memunculkan ekspresi '!?' dan kabur menjauh dengan kecepatan +20% selama 1,5 detik sebelum kembali bertarung.
- File: `src/ai/enemies.js`. Baca dulu: cabang AI serigala/babi hutan (`'lunge'`/`'charge'`; cek `ENEMY.wolf.ai`, `ENEMY.boar.ai`).
- Lakukan: pertama kali HP < 20%: 40% peluang kabur menjauh 1,5 s (lebih cepat 20%), lalu kembali menyerang. Tampilkan pop kecil "!?".
- Batasan: hanya serigala & babi hutan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan serigala sampai sekarat → kadang kabur sebentar.

### [x] T280. **Penembak menjaga jarak & bergeser** — referensi: Diablo (pemanah), Enter the Gungeon

- Selesai: AI penembak `'shoot'` aktif mundur saat pemain < 70px, mendekat saat > 120px, dan aktif bergeser strafing menyamping (arah acak tiap 0,6 detik) di antara jeda tembakan. Cabang `'turret'` tetap stasioner.
- File: `src/ai/enemies.js`. Baca dulu: cabang `'shoot'` dan `'turret'`.
- Lakukan: `'shoot'`: jika pemain < 70 px → mundur; di antara tembakan bergeser menyamping 0,6 s (arah acak). `'turret'` tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan goblin pemanah → ia mundur saat didekati & tidak berdiri diam.

### [x] T281. **Proyektil musuh mudah dibaca** — referensi: Enter the Gungeon, Hades

- Selesai: proyektil musuh di `eShoot()` diberi pendaran warna glow terang sesuai jenisnya + bayangan tanah dinamis yang sinkron di `updShots()`, dan melaju 50% lebih lambat di 0,1s pertama sebagai telegraf tembakan.
- File: `src/systems/combat.js`. Baca dulu: `eShoot()` (±302) & `updShots()` (±317).
- Lakukan: proyektil musuh diberi lingkar terang tipis (blend ADD, warna sesuai jenis) + bayangan kecil di tanah; 0,1 s pertama bergerak 50% lebih lambat agar terlihat keluar.
- Batasan: kecepatan setelah 0,1 s tetap.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; panah/bola sihir musuh terlihat jelas di rumput & malam hari.

### [x] T282. **Tangkis (parry) terasa memuaskan** — referensi: Sekiro, Hollow Knight

- Selesai: parry sukses memunculkan lingkar cahaya putih membesar dari Arka, perlambatan waktu (slomo 0,15s pada timeScale), sfx kritikal, dan musuh terhuyung 0,6 detik.
- File: `src/systems/polish.js`. Baca dulu: `PARRY_WIN` (±27) & pembungkus `_hurtPlayer` (±30) tempat tangkis berhasil.
- Lakukan: saat tangkis berhasil: lingkar cahaya putih membesar dari Arka, suara `sfx('parry')` atau yang ada, perlambatan waktu 0,15 s (`this.time.timeScale` & `physics.world.timeScale`, kembalikan setelahnya), musuh penyerang terhuyung 0,6 s.
- Batasan: jangan ubah jendela waktu tangkis.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tangkis serangan serigala → jelas terasa & serigala terhuyung.

### [x] T283. **Serangan dari belakang terlihat** — referensi: Dark Souls (backstab), Dishonored

- Selesai: serangan dari belakang (backstab) memunculkan teks pop ungu 'DARI BELAKANG!', memicu hitstop 70ms, getaran kamera halus, dan mencatat progres statistik `S.st.backstabs`.
- File: `src/systems/combat.js`. Baca dulu: tempat `S.st.backstabs` bertambah (grep `backstabs`).
- Lakukan: tampilkan pop "DARI BELAKANG!" (ungu) + hitstop 70 ms + getar kamera kecil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; serang musuh dari belakang → teks muncul.

### [x] T284. **Penyangga input serangan (buffer)** — referensi: Hades, Devil May Cry

- Selesai: input tombol serangan saat `pl.atkCd <= 0.15s` disimpan dalam `this.atkBuf` dan dieksekusi via `delayedCall` tepat saat cooldown habis, sehingga kombo 3 pukulan tidak pernah tertelan saat ditekan cepat.
- File: `src/systems/combat.js`. Baca dulu: awal `attack()` (cek `atkCd`).
- Lakukan: jika serangan ditekan saat `pl.atkCd` tinggal ≤ 0,15 s, jangan diabaikan: simpan `this.atkBuf = true` lalu panggil `attack()` lagi via `this.time.delayedCall(pl.atkCd * 1000 + 5, …)` (sekali, tanpa menumpuk).
- Batasan: jangan mengubah lama cooldown.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tekan SERANG cepat berirama → kombo 3 pukulan tidak 'tertelan'.

### [x] T285. **Menghindar tepat waktu (perfect dodge)** — referensi: Bayonetta, Monster Hunter

- Selesai: saat musuh menyerang mengenai Arka dalam kondisi kebal dash (<= 0.2s sejak dash dimulai), memicu 'Lolos!', slomo 0.12s, sfx crit, dan pemulihan +10 stamina (maksimal sekali per dash via `pl.perfectDodged`).
- File: `src/systems/combat.js`. Baca dulu: `hurtPlayer()` (±292) bagian saat pemain kebal (`inv`).
- Lakukan: jika serangan mengenai saat Arka kebal KARENA dash (≤ 0,2 s setelah dash dimulai): pop "Lolos!", perlambatan 0,12 s, dan +10 stamina. Maks sekali per dash.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; dash tepat saat serigala menerjang → "Lolos!".

### [x] T286. **Bola EXP terbang ke Arka** — referensi: Diablo, Hades

- File: `src/systems/combat.js`. Baca dulu: `killEnemy()` (±176) & `gainExp()` (±280).
- Lakukan: saat musuh mati, munculkan 3–6 titik cahaya kecil di posisinya yang melesat ke Arka (tween 0,35–0,5 s, kurva). EXP tetap ditambahkan seperti sekarang (boleh saat titik pertama tiba).
- Batasan: jumlah EXP tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh slime → titik cahaya terbang ke Arka.

### [x] T287. **Cahaya tegak untuk barang langka** — referensi: Diablo, Borderlands

- File: `src/systems/polish.js`. Baca dulu: `drop()` (±252) (+ `rarity()` di polish.js, BACA saja).
- Lakukan: barang dengan kelangkaan di atas biasa: berkas cahaya vertikal tipis (warna sesuai kelangkaan) di atasnya + suara kecil saat jatuh; hilang saat diambil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; konsol buat drop item langka → ada berkas cahaya. (selesai di v1.30.1)

### [x] T288. **Koin & bahan biasa tertarik ke Arka** — referensi: Hades, Diablo (sudah ada di `updPicks()` `src/systems/combat.js`)

- File: `src/systems/combat.js`. Baca dulu: `updPicks()` (±258–279).
- Lakukan: koin & bahan biasa dalam 52 px bergerak ke arah Arka (makin dekat makin cepat) lalu diambil seperti biasa. Barang langka tetap harus didatangi.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh musuh → koin meluncur ke Arka.

### [x] T289. **Sifat elite (affix)** — referensi: Diablo III

- File: `src/systems/feel.js` + `src/systems/combat.js`. Baca dulu: `makeElite()` (feel.js ±18–29), `killEnemy()`.
- Lakukan: elite mendapat 1 sifat acak: "Cepat" (kecepatan +30%), "Keras" (DEF +50%), "Membara" (pukulannya membakar: `inflict` status bakar), "Beranak" (saat mati memunculkan 2 slime kecil). Nama sifat tampil di bawah nama elite.
- Batasan: sifat Beranak hanya untuk elite non-boss.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; temui elite → sifatnya terlihat & berlaku.

### [x] T290. **Musuh baru tidak muncul di depan mata** — referensi: Dark Souls, Diablo (tidak ada sistem respawn musuh berkala)

- File: `src/ai/enemies.js` atau tempat respawn musuh (grep `respawn`). Baca dulu: kode respawn musuh.
- Lakukan: saat musuh muncul kembali, lewati/ tunda jika posisinya di dalam layar kamera atau < 140 px dari Arka.
- Batasan: jika tidak ada sistem respawn → tandai catatan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh slime lalu tunggu di dekatnya → ia tidak muncul tepat di depanmu.

### [x] T291. **Kartu perkenalan boss** — referensi: Hades, Hollow Knight

- File: `src/ai/bosses.js`. Baca dulu: `startBoss()` (±78–91).
- Lakukan: saat boss mulai: nama besar + gelar kecil (dari data boss bila ada) di tengah layar 1,6 s, kamera sedikit memperbesar (zoom 1,08) lalu kembali, input pemain dikunci 0,8 s (`G.lock++/--` dalam finally).
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; masuk arena boss → kartu nama tampil, permainan lanjut normal.

### [x] T292. **Fase kedua boss di 50% HP** — referensi: Dark Souls, Elden Ring

- File: `src/ai/bosses.js` + `src/systems/combat.js`. Baca dulu: `updBoss()` & `hitEnemy()`.
- Lakukan: saat HP boss pertama kali < 50%: kebal 1 s, kilat & gelombang kejut visual (tanpa damage), banner kecil "BANGKIT!", lalu kecepatan & laju serangan +20% (`e.phase2 = true`, dipakai di AI boss).
- Batasan: HP & damage boss tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan boss ratu jamur → di 50% terjadi transisi, setelahnya lebih agresif.

### [x] T293. **Tanda kelemahan elemen** — referensi: Pokémon, Final Fantasy (sudah ada di `src/systems/polish.js`)

- File: `src/systems/polish.js`. Baca dulu: `ELEM`, `WEAK`, pembungkus `_hitEnemy` (±8–18).
- Lakukan: saat serangan mengenai kelemahan musuh: pop "LEMAH!" (warna `ELEM_COL`) di atas angka damage; jika musuh tahan: "TAHAN" abu-abu.
- Batasan: jangan ubah pengali damage.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pakai senjata api ke slime es → "LEMAH!".

### [x] T294. **Mode Santai: ancang-ancang lebih lama** — referensi: Celeste (assist mode), Hades (God mode)

- File: `src/ai/enemies.js`. Baca dulu: tempat durasi ancang-ancang musuh (hasil tugas "Ancang-ancang konsisten").
- Lakukan: jika `OPT.diff === 0`, kalikan durasi ancang-ancang ×1,3 dan jeda antar serangan ×1,2.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pengaturan Santai → musuh lebih mudah dibaca.

### [x] T295. **Musuh terakhir: gerak lambat singkat** — referensi: God of War, Hades (room clear)

- File: `src/systems/feel.js`. Baca dulu: `killEnemy()`.
- Lakukan: jika setelah membunuh tidak ada lagi musuh yang sedang mengejar dalam 220 px dan sebelumnya ≥ 3 musuh bertarung, lakukan perlambatan 0,25 s + suara kecil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; kalahkan kelompok 3 slime → yang terakhir memberi momen lambat singkat. (selesai di v1.30.1)

### [x] T296. **Audit kepadatan kawanan musuh** — referensi: Diablo, Zelda (penempatan musuh) (hasil audit: tidak ada kluster >5 musuh & 0 musuh dekat portal)

- File: `src/world/maps/*.js` (larik `enemies`). Baca dulu: daftar `enemies` tiap peta luar ruang.
- Lakukan: hitung dengan skrip kecil (di `/tmp`, bukan di repo) kelompok musuh dalam radius 150 px. Jika > 5 musuh dalam satu kelompok atau musuh berada < 120 px dari pintu masuk/teleport, geser beberapa ke ruang terbuka terdekat. Catat perubahan di bawah tugas ini.
- Batasan: jangan menambah/menghapus musuh, hanya menggeser.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; `npm run check` 0 masalah; berjalan di hutan tidak 'dikeroyok' tepat di pintu masuk.

### [x] T297. **Musik tempur selesai dengan halus** — referensi: Hades, Ori

- File: `src/systems/sound.js`. Baca dulu: `swapBGM()` (±43) & logika masuk/keluar tempur (grep `combat` di sound.js).
- Lakukan: keluar dari musik tempur hanya setelah 4 s tanpa musuh yang mengejar, dengan fade 1 s; jangan bolak-balik bila musuh baru mengejar dalam 2 s.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; kalahkan musuh lalu diam → musik kembali halus, tidak berkedip-kedip.

## H. GELOMBANG 7 — AI lebih pintar & tangguh, efek visual, UI ala Dimraeth (T298–T331)

Urutan: kerjakan gelombang 3 & 6 dulu (beberapa tugas di sini memakainya). File BARU milik agen: `src/systems/spell_fx.js`, `src/ui/spellbar.js`. Boleh mengubah file yang disebut tiap tugas. Kinerja HP: efek dibuat seperlunya & dihancurkan; uji di `?benua=1`.

### [x] T298. **Peran dalam kelompok: depan, belakang, pengapit** — referensi: Ghost of Tsushima, God of War (Dimraeth memakai sistem token terinspirasi keduanya)

- File: `src/ai/enemies.js`. Baca dulu: `updEnemy()` (cabang AI yang disebut) + hasil tugas token serangan (gelombang 6).
- Lakukan: saat ≥3 musuh mengejar Arka: musuh jarak dekat terdekat = 'depan' (mendekat), penembak/dukun = 'belakang' (jaga jarak 90–130 px), sisanya = 'pengapit' (bergerak ke sisi/belakang Arka sebelum meminta token). Simpan `e.role`, hitung ulang tiap 1 s.
- Batasan: boss tidak ikut.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lawan perkemahan goblin → pemanah di belakang, ada yang memutar ke belakang Arka.

### [x] T299. **Menghindar saat Arka mengayun** — referensi: Dark Souls (musuh membaca input), Sekiro

- File: `src/ai/enemies.js` (+ `DODGERS` di `src/systems/feel.js`, BACA). Baca dulu: `updFeel()`/`DODGERS` dan cabang `'walk'`/`'lunge'`.
- Lakukan: musuh pintar (goblin, serigala elit, Taring Perak) punya peluang 25% melangkah menyamping/mundur 20 px saat Arka mulai menyerang di depannya dalam 40 px; jeda minimal 2 s per musuh.
- Batasan: slime & musuh kecil tidak menghindar.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; serang goblin berulang dari depan → kadang ia mengelak.

### [x] T300. **Musuh bertameng menangkis dari depan** — referensi: Dark Souls (tameng), Zelda (Darknut)

- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `hitEnemy()` & data goblin di `src/data/enemies.js` (BACA).
- Lakukan: goblin & kepala goblin: pukulan dari arah depannya (sudut < 70° dari arah hadap) dikurangi 70% dan muncul percikan + teks "Tertahan"; pukulan samping/belakang, akhir kombo, atau kapak menembus. Arah hadap = arah gerak terakhir musuh.
- Batasan: tidak berlaku bila goblin sedang terhuyung.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pukul goblin dari depan → damage kecil; dari samping → normal.

### [x] T301. **Ancang-ancang tipuan (tempo bervariasi)** — referensi: Elden Ring (delayed attacks)

- File: `src/ai/enemies.js`. Baca dulu: durasi ancang-ancang di cabang `'lunge'`/`'charge'`/`'elite_brute'`.
- Lakukan: musuh elite & boss mengacak durasi ancang-ancang antara 0,35–0,75 s (musuh biasa tetap tetap), jadi pemain harus membaca, bukan menghafal ritme.
- Batasan: mode Santai: maks 0,6 s & tetap ada tanda "!".
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lawan elite → waktunya tidak selalu sama.

### [x] T302. **Serangan berantai (kombo musuh)** — referensi: Monster Hunter, Hollow Knight

- File: `src/ai/enemies.js`. Baca dulu: cabang `'lunge'` (serigala) & `'elite_brute'` (kepala goblin).
- Lakukan: serigala: setelah terjangan pertama, 40% peluang terjangan kedua 0,25 s kemudian. Kepala goblin: rangkaian 3 ayunan dengan jeda 0,3 s, ayunan ke-3 lebih lebar. Setelah kombo selesai musuh lelah 0,8 s (jendela balas).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; serigala kadang menerjang dua kali; setelahnya diam sebentar.

### [x] T303. **Penembak butuh garis pandang** — referensi: Diablo, XCOM (line of sight)

- File: `src/ai/enemies.js`. Baca dulu: cabang `'shoot'` & `'turret'`.
- Lakukan: sebelum menembak, cek garis lurus ke Arka tidak memotong tembok (`this.walls`, cek titik tiap 12 px dengan `Phaser.Geom.Rectangle.Contains`). Jika terhalang, bergeser ke samping 30 px lalu coba lagi.
- Batasan: maks 1 cek per 0,3 s per musuh (kinerja).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; berdiri di balik pohon besar → pemanah tidak menembak menembus, ia berpindah.

### [x] T304. **Dukun memprioritaskan menyembuhkan teman** — referensi: Dimraeth (bobot pilihan sihir), Diablo (Shaman)

- File: `src/ai/enemies.js`. Baca dulu: cabang `'shaman'`.
- Lakukan: jika ada teman dalam 140 px dengan HP < 60%, dukun menyembuhkan yang paling terluka (+20% HP maks, efek cahaya hijau) dengan jeda 4 s; selain itu menyerang seperti biasa. Tampilkan garis cahaya dukun→teman 0,3 s.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lukai goblin di dekat dukun → dukun menyembuhkannya; jadi target utama yang masuk akal.

### [x] T305. **Musuh makin agresif saat Arka sekarat** — referensi: Bloodborne (tekanan)

- File: `src/ai/enemies.js`. Baca dulu: bagian jeda antar serangan di updEnemy.
- Lakukan: jika HP Arka < 30%, jeda antar serangan musuh dalam 120 px −20% (tidak berlaku mode Santai).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; konsol `S.hp = 10` → musuh menekan lebih cepat.

### [x] T306. **Penembak membidik ke depan (prediksi)** — referensi: Enter the Gungeon, Hades

- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `eShoot()` & cabang `'shoot'`.
- Lakukan: pada kesulitan Normal ke atas, 50% tembakan diarahkan ke posisi Arka 0,35 s ke depan (posisi + kecepatan × 0,35). Santai: selalu ke posisi sekarang.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; berlari lurus di depan pemanah → sebagian panah mengenai jalur larimu.

### [x] T307. **Musuh lebih tangguh sesuai wilayah & level** — referensi: Dark Souls (tingkat area), Diablo (level monster)

- File: `src/ai/enemies.js` atau `src/scene/world.js` `spawnEnemy` (pilih SATU, catat). Baca dulu: tempat HP/ATK musuh dibuat saat spawn (grep `spawnEnemy(`).
- Lakukan: saat spawn: pengali `k = 1 + 0,06 × max(0, S.lv − levelWilayah)` (maks 1,4) untuk HP & DEF, dengan `levelWilayah` = konstanta per id wilayah (desa 1, hutan 3, padang 5, sungai 6, rawa 8, salju 10, kota 12; tulis tabelnya di file yang sama). Elite ×1,25 tambahan.
- Batasan: jangan ubah tabel `ENEMY`; EXP tidak ikut naik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pemain level 15 di hutan → slime perlu lebih banyak pukulan dari sebelumnya.

### [x] T308. **Pilihan kesulitan 'Sulit'** — referensi: Hades (Heat), Dark Souls

- File: file yang menyimpan `OPT.diff` & menu pengaturan (grep `OPT.diff`). Baca dulu: pilihan kesulitan yang ada.
- Lakukan: tambahkan nilai `OPT.diff = 2` ("Sulit"): musuh HP ×1,3, ATK ×1,2, jeda serangan −15%, Botol Cahaya maks −1. Terapkan di titik yang sama dengan tugas sebelumnya.
- Batasan: nilai bawaan tetap Normal.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pilih Sulit di Pengaturan → pertarungan terasa lebih berat.

### [x] T309. **Sinergi status: beku + pukulan berat = pecah** — referensi: Dimraeth (contoh: beku lalu lembing es), Divinity

- File: `src/systems/status.js` + `src/systems/combat.js`. Baca dulu: `freezeEnemy()`, `burnEnemy()`, `hitEnemy()`.
- Lakukan: musuh beku yang terkena akhir kombo atau kapak: damage +50%, efek pecahan es, status beku hilang. Musuh terbakar yang terkena Kabut Racun: ledakan kecil 1× (damage 30% ATK sihir).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; Nova Es lalu tebas akhir kombo → angka besar + pecahan es.

### [x] T310. **Elite mengamuk saat temannya tumbang** — referensi: Diablo (Frenzy), Monster Hunter (enrage)

- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `killEnemy()`.
- Lakukan: saat musuh mati, elite dalam 150 px menjadi 'mengamuk' 6 s: tint merah berdenyut, kecepatan +25%, jeda serangan −20%.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; bunuh slime di dekat elite → elite memerah & mengganas.

### [x] T311. **Penyergapan dari semak** — referensi: Zelda (Deku Scrub), Monster Hunter

- File: `src/ai/enemies.js`. Baca dulu: cabang `'walk'` & tempat musuh diam/patroli.
- Lakukan: musuh dengan flag `opt.ambush` (tambahkan pada 3–5 musuh di peta hutan & rawa di `src/world/maps/*.js`) tersembunyi (alpha 0,15, tidak bergerak) sampai Arka < 60 px, lalu melompat keluar dengan tanda "!" dan debu.
- Batasan: jangan menempatkan penyergap < 150 px dari pintu masuk/teleport.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lewati semak di hutan → goblin tiba-tiba melompat keluar.

### [x] T312. **Tebasan dengan jejak bertumpuk** — referensi: Hades, Dead Cells

- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()` (hasil gelombang 3).
- Lakukan: tambahkan 2 salinan busur yang mengekor (delay 25 & 50 ms, alpha 0,5 & 0,25, rotasi sedikit tertinggal) + 3 percikan kecil di ujung busur.
- Batasan: maks 4 objek efek per tebasan (kinerja HP).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; tebas → busur terlihat seperti sapuan bergerak, bukan sekali kedip.

### [x] T313. **Efek khas per senjata** — referensi: Hades (tiap senjata punya bahasa visual sendiri)

- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()`.
- Lakukan: tombak: garis tusuk + cincin debu di ujung; kapak: akhir kombo membuat retakan tanah (garis cokelat bercabang, pudar 0,6 s); busur: panah meninggalkan jejak tipis & percikan saat kena (bungkus `shootArrow`).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; coba ketiga senjata → masing-masing berbeda.

### [x] T314. **Kilat akhir kombo** — referensi: Devil May Cry, Hollow Knight

- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()` bagian `fin`.
- Lakukan: pada pukulan ke-3: kilat putih layar 1 frame (persegi `setScrollFactor(0)` alpha .25 → 0 dalam 80 ms) + 6 garis radial pendek dari titik kena.
- Batasan: matikan kilat bila `OPT.lite` (hemat baterai) aktif.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; kombo 3 → kilat singkat terasa tegas.

### [x] T315. **Tangkis: dentang, percikan, layar membeku** — referensi: Sekiro, Hollow Knight

- File: `src/systems/combat_fx.js` (bungkus fungsi tangkis di polish.js, JANGAN ubah polish.js). Baca dulu: pembungkus `_hurtPlayer` & `PARRY_WIN` di polish.js (BACA).
- Lakukan: saat tangkis berhasil: cincin putih→emas membesar, 10 percikan kuning menyembur dari titik benturan, Arka & musuh berhenti 120 ms (freeze-frame), tepi layar kilat emas tipis.
- Batasan: jangan ubah jendela tangkis.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; tangkis serangan → terasa 'TING!' yang memuaskan. (selesai di v1.30.1)

### [x] T316. **Dash: garis angin & kedip awal-akhir** — referensi: Celeste, Hyper Light Drifter

- File: `src/systems/combat_fx.js`. Baca dulu: pembungkus `W.dash` & `rollFx()`.
- Lakukan: saat dash: 4 garis angin tipis di belakang Arka (searah gerak, pudar 150 ms), kedip putih singkat di titik awal & akhir, jejak debu tiap 40 ms selama dash.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; dash → terlihat cepat & tajam. (selesai di v1.30.1)

### [x] T317. **Menghindar sempurna: siluet biru & waktu melambat** — referensi: Bayonetta (Witch Time), Nier Automata

- File: `src/systems/combat_fx.js`. Baca dulu: hasil tugas "Menghindar tepat waktu" (gelombang 6).
- Lakukan: saat perfect dodge: siluet biru Arka tertinggal di posisi semula 0,4 s, layar sedikit kebiruan (overlay alpha .12) selama perlambatan.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; dash tepat waktu → siluet biru & warna dingin singkat. (selesai di v1.30.1)

### [x] T318. **Lingkar rune saat merapal jurus** — referensi: Diablo, Tales of

- File: file baru `src/systems/spell_fx.js` (daftarkan di index.html setelah combat_fx.js). Baca dulu: `castSpell()` di `src/systems/learn.js` (BACA).
- Lakukan: bungkus `castSpell`: sebelum efek jurus, gambar lingkar rune berputar di bawah Arka (warna per sekolah sihir: api oranye, es biru, alam hijau, cahaya emas) 0,35 s, lalu memudar.
- Batasan: jangan ubah biaya MP/efek jurus.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal jurus apa pun → lingkar muncul. (selesai di v1.30.1)

### [x] T319. **Bola Api: inti menyala, ekor, ledakan** — referensi: Diablo II (Fire Ball), Hades

- File: `src/systems/spell_fx.js`. Baca dulu: proyektil Bola Api (`JURUS.fire`; grep di learn.js/combat.js).
- Lakukan: proyektil diberi inti terang (blend ADD) + jejak partikel oranye; saat kena: ledakan bundar 3 lapis (putih→kuning→oranye) & asap kecil.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal Bola Api ke slime → ledakan jelas. (selesai di v1.30.1)

### [x] T320. **Nova Es: cincin kristal & serpihan** — referensi: Path of Exile (Frost Nova)

- File: `src/systems/spell_fx.js`. Baca dulu: `nova()` di `src/systems/skills.js` (BACA).
- Lakukan: bungkus `nova`: cincin biru mengembang + 12 serpihan kristal melesat keluar + kabut dingin di tanah 0,8 s; musuh yang beku diberi lapisan es (tint biru muda berkilau).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal Nova Es → cincin & musuh terlihat membeku.

### [x] T321. **Tebasan Putar: pusaran & sapuan angin** — referensi: Diablo III (Whirlwind), Zelda (Spin Attack)

- File: `src/systems/spell_fx.js`. Baca dulu: `spin()` di `src/systems/skills.js` (BACA).
- Lakukan: bungkus `spin`: lingkaran busur 360° berputar 2× (busur `arcfx` diputar), daun/debu terlempar keluar, kamera bergetar kecil di akhir.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; Tebasan Putar → pusaran terlihat penuh.

### [x] T322. **Kabut Racun, Cahaya Pulih, Lentera Suci** — referensi: Divinity (awan racun), Final Fantasy (Cure), Diablo (Holy)

- File: `src/systems/spell_fx.js`. Baca dulu: bagian ketiga jurus itu di `castSpell()` (BACA).
- Lakukan: Kabut Racun: gelembung hijau naik & awan berdenyut; Cahaya Pulih: pilar cahaya hijau-emas + daun melayang ke atas; Lentera Suci: sinar silang emas + titik cahaya mengorbit Arka 1 s.
- Batasan: satu commit boleh berisi ketiganya bila < 80 baris.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal ketiganya → masing-masing punya ciri sendiri.

### [x] T323. **Efek status di musuh** — referensi: Divinity, Diablo

- File: `src/systems/spell_fx.js` (+ `src/systems/status.js` BACA). Baca dulu: `enemyStatus()`/`updStatus()`.
- Lakukan: terbakar: 2 partikel api naik berkedip; beku: kilau es & gerak 0 visual; racun: gelembung hijau kecil. Buat sekali per musuh berstatus, hancurkan saat status habis.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; bakar & racuni slime → efeknya tampak di atasnya.

### [x] T324. **Percikan kena sesuai bahan musuh** — referensi: Hollow Knight, Dead Cells

- File: `src/systems/combat_fx.js`. Baca dulu: `hitFx()`.
- Lakukan: jenis percikan: slime → cipratan warna slime; golem/mimic → bunga api & serpihan batu; tengkorak/hantu → debu tulang/kabut; binatang → percikan putih biasa. Tentukan dari id/tekstur musuh.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pukul slime & golem → percikannya beda.

### [x] T325. **Cahaya bersinar (glow) untuk efek penting** — referensi: Ori, Hades

- File: `src/systems/combat_fx.js` & `src/systems/spell_fx.js`. Baca dulu: dokumentasi Phaser 3.80 `preFX.addGlow` (sprite WebGL).
- Lakukan: beri glow tipis pada busur tebasan akhir kombo, proyektil sihir, dan cincin tangkis HANYA bila renderer WebGL dan `OPT.lite` mati.
- Batasan: jangan pasang glow pada objek yang dibuat > 10 per detik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; efek tampak bercahaya di HP; mode hemat baterai → tanpa glow.

### [x] T326. **HUD vital ala Dimraeth: HP, Stamina, Konsentrasi** — referensi: Dimraeth (vital: Health, Stamina, Concentration), Elden Ring

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `buildHud()` (±115) & `updHud()`.
- Lakukan: rapikan HUD kiri atas menjadi 3 bar tipis berbingkai: HP (merah), Stamina (hijau, tepat di bawah HP), Konsentrasi (biru = MP yang sudah ada, ganti labelnya). Bingkai piksel gelap 2 px, angka kecil di dalam bar.
- Batasan: jangan menghapus info level/EXP (pindahkan ke bawah bar).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; HUD terlihat rapi seperti RPG souls; nilai tetap benar.

### [x] T327. **Bilah 5 slot jurus dengan cooldown** — referensi: Dimraeth (5 jurus terpasang), Diablo III, MOBA

- File: file baru `src/ui/spellbar.js` + `styles.css` (daftarkan di index.html). Baca dulu: `JURUS`, `learned()`, `S.spell` (learn.js) & menu jurus di `src/ui/menus.js` (BACA).
- Lakukan: tampilkan bar 5 slot di bawah tengah layar berisi jurus yang sudah dipelajari (urutan JURUS). Slot jurus aktif (`S.spell`) berbingkai emas; ketuk slot jurus sihir → jadikan `S.spell`. Tampilkan sapuan cooldown melingkar & biaya MP; slot abu-abu bila MP kurang.
- Batasan: di HP, bar tidak menutupi joystick/tombol (sesuaikan `bottom`).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pelajari 2 jurus → keduanya tampil; ketuk → tombol SIHIR memakai jurus itu.

### [x] T328. **Bilah HP boss ala souls** — referensi: Dark Souls, Dimraeth (boss = pengalaman utama)

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `bossBar()` (±153).
- Lakukan: bilah lebar di bawah tengah layar, nama boss di atas kiri bilah, garis penanda di 50% (fase 2), bayangan HP putih yang menyusul (seperti tugas HUD bayangan), muncul dengan fade.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; masuk arena boss → bilah gaya souls.

### [x] T329. **Ikon Botol Cahaya ala Estus** — referensi: Dark Souls (Estus Flask)

- File: `styles.css` + elemen `hPot` (cari di `src/ui/widgets.js`). Baca dulu: pembungkus HUD `soulHudWrap` di `src/systems/souls.js` (BACA saja).
- Lakukan: tampilkan botol sebagai ikon botol bercahaya dengan titik-titik isi (●●○) di atas tombol OBAT, bukan teks "2/3 · 3". Ramuan biasa sebagai angka kecil di pojok.
- Batasan: logika botol di souls.js tidak diubah.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; minum Botol Cahaya → satu titik meredup.

### [x] T330. **Baris ikon buff & debuff** — referensi: Diablo, World of Warcraft

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `updStatusHud()` (status.js) & `S.buff` (state.js, BACA).
- Lakukan: satukan ikon status negatif (racun/terbakar/dingin) dan bonus masakan (`S.buff`) dalam satu baris kecil di bawah bar vital: buff berbingkai hijau, debuff merah, dengan sisa detik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; makan masakan & kena racun → keduanya tampil berdampingan.

### [x] T331. **HUD memudar saat damai** — referensi: Elder Scrolls Online (bar muncul hanya saat berubah), Breath of the Wild

- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `updHud()`.
- Lakukan: jika HP & stamina penuh dan tidak ada musuh mengejar selama 5 s, bar vital memudar ke opacity .35; kembali penuh seketika saat ada perubahan/tempur. Bisa dimatikan `localStorage.lumina_hudfade='0'`.
- Batasan: kartu misi & tombol tidak ikut memudar.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; jalan santai di desa → HUD redup; diserang → terang.

## I. GELOMBANG 8 — GEOGRAFI: sungai, kota, bangunan, penanda (T332–T361)

Wajib baca `docs/GEOGRAFI.md` dulu. Kerjakan berurutan (sungai bergantung satu sama lain). Hampir semua perubahan = DATA peta (`src/world/maps/*.js`), bukan kode. Uji di `?benua=1` & lihat dari Peta Benua. Satu-satunya pengecualian kunci: `src/world/layout.js` untuk field `ponds` peralihan.

### [x] T332. **Alat cek sambungan air antarwilayah** — referensi: GEOGRAFI §3 & §5

- File: skrip SEMENTARA di `/tmp/check_water.js` (BUKAN di repo). Baca dulu: `docs/GEOGRAFI.md` §3, format `ponds` di `src/world/maps/wild.js` baris 43.
- Lakukan: tulis skrip Node/Python yang membaca `ponds` & `river` tiap peta (boleh dengan menjalankan game via Playwright lalu `page.evaluate` membaca `MAPS` & `WORLD_POS`) dan mencetak, untuk tiap tepi wilayah, titik air yang menyentuh tepi dalam koordinat GLOBAL. Simpan perintahnya sebagai catatan di bawah tugas ini agar tugas sungai berikut bisa memakainya.
- Perintah validator: `node /tmp/check_water.js`
- Hasil cetak verifikasi: sungai hutan menyentuh tepi kanan `forest` di y global ≈ 4692–4712 (lokal y=580, WORLD_POS.forest[1]=4112).
- Cek: `npm run check` (0 masalah). (selesai di v1.30.1)

### [x] T333. **Sungai Senja 1: mata air di Puncak Beku** — referensi: BotW (sungai dari pegunungan), GEOGRAFI §3

- File: `src/world/maps/snow.js` (field `ponds`). Baca dulu: `docs/GEOGRAFI.md` §3; posisi `WORLD_POS.snow` = [4500, 1000], ukuran 1280×1200.
- Lakukan: tambah rangkaian elips dari mata air lokal (700, 150) [global 5200,1150] berkelok ke selatan sampai menyentuh tepi bawah di x lokal ≈ 660 (global 5160). Lebar awal kecil (rx/ry 24–28) lalu melebar (38). Beri 1 arungan di setiap jalan yang dipotong (celah 32–40 px + `pebbles`/`rock`). Mata air bisa ditandai `stele` bila sesuai.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); jalan dari mata air ke tepi selatan terlihat sebagai satu aliran utuh; jalur pemain tetap bisa lewat. (selesai di v1.30.1)

### [x] T334. **Peralihan bisa punya air (dukungan data)** — referensi: —

- File: `src/world/layout.js` (PENGECUALIAN KUNCI hanya untuk tugas ini). Baca dulu: `PERALIHAN` & `buildPeralihan()`.
- Lakukan: izinkan entri `PERALIHAN` memiliki field opsional `ponds` (koordinat lokal peta peralihan) yang disalin apa adanya ke `MAPS[pl_*].ponds` oleh `buildPeralihan`. Pohon tepi/hiasan otomatis jangan diletakkan di atas elips itu (lewati bila titik di dalam elips).
- Batasan: jangan ubah posisi `WORLD_POS`.
- Cek: `npm run check` (0 masalah); `MAPS.pl_*.ponds` didukung dan scatter pohon menghindarinya. (selesai di v1.30.1)
- Cek: `npm run check` (0 masalah); konsol `MAPS.pl_meadow_snow.ponds` berisi data yang ditambahkan tugas berikut.

### [x] T335. **Sungai Senja 2: lereng Puncak Beku → Padang** — referensi: GEOGRAFI §3

- File: `src/world/layout.js` entri `pl_meadow_snow` (field `ponds` dari tugas sebelumnya). Baca dulu: `docs/GEOGRAFI.md` §3; hitung x lokal = 5150 − x global kiri peta peralihan.
- Lakukan: rangkaian elips lurus berkelok tipis dari tepi atas ke tepi bawah di x global ≈ 5150, menyambung dengan ujung sungai `snow` & awal sungai `meadow` (selisih ≤ 20 px). Satu arungan di jalan L peralihan.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); alat cek air: tepi atas & bawah tersambung.

### [x] T336. **Sungai Senja 3: membelah Padang Angin** — referensi: BotW, Stardew (sungai membelah wilayah)

- File: `src/world/maps/meadow.js` (`ponds`). Baca dulu: `docs/GEOGRAFI.md` §3; `WORLD_POS.meadow` = [4424, 2600], ukuran 1440×1040.
- Lakukan: sungai masuk dari tepi atas di x lokal ≈ 726 (global 5150), berkelok ke tenggara menghindari Desa Kincir & bangunan, keluar tepi bawah di x lokal ≈ 1176 (global 5600). Arungan di setiap jalan. Lebar rx/ry 40–55.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); jalan utama padang tetap bisa dilalui lewat arungan; bangunan tidak terendam.

### [x] T337. **Sungai Senja 4: Dataran Senja (peralihan padang→rawa)** — referensi: GEOGRAFI §3

- File: `src/world/layout.js` entri `pl_meadow_swamp` (`ponds`). Baca dulu: hasil tugas "Peralihan bisa punya air".
- Lakukan: aliran dari tepi atas ke tepi bawah di x global ≈ 5600 (x lokal = 5600 − x kiri peta peralihan).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); alat cek air: menyambung ke `meadow` & `river`.

### [x] T338. **Sungai Senja 5: alur utama Jalur Sungai Senja** — referensi: GEOGRAFI §3 (sungai bergabung, tidak bercabang)

- File: `src/world/maps/wild.js` peta `river` (`ponds` baris ±43). Baca dulu: `docs/GEOGRAFI.md` §3; `WORLD_POS.river` = [4552, 4112], ukuran 2600×1000.
- Lakukan: ganti elips lama yang terpisah-pisah dengan alur menyambung: masuk dari atas di x lokal ≈ 1048, turun ke (1048, 600), lalu berkelok ke TIMUR sampai tepi kanan di y lokal ≈ 600. Pertahankan arungan di dekat `brokenbridge` (1420, 560) & kincir (1800, 160). Pindahkan objek yang kini terendam ke tepi sungai terdekat.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; jangan hapus objek, hanya geser
- Cek: `npm run check` (0 masalah); satu sungai utuh terlihat di peta besar wilayah ini.

### [x] T339. **Anak sungai bergabung di Jalur Sungai Senja** — referensi: GEOGRAFI §3 (anak sungai)

- File: `src/world/maps/wild.js` peta `river`. Baca dulu: hasil tugas sebelumnya.
- Lakukan: anak sungai lebih sempit (rx/ry 22–30) dari tepi KIRI di y lokal ≈ 600 (global 4712) mengalir ke timur dan bertemu alur utama di sekitar (1048, 600). Arungan di jalan yang dipotong.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); dua aliran bertemu jadi satu, tidak ada percabangan.

### [x] T340. **Anak Sungai Cermin: keluar dari Danau Cermin** — referensi: GEOGRAFI §3

- File: `src/world/maps/lake.js` (`ponds`). Baca dulu: `docs/GEOGRAFI.md` §3; `WORLD_POS.lake` = [1600, 3090], danau = elips (560, 500, 330, 210).
- Lakukan: aliran keluar dari sisi tenggara danau menuju tepi bawah di x lokal ≈ 1332 (global 2932). rx/ry 22–28. Arungan di jalan.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); alat cek air: menyentuh tepi bawah di global x ≈ 2932.

### [x] T341. **Anak Sungai Cermin di Hutan Lumina** — referensi: GEOGRAFI §3

- File: `src/world/maps/forest.js` (`ponds`; JANGAN ubah `river` yang sudah ada). Baca dulu: `docs/GEOGRAFI.md` §3; `WORLD_POS.forest` = [2872, 4112]; sungai hutan `river: { y: 600 … }`.
- Lakukan: aliran dari tepi ATAS di x lokal ≈ 60 (global 2932) turun dan bergabung dengan sungai hutan di y lokal ≈ 600. Pastikan sungai hutan menyentuh tepi kanan (x lokal 1280).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); masuk hutan dari danau → ikuti aliran sampai sungai hutan.

### [x] T342. **Hulu Sungai Senja (peralihan hutan→sungai)** — referensi: GEOGRAFI §3

- File: `src/world/layout.js` entri `pl_forest_river` (`ponds`). Baca dulu: hasil tugas "Peralihan bisa punya air".
- Lakukan: aliran horizontal di y global ≈ 4712 dari tepi kiri ke kanan, menyambung sungai hutan & anak sungai di `river`. Arungan di jalan L.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); alat cek air: tersambung dua sisi.

### [x] T343. **Muara: Sungai Senja ke Rawa Senja + delta** — referensi: GEOGRAFI §3 (delta = satu-satunya percabangan)

- File: `src/world/layout.js` entri `pl_river_swamp` + `src/world/maps/swamp.js` (`ponds`). Baca dulu: `docs/GEOGRAFI.md` §3; `WORLD_POS.swamp` = [7552, 4112].
- Lakukan: peralihan: aliran di y global ≈ 4712. Rawa: masuk dari tepi kiri di y lokal ≈ 600 lalu MEMECAH menjadi 2–3 alur sempit yang berakhir di genangan rawa yang sudah ada.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); berjalan dari Jalur Sungai Senja ke rawa → sungai melebar jadi delta.

### [x] T344. **Titik memancing mengikuti sungai baru** — referensi: Stardew (spot mancing di tepi air)

- File: `src/world/maps/*.js` field `fish` (snow, meadow, river, lake, forest, swamp). Baca dulu: format `fish` di peta yang sudah punya; `src/systems/fishing.js` `fishPool()` (BACA).
- Lakukan: tambahkan 1–2 titik `fish` di tepi sungai baru per peta (di darat, menghadap air, ≤ 20 px dari tepi). Jangan ubah tabel `FISH`.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); berdiri di titik baru → bisa memancing.

### [x] T345. **Hiasan tepi air** — referensi: Stardew, Zelda

- File: `src/world/maps/*.js` (objs) — peta yang dilalui sungai. Baca dulu: objek tepi air yang ada di `src/world/objects.js` (grep: reed, lily, cattail, pebbles, rock).
- Lakukan: tambahkan rumpun hiasan tepi air yang sudah ada jenisnya (maks 8 per peta) di tepi sungai, terutama di tikungan & arungan.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; hanya objek yang sudah ada di OBJ
- Cek: `npm run check` (0 masalah); sungai terlihat alami, tidak polos.

### [x] T346. **Audit tata letak Desa Lumina** — referensi: Stardew/Pokémon (desa), GEOGRAFI §1

- File: `src/world/maps/village.js` (hanya membaca di tugas ini). Baca dulu: semua `objs` bangunan, `paths`, `npcs`.
- Lakukan: tulis catatan di bawah tugas ini: daftar bangunan + arah pintu + jarak ke bangunan terdekat. Tandai: jarak < 40 px, pintu tidak terhubung jalan, jalan buntu tanpa tujuan.
- Cek: `npm run check` (0 masalah); catatan berisi tabel; tidak ada perubahan kode.

#### Catatan Audit Tata Letak Desa Lumina (T346):
| Bangunan | Koordinat (x, y) | Arah Pintu | Bangunan Terdekat (Jarak) | Terhubung Jalan? | Catatan Audit |
|---|---|---|---|---|---|
| Rumah Pohon Tetua Bram (`bigtree`) | (512, 300) | Atas / Batang (513, 286) | Kandang Ternak (152 px) | Ya (Ring alun-alun radius 26) | Pusat desa & ikon orientasi cerita |
| Rumah Pak Darto (`houseA`) | (150, 232) | Bawah (150, 232) | Rumah Lina (122 px) | Ya (`[150, 232 -> 150, 266]`) | Klaster hunian barat laut; jarak > 40 px |
| Rumah Lina (`houseC`) | (272, 222) | Bawah (272, 222) | Rumah Pak Darto (122 px) | Ya (`[272, 222 -> 272, 266]`) | Klaster hunian barat laut; pintu terhubung rapi |
| Penginapan Daun Emas (`houseC`) | (752, 222) | Bawah (752, 222) | Kandang Ternak (116 px) | Ya (`[752, 222 -> 752, 266]`) | Klaster timur laut; pintu terhubung ke jalan utama |
| Rumah Arka (`houseA`) | (874, 232) | Bawah (874, 232) | Penginapan (122 px) | Ya (`[874, 232 -> 874, 266]`) | Rumah pemain di tepi timur jalan Padang |
| Rumah Bu Lastri (`houseB`) | (104, 480) | Bawah (104, 480) | Rumah Pak Darto (252 px) | Ya (`[104, 480 -> 104, 492]`) | Hunian barat daya dekat jalan Danau Cermin |
| Rumah Bengkel Pak Besi (`houseB`) | (920, 480) | Bawah (920, 480) | Bengkel Tempa (91 px) | Ya (`[920, 480 -> 920, 492]`) | Hunian/gudang pandai besi; terhubung jalan |
| Kandang Ternak Arka (`ranch`) | (664, 298) | Barat (664, 308) | Penginapan (116 px) | Sebagian (dekat jalan `630, 266`) | Pintu menghadap barat, ada ruang gerbang 26 px |
| Kios Pasar Bu Sari (`market`) | (712, 434) | Bawah/Selatan (712, 440) | Kandang Ternak (144 px) | Ya (Dekat disc alun-alun `512, 476`) | Menghadap plaza/alun-alun selatan |
| Bengkel Tempa Terbuka (`forge`) | (964, 560) | Barat/Anvil (916, 556) | Rumah Pak Besi (91 px) | Tidak langsung (jarak 68 px ke jalan) | **Tandai:** butuh setapak kecil dari `[920, 492]` ke anvil `[916, 556]` |

**Ringkasan Temuan Audit:**
1. **Jarak Antar-Bangunan:** Semua bangunan memiliki jarak > 90 px (TIDAK ADA yang berjarak < 40 px); ruang gerak lega dan tertata.
2. **Keterhubungan Jalan:** 9 dari 10 bangunan terhubung langsung lewat segmen setapak. Satu pengecualian: Bengkel Tempa (`forge` di 964, 560) berada di selatan jalan utama timur (`y=492`), disarankan diberi setapak cabang pendek pada T348.
3. **Jalan Buntu:** Tidak ditemukan jalan buntu menjebak; semua percabangan berakhir di pintu bangunan atau pintu keluar wilayah (`lake`, `forest`, `meadow`).

### [x] T347. **Desa: alun-alun sebagai pusat** — referensi: Stardew (alun-alun Pelican Town), urban planning

- File: `src/world/maps/village.js`. Baca dulu: catatan audit desa.
- Lakukan: jadikan satu ruang terbuka di tengah (dekat rumah tetua) sebagai alun-alun: lantai `discs` (cakram tanah/batu yang sudah dipakai peta), sumur atau lampu di tengah, 2 bangku, papan (`sign`). Jalan-jalan desa bermuara ke sini.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; jangan memindah bangunan yang dipakai misi/NPC
- Cek: `npm run check` (0 masalah); dari mana pun di desa, jalan mengarah ke alun-alun.

### [x] T348. **Desa: hierarki jalan** — referensi: Urban planning (jalan utama vs setapak)

- File: `src/world/maps/village.js` (`paths`). Baca dulu: `docs/GEOGRAFI.md` §1 (radius jalan).
- Lakukan: jalan masuk dari timur (ke padang) & selatan (ke hutan) radius 14; jalan kampung 10–12; setapak ke tiap pintu 8–9. Setiap pintu terhubung jalan; hapus setapak buntu yang tidak menuju apa-apa (atau beri tujuan: bangku/papan).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); jalan utama tampak lebih lebar & jelas arahnya.

### [x] T349. **Desa: zona fungsi** — referensi: Stardew (kebun di pinggir, toko di pusat)

- File: `src/world/maps/village.js`. Baca dulu: catatan audit.
- Lakukan: pindahkan HANYA hiasan (pagar, tong, peti kayu, tumpukan jerami) agar: area kebun/kandang di pinggir berpagar, area pandai besi berisi tong & landasan dekat jalan masuk, penginapan berhias tong & lampu di jalan utama. Bangunan tidak dipindah.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); tiap area punya 'rasa' fungsinya.

### [x] T350. **Lampu & papan arah di jalan utama** — referensi: Zelda, Skyrim (papan penunjuk)

- File: `src/world/maps/village.js`, `src/world/maps/city.js`. Baca dulu: objek `lamp`, `sign` (lihat opsi teks papan yang ada dengan grep `'sign'`).
- Lakukan: lampu setiap ±160 px di sisi jalan utama (bukan di atas jalan); papan arah di tiap pertigaan menuju wilayah lain (teks: nama wilayah tujuan).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); malam hari jalan utama terang; papan menunjukkan arah.

### [x] T351. **Gerbang Kota Lumina yang megah** — referensi: Skyrim (Whiterun), Zelda (Hyrule Castle Town)

- File: `src/world/maps/city.js` peta `kgate`. Baca dulu: `objs`, `paths`, `npcs` peta itu.
- Lakukan: jalan masuk lurus & lebar (radius 16) menuju gerbang, simetris kiri-kanan: tembok/pagar, 2 pos penjaga, lampu berpasangan. Penjaga yang sudah ada diletakkan di pos.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); dari Jalan Raya Lama, gerbang terlihat sebagai tujuan jelas.

### [x] T352. **Distrik Pasar: padat & hidup** — referensi: Pasar abad pertengahan, Diablo (Tristram)

- File: `src/world/maps/city.js` peta `kpasar`. Baca dulu: `objs` kios/tenda, `paths`.
- Lakukan: susun kios dalam deret dengan lorong 40–48 px, plaza terbuka di tengah, peti/tong/karung di samping kios (bukan di lorong).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); berjalan di pasar terasa ramai tapi tidak tersangkut.

### [x] T353. **Distrik Akademi: rapi & simetris** — referensi: Arsitektur akademi/klasik

- File: `src/world/maps/city.js` peta `kakademi`. Baca dulu: `objs`, `paths`.
- Lakukan: tata simetris pada sumbu tengah: jalan lurus ke gedung utama, taman berpagar di kiri-kanan, menara jam (`clockworktower`) sebagai penanda di ujung sumbu bila objeknya ada.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); akademi tampak teratur dibanding pasar.

### [x] T354. **Kota Bawah: sempit & berliku** — referensi: Kota tua (gang), Bloodborne (Yharnam)

- File: `src/world/maps/city.js` peta `kbawah`. Baca dulu: `objs`, `paths`.
- Lakukan: jalan lebih sempit (radius 8–9) & berliku, banyak tumpukan barang/tong di pinggir gang, sedikit lampu. Tetap: lebar lorong ≥ 32 px & semua pintu tercapai.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); suasana kontras dengan akademi; tidak ada jalan buntu yang menjebak.

### [x] T355. **Jalan Raya Lama: rasa perjalanan** — referensi: Witcher 3 (jalan antarkota), Skyrim

- File: `src/world/maps/city.js` peta `road`. Baca dulu: `objs`, `paths`.
- Lakukan: tambahkan dari objek yang ada: patok/batu penanda jarak tiap ±300 px, satu tempat singgah (api unggun + kotak + bangku) di tengah, gerobak rusak di pinggir jalan.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; benda alam liar (api unggun) hanya di luar permukiman
- Cek: `npm run check` (0 masalah); jalan panjang terasa punya cerita.

### [x] T356. **Satu penanda besar per wilayah** — referensi: BotW (gravitasi), GEOGRAFI §4

- File: peta wilayah di tabel GEOGRAFI §4 (`src/world/maps/*.js`). Baca dulu: `docs/GEOGRAFI.md` §4; daftar objek tinggi di `src/world/objects.js`.
- Lakukan: untuk tiap wilayah pastikan ada penanda dari tabel (pakai objek yang sudah ada; kalau tidak ada yang cocok, tulis catatan). Letakkan di titik yang terlihat dari jalan masuk wilayah.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; jangan membuat gambar/objek baru
- Cek: `npm run check` (0 masalah); masuk tiap wilayah → penanda terlihat dalam 1–2 layar.

### [x] T357. **Hadiah di sekitar penanda & sudut pandang** — referensi: BotW (gravitasi), Elden Ring

- File: peta yang punya penanda / sudut pandang `vp_*` (grep `vp_` di maps). Baca dulu: posisi penanda & `vp_*`; format peti (`chests`) & daun obat di peta.
- Lakukan: dalam 120 px dari tiap penanda/sudut pandang letakkan satu hal menarik yang SUDAH ada jenisnya: peti kecil, prasasti lore yang sudah ada, atau tanaman obat. Maks 1 per penanda.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; jangan menambah item/lore baru di data
- Cek: `npm run check` (0 masalah); mendekati penanda selalu ada sesuatu yang didapat.

### [x] T358. **Aturan segitiga: gugus batu & bukit** — referensi: BotW (aturan segitiga)

- File: `src/world/maps/meadow.js`, `forest.js`, `snow.js`, `swamp.js`. Baca dulu: objek batu/semak besar yang ada.
- Lakukan: di tiap wilayah, buat 2–3 gugus batu/semak dengan ukuran BERAGAM (besar–sedang–kecil) yang menutup sebagian pandangan ke penanda/rahasia dari jalan utama, sehingga pemain berbelok untuk melihat.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar; jalan tetap terbuka
- Cek: `npm run check` (0 masalah); berjalan di padang → penanda 'terungkap' saat melewati gugus batu.

### [x] T359. **Konsistensi bioma per wilayah** — referensi: Ekologi nyata, GEOGRAFI §2

- File: `src/world/maps/*.js` (tabel pohon/semak sebaran tiap peta) & `PERALIHAN` di layout.js (BACA). Baca dulu: daftar jenis objek alam tiap peta.
- Lakukan: pastikan: salju → hanya pinus/pohon salju/batu es; rawa → alang-alang, pohon mati, jamur; padang → bunga & sedikit pohon; hutan → paling rapat di tengah, jarang di tepi. Ganti jenis yang salah tempat dengan jenis yang benar (posisi tetap).
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); tidak ada pohon salju di rawa, dsb.

### [x] T360. **Tebing di perpindahan ketinggian** — referensi: BotW (lereng), Pokémon (tebing & tangga)

- File: `src/world/maps/snow.js`, `meadow.js`, `city.js` (`road`). Baca dulu: `docs/GEOGRAFI.md` §2; objek tebing `ls_*_cliff` yang sudah ada (grep `cliff` di maps).
- Lakukan: di sisi wilayah yang menuju ketinggian lebih rendah/tinggi (lihat tabel §2), tambahkan deret tebing pendek di luar jalan; di titik jalan melintas biarkan celah 40 px sebagai tanjakan.
- Batasan: tidak ada objek/NPC/musuh/peti di atas air; jangan menutup pintu/jalan keluar
- Cek: `npm run check` (0 masalah); dari padang ke lereng salju terasa 'naik'.

### [x] T361. **Rangkum perubahan geografi** — referensi: —

- File: `docs/GEOGRAFI.md` (bagian baru §6 di akhir). Baca dulu: —.
- Lakukan: setelah tugas-tugas geografi di atas: tambahkan §6 "Status" berisi daftar peta yang sudah punya sungai/penanda/alun-alun, dan yang belum beserta alasannya (maks 15 baris).
- Cek: `npm run check` (0 masalah); dokumen menggambarkan keadaan nyata.

## J. GELOMBANG 9 — kepadatan kota vs desa & permukiman yang HIDUP ala Stoneshard (T362–T384)

File BARU milik agen: `src/npc/crowd.js`, `src/systems/townlife.js`. Pengecualian kunci: `src/npc/brain.js` untuk tugas yang menyebutnya. Kinerja HP penting: semua yang bergerak/berpartikel hanya aktif dekat kamera. Uji di `?benua=1` siang, sore, malam, & hujan.

### [x] T362. **Ukur kepadatan permukiman (alat)** — referensi: GEOGRAFI §1

- File: skrip sementara di `/tmp` (BUKAN di repo). Baca dulu: `mapObjects(M)` & `OBJ` (konsol game).
- Lakukan: jalankan game (Playwright) lalu hitung per peta `village, kgate, kpasar, kakademi, kbawah`: luas (Mpx² = w×h/1e6), jumlah bangunan (objek dengan `OBJ[t].fade` atau nama rumah/toko), NPC, pohon sebaran, per Mpx². Simpan hasil awal sebagai catatan di bawah tugas ini.
- Hasil pengukuran awal kepadatan permukiman (baseline):
  | Peta | Luas (Mpx²) | Bangunan | NPC | Pohon (n) | Bangunan/Mpx² | NPC/Mpx² | Pohon/Mpx² |
  |---|---|---|---|---|---|---|---|
  | village | 0.73 | 24 | 10 | 0 | 32.9 | 13.7 | 0.0 |
  | kgate | 1.08 | 6 | 5 | 160 | 5.6 | 4.6 | 148.1 |
  | kpasar | 1.92 | 17 | 11 | 120 | 8.9 | 5.7 | 62.5 |
  | kakademi | 1.40 | 5 | 5 | 260 | 3.6 | 3.6 | 185.7 |
  | kbawah | 1.20 | 13 | 7 | 80 | 10.8 | 5.8 | 66.7 |
- Cek: `npm run check` (0 masalah); tabel awal tercatat (desa ±8 bangunan & 14 NPC per Mpx², pasar ±6 & 6).

### [x] T363. **Kota: kurangi pohon sebaran otomatis** — referensi: Kota bukan hutan (Skyrim, Stoneshard Brynn)

- File: `src/world/maps/city.js` (peta kgate, kpasar, kakademi, kbawah). Baca dulu: pengaturan sebaran/tepi pohon peta itu (grep `trees`, `border`, `scatter` di city.js & `mapObjects` di `src/world/ground.js` BACA).
- Lakukan: matikan/kurangi pohon sebaran acak di dalam kota (sisakan tepi luar & taman). Target: pohon ≤ 20% dari total objek peta.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); Akademi tidak lagi terlihat seperti hutan.

### [x] T364. **Distrik Pasar: tambah kios & rumah dagang** — referensi: Pasar Brynn (Stoneshard), Diablo

- File: `src/world/maps/city.js` peta `kpasar`. Baca dulu: objek bangunan/kios/tenda yang sudah ada di `src/world/objects.js`.
- Lakukan: tambah bangunan/kios dari jenis yang SUDAH ada sampai ±18–25 bangunan per Mpx² (≈ 35–45 untuk peta 1,92 Mpx²), deret rapat dengan lorong 40–48 px.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan; jangan membuat gambar baru
- Cek: `npm run check` (0 masalah); ukur ulang dengan alat → masuk target.

### [x] T365. **Kota Bawah: rumah berdempetan** — referensi: Kota tua, Bloodborne (Yharnam)

- File: `src/world/maps/city.js` peta `kbawah`. Baca dulu: objek rumah yang ada.
- Lakukan: tambah rumah sampai ±25–30 per Mpx² (≈ 30–36 untuk 1,2 Mpx²), dempet kiri-kanan dengan gang 32–40 px, pintu tetap tercapai.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); ukur ulang → masuk target; tidak ada pintu tertutup.

### [ ] T366. **Gerbang Kota & Akademi: bangunan sesuai fungsi** — referensi: Whiterun (Skyrim)

- File: `src/world/maps/city.js` peta `kgate`, `kakademi`. Baca dulu: objek bangunan yang ada.
- Lakukan: kgate → ±12–16 bangunan/Mpx² (pos jaga, penginapan gerbang, gudang); kakademi → ±8–12 bangunan besar/Mpx², tata simetris.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); ukur ulang → masuk target.

### [ ] T367. **Warga latar ringan (sistem)** — referensi: Stoneshard (warga kota), Crowd di Assassin's Creed

- File: file baru `src/npc/crowd.js` (daftarkan di index.html setelah `src/npc/brain.js`). Baca dulu: cara NPC biasa dibuat (`spawnNpc`) & pola `lines` warga kota (`cityLines` di `src/world/maps/city.js`).
- Lakukan: buat `spawnCrowd(n, area)` yang memunculkan N warga ringan: sprite karakter acak dari `CHARS` (warna acak), berjalan antar titik acak di jalan (`M.paths`) kecepatan 18–28, berhenti 1–4 s, dan saat ditekan A menampilkan 1 kalimat dari `cityLines`. TIDAK memakai otak `brain.js` & tidak disimpan di save. Maks 12 per peta; yang > 500 px dari kamera tidak di-update.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); konsol `__game.sc.spawnCrowd(8)` di pasar → 8 warga berjalan; FPS tidak turun jelas.

### [ ] T368. **Pasang warga latar di permukiman** — referensi: Stoneshard, Crimson Desert (permukiman ramai)

- File: `src/npc/crowd.js` + data peta (`crowd: N` di `src/world/maps/city.js`, `village.js`). Baca dulu: hasil tugas sebelumnya.
- Lakukan: tambahkan field `crowd` per peta: pasar 12, kota bawah 8, gerbang 6, akademi 5, desa 3; panggil `spawnCrowd(M.crowd)` saat peta dibuat (mode benua: saat wilayah dimasuki, mengikuti `benuaAmbient` sebagai contoh, tanpa mengubah benua_scene.js — bungkus dari crowd.js). Malam hari: jumlah dikali 0,3.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); pasar terasa ramai siang, sepi malam.

### [ ] T369. **Ukur ulang & rangkum kepadatan** — referensi: —

- File: catatan di bawah tugas ini + `docs/GEOGRAFI.md` §6. Baca dulu: alat dari tugas "Ukur kepadatan".
- Lakukan: ukur lagi semua peta permukiman, bandingkan dengan target (pasar NPC+warga 20–28/Mpx², kota bawah bangunan 25–30/Mpx², desa tetap). Tulis tabel sebelum/sesudah.
- Cek: `npm run check` (0 masalah); tabel tersimpan.

### [ ] T370. **Sepulang kerja mampir ke kedai** — referensi: Stoneshard (perajin Osbrook minum dulu sebelum tidur)

- File: `src/npc/brain.js` (pengecualian kunci tugas ini). Baca dulu: `npcBrain` bagian malam (±baris 46–60) & lokasi penginapan desa/kota.
- Lakukan: jam 18:00–21:00, NPC dewasa non-penjaga punya 50% peluang pergi ke depan/dalam penginapan terdekat (titik meja/bangku penginapan) sebelum pulang; ikon 🍺 kecil saat di sana.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); sore hari beberapa warga berkumpul di penginapan.

### [ ] T371. **Toko buka-tutup terlihat** — referensi: Stoneshard (toko ditutup sebelum pulang)

- File: `src/systems/season.js` (`shopShut`) + `src/world/spawn/*.js` (BACA cara objek dibuat). Baca dulu: `shopShut()` & objek toko di peta.
- Lakukan: saat toko tutup, tampilkan papan kecil "TUTUP" (teks di objek `sign` sementara atau label Phaser) di depan pintu toko; saat buka, papan hilang dan pedagang berdiri di depan kios.
- Cek: `npm run check` (0 masalah); jam 22:00 di desa → papan TUTUP di toko.

### [ ] T372. **Jendela menyala di malam hari** — referensi: Stardew, Stoneshard

- File: file baru `src/systems/townlife.js` (daftarkan setelah `src/systems/ambient.js`). Baca dulu: objek rumah di `src/world/objects.js` (`fade`, `chim`) & cara cahaya malam (`this.lights`) dipakai.
- Lakukan: malam hari, tiap rumah dekat kamera mendapat 1–2 titik cahaya hangat di posisi jendela (tambahkan ke `this.lights` dengan flag `win`) dan berkedip pelan; padam bertahap setelah 23:00 (acak per rumah).
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); malam di desa → jendela rumah menyala, lalu satu per satu padam.

### [ ] T373. **Asap & percikan bengkel pandai besi** — referensi: Wanderfolk (bengkel memercikkan bunga api), Stoneshard

- File: `src/systems/townlife.js`. Baca dulu: objek bengkel/landasan (grep `anvil`, `forge` di objects.js/maps).
- Lakukan: siang hari saat pandai besi bekerja di dekat landasan: percikan bunga api tiap 1–2 s + suara denting pelan (`sfxAt` di sound.js) bila Arka ≤ 200 px.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); dekati bengkel siang hari → terdengar & terlihat menempa.

### [ ] T374. **Hewan desa berkeliaran** — referensi: Stardew, Zelda (ayam Kakariko)

- File: `src/systems/townlife.js`. Baca dulu: hewan yang ada di `src/systems/ambient.js`/`assets/img/ani_*` & `spawnCritter` (BACA).
- Lakukan: desa: 3–5 ayam dekat kebun/kandang, 1 anjing yang mengikuti anak-anak, kucing di atap/ambang; kota: burung merpati di alun-alun yang terbang saat Arka berlari. Pakai hewan/tekstur yang sudah ada.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh; jangan menambah gambar baru
- Cek: `npm run check` (0 masalah); desa & alun-alun kota punya hewan bergerak.

### [ ] T375. **Obrolan antar-NPC terlihat** — referensi: Stoneshard, Crimson Desert (warga mengobrol)

- File: `src/npc/brain.js` (pengecualian) + `src/npc/npcs.js` (`NPC_BARKS`). Baca dulu: aksi `'chat'` di brain.js.
- Lakukan: saat dua NPC melakukan `chat`, bergantian tampilkan gelembung pendek (dari `NPC_BARKS` masing-masing) di atas kepala selama 2 s, maks 1 gelembung per pasangan per 6 s, hanya bila ≤ 300 px dari Arka.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); dekati dua warga yang mengobrol → gelembung bergantian.

### [ ] T376. **Teriakan pedagang di pasar** — referensi: Pasar (Witcher 3, Stoneshard Brynn)

- File: `src/systems/townlife.js`. Baca dulu: NPC peran `vendor` (NPC_ROLE di brain.js, BACA) & `cityLines`.
- Lakukan: pedagang di pasar sesekali (tiap 8–15 s, acak) menampilkan gelembung teriakan dagang ("Roti hangat!", "Kain halus, murah!" — tulis 10 kalimat baru di `townlife.js`) bila Arka ≤ 250 px.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); berjalan di pasar → terdengar 'suara' pedagang.

### [ ] T377. **Suara keramaian per zona** — referensi: Witcher 3 (ambience kota), Stardew

- File: `src/systems/sound.js` (BACA `updSound`) + `src/systems/townlife.js`. Baca dulu: cara suara latar diputar (`sfx`, `sfxAt`, file audio yang ada di `src/core/audio.js`).
- Lakukan: di pasar & alun-alun siang hari: lapisan dengung keramaian pelan (pakai suara yang ada atau rangkaian bunyi kecil acak), volume naik saat ke tengah pasar; malam diganti jangkrik/suara malam yang ada.
- Batasan: volume rendah; ikuti pengaturan volume yang ada
- Cek: `npm run check` (0 masalah); masuk pasar → suara ramai; malam → tenang.

### [ ] T378. **Penjaga berpatroli membawa obor di malam hari** — referensi: Stoneshard (penjaga Osbrook), Skyrim

- File: `src/npc/brain.js` (pengecualian) + `src/systems/townlife.js`. Baca dulu: peran `guard`/`gate` di brain.js.
- Lakukan: malam hari penjaga berpatroli di rute jalan utama (titik `M.paths`) dan membawa cahaya kecil yang ikut bergerak (`this.lights` mengikuti sprite).
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); malam di gerbang kota → cahaya obor bergerak berpatroli.

### [ ] T379. **Reaksi terhadap hujan** — referensi: Stoneshard (cuaca), Zelda

- File: `src/npc/brain.js` (pengecualian). Baca dulu: variabel cuaca (`this.weather`) & keputusan tujuan NPC.
- Lakukan: saat hujan: warga dewasa non-penjaga berjalan lebih cepat ke tempat berteduh (pintu rumah/penginapan/atap pasar) atau pulang; anak-anak 30% tetap bermain (gembira). Warga latar berkurang 70%.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); hujan turun → jalanan desa menyepi.

### [ ] T380. **Pagi hari: membuka toko & menyapu** — referensi: Stoneshard (rutinitas harian)

- File: `src/npc/brain.js` (pengecualian). Baca dulu: rutinitas `work` peran vendor/inn/smith.
- Lakukan: 06:00–08:00: pedagang/pemilik penginapan berdiri di depan pintu dengan ikon 🧹 (menyapu) beberapa detik sebelum mulai `work`; pandai besi menyalakan tungku (asap cerobong mulai keluar).
- Cek: `npm run check` (0 masalah); datang pagi → terlihat persiapan membuka usaha.

### [ ] T381. **Jejak kehidupan: barang di depan rumah** — referensi: Horizon (detail kecil bercerita), Stardew

- File: `src/world/maps/village.js`, `city.js`. Baca dulu: objek hiasan yang ada (tong, peti, jemuran/pot/bunga, kayu bakar — grep di objects.js).
- Lakukan: tiap rumah punya 1–3 benda yang menunjukkan penghuninya (petani: cangkul/jerami; pemburu: kayu & kulit; pedagang: peti barang). Letakkan di samping pintu, bukan di jalan.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan; hanya objek yang sudah ada
- Cek: `npm run check` (0 masalah); berjalan di desa → setiap rumah punya cerita kecil.

### [ ] T382. **Anak-anak bermain kejar-kejaran** — referensi: Crimson Desert (anak-anak bermain), Zelda

- File: `src/npc/brain.js` (pengecualian). Baca dulu: aksi `'play'`.
- Lakukan: jika ≥ 2 NPC anak dalam 120 px, mereka sesekali bermain kejar-kejaran (satu mengejar, lainnya berlari zig-zag 6–10 s) di alun-alun/area terbuka, lalu kembali ke rutinitas.
- Batasan: ikuti `docs/PLACEMENT_RULES.md` & `docs/NPC_RULES.md`; jangan menutup pintu/jalan
- Cek: `npm run check` (0 masalah); siang di desa → anak-anak berlarian.

### [ ] T383. **Sorot balik ruang dalam: kehidupan di interior** — referensi: Wanderfolk (bara perapian, lilin kuil)

- File: `src/systems/townlife.js`. Baca dulu: peta interior di `src/world/maps/interiors.js` (penginapan, kuil, rumah).
- Lakukan: penginapan: bara kecil melayang dari perapian; kuil: partikel cahaya lilin lembut; rumah: kepulan uap dari panci. Hanya saat di peta interior itu.
- Batasan: kinerja HP: buat objek/efek hanya bila dekat kamera (≤ 500 px) & hancurkan saat jauh
- Cek: `npm run check` (0 masalah); masuk penginapan → perapian terasa hidup.

### [ ] T384. **Rangkum suasana hidup** — referensi: —

- File: `docs/NPC_RULES.md` (bagian baru di akhir, maks 15 baris). Baca dulu: —.
- Lakukan: catat sistem kehidupan kota yang baru (warga latar, kedai sore, jendela malam, hujan, pagi, patroli obor) dan file tempatnya, agar agen berikutnya tidak membuat ulang.
- Cek: `npm run check` (0 masalah); dokumen terbarui.

## K. GELOMBANG 10 — tata kota & desa abad pertengahan (kawasan, kavling, gilda, jalan, kepuasan) (T385–T408)

Wajib baca `docs/GEOGRAFI.md` §7 (versi abad pertengahan: rumah-toko, kavling memanjang, gilda, usaha kotor di hilir, kuil+pasar di pusat).
File BARU milik agen: `src/data/zoning.js`, `tools/check-zoning.js`, `src/systems/zoning_view.js`. Kerjakan berurutan: data → alat → tampilan → tata ulang.
Tugas tata letak gelombang 8 (T346–T354) yang belum selesai juga mengikuti §7 versi ini.
Sebagian besar perubahan = DATA peta. Batasan umum untuk semua tugas tata ulang: ikuti `docs/PLACEMENT_RULES.md`; bangunan yang dipakai misi/NPC cerita
boleh digeser maks 120 px dan pintunya tetap tercapai; jangan menghapus bangunan; JANGAN buat grid kotak-kotak atau jalan lurus semua.

### [ ] T385. **Data kawasan: fungsi & pengaruh tiap jenis bangunan** — referensi: Stoneshard, Kingdom Come: Deliverance (Rattay)

- File: file baru `src/data/zoning.js` (daftarkan di index.html setelah `src/world/objects.js`). Baca dulu: `docs/GEOGRAFI.md` §7; kunci objek di `src/world/objects.js`.
- Lakukan: `const ZONE_OF = { <tipeObj>: 'rumahtoko'|'gilda'|'kotor'|'tani'|'umum'|'tahan'|'atas', … }` untuk semua bangunan & objek kerja;
  `const INFLU = { tipe: { bising: r } | { bau: r, hilir: 1.5 } | { tenang: r } | { ramai: r } }`; `const SERVICE = { well: 220, … }` sesuai §7. Ragu → catat.
- Cek: `npm run check` (0 masalah); konsol `ZONE_OF.houseA === 'rumahtoko'`.

### [ ] T386. **Alat cek tata kota (laporan)** — referensi: Cities: Skylines (peta pengaruh & layanan)

- File: file baru `tools/check-zoning.js` (meniru cara `tools/check-layout.js` memuat peta). Baca dulu: §7 & `src/data/zoning.js`.
- Lakukan: untuk `village, kgate, kpasar, kakademi, kbawah` (dan peta ≥ 4 rumah): per rumah hitung pengaruh buruk, layanan tak terjangkau, isi halaman belakang,
  skor kepuasan (rumus §7). Laporkan juga: rumah-toko yang pintunya > 24 px dari jalan utama; usaha kotor di dalam tembok atau di HULU kota;
  alun-alun tanpa kuil/shrine dalam 260 px. Masukkan ke `npm run check` sebagai PERINGATAN.
- Cek: `npm run check` (0 masalah); `node tools/check-zoning.js` mencetak tabel; skor awal dicatat di bawah tugas ini.

### [ ] T387. **Tampilan kawasan di dalam game (`?zona=1`)** — referensi: TheoTown (lapisan info)

- File: file baru `src/systems/zoning_view.js`. Baca dulu: `src/data/zoning.js`; `this.add.graphics`.
- Lakukan: dengan `zona=1`: kotak semi-transparan warna kawasan di bawah bangunan, garis kavling, lingkaran pengaruh (merah bising, cokelat bau + panah hilir,
  hijau tenang), skor kepuasan kecil di atas rumah. Tanpa parameter: tidak aktif sama sekali.
- Cek: `npm run check` (0 masalah); `?benua=1&zona=1` di desa → kawasan & radius terlihat.

### [ ] T388. **Desa Lumina: pola desa medieval** — referensi: Stardew Valley (Pelican Town), Kingdom Come (Samopesh)

- File: `src/world/maps/village.js`. Baca dulu: §7 (Desa vs kota) + laporan `check-zoning`.
- Lakukan: satu jalan utama dari gerbang timur ke alun-alun kecil (sumur + shrine/altar + papan pengumuman); rumah renggang di kiri-kanan jalan dengan
  halaman; bengkel pandai besi dekat gerbang/jalan masuk; kandang & hay di pinggir dekat ladang; pagar kayu, bukan tembok batu.
- Cek: `npm run check` (0 masalah); `check-zoning`: kepuasan desa ≥ 75, tidak ada rumah dalam radius bising bengkel.

### [ ] T389. **Desa Lumina: halaman belakang & layanan** — referensi: Stoneshard (desa Osbrook)

- File: `src/world/maps/village.js`. Baca dulu: laporan `check-zoning` (halaman kosong, rumah tanpa layanan).
- Lakukan: tiap rumah diberi 1–3 isi halaman belakang (woodpile, barrel, crate, kebun kecil, kandang ayam). Tambah/geser sumur & pos jaga agar setiap rumah
  terjangkau sumur 220, pos jaga 320, toko 320, shrine 420.
- Cek: `npm run check` (0 masalah); `check-zoning`: 0 rumah tanpa layanan, 0 halaman kosong di desa.

### [ ] T390. **Gerbang Kota: gatehouse, pos tol & kandang di luar** — referensi: Kingdom Come (gerbang Rattay), Witcher 3 (Novigrad)

- File: `src/world/maps/city.js` peta `kgate`. Baca dulu: §7 (Pertahanan, Usaha kotor).
- Lakukan: gatehouse + cwall jelas membingkai jalan utama; di LUAR gerbang: kandang kuda, gerobak, penginapan murah, lapak pedagang keliling;
  di DALAM: pos jaga + rumah-toko pertama. Jalan utama lurus dari gerbang lalu mulai berliku menuju pasar.
- Cek: `npm run check` (0 masalah); `check-zoning`: 0 usaha kotor di dalam tembok kgate.

### [ ] T391. **Distrik Pasar: alun-alun baji & deret rumah-toko** — referensi: kota pasar Inggris (market place berbentuk baji)

- File: `src/world/maps/city.js` peta `kpasar`. Baca dulu: §7 (Rumah-toko, Kavling, Pola jalan).
- Lakukan: alun-alun melebar seperti baji di pertemuan jalan; kuil/shrine + balai (board/bell) di sisinya; rumah-toko berderet rapat menghadap
  alun-alun & jalan utama (kavling 56–80 px lebar, pintu ≤ 24 px dari jalan); kedai di sudut alun-alun.
- Cek: `npm run check` (0 masalah); `check-zoning`: 0 rumah-toko jauh dari jalan; kuil dalam 260 px dari pasar.

### [ ] T392. **Distrik Akademi: kawasan atas yang lega** — referensi: Oxford/Cambridge abad pertengahan, Skyrim (Solitude atas)

- File: `src/world/maps/city.js` peta `kakademi`. Baca dulu: §7 (Kawasan atas).
- Lakukan: akademi & rumah besar dengan halaman luas (jarak antar rumah ≥ 2× Kota Bawah); taman dalam/pelataran; tidak ada usaha bising/bau dalam 200 px;
  shrine & kedai sendiri untuk distrik ini.
- Cek: `npm run check` (0 masalah); `check-zoning`: kepuasan kakademi ≥ 85.

### [ ] T393. **Kota Bawah: padat, miskin, tetap terlayani** — referensi: Witcher 3 (Novigrad Bits), Stoneshard (Brynn bawah)

- File: `src/world/maps/city.js` peta `kbawah`. Baca dulu: §7.
- Lakukan: rumah berdempet di gang sempit berliku; kavling lebih sempit (48–60 px); sumur bersama & pos jaga wajib; penyamakan/pencelupan/jagal di ujung HILIR
  (lihat §3 arah sungai) atau di luar tembok; kedai murah + shrine kecil sendiri.
- Cek: `npm run check` (0 masalah); `check-zoning`: kepuasan 60–70, 0 rumah tanpa sumur/pos jaga, 0 usaha kotor di hulu.

### [ ] T394. **Desa Kincir & permukiman kecil lain** — referensi: desa pertanian medieval (open-field)

- File: peta yang memuat Desa Kincir (grep `Kincir` di `src/world/maps/`) & permukiman kecil lain. Baca dulu: §7 (Desa vs kota).
- Lakukan: windmill di bukit/tepi ladang (bising 100) atau kincir air di sungai; rumah petani berkelompok ≥ 100 px dari kincir di sekitar sumur;
  ladang memanjang berpagar mengelilingi desa; shrine kecil di tengah.
- Cek: `npm run check` (0 masalah); `check-zoning` tanpa pelanggaran besar.

### [ ] T395. **Jalan berliku dari gerbang & gang tanpa jalan pintas** — referensi: tata jalan Gloucester (4 jalan gerbang bertemu di pusat)

- File: `src/world/maps/village.js`, `city.js` (`paths`). Baca dulu: §7 (Pola jalan).
- Lakukan: jalan utama radius 14–16 dari tiap gerbang ke alun-alun; jalan penghubung & gang dibuat berliku (titik belok tiap 120–200 px, geser 16–40 px).
  Gang yang menghubungkan dua jalan utama melewati deret rumah → jadikan buntu ke halaman.
- Cek: `npm run check` (0 masalah); `check-zoning` (tambah cek: path radius ≤ 9 yang ujungnya menyentuh dua jalan radius ≥ 14) → 0.

### [ ] T396. **Rumah & tempat kerja NPC sesuai kawasan** — referensi: Kingdom Come (jadwal warga), Stardew

- File: data `npcs` di peta permukiman + `src/npc/brain.js` (BACA `npcBrainInit`, home/work). Baca dulu: posisi `home`/`work` NPC.
- Lakukan: pandai besi tinggal di rumah-toko di gang gilda/dekat bengkelnya; pedagang di rumah-toko pasar; petani di desa/pinggir; penyamak di luar tembok.
  Geser posisi awal NPC (data peta) bila tidak sesuai; NPC cerita yang terkait misi: jangan diubah tanpa catatan.
- Cek: `npm run check` (0 masalah); konsol: tiap NPC dewasa, rumah & kerja di kawasan yang sesuai.

### [ ] T397. **Deteksi titik sesak rute warga** — referensi: Cities: Skylines (peta lalu lintas)

- File: `tools/check-zoning.js`. Baca dulu: rute rumah → kerja/pasar/kuil tiap NPC & warga latar.
- Lakukan: hitung rute yang melewati tiap titik sempit (< 48 px antar objek bertabrakan). Laporkan > 6 rute. Perbaiki: geser hiasan atau tambah gang alternatif.
  Gang sempit berliku itu wajar; yang dihindari hanya NPC/pemain tersangkut.
- Cek: `npm run check` (0 masalah); laporan: 0 titik sesak di desa & pasar.

### [ ] T398. **Warga bereaksi pada kepuasan** — referensi: Stoneshard (keluhan warga), Kingdom Come

- File: `src/npc/npcs.js` (`NPC_BARKS`) + `src/systems/townlife.js`. Baca dulu: skor kepuasan per rumah (hitung saat peta dibuat, rumus §7).
- Lakukan: kepuasan < 50 → keluhan sesuai sebab ("Bau penyamakan sampai ke dapurku.", "Sumurnya jauh sekali.", "Dentang palu dari subuh.");
  ≥ 85 → kalimat senang ("Halaman belakangku penuh sayur tahun ini."). 12 kalimat baru, bahasa sehari-hari bernuansa medieval.
- Cek: `npm run check` (0 masalah); dekati warga rumah tak puas → keluhan sesuai sebabnya.

### [ ] T399. **Uji pemain: kota terasa tumbuh alami** — referensi: —

- File: catatan di bawah tugas ini. Baca dulu: `?benua=1&zona=1` lalu tanpa `zona`.
- Lakukan: jalan dari gerbang kota → pasar → akademi → kota bawah → desa. Catat: fungsi tiap area terbaca tanpa overlay? terlihat seperti grid (buruk)?
  ada gang buntu yang menjebak? 3 perbaikan kecil paling berdampak; kerjakan bila < 40 baris data.
- Cek: `npm run check` (0 masalah); catatan berisi temuan & perbaikan.

### [ ] T400. **Perbarui GEOGRAFI §7 dengan hasil akhir** — referensi: —

- File: `docs/GEOGRAFI.md` §7 (sub-bagian "Status"). Baca dulu: laporan akhir `check-zoning`.
- Lakukan: tabel per peta: kepuasan rata-rata, rumah tanpa layanan, usaha kotor salah tempat, titik sesak — sebelum/sesudah.
- Cek: `npm run check` (0 masalah); dokumen terbarui.

### [ ] T401. **Gang Gilda Pandai Besi** — referensi: Ironmongers' Row (Gloucester), Kingdom Come (bengkel Rattay)

- File: `src/world/maps/city.js` (`kpasar` atau `kgate`, pilih yang dekat gerbang). Baca dulu: §7 (Gilda perajin).
- Lakukan: satu gang radius 9–10 bercabang dari jalan utama berisi 2–3 bengkel (anvil, forge, bellows, crateCart) berderet; papan nama "Gang Pandai Besi"
  (objek `sign`); rumah di gang ini = rumah perajin. Tidak ada rumah kawasan atas dalam 120 px.
- Cek: `npm run check` (0 masalah); `check-zoning`: semua objek gilda pandai besi dalam satu kelompok ≤ 200 px.

### [ ] T402. **Gang Gilda Tenun & Tembikar** — referensi: kawasan perajin medieval (weavers' quarter)

- File: `src/world/maps/city.js` (`kbawah` atau `kpasar`). Baca dulu: §7, T401.
- Lakukan: gang kedua berisi woodenloom, potterswheel, rak/jemuran kain, crate; papan nama gilda. Lebih tenang dari pandai besi, boleh dekat rumah biasa.
- Cek: `npm run check` (0 masalah); gang terlihat jelas sebagai kawasan kerajinan.

### [ ] T403. **Penyamakan & pencelupan di hilir, di luar tembok** — referensi: kota medieval (usaha berbau di pinggir & hilir)

- File: peta kota yang dilewati sungai (lihat §3; grep `ponds` di `src/world/maps/city.js`). Baca dulu: §3 arah aliran, §7 (Usaha kotor).
- Lakukan: buat kelompok kecil penyamakan/pencelupan (barrel, pot, rak kulit/kain, woodpile) di tepi sungai SETELAH kota (hilir) dan di luar cwall;
  air di dekatnya boleh diberi warna keruh lewat data bila objek/ponds mendukung, kalau tidak lewati bagian warna.
- Cek: `npm run check` (0 masalah); `check-zoning`: 0 usaha kotor di hulu atau dalam tembok.

### [ ] T404. **Kavling memanjang di jalan utama kota** — referensi: burgage plot (kota pasar Inggris)

- File: `src/world/maps/city.js` (`kpasar`, `kbawah`). Baca dulu: §7 (Kavling memanjang).
- Lakukan: susun rumah-toko berderet dengan lebar kavling 56–80 px (kbawah 48–60), pintu menghadap jalan; di belakang tiap rumah taruh 1–3 isi halaman;
  pisahkan kavling dengan fence pendek atau semak. Gang belakang radius 8 menyusuri ujung kavling bila muat.
- Cek: `npm run check` (0 masalah); `check-zoning`: ≥ 80% rumah kota punya halaman berisi.

### [ ] T405. **Tembok, menara & pos jaga malam** — referensi: kota bertembok medieval, Stoneshard (penjaga malam)

- File: `src/world/maps/city.js` (`kgate`, batas distrik). Baca dulu: §7 (Pertahanan); `src/systems/townlife.js` (patroli obor, BACA saja).
- Lakukan: rapikan cwall agar membentuk lingkar yang terbaca (celah hanya di gerbang & sungai); brazier/lamp tiap 240–320 px di sepanjang tembok dalam;
  1 pos jaga per gerbang. Jangan menutup jalur yang dipakai misi.
- Cek: `npm run check` (0 masalah); malam hari tembok terang berselang, gerbang terlihat dijaga.

### [ ] T406. **Kuil & pasar berdampingan + hari pasar** — referensi: kota medieval (pasar setelah ibadah), Kingdom Come

- File: `src/world/maps/city.js` (`kpasar`) + `src/systems/townlife.js`. Baca dulu: §7 (Pusat umum); jadwal waktu (`S.time`/jam di townlife).
- Lakukan: pastikan kuil/shrine menghadap alun-alun pasar. Di townlife: tiap hari ke-7 (hari pasar) jumlah warga latar di alun-alun ×1.5 dan ada
  2 lapak tambahan (objek market/crateCart sementara) pagi–siang; hari biasa normal.
- Cek: `npm run check` (0 masalah); hari ke-7 pagi pasar terlihat lebih ramai.

### [ ] T407. **Kedai & shrine per distrik** — referensi: kota medieval (tiap distrik punya kedai & gereja sendiri)

- File: `src/world/maps/city.js` (`kpasar`, `kakademi`, `kbawah`). Baca dulu: §7 (Layanan).
- Lakukan: tiap distrik minimal 1 kedai (bangunan/papan + bench + barrel) dan 1 shrine/altar kecil, dalam jangkauan 360/420 px dari semua rumah distrik.
  Pakai bangunan yang ada; tambah hanya objek kecil.
- Cek: `npm run check` (0 masalah); `check-zoning`: 0 rumah tanpa kedai/shrine.

### [ ] T408. **Nama jalan dari gerbang** — referensi: Gloucester (jalan dinamai menurut gerbangnya)

- File: `src/world/maps/city.js`, `village.js` (objek `sign`). Baca dulu: §7 (Pola jalan).
- Lakukan: tiap jalan utama diberi 1–2 papan nama di persimpangan: "Jalan Gerbang Timur", "Jalan Kuil", "Gang Pandai Besi", dll. Teks pendek (≤ 20 huruf).
- Cek: `npm run check` (0 masalah); papan terbaca di persimpangan utama.

---

Tugas besar (JANGAN diambil agen ini): pola serangan musuh & boss berfase, Botol Cahaya tambahan, pilar build/mantra, markas, sekutu & ikatan,
memasang BESTIARY_TEXT ke layar Bestiari, buang petak objek jauh di mode benua, hapus mode lama. Rincian: `docs/GAME_DESIGN.md` (akhir) & `docs/HANDOFF_OPENWORLD.md`.
