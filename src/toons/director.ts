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
export const WPS = 2.8; // words a second, the pace measured on the reference Shorts

export const SET_NAMES = ['throat', 'gut', 'stomach', 'mouth', 'blood', 'lungs', 'office', 'bathroom', 'bedroom'] as const;
export type SetName = (typeof SET_NAMES)[number];
export const SHOT_NAMES = ['ews', 'wide', 'full', 'two', 'ms', 'mcu', 'cu', 'ecu', 'ots', 'low'] as const;
export type ShotName = (typeof SHOT_NAMES)[number];
export const LENS_NAMES = ['18', '24', '35', '50', '85', '135', 'macro'] as const;
export type LensName = (typeof LENS_NAMES)[number];
export const MOVE_NAMES = ['static', 'push', 'pull', 'truck', 'tilt', 'crash', 'whip', 'dutch', 'shake', 'rack'] as const;
export type MoveName = (typeof MOVE_NAMES)[number];
export const PROP_NAMES = ['glass', 'pillbottle', 'soda', 'candy', 'toothbrush', 'burger', 'pillow', 'clock'] as const;
export type PropName = (typeof PROP_NAMES)[number];
export const ENTRANCES = ['walk', 'drop', 'pop'] as const;
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
  react?: Record<string, Emotion>; // the listeners' faces
  cam?: string; // optional camera, e.g. "cu 85 push" (see toons-camera.md)
  src?: string[]; // source ids that back a medical statement in this line
  chat?: boolean; // a doctor line that states no medical fact (a greeting, a joke): needs no source
};
export type ToonActor = {who: string; x: number; size: number; y?: number; rot?: number; noLegs?: boolean; flip?: boolean; emotion?: Emotion; pose?: PoseName; enter?: (typeof ENTRANCES)[number]};
/** An object shown in the scene (a glass of water, a burger). `from` / `to` = the line ids it appears on and leaves after. */
export type ToonProp = {kind: PropName; x: number; y: number; size: number; rot?: number; from?: string; to?: string; halo?: boolean};
export type ToonShot = {id: string; set: SetName; cast: ToonActor[]; lines: ToonLine[]; desk?: boolean; props?: ToonProp[]};
/** The owner's Retention 7 plan: which line carries each point (see retention-7.md). */
export type ToonRetention = Record<'noIntro' | 'promise' | 'counting' | 'change3s' | 'twist' | 'bestLast' | 'loop', {scene: string; line: string}>;
export type ToonSource = {id: string; label: string; url: string; note: string};
export type Toon = {slug: string; title: string; test?: boolean; music?: string; retention?: ToonRetention; shots: ToonShot[]; sources?: ToonSource[]};
export type ToonTimings = {lines: Record<string, {file: string; duration: number; words: SpokenWord[]}>};

/** The sound that marks a line's mood when the script names none. */
export const EMO_SFX: Partial<Record<Emotion, string>> = {shocked: 'boing', scared: 'wobble', angry: 'thud-soft', happy: 'ding', smug: 'slide-whistle-up', sick: 'gurgle-stomach', sad: 'sad-trombone'};
/** Sounds the player places on its own (scene change, cut, whip pan, key word). */
export const AUTO_SFX = ['whoosh-soft', 'swish', 'whoosh-fast', 'caption-pop', 'pop'];
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
  timings?.lines[line.id]?.duration ?? Math.max(1, line.text.split(/\s+/).filter(Boolean).length / WPS + 0.35);

/** Lay a script out in time and let the director choose every picture. */
export const layoutToon = (toon: Toon, timings: ToonTimings | null) => {
  const lines: Placed[] = [];
  const shots: {shot: ToonShot; from: number; frames: number}[] = [];
  let at = 0;
  toon.shots.forEach((shot, si) => {
    const from = at;
    shot.lines.forEach((line, li) => {
      const tm = timings?.lines[line.id];
      const sec = lineSeconds(line, timings);
      const frames = Math.round((sec + GAP) * TOON_FPS);
      lines.push({line, si, li, from: at, frames, words: tm?.words ?? guessWords(line.text, sec), file: tm?.file});
      at += frames;
    });
    at += Math.round(SHOT_GAP * TOON_FPS);
    shots.push({shot, from, frames: at - from});
  });

  // ---- the director: camera segments.
  // Every cut lands on the start of a word (best: the start of a phrase), never in the middle of one.
  // A long line is covered like a conversation: the speaker, a look at the listener, the speaker
  // again. Two pictures of the same character in a row always differ clearly in size.
  const segs: Seg[] = [];
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
  return {lines, shots, segs, cuts: segs, total: Math.max(TOON_FPS, at)};
};
