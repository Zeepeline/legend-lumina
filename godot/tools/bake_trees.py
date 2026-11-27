#!/usr/bin/env python3
"""
Bake high-definition polished Sprout trees with canopy details, fruits, and biome tints.
Ported directly from b4a5fae:src/systems/sprout_trees.js and sprout_canopy.js.
Generates polished tree PNGs in godot/assets/art/nature/.
"""

import os
import math
from PIL import Image

def hash_val(x, y, s=0):
    x = int(x) & 0xFFFFFFFF
    y = int(y) & 0xFFFFFFFF
    s = int(s) & 0xFFFFFFFF
    
    # 32-bit integer arithmetic simulation
    def imul(a, b):
        return ((a * b) & 0xFFFFFFFF)

    h = (imul(x, 374761393) + imul(y, 668265263) + imul(s, 982451653)) & 0xFFFFFFFF
    h = imul(h ^ (h >> 13), 1274126177) & 0xFFFFFFFF
    h = h ^ (h >> 16)
    return (h & 0xFFFFFFFF) / 4294967296.0

def sprout_tree_tint(v, r, g, b):
    if v in ('fa', 'fb', 'fo', ''):
        return [r, g, b]
    if v == 'd':
        return [int(r * 0.74), int(g * 0.8), int(b * 0.86)]
    if v == 'sw':
        return [int(r * 0.82), int(g * 0.8), int(b * 0.66)]
    if v == 'sn':
        L = min(1.0, max(0.0, ((r + g + b) / 765.0 - 0.42) / 0.32))
        return [int(128 + 122 * L), int(150 + 104 * L), int(176 + 78 * L)]
    return [r, g, b]

def sprout_tree_polish(d, w, h):
    def at(x, y):
        return (y * w + x) * 4
    def leaf(x, y):
        if x < 0 or y < 0 or x >= w or y >= h:
            return False
        i = at(x, y)
        return d[i + 3] > 128 and d[i + 1] > d[i] + 4 and d[i + 1] >= d[i + 2]
    def bark(x, y):
        if x < 0 or y < 0 or x >= w or y >= h:
            return False
        i = at(x, y)
        return d[i + 3] > 128 and d[i] > d[i + 1] and d[i + 1] > d[i + 2] and (d[i] - d[i + 2]) > 40
    def add(x, y, k):
        i = at(x, y)
        for j in range(3):
            d[i + j] = max(0, min(255, d[i + j] + k))

    top, bot = h, 0
    for y in range(h):
        for x in range(w):
            if leaf(x, y):
                top = min(top, y)
                bot = max(bot, y)
                
    for y in range(1, h - 1):
        for x in range(1, w - 2):
            if not (leaf(x, y) and leaf(x + 1, y) and leaf(x - 1, y) and leaf(x, y - 1) and leaf(x, y + 1) and leaf(x + 1, y + 1)):
                continue
            t = (y - top) / float(max(1, bot - top))
            r = hash_val(x, y, 77)
            if t < 0.6 and r < 0.14 and x < w * 0.75:
                add(x, y, 30)
                add(x + 1, y, 20)
            elif t > 0.45 and r > 0.86:
                add(x, y, -24)
                add(x + 1, y + 1, -16)

    cols = []
    for x in range(w):
        for y in range(h):
            if bark(x, y):
                cols.append(x)
                break
    cx = cols[len(cols) // 2] if cols else -1
    for y in range(h):
        for x in range(w):
            if not bark(x, y):
                continue
            i = at(x, y)
            d[i] = int(d[i] * 0.9)
            d[i + 1] = int(d[i + 1] * 0.8)
            d[i + 2] = int(d[i + 2] * 0.74)
            if leaf(x, y - 1) or leaf(x, y - 2):
                add(x, y, -34)
            elif x == cx - 1 and y % 3 != 0:
                add(x, y, -24)
            elif x == cx + 1 and y % 3 == 1:
                add(x, y, 18)

def sprout_canopy_detail(d, W, H):
    def at(x, y):
        return (y * W + x) * 4
    lim = H - 1
    def leaf(x, y):
        if x < 0 or y < 0 or x >= W or y > lim:
            return False
        i = at(x, y)
        return d[i + 3] > 128 and d[i + 1] > d[i] + 4 and d[i + 1] >= d[i + 2]

    started = False
    for y in range(H):
        n = sum(1 for x in range(W) if leaf(x, y))
        if n >= 6:
            started = True
        elif started:
            lim = y - 1
            break

    top, bot, left, right = H, 0, W, 0
    cols = []
    for y in range(lim + 1):
        for x in range(W):
            if leaf(x, y):
                top = min(top, y)
                bot = max(bot, y)
                left = min(left, x)
                right = max(right, x)
                i = at(x, y)
                cols.append((d[i] + d[i + 1] + d[i + 2], i))

    if len(cols) < 200:
        return

    cols.sort(key=lambda item: item[0])
    def avg(a, b):
        r, g, bl = 0, 0, 0
        for k in range(a, b):
            i = cols[k][1]
            r += d[i]
            g += d[i + 1]
            bl += d[i + 2]
        cnt = max(1, b - a)
        return [r / cnt, g / cnt, bl / cnt]

    q = max(1, int(len(cols) * 0.12))
    lo = avg(0, q)
    hi = avg(len(cols) - q, len(cols))
    deep = [lo[0] * 0.66, lo[1] * 0.7, lo[2] * 0.74 + 6]
    N = 7
    ramp = []
    for k in range(N):
        f = k / float(N - 1)
        warm = [10, 5, -12] if k >= N - 2 else [0, 0, 0]
        c = [deep[j] + (hi[j] - deep[j]) * f + warm[j] for j in range(3)]
        if c[1] < c[0] + 6:
            c[1] = c[0] + 6
        if c[2] > c[1]:
            c[2] = c[1]
        ramp.append([max(0, min(255, int(round(v)))) for v in c])

    edge = [int(round(lo[0] * 0.42)), int(round(lo[1] * 0.52 + 4)), int(round(lo[2] * 0.5 + 8))]
    if edge[1] < edge[0] + 6:
        edge[1] = edge[0] + 6
    if edge[2] > edge[1]:
        edge[2] = edge[1]

    S = 14
    R = S * 0.74
    cl = []
    j = 0
    y_pos = top + S * 0.5
    while y_pos < bot + S * 0.5:
        x_pos = left + (S if (j % 2) else S * 0.5)
        while x_pos < right + S * 0.5:
            cx = x_pos + (hash_val(j, int(round(x_pos)), 91) - 0.5) * S * 0.5
            cy = min(bot - 5, y_pos + (hash_val(int(round(y_pos)), j, 92) - 0.5) * S * 0.45)
            if leaf(int(round(cx)), int(round(cy))):
                cl.append([cx, cy])
            x_pos += S
        j += 1
        y_pos += S * 0.86

    if len(cl) < 6:
        return

    def core(x, y):
        return (leaf(x - 4, y) and leaf(x + 4, y) and leaf(x, y - 4) and leaf(x, y + 4) and
                leaf(x - 3, y - 3) and leaf(x + 3, y + 3) and leaf(x + 3, y - 3) and leaf(x - 3, y + 3))

    for c_node in cl:
        c_node.append(R * (0.86 + 0.3 * hash_val(int(round(c_node[0])), int(round(c_node[1])), 96)))
    cl.sort(key=lambda m: m[1])

    own = [-1] * (W * H)
    cover = [0] * (W * H)
    keep = [0] * (W * H)

    for y in range(top, bot + 1):
        for x in range(left, right + 1):
            if not leaf(x, y):
                continue
            o, n, nb, nd = -1, 0, 0, 1e9
            for k, c_node in enumerate(cl):
                e = math.hypot(x - c_node[0], y - c_node[1])
                if e < nd:
                    nd = e
                    nb = k
                if e <= c_node[2] + (hash_val(x, y, 94) - 0.5) * 2:
                    o = k
                    n += 1
            p = y * W + x
            cover[p] = n
            if o >= 0:
                own[p] = o
                keep[p] = 1
            elif core(x, y) or (y >= bot - 5 and leaf(x - 3, y) and leaf(x + 3, y)):
                own[p] = nb
                keep[p] = 1

    span = max(1, bot - top)
    out = [0] * len(d)

    for y in range(top, bot + 1):
        for x in range(left, right + 1):
            p = y * W + x
            if not keep[p]:
                continue
            ox, oy, r = cl[own[p]]
            dx = x - ox
            dy = y - oy
            dd = math.hypot(dx, dy)
            t = 0.86 - 0.74 * ((y - top) / float(span)) + max(-1.0, min(1.0, (-dx - dy) / (r * 1.4))) * 0.13
            if dy > 0 and dd > r * 0.55:
                t -= 0.09 + 0.12 * min(1.0, (dd - r * 0.55) / (r * 0.45))
            if dx + dy < 0 and dd > r * 0.5 and dd <= r * 0.92 and dy < r * 0.25:
                t += 0.2
            if cover[p] >= 2 and dd > r - 2.4 and dy < 0:
                t += 0.16
            if y < top + span * 0.55 and hash_val(x, y, 93) < 0.05:
                t += 0.14
            elif y > top + span * 0.35 and hash_val(x, y, 95) < 0.035:
                t -= 0.2

            c_idx = max(0, min(N - 1, int(round(t * (N - 1)))))
            c = ramp[c_idx]
            i = at(x, y)
            out[i] = c[0]
            out[i + 1] = c[1]
            out[i + 2] = c[2]
            out[i + 3] = 255

    def is_on(x, y):
        return x >= 0 and y >= 0 and x < W and y < H and out[at(x, y) + 3] > 0

    for y in range(top, bot + 1):
        for x in range(left, right + 1):
            if not is_on(x, y) or (is_on(x - 1, y) and is_on(x + 1, y) and is_on(x, y - 1) and is_on(x, y + 1)):
                continue
            i = at(x, y)
            out[i] = edge[0]
            out[i + 1] = edge[1]
            out[i + 2] = edge[2]

    for y in range(top, bot + 1):
        for x in range(left, right + 1):
            if not leaf(x, y):
                continue
            i = at(x, y)
            if out[i + 3] == 0:
                d[i + 3] = 0
            else:
                d[i] = out[i]
                d[i + 1] = out[i + 1]
                d[i + 2] = out[i + 2]
                d[i + 3] = 255

def sprout_fruit(d, w, h, v, s=1):
    C = [[214, 52, 52], [246, 120, 104]] if v == 'fa' else (
        [[236, 132, 34], [252, 196, 92]] if v == 'fo' else [[164, 206, 96], [196, 232, 128]]
    )
    def leaf(x, y):
        lx = x * s + (s >> 1)
        ly = y * s + (s >> 1)
        if lx < 1 or ly < 1 or lx >= w - 1 or ly >= h - 1:
            return False
        i = (ly * w + lx) * 4
        return d[i + 3] > 128 and d[i + 1] > d[i] + 4

    n = 0
    max_y = int(h / float(s) * 0.72)
    max_x = int(w / float(s) - 2)
    for y in range(2, max_y):
        if n >= 9:
            break
        for x in range(2, max_x):
            if n >= 9:
                break
            if hash_val(x, y, 79) > (0.05 if v == 'fb' else 0.07):
                continue
            if not (leaf(x, y) and leaf(x + 1, y) and leaf(x, y + 1) and leaf(x + 1, y + 1) and leaf(x - 1, y) and leaf(x, y - 1)):
                continue
            for dx, dy, k in [[0, 0, 1], [1, 0, 0], [0, 1, 0], [1, 1, 0]]:
                for oy in range(s):
                    for ox in range(s):
                        i = (((y + dy) * s + oy) * w + (x + dx) * s + ox) * 4
                        d[i] = C[k][0]
                        d[i + 1] = C[k][1]
                        d[i + 2] = C[k][2]
            n += 1

def sprout_giant_src(deco_im):
    w, h, cx = 40, 78, 20
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    d = bytearray([0] * (w * h * 4))

    # sample palette from deco_im big tree canopy
    crop = deco_im.crop((20, 1, 44, 32))
    gs = []
    for p in crop.getdata():
        if p[3] > 128 and p[1] > p[0] + 4:
            rgb = (p[0], p[1], p[2])
            if rgb not in gs:
                gs.append(rgb)
    gs.sort(key=lambda c: sum(c))

    def gq(t):
        idx = min(len(gs) - 1, max(0, int(round(t * (len(gs) - 1)))))
        return gs[idx] if gs else (50, 140, 60)

    def put(X, Y, col, a=255):
        X, Y = int(round(X)), int(round(Y))
        if X < 0 or Y < 0 or X >= w or Y >= h:
            return
        i = (Y * w + X) * 4
        d[i] = col[0]
        d[i + 1] = col[1]
        d[i + 2] = col[2]
        d[i + 3] = a

    def line(x0, y0, x1, y1, col, th=1):
        n = int(math.ceil(math.hypot(x1 - x0, y1 - y0) * 2))
        for k in range(n + 1):
            t = k / float(n) if n > 0 else 0
            X = x0 + (x1 - x0) * t
            Y = y0 + (y1 - y0) * t
            for o in range(th):
                put(X + o, Y, col)

    BK = {'o': [74, 40, 36], 'd': [112, 56, 42], 'm': [148, 80, 56], 'l': [180, 104, 72]}
    MOSS, MOSS2 = [110, 140, 72], [140, 170, 88]

    # ground shadow
    for Y in range(70, 78):
        for X in range(2, 38):
            e = ((X - cx) / 17.0) ** 2 + ((Y - 73.5) / 3.8) ** 2
            if e < 1:
                put(X, Y, [60, 90, 50], 70)

    roots = [[cx - 3, 64, cx - 12, 74], [cx + 3, 64, cx + 12, 74], [cx - 1, 67, cx - 4, 76], [cx + 2, 67, cx + 6, 75]]
    for a0, b0, a1, b1 in roots:
        line(a0 - 1, b0, a1 - 1, b1, BK['o'], 4)
    for a0, b0, a1, b1 in roots:
        line(a0, b0, a1, b1, BK['m'], 2)
        line(a0, b0 - 1, a1, b1 - 1, BK['l'], 1)

    for Y in range(32, 72):
        half = 4.5 + (Y - 63) * 0.6 if Y > 63 else 4.5
        for X in range(int(round(cx - half)), int(round(cx - 1 + half)) + 1):
            edge = (X == int(round(cx - half)) or X == int(round(cx - 1 + half)))
            rel = (X - (cx - half)) / (2 * half)
            col = BK['o'] if edge else (BK['l'] if rel < 0.28 else (BK['d'] if rel > 0.72 else BK['m']))
            if not edge and (X == cx - 1 or X == cx + 2) and (Y + X) % 5 < 3:
                col = BK['d']
            if not edge and Y > 62 and hash_val(X, Y, 81) < (Y - 62) / 14.0 and X < cx + 1:
                col = MOSS if hash_val(X, Y, 82) < 0.5 else MOSS2
            put(X, Y, col)

    clumps = [[cx, 9, 7.5], [cx - 8, 17, 7], [cx + 8, 18, 7], [cx, 23, 7.5], [cx - 11, 31, 6.2], [cx + 11, 32, 6.2], [cx - 4, 37, 6], [cx + 5, 38, 5.6]]
    def in_mass(X, Y):
        return any(math.hypot(X + 0.5 - ox, Y + 0.5 - oy) <= r + 1.5 for ox, oy, r in clumps) or \
               (((X + 0.5 - cx) / 15.0) ** 2 + ((Y + 0.5 - 24) / 17.0) ** 2 <= 1)

    for Y in range(46):
        for X in range(w):
            if not in_mass(X, Y):
                continue
            rim = not in_mass(X - 1, Y) or not in_mass(X + 1, Y) or not in_mass(X, Y - 1) or not in_mass(X, Y + 1)
            put(X, Y, gq(0) if rim else (gq(0.28) if hash_val(X, Y, 85) < 0.12 else gq(0.14)))

    for x0, y0, x1, y1 in [[cx, 46, cx - 11, 35], [cx, 44, cx + 11, 36], [cx, 36, cx - 9, 23], [cx, 34, cx + 9, 24], [cx, 28, cx, 14]]:
        line(x0, y0 + 1, x1, y1 + 1, BK['o'], 2)
        line(x0, y0, x1, y1, BK['d'], 2)

    for ox, oy, r in clumps:
        for Y in range(int(math.floor(oy - r)), int(oy + r) + 1):
            for X in range(int(math.floor(ox - r)), int(ox + r) + 1):
                dx = X + 0.5 - ox
                dy = Y + 0.5 - oy
                dd = math.hypot(dx, dy)
                if dd > r:
                    continue
                lit = (-dx - dy) / (r * 1.4)
                t = 0.45 + lit * 0.45 + (0.05 if dd < r * 0.5 else 0)
                if dy > 0 and abs(dd - r * 0.58) < 0.6:
                    t -= 0.3
                if dy < -r * 0.3 and dd > r - 2.2 and dd <= r - 1 and ((X + Y) % 3):
                    t += 0.25
                put(X, Y, gq(0) if dd > r - 1 else gq(t))

    GR = gq(0.6)
    GR2 = gq(0.85)
    for k in range(9):
        X = int(round(4 + hash_val(k, 1, 83) * 32))
        Y = int(round(72 + hash_val(k, 2, 83) * 4))
        if abs(X - cx) < 4:
            continue
        put(X, Y, GR)
        put(X, Y - 1, GR2)
        if hash_val(k, 3, 83) < 0.5:
            put(X - 1, Y, GR)
            put(X + 1, Y - 1, GR)

    return Image.frombytes('RGBA', (w, h), bytes(d))

def bake_tree(deco_path, shape, v):
    deco_im = Image.open(deco_path).convert('RGBA')
    scale = 3
    if shape == 'giant':
        sw, sh = 40, 78
        base_1x = sprout_giant_src(deco_im)
    elif shape == 'tall':
        sw, sh = 14, 29
        base_1x = deco_im.crop((1, 0, 15, 29))
    else: # big
        sw, sh = 24, 31
        base_1x = deco_im.crop((20, 1, 44, 32))

    d_1x = bytearray(base_1x.tobytes())
    sprout_tree_polish(d_1x, sw, sh)
    base_1x = Image.frombytes('RGBA', (sw, sh), bytes(d_1x))

    # upscale 3x nearest neighbor
    W, H = sw * scale, sh * scale
    up_im = base_1x.resize((W, H), Image.Resampling.NEAREST)
    d = bytearray(up_im.tobytes())

    if shape == 'big':
        sprout_canopy_detail(d, W, H)
        if v and v.startswith('f'):
            sprout_fruit(d, W, H, v, scale)

    # tint leaves
    for i in range(0, len(d), 4):
        if not d[i + 3]:
            continue
        # leaf check: green is dominant
        if d[i + 1] > d[i] + 4 and d[i + 1] >= d[i + 2]:
            tinted = sprout_tree_tint(v, d[i], d[i + 1], d[i + 2])
            d[i] = tinted[0]
            d[i + 1] = tinted[1]
            d[i + 2] = tinted[2]

    return Image.frombytes('RGBA', (W, H), bytes(d))

def main():
    deco_path = 'godot/assets/art/ground/deco_sprout_objs.png'
    out_dir = 'godot/assets/art/nature'
    os.makedirs(out_dir, exist_ok=True)
    
    trees = [
        ('tree_big.png', 'big', ''),
        ('tree_big_dark.png', 'big', 'd'),
        ('tree_big_snow.png', 'big', 'sn'),
        ('tree_big_swamp.png', 'big', 'sw'),
        ('tree_apple.png', 'big', 'fa'),
        ('tree_apple_bare.png', 'big', 'fb'),
        ('tree_orange.png', 'big', 'fo'),
        ('tree_tall.png', 'tall', ''),
        ('tree_tall_dark.png', 'tall', 'd'),
        ('tree_tall_snow.png', 'tall', 'sn'),
        ('tree_giant.png', 'giant', 'd'),
    ]
    
    for filename, shape, v in trees:
        im = bake_tree(deco_path, shape, v)
        dest = os.path.join(out_dir, filename)
        im.save(dest)
        print(f"Baked {filename} ({im.width}x{im.height}) -> {dest}")

if __name__ == '__main__':
    main()
