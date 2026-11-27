"""Kepala NPC: kepala tokoh utama diganti kepala baru (bentuk rambut, mata, alis, mulut, warna kulit, topi) per NPC.
Kepala MC kaku (hanya bergeser per frame), jadi posisinya dicari dengan mencocokkan kepala frame diam, lalu kepala baru
digambar di posisi yang sama. Dipakai oleh tools/npc_from_mc.py."""
import numpy as np
import npc_hair_art as HA
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
    'd': dict(cx=33.0, cy=16.8, rx=10.2, ry=8.6, chin=25, eyes=[(31, 22), (36, 22)], mouth=(34, 25), idle=(0, 0)),
    's': dict(cx=32.0, cy=16.5, rx=9.6, ry=8.4, chin=24, eyes=[(37, 19)], mouth=(36, 23), idle=(0, 4)),
    'u': dict(cx=32.5, cy=16.5, rx=10.0, ry=8.4, chin=24, eyes=[], mouth=None, idle=(0, 2)),
}
HEAD_ROWS = (6, 25)
# ramp rambut gaya tokoh utama: terang, tengah (helai), bayangan, tergelap — bayangan agak kebiruan seperti rambut MC
RAMP = {
    'zaitun': ((166, 171, 64), (120, 139, 79), (67, 85, 109), (48, 52, 88)),
    'coklat': ((150, 98, 62), (112, 59, 46), (84, 25, 32), (48, 52, 88)),
    'oranye': ((207, 115, 69), (163, 41, 28), (84, 25, 32), (48, 52, 88)),
    'merah': ((177, 39, 26), (163, 41, 28), (84, 25, 32), (48, 52, 88)),
    'mawar': ((172, 74, 74), (145, 96, 80), (84, 25, 32), (48, 52, 88)),
    'krem': ((237, 214, 187), (176, 172, 168), (98, 96, 104), (67, 85, 109)),
    'abu': ((176, 172, 168), (145, 140, 140), (98, 96, 104), (67, 85, 109)),
    'kulit': ((240, 194, 113), (207, 115, 69), (145, 96, 80), (84, 25, 32)),
    'birutua': ((67, 85, 109), (45, 49, 97), (48, 52, 88), (6, 1, 5)),
    'hitam': ((48, 52, 88), (45, 49, 97), (6, 1, 5), (6, 1, 5)),
    'hijau': ((123, 147, 69), (120, 139, 79), (67, 85, 109), (48, 52, 88)),
}   # baris kepala MC (frame diam)

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
        rx *= 1.0 - 0.28 * min(1.0, (y + 0.5 - cy) / ry * 1.4)
    return ((x + 0.5 - cx) / rx) ** 2 + ((y + 0.5 - cy) / ry) ** 2 <= 1.0


def build_head(o, facing):
    """Gambar kepala pada kanvas 64×56 (posisi frame diam). Kembalikan RGBA."""
    g = GEO[facing]
    cx, cy, rx, ry, chin = g['cx'], g['cy'], g['rx'], g['ry'], g['chin']
    hl, hd = (np.array((*c, 255), np.uint8) for c in o['_rambut'])
    ramp = [np.array((*c, 255), np.uint8) for c in RAMP.get(o['rambut'][0], (o['_rambut'][0], o['_rambut'][1], (67, 85, 109), (48, 52, 88)))]
    hl, hd = ramp[0], ramp[2]
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
            return 24 if edge else 20
        if st == 'belah':
            return 24 if edge else int(17 + max(0.0, -rel) * 0.4)
        if st == 'cepak':
            return 19 if edge else 15
        if st == 'jabrik':
            return 23 if edge else 19 + (int(x) % 3 == 0)
        if st in ('panjang', 'kuncir'):
            return 25 if edge else (17 if abs(rel) < 1 else 19)
        if st == 'sanggul':
            return 23 if edge else 18
        if st == 'keriting':
            return 22 if edge else 17
        if st == 'botak':
            return 20 if edge else 0
        return 19
    def tooth(x):
        return 0 if st in ('cepak', 'botak', 'sanggul') else (2 - abs(int(x) % 4 - 2))
    if facing == 'u':
        hair[:] = skull
        if st == 'botak':
            hair &= (yy > cy - 1)
    elif facing == 'd':
        for x in range(W):
            hair[:, x] = skull[:, x] & (yy[:, x] < hairline(x) + tooth(x))
        if st == 'botak':
            hair &= (abs(xx + 0.5 - cx) > rx - 2.5) & (yy > cy - 2) & (yy < cy + 5)
    else:   # samping: rambut menutup belakang kepala; depan = wajah
        front = cx - 1.0
        for x in range(W):
            hlx = hairline(x) + tooth(x) if x + 0.5 > front else 99
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
    # --- tekstur dipindah dari kepala MC: rambut memakai pola helai & bayangan MC, wajah memakai wajah MC ---
    mc, _ = _IDLE[facing]
    mrgb = mc[..., :3]; mal = mc[..., 3] > 0
    meq = lambda c: (mrgb == c).all(-1) & mal
    tone = np.full((H, W), -1, int)
    for t, c in enumerate(((166, 171, 64), (120, 139, 79), (67, 85, 109), (48, 52, 88))):
        tone[meq(c)] = t
    tone[:HEAD_ROWS[0]] = -1
    tone[chin + 1:] = -1
    L0, L1, L2, L3 = ramp
    tfull = tone.copy()
    for y in range(H):
        for x in range(W):
            if tfull[y, x] < 0 and y < chin + 12:
                yr = min(max(y, int(top_y) + 1), chin)
                cand = [(abs(xx2 - x) + abs(yy2 - y) * 2, tone[yy2, xx2]) for yy2 in range(max(0, yr - 3), yr + 4)
                        for xx2 in range(max(0, x - 6), min(W, x + 7)) if tone[yy2, xx2] >= 0]
                tfull[y, x] = min(cand)[1] if cand else (0 if y < cy else 2)
    for y, x in zip(*np.nonzero(hair)):
        out[y, x] = ramp[max(0, tfull[y, x])]
    msk = meq((233, 185, 110)); mks = meq((183, 115, 79))
    out[face] = sk
    out[face & mks] = sks
    out[face & np.roll(hair, 1, 0)] = sks                     # bayangan tipis di bawah poni
    eyes_mc = meq((6, 1, 5)) & face & np.roll(msk | mks, 1, 1) & np.roll(msk | mks, -1, 1)
    out[face & meq((236, 206, 172))] = (236, 206, 172, 255)   # mulut MC
    if o.get('mata', 'titik') == 'titik':
        out[eyes_mc] = BLK
    under = np.zeros_like(face)
    # --- kepala dari grid MC yang rambutnya disunting (npc_hair_art) — menimpa bentuk prosedural di atas ---
    MAPST = {'poni': 'rata', 'jabrik': 'mc', 'keriting': 'bulat'}
    gs = HA.head_grid(MAPST.get(st, st), facing)
    out = np.zeros((H, W, 4), np.uint8)
    hair = np.zeros((H, W), bool); face = np.zeros((H, W), bool)
    for gy, row in enumerate(gs):
        for gx, ch in enumerate(row):
            X, Y = HA.X0 + gx, HA.Y0 + gy
            if ch == 'F':
                out[Y, X] = BLK
            elif ch in '1234':
                out[Y, X] = ramp[int(ch) - 1]; hair[Y, X] = True
            elif ch == 's':
                out[Y, X] = sk; face[Y, X] = True
            elif ch == 'k':
                out[Y, X] = sks; face[Y, X] = True
            elif ch == 'm':
                out[Y, X] = (236, 206, 172, 255); face[Y, X] = True
    if o.get('mata', 'titik') != 'titik' and facing != 'u':
        for ex, ey in g['eyes']:
            for y in (ey, ey + 1):
                if (out[y, ex] == BLK).all():
                    out[y, ex] = sk
    # wajah: mata, alis, mulut
    eyes_st = o.get('mata', 'titik')
    if facing != 'u':
        for ex, ey in g['eyes']:
            if eyes_st == 'titik':
                pass
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
        mt = o.get('mulut', 'mc')
        if mt == 'garis':
            out[my, mx - 1:mx + 1] = sks
        elif mt == 'mc':
            out[my, mx - 1:mx + 1] = (236, 206, 172, 255)
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
        elif kind in ('tudung', 'helm'):
            # mengikuti siluet rambut MC: rambut diganti kain/logam dengan bayangan yang sama
            hr = [col, np.array((*(col[:3] * 0.86).astype(np.uint8), 255), np.uint8), dark,
                  np.array((*(col[:3] * 0.5).astype(np.uint8), 255), np.uint8)]
            idx = np.full((H, W), -1, int)
            for t in range(4):
                idx[hair & (out[..., :3] == ramp[t][:3]).all(-1)] = t
            if kind == 'tudung':
                m = hair.copy()
                grow = nb4(m) & (out[..., 3] == 0) & (yy <= chin + 3) & (yy > cy - 2)
                m |= grow
                idx[grow] = 3
                for y, x in zip(*np.nonzero(m)):
                    out[y, x] = hr[max(0, min(3, idx[y, x] + (1 if idx[y, x] == 0 and (x + y) % 5 == 0 else 0)))]
                if facing != 'u':
                    out[m & nb4(face)] = hr[2]
                hair[:] = m
            else:
                m = hair & (yy <= (18 if facing != 'u' else 20))
                for y, x in zip(*np.nonzero(m)):
                    out[y, x] = hr[0] if idx[y, x] <= 1 else hr[2]
                out[m & ~np.roll(m, -1, 0)] = hr[3]                       # pinggir helm
                band = m & (yy < cy - 2) & (abs(xx + 0.5 - (cx - 3)) < 1)  # kilap
                out[band] = (237, 214, 187, 255)
    # garis tepi hitam
    solid = out[..., 3] > 0
    ring = nb4(solid) & ~solid
    out[ring] = BLK
    if not hat and st != 'botak':
        hair_ring = ring & nb4(hair) & (yy > cy + 1) & ~nb4(face)
        out[hair_ring] = ramp[3] if ramp[3][:3].sum() > 30 else BLK
    return out


def nb4(m):
    p = np.pad(m, 1)
    return p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]


_CACHE = {}
REF_SKIN = {}
try:
    for line in open('tools/npc_ref/heads/kulit.txt'):
        k, *v = line.split()
        REF_SKIN[k] = (tuple(map(int, v[:3])), tuple(map(int, v[3:6])))
except OSError:
    pass


def skin_of(o):
    """Warna kulit NPC: dari gambar referensi pemilik bila ada, kalau tidak dari pilihan `kulit`."""
    return REF_SKIN.get(o.get('_id'), SKIN[o.get('kulit', 'terang')])


def draw_head(a, b, o, facing, key):
    """Ganti kepala MC di frame `a` (hasil di `b`) dengan kepala NPC."""
    dx, dy, m = find_offset(a, facing)
    ck = (key, facing)
    if ck not in _CACHE:
        import os
        ref = f'tools/npc_ref/heads/{key}_{"u" if facing == "u" else "d"}.png'
        if os.path.exists(ref):   # kepala dari gambar referensi pemilik
            _CACHE[ck] = np.array(Image.open(ref).convert('RGBA'))
            if facing != 'd':     # kepala referensi digambar pada posisi frame diam bawah
                gd, gf = GEO['d'], GEO[facing]
                _CACHE[ck] = np.roll(_CACHE[ck], int(round(gf['cx'] - gd['cx'])), 1)
        else:
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
    sk, sks = skin_of(o)
    ncx = int(g['cx'] + dx) if facing == 'd' else int(g['cx'] + dx) + 3
    if facing != 'u':
        for y in (chin + 1, chin + 2):
            if b[y, ncx - 1:ncx + 2, 3].all() or y == chin + 1:
                b[y, ncx - 1:ncx + 2] = (*sks, 255)
                b[y, ncx - 2] = BLK; b[y, ncx + 2] = BLK
    return chin
