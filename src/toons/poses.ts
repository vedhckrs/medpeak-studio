// Named arm poses for Toon scripts ("pose": "point"). Organs and people share the names;
// people hang their arms differently, so each pose has two versions.
import type {ArmSpec} from './rig';

export type PoseName = 'rest' | 'wave' | 'point' | 'pointLeft' | 'panic' | 'fists' | 'thumb' | 'shrug' | 'hips' | 'belly' | 'explain' | 'think';
type Pair = [ArmSpec, ArmSpec];

export const POSES: Record<PoseName, {body: Pair; person: Pair}> = {
  rest: {body: [112, 68], person: [97, 83]},
  wave: {body: [112, {a: -55, hand: 'open'}], person: [97, {a: -58, hand: 'open'}]},
  point: {body: [{a: 150, hand: 'fist'}, {a: -8, hand: 'point'}], person: [97, {a: -22, len: 44, hand: 'point'}]},
  pointLeft: {body: [{a: 188, hand: 'point'}, {a: 30, hand: 'fist'}], person: [{a: 192, hand: 'point'}, 83]},
  panic: {body: [{a: 215, hand: 'open'}, {a: -35, hand: 'open'}], person: [{a: 222, hand: 'open'}, {a: -42, hand: 'open'}]},
  fists: {body: [{a: 150, hand: 'fist'}, {a: 30, hand: 'fist'}], person: [{a: 118, hand: 'fist'}, {a: 62, hand: 'fist'}]},
  thumb: {body: [112, {a: -48, hand: 'thumb'}], person: [97, {a: -40, hand: 'thumb'}]},
  shrug: {body: [{a: 190, hand: 'open'}, {a: -10, hand: 'open'}], person: [{a: 160, hand: 'open'}, {a: 20, hand: 'open'}]},
  hips: {body: [{a: 140, len: 22, bend: 9, hand: 'fist'}, {a: 40, len: 22, bend: 9, hand: 'fist'}], person: [{a: 118, len: 30, bend: 12, hand: 'fist'}, {a: 62, len: 30, bend: 12, hand: 'fist'}]},
  belly: {body: [{a: 60, len: 28, front: true}, {a: 120, len: 28, front: true}], person: [{a: 68, len: 36, bend: -10, front: true}, {a: 112, len: 36, bend: 10, front: true}]},
  explain: {body: [112, {a: -22, hand: 'open'}], person: [97, {a: -52, len: 40, bend: 14, hand: 'open'}]},
  think: {body: [112, {a: -70, len: 26, hand: 'fist'}], person: [97, {a: -74, len: 34, bend: 12, hand: 'fist', front: true}]},
};

const num = (s: ArmSpec) => (typeof s === 'number' ? {a: s} : s);
/** Blend two poses (k = 0 -> from, 1 -> to). Angles move, hand shape and length snap at the halfway point. */
export const blendPose = (from: Pair, to: Pair, k: number): Pair =>
  [0, 1].map((i) => {
    const a = num(from[i]);
    const b = num(to[i]);
    return {...(k < 0.5 ? a : b), a: a.a + (b.a - a.a) * k};
  }) as Pair;
