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
def walk(cells, ref, swing=None):
    """Badan (kepala–keliman) dari frame acuan; di luar lebar badan (= TANGAN) dipakai piksel frame itu sendiri → tangan berayun asli."""
    A=[np.array(c.convert('RGBA')) for c in cells]; R=A[ref]; rh=hem(R)
    sk=R[rh-5:rh+1,:,3]>0; cols=np.nonzero(sk.any(0))[0]; tl,tr=cols.min(),cols.max()   # lebar rok = lebar badan
    UP=R[:rh+1].copy()   # tangan acuan yang menyilang dada (kulit di dalam lebar badan, di bawah syal) → warna tunik
    SKIN=(233,185,110); TUNIC=(163,41,28)
    for y in range(rh-16, rh-8):
        for x in range(tl, tr+1):
            if tuple(int(v) for v in UP[y,x,:3])==SKIN: UP[y,x,:3]=TUNIC
    out=[]
    for a in A:
        h=hem(a); b=np.zeros_like(a); b[h+1:]=a[h+1:]   # kaki frame ini
        y0=h-rh; up=UP
        for y in range(up.shape[0]):
            yy=y0+y
            if 0<=yy<b.shape[0]: b[yy]=np.where(up[y][...,3:]>0,up[y],b[yy])
        # tangan: baris bahu s.d. keliman; buang tangan acuan di luar badan, pakai tangan frame ini (sejajar keliman)
        top=h-16; dx=0
        for yy in range(max(0,top),h+1):
            ry=yy-y0
            b[yy,:tl]=0; b[yy,tr+1:]=0
            b[yy,:tl]=a[yy,:tl]; b[yy,tr+1:]=a[yy,tr+1:]
        out.append(Image.fromarray(b))
    return out

APRON=(236,206,172); TUNIC=(163,41,28); SKIN=(233,185,110)
def skirt_cx(a, h):
    al=a[h-5:h+1,:,3]>0; xs=np.nonzero(al.any(0))[0]; return (xs.min()+xs.max())/2
def apron_box(a, h):
    m=(a[...,:3]==APRON).all(-1)&(a[...,3]>0); m[:h-16]=False; m[h+1:]=False
    ys,xs=np.nonzero(m); return ys.min()-1, ys.max()+1, xs.min()-1, xs.max()+1
def walk2(cells, ref):
    """Badan & tangan tetap dari tiap frame (tangan berayun asli); hanya CELEMEK diseragamkan dari frame acuan
    (ditempel sejajar keliman & tengah rok tiap frame, tangan/kulit frame tetap di atasnya)."""
    A=[np.array(c.convert('RGBA')) for c in cells]; R=A[ref]; rh=hem(R); y0,y1,x0,x1=apron_box(R,rh)
    patch=R[y0:y1+1,x0:x1+1].copy(); pm=(patch[...,3]>0); rcx=skirt_cx(R,rh)
    out=[]
    for a in A:
        b=a.copy(); h=hem(a)
        ap=(b[...,:3]==APRON).all(-1)&(b[...,3]>0); ap[:h-16]=False; ap[h+1:]=False
        b[ap,:3]=TUNIC                                   # celemek lama → tunik
        dy=h-rh; dx=int(round(skirt_cx(a,h)-rcx))
        for yy in range(patch.shape[0]):
            for xx in range(patch.shape[1]):
                Y=y0+yy+dy; X=x0+xx+dx
                if not pm[yy,xx] or not (0<=Y<b.shape[0] and 0<=X<b.shape[1]): continue
                if b[Y,X,3]==0: continue                  # jangan keluar siluet
                if tuple(int(v) for v in b[Y,X,:3])==SKIN: continue   # tangan di depan celemek
                b[Y,X]=patch[yy,xx]
        out.append(Image.fromarray(b))
    return out
