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
- **each planned sound** (from the script's sound plan) with whether it can really be heard, how
  many milliseconds early or late, and what it sounds like in words;
- **sound events nobody planned** (voices and music are in this list too: read it for surprises,
  such as a click, a thump, a burst);
- **earshot's own summary** of the soundtrack: sections, where the sounds fall against the cuts.

It also draws `renders/listen/sheet.png`: the video's frames above the soundtrack's picture
(spectrogram, loudness, labelled events). **Open it and look**: a gap, a pile-up of sounds, a hit
that comes late, a stretch where the music drowns the voice all show at a glance.

`--library` asks, for each of the effects in `assets/toons-sfx/`, "does this sound like the
description it was made from?" An effect marked WEAK is not used in a script until it has been
made again or the owner has heard it and said it is fine.

## Reading it
- A planned sound that is **NOT HEARD** is too quiet or sits under a voice: move it off the word
  or drop it. Do not simply turn it up (the calm mix is the owner's style: about 13 LU under the
  voice, see `toons-known-issues.md` no. 2).
- "sounds like" for an effect should be near what the story needs (a gulp, a sizzle, a drip). If
  earshot hears something else (speech, music, an engine), the effect is wrong for the moment.
- Finished loudness: about -14 LUFS and a true peak at or under -1 dBTP (the mix's target).
- Verdict words come from earshot's models. Quote the number with every claim ("strong, z +3.9").
  The models can be pleased by a sound that is still wrong; measurements (loudness, timing) are
  the firmer evidence. earshot's own guide on how to read its numbers is in `earshot-guide.md`.
- Never use earshot's `llm` command: it uploads the audio to an outside service.

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
