"""Seragamkan kepala di frame jalan samping: blok kepala (puncak rambut s.d. di atas syal) dari frame acuan disalin ke frame lain,
sejajar puncak & pusat rambut frame itu (ayunan naik-turun tetap) — agar wajah/rambut tidak berkedip antar-frame."""
import numpy as np; from PIL import Image
SCARF=(84,25,32); HAIR=[(166,171,64),(120,139,79)]
def head_rows(a):
    al=a[...,3]>0; top=np.nonzero(al.any(1))[0][0]
    sc=(a[...,:3]==SCARF).all(-1)&al
    rows=np.nonzero(sc.sum(1)>=4)[0]; rows=rows[rows>top+8]
    return top, int(rows[0])   # [top, neck) = kepala
def hair_cx(a):
    m=np.zeros(a.shape[:2],bool)
    for c in HAIR: m|=(a[...,:3]==c).all(-1)&(a[...,3]>0)
    return float(np.nonzero(m)[1].mean())
def unify(frames, ref_i):
    A=[np.array(f.convert('RGBA')) for f in frames]; R=A[ref_i]; rt,rn=head_rows(R); rh=R[rt:rn]; rcx=hair_cx(R)
    out=[]
    for i,a in enumerate(A):
        if i==ref_i: out.append(Image.fromarray(a)); continue
        t,n=head_rows(a); dx=int(round(hair_cx(a)-rcx)); b=a.copy()
        b[t:n]=0   # kepala lama dibuang; kepala acuan disejajarkan ke LEHER frame ini (ayunan badan tetap)
        H=rn-rt; y0=n-H; W=b.shape[1]
        for y in range(H):
            yy=y0+y
            if yy<0: continue
            row=np.zeros((W,4),np.uint8); xs=np.arange(W)-dx; ok=(xs>=0)&(xs<W); row[ok]=rh[y][xs[ok]]
            b[yy]=np.where(row[...,3:]>0,row,b[yy])
        out.append(Image.fromarray(b))
    return out
