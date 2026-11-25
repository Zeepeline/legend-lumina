"""Frame antara dari piksel gambar pemilik (tanpa menggambar ulang): kaki diangkat/dipanjangkan per baris, tangan digeser 1 px."""
import numpy as np; from PIL import Image
def leg(a, x0, x1, n, r):
    """n<0: kaki diangkat |n| baris (baris r.. dibuang); n>0: kaki menapak dipanjangkan n baris (baris r diulang)."""
    if not n: return a
    H=a.shape[0]; c=a[:,x0:x1]; up,lo=c[:r],c[r:]
    if n<0: new=np.concatenate([up,lo[-n:],np.zeros((-n,)+c.shape[1:],c.dtype)])
    else: new=np.concatenate([up,np.repeat(c[r:r+1],n,0),lo])[:H]
    a[:,x0:x1]=new; return a
def arm(a, x0, x1, y0, y1, dy):
    """Geser blok tangan (kolom x0..x1, baris y0..y1) naik/turun dy; celah diisi piksel di sebelahnya."""
    if not dy: return a
    blk=a[y0:y1,x0:x1].copy(); a[y0:y1,x0:x1]=0
    dst=a[y0+dy:y1+dy,x0:x1]; a[y0+dy:y1+dy,x0:x1]=np.where(blk[...,3:]>0,blk,dst)
    if dy>0: a[y0,x0:x1]=np.where(blk[0,...,3:]>0,blk[0],a[y0,x0:x1])   # bahu tetap tertutup
    return a
def pad(im, n=3):
    a=np.array(im.convert('RGBA')); return np.concatenate([a,np.zeros((n,)+a.shape[1:],a.dtype)])
def crop(a):
    im=Image.fromarray(a); bb=im.getbbox(); return im.crop((0,0,a.shape[1],bb[3]))
