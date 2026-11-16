# Writing a MedPeak Toons script

A Toon is one file, `videos/<slug>/toon.json`. Before a single credit is spent it must pass
`node pipeline/toon-check.mjs <slug>` (free, instant). The gate uses the same director as the
player (`src/toons/director.ts`), so what it measures is what gets rendered.

## The shape of a Toons Short (about 45-55 seconds, 13 lines)
| Part | Where | Who | What happens |
|---|---|---|---|
| Hook | body set | a body character | the problem, shouted in-story. No greeting, no channel name |
| Reply | body set | a second character | the stake ("He swallowed me without water!") |
| Promise (by 8 s) | body set | either | "Three things happen next. Wait for the third!" |
| Number one, two, three | body set | both, alternating | the mechanism, one short beat each |
| The question | office | the patient | what the viewer is thinking |
| The answer | office | Dr. Mira | the mechanism in plain words |
| Twist (50-75%) | office | Dr. Mira | "But here's the twist: ..." the thing most people get wrong |
| The reaction | office | the patient | a short, surprised question |
| The advice | office | Dr. Mira | what to do |
| Best last (final quarter) | office | Dr. Mira | the least-known, most useful tip, with its number |
| Loop | office | the patient | repeats 3 or more key words of the hook |

Body characters carry about 40% of the time, Dr. Mira about 40%, the patient the rest.

## Retention 7 in dialogue (`retention` in toon.json)
The owner's seven points, with the line id that carries each one. The gate checks all seven.
1. **No intro**: line 1 is the hook itself.
2. **Promise**: a line that starts by 8 s and promises the payoff.
3. **Counting**: "Number one / Number two / Number three" (or first / second / third), said in order.
4. **3-sec change**: the director does it; the gate reports the longest picture (must be 3.0 s or less).
5. **Twist**: starts between 50% and 75%.
6. **Best last**: starts in the final quarter, after the twist.
7. **Loop**: the last line shares at least 3 key words with the first.

Real voices run about 20% faster than the estimate, and the gate re-checks with the real timing
after voicing. Leave a second of margin on the promise (aim for 7 s) and stay clear of the 50% and
75% edges.

## Format rules (checked)
- Under 60 s; at least 2 sets (a body scene and the office); at least 3 speaking characters.
- No line over 20 words; no more than 3 lines in a row by one speaker.
- Dr. Mira speaks for 15-50% of the video; body characters for 30% or more.
- Only characters with a voice in `toons-cast.json`, sets, poses, emotions, sounds, props and
  camera words that exist.

## Medical accuracy (checked)
- Sources live in `sources`: `id`, `label`, `url`, and a `note` that quotes the exact finding.
  Allowed: PubMed/NIH, WHO, CDC, NHS, NICE, ICMR and other government health bodies. Nothing else.
- Every line by Dr. Mira names its source in `src` (or is marked `"chat": true` when it states no
  fact). Every line with a number names its source. Body characters' factual lines carry `src` too.
- Read the source first, then write the line to match its wording. If the source is about one
  medicine, the line says so ("with some antibiotics, the NHS says...").
- No doses, no "stop taking", no cure / miracle / detox / guaranteed.
- `--check-urls` opens every link (PubMed records are checked through its data service).
- PubMed's website blocks scripts: read abstracts with
  `curl -sg "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=<PMID>&rettype=abstract&retmode=text"`.

## The file
```json
{"slug": "...", "title": "...", "music": "bouncy",
 "retention": {"noIntro": {"scene": "A1", "line": "..."}, "promise": {"scene": "A3", "line": "..."},
   "counting": {"scene": "A4,A5,A6", "line": "Number one / Number two / Number three"},
   "change3s": {"scene": "all", "line": "the director"}, "twist": {"scene": "B3", "line": "..."},
   "bestLast": {"scene": "B6", "line": "..."}, "loop": {"scene": "B7", "line": "..."}},
 "sources": [{"id": "nhs-x", "label": "NHS. Page title (reviewed date)", "url": "https://...", "note": "'exact quote'"}],
 "shots": [{"id": "A", "set": "throat",
   "cast": [{"who": "whitecell", "x": 350, "y": 700, "size": 720, "noLegs": true, "pose": "hips"}],
   "props": [{"kind": "glass", "x": 550, "y": 1010, "size": 250, "from": "B5", "halo": true}],
   "lines": [{"id": "A1", "who": "whitecell", "text": "...", "emotion": "angry", "pose": "point",
              "key": "here", "react": {"pill": "scared"}, "src": ["nhs-x"], "cam": "cu 85 push"}]}]}
```
- Staging that works: two characters at x 285 and 805 in the office (size about 1040); in body sets
  one large character at x about 340 and a smaller one at x about 780. People stand on the set's
  floor; floating body characters need `y`.
- Props (`src/toons/props.tsx`): glass, pillbottle, soda, candy, toothbrush, burger, pillow, clock.
  `from` / `to` = the line it appears on and leaves after; `halo` = a glowing disc behind it.
- The key word (`key`) is the caption shown in amber and gets a small punch-in.

## Order of work
1. Pick the topic; find 2-3 allowed sources; copy the exact findings into `sources`.
2. Fill the Retention 7 table, then write the 13 lines to it.
3. `node pipeline/toon-check.mjs <slug> --sheet --check-urls` until everything passes. `--sheet`
   writes `videos/<slug>/SCRIPT.md`: the seven-point table, every line with its camera, the sources.
4. `node pipeline/toon-render.mjs <slug> --draft --silent` for a free picture-only preview.
5. Show the owner the script sheet and the preview, quote the voice cost
   (`toon-voice.mjs <slug> --dry-run`), wait for approval.

## The first three scripts
| Slug | Topic | Body scene | Twist | Best last |
|---|---|---|---|---|
| `pill-without-water` | a pill swallowed dry | white cell + pill in the throat | don't blame the medicine, it needed a ride down | some antibiotics: no lying down for 30 minutes (NHS) |
| `sugar-attack-on-teeth` | sugar and teeth | bacteria + tooth in the mouth | your spit repairs enamel | fluoride toothpaste twice a day (NIH) |
| `lying-down-after-dinner` | heartburn at night | stomach + heart in the stomach | the problem is a valve, not the acid | raise the head of the bed 10-20 cm (NHS) |
