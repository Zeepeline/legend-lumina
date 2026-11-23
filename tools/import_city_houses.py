"""Pasang 5 rumah perkotaan pemilik (assets/img/buildings/city_house_<1-5>.png) ke game sebagai sp_b_cityHouse<N>.png.

  python3 tools/import_city_houses.py

Gambar 2-5 membawa latar kotak-kotak 'transparan' palsu (RGB): dibuang dengan isi banjir dari tepi lewat piksel netral
terang (putih/abu-abu muda). Plester rumah berwarna krem (tidak netral) & garis tepi gelap menghentikan banjir.
Hasil diperkecil seperti rumah lain (bake_houses.shrink) ke kanvas 100x132 (sama dengan houseA → tabrakan & tata letak sama).
"""
import os
from collections import deque
import numpy as np
from PIL import Image
from bake_houses import shrink, ROOT

W, H, MAXW = 100, 132, 100


def cutout(path):
    im = Image.open(path).convert('RGBA')
    a = np.asarray(im).astype(int)
    rgb, al = a[..., :3], a[..., 3]
    hh, ww = al.shape
    neutral = ((rgb.max(2) - rgb.min(2)) <= 16) & (rgb.min(2) >= 185)
    bg = neutral | (al < 40)
    gone = np.zeros((hh, ww), bool)
    q = deque((y, x) for y in range(hh) for x in (0, ww - 1))
    q.extend((y, x) for x in range(ww) for y in (0, hh - 1))
    while q:
        y, x = q.popleft()
        if gone[y, x] or not bg[y, x]:
            continue
        gone[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < hh and 0 <= xx < ww and not gone[yy, xx]:
                q.append((yy, xx))
    out = np.dstack([rgb.astype(np.uint8), np.where(gone, 0, 255).astype(np.uint8)])
    img = Image.fromarray(out, 'RGBA')
    return img.crop(img.getbbox())


for n in range(1, 6):
    src = cutout(os.path.join(ROOT, f'city_house_{n}.png'))
    w = min(MAXW, round(src.width * (H - 2) / src.height))
    s = shrink(src, w)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(s, ((W - s.width) // 2, H - s.height - 1))
    c.save(os.path.join(ROOT, f'sp_b_cityHouse{n}.png'), optimize=True)
    print('pasang', f'sp_b_cityHouse{n}.png', c.size, '← isi', s.size)
