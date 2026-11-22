"""Small helpers: contact sheets and crop sheets. Run with earshot python."""
import sys, os, json, glob
from PIL import Image, ImageDraw, ImageFont

FONT = None
for p in ["/System/Library/Fonts/Supplemental/Arial Bold.ttf", "/System/Library/Fonts/Helvetica.ttc"]:
    if os.path.exists(p):
        FONT = p; break

def font(sz):
    return ImageFont.truetype(FONT, sz)

def contact(paths, out, cols=10, w=216, labels=None):
    ims = [Image.open(p) for p in paths]
    h = int(w * ims[0].height / ims[0].width)
    rows = (len(ims) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * w, rows * (h + 22)), "white")
    d = ImageDraw.Draw(sheet)
    for i, im in enumerate(ims):
        x, y = (i % cols) * w, (i // cols) * (h + 22)
        sheet.paste(im.resize((w, h)), (x, y + 22))
        d.text((x + 3, y + 2), labels[i] if labels else os.path.basename(paths[i]), fill="black", font=font(16))
    sheet.save(out, quality=85)

def crops(spec, out, cell=520, cols=4, title=None):
    """spec: list of (path, (x0,y0,x1,y1), label). Each crop scaled to fit cell x cell (upscale allowed)."""
    rows = (len(spec) + cols - 1) // cols
    top = 60 if title else 0
    sheet = Image.new("RGB", (cols * cell, top + rows * (cell + 50)), (245, 245, 245))
    d = ImageDraw.Draw(sheet)
    if title:
        d.text((12, 12), title, fill="black", font=font(32))
    for i, (p, box, lab) in enumerate(spec):
        im = Image.open(p).crop(box)
        s = min(cell / im.width, cell / im.height)
        im = im.resize((max(1, int(im.width * s)), max(1, int(im.height * s))), Image.LANCZOS)
        x, y = (i % cols) * cell, top + (i // cols) * (cell + 50)
        sheet.paste(im, (x + (cell - im.width) // 2, y + 46))
        d.text((x + 6, y + 6), lab, fill="black", font=font(22))
    sheet.save(out, quality=88)

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "contact":
        out, cols, w = sys.argv[2], int(sys.argv[3]), int(sys.argv[4])
        paths = sys.argv[5:]
        contact(paths, out, cols, w)
    elif cmd == "crops":
        spec = json.load(open(sys.argv[2]))
        crops([(s[0], tuple(s[1]), s[2]) for s in spec["items"]], spec["out"], spec.get("cell", 520), spec.get("cols", 4), spec.get("title"))
