/**
 * MedPeak Toons, look v8: the acting kit for the WHOLE-organ characters (the big stomach, liver, brain that fill the frame).
 * Before this (2026-11-22, the owner on the fasting preview: "refine character animation and visual first") a whole organ
 * only changed its face: its two little arms never moved. Now each arm takes a GESTURE, gestures blend (never snap), and the
 * body can squash, stretch and lean. Every move has a reason in the script (a word, a beat): nothing sways on its own.
 *
 *   gesture   rest | up (fist raised) | pound (fist thrown forward) | point | wave | shrug | hips | fold (across the body)
 *             | tap (reaching out and down) | reach (out to the side, low) | cheek (hand up by the face: a take) | count (one finger up)
 *   ArmPose   {a, b?, k?}: gesture a, or a blend from a to b (k 0..1)
 *   armTo     the bend and hand points of an arm from its shoulder `from`, for a side s (-1 the organ's left, +1 its right)
 *   gestureAt the gesture at time t from a list of (start, gesture, blend seconds): key poses that HOLD between beats
 *   pounding  a fist pumping between `up` and `pound` while a beat lasts (the growl, the "Feed me!")
 */
import React from 'react';
import {TinyArm} from './kit';

type P = [number, number];
export type Gesture = 'rest' | 'up' | 'pound' | 'point' | 'wave' | 'shrug' | 'hips' | 'fold' | 'tap' | 'reach' | 'cheek' | 'count';
export type ArmPose = {a: Gesture; b?: Gesture; k?: number};
type Hand = 'mitten' | 'fist' | 'open';
// offsets from the shoulder in the organ's own units, for a RIGHT arm (x is mirrored for the left), about 30 units long
const G: Record<Gesture, {b: P; t: P; h: Hand}> = {
  rest: {b: [12, 18], t: [4, 40], h: 'mitten'},
  up: {b: [22, -4], t: [18, -30], h: 'fist'},
  pound: {b: [26, 10], t: [38, 26], h: 'fist'},
  point: {b: [22, 0], t: [44, -8], h: 'open'},
  wave: {b: [24, -8], t: [20, -36], h: 'open'},
  shrug: {b: [24, -2], t: [38, -14], h: 'open'},
  hips: {b: [24, 6], t: [4, 26], h: 'fist'},
  fold: {b: [14, 14], t: [-18, 16], h: 'mitten'},
  tap: {b: [26, 12], t: [46, 30], h: 'open'},
  reach: {b: [28, 14], t: [56, 22], h: 'open'},
  cheek: {b: [8, -8], t: [-6, -30], h: 'open'},
  count: {b: [22, -6], t: [26, -32], h: 'open'},
};
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const smooth = (k: number) => { const x = Math.max(0, Math.min(1, k)); return x * x * (3 - 2 * x); };

/** The bend and hand points (organ units) of an arm at shoulder `from`, side s, in pose `p`; `len` scales the reach. */
export const armTo = (from: P, s: -1 | 1, p: ArmPose | Gesture, len = 1): {bend: P; to: P; hand: Hand} => {
  const q: ArmPose = typeof p === 'string' ? {a: p} : p;
  const A = G[q.a], B = G[q.b ?? q.a], k = smooth(q.k ?? 0);
  const off = (u: P, v: P): P => [lerp(u[0], v[0], k) * s * len, lerp(u[1], v[1], k) * len];
  const b = off(A.b, B.b), t = off(A.t, B.t);
  return {bend: [from[0] + b[0], from[1] + b[1]], to: [from[0] + t[0], from[1] + t[1]], hand: k < 0.5 ? A.h : B.h};
};

/** One posable organ arm. */
export const OrganArm: React.FC<{from: P; s: -1 | 1; pose: ArmPose | Gesture; fill: string; len?: number; w?: number}> = ({from, s, pose, fill, len = 1, w}) => {
  const a = armTo(from, s, pose, len);
  return <TinyArm from={from} bend={a.bend} to={a.to} fill={fill} hand={a.hand} w={w} />;
};

export type GStep = [number, Gesture, number?];
/** The gesture at time t from (start, gesture, blend seconds) steps: blended in, then HELD until the next step. */
export const gestureAt = (t: number, steps: GStep[]): ArmPose => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return {a: steps[0][1]};
  const [t0, b, d = 0.25] = steps[i];
  const k = Math.max(0, Math.min(1, (t - t0) / d));
  return k >= 1 ? {a: b} : {a: steps[i - 1][1], b, k};
};

/** A fist pumping between `up` and `pound` from t0 for `dur` seconds (rate: beats a second; phase: 0.5 = the other arm). */
export const pounding = (t: number, t0: number, dur: number, rate = 3.2, phase = 0): ArmPose | null => {
  const u = t - t0;
  if (u < 0 || u > dur) return null;
  const k = (Math.sin((u * rate + phase) * Math.PI * 2) + 1) / 2;
  return {a: 'up', b: 'pound', k};
};

/** A body squash/stretch and lean as an SVG transform around the organ's base (`base` y in organ units). */
export const bodyTx = (sq = 0, rot = 0, base = 50) =>
  `rotate(${rot.toFixed(2)} 0 ${base}) translate(0 ${base}) scale(${(1 + sq).toFixed(4)} ${(1 - sq).toFixed(4)}) translate(0 ${-base})`;
