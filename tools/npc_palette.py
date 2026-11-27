"""Samakan sprite NPC dengan gaya tokoh utama: palet bersama 11 warna + 3 (abu muda, abu tua, cokelat; keputusan pemilik 27 Nov) (docs/CHARACTER_STYLE.md, karakter.gpl),
lalu bersih-bersih (piksel yatim, bintik, garis tepi gelap). Sumber asli disimpan di tools/npc_src/ (sekali saja).
Pakai: python3 tools/npc_palette.py [--preview]   (dari akar repo)"""
import os, sys, shutil, re
import numpy as np
from PIL import Image
sys.path.insert(0, os.path.dirname(__file__))
from sprite_clean import clean_any

PAL = np.array([(0, 0, 0), (90, 24, 33), (177, 39, 26), (175, 175, 54), (123, 147, 69), (62, 85, 128), (45, 49, 97),
                (240, 194, 113), (207, 115, 69), (172, 74, 74), (237, 214, 187),
                (176, 172, 168), (98, 96, 104), (150, 98, 62)], float)   # + abu muda, abu tua, cokelat (uban, zirah, kulit gelap)
SRC = 'tools/npc_src'
ART = 'godot/assets/art/npc'


def used():
    out = set()
    for root, _, fs in os.walk('godot'):
        for f in fs:
            if f.endswith(('.tscn', '.gd', '.tres')):
                for m in re.findall(r'res://assets/art/npc/([^"]+\.png)', open(os.path.join(root, f), errors='ignore').read()):
                    out.add(m)
    return sorted(out)


def to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    M = np.array([[0.4124, 0.3576, 0.1805], [0.2126, 0.7152, 0.0722], [0.0193, 0.1192, 0.9505]])
    xyz = c @ M.T / np.array([0.9505, 1.0, 1.089])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


PLAB = to_lab(PAL)


def recolor(im):
    a = np.array(im.convert('RGBA'))
    m = a[..., 3] > 0
    lab = to_lab(a[..., :3].astype(float))
    d = ((lab[..., None, :] - PLAB[None, None]) ** 2).sum(-1)
    a[m, :3] = PAL[d.argmin(-1)[m]].astype(np.uint8)
    a[..., 3] = np.where(m, 255, 0)
    return a


def cell_size(name, w, h):
    if name.startswith('npc_sheet_'):
        return 48, 48
    if w == 192:
        return 48, 40
    return w, h


def process(name):
    src = os.path.join(SRC, name)
    if not os.path.exists(src):
        os.makedirs(SRC, exist_ok=True)
        shutil.copy(os.path.join(ART, name), src)
    im = Image.open(src)
    a = recolor(im)
    cw, ch = cell_size(name, *im.size)
    for y in range(0, a.shape[0], ch):
        for x in range(0, a.shape[1], cw):
            c = a[y:y + ch, x:x + cw]
            if c[..., 3].any():
                a[y:y + ch, x:x + cw] = np.array(clean_any(Image.fromarray(c)))
    return Image.fromarray(a)


if __name__ == '__main__':
    for n in used():
        out = process(n)
        if '--preview' not in sys.argv:
            out.save(os.path.join(ART, n))
        else:
            os.makedirs('/tmp/gt/npc_prev', exist_ok=True)
            out.save('/tmp/gt/npc_prev/' + n)
        print('ok', n)
