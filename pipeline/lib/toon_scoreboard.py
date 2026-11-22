"""The scoreboard sheet (engine v9, phase 1, 2026-11-23): a 16:9 JPG of every number of blueprint 05 Part 1 for one or more
Toons, green where it passes, red where it fails, grey where nothing measures it yet; a red "YOU SAW IT" tab on the rows the
owner already pointed out. Written by pipeline/toon-score.mjs; runs with earshot's Python (Pillow).

    python -I pipeline/lib/toon_scoreboard.py DATA.json OUT.jpg
"""
import json, sys
from PIL import Image, ImageDraw, ImageFont

W, H = 2880, 1620
BG = (250, 247, 240); INK = (43, 26, 23); MUTED = (110, 100, 95)
PASS = ((214, 240, 218), (24, 100, 40)); FAIL = ((250, 212, 208), (170, 30, 25)); NM = ((232, 232, 232), (120, 120, 120))
SAW = (200, 30, 30)


def font(size, bold=False):
    names = (['/System/Library/Fonts/Supplemental/Arial Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else
             ['/System/Library/Fonts/Supplemental/Arial.ttf', 'C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'])
    for p in names:
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def fit(d, text, f, w):
    t = str(text)
    while d.textlength(t, font=f) > w and len(t) > 3:
        t = t[:-2]
    return t if t == str(text) else t[:-1] + '…'


def main():
    data = json.load(open(sys.argv[1])); out = sys.argv[2]
    rows = data['rows']; vids = data['videos']; nv = len(vids)
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    d.text((48, 30), data['title'], fill=INK, font=font(52, True))
    fails = [sum(1 for r in rows if r['cells'][i]['status'] == 'fail') for i in range(nv)]
    passes = [sum(1 for r in rows if r['cells'][i]['status'] == 'pass') for i in range(nv)]
    sub = f"{data['date']}  ·  measured on the FINAL render, the layout log and the script  ·  ref = median of the 20 reference Shorts  ·  " + \
          '   '.join(f"{v['slug']}: {passes[i]} pass, {fails[i]} fail" for i, v in enumerate(vids))
    d.text((50, 98), fit(d, sub, font(26), W - 100), fill=MUTED, font=font(26))
    top = 150; bottom = H - 70
    half = (len(rows) + 1) // 2
    panels = [rows[:half], rows[half:]]
    pw = (W - 48 * 3) // 2
    rh = (bottom - top - 50) // half
    col_v = 138 if nv > 2 else 230
    col_ref, col_pass = 118, 178
    col_m = pw - col_ref - col_pass - col_v * nv - 30
    fh = font(22, True); fm = font(min(25, rh - 20)); fb = font(min(25, rh - 20), True); fs = font(18)
    for k, panel in enumerate(panels):
        x0 = 48 + k * (pw + 48)
        # header
        xs = [x0 + 30, x0 + 30 + col_m, x0 + 30 + col_m + col_ref, x0 + 30 + col_m + col_ref + col_pass]
        heads = ['Measure', 'Ref', 'Pass'] + [v['slug'] for v in vids]
        cx = xs + [xs[3] + col_v * i for i in range(1, nv)]
        for i, h_ in enumerate(heads):
            d.text((cx[i] + 6, top + 12), fit(d, h_, fh, (col_v if i >= 3 else [col_m, col_ref, col_pass][i]) - 10), fill=INK, font=fh)
        d.line([(x0, top + 46), (x0 + pw, top + 46)], fill=INK, width=3)
        area = None
        for j, r in enumerate(panel):
            y = top + 50 + j * rh
            if r['area'] != area:
                area = r['area']
                d.line([(x0 + 30, y), (x0 + pw, y)], fill=(200, 190, 180), width=2)
            if r.get('owner'):
                d.rectangle([x0, y + 3, x0 + 24, y + rh - 3], fill=SAW)
            label = r['measure']
            d.text((xs[0] + 4, y + (rh - 26) // 2), fit(d, label, fm, col_m - 10), fill=INK, font=fm)
            d.text((xs[1] + 4, y + (rh - 26) // 2), fit(d, r['ref'], fm, col_ref - 10), fill=MUTED, font=fm)
            d.text((xs[2] + 4, y + (rh - 26) // 2), fit(d, r['pass'], fm, col_pass - 10), fill=MUTED, font=fm)
            for i, c in enumerate(r['cells']):
                bg, fg = PASS if c['status'] == 'pass' else FAIL if c['status'] == 'fail' else NM
                bx = xs[3] + col_v * i
                d.rounded_rectangle([bx + 4, y + 4, bx + col_v - 4, y + rh - 4], radius=8, fill=bg, outline=SAW if (r.get('owner') and c['status'] == 'fail') else None, width=4)
                txt = c['value'] if c['status'] != 'n/m' or c['value'] not in ('not measured', '-') else 'not yet'
                d.text((bx + 12, y + (rh - 26) // 2), fit(d, txt, fb, col_v - 24), fill=fg, font=fb)
    # legend
    ly = H - 56
    items = [(PASS, 'meets the pass band'), (FAIL, 'fails it'), (NM, 'not measured yet (a later phase adds it)')]
    x = 48
    for (bg, fg), t in items:
        d.rounded_rectangle([x, ly, x + 44, ly + 32], radius=6, fill=bg); x += 56
        d.text((x, ly + 3), t, fill=INK, font=font(24)); x += int(d.textlength(t, font=font(24))) + 40
    d.rectangle([x, ly, x + 24, ly + 32], fill=SAW); x += 36
    t = 'YOU SAW IT: a fault you already pointed out (caption on eyes, bursts on faces, cuts every 2 s)'
    d.text((x, ly + 3), t, fill=SAW, font=font(24, True))
    im.save(out, quality=90)
    print(out)


if __name__ == '__main__':
    main()
