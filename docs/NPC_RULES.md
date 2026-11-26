# Aturan NPC & Kehidupan Dunia (WAJIB untuk semua agent)

Arahan pemilik: **tidak boleh ada NPC yang cuma diam di tempat.** Seperti di RDR2 atau GTA, setiap NPC punya kegiatan sesuai perannya, dan dunia terasa hidup walau pemain tidak sedang melihat.

Sistemnya ada di `src/npc/brain.js`. Gerak dasar dan sapaan ada di `src/npc/npcs.js`.

## 1. Setiap NPC punya peran

Peran diambil dari `NPC_ROLE[id]` atau `NPC_ROLE[ch]`, atau dari properti `role` di data NPC. Tanpa peran, NPC menjadi `citizen` (warga yang berjalan-jalan).

| Peran | Kegiatan |
| --- | --- |
| `smith` | memukul di dekat landasan/tungku (percikan api, bunyi denting) |
| `farmer` | merawat ladang, jerami, kincir (debu tanah) |
| `vendor` | menata lapak, peti, tong |
| `guard` | berpatroli di sepanjang jalan setapak |
| `gate` | berjaga di pos, menoleh ke kiri-kanan |
| `child` | berlari bermain di sekitar rumah dan alun-alun |
| `elder` | duduk di bangku, membaca, berjalan pelan ke pohon besar |
| `inn` / `cook` | menyapu, memasak, mengurus meja |
| `hunter` / `fisher` / `worker` / `keeper` / `hermit` / `clerk` | kegiatan sesuai pekerjaannya |
| `citizen` | berjalan ke tempat umum (air mancur, pasar, bangku, papan), duduk, dan **mengobrol dengan NPC lain** |

Menambah peran baru: tambahkan entri di `WORK` (jenis objek tempat kerja, ikon kegiatan, efek) dan petakan id NPC di `NPC_ROLE`.

## 2. Tempat kerja harus ada di peta

Peran kerja butuh objek tempat kerjanya di dekat pos NPC (dalam radius `leash`). Contohnya, pandai besi butuh `anvil`/`forge` di dekatnya. Tanpa itu NPC hanya berjalan-jalan. **Saat menambah NPC pekerja, tambahkan juga tempat kerjanya**, dengan penempatan yang mengikuti `docs/PLACEMENT_RULES.md`.

## 3. NPC cerita tetap terjangkau

NPC yang dibutuhkan misi (`STORY_NPC`) hanya beraktivitas dalam radius kecil (±90 px) dari posnya dan **tidak pulang saat malam**, supaya penanda misi (`STAGE_GOAL`) tetap akurat. NPC cerita baru wajib ditambahkan ke `STORY_NPC`.

## 4. Siklus siang-malam

- Malam (`isNight()`): warga biasa berjalan ke pintu rumah terdekat lalu menghilang, dan keluar lagi di pagi hari.
- Penjaga, penjaga gerbang, dan NPC cerita tetap ada di malam hari.

## 5. Bereaksi pada pemain

- Berhenti dan menoleh ke pemain saat didekati.
- Sapaan spontan (`NPC_BARKS` di `npcs.js`) saat pemain lewat.
- Saat dialog, semua NPC berhenti (input terkunci).

## 6. Larangan

- Jangan membuat NPC baru yang hanya berdiri. Properti `still: true` hanya untuk kasus khusus (misalnya patung hidup atau orang yang sedang tidur), **dengan alasan** di komentar data peta.
- Jangan menaruh NPC di dalam tembok atau objek. `node tools/check-layout.js` memeriksa apakah NPC terjangkau.
- Jangan membuat NPC berjalan cepat tanpa alasan. Hanya anak-anak yang berlari.

## 7. Dialog & UI (agar layar tidak membeku)

- Format yang benar: `await say('teks', 'Nama')`, `await talk('Nama', ['baris1', 'baris2'])`, `await choose({ head: 'Judul', items: [{ t: 'Opsi' }] })`, `await ask('Pertanyaan?')`.
- Format lama `say('Nama', [..])` dan `choose('Judul', ['..'])` masih diterima, tapi **jangan dipakai di kode baru**.
- Setiap `G.lock++` wajib punya `G.lock--` di `finally`. Jangan `return` di antara keduanya tanpa `try/finally`. Itu penyebab layar membeku.

## 8. Kehidupan kota: peran kerja, jadwal & interaksi (v1.89.0)

- **Peran kerja tambahan** (`src/npc/life_roles.js`, `LIFE_ROLES`): prajurit, pemanah, kapten, tukang kuda, tentara bayaran, pedagang kios, pembeli, pemusik, penabuh, juru warta, imam, penimba air, juru tulis, guru, murid, tukang kebun, ahli bintang, penyapu, tukang lampu, pelanggan penginapan, pustakawan, penggiling, penjaga mercusuar, musafir, pemancing. Tiap peran punya jam kerja (`hours`), objek tempat kerja (`work`, regex jenis objek peta), titik berdiri (`spot`), aksi (`act`), dan perilaku malam (`night`: `patrol`/`stay`/pulang).
- **Rencana tujuan** (`life_plan.js`) membungkus `npcPickGoal`/`npcActStart`/`npcActTick`; peran yang tidak ada di `LIFE_ROLES` tetap memakai otak lama.
- **Interaksi antar-NPC** (`life_duos.js`): tawar-menawar, tanding, hormat, kejar-kejaran, gosip, menonton, bersulang, antar paket. Selama adegan, `o.duo` diisi dan otak NPC dilewati. NPC cerita tidak pernah dipindahkan oleh adegan.
- **Pemeran** (`src/world/maps/cast.js`): `CAST[peta]` menambah NPC, `CAST_ROLE[peta]` memberi peran ke NPC lama. Menambah NPC pekerja: pastikan objek tempat kerjanya ada di dekatnya (aturan bag. 2).
- **Sprite sheet** per NPC (`life_sheet.js`, `NPC_SHEETS`): format & daftar lengkap di `docs/NPC_ROSTER.md`. Tanpa lembar, gerak kerja memakai pengganti kode.

## 9. Pekerjaan berurutan (JOBS)

- `src/npc/job_data.js`: `JOBS[peta][idNpc] = { hours, steps }`; langkah = titik lokal + aksi (`JOB_ACTS`) + barang `take`/`drop` (`JOB_ITEMS`), mesin di `src/npc/jobs.js`.
- Langkah maju hanya bila benar-benar selesai di tempatnya (`goal.here`). Malam, hujan, dan di luar `hours` memakai otak lama.
- NPC yang sedang menjadi tujuan misi (`STAGE_GOAL`) tidak bekerja jauh dari pos (`jobPinned`).
- Semua gerak NPC memakai `npcFindPath` (`npc_path.js`). Titik kerja wajib terjangkau; tes: `tests/npc_jobs.spec.js`.
