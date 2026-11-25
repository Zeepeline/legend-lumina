"""Lembar NPC prajurit Garnisun (gk2, gk5, gk6, gk7) dari gambar pemilik: 8 frame 3/4 menghadap kanan (z0 = diam, z1–z7 = jalan),
sudah diratakan ke 11 warna, tombak disalin ke semua frame, tinggi total 48 px (tombak). Pose lain = geser piksel dari pose diam.
Jalankan dari akar repo: python3 tools/npc_soldier/build.py"""
import sys; sys.path.insert(0,'tools/mc2')
import numpy as np; from PIL import Image
from idle import breathe
D='tools/npc_soldier/'; F=48
Z=[np.array(Image.open(f'{D}z{i}.png').convert('RGBA')) for i in range(8)]
HELM=[(119,115,113),(168,159,152)]
def helmc(a):
    m=np.zeros(a.shape[:2],bool)
    for c in HELM: m|=(a[...,:3]==c).all(-1)&(a[...,3]>0)
    return float((m.sum(0)*np.arange(a.shape[1])).sum()/m.sum())
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
