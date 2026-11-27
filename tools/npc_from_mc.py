"""NPC bergaya tokoh utama: tubuh & animasi dari hero_mc2.png (gambar pemilik), warna rambut/baju/celemek/sepatu diganti per NPC.
Hasil: godot/assets/art/npc/npc_mc_<id>.png — format 512×224 (8 kolom × 4 baris sel 64×56):
  baris 0 jalan bawah, 1 jalan atas, 2 jalan samping (4 frame), 3 diam bawah(0–1)/samping(2–3)/atas(4–5).
Pakai: python3 tools/npc_from_mc.py   (dari akar repo)"""
import numpy as np
from PIL import Image

MC = 'godot/assets/art/hero/hero_mc2.png'
OUT = 'godot/assets/art/npc/npc_mc_%s.png'
FW, FH = 64, 56
HAIR_L, HAIR_D, HAIR_S1, HAIR_S2 = (166, 171, 64), (120, 139, 79), (67, 85, 109), (48, 52, 88)
TUNIC, MAROON, CREAM = (163, 41, 28), (84, 25, 32), (236, 206, 172)

# warna dasar
K = {'hitam': (6, 1, 5), 'marun': (90, 24, 33), 'merah': (177, 39, 26), 'zaitun': (175, 175, 54), 'hijau': (123, 147, 69),
     'biru': (62, 85, 128), 'birutua': (45, 49, 97), 'kulit': (240, 194, 113), 'oranye': (207, 115, 69), 'mawar': (172, 74, 74),
     'krem': (237, 214, 187), 'abu': (176, 172, 168), 'abutua': (98, 96, 104), 'coklat': (150, 98, 62)}

# id: rambut (terang, gelap), baju (utama, bayangan), sepatu, + pakaian:
#   gaya = kemeja | rompi (warna `rompi`) | zirah | selempang (warna `aksen`) | overall (warna `aksen`) | kancing
#   celana, kerah, sabuk, celemek = warna;  rok = 'pendek' | 'panjang' (gaun/jubah)
#   topi = (warna, lebar pinggir);  helm = warna tudung yang menutup rambut
NPC = {
    'ac1':   dict(rambut=('birutua', 'hitam'), baju=('biru', 'birutua'), sepatu='birutua', rok='panjang', gaya='selempang', aksen='zaitun', kerah='krem'),
    'ac2':   dict(rambut=('coklat', 'marun'), baju=('krem', 'abu'), sepatu='coklat', gaya='rompi', rompi='biru', celana='birutua', kerah='krem'),
    'ar1':   dict(rambut=('krem', 'abu'), baju=('coklat', 'marun'), sepatu='marun', rok='panjang', gaya='kancing', kerah='krem', sabuk='marun'),
    'bw1':   dict(rambut=('birutua', 'hitam'), baju=('merah', 'marun'), sepatu='coklat', gaya='selempang', aksen='krem', celana='coklat'),
    'courier': dict(rambut=('coklat', 'marun'), baju=('zaitun', 'hijau'), sepatu='coklat', topi=('biru', 1), gaya='selempang', aksen='coklat', celana='coklat'),
    'gk1':   dict(rambut=('abu', 'abutua'), baju=('abu', 'abutua'), sepatu='abutua', helm='abu', gaya='zirah', celana='abutua', sabuk='coklat'),
    'gk3':   dict(rambut=('zaitun', 'hijau'), baju=('hijau', 'abutua'), sepatu='coklat', gaya='rompi', rompi='coklat', celana='coklat'),
    'guard': dict(rambut=('abu', 'abutua'), baju=('abu', 'abutua'), sepatu='abutua', helm='abu', gaya='zirah', kerah='merah', celana='merah', sabuk='coklat'),
    'in1':   dict(rambut=('coklat', 'marun'), baju=('krem', 'coklat'), sepatu='coklat', gaya='kancing', celana='coklat', sabuk='coklat'),
    'merc1': dict(rambut=('oranye', 'merah'), baju=('abutua', 'hitam'), sepatu='hitam', gaya='rompi', rompi='coklat', celana='abutua', sabuk='coklat'),
    'pm1':   dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='coklat', topi=('biru', 2), gaya='kancing', kerah='krem', celana='birutua', sabuk='coklat'),
    'pm2':   dict(rambut=('abu', 'abutua'), baju=('krem', 'coklat'), sepatu='coklat', gaya='rompi', rompi='hijau', celana='coklat'),
    'ps1':   dict(rambut=('kulit', 'oranye'), baju=('mawar', 'marun'), sepatu='marun', rok='pendek', kerah='krem', sabuk='krem'),
    'ps2':   dict(rambut=('abu', 'abutua'), baju=('coklat', 'marun'), sepatu='coklat', topi=('kulit', 3), celemek='krem', celana='coklat'),
    'smith': dict(rambut=('birutua', 'hitam'), baju=('krem', 'coklat'), sepatu='hitam', celemek='coklat', celana='abutua'),
    'tp1':   dict(rambut=('hitam', 'hitam'), baju=('krem', 'abu'), sepatu='coklat', rok='panjang', gaya='selempang', aksen='merah'),
    'farmer': dict(rambut=('coklat', 'marun'), baju=('krem', 'abu'), sepatu='coklat', topi=('kulit', 3), gaya='overall', aksen='biru', celana='biru'),
    'gun':   dict(rambut=('coklat', 'marun'), baju=('coklat', 'marun'), sepatu='coklat', helm='kulit', gaya='rompi', rompi='abutua', celana='abutua', sabuk='hitam'),
    'hermit': dict(rambut=('mawar', 'marun'), baju=('mawar', 'marun'), sepatu='marun', rok='panjang', helm='mawar', sabuk='krem'),
    'lestari': dict(rambut=('oranye', 'merah'), baju=('birutua', 'hitam'), sepatu='hitam', rok='panjang', kerah='krem', gaya='kancing'),
    'nila':  dict(rambut=('coklat', 'marun'), baju=('oranye', 'coklat'), sepatu='coklat', rok='pendek', helm='coklat', sabuk='coklat'),
    'ratih': dict(rambut=('abu', 'abutua'), baju=('krem', 'abu'), sepatu='abutua', rok='panjang', gaya='rompi', rompi='mawar'),
    'mom':   dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='marun', rok='panjang', celemek='krem'),
    'inn':   dict(rambut=('coklat', 'marun'), baju=('hijau', 'abutua'), sepatu='coklat', celemek='krem', celana='coklat', kerah='krem'),
}


def cell(A, c, r):
    return A[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW].copy()


def frames(A):
    wd = [cell(A, i % 4, 43 + i // 4) for i in (0, 2, 4, 6)]
    wu = [cell(A, i % 4, 41 + i // 4) for i in (0, 2, 4, 6)]
    ws = [cell(A, i % 4, 39 + i // 4) for i in (0, 1, 3, 4)]
    idle = [cell(A, 0, 0), cell(A, 2, 0), cell(A, 0, 4), cell(A, 2, 4), cell(A, 0, 2), cell(A, 2, 2)]
    return [wd, wu, ws, idle]


def recolor(a, o, facing):
    hl, hd = (K[c] for c in o['rambut']); sh, shd = (K[c] for c in o['baju']); bt = K[o['sepatu']]
    BLK = (6, 1, 5, 255)
    b = a.copy()
    al = a[..., 3] > 0
    ys = np.nonzero(al.any(1))[0]
    if not len(ys):
        return b
    top, bot = ys[0], ys[-1]
    rgb = a[..., :3]
    yy = np.arange(a.shape[0])[:, None]
    eq = lambda c: (rgb == c).all(-1) & al
    skin = eq((233, 185, 110)) | eq((183, 115, 79))
    # baris leher = baris pertama di bawah wajah yang lebih banyak marun (syal) daripada kulit
    face_rows = [y for y in range(top, min(bot, top + 26)) if skin[y].sum() >= 3]
    neck = top + 18
    if face_rows:   # baris wajah = deret baris berkulit pertama yang bersambung
        neck = face_rows[0]
        while neck + 1 in face_rows or neck + 2 in face_rows:
            neck += 1
        neck += 1
    head = yy < neck - 1
    scarf = (yy >= neck - 1) & (yy < neck + 6)
    feet = yy > bot - 6
    b[eq(HAIR_L) & head] = (*hl, 255)
    b[(eq(HAIR_D) | eq(HAIR_S1) | eq(HAIR_S2)) & head] = (*hd, 255)
    paint_body(a, b, o, facing, top, neck, bot)
    hm = o.get('helm')
    if hm:   # tudung/helm: rambut di atas mata jadi warna helm
        eyes = [y for y in range(top, neck) if ((rgb[y] == (6, 1, 5)).all(-1) & skin[y].any()).any()]
        lim = top + 9
        hair = (eq(HAIR_L) | eq(HAIR_D) | eq(HAIR_S1) | eq(HAIR_S2)) & (yy < neck)
        b[hair] = (*K[hm], 255)
        b[hair & (yy < lim) & np.roll(~al, 1, 1)] = BLK
    tp = o.get('topi')
    if tp:
        col, brim = K[tp[0]], tp[1]
        hair = (b[..., 3] > 0) & (yy < top + 7) & ~(b[..., :3] == (6, 1, 5)).all(-1)
        b[hair] = (*col, 255)
        y = top + 6
        xs = np.nonzero(b[y, :, 3] > 0)[0]
        if len(xs):
            x0, x1 = max(1, xs[0] - brim), min(b.shape[1] - 2, xs[-1] + brim)
            b[y, x0:x1 + 1] = (*col, 255)
            b[y - 1, x0:x1 + 1] = np.where(b[y - 1, x0:x1 + 1, 3:] > 0, b[y - 1, x0:x1 + 1], BLK)
            b[y + 1, x0:x1 + 1] = np.where(b[y + 1, x0:x1 + 1, 3:] > 0, b[y + 1, x0:x1 + 1], BLK)
            b[y, x0 - 1] = BLK; b[y, x1 + 1] = BLK
    return b


FACING = [['d'] * 4, ['u'] * 4, ['s'] * 4, ['d', 'd', 's', 's', 'u', 'u']]


def nb4(m):
    p = np.pad(m, 1)
    return p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]


def paint_body(a, b, o, facing, top, neck, bot):
    """Cat ulang badan (leher→pinggul) dengan pakaian NPC sendiri; tangan, kepala, kaki tetap tubuh tokoh utama."""
    BLK = np.array((6, 1, 5, 255), np.uint8)
    C = lambda k: np.array((*K[k], 255), np.uint8)
    main, shade = C(o['baju'][0]), C(o['baju'][1])
    rgb = a[..., :3]; al = a[..., 3] > 0
    eq = lambda c: (rgb == c).all(-1) & al
    H_, W_ = al.shape
    yy, xx = np.mgrid[:H_, :W_]
    # pinggul = baris terakhir (dari leher) yang masih selebar badan (≥12 px bersambung)
    hip = neck + 10
    for y in range(neck, bot):
        row = al[y].astype(int)
        runs = np.diff(np.concatenate(([0], row, [0])))
        st, en = np.nonzero(runs == 1)[0], np.nonzero(runs == -1)[0]
        if len(st) and (en - st).max() >= 12:
            hip = y
        elif y > neck + 8:
            break
    rows = (yy >= neck - 1) & (yy <= hip)
    xs = np.nonzero(al[rows.any(1)].any(0))[0] if rows.any() else np.array([20, 40])
    bx0, bx1 = xs[0], xs[-1]
    skin = eq((233, 185, 110)) | eq((183, 115, 79)) | eq((236, 206, 172)) | eq((145, 96, 80)) | eq((112, 59, 46))
    hand = skin & ((xx <= bx0 + 4) | (xx >= bx1 - 4)) & (yy > neck + 4)
    hand = hand | (nb4(hand) & skin)
    T = al & rows & ~hand
    edge = T & nb4(~al)
    F = eq((6, 1, 5)); E = eq((84, 25, 32)); J = eq((163, 41, 28))
    line = F & nb4(J | E) & ~edge
    b[T] = main
    b[T & E] = shade
    b[T & line] = BLK
    b[edge] = BLK
    inner = T & ~edge
    cx = (bx0 + bx1) // 2
    face = facing
    def band(m, col):
        b[m & inner] = col
    # kerah
    if o.get('kerah'):
        band((yy >= neck - 1) & (yy <= neck), C(o['kerah']))
    # badan berbagai potongan
    st = o.get('gaya', 'kemeja')
    if st == 'rompi':
        if face == 'd':
            band((abs(xx - cx) >= 2) & (yy >= neck + 1) & (yy <= hip - 1), C(o['rompi']))
        else:
            band((yy >= neck + 1) & (yy <= hip - 1) & ~(J | E) if face == 's' else (yy >= neck + 1) & (yy <= hip - 1), C(o['rompi']))
    elif st == 'zirah':
        band(((yy - neck) % 3 == 2) & (yy > neck + 1), shade)
        band((yy >= neck) & (yy <= neck + 1), C('abu'))
    elif st == 'selempang' and face != 's':
        d = (xx - bx0) - (yy - neck) * (bx1 - bx0) / max(1, hip - neck)
        band((abs(d) <= 1.2), C(o['aksen']))
    elif st == 'overall' and face == 'd':
        band(((xx == cx - 3) | (xx == cx + 3)) & (yy >= neck) & (yy < neck + 6), C(o['aksen']))
        band((abs(xx - cx) <= 3) & (yy >= neck + 6), C(o['aksen']))
    elif st == 'kancing' and face == 'd':
        band((xx == cx) & (yy > neck) & ((yy - neck) % 3 == 1), shade)
    # celemek di depan
    ap = o.get('celemek')
    if ap and face != 'u':
        if face == 'd':
            m = (abs(xx - cx) <= 3) & (yy >= neck + 3) & al & (yy <= hip + 3)
        else:
            m = np.zeros_like(al)
            for y in range(neck + 3, hip + 4):
                xr = np.nonzero(al[y])[0]
                if len(xr):
                    x0 = xr[0]   # menghadap kiri: depan = sisi kiri
                    m[y, x0 + 1:x0 + 4] = True
        b[m & ~hand] = C(ap)
        b[m & ~hand & nb4(~m) & (abs(xx - cx) <= 4 if face == 'd' else True) & (yy > neck + 3)] = np.where(face == 'd', 1, 1) * BLK
    # sabuk
    if o.get('sabuk'):
        band(yy == hip - 1, C(o['sabuk']))
        if face == 'd':
            band((yy == hip - 1) & (abs(xx - cx) <= 1), C('zaitun'))
    # kaki: celana
    legs = al & (yy > hip) & (yy < bot - 4)
    pants = o.get('celana')
    if pants:
        lk = legs & (eq((233, 185, 110)) | eq((183, 115, 79)) | eq((236, 206, 172)) | eq((84, 25, 32)) | eq((145, 96, 80)) | eq((112, 59, 46)))
        b[lk] = C(pants)
    if o.get('rok'):   # rok / jubah: baju turun menutup kaki, sedikit melebar
        rl = bot - 4 if o['rok'] == 'panjang' else hip + 6
        for y in range(hip + 1, rl):
            xr = np.nonzero(al[y])[0]
            if len(xr) < 2:
                continue
            fl = 1 if y > hip + 3 else 0
            x0, x1 = max(0, xr[0] - fl), min(W_ - 1, xr[-1] + fl)
            b[y, x0 + 1:x1] = main if (y - hip) % 4 else shade
            b[y, x0] = BLK; b[y, x1] = BLK
        xr = np.nonzero(b[rl - 1, :, 3] > 0)[0]
        if len(xr):
            b[rl, xr[0]:xr[-1] + 1] = BLK
    boots = al & (yy >= hip + 1) & (eq((84, 25, 32)) | eq((145, 96, 80))) & ~(legs if pants else np.zeros_like(al))
    b[boots & (yy >= bot - 5)] = C(o['sepatu'])
    return hip


def build(nid, spec, A):
    out = np.zeros((4 * FH, 8 * FW, 4), np.uint8)
    for r, row in enumerate(frames(A)):
        for c, f in enumerate(row):
            out[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = recolor(f, spec, FACING[r][c])
    Image.fromarray(out).save(OUT % nid)


if __name__ == '__main__':
    A = np.array(Image.open(MC).convert('RGBA'))
    for nid, o in NPC.items():
        build(nid, o, A)
        print('ok', nid)
