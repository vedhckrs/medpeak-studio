// Motion helpers for MedPeak Toons. Rule (owner, 2026-11-16): nothing wobbles. A character holds a
// pose (breathing only), then moves with anticipation, an eased move, a small overshoot and a settle.
export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export type Ease = (t: number) => number;
export const E = {
  linear: (t: number) => t,
  in: (t: number) => t * t * t,
  out: (t: number) => 1 - (1 - t) ** 3,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2),
  /** overshoots the target by about 10% and comes back: for pops and arm poses */
  back: (t: number) => 1 + 2.70158 * (t - 1) ** 3 + 1.70158 * (t - 1) ** 2,
};
/** Keyframes [[frame, value, ease into this key]]: holds before the first and after the last. */
export const key = (f: number, ks: [number, number, Ease?][]) => {
  if (f <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    if (f <= ks[i][0]) {
      const [f0, v0] = ks[i - 1];
      const [f1, v1, ease = E.inOut] = ks[i];
      return lerp(v0, v1, ease(clamp01((f - f0) / (f1 - f0))));
    }
  }
  return ks[ks.length - 1][1];
};
/** A damped wobble that starts at `start` and dies out in about 12 frames (landing, impact). */
export const settle = (f: number, start: number, amp = 1, speed = 0.9, decay = 0.28) =>
  f < start ? 0 : amp * Math.exp(-decay * (f - start)) * Math.cos(speed * (f - start));
/** Like `settle`, but it starts from zero: a quick push that swings back and dies out (no pop on the first frame). */
export const kick = (f: number, start: number, amp = 1, speed = 0.9, decay = 0.28) =>
  f < start ? 0 : amp * 1.6 * Math.exp(-decay * (f - start)) * Math.sin(speed * (f - start));
/** 0 -> 1 -> 0 around a stretch [from, to): eased over `ease` frames at both ends (no step at the edges). */
export const ramp = (f: number, from: number, to: number, ease = 8) => {
  const u = Math.max(0, Math.min(1, (f - from) / ease, (to - f) / ease));
  return u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2;
};
/** Mouth opening for speech between two frames: about 5 syllables a second, closed outside. */
export const speak = (f: number, from: number, to: number, seed = 0) => {
  if (f < from || f >= to) return 0;
  const edge = Math.min(1, (f - from) / 2, (to - f) / 2);
  const syl = Math.abs(Math.sin(((f - from) * Math.PI) / 5.5 + seed));
  const vary = 0.72 + 0.28 * Math.sin((f - from) * 0.37 + seed * 3);
  return edge * syl ** 0.7 * vary;
};

// ------------------------------------------------------------------ lip-sync
import type {SpokenWord} from './director';
export {guessWords, type SpokenWord} from './director';
const VOWEL_OPEN: Record<string, number> = {a: 1, o: 0.9, e: 0.7, u: 0.62, i: 0.56, y: 0.5};
/**
 * Mouth opening (0-1) at time `t` (seconds into the line) from ElevenLabs word timings.
 * Each word opens once per syllable; the opening size follows the vowel (a/o wide, e/i narrow);
 * the lips close on m, b, p and between words.
 */
export const lipsync = (words: SpokenWord[], t: number) => {
  const w = words.find((x) => t >= x.start && t <= x.end + 0.03);
  if (!w) return 0;
  const letters = w.w.toLowerCase().replace(/[^a-z]/g, '');
  if (!letters) return 0;
  const groups = letters.match(/[aeiouy]+/g) ?? ['e'];
  const u = clamp01((t - w.start) / Math.max(0.06, w.end - w.start));
  const idx = Math.min(groups.length - 1, Math.floor(u * groups.length));
  const local = u * groups.length - idx;
  const size = VOWEL_OPEN[groups[idx][0]] ?? 0.7;
  const lipsClosed = /^[mbp]/.test(letters) && u < 0.14;
  if (lipsClosed) return 0;
  return clamp01(Math.sin(Math.PI * local) ** 0.6 * size * 0.95 + 0.05);
};
