"""Draw the layout log over real frames of a render, to SEE what the layout checks see (engine v9, phase 1, 2026-11-23).

    python -I pipeline/tools/toon-layout-overlay.py VIDEO.mp4 layout.json OUT.jpg T1 T2 ... [--title "..."] [--notes "t=note|t=note"]

Each time gets one frame (1080 x 1920, shown at 405 x 720) with the boxes of that probe: faces red, eyes orange,
mouths pink, heads purple, hands green, tags and labels blue, bursts yellow, the caption white, the watermark cyan.
Runs with earshot's Python (Pillow + numpy).
"""
import json, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

COL = {'face': (230, 40, 40), 'eye': (255, 140, 0), 'mouth': (255, 90, 170), 'head': (150, 60, 220), 'hand': (40, 180, 60), 'tag': (30, 110, 240),
       'label': (30, 110, 240), 'plate': (30, 110, 240), 'fx': (250, 210, 0), 'caption': (255, 255, 255), 'watermark': (0, 210, 230), 'icon': (120, 120, 255), 'body': (90, 90, 90)}


def font(size, bold=True):
    for p in (['/System/Library/Fonts/Supplemental/Arial Bold.ttf', 'C:/Windows/Fonts/arialbd.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'] if bold else
              ['/System/Library/Fonts/Supplemental/Arial.ttf', 'C:/Windows/Fonts/arial.ttf', '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf']):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default()


def frame(path, t):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-ss', f'{t:.3f}', '-i', path, '-frames:v', '1', '-vf', 'scale=1080:1920', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True).stdout
    return Image.fromarray(np.frombuffer(raw[:1080 * 1920 * 3], np.uint8).reshape(1920, 1080, 3)) if len(raw) >= 1080 * 1920 * 3 else Image.new('RGB', (1080, 1920))


def main():
    path, lay, out = sys.argv[1], sys.argv[2], sys.argv[3]
    rest = sys.argv[4:]
    title = ''; notes = {}
    times = []
    i = 0
    while i < len(rest):
        if rest[i] == '--title': title = rest[i + 1]; i += 2
        elif rest[i] == '--notes':
            for part in rest[i + 1].split('|'):
                if '=' in part:
                    k, v = part.split('=', 1); notes[round(float(k), 2)] = v
            i += 2
        else: times.append(float(rest[i])); i += 1
    L = json.load(open(lay))
    probes = L['probes']
    cols = min(4, len(times)); rows = (len(times) + cols - 1) // cols
    tw, th = 405, 720
    top = 90 if title else 20
    sheet = Image.new('RGB', (cols * (tw + 20) + 20, top + rows * (th + 90)), (24, 24, 28))
    d = ImageDraw.Draw(sheet)
    if title:
        d.text((24, 24), title, fill=(255, 255, 255), font=font(36))
    for k, t in enumerate(times):
        p = min(probes, key=lambda q: abs(q['t'] - t))
        im = frame(path, p['t'])
        dr = ImageDraw.Draw(im)
        for it in p['items']:
            if it['kind'] == 'body':
                continue
            c = COL.get(it['kind'], (200, 200, 200))
            dr.rectangle(it['box'], outline=c, width=6 if it['kind'] in ('face', 'caption', 'fx') else 4)
            if it.get('tip'):
                x, y = it['tip']; dr.ellipse([x - 10, y - 10, x + 10, y + 10], fill=c)
        im = im.resize((tw, th))
        x = 20 + (k % cols) * (tw + 20); y = top + (k // cols) * (th + 90)
        sheet.paste(im, (x, y))
        d.text((x, y + th + 8), f"{p['t']:.1f} s  shot {p['shot']}  ({p['kind']})", fill=(255, 255, 255), font=font(22))
        n = notes.get(round(t, 2)) or notes.get(round(p['t'], 2))
        if n:
            d.text((x, y + th + 40), n[:44], fill=(255, 120, 110), font=font(20, False))
    sheet.save(out, quality=88)
    print(out)


if __name__ == '__main__':
    main()
