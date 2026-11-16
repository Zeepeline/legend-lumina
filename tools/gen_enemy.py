#!/usr/bin/env python3
"""Potong lembar musuh dari ChatGPT (assets/raw/enemy/<id>.png, 4 kolom × 6 baris, latar magenta) jadi atlas game.
Baris: idle, move, wind (ancang-ancang), atk, hurt (2 kena + 2 terhuyung), alert (siaga). Musuh biasa tak punya animasi mati
(game memutihkan & memudarkan). Diperkecil ke TARGET_H (rata-rata kotak, alfa tegas) agar detail gambar tetap terbawa.
Keluaran: assets/img/esh_<id>.png (frame FW×FH, kaki di baris bawah, badan di tengah) + baris tambahan di ESH_META (cetak JSON).
Pemakaian: python3 tools/gen_enemy.py golem [frog ...]"""
import json, sys
import numpy as np
from PIL import Image
sys.path.insert(0, 'tools')
from gen_hero import frames_of

# tinggi badan di game (px) pada pose diam; Arka ±33 px
TARGET_H = {'golem': 50, 'frog': 20, 'boar': 26, 'bee': 16, 'plant': 36, 'snake': 16, 'wisp': 18, 'ghost': 36,
            'shroom': 30, 'bat': 18, 'skel': 34, 'salam': 16, 'mimic': 22}

def dejunk(sm):
    """buang semburat magenta di tepi (sisa latar yang tercampur garis gelap) → coklat gelap netral"""
    c = sm[..., :3].astype(int); r, g, b = c[..., 0], c[..., 1], c[..., 2]
    bad = (sm[..., 3] > 0) & (r - g > 35) & (b - g > 35) & (abs(r - b) < 90)
    L = (.3 * r + .59 * g + .11 * b) * .7
    sm[bad, 0] = (L * 1.0)[bad]; sm[bad, 1] = (L * .78)[bad]; sm[bad, 2] = (L * .72)[bad]
    # piksel tepi yang sangat magenta (hampir latar) dibuang
    pink = (sm[..., 3] > 0) & (r > 170) & (b > 150) & (g < 120)
    sm[pink, 3] = 0

ROWS = ['idle', 'move', 'wind', 'atk', 'hurt', 'alert']

def shrink_to(im, bg, y0, y1, x0, x1, f):
    """potong area (dengan tepi 6 px) lalu perkecil faktor f dengan rata-rata kotak (premultiplied), alfa > 50%"""
    y0, x0 = max(0, y0 - 6), max(0, x0 - 6); y1, x1 = y1 + 6, x1 + 6
    rgb = im[y0:y1, x0:x1].astype(float); a = (~bg[y0:y1, x0:x1]).astype(float)
    pm = np.dstack([rgb * a[..., None], a * 255]).clip(0, 255).astype(np.uint8)
    w, h = max(1, round((x1 - x0) / f)), max(1, round((y1 - y0) / f))
    s2 = np.array(Image.fromarray(pm).resize((w, h), Image.BOX)).astype(float)
    al = s2[..., 3:4]; col = np.where(al > 0, s2[..., :3] / np.maximum(al, 1) * 255, 0).clip(0, 255)
    out = np.dstack([col, np.where(al[..., 0] > 128, 255, 0)]).astype(np.uint8)
    return out, y0, x0

def build(eid):
    im, mask, rows, cols = frames_of(f'assets/raw/enemy/{eid}.png')
    if len(rows) != 6: print(f'{eid}: {len(rows)} baris (harus 6)', file=sys.stderr)
    bg = ~mask
    idle_h = np.median([b[1] - b[0] for b in rows[0]])
    f = idle_h / TARGET_H.get(eid, 32)
    cut = []
    for rw in rows[:6]:
        base = max(b[1] for b in rw); fr = []
        for (y0, y1, x0, x1) in rw[:4]:
            ci = int(np.argmin(abs(cols - (x0 + x1) / 2)))
            small, ys, xs = shrink_to(im, bg, y0, y1, x0, x1, f)
            dejunk(small)
            fr.append((small, (cols[ci] - xs) / f, (base - ys) / f))
        cut.append(fr)
    # ukuran frame dari jangkauan terjauh terhadap titik jangkar (tengah kolom, garis kaki)
    L = R = U = 0
    for fr in cut:
        for sm, cx, by in fr:
            a = np.argwhere(sm[..., 3] > 0)
            if not len(a): continue
            L = max(L, cx - a[:, 1].min()); R = max(R, a[:, 1].max() + 1 - cx); U = max(U, by - a[:, 0].min())
    half = int(np.ceil(max(L, R))) + 1; FW, FH = half * 2, int(np.ceil(U)) + 2
    atlas = np.zeros((FH * 6, FW * 4, 4), np.uint8)
    for r, fr in enumerate(cut):
        for c, (sm, cx, by) in enumerate(fr):
            dx, dy = int(round(half - cx)), int(round(FH - 1 - by))
            h, w = sm.shape[:2]; f = np.zeros((FH, FW, 4), np.uint8)
            sy0, sx0, ty0, tx0 = max(0, -dy), max(0, -dx), max(0, dy), max(0, dx)
            hh, ww = min(h - sy0, FH - ty0), min(w - sx0, FW - tx0)
            if hh > 0 and ww > 0: f[ty0:ty0 + hh, tx0:tx0 + ww] = sm[sy0:sy0 + hh, sx0:sx0 + ww]
            atlas[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = f
    Image.fromarray(atlas).save(f'assets/img/monsters/esh_{eid}.png', optimize=True)
    prev = Image.fromarray(atlas); prev.resize((prev.width * 4, prev.height * 4), Image.NEAREST).save(f'assets/raw/enemy/{eid}_cut.png')
    body_h = max(by - (np.argwhere(sm[..., 3] > 0)[:, 0].min()) for sm, cx, by in cut[0])
    return {'fw': FW, 'fh': FH, 'h': int(round(body_h))}

if __name__ == '__main__':
    out = {e: build(e) for e in sys.argv[1:]}
    print(json.dumps(out))
