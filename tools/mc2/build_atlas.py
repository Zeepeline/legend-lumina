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
    xx=min(max(round(FW/2-fx)+dx,0),FW-im.width)   # bilah/smear yang melewati tepi sel: geser seperlunya (maks 1–2 px)
    c.alpha_composite(im,(xx, FH-im.height+dy)); return c
from backwalk import backwalk, back_stand
from cleanup import clean
S=[clean(f) for f in frames(Image.open('tools/mc2/native12.png'))]; U0=clean(back_stand()); U=[clean(f) for f in backwalk()]
from front import front_base, front_walk
from front_img import front_imgs2, front_walk8
from legs_front import walk8 as fwalk8, compose as fcompose, STAND
FI=[clean(f) for f in front_imgs2()]; D0=fcompose(FI[0],STAND,STAND); Dw=fwalk8(FI[0],FI[2]); FI=FI+[D0]+Dw
FIX={id(f):12.5 for f in U}; FIX[id(U0)]=12.5
for f in FI: m=np.asarray(f)[:f.height*2//5,:,3]>0; FIX[id(f)]=float((m.sum(0)*np.arange(f.width)).sum()/m.sum())
D=None  # belum ada gambar depan: pakai samping
from idle import idle4, blink4
def idlecells(im, blink=False):
    fs=(blink4 if blink else idle4)(im, im.height-10)
    for f in fs:
        if id(im) in FIX: FIX[id(f)]=FIX[id(im)]
    return [cell(f) for f in fs]
HAIR=[(166,171,64),(120,139,79)]
def hairc(im):
    a=np.asarray(im); m=np.zeros(a.shape[:2],bool)
    for c in HAIR: m|=(a[...,:3]==c).all(-1)&(a[...,3]>0)
    return float((m.sum(0)*np.arange(a.shape[1])).sum()/m.sum())
def feetc(im):
    a=np.asarray(im)[...,3]>0; xs=np.nonzero(a[-4:].any(0))[0]; return (xs.min()+xs.max())/2
SL=[clean(f,keep={(216,222,223),(173,180,191)}) for f in frames(Image.open('tools/mc2/slash_side.png'))]   # tebasan samping (pedang digambar)
_o=hairc(S[2])-feetc(S[2])
for f in SL: FIX[id(f)]=hairc(f)-_o
KEEP={(216,222,223),(173,180,191)}
SLD=[clean(f,keep=KEEP) for f in frames(Image.open('tools/mc2/slash_down.png'))]   # tebasan bawah (gambar pemilik, diperkecil ke tinggi normal)
SLU=[clean(f,keep=KEEP) for f in frames(Image.open('tools/mc2/slash_up.png'))]     # tebasan atas
for fs,idl in ((SLD,D0),(SLU,U0)):
    o=hairc(idl)-FIX.get(id(idl),feetc(idl))
    for f in fs: FIX[id(f)]=hairc(f)-o
from idle import hair as _hair
def sway(fs, dxs):
    """Jumbai rambut ikut terayun saat menebas (gerakan ikutan ala Dimraeth): frame i digeser dxs[i] px."""
    out=[]
    for f,dx in zip(fs,dxs):
        g=Image.fromarray(_hair(np.array(f),4,dx)) if dx else f
        if id(f) in FIX: FIX[id(g)]=FIX[id(f)]
        out.append(g)
    return out
SL=sway(SL,[0,-1,-1,0]); SLD=sway(SLD,[0,1,-1,0]); SLU=sway(SLU,[0,-1,1,0])
def crouch(im, n):
    """Jongkok: n baris betis dibuang (badan turun n px, kaki tetap di tanah) — untuk pose mengisi tenaga."""
    a=np.array(im); H=a.shape[0]; y=H-9
    b=np.concatenate([np.zeros((n,)+a.shape[1:],a.dtype),a[:y],a[y+n:]])
    g=Image.fromarray(b)
    if id(im) in FIX: FIX[id(g)]=FIX[id(im)]
    return g
def def_heavy(fs):   # isi tenaga (jongkok 1 & 2 px, ancang-ancang) → tebas (smear) → lanjutan
    return [cell(crouch(fs[0],1)),cell(crouch(fs[0],2)),cell(fs[1]),cell(fs[2])]
def pose(d):
    src=U if d=='up' else Dw if d=='down' else S; idle=U0 if d=='up' else D0 if d=='down' else src[2]
    walk=[cell(src[i]) for i in (0,2,4,6)]
    if d in ('up','down'):
        sg=-1 if d=='up' else 1
        SLx=SLU if d=='up' else SLD
        atk=[cell(f) for f in SLx]
        heavy=def_heavy(SLx)
    else:
        atk=[cell(f,dx=-1) for f in SL]   # sel 64 px: pedang/smear muat persis
        heavy=def_heavy(SL)
    return dict(idle=idlecells(idle), walk=walk, atk=atk, heavy=heavy, roll=[cell(idle,rot=r) for r in (0,-90,-180,-270)], still=[cell(idle)]*4)
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
sheet=Image.new('RGBA',(4*FW,47*FH),(0,0,0,0))
for r,k in enumerate(ROWS):
    for i,c in enumerate(rowimgs(k)): sheet.alpha_composite(c,(i*FW,r*FH))
for i in range(8): sheet.alpha_composite(cell(S[i]),((i%4)*FW,(39+i//4)*FH))   # 39–40 jalan 8 frame samping
for i in range(8): sheet.alpha_composite(cell(U[i]),((i%4)*FW,(41+i//4)*FH))   # 41–42 jalan 8 frame atas
for i in range(8): sheet.alpha_composite(cell(Dw[i]),((i%4)*FW,(43+i//4)*FH))   # 43–44 jalan 8 frame bawah
for i,c in enumerate(idlecells(D0,True)): sheet.alpha_composite(c,(i*FW,45*FH))     # 45 kedip, diam bawah
for i,c in enumerate(idlecells(S[2],True)): sheet.alpha_composite(c,(i*FW,46*FH))   # 46 kedip, diam samping
sheet.save('assets/img/hero/hero_mc2.png'); print(sheet.size)
