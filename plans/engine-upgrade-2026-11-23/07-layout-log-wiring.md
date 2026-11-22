# Engine v9, phase 1: wiring the layout log into every component (for agents B and C, and for the merge)

Date: 2026-11-23. Written by agent A (checks and rules). Agent A built the layout log API and the checks; the components
that agents B and C own must REPORT where they are. Until they do, the probe reports for them with SHIMS (estimated boxes,
marked `src: 'shim'` in the log and "(estimated boxes)" in every check's output). As soon as a component calls `useReport`
itself, the probe drops its shim item for the same thing (same kind, boxes overlapping over 30%), so wiring can land one
component at a time and nothing is counted twice.

## The API (src/toons/v8/play.tsx)

```ts
import {useReport, FrameMove, ScreenSpace, circleBox, type Box, type ReportKind} from './play';

const report = useReport();          // call during render, at the top of the component (a hook)
report({kind, box, who?, dir?, owner?, open?, id?, tip?, text?});
```

- `box` is in the component's OWN drawing units (the units its props are in): a Put's 200-unit figure space, frame
  pixels in a `Layer`, screen pixels in a shot's `Screen`. The log maps it with the transforms on the way down.
- `who` names the character ('liver', 'mom'); leave it out inside a `Put who="liver"` or a person (it is inherited).
- `dir` is a gaze or an arrow direction (the pupil offset `look`, -1..1); it turns with the drawing, keeps its length.
- Outside a probe `useReport()` is a no-op and costs nothing. A component that never reports still renders exactly as
  before (proved by `pipeline/test/layout.test.mjs`: the markup with and without a probe is identical, and a still of
  creatine at 15.6 s rendered with and without this phase has the same pixels).
- A wrapper that MOVES its children with its own transform must tell the log: wrap the children in
  `<FrameMove m={matrix} who? body?>` (`body` marks a new figure: what is drawn inside belongs to it). `Put` does this.
  Until a wrapper does, the probe follows every `<svg viewBox>`, `<g transform>` and moved `<div>` (left/top/transform)
  by itself, so nothing is lost; FrameMove makes it exact and survives a change of markup.
- `ScreenSpace` marks children laid on the screen after the camera (the player's caption and watermark).

## Who calls what (exact calls)

### Agent B: `kit.tsx`

| Component | Call (inside the component, in its own units) |
|---|---|
| `Eyes` ({x, y, r, gap, look, mood}) | for each eye `report({kind: 'eye', box: circleBox(cx, y, r, ry), dir: look, open: mood !== 'closed' && lid < 0.8})` with `cx = x -+ (r + gap / 2)` and `ry = 1.12 * r` once the oval eye lands; then ONE `report({kind: 'face', box: {x0: x - 2r - gap/2 - 0.3r, y0: y - 1.4r, x1: x + 2r + gap/2 + 0.3r, y1: y + 2.6r}, dir: look})` unless a person draws it (the people rig reports its own face; see below) |
| `Mouth` ({x, y, w, kind}) | `report({kind: 'mouth', box: {x0: x - w/2, y0: y - w/2, x1: x + w/2, y1: y + w*0.8}, open: ['open','big','o'].includes(kind)})` |
| `TinyArm` ({to, w, hand}) | `report({kind: 'hand', box: circleBox(to[0], to[1], w * 2), open: hand === 'open'})` (nothing for `hand: 'none'`) |
| `Fig` | wrap children: `<FrameMove m={putMatrix(x, y, size, 0, flip)} body>` (import `putMatrix` from scene.tsx) |
| new `BandLabel` | `report({kind: 'label', box, text})` (the band's hull); a character wearing one: pass `who` |
| new `Highlight`, `ContactShadow`, `Liquid`, `Cutaway`, damage pieces | nothing (not things a face can be covered by) |

### Agent B: `people-rig.tsx`

| Component | Call |
|---|---|
| `PersonAt` ({spec, x, y, scale, view, pose, facing, bob, look, lookAt}) | wrap the drawing in `<FrameMove m={IDENTITY} who={spec.id} body>`; `const h = headAt(spec, o)`, `const hands = handAt(spec, o)`; `report({kind: 'head', box: circleBox(h.x, h.y, h.r)})`, `report({kind: 'face', box: {x0: h.x - 0.55h.r, y0: h.y - 0.45h.r, x1: h.x + 0.55h.r, y1: h.y + 0.6h.r}, dir: <the pupil direction actually drawn>})`, and for R and L `report({kind: 'hand', id: 'R' or 'L', box: circleBox(palm, 0.32 * spec.build.R * scale), open: <the hand shape is the spread "open" gesture>})`. Report `kind: 'body'` with the figure's hull if cheap. |
| `HeadAt` | wrap in `<FrameMove ... who={spec.id} body>`; `report({kind: 'head', box: circleBox(x, y, px)})`, `report({kind: 'face', box: {x0: x - 0.75px, y0: y - 0.55px, x1: x + 0.75px, y1: y + 0.75px}, dir})` |
| `Person`'s own `Eyes` | report `eye` only, not a second `face` (the probe's shim does this through a context; when wiring, pass a prop such as `face={false}` to `Eyes`) |
| symptom `mark` (decision 14) | `report({kind: 'prop', id: 'mark:' + kind, box})` so check L14 can see it |

### Agent B: `organs-a/b`, `cells`, `germs`, `props`, `anatomy.tsx`, `scenes-*`, `micro3.tsx`

- Characters drawn with the kit's `Eyes`/`Mouth`/`TinyArm` are covered by the kit calls above; give their `Put` a `who`
  in the shot files (or the character component may wrap itself in `<FrameMove m={IDENTITY} who="liver">`).
- `MiniWorker`: like a small person (face, hands, `who`).
- `Intruder`, hero props, `handProp`: `report({kind: 'prop', box, who?})`; a prop with words also `report({kind: 'text', box, text})`.
- Wall items in rooms (charts, clocks, pictures): `report({kind: 'wallItem', box})` (checks L6, L12).
- `anatomy.tsx` stages: `report({kind: 'label', ...})` for `stay` place labels; each neighbour structure
  `report({kind: 'body', id: 'neighbour:' + name, box})` so the scoreboard's "Neighbours around the hero organ" row
  (now "not measured") can count them; and `faceRoom` boxes as `report({kind: 'body', id: 'faceRoom:' + who, box})`.
- `micro3.tsx` `Depth`: wrap children in `<FrameMove m={translate(dx + o.x, dy + o.y) * scale(kk) * translate(-o)}>` (the probe
  follows its moved div today).

### Agent B: `hud.tsx`

| Component | Call |
|---|---|
| `CharTag` ({label, x, y, r, t, dur}) | while shown: `report({kind: 'tag', box: <the tag box from tagBox, + 7 px shadow>, text: label, owner: label, tip: <the arrow's end point>, id: 'tag:' + label})`; with the new arrow-to-body-centre rule the tip is inside the character's `body` box (check L4) |
| `IconBadge` | `report({kind: 'icon', box: circleBox(x, y, size / 2), id: 'icon:' + icon})` while shown |
| `WordCaption` | `report({kind: 'caption', box: <the word's box: width about letters * size * 0.7 + 2 * stroke, height size + 2 * stroke, centred on (540, y)>, text: word})`; the player renders it inside `<ScreenSpace>` |
| `Watermark` | `report({kind: 'watermark', box, id: 'act' + act})` inside `<ScreenSpace>` |
| `TimeCard` (new) | `report({kind: 'text', box, text})`; the shot kind `card` (from the director's `kindOf`) |
| `CtaCardV4` | nothing (the end card is outside the story the checks measure) |

### Agent C: `act.tsx`, `organ-act.tsx`, `video.tsx`, `director.ts`

| Piece | Call |
|---|---|
| `Burst` | while shown: `report({kind: 'fx', box: circleBox(x, y, r * 1.15), id: 'burst@' + t0})` (check L7 counts distinct ids) |
| `FightCloud`, `Sweat`, `Marks`, `Stamp`, `SpeedLines` | `report({kind: 'fx', box, id})` (Sweat and Marks: `owner: who`, they are allowed on their own face) |
| `shake` | nothing in the log (the picture check C3 measures it) |
| `video.tsx` | (1) export `cameraOf(L, toon, timings, sec): {x, y, z}` (the camera after `smoothCam`, the shake and the punch), so `pipeline/lib/toon-layout.mjs` uses the real camera for shots without a `view` (today it marks them `approx`); (2) render `WordCaption` and `Watermark` inside `<ScreenSpace>` (then the probe's own copy of the caption and watermark rules, `WM_AT` in toon-layout.mjs, can go); (3) optional: a `probe` prop on `ToonV8` |
| `director.ts` | export `kindOf(shot): 'body' | 'micro' | 'room' | 'card'`; toon-layout.mjs uses `kindOfShot` (set home/clinic = room, `card` = card, else body) until then |
| `play.tsx` additions of phase 4 (`latched`, `still`, `onKey`, `lookAt`, the 0.2 s blink) | agent A owns play.tsx: send them to agent A, or add them after the merge (the layout log part is at the end of the file, under "the layout log") |

### The merge (main session)

- `package.json` (no agent owns it): add `"toon:score": "node --import tsx pipeline/toon-score.mjs"` and
  `"toon:layout": "node --import tsx pipeline/lib/toon-layout.mjs"`. Until then the docs give the `node --import tsx` form.
- After B and C wire their components: `node --import tsx pipeline/toon-staging.mjs <slug> --fresh` must say no
  "(estimated boxes)" for the wired kinds; then drop the matching shims in `installShims` (pipeline/lib/toon-layout.mjs).
- `LAYOUT_VERSION` in toon-layout.mjs: bump it when the log's shape changes.

## Limits today (honest)

- Shim boxes are estimates from props: the face box of a body character is the eyes plus a mouth band; an eye drawn by a
  component that changes it after the props (a squint) is the eye's circle. They line up with the real frames within a few
  pixels on the four videos (see `phase1-proof-caught.jpg`), but a component that reports itself is exact.
- Body characters have names only when their `Put` has `who`, or when the shot's `focus(who)` tells them apart (then the
  probe guesses and marks `guess: true`). So gaze (L10) and "the body holds" (M1) measure people now, body characters after wiring.
- The player's shake (`video.tsx`) is not in the probe's camera; C3 measures it on the picture.
