import sys; sys.path.insert(0,'tools/mc2')
from pipe import frames; from PIL import Image; import numpy as np
# Tampak depan = gambar pemilik (3 frame ±48 px: diam, langkah kaki kanan, diam tangan lain), warna sudah dipetakan ke 12 warna kita.
def _lift_left(im, n=2):
    a=np.array(im); H,W=a.shape[:2]; cx=W//2; p=a[:, :cx].copy()
    keep=list(range(0,41))+list(range(41+n,H)); new=np.zeros_like(p); new[:len(keep)]=p[keep]
    ys=[y for y in range(H) if new[y,:,3].any()]; yb=ys[-1]
    for x in range(cx):
        if new[yb,x,3]: new[yb,x]=(6,1,5,255)   # sol sepatu
    a[:, :cx]=new; return Image.fromarray(a)
def front_imgs2(H=48):
    F=frames(Image.open('tools/mc2/front48.png')); L=_lift_left(F[2])
    return [F[0],F[1],F[2],L]
def front_walk8(FI):
    """8 frame semua beda: menapak (badan turun 1), setengah angkat, angkat penuh (badan naik 1), setengah turun."""
    from inbetween import leg, pad, crop
    F0,F1,F2,F3=FI; cx=F0.width//2; W=lambda im:im.width
    def f(im, l, r):  # l/r: perubahan kaki kiri/kanan (−angkat, +panjang)
        a=pad(im); w=im.width; c=w//2
        leg(a,0,c,l,41 if l<0 else 40); leg(a,c,w,r,41 if r<0 else 40); return crop(a)
    return [f(F0,-1,-1), f(F0,0,-1), f(F1,1,0), f(F0,0,-1), f(F2,-1,-1), f(F2,-1,0), f(F3,0,1), f(F2,-1,0)]
if __name__=='__main__':
    FI=front_imgs2(); s=Image.new('RGBA',(4*30,50),(90,140,90,255))
    for i,f in enumerate(FI): s.alpha_composite(f,(i*30+2,50-f.height))
    s.resize((s.width*6,s.height*6),Image.NEAREST).save('tools/mc2/fi.png')
