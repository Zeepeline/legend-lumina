from PIL import Image, ImageDraw
import numpy as np
from scipy import ndimage
SRC='/home/claude/legend-lumina/enemy_image/lands/Verdant Forest Pixel Tileset.png'
im=np.array(Image.open(SRC).convert('RGB')).astype(int)
bg=np.array([30,34,42]); diff=np.abs(im-bg).sum(2)>40
lab,n=ndimage.label(ndimage.binary_closing(diff,iterations=3))
L=[]
for i,s in enumerate(ndimage.find_objects(lab)):
  h=s[0].stop-s[0].start; w=s[1].stop-s[1].start
  if h*w>300 and s[0].start>500 and w<140: L.append((s[0].start,s[1].start,w,h))
L.sort()
sheet=Image.new('RGB',(10*150,3*170),(255,255,255)); d=ImageDraw.Draw(sheet)
src=Image.open(SRC).convert('RGB')
for k,(y,x,w,h) in enumerate(L):
  c=src.crop((x,y,x+w,y+h)); sheet.paste(c,((k%10)*150,(k//10)*170)); d.text(((k%10)*150+2,(k//10)*170+150),str(k)+' '+str((x,y,w,h)),fill=(0,0,0))
sheet.save('/tmp/decos.png'); print(len(L))
import json; json.dump(L,open(__file__.rsplit('/',1)[0]+'/L.json','w'))
