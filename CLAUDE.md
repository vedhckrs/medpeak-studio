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
3. Tell the owner what is pushed and what waits for his OK (for example a pull request to merge).

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
2. **Get the repo**: `git clone https://github.com/vedhckrs/medpeak-studio.git`, then
   `git switch feat/toons-engage` (the branch the Toons work is on until the owner merges it to `main`).
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
  a patch".
- **Inside the body means microscopic**: among cells, with foreground, middle and background planes for
  depth. Not a far-away diagram of an organ.
- **Text on the picture is laid on the screen after the camera**, so a zoom never cuts it. Captions are
  one word at a time, no box, the key word bigger and yellow (2026-11-20).
- **Final videos are 1080 x 1920, 60 frames a second.**
- **Work directly, deliver fast** (2026-11-20): do fixes yourself in the main session and give him the
  render; do not hand the work to subagents unless he asks for them.
- **Paid generation**: one recommended option, and the cost shown before any spend.
- **Watermark `@MedPeakHealth` on every video, the whole video** (2026-11-20). Small, clean, Inter Regular, about half transparent, inside the
  YouTube Shorts safe area (clear of the top bar, the right-hand buttons and the bottom title band). It moves
  three times, once per act: act 1 top right, act 2 bottom left, act 3 top middle. In look v8 it is
  `Watermark` in `src/toons/v8/hud.tsx`, drawn by the player.
- **End every video with a CTA card: three strong points, each a big icon with short bold text** (2026-11-20).
  The headline on one line; the channel logo (`assets/brand/logo.png`) top centre in a circle with "MedPeak Health"
  typed below; the background in the logo's royal blue. A **professional male narrator, the same voice in every video** (Joey, `narrator` in `skill/medpeak-health/toons-cast.json`, the owner's pick 2026-11-20),
  speaks the CTA and ends with: "Follow MedPeak Health for more health tips that keep you safe."
- **Icons only when the words say it**; non-human characters get a 1-second name tag (arrow + tag box above the head)
  the first time they appear; no tags on humans. The camera moves smoothly (one eased move per shot, a continuous dive
  inside the body); transitions follow the story (dive into the skin, pull back out). (2026-11-20)
- **Work split** (2026-11-20): the owner's own Anthropic API key (env var `ANTHROPIC_API_KEY` of the `medpeak-studio`
  cloud environment; Claude Code headless, Opus 5.5, medium effort) writes code; the session checks, renders, commits,
  pushes and reports. Show the ElevenLabs balance and the Anthropic cost at the START and END of each video only.
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
- Scenes: `scene.tsx` (shared scene pieces), `scenes-rooms.tsx` (kitchen, clinic), `scenes-body.tsx`
  (inside the body, microscopic).
- Video: `play.tsx` (the contract: a shot is a pure function of `ShotNow`, time in seconds), `video.tsx`
  (the 60 fps player: camera, captions, voices, sound, music), `rabies.tsx` (one video's shots by id),
  `entry-video.tsx`.

### Commands (all free, all local)

    npm run typecheck                               the code must typecheck
    npm test                                        the tests must pass
    node pipeline/toon-v8-sheets.mjs [name]         character and prop sheets -> out/toons/sheets-v8/
    node pipeline/toon-v8-sheets.mjs --scenes       scene frames -> out/toons/scenes-v8/
    python pipeline/tools/toon-v8-storyboard.py out/toons/scenes-v8 out/toons/scenes-v8/boards
    npm run toon:v8 -- rabies --at 12.4             one still of the video at that second
    npm run toon:v8 -- rabies --draft               the whole video at half size (fast, to review motion)
    npm run toon:v8 -- rabies                       the final video -> videos/rabies/renders/toon-v8.mp4

Before showing the owner a frame, look at it yourself at full size, and at close crops of every face and
hand.
