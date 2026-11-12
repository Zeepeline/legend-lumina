# HANDOFF — Open World Legenda Lumina (lanjutan)

> Untuk agen berikutnya. Baca ini + `AGENTS.md` sebelum mengubah apa pun.
> Status per v1.27.2 (sw `lumina-v35`), 12 Nov 2026.

## 0. Aturan wajib
- Aturan kode: `docs/CODE_RULES.md`. Cari fungsi lewat `docs/CODEMAP.md` (jangan baca file utuh).
- Balas user dalam **Bahasa Indonesia**.
- **JANGAN membahas isi `docs/SPOILER_ENDING.md` dengan user** (user tidak mau spoiler). Boleh dibaca untuk konsistensi, tapi jangan dikutip/diringkas ke user.
- Ikuti semua dokumen desain: `GAME_DESIGN`, `WORLD_DESIGN`, `BENUA_LUMINA`, `PLACEMENT_RULES`, `NPC_RULES`, `ART_BIBLE`, `VALIDATION_RULES`, `ASSET_RULES`, `ANIMATION_RULES`.
- Aset dari user (buatan ChatGPT, di repo) aman dipakai.
- Jangan push setengah jadi. Push ke `main` = langsung deploy ke https://zeepeline.github.io/legend-lumina/.

## 1. Tujuan besar (permintaan user)
"Satu peta besar, tidak ada perpindahan wilayah, tidak ada ujung (real world)" — model mirip Genshin.
Pilihan user yang sudah dikunci:
- Pendekatan: **satukan wilayah lama** (bukan bikin peta baru).
- Tumpang tindih: **geser & beri jarak** (sudah via `WORLD_POS`).
- Gerak: **stamina & lari cepat, memanjat tebing, meluncur (glider)**. Berenang **TIDAK** dipilih.

### DEFINISI SELESAI (ditegaskan user 12 Nov, dengan screenshot)
User melihat kamera **berhenti di tepi wilayah** (karakter tidak di tengah layar, di balik tepi ada dinding pohon). Itu yang TIDAK diinginkan. Target:
1. **Kamera SELALU berpusat pada karakter**, di mana pun. Clamp kamera (`camB` di `camStep`) hanya boleh terjadi di tepi benua, dan sebaiknya tidak terasa (laut/gunung tetap terlihat di balik tepi).
2. Tidak ada "ujung peta" yang terasa di antara wilayah: berjalan dari Desa Lumina ke arah mana pun langsung masuk alam liar / wilayah lain, tanpa dinding pohon kotak, tanpa layar hitam, tanpa banner pindah peta yang mengganggu (boleh toast kecil nama wilayah).
3. Area di sekitar wilayah yang belum "punya isi" tetap harus tergambar (tanah + pohon alam liar), bukan latar kosong/hitam.
**[v1.27.1 SEBAGIAN DIPERBAIKI: `cameras.main.setBounds` kini ikut `camB`, jadi kamera sudah mengikuti karakter & wilayah sebelah yang sudah dimuat tampil. Sisa: wilayah tanpa exit/diagonal belum dimuat.]** Bug yang dilaporkan user: saat berdiri di dekat tepi wilayah, kamera mentok di batas peta dan wilayah sebelahnya (mis. Desa Lumina) **tidak terlihat**. Penyebab: `camB`/`regBounds()` hanya menggabungkan wilayah yang sudah dimuat. Wilayah hanya dimuat bila tetangga lewat exit (`NEIGH`) dan jaraknya < `REG_LOAD`; wilayah yang bersebelahan tanpa exit, atau yang menempel secara diagonal, tidak pernah dimuat, jadi kamera berhenti di situ. Perbaikan: muat **semua** wilayah outdoor yang berpotongan dengan persegi pandang kamera + margin (berdasarkan `WORLD_POS` + ukuran peta, bukan hanya `NEIGH`), dan jangan clamp kamera ke batas wilayah.
Saran implementasi: hapus clamp kamera antar wilayah (batas kamera = batas benua), muat wilayah tetangga lebih awal (`REG_LOAD` ≥ setengah lebar layar + margin), dan isi celah dengan wilayah alam liar prosedural (lihat Langkah 2).

### Bug kecil yang terlihat di screenshot
- HUD emas menampilkan pecahan panjang (`6640.7407867…`). Bulatkan saat menambah emas (`S.gold = Math.round(...)`, cari sumber pengali — kemungkinan bonus atribut/buff di `craft.js`/`polish.js`) dan tampilkan `Math.floor(S.gold)` di `updHud`.

## 2. Yang SUDAH selesai
| Tahap | Isi | File utama |
|---|---|---|
| Tahap 1 (lama) | Posisi global tiap wilayah tanpa overlap | `src/world/layout.js` (`WORLD_POS`) |
| Tahap 2 (lama) | 7 peta peralihan `pl_*` penghubung wilayah, `NEIGH` | `layout.js` (`PERALIHAN`, `buildPeralihan`, `NEIGH`), `src/systems/openworld.js` |
| Streaming tanah | Tile 64px, budget 4ms/frame, LRU 1100 | `src/systems/stream.js` |
| **Penggabungan langkah 1** (v1.27.0) | Wilayah sekitar dimuat sebagai **scene World pasif** dan berjalan bersamaan; lintas wilayah = **handoff** tanpa reload | `src/systems/regions.js`, `src/scene/world.js`, `openworld.js` |

### Cara kerja regions (penting dipahami)
- Tiap wilayah = instance scene `World` sendiri. Key di-set lewat `sc.sys.settings.key` sebelum `scene.add`.
- `G.scene` = scene aktif (yang dikontrol pemain). Lainnya `passive=true`: pemain "hantu" (invisible, body off), kamera disinkron, `update` → `updPassive`.
- `updRegions` (hanya scene aktif, tiap 0.3s): buang wilayah > `REG_KEEP`(1100px), tambah 1 wilayah terdekat < `REG_LOAD`(640px), maks `REG_MAX`=5.
- `regBounds()`: batas kamera & fisika = gabungan wilayah aktif + yang dimuat.
- `owHandoff(B)`: pindah kontrol ke B (salin state pemain, efek aktif `makeActiveFx`/`dropActiveFx`, musik, HUD, `S.map`, `B.owN`).
- `updCross` (openworld.js): lintas hanya lewat celah exit (margin 6px); stage 0 → penjaga blokir hutan. Jika region sudah dimuat → handoff, kalau belum → fallback restart.
- `hurtPlayer` dari scene pasif diteruskan ke `G.scene` dengan konversi koordinat.
- Kamera: `regBounds()` juga memanggil `cameras.main.setBounds(camB)` (v1.27.1). Jangan kembalikan `setBounds(0,0,M.w,M.h)` untuk wilayah luar ruang.
- Matikan untuk debug: `window.REGIONS_OFF = true` (regions) / `window.STREAM_OFF = true` (streaming).
- Fungsi bantu: `relXY(from,to)`, `wposOf(id)`, `removeRegions(except)`.

## 3. YANG HARUS DIKERJAKAN BERIKUTNYA (urut)

### Langkah 2 — Isi benua, buka batas, tanpa ujung
1. **Isi celah kosong** antar wilayah di `WORLD_POS` dengan alam liar (padang/hutan/bukit sesuai bioma tetangga, lihat `BENUA_LUMINA` & `WORLD_DESIGN`). Opsi paling aman: tambah entri tipe peralihan baru (seperti `PERALIHAN`) yang menutup celah, atau generator "wilderness tile" per blok grid. Wajib lolos `check-layout`.
2. **Buka border pohon** antar wilayah yang bersebelahan: border pohon hanya tetap ada di sisi yang menghadap tepi dunia. Lintas boleh di mana saja sepanjang sisi bersebelahan (ubah syarat celah exit di `updCross`; pertahankan penjaga stage 0 ke hutan — ganti dengan penghalang naratif, mis. pagar/penjaga sepanjang tepi hutan).
3. **Tepi dunia** = pantai (laut, sudah ada `seaOv/seaW/seaP`) atau pegunungan/tebing tak terlewati. Tidak boleh ada "dinding pohon kotak".
4. Interior (`kgate`, `kpasar`, `kakademi`, `kbawah`, rumah, gua, dll) **tetap boleh pakai pintu/transisi** — hanya outdoor yang digabung.

### Langkah 3 — Haluskan
- Blend tanah di perbatasan (dither/transisi tile di `stream.js`: `genGround`/`gLayer`).
- Sebar pembuatan region lintas frame (sekarang ada hitch ~100ms saat region dimuat) — mis. buat objek bertahap per frame di `addRegion`/`create` untuk scene pasif.

### Tahap 3 — Gerak (pilihan user)
- Stamina + sprint (bar di HUD, regen saat diam).
- Panjat tebing (tile tebing jadi climbable, kuras stamina).
- Glider dari tempat tinggi (kuras stamina, jatuh kalau habis).
- **Tidak ada berenang.** Air tetap penghalang.

### Tahap 4 — Konten eksplorasi
- Viewpoint (buka peta), koleksi tersebar (ala oculus), puzzle kecil. Ikuti `PLACEMENT_RULES`.

## 4. Gotcha teknis (sudah pernah bikin bug)
- Script **global klasik**, urutan muat di `index.html`. Mixin `Object.assign(World.prototype, {...})`. Jangan override fungsi dari file yang dimuat belakangan — pakai delegate (contoh: `openMapNew`, `openFishLogNew`). `const/let` global **tidak** ada di `window`.
- Scene pasif belum punya `this.pl` di awal → pakai `this.pl0` (contoh fix di `src/systems/ambient.js` `near()`).
- Setelah handoff, `B.owN` harus diisi, kalau tidak terjadi ping-pong balik ke desa.
- Monster di wilayah pasif **bisa menyerang** pemain. Di tes, bunuh musuh di `[window.__game.sc, ...REG.values()]`.
- Saat edit pakai sed/Python, **jangan sisipkan komentar `//` di statement satu baris** — pakai `/* */`.
- Kinerja: culling via `cameraFilter`, sprite statis dikeluarkan dari `updateList`, dinding = `Phaser.GameObjects.Zone` di luar display list. Jaga ini untuk objek baru.
- `check-layout` memuat `layout.js`; kalau ada referensi global (mis. `ENEMY`) yang belum ada, guard dulu (`typeof ENEMY!=='undefined'`).

## 5. Tes
```bash
cd legend-lumina
export PHASER_LOCAL=/path/ke/node_modules/phaser/dist/phaser.min.js
export CHROME_PATH=$(which google-chrome || which chromium)
pkill -f http.server
npm run check                                  # sintaks + check-layout (harus 0 masalah)
npx playwright test tests/openworld.spec.js    # 40 lintasan antar-wilayah
npx playwright test --workers=2 > /tmp/full.txt 2>&1 &   # full suite >10 menit, jalankan di background
PERF=1 npx playwright test tests/perf.spec.js  # cek frame (bandingkan dengan NOSTREAM=1)
```
- Kondisi terakhir: 54 lulus, 2 flaky di beban paralel (`bab3.spec.js` obor, `systems.spec.js` beli/tempa) — **lulus saat dijalankan sendiri**. Kalau masih flaky, kemungkinan monster pasif; bersihkan musuh di `REG` seperti di `openworld.spec.js`.
- Helper tes: `boot`, `newGame`, `loadGame`/`gotoGame`, `waitForGameReady`, `goto`, `press`, `flush`, `G`, `hold`, `faceNpc`, `learnAll`, `S`, `noErrors`.

## 6. Rutinitas rilis
1. Bump `sw.js` `lumina-vNN` (+1, sekarang v35) dan `GAME_VERSION` (sekarang `1.27.2`).
2. `python3 tools/bundle.py` lalu `npm run check` (0 masalah).
3. Perbarui bagian Status di `AGENTS.md` (1 baris per fitur) dan catatan serah-terima ini.
4. Commit, lalu `git fetch origin main && git rebase FETCH_HEAD && git push`.
5. Cek deploy: `gh run list -R Zeepeline/legend-lumina -w pages.yml -L 1`.
6. Laporkan ke user dalam Bahasa Indonesia, singkat, tanpa spoiler.

## 7. Peta file
- `src/scene/world.js` — scene utama (create/update, `passive`, `makeActiveFx`/`dropActiveFx`, `camStep`, `checkZones`). Perilaku per objek di `src/world/spawn/`.
- `src/systems/regions.js` — multi-scene wilayah & handoff.
- `src/systems/openworld.js` — `initOpen`, `updCross`, lintas wilayah.
- `src/systems/stream.js` — streaming tanah, `groundOverview` (dipakai peta).
- `src/world/layout.js` — `WORLD_POS`, `PERALIHAN`, `buildPeralihan`, `NEIGH`.
- `src/world/maps/*` — definisi peta per wilayah.
- `tools/check-layout.js`, `tools/bundle.py` — validasi & bundle.
- `tests/openworld.spec.js`, `tests/perf.spec.js` — tes open world & kinerja.
