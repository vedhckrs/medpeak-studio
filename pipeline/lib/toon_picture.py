"""MedPeak Toons, engine v9 phase 1 (2026-11-23): the PICTURE checks C1-C8 on the FINAL render (blueprint 05, Part 5).

Built from the study scripts of agent 2 (measure.py, analyse.py, heat.py) and agent 4 (glitch.py), in
plans/engine-upgrade-2026-11-23/agent{2,4}-sheets/scripts. Free and local: ffmpeg + numpy + scipy (earshot's Python).

    python -I pipeline/lib/toon_picture.py OUT.json VIDEO.mp4 [--to SECONDS] [--band Y0,Y1] [--layout layout.json]
        [--palette '#ee8f93,#f4aaa6,...'] [--quick]

--to       measure the story only (the end card left out)
--band     the caption band in 1920-px rows (masked out of every motion and colour number): the caption is not the picture
--layout   videos/<slug>/renders/layout.json: shot kinds (body / room / card) for C1 "body place" holds and C7 colour
--palette  the kit's FLESH colours: a flat field in one of them is tissue, not a "flat non-tissue field"
--quick    skip the 60 fps pass (C4 pops, C5 zoom jumps): for tests of the 30 fps checks

Frames are read at 30 fps, 216 x 384 (C1-C3, C7), 60 fps 270 x 480 grey (C4, C5), full size for C6 (one frame a shot).
A pixel "changes" when it moves more than 12 levels; a frame is "still" when under 0.5% of the picture changes.
"""
import json, subprocess, sys
import numpy as np
from numpy.fft import rfft2, irfft2
from scipy import ndimage

W, H = 216, 384  # 1/5 scale for the 30 fps pass
FS = 1920 / H


def frames(path, fps, w, h, fmt, to=None):
    cut = ['-t', str(to)] if to else []
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', path, *cut, '-vf', f'fps={fps},scale={w}:{h}:flags=area', '-f', 'rawvideo', '-pix_fmt', fmt, '-'], stdout=subprocess.PIPE)
    c = 3 if fmt == 'rgb24' else 1
    n = w * h * c
    while True:
        b = p.stdout.read(n)
        if len(b) < n:
            break
        a = np.frombuffer(b, np.uint8)
        yield a.reshape(h, w, 3) if c == 3 else a.reshape(h, w)
    p.wait()


def still_frame(path, t):
    """One frame at full size (1080 x 1920, grey and rgb)."""
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', path, '-frames:v', '1', '-vf', 'scale=1080:1920', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    if len(raw) < 1080 * 1920 * 3:
        return None
    return np.frombuffer(raw[:1080 * 1920 * 3], np.uint8).reshape(1920, 1080, 3)


def runs(mask):
    out = []; i = 0; n = len(mask)
    while i < n:
        if mask[i]:
            j = i
            while j < n and mask[j]:
                j += 1
            out.append((i, j)); i = j
        else:
            i += 1
    return out


def phase(a, b):
    """Sub-pixel shift (dy, dx) that maps a onto b (phase correlation with a parabolic peak)."""
    A = rfft2(a); B = rfft2(b); R = A * np.conj(B); R /= np.abs(R) + 1e-6
    r = irfft2(R, s=a.shape)
    i = np.unravel_index(np.argmax(r), r.shape)
    h, w = a.shape
    def sub(v, axis, n):
        m1 = r[(i[0] - 1) % h, i[1]] if axis == 0 else r[i[0], (i[1] - 1) % w]
        p1 = r[(i[0] + 1) % h, i[1]] if axis == 0 else r[i[0], (i[1] + 1) % w]
        c = r[i]
        den = m1 - 2 * c + p1
        off = 0.5 * (m1 - p1) / den if abs(den) > 1e-9 else 0.0
        v = v + off
        return v - n if v > n / 2 else v
    return -sub(i[0], 0, h), -sub(i[1], 1, w)


yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def scaled(g, s, cy=(H - 1) / 2, cx=(W - 1) / 2):
    """g zoomed by s about (cy, cx)."""
    return ndimage.map_coordinates(g, [cy + (yy - cy) / s, cx + (xx - cx) / s], order=1, mode='nearest')


def zoom_match(a, b, scales, M):
    """Best zoom of a (about the centre, then shifted) that matches b: (scale, err, err_identity)."""
    e0 = float(np.abs(a - b)[M].mean())
    best = (1.0, e0)
    win = np.outer(np.hanning(H), np.hanning(W)).astype(np.float32)
    for s in scales:
        sa = scaled(a, s)
        dy, dx = phase((sa - sa.mean()) * win, (b - b.mean()) * win)
        sh = ndimage.shift(sa, (dy, dx), order=1, mode='nearest')
        e = float(np.abs(sh - b)[M].mean())
        if e < best[1]:
            best = (s, e)
    return best[0], best[1], e0


def hsv(rgb):
    f = rgb.astype(np.float32) / 255
    mx = f.max(2); mn = f.min(2); d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.zeros_like(mx)
    m = d > 1e-6
    rr = m & (mx == r); gg = m & (mx == g) & ~rr; bb = m & ~rr & ~gg
    h[rr] = ((g - b)[rr] / d[rr]) % 6
    h[gg] = (b - r)[gg] / d[gg] + 2
    h[bb] = (r - g)[bb] / d[bb] + 4
    return h * 60, s, mx


FAMILIES = {'warm': [(330, 360), (0, 50)], 'yellow': [(50, 70)], 'green': [(70, 160)], 'cyan': [(160, 200)], 'blue': [(200, 260)], 'purple': [(260, 330)]}


def colour(rgb, mask, palette):
    h, s, v = hsv(rgb)
    chroma = (s >= 0.08) & (v >= 0.2) & mask  # pale lilac and pale teal walls count as their family
    n = max(1, mask.sum())
    fam = {}
    for k, spans in FAMILIES.items():
        m = np.zeros_like(chroma)
        for a, b in spans:
            m |= (h >= a) & (h < b)
        fam[k] = float((chroma & m).sum() / n)
    # the largest flat field: one quantized colour, connected, not a FLESH colour
    q = (rgb >> 4).astype(np.int32)
    key = q[..., 0] * 256 + q[..., 1] * 16 + q[..., 2]
    vals, counts = np.unique(key[mask], return_counts=True)
    flat = 0.0; flat_rgb = None
    for kv in vals[np.argsort(counts)[::-1][:6]]:
        lab, nl = ndimage.label((key == kv) & mask)
        if nl == 0:
            continue
        sizes = ndimage.sum(np.ones_like(lab), lab, index=np.arange(1, nl + 1))
        j = int(np.argmax(sizes)); share = float(sizes[j] / n)
        mean = rgb[lab == j + 1].mean(0)
        tissue = palette is not None and len(palette) and np.min(np.linalg.norm(palette - mean, axis=1)) < 40
        if not tissue and share > flat:
            flat = share; flat_rgb = '#%02x%02x%02x' % tuple(int(c) for c in mean)
    return {'fam': fam, 'sat': float(s[mask].mean()), 'bright': float((rgb.astype(np.float32).mean(2))[mask].mean()), 'flat': flat, 'flat_rgb': flat_rgb}


def line_width(rgb, band):
    """Median width (px) of dark runs that cross an outline: dark (< 70) between light pixels, 2-30 px long."""
    g = rgb.astype(np.float32).mean(2)
    keep = np.ones(g.shape[0], bool)
    if band:
        keep[max(0, band[0]):min(g.shape[0], band[1])] = False
    widths = []
    for rows in (g[keep][::6], g[:, ::6].T):
        dark = rows < 70
        light = rows > 120
        for r in range(rows.shape[0]):
            d = dark[r]
            if not d.any():
                continue
            e = np.diff(np.concatenate([[0], d.astype(np.int8), [0]]))
            starts = np.where(e == 1)[0]; ends = np.where(e == -1)[0]
            for a, b in zip(starts, ends):
                L = b - a
                if 2 <= L <= 30 and a >= 2 and b + 2 <= d.size and light[r][max(0, a - 3):a].any() and light[r][b:b + 3].any():
                    widths.append(L)
    return float(np.median(widths)) if len(widths) > 30 else None, len(widths)


def clean(v):
    """JSON has no NaN: a number that could not be measured is null."""
    if isinstance(v, dict):
        return {k: clean(x) for k, x in v.items()}
    if isinstance(v, (list, tuple)):
        return [clean(x) for x in v]
    if isinstance(v, float) and not np.isfinite(v):
        return None
    return v


def main():
    out_path, path = sys.argv[1], sys.argv[2]
    to = None; band = None; layout = None; palette = None; quick = False
    a = sys.argv[3:]
    i = 0
    while i < len(a):
        if a[i] == '--to': to = float(a[i + 1]); i += 2
        elif a[i] == '--band': y0, y1 = a[i + 1].split(','); band = (int(float(y0)), int(float(y1))); i += 2
        elif a[i] == '--layout': layout = json.load(open(a[i + 1])); i += 2
        elif a[i] == '--palette': palette = np.array([[int(c[1:3], 16), int(c[3:5], 16), int(c[5:7], 16)] for c in a[i + 1].split(',') if c], np.float32); i += 2
        elif a[i] == '--quick': quick = True; i += 1
        else: i += 1

    def kind_at(t):
        if not layout:
            return None
        for s in layout['shots']:
            if s['from'] <= t < s['to']:
                return s['kind']
        return layout['shots'][-1]['kind'] if layout['shots'] else None

    # ------------------------------------------------ the 30 fps pass
    pic = np.ones((H, W), bool); pic[:3] = pic[-3:] = False; pic[:, :3] = pic[:, -3:] = False
    if band:
        pic[int(band[0] / FS):int(np.ceil(band[1] / FS))] = False
    prev = None; G = []; d = []; area = []; bright = []; up = []; heat = np.zeros((H, W)); nheat = 0; cols = []; n = 0
    for f in frames(path, 30, W, H, 'rgb24', to):
        g = f.astype(np.float32).mean(2)
        G.append(g.astype(np.uint8)); bright.append(float(g[pic].mean()))
        if prev is not None:
            df = np.abs(f.astype(np.int16) - prev).mean(2)
            mv = df > 12
            d.append(float(df[pic].mean())); area.append(float(mv[pic].mean()))
            up.append(float(((g - G[-2].astype(np.float32)) > 8)[pic].mean()))
            if mv[pic].mean() < 0.3:
                heat += mv; nheat += 1
        else:
            d.append(0.0); area.append(0.0); up.append(0.0)
        if n % 15 == 0:
            cols.append((n / 30, colour(f, pic, palette)))
        prev = f.astype(np.int16); n += 1
    if n < 2:
        json.dump({'error': 'no frames'}, open(out_path, 'w')); return
    secs = n / 30
    d = np.array(d); area = np.array(area); bright = np.array(bright); up = np.array(up)
    G = np.array(G)
    cut = (d > 28) & (area > 0.45)
    dark = np.array([float(x) < 30 for x in bright])

    # C1 cuts and their kinds
    cutf = [int(i) for i in np.where(cut)[0]]
    kinds = []
    for i in cutf:
        if dark[i] or dark[i - 1]:
            kinds.append('card'); continue
        a0 = G[i - 1].astype(np.float32); b0 = G[i].astype(np.float32)
        s_in, e_in, e0 = zoom_match(a0, b0, [1.25, 1.5, 1.75, 2.0, 2.5], pic)
        s_out, e_out, _ = zoom_match(b0, a0, [1.25, 1.5, 1.75, 2.0, 2.5], pic)
        if min(e_in, e_out) < 0.55 * e0 and min(e_in, e_out) < 22:
            kinds.append('reframe-in' if e_in <= e_out else 'reframe-out')
        else:
            kinds.append('place')
    bounds = [0] + [c for c in cutf] + [n]
    segs = []
    for j in range(len(bounds) - 1):
        a_, b_ = bounds[j], bounds[j + 1]
        if b_ - a_ < 1:
            continue
        mid = (a_ + b_) / 2 / 30
        segs.append({'from': round(a_ / 30, 2), 'to': round(b_ / 30, 2), 'len': round((b_ - a_) / 30, 2), 'card': bool(dark[a_:b_].mean() > 0.8), 'kind': kind_at(mid)})
    real = [k for k in kinds if k != 'card']
    holds = [s['len'] for s in segs if not s['card']]
    reframes = [(round(cutf[j] / 30, 2), k) for j, k in enumerate(kinds) if k.startswith('reframe')]
    reversed_ = [r for j, r in enumerate(reframes) if j and r[0] - reframes[j - 1][0] < 4 and r[1] != reframes[j - 1][1]]
    body_short = [s for s in segs if s['kind'] == 'body' and not s['card'] and s['len'] < 8]
    C1 = {'cuts': len(real), 'cuts_per_min': round(len(real) / secs * 60, 2), 'hold_median': round(float(np.median(holds)), 2) if holds else None,
          'hold_max': round(float(max(holds)), 2) if holds else None, 'reframes': len(reframes), 'reframes_reversed': len(reversed_),
          'body_holds_under_8s': len(body_short), 'cut_times': [round(c / 30, 2) for c in cutf], 'cut_kinds': kinds, 'segments': segs}

    # C2 stillness (cuts left out)
    ok = ~cut
    ok[1:] &= ~cut[:-1]
    ap = area[ok]
    still = ap < 0.005
    per_sec = []
    for j in range(int(np.ceil(secs))):
        sl = slice(j * 30, min(n, (j + 1) * 30))
        v = area[sl][ok[sl]]
        per_sec.append(float(v.mean()) if v.size else 0.0)
    per_sec = np.array(per_sec)
    stillmask = (area < 0.005) & ok
    stillruns = [(b - a) / 30 for a, b in runs(stillmask)]
    hm = heat / max(nheat, 1)
    act = (area >= 0.02) & ok
    dead = []
    for s in segs:
        if s['card'] or s['len'] < 8:
            continue
        a_, b_ = int(round(s['from'] * 30)), int(round(s['to'] * 30))
        if not any(b - a >= 2 for a, b in runs(act[a_:b_])):
            dead.append(s['from'])
    # M2 one action, then a hold: big actions (3%+ of the picture for 3+ frames) in the same shot closer than 1.5 s
    bigact = (area >= 0.03) & ok
    close = []
    for s in segs:
        a_, b_ = int(round(s['from'] * 30)), int(round(s['to'] * 30))
        rr = [(a + a_, b + a_) for a, b in runs(bigact[a_:b_]) if b - a >= 3]
        merged = []
        for r in rr:
            if merged and r[0] - merged[-1][1] < 3:
                merged[-1] = (merged[-1][0], r[1])
            else:
                merged.append(r)
        for j in range(1, len(merged)):
            if (merged[j][0] - merged[j - 1][1]) / 30 < 1.5:
                close.append(round(merged[j][0] / 30, 2))
    C2 = {'action_gaps': close, 'action_gaps_under_1_5': len(close),
          'still': round(float(still.mean()), 3), 'visible_seconds': round(float((per_sec > 0.01).mean()), 3), 'big_seconds': round(float((per_sec > 0.03).mean()), 3),
          'over10_per_min': round(float((ap > 0.10).sum()) / secs * 60, 1), 'heat_share': round(float((hm[pic] > 0.05).mean()), 3),
          'longest_still': round(max(stillruns) if stillruns else 0.0, 2), 'dead_shots': dead}

    # C3 flash and shake
    flashes = []
    for i in range(3, n):
        if bright[i] - bright[i - 3] >= 8 and float(((G[i].astype(np.float32) - G[i - 3].astype(np.float32)) > 8)[pic].mean()) > 0.6 and not dark[i - 3]:
            on_cut = bool(cut[max(0, i - 3):i + 1].any())
            if not flashes or i / 30 - flashes[-1]['t'] > 0.5:
                flashes.append({'t': round(i / 30, 2), 'on_cut': on_cut})
    # shake: the whole picture shifts and comes back within 0.3 s
    win = np.outer(np.hanning(H), np.hanning(W)).astype(np.float32)
    shifts = np.zeros((n, 2))
    for i in range(1, n):
        if cut[i] or area[i] < 0.08:
            continue
        a0 = G[i - 1].astype(np.float32); b0 = G[i].astype(np.float32)
        dy, dx = phase((a0 - a0.mean()) * win, (b0 - b0.mean()) * win)
        if abs(dy) > 8 or abs(dx) > 8:
            continue
        sh = ndimage.shift(a0, (dy, dx), order=1, mode='nearest')
        e0 = np.abs(a0 - b0)[pic].mean(); e1 = np.abs(sh - b0)[pic].mean()
        if e1 < 0.6 * e0:
            shifts[i] = (dy * FS, dx * FS)
    shakes = []
    for i in range(1, n):
        for ax in (0, 1):
            v = shifts[i, ax]
            if abs(v) < 3:
                continue
            back = shifts[i + 1:i + 10, ax]
            if (np.sign(back) == -np.sign(v)).any() and np.abs(back[np.sign(back) == -np.sign(v)]).max() >= 3:
                if not shakes or i / 30 - shakes[-1] > 0.5:
                    shakes.append(round(i / 30, 2))
                break
    C3 = {'flashes': len(flashes), 'flash_times': flashes, 'flash_on_cut': sum(1 for f in flashes if f['on_cut']), 'shakes': len(shakes), 'shake_times': shakes}

    # C7 colour and flat fields (one frame each 0.5 s)
    body = [c for t, c in cols if kind_at(t) in ('body', 'micro', None)]
    rooms = [c for t, c in cols if kind_at(t) == 'room']
    def fam_med(cs, k):
        return round(float(np.median([c['fam'][k] for c in cs])), 3) if cs else None
    # another family: the 75th percentile over the body frames (one body place in blue fails even when the others are pink)
    other = {k: (round(float(np.percentile([c['fam'][k] for c in body], 75)), 3) if body else None) for k in FAMILIES if k != 'warm'}
    worst_flat = max(body, key=lambda c: c['flat']) if body else None
    C7 = {'body_frames': len(body), 'room_frames': len(rooms), 'body_warm': fam_med(body, 'warm'), 'body_other': other,
          'body_other_max': max([v for v in other.values() if v is not None], default=None),
          'body_other_family': max(other, key=lambda k: other[k] or 0) if body else None,
          'flat_max': round(float(np.percentile([c['flat'] for c in body], 90)), 3) if body else None, 'flat_colour': worst_flat['flat_rgb'] if worst_flat else None,
          'room_sat': round(float(np.median([c['sat'] for c in rooms])), 3) if rooms else None, 'room_bright': round(float(np.median([c['bright'] for c in rooms])), 1) if rooms else None,
          'by_layout': layout is not None}

    # C8 time cards
    cards = [s for s in segs if s['card']]
    same = []
    for s in cards:
        a_, b_ = int(round(s['from'] * 30)) - 1, int(round(s['to'] * 30))
        if a_ < 0 or b_ >= n:
            same.append(None); continue
        ea = ndimage.sobel(G[a_].astype(np.float32)); eb = ndimage.sobel(G[b_].astype(np.float32))
        c = np.corrcoef(np.abs(ea[pic]).ravel(), np.abs(eb[pic]).ravel())[0, 1]
        same.append(round(float(c), 3))
    C8 = {'cards': len(cards), 'lengths': [s['len'] for s in cards], 'same_framing': same}

    # C6 line weight: one full-size frame in the middle of every shot
    lines = []
    for s in segs:
        if s['card'] or s['len'] < 0.4:
            continue
        fr = still_frame(path, (s['from'] + s['to']) / 2)
        if fr is None:
            continue
        w, k = line_width(fr, band)
        lines.append({'at': round((s['from'] + s['to']) / 2, 2), 'width': w, 'n': k})
    ws = [l['width'] for l in lines if l['width']]
    C6 = {'shots': lines, 'min': min(ws) if ws else None, 'max': max(ws) if ws else None, 'median': float(np.median(ws)) if ws else None}

    # ------------------------------------------------ the 60 fps pass: one-frame pops (C4) and zoom jumps (C5)
    C4 = C5 = None
    if not quick:
        W6, H6 = 270, 480
        mask = np.ones((H6, W6), bool)
        if band:
            mask[int(band[0] / 4):int(np.ceil(band[1] / 4))] = False
        # a pop: frame b differs from both neighbours while they match (agent 4's glitch.py), outside cuts
        k = 0; F = []; pops = []; big = []; jumps = []
        for g in frames(path, 60, W6, H6, 'gray', to):
            F.append(g.astype(np.int16))
            if len(F) > 3:
                F.pop(0)
            if len(F) == 3:
                a0, b0, c0 = F
                ab = (np.abs(a0 - b0) > 25) & mask; ac = (np.abs(a0 - c0) > 25) & mask; bc = (np.abs(b0 - c0) > 25) & mask
                fab, fac, fbc = ab.mean(), ac.mean(), bc.mean()
                if fab <= 0.45 and fbc <= 0.45 and fab > 0.004 and fbc > 0.004 and fac < 0.35 * min(fab, fbc):
                    ys, xs = np.nonzero(ab)
                    pops.append({'t': round((k - 1) / 60, 3), 'area': round(float(fab), 4), 'box': [int(xs.min()) * 4, int(ys.min()) * 4, int(xs.max()) * 4, int(ys.max()) * 4]})
                if 0.2 < fbc <= 0.45:
                    big.append((k, b0.astype(np.float32), c0.astype(np.float32)))
            k += 1
        C4 = {'pops': len(pops), 'pop_list': pops[:40]}
        # zoom jumps: a big one-frame change that is a zoom of more than 6%
        for (kk, b0, c0) in big[:400]:
            b1 = ndimage.zoom(b0, (H / H6, W / W6), order=1)[:H, :W]; c1 = ndimage.zoom(c0, (H / H6, W / W6), order=1)[:H, :W]
            s, e, e0 = zoom_match(b1, c1, [0.85, 0.9, 0.94, 1.06, 1.1, 1.18], pic)
            if e < 0.6 * e0 and abs(s - 1) > 0.06:
                jumps.append({'t': round(kk / 60, 3), 'zoom': s})
        C5 = {'zoom_jumps': len(jumps), 'list': jumps[:30]}

    out = {'file': path, 'frames30': n, 'seconds': round(secs, 2), 'band': band, 'C1': C1, 'C2': C2, 'C3': C3, 'C4': C4, 'C5': C5, 'C6': C6, 'C7': C7, 'C8': C8}
    json.dump(clean(out), open(out_path, 'w'), indent=1)
    print(json.dumps({k: v for k, v in out.items() if k in ('seconds',)}), flush=True)


if __name__ == '__main__':
    main()
