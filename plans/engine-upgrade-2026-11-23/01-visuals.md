# Engine upgrade study 1 of 5: visuals, colours, scenes, blueprint

Date: 2026-11-23. Study only: no code changed, nothing committed, no money spent.

**What I looked at.** All 20 reference Shorts (10 frames each as contact sheets, plus 14 frames at full
size and the first frame of every one) and our four videos (creatine, quit-sugar, fasting, snake-bite;
15 frames each, plus 13 frames at full size). I also measured colour on one frame per second of every
video (brightness, saturation, colour families, dark line share, line thickness) and how long each
video stays inside the body.

**The pictures.** All sheets are in `plans/engine-upgrade-2026-11-23/agent1-sheets/`:

| Sheet | Shows |
|---|---|
| `01-hero-stomach-ref20-vs-fasting.jpg` | The clearest single comparison: their stomach and ours |
| `02-organ-frames.jpg` | Whole-organ frames: ref 05, ref 02, our two livers |
| `03-micro-places.jpg` | Small-scale places: ref 13, ref 10, our snake-bite and creatine |
| `04-rooms-and-people.jpg` | Rooms and humans: ref 05, ref 12, our snake-bite and creatine |
| `05-cutaways-and-labels.jpg` | Side cutaways and labels: ref 03, ref 08, our quit-sugar |
| `06-line-and-face-closeups.jpg` | Line and faces at close range |
| `07-first-frames-ref-01-to-20.jpg`, `08-first-frames-ours.jpg` | Frame 0 of every video |
| `ref-01.jpg` .. `ref-20.jpg`, `ours-*.jpg` | Ten (ours: fifteen) frames across each video |
| `colour-measurements.json` | The raw numbers |

**The short answer.** Our line, our eyes, our brightness and our overall colour numbers are now close
to the references. The gap is no longer "how it is drawn". The gap is **what is drawn**: they put the
organ in its real place inside the body, surrounded by its neighbours, with things happening inside it,
in one warm colour family, and they stay there. We put a well-drawn mascot on a flat coloured
background with gauges and labels around it, and we cut away every few seconds.

---

## Part A. The numbers

Story only (our end cards are left out). "Ref" is the median of the 20.

| Measure | Ref median | Ref range | creatine | quit-sugar | fasting | snake-bite |
|---|---|---|---|---|---|---|
| Brightness (0-255) | 149 | 114-208 | 161 | 147 | 141 | 155 |
| Saturation (0-1) | 0.36 | 0.14-0.46 | 0.34 | 0.33 | 0.40 | 0.38 |
| Picture that is red/pink/salmon | **67%** | 46-88% (inside-body videos) | 48% | 55% | 48% | 51% |
| Picture that is blue | 2% | 0-25% | 10% | 18% | **25%** | 4% |
| Picture that is purple | 0% | 0-0.6% | 0% | 0% | **18%** | 0% |
| Picture that is green | 0.5% | 0-15% | 1% | 0% | 0% | **22%** |
| Time inside the body | **72%** | 51-100% | 42% | 63% | **29%** | 44% |
| Body/room switches in the story | **1** | 0-5 | 7 | 9 | 4 | 6 |
| First time they leave the body | **44 s** | 12-74 s | 0 s | 0 s | 1.5 s | 2 s |
| Room saturation | **0.17** | 0.12-0.35 | 0.30 | 0.29 | 0.36 | 0.33 |
| Room brightness | **180** | 110-210 | 166 | 130 | 128 | 171 |
| Outline thickness (px at 1080 wide) | 5 | 3-7 | 5-6 | 5-6 | 6-**12** | 5 |
| One eye, width in px (organ frames) | 115 | 90-190 | 150 | 150-220 | **270** | 60-110 |

What the numbers say: outline, brightness and saturation need no more work. Colour family, time in
the body, room colour and eye size are where we differ.

---

## Part B. Findings

### 1. The organ lives in its place. Ours floats on a flat colour. (The biggest gap.)

**(a) References.** Every body shot is a cutaway of the real region, and it runs off all four edges.
Ref 20 at 3 s: the stomach with the liver behind it (dark red), the food pipe coming down from the
top, the yellow bile duct, the gut below in two pink tones, and a dull brown-mauve body cavity in the
gaps (`#a6706e`). Ref 02 at 3 s: two lungs, the windpipe with rings, the rib cage curve, the
diaphragm. Ref 03 at 2 s and ref 08 at 23 s: a side cut through the throat with spine bones, tongue,
palate. Ref 05 at 4 s, ref 10 at 3 s, ref 11 at 2 s, ref 13 at 5 s, ref 19 at 4 s: the same stomach
region each time. No reference frame has an empty flat background inside the body. See sheets 01, 02
and 05.

**(b) Ours.** Fasting at 11 s: the stomach on a flat orange field (`#f6ad69`) with a small brain
hanging beside it and a "BRAIN" label. Fasting at 20 s: the liver on flat teal with a fuel gauge.
Fasting at 41 s: the brain on flat lilac. Snake-bite at 7 s: drops in a tube made of large plain
circles. Quit-sugar at 24 s is our best one (ribs above, gut below, vessels under the liver) and it is
visibly closer to the references than anything in fasting; quit-sugar at 15 s (the mouth) is also good.

**(c) Why it matters.** The surroundings are what makes a viewer feel "I am inside a body". A flat
colour reads as a diagram or a mascot sticker, and it is the main reason our frames look emptier and
cheaper even though each character is drawn well. It also wastes the frame: about 40% of fasting
11 s is plain orange.

**(d) Engine change.** Build a set of **anatomy stages** in a new file `src/toons/v8/anatomy.tsx`,
each one a full 1080 x 1920 place with three planes, used by every whole-organ frame. `LiverFull`,
`MouthFull` and `BrainFull` in `sugar-organs.tsx` are the starting pattern; `StomachFull` in
`fast-art.tsx` and the `PLACE` flat colours (`stomach: '#f7ad6a', liver: '#6cc3bd', brain: '#ab9ce4'`)
are what gets replaced.

- Stages to build first (they cover 15 of the 20 references): upper belly (stomach, liver, bile duct,
  gut, spleen edge), chest (lungs, windpipe, heart, ribs, diaphragm), throat side-cut (tongue, palate,
  windpipe, food pipe, spine), skull side-cut for the brain, a vessel seen from inside, a tissue wall
  with a floor (for cell and germ scenes), skin in section (surface, fat, muscle).
- Rule for the look check: inside a body shot, **no flat field larger than 12% of the frame** that is
  not tissue, and **at least three different neighbour structures** visible besides the hero.
- Target colours for the gaps between organs: `#a6706e` (mid) and `#7f5956` (deep), taken from refs
  20 and 02. Never orange, teal or lilac.

### 2. One warm colour family inside the body; pale, quiet rooms outside.

**(a) References.** Inside the body, 67% of the picture is red/pink/salmon, and almost everything else
is cream, yellow fat or the white of the eyes. Blue, green and purple appear only as a small accent on
an intruder (the green bile bag in ref 05, the green germ in ref 13 at 25 s, the blue glove in ref 17).
That is why the intruder pops. Rooms are the opposite: pale and low in colour (ref 12 at 60 s wall
`#f1fbfb`; ref 05 at 56 s is the most coloured, a grey-blue `#709ab3`), saturation about 0.17,
brightness about 180. So the two worlds never get confused and the body always looks richer.

**(b) Ours.** Fasting: 25% blue and 18% purple (the purple living room, the teal and lilac organ
backgrounds). Snake-bite: 22% green (the park). Our rooms are almost as saturated as our body shots
(0.29-0.36 against 0.34-0.47) and darker than theirs (fasting room brightness 128, quit-sugar 130).

**(c) Why it matters.** With a single warm family, the eye goes straight to the white eyes and to the
one odd-coloured thing in the frame. With four families, nothing leads. Dark, saturated rooms also
fight the characters standing in them (fasting 7 s: purple cardigan on a purple wall).

**(d) Engine change.**
- `kit.tsx`: extend `FLESH` with the measured reference tones: cavity `#a6706e`, deep cavity
  `#7f5956`, organ red `#aa4148`, wall rim `#c04355`, wall `#ec8391`, gut `#cd717f`, gut shade
  `#a34757`, fat `#f6db87`, bile `#e9ce80`, bone/pale `#f4e4d5`. Add a `ROOM` palette of pale walls
  (`#f1fbfb`, `#e9eef2`, `#f3efe6`, `#dfe9f1`, grey-blue `#9db8c9` as the darkest allowed).
- Delete the per-place flat colours (`PLACE` in `fast-art.tsx`, `SNAKE_PLACE.leg`).
- Look check (`toon:look`): inside-body shots at least **60% warm**, any other single colour family
  at most **8%**; room shots saturation at most **0.22**, brightness at least **165**; a person's
  main clothing colour must differ from the wall by a clear step (no purple on purple).

### 3. The organ shows what is happening inside it. Ours tells it with gauges and text.

**(a) References.** The story is painted on the organ. Ref 05 at 4 s: the stomach is cut open and full
of burgers, eggs and drumsticks, and it stirs them with a stick. Ref 20 at 3-40 s: see-through orange
acid over the food, then green gas at 50 s. Ref 11 at 2-14 s: cola pours down the food pipe and the
level rises. Ref 02 at 3-33 s: the black lung is cut off with a scalpel and lifted onto a steel tray.
Ref 01 at 28-33 s and ref 09 at 30 s: soft red swelling and pale sores on the tissue. Ref 13 at
44 s: a red wound. Ref 17 at 33 s: dark infected patches.

**(b) Ours.** Fasting at 20 s: the liver's sugar store is shown as a dashboard gauge ("E SUGAR F"), a
"FAST 12h" clock badge and a yellow "ABOUT 12 HOURS" plate; at 24 s it is a cartoon furnace with a
lever. Creatine at 2 s: "+2 KG" plate. Snake-bite at 7 s: "OVER 5 MILLION A YEAR" plate. Quit-sugar is
again our best: fat blobs on the liver shrink (24-28 s) and taste buds light up (58 s).

**(c) Why it matters.** A viewer understands a full stomach or a red sore in a quarter of a second
with the sound off. A gauge has to be read. The references carry no numbers on the picture at all:
the only words are the caption, a small anatomy label and the watermark.

**(d) Engine change.**
- In `anatomy.tsx`, every organ takes **state props that change the drawing**: `fill` (0-1 level of
  contents), `contents` (food, liquid colour, gas), `damage` (redness, sores, dark patches), `cut`
  (a window in the wall). Build a `Cutaway` piece: a hole in the organ wall that shows the inside,
  with the wall thickness visible (see finding 4), and a see-through `Liquid` layer (flat colour at
  55-65% opacity with a few white wave lines, as ref 20).
- A small kit of **body damage marks** in `kit.tsx`: `Sore`, `Swelling`, `Wound`, `Patch`.
- Script rule for the skill (`toons-script.md`, `toons-blueprint.md`): a number may appear as a
  plate at most **once** per video; clocks, gauges and meters are allowed only as real objects in a
  room (a wall clock), never inside the body.

### 4. Walls have thickness, and tissue has folds. Ours is one fill and one line.

**(a) References.** A hollow organ is drawn as two lines with a darker band between them: ref 20's
stomach wall is a `#c04355` band about 18-25 px wide between the black outline and the pink inside
(`#ec8391`), with small dark dashes in it; ref 05 at 4 s shows the cut wall as a pale lip. Big
surfaces carry a few long, loose fold lines and short wrinkle marks near the face (ref 20 forehead,
ref 02 dark lung, ref 13 at 25 s tissue curtain behind the guard). Guts are scalloped lobes in two
tones with a white highlight line (refs 05, 19, 20 bottom of frame). Bone and fat are cream with
dots (ref 03, ref 08).

**(b) Ours.** `Shape` in `kit.tsx` gives one fill, one crescent shadow and one outline. Fasting
11 s: the stomach is a smooth pink bean with white gloss streaks (which our own rule 2 forbids) and no
wall. Snake-bite 7 s: the vessel is a plain red strip and the tissue is large empty circles.
Creatine 16 s (muscle fibres with stripes) and quit-sugar 24 s (gut loops) show we can do it.

**(c) Why it matters.** The wall band and the folds are what make the shape read as flesh. They are
also where most of the reference's "detail" sits, without making the frame busy.

**(d) Engine change.** Add to `kit.tsx`:
- `Wall`: a closed or open path drawn as outline + inner rim band (default 20 px at 1080 wide,
  colour `shade(fill, 0.28)`) + optional pale lining line. Used for every hollow organ and tube.
- `Folds`: seeded long fold lines and short wrinkle ticks inside a shape (thin line, `IN`), count
  set by area: about one fold per 150 x 150 px, none within 60 px of the face.
- `Lobes`: a scalloped strip in two tones with a white highlight line, for gut, brain and fat.
- `Speckle`: sparse dots for bone and fat.
- Remove the white gloss streaks from `StomachFull`; allow only one short pale highlight line per
  organ (the references do use one, e.g. ref 05 top of stomach).

### 5. Face size and placement: theirs are small and high on the organ. Ours are getting too big.

**(a) References.** One eye is 90-120 px wide in most organ frames (ref 20: 118 px; ref 02: about
95 px; ref 05: about 110 px), up to 150-190 px only when the whole frame is the character's face
(ref 10 stomach, ref 14 womb, ref 01 toe). Eyes sit in the top third of the organ and usually in
the top 40% of the frame; they touch; the pupil is a small dot (about 15% of the eye) that looks at
the other character. The mouth is a short thin line, 40-70 px, and it is often missing. Brows are two
thin arcs floating above the eyes. No teeth grids.

**(b) Ours.** Fasting 11 s: each eye is 270 px wide (a quarter of the frame each), the mouth is a
gritted-teeth box, and the caption word "MEAL" lands on the eyes. Quit-sugar 11 s (brain): eyes
about 220 px. Livers: about 150 px, which is fine. Snake-bite drops: 60-110 px, fine.

**(c) Why it matters.** Big eyes with angry lids and a teeth box turn the organ into a mascot or an
emoji; the charm of the references is a real-looking organ with a tiny, dry face. And when the face is
that big, the caption has nowhere to sit.

**(d) Engine change.**
- `sugar-organs.tsx`, `fast-art.tsx`, new `anatomy.tsx`: one eye **100-170 px** wide in the final
  frame for an organ, never above 190 px; face centre above y 800; mouth width at most 0.6 of one eye.
- `kit.tsx` `Mouth`: retire `grit` for organs (keep for people); default organ mouths to `flat`,
  `smile`, `frown`, `o`.
- Look check: fail a frame when the caption box overlaps an eye (fasting 11 s would fail).
- The camera may not push in on an organ past the point where one eye is 190 px (see finding 6).

### 6. Line: ours matches at rest but doubles when the camera pushes in.

**(a) References.** Black line, 5 px typical (3-7 px), the same in every shot, slightly uneven by
hand. Thinner inner lines for folds. Rooms use a slightly thinner line (3-4 px).

**(b) Ours.** At rest we are the same: 5-6 px (snake-bite 7 s, quit-sugar 24 s, creatine 16 s). But in
fasting at 11 s the line is 9-12 px, because the camera zoom scales the whole drawing and the line
with it (sheet 06, fourth crop). Our ink is dark brown `#2b1a17` against their pure black; at phone
size this difference does not show and needs no change.

**(c) Why it matters.** A line that changes weight between shots breaks the "one hand drew this"
feeling, and the fat line is part of why fasting 11 s looks like a sticker.

**(d) Engine change.** `video.tsx` (camera) and `kit.tsx` (`OUT`, `IN`): pass the camera scale down
(a context value) and divide stroke width by it, so the line stays 5-6 px on screen at any zoom, with
a floor of 4 px and a ceiling of 7 px. Look check: outline thickness median between 4 and 7 px on
every shot, not only on average.

### 7. Stay in one place, then one doctor scene. We jump about.

**(a) References.** They open inside the body and stay there, in one place or two, for a median of
44 seconds, then cut once to a pale room where a doctor explains to the patient (refs 02, 04, 05, 06,
09, 10, 12, 13, 17, 19, 20). A few show the person briefly in the middle (ref 07 at 39 s, ref 14,
ref 16). The body picture changes slowly: the same framing with new things entering it.

**(b) Ours.** We open on a person in a room (all four videos, 0-2 s) and switch between body and
room 4 to 9 times. Fasting spends only 29% of its story inside the body. Every switch is also a
switch of colour family (purple room, orange stomach, teal liver, lilac brain).

**(c) Why it matters.** Holding one rich place lets the viewer settle and watch the acting. It also
means one place can be drawn with far more care, because it is on screen for 40 seconds, not 6.

**(d) Engine change.** This is mostly for the script and blueprint (agents after me), but the engine
side is: a body stage must be built to **hold for 20 s or more**, with slots for things to enter
(top tube, side, a cut window) and state props that change over time, so the shot stays alive
without a cut. Target in `toons-blueprint.md`: inside the body at least **60%** of the story, at most
**3** body/room switches. Note: the owner chose a person-first hook on 2026-11-21, so the opening
person shot stays; the change is what happens after it.

### 8. Intruders are real objects, drawn at true scale, entering the body.

**(a) References.** The thing that causes the trouble comes in from outside and is drawn like a real
object, bigger than the characters: a nail clipper with a face (ref 01), an ultrasound probe on a
cable and a scalpel and tray (ref 02 at 9-33 s), a white pill stuck in the food pipe (ref 09), a
gloved surgeon's hand (ref 17), a hair trimmer and a real hand (ref 15), a spoon and a newspaper held
by the stomach (ref 19), fingers squeezing a spot (ref 18 at 35 s). Several get eyes.

**(b) Ours.** Our intruders are invented mascots of the same size as everything else: a sugar cube
with arms, coloured venom drops, a fat blob, a battery. They are well drawn, but there is no size
contrast and no real-world object crossing into the body.

**(c) Why it matters.** A real, recognisable object inside the body is the "what am I looking at?"
moment that stops the scroll, and the size contrast gives the frame a clear big-medium-small order.

**(d) Engine change.** `props.tsx` already draws real objects. Add an `Intruder` wrapper that (1)
places a prop so it enters from a frame edge and overlaps the organ, (2) can add the kit `Eyes` to it,
and (3) scales it to **30-60% of the frame height**. Blueprint rule: every video names one real
object that enters the body.

### 9. Small-scale places: theirs are a wall, a floor and a horizon. Ours are abstract.

**(a) References.** When they go down to cells and germs, the place is still a simple, readable
stage: a tissue curtain with long fold lines behind, a darker ceiling band, and a pink floor the
characters stand on, with one soft shadow under each (ref 13 at 25 s; ref 12 at 4 s). Ref 10 at 23 s
adds a soft, slightly blurred background of pale vessels, which pushes the characters forward. Ref 11
at 20 s (the vein) is a side view of a tube with a soft lighter centre. So they do use a little soft
gradient and blur, but only in the far background.

**(b) Ours.** Snake-bite 7 s: characters float in front of big outlined circles with two spotlights
at the top; there is no floor and nothing to stand on. Creatine 16 s is stronger (the characters stand
on a muscle fibre), and it reads better for that reason.

**(c) Why it matters.** A floor gives weight, lets characters walk and fall, and makes depth without
effort. Floating characters look pasted on.

**(d) Engine change.** `scenes-body.tsx` / `micro3.tsx`: add a standard `TissueStage` (ceiling band,
folded curtain wall, floor with a lighter top edge, contact shadow under every character as a flat
dark ellipse at 25% opacity). Allow **one** soft element per body shot: a far-background gradient or
blur layer behind the wall. This needs the owner's word, because rule 2 of look v8 says no gradients
and no blur; the references do use it, sparingly, in refs 01, 09, 10, 11 and 13.

### 10. Job characters: theirs are little people in uniform. Ours are shapes with arms.

**(a) References.** The body's workers are stubby human figures, about two heads tall, in a full
costume: the grey-capped guard with a moustache, tie and "STOP" sign who plays GABA in ref 10 and the
vessel guard in refs 12 and 13; he picks up a phone, flexes, gets beaten up. Chemicals are soft eggs
with a paper band label round the body ("CORTISOL", "ADRENALINE", ref 10 at 23 s). Germs are one bright
flat colour with knobs (ref 13).

**(b) Ours.** Cells and chemicals are their own shape with thin arms and legs and one prop (drops,
cubes, a Y-shaped antibody, a battery). Clear and consistent, but they can only wave, point and
stand.

**(c) Why it matters.** A little person in uniform can act a whole scene (stop, argue, call for help,
faint), and the viewer knows his job without a label.

**(d) Engine change.** Add a **mini-person rig** to `cells.tsx` (two heads tall, the kit eyes,
real hands from `people-rig.tsx` at small size, swappable hat, uniform colour and held prop): guard,
cleaner, firefighter, courier, builder. Add a `BandLabel` (a paper band wrapped round a body, text
following the curve) to `kit.tsx` beside `NameTag`.

### 11. Labels and text on the picture.

**(a) References.** One or two anatomy labels per place, in a white box with a thin black border and
plain black capitals, placed on the tissue, often slightly tilted, and they **stay for the whole
shot** (ref 03 "TRACHEA", "ESOPHAGUS", "EPIGLOTTIS"; ref 06 "OVARIES"; ref 12 "INTRAVASCULAR SPACE";
ref 09 "Esophagus"). Captions are one word, white with a black outline, around y 1480-1500 of 1920,
about 60-75 px tall. Nothing else: no plates, no badges, no meters.

**(b) Ours.** Label boxes with a drawn arrow, held 2.5 s, plus yellow number plates, clock badges,
calendars and gauges. Fasting 20 s has four separate pieces of text on screen at once (clock badge,
gauge letters, plate, caption).

**(c) Why it matters.** Each extra text element takes attention from the face. Their frames are calm
because the picture explains itself.

**(d) Engine change.** `hud.tsx`: add a `stay` option to `CharTag` so a place label can remain for
the shot, without the arrow, set on the tissue. Look check: at most **2** text elements on screen
besides the caption and watermark. (The 2.5 s name tag for a new character stays, as the owner set.)

### 12. Rooms and people.

**(a) References.** The doctor scene is nearly the same in every video: a pale wall, a floor line, one
door, one or two framed things on the wall, and two or three people filling the lower 55-60% of the
frame (ref 05 at 56 s, ref 12 at 60 s, ref 13 at 82 s, ref 19 at 44 s). People are about 3 to 3.5
heads tall with big heads (a head is about 190-220 px wide in a two-person shot), pale skin, the same
round eyes, a simple nose, flat clothes with very few fold lines. The doctor is one fixed character
(white hair, glasses, green mask, green tie, white coat, clipboard). The patient shows the symptom
(holding his throat, a red cheek, a wound on the foot).

**(b) Ours.** People are 4 to 4.5 heads tall, with detailed clothes, real hands and varied skin
tones; they are better drawn than the references' people. Rooms are more saturated and darker
(finding 2), and sometimes more detailed than they need to be (snake-bite's park at 2 s and 23 s is
five greens with large leaf shapes behind the heads).

**(c) Why it matters.** Our people are a strength, but in a wide two-person shot their heads come out
smaller (about 150 px wide in creatine 42 s) so the faces read less well on a phone, and the busy,
coloured rooms compete with them.

**(d) Engine change.** `scenes-rooms.tsx`: keep the rig, but frame two-person shots tighter so a head
is **at least 190 px wide** (`PEOPLE_SCALE` 3.2 becomes about 4.0, cropping at the knees is fine:
refs 06, 12 and 18 do exactly this). Rooms use the pale `ROOM` palette, at most **5 props**, nothing
with strong colour behind a head. Consider one fixed "doctor's room" used in every video, as they do.

### 13. First frame and cover.

**(a) References.** 17 of 20 open inside the body on a full, warm cutaway with eyes already on screen
(sheet 07). The frame is full edge to edge and would work as a cover with no title on it.

**(b) Ours.** Creatine and quit-sugar open on a person in a dark teal room; fasting and snake-bite
open on a body frame, but with the flat orange field and the empty circles (sheet 08).

**(c) Why it matters.** In the Shorts feed the first frame is the advert. Side by side on sheets 07
and 08, theirs look like one channel; ours look like four.

**(d) Engine change.** The owner set a person-first hook, so this is his call. Two options that keep
his rule: (1) the person is on screen for the first second only and the dive into the body finishes by
1.5 s; or (2) frame 0 is a split or cutaway that shows the person's outline with the organ inside it.
Either way the cover frame for the upload should be the best whole-organ frame from a stage in
finding 1.

---

## Part C. Things the references do that we do not do at all

1. Show the organ's neighbours and the body cavity in every body shot (finding 1).
2. Cut a window in an organ to show what is inside (ref 05 at 4 s; ref 20).
3. See-through liquid with things floating in it (ref 20, ref 10, ref 12 at 28 s).
4. Remove or change a body part on screen (the lung cut out in ref 02 at 27-33 s).
5. Real tools and hands entering the body at true size (finding 8).
6. Thought bubbles that hold another organ, so two places share one frame (ref 05 at 11 s, ref 10
   at 10 s). We have one in snake-bite at 27 s; it works and should be standard.
7. Little uniformed worker characters (finding 10) and band labels round a body.
8. Soft red swelling and soft background blur as the only soft elements (finding 9).
9. A plain black "FEW MOMENTS LATER" card as a time jump (ref 20 at 45 s).
10. A fixed doctor and a fixed doctor's room in every video.

## Part D. What we already do well (keep)

1. **The line and the eyes.** Outline weight, ink colour and the round touching eyes now match the
   references at rest (sheet 06).
2. **People.** Our rig has real hands, noses, clothing detail and a mixed, global cast; theirs are
   one pale family with stiff poses. Ours are clearly better.
3. **Quit-sugar's whole-organ frames** (liver at 24 s, mouth at 15 s and 58 s) already follow most of
   findings 1, 3 and 4. They are the model for the rest.
4. **Creatine's muscle and kidney places** (16 s, 29 s): textured, readable, characters standing on
   something.
5. **Captions.** Clean, one word, key word in yellow; easier to read than the references' mix of fonts.
6. **The end card and the watermark.** The references have no end card at all; ours is a clear,
   branded finish.
7. **Consistency of the kit.** One shared kit means any fix below reaches every video.
8. **60 frames a second** and a clean, sharp render; theirs are 30 and a little soft.

---

## Part E. Top 10 visual upgrades, ranked

| # | Upgrade | Where | Target |
|---|---|---|---|
| 1 | Anatomy stages: every organ frame shows the organ in its real region, edge to edge | new `anatomy.tsx`; replaces `StomachFull` and `PLACE` in `fast-art.tsx`; extends `sugar-organs.tsx` | No flat non-tissue field over 12% of the frame; 3 or more neighbour structures |
| 2 | One warm colour family in the body, pale quiet rooms | `kit.tsx` (`FLESH` additions, new `ROOM`), look check | Body shots 60%+ warm, any other family 8% or less; rooms saturation 0.22 or less, brightness 165+ |
| 3 | The organ's state is drawn on the organ: contents, liquid level, cut window, damage | `anatomy.tsx` state props; `Cutaway`, `Liquid`, `Sore`, `Swelling`, `Wound` in `kit.tsx` | Zero gauges or meters inside the body; one number plate per video at most |
| 4 | Wall thickness, folds, lobes, speckle | `Wall`, `Folds`, `Lobes`, `Speckle` in `kit.tsx` | Rim band about 20 px; about one fold per 150 x 150 px; no gloss streaks |
| 5 | Smaller, higher faces; no teeth-grid mouths on organs | `kit.tsx` (`Eyes`, `Mouth`), all organ files | One eye 100-170 px, never over 190 px; face above y 800; caption never on an eye |
| 6 | Line weight constant under camera zoom | `video.tsx` camera scale passed to `kit.tsx` strokes | 4-7 px on screen in every shot |
| 7 | Stages built to hold 20 s or more, with entry slots | `anatomy.tsx`, blueprint docs | 60%+ of the story inside the body; 3 or fewer body/room switches |
| 8 | Real-object intruders at true scale, entering from an edge | `props.tsx`, new `Intruder` wrapper | One per video, 30-60% of frame height |
| 9 | Tissue stage with a floor and contact shadows for cell-scale scenes; one soft far layer (needs the owner's yes) | `scenes-body.tsx`, `micro3.tsx` | Every character stands on something; shadow under each |
| 10 | Mini-person worker rig, band labels, staying place labels, tighter people framing | `cells.tsx`, `kit.tsx`, `hud.tsx`, `scenes-rooms.tsx` | Heads 190 px+ wide in two-person shots; 2 or fewer text elements beside caption and watermark |

## Part F. Points that need the owner's decision (they touch his standing rules)

- **"Inside the body means microscopic"** (his rule) against the references, which are mostly at
  organ scale and only sometimes at cell scale. His later rule of 2026-11-22 (whole-organ frames like
  the references) already moves this way; upgrade 1 makes the organ scale the default and keeps the
  micro places for cells, blood and germs.
- **"No gradients, no blur, no gloss"** (look v8 rule 2). The references use a little soft colour in
  three places only: far backgrounds, swelling/redness, and see-through liquid. Upgrades 3 and 9 ask
  for exactly those three exceptions and nothing more.
- **Person-first hook** (his rule of 2026-11-21) against 17 of 20 references opening inside the body
  (finding 13).
- **Stat plates and clocks** are his additions in recent videos; finding 3 suggests cutting them back
  to one per video.

Nothing here copies a reference character, joke or layout: it is their staging method (organ in
place, state on the organ, one warm family) applied to our own cast.
