// Named arm poses for Toon scripts ("pose": "point"). Organs and people share the names;
// people hang their arms differently, so each pose has two versions.
import type {ArmSpec} from './rig';

export type PoseName = 'rest' | 'wave' | 'point' | 'pointLeft' | 'panic' | 'fists' | 'thumb' | 'shrug' | 'hips' | 'belly' | 'explain' | 'think' | 'present' | 'cheer' | 'heart' | 'facepalm' | 'crossed';
type Pair = [ArmSpec, ArmSpec];

// People bend a real elbow: `a` is the direction from the shoulder to the hand, `len` how far the
// hand is from the shoulder (49 = arm straight; shorter = elbow bent). Bodies have soft noodle arms.
export const POSES: Record<PoseName, {body: Pair; person: Pair}> = {
  rest: {body: [112, 68], person: [95, 85]},
  wave: {body: [112, {a: -55, hand: 'open'}], person: [95, {a: -62, len: 42, hand: 'open'}]},
  point: {body: [{a: 150, hand: 'fist'}, {a: -8, hand: 'point'}], person: [95, {a: -30, len: 38, hand: 'point'}]},
  pointLeft: {body: [{a: 188, hand: 'point'}, {a: 30, hand: 'fist'}], person: [{a: 198, len: 47, hand: 'point'}, 85]},
  panic: {body: [{a: 215, hand: 'open'}, {a: -35, hand: 'open'}], person: [{a: 236, len: 44, hand: 'open'}, {a: -56, len: 44, hand: 'open'}]},
  fists: {body: [{a: 150, hand: 'fist'}, {a: 30, hand: 'fist'}], person: [{a: 116, len: 43, hand: 'fist'}, {a: 64, len: 43, hand: 'fist'}]},
  thumb: {body: [112, {a: -48, hand: 'thumb'}], person: [95, {a: -60, len: 33, hand: 'thumb'}]},
  shrug: {body: [{a: 190, hand: 'open'}, {a: -10, hand: 'open'}], person: [{a: 152, len: 36, hand: 'open'}, {a: 28, len: 36, hand: 'open'}]},
  hips: {body: [{a: 140, len: 22, bend: 9, hand: 'fist'}, {a: 40, len: 22, bend: 9, hand: 'fist'}], person: [{a: 87, len: 37, hand: 'fist'}, {a: 93, len: 37, hand: 'fist'}]},
  belly: {body: [{a: 60, len: 28, front: true}, {a: 120, len: 28, front: true}], person: [{a: 69, len: 40, front: true}, {a: 111, len: 40, front: true}]},
  explain: {body: [112, {a: -22, hand: 'open'}], person: [95, {a: -30, len: 32, hand: 'open'}]},
  think: {body: [112, {a: -70, len: 26, hand: 'fist'}], person: [95, {a: -146, len: 19, hand: 'fist', front: true}]},
  present: {body: [{a: 165, hand: 'open'}, {a: 15, hand: 'open'}], person: [{a: 142, len: 34, hand: 'open'}, {a: 38, len: 34, hand: 'open'}]},
  cheer: {body: [{a: 235, hand: 'fist'}, {a: -55, hand: 'fist'}], person: [{a: 250, len: 46, hand: 'fist'}, {a: -70, len: 46, hand: 'fist'}]},
  heart: {body: [112, {a: 150, len: 26, front: true}], person: [95, {a: 149, len: 27, hand: 'open', front: true}]},
  facepalm: {body: [112, {a: -110, len: 30, front: true}], person: [95, {a: -107, len: 46, hand: 'open', front: true}]},
  crossed: {body: [{a: 30, len: 26, front: true}, {a: 150, len: 26, front: true}], person: [{a: 42, len: 30, hand: 'fist', front: true}, {a: 138, len: 30, hand: 'fist', front: true}]},
};

const num = (s: ArmSpec) => (typeof s === 'number' ? {a: s} : s);
/** Blend two poses (k = 0 -> from, 1 -> to). Angles move, hand shape and length snap at the halfway point. */
export const blendPose = (from: Pair, to: Pair, k: number): Pair =>
  [0, 1].map((i) => {
    const a = num(from[i]);
    const b = num(to[i]);
    return {...(k < 0.5 ? a : b), a: a.a + (b.a - a.a) * k};
  }) as Pair;
