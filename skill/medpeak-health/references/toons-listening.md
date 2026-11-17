# MedPeak Toons: listening to a video (earshot)

Claude cannot hear. Until 2026-11-16 the sound of a Toon was checked only from the plan (how many
effects, how far apart, levels of the separate layers); nobody "listened" to the finished file
before the owner did, and the owner found it "too loud and poor". The owner then asked for
[earshot](https://github.com/Leonxlnx/earshot) to be installed and used ("install in skill also").

earshot is a free, open-source tool (MIT) that turns sound into text and numbers an agent can
read. It runs on this Mac's CPU; **nothing is uploaded**. It is the nearest thing to ears, not
ears: it reports what a sound is like and where it lands, not whether it is in good taste.
**The owner's ear still decides**; this step is there so fewer problems reach the owner.

## The step
After every render with sound, before the owner sees the video:

```
npm run toon:listen -- <slug>            # videos/<slug>/renders/toon.mp4
npm run toon:listen -- <slug> --file videos/<slug>/renders/some-other-render.mp4
npm run toon:listen -- --library         # every sound effect against its own description
```

For a video it prints, and saves in `videos/<slug>/renders/listen/report.json`:
- **loudness** of the finished file (LUFS, true peak) and how much it moves;
- **each planned sound** (the script's sound plan is handed to earshot as cues): whether a new
  sound really starts there, how many milliseconds early or late, and how far it stands out over
  what is already sounding (dB). Our rough reading: 6 dB or more = stands out, 3 to 6 = soft,
  under 3 = lost under the voice or the music;
- **holes**: stretches where the sound nearly stops. One of half a second or more is heard as
  the sound cutting out;
- **clipping**, if any;
- what the music reads as (a hint), and earshot's own summary of the whole soundtrack.

It also draws `renders/listen/sheet.png`: the video's frames above the soundtrack's picture
(spectrogram, loudness curve with the holes marked, labelled events, a marker for every cut and
every planned sound). **Open it and look**: a hole, a pile-up, a late hit show at a glance.

`--library` asks, for each of the effects in `assets/toons-sfx/`, "does this sound like the
description it was made from?", and says what it hears instead. An effect marked WEAK is not
used in a script until it has been made again or the owner has heard it and said it is fine.

## Reading it
- A planned sound that is **lost** sits under a word or the music: move it off the word or drop
  it. Do not simply turn it up (the calm mix is the owner's style, `toons-known-issues.md` no. 2).
- A planned sound that stands out by 15 dB or more is the loudest thing at that moment: make sure
  it is a sound worth that (a scene-change sound should not be).
- A **hole** of half a second or more: look at the music bed there (a rest in the track, the
  loop's seam, or the bed too far under the voice so that every pause between lines goes quiet).
- Finished loudness: about -14 LUFS and a true peak at or under -1 dBTP (the mix's target).
- Tags on events inside a finished mix ("glockenspiel note" on a sizzle) are hints only: voice
  and music are sounding at the same time. What an effect itself sounds like is the library
  check's job.
- Verdict words come from earshot's models. Quote the number with every claim ("strong, z +3.9").
  The models can be pleased by a sound that is still wrong; measurements (loudness, timing, holes)
  are the firmer evidence. earshot's own guide to its numbers is in `earshot-guide.md`.
- Never use earshot's `llm` command: it uploads the audio to an outside service.

## What the first listen found (2026-11-16, the three local renders with the calm mix)
- All three: -14.0 LUFS, true peak -0.9 dBTP, range about 2 LU. On target.
- **The scene-change sound is not a whoosh.** `whoosh-soft` is the only effect of 38 that does
  not match its description (weak, z +2.3; earshot hears "a kick drum; a punchy impact hit"), and
  it is the one sound every video plays at every change of place. In the mix it stands 19 to 25 dB
  over the bed: a thump at each scene change.
- **The sound nearly stops between lines.** Pill video: 0.8 s at the time card (the music track
  `bouncy` itself falls 15 dB there, 16.2 to 17.1 s into the track). Sugar video: 7 holes, 3 of
  0.6 s or more. Dinner video: 3 holes, 2 of 0.6 s. The owner's own videos have a constant bed.
- One story sound is lost: the `gulp` at 14.0 s in the pill video (+0.5 dB, under a word).
None of this was visible to the sound check, which counts and levels the layers but never read
the finished file. Fixes are open in `toons-known-issues.md`.

## What was changed, and the second listen (2026-11-17, pill video)
| | First listen | After the fixes, playful bed (`panic`) | After, calm bed (`doctor`) |
|---|---|---|---|
| Loudness | -14.0 LUFS, peak -0.9 | -14.0 LUFS, peak -0.8 | -14.0 LUFS, peak -0.9 |
| Holes of 0.5 s or more | 1 (0.8 s at the time card) | none | none |
| Planned sounds made out | 6 of 7 (the gulp lost) | 6 of 6 | 6 of 6 |
| Scene-change sound | a thump ("a kick drum") | a soft whoosh, +9 and +17 dB over the bed | a soft whoosh, +9 and +21 dB |
- A middle try (the stop-start bed `bouncy`, started 1.5 s in so its rests fell under words) still
  had a 0.7 s hole: a spoken word does not fill a rest in the music. Hence the rule "only steady beds".
- The whoosh still stands 17 to 21 dB over the bed at a new place. It is a soft sound now and its
  level is `SOUND.whoosh` in director.ts; whether it is quiet enough is for the owner's ear.
- Both samples went to the owner (`renders/after-playful-bed.mp4`, `after-calm-bed.mp4`; the old
  mix is `before-sound-fix.mp4`). The owner first chose Calm, listened again and chose **Playful** ("playful much better"): every script uses `panic`.

## What it does not do
- It does not watch motion. Motion is still measured frame by frame (`toon:camera`, `toon:motion`).
- It does not judge the voices' acting or whether a voice suits a character.
- Its scorecard (`earshot critique`) compares with product launch films, not with this channel:
  do not use that verdict. A profile of the owner's own best videos can be built with
  `earshot profile` once their audio is on this machine (it was not when this was written).

## Install (one time per machine, free, about 2.5 GB)
```
brew install uv
uv tool install --python 3.12 "earshot @ git+https://github.com/Leonxlnx/earshot@4ac3d2ac2b151e1c23376f9ce7f3047a17050013"
HF_HUB_DISABLE_XET=1 earshot doctor --fetch     # the two models, about 1.1 GB
earshot doctor                                  # must report both models in the cache
```
- The commit is pinned on purpose: that is the version whose code was read before installing
  (it only runs ffmpeg and loads its two models; no other network use without the `llm` extra,
  which is not installed).
- Without `HF_HUB_DISABLE_XET=1` the model download stood still at 0 bytes on this Mac.
- The tool lives in `~/.local/share/uv/tools/earshot`, the models in `~/.cache/earshot`.
  Nothing of it is in the repository; GitHub's checks do not run this step.

## Listening to the voices (`npm run toon:listen -- <slug> --voices [--against <approved slug>]`)
Owner, 2026-11-17, after I wrote "I cannot hear, please judge the voices": "Ear repo you have to
listen audio right". Right: listen first, then report what was heard. Do not hand the owner a
question the tool can answer.

Every voiced line is listened to on its own, and the finished mix is compared with a video the
owner already approved. A line is flagged when:
- earshot's AudioSet reading does not call it speech (under 60%), or calls it a speech synthesizer
  (over 65%). Both limits come from a control: the 15 lines of video 4, which the owner heard and
  published, read 66 to 91% speech and 11 to 59% synthetic (the pitched organ voices read highest);
- it clips, sits more than 2.5 dB from the other lines, starts more than 0.3 s late, or carries more
  than 0.6 s of sound after its last word.
A line much brighter or duller than its character's others is printed as a note: words and acting
change it. Results: `renders/listen/voices.json`.

What this cannot do, said plainly:
- **It does not understand words.** earshot has no speech-to-text, so a mispronounced or swallowed
  word is not caught. The word times come from the voice service, which only knows what it was
  asked to say.
- **earshot's text match is not validated for voices** (it says so itself): "a person speaking
  clearly" came back "no match" for every line, good or bad. Use the AudioSet labels, never `match`,
  for a voice. I found this by running the check on the approved video first: a check that fails
  everything measures nothing.
- **Taste.** Whether a voice suits a character is the owner's call.

