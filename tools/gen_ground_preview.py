import random, math
from PIL import Image
R='/home/claude/legend-lumina/assets/img/'
g=Image.open(R+'gnd_grass.png').convert('RGB'); gd=Image.open(R+'gnd_grass_dark.png').convert('RGB'); d=Image.open(R+'gnd_dirt.png').convert('RGB')
W,H=448,320
def vn(seed,cell):
    rnd=random.Random(seed); cache={}
    def h(i,j):
        if (i,j) not in cache: cache[(i,j)]=random.Random(seed*7919+i*131+j*977).random()
        return cache[(i,j)]
    def f(x,y):
        gx,gy=x/cell,y/cell; i,j=math.floor(gx),math.floor(gy); tx,ty=gx-i,gy-j
        tx=tx*tx*(3-2*tx); ty=ty*ty*(3-2*ty)
        return (h(i,j)*(1-tx)+h(i+1,j)*tx)*(1-ty)+(h(i,j+1)*(1-tx)+h(i+1,j+1)*tx)*ty
    return f
n1,n2,n3=vn(1,48),vn(2,14),vn(3,64)
B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
out=Image.new('RGB',(W,H)); P=out.load(); G=g.load(); GD=gd.load(); D=d.load()
for y in range(H):
    for x in range(W):
        t=B[y%4][x%4]/16
        dirt=n1(x,y)*.7+n2(x,y)*.3
        path=1-min(1,abs(y-(160+30*math.sin(x/70)))/26)   # jalan setapak
        dirt=max(dirt-.1,path*1.1)
        dark=n3(x,y)
        c=G[x%128,y%128]
        if dark>.62+ (t-.5)*.08: c=GD[x%128,y%128]
        if dirt>.62+(t-.5)*.10: c=D[x%128,y%128]   # tepi dithering 4x4: rapi, tidak buram
        P[x,y]=c
out=out.convert('RGBA')
decos={k:Image.open(R+'deco_'+k+'.png') for k in ['flower_w','flower_y','flower_p','tuft','pebble','pebbles','clover']}
rnd=random.Random(5)
for cy in range(0,H,32):
    for cx in range(0,W,32):
        x,y=cx+rnd.randrange(4,20),cy+rnd.randrange(4,20)
        onDirt=(n1(x+8,y+8)*.7+n2(x+8,y+8)*.3-.1)>.6 or abs(y+8-(160+30*math.sin((x+8)/70)))<26
        r=rnd.random()
        if onDirt: k='pebble' if r<.25 else 'pebbles' if r<.35 else None
        else: k='tuft' if r<.28 else 'clover' if r<.4 else 'flower_w' if r<.46 else 'flower_y' if r<.5 else 'flower_p' if r<.53 else 'pebble' if r<.57 else None
        if k: out.alpha_composite(decos[k],(x,y))
out.resize((W*2,H*2),Image.NEAREST).save('/tmp/gnd/preview.png')
# cek seam: 2x2 tiling tiap petak
s=Image.new('RGB',(256*3+16,256),'white')
for n,t in enumerate([g,gd,d]):
    q=Image.new('RGB',(256,256))
    for a in range(2):
        for b in range(2): q.paste(t,(a*128,b*128))
    s.paste(q,(n*264,0))
s.save('/tmp/gnd/seams.png')
