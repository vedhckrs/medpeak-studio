# Fasting: what went wrong, and the fix plan (2026-11-22)

The owner on the final video: "why last CTA dont have voiceover narrator you forget, and shorts video I check not interesting and
not visual, confusion, also hook is not good failed, and also camera jump bugs."

## 1. The end card has no narrator (a bug, and Quit Sugar has it too)

- Measured: the last 15 s of the fasting video are music only (earshot: Music 0.87, no speech). Joey's clip exists
  (`assets/toons-voice/fasting/cta.mp3`, 15.2 s, paid for) but the player never played it.
- Root cause: the player plays the narrator only when the video's own end-card code names the file by hand
  (`voice: 'toons/<slug>/voice/cta.mp3'`). Rabies, no-sleep and creatine have that line; **quit-sugar and fasting do not**. No
  check looks for it. The Quit Sugar video now PUBLIC on the channel has the same silent end card (measured: music only).
- Fix (the class, not the instance): the player takes the narrator's clip and his real beats from `videos/<slug>/cta-timings.json`
  for every video, with no hand-typed line; the render stops with an error if a video has a paid end-card clip that is not in the
  picture; `toon:listen` fails a video whose end card has no speech; a test covers all five videos.

## 2. Camera jumps

- Measured on every frame: **9 jump cuts in 45 s**. At each new line inside a shot, the picture snaps to a new framing of the SAME
  character only 1.1 to 1.35 times bigger (1.7, 8.3, 11.1, 16.7, 21.1, 28.1, 31.2, 35.8, 41.7 s), plus C to D, where the same
  liver stays in place and only Lardo is added.
- Root cause: the shots' own framings (`byLine` views in `fasting.tsx`) are not what `toon:camera` checks: it checks the camera
  words in the script, which these shots ignore. So the check passed while the picture jumped.
- Fix: one locked framing per place (the reference Shorts hold one picture for about 15 s); a change of framing only on a new place
  or with a size change of at least 1.5 times, eased, never a snap; and `toon:camera` measures the real picture (the views the
  shots use), so it can never pass a jump again.

## 3. The hook failed

- What the first 2 seconds show: a living room with a lamp, an armchair and a smiling Grandpa; a small stomach in the corner says
  "When you fast, I scream!". Nothing big, nothing at stake, and the payoff is not promised.
- New hook (choose one):
  - **A** Open INSIDE: the whole stomach fills the frame, screaming at the lens, the clock in the corner at 0 h.
    "You fast sixteen hours. I scream in four!" (title words: fast; says "you").
  - **B** The fuel gauge: a huge needle drops to EMPTY with an alarm. "When you fast, your body's fuel runs out."
  - **C** The myth: "Fast for sixteen hours and your body burns fat?" (answered by the story: yes, the switch; but no faster than
    eating less).

## 4. Not interesting, not visual, confusing

What I see when I look again at every second:
- **Four of seven shots look the same**: the same pink inside-the-body wall, the same diaphragm stripes and gut loops (stomach,
  liver, switch, stomach again). On a phone they blur into one.
- **Too much in each frame**: the liver frame has the diaphragm, three vessels, the gallbladder, gut loops, the jar, Lardo, a switch,
  fuel drops, two tags and a caption at once. The eye does not know where to look.
- **The idea is abstract** ("the store runs dry", "switches fuel"): a jar and a small switch do not show a body changing.
- **Grandpa is passive**: he stands and talks; the clock jumping is the only time device.

Fix:
- **One clear picture per beat, one colour per place**: the stomach on warm orange, the liver on deep teal, the brain on purple,
  the room in its plum. Background details softened to one tone so the character and its action stand out.
- **Big, physical metaphors**: the liver's sugar store becomes a giant **fuel gauge** on its wall: the needle falls from FULL to
  EMPTY with an alarm (12 h). The switch becomes a **furnace**: Lardo shovels fat into it and it roars into flame ("burning fat").
  The hunger wave is drawn as a real **wave** rising and falling across the stomach.
- **Fewer, bigger characters**: one or two per frame, filling it; tags only once.
- **Grandpa acts**: he sneaks to the fridge at 4 h, is stopped by the clock alarm, sleeps through hour 8 (snoring, the clock
  spinning), and at 16 h races to breakfast.

## Cost and order

1. The end-card fix and the camera fix (free), with their checks.
2. The new hook and the redrawn beats, as a sheet for your OK first (free).
3. Silent preview for your OK.
4. Voices: only the lines that change (a new hook line, Grandpa's new lines): about 100 to 200 credits. Joey's card and the music
   stay as they are (already paid).
5. Final render, my frame-by-frame check, the look check, the listen check.

**Quit Sugar on the channel**: YouTube cannot replace a video's file. To give it its narrator we would re-render it (free) and upload
it again as a new video, then make the old one private. Your call; nothing is done without your word.
