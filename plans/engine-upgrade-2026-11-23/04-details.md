# Engine upgrade study 4 of 5: the small details a designer notices

Date: 2026-11-23. Study only: no code changed, nothing committed, no money spent.
Builds on agent 1 (`01-visuals.md`), agent 2 (`02-camera-motion.md`) and agent 3 (`03-script-voice.md`) and does
not repeat them. Where I touch one of their points I only add the close-up detail they did not cover.

**What I looked at.** All 20 reference Shorts at one frame a second and our four newest videos (creatine,
quit-sugar, fasting, snake-bite) at two frames a second, full size; then close crops (faces, eyes, hands,
mouths, props, tags, captions, edges, the covers, the end card) at 1:1 or larger, theirs beside ours; 8-30
frames-a-second strips around gestures, entrances and the end card; and a small free script that scans every
60 fps frame of our four stories for **one-frame pops** (a frame that differs from the one before and the one
after while those two match). I also read the code behind each problem (`kit.tsx`, `people-rig.tsx`,
`organ-act.tsx`, `crea-cast.tsx`, `play.tsx`, `hud.tsx`) and ran our own `toon:staging` check (free).

**The sheets** (`plans/engine-upgrade-2026-11-23/agent4-sheets/`, every one titled):

| Sheet | Shows |
|---|---|
| `01-organ-eyes-ref-vs-ours.jpg` | Organ eyes: shape, pupil, gaze, mouth, caption on a mouth |
| `02-eyeline-two-shots.jpg` | People in two-shots: who looks at whom |
| `03-human-faces.jpg`, `04-stubble-band-and-long-arms.jpg` | Human faces, glasses, nose, stubble patch |
| `05-hands-ref-vs-ours.jpg`, `18-arm-joins-and-hands.jpg` | Hands at rest, grips, organ arms |
| `06-creatine-37-41s-half-person-at-edge.jpg` | A sliver of a person at the frame edge |
| `07-captions-ref-vs-ours.jpg` | Caption lettering and where it lands |
| `08-tags-and-labels.jpg` | Name tags and anatomy labels |
| `09-props-ref-vs-ours.jpg` | Props: text clashes, scale, detail |
| `10-covers-ours.jpg`, `11-end-card-full.jpg`, `12-end-card-slides-in.jpg` | Covers and the end card |
| `13-watermark-placement.jpg` | Where the watermark lands |
| `14-one-frame-pops.jpg` | The one-frame pop found by the scan |
| `15-snake-no-bite-mark.jpg` | The symptom that is never shown |
| `16-lens-scale-and-rod.jpg`, `17-thought-bubbles.jpg`, `19-snake-20-24s-strip.jpg`, `20-misc-full-frames.jpg` | Scale, bubbles, prop pops, odd silhouettes |
| `scripts/glitch.py` (+ `gl-*.json` results), `scripts/tool.py` | The pop scanner and the crop-sheet maker (free, re-runnable) |

Times below are seconds in the video. "Ref NN" is reference Short NN.

**The one big finding behind many small ones.** Our `toon:staging` check reports **ALL PASS** on creatine and
fasting, but it found **1 graphic** in each video. It reads `toon.json`, while in look v8 almost every tag,
plate, icon, burst, bubble and character is placed in the shot code (`creatine.tsx`, `fasting.tsx`...), so the
check never sees them. That is why a caption on the stomach's eyes, bursts on faces, a cube on a face, icons on
a head and a watermark on heads all reach the owner. Several fixes below share one new piece: a **layout log**
(see D-1 at the end of "Other").

---

## 1. Humans

### H1. Eye-line: our people stare at the camera while someone talks to them
**(a) Refs.** In every two-person shot the pupils are pushed to the side of the eye, toward the other
person, and stay there: ref 12 at 62 s (doctor and patient), ref 05 at 48 s, ref 10 at 58 s (husband and
wife), even the baby in ref 19 at 44 s looks up at the father. Sheet 02, bottom row.
**(b) Ours.** Creatine 41 s: Maya looks straight out of the screen while the doctor talks to her. Snake-bite
22-24 s: Sam stares at the camera while his mother ties the rope and talks to him (sheet 19: every frame).
Snake-bite 37 s: Mira and Sam both look at us. Fasting 31 s: Lardo looks at us, not at Grandpa. Sheet 02,
top row. In the code the default gaze is straight ahead: `people-rig.tsx` line 1340, `look ?? [0, 0.05]` in
front view.
**(c) Why it matters.** A designer reads this at once as "two stickers placed side by side". Looking at each
other is what makes two drawings into a conversation, and it is free.
**(d) Fix.** `PersonAt`/`HeadAt` take a `lookAt: 'who'` (another character's head point) instead of a fixed
`look`; the rig turns it into a pupil offset, pushed to **0.8 of the way to the rim** (see O2). Default rule:
listener looks at the speaker, speaker looks at the listener, and only the hook line may look at the lens.
Body characters too (`bodyFace` gets the speaker's position). **Check:** the layout log (D-1) records each
face's pupil direction; fail when, during a line with two or more characters on screen, a non-speaker's gaze
points more than 30 degrees away from the speaker for over 70% of the line.

### H2. Resting hands are splayed "claws"
**(a) Refs.** A hand hanging at the side or lying on a knee is a closed mitten: fingers together, slightly
curled, thumb forward (ref 13 at 82 s both hands wrap the knees; ref 05 at 40 s the boy grips the towel;
ref 12 at 62 s holds the glass). Sheet 05, bottom row.
**(b) Ours.** The rig's rest pose (`REST_R`, `REST_L`, line 491) uses the `relaxed` hand, which on our own
board `people-hands.jpg` has four separate fingers fanned out. So every standing person in every video hangs
two spread claws by the thighs: creatine 37-39 s (doctor; sheet 06), quit-sugar 30-36 s (sheet 04), the whole
`people-lineup.jpg`. Snake-bite 18-24 s: Sam's hand rests palm-up on his thigh with fingers apart for the whole
scene (sheet 19). Creatine 2 s: both hands on her cheeks with fingers spread like starfish (sheet 05).
**(c) Why it matters.** The owner's own rule is "a hand lying on the body has its fingers together". The
splayed rest hand is the most repeated hand in our videos, so it is the one people see most.
**(d) Fix.** `people-rig.tsx`: redraw `relaxed` as fingers together with a soft curl and the finger split
lines only (like `rest` but curled 20-30 degrees), keep the current spread hand as `open` only. Seated
characters get a new `knee` hand (palm down, fingers wrapping the knee). Shock pose on the cheeks uses `rest`
(flat, fingers together). **Check:** in `toon:motion` (it already reads every joint): fail when a hand whose
pose is `open` is held for more than 1.5 s without a gesture step (open is a gesture, not a rest).

### H3. Stubble is a flat, hard-edged band across the lower face
**(a) Refs.** No stubble at all; men are told apart by hair and clothes.
**(b) Ours.** Quit-sugar's Dad (`extras.stubble`, `people-rig.tsx` line 1370) gets one flat shape in skin
shaded 8% from cheek to cheek. At 2 s, 30 s and 36 s, and on the cover, it reads as a mask, a dirty patch or a
second chin (sheet 04, sheet 10). His lips are also drawn as a small pink lipstick shape.
**(c) Why it matters.** The owner has already called patches "like a patch"; this one is on the face, on the
cover.
**(d) Fix.** Either drop stubble, or draw it as a soft-edged jaw band that follows the jaw line and fades into
the cheek (two tones, the inner edge broken into 6-8 short dashes), at most 5% darker, and never on the
upper lip. A man's open mouth uses the dark mouth with the tongue, no pink lips. Show the owner one sheet of
both before choosing.

### H4. Half a person at the frame edge
**(a) Refs.** A person is either in the frame (head and shoulders at least) or out of it. Ref 12 at 62 s, ref
05 at 44 s, ref 19 at 44 s: every head is whole.
**(b) Ours.** Creatine 37.5-39 s: the frame holds the doctor and a 60 px sliver of Maya plus her orange cup at
the right edge, a floating cup (sheet 06). Creatine 39 s: the doctor's arm reaches out of the frame to nobody.
Snake-bite 37-43 s: Sam's head cut by the left edge behind Mira (sheet 02). Snake-bite 41 s: Mira's head cut
at the top by icons (sheet 03). Quit-sugar cover: the DAY 1 calendar half off the right edge (sheet 10).
**(c) Why it matters.** A sliver at the edge reads as a framing mistake, not a choice, and the floating cup
is the kind of thing viewers comment on.
**(d) Fix.** The re-framing camera (`frameOf`) gets a rule: for every person and wall item, the part inside
the frame is either **over 85% or under 15%** of its head (or the item); otherwise push the framing until it
is. **Check:** with the layout log, any head box 15-85% inside the frame fails; the same for clocks,
calendars and windows.

### H5. Props appear in a hand with no reach
**(a) Refs.** Things enter a hand by a move: ref 10 at 58 s the mug is in the hand from the start of the shot;
ref 02 the probe slides in on its cable.
**(b) Ours.** Snake-bite 20.6 s: the knife is simply there in the mother's fist on "suck" (sheet 19, row 2);
22 s the rope appears as a finished knot round the leg; 29 s the phone appears in her hand.
**(c) Why it matters.** One-frame appearances break the owner's "nothing appears or vanishes in one frame".
**(d) Fix.** A `handProp` helper: a prop held in a hand fades and scales in over 0.15 s while the hand comes
up from below the frame or from a pocket (0.3 s), or is there from the shot's first frame. A rope or bandage
draws on along its path over 0.4 s (`reveal`, agent 2 finding 4). **Check:** the pop scanner below (M1) finds
these as long as it masks nothing but the caption band.

### H6. The symptom is never on the body
**(a) Refs.** The patient shows the problem: ref 13 at 82 s the wound on the bare foot; ref 05 at 40 s the boy
strains on the toilet with pink cheeks; ref 17 bruises and red eyes appear.
**(b) Ours.** Snake-bite: the bite is never shown; Sam wears long jeans and white trainers in every shot,
including the doctor's room (sheet 15). Creatine: the "water weight" is never seen on Maya.
**(c) Why it matters.** The viewer's eye goes to the hurt spot; without it the scene is people talking.
**(d) Fix.** `people-rig.tsx`: a `mark` option on body parts (two fang dots with a red ring on an ankle,
a red cheek, a sore, a bandage) drawn in the kit line, and clothing options that show the spot (rolled-up
trouser). Script rule: the patient's symptom is visible in every patient shot after it happens.

### H7. Few eye shapes for people
**(a) Refs.** Their people act mostly with lids: half-closed in pain (ref 05 at 40 s), side-eye, a squint,
raised lids in shock, the upper lid as a thick line over the eye.
**(b) Ours.** Seven expressions (`people-hands.jpg`), all on the same full round eye; the only lid shapes are
angry, sad, sleepy. Talking has one mouth.
**(c) Why it matters.** With bodies held still (agent 2 finding 6), the eyelid is the main acting tool left.
**(d) Fix.** Add lid moods to `Eyes` in `kit.tsx` (shared with organs, so one change): `pain` (lids half down,
brows up in the middle), `side` (lids flat at 0.3, pupils to the side), `squint`, `shock` (pupils 0.12 of the
eye). Each is just another clip line, like `bored`.

---

## 2. Organ, cell and germ characters

### O1. Round, identical, centred eyes: the "emoji stare"
**(a) Refs.** Eyes are **upright ovals** (about 1.1-1.2 times taller than wide), slightly different in size or
tilt, often overlapping each other a little, sitting on or poking over the top edge of the organ (ref 20 and
ref 10 stomach, ref 01 toe, ref 05 stomach at 12 s with its eyes over the rim). Sheet 01, top row.
**(b) Ours.** `Eyes` in `kit.tsx` draws two identical circles side by side, touching, mirror images
(fasting liver 16 s, quit-sugar tongue 42 s, fasting brain 37 s, sheet 01 bottom row).
**(c) Why it matters.** Perfect mirrored circles look like a printed emoji; a small asymmetry makes the face
look drawn by a hand and gives the face a direction.
**(d) Fix.** `Eyes`: `ry = 1.12 * r`; a `turn` value (-1..1) that makes the far eye 8-12% smaller and moves
both toward the near side (this is the organ's "three-quarter view", not a mirror); allow `overlap` 0-15% of
an eye. Organs set their eyes so the top of the eyes sits at or just over the organ's top edge where the shape
allows (the ref "peek"). One kit change reaches every organ, cell and germ.

### O2. Pupils never reach the rim, so nobody looks anywhere
**(a) Refs.** The pupil is a small dot pressed against the rim toward what the character looks at (ref 20
stomach looks down at the food, ref 01 toe looks up at the clipper, ref 09 pill and pipe look at each other).
**(b) Ours.** `Eyes`: pupil radius `r * 0.24` and offset `look * r * 0.5`, so even at full look the pupil
stays in the middle half of the eye. Most shots pass `look={[0, 0.4]}` or nothing.
**(c) Why it matters.** It is the same stare as H1, for the whole non-human cast.
**(d) Fix.** Pupil radius **0.18 r** (0.13 r for `scared`, which today is 0.16), offset up to **r - pupil - 1.5**
along the look direction (a pupil can touch the rim). Default `look` comes from `lookAt` (H1). **Check:** same
gaze check as H1.

### O3. Blinks are 3 frames long and have no in-between
**(a) Refs.** A blink is a few drawings (open, half, shut, half, open) over about 0.2 s.
**(b) Ours.** `blink()` in `play.tsx`: 0.13 s, and `bodyFace` turns it on/off at 0.5, so a body character's
eyes are shut for about **3 frames at 60 fps** with no half-lid. On a phone this reads as a flicker (the scan
caught one in fasting at 46.63 s on the brain, sheet 14).
**(c) Why it matters.** The owner's rule: "no flicker". A blink that short is a flicker.
**(d) Fix.** Blink length 0.2 s; `Eyes` takes a continuous `lid` 0..1 (a straight lid line moving down, the
same clip as `bored`), so the blink is open, half, shut, half, open. **Check:** the pop scanner (M1) flags
any face region that changes for fewer than 4 frames at 60 fps.

### O4. Arms: thinner outline than the body, and a "stuck-on" join
**(a) Refs.** The arm's line is the same weight as the body's; the arm comes out from behind the body's edge
(ref 05 at 12 s, ref 20 at 3 s, ref 13 guard).
**(b) Ours.** `TinyArm`/`TinyLeg` draw their outline as an under-stroke `w + 2.4` in the character's own units,
so it scales with the character's size, while the body outline is `OUT` 5.6 px fixed on screen. On the big
tongue (quit-sugar 42 s) and the muscle (creatine 18 s) the arm line is about half the body line (sheet 18,
sheet 14). The round end-cap of the arm tube is drawn on top of the body's outline.
**(c) Why it matters.** Two line weights on one character is exactly what breaks "one hand drew this" for a
designer, and agent 1's line work on the body does not reach the arms.
**(d) Fix.** `kit.tsx`: draw the arm and leg outline with the same `OUTLINE` (non-scaling, `OUT`) as `Shape`;
start the arm 6-10 units inside the body edge and draw it **before** the body when it hangs at the side (the
comment in `TinyArm` already asks for this; most callers draw arms after). **Check:** a sheet test in
`toon-v8-sheets.mjs` that renders every cast member at its largest video size and measures the outline
thickness on the arm and the body: fail when they differ by more than 1.5 px.

### O5. The open hand looks like a tulip
**(a) Refs.** Organ hands are small puffy mittens (ref 05 at 12 s); when they hold something they wrap it
(ref 20 holds the stick, ref 13 the sign).
**(b) Ours.** `TinyArm hand="open"` is a three-lobed crown (quit-sugar tongue 42 s, sheet 18). Fists have
three ticks.
**(c) Why it matters.** At the tongue's size the hand is 60-80 px on screen; the crown reads as a flower.
**(d) Fix.** Four short rounded fingers with the thumb lower on the side; a `grip` hand that wraps a stick
(the prop drawn between the fingers and the palm, like `hold` on the people board).

### O6. A caption sits on a face
**(a) Refs.** The caption sits on tissue or on the body, below the face (ref 20 at 3 s "TODAY" on the food,
ref 10 at 20 s "OUT" between the step and the eggs). Sheet 07.
**(b) Ours.** Fasting 10 s "WAVES" and 11 s "MEAL" lie across both eyes; quit-sugar 42 s "TASTES" covers the
tongue's mouth (sheets 07 and 01). Agent 1 named fasting; it is wider than one video: whenever the camera
frames a face at caption height (y 1374) the caption lands on it.
**(c) Why it matters.** The caption covers the acting at the exact moment the character speaks.
**(d) Fix.** `video.tsx` caption: read the face boxes for this frame from the layout log; if the caption's box
(word width x 120 px) touches a face box, move it to the nearest free height below the face (never above
y 1150, never below y 1560, the Shorts title band). **Check:** fail any frame where the caption box overlaps
an eye or mouth box (this is one entry of the general overlap check D-1).

### O7. Odd silhouettes: a brain on a stick, a door on a lens
**(b) Ours.** Fasting 37-41 s: the brain stands on its own spinal cord like a lollipop, arms coming out of the
middle of the brain (sheet 20). Quit-sugar 5-13 s: the brain stem runs down between two columns of cream
blocks that read as teeth. Creatine 44-46 s: inside the magnifier Crea is drawn at the same size as Fat who
stands **outside** the lens on plain skin, and the cell door sits on the lens rim, half in and half out
(sheet 16). Creatine 18 s: the "MUSCLE FIBRE" tag's arrow goes up between the muscle's legs.
**(c) Why it matters.** Each one makes a viewer stop to work out what they are looking at, for the wrong
reason.
**(d) Fix.** Rules for the shot files: a magnifier shows the small world only inside the lens and nothing
outside it is at the small scale; nothing sits across the lens rim. A brain character stands on the floor on
two little legs from its underside (or floats in its skull); its stem stays inside the skull. These are
look-sheet items for the owner, not code rules.

---

## 3. Props

### P1. Caption on top of a prop's own text
**(b) Ours.** Quit-sugar 14 s "HEALTHY!" over the juice box's "JUICE" label; fasting 23-24 s "SUGAR" caption on
the furnace fire next to the furnace's own "SUGAR" label, with a faded "FAT" word floating on teal with no box
(sheets 08, 09).
**(c) Why it matters.** Two layers of text on top of each other is the most "cheap" thing a designer can see.
**(d) Fix.** Props that carry words register a text box in the layout log; the caption avoids them like faces
(O6). A word on a prop appears once on screen: if the caption says it, the prop's own label is hidden or the
caption word is not a key word. **Check:** D-1, "text on text".

### P2. A character or prop on someone's face
**(b) Ours.** Creatine 0-1 s (the hook, and the first frame): the creatine cube stands on Maya's cheek with its
hand on her eye (sheet 09); quit-sugar 5 s: the cube sits on the brain's forehead with its rod across it;
snake-bite 41 s: three icon boxes sit on Mira's hair, cut by the top edge (sheet 03).
**(d) Fix.** The owner's "a tag never covers a face" becomes "**nothing** covers a face": characters, props,
icons, bursts, bubbles. **Check:** D-1, every drawn thing against every face box (eyes plus mouth, padded 20
px), except a hand of the face's own owner.

### P3. Real objects are drawn at mascot detail
**(a) Refs.** The real object that intrudes is drawn with more detail than the characters: the probe in ref 02
has its button, grip ridges and a cable; the nail clipper in ref 01 has metal planes, the lever and its pin;
the glass in ref 19 has an ellipse top and water line, held by fingers wrapping the front (sheet 09).
**(b) Ours.** Props are flat and simple: the shaker cup, the phone (a black rectangle), the knife, the rope (a
pretzel-shaped loop), the scale.
**(c) Why it matters.** It is agent 1's "real object entering" point; the detail is what makes it read as
real at a glance.
**(d) Fix.** `props.tsx`: a "hero prop" level of drawing for the one intruder per video: 3 tones (light, mid,
shade), 1 highlight line, 2-4 construction details (seams, buttons, a cable), still the kit line. Glasses and
cups always held with the fingers in front of the object (the `hold` hand drawn above the prop).

### P4. Plate and table in two different perspectives
**(b) Ours.** Fasting 31 s: the plate is seen from about 40 degrees above, the table top almost edge-on.
**(d) Fix.** Props that sit on furniture take the furniture's view angle (`ry/rx` of the table top).

---

## 4. Text, tags and captions

### T1. Caption lettering: ours is a clean sans, theirs is comic lettering
**(a) Refs.** A rounded comic display face, slightly bouncy (letters at slightly different heights and tilts),
white with a thin black outline and a soft offset shadow (ref 20 "TODAY", ref 05 "RIGHT", ref 10 "OUT",
sheet 07). Labels are hand-lettered in mixed case.
**(b) Ours.** Poppins Black, perfectly straight, a heavy outline. Clean and readable (agent 1 and 2 liked it),
but it reads "corporate", and white letters on the white coat (snake-bite 41 s "VENOMOUS") hold only by the
outline.
**(c) Why it matters.** The lettering is the one element on screen all the time; it sets the tone of the
channel.
**(d) Fix (owner decision).** Keep Poppins, and add two small things: a flat dark offset shadow 4 px down (no
blur, so no "glow"), and a per-word tilt of -2 to +2 degrees seeded by the word. Or test one rounded comic
face for the captions only. Show both on one sheet.

### T2. Tags: pills with arrows, doubled labels, arrows that miss
**(a) Refs.** Anatomy labels are small white boxes with a thin black border and hand lettering, set on the
part, often rotated along it (ref 03 "EPIGLOTTIS" vertical, "TRACHEA" tilted), and no arrow. Chemicals wear
their name on a band round the body (ref 10 "ADRENALINE").
**(b) Ours.** Creatine 15-16 s: a "BATTERY (ATP)" tag with an arrow over a battery that already says "ATP" on
it (two labels for one thing, sheet 08); the tag fades over a busy striped band. Quit-sugar 14 s: the "TOOTH"
arrow lands on a sugar crumb, not on the tooth. Creatine 18 s: the "MUSCLE FIBRE" arrow points up between the
legs. Fasting 23 s: the "LARDO (FAT CELL)" arrow ends on the furnace, above Lardo rather than on him.
**(c) Why it matters.** A tag that points at the wrong thing teaches the wrong thing.
**(d) Fix.** `CharTag` in `hud.tsx`: the arrow ends on the character's **body centre**, read from the layout
log, never on a face, a prop or a crumb; a tag is skipped when the character already carries its name
(`BandLabel`, agent 1 finding 10). Tags sit on a calm area: if the background behind the tag box changes
colour by more than 25% across the box, give the box a 3 px wider white margin. **Check:** D-1, arrow tip
inside its own character's body box.

### T3. The caption holds over a cut and over a face change
Small, covered by agent 3 finding 12 (clear in pauses). One addition, as a rule to keep (not seen failing in
these four): a caption word must not stay on screen across a hard cut; clear it on every cut and pop the next
word in after 2 frames.

---

## 5. Cover, end card, watermark

### C1. The cover
**(a) Refs.** The cover is the first frame: no text, full of the organ (agent 1 finding 13).
**(b) Ours** (sheet 10). Creatine: the title "TAKE CREATINE?" sits on Maya's chest over her hand. Quit-sugar:
the title sits on Dad's crotch, the stubble band is on his face, the calendar is cut in half at the edge, and
the watermark runs over the calendar. Fasting: "WHEN YOU" sits right under the stomach's mouth and the
stomach's arm is cut by the left edge. Snake-bite: the title overlaps the top of the blue drop's head. All
four carry the watermark (the end card does not, the cover does).
**(c) Why it matters.** The cover is shown small in the feed and on the channel page; title on a body and
half objects at the edge are what make it look homemade.
**(d) Fix.** `toon-cover`: the title box must not touch any face, hand or prop box (D-1) and sits in the
largest free area; nothing cut at the edge (H4 rule); no watermark on the cover (the channel name is already
next to it in the feed); pick the frame by score (faces whole, eyes open, nothing cut, the hero organ big).

### C2. The end card slides in: a transition
**(b) Ours.** Creatine 49.1-49.4 s: the blue card **pushes up from the bottom over about 0.25 s with an
overshoot**, the story still showing above it (sheet 12); the same in all four.
**(c) Why it matters.** The owner's rule since 2026-11-21 is "no transitions, every scene change is a hard cut".
This is the one we still have, at the last impression of the video.
**(d) Fix.** `video.tsx`: the card starts with a hard cut; the logo, name, headline and points pop in on the
card itself (as now).

### C3. The end card layout
**(b) Ours** (sheet 11, creatine 65 s). The bottom **330 px are empty blue** while the logo block sits high;
for the first 2-3 s only the headline is on the card (50-52 s), so the frame is 80% empty blue. The kidney
icon is clipped by its circle (top of the head cut, the tube runs out of the bottom); the icon circles come
within 7 px of the card's top and bottom borders. The water drop icon has a gloss streak (look v8 rule 2 says
no gloss). The follow box ends at y 1595, where the Shorts title and channel name sit.
**(c) Why it matters.** Even margins and whole icons are the first things a graphic designer checks on a
layout.
**(d) Fix** (`CtaCardV4`, `hud.tsx`): centre the whole stack vertically between y 200 and y 1500; icon circle
170 px inside a 220 px card (25 px margin); icons drawn to fit inside their circle (no clipping of a
character); the follow box above y 1500; the three points appear together with the headline, 0.15 s apart
(if agent 3's shorter card is accepted, this is required). **Check:** a still of the card at its last frame:
measure the empty band top and bottom (difference under 120 px) and that no non-background pixel touches a
circle's edge.

### C4. The watermark lands on heads and sits on the caption
**(a) Refs.** A light, rounded, handwritten-looking mark in an empty part of the picture (ref 10 at 20 s,
ref 05 at 44 s; sheet 13).
**(b) Ours.** Act 2 (`WM_AT`, x 96, y 1330) sits **44 px above the caption line**, so it reads as a second
caption line and lies across legs (quit-sugar 30 s, snake-bite 22 s, fasting 31 s). Act 3 (top middle, y 178)
lands on heads in room shots, where heads usually are (creatine 37 s on the doctor's hair, snake-bite 41 s on
the icon). On white walls and the white coat the 44% white mark is nearly invisible.
**(c) Why it matters.** The owner placed it "inside the safe area"; he did not mean "on a head".
**(d) Fix.** Act 2 moves to y 1180-1220 (clear of the caption by 120 px or more) or to the bottom left at
y 1600 only if the Shorts title band allows; the act 3 spot is chosen per shot from three candidates
(top left, top middle, top right) as the first that does not touch a head; on light backgrounds (mean
brightness behind it over 200) it turns ink-coloured at the same opacity. **Check:** D-1, watermark box
against heads and the caption box.

---

## 6. Motion glitches

### M1. One-frame pose pops (a class bug)
**(a) Refs.** Their animation is on twos and threes (agent 2 finding 10), but a pose never goes somewhere
for one drawing and comes back.
**(b) Ours.** The scan (`scripts/glitch.py`) found 13 candidate one-frame changes in the four stories. The
clearest: **creatine 18.40 s (frame 1104)**: Muscle's arms go from "flexed up" to "hanging down" for ONE
frame and back, and the mouth changes with them (sheet 14). Cause, in `crea-cast.tsx` line 165: the arms are
chosen with `k > 0.4 ? flexed : hanging`, a hard switch on a value that dips below 0.4 for one frame between
two reps (`repFlex` windows). The others were a 3-frame blink (O3) and cut edges.
**(c) Why it matters.** At 60 fps one frame is 17 ms, but a whole-limb swap is visible as a twitch; it is
exactly the "flicker" the owner has complained about before.
**(d) Fix (the class, not the instance).** No pose may be chosen by `value > threshold ? A : B` on a value
that moves continuously; blend the two poses (as `armTo` already does) or hold the choice for at least 6
frames (a hysteresis: switch up at 0.45, down at 0.35). Grep showed the pattern in 8 files
(`crea-cast`, `creatine`, `fasting`, `quit-sugar`, `scenes-body`, `shots-v3` x2, `snake-bite` x2); review each.
`toon:motion` today reads only **people's** joints; extend it to organ arms (`OrganArm`, `TinyArm` calls
report their hand point to the layout log). **Check:** run `glitch.py` (or its port) on every final render:
fail on any blip over 0.4% of the picture outside a cut and outside the caption band; list the time and box.

### M2. Hand-to-hand near misses
**(b) Ours.** Creatine 39 s: the doctor's flat hand comes within a few pixels of Maya's hand on the cup
(sheet 05). Snake-bite 29 s: Sam's open hand reaches into his mother's hand holding the phone. Snake-bite
22 s: the mother's hand on his knee next to his own resting hand.
**(d) Fix.** The owner's "hands never overlap hands" also means "do not nearly touch": keep **30 px** between
two people's hand boxes unless the script says they touch (a handshake, a hand-off), and then the hand-off is
staged (one hand above, one below). **Check:** in `toon:motion`, hand boxes of different people closer than
30 px for more than 3 frames fail.

### M3. A prop or element that pops (see H5)
Covered above; the same scan finds it.

---

## 7. Other

### D-1. The layout log: one check for every overlap (the class fix)
Today each overlap rule (tag not on a face, burst not on a face, caption not on eyes, wall item not behind a
head) lives in a check that reads `toon.json`, and v8 shots place most things in code, so the check sees 1
graphic per video and passes. **Fix:** a small React context in `play.tsx` (like `DiveCtx`) that every
placed thing writes its screen box into while a probe render runs: `face` (eyes and mouth), `head`, `body`,
`hand`, `text` (caption, tag, plate, prop text), `fx` (burst, bubble, icon), `watermark`. `toon:staging` then
renders one probe frame every 0.1 s (no video, about 500 stills, free) and fails on: anything over a face
except its owner's hand; text over text; caption over a face; tag arrow outside its character; watermark on a
head or the caption; a head 15-85% inside the frame; a burst within 1.2 face radii (agent 2's rule). This
is the one piece that turns most findings above into an automatic check.

### D-2. Thought bubbles
**(b) Ours.** Snake-bite 24-27 s: the bubble floats between the mother's and Sam's heads with **no trail of
dots**, so we cannot tell whose thought it is. Quit-sugar 32 s: the bubble (with its trail, good) covers the
"NO SUGAR" calendar (sheet 17).
**(d) Fix.** Every bubble takes `of: 'who'` (the old engine already has this) and draws three dots shrinking
toward that head; the bubble is placed in the largest free area, never over a wall item. **Check:** D-1.

### D-3. Gloss streaks still on the cast
Agent 1 found them on the fasting stomach; they are also on the cube (quit-sugar 14 s), the water drop icon on
the end card, the brain (fasting 37 s) and the muscle (creatine 18 s: a long white arc). The rule is one
short pale highlight line at most; make it a single `Highlight` in `kit.tsx` (max 0.25 of the shape's width,
70% opacity) so every character uses the same one.

### D-4. The hook frame
Creatine 0 s is also the cover moment: Maya's eyes are shut and the cube is on her face (P2). Choose the
first frame so that every face on it has its eyes open (blink and `closed` mood are off for frame 0-6).

---

## TOP 15 detail fixes, ranked

| # | Fix | Where | What changes | Automatic check |
|---|---|---|---|---|
| 1 | **Layout log + one overlap check** (D-1) | `play.tsx` context, `toon-staging.mjs` probe render | every placed thing reports its box | fails faces covered, text on text, caption on face, tag arrows, watermark, heads cut |
| 2 | **Eye-line: characters look at each other** (H1, O2) | `people-rig.tsx` `lookAt`, `kit.tsx` `Eyes`, `bodyFace` | pupil to 0.8 of the rim toward the speaker/listener | gaze away from the speaker over 70% of a line fails |
| 3 | **No one-frame pose pops** (M1) | `crea-cast.tsx` line 165 and the 8 files with threshold switches; `toon:motion` for organ arms | blend or hold 6 frames | `glitch.py` on every final render |
| 4 | **Resting hands with fingers together** (H2) | `people-rig.tsx` `relaxed` hand, new `knee` hand | rest = closed curled mitten | `open` held over 1.5 s without a gesture fails |
| 5 | **Nothing on a face; caption moves off faces** (O6, P2) | `video.tsx` caption placement; shot staging | caption drops below the face | D-1 |
| 6 | **End card: hard cut, centred stack, whole icons** (C2, C3) | `video.tsx`, `CtaCardV4` | no slide; even margins; 25 px icon margin | still check of margins and clipping |
| 7 | **Watermark off heads and off the caption** (C4) | `WM_AT` in `hud.tsx` | act 2 higher; act 3 chosen per shot; ink on light | D-1 |
| 8 | **No half people at the edge** (H4) | `frameOf` rule | in over 85% or under 15% | D-1 |
| 9 | **Blink 0.2 s with a half-lid** (O3) | `play.tsx` `blink`, `kit.tsx` `Eyes` `lid` | open-half-shut-half-open | a face change under 4 frames fails |
| 10 | **One line weight on arms and legs** (O4) | `kit.tsx` `TinyArm`, `TinyLeg` | non-scaling `OUT`, arm starts behind the body | sheet test: arm and body line within 1.5 px |
| 11 | **Oval, slightly turned organ eyes** (O1) | `kit.tsx` `Eyes` | `ry 1.12 r`, far eye 8-12% smaller, small overlap | sheet approval |
| 12 | **Covers: no title on a body, nothing cut, no watermark** (C1) | `toon-cover` | frame and title placed by score | D-1 on the cover frame |
| 13 | **Show the symptom on the body** (H6) | `people-rig.tsx` `mark`, clothes options | bite, sore, red cheek visible | script check: symptom shot list |
| 14 | **Tags: arrow on the body, no doubled names; props enter hands by a move** (T2, H5) | `CharTag`, `handProp`, `reveal` | arrow to body centre; 0.15-0.4 s entries | D-1 arrow rule; pop scan |
| 15 | **Caption shadow and tilt; hero prop detail; stubble redrawn** (T1, P3, H3) | `WordCaption`, `props.tsx`, `people-rig.tsx` | 4 px flat offset shadow, ±2° tilt; 3-tone hero prop | sheet approval |

## What we already do well (keep)

1. **Real noses in every view, real glasses, real ears** (sheet 03): our human faces are better drawn than
   the references' and consistent across the eight people.
2. **Hands one piece with the forearm** and a full set of hand shapes; the `hold` hand and the `point`/
   `thumbs` gestures read clearly (fasting 27-30 s thumbs-up held through the line, sheet 20).
3. **Feet stay planted**: in the 8-frame-a-second strips (snake-bite 20-24 s, fasting 26-30 s) nobody's feet
   slide while standing or talking; `toon:motion` is doing its job for people.
4. **Mouths do not flicker** (`talkSmooth`), and only 13 one-frame changes in 4 x 49 s of 60 fps animation,
   of which one is a real pop.
5. **Quit-sugar's bubble with its trail** (32 s), the **brain's bored lids** (5 s) and the **tongue's taste
   buds** are reference-level details.
6. **Captions are crisp and readable** at phone size; the key-word yellow works.
7. **The end card's points are clear and on one line each**, the logo is sharp, and the copy is short.
8. **Every outline is already `non-scaling-stroke`** in the kit (only arms and legs are not, O4), so the line
   fix is small.

## Items needing the owner's decision

1. **Caption lettering** (T1): keep Poppins with a flat 4 px shadow and a ±2° tilt, or try a rounded comic face
   like the references. One sheet with both.
2. **Stubble** (H3): drop it, or the soft jaw band. One sheet with both.
3. **Gaze rule** (H1): characters look at each other, and only the hook line looks into the lens. This changes
   the feel of the hook he set (2026-11-21: "comes at the lens"), so he should confirm that the lens look stays
   only for the hook.
4. **Watermark** (C4): moving act 2 up and letting act 3 pick its corner per shot changes his "three fixed
   places". It would also become ink-coloured on light backgrounds. And: no watermark on the cover?
5. **End card** (C2, C3): the hard cut in, the centred layout, and all points at once (with agent 3's
   5-6 s card proposal).
6. **Symptom on the body** (H6): a visible bite or sore. Medical and mild, drawn in the kit line with no
   blood, but it is a new kind of picture for the channel.
7. **Oval turned eyes** (O1) touch "one eye for the whole cast"; it stays one eye, but every character changes
   a little at once. One before/after sheet of the full cast.

Nothing here copies a reference character, joke or layout; what is taken is their finishing habits (eyes that
look at someone, closed resting hands, whole people in frame, one line weight, nothing on a face, no text on
text) applied to our own cast.
