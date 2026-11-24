#!/usr/bin/env python3
"""Kurangi warna sprite secara minimalis: warna yang hampir kembar digabung (yang paling mirip & paling jarang dulu),
tiap kelompok memakai warna ASLI yang paling dekat (tidak membuat warna baru yang kusam).
Pakai: python3 tools/palette_reduce.py <gambar.png> [jumlah_warna=12] [keluaran.png]  (bawaan: menimpa gambar)"""
import sys
import numpy as np
from PIL import Image
def dist(a,b):  # jarak warna berbobot persepsi (redmean)
    r=(a[0]+b[0])/2; d=a-b
    return ((2+r/256)*d[0]**2+4*d[1]**2+(2+(255-r)/256)*d[2]**2)**.5
def reduce(img, target=12):
    a=np.asarray(img.convert('RGBA')).copy(); al=a[...,3]>0
    cols,inv,cnt=np.unique(a[al][:,:3].astype(float),axis=0,return_inverse=True,return_counts=True)
    C=[c.copy() for c in cols]; N=list(cnt.astype(float)); grp=list(range(len(C))); alive=set(range(len(C)))
    while len(alive)>target:
        best=None
        for i in alive:
            for j in alive:
                if j<=i: continue
                # biaya gabung: jarak × akar bobot kecil (warna jarang lebih mudah digabung)
                d=dist(C[i],C[j])*min(N[i],N[j])**.25
                if best is None or d<best[0]: best=(d,i,j)
        _,i,j=best; w=N[i]+N[j]; C[i]=(C[i]*N[i]+C[j]*N[j])/w; N[i]=w; alive.remove(j)
        grp=[i if g==j else g for g in grp]
    # pilih warna asli terdekat ke rata-rata grup agar tidak muncul warna baru yang kusam
    rep={}
    for g in alive:
        members=[k for k in range(len(cols)) if grp[k]==g]
        rep[g]=min((cols[k] for k in members), key=lambda c: dist(c,C[g]))
    newc=np.array([rep[grp[k]] for k in range(len(cols))])
    out=a.copy(); px=out[al]; px[:,:3]=newc[inv.ravel()]; out[al]=px
    return Image.fromarray(out,'RGBA'), [tuple(int(v) for v in rep[g]) for g in sorted(alive)]


if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    src = sys.argv[1]; n = int(sys.argv[2]) if len(sys.argv) > 2 else 12; out = sys.argv[3] if len(sys.argv) > 3 else src
    im, pal = reduce(Image.open(src), n); im.save(out); print(out, len(pal), "warna")
