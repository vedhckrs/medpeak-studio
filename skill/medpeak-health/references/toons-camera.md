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
| `crash` | a fast punch-in with an overshoot | shock, a punchline |
| `whip` | whip pan from the previous picture, with motion blur | fast banter between two speakers |
| `dutch` | a tilted horizon that settles, with a tiny shake | panic, dizziness |
| `shake` | a short impact shake that dies out | a hit, a shout |
| `rack` | the picture starts soft and snaps sharp | a realisation |

## What the director does on its own
A script does not have to name any camera. For each line the director picks a picture from the
speaker's emotion, and it never holds one picture longer than 2.6 seconds (Retention 7).

| Emotion | Shot | Lens | Move |
|---|---|---|---|
| neutral, smug | mcu | 50 | push |
| happy | ms | 35 | static |
| angry | low | 35 | push |
| scared | cu | 85 | dutch |
| shocked | cu | 85 | crash |
| sick, sad | cu | 85 | push |
| sleepy | mcu | 50 | static |

- The first line of every scene opens on a `wide 24 truck`, then cuts to the speaker.
- A long line keeps changing: two-shot -> close-up -> medium -> dirty single, never the same size
  twice in a row (no jump cuts).
- A line with a `react` entry cuts away to the listener's face for a moment.
- Every third change of speaker is a whip pan instead of a cut.
- The key word of each line gets a small punch-in.

## Overriding it in a script
Add `cam` to a line, in any order, any subset: `"cam": "cu 85 push"`, `"cam": "ecu 135"`,
`"cam": "two truck"`, `"cam": "low shake"`. What you leave out, the director fills in.

```json
{"id": "A3", "who": "whitecell", "text": "Dry? Oh no. You're starting to melt!",
 "emotion": "shocked", "pose": "panic", "key": "melt", "cam": "ecu 135 crash"}
```

Actors can enter a scene: `"enter": "walk"` (walks in from the nearer side), `"drop"` (falls in and
lands with a squash) or `"pop"` on the actor in `cast`.

## Rules
1. Open every scene wide, so the viewer knows where they are. Then go in.
2. Go closer as the feeling gets stronger; the doctor's key sentence ends on a close-up.
3. One strong move per line at most. Crash zooms and shakes are punctuation, not the default.
4. Captions sit at y = 1400: frame faces in the upper half so the caption never covers a mouth.
5. Never tilt, shake or blur for no reason. If the picture moves, the story moved.
