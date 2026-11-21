# Arah lain untuk tebasan Arka: pose serangan ASLI dari lembar sprite (ChatGPT, tanpa pedang) + pedang PIXELLAB persis
# (diambil dari frame tebasan hadap depan) ditempel di kepalan tiap frame, diputar RotSprite, + jejak tebasan bergaya PixelLab.
# Hasil sama ukuran/kanvas dengan prep_anim.py (64×56, telapak di y=52) → arah: e (timur), w (barat = cermin), n (utara).
# Pakai: python3 tools/pixellab/sword_dirs.py
import os, sys, math, subprocess, tempfile
import numpy as np
from PIL import Image, ImageDraw
HERE = os.path.dirname(__file__); sys.path.insert(0, os.path.join(HERE, '..', 'rig2d'))
import arka_cutout as A  # scale2x untuk RotSprite

RAW = os.path.join(HERE, '..', '..', 'assets', 'raw', 'pixellab')
SHEET = np.array(Image.open(os.path.join(HERE, '..', '..', 'assets', 'img', 'hero', 'hero_arka.png')).convert('RGBA'))
FW, FH, BY = 64, 56, 52

# ── pedang bergaya PixelLab (palet diambil dari pedang di frame tebasan depan): bilah putih krem, bayangan ungu muda,
#    garis tepi magenta tua, pelindung emas; panjang genggaman→ujung 18 px (sama dengan hasil PixelLab yang diperkecil)
PC = {'k': (98, 1, 63, 255), 'K': (26, 7, 18, 255), 'w': (242, 236, 226, 255), 'l': (159, 137, 180, 255), 'm': (128, 101, 133, 255),
      'g': (193, 124, 64, 255), 'G': (232, 176, 96, 255), 'h': (110, 62, 40, 255)}
SWORD_ROWS = [  # menghadap kanan; genggaman di kolom 2 baris 4
    '....KK..................',
    '...KGGK.................',
    '..KKGgK.kkkkkkkkkkkkk...',
    'KKhhGgKkwwwwwwwwwwwwwkk.',
    'KhhhGgKkwwwwwwwwwwwwwwwk',
    'KKhhGgKkllllllllllllmkk.',
    '..KKGgK.kkkkkkkkkkkkk...',
    '...KGGK.................',
    '....KK..................']
SWD = np.zeros((40, 40, 4), np.uint8); GRIP = (14, 20)
for y, r in enumerate(SWORD_ROWS):
    for x, ch in enumerate(r):
        if ch in PC: SWD[GRIP[1] - 4 + y, GRIP[0] - 2 + x] = PC[ch]
SW_BASE = 0.0; SW_LEN = 21.0

def rotsprite(img, piv, ang):
    if abs(ang) < .5: return img
    s8 = A.scale2x(A.scale2x(A.scale2x(img)))
    return np.array(Image.fromarray(s8).rotate(ang, resample=Image.NEAREST, center=(piv[0] * 8 + 4, piv[1] * 8 + 4)).resize((img.shape[1], img.shape[0]), Image.NEAREST))

def paste(cv, img, at):
    ys, xs = np.nonzero(img[..., 3] > 128); ty, tx = ys + at[1], xs + at[0]
    ok = (ty >= 0) & (ty < FH) & (tx >= 0) & (tx < FW); cv[ty[ok], tx[ok]] = img[ys[ok], xs[ok]]

def frame(row, col): return SHEET[row * 40:row * 40 + 40, col * 48:col * 48 + 48]

def fist(f, side):  # kepalan = gugus kulit di bawah wajah yang paling depan (side: +1 kanan, −1 kiri, 0 terbawah)
    R, G, B, Al = [f[..., i].astype(int) for i in range(4)]
    skin = (Al > 0) & (R > 190) & (G > 130) & (R - B > 55); skin[:24] = False
    ys, xs = np.nonzero(skin)
    if not len(xs): return None
    if side == 0: i = np.argmax(ys)
    else: i = np.argmax(xs * side + ys * .2)
    sel = (np.abs(xs - xs[i]) <= 2) & (np.abs(ys - ys[i]) <= 2)
    return float(xs[sel].mean()), float(ys[sel].mean())

def place_body(f):
    ys, xs = np.nonzero(f[..., 3] > 0); ox = FW // 2 - int(np.median(xs)); oy = BY - ys.max()
    cv = np.zeros((FH, FW, 4), np.uint8); paste(cv, f, (ox, oy)); return cv, ox, oy

def tip(g, ang): r = math.radians(ang); return g[0] + math.cos(r) * SW_LEN, g[1] - math.sin(r) * SW_LEN

def smear(cv, g0, a0, g1, a1, col_in=(240, 236, 250, 255), col_out=(176, 160, 226, 255)):
    """jejak tebasan: bidang antara dua pose bilah (bagian luar terang, tepi ungu muda) seperti PixelLab"""
    im = Image.fromarray(cv); d = ImageDraw.Draw(im); outer, inner = [], []
    for j in range(9):
        u = j / 8; g = (g0[0] + (g1[0] - g0[0]) * u, g0[1] + (g1[1] - g0[1]) * u); a = a0 + (a1 - a0) * u
        r = math.radians(a); outer.append((g[0] + math.cos(r) * (SW_LEN + 1), g[1] - math.sin(r) * (SW_LEN + 1)))
        inner.append((g[0] + math.cos(r) * SW_LEN * .45, g[1] - math.sin(r) * SW_LEN * .45))
    d.polygon(outer + inner[::-1], fill=col_out); d.polygon(outer + [((o[0] * 2 + i[0]) / 3, (o[1] * 2 + i[1]) / 3) for o, i in zip(outer[::-1], inner[::-1])], fill=col_in)
    return np.array(im)

def build(spec, side):
    """spec: [(baris, kolom, sudut_bilah, jejak_dari_frame_sebelumnya, pedang_di_belakang)]"""
    out, prev = [], None
    for row, col, ang, trail, behind in spec:
        f = frame(row, col); body, ox, oy = place_body(f); fp = fist(f, side)
        g = (fp[0] + ox, fp[1] + oy); sw = rotsprite(SWD, GRIP, ang - SW_BASE)
        if os.environ.get('DBG'): print(row, col, 'kepalan', fp)
        cv = np.zeros((FH, FW, 4), np.uint8)
        if trail and prev: cv = smear(cv, prev[0], prev[1], g, ang)
        if behind: paste(cv, sw, (round(g[0] - GRIP[0]), round(g[1] - GRIP[1])))
        m = body[..., 3] > 0; cv[m] = body[m]
        if not behind: paste(cv, sw, (round(g[0] - GRIP[0]), round(g[1] - GRIP[1])))
        out.append(cv); prev = (g, ang)
    return out

# timur (hadap kanan): diam → ancang-ancang atas-belakang → ayun (jejak) → gerak lanjutan bawah-depan → kembali
EAST = [(11, 0, 35, 0, 0), (11, 1, 195, 0, 0), (12, 1, 208, 0, 0), (11, 2, 95, 1, 0), (18, 2, 10, 1, 0),
        (18, 2, -25, 1, 0), (12, 2, -20, 0, 0), (11, 3, 10, 0, 0), (11, 0, 35, 0, 0)]  # diam: pedang condong ke depan-atas
# utara (membelakangi): pedang di sisi kanan layar, ancang-ancang ke atas, tebas menyilang ke kiri (di depan tubuh → tertutup badan)
NORTH = [(2, 0, 60, 0, 0), (9, 1, 100, 0, 0), (9, 1, 125, 0, 0), (10, 1, 150, 1, 1), (10, 2, 200, 1, 1),
         (10, 2, 235, 1, 1), (9, 2, 240, 0, 1), (9, 3, 80, 0, 0), (2, 0, 60, 0, 0)]
east = build(EAST, 1); north = build(NORTH, 1)
west = [f[:, ::-1].copy() for f in east]
south = [np.array(Image.open(os.path.join(RAW, f'arka_slash_s_{i}.png')).convert('RGBA')) for i in range(9)]
for nm, fr in (('e', east), ('w', west), ('n', north)):
    for i, f in enumerate(fr): Image.fromarray(f).save(os.path.join(RAW, f'arka_slash_{nm}_{i}.png'))

# pratinjau: 4 arah berdampingan (S, E, W, N), ×5, MP4
S = 5; tmp = tempfile.mkdtemp(); k = 0
for rep in range(3):
    for i in range(9):
        v = Image.new('RGBA', (FW * 4, FH), (74, 112, 54, 255))
        for j, fr in enumerate((south, east, west, north)): v.alpha_composite(Image.fromarray(fr[i]), (j * FW, 0))
        img = v.resize((FW * 4 * S, FH * S), Image.NEAREST).convert('RGB')
        for _ in range(6): img.save(os.path.join(tmp, '%05d.png' % k)); k += 1
        if rep == 0: img.save(f'/tmp/pxl/dirs_{i}.png')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-preset', 'veryfast',
                '-pix_fmt', 'yuv420p', '-crf', '18', '/tmp/probe/arka_slash_4arah.mp4'], check=True)
print('ok')
