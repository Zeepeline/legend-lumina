"""Bangunan lain (Akademi, kios pasar, sumur, kincir angin + baling-baling, kuil, air mancur) dirakit dari potongan
gambar referensi pemilik assets/img/buildings/ref_house_big.png (genteng slate, plester, batu, jendela, pintu, papan,
cerobong) di skala referensi (≈6× game), lalu diperkecil persis seperti rumah (tools/bake_houses.py → shrink).
Hasil: assets/img/buildings/sp_<kunci>.png berukuran kanvas lama. Jalankan:  python3 tools/bake_buildings.py
"""
import math
import os
import numpy as np
from PIL import Image, ImageDraw
from bake_houses import shrink, ROOT

REF = Image.open(os.path.join(ROOT, 'ref_house_big.png')).convert('RGBA')
K = 6.13  # piksel referensi per piksel game
OL = (33, 22, 36, 255)
WOOD = [(70, 44, 28, 255), (98, 62, 38, 255), (128, 84, 52, 255)]
STONE = [(62, 70, 72, 255), (88, 98, 96, 255), (120, 130, 124, 255)]
CLOTH = [(214, 204, 170, 255), (170, 62, 56, 255)]
WATER = [(64, 118, 128, 255), (96, 156, 160, 255), (170, 214, 206, 255)]
P = {  # potongan referensi (x0, y0, x1, y1)
    'roof': (120, 110, 360, 230), 'plaster': (430, 270, 600, 330), 'stone': (345, 570, 620, 612),
    'win': (255, 335, 378, 407), 'winw': (410, 483, 600, 562), 'door': (198, 493, 346, 612),
    'sign': (218, 433, 330, 490), 'chim': (560, 0, 652, 122),
}


def slate_tile():
    """genteng slate per keping (warna dari referensi), baris berselang-seling"""
    sw, sh = round(6.5 * K), round(4.2 * K)
    t = Image.new('RGBA', (sw * 2, sh * 2), (50, 83, 92, 255))
    d = ImageDraw.Draw(t)
    for r in range(2):
        off = 0 if r == 0 else sw // 2
        for k in range(-1, 3):
            x0, y0 = k * sw + off, r * sh
            d.rectangle([x0, y0, x0 + sw - 1, y0 + sh - 1], fill=(52, 86, 96, 255))
            d.rectangle([x0 + 3, y0 + 3, x0 + sw - 5, y0 + sh // 3], fill=(66, 102, 108, 255))
            d.line([x0, y0 + sh - 3, x0 + sw, y0 + sh - 3], fill=(28, 44, 52, 255), width=4)
            d.line([x0, y0, x0, y0 + sh], fill=(30, 48, 56, 255), width=4)
    return t


def plaster_tile():
    rng = np.random.default_rng(7)
    a = np.zeros((96, 96, 4), np.uint8)
    base = np.array([163, 161, 110])
    n = rng.normal(0, 4, (96, 96, 1))
    a[..., :3] = np.clip(base + n, 0, 255)
    spots = rng.random((96, 96)) < .015
    a[spots, :3] = [150, 146, 98]
    a[..., 3] = 255
    return Image.fromarray(a, 'RGBA')


TEX = {}


def part(name):
    if name == 'roof':
        return TEX.setdefault('roof', slate_tile())
    if name == 'plaster':
        return TEX.setdefault('plaster', plaster_tile())
    return REF.crop(P[name])


def canvas(W, H):
    return Image.new('RGBA', (round(W * K), round(H * K)), (0, 0, 0, 0))


def g(*v):
    return [round(a * K) for a in v]


def poly_tex(img, pts, tex, shade=1.0):
    """isi poligon (koordinat game) dengan tekstur referensi berulang, + garis tepi"""
    pts = [tuple(g(x, y)) for x, y in pts]
    tile = part(tex) if isinstance(tex, str) else tex
    big = Image.new('RGBA', img.size)
    for yy in range(0, img.height, tile.height):
        for xx in range(0, img.width, tile.width):
            big.paste(tile, (xx, yy))
    if shade != 1.0:
        a = np.asarray(big).astype(float)
        a[..., :3] *= shade
        big = Image.fromarray(np.clip(a, 0, 255).astype(np.uint8), 'RGBA')
    m = Image.new('L', img.size, 0)
    ImageDraw.Draw(m).polygon(pts, fill=255)
    img.paste(big, (0, 0), m)
    ImageDraw.Draw(img).line(pts + [pts[0]], fill=OL, width=7, joint='curve')


def poly(img, pts, fill, w=7):
    pts = [tuple(g(x, y)) for x, y in pts]
    d = ImageDraw.Draw(img)
    d.polygon(pts, fill=fill)
    d.line(pts + [pts[0]], fill=OL, width=w, joint='curve')


def beam(img, x0, y0, x1, y1, th=2.2):
    """balok kayu (koordinat game) dengan sisi terang & garis tepi"""
    d = ImageDraw.Draw(img)
    a, b, c, e = g(x0, y0, x1, y1)
    d.line([(a, b), (c, e)], fill=OL, width=round(th * K) + 8)
    d.line([(a, b), (c, e)], fill=WOOD[1], width=round(th * K))
    d.line([(a - 3, b - 3), (c - 3, e - 3)], fill=WOOD[2], width=max(3, round(th * K * .3)))


def paste_part(img, name, x, y, w=None):
    """tempel potongan referensi; (x, y) = kiri-atas dalam piksel game, w = lebar game (skala ikut)"""
    p = part(name)
    if w:
        p = p.resize((round(w * K), round(p.height * w * K / p.width)), Image.LANCZOS)
    img.alpha_composite(p, tuple(g(x, y)))
    return p.height / K


def ellipse(img, cx, cy, rx, ry, fill, w=7):
    ImageDraw.Draw(img).ellipse(g(cx - rx, cy - ry, cx + rx, cy + ry), fill=fill, outline=OL, width=w)


def finish(img, W, H):
    s = shrink(img, W)
    out = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    out.alpha_composite(s, (0, H - s.height))
    return out


def academy():
    W, H = 270, 200
    c = canvas(W, H)
    poly_tex(c, [(14, 98), (256, 98), (256, 196), (14, 196)], 'plaster')                      # dinding
    poly_tex(c, [(14, 158), (256, 158), (256, 196), (14, 196)], 'stone')                      # lantai batu
    for x in range(14, 257, 40):
        beam(c, x, 98, x, 158)
    beam(c, 14, 100, 256, 100); beam(c, 14, 128, 256, 128); beam(c, 14, 158, 256, 158)
    for x in [24, 64, 104, 154, 194, 234]:
        if 112 <= x <= 160:
            continue
        paste_part(c, 'win', x - 2, 106, 22)
        paste_part(c, 'winw', x - 4, 133, 26)
        paste_part(c, 'win', x, 168, 18)
    poly_tex(c, [(4, 100), (266, 100), (232, 40), (38, 40)], 'roof')                          # atap perisai
    poly_tex(c, [(38, 40), (232, 40), (226, 34), (44, 34)], 'roof', .8)                        # bubungan
    # menara tengah + jam + menara runcing
    poly_tex(c, [(116, 70), (154, 70), (154, 18), (116, 18)], 'plaster')
    beam(c, 116, 18, 154, 18); beam(c, 116, 44, 154, 44)
    ellipse(c, 135, 31, 9, 9, (226, 218, 186, 255))
    d = ImageDraw.Draw(c)
    d.line(g(135, 31, 135, 25), fill=OL, width=6); d.line(g(135, 31, 140, 32), fill=OL, width=6)
    poly_tex(c, [(110, 20), (160, 20), (135, -10 + 12)], 'roof')
    poly(c, [(135, 2), (135, -4 + 6), (148, 6), (135, 9)], (70, 100, 160, 255), 5)          # panji biru
    # pintu utama, tangga, papan nama
    paste_part(c, 'door', 120, 160, 30)
    paste_part(c, 'sign', 121, 147, 28)
    poly_tex(c, [(112, 196), (158, 196), (154, 191), (116, 191)], 'stone', 1.15)
    paste_part(c, 'chim', 54, 32, 12)
    paste_part(c, 'chim', 204, 32, 12)
    return finish(c, W, H)


def market():
    W, H = 100, 78
    c = canvas(W, H)
    beam(c, 14, 22, 14, 74, 2.6); beam(c, 86, 22, 86, 74, 2.6)
    # meja kayu
    poly(c, [(8, 50), (92, 50), (92, 75), (8, 75)], WOOD[1])
    for y in (56, 62, 68):
        ImageDraw.Draw(c).line(g(9, y, 91, y), fill=WOOD[0], width=5)
    poly(c, [(8, 46), (92, 46), (92, 51), (8, 51)], WOOD[2])
    cols = [(176, 64, 56, 255), (206, 168, 72, 255), (126, 156, 76, 255), (196, 120, 60, 255)]
    for k, x in enumerate(range(14, 88, 7)):
        ellipse(c, x, 43, 3.6, 3.2, cols[k % 4], 5)
    # tenda bergaris (miring ke depan) + rumbai
    for k in range(10):
        x0 = 4 + k * 9.2
        poly(c, [(x0 + 3, 6), (x0 + 12.2 - 3 + 3, 6), (x0 + 9.2, 26), (x0, 26)], CLOTH[k % 2], 5)
    for k in range(10):
        x0 = 4 + k * 9.2
        ImageDraw.Draw(c).pieslice(g(x0, 22, x0 + 9.2, 31), 0, 180, fill=CLOTH[k % 2], outline=OL, width=5)
    poly(c, [(6, 3), (94, 3), (95, 7), (5, 7)], WOOD[1], 5)
    # peti di samping
    poly(c, [(90, 62), (99, 62), (99, 75), (90, 75)], WOOD[2], 5)
    return finish(c, W, H)


def well():
    W, H = 85, 75
    c = canvas(W, H)
    beam(c, 20, 24, 20, 62, 2.4); beam(c, 65, 24, 65, 62, 2.4)
    poly_tex(c, [(10, 26), (75, 26), (64, 6), (21, 6)], 'roof')                              # atap kecil
    beam(c, 22, 34, 63, 34, 1.4)                                                              # poros engkol
    ImageDraw.Draw(c).line(g(42, 34, 42, 50), fill=(150, 130, 96, 255), width=5)             # tali
    poly(c, [(38, 48), (46, 48), (45, 55), (39, 55)], WOOD[2], 5)                             # ember
    # cincin batu: dinding depan (tekstur batu) + bibir atas + air
    m = Image.new('L', c.size, 0)
    dm = ImageDraw.Draw(m)
    dm.rectangle(g(14, 56, 71, 70), fill=255); dm.ellipse(g(14, 63, 71, 77), fill=255)
    tex = Image.new('RGBA', c.size)
    st = part('stone')
    for yy in range(0, c.height, st.height):
        for xx in range(0, c.width, st.width):
            tex.paste(st, (xx, yy))
    c.paste(tex, (0, 0), m)
    d = ImageDraw.Draw(c)
    d.arc(g(14, 63, 71, 77), 0, 180, fill=OL, width=7); d.line(g(14, 56, 14, 70), fill=OL, width=7); d.line(g(71, 56, 71, 70), fill=OL, width=7)
    ellipse(c, 42.5, 56, 28.5, 7.5, STONE[2])
    ellipse(c, 42.5, 56, 22, 5, WATER[0], 5)
    d.arc(g(26, 53, 50, 58), 200, 330, fill=WATER[2], width=5)
    return finish(c, W, H)


def windmill():
    W, H = 116, 140
    c = canvas(W, H)
    poly_tex(c, [(30, 136), (86, 136), (76, 46), (40, 46)], 'plaster')                       # badan menara
    poly_tex(c, [(30, 136), (86, 136), (84, 116), (32, 116)], 'stone')                       # kaki batu
    beam(c, 40, 46, 33, 116); beam(c, 76, 46, 83, 116); beam(c, 36, 82, 80, 82)
    beam(c, 38, 116, 78, 84, 1.6); beam(c, 78, 116, 38, 84, 1.6)
    paste_part(c, 'door', 47, 108, 22)
    paste_part(c, 'win', 48, 54, 20)
    poly_tex(c, [(34, 48), (82, 48), (58, 14)], 'roof')                                       # topi kerucut
    ellipse(c, 58, 70, 5.5, 5.5, WOOD[2])                                                    # poros baling-baling
    return finish(c, W, H)


def blades():
    W = 80
    c = Image.new('RGBA', (round(W * K), round(W * K)), (0, 0, 0, 0))
    cx = cy = W / 2
    for k in range(4):
        a = k * math.pi / 2 + math.pi / 4
        ux, uy, vx, vy = math.cos(a), math.sin(a), -math.sin(a), math.cos(a)
        beam(c, cx + ux * 3, cy + uy * 3, cx + ux * 38, cy + uy * 38, 2.2)
        q = [(cx + ux * r + vx * w, cy + uy * r + vy * w) for r, w in [(10, 2.5), (37, 2.5), (37, 10), (10, 10)]]
        poly(c, q, CLOTH[0], 6)
        for r in range(14, 37, 6):
            ImageDraw.Draw(c).line(g(cx + ux * r + vx * 2.5, cy + uy * r + vy * 2.5, cx + ux * r + vx * 10, cy + uy * r + vy * 10), fill=WOOD[1], width=5)
    ellipse(c, cx, cy, 4.5, 4.5, WOOD[2])
    s = shrink(c, W)
    return s


def shrine():
    W, H = 120, 70
    c = canvas(W, H)
    ellipse(c, 60, 52, 56, 16, STONE[1])
    poly_tex(c, [(4, 52), (116, 52), (116, 58), (4, 58)], 'stone')
    ellipse(c, 60, 48, 56, 15, STONE[2])
    ellipse(c, 60, 48, 30, 7.5, (90, 150, 156, 255), 6)                                     # lingkaran rune
    d = ImageDraw.Draw(c)
    for k in range(8):
        a = k * math.pi / 4
        d.ellipse(g(60 + math.cos(a) * 22 - 1.4, 48 + math.sin(a) * 5.2 - 1.2, 60 + math.cos(a) * 22 + 1.4, 48 + math.sin(a) * 5.2 + 1.2), fill=(200, 236, 226, 255))
    for px in (14, 106):                                                                     # tiang lentera batu
        poly_tex(c, [(px - 5, 50), (px + 5, 50), (px + 5, 14), (px - 5, 14)], 'stone', 1.1)
        poly(c, [(px - 4, 22), (px + 4, 22), (px + 4, 14), (px - 4, 14)], (236, 196, 110, 255), 5)
        poly_tex(c, [(px - 9, 15), (px + 9, 15), (px, 3)], 'roof')
    return finish(c, W, H)


def fountain():
    W, H = 83, 85
    c = canvas(W, H)
    ellipse(c, 41.5, 72, 39, 11, STONE[1])
    poly_tex(c, [(2.5, 66), (80.5, 66), (80.5, 73), (2.5, 73)], 'stone')
    ellipse(c, 41.5, 64, 39, 11, STONE[2])
    ellipse(c, 41.5, 64, 33, 8, WATER[1], 6)
    poly_tex(c, [(36, 64), (47, 64), (45, 36), (38, 36)], 'stone', 1.1)                     # tiang tengah
    ellipse(c, 41.5, 36, 16, 5, STONE[2])
    ellipse(c, 41.5, 35, 12, 3.4, WATER[1], 5)
    poly_tex(c, [(39, 34), (44, 34), (43, 22), (40, 22)], 'stone', 1.15)
    d = ImageDraw.Draw(c)
    for sx in (-1, 1):                                                                       # pancuran air
        d.arc(g(41.5 + sx * 2 - 14, 18, 41.5 + sx * 2 + 14, 66), 180 if sx < 0 else 270, 270 if sx < 0 else 360, fill=WATER[2], width=7)
    d.ellipse(g(39, 16, 44, 22), fill=WATER[2], outline=OL, width=5)
    return finish(c, W, H)


def bake():
    out = {'academy': academy(), 'i_market': market(), 'well': well(), 'windmill': windmill(), 'blades': blades(),
           'shrine': shrine(), 'i_fountain': fountain()}
    for k, im in out.items():
        im.save(os.path.join(ROOT, 'sp_b_%s.png' % k), optimize=True)
        print('tulis sp_b_%s.png' % k, im.size)


if __name__ == '__main__':
    bake()
