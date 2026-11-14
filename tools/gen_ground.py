# Pola tanah dari enemy_image/lands/Verdant Forest Pixel Tileset.png → assets/img/gnd_*.png & deco_*.png. Butuh tools/L.json (dibuat gen_ground_find.py).
# Potong ulang Verdant Forest Pixel Tileset jadi petak tanah seamless + ornamen transparan.
import json, random
import numpy as np
from PIL import Image
from scipy import ndimage
SRC='/home/claude/legend-lumina/enemy_image/lands/Verdant Forest Pixel Tileset.png'
OUT='/home/claude/legend-lumina/assets/img/'
F=3.5; S=128
src=Image.open(SRC).convert('RGB')
def down(box):
    c=src.crop(box); return c.resize((round(c.width/F),round(c.height/F)),Image.BOX)
def clean(a,bad):
    rng=np.random.default_rng(3); m=ndimage.binary_dilation(bad,iterations=1); a=a.copy()
    good=a[~m]; a[m]=good[rng.integers(0,len(good),m.sum())]; return a
def clean_old(a,bad):
    a=a.copy().astype(float); m=bad.copy()
    for _ in range(200):  # isi bagian yang dibuang dari tetangga terdekat
        if not m.any(): break
        ok=~m; acc=np.zeros_like(a); cnt=np.zeros(m.shape)
        for dy,dx in [(-1,0),(1,0),(0,-1),(0,1)]:
            s=np.roll(ok,(dy,dx),(0,1)); acc+=np.roll(a,(dy,dx),(0,1))*s[...,None]; cnt+=s
        fill=m&(cnt>0); a[fill]=acc[fill]/cnt[fill][:,None]; m=m&~fill
    return a
BAY=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
def quilt(srcs,seed,P=22,N=260):
    rnd=random.Random(seed); best=np.full((S,S),-1.0); out=np.zeros((S,S,3))
    yy,xx=np.mgrid[0:P,0:P]; c=(P-1)/2; w0=1-np.maximum(abs(yy-c),abs(xx-c))/(c+1)
    pts=[(gy*16+rnd.randrange(16),gx*16+rnd.randrange(16)) for gy in range(8) for gx in range(8)]
    pts+=[(rnd.randrange(S),rnd.randrange(S)) for _ in range(N-64)]
    for (cy,cx) in pts:
        a,bm=rnd.choice(srcs); bestp=None
        for _ in range(200):
            sy=rnd.randrange(a.shape[0]-P); sx=rnd.randrange(a.shape[1]-P); r=bm[sy:sy+P,sx:sx+P].mean()
            if bestp is None or r<bestp[0]: bestp=(r,sy,sx)
        _,sy,sx=bestp; patch=a[sy:sy+P,sx:sx+P]; Y=(np.arange(P)+cy-P//2)%S; X=(np.arange(P)+cx-P//2)%S
        YY,XX=np.meshgrid(Y,X,indexing='ij'); w=w0+BAY[YY%4,XX%4]*.35+rnd.random()*.15
        upd=(w>best[YY,XX])&~bm[sy:sy+P,sx:sx+P]; best[YY[upd],XX[upd]]=w[upd]; out[YY[upd],XX[upd]]=patch[upd]
    hole=best<0
    if hole.any():
        a,bm=srcs[0]; good=a[~bm]; out[hole]=good[np.random.default_rng(1).integers(0,len(good),hole.sum())]
    print('lubang',hole.sum()); return out
def quilt_old(srcs,seed,P=16,O=8):
    rnd=random.Random(seed); n=S//P
    best=np.full((S,S),-1.0); out=np.zeros((S,S,3))
    yy,xx=np.mgrid[0:P+O,0:P+O]; ramp=np.minimum(np.minimum(xx+1,P+O-xx),np.minimum(yy+1,P+O-yy))/(O/2+1)
    ramp=np.minimum(ramp,1.0)
    for gy in range(n):
        for gx in range(n):
            a=rnd.choice(srcs); sy=rnd.randrange(a.shape[0]-P-O); sx=rnd.randrange(a.shape[1]-P-O)
            patch=a[sy:sy+P+O,sx:sx+P+O]; oy,ox=gy*P-O//2,gx*P-O//2
            for y in range(P+O):
                for x in range(P+O):
                    Y=(oy+y)%S; X=(ox+x)%S; w=ramp[y,x]+BAY[Y%4,X%4]*.9
                    if w>best[Y,X]: best[Y,X]=w; out[Y,X]=patch[y,x]
    return out
def pal(arrs,n):
    big=np.concatenate([a.reshape(-1,3) for a in arrs]).astype(np.uint8)
    q=Image.fromarray(big.reshape(1,-1,3)).quantize(n,method=Image.MEDIANCUT,dither=Image.NONE)
    return q
def topal(a,q):
    return np.array(Image.fromarray(a.clip(0,255).astype(np.uint8)).quantize(palette=q,dither=Image.NONE).convert('RGB'))
def hsv_bad(a,kind):
    r,g,b=a[...,0],a[...,1],a[...,2]; mx=a.max(2); mn=a.min(2); sat=(mx-mn)/(mx+1)
    if kind=='grass': return (sat<.28)|(r>g)|(mx>200)          # batu abu, bunga putih/kuning, tanah
    return (g>r+12)|(sat<.10)|(mx>185)                            # dirt: buang rumput & batu
# sumber tekstur (bagian dalam petak, margin 18px dari tepi)
G1=np.array(down((776+18,33+18,776+227-18,33+228-18))).astype(float)
D1=np.array(down((33+18,35+18,33+226-18,35+225-18))).astype(float)
D2=np.array(down((283+18,35+18,283+223-18,35+223-18))).astype(float)
D3=np.array(down((527+30,300+30,527+224-30,300+176-30))).astype(float)   # bercak tanah (baris 2)
def nearest(A,bm):
    _,(iy,ix)=ndimage.distance_transform_edt(bm,return_indices=True); return A[iy,ix]
def prep(A,kind,it):
    bm=ndimage.binary_dilation(hsv_bad(A,kind),iterations=it); bm[:4]=bm[-4:]=True; bm[:,:4]=bm[:,-4:]=True
    return (nearest(A,bm),bm)
g=prep(G1,'grass',3); d1=prep(D1,'dirt',2); d2=prep(D2,'dirt',2); d3=prep(D3,'dirt',2)
qg=pal([G1[~hsv_bad(G1,'grass')]],8); qd=pal([D1[~hsv_bad(D1,'dirt')],D2[~hsv_bad(D2,'dirt')]],8)
grass=topal(quilt([g],7),qg); dirt=topal(quilt([d1,d2,d3],8),qd)
Image.fromarray(grass).save(OUT+'gnd_grass.png'); Image.fromarray(dirt).save(OUT+'gnd_dirt.png')
# rumput gelap: geser tiap warna satu tingkat lebih gelap di palet yang sama
pc=np.array(qg.getpalette()[:24]).reshape(8,3); order=np.argsort(pc.sum(1)); rank={tuple(pc[o]):i for i,o in enumerate(order)}
dark=grass.copy()
for c,i in rank.items():
    m=(grass==c).all(2); dark[m]=pc[order[max(0,i-1)]]
dark=(dark*np.array([.92,.95,.92])).astype(np.uint8)
Image.fromarray(dark).save(OUT+'gnd_grass_dark.png')
# ornamen transparan
L=json.load(open(__file__.rsplit('/',1)[0]+'/L.json'))
NAMES={3:'sprout_a',4:'flower_w',5:'pebble',6:'flower_b',8:'sprout_b',9:'pebbles',10:'flower_w2',11:'flower_b2',17:'sprout_c',18:'flower_w3',19:'tuft',22:'flowers',24:'mushroom',25:'flowers_w',0:'reeds'}
bgc=np.array([30,34,42])
import os
for f in os.listdir(OUT):
    if f.startswith('deco_'): os.remove(OUT+f)
for k,nm in NAMES.items():
    y,x,w,h=L[k]; c=np.array(src.crop((x-2,y-2,x+w+2,y+h+2))).astype(int)
    al=(np.abs(c-bgc).sum(2)>40).astype(float)
    rgba=np.dstack([c,al*255]).astype(np.uint8); im=Image.fromarray(rgba,'RGBA')
    W,H=round(im.width/F),round(im.height/F)
    sm=np.array(im.resize((W,H),Image.BOX)).astype(float)
    a=sm[...,3]>140; rgb=sm[...,:3]/np.maximum(sm[...,3:4]/255,.01)
    out=np.dstack([rgb.clip(0,255),a*255]).astype(np.uint8)
    Image.fromarray(out,'RGBA').save(OUT+'deco_'+nm+'.png')
print('ok', grass.shape)
