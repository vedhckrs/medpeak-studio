# MedPeak Toons: cartoon "talking organs" Shorts (100% code-drawn)

Owner decision 2026-11-15: a second Shorts format in the comedy-explainer genre (organs argue, a patient
asks the doctor, the doctor explains), drawn entirely in code. Studied: the top 20 Shorts of a large
cartoon health channel (format only). We never copy anyone's characters, art, audio, titles or doctor.

## What the genre does (measured on 20 reference Shorts)
- 45-98 s (median 60 s), 30 fps, 1080x1920; mixed loud (about -9.4 LUFS).
- ~60% body scene with talking organs, ~5% real-world moment, ~35% doctor's office explanation.
- Several voices per video; fast talk (~2.8 words/s); calm, slower doctor.
- Music under everything (~9 dB below the voice, never silent); ~1 sound effect per second.
- One word on screen at a time; 2-3 sets per video; motion from faces and arms, not cuts.

## MedPeak's own look (src/toons)
- Outlines are a darker shade of each fill, thin (never navy, never black); big clean eyes; soft blush.
- Captions: one word, white on a navy rounded tag, key word in amber, slight tilt.
- Labels: teal pill tags with navy outline ("THROAT", "GUT").
- Our doctor: **Dr. Mira** (white coat over teal scrubs, curly dark hair, round glasses), full-body.
- Retention 7 still applies: unlike the reference channel, we change the picture at least every
  3 s (close-ups, reaction shots, thought bubbles).

## Pieces (v5)
| File | What |
|---|---|
| `src/toons/style.ts` | The one settings file: line, eyes, light, motion, colours |
| `src/toons/ink.tsx` | Drawing engine: `Part`, `Tube`, `Merge`, `Mark`, shapes, `lineOf`, thin-line scale context |
| `src/toons/rig.tsx` | Face (9 emotions), mitten `Hand` (5 poses), `Arm`, `Leg`, `Shoe`, `blinkAt` |
| `src/toons/blueprint.tsx` | `Blueprint`, `makeCharacter`, `checkBlueprint` (house rules checked in code) |
| `src/toons/characters.tsx` | 19 body characters as blueprints: stomach, intestine, liver, kidney, bladder, lungs, heart, brain, tooth, bone, pill, poop, red cell, white cell (guard cap), platelet (medic helmet), egg, sperm, virus, bacteria |
| `src/toons/humans.tsx` | Full-body people from `HumanSpec`: Dr. Mira, patient, mum, kid, grandpa, toddler |
| `src/toons/motion.ts` | `key`, `E`, `settle`, `speak` |
| `src/toons/stage.tsx` | `Slot`, `Stand`, `Hold`, `Camera` |
| `src/toons/scenes.tsx` | 9 sets: throat, gut, stomach, mouth, bloodstream, lungs, office (+ desk), bathroom, bedroom; `Label`, `WordCaption` |
| `src/toons/Preview.tsx` | `ToonCast`, `ToonSheet` (model sheet), `ToonBlueprint`, `ToonEmotions`, `ToonSets`, `ToonScenes`, `ToonActing` |
| `pipeline/toon-sheets.mjs` | Renders the cast board, the blueprint page and every model sheet into `out/toons/sheets/` |

See `toons-style.md` (look and research) and `toons-blueprint.md` (how to add a character).

## Roadmap
- Phase A (done 2026-11-16, v5): engine, rig, blueprint system, 19 body characters, 6 full-body people,
  9 sets, model sheets, acting toolkit.
- Phase B: cast voices (fixed ElevenLabs voice per character), lip-sync from word timing, one-time
  cartoon sound-effect library (quoted first), comedy music beds.
- Phase C: dialogue script format (speaker, line, emotion, action), Retention 7 adaptation, doctor
  lines fact-checked against sources, auto shot list (a new picture every 3 s).
- Phase D: 3 test Shorts, private upload, review. Phase E: daily rhythm.
