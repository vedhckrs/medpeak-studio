import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
sys.path.insert(0,'/private/tmp/claude-501/agent2')
from cutsheet import grab, font, S
import glob
R='/Users/vedika/Desktop/New/work/reference-shorts/videos'
items=[]
for i in range(1,21):
    n=f'ref{i:02d}'; p=glob.glob(f'{R}/{i:02d}-*.mp4')[0]
    for t in S[n]['cut_times']:
        if t<0.2 or t>S[n]['sec']-0.3: continue
        items.append((n,p,t))
cols=8; rows=(len(items)+cols-1)//cols
W2,H2=96,170
im=Image.new('RGB',(cols*200+10,rows*200+10),'white'); d=ImageDraw.Draw(im)
for k,(n,p,t) in enumerate(items):
    x=10+(k%cols)*200; y=10+(k//cols)*200
    im.paste(grab(p,t-0.07,W2,H2),(x,y+22)); im.paste(grab(p,t+0.03,W2,H2),(x+98,y+22))
    d.text((x,y),f'{n} {t:.1f}s',fill='black',font=font)
im.save('frames/refcuts.jpg',quality=88); print(len(items))
