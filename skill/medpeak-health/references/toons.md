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
- **Volume paint**: every shape has a form gradient, a two-step shadow, a bounce light, a material
  texture and a gloss, inside a thin outline that is a darker shade of the fill (never navy or black).
- Big eyes with coloured, shaded irises; soft gradient blush.
- Organs drawn from real anatomy with their real parts (vessels, ducts, lobes, folds).
- Captions: one word, white on a navy rounded tag, key word in amber, slight tilt.
- Labels: teal pill tags ("THROAT", "GUT").
- Our doctor: **Dr. Mira** (white coat over teal scrubs, light skin, curly dark hair, round glasses), full-body.
  Her look is the owner's pick of 2026-11-17 for a worldwide audience (`toons-boards/doctor-options.jpg`, look A);
  the first three videos show her earlier look. Do not change it again without the owner.
- Sets are layers that live; the camera has shot sizes, lenses and moves (`toons-camera.md`).
- Retention 7 still applies: unlike the reference channel, we change the picture at least every
  2.6 s (the director does it on its own).

## Pieces (v6)
| File | What |
|---|---|
| `src/toons/style.ts` | The one settings file: line, eyes, light, texture, motion, colours |
| `src/toons/ink.tsx` | Paint engine: `Part` (volume paint + materials), `Tube`, `Merge`, `Groove`, `Vein`, `Cast`, `shade`, `lift`, shapes |
| `src/toons/rig.tsx` | Face (9 emotions, coloured iris, head turn), `Hand` (palm, four fingers, thumb; 5 poses), `Arm`, `Leg`, `Shoe`, `blinkAt` |
| `src/toons/blueprint.tsx` | `Blueprint`, `makeCharacter`, `checkBlueprint`, `Act` (body acting) |
| `src/toons/characters.tsx` | 19 body characters as blueprints, each with its anatomy |
| `src/toons/humans.tsx` | Full-body people on a skeleton from `HumanSpec`: Dr. Mira, patient, mum, kid, grandpa, toddler |
| `src/toons/poses.ts` | 17 named arm poses for scripts |
| `src/toons/motion.ts` | `key`, `E`, `settle`, `lipsync` |
| `src/toons/camera.tsx` | `Camera`, `Layer` (parallax + depth of field), `LENSES`, `SHOTS`, `MOVES` |
| `src/toons/scenes.tsx` | 9 living, layered sets + foregrounds (`SETS`, `FORES`, `SET_LIFE`), `WordCaption` |
| `src/toons/director.ts` | The script format and the shot list, with no React: the player and the gate share it |
| `src/toons/props.tsx` | 8 props a script can show (glass, pill bottle, soda, lollipop, toothbrush, burger, pillow, clock) |
| `src/toons/Player.tsx` | Plays a `toon.json`: camera, acting, props, captions, sound |
| `pipeline/toon-check.mjs` | The script gate: valid script, Retention 7, format, sources (`--sheet`, `--check-urls`) |
| `pipeline/toon-camera.mjs` | The camera check: every frame measured for jolts, jump cuts and wrong pictures (`npm run toon:camera`) |
| `src/toons/Preview.tsx` | Boards: `ToonCast`, `ToonSheet`, `ToonBlueprint`, `ToonCamera`, `ToonSets`, `ToonEmotions` |
| `pipeline/toon-sheets.mjs` | Renders every board and model sheet into `out/toons/sheets/` |

See `toons-style.md` (look and research), `toons-blueprint.md` (how to add a character),
`toons-camera.md` (shots, lenses, moves) and `toons-script.md` (how to write and check a script).

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
- `emotion`: one of the 9 faces. `pose`: one of the 17 in `src/toons/poses.ts`. `key`: the caption word
  shown in amber. `react`: faces of the listeners. `sfx`: an effect from the library; without it the
  emotion picks one. `cam`: optional camera for the line, e.g. `"cu 85 push"` (`toons-camera.md`).
  On an actor, `enter`: walk, drop or pop.
- The player does the rest: the director picks shot, lens and move for every stretch of every line
  (never one picture longer than 2.6 s), and the actors gesture, nod, lean and react on their own.

| File | What |
|---|---|
| `skill/medpeak-health/toons-cast.json` | The fixed voice of each of the 25 characters (ElevenLabs default voices, so every key has them), pitch in semitones, speed, and the acting settings per emotion |
| `pipeline/toon-voice.mjs` | One clip per line with word timing; ffmpeg shifts the pitch per character (speed unchanged, so timing stays valid). `--audition` makes one sample per character |
| `pipeline/toon-sfx.mjs` | The cartoon sound-effect library (38 effects), made once, kept in `assets/toons-sfx/` and committed |
| `pipeline/toon-music.mjs` | 4 comedy beds (bouncy, sneaky, panic, doctor), made once, kept in `assets/toons-music/` and committed |
| `pipeline/toon-render.mjs` | Renders the Short (`--draft`, `--stills`); works silent before the voice exists; masters to -14 LUFS |
| `src/toons/motion.ts` | `lipsync(words, t)`: the mouth opens on each spoken word and closes between words |

Order of work for a Toon: research -> write `toon.json` -> `toon-check --sheet --check-urls` ->
`toon-render --draft --silent` (free preview) -> `toon-voice --dry-run` -> owner approves ->
`toon-voice --approve --max-characters N` -> `toon-check` again (real timing) -> `toon-render`.

**Money rules.** Every paid script prints its plan for free with `--dry-run` and refuses to spend
without `--approve` and a cap. Prices measured on 2026-11-16 (the owner approved 4,900, the real total
was 2,314):

| What | Price | Paid once? |
|---|---|---|
| Voices | 6 lines, 284 characters: about 112 credits by the balance (budget 1 credit a character) | per video |
| Sound effects | 10 credits a second: the 38-effect library was 327 | yes, done |
| Music beds | 12.5 credits a second: 4 beds (150 s) were 1,875 | yes, done |

- The balance counter lags by a few minutes. Sound-effect responses report their own cost
  (`character-cost` header); music responses do not, so the music script waits for the balance.
- Now and then a very short effect comes back silent; the script hears that and asks again.
- A new effect or bed: add it to `LIBRARY` / `BEDS`, quote it, run the script (only missing items are made).

**Mix (set in the player and `pipeline/lib/toon-audio.mjs`).** Every voice line is levelled to -17 LUFS
(by loudness, not by peak: peak levelling left lines 8 dB apart). Effects peak at -3 dB but never
average above -21 dB, so a click and a trombone feel equal. Music beds are stored at -20 LUFS and
play about 9 dB under the voice, a little higher in the gaps. The render is mastered to -14 LUFS.
`--remix` on `toon-voice` and `toon-sfx` applies level changes again for free from the raw downloads.

## Steady style and stages (pilot, 2026-11-16)
After measuring 20 top Shorts frame by frame (toons-reference-study.md) the pill script was
rebuilt as a pilot: locked camera, the food pipe as a cutaway stage with its own face, the pill
falling in, sticking, melting and leaving a sore, a time card, the patient at home, Dr. Mira with
thought-bubble graphics, and the same stage again with water. New pieces: `src/toons/stages.tsx`
(stages and their dials), `events` / `state` / `card` / `"camera": "steady"` in toon.json
(toons-script.md), the props `tag`, `chip`, `pain`, `pipe`, and the stage board
(`node pipeline/toon-sheets.mjs --boards` -> toons-boards/stage.jpg). The owner approved the
pilot and the rebuilt arms, and the other two scripts were converted the same day with two new
stages: `tooth` (a molar cut open: sugar, germs, acid, a hole, spit, a brush, fluoride) and `tummy`
(the stomach cut open; it tips over when he lies down and the acid stays level).

## Legs, the boy's cap and rooms of their own (2026-11-16)
The owner's notes on the three previews: "each character's legs jump", "boy hat not good", "each
video a different background of clinic and a different background of home, unique". Done the same
day: people's legs rebuilt with a set knee bend (toons-blueprint.md), a per-frame body motion
check (`npm run toon:motion`), the cap redrawn with two more choices on a sheet
(toons-boards/caps.jpg), and a room kit that builds a different clinic and home for every video
from a recipe, with a gate that refuses a room another video already has (toons-rooms.md).

## Roadmap
- Phase A (v6, 2026-11-16, after the owner's review of the first voiced scene): volume paint and
  materials, all 25 characters redrawn with real structure, people on a skeleton with body acting,
  9 living layered sets, camera with lenses, new model sheets.
- Phase B (done 2026-11-16): voice cast, lip-sync, script player, the 38-effect library, 4 music beds,
  and a fully voiced and mixed test scene (`videos/pill-without-water`). Open: the owner's review of the
  voices by ear; 21 of the 25 voices have not been heard yet (`toon-voice --audition`, about 1,550 credits).
- Phase C (done 2026-11-16): script rules (`toons-script.md`), the `toon-check` gate (Retention 7 in
  dialogue, format, sources), props, 17 poses, and the first three researched scripts with silent
  previews. Voices for the three wait for the owner's approval.
- Phase D: 3 test Shorts, private upload, review. Phase E: daily rhythm.
