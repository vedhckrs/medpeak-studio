# Visual types (src/scenes/Panels.tsx)

Every scene has `visual.panels`: one picture each, shown for an equal share of the scene's voice.
Long video: no picture over 5 s. Shorts: no picture over 3 s. `sfx` on the scene overrides the
first panel's sound (whoosh, pop, tick, impact, riser, heart, bubble, chime).

| type | fields | use for |
|---|---|---|
| `title` | text, sub?, accent? (word shown in amber) | hooks, one-line ideas |
| `stat` | value, unit?, label, decimals?, color? | one big number that counts up |
| `compare` | items[{label, value, unit?, color?}], caption? | before/after, risk levels, limits |
| `organ` | organ, level 0-1, label?, callouts[]?, highlight? | the body: liver, pancreas, heart, brain, vessel, cell, tooth, fatcell, body |
| `flow` | steps[], color? | cause -> effect chains |
| `list` | n, title, sub? | "Number one / two / three" beats (Retention 7 counting) |
| `chapter` | n, title | chapter cards |
| `twist` | text | "But here's the twist" (Retention 7 twist) |
| `fact` | text, source? | study cards (people, years) |
| `spoons` | count, label, limit? | sugar as teaspoons; red past the WHO limit |
| `clip` | src (path in public/), label? | AI 3D hero shots (paid; quote first). Falls back to a title card if the file is missing |
| `image` | src, label? | stills |

`organ.level` means: liver = fat droplets, vessel = glucose amount, cell = insulin resistance
(>= 0.5 locked), pancreas = insulin released, tooth = cavity size, brain = reward glow, fatcell = growth.
`organ: body` + `highlight` lights brain, heart, liver, pancreas, vessel or teeth.

To add a type: add it to `Visual` in `src/types.ts`, draw it in `Panels.tsx`, document it here,
render stills to check it, then commit on a `feat/` branch.
