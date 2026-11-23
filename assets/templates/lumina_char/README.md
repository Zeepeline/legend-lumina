# Templat karakter Lumina

Dasar karakter chibi buatan sendiri (digambar dari nol lewat `tools/gen_char_template.py`, bukan salinan templat pihak lain), untuk didandani jadi NPC/hero dengan jalan 4 arah asli. Tidak dimuat game (tidak ada di `IMG_LIST`); jadi bahan kerja. Berkas di folder ini hasil generator: jangan diedit tangan, ubah skripnya.

- **Kanvas** 48×48 (format lembar `docs/NPC_ROSTER.md`), tengah x=24, telapak di y=47, tinggi 32 px. Garis tepi berwarna, cahaya kiri-atas (`docs/ART_BIBLE.md`).
- **Arah** `Down`, `Up`, `Side`. Side menghadap KANAN; kiri = `flipX` (sama seperti `mila_sheet.png`, `docs/NPC_ANIM.md`).
- **Animasi** Idle 4 · Walk 4 · Run 6 · Interact 4 · Attack 6 (per arah) · Talk 4 (hanya Down). Tag `.aseprite`: `<Anim>_<Arah>`.
- **`npc_sheet_base.png`** = lembar dasar siap dandan sesuai NPC_ROSTER §1 (8 kolom; baris 0–4: walk_down, walk_up, walk_side, idle [bawah, samping, atas × diam/napas], talk). Dandani, simpan sebagai `assets/img/npc/npc_sheet_<id>.png`, lalu tambahkan baris kegiatan (5+).
- **Berkas lain** `lumina_char.aseprite` (layer `Body`, `Clothes`, `Hair`, `Gear`; `Hair` & `Gear` kosong), `All-Sheet.png` (baris = `sheet.json: rows`, kolom = frame), `<Anim>-Sheet.png`.
- **Baju polos** di layer `Clothes` berwarna abu-krem supaya mudah diwarnai ulang; kulit di `Body`.
- Buat ulang: `python3 tools/gen_char_template.py` (butuh Pillow; `.aseprite` ikut dibuat jika `aseprite` ada di PATH).

Belum ada: arah diagonal, Jump, Rotate, kedipan mata; gerak Run di tampak depan/belakang masih tipis. Rambut/senjata digambar di layer `Hair`/`Gear` per frame.
