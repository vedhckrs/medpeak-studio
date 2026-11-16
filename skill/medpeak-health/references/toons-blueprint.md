# MedPeak Toons character blueprint

Every character in a Toons video follows this blueprint, so a new character matches the cast on the
first try. The rules live in code (`src/toons/blueprint.tsx`, `humans.tsx`, `style.ts`) and are shown
on two rendered pages: `ToonBlueprint` (the rules) and `ToonSheet` (one model sheet per character).

Owner rules (2026-11-16): 100% code-drawn, no AI art. Thin lines, never heavy black. Proper mitten
hands. Nothing wobbles. People are full-body. Every new character goes through this blueprint.

## The six rules
1. **Start from real anatomy.** Look up the real shape, then keep the 2-3 features that make it
   recognisable (stomach: J-shape + food pipe on top; kidney: bean + notch + red and blue vessels;
   heart: aorta arch + blue pulmonary artery). Draw them, drop the rest.
2. **Organs stay in place: no legs.** Only travellers get legs (pill, white cell, platelet, people).
   Germs and loose cells float.
3. **One accessory shows the job, never two.** White cell = guard cap with a badge. Platelet = medic
   helmet. Egg = bow. Organs need none: their anatomy is the costume.
4. **The face sits on the widest part and the eyes span 40-55% of the body width** (`face.size`
   0.7-1.25). Features are a deep shade of the body colour, not navy.
5. **Line and light.** Outline = a darker shade of each fill (`lineOf`), at most 4.2 px on screen
   however big the character is. Flat colour + one crisp shadow edge lower-right + soft light and one
   gloss mark upper-left. Details are tone-on-tone brush marks, never hard lines.
6. **Hold, then move.** A character holds a pose (breathing only). A move has anticipation, an eased
   travel, a small overshoot and a settle (`motion.ts`: `key`, `E.back`, `settle`). No wobble filters,
   no constant sway.

## Add a body character (organ, cell, germ, medicine)
1. Research the real anatomy and the character's job in the body. Write one line for `role`.
2. In `src/toons/characters.tsx` write a `Blueprint`:

```tsx
const gallbladder: Blueprint = {
  name: 'gallbladder', family: 'organ',
  role: 'The bile pouch: squeezes bile onto fatty food. Small, proud of its one job.',
  color: '#7dbb5c',                      // 6-digit hex, from the family palette below
  face: {x: 0, y: 4, size: 1},           // on the widest part
  arms: {l: [-34, 8], r: [34, 8]},       // shoulder points on the body edge; null = no arms
  legs: null,                            // organs: always null
  ground: {y: 70, w: 34},                // the lowest point: shadow, squash pivot, where it stands
  back: ({color}) => <Tube d="M0 -40 C4 -60 -6 -74 2 -90" r={5} fill={tone(color, 0.06)} />,
  body: ({color}) => <Part d={blob(36, 52, 'gb', 10, 0.05)} fill={color} shine={[-14, -30, 0.9]} />,
};
```

3. Add it to `BLUEPRINTS`, and add the name to `ORDER` in `src/toons/Preview.tsx`.
4. Render and check: `node pipeline/toon-sheets.mjs gallbladder` -> `out/toons/sheets/sheet-gallbladder.jpg`.
   `makeCharacter` runs `checkBlueprint` and fails with a clear message if a rule is broken.

Drawing tools (`src/toons/ink.tsx`): `Part` (a painted shape), `Tube` (arms, vessels, airways),
`Merge` (several shapes, one outline), `Mark` (tone-on-tone brush mark), `spline` / `blob` /
`scallopPts` / `roundRect` / `circlePath` (shapes), `tone` (lighter/darker), `lineOf` (outline colour).

## Add a person
People are a `HumanSpec` in `src/toons/humans.tsx` (`SPECS`), drawn full-body by `makeHuman`:

```ts
nurse: {name: 'nurse', role: 'The nurse: practical, quick, kind.', skin: '#d9a47c',
  hair: {style: 'short', color: '#2b1d1a'}, top: {kind: 'tee', color: '#7fd3c7'},
  bottom: {kind: 'trousers', color: '#5fbfb2'}, shoes: '#ffffff'},
```

- Height: adult 4 heads (`height` 1), kid 3 heads (`height` 0.76, `head` 1.3, `legs` 0.8), toddler
  2.5 heads (`height` 0.62, `head` 1.45, `legs` 0.45: short legs, long body).
- Hair styles: curly, short, long, cap, balding, baby. Tops: coat, hoodie, tee, blouse, cardigan,
  onesie. Bottoms: trousers, skirt, shorts. Extras: glasses, moustache, earrings, stethoscope.
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
One mitten shape: bundled fingers + a thumb wedge, one outline, in the character's own colour
(skin for people). Five poses: relaxed, open, fist, point, thumb. Set per arm:
`arms={[112, {a: -30, hand: 'point'}]}` (angles: 0 = right, 90 = down, 180 = left, -90 = up).

## Checklist before a new character is used in a video
- [ ] The model sheet reads at thumbnail size: you can name the organ without the label.
- [ ] 2-3 real anatomical features, nothing invented.
- [ ] No legs unless it travels. At most one accessory.
- [ ] All 9 emotions read clearly on the sheet (eyes are not cut by an edge or a hat).
- [ ] Arms come out of the body edge, hands do not hide behind the body in the rest pose.
- [ ] Colours come from its family; the outline is a darker shade, not black.
- [ ] `checkBlueprint` passes and `npx tsc --noEmit` is clean.

## Reference boards
Rendered examples live in `toons-boards/` (blueprint page, cast, two model sheets). Re-render with `node pipeline/toon-sheets.mjs` and copy over when the cast changes.
