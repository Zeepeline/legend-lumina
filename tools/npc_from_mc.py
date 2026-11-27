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

# id: rambut (terang, gelap), baju (utama, bayangan), sepatu, + pilihan pakaian:
#   rok = baju menutup kaki atas (perempuan / jubah), syal = syal tokoh utama dipertahankan (warna), celemek = warna celemek,
#   topi = (warna, lebar pinggir) menutup puncak rambut; helm = warna menutup rambut hingga dahi.
NPC = {
    'ac1':   dict(rambut=('birutua', 'hitam'), baju=('biru', 'birutua'), sepatu='birutua', rok=True, syal='zaitun'),
    'ac2':   dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='coklat'),
    'ar1':   dict(rambut=('krem', 'abu'), baju=('coklat', 'marun'), sepatu='marun', rok=True),
    'bw1':   dict(rambut=('birutua', 'hitam'), baju=('merah', 'marun'), sepatu='coklat', syal='krem'),
    'courier': dict(rambut=('coklat', 'marun'), baju=('zaitun', 'hijau'), sepatu='coklat', topi=('biru', 1)),
    'gk1':   dict(rambut=('abu', 'abutua'), baju=('merah', 'marun'), sepatu='abutua', helm='abu', celemek='abu'),
    'gk3':   dict(rambut=('zaitun', 'hijau'), baju=('hijau', 'abutua'), sepatu='coklat'),
    'guard': dict(rambut=('abu', 'abutua'), baju=('abu', 'abutua'), sepatu='abutua', helm='abu', syal='merah'),
    'in1':   dict(rambut=('coklat', 'marun'), baju=('krem', 'coklat'), sepatu='coklat'),
    'merc1': dict(rambut=('oranye', 'merah'), baju=('abutua', 'hitam'), sepatu='hitam', syal='abutua'),
    'pm1':   dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='coklat', topi=('biru', 2)),
    'pm2':   dict(rambut=('abu', 'abutua'), baju=('krem', 'coklat'), sepatu='coklat'),
    'ps1':   dict(rambut=('kulit', 'oranye'), baju=('mawar', 'marun'), sepatu='marun', rok=True),
    'ps2':   dict(rambut=('abu', 'abutua'), baju=('coklat', 'marun'), sepatu='coklat', topi=('kulit', 3), celemek='krem'),
    'smith': dict(rambut=('birutua', 'hitam'), baju=('coklat', 'marun'), sepatu='hitam', celemek='abutua'),
    'tp1':   dict(rambut=('hitam', 'hitam'), baju=('krem', 'abu'), sepatu='coklat', rok=True),
    'farmer': dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='coklat', topi=('kulit', 3)),
    'gun':   dict(rambut=('coklat', 'marun'), baju=('coklat', 'marun'), sepatu='coklat', helm='kulit'),
    'hermit': dict(rambut=('mawar', 'marun'), baju=('mawar', 'marun'), sepatu='marun', rok=True, helm='mawar'),
    'lestari': dict(rambut=('oranye', 'merah'), baju=('birutua', 'hitam'), sepatu='hitam', rok=True),
    'nila':  dict(rambut=('coklat', 'marun'), baju=('oranye', 'coklat'), sepatu='coklat', rok=True, helm='coklat'),
    'ratih': dict(rambut=('abu', 'abutua'), baju=('krem', 'abu'), sepatu='abutua', rok=True),
    'mom':   dict(rambut=('coklat', 'marun'), baju=('biru', 'birutua'), sepatu='marun', rok=True, celemek='krem'),
    'inn':   dict(rambut=('coklat', 'marun'), baju=('hijau', 'abutua'), sepatu='coklat', celemek='krem'),
}


def cell(A, c, r):
    return A[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW].copy()


def frames(A):
    wd = [cell(A, i % 4, 43 + i // 4) for i in (0, 2, 4, 6)]
    wu = [cell(A, i % 4, 41 + i // 4) for i in (0, 2, 4, 6)]
    ws = [cell(A, i % 4, 39 + i // 4) for i in (0, 1, 3, 4)]
    idle = [cell(A, 0, 0), cell(A, 2, 0), cell(A, 0, 4), cell(A, 2, 4), cell(A, 0, 2), cell(A, 2, 2)]
    return [wd, wu, ws, idle]


def recolor(a, o):
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
    b[eq(TUNIC) & ~head] = (*sh, 255)
    mar = eq(MAROON) & ~head
    b[mar & ~feet] = (*shd, 255)
    b[mar & feet] = (*bt, 255)
    sy = o.get('syal')
    b[mar & scarf] = (*(K[sy] if sy else sh), 255)            # syal → warna syal, atau kerah baju
    ap = o.get('celemek')
    apron = (eq(CREAM) | eq(HAIR_L) | eq(HAIR_D)) & ~head
    b[apron] = (*(K[ap] if ap else sh), 255)                   # tanpa celemek → baju polos
    if ap:
        b[(eq(HAIR_L) | eq(HAIR_D)) & ~head] = (*K[ap], 255)
    if o.get('rok'):   # rok/jubah: baju menutup kaki hingga 5 baris di atas telapak
        for y in range(neck + 14, bot - 4):
            xs = np.nonzero(b[y, :, 3] > 0)[0]
            if len(xs) < 2:
                continue
            x0, x1 = xs[0], xs[-1]
            b[y, x0 + 1:x1] = (*sh, 255)
            b[y, x0] = BLK; b[y, x1] = BLK
        y = bot - 4
        xs = np.nonzero(b[y - 1, :, 3] > 0)[0]
        if len(xs):
            b[y - 1, xs[0]:xs[-1] + 1] = BLK
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


def build(nid, spec, A):
    out = np.zeros((4 * FH, 8 * FW, 4), np.uint8)
    for r, row in enumerate(frames(A)):
        for c, f in enumerate(row):
            out[r * FH:(r + 1) * FH, c * FW:(c + 1) * FW] = recolor(f, spec)
    Image.fromarray(out).save(OUT % nid)


if __name__ == '__main__':
    A = np.array(Image.open(MC).convert('RGBA'))
    for nid, o in NPC.items():
        build(nid, o, A)
        print('ok', nid)
