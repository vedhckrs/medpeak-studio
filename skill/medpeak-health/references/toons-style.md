# MedPeak Toons style guide (v6, 2026-11-16)

The look of the cartoon "talking organs" Shorts. Everything here is enforced by `src/toons/style.ts`
(one settings file) and the drawing engine `src/toons/ink.tsx`. New characters follow
`toons-blueprint.md`; the camera follows `toons-camera.md`.

## What earlier versions got wrong (owner feedback + research)
| Problem (owner's words) | Cause | Rule now |
|---|---|---|
| "Too much thick black lines" | one heavy navy outline that scaled up with the character | outline = a darker shade of each fill (`lineOf`), `STYLE.line` 1.8 units, never more than 4.2 px on screen |
| "Hand is not proper" | white gloves built from separate outlined blocks | one mitten silhouette in the character's own colour, 5 poses |
| "Animation like a burning screen, very wavy" | a displacement filter (line boil) on every character + constant sway | `STYLE.boil = 0`. No filters on characters. Poses are held; every move has a reason |
| "Cheap, not professional" (v5) | flat stickers: one fill, a faint shadow, black-dot eyes | **volume paint** (below), coloured shaded irises, real anatomy on every organ |
| "More high-end texture and detailed structure" | no surface texture; 2-3 features per organ | every surface names a **material**; organs show vessels, ducts, lobes, folds; cells show their insides |
| "Human characters need more motion" | people were a stiff stack of shapes | people are built on a **skeleton** (hips, knees, elbows, neck) and act with the whole body |
| "Background animation needed" | sets were one flat picture | every set is **layers that live** (`scenes.tsx`, `SET_LIFE`) |
| "More cinematic camera and lenses" | one zoom, hard cuts | shot sizes, lenses with depth of field, parallax and moves (`toons-camera.md`) |

## Volume paint (`Part` in `ink.tsx`)
Light comes from the top-left. Every painted shape gets, in this order:
1. the fill colour;
2. a **two-step crisp shadow** on the lower right: a core shadow and a thinner, darker edge inside it;
3. a **soft form gradient**: lighter on the upper left, deeper on the lower right, so the shape is round;
4. the **material texture** (next section);
5. a **bounce light**: a thin lighter line hugging the shadow-side edge;
6. an **edge light**: a thin bright line hugging the light-side edge;
7. tone-on-tone details: `Groove` (a fold with a lit lip), `Vein` (a tapered vessel), `Mark`;
8. a **gloss**: soft halo, one streak, one dot;
9. the thin outline in a darker shade of the fill.

Shadows are painted like a painter would: `shade()` makes a colour darker, a little richer and
slides its hue toward violet (pink -> rose, yellow -> orange, green -> teal, white -> lavender).
`lift()` makes it lighter and a touch warmer. Never grey, never black. `Cast` paints the shadow one
shape throws on another (a cap on a head). All strengths are in `style.ts`
(`shadow`, `shadowDeep`, `form`, `rim`, `edge`, `gloss`, `texture`).

## Materials (`mat` on a `Part`)
| Material | Used for | Texture and highlight |
|---|---|---|
| `flesh` | organs | soft mottling + a stippled shadow + a few light specks: wet and alive |
| `cell` | cells, germs | a translucent double wall + granules |
| `hard` | teeth, bone, capsule, metal, shoes | clean, with a long window reflection and a sharp gloss |
| `cloth` | clothes, caps, bows | a fine weave in the shadow; matte limbs (`Tube soft`) |
| `skin` | people | clean, warm bounce light |
| `hair` | hair, moustache | clean; curls, strands and shine bands are drawn by hand |
| `matte` | everything else | clean |

Textures are plain vector marks (one path of dots or strokes per shape), seeded so they are the
same on every frame. Nothing shimmers.

## Face (`rig.tsx`)
Big eyes with a **coloured iris** (shaded: darker on top, lit from below), a dark pupil, two
highlights, a lid shadow on the white, a stronger upper lash line. The iris shrinks with fear and
surprise. Brush-stroke brows, shaped mouths with shaded teeth and tongue, gradient blush. 9 emotions.
Eye colour: `face.eye` on a blueprint, `eye` on a person (default: a deep shade of the body colour).
People's eyes have no hard ring (it read as glasses), a small shaped nose, optional `lashes`.
`turn` slides the features and narrows the far eye, so a head can turn.

## Structure
Organs are drawn from anatomy, with their real parts in their real places, each listed on the model
sheet: the stomach has its food pipe with muscle rings, the duodenum, rugae and the vessels of the
greater curve; the heart has the aorta with three branches, the vena cava, the pulmonary trunk,
coronary arteries and fat; the kidney has its artery, vein, ureter, renal pelvis and adrenal gland;
the lungs show the windpipe rings, the bronchial tree and the fissures; cells show nucleus,
granules and membranes; germs show their genes, spikes, pili and flagellum.

## People
Built on a skeleton by `makeHuman` (`humans.tsx`): adults about 3.6 heads tall, kids 2.9, toddlers
2.2 (bigger heads than life, because the face is what the viewer reads). Clothes carry real detail:
lapels, pockets, pens, an ID badge, drawstrings, ribbing, pleats, seams, laces.

## Motion (`motion.ts`, `Player.tsx`)
Nothing wobbles. A character holds a pose (breathing 0.7%), then moves with anticipation, easing, a
small overshoot and a settle. On top of the arm pose every character acts with its body (`act`):
- the **mood** sets the stance: angry leans in, scared leans away with raised shoulders, sad and
  sick drop the head, smug tilts it;
- **speech** drives the rest: the arms beat and the head nods on stressed words, the speaker leans
  toward the listener and glances at the viewer;
- **listeners** shift their weight every few seconds, tilt the head and nod;
- people bend real knees and elbows; organs lean and hop.

## Sets and camera
Sets are layers at different depths that live (drips, bubbles, cells streaming, clouds, a ticking
clock, a scrolling heart monitor); see `SET_LIFE` in `scenes.tsx`. The camera has shot sizes,
lenses and moves; see `toons-camera.md`.

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
- Multiplane camera (layers at depths, parallax): Wikipedia "Multiplane camera".
- Shot sizes, focal length and depth of field: standard film grammar (wide / medium / close-up;
  longer lens = shallower focus and flatter depth).
