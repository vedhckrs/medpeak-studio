// MedPeak Toons director: the script format and the shot list, with NO React and no imports that
// run code, so Node can load this file directly. The player (Player.tsx) and the script gate
// (pipeline/toon-check.mjs) both use it, so what the gate measures is exactly what gets rendered.
import type {PoseName} from './poses';
import type {Emotion} from './rig';

export const TOON_FPS = 30;
export const GAP = 0.14; // seconds of air between lines (fast banter)
export const SHOT_GAP = 0.25;
export const SEG = 78; // frames: the usual longest stretch of one picture (2.6 s)
export const SEG_MAX = SEG + 10; // a line that ends within 2.9 s keeps its one picture
export const WPS = 2.94; // words a second, pauses included: measured on our own 47 voiced lines (386 words in 131.4 s)

export const SET_NAMES = ['throat', 'gut', 'stomach', 'mouth', 'blood', 'lungs', 'office', 'bathroom', 'bedroom', 'foodpipe', 'tooth', 'tummy', 'molar', 'arm', 'macro', 'clinic', 'home'] as const;
export type SetName = (typeof SET_NAMES)[number];
export const SHOT_NAMES = ['ews', 'wide', 'full', 'two', 'ms', 'mcu', 'cu', 'ecu', 'ots', 'low'] as const;
export type ShotName = (typeof SHOT_NAMES)[number];
export const LENS_NAMES = ['18', '24', '35', '50', '85', '135', 'macro'] as const;
export type LensName = (typeof LENS_NAMES)[number];
export const MOVE_NAMES = ['lock', 'static', 'push', 'pull', 'truck', 'tilt', 'crash', 'whip', 'dutch', 'shake', 'rack'] as const;
export type MoveName = (typeof MOVE_NAMES)[number];
export const PROP_NAMES = ['glass', 'pillbottle', 'soda', 'candy', 'toothbrush', 'burger', 'gum', 'pillow', 'clock', 'pain', 'pipe', 'chip', 'tag', 'drop', 'valve', 'bed'] as const;
export type PropName = (typeof PROP_NAMES)[number];
export const ENTRANCES = ['walk', 'drop', 'pop'] as const;
/**
 * STAGES: sets where the organ itself is the stage (a cutaway drawn in place, with a face on it).
 * A stage has a STATE that the script changes as the story goes; these are the dials of each stage.
 */
export const STAGE_KEYS: Partial<Record<SetName, string[]>> = {
  // drop: the pill falls in (0 = above the frame, 1 = lodged). stick: it presses into the wall.
  // melt: 0 = whole, 1 = dissolved. sore: 0 = healthy wall, 1 = an open sore. pain: a throb of redness.
  // water: a wave of water comes down (0.25 = it reaches the pill, 1 = it has passed). slide: the pill rides it down and out.
  foodpipe: ['drop', 'stick', 'melt', 'sore', 'pain', 'water', 'slide'],
  // sugar: sugar rains onto the tooth. feast: the germs eat it and multiply. acid: they spit acid.
  // hole: 0.1 = a white spot, more = a hole through the enamel. pain: the tooth aches. saliva: spit
  // washes over (it thins the acid). mend: minerals go back in while the hole is small.
  // brush: a toothbrush sweeps the germs off. shield: a fluoride coat on the enamel.
  // night: bedtime (the mouth goes dark, a moon and stars).
  tooth: ['sugar', 'feast', 'acid', 'hole', 'pain', 'saliva', 'mend', 'brush', 'shield', 'night'],
  // food: dinner drops in. full: how full the stomach is (the juice level). tilt: 0 = standing or
  // sitting up, 1 = lying flat (the whole stomach tips over). valve: the ring of muscle at the top opens.
  // leak: acid climbs the food pipe. burn: the food pipe hurts. air: swallowed air gathers above the
  // juice and the stomach bloats (eating too fast).
  // The tooth ARENA (the top of a back tooth, wide, for a fight): night: evening to night. guards: the
  // spit guards come on duty. sleep: they fall asleep one after another. sugar: dinner is left on the
  // tooth. fight: ONE gag from 0 to 1: the gang rushes in, a dust cloud, the germs are thrown out.
  // wash: spit washes over the top and clears the mess. party: the gang creeps in and dances. acid: they
  // tip their cups: a pond in the groove, runs down the shoulders. chalk: chalky patches spread (lost
  // minerals). brush: a giant brush ploughs everything off. shield: a fluoride coat.
  // snack: a few crumbs land by day (the spit washes them off).
  // The ARM (rabies): bite: a dog's muzzle comes in, nips, goes; saliva drops; the virus appears. climb:
  // the virus walks up the nerve (0 = the scratch, 1 = under the sign). days: the calendar (day 1 to week 10).
  // vaccine: defenders arrive from both sides. wall: they line up across the nerve. wash: soap foam on the scratch.
  // dizzy: stars circle the virus's head after it hits the wall.
  // MACRO (the owner's hero visual): view picks the close-up (0 entry, 1 inside, 2 caught); slide, speed and grip play it.
  // no-sleep (2026-11-21): the brain among its cells (src/toons/v8/sleep-places.tsx). gap: 0 awake (cells close),
  // 1 asleep (the channels open). wash: brain fluid streams through. dirt: waste stuck in the channels.
  macro: ['view', 'slide', 'speed', 'grip', 'snap', 'gap', 'wash', 'dirt'],
  arm: ['bite', 'climb', 'days', 'vaccine', 'wall', 'wash', 'dizzy'],
  molar: ['night', 'guards', 'sleep', 'sugar', 'snack', 'wash', 'fight', 'party', 'acid', 'chalk', 'brush', 'shield'],
  // gum: a swallowed piece of gum comes down and floats with the food. pass: what is in the stomach
  // moves on through the exit at the lower left. squeeze: an empty stomach's hunger squeeze, a ring of
  // muscle travelling to the exit, with sound rings (the growl). burp: air leaves up the food pipe.
  tummy: ['food', 'full', 'tilt', 'valve', 'leak', 'burn', 'air', 'gum', 'pass', 'squeeze', 'burp'],
};
// ------------------------------------------------------------------ rooms (owner, 2026-11-16: "each video a
// different clinic and a different home, unique"). The sets `clinic` and `home` are BUILT from a
// recipe in the script (`rooms`), so no two videos have to share a background.
export const ROOM_KINDS = ['clinic', 'bedroom', 'kitchen', 'bathroom', 'living'] as const;
export type RoomKind = (typeof ROOM_KINDS)[number];
export const ROOM_PALETTES = ['mint', 'sky', 'peach', 'lavender', 'butter', 'sage', 'blush', 'stone', 'nightblue', 'cream', 'terracotta', 'forest', 'lilac', 'sunny', 'slate', 'rose'] as const;
export const ROOM_WALLS = ['paint', 'stripes', 'wainscot', 'tiles', 'dots'] as const;
export const ROOM_FLOORS = ['wood', 'checker', 'carpet'] as const;
export const ROOM_WINDOWS = ['tall', 'wide', 'arch', 'round'] as const;
export const ROOM_SIDES = ['left', 'centre', 'right'] as const;
export const ROOM_VIEWS = ['garden', 'city', 'hills', 'night'] as const;
export const ROOM_CHARTS = ['tooth', 'stomach', 'foodpipe', 'heart', 'lungs', 'body'] as const;
export const ROOM_TIMES = ['day', 'evening', 'night'] as const;
/** The furniture arrangements each kind of room has. */
export const ROOM_LAYOUTS: Record<RoomKind, readonly string[]> = {
  clinic: ['exam-bed', 'cabinet', 'shelves', 'desk'],
  bedroom: ['bed-left', 'bed-right'],
  kitchen: ['stove-left', 'stove-right'],
  bathroom: ['sink-left', 'sink-right'],
  living: ['sofa-left', 'sofa-right'],
};
export type RoomLook = {
  kind?: RoomKind; // home only: which room of the home (the clinic is always a clinic)
  palette: (typeof ROOM_PALETTES)[number];
  wall: (typeof ROOM_WALLS)[number];
  floor: (typeof ROOM_FLOORS)[number];
  window: {style: (typeof ROOM_WINDOWS)[number]; side: (typeof ROOM_SIDES)[number]; view: (typeof ROOM_VIEWS)[number]};
  layout: string;
  chart?: (typeof ROOM_CHARTS)[number]; // the wall chart (clinic): matches the video's topic
  time?: (typeof ROOM_TIMES)[number];
};
export type RoomRole = 'clinic' | 'home';
export const roomKind = (role: RoomRole, look: RoomLook): RoomKind => (role === 'clinic' ? 'clinic' : look.kind ?? 'bedroom');
/**
 * The light a room's time of day puts on the people standing in it: how much of the red, green and
 * blue of their colours is left (null = daylight, nothing changes). The room itself is tinted in
 * rooms.tsx; without this the people stay as bright as at noon and look pasted on.
 */
export const roomTone = (look?: RoomLook): [number, number, number] | null =>
  look?.time === 'night' ? [0.78, 0.8, 0.93] : look?.time === 'evening' ? [1, 0.95, 0.9] : null;
/** Where the one-word caption sits (steady videos: low and plain; the first style: a little higher), so graphics can keep off it. */
export const captionBox = (steady: boolean) => { const y = steady ? 1470 : 1400; return {y, x0: 110, x1: 970, y0: y - 10, y1: y + 130}; }; // wide enough for the 3-word boxed caption [220-860, +116]
/** Everything that makes a room what it is, as one line (two rooms with the same line are the same room). */
export const roomSignature = (role: RoomRole, look: RoomLook) =>
  [roomKind(role, look), look.palette, look.wall, look.floor, `${look.window.style}@${look.window.side}`, look.window.view, look.layout, look.chart ?? '-', look.time ?? 'day'].join('|');
/** What is wrong with a room recipe (an empty list = fine). */
export const checkRoom = (role: RoomRole, look: RoomLook | undefined): string[] => {
  if (!look) return [`no "${role}" room recipe`];
  const bad: string[] = [];
  const has = (list: readonly string[], v: string | undefined, what: string) => { if (!v || !list.includes(v)) bad.push(`${role}: ${what} "${v}" (one of: ${list.join(', ')})`); };
  if (role === 'home') has(ROOM_KINDS.filter((k) => k !== 'clinic'), look.kind, 'kind');
  has(ROOM_PALETTES, look.palette, 'palette');
  has(ROOM_WALLS, look.wall, 'wall');
  has(ROOM_FLOORS, look.floor, 'floor');
  has(ROOM_WINDOWS, look.window?.style, 'window style');
  has(ROOM_SIDES, look.window?.side, 'window side');
  has(ROOM_VIEWS, look.window?.view, 'window view');
  has(ROOM_LAYOUTS[roomKind(role, look)] ?? [], look.layout, 'layout');
  if (look.chart) has(ROOM_CHARTS, look.chart, 'chart');
  if (look.time) has(ROOM_TIMES, look.time, 'time');
  return bad;
};
/**
 * Are two videos' rooms too alike? Never the same recipe; and for videos within six episodes of
 * each other the colour must differ, and so must the pairing of furniture layout and window view
 * (colour, arrangement and view are what the eye reads first).
 */
export const roomsClash = (role: RoomRole, a: RoomLook, b: RoomLook, near: boolean): string | null => {
  if (roomSignature(role, a) === roomSignature(role, b)) return 'the same room';
  if (!near) return null;
  if (a.palette === b.palette) return `the same colour (${a.palette})`;
  if (roomKind(role, a) === roomKind(role, b) && a.layout === b.layout && a.window.view === b.window.view) return `the same layout and view (${a.layout}, ${a.window.view})`;
  return null;
};

export const EMOTION_NAMES = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'] as const;

export type SpokenWord = {w: string; start: number; end: number};
/** Fake word timings (evenly spread) so a scene can be previewed before its voice exists. */
export const guessWords = (text: string, seconds: number): SpokenWord[] => {
  const ws = text.split(/\s+/).filter(Boolean);
  const total = ws.reduce((n, x) => n + x.length + 2, 0);
  let at = 0.05;
  return ws.map((x) => {
    const d = ((x.length + 2) / total) * (seconds - 0.3);
    const word = {w: x, start: at, end: at + d * 0.86};
    at += d;
    return word;
  });
};

// ------------------------------------------------------------------ the script (videos/<slug>/toon.json)
export type ToonLine = {
  id: string;
  who: string;
  text: string;
  emotion?: Emotion;
  pose?: PoseName;
  sfx?: string; // an effect from the library; without it the emotion picks one
  key?: string; // the caption word shown in amber (default: the last word)
  beat?: number; // seconds of silence after this line (0 to 3): the picture plays a gag with no words
  cold?: boolean; // a COLD OPEN line before the hook (the owner, 2026-11-20: "start with one stray dog"): only the first line, at most 4 s; the hook rules apply to the line after it
  tempo?: number; // 0.9 to 1.15: this line's voice a touch slower or faster (free, applied by `toon-voice --remix`)
  cut?: number; // keep only this many seconds of the voice clip: trims a stray sound after the last word (free, `--remix`)
  react?: Record<string, Emotion>; // the listeners' faces
  cam?: string; // optional camera, e.g. "cu 85 push" (see toons-camera.md)
  src?: string[]; // source ids that back a medical statement in this line
  chat?: boolean; // a doctor line that states no medical fact (a greeting, a joke): needs no source
};
/** `stage`: this character is part of the stage (the organ's own face, the lodged pill): the stage draws it. */
/**
 * `puppet`: this actor is not drawn by code in this shot but shown from frames made in Adobe Animate
 * (pipeline/animate/rig-doctor.mjs shot ...). It is never written in a script: toon-render.mjs adds it when
 * the frames are on this machine, so a machine without them still draws the actor by code.
 */
export type ToonPuppet = {dir: string; frames: number; width: number; height: number; axis: number; ground: number; tall: number};
export type ToonActor = {who: string; x: number; size: number; y?: number; rot?: number; noLegs?: boolean; flip?: boolean; emotion?: Emotion; pose?: PoseName; enter?: (typeof ENTRANCES)[number]; stage?: boolean; puppet?: ToonPuppet};
/**
 * An object or graphic shown in the scene. `from` / `to` = the line ids it appears on and leaves
 * after; `word` = appear on that word of the `from` line. `halo` = a glowing disc behind it;
 * `bubble` = inside a thought bubble; `no` = a red "not this" sign over it; `text` = the words on a chip or a tag.
 * `of` = whose thought it is: the player then puts the bubble above that character's head, clear of
 * every face, with its tail toward them (x and y are then not needed). A graphic never covers a face.
 * `on` = it is drawn ON something on purpose: a character's name (a pain mark on a cheek or a chest), or
 * "bubble" (a mark on the picture inside the thought bubble before it; then `dx`, `dy` place it from the
 * bubble's centre and it follows wherever the bubble goes).
 */
/** `hold`: keep a text tag up until `to` (by default a tag leaves after TAG_HOLD seconds). */
export type ToonProp = {hold?: boolean; kind: PropName; x?: number; y?: number; size: number; rot?: number; from?: string; to?: string; word?: string; halo?: boolean; bubble?: boolean; no?: boolean; text?: string; of?: string; on?: string; dx?: number; dy?: number};
/**
 * Something that happens in the picture: at line `at` (optionally on a `word` of it, plus `delay`
 * seconds) the stage's state moves to `set` over `over` frames, a sound plays, an effect flashes.
 * This is how a Toon SHOWS the process instead of talking about it.
 */
export type ToonEvent = {at: string; word?: string; delay?: number; set?: Record<string, number>; over?: number; sfx?: string; fx?: 'flash'};
/**
 * A shot is one place. `card` makes it a time card instead ("LATER THAT NIGHT..."), lasting
 * `seconds`. `state` is where the stage's dials start; `events` change them.
 */
/** `lead`: seconds of picture before the shot's first line (0 to 3): a silent visual hook (rabies v4). */
export type ToonShot = {id: string; set: SetName; cast: ToonActor[]; lines: ToonLine[]; lead?: number; desk?: boolean; props?: ToonProp[]; card?: string; seconds?: number; label?: string; state?: Record<string, number>; events?: ToonEvent[]};
/** The owner's Retention 7 plan: which line carries each point (see retention-7.md). */
export type ToonRetention = Record<'noIntro' | 'promise' | 'counting' | 'change3s' | 'twist' | 'bestLast' | 'loop', {scene: string; line: string}>;
export type ToonSource = {id: string; label: string; url: string; note: string};
/**
 * `camera`: 'steady' = one locked picture per place, a cut only when the place changes or a line
 * asks for one (the style of the reference Shorts); 'cinematic' (default) = the director cuts.
 */
/** `episode`: the video's number in the series (rooms are compared with the six episodes either side). `rooms`: the recipes for this video's own clinic and home. */
export type Toon = {slug: string; title: string; test?: boolean; music?: string; camera?: 'steady' | 'cinematic'; episode?: number; rooms?: Partial<Record<RoomRole, RoomLook>>; retention?: ToonRetention; shots: ToonShot[]; sources?: ToonSource[]};
export type ToonTimings = {lines: Record<string, {file: string; duration: number; words: SpokenWord[]}>};

/** How far a graphic reaches from its centre, in prop units (200 units = its `size`): [left, up, right, down]. A bubble's tail is not counted. */
export const propReach = (p: ToonProp): [number, number, number, number] => {
  if (p.bubble) return [124, 118, 132, 104];
  if (p.halo) return [104, 104, 104, 104];
  if (p.no) return [92, 92, 92, 92];
  if (p.kind === 'tag') { const w = Math.max(70, (p.text ?? '').length * 19 + 34) / 2; return [w, 28, w, 24]; }
  if (p.kind === 'chip') return [77, 77, 77, 80];
  if (p.kind === 'pain') return [80, 80, 84, 82];
  return [62, 84, 62, 84];
};

/** Sounds the player places on its own: a soft whoosh for a new place or a time card, a swish for a cut inside a scene. */
export const AUTO_SFX = ['whoosh-air', 'swish', 'whoosh-fast'];
/** The director's default picture for each mood: shot size, lens, move. */
export const EMO_CAM: Record<Emotion, [ShotName, LensName, MoveName]> = {
  neutral: ['mcu', '50', 'push'], happy: ['ms', '35', 'static'], angry: ['low', '35', 'push'], scared: ['cu', '85', 'dutch'],
  smug: ['mcu', '50', 'push'], sick: ['cu', '85', 'push'], sleepy: ['mcu', '50', 'static'], shocked: ['cu', '85', 'push'], sad: ['cu', '85', 'push'],
};
/** The lens and move that go with a shot size when the director picks it as a change of picture. */
export const SIZE_CAM: Record<ShotName, [LensName, MoveName]> = {
  ews: ['18', 'truck'], wide: ['24', 'truck'], two: ['35', 'truck'], full: ['24', 'static'], ms: ['35', 'static'],
  mcu: ['50', 'push'], low: ['35', 'push'], ots: ['50', 'push'], cu: ['85', 'push'], ecu: ['135', 'push'],
};
export const CLOSE: ShotName[] = ['mcu', 'cu', 'ecu', 'ots', 'low'];
export const PEOPLE_NAMES = ['doctor', 'patient', 'mom', 'kid', 'grandpa', 'baby'];
/**
 * Roughly how big each shot size makes a character on screen (wide = 1). People are tall in the
 * frame, so their steps differ from the round body characters. The camera framing follows these.
 */
export const NOMINAL: Record<'person' | 'body', Record<ShotName, number>> = {
  person: {ews: 1, wide: 1.04, two: 1.05, full: 1.12, ms: 1.3, low: 1.75, mcu: 1.75, ots: 1.75, cu: 2.35, ecu: 3.2},
  body: {ews: 1, wide: 1.04, two: 1.05, full: 1.25, ms: 1.6, low: 1.6, mcu: 1.6, ots: 1.6, cu: 2.5, ecu: 3.2},
};
const GROUP: ShotName[] = ['ews', 'wide', 'two'];
/**
 * May picture `b` follow picture `a` with a cut? A cut to another character always works. A cut
 * that keeps the same character on screen must change its size clearly (about 1.5 times), or it
 * reads as a jump: a small punch-in on the same drawing.
 */
export const cutWorks = (a: {who: string; shot: ShotName} | null, b: {who: string; shot: ShotName}) => {
  if (!a) return true;
  const ga = GROUP.includes(a.shot);
  const gb = GROUP.includes(b.shot);
  if (ga && gb) return false;
  if (!ga && !gb && a.who !== b.who) return true;
  const t = NOMINAL[PEOPLE_NAMES.includes(ga ? b.who : a.who) ? 'person' : 'body'];
  const r = t[a.shot] / t[b.shot];
  return r >= 1.45 || r <= 1 / 1.45;
};

export type Placed = {line: ToonLine; si: number; li: number; from: number; frames: number; words: SpokenWord[]; file?: string};
export type Seg = {from: number; to: number; si: number; line: Placed; who: string; shot: ShotName; lens: LensName; move: MoveName; whip: boolean};

/** Read "cu 85 push" into a shot size, a lens and a move (any order, any subset). `unknown` = words it did not understand. */
export const parseCam = (s: string | undefined): {shot?: ShotName; lens?: LensName; move?: MoveName; unknown: string[]} => {
  const out: {shot?: ShotName; lens?: LensName; move?: MoveName; unknown: string[]} = {unknown: []};
  for (const w of (s ?? '').toLowerCase().split(/[\s,]+/).filter(Boolean)) {
    const lens = w.replace(/mm$/, '');
    if ((SHOT_NAMES as readonly string[]).includes(w)) out.shot = w as ShotName;
    else if ((LENS_NAMES as readonly string[]).includes(lens)) out.lens = lens as LensName;
    else if ((MOVE_NAMES as readonly string[]).includes(w)) out.move = w as MoveName;
    else out.unknown.push(w);
  }
  return out;
};

/** How long a line lasts in seconds: the real voice when it exists, else an estimate from the word count. */
export const lineSeconds = (line: ToonLine, timings: ToonTimings | null) =>
  timings?.lines[line.id]?.duration ?? Math.max(0.9, line.text.split(/\s+/).filter(Boolean).length / WPS);

/** Lay a script out in time and let the director choose every picture. */
export const layoutToon = (toon: Toon, timings: ToonTimings | null) => {
  const lines: Placed[] = [];
  const shots: {shot: ToonShot; from: number; frames: number}[] = [];
  let at = 0;
  toon.shots.forEach((shot, si) => {
    const from = at;
    at += Math.round(Math.max(0, Math.min(3, shot.lead ?? 0)) * TOON_FPS); // `lead`: a silent picture before the first line
    (shot.lines ?? []).forEach((line, li) => {
      const tm = timings?.lines[line.id];
      const sec = lineSeconds(line, timings);
      const frames = Math.round((sec + GAP + Math.max(0, Math.min(3, line.beat ?? 0))) * TOON_FPS); // `beat`: a silent moment after the line, so a gag can play
      lines.push({line, si, li, from: at, frames, words: tm?.words ?? guessWords(line.text, sec), file: tm?.file});
      at += frames;
    });
    at += shot.card ? Math.round((shot.seconds ?? 1.4) * TOON_FPS) : Math.round(SHOT_GAP * TOON_FPS);
    shots.push({shot, from, frames: at - from});
  });
  const steady = toon.camera === 'steady';
  const total = Math.max(TOON_FPS, at);

  // ---- the director: camera segments.
  // Every cut lands on the start of a word (best: the start of a phrase), never in the middle of one.
  // A long line is covered like a conversation: the speaker, a look at the listener, the speaker
  // again. Two pictures of the same character in a row always differ clearly in size.
  const segs: Seg[] = [];
  if (steady) {
    // STEADY: one locked picture per place. A cut happens when the place changes, or when a line
    // asks for its own picture with `cam` (then the scene's picture comes back after that line).
    shots.forEach((sh, si) => {
      const own = lines.filter((l) => l.si === si);
      if (!own.length) { // a time card: one picture for its whole length
        const blank: Placed = {line: {id: sh.shot.id, who: '', text: ''}, si, li: 0, from: sh.from, frames: sh.frames, words: []};
        segs.push({from: sh.from, to: sh.from + sh.frames, si, line: blank, who: '', shot: 'ews', lens: '24', move: 'lock', whip: false});
        return;
      }
      let open: Seg | null = null;
      for (const l of own) {
        const c = parseCam(l.line.cam);
        if (c.shot || c.lens || c.move) {
          const size = c.shot ?? 'cu';
          segs.push({from: l.from, to: l.from + l.frames, si, line: l, who: l.line.who, shot: size, lens: c.lens ?? SIZE_CAM[size][0], move: !c.move || c.move === 'whip' ? 'lock' : c.move, whip: c.move === 'whip'});
          open = null;
        } else if (open) open.to = l.from + l.frames;
        else {
          open = {from: l.from, to: l.from + l.frames, si, line: l, who: l.line.who, shot: 'ews', lens: '24', move: 'lock', whip: false};
          segs.push(open);
        }
      }
    });
    return {lines, shots, segs, cuts: segs, total, steady};
  }
  lines.forEach((l, idx) => {
    const shot = toon.shots[l.si];
    const F = l.frames;
    const own = parseCam(l.line.cam);
    const [es, el, em] = EMO_CAM[l.line.emotion ?? 'neutral'];
    const main: [ShotName, LensName, MoveName] = [own.shot ?? es, own.lens ?? el, own.move ?? em];
    const speaker = l.line.who;
    const reactTo = l.line.react ? Object.keys(l.line.react).find((w) => shot.cast.some((a) => a.who === w)) : undefined;
    const listener = reactTo ?? shot.cast.find((a) => a.who !== speaker)?.who;
    const starts = l.words.map((w, i) => ({f: Math.round(w.start * TOON_FPS), phrase: i > 0 && /[,.!?:;]$/.test(l.words[i - 1].w)}));
    const snap = (target: number, lo: number, hi: number) => {
      let best = -1;
      let score = Infinity;
      for (const w of starts) {
        if (w.f < lo || w.f > hi) continue;
        const sc = Math.abs(w.f - target) * (w.phrase ? 0.4 : 1);
        if (sc < score) { score = sc; best = w.f; }
      }
      return best >= 0 ? best : Math.max(lo, Math.min(hi, target));
    };
    // 1. where the cuts fall, and whose picture each stretch is
    const kinds: ('open' | 'speaker' | 'react')[] = [];
    const cutsAt: number[] = [0];
    let pos = 0;
    if (l.li === 0 && !own.shot && F >= 66) {
      pos = snap(Math.min(50, Math.round(F * 0.42)), 28, Math.min(60, F - 32));
      kinds.push('open');
      cutsAt.push(pos);
    }
    let want: 'speaker' | 'react' = 'speaker';
    while (F - pos > SEG_MAX) {
      if (want === 'speaker') {
        pos = snap(pos + 66, pos + 40, Math.min(pos + 84, F - 28));
        kinds.push('speaker');
        want = listener ? 'react' : 'speaker';
      } else {
        pos = snap(pos + 38, pos + 28, Math.min(pos + 50, F - 28));
        kinds.push('react');
        want = 'speaker';
      }
      cutsAt.push(pos);
    }
    if (want === 'react' && F - pos >= 64) { // room for a look at the listener and a return to the speaker
      pos = snap(pos + 36, pos + 28, pos + 46);
      kinds.push('react');
      cutsAt.push(pos);
    }
    kinds.push('speaker');
    cutsAt.push(F);
    // 2. the picture for each stretch
    const before = segs[segs.length - 1];
    let prev: {who: string; shot: ShotName} | null = before && before.si === l.si ? {who: before.who, shot: before.shot} : null;
    let said = false; // has the speaker had a picture in this line yet?
    let lastOwn: ShotName | null = null;
    kinds.forEach((kind, i) => {
      let who = speaker;
      let cam: [ShotName, LensName, MoveName];
      if (kind === 'open') cam = ['wide', '24', 'truck'];
      else if (kind === 'react' && listener) {
        who = listener;
        cam = ['cu', '85', 'static'];
      } else {
        const order: ShotName[] = said ? ['cu', 'ms', 'mcu', 'two', 'wide'] : [main[0], 'cu', 'ms', 'mcu', 'two', 'wide'];
        const fits = (c: ShotName) => (c !== 'two' || shot.cast.length > 1) && c !== lastOwn && cutWorks(prev, {who, shot: c});
        const pick = !said && own.shot ? main[0] : order.find(fits) ?? main[0];
        cam = pick === main[0] && !said ? main : [pick, SIZE_CAM[pick][0], SIZE_CAM[pick][1]];
        said = true;
        lastOwn = pick;
      }
      const whip = i === 0 && own.move === 'whip' && !!prev;
      segs.push({from: l.from + cutsAt[i], to: l.from + cutsAt[i + 1], si: l.si, line: l, who, shot: cam[0], lens: cam[1], move: cam[2] === 'whip' ? 'push' : cam[2], whip});
      prev = {who, shot: cam[0]};
    });
    void idx;
  });
  return {lines, shots, segs, cuts: segs, total, steady};
};

export type Layout = ReturnType<typeof layoutToon>;
const ease = (t: number) => { const u = Math.max(0, Math.min(1, t)); return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2; };
const cleanWord = (w: string) => w.toLowerCase().replace(/[^a-z0-9']/g, '');
/** The frame on which a line (optionally one word of it, plus a delay in seconds) starts. `start` = the start of the shot. */
export const frameOf = (L: Layout, si: number, at: string | undefined, word?: string, delay = 0) => {
  const sh = L.shots[si];
  const l = at && at !== 'start' ? L.lines.find((x) => x.si === si && x.line.id === at) : undefined;
  let f = l ? l.from : sh.from;
  if (l && word) {
    const w = l.words.find((x) => cleanWord(x.w) === cleanWord(word));
    if (w) f += Math.round(w.start * TOON_FPS);
  }
  return f + Math.round(delay * TOON_FPS);
};
/** The stage's dials on frame `f` of shot `si`: the starting state, moved by every event so far (eased). */
export const stateAt = (L: Layout, si: number, f: number): Record<string, number> => {
  const shot = L.shots[si].shot;
  const out: Record<string, number> = {...(shot.state ?? {})};
  const evs = (shot.events ?? []).filter((e) => e.set).map((e) => ({e, f: frameOf(L, si, e.at, e.word, e.delay)})).sort((a, b) => a.f - b.f);
  const run: Record<string, {f: number; from: number; to: number; over: number}> = {};
  for (const {e, f: fe} of evs) {
    if (f < fe) break;
    for (const [k, to] of Object.entries(e.set ?? {})) {
      const p = run[k];
      const from = p ? p.from + (p.to - p.from) * ease((fe - p.f) / p.over) : out[k] ?? 0;
      run[k] = {f: fe, from, to, over: Math.max(1, e.over ?? 18)};
    }
  }
  // a stage may need to know where a dial is coming from and going to (a piece of food that is on its
  // way in must land when the change ends, whatever value the dial rests at): `<dial>:from`, `<dial>:to`
  for (const [k, p] of Object.entries(run)) { out[k] = p.from + (p.to - p.from) * ease((f - p.f) / p.over); out[`${k}:from`] = p.from; out[`${k}:to`] = p.to; }
  return out;
};
/** When a prop is on screen: [first frame, last frame). */
/** Seconds a text tag stays up (owner, 2026-11-18). Here, not in style.ts, because Node loads this file without a bundler. */
export const TAG_HOLD = 1.2;
export const propFrames = (L: Layout, si: number, p: ToonProp): [number, number] => {
  const sh = L.shots[si];
  const from = p.from ? frameOf(L, si, p.from, p.word) : sh.from;
  const z = p.to ? L.lines.find((x) => x.si === si && x.line.id === p.to) : undefined;
  const end = z ? z.from + z.frames : sh.from + sh.frames;
  // a text tag is a flash, not a sign: it leaves after STYLE.tagHold seconds (owner, 2026-11-18: "when text
  // come after 1 sec text go, don't hold text"); `hold: true` on a prop keeps it to its `to`. TAG_HOLD 0 = the old way
  if ((p.kind === 'tag' || p.kind === 'chip') && TAG_HOLD > 0 && !p.hold) return [from, Math.min(end, from + Math.round(TAG_HOLD * TOON_FPS))];
  return [from, end];
};
/**
 * Every moment something NEW appears in the picture (Retention 7, point 4): a new place or card, a
 * cut, a prop or graphic, a change of the stage. Captions and mouth movement do not count.
 */
export const changesOf = (L: Layout, opts: {stickers?: boolean} = {}): {f: number; what: string}[] => {
  // from format 3 a text sticker is not "something new" (owner, 2026-11-17: "repeated template, icons and all"): only what HAPPENS counts
  const counts = (kind: string) => opts.stickers !== false || !['tag', 'chip'].includes(kind);
  const out: {f: number; what: string}[] = [];
  L.shots.forEach((sh, si) => {
    out.push({f: sh.from, what: sh.shot.card ? `card "${sh.shot.card}"` : `scene ${sh.shot.id} (${sh.shot.set})`});
    for (const e of sh.shot.events ?? []) if (e.set || e.fx) out.push({f: frameOf(L, si, e.at, e.word, e.delay), what: `event ${e.set ? Object.keys(e.set).join('+') : e.fx}`});
    for (const p of sh.shot.props ?? []) { const [a] = propFrames(L, si, p); if (a > sh.from && counts(p.kind)) out.push({f: a, what: `prop ${p.kind}`}); }
  });
  for (const s of L.segs) if (!L.shots.some((sh) => sh.from === s.from)) out.push({f: s.from, what: `cut to ${s.who} ${s.shot}`});
  return out.sort((a, b) => a.f - b.f);
};
/** The longest stretch with nothing new in the picture, in seconds, and where it is. */
export const longestStill = (L: Layout, opts: {stickers?: boolean} = {}) => {
  const c = changesOf(L, opts);
  let worst = {seconds: 0, from: 0, to: 0};
  const times = [...new Set(c.map((x) => x.f)), L.total];
  for (let i = 1; i < times.length; i++) {
    const g = (times[i] - times[i - 1]) / TOON_FPS;
    if (g > worst.seconds) worst = {seconds: g, from: times[i - 1] / TOON_FPS, to: times[i] / TOON_FPS};
  }
  return {...worst, changes: c.length};
};

// ------------------------------------------------------------------ sound: a calm mix
// Owner, 2026-11-16, on the first three videos: "sound design not proper, too loud and poor sound,
// don't match my style". The first mix put a sound on every mood, every key word and every graphic:
// about 60 effects in 46 seconds, several at the same instant. The channel's own best videos,
// measured, are the opposite: steady narration over a constant music bed and almost no effects.
// So: a few STORY sounds that the script asks for, well under the voice, never on top of each other,
// and the music steady underneath.
export const SOUND = {
  effect: 0.2, // a story sound (a plop, a sizzle): about 14 dB under a voice peak
  whoosh: 0.12, // a new place or a time card
  cut: 0.09, // a cut inside a scene
  bed: 0.56, // the music between lines: present and steady, as on the channel's own videos
  bedUnderVoice: 0.48, // ...and under a voice: a small, slow dip, never a pump
  minGap: 0.7, // seconds: two sounds never start closer than this
  perMinute: 12, // the most sounds a minute of video may have
};
export type SoundEvent = {at: number; name: string; vol: number; why: string; rank: number};
/** Every sound effect of a Toon, in time order. A sound that would start within `minGap` of another loses to the more important one (story sound > new place > cut). */
export const soundPlan = (L: Layout): SoundEvent[] => {
  const all: SoundEvent[] = [];
  L.shots.forEach((s, i) => {
    const afterCard = i > 0 && L.shots[i - 1].shot.card !== undefined; // the card's own whoosh carries the jump in time
    if (s.from > 0 && !afterCard) all.push({at: s.from, name: 'whoosh-air', vol: SOUND.whoosh, why: s.shot.card !== undefined ? 'time card' : `new place (${s.shot.id})`, rank: 1});
    for (const e of s.shot.events ?? []) if (e.sfx) all.push({at: frameOf(L, i, e.at, e.word, e.delay), name: e.sfx, vol: SOUND.effect, why: `scene ${s.shot.id}: ${e.set ? Object.keys(e.set).join('+') : 'event'}`, rank: 2});
  });
  for (const l of L.lines) if (l.line.sfx) all.push({at: l.from, name: l.line.sfx, vol: SOUND.effect, why: `line ${l.line.id}`, rank: 2});
  for (const g of L.segs) {
    if (L.shots.some((sh) => sh.from === g.from)) continue;
    if (g.whip) all.push({at: g.from, name: 'whoosh-fast', vol: SOUND.whoosh, why: 'whip pan', rank: 1});
    else if (g.from !== g.line.from || L.steady) all.push({at: g.from, name: 'swish', vol: SOUND.cut, why: 'cut', rank: 0});
  }
  all.sort((a, b) => a.at - b.at || b.rank - a.rank);
  const gap = Math.round(SOUND.minGap * TOON_FPS);
  const kept: SoundEvent[] = [];
  for (const e of all) {
    const last = kept[kept.length - 1];
    if (!last || e.at - last.at >= gap) kept.push(e);
    else if (e.rank > last.rank) kept[kept.length - 1] = e;
  }
  // The budget (perMinute): over it, the least important sound goes first (a cut, then a place change, never
  // a story sound while another kind is left); among equals, the one with the closest neighbours. The planner
  // keeps the rule itself, so no script can fail toon:sound by having many places (rabies, 2026-11-18).
  const budget = Math.floor((SOUND.perMinute * L.total) / TOON_FPS / 60);
  while (kept.length > budget) {
    const low = Math.min(...kept.map((e) => e.rank));
    const crowd = (i: number) => Math.min(i > 0 ? kept[i].at - kept[i - 1].at : Infinity, i < kept.length - 1 ? kept[i + 1].at - kept[i].at : Infinity);
    let drop = -1;
    kept.forEach((e, i) => { if (e.rank === low && (drop < 0 || crowd(i) < crowd(drop))) drop = i; });
    kept.splice(drop, 1);
  }
  return kept;
};
/** How loud the music is on frame `f`: steady, a little lower under a voice, the change spread over a second. */
export const bedAt = (L: Layout, f: number) => {
  const talking = (fr: number) => L.lines.some((l) => fr >= l.from && fr < l.from + l.frames - Math.round(GAP * TOON_FPS));
  let n = 0;
  for (let i = -15; i <= 15; i += 3) n += talking(f + i) ? 1 : 0;
  const duck = n / 11;
  const fade = Math.min(1, f / 12, (L.total - f) / 24);
  return (SOUND.bed + (SOUND.bedUnderVoice - SOUND.bed) * duck) * Math.max(0, fade);
};

// ------------------------------------------------------------------ the bed's rests
/** A music bed's own loudness, measured every `step` seconds (pipeline/toon-music-scan.mjs writes it next to the bed). */
export type BedShape = {step: number; seconds: number; db: number[]};
/**
 * A REST is the bed `drop` dB under its usual level for `rest` seconds or more (a bar where the band
 * stops). A HOLE is a rest with no voice over it for `hole` seconds or more: the whole sound nearly
 * stops, and the ear hears it as the sound cutting out. The first listen with earshot found holes
 * in all three videos (2026-11-16); nothing had looked for them.
 */
export const BED = {drop: 10, rest: 0.3, hole: 0.5, tryEvery: 0.25};
export const bedRests = (shape: BedShape) => {
  const sorted = [...shape.db].sort((a, b) => a - b);
  const usual = sorted[Math.floor(sorted.length / 2)];
  const quiet = shape.db.map((v) => v < usual - BED.drop);
  // one soft note inside a rest does not end it: a gap of up to 0.2 s that stays well under the usual level is still rest
  for (let i = 1; i < quiet.length - 1; i++) {
    if (quiet[i] || !quiet[i - 1]) continue;
    let j = i;
    while (j < quiet.length && !quiet[j] && shape.db[j] < usual - BED.drop / 2 && (j - i) * shape.step < 0.2 - 1e-9) j++;
    if (j < quiet.length && quiet[j]) for (let k = i; k < j; k++) quiet[k] = true;
  }
  const spans: [number, number][] = [];
  let from = -1;
  for (let i = 0; i <= quiet.length; i++) {
    const q = i < quiet.length && quiet[i];
    if (q && from < 0) from = i;
    if (!q && from >= 0) { if ((i - from) * shape.step >= BED.rest - 1e-9) spans.push([from * shape.step, i * shape.step]); from = -1; }
  }
  // a track that fades out leaves a rest at its very end: the loop is cut there, so the seam has no gap
  const last = spans[spans.length - 1];
  const end = last && last[1] >= shape.db.length * shape.step - shape.step / 2 ? last[0] : shape.db.length * shape.step;
  return {usual, quiet, spans, end};
};
/** The holes of a video, in seconds [from, to], for a bed that starts `start` seconds into its track and loops (without its faded end). */
export const bedHoles = (L: Layout, shape: BedShape, start = 0): [number, number][] => {
  const {quiet, end} = bedRests(shape);
  const loop = Math.max(1, Math.round(end / shape.step));
  // a voice is sounding while a word is spoken (the real word times, once the voices are made); before that, during the whole line
  const said = L.lines.flatMap((l) => (l.words.length ? l.words.map((w) => [l.from / TOON_FPS + w.start - 0.04, l.from / TOON_FPS + w.end + 0.08]) : [[l.from / TOON_FPS, (l.from + l.frames) / TOON_FPS - GAP]]));
  const talking = (fr: number) => { const t = fr / TOON_FPS; return said.some(([a, b]) => t >= a && t < b); };
  const steps = Math.ceil(L.total / TOON_FPS / shape.step);
  const holes: [number, number][] = [];
  let from = -1;
  for (let i = 0; i <= steps; i++) {
    const t = i * shape.step;
    const q = i < steps && quiet[Math.floor((start + t) / shape.step + 1e-6) % loop] && !talking(Math.round(t * TOON_FPS));
    if (q && from < 0) from = i;
    if (!q && from >= 0) { if ((i - from) * shape.step >= BED.hole - 1e-9) holes.push([from * shape.step, i * shape.step]); from = -1; }
  }
  return holes;
};
/**
 * How the bed is laid under a video: where it starts in its track so that its rests fall under
 * voices (0 when that already leaves no hole, else the earliest start with none, or with the
 * least), and where its loop ends (before a faded end). `holes` = what is still left.
 * The voice is taken from the word times, which run a little long: `toon:listen` on the finished
 * file is the final word on holes.
 */
export const bedStart = (L: Layout, shape: BedShape) => {
  const cost = (h: [number, number][]) => h.reduce((n, [a, b]) => n + (b - a), 0);
  const {end} = bedRests(shape);
  let best = {start: 0, end, holes: bedHoles(L, shape, 0)};
  for (let st = BED.tryEvery; st < end - 1 && best.holes.length; st += BED.tryEvery) {
    const holes = bedHoles(L, shape, st);
    if (cost(holes) < cost(best.holes) - 1e-9) best = {start: Number(st.toFixed(2)), end, holes};
  }
  return best;
};
