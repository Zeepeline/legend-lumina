import numpy as np
from PIL import Image
from collections import deque
from scipy import ndimage
def extract(s, ox=2.0, oy=3.0, path='tools/mc2/s.jpg'):
    a=np.asarray(Image.open(path).convert('RGB')).astype(int); H,W,_=a.shape
    xs=np.arange(ox+s/2,W-2,s); ys=np.arange(oy+s/2,H-2,s)
    r=max(1,int(s/3))
    t=np.zeros((len(ys),len(xs),3),int)
    for j,y in enumerate(ys):
        for i,x in enumerate(xs): t[j,i]=np.median(a[int(y)-r:int(y)+r+1,int(x)-r:int(x)+r+1].reshape(-1,3),0)
    H,W,_=t.shape; bgc=np.array([100,161,188])
    grassy=[(np.abs(t[y]-[171,172,55]).sum(-1)<60).mean() for y in range(H)]
    gy=min(y for y in range(H) if grassy[y]>.5); t=t[:gy]; H=gy
    near=np.abs(t-bgc).sum(-1)<55
    bg=np.zeros((H,W),bool); q=deque([(0,x) for x in range(W)]+[(H-1,x) for x in range(W)]+[(y,0) for y in range(H)]+[(y,W-1) for y in range(H)])
    while q:
        y,x=q.popleft()
        if y<0 or x<0 or y>=H or x>=W or bg[y,x] or not near[y,x]: continue
        bg[y,x]=True; q.extend(((y+1,x),(y-1,x),(y,x+1),(y,x-1)))
    for _ in range(2):
        up=np.vstack([np.ones((1,W),bool),bg[:-1]]); dn=np.vstack([bg[1:],np.ones((1,W),bool)]); bg|=(~bg)&up&dn
    nb=ndimage.binary_dilation(bg)&~bg; bg|=nb&(np.abs(t-bgc).sum(-1)<95)
    al=~bg & ~(np.abs(t-bgc).sum(-1)<70)
    g=(np.abs(t-[171,172,55]).sum(-1)<70)|(np.abs(t-[125,141,66]).sum(-1)<50)
    lab,n=ndimage.label(g&al)
    for i in range(1,n+1):
        m=lab==i; yy,_=np.nonzero(m)
        if yy.max()>=H-3 and yy.min()>=H-6: al&=~m
    lab,n=ndimage.label(al); sz=ndimage.sum(al,lab,range(1,n+1)); al=np.isin(lab,1+np.nonzero(sz>=4)[0])
    return Image.fromarray(np.dstack([t.astype(np.uint8),(al*255).astype(np.uint8)]),'RGBA')
def frames(img):
    al=np.asarray(img)[...,3]>0; cp=al.sum(0); out=[];inb=False
    for x,v in enumerate(cp):
        if v>0 and not inb: s=x; inb=True
        if v==0 and inb: out.append((s,x)); inb=False
    if inb: out.append((s,len(cp)))
    m=[]
    for c in out:
        if m and c[0]-m[-1][1]<2: m[-1]=(m[-1][0],c[1])
        else: m.append(c)
    return [img.crop((x0,0,x1,img.height)).crop(img.crop((x0,0,x1,img.height)).getbbox()) for x0,x1 in m if x1-x0>3]
