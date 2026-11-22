"""Quick picture numbers for a short clip (engine v9 phase 4 samples). Free, local; needs numpy and ffmpeg.

    python pipeline/tools/c_measure.py <clip.mp4> [--from S] [--to S] [--mask-caption]

Prints (on 270 x 480 grey frames; a pixel "changes" when it moves more than 12 levels; the blueprint's Part 5 C-checks):
  still      share of frames where under 0.5% of the picture changes (30 fps)
  big        frames a minute (30 fps) where over 10% of the picture changes, cuts left out
  cuts       frames where over 45% changes and the mean change is over 28 levels
  flashes    the mean brightness of the picture rising 8+ levels within 3 frames (30 fps)
  pops       one-frame pops at the file's own rate: a frame that differs from both neighbours (over 0.4%) while they match
  max_zoom   (with --zoom) the largest frame-to-frame size change, found by a scale search about the centre
It is the prototype of toon_picture.py (agent A), kept small so the samples can be measured now.
"""
import json
import subprocess
import sys

import numpy as np

W, H = 270, 480


def frames(path, fps, t0=None, t1=None):
    cmd = ['ffmpeg', '-v', 'error']
    if t0 is not None:
        cmd += ['-ss', str(t0)]
    cmd += ['-i', path]
    if t1 is not None:
        cmd += ['-t', str(t1 - (t0 or 0))]
    cmd += ['-vf', f'fps={fps},scale={W}:{H},format=gray', '-f', 'rawvideo', '-']
    raw = subprocess.run(cmd, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(-1, H, W).astype(np.int16)


def main():
    a = sys.argv[1:]
    path = a[0]
    t0 = float(a[a.index('--from') + 1]) if '--from' in a else None
    t1 = float(a[a.index('--to') + 1]) if '--to' in a else None
    f30 = frames(path, 30, t0, t1)
    if '--mask-caption' in a:  # the caption band of caption style 2 (y 1290-1470 of 1920) and of the first style (1380-1580)
        keep = np.ones((H, W), bool)
        keep[int(1290 / 4):int(1580 / 4), :] = False
    else:
        keep = np.ones((H, W), bool)
    n = keep.sum()
    d = np.abs(np.diff(f30, axis=0)) > 12
    share = d[:, keep].sum(axis=1) / n
    mean = np.abs(np.diff(f30, axis=0))[:, keep].mean(axis=1)
    cut = (share > 0.45) & (mean > 28)
    still = float((share < 0.005).mean())
    minutes = len(f30) / 30 / 60
    big = float(((share > 0.10) & ~cut).sum() / max(minutes, 1e-9))
    bright = f30[:, keep].mean(axis=1)
    flashes = 0
    i = 0
    while i < len(bright) - 3:
        if bright[i + 3] - bright[i] >= 8 and not cut[i:i + 3].any():
            flashes += 1
            i += 15
        else:
            i += 1
    f60 = frames(path, 60, t0, t1)
    pops = []
    for k in range(1, len(f60) - 1):
        ab = (np.abs(f60[k] - f60[k - 1]) > 12)[keep].mean()
        bc = (np.abs(f60[k + 1] - f60[k]) > 12)[keep].mean()
        ac = (np.abs(f60[k + 1] - f60[k - 1]) > 12)[keep].mean()
        if ab > 0.004 and bc > 0.004 and ac < 0.001 and ab < 0.45:
            pops.append(round((t0 or 0) + k / 60, 3))
    out = {'clip': path, 'seconds': round(len(f30) / 30, 2), 'still': round(still, 3), 'big_per_min': round(big, 1),
           'cuts_at': [round((t0 or 0) + (k + 1) / 30, 2) for k in np.nonzero(cut)[0]], 'flashes': flashes, 'pops_at': pops,
           'action_seconds': round(float(np.mean([share[s:s + 30].max() > 0.01 for s in range(0, len(share), 30)])), 3)}
    if '--zoom' in a:
        # frame-to-frame scale about the centre, searched 0.94-1.10 on 60 fps frames; the largest found
        worst = 0.0
        ys, xs = np.mgrid[0:H, 0:W]
        for k in range(1, len(f60)):
            if (np.abs(f60[k] - f60[k - 1]) > 12).mean() < 0.02:
                continue
            best, err0 = 1.0, None
            for s in np.arange(0.94, 1.1001, 0.005):
                sy = np.clip(((ys - H / 2) / s + H / 2).astype(int), 0, H - 1)
                sx = np.clip(((xs - W / 2) / s + W / 2).astype(int), 0, W - 1)
                e = np.abs(f60[k - 1][sy, sx] - f60[k])[40:-40, 30:-30].mean()
                if err0 is None or e < err0:
                    best, err0 = s, e
            worst = max(worst, abs(best - 1))
        out['max_zoom_step'] = round(worst, 3)
    print(json.dumps(out))


if __name__ == '__main__':
    main()
