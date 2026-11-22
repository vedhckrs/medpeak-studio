# MedPeak Toons: THE TARGET (engine v9, script format 6)

Written 2026-11-23 from `plans/engine-upgrade-2026-11-23/05-blueprint.md`, Part 1, after the owner approved all 28 decisions:
"All 28 recommend and start 2 to 3 agents to fix and upgrade engine and everything i want proper as per report". This is the
one page every new Toon is measured against. Keep it current: when the owner changes a number, change it here with the date
and his words, and in the check that measures it.

## In one paragraph

A Toon opens on a person for under a second, a real action and a sound hit, then dives (0.9 s, even) into the body. Inside,
the organ fills the frame **in its real place with its neighbours**, in one warm flesh family, with a small dry face high on
its wall. A real object comes in from the edge (a cigarette, a probe, a pill) and the organ **changes state** while the
camera holds: something slides in, a level fills, damage spreads, a black "3 DAYS LATER" card cuts in and the same framing
comes back changed. Characters argue in short fast lines, then stop and let the picture act. Only the mouth and eyes move
while someone talks; listeners look at the speaker. Near the end the patient asks "Doc, why...?" and Dr. Mira answers in one
calm, slower block that names the condition, the cause and one thing to do. A bright funk bed fills every pause and dips
under words. The card at the end is short. Nothing ever sits on a face, no text sits on text, and nothing pops.

## The numbers (the story only; the end card is left out)

"Ref" is the median of the 20 reference Shorts. "Pass" is what the checks demand; "Aim" what a video should hit. "beat" =
we set a stricter bar than the references. "Check" names what measures it (run `node --import tsx pipeline/toon-score.mjs
<slug>` for all of them at once; it writes `renders/scoreboard.jpg`).

| Area | Measure | Ref | Pass | Aim | Check |
|---|---|---|---|---|---|
| Place | Time inside the body | 72% | 60%+ | 70% | score (layout shot kinds), S8 |
| Place | Body/room switches | 1 | 3 or fewer | 2 | score, S8 |
| Place | Neighbour structures around the hero organ | 3+ | 3+ | 4 | stages report them (phase 3) |
| Place | Largest flat non-tissue field in a body shot | none | 12% or less | 8% | C7 |
| Colour | Body shots warm (red/pink/salmon/cream) | 67% | 60%+ | 65% | C7 |
| Colour | Any other colour family in a body shot | 0-2% | 8% or less | 5% | C7 |
| Colour | Room saturation / brightness | 0.17 / 180 | 0.22 or less / 165+ | 0.18 / 180 | C7 |
| Line | Outline on screen, every shot | 5 px (3-7) | 4-7 px | 5-6 px | C6 |
| Face | One organ eye, whole-organ frame | 115 px (90-190) | 110-190 px | 120-170 px | L9 |
| Cuts | Cuts a minute (time cards not counted) | 3.3 | 6 or fewer | 4 | C1 |
| Cuts | Median hold of one picture | 15.3 s | 6 s+ | 10 s | C1 |
| Cuts | Re-framings of the same place | 0 | 1 punch-in a video at most | 0-1 | C1, V1 |
| Motion | Picture still (caption band left out) | 89% | 78-94% | 85% | C2 |
| Motion | Seconds with visible action (over 1%) | 13% | 25% or less | 15-20% | C2 |
| Motion | Seconds with big action (over 3%) | 2% | 5% or less | 3% | C2 |
| Motion | Frames a minute with over 10% change | 8 | 40 or fewer | 20 | C2 |
| Motion | Picture pixels changing in over 5% of frames | 0.3-1% | 5% or less | 2% | C2 |
| Motion | Longest fully still stretch | 14.9 s | 4 s+ somewhere | 8 s | C2 |
| Motion | Not dead: every shot of 8 s+ has an action | - | every shot | - | C2 |
| Motion | One action, then a hold (big actions 1.5 s apart) | - | always | - | M2 |
| Motion | Screen shakes / white flashes / star bursts | 0 / 0 / 0 | 1 / 1 / 2 at most | 0 / 0 / 1 | C3, L7 |
| Motion | One-frame pops (outside cuts) | rare | 0 | **beat: 0** | C4, M4 |
| Motion | Zoom jumps | - | 6% a frame at most | - | C5, V2 |
| Script | Story length | 60 s | 50-60 s | 55 s | score |
| Script | Talk speed inside a sentence (body cast) | 3.2 w/s | 3.0-3.6 w/s | 3.3 | S6 |
| Script | Share of the story with someone talking | 0.88 | 0.80-0.93 | 0.88 | S5 |
| Script | Pauses of 0.5 s+ / of 1 s+ (a minute) | 4.4 / 2.5 | 3+ / 2+ | 4 / 3 | S5 |
| Script | First spoken word | 1.1 s | 0.3-1.2 s | 0.6 s | S1 |
| Script | Topic object named by | about 3 s | 3.0 s | 2.5 s | S1 |
| Script | Sourced facts in the story | 1-3 (in the answer) | 3 or fewer before the answer | 3 | S2 |
| Script | Numbers said aloud | 0 | 1 at most | 1 | S7 |
| Script | Reaction words (huh, whoa, ugh...) | 3.5 | 2+ (warn) | 3-4 | S7 |
| Script | Doctor's answer block | about 50 words, at 69% | 35-60 words, at 55-80% | 50 words at 68% | S4 |
| Script | Doctor slower than the body cast | 2.8 vs 3.2 w/s | 0.3 w/s slower | 0.4 slower | S6 |
| Voice | Sentences above 250 Hz (cartoon high) | 41% | 30-55% | 40% | A4 (`toon:listen --voices`) |
| Voice | Speakers in one scene, pitch apart | clear | 3+ semitones | 4+ | A4 |
| Sound | Music style | funk 154 BPM (14 of 20) | funk/playful, 130-165 BPM | 150 | A3 (music scan) |
| Sound | Music in pauses, under the voice | 2.7 dB | 4-8 dB | 6 dB | A1 |
| Sound | Music dip under words | 2.6 dB | 2-4 dB | 3 dB | A1 |
| Sound | Loudness / true peak / clipped samples | -9.4 LUFS, clips | -14 +-1 / -1.0 dBTP / 0 | **beat: -14, 0 clips** | A1, score |
| Sound | Loudness range | 5.9 LU | 4-8 LU | 6 | A1, score |
| Finish | Seconds after the last story word | 0-2 s | 6 s or less | 5 s | S9, score |
| Finish | Faces covered / text on text / half people at the edge | not measured | 0 / 0 / 0 | **beat: 0** | L1, L2, L6 |
| Finish | The caption on a face, an eye or a mouth | not measured | 0 | **beat: 0** | L3 |
| Finish | The watermark on a head or by the caption | - | 0 | 0 | L5 |
| Finish | Listeners look at the speaker (after the hook) | yes | 70%+ of each line | 100% | L10 |
| Finish | Frames a second | 30 (soft) | 60 | **beat: 60, sharp** | score |
| Acting | The face talks, the body holds | yes | speaker's body moves on 30% of the line at most, a listener's 10% | - | M1 |
| Acting | Limb jumps / pose flips | - | 0 | 0 | M3, M4 |

## Where we BEAT the references

Medical truth (every fact sourced, the condition named, one action, a care line); clean sound (-14 LUFS, no clipping); our
people (real hands and noses, a global cast, working eye-lines, the symptom shown); 60 fps with zero pops; a zero-defect
frame (nothing on a face, no text on text) proven by a check, not by eye; one channel look across videos; stories that do
not repeat; a shorter tail with our own brand card.

## The checks, by family (all free, all local, all on the FINAL render)

- **Picture** (`npm run toon:look -- <slug>`, `pipeline/lib/toon_picture.py`): C1 cuts, C2 stillness, M2 action then hold,
  C3 flash and shake, C4 one-frame pops, C5 zoom jumps, C6 line weight, C7 colour, C8 time cards.
- **Layout log** (`node --import tsx pipeline/toon-staging.mjs <slug>`; `toon-motion.mjs`; `toon-camera.mjs`): L1-L14,
  M1 and M3-M5, V1-V3, on `renders/layout.json` (what the v8 component tree drew, 30 times a second).
- **Script** (`node pipeline/toon-check.mjs <slug>`): S1-S12 under `"format": 6` (phase 5).
- **Sound** (`npm run toon:sound`, `npm run toon:listen`): A1-A5 (phase 5).
- **Scoreboard** (`node --import tsx pipeline/toon-score.mjs <slug>`): all of the above in one table and one 16:9 sheet.
  **It must say PASS before the owner sees a video.** Rows marked "not measured yet" come with later phases.

## Where we stood on 2026-11-23 (phase 1 scoreboard of the four newest videos)

`plans/engine-upgrade-2026-11-23/phase1-scoreboard.jpg`: creatine 9 rows pass / 35 fail, quit-sugar 15 / 28, fasting 11 / 32,
snake-bite 11 / 33 (4-5 rows not measured yet each). Every video fails the cut rate (16-24 a minute), the stillness, the
caption-on-faces and faces-covered checks: the faults the owner saw. Proof on the real frames: `phase1-proof-caught.jpg`.
