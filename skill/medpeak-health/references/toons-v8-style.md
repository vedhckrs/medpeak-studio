# MedPeak Toons, look v8: the drawing rules (2026-11-20)

**Status: the cast and prop sheets were APPROVED by the owner on 2026-11-20** (after one fix: the sleeve must not
draw an arc on top of the shoulder). The approved sheets are in `toons-boards/v8/`. Scenes (rooms and the inside
of the body) come next, built with `src/toons/v8/scene.tsx`, and need their own approval.

Owner's decision, 2026-11-20: everything is drawn by code again (no AI art, no stock art), in the drawing
language of the reference Shorts, as one consistent family. Character sheets and props are shown to him as
16:9 JPGs for approval before anything goes into a video.

**We follow the reference's drawing language, not its drawings.** Never copy one of their characters, a
specific design, a joke, a title or a layout of theirs. Our cast keeps its own identities (below).

The shared kit is `src/toons/v8/kit.tsx`. Every v8 character, prop and sheet is built from it. Nobody
changes the kit to suit one sheet: a missing piece is built in the sheet's own file and reported.

## The ten rules

1. **One outline.** Colour `INK` (#2b1a17), thin and even, round joins and caps. `OUTLINE` (3.4 px) for the
   outside of a shape, `INLINE` (2.2 px) for lines inside it. Strokes never scale with the figure. No
   coloured outlines, no outline-free shapes (except a shadow shape or a band inside a shape).
2. **Flat colour.** A shape has one fill. It may have ONE darker tone of the same colour (`shade()`), as a
   shadow shape on the lower right or a band along an edge, and ONE lighter tone (`tint()`) as a band.
   Nothing else: no gradients, no gloss streaks, no glow, no texture, no drop shadows, no blur.
3. **The face.** Two big white round eyes that touch or almost touch, a small black pupil, a thin outline
   (`<Eyes>`). A tiny mouth (`<Mouth>`). Thin short brows only when the feeling needs them. No iris
   colour, no catchlight, no eyelashes on body characters, no blush, no nose on body characters.
   The face is SMALL on a big body: the two eyes together are about a quarter to a third of the body's
   width, and sit in the upper half.
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
