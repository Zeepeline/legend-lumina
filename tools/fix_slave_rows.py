#!/usr/bin/env python3
"""hero_slave.png: baris selain jalan/diam/guling/kena/mati/bangkit (serangan, jurus, panah, pancing, cangkul, tambang, sorak, tidur)
adalah SALINAN hero_arka.png berbaju biru → baju berganti warna tiap Arka menyerang saat masih berskin 'slave' (awal permainan).
Alat ini menurunkan peta warna biru → krem dari baris yang sudah benar (siluet sama), lalu mewarnai ulang baris salinan itu.
Pemakaian: venv/bin/python tools/fix_slave_rows.py [--dry out.png]   (aman dijalankan ulang: hanya baris yang masih identik diubah)"""
import sys
from collections import Counter, defaultdict
import numpy as np
from PIL import Image
FH = 40
a = np.array(Image.open('assets/img/hero/hero_arka.png').convert('RGBA')).astype(int)
s = np.array(Image.open('assets/img/hero/hero_slave.png').convert('RGBA')).astype(int)
rows = s.shape[0] // FH
same = [r for r in range(rows) if (np.abs(a[r*FH:(r+1)*FH] - s[r*FH:(r+1)*FH]).sum(-1) > 0).sum() == 0]
good = [r for r in range(rows) if r not in same]
votes = defaultdict(Counter)
for r in good:
    A, S = a[r*FH:(r+1)*FH], s[r*FH:(r+1)*FH]
    m = (A[..., 3] > 200) & (S[..., 3] > 200) & (np.abs(A - S).sum(-1) > 0)
    for ca, cs in zip(map(tuple, A[m][:, :3]), map(tuple, S[m][:, :3])): votes[ca][cs] += 1
cmap = {ca: c.most_common(1)[0][0] for ca, c in votes.items() if sum(c.values()) >= 2}
keys = np.array(list(cmap.keys())); vals = np.array([cmap[tuple(k)] for k in keys])
def bluish(c): return c[2] - c[0] > 18 and c[2] >= c[1]
out = s.copy(); changed = 0
for r in same:
    blk = out[r*FH:(r+1)*FH]
    for y in range(FH):
        for x in range(blk.shape[1]):
            if blk[y, x, 3] < 200: continue
            c = tuple(blk[y, x, :3])
            if c in cmap: blk[y, x, :3] = cmap[c]; changed += 1
            elif bluish(c):
                d = np.abs(keys - np.array(c)).sum(1); i = int(d.argmin())
                if d[i] <= 90: blk[y, x, :3] = vals[i]; changed += 1
img = Image.fromarray(out.astype(np.uint8), 'RGBA')
if '--dry' in sys.argv: img.save(sys.argv[sys.argv.index('--dry') + 1])
else: img.save('assets/img/hero/hero_slave.png', optimize=True)
print(f'baris disalin: {same}; peta warna: {len(cmap)}; piksel diwarnai ulang: {changed}')
