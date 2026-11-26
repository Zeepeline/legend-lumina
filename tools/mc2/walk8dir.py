"""Jalan diagonal tokoh utama (hero_mc2), dipakai build_atlas.py.
Arah lurus = gambar pemilik apa adanya; diagonal = badan depan/belakang + kepala yang menoleh. Lengan TIDAK dilukis ulang."""
import numpy as np
from PIL import Image
from unify_head import head_rows, hair_cx
OUT=(6,1,5); SKIN=(233,185,110); SHAD=(183,115,79)
def diag_front(cells, side):
    """Depan-kanan: kepala tampak samping (satu acuan) sejajar leher & pusat rambut tiap frame."""
    R=np.array(side.convert('RGBA')); rt,rn=head_rows(R); rh=R[rt:rn]; out=[]
    for c in cells:
        a=np.array(c.convert('RGBA')); t,n=head_rows(a); b=a.copy(); b[:n]=0
        dx=int(round(hair_cx(a)-hair_cx(R))); src=np.zeros_like(rh); w=a.shape[1]
        for x in range(w):
            if 0<=x-dx<w: src[:,x]=rh[:,x-dx]
        y0=n-len(rh); cut=max(0,-y0); src=src[cut:]; y0=max(0,y0)
        b[y0:n]=np.where(src[...,3:]>0,src,b[y0:n]); out.append(Image.fromarray(b))
    return out
def diag_back(cells):
    """Belakang-kanan: secuil pipi di sisi kanan kepala."""
    out=[]
    for c in cells:
        b=np.array(c.convert('RGBA')); t,_=head_rows(b)
        for y in range(t+10,t+16):
            xs=np.nonzero(b[y,:,3])[0]
            if not len(xs): continue
            r=xs.max(); b[y,r]=(*OUT,255); b[y,r-1]=(*SKIN,255)
            if y>=t+12: b[y,r-2]=(*(SHAD if y>=t+14 else SKIN),255)
        out.append(Image.fromarray(b))
    return out
