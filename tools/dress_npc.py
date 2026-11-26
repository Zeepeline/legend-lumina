#!/usr/bin/env python3
"""Dandani templat 16x32 Eris Esra (assets/ref, tidak ikut git) menjadi lembar NPC 48x48 warna rata (docs/NPC_ROSTER.md).
Pakai: python3 tools/dress_npc.py <folder keluaran> [id ...]
Templat: Eris Esra, https://erisesra.itch.io/character-templates-pack (boleh untuk game; templatnya jangan disebarkan ulang)."""
import os, sys
from PIL import Image
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL = os.path.join(ROOT, "assets/ref/Eris Esra's Character Template 4/16x32/16x32 %s-Sheet.png")
WHITE, NOSE, BLUSH, SHADE, LINE = (250, 243, 232), (231, 213, 198), (209, 157, 167), (185, 179, 161), (47, 37, 34)
OUT = (46, 30, 28)
NPC = {
    'smith': dict(skin=(226, 160, 116), hair=(74, 44, 34), shirt=None, vest=(96, 84, 84), pants=(72, 72, 88), shoe=(74, 44, 34), apron=(140, 88, 50), style='bald', beard=1, work='hammer'),
    'woman': dict(skin=(244, 200, 166), hair=(44, 34, 44), shirt=(134, 44, 84), pants=(134, 44, 84), shoe=(84, 50, 40), apron=(238, 228, 210), style='bun', skirt=1, work='bend'),
    'merchant': dict(skin=(236, 184, 146), hair=(112, 66, 42), shirt=(232, 206, 150), pants=(78, 122, 84), shoe=(84, 50, 40), apron=(192, 88, 62), style='scarf', scarf=(192, 88, 62), skirt=1, work='bend'),
}
sheets = {}


def cell(name, row, col):
    if name not in sheets:
        sheets[name] = Image.open(TPL % name).convert('RGBA')
    return sheets[name].crop((col * 32, row * 32, col * 32 + 32, row * 32 + 32))


def dress(src, d, c, hammer=None, spark=0):
    """src 32x32 → 48x48 berpakaian; d = down/up/side."""
    ht = src.getbbox()[1]
    op = lambda x, y: src.getpixel((x, y))[3] > 0
    run = [x for x in range(32) if op(x, ht + 4)]
    x0, x1 = min(run), max(run)          # tepi kiri/kanan kepala (garis tepi)
    if d == 'side':
        x1 = x0 + 10
    mid = (x0 + x1) / 2
    im = Image.new('RGBA', (48, 48))
    P = lambda x, y, col: 0 <= x + 8 < 48 and 0 <= y + 16 < 48 and im.putpixel((x + 8, y + 16), col + (255,))
    G = lambda x, y: im.getpixel((x + 8, y + 16)) if 0 <= x + 8 < 48 and 0 <= y + 16 < 48 else (0, 0, 0, 0)
    for y in range(32):
        for x in range(32):
            if not op(x, y):
                continue
            k, r, off = src.getpixel((x, y))[:3], y - ht, abs(x - mid)
            if k == LINE:
                P(x, y, OUT); continue
            if r <= 11 and off <= 8:
                P(x, y, tuple(int(v * .9) for v in c['skin']) if k == BLUSH else c['skin'])
            elif k == SHADE and r >= 18 and off < 7:
                P(x, y, c['pants'])
            elif k == WHITE and r >= 23:
                P(x, y, c['shoe'])
            elif (off >= 6 and r >= 17) or (d == 'side' and r >= 17 and k == WHITE and r < 21):
                P(x, y, c['skin'])           # tangan
            elif c.get('vest') and (off < 4.5 or d == 'side' and r > 11 and off < 4):
                P(x, y, c['vest'] if r < 19 else c['pants'])
            else:
                P(x, y, c['shirt'] or c['skin'])
    # celemek
    if c['apron'] and d != 'up':
        for r in range(13, 21 if not c.get('skirt') else 22):
            for x in range(int(x0 + 2), int(x1 - 1)):
                y = ht + r
                g = G(x, y)
                ok = g[:3] in ((c['shirt'] or c['skin']), c['pants'], c.get('vest')) and g[3]
                if d == 'side':
                    ok = ok and x >= mid
                if ok and (d == 'side' or abs(x - mid) < 4):
                    P(x, y, c['apron'])
    if c['apron'] and d == 'up':
        for x in range(x0 + 1, x1):
            if G(x, ht + 18)[:3] != OUT and G(x, ht + 18)[3]:
                P(x, ht + 18, c['apron'])
    if c.get('vest') and d == 'up':
        for r in range(12, 18):
            for x in (int(mid - 2), int(mid + 3)):
                if G(x, ht + r)[:3] == c['vest']:
                    P(x, ht + r, c['apron'])
    # rok: rentang kaki diisi
    if c.get('skirt'):
        for r in range(18, 23):
            y = ht + r
            w = 3 + (r - 17) * .5
            l, e = int(mid - w), int(mid + w + .9)
            if d == 'side':
                l, e = l + 1, e
            for x in range(l, e + 1):
                front = c['apron'] if d != 'up' and (abs(x - mid) < 2.5 if d == 'down' else x > mid + .5) and r < 22 else c['pants']
                P(x, y, OUT if x in (l, e) or r == 22 and x in (l, e) else front)
        for x in range(int(mid - 5), int(mid + 7)):
            if not G(x, ht + 23)[3] and G(x, ht + 22)[3] :
                P(x, ht + 23, OUT)
    head(P, G, d, c, ht, x0, x1, mid)
    if hammer:
        tool(P, hammer, spark)
    return im


def head(P, G, d, c, ht, x0, x1, mid):
    H, st = c['hair'], c['style']
    skinish = lambda x, y: G(x, y)[3] and G(x, y)[:3] != OUT
    cap = c.get('scarf') or H
    if st != 'bald':
        for r in range(1, 11):
            for x in range(x0 - 2, x1 + 3):
                y, i = ht + r, x - x0
                if not skinish(x, y):
                    continue
                if d == 'up':
                    P(x, y, cap if st != 'scarf' or r < 8 else H)
                elif d == 'down':
                    if r <= 4:
                        P(x, y, cap if r < 4 else H)
                    elif r == 5 and i not in (4, 5, 8):
                        P(x, y, H)
                    elif r <= 8 and (i <= 1 or i >= x1 - x0 - 1):
                        P(x, y, H)
                else:
                    if r <= 4:
                        P(x, y, cap if r < 4 or i < 4 else H)
                    elif r <= 9 and i <= 4 and not (6 <= r <= 8 and i == 4):
                        P(x, y, cap if st == 'scarf' and r < 7 else H)
                    elif r == 5 and i >= 8:
                        P(x, y, H)
    if st == 'bun':
        bx = int(mid + .5) if d != 'side' else x0 + 2
        for j, row in enumerate(['.####.', '#hhhh#', '#hhhh#']):
            for i, ch in enumerate(row):
                if ch != '.':
                    P(bx - 3 + i, ht - 2 + j, OUT if ch == '#' else H)
    if st == 'scarf' and d != 'down':   # simpul belakang
        bx = int(mid) - 1 if d == 'up' else x0 - 1
        for i, j in ((0, 0), (1, 0), (2, 0), (0, 1), (2, 1), (0, 2), (2, 2)):
            P(bx + i - (1 if d == 'side' else 0), ht + 8 + j, c['scarf'] if j else OUT)
    if c.get('beard') and d != 'up':
        for r in range(8, 13):
            for x in range(x0 - 1, x1 + 3):
                i = x - x0
                inside = skinish(x, ht + r) if r < 11 else True
                if d == 'down' and inside and 1 <= i - (r > 10) and i + (r > 10) <= x1 - x0 - 1 + (r < 9) and r >= 9:
                    P(x, ht + r, OUT if r == 12 else H)
                if d == 'side' and inside and i >= 5 + (r > 10) and i <= 11 - (r > 10) and r >= 9:
                    P(x, ht + r, OUT if r == 12 else H)
        if d == 'down':
            for i in (5, 6):
                P(x0 + i, ht + 10, c['skin'])


def tool(P, h, spark):
    hx, hy, tx, ty, flat = h
    n = max(abs(tx - hx), abs(ty - hy))
    pts = [(round(hx + (tx - hx) * k / n), round(hy + (ty - hy) * k / n)) for k in range(n + 1)]
    for x, y in pts:
        for a, b in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            P(x + a, y + b, OUT)
    for x, y in pts:
        P(x, y, (150, 100, 58))
    w, hh = (9, 5) if flat else (5, 9)
    for j in range(hh):
        for i in range(w):
            e = i in (0, w - 1) or j in (0, hh - 1)
            P(tx - w // 2 + i, ty - hh // 2 + j, OUT if e else (156, 162, 176))
    if spark:
        for x, y in ((35, 17), (37, 20), (38, 24), (33, 15))[:4]:
            P(x, y + (spark - 1) * -2, (250, 160, 60))


def sheet(npc):
    c = NPC[npc]
    rows = [[dress(cell('Walk', r, k), d, c) for k in range(4)] for r, d in ((0, 'down'), (4, 'up'), (2, 'side'))]
    rows.append([dress(cell('Idle', r, k), d, c) for r, d in ((0, 'down'), (2, 'side'), (4, 'up')) for k in (0, 1)])
    rows.append([dress(cell('Idle', 0, k), 'down', c) for k in (0, 1, 0, 2)])
    if c['work'] == 'hammer':
        A = lambda k: cell('Attack', 2, k)
        rows.append([dress(A(0), 'side', c, (21, 18, 23, 9, 1)), dress(A(1), 'side', c, (9, 20, 6, 11, 1)), dress(A(1), 'side', c, (9, 20, 4, 12, 1)),
                     dress(A(5), 'side', c, (29, 21, 34, 21, 0)), dress(A(5), 'side', c, (29, 21, 34, 23, 0), 1), dress(A(6), 'side', c, (21, 18, 26, 11, 1))])
    else:
        rows.append([dress(cell('Interact', 2, k), 'side', c) for k in range(4)])
    im = Image.new('RGBA', (384, 48 * len(rows)))
    for r, R in enumerate(rows):
        for k, f in enumerate(R):
            im.paste(f, (k * 48, r * 48))
    return im


if __name__ == '__main__':
    out = sys.argv[1]
    os.makedirs(out, exist_ok=True)
    for n in sys.argv[2:] or NPC:
        sheet(n).save(os.path.join(out, 'npc_sheet_%s.png' % n))
