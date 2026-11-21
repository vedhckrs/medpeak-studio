/**
 * MedPeak Toons, look v8: how a SHOT plays in a video (the contract between the player and the scenes).
 *
 * The player (video.tsx) reads a video's toon.json and its voice timings, works out which shot and which line
 * are on at every frame, and hands each shot one object, `ShotNow`. A shot is a pure function of it: the same
 * `s` always draws the same picture (no state, no random numbers, no clocks), so every frame renders alone.
 *
 * Time is in SECONDS (fractional; the video runs at 60 frames a second). Never count frames in a shot.
 */
import React from 'react';
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
};

/** Everything a shot may know about "now". */
export type ShotNow = {
  id: string; // the shot's id in toon.json: 'A', 'B', 'M2', 'C', 'D', 'E', 'M3'
  t: number; // seconds since this shot began
  dur: number; // seconds this shot lasts
  lines: LineNow[]; // this shot's lines, in order
  cur: LineNow | null; // the line whose time it is now (also during its closing gap); null only before the first
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
export const bodyFace = (s: ShotNow, who: string, seed = 0, rest = 'neutral'): {mood: Mood; mouth: MouthKind} => {
  const f = FACE_OF[feel(s, who, rest)] ?? FACE_OF.neutral;
  const open = talkSmooth(s, who);
  const shut = blink(s.t, seed) > 0.5 && f.mood !== 'happy' && f.mood !== 'dizzy';
  return {mood: shut ? 'closed' : f.mood, mouth: open > 0.5 ? 'open' : open > 0.18 ? 'o' : f.mouth};
};
