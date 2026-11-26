#!/usr/bin/env python3
"""Membuat lembar sprite chibi 48x48 (10 baris) untuk NPC Kesatria Arvan (kn1),
serasi proporsi & mata piksel hero_mc2 / gk2 tanpa pedang raksasa RPG Maker."""
from pathlib import Path
import numpy as np
from PIL import Image

OUT = (6, 1, 5)
SKIN_L = (236, 206, 172)
SKIN_D = (206, 152, 114)
HAIR_L = (129, 86, 58)
HAIR_D = (84, 48, 34)
STEEL_H = (216, 222, 228)
STEEL_M = (138, 150, 166)
STEEL_D = (67, 82, 104)
TEAL_L = (52, 166, 152)
TEAL_D = (28, 102, 98)
GOLD_L = (233, 192, 96)
GOLD_D = (160, 114, 42)
DARK_CL = (42, 46, 68)
BOOT_D = (68, 38, 30)

PAL = {
    'O': OUT, 's': SKIN_L, 'S': SKIN_D, 'h': HAIR_L, 'H': HAIR_D,
    'm': STEEL_H, 'M': STEEL_M, 'D': STEEL_D, 't': TEAL_L, 'T': TEAL_D,
    'g': GOLD_L, 'G': GOLD_D, 'c': DARK_CL, 'b': BOOT_D,
}


def blank():
    return np.zeros((48, 48, 4), dtype=np.uint8)


def put(cv, x, y, k):
    if 0 <= x < 48 and 0 <= y < 48 and k in PAL:
        cv[y, x] = (*PAL[k], 255)


def rect(cv, x0, y0, x1, y1, k):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            put(cv, x, y, k)


def ell(cv, cx, cy, rx, ry, k):
    for y in range(int(cy - ry) - 1, int(cy + ry) + 2):
        for x in range(int(cx - rx) - 1, int(cx + rx) + 2):
            if ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1.0:
                put(cv, x, y, k)


def apply_outline(cv):
    a = cv.copy()
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    n4 = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
    a[m & (n4 == 0)] = 0
    m = a[..., 3] > 0
    p = np.pad(m, 1)
    ring = (~m) & (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:])
    a[ring] = (*OUT, 255)
    return Image.fromarray(a)


def draw_kn1_front(step=0, breathe=0, talk=0, laugh=0):
    cv = blank()
    bob = -1 if step in (1, 3) else 0
    yb = 1 if (breathe == 1 or laugh == 1) else 0
    l_y = 37 + (-2 if step == 1 else 0)
    r_y = 37 + (-2 if step == 3 else 0)
    rect(cv, 19, 34 + bob, 21, min(42, l_y + 3), 'c')
    rect(cv, 25, 34 + bob, 27, min(42, r_y + 3), 'c')
    rect(cv, 18, l_y + 4, 21, l_y + 9 if step != 1 else l_y + 7, 'D')
    rect(cv, 18, l_y + 7 if step != 1 else l_y + 6, 21, 46 if step != 1 else 44, 'b')
    rect(cv, 25, r_y + 4, 28, r_y + 9 if step != 3 else r_y + 7, 'D')
    rect(cv, 25, r_y + 7 if step != 3 else r_y + 6, 28, 46 if step != 3 else 44, 'b')
    if step in (0, 2, 3):
        rect(cv, 18, 45, 21, 46, 'b')
    if step in (0, 1, 2):
        rect(cv, 25, 45, 28, 46, 'b')

    # Sarung pedang ringkas di pinggang kiri
    rect(cv, 28, 30 + bob + yb, 30, 38 + bob + yb, 'b')
    put(cv, 29, 28 + bob + yb, 'g')
    put(cv, 30, 27 + bob + yb, 'G')

    # Badan pirus + zirah dada baja beraksen salib emas halus
    rect(cv, 18, 20 + bob + yb, 28, 34 + bob + yb, 't')
    rect(cv, 18, 29 + bob + yb, 28, 35 + bob + yb, 'T')
    rect(cv, 19, 21 + bob + yb, 27, 27 + bob + yb, 'M')
    rect(cv, 20, 21 + bob + yb, 26, 25 + bob + yb, 'm')
    rect(cv, 23, 22 + bob + yb, 23, 26 + bob + yb, 'g')
    rect(cv, 22, 23 + bob + yb, 24, 23 + bob + yb, 'g')
    # Sabuk kulit & gesper emas
    rect(cv, 18, 28 + bob + yb, 28, 29 + bob + yb, 'H')
    rect(cv, 22, 28 + bob + yb, 24, 29 + bob + yb, 'g')
    # Pelindung bahu
    rect(cv, 14, 20 + bob + yb, 18, 24 + bob + yb, 'M')
    rect(cv, 15, 20 + bob + yb, 17, 22 + bob + yb, 'm')
    rect(cv, 28, 20 + bob + yb, 32, 24 + bob + yb, 'M')
    rect(cv, 29, 20 + bob + yb, 31, 22 + bob + yb, 'm')
    # Lengan & tangan
    la = 25 + bob + yb + (-1 if step == 3 else 1 if step == 1 else 0) + (-2 if laugh else 0)
    ra = 25 + bob + yb + (-1 if step == 1 else 1 if step == 3 else 0) + (-2 if laugh else 0)
    rect(cv, 15, la, 17, la + 4, 't')
    rect(cv, 15, la + 5, 17, la + 6, 's')
    rect(cv, 29, ra, 31, ra + 4, 't')
    rect(cv, 29, ra + 5, 31, ra + 6, 's')

    # Kepala & wajah chibi mulus
    hy = bob + (1 if laugh == 1 else 0)
    ell(cv, 23, 13 + hy, 6.2, 5.2, 's')
    rect(cv, 20, 17 + hy, 26, 17 + hy, 'S')
    ell(cv, 23, 8 + hy, 6.8, 4.6, 'h')
    rect(cv, 16, 8 + hy, 18, 14 + hy, 'H')
    rect(cv, 28, 8 + hy, 30, 14 + hy, 'H')
    rect(cv, 18, 10 + hy, 21, 11 + hy, 'h')
    rect(cv, 23, 10 + hy, 25, 11 + hy, 'H')
    rect(cv, 26, 10 + hy, 28, 11 + hy, 'h')
    put(cv, 21, 3 + hy, 'H')
    put(cv, 23, 3 + hy, 'h')
    put(cv, 25, 3 + hy, 'h')
    rect(cv, 17, 7 + hy, 29, 8 + hy, 'M')
    rect(cv, 21, 7 + hy, 25, 8 + hy, 'g')
    put(cv, 23, 7 + hy, 'm')
    if laugh:
        rect(cv, 20, 13 + hy, 21, 13 + hy, 'O')
        rect(cv, 25, 13 + hy, 26, 13 + hy, 'O')
        rect(cv, 22, 15 + hy, 24, 15 + hy, 'O')
    else:
        rect(cv, 20, 13 + hy, 20, 14 + hy, 'O')
        rect(cv, 26, 13 + hy, 26, 14 + hy, 'O')
        if talk == 1:
            rect(cv, 22, 16 + hy, 24, 16 + hy, 'H')
        elif talk == 2:
            put(cv, 23, 16 + hy, 'H')
    return apply_outline(cv)


def draw_kn1_up(step=0, breathe=0):
    cv = blank()
    bob = -1 if step in (1, 3) else 0
    yb = 1 if breathe == 1 else 0
    l_y = 37 + (-2 if step == 1 else 0)
    r_y = 37 + (-2 if step == 3 else 0)
    rect(cv, 19, 34 + bob, 21, min(42, l_y + 3), 'c')
    rect(cv, 25, 34 + bob, 27, min(42, r_y + 3), 'c')
    rect(cv, 18, l_y + 4, 21, 46 if step != 1 else 44, 'b')
    rect(cv, 25, r_y + 4, 28, 46 if step != 3 else 44, 'b')
    if step in (0, 2, 3):
        rect(cv, 18, 45, 21, 46, 'b')
    if step in (0, 1, 2):
        rect(cv, 25, 45, 28, 46, 'b')
    rect(cv, 18, 21 + bob + yb, 28, 35 + bob + yb, 'T')
    rect(cv, 19, 21 + bob + yb, 27, 33 + bob + yb, 't')
    rect(cv, 18, 28 + bob + yb, 28, 29 + bob + yb, 'H')
    rect(cv, 14, 20 + bob + yb, 17, 25 + bob + yb, 'M')
    rect(cv, 29, 20 + bob + yb, 32, 25 + bob + yb, 'M')
    la = 25 + bob + yb + (-1 if step == 3 else 1 if step == 1 else 0)
    ra = 25 + bob + yb + (-1 if step == 1 else 1 if step == 3 else 0)
    rect(cv, 15, la, 17, la + 5, 't')
    rect(cv, 29, ra, 31, ra + 5, 't')
    rect(cv, 27, 29 + bob + yb, 29, 37 + bob + yb, 'b')
    put(cv, 28, 28 + bob + yb, 'g')
    ell(cv, 23, 11 + bob, 6.8, 6.2, 'h')
    rect(cv, 17, 13 + bob, 29, 17 + bob, 'H')
    rect(cv, 17, 7 + bob, 29, 8 + bob, 'M')
    return apply_outline(cv)


def draw_kn1_side(step=0, breathe=0, diag=0, flip=False):
    cv = blank()
    bob = -1 if step in (1, 3) else 0
    yb = 1 if breathe == 1 else 0
    fwd = 4 if step == 1 else (-3 if step == 3 else 1)
    bwd = -3 if step == 1 else (4 if step == 3 else -1)
    rect(cv, 21 + bwd, 36 + bob, 24 + bwd, 43, 'c')
    rect(cv, 21 + bwd, 43, 25 + bwd, 46, 'b')
    rect(cv, 21 + fwd, 36 + bob, 24 + fwd, 42, 'D')
    rect(cv, 21 + fwd, 42, 25 + fwd, 46, 'b')

    rect(cv, 17, 21 + bob + yb, 20, 34 + bob + yb, 'T')
    rect(cv, 20, 20 + bob + yb, 27, 34 + bob + yb, 't')
    rect(cv, 21, 21 + bob + yb, 27, 27 + bob + yb, 'M')
    rect(cv, 23, 21 + bob + yb, 27, 25 + bob + yb, 'm')
    rect(cv, 19, 28 + bob + yb, 27, 29 + bob + yb, 'H')
    rect(cv, 25, 28 + bob + yb, 27, 29 + bob + yb, 'g')

    arm_x = 21 + (2 if step == 3 else -2 if step == 1 else 0)
    rect(cv, arm_x, 21 + bob + yb, arm_x + 3, 25 + bob + yb, 'm')
    rect(cv, arm_x, 25 + bob + yb, arm_x + 3, 30 + bob + yb, 't')
    rect(cv, arm_x, 30 + bob + yb, arm_x + 3, 32 + bob + yb, 's')

    rect(cv, 18, 30 + bob + yb, 23, 32 + bob + yb, 'b')
    put(cv, 24, 29 + bob + yb, 'g')

    ell(cv, 23, 13 + bob, 5.6, 5.2, 's')
    rect(cv, 17, 7 + bob, 26, 15 + bob, 'H')
    ell(cv, 22, 8 + bob, 6.4, 4.4, 'h')
    if diag >= 0:
        rect(cv, 23, 11 + bob, 28, 17 + bob, 's')
        rect(cv, 24, 17 + bob, 27, 17 + bob, 'S')
        rect(cv, 23, 10 + bob, 27, 11 + bob, 'h')
        if diag == 1:
            rect(cv, 24, 13 + bob, 24, 14 + bob, 'O')
            rect(cv, 27, 13 + bob, 27, 14 + bob, 'O')
        else:
            rect(cv, 26, 13 + bob, 26, 14 + bob, 'O')
    else:
        rect(cv, 17, 8 + bob, 26, 17 + bob, 'H')
        rect(cv, 25, 13 + bob, 28, 16 + bob, 's')
        put(cv, 27, 13 + bob, 'O')
    rect(cv, 17, 7 + bob, 28, 8 + bob, 'M')
    rect(cv, 25, 7 + bob, 28, 8 + bob, 'g')

    im = apply_outline(cv)
    if flip:
        im = im.transpose(Image.FLIP_LEFT_RIGHT)
    return im


def build():
    W, H, COLS, ROWS = 48, 48, 8, 10
    sheet = Image.new('RGBA', (W * COLS, H * ROWS), (0, 0, 0, 0))

    def put_row(r, frames):
        for c, fr in enumerate(frames):
            sheet.paste(fr, (c * W, r * H))

    put_row(0, [draw_kn1_front(s) for s in (0, 1, 2, 3)])
    put_row(1, [draw_kn1_up(s) for s in (0, 1, 2, 3)])
    put_row(2, [draw_kn1_side(s, diag=0) for s in (0, 1, 2, 3)])
    put_row(3, [
        draw_kn1_front(0, 0), draw_kn1_front(0, 1),
        draw_kn1_side(0, 0), draw_kn1_side(0, 1),
        draw_kn1_up(0, 0), draw_kn1_up(0, 1),
    ])
    put_row(4, [draw_kn1_front(0, 0, t) for t in (0, 1, 0, 2)])
    put_row(5, [draw_kn1_front(0, 0, 0, l) for l in (1, 2, 1, 2, 1, 2)])
    put_row(6, [draw_kn1_side(s, diag=1, flip=False) for s in (0, 1, 2, 3)])
    put_row(7, [draw_kn1_side(s, diag=-1, flip=False) for s in (0, 1, 2, 3)])
    put_row(8, [draw_kn1_side(s, diag=1, flip=True) for s in (0, 1, 2, 3)])
    put_row(9, [draw_kn1_side(s, diag=-1, flip=True) for s in (0, 1, 2, 3)])

    out_path = Path('assets/img/npc/npc_sheet_kn1.png')
    sheet.save(out_path)
    arr = np.array(sheet)
    cols = {tuple(int(v) for v in c) for c in arr[arr[..., 3] > 0][:, :3]}
    print('Saved', out_path, sheet.size, 'colors:', len(cols))
    assert len(cols) <= 16
    for r in range(ROWS):
        cell = arr[r * H:(r + 1) * H, 0:W]
        assert int((cell[..., 3] > 0).sum()) >= 80
        if r < 3:
            assert int((cell[H - 1, :, 3] > 0).sum()) > 0
    prev = Path('/Users/herlambang/.gemini/antigravity/brain/ab1c480f-6d86-4dc3-9b19-9cae2ad67479/scratch/kn1_new_preview.png')
    preview = Image.new('RGBA', (W * 4 * 3, H * 4 * 3), (38, 42, 54, 255))
    sub = Image.new('RGBA', (W * 4, H * 4), (0, 0, 0, 0))
    for rr in range(4):
        row_src = [0, 2, 5, 6][rr]
        for cc in range(4):
            sub.paste(sheet.crop((cc * W, row_src * H, (cc + 1) * W, (row_src + 1) * H)), (cc * W, rr * H))
    scaled = sub.resize((W * 4 * 3, H * 4 * 3), Image.NEAREST)
    preview.paste(scaled, (0, 0), scaled)
    preview.save(prev)


if __name__ == '__main__':
    build()
