# What Happens When You Stop Drinking Alcohol (plan and script draft)

Topic 9 of the topic bank (10 videos over 1M views, the biggest 9M). Slug `stop-alcohol`. Branch `video/stop-alcohol`.
Engine v9, script format 6, shape `visit`, the NEW doctor (`DoctorAt`). Draft for the owner: nothing drawn, voiced or spent.

## The idea in one line

Inside Dad's liver, a tired Liver scrubs while smug Booze drops keep pouring in. Dad says "no more drinks", sleeps deep and
wakes up feeling better, and the Liver finally catches up. Then Grandpa, who drinks every day, says he'll quit too, "all at
once, tonight", and the Liver panics. At the clinic the doctor explains: the liver can often recover, but for a body that
depends on alcohol, stopping suddenly can be very dangerous: get medical help first.

- **Format 6, shape `visit`**: one story, one body place (the whole Liver filling the frame with his face, the full-organ
  rule), Dad's bedroom from above as voices, one time card, then the doctor. About 55 s, inside the body about 60%.
- **The twist is the care point on screen**: "just quit all at once" is fine for Dad but not for Grandpa's body. The picture
  shows the Liver shaking his head, never anything scary (no shaking, no seizure acted out).

## The facts (each from an allowed source, words read on 2026-11-24)

| # | Fact in the video | Source (exact words) |
|---|---|---|
| 1 | Drinking stops you sleeping deeply; cutting down helps you feel more rested and better in the mornings | NHS: "it can disrupt your sleep patterns and stop you sleeping deeply." "So cutting down on alcohol should help you feel more rested when you wake up." Immediate effects: "feeling better in the mornings", "being less tired during the day" |
| 2 (answer) | If you stop drinking, your liver can often recover | NHS ARLD: "If you stop drinking, your liver can often recover." |
| 3 (answer, care) | If your body depends on alcohol, stopping suddenly can be very dangerous; get medical help before you stop | NHS: "It can be very dangerous to stop drinking suddenly if you're dependent on alcohol." "If you get withdrawal symptoms, get medical help before you try to stop drinking." |
| care | Emergency help now for shaking, confusion, seeing or hearing things that aren't there, or a seizure after stopping | NHS (call 999 or go to A&E if): "shaking visibly", "confusion", "seeing, hearing, or feeling things that are not there", "having a seizure" |

Sources: nhs.uk/live-well/alcohol-advice/tips-on-cutting-down-alcohol/, nhs.uk/conditions/alcohol-misuse/treatment/,
nhs.uk/conditions/alcohol-related-liver-disease-arld/.
**Global audience**: the video says "emergency help"; the description names 999 / 911 / 112 and the immediate effects list
(better skin, more energy, weight) with its source.
**Not said** (no allowed source gives it): any day-by-day timeline of benefits ("day 3 your skin...", "week 2 your liver..."),
detox claims, how much is "safe". The time card says only "THE NEXT MORNING", which fact 1 supports.

## Cast (4 speakers + the doctor, each 3+ lines; voices 3+ semitones apart, measured)

| Who | What | Status |
|---|---|---|
| **Liver** | the hero organ, calm overworked cleaner with a mop; fills the frame | exists (`organs-a` Liver), needs the full-organ pass |
| **Booze** | the intruder: a smug amber drink drop with a foam cap and a grin; arrives in a stream | new |
| **Dad** | the one who stops; heard from above, then in the clinic | exists |
| **Grandpa** | drinks every day; wants to quit "all at once"; stubborn but listens | exists |
| **The doctor** | the answer, slower and calmer | `DoctorAt` (approved 2026-11-24) |

## Script draft (about 17 lines)

| # | Who | Line | Fact |
|---|---|---|---|
| **A: inside the liver (hook)** ||||
| A1 | Booze | (splashes down onto the Liver, grins at us) "Drink number four! Scrub faster, Liver!" | topic by 1 s |
| A2 | Liver | (mopping, eyes heavy) "Every night... I never catch up." | |
| A3 | Dad | (from above) "That's it. I'm done with drinks." | |
| A4 | Booze | "Ha! He'll be back by Friday." | |
| **card "THE NEXT MORNING" (same framing, no new drops)** ||||
| B1 | Dad | (from above, a big stretch) "Whoa. I slept so deep. I feel... good?" | 1 |
| B2 | Liver | "No new mess! I'm finally catching up." | |
| B3 | Booze | (shrinking in the corner) "Hey! Somebody pour me a friend!" | |
| **C: the twist (Grandpa's voice from above)** ||||
| C1 | Grandpa | "I drink every day. I'll quit too. All at once, tonight!" | |
| C2 | Liver | (drops the mop) "Wait! Not like that!" | |
| C3 | Booze | "Ooh. This could get bumpy." | |
| **D: the clinic** ||||
| D1 | Dad | "Doc, I stopped. Does my liver heal?" | |
| D2 | Grandpa | "And can I just stop all at once?" | |
| D3-D5 | Doctor | the answer, about 50 words, slower: if you stop drinking, your liver can often recover. But if your body depends on alcohol, stopping suddenly can be very dangerous. Get medical help before you stop. Shaking, confusion, or seeing things that aren't there means emergency help, right away. | 2, 3, care |
| D6 | Grandpa | "Then I'll stop with a doctor." | |
| D7 | Dad | "And Booze? Not invited." | loop to A1 |

(The format-6 gate times and trims it: 3.0-3.6 words a second, real pauses, the answer block from about 60-75%.)

## Three hook choices (format 6: said inside the story, picture and sound first)

| | First picture and sound | First line |
|---|---|---|
| **A** (in the script, my pick) | the whole Liver fills the frame, mop in hand; a glug and a splash as Booze lands on him and grins at the lens | Booze: "Drink number four! Scrub faster, Liver!" |
| B | the Liver, exhausted, holds up a sign "CLOSED"; drops keep splashing past it | Liver: "Please... I need one night off." |
| C | Booze surfs down a waterfall of drinks into the liver | Booze: "Stop drinking? Ha! Watch the liver beg." |

## Care

- "Stop with a doctor" is the end of the story, never "just quit, it's easy" for everyone.
- Nothing about how many drinks is fine; no detox, no cures, no day-by-day timeline.
- The care line is in the answer, and the description repeats it with the emergency numbers and a line pointing to local
  help services.
- Booze is a cartoon pest, never a person; no one is shown drunk.

## Cost and steps (show before you build)

1. Look sheets (free): the whole Liver with his face and mop, Booze (and a stream of drops), the clean Liver the next morning,
   the doctor with Dad and Grandpa in the clinic. You approve.
2. Script into `videos/stop-alcohol/toon.json`; the gate passes on the per-speaker estimate.
3. Silent preview with the scoreboard and the close-ups; you approve.
4. Voices (Booze new, picked free by listening; the rest exist) and the video's own music: about 1,100-1,400 credits, quoted
   exactly first. Joey reads the whole card.
5. Final render, every check, then to you. Upload only on your word.

## For you to decide

1. The hook: A, B or C (my pick A).
