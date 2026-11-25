"""Bersih-bersih sprite (langkah 'clearing'): piksel yatim dibuang, tepi luar diberi garis tepi gelap, cek ≤16 warna."""
import numpy as np; from PIL import Image
OUT=(6,1,5); DARK={(6,1,5),(84,25,32),(48,52,88),(67,85,109)}
def clean(im):
    a=np.array(im.convert('RGBA')); m=a[...,3]>0; H,W=m.shape
    p=np.pad(m,1)
    n8=sum(p[1+dy:1+dy+H,1+dx:1+dx+W] for dy in (-1,0,1) for dx in (-1,0,1) if dy or dx)
    a[m&(n8<=1)]=0; m=a[...,3]>0; p=np.pad(m,1)      # 1. piksel yatim (mixel/sisa latar)
    edge=m&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])   # 3. tepi luar (bersentuhan 4 arah dg kosong)
    for y,x in zip(*np.nonzero(edge)):
        if tuple(a[y,x,:3]) not in DARK: a[y,x]=(*OUT,255)
    cols={tuple(c) for c in a[a[...,3]>0][:,:3]}; assert len(cols)<=16, len(cols)   # 4. maks 16 warna
    return Image.fromarray(a)
