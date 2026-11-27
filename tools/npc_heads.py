"""Kepala NPC: kepala tokoh utama diganti kepala baru (bentuk rambut, mata, alis, mulut, warna kulit, topi) per NPC.
Kepala MC kaku (hanya bergeser per frame), jadi posisinya dicari dengan mencocokkan kepala frame diam, lalu kepala baru
digambar di posisi yang sama. Dipakai oleh tools/npc_from_mc.py."""
import numpy as np
from PIL import Image

MC = 'godot/assets/art/hero/hero_mc2.png'
BLK = np.array((6, 1, 5, 255), np.uint8)
SKIN = {  # warna kulit (terang, bayangan)
    'terang': ((233, 185, 110), (183, 115, 79)),
    'sawo': ((183, 115, 79), (150, 98, 62)),
    'gelap': ((150, 98, 62), (112, 59, 46)),
}
# geometri kepala baru pada frame diam tiap arah (koordinat sel 64×56)
GEO = {
    'd': dict(cx=33.5, cy=17.0, rx=8.6, ry=8.6, chin=25, eyes=[(31, 21), (36, 21)], mouth=(34, 24), idle=(0, 0)),
    's': dict(cx=32.5, cy=16.5, rx=8.4, ry=8.2, chin=24, eyes=[(37, 20)], mouth=(39, 23), idle=(0, 4)),
    'u': dict(cx=32.5, cy=16.5, rx=8.6, ry=8.4, chin=24, eyes=[], mouth=None, idle=(0, 2)),
}
HEAD_ROWS = (6, 25)   # baris kepala MC (frame diam)

_A = np.array(Image.open(MC).convert('RGBA'))
_IDLE = {}
for f, g in GEO.items():
    c, r = g['idle']
    cell = _A[r * 56:(r + 1) * 56, c * 64:(c + 1) * 64]
    m = cell[..., 3] > 0
    m[:HEAD_ROWS[0]] = False
    m[g['chin'] + (0 if f == 'd' else 1):] = False
    _IDLE[f] = (cell, m)


def find_offset(a, facing):
    cell, m = _IDLE[facing]
    best = (1 << 30, 0, 0)
    for dy in range(-3, 4):
        for dx in range(-4, 5):
            sh = np.roll(np.roll(cell, dy, 0), dx, 1)
            mm = np.roll(np.roll(m, dy, 0), dx, 1)
            d = (sh[mm] != a[mm]).any(-1).sum()
            if d < best[0]:
                best = (d, dx, dy)
    return best[1], best[2], np.roll(np.roll(m, best[2], 0), best[1], 1)


def ell(x, y, cx, cy, rx, ry):
    if y + 0.5 > cy:
        rx *= 0.9
    return ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1.0


def build_head(o, facing):
    """Gambar kepala pada kanvas 64×56 (posisi frame diam). Kembalikan RGBA."""
    g = GEO[facing]
    cx, cy, rx, ry, chin = g['cx'], g['cy'], g['rx'], g['ry'], g['chin']
    hl, hd = (np.array((*c, 255), np.uint8) for c in o['_rambut'])
    sk, sks = (np.array((*c, 255), np.uint8) for c in SKIN[o.get('kulit', 'terang')])
    st = o.get('gaya_rambut', 'poni')
    H, W = 56, 64
    skull = np.zeros((H, W), bool)
    for y in range(H):
        for x in range(W):
            skull[y, x] = ell(x, y, cx, cy, rx, ry) and y <= chin
    if facing == 's':   # wajah samping: rahang & hidung ke depan
        for y in range(int(cy) + 2, chin + 1):
            for x in range(int(cx), int(cx + rx) + 1):
                if y <= chin - (1 if x > cx + rx - 2 else 0):
                    skull[y, x] = True
        nx, ny = int(cx + rx) + 1, g['eyes'][0][1] + 1
        skull[ny, nx] = True
    hair = np.zeros((H, W), bool)
    yy, xx = np.mgrid[:H, :W]
    left, right = cx - rx, cx + rx
    # garis rambut: y batas bawah rambut per kolom (tampak depan/samping)
    def hairline(x):
        rel = (x + 0.5 - cx)
        edge = abs(rel) > rx - 2.2
        if st == 'poni':
            return 23 if edge else 19
        if st == 'belah':
            return 23 if edge else int(16 + max(0.0, -rel) * 0.45)
        if st == 'cepak':
            return 18 if edge else 14
        if st == 'jabrik':
            return 22 if edge else 18 + (int(x) % 3 == 0)
        if st in ('panjang', 'kuncir'):
            return 24 if edge else (16 if abs(rel) < 1 else 18)
        if st == 'sanggul':
            return 21 if edge else 15
        if st == 'keriting':
            return 22 if edge else 17
        if st == 'botak':
            return 20 if edge else 0
        return 19
    if facing == 'u':
        hair[:] = skull
        if st == 'botak':
            hair &= (yy > cy - 1)
    elif facing == 'd':
        for x in range(W):
            hair[:, x] = skull[:, x] & (yy[:, x] < hairline(x))
        if st == 'botak':
            hair &= (abs(xx + 0.5 - cx) > rx - 2.5) & (yy > cy - 2) & (yy < cy + 5)
    else:   # samping: rambut menutup belakang kepala; depan = wajah
        front = cx - 1.0
        for x in range(W):
            hlx = hairline(x) if x + 0.5 > front else 99
            hair[:, x] = skull[:, x] & (yy[:, x] < hlx)
        if st == 'botak':
            hair &= (xx + 0.5 < cx) & (yy > cy - 2) & (yy < cy + 5)
        elif st != 'cepak':
            back = (xx + 0.5 < cx - 1) & skull
            hair |= back
            if st == 'poni':
                hair |= skull & (xx + 0.5 < cx + 2) & (yy < 22)
        ear = (xx >= int(cx) - 1) & (xx <= int(cx)) & (yy >= 19) & (yy <= 21)
        if st not in ('panjang', 'keriting'):
            hair &= ~ear
    # tambahan bentuk
    extra = np.zeros((H, W), bool)
    top_y = cy - ry
    if st == 'jabrik':
        for sx, h in ((-5, 3), (0, 4), (4, 3)) if facing != 's' else ((-6, 3), (-2, 4), (2, 3)):
            for k in range(h):
                for x in range(int(cx + sx - (h - k) // 2), int(cx + sx + (h - k) // 2) + 1):
                    extra[int(top_y) - k + 1, x] = True
    if st == 'keriting':
        for y in range(H):
            for x in range(W):
                if ell(x, y, cx, cy - 1, rx + 2.0, ry + 1.3) and y < cy + 4 and (x + y) % 4 != 0 or ell(x, y, cx, cy - 1, rx + 1.0, ry + 0.6) and y < cy + 4:
                    extra[y, x] = True
        if facing == 'd':
            extra &= ~((yy >= 17) & (abs(xx + 0.5 - cx) < rx - 2))
        elif facing == 's':
            extra &= ~((yy >= 17) & (xx + 0.5 > cx))
    if st == 'panjang':
        if facing == 'd':
            extra |= (yy >= cy) & (yy <= chin + 7) & (((xx >= left - 1) & (xx <= left + 2)) | ((xx >= right - 3) & (xx <= right)))
        elif facing == 's':
            extra |= (yy >= cy) & (yy <= chin + 8) & (xx >= left) & (xx <= cx - 1)
        else:
            extra |= (yy >= cy) & (yy <= chin + 8) & (xx >= left) & (xx <= right - 1)
    if st == 'sanggul':
        bx, by = (cx, top_y - 0.5) if facing != 's' else (left + 1.5, cy - 3)
        for y in range(H):
            for x in range(W):
                if ((x + 0.5 - bx) / 3.3) ** 2 + ((y + 0.5 - by) / 2.6) ** 2 <= 1:
                    extra[y, x] = True
    if st == 'kuncir':
        if facing == 's':
            extra |= (xx >= left - 2) & (xx <= left + 1) & (yy >= cy - 3) & (yy <= chin + 5) & ~((xx == left - 2) & (yy < cy))
        elif facing == 'u':
            extra |= (abs(xx + 0.5 - cx) <= 1.6) & (yy >= cy) & (yy <= chin + 7)
        else:
            extra |= (xx >= right - 1) & (xx <= right + 1) & (yy >= cy - 4) & (yy <= cy + 5)
    hair |= extra
    out = np.zeros((H, W, 4), np.uint8)
    face = skull & ~hair
    out[face] = sk
    # bayangan wajah: di bawah rambut & sisi kanan
    under = face & np.roll(hair, 1, 0)
    out[under] = sks
    if facing == 'd':
        out[face & (xx + 0.5 > right - 1.5)] = sks
    out[hair] = hl
    hb = hair & ~np.roll(hair, -1, 0)                       # tepi bawah rambut
    out[hb] = hd
    shade = hair & (xx + 0.5 > cx + rx * 0.4) & (yy > top_y + 1)       # sisi kanan gelap (cahaya dari kiri atas)
    out[shade] = hd
    out[hair & (yy > cy + 3)] = hd
    if st == 'cepak':
        out[hair] = hd
        out[hair & (yy < cy - 3) & (xx + 0.5 < cx + 2)] = hl
    # helai rambut: garis pendek gelap di bagian terang
    strands = hair & (yy > top_y + 2) & (yy < top_y + 6) & ((xx - int(cx) + 1) % 4 == 0) & ~shade
    out[strands] = hd
    # wajah: mata, alis, mulut
    eyes_st = o.get('mata', 'titik')
    if facing != 'u':
        for ex, ey in g['eyes']:
            if eyes_st == 'titik':
                out[ey:ey + 2, ex] = BLK
            elif eyes_st == 'sipit':
                out[ey + 1, ex - 1:ex + 1] = BLK
            elif eyes_st == 'bulat':
                out[ey:ey + 2, ex - 1:ex + 1] = BLK
                out[ey, ex - 1] = (237, 214, 187, 255)
            elif eyes_st == 'senyum':
                out[ey, ex - 1:ex + 1] = BLK
            elif eyes_st == 'kacamata':
                out[ey:ey + 2, ex - 1:ex + 2] = (237, 214, 187, 255)
                out[ey:ey + 2, ex] = BLK
                out[ey - 1, ex - 1:ex + 2] = BLK
            if o.get('alis'):
                out[ey - 2, ex - 1:ex + 1] = hd if o['alis'] == 'rambut' else BLK
            if o.get('keriput'):
                out[ey + 2, ex + 1] = sks
        if facing == 'd' and eyes_st == 'kacamata':
            out[g['eyes'][0][1] - 1, g['eyes'][0][0] + 2:g['eyes'][1][0] - 1] = BLK
        mx, my = g['mouth']
        mt = o.get('mulut', 'garis')
        if mt == 'garis':
            out[my, mx - 1:mx + 1] = sks
        elif mt == 'senyum':
            out[my, mx - 1:mx + 1] = BLK
        if o.get('pipi'):
            for ex, ey in g['eyes']:
                out[ey + 2, ex - 1] = (172, 74, 74, 255)
        if o.get('kumis'):
            out[my - 1, mx - 2:mx + 2] = hd
        if o.get('jenggot'):
            j = face & (yy >= my - 1) & ~((yy == my - 1) & (abs(xx - mx) > 2))
            out[j] = hd
            out[j & (yy < my + 1) & ((xx + yy) % 2 == 0)] = hl
            for x in range(W):
                if j[:, x].any():
                    yb = np.nonzero(j[:, x])[0][-1]
                    if abs(x + 0.5 - (cx if facing == 'd' else mx)) < 3:
                        out[yb + 1, x] = hd
                        out[yb + 2, x] = BLK if abs(x + 0.5 - (cx if facing == 'd' else mx)) < 2 else out[yb + 2, x]
                        if out[yb + 2, x, 3] == 0:
                            out[yb + 2, x] = BLK
                    else:
                        out[yb + 1, x] = BLK
    # topi / tudung / helm
    hat = o.get('topi')
    if hat:
        kind, col = hat
        col = np.array((*col, 255), np.uint8)
        dark = (col[:3] * 0.72).astype(np.uint8)
        dark = np.array((*dark, 255), np.uint8)
        if kind == 'caping':
            apex = top_y - 4
            for y in range(int(apex), int(cy) - 1):
                w = (y - apex + 1) * 1.6
                for x in range(int(cx - w), int(cx + w) + 1):
                    out[y, x] = col if (x + y) % 3 else dark
            y = int(cy) - 2
            out[y, int(cx - 13):int(cx + 13)] = dark
        elif kind == 'topi':
            m = (out[..., 3] > 0) & (yy < cy - 2) & skull
            m |= np.vectorize(lambda x, y: ell(x, y, cx, cy - 1, rx + 0.6, ry + 0.6))(xx, yy) & (yy < cy - 2)
            out[m] = col
            out[m & (yy == int(cy) - 3)] = dark
            y = int(cy) - 2
            if facing == 'd':
                out[y, int(cx - 6):int(cx + 8)] = dark
            elif facing == 's':
                out[y, int(cx):int(cx + rx + 5)] = dark
        elif kind == 'tudung':
            big = np.vectorize(lambda x, y: ell(x, y, cx, cy, rx + 1.6, ry + 1.4))(xx, yy) & (yy <= chin + 3)
            if facing == 'd':
                hole = (yy >= 17) & (abs(xx + 0.5 - cx) < rx - 2.0) & (yy <= chin)
            elif facing == 's':
                hole = (yy >= 17) & (xx + 0.5 > cx) & (yy <= chin)
            else:
                hole = np.zeros_like(big)
            m = big & ~hole
            out[m] = col
            out[m & ((xx + 0.5 > cx + rx * 0.4) | (yy > cy + 3))] = dark
            if facing != 'u':
                rim = m & nb4(hole)
                out[rim] = dark
        elif kind == 'helm':
            m = np.vectorize(lambda x, y: ell(x, y, cx, cy - 0.5, rx + 0.8, ry + 0.8))(xx, yy) & (yy <= 18)
            out[m] = col
            out[m & (xx + 0.5 > cx + 3)] = dark
            out[m & (yy == 18)] = dark
            out[m & (yy < cy - 4) & (abs(xx + 0.5 - cx + 2) < 1)] = (237, 214, 187, 255)
    # garis tepi hitam
    solid = out[..., 3] > 0
    ring = nb4(solid) & ~solid
    out[ring] = BLK
    return out


def nb4(m):
    p = np.pad(m, 1)
    return p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]


_CACHE = {}


def draw_head(a, b, o, facing, key):
    """Ganti kepala MC di frame `a` (hasil di `b`) dengan kepala NPC."""
    dx, dy, m = find_offset(a, facing)
    ck = (key, facing)
    if ck not in _CACHE:
        _CACHE[ck] = build_head(o, facing)
    hd = np.roll(np.roll(_CACHE[ck], dy, 0), dx, 1)
    g = GEO[facing]
    chin = g['chin'] + dy
    b[m] = 0
    # bersihkan sisa kepala MC di atas dagu
    b[:chin - 2][b[:chin - 2, :, 3] > 0] = 0
    s = hd[..., 3] > 0
    b[s] = hd[s]
    # leher
    sk, sks = SKIN[o.get('kulit', 'terang')]
    ncx = int(g['cx'] + dx) if facing == 'd' else int(g['cx'] + dx) + 3
    if facing != 'u':
        for y in (chin + 1, chin + 2):
            if b[y, ncx - 1:ncx + 2, 3].all() or y == chin + 1:
                b[y, ncx - 1:ncx + 2] = (*sks, 255)
                b[y, ncx - 2] = BLK; b[y, ncx + 2] = BLK
    return chin
