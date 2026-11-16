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
| motion | every joint of every person and every organ character's hands, every frame | `npm run toon:motion -- <slug>` |
| staging | every graphic against every head, the frame, the other graphics and the caption line; everything on a room's wall against the heads in front of it | `npm run toon:staging -- <slug>` |
| sound | how many effects, how far apart, effects and music against the voice | `npm run toon:sound -- <slug>` |
| listening | the finished file as a listener gets it: loudness, each planned sound (heard or lost), holes, clipping; each library effect against its description | `npm run toon:listen -- <slug>` / `-- --library` (needs earshot on the machine, toons-listening.md) |
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

| 17 | (found by me, not yet seen by the owner) an organ's arm could jump and nothing would notice | the motion check measured people only | the hands of every organ character on a stage are measured too (fastest hand or elbow in the three scripts: 58 px a frame, limit 85) | motion check |
| 18 | at night the room was dark and the person in it as bright as at noon | the night tint was on the room layer only | people take the room's light (`roomTone`: night keeps 78% red, 80% green, 93% blue; measured on the kitchen scene, the face went from 174 to 137 in red while the wall stayed the same) | test: night dims, day does not |
| 19 | wall items sat behind heads (measured on the first rooms: the certificate 34% and the chart 23% behind Dr. Mira in the pill video, the towel rail 48% behind the boy's cap in the sugar video) | the room kit hung wall items by the window, not by where people stand | everything on a wall hangs in a band above the heads (y 130 to 500, `WALL_BAND`); the chart takes the edge of the wall, away from the middle where bubbles and tags come up | staging check: fails when more than 15% of a wall item is behind a head; a test hangs the items in all 144 rooms a recipe can make |
| 20 | the staging check did not know the caption line or the walls | it compared graphics with heads, the frame and each other only | it also fails a graphic on the caption line and a wall item behind a head | staging check |

| 21 | "head not proper, hair and cap" (the boy, close-up, 2026-11-16) | the cap was drawn as a dome 20 units above the skull and wider than the head, with the peak down on the eyebrows; the only hair in view was two dark triangles by the ears, which read as straps | the head has hair first (a fringe, a lock by each ear), and a small cap sits on it, pushed back; the crown follows the skull. New choice sheet `toons-boards/caps.jpg` (A forward, B backward, C no cap) | choice sheet; the owner picks |

| 22 | "remove thing from wall, keep clean minimal wall ... no wall element disturb" (2026-11-16); then, shown a bare box-shaped room: "make both now only, just remove few thing" (2026-11-17); pick: "A" | the rooms carried a clock, a certificate, pictures and a blurred leaf in front, in the very area where bubbles and tags come up | `ROOM_TIDY = 1` in `rooms.tsx`: the wall keeps its window and the clinic's chart at the edge; nothing blurred in front. The rooms' look is otherwise unchanged | test: the tidy wall; staging check |

| 23 | "dr skin make white and like global not indian, i want to target global audience" (2026-11-16); pick: look A | a design choice of mine, not a bug: Dr. Mira was drawn with brown skin | `SPECS.doctor`: light skin, her dark curls kept (sheet `toons-boards/doctor-options.jpg`). The three live videos keep her first look | the owner's pick |
| 24 | the boy's head: pick A (cap forward, on his hair) | see 21 | A is the engine's `SPECS.kid` | the owner's pick |

**Decided, not bugs:** a bubble or a tag may cover what hangs on the wall (it is drawn over the room
and gone in a few seconds; there is no free wall left for all of them), and people stand in front
of furniture on purpose (a desk, a bed). Neither is checked.

## Open, and why
| # | What | Why it is still open | Who can close it |
|---|---|---|---|
| a | The AI-use answer is not set on the three live videos | changing a live video needs the owner's yes each time | the owner says yes, then `publish/after_upload.py <slug> toon --label --approve` |
| b | The three live videos show YouTube's automatic frame, not our cover | see 4 | the owner picks the frame in the YouTube app |
| c | The question comments are not pinned | YouTube's interface for programs has no "pin" | the owner pins them in the app |
| d | The three live videos keep the old bubbles, the old sound, the old walls and no night light on people | the owner said not to redo uploaded videos | nobody, unless the owner asks for a re-upload |
| e | No long video to link the Shorts to | none is made yet (its voices were never approved) | the owner approves a long video |
| f | The character voices are brighter than the channel's narration (about 22% of the sound above 4 kHz against 19%) | pitch-shifted voices; not changed without the owner's ear | the owner listens to the sample |
| g | Sound and motion are judged by measurement only | I cannot hear or watch; the owner's eyes and ears decide | the owner |
| h | 18 of the 26 character voices have never been heard by the owner | they are not in a video yet | closes as videos are made |
| i | The YouTube login expires about every 7 days | the Google app is in testing mode | the owner publishes the Google app, or signs in again each week |
| j | The scene-change sound `whoosh-soft` reads as a kick or a thump, not a whoosh, and is 19 to 25 dB over the bed at every change of place (found by the first listen, 2026-11-16) | the library's effects were never checked against their own descriptions, and nobody read the finished file | a new soft whoosh chosen by measurement, lower in the mix, then an A/B sample for the owner's ear |
| k | The sound nearly stops between lines (pill 1 long hole, sugar 3, dinner 2; the `bouncy` track itself drops 15 dB for 0.9 s) | the sound check levels the layers on average; nothing looked for holes in the bed or in the finished file | a steadier bed (no rests, a little higher in pauses) and a "no hole of 0.5 s" rule, then an A/B sample for the owner's ear |
| l | The `gulp` in the pill script sits under a word and is lost (+0.5 dB) | sounds are placed on words by the script; nothing checked they can be made out | move it off the word; `toon:listen` now shows it |
