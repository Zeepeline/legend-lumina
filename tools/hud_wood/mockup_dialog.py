"""Contoh kotak dialog baru: potret NPC berbingkai, papan nama kayu, isi perkamen, panah lanjut, opsi pilihan."""
import sys
from PIL import Image, ImageEnhance
sys.path.insert(0, 'tools/hud_wood')
from build_assets import glyphs, wood_frame, parchment, F, MAR, RED, CREAM, WHITE, GOLD, PLANK
_GL = glyphs()


def text(im, x, y, s, col):
    cx = x
    for ch in s:
        rows = _GL.get(ch, _GL['?'])
        w = max(len(r) for r in rows)
        for yy, r in enumerate(rows):
            for xx, c in enumerate(r):
                if c == '#':
                    im.putpixel((cx + xx, y + yy), (*col, 255) if im.mode == 'RGBA' else col)
        cx += (w + 1) if ch != ' ' else 3
    return cx - x


def nine(src, w, h, m):
    """Regangkan tekstur 9-slice sederhana."""
    out = Image.new('RGBA', (w, h))
    sw, sh = src.size
    for (sx0, sx1, dx0, dx1) in ((0, m, 0, m), (m, sw - m, m, w - m), (sw - m, sw, w - m, w)):
        for (sy0, sy1, dy0, dy1) in ((0, m, 0, m), (m, sh - m, m, h - m), (sh - m, sh, h - m, h)):
            piece = src.crop((sx0, sy0, sx1, sy1)).resize((max(1, dx1 - dx0), max(1, dy1 - dy0)), Image.NEAREST)
            out.paste(piece, (dx0, dy0))
    return out


def main(src, out, npc='ratih', name='Nenek Ratih', line1='Arka, kau sudah besar sekarang.', line2='Bawakan aku madu dari hutan, ya?'):
    base = Image.open(src).convert('RGB').resize((480, 270), Image.NEAREST)
    im = ImageEnhance.Brightness(base).enhance(0.85).convert('RGBA')
    X, Y, W, H = 40, 196, 400, 66
    im.alpha_composite(nine(wood_frame(24, 24, 'parch'), W, H, 6), (X, Y))
    # potret
    pf = nine(wood_frame(24, 24, (200, 220, 170)), 52, 52, 6)
    im.alpha_composite(pf, (X + 7, Y + 7))
    head = Image.open(f'tools/npc_ref/heads/{npc}_d.png').convert('RGBA').crop((17, 2, 47, 32))
    head = head.resize((60, 60), Image.NEAREST)
    im.alpha_composite(head.crop((8, 6, 52, 50)), (X + 11, Y + 11))
    # papan nama
    tw = text(Image.new('RGBA', (300, 20)), 0, 0, name, CREAM)
    plate = nine(wood_frame(16, 16, PLANK), tw + 14, 17, 5)
    im.alpha_composite(plate, (X + 64, Y - 9))
    text(im, X + 71, Y - 5, name, CREAM)
    # isi
    text(im, X + 66, Y + 14, line1, MAR)
    text(im, X + 66, Y + 26, line2, MAR)
    # pilihan
    for n, opt in enumerate(('Tentu, Nek!', 'Nanti saja')):
        ox = X + 66 + n * 92
        sel = n == 0
        text(im, ox, Y + 42, ('> ' if sel else '  ') + opt, RED if sel else (150, 100, 70))
    # panah lanjut
    ax, ay = X + W - 14, Y + H - 12
    for k, r in enumerate(['#####', '.###.', '..#..']):
        for i, c in enumerate(r):
            if c == '#':
                im.putpixel((ax + i, ay + k), (*RED, 255))
    im.convert('RGB').resize((1440, 810), Image.NEAREST).save(out)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
