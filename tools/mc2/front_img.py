import sys; sys.path.insert(0,'tools/mc2')
from pipe import frames; from PIL import Image; import numpy as np
from front import PAL
P=np.array(list(PAL.values()),float)
def to_pal(im):
    a=np.array(im.convert('RGBA')).astype(float); rgb=a[...,:3]
    d=((rgb[...,None,:]-P[None,None])**2).sum(-1); idx=d.argmin(-1)
    out=np.zeros(a.shape,np.uint8); out[...,:3]=P[idx]; out[...,3]=np.where(a[...,3]>0,255,0); return out
def front_imgs(H=48):
    e=Image.open('tools/mc2/r3raw.png'); F=frames(e.crop((0,5,e.width,e.height)))
    k=H/max(F[i].height for i in (0,1,2,4)); out=[]
    for i in (0,1,2,4):
        f=F[i]; w,h=round(f.width*k),round(f.height*k)
        out.append(Image.fromarray(to_pal(f.resize((w,h),Image.NEAREST))))
    return out
if __name__=='__main__':
    F=front_imgs(); s=Image.new('RGBA',(4*36,52),(90,140,90,255))
    for i,f in enumerate(F): s.alpha_composite(f,(i*36+2,52-f.height))
    s.resize((s.width*6,s.height*6),Image.NEAREST).save('tools/mc2/fi.png')

def scale2x(a):
    H,W=a.shape[:2]; o=np.zeros((H*2,W*2,4),a.dtype); p=np.pad(a,((1,1),(1,1),(0,0)),mode='edge')
    eq=lambda u,v:(u==v).all()
    for y in range(H):
        for x in range(W):
            P=p[y+1,x+1]; A=p[y,x+1]; B=p[y+1,x+2]; C=p[y+1,x]; D=p[y+2,x+1]
            e=[P,P,P,P]
            if not eq(C,B) and not eq(A,D):
                if eq(C,A): e[0]=A
                if eq(A,B): e[1]=B
                if eq(D,C): e[2]=C
                if eq(B,D): e[3]=D
            o[2*y,2*x],o[2*y,2*x+1],o[2*y+1,2*x],o[2*y+1,2*x+1]=e
    return o
def front_imgs2(H=48):
    e=Image.open('tools/mc2/r3raw.png'); F=frames(e.crop((0,5,e.width,e.height)))
    k=H/(2*max(F[i].height for i in (0,1,2,4))); out=[]
    for i in (0,1,2,4):
        a=to_pal(F[i]); b=Image.fromarray(scale2x(a)); w,h=round(b.width*k),round(b.height*k)
        c=to_pal(b.resize((w,h),Image.NEAREST))
        for y in range(h-3,h):  # bayangan biru di bawah sepatu dibuang
            for x in range(w):
                if tuple(c[y,x,:3]) in (PAL['B'],PAL['D']): c[y,x]=0
        out.append(Image.fromarray(c).crop(Image.fromarray(c).getbbox()))
    return out
