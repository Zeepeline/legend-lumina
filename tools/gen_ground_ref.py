# Petak tanah meniru assets/reference/target_padang.png (rumput) + bunga silang 4 warna.
import random, numpy as np
from PIL import Image
from scipy import ndimage
REF='/home/claude/legend-lumina/assets/reference/target_padang.png'; OUT='/home/claude/legend-lumina/assets/img/'
S=128; F=5.2   # 1 piksel seni (±6 px) → ±1.15 px game, sama dengan skala lembar Verdant
ref=Image.open(REF).convert('RGB')
def down(b): c=ref.crop(b); return np.array(c.resize((round(c.width/F),round(c.height/F)),Image.BOX)).astype(float)
BAY=np.array([[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]])/16
def bad_grass(a):
    r,g,b=a[...,0],a[...,1],a[...,2]; mx=a.max(2); mn=a.min(2)
    return (r>g-25)|(mx>205)|((mx-mn)<35)|(b>g)
def bad_dirt(a):
    r,g,b=a[...,0],a[...,1],a[...,2]; return (g>r)|(a.max(2)>200)
G=[down(b) for b in [(470,170,670,330),(820,270,1100,420),(140,560,450,760),(690,630,930,770),(300,440,640,560)]]
D=[down(b) for b in [(950,610,1060,680),(1120,380,1240,430)]]
def flatten(a,bm,sig=6):  # buang terang-gelap skala besar, simpan detail halus (terang-gelap diatur ground.js)
    m=(~bm).astype(float); lum=a.mean(2)
    low=ndimage.gaussian_filter(lum*m,sig)/np.maximum(ndimage.gaussian_filter(m,sig),1e-3)
    mean=lum[~bm].mean(); return (a+(mean-low)[...,None]).clip(0,255)
def quilt(srcs,seed,P=18,N=320):
    rnd=random.Random(seed); best=np.full((S,S),-1.0); out=np.zeros((S,S,3))
    yy,xx=np.mgrid[0:P,0:P]; c=(P-1)/2; w0=1-np.maximum(abs(yy-c),abs(xx-c))/(c+1)
    pts=[(gy*16+rnd.randrange(16),gx*16+rnd.randrange(16)) for gy in range(8) for gx in range(8)]+[(rnd.randrange(S),rnd.randrange(S)) for _ in range(N-64)]
    for cy,cx in pts:
        a,bm=rnd.choice(srcs); bp=None
        for _ in range(200):
            sy=rnd.randrange(a.shape[0]-P); sx=rnd.randrange(a.shape[1]-P); r=bm[sy:sy+P,sx:sx+P].mean()
            if bp is None or r<bp[0]: bp=(r,sy,sx)
        _,sy,sx=bp; patch=a[sy:sy+P,sx:sx+P]; Y=(np.arange(P)+cy-P//2)%S; X=(np.arange(P)+cx-P//2)%S
        YY,XX=np.meshgrid(Y,X,indexing='ij'); w=w0+BAY[YY%4,XX%4]*.35+rnd.random()*.15
        upd=(w>best[YY,XX])&~bm[sy:sy+P,sx:sx+P]; best[YY[upd],XX[upd]]=w[upd]; out[YY[upd],XX[upd]]=patch[upd]
    hole=best<0
    if hole.any():
        a,bm=srcs[0]; good=a[~bm]; out[hole]=good[np.random.default_rng(1).integers(0,len(good),hole.sum())]
    return out
def quant(a,n,pool):
    q=Image.fromarray(pool.astype(np.uint8).reshape(1,-1,3)).quantize(n,method=Image.MEDIANCUT,dither=Image.NONE)
    return np.array(Image.fromarray(a.clip(0,255).astype(np.uint8)).quantize(palette=q,dither=Image.NONE).convert('RGB')),q
gs=[]
for a in G:
    bm=ndimage.binary_dilation(bad_grass(a),iterations=1); bm[:2]=bm[-2:]=True; bm[:,:2]=bm[:,-2:]=True; gs.append((flatten(a,bm),bm))
ds=[]
for a in D:
    bm=ndimage.binary_dilation(bad_dirt(a),iterations=1); ds.append((a,bm))
mid,qg=quant(quilt(gs,3),7,np.concatenate([a[~b] for a,b in gs]))
dirt,_=quant(quilt(ds,4,P=8,N=700),6,np.concatenate([a[~b] for a,b in ds]))
def shift(img,k,tint):
    pc=np.array(qg.getpalette()[:21]).reshape(7,3); order=list(np.argsort(pc.sum(1))); out=img.astype(float).copy()
    for i,o in enumerate(order):
        m=(img==pc[o]).all(2); out[m]=pc[order[max(0,min(6,i+k))]]
    return (out*np.array(tint)).clip(0,255).astype(np.uint8)
Image.fromarray(mid).save(OUT+'gnd_grass.png')
Image.fromarray(shift(mid,1,[1.07,1.06,0.96])).save(OUT+'gnd_grass_light.png')
Image.fromarray(shift(mid,-1,[0.86,0.9,0.92])).save(OUT+'gnd_grass_dark.png')
Image.fromarray(dirt).save(OUT+'gnd_dirt.png')
# bunga silang kecil (seperti contoh): 1–3 bunga per gambar 9x9
COL={'w':((246,242,226),(236,200,90)),'p':((236,150,176),(250,226,150)),'y':((244,206,84),(250,244,210)),'v':((172,146,222),(250,236,170))}
STEM=(58,120,52)
for nm,(pet,cen) in COL.items():
    for v,pos in enumerate([[(4,4)],[(2,3),(6,6)],[(2,2),(6,3),(4,6)]]):
        im=Image.new('RGBA',(9,10),(0,0,0,0)); p=im.load()
        for (x,y) in pos:
            for dx,dy in [(0,-1),(-1,0),(1,0),(0,1)]: p[x+dx,y+dy]=pet+(255,)
            p[x,y]=cen+(255,); p[x,y+2]=STEM+(255,)
        im.save(OUT+f'deco_fl_{nm}{v+1}.png')
print('ok')
