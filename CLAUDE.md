# Working in this repo (for Claude)

This repo is the whole MedPeak Health video studio. It is worked on from more than one Claude account and
more than one machine (a Mac, a Windows PC, and any new PC the owner sets up). The owner uses one at a time.
**Git is the only thing they share: nothing you learn or change reaches another Claude unless it is pushed.**
A new account starts with an empty memory, so everything the owner has decided is written down here and in
`HANDOFF.md`. Read both before you do anything.

The owner is a graphic designer, not a programmer. Talk to him in plain words, show him pictures, and never
make him read code.

## Start of every session

1. `git fetch --all --prune`, then `git status`. If the branch is behind its remote, `git pull --ff-only`
   before touching anything.
2. Read the top entry of `HANDOFF.md` on `origin/main` (`git show origin/main:HANDOFF.md`) and on the branch
   you are on. It says what the last session changed, what is open and what to do next.
3. List open pull requests and unmerged branches (`git branch -r --no-merged origin/main`). If one of
   them has a newer `HANDOFF.md` entry, read that too. Do not redo work that is already on a branch.
4. If you are on a long-lived branch, merge `origin/main` into it before new work, so fixes made on the
   other machine are in.

## Before you stop (or when the owner says he is switching machines)

1. Commit all work on its branch (see `CONTRIBUTING.md`) and push it. Nothing may stay only on one machine.
2. Add a new entry at the top of `HANDOFF.md`: date, machine, branch, what changed, what was run and its
   result, what was not run, what is open, the next step. Commit and push it with the work.
3. Tell the owner what is pushed and merged. **Do not ask him before committing, pushing, opening or merging a
   pull request** (his word, 2026-11-21): do it once CI passes. Uploads, making a video public, paid
   generation and deleting things still need his word.

## Rules for every machine

- Never push to a branch another machine is working on unless the owner says so. Open a branch of
  your own and a pull request.
- Scripts must run on macOS and on Windows:
  - "run only when started directly" uses `isMain(import.meta.url)` from `pipeline/lib/util.mjs`,
    never ``import.meta.url === `file://${process.argv[1]}` `` (it never matches on Windows).
  - Do not spawn `npx` with `execFileSync` (it is `npx.cmd` on Windows and fails). Start the tool with
    `process.execPath` and its `.js` entry file (the `remotion(argv)` helper in `pipeline/lib/util.mjs`).
  - Build paths with `node:path`; split path lists with `path.delimiter`.
- Machine setup (Node, ffmpeg, keys, YouTube login) is per machine and never in git. Note in
  `HANDOFF.md` what a machine has and what it is missing.
- Never commit keys, `.env`, YouTube logins, renders, clips, or the long videos' voice and music. The repo
  is public. The one exception, on the owner's word (2026-11-20): the Toons' voice clips, sound effects and
  music beds are paid for once, so they ARE committed, in `assets/toons-voice/<slug>/`, `assets/toons-sfx/`
  and `assets/toons-music/`.

## New PC or new Claude account: full setup

Do these once on a new machine. None of it needs the old machine except step 6.

1. **Install**: Git, Node.js 20 or newer (24 is in use), ffmpeg and ffprobe on the PATH, Python 3.12 with
   Pillow (`pip install pillow`; only for the storyboard sheets). On Windows install with `winget`
   (`winget search` for the exact id); the Poppins fonts must be installed for the user.
2. **Get the repo**: `git clone https://github.com/vedhckrs/medpeak-studio.git` (all the Toons work, rabies v4
   included, is on `main` since 2026-11-21; an existing copy: `git switch main` and `git pull`).
   Sign in to GitHub in a normal terminal window when Git asks; a sign-in window cannot open from
   Claude's own shell. The `gh` tool is not needed.
3. **Install the packages**: `npm install` in the repo folder. The first render also downloads the
   headless browser Remotion draws with.
4. **Check that it works** (all free, all local):
   - `npm run typecheck` and `npm test` must pass.
   - `node pipeline/toon-v8-sheets.mjs cells` must write `out/toons/sheets-v8/cells.jpg`.
   - `npm run toon:v8 -- rabies --at 5 --silent` must write one still of the rabies video.
5. **Keys** (only for paid steps; never in git, never printed, never pasted into a file in the repo):
   an ElevenLabs key in a file `.env` in the repo folder (`ELEVENLABS_API_KEY=...`), or point
   `MEDPEAK_ENV_FILES` at an existing key file. Every paid step refuses to run without `--approve` and a
   cap, and you show the owner the cost first.
6. **Voices come with the repo.** A Toon's voice clips are kept in `assets/toons-voice/<slug>/` (the rabies
   video has its 15). The render copies them to where the player reads them (`public/toons/<slug>/voice/`)
   on its own, and saves any clip you make on this machine back into `assets/`, so commit that folder
   after making voices. Making NEW voices costs ElevenLabs credits: `node pipeline/toon-voice.mjs <slug>
   --dry-run` (free: shows the cost), then `--approve --max-characters N` after the owner's OK.
7. **Claude itself**: this file is read automatically in this folder. The skill for this channel is in
   `skill/medpeak-health/`; link or copy it into the account's skills folder
   (`~/.claude/skills/medpeak-health`). The owner's personal toolkit notes (which apps and key files a PC
   has) live in his own `~/.claude/CLAUDE.md` on each PC and are not in this public repo: on a new PC ask
   him which tools are installed instead of assuming.
8. Add a line to `HANDOFF.md` saying what the new machine has and what it is missing.

## What the owner has decided (standing rules; a new account must follow them)

- **The channel is for a global audience.** Do not write, cast or dress for one country.
- **Show before you build.** Characters, looks, scenes and storyboards go to him as 16:9 JPG sheets for
  approval before they go into a video. Motion is approved separately from looks. Give a short plan before
  big work. Never upload anything without his word.
- **Posting schedule** (2026-11-22, shared with the cartoon pipeline in `~/Desktop/New/POSTING-SCHEDULE.md`): MedPeak posts
  2 Shorts a day at **12:30 and 21:30 IST** and long videos **Wednesday and Saturday 05:30 IST** only; the cartoon pipeline
  owns 08:00, 15:30 and 18:30 IST, never use those. Read the channel's real schedule first (`publish/schedule.py`), at most
  5 Shorts a day, 3 h between Shorts, 2 h between a long video and any Short; upload private with `publishAt`
  (`publish/upload.py <slug> <cut> --approve --slot`) and read the time back. Ask before each upload and before changing
  a time he set in Studio. Details: `skill/medpeak-health/references/posting-schedule.md`.
- **Everything is drawn in code, in look v8** (since 2026-11-20). Stock art, the Adobe Animate rig, the
  Adobe rebuild and AI-generated character sheets were all tried and rejected by him. Do not propose them
  again unless he asks. The code left from those roads (`pipeline/animate/`, `src/toons/look-people.tsx`,
  the `puppet` option in the old player, `cast-sheet-prompts.md`) is unused; remove it only on his word.
- **Consistency across the whole cast is his main test.** One shared kit, one line, one eye. If one figure
  looks more polished than its neighbours, simplify it.
- **Never mirror or squeeze a character to fake an angle.** Use the rig's real views (`facing: 'left'`
  keeps pockets, pens and partings on the character's own side).
- **People need a real nose in every view; hands are one piece with the forearm; a hand lying on the body
  has its fingers together; hands never overlap hands.** He called the old versions "not proper" and "like
  a patch". **A hanging hand hangs along the forearm** with only a slight curl and the thumb close to it (2026-11-23: a 26-degree
  curl read as a claw reaching forward, "hand wrong direction"), and **a hat faces the same way as the face** (the worker cap's
  sideways peak on a front face was "not looks good"): check both at full size in every new pose or character.
- **Engine v9 and script format 6** (2026-11-23): the owner approved every recommendation of the engine study
  (`plans/engine-upgrade-2026-11-23/05-blueprint.md`, Part 3, decisions 1-28) in his words: "All 28 recommend and start 2 to 3
  agents to fix and upgrade engine and everything i want proper as per report" (`06-owner-decisions.md`). The numbers every
  Toon is measured against: `skill/medpeak-health/references/toons-target.md`. New videos pause until the rebuild is reviewed.
  Five items are built AND shown to him as a sample before a pilot uses them: organ eyes (10), Dad's stubble (15), impacts
  (18), the music level (23), the caption tilt (27). Everything new is switched on by `"format": 6` in toon.json; videos
  already out (format 5 and older: rabies, no-sleep, creatine, quit-sugar, fasting, snake-bite) keep their rules and shot files.
- **Inside the body means INSIDE the region** (2026-11-23, decision 6; it replaces "inside the body means microscopic" of
  2026-11-17): an anatomy stage (`src/toons/v8/anatomy.tsx`), the organ in its real place with its real neighbours around it
  (3 or more), in depth planes; the micro scale only for cells, blood and germs (still in depth planes, standing on a tissue
  floor with contact shadows). Not a far-away diagram of an organ, not a mascot floating on a flat colour.
- **An organ's big moment shows the WHOLE organ, like the reference videos** (2026-11-22: "when big organ frame come i want
  full view of organs like ref video"): the organ fills the 1080 x 1920 frame, its face high on its own wall (above y 800), tiny
  arms, its surroundings around it (the diaphragm and gut round the liver; lips, palate, teeth round the tongue), and the
  organ itself changes state with the story (fat patches shrink, taste buds light up). Example: `src/toons/v8/sugar-organs.tsx`.
  From 2026-11-23 (decisions 7, 9, 10): **one eye is 120-170 px** in a whole-organ frame (never over 190; the small cast
  60-110), upright ovals, the far eye 8-12% smaller on a turned face, pupils that reach the rim (a before/after sheet of the
  whole cast first); **the story is drawn ON the organ** (contents, a liquid level, a cut window, sores, dark patches): no
  gauges, meters or clocks inside the body, at most ONE number plate a video, at most 2 texts on screen besides the caption
  and the watermark; **one warm flesh family** inside the body (60%+ of a body shot warm, any other colour family 8% or
  less, kept for the intruder; no flat orange, teal or lilac places), and pale, quiet rooms (saturation 0.22 or less,
  brightness 165+; still unique per video). Three soft exceptions to "no gradients" only (decision 8): see-through liquid,
  the soft redness of a swelling, one far soft background layer; plus a flat contact shadow. Gloss streaks stay banned.
- **Text on the picture is laid on the screen after the camera**, so a zoom never cuts it. Captions are
  one word at a time, no box, the key word bigger and yellow (2026-11-20). **From 2026-11-22 the caption sits 5% higher (y 1374) and is 40% smaller** (the owner: "caption make shift above 5% and small 40%"): every new toon.json sets `"caption": 2`; videos already out keep the first line.
  The caption stays where he put it (2026-11-23, decision 27): the staging keeps every face, eye and mouth OUT of the caption
  band (1324-1434 for `caption: 2`) and check L3 fails any frame where one is in it; a per-word tilt of -2 to +2 degrees is
  offered on a sample sheet first.
- **Final videos are 1080 x 1920, 60 frames a second.**
- **Work directly, deliver fast** (2026-11-20): do fixes yourself in the main session and give him the
  render; do not hand the work to subagents unless he asks for them.
- **Paid generation**: one recommended option, and the cost shown before any spend.
- **Watermark `@MedPeakHealth` on every video, the whole video** (2026-11-20). Small, clean, Inter Regular, about half transparent, inside the
  YouTube Shorts safe area (clear of the top bar, the right-hand buttons and the bottom title band). It moves
  three times, once per act: act 1 top right, act 2 bottom left, act 3 top middle. **Not on the CTA end card** (2026-11-21):
  it fades out as the card comes in. In look v8 it is
  `Watermark` in `src/toons/v8/hud.tsx`, drawn by the player.
  From 2026-11-23 (decision 26): act 2 sits at y 1180-1220 (at 1330 it read as a second caption line), act 3 takes the first
  of top-left / top-middle / top-right that is clear of heads in that shot, the mark turns ink-coloured (same opacity) on light
  backgrounds, and there is no watermark on the cover still. Check L5 fails a watermark on a head or within 120 px of the caption.
- **End every video with a CTA card: three strong points, each a big icon with short bold text** (2026-11-20).
  The headline on one line; the channel logo (`assets/brand/logo.png`) top centre in a circle with "MedPeak Health"
  typed below; the background in the logo's royal blue. A **professional male narrator, the same voice in every video** (Joey, `narrator` in `skill/medpeak-health/toons-cast.json`, the owner's pick 2026-11-20),
  speaks the CTA and ends with: "Follow MedPeak Health for more health tips that keep you safe." **Every line on the card
  is ONE line** (the headline and each point's bold text; 2026-11-21): `CtaCardV4` sizes the three points together to fit.
  **From format 6 the card is short** (2026-11-23, decision 25, option A): 5-6 s, a hard cut in (no slide-up), the headline and
  the three points come up together, Joey says only the follow line; the story ends on the answer or a loop line. Read the
  retention after two weeks against the older long cards. **Changed by the owner the same day** (on the quit-smoking final:
  "last line cta i want to speak by narrator"): Joey reads the WHOLE card again (headline, the three points, the follow line),
  each point landing on its word; toon.json `"cta": {"read": "card", "text": ...}`; the card runs his clip (S9: 15 s, 22% at
  most). Still a hard cut in.
- **No jiggle** (2026-11-21): a talking character does not squash on every syllable; mouths are smoothed (`talkSmooth`);
  the room camera's smoothing samples a fixed time grid (a moving one stepped 5 times a second).
- **No transitions: every scene change is a hard cut** (2026-11-21: "it looks fake"). **Music 10% lower** (`MUSIC_LEVEL`
  0.9 in video.tsx). **The hook opens on the person and comes at the lens** (no-sleep: Sam at 2 a.m., the dive into his
  brain inside the first shot, Gunk splats on the glass); no tag or number during the hook line. Details in
  `skill/medpeak-health/references/toons-v8-style.md`.
  From 2026-11-23 (format 6): **time cards come back** (decision 20): a black card with one short line ("3 DAYS LATER"),
  0.8-1.2 s, hard cut in and out, the watermark kept, the SAME framing after it with only the state changed, at most 3 a video
  (a cut, not a transition). **The music** (decisions 22-24): a new track for every video, always from one family (playful
  funk, slap bass, 130-165 BPM, a brighter half from the doctor's answer); the bed about 5 dB up in the pauses (music about
  6 dB under the voice) with a 3 dB dip under words (an A/B slice to him first, then `MUSIC_LEVEL` follows it); at most 2
  planned music stops on a gag (`"stop": true`), never on a word. **The hook** (decisions 3, 21): it still opens on the
  person and comes at the lens, but the first line is said INSIDE the story (a character's reaction or demand, first word
  at 0.3-1.2 s, the topic named by 3.0 s; "you" only between characters; one of the three hook choices may still be the
  "to the viewer" kind); one shared dive of 0.9 s with an even zoom, inside the body by about 2 s.
- **The look check must pass before the owner sees a video** (2026-11-21, after the creatine video went out with it failing).
  **From 2026-11-23 (decision 17) every check runs on the FINAL render**, measured on the picture with the caption band left
  out: `npm run toon:look -- <slug>` (picture checks C1-C8: picture still 78-94%, visible-action seconds 25% or less, big
  action 5% or less, 40 or fewer big-change frames a minute, a 4 s fully still stretch somewhere, and "not dead": every
  shot of 8 s or more has one action; 1 flash and 1 shake at most; no one-frame pop; outline 4-7 px), then
  `node --import tsx pipeline/toon-staging.mjs <slug>` and `toon-motion.mjs` (the layout log: nothing on a face, no text on
  text, the caption off every face, no half head at the edge, listeners look at the speaker...), and the scoreboard
  `node --import tsx pipeline/toon-score.mjs <slug>` (every number of the target against the 20 references; a 16:9 sheet in
  `renders/scoreboard.jpg`; the final render runs it on its own). **The scoreboard must say PASS before he sees a video.**
  Still is not the same as dead (he said "looks flat" on 2026-11-17 and "animation weak" on 2026-11-21): hold, then one action, then hold.
- **Icons only when the words say it**; non-human characters get a name tag held **2.5 seconds** (2026-11-21; arrow + tag box above the head)
  the first time they appear; no tags on humans; **no circle or halo around the character at all** (2026-11-21: "this circle
  I don't want, remove completely everywhere"; it was two white rings), no glow; a tag never covers a face. From 2026-11-23
  (decision 13) a job character (a little worker in uniform: guard, cleaner, courier...) or a chemical may wear its name on a
  paper band round its body (`BandLabel`) and then gets no extra tag; a tag's arrow ends on its own character's body.
  **The camera** (2026-11-23, decision 16; it replaces "one eased move per shot, a continuous dive inside the body"): locked;
  one framing for the whole of a body shot; at most ONE punch-in a video (2x or more, held 3 s+, never reversed); at most 6
  cuts a minute (aim 4, time cards not counted), a median hold of 6 s+, a body place held 8 s+; macros are no longer
  required. What keeps the eye is something entering the held frame. **Impacts** (decision 18, a before/after slice to him
  first): no automatic shake, at most 1 flash, 1 shake and 2 bursts a video, never on or near a face; a fight cloud instead.
  **Flow** (decision 19) never stops, but as a few particles in a band of 5% of the frame or less. **Characters look at each
  other** (decision 11): after the hook the listener looks at the speaker and the speaker at the listener; only the hook looks
  into the lens. Two-person room shots are framed tighter (decision 12: a head at least 190 px wide, a crop at the knees is
  fine). The patient shows the symptom on his body (decision 14: a mild mark in the kit line, no blood). Hard cuts between
  scenes (no transitions). No flicker: nothing appears or vanishes in one frame. The story stays under 60 s (format 6: 50-60 s);
  the narrator is never cut or sped up. Clothes changes must read at phone size. All the version 4 rules, with the code:
  `skill/medpeak-health/references/toons-v8-style.md`. (2026-11-20, 2026-11-23)
- **The script, format 6** (2026-11-23, decisions 1-5): one story with one question and one answer, at most 3 sourced facts
  in the whole story (at least 2 in the answer; the rest go to the description), at most 4 speaking characters plus the doctor,
  each with 3 lines or more; Dr. Mira in most videos (shape `visit`, about 7 in 10) with one calm, slower answer block of
  35-60 words at 55-80% of the story that names the condition, the cause and one thing to do; faster lines and real pauses
  (body cast 3.0-3.6 words a second, the doctor 0.3 slower; 3+ pauses of 0.5 s a minute, 2+ of 1 s; the same voices, only
  the pace changes); Retention 7 is read for Toons as in `toons-script.md` (the long videos keep it as written). All in
  `skill/medpeak-health/references/toons-script.md`, "Format 6: one story".
- **The engine rebuild** (2026-11-23, decision 28): written by agents in the session (2-3 in parallel, each owning its own
  files, `plans/engine-upgrade-2026-11-23/06-owner-decisions.md`), no spend on his Anthropic key; new videos pause until he
  has reviewed the samples, then the pilot (#7, quit smoking).
- **Work split** (updated 2026-11-20): **the session writes the code itself**; the owner's Anthropic key (env var
  `MEDPEAK_ANTHROPIC_KEY` of the `medpeak-studio` cloud environment; `ANTHROPIC_API_KEY` is not passed into cloud
  sessions) is used only where he asks for it, and then only through `pipeline/claude-run.mjs` (the $5 cap below).
  Show the ElevenLabs balance and the Anthropic cost at the START and END of each video.
- **Show the credit balance before and after every paid step** (2026-11-20). Every time anything spends
  credits (ElevenLabs voice or sound, Magnific, any other paid tool), tell him the balance right before
  (with the expected cost) and right after (with what was actually used). For ElevenLabs read it with the
  connector's `account_get_usage` (credits left = `character_limit - character_count`) or the API's
  `/v1/user/subscription`. If the balance cannot be read, say so and do not spend until he says go.
- **$5 hard cap of Anthropic spend per video** (2026-11-20). Headless Claude Code on the owner's key runs only through
  `node pipeline/claude-run.mjs <slug> --task <file> --label "<what>"` (ledger in `videos/<slug>/claude-spend.json`,
  one run at a time, `--max-budget-usd` from what is left). Never `claude -p` on his key directly, never in
  parallel. At the cap: stop and ask him.

## Where things are

| What | Where |
|---|---|
| What happened last, what is open | `HANDOFF.md` (newest entry on top) |
| How work lands (branches, commits) | `CONTRIBUTING.md` |
| The channel's skill for Claude | `skill/medpeak-health/SKILL.md` and `references/` |
| Look v8 drawing rules, cast identities, scene rules | `skill/medpeak-health/references/toons-v8-style.md` |
| Sheets and storyboard the owner approved | `skill/medpeak-health/references/toons-boards/v8/` |
| Look v8 code | `src/toons/v8/` (see the map below) |
| A video's script, voice timings, upload package | `videos/<slug>/toon.json`, `toon-timings.json`, `package/` |
| The old Toons engine (still plays the older videos) | `src/toons/*.tsx`, `pipeline/toon-*.mjs` |
| The long-video pipeline | `README.md` |

### Look v8 map (`src/toons/v8/`)

- `kit.tsx`: THE shared drawing kit (outline, palettes, `Shape`, `Eyes`, `Mouth`, little arms and legs,
  board pieces). Nobody changes it to suit one drawing.
- Cast: `people-rig.tsx` (one rig, 8 people; animatable: `talk`, `blink`, pose blends, `facing`, `bob`,
  `handAt`, `headAt`), `organs-a.tsx`, `organs-b.tsx`, `cells.tsx`, `germs.tsx`, `animals.tsx`; props in
  `props.tsx`. Each has its own `entry-*.tsx`, so one file's mistake cannot break another's render.
- Scenes: `scene.tsx` (shared scene pieces; `Put` tells the layout log where it is), `scenes-rooms.tsx` (kitchen, clinic),
  `scenes-body.tsx` (inside the body, micro places), and from engine v9 `anatomy.tsx` (the anatomy stages: an organ in its
  real place, built to hold 20 s and change state).
- Video: `play.tsx` (the contract: a shot is a pure function of `ShotNow`, time in seconds), `video.tsx`
  (the 60 fps player: camera, captions, voices, sound, music, transitions, the end card), `rabies.tsx` (one video's
  shots by id and its end card), `entry-video.tsx`.
- Version 4 (2026-11-20): `hud.tsx` (captions, icons, watermark, `CharTag` name tags, `CtaCardV4`), `micro3.tsx`
  (the five micro places in depth planes, `DiveCtx`), `shots-v3.tsx` (the body shots, tags, icons), `sheets-v4.tsx`
  and `entry-*-v4.tsx` (the v4 look sheets).
- Engine v9 (2026-11-23): **the layout log** in `play.tsx` (`LayoutCtx`, `FrameCtx`, `useReport`, `FrameMove`): every component
  that draws a face, a hand, a tag, a burst or a text reports where it is, and the checks read it
  (`pipeline/lib/toon-layout.mjs` probes a video into `renders/layout.json`; who reports what:
  `plans/engine-upgrade-2026-11-23/07-layout-log-wiring.md`). With the rebuild: `TimeCard` (hud), `MiniWorker` (cells),
  `Intruder` and the hero prop (props), the shared `Dive` and `FightCloud` (act).

### Commands (all free, all local)

    npm run typecheck                               the code must typecheck
    npm test                                        the tests must pass
    node pipeline/toon-v8-sheets.mjs [name]         character and prop sheets -> out/toons/sheets-v8/
    node pipeline/toon-v8-sheets.mjs --scenes       scene frames -> out/toons/scenes-v8/
    python pipeline/tools/toon-v8-storyboard.py out/toons/scenes-v8 out/toons/scenes-v8/boards
    npm run toon:v8 -- rabies --at 12.4             one still of the video at that second
    npm run toon:v8 -- rabies --draft               the whole video at half size (fast, to review motion)
    npm run toon:v8 -- rabies                       the final video -> videos/rabies/renders/toon-v8.mp4
    npm run toon:v8 -- rabies --from 30 --to 40     a slice (a motion test) -> renders/toon-v8-30-40.mp4
    node --import tsx pipeline/toon-v8-board.mjs rabies   the storyboard from the finished video -> renders/storyboard/
    node pipeline/toon-v8-sheets.mjs v4-            the version 4 look sheets
    node pipeline/claude-run.mjs rabies --status    the Anthropic spend of a video (the $5 cap)

    Engine v9 checks (2026-11-23; all on the FINAL render, all free):
    npm run toon:look -- <slug>                                  picture checks C1-C8 + M2 (caption band left out)
    node --import tsx pipeline/toon-staging.mjs <slug>           layout checks L1-L14 (writes renders/layout.json)
    node --import tsx pipeline/toon-motion.mjs <slug>            motion checks M1, M3-M5
    node --import tsx pipeline/toon-camera.mjs <slug>            camera checks V1-V3
    node --import tsx pipeline/toon-score.mjs <slug> [<slug>..]  the scoreboard (renders/scoreboard.jpg; must say PASS)
    node --import tsx pipeline/lib/toon-layout.mjs <slug>        the layout log alone
    python pipeline/tools/toon-layout-overlay.py <mp4> <layout.json> out.jpg <t> ...   the log's boxes drawn on real frames
    node pipeline/toon-v8-sheets.mjs anatomy                     the anatomy stage boards (phase 3)
    (`npm run toon:score` and `npm run toon:layout` are the same commands once package.json has them.)

Before showing the owner a frame, look at it yourself at full size, and at close crops of every face and
hand.
