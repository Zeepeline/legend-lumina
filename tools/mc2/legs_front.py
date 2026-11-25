"""Kaki tampak depan dari potongan piksel kaki pemilik (kulit FLLLF, sepatu FEEEF): kaki depan lebih panjang & sepatu melebar
(mendekat ke kamera), kaki belakang tumit terangkat (lebih pendek), kaki terayun menekuk (betis bawah geser 1 px ke dalam)."""
import numpy as np; from PIL import Image
F=(6,1,5,255); TOP=39
def runs(row):
    xs=np.nonzero(row[:,3])[0]; out=[]; s=None
    for i,x in enumerate(xs):
        if s is None: s=x
        if i+1==len(xs) or xs[i+1]!=x+1: out.append((s,x)); s=None
    return out
def leg_parts(a):
    """Ambil baris kulit & sepatu asli tiap kaki (kiri, kanan) dan posisi x-nya."""
    r=runs(a[40]); assert len(r)==2, r
    skin=[a[40,x0:x1+1].copy() for x0,x1 in r]; boot=[a[45,x0:x1+1].copy() for x0,x1 in r]
    return r, skin, boot
def draw(a, x0, skin, boot, n_skin, n_boot, flare, dx, inward):
    """Gambar satu kaki mulai baris TOP. dx = geser betis bawah (lutut menekuk) ke arah 'inward' (±1)."""
    y=TOP; w=len(skin)
    for i in range(n_skin):
        s=dx*inward if i>=2 else 0; a[y,x0+s:x0+s+w]=skin; y+=1
    s=dx*inward
    for i in range(n_boot):
        if flare and i>=n_boot-flare:   # sepatu melebar 1 px ke dua sisi (ujung menghadap kamera)
            row=np.concatenate([[F],boot[1:2],boot[1:-1],boot[-2:-1],[F]]); a[y,x0+s-1:x0+s+w+1]=row
        else: a[y,x0+s:x0+s+w]=boot
        y+=1
    lo,hi=(x0+s,x0+s+w) if not flare else (x0+s,x0+s+w)   # sol (garis bawah)
    a[y,lo:hi]=F
def compose(im, L, R):
    """L/R = (kulit, sepatu, melebar, tekuk) untuk kaki kiri & kanan."""
    a=np.array(im.convert('RGBA')); a=np.concatenate([a,np.zeros((4,)+a.shape[1:],a.dtype)])
    r,skin,boot=leg_parts(a); a[TOP:]=0
    for (x0,_),sk,bt,spec,inw in zip(r,skin,boot,(L,R),(1,-1)): draw(a,x0,sk,bt,*spec,inw)
    im=Image.fromarray(a); bb=im.getbbox(); return im.crop((0,0,a.shape[1],bb[3]))
STAND=(4,4,1,0); FWD=(5,4,2,0); BACK=(3,3,0,0); SWING=(2,3,0,1); HIGH=(1,3,0,1); DOWN=(3,4,1,0); PLANT=(5,4,1,0)
def walk8(F0, F2):
    return [compose(F0,FWD,BACK), compose(F0,PLANT,SWING), compose(F0,PLANT,HIGH), compose(F0,STAND,DOWN),
            compose(F2,BACK,FWD), compose(F2,SWING,PLANT), compose(F2,HIGH,PLANT), compose(F2,DOWN,STAND)]
