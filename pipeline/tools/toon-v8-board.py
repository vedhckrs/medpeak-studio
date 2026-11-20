"""Lays a finished video's storyboard frames (frames.json from pipeline/toon-v8-board.mjs) out as 16:9 sheets.

    python pipeline/tools/toon-v8-board.py <frames.json> <out dir>
Six frames a sheet, each with its time, shot, speaker and line. Poppins if installed (Windows or macOS user fonts),
else DejaVu (Linux), else Pillow's default font.
"""
import json, os, sys, textwrap
from PIL import Image, ImageDraw, ImageFont

src, out = sys.argv[1], sys.argv[2]
data = json.load(open(src, encoding='utf-8'))
DIRS = [os.path.expanduser('~/AppData/Local/Microsoft/Windows/Fonts'), os.path.expanduser('~/Library/Fonts'), '/usr/share/fonts/truetype/dejavu']
def font(bold, size):
    for d in DIRS:
        for n in (['Poppins-Bold.ttf', 'DejaVuSans-Bold.ttf'] if bold else ['Poppins-Medium.ttf', 'DejaVuSans.ttf']):
            p = os.path.join(d, n)
            if os.path.exists(p): return ImageFont.truetype(p, size)
    return ImageFont.load_default()
BG, INK, GREY, TEAL = '#fbf7f0', '#2b1a17', '#6f625c', '#33b7a5'
FW, FH, PER = 270, 480, 6
frames = data['frames']
sheets = [frames[i:i + PER] for i in range(0, len(frames), PER)]
for n, group in enumerate(sheets, 1):
    S = Image.new('RGB', (1920, 1080), BG); d = ImageDraw.Draw(S)
    d.rectangle([0, 0, 1920, 10], fill=TEAL)
    d.text((56, 28), f"{data['title'].upper()} · STORYBOARD {n} OF {len(sheets)}", fill=TEAL, font=font(True, 22))
    d.text((56, 58), 'Frames from the finished video, in order', fill=INK, font=font(True, 40))
    x0 = (1920 - (PER * FW + (PER - 1) * 34)) // 2
    for i, f in enumerate(group):
        x = x0 + i * (FW + 34); y = 140
        im = Image.open(f['file']).resize((FW, FH))
        S.paste(im, (x, y)); d.rectangle([x - 1, y - 1, x + FW, y + FH], outline=INK, width=3)
        d.text((x, y + FH + 14), f"{f['at']:.1f} s", fill=TEAL, font=font(True, 20))
        d.text((x, y + FH + 40), f['title'], fill=INK, font=font(True, 18))
        for j, line in enumerate(textwrap.wrap(f['text'], 30)[:6]):
            d.text((x, y + FH + 68 + j * 24), line, fill=GREY, font=font(False, 17))
    S.save(os.path.join(out, f'storyboard-{n}.jpg'), quality=92)
    print(os.path.join(out, f'storyboard-{n}.jpg'))
