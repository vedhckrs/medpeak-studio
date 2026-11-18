# Handoff log

Two Claude accounts work on this repo, on two machines, one at a time. This file is how one session
tells the next what happened. Newest entry on top. Read the top entry before you start; add one before
you stop. The rules are in `CLAUDE.md`.

---

## 2026-11-18 (day) - Windows PC (commits by VED) - branch `feat/toons-engage`

The owner showed the Mac session's fix plan for rabies (weak hook, same music, one-word captions, text
against the voice, nothing moves) and said the Mac is not working on it: "you start work". Nothing of
that plan had been pushed from the Mac. If the Mac has unpushed work on it, this branch replaces it.

Changed (branch cut from `feat/toons` at `b7f894b`):
- `pipeline/lib/toon-rules.mjs`: format 5 "engage": hook said in 2 s, movement within 0.5 s, no still
  over 1 s in the first 3 s, no still over 2 s anywhere (`motionSpans`, `longestGap`), and "Text says
  what is spoken" for tags and chips. Older formats are not touched.
- `src/toons/stage-macro.tsx`: dial `snap` (a dog's jaws shut across the frame). `director.ts`: the
  dial is registered; the caption box is wider (110 to 970).
- `src/toons/scenes.tsx`, `Player.tsx`, `style.ts`: `STYLE.caption: 'box'`, 2 to 3 words on a black box.
- `videos/rabies/toon.json`: format 5. New hook "You get rabies. Time runs out." (A1), new last line
  "One bite, but you did not get rabies. The vaccine came in time!" (E3, loops to the hook), the bite
  on frame 0, tags fixed ("or just 1 week!" removed, "same day" is now "today", "act in time" appears
  on "act", no tilts), camera pushes on D1, D2, D3 and E3, more events in B2.
- `videos/rabies/toon-timings.json`: the timings of A1 and E3 are removed (their words changed).
- Skill: `toons-script.md` has a "Format 5: engage" section.

Run (Windows 11, Node 24.22.1): typecheck passes, 44 tests pass, rabies passes toon:check, camera,
motion, staging and sound. Eight silent stills were rendered and looked at (jaws, boxed captions).

Second pass the same day (owner: "first build all, don't miss anything, captions 20% smaller"):
captions at 59 px; a hook tag "time runs out"; tags on a grid (x 300, 540, 780); format 5 needs
`"music"` = the slug plus a `"musicPrompt"`, and `toon-music.mjs --slug <slug>` makes that track
(rabies has the prompt; the track is NOT made); the dog lunges into the frame; the virus on the arm is
1.15 times bigger; `STYLE.bodyReact` 0.4; whip into the middle macro, crash zoom on C2, flashes on the
nip and the wall hit. Three tests in `toons.test.mjs` now accept a video's own track before it is made.
Tried and dropped because checks failed: people jumping (200 leg jumps), `bodyReact` 1 (elbow pops in
another video), a virus 1.35 times bigger (its face reached the caption line).
All 9 Toon scripts pass toon:check; rabies passes camera, motion, staging and sound; 44 tests pass.
Third pass the same day (owner: "Yes, 800 cap" for voice and music):
- Voice: all 14 lines voiced on the Windows PC, 287 credits (13 for a first test of A1, 274 for the
  set; the real rate is about 0.43 credits a character, the dry run's "620" is an upper bound).
- Music: `assets/toons-music/rabies.mp3` and its shape, made from `musicPrompt`, **550 credits**. The
  script was capped at 513 but measures the cost only after the track is made, so the total is 837,
  **37 over the owner's 800 cap**. The owner has been told.
- `pipeline/lib/toon-audio.mjs`: the loudness probe ran `sh -c ...`, which does not exist on Windows;
  it now calls ffmpeg directly.
- Rendered `videos/rabies/renders/toon.mp4` (45.0 s, 1080x1920, peak -1.0 dBFS; on the Windows PC only).
- Checks on the real timings: toon:check (hook said in 1.9 s, longest still 1.9 s), camera, motion,
  staging, sound (music 9.0 LU under the voice, no hole) all pass; 44 tests pass.
- NOT run: `toon:listen` and `toon:look` (earshot is not installed on the Windows PC), so nobody has
  checked the spoken words or the look numbers of this render. Not packaged, not uploaded.
The "Not done" paragraph below is from the first pass; voice, music and the render are now done.
Fourth pass the same day (owner, after watching: "check each frame... text overlap... not a viral hook"):
every frame of the render was looked at (contact sheets, 2 a second). Found and fixed:
- Hook: the jaws lasted 0.3 s and were two pink bars. `stage-macro.tsx` now draws a whole snarling dog
  (eyes, brows, nose, fur) that bites on frame 0 and holds for "You get rabies." (about 1 s), then lets
  go on "Time". New macro face `evil` (emotion `angry`): slanted brows, a grin full of teeth.
- The "That morning..." time card is cut (1.2 s of dark screen right after the hook). A test now
  allows a format-5 script without a card.
- Text: tags and chips are drawn on the SCREEN after the camera (`Player.tsx`), so a zoom cannot cut
  them off ("15 MINUTES" and "ACT IN TIME" were cut). A text on the picture must hold a number in
  digits and sit at y 240 to 1300 (rules): "time runs out", "today" and "act in time" repeated the
  caption and are gone. Caption groups no longer end on a joining word ("ME BEFORE THE" / "BRAIN?").
- Overlaps: the people in the home and clinic stand 60 px further back (`"y"` on the cast), so their
  feet clear the caption; the lower defender cells in the caught macro moved clear of it; the alarm
  clock (half out of the boy's close shot) is removed.
- Arm: the dog has an open snarling mouth with fangs and an angry eye; the scratch is 1.9 times
  bigger; "TO THE BRAIN" shows only while the virus climbs.
Re-rendered (43.8 s). All checks and 44 tests pass. No credits spent in this pass.
Known and NOT fixed: in close shots the caption still lies over a body (legs, coat); the doctor's close
shot (D2) holds about 5 s with one pose; the nerve macro (M2) is one picture for about 4 s; the virus
on the arm is still small. `toon:listen` and `toon:look` still not run (no earshot on the Windows PC).
Fifth pass the same day (owner: "the speak of virus not proper", "more detail macroscopic level", "animation
of nerve and animations"). All in `src/toons/look-macro.tsx` unless said; no credits spent:
- Talking: the macro virus has a real mouth while it speaks (opens with `talk`: dark inside, upper teeth,
  a tongue when wide). Before, the evil grin stayed shut and the other faces showed a black oval.
- Detail: skin cells have a dark nucleus core, an inner wall and small bodies; the cut has torn edges and
  red cells drifting in; the saliva has rising bubbles and two more tumbling viruses; defender cells have
  a lobed core and grains.
- Nerve close-up (`MacroInside`) runs on the real clock, not in beats: a bright signal band races up the
  fibre, charged specks flick at the gaps between sheath segments, the sheath shows its wound layers,
  bean-shaped power stations and packets ride the tracks, and the virus walks on two feet.
- `stage-arm.tsx`: a nerve signal every 1.8 s (it was every 5 s), with a yellow core.
This goes against the Mac's look rule "the body lives in moments" (63% of reference frames are still):
the owner asked for more animation. `toon:look` has NOT been run on this render (no earshot here) and
may now fail its "still" share; if it does, that rule needs the owner's decision, not a silent revert.
All other checks and 44 tests pass. Re-rendered (43.8 s).
Not done: A1 and E3 are not voiced, and no voice file of rabies is on the Windows PC, so no render with
sound, no listening checks and no look check were run. No music was made (per-video music is not
built). The bigger animation items of the plan (the bite as an event on the arm, a bigger virus,
whole-body reactions of the people) are not built. The other 8 videos are still format 3 or 4.
The file was rewritten by a script, so `toon-timings.json` shows many changed lines (indent only).

Next: the owner's yes on credits for voice and music; then render, listen, look check; then upload.
## 2026-11-18 - Mac - branch `feat/toons`

The owner asked for a new virus voice and "macro shot is my hero visual: start (hook), mid and last",
more animation and more view changes. Then: "Voice C and Start Macros".

Changed:
- Virus voice: Charlie (`IKne3meq5aSn9XLyUdCD`), pitch 3, speed 1.08 (audition C), in `toons-cast.json`.
- New stage `macro` (`src/toons/stage-macro.tsx`; drawings in `look-macro.tsx`): dials `view` (0 entry,
  1 inside, 2 caught), `slide`, `speed`, `grip`; the hero virus talks and blinks. Registered in
  director/scenes/stages/Preview. Board: `npx remotion still src/index.ts ToonStage out.jpg --props='{"stage":"macro"}'`.
- Macro motion runs in beats (`burst` in `look-macro.tsx`): it failed the look check while it moved every frame.
- Format 4 in `toon-rules.mjs`: 2-3 macros, the first picture a macro, spread start/middle/end, each a
  new view, a new picture every 6 s on average and none over 7.5 s. Written into `toons-script.md` and `toons-look.md`.
- The sound planner now keeps the per-minute budget itself (drops cuts, then the most crowded place whoosh).
- Rabies rewritten to format 4: entry macro (hook), arm, inside macro (B3), home (C3 now a closer cut),
  clinic, arm wall, caught macro (E3). B1 now says "stray dog" ("street" was heard as "straight").

Run: npm test 44/44; toon:check, camera, motion, staging, sound, listen --voices, listen --words (all 14
lines heard right), look (45% still, 53% small movement) all pass. Rendered and packaged; NOT uploaded.
Spent 150 ElevenLabs credits (virus re-voice in voice C, 133 + B1 17), within the approved cap of 160.

Open: rabies upload waits for the owner's yes (private only). The look check's "still" is at the 45% edge.
Other stages are still in the old look. Next topics need their own macro views drawn (one still first).

## 2026-11-17 (late night) - Mac - branch `feat/toons`

The owner rejected the first rabies preview ("cheap poor worst"), had every frame of the 20 reference
Shorts studied, approved ONE look sheet ("Yes, this look"), then said the body view had no motion and
looked flat, and asked to "upgrade skill now".

### What changed
- `plans/reference-deep-study-2026-11-17.md`: 36,308 reference frames measured (motion, cuts, lines,
  outlines, brightness) and the plan. Data and script in `plans/data/`.
- The ink look in `src/toons/style.ts` (old values in brackets): one dark ink outline colour, bolder
  lines, ring eyes with no shine, `breathe` 0, `roomLife` 0, `talkBeat` 0.3, `captionPop` false.
  Stickers (`tag`) draw as white chart labels.
- `src/toons/look-ink.tsx`: `Tissue` (cel light and shadow, depth band, lining, wet shine), `InkEyes`,
  `Label`, and the look sheet still `ToonInkLook`.
- `src/toons/stage-arm.tsx` rebuilt in the look, alive in moments (heartbeat, muscle, nerve signal),
  a creeping virus with dizzy stars, marching defenders. New dial `dizzy`.
- `npm run toon:look` (`pipeline/toon-look.mjs`, `pipeline/lib/toon_look.py`, earshot's Python):
  every frame measured against the reference. The staging check now also fails a body stage's face on
  the caption line.
- `videos/rabies`: topic 1 of the topic bank (taken), format 3, WHO and CDC sources.
- Skill: `references/toons-look.md` (the look and motion rules), `toons-script.md` (order of work).

### What was run
- Every script passes `toon-check`; rabies passes camera, motion, staging, sound and the new look
  check (51% still, 48% small motion, edges 11%, near-black 3.8%, brightness 156). 44 tests pass.
- Not run: voices for rabies (quoted about 245 credits, not approved); the stomach, tooth, food-pipe
  and tooth-arena stages are not in the new look; people keep blush and glasses shine.

### Next
- The owner judges the arm test clips; then voices for rabies on his yes.
- Bring the other stages and the people's faces into the look, one board at a time.

---

## 2026-11-17 (night) - Windows PC (commits by VED) - branch `feat/toons-cast-3d`

The owner looked at the Toons cast and said it does not look good: he wants it cleaner, cuter, more
polished, without glare, bokeh and other unnecessary things, "pure 3D like the Dr. Healthcare channel"
(youtube.com/@Dr_Healthcare1/shorts). **No look has been approved yet.** This entry is on the branch
only, not on `main`.

### How it reaches `feat/toons`: pull request #5

The owner asked for a pull request from this branch into `feat/toons` (github.com/vedhckrs/medpeak-studio/pull/5).
If this text is on `feat/toons`, it has been merged. If it is not, read the pull request before any
Toons work: after the merge every Toon looks and acts differently (see "Open" below). Whoever works
on the Mac decides with the owner when to merge it; a test merge shows no conflicts as long as
`feat/toons` is still at `c33e97d`.

### What this branch is

`feat/toons-cast-3d` was cut from `origin/feat/toons` at `c33e97d`. `feat/toons` itself was not touched.

1. `cee6d8e` merge of `main` into it. The one conflict (`pipeline/render.mjs`) is resolved: both sides
   kept. The Remotion launcher moved into `pipeline/lib/util.mjs` as `remotion()`.
2. `519dbc0` the Toons scripts run on Windows: `isMain()` in `toon-check`, `toon-music`, `toon-sfx`;
   `remotion()` instead of `npx` in `toon-sheets`, `toon-render`, `toon-package`.
3. The last commit is a **proposal, not a decision**: a clean look in `src/toons/style.ts`
   (gloss 0, texture 0, edge 0, rim 0.2, grain 0, blush 0.45; old values are in the comments) and two
   lines in `src/toons/ink.tsx` so arm and vein highlights follow `STYLE.gloss`.

Commits 1 and 2 finish "next step" 1 and 2 of the entries below. The Mac can take them into
`feat/toons` with `git merge 519dbc0` (that leaves the style proposal out).

### What was run (Windows 11, Node 24.22.1)

- `npm run typecheck`: pass. `npm test`: 44 of 44 pass.
- `ToonCast` and `ToonSheet` (stomach) rendered before and after the proposal. The pictures are in
  `out/toons/sheets/` on the Windows PC (not in git): `cast-before-after.jpg`, `stomach-before-after.jpg`.
- Not run: any Toon video render, voice, sound or listening step. The boards in
  `skill/medpeak-health/references/toons-boards/` were not re-rendered.

### What was found

- The reference channel calls itself "2D animated" and it is: flat colour, thin clean outlines, real
  anatomy in place, two plain round eyes, no arms or hands on organs, plain backgrounds. It is not 3D.
- Our glare is `STYLE.gloss` (streaks on bodies, arms, veins), the speckle is `STYLE.texture`, the paper
  noise is `STYLE.grain`. The "bokeh" is the lens blur in `src/toons/camera.tsx` (`LENSES` bg/fg), the
  blurred foreground layer and drifting specks in `scenes.tsx`, and lamp glow and halos. Those are not
  switched off yet.
- True 3D cannot be drawn by this SVG engine. It would need AI-made 3D-style pictures or real 3D models,
  which changes the pipeline and costs credits per video.

### The owner's decision: clean 2D like the reference

He picked (a) clean 2D in the current engine, over a soft "3D-feel" shading and true 3D. Our characters
stay our own designs; only the kind of look follows the reference.

What is built for it, in the commit "feat(toons): clean 2D look, stomach redrawn":

- `src/toons/style.ts`: `eye: 'dot'` (plain white eye, dark pupil, one small catchlight; `'iris'` brings
  the v6 eye back), `organArms: false` (no arms or hands on the organ family), one flat shadow step
  (`shadowDeep` = `shadow`), weaker form and top light, bigger eyes and pupils, blush 0.3.
- `src/toons/rig.tsx`: the dot eye. `src/toons/blueprint.tsx`: organs skip their arms when
  `organArms` is false. `src/toons/Preview.tsx`: the model sheet says so and hides the hands row.
- `src/toons/characters.tsx`: the stomach is redrawn (real shape, four fold lines, pylorus ring, no
  vessels).

Then the owner said yes to the stomach and "do all 24". Commit "feat(toons): whole cast in the clean
2D look":

- `style.ts`: `organArms` became `bodyLimbs: false` (no arms, hands or legs on **any** body character:
  organs, cells, germs, pill, bone, poop; people keep theirs) and `accessories: false` (no guard cap on
  the white cell, no medic helmet on the platelet, no bow or lashes on the egg).
- `characters.tsx`: every glint, squiggly inner vessel, heart fat patch, bone speck and white dot is
  now behind `GLINT` (`STYLE.gloss > 0`); costume pieces behind `DRESS`; the pill, white cell and
  platelet stand on their body when they have no legs (`ground.y`). Real anatomy stays: liver lobes and
  ligament, gallbladder, kidney hilum with artery, vein and ureter, adrenal gland, lung airways, the two
  coronary arteries, brain folds, white-cell nucleus, virus spikes, bacteria pili and flagellum.
- `ink.tsx`: the light edge of `Groove` follows `STYLE.gloss`. `humans.tsx`: hair sheen and glasses
  glints follow `STYLE.gloss`.
- Setting `gloss`, `texture`, `bodyLimbs`, `accessories` and `eye` back in `style.ts` returns the v6
  cast, except the stomach, whose old drawing was replaced.

Checked: typecheck passes, 44 of 44 tests pass, `ToonCast` and the sheets for stomach, heart, white
cell, doctor and patient render and were looked at. The other sheets were not rendered one by one.

Then the owner saw the full cast and said "remove bokeh". Commit "feat(toons): no bokeh":

- `style.ts`, new block "camera and air", all off (1 / true brings v6 back): `lensBlur` (depth of
  field in `camera.tsx` `Layer`, out-of-focus actors in `stage.tsx` `Slot`, rack-focus softness and
  whip-pan blur in `Camera`), `foreground` (every `Layer` with p > 1: leaves, curtain edge, tissue
  folds in front of the picture), `specks` (dust and ring bubbles in `scenes.tsx` `Motes`, room dust in
  `rooms.tsx`; solid pieces bigger than 4 units such as food, crumbs and oxygen stay), `glow` (light
  pools over the stages and sets, `Rays`, the lamp, the window light shaft, the soft ring around a
  prop's disc) and `vignette`.
- Checked on the `ToonCamera` and `ToonSets` boards: close-ups keep a sharp background, nothing stands
  in front of the picture, the corners are not darkened.

### Open

- The lenses still set how strongly the layers part when the camera moves; only their blur is off.
  `toons-camera.md` still describes blur as part of each lens.
- Body characters without arms or legs change the acting in every existing Toon (wave, point, thumbs
  up, walking do nothing on them now). No Toon video was re-rendered or re-checked (`toon:camera`,
  `toon:motion`, `toon:staging`) with this look.
- Bokeh is not removed yet: lens blur (`camera.tsx` `LENSES`), the blurred foreground layer and drifting
  specks (`scenes.tsx`), lamp glow and halos.
- The stages (`stages.tsx`, `stage-arena.tsx`) draw their own stomach, food pipe and tooth with arms;
  they are not changed.
- The boards in `skill/medpeak-health/references/toons-boards/` and `toons-style.md` still describe v6.

---

## 2026-11-17 (evening) - Windows PC (commits by VED) - branch `docs/topic-bank`

The owner asked for more topics with high search demand worldwide, and wants to start with 15.

### What changed

- New file `skill/medpeak-health/references/topic-bank.md`: 70 topic candidates, the first 15 marked
  "start here", each with a status column (`open`, `taken`, or the video's slug).
- `skill/medpeak-health/SKILL.md`: three lines under "Channel facts" that point to the topic bank.
- No code changed. `feat/toons` was not touched.

### How the list was made

- About 8,000 YouTube search suggestions (15 question stems, a to z, for India, the US and the UK).
- For topics 1 to 14, the videos over 1 million views on the first page of YouTube results were counted.
  The check for the other topics was stopped: the owner asked for the list fast.
- The raw data and the two small scripts are not in git (they were in a temp folder on the Windows PC).

### Not done

- No topic has been researched for sources yet. Every one is a candidate.
- The list was **not** compared with `plans/month-1-2026-11-18.md` on `feat/toons` or with the videos
  already made (the owner said not to). Known near-duplicate: topic 2 "What Happens If You Don't Sleep"
  and the month plan's "What an All-Nighter Does to Your Brain".
- Click-through rate cannot be measured from outside the channel.

### Next step for whoever picks this up

1. Merge `origin/main` into `feat/toons` (see the entry below for the one conflict in `render.mjs`).
   `SKILL.md` was edited on both sides but in different places; a test merge shows no conflict there.
2. Start with topics 1 to 15 in `topic-bank.md`. Mark a topic `taken` and push before working on it.
3. Decide with the owner how the 15 fit with the month plan and the parked Day 1 videos.

---

## 2026-11-17 - Windows PC (commits by VED) - branch `fix/windows-entrypoint`, pull request #3

First session on the Windows PC. The repo was cloned there and the pipeline was made to run on Windows.

**Status: merged.** Pull request #3 went into `main` on 2026-11-17 (merge commit `d64cd19`) after its CI
check passed, with the owner's OK. Everything below is on `main`.

### What changed in the code

- `pipeline/lib/util.mjs`: new `isMain(metaUrl)` helper. It compares real file paths, so it works on
  macOS, Linux and Windows.
- `pipeline/check.mjs`, `make-sfx.mjs`, `render.mjs`, `research.mjs`, `voice.mjs`: the line
  ``if (import.meta.url === `file://${process.argv[1]}`)`` is now `if (isMain(import.meta.url))`.
  The old line never matched on Windows, so each script exited with code 0 and did nothing.
- `pipeline/render.mjs`: Remotion is started with `process.execPath` and
  `node_modules/@remotion/cli/remotion-cli.js` (helper `remotion()`), not with `execFileSync('npx', ...)`,
  which fails on Windows with `ENOENT`.
- New files: `CLAUDE.md` (start and stop rules for every session) and this log.

### What was run (Windows 11, Node 24.22.1)

- `npm run typecheck`: pass. `npm test`: 8 of 8 pass.
- `node pipeline/check.mjs --all`: prints the tables, ALL PASS.
- `node pipeline/make-sfx.mjs`: 8 sound effects written to `public/sfx`.
- `node pipeline/render.mjs what-sugar-does-to-your-body --stills --only soda`: 20 stills, looked at one.

### What was not run

- `research.mjs` and `voice.mjs` (they only got the start-up change; voice spends ElevenLabs credits).
- A full video render. Nothing on macOS: the helper compares paths exactly there, so behaviour should be
  the same, but nobody has run it on the Mac yet.

### State of the Windows PC (not in git)

- Has: Git 2.56, Node 24.22.1, the npm packages (`npm ci`), ffmpeg 9.0.2, Python 3.12, a venv at
  `~/.config/youtube-analytics/venv` with `google-api-python-client` and `google-auth-oauthlib`,
  `public/sfx`.
- Missing: the ElevenLabs key for this project (`.env` or `MEDPEAK_ENV_FILES`), `client_secret.json`
  and `token.json` for YouTube, and the link of `skill/medpeak-health` into the Claude skills folder.
  So voice, music, upload and analytics cannot run on the Windows PC yet.

### Watch out: `feat/toons`

`feat/toons` (the Mac's branch, 60+ commits, not merged) was not touched from the Windows PC.

- **Merge conflict to expect.** `main` (since pull request #3) and `feat/toons` both edit
  `pipeline/render.mjs`. A test merge shows one conflict in that file. Keep both sides: the `spawnSync`
  loudness change from `feat/toons`, and `isMain` plus the `remotion()` launcher from `main`.
- **Same two bugs are still on `feat/toons`.**
  - Mac-only start-up line: `pipeline/toon-check.mjs`, `toon-music.mjs`, `toon-sfx.mjs`.
  - `npx` spawns: `pipeline/toon-package.mjs:130`, `toon-render.mjs:75` and `:87`, `toon-sheets.mjs:25`.
  Until they use `isMain` and the node launcher, the Toons scripts do not run on Windows. Moving
  `remotion()` from `render.mjs` into `lib/util.mjs` would let all of them share it.

### Open

- Nothing from the Windows PC is waiting for a merge. The merged branch `fix/windows-entrypoint` is still
  on GitHub and can be deleted.
- `feat/toons` does not have these changes yet (see the next step).
- `loadEnv` in `pipeline/lib/util.mjs` splits `MEDPEAK_ENV_FILES` on `:`, which breaks Windows paths
  such as `C:\...`. Use `path.delimiter`.

### Next step for whoever picks this up

1. On `feat/toons`: `git fetch` and `git merge origin/main`, and resolve `pipeline/render.mjs` as
   described above.
2. Apply the two fixes to the Toons scripts listed above and run them once on each machine.
3. Fix the `MEDPEAK_ENV_FILES` split.
