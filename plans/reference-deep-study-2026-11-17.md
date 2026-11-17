# Deep study of the 20 reference Shorts, and the plan to close the gap

**What was read:** all 20 reference videos, **every frame** (36,308 frames). They run at 30 frames a
second, so one frame every 0.033 s is the finest there is; a 0.01 s step would only repeat frames.
Every frame was measured for motion and cuts; every half second for colour, lines and shading.
Then I looked closely at 20 of their frames and at close-ups of their drawing next to ours.
Measured the same way: our rabies preview and the night-brushing video.

Format study only: our characters, drawings, jokes, titles and voices stay our own.

---

## 1. The numbers (every frame)

| Measure | Reference (median of 20) | Rabies preview | Night brushing | What it means |
|---|---|---|---|---|
| Frames where nothing moves | **63%** | 38% | 27% | They hold still. Ours never stops wobbling, breathing, bobbing |
| Frames with small motion | 34% | 61% | 71% | Our motion is constant background noise, not story |
| A cut every | **19.6 s** | 6.6 s | 10.4 s | They stay in one picture three times longer |
| Crisp lines and edges | **8.9%** of the picture | 7.3% | 5.8% | They have more drawn detail and stronger outlines |
| Near-black (outlines) | **3.0%** | 2.1% | 0.9% | Their outlines are black and bold; ours are faint |
| Soft gradients | 5.9% | 8.5% | 7.2% | Ours still has more blur-like softness; theirs is only for depth |
| Brightness (0 to 255) | **153** | 133 | 121 | Their pictures are brighter |
| Colours covering 90% | 67 | **48** | 178 | Rabies is too plain; night brushing too busy |

## 2. What their drawing does (looked at closely)

1. **The organ fills the whole frame.** The camera is inside the body: walls, folds and layers go
   off every edge. You never see an organ floating on a dark background like a diagram. Our arm
   sits in the middle of a dark plum frame, which is exactly the "diagram" look.
2. **Black, hand-drawn outlines.** Every shape has a dark brown-black line, a little uneven, thicker
   on the outside of a shape than inside. This is the single biggest difference. Ours are thin lines
   in a darker shade of the fill, so everything melts into clip-art.
3. **Faces are just eyes.** A body character is the anatomy itself plus two big white eyes (a black
   circle, a black dot, no shine, no iris, often touching), and a tiny mouth line. No eyebrows, no
   blush, no cheeks. The face is small on a big organ. Ours are mascot faces: big, polished, blush,
   eyebrows.
4. **Depth inside tissue.** Tubes and cavities darken toward their walls (a soft dark-red band inside
   the outline), the lining has a lighter band, fat pads are irregular pale blobs, wet spots catch a
   little light. Flat colour, but with these depth bands. Ours is flat pink with stripes.
5. **Real anatomy, organic shapes.** Uneven, fleshy outlines; layers shown as nested thick borders
   (wall, lining, cavity); bone and fat in their real colours. Ours is geometric (straight tubes,
   perfect circles, round-ended sticks for fingers).
6. **One muted colour family per scene:** salmon, coral, maroon, cream. Ours mixes saturated purple,
   teal, bright yellow.
7. **Small labels in plain white boxes** with a black border and black text, placed on the anatomy
   (TRACHEA, VEIN). Captions are one word, mid-frame, white with a dark outline.
8. **Real-world objects drawn the same way:** a hand, a pill, a vape, a phone, all with black outlines
   and the same muted shading, so the outside world belongs to the same picture.

## 3. Why ours looks cheap (the honest list)

- Thin coloured outlines instead of bold dark ones.
- Mascot faces instead of eyes on anatomy.
- Shapes made of circles, rectangles and straight tubes.
- Scenes framed as diagrams with empty background around them.
- Constant idle motion, so nothing feels deliberate.
- Too many quick cuts.
- Colours from different families in one picture.

The "clean 2D" change made on the Windows PC (pull request #5) removed glare, blur and limbs. That was
right, but it removed things without adding what the reference has: bold lines, eyes-only faces,
tissue depth and frame-filling anatomy. So the pictures got emptier, not better.

---

## 4. The plan

### Step 1: one look sheet, before anything else (no video)
I redraw **one scene, the arm for rabies, as a single finished still** in the new look, plus the
virus and the dog. You approve or reject the look on that one picture. Nothing else moves until you
say yes.

### Step 2: the engine changes behind that picture (one place, every scene follows)
| Change | Where | Setting |
|---|---|---|
| Bold dark outlines with a slight hand-drawn variation | `style.ts`, `ink.tsx` | `outline: 'ink'`, about 5 px, colour near-black brown |
| Eyes-only faces for body characters: black ring, black dot, no shine, tiny mouth | `rig.tsx` | `face: 'eyes'` |
| Tissue depth: a dark band inside every wall, a light lining band, irregular fat pads | a new `tissue.tsx` | used by every stage |
| Scenes fill the frame: the camera is inside the organ, layers run off every edge | each stage | a rule in the stage check |
| One colour family per scene | `style.ts` palettes | warm flesh, cream, maroon |
| Labels as white boxes with black text on the anatomy | `props.tsx` | replaces the teal pills |
| Hold still: no idle wobble on organs; motion only when the story moves | `style.ts`, stages | `breathe: 0`, no bobbing |

Every old setting stays one switch away, as before.

### Step 3: a "look" check, measured like the reference
A new check measures our render the same way I measured theirs and fails it when it is far off:
still frames at least 55%, a cut no more often than every 12 s, near-black outline at least 2.5%,
crisp edges at least 7.5%, brightness at least 140. The reference numbers become our targets.

### Step 4: the rabies video in the new look
Only after your yes on step 1: the arm, the kitchen and the clinic in the new look, then the silent
preview, then the sheet with the voice quote. The script and sources stay as they are.

### Step 5: the rest of the cast and stages
The stomach, tooth and food pipe stages and the people, one board at a time, each shown to you.

## 5. Honest limits

- Their line is drawn by hand; ours is drawn by code. I can make it uneven and lively, but it will be
  steadier than a hand. You will judge on the look sheet whether that is close enough.
- If, after step 1, code-drawn still is not good enough for you, the other road is a different
  drawing method (for example pictures made outside the code), which you rejected before and which
  costs credits. I will not take that road without asking.
