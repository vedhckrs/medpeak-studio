---
name: medpeak-health
description: Make, fix and publish videos for the MedPeak Health YouTube channel (3D medical explainers in English, India + US audience) with the medpeak-studio code pipeline - topic from real search data, PubMed/WHO research with a source on every number, a Retention 7 script, ElevenLabs voice, code animation (Remotion) with sound design and a ducked music bed, a long video plus Shorts, QC, and a ready-to-upload YouTube package and scheduled upload. Use whenever the user mentions MedPeak, MedPeak Health, "my health channel", a medical/health explainer video, "today's MedPeak video", a long video or Short about the body, a disease or a nutrient, channel analytics, titles, descriptions, tags or uploads for MedPeak, or wants to add a feature to medpeak-studio - even if they do not say "skill".
---

# MedPeak Health

The channel: **MedPeak Health** (@MedPeakHealth, channel id UCIsHQimO5caCzHDtUMl_Tmw), 3D medical
explainers. Repo: `~/Desktop/MedPeakHealth/medpeak-studio` (GitHub `vedhckrs/medpeak-studio`, private).
The owner is not technical: run everything yourself, explain in plain words, never print keys.

## Hard rules (in priority order)

1. **Quote, then wait.** Anything that spends money (ElevenLabs voice or music, AI video clips, any paid
   tool) is shown with its cost from a dry run, then waits for a yes in chat. One yes covers exactly
   the batch quoted, capped (`--max-characters`, `--max-seconds`). Research, scripts, code animation,
   rendering, QC and packaging are free and need no approval.
2. **Retention 7 before the script is written in full.** Show the seven-point table first
   (`references/retention-7.md`). `node pipeline/check.mjs <slug>` must say ALL PASS for the long video
   and every Short before voice is made. A failing script is fixed, never approved "with a note".
3. **A real source on every number.** Research with `pipeline/research.mjs` (PubMed abstracts saved in
   `videos/<slug>/research/`), WHO/NIH/ICMR pages. Read the abstract and copy the exact figure into the
   source's `note`. Never round a number into a different claim (2.75x is "nearly three times", not
   "three times"); prediabetes is not diabetes. See `references/medical-accuracy.md`.
4. **Nothing goes public on its own.** Uploads are private or scheduled (`--publish-at`); public only
   when the owner says so. Every upload is marked not made for kids, and
   YouTube's "AI use" question is answered **Yes** (the uploader sets it and reads it back).
   **But say nothing about how the videos are made** (owner, 2026-11-16): no line about code or
   AI voices in a title, description, comment or cover.
5. **Git hygiene.** New work on a branch (`feat/...`, `video/<slug>`, `fix/...`), small commits, push,
   open a PR, merge after the owner's OK. Renders, audio and clips never go in git (see `.gitignore`).

6. **$5 hard cap of Anthropic spend per video** (owner, 2026-11-20). Coding runs on the owner's Anthropic
   key go ONLY through `node pipeline/claude-run.mjs <slug> --task <file> --label "<what>"`: it books every
   run's cost in `videos/<slug>/claude-spend.json`, allows one run at a time, gives each run
   `--max-budget-usd` = what is left minus a $0.75 margin, and refuses to start under $1.50 left. Never call
   `claude -p` on his key directly, never run two at once. Spend made any other way is booked with
   `--book`. When the cap is reached, stop and ask the owner; only he can raise it for a video. Report
   `--status` at the start and end of each video and after every run.

7. **The version 4 rules for every Toon** (owner, 2026-11-20): the narrator Joey reads the end card (same voice
   every video, the whole Short under 60 s), the logo card in royal blue, the transparent Inter Regular watermark,
   icons only when the words say it, 1-second name tags with flat rings (no glow) the first time a body character
   appears, one smooth camera move per shot, a continuous dive inside the body, transitions that follow the story,
   no flicker, detailed micro places, clothes that read at phone size. All of it, with the code that does it, is in
   `references/toons-v8-style.md` ("Version 4 rules"). Read it before a new Toon.

## The workflow (one video)

```
0  topic      pick from real search terms + gaps        node publish/analytics.py 28 (search terms per video)
1  research   PubMed + guideline pages, abstracts saved node pipeline/research.mjs <slug>
                                                        node pipeline/research.mjs <slug> --check-urls
2  plan       Retention 7 table in chat, then video.json (retention, chapters, scenes, shorts, sources)
3  gate       node pipeline/check.mjs <slug>             ALL PASS or fix
4  stills     node pipeline/render.mjs <slug> --stills  look at every panel (contact sheet with ffmpeg tile)
5  quote      node pipeline/voice.mjs <slug> --dry-run   + node pipeline/music.mjs <slug> --dry-run  -> wait for yes
              (the dry run also draws the video's narrator: random from voices.json, not used by the last 7 videos)
6  voice      node pipeline/voice.mjs <slug> --approve --max-characters N
   music      node pipeline/music.mjs <slug> --approve --max-seconds N
7  gate again node pipeline/check.mjs <slug>             (now on real timings)
8  render     node pipeline/render.mjs <slug>           long + Shorts + thumbnails, mastered to -14 LUFS
9  qc         node pipeline/qc.mjs <slug>               QC PASS or fix
10 package    node pipeline/package.mjs <slug>          title, chapters, sources, tags, AI label
11 upload     python publish/upload.py <slug> all --approve [--publish-at ISO]   (after the owner's yes)
12 link       in YouTube Studio set each Short's Related video to the long video (no API for it)
13 learn      after 7 days: analytics for the new video -> notes in references/channel.md
```

MedPeak Toons (the cartoon Shorts) have their own steps; the order of work is in
`references/toons-script.md`: `toon-check` (script, Retention 7, own and unique rooms, accuracy) ->
`toon:camera`, `toon:motion`, `toon:staging` and `toon:sound` (measured, all required) -> silent preview and rooms board ->
owner's yes -> `toon-voice` -> the same checks on the real timings -> `toon-render` ->
`toon:listen` (earshot reads the finished sound: loudness, which planned sounds are heard, what each sounds like) ->
`toon-package` (title, description, tags, cover; no caption track: the words are on screen) -> `publish/upload.py <slug> toon`
only after the owner's yes. After the upload, each with its own yes from the owner:
`publish/after_upload.py <slug> toon --comment` (posts the
package's question from the channel; pinning is done by hand, the API cannot pin), `--public`.
`publish/recent.py` reads the newest uploads' views and, 1 to 3 days later, watch share and traffic
source (read-only).


ElevenLabs keys: `medpeak-studio/.env` holds ELEVENLABS_API_KEY, _2, _3, _4 (never committed). They are
used together: soonest-resetting first, pay-as-you-go last, automatic switch when one runs out.
Narrators: `voices.json` (15 young, energetic English voices). Every video gets a random one not used by
the last 7 videos; the long video and its Shorts share it. `voice.mjs <slug> --pick-voice` draws again. Python for YouTube: `~/.config/youtube-analytics/venv/bin/python -I`.

## video.json in one breath

`retention` (the 7 points with scene ids and exact lines) · `chapters` · `scenes[]` each with `id`,
`chapter`, `text` (one spoken sentence or two), `sources` (ids), optional `sfx`, and `visual` with
`panels` (one picture per <=5 s in the long video, <=3 s in Shorts) · `shorts[]` each with its own
`retention` and `scenes` (ids from the long video or new inline scenes) · `sources[]` · `package`.
Visual types and what they look like: `references/scene-types.md`.

## Channel facts that shape every video

Read `references/channel.md`. In short: search brings ~93% of views; India first, then the US; blood
sugar / insulin is the strongest topic; titles start with the exact search phrase (no CAPS words, no
emojis, no hashtags in titles); 1 comment per ~1,000 views, so every video asks a question; only
long-video watch time counts toward the 4,000 hours, so every Short links to a long video.

Topic ideas: `references/topic-bank.md` holds 70 researched candidates (17 Nov 2026). The owner wants
the first 15 made first. Mark a topic `taken` there before starting it.

## Files

- `references/retention-7.md` - the owner's global Retention 7 rule (copied from ~/Remotion/repo/skills).
- `references/channel.md` - analytics findings, title/description rules, goals, what worked.
- `references/medical-accuracy.md` - sourcing rules, wording that is not allowed, how to cite.
- `references/scene-types.md` - every visual type with its fields.
- `references/toons.md` - MedPeak Toons: the cartoon talking-organ Shorts format, our own look, roadmap.
- `references/toons-v8-style.md` - **the Toons look in use since 2026-11-20 (look v8): everything drawn in code in `src/toons/v8/`.** The ten drawing rules, the cast identities, the scene rules, what the owner approved. Read this FIRST for any Toons drawing or video; the older look files below describe the old engine, which still plays the older videos. The approved sheets and storyboard are in `references/toons-boards/v8/`. The repo's `CLAUDE.md` holds the owner's standing rules and the setup for a new machine.
- `references/toons-style.md` - the Toons look (v6): volume paint, materials, coloured eyes, real anatomy, body acting; thin coloured lines, clean hands, jointed arms and legs on people, no wobble.
- `references/toons-blueprint.md` - the character blueprint: how to add an organ, cell, germ or person so it matches the cast. Read before designing any new Toons character.
- `references/toons-camera.md` - shot sizes, lenses, camera moves and what the director does on its own. Read before writing a Toon script.
- `references/toons-script.md` - how to write a Toon script (from video 4 on: cold open on the damage, a short hook to the viewer, one open question instead of the counting, three hook choices for the owner): the steady style (a body stage, events, time card, the person at home, Dr. Mira), Retention 7 in dialogue, sources on every doctor line, the order of work and its required checks (`toon-check`, `toon:camera`, `toon:motion`). Read before writing any Toon.
- `references/toons-rooms.md` - every video gets a clinic and a home of its own, built from a recipe; what "unique" means and how the gate checks it. Read before choosing a video's rooms.
- `references/toons-listening.md` - the listening step: Claude cannot hear, so earshot (local, free, nothing uploaded) reads every finished video's sound and the effect library; how to run it, read it and install it. `references/earshot-guide.md` is the tool's own guide to its numbers.
- `references/toons-known-issues.md` - every bug found so far, its root cause and the check that now stops it; what is still open. Read before starting a new Toon and add to it the day a bug is found.
- `references/toons-reference-study.md` - what the top cartoon health Shorts do (measured on 20), and how our videos compare.
- `toons-cast.json` - the fixed voice of every Toons character. A character never changes voice between videos; a new character gets a new entry here (and a line in `references/toons.md`).
- Repo `README.md` - setup, commands, folder map. `CONTRIBUTING.md` - branches, commits, PRs.
