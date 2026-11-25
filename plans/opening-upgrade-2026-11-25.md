# Opening upgrade: keep viewers in the first 15 seconds (plan for the owner, 2026-11-25)

Nothing here is built yet. Free: code and checks only, no credits.

## What the numbers say (YouTube Analytics, 1-24 Nov, read 2026-11-25)

Share of viewers still watching (1.00 = everyone who started):

| Video | Made by | at ~6 s | at ~15 s | halfway | end |
|---|---|---|---|---|---|
| Hold your pee | the other cartoon studio (~/Desktop/New) | 0.98 | 0.74 | 0.61 | 0.28 |
| Cotton buds | the other cartoon studio | 1.03 | 0.74 | 0.58 | 0.36 |
| Quit sugar | this engine (v8) | 1.00 | 0.83 | 0.66 | 0.17 |
| Creatine | this engine | **0.80** | **0.49** | 0.30 | 0.08 |
| Don't sleep | this engine | **0.85** | **0.56** | 0.35 | 0.08 |
| Rabies | this engine | **0.80** | **0.48** | 0.36 | 0.07 |
| Fasting | this engine (v9 pilot era) | **0.81** | **0.53** | 0.43 | 0.09 |

Every video gets the same first push from the Shorts feed (about 1,200-1,600 views on day one). The weak ones lose 1 in 5
viewers by 6 s and half by 15 s; after that both groups fall at about the same speed. **The gap is made in the opening.**
Snake bite, quit smoking, bee sting and stop drinking (the new v9 engine) have no retention data yet (about 2 days' lag).

## What the first 15 seconds look like (frames at 0.2, 1, 2, 3, 4, 6, 8, 10, 12, 15 s)

**Strong openings** (hold your pee, cotton buds):
- Frame 1 is INSIDE the body: one organ fills the whole frame, its big face looking at us.
- The problem is visible in frame 1 as a drawn state: the bladder half full of yellow, the ear canal with a lump of wax.
- ONE place for all 15 s: no cut, the camera still. What changes is small and on the organ (the level rises, the eyes, the mouth).
- One big face plus one small intruder. Only a small name tag ("BLADDER", "EAR CANAL").

**Weak openings** (creatine, don't sleep, rabies, fasting):
- Frame 1 is a PERSON IN A ROOM (the gym, the bedroom at 2 AM, a dog, Grandpa's living room) or a small organ in a big space.
- 4 to 5 different places in 15 s (creatine: gym, muscle, gym, blood, muscle; rabies: dog, skin, nerve tunnel, cells, vessel).
- Many small characters at once (cells, crystals, viruses), faces small.
- Number chips and gauges on screen (+2 KG, 2:00, FAST 0h, clocks) competing with the words.

Quit sugar opened in a room too but cut to the whole liver with its face by 4 s and held organs after that; it held well.

Honest limits: 7 videos is a small sample, and the two strongest came from a different studio with a painted look. But the
difference in the openings is large and the same on all four weak videos, so it is the first thing to fix.

## The plan

### 1. Opening rules in the script gate (`toon-check`, format 6)
- **O1 Open inside the body.** The first shot is a body place with the hero organ (or the hurt place) filling the frame and
  its face toward the lens. A person or a room never opens a video; people come later (the consequence, the clinic).
- **O2 One place for the first 12 s.** No cut before 12 s; the camera holds.
- **O3 The problem is drawn in frame 1.** The opening shot starts with its state already showing (`state` dials not at
  zero: the level, the wax, the puddles, the swelling), not explained by words or a chip.
- **O4 At most two characters in the first 12 s:** the organ and one intruder. Crowds (cells, crews) come in later.
- **O5 No number chips, clocks or gauges in the first 12 s.** A place tag (one word) is allowed.

### 2. The same rules measured on the render (scoreboard and `toon:look`)
- Frame 1: the largest face in the frame is 150 px or more and is a body character (layout log).
- No cut before 12 s (the shot list); no text chip in the first 12 s other than the caption and a place tag.
- Characters on screen in the first 12 s: 2 at most (layout log).
- A new scoreboard section "Opening", so a video cannot reach the owner with a weak opening.

### 3. Engine: an opening kit
- A whole-organ stage for each organ the topic bank needs next, each with a visible state dial and a big face:
  liver, stomach, brain and mouth exist (sugar-organs, fast-art); add **bladder/kidney, gut, heart, eye, lungs-full, skin
  close-up** as needed, one per video, shown as a look sheet first as always.
- The intruder enters INTO that frame (the Booze and Stinger pattern), so the second character arrives without a cut.
- Room and people scenes keep their place after the opening: the consequence at home and the doctor.

### 4. Skill and rules
- `toons-script.md`: a section "The first 12 seconds" with the five rules and the two strip images (strong and weak) as
  the reference.
- `CLAUDE.md`: the rule in one paragraph; memory updated.
- The look sheets I send you will always include the opening frame first.

### 5. Measure it
- A free script `publish/retention.py` that reads each Short's retention curve and writes one table every Tuesday
  (still watching at 6 s and 15 s, by video), so every change is judged by the numbers.
- First check on Thu 27 Nov: the four v9 videos (snake bite, quit smoking, bee sting, stop drinking). Bee sting and stop
  drinking already open inside the body with one place held; if they hold 0.70+ at 15 s, the rules are confirmed.
- Target: the next 6 videos hold **0.70 or more at 15 s** (the weak four held about 0.50).

### Not changed
- Uploaded videos stay as they are (your rule: fixes go into the engine for the next videos).
- The look, the new doctor, the voices and the music stay.

## Order and time
1. Gate rules O1-O5 and the render checks (one session, free).
2. Retention script and the first table (same session).
3. The opening kit grows one organ per new video (each shown to you first).
4. Thu 27 Nov: read the v9 videos' numbers and adjust the thresholds.
