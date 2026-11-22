# Engine upgrade study 3 of 5: script, voices, sound and content

Date: 2026-11-23. Study only: no code changed, nothing committed, no money spent (everything below was
measured on this Mac with free local tools).
Builds on agent 1 (`01-visuals.md`: time in the body, one warm place, state on the organ) and agent 2
(`02-camera-motion.md`: 3 cuts a minute, about 4 places a story, the black LATER card, hold then act).
It does not repeat them. Their findings change the script: **fewer places and longer holds need a
script with fewer facts, real pauses and one story.** That is the core of this report.

**What I measured.**
- All 20 reference Shorts and our four newest videos (creatine, quit-sugar, fasting, snake-bite,
  `renders/toon-v8.mp4`; our end card left out, it is measured separately).
- Every spoken word written down with its time by the local speech model the pipeline already uses
  (`parakeet-tdt-0.6b-v3`, the same one as `toon:listen --words`). From that: words, talk speed,
  pauses, sentence length, questions, numbers, where the doctor comes in, first word, last word.
- Pitch of every sentence (librosa `pyin`, in earshot's own Python): how high, how varied, how many
  voice bands, the doctor's voice on its own.
- Loudness (ffmpeg EBU R128), the level of the sound in the pauses against the words, bass under
  words against bass in pauses (how much the music dips).
- `earshot timeline` on all 24 files: music style per section, tempo, sound events, music stops.
- Our side also from the source: `toon.json`, `toon-timings.json`, the voice clips and music beds,
  `toons-cast.json`, `director.ts` (`SOUND`, `GAP`, `bedAt`), `toon-rules.mjs`, `retention.mjs`.

**The sheets** (`plans/engine-upgrade-2026-11-23/agent3-sheets/`):

| File | What |
|---|---|
| `speech-pacing.json` | Per video: words, story seconds, talk speed, speech share, pauses, sentences, questions, numbers, doctor position |
| `voice-pitch-and-gaps.json` | Per video: pitch median and spread, share of high and low voices, voice level against the pauses |
| `loudness.txt` | Integrated loudness and range, all 24 |
| `earshot-timelines/*.txt` | earshot's summary of every soundtrack (music style, tempo, sections, stops) |
| `transcripts/ours-*.txt` | Our four videos, every line with its time (as heard) |
| `transcripts/ref-*-sentence-timing.txt`, `timings-refs-ours.json` | The references' sentence timing and length only. Their words are not kept: their scripts are someone else's work, and this report quotes no more than a word or two |
| `scripts/speech.py`, `scripts/voice.py` | The measuring scripts (re-runnable, free) |

---

## Part A. The numbers

"Ref" is the median of the 20. Story only. Talk speed is measured inside each sentence (first word to
last word), so pauses do not lower it.

| Measure | Ref median | Ref range | creatine | quit-sugar | fasting | snake-bite |
|---|---|---|---|---|---|---|
| Story length | **60 s** | 24-97 | 49.4 | 48.7 | 48.7 | 48.4 |
| Words in the story | **158** | 62-272 | 128 | 123 | 117 | 126 |
| Talk speed inside a sentence (words/s) | **3.2** | 2.8-3.9 | 2.6 | 2.6 | 2.8 | 2.8 |
| Share of the story with someone talking | **0.88** | 0.68-0.95 | 0.99 | 1.00 | 0.99 | 0.99 |
| Pauses of 0.3 s or more, per minute | **4.4** | 0-11.6 | **0** | **0** | **0** | 1.2 |
| Pauses of 1 s or more, per video | **2.5** | 0-4 | 0 | 0 | 0 | 0 |
| Longest pause | **2.4 s** | 0.2-12.1 | 0.16 | 0.16 | 0.16 | 0.32 |
| First spoken word | **1.1 s** | 0-7.1 | **0.0** | **0.0** | **0.0** | 0.1 |
| Sentences | 26.5 | 13-49 | 25 | 26 | 22 | 27 |
| Words per sentence | **5.8** | 4.8-7.5 | 5.1 | 4.7 | 5.3 | 4.7 |
| Sentences that are questions | 21% | 8-37% | 28% | 23% | 27% | 7% |
| Reaction words (huh, whoa, hey, ow, ugh, hmm, oh...) | **3.5** | 0-7 | **0** | **0** | **0** | 3 |
| Numbers said | **0** (16 of 20 say none) | 0-2 | 4 | 4 | 6 | 2 |
| Study / trial / WHO said out loud | **0** | 0-3 | 2 | 3 | 2 | 0 |
| Patient asks the doctor ("Doc, ...?") | **14 of 20** | at 57-83% of the story, median 69% | no | no | no | no |
| Doctor's answer | **about 50 words, one block** | 25-97 | 2 short lines (20%) | none | none | 2 lines (16%) |
| Sentences with median pitch over 250 Hz (high, cartoon) | **41%** | 18-85% | 16% | 38% | **0%** | 19% |
| Sentences under 140 Hz (adult male) | **27%** | 0-56% | 40% | 38% | **77%** | 44% |
| Doctor's voice (14 refs) | **low male, 113 Hz, 2.8 words/s** (13 of 14) | 102-202 Hz | Mira (female) | - | - | Mira |
| Sound in the pauses, below the words | **2.7 dB** (19 refs) | -1 to 14 | music 11.3 dB under* | 12.7* | 10.9* | 13.5* |
| Bass (music) under words, against pauses | **-2.6 dB** (a dip) | -4.4 to +4.4 | -1.3 dB (`bedAt`) | same | same | same |
| Sound accents in the non-talking time, per minute | **15.6** | 6.7-31 | 0 | 0 | 0 | 1.2 |
| Music style (earshot) | **funk, playful; 20 of 20** | | funk + corporate | corporate + kids' piano | funk + corporate | ukulele + piano + corporate |
| Music tempo | **154 BPM (14 of 20)** | 103-155 | 112 | 69 | 96 | 100 |
| Short planned music stops (0.3-0.6 s) | **3** | 0-10 | 0 (forbidden) | 0 | 0 | 0 |
| Loudness | -9.4 LUFS (mastered hot, clips) | -10.9 to -8.2 | -14.0 | -14.1 | -14.0 | -14.0 |
| Loudness range | **5.9 LU** | 1.9-9.5 | 2.1 | 5.9 | 3.4 | 2.0 |
| After the last story word | **0-2 s, no end card, no "follow"** | | **17.4 s** card + narrator | 16.4 s | 16.5 s | 13.3 s |

\* Ours has no pauses to measure in, so the music level is worked out from the stems: the voice clips
against the bed at the player's own gain (`MUSIC_LEVEL 0.9 × SOUND.bed 0.56`), in the same way.

In one sentence: **they talk faster, then stop; we talk slower and never stop. They tell one small
drama and give the facts once, at the end, from a calm low doctor; we deliver five or six sourced
facts, one per character, wall to wall, over a quieter, slower, less consistent music bed, and then
add a 13-17 s end card.**

---

## Part B. Findings

### 1. The hook: they open in the story, not at the viewer

**(a) References.** None of the 20 first lines speaks to the viewer. They open on a character reacting
to something that is happening right now: 5 of 20 open with a one-word reaction ("Huh?" type: refs 05,
09, 12, 13, 18), others start an action (ref 01 a trim, ref 06 an egg sent out, ref 19 a feeding) or
complain (ref 03, ref 04 "my head hurts"). The topic is named by the thing in the picture inside about
3 s: ref 10 says "sleeping pill" at 1.6 s, ref 01 "nails" at 1.9 s, ref 09 "pill stuck" at 2.6-3.0 s,
ref 13 "antibiotic" at 3.5 s, ref 02 the dark lung at 2.2 s. The first word comes at a median **1.1 s**
(ref 17 waits 7.1 s, ref 15 3.1 s): the first second is the picture plus a sound hit (earshot hears a
whoosh, a riser or an impact at 0.04-0.12 s in every reference). The question that holds the viewer is
asked by a character, about the strange thing ("why is this here?"), and the doctor answers it at the
end. There is no promise line and no counting in any of them.

**(b) Ours.** First word at 0.0 s, a line to the viewer, by rule: `HOOK` in `toon-rules.mjs` (8 words
or fewer, said in 2 s, must say "you"/"your", two title words, a consequence). All four hooks obey it
("Take creatine? Your scale jumps!", "When you fast, I scream!"). The open question is then asked again
in line 2 (creatine A2 repeats the hook word for word) and must be answered with two shared key words
in the last quarter.

**(c) Why it matters.** A line to the viewer is an advert voice: it says "this is a lesson". A
character reacting to an intruder says "something is wrong here", and the viewer watches to find out
what. It also gives the picture the first second, which agent 1 (first frame is the cover) and agent 2
(the hook dive must not be a jump) both need. Our hook also forces the topic word and "you" into five
words, which is why three of four hooks sound alike ("X? Your Y!").

**(d) Change.**
- `toons-script.md`: a new hook kind, **"in the story"**: line 1 is a character's reaction or demand
  about the intruder or the damage, line 1 or 2 names the topic object by **3.0 s**, and a character
  asks the story question ("why is this here?", "who did this?") by **6 s**. The viewer is never
  addressed. "You" is allowed only between characters.
- `toon-rules.mjs` `HOOK`: add `kind: 'story' | 'viewer'`. For `story`: drop "says you"; keep "short"
  (8 words); move "title words" from "in line 1" to "said by 3.0 s"; allow a **0.4-1.0 s lead** before
  the first word (the picture and a sound hit first); keep the three choices for the owner.
- `retention.mjs` / `checkToon`: for `story` hooks, the "promise" point is met by the character's
  question (point 3 open question already exists; point 2 becomes the same line).
- **Check** (new, after voicing, from `toon-timings.json`): the topic word's spoken time is at most
  3.0 s; the first word starts between 0.3 and 1.2 s; the hook line has no "you" aimed at the camera
  (a warning, not a failure, while the owner decides).

### 2. One story, one condition, the facts at the end. We give a fact per line.

**(a) References.** Each reference is **one condition, one cause, one fix**. The body part is pure
drama: an organ argues with an intruder, refuses, gets angry, something breaks, it gets worse, often a
LATER card (agent 2). Almost no facts are stated in the body part. Then 14 of 20 cut to the doctor at a
median **69%** (57-83%); the patient asks one "Doc, why...?" question, and the doctor answers in **one
block of about 50 words** (25-97) that (1) names the condition by its medical name (refs 09, 13, 16, 17,
19 and others: "this is called...", "you're dealing with..."), (2) gives the cause in plain words, (3)
ends with **one action** (refs 01, 02, 05, 09: cut straight, quit, drink water after eating, a full glass
with a pill) or "that's why..." (refs 05, 16, 18, 19). The other 6 end without a doctor, on the
consequence (ref 20 ends on the person's own question, refs 11 and 15 stop mid-sentence, which loops the
video back to the start). Characters per video: 3 to 6, and **each comes back**: the two organs or the
organ and the intruder carry most lines, back and forth.

**(b) Ours.** Each video is a chain of separate facts, a new character for most of them: creatine
covers water weight, 95% to muscle, the recharge, short bursts, endurance, creatinine on a blood test,
kidney safety, telling the doctor, kidney disease, hair loss: **10 facts in 49 s**, 18 lines, 6 speakers
(the battery speaks once, the mom twice). Quit-sugar 7 facts, fasting 6, snake-bite 7. 32-40% of our
lines name a source (`src`), and the rule "every line is sourced or chat" pushes facts into every scene.
A doctor appears in 2 of 4 and only for 16-20%; quit-sugar and fasting have none (allowed by the
`fight`/`clock` shapes).

**(c) Why it matters.** This is the root of the agent 1 and 2 numbers. One fact per line means one
place per fact, which means 16-25 cuts a minute and 4-9 body/room switches. A story with one problem
can stay in one place for 40 s while the problem gets worse (agent 1 finding 7, agent 2 finding 1). And a
viewer remembers one clear "that's why" much better than ten facts; the reference's comments are about
the one thing ("I didn't know that about pills").

**(d) Change.**
- `toons-script.md`, `toons-blueprint.md`: a script has **one question and one answer**. The story part
  (first 55-75%) shows the problem and makes it worse, in **2 to 4 places**; the payoff (last 25-45%)
  explains it. A **fact budget of 3**: at most 3 sourced facts in the whole story, at least 2 of them in
  the payoff. Extra facts go to the description.
- Make the `visit` shape the default (doctor's room, one scene, near the end) and keep `fight`, `clock`,
  `crew` as the "no doctor" 30% (refs: 6 of 20 have none).
- Characters: **at most 4 speaking characters plus the doctor**; every speaking body character has
  **3 lines or more** (a one-line character becomes a non-speaking one or is cut).
- **Checks** in `checkToon`: `One story` (sourced fact lines 3 or fewer before the answer block counts 1;
  warn over 4, fail over 6), `Cast returns` (each speaking character 3+ lines, max 5 speakers),
  `Payoff late` (the answer block starts at 55-80% of the story).

### 3. The doctor's turn: a question, then one calm block

**(a) References.** In 14 of 20 the patient opens the doctor scene with a "Doc, ...?" question about the
symptom (13 measured at 57-83% of the story). The doctor answers in 4-6 sentences in a row (ref 05: 97
words; ref 13: 63; ref 19: 56), often after the patient's short reaction. The doctor is one fixed low
male voice (13 of 14 at 102-143 Hz, median 113 Hz) and speaks **slower than the body cast**: 2.8 words a
second against 3.2. That change of speed and pitch tells the ear "now the truth".

**(b) Ours.** Dr. Mira (Matilda, female, `speed 0.98`) gets two short lines in creatine and snake-bite.
The gate's **Banter** rule (no more than 3 lines in a row by one speaker) and **Short lines** (20 words)
stop a 50-word answer, and the doctor share rule (15-50%) applies only to the `visit` shape.

**(c) Why it matters.** The reference's payoff is a solid block the viewer waited for. Ours spreads the
payoff thinly across characters, so there is no moment that pays off the question.

**(d) Change.**
- `toon.json`: an `"answer": true` group of 3-6 lines by the doctor (or, in a no-doctor shape, by the
  wisest body character), 35-60 words in all, ending with one action line or a "that's why" line.
- `toon-rules.mjs`: **Banter** allows up to 6 lines in a row inside the answer group; the answer group
  must name the condition or the mechanism (a word from the title or a `term` field), contain one
  imperative action (take, drink, cut, keep, ask, wait, see) or "that's why", and its lines carry `src`.
- Casting: keep Mira (she is our own; copying their male doctor is not the point), but give her the
  reference's **contrast**: speed 0.92-0.95 (about 2.7-2.9 words/s), the lowest, calmest voice in the
  video, never pitched. A **check**: the answer block's talk speed is at least 0.3 words/s slower than the
  body characters', measured from `toon-timings.json`.

### 4. Pauses: they stop and let the picture act; we never stop

**(a) References.** Someone is talking 88% of the story (68-95%). There are 4.4 pauses of 0.3 s or more
a minute, median 1.1 s long, and 2.5 pauses over 1 s per video; the longest is a median 2.4 s and up to
12 s (ref 02 at 33-45 s: the lung is cut out with no words). The pauses sit **after a surprise** (a
"Huh?" then a beat), **on an action** (the object slides in, the cola pours: agent 2 finding 4) and
**before the doctor**. In the pauses the sound does not drop: it sits only 2.7 dB under the words
(finding 7).

**(b) Ours.** `GAP = 0.14` s between every line and `SHOT_GAP = 0.25` s between scenes, so the longest
pause in three of our four videos is 0.16 s and someone talks 99-100% of the story. `beat` exists (0-3 s
of silence after a line) but is used once in four videos (creatine A2, 0.3 s).

**(c) Why it matters.** Agent 2's "hold, then one action, then hold" needs room in the soundtrack: an
action under a talking voice is half seen. A pause after a surprise is also where the laugh lands. And
wall-to-wall talk is tiring at 50 s; the pauses are what make 60 s feel shorter than our 49 s.

**(d) Change.**
- `director.ts`: `GAP` 0.14 becomes a **default of 0.22 s**; add `pause` (seconds before a line):
  0.5-0.8 s automatically before a reply to a surprised or shocked line (`emotion: shocked/scared`),
  0.6 s before the answer block, 0.4 s after a scene's first event. `SHOT_GAP` 0.25 becomes 0.5 s.
- Script rule: **2 or 3 silent beats of 1-2.5 s** a video, each one on a picture action (an object
  enters, a fill, a reveal: agent 2's `enter`/`fill`/`reveal`), written as `beat` on the line before.
- **Check** `Breath` (in `checkToon`, on real timings): talking share 0.80-0.93; at least 3 pauses of
  0.5 s or more and 2 of 1.0 s or more; no silent beat without a picture event in it (from the event
  list); no beat over 3 s.

### 5. Talk speed: faster lines, then the pause

**(a) References.** 3.2 words a second inside a sentence (2.8-3.9; ref 04 3.85, ref 11 3.62). Body
characters are quicker still; the doctor slower (2.8).

**(b) Ours.** 2.6-2.8 inside a sentence. The cast speeds are 1.0-1.15 and `tempo` 1.1-1.15 on a few
lines, but most lines are slowed by commas and "..." in the text (creatine A2, quit-sugar D1/D2, fasting
B2/B3/E2/E3: the ellipsis splits are slow joins), and the 0.14 s gap is spent as slow speech, not as
pauses.

**(c) Why it matters.** Same total time, better rhythm: faster lines plus real pauses (finding 4)
sound lively; slow lines with no pauses sound like reading.

**(d) Change.**
- `toons-cast.json`: body characters `speed` 1.12-1.2 (ElevenLabs' top is 1.2); people 1.05-1.1; doctor
  0.92-0.95. For voices that already exist (no new spend), raise the per-line `tempo` (ffmpeg, free:
  the same step that applies `pitch`) up to 1.15.
- Script rule: no "..." inside a story line; split a long line into two lines by two speakers instead
  (the "...and" lines in fasting B2/B3 and E2/E3 become a back-and-forth).
- **Check** `Talk speed` (after voicing, from the word times in `toon-timings.json`): median inside a
  line 3.0-3.6 words/s for body characters, 2.6-3.0 for the doctor; fail any line under 2.4 or over 4.0.

### 6. Lines: reactions and conflict, not statements

**(a) References.** 26 sentences, 5.8 words each (4.8-7.5), 21% questions, 3.5 reaction words a video
(huh, whoa, hey, ow, ugh, hmm, oh), plenty of casual address between characters (bro, dude, man in 9 of
20). The body part is a quarrel: orders, refusals, blame, threats, insults, and a joke at the moment of
damage (a character denies the obvious, ref 02; an organ says it will get revenge, ref 01). Numbers:
**16 of 20 say no number at all**; the four that do say one (ref 04 "over 99%" is the doctor's only fact).
No one says "study", "trial" or "WHO".

**(b) Ours.** Sentences are shorter (4.7-5.3 words) but they are **statements about the body**: "Almost
all of me gets into your blood", "I keep sugar for between meals", "Under twelve teaspoons a day, and I
get fewer holes". Reaction words: 0 in three videos. Numbers said: 2-6 a video ("ninety-five percent",
"twelve teaspoons", "nine days", "sixteen hours" twice, "twelve hours", "five million", "forty percent",
"one kilo", "three months"). Source words said: 2-3 a video ("Studies say...", "In trials...", "The WHO
says..."). The jokes are good when they exist (snake-bite D2 "Yes! Do all of that! We love it!",
quit-sugar's "I'll be back") and they come from conflict, which proves the point.

**(c) Why it matters.** Statements are a lecture in costume; conflict is a scene. Every number said
aloud is a second number on screen (the format-5 tag rule writes it as a plate: agent 1 finding 3).

**(d) Change.**
- `toons-script.md`, a line style list: body part lines are **demands, refusals, complaints, blame,
  threats, surprise**; at least **3 reaction words** in the story; at least one **"no" between two
  characters** before the midpoint (someone refuses); a joke on the damage moment.
- **One number** a video, said once, in the answer block (agent 1's one plate). "Study / trial / WHO"
  said aloud **once at most**, and only where the wording needs it to stay honest (a trial in kids must
  still say so: medical-accuracy.md wins over style).
- **Checks** (warnings first, so the owner can see them on the script sheet): `Numbers said` (more than 1
  warns, more than 2 fails), `Source words said` (more than 1 warns), `Reaction words` (fewer than 2 warns),
  `Sentence length` (mean 5-7.5 words).

### 7. Voices: more high cartoon voices, more contrast, fewer characters

**(a) References.** Median sentence pitch 222 Hz; **41%** of sentences are above 250 Hz (squeaky,
young, cartoon) and 27% below 140 Hz (a man). The organs and intruders are mostly the high ones (ref 03:
85% high; ref 11: 70%; ref 07: 64%); the doctor and the dads are the low ones. Every voice moves a lot
inside a sentence (pitch spread 10-22 semitones, median 11.5): it is acted, near shouting at times.

**(b) Ours.** Fasting: **0%** high, 77% low: stomach (Callum −1), liver (Eric −1), brain (Chris +1), Lardo,
grandpa (Bill −1) are five grown men in a row, and the brain and liver sit within 2 semitones of each
other. Creatine 16% high, snake-bite 19%, quit-sugar 38% (the best: Sweetie and the tongue). Our voices are
just as acted (pitch spread 13-17 semitones), so delivery energy is not the gap; **casting range** is.

**(c) Why it matters.** With the eyes small (agent 1) and the bodies still (agent 2), the voice is what
tells the ear who is talking. Two similar low voices in one scene sound like one person. High voices also
cut through a louder music bed (finding 8) without turning the voice up.

**(d) Change.**
- `toons-cast.json` rule: small or young body characters (cells, crystals, drops, intruders, the tongue)
  are **pitched +3 to +6** or cast from a young/cartoon voice; big organs may be low; at least **40% of
  body lines** from voices above 250 Hz; the doctor the calmest (finding 3).
- **Check** `Voices apart` (in `toon:listen -- <slug> --voices`, which already listens to every clip; add
  a free pitch measure with librosa): fail when two characters who speak in the same scene have median
  pitches within **3 semitones**; report the high/low shares against 30-55% / 15-45%.
- Re-casting existing videos is not needed; this is for new scripts (each new voice is picked free from
  the library samples with earshot, as was done for snake-bite).

### 8. Music: one playful funk family, louder in the pauses, a small dip under words

**(a) References.** earshot tags **all 20** as funk music, "playful and quirky"; **14 of 20 run at
154-155 BPM**, the others 103-125: one channel sound. Many switch to "confident and cool" for the last
section, which lines up with the doctor scene (ref 02 at 42.8 s, ref 05 at 38.8 s, ref 06, 13, 15, 17, 20).
Levels: the sound in the pauses is only **2.7 dB** under the words (median of 19); the bass under the
words is **2.6 dB** lower than in the pauses: the music dips a little under speech and comes back up in
every gap. Most have a few **planned stops** of 0.3-0.6 s (median 3; refs 02 and 09 have 10), the music
cutting out on a gag. Loudness range 5.9 LU. (They are mastered very hot, -9.4 LUFS, and ref 01 clips in
90 places. YouTube turns them down to about -14; do not copy that part.)

**(b) Ours.** Each video has its own track (owner rule), but the styles drift: creatine funk + corporate
(112 BPM), quit-sugar corporate + children's piano (69 BPM), fasting funk + "inspirational corporate"
(96 BPM), snake-bite ukulele + piano + corporate (100 BPM). Music sits **11-13.5 dB** under the voice
between lines (`SOUND.bed 0.56 × MUSIC_LEVEL 0.9`), dipping a further 1.3 dB under words
(`bedUnderVoice 0.48`). Holes are forbidden (`BED`, "the bed never goes quiet"). Loudness range 2.0-3.4
LU in three of four: flat.

**(c) Why it matters.** The bed is half the energy of a reference: fast, bright and close. Ours is
slower and lower, so with no pauses (finding 4) it is a quiet carpet under constant talk. Once pauses
come in, a bed that low leaves the pauses empty. A consistent style is also brand: after three videos a
viewer knows the channel by ear.

**(d) Change.**
- **Music family** (keeps the owner's "new music every video"): `musicPrompt` starts from a fixed
  template, "playful funk, slap bass, light percussion, 140-160 BPM, no lead melody in the voice range,
  a brighter 'confident' second half from <the answer block's second>", plus the topic's own colour.
  `toon:music:scan` (`toon-music-scan.mjs`) uses `earshot timeline` and **fails** a track that is not
  tagged funk/playful in its top two or is outside 130-165 BPM.
- **Levels** (`SOUND` in `director.ts`): bring the bed up about **5 dB in the pauses** (music about 6 dB
  under the voice) with a **3 dB dip under words** (from 1.3), the dip spread over 0.25 s. In numbers,
  relative to today: `bed` ×1.8, `bedUnderVoice` = `bed` × 0.71. This reverses the owner's "music 10%
  lower" of 2026-11-21, so it needs his ear first: one A/B slice, judged with `earshot ab` and by him.
- **Planned stops**: a `"stop": true` on a stage event cuts the bed for 0.4-0.8 s on an impact or a
  gag, at most 2 a video, never on a word. `BED`'s hole rule stays for unplanned holes (the bug it was
  made for).
- **Check** in `toon:sound` (it already builds and measures the layers): music in the pauses 4-8 dB
  under the voice, dip under words 2-4 dB, loudness range 4-8 LU, one style tag across all sections
  except the planned "confident" switch.

### 9. Sound effects live in the pauses

**(a) References.** In the time nobody talks, earshot hears a median **15.6 sound accents a minute**
(6.7-31): whooshes on cuts, bubbles and drips on liquids (ref 02 at 30-38 s, ref 05 at 32-39 s), pops
and impacts on action, music stabs. Exact sound-effect counts are not reliable here, because the funk
bed is itself percussive; what is clear is that the gaps are full of sound and the words are clear.

**(b) Ours.** About 9 story sounds a video (`soundPlan`, 12 a minute at most, 0.7 s apart, never on a
word), and toon:listen reports several as "lost under the voice or the music" (creatine 19.8 s slide
whistle; fasting 9.3 s bubble pop), because there is nowhere for them to go: no pauses.

**(c) Why it matters.** The rule "never on a word" is right (the references follow it too); it only
works once the script has pauses. Then each silent beat is where the sound effect and the picture
action land together.

**(d) Change.**
- `soundPlan`: every silent beat of 0.8 s or more (finding 4) **must** carry one story sound tied to its
  picture event; the budget rises from 12 to **16 a minute** when the pauses exist (the 0.7 s spacing
  stays).
- **Check** `Beats have sound` in `toon:sound`: no beat of 0.8 s or more without a story sound or a
  planned music stop; a sound reported "lost" by `toon:listen` fails.

### 10. The ending: they stop on the answer; we add 13-17 s

**(a) References.** The video ends 0-2 s after the last word. No end card, no channel name, no
"follow", no recap. 13 end on the doctor's answer, several on "that's why..."; ref 20 ends on the
person's own question about the symptom; refs 11 and 15 end mid-sentence, so the replay starts at once.

**(b) Ours.** The story ends at 48-49 s, then the CTA card and Joey: **17.4 s** (creatine), 16.4,
16.5 and 13.3 s, which is **21-26% of the whole video**, and it repeats the facts ("Creatine: know this...")
before the follow line. The loop line (point 7) sits before the card, so the replay never meets it.

**(c) Why it matters.** On Shorts, the share of the video that people finish and the replays are what
spread a video. A quarter of the video that is a recap card is where viewers leave, and it breaks the
loop the script was built for. (Our own analytics can confirm this: the audience-retention curve of the
four videos at the 49 s mark.)

**(d) Change** (owner decision, his rule of 2026-11-20):
- Option A (recommended): the CTA card **at most 5-6 s**: the headline and the three points on screen,
  Joey says only the follow line (about 3 s); no spoken recap. The story ends on the answer or on a
  short loop line.
- Option B: keep the card but put it only on alternate days and compare retention after two weeks.
- **Check**: `toon-check` reports the end card's seconds and the share of the video; warn over 6 s or
  over 12%.

### 11. Medical content: what to keep, what to learn

**(a) References.** No sources anywhere; plain cause-and-effect wording with soft words ("can",
"usually", "often", "in some cases"); the condition is named; one practical action; the facts are mostly
standard advice (cut nails straight across, take pills with a full glass of water, babies under six
months should not drink plain water). Some are looser than we would allow (an over-tidy "it never
actually searched for the injury" in ref 12; a confident percentage in ref 04 with no source). Care
lines are rare; ref 14 hedges a surgery answer, ref 06 says a test will find the cause.

**(b) Ours.** Much stronger on accuracy: every fact has an allowed source with its exact wording in
`note`, no doses, care lines in every video ("Pregnant? Had an eating disorder? Ask a doctor first";
"Get every bite checked"; "Tell me before a blood test"). Weaker on form: the facts are spread across
characters, and the "studies say / in trials" attributions are spoken.

**(c) Why it matters.** Trust is our advantage over them; their form is their advantage over us. Both
fit in one script: few facts, all sourced, said plainly, with the source in the description and, where
honesty needs it, one spoken "in trials".

**(d) Change.**
- `medical-accuracy.md` + `toons-script.md`: the answer block names the condition, the cause and one
  action; association wording stays as it is ("linked to"); the care line is the doctor's last or
  second-last line (keep).
- `toon-package.mjs`: the description already lists every source; add the **one line of the answer**
  as the first line of the description (search viewers read it).
- No change to `ALLOWED_SOURCES`, `DOSING`, `BANNED_CLAIMS`.

### 12. Captions as text (short; the look is agent 1's)

**(a) References.** One word at a time, every spoken word, including the reaction words ("HUH",
"WHOA"); no other words on the picture except a place label. **(b) Ours.** The same one-word caption,
key word in yellow, plus number tags (format 5). **(c)** With reaction words and pauses in the script,
the caption gets the empty-caption moments the references have (during a beat nothing is shown), which
adds to agent 2's "picture still" share. **(d)** `WordCaption`: clear the caption in any pause over 0.4 s
(today it can hold the last word); a reaction word is shown like any other word. No text tag for a
number unless it is the one number of finding 6.

---

## Part C. What our gate forces that the references do not (and the reverse)

| Our rule (where) | The references | Proposal |
|---|---|---|
| Hook to the viewer: "you", title words in line 1, 8 words in 2 s (`HOOK`, format 5 "said in 2 s") | 0 of 20 address the viewer; first word at 1.1 s; topic by 3 s | Add the `story` hook kind (finding 1); owner decides |
| Promise by 8 s (point 2) | no promise line in any | Met by the character's question (finding 1) |
| Open question answered with 2 shared key words in the last quarter | the question is the character's "why"; the answer is the doctor at 57-83% | Keep, but let the answer start from 55% |
| Loop: last line repeats 3 key words of the first (point 7) | no word loop; 3 of 20 loop by ending mid-line or on a question | Keep as an option; also allow "ends on the person's question" |
| Banter: 3 lines in a row at most | the doctor speaks 4-6 sentences in a row | Up to 6 inside the answer block (finding 3) |
| Every line sourced or "chat" (format 3) | facts only in the payoff | Keep; add the fact budget (finding 2) |
| Never still 2 s, a change every 3 s, a new view every 6 s (format 4-5) | holds of 15 s (agent 2) | Agent 2 replaces these; the script's pauses and beats are what fill a hold |
| Own music per video, any style | one funk family, 154 BPM | Own track, one family (finding 8) |
| Music: no holes; bed 11-13 dB under voice | 3 planned stops; 3 dB under | Planned stops; louder bed (finding 8) |
| Format-5 number tags | no numbers on screen; 16 of 20 say none | One number a video |
| 3 voices or more | 3-6 voices, each returns | At most 4 + doctor, each 3+ lines |
| (nothing) | pauses, talk speed, voice contrast, the doctor's slower speed | New checks: `Breath`, `Talk speed`, `Voices apart` |
| End card with narrator recap | no end card | Card at most 5-6 s (owner decides) |

---

## Part D. New automatic checks, in one list

All free and local; the measured ones read `toon-timings.json` (word times already there) or the render.

| Check | Where | Pass |
|---|---|---|
| `Hook in the story` | `toon-rules.mjs` (`HOOK.kind`) | topic word by 3.0 s; first word 0.3-1.2 s; no "you" to the camera (warn) |
| `One story` | `toon-rules.mjs` | 3 sourced facts or fewer before the answer block (warn 4, fail over 6) |
| `Cast returns` | `toon-rules.mjs` | at most 5 speakers; each speaks 3+ lines |
| `Answer block` | `toon-rules.mjs` | 35-60 words, starts at 55-80%, names the condition, one action or "that's why", sourced |
| `Breath` | `toon-rules.mjs` (real timings) | talking 80-93%; 3+ pauses of 0.5 s, 2+ of 1.0 s; each beat has a picture event |
| `Talk speed` | `toon-rules.mjs` (real timings) | body lines 3.0-3.6 words/s, doctor 2.6-3.0; no line under 2.4 |
| `Numbers said`, `Source words said`, `Reaction words`, `Sentence length` | `toon-rules.mjs` | 1 number; 1 source word; 2+ reaction words; 5-7.5 words a sentence (warnings first) |
| `Voices apart` | `toon-listen.mjs --voices` (+ librosa pitch) | speakers in one scene 3+ semitones apart; high share 30-55% |
| `Music family` | `toon-music-scan.mjs` (earshot timeline) | funk/playful in the top two tags; 130-165 BPM |
| `Mix` | `toon-sound.mjs` | pauses 4-8 dB under voice; dip under words 2-4 dB; loudness range 4-8 LU |
| `Beats have sound` | `toon-sound.mjs` | every beat of 0.8 s+ has a story sound or a planned stop; no sound "lost" |
| `End card length` | `toon-check.mjs` | end card 6 s or less, 12% of the video or less (warn) |

---

## Part E. Top 10 script, voice and sound upgrades, ranked

| # | Upgrade | Where | Target |
|---|---|---|---|
| 1 | **One story, one condition, facts at the end** (the script change agents 1 and 2 depend on) | `toons-script.md`, `toons-blueprint.md`, `checkToon` (`One story`, `Cast returns`) | 3 facts or fewer; 2-4 places; 4 speakers + doctor; each 3+ lines |
| 2 | **Real pauses and silent beats** | `director.ts` (`GAP` 0.22, `pause`, `SHOT_GAP` 0.5), `Breath` check | talking 80-93%; 3+ pauses of 0.5 s; 2-3 beats of 1-2.5 s, each on a picture action |
| 3 | **The answer block**: patient's question, the doctor's calm 35-60 words, condition + cause + one action | `toon.json` `answer`, `Banter` exception, `Answer block` check | starts at 55-80%; doctor 0.3 words/s slower than the cast |
| 4 | **Hook in the story**: a reaction to the intruder, the topic named by 3 s, picture and a sound hit first | `HOOK.kind`, `toons-script.md` (owner decides) | first word 0.3-1.2 s; topic by 3.0 s |
| 5 | **Faster lines** | `toons-cast.json` speeds, free `tempo`, no "..." in lines, `Talk speed` check | 3.0-3.6 words/s inside a line |
| 6 | **Music: one funk family, louder in the gaps, a real dip under words, planned stops** | `musicPrompt` template, `toon-music-scan`, `SOUND`, `"stop"` events (owner hears an A/B) | 130-165 BPM; pauses 4-8 dB under voice; 2-4 dB dip; at most 2 stops |
| 7 | **Short end card** | `cta` in `toon.json`, `video.tsx` CTA timing (owner decides) | 5-6 s; no spoken recap |
| 8 | **Voice range and contrast** | `toons-cast.json` rules, `Voices apart` in `toon:listen --voices` | 40% of body lines over 250 Hz; speakers in a scene 3+ semitones apart |
| 9 | **Lines that argue**: reactions, refusals, a joke on the damage; one number; one spoken source word | `toons-script.md` line style, warning checks | 3+ reaction words; 1 number; 5-7.5 words a sentence |
| 10 | **Sound in the beats** | `soundPlan` budget 16/min with pauses, `Beats have sound` | every beat of 0.8 s+ carries one story sound; none lost |

---

## Part F. What we already do well (keep)

1. **Medical accuracy.** Allowed sources only, the exact finding in `note`, no doses, honest wording
   ("in kids with obesity...", "about the same as just eating less"), care lines in every video. The
   references have none of this; it is our edge and nothing above weakens it.
2. **Clean, clear voices.** Every word was written down correctly by the local model; no clipping; a
   true peak of -0.9 dB and -14 LUFS, which is exactly where YouTube plays (the references clip and are
   turned down).
3. **Acted delivery.** Our pitch spread inside a sentence (13-17 semitones) is as lively as theirs
   (10-22). The voice acting is not the gap; casting range and pauses are.
4. **Fixed voices per character** (`toons-cast.json`) and free casting by listening (snake-bite's cast
   was picked from library samples with earshot at no cost).
5. **Sounds never on words**, measured by `toon:listen`; a story sound per event, not per mood.
6. **The gate itself.** One file checked before any spend, with real timings after voicing. Every
   change above is a new check in the same place, not a new system.
7. **Good jokes when the script has conflict**: snake-bite's mom-and-venom exchange, quit-sugar's
   "I'll be back" loop. Those are the model for finding 6.
8. **Three hook choices for the owner** and the script sheet: keep, with the new hook kind as one of
   the three.

---

## Part G. Points that need the owner's decision

1. **The hook to the viewer** (his rule of 2026-11-17, "make better hook": "you" + consequence in 2 s,
   and the person-first opening of 2026-11-21). The references never address the viewer and start
   talking after about 1 s. Proposal: offer the in-story hook as one of the three choices on the next two
   scripts and let retention decide.
2. **Fewer facts per video.** Going from 6-10 facts to 3 makes each video "teach less" but tell one
   story; the rest goes in the description. This is the change everything else rests on.
3. **A doctor in most videos** (refs: 14 of 20) and Mira's slower, calmer delivery. Keep Mira as our
   own doctor (no need to copy their low male voice); only the contrast matters.
4. **Music louder** (+5 dB in the pauses), against his "music 10% lower" of 2026-11-21, which was set
   when our videos had no pauses at all. He should hear one A/B slice.
5. **Planned music stops** on a gag (0.4-0.8 s, at most 2), against "the bed never goes quiet"
   (2026-11-16/17). The old rule was about accidental holes; these would be written into the script.
6. **The end card length** (his rule of 2026-11-20: CTA card with three points and Joey's line). 13-17 s
   is a quarter of each video now. Proposal: 5-6 s, no spoken recap; or test both.
7. **One music family** (funk, 140-160 BPM) while still making a new track for every video, as he
   asked.
8. **Retention 7 for Toons**: points 2 (promise) and 7 (loop by key words) are not used by any
   reference; the proposal keeps them but lets the character's question count as the promise and an
   ending on a question count as the loop.

Nothing here copies a reference script, joke, character or voice: what is taken is their structure
(one problem, a late doctor answer), their rhythm (fast lines, real pauses) and their mix (a bright bed
that fills the gaps), applied to our own cast and our sourced facts.
