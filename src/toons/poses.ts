// Named arm poses for Toon scripts ("pose": "point"). Organs and people share the names;
// people hang their arms differently, so each pose has two versions.
import type {ArmSpec, HandPose} from './rig';

export type PoseName = 'rest' | 'wave' | 'point' | 'pointLeft' | 'panic' | 'fists' | 'thumb' | 'shrug' | 'hips' | 'belly' | 'explain' | 'think' | 'present' | 'cheer' | 'heart' | 'facepalm' | 'crossed';
type Pair = [ArmSpec, ArmSpec];

// People have real joints. A pose is written for the RIGHT arm (the one on screen right) as
// R(upper-arm direction, forearm direction): 90 = straight down, 0 = out to the side, -90 = up,
// 180 and beyond = across the body. L() mirrors it for the left arm. Bodies keep soft noodle arms.
// Keep a gesturing hand within about 62 units of the body's centre line: two people stand 100 apart,
// and a hand that reaches further touches the other person (point is aimed up at the graphics for this reason).
type Opt = {hand?: HandPose; front?: boolean; ul?: number; fl?: number};
const rad = (d: number) => (d * Math.PI) / 180;
const mk = (u: number, f: number, o: Opt = {}): ArmSpec => ({a: (Math.atan2(Math.sin(rad(u)) + Math.sin(rad(f)), Math.cos(rad(u)) + Math.cos(rad(f))) * 180) / Math.PI, u, f, ...o});
const R = mk;
const L = (u: number, f: number, o: Opt = {}): ArmSpec => mk(180 - u, 180 - f, o);
const both = (u: number, f: number, o: Opt = {}): Pair => [L(u, f, o), R(u, f, o)];
const REST: [number, number] = [80, 88]; // a relaxed arm: a little away from the body, a soft elbow

export const POSES: Record<PoseName, {body: Pair; person: Pair}> = {
  rest: {body: [112, 68], person: both(...REST)},
  wave: {body: [112, {a: -55, hand: 'open'}], person: [L(...REST), R(-18, -82, {hand: 'open'})]},
  point: {body: [{a: 150, hand: 'fist'}, {a: -8, hand: 'point'}], person: [L(...REST), R(46, -46, {hand: 'point'})]},
  pointLeft: {body: [{a: 188, hand: 'point'}, {a: 30, hand: 'fist'}], person: [L(46, -46, {hand: 'point'}), R(...REST)]},
  panic: {body: [{a: 215, hand: 'open'}, {a: -35, hand: 'open'}], person: both(-16, -64, {hand: 'open'})},
  fists: {body: [{a: 150, hand: 'fist'}, {a: 30, hand: 'fist'}], person: both(66, 80, {hand: 'fist'})},
  thumb: {body: [112, {a: -48, hand: 'thumb'}], person: [L(...REST), R(52, -48, {hand: 'thumb'})]},
  shrug: {body: [{a: 190, hand: 'open'}, {a: -10, hand: 'open'}], person: both(68, -6, {hand: 'open'})},
  hips: {body: [{a: 140, len: 22, bend: 9, hand: 'fist'}, {a: 40, len: 22, bend: 9, hand: 'fist'}], person: both(46, 143, {hand: 'fist'})},
  belly: {body: [{a: 60, len: 28, front: true}, {a: 120, len: 28, front: true}], person: [L(76, 146, {hand: 'open', front: true}), R(76, 156, {hand: 'open', front: true})]},
  explain: {body: [112, {a: -22, hand: 'open'}], person: [L(...REST), R(56, -28, {hand: 'open'})]},
  think: {body: [112, {a: -70, len: 26, hand: 'fist'}], person: [L(...REST), R(96, 242, {hand: 'fist', front: true, ul: 0.6})]},
  present: {body: [{a: 165, hand: 'open'}, {a: 15, hand: 'open'}], person: both(60, -30, {hand: 'open'})},
  cheer: {body: [{a: 235, hand: 'fist'}, {a: -55, hand: 'fist'}], person: both(-30, -78, {hand: 'fist'})},
  heart: {body: [112, {a: 150, len: 26, front: true}], person: [L(...REST), R(80, 197, {hand: 'open', front: true, ul: 0.85})]},
  facepalm: {body: [112, {a: -110, len: 30, front: true}], person: [L(...REST), R(-76, 235, {hand: 'open', front: true})]},
  crossed: {body: [{a: 30, len: 26, front: true}, {a: 150, len: 26, front: true}], person: [L(80, 176, {hand: 'fist', front: true, ul: 0.9}), R(80, 190, {hand: 'fist', front: true, ul: 0.9})]},
};

const num = (s: ArmSpec): Exclude<ArmSpec, number> => (typeof s === 'number' ? {a: s} : s);
/** Blend two poses (k = 0 -> from, 1 -> to). Angles move, hand shape and layer snap at the halfway point. */
export const blendPose = (from: Pair, to: Pair, k: number): Pair =>
  [0, 1].map((i) => {
    const a = num(from[i]);
    const b = num(to[i]);
    const out = {...(k < 0.5 ? a : b), a: a.a + (b.a - a.a) * k};
    if (a.u !== undefined || b.u !== undefined) { // joints: each one swings on its own
      const mix = (x: number, y: number) => x + (y - x) * k;
      out.u = mix(a.u ?? a.a, b.u ?? b.a);
      out.f = mix(a.f ?? a.a, b.f ?? b.a);
      out.ul = mix(a.ul ?? 1, b.ul ?? 1);
      out.fl = mix(a.fl ?? 1, b.fl ?? 1);
    }
    return out;
  }) as Pair;
