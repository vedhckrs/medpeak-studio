# MedPeak Toons: the ink look (approved 2026-11-17)

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

## The motion: the body is alive, in moments
The reference holds still in 63% of its frames, but the body never looks dead. So:
- **The camera and the rooms hold still** (`STYLE.roomLife: 0`, `breathe: 0`).
- **The body lives in moments, not all the time:** a heartbeat swell every 2 s, a muscle tightening
  every 6 s, a nerve signal every 5 s, each a fraction of a second, a few pixels. Never a constant drift.
- **Characters act with purpose:** the virus creeps in little hops only while it climbs, squashes and
  stretches, gets dizzy stars after hitting the wall; the defenders march in steps, lock into a wall
  and lean; eyes blink.
- **Impacts move the world:** the nip shakes the skin and fat; drops land with a ring.
- **People talk calmly:** arms and head beat less on stressed words (`talkBeat: 0.3`); caption words
  swap rather than grow in (`captionPop: false`).

## The look check (`npm run toon:look -- <slug>`)
Reads every frame of the render (30 a second) and compares it with the reference:
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
