"""Contoh tampilan HUD kayu & perkamen di atas tangkapan layar game (skala dasar 480×270)."""
import sys
from PIL import Image
sys.path.insert(0, 'tools/hud_wood')
from pixfont import text

F = (6, 1, 5); MAR = (84, 25, 32); RED = (163, 41, 28); CREAM = (236, 206, 172); SKIN = (233, 185, 110)
K = (183, 115, 79); I = (112, 59, 46); G = (145, 96, 80); B = (67, 85, 109); D = (48, 52, 88)
C = (166, 171, 64); A = (120, 139, 79); WHITE = (250, 240, 220); GOLD = (240, 194, 113); BLUE = (62, 120, 190)
LBLUE = (130, 190, 230)


def px(im, x, y, c):
    if 0 <= x < im.width and 0 <= y < im.height:
        im.putpixel((x, y), c)


def rect(im, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            px(im, xx, yy, c)


def wood(im, x, y, w, h, inner=CREAM):
    """Bingkai kayu 3 px (gelap-terang-gelap) + isi perkamen, sudut membulat, paku di sudut."""
    rect(im, x + 1, y, w - 2, h, F); rect(im, x, y + 1, w, h - 2, F)
    rect(im, x + 1, y + 1, w - 2, h - 2, G)
    rect(im, x + 1, y + 1, w - 2, 1, K)                 # sorot atas
    rect(im, x + 1, y + h - 2, w - 2, 1, I)             # bayangan bawah
    for xx in range(x + 4, x + w - 4, 7):               # serat kayu
        px(im, xx, y + 1, G); px(im, xx + 3, y + h - 2, MAR)
    rect(im, x + 3, y + 3, w - 6, h - 6, F)
    if inner:
        rect(im, x + 4, y + 4, w - 8, h - 8, inner)
        rect(im, x + 4, y + 4, w - 8, 1, WHITE)
        rect(im, x + 4, y + h - 5, w - 8, 1, SKIN)
    for cx, cy in ((x + 1, y + 1), (x + w - 2, y + 1), (x + 1, y + h - 2), (x + w - 2, y + h - 2)):
        px(im, cx, cy, GOLD)


HEART = [".##.##.", "#######", "#######", ".#####.", "..###..", "...#..."]


def heart(im, x, y, full=True):
    for j, row in enumerate(HEART):
        for i, c in enumerate(row):
            if c == '#':
                edge = j == 0 or i in (0, 6) or j >= 3 and (i == j - 2 or i == 8 - j)
                px(im, x + i, y + j, F if edge and False else (RED if full else MAR))
    if full:
        px(im, x + 1, y + 1, WHITE); px(im, x + 2, y + 1, (240, 120, 100))
    # garis tepi
    for j, row in enumerate(HEART):
        for i, c in enumerate(row):
            if c == '#':
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ii, jj = i + dx, j + dy
                    if not (0 <= jj < 6 and 0 <= ii < 7 and HEART[jj][ii] == '#'):
                        px(im, x + ii, y + jj, F)


CRYS = ["..#..", ".###.", "#####", ".###.", "..#.."]


def crystal(im, x, y, full=True):
    for j, row in enumerate(CRYS):
        for i, c in enumerate(row):
            if c == '#':
                px(im, x + i, y + j, (LBLUE if i < 2 and j < 3 else BLUE) if full else D)
    for j, row in enumerate(CRYS):
        for i, c in enumerate(row):
            if c == '#':
                for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                    ii, jj = i + dx, j + dy
                    if not (0 <= jj < 5 and 0 <= ii < 5 and CRYS[jj][ii] == '#'):
                        px(im, x + ii, y + jj, F)


def bar(im, x, y, w, h, frac, col, hi, empty, label):
    """Bar kemajuan berbingkai hitam: isi berwarna + sorot atas, angka di tengah."""
    rect(im, x + 1, y, w - 2, h, F); rect(im, x, y + 1, w, h - 2, F)
    rect(im, x + 1, y + 1, w - 2, h - 2, empty)
    fw = int((w - 2) * frac)
    rect(im, x + 1, y + 1, fw, h - 2, col)
    rect(im, x + 1, y + 1, fw, 1, hi)
    rect(im, x + 1, y + h - 2, fw, 1, tuple(int(c * 0.7) for c in col))
    tw = len(label) * 6 - 1
    text(im, x + (w - tw) // 2, y + 1, label, WHITE)


def icon(im, x, y, art, pal):
    for j, row in enumerate(art):
        for i, c in enumerate(row):
            if c in pal:
                px(im, x + i, y + j, pal[c])


BOOK = ["............", ".FFFFF.FFFFF", "FRRRRRFWWWWF", "FRYYRRFWCCWF", "FRRRRRFWWWWF", "FRYYRRFWCCWF", "FRRRRRFWWWWF",
        "FRRRRRFWCCWF", "FRRRRRFWWWWF", "FIIIIIFIIIIF", ".FFFFF.FFFFF", "............"]
BAG = ["....FFFF....", "...F....F...", "...F....F...", ".FFFFFFFFFF.", "FKKKKKKKKKKF", "FGKKKFFKKKGF", "FGKKKFYFKKGF",
       "FGGKKKFKKGGF", "FGGGKKKKGGGF", "FIGGGGGGGGIF", ".FFFFFFFFFF.", "............"]
MAP = ["............", "FFFFFFFFFFFF", "FWCWWWCCWWWF", "FWWCWWWCWWCF", "FWWWCCWWWCWF", "FCWWWWRWWWWF", "FWCCWRWRWCWF",
       "FWWWCWRWWWCF", "FWCWWWWCCWWF", "FFFFFFFFFFFF", "............", "............"]
GEAR = ["....FFFF....", "..FFYYYYFF..", ".FYYYYYYYYF.", ".FYYFFFFYYF.", "FYYF....FYYF", "FYYF....FYYF", "FYYF....FYYF",
        "FYYF....FYYF", ".FYYFFFFYYF.", ".FYYYYYYYYF.", "..FFYYYYFF..", "....FFFF...."]
SUN = ["..Y.Y..", "...Y...", "Y.YYY.Y", ".YYYYY.", "Y.YYY.Y", "...Y...", "..Y.Y.."]
COIN = [".FFFF.", "FYYYYF", "FYWYYF", "FYYYYF", "FYYYOF", ".FFFF."]
POT = ["..FF..", "..FF..", ".FRRF.", "FRWRRF", "FRRRRF", ".FFFF."]
COMP = [".FFF.", "FWRWF", "FWRWF", "FWBWF", ".FFF."]
FIRE = ["...R....", "..RO....", "..ROR...", ".ROYOR..", ".RYYYOR.", "RYYWYYR.", ".RYYYR..", "..RRR..."]
PAL = {'F': F, 'R': RED, 'Y': GOLD, 'W': WHITE, 'G': G, 'K': K, 'I': I, 'C': (170, 140, 90), 'O': (230, 120, 40), 'B': B}


def main(src, out):
    base = Image.open(src).convert('RGB').resize((480, 270), Image.NEAREST)
    im = base.copy()
    # --- panel status kiri atas ---
    wood(im, 3, 3, 122, 45)
    wood(im, 6, 6, 30, 39, inner=(200, 220, 170))     # bingkai potret
    hero = Image.open('godot/assets/art/hero/hero_mc2.png').convert('RGBA').crop((20, 6, 44, 30))
    im.paste(hero, (9, 14), hero)
    bar(im, 40, 8, 80, 9, 0.8, RED, (230, 110, 90), MAR, '80/100')
    rect(im, 40, 18, 80, 3, F); rect(im, 41, 19, 78, 1, A); rect(im, 41, 19, 52, 1, C)     # stamina
    bar(im, 40, 22, 80, 9, 0.67, BLUE, LBLUE, D, '20/30')
    text(im, 40, 33, 'LV1', MAR)
    rect(im, 60, 34, 60, 5, F); rect(im, 61, 35, 58, 3, (205, 170, 120)); rect(im, 61, 35, 22, 3, GOLD)
    rect(im, 61, 35, 22, 1, WHITE)
    # --- tombol ikon atas tengah ---
    for n, art in enumerate((BOOK, BAG, MAP, GEAR)):
        x = 182 + n * 28
        wood(im, x, 3, 24, 24)
        icon(im, x + 6, 9, art, PAL)
    # --- info kanan atas ---
    wood(im, 300, 3, 177, 20)
    icon(im, 307, 9, SUN, PAL); text(im, 316, 9, '09:00', MAR)
    icon(im, 351, 10, COMP, PAL); text(im, 358, 9, 'U', MAR)
    icon(im, 370, 10, COIN, PAL); text(im, 378, 9, '40', MAR)
    icon(im, 396, 10, POT, PAL); text(im, 404, 9, '3', MAR)
    text(im, 416, 9, '+2', A)
    # --- catatan misi (perkamen tersemat) ---
    nx, ny, nw, nh = 352, 27, 125, 30
    rect(im, nx, ny, nw, nh, F); rect(im, nx + 1, ny + 1, nw - 2, nh - 2, CREAM)
    rect(im, nx + 1, ny + 1, nw - 2, 1, WHITE); rect(im, nx + 1, ny + nh - 2, nw - 2, 1, SKIN)
    for xx in range(nx + 2, nx + nw - 2, 5):
        px(im, xx, ny + nh - 1, (0, 0, 0, 0) if False else base.getpixel((xx, ny + nh - 1)))
    px(im, nx + nw // 2, ny + 2, RED); px(im, nx + nw // 2, ny + 1, F); px(im, nx + nw // 2 - 1, ny + 2, F); px(im, nx + nw // 2 + 1, ny + 2, F)
    text(im, nx + 5, ny + 5, 'MISI', RED)
    rect(im, nx + 5, ny + 13, nw - 10, 1, SKIN)
    text(im, nx + 5, ny + 17, 'TEMUI TETUA BRAM', MAR)
    # --- bilah jurus bawah ---
    for n in range(5):
        x = 180 + n * 25
        wood(im, x, 244, 23, 23, inner=CREAM if n == 0 else (205, 180, 140))
        if n == 0:
            icon(im, x + 8, 251, FIRE, PAL)
            text(im, x + 15, 258, '3', MAR)
    # --- petunjuk interaksi di atas pemain ---
    wood(im, 207, 101, 62, 17)
    text(im, 213, 106, 'E', RED); text(im, 221, 106, 'BICARA', MAR)
    im.resize((1440, 810), Image.NEAREST).save(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
