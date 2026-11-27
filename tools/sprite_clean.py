"""Bersih-bersih sprite (langkah 'clearing'): piksel yatim dibuang, tepi luar diberi garis tepi gelap, cek ≤16 warna."""
import numpy as np; from PIL import Image
OUT=(6,1,5); DARK={(6,1,5),(84,25,32),(48,52,88),(67,85,109)}
def clean(im, keep=()):
    """keep = warna yang tepinya tidak diberi garis tepi (bilah pedang, smear)."""
    a=np.array(im.convert('RGBA')); m=a[...,3]>0; H,W=m.shape
    p=np.pad(m,1)
    n8=sum(p[1+dy:1+dy+H,1+dx:1+dx+W] for dy in (-1,0,1) for dx in (-1,0,1) if dy or dx)
    a[m&(n8<=1)]=0; m=a[...,3]>0; p=np.pad(m,1)      # 1. piksel yatim (mixel/sisa latar)
    edge=m&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])   # 3. tepi luar (bersentuhan 4 arah dg kosong)
    for y,x in zip(*np.nonzero(edge)):
        if tuple(a[y,x,:3]) not in DARK and tuple(a[y,x,:3]) not in keep: a[y,x]=(*OUT,255)
    cols={tuple(c) for c in a[a[...,3]>0][:,:3]}; assert len(cols)<=16, len(cols)   # 4. maks 16 warna
    return Image.fromarray(a)


def despeckle(a):
    """Mixel/bintik: piksel yang warnanya beda dari ke-4 tetangganya padahal ke-4 tetangga itu sewarna → ikut warna tetangga."""
    b=a.copy(); H,W=a.shape[:2]
    for y in range(1,H-1):
        for x in range(1,W-1):
            if a[y,x,3]==0: continue
            n=[tuple(a[y-1,x]),tuple(a[y+1,x]),tuple(a[y,x-1]),tuple(a[y,x+1])]
            lum=lambda c:.3*int(c[0])+.59*int(c[1])+.11*int(c[2])
            # piksel gelap kecil (mata, kancing, garis) dipertahankan — hanya bintik TERANG/sedang yang diratakan
            if n[0][3] and len(set(n))==1 and n[0]!=tuple(a[y,x]) and lum(a[y,x])>=lum(n[0]): b[y,x]=a[y-1,x]
    return b

def clean_any(im, dark_lum=75, max_colors=16):
    """Bersih-bersih umum (NPC): yatim dibuang, bintik diratakan, tepi luar non-gelap → warna tergelap sprite, cek ≤ max_colors."""
    a=np.array(im.convert('RGBA')); m=a[...,3]>0; H,W=m.shape
    p=np.pad(m,1); n8=sum(p[1+dy:1+dy+H,1+dx:1+dx+W] for dy in (-1,0,1) for dx in (-1,0,1) if dy or dx)
    a[m&(n8<=1)]=0; a=despeckle(a); m=a[...,3]>0; p=np.pad(m,1)
    cols=[tuple(int(v) for v in c) for c in a[m][:,:3]]; out=min(set(cols),key=lambda c:sum(c))
    lum=lambda c:.3*c[0]+.59*c[1]+.11*c[2]
    edge=m&~(p[:-2,1:-1]&p[2:,1:-1]&p[1:-1,:-2]&p[1:-1,2:])
    for y,x in zip(*np.nonzero(edge)):
        if lum(a[y,x,:3])>dark_lum: a[y,x]=(*out,255)
    n=len({tuple(c) for c in a[a[...,3]>0][:,:3]}); assert n<=max_colors, n
    return Image.fromarray(a)
