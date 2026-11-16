# MedPeak Toons: every bug found, its root cause, and what now stops it

Written 2026-11-16 at the owner's request ("check all skipped bugs, root cause you found").
Keep it current: a bug goes here with its cause the day it is found, and leaves "open" only when
a check or a rule makes it impossible to repeat.

## The pattern behind most of them
Almost every bug below had the same shape: **something was placed or set by hand and nothing
measured the result.** Positions were typed as numbers, sounds were added by default, a setting
was sent and assumed stored. Each fix is therefore two things: the repair, and a check that
measures it on every script (they all run in `npm test`).

| Check | What it measures | Command |
|---|---|---|
| script gate | script, Retention 7, format, own and unique rooms, sources | `node pipeline/toon-check.mjs <slug>` |
| camera | every frame: wrong picture, jump cut, jolt | `npm run toon:camera -- <slug>` |
| motion | every joint of every person, every frame | `npm run toon:motion -- <slug>` |
| staging | every graphic against every head, the frame, the other graphics | `npm run toon:staging -- <slug>` |
| sound | how many effects, how far apart, effects and music against the voice | `npm run toon:sound -- <slug>` |
| upload read-back | what YouTube really stored (privacy, AI-use answer, cover) | printed by `publish/upload.py` |

## Fixed, with the cause
| # | What the owner saw | Root cause | Fix | Stops it now |
|---|---|---|---|---|
| 1 | "this bubble comes [over the] doctor face" | Graphics were placed by typed coordinates and nothing compared them with the heads. In the clinic the cast stood so tall (size 1040) that only 287 px were free above Dr. Mira's hair, less than a bubble's height: no position could have cleared her | a thought bubble takes `"of": "doctor"` and places itself above its owner, tail toward them; `"on"` marks a graphic that is meant to sit on a character or on the bubble; people stand at 940 / 900 when a scene uses a bubble | staging check: 13 graphics covered a head across the three scripts, 0 now |
| 2 | "sound design not proper, too loud and poor sound, don't match my style" | The player added a sound on every mood, every key word and every graphic: about 62 effects in 46 s, several at the same instant, comic sounds (boing, slide whistle). It copied the busiest reference Shorts instead of the owner's own channel, and nothing measured effects against the voice | only story sounds the script asks for (6 to 8 a video), never closer than 0.7 s, 13 LU under the voice; music steady and 8.5 LU under, as on the channel's own videos | sound check |
| 3 | AI-use answer missing on the uploads | The upload asked for it; YouTube did not store it (why is not known yet); the uploader never read back what was stored, so the package's wish was reported as fact | the uploader reads the stored status back and warns; `publish/after_upload.py --label` sets it | upload read-back |
| 4 | covers | YouTube does not take a custom picture for a Short through this call; the uploader's warning was filtered out of the output and never recorded | the result is recorded (`coverSet`) and printed; the package names the second to pick in the app | upload read-back |
| 5 | videos came out 17% shorter than estimated | the estimate added 0.35 s to every line; real lines have no such pause | pace measured on our own 47 voiced lines (2.94 words a second) | - |
| 6 | two lines of a deleted scene stayed in the pill video's timing file | the voice step never removed lines the script no longer has | it does now | - |
| 7 | (caught before harm) re-running the package step forgot a video was uploaded | it rewrote the package file from scratch; the uploader would then have uploaded a duplicate | upload records are kept | - |
| 8 | the first covers showed the video's first frame | a frozen frame inside a one-frame still is ignored | the cover is a frame of a full-length composition | looked at before sending |
| 9 | boards showed the wrong state in some cells | six copies of a stage on one page shared the same clip-path id | ids are unique per instance | - |
| 10 | "legs jump" | the knee was solved back from the hips with near-straight legs; talking bounced the hips | a knee bend is set, never solved; hips still while talking | motion check |
| 11 | "doctor hand and arms look weird" | arms were single bendy tubes; the upper arm hid against the coat | jointed arms, redrawn hands | pose board, motion check |
| 12 | gestures snapped (found by the motion check, not by eye) | a pose arrived in 10 frames with a fast start: 140 px in one frame | 12 soft frames, 58 px at most | motion check |
| 13 | "boy hat not good" | a bowl with the peak sideways | a real cap; options sheet | - |
| 14 | every video had the same clinic and home | one fixed drawing per room | rooms built from a recipe | gate: own and unique rooms |
| 15 | a line in descriptions said how the videos are made | I added it unasked | removed; rule in SKILL.md | - |
| 16 | "camera jump" (first director) | default whips, punch-ins, mid-word cuts | steady camera | camera check |

## Open, and why
| # | What | Why it is still open |
|---|---|---|
| a | The AI-use answer is not set on the three live videos | changing a live video needs the owner's yes each time |
| b | The three live videos show YouTube's automatic frame, not our cover | see 4; pick the frame in the YouTube app |
| c | The question comments are not pinned | YouTube's interface for programs has no "pin" |
| d | The three live videos keep the old bubbles and the old sound | the owner said not to redo uploaded videos |
| e | No long video to link the Shorts to | none is made yet (its voices were never approved) |
| f | Organ characters (stage faces, organ arms) are not in the motion check | it measures people only; a jump in an organ's arm would not be caught |
| g | At night the room is dimmed but the people are not | the tint is on the room layer only |
| h | A wall chart can end up behind Dr. Mira's hair | the room kit places wall items by the window, not by where people stand |
| i | The staging check does not know the wall items, the furniture or the caption line | it compares graphics with heads, the frame and each other only |
| j | The character voices are brighter than the channel's narration (about 22% of the sound above 4 kHz against 19%) | pitch-shifted voices; not changed without the owner's ear |
| k | Sound and motion are judged by measurement only | I cannot hear or watch; the owner's eyes and ears decide |
| l | 18 of the 26 character voices have never been heard by the owner | they are not in a video yet |
| m | The YouTube login expires about every 7 days | the Google app is in testing mode |
