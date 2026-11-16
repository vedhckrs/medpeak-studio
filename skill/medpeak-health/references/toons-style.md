# MedPeak Toons style guide (v2, 2026-11-16)

Why v1 looked cheap, from full-size reference frames and research on pro 2D vector illustration,
and the rules the v2 engine (`src/toons/ink.tsx`) enforces.

| v1 problem | v2 rule |
|---|---|
| Characters tiny in big empty rooms | Hero character fills 40-70% of the frame width; the camera is low and close; organs can *be* the set |
| Perfect circles and ellipses | Every silhouette is organic: `organic()` (Catmull-Rom spline through hand-placed points) or `blob()` with seeded irregularity. No `<ellipse>` or `<circle>` for a body |
| One line width everywhere | `Ink`: outline heavier on the shadow side (bottom-right), lighter on the lit side; inner marks are `Tapered` (thin-thick-thin) in a darker tone of the fill, never navy |
| Machine-perfect lines | Line boil: a turbulence displacement that changes every 3 frames (subtle, scale ~1.5) |
| Hard copy-paste shading | 3-step cel shading with a feathered edge: core shadow (blurred, clipped), rim light (thin light band on the dark edge), glossy highlight streak + 2 dots, contact shadow on the floor |
| Glow particles, vignette, rings | Sets are painted: soft light/dark blotches, tapered wrinkle marks, a floor plane with blotches; a light paper grain over everything |
| Personality only in the face | Props and costume: caps, glasses, tools, phones; poses that act |

## Line weights (at 1080x1920)
- Character outline: 5-8 px (thicker on the shadow side).
- Inner detail marks: 2-6 px, tapered, colour = fill darkened 30-40%.
- Background marks: 3-7 px, tapered, colour = wall darkened 25%.

## Light
Always from the top-left. Shadow crescent bottom-right. Highlight streak upper-left. Rim light on the
lower-right edge, very thin, lighter than the base.

## Eyes and faces
Large white eyes with a slight egg shape, small pupils for comedy, eyebrows as tapered strokes, a little
asymmetry (one eye 4% bigger). Mouths are shapes with a darker inside, teeth and tongue when open.

## Sources
- Hand-drawn "line boil" with SVG turbulence + displacement: camillovisini.com/coding/simulating-hand-drawn-motion-with-svg-filters
- Line weight as a design tool (thicker for focal and shadow sides, thin for detail): blog.daisie.com/7-tips-to-enhance-line-work-in-cartoon-drawings ; hertzmann.github.io/2021/05/19/how-to-draw-line-thickness.html
- Cel shading steps, rim light, highlight/core shadow/reflected light: fp.udit.es (cel shading), garagefarm.net/blog/types-of-shading-in-3d-and-2d-art, sketchbook.com/blog/shading-techniques
