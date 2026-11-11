Baca `AGENTS.md` di root repo dulu: berisi peta file, cara menambah fitur, dan aturan yang rawan bug.
Jangan jalankan tes di lokal kecuali perlu; push ke branch dan lihat hasil GitHub Actions (workflow CI).
Setelah mengubah `src/`, jalankan `python3 tools/bundle.py` agar `dist/game.html` ikut terbarui.
