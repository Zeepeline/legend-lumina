# Legenda Lumina

Action RPG top-down bergaya *Souls-lite* untuk PC/Mac dan Android, dibangun dengan **Godot 4.7.2** (`GL Compatibility`).

## Membuka & Bermain

1. Buka aplikasi **Godot 4.7.2**, lalu muat proyek [godot/project.godot](godot/project.godot).
2. Tekan **F5** (atau tombol *Play*) untuk menjalankan `res://main.tscn` mulai dari **Desa Lumina**.

## Kontrol Utama

- **Gerak:** `W A S D` / Tombol Panah / *Left Stick* / Joystick sentuh
- **Serang / Tebasan Putar:** `J` / `Z` / `Spasi` (tahan `>= 0.42` dtk lalu lepas untuk Tebasan Putar)
- **Berguling (*Dodge Roll* + *i-frames*):** `K` / `X` / `Shift`
- **Gunakan Jurus Aktif:** `R` / `C` / `RB`
- **Ganti Jurus Aktif:** `V` / `LB`
- **Botol Cahaya (Pulih HP):** `Q` / `H`
- **Interaksi (Bicara, Peti, Tidur, Altar, Mancing, Portal):** `E` / `F` / `Enter`
- **Tas & Perlengkapan:** `I` / `Tab` / `BACK`
- **Jurnal, Jurus, & Kerajinan:** `L` / `U`
- **Peta Benua (Teleport Antar Altar):** `M`
- **Jeda & Pengaturan:** `Esc` / `Start`

## Validasi & Pengujian (CLI)

```bash
GODOT_BIN=/Applications/Godot.app/Contents/MacOS/Godot bash ~/.gemini/config/skills/godot-jrpg-dev/scripts/validate_project.sh godot
/Applications/Godot.app/Contents/MacOS/Godot --headless --path godot --script res://tests/run_tests.gd
```

## Struktur Direktori

- `godot/` — Proyek game Godot 4.7.2 (skrip GDScript, scene `.tscn`, data `.tres`, aset terpakai `godot/assets/`, tes otomatis `godot/tests/run_tests.gd`).
- `docs/` — Dokumen desain dunia, lore, panduan visual, dan catatan pengembangan.
- `assets/ref/` — Referensi gambar lokal (tidak dilacak Git).
