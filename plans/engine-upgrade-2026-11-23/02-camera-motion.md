# Engine upgrade study 2 of 5: camera, motion, animation, change over time

Date: 2026-11-23. Study only: no code changed, nothing committed, no money spent.
Builds on agent 1 (`01-visuals.md`); it does not repeat the drawing findings.

**What I measured.** Every frame of the 20 reference Shorts and of our four newest videos (creatine,
quit-sugar, fasting, snake-bite; story only, the end card left out), all resampled to 30 frames a
second, 36,000 + 5,900 frames. For each frame: how much of the picture changes, where it changes, cuts,
how long each picture holds, and whether the camera zooms or pans (a scale-and-shift search between
frames 0.2 s apart, and again between the start and end of every hold longer than 3 s, so a slow creep
would also show). Then I looked at strips of frames at 10-60 frames a second around every cut and every
big action, in theirs and ours.

**A note on the numbers.** The current look check (`toon_look.py`) measures the whole frame, so the
caption changing word by word counts as "motion" in both theirs and ours. Below, "picture" means the
frame **with the caption band (y 1200-1640) left out**. That is what shows the real gap: on the whole
frame we look close (still 52-60% against 60%), on the picture we are far apart (61-64% against 89%).

**The sheets** (all in `plans/engine-upgrade-2026-11-23/agent2-sheets/`):

| Sheet | Shows |
|---|---|
| `01-motion-heatmaps.jpg` | Where the picture keeps changing: theirs only eyes, mouth and caption; ours whole regions |
| `02-cuts-and-motion-timelines.jpg` | Cuts and motion second by second, 4 references against our 4 |
| `03-camera-motion-numbers.jpg` | Cuts a minute, shot hold, still share, motion amount: 20 refs against our 4 |
| `04-every-reference-cut.jpg` | All 58 reference cuts, before and after |
| `05/06/07-our-cuts-*.jpg` | Every cut in fasting, snake-bite, quit-sugar, before and after |
| `08-reference-time-cards.jpg` | The black LATER card: how they show change over time |
| `09-reference-big-actions.jpg` | Their six biggest actions, 15 frames a second |
| `10-our-big-actions.jpg` | Our biggest moments: shakes, flashes, bursts |
| `11-our-dives.jpg` | Our dives into the body, 60 frames a second |
| `12-caption-motion.jpg` | Caption pop, theirs and ours |
| `13-reference-talking-face.jpg` | Ref 20 talking: only the mouth moves |
| `motion-measurements*.json`, `scripts/` | Raw numbers and the measuring scripts (reusable by agents 3-5 and for the new checks) |

---

## Part A. The numbers

Median of the 20 references against our four (story only, picture = caption band left out).

| Measure | Ref median | Ref range | creatine | quit-sugar | fasting | snake-bite |
|---|---|---|---|---|---|---|
| Cuts a minute | **3.3** | 1.0-6.1 | 19.6 | 24.8 | 16.1 | 18.9 |
| Median time one picture holds | **15.3 s** | 1.1-31.7 | 1.9 s | 2.4 s | 3.1 s | 2.5 s |
| Longest stretch where the picture is fully still | **14.9 s** | 3-33 | 1.1 s | 2.7 s | 1.6 s | 2.4 s |
| Frames where the picture holds still | **89%** | 67-96% | 33% | 64% | 62% | 61% |
| Frames where something changes at all (fine) | **27%** | 9-62% | 83% | 54% | 63% | 60% |
| Seconds with visible action (over 1% of picture moving) | **13%** | p75 22% | 78% | 44% | 46% | 47% |
| Seconds with big action (over 3%) | **2%** | p75 3% | 41% | 12% | 23% | 21% |
| Share of picture changing per frame (mean) | **0.66%** | 0.2-2.0% | 4.9% | 2.6% | 2.6% | 2.9% |
| Same, the 95th-percentile frame | **2.6%** | 0.4-9.8% | 22% | 11% | 11% | 13% |
| Frames a minute where over 10% of the picture changes (cuts left out) | **8** | 0-87 (p75 40) | 214 | 79 | 93 | 126 |
| Picture pixels that change in more than 5% of frames | **0.3-1.0%** (4 refs) | | 54% | 8% | 37% | 45% |
| Camera moves (zoom or pan) | **none in 17 of 20** | 3 refs: 2-6 short zooms | locked | locked | locked | locked |
| Screen shakes | **0** (19 of 20) | | 5 flash events + 2 shakes | 7 + 2 | **14** + 2 | **16** + 2 |
| Star bursts (`Burst`) | **0 seen** in the frames studied | | 8 | 9 | 8 | 9 |

In one sentence: **their camera never moves and they cut 3 times a minute; the picture is frozen 89% of
the time and, when it moves, a small part moves. Our camera never moves either, but we cut 16-25 times a
minute, and when something happens the whole frame shakes, flashes or bursts.**

---

## Part B. Findings

### 1. Cuts: they hold a place 15 s; we cut every 2-3 s, and half our cuts re-frame the same place

**(a) References.** 58 cuts in 20 videos (sheet 04), of exactly three kinds:
1. **Another place**, usually cross-cutting between two characters in two organs, each side held 5-12 s
   (ref 06 at 5.4/10.2/13.3/20.8 s ovaries and womb; ref 20 at 12.9 s stomach to brain, back at 25.3 s;
   ref 13 at 59.4/62.1 s).
2. **A black time card** (finding 3): 18 of the 58 cuts are into or out of one.
3. **The doctor's room**, once, near the end (refs 02, 04, 05, 06, 07, 10, 12, 13, 17, 18, 19, 20).

Only **one** reference cuts to a closer framing of the same place (ref 15 at 0.8 s, the armpit, about
2x, in the first second). Without the time cards, a reference has about **2.5 real cuts a video**. Median
hold 15.3 s; longest 30-46 s (refs 02, 08, 18).

**(b) Ours.** Fasting 13 cuts in 48 s (sheet 05): 8 are place changes, **5 are re-framings of the same
place** (cut 2 at 5.8 s, the room again; cuts 4 and 5 at 9.3 and 12.1 s, the stomach in to 1.6x and
straight back out; cuts 10 and 11 at 30.9 and 34.0 s, the room in and back out). Snake-bite 15 cuts
(sheet 06): cuts 4, 8, 9, 10, 11, 14 re-frame; 10 and 11 at 23.2 and 25.3 s go in and back out within
2.1 s. Quit-sugar 21 cuts (sheet 07), of which 6 are the DAY calendar cards (good, see finding 3) and
several re-frame the mouth and the liver by line. These pass `views.test.mjs`, because the rule is
"a re-frame must change size 1.5x", which still allows a cut on every line. Fasting's 5 re-frames are
1.6x; quit-sugar's are 1.12-1.45x (`viewB`..`viewG` with `byLine`), which the test lets through only
because quit-sugar is on the "already out" list.

**(c) Why it matters.** A cut resets the viewer's eye: every 2-3 s they have to find the face again,
and the place never gets to "settle". The references' calm comes mostly from this one number. The
in-and-back-out re-frames are also what the owner keeps calling "camera jump" (2026-11-22): the size
rule makes them technically clean, but they still read as jumps.

**(d) Engine change.**
- `play.tsx` / shot files: a body shot has **one framing for the whole shot** (drop `byLine` re-frames).
  Allowed exceptions, named in the shot file: at most **one punch-in per video** (2x or more, held at
  least 3 s, never followed by a cut back out to the same framing within 4 s).
- `director.ts` / blueprint: targets **at most 6 cuts a minute** (reference p90), aim 4; **median hold
  at least 6 s**; a body place held **at least 8 s** before cutting away (works with agent 1 finding 7).
  The way to change "picture" without a cut is to bring something INTO the held frame (finding 4).
- **CHECK** (new, on the FINAL render, in `toon_look.py` or a new `pipeline/lib/toon_motion.py`; the
  prototype is `agent2-sheets/scripts/measure.py` + `analyse.py`): list every cut (frame where over 45%
  of the picture changes and the mean change is over 28 levels) and classify it by matching the frame
  after against the frame before scaled 1.2-2.5x and shifted: a match = **re-frame**, an all-dark frame =
  **card**, else **place**. Fail on: more than 6 cuts a minute (cards not counted), a median hold under
  6 s, more than one re-frame, or any re-frame followed by the reverse re-frame within 4 s. Also make
  `views.test.mjs` fail any `view` that changes inside a body shot unless the shot marks it `punch: true`.

### 2. The picture holds still: 89% of their frames, 62% of ours, and our motion covers the whole frame

**(a) References.** 89% of frames the picture (caption left out) does not change at all; it moves
visibly in 13% of seconds and strongly in 2%. The heatmap (sheet 01) shows why: in refs 20, 05, 02 and
13 the only places that change often are the **mouth, the eyes and the caption**; just 0.3-1.0% of the
picture changes in more than 5% of frames. Longest fully still stretch: median 15 s.

**(b) Ours.** Picture still 33% (creatine) to 64% (quit-sugar). The longest still stretch is 1.1-2.7 s:
**something is always moving**. 37-54% of our picture pixels change in more than 5% of frames (fasting,
snake-bite, creatine): whole regions, not a mouth. Three causes, seen in the frames:
1. **Whole-frame effects on events**: the screen shake and white flash (finding 5), 5-16 per video.
2. **Backgrounds that run all the time**: creatine's blood tunnel streams rings and cells through the
   whole frame (sheet 10, row 5); the skill's own rule "flow never stops" (`toons-look.md`) asks for it.
3. **Bodies that move while talking**: `voiceSq` (creatine) squashes a character on its voice; organs
   pound fists and hop on lines (fasting 0-1.7 s).
Our rooms are already right: fasting 2-6 s, Grandpa standing, picture change 0.1% (sheet 02).

**(c) Why it matters.** Stillness is what makes the one thing that moves get seen. When every second
has motion over the whole frame, the eye has nowhere to rest and nothing stands out: the creatine
review's "nothing hits the viewer" in numbers.

**(d) Engine change.**
- `video.tsx`: remove the automatic shake on every flash event (`const shake = flash > 0 ...`, a 9 px,
  6 Hz shake in every body shot) and make `fx: 'flash'` rare (finding 5).
- `micro3.tsx` / place files: "flow" becomes **a few small particles in a band** (at most 5% of the
  frame), never the whole background; update the rule in `toons-look.md` ("Flow never stops").
- `act.tsx`: a `still(s, who)` helper: a body character's body is frozen while it talks; only face parts
  move (finding 6). Retire `voiceSq` and any `sway` on talk.
- **CHECK**: change `toon_look.py` to measure the **picture without the caption band** and add bands
  taken from the 20 refs: picture still **at least 80%** (ref p25 85%, min 67%); seconds with visible
  action **at most 25%**; seconds with big action **at most 5%**; frames a minute with over 10% of the
  picture changing **at most 40** (ref p75); a **heatmap rule**: at most 5% of picture pixels may change
  in more than 5% of frames; and the **longest still stretch at least 4 s** somewhere in the story.
  Keep the old whole-frame numbers printed for history.

### 3. Change over time: the same framing, a black LATER card, the same framing changed

**(a) References.** 8 of 20 show time passing with a **black card, about 1 s, plain text**: "LATER..."
(refs 01, 09, 16), "2 MINUTES LATER" (ref 07 at 21.9 s), "after a while..." and "DAY 15" (ref 14 at 12.2
and 21.2 s), "FEW MOMENTS LATER" (ref 15 at 20.3 s, ref 20 at 44.1 s). The card lasts 0.9-1.2 s (ref 07:
0.94 s; ref 14: 1.03 and 1.0 s; ref 20: 1.23 s; ref 16: 0.87 s). The crucial part: **the picture after the
card has exactly the same framing as before, and only the state changed** (ref 14 the embryo becomes a
fetus; ref 09 the pill sits in the food pipe, then the pipe is ulcerated; ref 20 the stomach gets green
gas; ref 16 one twin goes dark). Ref 17 at 29.1 s does the same with a 0.3 s dip to black and back:
bruises and red eyes appear. See sheet 08. Short changes are animated in place instead (finding 4).

**(b) Ours.** Quit-sugar already has this idea: the DAY calendar cards (cuts 4-5 at 4.6/5.2 s, 7-8 at
12.3/13.0 s, 12-13 at 21.5/22.2 s; about 0.6 s each) and they read well. But after each card we come
back to a **different** picture (Dad, then the brain, then the mouth), so the before/after comparison
is lost. Fasting shows time with a clock badge that spins in a corner of every body shot and a room
clock that spins in silent beats: correct but small, and in every shot.

**(c) Why it matters.** Before/after in the same framing is the clearest way to show what a habit does
to an organ: the viewer compares two pictures without any words. It is also the reference's cheapest
"cut" because nothing has to be re-found.

**(d) Engine change.**
- `hud.tsx` (or `video.tsx`): a `TimeCard` piece: a black or brand-dark full frame with one short line
  in the caption font ("16 HOURS LATER", "DAY 30"), **0.8-1.2 s**, a hard cut in and out (no fade: the
  owner's no-transitions rule), the watermark kept, the narrator may speak over it.
- `toon.json`: `{"card": "16 HOURS LATER", "after": "B2"}`; the player inserts it between two lines.
- Shot contract (`play.tsx`): a shot can be played **twice with different state** (`state` prop) and the
  same `view`, so before and after share the framing.
- **CHECK**: in the cut list (finding 1), every card cut must be followed within 1.4 s by a card-out cut,
  and the frames either side of the card must match framing (same scale/shift, the state may differ):
  fail when the "after" frame is a different place. At most 3 cards a video.

### 4. Things move IN to a held frame: slide, fill, grow, pass through, then hold

**(a) References** (sheet 09, the biggest action of six references, 15 frames a second):
- Ref 05 at 30.4 s: the colon **fills** with waste from the top in 0.55 s, the eyes appear on it, then it
  holds.
- Ref 02 at 9.1 s: an ultrasound probe **slides in** from the bottom edge (about 0.5 s, ease-out), and its
  beam **sweeps** the black lung clear over about 1 s.
- Ref 14 at 32.5 s: the twins **slide out** of the womb downward in 0.6 s while the womb's eyes close.
- Ref 20 at 4-6 s (sheet ref20 talk strip): food items **fall in one by one along arcs**, each about
  0.3 s, and pile up: the state builds over many seconds without a cut.
- Ref 11 at 2-14 s: the cola level rises in the stomach.
The camera never moves; the motion is whole objects tweened along simple paths (cut-out animation) and
masks revealing a new state. Typical action: **0.3-0.6 s, eased out, then a hold of several seconds.**

**(b) Ours.** We have good process pieces (quit-sugar's fat patches shrink over 0.8 s at 24-28 s; taste
buds light over 1.4 s at 58 s; creatine's battery drains and charges) and the acting kit's `keyed`
key-pose timing is exactly the right tool. But most of our "change" is told by HUD pieces (gauge needle,
clock badge, number plate: agent 1 finding 3) or by a cut to another picture.

**(c) Why it matters.** Something entering a still frame is the strongest motion there is, and it lets
a place hold 15-20 s and stay interesting (agent 1 finding 7). It replaces cuts.

**(d) Engine change.**
- `act.tsx`: add `enter(t, t0, from: 'top'|'bottom'|'left'|'right', dur = 0.5)` (slide in from outside
  the frame, ease-out, overshoot at most 4%), `leave(...)` (ease-in), `along(path, t, t0, dur)` (arc
  travel, already half there in `arc`), `fill(t, t0, dur = 0.6)` (0..1 level for a mask or liquid),
  `reveal(t, t0, dur = 0.8, dir)` (a wipe mask across a shape for spreading damage or a scan).
- `anatomy.tsx` (agent 1): every state prop (`fill`, `damage`, `cut`) is driven by those helpers, and a
  stage declares its **entry slots** (top tube, side, cut window) so intruders know where to come from.
- Timing rule in `toons-v8-style.md`: one action **0.3-0.8 s**, then the frame holds **at least 1.5 s**
  before the next action in the same place; at most one action at a time.
- **CHECK**: from the per-frame picture motion, find action runs (picture change over 1%); fail when
  two big actions (over 3%) are less than 1.5 s apart in the same shot, or when a shot of 8 s or more has
  no action at all (dead). Prototype numbers: refs have big action in 2% of seconds, so a 50 s story has
  room for about 5-10 big moments, each followed by a hold.

### 5. Effects: no shakes, no flashes, no star bursts; a dust cloud for fights

**(a) References.** Measured: zero screen shakes in 19 of 20 (the scale-and-shift search found no
oscillating moves), no white flashes, and no star bursts in any of the 400+ frames I studied. Their effects
are:
- **The fight cloud**: a boiling white dust cloud that hides a scuffle for about 1-2 s, with bits flying
  off the edge (ref 10 at 27.7 s, ref 11 at 18.1 s, ref 13 at 50.4 s; sheet 09).
- **A dip to black** for a time jump (ref 17 at 29.1 s, 0.7 s in all).
- Objects that fly in on arcs (ref 20), sweat drops and small marks on the face.
Effects are **local** and **rare**: refs average 8 frames a minute where over 10% of the picture
changes.

**(b) Ours.** Per video: 5-16 `fx: 'flash'` events (fasting 14, snake-bite 16 in 48 s: one every 3 s),
each a white overlay to 18% over 3 frames and a 9 px screen shake in body shots (`video.tsx`); plus 2
`shake()` calls of 12-26 px and 8-9 `Burst` stars a video. Sheet 10: fasting 20 s ("DRY!") shakes and
flashes the whole frame; fasting 26 s flashes on the cut into the room; quit-sugar 17 s burst + flash +
shake; snake-bite 14.1 s a burst lands **on the green drop's face** (the 2026-11-22 checklist mistake
"a burst on a face" again). This is why 79-214 frames a minute change over 10% of the picture.

**(c) Why it matters.** An effect every 3 seconds is no longer an effect; it is noise, and a shake moves
every pixel, so it is the biggest single source of our "restless" numbers. It also costs readability:
a burst covers the face exactly when the face should react.

**(d) Engine change.**
- `video.tsx`: delete the automatic shake; the flash becomes opt-in with `"fx": "flash"` allowed **at
  most once a video** (default zero), and never on a cut.
- `act.tsx`: `Burst` at most **2 a video**, radius at most 120 px, placed by the staging check away from
  faces (at least 1.2 face radii from any `focus`). `shake()` at most **one a video**, 12 px, 0.25 s, only
  for a real impact the script names.
- New in `act.tsx`: `FightCloud` (a boiling cloud from the kit's flat white + ink line, 6-9 lobes that
  re-seed every 3 frames, bits flying off; 1-2 s; limbs or props poking out at random), and `Sweat` /
  `Marks` (small face marks). Drawn in look v8, no glow.
- **CHECK**: count whole-frame events on the render: a **flash** = mean brightness of the picture
  rises by 8+ levels in 3 frames over 60% of the area; a **shake** = the picture shifts 3+ px and back
  within 0.3 s (the shift search in `measure.py` at a 1-frame gap). Fail on more than 1 flash or 1 shake.
  Burst count and the face distance go in `toon:staging` (it already measures graphics against heads).

### 6. Talking: the face talks, the body does not

**(a) References.** Sheet 13 (ref 20 at 2-3.5 s, every frame): the stomach's body, arms and eyes are
frozen; **only the mouth moves**: two shapes (a closed smile line and an open "D"), swapped about **9
times a second**, each held 2-3 frames (measured: 8.8 changes a second, median 3 frames apart). The pupils
shift to look at the other character every few seconds; a brow flicks on an emphasis. The listener is
completely still. People in the doctor room do the same: mouth only, an occasional hand move.

**(b) Ours.** Our mouth is a smoothed opening (`talkSmooth`, 0.1 s average) mapped to 3 shapes; that
is fine and the owner asked for it after "flicker". But our characters also move their bodies while
they talk: creatine `voiceSq` (a squash on the voice), `breath` sway, fasting's stomach pounding a fist on
"Feed me!" and hopping; in snake-bite the drops wave arms. Speaking characters are where most of our
"small motion" outside the effects comes from.

**(c) Why it matters.** When only the mouth moves, the one gesture a character makes (a point, a fist,
a take) is seen. When everything moves on every line, nothing is a gesture.

**(d) Engine change.**
- `play.tsx`: `bodyFace` stays; add the reference's look-shift: pupils glance to the listener on the
  first word of a reply and back after 1-2 s (`lookAt(s, who)`), held, not drifting.
- `organ-act.tsx`: gestures only on the line's **key word** (one per line at most; `gestureAt` already
  holds between steps): the stomach raises a fist on "FEED", holds, lowers after the line. No `pounding`
  loops longer than 0.8 s.
- Blink stays (`blink`, every 2.6-4.5 s).
- **CHECK**: in `toon:motion` (it already reads every joint), during each line measure the speaker's body
  points except the mouth and pupils: fail when they move on more than 30% of the line's frames; and the
  listener's on more than 10%.

### 7. The dive into the body: 0.5 s, but the zoom lands in 0.13 s

**(a) References.** None of the 20 dives; they cut straight in (ref 05 at 30.1 s, ref 03 at 21 s). Three
references make a short camera zoom at all (ref 11 at 19.4 s: about 3% per 0.2 s, i.e. 15% a second; ref
15 and ref 07 small zooms under 2%).

**(b) Ours.** The owner's hook rule asks for a dive inside the first shot, and the code makes it in 0.5 s
with a smoothstep and a zoom of `1 + e² · 9` (`creatine.tsx` `ShotA`, `quit-sugar.tsx` `ShotA`). Because the
zoom is squared on top of an ease, almost all of the 10x happens in the last 8 frames (sheet 11: quit-sugar
3.77-3.90 s, creatine 3.30-3.43 s); the cut detector sees three "cuts" in 3 frames. Snake-bite has a
one-frame size jump at 0.1 s (sheet 10, row 6).

**(c) Why it matters.** A zoom that lands in 0.13 s is a jump to the eye, not a dive, and it is the
very first thing a viewer sees.

**(d) Engine change.**
- One shared `Dive` in `act.tsx` (the creatine and quit-sugar copies are the same idea twice): duration
  **0.8-1.0 s**, zoom interpolated **on a log scale** (`Z = 10^e` with an ease-in-out `e`), so the zoom
  speed feels even, and the portal ring growing with it.
- **CHECK**: per-frame zoom ratio from the shift-and-scale search at a 1-frame gap: fail when any frame
  zooms more than 6% from the one before (at 60 fps) or the picture jumps in one frame outside a cut.
  (Whether to keep the dive at all is an owner question below.)

### 8. Line weight under zoom: solved mostly by not re-framing

**(a) References.** Same line in every shot (agent 1 finding 6), because they never re-frame.

**(b) Ours.** Every re-frame (1.28-1.6x) and the dive scale the drawing and its outline with the camera:
5-6 px becomes 8-12 px (agent 1, fasting 11 s).

**(c) Why it matters.** As agent 1 said: one hand drew it.

**(d) Engine change.** Finding 1 removes most re-frames; for the one punch-in and the dive, pass the
camera's zoom to the kit (agent 1's context) or try `vector-effect="non-scaling-stroke"` on outlines
(one-shot test first: Chrome applies it with CSS transforms on the parent, which needs checking in a
Remotion still). **CHECK**: agent 1's outline-thickness check, run per shot.

### 9. Captions and labels: their motion already matches

**(a) References** (sheet 12). The word pops in over 2-3 frames with an overshoot (ref 10 "THERE":
small, big, settle), holds, and clears in the pause; some use short phrases (ref 05 "OH MY GOSH").
Labels (TRACHEA, VEIN) appear with the shot and stay, no animation (agent 1 finding 11).

**(b) Ours.** `WordCaption` pops over 0.08 s (0.14 s for the key word): the same. Name tags `CharTag`
arrive with a drawn arrow and leave after 2.5 s (owner's rule).

**(c), (d)** No change to the caption. Place labels: the `stay` option of agent 1 finding 11, appearing
with the shot, no pop. Our yellow number plates pop and leave per line; agent 1 cuts them to one a video.

### 10. Animation cadence and acting style (for information)

**(a) References.** Measured: during action, 40-70% of frames in most references are exact repeats
(refs 03, 04, 05, 06, 07, 11, 13, 15, 19, 20): they animate **on twos or threes** (12-15 drawings a
second) inside a 30 fps file. Acting is cut-out: whole parts slide, rotate and swap; there is almost no
squash, stretch, anticipation or overshoot on bodies. The emotion is in the eyes.

**(b) Ours.** 60 fps, every frame new (5-20% repeats), with the acting kit's anticipation, overshoot and
squash. This is technically better than theirs.

**(c), (d)** No change proposed. Our smoothness is an advantage **once the amount of motion comes down**
(findings 2, 5, 6). Rendering on twos would be a style choice for the owner, not a fix.

---

## Part C. Things they do that we do not do at all

1. Hold one place for 15-30 s with nothing but a mouth moving (finding 2).
2. The black LATER card with the same framing before and after (finding 3).
3. The fight dust cloud (finding 5).
4. Objects sliding in from the frame edge into a held place, and levels filling (finding 4).
5. Cross-cutting between two characters in two organs, each side held several seconds (finding 1).
6. A completely still listener.

## Part D. What we already do well (keep)

1. **A locked camera.** No pans, no creeps, no zooms inside a shot: the same as 17 of 20 references.
   The 2026-11-21 steady-camera work holds (both refs and ours measured zero camera moves in every hold).
2. **No transitions.** Hard cuts only, like theirs (the references' one fade, ref 17, is a dip to black
   for a time jump).
3. **Rooms hold still.** Fasting's room at 2-6 s changes 0.1% of the picture a frame: reference level.
4. **Caption motion** matches theirs (finding 9), and our caption is cleaner.
5. **The DAY calendar cards in quit-sugar** are our own version of the time card and read well.
6. **The acting kit** (`keyed`, `take`, `hop`, `gestureAt`): real key poses, holds, anticipation and
   overshoot. Theirs is simpler cut-out animation; ours is better when used rarely.
7. **No flicker in mouths** (`talkSmooth`) and **60 fps**.
8. **Checks that read every frame** already exist (`toon:look`, `toon:camera`, `toon:motion`,
   `views.test`): the new checks below are extensions, not new systems.

---

## Part E. Top 10 camera and motion upgrades, ranked

| # | Upgrade | Where | Target | Check (automatic, on the final render) |
|---|---|---|---|---|
| 1 | **Cut budget, no re-framing inside a place** | shot files (`view` without `byLine`), `director.ts`, blueprint | at most 6 cuts a minute (aim 4); median hold 6 s+; body place 8 s+; one punch-in a video | cut list with kinds (place / re-frame / card); `views.test` fails a changing `view` in a body shot |
| 2 | **Remove whole-frame shake and flash**; effects rare and local | `video.tsx` (auto shake, `fx: 'flash'`), `act.tsx` (`Burst`, `shake`) | 0-1 flash, 0-1 shake, 2 bursts a video, none within 1.2 face radii of a face | flash and shake detector; burst count and face distance in `toon:staging` |
| 3 | **Measure the picture, not the caption**: new still/motion bands | `toon_look.py` | picture still 80%+; action seconds 25% or less; big action 5% or less; 40 or fewer frames a minute over 10%; a 4 s fully still stretch | the same, in `toon:look` |
| 4 | **Time cards with same-framing before/after** | new `TimeCard` in `hud.tsx`, `toon.json` `card`, `state` on a shot | 0.8-1.2 s, hard cut in and out, same view both sides, 3 a video at most | card in/out pairs, framing match across the card |
| 5 | **Enter/fill/reveal helpers; one action then a hold** | `act.tsx` (`enter`, `leave`, `along`, `fill`, `reveal`), `anatomy.tsx` entry slots | action 0.3-0.8 s, hold 1.5 s+ after | big actions 1.5 s+ apart in a shot; no dead 8 s shot |
| 6 | **The face talks, the body holds** | `play.tsx` (`lookAt`), `organ-act.tsx` (gesture on the key word only), retire `voiceSq`/talk sway | speaker's body moves on 30% of line frames or fewer, listener 10% or fewer | in `toon:motion` |
| 7 | **Calm backgrounds: no full-frame flow** | `micro3.tsx`, place files, `toons-look.md` rule | moving background area 5% of frame or less | heatmap rule: 5% of pixels or fewer change in 5%+ of frames |
| 8 | **One shared, even dive** (if the owner keeps it) | `act.tsx` `Dive`, used by every hook | 0.8-1.0 s, log-scale zoom | per-frame zoom 6% or less; no one-frame jump outside a cut |
| 9 | **Fight cloud and face marks** as the reference-style effects | `act.tsx` `FightCloud`, `Sweat`, `Marks` | 1-2 s, flat white + ink, no glow | sheet approval by the owner first |
| 10 | **Line weight under the punch-in and the dive** | `video.tsx` to `kit.tsx` zoom context (agent 1 #6) or `non-scaling-stroke` | 4-7 px on screen | agent 1's outline check per shot |

## Part F. Points that need the owner's decision

1. **The dive.** His rule (2026-11-21) is that the hook dives into the body inside the first shot. No
   reference dives; they cut. Options: keep the dive but make it 0.8-1 s and even (upgrade 8), or a hard
   cut into the body on the hook word. Recommendation: keep it, fix the speed; it is ours and it is good
   when it is not a jump.
2. **Fewer impacts.** In the creatine review (2026-11-21) he approved bursts, shakes and speed lines as
   the "impact kit". The measurements say we now use them every 3 s and they are the main reason our
   picture is restless. Upgrade 2 cuts them to 1-2 a video. He should see one before/after slice.
3. **The time card** is a cut to a black card, not a transition, so it fits "no transitions". He should
   still approve the look (black or brand-dark; plain text; "16 HOURS LATER").
4. **Cut budget against the script.** At 4-6 cuts a minute a 50 s story has about 4 places and 2-3
   cards. That is a script and blueprint change (agents 3-5), and it means fewer, richer places.
5. **"Flow never stops"** (`toons-look.md`, owner 2026-11-18: a flow that stops reads as a bug). Keep the
   flow, but as a few small particles in a band, not the whole background. He should confirm.
6. **On twos** (finding 10): not recommended; listed only so it is a conscious choice.

Nothing here copies a reference character or joke; it is their pacing (hold, enter, card, cut rarely)
applied to our own cast.
