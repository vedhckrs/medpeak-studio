/** The rabies video's shots in look v8, by shot id (videos/rabies/toon.json). */
import {lerp, type ShotDef, type ShotNow} from './play';
import {BODY_SHOTS} from './scenes-body';
import {ROOM_SHOTS} from './scenes-rooms';

// Inside the body the action is small in the frame: each of those shots gets its own framing, a slow push in.
const push = (x: number, y: number, z0: number, z1: number) => (s: ShotNow) => ({x, y, z: lerp(z0, z1, Math.min(1, s.t / s.dur))});
const framed = (id: string, view: ShotDef['view']): ShotDef => ({...BODY_SHOTS[id], view});

export const RABIES_SHOTS: Record<string, ShotDef> = {
  ...BODY_SHOTS,
  A: framed('A', push(560, 830, 1.2, 1.26)),
  B: framed('B', push(540, 820, 1.14, 1.2)),
  M2: framed('M2', push(540, 860, 1.12, 1.2)),
  E: framed('E', push(540, 860, 1.05, 1.09)),
  M3: framed('M3', push(540, 830, 1.1, 1.17)),
  ...ROOM_SHOTS,
};
