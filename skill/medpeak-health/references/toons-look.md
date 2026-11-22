# MedPeak Toons: the ink look (approved 2026-11-17)

> **History.** This page is the ink look of 2026-11-17 and the old engine. Look v8 (2026-11-20) is in `toons-v8-style.md`;
> engine v9 (2026-11-23) changed two rules here, marked below: "Flow never stops" and "The look check". The target numbers
> of every new Toon: `toons-target.md`.

The owner on the earlier look: "cheap, poor, worst"; then "every video looks same"; then, after seeing
the look sheet, **"Yes, this look"**; then on the first video in it: "no animation and motion inside
body view and looks flat". This file is the result. The study behind it, with every number:
`plans/reference-deep-study-2026-11-17.md` (all 36,308 frames of 20 reference Shorts measured).
The look sheet: `npx remotion still src/index.ts ToonInkLook out.jpg` (`src/toons/look-ink.tsx`).

Format study only: our characters, drawings, jokes and titles stay our own.

## The drawing
1. **The anatomy fills the frame.** The camera is inside the organ; layers run off every edge. Never an
   organ floating on an empty background like a diagram.
2. **Bold dark ink outlines** on everything (`STYLE.outline: 'ink'`, `inkLine`, `line`, `maxLinePx`,
   `setLinePx`), with a slight hand-drawn waver on stage shapes (`wob` in `look-ink.tsx`).
3. **Body characters are anatomy plus eyes:** a black ring, white, a black dot, no shine
   (`STYLE.eye: 'ring'`, `InkEyes`), and a tiny mouth. No limbs on organs, cells or germs.
4. **Depth, not flat colour:** every tissue is drawn with `Tissue` (`look-ink.tsx`): a two-step cel
   shadow on the lower right (`form`), a light edge on the upper left, a dark band inside the wall, a
   lighter lining, a few wet shine strokes (`shine`). Three layers: dark gaps behind, the organ in the
   middle, vessels and fine strands in front, each casting a shadow on the layer behind.
5. **One muted colour family per scene** (coral, maroon, cream, tan); a character may contrast.
6. **Labels like an anatomy chart:** white box, black border, black text (`Label`).
7. **Real anatomy:** the rabies virus is bullet-shaped because it is; a nerve shows its fibre bundles;
   an artery runs beside it; fat is lobules.

## The macro close-up (owner, 2026-11-18: "macro shot is my hero visual")
The hero shot: the camera goes so close that one thing fills the frame (a drop of saliva in a cut, the
inside of one nerve fibre, a virus held by catchers). Drawn in the same ink look, with more detail than
a stage: cells as rows of shaded lumps, a fibre's sheath in segments, the virus with knobbed spikes and
a coil inside. It never holds still: spikes twitch, the drop wobbles, tracks stream past, catchers pull.
Rules in `toons-script.md` (format 4); the stage is `stage-macro.tsx`.

## Colour: the reference's own palette (measured from its frames, 2026-11-18)
Warm salmon and coral, brick, cream, pale sky: muscle `#e7867d`, its shadow `#cd6e68`, the gaps
between muscles `#924142` (not a deep purple-maroon), fibres and arteries `#c45554`, nerve and fat
cream `#f6e3ce` / `#f6dfa6`, skin `#f2b8a8`, air `#e1f7fb`. `ARM_PAL` in `stage-arm.tsx`. Each new
stage samples the reference the same way before it is drawn. Tissue fills the frame; only a strip of
air may show (our first arm left a sixth of the picture empty).

## Text: little of it, and briefly (owner, 2026-11-18: "too much text on visual", "text come, after 1 sec go")
- No standing labels on a stage except the one that IS the story (TO THE BRAIN). No scene name pill.
- A tag is a hook, not a sign: a bold yellow block, big black words, a hard ink shadow, a slight tilt
  (`STYLE.tagStyle: 'hook'`), two to four words. It leaves after 1.2 s (`TAG_HOLD` in `director.ts`);
  `hold: true` keeps one longer.
- Numbers are drawn where possible (a calendar page with a big 10) instead of written in a box.
- The staging check fails a graphic that covers a stage's own drawing with text (calendar, sign).

## The motion: the body is alive, in moments
The reference holds still in 63% of its frames, but the body never looks dead. So:
- **The camera and the rooms hold still** (`STYLE.roomLife: 0`, `breathe: 0`).
- **The body lives in moments, not all the time:** a heartbeat swell every 2 s, a muscle tightening
  every 6 s, a nerve signal every 5 s, each a fraction of a second, a few pixels. Never a constant drift.
- **Characters act with purpose:** the virus rides INSIDE the nerve, leaning along it and rocking only
  while it moves (the nerve swells green around it and keeps a green trail), gets dizzy stars after hitting the wall; the defenders march in steps, lock into a wall
  and lean; eyes blink.
- **Flow never stops:** blood in a vessel streams all the time (a thin dashed line moving along it), a
  little faster on each beat. A flow that stops between beats reads as a bug (owner, 2026-11-18).
  **From engine v9 (2026-11-23, decision 19):** it still never stops, but as a few small particles in a band covering 5% of
  the frame or less, never the whole background (creatine's tunnel kept 54% of the picture moving).
- **Impacts move the world:** the nip shakes the skin and fat; drops land with a ring.
- **People talk calmly:** arms and head beat less on stressed words (`talkBeat: 0.3`); caption words
  swap rather than grow in (`captionPop: false`).

## The look check (`npm run toon:look -- <slug>`)

**From engine v9 (2026-11-23, decision 17)** the look check measures the PICTURE of the FINAL render with the caption band
left out (the whole-frame numbers below counted the caption as motion: 52-60% "still" was really 33-67% on the picture
against the references' 89%). The new checks (`pipeline/lib/toon_picture.py`, bands of `toons-target.md`):

| # | Check | Pass |
|---|---|---|
| C1 | Cuts (cards not counted) and holds | 6 a minute or fewer; median hold 6 s+; a body place 8 s+; 1 re-frame at most, never reversed |
| C2 | Holds still, not dead | picture still 78-94%; visible-action seconds 25% or less; big action 5% or less; 40 or fewer big-change frames a minute; pixels moving in 5%+ of frames 5% or less; a 4 s fully still stretch; every shot of 8 s+ has one action |
| M2 | One action, then a hold | no two big actions in a shot closer than 1.5 s |
| C3 | Flash and shake | 1 each at most, no flash on a cut |
| C4 | One-frame pops | 0 (outside cuts) |
| C5 | Zoom jumps | 6% a frame at most |
| C6 | Line weight | 4-7 px in every shot |
| C7 | Colour | body: 60%+ warm, any other family 8% or less, no flat non-tissue field over 12%; rooms: saturation 0.22 or less, brightness 165+ |
| C8 | Time cards | 0.8-1.2 s each, the same framing after, 3 at most |

The table below is the 2026-11-17 version, printed for history only:
| Rule | Band | Reference |
|---|---|---|
| Holds still, but not dead | 45 to 80% of frames still | 63% |
| The body is alive | 15 to 55% of frames with small movement | 34% |
| Line detail | at least 7.5% crisp edges | 8.9% |
| Bold outlines | at least 2.5% near-black | 3.0% |
| Bright | brightness at least 140 | 153 |
The cut rate is reported, not failed (reference: one every 20 s); fewer places per story bring it closer.
Run it after every render, with the other checks. It needs earshot's Python (it has numpy).

## Status (2026-11-17)
- Done: the shared switches above; the arm stage (`stage-arm.tsx`) in this look; the rabies preview
  passes the look check (51% still, 48% small movement, edges 10.9%, near-black 3.8%, brightness 156).
- Not yet in this look: the stomach, tooth, food-pipe and tooth-arena stages; people's faces keep
  blush and glasses shine (only their outlines changed); the boards in `toons-boards/`.
- Every old setting is one switch away in `style.ts` (old values in brackets).
