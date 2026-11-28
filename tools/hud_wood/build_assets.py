"""Bangun aset UI kayu & perkamen untuk Godot: huruf piksel (BMFont .fnt + .png) dan tekstur 9-slice/ikon.
Jalankan dari akar repo: python3 tools/hud_wood/build_assets.py  → godot/assets/art/ui/"""
import os
import sys
from PIL import Image
sys.path.insert(0, 'tools/hud_wood')
from pixfont import G as UPPER

OUT = 'godot/assets/art/ui'
F = (6, 1, 5); MAR = (84, 25, 32); RED = (163, 41, 28); CREAM = (236, 206, 172); SKIN = (233, 185, 110)
K = (183, 115, 79); I = (112, 59, 46); G = (145, 96, 80); B = (67, 85, 109); D = (48, 52, 88)
C = (166, 171, 64); A = (120, 139, 79); WHITE = (250, 240, 220); GOLD = (240, 194, 113)
BLUE = (62, 120, 190); LBLUE = (130, 190, 230); PLANK = (120, 70, 50); PARCH_D = (214, 182, 140); SLOT_SH = (180, 140, 100)

# ---------------- huruf ----------------
LOWER = {
    'a': [".....", ".....", ".###.", "....#", ".####", "#...#", ".####"],
    'b': ["#....", "#....", "####.", "#...#", "#...#", "#...#", "####."],
    'c': ["....", "....", ".###", "#...", "#...", "#...", ".###"],
    'd': ["....#", "....#", ".####", "#...#", "#...#", "#...#", ".####"],
    'e': [".....", ".....", ".###.", "#...#", "#####", "#....", ".###."],
    'f': ["..##", ".#..", "###.", ".#..", ".#..", ".#..", ".#.."],
    'g': [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", ".###."],
    'h': ["#....", "#....", "####.", "#...#", "#...#", "#...#", "#...#"],
    'i': ["#", ".", "#", "#", "#", "#", "#"],
    'j': ["..#", "...", "..#", "..#", "..#", "..#", "..#", "..#", "##."],
    'k': ["#...", "#...", "#..#", "#.#.", "##..", "#.#.", "#..#"],
    'l': ["#.", "#.", "#.", "#.", "#.", "#.", ".#"],
    'm': [".....", ".....", "##.#.", "#.#.#", "#.#.#", "#.#.#", "#...#"],
    'n': [".....", ".....", "####.", "#...#", "#...#", "#...#", "#...#"],
    'o': [".....", ".....", ".###.", "#...#", "#...#", "#...#", ".###."],
    'p': [".....", ".....", "####.", "#...#", "#...#", "#...#", "####.", "#....", "#...."],
    'q': [".....", ".....", ".####", "#...#", "#...#", "#...#", ".####", "....#", "....#"],
    'r': ["....", "....", "#.##", "##..", "#...", "#...", "#..."],
    's': ["....", "....", ".###", "#...", ".##.", "...#", "###."],
    't': [".#..", ".#..", "###.", ".#..", ".#..", ".#..", "..##"],
    'u': [".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####"],
    'v': [".....", ".....", "#...#", "#...#", "#...#", ".#.#.", "..#.."],
    'w': [".....", ".....", "#...#", "#...#", "#.#.#", "#.#.#", ".#.#."],
    'x': [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    'y': [".....", ".....", "#...#", "#...#", "#...#", "#...#", ".####", "....#", ".###."],
    'z': [".....", ".....", "#####", "...#.", "..#..", ".#...", "#####"],
}
EXTRA = {
    '&': [".##..", "#..#.", "#.#..", ".#...", "#.#.#", "#..#.", ".##.#"],
    '(': [".#", "#.", "#.", "#.", "#.", "#.", ".#"],
    ')': ["#.", ".#", ".#", ".#", ".#", ".#", "#."],
    '[': ["##", "#.", "#.", "#.", "#.", "#.", "##"],
    ']': ["##", ".#", ".#", ".#", ".#", ".#", "##"],
    "'": ["#", "#", ".", ".", ".", ".", "."],
    '"': ["#.#", "#.#", "...", "...", "...", "...", "..."],
    '%': ["##..#", "##.#.", "...#.", "..#..", ".#...", ".#.##", "#..##"],
    ';': [".", "#", ".", ".", ".", "#", "#"],
    '_': [".....", ".....", ".....", ".....", ".....", ".....", "#####"],
    '=': [".....", ".....", "#####", ".....", "#####", ".....", "....."],
    '*': [".....", "#.#.#", ".###.", "#####", ".###.", "#.#.#", "....."],
    '<': ["...#", "..#.", ".#..", "#...", ".#..", "..#.", "...#"],
    '>': ["#...", ".#..", "..#.", "...#", "..#.", ".#..", "#..."],
    '#': [".#.#.", "#####", ".#.#.", ".#.#.", ".#.#.", "#####", ".#.#."],
    ':': [".", "#", "#", ".", "#", "#", "."],
    '.': [".", ".", ".", ".", ".", "#", "#"],
    ',': [".", ".", ".", ".", ".", "#", "#", "#"],
    '!': ["#", "#", "#", "#", "#", ".", "#"],
    '—': [".....", ".....", ".....", "#####", ".....", ".....", "....."],
    '·': ["...", "...", "...", ".#.", "...", "...", "..."],
    '•': ["...", "...", ".#.", "###", ".#.", "...", "..."],
    '×': [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    '…': [".....", ".....", ".....", ".....", ".....", ".....", "#.#.#"],
}
TRIM = set(".,:;!'|")


def glyphs():
    out = {}
    for ch, s in UPPER.items():
        rows = [s[i:i + 5] for i in range(0, 35, 5)]
        if ch in TRIM:
            cols = [x for x in range(5) if any(r[x] == '#' for r in rows)]
            rows = [r[cols[0]:cols[-1] + 1] for r in rows] if cols else ['.'] * 7
        out[ch] = rows
    out.update(LOWER)
    out.update(EXTRA)
    out['|'] = ["#"] * 7 + ["#"]
    out[' '] = ["..."] * 7
    return out


def build_font():
    gl = glyphs()
    chars = sorted(gl, key=ord)
    cw, chh = 6, 10
    cols = 16
    W, H = cols * cw, ((len(chars) + cols - 1) // cols) * chh
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    lines = []
    for n, ch in enumerate(chars):
        rows = gl[ch]
        w = max(len(r) for r in rows)
        x0, y0 = (n % cols) * cw, (n // cols) * chh
        for y, r in enumerate(rows):
            for x, c in enumerate(r):
                if c == '#':
                    im.putpixel((x0 + x, y0 + y), (255, 255, 255, 255))
        adv = w + 1 if ch != ' ' else 3
        lines.append(f'char id={ord(ch)} x={x0} y={y0} width={w} height=9 xoffset=0 yoffset=1 xadvance={adv} page=0 chnl=15')
    im.save(f'{OUT}/lumina_pixel.png')
    with open(f'{OUT}/lumina_pixel.fnt', 'w', encoding='utf-8') as f:
        f.write('info face="LuminaPixel" size=10 bold=0 italic=0 charset="" unicode=1 stretchH=100 smooth=0 aa=1 padding=0,0,0,0 spacing=0,0\n')
        f.write(f'common lineHeight=11 base=8 scaleW={W} scaleH={H} pages=1 packed=0\n')
        f.write('page id=0 file="lumina_pixel.png"\n')
        f.write(f'chars count={len(lines)}\n')
        f.write('\n'.join(lines) + '\n')


# ---------------- tekstur ----------------
def canvas(w, h):
    return Image.new('RGBA', (w, h), (0, 0, 0, 0))


def rect(im, x, y, w, h, c):
    for yy in range(y, y + h):
        for xx in range(x, x + w):
            if 0 <= xx < im.width and 0 <= yy < im.height:
                im.putpixel((xx, yy), (*c, 255) if len(c) == 3 else c)


def wood_frame(w, h, inner):
    """Bingkai kayu 3 px + garis dalam; inner = warna isi atau None (papan kayu)."""
    im = canvas(w, h)
    rect(im, 1, 0, w - 2, h, F); rect(im, 0, 1, w, h - 2, F)
    rect(im, 1, 1, w - 2, h - 2, G)
    rect(im, 1, 1, w - 2, 1, K)
    rect(im, 1, h - 2, w - 2, 1, I)
    rect(im, 3, 3, w - 6, h - 6, F)
    if inner == 'parch':
        rect(im, 4, 4, w - 8, h - 8, CREAM)
        rect(im, 4, 4, w - 8, 1, WHITE)
        rect(im, 4, h - 5, w - 8, 1, SKIN)
    elif inner:
        rect(im, 4, 4, w - 8, h - 8, inner)
        rect(im, 4, 4, w - 8, 1, tuple(min(255, int(c * 1.18)) for c in inner))
        rect(im, 4, h - 5, w - 8, 1, tuple(int(c * 0.78) for c in inner))
    for cx, cy in ((1, 1), (w - 2, 1), (1, h - 2), (w - 2, h - 2)):
        im.putpixel((cx, cy), (*GOLD, 255))
    return im


def parchment(w, h, fill=CREAM, top=WHITE, bot=SKIN, edge=F):
    im = canvas(w, h)
    rect(im, 1, 0, w - 2, h, edge); rect(im, 0, 1, w, h - 2, edge)
    rect(im, 1, 1, w - 2, h - 2, fill)
    rect(im, 1, 1, w - 2, 1, top)
    rect(im, 1, h - 2, w - 2, 1, bot)
    return im


def slot(sel=False):
    im = canvas(12, 12)
    rect(im, 0, 0, 12, 12, F)
    rect(im, 1, 1, 10, 10, GOLD if sel else SLOT_SH)
    rect(im, 2, 2, 8, 8, CREAM if sel else PARCH_D)
    rect(im, 2, 2, 8, 1, WHITE if sel else SLOT_SH)
    return im


def ribbon(active):
    col = RED if active else (120, 70, 60)
    hi = (210, 90, 70) if active else (150, 95, 80)
    im = canvas(12, 12)
    rect(im, 0, 0, 12, 12, F)
    rect(im, 1, 1, 10, 11, col)
    rect(im, 1, 1, 10, 1, hi)
    return im


def seal():
    im = canvas(15, 15)
    for y in range(15):
        for x in range(15):
            d = (x - 7) ** 2 + (y - 7) ** 2
            if d <= 49:
                im.putpixel((x, y), (*(F if d > 36 else RED), 255))
    for y in range(15):
        for x in range(15):
            d = (x - 7) ** 2 + (y - 7) ** 2
            if 16 < d <= 36 and (x + y) % 3 == 0:
                im.putpixel((x, y), (*MAR, 255))
    for k in range(-3, 4):
        im.putpixel((7 + k, 7 + k), (*CREAM, 255)); im.putpixel((7 + k, 7 - k), (*CREAM, 255))
    im.putpixel((5, 3), (*WHITE, 255)); im.putpixel((4, 4), (*WHITE, 255))
    return im


PAL = {'F': F, 'R': RED, 'Y': GOLD, 'W': WHITE, 'G': G, 'K': K, 'I': I, 'C': (170, 140, 90), 'O': (230, 120, 40),
       'B': B, 'L': BLUE, 'M': MAR, 'A': A, 'V': C, 'N': D, 'S': (176, 172, 168), 'T': (98, 96, 104), 'E': LBLUE,
       'P': (120, 200, 110), 'Q': (60, 140, 70)}
ICONS = {
    'book': ["............", ".FFFFF.FFFFF", "FRRRRRFWWWWF", "FRYYRRFWCCWF", "FRRRRRFWWWWF", "FRYYRRFWCCWF", "FRRRRRFWWWWF",
             "FRRRRRFWCCWF", "FRRRRRFWWWWF", "FIIIIIFIIIIF", ".FFFFF.FFFFF", "............"],
    'bag': ["....FFFF....", "...F....F...", "...F....F...", ".FFFFFFFFFF.", "FKKKKKKKKKKF", "FGKKKFFKKKGF", "FGKKKFYFKKGF",
            "FGGKKKFKKGGF", "FGGGKKKKGGGF", "FIGGGGGGGGIF", ".FFFFFFFFFF.", "............"],
    'map': ["............", "FFFFFFFFFFFF", "FWCWWWCCWWWF", "FWWCWWWCWWCF", "FWWWCCWWWCWF", "FCWWWWRWWWWF", "FWCCWRWRWCWF",
            "FWWWCWRWWWCF", "FWCWWWWCCWWF", "FFFFFFFFFFFF", "............", "............"],
    'gear': ["....FFFF....", "..FFYYYYFF..", ".FYYYYYYYYF.", ".FYYFFFFYYF.", "FYYF....FYYF", "FYYF....FYYF", "FYYF....FYYF",
             "FYYF....FYYF", ".FYYFFFFYYF.", ".FYYYYYYYYF.", "..FFYYYYFF..", "....FFFF...."],
    'sun': ["...Y...", ".Y.Y.Y.", "..YYY..", "YYYWYYY", "..YYY..", ".Y.Y.Y.", "...Y..."],
    'moon': ["..FFF..", ".FEEF..", "FEEF...", "FEEF...", "FEEEF..", ".FEEEF.", "..FFF.."],
    'compass': [".FFFFF.", "FWWWWWF", "FWWWWWF", "FWWWWWF", "FWWWWWF", "FWWWWWF", ".FFFFF."],
    'coin': [".FFFF.", "FYYYYF", "FYWYYF", "FYYYYF", "FYYYOF", ".FFFF."],
    'potion': ["..FF..", "..FF..", ".FRRF.", "FRWRRF", "FRRRRF", ".FFFF."],
    'fire': ["....R.....", "...RO.....", "...ROR....", "..ROYOR...", "..RYYYOR..", ".ROYWYYOR.", ".RYYWWYYR.", ".RYYWYYR..",
             "..RRYYRR..", "...RRRR..."],
    'venom': ["....FF....", "...FPPF...", "...FPPF...", "..FPPPPF..", ".FPWPPPQF.", ".FPWPPPQF.", ".FPPPPQQF.", ".FQPPQQQF.",
              "..FQQQQF..", "...FFFF..."],
    'nova': ["....E.....", ".E..E..E..", "..E.E.E...", "...EWE....", "EEEEWEEEE.", "...EWE....", "..E.E.E...", ".E..E..E..",
             "....E.....", ".........."],
    'heal': ["...FFFF...", "...FPPF...", "...FPPF...", "FFFFPPFFFF", "FPPPWWPPPF", "FPPPWWPPPF", "FFFFPPFFFF", "...FPPF...",
             "...FPPF...", "...FFFF..."],
    'holy': ["....Y.....", "....Y.....", ".Y..Y..Y..", "..YYWYY...", "YYYWWWYYY.", "..YYWYY...", ".Y..Y..Y..", "....Y.....",
             "....Y.....", ".........."],
    'menu': ["............", "............", ".FFFFFFFFFF.", ".FWWWWWWWWF.", ".FFFFFFFFFF.", "............", ".FFFFFFFFFF.", ".FWWWWWWWWF.", ".FFFFFFFFFF.", "............", ".FFFFFFFFFF.", ".FWWWWWWWWF.", ".FFFFFFFFFF."],
    'scroll': [".FFFFFF.", "FWCCCCWF", ".FWWWWF.", ".FWCCWF.", ".FWWWWF.", ".FWCCWF.", "FWCCCCWF", ".FFFFFF."],
    'lock': ["...FFF....", "..F...F...", "..F...F...", ".FFFFFFF..", ".FSSSSSF..", ".FSSFSSF..", ".FSSFSSF..", ".FTTTTTF..",
             "..FFFFF...", ".........."],
}

SWORD_T = ["........FF", ".......FBF", "......FBF.", ".....FBF..", "....FBF...", ".F.FBF....", "..FYF.....", "..FIF.....", ".FIF.F....", "FF........"]
ARMOR_T = [".FF....FF.", "FAAFFFFAAF", "FAAAAAAAAF", ".FAAAAAAF.", ".FAZAAZAF.", ".FAAAAAAF.", ".FAAZZAAF.", ".FAAAAAAF.", "..FFFFFF..", ".........."]
POTION_T = ["....FF....", "...FWWF...", "....FF....", "...FXXF...", "..FXWXXF..", ".FXWXXXXF.", ".FXXXXXXF.", ".FXXXXXZF.", "..FXXXZF..", "...FFFF..."]
FISH_T = ["..........", "....FFF...", "..FFXXXF.F", ".FXFXXXXFF", "FXXXXXXXXF", ".FZZZZZZFF", "..FFZZZF.F", "....FFF...", "..........", ".........."]


def tint(art, **m):
    return [''.join(m.get(c, c) for c in r) for r in art]


ICONS.update({
    'item_bread_mila': ["..........", "...FFFF...", ".FFKYYKFF.", "FKYYKYYKKF", "FKKYKKYKKF", "FGKKKKKKGF", "FIGGGGGGIF", ".FFFFFFFF.", "..........", ".........."],
    'item_fish': tint(FISH_T, X='S', Z='T'),
    'item_grilled_fish': tint(FISH_T, X='K', Z='I'),
    'item_potion': tint(POTION_T, X='R', Z='M'),
    'item_hi_potion': tint(POTION_T, X='O', Z='R'),
    'item_ether': tint(POTION_T, X='L', Z='N'),
    'item_jelly': ["..........", "..........", "...FFFF...", "..FPPPPF..", ".FPWPPPPF.", ".FPPPPPPF.", "FPPPPPPPQF", "FQQQQQQQQF", ".FFFFFFFF.", ".........."],
    'item_pelt': ["..........", ".F......F.", "FKF.FF.FKF", "FKKFKKFKKF", ".FKKKKKKF.", ".FKGKKGKF.", ".FKKKKKKF.", "FKKFKKFKKF", "FKF.FF.FKF", ".F......F."],
    'item_shard': ["....F.....", "...FEF....", "..FEWEF...", "..FEWLF...", ".FEELLLF..", ".FELLLLF..", ".FELLLNF..", "..FLLNF...", "...FNF....", "....F....."],
    'item_honey': ["...FFFF...", "...FGGF...", "..FFFFFF..", ".FYYYYYYF.", ".FYWYYYOF.", ".FYWYYYOF.", ".FYYYYOOF.", ".FOOOOOOF.", "..FFFFFF..", ".........."],
    'item_ore': ["..........", "...FFFF...", "..FSSSTF..", ".FSOSSTTF.", ".FSSSOSTF.", "FSSOSSTTTF", "FTSSSTTOTF", "FTTTTTTTTF", ".FFFFFFFF.", ".........."],
    'item_tusk': ["........F.", ".......FWF", "......FWWF", ".....FWWF.", "....FWWF..", "...FWWF...", "..FWCF....", ".FCCF.....", "FCCF......", ".FF......."],
    'wpn_starter_sword': tint(SWORD_T, B='K'),
    'wpn_iron_sword': tint(SWORD_T, B='S'),
    'wpn_steel_sword': tint(SWORD_T, B='W'),
    'wpn_crystal_sword': tint(SWORD_T, B='E'),
    'wpn_iron_spear': [".......FFF", "......FSWF", ".....FSSF.", "....FIFF..", "...FIF....", "..FIF.....", ".FIF......", "FIF.......", "FF........", ".........."],
    'wpn_battle_axe': ["..FFF.....", ".FSSSF....", "FSWSSSF...", "FSWSFIF...", ".FSF.FIF..", "..F...FIF.", ".......FIF", "........FF", "..........", ".........."],
    'arm_cloth_tunic': tint(ARMOR_T, A='C', Z='K'),
    'arm_leather_vest': tint(ARMOR_T, A='K', Z='I'),
    'arm_iron_chainmail': tint(ARMOR_T, A='S', Z='T'),
    'arm_stone_armor': tint(ARMOR_T, A='T', Z='N'),
})
PAL['X'] = RED


def icon(name):
    art = ICONS[name]
    im = canvas(max(len(r) for r in art), len(art))
    for y, r in enumerate(art):
        for x, c in enumerate(r):
            if c in PAL:
                im.putpixel((x, y), (*PAL[c], 255))
    return im


def main():
    os.makedirs(OUT, exist_ok=True)
    build_font()
    wood_frame(24, 24, 'parch').save(f'{OUT}/wood_panel.png')                 # panel kayu + perkamen (margin 6)
    wood_frame(16, 16, PLANK).save(f'{OUT}/wood_button.png')                  # tombol (margin 5)
    wood_frame(16, 16, (150, 92, 62)).save(f'{OUT}/wood_button_hover.png')
    wood_frame(16, 16, (92, 50, 38)).save(f'{OUT}/wood_button_pressed.png')
    wood_frame(16, 16, (110, 100, 96)).save(f'{OUT}/wood_button_disabled.png')
    parchment(8, 8).save(f'{OUT}/parchment.png')                              # catatan (margin 2)
    parchment(8, 8, fill=(226, 196, 156), top=(236, 206, 172), bot=SLOT_SH).save(f'{OUT}/parchment_dark.png')
    slot(False).save(f'{OUT}/slot.png'); slot(True).save(f'{OUT}/slot_sel.png')
    ribbon(True).save(f'{OUT}/ribbon_on.png'); ribbon(False).save(f'{OUT}/ribbon_off.png')
    seal().save(f'{OUT}/seal_close.png')
    for n in ICONS:
        icon(n).save(f'{OUT}/ic_{n}.png')
    print('ok')


if __name__ == '__main__':
    main()
