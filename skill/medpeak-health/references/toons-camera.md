# MedPeak Toons camera and lenses

How a Toons Short is shot. The camera lives in `src/toons/camera.tsx`; the director that chooses
the pictures lives in `src/toons/Player.tsx` (`layoutToon`). The reference board is
`toons-boards/camera.jpg` (render it again with `node pipeline/toon-sheets.mjs --boards`).

## Why it looks like a film and not a slideshow
- **Layers.** Every set is built from layers at different depths: far wall, mid, the plane the
  characters stand on, a blurred foreground (`<Layer p={...}>`; 1 = the character plane).
- **Parallax.** When the camera moves, far layers move less and the foreground moves more, so the
  set has depth.
- **Depth of field.** Each lens blurs what is out of focus: the far wall, the foreground, and on
  close-ups the character who is not speaking.
- **A vignette** darkens the corners a little, more on long lenses.

## Shot sizes (`shot`)
| Name | Picture | Use it for |
|---|---|---|
| `ews` | the whole set, characters small | where are we? |
| `wide` | everyone head to toe | the first picture of every scene |
| `full` | one character head to toe | an entrance, a walk, a whole-body joke |
| `two` | speaker and listener together | a conversation, an argument |
| `ms` | waist up | talking with the hands |
| `mcu` | chest up | the default talking shot |
| `cu` | the face | emotion |
| `ecu` | the eyes or mouth | shock, a secret, a lie |
| `ots` | the speaker, with the blurred listener at the edge | "I am talking to YOU" |
| `low` | the speaker high in the frame, a little tilted | power, anger, a threat |

## Lenses (`lens`)
| Lens | Background | Depth | Use it for |
|---|---|---|---|
| `18` ultra-wide | sharp | strongest parallax | openings, big reveals |
| `24` wide | almost sharp | strong | the scene with everyone in it |
| `35` | a little soft | normal | the everyday story lens: two-shots, medium shots |
| `50` | soft | a little flat | calm single shots, the doctor explaining |
| `85` portrait | very soft | flat | close-ups: the face sharp, the room melted |
| `135` tele | melted | very flat | extreme close-ups |
| `macro` | melted | flattest | tiny things made huge: a germ, a drop, a crack |

Rule of thumb: the tighter the shot, the longer the lens. Wide shot = 24, medium = 35 or 50,
close-up = 85, extreme close-up = 135.

## Moves (`move`)
| Move | What happens | Use it for |
|---|---|---|
| `static` | locked off, a barely visible creep | calm, deadpan |
| `push` | slow push-in | growing importance, tension |
| `pull` | slow pull-back | a reveal, relief, the last line |
| `truck` | the camera slides sideways and the layers part | openings: it shows the depth |
| `tilt` | travels up the character to the face | introducing someone |
| `dutch` | a tilted horizon, held still | panic, dizziness |
| `rack` | the picture starts soft and comes sharp | a realisation |
| `crash` | a fast, eased zoom-in over a third of a second | shock, a punchline. **Only when the script asks** |
| `whip` | whip pan from the previous picture, with motion blur | fast banter. **Only when the script asks** |
| `shake` | a short impact shake that dies out | a hit, a shout. **Only when the script asks** |

## No jumps (owner rule, 2026-11-16: "check camera why jump")
A cut is a decision. A jump is a mistake. The first version jumped; these rules stop it, and
`npm run toon:camera -- <slug>` measures the camera on every frame to prove it (it runs in the tests).
1. **Nothing moves in one frame.** Every move is eased. The key word gets a soft 2% swell over a
   quarter of a second, never an instant punch.
2. **No jump cuts.** A cut that keeps the same character on screen must change its size about 1.5
   times (`cutWorks` in `director.ts`). People step wide -> medium close-up -> extreme close-up, or
   medium -> close-up; body characters step wide -> whole body -> face. Two neighbouring sizes of one
   character in a row (medium close-up then close-up) are never cut together.
3. **Cuts land on words.** Every cut falls on the start of a word, best on the start of a phrase,
   never in the middle of a word.
4. **Long lines are covered like a conversation**: the speaker, a look at the listener, the speaker
   again. The camera does not keep punching in on one face.
5. **Fast effects are opt-in.** Whip pans, crash zooms and shakes only happen when a line asks for
   them in `cam`.
6. **In a pause the picture holds.** Between lines and before a scene change the last picture stays.

## Steady camera (`"camera": "steady"` in toon.json)
Measured on 20 top Shorts: a cut every 14.6 s and a locked camera; our first director cut every
2 s. In a steady script each place is ONE locked wide picture (`ews`, 24 mm, move `lock`): no
push, no truck, no punch-in on key words. The camera cuts when the place changes; a line may ask
for its own picture with `cam` (the scene's picture returns after that line). What keeps the eye
is what happens in the picture (toons-script.md, "The steady style"). The camera scan
(`npm run toon:camera`) still runs and must stay at 0 / 0 / 0. Scripts without the field keep
the cinematic director described below.

## What the director does on its own
A script does not have to name any camera. For each line the director picks a picture from the
speaker's emotion, and it never holds one picture longer than 2.9 seconds (Retention 7).

| Emotion | Shot | Lens | Move |
|---|---|---|---|
| neutral, smug | mcu | 50 | push |
| happy | ms | 35 | static |
| angry | low | 35 | push |
| scared | cu | 85 | dutch |
| shocked, sick, sad | cu | 85 | push |
| sleepy | mcu | 50 | static |

- The first line of every scene opens on a `wide 24 truck`, then cuts to the speaker.
- When the default would be a jump cut (the same character at a neighbouring size), the director
  takes the next size that is clearly different: close-up, medium, medium close-up, two-shot, wide.
- A line longer than 2.9 seconds becomes speaker -> listener (a close-up for about 1.2 seconds) ->
  speaker.
- The key word of each line gets a small, soft push.

## Overriding it in a script
Add `cam` to a line, in any order, any subset: `"cam": "cu 85 push"`, `"cam": "ecu 135"`,
`"cam": "two truck"`, `"cam": "low shake"`, `"cam": "cu crash"`, `"cam": "whip"`. What you leave out,
the director fills in. A size you set is kept even if it makes a jump cut, so run the camera check.

```json
{"id": "A3", "who": "whitecell", "text": "Dry? Oh no. You're starting to melt!",
 "emotion": "shocked", "pose": "panic", "key": "melt", "cam": "ecu 135 crash"}
```

Actors can enter a scene: `"enter": "walk"` (walks in from the nearer side), `"drop"` (falls in and
lands with a squash) or `"pop"` on the actor in `cast`.

## Rules
1. Open every scene wide, so the viewer knows where they are. Then go in.
2. Go closer as the feeling gets stronger; the doctor's key sentence ends on a close-up.
3. One strong move per line at most. Crash zooms, whip pans and shakes are punctuation: at most one
   or two in a whole Short.
4. Captions sit at y = 1400: frame faces in the upper half so the caption never covers a mouth.
5. Never tilt, shake or blur for no reason. If the picture moves, the story moved.
6. After writing or changing a script: `npm run toon:camera -- <slug>` must say ALL PASS.
