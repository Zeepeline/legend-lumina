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

### [x] T212. **[RASA TEMPUR 1] Buat file `src/systems/combat_fx.js` (kerangka)**
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
    const pl = this.pl; if (!pl || pl.dead || pl.atkCd > 0) return attack0.apply(this, arguments);
    const r = attack0.apply(this, arguments);
    if (!(pl.atkCd > 0)) return r; // serangan batal (mis. lelah)
    const wt = (ITEMS[S.eq.wpn] || {}).wt || 'sword';
    if (wt !== 'bow') this.slashFx(wt, pl.combo || 1);
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
    const e = this.nearFoe(CFX.aim), v = Input.vec(); // hadap musuh terdekat kecuali joystick diarahkan menjauh
    if (e) {
      const ex = e.spr.x - pl.x, ey = e.spr.y - pl.y;
      const face = Math.abs(ex) > Math.abs(ey) ? (ex < 0 ? 'left' : 'right') : (ey < 0 ? 'up' : 'down');
      if (Math.hypot(v.x, v.y) < .3 || ex * v.x + ey * v.y > 0) pl.dir = face;
    }
```
- Cek: berdiri di samping slime sambil menghadap ke arah lain, tekan SERANG tanpa joystick → Arka berbalik & tebasan mengenai slime.

### [x] T216. **[RASA TEMPUR 5] Langkah maju kecil saat menebas ("komit")** (butuh RASA TEMPUR 3)
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
    const pl = this.pl, was = pl && pl.dashT > 0, r = dash0.apply(this, arguments);
    if (pl && !was && pl.dashT > .1) this.rollFx();
    return r;
  };
```
- Cek: tekan DASH → kepulan debu kecil di kaki; dash saat stamina habis (tulisan "Lelah!") → tanpa debu.

### [x] T219. **[RASA TEMPUR 8] Debu langkah saat lari cepat** (butuh RASA TEMPUR 1)
- Bungkus `updStamina` di blok pembungkus `combat_fx.js` (JANGAN ubah souls.js/qol.js):
```js
  const sta0 = W.updStamina;
  W.updStamina = function (dt, sprint, moving) {
    if (sprint && moving && this.pl) { this.runDustT = (this.runDustT || 0) - dt; if (this.runDustT <= 0) { this.runDustT = .18; this.sparkle(this.pl.x, this.pl.y - 1, 'dot', 2); } }
    return sta0.apply(this, arguments);
  };
```
- Cek: lari cepat → kepulan kecil berkala di kaki; jalan biasa → tidak ada.

### [x] T220. **[RASA TEMPUR 9] Puff saat musuh mati** (butuh RASA TEMPUR 2)
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

### [x] T221. **[RASA TEMPUR 10] Getar HP saat terkena serangan besar** (butuh RASA TEMPUR 1)
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

## E. GELOMBANG 4 — kinerja (T230–T235)
File BARU milik agen: `src/systems/benua_unload.js`. Web Worker tanah & atlas tekstur TIDAK untuk agen ini (cukup diukur di KINERJA 5–6).

### [ ] T230. **[KINERJA 1] File `src/systems/benua_unload.js`: catat objek per petak**
- Latar (BACA saja, jangan ubah): mode benua memuat objek per petak 512 px lewat `streamObjs` di `src/systems/benua_scene.js`; tiap objek dibuat `this.spawnObj(o)` dengan `o = [tipe, x, y, opt]` (koordinat global). Objek tidak pernah dibuang → memori naik.
- Buat file baru, daftarkan di `index.html` tepat SETELAH `<script src="src/systems/benua_scene.js"></script>`:
```js
'use strict';
// Mode benua: buang petak objek yang jauh dari Arka (memori). Mencatat semua yang dibuat spawnObj per petak lalu menghancurkannya.
const UNLOAD_FAR = 1700, UNLOAD_EVERY = 1.5; // px dari Arka; detik antar-pemeriksaan
{
  const W = World.prototype, spawn0 = W.spawnObj;
  W.spawnObj = function (o) {
    if (!this.M || !this.M.benua || !Array.isArray(o)) return spawn0.apply(this, arguments);
    const ch = this.children.list.length, wl = this.walls.getChildren().length, it = this.inter.length, li = this.lights.length, fa = this.fades.length;
    const r = spawn0.apply(this, arguments);
    const k = Math.floor(o[1] / OBJ_CELL) + ',' + Math.floor(o[2] / OBJ_CELL), rec = (this.cellRec = this.cellRec || new Map());
    if (!rec.has(k)) rec.set(k, { objs: [], walls: [], inter: [], lights: [], fades: [] });
    const R = rec.get(k);
    R.objs.push(...this.children.list.slice(ch)); R.walls.push(...this.walls.getChildren().slice(wl));
    R.inter.push(...this.inter.slice(it)); R.lights.push(...this.lights.slice(li)); R.fades.push(...this.fades.slice(fa));
    return r;
  };
}
```
- Cek: `?benua=1`, konsol `__game.sc.cellRec.size > 0` dan `[...__game.sc.cellRec.values()][0].objs.length > 0`.

### [ ] T231. **[KINERJA 2] Buang petak yang jauh** (butuh KINERJA 1)
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
- Cek: konsol catat `__game.sc.children.list.length`, teleport jauh (`__game.sc.goto('snow', 640, 600, 'down')`), tunggu 3 detik → jumlah turun; kembali ke desa (`goto('village', 512, 384, 'down')`) → pohon & rumah desa muncul lagi, tidak bisa menembus pagar.

### [ ] T232. **[KINERJA 3] Pastikan petak yang dimuat ulang tidak dobel** (butuh KINERJA 2)
- Uji: jalan bolak-balik desa ↔ Jalan Desa–Padang 3 kali (atau teleport desa ↔ snow 3 kali).
- Konsol setelah tiap putaran: `__game.sc.children.list.length` (harus stabil, tidak terus naik) dan `__game.sc.inter.length` (stabil).
- Jika naik terus: periksa bahwa `this.objCells.delete(k)` dan `this.cellRec.delete(k)` terjadi; tulis angka sebelum/sesudah sebagai catatan di bawah tugas ini.

### [ ] T233. **[KINERJA 4] Jangan buang petak yang sedang dipakai cerita/interaksi** (butuh KINERJA 2)
- Risiko: objek interaktif (peti, lentera, obor) di petak yang dibuang lalu dimuat ulang → status harus tetap benar (mis. peti yang sudah dibuka tidak muncul tertutup).
- Uji: buka peti di desa (`grep -n "chests" src/world/maps/village.js` untuk posisinya), teleport jauh, tunggu 3 detik, kembali → peti tetap terbuka.
- Jika ternyata kembali tertutup: tambahkan pengecualian di `unloadFar`: lewati petak yang `R.objs` berisi objek dengan `o.texture && /chest/.test(o.texture.key)`. Catat hasilnya.

### [ ] T234. **[KINERJA 5] Ukur (TANPA mengubah kode game): jumlah tekstur & objek**
- Buka game `?benua=1`, di konsol jalankan dan catat hasilnya sebagai catatan di bawah tugas ini:
  `Object.keys(__game.sc.textures.list).length` (jumlah tekstur), `__game.sc.children.list.length` (objek tampilan), `__game.sc.cullL.length`, `__game.sc.enemies.length`, `__game.sc.npcs.length`.
- Ulangi di 3 tempat: desa, hutan (`goto('forest', 640, 400, 'down')`), kota (`goto('kpasar', 600, 400, 'down')`).
- Hasil ini dipakai sesi besar untuk memutuskan atlas tekstur. JANGAN mengubah file apa pun selain menulis catatan di sini.

### [ ] T235. **[KINERJA 6] Ukur waktu frame di HP (TANPA mengubah kode game)**
- Jalankan `PERF=1 npx playwright test tests/perf.spec.js` (CPU diperlambat 4×), lalu salin isi `test-results/perf.json` (rata-rata & frame terburuk) sebagai catatan di bawah tugas ini.
- Jika ada ponsel: buka game, Chrome remote debugging → Performance, rekam 10 detik berjalan di desa; catat 3 fungsi JS teratas (Bottom-Up). Tidak perlu memperbaiki apa pun.

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

### [ ] T247. **Layar judul: info tiap slot simpan**
- File: `src/ui/title.js`. Baca dulu: `titleScreen()`.
- Lakukan: di daftar slot tampilkan: level, nama wilayah (`MAPS[s.map].name`), waktu main (jam:menit dari `s.st.playTime`). Baca data slot dari fungsi yang sudah dipakai layar judul.
- Batasan: jangan ubah format save.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; slot berisi save → terlihat "Lv 6 · Desa Lumina · 1j 12m".

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

### [ ] T265. **Pencapaian: kabar progres 50% & 90%**
- File: `src/systems/achievements.js`. Baca dulu: `achCheck()` (±4–11) & `ACH` di `src/data/quests.js` (BACA saja).
- Lakukan: untuk pencapaian yang syaratnya counter `S.st.x >= N`, tampilkan toast kecil satu kali saat progres melewati 50% dan 90%. Catat yang sudah diumumkan di `localStorage.lumina_achprog` (JSON).
- Batasan: jangan menambah field ke S.
- Jika ternyata SUDAH ada → tandai [x] dengan catatan "sudah ada", selesai.
- Cek: `npm run check`; konsol `S.st.fish = 26; achCheck()` → toast "Kail Emas 50%" sekali.

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

### [ ] T273. **Ketahanan (poise) musuh besar** — referensi: Dark Souls, Elden Ring
- File: `src/systems/combat.js`. Baca dulu: `hitEnemy()` (±144–175), bagian knockback/sentak.
- Lakukan: musuh dengan `e.D.r >= 12` atau elite punya `e.poise` (awal = 3 untuk besar, 5 untuk elite/boss). Tiap pukulan mengurangi 1; selama poise > 0 musuh TIDAK tersentak/terdorong. Saat 0 → terhuyung 0,8 s (berhenti, berkedip), damage +25% selama terhuyung, lalu poise penuh lagi.
- Batasan: slime & musuh kecil tetap tersentak tiap pukulan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; golem: 3 pukulan tidak tersentak, pukulan ke-3 membuatnya terhuyung.

### [ ] T274. **Dorongan sesuai berat musuh & senjata** — referensi: Zelda: A Link to the Past, Hyper Light Drifter
- File: `src/systems/combat.js`. Baca dulu: `hitEnemy()` bagian dorongan (knockback).
- Lakukan: skala dorongan = dasar × (kapak 1,4 / pedang 1 / tombak 1,15) ÷ (1 + (e.D.r − 8) / 10), minimal 0,3×. Pukulan ke-3 kombo ×1,3.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; slime terlempar jauh, golem hampir tidak bergeser; kapak lebih kuat dari pedang.

### [ ] T275. **Hitstop bertingkat** — referensi: Hades, Monster Hunter
- File: `src/systems/combat.js`. Baca dulu: `hitStop()` (±139) & pemanggilnya di `hitEnemy`/`killEnemy`.
- Lakukan: durasi: pukulan biasa 35 ms, akhir kombo 60 ms, kritikal 80 ms, membunuh 90 ms. Jangan menumpuk: jika hitstop masih berjalan, ambil yang terbesar.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; rasakan: kill & kritikal terasa 'berat', pukulan biasa tetap lincah.

### [ ] T276. **Satu ayunan = satu kena per musuh** — referensi: Hollow Knight
- File: `src/systems/combat.js`. Baca dulu: `attack()` (±12–88) bagian deteksi kena.
- Lakukan: beri tiap ayunan id (`this.swingId++`); simpan `e.lastSwing`; jika sama, lewati. Cegah satu tebasan mengenai musuh yang sama dua kali.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tebas slime di tepi jangkauan berulang kali → tiap ayunan maks 1 angka damage per musuh.

### [ ] T277. **Musuh kembali ke posisi asal (leash)** — referensi: World of Warcraft, Dark Souls
- File: `src/ai/enemies.js`. Baca dulu: awal `updEnemy()` & tempat posisi awal musuh disimpan (grep `home` atau `hx`).
- Lakukan: jika musuh mengejar > 280 px dari posisi asalnya atau pemain > 320 px darinya, musuh berhenti mengejar, berjalan pulang, dan memulihkan HP ke penuh dalam 2 s setelah tiba. Selama pulang ia tidak menyerang.
- Batasan: boss tidak terpengaruh.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pancing serigala jauh lalu lari → serigala pulang, HP pulih.

### [ ] T278. **Aggro berkelompok** — referensi: Diablo (pack)
- File: `src/ai/enemies.js`. Baca dulu: bagian saat musuh mulai mengejar (status aggro; grep `aggro`).
- Lakukan: saat satu musuh mulai mengejar, musuh sejenis dalam 90 px yang masih diam ikut mengejar setelah jeda 0,3 s (sekali saja).
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pukul satu slime dalam kelompok → teman dekatnya ikut bergerak setelah sejenak.

### [ ] T279. **Binatang kabur saat sekarat** — referensi: Monster Hunter, Far Cry
- File: `src/ai/enemies.js`. Baca dulu: cabang AI serigala/babi hutan (`'lunge'`/`'charge'`; cek `ENEMY.wolf.ai`, `ENEMY.boar.ai`).
- Lakukan: pertama kali HP < 20%: 40% peluang kabur menjauh 1,5 s (lebih cepat 20%), lalu kembali menyerang. Tampilkan pop kecil "!?".
- Batasan: hanya serigala & babi hutan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan serigala sampai sekarat → kadang kabur sebentar.

### [ ] T280. **Penembak menjaga jarak & bergeser** — referensi: Diablo (pemanah), Enter the Gungeon
- File: `src/ai/enemies.js`. Baca dulu: cabang `'shoot'` dan `'turret'`.
- Lakukan: `'shoot'`: jika pemain < 70 px → mundur; di antara tembakan bergeser menyamping 0,6 s (arah acak). `'turret'` tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan goblin pemanah → ia mundur saat didekati & tidak berdiri diam.

### [ ] T281. **Proyektil musuh mudah dibaca** — referensi: Enter the Gungeon, Hades
- File: `src/systems/combat.js`. Baca dulu: `eShoot()` (±302) & `updShots()` (±317).
- Lakukan: proyektil musuh diberi lingkar terang tipis (blend ADD, warna sesuai jenis) + bayangan kecil di tanah; 0,1 s pertama bergerak 50% lebih lambat agar terlihat keluar.
- Batasan: kecepatan setelah 0,1 s tetap.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; panah/bola sihir musuh terlihat jelas di rumput & malam hari.

### [ ] T282. **Tangkis (parry) terasa memuaskan** — referensi: Sekiro, Hollow Knight
- File: `src/systems/polish.js`. Baca dulu: `PARRY_WIN` (±27) & pembungkus `_hurtPlayer` (±30) tempat tangkis berhasil.
- Lakukan: saat tangkis berhasil: lingkar cahaya putih membesar dari Arka, suara `sfx('parry')` atau yang ada, perlambatan waktu 0,15 s (`this.time.timeScale` & `physics.world.timeScale`, kembalikan setelahnya), musuh penyerang terhuyung 0,6 s.
- Batasan: jangan ubah jendela waktu tangkis.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tangkis serangan serigala → jelas terasa & serigala terhuyung.

### [ ] T283. **Serangan dari belakang terlihat** — referensi: Dark Souls (backstab), Dishonored
- File: `src/systems/combat.js`. Baca dulu: tempat `S.st.backstabs` bertambah (grep `backstabs`).
- Lakukan: tampilkan pop "DARI BELAKANG!" (ungu) + hitstop 70 ms + getar kamera kecil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; serang musuh dari belakang → teks muncul.

### [ ] T284. **Penyangga input serangan (buffer)** — referensi: Hades, Devil May Cry
- File: `src/systems/combat.js`. Baca dulu: awal `attack()` (cek `atkCd`).
- Lakukan: jika serangan ditekan saat `pl.atkCd` tinggal ≤ 0,15 s, jangan diabaikan: simpan `this.atkBuf = true` lalu panggil `attack()` lagi via `this.time.delayedCall(pl.atkCd * 1000 + 5, …)` (sekali, tanpa menumpuk).
- Batasan: jangan mengubah lama cooldown.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; tekan SERANG cepat berirama → kombo 3 pukulan tidak 'tertelan'.

### [ ] T285. **Menghindar tepat waktu (perfect dodge)** — referensi: Bayonetta, Monster Hunter
- File: `src/systems/combat.js`. Baca dulu: `hurtPlayer()` (±292) bagian saat pemain kebal (`inv`).
- Lakukan: jika serangan mengenai saat Arka kebal KARENA dash (≤ 0,2 s setelah dash dimulai): pop "Lolos!", perlambatan 0,12 s, dan +10 stamina. Maks sekali per dash.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; dash tepat saat serigala menerjang → "Lolos!".

### [ ] T286. **Bola EXP terbang ke Arka** — referensi: Diablo, Hades
- File: `src/systems/combat.js`. Baca dulu: `killEnemy()` (±176) & `gainExp()` (±280).
- Lakukan: saat musuh mati, munculkan 3–6 titik cahaya kecil di posisinya yang melesat ke Arka (tween 0,35–0,5 s, kurva). EXP tetap ditambahkan seperti sekarang (boleh saat titik pertama tiba).
- Batasan: jumlah EXP tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh slime → titik cahaya terbang ke Arka.

### [ ] T287. **Cahaya tegak untuk barang langka** — referensi: Diablo, Borderlands
- File: `src/systems/combat.js`. Baca dulu: `drop()` (±252) (+ `rarity()` di polish.js, BACA saja).
- Lakukan: barang dengan kelangkaan di atas biasa: berkas cahaya vertikal tipis (warna sesuai kelangkaan) di atasnya + suara kecil saat jatuh; hilang saat diambil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; konsol buat drop item langka → ada berkas cahaya.

### [ ] T288. **Koin & bahan biasa tertarik ke Arka** — referensi: Hades, Diablo
- File: `src/systems/combat.js`. Baca dulu: `updPicks()` (±258–279).
- Lakukan: koin & bahan biasa dalam 52 px bergerak ke arah Arka (makin dekat makin cepat) lalu diambil seperti biasa. Barang langka tetap harus didatangi.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh musuh → koin meluncur ke Arka.

### [ ] T289. **Sifat elite (affix)** — referensi: Diablo III
- File: `src/systems/feel.js` + `src/systems/combat.js`. Baca dulu: `makeElite()` (feel.js ±18–29), `killEnemy()`.
- Lakukan: elite mendapat 1 sifat acak: "Cepat" (kecepatan +30%), "Keras" (DEF +50%), "Membara" (pukulannya membakar: `inflict` status bakar), "Beranak" (saat mati memunculkan 2 slime kecil). Nama sifat tampil di bawah nama elite.
- Batasan: sifat Beranak hanya untuk elite non-boss.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; temui elite → sifatnya terlihat & berlaku.

### [ ] T290. **Musuh baru tidak muncul di depan mata** — referensi: Dark Souls, Diablo
- File: `src/ai/enemies.js` atau tempat respawn musuh (grep `respawn`). Baca dulu: kode respawn musuh.
- Lakukan: saat musuh muncul kembali, lewati/ tunda jika posisinya di dalam layar kamera atau < 140 px dari Arka.
- Batasan: jika tidak ada sistem respawn → tandai catatan.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; bunuh slime lalu tunggu di dekatnya → ia tidak muncul tepat di depanmu.

### [ ] T291. **Kartu perkenalan boss** — referensi: Hades, Hollow Knight
- File: `src/ai/bosses.js`. Baca dulu: `startBoss()` (±78–91).
- Lakukan: saat boss mulai: nama besar + gelar kecil (dari data boss bila ada) di tengah layar 1,6 s, kamera sedikit memperbesar (zoom 1,08) lalu kembali, input pemain dikunci 0,8 s (`G.lock++/--` dalam finally).
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; masuk arena boss → kartu nama tampil, permainan lanjut normal.

### [ ] T292. **Fase kedua boss di 50% HP** — referensi: Dark Souls, Elden Ring
- File: `src/ai/bosses.js` + `src/systems/combat.js`. Baca dulu: `updBoss()` & `hitEnemy()`.
- Lakukan: saat HP boss pertama kali < 50%: kebal 1 s, kilat & gelombang kejut visual (tanpa damage), banner kecil "BANGKIT!", lalu kecepatan & laju serangan +20% (`e.phase2 = true`, dipakai di AI boss).
- Batasan: HP & damage boss tidak berubah.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; lawan boss ratu jamur → di 50% terjadi transisi, setelahnya lebih agresif.

### [ ] T293. **Tanda kelemahan elemen** — referensi: Pokémon, Final Fantasy
- File: `src/systems/polish.js`. Baca dulu: `ELEM`, `WEAK`, pembungkus `_hitEnemy` (±8–18).
- Lakukan: saat serangan mengenai kelemahan musuh: pop "LEMAH!" (warna `ELEM_COL`) di atas angka damage; jika musuh tahan: "TAHAN" abu-abu.
- Batasan: jangan ubah pengali damage.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pakai senjata api ke slime es → "LEMAH!".

### [ ] T294. **Mode Santai: ancang-ancang lebih lama** — referensi: Celeste (assist mode), Hades (God mode)
- File: `src/ai/enemies.js`. Baca dulu: tempat durasi ancang-ancang musuh (hasil tugas "Ancang-ancang konsisten").
- Lakukan: jika `OPT.diff === 0`, kalikan durasi ancang-ancang ×1,3 dan jeda antar serangan ×1,2.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; pengaturan Santai → musuh lebih mudah dibaca.

### [ ] T295. **Musuh terakhir: gerak lambat singkat** — referensi: God of War, Hades (room clear)
- File: `src/systems/combat.js`. Baca dulu: `killEnemy()`.
- Lakukan: jika setelah membunuh tidak ada lagi musuh yang sedang mengejar dalam 220 px dan sebelumnya ≥ 3 musuh bertarung, lakukan perlambatan 0,25 s + suara kecil.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; kalahkan kelompok 3 slime → yang terakhir memberi momen lambat singkat.

### [ ] T296. **Audit kepadatan kawanan musuh** — referensi: Diablo, Zelda (penempatan musuh)
- File: `src/world/maps/*.js` (larik `enemies`). Baca dulu: daftar `enemies` tiap peta luar ruang.
- Lakukan: hitung dengan skrip kecil (di `/tmp`, bukan di repo) kelompok musuh dalam radius 150 px. Jika > 5 musuh dalam satu kelompok atau musuh berada < 120 px dari pintu masuk/teleport, geser beberapa ke ruang terbuka terdekat. Catat perubahan di bawah tugas ini.
- Batasan: jangan menambah/menghapus musuh, hanya menggeser.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; `npm run check` 0 masalah; berjalan di hutan tidak 'dikeroyok' tepat di pintu masuk.

### [ ] T297. **Musik tempur selesai dengan halus** — referensi: Hades, Ori
- File: `src/systems/sound.js`. Baca dulu: `swapBGM()` (±43) & logika masuk/keluar tempur (grep `combat` di sound.js).
- Lakukan: keluar dari musik tempur hanya setelah 4 s tanpa musuh yang mengejar, dengan fade 1 s; jangan bolak-balik bila musuh baru mengejar dalam 2 s.
- Jika SUDAH ada → tandai [x] "sudah ada". Angka keseimbangan (hp/atk/exp di `ENEMY`) JANGAN diubah kecuali tugas memintanya.
- Cek: `npm run check`; kalahkan musuh lalu diam → musik kembali halus, tidak berkedip-kedip.

## H. GELOMBANG 7 — AI lebih pintar & tangguh, efek visual, UI ala Dimraeth (T298–T331)
Urutan: kerjakan gelombang 3 & 6 dulu (beberapa tugas di sini memakainya). File BARU milik agen: `src/systems/spell_fx.js`, `src/ui/spellbar.js`. Boleh mengubah file yang disebut tiap tugas. Kinerja HP: efek dibuat seperlunya & dihancurkan; uji di `?benua=1`.

### [ ] T298. **Peran dalam kelompok: depan, belakang, pengapit** — referensi: Ghost of Tsushima, God of War (Dimraeth memakai sistem token terinspirasi keduanya)
- File: `src/ai/enemies.js`. Baca dulu: `updEnemy()` (cabang AI yang disebut) + hasil tugas token serangan (gelombang 6).
- Lakukan: saat ≥3 musuh mengejar Arka: musuh jarak dekat terdekat = 'depan' (mendekat), penembak/dukun = 'belakang' (jaga jarak 90–130 px), sisanya = 'pengapit' (bergerak ke sisi/belakang Arka sebelum meminta token). Simpan `e.role`, hitung ulang tiap 1 s.
- Batasan: boss tidak ikut.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lawan perkemahan goblin → pemanah di belakang, ada yang memutar ke belakang Arka.

### [ ] T299. **Menghindar saat Arka mengayun** — referensi: Dark Souls (musuh membaca input), Sekiro
- File: `src/ai/enemies.js` (+ `DODGERS` di `src/systems/feel.js`, BACA). Baca dulu: `updFeel()`/`DODGERS` dan cabang `'walk'`/`'lunge'`.
- Lakukan: musuh pintar (goblin, serigala elit, Taring Perak) punya peluang 25% melangkah menyamping/mundur 20 px saat Arka mulai menyerang di depannya dalam 40 px; jeda minimal 2 s per musuh.
- Batasan: slime & musuh kecil tidak menghindar.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; serang goblin berulang dari depan → kadang ia mengelak.

### [ ] T300. **Musuh bertameng menangkis dari depan** — referensi: Dark Souls (tameng), Zelda (Darknut)
- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `hitEnemy()` & data goblin di `src/data/enemies.js` (BACA).
- Lakukan: goblin & kepala goblin: pukulan dari arah depannya (sudut < 70° dari arah hadap) dikurangi 70% dan muncul percikan + teks "Tertahan"; pukulan samping/belakang, akhir kombo, atau kapak menembus. Arah hadap = arah gerak terakhir musuh.
- Batasan: tidak berlaku bila goblin sedang terhuyung.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pukul goblin dari depan → damage kecil; dari samping → normal.

### [ ] T301. **Ancang-ancang tipuan (tempo bervariasi)** — referensi: Elden Ring (delayed attacks)
- File: `src/ai/enemies.js`. Baca dulu: durasi ancang-ancang di cabang `'lunge'`/`'charge'`/`'elite_brute'`.
- Lakukan: musuh elite & boss mengacak durasi ancang-ancang antara 0,35–0,75 s (musuh biasa tetap tetap), jadi pemain harus membaca, bukan menghafal ritme.
- Batasan: mode Santai: maks 0,6 s & tetap ada tanda "!".
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lawan elite → waktunya tidak selalu sama.

### [ ] T302. **Serangan berantai (kombo musuh)** — referensi: Monster Hunter, Hollow Knight
- File: `src/ai/enemies.js`. Baca dulu: cabang `'lunge'` (serigala) & `'elite_brute'` (kepala goblin).
- Lakukan: serigala: setelah terjangan pertama, 40% peluang terjangan kedua 0,25 s kemudian. Kepala goblin: rangkaian 3 ayunan dengan jeda 0,3 s, ayunan ke-3 lebih lebar. Setelah kombo selesai musuh lelah 0,8 s (jendela balas).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; serigala kadang menerjang dua kali; setelahnya diam sebentar.

### [ ] T303. **Penembak butuh garis pandang** — referensi: Diablo, XCOM (line of sight)
- File: `src/ai/enemies.js`. Baca dulu: cabang `'shoot'` & `'turret'`.
- Lakukan: sebelum menembak, cek garis lurus ke Arka tidak memotong tembok (`this.walls`, cek titik tiap 12 px dengan `Phaser.Geom.Rectangle.Contains`). Jika terhalang, bergeser ke samping 30 px lalu coba lagi.
- Batasan: maks 1 cek per 0,3 s per musuh (kinerja).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; berdiri di balik pohon besar → pemanah tidak menembak menembus, ia berpindah.

### [ ] T304. **Dukun memprioritaskan menyembuhkan teman** — referensi: Dimraeth (bobot pilihan sihir), Diablo (Shaman)
- File: `src/ai/enemies.js`. Baca dulu: cabang `'shaman'`.
- Lakukan: jika ada teman dalam 140 px dengan HP < 60%, dukun menyembuhkan yang paling terluka (+20% HP maks, efek cahaya hijau) dengan jeda 4 s; selain itu menyerang seperti biasa. Tampilkan garis cahaya dukun→teman 0,3 s.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lukai goblin di dekat dukun → dukun menyembuhkannya; jadi target utama yang masuk akal.

### [ ] T305. **Musuh makin agresif saat Arka sekarat** — referensi: Bloodborne (tekanan)
- File: `src/ai/enemies.js`. Baca dulu: bagian jeda antar serangan di updEnemy.
- Lakukan: jika HP Arka < 30%, jeda antar serangan musuh dalam 120 px −20% (tidak berlaku mode Santai).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; konsol `S.hp = 10` → musuh menekan lebih cepat.

### [ ] T306. **Penembak membidik ke depan (prediksi)** — referensi: Enter the Gungeon, Hades
- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `eShoot()` & cabang `'shoot'`.
- Lakukan: pada kesulitan Normal ke atas, 50% tembakan diarahkan ke posisi Arka 0,35 s ke depan (posisi + kecepatan × 0,35). Santai: selalu ke posisi sekarang.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; berlari lurus di depan pemanah → sebagian panah mengenai jalur larimu.

### [ ] T307. **Musuh lebih tangguh sesuai wilayah & level** — referensi: Dark Souls (tingkat area), Diablo (level monster)
- File: `src/ai/enemies.js` atau `src/scene/world.js` `spawnEnemy` (pilih SATU, catat). Baca dulu: tempat HP/ATK musuh dibuat saat spawn (grep `spawnEnemy(`).
- Lakukan: saat spawn: pengali `k = 1 + 0,06 × max(0, S.lv − levelWilayah)` (maks 1,4) untuk HP & DEF, dengan `levelWilayah` = konstanta per id wilayah (desa 1, hutan 3, padang 5, sungai 6, rawa 8, salju 10, kota 12; tulis tabelnya di file yang sama). Elite ×1,25 tambahan.
- Batasan: jangan ubah tabel `ENEMY`; EXP tidak ikut naik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pemain level 15 di hutan → slime perlu lebih banyak pukulan dari sebelumnya.

### [ ] T308. **Pilihan kesulitan 'Sulit'** — referensi: Hades (Heat), Dark Souls
- File: file yang menyimpan `OPT.diff` & menu pengaturan (grep `OPT.diff`). Baca dulu: pilihan kesulitan yang ada.
- Lakukan: tambahkan nilai `OPT.diff = 2` ("Sulit"): musuh HP ×1,3, ATK ×1,2, jeda serangan −15%, Botol Cahaya maks −1. Terapkan di titik yang sama dengan tugas sebelumnya.
- Batasan: nilai bawaan tetap Normal.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pilih Sulit di Pengaturan → pertarungan terasa lebih berat.

### [ ] T309. **Sinergi status: beku + pukulan berat = pecah** — referensi: Dimraeth (contoh: beku lalu lembing es), Divinity
- File: `src/systems/status.js` + `src/systems/combat.js`. Baca dulu: `freezeEnemy()`, `burnEnemy()`, `hitEnemy()`.
- Lakukan: musuh beku yang terkena akhir kombo atau kapak: damage +50%, efek pecahan es, status beku hilang. Musuh terbakar yang terkena Kabut Racun: ledakan kecil 1× (damage 30% ATK sihir).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; Nova Es lalu tebas akhir kombo → angka besar + pecahan es.

### [ ] T310. **Elite mengamuk saat temannya tumbang** — referensi: Diablo (Frenzy), Monster Hunter (enrage)
- File: `src/ai/enemies.js` + `src/systems/combat.js`. Baca dulu: `killEnemy()`.
- Lakukan: saat musuh mati, elite dalam 150 px menjadi 'mengamuk' 6 s: tint merah berdenyut, kecepatan +25%, jeda serangan −20%.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; bunuh slime di dekat elite → elite memerah & mengganas.

### [ ] T311. **Penyergapan dari semak** — referensi: Zelda (Deku Scrub), Monster Hunter
- File: `src/ai/enemies.js`. Baca dulu: cabang `'walk'` & tempat musuh diam/patroli.
- Lakukan: musuh dengan flag `opt.ambush` (tambahkan pada 3–5 musuh di peta hutan & rawa di `src/world/maps/*.js`) tersembunyi (alpha 0,15, tidak bergerak) sampai Arka < 60 px, lalu melompat keluar dengan tanda "!" dan debu.
- Batasan: jangan menempatkan penyergap < 150 px dari pintu masuk/teleport.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; lewati semak di hutan → goblin tiba-tiba melompat keluar.

### [ ] T312. **Tebasan dengan jejak bertumpuk** — referensi: Hades, Dead Cells
- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()` (hasil gelombang 3).
- Lakukan: tambahkan 2 salinan busur yang mengekor (delay 25 & 50 ms, alpha 0,5 & 0,25, rotasi sedikit tertinggal) + 3 percikan kecil di ujung busur.
- Batasan: maks 4 objek efek per tebasan (kinerja HP).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; tebas → busur terlihat seperti sapuan bergerak, bukan sekali kedip.

### [ ] T313. **Efek khas per senjata** — referensi: Hades (tiap senjata punya bahasa visual sendiri)
- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()`.
- Lakukan: tombak: garis tusuk + cincin debu di ujung; kapak: akhir kombo membuat retakan tanah (garis cokelat bercabang, pudar 0,6 s); busur: panah meninggalkan jejak tipis & percikan saat kena (bungkus `shootArrow`).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; coba ketiga senjata → masing-masing berbeda.

### [ ] T314. **Kilat akhir kombo** — referensi: Devil May Cry, Hollow Knight
- File: `src/systems/combat_fx.js`. Baca dulu: `slashFx()` bagian `fin`.
- Lakukan: pada pukulan ke-3: kilat putih layar 1 frame (persegi `setScrollFactor(0)` alpha .25 → 0 dalam 80 ms) + 6 garis radial pendek dari titik kena.
- Batasan: matikan kilat bila `OPT.lite` (hemat baterai) aktif.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; kombo 3 → kilat singkat terasa tegas.

### [ ] T315. **Tangkis: dentang, percikan, layar membeku** — referensi: Sekiro, Hollow Knight
- File: `src/systems/combat_fx.js` (bungkus fungsi tangkis di polish.js, JANGAN ubah polish.js). Baca dulu: pembungkus `_hurtPlayer` & `PARRY_WIN` di polish.js (BACA).
- Lakukan: saat tangkis berhasil: cincin putih→emas membesar, 10 percikan kuning menyembur dari titik benturan, Arka & musuh berhenti 120 ms (freeze-frame), tepi layar kilat emas tipis.
- Batasan: jangan ubah jendela tangkis.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; tangkis serangan → terasa 'TING!' yang memuaskan.

### [ ] T316. **Dash: garis angin & kedip awal-akhir** — referensi: Celeste, Hyper Light Drifter
- File: `src/systems/combat_fx.js`. Baca dulu: pembungkus `W.dash` & `rollFx()`.
- Lakukan: saat dash: 4 garis angin tipis di belakang Arka (searah gerak, pudar 150 ms), kedip putih singkat di titik awal & akhir, jejak debu tiap 40 ms selama dash.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; dash → terlihat cepat & tajam.

### [ ] T317. **Menghindar sempurna: siluet biru & waktu melambat** — referensi: Bayonetta (Witch Time), Nier Automata
- File: `src/systems/combat_fx.js`. Baca dulu: hasil tugas "Menghindar tepat waktu" (gelombang 6).
- Lakukan: saat perfect dodge: siluet biru Arka tertinggal di posisi semula 0,4 s, layar sedikit kebiruan (overlay alpha .12) selama perlambatan.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; dash tepat waktu → siluet biru & warna dingin singkat.

### [ ] T318. **Lingkar rune saat merapal jurus** — referensi: Diablo, Tales of
- File: file baru `src/systems/spell_fx.js` (daftarkan di index.html setelah combat_fx.js). Baca dulu: `castSpell()` di `src/systems/learn.js` (BACA).
- Lakukan: bungkus `castSpell`: sebelum efek jurus, gambar lingkar rune berputar di bawah Arka (warna per sekolah sihir: api oranye, es biru, alam hijau, cahaya emas) 0,35 s, lalu memudar.
- Batasan: jangan ubah biaya MP/efek jurus.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal jurus apa pun → lingkar muncul.

### [ ] T319. **Bola Api: inti menyala, ekor, ledakan** — referensi: Diablo II (Fire Ball), Hades
- File: `src/systems/spell_fx.js`. Baca dulu: proyektil Bola Api (`JURUS.fire`; grep di learn.js/combat.js).
- Lakukan: proyektil diberi inti terang (blend ADD) + jejak partikel oranye; saat kena: ledakan bundar 3 lapis (putih→kuning→oranye) & asap kecil.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal Bola Api ke slime → ledakan jelas.

### [ ] T320. **Nova Es: cincin kristal & serpihan** — referensi: Path of Exile (Frost Nova)
- File: `src/systems/spell_fx.js`. Baca dulu: `nova()` di `src/systems/skills.js` (BACA).
- Lakukan: bungkus `nova`: cincin biru mengembang + 12 serpihan kristal melesat keluar + kabut dingin di tanah 0,8 s; musuh yang beku diberi lapisan es (tint biru muda berkilau).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal Nova Es → cincin & musuh terlihat membeku.

### [ ] T321. **Tebasan Putar: pusaran & sapuan angin** — referensi: Diablo III (Whirlwind), Zelda (Spin Attack)
- File: `src/systems/spell_fx.js`. Baca dulu: `spin()` di `src/systems/skills.js` (BACA).
- Lakukan: bungkus `spin`: lingkaran busur 360° berputar 2× (busur `arcfx` diputar), daun/debu terlempar keluar, kamera bergetar kecil di akhir.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; Tebasan Putar → pusaran terlihat penuh.

### [ ] T322. **Kabut Racun, Cahaya Pulih, Lentera Suci** — referensi: Divinity (awan racun), Final Fantasy (Cure), Diablo (Holy)
- File: `src/systems/spell_fx.js`. Baca dulu: bagian ketiga jurus itu di `castSpell()` (BACA).
- Lakukan: Kabut Racun: gelembung hijau naik & awan berdenyut; Cahaya Pulih: pilar cahaya hijau-emas + daun melayang ke atas; Lentera Suci: sinar silang emas + titik cahaya mengorbit Arka 1 s.
- Batasan: satu commit boleh berisi ketiganya bila < 80 baris.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; rapal ketiganya → masing-masing punya ciri sendiri.

### [ ] T323. **Efek status di musuh** — referensi: Divinity, Diablo
- File: `src/systems/spell_fx.js` (+ `src/systems/status.js` BACA). Baca dulu: `enemyStatus()`/`updStatus()`.
- Lakukan: terbakar: 2 partikel api naik berkedip; beku: kilau es & gerak 0 visual; racun: gelembung hijau kecil. Buat sekali per musuh berstatus, hancurkan saat status habis.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; bakar & racuni slime → efeknya tampak di atasnya.

### [ ] T324. **Percikan kena sesuai bahan musuh** — referensi: Hollow Knight, Dead Cells
- File: `src/systems/combat_fx.js`. Baca dulu: `hitFx()`.
- Lakukan: jenis percikan: slime → cipratan warna slime; golem/mimic → bunga api & serpihan batu; tengkorak/hantu → debu tulang/kabut; binatang → percikan putih biasa. Tentukan dari id/tekstur musuh.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pukul slime & golem → percikannya beda.

### [ ] T325. **Cahaya bersinar (glow) untuk efek penting** — referensi: Ori, Hades
- File: `src/systems/combat_fx.js` & `src/systems/spell_fx.js`. Baca dulu: dokumentasi Phaser 3.80 `preFX.addGlow` (sprite WebGL).
- Lakukan: beri glow tipis pada busur tebasan akhir kombo, proyektil sihir, dan cincin tangkis HANYA bila renderer WebGL dan `OPT.lite` mati.
- Batasan: jangan pasang glow pada objek yang dibuat > 10 per detik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; efek tampak bercahaya di HP; mode hemat baterai → tanpa glow.

### [ ] T326. **HUD vital ala Dimraeth: HP, Stamina, Konsentrasi** — referensi: Dimraeth (vital: Health, Stamina, Concentration), Elden Ring
- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `buildHud()` (±115) & `updHud()`.
- Lakukan: rapikan HUD kiri atas menjadi 3 bar tipis berbingkai: HP (merah), Stamina (hijau, tepat di bawah HP), Konsentrasi (biru = MP yang sudah ada, ganti labelnya). Bingkai piksel gelap 2 px, angka kecil di dalam bar.
- Batasan: jangan menghapus info level/EXP (pindahkan ke bawah bar).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; HUD terlihat rapi seperti RPG souls; nilai tetap benar.

### [ ] T327. **Bilah 5 slot jurus dengan cooldown** — referensi: Dimraeth (5 jurus terpasang), Diablo III, MOBA
- File: file baru `src/ui/spellbar.js` + `styles.css` (daftarkan di index.html). Baca dulu: `JURUS`, `learned()`, `S.spell` (learn.js) & menu jurus di `src/ui/menus.js` (BACA).
- Lakukan: tampilkan bar 5 slot di bawah tengah layar berisi jurus yang sudah dipelajari (urutan JURUS). Slot jurus aktif (`S.spell`) berbingkai emas; ketuk slot jurus sihir → jadikan `S.spell`. Tampilkan sapuan cooldown melingkar & biaya MP; slot abu-abu bila MP kurang.
- Batasan: di HP, bar tidak menutupi joystick/tombol (sesuaikan `bottom`).
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; pelajari 2 jurus → keduanya tampil; ketuk → tombol SIHIR memakai jurus itu.

### [ ] T328. **Bilah HP boss ala souls** — referensi: Dark Souls, Dimraeth (boss = pengalaman utama)
- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `bossBar()` (±153).
- Lakukan: bilah lebar di bawah tengah layar, nama boss di atas kiri bilah, garis penanda di 50% (fase 2), bayangan HP putih yang menyusul (seperti tugas HUD bayangan), muncul dengan fade.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; masuk arena boss → bilah gaya souls.

### [ ] T329. **Ikon Botol Cahaya ala Estus** — referensi: Dark Souls (Estus Flask)
- File: `styles.css` + elemen `hPot` (cari di `src/ui/widgets.js`). Baca dulu: pembungkus HUD `soulHudWrap` di `src/systems/souls.js` (BACA saja).
- Lakukan: tampilkan botol sebagai ikon botol bercahaya dengan titik-titik isi (●●○) di atas tombol OBAT, bukan teks "2/3 · 3". Ramuan biasa sebagai angka kecil di pojok.
- Batasan: logika botol di souls.js tidak diubah.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; minum Botol Cahaya → satu titik meredup.

### [ ] T330. **Baris ikon buff & debuff** — referensi: Diablo, World of Warcraft
- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `updStatusHud()` (status.js) & `S.buff` (state.js, BACA).
- Lakukan: satukan ikon status negatif (racun/terbakar/dingin) dan bonus masakan (`S.buff`) dalam satu baris kecil di bawah bar vital: buff berbingkai hijau, debuff merah, dengan sisa detik.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; makan masakan & kena racun → keduanya tampil berdampingan.

### [ ] T331. **HUD memudar saat damai** — referensi: Elder Scrolls Online (bar muncul hanya saat berubah), Breath of the Wild
- File: `src/ui/widgets.js` + `styles.css`. Baca dulu: `updHud()`.
- Lakukan: jika HP & stamina penuh dan tidak ada musuh mengejar selama 5 s, bar vital memudar ke opacity .35; kembali penuh seketika saat ada perubahan/tempur. Bisa dimatikan `localStorage.lumina_hudfade='0'`.
- Batasan: kartu misi & tombol tidak ikut memudar.
- Jika SUDAH ada → tandai [x] "sudah ada".
- Cek: `npm run check`; jalan santai di desa → HUD redup; diserang → terang.

---
Tugas besar (JANGAN diambil agen ini): pola serangan musuh & boss berfase, Botol Cahaya tambahan, pilar build/mantra, markas, sekutu & ikatan,
memasang BESTIARY_TEXT ke layar Bestiari, buang petak objek jauh di mode benua, hapus mode lama. Rincian: `docs/GAME_DESIGN.md` (akhir) & `docs/HANDOFF_OPENWORLD.md`.
