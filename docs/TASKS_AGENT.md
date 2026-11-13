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

### [ ] T212. **[RASA TEMPUR 1] Buat file `src/systems/combat_fx.js` (kerangka)**
- Buat file baru berisi persis kerangka ini, lalu daftarkan di `index.html` tepat SETELAH baris `<script src="src/systems/souls.js"></script>`:
```js
'use strict';
// Rasa tempur ala Dimraeth: bidik bantu, langkah maju saat menebas, busur tebasan, kilat & percikan saat kena, debu berguling.
// HANYA efek & rasa. Angka damage/stamina tetap di combat.js & souls.js (file terkunci, JANGAN diubah).
const CFX = { aim: 64, lunge: 120, lungeT: .07, arcT: 170 };
Object.assign(World.prototype, {
});
{
  const W = World.prototype;
}
```
- Cek: `npm run check`; buka game, serang 3 kali, tidak ada error konsol.

### [ ] T213. **[RASA TEMPUR 2] Tekstur busur tebasan `arcfx`** (butuh RASA TEMPUR 1)
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

### [ ] T214. **[RASA TEMPUR 3] Busur tebasan besar saat menyerang** (butuh RASA TEMPUR 2)
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
    const pl = this.pl; if (!pl || pl.dead || pl.atkCd > 0) return attack0.apply(this, arguments);
    const r = attack0.apply(this, arguments);
    if (!(pl.atkCd > 0)) return r; // serangan batal (mis. lelah)
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
    if (wt !== 'bow') this.slashFx(wt, pl.combo || 1);
    return r;
  };
```
- Cek: serang dengan pedang → busur cahaya besar; pukulan ke-3 lebih besar & layar bergetar sedikit; tombak → garis lurus; busur panah → tanpa busur cahaya.

### [ ] T215. **[RASA TEMPUR 4] Bidik bantu ke musuh terdekat (ramah HP)** (butuh RASA TEMPUR 3)
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
    const e = this.nearFoe(CFX.aim), v = Input.vec(); // hadap musuh terdekat kecuali joystick diarahkan menjauh
    if (e) {
      const ex = e.spr.x - pl.x, ey = e.spr.y - pl.y;
      const face = Math.abs(ex) > Math.abs(ey) ? (ex < 0 ? 'left' : 'right') : (ey < 0 ? 'up' : 'down');
      if (Math.hypot(v.x, v.y) < .3 || ex * v.x + ey * v.y > 0) pl.dir = face;
    }
```
- Cek: berdiri di samping slime sambil menghadap ke arah lain, tekan SERANG tanpa joystick → Arka berbalik & tebasan mengenai slime.

### [ ] T216. **[RASA TEMPUR 5] Langkah maju kecil saat menebas ("komit")** (butuh RASA TEMPUR 3)
- Di pembungkus `W.attack`, ganti baris `if (wt !== 'bow') this.slashFx(wt, pl.combo || 1);` dengan:
```js
    if (wt !== 'bow') {
      this.slashFx(wt, pl.combo || 1);
      if (!pl.dashT || pl.dashT <= 0) { // langkah maju; ghostT ditunda agar tidak muncul bayangan dash
        const [dx, dy] = DIRV[pl.dir]; pl.dashT = CFX.lungeT; pl.dvx = dx * CFX.lunge; pl.dvy = dy * CFX.lunge; this.ghostT = CFX.lungeT + .05;
      }
    }
```
- Latar: `pl.dashT/dvx/dvy` dipakai di `src/scene/world.js` (±baris 228, BACA saja) untuk mendorong Arka; `ghostT` = jeda bayangan dash.
- Cek: menyerang membuat Arka maju ±8 px, TIDAK menembus tembok/pagar, TIDAK ada bayangan biru seperti dash.

### [ ] T217. **[RASA TEMPUR 6] Kilat putih + percikan saat musuh kena** (butuh RASA TEMPUR 2)
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

### [ ] T218. **[RASA TEMPUR 7] Debu saat berguling (dash)** (butuh RASA TEMPUR 1)
- Bayangan dash SUDAH ada di world.js; tugas ini hanya menambah debu di titik awal.
- Tambah metode: `rollFx() { const pl = this.pl; this.sparkle(pl.x, pl.y - 2, 'dot', 5); },`
- Bungkus dash di blok pembungkus:
```js
  const dash0 = W.dash;
  W.dash = function () {
    const pl = this.pl, was = pl && pl.dashT > 0, r = dash0.apply(this, arguments);
    if (pl && !was && pl.dashT > .1) this.rollFx();
    return r;
  };
```
- Cek: tekan DASH → kepulan debu kecil di kaki; dash saat stamina habis (tulisan "Lelah!") → tanpa debu.

### [ ] T219. **[RASA TEMPUR 8] Debu langkah saat lari cepat** (butuh RASA TEMPUR 1)
- Bungkus `updStamina` di blok pembungkus `combat_fx.js` (JANGAN ubah souls.js/qol.js):
```js
  const sta0 = W.updStamina;
  W.updStamina = function (dt, sprint, moving) {
    if (sprint && moving && this.pl) { this.runDustT = (this.runDustT || 0) - dt; if (this.runDustT <= 0) { this.runDustT = .18; this.sparkle(this.pl.x, this.pl.y - 1, 'dot', 2); } }
    return sta0.apply(this, arguments);
  };
```
- Cek: lari cepat → kepulan kecil berkala di kaki; jalan biasa → tidak ada.

### [ ] T220. **[RASA TEMPUR 9] Puff saat musuh mati** (butuh RASA TEMPUR 2)
- `killEnemy(e)` ada di `src/systems/combat.js` baris ±171 (BACA saja). Bungkus di `combat_fx.js`:
```js
  const kill0 = W.killEnemy;
  W.killEnemy = function (e) {
    const s = e && e.spr, x = s && s.x, y = s && s.y; const r = kill0.apply(this, arguments);
    if (s) { const p = this.add.image(x, y - 8, this.arcTex()).setScale(.3).setTint(0xffffff).setAlpha(.8).setDepth(y + 6);
      this.tweens.add({ targets: p, scale: 1, alpha: 0, angle: 180, duration: 260, onComplete: () => p.destroy() }); }
    return r;
  };
```
- Cek: musuh mati → pusaran cahaya singkat di tempatnya; drop item tetap muncul.

### [ ] T221. **[RASA TEMPUR 10] Getar HP saat terkena serangan besar** (butuh RASA TEMPUR 1)
- `hurtPlayer` dipanggil saat Arka kena (cari: `grep -n "  hurtPlayer(" src/systems/*.js`, BACA saja). Bungkus di `combat_fx.js`:
```js
  const hurt0 = W.hurtPlayer;
  W.hurtPlayer = function (dmg) {
    const hp0 = S.hp, r = hurt0.apply(this, arguments);
    if (S.hp < hp0 && hp0 - S.hp >= stat().maxhp * .15 && navigator.vibrate) { try { navigator.vibrate(25); } catch (_) {} }
    return r;
  };
```
- Cek: di HP Android, kena pukulan besar → HP bergetar singkat; di desktop tidak error.

### [ ] T222. **[RASA TEMPUR 11] Tepi layar merah saat HP kritis** (butuh RASA TEMPUR 1)
- Tambah metode `updLowHp(dt)` di `combat_fx.js` yang membuat SATU `this.add.graphics().setScrollFactor(0).setDepth(2.5e5)` (simpan di `this.lowHpG`, buat sekali),
  menggambar 4 persegi merah tipis (lebar 14 px) di tepi layar `VW`×`VH`, `alpha` berdenyut `.25 + .2 * Math.sin(this.t * 6)` bila `S.hp < stat().maxhp * .3`, else `setVisible(false)`.
- Panggil dari pembungkus `update` di blok pembungkus: `const up0 = W.update; W.update = function (t, dl) { up0.call(this, t, dl); if (!this.passive && !G.title && this.pl) this.updLowHp(dl / 1000); };`
- Saat scene restart, objek lama hilang otomatis: cek `this.lowHpG && this.lowHpG.active` sebelum dipakai, buat ulang bila tidak aktif.
- Cek: konsol `S.hp = 5` → tepi merah berdenyut; minum Botol Cahaya → hilang.

### [ ] T223. **[RASA TEMPUR 12] Catat & cek rasa di HP**
- Mainkan 5 menit di HP: hutan (slime, serigala), tebas, berguling, kalah sekali.
- Kalau busur terlalu besar/terang → ubah HANYA angka di `CFX` atau `.75`/`1.35` di `slashFx`. Tulis angka akhir & alasannya sebagai catatan di bawah tugas ini.

### [ ] T224. **[PETA 1] File `src/ui/worldmap.js`: peta seluruh benua (kerangka)**
- Buat file baru, daftarkan di `index.html` SETELAH `<script src="src/systems/souls.js"></script>` (setelah combat_fx.js bila sudah ada).
- Isi: fungsi global `openWorldMap(sc)` yang membuat overlay DOM `div#wmap` (position fixed, inset 0, background `rgba(10,18,14,.94)`, z-index 50) dengan satu `<canvas>` & tombol "Tutup" (`button`, menutup overlay). Kunci input: `G.lock++` saat buka, `G.lock--` saat tutup (dalam `try/finally` pola di `docs/CODE_RULES.md` §4).
- Cek: konsol `openWorldMap(__game.sc)` → overlay muncul, tombol Tutup menutupnya, Arka bisa bergerak lagi.

### [ ] T225. **[PETA 2] Gambar semua wilayah di peta benua** (butuh PETA 1)
- Di `openWorldMap`: wilayah = `buildBenua().regions` (daftar id). Hitung kotak benua dari `WORLD_POS[id]` + `MAPS[id].w/.h`, skala agar muat kanvas (lebar layar − 24 px).
- Untuk tiap wilayah: `const ov = groundOverview(MAPS[id])` (kanvas ¼ ukuran, lihat `grep -n "function groundOverview" src/systems/stream.js`, BACA saja) → `ctx.drawImage(ov, X, Y, W, H)` pada posisi skala.
- Celah antarwilayah: isi kanvas dulu dengan `#244a1c` (hutan lebat).
- Cek: overlay menampilkan bentuk seluruh benua (desa, hutan, padang, rawa, salju, kota) dalam satu gambar.

### [ ] T226. **[PETA 3] Nama wilayah & penanda Arka** (butuh PETA 2)
- Tulis `MAPS[id].name` di tengah tiap wilayah (font 10px `'Press Start 2P', monospace` atau font yang dipakai HUD; warna putih, bayangan hitam). Lewati wilayah peralihan (`MAPS[id].peralihan`) agar tidak ramai.
- Penanda Arka: lingkaran kuning 4 px di posisi pemain: jika `sc.M.benua` → `(sc.pl.x, sc.pl.y)` langsung; jika tidak → `WORLD_POS[sc.M.id] + (sc.pl.x, sc.pl.y)` (lewati jika peta tidak ada di WORLD_POS / interior).
- Cek: titik kuning berada di wilayah yang benar di desa dan di Puncak Beku (`__game.sc.goto('snow', 640, 600, 'down')`).

### [ ] T227. **[PETA 4] Wilayah yang belum dikunjungi digelapkan** (butuh PETA 3)
- Untuk wilayah dengan `!S.seen[id]`: setelah menggambar, tutup kotaknya dengan `rgba(0,0,0,.7)` dan ganti nama dengan `???`.
- Cek: permainan baru → hanya Desa Lumina (dan yang sudah dimasuki) terang.

### [ ] T228. **[PETA 5] Bintang tujuan misi di peta benua** (butuh PETA 3)
- Ambil tujuan dengan `questTarget(sc.M)` (global, `src/ui/map.js`, BACA saja). Hasil `{x, y}` dalam koordinat scene: jika `sc.M.benua` sudah global; jika tidak, tambah `WORLD_POS[sc.M.id]`.
- Gambar bintang/segitiga kuning 6 px berkedip (gambar ulang tiap 400 ms dengan `setInterval`, HAPUS interval saat overlay ditutup).
- Cek: misi aktif → bintang tampil; tutup peta → tidak ada interval yang tertinggal (konsol tidak error).

### [ ] T229. **[PETA 6] Tombol "Benua" di peta biasa** (butuh PETA 1)
- `openMapNew` ada di `src/systems/explore.js` (TERKUNCI, jangan diubah). Di `worldmap.js` bungkus global setelah file itu dimuat:
```js
{ const om0 = openMapNew;
  openMapNew = function (sc) { // eslint-disable-line no-global-assign
    const r = om0.apply(this, arguments), w = document.getElementById('mapw');
    if (w && !w.querySelector('.btnBenua')) { const b = document.createElement('button'); b.className = 'btnBenua'; b.textContent = 'Peta Benua';
      b.onclick = () => openWorldMap(sc); w.appendChild(b); }
    return r;
  }; }
```
- Gaya tombol: tambahkan aturan `.btnBenua` di `styles.css` meniru tombol lain di peta (cari kelas tombol di `#mapw`).
- Cek: buka PETA → ada tombol "Peta Benua" → membuka peta seluruh benua; menutupnya kembali ke peta biasa.

---
Tugas besar (JANGAN diambil agen ini): pola serangan musuh & boss berfase, Botol Cahaya tambahan, pilar build/mantra, markas, sekutu & ikatan,
memasang BESTIARY_TEXT ke layar Bestiari, buang petak objek jauh di mode benua, hapus mode lama. Rincian: `docs/GAME_DESIGN.md` (akhir) & `docs/HANDOFF_OPENWORLD.md`.
