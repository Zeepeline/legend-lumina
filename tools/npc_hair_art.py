"""Kepala NPC = kepala tokoh utama (dibaca dari hero_mc2.png) yang rambutnya disunting dengan tambalan piksel buatan tangan.
Jadi gaya gambar (garis, helai, bayangan kebiruan, wajah) tetap gaya MC, tapi bentuk rambut berbeda.
Grid: x 20..45, y 0..33 sel 64×56 frame diam. Huruf: F garis, 1–4 rambut terang→gelap, s kulit, k bayangan kulit,
m mulut, E syal MC (dibuang), . kosong.  Tambalan: '.' = biarkan, '_' = hapus, huruf lain = timpa."""
import numpy as np
from PIL import Image

MC = 'godot/assets/art/hero/hero_mc2.png'
X0, Y0, GW, GH = 20, 0, 26, 34
IDLE = {'d': (0, 0), 's': (0, 4), 'u': (0, 2)}
CODE = {(6, 1, 5): 'F', (84, 25, 32): 'E', (163, 41, 28): 'E', (166, 171, 64): '1', (120, 139, 79): '2', (67, 85, 109): '3',
        (48, 52, 88): '4', (233, 185, 110): 's', (183, 115, 79): 'k', (112, 59, 46): 'k', (236, 206, 172): 'm', (145, 96, 80): 'k'}
CHIN = {'d': 25, 's': 24, 'u': 24}


def mc_grid(f):
    A = np.array(Image.open(MC).convert('RGBA'))
    c, r = IDLE[f]
    a = A[r * 56:(r + 1) * 56, c * 64:(c + 1) * 64]
    g = []
    for y in range(Y0, Y0 + GH):
        row = ''
        for x in range(X0, X0 + GW):
            row += '.' if a[y, x, 3] == 0 or y > CHIN[f] else CODE.get(tuple(a[y, x, :3]), 'F')
        g.append(list(row))
    return g


def patch(g, y, txt):
    for i, ch in enumerate(txt[:GW]):
        if ch == '.':
            continue
        g[y][i] = '.' if ch == '_' else ch


def clean_scarf(g, f):
    """Syal MC (E) di sekitar kepala → rambut/garis/kulit."""
    for y in range(GH):
        for x in range(GW):
            if g[y][x] == 'E':
                g[y][x] = 'F' if y < 18 and f != 'u' else ('k' if y >= CHIN[f] - 1 else '3')


CROWN_ROUND = {
    'd': [(8, '__________'), (9, '_______FFFFFFF__'), (10, '_____FF1111111FF')],
    's': [(8, '__________'), (9, '_______FFFFFFF__'), (10, '_____FF1111111FF')],
    'u': [(8, '___________________________'), (9, '________FFFFFFF__F_'), (10, '______FF1111111FFF___')],
}
BANGS = {
    'rata': {
        'd': [(17, '...44F211111211111122222F.'), (18, '...44F222222222222222333F.'),
              (19, '...F44333333333333333344F.'), (20, '..F33s4kkkkkkkkkkkkkk444F.'), (21, '..F33s4ssssssssssssss44F..')],
        's': [(16, '....F4321112111112222F3...'), (17, '....F4322222222222233F....'),
              (18, '....F43333333333333F......'), (19, '....F44k3kkkkkkkkkkF......')],
    },
    'belah': {
        'd': [(16, '...4FF211113FF3111223222F.'), (17, '...4FF21113ssss3112233F...'),
              (18, '...44F2113ssssss311333F...'), (19, '...F4k413ssssssss3224F....'), (20, '..F33s42ssssssssss3444F...'),
              (21, '..F33s42ssssssssssss44F...')],
        's': [(16, '....F432111113kk3222F3....'), (17, '....F43211113sssss33F.....'), (18, '....F4321113ssssssF.......')],
    },
}


def long_hair(g, f):
    """Rambut terurai sampai punggung: helai tegak (terang dekat wajah, gelap di luar), ujung meruncing."""
    def curtain(x0, w, y0, y1, flip=False):
        pat = ('F2334F', 'F2343F', 'F3234F')
        for y in range(y0, y1 + 1):
            row = pat[y % 3][:w] if not flip else pat[y % 3][:w][::-1]
            row = row[:-1] + 'F'
            if flip:
                row = 'F' + row[1:]
            if y == y1:
                row = '.' + 'F' * (w - 2) + '.'
            elif y == y1 - 1:
                row = 'F' + row[1:-1].replace('2', '3') + 'F'
            for k, ch in enumerate(row):
                if ch != '.' and (g[y][x0 + k] in '.F34' or y > CHIN[f]):
                    g[y][x0 + k] = ch
    if f == 'd':
        curtain(1, 5, 19, 31, flip=True)
        curtain(19, 5, 19, 31)
    elif f == 's':
        curtain(1, 6, 16, 31, flip=True)
    else:
        for y in range(19, 32):
            for x in range(3, 22):
                if y == 31:
                    g[y][x] = 'F' if 4 <= x <= 20 else '.'
                elif x in (3, 21):
                    g[y][x] = 'F'
                else:
                    g[y][x] = '4' if (x + (y // 4)) % 4 == 0 else ('3' if y > 22 else g[y][x] if g[y][x] in '1234' else '3')


def bun(g, f):
    art = ['...FFFFF...', '..F11211F..', '.F1121112F.', '.F2111123F.', '..F23334F..', '...FFFFF...']
    x0, y0 = (8, 5) if f != 's' else (2, 8)
    for i, row in enumerate(art):
        for j, ch in enumerate(row):
            if ch != '.' and g[y0 + i][x0 + j] in '.F':
                g[y0 + i][x0 + j] = ch


def ponytail(g, f):
    art = ['FF...', 'F2FF.', 'F223F', 'F233F', 'F234F', '.F34F', '.F34F', '.F44F', '..FF.']
    if f == 'd':
        x0, y0 = 21, 12
    elif f == 's':
        x0, y0 = 0, 11
        art = [r[::-1] for r in art]
    else:
        x0, y0 = 11, 18
        art = ['F22F', 'F23F', 'F34F', 'F34F', 'F34F', 'F44F', '.FF.']
    for i, row in enumerate(art):
        for j, ch in enumerate(row):
            if ch != '.' and g[y0 + i][x0 + j] == '.':
                g[y0 + i][x0 + j] = ch


def bald(g, f):
    for y in range(GH):
        for x in range(GW):
            c = g[y][x]
            if c in '1234' and y < 19:
                g[y][x] = 'k' if (y >= 17 or (f == 'd' and x > 18) or (f == 's' and x < 8)) else 's'
    for y in range(0, 10):
        g[y] = ['.'] * GW
    dome = {'d': [(9, '........FFFFFFF'), (10, '......FFsssssssFF'), (11, '....FFsssssssssskF'), (12, '...Fsssssssssssskk')],
            's': [(9, '........FFFFFFF'), (10, '......FFssssssssFF'), (11, '....FFssssssssskkF'), (12, '...Fssssssssssssk')],
            'u': [(9, '.........FFFFFFF'), (10, '.......FFssssssssFF'), (11, '.....FFssssssssskkF'), (12, '....Fssssssssssskk')]}[f]
    for y, t in dome:
        patch(g, y, t)


def buzz(g, f):
    for y in range(GH):
        for x in range(GW):
            if g[y][x] in '1234':
                if y >= 17 and f != 'u' and 7 <= x <= 19:
                    g[y][x] = 's'
                else:
                    g[y][x] = '2' if y < 13 else '3'
    for y in range(0, 10):
        g[y] = ['.'] * GW
    patch(g, 9, '........FFFFFFF')
    patch(g, 10, '......FF2222222FF')


STYLES = ('mc', 'bulat', 'rata', 'belah', 'panjang', 'kuncir', 'sanggul', 'cepak', 'botak')


def head_grid(style, f):
    g = mc_grid(f)
    clean_scarf(g, f)
    if style in ('bulat', 'rata', 'belah', 'panjang', 'kuncir', 'sanggul'):
        for y, t in CROWN_ROUND[f]:
            patch(g, y, t)
    if style in ('rata', 'panjang') and f in BANGS['rata']:
        for y, t in BANGS['rata'][f]:
            patch(g, y, t)
    if style in ('belah', 'sanggul') and f in BANGS['belah']:
        for y, t in BANGS['belah'][f]:
            patch(g, y, t)
    if style == 'panjang':
        long_hair(g, f)
    if style == 'kuncir':
        ponytail(g, f)
    if style == 'sanggul':
        bun(g, f)
    if style == 'botak':
        bald(g, f)
    if style == 'cepak':
        buzz(g, f)
    return g
