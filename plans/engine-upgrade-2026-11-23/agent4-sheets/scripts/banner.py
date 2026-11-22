import sys
from PIL import Image, ImageDraw, ImageFont
src, out, title = sys.argv[1], sys.argv[2], sys.argv[3]
im = Image.open(src).convert("RGB")
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 30)
s = Image.new("RGB", (im.width, im.height + 56), (30, 60, 140))
s.paste(im, (0, 56)); ImageDraw.Draw(s).text((14, 12), title, fill="white", font=f)
s.save(out, quality=88)
