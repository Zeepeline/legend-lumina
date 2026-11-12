"""Bersihkan aset sesuai docs/VALIDATION_RULES.md & ART_BIBLE.md.
- alpha dibuat tegas (tanpa anti-aliasing)
- potongan kecil yang terpisah dibuang (hanya bagian terbesar + yang menempel)
- garis tepi hitam murni diganti garis berwarna (warna tetangga digelapkan, sedikit kebiruan)
- dipangkas rapat + 1 px ruang
Pakai: python3 tools/clean_asset.py masuk.png keluar.png [--skala 0.62]
"""
import sys, numpy as np
from PIL import Image
from scipy import ndimage

def clean(src, dst, scale=1.0):
    im = Image.open(src).convert('RGBA')
    if scale != 1.0: im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.NEAREST)
    a = np.array(im).astype(int); al = a[:, :, 3]; op = al >= 128
    lab, n = ndimage.label(op)
    if n > 1:
        sizes = ndimage.sum(op, lab, range(1, n + 1)); keep = sizes >= max(40, sizes.max() * .04)
        op = np.isin(lab, np.nonzero(keep)[0] + 1)
    rgb = a[:, :, :3]
    edge = op & ~ndimage.binary_erosion(op, iterations=2)
    dark = edge & (rgb.max(axis=2) < 40)
    inner = op & ~dark & (rgb.max(axis=2) >= 40)
    if inner.any():
        idx = ndimage.distance_transform_edt(~inner, return_distances=False, return_indices=True)
        near = rgb[idx[0], idx[1]]
        col = near * .42; col[:, :, 2] += 18  # gelap & sedikit kebiruan (bayangan dingin)
        rgb = np.where(dark[:, :, None], np.clip(col, 0, 255), rgb)
    out = np.zeros_like(a); out[:, :, :3] = rgb; out[:, :, 3] = np.where(op, 255, 0)
    ys, xs = np.nonzero(op)
    out = out[max(0, ys.min() - 1):ys.max() + 2, max(0, xs.min() - 1):xs.max() + 2]
    Image.fromarray(out.astype('uint8'), 'RGBA').save(dst)

if __name__ == '__main__':
    sc = float(sys.argv[sys.argv.index('--skala') + 1]) if '--skala' in sys.argv else 1.0
    clean(sys.argv[1], sys.argv[2], sc)
