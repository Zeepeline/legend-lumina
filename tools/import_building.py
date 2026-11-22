"""Pasang gambar bangunan buatan pemilik (ChatGPT dll.) ke game.

  python3 tools/import_building.py <gambar.png|jpg> <tekstur> [<tekstur> ...]

- Latar polos (warna sudut gambar, mis. toska/hijau/putih) & bingkai dibuang otomatis (isi banjir dari tepi).
- Gambar diperkecil halus (sama seperti rumah referensi) agar muat di kanvas tekstur itu, rata bawah & tengah.
- Hasil: assets/img/buildings/sp_b_<tekstur>.png — dipasang otomatis oleh src/systems/ref_houses.js (REF_HOUSES.tex).
Tekstur & ukuran kanvas ada di SIZES (sama dengan gambar lama → tata letak & tabrakan tidak berubah).
Rumah (houseA/B/C, pondok merah/cokelat, pandai besi) memakai nama sp_<kunci> dari bake_houses.py; untuk
mengganti salah satunya cukup pakai tekstur di SIZES di bawah (mis. i_houseA).
"""
import os
import sys
from collections import deque
import numpy as np
from PIL import Image
from bake_houses import shrink, ROOT

SIZES = {  # tekstur: (lebar, tinggi kanvas), lebar isi maksimum
    'academy': ((270, 200), 266), 'i_market': ((100, 78), 98), 'well': ((85, 75), 82), 'windmill': ((116, 140), 112),
    'blades': ((80, 80), 80), 'shrine': ((120, 70), 118), 'i_fountain': ((83, 85), 80),
    'i_houseA': ((100, 132), 98), 'i_houseB': ((100, 132), 100), 'i_houseC': ((100, 132), 100),
    'house_red_cottage': ((131, 120), 128), 'house_brown_cottage': ((117, 120), 116), 'blacksmith_forge': ((135, 125), 133),
    'gatehouse': ((197, 128), 197), 'cwall': ((68, 76), 68), 'ctower': ((67, 110), 67),
}
OUTNAME = {'i_houseA': 'sp_houseA', 'i_houseB': 'sp_houseB', 'i_houseC': 'sp_houseC', 'house_red_cottage': 'sp_house_red_cottage',
           'house_brown_cottage': 'sp_house_brown_cottage', 'blacksmith_forge': 'sp_blacksmith_forge'}


def cutout(path, tol=60):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(int)
    H, W, _ = a.shape
    # bingkai gelap di tepi (tangkapan layar) dilewati: cari warna latar dari titik 4% ke dalam
    bg = np.median(np.array([a[int(H * .04), int(W * .04)], a[int(H * .04), int(W * .96)], a[int(H * .96), int(W * .04)],
                             a[int(H * .96), int(W * .96)]]), 0)
    dist = np.abs(a - bg).sum(2)
    near = dist <= tol
    edge = np.zeros((H, W), bool)
    q = deque()
    for y in range(H):
        for x in (0, W - 1):
            q.append((y, x))
    for x in range(W):
        for y in (0, H - 1):
            q.append((y, x))
    dark = a.sum(2) < 140  # bingkai gelap ikut dibuang bila menyambung ke tepi
    while q:
        y, x = q.popleft()
        if edge[y, x] or not (near[y, x] or dark[y, x]):
            continue
        edge[y, x] = True
        for dy, dx in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            yy, xx = y + dy, x + dx
            if 0 <= yy < H and 0 <= xx < W and not edge[yy, xx]:
                q.append((yy, xx))
    out = np.dstack([a.astype(np.uint8), np.where(edge, 0, 255).astype(np.uint8)])
    img = Image.fromarray(out, 'RGBA')
    return img.crop(img.getbbox())


def install(path, key):
    (W, H), maxw = SIZES[key]
    src = cutout(path)
    w = min(maxw, round(src.width * (H - 2) / src.height))  # muat lebar & tinggi
    s = shrink(src, w)
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(s, ((W - s.width) // 2, H - s.height - 1))
    name = OUTNAME.get(key, 'sp_b_' + key)
    c.save(os.path.join(ROOT, name + '.png'), optimize=True)
    print('pasang', name + '.png', c.size, '← isi', s.size)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    for k in sys.argv[2:]:
        install(sys.argv[1], k)
