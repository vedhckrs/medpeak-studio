import json, subprocess, sys
from PIL import Image, ImageDraw, ImageFont
S=json.load(open('summary.json')); S={r['name']:r for r in S}
V='/Users/vedika/Desktop/MedPeakHealth/medpeak-studio/videos'
R='/Users/vedika/Desktop/New/work/reference-shorts/videos'
def grab(path,t,w=144,h=256):
    b=subprocess.run(['ffmpeg','-v','error','-ss',f'{max(0,t):.3f}','-i',path,'-frames:v','1','-vf',f'scale={w}:{h}','-f','rawvideo','-pix_fmt','rgb24','-'],capture_output=True).stdout
    return Image.frombytes('RGB',(w,h),b)
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial Bold.ttf',16)
def sheet(name,path,out):
    ts=S[name]['cut_times']
    cols=6; rows=(len(ts)+cols-1)//cols
    im=Image.new('RGB',(cols*300+10,rows*290+10),'white'); d=ImageDraw.Draw(im)
    for i,t in enumerate(ts):
        x=10+(i%cols)*300; y=10+(i//cols)*290
        im.paste(grab(path,t-0.07),(x,y+24)); im.paste(grab(path,t+0.03),(x+146,y+24))
        d.text((x,y),f'cut {i+1} at {t:.2f}s',fill='black',font=font)
    im.save(out,quality=88)
if __name__=="__main__": sheet(sys.argv[1],sys.argv[2],sys.argv[3])
