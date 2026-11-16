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
   when the owner says so. Every upload is labelled as AI/synthetic media and not made for kids.
5. **Git hygiene.** New work on a branch (`feat/...`, `video/<slug>`, `fix/...`), small commits, push,
   open a PR, merge after the owner's OK. Renders, audio and clips never go in git (see `.gitignore`).

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

## Files

- `references/retention-7.md` - the owner's global Retention 7 rule (copied from ~/Remotion/repo/skills).
- `references/channel.md` - analytics findings, title/description rules, goals, what worked.
- `references/medical-accuracy.md` - sourcing rules, wording that is not allowed, how to cite.
- `references/scene-types.md` - every visual type with its fields.
- `references/toons.md` - MedPeak Toons: the cartoon talking-organ Shorts format, our own look, roadmap.
- `references/toons-style.md` - the Toons look (v6): volume paint, materials, coloured eyes, real anatomy, body acting; thin coloured lines, clean hands, jointed arms on people, no wobble.
- `references/toons-blueprint.md` - the character blueprint: how to add an organ, cell, germ or person so it matches the cast. Read before designing any new Toons character.
- `references/toons-camera.md` - shot sizes, lenses, camera moves and what the director does on its own. Read before writing a Toon script.
- `references/toons-script.md` - how to write a Toon script: the 13-line shape, Retention 7 in dialogue, sources on every doctor line, the `toon-check` gate. Read before writing any Toon.
- `toons-cast.json` - the fixed voice of every Toons character. A character never changes voice between videos; a new character gets a new entry here (and a line in `references/toons.md`).
- Repo `README.md` - setup, commands, folder map. `CONTRIBUTING.md` - branches, commits, PRs.
