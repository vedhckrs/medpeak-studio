# MedPeak Toons style guide (v5, 2026-11-16)

The look of the cartoon "talking organs" Shorts. Everything here is enforced by `src/toons/style.ts`
(one settings file) and the drawing engine `src/toons/ink.tsx`. New characters follow
`toons-blueprint.md`.

## What earlier versions got wrong (owner feedback + research)
| Problem | Cause | v5 rule |
|---|---|---|
| "Too much thick black lines" | one heavy navy outline, thickened again on one side, scaling up with the character | outline = a darker shade of each fill (`lineOf`), `STYLE.line` 1.9 units and never more than `maxLinePx` 4.2 px on screen (Slot, Camera and Scaled share the scale) |
| "Hand is not proper" | white gloves built from separate outlined blocks | one mitten silhouette (bundled fingers + thumb wedge) in the character's own colour, 5 poses |
| "Animation like a burning screen, very wavy" | a turbulence displacement filter (line boil) on every character + constant sway | `STYLE.boil = 0`. Characters hold a pose (breathing 0.7%) and move with anticipation, easing, a small overshoot and a settle |
| "Cheap, not professional" | mascot bodies with boots; soft airbrush shading; generic shapes | organs drawn from real anatomy with vessels, airways and lobes, no legs; flat colour + one crisp shadow edge + one gloss; tone-on-tone detail marks |
| People cut off at the waist | half-body rigs | full-body people from one recipe: adults 4 heads, kids 3, toddlers 2.5 |
| No way to stay on-style | every character hand-made | the character blueprint (`makeCharacter`, `makeHuman`, `checkBlueprint`) + a model sheet per character |

## What the reference frames show (studied at full size, format only, nothing copied)
- Lines about 4 px at 1080 wide, uniform and thin.
- Organs drawn large and anatomically, in place, with tiny arms in the body colour.
- Flat colour with a few hard-edged shadow shapes and small highlights. Simple, muted backgrounds.
- People about 4 heads tall with full outfits; costume gives a character its job.

## Line
- Colour: `lineOf(fill)`: same hue, darker and calmer (pink -> maroon, yellow -> brown, white -> slate).
  Face features use a deeper shade of the skin colour. Only pupils are near-black.
- Sets: maroon lines inside the body (`fleshLine`), slate in rooms (`roomLine`), 3.2 px.

## Light
Top-left. Crisp shadow edge lower-right (`shadow`, `shadowDepth`), soft top light (`topLight`), one
gloss streak and dot upper-left (`gloss`). A flat contact shadow on the floor.

## Face
Big clean eyes (white, dark pupil, two highlights, a stronger upper lash line, soft lid shadow),
brush-stroke brows, shaped mouths with teeth and tongue, soft blush. 9 emotions. Closed eyes are one
curved lash line. People add a small nose.

## Motion (`src/toons/motion.ts`)
`key(frame, [[frame, value, ease]])` for posed moves, `E.back` for overshoot, `settle` for landings,
`speak` for mouth movement, `Hold` (stage.tsx) for the breathing hold. Guideline numbers: overshoot
1-3% scale or 2-8 px, settle within 4-8 frames; anticipation before every big move.

## Sources
- Mitten hands, thumb wedge, four-finger convention: Toons Mag "How to draw cartoon hands"; Preston
  Blair's hand model sheets; tutsplus "Cartoon fundamentals: how to draw cartoon hands".
- Coloured line art (a darker version of the nearest fill; black kept for the eyes): Graphixly
  "Creating colored line art"; Ctrl+Paint "Colored lineart".
- Floaty animation, moving holds, overshoot and settle: Animation Mentor "Why all animators need to
  master the moving hold"; School of Motion "New to 2D character animation? Common mistakes".
- Model sheets and head-height proportions: Wikipedia "Model sheet"; Toon Boom Learn "Character
  proportions"; Clip Studio "Model sheets for character designers".
- Cel shading steps and rim light: garagefarm "Types of shading in 3D and 2D art".
