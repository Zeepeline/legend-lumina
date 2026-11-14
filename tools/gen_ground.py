# Pembuat pola tanah rapi (seamless). Jalankan: python3 tools/gen_ground.py  → assets/img/gnd_*.png & deco_*.png
# Pola tanah rapi: petak seamless 128px (rumput, tanah, rumput-tua) + ornamen terpisah.
import random, math
from PIL import Image
R='/home/claude/legend-lumina/assets/img/'
def pal(f,box,n):
    im=Image.open(R+f).convert('RGB').crop(box).quantize(n,method=Image.MEDIANCUT)
    p=im.getpalette()[:n*3]; cs=[tuple(p[i:i+3]) for i in range(0,n*3,3)]
    return sorted(cs,key=lambda c:sum(c))
G=pal('gpt_tile_verdant_grass.png',(10,10,56,56),7)
D=pal('gpt_tile_verdant_dirt.png',(14,14,52,52),7)
print('grass',G);print('dirt',D)
S=128
def tnoise(seed,cell):
    rnd=random.Random(seed); n=S//cell
    g=[[rnd.random() for _ in range(n)] for _ in range(n)]
    def f(x,y):
        gx,gy=x/cell,y/cell; x0,y0=int(gx)%n,int(gy)%n; x1,y1=(x0+1)%n,(y0+1)%n
        tx,ty=gx-int(gx),gy-int(gy); tx=tx*tx*(3-2*tx); ty=ty*ty*(3-2*ty)
        a=g[y0][x0]*(1-tx)+g[y0][x1]*tx; b=g[y1][x0]*(1-tx)+g[y1][x1]*tx
        return a*(1-ty)+b*ty
    return f
BAYER=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
def tile(cols,seed,mid,blades):
    a,b,c=tnoise(seed,32),tnoise(seed+1,16),tnoise(seed+2,8)
    im=Image.new('RGB',(S,S)); px=im.load(); lo,hi=mid
    for y in range(S):
        for x in range(S):
            v=a(x,y)*.55+b(x,y)*.3+c(x,y)*.15+(BAYER[y%4][x%4]/16-.5)*.06
            i=int(lo+(v-.2)/.6*(hi-lo+1)); i=max(lo,min(hi,i)); px[x,y]=cols[i]
    rnd=random.Random(seed+9)
    for _ in range(blades):  # helai rumput / butir tanah kecil, wrap-around
        x,y=rnd.randrange(S),rnd.randrange(S); h=rnd.choice([2,3,3,4])
        dk=cols[max(0,lo-1)]; lt=cols[min(len(cols)-1,hi+1)]
        for k in range(h): px[x%S,(y-k)%S]=lt if k==h-1 else px[x%S,(y-k)%S]
        px[(x+1)%S,y%S]=dk
    return im
tile(G,11,(2,4),260).save(R+'gnd_grass.png')
tile(G,21,(1,3),220).save(R+'gnd_grass_dark.png')
tile(D,31,(2,4),180).save(R+'gnd_dirt.png')
# ornamen 16x16 transparan
def deco(name,pts):
    im=Image.new('RGBA',(16,16),(0,0,0,0)); p=im.load()
    for (x,y,c) in pts: p[x,y]=c+(255,)
    im.save(R+'deco_'+name+'.png')
W=(236,232,214);Y=(240,200,70);P=(200,120,170);GD=G[1];GL=G[5];GM=G[3]
def flower(c):
    pts=[]
    for cx,cy in [(5,6),(10,9)]:
        pts+= [(cx,cy-1,c),(cx-1,cy,c),(cx+1,cy,c),(cx,cy+1,c),(cx,cy,Y if c!=Y else (250,240,200))]
        pts+= [(cx,cy+2,GD),(cx,cy+3,GD)]
    return pts
deco('flower_w',flower(W)); deco('flower_y',flower(Y)); deco('flower_p',flower(P))
deco('tuft',[(x,y,GL if y<9 else GM) for x,ys in [(5,range(7,12)),(7,range(5,12)),(9,range(6,12)),(11,range(8,12)),(6,range(9,12)),(8,range(8,12)),(10,range(9,12))] for y in ys]+[(x,12,GD) for x in range(5,12)])
RK=[(92,96,100),(124,128,128),(158,160,156),(60,62,66)]
def pebble(cx,cy,r):
    pts=[]
    for y in range(-r,r+1):
        for x in range(-r-1,r+2):
            if (x/(r+1))**2+(y/r)**2<=1:
                c=RK[2] if (x<0 and y<0) else RK[1] if y<1 else RK[0]
                pts.append((cx+x,cy+y,c))
    pts+=[(cx+x,cy+r+1,RK[3]) for x in range(-r,r+1)]
    return pts
deco('pebble',pebble(8,8,2)); deco('pebbles',pebble(5,7,2)+pebble(11,10,1))
deco('clover',[(x,y,GL) for x,y in [(6,7),(7,6),(8,7),(7,8),(10,10),(11,9),(12,10),(11,11)]]+[(7,9,GD),(11,12,GD)])
