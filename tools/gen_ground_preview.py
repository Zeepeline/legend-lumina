# Pratinjau hasil akhir meniru target_padang.png: 3 nada rumput, bercak tanah, ornamen, objek Verdant.
import random, math
from PIL import Image
I='/home/claude/legend-lumina/assets/img/'
def L(k): return Image.open(I+k+'.png')
g,gl,gd,d=[L(k).convert('RGB').load() for k in ['gnd_grass','gnd_grass_light','gnd_grass_dark','gnd_dirt']]
W,H=400,267
def vn(seed,cell):
    def h(i,j): return random.Random(seed*7919+i*131+j*977).random()
    cache={}
    def f(x,y):
        gx,gy=x/cell,y/cell; i,j=math.floor(gx),math.floor(gy); tx,ty=gx-i,gy-j; tx=tx*tx*(3-2*tx); ty=ty*ty*(3-2*ty)
        k=(i,j)
        if k not in cache: cache[k]=(h(i,j),h(i+1,j),h(i,j+1),h(i+1,j+1))
        a,b,c,e=cache[k]; return (a*(1-tx)+b*tx)*(1-ty)+(c*(1-tx)+e*tx)*ty
    return f
light=vn(1,56); light2=vn(2,20); dirtn=vn(3,30); dirt2=vn(4,9)
B=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]]
out=Image.new('RGB',(W,H)); P=out.load()
def isdirt(x,y,t=0): return dirtn(x,y)*.75+dirt2(x,y)*.25 > .74+t
for y in range(H):
    for x in range(W):
        t=B[y%4][x%4]/16-.5
        v=light(x,y)*.75+light2(x,y)*.25
        c=g[x%128,y%128]
        if v>.60+t*.10: c=gl[x%128,y%128]
        elif v<.40+t*.10: c=gd[x%128,y%128]
        if isdirt(x,y,t*.05): c=d[x%128,y%128]
        P[x,y]=c
out=out.convert('RGBA')
rnd=random.Random(9)
occupied=[]
def put(k,x,y,anchor=True):
    im=L(k); out.alpha_composite(im,(int(x-im.width/2),int(y-im.height)) if anchor else (int(x),int(y)))
# ornamen tanah: grid 24 px, geser acak
deco=[]
for cy in range(0,H,22):
    for cx in range(0,W,22):
        x,y=cx+rnd.randrange(0,16),cy+rnd.randrange(0,16); r=rnd.random()
        if isdirt(x+4,y+4): k='deco_pebble' if r<.12 else None
        else:
            k=('deco_tuft' if r<.16 else 'deco_sprout_c' if r<.24 else 'deco_sprout_a' if r<.28 else
               'deco_fl_w%d'%rnd.randint(1,3) if r<.40 else 'deco_fl_p%d'%rnd.randint(1,3) if r<.47 else
               'deco_fl_y%d'%rnd.randint(1,3) if r<.51 else 'deco_fl_v%d'%rnd.randint(1,2) if r<.54 else None)
        if k: deco.append((y,k,x))
for y,k,x in sorted(deco): put(k,x,y,anchor=False)
# objek: batu & semak dengan rumput di kaki, pohon membingkai tepi
objs=[]
for (x,y,k) in [(190,110,'gpt_verdant_rock_large'),(95,175,'gpt_verdant_rock_large'),(295,170,'gpt_verdant_rock_med'),(345,140,'gpt_rock'),
                (285,128,'gpt_verdant_bush'),(150,95,'gpt_verdant_bush_small'),(300,90,'gpt_verdant_bush_small'),(355,190,'gpt_verdant_bush'),
                (230,250,'gpt_verdant_bush'),(240,62,'gpt_verdant_stump')]:
    objs.append((y,k,x,True))
for (x,y) in [(45,60),(10,140),(70,110),(170,40),(250,25),(340,10),(390,60),(30,250),(120,265),(205,275),(300,270),(380,240),(395,150),(-5,40),(110,20)]:
    objs.append((y,'gpt_verdant_tree',x,True))
for y,k,x,_ in sorted(objs):
    if 'tree' not in k:   # kaki objek: 3–5 rumput tegak
        for n in range(rnd.randint(3,5)):
            put('deco_tuft',x+rnd.randint(-L(k).width//2,L(k).width//2),y+rnd.randint(-3,2))
    put(k,x,y)
out.resize((W*3,H*3),Image.NEAREST).save('/home/claude/legend-lumina/assets/reference/pola_tanah_preview.png')
print('ok')
