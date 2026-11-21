# Pipeline 3D → sprite pixel art (uji coba)
Karakter low-poly + rangka sendi (pedang anak sendi tangan → selalu tergenggam), animasi dikunci di sendi, dirender 8 arah dari
kamera isometrik ortografis lalu diolah jadi pixel art (palet bersama + garis tepi). Semua frame dijamin konsisten.
- Siapkan Blender sebagai modul: `python3.11 -m venv /tmp/bv && /tmp/bv/bin/pip install bpy==4.2.0`
- Render: `/tmp/bv/bin/python tools/rig3d/arka_rig.py /tmp/rig3d` (±20 dtk, 144 frame: idle 4, lari 8, tebas 6 × 8 arah)
- Olah: `python3 tools/rig3d/pixelize.py /tmp/rig3d` → `arka3d_sheet.png` (72 px/frame) + `arka3d_preview.gif`
Model di sini dibangun dari kotak/silinder (contoh). Untuk hasil final: model Arka (.glb/.fbx, bisa dari AI 3D) + animasi Mixamo,
impor di skrip menggantikan bagian "tubuh".
