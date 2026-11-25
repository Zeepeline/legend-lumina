import sys; sys.path.insert(0,'tools/mc2')
from PIL import Image; import numpy as np
PAL={'A':(120,139,79),'B':(67,85,109),'C':(166,171,64),'D':(48,52,88),'E':(84,25,32),'F':(6,1,5),'G':(145,96,80),
     'H':(236,206,172),'I':(112,59,46),'J':(163,41,28),'K':(183,115,79),'L':(233,185,110)}
HALF=[ # setengah kiri x0..12 (x12 = tengah), dicerminkan → lebar 25, tinggi 48
"......F...F..", # 0 ujung rambut
".....FCF.FCF.",
"...F.FCCFCCCF",
"..FCFCCCCCCCC",
"..FCCCCCCCCCC",
".FCCCCACCCCCA",
".FCCCCACCCCAC",
"FBCCCACCCCACC",
"FBCCACCCCACCC",
"FBBCAFLCCFLAC", # 9 poni runcing
".FBALLLLALLLA",
".FBDLLLHFLLLL", # 11 mata (sorot di sisi luar)
".FBDLLLFFLLLL",
"..BDLLLFFLLLL",
"..FBLKLLLLLLL", # 14 rona pipi
"...FDLLLLLLLK", # mulut
".....FFFFFFFF", # 16 dagu
".....FEEEEEEE", # syal
"....FEEEEEEEE",
"....FEEEEEEEE",
"....FFEEEEEEE",
"...FJFFEEEEEE",
"..FJJJFFFFFFF",
"..FJJJJJJJJJJ", # 23 tunik
".FJJJFJJJJJJJ",
".FJJJFJJJJJJJ",
"FJJJJFJJJJJJJ",
"FEEEFJJJJJJJJ", # 27 manset
"FLLLFEEEEEEEE", # sabuk
"FLLLFEJJJJJJJ",
".FFFEEJHHHHHH", # 30 celemek
"...FEEJHHHHHA",
"...FEEJHHHHAA",
"...FEEJHHHHHA",
"...FEEJJJJJJJ",
"...FFFFFFFFFF",
"....FDDDDDDDD", # 36 celana
".....FDDDDFFF",
".....FBBBBF..",
".....FLLLLF..", # 39 kaki
".....FLLLLF..",
".....FLLLLF..",
".....FLLLLF..",
"....FGGGGGF..", # 43 sepatu bot (lipatan, tali, sol)
"....FEEEEEF..",
"....FIIIIIF..",
"...FEEEEEEF..",
"...FFFFFFFF..",
]
TOP=[ # baris 0–10 penuh (rambut tersibak, tidak simetris)
"........F.....FF.........",
".....F.FCF..FFCCF..F.....",
"....FCFCCCFFCCCCCFFCF....",
"...FCCCCCCCCCCCCCCCCCF...",
"..FCCCCCCCCCCCCCCCCCCCF..",
".FCCCCCACCCCCCCACCCCCCCF.",
".FCCCCACCCCCCCACCCCCCACF.",
"FBCCCACCCCCCCACCCCCCACCBF",
"FBCCACCCCCCCACCCCCCACCCBF",
"FBBCCACCCCCACCCCCACCCCBBF",
".FBCCLLLCCLLLLLCCLLLCCBF.",
]
EXTRA=[(11,12,'C'),(11,4,'C'),(11,20,'C'),(22,14,'E'),(22,15,'E'),(22,16,'F')]+[(y,x,c) for y in range(23,27) for x,c in ((13,'F'),(14,'E'),(15,'E'),(16,'F'))]+[(27,x,'F') for x in (13,14,15,16)] # ujung syal
def front_base():
    a=np.zeros((48,25,4),np.uint8)
    for y,row in enumerate(HALF):
        for x,ch in enumerate(row+row[:12][::-1]):
            if ch!='.': a[y,x]=(*PAL[ch],255)
    for y,row in enumerate(TOP):
        for x,ch in enumerate(row): a[y,x]=(*PAL[ch],255) if ch!='.' else 0
    for y,x,ch in EXTRA: a[y,x]=(*PAL[ch],255)
    return a
if __name__=='__main__':
    from pipe import frames
    b=Image.fromarray(front_base()); F=frames(Image.open('tools/mc2/dn_raw.png'))[0]
    s=Image.new('RGBA',(56,54),(90,140,90,255)); s.alpha_composite(b,(1,54-48)); s.alpha_composite(F,(29,54-F.height))
    s.resize((1120,1080),Image.NEAREST).save('tools/mc2/cmp.png')
