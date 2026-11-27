"""Tanah benua menyambung tanpa garis batas (Godot).

Sumber: tools/ground_src/gnd_<id>_custom.png (gambar tanah tiap wilayah, gaya Sprout).
Hasil:  godot/assets/art/ground/gnd_<id>_custom.png

Langkah:
1. Ukuran gambar disamakan dengan kotak wilayah di godot/core/world_layout.gd (dipotong / tepi diulang).
2. Jalan tanah yang putus di perbatasan disambung (jalur tanah dari ujung jalan sisi lain menuju jalan terdekat di sisi ini).
3. Pita perbatasan selebar BAND px dicampur berbintik (dither) dengan piksel tetangga yang dicerminkan,
   sehingga warna rumput/biome berbeda (salju, rawa, hutan) memudar, bukan garis lurus.

Jalankan dari akar repo:  python3 tools/seam_ground.py
"""
import re
import numpy as np
from PIL import Image

SRC = 'tools/ground_src/gnd_%s_custom.png'
OUT = 'godot/assets/art/ground/gnd_%s_custom.png'
BAND = 56      # lebar pita pudar tiap sisi (px)
LINK = 72      # kedalaman sambungan jalan ke dalam wilayah (px)


def regions():
    s = open('godot/core/world_layout.gd').read()
    out = {}
    for m in re.finditer(r'&"(\w+)": \{.*?"rect": Rect2i\((-?\d+), (-?\d+), (\d+), (\d+)\)', s, re.S):
        out[m.group(1)] = tuple(int(v) for v in m.groups()[1:])
    return out


def fit(a, w, h):
    """Potong atau ulangi tepi kanan/bawah agar tepat w×h."""
    a = a[:h, :w]
    if a.shape[0] < h:   # dicerminkan (bukan baris terakhir diulang → tidak ada garis-garis lurus)
        a = np.concatenate([a, a[::-1][:h - a.shape[0]]], 0)
    if a.shape[1] < w:
        a = np.concatenate([a, a[:, ::-1][:, :w - a.shape[1]]], 1)
    return a.copy()


def is_dirt(px):
    """Jalan: tanah Sprout cokelat atau paving batu kota (abu hangat), bukan rumput/air/salju."""
    r, g, b = px[..., 0].astype(int), px[..., 1].astype(int), px[..., 2].astype(int)
    soil = (r > 120) & (r > g + 18) & (g > 80) & (b < 120) & (r - b > 60)
    cobble = (abs(r - g) < 14) & (r - b > 4) & (r - b < 28) & (r > 120) & (r < 215)   # paving batu kota (abu hangat)
    return soil | cobble


def runs(mask):
    xs = np.nonzero(mask)[0]
    if not len(xs):
        return []
    cut = np.nonzero(np.diff(xs) > 3)[0] + 1
    return [(int(p[0]), int(p[-1])) for p in np.split(xs, cut) if p[-1] - p[0] >= 6]


def hashn(h, w, seed):
    rng = np.random.default_rng(seed)
    return rng.random((h, w))


def edges(R):
    """Pasangan tepi bersama: (a, b, sisi a, awal, akhir) dalam koordinat global sepanjang tepi."""
    out = []
    ids = list(R)
    for i, a in enumerate(ids):
        ax, ay, aw, ah = R[a]
        for b in ids[i + 1:]:
            bx, by, bw, bh = R[b]
            ox0, ox1 = max(ax, bx), min(ax + aw, bx + bw)
            oy0, oy1 = max(ay, by), min(ay + ah, by + bh)
            if ox1 - ox0 >= 32 and ay + ah == by:
                out.append((a, b, 'S', ox0, ox1))
            elif ox1 - ox0 >= 32 and by + bh == ay:
                out.append((b, a, 'S', ox0, ox1))
            elif oy1 - oy0 >= 32 and ax + aw == bx:
                out.append((a, b, 'E', oy0, oy1))
            elif oy1 - oy0 >= 32 and bx + bw == ax:
                out.append((b, a, 'E', oy0, oy1))
    return out


def strip(img, reg, side, g0, g1, depth, far):
    """Ambil pita (depth × panjang) dari tepi; far=False → sisi 'atas/kiri' (a), True → sisi b. Baris 0 = paling dekat tepi."""
    x, y, w, h = reg
    if side == 'S':
        c0, c1 = g0 - x, g1 - x
        return img[h - depth:h, c0:c1][::-1] if not far else img[0:depth, c0:c1]
    c0, c1 = g0 - y, g1 - y
    return img[c0:c1, w - depth:w].transpose(1, 0, 2)[::-1] if not far else img[c0:c1, 0:depth].transpose(1, 0, 2)


def put(img, reg, side, g0, g1, depth, far, band):
    x, y, w, h = reg
    if side == 'S':
        c0, c1 = g0 - x, g1 - x
        if not far:
            img[h - depth:h, c0:c1] = band[::-1]
        else:
            img[0:depth, c0:c1] = band
        return
    c0, c1 = g0 - y, g1 - y
    if not far:
        img[c0:c1, w - depth:w] = band[::-1].transpose(1, 0, 2)
    else:
        img[c0:c1, 0:depth] = band.transpose(1, 0, 2)


def dirt_tile(img_band):
    """Petak 12×12 yang seluruhnya tanah dari pita (untuk tekstur sambungan jalan); None bila tak ada."""
    m = is_dirt(img_band)
    H, W = m.shape
    for y in range(0, H - 12, 3):
        for x in range(0, W - 12, 3):
            if m[y:y + 12, x:x + 12].all():
                return img_band[y:y + 12, x:x + 12].copy()
    return None


def link_paths(near, other, near_full_tile):
    """Jalan di 'other' yang tak ada lawannya di 'near' dilanjutkan ke dalam 'near' menuju jalan terdekat
    (kurva halus, lebar mengikuti), bertekstur petak tanah 'near' sendiri."""
    tile = near_full_tile if near_full_tile is not None else dirt_tile(other)
    if tile is None:
        return
    dn, dl = is_dirt(near[0]), is_dirt(other[0])
    deep = min(LINK, near.shape[0])
    for a0, a1 in runs(dl):
        if dn[max(0, a0 - 24):a1 + 25].any():
            continue
        cx = (a0 + a1) / 2
        target, trow = None, deep - 1
        for row in range(deep - 1, 8, -4):
            rr = [r for r in runs(is_dirt(near[row])) if abs((r[0] + r[1]) / 2 - cx) < 200]
            if rr:
                target = min(rr, key=lambda r: abs((r[0] + r[1]) / 2 - cx)); trow = row
                break
        if target is None:
            target = (a0, a1)
        for row in range(trow + 3):
            t = min(1.0, row / max(1, trow)); t = t * t * (3 - 2 * t)
            l = round(a0 + (target[0] - a0) * t); r = round(a1 + (target[1] - a1) * t)
            for xx in range(max(0, l), min(near.shape[1], r + 1)):
                near[row, xx] = tile[row % 12, xx % 12]


def smooth_noise(n, seed, scale=40.0):
    rng = np.random.default_rng(seed)
    k = int(n / scale) + 3
    pts = rng.uniform(-1, 1, k)
    xs = np.arange(n) / scale
    i0 = np.floor(xs).astype(int); f = xs - i0; f = f * f * (3 - 2 * f)
    v = pts[i0] * (1 - f) + pts[i0 + 1] * f
    rng2 = np.random.default_rng(seed + 7); k2 = int(n / 9) + 3; p2 = rng2.uniform(-1, 1, k2)
    xs2 = np.arange(n) / 9; j0 = np.floor(xs2).astype(int); g = xs2 - j0
    return v * 0.8 + (p2[j0] * (1 - g) + p2[j0 + 1] * g) * 0.25


def blend(na, nb, seed):
    """Garis batas lurus diganti garis bergelombang: di tiap titik sepanjang tepi, salah satu sisi 'masuk' ke sisi lain
    sejauh derau halus (≤ BAND), memakai piksel cermin sisi itu; tepi gelombang diberi kotak 4 px berbintik."""
    d, L = na.shape[0], na.shape[1]
    f = smooth_noise(L, seed) * d                       # >0: b masuk ke a; <0: a masuk ke b
    rows = np.arange(d)[:, None]
    rng = np.random.default_rng(seed + 3)
    jit = (rng.random(((d + 3) // 4, (L + 3) // 4)) - .5) * 8
    jit = np.repeat(np.repeat(jit, 4, 0), 4, 1)[:d, :L]
    ma = rows < (f[None, :] + jit)
    mb = rows < (-f[None, :] + jit)
    oa, ob = na.copy(), nb.copy()
    oa[ma] = nb[ma]; ob[mb] = na[mb]
    ka, kb = is_dirt(na) & ~is_dirt(nb), is_dirt(nb) & ~is_dirt(na)
    oa[ka] = na[ka]; ob[kb] = nb[kb]
    return oa, ob


WILD = 'godot/assets/art/ground/gnd_wild_sprout.png'
WILD_MOD = np.array([0.95, 0.97, 0.95])   # sama dengan modulate WildFillerLayer (benua_world.gd)


def outer_fade(IMG, R, shared):
    """Tepi wilayah yang tidak bersentuhan wilayah lain: garis lurus diganti gelombang yang menyatu dengan rumput pengisi
    luar wilayah (tekstur & posisi persis sama dengan WildFillerLayer: ubin dari continent_bounds().grow(900))."""
    wild = np.array(Image.open(WILD).convert('RGB')).astype(float)
    T = wild.shape[0]
    bx = min(r[0] for r in R.values()) - 900
    by = min(r[1] for r in R.values()) - 900
    for n, (k, (x, y, w, h)) in enumerate(R.items()):
        img = IMG[k]
        for side in 'NSWE':
            L = w if side in 'NS' else h
            free = np.ones(L, bool)
            for a0, a1 in shared[k][side]:
                free[max(0, a0 - 8):min(L, a1 + 8)] = False
            if not free.any():
                continue
            f = (smooth_noise(L, 500 + n * 7 + 'NSWE'.index(side)) * 0.5 + 0.5) * BAND * 0.8 + 6
            for i in np.nonzero(free)[0]:
                d = int(f[i])
                for j in range(d):
                    if side == 'N': px, py = i, j
                    elif side == 'S': px, py = i, h - 1 - j
                    elif side == 'W': px, py = j, i
                    else: px, py = w - 1 - j, i
                    gx, gy = x + px - bx, y + py - by
                    img[py, px, :3] = (wild[gy % T, gx % T] * WILD_MOD).astype(np.uint8)
                    img[py, px, 3] = 255


def shared_spans(R):
    out = {k: {s: [] for s in 'NSWE'} for k in R}
    for a, b, side, g0, g1 in edges(R):
        ax, ay = R[a][0], R[a][1]; bx_, by_ = R[b][0], R[b][1]
        if side == 'S':
            out[a]['S'].append((g0 - ax, g1 - ax)); out[b]['N'].append((g0 - bx_, g1 - bx_))
        else:
            out[a]['E'].append((g0 - ay, g1 - ay)); out[b]['W'].append((g0 - by_, g1 - by_))
    return out


BRIDGES = 'tools/bridges/bridges.json'   # jembatan kayu (posisi & gambar dari versi web lama: bridgeFit/bridgeArt)
BRIDGES_GD = 'godot/core/bridges_data.gd'


def paste_bridges(IMG):
    import json
    B = json.load(open(BRIDGES))
    lines = ['class_name BridgesData', 'extends RefCounted', '## DIBUAT OTOMATIS oleh tools/seam_ground.py — jangan disunting tangan.',
             '## Jembatan kayu per wilayah (koordinat lokal, piksel). BenuaWorld menghapus petak air (tabrakan) di bawahnya.',
             '', 'const LIST: Dictionary = {']
    for k, L in B.items():
        if k not in IMG:
            continue
        rects = []
        for o in L:
            art = Image.open(o['img']).convert('RGBA')
            base = Image.fromarray(IMG[k])
            base.alpha_composite(art, (o['x'], o['y']))
            IMG[k] = np.array(base)
            rects.append('Rect2i(%d, %d, %d, %d)' % (o['x'], o['y'], o['w'], o['h']))
        lines.append('\t&"%s": [%s],' % (k, ', '.join(rects)))
    lines.append('}')
    open(BRIDGES_GD, 'w').write('\n'.join(lines) + '\n')


def main():
    R = regions()
    IMG = {}
    for k, (x, y, w, h) in R.items():
        IMG[k] = fit(np.array(Image.open(SRC % k).convert('RGBA')), w, h)
    for i, (a, b, side, g0, g1) in enumerate(edges(R)):
        depth = max(BAND, LINK) + 4
        sa = strip(IMG[a], R[a], side, g0, g1, depth, False)
        sb = strip(IMG[b], R[b], side, g0, g1, depth, True)
        link_paths(sa, sb, dirt_tile(sa))
        link_paths(sb, sa, dirt_tile(sb))
        ba, bb = blend(sa[:BAND], sb[:BAND], 97 + i)
        sa[:BAND], sb[:BAND] = ba, bb
        put(IMG[a], R[a], side, g0, g1, depth, False, sa)
        put(IMG[b], R[b], side, g0, g1, depth, True, sb)
        print('sambung', a, b, side, g1 - g0)
    outer_fade(IMG, R, shared_spans(R))
    paste_bridges(IMG)
    for k, a in IMG.items():
        Image.fromarray(a).save(OUT % k)


if __name__ == '__main__':
    main()
