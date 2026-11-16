# Writing a MedPeak Toons script

A Toon is one file, `videos/<slug>/toon.json`. Before a single credit is spent it must pass
`node pipeline/toon-check.mjs <slug>` (free, instant). The gate uses the same director as the
player (`src/toons/director.ts`), so what it measures is what gets rendered.

## The shape of a Toons Short (about 45-55 seconds, 13 lines)
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
{"slug": "...", "title": "...", "music": "doctor",
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
  | `tooth` | tooth, bacteria | sugar, feast, acid, hole, pain, saliva, mend, brush, shield | toons-boards/stage-tooth.jpg |
  | `tummy` | stomach, foodpipe | food, full, tilt, valve, leak, burn | toons-boards/stage-tummy.jpg |

  What each dial does is written next to `STAGE_KEYS` in `src/toons/director.ts`. The stomach
  stage tips the whole organ over with `tilt` and keeps the juice level with the ground, so lying
  down is seen, not said; a small posture sign in the corner tips with it.
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
- The same check measures the room: it fails when a wall chart, clock or picture is more than 15%
  behind a head (toons-rooms.md). A graphic may cover what hangs on the wall.

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
- **The bed never goes quiet, and it is the calm one.** `"music"` is `doctor`: the owner heard the
  same video over both steady beds and chose "Calm" (2026-11-17). `panic` (playful) is the other
  bed with no rest inside its loop; use it only if the owner asks for it. A track that stops and starts leaves holes where the whole sound
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
   After a render with sound also `npm run toon:listen -- <slug>` (toons-listening.md): it reads the
   finished file's sound and draws a sheet to look at. Fix what it shows before the owner listens.
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
`captions.srt` (the real spoken words and times, for YouTube Studio > Subtitles), `upload.md` (the
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
