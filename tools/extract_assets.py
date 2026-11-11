import cv2, numpy as np, sys, json
from PIL import Image
SRC=cv2.imread('/mnt/user-data/uploads/42f43c48-image.jpg')
def extract(name, box, fg_rects=(), bg_rects=(), scale=.62, iters=6, colors=48, outline=True, erode=True):
    x0,y0,x1,y1=box; pad=6
    X0,Y0=max(0,x0-pad),max(0,y0-pad); X1,Y1=min(SRC.shape[1],x1+pad),min(SRC.shape[0],y1+pad)
    img=SRC[Y0:Y1,X0:X1].copy()
    mask=np.zeros(img.shape[:2],np.uint8); mask[:]=cv2.GC_BGD
    mask[y0-Y0:y1-Y0, x0-X0:x1-X0]=cv2.GC_PR_FGD
    for (a,b,c,d) in fg_rects: mask[b-Y0:d-Y0, a-X0:c-X0]=cv2.GC_FGD
    for (a,b,c,d) in bg_rects: mask[b-Y0:d-Y0, a-X0:c-X0]=cv2.GC_BGD
    bg=np.zeros((1,65),np.float64); fg=np.zeros((1,65),np.float64)
    cv2.grabCut(img,mask,None,bg,fg,iters,cv2.GC_INIT_WITH_MASK)
    a=np.where((mask==cv2.GC_FGD)|(mask==cv2.GC_PR_FGD),255,0).astype(np.uint8)
    # bersihkan: ambil komponen terbesar, isi lubang
    n,lab,st,_=cv2.connectedComponentsWithStats(a)
    if n>1:
        k=1+np.argmax(st[1:,cv2.CC_STAT_AREA]); a=np.where(lab==k,255,0).astype(np.uint8)
    inv=255-a; h,w=a.shape; ff=inv.copy(); m2=np.zeros((h+2,w+2),np.uint8); cv2.floodFill(ff,m2,(0,0),0); a=a|ff
    a=cv2.morphologyEx(a,cv2.MORPH_OPEN,np.ones((3,3),np.uint8))
    rgba=cv2.cvtColor(img,cv2.COLOR_BGR2RGBA); rgba[:,:,3]=a
    pil=Image.fromarray(rgba)
    W,H=max(1,round(pil.width*scale)),max(1,round(pil.height*scale))
    # downscale premultiplied
    arr=np.array(pil).astype(np.float32); al=arr[:,:,3:4]/255; arr[:,:,:3]*=al
    small=np.array(Image.fromarray(arr.astype(np.uint8)).resize((W,H),Image.LANCZOS)).astype(np.float32)
    sa=np.array(Image.fromarray(a).resize((W,H),Image.LANCZOS)).astype(np.float32)/255
    rgb=np.clip(small[:,:,:3]/np.maximum(sa[:,:,None],1e-3),0,255)
    # pertajam sedikit
    blur=cv2.GaussianBlur(rgb,(0,0),.8); rgb=np.clip(rgb+(rgb-blur)*.6,0,255)
    A=(sa>.5).astype(np.uint8)*255
    if erode: A=cv2.erode(A,np.array([[0,1,0],[1,1,1],[0,1,0]],np.uint8))
    out=np.dstack([rgb.astype(np.uint8),A])
    im=Image.fromarray(out,'RGBA')
    q=im.convert('RGB').quantize(colors,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).convert('RGB')
    out=np.dstack([np.array(q),A])
    if outline:
        # garis luar gelap 1px
        A2=out[:,:,3]>0; big=np.zeros((H+2,W+2,4),np.uint8); big[1:-1,1:-1]=out
        m=np.pad(A2,1); nb=np.zeros_like(m)
        for dx,dy in((1,0),(-1,0),(0,1),(0,-1)): nb|=np.roll(np.roll(m,dy,0),dx,1)
        edge=nb&~m
        big[edge]=[40,30,24,255]
        out=big
    Image.fromarray(out,'RGBA').save('a_'+name+'.png')
    return out.shape
if __name__=='__main__':
    print(extract(sys.argv[1], tuple(map(int,sys.argv[2:6]))))
