"""Bangunan desa/kota dari gambar referensi pemilik (assets/img/buildings/ref_house_small.png & ref_house_big.png).

Atap biru referensi diwarnai ulang (merah/cokelat) dengan gelap-terang tetap, diperkecil halus ke ukuran game,
lalu diberi pelengkap khas (tenda toko + peti buah, tungku & landasan pandai besi, ikon papan nama).
Hasil: assets/img/buildings/sp_<kunci>.png berukuran persis kanvas lama (rata bawah, tengah) — dipasang oleh
src/systems/sprout_houses.js. Jalankan ulang setelah mengganti referensi:  python3 tools/bake_houses.py
"""
import os
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = os.path.join(os.path.dirname(__file__), '..', 'assets', 'img', 'buildings')
OL = (40, 28, 30, 255)
RAMP = {
    'red': [(74, 28, 32), (118, 40, 42), (160, 58, 52), (196, 86, 66), (226, 126, 94)],
    'brown': [(58, 36, 30), (94, 58, 40), (130, 84, 56), (164, 114, 76), (192, 148, 100)],
}


def recolor_roof(img, ramp):
    a = np.asarray(img).astype(float)
    r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
    L = r + g + b
    roof = (al > 0) & (b - r > 18) & (L < 330)
    lo, hi = np.percentile(L[roof], 4), np.percentile(L[roof], 97)
    t = np.clip((L - lo) / (hi - lo), 0, 1) ** 1.35 * (len(ramp) - 1)  # nada tengah lebih tua
    i0 = np.floor(t).astype(int)
    i1 = np.minimum(i0 + 1, len(ramp) - 1)
    f = (t - i0)[..., None]
    R = np.array(ramp, float)
    col = R[i0] * (1 - f) + R[i1] * f
    a[..., :3] = np.where(roof[..., None], col, a[..., :3])
    # bayangan tanah sisa latar (toska gelap) → bayangan netral
    sh = (al > 0) & (g > r + 25) & (b > r + 20) & (L < 300) & ~roof
    a[..., 0] = np.where(sh, 40, a[..., 0]); a[..., 1] = np.where(sh, 52, a[..., 1]); a[..., 2] = np.where(sh, 40, a[..., 2])
    a[..., 3] = np.where(sh, 90, a[..., 3])
    return Image.fromarray(a.astype(np.uint8), 'RGBA')


def shrink(img, w):
    h = round(img.height * w / img.width)
    s = img.resize((w, h), Image.LANCZOS)
    s = s.filter(ImageFilter.UnsharpMask(radius=1, percent=70, threshold=2))
    a = np.asarray(s).copy()
    a[..., 3] = np.where(a[..., 3] >= 128, 255, 0)  # tepi tegas: tanpa pinggiran warna
    return Image.fromarray(a, 'RGBA')


def place(canvas_wh, house, dx=0):
    W, H = canvas_wh
    c = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    c.alpha_composite(house, (round((W - house.width) / 2) + dx, H - house.height - 1))
    return c


def awning(d, x0, y0, w, h):
    stripes = [(240, 234, 222, 255), (196, 66, 60, 255)]
    for k in range(w):
        col = stripes[(k // 4) % 2]
        sag = 1 if (k // 4) % 2 else 0
        d.line([(x0 + k, y0), (x0 + k, y0 + h + sag)], fill=col)
    d.line([(x0, y0 - 1), (x0 + w - 1, y0 - 1)], fill=OL)
    for k in range(w):
        d.point((x0 + k, y0 + h + 1 + ((k // 4) % 2)), fill=OL)


def crate(d, x0, y0, w, h, fruits=True):
    d.rectangle([x0, y0, x0 + w, y0 + h], fill=(150, 98, 62, 255), outline=OL)
    d.line([(x0 + 1, y0 + h // 2), (x0 + w - 1, y0 + h // 2)], fill=(112, 70, 48, 255))
    if fruits:
        cols = [(226, 72, 60, 255), (246, 186, 70, 255), (150, 196, 82, 255)]
        for k in range(1, w - 1, 3):
            d.ellipse([x0 + k, y0 - 3, x0 + k + 2, y0 - 1], fill=cols[(k // 3) % 3])


def forge(d, x0, base):
    d.rectangle([x0, base - 26, x0 + 24, base], fill=(132, 126, 124, 255), outline=OL)
    for yy in range(base - 22, base, 5):
        d.line([(x0 + 1, yy), (x0 + 23, yy)], fill=(104, 98, 98, 255))
        off = 0 if (yy // 5) % 2 else 6
        for xx in range(x0 + 3 + off, x0 + 23, 12):
            d.line([(xx, yy - 4), (xx, yy)], fill=(104, 98, 98, 255))
    d.rectangle([x0 + 5, base - 14, x0 + 19, base - 2], fill=(60, 30, 28, 255), outline=OL)
    d.rectangle([x0 + 7, base - 11, x0 + 17, base - 3], fill=(236, 110, 50, 255))
    d.rectangle([x0 + 9, base - 8, x0 + 15, base - 3], fill=(255, 206, 96, 255))
    d.rectangle([x0 + 8, base - 40, x0 + 16, base - 26], fill=(104, 98, 98, 255), outline=OL)


def anvil(d, x0, base):
    d.polygon([(x0, base - 9), (x0 + 16, base - 9), (x0 + 19, base - 7), (x0 + 13, base - 6), (x0 + 11, base - 3),
               (x0 + 13, base), (x0 + 3, base), (x0 + 5, base - 3), (x0 + 3, base - 6)], fill=(78, 80, 90, 255), outline=OL)
    d.line([(x0 + 1, base - 8), (x0 + 15, base - 8)], fill=(150, 154, 166, 255))


def sign_icon(d, cx, cy, kind):
    if kind == 'hammer':
        d.line([(cx - 3, cy + 2), (cx + 2, cy - 2)], fill=(230, 220, 200, 255), width=1)
        d.rectangle([cx + 1, cy - 4, cx + 4, cy - 1], fill=(200, 200, 210, 255), outline=OL)
    elif kind == 'apple':
        d.ellipse([cx - 2, cy - 2, cx + 2, cy + 2], fill=(226, 72, 60, 255))
        d.point((cx, cy - 3), fill=(110, 160, 80, 255))


def bake():
    small = Image.open(os.path.join(ROOT, 'ref_house_small.png')).convert('RGBA')
    big = Image.open(os.path.join(ROOT, 'ref_house_big.png')).convert('RGBA')
    out = {}
    # rumah merah kecil (houseA, rumah merah desa)
    for key, (W, H), w in [('houseA', (100, 132), 96), ('house_red_cottage', (131, 120), 122)]:
        out[key] = place((W, H), shrink(recolor_roof(small, RAMP['red']), w))
    # rumah cokelat bersayap (houseB, rumah cokelat desa)
    for key, (W, H), w in [('houseB', (100, 132), 100), ('house_brown_cottage', (117, 120), 116)]:
        out[key] = place((W, H), shrink(recolor_roof(big, RAMP['brown']), w))
    # toko (houseC): rumah besar atap merah + tenda + peti buah + ikon apel di papan
    h = shrink(recolor_roof(big, RAMP['red']), 92)
    c = place((100, 132), h, dx=-4)
    d = ImageDraw.Draw(c)
    hx = round((100 - h.width) / 2) - 4
    hy = 132 - h.height - 1
    awning(d, hx + 59, hy + 62, 30, 4)
    crate(d, hx + 64, 124, 18, 6)
    sign_icon(d, hx + 46, hy + 66, 'apple')
    out['houseC'] = c
    # pandai besi: rumah besar atap merah + tungku (kiri) + landasan + ikon palu
    h = shrink(recolor_roof(big, RAMP['red']), 104)
    c = place((135, 125), h, dx=8)
    d = ImageDraw.Draw(c)
    hx = round((135 - h.width) / 2) + 8
    hy = 125 - h.height - 1
    forge(d, hx - 18, 123)
    anvil(d, hx + 74, 123)
    sign_icon(d, hx + 52, hy + 75, 'hammer')
    out['blacksmith_forge'] = c
    for k, im in out.items():
        im.save(os.path.join(ROOT, 'sp_%s.png' % k), optimize=True)
        print('tulis sp_%s.png' % k, im.size)


if __name__ == '__main__':
    bake()
