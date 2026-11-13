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

### [ ] T73. **Siapkan file teks bestiari**
- Buat file baru `src/data/bestiary_text.js` berisi persis:
  `'use strict';` / `// Teks bestiari per musuh (id = kunci ENEMY): habitat & tips melawan. Dipasang ke layar Bestiari oleh sesi besar.` / `const BESTIARY_TEXT = {` / `};`
- Daftarkan di `index.html` tepat SETELAH baris `<script src="src/data/enemies.js"></script>`.
- Cek: `npm run check`; konsol `typeof BESTIARY_TEXT === 'object'`. (Tugas-tugas berikut mengisi entrinya.)

### [ ] T74. **Teks bestiari `slime` (Slime)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slime.tip`.

### [ ] T75. **Teks bestiari `gold_slime` (Slime Emas)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  gold_slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'flee'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gold_slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gold_slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gold_slime.tip`.

### [ ] T76. **Teks bestiari `mimic` (Peti Mimic)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  mimic:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `mimic: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'mimic'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.mimic.tip`.

### [ ] T77. **Teks bestiari `slimeb` (Slime Biru)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slimeb:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimeb: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimeb'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimeb.tip`.

### [ ] T78. **Teks bestiari `slimer` (Slime Merah)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slimer:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimer: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimer'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimer.tip`.

### [ ] T79. **Teks bestiari `slimei` (Slime Es)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slimei:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimei: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimei'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimei.tip`.

### [ ] T80. **Teks bestiari `bat` (Kelelawar)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  bat:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bat: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bat'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bat.tip`.

### [ ] T81. **Teks bestiari `batc` (Kelelawar Gua)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  batc:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `batc: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'batc'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.batc.tip`.

### [ ] T82. **Teks bestiari `bee` (Tawon)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  bee:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bee: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bee'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bee.tip`.

### [ ] T83. **Teks bestiari `shroom` (Jamur Racun)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  shroom:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `shroom: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'shroom'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.shroom.tip`.

### [ ] T84. **Teks bestiari `plant` (Bunga Pemakan)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  plant:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'turret'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `plant: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'plant'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.plant.tip`.

### [ ] T85. **Teks bestiari `skel` (Tengkorak)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  skel:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `skel: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'skel'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.skel.tip`.

### [ ] T86. **Teks bestiari `goblin` (Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  goblin:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin.tip`.

### [ ] T87. **Teks bestiari `wolf` (Serigala)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  wolf:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wolf: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wolf'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wolf.tip`.

### [ ] T88. **Teks bestiari `snake` (Ular)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  snake:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'walk'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `snake: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'snake'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.snake.tip`.

### [ ] T89. **Teks bestiari `boar` (Babi Hutan)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  boar:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'charge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `boar: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'boar'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.boar.tip`.

### [ ] T90. **Teks bestiari `ghost` (Hantu)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  ghost:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'ghost'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `ghost: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'ghost'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.ghost.tip`.

### [ ] T91. **Teks bestiari `golem` (Golem)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  golem:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'golem'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golem: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golem'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golem.tip`.

### [ ] T92. **Teks bestiari `gchief` (Kepala Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  gchief:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'boss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gchief: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gchief'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gchief.tip`.

### [ ] T93. **Teks bestiari `squeen` (Ratu Jamur)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  squeen:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'qboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `squeen: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'squeen'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.squeen.tip`.

### [ ] T94. **Teks bestiari `gsnake` (Ular Raksasa)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  gsnake:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'sboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gsnake: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gsnake'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gsnake.tip`.

### [ ] T95. **Teks bestiari `gking` (Raja Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  gking:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'boss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `gking: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'gking'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.gking.tip`.

### [ ] T96. **Teks bestiari `frog` (Katak Rawa)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  frog:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `frog: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'frog'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.frog.tip`.

### [ ] T97. **Teks bestiari `wisp` (Wisp)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  wisp:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'ghost'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wisp: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wisp'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wisp.tip`.

### [ ] T98. **Teks bestiari `slimep` (Slime Racun)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slimep:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimep: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimep'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimep.tip`.

### [ ] T99. **Teks bestiari `witch` (Morgath)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  witch:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'wboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `witch: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'witch'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.witch.tip`.

### [ ] T100. **Teks bestiari `golemk` (Golem Purba)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  golemk:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'gboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golemk: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golemk'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golemk.tip`.

### [ ] T101. **Teks bestiari `wolfs` (Serigala Salju)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  wolfs:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `wolfs: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'wolfs'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.wolfs.tip`.

### [ ] T102. **Teks bestiari `slimef` (Slime Api)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  slimef:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `slimef: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'slimef'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.slimef.tip`.

### [ ] T103. **Teks bestiari `salam` (Salamander)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  salam:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'walk'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `salam: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'salam'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.salam.tip`.

### [ ] T104. **Teks bestiari `golemi` (Golem Es)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  golemi:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'golem'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `golemi: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'golemi'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.golemi.tip`.

### [ ] T105. **Teks bestiari `kryos` (Naga Es Kryos)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  kryos:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'dboss'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `kryos: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'kryos'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.kryos.tip`.

### [ ] T106. **Teks bestiari `bounty_wolf` (Taring Perak)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  bounty_wolf:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'lunge'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_wolf: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_wolf'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_wolf.tip`.

### [ ] T107. **Teks bestiari `bounty_frog` (Raja Rawa Toksin)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  bounty_frog:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_frog: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_frog'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_frog.tip`.

### [ ] T108. **Teks bestiari `bounty_gargoyle` (Gargoyle Merah)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  bounty_gargoyle:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'fly'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `bounty_gargoyle: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'bounty_gargoyle'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.bounty_gargoyle.tip`.

### [ ] T109. **Teks bestiari `king_slime` (Raja Slime Mahkota)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  king_slime:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'hop'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `king_slime: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'king_slime'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.king_slime.tip`.

### [ ] T110. **Teks bestiari `goblin_archer` (Goblin Pemanah)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  goblin_archer:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shoot'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin_archer: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin_archer'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin_archer.tip`.

### [ ] T111. **Teks bestiari `goblin_shaman` (Dukun Goblin)** — butuh tugas "Siapkan file teks bestiari" selesai
- Baca baris musuh: `grep -n "^  goblin_shaman:" src/data/enemies.js` (JANGAN ubah file itu). Catat `ai: 'shaman'`, hp, atk, drop.
- File: `src/data/bestiary_text.js`. Tambah entri: `goblin_shaman: { hab: '…', tip: '…' },`
- `hab` = di mana biasa ditemui (1 kalimat; cek peta dengan `grep -rn "'goblin_shaman'" src/world/maps/`). `tip` = cara melawan yang sesuai `ai` (1 kalimat, mis. hop → "tunggu ia mendarat lalu serang").
- Tanpa spoiler cerita. Cek: `npm run check`; konsol `BESTIARY_TEXT.goblin_shaman.tip`.

### [ ] T112. **Pecah baris > 160 karakter di `src/systems/achievements.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/achievements.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T113. **Pecah baris > 160 karakter di `src/systems/life/harvest_3.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/harvest_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T114. **Pecah baris > 160 karakter di `src/systems/life/interact_2.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T115. **Pecah baris > 160 karakter di `src/systems/life/interact_4.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_4.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T116. **Pecah baris > 160 karakter di `src/systems/life/minigame_1.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_1.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T117. **Pecah baris > 160 karakter di `src/world/maps/cave.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/cave.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T118. **Pecah baris > 160 karakter di `src/world/maps/village.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/village.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T119. **Pecah baris > 160 karakter di `src/main.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/main.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T120. **Pecah baris > 160 karakter di `src/npc/npcs.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/npc/npcs.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T121. **Pecah baris > 160 karakter di `src/ui/savecode.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/savecode.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T122. **Pecah baris > 160 karakter di `src/ui/shop.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/shop.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T123. **Pecah baris > 160 karakter di `src/ui/title.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/ui/title.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T124. **Pecah baris > 160 karakter di `src/world/maps/snow.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/snow.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T125. **Pecah baris > 160 karakter di `src/world/spawn/spawn_2.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/spawn/spawn_2.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T126. **Pecah baris > 160 karakter di `src/gfx/gptassets.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/gptassets.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T127. **Pecah baris > 160 karakter di `src/systems/daynight.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/daynight.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T128. **Pecah baris > 160 karakter di `src/systems/life/interact_8.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/interact_8.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T129. **Pecah baris > 160 karakter di `src/systems/story.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/story.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T130. **Pecah baris > 160 karakter di `src/world/maps/meadow.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/world/maps/meadow.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T131. **Pecah baris > 160 karakter di `src/gfx/bake.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/gfx/bake.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T132. **Pecah baris > 160 karakter di `src/systems/economy/economy_3.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/economy/economy_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T133. **Pecah baris > 160 karakter di `src/systems/life/minigame_3.js`**
- Lihat baris panjang: `awk 'length>160{print FNR}' src/systems/life/minigame_3.js`. Pecah tiap baris di `;` atau `,` menjadi beberapa baris, indentasi sama. LOGIKA TIDAK BOLEH BERUBAH.
- Jangan pecah di tengah string/template literal. Jangan menyisipkan komentar `//` di tengah pernyataan.
- Lalu `node tools/check-size.js --update` (angka utang harus TURUN). Cek: `npm run check`, buka game & mainkan 30 detik tanpa error konsol.

### [ ] T134. **Pecah baris > 160 karakter di `src/systems/life/minigame_5.js`**
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

### [ ] T188. **Pencapaian baru `fish50` — Kail Emas**
- Dulu cek duplikat: `grep -n "S.st.fish" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'fish50', n: 'Kail Emas', d: 'Tangkap 50 ikan', ok: () => S.st.fish >= 50, gift: ['gold', 200] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'fish50').ok()` tidak error.

### [ ] T189. **Pencapaian baru `harvest30` — Petani Rajin**
- Dulu cek duplikat: `grep -n "S.st.harvest" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'harvest30', n: 'Petani Rajin', d: 'Panen 30 kali', ok: () => S.st.harvest >= 30, gift: ['seed', 5] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'harvest30').ok()` tidak error.

### [ ] T190. **Pencapaian baru `craft20` — Tangan Terampil**
- Dulu cek duplikat: `grep -n "S.st.crafted" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'craft20', n: 'Tangan Terampil', d: 'Buat 20 barang kerajinan', ok: () => S.st.crafted >= 20, gift: ['gold', 120] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'craft20').ok()` tidak error.

### [ ] T191. **Pencapaian baru `cook15` — Juru Masak Desa**
- Dulu cek duplikat: `grep -n "S.st.cooked" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'cook15', n: 'Juru Masak Desa', d: 'Masak 15 hidangan', ok: () => S.st.cooked >= 15, gift: ['potion', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'cook15').ok()` tidak error.

### [ ] T192. **Pencapaian baru `mine40` — Penambang**
- Dulu cek duplikat: `grep -n "S.st.mined" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'mine40', n: 'Penambang', d: 'Tambang 40 kali', ok: () => S.st.mined >= 40, gift: ['gold', 150] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'mine40').ok()` tidak error.

### [ ] T193. **Pencapaian baru `barrel25` — Penghancur Tong**
- Dulu cek duplikat: `grep -n "S.st.barrels" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'barrel25', n: 'Penghancur Tong', d: 'Pecahkan 25 tong', ok: () => S.st.barrels >= 25, gift: ['ether', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'barrel25').ok()` tidak error.

### [ ] T194. **Pencapaian baru `tree30` — Penebang**
- Dulu cek duplikat: `grep -n "S.st.trees" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'tree30', n: 'Penebang', d: 'Tebang 30 pohon', ok: () => S.st.trees >= 30, gift: ['gold', 100] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'tree30').ok()` tidak error.

### [ ] T195. **Pencapaian baru `steps20k` — Kaki Baja**
- Dulu cek duplikat: `grep -n "S.st.steps" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'steps20k', n: 'Kaki Baja', d: 'Berjalan 20.000 langkah', ok: () => S.st.steps >= 20000, gift: ['boots', 1] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'steps20k').ok()` tidak error.

### [ ] T196. **Pencapaian baru `play5h` — Betah di Lumina**
- Dulu cek duplikat: `grep -n "S.st.playTime" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'play5h', n: 'Betah di Lumina', d: 'Bermain selama 5 jam', ok: () => S.st.playTime >= 18000, gift: ['hipotion', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'play5h').ok()` tidak error.

### [ ] T197. **Pencapaian baru `back10` — Bayangan**
- Dulu cek duplikat: `grep -n "S.st.backstabs" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'back10', n: 'Bayangan', d: 'Serang dari belakang 10 kali', ok: () => S.st.backstabs >= 10, gift: ['gold', 120] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'back10').ok()` tidak error.

### [ ] T198. **Pencapaian baru `gold5k` — Saudagar Muda**
- Dulu cek duplikat: `grep -n "S.st.goldEarned" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'gold5k', n: 'Saudagar Muda', d: 'Kumpulkan total 5.000 G', ok: () => S.st.goldEarned >= 5000, gift: ['gold', 300] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'gold5k').ok()` tidak error.

### [ ] T199. **Pencapaian baru `boss5` — Penakluk**
- Dulu cek duplikat: `grep -n "S.st.bosses" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'boss5', n: 'Penakluk', d: 'Kalahkan 5 boss', ok: () => S.st.bosses >= 5, gift: ['hipotion', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'boss5').ok()` tidak error.

### [ ] T200. **Pencapaian baru `k500` — Legenda Pemburu**
- Dulu cek duplikat: `grep -n "totalKills\\(\\)" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'k500', n: 'Legenda Pemburu', d: 'Kalahkan 500 monster', ok: () => totalKills() >= 500, gift: ['gold', 500] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'k500').ok()` tidak error.

### [ ] T201. **Pencapaian baru `lv20` — Pahlawan Muda**
- Dulu cek duplikat: `grep -n "S.lv" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'lv20', n: 'Pahlawan Muda', d: 'Capai level 20', ok: () => S.lv >= 20, gift: ['hipotion', 2] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'lv20').ok()` tidak error.

### [ ] T202. **Pencapaian baru `lv30` — Pahlawan Lumina**
- Dulu cek duplikat: `grep -n "S.lv" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'lv30', n: 'Pahlawan Lumina', d: 'Capai level 30', ok: () => S.lv >= 30, gift: ['gold', 600] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'lv30').ok()` tidak error.

### [ ] T203. **Pencapaian baru `warp5` — Pengelana Cahaya**
- Dulu cek duplikat: `grep -n "Object.keys\\(S.warps || {}\\).length" src/data/quests.js`. Jika sudah ada pencapaian dengan syarat sama/lebih mudah → tandai [x] dengan catatan "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [` (baris ±6). Tambah di AKHIR larik: `{ id: 'warp5', n: 'Pengelana Cahaya', d: 'Aktifkan 5 patung teleport', ok: () => Object.keys(S.warps || {}).length >= 5, gift: ['ether', 3] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'warp5').ok()` tidak error.

### [ ] T204. **Tes penjaga data: npc_barks** (kerjakan SETELAH tugas kategori terkait selesai)
- Buat `tests/data_npc_barks.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap NPC di semua MAPS punya entri NPC_BARKS (berdasarkan id ATAU ch); `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_npc_barks.spec.js` lulus.

### [ ] T205. **Tes penjaga data: items_desc** (kerjakan SETELAH tugas kategori terkait selesai)
- Buat `tests/data_items_desc.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap ITEMS punya `d` minimal 25 karakter; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_items_desc.spec.js` lulus.

### [ ] T206. **Tes penjaga data: bestiary_text** (kerjakan SETELAH tugas kategori terkait selesai)
- Buat `tests/data_bestiary_text.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa setiap kunci ENEMY punya BESTIARY_TEXT[id].hab & .tip; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_bestiary_text.spec.js` lulus.

### [ ] T207. **Tes penjaga data: ach_unique** (kerjakan SETELAH tugas kategori terkait selesai)
- Buat `tests/data_ach_unique.spec.js` meniru pola `tests/boot.spec.js`: `h.boot(page)`, lalu `page.evaluate` yang memeriksa semua ACH punya id unik dan ok() tidak melempar error dengan state game baru; `expect(daftarYangGagal).toEqual([])`.
- Ingat: `ITEMS`, `MAPS`, `ENEMY` adalah const global (tulis `ITEMS`, BUKAN `window.ITEMS`).
- Cek: `npx playwright test tests/data_ach_unique.spec.js` lulus.

### [ ] T208. **Periksa 4 peringatan `check-layout`**
- Jalankan `node tools/check-layout.js` dan lihat 4 peringatan (cari opsi verbose di `tools/check-layout.js` bila ringkas).
- Untuk tiap peringatan: jika objek benar-benar salah tempat menurut `docs/PLACEMENT_RULES.md` → geser koordinatnya di file `src/world/maps/*.js` yang disebut (BUKAN layout.js). Jika memang disengaja → tulis catatan di bawah tugas ini.
- Cek: `npm run check` (0 masalah).
### [ ] T209. **Pencapaian baru `fish100` — Raja Pemancing**
- Dulu cek duplikat: `grep -n "fish100\|S.st.fish" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'fish100', n: 'Raja Pemancing', d: 'Tangkap 100 ikan', ok: () => S.st.fish >= 100, gift: ['gold', 400] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'fish100').ok()` tidak error.

### [ ] T210. **Pencapaian baru `tree100` — Rimbawan**
- Dulu cek duplikat: `grep -n "tree100\|S.st.trees" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'tree100', n: 'Rimbawan', d: 'Tebang 100 pohon', ok: () => S.st.trees >= 100, gift: ['gold', 300] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'tree100').ok()` tidak error.

### [ ] T211. **Pencapaian baru `k1000` — Momok Monster**
- Dulu cek duplikat: `grep -n "k1000\|totalKills()" src/data/quests.js`. Jika syarat sama sudah ada → tandai [x] "duplikat", selesai.
- File: `src/data/quests.js`, larik `const ACH = [`. Tambah di AKHIR larik: `{ id: 'k1000', n: 'Momok Monster', d: 'Kalahkan 1.000 monster', ok: () => totalKills() >= 1000, gift: ['gold', 1000] },`
- Cek: `npm run check`; konsol `ACH.find(a => a.id === 'k1000').ok()` tidak error.

---
Tugas besar (JANGAN diambil agen ini): pola serangan musuh & boss berfase, Botol Cahaya tambahan, pilar build/mantra, markas, sekutu & ikatan,
memasang BESTIARY_TEXT ke layar Bestiari, buang petak objek jauh di mode benua, hapus mode lama. Rincian: `docs/GAME_DESIGN.md` (akhir) & `docs/HANDOFF_OPENWORLD.md`.
