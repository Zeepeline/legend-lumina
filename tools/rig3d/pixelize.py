# Olah render 3D → pixel art: palet bersama (semua frame sama warna), alfa tegas, garis tepi gelap 1 px.
# Lalu susun lembar sprite (baris = animasi×arah, kolom = frame) + GIF pratinjau.
# Pakai: python3 tools/rig3d/pixelize.py /tmp/rig3d
import sys, os, glob
from PIL import Image

D = sys.argv[1] if len(sys.argv) > 1 else '/tmp/rig3d'
DIRS = ['s', 'sw', 'w', 'nw', 'n', 'ne', 'e', 'se']
ANIMS = [('idle', 4), ('run', 8), ('slash', 6)]
OUTL = (29, 26, 36, 255)

raw = {os.path.basename(p)[:-4]: Image.open(p).convert('RGBA') for p in glob.glob(os.path.join(D, 'raw', '*.png'))}
# palet bersama 20 warna dari semua frame
F = next(iter(raw.values())).size[0]
if len(sys.argv) > 2:  # palet dari gambar acuan (mis. lembar sprite Arka asli) → warna sama persis dengan aset 2D
    src = Image.open(sys.argv[2]).convert('RGBA'); bg = Image.new('RGB', src.size, (0, 0, 0)); bg.paste(src, mask=src.split()[3])
    pal = bg.quantize(colors=28, method=Image.Quantize.MEDIANCUT)
else:
    big = Image.new('RGB', (F * 12, F * 12))
    for i, im in enumerate(list(raw.values())[:144]):
        bg = Image.new('RGB', im.size, (0, 0, 0)); bg.paste(im, mask=im.split()[3]); big.paste(bg, ((i % 12) * F, (i // 12) * F))
    pal = big.quantize(colors=20, method=Image.Quantize.MEDIANCUT)

def pix(im):
    a = im.split()[3].point(lambda v: 255 if v > 110 else 0)
    rgb = Image.new('RGB', im.size); rgb.paste(im.convert('RGB'))
    q = rgb.quantize(palette=pal, dither=Image.Dither.NONE).convert('RGBA'); q.putalpha(a)
    px = q.load(); w, h = q.size; out = q.copy(); po = out.load()
    for y in range(h):
        for x in range(w):
            if px[x, y][3]: continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and px[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): po[x, y] = OUTL
    return out

rows = [(a, n, d) for a, n in ANIMS for d in DIRS]
sheet = Image.new('RGBA', (F * 8, F * len(rows)))
frames = {}
for r, (a, n, d) in enumerate(rows):
    for f in range(n):
        p = pix(raw[f'{a}_{d}_{f}']); frames[(a, d, f)] = p; sheet.paste(p, (f * F, r * F))
sheet.save(os.path.join(D, 'arka3d_sheet.png'))

# GIF pratinjau: 3 baris (diam, lari, tebas) × 8 arah, latar rumput, skala ×3
S = 3; W, H = F * 8, F * 3
gif = []
for t in range(24):
    im = Image.new('RGBA', (W, H), (74, 112, 54, 255))
    for ri, (a, n) in enumerate(ANIMS):
        for di, d in enumerate(DIRS):
            fr = frames[(a, d, t % n)]; im.alpha_composite(fr, (di * F, ri * F))
    gif.append(im.resize((W * S // 2, H * S // 2), Image.NEAREST).convert('RGB'))
gif[0].save(os.path.join(D, 'arka3d_preview.gif'), save_all=True, append_images=gif[1:], duration=110, loop=0)
print('ok', sheet.size, len(frames))
