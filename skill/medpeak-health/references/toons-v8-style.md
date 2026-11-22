# MedPeak Toons, look v8: the drawing rules (2026-11-20)

**Status: APPROVED by the owner on 2026-11-20**, in three steps the same day: the cast and prop sheets (after a
sleeve fix); then, after his feedback on the first storyboard, the new noses and one-piece hands, the
microscopic inside-the-body frames and the rabies storyboard. The approved sheets are in `toons-boards/v8/`,
the approved storyboard and frames in `toons-boards/v8/storyboard/`. Motion is NOT approved yet: nothing is
animated or in the engine.

Owner's decision, 2026-11-20: everything is drawn by code again (no AI art, no stock art), in the drawing
language of the reference Shorts, as one consistent family. Character sheets and props are shown to him as
16:9 JPGs for approval before anything goes into a video.

**We follow the reference's drawing language, not its drawings.** Never copy one of their characters, a
specific design, a joke, a title or a layout of theirs. Our cast keeps its own identities (below).

The shared kit is `src/toons/v8/kit.tsx`. Every v8 character, prop and sheet is built from it. Nobody
changes the kit to suit one sheet: a missing piece is built in the sheet's own file and reported.

## The ten rules

**Engine v9 (2026-11-23).** The owner approved every recommendation of `plans/engine-upgrade-2026-11-23/05-blueprint.md`
("All 28 recommend and start 2 to 3 agents to fix and upgrade engine and everything i want proper as per report"). The
changes are written into the rules below as "From format 6"; videos already out keep the older wording. The numbers every
new Toon is measured against: `toons-target.md`.

1. **One outline.** Colour `INK` (#2b1a17), thin and even, round joins and caps. `OUTLINE` (3.4 px) for the
   outside of a shape, `INLINE` (2.2 px) for lines inside it. Strokes never scale with the figure. No
   coloured outlines, no outline-free shapes (except a shadow shape or a band inside a shape).
2. **Flat colour.** A shape has one fill. It may have ONE darker tone of the same colour (`shade()`), as a
   shadow shape on the lower right or a band along an edge, and ONE lighter tone (`tint()`) as a band.
   Nothing else: no gradients, no gloss streaks, no glow, no texture, no drop shadows, no blur.
   From format 6 (engine v9, 2026-11-23, decision 8) exactly three soft exceptions, nothing more: (a) see-through liquid (one flat colour at
   55-65% opacity with a few white wave lines, `Liquid`); (b) the soft redness of a swelling (`Swelling`); (c) one
   far-background soft layer behind a tissue wall. Plus a flat 25% ink contact shadow under every character standing on a
   floor (`ContactShadow`, flat, not blurred). Gloss streaks stay banned; one short pale highlight line per organ
   (`Highlight`) is the only shine. Shown on the stage sheets before a video uses them.
3. **The face.** Two big white round eyes that touch or almost touch, a small black pupil, a thin outline
   (`<Eyes>`). A tiny mouth (`<Mouth>`). Thin short brows only when the feeling needs them. No iris
   colour, no catchlight, no eyelashes on body characters, no blush, no nose on body characters.
   The face is SMALL on a big body: the two eyes together are about a quarter to a third of the body's
   width, and sit in the upper half.
   From format 6 (engine v9, 2026-11-23, decision 10, a before/after sheet of the whole cast first): still one eye for the whole cast,
   but upright ovals (1.12 times taller than wide), on a turned face the far eye 8-12% smaller (a three-quarter look,
   never a mirror), pupils 0.18 of the eye that can touch the rim, a continuous lid (a 0.2 s blink with a half lid).
   In a whole-organ frame one eye is 120-170 px on screen (never over 190), the face above y 800. Organs lose the
   teeth-grid "grit" mouth. Characters look at each other (decision 11): the listener's pupils point at the speaker.
4. **Body characters are anatomy, not mascots.** An organ looks like the real organ, simplified: real
   silhouette, real parts (the stomach's two openings and curve, the kidney's notch and tubes, the heart's
   vessels on top), a slightly uneven, hand-drawn outline (no perfect circles or ellipses for a whole
   body, no ruler-straight tubes). Inner lines show folds, lobes and layers.
5. **Little limbs.** When a body character needs to act it gets thin arms in its own colour (`<TinyArm>`)
   and, if it walks, short legs (`<TinyLeg>`). Limbs are thin and short; they never dominate.
6. **Job characters.** Cells, chemicals, medicines and germs are small simple bodies whose SHAPE says what
   they are (a sugar cube, a capsule, a drop, a Y-shaped antibody), with ONE costume piece or ONE held
   prop for their job (a guard's cap, a shield, a key, a broom) and, where it helps, a small white name
   tag (`<NameTag>`).
   From format 6 (engine v9, 2026-11-23, decision 13): a job may also be a little worker in uniform (`MiniWorker`: two heads tall, kit
   eyes, small real hands, a uniform and one prop: guard, cleaner, firefighter, courier, builder), and a chemical may wear
   its name on a paper band round its body (`BandLabel`); a character that wears its name gets no extra tag.
7. **One colour family per character**, muted: the body family (`FLESH`) for tissue, `CLOTH` for clothes and
   objects, `SKIN` for people. No neon, no pure black fills except hair, pupils and shoes, no pure
   saturated primaries.
8. **People** are about 4 to 4.5 heads tall (a child about 3, a baby about 2.5), with a big rounded head,
   a soft jaw, visible ears, hair as one solid shape with a few strand lines, the same white round eyes
   with a small pupil (a little apart on people, with thin brows), a small "c" or "L" nose line, a short
   mouth. Arms and legs have real thickness and taper slightly; hands are small with a thumb and
   finger lines (never a ball, never a block, never sausage fingers). Clothes are flat colour with a few
   fold lines and one darker tone. They stand naturally: weight on both feet, arms relaxed, slight
   asymmetry.
9. **Props** are drawn the same way as characters: the same outline, flat colour, one darker tone, simple
   true-to-life shapes, no faces unless the prop is a character.
10. **Consistency beats cleverness.** Same line, same eye, same shading logic, same level of detail on
    every figure of every sheet. If one figure is more detailed or more polished than its neighbours,
    simplify it.

## Our cast identities (kept from before, redrawn in v8)

| Who | Identity |
|---|---|
| Doctor, "Dr. Mira" | woman in her thirties, light skin, dark brown curly hair to the jaw, round glasses, white coat open over a teal scrub top, teal trousers, white shoes, stethoscope round the neck, often a clipboard |
| Patient | young man, warm skin, short dark hair, yellow hoodie, blue jeans, white trainers |
| Mom | woman, tan skin, long dark brown hair, coral blouse, indigo skirt, brown shoes, small earrings |
| Dad | man, tan skin, short black hair, light stubble, blue shirt, charcoal trousers |
| Kid | boy about 7, warm skin, teal cap over dark hair, green tee, navy shorts, red trainers |
| Grandpa | old man, warm skin, bald on top with white hair at the sides, white moustache, square glasses, purple cardigan over a cream shirt, brown trousers |
| Grandma | old woman, warm skin, grey hair in a bun, small round glasses, sage green cardigan, long plum skirt |
| Baby | toddler, light skin, a tuft of light brown hair, pale blue onesie |

## The sheets (16:9, 1920 x 1080, JPG, in `out/toons/sheets-v8/`)

Each sheet has its own file in `src/toons/v8/` and its own entry file `entry-<name>.tsx`, so one sheet's
mistake never breaks another's render:

    node pipeline/toon-v8-sheets.mjs            (all sheets; or: npm run toon:sheets)
    node pipeline/toon-v8-sheets.mjs cells      (only the sheets whose name contains "cells")

## Scenes (full video frames, 1080 x 1920; the rabies frames are approved)

Built with `src/toons/v8/scene.tsx` in `scenes-rooms.tsx` (kitchen, clinic) and `scenes-body.tsx` (inside the
body at the scale of cells: the wound, the nerve ending, inside the nerve fibre, between the cells). Rules on
top of the ten above:

- A place is QUIETER than the cast: big flat fields, tone-on-tone patterns, few lines. Objects keep the cast
  outline. No faces on a background.
- Rooms are flat, front-on stages (a wall, a floor line near y 1380). People stand with feet near y 1740.
- Keep the top 190 px and the bottom 330 px free of anything important; no face, hand action or label in
  the caption band (y 1380..1560; with `"caption": 2`, every video from 2026-11-22: y 1324..1434, the word 40% smaller
  and centred on y 1374). The yellow tag sits around y 330 on plain wall.
- Never mirror a character that has a one-sided detail (Dr. Mira, Mom). Hands never overlap hands.
  A hand that lies on the body or on a thing uses the hand kind `rest` (fingers together), never the
  splayed open hand.
- Inside the body means INSIDE THE REGION (engine v9, 2026-11-23, decision 6; until then the rule was "MICROSCOPIC"): an anatomy
  stage (`anatomy.tsx`: `chest`, `vesselInside`, `upperBelly`, `throatSide`, `skullSide`, `tissue`, `skinSection`), the hero
  organ in its real place with 3+ real neighbours around it, in three planes (the cavity behind, the organ and its
  neighbours, a cropped near edge), one warm flesh family (decision 7: 60%+ of a body shot warm, any other colour family
  8% or less, kept for the intruder; no flat non-tissue field over 12%), built to HOLD 20 s and change state (its dials).
  The micro scale only for cells, blood and germs, still with three flat planes for depth (small darker cells behind with
  thin lines, the action in the middle with the full outline, big dark cell edges cropped by the corners in front), and
  characters standing on a tissue floor with contact shadows. Cells are bigger than the virus. No blur, no gradient
  (except the three soft exceptions of rule 2).
- Rooms (engine v9, 2026-11-23, decision 7): walls from the pale `ROOM` palette (saturation 0.22 or less, brightness 165+), clothes a clear
  step from the wall; still unique per video. Two-person shots framed tighter (decision 12): a head at least 190 px wide,
  a crop at the knees is fine (`PEOPLE_SCALE` about 4.0 for two-shots). Every head and wall item is either over 85% or
  under 15% inside the frame (no half person at the edge, check L6).
- People have a real nose in every view (side: it sticks out of the profile; three-quarter: a small rounded
  shape below the eyes), never a bare line on an eye.
- A cast figure is placed as approved (`<Put>`); a scene may pass a figure's own props, never redraw it.

    node pipeline/toon-v8-sheets.mjs --scenes        (all scene frames, to out/toons/scenes-v8/)

## Version 4 rules (the owner, 2026-11-20; rabies v4 is the first video made to them)

Every Toon follows these from now on. Code: `src/toons/v8/hud.tsx`, `video.tsx`, `micro3.tsx`, `shots-v3.tsx`,
`people-rig.tsx`.

**End card (CTA)**
- Read by the channel narrator, **Joey** (`narrator` in `skill/medpeak-health/toons-cast.json`), the SAME voice in
  every video. He reads the headline, the three points and always ends with: "Follow MedPeak Health for more health
  tips that keep you safe." The clip lives in `assets/toons-voice/<slug>/cta.mp3`, its word times in
  `videos/<slug>/cta-timings.json`; the card's beats (`at` in the video's CTA) are his word times.
- `CtaCardV4`: the logo's royal blue `#214ba1` with lighter flat rings; the logo (`assets/brand/logo.png`) top centre
  in a white circle, "MedPeak Health" typed below; the headline on ONE line (yellow, auto-sized); three white cards
  with big bold icons; the follow line in a yellow pill.
- **From format 6 (engine v9, 2026-11-23, decision 25, option A): the card is 5-6 s**: a hard cut in (no push-up slide), the headline and
  the three points come up together (0.15 s apart), Joey says only the follow line; the story ends on the answer or a loop
  line. Layout: the stack centred between y 200 and 1500, icon circle 170 px in a 220 px card, icons drawn to fit (no
  clipping), the follow box above y 1500, the drop icon's gloss streak gone. Retention read after two weeks.
- **Never cut or speed up the narrator** (the owner, 2026-11-20): the story stays under 60 s, the end card may take
  the Short past one minute. The card holds 1.2 s after his last word.
- The narrator's clip is added AFTER the story, so the script rules (loop, the answer in the last quarter) still pass.

**Watermark**: `@MedPeakHealth`, Inter Regular (400), 26 px, opacity 0.44 (half transparent), no outline (a 1 px
flat drop only). Act 1 top right, act 2 bottom left, act 3 top middle. **No watermark on the end card** (the owner, 2026-11-21): it
fades out over 0.35 s as the card comes in.
From format 6 (engine v9, 2026-11-23, decision 26): act 2 sits at y 1180-1220 (at 1330 it read as a second caption line), act 3 takes the
first of top-left / top-middle / top-right that is clear of heads in that shot, the mark turns ink-coloured (same opacity)
on backgrounds brighter than 200, and there is no watermark on the cover still (check L5).

**Icons only when the words say it**: a dog on "stray dog", a dog with a warning badge on "fatal", the stopwatch on
"fifteen minutes", the calendar on "months", the shield ONLY where the vaccine is named ("shots"). No icon the words
do not say (the old sunrise is gone). `IconBadge`: eased pop, ONE soft settle (3%), hold still, eased fade out; no
wobble, no turn. An icon leaves before the picture changes (`out`), and a transition fades the last shot's icons.

**Name tags**: `CharTag`, held **2.5 seconds** (`TAG_SECONDS`; the owner, 2026-11-21, was 1 s; start it at least 2.7 s before its shot cuts, so a hard cut never chops it), the FIRST time each non-human character appears (RABIES VIRUS, NERVE ENDING,
DEFENCE CELL, ANTIBODY, WHITE BLOOD CELL). A white tag box above the head (to the side when there is no room), an
arrow that draws itself. **No circle, no halo, no glow, no blur** around the character (the owner, 2026-11-21: "remove
completely everywhere"; the two white rings of 2026-11-20 are gone). Never on people. The box must never cover a face: point at a part of the character away from the others, and
start a tag after a transition has finished.

**Camera and transitions**
- **From format 6 (engine v9, 2026-11-23, decision 16) the camera is LOCKED**: one framing for the whole of a body shot (no creeping dive,
  no lean), at most ONE punch-in a video (2x or more, held 3 s+, never followed by the reverse, `punch` on the ShotDef);
  at most 6 cuts a minute (aim 4; time cards not counted), a median hold of 6 s+, a body place held 8 s+ before cutting
  away. Macros are no longer required. What keeps the eye is something ENTERING the held frame (an intruder, a level that
  fills, damage that spreads), then a hold (checks C1, V1-V3, M2). The text below is the version 4 camera (videos already out).
- **Time cards** (engine v9, 2026-11-23, decision 20): a black card with one short line in the caption font ("3 DAYS LATER"), 0.8-1.2 s,
  hard cut in and out, the watermark kept; the picture after it has the SAME framing as before, only the state changed;
  at most 3 a video (check C8). It is a cut, not a transition.
- **The dive** (engine v9, 2026-11-23, decision 21): one shared `Dive` of 0.9 s with an even (log-scale) zoom (6% a frame at most at 60 fps),
  so it reads as a dive and not a jump; the person on screen 1 s or less, inside the body by about 2 s.
- **Impacts** (engine v9, 2026-11-23, decisions 18 and 19; a 10 s before/after slice to the owner first): no automatic shake (the player
  shook the frame 9 px on every flash), at most 1 flash, 1 shake (12 px, 0.25 s) and 2 bursts a video, never on or near a
  face (1.2 face radii); a `FightCloud` (white boiling cloud, 1-2 s) and small face marks instead. Flow never stops but is a
  few particles in a band of 5% of the frame or less.
- Version 4: no punch zoom on key words. Rooms: one smooth move per shot (the lean is averaged over 2.4 s). Inside the body:
  a continuous dive from the first frame to the last; every depth plane (`Depth d=0..1`) grows at its own rate,
  the near planes most (`DiveCtx`). Every new micro place is built in depth planes so it can dive.
- **NO transitions between scenes: every change of scene is a clean CUT** (the owner, 2026-11-21: "I don't want
  transitions when the scene changes, it looks fake"). No dive, pull, whip pan or zoom-through at a scene change, and
  no zoom-through inside a shot when it moves to another place (`TRANSITIONS = false` in video.tsx, `SWAP_CUT` in
  shots-v3.tsx). A move INTO the body may happen inside ONE shot as part of its action (the no-sleep hook dives
  through Sam's face), never as the join between two shots.
- No flicker: nothing may appear or vanish in one frame (fade in and out; looping things fade at their wrap).
  Check a render with the frame-difference scan (see `HANDOFF.md`, rabies v4): zero isolated one-frame jumps
  EXCEPT at the scene cuts (each cut is one; check that every jump falls on a shot start).

**Characters**: the Virus keeps still unless it speaks or acts (`active()`), only a slow breath at rest.

**Micro world**: detailed places, never "poor": at least four depth planes (haze, mid, near, a framing plane),
cells with double membranes, nuclei, ER, mitochondria; textured fibres; flat light and shade bands; small life
(`Bits`) that drifts.

**Clothes** (the owner, 2026-11-20: "rework, the doctor's coat first"): changes must read at phone size, as shapes
and colour bands, not only thin lines. The coat is fitted at the waist, long, flared, with real notched lapels in a
darker grey, a breast pocket with pens, big lower pockets, cuff bands and buttons, scrubs with a trimmed V-neck.
Everyone has hems, cuffs, folds and a flat shade band; each person has one clear clothing detail (the Kid's ringer
tee, Mom's sash, Dad's yoke and cuffs, Sam's ribbed hoodie, Grandpa's elbow patches, the Baby's trim and snaps).
Show a BEFORE/AFTER sheet and a frame at video size for any clothes change.

**The hook (first 4 s)** (the owner, 2026-11-20: "the first 3-4 s are poor, I want a strong visual"): open on the
danger itself, with a big visual event every half second before anyone talks (rabies: a stray dog lunges at the lens,
CHOMP, a saliva drop with the Virus grows on the fang, the camera dives into it, the Virus bursts out at the lens).
A shot may hold its first line back with `"lead": <seconds>` (0-3) in the script, so the picture plays first.
From format 6 (engine v9, 2026-11-23, decisions 3 and 21): frame 0 the person and a real action with a sound hit; the first line is said
INSIDE the story (a character's reaction or demand about the intruder or the damage, 8 words or fewer, first word at
0.3-1.2 s, the topic named by 3.0 s; "you" only between characters); the dive starts at the end of that line, 0.9 s;
the hook keeps coming at the lens. One of the three hook choices on the script sheet may stay the "to the viewer" kind.

**The race bar** (`RaceBar` in `hud.tsx`): the hook's question as a picture on the screen in the body shots: a nerve
from the bite to the brain, the Virus riding it; it creeps, jumps, hits the antibody wall and is crossed out when
caught. A video with a chase question gets one.

**Approval steps for a video**: 16:9 look sheets -> narrator clip (cost first) -> a 10 s motion test
(`toon-v8-render --from A --to B`) -> the full video + the storyboard from the finished render
(`node --import tsx pipeline/toon-v8-board.mjs <slug>`).
From engine v9, 2026-11-23 (decision 17): the full video goes to the owner only with its **scoreboard** (`renders/scoreboard.jpg`, made by
`node --import tsx pipeline/toon-score.mjs <slug>`, which the final render runs on its own) saying PASS: every check runs on
the FINAL render (picture checks C1-C8, the layout log's L1-L14, motion M1-M5, camera V1-V3, script and sound). The layout
log (`renders/layout.json`) is what the real component tree drew; every new piece reports to it (`useReport`, `play.tsx`).


## Owner's notes of 2026-11-21 (no-sleep), rules from now on

- **No circle around a tagged character**, anywhere (see Name tags).
- **The end card: every line on ONE line.** The headline and each point's bold text; `CtaCardV4` fits the three points
  together at one size. An icon must look finished (the flat calendar was "cheap"): a round badge with a scene, as the sunrise.
- **No jiggle or flicker when someone talks.** No squash per syllable (a slow small sway while speaking); mouths come from
  `talkSmooth` (0.1 s average), never the raw per-frame opening; no fast hops or shakes (nothing faster than about 2 a second).
- **The room camera** is smoothed on a fixed time grid (`smoothCam` in video.tsx). Check a room with a frame-difference
  scan: a steady 5 Hz pulse means the camera steps.
- **Scene changes are hard cuts** (later the same day the owner removed transitions everywhere; see Camera). Never a
  zoom-through crossfade that ghosts a big face over a room.
- **Music 10% lower** than the director's levels: `MUSIC_LEVEL = 0.9` in video.tsx (the owner: "background music 10% decrease").
  From format 6 (engine v9, 2026-11-23, decisions 22-24): every video still gets its own new track, but always from one family (playful funk,
  slap bass, light percussion, 130-165 BPM, a brighter "confident" half from the doctor's answer, plus the topic's colour);
  the bed about 5 dB up in the pauses (music about 6 dB under the voice) with a 3 dB dip under words over 0.25 s (an A/B
  slice to the owner first, `MUSIC_LEVEL` then follows the director's new `SOUND` levels); at most 2 planned music stops of
  0.4-0.8 s on a gag (`"stop": true` on an event), never on a word; accidental holes still fail.
- **The hook (the owner chose this shape for no-sleep, after "there is no powerful hook")**: frame 0 is never an empty
  place. Open on the PERSON and the topic's cue (Sam's face at 2 a.m., lit by the phone, a clock slamming onto 2:00 with a
  beep), his line as a cold open, then inside the same first shot the camera dives through his face into the body place,
  and the villain comes AT the lens (Gunk splats on the glass, goo runs down). The threat is shown on its word ("clog": the
  gaps squeeze shut). No name tag, icon or number during the hook line: the tag comes after it. High contrast first frame.
  What was wrong before, to avoid: an empty first frame, a place nobody recognises, nothing coming at the viewer, no person,
  the threat said but not shown, three texts at once in the first two seconds, a soft first sound.
- **A held phone**: out in front at chest height, seen from its back (the screen faces the person), the person's own hand
  drawn again over it (`HandAt` with `rod={false}`: a gripping hand with no hole). Never pasted on the hand at the chin.
