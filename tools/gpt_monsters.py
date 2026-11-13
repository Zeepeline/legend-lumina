"""Ambil sprite monster dari lembar GPT (assets/raw/gpt_monsters/sheet.png) → strip 2 frame bersih di assets/img/mon_<key>.png.
Lembar GPT = pixel art yang diperbesar & buram (tidak sejajar grid). Langkah per sprite:
  1) potong sel kolom IDLE (baris & rentang x di TABEL), ambil 2 komponen terbesar kiri→kanan (alpha >= 150)
  2) kecilkan ke ukuran frame asli game dengan "mayoritas": piksel tujuan buram/tidak → mayoritas sumber; warna = median
  3) palet dikurangi (maks 14 warna) agar warna rata khas pixel art
  4) garis tepi berwarna (bukan hitam) di sisi luar, sesuai docs/ART_BIBLE.md
Pakai: python3 tools/gpt_monsters.py [--pratinjau /tmp/pratinjau.png]
"""
import sys, json, os
import numpy as np
from PIL import Image
from scipy import ndimage as ndi

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SHEET = os.path.join(ROOT, 'assets/raw/gpt_monsters/sheet.png')
OUT = os.path.join(ROOT, 'assets/img')
L, R = (160, 238), (898, 992)  # rentang x kolom IDLE panel kiri & kanan
# key tekstur: (rentang x, y atas, y bawah, lebar frame, tinggi frame). Ukuran frame = ukuran sprite lama (tabrakan & skala tetap).
TABEL = {
    'slime': (L, 86, 120, 20, 18), 'slimeb': (L, 120, 154, 20, 18), 'slimer': (L, 154, 188, 20, 18), 'slimei': (L, 188, 222, 20, 18),
    'slimep': (L, 222, 254, 20, 18), 'slimef': (L, 254, 288, 20, 18), 'g_gold_slime': (L, 288, 316, 20, 18),
    'wolf': (L, 390, 424, 27, 16), 'wolfs': (L, 424, 458, 27, 16), 'snake': (L, 460, 490, 22, 16), 'g_gsnake': (L, 484, 528, 26, 20),
    'boar': (L, 526, 562, 26, 15), 'frog': (L, 562, 596, 22, 15), 'salam': (L, 596, 630, 22, 16),
    'bat': (L, 662, 692, 24, 15), 'batc': ((238, 330), 696, 728, 24, 15), 'bee': (L, 728, 762, 18, 13), 'wisp': (L, 760, 796, 14, 16),
    'shroom': (L, 862, 900, 20, 18), 'plant': (L, 900, 936, 20, 20), 'squeen': (L, 930, 996, 24, 24),
    'ghost': (R, 296, 336, 20, 17), 'golem': (R, 404, 452, 26, 20), 'golemi': (R, 450, 492, 26, 20), 'g_golemk': (R, 490, 530, 26, 20),
    'g_kryos': ((898, 1040), 598, 650, 30, 22), 'g_bounty_wolf': (R, 650, 692, 27, 16), 'g_bounty_frog': (R, 692, 736, 22, 16),
    'g_bounty_gargoyle': (R, 736, 780, 26, 22), 'g_king_slime': (R, 776, 822, 22, 20),
}

SPLIT = {'g_bounty_wolf', 'g_king_slime'}

def comps(cell, split=False):
    m = cell[..., 3] >= 150
    for y in range(m.shape[0]):  # buang garis tabel horizontal (deret panjang tak terputus)
        run = best = 0
        for v in m[y]:
            run = run + 1 if v else 0; best = max(best, run)
        if best > m.shape[1] * .7: m[y] = False
    m[:, :] &= ~(ndi.binary_opening(m, structure=np.ones((1, 9))) & ~ndi.binary_opening(m, structure=np.ones((3, 3))))
    lab, n = ndi.label(ndi.binary_closing(m, iterations=1))
    out = []
    for i, s in enumerate(ndi.find_objects(lab)):
        area = (lab[s] == i + 1).sum()
        if area > 40: out.append((s[1].start, s, area, i + 1))
    out.sort(key=lambda c: -c[2]); out = out[:2]; out.sort(key=lambda c: c[0])
    res = [(cell[s] * (lab[s] == k)[..., None]) for _, s, _, k in out if (s[0].stop - s[0].start) >= 6]
    if split and len(res) >= 1 and res[0].shape[1] > res[0].shape[0] * 1.5:  # dua sprite menempel → potong di kolom tersepi
        a = res[0]; col = (a[..., 3] > 0).sum(0); w = a.shape[1]
        c = w // 2 if split == 'half' else w // 3 + int(np.argmin(col[w // 3: 2 * w // 3]))
        res = [a[:, :c], a[:, c:]]
    return res

def shrink(spr, fw, fh):
    h, w = spr.shape[:2]; sc = min((fw - 2) / w, (fh - 1) / h)
    tw, th = max(1, round(w * sc)), max(1, round(h * sc))
    out = np.zeros((fh, fw, 4), np.uint8); ox, oy = (fw - tw) // 2, fh - th
    for y in range(th):
        for x in range(tw):
            blk = spr[int(y / sc):max(int(y / sc) + 1, int((y + 1) / sc)), int(x / sc):max(int(x / sc) + 1, int((x + 1) / sc))].reshape(-1, 4)
            op = blk[blk[:, 3] >= 150]
            if len(op) * 2.6 < len(blk): continue  # ambang 38%: bagian tipis (sayap, ekor) tidak hilang
            # warna: median kecerahan (hindari garis gelap mendominasi kecuali mayoritas)
            lum = op[:, :3].astype(int).sum(1); c = op[np.argsort(lum)[len(op) // 2]]
            out[oy + y, ox + x] = [c[0], c[1], c[2], 255]
    return out

def palette(a, n=14):
    m = a[..., 3] > 0
    if m.sum() == 0: return a
    img = Image.fromarray(a[..., :3]).quantize(colors=n, method=Image.MEDIANCUT, dither=Image.NONE).convert('RGB')
    q = np.array(img); out = a.copy(); out[..., :3][m] = q[m]
    return out

def outline(a):
    """sisi luar: piksel buram di tepi yang sangat gelap/hitam → warna tetangga digelapkan & sedikit kebiruan (ART_BIBLE)."""
    m = a[..., 3] > 0; edge = m & ~ndi.binary_erosion(m)
    out = a.copy()
    for y, x in zip(*np.nonzero(edge)):
        c = a[y, x, :3].astype(int)
        if c.max() > 70: continue  # bukan garis hitam
        ys, xs = slice(max(0, y - 1), y + 2), slice(max(0, x - 1), x + 2)
        nb = a[ys, xs].reshape(-1, 4); nb = nb[(nb[:, 3] > 0) & (nb[:, :3].max(1) > 70)]
        if not len(nb): continue
        base = nb[:, :3].mean(0)
        out[y, x, :3] = np.clip(base * .45 + np.array([10, 10, 30]), 0, 255).astype(np.uint8)
    return out

def main():
    sheet = np.array(Image.open(SHEET).convert('RGBA'))
    prev = []
    for key, ((x0, x1), y0, y1, fw, fh) in TABEL.items():
        cs = comps(sheet[y0:y1, x0:x1], split=key in SPLIT)
        if not cs: print('GAGAL', key); continue
        frames = [outline(palette(shrink(c, fw, fh))) for c in cs]
        if len(frames) == 1:  # satu sprite: frame 2 = sedikit memampat (napas)
            f = frames[0]; sq = np.zeros_like(f); sq[1:] = f[:-1]; frames.append(sq)
        strip = np.concatenate(frames[:2], axis=1)
        Image.fromarray(strip).save(os.path.join(OUT, 'mon_' + key + '.png'))
        prev.append((key, strip))
    json.dump({k: [v[3], v[4]] for k, v in TABEL.items()}, open(os.path.join(ROOT, 'assets/raw/gpt_monsters/frames.json'), 'w'))
    if '--pratinjau' in sys.argv:
        p = sys.argv[sys.argv.index('--pratinjau') + 1]; S = 4; W = 6
        cw, ch = 70 * S, 30 * S; img = Image.new('RGB', (cw * W, ch * ((len(prev) + W - 1) // W)), (70, 110, 70))
        for i, (k, s) in enumerate(prev):
            im = Image.fromarray(s).resize((s.shape[1] * S, s.shape[0] * S), Image.NEAREST); img.paste(im, ((i % W) * cw + 4, (i // W) * ch + 4), im)
        img.save(p)
    print(len(prev), 'sprite')

main()
