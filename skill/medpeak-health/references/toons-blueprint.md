# MedPeak Toons character blueprint

Every character in a Toons video follows this blueprint, so a new character matches the cast on the
first try. The rules live in code (`src/toons/blueprint.tsx`, `humans.tsx`, `style.ts`) and are shown
on two rendered pages: `ToonBlueprint` (the rules) and `ToonSheet` (one model sheet per character).

Owner rules (2026-11-16): 100% code-drawn, no AI art. Thin lines, never heavy black. Proper
hands. Nothing wobbles. People are full-body. Every new character goes through this blueprint.

## The six rules
1. **Start from real anatomy and show its real parts.** Look up the real shape and what attaches to
   it (stomach: J-shape, food pipe with muscle rings, duodenum, rugae, the vessels of the greater
   curve; kidney: bean, hilum, artery, vein, ureter, adrenal gland; heart: aorta with three
   branches, vena cava, pulmonary trunk, coronary arteries). Every part goes in `accents` so the
   model sheet names it. Nothing invented.
2. **Organs stay in place: no legs.** Only travellers get legs (pill, white cell, platelet, people).
   Germs and loose cells float.
3. **One accessory shows the job, never two.** White cell = guard cap with a badge. Platelet = medic
   helmet. Egg = bow. Organs need none: their anatomy is the costume.
4. **The face sits on the widest part and the eyes span 40-55% of the body width** (`face.size`
   0.7-1.25). Features are a deep shade of the body colour, not navy.
5. **Line, light and material.** Outline = a darker shade of each fill (`lineOf`), at most 4.2 px
   on screen. Every `Part` names its material (`mat`: flesh, cell, hard, cloth, skin, hair) and the
   engine paints volume: form gradient, two-step shadow, bounce light, texture, gloss (see
   `toons-style.md`). Details are tone-on-tone: `Groove` for folds, `Vein` for vessels.
6. **Hold, then move.** A character holds a pose (breathing only). A move has anticipation, an eased
   travel, a small overshoot and a settle (`motion.ts`: `key`, `E.back`, `settle`). No wobble filters,
   no constant sway. Body acting (lean, nod, turn, hop, weight shift) comes from the `act` prop and is
   driven by the mood and the speech, never by a clock.

## Add a body character (organ, cell, germ, medicine)
1. Research the real anatomy and the character's job in the body. Write one line for `role`.
2. In `src/toons/characters.tsx` write a `Blueprint`:

```tsx
const gallbladder: Blueprint = {
  name: 'gallbladder', family: 'organ',
  role: 'The bile pouch: squeezes bile onto fatty food. Small, proud of its one job.',
  color: '#7dbb5c',                      // 6-digit hex, from the family palette below
  arms: {l: [-34, 8], r: [34, 8]},       // shoulder points on the body edge; null = no arms
  legs: null,                            // organs: always null
  ground: {y: 70, w: 34},                // the lowest point: shadow, squash pivot, where it stands
  accents: [{label: 'bile duct', color: '#8fc96c'}],
  face: {x: 0, y: 4, size: 1},           // on the widest part; add eye: '#...' for a set eye colour
  back: ({color}) => <Tube d="M0 -40 C4 -60 -6 -74 2 -90" r={5} fill={lift(color, 0.1)} />,
  body: ({color}) => (
    <Part d={blob(36, 52, 'gb', 10, 0.05)} fill={color} mat="flesh" shine={[-14, -30, 0.9]}>
      <Groove pts={[[-20, 30], [0, 38], [20, 30]]} color={color} />
    </Part>
  ),
};
```

3. Add it to `BLUEPRINTS`, and add the name to `ORDER` in `src/toons/Preview.tsx`.
4. Render and check: `node pipeline/toon-sheets.mjs gallbladder` -> `out/toons/sheets/sheet-gallbladder.jpg`.
   `makeCharacter` runs `checkBlueprint` and fails with a clear message if a rule is broken.

Drawing tools (`src/toons/ink.tsx`): `Part` (a painted shape with volume; `mat` = its material),
`Tube` (arms, vessels, airways; `soft` for cloth and skin), `Merge` (several shapes, one outline),
`Groove` (a fold), `Vein` (a tapered vessel), `Mark` (a brush mark), `Cast` (a shadow thrown on
another shape), `spline` / `blob` / `lobePts` / `roundRect` / `circlePath` (shapes), `shade` and
`lift` (painter's darker and lighter), `lineOf` (outline colour).

## Add a person
People are a `HumanSpec` in `src/toons/humans.tsx` (`SPECS`), drawn full-body by `makeHuman`:

```ts
nurse: {name: 'nurse', role: 'The nurse: practical, quick, kind.', skin: '#d9a47c', eye: '#4a3324',
  hair: {style: 'short', color: '#2b1d1a'}, top: {kind: 'tee', color: '#7fd3c7'},
  bottom: {kind: 'trousers', color: '#5fbfb2'}, shoes: '#ffffff'},
```

- The recipe builds a skeleton (hips, knees, shoulders, elbows, neck), so every person can bend,
  lean, nod, turn the head and shift weight without extra work.
- Height: adult about 3.6 heads (`height` 1), kid 2.9 (`height` 0.76, `head` 1.3, `legs` 0.8),
  toddler 2.2 (`height` 0.64, `head` 1.45, `legs` 0.45, `torso` 0.8). Arms shorten with the legs.
- Hair styles: curly, short, long, cap, balding, baby. Tops: coat, hoodie, tee, blouse, cardigan,
  onesie. Bottoms: trousers, skirt, shorts. Extras: `glasses` ('round' or 'square'), `lashes`,
  moustache, earrings, stethoscope.
- A new hair style or garment is added once in `HairBack` / `HairFront` / `Top` / `Bottom`, then every
  person can use it.
- Never draw a real, identifiable person.

## Colour families
| Family | Colours | Why |
|---|---|---|
| organs | warm pinks, corals, reds, liver brown, bladder yellow | they belong to the body |
| cells | red cell red, white cell pale lilac, platelet orange, egg peach | clean and bright: the good guys |
| germs | purple, acid green, hot pink spikes | colours the body does not have: they read as intruders |
| medicine | white + MedPeak teal | the brand colour marks the helper |
| people | natural skin tones; Dr. Mira in white coat over teal scrubs | teal ties the doctor to the brand |

## Hands
One clean silhouette in the character's own colour (skin for people): a rounded palm, four fingers
that read at their tips, a thumb. Five poses: relaxed, open, fist, point, thumb. The thumb turns
to the side that faces up, or toward the body when the hand hangs.

## People's arms (rebuilt 2026-11-16, owner: "doctor hand and arms look weird")
What was wrong: each arm was one bendy tube of even thickness, so there was no elbow; the upper arm
hid against a coat of the same colour, so the forearm looked as if it grew out of the ribs; the
open hand was three stubs on a ball and read as a paw.

- An arm is shoulder -> elbow -> wrist: **two straight segments that taper**, with a rounded elbow,
  a fold line inside a sharp bend, a cuff (ribbed on hoodies and cardigans, a short sleeve with a
  bare arm on tees) and a soft shadow thrown on the body under the arm.
- A person's pose gives both joints: `u` = where the upper arm points, `f` = where the forearm
  points (0 = out to the side, 90 = down, -90 = up, 180 and beyond = across the body). `ul` under 1
  shortens an upper arm that points at the viewer (a hand on the chin or chest). Poses are written
  once for the right arm with `R(u, f)` and mirrored with `L(u, f)` in `src/toons/poses.ts`.
- Elbows stay a little away from the body in every gesture, so the upper arm can be seen.
- A gesturing hand stays within about 62 units of the body's centre line; two people stand 100
  apart, so a longer reach touches the other person. `point` aims up at the graphics for this reason.
- Scripts only use the named poses (rest, wave, point, pointLeft, panic, fists, thumb, shrug, hips,
  belly, explain, think, present, cheer, heart, facepalm, crossed). Body characters keep soft arms:
  `arms={[112, {a: -30, hand: 'point'}]}`.
- Check any change on the pose board: `node pipeline/toon-sheets.mjs --boards` renders every pose
  for the doctor, the patient and the kid (`toons-boards/poses-doctor.jpg`).

## People's legs (rebuilt 2026-11-16, owner: "each character's legs jump")
What was wrong: a leg was one bendy tube and the knee was solved back from the hips, with legs
that were almost straight. So whenever the hips moved a hair (a talking beat, a shift of weight in
a quarter of a second) the knees snapped sideways and the whole body lurched.

- A leg is hip -> knee -> ankle: **two tapering segments** (thigh, shin) with a real knee.
- **A knee bend is set, never solved.** A weight shift, a crouch or a step sets how far the knee
  stands out; the hip drops by exactly what that bend takes up (`jointsOf` in humans.tsx).
- Feet stay planted unless the character walks. Talking moves the head, the shoulders and the
  hands; the hips stay still. People squash and stretch only a third as much as the round bodies.
- A weight shift is slow (about a second and a half) and happens every six seconds or so.
- A gesture takes 12 frames and starts and ends softly.
- **Measured, not judged by eye:** `npm run toon:motion -- <slug>` walks through a script frame by
  frame and fails on a foot that slides (over 0.6 px), a hip or knee that moves more than 3 px in
  one frame, a hand over 85 px, or a pop. It runs in the tests. Before the rebuild a standing
  doctor's legs changed strongly on 279 of 599 frames; after, feet 0.00 px and knees 1.0 px.

## Headwear and hair
The boy's cap (owner: "boy hat not good") was a shallow bowl with the peak sticking out sideways.
A cap now hugs the head down to just above the ears, the panels meet at a button and the peak is
a curved visor in FRONT of the forehead; `capback` wears it backwards (strap in front, a tuft of
hair under it); `messy` is no cap. Whatever sits on a head stops above the eyebrows: they carry
the expression. Options sheet: `toons-boards/caps.jpg` (`ToonCaps`).

## Checklist before a new character is used in a video
- [ ] The model sheet reads at thumbnail size: you can name the organ without the label.
- [ ] Its real anatomical parts are drawn and named in `accents`; nothing invented.
- [ ] Every surface has a material (`mat`); the shadow side shows texture and a bounce light.
- [ ] No legs unless it travels. At most one accessory.
- [ ] All 9 emotions read clearly on the sheet (eyes are not cut by an edge or a hat).
- [ ] Arms come out of the body edge, hands do not hide behind the body in the rest pose.
- [ ] Colours come from its family; the outline is a darker shade, not black.
- [ ] `checkBlueprint` passes and `npx tsc --noEmit` is clean.

## Reference boards
Rendered examples live in `toons-boards/` (blueprint page, cast, camera and lenses, sets, model sheets).
Re-render with `node pipeline/toon-sheets.mjs` and copy over when the cast changes.

## Engine v9 (2026-11-23): stages, mini workers, intruders, and the layout log

The owner approved the engine study (`plans/engine-upgrade-2026-11-23/05-blueprint.md`, Part 4): "All 28 recommend and start 2 to 3 agents to fix and upgrade engine and everything i want proper as per report". Look v8 pieces are
built with the kit in `src/toons/v8/` (this page's older sections describe the v6 cast); the rules of look v8 are in
`toons-v8-style.md`. Three new kinds of piece, and one rule for every piece:

**An anatomy stage** (`src/toons/v8/anatomy.tsx`, `StageDef`): a full 1080 x 1920 place in three planes (the cavity behind, the
hero organ and its 3+ real neighbours, a cropped near edge), drawn with the kit's tissue pieces (`Wall`, `Folds`, `Lobes`,
`Speckle`, one `Highlight`), built to HOLD 20 s and change state through its `dials` (0..1, documented: `tar`, `fill`,
`airway`...). It names its `slots` (where intruders enter), its `faces` (each face's centre and radius at rest), its
`faceRoom` (boxes nothing may enter) and its `neighbours`. Targets: no flat non-tissue field over 12%; organ eye 120-170 px,
face above y 800; mouth 40-70 px; nothing in the caption band at the face; outline 5-6 px on screen. Acceptance: a 16:9
board with four states and a full still (`node pipeline/toon-v8-sheets.mjs anatomy`), colour check C7 on each still.

**A mini worker** (`MiniWorker` in `cells.tsx`): two heads tall, kit eyes, small real hands (the rig's `Hand` at small scale),
a uniform and ONE prop (guard, cleaner, firefighter, courier, builder), a contact shadow; a `BandLabel` instead of a tag.

**An intruder / hero prop** (`Intruder` in `props.tsx`): enters from a frame edge or a stage slot with `enter()`, overlaps the
organ, may get kit eyes; the one hero prop of a video is drawn a level richer (3 tones, 1 highlight line, 2-4 construction
details) in the same kit line. Held props: `handProp` only, drawn behind the person.

**Every piece reports to the layout log.** A face, an eye, a mouth, a hand, a tag, a label, a burst, a text, a prop, a wall
item: call `useReport()` (`src/toons/v8/play.tsx`) with its box in its own units; a wrapper that moves its children wraps them
in `FrameMove`. Outside a probe it costs nothing. The exact call for each kind: `plans/engine-upgrade-2026-11-23/07-layout-log-wiring.md`.
A piece that does not report is invisible to the layout checks (the picture checks are the second net).
