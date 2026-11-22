# "What Happens When You Take Creatine" through the format-6 gate

Script `videos/creatine/toon.json` checked as if it were `"format": 6` (with its real voice timings). Story 55.6 s.

**12 FAIL**, 5 notes, 37 pass.

| | Rule | Result |
|---|---|---|
| PASS | Script is valid | 7 scenes, 18 lines, 6 voices |
| PASS | 1 No intro | hook: "Take creatine? Your scale jumps!" |
| PASS | 2 Promise | starts at 2.1 s (limit 8 s) |
| PASS | 5 Twist | twist starts at 51% |
| PASS | 6 Best last | best point starts at 90% |
| PASS | 7 Loop | last line shares 3 key word(s) with the first: scale, jumps, creatine |
| PASS | Sources on numbers | every number has a source |
| PASS | Source ids exist | all source ids known |
| PASS | No banned claims | no cure/miracle/detox claims |
| PASS | 1 Hook: three choices for the owner | 3 choices, each short, to the viewer and about the title |
| PASS | 3 Open question | asked at 2.5 s ("Your scale jumps... is it fat?"), answered at 91% ("Your scale jumps? That's water in your muscles from creatine. Not fat!"; shared words: scale, jumps, fat) |
| PASS | 3 No counting | the story is told as one chain of cause and effect, not as a numbered list |
| PASS | Length | story 55.6 s (under 60 s; aim for 40-58); with the end card 73.4 s |
| PASS | Places | 3 set(s): macro, home, clinic (at least a body scene and the doctor's office) |
| PASS | Own rooms | clinic: clinic/peach/wainscot/checker/round@left/city/cabinet/body/day; home: gym/stone/stripes/carpet/wide@left/city/rack-right/-/day |
| PASS | Rooms are unique | no other video has this clinic or this home (compared with 13 other video(s)) |
| PASS | Voices | 6 speaking characters (3 or more keep it a conversation) |
| PASS | Doctor explains | Dr. Mira speaks for 18% of the video (this shape needs no doctor; never over 50%) |
| PASS | Story shape | "journey" |
| PASS | Few stickers | 1 text sticker(s) (at most 5: show it, do not label it) |
| PASS | No icon twice | no picture icon is used twice |
| PASS | Text says what is spoken | every text on the picture uses words of its line, appears on its first spoken word, leaves with the line and sits straight |
| PASS | Own music | its own track "creatine" (made from "musicPrompt" with: node pipeline/toon-music.mjs --slug creatine) |
| PASS | 1 Hook: something big moves at once | the first movement starts at 0.00 s (within 0.5 s) |
| PASS | 1 Hook: no still opening | in the first 3 s the longest still is 0.2 s (at most 1), from 2.8 s |
| PASS | Body scene | body characters speak for 63% of the video (30% or more: they are the show) |
| PASS | Short lines | the longest line is 12 words |
| PASS | Banter | at most 2 lines in a row by one speaker (3 or fewer); the answer block 0 in a row (6 at most) |
| PASS | Sources are complete | 6 source(s), each with its finding written out |
| PASS | Sources are allowed | research databases, WHO and national health bodies only |
| PASS | Every line is sourced or plain talk | every line names its source or is marked "chat" (it states no fact) |
| PASS | Doctor lines are sourced | every statement by Dr. Mira names its source |
| PASS | No dosing advice | no doses, no "stop taking your medicine" |
| PASS | S1 Hook in the story | "Take creatine? Your scale jumps!": first word at 0.40 s, the topic said at 0.4 s |
| note | S1 Hook in the story: no "you" to the camera | "Take creatine? Your scale jumps!" says "you": fine between characters, not to the viewer (a note while the owner compares hook kinds) |
| FAIL | S2 One story | 15 sourced fact line(s) before the answer block (3 or fewer; 4-6 is a note, over 6 fails): A1, C1, C2, D1, D2, D3, D4, E1, E2, E3, F1, F2, F4, F5, G1; 0 in the answer (2 or more). Extra facts go to the description |
| FAIL | S3 Cast returns | 5 speaking character(s) besides the doctor (4 at most): crea 7, mom 2, battery 1, muscle 2, kidney 2, doctor 4; under 3 lines: mom 2, battery 1, muscle 2, kidney 2 (make them silent or give them more) |
| FAIL | S4 Answer block | no answer block (mark 3-6 lines "answer": true) |
| FAIL | S5 Breath | someone talks 78% of the story (80-93%); a silent beat with no picture event after: A2 |
| FAIL | S6 No "..." inside a line | split it into two lines by two speakers instead: A2 |
| FAIL | S6 Talk speed | the doctor is only 0.09 words/s slower than the body cast (0.3+) |
| note | S7 Numbers said | 2 number(s) said aloud (1, in the answer; 2 is a note, more fails) |
| note | S7 Source words said | "study / trial / WHO" said in 3 line(s) (1 at most, only where honesty needs it; the sources go in the description) |
| note | S7 Reaction words | 0 reaction word(s) (huh, whoa, ugh...: 2+ keep it a scene, not a lecture) |
| note | S7 Sentence length | 4.4 words a sentence (5-7.5) |
| FAIL | S8 Places | 5 body place(s) (2-4); 4 body/room switches (3 at most); a body place held under 8 s: A 5.6 s, C 6.4 s, G 5.6 s |
| FAIL | S9 End card | the end card runs 17.8 s, 24% of the video (6 s and 12% at most: Joey says only the follow line) |
| FAIL | S10 One real intruder | name the ONE real object that comes into the body ("intruder": "cigarette") |
| PASS | S11 No gauges inside the body | the state is drawn on the organ (no gauge, meter, clock or chip in a body shot) |
| PASS | S12 Time cards | 0 card(s): none |
| FAIL | Impacts: one flash at most | 5 flash(es) (1 at most, never on a cut); no screen shake on a flash |
| PASS | Music stops | 0 planned stop(s) (2 at most, 0.4-0.8 s, never on a word) |
| FAIL | One action, then a hold | two actions in one place closer than 1.5 s: A at 1.7 and 2.5 s; C at 11.0 and 11.7 s; C at 11.7 and 12.9 s; C at 12.9 and 13.5 s; D at 15.3 and 16.0 s; D at 19.8 and 21.2 s; D at 21.2 and 22.6 s; D at 22.6 and 23.9 s; E at 25.7 and 26.8 s; E at 26.8 and 27.6 s; E at 27.6 and 28.9 s; E at 30.6 and 31.5 s; E at 35.3 and 35.9 s; E at 35.9 and 36.5 s; F at 39.8 and 40.9 s; F at 40.9 and 42.4 s; F at 48.2 and 48.6 s; G at 51.8 and 52.1 s; G at 52.1 and 53.2 s |
| FAIL | Music family | the track's prompt is funk at 112 BPM (130-165 BPM; start from MUSIC_TEMPLATE) |
