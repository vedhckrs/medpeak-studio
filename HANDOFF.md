# Handoff log

Two Claude accounts work on this repo, on two machines, one at a time. This file is how one session
tells the next what happened. Newest entry on top. Read the top entry before you start; add one before
you stop. The rules are in `CLAUDE.md`.

---

## 2026-11-17 (night) - Windows PC (commits by VED) - branch `feat/toons-cast-3d`

The owner looked at the Toons cast and said it does not look good: he wants it cleaner, cuter, more
polished, without glare, bokeh and other unnecessary things, "pure 3D like the Dr. Healthcare channel"
(youtube.com/@Dr_Healthcare1/shorts). **No look has been approved yet.** This entry is on the branch
only, not on `main`.

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
