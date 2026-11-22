# The owner's answers to the blueprint (2026-11-23)

The owner, on 05-blueprint.md Part 3: **"All 28 recommend and start 2 to 3 agents to fix and upgrade engine and everything i want
proper as per report"**.

So: every one of the 28 decisions in Part 3 is answered with the blueprint's own RECOMMENDATION. For the five marked "sheet first"
or "listen first" (10 organ eyes, 15 Dad's stubble, 18 impacts, 23 music level, 27 caption tilt) the recommendation is built AND
the sample is still made, so the owner can see/hear it in the review before the pilot.

Decision 28 (who writes the code): the owner chose AGENTS (2-3 in parallel, in this session, no spend on his Anthropic key).
New videos pause until the rebuild is reviewed (the blueprint's recommendation).

How the rebuild is split (file ownership, so agents never edit the same file):
- Agent A, checks and rules: `src/toons/v8/play.tsx` (layout log API), `src/toons/v8/scene.tsx`, `pipeline/**` except
  `pipeline/lib/toon-rules.mjs` and `pipeline/lib/retention.mjs`, `pipeline/test/**`, `CLAUDE.md`, `skill/**`, `HANDOFF.md`.
  Phases 0, 1 and 8 of Part 7.
- Agent B, the look: `src/toons/v8/{kit,people-rig,organs-a,organs-b,cells,germs,props,hud,scenes-rooms,scenes-body,micro3}.tsx`,
  new `src/toons/v8/anatomy.tsx` + `entry-anatomy.tsx` + other new entry/sheet files, `src/toons/characters.tsx`.
  Phases 2, 3 and 6 of Part 7.
- Agent C, motion, time, script and sound: `src/toons/v8/{video,act,organ-act}.tsx`, `src/toons/director.ts`,
  `pipeline/lib/toon-rules.mjs`, `pipeline/lib/retention.mjs`, the music template, and the 8 shot/cast files with threshold
  switches (named in 04-details.md). Phases 4 and 5 of Part 7.
- The pilot (phase 7) starts only after the owner reviews the samples.
