# Agent C to agent A (and B): what C built that lives in your files' world

Date 2026-11-23. Agent C built phases 4 and 5 in its own files (`act.tsx`, `organ-act.tsx`, `video.tsx`, `director.ts`,
`toon-rules.mjs`, `retention.mjs`, the creatine shot/cast fix) plus new files. These are the pieces that need a line or two
in files C does not own.

## For agent A (`play.tsx`, `pipeline/**`, tests, skill)

1. **`ShotNow` in `play.tsx`**: add `pass: number` (1 the first time a shot id plays; 2 when it comes back after a time card)
   and `state: Record<string, number>` (the stage dials now, from `stateAt`). The player already fills both; until then it
   exports `ShotNow9` / `ShotDef9` from `video.tsx` (format-6 shot files can import those). When you add them, `ShotNow9`
   can become an alias.
2. **`LineNow` in `play.tsx`**: add `key?: string` (the script's caption key word). The player fills it; `onKey` in `act.tsx`
   reads it (the gesture lands on the key word).
3. **`ShotDef` in `play.tsx`**: add `kind?: 'body' | 'micro' | 'room' | 'card'`, `stage?: StageName`,
   `punch?: {line: string; z: number; x?: number; y?: number}` (the player already applies `punch` for format 6: a hard
   re-frame from that line on), `faces?`.
4. **`still`, `onKey`, `latched` live in `act.tsx`** (the blueprint put them in `play.tsx`; they are pure helpers, import them
   from `./act`). `lookAt` (gaze) is still yours/B's (people rig and kit eyes).
5. **`blink` (play.tsx)**: the blueprint's 0.2 s blink with a half lid is yours (plus B's `lid` in `Eyes`). The remaining
   `blink(t) > 0.5 ? 'closed'` switches in `shots-v3.tsx` and `scenes-body.tsx` are that blink, not a threshold bug: they go
   away when `bodyFace` returns a continuous `lid`.
6. **`toon-check.mjs` group names**: the format-6 checks report in the existing group `format` (points `S1 ...` to `S12 ...`,
   `Impacts: one flash at most`, `Music stops`, `One action, then a hold`, `Music family`). Nothing to change unless you
   want a separate heading. `known.ctaSeconds` feeds S9 (option A: 6 s and 12% at most); `toon-check` already passes it.
7. **`toon-music.mjs`**: build the prompt for a new format-6 track with `musicPrompt6({colour, answerAt, bpm})` and
   `MUSIC_TEMPLATE` from `pipeline/lib/toon-rules.mjs` (funk, slap bass, 130-165 BPM, the confident second half from the
   answer block). `toon-music-scan.mjs` should fail a made track that earshot does not tag funk/playful in its top two or
   that is outside 130-165 BPM (check A3); the gate already fails a prompt without "funk" and a BPM in the band.
8. **`toon-sound.mjs` (A1, A2)**: read the levels from `soundOf(toon)` / `L.sound` in `director.ts` (`SOUND6` for format 6:
   `bed` 1.0, `bedUnderVoice` 0.71, `dip` 0.125 s each side, `music` 0.9, `perMinute` 14), the planned stops from
   `stopsOf(L)`, and `STOP` (0.4-0.8 s, at most 2). `bedAt(L, f)` is the exact bed envelope the player uses, stops included.
   For the "music in pauses 4-8 dB under the voice" band, measure from the stems like
   `pipeline/tools/c_mixlevels.py` does (voice RMS while talking minus music RMS in the pauses). See the A/B result below:
   the fixed +5 dB may land under 4 dB on a loud track, so the mix check should fail it and a per-video trim should follow.
9. **`toon-listen --voices` (A4) and `toons-cast.json` (skill, yours)**: set the speeds by role (decision 5: body characters
   1.12-1.2, people 1.05-1.1, Dr. Mira 0.92-0.95) and the `voices.test.mjs` bands; the gate's estimate before voicing already
   assumes format 6 talks at `WPS6` = 3.3 words/s (`director.ts`). S6 (talk speed) is in the gate and runs on the real
   word times of `toon-timings.json` once voiced.
10. **`toon_picture.py` (C1-C8)**: `pipeline/tools/c_measure.py` is a small prototype (still share, big-change frames a minute,
    cuts, flashes, one-frame pops, caption band masked); take what is useful. Time cards: the player draws `TimeCard`
    (`src/toons/v8/time-card.tsx`, background `#0d0a09`, mean brightness well under 30) for any shot with `card`, so C1/C8
    can find them as all-dark frames.
11. **Tests**: C added `pipeline/test/format6.test.mjs` and `pipeline/test/fixtures/format6-good.json` (a fixture, not a real
    video: placeholder sources). Move or merge them as you like. The views test (`views.test.mjs` 4.13: a format-6 body
    shot's `view` never changes unless it declares `punch`) is yours.
12. **The skill / CLAUDE.md** (phase 8): the format-6 script rules are in `pipeline/lib/toon-rules.mjs` (`F6`: every number
    of S1-S12 in one object); the timing is `FORMAT6` in `director.ts`; the motion helpers and their limits are documented
    at the end of `act.tsx` (`HOLD_AFTER` 1.5 s, `ACTION` 0.3-0.8 s, `DIVE_MAX_STEP` 6%, `FLOW_MAX_AREA` 5%, `SHAKE_MAX`,
    `BURST_MAX_R`). A format-6 line may carry `pause`, `answer`, `care`; a shot `kind`, `same`, `src`; an event `stop`; the
    script `format: 6`, `intruder`, `term`, `hooks[].kind: 'viewer'`, `retention.loop.kind: 'question' | 'midline'`.

## For agent B (`kit.tsx`, `hud.tsx`, `scenes-body.tsx`, `micro3.tsx`)

1. **Line under zoom**: the player's camera `div` now sets `--ink-out` and `--ink-in` (`OUT / z`, `IN / z` in px). Your kit
   strokes can read them (`strokeWidth: 'var(--ink-out, 5.6px)'`).
2. **`TimeCard`** is in `src/toons/v8/time-card.tsx` (C's new file). Move it into `hud.tsx` if you prefer; the player imports
   it from `./time-card`.
3. **The CTA end card** comes in with a hard cut for format 6 (the slide is off in `video.tsx`); its layout and length are yours.
4. **Flow in a band**: `FlowBand` in `act.tsx` (a few particles in a band of 5% of the frame or less). `Bits` in `micro3.tsx`
   should use it or keep to the same limit for format 6 (decision 19).
5. **Threshold switches in `scenes-body.tsx`** (named in 04-details.md M1): they are all `blink(...) > 0.5 ? 'closed'` (the
   short blink, A's item 5 above), not a moving-value pose switch; C left the file alone.
6. **`Burst` and `shake`**: under the v9 impact policy (format 6) they draw/move only with `keep` (the script's one shake and
   two bursts), radius capped at 120 px, shake at 12 px / 0.25 s. Kit pieces that draw their own bursts should follow it.
7. **The chest stage**: C's motion test used `StomachFull` (fast-art.tsx) because `anatomy.tsx` was not in C's branch. Once
   `STAGES.chest` exists, `src/toons/v8/motion9.tsx` can swap its `Stomach` for it (one component).
