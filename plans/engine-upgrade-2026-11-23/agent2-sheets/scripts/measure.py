"""Per-frame motion study at 30 fps. Output: per-video npz + json summary."""
import json, subprocess, sys
import numpy as np
from numpy.fft import rfft2, irfft2
from scipy.ndimage import map_coordinates
W, H = 216, 384  # 1/5 scale
def frames(path, to=None):
    cut = ['-t', str(to)] if to else []
    p = subprocess.Popen(['ffmpeg','-v','error','-i',path,*cut,'-vf',f'fps=30,scale={W}:{H}','-f','rawvideo','-pix_fmt','rgb24','-'],stdout=subprocess.PIPE)
    n=W*H*3
    while True:
        b=p.stdout.read(n)
        if len(b)<n: break
        yield np.frombuffer(b,np.uint8).reshape(H,W,3)
yy, xx = np.mgrid[0:H,0:W].astype(np.float32)
cy, cx = (H-1)/2, (W-1)/2
SCALES = [0.97,0.98,0.99,0.995,1.0,1.005,1.01,1.02,1.03]
def scaled(g, s):
    # sample g at points so that result shows g zoomed by s about centre
    return map_coordinates(g, [cy+(yy-cy)/s, cx+(xx-cx)/s], order=1, mode='nearest')
def phase(a, b):
    A=rfft2(a); B=rfft2(b); R=A*np.conj(B); R/=np.abs(R)+1e-6
    r=irfft2(R, s=a.shape); i=np.unravel_index(np.argmax(r), r.shape)
    dy, dx = i
    h,w=a.shape
    if dy>h//2: dy-=h
    if dx>w//2: dx-=w
    return dy, dx
# mask: exclude caption band (rows of 1920: 1200-1640) and borders
band = np.zeros((H,W),bool); band[int(1200/5):int(1640/5)] = True
inner = np.zeros((H,W),bool); inner[12:-12,12:-12]=True
M = inner & ~band
CR=(slice(12,236),slice(12,W-12))
HAN=np.outer(np.hanning(224),np.hanning(W-24)).astype(np.float32)
def globalmove(a, b):
    """best (scale, dy, dx) mapping a->b; returns (s,dy,dx, err_identity, err_best)."""
    e0 = np.abs(a-b)[CR].mean()
    best=(1.0,0,0,e0)
    if e0 < 0.4: return (1.0,0,0,e0,e0)
    for s in SCALES:
        sa = scaled(a, s) if s!=1.0 else a
        ca=sa[CR]; cb=b[CR]
        dy,dx = phase((ca-ca.mean())*HAN, (cb-cb.mean())*HAN)
        dy,dx=-dy,-dx
        if abs(dy)>40 or abs(dx)>40: continue
        sh = np.roll(sa,(dy,dx),(0,1))
        e = np.abs(sh-b)[CR].mean()
        if e < best[3]: best=(s,dy,dx,e)
    return (*best[:3], e0, best[3])
def video(path, to=None):
    prev=None; G=[]; d=[]; fine=[]; area=[]; areapic=[]; areaband=[]; grid=[]; i=0
    for f in frames(path, to):
        g=f.astype(np.float32).mean(2)
        G.append(g.astype(np.uint8))
        if prev is not None:
            a=np.abs(f.astype(np.int16)-prev).mean(2)
            mv=a>12
            d.append(float(a.mean())); area.append(float(mv.mean())); fine.append(float((a[~band]>4).mean()))
            areapic.append(float(mv[~band].mean())); areaband.append(float(mv[band].mean()))
            grid.append([float(mv[r*H//3:(r+1)*H//3, c*W//3:(c+1)*W//3].mean()) for r in range(3) for c in range(3)])
        prev=f.astype(np.int16); i+=1
    G=np.array(G)
    # global move every 3 frames over a gap of 6 frames (0.2 s)
    gm=[]
    for t in range(0, len(G)-6, 3):
        a=G[t].astype(np.float32); b=G[t+6].astype(np.float32)
        gm.append((t,)+globalmove(a,b))
    return dict(n=i, d=np.array(d), fine=np.array(fine), area=np.array(area), areapic=np.array(areapic), areaband=np.array(areaband), grid=np.array(grid), gm=np.array(gm))
if __name__=='__main__':
    out=sys.argv[1]; path=sys.argv[2]; to=float(sys.argv[3]) if len(sys.argv)>3 and sys.argv[3]!='-' else None
    r=video(path,to)
    np.savez_compressed(out, **{k:v for k,v in r.items() if k!='n'}, n=r['n'])
    print(out, r['n'])
