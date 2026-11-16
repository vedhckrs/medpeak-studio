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
