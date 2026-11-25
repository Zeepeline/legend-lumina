"""Jalan samping mulus: badan atas (kepala, syal, tunik, celemek) dari SATU frame acuan, kaki dari tiap frame gambar pemilik.
Badan diletakkan di atas garis keliman tiap frame (ayunan naik-turun ikut langkah kaki), tangan berayun ±1 px berlawanan."""
import numpy as np; from PIL import Image
BLACK=(6,1,5)
def hem(a):
    """Baris keliman: baris terbawah (di atas kaki) yang berisi satu ruas hitam ≥8 px."""
    H=a.shape[0]; best=None
    for y in range(H//2,H-6):
        row=a[y]; on=row[...,3]>0; xs=np.nonzero(on)[0]
        if not len(xs): continue
        segs=np.split(xs,np.nonzero(np.diff(xs)>1)[0]+1)
        blk=(row[...,:3]==BLACK).all(-1)
        if len(segs)==1 and len(segs[0])>=8 and blk[segs[0]].mean()>.7: best=y
    return best
def walk(cells, ref, swing):
    A=[np.array(c.convert('RGBA')) for c in cells]; R=A[ref]; rh=hem(R); up=R[:rh+1].copy()
    al=up[...,3]>0; cols=np.nonzero(al[rh-12:rh+1].any(0))[0]; tl,tr=cols.min()+3,cols.max()-3   # badan (tanpa tangan menjulur)
    out=[]
    for a,s in zip(A,swing):
        h=hem(a); b=np.zeros_like(a); b[h+1:]=a[h+1:]                       # kaki frame ini
        u=up.copy()
        if s:   # tangan belakang (kiri badan) & depan (kanan badan) naik/turun 1 px berlawanan (vertikal: tidak ada celah)
            for x0,x1,d in ((0,tl,-s),(tr,u.shape[1],s)):
                blk=u[:,x0:x1].copy(); top=rh-16   # hanya bagian tangan (setengah bawah badan atas)
                part=blk[top:].copy(); nb=part.copy()
                if d>0: nb[d:]=part[:-d]; nb[:d]=part[:d]
                else: nb[:d]=part[-d:]; nb[d:]=part[d:]
                u[top:,x0:x1]=nb
        y0=h-rh
        for y in range(u.shape[0]):
            yy=y0+y
            if 0<=yy<b.shape[0]: b[yy]=np.where(u[y][...,3:]>0,u[y],b[yy])
        out.append(Image.fromarray(b))
    return out
