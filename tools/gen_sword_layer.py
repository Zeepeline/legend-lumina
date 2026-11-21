#!/usr/bin/env python3
"""Lapisan pedang Arka yang DIGAMBAR PER FRAME (pedang + kepalan sudah menempel di tangan, tanpa penyetelan piksel saat main).
Keluaran: assets/img/hero/hero_swl{0,1}.png  (tier 0 = kayu, 1 = besi). Sel 80x112; badan 48x40 ditaruh di offset (16,56) → kaki di (40,96), 16 px ruang di bawah kaki untuk ujung bilah.
Nama frame lapisan = nama frame badan (atk1_side2, idle_down1, ...). Pakai: venv/bin/python tools/gen_sword_layer.py [dir_sumber_pedang]"""
import sys, math, os
from PIL import Image
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = sys.argv[1] if len(sys.argv) > 1 else R + '/tools/sword_src'
FW, FH, LW, LH, OX, OY = 48, 40, 80, 112, 16, 56
ROW = dict(idle_down=0, walk_down=1, idle_up=2, walk_up=3, idle_side=4, walk_side_a=5, walk_side=6, atk1_down=7, atk2_down=8, atk1_up=9,
           atk2_up=10, atk1_side=11, atk2_side=12, atk3_down=13, atk3_up=14, atk3_side=15, heavy_down=16, heavy_up=17, heavy_side=18)
# titik genggam (frame badan) untuk serangan, perkiraan awal yang dikoreksi ke piksel kulit terdekat
HAND = dict(side=[(27, 27), (31, 26), (33, 26), (30, 27)], down=[(31, 30), (32, 28), (35, 27.5), (31, 30.5)], up=[(31, 29), (32, 28), (33, 24.5), (31, 29)])
# titik genggam MANUAL tiap frame tebas (dikalibrasi presisi dari arka_combo_real.aseprite; frame badan 48x40)
HAND_FIX = {
    ('atk1', 'side'): [(28.0, 27.0), (31.5, 27.0), (33.5, 27.0), (29.0, 29.5)],
    ('atk2', 'side'): [(30.0, 32.5), (32.0, 24.5), (32.5, 24.0), (29.0, 30.0)],
    ('atk3', 'side'): [(31.5, 27.0), (27.0, 21.0), (31.5, 34.0), (30.0, 30.5)],
    ('heavy', 'side'): [(27.0, 26.5), (28.0, 25.5), (29.5, 26.0), (26.5, 26.0)],
    ('atk1', 'down'): [(31.0, 30.5), (29.5, 31.5), (34.5, 28.0), (30.5, 31.5)],
    ('atk2', 'down'): [(31.5, 31.5), (33.5, 25.5), (34.5, 25.0), (31.0, 31.5)],
    ('atk3', 'down'): [(30.0, 29.5), (32.0, 19.0), (23.0, 34.5), (31.0, 31.0)],
    ('heavy', 'down'): [(31.0, 30.0), (29.5, 26.5), (33.5, 26.5), (31.0, 31.0)],
    ('atk1', 'up'): [(31.5, 26.0), (32.0, 30.0), (32.5, 29.5), (31.0, 30.5)],
    ('atk2', 'up'): [(31.5, 25.0), (33.0, 25.5), (33.0, 25.0), (31.0, 31.0)],
    ('atk3', 'up'): [(32.5, 24.0), (32.0, 18.5), (33.5, 29.5), (31.0, 31.0)],
    ('heavy', 'up'): [(31.5, 25.0), (32.5, 24.5), (31.0, 24.5), (31.0, 31.0)],
}
# sudut bilah per frame (dikalibrasi presisi dari arka_combo_real.aseprite)
ANG = {
    'side': dict(atk1=[-2.1, -0.8, 0.5, 1.1], atk2=[1.8, 0.3, -0.8, -1.3], atk3=[0.0, 0.0, 0.0, 0.0], heavy=[-2.5, -1.4, 0.2, 1.2]),
    'down': dict(atk1=[-1.9, -.6, 1.2, 1.7], atk2=[2.2, 1.6, .6, -.1], atk3=[-2.0, -.8, 1.3, 1.6], heavy=[-2.2, -1.2, 1.0, 1.6]),
    'up': dict(atk1=[.6, -.3, -1.2, -1.5], atk2=[-2.2, -1.8, -1.0, -.4], atk3=[.8, -.2, -1.3, -1.6], heavy=[1.2, .2, -1.0, -1.6]),
}
# siaga: sudut bilah terkulai + titik genggam awal (frame badan) untuk baris diam/jalan
HOLD_ANG = dict(side=-.25, down=-1.2, up=-1.2)  # bilah tegak di sisi badan (dulu terkulai ke bawah menembus kaki)
HOLD_HAND = dict(side=(23.5, 34.5), down=(32, 31), up=(32, 29))

def skin(px):
    r, g, b, a = px
    return a > 200 and r >= 205 and 115 <= g <= 228 and 100 <= b <= 200 and r - b >= 40 and r - g >= 25

def blobs(body, hx, hy, rad):
    """bercak kulit (8-tetangga) dalam radius rad dari (hx,hy) → daftar (jumlah, pusat x, pusat y)"""
    pts = {(x, y) for y in range(FH) for x in range(FW) if skin(body.getpixel((x, y))) and math.hypot(x - hx, y - hy) <= rad}
    out = []
    while pts:
        st = [pts.pop()]; comp = list(st)
        while st:
            x, y = st.pop()
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    q = (x + dx, y + dy)
                    if q in pts: pts.remove(q); st.append(q); comp.append(q)
        out.append((len(comp), sum(x + .5 for x, _ in comp) / len(comp), sum(y + .5 for _, y in comp) / len(comp)))
    return out

def anchor(body, hx, hy, rad):
    """pusat bercak kulit terdekat dari perkiraan (min 2 piksel); tanpa bercak → perkiraan itu sendiri"""
    bl = [b for b in blobs(body, hx, hy, rad) if b[0] >= 2]
    if not bl: return (hx + .5, hy + .5), False
    n, x, y = min(bl, key=lambda b: math.hypot(b[1] - hx - .5, b[2] - hy - .5) - b[0] * .3)
    return (x, y), True

def stamp(dst, spr, cx, cy, ang, pivot):
    """tempel spr diputar `ang` rad (nearest, tanpa lubang) dengan titik putar `pivot` (px sumber) diletakkan di (cx,cy) piksel dst"""
    ca, sa = math.cos(ang), math.sin(ang); w, h = spr.size; ext = int(max(w, h)) + 2
    for y in range(int(cy) - ext, int(cy) + ext + 1):
        for x in range(int(cx) - ext, int(cx) + ext + 1):
            dx, dy = x + .5 - cx, y + .5 - cy
            u, v = dx * ca + dy * sa + pivot[0], -dx * sa + dy * ca + pivot[1]
            if 0 <= u < w and 0 <= v < h and 0 <= x < dst.width and 0 <= y < dst.height:
                p = spr.getpixel((int(u), int(v)))
                if p[3] > 20: dst.putpixel((x, y), p)

def build(tier, body_img, alt_img=None):
    sword = Image.open(f'{SRC}/sword{tier}.png').convert('RGBA'); fist = Image.open(f'{SRC}/fist_grip.png').convert('RGBA')
    pv = (sword.width * 5 / 22, sword.height / 2)
    rows = len(ROW); out = Image.new('RGBA', (4 * LW, rows * LH), (0, 0, 0, 0)); info = {}
    for name, r in ROW.items():
        sd = name.rsplit('_', 1)[1] if not name.endswith('side_a') else 'side'
        if name.startswith('walk_side') or name.startswith('idle_side'): sd = 'side'
        kind = name.split('_')[0]
        for f in range(4):
            body = body_img.crop((f * FW, r * FH, f * FW + FW, r * FH + FH))
            alt = alt_img.crop((f * FW, r * FH, f * FW + FW, r * FH + FH)) if alt_img else None
            cell = Image.new('RGBA', (LW, LH), (0, 0, 0, 0))
            if kind in ('atk1', 'atk2', 'atk3', 'heavy'):
                ang = ANG[sd][kind][f]
                if (kind, sd) in HAND_FIX: (ax, ay), ok = HAND_FIX[(kind, sd)][f], True
                else: hx, hy = HAND[sd][f]; (ax, ay), ok = anchor(body, hx, hy, 5)
                if not ok and alt: (ax, ay), ok = anchor(alt, hx, hy, 5)
            else:
                hx, hy = HOLD_HAND[sd]; (ax, ay), ok = anchor(body, hx, hy, 5); ang = HOLD_ANG[sd]
                if not ok and alt: (ax, ay), ok = anchor(alt, hx, hy, 5)
            cx, cy = ax + OX, ay + OY
            stamp(cell, sword, cx, cy, ang, pv); stamp(cell, fist, cx, cy, ang, (fist.width / 2, fist.height / 2))
            out.paste(cell, (f * LW, r * LH)); info[(name, f)] = (round(ax, 1), round(ay, 1), ok)
    return out, info

if __name__ == '__main__':
    body = Image.open(R + '/assets/img/hero/hero_arka.png').convert('RGBA'); alt = Image.open(R + '/assets/img/hero/hero_slave.png').convert('RGBA')
    for tier in (0, 1):
        img, info = build(tier, body, alt); img.save(f'{R}/assets/img/hero/hero_swl{tier}.png'); print('tier', tier, img.size)
    if len(sys.argv) > 2:  # kontak-sheet debug: badan + lapisan
        img, _ = build(1, body, alt); S = 4; names = sys.argv[2].split(',')
        W = Image.new('RGB', (4 * LW * S, len(names) * LH * S), (70, 110, 70))
        for i, n in enumerate(names):
            for f in range(4):
                c = Image.new('RGBA', (LW, LH), (0, 0, 0, 0)); c.paste(body.crop((f * FW, ROW[n] * FH, f * FW + FW, ROW[n] * FH + FH)), (OX, OY))
                c.alpha_composite(img.crop((f * LW, ROW[n] * LH, f * LW + LW, ROW[n] * LH + LH)))
                W.paste(c.resize((LW * S, LH * S), Image.NEAREST), (f * LW * S, i * LH * S), c.resize((LW * S, LH * S), Image.NEAREST))
        W.save(os.environ.get('DBG', '/tmp/dbg.png'))
