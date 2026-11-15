# Retention 7: the global rule for every channel and every video

**Applies to:** every channel (Explivolt tech Shorts, OneAlphamed Tech / Health / Current Affairs, cartoon films, reels,
long videos), every language (Hindi, Hinglish, English), every tool (Remotion, HeyGen, Freepik, CapCut, by hand).

**Owner rule, 2026-11-15:** "Viewers ko rokna hai? Har ek second ke liye ek wajah." Every video is planned on these
seven points BEFORE the script is written in full, and the plan shows the seven-point table FIRST. A script that misses
a point is not approved. This is a hard rule, not a suggestion.

---

## The 7 points

| # | Point | What it means | Pass when |
|---|---|---|---|
| 1 | **No intro** | The first second IS the hook. No greeting, no "welcome back", no channel name, no "aaj hum baat karenge", no "is video mein". | The first spoken line is the hook itself, with none of the intro words below. |
| 2 | **Promise** | In the first ~8 seconds, promise the payoff so the viewer waits for it. | A line like "3 cheezein, aur end mein sabse bada raaz" / "stay to the end for the one thing nobody tells you" starts by ~8 s (long video: by ~15 s). |
| 3 | **Counting** | Number the beats out loud. A viewer at "number two" stays for "number three". | At least 3 numbered beats, said in order: "Number one / two / three", "pehla / doosra / teesra", "first / second / third". |
| 4 | **3-sec change** | Something new on screen at least every 3 seconds: a new scene, place, shot size, angle, graphic or cut. | No stretch over 3 s with the same picture (long video: over 5 s). A zoom on the same frame does not count as new. |
| 5 | **Twist** | A turn in the middle that resets attention: "Lekin twist ye hai...", "But here's the catch...". | The twist starts between 50% and 75% of the spoken video. |
| 6 | **Best last** | Keep the strongest point for the end, so the promise pays off last. | The best point sits in the final quarter, after the twist. |
| 7 | **Loop** | The last line runs back into the first, so the replay feels seamless and the video gets watched again. | The last spoken line repeats the first line's question, or shares at least 3 of its key words. |

Positions are measured on the spoken video only: the end card / subscribe card / CTA is left out.

### Intro words that fail point 1
`namaste`, `namaskar`, `hello`, `hi guys`, `hey guys`, `doston` / `dosto`, `friends`, `welcome`, `swagat`,
`aaj hum`, `is video mein`, `iss video`, `channel`, any channel name (Explivolt, OneAlphamed, ...). The channel name and
the call to action belong on the end card, never in the first line.

---

## The plan (fill this BEFORE the full script)

Every video's plan starts with this table. Write the scene (or timestamp) and the exact spoken words of each point.

| Point | Scene / time | Line (the exact words) |
|---|---|---|
| No intro | S01 / 0 s | |
| Promise | S0_ / by 8 s | |
| Counting | S__, S__, S__ | Number one / Number two / Number three |
| 3-sec change | all | a new picture at least every 3 s |
| Twist | S__ / 50-75% | |
| Best last | S__ / final 25% | |
| Loop | last line | |

As JSON (the Remotion pipeline reads it from `production.json` `videos[].plan.retention`; other pipelines can keep the
same shape in their own plan file):

```json
"retention": {
  "noIntro":  {"scene": "S01", "line": "..."},
  "promise":  {"scene": "S02", "line": "..."},
  "counting": {"scene": "S04,S05,S06", "line": "Number one / Number two / Number three"},
  "change3s": {"scene": "all", "line": "a new picture at least every 3 s"},
  "twist":    {"scene": "S07", "line": "..."},
  "bestLast": {"scene": "S09", "line": "..."},
  "loop":     {"scene": "S10", "line": "..."}
}
```

---

## The script skeleton (60 s Short)

```
0-2 s    HOOK (No intro)       the surprising claim or question, straight away
2-8 s    PROMISE               "3 cheezein, aur end mein sabse bada raaz"
8-40 s   COUNTING              "Number one: ..."  "Number two: ..."  "Number three: ..."
30-45 s  TWIST (50-75%)        "Lekin twist ye hai: ..."
45-55 s  BEST LAST (final 25%) "Aur sabse badi baat: ..."   (the promise pays off here)
55-60 s  LOOP                  the last line comes back to the first line's question
         END CARD              channel name, follow / subscribe, CTA (not counted)
Every 3 s: a new picture.
```

Long video (8-15 min): the same seven points, scaled: promise by ~15 s, counting can be 3-7 numbered chapters, a new
picture at least every 5 s, one twist between 50% and 75%, the best point in the last quarter, the outro line loops to
the opening question.

---

## Example (Hinglish tech Short)

| Point | Scene | Line |
|---|---|---|
| No intro | S01 | ChatGPT Study Mode kya hai? Sixty second mein. |
| Promise | S03 | Ye three kaam karta hai. Aur end mein, iska sabse bada raaz. |
| Counting | S05, S06, S08 | Number one / Number two / Number three |
| 3-sec change | all | a new world or shot size at least every 3 s |
| Twist | S09 | Ab twist: ye koi naya AI model nahi hai. Wahi ChatGPT hai. |
| Best last | S10 | Raaz ye hai: har chat ke saath ek chhupa hua instruction chalta hai. |
| Loop | S13 | Ab bolo, ChatGPT Study Mode kya hai? |

## Example (health / current affairs, English)

| Point | Scene | Line |
|---|---|---|
| No intro | S01 | Your morning chai could be raising your blood pressure. |
| Promise | S02 | Three habits do it, and the last one surprises every doctor's patient. |
| Counting | S03, S05, S07 | First... / Second... / Third... |
| 3-sec change | all | a new shot, graphic or angle every 3 s |
| Twist | S08 | But here's the twist: it isn't the sugar. |
| Best last | S10 | The real culprit is the time you drink it. |
| Loop | S11 | So, is your morning chai raising your blood pressure? |

---

## Checklist before approving any script

- [ ] The first line is the hook: no greeting, no "aaj hum", no channel name.
- [ ] The promise is spoken by ~8 s (long: ~15 s).
- [ ] At least 3 numbered beats, said out loud, in order.
- [ ] No picture holds over 3 s (long: 5 s); a zoom on the same frame is not a change.
- [ ] The twist starts between 50% and 75% of the spoken video.
- [ ] The best point is in the final quarter, after the twist.
- [ ] The last line loops back to the first line.
- [ ] The seven-point table is shown to the owner first, before the full script.

If any box is empty, the script is fixed before it goes on; it is never approved "with a note".

---

## Where it is enforced

- Remotion (Explivolt, `remotion-video-producer`): `scripts/lib/retention.mjs` checks every point; `pipeline.mjs
  stage0-check` refuses a missing or failing plan; the act board and setup page show the table
  (`remotion-video-producer/references/retention-7.md` has the exact checks).
- Every other channel and skill (OneAlphamed daily videos, cartoon films, reels, HeyGen avatar videos): the session
  writes the table in the plan, runs the checklist above on the script, and does not send the script for approval
  until all seven pass.
