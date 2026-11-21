# Kombo 10 jurus Arka dari rangka 2D (arka_cutout): kunci-pose per jurus, diinterpolasi; jejak ayunan pedang, debu, kilat hantaman.
# Pakai: python3 tools/rig2d/arka_combo.py OUT_DIR → arka_combo.gif (tampak samping + depan)
import sys, os, math
import numpy as np
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.dirname(__file__))
import arka_cutout as A

OUT = sys.argv[1] if len(sys.argv) > 1 else '/tmp/rig2d'
CW, CH, OX, OY = A.CW, A.CH, A.OX, A.OY
SW_LEN = len(A.SWORD) - 3  # dari genggaman ke ujung

def ease(t): return t * t * (3 - 2 * t)
# jurus: nama, [(waktu 0..1, sudut lengan, geser x, geser y, condong badan)], jumlah frame, opsi
MOVES = [
    ('1 Tebas Turun', [(0, 150, 0, 0, 0), (.25, 165, 0, 0, 0), (.7, 20, 2, 0, 1), (1, 30, 2, 0, 1)], 7, {}),
    ('2 Tebas Balik', [(0, 30, 2, 0, 1), (.6, 200, 3, 0, 0), (1, 190, 3, 0, 0)], 6, {}),
    ('3 Tebas Naik', [(0, -40, 3, 1, -1), (.2, -50, 3, 1, -1), (.75, 150, 5, -2, 1), (1, 140, 5, -1, 1)], 7, {}),
    ('4 Tusukan', [(0, 70, 4, 0, 0), (.3, 80, 1, 0, -1), (.6, 92, 9, 0, 2), (1, 90, 8, 0, 1)], 6, {'thrust': 1}),
    ('5 Putaran', [(0, 90, 8, 0, 0), (1, 90, 8, 0, 0)], 9, {'spin': 1}),
    ('6 Tebas Ganda', [(0, 160, 8, 0, 0), (.3, 30, 9, 0, 1), (.45, 40, 9, 0, 1), (.8, 170, 10, 0, 0), (1, 160, 10, 0, 0)], 9, {}),
    ('7 Lompat Tebas', [(0, 200, 10, 0, 0), (.4, 210, 12, -11, 0), (.75, 40, 14, -3, 2), (1, 30, 14, 0, 1)], 9, {'jump': 1}),
    ('8 Sapuan Rendah', [(0, -30, 14, 2, 2), (.7, 110, 16, 2, 3), (1, 100, 16, 2, 2)], 7, {}),
    ('9 Tusukan Maju', [(0, 85, 12, 0, -1), (.35, 85, 10, 0, -2), (.7, 92, 22, 0, 3), (1, 90, 21, 0, 2)], 7, {'thrust': 1}),
    ('10 Hantaman Akhir', [(0, 90, 20, 0, 0), (.35, 185, 20, -6, -1), (.6, 190, 21, -7, -1), (.8, 20, 23, 1, 3), (1, 25, 23, 1, 3)], 11, {'slam': 1}),
]

def keyval(keys, t):
    for i in range(len(keys) - 1):
        a, b = keys[i], keys[i + 1]
        if a[0] <= t <= b[0]:
            k = ease((t - a[0]) / max(1e-6, b[0] - a[0])); return [a[j] + (b[j] - a[j]) * k for j in range(1, 5)]
    return list(keys[-1][1:])

def tip(view, ang, dx, dy):  # posisi ujung pedang di kanvas (rotasi CCW layar)
    rg = A.R['side' if view == 'right' else view]; img, pv = rg['armS']
    hand = (21, 31) if view == 'right' else (15, 33)
    vx, vy = hand[0] - pv[0], hand[1] - pv[1] + SW_LEN
    r = math.radians(ang); x = vx * math.cos(r) + vy * math.sin(r); y = -vx * math.sin(r) + vy * math.cos(r)
    return OX + pv[0] + dx + x, OY + pv[1] + dy + y

def pose(view, ang, dx, dy, lean, legs=0):
    s = 1 if view == 'right' else -1
    P = {'all': (round(dx * s) if view == 'right' else 0, round(dy)), 'armS': (ang if view == 'right' else -ang, 0, 0),
         'head': (0, round(lean), 0), 'torso': (0, round(lean * .5), 0)}
    if view == 'right': P.update({'legF': (-12 * legs, 2 * legs, 0), 'legB': (10 * legs, -legs, 0)})
    else: P.update({'legL': (0, -legs, 0)})
    return P

def render(view):
    frames, trail, names = [], [], []
    for name, keys, n, op in MOVES:
        for i in range(n):
            t = i / (n - 1)
            ang, dx, dy, lean = keyval(keys, t)
            v = view
            if op.get('spin'):  # putar badan: tampak berganti kanan→bawah→kiri→atas→kanan, pedang terentang
                seq = ['right', 'down', 'left', 'up', 'right'] if view == 'right' else ['down', 'left', 'up', 'right', 'down']
                v = seq[min(4, int(t * 5))]
            vv = 'right' if v == 'left' else v
            P = pose(vv, ang, dx, dy, lean, legs=1 if abs(lean) > .5 or op.get('thrust') else 0)
            cv = Image.fromarray(A.draw(v, P))
            # jejak pedang: ujung pedang beberapa frame terakhir
            if not op.get('spin'):  # riwayat pose pedang (sudut sebenarnya) → jejak berupa busur
                trail.append((P['armS'][0], P['all'][0], P['all'][1], vv, v == 'left')); trail[:] = trail[-3:]
            else: trail.clear()
            frames.append((cv, list(trail), op, t, name, (dx, dy)))
        trail.clear()
    out = []
    for cv, tr, op, t, name, (dx, dy) in frames:
        bg = Image.new('RGBA', (CW, CH), (0, 0, 0, 0)); d = ImageDraw.Draw(bg)
        fx = OX + 24 + (round(dx) if view == 'right' else 0); fy = OY + 39
        d.ellipse((fx - 9 + (round(dy) < -2) * 2, fy - 2, fx + 9 - (round(dy) < -2) * 2, fy + 2), fill=(20, 30, 16, 110))  # bayangan
        if len(tr) > 1:  # busur ujung pedang di antara pose berurutan (8 langkah), makin baru makin terang & tebal
            for k in range(1, len(tr)):
                (a0, x0, y0, v0, m0), (a1, x1, y1, v1, m1) = tr[k - 1], tr[k]
                if v0 != v1 or abs(a1 - a0) < 12: continue
                pts = []
                for j in range(9):
                    u = j / 8; px, py = tip(v1, a0 + (a1 - a0) * u, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)
                    pts.append((CW - 1 - px if m1 else px, py))
                new = k == len(tr) - 1
                d.line(pts, fill=(170, 215, 255, 150) if not new else (255, 255, 255, 235), width=4 if new else 2, joint='curve')
        bg.alpha_composite(cv)
        if op.get('slam') and t >= .8:  # kilat & retakan hantaman
            k = (t - .8) / .2; d2 = ImageDraw.Draw(bg); r = 6 + 16 * k
            d2.ellipse((fx + 12 - r, fy - r * .35, fx + 12 + r, fy + r * .35), outline=(255, 244, 200, int(255 * (1 - k))), width=2)
            for j in range(8):
                a = j * math.pi / 4; d2.point((fx + 12 + math.cos(a) * r * 1.2, fy + math.sin(a) * r * .4), fill=(200, 170, 120, 255))
        out.append((bg, name, op, t))
    return out

side, front = render('right'), render('down')
S = 3; W = CW * 2; H = CH + 14; gif = []
for (a, name, op, t), (b, _, _, _) in zip(side, front):
    im = Image.new('RGBA', (W, H), (74, 112, 54, 255))
    shake = (1 if int(t * 10) % 2 else -1) if op.get('slam') and t >= .8 else 0
    im.alpha_composite(a, (shake, 12)); im.alpha_composite(b, (CW + shake, 12))
    d = ImageDraw.Draw(im); d.rectangle((0, 0, W, 11), fill=(26, 20, 12, 255)); d.text((4, 0), 'Kombo ' + name, fill=(255, 236, 170, 255))
    if op.get('slam') and .8 <= t < .9: im = Image.blend(im, Image.new('RGBA', im.size, (255, 255, 240, 255)), .35)
    gif.append(im.resize((W * S, H * S), Image.NEAREST).convert('RGB'))
gif[0].save(os.path.join(OUT, 'arka_combo.gif'), save_all=True, append_images=gif[1:] + [gif[-1]] * 6, duration=85, loop=0)
print('ok frames', len(gif))
