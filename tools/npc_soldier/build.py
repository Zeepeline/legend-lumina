"""Lembar NPC Prajurit Garnisun 8 arah (gk2, gk5, gk6, gk7), sel 48x48, 8 kolom x 11 baris.
Jalan 5 arah = gambar pemilik raw/walk5.png; diam samping = raw/f0.png.
Tombak tegak WAJIB ada di semua pose (permintaan pemilik). Jalankan: venv/bin/python tools/npc_soldier/build.py"""
import sys
sys.path.insert(0, 'tools/mc2')
import numpy as np
from PIL import Image
from cleanup import despeckle

D = 'tools/npc_soldier/'
F = 48
OUT = (6, 1, 5)

PAL = {
    '#': (6, 1, 5),       # outline hitam pekat
    'k': (30, 33, 41),    # celana gelap
    'b': (44, 55, 70),    # celana biru navy
    'm': (75, 82, 94),    # besi gelap
    'g': (89, 101, 114),  # besi sedang-gelap
    's': (125, 132, 140), # besi utama
    'L': (158, 166, 172), # highlight besi
    'D': (54, 35, 30),    # cokelat gelap
    'c': (87, 57, 43),    # cokelat utama (jaket, rambut, sepatu bot)
    'w': (129, 98, 78),   # cokelat terang (highlight rambut/sepatu/bahu)
    't': (178, 131, 101), # bayangan kulit
    'S': (233, 199, 150), # kulit terang
}
CC = np.array(list(PAL.values()), dtype=float)


def quant_raw(s):
    m = s[..., 3] > 0
    dark = m & (s[..., :3].astype(int).sum(-1) < 90)
    bright = m & ~dark
    a = s.copy()
    a[dark, :3] = OUT
    if bright.any():
        d = ((s[bright][:, None, :3].astype(float) - CC[None, :, :]) ** 2).sum(-1)
        a[bright, :3] = CC[d.argmin(-1)].astype(np.uint8)
    return a


def eyes(a):
    t = a[:a.shape[0] // 2].astype(int)
    sk = (t[..., 0] > 170) & (t[..., 1] > 110) & (t[..., 2] < 160) & (t[..., 3] > 0)
    dk = (t[..., :3].sum(-1) < 200) & (t[..., 3] > 0)
    return sum(
        1 for y, x in zip(*np.nonzero(dk))
        if 0 < x < t.shape[1] - 1 and sk[y, x - 1] and sk[y, x + 1]
    )


def shrink(im, scale):
    best = None
    for ox in range(7):
        for oy in range(7):
            W, H = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            a = np.array(im)
            xs = np.minimum(((np.arange(W) + ox / 7) / scale).astype(int), im.width - 1)
            ys = np.minimum(((np.arange(H) + oy / 7) / scale).astype(int), im.height - 1)
            b = a[ys][:, xs]
            sc = eyes(b)
            if best is None or sc > best[0]:
                best = (sc, b)
    return Image.fromarray(best[1])


def helmc(a):
    t = a[:a.shape[0] * 2 // 5].astype(int)
    r, g, b = t[..., 0], t[..., 1], t[..., 2]
    m = (t[..., 3] > 0) & (abs(r - g) < 20) & (abs(g - b) < 20) & (r > 85)
    xs = np.nonzero(m)[1]
    return float(xs.mean()) if len(xs) else a.shape[1] / 2.0


def cell(a, dx=0, dy=0):
    c = np.zeros((F, F, 4), np.uint8)
    h, w = a.shape[:2]
    x = int(round(F / 2 - helmc(a))) + dx
    x = min(max(x, 0), F - w)
    y0 = max(0, min(F - h, F - h + dy))
    c[y0:y0 + h, x:x + w] = a[:F - y0]
    return c


def strict_clean(a, strip_outer_halo=False):
    b = a.copy()
    if strip_outer_halo:
        m = b[..., 3] > 0
        p = np.pad(m, 1)
        outer = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
        for y, x in zip(*np.nonzero(outer)):
            rgb = tuple(int(v) for v in b[y, x, :3])
            if rgb in (PAL['b'], PAL['g'], PAL['m']):
                has_out = any(
                    0 <= y + dy < F and 0 <= x + dx < F and b[y + dy, x + dx, 3] > 0 and tuple(b[y + dy, x + dx, :3]) == OUT
                    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1))
                )
                if has_out:
                    b[y, x] = 0
    m = b[..., 3] > 0
    p = np.pad(m, 1)
    n8 = sum(p[1 + dy:1 + dy + F, 1 + dx:1 + dx + F] for dy in (-1, 0, 1) for dx in (-1, 0, 1) if dy or dx)
    b[m & (n8 <= 1)] = 0
    b = despeckle(b)
    m = b[..., 3] > 0
    p = np.pad(m, 1)
    edge = m & ~(p[:-2, 1:-1] & p[2:, 1:-1] & p[1:-1, :-2] & p[1:-1, 2:])
    for y, x in zip(*np.nonzero(edge)):
        if tuple(b[y, x, :3]) != OUT:
            b[y, x] = (*OUT, 255)
    return b


def paint_grid(rows_str, x0=14, y0=5):
    a = np.zeros((F, F, 4), np.uint8)
    for dy, row in enumerate(rows_str):
        y = y0 + dy
        if not (0 <= y < F):
            continue
        for dx, ch in enumerate(row):
            x = x0 + dx
            if not (0 <= x < F) or ch == '.':
                continue
            a[y, x] = (*PAL[ch], 255)
    return a


def clean_face_side(c):
    b = c.copy()
    for y in range(12, 21):
        for x in range(16, 32):
            if b[y, x, 3] > 0:
                rgb = tuple(int(v) for v in b[y, x, :3])
                if rgb in (PAL['L'], PAL['s'], PAL['g'], PAL['m'], PAL['b']):
                    nbrs = [
                        tuple(int(v) for v in b[y + dy, x + dx, :3])
                        for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1))
                        if 0 <= y + dy < F and 0 <= x + dx < F and b[y + dy, x + dx, 3] > 0
                    ]
                    if sum(1 for n in nbrs if n in (PAL['S'], PAL['t'], OUT)) >= 2:
                        b[y, x] = (*PAL['S'], 255)
    return b


# === 1. WALK_SIDE (8 frame mulus dari gambar pemilik) ===
S_RAW = [np.array(Image.open(f'{D}raw/f{i}.png').convert('RGBA')) for i in range(8)]
tops = [np.nonzero((s[..., 3] > 0).any(1))[0][0] for s in S_RAW]
scale_k = 46 / max(s.shape[0] - t for s, t in zip(S_RAW, tops))
Z_RAW = []
for s in S_RAW:
    im = Image.fromarray(quant_raw(s))
    im = im.crop(im.getbbox())
    Z_RAW.append(np.array(shrink(im, scale_k)))


def eye_px(a):
    t = a[:a.shape[0] // 2].astype(int)
    sk = (t[..., 0] > 170) & (t[..., 1] > 110) & (t[..., 2] < 160) & (t[..., 3] > 0)
    dk = (t[..., :3].sum(-1) < 200) & (t[..., 3] > 0)
    return sk, [
        (y, x) for y, x in zip(*np.nonzero(dk))
        if 0 < x < t.shape[1] - 1 and y + 1 < t.shape[0] and (sk[y, x - 1] or sk[y, x + 1]) and sk[y + 1, x]
    ]


def fix_eyes(a, ref):
    sk, e = eye_px(a)
    if len(e) >= 2:
        return a
    rsk, re_ = eye_px(ref)
    if not re_ or not sk.any():
        return a
    ry, rx = np.nonzero(rsk)
    ys, xs = np.nonzero(sk)
    b = a.copy()
    for y, x in re_:
        ny, nx = ys.min() + (y - ry.min()), xs.max() - (rx.max() - x)
        if 0 <= ny < b.shape[0] and 0 <= nx < b.shape[1] and sk[ny, nx]:
            b[ny, nx] = ref[y, x]
    return b


Z_SIDE = [Z_RAW[0]] + [fix_eyes(z, Z_RAW[0]) for z in Z_RAW[1:]]


c_f = [strict_clean(clean_face_side(cell(z)), strip_outer_halo=True) for z in Z_SIDE]


# === 2. JALAN 5 ARAH dari gambar pemilik (raw/walk5.png): samping 6, depan 8, belakang 8, depan-kanan 8, belakang-kanan 8 ===
SPEAR = ["..###.", "..#L#.", "..#s#.", "..#s#.", ".#Lsg#", ".#Lsg#", "#LLsg#", "#Lssg#", "#Lssg#", "#Lssg#", "#gssg#", ".#gg#.", "..#s#.", "..#s#."]


def over(a, grid, x, y):
    for dy, row in enumerate(grid):
        for dx, ch in enumerate(row):
            if ch != '.' and 0 <= y + dy < F and 0 <= x + dx < F:
                a[y + dy, x + dx] = (*PAL[ch], 255)


def spear(a, cx, dy=0):
    """Tombak tegak (bentuk lembar rilis v1.93.6), batang di kolom cx, di belakang badan."""
    s = np.zeros_like(a)
    over(s, SPEAR, cx - 3, 1 + dy)
    for y in range(15 + dy, F):
        over(s, ["#D#" if y % 7 in (0, 1, 2) else "#c#"], cx - 1, y)
    return np.where(a[..., 3:] > 0, a, s)


def load_walk():
    im = Image.open(D + 'raw/walk5.png').convert('RGB')
    src = np.array(im)
    W, H = 480, 268  # grid piksel asli (2,8667 px layar per piksel)
    xs = np.minimum(((np.arange(W) + .5) * im.width / W).astype(int), im.width - 1)
    ys = np.minimum(((np.arange(H) + .5) * im.height / H).astype(int), im.height - 1)
    n = src[ys][:, xs]
    t = n.astype(int)
    fg = ~((t[..., 1] > t[..., 0] + 12) & (t[..., 1] > t[..., 2] + 12))
    rgba = np.dstack([n, (fg * 255).astype(np.uint8)])
    rgba[~fg] = 0
    rgba = quant_raw(rgba)
    rows_ = []
    for r, cnt in enumerate((6, 8, 8, 8, 8)):
        y0, y1 = ((5, 55), (60, 109), (114, 162), (168, 215), (220, 268))[r]
        fr = []
        for k in range(cnt):
            c0 = round((83 + k * 173.6) / 1376 * 480) - 28
            p = rgba[y0:y1, max(0, c0):c0 + 56]
            fr.append(p)
        base = max(int(np.nonzero(p[..., 3].any(1))[0][-1]) for p in fr)
        cells = []
        for p in fr:
            p = p[:base + 1]
            xx = np.nonzero(p[..., 3].any(0))[0]
            yy = np.nonzero(p[..., 3].any(1))[0]
            cells.append(strict_clean(cell(p[yy[0]:, xx[0]:xx[-1] + 1])))
        rows_.append(cells)
    return rows_


W_SIDE, W_DOWN, W_UP, W_SE, W_NE = load_walk()
# depan gambar 3: kaki tampak samping → badan bawah dari diagonal depan langkah yang sama
W_DOWN[2] = np.concatenate([W_DOWN[2][:24], W_SE[2][24:]])


def same_head(cells, ref, n=18):
    """Kepala (n baris dari puncak) semua frame disalin dari frame acuan agar wajah/helm tidak berkedip; naik-turun tetap."""
    top = lambda a: int(np.nonzero(a[..., 3].any(1))[0][0])
    t0 = top(cells[ref])
    out = []
    for a in cells:
        t = top(a)
        b = a.copy()
        b[:t + n] = 0
        b[t:t + n] = cells[ref][t0:t0 + n]
        out.append(b)
    return out


W_SIDE, W_DOWN, W_UP = same_head(W_SIDE, 0), same_head(W_DOWN, 0), same_head(W_UP, 0)
W_SE, W_NE = same_head(W_SE, 2), same_head(W_NE, 0)
IDLE_D, IDLE_U, IDLE_S = W_DOWN[3], W_UP[3], c_f[0]


FIST = ["####", "#SS#", "#St#", "#tt#", "####"]


def top_y(a):
    return int(np.nonzero(a[..., 3].any(1))[0][0])


def grip(a, cx, hy, dy=0):
    """Tombak DIGENGGAM: di belakang kepala, di depan badan (y ≥ 22), lalu kepalan menutup batang di (cx, hy)."""
    s = np.zeros_like(a)
    over(s, SPEAR, cx - 3, 1 + dy)
    for y in range(15 + dy, F):
        over(s, ["#D#" if y % 7 in (0, 1, 2) else "#c#"], cx - 1, y)
    b = np.where(a[..., 3:] > 0, a, s)
    front = s[..., 3] > 0
    front[:22 + dy] = False
    b[front] = s[front]
    over(b, FIST, cx - 2, hy)
    return b


def hold(cells, ref, right=False, split=20):
    """Lengan pemegang dari frame acuan di semua frame; lengan lain & kaki tetap dari frame masing-masing."""
    R = cells[ref]
    t0 = top_y(R)
    side = slice(split, F) if right else slice(0, split)
    e = np.nonzero(R[t0 + 26:t0 + 32, side, 3].any(0))[0] + side.start
    cx = int(e[-1]) - 1 if right else int(e[0]) + 1
    tmax = max(top_y(a) for a in cells)
    out = []
    for a in cells:
        t = top_y(a)
        b = a.copy()
        b[t + 18:t + 33, side] = R[t0 + 18:t0 + 33, side]
        out.append(grip(b, cx, t + 27, t - tmax))
    return out


def hold_side(cells, ref):
    """Samping: badan atas = frame lengan terjulur (gambar 4), tangannya menggenggam tombak; kaki per frame."""
    R = cells[ref]
    t0 = top_y(R)
    tmax = max(top_y(a) for a in cells)
    sk = ((R[..., :3] == PAL['S']).all(-1) | (R[..., :3] == PAL['t']).all(-1)) & (R[..., 3] > 0)
    sk[:t0 + 20] = False
    sk[t0 + 33:] = False
    hy, hx = np.nonzero(sk)
    k = hx.argmax()
    cx, dyh = int(hx[k]), int(hy[k]) - t0 - 2
    out = []
    for a in cells:
        t = top_y(a)
        b = a.copy()
        b[:t + 35] = 0
        b[t:t + 35] = R[t0:t0 + 35]
        out.append(grip(b, cx, t + dyh, t - tmax))
    return out


# diam samping: badan atas sama dengan jalan samping (gambar 4), kaki berdiri dari raw/f0
_t = top_y(W_SIDE[3])
IDLE_S = W_SIDE[3].copy()
IDLE_S[_t + 35:] = c_f[0][_t + 35:]
W_SIDE = hold_side(W_SIDE, 3)
IDLE_D, IDLE_U = hold([W_DOWN[3]], 0)[0], hold([W_UP[3]], 0, True, 28)[0]
W_DOWN, W_SE = hold(W_DOWN, 0), hold(W_SE, 0)
W_UP, W_NE = hold(W_UP, 0, True, 28), hold(W_NE, 0, True, 28)


def lean(a, dx, waist=34):
    b = np.zeros_like(a)
    b[waist:] = a[waist:]
    if dx > 0:
        b[:waist, dx:] = a[:waist, :F - dx]
    elif dx < 0:
        b[:waist, :F + dx] = a[:waist, -dx:]
    else:
        b[:waist] = a[:waist]
    return b


def crouch(a, n):
    y = F - 9
    return np.concatenate([np.zeros((n, F, 4), a.dtype), a[:y], a[y + n:]])


def breathe_cell(a, waist=34):
    b = a.copy()
    up = a[:waist].copy()
    b[:waist] = 0
    b[1:waist + 1] = np.where(up[..., 3:] > 0, up, b[1:waist + 1])
    return b


nod_d = breathe_cell(IDLE_D, 22)
nod_s = breathe_cell(IDLE_S, 22)



def SP(*cells):
    """Tombak digenggam tangan terjulur ke depan (piksel kulit paling kanan di bawah dagu), sama seperti jalan samping."""
    t0 = top_y(cells[0])
    out = []
    for a in cells:
        sk = ((a[..., :3] == PAL['S']).all(-1) | (a[..., :3] == PAL['t']).all(-1)) & (a[..., 3] > 0)
        t = top_y(a)
        sk[:t + 20] = False
        sk[t + 33:] = False
        ys, xs = np.nonzero(sk)
        k = xs.argmax()
        out.append(grip(a, int(xs[k]), int(ys[k]) - 2, max(0, t - t0)))
    return out


rows = [
    W_DOWN,
    W_UP,
    W_SIDE,
    [IDLE_D, breathe_cell(IDLE_D), *SP(IDLE_S, breathe_cell(IDLE_S)), IDLE_U, breathe_cell(IDLE_U)],
    [IDLE_D, nod_d, IDLE_D, nod_d],
    SP(IDLE_S, strict_clean(crouch(IDLE_S, 1)), strict_clean(crouch(IDLE_S, 2)), strict_clean(crouch(IDLE_S, 1))),
    SP(IDLE_S, nod_s, nod_s, IDLE_S),
    SP(IDLE_S, strict_clean(lean(IDLE_S, 1)), strict_clean(lean(IDLE_S, 2)), strict_clean(lean(IDLE_S, 1))),
    SP(IDLE_S, strict_clean(lean(IDLE_S, -1)), strict_clean(lean(IDLE_S, -1)), IDLE_S),
    W_SE,
    W_NE,
]

sheet = np.zeros((F * len(rows), F * 8, 4), np.uint8)
for r, row in enumerate(rows):
    for c, im in enumerate(row):
        sheet[r * F:(r + 1) * F, c * F:(c + 1) * F] = im

for nid in ('gk2', 'gk5', 'gk6', 'gk7'):
    Image.fromarray(sheet).save(f'assets/img/npc/npc_sheet_{nid}.png')

cols_used = sorted({tuple(int(v) for v in p) for p in sheet[sheet[..., 3] > 0][:, :3]})
print('npc_soldier tersimpan! colors:', len(cols_used), 'shape:', sheet.shape)
