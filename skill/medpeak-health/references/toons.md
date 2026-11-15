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
- Outlines navy `#1d2b4f` (never black); round eyes with a teal glint; soft cheeks.
- Captions: one word, white on a navy rounded tag, key word in amber, slight tilt.
- Labels: teal pill tags with navy outline ("THROAT", "GUT").
- Our doctor: **Dr. Mira** (teal scrubs, curly dark hair, round glasses).
- Retention 7 still applies: unlike the reference channel, we change the picture at least every
  3 s (close-ups, reaction shots, thought bubbles).

## Pieces
| File | What |
|---|---|
| `src/toons/rig.tsx` | Face rig: 9 emotions (neutral, happy, angry, scared, smug, sick, sleepy, shocked, sad), eyelids, brows, talking mouth with teeth and tongue (`talk` 0-1), pupils (`look`), `blinkAt()`, noodle `Arm` with mitten hands |
| `src/toons/paint.tsx` | Cel shading (`Shaded`: shadow crescent bottom-right, light top-left, navy outline), `Shine`, `GroundShadow`, `Legs` with shoes and walk cycle, `shade()` colour maths |
| `src/toons/characters.tsx` | 18 body characters: pill, stomach, intestine, liver, kidney, bladder, poop, tooth, lung, brain, heart, red cell, white cell (security helmet), platelet, virus, bacteria, egg, sperm. Props: emotion, talk, blink, look, arms, squash, step, t, noLegs |
| `src/toons/humans.tsx` | 6 people: Dr. Mira (white coat over teal scrubs), patient, mum, kid, grandpa, baby. `full` adds legs |
| `src/toons/scenes.tsx` | 9 sets with depth, light pool, particles, vignette: throat, gut, stomach (acid pool), mouth, bloodstream, lungs, office, bathroom, bedroom; `Label`; `WordCaption` (pop-in) |
| `src/toons/Preview.tsx` | Boards: `ToonCast` (24), `ToonEmotions`, `ToonSets` (9), `ToonScenes` (18 s demo) |

## Roadmap
- Phase A (done 2026-11-16): rig, cel shading, 24 characters, 9 sets, caption style, preview boards.
- Phase B: cast voices (fixed ElevenLabs voice per character), lip-sync from word timing, one-time
  cartoon sound-effect library (quoted first), comedy music beds.
- Phase C: dialogue script format (speaker, line, emotion, action), Retention 7 adaptation, doctor
  lines fact-checked against sources, auto shot list (a new picture every 3 s).
- Phase D: 3 test Shorts, private upload, review. Phase E: daily rhythm.
