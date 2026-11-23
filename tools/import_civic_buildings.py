"""Pasang gedung publik Kota Lumina dari paket acuan assets/ref/Buildings (gaya Tiny Swords) ke game:
  Balai Dewan (kantor pemerintahan)  ← Yellow Buildings/Monastery.png (menara jam, atap emas)
  Barak Tentara Bayaran              ← Red Buildings/Barracks.png (pedang bersilang di dinding)
Dipotong rapat ke tepi gambar, diperkecil seperti rumah lain (bake_houses.shrink), rata bawah & tengah di kanvasnya.
Hasil: assets/img/buildings/sp_b_<kunci>.png — dipasang otomatis lewat REF_HOUSES.map (src/systems/ref_houses.js).
Jalankan:  python3 tools/import_civic_buildings.py
"""
import os
from PIL import Image
from bake_houses import shrink, ROOT

REF = os.path.normpath(os.path.join(ROOT, '..', '..', 'ref', 'Buildings'))  # ROOT = assets/img/buildings
JOBS = [  # kunci, sumber, lebar isi, kanvas (lebar, tinggi)
    ('balaiDewan', 'Yellow Buildings/Monastery.png', 104, (108, 176)),
    ('barakBayaran', 'Red Buildings/Barracks.png', 110, (114, 116)),
]
for key, src, w, (W, H) in JOBS:
    im = Image.open(os.path.join(REF, src)).convert('RGBA')
    im = im.crop(im.getbbox())
    s = shrink(im, w)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(s, ((W - s.width) // 2, H - s.height - 1))
    c.save(os.path.join(ROOT, f'sp_b_{key}.png'), optimize=True)
    print('pasang', f'sp_b_{key}.png', c.size, '← isi', s.size)
