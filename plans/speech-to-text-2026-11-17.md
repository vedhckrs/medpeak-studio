# Speech-to-text for MedPeak: research and plan

**Why:** the ear tool (earshot) can hear that a line is speech, how loud it is and whether it
clips. It cannot understand words. So today nothing checks that every word of a line was said,
and said right. A speech-to-text tool on this Mac closes that gap.

**What it must do for us**
- Write down what each voice line actually says, so I can compare it with the script.
- Run on this Mac only. Free. Nothing uploaded.
- Handle short lines (2 to 5 seconds) in cartoon voices that are pitched up or down.
- Give the time of each word, so a wrong word can be pointed at.
- Have a licence that allows use for a channel that earns money.

**This Mac:** Apple M5, 16 GB memory, 199 GB free. It can run every option below except the
very large ones.

Nothing is installed yet. This is the plan.

---

## What I checked, and what I could not

- Read on 17 November 2026 from GitHub and Hugging Face directly: stars, licence, last update,
  download size, monthly downloads.
- The official ranking of these models (the Hugging Face "Open ASR Leaderboard") keeps its
  numbers in a file that needs a login, so I could not read it. Blog posts that quote it give
  different numbers for the same models. I therefore do not rank by tenths of a percent.
- On clean speech like ours, every option near the top makes very few mistakes. The honest way
  to choose is a test on your own voices (step 2 below), not a league table.

---

## The options, best first

| # | Tool (GitHub) | Model | Licence | Download | Why this place |
|---|---|---|---|---|---|
| **1** | **parakeet-mlx** (senstella/parakeet-mlx, about 1,000 stars, updated this month) | NVIDIA Parakeet TDT 0.6b v3 | tool Apache-2.0, model CC-BY-4.0 (free for paid use, with credit) | 2.5 GB | Built for Apple chips and the fastest there. Top-group accuracy. Gives the time of every word. It writes down the sounds it hears and "tidies up" less than Whisper, which is what a checker should do. Installs with one command using a tool already on this Mac. The model alone is downloaded 2.6 million times a month |
| **2** | **whisper.cpp** (ggml-org/whisper.cpp, 55,000 stars, updated yesterday) | OpenAI Whisper large-v3-turbo | MIT, tool and model | 1.6 GB (0.6 GB in a smaller form) | The most used speech-to-text in the world and the most forgiving of odd voices. Gives a confidence for every word. Best as the second listener: when the two disagree, that word is worth a look |
| 3 | faster-whisper (SYSTRAN, 27,000 stars) | the same Whisper models | MIT | 1.6 GB | Same ears as no. 2, but it does not use the Apple graphics chip. Only if no. 2 gives trouble |
| 4 | Qwen3-ASR (QwenLM, 3,900 stars) | Qwen3-ASR 1.7B | Apache-2.0 | about 4 GB (my estimate, not checked) | Among the most accurate. It is a language model that listens, so it is heavier and more likely to write what should have been said. Wrong habit for a checker |
| 5 | IBM Granite Speech 5.0 and Cohere Transcribe | 470M to 2B | Apache-2.0 | 1 to 5 GB (my estimate, not checked) | Strong and free. Newer, fewer Mac tools around them. Worth a look later if 1 and 2 disappoint |

**Looked at and ruled out**
- **CrisperWhisper 2.0** (nyrahealth): made to write down exactly what was said, mistakes
  included, which is ideal for this job. Its licence is for non-commercial research only. Not
  usable for a channel that earns money without buying a licence.
- **NVIDIA Nemotron 3.5 Transcribe**: reported at the top of the ranking, but it is a
  30-billion-parameter model. Far too big for this Mac.
- **WhisperX**: adds word times and speaker names on top of Whisper. We already have word times.
- **Moonshine, Vosk**: small and quick, built for live voice control. Less accurate.

**My pick:** start with no. 1 alone. Add no. 2 only if the test shows no. 1 misses things.

A correction: I told you this would be "roughly 150 MB". That was a small, weaker model. The
good ones are 2.5 GB (no. 1) and 1.6 GB (no. 2). You have 199 GB free.

---

## The plan

| Step | What I do | What proves it |
|---|---|---|
| 1 | Install no. 1 with one command and download its model (2.5 GB, from Hugging Face, the model's official home). Pin the version (0.7.0, released 4 November 2026) | It runs with the internet off |
| 2 | **Test it on lines you already approved.** Your four published videos have 62 voice lines whose words I know exactly. It writes each one down and I count the differences | Close to zero differences. If it stumbles on the pitched voices, it is the wrong tool and I try no. 2 |
| 3 | **Test that it catches mistakes.** I make faulty clips on purpose: a word cut out, two lines swapped, a word from another line pasted in | Every faulty clip is flagged. A checker that passes everything measures nothing (I learned this today with the ear tool) |
| 4 | Add it to the listening step: after every voicing it writes down each line and compares it with the script. Small differences in spelling are ignored ("two" and "2") | The finished Pilot 1 is run through it first |
| 5 | When a word is flagged, I tell you which line and what it heard. Re-voicing one line costs about 15 credits; I quote it first | |
| 6 | Only if needed: add no. 2 as a second listener | Lines where the two disagree are listed |
| 7 | Write it into the skill | |

**Cost:** nothing. Both tools and models are free.
**Time:** a few seconds per video once installed.
**Privacy:** everything runs on this Mac. No audio leaves it.

---

## What it will not do

- **Small slips may pass.** If a word is said slightly wrong but is still recognisable, a
  speech-to-text tool often writes the correct word. It catches missing, extra and clearly
  wrong words. It is a second pair of ears, not a pronunciation teacher.
- **It does not judge acting or tone.** Whether a line sounds funny or flat is still your call.
- **Very short cries** ("Ow!", "Nooo!") are sometimes written down oddly by any such tool. Those
  will be listed as "check by ear", not as faults.
