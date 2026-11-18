"""Find, in a character sheet picture, the things a trace loses or a rig needs from the face:
  - the white catchlights in the eyes (small white spots on dark), to add back as vector circles;
  - in the head part, the boxes of the two eyes and of the mouth, so the drawn ones can be taken off
    and replaced by the sheet's own eye and mouth shapes (blink, lip sync).
  python -I face-find.py <sheet.png> <parts.json> <head part name> <out.json>
Coordinates are pixels of the sheet picture, the same units as parts.json."""
import json, sys
import cv2
import numpy as np

sheet, parts_file, head_name, out_file = sys.argv[1:5]
im = cv2.imread(sheet, cv2.IMREAD_COLOR)[:, :, ::-1].astype(np.int32)  # RGB
H, W, _ = im.shape
r, g, b = im[..., 0], im[..., 1], im[..., 2]
mx = im.max(-1)
mn = im.min(-1)

# 1 catchlights: small, near-white blobs with dark all around
white = (mn > 232).astype(np.uint8)
n, lab, st, cen = cv2.connectedComponentsWithStats(white, 8)
dark = (mx < 120)
lights = []
for i in range(1, n):
    x, y, w, h, a = st[i]
    if a < 3 or a > 400 or w > 30 or h > 30:
        continue
    pad = max(3, int(max(w, h) * 0.8))
    x0, y0, x1, y1 = max(0, x - pad), max(0, y - pad), min(W, x + w + pad), min(H, y + h + pad)
    ring = dark[y0:y1, x0:x1].copy()
    ring[(y - y0):(y - y0 + h), (x - x0):(x - x0 + w)] = False
    area = (y1 - y0) * (x1 - x0) - w * h
    if area <= 0 or ring.sum() / area < 0.72 or a < 5:
        continue
    lights.append({'x': float(cen[i][0]), 'y': float(cen[i][1]), 'w': float(w), 'h': float(h)})

# 2 the head's eyes and mouth
parts = {p['name']: p for p in json.load(open(parts_file))}
hp = parts[head_name]
hx, hy, hw, hh = int(hp['x']), int(hp['y']), int(hp['w']), int(hp['h'])
sub = im[hy:hy + hh, hx:hx + hw]
sr, sg, sb = sub[..., 0], sub[..., 1], sub[..., 2]
smx = sub.max(-1)
def comps(mask, x0, x1, y0, y1):
    """Connected areas of mask inside the window (fractions of the head box), not touching its edges."""
    win = np.zeros(mask.shape, bool)
    X0, X1, Y0, Y1 = int(hw * x0), int(hw * x1), int(hh * y0), int(hh * y1)
    win[Y0:Y1, X0:X1] = True
    m = (mask & win).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m, 8)
    out = []
    for i in range(1, n):
        x, y, w, h, a = st[i]
        if x <= X0 or y <= Y0 or x + w >= X1 or y + h >= Y1:
            continue
        out.append((a, x, y, w, h))
    return sorted(out, reverse=True)

# the eyes: the two biggest very dark areas (lashes, iris, pupil) at eye height, clear of the hair
dark_px = smx < 100
eyes = []
for a, x, y, w, h in comps(dark_px, 0.10, 0.90, 0.40, 0.70)[:2]:
    m = 0.12
    eyes.append({'x': hx + x - w * m, 'y': hy + y - h * m, 'w': w * (1 + 2 * m), 'h': h * (1 + 2 * m)})
eyes.sort(key=lambda e: e['x'])
# the mouth: the biggest lip-red area in the lower face (the blush on the cheeks is paler)
lips = (sr < 232) & (sr - sg > 55) & (sg < 150)
mouth = None
mc = comps(lips, 0.22, 0.78, 0.66, 0.96)
if mc:
    a, x, y, w, h = mc[0]
    m = 6
    mouth = {'x': hx + x - m, 'y': hy + y - m, 'w': w + 2 * m, 'h': h + 2 * m}
# catchlights must sit inside an eye
out = {'lights': lights, 'eyes': eyes, 'mouth': mouth, 'head': hp}
json.dump(out, open(out_file, 'w'), indent=1, default=float)
print('catchlights', len(lights), '| eyes', [(round(e['x']), round(e['y']), round(e['w']), round(e['h'])) for e in eyes], '| mouth', mouth and (round(mouth['x']), round(mouth['y']), round(mouth['w']), round(mouth['h'])))
