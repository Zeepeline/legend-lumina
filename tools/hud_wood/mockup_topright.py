"""Tiga alternatif pojok kanan atas HUD (info + misi) di atas tangkapan layar game."""
import sys
from PIL import Image
sys.path.insert(0, 'tools/hud_wood')
from build_assets import glyphs
_GL = glyphs()


def text(im, x, y, s, col):
    cx = x
    for ch in s:
        rows = _GL.get(ch, _GL['?'])
        w = max(len(r) for r in rows)
        for yy, r in enumerate(rows):
            for xx, c in enumerate(r):
                if c == '#' and 0 <= cx + xx < im.width and 0 <= y + yy < im.height:
                    im.putpixel((cx + xx, y + yy), col)
        cx += (w + 1) if ch != ' ' else 3
    return cx - x
from mockup import (F, MAR, RED, CREAM, SKIN, K, I, G, A, WHITE, GOLD, px, rect, wood, icon, PAL, SUN, COIN, POT)
import mockup

CROP = (240, 0, 480, 110)


def shadow_text(im, x, y, s, col=WHITE):
    text(im, x + 1, y + 1, s, F)
    return text(im, x, y, s, col)


def scroll_icon(im, x, y):
    art = [".FFFFFF.", "FWCCCCWF", ".FWWWWF.", ".FWCCWF.", ".FWWWWF.", ".FWCCWF.", "FWCCCCWF", ".FFFFFF."]
    icon(im, x, y, art, PAL)


def variant_a(base):
    """A: tanpa papan — ikon & teks bayangan langsung di atas dunia; misi satu baris."""
    im = base.copy()
    x = 380
    icon(im, x, 7, SUN, PAL); shadow_text(im, x + 9, 7, '09:00')
    icon(im, x + 44, 8, COIN, PAL); shadow_text(im, x + 52, 7, '40')
    icon(im, x + 68, 8, POT, PAL); shadow_text(im, x + 76, 7, '3')
    scroll_icon(im, 352, 20)
    shadow_text(im, 363, 21, 'Hutan Selatan', (240, 214, 150))
    shadow_text(im, 363, 31, 'Kalahkan Raja Goblin', WHITE)
    return im


def variant_b(base):
    """B: medali jam bundar + pita misi menggantung."""
    im = base.copy()
    cx, cy, r = 456, 21, 19
    for yy in range(-r - 1, r + 2):
        for xx in range(-r - 1, r + 2):
            d = (xx * xx + yy * yy) ** 0.5
            if d <= r + 1:
                px(im, cx + xx, cy + yy, F if d > r else (G if d > r - 3 else CREAM))
    icon(im, cx - 3, cy - 10, SUN, PAL)
    text(im, cx - 11, cy + 1, "09:00", MAR)
    # koin & ramuan di plakat kecil di bawah medali
    wood(im, 424, 43, 52, 17, inner=None)
    rect(im, 427, 46, 46, 11, (120, 70, 50))
    icon(im, 430, 48, COIN, PAL); text(im, 438, 48, '40', CREAM)
    icon(im, 454, 48, POT, PAL); text(im, 462, 48, '3', CREAM)
    # pita misi
    x0, y0, w = 300, 6, 116
    rect(im, x0, y0, w, 25, F); rect(im, x0 + 1, y0 + 1, w - 2, 23, CREAM)
    rect(im, x0 + 1, y0 + 1, w - 2, 1, WHITE); rect(im, x0 + 1, y0 + 23, w - 2, 1, SKIN)
    rect(im, x0 - 6, y0 + 4, 7, 17, F); rect(im, x0 - 5, y0 + 5, 6, 15, RED)
    for k in range(4):
        px(im, x0 - 6 + k, y0 + 4 + 8, (0, 0, 0)) if False else None
    scroll_icon(im, x0 + 4, y0 + 4)
    text(im, x0 + 15, y0 + 4, 'Hutan Selatan', RED)
    text(im, x0 + 15, y0 + 14, 'Kalahkan Raja Goblin', MAR)
    return im


def variant_c(base):
    """C: satu papan ramping memanjang (info kiri, misi kanan dipisah garis), tingginya separuh."""
    im = base.copy()
    wood(im, 268, 3, 209, 18, inner=None)
    rect(im, 271, 6, 203, 12, (120, 70, 50))
    rect(im, 271, 6, 203, 1, (150, 92, 62))
    icon(im, 275, 8, SUN, PAL); text(im, 284, 8, '09:00', CREAM)
    icon(im, 318, 9, COIN, PAL); text(im, 326, 8, '40', CREAM)
    icon(im, 341, 9, POT, PAL); text(im, 349, 8, '3', CREAM)
    rect(im, 358, 6, 1, 12, F)
    scroll_icon(im, 362, 8)
    text(im, 372, 8, 'Hutan Selatan', GOLD)
    return im


def main(src, out):
    base = Image.open(src).convert('RGB').resize((480, 270), Image.NEAREST)
    tiles = [variant_a(base), variant_b(base), variant_c(base)]
    W, H = CROP[2] - CROP[0], CROP[3] - CROP[1]
    sheet = Image.new('RGB', (W, H * 3 + 8), (30, 20, 20))
    for i, t in enumerate(tiles):
        sheet.paste(t.crop(CROP), (0, i * (H + 4)))
        text(sheet, 3, i * (H + 4) + 3, 'ABC'[i], GOLD)
    sheet.resize((sheet.width * 4, sheet.height * 4), Image.NEAREST).save(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
