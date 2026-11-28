"""Contoh tampilan menu Tas & Perlengkapan gaya kayu & perkamen (skala dasar 480×270)."""
import sys
from PIL import Image, ImageEnhance
sys.path.insert(0, 'tools/hud_wood')
from pixfont import text
from mockup import (F, MAR, RED, CREAM, SKIN, K, I, G, B, D, C, A, WHITE, GOLD, BLUE, LBLUE,
                    px, rect, wood, icon, PAL)

PARCH_D = (214, 182, 140)   # perkamen gelap (isi slot)
SLOT_SH = (180, 140, 100)

POTION = ["....FF....", "...FWWF...", "....FF....", "...FRRF...", "..FRWRRF..", ".FRWRRRRF.", ".FRRRRRRF.",
          ".FRRRRRIF.", "..FRRRIF..", "...FFFF..."]
ETHER = [r.replace('R', 'B').replace('I', 'N') for r in POTION]
SWORD = ["........FF", ".......FWF", "......FWF.", ".....FWF..", "....FWF...", ".F.FWF....", "..FYF.....",
         "..FIF.....", ".FIF.F....", "FF........"]
ARMOR = [".FF....FF.", "FKKFFFFKKF", "FKKKKKKKKF", ".FKKKKKKF.", ".FKGKKGKF.", ".FKKKKKKF.", ".FKKGGKKF.",
         ".FKKKKKKF.", "..FFFFFF..", ".........."]
HERB = ["....F.....", "...FAF....", "..FAAF.F..", "..FAF.FAF.", ".FAAFFAAF.", "..FFAAFF..", "....FAF...",
        "....FIF...", "....FIF...", ".....F...."]
PAL2 = dict(PAL, N=D, A=A, B=BLUE)
STAT = {'ATK': SWORD, 'DEF': ARMOR}


def slot(im, x, y, s=22, sel=False):
    rect(im, x, y, s, s, F)
    rect(im, x + 1, y + 1, s - 2, s - 2, GOLD if sel else SLOT_SH)
    rect(im, x + 2, y + 2, s - 4, s - 4, PARCH_D if not sel else CREAM)
    rect(im, x + 2, y + 2, s - 4, 1, SLOT_SH if not sel else WHITE)


def ribbon(im, x, y, w, label, active):
    col = RED if active else (120, 70, 60)
    h = 14 if active else 12
    rect(im, x, y, w, h, F)
    rect(im, x + 1, y + 1, w - 2, h - 1, col)
    rect(im, x + 1, y + 1, w - 2, 1, (210, 90, 70) if active else (150, 95, 80))
    tw = len(label) * 6 - 1
    text(im, x + (w - tw) // 2, y + 3, label, WHITE if active else (220, 190, 170))


def button(im, x, y, w, label):
    wood(im, x, y, w, 15, inner=None)
    rect(im, x + 3, y + 3, w - 6, 9, (120, 70, 50))
    tw = len(label) * 6 - 1
    text(im, x + (w - tw) // 2, y + 4, label, CREAM)


def main(src, out):
    base = Image.open(src).convert('RGB').resize((480, 270), Image.NEAREST)
    im = ImageEnhance.Brightness(base).enhance(0.45)
    X, Y, W, H = 36, 26, 408, 232
    for n, (lab, act) in enumerate((('BARANG', True), ('SENJATA', False), ('ZIRAH', False))):
        ribbon(im, X + 150 + n * 64, Y - 12 + (0 if act else 1), 60, lab, act)
    wood(im, X, Y, W, H)
    # papan judul
    wood(im, X + 10, Y - 8, 60, 18, inner=None)
    rect(im, X + 13, Y - 5, 54, 12, (120, 70, 50))
    text(im, X + 18, Y - 3, 'TAS', CREAM)
    # tombol tutup: segel lilin merah
    cx, cy = X + W - 8, Y + 2
    for yy in range(-7, 8):
        for xx in range(-7, 8):
            d = xx * xx + yy * yy
            if d <= 49:
                px(im, cx + xx, cy + yy, F if d > 36 else (RED if d > 9 or True else RED))
    for k in range(-3, 4):
        px(im, cx + k, cy + k, CREAM); px(im, cx + k, cy - k, CREAM)
    # --- kolom kiri: karakter & perlengkapan ---
    lx, ly = X + 10, Y + 14
    rect(im, lx, ly, 120, 206, F); rect(im, lx + 1, ly + 1, 118, 204, (226, 196, 156))
    slot(im, lx + 28, ly + 6, 64)
    hero = Image.open('godot/assets/art/hero/hero_mc2.png').convert('RGBA').crop((0, 0, 64, 56))
    im.paste(hero, (lx + 28, ly + 10), hero)
    text(im, lx + 48, ly + 74, 'LV1', RED)
    for n, (art, name) in enumerate(((SWORD, 'PEDANG KAYU'), (ARMOR, 'BAJU KAIN'))):
        yy = ly + 86 + n * 26
        slot(im, lx + 6, yy)
        icon(im, lx + 12, yy + 6, art, PAL2)
        text(im, lx + 32, yy + 4, 'SENJATA' if n == 0 else 'ZIRAH', (150, 100, 70))
        text(im, lx + 32, yy + 13, name, MAR)
    rect(im, lx + 6, ly + 140, 108, 1, SLOT_SH)
    stats = (('ATK', '14', RED), ('DEF', '4', B), ('MAG', '8', BLUE), ('HP', '100/100', RED), ('EMAS', '40', (190, 140, 40)))
    for n, (k, v, col) in enumerate(stats):
        yy = ly + 146 + n * 11
        text(im, lx + 8, yy, k, col)
        text(im, lx + 112 - (len(v) * 6 - 1), yy, v, MAR)
    # --- kolom kanan: kisi barang ---
    gx, gy = X + 140, Y + 16
    items = {0: (POTION, '2'), 1: (ETHER, '1'), 2: (HERB, '5')}
    for r in range(4):
        for c in range(9):
            k = r * 9 + c
            x, y = gx + c * 28, gy + r * 28
            slot(im, x, y, 26, sel=(k == 0))
            if k in items:
                art, cnt = items[k]
                icon(im, x + 8, y + 7, art, PAL2)
                text(im, x + 26 - 7, y + 26 - 9, cnt, MAR)
    # --- kotak keterangan ---
    dx, dy, dw, dh = gx, gy + 118, 250, 80
    rect(im, dx, dy, dw, dh, F); rect(im, dx + 1, dy + 1, dw - 2, dh - 2, CREAM)
    rect(im, dx + 1, dy + 1, dw - 2, 1, WHITE); rect(im, dx + 1, dy + dh - 2, dw - 2, 1, SKIN)
    slot(im, dx + 6, dy + 6, 26, sel=True)
    icon(im, dx + 14, dy + 13, POTION, PAL2)
    text(im, dx + 38, dy + 8, 'RAMUAN', RED)
    text(im, dx + 38, dy + 18, 'X2', (150, 100, 70))
    rect(im, dx + 6, dy + 36, dw - 12, 1, SKIN)
    text(im, dx + 6, dy + 42, 'HERBAL MERAH PENYEGAR TUBUH.', MAR)
    text(im, dx + 6, dy + 52, 'PULIHKAN 40 HP.', MAR)
    button(im, dx + dw - 60, dy + dh - 20, 54, 'PAKAI')
    button(im, dx + dw - 122, dy + dh - 20, 58, 'BUANG')
    im.resize((1440, 810), Image.NEAREST).save(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
