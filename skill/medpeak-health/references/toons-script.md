# Writing a MedPeak Toons script

A Toon is one file, `videos/<slug>/toon.json`. Before a single credit is spent it must pass
`node pipeline/toon-check.mjs <slug>` (free, instant). The gate uses the same director as the
player (`src/toons/director.ts`), so what it measures is what gets rendered.

## Format 6: one story (`"format": 6`, engine v9, the owner, 2026-11-23)

The owner approved every recommendation of `plans/engine-upgrade-2026-11-23/05-blueprint.md` ("All 28 recommend and start
2 to 3 agents to fix and upgrade engine and everything i want proper as per report"). For every NEW script this section
replaces, from the older formats below: format 4's required macros and "a new picture every 6 s", format 5's "Never still",
"No time card", "Text on the picture is for a number", "Impacts take flash" and the 12-a-minute sound budget. Everything
else below still holds where this section says nothing. The older formats stay for the videos already out. The numbers a
format-6 Toon is measured against are in `toons-target.md`; the script checks S1-S12 run in `toon-check` (`toon-rules.mjs`).

**The shape.** One question and one answer. The problem happens in 2-4 body places for the first 55-75% of the story (the
organ in its real place, held, changing state), then the answer. About 55 s of story (50-60). Shape `visit` is the usual
one (about 7 videos in 10, decision 2): near the end the patient asks "Doc, why...?" in Dr. Mira's room and she answers;
`fight`, `clock`, `crew` stay for the rest, where the wisest body character gives the answer. At most 3 body/room switches,
inside the body 60%+ of the story, each body place held 8 s+ (S8).

**The fact budget (decision 1).** Every fact still has a source (allowed sources, exact words in `note`), but a story
carries at most **3 sourced facts**, at least 2 of them in the answer block (S2: warn at 4, fail over 6). Extra facts go to
the description with their sources. At most 4 speaking characters plus the doctor, each with 3 lines or more (S3).

**The hook (decision 3, kind `story`).** Frame 0 is the person and a real action with a sound hit (0.4-1.0 s before the
first word). The first line is said INSIDE the story: a character's reaction or demand about the intruder or the damage,
8 words or fewer, the first word at 0.3-1.2 s; the topic object is named by 3.0 s (not necessarily in line 1); a character
asks the story question by 6 s. "You" only between characters. The script sheet keeps three hook choices; one may be the
older "to the viewer" kind, and retention decides (S1 warns until two videos have compared).

**Retention 7 for Toons (decision 4; the long videos keep `retention-7.md` as written).** Point 2 (promise) is met by the
character's story question; point 4 ("3-sec change") becomes "one action, then a hold" (checks M2, C2: something enters the
held frame, then a hold of 1.5 s+); point 7 (loop) may also be met by ending on the person's own question or mid-line.

**Pace, pauses and beats (decision 5).** The same voices, faster delivery: body characters speed 1.12-1.2 (or a per-line
`tempo` up to 1.15 on clips we own), people 1.05-1.1, Dr. Mira 0.92-0.95 (S6: body lines 3.0-3.6 words a second, the doctor
0.3 slower). Air between lines 0.22 s; 0.5-0.8 s after a shock (`pause`), 0.6 s before the answer, 2-3 silent `beat`s of
1-2.5 s on picture actions. Talking 80-93% of the story; 3+ pauses of 0.5 s and 2+ of 1 s (S5). No "..." inside a line.

**Line style.** Short, fast demands and refusals between characters, real reactions (huh, whoa, ugh: 2+), one "no" before
the midpoint, a joke on the damage; 5-7.5 words a sentence; numbers said aloud: 1 at most; "study / trial / WHO" said at
most once, where honesty needs it (S7).

**The answer block (decision 2).** 3-6 lines marked `answer: true`, 35-60 words, by Dr. Mira (or the wisest body
character), starting at 55-80% of the story, slower and calmer: it names the condition (a title word or the `term`), the
cause in plain words, one action (take, drink, cut, keep, ask, wait, see, stop) or "that's why", every line sourced, the care
line last or second-last (S4). The description's first line is the answer.

**The picture is the story (decisions 9, 16).** The organ shows its state itself (contents, a liquid level, a cut window,
sores, dark patches): no gauges, meters, clocks or chips inside the body (S11); clocks only as real objects in a room; at
most ONE number plate a video (the answer's one number) and at most 2 texts on screen besides the caption and the watermark.
One real intruder (a cigarette, a probe, a pill) enters the body (S10). One framing per body shot, one punch-in a video.

**Time cards (decision 20).** `{"card": "3 DAYS LATER", "seconds": 1.0, "same": "B"}`: 0.8-1.2 s, black, one line, hard cut in
and out; `same` names the shot whose framing returns after it with the new state; at most 3 a video; the change it implies
is sourced (S12, C8).

**Impacts and sound (decisions 18, 22-24).** No `"fx": "flash"` by default: at most 1 flash, 1 shake and 2 bursts a video,
never near a face; a `FightCloud` for a fight. Story sounds only, in the pauses: 14 a minute at most, 0.7 s apart, never on a
word. Music: a new track every video from the funk family (the template in `toon-music.mjs`: playful funk, slap bass, light
percussion, 130-165 BPM, a brighter half from the answer, the topic's colour); the bed fuller in the pauses and dipping 3 dB
under words; at most 2 planned stops (`"stop": true` on an event), never on a word.

**The end card (decision 25, option A).** 5-6 s, a hard cut in, Joey says only the follow line (S9: 6 s and 12% of the
video at most).

**The order of work (format 6).** Topic -> research (each candidate fact on an allowed source, or cut) -> the script sheet
with three hook choices -> `toon-check` (S1-S12) -> look sheets (the stages in the video's states, the cast, the rooms) ->
a silent draft with its scoreboard (`node --import tsx pipeline/toon-score.mjs <slug> --file renders/toon-v8-draft.mp4`) ->
the owner's yes -> the voice and music quote (balance before and after) -> voice and music -> `toon-check` on the real
timings -> the final render (it runs the scoreboard) -> `npm run toon:look`, `toon-staging`, `toon-motion`, `toon-camera`,
`toon:sound`, `toon:listen --voices` -> **the scoreboard says PASS** -> the owner, with `renders/scoreboard.jpg`.

## Macros, the hero visual (`"format": 4`, owner, 2026-11-18; videos already out)
The owner: "macro shot is my hero visual: start (hook), mid and last". From format 4 every video has
**2 to 3 macro close-ups**: an extreme close-up drawn as its own detailed scene (set `macro`,
`src/toons/stage-macro.tsx`, drawings in `look-macro.tsx`). Checked by `toon:check`:
- **Macros:** 2 or 3 (back-to-back macro shots count as one).
- **Macro hook:** the first picture is a macro. It still has to open on the consequence (a dial at 0.5
  or more), so start the entry mid-way (rabies: `slide: 0.55`, the virus already sliding into the cut).
- **Macros spread:** one at the start, then the middle and/or the end (all three with three macros).
- **Macro views differ:** each macro is a new close-up (`state.view`).
- **View changes:** a new picture (a place, a card, or a cut to another size) every 6 s or less on
  average, none held over 7.5 s (aim for 4 to 6 s).
The macro stage's dials: `view` (0 entry, 1 inside, 2 caught), `slide` (entry: 0 in the drop, 1 deep in
the cut), `speed` (inside: how fast it rides; 0 stops it), `grip` (caught: 0 the catchers far out, 1
gripping). The hero is the stage character (`stage: true`): it talks, blinks, changes face. The views
are drawn for a virus that enters through a wound and climbs a nerve; a new topic draws its own views
in `look-macro.tsx` and adds them to `view`. One still of a new view goes to the owner first.
Preview: `npx remotion still src/index.ts ToonStage out.jpg --props='{"stage":"macro"}'`.

## Story shapes (`"format": 3`): things happen, labels stop (owner, 2026-11-17)
The owner on the first eight videos: "every video looks same, repeated template, icons and all, not
interesting". Measured: 7 of 8 had the same scene order, 116 text stickers, the clock and the burger
14 times each, "But here's the twist" in 8 of 8 (plans/skill-upgrade-2026-11-17.md). From format 3 a
script names its `"shape"` and the gate changes:

| Shape | What it is | Dr. Mira |
|---|---|---|
| `fight` | two sides battle inside the body | short, or not at all |
| `journey` | one thing travels through several places | at the end |
| `clock` | one place over time, the damage growing | no |
| `crew` | the organ's workers do a job and it goes wrong | no |
| `visit` | home, then the clinic (the old shape) | yes, 15 to 50% |

- **At most 5 text stickers** (`Few stickers`), and a sticker is no longer "something new": the
  3-second rule counts only what HAPPENS (a stage event, a thing arriving, a new place). A gag that
  has phases is written as its phases (the fight is three events: the rush, the cloud, the rout).
- **No picture icon twice** in a video (`No icon twice`).
- **Only the rooms the story needs**: no clinic and no doctor unless the shape is `visit`.
- **Every line names its source or is marked `"chat": true`**: with no doctor to carry the facts,
  the body characters do.
- **`"beat"` on a line**: up to 3 seconds of silence after it, so a gag can play with no words.
- The hook rules, the open question, the twist at 50 to 75%, best last and the loop stay.
The first one is `videos/skip-brushing-at-night` (the fight, on the tooth arena, no doctor, 3 stickers).

### The tooth arena (`"set": "molar"`, `src/toons/stage-arena.tsx`)
The top of a back tooth, wide, with a crew: four spit guards (their shields say SPIT), a gang of
five germs that look nothing alike, and the tooth's face below. Dials: `night`, `guards`, `sleep`
(they fall asleep one after another), `snack` and `sugar` (crumbs by day, dinner at bedtime), `fight`
(0 to 0.3 the rush, to 0.72 a dust cloud, to 1 the germs thrown out), `wash`, `party`, `acid` (cups
tip: a pond in the groove, runs down the shoulders), `chalk` (chalky patches beside the face), `brush`
(a giant brush ploughs everything off; the guards jump it), `shield`. One layout (`arenaLayout`)
places everything; the staging check and a test over 400 states read it. Board:
toons-boards/stage-arena.jpg. Put stickers top RIGHT (x about 740): the scene's label is top left.

## The shape of a Toons Short from video 4 on (`"format": 2`, about 45-50 seconds, 15 lines)
Owner, 2026-11-17: "remove 3 point, make better hook script". The three live videos opened on two
organs chatting ("Whoa! A pill? Where's the water?") and then counted "First, Second, Third". The
new shape opens on the damage, speaks to the viewer, and tells one story.

| Time | Part | Where | What happens |
|---|---|---|---|
| 0-3 s | **Hook, cold open** | body stage, already damaged | one line to the viewer: "you" + what happens to you. The first frame shows it |
| 3-7 s | **The open question** | body stage | one question that only the end answers ("Same lunch, no balloon. Want to know how?") |
| 7-22 s | **The story** | body stage | "Rewind!": the stage goes back to healthy, then one chain of cause and effect. No numbers |
| 22-26 s | Time card, the person feels it | card, home | |
| 26-40 s | Dr. Mira: why, then the twist | clinic | the twist starts between 50% and 75% |
| 40-47 s | **Best last = the answer** | clinic | the fix, with its number; it answers the open question |
| 47-50 s | Loop | body stage, done right | the last line repeats 3 or more key words of the hook |

The hook, checked by `toon-check` on every format-2 script:
- 8 words or fewer, and said within 2.5 seconds (7 words is safe before the voices exist);
- says "you" or "your" and names a consequence;
- says at least two of the title's words in the first line (a search viewer hears what they typed);
- the first scene is a body stage whose `state` starts with the damage (a dial at 0.5 or more);
- `"hooks"` lists **three choices** for the first line (`{"line", "why"}`), the script's own among
  them: the owner picks one from the script sheet before anything is voiced.
The open question (Retention 7 point 3 for Toons; it replaces the counting, with the owner's yes):
`retention.question` names a line that asks it by 7 s, `retention.answer` a line in the last quarter
that shares two or more key words with it. A format-2 script that says "first / second / third"
fails. In a room, a format-2 script's graphics stay on plain wall (not on the chart): `toon:staging`.
The first script in this shape is `videos/eating-too-fast`.

## The first shape (videos 1 to 3, about 45-55 seconds, 13 lines)
| Part | Where | Who | What happens |
|---|---|---|---|
| Hook | body set | a body character | the problem, shouted in-story. No greeting, no channel name |
| Reply | body set | a second character | the stake ("He swallowed me without water!") |
| Promise (by 8 s) | body set | either | "Three things happen next. Wait for the third!" |
| Number one, two, three | body set | both, alternating | the mechanism, one short beat each |
| The question | office | the patient | what the viewer is thinking |
| The answer | office | Dr. Mira | the mechanism in plain words |
| Twist (50-75%) | office | Dr. Mira | "But here's the twist: ..." the thing most people get wrong |
| The reaction | office | the patient | a short, surprised question |
| The advice | office | Dr. Mira | what to do |
| Best last (final quarter) | office | Dr. Mira | the least-known, most useful tip, with its number |
| Loop | office | the patient | repeats 3 or more key words of the hook |

Body characters carry about 40% of the time, Dr. Mira about 40%, the patient the rest.

## Retention 7 in dialogue (`retention` in toon.json)
The owner's seven points, with the line id that carries each one. The gate checks all seven.
1. **No intro**: line 1 is the hook itself.
2. **Promise**: a line that starts by 8 s and promises the payoff.
3. **Counting**: "Number one / Number two / Number three" (or first / second / third), said in order.
4. **3-sec change**: the director does it; the gate reports the longest picture (must be 3.0 s or less).
5. **Twist**: starts between 50% and 75%.
6. **Best last**: starts in the final quarter, after the twist.
7. **Loop**: the last line shares at least 3 key words with the first.

Real voices run about 20% faster than the estimate, and the gate re-checks with the real timing
after voicing. Leave a second of margin on the promise (aim for 7 s) and stay clear of the 50% and
75% edges.

## Format rules (checked)
- Under 60 s; at least 2 sets (a body scene and the office); at least 3 speaking characters.
- No line over 20 words; no more than 3 lines in a row by one speaker.
- Dr. Mira speaks for 15-50% of the video; body characters for 30% or more.
- Only characters with a voice in `toons-cast.json`, sets, poses, emotions, sounds, props and
  camera words that exist.

## Medical accuracy (checked)
- Sources live in `sources`: `id`, `label`, `url`, and a `note` that quotes the exact finding.
  Allowed: PubMed/NIH, WHO, CDC, NHS, NICE, ICMR and other government health bodies. Nothing else.
- Every line by Dr. Mira names its source in `src` (or is marked `"chat": true` when it states no
  fact). Every line with a number names its source. Body characters' factual lines carry `src` too.
- Read the source first, then write the line to match its wording. If the source is about one
  medicine, the line says so ("with some antibiotics, the NHS says...").
- No doses, no "stop taking", no cure / miracle / detox / guaranteed.
- `--check-urls` opens every link (PubMed records are checked through its data service).
- PubMed's website blocks scripts: read abstracts with
  `curl -sg "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&rettype=abstract&retmode=text"`.

## The file
```json
{"slug": "...", "title": "...", "music": "panic",
 "retention": {"noIntro": {"scene": "A1", "line": "..."}, "promise": {"scene": "A3", "line": "..."},
   "counting": {"scene": "A4,A5,A6", "line": "Number one / Number two / Number three"},
   "change3s": {"scene": "all", "line": "the director"}, "twist": {"scene": "B3", "line": "..."},
   "bestLast": {"scene": "B6", "line": "..."}, "loop": {"scene": "B7", "line": "..."}},
 "sources": [{"id": "nhs-x", "label": "NHS. Page title (reviewed date)", "url": "https://...", "note": "'exact quote'"}],
 "shots": [{"id": "A", "set": "throat",
   "cast": [{"who": "whitecell", "x": 350, "y": 700, "size": 720, "noLegs": true, "pose": "hips"}],
   "props": [{"kind": "glass", "x": 550, "y": 1010, "size": 250, "from": "B5", "halo": true}],
   "lines": [{"id": "A1", "who": "whitecell", "text": "...", "emotion": "angry", "pose": "point",
              "key": "here", "react": {"pill": "scared"}, "src": ["nhs-x"], "cam": "cu 85 push"}]}]}
```
- Staging that works: two characters at x 285 and 805 in the office (size about 1040); in body sets
  one large character at x about 340 and a smaller one at x about 780. People stand on the set's
  floor; floating body characters need `y`.
- Props (`src/toons/props.tsx`): glass, pillbottle, soda, candy, toothbrush, burger, pillow, clock.
  `from` / `to` = the line it appears on and leaves after; `halo` = a glowing disc behind it.
- The key word (`key`) is the caption shown in amber and gets a small punch-in.

## The steady style: show it, don't say it (pilot, 2026-11-16)
The first three scripts were mascots talking in a room while the camera cut every 2 seconds. The
20 reference Shorts do the opposite (toons-reference-study.md): the camera is locked, the organ is
the stage, and the viewer WATCHES the thing happen. A script switches to this style with
`"camera": "steady"`. The pilot is `videos/pill-without-water`.

- **One locked picture per place.** The director no longer cuts inside a scene. A cut happens when
  the place changes, or on a line that asks for its own picture with `cam` (use it once, if at all).
- **Stages** (`src/toons/stages.tsx`). A stage is an organ drawn as a cutaway that fills the frame,
  with its own face and hands on its wall. Cast members marked `"stage": true` are drawn by the
  stage (the organ itself, the thing stuck in it). The stages so far:

  | Set | Who the stage draws | Dials (0 to 1) | Board |
  |---|---|---|---|
  | `foodpipe` | foodpipe, pill | drop, stick, melt, sore, pain, water, slide | toons-boards/stage.jpg |
  | `tooth` | tooth, bacteria | sugar, feast, acid, hole, pain, saliva, mend, brush, shield, night | toons-boards/stage-tooth.jpg, stage-tooth-night.jpg |
  | `tummy` | stomach, foodpipe | food, full, tilt, valve, leak, burn, air, gum, pass, squeeze, burp | toons-boards/stage-tummy.jpg, stage-tummy-day1.jpg |

  What each dial does is written next to `STAGE_KEYS` in `src/toons/director.ts`. The stomach
  stage tips the whole organ over with `tilt` and keeps the juice level with the ground, so lying
  down is seen, not said; a small posture sign in the corner tips with it.
- **The stomach's newer dials (2026-11-17).** `gum`: a swallowed piece of gum comes down beside the
  wall and floats by the hands; it rests at 0 or 1. `pass`: what floats in the stomach moves on
  through the exit at the lower left. `squeeze`: an empty stomach's hunger squeeze travels to the
  exit, with sound rings outside the wall. `burp`: three bubbles of air go up the food pipe (open
  `valve` first; put tags at the top RIGHT, x about 800, because the bubbles rise on the left). The
  tooth's `night` darkens the mouth and shows a moon. `food` may rest at any value: a piece is
  there or not, and only falls while the dial is moving.
- **State and events.** `state` on a shot is where the stage's dials start. `events` move them:
  `{"at": "A5", "word": "melt", "set": {"melt": 0.62}, "over": 40, "sfx": "sizzle-acid"}` means
  "when A5 says *melt*, melt the pill to 62% over 40 frames, with a sizzle". `at` is a line id or
  `"start"`; `delay` (seconds) shifts it; `fx: "flash"` adds a soft white flash (use it twice a
  video at most). This is how the script shows the process.
- **Time cards.** A shot with `"card": "Later that night..."` (and `"seconds"`) is a plain card
  with no characters. One or two a video; it carries the story across time.
- **Graphics.** A prop appears on a word (`"from": "D1", "word": "stuck"`) and leaves after the
  line in `to`. `bubble` puts it in a thought bubble, `no` puts a red "not this" sign on it,
  `halo` a glowing disc behind it. `tag` is a few words on a sticker, `chip` a counting number;
  both need `text`. Explaining graphics: `pipe` (a pill stuck in the food pipe), `valve` (the
  stomach's valve open, acid coming up), `drop` (spit with minerals), `bed` (the head end raised),
  `pain`, plus the objects (glass, pillbottle, candy, toothbrush, burger, pillow, clock, soda). In the office the free space is above the heads (y 250-450) and between the
  bodies below the waist (x 450-650, y 1100-1300).
- **Story with a consequence.** Body scene (the thing happens) -> a promise of what it will cost
  -> time card -> the person at home feels it -> Dr. Mira explains and gives the fix -> the body
  scene again, this time done right. The last scene mirrors the first (that is the loop).
- **Captions** are smaller, white with a dark outline, no box, key word in amber.

### Graphics never cover a face (owner, 2026-11-16)
- A **thought bubble** names its owner and places itself: `{"kind": "pipe", "bubble": true,
  "of": "doctor", "size": 300, "from": "D1", "word": "stuck", "to": "D1"}` (no x, y). It goes above
  the owner's head, toward the middle, tail toward them.
- A mark that is **meant** to sit on something says so: `"on": "patient"` (a pain star on a chest
  or a cheek), `"on": "bubble"` with `dx`, `dy` (a mark on the picture inside the bubble before it;
  it follows the bubble).
- In a scene with a bubble the people stand a little smaller (doctor 940, patient 900, kid 980) so
  there is air above their heads; a bubble is size 300.
- Everything else keeps its x, y, and `npm run toon:staging -- <slug>` fails the script if a
  graphic covers more than 4% of any head, leaves the picture, reaches above y 110, sits on
  another graphic that is on screen at the same time, or reaches down onto the caption line
  (the caption starts at y 1460: keep a graphic's lower edge above it).
- On a body stage a face has a room of its own: nothing of the stage's contents (liquid, food,
  bubbles) comes inside it, and a sign or meter is drawn only when the story needs it. `toon:staging`
  measures the stomach stage frame by frame ("on a body stage's face"); a new stage is built on a
  layout function the check can read (`stageThings` in `stages.tsx`).
- The same check measures the room: it fails when a wall chart, clock or picture is more than 15%
  behind a head, or when a person half hides a small thing of the room (toons-rooms.md); it lists
  the small things the room left out because no clear place was free. A graphic may cover what hangs on the wall.

### Sound: a calm mix (owner, 2026-11-16: "too loud and poor sound, don't match my style")
The channel's own best videos, measured: steady narration over a constant music bed, almost no
sound effects. So a Toon has **only the story sounds the script asks for**: `"sfx"` on a stage
event (a plop when the pill lands, a sizzle when the acid burns, a splash for the water), six to
eight a video. The player adds nothing on its own except a soft whoosh for a new place.
- No sound for a mood, a key word, a graphic popping in, or a joke (no boing, no slide whistle).
- Never two sounds within 0.7 s; at most 12 a minute; the same story sound at most 3 times.
- Levels are set in one place (`SOUND` in director.ts): an effect sits about 13 LU under the voice,
  the music about 8.5 LU under and steady.
- `npm run toon:sound -- <slug>` counts and, once the voices exist, builds the three layers and
  measures them. `--list` prints every sound with its time and reason.
- **The bed never goes quiet, and it is the playful one.** `"music"` is `panic`: the owner heard the
  same video over both steady beds, first said "Calm", listened again and settled on playful
  ("playful much better", 2026-11-17). `doctor` (calm) is the other bed with no rest inside its
  loop; use it only if the owner asks for it. A track that stops and starts leaves holes where the whole sound
  nearly stops; moving its rests under words did not hide them (tried, heard by earshot). The
  sound check fails any other bed ("A steady bed"); a new bed is scanned first (`npm run toon:music:scan`).
- A sound never sits on a spoken word: it cannot be heard there and must not be turned up. Put it
  in a pause or leave it out (`toon:listen` shows a sound that is lost).
- The scene-change sound is `whoosh-air` (a soft, slow whoosh made in code). `whoosh-soft` is not
  used: it measures as a low thump.

### Rooms of its own
Every steady script has a scene in its own clinic and a scene in its own home: `"set": "clinic"`,
`"set": "home"`, an `"episode"` number and a `"rooms"` recipe (toons-rooms.md). The gate checks
**Own rooms** and **Rooms are unique**.

### A new stage (one per organ)
1. Read the sources first and list only what they say happens; the stage may show nothing more
   (the tooth stage shows a white spot, a hole and an ache because NIDCR says so; it does not show
   the hole reaching the nerve, because neither page says that).
2. Draw the organ in `stages.tsx` as a cutaway in world pixels (1080 x 1920) with gradients and
   thin `FLESH` outlines, its face with `Face` inside `Scaled`, and one block per dial. Anything
   that depends on the state and has an id (`clipPath`, a gradient) gets a `useId()` suffix: a
   board shows six copies of the stage at once and plain ids collide.
3. Add the set to `SET_NAMES`, its dials to `STAGE_KEYS`, the faces to `STAGE_SPOTS`, the stage
   to `SETS` / `FLOORS` / `SET_LIFE` (scenes.tsx) and six moments to `STAGE_BOARDS` (Preview.tsx).
4. Render the board (`node pipeline/toon-sheets.mjs --boards`) and one moment at full size
   (`npx remotion still src/index.ts ToonStage out.jpg --props='{"stage":"tummy","cell":3}'`).

### Acting between lines
A gesture (wave, point, panic, thumb, shrug, explain, present, cheer, facepalm) is let go a moment
after the line that made it, and the character returns to the pose given in the scene's `cast`.
Held poses (rest, think, heart, hips, crossed, belly, fists) stay until that character's next
line. So give `cast` the pose the character should rest in, and give lines the gestures.

### Retention 7, point 4 in a steady script
"A change every 3 seconds" is counted as **something new appearing in the picture**: a new place
or card, a cut, a prop or graphic, a change of the stage. Mouths, captions and acting do not count.
The gate lists every change and fails the script if the longest wait is over 3.0 s
(`longestStill` in director.ts). Write the events and props first, then check: a line with nothing
new in it is a line where the story is only being told.

## Order of work
1. Pick the topic; find 2-3 allowed sources; copy the exact findings into `sources`.
2. Give the video the next `episode` number and choose its clinic and home (toons-rooms.md).
3. Fill the Retention 7 table, then write the lines, the stage events and the graphics to it.
4. `node pipeline/toon-check.mjs <slug> --sheet --check-urls` until everything passes (script,
   Retention 7, format, own and unique rooms, medical accuracy). `--sheet` writes
   `videos/<slug>/SCRIPT.md`.
5. The four measured checks, all required before anything is shown:
   `npm run toon:camera -- <slug>` (no wrong picture, jump cut or jolt),
   `npm run toon:motion -- <slug>` (no foot slide, leg or arm jump, pop; people and organ hands),
   `npm run toon:staging -- <slug>` (no graphic on a face, out of the picture, on another or on
   the caption line; nothing on a wall behind a head) and
   `npm run toon:sound -- <slug>` (few sounds, kept apart, under the voice).
   After voicing run `npm run toon:listen -- <slug> --words` (what each line says, against the
   script) and after a render with sound `npm run toon:listen -- <slug>` and `-- <slug> --voices`
   (toons-listening.md). Fix what they show, then tell the owner what was heard.
   After every render also `npm run toon:look -- <slug>` (toons-look.md): the picture measured
   against the reference (holds still but alive, bold outlines, line detail, brightness). Do not ask the
   owner to judge what these three can measure.
6. Render the rooms board (toons-rooms.md) and `node pipeline/toon-render.mjs <slug> --draft --silent`
   for a free picture-only preview. Look at frames from every scene yourself first.
7. Show the owner the rooms board, the script sheet and the preview, quote the voice cost
   (`toon-voice.mjs <slug> --dry-run`), wait for approval.
8. After voicing, run steps 4 and 5 again on the real timings before the final render.
9. `node pipeline/toon-package.mjs <slug>` writes the upload package (free, uploads nothing).

## The upload package (`package` in toon.json)
```json
"package": {
  "title": "What Sugar Does to Your Teeth (and How Spit Fights Back)",
  "phrase": "what sugar does to your teeth",
  "opener": "What sugar does to your teeth: mouth bacteria turn it into acid, ...",
  "question": "How many times a day do you snack on something sweet?",
  "tags": ["what sugar does to your teeth", "how cavities form", "..."],
  "hashtags": "#teeth #sugar #shorts",
  "cover": {"at": 16.4, "text": "Sugar on your teeth", "accent": "sugar"}
}
```
- **Title:** starts with the search phrase people really type. Check it against YouTube's own
  suggestions before settling (the three first titles were chosen that way); 70 characters at
  most, no ALL CAPS words, no emojis, no hashtags.
- **Opener:** two or three sentences that begin with the search phrase and say what the cartoon
  shows and what Dr. Mira advises. Only what the script's sources support.
- **Question:** one specific question about the viewer's own habit (also the pinned comment).
- **Hashtags:** exactly three, one of them `#shorts`.
- **Cover:** `at` = the second of the video that shows the problem at its clearest (the pill stuck
  with the "no water" sign, acid on the tooth, acid in the food pipe); `text` = three or four
  words; `accent` = the word shown in amber.

It writes `videos/<slug>/package/toon.json` (what `publish/upload.py <slug> toon` reads),
`upload.md` (the
same for a person, with a checklist) and `renders/toon-cover.jpg`. The description lists the
sources, the subscribe line, the question and the disclaimer. It says nothing about how the video
is made: the owner does not want a line about code or AI voices in a description (2026-11-16:
"i dont want to give this reveal"). Uploads stay private, not made for kids, with YouTube's "AI use"
question answered Yes (SKILL.md rule 4), and only happen after the owner's yes.

## The first three scripts (all in the steady style since 2026-11-16)
| Script | Stage | Story |
|---|---|---|
| `pill-without-water` (voiced) | foodpipe | the pill sticks, melts and burns; that night his chest burns; water is the ride |
| `sugar-attack-on-teeth` | tooth | the germs eat the sugar, spit acid, a hole opens; many snacks later a cavity; spit, fewer snacks, a brush and fluoride |
| `lying-down-after-dinner` | tummy | a huge dinner, he lies down, the stomach tips, acid climbs the food pipe; wait 3 to 4 hours, raise the bed head |

Each one: body stage -> time card -> the person -> Dr. Mira -> the same stage, done right.
Estimated length is about 15% longer than the voiced length (the body voices speak fast), so run
`toon-check` again after voicing: a quiet stretch or the twist's position can move.

## Format 5: engage (owner, 2026-11-18; videos already out, replaced for new scripts by Format 6 above)

The owner's notes on rabies: weak hook, text that does not match the voice, nothing moves, one word
captions with no box. `"format": 5` adds these rules to format 4. `toon:check` measures all of them.

- **The hook hits at once.** Something big moves within 0.5 s (start an event at `"start"` in the first
  scene; the macro stage has the dial `snap`: a dog's jaws shut across the frame and open again). The
  first line is said in 2 s or less. In the first 3 s the picture is never still for more than 1 s.
- **Never still.** No stretch over 2 s without a cut, a camera move, a stage event or a new thing.
  Talking mouths and arm beats do not count. Give a line a moving camera with `"cam"` (for example
  `"mcu push"`), or add an event on a spoken word. Two pictures of the same size in a row are a jump
  cut (`toon:camera` fails): add an event instead of a camera word there.
- **Text on the picture says what the voice says.** A `tag` or `chip` uses only words of its own line
  (a spoken number may be written in digits: "15 minutes" for "fifteen minutes"), appears on its first
  spoken word (`"word"`), leaves when the line ends (`"to"` = `"from"`) and has no `"rot"`.
- **Captions** (`STYLE.caption: 'box'`): 2 to 3 words at a time, white bold on a rounded black box at
  60%, the key word in yellow. `'word'` brings the one-word caption back.
- **Captions are 20% smaller** than the first boxed version (59 px; owner, 2026-11-18).
- **Text stands on a grid:** a tag's `x` is 300 (left), 540 (middle) or 780 (right). The hook may show
  one tag with the words of the first line.
- **Music of its own.** `"music"` is the video's own slug and `"musicPrompt"` (40+ characters) describes
  the track. Quote it with `node pipeline/toon-music.mjs --slug <slug> --dry-run`, make it after the
  owner's yes with `--approve --max-credits N` (about 500 credits for 40 s), then `npm run toon:music:scan`.
  A shared bed fails the check, so no two format-5 videos can have the same music.
- **The arm:** the dog lunges well into the frame and snaps (it only peeked in before); the virus is
  drawn 1.15 times bigger (more reaches the caption line).
- **People** lean back hard and squash on a fright (`STYLE.bodyReact`, 0.4). Their feet stay planted:
  a jump, or a stronger reaction, fails the motion check (leg jumps, elbow pops).
- **Look at every frame before the owner does** (2026-11-18: the checks passed a video with text cut off
  by the frame, text said twice, and a hook nobody could read). After a render, make contact sheets at
  2 frames a second and read them all: `ffmpeg -i toon.mp4 -vf "fps=2,scale=360:-1,tile=6x2" s%02d.jpg`.
- **The hook holds.** A hit shorter than about a second is a flicker. On the macro stage the dog bites
  with `snap` 0.5 on the first frame, stays for the first sentence, and lets go (`snap` 1) on the next.
  The virus is `angry` (the evil face) in the hook, never smiling.
- **No time card** in format 5.
- **Text on the picture is for a number** ("15 minutes", "2-3 months"), in digits, at y 240 to 1300. The
  caption already shows every word; a tag that repeats it fails the check. Text is drawn on the screen,
  not in the scene, so the camera cannot cut it off.
- **Feet clear of the caption:** in a room, give each person `"y": 1440 - 0.48 * size`.- **Camera words used on rabies:** `ews whip` into the middle macro, `ms crash` on the key line at
  home, `push` on the doctor's lines and the last macro. Impacts take `"fx": "flash"` on their event.
