# Kombo 10 jurus "ahli pedang" dari rangka 2D Arka (tampak samping). Prinsip: rantai gerak pinggul→badan→bahu→lengan→
# pergelangan→pedang (pedang punya sudut pergelangan sendiri), ancang-ancang lambat → tebasan kilat (coretan bilah) →
# gerak lanjutan & tahan, kuda-kuda (lutut, langkah, perpindahan berat), tangan kedua ikut menggenggam, durasi per frame.
# Pakai: python3 tools/rig2d/arka_combo2.py OUT → arka_combo2.gif
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
import arka_cutout as A

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/rig2d'
CW, CH = 128, 92
BASE = (52, 70)  # titik pinggul di kanvas saat dx=dy=0

# ── potongan tampak samping (hadap kanan) dari sprite asli ──
f = A.frame(4); ref = f.copy()
HEAD = A.cut(f, 0, 47, 0, 23); ARM = A.cut(f, 18, 24, 24, 32); TORSO = A.fill_holes(f, ref)
LEGB = A.cut(TORSO, 17, 24, 34, 39); LEGF = A.cut(TORSO, 25, 33, 34, 39)
ARMB = ARM.copy(); ARMB[..., :3] = (ARMB[..., :3] * .62).astype(np.uint8)  # lengan belakang (lebih gelap)
SW, SWG = A.sword_img()
HIP, NECK, SHO, HAND, HPB, HPF = (25, 33), (25, 23), (21, 25), (21, 31), (21, 34), (28, 34)

def rot(px, py, cx, cy, ang):  # putar titik (koordinat layar, sudut CCW layar)
    r = math.radians(ang); x, y = px - cx, py - cy
    return cx + x * math.cos(r) + y * math.sin(r), cy - x * math.sin(r) + y * math.cos(r)

def blit(cv, img, piv, ang, at):
    """tempel img diputar ang° (RotSprite) di titik piv-nya, sehingga piv jatuh di 'at' (kanvas)"""
    if not img[..., 3].any(): return
    pad = int(max(img.shape[:2])); big = np.zeros((img.shape[0] + 2 * pad, img.shape[1] + 2 * pad, 4), np.uint8)
    big[pad:pad + img.shape[0], pad:pad + img.shape[1]] = img; pv = (piv[0] + pad, piv[1] + pad)
    if abs(ang) > .5:
        s8 = A.scale2x(A.scale2x(A.scale2x(big)))
        big = np.array(Image.fromarray(s8).rotate(ang, resample=Image.NEAREST, center=(pv[0] * 8 + 4, pv[1] * 8 + 4))
                       .resize((big.shape[1], big.shape[0]), Image.NEAREST))
    ys, xs = np.nonzero(big[..., 3] > 128); ty = ys - pv[1] + round(at[1]); tx = xs - pv[0] + round(at[0])
    ok = (ty >= 0) & (ty < CH) & (tx >= 0) & (tx < CW); cv[ty[ok], tx[ok]] = big[ys[ok], xs[ok]]

def pose_points(P):
    hx, hy = BASE[0] + P['dx'], BASE[1] + P['dy']
    to = lambda p: (hx + p[0] - HIP[0], hy + p[1] - HIP[1])
    t = P['t']
    sho = rot(*to(SHO), hx, hy, t); hand = rot(sho[0] + HAND[0] - SHO[0], sho[1] + HAND[1] - SHO[1], *sho, P['a'] + t)
    return (hx, hy), sho, hand

def draw(P):
    cv = np.zeros((CH, CW, 4), np.uint8); t = P['t']
    (hx, hy), sho, hand = pose_points(P); to = lambda p: (hx + p[0] - HIP[0], hy + p[1] - HIP[1])
    sw_ang = P['a'] + t + P['w']
    behind = 150 < (sw_ang % 360) < 260  # pedang di belakang kepala
    # lengan belakang: dua tangan → ikut sudut lengan depan; selain itu mengimbangi
    shoB = (sho[0] - 2, sho[1] + 1); b = P.get('b', -P['a'] * .5 + 10)
    blit(cv, ARMB, SHO, b + t, shoB)
    if behind: blit(cv, SW, SWG, sw_ang, hand)
    blit(cv, LEGB, HPB, P['lb'], (to(HPB)[0] + P['bdx'], to(HPB)[1] + P.get('bdy', 0)))
    blit(cv, TORSO, HIP, t, (hx, hy))
    blit(cv, LEGF, HPF, P['lf'], (to(HPF)[0] + P['fdx'], to(HPF)[1] + P.get('fdy', 0)))
    neck = rot(*to(NECK), hx, hy, t)
    blit(cv, HEAD, NECK, t * .5 + P.get('ht', 0), (neck[0] + P.get('hx', 0), neck[1] + P.get('hy', 0)))
    blit(cv, ARM, SHO, P['a'] + t, sho)
    if not behind: blit(cv, SW, SWG, sw_ang, hand)
    return Image.fromarray(cv), hand, sw_ang

def tip_of(hand, ang, L=len(A.SWORD) - 4): return rot(hand[0], hand[1] + L, hand[0], hand[1], ang)

READY = dict(a=55, w=55, t=4, dx=0, dy=1, lf=-8, lb=10, fdx=2, bdx=-2)  # kuda-kuda: pedang condong ke depan-atas, lutut tekuk
def K(ms, smear=False, **kw):
    p = dict(READY); p.update(kw); p['ms'] = ms; p['smear'] = smear; return p
# tiap jurus: daftar kunci-pose (ms = lama menuju pose ini). Tebasan = 1–2 kunci cepat dengan coretan.
MOVES = [
    ('1 Tebas Turun', [K(160, a=175, w=45, t=-10, dy=0, lf=-15, fdx=0, ht=4), K(50, True, a=95, w=10, t=6, dx=3),
                       K(50, True, a=25, w=-25, t=14, dx=5, dy=2, lf=-28, fdx=6, lb=22), K(140, a=12, w=-35, t=16, dx=5, dy=2, lf=-28, fdx=6, lb=22)]),
    ('2 Tebas Balik', [K(90, a=0, w=-50, t=18, dx=5, dy=2, lf=-28, fdx=6, lb=22), K(50, True, a=100, w=30, t=0, dx=6),
                       K(50, True, a=165, w=60, t=-10, dx=7, dy=0), K(150, a=178, w=70, t=-12, dx=7, ht=-3)]),
    ('3 Tebas Datar', [K(130, a=-40, w=-60, t=-8, dx=5, b=-30), K(45, True, a=40, w=-40, t=6, dx=8, b=20),
                       K(45, True, a=110, w=-10, t=12, dx=10, b=60), K(140, a=130, w=0, t=12, dx=10, b=70)]),
    ('4 Tusukan', [K(150, a=60, w=30, t=-6, dx=6, lf=-5, fdx=0, b=40), K(45, True, a=88, w=2, t=10, dx=15, lf=-35, fdx=8, lb=30, bdx=-4, b=70),
                   K(160, a=90, w=0, t=10, dx=16, lf=-35, fdx=8, lb=30, bdx=-4, b=72)]),
    ('5 Putaran', [K(110, a=90, w=0, t=0, dx=16, spin=1), K(380, a=90, w=0, t=0, dx=18, spin=1, smear=True), K(120, a=110, w=20, dx=18)]),
    ('6 Kibasan Ganda', [K(80, a=150, w=50, t=-6, dx=18), K(45, True, a=40, w=-30, t=12, dx=20, lf=-20, fdx=4),
                         K(60, a=30, w=-45, t=12, dx=20, lf=-20, fdx=4), K(45, True, a=150, w=55, t=-8, dx=21), K(120, a=160, w=60, t=-8, dx=21)]),
    ('7 Lompat Tebas', [K(150, a=40, w=20, t=8, dx=21, dy=5, lf=-30, lb=30, fdx=2, bdx=-2), K(110, a=190, w=40, t=-12, dx=24, dy=-14, lf=-40, lb=-20, fdx=2, ht=3),
                        K(70, a=200, w=50, t=-14, dx=26, dy=-15, lf=-40, lb=-20, fdx=2),
                        K(45, True, a=60, w=-10, t=14, dx=28, dy=-4, lf=-10, lb=10), K(60, True, a=15, w=-40, t=18, dx=29, dy=5, lf=-30, lb=30, fdx=5, bdx=-3),
                        K(150, a=10, w=-45, t=18, dx=29, dy=5, lf=-30, lb=30, fdx=5, bdx=-3)]),
    ('8 Sapuan Rendah', [K(120, a=-50, w=-20, t=20, dx=29, dy=6, lf=-35, lb=35, fdx=6, bdx=-5, hy=1), K(45, True, a=40, w=-45, t=24, dx=31, dy=7, lf=-35, lb=35, fdx=6, bdx=-5),
                         K(45, True, a=110, w=-50, t=24, dx=33, dy=7, lf=-35, lb=35, fdx=6, bdx=-5), K(150, a=125, w=-40, t=20, dx=33, dy=6, lf=-35, lb=35, fdx=6, bdx=-5)]),
    ('9 Terjangan', [K(140, a=70, w=25, t=-4, dx=30, dy=2, b=50), K(40, True, a=90, w=0, t=12, dx=44, lf=-35, fdx=8, lb=35, bdx=-5, b=75, ghost=1),
                     K(40, True, a=90, w=0, t=12, dx=56, lf=-35, fdx=8, lb=35, bdx=-5, b=75, ghost=1), K(160, a=92, w=-2, t=10, dx=58, lf=-35, fdx=8, lb=35, bdx=-5, b=78)]),
    ('10 Hantaman Akhir', [K(170, a=185, w=25, t=-14, dx=58, dy=-3, b=185, ht=4, lf=-20, lb=20), K(120, a=195, w=35, t=-16, dx=59, dy=-9, b=195, lf=-35, lb=-15),
                           K(45, True, a=90, w=-10, t=16, dx=61, dy=0, b=90), K(45, True, a=20, w=-50, t=22, dx=62, dy=6, b=20, lf=-35, lb=35, fdx=5, bdx=-4, slam=1),
                           K(320, a=15, w=-55, t=22, dx=62, dy=6, b=15, lf=-35, lb=35, fdx=5, bdx=-4, slam=2), K(220, **(READY | {'dx': 62}))]),
]

def lerp(p, q, u):
    o = {}
    for k in set(p) | set(q):
        a, b = p.get(k, READY.get(k, 0)), q.get(k, READY.get(k, 0))
        o[k] = a + (b - a) * u if isinstance(a, (int, float)) and isinstance(b, (int, float)) and not isinstance(a, bool) else b
    return o
def ease(u): return u * u * (3 - 2 * u)

frames = []  # (gambar, durasi)
cur = dict(READY); cur['ms'] = 0; prev_tip = None; ghosts = []
for name, keys in MOVES:
    for kp in keys:
        steps = max(1, round(kp['ms'] / 45)) if not kp.get('spin') else 9
        for s in range(1, steps + 1):
            u = s / steps; P = lerp(cur, kp, ease(u) if not kp['smear'] else u)
            P['dx'] *= .35  # kamera mengikuti pelan (Arka tetap maju, tidak lompat posisi)
            if kp.get('spin'):
                img = Image.fromarray(A.draw(['right', 'down', 'left', 'up', 'right'][min(4, int(u * 5))], {'all': (round(P['dx']) - 10, round(P['dy']) - 4)}))
                bigc = Image.new('RGBA', (CW, CH)); bigc.alpha_composite(img, (BASE[0] - A.OX - 25 + 10, BASE[1] - A.OY - 33 + 4)); img = bigc
                hand, sang = None, None
            else:
                img, hand, sang = draw(P)
            layer = Image.new('RGBA', (CW, CH)); d = ImageDraw.Draw(layer)
            hx, hy = BASE[0] + P['dx'], BASE[1] + max(P['dy'], 0)
            sh = 9 - min(5, max(0, -P['dy']) * .4)
            d.ellipse((hx - sh, BASE[1] + 6 - 2, hx + sh, BASE[1] + 6 + 2), fill=(18, 28, 14, 120))
            for g in ghosts: layer.alpha_composite(g)
            if kp['smear'] and hand is not None and prev_tip is not None:  # coretan bilah: bidang antara pose pedang sebelumnya & sekarang
                (ph, pa) = prev_tip; poly = []
                for j in range(7):
                    v = j / 6; poly.append(tip_of((ph[0] + (hand[0] - ph[0]) * v, ph[1] + (hand[1] - ph[1]) * v), pa + (sang - pa) * v))
                for j in range(6, -1, -1):
                    v = j / 6; poly.append(tip_of((ph[0] + (hand[0] - ph[0]) * v, ph[1] + (hand[1] - ph[1]) * v), pa + (sang - pa) * v, 7))
                d.polygon(poly, fill=(225, 240, 255, 150)); d.line(poly[:7], fill=(255, 255, 255, 235), width=2)
            if kp.get('spin') and kp['smear']:
                r = 26; d.arc((BASE[0] + P['dx'] - 10 - r, BASE[1] - 20 - r * .5, BASE[0] + P['dx'] - 10 + r, BASE[1] - 20 + r * .5), 0, 360 * u, fill=(235, 245, 255, 200), width=3)
            layer.alpha_composite(img)
            if P.get('slam'):
                k = min(1, s / steps) if kp.get('slam') == 1 else 1; d2 = ImageDraw.Draw(layer)
                tx, ty = tip_of(hand, sang); r = 8 + 18 * (u if kp.get('slam') == 2 else 0)
                d2.ellipse((tx - r, BASE[1] + 6 - r * .32, tx + r, BASE[1] + 6 + r * .32), outline=(255, 240, 190, int(255 * (1 - u * .8))), width=2)
                for j in range(10):
                    a2 = j * .63 + u; d2.point((tx + math.cos(a2) * r * 1.1, BASE[1] + 5 - abs(math.sin(a2)) * 10 * (1 - u)), fill=(196, 160, 110, 255))
            if P.get('ghost'): gc = img.copy(); arr = np.array(gc); arr[..., 3] = (arr[..., 3] * .35).astype(np.uint8); arr[..., :3] = (arr[..., :3] * .5 + 120).astype(np.uint8); ghosts = (ghosts + [Image.fromarray(arr)])[-2:]
            else: ghosts = []
            frames.append((layer, kp['ms'] / steps, name, bool(P.get('slam')) and kp.get('slam') == 1 and s == steps))
            if hand is not None: prev_tip = (hand, sang)
        cur = dict(kp)

S = 4; gif, dur = [], []
for img, ms, name, flash in frames:
    bg = Image.new('RGBA', (CW, CH + 12), (70, 108, 52, 255)); d = ImageDraw.Draw(bg)
    for gy in range(CH + 12 - 22, CH + 12, 3): d.line((0, gy, CW, gy), fill=(64, 100, 48, 255))
    shake = 2 if flash else 0
    bg.alpha_composite(img, (shake, 12)); d = ImageDraw.Draw(bg); d.rectangle((0, 0, CW, 11), fill=(26, 20, 12, 255)); d.text((4, 0), name, fill=(255, 236, 170, 255))
    if flash: bg = Image.blend(bg, Image.new('RGBA', bg.size, (255, 255, 240, 255)), .45)
    gif.append(bg.resize((CW * S, (CH + 12) * S), Image.NEAREST).convert('RGB')); dur.append(max(30, int(ms)))
dur[-1] = 900
gif[0].save(os.path.join(OUT, 'arka_combo2.gif'), save_all=True, append_images=gif[1:], duration=dur, loop=0)
print('ok', len(gif), 'frame', sum(dur), 'ms')
