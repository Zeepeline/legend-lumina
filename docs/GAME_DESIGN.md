# Legenda Lumina — Game Design Direction

> **Wajib dibaca sebelum menambah cerita, misi, bab, NPC, atau boss.**
> Bagian 1 adalah arahan dari pemilik proyek (jangan diubah tanpa izin).
> Bagian 2 adalah story bible yang menerjemahkan arahan itu ke cerita Legenda Lumina.

---

# Bagian 1 — Arahan pemilik proyek

## Visi

Legenda Lumina adalah action RPG pixel-art yang berfokus pada:
- eksplorasi
- misteri
- perkembangan karakter
- hubungan dengan NPC
- dunia yang bereaksi terhadap tindakan pemain
- cerita panjang yang berkembang secara bertahap

Game TIDAK boleh terasa seperti:
Map → Dungeon → Boss → Reward → Next Map.

Boss adalah bagian dari cerita, bukan tujuan akhir cerita.

## Prinsip Storytelling

Cerita harus:
1. Memberikan tujuan jangka pendek.
2. Menanam misteri jangka menengah.
3. Memiliki misteri utama jangka panjang.
4. Memberikan alasan emosional kepada pemain untuk peduli.
5. Mengungkap informasi secara bertahap.

Setiap chapter idealnya:
- menjawab beberapa pertanyaan lama
- membuka pertanyaan baru
- memperkenalkan konflik
- mengembangkan karakter atau dunia
- memberikan payoff terhadap foreshadowing sebelumnya

Jangan menyelesaikan misteri utama terlalu cepat.

## Pacing

Jangan memaksa setiap chapter memiliki boss.

Tidak semua konflik harus diselesaikan dengan pertarungan.

Gunakan:
- eksplorasi
- NPC
- puzzle
- investigasi
- perjalanan
- environmental storytelling
- pilihan pemain
- event dunia
- dungeon
- boss

sebagai variasi ritme.

## Tujuan Pemain

Pemain harus memiliki beberapa lapisan tujuan:

### Immediate Goal
Apa yang harus dilakukan sekarang?

### Mid-term Goal
Apa masalah yang sedang diselidiki?

### Long-term Goal
Apa misteri besar yang perlahan terungkap?

Jangan menjadikan "kalahkan boss" sebagai satu-satunya tujuan.

---

# Bagian 2 — Story bible (arah yang dipilih: "Gabungan")

## Misteri utama (jangka panjang)

**Rahasia penuh (JANGAN diungkap sekaligus):**
- Arka ditemukan saat bayi di samping Kristal Lumina. Ia bukan anak desa biasa.
- Ibunya, **Selene**, adalah Penjaga Cahaya terakhir. Belasan tahun lalu ia menyegel **"Yang Tertidur di Bawah Akar"**, makhluk purba di bawah pohon besar desa yang memakan cahaya, lalu menghilang. Segelnya kini melemah.
- Makhluk itu tidak bisa bergerak, jadi ia **berbisik** kepada yang hatinya retak. Raja Goblin, Morgath, dan Kryos sama-sama "mendengar suara". Mereka boneka, bukan dalang.
- **Tetua Bram** tahu asal-usul Arka dan menyembunyikannya, karena berjanji kepada Selene dan karena takut makhluk itu mengincar Arka.
- Tanda di telapak tangan Arka menyala di dekat kristal dan segel. Tanda itu kunci untuk menyegel ulang, atau membuka segelnya sepenuhnya.

**Pertanyaan yang dibuka ke pemain (bertahap):**
1. Kenapa kristal-kristal meredup bersamaan? (Bab 1)
2. Siapa "suara" yang disebut para penjahat? (Bab 1–3, makin jelas)
3. Kenapa tanda di tangan Arka menyala? (mulai Bab 2–3)
4. Apa yang disembunyikan Tetua Bram? (Bab 4+)
5. Siapa ibu Arka, dan di mana dia? (jawaban parsial di bab tengah, penuh di akhir)
6. Apa sebenarnya yang ada di bawah akar? (akhir cerita)

## Peta pengungkapan per bab

| Bab | Tujuan langsung | Misteri tengah | Yang ditanam / dijawab |
| --- | --- | --- | --- |
| 1 (sudah ada) | Pulihkan Kristal Lumina | Kenapa monster mengamuk? | Tanam: Raja Goblin bergumam "Suara itu berjanji..." saat kalah. Tanda Arka berkedip saat menyentuh kristal (belum dijelaskan). |
| 2 (sudah ada) | Hentikan Morgath | Siapa Morgath, kenapa benci desa? | Jawab: Morgath murid yang diusir. Tanam: Morgath menyebut "Dia di bawah akar menjanjikan cahaya abadi". Pertapa Sura kenal "Selene". |
| 3 (sudah ada) | Nyalakan obor, hadapi Kryos | Siapa yang membangunkan naga? | Jawab: Morgath membangunkan Kryos. Tanam: Kryos tidak jahat, hanya "dibangunkan oleh bisikan"; relief obor bergambar wanita dengan tanda yang sama di tangan. |
| 4 (rencana) | Selidiki mimpi buruk penduduk | Ada apa di bawah pohon desa? | **Tanpa boss.** Investigasi: kumpulkan kesaksian NPC, petunjuk lingkungan, puzzle akar. Pilihan: konfrontasi Bram atau diam-diam. Jawab sebagian: Bram mengaku Arka ditemukan di dekat kristal. |
| 5+ (rencana) | Perjalanan mencari jejak Selene | Apakah Selene masih hidup? | Wilayah baru, dungeon, NPC baru. Satu boss boleh, tapi bukan inti bab. |
| Akhir | Segel ulang atau hadapi makhluk itu | — | Payoff semua foreshadowing; pilihan pemain memengaruhi akhir. |

## Aturan penerapan untuk agent

- **Jangan ubah cerita Bab 1–3 secara besar** tanpa izin pemilik. Penambahan foreshadowing kecil (1–2 baris dialog, prasasti) boleh jika diminta.
- **Setiap bab baru:** tulis dulu di tabel di atas apa yang dijawab, apa yang dibuka, dan variasi ritmenya. Minta persetujuan pemilik untuk bab yang mengungkap rahasia besar.
- **Tidak semua bab punya boss.** Selang-seling: bab investigasi/perjalanan ↔ bab dungeon/boss.
- **Tiga lapis tujuan** harus selalu terlihat oleh pemain: langsung (`STAGE_TXT`), tengah, dan jangka panjang. Sistem jurnal untuk lapis tengah & panjang belum dibuat (lihat Status di `AGENTS.md`).
- **Dunia bereaksi:** setelah peristiwa besar, dialog NPC dan tampilan dunia ikut berubah (contoh yang sudah ada: kabut rawa hilang setelah Morgath kalah).
- **Pengungkapan bertahap:** satu bab maksimal menjawab 1–2 pertanyaan dan membuka 1–2 pertanyaan baru.
- Semua teks dalam Bahasa Indonesia.
