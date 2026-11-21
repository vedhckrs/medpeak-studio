"""A cut-out rig for a character made from a traced AI parts sheet, animated by code and drawn by Animate.

The sheet is first prepared in Illustrator (ai-trace.jsx -> ai-fixcaps.jsx -> ai-face.jsx -> ai-partpngs.jsx),
which leaves one transparent PNG per part, where each part sat on the sheet (<name>-pngs.json) and where
each clothed joint end is (<name>-fixed-caps.json). This script:
  1 reads the joints from those ends (shoulder, elbow, wrist, hip, knee, ankle) and the neck and waist from
    the pictures;
  2 works out every frame: poses as joint angles, eased moves with overshoot and follow-through, breathing,
    a weight shift with the feet held on the ground, blinks, the head's own mouth swapped for lip-sync mouths
    on the spoken words;
  3 writes the job for an-rig.jsfl, has Animate draw the frames, and joins them with the voice into an MP4.
Parts are listed by role in CAST below (sheet 01, the doctor, 2026-11-18).

  python -I pipeline/animate/rig-cast.py [preview|render]
"""
import json
import math
import os
import subprocess
import sys

import numpy as np
from PIL import Image

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SHEET = os.path.join(ROOT, 'stock', 'cast-ai')
PNG = os.path.join(SHEET, 'png')
OUT = os.path.join(ROOT, 'out', 'animate', 'cast-test')
FRAMES = os.path.join(OUT, 'frames')
HERE = os.path.dirname(os.path.abspath(__file__))

W, H, FPS = 1080, 1920, 60
SECONDS = 10
K = 0.8  # stage pixels per sheet unit
PX = 2  # PNG pixels per sheet unit (exported at 200%)
GROUND = 1830  # where her soles stand on the stage

# which part of sheet 01 plays which role ("L" = the left of the picture)
CAST = {
    'head': 'part-01', 'neck': 'part-03', 'torso': 'part-06', 'pelvis': 'part-05',
    'upperL': 'part-04', 'upperR': 'part-07', 'foreL': 'part-09', 'foreR': 'part-12',
    'handL': 'part-13', 'handR': 'part-16', 'thighL': 'part-10', 'thighR': 'part-11',
    'shinL': 'part-14', 'shinR': 'part-15', 'shoeL': 'part-17', 'shoeR': 'part-18',
    'eyeL': 'head-eyeL', 'eyeR': 'head-eyeR', 'mouth': 'head-mouth',
    'closedL': 'part-28', 'closedR': 'part-29',
    'm_closed': 'part-19', 'm_small': 'part-20', 'm_wide': ['part-21', 'part-22'], 'm_o': 'part-23',
    'm_teeth': 'part-24', 'm_tongue': 'part-25',
    'g_point': 'part-32', 'g_palm': 'part-33', 'g_fist': 'part-34', 'g_thumb': 'part-35',
}
# gesture hands: where the wrist is (fraction of the picture) and which way the hand points from it (deg, y down)
GESTURES = {'point': (0.04, 0.58, -33), 'palm': (0.50, 0.97, -90), 'fist': (0.42, 0.97, -90), 'thumb': (0.05, 0.82, -20)}

P = {p['name']: p for p in json.load(open(os.path.join(PNG, '01-doctor-pngs.json')))}
CAPS = json.load(open(os.path.join(SHEET, '01-doctor-fixed-caps.json')))


def caps_of(name):
    """The joint ends of a part, top one first."""
    c = sorted([(k['y'], k['x']) for k in CAPS if k['part'] == name])
    return [np.array([x, y]) for y, x in c]


def rgba(name):
    return np.asarray(Image.open(os.path.join(PNG, name + '.png')).convert('RGBA')).astype(np.int32)


def to_units(name, col, row):
    p = P[name]
    return np.array([p['x'] + col / PX, p['y'] + row / PX])


# ---- 1 joints, in sheet units ----
J = {}
for side in 'LR':
    J['shoulder_up' + side], J['elbow_up' + side] = caps_of(CAST['upper' + side])[:2]
    J['elbow_fore' + side], J['wrist_fore' + side] = caps_of(CAST['fore' + side])[:2]
    J['hip_thigh' + side], J['knee_thigh' + side] = caps_of(CAST['thigh' + side])[:2]
    J['knee_shin' + side], J['ankle_shin' + side] = caps_of(CAST['shin' + side])[:2]
    J['ankle_shoe' + side] = caps_of(CAST['shoe' + side])[0]
    h = P[CAST['hand' + side]]
    J['wrist_hand' + side] = np.array([h['x'] + h['w'] * (0.52 if side == 'L' else 0.55), h['y'] + 14])
pv = caps_of(CAST['pelvis'])  # waist on top, then the two hip holes
J['waist_pelvis'] = pv[0]
pel = P[CAST['pelvis']]
pcx = pel['x'] + pel['w'] / 2
J['hip_pelvisL'] = np.array([pcx - pel['w'] * 0.26, pv[1][1] + 14])
J['hip_pelvisR'] = np.array([pcx + pel['w'] * 0.26, pv[1][1] + 14])
sh = sorted(caps_of(CAST['torso']), key=lambda v: v[0])
J['shoulder_torsoL'], J['shoulder_torsoR'] = sh[0], sh[1]
# the waist of the coat: the lowest teal row in the middle; the neck opening: the skin at its top middle
tor = rgba(CAST['torso'])
th, tw = tor.shape[:2]
mid = tor[:, int(tw * 0.4):int(tw * 0.6)]
teal = (mid[..., 1] > mid[..., 0] + 30) & (mid[..., 2] > mid[..., 0] + 20) & (mid[..., 3] > 200)
rows = np.nonzero(teal.any(1))[0]
J['waist_torso'] = to_units(CAST['torso'], tw / 2, rows.max())
top = tor[:int(th * 0.2)]
skin = (top[..., 0] > 200) & (top[..., 0] > top[..., 1]) & (top[..., 1] > top[..., 2]) & (top[..., 0] - top[..., 2] > 50) & (top[..., 3] > 200)
ys, xs = np.nonzero(skin)
J['neck_torso'] = to_units(CAST['torso'], xs.mean(), ys.mean())
nk = P[CAST['neck']]
J['neck_bottom'] = np.array([nk['x'] + nk['w'] / 2, nk['y'] + nk['h'] - 6])
hd = P[CAST['head']]
J['chin'] = np.array([hd['x'] + hd['w'] / 2, hd['y'] + hd['h'] - 8])

ang = lambda a, b: math.degrees(math.atan2(b[1] - a[1], b[0] - a[0]))
dist = lambda a, b: float(np.hypot(*(b - a)))
L_UP = {s: dist(J['shoulder_up' + s], J['elbow_up' + s]) for s in 'LR'}
L_FORE = {s: dist(J['elbow_fore' + s], J['wrist_fore' + s]) for s in 'LR'}
L_THIGH = {s: dist(J['hip_thigh' + s], J['knee_thigh' + s]) for s in 'LR'}
L_SHIN = {s: dist(J['knee_shin' + s], J['ankle_shin' + s]) for s in 'LR'}
A0 = {}
for s in 'LR':
    A0['upper' + s] = ang(J['shoulder_up' + s], J['elbow_up' + s])
    A0['fore' + s] = ang(J['elbow_fore' + s], J['wrist_fore' + s])
    A0['thigh' + s] = ang(J['hip_thigh' + s], J['knee_thigh' + s])
    A0['shin' + s] = ang(J['knee_shin' + s], J['ankle_shin' + s])


# ---- 2 pieces: a picture (or several, as cels) with the joint it turns around ----
def uri(path):
    p = path.replace('\\', '/')
    return 'file:///' + p[0] + '|' + p[2:]


def cel(name, pivot, scale=1.0, at=None):
    p = P[name]
    s = K / PX * scale
    corner = at if at is not None else (np.array([p['x'], p['y']]) - pivot) * scale
    return {'uri': uri(os.path.join(PNG, name + '.png')), 'm': [round(s, 5), 0, 0, round(s, 5), round(corner[0] * K, 3), round(corner[1] * K, 3)]}


# the wide mouth was traced as two parts: join them into one picture
if not os.path.exists(os.path.join(PNG, 'm-wide.png')):
    a, b = [P[n] for n in CAST['m_wide']]
    x0, y0 = min(a['x'], b['x']), min(a['y'], b['y'])
    x1, y1 = max(a['x'] + a['w'], b['x'] + b['w']), max(a['y'] + a['h'], b['y'] + b['h'])
    im = Image.new('RGBA', (int(math.ceil((x1 - x0) * PX)), int(math.ceil((y1 - y0) * PX))), (0, 0, 0, 0))
    for n in CAST['m_wide']:
        q = P[n]
        im.alpha_composite(Image.open(os.path.join(PNG, n + '.png')).convert('RGBA'), (int(round((q['x'] - x0) * PX)), int(round((q['y'] - y0) * PX))))
    im.save(os.path.join(PNG, 'm-wide.png'))
    P['m-wide'] = {'name': 'm-wide', 'x': x0, 'y': y0, 'w': x1 - x0, 'h': y1 - y0}
else:
    a, b = [P[n] for n in CAST['m_wide']]
    x0, y0 = min(a['x'], b['x']), min(a['y'], b['y'])
    P['m-wide'] = {'name': 'm-wide', 'x': x0, 'y': y0, 'w': max(a['x'] + a['w'], b['x'] + b['w']) - x0, 'h': max(a['y'] + a['h'], b['y'] + b['h']) - y0}

centre = lambda n: np.array([P[n]['x'] + P[n]['w'] / 2, P[n]['y'] + P[n]['h'] / 2])
MOUTH_BOX = P[CAST['mouth']]
MOUTHS = ['m_closed', 'm_small', 'm_wide', 'm_o', 'm_teeth', 'm_tongue']
M_SCALE = MOUTH_BOX['w'] / P[CAST['m_closed']]['w'] * 0.8  # talking mouths a little smaller than the smile, so the teeth do not read as a grin


def mouth_cel(role):
    n = 'm-wide' if role == 'm_wide' else CAST[role]
    p = P[n]
    w, h = p['w'] * M_SCALE, p['h'] * M_SCALE
    # every mouth hangs from the same top line, centred on the drawn smile
    at = np.array([-w / 2, -MOUTH_BOX['h'] * 0.55])
    return cel(n, np.zeros(2), M_SCALE, at)


EYE_C = {s: centre(CAST['eye' + s]) for s in 'LR'}
CLOSED_SCALE = {s: P[CAST['eye' + s]]['w'] / P[CAST['closed' + s]]['w'] * 0.95 for s in 'LR'}


def closed_cel(s):
    n = CAST['closed' + s]
    p = P[n]
    sc = CLOSED_SCALE[s]
    return cel(n, np.zeros(2), sc, np.array([-p['w'] * sc / 2, -p['h'] * sc * 0.2]))


def hand_cels(side):
    """Her own relaxed hand, then (right arm) the gesture hands, each turned around its wrist."""
    out = [cel(CAST['hand' + side], J['wrist_hand' + side])]
    dirs = [90.0]
    names = ['rest']
    if side == 'R':
        for g, (fx, fy, d) in GESTURES.items():
            n = CAST['g_' + g]
            p = P[n]
            out.append(cel(n, np.array([p['x'] + p['w'] * fx, p['y'] + p['h'] * fy])))
            dirs.append(d)
            names.append(g)
    return out, dirs, names


PIECES = []


def piece(name, cels, kind, **more):
    PIECES.append(dict(name=name, cels=cels, kind=kind, **more))


for s in 'LR':
    piece('shoe' + s, [cel(CAST['shoe' + s], J['ankle_shoe' + s])], 'shoe', side=s)
for s in 'LR':
    piece('shin' + s, [cel(CAST['shin' + s], J['knee_shin' + s])], 'shin', side=s)
for s in 'LR':
    piece('thigh' + s, [cel(CAST['thigh' + s], J['hip_thigh' + s])], 'thigh', side=s)
piece('pelvis', [cel(CAST['pelvis'], J['waist_pelvis'])], 'pelvis')
piece('neck', [cel(CAST['neck'], J['neck_bottom'])], 'neck')
piece('torso', [cel(CAST['torso'], J['waist_torso'])], 'torso')
piece('head', [cel(CAST['head'], J['chin'])], 'head')
for s in 'LR':
    piece('eye' + s, [cel(CAST['eye' + s], EYE_C[s])], 'eye', side=s)
    piece('closed' + s, [closed_cel(s)], 'closed', side=s)
piece('mouthHead', [cel(CAST['mouth'], centre(CAST['mouth']))], 'mouthHead')
piece('mouth', [mouth_cel(r) for r in MOUTHS], 'mouth')
HAND = {}
for s in 'LR':
    cels, dirs, names = hand_cels(s)
    HAND[s] = (dirs, names)
    piece('hand' + s, cels, 'hand', side=s)
    piece('fore' + s, [cel(CAST['fore' + s], J['elbow_fore' + s])], 'fore', side=s)
    piece('upper' + s, [cel(CAST['upper' + s], J['shoulder_up' + s])], 'upper', side=s)


# ---- 3 motion ----
def rot(v, deg):
    t = math.radians(deg)
    return np.array([v[0] * math.cos(t) - v[1] * math.sin(t), v[0] * math.sin(t) + v[1] * math.cos(t)])


def mat(pos, deg=0.0, cel_i=0, sx=1.0, sy=1.0):
    t = math.radians(deg)
    c, s_ = math.cos(t), math.sin(t)
    return [round(c * sx, 5), round(s_ * sx, 5), round(-s_ * sy, 5), round(c * sy, 5), round(float(pos[0]), 3), round(float(pos[1]), 3), cel_i]


def overshoot(t):
    if t <= 0:
        return 0.0
    if t >= 1:
        return 1.0
    c = 1.25
    return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2


def track(keys, t, get, lag=0.0, span=0.42):
    """A value at time t from keys [(time, pose)]: each move takes `span` seconds and ends on its key."""
    g = t - lag
    k = 0
    while k < len(keys) - 2 and g >= keys[k + 1][0]:
        k += 1
    (t0, a), (t1, b) = keys[k], keys[k + 1]
    sp = min(span, t1 - t0)
    u = overshoot((g - (t1 - sp)) / sp)
    return get(a) + (get(b) - get(a)) * u


def held(keys, t, get, early=0.18):
    k = 0
    while k < len(keys) - 1 and t >= keys[k + 1][0] - early:
        k += 1
    return get(keys[k][1])


VOICE = json.load(open(os.path.join(ROOT, 'videos', 'rabies', 'toon-timings.json')))['lines']
LINES = [('D1', 0.6), ('D3', 5.0)]
WORDS = []
for lid, at in LINES:
    for w in VOICE[lid]['words']:
        WORDS.append({'w': w['w'], 'start': at + w['start'], 'end': at + w['end']})
word_at = lambda word, n=0: [w for w in WORDS if w['w'].lower().strip('.,!?').startswith(word)][n]['start']

VISEME = {'a': 'm_wide', 'e': 'm_small', 'i': 'm_small', 'o': 'm_o', 'u': 'm_o', 'w': 'm_o', 'm': 'm_closed', 'b': 'm_closed', 'p': 'm_closed',
          'l': 'm_tongue', 'r': 'm_small', 't': 'm_small', 'd': 'm_small', 'n': 'm_small', 's': 'm_teeth', 'z': 'm_teeth', 'f': 'm_teeth', 'v': 'm_teeth', 'h': 'm_small', 'y': 'm_small'}


def mouth_at(t):
    for w in WORDS:
        if w['start'] <= t <= w['end']:
            letters = ''.join(ch for ch in w['w'].lower() if ch.isalpha())
            if not letters:
                return None
            i = min(len(letters) - 1, int((t - w['start']) / max(1e-3, w['end'] - w['start']) * len(letters)))
            return VISEME.get(letters[i], 'm_small')
    return None


BLINKS = [1.9, 4.7, 7.3, 9.3]
BLINK = [0, 0.55, 1, 1, 0.6, 0.25, 0]  # 30ths of a second


def blink_at(t):
    for b in BLINKS:
        d = (t - b) * 30
        if 0 <= d < len(BLINK) - 1:
            i = int(d)
            return BLINK[i] + (BLINK[i + 1] - BLINK[i]) * (d - i)
    return 0.0


# arm poses: absolute angles of the upper arm and forearm (degrees, y down, 90 = straight down) and the hand
REST = {'L': (100.0, 97.0, 'rest'), 'R': (80.0, 83.0, 'rest')}
POSE = {
    'rest': {'L': REST['L'], 'R': REST['R'], 'head': 0.0},
    'explain': {'L': REST['L'], 'R': (64.0, -18.0, 'palm'), 'head': -2.5},
    'point': {'L': REST['L'], 'R': (52.0, -58.0, 'point'), 'head': 2.0},
    'today': {'L': (102.0, 128.0, 'rest'), 'R': (60.0, -10.0, 'palm'), 'head': -1.5},
    'act': {'L': (101.0, 122.0, 'rest'), 'R': (66.0, -25.0, 'palm'), 'head': 2.0},
    'thumb': {'L': REST['L'], 'R': (74.0, -8.0, 'thumb'), 'head': -2.0},
}
KEYS = [(0.0, POSE['rest']), (word_at('your'), POSE['rest']), (word_at('right') + 0.1, POSE['explain']),
        (word_at('washing') + 0.25, POSE['point']), (word_at('today') + 0.2, POSE['today']),
        (word_at('act') + 0.25, POSE['act']), (word_at('treatment') + 0.3, POSE['thumb']),
        (8.7, POSE['thumb']), (9.4, POSE['rest']), (12.0, POSE['rest'])]

STAGE = lambda a: np.array([a[0] * K + W / 2, a[1] * K + 0])


def frame(t):
    br = math.sin(t * 2 * math.pi * 0.3)  # breathing
    shift = math.sin(t * 2 * math.pi * 0.11) * 9  # weight from foot to foot, in units
    lean = math.sin(t * 2 * math.pi * 0.11 + 0.6) * 0.9
    talk = mouth_at(t)
    head_t = track(KEYS, t, lambda q: q['head'], 0.05) + math.sin(t * 2.1) * 0.8 + (math.sin(t * 9) * 0.6 if talk else 0)
    blink = blink_at(t)
    out = {}
    # pelvis: the waist at the origin, moved by the weight shift; legs reach down to feet that stay put
    waist = np.array([shift, 2.0 * abs(math.sin(t * 2 * math.pi * 0.11))])
    out['pelvis'] = (waist, 0.0)
    for s in 'LR':
        hip = waist + (J['hip_pelvis' + s] - J['waist_pelvis'])
        ankle0 = REST_ANKLE[s]
        d = ankle0 - hip
        D = float(np.hypot(*d))
        a, b = L_THIGH[s], L_SHIN[s]
        D = min(D, a + b - 0.01)
        base = math.degrees(math.atan2(d[1], d[0]))
        bend = math.degrees(math.acos(max(-1, min(1, (a * a + D * D - b * b) / (2 * a * D)))))
        out_sign = 1 if s == 'L' else -1  # knees bend a little outward
        th = base + out_sign * bend
        knee = hip + a * np.array([math.cos(math.radians(th)), math.sin(math.radians(th))])
        sh = math.degrees(math.atan2(ankle0[1] - knee[1], ankle0[0] - knee[0]))
        out['thigh' + s] = (hip, th - A0['thigh' + s])
        out['shin' + s] = (knee, sh - A0['shin' + s])
        out['shoe' + s] = (ankle0, 0.0)
    # upper body: on the waist, leaning, breathing
    tw = waist + np.array([0, -12 + br * 1.6])

    def up(pt):
        return tw + rot(pt - J['waist_torso'], lean)
    out['torso'] = (tw, lean)
    out['neck'] = (up(J['neck_torso'] + np.array([0, 40])), lean)
    chin = up(J['neck_torso'] + np.array([0, -46]))
    hrot = lean + head_t
    out['head'] = (chin, hrot)
    on_head = lambda pt: chin + rot(pt - J['chin'], hrot)
    for s in 'LR':
        out['eye' + s] = (on_head(EYE_C[s]), hrot, 0, 1.0, 1 - 0.85 * blink) if blink < 0.9 else None
        out['closed' + s] = (on_head(EYE_C[s]), hrot) if blink >= 0.9 else None
    mc = centre(CAST['mouth'])
    if talk:
        out['mouthHead'] = None
        out['mouth'] = (on_head(mc), hrot, MOUTHS.index(talk))
    else:
        out['mouthHead'] = (on_head(mc), hrot)
        out['mouth'] = None
    for s in 'LR':
        a1 = track(KEYS, t, lambda q: q[s][0]) + lean + math.sin(t * 1.7 + (0 if s == 'L' else 2)) * 1.2
        a2 = track(KEYS, t, lambda q: q[s][1], 0.05) + lean
        a2 += (track(KEYS, t, lambda q: q[s][1], 0.05) - track(KEYS, t, lambda q: q[s][1], 0.12)) * 0.15
        hand = held(KEYS, t, lambda q: q[s][2])
        S = up(J['shoulder_torso' + s])
        E = S + L_UP[s] * np.array([math.cos(math.radians(a1)), math.sin(math.radians(a1))])
        Wr = E + L_FORE[s] * np.array([math.cos(math.radians(a2)), math.sin(math.radians(a2))])
        dirs, names = HAND[s]
        hi = names.index(hand)
        wiggle = (track(KEYS, t, lambda q: q[s][1], 0.05) - track(KEYS, t, lambda q: q[s][1], 0.16)) * 0.2
        out['upper' + s] = (S, a1 - A0['upper' + s])
        out['fore' + s] = (E, a2 - A0['fore' + s])
        out['hand' + s] = (Wr, a2 - dirs[hi] + wiggle, hi)
    return out


# where the feet stand: legs straight down from the hips at rest
REST_ANKLE = {}
for s in 'LR':
    hip = J['hip_pelvis' + s] - J['waist_pelvis']
    REST_ANKLE[s] = hip + np.array([(-4 if s == 'L' else 4), L_THIGH[s] + L_SHIN[s] - 6])
# the soles on the ground line
SOLE = max(P[CAST['shoe' + s]]['y'] + P[CAST['shoe' + s]]['h'] - J['ankle_shoe' + s][1] for s in 'LR')
Y_OFF = GROUND - (REST_ANKLE['L'][1] + SOLE) * K


def job_frames():
    rows = []
    for f in range(SECONDS * FPS):
        o = frame(f / FPS)
        row = []
        for pc in PIECES:
            v = o.get(pc['name'])
            if v is None:
                row.append(0)
                continue
            pos, deg = v[0], v[1]
            ci = v[2] if len(v) > 2 else 0
            sx = v[3] if len(v) > 3 else 1.0
            sy = v[4] if len(v) > 4 else 1.0
            sp = np.array([pos[0] * K + W / 2, pos[1] * K + Y_OFF])
            row.append(mat(sp, deg, ci, sx, sy))
        rows.append(row)
    return rows


def preview(rows, frames, path):
    """Draw some frames with PIL, to check the rig before Animate."""
    cache = {}
    tiles = []
    for f in frames:
        canvas = Image.new('RGBA', (W, H), (244, 239, 230, 255))
        for pc, m in zip(PIECES, rows[f]):
            if not m:
                continue
            c = pc['cels'][m[6]]
            key = c['uri']
            if key not in cache:
                p = key.replace('file:///', '')
                cache[key] = Image.open(p[0] + ':' + p[2:]).convert('RGBA')
            im = cache[key]
            a, b, cc, d, tx, ty = m[:6]
            s, _, _, s2, ox, oy = c['m']
            # pixel -> symbol -> stage
            A = np.array([[a, cc, tx], [b, d, ty], [0, 0, 1]]) @ np.array([[s, 0, ox], [0, s2, oy], [0, 0, 1]])
            inv = np.linalg.inv(A)
            canvas.alpha_composite(im.transform((W, H), Image.AFFINE, tuple(inv[:2].flatten()), resample=Image.BICUBIC))
        tiles.append(canvas.resize((W // 2, H // 2)))
    sheet = Image.new('RGBA', (W // 2 * len(tiles), H // 2))
    for i, t in enumerate(tiles):
        sheet.paste(t, (i * W // 2, 0))
    sheet.convert('RGB').save(path)


def render(rows):
    os.makedirs(FRAMES, exist_ok=True)
    for n in os.listdir(FRAMES):
        os.remove(os.path.join(FRAMES, n))
    job = {'width': W, 'height': H, 'fps': FPS, 'out': uri(FRAMES) + '/', 'name': 'f', 'parenting': False,
           'fla': uri(os.path.join(OUT, 'cast-01-doctor-test.fla')),
           'pieces': [{'name': pc['name'], 'parent': None, 'cels': pc['cels']} for pc in PIECES], 'frames': rows}
    json.dump(job, open(os.path.join(HERE, 'an-rig.json'), 'w'))
    r = subprocess.run(['powershell', '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', os.path.join(HERE, 'run-an.ps1'),
                        os.path.join(HERE, 'an-rig.jsfl'), '-TimeoutSec', '3300'], capture_output=True, text=True)
    print(r.stdout[-600:])
    if r.returncode:
        raise SystemExit('Animate did not finish')
    mp4 = os.path.join(ROOT, 'out', 'animate', 'cast-01-doctor-test.mp4')
    voices = [os.path.join(ROOT, 'public', VOICE[lid]['file']) for lid, _ in LINES]
    ins = []
    for v in voices:
        ins += ['-i', v]
    delays = ''.join(f'[{i + 2}:a]adelay={int(at * 1000)}|{int(at * 1000)}[v{i}];' for i, (_, at) in enumerate(LINES))
    mix = ''.join(f'[v{i}]' for i in range(len(LINES))) + f'amix=inputs={len(LINES)}:normalize=0[a]'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', f'color=c=0xf4efe6:s={W}x{H}:r={FPS}', '-framerate', str(FPS),
                    '-start_number', '0', '-i', os.path.join(FRAMES, 'f%04d.png'), *ins, '-filter_complex',
                    f'[1]scale={W}:{H}[f];[0][f]overlay=shortest=1,format=yuv420p[v];{delays}{mix}', '-map', '[v]', '-map', '[a]',
                    '-c:v', 'libx264', '-crf', '16', '-c:a', 'aac', '-t', str(SECONDS), mp4], check=True)
    print('video ' + mp4)


if __name__ == '__main__':
    rows = job_frames()
    os.makedirs(OUT, exist_ok=True)
    if len(sys.argv) > 1 and sys.argv[1] == 'render':
        render(rows)
    else:
        picks = [0, int(word_at('right') * FPS + 30), int(word_at('washing') * FPS + 40), int(word_at('today') * FPS + 30),
                 int(word_at('treatment') * FPS + 45), int(BLINKS[0] * 60 + 3)]
        preview(rows, picks, os.path.join(OUT, 'preview.jpg'))
        print('preview', os.path.join(OUT, 'preview.jpg'), 'pieces', len(PIECES))
