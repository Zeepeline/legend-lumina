"""Lembar warga desa dari gambar pemilik tools/npc_desa/<id>.png (grid asli 480x268):
samping 6, depan-kanan 8, belakang 8, depan 8, belakang-kanan 8. Warga baru: simpan gambar, lalu jalankan skrip dengan id-nya.
Sel 48x48, 8 kolom x 8 baris: jalan bawah/atas/samping, diam, bicara, laugh, diagonal depan, diagonal belakang.
Jalankan dari akar repo: venv/bin/python tools/npc_desa/build.py vl3 vl4"""
import sys
import numpy as np
from PIL import Image
F, OUT = 48, (6, 1, 5)
NID = sys.argv[1]
if len(sys.argv) > 2:
    import subprocess
    for i in sys.argv[1:]:
        subprocess.run([sys.executable, __file__, i], check=True)
    sys.exit()
im = Image.open(f'tools/npc_desa/{NID}.png').convert('RGB')
W, H = 480, 268  # grid piksel asli
src = np.array(im)
n = src[((np.arange(H) + .5) * im.height / H).astype(int)][:, ((np.arange(W) + .5) * im.width / W).astype(int)]
t = n.astype(int)
# latar: hijau jenuh; lalu 2 langkah ke piksel campuran di tepinya (baju hijau pucat di dalam garis tepi tidak tersentuh)
hij = (t[..., 1] > t[..., 0] + 12) & (t[..., 1] > t[..., 2] + 12)
bgm = hij & (t[..., 1] - t[..., 0] > 24) & (t[..., 1] > 105)
for _ in range(2):
    p_ = np.pad(bgm, 1)
    bgm = bgm | (hij & (p_[:-2, 1:-1] | p_[2:, 1:-1] | p_[1:-1, :-2] | p_[1:-1, 2:]))
fg = ~bgm
# palet 13 warna + garis tepi (k-means, awal tetap supaya hasil selalu sama)
dark = fg & (t.sum(-1) < 100)
px = t[fg & ~dark].astype(float)
C = px[np.argsort(px.sum(1))][np.linspace(0, len(px) - 1, 13).astype(int)]
for _ in range(30):
    k = ((px[:, None] - C[None]) ** 2).sum(-1).argmin(1)
    C = np.array([px[k == i].mean(0) if (k == i).any() else C[i] for i in range(len(C))])
q = np.zeros((H, W, 4), np.uint8)
q[fg, 3] = 255
q[dark, :3] = OUT
m = fg & ~dark
q[m, :3] = C[((t[m][:, None] - C[None]) ** 2).sum(-1).argmin(1)].round()


def tidy(a):
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    n8 = sum(p[1 + y:1 + y + F, 1 + x:1 + x + F] for y in (-1, 0, 1) for x in (-1, 0, 1) if y or x)
    a[m & (n8 <= 1)] = 0
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    edge[F - 1] = False
    a[edge, :3] = OUT
    return a


top = lambda a: int(np.nonzero(a[..., 3].any(1))[0][0])


def load(y0, y1, cnt, right=False):
    fr = []
    for k in range(cnt):
        x0 = max(0, 28 + round(k * 61.3) - 28)
        p = q[y0:y1 + 1, x0:x0 + 56]
        xs = np.nonzero((p[..., 3] > 0).sum(0) > 0)[0]
        seg = max(np.split(xs, np.nonzero(np.diff(xs) > 3)[0] + 1), key=len)
        p = p[:, seg[0]:seg[-1] + 1]
        hd = np.nonzero(p[:20, :, 3].any(0))[0]  # pusat kepala (menyamping: dihitung dari tepi wajah agar sanggul tidak menggeser badan)
        c = np.zeros((F, F, 4), np.uint8)
        x = min(max(round(F / 2 - ((hd[-1] - 8.5) if right else (hd[0] + hd[-1] + 1) / 2)), 0), F - p.shape[1])
        c[F - len(p):, x:x + p.shape[1]] = p[-F:]
        fr.append(tidy(c))
    return fr


def same_head(cells, ref, h=18):
    R = cells[ref]
    t0 = top(R)
    out = []
    for a in cells:
        t = top(a)
        b = a.copy()
        b[:t + h] = 0
        b[t:t + h] = R[t0:t0 + h]
        out.append(b)
    return out


SIDE = same_head(load(6, 53, 6, True), 0)
SE = same_head(load(60, 106, 8, True), 1)
UP = same_head(load(113, 160, 8), 0)
DOWN = same_head(load(168, 213, 8), 0, 19)
NE = same_head(load(220, 267, 8, True), 0)


# mata diseragamkan (permintaan pemilik): (piksel jadi kulit, piksel mata, contoh kulit) pada frame 0, ikut naik-turun kepala
EYES = {  # arah: (piksel jadi kulit, [(x, y, warna)], contoh kulit)
    'kn1': {
        'DOWN': ([(22, 16), (22, 17), (22, 18), (27, 16), (27, 17), (27, 18)],
                 [(x, y, OUT) for x in (23, 28) for y in (16, 17, 18)], (25, 18)),
        'SIDE': ([(x, y) for y in (14, 15, 16) for x in (26, 27, 29)] + [(23, 14), (28, 17)],
                 [(28, y, OUT) for y in (14, 15, 16)], (25, 16)),
        'SE': ([(24, y) for y in (13, 14, 15, 16, 17)] + [(25, 13), (25, 14), (27, 14)],
               [(25, y, OUT) for y in (15, 16, 17)], (27, 17)),
    },
}


def eyes(cells, key):
    if key not in EYES.get(NID, {}):
        return
    skin_, eye_, (sx, sy) = EYES[NID][key]
    t0, col = top(cells[0]), cells[0][sy, sx].copy()
    for a in cells:
        dy = top(a) - t0
        for x, y in skin_:
            a[y + dy, x] = col
        for x, y, c_ in eye_:
            a[y + dy, x] = (*c_, 255)


eyes(DOWN, 'DOWN')
eyes(SIDE, 'SIDE')
eyes(SE, 'SE')


def breathe(a, waist=32):
    b = a.copy()
    up = a[:waist]
    b[:waist] = 0
    b[1:waist + 1] = np.where(up[..., 3:] > 0, up, b[1:waist + 1])
    return b


# diam samping: kepala & badan jalan samping (gambar 2, tangan menggantung), kaki berdiri dari diagonal depan
IS = SIDE[1].copy()
d = top(SE[3]) - top(IS)
b = np.zeros_like(IS)
b[d:] = IS[:F - d]
b[38:] = SE[3][38:]
IS, ID, IU = b, DOWN[3], UP[3]
nod = breathe(ID, 24)
rows = [DOWN, UP, SIDE, [ID, breathe(ID), IS, breathe(IS), IU, breathe(IU)], [ID, nod, ID, nod],
        [ID, breathe(ID), ID, breathe(ID)], SE, NE]


# --- kn1: Kesatria Arvan, desain sendiri (gambar lain hanya acuan ide): jubah toska tua, lambang bintang emas,
#     rambut cokelat tua, pedang panjang bergagang emas dipanggul. Pedang & lambang digambar di sini.
CW, CH_ = 80, 56
GOLD, GOLD_D, GRIP = (214, 168, 74), (140, 98, 44), (88, 56, 42)
STEEL = [(233, 232, 232), (197, 194, 194), (137, 134, 132)]


def put(b, src, x0, y0):
    for y, x in zip(*np.nonzero(src[..., 3])):
        if 0 <= y + y0 < b.shape[0] and 0 <= x + x0 < b.shape[1]:
            b[y + y0, x + x0] = src[y, x]


def outline(a):
    m = a[..., 3] > 0
    p_ = np.pad(m, 1)
    a[~m & (p_[:-2, 1:-1] | p_[2:, 1:-1] | p_[1:-1, :-2] | p_[1:-1, 2:])] = (*OUT, 255)
    return a


def sword(hx, hy, n=44):
    """Pedang panjang dipanggul: kemiringan 2:1, bilah ke kanan-atas, gagang ke kiri-bawah, digenggam di (hx, hy)."""
    a = np.zeros((CH_, CW, 4), np.uint8)

    def px(x, y, c):
        if 0 <= x < CW and 0 <= y < CH_:
            a[y, x] = (*c, 255)
    for k in range(5, n):  # bilah 4 px, meruncing di ujung
        left = n - k
        for d in range(4 if left > 6 else 3 if left > 4 else 2 if left > 2 else 1):
            px(hx + k, hy - k // 2 - 1 + d, (STEEL[0], STEEL[0], STEEL[2], STEEL[1])[d])
    for k in range(-8, 5):  # gagang berlilit
        for d in (0, 1):
            px(hx + k, hy - k // 2 + d, GRIP if (k // 2) % 2 else GOLD_D)
    for dy, row in enumerate([".GG.", "GGGg", "GGgg", ".gg."]):  # bulatan ujung gagang
        for dx, ch in enumerate(row):
            if ch != '.':
                px(hx - 12 + dx, hy + 3 + dy, GOLD if ch == 'G' else GOLD_D)
    for m_ in range(-7, 8):  # pelindung tangan panjang, tegak lurus bilah
        px(hx + 4 + m_ // 2, hy - 2 + m_, GOLD)
        px(hx + 5 + m_ // 2, hy - 2 + m_, GOLD_D)
    return outline(a)


# kepala depan (piksel sendiri): rambut jabrik bervolume, poni terbelah, alis tegas, mata toska
HAIR, HAIR_D, HAIR_L = (80, 54, 38), (34, 22, 18), (80, 54, 38)
TEAL, PALE, BLUSH = (28, 140, 132), (238, 202, 172), (214, 160, 130)
HEAD = [
    "......#.#####.......",
    ".....##HHHHHH##.....",
    "...##HHLLHHhHHH##...",
    "..#HHHLLHHHHhHHHH#..",
    ".#HHHLLHHHLHHhHHHH#.",
    ".#HHLLHHHLLHHHhHHH##",
    "#HHhLHHhHLHHhHHhHHH#",
    "#HhHHHhHHHHhHHHhHHH#",
    "#HhHHhHHHhHhHHhHHhH#",
    "##HHhHHHhHHhHHhHhHH#",
    ".#HhHHhHhHhHhHHhhHH#",
    "##HhHhhHhHhHhhHhHhH#",
    "#HhhHhPhhHhPhhPhHhH#",
    "##hhPhPPhhPPPhPPhhh#",
    ".#h#P#PPPhPPP#PP#h#.",
    "..#hP###PPPP###Ph#..",
    "..##PWT#PPPP#TWP##..",
    "...#BWTTPPPPTTWB#...",
    "....#PPPPBBPPPP#....",
    ".....##########.....",
]


def put_head(b, x0, y0):
    pal = {'#': OUT, 'H': HAIR, 'h': HAIR_D, 'L': HAIR_L, 'P': PALE, 'B': BLUSH, 'T': TEAL, 'W': STEEL[0]}
    for dy, row in enumerate(HEAD):
        for dx, ch in enumerate(row):
            if ch != '.' and 0 <= y0 + dy < b.shape[0]:
                b[y0 + dy, x0 + dx] = (*pal[ch], 255)


def recolor(a):
    b = a.copy()
    t = top(a)
    on = a[..., 3] > 0
    v = a[..., :3].astype(int)
    blue = on & (v[..., 2] > v[..., 0] + 12)
    for y, x in zip(*np.nonzero(blue)):  # biru → toska tua
        r, g, bl = v[y, x]
        b[y, x, :3] = (int(r * .55), min(255, int(bl * .82)), int(bl * .80))
    hair = on & ~blue & (v.max(-1) < 95) & (v.sum(-1) > 60)
    hair[t + 19:] = False
    b[hair, :3] = np.clip(v[hair] * [1.45, 1.0, .75], 0, 255)
    return b


STAR = ["..G..", "..G..", "GGgGG", "..G..", "..G.."]


def emblem(a, cx, y0):
    cloth = (35, 100, 98)
    for y in range(y0, y0 + 7):
        for x in range(cx - 3, cx + 4):
            if a[y, x, 3] and tuple(a[y, x, :3]) != OUT:
                a[y, x] = (*cloth, 255)
    for dy, row in enumerate(STAR):
        for dx, ch in enumerate(row):
            if ch != '.':
                a[y0 + 1 + dy, cx - 2 + dx] = (*(GOLD if ch == 'G' else (250, 226, 150)), 255)


def fist(b, x, y):
    for dy, row in enumerate(["####", "#12#", "#23#", "####"]):
        for dx, ch in enumerate(row):
            b[y - 1 + dy, x - 1 + dx] = (*(OUT if ch == '#' else STEEL[int(ch) - 1]), 255)


ARM_K = ["..####..", ".#1122#.", "#112223#", "#122233#", ".#2233#.", "..####.."]


def put_arm(b, x0, y0):
    for dy, row in enumerate(ARM_K):
        for dx, ch in enumerate(row):
            if ch != '.':
                b[y0 + dy, x0 + dx] = (*(OUT if ch == '#' else STEEL[int(ch) - 1]), 255)


def spiky(a, kind):
    """Rambut samping/belakang dijabrikkan (senada kepala depan) & tengkuk hitam dipecah jadi helai."""
    t = top(a)
    hd = a[t:t + 18]
    solid = hd[..., 3] > 0
    blk = (hd[..., :3] == OUT).all(-1) & solid
    p_ = np.pad(solid, 1)
    inner = blk & p_[:-2, 1:-1] & p_[2:, 1:-1] & p_[1:-1, :-2] & p_[1:-1, 2:]
    for y, x in zip(*np.nonzero(inner)):
        if y >= 10 and kind in ('UP', 'NE') and (x * 2 + y) % 5:
            hd[y, x, :3] = HAIR if (x + y // 3) % 3 == 0 else HAIR_D
    for y, n in ((4, 1), (8, 2), (12, 2)):  # jumbai di sisi belakang kepala
        for sgn in ((-1, 1) if kind == 'UP' else (-1,)):
            xs = np.nonzero(hd[y, :, 3])[0]
            e = xs[0] if sgn < 0 else xs[-1]
            for k in range(0, n + 1):
                for d in (0, 1):
                    if 0 <= e + sgn * k < F and k <= n - d:
                        hd[y + d, e + sgn * k] = (*(HAIR if d == 0 and k < n else OUT), 255)
            hd[y - 1, e + sgn * (n - 1)] = (*OUT, 255)
            hd[y + 1, e + sgn * (n - 1)] = (*OUT, 255)
    xs = np.nonzero(hd[0, :, 3])[0]
    for x in (xs[0] + 2, xs[-1] - 3):
        if t > 0:
            a[t - 1, x] = (*OUT, 255)
            a[t, x] = (*HAIR, 255)


def knight(a, kind):
    b = np.zeros((CH_, CW, 4), np.uint8)
    ox, oy = (CW - F) // 2, CH_ - F
    t = top(a)
    a = recolor(a)
    flipped = kind in ('SW', 'NW')
    if flipped:
        kind = {'SW': 'SE', 'NW': 'UP'}[kind]
    diag_back = kind == 'NE'
    if diag_back:
        kind = 'UP'
    if kind != 'DOWN':  # mata toska & kulit sama dengan kepala depan
        ht = t + 19
        sk = C.round()[(C[:, 0] - C[:, 2]).argmax()]
        m = (a[..., :3] == sk).all(-1) & (a[..., 3] > 0)
        m[ht:] = False
        a[m, :3] = PALE
        ex, ey = {'SIDE': (28, 14), 'SE': (25, 15)}.get(kind, (0, 0))
        if ex:
            ey += t - {'SIDE': top(SIDE[0]), 'SE': top(SE[0])}[kind]
            a[ey, ex - 1] = (*OUT, 255)
            for k in (1, 2):
                a[ey + k, ex] = (*TEAL, 255)
                a[ey + k, ex - 1] = (*STEEL[0], 255)
        spiky(a, 'NE' if diag_back or (flipped and kind == 'UP') else kind)
        if flipped:
            a = a[:, ::-1].copy()
    if kind in ('DOWN', 'SE'):
        emblem(a, 22 if flipped else 25, t + 20)
        hx, hy = ox + 11, oy + t + 23
        if kind == 'DOWN':
            a[:t + 18] = 0
        a[t + 25:t + 34, :18] = 0  # lengan lama → lengan menekuk ke gagang
        put(b, sword(hx, hy), 0, 0)  # bilah di belakang kepala & badan
        put(b, a, ox, oy)
        g = sword(hx, hy)
        g[:, hx + 5 + 4:] = 0  # gagang & pelindung tangan di depan
        put(b, g, 0, 0)
        if kind == 'DOWN':
            put_head(b, ox + 16, oy + t - 1)
        put_arm(b, hx - 1, hy + 1)
        fist(b, hx, hy)
        return b
    hx, hy = ox + (36 if kind == 'SIDE' else 35), oy + t + (25 if kind == 'SIDE' else 24)
    sw = sword(CW - 1 - hx, hy)[:, ::-1]
    if kind == 'UP':
        put(b, a, ox, oy)
        put_arm(b, hx - 6, hy + 1)
        put(b, sw, 0, 0)  # dilihat dari belakang: bilah di depan punggung
    else:
        put(b, sw, 0, 0)
        put(b, a, ox, oy)
        g = sw.copy()
        g[:, :hx - 8] = 0
        put(b, g, 0, 0)
        hd = a.copy()
        hd[t + 18:] = 0
        put(b, hd, ox, oy)
    fist(b, hx, hy)
    return b


def lock(cells, ref, y0, y1, xs):
    R = cells[ref].copy()
    tr = top(R)
    for a in cells:
        t = top(a)
        a[t + y0:t + y1, xs] = R[tr + y0:tr + y1, xs]


if NID == 'kn1':
    lock(DOWN, 5, 18, 32, slice(0, 20))  # lengan pemegang pedang: satu pose
    SE0 = [a.copy() for a in SE]
    lock(SE, 5, 18, 32, slice(0, 20))
    lock(SIDE, 3, 18, 32, slice(0, F))
    ID = DOWN[3]
    IS = SIDE[1].copy()
    d = top(SE[3]) - top(IS)
    b = np.zeros_like(IS)
    b[d:] = IS[:F - d]
    b[38:] = SE[3][38:]
    IS, nod = b, breathe(ID, 24)
    rows = [DOWN, UP, SIDE, [ID, breathe(ID), IS, breathe(IS), IU, breathe(IU)], [ID, nod, ID, nod],
            [ID, breathe(ID), ID, breathe(ID)], SE, NE]
    KIND = ['DOWN', 'UP', 'SIDE', None, 'DOWN', 'DOWN', 'SE', 'NE', 'SW', 'NW']
    rows += [SE0, NE]
    rows = [[knight(a, KIND[r] or ('DOWN', 'DOWN', 'SIDE', 'SIDE', 'UP', 'UP')[c]) for c, a in enumerate(row)]
            for r, row in enumerate(rows)]


def biggest(a):
    """Hanya gumpalan terbesar (tokoh + pedang) yang disimpan; piksel lepas dibuang."""
    m = a[..., 3] > 0
    seed = np.zeros_like(m)
    ys, xs = np.nonzero(m)
    k = (np.abs(ys - m.shape[0] * .6) + np.abs(xs - m.shape[1] / 2)).argmin()
    seed[ys[k], xs[k]] = True
    while True:
        p_ = np.pad(seed, 1)
        nx = m & (seed | p_[:-2, 1:-1] | p_[2:, 1:-1] | p_[1:-1, :-2] | p_[1:-1, 2:]
                  | p_[:-2, :-2] | p_[:-2, 2:] | p_[2:, :-2] | p_[2:, 2:])
        if (nx == seed).all():
            break
        seed = nx
    a[~seed] = 0
    return a


if NID == 'kn1':
    rows = [[biggest(a) for a in row] for row in rows]
    al = np.concatenate([a.reshape(-1, 4) for row in rows for a in row])
    cs, n_ = np.unique(al[al[:, 3] > 0][:, :3], axis=0, return_counts=True)
    cs, n_ = list(map(tuple, cs.astype(int))), list(n_)
    while len(cs) > 16:  # gabungkan pasangan warna termirip sampai 16
        i, j = min(((i, j) for i in range(len(cs)) for j in range(i)),
                   key=lambda q_: sum((u - v) ** 2 for u, v in zip(cs[q_[0]], cs[q_[1]])) * min(n_[q_[0]], n_[q_[1]]) ** .25)
        lo, hi = (i, j) if n_[i] < n_[j] else (j, i)
        n_[hi] += n_[lo]
        for row in rows:
            for a in row:
                a[(a[..., :3] == cs[lo]).all(-1) & (a[..., 3] > 0), :3] = cs[hi]
        del cs[lo], n_[lo]
FH_, FW_ = rows[0][0].shape[:2]
sheet = np.zeros((FH_ * len(rows), FW_ * 8, 4), np.uint8)
for r, row in enumerate(rows):
    for c, a in enumerate(row):
        sheet[r * FH_:r * FH_ + FH_, c * FW_:c * FW_ + FW_] = a
Image.fromarray(sheet).save(f'assets/img/npc/npc_sheet_{NID}.png')
print(NID, 'warna:', len({tuple(p) for p in sheet[sheet[..., 3] > 0][:, :3].tolist()}))
