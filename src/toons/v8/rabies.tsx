import React from 'react';
/** The rabies video's shots in look v8, by shot id (videos/rabies/toon.json). */
import {lerp, type ShotDef, type ShotNow} from './play';
import {Stopwatch, VaccineShield, type CtaPoint} from './hud';
import {Soap, Stethoscope} from './props';

import {BODY_SHOTS} from './scenes-body';
import {ROOM_SHOTS} from './scenes-rooms';
import {V3_SHOTS} from './shots-v3';

// Inside the body the action is small in the frame: each of those shots gets its own framing, a slow push in.
const push = (x: number, y: number, z0: number, z1: number) => (s: ShotNow) => ({x, y, z: lerp(z0, z1, Math.min(1, s.t / s.dur))});
const framed = (id: string, view: ShotDef['view']): ShotDef => ({...BODY_SHOTS[id], view});

export const RABIES_SHOTS: Record<string, ShotDef> = {
  ...BODY_SHOTS,
  A: framed('A', push(560, 830, 1.2, 1.26)),
  B: framed('B', push(540, 820, 1.14, 1.2)),
  M2: framed('M2', push(540, 860, 1.12, 1.2)),
  E: framed('E', push(540, 880, 1.0, 1.04)),
  M3: framed('M3', push(540, 890, 1.06, 1.1)),
  ...ROOM_SHOTS,
  ...V3_SHOTS, // version 3: the new microscopic world (2026-11-20)
};

// ------------------------------------------------------------------ the CTA end card: three strong points
export const RABIES_CTA: {title: string; points: CtaPoint[]; voice: string; seconds: number; at: {head: number; points: [number, number, number]; follow: number}} = {
  title: 'BITTEN OR SCRATCHED?',
  // read by the narrator (Joey), assets/toons-voice/rabies/cta.mp3; word times from videos/rabies/cta-timings.json
  voice: 'toons/rabies/voice/cta.mp3', seconds: 13.32, // Joey's take at normal speed: never cut or speed up the narrator (the owner)
  at: {head: 0, points: [2.07, 5.11, 6.86], follow: 9.74},
  points: [
    {icon: <g><g transform="translate(-28 0) scale(0.78)"><Stopwatch t={2} /></g><g transform="translate(46 44) scale(0.5)"><Soap /></g></g>, big: 'WASH 15 MIN', small: 'soap and running water'},
    {icon: <g transform="scale(0.95)"><Stethoscope /></g>, big: 'SEE A DOCTOR', small: 'the same day'},
    {icon: <VaccineShield t={2} />, big: 'GET EVERY SHOT', small: 'finish the vaccine course'},
  ],
};
