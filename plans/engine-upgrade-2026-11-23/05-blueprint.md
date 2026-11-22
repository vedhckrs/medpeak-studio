# Engine upgrade study 5 of 5: THE BLUEPRINT (engine v9, script format 6)

Date: 2026-11-23. Study and writing only: no code changed, nothing committed, no money spent.
Written for the next agent (a coding agent) and for the owner. It merges the four studies:
`01-visuals.md` (agent 1), `02-camera-motion.md` (agent 2), `03-script-voice.md` (agent 3), `04-details.md` (agent 4).
"A1 #3" below means agent 1, finding 3. Sheets are in `plans/engine-upgrade-2026-11-23/agent<N>-sheets/`.

---

## Owner summary (read this first)

1. Our drawing (line, eyes, people) is already close to the 20 reference Shorts. The gap is **what we show and how long we hold it**.
2. They tell **one small story in one or two body places**, hold a picture about 15 s, cut about 3 times a minute, and pause.
3. We give **a fact per line**, so we need a new place per fact: we cut 16-25 times a minute, talk without a break and shake the frame every 3 s.
4. Our checks passed all of this because **they read the script file and the OLD engine, not the drawn picture**. That is the main bug.
5. The rebuild: organ "stages" that hold 20 s and change state, a fixed kit (line, eyes, gaze, hands, blink), checks that measure the real render, a one-story script, a fuller mix.
6. Where we **beat** them: sourced medicine, clean -14 LUFS sound, 60 fps, better people, zero pops, nothing ever on a face.
7. **28 decisions need your word before building** (Part 3). Most are "yes"; five need a sheet or a sound sample first.
8. Seven phases, each ends in something you can look at or hear; then the pilot, **#7 "What Happens When You Quit Smoking"**.
9. Rough effort: about 12 working days of the coding agent, plus about 1,000-1,300 ElevenLabs credits for the pilot (quoted before spending).
10. Nothing you rejected comes back: all code-drawn, look v8, one kit, no mirroring, hard cuts, unique rooms, no AI art.

---

## Part 1. The target: what a MedPeak Toon is after the rebuild

**In one paragraph.** A Toon opens on a person for under a second, a real action and a sound hit, then dives (0.9 s, even) into
the body. Inside, the organ fills the frame **in its real place with its neighbours**, in one warm flesh family, with a
small dry face high on its wall. A real object comes in from the edge (a cigarette, a probe, a pill) and the organ **changes
state** while the camera holds: something slides in, a level fills, damage spreads, a black "3 DAYS LATER" card cuts in and
the same framing comes back changed. Characters argue in short fast lines, then stop and let the picture act. Only the mouth
and eyes move while someone talks; listeners look at the speaker. Near the end the patient asks "Doc, why...?" and Dr. Mira
answers in one calm, slower block that names the condition, the cause and one thing to do. A bright funk bed fills every
pause and dips under words. The card at the end is short. Nothing ever sits on a face, no text sits on text, and nothing pops.

### The numbers (story only, end card left out)

"Ref" is the median of the 20 references (A1 Part A, A2 Part A, A3 Part A). "Pass" is what the new checks demand.
"Aim" is what the pilot should hit. Where the last column says **beat**, we set a stricter bar than the references.

| Area | Measure | Ref | Ours now (4 videos) | Pass | Aim / beat |
|---|---|---|---|---|---|
| Place | Time inside the body | 72% | 29-63% | 60%+ | 70% |
| Place | Body/room switches | 1 | 4-9 | 3 or fewer | 2 |
| Place | Neighbour structures around the hero organ | 3+ | 0-2 | 3+ | 4 |
| Place | Largest flat non-tissue field in a body shot | none | up to 40% | 12% or less | 8% |
| Colour | Body shots warm (red/pink/salmon/cream) | 67% | 48-55% | 60%+ | 65% |
| Colour | Any other colour family in a body shot | 0-2% | up to 25% | 8% or less | 5% |
| Colour | Room saturation / brightness | 0.17 / 180 | 0.29-0.36 / 128-171 | 0.22 or less / 165+ | 0.18 / 180 |
| Line | Outline on screen, every shot | 5 px (3-7) | 5-12 px | 4-7 px in every shot | 5-6 px |
| Face | One organ eye, whole-organ frame | 115 px (90-190) | 150-270 px | 110-190 px | 120-170 px |
| Cuts | Cuts a minute (time cards not counted) | 3.3 | 16-25 | 6 or fewer | 4 |
| Cuts | Median hold of one picture | 15.3 s | 1.9-3.1 s | 6 s+ | 10 s |
| Cuts | Re-framings of the same place | 0 (1 in 20 videos) | 5-6 a video | 1 punch-in a video at most | 0-1 |
| Motion | Picture still (caption band left out) | 89% | 33-64% | 78-94% | 85% |
| Motion | Seconds with visible action (over 1%) | 13% | 44-78% | 25% or less | 15-20% |
| Motion | Seconds with big action (over 3%) | 2% | 12-41% | 5% or less | 3% |
| Motion | Frames a minute with over 10% change | 8 | 79-214 | 40 or fewer | 20 |
| Motion | Picture pixels changing in over 5% of frames | 0.3-1% | 8-54% | 5% or less | 2% |
| Motion | Longest fully still stretch | 14.9 s | 1.1-2.7 s | 4 s+ somewhere | 8 s |
| Motion | Screen shakes / white flashes / star bursts | 0 / 0 / 0 | 2 / 5-16 / 8-9 | 1 / 1 / 2 at most | 0 / 0 / 1 |
| Motion | One-frame pops (outside cuts) | rare | 13 candidates, 1 real | 0 | **beat: 0** |
| Script | Story length | 60 s | 48-49 s | 50-60 s | 55 s |
| Script | Words / talk speed inside a sentence | 158 / 3.2 w/s | 117-128 / 2.6-2.8 | 3.0-3.6 w/s (body) | 3.3 |
| Script | Share of story with someone talking | 0.88 | 0.99-1.00 | 0.80-0.93 | 0.88 |
| Script | Pauses of 0.5 s+ / of 1 s+ | 4.4 a min / 2.5 | 0 / 0 | 3+ / 2+ | 4 / 3 |
| Script | First spoken word | 1.1 s | 0.0 s | 0.3-1.2 s | 0.6 s |
| Script | Topic object named by | about 3 s | 0-2 s | 3.0 s | 2.5 s |
| Script | Sourced facts in the story | about 1-3 (all in the answer) | 6-10 | 3 or fewer before the answer | 3 |
| Script | Numbers said aloud | 0 | 2-6 | 1 at most | 1 |
| Script | Reaction words (huh, whoa, ugh...) | 3.5 | 0-3 | 2+ (warn) | 3-4 |
| Script | Doctor's answer block | about 50 words, at 69% | 0-2 short lines | 35-60 words, at 55-80% | 50 words at 68% |
| Script | Doctor slower than the body cast | 2.8 vs 3.2 w/s | n/a | 0.3 w/s slower | 0.4 slower |
| Voice | Sentences above 250 Hz (cartoon high) | 41% | 0-38% | 30-55% | 40% |
| Voice | Speakers in one scene, pitch apart | clear | 2 semitones (fasting) | 3+ semitones | 4+ |
| Sound | Music style | funk 154 BPM (14 of 20) | 4 styles, 69-112 BPM | funk/playful, 130-165 BPM | 150 |
| Sound | Music in pauses, under the voice | 2.7 dB | 11-13.5 dB | 4-8 dB | 6 dB |
| Sound | Music dip under words | 2.6 dB | 1.3 dB | 2-4 dB | 3 dB |
| Sound | Loudness / true peak / clipped samples | -9.4 LUFS, clips (ref 01: 90 places) | -14.0 / -0.9 dBTP / 0 | -14 +-1 / -1.0 dBTP / 0 | **beat: -14, 0 clips** |
| Sound | Loudness range | 5.9 LU | 2.0-5.9 | 4-8 LU | 6 |
| Finish | Seconds after the last story word | 0-2 s | 13.3-17.4 s | 6 s or less (decision 25) | 5 s |
| Finish | Faces covered / text on text / half people at the edge | not measured | several a video | 0 / 0 / 0 | **beat: 0** |
| Finish | Frames a second | 30 (soft) | 60 | 60 | **beat: 60, sharp** |

### Where we aim to BEAT them (details in Part 8)

Medical accuracy (every fact sourced, the condition named, a care line), clean audio (no clipping, -14 LUFS), our people rig
(real hands, noses, a global cast) with working eye-lines, 60 fps with zero pops, and a zero-defect finish (nothing on a face,
no text on text) proven by a check, not by eye.

---

## Part 2. Root causes (few, deep)

The four studies found about 60 separate problems. Almost all come from seven causes. Fix the cause, and the class of
problems goes with it (the owner's rule: "fix the class, not the instance").

| # | Root cause | What it produces (agent findings) | The fix in one line |
|---|---|---|---|
| R1 | **The script is a list of facts, one per line** (6-10 sourced facts, 5-6 speakers, every line sourced or chat, no pauses) | One place per fact, so 16-25 cuts a minute and 4-9 body/room switches (A2 #1, A1 #7); numbers said and shown as plates, gauges and clocks (A1 #3, A3 #6); wall-to-wall talk with no room for an action or a sound (A3 #4, #9); a doctor with no payoff (A3 #3) | Format 6: one story, a fact budget of 3, an answer block, real pauses (Part 4, `toon-rules.mjs`) |
| R2 | **The checks measure the plan, not the picture.** `toon:camera`, `toon:motion` and `toon:staging` import the OLD engine (`src/toons/Player.tsx`, `rooms.tsx`, `stages.tsx`: see `pipeline/lib/toon-camera.mjs` line 13, `toon-motion.mjs` line 16, `toon-staging.mjs` lines 27-29) and read `toon.json`; v8 shots place almost everything in code. `toon_look.py` measures the whole frame, caption included, against loose bands (still 45-80%) | `toon:staging` "ALL PASS" with 1 graphic found per video (A4 intro); caption on eyes, bursts and cubes on faces, watermark on heads, half people at the edge (A4 O6, P2, C4, H4); restless videos pass the look check (A2 intro) | A **layout log** filled by the real component tree, and **picture checks** on the final MP4 (Part 5) |
| R3 | **Every video is hand-built, shot by shot, with typed coordinates** (`creatine.tsx` 640 lines, `quit-sugar.tsx` 532, `fasting.tsx` 454...). There is no reusable organ place that can hold 20 s; each video invents its own flat-colour backdrop, its own framings per line (`byLine`), its own copy of the dive | Flat orange/teal/lilac fields (A1 #1, #2: `PLACE` in `fast-art.tsx`); re-frames in and back out (A2 #1); the dive copied twice and too fast (A2 #7); sameness across videos and drift between them | **Anatomy stages** with state dials and entry slots in `anatomy.tsx`; one framing per shot; shared `Dive` (Part 4) |
| R4 | **Motion by default instead of by event.** The gate demands "never still 2 s", "a change every 3 s", "a new view every 6 s"; the player shakes the frame on every flash; flows run all the time; characters sway while talking; poses switch on thresholds | Picture still 33-64% vs 89%; 37-54% of pixels always changing (A2 #2, sheet `agent2-sheets/01-motion-heatmaps.jpg`); 5-16 flashes a video (A2 #5); one-frame limb pops (A4 M1, `crea-cast.tsx` line 165) | Hold, then one action, then hold: `enter/fill/reveal`, `still()`, rare local effects, hysteresis (Part 4) |
| R5 | **Small gaps in the shared kit, repeated on every character** | Line grows with camera zoom (the camera is a CSS `scale()` on a `div`, which `vector-effect: non-scaling-stroke` does not undo; A1 #6, A2 #8); arm line in figure units, half the body line (A4 O4); pupils stuck in the middle half of the eye (`look * r * 0.5`, A4 O2); default gaze straight ahead (`people-rig.tsx` line 1340, A4 H1); a 3-frame blink with no half lid (A4 O3); the splayed "relaxed" rest hand (A4 H2); gloss streaks on several characters (A4 D-3) | Fix each once in `kit.tsx` / `play.tsx` / `people-rig.tsx`: every character improves together, which also keeps the cast consistent |
| R6 | **The sound was built for no pauses** (`GAP` 0.14 s, a bed 11-13 dB under the voice, "the bed never goes quiet", any music style) | No beat for a sound or a laugh; effects "lost under the voice" (A3 #9); a quiet carpet of mixed styles (A3 #8) | Pauses in the script, a fuller funk bed that dips under words, planned stops, sounds in the beats |
| R7 | **The rules grew one complaint at a time, and some now contradict each other and the reference.** "Inside the body means microscopic" vs "the whole organ like the reference"; "one colour per place" vs one warm family; "never still 2 s" vs holding 15 s; `toons-camera.md` still describes the old director (lenses, blur, whips); `scene.tsx` `CAPTION_BAND` still says y 1380-1560 while the caption is at 1374 | Every new video re-interprets the rules; a check can pass a rule the owner has since changed | One target spec (Part 1), the owner's decisions (Part 3), format 6 in the gate, and the skill rewritten in one pass (Part 6) |

---

## Part 3. Owner decisions needed BEFORE building

Each item quotes the standing rule it would change, word for word, from `CLAUDE.md` or the skill. Please answer by number,
for example "1 yes, 2 no, 10 show me first". Items marked **(sheet first)** or **(listen first)** are answered after you see
or hear one test; the build of that item waits for it.

### Story and script

**1. One story, at most 3 facts in it.**
- Rule now (`toons-script.md`, format 3): "Every line names its source or is marked "chat": true: with no doctor to carry the facts, the body characters do."
- Proposal: keep "every fact has a source", but a script has one question and one answer, at most **3 sourced facts** in the
  whole story, at least 2 of them in the answer. Extra facts go to the description. At most 4 speaking characters plus the
  doctor; each speaks 3 lines or more.
- Evidence: refs carry one condition, one cause, one fix; we carry 6-10 facts (creatine 10 in 49 s) and that is what forces
  the cuts (A3 #2, A2 #1).
- Recommendation: **yes**. Everything else in this rebuild rests on it.

**2. A doctor in most videos.**
- Rule now (`toons-script.md`, format 3): "Only the rooms the story needs: no clinic and no doctor unless the shape is `visit`."
  and your word of 2026-11-17: "Dr. Mira only in some shapes, as the plan says now."
- Proposal: `visit` (one doctor's-room scene near the end, the patient asks, Dr. Mira answers) becomes the usual shape, about
  7 videos in 10; `fight`, `clock`, `crew` stay for the rest, where the wisest body character gives the answer.
- Evidence: 14 of 20 refs cut to the doctor at a median 69% of the story; the answer is the payoff the viewer waited for (A3 #3).
- Recommendation: **yes**. Dr. Mira stays our own doctor; she only speaks slower and calmer than the cast.

**3. The hook line is said inside the story, not to the viewer.**
- Rule now (`toons-script.md`, format 2 hook): "says "you" or "your" and names a consequence;" and "says at least two of the
  title's words in the first line".
- Proposal: a new hook kind `story`: the first line is a character's reaction or demand about the intruder or the damage; the
  topic object is named by 3.0 s (not necessarily in line 1); a character asks the story question by 6 s; the picture and a
  sound hit come first (0.4-1.0 s lead). "You" only between characters. The three hook choices on the script sheet stay;
  one of them may be your current "to the viewer" kind.
- Evidence: 0 of 20 refs address the viewer; first word at 1.1 s; topic named at 1.6-3.5 s (A3 #1).
- Recommendation: **yes**, offered as one of the three choices on the next two scripts; then keep whichever retains better.

**4. Retention 7, read for Toons.**
- Rule now (`retention-7.md` / `toons-script.md`): point 2 "Promise: a line that starts by 8 s and promises the payoff.";
  point 4 "3-sec change"; point 7 "Loop: the last line shares at least 3 key words with the first."
- Proposal: point 2 is met by the character's story question; point 4 becomes "one action, then a hold" (Part 5 checks M2,
  P2); point 7 may also be met by ending on the person's own question or mid-line (refs 11, 15, 20).
- Evidence: no reference has a promise line or a word loop; agent 3 Part C.
- Recommendation: **yes** for Toons only; the long videos keep Retention 7 as written.

**5. Faster lines and real pauses.**
- Rule now (`SKILL.md`, files list): "`toons-cast.json` - the fixed voice of every Toons character. A character never changes voice between videos".
- Proposal: same voices, faster delivery: body characters speed 1.12-1.2 (or a free per-line `tempo` up to 1.15 on clips we
  already own), people 1.05-1.1, Dr. Mira 0.92-0.95. Air between lines 0.22 s (was 0.14), 0.5-0.8 s after a shock, 0.6 s
  before the answer, 2-3 silent beats of 1-2.5 s on picture actions. No "..." inside a line.
- Evidence: refs 3.2 words/s and 4.4 pauses a minute; ours 2.6-2.8 and none (A3 #4, #5).
- Recommendation: **yes**. The voice (who it is) does not change; only the pace.

### Picture

**6. Inside the body: the organ in its real place is the default; micro places only for cells, blood and germs.**
- Rule now (`CLAUDE.md`): "**Inside the body means microscopic**: among cells, with foreground, middle and background planes for depth. Not a far-away diagram of an organ."
- Proposal: rewrite it as "Inside the body means INSIDE the region: the organ fills the frame with its real neighbours around
  it (an anatomy stage); go to the micro scale only for cells, blood and germs, still in depth planes."
- Evidence: your own rule of 2026-11-22 ("full view of organs like ref video") already moves this way; 15 of 20 refs stay at
  organ scale (A1 #1, Part F; sheet `agent1-sheets/01-hero-stomach-ref20-vs-fasting.jpg`).
- Recommendation: **yes**.

**7. One warm colour family inside the body; pale, quiet rooms.**
- Rule now (`toons-known-issues.md`, 2026-11-22 checklist): "one colour per place (`place` prop), quiet tone-on-tone backgrounds".
- Proposal: no per-place flat colours (orange stomach, teal liver, lilac brain go). Body shots 60%+ warm flesh tones, any
  other colour family 8% or less (it is kept for the intruder, so it pops). Rooms in a pale palette (saturation 0.22 or less,
  brightness 165+), clothes clearly apart from the wall. Rooms stay unique per video (your rule): only their colours get paler.
- Evidence: refs 67% warm, rooms 0.17 saturation; fasting 25% blue + 18% purple, snake-bite 22% green (A1 #2, sheets 01-04).
- Recommendation: **yes**.

**8. Three small soft exceptions to "no gradients, no blur".**
- Rule now (`toons-v8-style.md`, rule 2): "Nothing else: no gradients, no gloss streaks, no glow, no texture, no drop shadows, no blur."
- Proposal: allow exactly three, nothing more: (a) see-through liquid (one flat colour at 55-65% opacity with a few white
  wave lines); (b) soft redness of a swelling; (c) one far-background soft layer behind a tissue wall (a faint blur of pale
  vessels). Plus a flat 25% contact shadow under every character standing on a floor (flat, not blurred). Gloss streaks stay
  banned; one short pale highlight line per organ is the only shine.
- Evidence: refs use exactly these three, sparingly (refs 01, 09, 10, 11, 13, 20; A1 #3, #9).
- Recommendation: **yes**, shown on the stage sheets of phase 3 before it is used in a video.

**9. The story is drawn ON the organ: no gauges, meters or clocks inside the body; one number plate a video.**
- Rules now (`toons-script.md`, format 5): "Text on the picture is for a number" and (`toons-known-issues.md` checklist) "a big
  physical metaphor per idea (a gauge to EMPTY with an alarm, a furnace)".
- Proposal: the organ shows its state itself (contents, liquid level, a cut window, sores, dark patches). Clocks only as real
  objects in a room. At most **one** number plate in a video (the answer's one number), and at most 2 text elements on screen
  besides the caption and the watermark.
- Evidence: refs carry no numbers on the picture; fasting 20 s had four texts at once (A1 #3, #11).
- Recommendation: **yes**.

**10. Organ eyes: slightly oval, a slight turn, pupils that reach the rim, 120-170 px.** **(sheet first)**
- Rules now (`toons-v8-style.md`, rule 3): "Two big white round eyes that touch or almost touch, a small black pupil" and
  (`CLAUDE.md`) "its face on its own wall (eyes about 170 px)".
- Proposal: still one eye for the whole cast, but upright ovals (1.12 times taller than wide), the far eye 8-12% smaller on
  a turned face (a three-quarter look, not a mirror), pupils 0.18 of the eye that can touch the rim. In a whole-organ frame
  one eye is 120-170 px (never over 190); face above y 800. Organs lose the teeth-grid "grit" mouth.
- Evidence: refs 90-120 px, ovals, pupils pressed to the rim toward the other character (A1 #5, A4 O1, O2; sheet
  `agent4-sheets/01-organ-eyes-ref-vs-ours.jpg`). Fasting's 270 px eyes read as an emoji.
- Recommendation: **yes after one before/after sheet of the full cast**.

**11. Characters look at each other; only the hook looks into the lens.**
- Rule now (`CLAUDE.md`): "**The hook opens on the person and comes at the lens**".
- Proposal: the hook keeps coming at the lens. After the hook, the listener looks at the speaker and the speaker at the
  listener (pupils pushed 0.8 of the way to the rim), for people and body characters alike.
- Evidence: every ref two-shot does this; ours stare at the camera (A4 H1, sheet `agent4-sheets/02-eyeline-two-shots.jpg`).
- Recommendation: **yes**.

**12. Two-person room shots framed tighter.**
- Rule now (`toons-v8-style.md`, scene rules): "People stand with feet near y 1740."
- Proposal: in a two-person shot a head is at least 190 px wide; crop at the knees is fine (`PEOPLE_SCALE` 3.2 becomes about
  4.0 for two-shots). People stay 4-4.5 heads tall (our rig is better than theirs; nothing about the drawing changes).
- Evidence: refs' heads 190-220 px in two-shots, ours about 150 px (A1 #12).
- Recommendation: **yes**.

**13. Job characters may be little people in uniform; a band label counts as their name tag.**
- Rules now (`toons-v8-style.md`, rule 6): "Cells, chemicals, medicines and germs are small simple bodies whose SHAPE says what
  they are ... with ONE costume piece or ONE held prop" and (`CLAUDE.md`) "non-human characters get a name tag held **2.5 seconds**".
- Proposal: add a mini-worker rig (two heads tall, kit eyes, small real hands, a uniform and one prop: guard, cleaner,
  firefighter, courier, builder). Chemicals may wear their name on a paper band round the body (`BandLabel`); a character
  that wears its name gets no extra tag. Everyone else keeps the 2.5 s tag.
- Evidence: refs' guard and band-labelled hormones (A1 #10; A4 T2: the doubled "BATTERY (ATP)" tag).
- Recommendation: **yes** (the pilot's cilia are a cleaner crew).

**14. The patient shows the symptom on his body.**
- Rule now: none written; it is a new kind of picture for the channel.
- Proposal: a `mark` on the people rig (two fang dots with a red ring, a red cheek, a sore, a bandage), drawn in the kit line,
  no blood; clothes that show the spot. Visible in every patient shot after it happens.
- Evidence: refs always show it (A4 H6; sheet `agent4-sheets/15-snake-no-bite-mark.jpg`).
- Recommendation: **yes**, mild and medical.

**15. Dad's stubble.** **(sheet first)**
- Rule now (`toons-v8-style.md`, cast): "Dad | man, tan skin, short black hair, light stubble, blue shirt, charcoal trousers".
- Proposal: either drop the stubble, or redraw it as a soft jaw band that follows the jaw and breaks into short dashes at the
  cheek (5% darker at most, never on the upper lip).
- Evidence: the flat band reads as a mask or a second chin on the quit-sugar cover (A4 H3, sheet `agent4-sheets/04-stubble-band-and-long-arms.jpg`).
- Recommendation: **show both on one sheet**; Dad is likely the pilot's patient.

### Camera and motion

**16. A cut budget, one framing per body shot, no creeping dive inside the body.**
- Rules now (`CLAUDE.md`): "The camera moves smoothly (one eased move per shot, a continuous dive inside the body)";
  (`toons-v8-style.md`, Version 4): "Inside the body: a continuous dive from the first frame to the last";
  (`toons-script.md`, format 4): "every video has **2 to 3 macro close-ups**" and "View changes: a new picture ... every 6 s or
  less on average, none held over 7.5 s"; (format 5): "Never still. No stretch over 2 s without a cut, a camera move, a stage
  event or a new thing."
- Proposal: a locked camera; one framing for the whole of a body shot; at most **6 cuts a minute** (aim 4, time cards not
  counted); median hold 6 s or more; a body place held 8 s or more before cutting away; at most **one punch-in a video**
  (2x or more, held 3 s+, never followed by the reverse). Macros stop being required; a macro is just one possible place.
  What keeps the eye is something entering the held frame (decision 4).
- Evidence: refs cut 3.3 times a minute and never re-frame; our "1.5x re-frames" still read as "camera jump" (A2 #1,
  sheets `agent2-sheets/04-every-reference-cut.jpg`, `05/06/07-our-cuts-*.jpg`).
- Recommendation: **yes**.

**17. New look-check bands (measured on the picture, the caption left out).**
- Rule now (`CLAUDE.md`): "**The look check must pass before the owner sees a video** ... still frames 45-80%, small movement 15-55%, bold outlines, brightness."
- Proposal: keep "must pass before you see it"; replace the bands with the Part 5 picture checks: picture still 78-94%,
  visible-action seconds 25% or less, big action 5% or less, 40 or fewer big-change frames a minute, a 4 s fully still stretch,
  and a **"not dead" rule**: every shot of 8 s or more has at least one action.
- Evidence: whole-frame numbers looked close (52-60% vs 60%) because the caption counted as motion; on the picture we are at
  61-64% vs 89% (A2 intro, #2).
- Recommendation: **yes**. The "not dead" rule is there because you told us twice that bodies looked flat (2026-11-17) and
  the animation weak (2026-11-21): still is not the same as dead.

**18. Far fewer impacts.** **(sheet first: one before/after slice)**
- Rules now (`toons-script.md`, format 5): "Impacts take "fx": "flash" on their event." and the impact kit you approved on the
  creatine review (bursts, shakes, speed lines; memory of 2026-11-21).
- Proposal: no automatic shake (today every flash shakes the frame 9 px); at most 1 flash, 1 shake (12 px, 0.25 s) and 2 bursts
  a video, never on or near a face; a new **fight cloud** (white boiling cloud, 1-2 s) and small face marks (sweat, a bump).
- Evidence: refs 0 shakes, 0 flashes, 0 bursts; ours one flash every 3 s (A2 #5, sheet `agent2-sheets/10-our-big-actions.jpg`).
- Recommendation: **yes after a 10 s before/after slice**.

**19. "Flow never stops" becomes a few particles in a band.**
- Rule now (`toons-look.md`): "**Flow never stops:** blood in a vessel streams all the time (a thin dashed line moving along it),
  a little faster on each beat. A flow that stops between beats reads as a bug (owner, 2026-11-18)."
- Proposal: flow keeps going (never stops), but as a few small particles in a band covering 5% of the frame or less, never the
  whole background.
- Evidence: creatine's tunnel kept 54% of the picture moving (A2 #2).
- Recommendation: **yes**.

**20. Time cards come back.**
- Rule now (`toons-script.md`, format 5): "**No time card** in format 5."
- Proposal: a black card with one short line in the caption font ("3 DAYS LATER"), 0.8-1.2 s, hard cut in and out, the
  watermark kept; the picture after it has the **same framing** as before, only the state changed. At most 3 a video.
- Evidence: 8 of 20 refs; your quit-sugar DAY cards read well but came back to a different picture (A2 #3,
  sheet `agent2-sheets/08-reference-time-cards.jpg`).
- Recommendation: **yes**. It is a cut, not a transition, so it keeps "no transitions". The pilot needs it.

**21. The dive stays, but slower and even.**
- Rule now (`CLAUDE.md`): "the dive into his brain inside the first shot".
- Proposal: keep the person-first opening and the dive; one shared dive of 0.9 s with an even (log-scale) zoom, so it reads
  as a dive and not a jump; the person is on screen 1 s or less, the dive ends by about 2 s.
- Evidence: today almost all of the 10x zoom happens in the last 8 frames (A2 #7, sheet `agent2-sheets/11-our-dives.jpg`).
- Recommendation: **yes** (this changes no rule; it is listed so you know the hook timing moves by about half a second).

### Sound

**22. One music family, still a new track every video.**
- Rule now (memory of 2026-11-18, `toons-script.md` format 5): "Music of its own" for every video.
- Proposal: every video still gets its own new track, but always from one family: playful funk, slap bass, light percussion,
  130-165 BPM, a brighter "confident" second half from the doctor's answer, plus the topic's own colour. The music scan fails
  a track outside that family.
- Evidence: 20 of 20 refs are funk, 14 at 154 BPM; ours drift from 69 to 112 BPM and four styles (A3 #8).
- Recommendation: **yes**.

**23. Music louder in the pauses, a real dip under words.** **(listen first)**
- Rule now (`CLAUDE.md`): "**Music 10% lower** (`MUSIC_LEVEL` 0.9 in video.tsx)."
- Proposal: bed about 5 dB up in the pauses (music about 6 dB under the voice), a 3 dB dip under words spread over 0.25 s.
  Set when our videos had no pauses at all; with pauses, a low bed leaves holes.
- Evidence: refs 2.7 dB under, 2.6 dB dip; ours 11-13.5 dB under, 1.3 dB dip (A3 #8, `agent3-sheets/voice-pitch-and-gaps.json`).
- Recommendation: **listen to one A/B slice first** (made free from existing stems, judged also with `earshot ab`).

**24. Planned music stops on a gag.**
- Rule now (`toons-script.md`): "**The bed never goes quiet**".
- Proposal: a `"stop": true` on a stage event cuts the bed for 0.4-0.8 s on an impact or a gag, at most 2 a video, never on a
  word. Accidental holes still fail.
- Evidence: median 3 planned stops in the refs (A3 #8).
- Recommendation: **yes** (the old rule was about accidental holes; these are written in the script).

### Finish

**25. A short end card.**
- Rule now (`CLAUDE.md`): "**End every video with a CTA card: three strong points, each a big icon with short bold text**" ...
  "speaks the CTA and ends with: "Follow MedPeak Health for more health tips that keep you safe."" and "the narrator's end card
  may run past one minute (never cut or speed up the narrator)".
- Proposal (option A): the card stays (logo, royal blue, headline, three points, every line on one line, Joey's voice), but
  **5-6 s**: a hard cut in (no slide-up), the headline and three points come up together, Joey says only the follow line. The
  story ends on the answer or a loop line. Option B: keep today's 13-17 s card. Option C: A and B on alternate days, compare
  retention after two weeks.
- Evidence: the card is 21-26% of each video now, and the replay never meets the loop line (A3 #10); the slide-up is our last
  transition (A4 C2); layout fixes (A4 C3).
- Recommendation: **A**, with a retention read after two weeks. The layout fixes and the hard cut apply to any option.

**26. Watermark placement, and none on the cover.**
- Rule now (`CLAUDE.md`): "It moves three times, once per act: act 1 top right, act 2 bottom left, act 3 top middle."
- Proposal: still three acts and three moves, but act 2 sits at y 1180-1220 (it now sits 44 px above the caption and reads as
  a second caption line), act 3 takes the first of top-left / top-middle / top-right that is clear of heads in that shot, and
  the mark turns ink-coloured (same opacity) on light backgrounds. No watermark on the cover still.
- Evidence: it lands on heads and reads as a caption (A4 C4, sheet `agent4-sheets/13-watermark-placement.jpg`).
- Recommendation: **yes**.

**27. Caption tilt (the caption itself stays where you put it).** **(sheet first)**
- Rule now (`CLAUDE.md`): "Captions are one word at a time, no box, the key word bigger and yellow ... **From 2026-11-22 the
  caption sits 5% higher (y 1374) and is 40% smaller**".
- Proposal: the caption keeps its place and size. Instead of moving the caption off faces (agent 4's idea), the staging keeps
  every face out of the caption band, and a check fails any frame where it is not. The only visual change offered: a per-word
  tilt of -2 to +2 degrees (the flat dark drop is already there). Optional: one sheet with a rounded comic face for comparison.
- Evidence: refs' lettering is bouncier (A4 T1, sheet `agent4-sheets/07-captions-ref-vs-ours.jpg`).
- Recommendation: **see the sheet**; the "faces out of the caption band" part needs no decision (it is your rule already).

### How the work is run

**28. Who writes the code, and production during the rebuild.**
- Rules now (`CLAUDE.md`): "**Work split** ...: **the session writes the code itself**; the owner's Anthropic key ... is used only
  where he asks for it" and (`toons-known-issues.md`, 2026-11-22) "for coding and making kit use anthropic API" with the "$5 hard
  cap of Anthropic spend per video".
- Question: the rebuild is not a video. Should the coding agent write it in its own session (no spend on your key), or through
  `pipeline/claude-run.mjs` on your key with a cap you set for the rebuild? And do the 3-4 videos a day pause until the pilot
  is approved?
- Recommendation: **in the session (no spend on your key)**; pause new videos after the two already scheduled, so nothing is
  made on the old pattern twice.

**Short answer if you agree with all recommendations:** "1-9 yes, 10 sheet, 11-14 yes, 15 sheet, 16-17 yes, 18 slice,
19-22 yes, 23 listen, 24 yes, 25 A, 26 yes, 27 sheet, 28 in session and pause."

---

## Part 4. The rebuild, file by file

Branch: `feat/engine-v9` (one PR per phase, merged when CI is green, per the owner's rule). Everything new is switched on by
`"format": 6` in `toon.json`; videos already out keep their format and their shot files. Add `fasting` and `snake-bite` to
the "already out" set in `pipeline/test/views.test.mjs` (`OUT`) and to any new test that would otherwise fail them.

### Agent conflicts, resolved

| Conflict | Agents | Resolution |
|---|---|---|
| Move the caption off faces, or keep it fixed | A4 O6 vs owner's caption rule | Keep the caption fixed (y 1374). Staging keeps faces out of the band; check L3 fails a face in it |
| Eye size 100-170 (A1) vs "about 170" (owner) | A1 #5, CLAUDE.md | 120-170 px in whole-organ frames, never over 190; small cast (cells, drops) 60-110 px is fine |
| Line under zoom: context (A1), non-scaling-stroke (A2), "already non-scaling" (A4) | A1 #6, A2 #8, A4 O4 | All three are half right: the kit's `non-scaling-stroke` undoes the figure's own SVG scale but not the camera's CSS `scale()`. Fix: the camera sets CSS variables `--ink-out` / `--ink-in` = `OUT / z`, `IN / z`; the kit strokes read them. Arms become outlined shapes so they use `OUTLINE` too |
| How still: 80%+ (A2) vs 45-80% band (owner) vs "looks flat" (owner, twice) | A2 #2, CLAUDE.md | Band 78-94% picture-still, aim 85%, plus the "not dead" rule (every 8 s+ shot has an action) and small life moments (blink, one pulse every 2-4 s) |
| Time card 0.8-1.2 s (A2) vs quit-sugar DAY cards 0.6 s | A2 #3 | 0.8-1.2 s; the DAY calendar look can be the card's art, but the same framing returns |
| The hook: dive done by 1.5 s (A1) vs dive 0.8-1.0 s (A2) vs first word 0.3-1.2 s (A3) | A1 #13, A2 #7, A3 #1 | Frame 0 the person and the action; first (in-story) line at 0.4-1.0 s; dive starts at the end of that line, 0.9 s; inside by about 2 s; topic word by 3.0 s |
| Sound budget 16 a minute (A3) vs the owner's "too loud and poor sound" (62 effects) | A3 #9, known-issues no. 2 | 14 a minute at most (about 13 in a 55 s story), each in a pause, 0.7 s apart, none on a word |
| Name tags (owner 2.5 s, arrow) vs labels that stay without an arrow (A1 #11) | A1 #11, A4 T2 | Two different things: character tags unchanged (arrow now ends on the body centre); place labels (TRACHEA) are a new `stay` label, no arrow, the whole shot |
| One fixed doctor's room (A1 #12 "consider") | A1 vs owner's unique rooms | Rejected: rooms stay unique per video (owner, 2026-11-16); only the palette gets paler |
| Caption band to mask in the picture checks: y 1200-1640 (A2) | A2 | Mask from `captionStyle(toon)`: y 1290-1470 for `caption: 2`, y 1380-1580 for the first style. Also fix `CAPTION_BAND` in `scene.tsx` (still [1380, 1560]) |
| Render on twos (A2 #10) | A2 | Not done (A2 also advises against it); 60 fps smooth stays |

### 4.1 Drawing kit: `src/toons/v8/kit.tsx`

| Change | Interface | Target | Acceptance |
|---|---|---|---|
| Line weight under zoom | `OUTLINE`, `INLINE`, `EDGE`, `EDGE_IN` get `style: {strokeWidth: 'var(--ink-out, 5.6px)'}` (and `--ink-in`, 3.2px). The style beats the attribute, so no call site changes. Grep for call sites that also pass `style` and merge them | 5-6 px on screen at any zoom | A still at z 1 and z 2 (`--at`): measured outline 5-6 px in both; L-check "line" (C6) passes per shot. If Remotion's Chrome ignores the variable on SVG strokes, fall back to an `InkCtx` React context read by each piece |
| Flesh palette | `FLESH` adds `cavity '#a6706e'`, `cavityDeep '#7f5956'`, `organRed '#aa4148'`, `wallRim '#c04355'`, `wall '#ec8391'`, `gut '#cd717f'`, `gutShade '#a34757'`, `fat '#f6db87'`, `bile '#e9ce80'`, `bone '#f4e4d5'` (A1 #2) | body shots 60%+ warm | kit sheet; colour check C7 on the stage stills |
| Room palette | new `ROOM = {mint: '#f1fbfb', grey: '#e9eef2', cream: '#f3efe6', sky: '#dfe9f1', deepest: '#9db8c9'}`; `toons-rooms` recipes draw walls from it | saturation 0.22 or less, brightness 165+ | colour check C7 on the rooms board |
| Eyes | `Eyes` props add `lid?: number` (0..1, continuous), `turn?: number` (-1..1: far eye 8-12% smaller, both shifted to the near side), `overlap?: number` (0..0.15 of an eye), `ry = 1.12 * r`, pupil `0.18 r` (`0.13 r` for `scared`/`shock`), pupil offset up to `r - pr - 1.5` along `look`, `lookAt?: [x, y]` (a point in the same units; turned into `look`). New moods `pain`, `side`, `squint`, `shock` (A4 H7, O1-O3) | pupils can touch the rim | kit sheet: every mood at 3 turns; layout log reports each eye box and pupil direction |
| Mouth | `grit` not allowed on body characters (`FACE_OF.angry` becomes `{mood: 'angry', mouth: 'flat'}` for organs; people keep their own mouths); organ mouth width at most 0.6 of one eye | no teeth grid on organs | `kit.test.mjs` |
| Arms and legs | `TinyArm` / `TinyLeg` drawn as a closed outlined shape (move `capsule()` from `people-rig.tsx` into the kit) with `OUTLINE`, so the line matches the body; `start` 6-10 units inside the body edge; default drawing order "behind the body". Hands: `open` becomes four short rounded fingers with the thumb low on the side; new `grip` hand wraps a stick (A4 O4, O5) | arm line within 1.5 px of the body line | sheet test in `toon-v8-sheets.mjs`: every cast member at its largest video size, outline measured on arm and body |
| Tissue pieces | `Wall` ({d, fill, rim = 20, lining?}), `Folds` ({d or box, seed, density = 1 per 150 x 150 px, avoid: Box[]}), `Lobes` ({points, tones: [a, b], highlight}), `Speckle` ({box, seed, n}), `Highlight` ({x, y, w}: one short pale line, at most 0.25 of the shape width, 70% opacity; replaces every gloss streak), `ContactShadow` ({x, y, w}: flat ellipse, ink at 25%) (A1 #4, #9; A4 D-3) | rim band about 20 px; one fold per 150 x 150 px; none within 60 px of a face | kit sheet |
| State pieces | `Liquid` ({d, colour, level 0..1, t}: flat 55-65% opacity, 2-4 white wave lines), `Cutaway` ({d, wall = 20}: a window in an organ wall showing its inside, wall thickness visible), `Sore`, `Swelling` (the one soft redness), `Wound`, `Patch` (dark damage) (A1 #3) | | kit sheet in four states each |
| Labels | `BandLabel` ({text, path}: a paper band round a body, text on the curve) beside `NameTag` (A1 #10) | | kit sheet |
| Layout reporting | every face-making piece (`Eyes`, `Mouth`) calls `useReport()` (4.3) with its box in frame pixels | | layout log has a face box for every face on screen |

### 4.2 People: `src/toons/v8/people-rig.tsx`

| Change | Interface | Acceptance |
|---|---|---|
| Gaze | `PersonAt` / `HeadAt` take `lookAt?: [x, y]` (frame pixels of the other head); pupils pushed 0.8 of the way to the rim. The default `look ?? [0, 0.05]` (line 1340) is used only when nothing is given and the shot is the hook (A4 H1) | gaze check L10 |
| Rest hand | redraw `relaxed` as fingers together, curled 20-30 degrees, split lines only; the spread hand stays as `open` (a gesture). New `knee` hand (palm down, fingers wrap the knee). Shock pose on the cheeks uses `rest` (A4 H2) | hand sheet; motion check M5 (`open` held over 1.5 s without a gesture fails) |
| Symptom marks | `mark?: {kind: 'fang' | 'redCheek' | 'sore' | 'bandage'; at: 'ankleL' | 'ankleR' | 'cheekL' | 'cheekR' | 'handL' | 'handR' | 'forearmL' | 'forearmR'}[]`; clothes option `trouser: 'rolledL' | 'rolledR'` (decision 14) | people sheet |
| Stubble | per decision 15: removed, or a soft jaw band (two tones, inner edge as 6-8 dashes, 5% darker at most, not on the upper lip). Men's open mouth uses the dark mouth with the tongue (no pink lips) (A4 H3) | Dad sheet, both options |
| Lid acting | `Expr` adds `pain`, `side`, `squint` (they map to the kit's new lid moods) | people sheet |
| Reporting | `PersonAt` reports `head`, `face`, `hand` boxes (from `headAt`, `handAt`) and its pupil direction | layout log |
| Held props | `handProp` (4.6) is the one way to put a thing in a hand: drawn BEHIND the person at `handAt(...).palm` (the creatine rule); it is there from the shot's first frame or comes in with the hand (A4 H5) | pop check C4 |

### 4.3 The contract and the layout log: `src/toons/v8/play.tsx`

| Change | Interface | Acceptance |
|---|---|---|
| Layout log | `LayoutCtx` (React context) and `useReport()`: `report({kind: 'face' | 'eye' | 'mouth' | 'head' | 'body' | 'hand' | 'text' | 'tag' | 'label' | 'fx' | 'prop' | 'wallItem' | 'bubble' | 'watermark' | 'caption', who?, box: {x0, y0, x1, y1}, dir?: [dx, dy], owner?, open?: boolean})`. `FrameCtx` carries the current transform: `Put` and `Fig` push their translate/scale, so a piece reports in frame pixels; the collector then applies the camera (`view`) to get screen pixels. No-op outside a probe (zero cost in a normal render) (A4 D-1) | `layout.test.mjs`: a synthetic shot with a known box reports it to within 2 px |
| Blink | `blink(t, seed)` lasts **0.2 s** and returns a continuous lid 0..1 (open, half, shut, half, open); `bodyFace` returns `{mood, mouth, lid}` instead of switching to `'closed'` at 0.5. Frames 0-6 of a video never blink (the cover) (A4 O3, D-4) | pop check C4 (a face change under 4 frames fails) |
| Look and hold | `lookAt(s, who, spots)`: on the first word of a reply the listener's pupils turn to the speaker and hold; the speaker looks at the listener; held, never drifting (A2 #6). `still(s, who)`: 1 while `who` speaks, so callers freeze the body and move only mouth and pupils | motion check M1 |
| Key-word gesture | `onKey(s, who)`: 0..1 around the current line's `key` word, so a gesture happens once per line at most | M1 |
| Hysteresis | `latched(t, valueAt, up = 0.45, down = 0.35, look = 0.1)`: a pure function that looks back up to 0.1 s, so a pose chosen by a moving value cannot flip for one frame. Replace every `value > k ? A : B` pose choice (A4 M1 found it in `crea-cast`, `creatine`, `fasting`, `quit-sugar`, `scenes-body`, `shots-v3` x2, `snake-bite` x2) with `armTo` blending or `latched` | pop check C4 on the next renders |
| Shot contract | `ShotDef` adds `kind: 'body' | 'micro' | 'room' | 'card'`, `stage?: StageName`, `punch?: {line: string; z: number}` (the one allowed re-frame), `faces?: (s) => Record<who, Focus>` for gaze. `ShotNow` adds `state: Record<string, number>` (the stage dials now, from `toon.json` `events`, via `stateAt` in `director.ts`) and `pass: number` (a shot played twice, before and after a card, keeps its `view`) (A2 #3) | `views.test.mjs` (4.13) |

### 4.4 New: anatomy stages `src/toons/v8/anatomy.tsx` (+ `entry-anatomy.tsx`)

The heart of the rebuild (A1 #1, #3, #4, #7; A2 #4). A stage is a full 1080 x 1920 place in three planes (cavity behind, the
hero organ and its neighbours, a cropped near edge), drawn with the kit's new tissue pieces, built to **hold 20 s or more**.

```ts
export type StageName = 'chest' | 'upperBelly' | 'throatSide' | 'skullSide' | 'vesselInside' | 'tissue' | 'skinSection';
export type StageProps = {t: number; state: Record<string, number>; faces: Record<string, V8Props & OrganActing>; children?: React.ReactNode};
export type StageDef = {
  Stage: React.FC<StageProps>;
  dials: string[];                                        // every state dial, 0..1, documented
  slots: Record<'top' | 'left' | 'right' | 'bottom' | 'window', {x: number; y: number; dir: [number, number]}>; // where intruders enter
  faces: Record<string, Focus>;                           // each face's centre and radius at rest (gaze, staging)
  faceRoom: Record<string, Box>;                          // nothing of the contents may enter it
  neighbours: string[];                                   // named structures besides the hero (3 or more)
};
export const STAGES: Record<StageName, StageDef>;
```

| Stage (build order) | Hero and neighbours | Dials | Notes |
|---|---|---|---|
| `chest` (pilot) | both lungs (lobes, `Wall` on the bronchi), windpipe with rings, bronchi, heart peeking between, ribs curve, diaphragm, cavity | `tar` (dark patches), `mucus`, `airway` (bronchi width), `cough` (one squeeze), `pink` (healthy colour back), `cilia` (how many sweepers are awake) | starts from `Lungs`, `Windpipe`, `Cilia` in `organs-a/b.tsx`, `cells.tsx` |
| `vesselInside` (pilot) | a vessel seen from inside, side view, a floor, red cells, the wall with folds | `flow` (particles in a band), `co` (carbon monoxide riders on red cells), `pink` | the flow rule of decision 19 |
| `upperBelly` | stomach with `Wall` + `Cutaway` + `Liquid`, liver behind, bile duct, food pipe from the top, gut below, spleen edge | `fill`, `contents` (food set), `acid`, `gas`, `damage`, `cut` | replaces `StomachFull` and `PLACE` in `fast-art.tsx` |
| `throatSide` | tongue, palate, windpipe, food pipe, epiglottis, spine | `stuck` (an object in the pipe), `sore`, `swallow` | |
| `skullSide` | brain in its skull (on its floor, stem inside the skull: A4 O7), meninges | `fog`, `glow` (flat), `sleep` | takes `BrainFull` from `sugar-organs.tsx` |
| `tissue` | ceiling band, folded curtain wall, floor with a lighter top edge, contact shadows (A1 #9) | `damage`, `swelling` | for cell and germ scenes; replaces floating characters |
| `skinSection` | surface, fat, muscle, a vessel | `wound`, `swelling` | for bites and stings (topics 6, 8) |

- Targets for every stage: no flat non-tissue field over 12% of the frame; 3+ neighbours; organ eye 120-170 px, face above
  y 800; mouth 40-70 px; nothing in the caption band at the face; one short `Highlight` at most; outline 5-6 px.
- `LiverFull`, `MouthFull`, `BrainFull` (`sugar-organs.tsx`) are the starting pattern and move into stages as they are reused.
- **Acceptance**: `node pipeline/toon-v8-sheets.mjs anatomy` writes one 16:9 board per stage with four states, plus each stage
  at full 1080 x 1920; the colour check C7 passes on each full still; a 20 s silent slice of the `chest` stage with one state
  change every 4-6 s passes the motion checks C1-C2 and M2.

### 4.5 Cells, germs and job characters: `src/toons/v8/cells.tsx`, `germs.tsx`

- `MiniWorker` ({job: 'guard' | 'cleaner' | 'firefighter' | 'courier' | 'builder'; uniform: string; hat?: boolean; prop?: 'broom' |
  'sign' | 'phone' | 'hose' | 'box'; mood; look; lid; pose}) : two heads tall, kit eyes, small real hands (the rig's `Hand` at
  small scale), `ContactShadow` under it (A1 #10, decision 13). The pilot's cilia become a cleaner crew with brooms, banded "CILIA".
- Chemicals as soft eggs with a `BandLabel` (the pilot's carbon monoxide, "CARBON MONOXIDE"); `Nicotine`, `Tar` (in `germs.tsx`) get
  bands too.
- Every character reports its face and body box. **Acceptance**: `node pipeline/toon-v8-sheets.mjs cells` shows the crew in
  five jobs at video size; arm-line test passes.

### 4.6 Props and intruders: `src/toons/v8/props.tsx`

- `Intruder` ({kind, from: 'top' | 'left' | 'right' | 'bottom' | slot, t, t0, height: 0.3-0.6 of the frame, eyes?: V8Props, over?: who}):
  enters from a frame edge or a stage slot with `enter()` (4.8), overlaps the organ, may get kit `Eyes` (A1 #8).
- `hero` level of drawing for the one intruder a video: 3 tones, 1 highlight line, 2-4 construction details (seams, a filter
  band, a cable), still the kit line; cups and glasses held with fingers in front (A4 P3). Pilot: `Cigarette` (paper, filter,
  ash, a flat ember), an ashtray.
- `handProp({t, t0, hand, enter: 'below' | 'pocket' | 'start'})`: a held thing scales in over 0.15 s while the hand comes up over 0.3 s,
  or is there from frame 0; a rope or bandage draws on along its path with `reveal()` over 0.4 s (A4 H5).
- Props on furniture take the furniture's view angle (`ry / rx` of the table top) (A4 P4).
- Props with words register a `text` box; a word on a prop is shown once (A4 P1).
- **Acceptance**: props sheet with the hero cigarette at full size beside the plain props; pop check C4 clean on a hand-off slice.

### 4.7 Scenes: `scene.tsx`, `scenes-rooms.tsx`, `scenes-body.tsx`, `micro3.tsx`

- `scene.tsx`: `CAPTION_BAND` from `captionStyle` (1324-1434 for `caption: 2`); `Put` pushes its transform to `FrameCtx`.
- `scenes-rooms.tsx`: walls from `ROOM`; `PEOPLE_SCALE` 4.0 for two-shots (decision 12); at most 5 props; nothing strongly
  coloured behind a head; wall items report `wallItem` boxes; a framing rule in the room camera (`frameOf` / the shot's `view`):
  every head and wall item is either over 85% or under 15% inside the frame (A4 H4).
- `scenes-body.tsx` / `micro3.tsx`: the continuous creeping dive (`DiveCtx`) is not used by format-6 body shots (decision 16);
  depth planes stay for micro places. `Bits` flow is confined to a band of 5% of the frame or less (decision 19). Micro places
  stand characters on a floor (`tissue` stage) with contact shadows.
- **Acceptance**: rooms board in the pale palette; colour check C7; edge check L6.

### 4.8 Acting and effects: `src/toons/v8/act.tsx`, `organ-act.tsx`

| Piece | Interface | Target |
|---|---|---|
| `enter`, `leave` | `enter(t, t0, from: 'top' | 'bottom' | 'left' | 'right', dur = 0.5)` returns `{dx, dy}` from outside the frame, ease-out, overshoot 4% at most; `leave` eases in | one action 0.3-0.8 s, then 1.5 s+ hold |
| `along` | `along(path: P[], t, t0, dur)`: travel along an arc (builds on `arc`) | |
| `fill` | `fill(t, t0, dur = 0.6)`: 0..1 for a `Liquid` level or a mask | |
| `reveal` | `reveal(t, t0, dur = 0.8, dir)`: a wipe mask for spreading damage, a scan beam, a rope drawing on | |
| `Dive` | one shared component: `Dive({t, t0, dur = 0.9, from: {x, y, z}, to: {x, y, z}, portal})`; zoom `Z = from.z * (to.z / from.z) ** e` with an ease-in-out `e` (even on a log scale); replaces the copies in `creatine.tsx` `ShotA` and `quit-sugar.tsx` `ShotA` (A2 #7) | per-frame zoom 6% or less at 60 fps |
| `FightCloud` | `FightCloud({t, t0, dur = 1.5, x, y, r})`: kit white + ink line, 6-9 lobes re-seeded every 3 frames, bits flying off, a limb or prop poking out (A2 #5) | 1-2 s, flat, no glow |
| `Sweat`, `Marks` | small face marks (a drop, a bump, three lines) | |
| `Burst`, `shake` | `Burst` radius capped at 120; `shake` capped at 12 px, 0.25 s; both report `fx` boxes so the staging check counts them and keeps them 1.2 face radii from faces | 2 bursts, 1 shake a video |
| `organ-act.tsx` | gestures only on the key word (`onKey`); `pounding` loops 0.8 s at most; `OrganArm` uses the new outlined `TinyArm`; `voiceSq` and talk sway retired for format 6 (A2 #6) | M1 |

**Acceptance**: a 10 s motion test (phase 4) with one `enter`, one `fill`, one `FightCloud` and the dive; checks C1-C5, M1-M2 pass.

### 4.9 HUD: `src/toons/v8/hud.tsx`

| Piece | Change | Acceptance |
|---|---|---|
| `TimeCard` (new) | `TimeCard({text, t})`: black (or brand-dark) full frame, one line in the caption font, 0.8-1.2 s, hard cut in and out, the watermark kept (A2 #3) | card check C8 |
| `WordCaption` | fixed place and size (owner); seeded tilt -2..+2 degrees if decision 27 says so; cleared in any pause over 0.4 s; cleared on every cut, next word 2 frames after (A3 #12, A4 T3) | L3, pop check |
| `CharTag` | arrow tip on the character's body centre from the layout log, never on a face, prop or crumb; skipped when the character wears a `BandLabel`; 3 px wider white margin when the background behind the box changes over 25% (A4 T2). New `stay` option for place labels: no arrow, the whole shot, set on the tissue, may tilt (A1 #11) | L4 |
| `Watermark` | `WM_AT` act 2 to y 1180-1220; act 3 picks top-left / top-middle / top-right by head boxes; ink colour on backgrounds brighter than 200 (decision 26) | L5 |
| `CtaCardV4` | hard cut in (no push-up slide); stack centred between y 200 and 1500; icon circle 170 px in a 220 px card (25 px margin); icons drawn to fit (no clipping); the follow box above y 1500; headline and points together, 0.15 s apart; the drop icon's gloss streak removed; length per decision 25 (A4 C2, C3) | end-card check S9 |
| Text count | every text piece reports `text`; at most 2 besides caption and watermark (A1 #11) | L8 |
| Icons | `IconBadge` unchanged; icons only when the words say it (owner) | |

### 4.10 The player: `src/toons/v8/video.tsx`

- Delete the automatic shake (`const shake = flash > 0 ...`, line 198). `fx: 'flash'` allowed once a video, never on a cut.
- The camera `div` sets `--ink-out` and `--ink-in` to `OUT / z` and `IN / z` (4.1).
- Format-6 body shots: one `view` for the shot; `punch` applied once; no `smoothCam` lean.
- Time cards: a `card` shot renders `TimeCard`; the shot after it may reuse the shot before it (`pass: 2`) with the new state.
- Captions: clear rules above; faces never moved for the caption.
- CTA: hard cut in; timing from `V8_CTA` per decision 25.
- Music: `SOUND` levels (4.11); `stop` events cut the bed for 0.4-0.8 s with 40 ms fades.
- Probe mode for the layout log (4.12): `ToonV8` with a `probe` collector renders the same tree.

### 4.11 Timing, sound and the director: `src/toons/director.ts`

| Change | Value |
|---|---|
| `GAP` | 0.14 -> **0.22 s** |
| `SHOT_GAP` | 0.25 -> **0.5 s** |
| `pause` on `ToonLine` | seconds before a line; automatic 0.5-0.8 s after a `shocked` / `scared` line, 0.6 s before the answer block, 0.4 s after a scene's first event |
| `beat` | stays (0-3 s after a line); 2-3 beats of 1-2.5 s a video, each on a picture event |
| `answer: true` on a group of 3-6 lines | the answer block (35-60 words, by the doctor or the wisest body character) |
| `card` shots | `{"card": "3 DAYS LATER", "seconds": 1.0, "same": "B"}`: `same` names the shot whose framing returns after it |
| `SOUND.bed`, `SOUND.bedUnderVoice` | per decision 23: `bed` x1.8 (about 1.0), `bedUnderVoice = bed * 0.71`, the dip spread over 0.25 s; `MUSIC_LEVEL` in `video.tsx` set to match |
| `SOUND.perMinute` | 12 -> **14** (only with pauses; `minGap` 0.7 s stays; never on a word) |
| `stop` on `ToonEvent` | a planned music stop, 0.4-0.8 s, at most 2 a video, never on a word; `BED`'s hole rule ignores planned stops only |
| Shot kind | `kindOf(shot)`: body / micro / room / card, used by the gate's place budget and by the picture checks |

### 4.12 The checks' plumbing (new and rewired)

| File | What |
|---|---|
| `pipeline/lib/toon-layout.mjs` (new) | `probeLayout(slug, {every: 0.1})`: renders the v8 tree in Node (`react-dom/server` `renderToStaticMarkup`, through the tsx loader, no browser, free) at every 0.1 s with a `LayoutCtx` collector and the shot's camera; writes `videos/<slug>/renders/layout.json`: `[{t, shot, kind, cam: {x, y, z}, items: [{kind, who, box, dir, owner}]}]`. About 600 probes a video, seconds not minutes |
| `pipeline/lib/toon-staging.mjs` | rewired: format-6 (and any v8) videos read `layout.json` instead of `Player.tsx` / `rooms.tsx` / `stages.tsx`; the old path stays for the old engine's videos |
| `pipeline/lib/toon-motion.mjs` | rewired the same way: joints and hands from the layout log time series (people AND organ arms) |
| `pipeline/lib/toon-camera.mjs` | rewired: the real `view` of every v8 shot per frame (from `shotNow` in `video.tsx`), not the script's camera words |
| `pipeline/lib/toon_picture.py` (new) | the picture checks on the final MP4 (Part 5, C1-C8), built from agent 2's `measure.py`, `analyse.py`, `heat.py` and agent 4's `glitch.py` (all in the sheets folders); runs with earshot's Python (numpy) like `toon_look.py`; reads `layout.json` for shot kinds and card times; writes `renders/picture.json` |
| `pipeline/toon-look.mjs` | runs `toon_picture.py`, prints the new bands and, for history, the old whole-frame numbers |
| `pipeline/toon-score.mjs` (new) | `npm run toon:score -- <slug>`: one table of every Part 1 number, ours against ref and target, PASS/FAIL, and a 16:9 JPG `renders/scoreboard.jpg` for the owner |
| `pipeline/toon-v8-render.mjs` | after a final render, runs layout probe, staging, motion, picture, sound, listen and score; a failing check is printed in red and the render is marked "not for the owner" |
| `pipeline/lib/toon-rules.mjs`, `retention.mjs` | the script checks S1-S12 (Part 5) under `format: 6` |
| `pipeline/lib/toon-sound.mjs`, `toon-sound.mjs` | the mix checks A1-A4 |
| `pipeline/toon-listen.mjs`, `pipeline/lib/toon_listen.py` | `--voices` adds a free pitch measure per character (librosa `pyin`, from agent 3's `voice.py`); "lost" sounds fail; END CARD length |
| `pipeline/toon-music-scan.mjs`, `toon-music.mjs` | the funk family gate and the prompt template |
| `pipeline/toon-package.mjs` | the cover picked by score from `layout.json`; title in the largest free area clear of faces, hands and props; no watermark on the cover; the answer line as the description's first line (A3 #11, A4 C1) |

### 4.13 Tests: `pipeline/test/`

| Test | What it proves |
|---|---|
| `views.test.mjs` | a format-6 body shot's `view` never changes unless the shot declares `punch`; at most one punch a video |
| `layout.test.mjs` (new) | the layout log reports a known box; a synthetic frame with a caption on a face, a burst on a face, text on text, a half head at the edge, a watermark on a head each FAILS its check |
| `kit.test.mjs` (new) | blink lasts 0.2 s with a half lid; pupils reach the rim; `grit` refused on organs; arm and body line within 1.5 px |
| `picture.test.mjs` (new) | each picture check fails a tiny known-bad clip made free with ffmpeg `lavfi`: a shake, a flash, a one-frame pop, a zoom jump, a re-frame and back, a too-short card; and passes a clean one |
| `toons.test.mjs` | the new script rules: a fixture made from the creatine script FAILS `One story` and `Cast returns`; a fixture made from fasting FAILS `Breath`; a good format-6 fixture passes |
| `cta.test.mjs` | the end card is a hard cut; its length matches decision 25 |
| `voices.test.mjs` | `toons-cast.json` speed bands per role (body, people, doctor) |

---

## Part 5. New automatic checks (one for every mistake class)

Every check measures the real picture (the final MP4), the real tree (the layout log) or the real sound (the voiced mix),
never only `toon.json`. All are free and local. "Fail" stops the video before the owner sees it.

### Picture checks (final MP4, `pipeline/lib/toon_picture.py`, run by `npm run toon:look`)

Frames are resampled to 30 fps (C4, C5 use the 60 fps file), 270 x 480, the caption band masked (Part 4 conflicts table).
A pixel "changes" when it moves more than 12 levels; a frame is "still" when under 0.5% of the picture changes.

| # | Check | How it measures | Pass |
|---|---|---|---|
| C1 | Cuts and their kinds | a cut = over 45% of the picture changes and the mean change is over 28 levels; classified by matching the frame after against the frame before scaled 1.2-2.5x and shifted (match = re-frame), all-dark (mean under 30) = card, else place | 6 or fewer cuts a minute (cards not counted); median hold 6 s+; body place 8 s+; 1 re-frame at most; no re-frame reversed within 4 s |
| C2 | Stillness | per-frame picture change; per-second action; a heatmap of pixels changing in over 5% of frames | picture still 78-94%; visible-action seconds 25% or less; big-action seconds 5% or less; 40 or fewer frames a minute over 10%; heatmap 5% or less; a 4 s fully still stretch; every shot of 8 s+ has an action run (not dead) |
| C3 | Flash and shake | flash: mean brightness up 8+ levels within 3 frames over 60% of the area; shake: the whole picture shifts 3+ px and back within 0.3 s (shift search at a 1-frame gap, from `measure.py`) | 1 flash, 1 shake at most; no flash on a cut |
| C4 | One-frame pops | `glitch.py` at 60 fps: a frame that differs from both neighbours while they match, over 0.4% of the picture, outside cuts and the caption band; and any face box (from the layout log) that changes for fewer than 4 frames | 0 |
| C5 | Zoom jumps | per-frame zoom ratio from the shift-and-scale search at a 1-frame gap | 6% or less a frame at 60 fps; no one-frame size jump outside a cut |
| C6 | Line weight | median width of dark runs across outline edges, per shot | 4-7 px in every shot |
| C7 | Colour and flat fields | hue families per frame; body vs room from the layout log; the largest connected flat region not in the `FLESH` palette | body: warm 60%+, any other family 8% or less, no flat non-tissue field over 12%; rooms: saturation 0.22 or less, brightness 165+; main clothing colour a clear step from the wall |
| C8 | Time cards | card in/out cut pairs; the frames either side of a card compared after the state-change area is masked (edge-map correlation of the background 0.7+) | each card 0.8-1.2 s; same framing either side; 3 cards at most |

### Layout checks (layout log, `pipeline/lib/toon-staging.mjs`, `npm run toon:staging`)

| # | Check | Pass |
|---|---|---|
| L1 | Nothing on a face (eyes + mouth, padded 20 px): characters, props, icons, bursts, bubbles, tags, plates | 0 frames, except the face owner's own hand |
| L2 | Text on text (caption, tag, plate, place label, prop text) | 0 |
| L3 | A face, eye or mouth in the caption box | 0 frames |
| L4 | A tag arrow tip outside its own character's body box; a tag on a character with a `BandLabel` | 0 |
| L5 | The watermark on a head, or within 120 px of the caption | 0 |
| L6 | A head or wall item 15-85% inside the frame | 0 |
| L7 | Bursts within 1.2 face radii of a face; more than 2 bursts a video | 0 / 2 at most |
| L8 | Text elements on screen besides the caption and the watermark | 2 at most; 1 number plate a video |
| L9 | Organ eye width in a whole-organ frame (screen pixels); face centre height | 110-190 px; above y 800 |
| L10 | Gaze: during a line with 2+ characters on screen, a non-speaker's pupils point more than 30 degrees from the speaker | for 70% of the line or less (the hook line may look at the lens) |
| L11 | Hands of different people closer than 30 px | 3 frames at most, unless the line says `touch` |
| L12 | A thought bubble without its trail to its `of` owner, or over a wall item | 0 |
| L13 | The cover frame: title box on a face, hand or prop; anything cut at the edge; closed eyes | 0 |
| L14 | The symptom: patient shots after the symptom event carry the declared `mark` | every one |

### Motion checks (layout log time series, `npm run toon:motion`)

| # | Check | Pass |
|---|---|---|
| M1 | The face talks, the body holds: the speaker's body points (all but mouth and pupils) move | on 30% of the line's frames or fewer; the listener's on 10% or fewer |
| M2 | One action, then a hold: two big actions in the same shot | 1.5 s apart or more |
| M3 | Joint speed (the existing limits: foot 0.6, leg 3, arm 85 px a frame, pop 4) for people AND organ arms | as now |
| M4 | A pose that flips and flips back (threshold switch) | 0 (also caught by C4) |
| M5 | An `open` hand held over 1.5 s without a gesture step | 0 |

### Script checks (`toon-rules.mjs`, before any spend, and again on the real timings)

| # | Check | Pass |
|---|---|---|
| S1 | Hook in the story (`HOOK.kind: 'story'`) | 8 words or fewer; topic word said by 3.0 s; first word 0.3-1.2 s; no "you" to the camera (warning until decision 3) |
| S2 | One story | 3 sourced facts or fewer before the answer block (warn at 4, fail over 6) |
| S3 | Cast returns | 4 speakers or fewer plus the doctor; each speaks 3 lines or more |
| S4 | Answer block | 35-60 words; starts at 55-80% of the story; names the condition (a title word or `term`); one action verb (take, drink, cut, keep, ask, wait, see, stop) or "that's why"; every line sourced; the care line last or second-last |
| S5 | Breath | talking 80-93% of the story; 3+ pauses of 0.5 s, 2+ of 1.0 s; every beat has a picture event; no beat over 3 s |
| S6 | Talk speed (word times) | body lines 3.0-3.6 words/s, doctor 2.6-3.0 and 0.3 slower than the body cast; no line under 2.4 or over 4.0; no "..." inside a line |
| S7 | Numbers, source words, reactions, sentence length | numbers said: 1 (warn 2, fail over 2); "study / trial / WHO" said: 1 at most (warn); reaction words 2+ (warn); 5-7.5 words a sentence |
| S8 | Places | 2-4 body places plus at most one room scene each side; inside the body 60%+ of the story; 3 body/room switches at most; each body place 8 s+ |
| S9 | End card | length and share per decision 25 (option A: 6 s and 12% at most); the narrator heard (existing) |
| S10 | One real intruder | the script names one hero prop that enters the body |
| S11 | No gauges inside the body | prop kinds `gauge`, `meter`, `clock`, `chip` refused in body shots |
| S12 | Time cards | 3 at most; each names its `same` shot; its change is sourced |

### Sound checks (`toon:sound` on the stems, `toon:listen` on the final file)

| # | Check | Pass |
|---|---|---|
| A1 | Mix | music in pauses 4-8 dB under the voice; dip under words 2-4 dB; loudness range 4-8 LU; -14 +-1 LUFS; true peak -1.0 dBTP or lower; 0 clipped samples |
| A2 | Beats have sound | every beat of 0.8 s+ has a story sound or a planned stop; no sound reported "lost" |
| A3 | Music family | earshot tags funk/playful in its top two; 130-165 BPM; one style across sections except the planned "confident" switch; 2 planned stops at most, never on a word |
| A4 | Voices apart | speakers in one scene 3+ semitones apart (median pitch); 30-55% of body lines above 250 Hz |
| A5 | Effects | 14 a minute at most, 0.7 s apart, never on a word (existing rules, new budget) |

### Sheet checks (`toon-v8-sheets.mjs`)

| # | Check | Pass |
|---|---|---|
| K1 | Arm and body outline on every cast member at its largest video size | within 1.5 px |
| K2 | The end card at its last frame | empty bands top and bottom differ by under 120 px; no icon pixel touches its circle |

---

## Part 6. Skill and CLAUDE.md changes (only after the owner's answers)

Each change below is written only for the decisions the owner says yes to; a "no" keeps the old text. Every changed rule
keeps its date and adds the new date and the owner's words.

### `CLAUDE.md` (repo root), "What the owner has decided"

| Bullet | Rewrite (decision) |
|---|---|
| "Inside the body means microscopic" | "Inside the body means INSIDE the region: an anatomy stage (`anatomy.tsx`), the organ with its real neighbours; micro places for cells, blood and germs" (6) |
| "An organ's big moment shows the WHOLE organ" | eyes 120-170 px, slightly oval, turned (10); state drawn on the organ, no gauges inside the body (9); one warm family (7) |
| "Text on the picture ... Captions ..." | caption fixed at y 1374; faces never in the caption band; tilt if chosen (27) |
| "Watermark ..." | act 2 at y 1180-1220, act 3 picks a free top spot, ink on light backgrounds, none on the cover (26) |
| "End every video with a CTA card ..." | option chosen in 25 (A: 5-6 s, hard cut, Joey says the follow line) |
| "No transitions ... Music 10% lower ... The hook opens on the person ..." | hard cuts stay; time cards allowed (20); music level and planned stops (23, 24); the hook keeps the person and the lens, the line is in the story (3), the dive is 0.9 s (21) |
| "The look check must pass ..." | the new picture bands and "all checks run on the FINAL render; `npm run toon:score` must say PASS" (17) |
| "Icons only when ... The camera moves smoothly (one eased move per shot, a continuous dive inside the body) ..." | "the camera is locked; one framing per body shot; one punch-in a video; at most 6 cuts a minute" (16); name tags unchanged except band labels (13) |
| "Work split" | the answer to 28 |
| "Look v8 map" | add `anatomy.tsx`, the layout log (`LayoutCtx` in `play.tsx`), `TimeCard`, `MiniWorker`, `Intruder` |
| "Commands" | add `npm run toon:score -- <slug>`, `node --import tsx pipeline/lib/toon-layout.mjs <slug>`, `node pipeline/toon-v8-sheets.mjs anatomy` |

### `skill/medpeak-health/`

| File | Section | Rewrite |
|---|---|---|
| `SKILL.md` | Hard rule 7 ("The version 4 rules for every Toon") and the Toons workflow paragraph | point to format 6; the new check list (staging, motion, picture, sound, listen, score) run on the final render; `toons-target.md` read first |
| `references/toons-target.md` (new) | whole file | Part 1 of this blueprint (the target and the numbers), kept current; the one page every Toon is measured against |
| `references/toons-v8-style.md` | rule 2 (the three soft exceptions, 8); rule 3 (eyes, 10); rule 6 (job characters, 13); scene rules (stages instead of "MICROSCOPIC", people framing 12, caption band 1324-1434); "Version 4 rules": End card (25), Watermark (26), Camera and transitions (16, 20, 21), The hook (3, 21), Approval steps (add the scoreboard); "Owner's notes of 2026-11-21": music (23) | |
| `references/toons-script.md` | a new top section **"Format 6: one story"** that replaces, for new scripts, the format 4 macro rules, format 5's "Never still", "No time card", "Text on the picture is for a number", "Impacts take flash", and the 12-a-minute sound budget; it holds: the shape (problem in 2-4 places for the first 55-75%, the answer block after), the fact budget (1), the hook kind (3), Retention 7 for Toons (4), pauses and beats (5), line style (demands, refusals, reactions, one "no" before the midpoint, a joke on the damage), the answer block (2), one number, the music template (22), time cards (20), the order of work with every new check | older formats stay below it, marked "videos already out" |
| `references/toons-look.md` | "Flow never stops" (19); "The look check" table (17) | mark the rest as the 2026-11-17 ink look history |
| `references/toons-camera.md` | whole file | it describes the OLD director (lenses, blur, whips, a cut every 2.9 s). Rewrite as "the v9 camera": locked, one framing per shot, one punch-in, the dive, time cards, the cut budget, the measured checks; the old text moves under "old engine only" |
| `references/toons-known-issues.md` | the top table; the 2026-11-22 checklist; new entry | add R2 as a numbered bug ("the checks read the old engine": cause, fix, check); replace "one colour per place" and "a gauge to EMPTY" in the checklist (7, 9); add the new checks to the table |
| `references/toons-blueprint.md` | new sections | how to build an anatomy stage (`StageDef`), a mini worker, an intruder / hero prop; every new piece reports to the layout log |
| `references/toons-listening.md` | `--voices` | the pitch measure and "Voices apart"; the mix check |
| `references/medical-accuracy.md` | Toons | the answer block names condition, cause, one action; one spoken source word at most, where honesty needs it; association wording unchanged; time-card claims sourced |
| `references/retention-7.md` | a "Toons" note | decision 4 (the long videos unchanged) |
| `toons-cast.json` | `note` and per-role speeds | speeds by role (5); casting rule: small or young body characters +3 to +6 semitones or a young voice; the doctor the calmest (A3 #7) |
| `references/topic-bank.md` | #7 | mark `taken` when the pilot starts |

---

## Part 7. Order of work, in phases

Each phase ends in something the owner can SEE or HEAR and approve. A phase starts only after the one before is approved.
Effort is in working days of the coding agent (rough). All phases are free except phase 7's voice and music.

| Phase | Build | The owner sees | Effort |
|---|---|---|---|
| **0. Decisions** | the owner answers Part 3; the agent writes the `CLAUDE.md` changes for every "yes" and a `HANDOFF.md` entry | his answers written back as the new rules | owner 15 min; agent 0.5 |
| **1. Measure the picture** | layout log (`LayoutCtx`, `FrameCtx`, `useReport` in `play.tsx`; reporting in `Eyes`, `Mouth`, `PersonAt`, `Put`); `toon-layout.mjs`; `toon_picture.py` (C1-C8); rewired staging/motion/camera (L1-L14, M1-M5); `toon-score.mjs`; the new tests with known-bad clips | **a scoreboard sheet for our 4 newest videos against the reference**, red where the owner already saw a problem (caption on eyes, bursts on faces, cuts every 2 s); proof the checks now catch what he caught | 2 |
| **2. Kit and people** | line under zoom; eyes (oval, turn, rim pupils, lid, blink 0.2 s, new moods); gaze `lookAt`; arms as outlined shapes, new `open` and `grip` hands; `relaxed` and `knee` people hands; `Highlight` (gloss removed everywhere); `Wall`, `Folds`, `Lobes`, `Speckle`, `ContactShadow`, `Liquid`, `Cutaway`, damage marks, `BandLabel`; `FLESH` and `ROOM`; symptom `mark`; stubble options | **cast before/after sheet** (all organs, cells, germs, the 8 people), **close-up sheet** (eyes in every mood, hands at rest, arm joins, the line at zoom 1 and 2), **Dad stubble A/B** (decisions 10, 15) | 2 |
| **3. Stages and places** | `anatomy.tsx`: `chest`, `vesselInside`, `tissue` first, then `upperBelly`, `throatSide`, `skullSide`, `skinSection`; `MiniWorker`; `Intruder` and the hero cigarette; pale rooms; people framing | **stage boards (16:9) with four states each and full 1080 x 1920 stills**, the cleaner crew, the hero prop, a pale room; colour check numbers printed on each | 3 |
| **4. Motion and time** | `enter`, `leave`, `along`, `fill`, `reveal`, shared `Dive`, `FightCloud`, `Sweat`, `Marks`; `still`, `lookAt`, `onKey`, `latched`; auto shake removed, flash opt-in; `TimeCard` and `pass: 2`; flow in a band; threshold switches replaced in the 8 files | **a 12 s motion test** on the chest stage: the dive in, a cigarette slides in, a hold, a LATER card, the same framing changed; and **a 10 s before/after impacts slice** (decision 18) | 1.5 |
| **5. Script, voice and sound** | format 6 in `toon-rules.mjs` (S1-S12), `retention.mjs`; `director.ts` timing (`GAP`, `pause`, `SHOT_GAP`, `answer`, `card.same`, `stop`); `SOUND` levels; the music template and scan (A3); `toon-listen --voices` pitch (A4); the mix check (A1, A2) | **an A/B audio slice** (an existing video re-mixed free from its stems: old levels vs new levels with real pauses), judged by him and `earshot ab` (decision 23); the creatine script run through the new gate, failing where it should | 1.5 |
| **6. Finish** | captions (tilt option, clear rules); `CharTag` arrows and `stay` labels; watermark placement; end card (hard cut, layout, length); cover by score | **end card sheet, watermark sheet (three acts on light and dark), caption sheet (with/without tilt, optional comic face), two cover options** (decisions 25-27) | 1 |
| **7. Pilot: #7 quit smoking** | the whole video on engine v9 (below) | the script sheet with three hooks; look sheets; a silent draft; then the voice quote; then the final with its scoreboard | 2 + owner time |
| **8. Skill pass** | Part 6 edits in the skill (written alongside each phase, finished here); `toons-target.md`; `HANDOFF.md` | the updated rules list in plain words | 0.5 |

Total: about 12-14 working days. During phases 1-6 nothing new is uploaded on the old pattern (decision 28).

### The pilot: "What Happens When You Quit Smoking" (topic bank #7)

Topic bank care note: "timeline figures need a source each". The facts below are **candidates only**: the research step
(`pipeline/research.mjs`) must find each on an allowed source (NHS quit-smoking pages, CDC, WHO) and copy the exact words into
`note`; any that cannot be sourced is cut. Format 6, shape `visit`, about 55 s of story.

| Time | Place (kind) | What happens | Notes |
|---|---|---|---|
| 0.0-1.0 s | Dad's balcony at night (room) | frame 0: Dad, eyes open, a cigarette in his hand; he snaps it in half, a crack sound; "Last one. Done!" (in the story) | person-first hook, comes at the lens; no tag, no number |
| 1.0-1.9 s | dive (inside the same shot) | the shared `Dive`, 0.9 s, into his chest | per-frame zoom 6% or less |
| 1.9-15 s | **chest stage** (body), held | grey lungs with tar patches (`tar` 0.8) cough (`cough`); "Done? Who's done?" "He QUIT smoking!" (topic by 3 s); the cleaner crew (cilia) asleep under tar; a "no" between two characters before the midpoint | one framing; place label "LUNGS" stays; 2.5 s tags for the crew (or their band) |
| 15-22 s | **vessel inside** (body), held | carbon monoxide eggs ride the red cells; "Get off my oxygen seats!" "Make us." A `FightCloud` | the intruder of this place |
| 22-23 s | **TimeCard** "8 HOURS LATER" | | candidate fact: carbon monoxide level falls (source needed) |
| 23-29 s | vessel inside, same framing | the CO eggs are gone, the cells pinker (`co` 0 over 0.6 s with `fill`), a silent beat with a pop sound | before/after in one framing |
| 29-30 s | **TimeCard** "3 DAYS LATER" | | candidate fact: breathing easier (source needed) |
| 30-38 s | chest stage, same framing as at 1.9 s | the bronchi widen (`airway`), the crew wakes and sweeps (`cilia`, `mucus` moves up); the lungs: "I can BREATHE!"; the lungs cough MORE: "Why am I coughing more?!" | if (and only if) a source says coughing can rise at first as the lungs clear; otherwise another gag |
| 38-39 s | cut | | |
| 39-55 s | **Dr. Mira's clinic** (room, unique to this video, pale) | Dad, a hand on his chest (symptom shown): "Doc, I quit. Why do I cough more?" Dr. Mira's answer block, about 50 words, slower and calmer: what is happening (condition named), the cause in plain words, one number at most, one action (for example: free stop-smoking help, which the source names), the care line | answer starts about 70%; one number plate at most |
| 55 s | end | the story ends on the answer (or Dad's short loop line) | then the end card per decision 25 |

- Cast (about 4 + doctor): Lungs (big, low voice is fine), the cilia crew (one leader speaks, high), Carbon Monoxide (small,
  high, villain), Dad (person), Dr. Mira. Each speaker 3 lines or more; pitches 3+ semitones apart in each scene. New voices are
  picked free from the library samples with earshot, then quoted.
- Picture budget: 3 body/room switches (room, body, room), 2 body places, 2 time cards, about 4 cuts a minute without cards,
  inside the body about 65% of the story, 1 flash 0, shakes 0, bursts 0-1, one `FightCloud`.
- Sound: a new funk track from the template (about 500 credits for 40-60 s), story sounds in the beats (crack, cough, pop,
  sweep), one planned stop on the snapped cigarette or the cough gag.
- Steps (owner rule "show before you build"): script sheet with 3 hook choices -> look sheets (chest and vessel stages in the
  pilot's states, the crew, CO, the clinic) -> a silent draft with the scoreboard -> the voice and music quote (balance before
  and after) -> voice -> the final render -> all checks and `toon:score` PASS -> the owner.
- Cost estimate: lines about 800-1,000 characters plus the card, so about 600-800 credits for voices (snake-bite took 789
  with the music) plus about 500 for music: **about 1,000-1,300 credits**, quoted exactly by the dry runs before anything is spent.
- **Proof it worked**: the scoreboard shows every Part 1 "Pass" met; the owner judges it against ref 02 (lungs) and ref 20
  side by side; after 7 days, its average view percentage against our last four (`publish/recent.py`).

---

## Part 8. "Even better than the reference": measurable ways to beat it

| # | Where we beat them | How we measure it | Target |
|---|---|---|---|
| 1 | **Medical truth.** Every fact from an allowed source with its exact words in `note`; the condition named; one action; a care line; no doses | `toon-check` (sources, `DOSING`, `BANNED_CLAIMS`, answer block S4) | 100% of facts sourced (refs: 0 sources) |
| 2 | **Clean sound.** No clipping, YouTube's own loudness | `toon:listen`: integrated LUFS, true peak, clipped samples | -14 +-1 LUFS, -1 dBTP, 0 clipped samples (refs -9.4 LUFS; ref 01 clips 90 times) |
| 3 | **Words you can follow.** Every word understood by a speech model | `toon:listen --words` against the script | 100% word match (we are there; keep it) |
| 4 | **Smoothness without pops.** 60 fps, eased actions | C4, C5 | 0 pops, 0 zoom jumps (refs animate on twos at 30 fps) |
| 5 | **People.** Real hands, real noses, a global cast, eye-lines that work, resting hands closed, the symptom visible | L10, L11, M5, L14; cast sheets | 100% of two-shot lines pass the gaze check |
| 6 | **A zero-defect frame.** Nothing on a face, no text on text, no half people, no wrong arrow | L1-L8 on every 0.1 s | 0 in every video (proven, not looked for) |
| 7 | **One channel look.** The first frames of the last 6 videos look like one family | C7 colour family on frame 0 of each video; a cover-row sheet | all 6 within the body colour band |
| 8 | **Stories that do not repeat.** Variety measured, not hoped for | a "too alike" report against the last 10 videos: shape, stages used, intruder, music BPM and key, first-frame colour | no two videos in a row share shape + stage + intruder |
| 9 | **A clearer payoff.** One "that's why" the viewer can repeat | S4; the description's first line is the answer | every video |
| 10 | **Captions you can read.** Crisp, key word in yellow, never on a face | L3 | 0 frames on a face |
| 11 | **A shorter tail than ours, a brand they lack.** The card at 5-6 s with Joey's line | S9 | under 12% of the video |
| 12 | **Faster making.** Stages reused across topics, less hand placement | lines of code in a video's own shot file | under 250 (now 430-640) |
| 13 | **Retention, the real test.** | `publish/recent.py` after 7 days: average view percentage | above our last four videos' average |

---

## Part 9. Risks, and what must NOT change

### What could make the rebuild worse

| Risk | Why it could happen | Guard |
|---|---|---|
| Too still: "flat", "no motion", "animation weak" again | the owner said it on 2026-11-17 and 2026-11-21; holding a frame 15 s can read as dead | the "not dead" rule (every 8 s+ shot has an action); one action every 3-5 s inside a hold; blinks and small organ moments (a pulse every 2-4 s); the owner approves the phase 4 motion test before any video |
| Teaching less | 3 facts instead of 10 on a health channel that grows by search | the answer block names the condition; the description lists the rest with sources; watch retention and comments |
| Looking like the references | organ stages, a doctor, a LATER card are their method | we take the method, never a character, joke, layout or title; our cast, our stages drawn from our kit; the owner's "follow the drawing language, not its drawings" rule stays |
| Breaking videos already out or their re-renders | kit changes reach every video | format 6 switches the new behaviour; old shot files untouched; `OUT` sets in tests; a still of each old video before and after phase 2 for comparison |
| The line fix does not work in Remotion's browser | CSS variables on SVG strokes under a CSS transform need a real test | one still at z 1 and z 2 first; the `InkCtx` fallback |
| The layout log misses something drawn | a piece that does not report is invisible to the checks | every new kit piece reports by default; the picture checks (C-series) look at the pixels as a second net; a test that fails when a shot has a face on screen (by pixel) with no face box reported |
| One music family makes every video sound alike | "every video looks same" (2026-11-17) | a new track every time, the topic's own colour in the prompt, key and BPM varied inside the family, logged in the "too alike" report |
| Louder music hides voices | +5 dB in the pauses | the owner's A/B first; the dip under words; A1 mix check; `toon:listen` word match |
| More sounds feel busy again | "too loud and poor sound" (2026-11-16) | 14 a minute only in pauses, never on words, 0.7 s apart, story sounds only, no comic sounds (no boing, no slide whistle) |
| A shorter end card loses follows | the card is the owner's brand piece | option C (alternate and compare) if he is unsure |
| The in-story hook loses search viewers | they typed the title | the topic word by 3.0 s; the three hook choices; retention decides |
| A big-bang rebuild stalls production | 12-14 days | phases, each with something to approve; decision 28 |

### What must NOT change (the owner's standing rules)

- Everything is drawn in code, in look v8: no stock art, no Adobe Animate rig, no Adobe rebuild, no AI-generated character sheets (all tried and rejected).
- One shared kit, one line, one eye; consistency across the whole cast is the main test; if one figure looks more polished, simplify it.
- Never mirror or squeeze a character to fake an angle; real views (`facing: 'left'`).
- People: a real nose in every view; hands one piece with the forearm; a hand lying on the body has its fingers together; hands never overlap hands; held props drawn behind the person.
- 1080 x 1920, 60 fps; hard cuts, no transitions; no flicker; no jiggle when talking (`talkSmooth`); no circle, halo or glow around a character.
- Name tags 2.5 s on non-human characters the first time (except decision 13's bands); no tags on people; icons only when the words say it.
- Every video's own clinic and home (rooms from a recipe, unique; the tidy wall, `ROOM_TIDY = 1`); no perspective box rooms, no bare rooms.
- A new music track for every video; Joey the same narrator on every end card; never cut or speed up the narrator; the story under 60 s.
- Medical accuracy: allowed sources only, exact wording in `note`, no doses, no "stop taking", no cure/miracle/detox.
- No caption track on Toons; no line in any description about how the videos are made; every upload private or scheduled, only on his word; AI-use answered Yes.
- Paid steps: one option, cost and balance before and after, `--approve` with a cap; the $5 Anthropic cap per video.
- Scripts run on macOS and Windows (`isMain`, `process.execPath`, `node:path`).
- Show before you build: sheets for looks, a slice for motion, approved separately.

### Directions the owner rejected (do not bring back)

- AI or hybrid art, stock art, the Adobe rig ("full code drawn only, I want full control").
- Thick heavy black lines and the boiling, wavy line ("animation like burning screen, very wavy").
- The v6 volume paint with gradients and gloss (the soft exceptions of decision 8 are three narrow cases, not a return to it).
- Busy sound: about 62 effects in 46 s, comic sounds, effects on moods and key words.
- One shared music bed for all videos.
- One template for every video: the same scene order, the clock and burger icons, "But here's the twist", text stickers to fill the 3-second rule, one stage reused for many videos.
- "First / second / third" counting.
- Circles, halos, rings or glow around characters; the old punch-in on key words; whip pans and crash zooms by default; zoom-through transitions.
- Bare or perspective rooms; a far-away diagram of an organ floating on a flat colour.
