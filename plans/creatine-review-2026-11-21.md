# Creatine video: frame-by-frame review, what we missed, and the fix plan

2026-11-21. The owner, on the finished creatine video: "the animation weak and the character weak the
visual weak, everything weak ... not looks viral and engaging, analyse each frame, give me plan first, bugs".
Nothing is changed or spent until the owner approves this plan.

Picture sheet: `plans/review-creatine/frames-1-10.jpg` (frames 1-5 top row, 6-10 bottom row, left to right).

---

## 1. The short answer

The video is **correct but not exciting**. Every line is sourced and every check passed, but the checks
measure rules (timing, text, sources), not **excitement**. What a viewer sees is: characters standing in
a row and talking, a background that never stops wobbling, and the big moments (the scale jump, the lift,
the recharge, the water) happening small and fast in a corner of the frame. Nothing hits the viewer.

I also made a process mistake: the "look" check that measures our frames against the 20 viral Shorts
**failed**, and I did not run it before sending you the video. It fails the no-sleep video the same way.

## 2. Measured against the viral Shorts (every frame)

| Measure | Viral Shorts | Creatine | No-sleep | What it means |
|---|---|---|---|---|
| Frames that hold still | **63%** | 31% | 31% | ours never rests: everything sways all the time |
| Frames with small movement | 34% | **60%** | 61% | constant wobble, not story movement |
| Bold dark outlines | **3.0%** | 1.2% | 1.3% | our lines are too thin and faint: it reads as clip-art |
| Line detail | 8.9% | 11.7% | 10.1% | fine |
| Brightness | 153 | 154 | 143 | fine |
| A cut every | 19.6 s | about 11 s | about 17 s | fine for a 6-place story |

So the motion is **backwards**: the background moves all the time (60% wobble) while the characters barely act.
The viral Shorts do the opposite: the picture holds still, and when something moves, it is a big, clear action.

## 3. Frame by frame (what a viewer sees)

### Hook, 0-4.5 s (frames 1-3)
- **Frame 1, the first frame:** a calm, wide gym; Mom stands with a half smile; Crea is a tiny dot popping
  in. The hook rule says the first frame shows the consequence and something comes at the lens. Nothing does.
- **Frame 2, "JUMPS!":** the needle swings into the red, but the dial is a small part of the frame and the
  red zone is a thin sliver. **No number** on the scale. Mom's reaction is a small "o" mouth and a hand to
  her chest: no jump back, no squash, no shake. The single most "viral" fact (the scale can jump 1 to 3 kg
  in the first days) is never shown.
- **The dive (2.3 s):** a pink circle opens over her **hand**, not her upper arm (a bug in where the dive is
  aimed). It reads like a sticker pasted on her, not a camera going into her muscle.
- **Frame 3, inside:** Crea stands still in the middle of the striped background and talks. The "swollen
  with water" state is a few small blue drops. Nothing happens for 2 seconds except his mouth.

### Gym, 4.8-7.2 s (frame 4)
- Mom says "I only started creatine this week!" with her hand near her **throat**: the pose meant as a
  shrug reads as choking at phone size. She never moves her feet, never looks at the dial again.

### Blood, 7.5-12.8 s (frame 5)
- The tunnel is flat rings on one colour. The fork at the far end (two dark holes with a line between)
  **reads as a face or a skull** right in the middle of the frame.
- Crea and the other grains look like **sugar cubes**; red cells are small; nothing tells you this is
  the blood moving to the muscles except the voice.

### Muscle cell, 13.1-22.3 s (frames 6-7)
- "Heavy lift!" shows **no lift**. The stripes squeeze together by a few pixels, invisible on a phone.
  Mom lifting a weight, or a weight coming in, is never shown.
- The battery that panics is small (a quarter of the frame) and partly behind its name tag.
- The recharge (frame 7) is the best idea in the video, and it lasts under half a second: a small spark,
  no arc, no impact, no flash on the battery.
- Muscle pops in at the top with its arms up and then **stands still** for two lines. "A long run? It
  barely helps" shows nothing about running.
- Three characters stand in a row like a line-up. No one crosses the frame, no one touches anyone.

### Kidney filter, 22.6-33.2 s (frame 8)
- The filter is a pile of red loops (reads as spaghetti), the Kidney is small and squeezed at the left
  edge, half over the cup's rim. The watermark sits on its body.
- The twist ("Looks like kidney trouble!") is the best moment in the story and the picture does almost
  nothing: a blood-tube icon pops in. No blood test reaches in, no number on a lab sheet, no alarm on the
  Kidney's face beyond a small sweat.
- 10 seconds in one picture with almost no action.

### Clinic, 33.4-43.9 s (frame 9)
- Two people stand facing each other for 10 seconds; the camera just pushes in. At phone size Dr. Mira's
  one raised finger next to Mom's face **may read as a rude gesture** (check by eye).
- The "12 WEEKS" tag sits over the window and the chart.

### End, 44.2-48.8 s (frame 10)
- The **same muscle picture a third time** (A, D and G all use it), Crea standing in the middle again.
  The answer "That's water, not fat" is not shown: no cell filling like a water balloon, no fat being
  turned away. The loop line lands, but the picture has no payoff.

## 4. Why it happened (root causes in our engine and process)

1. **"Alive" is done with slow sine wobble on everything.** Every character and every background layer
   sways a little all the time. So the picture never rests, and the real actions do not stand out.
2. **No acting system for body characters.** They have a face, little arms and a sway. There is no
   anticipation, no squash and stretch, no overshoot, no hold, no walking or crossing the frame, no
   "take" (a big reaction). They are puppets that talk.
3. **Characters are drawn small** (a quarter to a third of the frame) inside busy backgrounds.
4. **Events are counted, not seen.** The checker counts "a stage dial changed" as something happening,
   even when the change is 5 pixels. So the video passed "something happens every 3 s" while a viewer
   sees nothing happen.
5. **One place reused three times** to save drawing time (the muscle cell). The sameness the owner
   rejected on 2026-11-17 came back in a new form.
6. **The script was written to pass the gate first.** I moved the hook into the body and split lines to
   satisfy the rules; the story beats (a lift, a weigh-in, a blood test) were never staged as events.
7. **The look check was not part of "done".** It existed, it failed, and the video went out anyway.
8. **Outlines are thin** (the kit's line is thin by design since look v8); the viral style has bold,
   near-black lines.

## 5. Bugs (each one gets fixed in the engine, not just in this video)

| # | Bug | Where |
|---|---|---|
| 1 | The look check reads 60 fps videos as 30 fps: reports 133.6 s for a 66.8 s video and halves the cut rate | `pipeline/toon-look.mjs` |
| 2 | The look check is not run before a video is shown | the skill's "done" list, `CLAUDE.md` |
| 3 | The dive into Mom aims at her hand, not her upper arm | `creatine.tsx` `diveAtA` |
| 4 | The blood fork reads as a face / skull | `crea-places.tsx` `BloodPlace` |
| 5 | Mom's "shrug" pose reads as a hand on the throat at three-quarter view | `people-rig.tsx` `shrugR` |
| 6 | The watermark lands on a character (the Kidney, act 2 bottom-left) | `hud.tsx` `Watermark`: needs to avoid characters |
| 7 | Dr. Mira's single raised finger next to a face may read as rude | `oneFinger` pose: use a different "listen" gesture |
| 8 | Name and number tags overlap set pieces (12 WEEKS over the window) | tag placement |
| 9 | Dial changes smaller than a viewer can see count as "something happens" | `toon-rules.mjs` `motionSpans` |
| 10 | The last sound (tada) is buried under the end card's whoosh | sound timing at the story's end |
| 11 | No check that a place is used only once per video | the gate |
| 12 | Crea's "happy" face is closed-eye arcs, so the hero spends most lines with his eyes shut | `FACE_OF.happy` for talking characters |
| 13 | Credits leave the ElevenLabs keys from somewhere else (about 2,000 today) | not code: check which machine or account uses the keys |

## 6. The plan

The order is: tools and engine first (free), then **one 10-second test** for your yes, then the whole
video. The voices stay unless a line changes (a changed line costs a few credits; I will quote first).

### Step 1: make "exciting" measurable (free)
- Fix the look check (bug 1) and make it **must pass** before any video reaches you (bug 2).
- An event only counts as "something happens" if it moves or changes a big part of the frame (at least
  about 5% of the picture), so a 5-pixel squeeze no longer passes (bug 9).
- A place may be shown once per video unless the story returns to it on purpose with a **new view**
  (bug 11).
- New "acting" numbers in the check: how big the characters are on screen, and how much of the motion is
  characters acting versus background wobble.

### Step 2: the acting kit (free, engine)
A shared toolbox every video uses, so this is fixed for good:
- **Key poses with timing:** anticipation, action, overshoot, settle, then a real **hold** (still).
- **Squash and stretch** on hits, jumps and landings; **takes** (eyes pop, body jumps back, a shake).
- **Travel:** characters enter, cross and leave the frame along arcs; they push, throw, carry and bump.
- **Impact kit:** a short star or burst at the hit point, a small screen shake, speed lines on throws
  (drawn in the kit's style, no glow).
- **Calm backgrounds:** the background holds still; it moves only when the story moves it.
- **Bigger characters:** the speaking character fills a third to a half of the frame.
- **Open eyes when talking** (bug 12), bigger mouth shapes, brows that act.
- **People:** new poses (lifting a dumbbell, flexing, jumping back in shock, hand to the hair, arms
  crossed, a proper shrug), feet that step and turn.

### Step 3: the line (free, look sheet first)
- Bolder, near-black outlines in the shared kit to reach the viral measure (3% near-black), shown to you
  on **one sheet** (the creatine cast and one frame of each place, before and after) before it goes into
  any video. You approved the v8 look; this is a change to it, so it waits for your yes.

### Step 4: the new story beats for creatine (show, don't tell)
Same script and sources, new staging. Each beat is a picture you can describe without the voice:

| Time | Line | What the viewer SEES (new) |
|---|---|---|
| 0.0 | "Take creatine?" | Close on Mom's face, eyes squeezed shut, stepping onto the scale (anticipation) |
| 1.0 | "Your scale jumps!" | The dial **fills the screen**, the needle SLAMS into the red with a shake; a big **+2 KG** card bangs onto the screen (the 1-3 kg figure, Antonio 2021); Crea leaps up AT the lens |
| 2.0 | "...is it fat?" | Mom's huge take: jumps back, hands on her cheeks. The camera dives through her **upper arm** (skin, then muscle, layer by layer) |
| 4.8 | "I only started this week!" | Mom shakes the shaker at the scale, the dial wobbles; a "DAY 1 → DAY 5" time card |
| 7.5 | blood | A new blood look (no face at the fork): Crea surfs on a red cell like a board, other grains cling on; a road sign "MUSCLES →" at the fork |
| 13.1 | "Heavy lift!" | A cut to Mom pressing a dumbbell up, then inside: the fibre **crunches**, the batteries drain red one after another like a row of lights going out |
| 14.8 | "Spark coming! Recharged!" | Crea winds up (anticipation), throws the spark in an arc, it **hits**: burst, the battery fills green with a bounce and flexes |
| 16.5 | "A bit more power..." | Muscle fills half the frame and does three quick reps, each one a squash and stretch |
| 19.4 | "A long run? It barely helps." | Muscle in a running headband jogs on the spot, sweats, slows, and slumps; the batteries stay yellow |
| 22.6 | creatinine | Crea breaks a small chip off himself ("a little of me"), the chip gets a label CREATININE and rides down to the kidney |
| 25.1 | "Looks like kidney trouble!" | A needle reaches in from outside; a lab sheet slams in with **CREATININE ↑** in red; the Kidney screams and turns pale |
| 28.8 | "No kidney harm was found." | The red arrow turns into a green tick; the Kidney wipes its brow and does a little dance |
| 33.4 | clinic | One new wide picture; Mom still in gym clothes **holding her shaker**; Dr. Mira shows the lab sheet; on "hair?" Mom grabs her ponytail in panic; on "no hair loss" she flips it back proudly |
| 44.2 | "That's water... Not fat!" | A **new** close view of the cell: water pours in and the cell swells like a water balloon; a grumpy **Fat** blob knocks on the cell and Crea shuts the door on it: "Not fat!" |

New drawings this needs (each on a sheet first): the scale dial close-up, the +2 KG card, the time card,
the dumbbell and Mom's lifting poses, the needle and the lab sheet, the running headband, the Fat blob,
the cell close-up with a door, the red-cell "surfboard", a new blood look.

### Step 5: one 10-second test, then the rest
- I build **only the hook (0-10 s)** with the new acting kit and send it to you as a short clip.
- On your yes: the rest of the video, a silent version for motion, then the final with the existing voices.
- Every check must pass, including the look check, before you see anything.

### What it costs
- Steps 1 to 5: no credits (code only), unless a line's words change; a changed line costs a few credits
  and I will quote first.
- Time: the acting kit and the new drawings are a big piece of work: about a day. The hook test comes first.

## 7. What I need from you
1. Approve this plan (or change it).
2. Say whether the bolder outline (Step 3) may be tried on a sheet.
3. Say whether the "+2 KG" card and the "DAY 1 → DAY 5" time card are OK: both are numbers on screen
   backed by the source (1 to 3 kg in the first days), and the time card adds no new claim.
