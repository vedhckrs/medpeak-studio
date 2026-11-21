# Read EVERY frame of each video (30 fps = one frame per 0.033 s) and measure motion, cuts, colour and line.
import json, subprocess, sys
import numpy as np
W, H = 270, 480
def frames(path):
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
    n = W * H * 3
    while True:
        b = p.stdout.read(n)
        if len(b) < n: break
        yield np.frombuffer(b, np.uint8).reshape(H, W, 3)
def look(f):
    g = f.astype(np.float32).mean(2)
    gx = np.abs(np.diff(g, axis=1))[:-1]; gy = np.abs(np.diff(g, axis=0))[:, :-1]; grad = np.maximum(gx, gy)
    q = (f >> 3).astype(np.int32); key = q[..., 0] * 1024 + q[..., 1] * 32 + q[..., 2]
    _, counts = np.unique(key, return_counts=True); counts = np.sort(counts)[::-1]
    top = int(np.searchsorted(np.cumsum(counts) / counts.sum(), 0.9) + 1)
    mx = f.max(2).astype(np.float32); mn = f.min(2).astype(np.float32); sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    return {
        'colours90': top,                                   # how many flat colours cover 90% of the picture
        'edges': float((grad > 40).mean()),                 # crisp lines and edges
        'soft': float(((grad > 3) & (grad <= 12)).mean()),  # soft gradients: shading, glow, blur
        'flat': float((grad <= 3).mean()),                  # perfectly flat fill
        'dark': float((g < 45).mean()),                     # near-black (outlines, dark backgrounds)
        'bright': float(g.mean()), 'sat': float(sat.mean()),
    }
def video(path):
    prev = None; d = []; area = []; looks = []; i = 0
    for f in frames(path):
        g = f.astype(np.int16)
        if prev is not None:
            a = np.abs(g - prev).mean(2); d.append(float(a.mean())); area.append(float((a > 12).mean()))
        if i % 15 == 0: looks.append(look(f))
        prev = g; i += 1
    d = np.array(d); area = np.array(area)
    cuts = int(((d > 28) & (area > 0.45)).sum())
    secs = i / 30
    L = {k: float(np.median([x[k] for x in looks])) for k in looks[0]}
    return {'frames': i, 'seconds': round(secs, 1), 'cuts': cuts, 'cut_every_s': round(secs / max(1, cuts), 1),
            'still_frames': round(float((area < 0.005).mean()), 3), 'small_motion': round(float(((area >= 0.005) & (area < 0.08)).mean()), 3),
            'big_motion': round(float((area >= 0.25).mean()), 3), 'median_moving_area': round(float(np.median(area)), 4), **{k: round(v, 4) for k, v in L.items()}}
out = {}
for p in sys.argv[2:]:
    out[p.split('/')[-1]] = video(p); print(p.split('/')[-1], out[p.split('/')[-1]], flush=True)
json.dump(out, open(sys.argv[1], 'w'), indent=1)
