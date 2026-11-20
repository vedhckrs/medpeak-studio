# Handoff log

Two Claude accounts work on this repo, on two machines, one at a time. This file is how one session
tells the next what happened. Newest entry on top. Read the top entry before you start; add one before
you stop. The rules are in `CLAUDE.md`.

---

## 2026-11-20 - Windows PC (commits by VED) - branch `feat/toons-engage`

**The owner's decision today: everything is code-drawn again.** After the 10-second test of the AI-sheet
doctor on 2026-11-18 he said "stop here ... this is failed", and today: "you switch full code made only now
create all my character sheet props and all with code as ref video follow visual ... use subagents opus 5.5
... final jpg for approval 16:9 ... consistency match visual not look off". So the stock kits, the Adobe
Animate rig, the Adobe rebuild roadmap and the AI character sheets (all in the entry below) are **dropped**.
Nothing from `pipeline/animate/` is used by look v8. Do not propose those roads again unless he asks.

### What changed (look v8, all in `src/toons/v8/`, nothing in the old engine was touched)

- `kit.tsx`: the ONE shared drawing kit (outline colour and two thicknesses with non-scaling strokes, the
  body / skin / cloth palettes, `shade()` and `tint()`, `Shape`, `Eyes` with ten moods, `Mouth` with nine
  shapes, `TinyArm`, `TinyLeg`, `NameTag`, and the board pieces). Every sheet is drawn with it; nobody
  edits it to suit one sheet.
- Rules and our cast identities: `skill/medpeak-health/references/toons-v8-style.md` (ten rules, read from
  sharp frames of the 20 reference Shorts: thin even dark outline, flat colour with one darker tone, two
  white eyes with a small pupil, a tiny mouth, real anatomy simplified, job characters with one prop and a
  name tag). We follow their drawing language, never their characters.
- The cast, 67 characters, each a component in the 200-unit figure space:
  - `people-rig.tsx` + `people-sheets.tsx`: one parametric person rig (`Person`, `PersonAt`, `HeadAt`, `Hand`;
    views front / three-quarter / side as real drawn views; poses; seven expressions; six shared hands) and
    8 people: Dr. Mira, Sam (patient), Mom, Dad, Kid, Grandpa, Grandma, Baby. Dad and Grandma are new.
  - `organs-a.tsx` (13): stomach, food pipe, intestine, liver, kidney, bladder, lungs, heart, brain, tooth,
    bone, pancreas, gallbladder. `organs-b.tsx` (12): eye, nose, ear, tongue, skin, nail, throat, windpipe,
    thyroid, muscle, nerve, blood vessel.
  - `cells.tsx` (15): red cell, white cell, platelet, egg cell, sperm, fat cell, antibody, cilia, sugar,
    insulin, melatonin, cortisol, stomach acid, histamine, cholesterol.
  - `germs.tsx` (15): virus, bacteria, fungus, parasite worm, allergen, venom, nicotine, tar, alcohol, poop,
    vaccine, antivenom, creatine, water drop, pill.
  - `animals.tsx` (4, nine drawings): dog (stand, snarl, head close-up), snake, bee, mosquito.
- `props.tsx`: 30 props (15 clinic, 15 home), no faces.
- Each sheet has its own entry file (`entry-*.tsx`), so one sheet's mistake cannot break another's render.
  `node pipeline/toon-v8-sheets.mjs [name]` (or `npm run toon:sheets`) renders them to
  `out/toons/sheets-v8/` (1920 x 1080 JPG; `out/` is not in git). It uses the `remotion()` helper, so it
  runs on macOS and Windows.

### How it was made

Seven Opus 5.5 subagents, one per sheet group, each given the kit, the rules and the reference frames, each
rendering and looking at its own sheet several times. Then one review round by the main session across all
sheets side by side (a common layout, a more anatomical heart, the nail's face moved off the nail, nicotine
redrawn as smoke, the dog's close-up head matched to the body dog, a "glasses" fault on small people fixed
by thinning eye lines on small figures, and so on).

After the owner's first look ("the arm coming up on shoulder why?"): the round top of each sleeve drew an arc
on top of the body. `people-rig.tsx` now fills the upper half of that round end with the garment's colour
where it lies over the garment (`shoulderPath()`), so the shoulder line runs from the neck into the outside
of the arm and the arm's inner line starts at the armpit.

### What was run

- All 17 sheets rendered and looked at; `00-overview.jpg` (a contact sheet of them) made with PIL.
- `tsc --noEmit`: no errors. `pipeline/test/toons.test.mjs`: 36 of 36 pass (the old engine is unchanged).
- A check of every v8 file: no hard-coded stroke colours, no gradients, no blur or filters.

### Later the same day: scenes and the rabies storyboard (wait for the owner's approval)

After the owner approved the cast and props, the next piece was drawn in the same look: the places of the
rabies video and nine storyboard frames (1080 x 1920 stills). **Nothing is in the engine or in a video yet.**

- `src/toons/v8/scene.tsx`: the shared scene pieces (`Scene`, `Layer` = a full-frame SVG in frame pixels,
  `Put` = place a 200-unit cast figure, `Label`, `Tag`, `Bubble`, `CAPTION_BAND`).
- `src/toons/v8/scenes-rooms.tsx` (+ `entry-scenes-rooms.tsx`): `KitchenRoom`, `ClinicRoom` and the frames
  C1, C2 (kitchen: Mom and the Kid, the scratch, washing under the tap, tag "15 minutes") and D1, D3
  (clinic: Dr. Mira and the Kid, the plaster, the vaccine vial). People at `PEOPLE_SCALE = 3.2`, feet near
  y 1740. It has its own `handAt` (wrist and palm of a pose in frame pixels, so props sit on a hand); it
  copies the rig's arm arithmetic, so it drifts if the rig's arm math changes: export it from the rig when
  v8 goes into the engine.
- `src/toons/v8/scenes-body.tsx` (+ `entry-scenes-body.tsx`): `ArmPlace {bite, wall, air, punctures}` (a cut
  through the bitten forearm: skin, deeper skin, fat, nerve, muscle) and `NervePlace {view: entry | road |
  caught, far}`, and the frames A (hook, the virus on the nerve road, the brain far away), B (the dog's
  teeth at the bite, the virus rides in on spit), M2 (the long road, tag "2-3 months"), E (the wall of
  antibodies after the vaccine), M3 (white cells hold the virus).
- **No mirrored adults.** The owner rejects flipped characters and Dr. Mira's pocket, pens and stethoscope
  swap sides when mirrored. In every room frame the adult stands on the left in the real three-quarter
  view; only the Kid (no one-sided detail) is mirrored to face left. A real left-facing view in the rig is
  the proper fix before animation.
- New poses in `people-rig.tsx`, additive only (no approved pose changed): `showArm`, `showArmUp`,
  `tapHand`, `offer`, `thumbsHold`, `thumbsUp`, `worriedHold`, `worriedPoint`, `explainLow`, `youSee`.
- `Antibody` got an optional `color` prop (default unchanged). **Open question for the owner:** the
  antibody (#9d90d8) and the virus (#9d8cc2) are almost the same purple, so in frame E the wall looked like
  the virus's friends. Frame E uses teal antibodies. If he agrees, make teal the antibody's own colour and
  re-render the cells sheet (that changes an approved sheet, so only on his word).
- `node pipeline/toon-v8-sheets.mjs --scenes [name]` renders the frames to `out/toons/scenes-v8/`. The three
  16:9 approval sheets (`storyboard-rabies-1.jpg`, `storyboard-rabies-2.jpg`, `places-rabies.jpg`, 3840 x
  2160) are in `out/toons/scenes-v8/boards/`; they were laid out with a small PIL script that is not in the
  repo (a contact sheet of the frames with the script lines under them).
- How: two Opus 5.5 subagents (rooms; body), three review rounds each by the main session.
- Run: `tsc --noEmit` clean; `pipeline/test/toons.test.mjs` 36 of 36; all 17 approved sheets re-rendered
  from the current code and compared with the approved copies in `toons-boards/v8/`: 0 pixels differ.
- Weak spots, told to the owner: the Kid has no real shrug in C1 (face only); in M3 the white cells rest a
  hand on the virus rather than clasp it; in B the first spit drops sit inside the dog's mouth next to its
  teeth; the cast virus carries its gold key in every frame; the upper wall of both rooms is plain on
  purpose (the tag sits there).
- Next, after his OK on the storyboard: bring v8 into the engine (cast, places, poses, a left-facing view),
  animate, and re-render rabies. Not started.

### Evening: the owner's feedback on the storyboard, and what changed

He looked at the storyboard and said: "all characters nose not proper side view and hand also overlap
like patch" and "i want deeper macro view inside human body, microscopic level". Three changes, all
waiting for his look:

- **Nose and hands, in `people-rig.tsx` (this changes the people sheets he approved, on his word).**
  The three-quarter nose was a thin angle line lying on the far eye; the side view had almost no nose. Now
  every person has one nose family in all three views (side: the profile carries a rounded nose that
  sticks out; three-quarter: a small skin-filled rounded nose below the eyes; front: a small "c"), scaled
  by a new build field `nose`. Forearm and hand are one outlined shape (no ring at the wrist). New hand
  kind `rest` (fingers together) for a hand lying on the body; the chest poses use it. Arm, wrist and palm
  positions did not move. The copies in `toons-boards/v8/` are still the OLD approved people sheets:
  replace them with the new ones only after he approves the new look. The organ, cell, germ, animal and
  prop sheets are unchanged (0 pixels differ).
- **The inside-the-body frames were redrawn at the scale of cells** (`scenes-body.tsx` rewritten; the
  forearm cut and the nerve "road" are gone). `MicroPlace {view: wound | junction | axon | tissue}` plus
  `MicroFront` (foreground cell edges drawn over the characters), each place in three flat planes for
  depth. Frames: A = the virus with its key at the nerve ending's keyhole locks, the brain in a thought
  bubble; B = a fang tip through the skin cells, the virus surfing in on saliva between torn muscle
  fibres; M2 = inside the nerve fibre, a tunnel that darkens into the distance, the virus carried along a
  rail; E = teal antibodies at the locks and on the virus's spikes; M3 = white cells hold the virus
  between the cells. The biology is true to rabies (bite, muscle, nerve ending, slow travel inside the
  nerve, antibodies stop it before the nerve).
- **Room frames:** re-checked with the new rig; in C2 the two hands no longer touch (the sink moved 36 px
  right); no hand overlaps a hand or lies flat on a body.
- The approval sheets are now four: `storyboard-rabies-1.jpg`, `storyboard-rabies-2.jpg`,
  `places-rabies-rooms.jpg`, `places-rabies-body.jpg` in `out/toons/scenes-v8/boards/`.
- Run: `tsc --noEmit` clean; `toons.test.mjs` 36 of 36; all scene frames re-rendered from scratch.
- Still open: his OK on the new noses and hands, on the storyboard, and on teal antibodies. Weak spots:
  the three-quarter nose is small; the back-plane cells in the lower half of A and E repeat like
  wallpaper (the caption covers most of it); the carrier in M2 reads as a walker only at a second look;
  white cells and antibodies rest a hand on the virus rather than clasp it.

### Night: APPROVED by the owner ("Yes, approved")

He approved the new noses and hands, the microscopic body frames and the rabies storyboard. Recorded:

- `skill/medpeak-health/references/toons-boards/v8/` now holds the approved state: the ten people sheets with
  the new nose and hands, the cells sheet with the teal antibody, and in `storyboard/` the two storyboard
  sheets, the two places sheets and the thirteen scene frames (9 frames + 4 empty places) at full size.
- The antibody's own colour is now teal (`cells.tsx`, `C.antibody`), so the sheet matches the approved
  frames (it was a purple almost like the virus). The scenes still pass `color={CLOTH.teal}`; harmless.
- **Next (not started): the animation phase.** A plan was put to the owner: first a short motion test in
  1080 x 1920 at 60 fps (one kitchen shot and one inside-the-body shot, with the existing rabies voice) for
  his approval of how things MOVE, then the whole rabies video. The rig still needs, before that: a real
  left-facing three-quarter view (today only the Kid may be mirrored), talking mouth shapes driven by the
  voice timings, blinks, and pose-to-pose arm moves; `handAt` should move from `scenes-rooms.tsx` into the
  rig. The rabies voice, sfx and music are already on this PC in `public/toons/` (not in git).

### Not done, and open

- **APPROVED by the owner on 2026-11-20 ("Yes, approved").** The approved JPGs are committed in
  `skill/medpeak-health/references/toons-boards/v8/`. (Written before the approval:) **The sheets wait for the owner's approval.** Nothing of v8 is used in a video yet: `Player.tsx`,
  `characters.tsx`, `humans.tsx`, the stages and rooms still draw the old cast. After his OK the next step is
  to bring v8 into the engine (cast first, then rooms and body stages in the same language), then rabies.
- No rooms, body stages or backgrounds are drawn in v8 yet; no animation of the v8 figures (arms, mouths
  and moods are props, but nothing moves yet).
- Known weak spots, told to the owner: people stand fairly upright and all share one rest stance; the
  thumbs-up hand is small on pose figures; the throat's flap looks a little like a can lid; the venom's
  fang is small; the coiled snake has a few short outline stubs; the bee keeps three colour families.
- The Mac has not run any of this. It needs only `npm install`; nothing else is machine-specific.
- Left in the repo from the dropped roads: `pipeline/animate/*`, `src/toons/look-people.tsx`, the `puppet`
  option in `Player.tsx` / `toon-render.mjs` (inactive unless frames exist in `public/`), and
  `skill/medpeak-health/references/cast-sheet-prompts.md`. Remove them only when the owner says so.
- Magnific: 1,060 credits were spent by Claude on 2026-11-18 (two camera images, one Sunburst test, one
  Recraft test, two Sunburst sheets). The balance also fell by about 4,300 more that day with no call by
  Claude; the owner was told and it is not explained. Nothing was spent today.

---

## 2026-11-18 (day) - Windows PC (commits by VED) - branch `feat/toons-engage`

The owner showed the Mac session's fix plan for rabies (weak hook, same music, one-word captions, text
against the voice, nothing moves) and said the Mac is not working on it: "you start work". Nothing of
that plan had been pushed from the Mac. If the Mac has unpushed work on it, this branch replaces it.

Changed (branch cut from `feat/toons` at `b7f894b`):
- `pipeline/lib/toon-rules.mjs`: format 5 "engage": hook said in 2 s, movement within 0.5 s, no still
  over 1 s in the first 3 s, no still over 2 s anywhere (`motionSpans`, `longestGap`), and "Text says
  what is spoken" for tags and chips. Older formats are not touched.
- `src/toons/stage-macro.tsx`: dial `snap` (a dog's jaws shut across the frame). `director.ts`: the
  dial is registered; the caption box is wider (110 to 970).
- `src/toons/scenes.tsx`, `Player.tsx`, `style.ts`: `STYLE.caption: 'box'`, 2 to 3 words on a black box.
- `videos/rabies/toon.json`: format 5. New hook "You get rabies. Time runs out." (A1), new last line
  "One bite, but you did not get rabies. The vaccine came in time!" (E3, loops to the hook), the bite
  on frame 0, tags fixed ("or just 1 week!" removed, "same day" is now "today", "act in time" appears
  on "act", no tilts), camera pushes on D1, D2, D3 and E3, more events in B2.
- `videos/rabies/toon-timings.json`: the timings of A1 and E3 are removed (their words changed).
- Skill: `toons-script.md` has a "Format 5: engage" section.

Run (Windows 11, Node 24.22.1): typecheck passes, 44 tests pass, rabies passes toon:check, camera,
motion, staging and sound. Eight silent stills were rendered and looked at (jaws, boxed captions).

Second pass the same day (owner: "first build all, don't miss anything, captions 20% smaller"):
captions at 59 px; a hook tag "time runs out"; tags on a grid (x 300, 540, 780); format 5 needs
`"music"` = the slug plus a `"musicPrompt"`, and `toon-music.mjs --slug <slug>` makes that track
(rabies has the prompt; the track is NOT made); the dog lunges into the frame; the virus on the arm is
1.15 times bigger; `STYLE.bodyReact` 0.4; whip into the middle macro, crash zoom on C2, flashes on the
nip and the wall hit. Three tests in `toons.test.mjs` now accept a video's own track before it is made.
Tried and dropped because checks failed: people jumping (200 leg jumps), `bodyReact` 1 (elbow pops in
another video), a virus 1.35 times bigger (its face reached the caption line).
All 9 Toon scripts pass toon:check; rabies passes camera, motion, staging and sound; 44 tests pass.
Third pass the same day (owner: "Yes, 800 cap" for voice and music):
- Voice: all 14 lines voiced on the Windows PC, 287 credits (13 for a first test of A1, 274 for the
  set; the real rate is about 0.43 credits a character, the dry run's "620" is an upper bound).
- Music: `assets/toons-music/rabies.mp3` and its shape, made from `musicPrompt`, **550 credits**. The
  script was capped at 513 but measures the cost only after the track is made, so the total is 837,
  **37 over the owner's 800 cap**. The owner has been told.
- `pipeline/lib/toon-audio.mjs`: the loudness probe ran `sh -c ...`, which does not exist on Windows;
  it now calls ffmpeg directly.
- Rendered `videos/rabies/renders/toon.mp4` (45.0 s, 1080x1920, peak -1.0 dBFS; on the Windows PC only).
- Checks on the real timings: toon:check (hook said in 1.9 s, longest still 1.9 s), camera, motion,
  staging, sound (music 9.0 LU under the voice, no hole) all pass; 44 tests pass.
- NOT run: `toon:listen` and `toon:look` (earshot is not installed on the Windows PC), so nobody has
  checked the spoken words or the look numbers of this render. Not packaged, not uploaded.
The "Not done" paragraph below is from the first pass; voice, music and the render are now done.
Fourth pass the same day (owner, after watching: "check each frame... text overlap... not a viral hook"):
every frame of the render was looked at (contact sheets, 2 a second). Found and fixed:
- Hook: the jaws lasted 0.3 s and were two pink bars. `stage-macro.tsx` now draws a whole snarling dog
  (eyes, brows, nose, fur) that bites on frame 0 and holds for "You get rabies." (about 1 s), then lets
  go on "Time". New macro face `evil` (emotion `angry`): slanted brows, a grin full of teeth.
- The "That morning..." time card is cut (1.2 s of dark screen right after the hook). A test now
  allows a format-5 script without a card.
- Text: tags and chips are drawn on the SCREEN after the camera (`Player.tsx`), so a zoom cannot cut
  them off ("15 MINUTES" and "ACT IN TIME" were cut). A text on the picture must hold a number in
  digits and sit at y 240 to 1300 (rules): "time runs out", "today" and "act in time" repeated the
  caption and are gone. Caption groups no longer end on a joining word ("ME BEFORE THE" / "BRAIN?").
- Overlaps: the people in the home and clinic stand 60 px further back (`"y"` on the cast), so their
  feet clear the caption; the lower defender cells in the caught macro moved clear of it; the alarm
  clock (half out of the boy's close shot) is removed.
- Arm: the dog has an open snarling mouth with fangs and an angry eye; the scratch is 1.9 times
  bigger; "TO THE BRAIN" shows only while the virus climbs.
Re-rendered (43.8 s). All checks and 44 tests pass. No credits spent in this pass.
Known and NOT fixed: in close shots the caption still lies over a body (legs, coat); the doctor's close
shot (D2) holds about 5 s with one pose; the nerve macro (M2) is one picture for about 4 s; the virus
on the arm is still small. `toon:listen` and `toon:look` still not run (no earshot on the Windows PC).
Fifth pass the same day (owner: "the speak of virus not proper", "more detail macroscopic level", "animation
of nerve and animations"). All in `src/toons/look-macro.tsx` unless said; no credits spent:
- Talking: the macro virus has a real mouth while it speaks (opens with `talk`: dark inside, upper teeth,
  a tongue when wide). Before, the evil grin stayed shut and the other faces showed a black oval.
- Detail: skin cells have a dark nucleus core, an inner wall and small bodies; the cut has torn edges and
  red cells drifting in; the saliva has rising bubbles and two more tumbling viruses; defender cells have
  a lobed core and grains.
- Nerve close-up (`MacroInside`) runs on the real clock, not in beats: a bright signal band races up the
  fibre, charged specks flick at the gaps between sheath segments, the sheath shows its wound layers,
  bean-shaped power stations and packets ride the tracks, and the virus walks on two feet.
- `stage-arm.tsx`: a nerve signal every 1.8 s (it was every 5 s), with a yellow core.
This goes against the Mac's look rule "the body lives in moments" (63% of reference frames are still):
the owner asked for more animation. `toon:look` has NOT been run on this render (no earshot here) and
may now fail its "still" share; if it does, that rule needs the owner's decision, not a silent revert.
All other checks and 44 tests pass. Re-rendered (43.8 s).
Sixth pass the same day (owner, with a screenshot of the caught macro: "check all 4 characters face what is
this", "human character hand and arm design not proper", "I want second character speak also"):
- Defender cells: the lobed core I had drawn sat on each mouth like a blob. Removed; the grains keep to the
  rim. The catchers are drawn behind the cells, so one can never lie across a face.
- People (`humans.tsx`, `rig.tsx`): fuller arms (sleeve radii 7.6 / 6.9 / 6.0, bare 5.7 / 5.1 / 4.4), hands
  at 0.8, and the relaxed hand is an open hand with four fingers (it was a square fist with knuckle lines).
  This changes every video with people; the motion test still passes on all scripts.
- A second character speaks: the white cell (voice Adam) says "Got you! You go no further." (line X1, a close
  shot) before the virus's last line. `MacroCaught` takes `cell` (talk, blink); `macroSpotsAt` has a
  `whitecell` spot. Voiced for 12 credits (total for rabies now 849 against the owner's 800 cap).
Re-rendered (45.6 s). All checks and 44 tests pass. `toon:listen` / `toon:look` still not run here.
People look, a PROPOSAL (owner, 2026-11-18: "hand and arm design not proper", a stock character sheet as a
style reference, then "check Dr. Healthcare", then "Yes, doctor first"):
- All 20 reference Shorts are from the Dr. Healthcare channel (checked by their ids). Three preview frames
  of each were looked at (8 videos read closely). Their people: about 4 to 4.5 heads tall, arms of normal
  thickness with the sleeve part of the shirt, small mitten hands that hold things, they sit and turn
  three-quarter, a thin even outline, flat colour, plain rooms.
- `src/toons/look-people.tsx` + still `ToonPeopleLook` (1920x1080): Dr. Mira in that way of drawing (our own
  design): front, three-quarter, sitting with a clipboard, six poses, eight shared hands. It only draws a
  sheet. `humans.tsx` and every video are unchanged by it.
- NOT approved yet. Known weak points on the sheet: her hair is a smooth bob (it should stay curly), the
  sitting pose's far arm is awkward, hands are small in the pose thumbnails.
- If approved: port to `humans.tsx` (4.2 heads re-frames every shot with people; a thin outline reverses
  the ink line for people), then the other five people, then the motion test on all scripts.
**People, a new way: stock artwork + Illustrator + Animate, all by script (Windows PC only).** The owner
rejected the code-drawn people sheet (`src/toons/look-people.tsx`, nothing uses it) and asked for Illustrator
and Animate driven by code, no screen control. What is built, in `pipeline/animate/`:
- `run-ai.ps1` runs an Illustrator script (.jsx) through COM; `ai-inspect.jsx` lists how a stock file is
  built; `ai-extract.jsx` cuts it into transparent PNG parts (400%) and writes `parts.json`.
- `run-an.ps1` runs an Animate script (.jsfl), waits for "RESULT" in its log and then closes the Animate it
  started (Animate does not close itself after `fl.quit()`). `an-sheet.jsfl` lays all parts out.
- `rig-doctor.mjs` cuts elbow and wrist joints into the arms (ffmpeg), works out each pose from joint
  angles, and `an-rig.jsfl` draws it in Animate: one layer per piece, one keyframe per frame, transparent
  PNG frames out. `node pipeline/animate/rig-doctor.mjs sheet` gives 8 poses, `... clip` a 4 s talking test.
- **The owner chose the doctor himself (same day): Magnific #3908853, "Female doctor character model sheet
  with walk cycle animations and lip syncing".** `rig-doctor.mjs` now builds that one. Its artwork already has
  upper arm, forearm and hand pieces and seven lip-sync heads, so nothing is cut by ffmpeg any more. Parts
  are cut at 200% (`ai-extract.jsx` takes the scale as a 4th argument; the spec can give a `z`). The first
  doctor (#10005316) was my own pick without his OK and is dropped. Rule from the owner: show a numbered
  options sheet and build only what he picks. The channel is for a global audience, not an Indian one.
- **Upgrade the owner approved, done and run (2026-11-18):** `an-rig.jsfl` builds a real rig: one graphic
  symbol per part with its origin on the joint, hand / mouth / walk as symbols with several cels, layers
  parented like a skeleton (parenting must be set AFTER the matrices, on every keyframe, or Animate moves
  the children). `rig-doctor.mjs` does the motion: overshoot and settle, forearm and hand arriving after the
  upper arm, breathing and weight shift, blink, glance, eyebrows, five gesture hands (point, palm, open,
  offer, fist), mouth from the word timings of rabies line D1 (no new credits), an 8-step walk-in, a push-in.
  Run and looked at: pose sheet (8 poses) and a 6.9 s voiced clip (208 frames). Known gaps: Animate's own
  camera refused the script call (`camera.setPosition`: "Argument number 1 is invalid"), so the push-in
  scales the rig instead; the walk is the sheet's side view and cuts to the front view; the middle row of
  hands on the sheet is not cut (it sits inside group 94); not yet joined into the Toons video.
- **Blink and walk fixed after the owner's review (same day):** part 235/239 is the eye's outline, not a lid,
  so the closed eye is now made in her own colours (`closedEye()` in rig-doctor.mjs: skin lid, eye-shadow, lash
  line); a blink narrows the whole eye, shows the closed lid for 3 frames, reopens. The walk now moves one
  measured stride (72 units) per walk picture at a steady speed so the planted foot does not slide, comes in
  from the right (the walk is drawn facing left). The sideways squeeze was rejected by the owner ("use proper
  character angles"): the turn now uses the sheet's own standing side view (3 frames) and three-quarter view
  (4 frames), cut with rect mode as `view-side` and `view-q`, then the front rig. Rule: never fake an angle by
  flipping or squeezing when the sheet has that angle drawn.
- **60 fps, a walk with real foot contact, a smoother turn (owner's request, 2026-11-18):** output is now
  1080 x 1920 at 60 fps. `walk-rig.mjs` reads the eight walk drawings as a skeleton (each drawing is nine
  separate pieces; the long axis of each piece gives hip, knee, ankle and bone angles), so the walk is drawn
  at any moment between two drawings, and the foot that carries her is held on its spot while the body moves
  over it (drift 0 px by construction; stride is about 414 units a cycle, not the 576 guessed before). She
  stops into a standing pose fitted to the sheet's side view, which fades in over it; then the side view fades
  off the three-quarter view and that fades off the front rig, all three lined up on her head. Honest limit:
  the turn is still three drawings blended, not a drawn rotation, and a faint double body shows for a few
  frames in each blend.
- **The turn, final form (owner chose it, 2026-11-18):** the blend was rejected, and motion-estimated
  in-betweens (ffmpeg minterpolate) smear her face, so no blending is used. The turn is four whole angles one
  after the other: side (drawn), one AI angle between side and three-quarter, three-quarter (drawn), front
  rig. The AI angle was made with Magnific change-camera from the three-quarter view (rotate 22, 1k, 80
  credits, owner's OK) and cut out with `pipeline/animate/cutout.mjs` (removes only the white joined to the
  edge, so the white coat stays). It lives in `stock/doctor-3908853/turn/a2.png` + `a2.json`, not in git;
  without it the turn simply skips that angle. A second AI angle (rotate 338) turned the wrong way and is
  not used (80 credits lost). The account balance fell by 1,709 over that hour, 1,549 more than these two
  images; the owner was told and it is not explained yet.
- **Fixes after the owner's frame review (2026-11-18):** (1) pink slivers at the elbows were the bare arm
  that lies under each sleeve in the artwork: the bare upper arm is left out and the bare forearm is trimmed
  to its wrist end (`front-251w`, `front-260w`, made at run time). (2) hands left the frame after the push-in:
  the gestures are tighter and the push-in is 8% at most; the run prints how near the wrists come to the
  sides. (3) **Layer parenting is now off by default** (`RIG_PARENT=on` to try it): with it on, a full
  410-frame render lost her right upper sleeve from every frame, while 12- and 100-frame renders with the
  same data were right. So the .fla is one symbol per part on its own layer, not a parented skeleton.
  `RIG_ONLY="from,to"` renders only those frames, for quick tests.
- **Hands, after the owner's close-up review (2026-11-18):** a gesture hand now starts 6 units inside the
  cuff and is drawn behind the sleeve, so its cut wrist never shows; the bare-wrist piece is shown only with
  her own relaxed hand. Wrist points were re-measured on a grid. `hand-27` is two clasped hands, not a fist,
  and is no longer used; `hand-36` (flat palm, facing us) is the new "stop" hand and stands upright.
  `an-rig.jsfl` sets `fl.scriptTimeoutEnabled = false` (no "running for a long time" box) and re-fits the page
  after the time line has filled (the zoom is set twice to make Animate re-centre). The voice layer now goes
  on top instead of in the middle of the stack.
- **No "Publishing" box (owner asked to hide it, 2026-11-18):** Animate shows that box on every
  `exportPNG` of one frame. `fl.suppressAlerts` alone does not hide it. Exporting all frames in ONE call
  (`doc.exportPNG(uri, false, false)`) with alerts suppressed does: the box was seen in 0 of 8,584 checks over a
  full 410-frame run (44 of 464 before). That route writes 4500 x 8000 frames named from 0001 (300 dpi; the
  publish profile's PNG size is ignored), so ffmpeg scales them to 1080 x 1920. A full run takes about 9
  minutes and 513 MB of temporary frames in `out/animate/doctor-frames`. `RIG_SEQUENCE=off` goes back.
- **Hands the right way round, and the export put back (2026-11-18):** the owner saw every gesture hand
  facing the wrong way: each hand's `side` in `HANDS` was the opposite of what the drawing shows, so all five
  are swapped (the code comment says how to read a drawing's side). The two raised hands (wave, stop) showed
  their nails, so the back of the hand faced us: they are cut again without nails (`noSmall` in the spec,
  parts `hand-35p` and `hand-36p`) and now read as open palms; point, stop and wave bend the wrist to stand
  upright. **The one-call export is no longer the default:** once the owner set Animate's export back to 72 dpi
  (he had set 300 by mistake, which is why frames were 4500 x 8000), that route stopped on the "Export PNG"
  settings window and waited for a click (seen in 1316 of 1599 checks, no frames written). Default is again
  one call per frame, which shows the Publishing box but never waits; `RIG_SEQUENCE=on` uses the one-call route.
- **She is in the rabies video (owner said continue, 2026-11-18).**
  `node --import tsx pipeline/animate/rig-doctor.mjs shot rabies D` makes her performance for shot D from the
  script's own lines, words and timing (30 fps, 362 frames; D1 explain, D2 point, D3 both hands open) into
  `public/toons/rabies/animate/D-doctor/` with a `meta.json`. `toon-render.mjs` sees that folder and gives the
  actor a `puppet` (director.ts `ToonPuppet`); `Player.tsx` then shows the frames where the code-drawn doctor
  would stand, feet on the same floor, inside the camera. Nothing is written in toon.json, and a machine
  without the frames (the Mac) still draws the old doctor by code, so the two machines render different
  doctors until the frames are made there or copied. Run and looked at: stills and the full render
  (`videos/rabies/renders/toon.mp4`). Open: she is flat stock art with no outline and the kid beside her is
  the code-drawn ink style, so they do not match; the other people need the same treatment (owner picks each
  from an options sheet first). `toon:listen` / `toon:look` still cannot run on this PC.
- **NEW DIRECTION, owner's decision 2026-11-18: a full rebuild as an Adobe pipeline.** The stock doctor does
  not match the code-drawn look, so the videos are to be made in Illustrator + Animate + Premiere Pro, all by
  script, on both Mac and Windows, rabies first. His seven phases: (1) every character as a proper vector
  sheet in Illustrator, (2) a cast list he approves, (3) core engine files for Illustrator and Animate,
  (4) every shot storyboarded in Illustrator, (5) animation in Animate, (6) Premiere Pro for camera,
  captions, transitions, effects and graphics, (7) final 1080 x 1920, 60 fps MP4. People come from the same
  Magnific stock family as the doctor (premium, not AI; preview file names end in `_40831-NN`); the virus,
  cells and organs are to be drawn by code in Illustrator. Phase 0 (proof test) is done: an .ai and an .svg
  both arrive in Animate as real vector shapes with no dialog and become symbols (`doc.importFile(uri, false)`),
  so the new pipeline can be vector, not PNG pieces; Premiere Pro 2027 and Media Encoder are installed and
  Premiere's script route (`/C es.processFile`, fresh launch only) is already proven in the owner's OncoSphere
  pipeline. A cast options sheet (9 from the family, 3 kids from other families, no baby found yet) waits
  for his picks: `out/animate/cast-options.png`. The Mac side is untested: launchers there need osascript
  instead of COM / PowerShell, and the Adobe apps installed.
- **Cast picked by the owner (2026-11-18):** doctor #3908853 (kept), mom #3908847, patient #4469212
  (the "student" sheet), grandpa #4469210 (the "scientist" sheet, bald with glasses), kid #65613491 (another
  artist: the doctor's series has no child). No baby yet. The four new kits are downloaded to
  `stock/<role>-<id>/` (git-ignored) and opened once with ai-inspect.jsx (`work/structure.txt`,
  `work/doctor-source.ai`). Their artboards differ (mom 1611 x 597, patient and grandpa 7200 x 2200, kid
  4830 x 2240 in 5 layers), so sizes must be matched when the sheets are built. A line-up for his approval is
  `out/animate/cast-lineup.png`. **Magnific credits: STOPPED.** The balance fell 124,088 -> 122,379 -> 120,039
  during this day's work; only 160 of that is explained (two change-camera images). The second fall came
  around these four stock downloads, and the owner's rule is to stop and tell him if a download costs
  credits. No more Magnific calls until he says so.
- **Grandpa changed (owner, 2026-11-18):** the "scientist" kit read as a senior doctor (white lab coat, tie).
  He did not want it recoloured ("i want new dont edit this") and picked Magnific #29673007 (white beard,
  glasses, orange jumper; another artist, flatter style), now in `stock/grandpa-29673007/`. The old
  `stock/grandpa-4469210/` is unused. He also said the patient "looks off" (orange skin, more realistic face
  than the women of the series); a skin-match mock-up was shown, no decision yet. The cast now mixes four
  art styles (doctor+mom, patient, grandpa, kid); he has been told. Credits: the balance was 120,039 before
  and straight after this one download, so a stock download does not charge at once; the day's earlier fall
  of 3,889 beyond the 160 approved is still unexplained (a delayed charge is possible).
- **AI character sheet test (owner asked, 2026-11-18):** GPT 2.6 Sunburst on Magnific has no SVG output
  (raster only), and Magnific's own trace tool answers "SVG conversion is disabled for your account". What
  works: generate an "exploded" parts sheet with Sunburst (2K, High, thinking High, 3:2, the doctor's front
  view as a style reference; 175 credits, balance 120,039 -> 119,864, exactly as quoted), then trace it in
  Illustrator with `pipeline/animate/ai-trace.jsx` (Image Trace by script, 14 colours, white kept, the page's
  white removed, shapes sorted into parts by touching boxes): 201 shapes in 35 named groups (`part-01`...),
  saved as .ai and .svg with a parts list. Test files are in `stock/ai-test/` (git-ignored). Seen: the sheet
  has every part drawn apart with its hidden ends, six mouths, open and closed eyes, brows and four gesture
  hands. Faults: it did not copy the doctor's style (rounder, cuter cartoon), flat cloth traces slightly
  blotchy, the loose pair of eyes lost its whites, parts are numbered not named. The owner has not decided
  between this route and the stock kits.
- **Recraft v4 Pro Vector test (owner asked, 2026-11-18): worse than the Sunburst route.** One direct-SVG
  sheet with the same brief cost 375 credits (119,864 -> 119,489). It is a true SVG, but: 182 loose paths
  with no groups at all, 10 gradients although flat colour was asked for, hot-pink skin, staring eyes, the
  separated legs drawn bare (no trousers), duplicated torsos and arms, one leg ending in toes, only three
  mouths. It takes no reference image. File: `stock/ai-test/recraft/patient-recraft.svg`. For a rig sheet
  the Sunburst PNG + Illustrator trace (175 credits) is both better and cheaper.
- **Cast route chosen by the owner (2026-11-18): fresh GPT 2.6 Sunburst sheets, no reference image.** The
  stock kits are set aside. Sheet 01 (Doctor, front) is made: 175 credits, 119,229 -> 119,054; file
  `stock/cast-ai/01-doctor-front.png` (git-ignored), prompt and shared style block in
  `skill/medpeak-health/references/cast-sheet-prompts.md`. Waits for his approval before sheet 02. Credits: the
  balance also fell 260 (119,489 -> 119,229) between the Recraft test and this sheet with nothing run by
  Claude in between; reported to him, not explained.
- **Doctor sheet traced and joint ends fixed (2026-11-18, free, no generation):** `ai-trace.jsx` (16 colours,
  parts joined only when their boxes overlap by 6 or more, so a pelvis and the thigh below stay apart) gives
  307 shapes in 37 parts. The AI drew every limb end as a cut-open skin oval; `ai-fixcaps.jsx` refills the skin
  shapes at the ends of each clothed part with that part's own colour (27 ends: sleeves, trouser pieces,
  hip holes, coat shoulders, shoe tops), leaving the whole figure, the neck opening, head, neck, hands and
  the bottom row alone. Files: `stock/cast-ai/01-doctor-fixed.ai` / `.svg`. Parts are still numbered
  (part-01...), not named, and nothing is rigged or bent yet.
- **First test video of the AI doctor (2026-11-18, free):** `out/animate/cast-01-doctor-test.mp4`, 10 s, 1080 x 1920,
  60 fps, voice D1 + D3 of rabies. Chain for a sheet: `ai-trace.jsx` with `stacked` (shapes overlap, so the face
  keeps its skin under the eyes) -> `ai-fixcaps.jsx` (joint ends, now also writes `-caps.json`) -> `face-find.py`
  (finds the catchlights the trace drops, and the head's eyes and mouth) -> `ai-face.jsx` (adds the catchlights
  back as white vector circles, splits head-eyeL / head-eyeR / head-mouth off the head, puts a skin patch under
  each) -> `ai-partpngs.jsx` (one PNG per part at 200%) -> `rig-cast.py` (joints from the caps, poses, lip sync
  from the word timings, blinks, weight shift with feet held by two-bone IK; `preview` draws frames with PIL in
  seconds, `render` runs Animate and adds the voice). The bottom-row eyes of the sheet have no eye white, so she
  keeps her own drawn eyes and only the closed eyes and the mouths come from the bottom row. Parts are mapped to
  roles by hand in `CAST` in rig-cast.py; the next sheets need their own map. Animate still gets PNGs, not vectors.
- **Rules from the owner for Adobe scripting:** show the whole page in the window while a script runs
  (`fitPage` in an-rig.jsfl, `fitin` in the Illustrator scripts). Hidden pieces are shrunk to nothing on the
  page, never parked far away (that stretches Animate's work area and pushes the page out of view).
  `ai-extract.jsx` now moves each copy near the page origin before export (an artboard far from it is refused
  or silently exported at the wrong size). The Illustrator fit is not yet seen running.
- Stock sources (premium, not AI, 0 credits) are kept in `stock/` which is
  git-ignored because the repo is public. On the Mac it is missing: download it again there, or keep
  rendering people on the Windows PC. Outputs are in `out/animate/` (not in git).
- Run and looked at: parts sheet (120 parts), pose sheet (8 poses), talking test (120 frames). Not done:
  no blink, legs do not bend yet, mouth is not driven by the voice yet, nothing is joined into the Toons
  video yet, only the doctor exists. Waits for the owner's OK on the look before the other people.

Not done: A1 and E3 are not voiced, and no voice file of rabies is on the Windows PC, so no render with
sound, no listening checks and no look check were run. No music was made (per-video music is not
built). The bigger animation items of the plan (the bite as an event on the arm, a bigger virus,
whole-body reactions of the people) are not built. The other 8 videos are still format 3 or 4.
The file was rewritten by a script, so `toon-timings.json` shows many changed lines (indent only).

Next: the owner's yes on credits for voice and music; then render, listen, look check; then upload.
## 2026-11-18 - Mac - branch `feat/toons`

The owner asked for a new virus voice and "macro shot is my hero visual: start (hook), mid and last",
more animation and more view changes. Then: "Voice C and Start Macros".

Changed:
- Virus voice: Charlie (`IKne3meq5aSn9XLyUdCD`), pitch 3, speed 1.08 (audition C), in `toons-cast.json`.
- New stage `macro` (`src/toons/stage-macro.tsx`; drawings in `look-macro.tsx`): dials `view` (0 entry,
  1 inside, 2 caught), `slide`, `speed`, `grip`; the hero virus talks and blinks. Registered in
  director/scenes/stages/Preview. Board: `npx remotion still src/index.ts ToonStage out.jpg --props='{"stage":"macro"}'`.
- Macro motion runs in beats (`burst` in `look-macro.tsx`): it failed the look check while it moved every frame.
- Format 4 in `toon-rules.mjs`: 2-3 macros, the first picture a macro, spread start/middle/end, each a
  new view, a new picture every 6 s on average and none over 7.5 s. Written into `toons-script.md` and `toons-look.md`.
- The sound planner now keeps the per-minute budget itself (drops cuts, then the most crowded place whoosh).
- Rabies rewritten to format 4: entry macro (hook), arm, inside macro (B3), home (C3 now a closer cut),
  clinic, arm wall, caught macro (E3). B1 now says "stray dog" ("street" was heard as "straight").

Run: npm test 44/44; toon:check, camera, motion, staging, sound, listen --voices, listen --words (all 14
lines heard right), look (45% still, 53% small movement) all pass. Rendered and packaged; NOT uploaded.
Spent 150 ElevenLabs credits (virus re-voice in voice C, 133 + B1 17), within the approved cap of 160.

Open: rabies upload waits for the owner's yes (private only). The look check's "still" is at the 45% edge.
Other stages are still in the old look. Next topics need their own macro views drawn (one still first).

## 2026-11-17 (late night) - Mac - branch `feat/toons`

The owner rejected the first rabies preview ("cheap poor worst"), had every frame of the 20 reference
Shorts studied, approved ONE look sheet ("Yes, this look"), then said the body view had no motion and
looked flat, and asked to "upgrade skill now".

### What changed
- `plans/reference-deep-study-2026-11-17.md`: 36,308 reference frames measured (motion, cuts, lines,
  outlines, brightness) and the plan. Data and script in `plans/data/`.
- The ink look in `src/toons/style.ts` (old values in brackets): one dark ink outline colour, bolder
  lines, ring eyes with no shine, `breathe` 0, `roomLife` 0, `talkBeat` 0.3, `captionPop` false.
  Stickers (`tag`) draw as white chart labels.
- `src/toons/look-ink.tsx`: `Tissue` (cel light and shadow, depth band, lining, wet shine), `InkEyes`,
  `Label`, and the look sheet still `ToonInkLook`.
- `src/toons/stage-arm.tsx` rebuilt in the look, alive in moments (heartbeat, muscle, nerve signal),
  a creeping virus with dizzy stars, marching defenders. New dial `dizzy`.
- `npm run toon:look` (`pipeline/toon-look.mjs`, `pipeline/lib/toon_look.py`, earshot's Python):
  every frame measured against the reference. The staging check now also fails a body stage's face on
  the caption line.
- `videos/rabies`: topic 1 of the topic bank (taken), format 3, WHO and CDC sources.
- Skill: `references/toons-look.md` (the look and motion rules), `toons-script.md` (order of work).

### What was run
- Every script passes `toon-check`; rabies passes camera, motion, staging, sound and the new look
  check (51% still, 48% small motion, edges 11%, near-black 3.8%, brightness 156). 44 tests pass.
- Not run: voices for rabies (quoted about 245 credits, not approved); the stomach, tooth, food-pipe
  and tooth-arena stages are not in the new look; people keep blush and glasses shine.

### Next
- The owner judges the arm test clips; then voices for rabies on his yes.
- Bring the other stages and the people's faces into the look, one board at a time.

---

## 2026-11-17 (night) - Windows PC (commits by VED) - branch `feat/toons-cast-3d`

The owner looked at the Toons cast and said it does not look good: he wants it cleaner, cuter, more
polished, without glare, bokeh and other unnecessary things, "pure 3D like the Dr. Healthcare channel"
(youtube.com/@Dr_Healthcare1/shorts). **No look has been approved yet.** This entry is on the branch
only, not on `main`.

### How it reaches `feat/toons`: pull request #5

The owner asked for a pull request from this branch into `feat/toons` (github.com/vedhckrs/medpeak-studio/pull/5).
If this text is on `feat/toons`, it has been merged. If it is not, read the pull request before any
Toons work: after the merge every Toon looks and acts differently (see "Open" below). Whoever works
on the Mac decides with the owner when to merge it; a test merge shows no conflicts as long as
`feat/toons` is still at `c33e97d`.

### What this branch is

`feat/toons-cast-3d` was cut from `origin/feat/toons` at `c33e97d`. `feat/toons` itself was not touched.

1. `cee6d8e` merge of `main` into it. The one conflict (`pipeline/render.mjs`) is resolved: both sides
   kept. The Remotion launcher moved into `pipeline/lib/util.mjs` as `remotion()`.
2. `519dbc0` the Toons scripts run on Windows: `isMain()` in `toon-check`, `toon-music`, `toon-sfx`;
   `remotion()` instead of `npx` in `toon-sheets`, `toon-render`, `toon-package`.
3. The last commit is a **proposal, not a decision**: a clean look in `src/toons/style.ts`
   (gloss 0, texture 0, edge 0, rim 0.2, grain 0, blush 0.45; old values are in the comments) and two
   lines in `src/toons/ink.tsx` so arm and vein highlights follow `STYLE.gloss`.

Commits 1 and 2 finish "next step" 1 and 2 of the entries below. The Mac can take them into
`feat/toons` with `git merge 519dbc0` (that leaves the style proposal out).

### What was run (Windows 11, Node 24.22.1)

- `npm run typecheck`: pass. `npm test`: 44 of 44 pass.
- `ToonCast` and `ToonSheet` (stomach) rendered before and after the proposal. The pictures are in
  `out/toons/sheets/` on the Windows PC (not in git): `cast-before-after.jpg`, `stomach-before-after.jpg`.
- Not run: any Toon video render, voice, sound or listening step. The boards in
  `skill/medpeak-health/references/toons-boards/` were not re-rendered.

### What was found

- The reference channel calls itself "2D animated" and it is: flat colour, thin clean outlines, real
  anatomy in place, two plain round eyes, no arms or hands on organs, plain backgrounds. It is not 3D.
- Our glare is `STYLE.gloss` (streaks on bodies, arms, veins), the speckle is `STYLE.texture`, the paper
  noise is `STYLE.grain`. The "bokeh" is the lens blur in `src/toons/camera.tsx` (`LENSES` bg/fg), the
  blurred foreground layer and drifting specks in `scenes.tsx`, and lamp glow and halos. Those are not
  switched off yet.
- True 3D cannot be drawn by this SVG engine. It would need AI-made 3D-style pictures or real 3D models,
  which changes the pipeline and costs credits per video.

### The owner's decision: clean 2D like the reference

He picked (a) clean 2D in the current engine, over a soft "3D-feel" shading and true 3D. Our characters
stay our own designs; only the kind of look follows the reference.

What is built for it, in the commit "feat(toons): clean 2D look, stomach redrawn":

- `src/toons/style.ts`: `eye: 'dot'` (plain white eye, dark pupil, one small catchlight; `'iris'` brings
  the v6 eye back), `organArms: false` (no arms or hands on the organ family), one flat shadow step
  (`shadowDeep` = `shadow`), weaker form and top light, bigger eyes and pupils, blush 0.3.
- `src/toons/rig.tsx`: the dot eye. `src/toons/blueprint.tsx`: organs skip their arms when
  `organArms` is false. `src/toons/Preview.tsx`: the model sheet says so and hides the hands row.
- `src/toons/characters.tsx`: the stomach is redrawn (real shape, four fold lines, pylorus ring, no
  vessels).

Then the owner said yes to the stomach and "do all 24". Commit "feat(toons): whole cast in the clean
2D look":

- `style.ts`: `organArms` became `bodyLimbs: false` (no arms, hands or legs on **any** body character:
  organs, cells, germs, pill, bone, poop; people keep theirs) and `accessories: false` (no guard cap on
  the white cell, no medic helmet on the platelet, no bow or lashes on the egg).
- `characters.tsx`: every glint, squiggly inner vessel, heart fat patch, bone speck and white dot is
  now behind `GLINT` (`STYLE.gloss > 0`); costume pieces behind `DRESS`; the pill, white cell and
  platelet stand on their body when they have no legs (`ground.y`). Real anatomy stays: liver lobes and
  ligament, gallbladder, kidney hilum with artery, vein and ureter, adrenal gland, lung airways, the two
  coronary arteries, brain folds, white-cell nucleus, virus spikes, bacteria pili and flagellum.
- `ink.tsx`: the light edge of `Groove` follows `STYLE.gloss`. `humans.tsx`: hair sheen and glasses
  glints follow `STYLE.gloss`.
- Setting `gloss`, `texture`, `bodyLimbs`, `accessories` and `eye` back in `style.ts` returns the v6
  cast, except the stomach, whose old drawing was replaced.

Checked: typecheck passes, 44 of 44 tests pass, `ToonCast` and the sheets for stomach, heart, white
cell, doctor and patient render and were looked at. The other sheets were not rendered one by one.

Then the owner saw the full cast and said "remove bokeh". Commit "feat(toons): no bokeh":

- `style.ts`, new block "camera and air", all off (1 / true brings v6 back): `lensBlur` (depth of
  field in `camera.tsx` `Layer`, out-of-focus actors in `stage.tsx` `Slot`, rack-focus softness and
  whip-pan blur in `Camera`), `foreground` (every `Layer` with p > 1: leaves, curtain edge, tissue
  folds in front of the picture), `specks` (dust and ring bubbles in `scenes.tsx` `Motes`, room dust in
  `rooms.tsx`; solid pieces bigger than 4 units such as food, crumbs and oxygen stay), `glow` (light
  pools over the stages and sets, `Rays`, the lamp, the window light shaft, the soft ring around a
  prop's disc) and `vignette`.
- Checked on the `ToonCamera` and `ToonSets` boards: close-ups keep a sharp background, nothing stands
  in front of the picture, the corners are not darkened.

### Open

- The lenses still set how strongly the layers part when the camera moves; only their blur is off.
  `toons-camera.md` still describes blur as part of each lens.
- Body characters without arms or legs change the acting in every existing Toon (wave, point, thumbs
  up, walking do nothing on them now). No Toon video was re-rendered or re-checked (`toon:camera`,
  `toon:motion`, `toon:staging`) with this look.
- Bokeh is not removed yet: lens blur (`camera.tsx` `LENSES`), the blurred foreground layer and drifting
  specks (`scenes.tsx`), lamp glow and halos.
- The stages (`stages.tsx`, `stage-arena.tsx`) draw their own stomach, food pipe and tooth with arms;
  they are not changed.
- The boards in `skill/medpeak-health/references/toons-boards/` and `toons-style.md` still describe v6.

---

## 2026-11-17 (evening) - Windows PC (commits by VED) - branch `docs/topic-bank`

The owner asked for more topics with high search demand worldwide, and wants to start with 15.

### What changed

- New file `skill/medpeak-health/references/topic-bank.md`: 70 topic candidates, the first 15 marked
  "start here", each with a status column (`open`, `taken`, or the video's slug).
- `skill/medpeak-health/SKILL.md`: three lines under "Channel facts" that point to the topic bank.
- No code changed. `feat/toons` was not touched.

### How the list was made

- About 8,000 YouTube search suggestions (15 question stems, a to z, for India, the US and the UK).
- For topics 1 to 14, the videos over 1 million views on the first page of YouTube results were counted.
  The check for the other topics was stopped: the owner asked for the list fast.
- The raw data and the two small scripts are not in git (they were in a temp folder on the Windows PC).

### Not done

- No topic has been researched for sources yet. Every one is a candidate.
- The list was **not** compared with `plans/month-1-2026-11-18.md` on `feat/toons` or with the videos
  already made (the owner said not to). Known near-duplicate: topic 2 "What Happens If You Don't Sleep"
  and the month plan's "What an All-Nighter Does to Your Brain".
- Click-through rate cannot be measured from outside the channel.

### Next step for whoever picks this up

1. Merge `origin/main` into `feat/toons` (see the entry below for the one conflict in `render.mjs`).
   `SKILL.md` was edited on both sides but in different places; a test merge shows no conflict there.
2. Start with topics 1 to 15 in `topic-bank.md`. Mark a topic `taken` and push before working on it.
3. Decide with the owner how the 15 fit with the month plan and the parked Day 1 videos.

---

## 2026-11-17 - Windows PC (commits by VED) - branch `fix/windows-entrypoint`, pull request #3

First session on the Windows PC. The repo was cloned there and the pipeline was made to run on Windows.

**Status: merged.** Pull request #3 went into `main` on 2026-11-17 (merge commit `d64cd19`) after its CI
check passed, with the owner's OK. Everything below is on `main`.

### What changed in the code

- `pipeline/lib/util.mjs`: new `isMain(metaUrl)` helper. It compares real file paths, so it works on
  macOS, Linux and Windows.
- `pipeline/check.mjs`, `make-sfx.mjs`, `render.mjs`, `research.mjs`, `voice.mjs`: the line
  ``if (import.meta.url === `file://${process.argv[1]}`)`` is now `if (isMain(import.meta.url))`.
  The old line never matched on Windows, so each script exited with code 0 and did nothing.
- `pipeline/render.mjs`: Remotion is started with `process.execPath` and
  `node_modules/@remotion/cli/remotion-cli.js` (helper `remotion()`), not with `execFileSync('npx', ...)`,
  which fails on Windows with `ENOENT`.
- New files: `CLAUDE.md` (start and stop rules for every session) and this log.

### What was run (Windows 11, Node 24.22.1)

- `npm run typecheck`: pass. `npm test`: 8 of 8 pass.
- `node pipeline/check.mjs --all`: prints the tables, ALL PASS.
- `node pipeline/make-sfx.mjs`: 8 sound effects written to `public/sfx`.
- `node pipeline/render.mjs what-sugar-does-to-your-body --stills --only soda`: 20 stills, looked at one.

### What was not run

- `research.mjs` and `voice.mjs` (they only got the start-up change; voice spends ElevenLabs credits).
- A full video render. Nothing on macOS: the helper compares paths exactly there, so behaviour should be
  the same, but nobody has run it on the Mac yet.

### State of the Windows PC (not in git)

- Has: Git 2.56, Node 24.22.1, the npm packages (`npm ci`), ffmpeg 9.0.2, Python 3.12, a venv at
  `~/.config/youtube-analytics/venv` with `google-api-python-client` and `google-auth-oauthlib`,
  `public/sfx`.
- Missing: the ElevenLabs key for this project (`.env` or `MEDPEAK_ENV_FILES`), `client_secret.json`
  and `token.json` for YouTube, and the link of `skill/medpeak-health` into the Claude skills folder.
  So voice, music, upload and analytics cannot run on the Windows PC yet.

### Watch out: `feat/toons`

`feat/toons` (the Mac's branch, 60+ commits, not merged) was not touched from the Windows PC.

- **Merge conflict to expect.** `main` (since pull request #3) and `feat/toons` both edit
  `pipeline/render.mjs`. A test merge shows one conflict in that file. Keep both sides: the `spawnSync`
  loudness change from `feat/toons`, and `isMain` plus the `remotion()` launcher from `main`.
- **Same two bugs are still on `feat/toons`.**
  - Mac-only start-up line: `pipeline/toon-check.mjs`, `toon-music.mjs`, `toon-sfx.mjs`.
  - `npx` spawns: `pipeline/toon-package.mjs:130`, `toon-render.mjs:75` and `:87`, `toon-sheets.mjs:25`.
  Until they use `isMain` and the node launcher, the Toons scripts do not run on Windows. Moving
  `remotion()` from `render.mjs` into `lib/util.mjs` would let all of them share it.

### Open

- Nothing from the Windows PC is waiting for a merge. The merged branch `fix/windows-entrypoint` is still
  on GitHub and can be deleted.
- `feat/toons` does not have these changes yet (see the next step).
- `loadEnv` in `pipeline/lib/util.mjs` splits `MEDPEAK_ENV_FILES` on `:`, which breaks Windows paths
  such as `C:\...`. Use `path.delimiter`.

### Next step for whoever picks this up

1. On `feat/toons`: `git fetch` and `git merge origin/main`, and resolve `pipeline/render.mjs` as
   described above.
2. Apply the two fixes to the Toons scripts listed above and run them once on each machine.
3. Fix the `MEDPEAK_ENV_FILES` split.
