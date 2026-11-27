"""Kepala NPC dari gambar referensi pemilik (tools/npc_ref/npc_ref_owner.png, 25 tokoh dalam grid 9×3).
Gambar referensi adalah lembar NPC kita yang digambar ulang (skala ≈6,11×), jadi tiap piksel dasar = pusat blok 6×6.
Hasil: tools/npc_ref/heads/<id>_d.png (tampak depan, juga dipakai tampak samping) dan <id>_u.png (belakang: wajah jadi rambut),
kanvas 64×56 dalam koordinat sel frame diam bawah. Jalankan: python3 tools/npc_ref_heads.py"""
import os
import numpy as np
from PIL import Image

REF = 'tools/npc_ref/npc_ref_owner.png'
OUT = 'tools/npc_ref/heads'
# urutan slot = urutan lembar perbandingan (slot 0 = posisi MC, tidak dipakai)
ORDER = ['_mc', 'ac1', 'ac2', 'ar1', 'bw1', 'courier', 'gk1', 'gk3', 'guard', 'in1', 'merc1', 'pm1', 'pm2', 'ps1', 'ps2',
         'smith', 'tp1', 'farmer', 'gun', 'hermit', 'lestari', 'nila', 'ratih', 'mom', 'inn']
CELL_X, CELL_Y = 17, 4       # posisi kiri-atas slot pada sel 64×56
HEAD_LAST = 21               # baris terakhir kepala (dagu) dalam slot
LONG_HAIR = {'tp1', 'pm1'}   # rambut melewati dagu: helai di bawah dagu ikut diambil
BG = np.array((111, 174, 96))
BLK = (6, 1, 5)


def small():
    im = np.array(Image.open(REF).convert('RGB')).astype(float)
    H, W, _ = im.shape
    sx, sy = W / 270, H / 156
    out = np.zeros((156, 270, 3), np.uint8)
    for y in range(156):
        for x in range(270):
            cy, cx = int((y + 0.5) * sy), int((x + 0.5) * sx)
            out[y, x] = np.median(im[cy - 1:cy + 2, cx - 1:cx + 2].reshape(-1, 3), 0)
    return out


def is_skin(c):
    r, g, b = (int(v) for v in c)
    return r > 170 and g > 120 and b > 80 and r - b > 45 and r >= g


def head(slot, R):
    x0, y0 = (slot % 9) * 30, (slot // 9) * 52
    a = R[y0:y0 + HEAD_LAST + 1, x0:x0 + 30].astype(int)
    al = np.abs(a - BG).sum(-1) > 55
    # baris terakhir: hanya kolom wajah (kerah baju dibuang)
    skin_cols = [x for x in range(30) if is_skin(a[HEAD_LAST - 1, x])]
    if skin_cols:
        al[HEAD_LAST, :min(skin_cols) - 1] = False
        al[HEAD_LAST, max(skin_cols) + 2:] = False
    # rapikan warna: kuantisasi ke ≤12 warna, hitam pekat = garis
    a2 = a.copy()
    a2[~al] = BLK                 # latar tidak ikut menentukan palet
    img = Image.fromarray(a2.astype(np.uint8))
    q = np.array(img.quantize(14, method=Image.Quantize.MEDIANCUT).convert('RGB')).astype(int)
    q[q.sum(-1) < 110] = BLK
    rgba = np.zeros((56, 64, 4), np.uint8)
    hgt = HEAD_LAST + 1
    rgba[CELL_Y:CELL_Y + hgt, CELL_X:CELL_X + 30, :3] = q
    rgba[CELL_Y:CELL_Y + hgt, CELL_X:CELL_X + 30, 3] = np.where(al, 255, 0)
    # hanya gumpalan terbesar (buang potongan tokoh tetangga, mis. tepi caping)
    m = rgba[..., 3] > 0
    lab = np.zeros(m.shape, int); n = 0; sizes = {}
    for sy, sx in zip(*np.nonzero(m)):
        if lab[sy, sx]:
            continue
        n += 1; stack = [(sy, sx)]; lab[sy, sx] = n; cnt = 0
        while stack:
            y, x = stack.pop(); cnt += 1
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < 56 and 0 <= xx < 64 and m[yy, xx] and not lab[yy, xx]:
                    lab[yy, xx] = n; stack.append((yy, xx))
        sizes[n] = cnt
    if sizes:
        big = max(sizes, key=sizes.get)
        rgba[m & (lab != big)] = 0
    # buang piksel tunggal yatim
    m = rgba[..., 3] > 0
    p = np.pad(m, 1)
    nb = p[:-2, 1:-1].astype(int) + p[2:, 1:-1] + p[1:-1, :-2] + p[1:-1, 2:]
    rgba[m & (nb == 0)] = 0
    # garis tepi hitam di sekeliling kepala
    m = rgba[..., 3] > 0
    p = np.pad(m, 1)
    ring = (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]) & ~m
    ring[CELL_Y + HEAD_LAST:] = False
    rgba[ring] = (*BLK, 255)
    return rgba


def face_color(d):
    """Warna kulit wajah: warna terang terbanyak di kotak tengah wajah."""
    box = d[18:24, 28:38]
    c = [tuple(int(v) for v in px[:3]) for row in box for px in row if px[3] and int(px[0]) + int(px[1]) + int(px[2]) > 330]
    if not c:
        return None
    vals, cnt = np.unique(np.array(c), axis=0, return_counts=True)
    return vals[cnt.argmax()]


def skin_mask(d):
    fc = face_color(d)
    m = d[..., 3] > 0
    if fc is None:
        return np.zeros(m.shape, bool)
    rgb = d[..., :3].astype(int)
    dist = np.abs(rgb - fc).sum(-1)
    dist2 = np.abs(rgb - (fc * 0.8)).sum(-1)
    sk = m & ((dist < 55) | (dist2 < 45))
    sk[:12] = False
    return sk


def long_extra(slot, R, d):
    """Rambut panjang di bawah dagu: piksel slot (baris 22–36) yang warnanya sama dengan rambut kepala."""
    x0, y0 = (slot % 9) * 30, (slot // 9) * 52
    a = R[y0:y0 + 37, x0:x0 + 30].astype(int)
    m = d[..., 3] > 0
    sk = skin_mask(d)
    hair = m & ~sk & (d[..., :3].astype(int).sum(-1) > 110)
    hair[CELL_Y + 12:] = False
    cols = np.unique(d[hair][:, :3].astype(int), axis=0)
    out = d.copy()
    for y in range(HEAD_LAST + 1, 37):
        for x in range(30):
            c = a[y, x]
            if np.abs(c - BG).sum() < 55:
                continue
            dist = np.abs(cols - c).sum(-1)
            if dist.min() < 40:
                out[CELL_Y + y, CELL_X + x] = (*cols[dist.argmin()], 255)
    m2 = out[..., 3] > 0
    p = np.pad(m2, 1)
    ring = (p[:-2, 1:-1] | p[2:, 1:-1] | p[1:-1, :-2] | p[1:-1, 2:]) & ~m2
    ring[:CELL_Y + HEAD_LAST + 1] = False
    out[ring] = (*BLK, 255)
    return out


def back(d):
    """Tampak belakang: kulit & mata di wajah diganti warna rambut."""
    u = d.copy()
    m = u[..., 3] > 0
    skin = skin_mask(d)
    ys, xs = np.nonzero(skin)
    if not len(ys):
        return u
    fy0, fy1, fx0, fx1 = ys.min(), ys.max(), xs.min(), xs.max()
    hair = m & ~skin & (u[..., :3].sum(-1) > 110)
    hair[fy0:] = False
    hy = np.nonzero(hair.any(1))[0]
    cols = u[hair][:, :3].astype(int)
    if not len(cols):
        return u
    lum = cols.sum(-1)
    light = np.median(cols[lum >= np.median(lum)], 0).astype(np.uint8)
    dark = np.median(cols[lum < np.median(lum)], 0).astype(np.uint8) if (lum < np.median(lum)).any() else light
    for y in range(fy0, fy1 + 1):
        for x in range(fx0 - 1, fx1 + 2):
            if m[y, x] and (skin[y, x] or (u[y, x, :3] == BLK).all() and fx0 < x < fx1 and y < fy1):
                c = light if y < fy0 + (fy1 - fy0) * 0.45 else dark
                if (x + y) % 5 == 0:
                    c = dark
                u[y, x, :3] = c
    return u


def skin_tone(d):
    sk = skin_mask(d)
    c = [tuple(int(v) for v in d[y, x, :3]) for y, x in zip(*np.nonzero(sk))]
    if not c:
        return None
    c = np.array(c)
    lum = c.sum(-1)
    base = np.median(c[lum >= np.median(lum)], 0).astype(int)
    shade = np.median(c[lum < np.median(lum)], 0).astype(int) if (lum < np.median(lum)).any() else (base * 0.8).astype(int)
    return tuple(base), tuple(shade)


# NPC yang tidak ada di gambar referensi: kepala diturunkan dari kepala referensi lain, warna rambut/kulit diganti.
# id: (sumber, ramp rambut terang→gelap atau None, kulit (terang, bayangan) atau None)
DERIVED = {
    'girl': ('_mc', None, None),                                                    # gadis berkonde di pojok gambar
    'guard_spear': ('gk1', None, ((214, 160, 112), (170, 120, 84))),
    'darma': ('merc1', ((120, 78, 50), (92, 58, 40), (64, 40, 30), (40, 26, 22)), ((176, 118, 78), (138, 88, 58))),
    'merchant': ('tp1', ((150, 98, 62), (122, 76, 50), (92, 56, 40), (60, 36, 30)), None),
    'joko': ('pm2', ((150, 146, 142), (120, 116, 114), (90, 88, 92), (60, 58, 66)), ((176, 118, 78), (138, 88, 58))),
    'elder': ('smith', ((206, 204, 200), (170, 168, 166), (130, 128, 132), (90, 88, 96)), None),
    'wati': ('nila', ((122, 54, 40), (98, 42, 34), (74, 32, 30), (48, 22, 24)), None),
    'hunter': ('ac1', ((120, 60, 40), (96, 46, 34), (72, 34, 30), (46, 24, 24)), None),
    'gk4': ('ar1', ((196, 150, 90), (160, 116, 70), (120, 84, 56), (80, 56, 40)), ((214, 160, 112), (170, 120, 84))),
    'gk2': ('guard', None, ((176, 118, 78), (138, 88, 58))),
    'bayu': ('in1', ((64, 44, 36), (52, 36, 30), (40, 28, 26), (28, 20, 20)), ((176, 118, 78), (138, 88, 58))),
}


TOL = {'wati': 0.6}


def recolor(d, hair_ramp, skin, tol=0.2):
    out = d.copy()
    m = d[..., 3] > 0
    sk = skin_mask(d)
    rgb = d[..., :3].astype(int)
    lum = rgb.sum(-1)
    if hair_ramp is not None:
        hair = m & ~sk & (lum > 110)
        # hanya warna rambut: warna yang paling banyak di bagian atas kepala & warna sejenisnya
        top = rgb[CELL_Y:CELL_Y + 8][hair[CELL_Y:CELL_Y + 8]]
        if len(top):
            ref = np.median(top, 0)
            hue = lambda c: np.array(c) / max(1, sum(c))
            hr = hue(ref)
            sel = hair & (np.abs(rgb / np.maximum(1, lum)[..., None] - hr).sum(-1) < tol)
            ls = np.sort(lum[sel])
            if len(ls):
                q = np.quantile(ls, [0.25, 0.5, 0.75])
                for y, x in zip(*np.nonzero(sel)):
                    i = 0 if lum[y, x] >= q[2] else 1 if lum[y, x] >= q[1] else 2 if lum[y, x] >= q[0] else 3
                    out[y, x, :3] = hair_ramp[i]
    if skin is not None:
        ls = np.sort(lum[sk])
        if len(ls):
            mid = np.median(ls)
            for y, x in zip(*np.nonzero(sk)):
                out[y, x, :3] = skin[0] if lum[y, x] >= mid else skin[1]
    return out


def main():
    R = small()
    os.makedirs(OUT, exist_ok=True)
    tones = {}
    for slot, nid in enumerate(ORDER):
        if nid.startswith('_'):
            continue
        d = head(slot, R)
        if nid in LONG_HAIR:
            d = long_extra(slot, R, d)
        Image.fromarray(d).save(f'{OUT}/{nid}_d.png')
        Image.fromarray(back(d)).save(f'{OUT}/{nid}_u.png')
        tones[nid] = skin_tone(d)
    for nid, (src, hr, skn) in DERIVED.items():
        slot = ORDER.index(src)
        d = head(slot, R)
        if src in LONG_HAIR:
            d = long_extra(slot, R, d)
        d = recolor(d, hr, skn, TOL.get(nid, 0.2))
        Image.fromarray(d).save(f'{OUT}/{nid}_d.png')
        Image.fromarray(back(d)).save(f'{OUT}/{nid}_u.png')
        tones[nid] = skn if skn else skin_tone(d)
    with open(f'{OUT}/kulit.txt', 'w') as f:
        for k, v in tones.items():
            if v:
                f.write(k + ' ' + ' '.join(str(int(c)) for c in (*v[0], *v[1])) + '\n')
    print('ok', len(tones))


if __name__ == '__main__':
    main()
