"""Lembar NPC prajurit Garnisun (gk2, gk5, gk6, gk7) dari gambar pemilik: 8 frame 3/4 menghadap kanan (z0 = diam, z1–z7 = jalan),
sudah diratakan ke 11 warna, tombak disalin ke semua frame, tinggi total 48 px (tombak). Pose lain = geser piksel dari pose diam.
Jalankan dari akar repo: python3 tools/npc_soldier/build.py"""
import sys; sys.path.insert(0,'tools/mc2')
import numpy as np; from PIL import Image
from idle import breathe
D='tools/npc_soldier/'; F=48
from sklearn.cluster import KMeans
def skin(f): return (f[...,0].astype(int)>170)&(f[...,1].astype(int)>110)&(f[...,2].astype(int)<160)&(f[...,3]>0)
R=[np.array(Image.open(f'{D}raw/f{i}.png').convert('RGBA')) for i in range(8)]   # 8 frame asli (sudah lepas dari grid gambar pemilik)
# tombak dari gambar 1: kolom 1–5; baris yang tertutup tangan diganti baris batang di atasnya
SP=R[0][:,1:6].copy(); sk=skin(R[0])[:,1:6]
for y in range(SP.shape[0]):
    if sk[y].any(): SP[y]=SP[y-1]
SPC=2   # kolom tengah batang di SP
def add_spear(f):
    """Tombak dipegang tangan kiri (kiri gambar) bila terlihat; kalau tangan tertutup badan, batang di belakang tepi badan."""
    m=f[...,3]>0; sk=skin(f); ys,xs=np.nonzero(sk[30:50]); left=xs[xs<8]
    pad=4; g=np.zeros((f.shape[0],f.shape[1]+pad,4),np.uint8); g[:,pad:]=f
    if len(left): hx=int(round(left.mean()))+pad
    else: hx=int(np.nonzero(m.sum(0)>=10)[0][0])+pad+2
    x0=hx-SPC; sub=g[:,x0:x0+SP.shape[1]]
    sub[:]=np.where(sub[...,3:]>0, sub, SP)   # di belakang tangan & badan
    return g
S=[R[i] if i in (0,2,6) else add_spear(R[i]) for i in range(8)]
px=np.concatenate([s[s[...,3]>0][:,:3] for s in S]).astype(float)
CC=KMeans(11,n_init=5,random_state=0).fit(px).cluster_centers_
tops=[np.nonzero((s[...,3]>0).any(1))[0][0] for s in S]; k=F/(S[0].shape[0]-min(tops))
def eyes(a):
    """Jumlah piksel gelap kecil yang diapit kulit (mata) di sepertiga atas sprite."""
    t=a[:a.shape[0]//2].astype(int); sk=(t[...,0]>170)&(t[...,1]>110)&(t[...,2]<160)&(t[...,3]>0)
    dk=(t[...,:3].sum(-1)<200)&(t[...,3]>0); n=0
    for y,x in zip(*np.nonzero(dk)):
        if 0<x<t.shape[1]-1 and sk[y,x-1] and sk[y,x+1]: n+=1
    return n
def shrink(im,k):
    """Perkecil nearest (tanpa mixel). Fase sampel dipilih yang paling banyak mempertahankan piksel mata."""
    best=None
    for ox in range(7):
        for oy in range(7):
            W,H=round(im.width*k),round(im.height*k); a=np.array(im)
            xs=np.minimum(((np.arange(W)+ox/7)/k).astype(int),im.width-1); ys=np.minimum(((np.arange(H)+oy/7)/k).astype(int),im.height-1)
            b=a[ys][:,xs]; sc=eyes(b)
            if best is None or sc>best[0]: best=(sc,b)
    return Image.fromarray(best[1])
Z=[]
for s in S:
    m=s[...,3]>0; d=((s[...,None,:3].astype(float)-CC[None,None])**2).sum(-1); a=s.copy(); a[m,:3]=CC[d.argmin(-1)[m]].astype(np.uint8)
    im=Image.fromarray(a); im=im.crop(im.getbbox())
    Z.append(np.array(shrink(im,k)))
def helmc(a):
    """Pusat helm (abu-abu, bagian atas sprite) — acuan posisi agar badan tidak bergeser antar-frame."""
    t=a[:a.shape[0]*2//5].astype(int); r,g,b=t[...,0],t[...,1],t[...,2]
    m=(t[...,3]>0)&(abs(r-g)<16)&(abs(g-b)<16)&(r>90)
    xs=np.nonzero(m)[1]; return float(xs.mean())
def cell(a):
    c=np.zeros((F,F,4),np.uint8); h,w=a.shape[:2]; x=int(round(F/2-helmc(a))); x=min(max(x,0),F-w)
    c[F-h:,x:x+w]=a; return c
def lean(a, dx, waist=None, sx=8):
    """Badan atas (di atas pinggang, kanan tombak) condong dx px; kaki & tombak tetap."""
    waist=waist or a.shape[0]-14; b=np.zeros((a.shape[0],a.shape[1]+2,4),np.uint8); b[:,1:-1]=a
    up=b[:waist,sx:].copy(); b[:waist,sx:]=0
    if dx>0: b[:waist,sx+dx:]=up[:,:up.shape[1]-dx]
    else: b[:waist,sx:b.shape[1]+dx]=up[:,-dx:]
    return b
def crouch(a,n):
    H=a.shape[0]; y=H-9; return np.concatenate([np.zeros((n,)+a.shape[1:],a.dtype),a[:y],a[y+n:]])
def eye_px(a):
    t=a[:a.shape[0]//2].astype(int); sk=(t[...,0]>170)&(t[...,1]>110)&(t[...,2]<160)&(t[...,3]>0)
    dk=(t[...,:3].sum(-1)<200)&(t[...,3]>0)
    return sk,[(y,x) for y,x in zip(*np.nonzero(dk)) if 0<x<t.shape[1]-1 and y+1<t.shape[0] and (sk[y,x-1] or sk[y,x+1]) and sk[y+1,x]]
def fix_eyes(a, ref):
    """Mata yang hilang/pudar di gambar asli disalin dari pose diam, sejajar tepi kanan & atas kulit wajah."""
    sk,e=eye_px(a)
    if len(e)>=2:   # mata menempel poni → turunkan 1 px agar terbaca (seperti pose diam)
        b=a.copy(); dk=lambda p:int(p[0])+int(p[1])+int(p[2])<200 and p[3]>0
        for y,x in e:
            if dk(a[y-1,x]) and y+1<a.shape[0] and sk[y+1,x]: b[y+1,x]=a[y,x]; b[y,x]=a[y+1,x]
        return b
    rsk,re_=eye_px(ref); ry,rx=np.nonzero(rsk); ys,xs=np.nonzero(sk)
    b=a.copy()
    for y,x in re_:
        ny,nx=ys.min()+(y-ry.min()), xs.max()-(rx.max()-x)
        if 0<=ny<b.shape[0] and 0<=nx<b.shape[1] and sk[ny,nx]: b[ny,nx]=ref[y,x]
    return b
Z=[Z[0]]+[fix_eyes(z,Z[0]) for z in Z[1:]]
idle=Z[0]; W=[Z[i] for i in (1,2,4,6)]
nod=breathe(idle,20)   # kepala & bahu turun 1 px
rows=[
  [cell(a) for a in W], [cell(a) for a in W], [cell(a) for a in W],                     # jalan bawah/atas/samping (gambar 3/4 yang sama)
  [cell(idle),cell(breathe(idle,idle.shape[0]-12))]*3,                                    # diam + napas (bawah, samping, atas)
  [cell(idle),cell(nod),cell(idle),cell(nod)],                                            # bicara
  [cell(idle),cell(crouch(idle,1)),cell(crouch(idle,2)),cell(crouch(idle,1))],            # train
  [cell(idle),cell(nod),cell(nod),cell(idle)],                                            # salute
  [cell(idle),cell(lean(idle,1)),cell(lean(idle,2)),cell(lean(idle,1))],                  # spar_attack
  [cell(idle),cell(lean(idle,-1)),cell(lean(idle,-1)),cell(idle)],                        # spar_block
]
sheet=np.zeros((F*len(rows),F*8,4),np.uint8)
for r,row in enumerate(rows):
    for c,im in enumerate(row): sheet[r*F:(r+1)*F,c*F:(c+1)*F]=im
from cleanup import clean_any
for r in range(len(rows)):   # bersih-bersih per sel: mixel/bintik, yatim, garis tepi, ≤16 warna
    for c in range(8):
        cel=sheet[r*F:(r+1)*F,c*F:(c+1)*F]
        if cel[...,3].any(): sheet[r*F:(r+1)*F,c*F:(c+1)*F]=np.array(clean_any(Image.fromarray(cel)))
for nid in ('gk2','gk5','gk6','gk7'): Image.fromarray(sheet).save(f'assets/img/npc/npc_sheet_{nid}.png')
print('warna',len({tuple(p) for p in sheet[sheet[...,3]>0][:,:3]}), sheet.shape)
