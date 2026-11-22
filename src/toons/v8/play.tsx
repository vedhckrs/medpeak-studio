/**
 * MedPeak Toons, look v8: how a SHOT plays in a video (the contract between the player and the scenes).
 *
 * The player (video.tsx) reads a video's toon.json and its voice timings, works out which shot and which line
 * are on at every frame, and hands each shot one object, `ShotNow`. A shot is a pure function of it: the same
 * `s` always draws the same picture (no state, no random numbers, no clocks), so every frame renders alone.
 *
 * Time is in SECONDS (fractional; the video runs at 60 frames a second). Never count frames in a shot.
 */
import React, {createContext, useContext, useId} from 'react';
import type {Mood, MouthKind} from './kit';
import type {Expr} from './people-rig';

export const V8_FPS = 60;

export type Word = {w: string; start: number; end: number}; // seconds from the start of its LINE

/** One line of the script, placed in its shot. */
export type LineNow = {
  id: string; // 'C2'
  who: string; // 'mom', 'kid', 'doctor', 'virus', 'whitecell'
  text: string;
  from: number; // seconds from the start of the SHOT when the voice begins
  to: number; // seconds from the start of the shot when the next line (or the end of the shot) begins
  voice: number; // seconds the voice itself lasts (from .. from + voice is speech, the rest is a short gap)
  emotion?: string; // the script's word: neutral, happy, angry, scared, smug, sick, sleepy, shocked, sad
  pose?: string; // the script's word (old engine names); a shot may use it as a hint
  react?: Record<string, string>; // who -> emotion, for those who listen during this line
  words: Word[];
  key?: string; // engine v9: the script's caption key word (`onKey` in act.tsx lands a gesture on it)
};

/** Everything a shot may know about "now". */
export type ShotNow = {
  id: string; // the shot's id in toon.json: 'A', 'B', 'M2', 'C', 'D', 'E', 'M3'
  t: number; // seconds since this shot began
  dur: number; // seconds this shot lasts
  lines: LineNow[]; // this shot's lines, in order
  cur: LineNow | null; // the line whose time it is now (also during its closing gap); null only before the first
  /** engine v9: 1 the first time a shot id plays, 2 when it comes back after a time card (same framing, new state) */
  pass?: number;
  /** engine v9: the shot's stage dials now (toon.json `state` + `events`, eased: director.ts stateAt) */
  state?: Record<string, number>;
  /** engine v9: true for a format-6 video (the player sets it); `bodyFace` then gives a continuous `lid` and no teeth grid */
  v9?: boolean;
};

export type Focus = {x: number; y: number; r: number}; // a face in frame pixels: centre and radius

/** What a video's shot gives the player. */
export type ShotDef = {
  /** The whole picture in frame pixels (1080 x 1920). The camera moves and zooms it. */
  Scene: React.FC<{s: ShotNow}>;
  /** Text laid on the SCREEN after the camera (labels, the yellow tag): a zoom can never cut it. Optional. */
  Screen?: React.FC<{s: ShotNow}>;
  /** Where that character's face is at this moment, for the camera. Unknown name: the middle of the action. */
  focus: (who: string, s: ShotNow) => Focus;
  /**
   * The shot's own framing, if it has one: the point of the picture (frame pixels) that sits in the middle of
   * the screen and the zoom (1 = the whole frame). When given, the player uses it instead of leaning toward
   * the speaker. For shots whose action is small in the frame (inside the body).
   */
  view?: (s: ShotNow) => {x: number; y: number; z: number};
  /** v4: the point (frame pixels) a transition dives into or pulls back out of: the Kid's scratch in a room. */
  portal?: (s: ShotNow) => [number, number];
  /** engine v9: what the place is (else the director's `kindOf` works it out from the set) */
  kind?: 'body' | 'micro' | 'room' | 'card';
  /** engine v9: the anatomy stage the shot is set on (anatomy.tsx STAGES) */
  stage?: string;
  /** engine v9: the ONE allowed re-frame of a video (decision 16): from that line on, that framing (a hard cut, held) */
  punch?: {line: string; z: number; x?: number; y?: number};
  /** engine v9: where each character's face is now (frame pixels), when `focus` is not enough (two faces, a turned head) */
  faces?: (s: ShotNow) => Record<string, Focus>;
  /** engine v9 (decision 26): the picture behind the watermark is light (an ink-coloured mark); default: a room shot */
  light?: boolean;
};

// ------------------------------------------------------------------ small pure helpers for shots
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Smooth 0..1 from time t0 over `d` seconds (slow in, slow out). */
export const go = (t: number, t0: number, d = 0.4) => { const k = clamp01((t - t0) / d); return k * k * (3 - 2 * k); };
/** 0..1 with a little overshoot at the end (a pop). */
export const pop = (t: number, t0: number, d = 0.3) => { const k = clamp01((t - t0) / d); const c = 1.70158; return 1 + (c + 1) * (k - 1) ** 3 + c * (k - 1) ** 2; };
/** A gentle endless sway, -1..1: `period` seconds a cycle, `seed` shifts it so neighbours do not move together. */
export const sway = (t: number, period = 3, seed = 0) => Math.sin((t / period) * Math.PI * 2 + seed * 1.7);

export const lineOf = (s: ShotNow, id: string) => s.lines.find((l) => l.id === id);
/** Seconds since that line began (or since `word` in it was spoken: the first word that contains it, any case). Negative before; -999 if unknown. */
export const since = (s: ShotNow, id: string, word?: string) => {
  const l = lineOf(s, id);
  if (!l) return -999;
  if (!word) return s.t - l.from;
  const k = word.toLowerCase().replace(/[^a-z0-9]/g, '');
  const w = l.words.find((x) => x.w.toLowerCase().replace(/[^a-z0-9]/g, '').includes(k));
  return s.t - l.from - (w ? w.start : 0);
};
/** Is `who` speaking right now (voice on, not the gap)? */
/** v4: 1 while `who` speaks (with a 0.3 s eased ramp either side), 0 otherwise: lets a character keep still
 * unless it speaks (the owner, 2026-11-20: "the virus moves when it acts or speaks"). */
export const active = (s: ShotNow, who: string, ramp = 0.3) => s.lines.filter((l) => l.who === who).reduce((m, l) => {
  const a = clamp01((s.t - l.from + ramp) / ramp), b = clamp01((l.from + l.voice - s.t + ramp) / ramp);
  const k = Math.min(a, b);
  return Math.max(m, k * k * (3 - 2 * k));
}, 0);
export const speaking = (s: ShotNow, who: string) => !!s.cur && s.cur.who === who && s.t >= s.cur.from && s.t < s.cur.from + s.cur.voice;

const VOWEL: Record<string, number> = {a: 1, o: 0.9, e: 0.7, u: 0.62, i: 0.56, y: 0.5};
/** Mouth opening 0..1 of `who` now, from the voice's word timings (one opening a syllable; closed on m, b, p and between words). */
export const talk = (s: ShotNow, who: string) => {
  const l = s.cur;
  if (!l || l.who !== who) return 0;
  const t = s.t - l.from;
  const w = l.words.find((x) => t >= x.start && t <= x.end + 0.03);
  if (!w) return 0;
  const letters = w.w.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters) return 0;
  const groups = letters.match(/[aeiouy]+/g) ?? ['e'];
  const u = clamp01((t - w.start) / Math.max(0.06, w.end - w.start));
  const idx = Math.min(groups.length - 1, Math.floor(u * groups.length));
  const local = u * groups.length - idx;
  if (/^[mbp]/.test(letters) && u < 0.14) return 0;
  return clamp01(Math.sin(Math.PI * local) ** 0.6 * (VOWEL[groups[idx][0]] ?? 0.7) * 0.95 + 0.05);
};
/** Eyelids 0..1 (1 = shut): a quick blink every few seconds, at its own rhythm for each `seed`. */
export const blink = (t: number, seed = 0) => {
  const period = 2.6 + ((seed * 0.73) % 1.9);
  const x = (t + seed * 1.31) % period;
  return x < 0.13 ? Math.sin((x / 0.13) * Math.PI) : 0;
};

/**
 * Engine v9 (blueprint 4.3): the 0.2 s blink as a CONTINUOUS upper lid 0..1 (open, half, shut, half, open; no threshold
 * switch), at its own rhythm for each `seed` (3-5 s apart). Feeds the kit's `lid` (Eyes / Acting / a stage face).
 */
export const BLINK9 = {dur: 0.2, min: 3, spread: 2};
export const blinkLid = (t: number, seed = 0) => {
  const period = BLINK9.min + ((seed * 0.73) % BLINK9.spread);
  const x = (((t + seed * 1.31) % period) + period) % period;
  if (x >= BLINK9.dur) return 0;
  const u = x / BLINK9.dur; // 0..1 over the blink: down fast, up a little slower
  return u < 0.4 ? Math.sin((u / 0.4) * Math.PI * 0.5) : Math.cos(((u - 0.4) / 0.6) * Math.PI * 0.5);
};

/**
 * The feeling `who` shows now: their own line's emotion while it is their line; while someone else speaks,
 * what the script says they `react` with; otherwise the feeling of their last own line; else `rest`.
 */
export const feel = (s: ShotNow, who: string, rest = 'neutral') => {
  const cur = s.cur;
  if (cur?.who === who && cur.emotion) return cur.emotion;
  if (cur?.react?.[who]) return cur.react[who];
  const mine = s.lines.filter((l) => l.who === who && l.from <= s.t && l.emotion);
  if (mine.length) return mine[mine.length - 1].emotion!;
  const reacted = s.lines.filter((l) => l.from <= s.t && l.react?.[who]);
  return reacted.length ? reacted[reacted.length - 1].react![who] : rest;
};

/** The script's emotion as a person's expression (the people rig). */
export const EXPR_OF: Record<string, Expr> = {neutral: 'neutral', happy: 'happy', angry: 'angry', scared: 'worried', smug: 'neutral', sick: 'worried', sleepy: 'sleepy', shocked: 'surprised', sad: 'worried'};
/** The script's emotion as a body character's eyes and resting mouth (the kit). */
export const FACE_OF: Record<string, {mood: Mood; mouth: MouthKind}> = {
  neutral: {mood: 'open', mouth: 'smile'}, happy: {mood: 'happy', mouth: 'smile'}, angry: {mood: 'angry', mouth: 'grit'}, scared: {mood: 'scared', mouth: 'wavy'},
  smug: {mood: 'bored', mouth: 'smile'}, sick: {mood: 'dizzy', mouth: 'wavy'}, sleepy: {mood: 'sleepy', mouth: 'flat'}, shocked: {mood: 'scared', mouth: 'o'}, sad: {mood: 'sad', mouth: 'frown'},
};
/**
 * A body character's face now: the eyes of its feeling (shut during a blink), and a mouth that talks:
 * the resting mouth while closed, 'o' half open, 'open' / 'big' wide.
 */
/**
 * The mouth opening averaged over a tenth of a second (2026-11-21, the owner: "characters flicker and jiggle when they
 * speak"): the raw opening jumps every syllable, and a mouth that changes shape on single frames reads as flicker.
 */
export const talkSmooth = (s: ShotNow, who: string) => {
  let sum = 0;
  for (const dt of [-0.05, -0.025, 0, 0.025, 0.05]) sum += talk({...s, t: s.t + dt}, who);
  return sum / 5;
};
/** Engine v9 (decision 10): body characters lose the teeth-grid mouth; angry is a flat, set mouth. */
export const FACE_OF9: Record<string, {mood: Mood; mouth: MouthKind}> = {...FACE_OF, angry: {mood: 'angry', mouth: 'flat'}};
export const bodyFace = (s: ShotNow, who: string, seed = 0, rest = 'neutral'): {mood: Mood; mouth: MouthKind; lid?: number} => {
  if (s.v9) {
    // v9: the feeling's own eyes with a continuous blink lid (the kit's Eyes / Acting take `lid`); no 'closed' switch
    const f9 = FACE_OF9[feel(s, who, rest)] ?? FACE_OF9.neutral;
    const o9 = talkSmooth(s, who);
    return {mood: f9.mood, mouth: o9 > 0.5 ? 'open' : o9 > 0.18 ? 'o' : f9.mouth, lid: f9.mood === 'happy' || f9.mood === 'dizzy' ? 0 : blinkLid(s.t, seed)};
  }
  const f = FACE_OF[feel(s, who, rest)] ?? FACE_OF.neutral;
  const open = talkSmooth(s, who);
  const shut = blink(s.t, seed) > 0.5 && f.mood !== 'happy' && f.mood !== 'dizzy';
  return {mood: shut ? 'closed' : f.mood, mouth: open > 0.5 ? 'open' : open > 0.18 ? 'o' : f.mouth};
};

// ------------------------------------------------------------------ the layout log (engine v9, phase 1; 2026-11-23)
/**
 * Where things ARE in the picture, told by the components that draw them (blueprint 05, Part 4.3). The checks
 * (`pipeline/lib/toon-layout.mjs`, `toon-staging`, `toon-motion`, `toon-score`) read this log instead of guessing
 * from the script or from the old engine: "nothing on a face", "no text on text", "the caption off the eyes" are
 * measured on what the real component tree drew.
 *
 * How it works: the probe renders a shot with a `LayoutCtx` collector. `Put` (scene.tsx), and any other wrapper
 * that moves its children, pushes its transform with `FrameMove`, so a piece reports in its OWN drawing units and
 * the log turns that into frame pixels; the probe then applies the camera to get screen pixels.
 * Outside a probe the collector is null: `useReport()` returns a no-op and `FrameMove` adds nothing to the page,
 * so a normal render is exactly what it was. A component that never reports still works (it is only unseen by
 * the layout checks; the picture checks on the final MP4 are the second net).
 * Who must call what: plans/engine-upgrade-2026-11-23/07-layout-log-wiring.md.
 */
export type Box = {x0: number; y0: number; x1: number; y1: number};
export type ReportKind = 'face' | 'eye' | 'mouth' | 'head' | 'body' | 'hand' | 'text' | 'tag' | 'label' | 'fx' | 'prop' | 'wallItem' | 'bubble' | 'watermark' | 'caption' | 'icon' | 'plate';
/** What a component reports, in its own drawing units (the log maps them). */
export type Report = {
  kind: ReportKind;
  who?: string; // the character it belongs to ('liver', 'mom'); the enclosing FrameMove's `who` when missing
  box: Box;
  dir?: [number, number]; // a gaze (the pupil's offset) or an arrow's direction, in the same units
  owner?: string; // whose it is when that is not `who` (a tag's character, a bubble's speaker)
  open?: boolean; // a hand: spread open (check M5); a mouth: open
  id?: string; // a stable name inside the shot (a burst's start time), so one thing is counted once
  tip?: [number, number]; // a tag's or a bubble's arrow tip, in the same units
  text?: string; // what a text piece says
};
/** One item of the log: the report with its box in frame (or screen) pixels. */
export type LayoutItem = Report & {space: 'frame' | 'screen'; chain: string[]; body?: string; src?: string};
export type LayoutSink = {add: (item: LayoutItem) => void; next: () => string};
/** [a, b, c, d, e, f]: x' = a x + c y + e, y' = b x + d y + f (the SVG matrix order). */
export type Mat = [number, number, number, number, number, number];
export const IDENTITY: Mat = [1, 0, 0, 1, 0, 0];
export const matMul = (m: Mat, n: Mat): Mat => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
export const matTranslate = (x: number, y: number): Mat => [1, 0, 0, 1, x, y];
export const matScale = (sx: number, sy = sx): Mat => [sx, 0, 0, sy, 0, 0];
export const matRotate = (deg: number): Mat => { const a = (deg * Math.PI) / 180, c = Math.cos(a), s = Math.sin(a); return [c, s, -s, c, 0, 0]; };
export const applyMat = (m: Mat, x: number, y: number): [number, number] => [m[0] * x + m[2] * y + m[4], m[1] * x + m[3] * y + m[5]];
/** The box that holds a box after the matrix (a rotation grows it to the axis-aligned hull). */
export const mapBox = (m: Mat, b: Box): Box => {
  const p = [applyMat(m, b.x0, b.y0), applyMat(m, b.x1, b.y0), applyMat(m, b.x0, b.y1), applyMat(m, b.x1, b.y1)];
  return {x0: Math.min(...p.map((q) => q[0])), y0: Math.min(...p.map((q) => q[1])), x1: Math.max(...p.map((q) => q[0])), y1: Math.max(...p.map((q) => q[1]))};
};
export const circleBox = (x: number, y: number, rx: number, ry = rx): Box => ({x0: x - rx, y0: y - ry, x1: x + rx, y1: y + ry});

/** The collector: null in every normal render (zero cost). */
export const LayoutCtx = createContext<LayoutSink | null>(null);
/**
 * The transform from the current drawing units to frame pixels; `chain` the moves on the way down (outermost first);
 * `who` the named character drawn here; `body` the innermost figure (a Put, a person) this piece belongs to, so a face and
 * its own hand or body are known to be one character even without a name.
 */
export type Frame = {m: Mat; space: 'frame' | 'screen'; chain: string[]; who?: string; body?: string};
export const FrameCtx = createContext<Frame>({m: IDENTITY, space: 'frame', chain: []});

const noReport = () => {};
/** `report(...)` inside a component, during render (pure: the same props give the same report). Does nothing outside a probe. */
export const useReport = (): ((r: Report) => void) => {
  const sink = useContext(LayoutCtx);
  const fr = useContext(FrameCtx);
  if (!sink) return noReport;
  return (r: Report) => {
    // a direction turns and flips with the drawing but keeps its length (a gaze of 0.1 stays a small gaze)
    const k = Math.sqrt(Math.abs(fr.m[0] * fr.m[3] - fr.m[1] * fr.m[2])) || 1;
    const lin: Mat = [fr.m[0] / k, fr.m[1] / k, fr.m[2] / k, fr.m[3] / k, 0, 0];
    sink.add({
      ...r,
      who: r.who ?? fr.who,
      box: mapBox(fr.m, r.box),
      dir: r.dir && applyMat(lin, r.dir[0], r.dir[1]),
      tip: r.tip && applyMat(fr.m, r.tip[0], r.tip[1]),
      space: fr.space,
      chain: fr.chain,
      body: fr.body,
    });
  };
};
/** True inside a probe: a component may skip work that only feeds the log. */
export const useProbing = () => useContext(LayoutCtx) !== null;

/**
 * Children drawn in units that `m` turns into the parent's units (a Put's figure space, a dive's zoom about a point).
 * It only TELLS the log; the caller still draws its own transform. `who` names the character drawn inside; `body` marks
 * a new figure (a Put, a person): what is drawn inside belongs to it.
 * Outside a probe it renders the children unchanged (no element, no cost).
 */
export const FrameMove: React.FC<{m: Mat; who?: string; body?: boolean; children?: React.ReactNode}> = ({m, who, body, children}) => {
  const sink = useContext(LayoutCtx);
  const fr = useContext(FrameCtx);
  const id = useId(); // stable from one probe to the next (the tree position), so a figure keeps its name over time
  if (!sink) return <>{children}</>;
  return <FrameCtx.Provider value={{m: matMul(fr.m, m), space: fr.space, chain: [...fr.chain, id], who: who ?? fr.who, body: body ? who ?? id : fr.body}}>{children}</FrameCtx.Provider>;
};
/** Children laid on the SCREEN after the camera (a shot's `Screen`, the player's caption): their reports are screen pixels. */
export const ScreenSpace: React.FC<{children?: React.ReactNode}> = ({children}) => {
  const sink = useContext(LayoutCtx);
  if (!sink) return <>{children}</>;
  return <FrameCtx.Provider value={{m: IDENTITY, space: 'screen', chain: []}}>{children}</FrameCtx.Provider>;
};
