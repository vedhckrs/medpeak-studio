# Handoff log

Two Claude accounts work on this repo, on two machines, one at a time. This file is how one session
tells the next what happened. Newest entry on top. Read the top entry before you start; add one before
you stop. The rules are in `CLAUDE.md`.

---

## 2026-11-22 (28) - MacBook (local Claude Code) - branch `video/fasting` - fasting SCHEDULED (Mon 23 Nov 12:30 IST)

- The owner: "Yes, schedule it". `upload.py fasting toon --slot --approve` (first real use of --slot): https://youtu.be/mQQy3CIbXF0,
  private, publishAt 2026-11-23T07:00:00Z, read back from YouTube.
- BUG found and fixed: `after_upload.py --label` updated the status WITHOUT publishAt, which CANCELS a schedule on YouTube. The time was
  put back (read back: 2026-11-23T07:00:00Z) and the script now keeps publishAt and warns if it changes.
- AI label: update answered; YouTube does not show it on read (check Studio, "Altered content"). Topic #5 marked scheduled.
- Open: Quit Sugar (public) has a silent end card; the owner decides on a re-upload with Joey. Next free slots: Mon 21:30, Tue 12:30 IST.

---

## 2026-11-22 (27) - MacBook (local Claude Code) - branch `video/fasting` - fasting SECOND CUT after the owner's notes (NOT uploaded)

- Owner on the first final: no narrator on the end card, not interesting / not visual / confusing, the hook failed, camera jumps.
  Plan `plans/fasting-fix-2026-11-22.md`; the owner: "Hook A, go ahead".
- END CARD (a class bug, also in quit-sugar, which is PUBLIC with a silent card): the player played Joey only when a video's code named
  the clip by hand. Now `toon-v8-render.mjs` passes every paid clip in (`toon.ctaClip` from cta-timings.json) and `ctaOf` in video.tsx
  plays it with beats from his real words; `toon:listen` fails a card without speech; `pipeline/test/cta.test.mjs`.
- CAMERA: the shots' own framings were never checked (toon:camera reads script cam words). `pipeline/test/views.test.mjs` reads the real
  framings (a reframe must change size 1.5x); fasting holds ONE framing per place, three cuts to another character at 1.6x.
- PICTURES: one colour per place (`PLACE` in fast-art.tsx; quiet tone-on-tone backgrounds: `place` prop on StomachFull, LiverFull, BrainFull),
  the hook opens inside (the stomach screaming at the lens), the hunger WAVE, the liver's FUEL GAUGE with an alarm, the body's FURNACE
  that Lardo shovels fat into, Grandpa's silent beats (biscuit tin + alarm at 4 h, asleep to 12 h, dash to breakfast at 16 h), an hour
  badge on body shots. The hook line stays "When you fast, I scream!" (the longer one took 2.4 s, over the 2 s rule): no new voices.
- Final: 65.2 s (story 48 s), -14.0 LUFS, END CARD speech 81%, look ALL PASS (still 53%, bright 152), all checks pass, npm test 52/52.
- Open: the owner decides on re-uploading Quit Sugar with its narrator; upload fasting on his word (`upload.py fasting toon --approve --slot`).

---

## 2026-11-22 (26) - MacBook (local Claude Code) - branch `video/fasting` - fasting FINISHED, waiting for the owner to watch (NOT uploaded)

- Topic #5 "What Happens to Your Body When You Fast" (slug `fasting`, episode 13, shape `clock`): plan `plans/fasting-2026-11-22.md`,
  script `plans/fasting-script.py`. Owner: hook A, Grandpa; looks approved; "refine character animation and visual first"; "yes spent it".
- Sources: NIDDK (NIH) for who should not fast (Johns Hopkins was read but is not an allowed source; its page refuses scripts, read in
  the browser); Anton 2018, Natalucci 2005, Trepanowski 2017, Lowe 2020. NIDDK's expert: ketones do not rise much at 16 h, so no ketone line.
- New: Lardo the fat cell (voice: library "Dr. Quibble", picked free with earshot), StomachFull, SugarJar, FastRoom (`fast-art.tsx`);
  `organ-act.tsx`: whole organs (StomachFull, LiverFull, BrainFull, the cast Stomach) take arm gestures that blend and hold, plus
  squash/lean (optional props; quit-sugar unchanged and still passes).
- Captions (owner: "caption make shift above 5% and small 40%"): `"caption": 2` in toon.json puts the word at y 1374, 40% smaller
  (`captionStyle`/`captionBox` in director.ts); videos already out keep the first line (rabies' virus sits on the new line).
- Spent by receipts: lines 256, Joey's card 194, music 500 = 950. Balance 43,923 before, 42,973 after (key 2 is out of credits).
- Final `videos/fasting/renders/toon-v8.mp4` 60.2 s (story 45.6 s), -14.3 LUFS, -0.9 dBTP, 9/9 sounds, no holes. toon:check, camera,
  motion, staging, sound ALL PASS; look ALL PASS (still 45% after calming the growl jitter, ripples, head shake and fist pumping;
  small motion 44%); npm test 50/50. Package READY, cover at 3.2 s.
- Next: the owner watches with sound; upload on his word in the next free MedPeak slot (`upload.py fasting toon --approve --slot`).

---

## 2026-11-22 (25) - MacBook (local Claude Code) - branch `feat/posting-schedule-slots` - the posting schedule in the scripts

- The owner: "save this rule, upgrade skill" (the shared `~/Desktop/New/POSTING-SCHEDULE.md`). Built on the other session's
  `feat/posting-schedule` (the reference file and SKILL lines, PR #17), and added:
  - `publish/schedule.py`: reads the channel's last 50 uploads, prints the schedule and our next free slots (Shorts 12:30 / 21:30
    IST, long Wed/Sat 05:30 IST; max 5 Shorts a day on the IST date, 3 h between Shorts, 2 h long-to-Short).
  - `publish/upload.py --slot`: takes the next free slot, uploads private with publishAt, reads the time back and fixes it.
  - CLAUDE.md standing rule; command notes in SKILL.md and posting-schedule.md.
- Tested: the slot rules on made-up schedules (gap, 5 a day, long day) and `schedule.py` on the real channel.
  `--slot` has not done a real upload yet.
- Seen on the channel: Quit Sugar (zXcUcOiN39s) went PUBLIC at 19:39 IST (uploaded private; changed outside this session).
  "Hold Your Pee Too Long" (cartoon pipeline) is scheduled at 21:30 IST tonight, which is a MedPeak slot (left alone).
- Next free slots at writing: Mon 23 Nov 12:30 and 21:30 IST; long Wed 25 Nov 05:30.

---

## 2026-11-22 (24) - MacBook (local Claude Code) - branch `video/quit-sugar` - quit-sugar UPLOADED PRIVATE

- The owner: "Yes, upload private". `upload.py quit-sugar toon` (venv Python, dry run first, then `--approve`):
  https://youtu.be/zXcUcOiN39s (private, not for kids, cover set). The AI-use answer was not stored by the upload, so
  `after_upload.py quit-sugar toon --label --approve` set it (answered True; YouTube does not show it on read: check Studio,
  Details, "Altered content").
- Topic bank #4 marked `quit-sugar (uploaded private 2026-11-22)`. Branch merged into main.
- Next: the owner checks it in Studio and makes it public on his word; the next topic in the bank.

---

## 2026-11-22 (23) - MacBook (local Claude Code) - branch `video/quit-sugar` - quit-sugar FINISHED, waiting for the owner to watch (NOT uploaded)

- The owner: "Yes, spend it" (up to about 1,400 credits). Spent by the receipts: lines 282, Joey's card 176, music 732 = **1,190**.
  Balance 47,302 before, 46,344 read after (the counter lags; receipts are the truth). The music tool's `--max-credits 600` did not
  stop a single bed that cost 732 (it only stops a SET that projects over the cap): within the approved total, but note it.
- Key 2's subscription payment failed (401 payment_required): `eleven.mjs` now treats that like an empty key and moves on
  (it stopped the run before). The owner may want to fix key 2's billing in ElevenLabs.
- Music: the new bed had three 0.3-0.4 s dips inside its loop; one fell in a breath between two words (earshot: a 0.3 s drop at
  41.05 s). Fixed for every video: `director.ts` BED.gap 0.2 (placement) apart from BED.hole 0.5 (is a track steady), placement on
  exact word times (the padding hid the breath). And the dips were filled in the track itself (free): each dip replaced by the same
  spot one bar earlier at 104 BPM, 40 ms crossfades (`assets/toons-music/quit-sugar.mp3`; re-scanned: no rest inside the loop).
- Frame-by-frame against the real voices, fixed: Sweetie's name tag moved out of the hook line (house rule) to the brain shot;
  Sweetie on screen as his lines start on Day 20 and Day 30 (he spoke unseen); tiny Sweetie walks across the tongue in G3 (the
  camera could not go low enough for the lip), stops and turns on "I'll", hops and points on "back." (the never-still check).
  Cover moved to 2.4 s (Dad's angry close-up; at 1.2 s the cover text sat on Sweetie's mouth).
- Final: `videos/quit-sugar/renders/toon-v8.mp4` 65.2 s (story 51.0 s), 1080x1920 60 fps, -14.1 LUFS, true peak -0.8 dBTP, no
  holes, 8 of 10 planned sounds heard (pop at 23.4 s and bubble-pop at 31.5 s sit under the voice). toon:check, camera, motion,
  staging, sound ALL PASS; look ALL PASS (still 49%, small motion 44%, edges 9.2%, outlines 6.4%, bright 147); npm test 50/50.
  Package READY (`videos/quit-sugar/package/`), cover `renders/toon-cover.jpg`.
- Next: the owner watches with sound; upload private only on his word; then merge `video/quit-sugar` (and mark topic bank #4).

---

## 2026-11-22 (22) - MacBook (local Claude Code) - branch `video/quit-sugar` - frame-by-frame fixes, voices picked, WAITING on the cost OK

- The owner: "Need to check every frame timing and voice and fix and give me final render".
- Frame-by-frame (5 fps sheets of the silent draft). Fixed: lines started during the calendar rips (Days 3, 7, 10): those shots now
  have `lead: 0.6` (silent rip first); `director.ts` steady camera: a shot's first picture starts with the SHOT, not its first line
  (no video used `lead` before, the camera test called it a wrong picture); Day 30 F1 framing showed only part of Dad's head
  (now z 1.18); the scale's drop gets a small yellow burst on "kilo"; tiny Sweetie in G3 bigger (290); Dad gets a visible start (a
  take) on "swap" in E2.
- Voices picked FREE by listening to the library's sample clips with earshot (no audition spend): Sweetie = Valf "Young, Playful &
  Sarcastic" (library voice, publicOwnerId set), Dad = Brian, Tongue = Hope (pitch 1). Careful: a search for "Valf" returns
  several different voices with that name; the right id is loY1uopAz31XyhAEhNSa.
- Dry runs (free): lines 701 characters (quote <= 701 credits; creatine's receipts suggest about 300), CTA about 200, music about 500.
  Balance 47,302 (keys 2: 2,728, 1: 72, 4: 35,301, 3 payg: 9,201).
- npm test 50/50, toon:check --all pass. NOT spent yet: waiting for the owner's OK on the cost.

---

## 2026-11-22 (21) - MacBook (local Claude Code) - branch `video/quit-sugar` - quit-sugar SILENT PREVIEW sent, WAITING (nothing voiced)

- The owner: "Yes, go ahead" (the polished organ frames).
- Script: `plans/quit-sugar-script.py` -> `videos/quit-sugar/toon.json` (+ `SCRIPT.md`). 7 shots, 16 lines, about 47 s + Joey's card.
  `toon:check` passes (also `--all`). Changes from the plan, all forced by the gate: hook A cut to "Quit sugar? You'll be back!"
  (2 s rule; the owner's longer wording took 2.7 s); Dad "No sugar for a month? Watch me."; F1 "So... did I lose weight?";
  G1 "And me? Sweet food tastes just the same."; G2 "No sugar for a month? Not yet. Three months? Forty percent sweeter!";
  G3 "You quit sugar? ...I'll be back." (loop). The hook dives into Dad's belly: the Day 1 fatty liver (first frame = consequence).
- New: `src/toons/v8/quit-sugar.tsx` (shots A-G, CTA card with estimated beats), `BrainFull` in `sugar-organs.tsx`, `lift` on
  `LiverFull`; registered in `video.tsx`. Each body shot opens on a 0.62 s calendar rip (`RipInsert`). Macro dials `fat`, `pull`,
  `buds` (director.ts). Layout-check stand-ins: `sweetie`, `tongue` blueprints (characters.tsx), `dad` in the old SPECS (humans.tsx).
  Cast placeholders `sweetie`, `dad`, `tongue` in toons-cast.json (voice null: AUDITION before voicing).
- Run: typecheck pass; `npm test` 50/50; toon:camera, motion, staging ALL PASS. Look on the story (0-47.3 s, measured with
  `toon_look.py --to=47.3` because there is no cta-timings.json yet): still 47.5%, small motion 45%, edges 8.9%, dark 6.3%,
  bright 146: all inside the limits. (`npm run toon:look` without --to includes the card and reads bright 135 until Joey is voiced.)
- Silent preview: `renders/toon-v8-draft.mp4` (61.4 s with the card); storyboard `plans/review-quit-sugar/storyboard-silent.jpg`.
- Next on the owner's OK of the motion: voice auditions (Sweetie, Dad, Tongue), cost and balance shown first; then voices, Joey's
  card, music, full render, look check, package. Upload only on his word.

---

## 2026-11-22 (20) - MacBook (local Claude Code) - branch `video/quit-sugar` - organ frames polished (owner: "need more polished visual and details"), WAITING

- `sugar-organs.tsx` detail pass. Liver: diaphragm muscle bands + pale tendon, lobule speckle, pale ligament band, darker underside
  rim, fat patches with rim and shine, wet shine on the edge, gallbladder shine, portal vein / artery / bile duct at the gate (drawn in
  the background so they run behind the colon), colon with pouches, plump gut loops, stomach folds, thin vessels on the back wall.
  Mouth: cheek walls with folds, throat in depth with bumps, tonsils, palate ridges + centre seam, canines, clear biting edges, tooth
  shines, gum scallops, sugar crystals with a glint, tongue rim, 190 papillae, deep groove, raised buds, wet shine, lips with a wet
  inner band and shines. Shade crescents scaled up (`shadow` 3-5) on frame-size shapes so they read.
- Removed after the look check: self-crossing gut tubes (read as donuts), a pale wedge "shadow", the long vessel stalks (liver on sticks),
  a saliva strand (read as a crack); the gap between the front teeth closed.
- typecheck pass. Nothing voiced or spent. Next on the owner's OK: script, `toon:check`, the silent video.

---

## 2026-11-22 (19) - MacBook (local Claude Code) - branch `video/quit-sugar` - full-organ frames (owner's note), sheets re-sent, WAITING

- The owner on sheet 2: "when big organ frame come i want full view of organs like ref video". Now a standing rule in `CLAUDE.md`.
- `sugar-places.tsx` (micro mouth and liver) removed; new `sugar-organs.tsx`: `LiverFull` (the cast Liver's outline x6.2 under the
  diaphragm, gut below, stomach at right; `fat` shrinks the yellow patches and turns the colour from pale to healthy) and `MouthFull`
  (lips, palate, soft palate + uvula, upper/lower teeth, the tongue; `view` tooth = closer, the face on the left front tooth;
  `view` tongue = the face on the tongue; `bits`, `buds`). `organs-a.tsx` now exports `smooth` and `ORGAN_COL` (no drawing change).
- typecheck pass. Sheets re-rendered into `plans/review-quit-sugar/`. Nothing voiced or spent.
- Next on the owner's OK: script into `videos/quit-sugar/toon.json`, `toon:check`, the silent video.

---

## 2026-11-22 (18) - MacBook (local Claude Code) - branch `video/quit-sugar` - quit-sugar: four look sheets sent, WAITING

- The owner: "Yes, hook A, Dad" (recorded in `plans/quit-sugar-2026-11-22.md`, Decided).
- Built (free): `src/toons/v8/sugar-cast.tsx` (Sweetie: a sugar cube, `wear` none/juice/diet, `arms` hips/wave/point/droop;
  `BurstCan`), `sugar-places.tsx` (`MouthPlace` view tooth/tongue, `bits`, `buds`; `LiverPlace` `fat`), `sugar-kitchen.tsx`
  (`NightKitchen` open/day/scaleAt; `WallCalendar`, `BathScale`, `DAD_HOME` in a navy tee), `entry-sugar.tsx` (sheets + a
  `SugarCheck` close-up board, not in the sheet list). Sheets in `plans/review-quit-sugar/`.
- Bug class to remember: `Put` (an absolutely placed svg) does nothing inside a `Layer` svg: it lands at 0,0. Inside a Layer use
  `<g transform>`. And spread `{...OUTLINE}` BEFORE `fill=` (OUTLINE carries `fill: 'none'`).
- `npm run typecheck` pass, `npm test` 50/50. Nothing voiced or spent.
- Next, on the owner's OK of the looks: the script into `videos/quit-sugar/toon.json`, `toon:check`, the silent video with the acting kit.

---

## 2026-11-22 (17) - MacBook (local Claude Code) - branch `video/quit-sugar` - quit-sugar: plan and script draft sent, WAITING

- Topic bank #4 ("What Happens If You Quit Sugar for 30 Days") marked `taken (Mac, 2026-11-22)` and pushed first.
- Sources read on PubMed and WHO (free): who-diet, temorenga-2013, schwarz-2017, wise-2016, westwater-2016, moynihan-2014.
- Plan: `plans/quit-sugar-2026-11-22.md`. Shape `fight` (Dad vs Sweetie, a sugar-cube villain, over a 30-day wall
  calendar), no Dr. Mira, 16 lines, about 48 s. New drawings: Sweetie + costumes, inside the mouth, inside the liver,
  the kitchen at night. Estimate about 1,075 ElevenLabs credits (not spent; balance not read this session).
- Nothing drawn, voiced or spent. Next, on the owner's word: hook (A/B/C), lead (Dad), F2 wording, then the four sheets.

---

## 2026-11-21 (16) - MacBook (local Claude Code) - branch `video/creatine` - creatine: UPLOADED private (dKQm2aRKyTs)

- On the owner's word ("Yes, upload private"): **https://youtu.be/dKQm2aRKyTs**, private, not made for kids (id in
  `videos/creatine/package/toon.json`). Dry run first, then `--approve`.
- Python on this Mac: none had the YouTube client; a throwaway venv in this session's scratchpad (`pip install google-api-python-client
  google-auth google-auth-oauthlib`). For good, set one up in a normal terminal.
- AI label: `after_upload.py creatine toon --label --approve`: the update call answered True; YouTube does not show the field on read
  back (same as rabies and no-sleep): the owner checks it in YouTube Studio (Details, "Altered content").
- Topic bank: #3 marked `creatine (uploaded private 2026-11-21)`. Next video: topic 4 ("What Happens If You Quit Sugar for 30 Days").
- Merged `video/creatine` into `main` after CI (the owner's standing word).

---

## 2026-11-21 (15) - MacBook (local Claude Code) - branch `video/creatine` - creatine FINISHED (acted version), waiting for the owner to watch (NOT uploaded)

- The owner: "Yes, finish it" (the bolder line and a new steady music track).
- **Bolder line for every video from now on:** `kit.tsx` OUT 3.4 -> 5.6, IN 2.2 -> 3.2. Older uploaded videos keep their look unless re-rendered.
- New music `assets/toons-music/creatine.mp3` from a steady prompt (no stops): **500 credits**; balance 49,730 -> 49,230. The scan shows
  no rest inside its loop (only the end fade, cut out of the loop). The old track is replaced (not kept in git history beyond the commit before).
- Final fixes: the BATTERY tag's arrow stops above the cap (it read "AYP"); on "no" Dr. Mira rests and nods (her open hand covered Mom's
  shaker in Mom's close-up).
- Final: `videos/creatine/renders/toon-v8.mp4` 66.8 s, -14.0 LUFS, true peak -0.9 dBTP, no holes, 8 of 9 sounds heard. `npm test` 50/50;
  toon:check (+ `--all`), camera, motion, staging, sound ALL PASS. Look: outlines 2.7% PASS, brightness 170 PASS, line detail PASS;
  still frames 26% FAIL (target 45; was 4% in the rejected cut), small movement 57% (target 55). Told the owner plainly.
- Package rebuilt READY (cover 1.75 s). Phone copy `toon-v8-phone.mp4`.
- Spent on this video in all: 75 + 285 + 193 + 500 + 500 = **about 1,550 ElevenLabs credits** (the first music track was not used).
- Next: the owner watches; upload private only on his word; then merge `video/creatine`.

---

## 2026-11-21 (14) - MacBook (local Claude Code) - branch `video/creatine` - creatine restaged C-G (review cut), WAITING

- The owner: "Yes, do the rest" (after the hook test). Built (free), all with the acting kit:
  - New drawings: `Fat` (grumpy blob, `knock`), Muscle `band` + `sweat`, `Dumbbell`, `CellDoorPlace` (the cell close up: `fill`, `pour`,
    `door`; `doorAt`), `MuscleSign` (signpost with a flexed muscle). New poses `press` (near arm overhead), `holdL` (near arm at the chest
    when facing left). Pose test `ActPoses` in `entry-act.tsx`.
  - C blood: Crea surfs in on a red cell, splash, points, hops, the signpost pops up, he zips into the opening; the stream flows only
    while he arrives and leaves (`BloodPlace t={flowT}`).
  - D muscle: a cut to Mom pressing a dumbbell; the batteries go out one after another (`batteryLevel`, left to right); the big battery
    shakes; Crea runs in, winds up, throws the spark on an arc, it hits (burst), the battery refills with a hop; Muscle drops in big
    and does reps on the beats, then jogs in a headband, sweats, slumps on "barely".
  - E kidney: Kidney moved off the act-2 watermark; a chip pops off Crea and rides the tube (CREATININE tag once it has left him);
    a syringe reaches in; the blood-test card SLAMS on; the Kidney jumps in fright, then hops twice; the filter's clock runs only on beats.
  - F clinic: held framings with HARD cuts per line (`viewF`): the room camera's 2.8 s smoothing made every reframe a slow slide.
    Dr. Mira raises the lab sheet (clipboard), nods, opens her hand; Mom holds her shaker (behind her hand), panic jump, joy hop.
    No raised single finger.
  - G ending: a NEW view (`view: 3`): water pours into the cell, it swells; Fat waddles up and knocks; Crea slams the door on "fat!".
  - Checker: events may carry `act` ("mom: jumps in panic"), a visible character action that counts as something happening; the
    blood stream and the kidney flow no longer count as flowing all the time. Caption pop quicker (0.08 s; 0.14 s for the key word).
- Checks: toon:check (+ `--all`), camera, motion, staging ALL PASS. `npm test` 48/50: only the two music tests (the funk bed stops).
- Look (story only): still frames 26% (was 4%; target 45-80), small movement 57% (target 15-55), outlines 0.9% (target 2.5),
  brightness 174 PASS. Not passing: a bolder line needs the owner's OK (before/after `plans/review-creatine/outline-*.jpg`,
  kit OUT 3.4 -> 5.6, IN 2.2 -> 3.2; NOT applied); the rest is a dialogue-heavy story (mouths, one-word captions).
- Sent as a REVIEW cut (not final): `renders/toon-v8-phone.mp4`, `plans/review-creatine/new-pieces.jpg`, the outline sheets.
- Next on the owner's word: the bolder line (free), a new steady music track (about 500 credits, balance 49,730), re-render, package.

---

## 2026-11-21 (13) - MacBook (local Claude Code) - branch `video/creatine` - acting kit + hook test (0-10 s) sent, WAITING

- The owner approved the review plan ("Yes, go ahead"). Built (free):
  - `toon-look` fixed: resamples to 30 fps (it read 60 fps renders as 30: double length, half the cut rate) and measures the STORY
    only (the still end card hid the problem: creatine's story holds still in 4% of frames, not 31%). `--whole` measures the whole file.
    CLAUDE.md: the look check must pass before the owner sees a video.
  - `src/toons/v8/act.tsx`, the acting kit: `keyed` (key poses with holds; ease/back/out/snap), `take`, `hop`, `shake`, `arc`,
    `Burst`, `SpeedLines`, `Stamp`.
  - New rig poses `cheeks` (the take; use the FRONT view, the three-quarter one covers the nose), `shake` (near arm up with a bottle;
    for a figure facing right that is her LEFT arm), `shrug2`. Pose test: `src/toons/v8/entry-act.tsx` (`ActPoses`).
  - Calm places: `crea-places.tsx` depth planes no longer drift; no floating specks, bobbing batteries or wavy membranes.
  - Blood: one dark opening at the far end (the two holes read as a face).
  - Hook (shots A, B in `creatine.tsx`): close on Mom's nervous face (eyes shut) as she steps on, Crea at her ear; cut to the dial filling
    the screen, the needle SLAMS (shake, burst), Crea leaps at the lens; Mom's take (front, `cheeks`, jump back) with the +2 KG stamp
    on the second "Your scale jumps..." (not during the hook line: the owner's rule); the dive into her upper arm with skin / fat / muscle
    rims. B: medium (shot `view`), she shakes an orange shaker at the dial and stomps on "week!". Crea's eyes open while he talks (`openFace`).
- Checks: toon:check, camera, motion, staging ALL PASS. Look on the 10 s slice (`--whole`): still frames 16% (was 4% for the whole story;
  target 45-80), small movement 42% PASS, outlines 2.3% (target 2.5), brightness 116 (the dark gym wall; target 140), a cut every 1.4 s
  (the hook cuts fast on purpose). Not yet passing.
- **`npm test` 48/50: the creatine music breaks the steady-bed rule** (format-5 beds must never go quiet; the funk track stops 4 times).
  It failed since the music was made (18:15); the tests were not run then. Needs a new steady track (about 500 credits, owner's yes).
  The branch cannot be merged until it passes.
- Test clip: `videos/creatine/renders/toon-v8-0-10.mp4`, phone copy `hook-test-phone.mp4`. Sent to the owner.
- The owner on the test: "what line in hand" (Mom's shaker hand). Then "you join hand with arm, why line come". Root cause: a second
  gripping hand drawn over the prop has its own outline (a seam at the wrist). Fixed the right way: the bottle is drawn BEHIND her and
  the rig's own one-piece arm and hand close over it; no second hand. Speed lines dropped from the shake. Rule in `toons-known-issues.md`.
- Open (from the plan, after the owner's yes): bolder outlines sheet, a lighter gym wall, scenes C-G restaged (lift, spark throw, running,
  needle and lab sheet, clinic acting, the water-balloon cell with the Fat blob), the event-size check, no place reused, watermark off
  characters, Dr. Mira's finger, a new steady music bed. No credits spent since the review.

---

## 2026-11-21 (12) - MacBook (local Claude Code) - branch `video/creatine` - creatine: the owner rejected the look; review + plan sent, WAITING

- The owner on the finished creatine video: animation, characters and visuals weak, not viral or engaging; asked for a
  frame-by-frame analysis, a plan first, and the bugs. NOT uploaded.
- Review and plan: `plans/creatine-review-2026-11-21.md`, picture sheet `plans/review-creatine/frames-1-10.jpg`.
- Measured with `toon:look`: creatine and no-sleep both FAIL (still frames 31% vs 63% reference, small movement 60% vs 34%,
  near-black outline 1.2% vs 3.0%). This check was not run before sending: a process miss (bug 2 in the plan).
- Bug found in `toon-look.mjs`: reads 60 fps renders as 30 fps (133.6 s for 66.8 s). The 20 reference Shorts are no longer on this
  Mac (the old scratchpad folder is empty); only the written numbers remain.
- Nothing changed in code, nothing spent.
- Next: the owner's answer on the plan (acting kit, bold outline sheet, +2 KG card and time card).

---

## 2026-11-21 (11) - MacBook (local Claude Code) - branch `video/creatine` - creatine: FINISHED, waiting for the owner to watch (NOT uploaded)

- The owner: "Yes, make both". Balance before: 50,424.
- Joey's end card (`toon-voice.mjs creatine --cta`): **193 credits** by the receipt, 16.11 s, `assets/toons-voice/creatine/cta.mp3`,
  beats wired in `CREATINE_CTA` (head 0, points 2.53 / 6.44 / 9.95, follow 12.59).
- The music `assets/toons-music/creatine.mp3` (funk, 40 s): the tool reported 194 from the balance (the counter lags). Balance after
  both: **49,730** (694 below the 50,424 before: matches 193 + about 500 for the music). `toon:music:scan`: 17 short rests (0.3-0.7 s).
- Final render `videos/creatine/renders/toon-v8.mp4`: 66.8 s (story 49.1 s + card), -14.0 LUFS, true peak -0.8 dBTP; holes 0.3-0.4 s only
  (none of 0.5 s). Sounds: first mix 5 of 9 heard; moved the splash into a pause, dropped the clinic thud and ding, tada later: now
  8 of 9 (the tada under the card's whoosh). Contact sheets at 2 frames a second read. Phone copy `toon-v8-phone.mp4`.
- Package READY (`node pipeline/toon-package.mjs creatine`): cover moved to 1.75 s (just after the needle swings into the red).
- Spent on this video: 75 + 285 + 193 + about 500 = **about 1,050 ElevenLabs credits**. Anthropic key not used ($0).
  Note: the balance also fell by about 2,000 more during the day from use outside this session.
- Next: the owner watches with sound; upload private only on his word (`python3 publish/upload.py creatine toon`, dry run first; the
  Mac's Python needs the venv as for no-sleep). Merge `video/creatine` after the upload (as no-sleep, PR #12).

---

## 2026-11-21 (10) - MacBook (local Claude Code) - branch `video/creatine` - creatine: VOICED, one word to confirm by ear

- The owner: "Yes, voice it". Balance right before: 51,340 (540 below the reading after the voice tests with nothing spent here:
  something else is using these keys). Voiced 18 lines: **285 credits** by the receipt (711 quoted). Clips committed in
  `assets/toons-voice/creatine/`, timings `videos/creatine/toon-timings.json`.
- With real timings two rules failed; fixed for free with a line's `tempo` (`toon-voice.mjs creatine --remix`): A1 1.1 (2.1 s -> 1.9 s,
  hook rule 2 s), F1 1.12 and F2 1.15 (the clinic had a 3.3 s stretch with nothing new; push camera segments do not count as change).
  Voiced length 49.1 s. `toon:check` (+ `--all`), camera, motion, staging: ALL PASS.
- `toon:listen --voices`: 18 lines all speech, -14.4 to -15.4 LUFS, no clipping. G1 (Crea) also tagged "quack 49%" (his pitched timbre?).
  `--words`: 130 words, 2 differ: B1 "creating" for "creatine" (a near miss), and **E1 "creatinine" heard as "creatine"**. That word is the
  point of the kidney twist. A stronger check was not possible here: whisper-large-v3 is only half downloaded (weights.npz missing),
  parakeet is not downloaded, faster-whisper is not installed. The word lasts 0.86 s against 0.52-0.62 s for "creatine" (fits one more
  syllable, not proof). E1 and G1 sent to the owner to judge by ear; a re-take of E1 with a clearer spelling costs about 45 characters.
- The owner, after hearing G1 (and E1): "is good to go": the voices stay as made.
- Next: Joey's card (214 characters quoted) and the music, on his yes; render; package.

---

## 2026-11-21 (9) - MacBook (local Claude Code) - branch `video/creatine` - creatine: voice tests made, WAITING for the owner's picks

- The owner: "Yes, voice tests" (which also OKs the silent video's motion).
- Balance before (live, sandbox off): 52,365 (4 keys). Lower than the 55,755 noted after no-sleep: about 3,400 were spent elsewhere
  between the two sessions.
- Voice tests `toon-voice.mjs creatine --audition --who crea,battery,muscle`: **75 credits** by the receipt (189 quoted). Files in
  `out/toons/auditions/` (crea.mp3, battery.mp3, muscle.mp3; this Mac only) plus a free variant `battery-fast.mp3` (tempo 1.15: 4.76 s
  against 5.46 s). Speech-to-text (mlx_whisper): every word right in all three. `earshot realness`: real/pro 0.97 / 0.89 / 0.92.
  Loudness -17.5 / -18.0 / -17.6 LUFS.
- Balance after: 51,880. That is 485 less, but this session's receipt says 75: about 410 more went from key 4 at the same time,
  not from this session (another machine or account?). Told the owner.
- The owner picked "All three as made" (the battery at its own pace, not the faster take); written in `toons-cast.json`.
- Next: voice the script (711 quoted) on the owner's yes, then Joey's card, the music (about 500).

---

## 2026-11-21 (8) - MacBook (local Claude Code) - branch `video/creatine` - creatine: silent video sent, WAITING for the owner's OK on motion

- Fixed: the doctor line F4 split in two (F4 "A trial over twelve weeks..." + F5 "found no hair loss.", tag "12 WEEKS"): the one-word
  "twelve-week" could not carry a number tag and the long line left a 3.5 s still. End of F: Dr. Mira rests her arm (her hand touched
  Mom's thumbs-up).
- Tests: four failed after creatine joined (it sorts first among the real scripts): the room gate test now picks two neighbouring videos,
  the caption-line test picks a script with a tag, the old-kit wall test leaves out `gym` (drawn only in v8). `npm test` 50/50.
  `toon:check` (+ `--all`), camera, motion, staging: ALL PASS.
- Silent render `videos/creatine/renders/toon-v8.mp4`: 62.7 s (story about 49 s + card), 1080 x 1920, 60 fps; phone copy
  `toon-v8-silent-phone.mp4`; storyboard `renders/storyboard/` (5 sheets; Pillow from a throwaway venv, the Mac's Python still has none).
  Contact sheets at 2 frames a second read.
- Voice quote (dry run): script 711 characters (the receipt usually comes in far lower: no-sleep 702 quoted, 280 charged); auditions for
  crea / battery / muscle 189 characters. The live balance could not be read from Claude's shell (keys "NOT WORKING (network)"): read it
  before any spend. Last known: 55,755.
- Next: the owner OKs the motion, the clinic look and the hook wording; then auditions (paid), voices, Joey's card, music.

---

## 2026-11-21 (7) - MacBook (local Claude Code) - branch `video/creatine` - creatine: script + shots built, silent render NOT made yet

- The owner OK'd the looks ("Yes, these looks").
- Script `videos/creatine/toon.json` from `plans/creatine-script.py` (edit the .py, re-run): 7 shots A-G (macro hook with the gym
  cold open, gym, blood, muscle cell, kidney filter, clinic, macro end), 17 lines, hook "Take creatine? Your scale jumps!" (A cut
  for the hook rules: "your" + 2 title words; tell the owner). `toon:check` (and `--all`), `toon:camera`, `toon:motion`, `toon:staging`: ALL PASS.
- New: room kind `gym` (director.ts), macro dials crea/flex/drain/charge/water/bits, flow dials crea/bits, proposed voices crea (Will +2),
  battery (Jessica +3), muscle (George 0) NOT auditioned, layout stand-ins in characters.tsx, the video's own clinic `CreaClinic`
  (crea-gym.tsx; NOT yet shown to the owner as a sheet), shots `src/toons/v8/creatine.tsx` registered in video.tsx, CTA card
  (placeholder beats, no narrator clip yet).
- Checked: silent stills of every line (two per line) read; fixed Dr. Mira's hand touching Mom (spacing 270/800, `youSee`), and the
  thumbs-up hands touching (doctor now `youSee` on F4: re-check that still).
- NOT done: `npm test` after these changes, the full silent render (`npm run toon:v8 -- creatine --silent`), storyboard, sending to owner.
  No credits spent.
- Next: npm test, silent render + storyboard, send to the owner with the clinic look and the hook wording change.

---

## 2026-11-21 (6) - MacBook (local Claude Code) - branch `video/creatine` - creatine: look sheets drawn, WAITING for the owner

- The owner: "Hook A, go ahead" (plan approved; my picks stand: Mom as the lifter).
- Four look sheets drawn (free), copies in `skill/medpeak-health/references/toons-boards/v8/creatine/`
  (`node pipeline/toon-v8-sheets.mjs crea`, entry `src/toons/v8/entry-crea.tsx`):
  1. `crea-cast`: Crea (white crystal grain, `carry` = a yellow spark), Battery (ATP; `charge` fills green/yellow/red,
     `charging`, `face={false}` crowd), Muscle (striped fibre, `flex`). Code `src/toons/v8/crea-cast.tsx`.
  2. `crea-place` + `crea-place-close`: `BloodPlace` (`crea`), `MuscleCellPlace` (`flex`, `drain`, `charge`, `water`;
     `gapY`/`DOCKS` place things in the tilted gaps), `KidneyFilterPlace` (`bits`). Code `src/toons/v8/crea-places.tsx`.
     The blood got a new place: `HighwayPlace` is the inside of a nerve.
  3. `crea-gym`: `GymRoom` with the upright scale (`needle` 0..1, `SCALE`), Mom as `LIFTER` (tee, trousers, trainers),
     the shaker held with `HandAt` over it. Code `src/toons/v8/crea-gym.tsx`.
- Fixed before sending: Muscle's arms (were antennae on top; now a real flex / hanging at the sides), the muscle
  fibres (flat blocks -> round rods: curved bands, light and shade, tilted).
- Run: typecheck clean, `npm test` passes. No credits spent.
- Next: the owner OKs the looks; then `videos/creatine/toon.json` (`toon:check` must pass), the shots file, silent render.

---

## 2026-11-21 (5) - MacBook (local Claude Code) - branch `video/creatine` - creatine: plan sent, WAITING for the owner

- The owner said "Start"; the next topic is #3 "What Happens When You Take Creatine" (slug `creatine`), marked
  `taken (Mac, 2026-11-21)` in `topic-bank.md` and pushed on `video/creatine`.
- Sources read: PubMed 28615996 (ISSN 2017, full text PMC5469049), 33557850 (ISSN 2021 myths, PMC7871530), 12945830
  (Branch 2003 meta-analysis), 43050022 (Raihan 2026 kidney meta-analysis), 42507286 (Almeida 2026 kidney meta-analysis),
  40265319 (Lak 2025 hair RCT), 1327657 (Harris 1992, not used in the script). Abstracts saved in
  `videos/creatine/research/abstracts.md`. The NIH ODS fact sheet shows a Cloudflare bot check (curl and the browser pane):
  not clicked through; MedlinePlus no longer has the creatine page.
- New: `plans/creatine-2026-11-21.md`: shape `journey` (gym -> blood -> muscle cell -> kidney filter -> clinic, Dr. Mira at
  the end), 16-line draft, 3 hook choices, cast (new: Crea, the batteries, Muscle), new drawings (muscle cell inside,
  gym, kidney filter), care notes (no dose; kidney wording "no harm was found", never "safe"; industry ties of the ISSN papers).
- Not done: no `toon.json`, no sheets, nothing voiced, no credits spent. Anthropic key not used.
- Next: the owner picks the hook, the lifter and OKs the plan; then the look sheets (free).

---

## 2026-11-21 (4) - MacBook (local Claude Code) - branch `video/no-sleep` - no sleep: UPLOADED private (rbiXOjOD8SQ)

- The owner picked topic 2, "What Happens If You Don't Sleep" (slug `no-sleep`); marked `taken (Mac, 2026-11-21)`
  in `topic-bank.md` and pushed.
- Sources read word for word: NHLBI (3 pages), CDC About Sleep, PubMed 24136970 (Xie 2013), 29632177
  (Shokri-Kojori 2018), 10984335 (Williamson 2000). The NIH news pages and CDC drowsy-driving page refuse
  automated fetches (403/404); PubMed abstracts come through `eutils.ncbi.nlm.nih.gov`.
- New: `plans/no-sleep-2026-11-21.md`: shape `crew` (no doctor), 17-line draft, 3 hook choices, cast, the
  new drawings it needs (Gunk + night crew, brain micro place with opening gaps, bedroom night/morning), care notes.
- Not done: no `toon.json` yet, `toon:check` not run, nothing drawn, nothing voiced, no credits spent.
- The owner picked hook A ("Don't sleep tonight? I pile up in your brain!").
- Three look sheets drawn (free), WAITING for the owner's OK, copies in
  `skill/medpeak-health/references/toons-boards/v8/no-sleep/` (`node pipeline/toon-v8-sheets.mjs sleep`):
  1. `sleep-cast`: Gunk (grey-taupe sticky heap, stages 0/1/2) and the night crew (fluid droplets with mop,
     bucket, brush and a headlamp band). Code `src/toons/v8/sleep-cast.tsx`.
  2. `sleep-place`: inside the brain, microscopic, `BrainGapPlace` with dials `gap`, `wash`, `dirt`
     (`src/toons/v8/sleep-places.tsx`).
  3. `sleep-room`: Sam's bedroom at 2 a.m. and 7 a.m. (`src/toons/v8/sleep-rooms.tsx`; `BedFront` and `Duvet`
     are drawn after Sam). New rig poses `sitPhone`, `sitSlump`, and a pose field `seat: false` (no rig chair).
- Run: typecheck clean, `npm test` 50/50. Rendering stills needs the sandbox off on the Mac (Remotion's browser).
- The owner approved all three sheets.
- Script: `videos/no-sleep/toon.json`, written by `plans/no-sleep-script.py` (edit the .py, re-run it). 16 lines, 5 voices
  (gunk, patient = Sam, melatonin, crew, brain), 5 scenes (macro A, home B, macro C, home D, macro E), episode 10.
  `toon:check` ALL PASS (and `--all`), `toon:camera`, `toon:motion`, `toon:staging` pass. Sheet: `videos/no-sleep/SCRIPT.md`.
- Changes to make it fit: hook A was 9 words / about 3 s, the format-5 rule is 2 s, so it is now
  "Don't sleep? I clog your brain!" (WAITING for the owner's OK on that cut); the last line became
  "You did sleep! Now they wash me out. I can't clog your brain!" (the loop needs 3 shared words); the night crew speaks C1, C2, C4
  instead of the Brain (the Brain speaks in the morning scene).
- New: macro dials `gap`, `wash`, `dirt` (`director.ts`; `wash` is a flow dial); cast entries `gunk` (Callum -3),
  `melatonin` (Lily -1), `crew` (Harry +2) in `toons-cast.json`, proposed, not auditioned; old-engine blueprints for
  them in `characters.tsx` (only so the layout checks can measure them); two test guards now follow the script's cast.
- Not done: the v8 shots for this video (like `src/toons/v8/rabies.tsx`), storyboard, motion test, voices, music.
- The owner OK'd the hook "Don't sleep? I clog your brain!".
- Shots built: `src/toons/v8/no-sleep.tsx` (A-E, beats follow the script's events, name tags GUNK / MELATONIN / NIGHT CREW /
  BRAIN, number tags on the grid) and the CTA card (SLEEP IS NOT OPTIONAL: 7+ hours, it adds up, don't drive sleepy),
  registered in `video.tsx`. Silent render `npm run toon:v8 -- no-sleep --silent`: 56.8 s with the card (no narrator yet),
  1080 x 1920, 60 fps, about 2.5 min on the Mac. Storyboard: 4 sheets in `videos/no-sleep/renders/storyboard/` (renders
  are not in git). Sent to the owner with the silent video, WAITING for his OK on the motion.
- Mac setup: the system Python has NO Pillow (the storyboard needs it). This session used a throwaway venv; for good,
  run `python3 -m pip install --user pillow` in a normal terminal (pip fails inside Claude's sandbox: SSL through the proxy).
- The owner OK'd the motion. Voice tests for gunk, melatonin, crew made (`toon-voice.mjs --audition --who ...`): **75 credits**
  by the charge receipt (quoted 189); balance before 56,825 (the counter lags). Files in `out/toons/auditions/` (not in git), plus
  free variants: `gunk-p1` (pitch -1 instead of -3: synthetic score 0.59 against 0.71) and `melatonin-slow` (tempo 0.9: 3.96 s
  against 3.58 s). Speech-to-text: every word right in all three. The owner picked: Gunk pitch -1, Melatonin slowed (her lines
  carry `"tempo": 0.9`), the crew as made. Balance after the tests: 56,750. All checks pass again. Next: voice the script (702
  credits quoted), on the owner's yes.
- VOICED on the owner's yes: 16 lines, **280 credits** by the receipt (702 quoted); balance 56,750 -> 56,470. Clips in
  `assets/toons-voice/no-sleep/` (committed), timings `videos/no-sleep/toon-timings.json`. `toon:listen --words`: 140 words, 0 wrong;
  `--voices`: all at -14.4 to -15.1 LUFS, speech 76-89%, synthetic 0-56%, no clipping. Voiced length 48.8 s.
- Hook A1 was 2.2 s even at "tempo" 1.15; on the owner's word a NEW TAKE of A1 at ElevenLabs speed 1.2 (new per-line `"speed"` in
  toon.json, read by `toon-voice.mjs`): **12 credits**, 1.9 s, PASS; words right, synthetic 29%. The old take is in
  `out/toons/a1-backup/` (this Mac only). Balance after: about 56,458 (the counter lags). `toon:check --all` passes again.
- On the owner's yes: Joey's end card voiced with the new `toon-voice.mjs <slug> --cta` (text in toon.json "cta"): **202 credits**,
  16.72 s, `assets/toons-voice/no-sleep/cta.mp3`, word times `videos/no-sleep/cta-timings.json`; wired in `NO_SLEEP_CTA`. The music
  `assets/toons-music/no-sleep.mp3`: **500 credits**, 40.1 s, no rests. Balance 56,458 before, 55,755 after.
  Whole video 66.5 s (story 48.1 + card).
- Final render: `videos/no-sleep/renders/toon-v8.mp4` 66.5 s, -14.0 LUFS, peak -1.0 dB; `toon:listen` 8 of 9 sounds heard (three
  sounds moved off spoken words into pauses), no holes; frame scan 0 one-frame jumps; contact sheets read. Phone copy
  `toon-v8-phone.mp4` (19 MB). Package READY (`videos/no-sleep/package/`), cover `renders/toon-cover.jpg`.
- Bug fixed: the v8 cover came out as frame 0 under `<Freeze>`; `ToonV8` now takes `frameAt` (entry-video.tsx). The uploaded
  rabies cover was probably frame 0 too (not changed: it is up).
- The owner's notes on the finished video, all fixed (2026-11-21): (1) end-card points must be ONE line each: `CtaCardV4` now sizes
  every point's bold line together so the longest fits (all videos); (2) the calendar icon "looks cheap": replaced by a
  night-sky badge with a draining battery (`SleepBattery` in no-sleep.tsx); (3) characters "flicker and jiggle" when they speak:
  `bodyFace` now uses `talkSmooth` (the mouth averaged over 0.1 s, all videos), no squash on every syllable, slow sways instead
  of fast hops/shakes; (4) Sam's phone "not proper": held out at chest height (`sitPhone` pose), seen from its back, his own
  hand drawn again over it (`HandAt` with `rod={false}` -> `Hand grips`, a gripping hand with no hole). Re-rendered, 0 flicker.
- Second round of notes (2026-11-21), fixed: the name-tag circle removed everywhere (`CharTag`, rule in CLAUDE.md and the
  skill); Sam's "Just one more video" jiggled: (a) the room camera stepped 5 times a second (`smoothCam` now samples a fixed
  grid), (b) the cut from the brain was a zoom-through ghost: shots B and D now have a `portal` (Sam's head), so the camera
  pulls out of his head / dives into it. Re-rendered: 0 one-frame jumps, no 5 Hz pulse on Sam.
- Hook diagnosed (empty first frame, an unrecognisable place, nothing coming at the lens, no person, the threat not shown,
  three texts at once, a soft first sound); the owner chose A. Built in shot A: Sam close up at 2 a.m. (phone, the clock
  SLAMS onto 2:00), his "Just one more video..." is now a COLD OPEN (the same clip, no new voice), the camera dives through his
  face into his brain, Gunk splats on the lens with goo, "clog" squeezes the gaps shut; the name tag after the hook. Cover at 2.4 s.
- The owner: **no transitions anywhere** (hard cuts; `TRANSITIONS = false` in video.tsx, `SWAP_CUT` in shots-v3.tsx) and
  **music 10% lower** (`MUSIC_LEVEL = 0.9`). Rules written into CLAUDE.md, SKILL.md and toons-v8-style.md (with the hook pattern).
- Render: 66.7 s, -14.0 LUFS, the 3 one-frame jumps are exactly the scene cuts; 7 of 9 planned sounds heard (the splash where
  the wash starts stays under the voices and the running water).
- **UPLOADED, private, on the owner's word: https://youtu.be/rbiXOjOD8SQ** (not made for kids, cover set; id in
  `videos/no-sleep/package/toon.json`). AI label: the update call answered True but YouTube does not show the field on read
  back (same as rabies): the owner checks it in YouTube Studio (Details, "Altered content").
- `publish/upload.py` now writes the package paths back RELATIVE to the repo (they came back as full Mac paths twice).
- Next: the owner checks the video in Studio and makes it public when he wants; the next video starts from topic 3.
- (older) NOT uploaded. Next: the owner watches the video; upload private only on his word (`python3 publish/upload.py no-sleep toon` with
  the venv Python, dry run first; check `upload.py` keeps repo-relative paths).
- Spent on this video in all: 75 + 280 + 12 + 202 + 500 = **1,069 ElevenLabs credits** (56,825 -> 55,755). Anthropic key: not used ($0).
- Before that: the owner's OK on the silent video, then the voice auditions for gunk / melatonin / crew with the cost, then
  voices, the narrator's CTA line and the video's own music (all paid: balance before and after).

---

## 2026-11-21 (3) - MacBook (local Claude Code) - branch `video/rabies-upload` - rabies v4 UPLOADED, private

- **Uploaded: https://youtu.be/zgK91fQhvU0** (private, not made for kids, cover set). Video id stored in
  `videos/rabies/package/toon.json`.
- Run on the Mac: `main` pulled (b77b449), `npm ci`, typecheck clean, `npm test` 50/50, `npm run toon:v8 -- rabies`
  (61.6 s, 1080 x 1920, 60 fps), `toon-package.mjs rabies` READY, `upload.py` dry run, then `--approve`.
- The Mac's YouTube login was dead (`deleted_client`: the old OAuth client was deleted after its secret leaked in the
  cloud chat). A new Desktop OAuth client "MedPeak Mac uploader" was made in project `gen-lang-client-0632588516` and
  the vedv0987 account signed in again (all 5 scopes). The app is still in Testing mode, so the login expires after
  about 7 days: re-run the sign-in (`yt_analytics.py auth`) when uploads fail with `invalid_grant`.
- Mac setup notes: the render needs network to `remotion.media` (first run downloads the headless browser), so it
  fails inside Claude's sandbox; the upload needs the Python in `~/.config/youtube-analytics/venv` (system Python
  has no Google client).
- **Open:** the "altered or synthetic content" label reads as NOT set after upload (same as the earlier Toons); set it
  in YouTube Studio or with `publish/after_upload.py rabies toon --label --approve`. `upload.py` writes absolute paths
  back into the package (fixed by hand here; the script should keep them repo-relative). The owner's earlier
  uncommitted `feat/toons` edits (7 files) are in a git stash on this Mac only, not pushed.
- Next: the owner checks the video in YouTube Studio and makes it public when he wants.
- Later the same session: **no watermark on the CTA end card** from now on (it fades out over 0.35 s as the card
  comes in; `Watermark` `out` prop in `hud.tsx`, rule in `CLAUDE.md` and `toons-v8-style.md`). The uploaded rabies
  video was NOT re-rendered (the owner: "it's already up, fix it for upcoming videos").
- The owner's standing rule (in `CLAUDE.md`): commit, push and merge PRs without asking him once CI passes.
- The owner will set the AI label on the rabies video in YouTube Studio himself. A new session starts the next video.

---

## 2026-11-21 (2) - Cloud session -> the owner moves to his MacBook (local Claude Code)

The owner will work on his MacBook from now on (local Claude Code, his own copy of the repo). The cloud could not
upload: it has no YouTube login, Remote Control to his Mac did not attach, and his OAuth client has no localhost
redirect.

**Next step on the Mac: upload rabies v4, PRIVATE (the owner said "package, private").**
1. `git fetch --all --prune`, `git switch main`, `git pull` (rabies v4 is on `main`, PR #7).
2. `npm ci`, then `npm run typecheck` and `npm test` (50 tests).
3. The video is not in git: `npm run toon:v8 -- rabies` (about 7 min, writes `videos/rabies/renders/toon-v8.mp4`,
   61.6 s) or the owner saves the file sent in the chat there.
4. `node --import tsx pipeline/toon-package.mjs rabies` (READY, makes the v8 cover).
5. `python3 publish/upload.py rabies toon --dry-run`, then with the owner's yes `--approve` (private). It needs the Mac's
   saved login `~/.config/youtube-analytics/token.json` with the youtube.upload scope.
6. Commit `videos/rabies/package/toon.json` (it records the video id), push, tell the owner the link.

Cloud leftovers: a Google OAuth token saved as a network secret for `www.googleapis.com` on the `medpeak-studio` cloud
environment was rejected by YouTube and is useless; the owner can delete it in the environment's settings. The
owner's OAuth client secret was shared in the cloud chat: he may want to make a new secret in Google Cloud.

---

## 2026-11-21 - Cloud session (claude.ai/code) - rabies v4 APPROVED, PR #7 merged

- The owner approved the final rabies video and said "merge + package, private".
- Package: `node --import tsx pipeline/toon-package.mjs rabies` -> READY, private, not made for kids, AI label yes;
  it now uses the v8 render and a v8 cover (`ToonV8Cover`), and stores repo-relative paths (upload.py resolves them).
- **To upload (on the owner's PC; the cloud has no YouTube login):** `git switch main`, `git pull`, `npm ci`, then
  either render it there (`npm run toon:v8 -- rabies`, about 7 min, makes `videos/rabies/renders/toon-v8.mp4`) or save
  the video file sent in the chat as `videos/rabies/renders/toon-v8.mp4`; then
  `node --import tsx pipeline/toon-package.mjs rabies` (makes the cover) and `python publish/upload.py rabies toon --approve`
  (private). Renders and the cover are not in git.
- PR #7 merged into `main`; PR #6 closed (all of its work is in #7).

---

## 2026-11-20 (late, 5) - Cloud session (claude.ai/code) - branch `claude/bold-hopper-dqvjfr`, PR #7

- The owner: "start the video with One stray dog". The Virus's line B1 is now a COLD OPEN in shot A (new script
  field `"cold": true`: first line only, at most 4 s; the hook rules judge the next line). The hook's beats ride its
  words (`hookT()` in `shots-v3.tsx`). Shot B opens on the bite already made. No new voice. Test added.
- The owner asked for a zoom check of every person's clothes and face in the video: found the coat's collar and
  lapels too wide in the three-quarter view (a "cape"); made narrower. Sheet: `out/toons/sheets-v8/v4-people-zoom-check.jpg`.
- Run: typecheck clean, `npm test` 50/50, `toon-check --all` ALL PASS; final render 61.6 s; frame scan: only the two
  deliberate hook cuts; storyboard rebuilt. Sent: the video, the first 9 s, the zoom sheet. NOT uploaded.
- Balances unchanged: ElevenLabs 39,006; Anthropic $2.59 of $5.

---

## 2026-11-20 (late, 4) - Cloud session (claude.ai/code) - branch `claude/bold-hopper-dqvjfr`, PR #7

The owner's notes on the v4 video and what was done:
- "The narrator's last words are cut and missing; going past one minute is fine." Cause: `syncVoices` copied a
  stale `public/` clip over the committed one (sizes differed); now the NEWER file wins. Joey's take is back at
  normal speed (the 1.1x copy is gone); the card holds 1.2 s after his last word; `toon-check` fails only the STORY
  over 60 s and reports the length with the card. Rules updated in `CLAUDE.md` and the skill.
- "The first 3-4 s are poor, I want a strong visual." He chose plan A: shot A now opens with a stray dog lunging at
  the lens, CHOMP, a saliva drop with the Virus growing on the fang, a dive into it, the Virus bursting out in the
  nerve tunnel; then "Get rabies? I get your brain!" (new script field `"lead": 1.3` on shot A; no new voice).
  Plus the RACE BAR (bite -> brain) through the body shots. Rules added to `references/toons-v8-style.md`.

### Run

typecheck clean; `npm test` 49/49; `toon-check --all` ALL PASS (rabies: story 47.9 s, 62.8 s with the card);
full render 62.8 s, -13.9 LUFS, peak -1.0 dB; frame scan: only the two deliberate hook cuts (0.43 s chomp, 1.25 s
pop); storyboard rebuilt. The video, the storyboard and the 0-6 s hook clip were sent. NOT uploaded.

### Balances

ElevenLabs 39,006 left (nothing spent since). Anthropic: $2.59 of $5 for rabies (no new spend).

### Next

The owner's OK on the video -> upload (his word) -> merge PR #7, close PR #6.

---

## 2026-11-20 (late, 3) - Cloud session (claude.ai/code) - branch `claude/bold-hopper-dqvjfr`, rabies v4 DONE

The owner chose: **this session writes the code itself** (his Anthropic key unused since the cap; ledger $2.59 of $5).
His answers: name-tag halo = flat white rings, **no glow**; watermark stays as transparent as it is; the PR is left
to the session (a new PR from this branch to `main`, which contains all of PR #6's branch; PR #6 can be closed).

### What is done (all pushed)

- **Rabies v4 video**: `videos/rabies/renders/toon-v8.mp4` (render, not in git), 1080 x 1920, 60 fps, **59.6 s**,
  -13.9 LUFS, peak -1.0 dB. Storyboard: `node --import tsx pipeline/toon-v8-board.mjs rabies` -> `renders/storyboard/`.
  Sent to the owner with the storyboard and the 0:12-0:22 pull-back clip. NOT uploaded.
- All 11 points of the v4 plan: narrator end card (Joey, `narrator` in `toons-cast.json`; `assets/toons-voice/rabies/cta.mp3`
  at 1.1x, the original take `cta-raw.mp3`; word times `videos/rabies/cta-timings.json`), `CtaCardV4` with the logo,
  the transparent Inter Regular watermark, no punch zoom, one smooth room move, the dive through depth planes (also in
  the highway), dive/pull/whip transitions (`ShotDef.portal`), calm Virus, icons by the words, name tags, the detailed
  micro world, the **clothes rework** (shapes and colour bands that read at phone size; before/after sheet
  `out/toons/sheets-v8/v4-clothes-before-after.jpg`), the skill and `CLAUDE.md` (v4 rules in
  `references/toons-v8-style.md`).
- Bugs fixed after the owner's notes: the flicker at the dive (the leaving shot now uses the same smoothed camera),
  icons fade over transitions, no tag covers a face, the camera never jumps in a shot's tail, the flash rises over
  3 frames, looping bits fade at their wrap. Check used: a frame-difference scan of the whole render
  (`ffmpeg ... tblend=all_mode=difference,signalstats`): **0 isolated one-frame jumps**.
- `toon-check` now counts the end card in the 60 s rule (test added). `--from/--to` slices in `toon-v8-render.mjs`.

### What was run

`npm run typecheck` clean; `npm test` 49/49; `node pipeline/toon-check.mjs --all` ALL PASS (rabies 59.6 s =
story 46.6 + card 13.0); full render 7 min; storyboard; frame scan.

### Balances (end of video)

ElevenLabs: 39,006 left of 40,000 (this video: 42 auditions + 189 narrator = 231; resets 2026-12-09).
Anthropic: $2.59 spent of the $5 cap for rabies (no new spend; the session wrote all the code).

### Open

- The owner's OK on the final video, then upload (private/scheduled, his word) and merge the PR.
- A bigger logo file (PNG or SVG) from the owner; the current one is 176 x 176.

---

## 2026-11-20 (late, 2) - Cloud session (claude.ai/code) - branch `claude/bold-hopper-dqvjfr`

**The owner's decision: this session writes the v4 code itself; his Anthropic key is not used.** (The rabies v4
ledger stays at $2.59 of $5.)

### v4 step 1 done: the look sheets (sent to the owner, waiting for his OK)

`node pipeline/toon-v8-sheets.mjs v4-` writes them to `out/toons/sheets-v8/`:
- `v4-micro-1`, `v4-micro-2`: all five micro places redrawn in `micro3.tsx` (haze, cells with nuclei/ER/mitochondria
  via `CellBody`, fibre `Bundle`s, `Bits` of small life, near `Frame` shapes, myelin lamellae and nodes, microtubule
  tracks, junctional folds, the factory's ER and Golgi). Exports and key object places unchanged, so v3 shots still line up.
- `v4-cta`: `CtaCardV4` in `hud.tsx` (logo circle, royal blue #214ba1 rings, one-line yellow headline, white cards,
  follow pill; `at` times each beat to the narrator). The logo is copied to `public/brand/` by `syncBrand()`.
- `v4-watermark`: `Watermark` is now Inter Regular 26 px at 0.44 opacity, 1 px flat drop (`WatermarkV3` kept for the sheet).
  On light places it is faint, as asked; say so if he wants it a bit stronger.
- `v4-icons`: `dog`, `dogWarning` icons; `IconBadge` uses `settleIn` (eased, one 3% settle, no turn), eased fade out.
- `v4-tags`: `CharTag` (1 s, tag box above the head or to the side, arrow draws itself, two flat white halo rings).
- `v4-clothes`: seams, hems and folds in `people-rig.tsx` for every view/pose: sleeve elbow creases and hems,
  waist folds, hem stitches, shirt placket and pocket, Kid's star print, blouse gathers, knee folds, coat buttons,
  pocket flaps, drape folds, flared hem, shaded lapels.

### Not yet changed in the video

The shots still use the sunrise icon, the old camera punch and transitions; no name tags placed; the CTA in the
video is still `CtaCard`. Those are steps 3-4 after his OK on the looks.

### Next step

1. His OK (or fixes) on the 7 sheets.
2. Narrator auditions: 3 male voices, about 100 credits (balance before/after).
3. 10-second motion test (dive, transitions, a tag, an icon), then the full video.

---

## 2026-11-20 (late) - Cloud session (claude.ai/code) - branch `claude/bold-hopper-dqvjfr`

This branch = `claude/stoic-pascal-7dmpzh` (= PR #6's branch + handoff) + this session's work.

### What changed

- **New hard rule from the owner: at most $5 of Anthropic spend per video.** `pipeline/claude-run.mjs` enforces it:
  ledger `videos/<slug>/claude-spend.json`, one run at a time (lock file), each run gets `--max-budget-usd` =
  left - $0.75, no run under $1.50 left. Tests in `pipeline/test/claude-run.test.mjs`. Rule written in `CLAUDE.md`
  and the skill (hard rule 6). Never run `claude -p` on his key any other way.
- Key: `MEDPEAK_ANTHROPIC_KEY` is visible in cloud sessions and works (`/v1/models` 200; headless smoke test ok).

### What was run

- `npm ci`, `npm test` 48/48, `npm run typecheck` clean.
- v4 step 1 was started as 3 PARALLEL uncapped headless runs (HUD, micro world, clothes). The owner then set the
  $5 cap; they had spent ~$2.19 (transcripts) in about a minute, so they were stopped. **No code from them was kept.**
  Booked $2.50 (rounded up for cut-off turns). Lesson: one run reads a lot of code first; a big task costs $2+.

### Balances

- ElevenLabs: 39,237 left of 40,000 (no change; resets 2026-12-09).
- Anthropic, rabies v4: **$2.59 of $5 spent, $2.41 left** (`node pipeline/claude-run.mjs rabies --status`).

### Open / next step

- With $2.41 left only one capped run (~$1.66) can start for rabies v4, which is not enough for all of v4.
  **Waiting for the owner:** raise the rabies v4 cap, or let this session write v4 code itself (no cost to his key),
  or cut v4's scope. Then v4 step 1 (look sheets), one task at a time through `claude-run.mjs`.
- The step 1 task texts (A: HUD, B: micro world, C: clothes) were written in this session's scratchpad; rewrite
  them smaller (one sheet per run) to fit the cap.

---

## 2026-11-20 (night) - Cloud session (claude.ai/code) - branch `claude/stoic-pascal-7dmpzh`

Short session. It started v4 and stopped at the API-key check. **No v4 work is done.** This branch = `claude/github-repo-check-handoff-as1kql`
(pull request #6) + this entry only.

### What was run

- Start-of-session steps; `npm ci` ok.
- Key check: **`ANTHROPIC_API_KEY` is NOT visible inside the session**, although `get_environment` lists it as a
  variable of `medpeak-studio`. The cloud runtime most likely strips that exact name (it would clash with the
  session's own login). The `api.anthropic.com` check was not run.
- ElevenLabs balance (start of video): 763 used of 40,000 = **39,237 left** (no change; resets 2026-12-09).
  Anthropic: $0 spent.

### The owner's decision

He will save the key again under another name (for example `MEDPEAK_ANTHROPIC_KEY`) in the environment
settings and start a new session. The work split stays as planned (his key writes the code).

### Next step for the new session

1. Check `test -n "$MEDPEAK_ANTHROPIC_KEY"` (or the name he chose). Run headless Claude with it:
   `ANTHROPIC_API_KEY="$MEDPEAK_ANTHROPIC_KEY" claude -p "<task>" --model claude-opus-5-5 --effort medium --output-format json`.
   If it is still missing, ask him; do not look for it in other processes.
2. Then v4 step 1 (look sheets) as in the entry below. Base the work on this branch or on PR #6's branch.

---

## 2026-11-20 (evening) - Cloud session (claude.ai/code) - branch `claude/github-repo-check-handoff-as1kql`, pull request #6

The owner works from cloud sessions now. This branch = `feat/toons-engage` (Windows PC) + today's cloud work.
Pull request #6 (this branch -> `main`) is open, CI green, no conflicts. **Merge only on the owner's word**, after he
approves the final rabies video.

### What is done (all pushed)

- Rendering works in the cloud: `export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`
  (the full Chromium; the headless shell does not trust the proxy CA). Run `npm ci` first in a new session.
- Voice in the cloud: `NODE_USE_ENV_PROXY=1 ELEVENLABS_API_KEY=proxy-injected node pipeline/toon-voice.mjs ...`
  (the real ElevenLabs key is a network secret of the `medpeak-studio` environment; the proxy injects it).
- Rabies v2 and v3 (rendered, sent, storyboards sent): one-word captions, icons, new punchier voice (all 15 lines +
  hook re-voiced), watermark `@MedPeakHealth` per act, CTA end card, transitions, serious beat, the NEW micro world
  (`src/toons/v8/micro3.tsx`: bite, muscle, door, highway, battle; approved as places) used by `src/toons/v8/shots-v3.tsx`.
- Script checks: `npm test` 44/44, `toon-check --all` ALL PASS, CI green on PR #6 at `f1d5e38`.
- `assets/brand/logo.png`: the owner's channel logo (176 x 176; ask him for a bigger PNG or SVG for sharp use).

### Credits

- ElevenLabs: 39,237 left of 40,000 (resets 2026-12-09). Today: 255 + 74 + 12 = 341 used.
- Anthropic: the owner added `ANTHROPIC_API_KEY` as an ENVIRONMENT VARIABLE of the `medpeak-studio` cloud environment
  (network secrets cannot hold Anthropic keys). Only NEW sessions see it. Not used yet: $0 spent.

### The owner's feedback on v3 and the approved v4 plan (NOT started)

Work split he asked for: **his API key (Claude Code headless on Opus 5.5, medium effort) writes the code; the session
drives it, checks (typecheck, tests, toon-check), renders, looks at frames, commits and pushes, and reports.**
Run it like: `claude -p "<task>" --model claude-opus-5-5 --effort medium --output-format json` (the JSON has the run's
cost). Show both balances at the START and END of each video only (ElevenLabs balance; Anthropic: the dollar cost of
each run and the video total, since a normal key cannot read the remaining balance; that is on the Console's Billing page).

v4 changes (all approved as a plan; show 16:9 sheets before building, motion test before the full video):
1. CTA spoken by a **professional male narrator, the same voice in every video**: 3 auditions first (about 100
   credits, balance before/after), he picks one. The narrator reads the headline, the 3 points and the follow line,
   added AFTER the story so the script rules (loop, answer in the last quarter) still pass.
   Follow line (his pick): **"Follow MedPeak Health for more health tips that keep you safe."**
2. CTA card: headline on ONE line; **his logo top centre in a circle, "MedPeak Health" typed below it**; background
   in the logo's royal blue with lighter blue rings; stronger, bigger icons on white cards.
3. Watermark: smaller, 50% more transparent, **Inter Regular**, no heavy outline.
4. Camera: remove the key-word punch zoom (looks jerky). One smooth eased continuous move per shot. Inside the body:
   a continuous DIVE from first frame to last through the depth layers.
5. Transitions that make sense: into the body = dive into the skin; body -> kitchen = pull back out of the arm;
   whip pan only room -> room. No sudden jumps.
6. Virus much calmer at the start (too much jiggle); it moves when it acts or speaks.
7. Icons ONLY when the words say it: remove the sunrise at 0:05; a DOG icon on "stray dog"; a DOG + warning badge when
   the doctor says rabies is fatal; calendar and stopwatch stay; shield only where the vaccine is named. Smoother icon
   animation (eased pop, settle, fade; no wobble).
8. Name tags: 1 second, the FIRST time each non-human character appears (RABIES VIRUS, ANTIBODY, WHITE BLOOD CELL,
   DEFENCE CELL, NERVE ENDING): a smart arrow and a tag box above the head with a soft FLAT halo (v8 has no real glow;
   ask him if he wants a true glow). No tags on humans.
9. The micro world backgrounds are "poor, not detailed": redraw all 5 places with much more detail (textured
   membranes and organelles, textured fibres, more layers, flat light/shade bands, denser life).
10. Clothes of all people (the doctor's coat first) need rework: lapels, pockets, fit, scrubs; seams and folds for
    Mom, the Kid and the others. Same kit and line.
11. Upgrade the skill (`skill/medpeak-health/`) and `CLAUDE.md` with all of these rules for every future video.

### Next step for the new session

1. Start-of-session steps (CLAUDE.md). `npm ci`. Check the key: `test -n "$ANTHROPIC_API_KEY"` and a free
   `GET https://api.anthropic.com/v1/models`. Show both balances (start of video).
2. Step 1 of v4: the look sheets (clothes, detailed micro world, name tags, new icons, watermark, CTA card with logo).

---

## 2026-11-20 (afternoon) - Cloud session (claude.ai/code) - branch `claude/github-repo-check-handoff-as1kql`

The owner now works from a Claude **cloud** session, not the Mac or the Windows PC. This branch starts from
`feat/toons-engage` (the Windows PC's latest work) plus one commit. `feat/toons-engage` was not touched.

### What changed

- `remotion.config.ts`: if `REMOTION_BROWSER_EXECUTABLE` is set, Remotion uses that browser. Unset on the
  Mac and the PC, so nothing changes there. The cloud cannot download Remotion's own browser, and the
  installed headless shell does not trust the cloud's network proxy (fonts fail to load), so in the cloud:
  `export REMOTION_BROWSER_EXECUTABLE=/opt/pw-browsers/chromium-1243/chrome-linux64/chrome`.

### What was run (cloud: Ubuntu 24.04, 4 CPU, 15 GB, no GPU, Node 22.23.5, ffmpeg 6.1.1)

- `npm ci`; `npm run typecheck` clean; `npm test` 44 of 44 pass.
- `npm run toon:v8 -- rabies --draft` (4 min) and looked at contact sheets: all seven shots move; the clinic
  at 26..30 s keeps the Kid's face in frame (only the back of his cap touches the edge at "BUT ACT").
- `npm run toon:v8 -- rabies` (7 min): `videos/rabies/renders/toon-v8.mp4`, 1080 x 1920, 60 fps, 45.6 s,
  peak -1.0 dB. Sent to the owner in the chat for his approval of the MOTION. Not uploaded. Renders are not
  in git; the cloud machine is wiped at the end of a session, so re-render to get the file again.

### State of the cloud environment (not in git)

- Has: the tools above, GitHub read and push, connectors for ElevenLabs, Supermetrics (YouTube analytics,
  read only, MedPeak Health channel), Google Drive / Sheets / Gmail, Canva, Picsart.
- Missing: a YouTube upload login (Supermetrics cannot upload to YouTube), an ElevenLabs key (its API host
  is blocked; the ElevenLabs connector works), Poppins fonts (only the storyboard script uses them), a
  setup script (run `npm ci` at the start of every cloud session).

### Open / next step

1. The owner's OK on the rabies motion. If he asks for changes, fix and re-render here.
2. After his OK: the upload package (title, description, tags) and his upload from YouTube Studio, unless
   a YouTube login is set up for the cloud.
3. Merging this branch and `feat/toons-engage` into `main` waits for his word.

---

## 2026-11-20 - Windows PC (commits by VED) - branch `feat/toons-engage`

**The owner's decision today: everything is code-drawn again.** After the 10-second test of the AI-sheet
doctor on 2026-11-18 he said "stop here ... this is failed", and today: "you switch full code made only now
create all my character sheet props and all with code as ref video follow visual ... use subagents opus 5.5
... final jpg for approval 16:9 ... consistency match visual not look off". So the stock kits, the Adobe
Animate rig, the Adobe rebuild roadmap and the AI character sheets (all in the entry below) are **dropped**.
Nothing from `pipeline/animate/` is used by look v8. Do not propose those roads again unless he asks.

### What changed (look v8, all in `src/toons/v8/`, nothing in the old engine was touched)

- `kit.tsx`: the ONE shared drawing kit (outline colour and two thicknesses with non-scaling strokes, the
  body / skin / cloth palettes, `shade()` and `tint()`, `Shape`, `Eyes` with ten moods, `Mouth` with nine
  shapes, `TinyArm`, `TinyLeg`, `NameTag`, and the board pieces). Every sheet is drawn with it; nobody
  edits it to suit one sheet.
- Rules and our cast identities: `skill/medpeak-health/references/toons-v8-style.md` (ten rules, read from
  sharp frames of the 20 reference Shorts: thin even dark outline, flat colour with one darker tone, two
  white eyes with a small pupil, a tiny mouth, real anatomy simplified, job characters with one prop and a
  name tag). We follow their drawing language, never their characters.
- The cast, 67 characters, each a component in the 200-unit figure space:
  - `people-rig.tsx` + `people-sheets.tsx`: one parametric person rig (`Person`, `PersonAt`, `HeadAt`, `Hand`;
    views front / three-quarter / side as real drawn views; poses; seven expressions; six shared hands) and
    8 people: Dr. Mira, Sam (patient), Mom, Dad, Kid, Grandpa, Grandma, Baby. Dad and Grandma are new.
  - `organs-a.tsx` (13): stomach, food pipe, intestine, liver, kidney, bladder, lungs, heart, brain, tooth,
    bone, pancreas, gallbladder. `organs-b.tsx` (12): eye, nose, ear, tongue, skin, nail, throat, windpipe,
    thyroid, muscle, nerve, blood vessel.
  - `cells.tsx` (15): red cell, white cell, platelet, egg cell, sperm, fat cell, antibody, cilia, sugar,
    insulin, melatonin, cortisol, stomach acid, histamine, cholesterol.
  - `germs.tsx` (15): virus, bacteria, fungus, parasite worm, allergen, venom, nicotine, tar, alcohol, poop,
    vaccine, antivenom, creatine, water drop, pill.
  - `animals.tsx` (4, nine drawings): dog (stand, snarl, head close-up), snake, bee, mosquito.
- `props.tsx`: 30 props (15 clinic, 15 home), no faces.
- Each sheet has its own entry file (`entry-*.tsx`), so one sheet's mistake cannot break another's render.
  `node pipeline/toon-v8-sheets.mjs [name]` (or `npm run toon:sheets`) renders them to
  `out/toons/sheets-v8/` (1920 x 1080 JPG; `out/` is not in git). It uses the `remotion()` helper, so it
  runs on macOS and Windows.

### How it was made

Seven Opus 5.5 subagents, one per sheet group, each given the kit, the rules and the reference frames, each
rendering and looking at its own sheet several times. Then one review round by the main session across all
sheets side by side (a common layout, a more anatomical heart, the nail's face moved off the nail, nicotine
redrawn as smoke, the dog's close-up head matched to the body dog, a "glasses" fault on small people fixed
by thinning eye lines on small figures, and so on).

After the owner's first look ("the arm coming up on shoulder why?"): the round top of each sleeve drew an arc
on top of the body. `people-rig.tsx` now fills the upper half of that round end with the garment's colour
where it lies over the garment (`shoulderPath()`), so the shoulder line runs from the neck into the outside
of the arm and the arm's inner line starts at the armpit.

### What was run

- All 17 sheets rendered and looked at; `00-overview.jpg` (a contact sheet of them) made with PIL.
- `tsc --noEmit`: no errors. `pipeline/test/toons.test.mjs`: 36 of 36 pass (the old engine is unchanged).
- A check of every v8 file: no hard-coded stroke colours, no gradients, no blur or filters.

### Later the same day: scenes and the rabies storyboard (wait for the owner's approval)

After the owner approved the cast and props, the next piece was drawn in the same look: the places of the
rabies video and nine storyboard frames (1080 x 1920 stills). **Nothing is in the engine or in a video yet.**

- `src/toons/v8/scene.tsx`: the shared scene pieces (`Scene`, `Layer` = a full-frame SVG in frame pixels,
  `Put` = place a 200-unit cast figure, `Label`, `Tag`, `Bubble`, `CAPTION_BAND`).
- `src/toons/v8/scenes-rooms.tsx` (+ `entry-scenes-rooms.tsx`): `KitchenRoom`, `ClinicRoom` and the frames
  C1, C2 (kitchen: Mom and the Kid, the scratch, washing under the tap, tag "15 minutes") and D1, D3
  (clinic: Dr. Mira and the Kid, the plaster, the vaccine vial). People at `PEOPLE_SCALE = 3.2`, feet near
  y 1740. It has its own `handAt` (wrist and palm of a pose in frame pixels, so props sit on a hand); it
  copies the rig's arm arithmetic, so it drifts if the rig's arm math changes: export it from the rig when
  v8 goes into the engine.
- `src/toons/v8/scenes-body.tsx` (+ `entry-scenes-body.tsx`): `ArmPlace {bite, wall, air, punctures}` (a cut
  through the bitten forearm: skin, deeper skin, fat, nerve, muscle) and `NervePlace {view: entry | road |
  caught, far}`, and the frames A (hook, the virus on the nerve road, the brain far away), B (the dog's
  teeth at the bite, the virus rides in on spit), M2 (the long road, tag "2-3 months"), E (the wall of
  antibodies after the vaccine), M3 (white cells hold the virus).
- **No mirrored adults.** The owner rejects flipped characters and Dr. Mira's pocket, pens and stethoscope
  swap sides when mirrored. In every room frame the adult stands on the left in the real three-quarter
  view; only the Kid (no one-sided detail) is mirrored to face left. A real left-facing view in the rig is
  the proper fix before animation.
- New poses in `people-rig.tsx`, additive only (no approved pose changed): `showArm`, `showArmUp`,
  `tapHand`, `offer`, `thumbsHold`, `thumbsUp`, `worriedHold`, `worriedPoint`, `explainLow`, `youSee`.
- `Antibody` got an optional `color` prop (default unchanged). **Open question for the owner:** the
  antibody (#9d90d8) and the virus (#9d8cc2) are almost the same purple, so in frame E the wall looked like
  the virus's friends. Frame E uses teal antibodies. If he agrees, make teal the antibody's own colour and
  re-render the cells sheet (that changes an approved sheet, so only on his word).
- `node pipeline/toon-v8-sheets.mjs --scenes [name]` renders the frames to `out/toons/scenes-v8/`. The three
  16:9 approval sheets (`storyboard-rabies-1.jpg`, `storyboard-rabies-2.jpg`, `places-rabies.jpg`, 3840 x
  2160) are in `out/toons/scenes-v8/boards/`; they were laid out with a small PIL script that is not in the
  repo (a contact sheet of the frames with the script lines under them).
- How: two Opus 5.5 subagents (rooms; body), three review rounds each by the main session.
- Run: `tsc --noEmit` clean; `pipeline/test/toons.test.mjs` 36 of 36; all 17 approved sheets re-rendered
  from the current code and compared with the approved copies in `toons-boards/v8/`: 0 pixels differ.
- Weak spots, told to the owner: the Kid has no real shrug in C1 (face only); in M3 the white cells rest a
  hand on the virus rather than clasp it; in B the first spit drops sit inside the dog's mouth next to its
  teeth; the cast virus carries its gold key in every frame; the upper wall of both rooms is plain on
  purpose (the tag sits there).
- Next, after his OK on the storyboard: bring v8 into the engine (cast, places, poses, a left-facing view),
  animate, and re-render rabies. Not started.

### Evening: the owner's feedback on the storyboard, and what changed

He looked at the storyboard and said: "all characters nose not proper side view and hand also overlap
like patch" and "i want deeper macro view inside human body, microscopic level". Three changes, all
waiting for his look:

- **Nose and hands, in `people-rig.tsx` (this changes the people sheets he approved, on his word).**
  The three-quarter nose was a thin angle line lying on the far eye; the side view had almost no nose. Now
  every person has one nose family in all three views (side: the profile carries a rounded nose that
  sticks out; three-quarter: a small skin-filled rounded nose below the eyes; front: a small "c"), scaled
  by a new build field `nose`. Forearm and hand are one outlined shape (no ring at the wrist). New hand
  kind `rest` (fingers together) for a hand lying on the body; the chest poses use it. Arm, wrist and palm
  positions did not move. The copies in `toons-boards/v8/` are still the OLD approved people sheets:
  replace them with the new ones only after he approves the new look. The organ, cell, germ, animal and
  prop sheets are unchanged (0 pixels differ).
- **The inside-the-body frames were redrawn at the scale of cells** (`scenes-body.tsx` rewritten; the
  forearm cut and the nerve "road" are gone). `MicroPlace {view: wound | junction | axon | tissue}` plus
  `MicroFront` (foreground cell edges drawn over the characters), each place in three flat planes for
  depth. Frames: A = the virus with its key at the nerve ending's keyhole locks, the brain in a thought
  bubble; B = a fang tip through the skin cells, the virus surfing in on saliva between torn muscle
  fibres; M2 = inside the nerve fibre, a tunnel that darkens into the distance, the virus carried along a
  rail; E = teal antibodies at the locks and on the virus's spikes; M3 = white cells hold the virus
  between the cells. The biology is true to rabies (bite, muscle, nerve ending, slow travel inside the
  nerve, antibodies stop it before the nerve).
- **Room frames:** re-checked with the new rig; in C2 the two hands no longer touch (the sink moved 36 px
  right); no hand overlaps a hand or lies flat on a body.
- The approval sheets are now four: `storyboard-rabies-1.jpg`, `storyboard-rabies-2.jpg`,
  `places-rabies-rooms.jpg`, `places-rabies-body.jpg` in `out/toons/scenes-v8/boards/`.
- Run: `tsc --noEmit` clean; `toons.test.mjs` 36 of 36; all scene frames re-rendered from scratch.
- Still open: his OK on the new noses and hands, on the storyboard, and on teal antibodies. Weak spots:
  the three-quarter nose is small; the back-plane cells in the lower half of A and E repeat like
  wallpaper (the caption covers most of it); the carrier in M2 reads as a walker only at a second look;
  white cells and antibodies rest a hand on the virus rather than clasp it.

### Night: APPROVED by the owner ("Yes, approved")

He approved the new noses and hands, the microscopic body frames and the rabies storyboard. Recorded:

- `skill/medpeak-health/references/toons-boards/v8/` now holds the approved state: the ten people sheets with
  the new nose and hands, the cells sheet with the teal antibody, and in `storyboard/` the two storyboard
  sheets, the two places sheets and the thirteen scene frames (9 frames + 4 empty places) at full size.
- The antibody's own colour is now teal (`cells.tsx`, `C.antibody`), so the sheet matches the approved
  frames (it was a purple almost like the virus). The scenes still pass `color={CLOTH.teal}`; harmless.
- **Next (not started): the animation phase.** A plan was put to the owner: first a short motion test in
  1080 x 1920 at 60 fps (one kitchen shot and one inside-the-body shot, with the existing rabies voice) for
  his approval of how things MOVE, then the whole rabies video. The rig still needs, before that: a real
  left-facing three-quarter view (today only the Kid may be mirrored), talking mouth shapes driven by the
  voice timings, blinks, and pose-to-pose arm moves; `handAt` should move from `scenes-rooms.tsx` into the
  rig. The rabies voice, sfx and music are already on this PC in `public/toons/` (not in git).

### Late night: the owner said "start the full video" (in progress, not finished)

- Committed: the v8 video PLAYER. `src/toons/v8/play.tsx` (the contract: a shot is a `ShotDef {Scene, Screen,
  focus}` and a pure function of `ShotNow`, time in seconds; helpers for talking mouths, blinks, feelings),
  `video.tsx` (60 fps; it reuses the old director's layout, captions, sound plan and music bed; its own calm
  camera), `rabies.tsx` (the video's shots by id), `entry-video.tsx`, and `pipeline/toon-v8-render.mjs`
  (`npm run toon:v8 -- rabies [--draft | --stills | --at <seconds>]` -> `videos/rabies/renders/toon-v8.mp4`).
  In this commit every shot is still its approved frame STANDING STILL; the whole 45.5 s plays with voice,
  captions, sound and music.
- NOT committed yet, being worked on by subagents on this PC: the people rig's animation inputs (talk,
  blink, pose blending, a real left-facing view, `handAt`), the five moving body shots, then the moving
  kitchen and clinic shots. They are committed after they render cleanly, with the finished video.

### For a new PC or a new Claude account (written 2026-11-20, late)

The owner is connecting this repo to a new Claude account on a new PC. `CLAUDE.md` now has the full setup
(install, clone, check, keys, voices, the skill), all his standing rules (they used to live only in one
account's memory) and a map of the look v8 code; `README.md` has a look v8 section. The storyboard layout
script is in the repo now (`pipeline/tools/toon-v8-storyboard.py`). The owner then said yes to committing the Toons voice clips: the rabies
video's 15 are in `assets/toons-voice/rabies/` and the render puts them where the player reads them
(`syncVoices` in `pipeline/lib/toon-audio.mjs`), so a new PC renders with sound straight from a clone. He also said: from now on no subagents, fixes are made directly.

### Where the rabies v8 video stands (2026-11-20, session stopped at a usage limit)

- ALL SEVEN SHOTS MOVE and are committed: the body shots (`scenes-body.tsx`), the kitchen and clinic shots
  (`scenes-rooms.tsx`, with new additive poses in the rig), the player with a camera that never cuts a face
  (`keepIn` in `video.tsx`) and a closer framing for the body shots (`rabies.tsx`).
- A half-size draft was rendered and looked at as contact sheets (`npm run toon:v8 -- rabies --draft`).
  After that look three things were changed and NOT yet re-rendered: the keep-faces-in camera, calmer
  framing for shots E and M3, and the Kid listening with open eyes in the clinic.
- **Next step: `npm run toon:v8 -- rabies --draft`, look at contact sheets again (the clinic at 26..30 s is
  where the Kid's face was being cut), then the final `npm run toon:v8 -- rabies` (1080 x 1920, 60 fps) and
  send `videos/rabies/renders/toon-v8.mp4` to the owner for his approval of the MOTION.** Nobody has
  watched it with sound yet. Nothing is uploaded.

### Not done, and open

- **APPROVED by the owner on 2026-11-20 ("Yes, approved").** The approved JPGs are committed in
  `skill/medpeak-health/references/toons-boards/v8/`. (Written before the approval:) **The sheets wait for the owner's approval.** Nothing of v8 is used in a video yet: `Player.tsx`,
  `characters.tsx`, `humans.tsx`, the stages and rooms still draw the old cast. After his OK the next step is
  to bring v8 into the engine (cast first, then rooms and body stages in the same language), then rabies.
- No rooms, body stages or backgrounds are drawn in v8 yet; no animation of the v8 figures (arms, mouths
  and moods are props, but nothing moves yet).
- Known weak spots, told to the owner: people stand fairly upright and all share one rest stance; the
  thumbs-up hand is small on pose figures; the throat's flap looks a little like a can lid; the venom's
  fang is small; the coiled snake has a few short outline stubs; the bee keeps three colour families.
- The Mac has not run any of this. It needs only `npm install`; nothing else is machine-specific.
- Left in the repo from the dropped roads: `pipeline/animate/*`, `src/toons/look-people.tsx`, the `puppet`
  option in `Player.tsx` / `toon-render.mjs` (inactive unless frames exist in `public/`), and
  `skill/medpeak-health/references/cast-sheet-prompts.md`. Remove them only when the owner says so.
- Magnific: 1,060 credits were spent by Claude on 2026-11-18 (two camera images, one Sunburst test, one
  Recraft test, two Sunburst sheets). The balance also fell by about 4,300 more that day with no call by
  Claude; the owner was told and it is not explained. Nothing was spent today.

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
Sixth pass the same day (owner, with a screenshot of the caught macro: "check all 4 characters face what is
this", "human character hand and arm design not proper", "I want second character speak also"):
- Defender cells: the lobed core I had drawn sat on each mouth like a blob. Removed; the grains keep to the
  rim. The catchers are drawn behind the cells, so one can never lie across a face.
- People (`humans.tsx`, `rig.tsx`): fuller arms (sleeve radii 7.6 / 6.9 / 6.0, bare 5.7 / 5.1 / 4.4), hands
  at 0.8, and the relaxed hand is an open hand with four fingers (it was a square fist with knuckle lines).
  This changes every video with people; the motion test still passes on all scripts.
- A second character speaks: the white cell (voice Adam) says "Got you! You go no further." (line X1, a close
  shot) before the virus's last line. `MacroCaught` takes `cell` (talk, blink); `macroSpotsAt` has a
  `whitecell` spot. Voiced for 12 credits (total for rabies now 849 against the owner's 800 cap).
Re-rendered (45.6 s). All checks and 44 tests pass. `toon:listen` / `toon:look` still not run here.
People look, a PROPOSAL (owner, 2026-11-18: "hand and arm design not proper", a stock character sheet as a
style reference, then "check Dr. Healthcare", then "Yes, doctor first"):
- All 20 reference Shorts are from the Dr. Healthcare channel (checked by their ids). Three preview frames
  of each were looked at (8 videos read closely). Their people: about 4 to 4.5 heads tall, arms of normal
  thickness with the sleeve part of the shirt, small mitten hands that hold things, they sit and turn
  three-quarter, a thin even outline, flat colour, plain rooms.
- `src/toons/look-people.tsx` + still `ToonPeopleLook` (1920x1080): Dr. Mira in that way of drawing (our own
  design): front, three-quarter, sitting with a clipboard, six poses, eight shared hands. It only draws a
  sheet. `humans.tsx` and every video are unchanged by it.
- NOT approved yet. Known weak points on the sheet: her hair is a smooth bob (it should stay curly), the
  sitting pose's far arm is awkward, hands are small in the pose thumbnails.
- If approved: port to `humans.tsx` (4.2 heads re-frames every shot with people; a thin outline reverses
  the ink line for people), then the other five people, then the motion test on all scripts.
**People, a new way: stock artwork + Illustrator + Animate, all by script (Windows PC only).** The owner
rejected the code-drawn people sheet (`src/toons/look-people.tsx`, nothing uses it) and asked for Illustrator
and Animate driven by code, no screen control. What is built, in `pipeline/animate/`:
- `run-ai.ps1` runs an Illustrator script (.jsx) through COM; `ai-inspect.jsx` lists how a stock file is
  built; `ai-extract.jsx` cuts it into transparent PNG parts (400%) and writes `parts.json`.
- `run-an.ps1` runs an Animate script (.jsfl), waits for "RESULT" in its log and then closes the Animate it
  started (Animate does not close itself after `fl.quit()`). `an-sheet.jsfl` lays all parts out.
- `rig-doctor.mjs` cuts elbow and wrist joints into the arms (ffmpeg), works out each pose from joint
  angles, and `an-rig.jsfl` draws it in Animate: one layer per piece, one keyframe per frame, transparent
  PNG frames out. `node pipeline/animate/rig-doctor.mjs sheet` gives 8 poses, `... clip` a 4 s talking test.
- **The owner chose the doctor himself (same day): Magnific #3908853, "Female doctor character model sheet
  with walk cycle animations and lip syncing".** `rig-doctor.mjs` now builds that one. Its artwork already has
  upper arm, forearm and hand pieces and seven lip-sync heads, so nothing is cut by ffmpeg any more. Parts
  are cut at 200% (`ai-extract.jsx` takes the scale as a 4th argument; the spec can give a `z`). The first
  doctor (#10005316) was my own pick without his OK and is dropped. Rule from the owner: show a numbered
  options sheet and build only what he picks. The channel is for a global audience, not an Indian one.
- **Upgrade the owner approved, done and run (2026-11-18):** `an-rig.jsfl` builds a real rig: one graphic
  symbol per part with its origin on the joint, hand / mouth / walk as symbols with several cels, layers
  parented like a skeleton (parenting must be set AFTER the matrices, on every keyframe, or Animate moves
  the children). `rig-doctor.mjs` does the motion: overshoot and settle, forearm and hand arriving after the
  upper arm, breathing and weight shift, blink, glance, eyebrows, five gesture hands (point, palm, open,
  offer, fist), mouth from the word timings of rabies line D1 (no new credits), an 8-step walk-in, a push-in.
  Run and looked at: pose sheet (8 poses) and a 6.9 s voiced clip (208 frames). Known gaps: Animate's own
  camera refused the script call (`camera.setPosition`: "Argument number 1 is invalid"), so the push-in
  scales the rig instead; the walk is the sheet's side view and cuts to the front view; the middle row of
  hands on the sheet is not cut (it sits inside group 94); not yet joined into the Toons video.
- **Blink and walk fixed after the owner's review (same day):** part 235/239 is the eye's outline, not a lid,
  so the closed eye is now made in her own colours (`closedEye()` in rig-doctor.mjs: skin lid, eye-shadow, lash
  line); a blink narrows the whole eye, shows the closed lid for 3 frames, reopens. The walk now moves one
  measured stride (72 units) per walk picture at a steady speed so the planted foot does not slide, comes in
  from the right (the walk is drawn facing left). The sideways squeeze was rejected by the owner ("use proper
  character angles"): the turn now uses the sheet's own standing side view (3 frames) and three-quarter view
  (4 frames), cut with rect mode as `view-side` and `view-q`, then the front rig. Rule: never fake an angle by
  flipping or squeezing when the sheet has that angle drawn.
- **60 fps, a walk with real foot contact, a smoother turn (owner's request, 2026-11-18):** output is now
  1080 x 1920 at 60 fps. `walk-rig.mjs` reads the eight walk drawings as a skeleton (each drawing is nine
  separate pieces; the long axis of each piece gives hip, knee, ankle and bone angles), so the walk is drawn
  at any moment between two drawings, and the foot that carries her is held on its spot while the body moves
  over it (drift 0 px by construction; stride is about 414 units a cycle, not the 576 guessed before). She
  stops into a standing pose fitted to the sheet's side view, which fades in over it; then the side view fades
  off the three-quarter view and that fades off the front rig, all three lined up on her head. Honest limit:
  the turn is still three drawings blended, not a drawn rotation, and a faint double body shows for a few
  frames in each blend.
- **The turn, final form (owner chose it, 2026-11-18):** the blend was rejected, and motion-estimated
  in-betweens (ffmpeg minterpolate) smear her face, so no blending is used. The turn is four whole angles one
  after the other: side (drawn), one AI angle between side and three-quarter, three-quarter (drawn), front
  rig. The AI angle was made with Magnific change-camera from the three-quarter view (rotate 22, 1k, 80
  credits, owner's OK) and cut out with `pipeline/animate/cutout.mjs` (removes only the white joined to the
  edge, so the white coat stays). It lives in `stock/doctor-3908853/turn/a2.png` + `a2.json`, not in git;
  without it the turn simply skips that angle. A second AI angle (rotate 338) turned the wrong way and is
  not used (80 credits lost). The account balance fell by 1,709 over that hour, 1,549 more than these two
  images; the owner was told and it is not explained yet.
- **Fixes after the owner's frame review (2026-11-18):** (1) pink slivers at the elbows were the bare arm
  that lies under each sleeve in the artwork: the bare upper arm is left out and the bare forearm is trimmed
  to its wrist end (`front-251w`, `front-260w`, made at run time). (2) hands left the frame after the push-in:
  the gestures are tighter and the push-in is 8% at most; the run prints how near the wrists come to the
  sides. (3) **Layer parenting is now off by default** (`RIG_PARENT=on` to try it): with it on, a full
  410-frame render lost her right upper sleeve from every frame, while 12- and 100-frame renders with the
  same data were right. So the .fla is one symbol per part on its own layer, not a parented skeleton.
  `RIG_ONLY="from,to"` renders only those frames, for quick tests.
- **Hands, after the owner's close-up review (2026-11-18):** a gesture hand now starts 6 units inside the
  cuff and is drawn behind the sleeve, so its cut wrist never shows; the bare-wrist piece is shown only with
  her own relaxed hand. Wrist points were re-measured on a grid. `hand-27` is two clasped hands, not a fist,
  and is no longer used; `hand-36` (flat palm, facing us) is the new "stop" hand and stands upright.
  `an-rig.jsfl` sets `fl.scriptTimeoutEnabled = false` (no "running for a long time" box) and re-fits the page
  after the time line has filled (the zoom is set twice to make Animate re-centre). The voice layer now goes
  on top instead of in the middle of the stack.
- **No "Publishing" box (owner asked to hide it, 2026-11-18):** Animate shows that box on every
  `exportPNG` of one frame. `fl.suppressAlerts` alone does not hide it. Exporting all frames in ONE call
  (`doc.exportPNG(uri, false, false)`) with alerts suppressed does: the box was seen in 0 of 8,584 checks over a
  full 410-frame run (44 of 464 before). That route writes 4500 x 8000 frames named from 0001 (300 dpi; the
  publish profile's PNG size is ignored), so ffmpeg scales them to 1080 x 1920. A full run takes about 9
  minutes and 513 MB of temporary frames in `out/animate/doctor-frames`. `RIG_SEQUENCE=off` goes back.
- **Hands the right way round, and the export put back (2026-11-18):** the owner saw every gesture hand
  facing the wrong way: each hand's `side` in `HANDS` was the opposite of what the drawing shows, so all five
  are swapped (the code comment says how to read a drawing's side). The two raised hands (wave, stop) showed
  their nails, so the back of the hand faced us: they are cut again without nails (`noSmall` in the spec,
  parts `hand-35p` and `hand-36p`) and now read as open palms; point, stop and wave bend the wrist to stand
  upright. **The one-call export is no longer the default:** once the owner set Animate's export back to 72 dpi
  (he had set 300 by mistake, which is why frames were 4500 x 8000), that route stopped on the "Export PNG"
  settings window and waited for a click (seen in 1316 of 1599 checks, no frames written). Default is again
  one call per frame, which shows the Publishing box but never waits; `RIG_SEQUENCE=on` uses the one-call route.
- **She is in the rabies video (owner said continue, 2026-11-18).**
  `node --import tsx pipeline/animate/rig-doctor.mjs shot rabies D` makes her performance for shot D from the
  script's own lines, words and timing (30 fps, 362 frames; D1 explain, D2 point, D3 both hands open) into
  `public/toons/rabies/animate/D-doctor/` with a `meta.json`. `toon-render.mjs` sees that folder and gives the
  actor a `puppet` (director.ts `ToonPuppet`); `Player.tsx` then shows the frames where the code-drawn doctor
  would stand, feet on the same floor, inside the camera. Nothing is written in toon.json, and a machine
  without the frames (the Mac) still draws the old doctor by code, so the two machines render different
  doctors until the frames are made there or copied. Run and looked at: stills and the full render
  (`videos/rabies/renders/toon.mp4`). Open: she is flat stock art with no outline and the kid beside her is
  the code-drawn ink style, so they do not match; the other people need the same treatment (owner picks each
  from an options sheet first). `toon:listen` / `toon:look` still cannot run on this PC.
- **NEW DIRECTION, owner's decision 2026-11-18: a full rebuild as an Adobe pipeline.** The stock doctor does
  not match the code-drawn look, so the videos are to be made in Illustrator + Animate + Premiere Pro, all by
  script, on both Mac and Windows, rabies first. His seven phases: (1) every character as a proper vector
  sheet in Illustrator, (2) a cast list he approves, (3) core engine files for Illustrator and Animate,
  (4) every shot storyboarded in Illustrator, (5) animation in Animate, (6) Premiere Pro for camera,
  captions, transitions, effects and graphics, (7) final 1080 x 1920, 60 fps MP4. People come from the same
  Magnific stock family as the doctor (premium, not AI; preview file names end in `_40831-NN`); the virus,
  cells and organs are to be drawn by code in Illustrator. Phase 0 (proof test) is done: an .ai and an .svg
  both arrive in Animate as real vector shapes with no dialog and become symbols (`doc.importFile(uri, false)`),
  so the new pipeline can be vector, not PNG pieces; Premiere Pro 2027 and Media Encoder are installed and
  Premiere's script route (`/C es.processFile`, fresh launch only) is already proven in the owner's OncoSphere
  pipeline. A cast options sheet (9 from the family, 3 kids from other families, no baby found yet) waits
  for his picks: `out/animate/cast-options.png`. The Mac side is untested: launchers there need osascript
  instead of COM / PowerShell, and the Adobe apps installed.
- **Cast picked by the owner (2026-11-18):** doctor #3908853 (kept), mom #3908847, patient #4469212
  (the "student" sheet), grandpa #4469210 (the "scientist" sheet, bald with glasses), kid #65613491 (another
  artist: the doctor's series has no child). No baby yet. The four new kits are downloaded to
  `stock/<role>-<id>/` (git-ignored) and opened once with ai-inspect.jsx (`work/structure.txt`,
  `work/doctor-source.ai`). Their artboards differ (mom 1611 x 597, patient and grandpa 7200 x 2200, kid
  4830 x 2240 in 5 layers), so sizes must be matched when the sheets are built. A line-up for his approval is
  `out/animate/cast-lineup.png`. **Magnific credits: STOPPED.** The balance fell 124,088 -> 122,379 -> 120,039
  during this day's work; only 160 of that is explained (two change-camera images). The second fall came
  around these four stock downloads, and the owner's rule is to stop and tell him if a download costs
  credits. No more Magnific calls until he says so.
- **Grandpa changed (owner, 2026-11-18):** the "scientist" kit read as a senior doctor (white lab coat, tie).
  He did not want it recoloured ("i want new dont edit this") and picked Magnific #29673007 (white beard,
  glasses, orange jumper; another artist, flatter style), now in `stock/grandpa-29673007/`. The old
  `stock/grandpa-4469210/` is unused. He also said the patient "looks off" (orange skin, more realistic face
  than the women of the series); a skin-match mock-up was shown, no decision yet. The cast now mixes four
  art styles (doctor+mom, patient, grandpa, kid); he has been told. Credits: the balance was 120,039 before
  and straight after this one download, so a stock download does not charge at once; the day's earlier fall
  of 3,889 beyond the 160 approved is still unexplained (a delayed charge is possible).
- **AI character sheet test (owner asked, 2026-11-18):** GPT 2.6 Sunburst on Magnific has no SVG output
  (raster only), and Magnific's own trace tool answers "SVG conversion is disabled for your account". What
  works: generate an "exploded" parts sheet with Sunburst (2K, High, thinking High, 3:2, the doctor's front
  view as a style reference; 175 credits, balance 120,039 -> 119,864, exactly as quoted), then trace it in
  Illustrator with `pipeline/animate/ai-trace.jsx` (Image Trace by script, 14 colours, white kept, the page's
  white removed, shapes sorted into parts by touching boxes): 201 shapes in 35 named groups (`part-01`...),
  saved as .ai and .svg with a parts list. Test files are in `stock/ai-test/` (git-ignored). Seen: the sheet
  has every part drawn apart with its hidden ends, six mouths, open and closed eyes, brows and four gesture
  hands. Faults: it did not copy the doctor's style (rounder, cuter cartoon), flat cloth traces slightly
  blotchy, the loose pair of eyes lost its whites, parts are numbered not named. The owner has not decided
  between this route and the stock kits.
- **Recraft v4 Pro Vector test (owner asked, 2026-11-18): worse than the Sunburst route.** One direct-SVG
  sheet with the same brief cost 375 credits (119,864 -> 119,489). It is a true SVG, but: 182 loose paths
  with no groups at all, 10 gradients although flat colour was asked for, hot-pink skin, staring eyes, the
  separated legs drawn bare (no trousers), duplicated torsos and arms, one leg ending in toes, only three
  mouths. It takes no reference image. File: `stock/ai-test/recraft/patient-recraft.svg`. For a rig sheet
  the Sunburst PNG + Illustrator trace (175 credits) is both better and cheaper.
- **Cast route chosen by the owner (2026-11-18): fresh GPT 2.6 Sunburst sheets, no reference image.** The
  stock kits are set aside. Sheet 01 (Doctor, front) is made: 175 credits, 119,229 -> 119,054; file
  `stock/cast-ai/01-doctor-front.png` (git-ignored), prompt and shared style block in
  `skill/medpeak-health/references/cast-sheet-prompts.md`. Waits for his approval before sheet 02. Credits: the
  balance also fell 260 (119,489 -> 119,229) between the Recraft test and this sheet with nothing run by
  Claude in between; reported to him, not explained.
- **Doctor sheet traced and joint ends fixed (2026-11-18, free, no generation):** `ai-trace.jsx` (16 colours,
  parts joined only when their boxes overlap by 6 or more, so a pelvis and the thigh below stay apart) gives
  307 shapes in 37 parts. The AI drew every limb end as a cut-open skin oval; `ai-fixcaps.jsx` refills the skin
  shapes at the ends of each clothed part with that part's own colour (27 ends: sleeves, trouser pieces,
  hip holes, coat shoulders, shoe tops), leaving the whole figure, the neck opening, head, neck, hands and
  the bottom row alone. Files: `stock/cast-ai/01-doctor-fixed.ai` / `.svg`. Parts are still numbered
  (part-01...), not named, and nothing is rigged or bent yet.
- **First test video of the AI doctor (2026-11-18, free):** `out/animate/cast-01-doctor-test.mp4`, 10 s, 1080 x 1920,
  60 fps, voice D1 + D3 of rabies. Chain for a sheet: `ai-trace.jsx` with `stacked` (shapes overlap, so the face
  keeps its skin under the eyes) -> `ai-fixcaps.jsx` (joint ends, now also writes `-caps.json`) -> `face-find.py`
  (finds the catchlights the trace drops, and the head's eyes and mouth) -> `ai-face.jsx` (adds the catchlights
  back as white vector circles, splits head-eyeL / head-eyeR / head-mouth off the head, puts a skin patch under
  each) -> `ai-partpngs.jsx` (one PNG per part at 200%) -> `rig-cast.py` (joints from the caps, poses, lip sync
  from the word timings, blinks, weight shift with feet held by two-bone IK; `preview` draws frames with PIL in
  seconds, `render` runs Animate and adds the voice). The bottom-row eyes of the sheet have no eye white, so she
  keeps her own drawn eyes and only the closed eyes and the mouths come from the bottom row. Parts are mapped to
  roles by hand in `CAST` in rig-cast.py; the next sheets need their own map. Animate still gets PNGs, not vectors.
- **Rules from the owner for Adobe scripting:** show the whole page in the window while a script runs
  (`fitPage` in an-rig.jsfl, `fitin` in the Illustrator scripts). Hidden pieces are shrunk to nothing on the
  page, never parked far away (that stretches Animate's work area and pushes the page out of view).
  `ai-extract.jsx` now moves each copy near the page origin before export (an artboard far from it is refused
  or silently exported at the wrong size). The Illustrator fit is not yet seen running.
- Stock sources (premium, not AI, 0 credits) are kept in `stock/` which is
  git-ignored because the repo is public. On the Mac it is missing: download it again there, or keep
  rendering people on the Windows PC. Outputs are in `out/animate/` (not in git).
- Run and looked at: parts sheet (120 parts), pose sheet (8 poses), talking test (120 frames). Not done:
  no blink, legs do not bend yet, mouth is not driven by the voice yet, nothing is joined into the Toons
  video yet, only the doctor exists. Waits for the owner's OK on the look before the other people.

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
