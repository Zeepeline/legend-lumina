# Rapikan animasi PixelLab (lembar grid) → frame siap game: potong grid, sejajarkan telapak & badan, perkecil ke skala
# sprite Arka (tinggi tubuh ≈ 34 px), warna dibatasi 32 (palet lembar itu sendiri), tepi tegas. Juga pratinjau MP4.
# Pakai: python3 tools/pixellab/prep_anim.py <lembar.png> <nama> [kolom baris] [tinggi_tubuh] → assets/raw/pixellab/<nama>_*.png
import sys, os, subprocess, tempfile
import numpy as np
from PIL import Image

src, name = sys.argv[1], sys.argv[2]
cols, rows = (int(sys.argv[3]), int(sys.argv[4])) if len(sys.argv) > 4 else (3, 3)
TARGET = int(sys.argv[5]) if len(sys.argv) > 5 else 34
OUT = os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'raw', 'pixellab'); os.makedirs(OUT, exist_ok=True)
ref = Image.open(os.path.join(os.path.dirname(__file__), '..', '..', 'assets', 'img', 'hero', 'hero_arka.png')).convert('RGBA')

im = Image.open(src).convert('RGBA'); a = np.array(im); W, H = im.size; cw, ch = W // cols, H // rows
cells = [a[r * ch:(r + 1) * ch, c * cw:(c + 1) * cw] for r in range(rows) for c in range(cols)]
def body_mask(t):  # tubuh = tak transparan, bukan bilah/jejak (abu terang, ungu/putih pucat)
    R, G, B, A = [t[..., i].astype(int) for i in range(4)]
    blade = (np.abs(R - G) < 28) & (np.abs(G - B) < 34) & (R > 140)
    trail = ((B > R + 25) & (R > 110)) | (A < 200)
    return (A > 128) & ~blade & ~trail
info = []
for t in cells:
    m = body_mask(t); ys, xs = np.nonzero(m)
    info.append((ys.max(), int(np.median(xs)), ys.max() - ys.min()) if len(ys) else None)
hs = [i[2] for i in info if i]; s = TARGET / np.median(hs)  # skala → tinggi tubuh sama dengan Arka
FW, FH = 64, 56; BX, BY = FW // 2, FH - 4  # titik telapak di kanvas hasil
# palet dari lembar ini sendiri (warna baja pedang & jejak tetap benar), 32 warna
cat = np.concatenate([c for c in cells], axis=0); catim = Image.fromarray(cat); bgc = Image.new('RGB', catim.size, (0, 0, 0)); bgc.paste(catim.convert('RGB'), mask=catim.split()[3])
pal = bgc.quantize(colors=32, method=Image.Quantize.MEDIANCUT)
frames = []
for t, inf in zip(cells, info):
    if inf is None: continue
    foot, cx, _ = inf
    big = Image.fromarray(t); nw, nh = round(t.shape[1] * s), round(t.shape[0] * s)
    small = big.resize((nw, nh), Image.BOX); al = np.array(small)[..., 3]
    rgb = small.convert('RGB').quantize(palette=pal, dither=Image.Dither.NONE).convert('RGBA'); arr = np.array(rgb)
    arr[..., 3] = np.where(al > 110, 255, 0)
    cv = np.zeros((FH, FW, 4), np.uint8)
    ox, oy = BX - round(cx * s), BY - round(foot * s)
    ys, xs = np.nonzero(arr[..., 3]); ty, tx = ys + oy, xs + ox; ok = (ty >= 0) & (ty < FH) & (tx >= 0) & (tx < FW)
    cv[ty[ok], tx[ok]] = arr[ys[ok], xs[ok]]
    frames.append(Image.fromarray(cv))
for i, f in enumerate(frames): f.save(os.path.join(OUT, f'{name}_{i}.png'))
strip = Image.new('RGBA', (FW * len(frames), FH))
for i, f in enumerate(frames): strip.paste(f, (i * FW, 0))
strip.save(os.path.join(OUT, f'{name}_strip.png'))
# pratinjau: Arka asli (diam) di samping animasi, ×6, MP4 berulang 3×
idle = ref.crop((0, 0, 48, 40)); S = 6; tmp = tempfile.mkdtemp(); k = 0
for rep in range(3):
    for f in frames:
        v = Image.new('RGBA', (FW * 2, FH), (74, 112, 54, 255)); v.alpha_composite(idle, ((FW - 48) // 2, FH - 40 - 2)); v.alpha_composite(f, (FW, 0))
        img = v.resize((FW * 2 * S, FH * S), Image.NEAREST).convert('RGB')
        for _ in range(6): img.save(os.path.join(tmp, '%05d.png' % k)); k += 1
mp4 = os.path.join('/tmp/probe', f'{name}.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '60', '-i', os.path.join(tmp, '%05d.png'), '-c:v', 'libx264', '-preset', 'veryfast',
                '-pix_fmt', 'yuv420p', '-crf', '18', mp4], check=True)
print('frame', len(frames), 'skala', round(s, 3), 'tinggi tubuh', [round(h * s) for h in hs], '→', mp4)
