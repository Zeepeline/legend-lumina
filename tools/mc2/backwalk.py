import sys; sys.path.insert(0,'tools/mc2')
from pipe import frames; from PIL import Image; import numpy as np
def backwalk(b=None):
    if b is None:
        b=np.array(frames(Image.open('tools/mc2/up12.png'))[0])
        g=(b[37:,:,:3]==(120,139,79)).all(-1); b[37:][g]=(233,185,110,255)   # bintik hijau di lutut (sisa AI) → kulit
    H,W=b.shape[:2]
    TOP=36; L=(0,12); R=(12,W)   # kaki mulai baris 36; kiri x<12, kanan x>=12
    def lift(a,cols,n):
        if n<=0: return
        x0,x1=cols; part=a[:,x0:x1].copy(); keep=list(range(TOP,40))+list(range(40+n,H))
        new=np.zeros_like(part[TOP:]); new[:len(keep)]=part[keep]; a[TOP:,x0:x1]=new
    from inbetween import leg, arm, pad, crop
    out=[]
    # (kiri, kanan, tangan kiri, tangan kanan): kaki −angkat/+panjang (badan naik); tangan ±1 px berayun berlawanan
    for l,r,al,ar in [(-1,-1,0,0),(-2,0,1,-1),(-3,1,1,-1),(-1,0,1,-1),(-1,-1,0,0),(0,-2,-1,1),(1,-3,-1,1),(0,-1,-1,1)]:
        a=pad(Image.fromarray(b)); a=leg(a,0,12,l,40 if l<0 else 39); a=leg(a,12,W,r,40 if r<0 else 39)
        a=arm(a,0,4,26,35,al); a=arm(a,W-4,W,26,35,ar); out.append(crop(a))
    return out
if __name__=='__main__':
    F=backwalk(); s=Image.new('RGBA',(8*32,56),(90,140,90,255))
    for i,f in enumerate(F): s.alpha_composite(f,(i*32+3,56-f.height))
    s.resize((s.width*4,s.height*4),Image.NEAREST).save('tools/mc2/bw.png')
