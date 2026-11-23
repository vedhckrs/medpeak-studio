"""Close-ups of every face and every hand, one row per spoken line, cut from the FINAL render (the owner's catches on the
quit-smoking pilot were all in faces and hands: a hand pointing the wrong way, the thumb on the wrong side, the doctor looking
away; every check had passed them). Free, local: numpy + ffmpeg.

  python3 pipeline/tools/toon-closeups.py <slug>        -> videos/<slug>/renders/closeups.jpg

Reads videos/<slug>/renders/layout.json (the layout log: `npm run toon:layout` or the scoreboard writes it) and the render
(toon-v8.mp4, else toon.mp4). For each line, the probe nearest the middle of the line; every `face` box (padded) and every
`hand` box (padded more) is cut at full size and set in a 260 px tile, labelled line / who / face|hand.
"""
import json
import os
import subprocess
import sys

import numpy as np

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
W, H, TILE, LABEL = 1080, 1920, 260, 26


def frame_at(video, t):
    raw = subprocess.run(['ffmpeg', '-loglevel', 'error', '-ss', f'{t:.3f}', '-i', video, '-frames:v', '1', '-s', f'{W}x{H}',
                          '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(H, W, 3) if len(raw) == W * H * 3 else None


def cut(img, box, pad):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    s = max(w, h) * (1 + pad)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    a, b = int(max(0, cx - s / 2)), int(max(0, cy - s / 2))
    c, d = int(min(W, cx + s / 2)), int(min(H, cy + s / 2))
    if c - a < 4 or d - b < 4:
        return None
    crop = img[b:d, a:c]
    # nearest-neighbour resize to the tile (the crops are already full size; this only fits them)
    ys = (np.arange(TILE) * crop.shape[0] / TILE).astype(int)
    xs = (np.arange(TILE) * crop.shape[1] / TILE).astype(int)
    return crop[ys][:, xs]


def main():
    slug = sys.argv[1]
    vdir = os.path.join(ROOT, 'videos', slug)
    layout = json.load(open(os.path.join(vdir, 'renders', 'layout.json')))
    video = next((p for p in (os.path.join(vdir, 'renders', f) for f in ('toon-v8.mp4', 'toon.mp4')) if os.path.exists(p)), None)
    if not video:
        sys.exit('no render')
    rows = []
    for line in layout['lines']:
        mid = line['from'] + line['voice'] * 0.6
        probe = min(layout['probes'], key=lambda p: abs(p['t'] - mid))
        img = frame_at(video, probe['t'])
        if img is None:
            continue
        tiles = []
        for it in probe['items']:
            if it.get('kind') not in ('face', 'hand') or not it.get('box'):
                continue
            t = cut(img, it['box'], 0.6 if it['kind'] == 'face' else 1.6)
            if t is not None:
                tiles.append(t)
        if tiles:
            rows.append((line['id'], tiles))
    if not rows:
        sys.exit('no faces or hands in the layout log')
    cols = max(len(t) for _, t in rows)
    sheet = np.full(((TILE + 8) * len(rows) + 8, (TILE + 8) * cols + 8 + 90, 3), 245, np.uint8)
    for r, (lid, tiles) in enumerate(rows):
        y = 8 + r * (TILE + 8)
        for c, t in enumerate(tiles):
            x = 98 + c * (TILE + 8)
            sheet[y:y + TILE, x:x + TILE] = t
    out = os.path.join(vdir, 'renders', 'closeups.jpg')
    hh, ww = sheet.shape[:2]
    # the line ids, drawn by ffmpeg (no font library in numpy)
    draw = ','.join(f"drawbox=x=0:y={8 + r * (TILE + 8)}:w=90:h={TILE}:color=0x2b1a17@1:t=fill" for r in range(len(rows)))
    p = subprocess.run(['ffmpeg', '-loglevel', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{ww}x{hh}', '-i', '-',
                        '-vf', draw, '-q:v', '3', out], input=sheet.tobytes())
    if p.returncode:
        sys.exit('could not write the sheet')
    print(f'{out}: {sum(len(t) for _, t in rows)} close-ups over {len(rows)} lines (rows in line order: ' + ', '.join(l for l, _ in rows) + ')')


if __name__ == '__main__':
    main()
