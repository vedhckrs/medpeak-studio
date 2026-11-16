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
  smug: ['mcu', '50', 'push'], sick: ['cu', '85', 'push'], sleepy: ['mcu', '50', 'static'], shocked: ['cu', '85', 'crash'], sad: ['cu', '85', 'push'],
};
/** When a line is long, the camera keeps changing the picture in this order. */
export const RELIEF: [ShotName, LensName, MoveName][] = [['two', '35', 'truck'], ['cu', '85', 'push'], ['ms', '50', 'static'], ['ots', '50', 'push']];
export const CLOSE: ShotName[] = ['mcu', 'cu', 'ecu', 'ots', 'low'];

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

  // ---- the director: camera segments
  const segs: Seg[] = [];
  let speakerChanges = 0;
  lines.forEach((l, idx) => {
    const shot = toon.shots[l.si];
    const end = l.from + l.frames;
    const own = parseCam(l.line.cam);
    const [es, el, em] = EMO_CAM[l.line.emotion ?? 'neutral'];
    const main: [ShotName, LensName, MoveName] = [own.shot ?? es, own.lens ?? el, own.move ?? em];
    const prev = lines[idx - 1];
    const changed = !!prev && prev.si === l.si && prev.line.who !== l.line.who;
    if (changed) speakerChanges++;
    const plan: {len: number; who: string; cam: [ShotName, LensName, MoveName]}[] = [];
    let left = l.frames;
    if (l.li === 0 && !own.shot) {
      const open = Math.min(54, Math.round(l.frames * 0.42));
      plan.push({len: open, who: l.line.who, cam: ['wide', '24', 'truck']});
      left -= open;
    }
    const reactor = l.line.react ? Object.keys(l.line.react).find((w) => shot.cast.some((a) => a.who === w)) : undefined;
    let k = 0;
    let first = true;
    let last: ShotName | null = plan.length ? plan[plan.length - 1].cam[0] : null;
    while (left > 0) {
      let len = left <= SEG_MAX ? left : Math.min(left, SEG); // a line may run up to 2.9 s in one picture
      if (left - len > 0 && left - len < 24) len = Math.ceil(left / 2); // never leave a sliver
      if (first) {
        // a long first stretch with a reaction: cut away to the listener's face for a moment
        if (reactor && len >= 62) {
          const a = Math.round(len * 0.56);
          plan.push({len: a, who: l.line.who, cam: main}, {len: len - a, who: reactor, cam: ['cu', '85', 'static']});
        } else plan.push({len, who: l.line.who, cam: main});
        last = main[0];
      } else {
        // the next picture must differ in size from the one before (no jump cuts)
        let pick = RELIEF[(k + l.li) % RELIEF.length];
        if (pick[0] === last || (pick[0] === 'two' && shot.cast.length < 2)) { k++; pick = RELIEF[(k + l.li) % RELIEF.length]; }
        plan.push({len, who: l.line.who, cam: pick});
        last = pick[0];
        k++;
      }
      first = false;
      left -= len;
    }
    let f = l.from;
    plan.forEach((p, i) => {
      const whip = i === 0 && changed && l.li > 0 && CLOSE.includes(p.cam[0]) && (own.move === 'whip' || speakerChanges % 3 === 2);
      segs.push({from: f, to: Math.min(end, f + p.len), si: l.si, line: l, who: p.who, shot: p.cam[0], lens: p.cam[1], move: p.cam[2] === 'whip' ? 'push' : p.cam[2], whip});
      f += p.len;
    });
  });
  return {lines, shots, segs, cuts: segs, total: Math.max(TOON_FPS, at)};
};
