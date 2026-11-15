# MedPeak Studio

Code pipeline for the **MedPeak Health** YouTube channel: researched, code-animated 3D-style medical
explainers, a long video plus Shorts from one script, and a ready-to-upload YouTube package.

```
topic → research (PubMed, WHO) → Retention 7 script → check → stills → quote → voice (ElevenLabs)
      → music + sound design → render (Remotion, 60 fps) → master -14 LUFS → QC → package → upload
```

## Setup (once)

```bash
npm install
node pipeline/make-sfx.mjs                    # sound effects, synthesised with ffmpeg
ln -s "$PWD/skill/medpeak-health" ~/.claude/skills/medpeak-health   # the Claude skill
```

Needs Node 20+, ffmpeg, and for YouTube the Python venv in `~/.config/youtube-analytics/`
(login saved there, never in git). ElevenLabs key: `.env` with `ELEVENLABS_API_KEY=...`, or
`export MEDPEAK_ENV_FILES=/path/to/existing/.env`.

## Make a video

| Step | Command | Cost |
|---|---|---|
| Research | `node pipeline/research.mjs <slug>` | free |
| Script gate | `node pipeline/check.mjs <slug>` | free |
| Look at every frame | `node pipeline/render.mjs <slug> --stills` | free |
| Voice quote / make | `node pipeline/voice.mjs <slug> --dry-run` · `--approve --max-characters N` | ElevenLabs credits |
| Music quote / make | `node pipeline/music.mjs <slug> --dry-run` · `--approve --max-seconds N` | ElevenLabs credits |
| Render | `node pipeline/render.mjs <slug>` (`--only long`, `--draft`) | free |
| QC | `node pipeline/qc.mjs <slug>` | free |
| Package | `node pipeline/package.mjs <slug>` | free |
| Upload (private) | `python publish/upload.py <slug> all --approve [--publish-at ISO]` | free |
| Preview in browser | `npm run studio` | free |

Paid steps refuse to run without `--approve` and a cap.

## Folders

```
pipeline/        research, check (Retention 7), voice, music, sfx, render, qc, package
src/             Remotion: MedVideo (long + Short), Thumbnail, scenes/Panels, scenes/art/Organs
videos/<slug>/   video.json (the script), research/, timings.json, package/  (renders/ and audio not in git)
publish/         upload.py, analytics.py, seo/ (bulk title/description tools)
skill/           the medpeak-health Claude skill
```

## Rules that are checked by code

- **Retention 7** (owner rule): no intro, promise by 15 s (Shorts 8 s), 3+ numbered beats, a new
  picture every 5 s (Shorts 3 s), twist at 50-75 %, best point in the last quarter, last line loops
  to the first.
- **Sources**: every number has a source id; no cure/miracle/detox claims.
- **Package**: no CAPS words, emojis or hashtags in titles; chapters from real timings; sources,
  `@MedPeakHealth`, disclaimer; uploads private + AI-disclosed.

Remotion is free for individuals and companies of up to 3 people; bigger teams need a company licence.
