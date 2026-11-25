import sys; sys.path.insert(0,'tools/mc2')
from pipe import frames; from PIL import Image; import numpy as np
def backwalk(b=None):
    if b is None: b=np.array(frames(Image.open('tools/mc2/up12.png'))[0])
    H,W=b.shape[:2]
    TOP=36; L=(0,12); R=(12,W)   # kaki mulai baris 36; kiri x<12, kanan x>=12
    def lift(a,cols,n):
        if n<=0: return
        x0,x1=cols; part=a[:,x0:x1].copy(); keep=list(range(TOP,40))+list(range(40+n,H))
        new=np.zeros_like(part[TOP:]); new[:len(keep)]=part[keep]; a[TOP:,x0:x1]=new
    out=[]
    # (angkat kiri, angkat kanan, tubuh turun)
    for l,r,bob in [(0,0,1),(2,0,0),(3,0,0),(1,0,0),(0,0,1),(0,2,0),(0,3,0),(0,1,0)]:
        a=b.copy(); lift(a,L,l+bob); lift(a,R,r+bob)
        if bob:  # tubuh turun 1 px: geser bagian atas ke bawah, kaki sudah dipendekkan 1
            up=a[:TOP].copy(); a[:TOP]=0; a[1:TOP+1]=np.where(up[...,3:]>0,up,a[1:TOP+1])
            # baris paling bawah dipendekkan → tambahkan 1 baris kosong agar kaki tetap di tanah
        img=Image.fromarray(a); bb=img.getbbox(); out.append(img.crop((0,0,W,bb[3])))
    return out
if __name__=='__main__':
    F=backwalk(); s=Image.new('RGBA',(8*32,56),(90,140,90,255))
    for i,f in enumerate(F): s.alpha_composite(f,(i*32+3,56-f.height))
    s.resize((s.width*4,s.height*4),Image.NEAREST).save('tools/mc2/bw.png')
