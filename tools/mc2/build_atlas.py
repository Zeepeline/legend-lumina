import sys; sys.path.insert(0,'tools/mc2')
from pipe import frames
from PIL import Image
import numpy as np
FW,FH=64,56
FIX={}
def cell(im, dx=0, dy=0, rot=0):
    c=Image.new('RGBA',(FW,FH),(0,0,0,0))
    a=np.asarray(im)[...,3]>0; xs=np.nonzero(a[-4:].any(0))[0]; fx=(xs.min()+xs.max())/2
    if id(im) in FIX: fx=FIX[id(im)]
    if rot:
        big=Image.new('RGBA',(FW*2,FH*2),(0,0,0,0)); big.alpha_composite(im,(round(FW-fx),FH*2-im.height-2))
        big=big.rotate(rot,resample=Image.NEAREST,center=(FW,FH*2-4)); part=big.crop(big.getbbox())
        c.alpha_composite(part,(max(0,(FW-part.width)//2+dx),max(0,FH-part.height+dy))); return c
    c.alpha_composite(im,(round(FW/2-fx)+dx, FH-im.height+dy)); return c
from backwalk import backwalk
S=frames(Image.open('tools/mc2/native12.png')); U0=frames(Image.open('tools/mc2/up12.png'))[0]; U=backwalk()
from front import front_base, front_walk
from front_img import front_imgs2
FI=front_imgs2(); D0=FI[0]; Dw=[FI[i] for i in (1,1,2,2,3,3,2,2)]
FIX={id(f):12.5 for f in U}; FIX[id(U0)]=12.5
for f in FI: m=np.asarray(f)[:f.height*2//5,:,3]>0; FIX[id(f)]=float((m.sum(0)*np.arange(f.width)).sum()/m.sum())
D=None  # belum ada gambar depan: pakai samping
def pose(d):
    src=U if d=='up' else Dw if d=='down' else S; idle=U0 if d=='up' else D0 if d=='down' else src[2]
    walk=[cell(src[i]) for i in (0,2,4,6)]
    if d in ('up','down'):
        sg=-1 if d=='up' else 1
        atk=[cell(idle,dy=-sg),cell(src[2],dy=sg),cell(src[6],dy=3*sg),cell(idle)]
        heavy=[cell(idle,dy=-2*sg),cell(src[2],dy=2*sg),cell(src[6],dy=4*sg),cell(idle)]
    else:
        atk=[cell(idle,dx=-1),cell(src[3],dx=2),cell(src[4],dx=4),cell(idle)]
        heavy=[cell(idle,dx=-3),cell(src[3],dx=3),cell(src[4],dx=6),cell(idle,dx=1)]
    return dict(idle=[cell(idle)]*4, walk=walk, atk=atk, heavy=heavy, roll=[cell(idle,rot=r) for r in (0,-90,-180,-270)], still=[cell(idle)]*4)
P={d:pose(d) for d in ('down','up','side')}
I=S[2]
hurt=[cell(I,dx=-1),cell(I,dx=-3),cell(I,dx=-3),cell(I,dx=-1)]
die=[cell(I),cell(I,rot=-30),cell(I,rot=-60),cell(I,rot=-90)]; rise=list(reversed(die)); sleep=[cell(I,rot=-90)]*4
ROWS=['idle_down','walk_down','idle_up','walk_up','idle_side','walk_side_a','walk_side','atk1_down','atk2_down','atk1_up','atk2_up','atk1_side','atk2_side',
 'atk3_down','atk3_up','atk3_side','heavy_down','heavy_up','heavy_side','roll_down','roll_up','roll_side','hurt','die','rise','cast_down','cast_up','cast_side',
 'bow_down','bow_side_a','bow_side','bow_up','fish_cast','fish_pull','pick','hoe','cheer','cheer_b','sleep']
def rowimgs(k):
    if k=='walk_side_a': return [cell(S[i]) for i in (1,3,5,7)]
    if k=='bow_side_a': return P['side']['still']
    d=k.rsplit('_',1)[-1]
    if d in P:
        kind=k.split('_')[0]; kind={'atk1':'atk','atk2':'atk','atk3':'atk','cast':'still','bow':'still'}.get(kind,kind)
        return P[d][kind]
    return {'hurt':hurt,'die':die,'rise':rise,'sleep':sleep}.get(k,P['side']['still'])
sheet=Image.new('RGBA',(4*FW,45*FH),(0,0,0,0))
for r,k in enumerate(ROWS):
    for i,c in enumerate(rowimgs(k)): sheet.alpha_composite(c,(i*FW,r*FH))
for i in range(8): sheet.alpha_composite(cell(S[i]),((i%4)*FW,(39+i//4)*FH))   # 39–40 jalan 8 frame samping
for i in range(8): sheet.alpha_composite(cell(U[i]),((i%4)*FW,(41+i//4)*FH))   # 41–42 jalan 8 frame atas
for i in range(8): sheet.alpha_composite(cell(Dw[i]),((i%4)*FW,(43+i//4)*FH))   # 43–44 jalan 8 frame bawah
sheet.save('assets/img/hero/hero_mc2.png'); print(sheet.size)
