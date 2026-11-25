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
    from inbetween import arm
    from legs_front import compose, leg_parts, STAND, SWING, HIGH, DOWN, PLANT
    from front_img import front_imgs2
    f0=np.array(front_imgs2()[0].convert('RGBA')); _,sk,bt=leg_parts(f0)   # potongan kaki (kulit/sepatu) yang sama dari gambar depan
    c=W//2; P=([(c-6,c-2),(c+1,c+5)],sk,bt)
    AWAY=(3,3,0,0); NEAR=(5,4,1,0)   # menjauh = lebih tinggi/pendek; kaki dekat kamera = lebih panjang
    seq=[(AWAY,NEAR,0,0),(PLANT,SWING,1,-1),(PLANT,HIGH,1,-1),(STAND,DOWN,1,-1),(NEAR,AWAY,0,0),(SWING,PLANT,-1,1),(HIGH,PLANT,-1,1),(DOWN,STAND,-1,1)]
    out=[]
    for l,r,al,ar in seq:
        a=b.copy(); a=arm(a,0,4,26,35,al); a=arm(a,W-4,W,26,35,ar); out.append(compose(a,l,r,P))
    return out
if __name__=='__main__':
    F=backwalk(); s=Image.new('RGBA',(8*32,56),(90,140,90,255))
    for i,f in enumerate(F): s.alpha_composite(f,(i*32+3,56-f.height))
    s.resize((s.width*4,s.height*4),Image.NEAREST).save('tools/mc2/bw.png')

def back_stand():
    """Diam tampak belakang dengan kaki yang sama seperti jalan (kulit/sepatu dari gambar depan)."""
    from legs_front import compose, leg_parts, STAND
    from front_img import front_imgs2
    b=np.array(frames(Image.open('tools/mc2/up12.png'))[0]); W=b.shape[1]; c=W//2
    _,sk,bt=leg_parts(np.array(front_imgs2()[0].convert('RGBA')))
    return compose(b,STAND,STAND,([(c-6,c-2),(c+1,c+5)],sk,bt))
