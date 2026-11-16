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


## Phase B: voices, lip-sync, sound and music (built 2026-11-16)
A Toon is one file, `videos/<slug>/toon.json`. The player (`src/toons/Player.tsx`, composition `Toon`)
turns it into the whole Short: staging, acting, lip-sync, camera cuts, captions, sound effects, music.

```json
{"slug": "pill-without-water", "title": "...", "music": "bouncy",
 "shots": [{"id": "A", "set": "throat",
   "cast": [{"who": "whitecell", "x": 350, "y": 700, "size": 720, "noLegs": true, "pose": "hips"}],
   "lines": [{"id": "A1", "who": "whitecell", "text": "Hey! You can't park here.",
              "emotion": "angry", "pose": "point", "key": "here", "sfx": "bonk", "react": {"pill": "scared"}}]}]}
```
- `set`: throat, gut, stomach, mouth, blood, lungs, office, bathroom, bedroom. People stand on the set's
  floor automatically; floating body characters need `y`.
- `emotion`: one of the 9 faces. `pose`: rest, wave, point, pointLeft, panic, fists, thumb, shrug, hips,
  belly, explain, think (`src/toons/poses.ts`). `key`: the caption word shown in amber. `react`: faces of
  the listeners. `sfx`: an effect from the library; without it the emotion picks one.
- The player does the rest: a shot opens wide, then cuts to whoever speaks, and long lines alternate
  wide and close so no picture stays longer than 2.6 s (Retention 7).

| File | What |
|---|---|
| `skill/medpeak-health/toons-cast.json` | The fixed voice of each of the 25 characters (ElevenLabs default voices, so every key has them), pitch in semitones, speed, and the acting settings per emotion |
| `pipeline/toon-voice.mjs` | One clip per line with word timing; ffmpeg shifts the pitch per character (speed unchanged, so timing stays valid). `--audition` makes one sample per character |
| `pipeline/toon-sfx.mjs` | The cartoon sound-effect library (38 effects), made once, kept in `assets/toons-sfx/` and committed |
| `pipeline/toon-music.mjs` | 4 comedy beds (bouncy, sneaky, panic, doctor), made once, kept in `assets/toons-music/` and committed |
| `pipeline/toon-render.mjs` | Renders the Short (`--draft`, `--stills`); works silent before the voice exists; masters to -14 LUFS |
| `src/toons/motion.ts` | `lipsync(words, t)`: the mouth opens on each spoken word and closes between words |

Order of work for a Toon: write `toon.json` -> `toon-render --stills` (free, silent check) ->
`toon-voice --dry-run` -> owner approves -> `toon-voice --approve --max-characters N` -> `toon-render`.

**Money rules.** Voices cost 1 credit a character. Sound effects and music have no firm published API
price, so those two scripts measure the real cost on the first item and stop if the projection passes
the approved cap (`--max-credits`). All three print the plan for free with `--dry-run` and refuse to
spend without `--approve`. The library and the beds are paid for once and never again.

## Roadmap
- Phase A (done 2026-11-16, v5): engine, rig, blueprint system, 19 body characters, 6 full-body people,
  9 sets, model sheets, acting toolkit.
- Phase B (code done 2026-11-16; voices, the effect library and the music beds wait for the owner's
  approval of the quoted credits): voice cast, lip-sync, script player, sound effects, music.
- Phase C: script rules for Toons (Retention 7 adapted to dialogue), doctor lines fact-checked against
  sources, a `toon-check` gate, more poses and props.
- Phase D: 3 test Shorts, private upload, review. Phase E: daily rhythm.
