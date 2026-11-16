# MedPeak Toons rooms: a clinic and a home of its own for every video

Owner rule (2026-11-16): "each video a different background of clinic and a different background
of home, not the same in each video, unique." Until then all three videos shared one clinic and
two shared one bedroom.

Rooms are no longer fixed drawings. The sets `clinic` and `home` are **built from a recipe** in the
script by the room kit (`src/toons/rooms.tsx`). 100% code-drawn.

## The recipe (`rooms` in toon.json)
```json
"episode": 2,
"rooms": {
  "clinic": {"palette": "butter", "wall": "dots", "floor": "wood",
             "window": {"style": "round", "side": "left", "view": "hills"},
             "layout": "shelves", "chart": "tooth", "time": "day"},
  "home":   {"kind": "bathroom", "palette": "lilac", "wall": "tiles", "floor": "checker",
             "window": {"style": "wide", "side": "right", "view": "garden"},
             "layout": "sink-left", "time": "evening"}
}
```
Scenes then use `"set": "clinic"` and `"set": "home"`. The old shared sets (`office`, `bedroom`,
`bathroom`) are refused in a steady script.

| Part | Choices |
|---|---|
| `palette` (16) | mint, sky, peach, lavender, butter, sage, blush, stone, nightblue, cream, terracotta, forest, lilac, sunny, slate, rose |
| `wall` (5) | paint, stripes, wainscot, tiles, dots |
| `floor` (3) | wood, checker, carpet |
| `window.style` (4) | tall, wide, arch, round |
| `window.side` (3) | left, centre, right |
| `window.view` (4) | garden, city, hills, night |
| `layout`, clinic (4) | exam-bed, cabinet, shelves, desk |
| `kind` + `layout`, home (8) | bedroom: bed-left / bed-right; kitchen: stove-left / stove-right; bathroom: sink-left / sink-right; living: sofa-left / sofa-right |
| `chart`, clinic (6) | tooth, stomach, foodpipe, heart, lungs, body: **match it to the video's topic** |
| `time` (3) | day, evening, night (night forces the night view and dims the room; a lamp glows) |

Every room is alive like the old sets: clouds, a tree or birds move outside, the clock ticks,
plants sway, dust floats in the window light, a monitor scrolls, steam rises, a tap drips.

## Choosing rooms for a new video
1. Give the video the next `episode` number.
2. Home: pick the room where the story happens (the pill was swallowed in the kitchen; he lies
   down in the bedroom; the toothache is at the bathroom mirror) and the time of day the time card
   says.
3. Clinic: the chart is the video's organ. Then pick a palette, wall, floor, window and layout that
   the last six videos have not used together.
4. Run `node pipeline/toon-check.mjs <slug>`: **Own rooms** and **Rooms are unique** must pass.
5. Render the rooms board and look at it (people stand in both rooms on it):
   `npx remotion still src/index.ts ToonRooms videos/<slug>/renders/rooms.jpg --props=<json with title, clinic, home, people>`.
   The owner approves the board before voices are bought.

## What "unique" means (checked by the gate, `roomsClash` in director.ts)
- No two videos, ever, have the same recipe for a clinic or for a home.
- Videos within six episodes of each other must differ in colour scheme, and must not pair the
  same furniture layout with the same window view (colour, arrangement and view are what the eye
  reads first).
- An episode number is used once.

With the kit as it is that gives 16 colour schemes for any six neighbouring videos and 16 pairs of
layout and view per clinic; when it starts to feel tight, add to the kit rather than bend the rule.

## Growing the kit
Add the drawing in `rooms.tsx` (a palette in `ROOM_PALS`, a view in `View`, a window in
`windowOf`, a layout in `Furniture`, a chart in `Chart`) and its name to the matching list in
`director.ts`. Furniture is drawn once for the "left" version and mirrored for "right". Anything
with an id gets a `useId()` suffix (a board shows several rooms at once).

### What hangs on the wall (chart, clock, certificate, pictures, mirror, shelf)
All of it comes from one list, `wallItems(look, role)` in `rooms.tsx`: the room draws from it and
the staging check measures it. Rules the list keeps, and a test proves for every room a recipe can
make:
- everything hangs in the band above the heads, y 130 to 500 (`WALL_BAND`): Dr. Mira's curls start
  near y 545 at size 940, and the app's own buttons end near y 110;
- beside a side window the clinic's chart takes the **edge** of the wall and the clock and
  certificate the place by the window (bubbles and tags come up in the middle of the picture);
- nothing hangs on the window, on another item or out of the picture.
A new wall item goes into `wallItems` with its box, never straight into the room's drawing.
`npm run toon:staging` fails a script when more than 15% of a wall item is behind a head.

### How tidy a room is (`ROOM_TIDY`)
The owner looked at a box-shaped room with a bare wall (2026-11-16) and chose to keep the rooms as
they are, with a few things removed (2026-11-17), and picked level 1 ("A"). One number in
`rooms.tsx` sets it for every room; it is **1** and stays 1 unless the owner says otherwise:
- 0: everything, as in the first three videos;
- 1: the wall keeps its window and, in a clinic, the chart at the wall's edge (a bathroom keeps its
  mirror); no clock, certificate, pictures or shelf, and nothing blurred in front of the picture;
- 2: also no plants and none of the small objects on and beside the furniture (jars, the stand,
  the pen pot, the fruit bowl, the lamp's glow).
A new small object goes behind `extra` in `Furniture`, a new wall item into `wallItems`, so the
number keeps working. Do not redraw the rooms in perspective: that was offered and turned down.

### The room's light on people
A night or evening room tints its people too (`roomTone` in `director.ts`; the player and the
rooms board pass it to the character's slot). Without it a person in a night room is as bright as
at noon and looks pasted on. The dimming is mild on purpose: the character stays the brightest
thing in the picture.

Floor furniture stands behind people on purpose and is not checked.

## The first three videos
| Episode | Video | Clinic | Home |
|---|---|---|---|
| 1 | pill-without-water | sky blue, wainscot, checker floor, wide city window, cabinet, food-pipe chart | kitchen at night: cream, tiles, stove and fridge, moon in a tall window |
| 2 | sugar-attack-on-teeth | butter yellow, dotted wall, round window on hills, bookshelves, tooth chart | bathroom in the evening: lilac tiles, sink and mirror, bathtub with a curtain |
| 3 | lying-down-after-dinner | peach stripes, arched garden window, desk, stomach chart | bedroom at night: night blue, bed, lamp, moon in an arched window |

Boards: `toons-boards/rooms-<slug>.jpg`.
