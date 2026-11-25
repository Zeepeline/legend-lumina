"""Animasi diam dari piksel pemilik: bernapas (badan atas turun 1 px), jumbai rambut bergoyang 1 px, kedip (mata → kulit, sisa garis bawah)."""
import numpy as np; from PIL import Image; from scipy import ndimage
SKIN=(233,185,110); OUT=(6,1,5)
def _a(im): return np.array(im.convert('RGBA'))
def breathe(a, waist):
    """Baris di atas pinggang turun 1 px (kaki tetap)."""
    up=a[:waist].copy(); b=a.copy(); b[:waist]=0
    b[1:waist+1]=np.where(up[...,3:]>0,up,b[1:waist+1]); return b
def hair(a, rows=4, dx=1):
    """Jumbai paling atas (rows baris teratas sprite) bergeser dx."""
    b=a.copy(); ys=np.nonzero(a[...,3].any(1))[0]; y0=ys[0]
    top=a[y0:y0+rows].copy(); b[y0:y0+rows]=0; b[y0:y0+rows]=np.roll(top,dx,axis=1); return b
def eyes(a):
    """Mata = gumpalan piksel hitam kecil di wajah yang diapit kulit."""
    H,W=a.shape[:2]; sk=(a[...,:3]==SKIN).all(-1); bk=(a[...,:3]==OUT).all(-1)&(a[...,3]>0)
    p=np.pad(sk,1); nsk=p[:-2,1:-1].astype(int)+p[2:,1:-1]+p[1:-1,:-2]+p[1:-1,2:]
    lab,n=ndimage.label(bk); res=[]
    for i in range(1,n+1):
        m=lab==i; ys,xs=np.nonzero(m)
        if m.sum()<=4 and ys.max()-ys.min()<=2 and xs.max()-xs.min()<=1 and (nsk[m]>=1).all() and ys.min()<H*.5: res.append(m)
    return res
def blink(a):
    b=a.copy()
    for m in eyes(a):
        ys,xs=np.nonzero(m); b[m]=(*SKIN,255); yb=ys.max()
        for x in set(xs): b[yb,x]=(*OUT,255)   # kelopak tertutup = garis 1 px
    return b
def idle4(im, waist):
    a=_a(im); return [Image.fromarray(x) for x in (a, hair(a,4,1), breathe(a,waist), breathe(hair(a,4,1),waist))]
def blink4(im, waist):
    return [Image.fromarray(blink(np.array(f))) for f in idle4(im, waist)]
