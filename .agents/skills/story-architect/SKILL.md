---
name: story-architect
description: Panduan dan alur kerja diskusi cerita, perancangan narasi JRPG/action RPG, worldbuilding benua Lumina, penyusunan dialog NPC, dan pencatatan keputusan plot ke docs/STORY_JOURNAL.md. Gunakan skill ini setiap kali berdiskusi, merancang bab/misi baru, atau mencatat perkembangan cerita dengan pemilik.
---

# Skill: Story Architect & Narrative Designer (Legenda Lumina)

Gunakan panduan ini saat berdiskusi, mematangkan konsep narasi, atau mencatat plot game *Legenda Lumina*.

## 1. Dokumen Acuan Cerita
- `docs/GAME_DESIGN.md`: Visi & prinsip storytelling (3 lapis tujuan, pacing non-linear, boss sebagai bagian alur).
- `docs/BENUA_LUMINA.md`: Peta wilayah besar benua Lumina, sejarah kuno, faksi, dan ekspansi Bab 6+.
- `docs/DUNIA_FANTASI.md`: Pedoman kadar fantasi (fantasi sedang berakar realisme alam).
- `docs/GEOGRAFI.md`: Tata letak pemukiman, bentang alam, sungai, dan landmark.
- `docs/NPC_RULES.md`: Format dialog Phaser (`say`, `talk`, `choose`), jadwal/rutinitas NPC, dan penokohan.
- `docs/SPOILER_ENDING.md`: **RAHASIA**. Jangan pernah dibahas langsung dengan pemilik!

## 2. Alur Diskusi Bersama Pemilik
1. **Dengarkan & Gali**: Pahami ide awal dari pemilik (apakah tentang babak baru, karakter baru, quest sampingan, atau perubahan lore).
2. **Kembangkan dengan Prinsip 3 Lapis**:
   - Apa *Immediate Goal* bagi pemain?
   - Apa *Mid-term Goal* (konflik lokal/penyelidikan)?
   - Apa *Long-term Goal* (kaitannya dengan misteri benua/Lumina)?
3. **Pacing & Variasi**:
   - Pastikan ada elemen eksplorasi, interaksi NPC, atau environmental storytelling (jangan hanya "pergi ke dungeon lalu hajar boss").
4. **Validasi & Konfirmasi**: Ajukan opsi pilihan atau pertanyaan pendalaman bila ada detail yang perlu diputuskan.

## 3. Alur Pencatatan (Docs Logging)
Setiap selesai diskusi atau mencapai kesepakatan plot:
1. Buka atau perbarui file [STORY_JOURNAL.md](file:///Users/herlambang/Documents/legend-lumina/docs/STORY_JOURNAL.md).
2. Gunakan format entri:
   - **Tanggal & Topik**: e.g., `## [YYYY-MM-DD] Diskusi Bab 6: Eksplorasi Kuil Kuno`
   - **Status**: `[Ide / Draf / Disepakati / Siap Implementasi]`
   - **Ringkasan Narasi & Motivasi Tokoh**
   - **Struktur Quest / Tahapan Cerita**
   - **Draf Dialog Kunci** (format `say()` atau teks percakapan)
   - **Dampak ke Dunia & Lingkungan** (NPC yang berubah posisi, event cuaca, dsb.)
   - **Tindak Lanjut / Checklist Teknis**
3. Jalankan `npm run check` jika ada penambahan file dokumentasi baru agar `docs/INDEX.md` tetap tersinkronisasi.
