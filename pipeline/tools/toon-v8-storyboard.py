"""Lays the rendered look v8 scene frames out as 16:9 storyboard sheets (needs Python 3 with Pillow and the Poppins fonts).

    python pipeline/tools/toon-v8-storyboard.py out/toons/scenes-v8 out/toons/scenes-v8/boards
"""
import sys, os, textwrap
from PIL import Image, ImageDraw, ImageFont

SRC, OUT = sys.argv[1], sys.argv[2]
FONTS = os.path.expanduser('~/AppData/Local/Microsoft/Windows/Fonts') if os.name == 'nt' else os.path.expanduser('~/Library/Fonts')  # Poppins, installed for the user
def font(name, size): return ImageFont.truetype(os.path.join(FONTS, name), size)
W, H = 3840, 2160
BG, INK, GREY = '#fbf6ee', '#2b1a17', '#6f625c'
FW = 660; FH = round(FW * 16 / 9); GAP = 60

SHEETS = [
  ('storyboard-rabies-1', 'RABIES · STORYBOARD 1 OF 2', 'The bite, and what Mum does', [
    ('a', 'A · the nerve ending', 'Virus: "You get rabies. Time runs out. Can you stop me before the brain?"'),
    ('b', 'B · the wound', 'Virus: "A stray dog. A little nip. I ride in on its spit. Now, up this nerve!"'),
    ('m2', 'M2 · inside the nerve', 'Virus: "Slowly. Usually two to three months to the brain."'),
    ('c1', 'C1 · kitchen', 'Kid: "It\'s just a little scratch, Mum."'),
    ('c2', 'C2 · kitchen', 'Mum: "Wash it now. Soap and water, fifteen minutes."'),
  ]),
  ('storyboard-rabies-2', 'RABIES · STORYBOARD 2 OF 2', 'The doctor, and the wall', [
    ('d1', 'D1 · clinic', 'Dr. Mira: "Your mum was right. Washing first, then a doctor, today."'),
    ('d3', 'D3 · clinic', 'Dr. Mira: "Act in time and treatment works almost every time."'),
    ('e', 'E · the nerve ending', 'Virus: "A wall? They stopped me before the brain!"'),
    ('m3', 'M3 · between the cells', 'White cell: "Got you! You go no further."'),
  ]),
  ('places-rabies-rooms', 'RABIES · THE PLACES 1 OF 2', 'The two rooms, empty', [
    ('room-kitchen', 'Kitchen', 'Home: sink, stove, round window.'),
    ('room-clinic', 'Clinic', "Dr. Mira's room."),
  ]),
  ('places-rabies-body', 'RABIES · THE PLACES 2 OF 2', 'Inside the body, under the microscope', [
    ('place-wound', 'The wound', 'Under the tooth mark: skin cells, torn muscle fibres.'),
    ('place-junction', 'The nerve ending', 'Where the nerve meets the muscle: the locks.'),
    ('place-axon', 'Inside the nerve', 'The long tunnel to the brain.'),
    ('place-tissue', 'Between the cells', 'Where the white cells patrol.'),
  ]),
]

for name, kicker, title, frames in SHEETS:
    im = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(im)
    d.text((150, 96), 'MEDPEAK TOONS · LOOK V8 · ' + kicker, font=font('Poppins-Bold.ttf', 44), fill=GREY)
    d.text((150, 156), title, font=font('Poppins-ExtraBold.ttf', 92), fill=INK)
    d.text((W - 150, 190), 'Each frame is a full 9:16 video frame. Captions are added by the player.', font=font('Poppins-Medium.ttf', 38), fill=GREY, anchor='ra')
    n = len(frames); total = n * FW + (n - 1) * GAP; x0 = (W - total) // 2; y0 = 420
    for i, (f, label, line) in enumerate(frames):
        x = x0 + i * (FW + GAP); p = os.path.join(SRC, f + '.jpg')
        if os.path.exists(p):
            fr = Image.open(p).convert('RGB').resize((FW, FH), Image.LANCZOS); im.paste(fr, (x, y0))
        else:
            d.rectangle([x, y0, x + FW, y0 + FH], fill='#ffffff'); d.text((x + FW / 2, y0 + FH / 2), 'missing', font=font('Poppins-Bold.ttf', 40), fill=GREY, anchor='mm')
        d.rounded_rectangle([x - 3, y0 - 3, x + FW + 3, y0 + FH + 3], radius=6, outline=INK, width=6)
        d.text((x, y0 + FH + 34), label.upper(), font=font('Poppins-ExtraBold.ttf', 40), fill=INK)
        ty = y0 + FH + 96
        for ln in textwrap.wrap(line, 33):
            d.text((x, ty), ln, font=font('Poppins-Medium.ttf', 36), fill=GREY); ty += 48
    os.makedirs(OUT, exist_ok=True)
    im.save(os.path.join(OUT, name + '.jpg'), quality=92)
    print(name, n)
