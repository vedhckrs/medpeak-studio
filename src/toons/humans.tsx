// MedPeak Toons people (v6): full-body, built from ONE recipe so every new person matches.
// A person is a HumanSpec: skin, eyes, hair, top, bottom, shoes, extras. The recipe builds a real
// little skeleton (hips, knees, shoulders, elbows, neck), so people can shift their weight, lean,
// bend their knees, nod, tilt and turn their head, and bend their arms at the elbow.
// Proportions (in the 200-unit box, feet on y = 96): adults about 3.6 heads tall, kids 2.9,
// toddlers 2.2. Bigger heads than real life, because the face is what the viewer reads.
// To add a person: write a HumanSpec, add it to SPECS, render the model sheet.
import React from 'react';
import {Cast, circlePath, Contact, ellipsePath, Groove, lift, lineOf, Mark, Merge, Part, roundRect, Scaled, shade, spline, Tube, useLine} from './ink';
import {type ArmSpec, armOf, Face, Hand, Shoe} from './rig';
import {POSES} from './poses';
import type {Act, CharProps} from './blueprint';
import {STYLE} from './style';

export type HairStyle = 'curly' | 'short' | 'long' | 'bun' | 'cap' | 'capback' | 'messy' | 'balding' | 'baby';
export type TopKind = 'coat' | 'hoodie' | 'tee' | 'blouse' | 'cardigan' | 'onesie';
export type BottomKind = 'trousers' | 'skirt' | 'shorts';
export type HumanSpec = {
  name: string;
  role: string;
  skin: string;
  eye: string; // iris colour
  height?: number; // 1 = adult, 0.76 = kid, 0.62 = toddler
  head?: number; // head size multiplier (kids have bigger heads)
  legs?: number; // leg length, 1 = adult; kids 0.8, toddlers 0.45
  torso?: number; // torso length, 1 = adult; toddlers 0.8
  hair: {style: HairStyle; color: string; under?: string};
  top: {kind: TopKind; color: string; under?: string};
  bottom: {kind: BottomKind; color: string};
  shoes: string;
  lashes?: boolean;
  glasses?: 'round' | 'square';
  moustache?: string;
  earrings?: string;
  stethoscope?: boolean;
};
type V = [number, number];

/** The skeleton of a person in box units (before the height scale): where the joints are. */
export const skeleton = (s: {head?: number; legs?: number; torso?: number}) => {
  const hs = s.head ?? 1;
  const legLen = 62 * (s.legs ?? 1);
  const hipY = 88 - legLen;
  const torsoLen = 53 * (s.torso ?? 1);
  const headUp = torsoLen + 9 + 25 * hs; // head centre above the hips
  return {hs, legLen, hipY, torsoLen, headUp, headC: hipY - headUp};
};
/** Where a person's head centre sits in the 200-unit box (people differ in height, head size and leg length). */
export const headY = (sp: {height?: number; head?: number; legs?: number; torso?: number}) => 96 - (96 - skeleton(sp).headC) * (sp.height ?? 1);

/** Two-bone joint: where the knee or elbow is, given both ends and the side it bends toward. */
const joint = (a: V, b: V, l1: number, l2: number, toward: V): V => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const d = Math.min(len, l1 + l2 - 0.01);
  const ux = dx / len;
  const uy = dy / len;
  const along = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - along * along));
  let nx = -uy;
  let ny = ux;
  if (nx * toward[0] + ny * toward[1] < 0) { nx = -nx; ny = -ny; }
  return [a[0] + ux * along + nx * h, a[1] + uy * along + ny * h];
};
const f1 = (n: number) => n.toFixed(1);
const dirOf = (deg: number): V => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];
const along = (a: V, b: V, t: number): V => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
/** A limb segment: round at both ends, tapering from radius `ra` at a to `rb` at b. `ky` squeezes y (for a shadow drawn inside a scaled group); `flat` cuts the far end square (a trouser hem). */
const capsule = (a0: V, b0: V, ra: number, rb: number, ky = 1, flat = false) => {
  const a: V = [a0[0], a0[1] / ky];
  const b: V = [b0[0], b0[1] / ky];
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len;
  const ny = dx / len;
  const far = flat ? `L${f1(b[0] - nx * rb)} ${f1(b[1] - ny * rb)}` : `A${f1(rb)} ${f1(rb)} 0 0 0 ${f1(b[0] - nx * rb)} ${f1(b[1] - ny * rb)}`;
  return `M${f1(a[0] + nx * ra)} ${f1(a[1] + ny * ra)} L${f1(b[0] + nx * rb)} ${f1(b[1] + ny * rb)} ${far} L${f1(a[0] - nx * ra)} ${f1(a[1] - ny * ra)} A${f1(ra)} ${f1(ra)} 0 0 0 ${f1(a[0] + nx * ra)} ${f1(a[1] + ny * ra)} Z`;
};

/** The parts of a pose the skeleton needs. */
export type BodyPose = {act?: Act; arms?: [ArmSpec, ArmSpec] | null; step?: number};
const ease01 = (v: number) => { const u = Math.max(0, Math.min(1, Math.abs(v))); return u * u * (3 - 2 * u); };
/**
 * Where every joint of a person is for a pose (box units, before the height scale). Pure maths, so
 * the motion check (pipeline/lib/toon-motion.mjs) measures exactly what is drawn.
 *
 * LEGS: the feet stay planted. A knee bend is SET (by a weight shift, a crouch or a step) and the
 * hip drops by exactly what that bend takes up; the knee is never solved back from the hip. That
 * old way made a knee snap sideways whenever the hip moved a hair (the "legs jump").
 */
export const jointsOf = (s: {head?: number; legs?: number; torso?: number}, p: BodyPose) => {
  const k = skeleton(s);
  const act = p.act ?? {};
  const step = p.step ?? 0;
  const tk = (s.torso ?? 1) * (53 / 56);
  const seg = 25 * Math.min(1, 0.6 + 0.4 * (s.legs ?? 1)); // upper arm = forearm; toddlers have short arms
  const sh = Math.max(-1, Math.min(1, act.shift ?? 0)); // weight toward screen left (-) or right (+)
  const crouch = Math.max(0, act.bob ?? 0);
  const bends = ([-1, 1] as const).map((side) => {
    const sw = step * side;
    const free = sh * side < 0 ? ease01(sh) : 0; // the leg that carries no weight relaxes
    const bend = free * 3 + crouch * 5 + Math.max(0, sw) * 3; // how far the knee stands out from the leg's line
    return {side, sw, bend, drop: (2 * bend * bend) / k.legLen};
  });
  const hip: V = [sh * 2.4, k.hipY + (bends[0].drop + bends[1].drop) / 2];
  const pelvisTilt = (Math.atan2(bends[1].drop - bends[0].drop, 16.8) * 180) / Math.PI; // the free side hangs a little lower
  const lean = (act.lean ?? 0) - sh * 1.4;
  const shrug = (act.shrug ?? 0) * 3.4;
  const legs = bends.map(({side, sw, bend, drop}) => {
    const hp: V = [hip[0] + side * 8.4, k.hipY + drop];
    const an: V = [side * 9.6 + sw * 7, 88 - Math.max(0, sw) * 5];
    const kn: V = [(hp[0] + an[0]) / 2 + side * bend, (hp[1] + an[1]) / 2];
    return {side, hp, kn, an, bend};
  });
  const pair = p.arms === null ? null : p.arms ?? POSES.rest.person;
  const arms = pair ? ([0, 1] as const).map((i) => {
    const sp = armOf(pair[i] as ArmSpec);
    const side = i === 0 ? -1 : 1;
    const S: V = [side * 18.2, -49.6 * tk - shrug];
    let E: V;
    let W: V;
    if (sp.u !== undefined && sp.f !== undefined) { // joints given: forward from the shoulder
      const du = dirOf(sp.u);
      const df = dirOf(sp.f);
      const l1 = seg * (sp.ul ?? 1);
      const l2 = seg * 0.94 * (sp.fl ?? 1);
      E = [S[0] + du[0] * l1, S[1] + du[1] * l1];
      W = [E[0] + df[0] * l2, E[1] + df[1] * l2];
    } else { // a direction and a reach: the elbow is solved (down, or outward for a hanging arm)
      const L = (Math.min(sp.len ?? 49.4, 49.4) * seg) / 25;
      const a = (sp.a * Math.PI) / 180;
      W = [S[0] + Math.cos(a) * L, S[1] + Math.sin(a) * L];
      let n: V = [-Math.sin(a), Math.cos(a)];
      if (Math.abs(n[1]) < 0.3) n = [side, 0.2]; else if (n[1] < 0) n = [-n[0], -n[1]];
      E = joint(S, W, seg, seg, n);
    }
    return {i, side, sp, S, E, W};
  }) : null;
  /** A point given in torso coordinates (hips at 0,0), as it lands in the box once the torso leans. */
  const fromTorso = ([x, y]: V): V => { const r = (lean * Math.PI) / 180; return [hip[0] + x * Math.cos(r) - y * Math.sin(r), hip[1] + x * Math.sin(r) + y * Math.cos(r)]; };
  return {k, tk, hip, pelvisTilt, lean, shrug, legs, arms, fromTorso, headTilt: (act.tilt ?? 0) + sh * 1.2};
};

const Line: React.FC<{d: string; color: string; k?: number; opacity?: number; dash?: string}> = ({d, color, k = 0.62, opacity, dash}) => {
  const w = useLine(k);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} strokeDasharray={dash} />;
};

// ------------------------------------------------------------------ head (head-local: 46 x 50, centre 0,0)
const HEAD = spline([[0, -25], [14, -23], [22, -12], [23, 2], [19.5, 15], [10.5, 23.5], [0, 25.5], [-10.5, 23.5], [-19.5, 15], [-23, 2], [-22, -12], [-14, -23]]);
const curl = (x: number, y: number, r: number, color: string, i: number) => (
  <g key={i}>
    <path d={`M${f1(x - r * 0.5)} ${f1(y - r * 0.1)} Q${f1(x - r * 0.2)} ${f1(y - r * 0.75)} ${f1(x + r * 0.42)} ${f1(y - r * 0.42)}`} fill="none" stroke={lift(color, 0.34)} strokeWidth={1.2} strokeLinecap="round" opacity={0.85} />
    <path d={`M${f1(x + r * 0.5)} ${f1(y + r * 0.1)} Q${f1(x + r * 0.2)} ${f1(y + r * 0.7)} ${f1(x - r * 0.3)} ${f1(y + r * 0.45)}`} fill="none" stroke={shade(color, 0.4)} strokeWidth={0.9} strokeLinecap="round" opacity={0.8} />
  </g>
);
const CURLS_BACK: [number, number, number][] = [[-27, 11, 10.5], [-30.5, -1, 11], [-28, -14, 11.5], [-21, -25, 11.5], [-10, -32, 11.5], [2, -34.5, 12], [14, -31.5, 11.5], [23.5, -23, 11.5], [29.5, -11, 11], [30.5, 1, 11], [27, 12, 10.5], [-24.5, 21, 9], [24.5, 21, 9]];
const CURLS_FRONT: [number, number, number][] = [[-15.5, -15, 6.8], [-5.5, -18.6, 7.2], [5, -18.6, 7.2], [15, -15.4, 6.8]];
/** A soft lock of hair in front of each ear, from `top` down to the ear (the first ones were dark triangles that read as straps). */
const SideLocks: React.FC<{color: string; top: number}> = ({color, top}) => (
  <>
    {[-1, 1].map((k) => (
      <Part key={k} d={`M${k * 25.2} ${top} C${k * 26.2} ${f1(top + 6)} ${k * 25.2} ${f1(top + 12)} ${k * 22.8} 3.4 C${k * 22.2} ${f1(top + 11)} ${k * 21.8} ${f1(top + 6)} ${k * 20.6} ${f1(top + 0.8)} C${k * 21.2} ${f1(top - 0.6)} ${k * 23.4} ${f1(top - 0.8)} ${k * 25.2} ${top} Z`} fill={color} mat="hair" depth={1.2} />
    ))}
  </>
);
const HairBack: React.FC<{s: HumanSpec}> = ({s}) => {
  const {style, color} = s.hair;
  if (style === 'curly') {
    return (
      <>
        <Merge>{CURLS_BACK.map(([x, y, r], i) => <Part key={i} d={circlePath(x, y, r)} fill={color} mat="hair" depth={3} />)}</Merge>
        {CURLS_BACK.map(([x, y, r], i) => curl(x, y, r, color, i))}
      </>
    );
  }
  if (style === 'long') {
    return (
      <Part d="M-24 -8 C-31 -37 31 -37 24 -8 C29 10 31 32 26 47 C17 51 9 47 5 41 L-5 41 C-9 47 -17 51 -26 47 C-31 32 -29 10 -24 -8 Z" fill={color} mat="hair" depth={4}>
        {[-1, 1].map((k) => (
          <g key={k}>
            <Groove pts={[[k * 25, 6], [k * 27.5, 24], [k * 24, 42]]} w={1.6} color={color} k={0.3} />
            <Groove pts={[[k * 19, 14], [k * 20, 30], [k * 15, 44]]} w={1.4} color={color} k={0.24} />
            <Mark pts={[[k * 28, 12], [k * 29.4, 26], [k * 27, 38]]} w={1.4} color={lift(color, 0.3)} opacity={0.6} />
          </g>
        ))}
      </Part>
    );
  }
  if (style === 'short') return <Part d={ellipsePath(0, -7, 24.6, 22)} fill={shade(color, 0.12)} mat="hair" depth={3} />;
  if (style === 'bun') {
    return (
      <>
        <Part d={circlePath(0, -33.6, 9.4)} fill={color} mat="hair" depth={3}>
          <Groove pts={[[-5, -38], [0, -34], [-1, -28]]} w={1.2} color={color} k={0.3} />
          <Mark pts={[[-5.6, -37.6], [-1, -40.6], [4.6, -38.6]]} w={1.6} color={lift(color, 0.32)} opacity={0.75} />
        </Part>
        <Part d={ellipsePath(0, -6, 24.8, 21.6)} fill={shade(color, 0.12)} mat="hair" depth={3} />
      </>
    );
  }
  if (style === 'cap' || style === 'capback' || style === 'messy') {
    const u = style === 'messy' ? color : s.hair.under ?? '#3b2c25';
    return <Part d={ellipsePath(0, -4.6, 24.9, 20.6)} fill={shade(u, 0.1)} mat="hair" depth={3} />;
  }
  if (style === 'balding') {
    return <Merge>{[[-23.5, -5, 6.6], [-25.6, 4, 6.2], [-23, 12, 5.2], [23.5, -5, 6.6], [25.6, 4, 6.2], [23, 12, 5.2]].map(([x, y, r], i) => <Part key={i} d={circlePath(x, y, r)} fill={color} mat="hair" depth={2.4} />)}</Merge>;
  }
  return null;
};
const HairFront: React.FC<{s: HumanSpec}> = ({s}) => {
  const {style, color} = s.hair;
  const hi = lift(color, 0.32);
  switch (style) {
    case 'curly':
      return (
        <>
          <Merge>
            <Part d="M-22.6 -6 C-25 -31 25 -31 22.6 -6 C17 -14 9 -18 0 -17.6 C-9 -18 -17 -14 -22.6 -6 Z" fill={color} mat="hair" depth={3} />
            {CURLS_FRONT.map(([x, y, r], i) => <Part key={i} d={circlePath(x, y, r)} fill={color} mat="hair" depth={2} />)}
          </Merge>
          {CURLS_FRONT.map(([x, y, r], i) => curl(x, y, r, color, i))}
          {[[-10, -26, 6], [2, -28, 6.5], [13, -25, 6]].map(([x, y, r], i) => curl(x, y, r, color, i + 9))}
        </>
      );
    case 'short':
      return (
        <>
          <Part d="M-23.7 -1.5 C-28.5 -37 27.5 -40 23.7 -2.5 C22.6 -9 20 -14 15.4 -17.4 C13.6 -13.4 9.4 -11.2 4.4 -12 C7 -15 7 -19 4.4 -21.4 C0 -15.4 -7 -12.4 -13 -13.2 C-10.4 -16 -10.4 -19.4 -12.4 -21.4 C-17.4 -16.4 -21.6 -9 -23.7 -1.5 Z" fill={color} mat="hair" depth={3.4}>
            <Mark pts={[[-17, -25], [-6, -31.5], [8, -31], [18, -24]]} w={2.6} color={hi} opacity={0.8} />
            <Mark pts={[[-12, -19], [-4, -24], [6, -24.5]]} w={1.5} color={hi} opacity={0.6} />
            <Groove pts={[[-3, -33], [1, -26], [0, -19]]} w={1.3} color={color} k={0.4} />
            <Groove pts={[[9, -33], [13, -26], [13, -19.5]]} w={1.3} color={color} k={0.4} />
            <Groove pts={[[-14, -31], [-13, -25], [-16, -19]]} w={1.3} color={color} k={0.4} />
          </Part>
          <Part d="M-23.8 -4 L-22.4 6.5 L-20.4 -4 Z" fill={color} depth={1} />
          <Part d="M23.8 -4 L22.4 6.5 L20.4 -4 Z" fill={color} depth={1} />
        </>
      );
    case 'bun':
      // drawn back into a bun from a side parting: tidy, the forehead and the face stay open
      return (
        <>
          <Part d="M-23.8 -1.6 C-29 -35 28 -37 23.8 -2.2 C22.2 -9.6 18 -15.6 10 -19 C4.6 -15.4 -4 -13.6 -12.6 -14.4 C-17.6 -12.2 -21.8 -7.6 -23.8 -1.6 Z" fill={color} mat="hair" depth={3.2}>
            <Groove pts={[[10, -19.4], [8.6, -25], [9.6, -30.6]]} w={1.3} color={color} k={0.34} />
            <Groove pts={[[-4, -15], [-9, -23], [-8, -30]]} w={1.2} color={color} k={0.26} />
            <Mark pts={[[-18, -22], [-9, -29.6], [3, -31]]} w={2.3} color={hi} opacity={0.75} />
            <Mark pts={[[13, -28], [18.6, -23], [21.4, -15]]} w={1.6} color={hi} opacity={0.6} />
          </Part>
        </>
      );
    case 'long':
      return (
        <>
          <Part d="M-23.5 3 C-28 -33 0 -34 5 -26.5 C9 -33.5 28 -31 23.5 3 C21 -8 15 -16 5 -19.6 C-5 -15 -18 -10 -23.5 3 Z" fill={color} mat="hair" depth={3.2}>
            <Groove pts={[[5, -26], [-6, -21], [-16, -11]]} w={1.5} color={color} k={0.3} />
            <Groove pts={[[8, -26], [16, -19], [21, -8]]} w={1.4} color={color} k={0.26} />
            <Mark pts={[[-18, -20], [-9, -27.5], [1, -28.5]]} w={2.2} color={hi} opacity={0.7} />
            <Mark pts={[[10, -27], [17, -23], [21, -16]]} w={1.6} color={hi} opacity={0.6} />
          </Part>
          <Part d="M-23.6 -1 C-27.5 9 -26.5 21 -22.5 29 C-21.4 20 -21 9 -20.4 1 Z" fill={color} mat="hair" depth={1.4} />
          <Part d="M23.6 -1 C27.5 9 26.5 21 22.5 29 C21.4 20 21 9 20.4 1 Z" fill={color} mat="hair" depth={1.4} />
        </>
      );
    case 'cap':
    case 'capback': {
      // v3 (owner, 2026-11-16: "head not proper, hair and cap"). The head has HAIR first: a fringe
      // on the forehead and a lock in front of each ear. A small cap then sits on the hair, pushed
      // back a little. The crown follows the skull (the one before rose 20 units above it and was
      // wider than the head, like a helmet, with the peak down on the eyebrows and no hair in view).
      const u = s.hair.under ?? '#3b2c25';
      const uh = lift(u, 0.32);
      const crown = 'M-24.9 -12.4 C-27.8 -27 -18 -35.6 0 -35.6 C18 -35.6 27.8 -27 24.9 -12.4 C17.4 -18.4 8.8 -21.2 0 -21.2 C-8.8 -21.2 -17.4 -18.4 -24.9 -12.4 Z';
      const visor = 'M-21.6 -18 C-10.8 -22.8 10.8 -22.8 21.6 -18 C26 -14.4 13.6 -15.4 0 -15.6 C-13.6 -15.4 -26 -14.4 -21.6 -18 Z';
      const fringe = 'M-21 -16.4 C-10 -24.6 10 -24.6 21 -16.4 C21.2 -14.6 20.6 -13 19.4 -11.6 C18.2 -13 16.6 -13.9 14.6 -14.2 C14 -12.8 12.4 -11.9 10.2 -11.7 C10 -13 8.9 -14.1 7.2 -14.7 C5.8 -13.3 3.6 -12.4 0.8 -12.3 C1.1 -13.5 0.4 -14.6 -1.1 -15.2 C-3 -13.7 -5.8 -12.7 -8.8 -12.6 C-8.2 -13.8 -8.7 -14.9 -10.1 -15.5 C-12.6 -13.9 -15.6 -12.7 -18.8 -12 C-20.4 -13.2 -21.2 -14.7 -21 -16.4 Z';
      const back = style === 'capback';
      return (
        <>
          <SideLocks color={u} top={-13.4} />
          <Part d={fringe} fill={u} mat="hair" depth={1.6}>
            <Mark pts={[[-14, -15.2], [-6, -16.6], [3, -16.4]]} w={1.1} color={uh} opacity={0.7} />
          </Part>
          {!back && <Cast d={visor} on={fringe} color={u} dx={0} dy={1.6} k={0.3} />}
          <Part d={crown} fill={color} mat="cloth" shine={[-10, -29, 0.5]} depth={3.2}>
            <Line d="M0 -35.2 V-21.2 M-12 -33.4 Q-17 -27 -16 -18.8 M12 -33.4 Q17 -27 16 -18.8" color={shade(color, 0.3)} k={0.5} opacity={0.8} />
            <path d="M-25.4 -12.4 C-17.4 -18.4 -8.8 -21.2 0 -21.2 C8.8 -21.2 17.4 -18.4 25.4 -12.4 V-15.4 C17.4 -21.2 8.8 -23.8 0 -23.8 C-8.8 -23.8 -17.4 -21.2 -25.4 -15.4 Z" fill={shade(color, 0.16)} opacity={0.75} />
          </Part>
          {back ? (
            <>
              {/* worn backwards: the strap and its opening face front, a tuft of hair comes through */}
              <path d="M-7.6 -21.4 C-7.6 -29 7.6 -29 7.6 -21.4 Z" fill={u} stroke={lineOf(color)} strokeWidth={0.7} />
              <path d="M-5 -23.4 Q0 -26.8 5 -23.4" fill="none" stroke={uh} strokeWidth={0.8} strokeLinecap="round" opacity={0.7} />
              <path d="M-8.6 -21.5 H8.6" stroke={shade(color, 0.36)} strokeWidth={2.2} strokeLinecap="round" />
              {[-4.5, -1.5, 1.5, 4.5].map((x) => <circle key={x} cx={x} cy={-21.5} r={0.5} fill={lift(color, 0.5)} />)}
            </>
          ) : (
            <>
              <Part d={visor} fill={shade(color, 0.22)} mat="cloth" depth={1.6}>
                <Line d="M-17.6 -17.2 C-8 -20 8 -20 17.6 -17.2" color={lift(color, 0.3)} k={0.45} dash="2 2" opacity={0.8} />
              </Part>
              <Part d={circlePath(0, -28.4, 4.2)} fill="#ffffff" depth={1} />
              <path d="M1 -31.8 L-2.6 -27.9 H-0.3 L-1.1 -25 L2.7 -29.1 H0.3 Z" fill="#ffb300" />
            </>
          )}
          <Part d={circlePath(0, -35.6, 1.7)} fill={shade(color, 0.24)} flat />
        </>
      );
    }
    case 'messy':
      // no cap: short hair with volume on top, the fringe swept in three locks, a lock by each ear
      return (
        <>
          <Part d="M-24.6 -2 C-30.4 -30 -14 -41.6 2 -38.8 C5.6 -43.8 13.8 -42.6 12.6 -37.2 C24.4 -35 30 -20 24.6 -2.6 C23.6 -8.6 21.6 -13.6 18.4 -17 C17 -14.6 14.2 -13 11 -13 C11.6 -14.8 11 -16.4 9.6 -17.6 C7 -14.6 3 -12.6 -1.4 -12.6 C-0.6 -14.2 -1 -16 -2.4 -17.2 C-5.4 -14.2 -9.6 -12.6 -14 -13 C-13 -14.6 -13.2 -16.2 -14.4 -17.4 C-18.6 -14 -22.6 -8.6 -24.6 -2 Z" fill={color} mat="hair" depth={3.4}>
            <Mark pts={[[-17, -27], [-7, -34], [5, -34.4], [17, -27]]} w={2.6} color={hi} opacity={0.8} />
            <Mark pts={[[5, -39.4], [8.6, -41.8], [10.6, -39.4]]} w={1.3} color={hi} opacity={0.7} />
            <Groove pts={[[-3, -36], [0, -28], [-2, -19]]} w={1.3} color={color} k={0.4} />
            <Groove pts={[[10, -36], [13, -28], [10.6, -19.6]]} w={1.3} color={color} k={0.4} />
            <Groove pts={[[-14.4, -33], [-13.6, -26], [-14.6, -19.4]]} w={1.3} color={color} k={0.4} />
          </Part>
          <SideLocks color={color} top={-6} />
        </>
      );
    case 'balding':
      return (
        <>
          <Mark pts={[[-10, -23.6], [0, -27], [10, -23.6]]} w={1.2} color={shade(color, 0.3)} />
          <Mark pts={[[-6, -21], [1, -24], [8, -21.4]]} w={1} color={shade(color, 0.3)} opacity={0.8} />
          {STYLE.gloss > 0 && <ellipse cx={-7} cy={-17} rx={7} ry={2.6} transform="rotate(-18 -7 -17)" fill="#ffffff" opacity={0.3} />}
        </>
      );
    default:
      return (
        <>
          <Mark pts={[[0, -24], [4.4, -31], [-0.6, -34.4], [-5, -29.6], [-1, -26]]} w={2.6} color={color} />
          <Mark pts={[[-9, -23.5], [-11, -27.5]]} w={1.6} color={color} />
          <Mark pts={[[9, -23.5], [11.5, -27]]} w={1.6} color={color} />
        </>
      );
  }
};
const Glasses: React.FC<{kind: 'round' | 'square'}> = ({kind}) => {
  const w = useLine(0.8);
  const frame = kind === 'round' ? '#3b3654' : '#8a6a2f';
  // each lens is cut at the nose, so the two frames join at the bridge instead of crossing
  const lens = (k: number) => (kind === 'round'
    ? `M0 -2 A9.4 9.4 0 1 ${k < 0 ? 0 : 1} 0 6.4`
    : `M0 -3.4 H${k * 13.4} A3.4 3.4 0 0 ${k < 0 ? 0 : 1} ${k * 16.8} 0 V5 A3.4 3.4 0 0 ${k < 0 ? 0 : 1} ${k * 13.4} 8.4 H0`);
  return (
    <g>
      {[-1, 1].map((k) => (
        <g key={k}>
          {STYLE.gloss > 0 && <path d={`${lens(k)} Z`} fill="#ffffff" fillOpacity={0.12} />}
          <path d={lens(k)} fill="none" stroke={frame} strokeWidth={w} strokeLinecap="round" />
          {STYLE.gloss > 0 && <path d={`M${k * 8.4 - 5.6} -1.6 l3.4 -3.2`} stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />}
        </g>
      ))}
      <path d="M-17.6 0.6 L-22.6 -1.4 M17.6 0.6 L22.6 -1.4" fill="none" stroke={frame} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ clothes (torso-local: hips at 0,0; shoulders at y = -51; neck at y = -58)
const TORSO = 'M-19.5 -50 C-19.5 -56 -12 -58.5 0 -58.5 C12 -58.5 19.5 -56 19.5 -50 L17 -18 C16.6 -10 17.6 -4 18 3 C18 7.5 -18 7.5 -18 3 C-17.6 -4 -16.6 -10 -17 -18 Z';
const WIDE = 'M-21.5 -50 C-21.5 -56.4 -13 -59 0 -59 C13 -59 21.5 -56.4 21.5 -50 L19.6 -6 C19.6 2 20 5 20 6.5 C20 10.5 -20 10.5 -20 6.5 C-20 5 -19.6 2 -19.6 -6 Z';
const COAT = 'M-21.6 -50 C-21.6 -57 -14 -59.4 0 -59.6 C14 -59.4 21.6 -57 21.6 -50 C19.4 -18 22.4 6 23 26 C19.6 29.4 10 30 3.6 27 L-3.6 27 C-10 30 -19.6 29.4 -23 26 C-22.4 6 -19.4 -18 -21.6 -50 Z';
/** The outline of each top, for the shadow an arm throws on it. */
const silhouetteOf = (kind: string) => (kind === 'coat' ? COAT : kind === 'hoodie' || kind === 'cardigan' ? WIDE : TORSO);
const Top: React.FC<{s: HumanSpec}> = ({s}) => {
  const c = s.top.color;
  const under = s.top.under ?? c;
  const lc = lineOf(c);
  const vneck = (col: string) => (
    <>
      <path d="M-6.4 -59 L0 -47 L6.4 -59 Z" fill={s.skin} />
      <path d="M-6.4 -59 L0 -47 L6.4 -59" fill="none" stroke={shade(s.skin, 0.3)} strokeWidth={2.4} opacity={0.35} />
      <Line d="M-7 -58.4 L0 -46.4 L7 -58.4" color={lineOf(col)} k={0.8} />
    </>
  );
  switch (s.top.kind) {
    case 'coat': {
      const L = 'M-21.6 -50 C-21.6 -57 -14 -59.4 -7 -59.6 L-2.8 -33 L-3.6 27 C-10 30 -19.6 29.4 -23 26 C-22.4 6 -19.4 -18 -21.6 -50 Z';
      const R = 'M21.6 -50 C21.6 -57 14 -59.4 7 -59.6 L2.8 -33 L3.6 27 C10 30 19.6 29.4 23 26 C22.4 6 19.4 -18 21.6 -50 Z';
      return (
        <>
          <Part d={TORSO} fill={under} mat="cloth">
            {vneck(under)}
            <Line d="M4 -40 H12 V-33 Q8 -31.4 4 -33 Z" color={lineOf(under)} k={0.5} />
          </Part>
          <Cast d={L} on={TORSO} color={under} dx={2.4} dy={1} k={0.24} />
          <Part d={L} fill={c} mat="cloth" shadow={0.12} depth={4}>
            <Groove pts={[[-21, -6], [-15, -3], [-9, -5]]} w={1.3} color={c} k={0.16} />
            <Groove pts={[[-20, 12], [-19, 20], [-20, 27]]} w={1.3} color={c} k={0.16} />
          </Part>
          <Part d={R} fill={c} mat="cloth" shadow={0.12} depth={4}>
            <Groove pts={[[9, -5], [15, -3], [21, -6]]} w={1.3} color={c} k={0.16} />
          </Part>
          <Part d="M-7 -59.6 L-12.2 -43 L-2.9 -32.6 Z" fill={shade(c, 0.05)} mat="cloth" depth={1.6} />
          <Part d="M7 -59.6 L12.2 -43 L2.9 -32.6 Z" fill={shade(c, 0.05)} mat="cloth" depth={1.6} />
          <Line d="M-12.2 -43 L-8.8 -41 M12.2 -43 L8.8 -41" color={lc} k={0.6} />
          <Line d="M8.4 -31 H18.6 V-20 Q13.5 -18 8.4 -20 Z" color={lc} k={0.6} />
          <path d="M10.6 -31 V-36.6 M13.6 -31 V-37.6" stroke="#ea4a55" strokeWidth={1.5} strokeLinecap="round" />
          <path d="M16.4 -31 V-36" stroke="#3f6fbf" strokeWidth={1.5} strokeLinecap="round" />
          <Line d="M-19.6 6 H-9 M9 6 H19.6" color={lc} k={0.6} />
          {[-18, -4, 10].map((y) => <circle key={y} cx={6.4} cy={y} r={1.25} fill="#dfe4f0" stroke={lc} strokeWidth={0.5} />)}
          <g transform="translate(-13.4 -27)">
            <path d="M0 -6 V-1" stroke="#3a4460" strokeWidth={0.9} />
            <Part d={roundRect(-4.6, -1.6, 9.2, 11.4, 1.4)} fill="#ffffff" line="#8f97b3" depth={1} />
            <rect x={-4.6} y={-1.6} width={9.2} height={3} fill="#2ec4b6" />
            <circle cx={-1.6} cy={4.6} r={1.7} fill="#e2a67f" />
            <path d="M1.2 3.6 H3.4 M1.2 5.6 H3.4 M-3 8 H3.4" stroke="#aeb6cc" strokeWidth={0.6} />
          </g>
        </>
      );
    }
    case 'hoodie':
      return (
        <>
          <Part d={WIDE} fill={c} mat="cloth">
            <path d="M-26 -1 H26 V14 H-26 Z" fill={shade(c, 0.12)} />
            {[-16, -12, -8, -4, 0, 4, 8, 12, 16].map((x) => <path key={x} d={`M${x} 0 V10`} stroke={shade(c, 0.26)} strokeWidth={0.5} opacity={0.7} />)}
            <Groove pts={[[-19, -22], [-13, -19], [-8, -21]]} w={1.3} color={c} k={0.2} />
            <Groove pts={[[8, -21], [13, -19], [19, -22]]} w={1.3} color={c} k={0.2} />
            <Line d="M-20 -51 Q-13 -47 -9 -57 M20 -51 Q13 -47 9 -57" color={shade(c, 0.3)} k={0.5} opacity={0.7} />
          </Part>
          <Line d="M-20 -1 H20" color={lc} k={0.6} />
          <Part d="M-12.4 -19 H12.4 L15.6 -3.4 H-15.6 Z" fill={lift(c, 0.06)} mat="cloth" depth={2}>
            <path d="M-12.4 -19 L-15.6 -3.4 L-9 -3.4 Z M12.4 -19 L15.6 -3.4 L9 -3.4 Z" fill={shade(c, 0.24)} opacity={0.7} />
          </Part>
          <Part d="M-10 -58.6 Q0 -47.6 10 -58.6 Q0 -52.6 -10 -58.6 Z" fill={shade(c, 0.16)} depth={1} />
          <Line d="M-3.6 -52 V-39.6 M3.6 -52 V-38" color="#fff8e6" k={0.75} />
          <path d="M-3.6 -39.6 v3 M3.6 -38 v3" stroke="#c9a23a" strokeWidth={1.6} strokeLinecap="round" />
        </>
      );
    case 'tee':
      return (
        <Part d={TORSO} fill={c} mat="cloth">
          <path d="M-7 -59.6 Q0 -50.6 7 -59.6 Z" fill={s.skin} />
          <path d="M-8.6 -59.6 Q0 -48.6 8.6 -59.6" fill="none" stroke="#ffffff" strokeWidth={2.2} />
          <path d="M-26 -33 H26 V-25 H-26 Z" fill="#ffffff" opacity={0.9} />
          <path d="M-26 -22.6 H26 V-20.6 H-26 Z" fill="#ffffff" opacity={0.6} />
          <path d="M0 -17 l2.2 4.6 5 0.6 -3.7 3.4 1 5 -4.5 -2.6 -4.5 2.6 1 -5 -3.7 -3.4 5 -0.6 Z" fill="#ffd54a" stroke={shade('#ffd54a', 0.3)} strokeWidth={0.5} />
          <Groove pts={[[-17, -8], [-12, -5.6], [-7, -7]]} w={1.2} color={c} k={0.2} />
        </Part>
      );
    case 'blouse':
      return (
        <>
          <Part d={TORSO} fill={c} mat="cloth">
            {vneck(c)}
            <Groove pts={[[-17, -15], [-11, -12], [-6, -14]]} w={1.2} color={c} k={0.2} />
            <Groove pts={[[6, -14], [11, -12], [17, -15]]} w={1.2} color={c} k={0.2} />
            <Line d="M0 -46 V5" color={shade(c, 0.3)} k={0.5} opacity={0.8} />
          </Part>
          <Part d="M-7 -59 L-13 -52.4 L-4.6 -47.6 L0 -47.4 Z" fill={lift(c, 0.2)} mat="cloth" depth={1.4} />
          <Part d="M7 -59 L13 -52.4 L4.6 -47.6 L0 -47.4 Z" fill={lift(c, 0.2)} mat="cloth" depth={1.4} />
          {[-38, -27, -16, -5].map((y) => <circle key={y} cx={0} cy={y} r={1.25} fill="#fff4ec" stroke={lc} strokeWidth={0.5} />)}
          <path d="M-5.6 -57 Q0 -50.4 5.6 -57" fill="none" stroke="#e8b84a" strokeWidth={0.7} />
          <circle cx={0} cy={-52} r={1.5} fill="#ffd36e" stroke="#b9892c" strokeWidth={0.5} />
        </>
      );
    case 'cardigan': {
      const L = 'M-21 -50 C-21 -56.6 -14 -59 -8.4 -59.4 L-1.6 -22 L-1.6 9 C-8 11.4 -17 11 -20.4 8 C-20 -4 -19 -22 -21 -50 Z';
      const R = 'M21 -50 C21 -56.6 14 -59 8.4 -59.4 L1.6 -22 L1.6 9 C8 11.4 17 11 20.4 8 C20 -4 19 -22 21 -50 Z';
      return (
        <>
          <Part d={TORSO} fill={under} mat="cloth">
            {vneck(under)}
            <path d="M-3.4 -47 L0 -44.6 L3.4 -47 L2.4 -42.6 L0 -43.6 L-2.4 -42.6 Z" fill="#b5483f" stroke={lineOf('#b5483f')} strokeWidth={0.5} />
            <Line d="M0 -43.6 V-22" color={lineOf(under)} k={0.45} opacity={0.7} />
          </Part>
          <Cast d={L} on={TORSO} color={under} dx={2.2} dy={1} k={0.22} />
          <Part d={L} fill={c} mat="cloth" depth={4}>
            <path d="M-8.4 -59.4 L-1.6 -22 V9 H-5.4 V-22 L-12 -58 Z" fill={shade(c, 0.16)} opacity={0.75} />
            <path d="M-24 2 H0 V12 H-24 Z" fill={shade(c, 0.14)} opacity={0.75} />
            <Line d="M-17.6 -10 H-9.6 V-3 H-17.6 Z" color={lc} k={0.5} />
          </Part>
          <Part d={R} fill={c} mat="cloth" depth={4}>
            <path d="M8.4 -59.4 L1.6 -22 V9 H5.4 V-22 L12 -58 Z" fill={shade(c, 0.16)} opacity={0.75} />
            <path d="M24 2 H0 V12 H24 Z" fill={shade(c, 0.14)} opacity={0.75} />
            <Line d="M17.6 -10 H9.6 V-3 H17.6 Z" color={lc} k={0.5} />
          </Part>
          {[-16, -7, 2].map((y) => <circle key={y} cx={3.6} cy={y} r={1.45} fill="#ffe08a" stroke={lineOf('#ffe08a')} strokeWidth={0.5} />)}
        </>
      );
    }
    default:
      return (
        <>
          <Part d={TORSO} fill={c} mat="cloth">
            <path d="M-7 -59.6 Q0 -51.6 7 -59.6 Z" fill={s.skin} />
            <path d="M-8.4 -59.6 Q0 -49.8 8.4 -59.6" fill="none" stroke={lift(c, 0.5)} strokeWidth={2} />
            <path d="M-9 -28 a9 8 0 1 0 18 0 a9 8 0 1 0 -18 0 Z" fill="#fffbe8" opacity={0.95} />
            <path d="M-4.6 -29.6 a1.2 1.2 0 1 0 0.1 0 M4.4 -29.6 a1.2 1.2 0 1 0 0.1 0 M-3.4 -25.4 Q0 -22.6 3.4 -25.4" fill="none" stroke="#e39a2b" strokeWidth={1.1} strokeLinecap="round" />
          </Part>
          {[-45, -38].map((y) => <circle key={y} cx={0} cy={y} r={1.2} fill="#ffffff" stroke={lc} strokeWidth={0.45} />)}
        </>
      );
  }
};

// ------------------------------------------------------------------ the person
export type Person = React.FC<CharProps> & {spec: HumanSpec};

export const makeHuman = (s: HumanSpec): Person => {
  const h = s.height ?? 1;
  const k = skeleton(s);
  const hs = k.hs;
  const tk = (s.torso ?? 1) * (53 / 56); // the clothes are drawn for a 56-unit torso
  const long = s.top.kind !== 'tee';
  const sleeveTo = s.top.kind === 'tee' ? 0.4 : s.top.kind === 'blouse' ? 0.78 : 0.9;
  const seg = 25 * Math.min(1, 0.6 + 0.4 * (s.legs ?? 1)); // upper arm = forearm; toddlers have short arms
  const thigh = k.legLen * 0.5 + 0.12; // legs are straight at rest; the knees only show when the hips drop
  const C = ((p: CharProps) => {
    const sq = p.squash ?? 0;
    const act = p.act ?? {};
    const step = p.step ?? 0;
    const J = jointsOf(s, {act, arms: p.arms, step});
    const hip = J.hip;
    const lean = J.lean;
    const torsoT = `translate(${f1(hip[0])} ${f1(hip[1])}) rotate(${lean.toFixed(2)})`;
    const headT = `${torsoT} translate(0 ${f1(-(k.torsoLen + 9))}) rotate(${J.headTilt.toFixed(2)}) translate(0 ${f1(-25 * hs + (act.nod ?? 0) * 2.2)}) scale(${hs})`;
    const arms = J.arms;

    // ---- legs: thigh and shin, two tapering segments meeting in a real knee (see jointsOf)
    const legs = J.legs;
    const legParts = (r: [number, number, number], fill: string, mat: 'skin' | 'cloth', hem = false, to = 2) => legs.map(({side, hp, kn, an}) => (
      <React.Fragment key={side}>
        <Part d={capsule(hp, to < 1 ? along(hp, kn, to) : kn, r[0], to < 1 ? r[0] + (r[1] - r[0]) * to : r[1], 1, hem && to < 1)} fill={fill} mat={mat} depth={2.4} />
        {to >= 1 && <Part d={capsule(kn, an, r[1], r[2], 1, hem)} fill={fill} mat={mat} depth={2.4} />}
      </React.Fragment>
    ));
    const c = s.bottom.color;
    const lc = lineOf(c);
    const shoes = legs.map(({side, an}) => <g key={side} transform={`translate(${f1(an[0])} ${f1(an[1] + 4.3)}) scale(${side * 1.15} 1.15)`}><Shoe color={s.shoes} /></g>);
    const pelvis = <g transform={`translate(${f1(hip[0])} ${f1(hip[1])}) rotate(${J.pelvisTilt.toFixed(2)})`}><Part d={roundRect(-17.6, -7, 35.2, 17, 6.5)} fill={c} mat="cloth" depth={3} /></g>;
    let bottom: React.ReactNode;
    if (s.bottom.kind === 'skirt') {
      bottom = (
        <>
          <Merge>{legParts([5.4, 4.8, 4.1], s.skin, 'skin')}</Merge>
          {shoes}
          <g transform={`translate(${f1(hip[0])} ${f1(hip[1])}) rotate(${(lean * 0.4 + J.pelvisTilt).toFixed(2)})`}>
            <Part d="M-17.4 -7 L17.4 -7 L25 30 C25 34 -25 34 -25 30 Z" fill={c} mat="cloth" depth={5}>
              {[-15, -5, 5, 15].map((x) => <Groove key={x} pts={[[x * 0.72, -4], [x * 0.92, 14], [x * 1.12, 32]]} w={1.5} color={c} k={0.2} />)}
              <path d="M-30 25.4 H30 V36 H-30 Z" fill={shade(c, 0.16)} opacity={0.7} />
            </Part>
            <Line d="M-17.4 -2.6 H17.4" color={lc} k={0.6} />
          </g>
        </>
      );
    } else if (s.bottom.kind === 'shorts') {
      bottom = (
        <>
          <Merge>{legParts([5.4, 4.8, 4.1], s.skin, 'skin')}</Merge>
          {legs.map(({side, an}) => (
            <g key={side}>
              <Tube d={`M${f1(an[0])} ${f1(an[1] - 10)} L${f1(an[0])} ${f1(an[1] - 1)}`} r={5} fill="#ffffff" cap="butt" />
              <path d={`M${f1(an[0] - 5)} ${f1(an[1] - 7.4)} H${f1(an[0] + 5)}`} stroke="#ff6f7d" strokeWidth={1.3} />
            </g>
          ))}
          {shoes}
          <Merge>
            {pelvis}
            {legParts([8.6, 8.2, 8.2], c, 'cloth', true, 0.82)}
          </Merge>
          <g transform={`translate(${f1(hip[0])} ${f1(hip[1])})`}>
            <Line d="M0 -4 V8" color={lc} k={0.5} opacity={0.8} />
            <Line d="M-15.6 2 Q-12 5.4 -9 2 M15.6 2 Q12 5.4 9 2" color={lc} k={0.5} opacity={0.8} />
          </g>
        </>
      );
    } else {
      const baby = s.top.kind === 'onesie';
      bottom = (
        <>
          {shoes}
          <Merge>
            {pelvis}
            {legParts(baby ? [7.6, 7.1, 6.8] : [8.3, 7.3, 6.6], c, 'cloth', true)}
          </Merge>
          {legs.map(({side, kn, an}) => (
            <g key={side}>
              <Line d={`M${f1(an[0] - 7.4)} ${f1(an[1] - 2.4)} H${f1(an[0] + 7.4)}`} color={lc} k={0.7} opacity={0.8} />
              {!baby && <Groove pts={[[kn[0] - 5, kn[1] - 1], [kn[0], kn[1] + 1.4], [kn[0] + 5, kn[1] - 1]]} w={1.2} color={c} k={0.2} />}
            </g>
          ))}
          {!baby && (
            <g transform={`translate(${f1(hip[0])} ${f1(hip[1])})`}>
              <Line d="M0 -5 V9" color={lc} k={0.5} opacity={0.8} />
              <Line d="M-16 -1 Q-12 4.4 -8.6 -1.6 M16 -1 Q12 4.4 8.6 -1.6" color={lc} k={0.5} opacity={0.8} />
            </g>
          )}
        </>
      );
    }

    // ---- arms: shoulder -> elbow -> wrist. Two tapering segments with a real bend, a sleeve that
    // ends in a cuff, a soft shadow on the body under the arm, and a hand that follows the forearm.
    const arm = (i: 0 | 1, front: boolean) => {
      if (!arms) return null;
      const {sp, side, S, E, W} = arms[i];
      if (!!sp.front !== front) return null;
      const fa = Math.atan2(W[1] - E[1], W[0] - E[0]);
      const ang = (fa * 180) / Math.PI;
      // the thumb sits on the side that faces up, or toward the body when the hand hangs
      const flip = Math.sin(fa) * (-side * 0.55) + Math.cos(fa) < 0;
      const sc = s.top.color;
      const kind = s.top.kind;
      const cover = kind === 'tee' ? 0.64 : kind === 'blouse' ? 1.5 : 1.86; // how far the sleeve reaches: 1 = the elbow, 2 = the wrist
      const ribbed = kind === 'hoodie' || kind === 'cardigan';
      const [rS, rE, rW] = [6.5, 5.8, 5.2]; // sleeve radii: shoulder, elbow, wrist
      const [kS, kE, kW] = [4.8, 4.3, 3.7]; // bare arm
      const end1 = cover < 1 ? along(S, E, cover) : E; // where the sleeve stops on the upper arm
      const r1 = rS + (rE - rS) * Math.min(1, cover);
      const C = cover > 1 ? along(E, W, cover - 1) : null; // the cuff
      const rC = rE + (rW - rE) * (cover - 1);
      const u1: V = [(S[0] - E[0]), (S[1] - E[1])];
      const u2: V = [(W[0] - E[0]), (W[1] - E[1])];
      const n1 = Math.hypot(u1[0], u1[1]) || 1;
      const n2 = Math.hypot(u2[0], u2[1]) || 1;
      const bis: V = [u1[0] / n1 + u2[0] / n2, u1[1] / n1 + u2[1] / n2]; // points into the bend
      const bl = Math.hypot(bis[0], bis[1]);
      const bent = bl > 0.62; // sharper than about 145 degrees
      const hem = (at: V, from: V, r: number, back: number) => { // a line across the sleeve, `back` units before its end
        const d = Math.hypot(at[0] - from[0], at[1] - from[1]) || 1;
        const ux = (at[0] - from[0]) / d;
        const uy = (at[1] - from[1]) / d;
        const cx = at[0] - ux * back;
        const cy = at[1] - uy * back;
        return `M${f1(cx - uy * r)} ${f1(cy + ux * r)} L${f1(cx + uy * r)} ${f1(cy - ux * r)}`;
      };
      const shadowD = `${capsule(S, E, rS, rE, tk)} ${capsule(E, C ?? W, rE, C ? rC : kW, tk)}`;
      return (
        <g key={`a${i}`}>
          <g transform={`scale(1 ${tk})`}><Cast d={shadowD} on={silhouetteOf(kind)} color={sc} dx={1.3} dy={2.4} k={0.3} /></g>
          <Merge>
            {cover < 1 && <Part d={capsule(S, E, kS, kE)} fill={s.skin} mat="skin" depth={1.6} />}
            <Part d={capsule(E, W, kE, kW)} fill={s.skin} mat="skin" depth={1.6} />
          </Merge>
          <Merge>
            <Part d={capsule(S, end1, rS, r1)} fill={sc} mat="cloth" depth={2.4} />
            {C && <Part d={capsule(E, C, rE, rC)} fill={sc} mat="cloth" depth={2.4} />}
          </Merge>
          {C && ribbed && <path d={capsule(along(E, W, cover - 1.13), C, rC, rC)} fill={shade(sc, 0.16)} opacity={0.8} />}
          {C && <Line d={hem(C, E, rC * 0.86, ribbed ? 3.2 : 1.5)} color={lineOf(sc)} k={0.5} opacity={0.85} />}
          {cover < 1 && <Line d={hem(end1, S, r1 * 0.86, 1.3)} color={lineOf(sc)} k={0.5} opacity={0.85} />}
          {cover >= 1 && bent && <Groove pts={[[E[0] + (bis[0] / bl) * rE * 0.95, E[1] + (bis[1] / bl) * rE * 0.95], [E[0] + (bis[0] / bl) * rE * 0.2, E[1] + (bis[1] / bl) * rE * 0.2], [E[0] - (bis[0] / bl) * rE * 0.3, E[1] - (bis[1] / bl) * rE * 0.3]]} w={1.15} color={sc} k={0.22} />}
          <g transform={`translate(${f1(W[0])} ${f1(W[1])}) rotate(${ang.toFixed(1)}) translate(-2.2 0)`}>
            <Hand pose={sp.hand ?? 'relaxed'} fill={s.skin} s={0.9} flip={flip} />
          </g>
        </g>
      );
    };

    return (
      <g transform={`translate(0 96) scale(${(p.flip ? -1 : 1) * (1 + sq * 0.08)} ${1 - sq * 0.08}) translate(0 -96)`}>
        <Contact y={96} w={30 * h} />
        <Scaled s={h} transform={`translate(0 96) scale(${h}) translate(0 -96)`}>
          <Scaled s={hs} transform={headT}><HairBack s={s} /></Scaled>
          {bottom}
          <g transform={torsoT}>
            <g transform={`scale(1 ${tk})`}>
              {s.top.kind === 'hoodie' && <Part d="M-16 -53 C-19 -70 19 -70 16 -53 C9 -47 -9 -47 -16 -53 Z" fill={shade(s.top.color, 0.14)} mat="cloth" depth={3} />}
              <Part d={roundRect(-5, -67, 10, 13, 3)} fill={s.skin} mat="skin" depth={2}>
                <path d="M-6 -68 H6 V-62.4 Q0 -60 -6 -62.4 Z" fill={shade(s.skin, 0.3)} opacity={0.5} />
              </Part>
              <Top s={s} />
              {s.stethoscope && (
                <>
                  <Tube d="M-9.4 -57 C-14 -36 -11 -20 -2 -18 C7 -20 13 -36 9.4 -57" r={1.35} fill="#3a4460" line={null} flat />
                  <path d="M-9.4 -57 C-14 -36 -11 -20 -2 -18" fill="none" stroke="#7d88ab" strokeWidth={0.5} opacity={0.8} transform="translate(-0.4 -0.4)" />
                  <Part d={circlePath(-2, -16, 4)} fill="#c9d3e6" mat="hard" depth={1.4} />
                  <circle cx={-2} cy={-16} r={1.9} fill="#8f9bb8" />
                </>
              )}
            </g>
            {arm(0, false)}
            {arm(1, false)}
          </g>
          <Scaled s={hs} transform={headT}>
            {[-1, 1].map((side) => (
              <g key={side}>
                <Part d={circlePath(side * 22.6, 3, 5)} fill={s.skin} mat="skin" depth={1.5} />
                <path d={`M${side * 24.4} 0.6 Q${side * 21} 3 ${side * 23.6} 5.6`} fill="none" stroke={shade(s.skin, 0.36)} strokeWidth={0.8} strokeLinecap="round" />
                {s.earrings && <circle cx={side * 23.4} cy={9.4} r={2} fill={s.earrings} stroke={lineOf(s.earrings)} strokeWidth={0.5} />}
              </g>
            ))}
            <Part d={HEAD} fill={s.skin} mat="skin" depth={4.4} />
            <g transform="translate(0 2)"><Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} size={0.5} skin={s.skin} human iris={s.eye} lashes={s.lashes} turn={act.turn ?? 0} /></g>
            {s.moustache && <g transform={`translate(${(act.turn ?? 0) * 2.4} 0)`}><Part d="M-10.5 13.6 C-5.6 8.4 -1.6 10.8 0 11.8 C1.6 10.8 5.6 8.4 10.5 13.6 C5.6 16.6 1.6 14.2 0 15.2 C-1.6 14.2 -5.6 16.6 -10.5 13.6 Z" fill={s.moustache} mat="hair" depth={1.5} /></g>}
            <HairFront s={s} />
            {s.glasses && <g transform={`translate(${(act.turn ?? 0) * 2.75} 0)`}><Glasses kind={s.glasses} /></g>}
          </Scaled>
          <g transform={torsoT}>
            {arm(0, true)}
            {arm(1, true)}
          </g>
        </Scaled>
      </g>
    );
  }) as Person;
  C.displayName = s.name;
  C.spec = s;
  return C;
};

// ------------------------------------------------------------------ the cast of people
// Dr. Mira's look is the owner's pick of 2026-11-17 ("dr skin make white and like global"; sheet
// toons-boards/doctor-options.jpg, look A): light skin, her dark curls kept. The three videos already
// live show her first look (skin #c58a63, hair #33221e).
export const SPECS: Record<string, HumanSpec> = {
  doctor: {name: 'doctor', role: 'Dr. Mira: explains what happened in plain words. Warm, exact, never scary.', skin: '#f8d3b8', eye: '#6b4a2e', lashes: true, hair: {style: 'curly', color: '#4a2f22'}, top: {kind: 'coat', color: '#ffffff', under: '#22b8a8'}, bottom: {kind: 'trousers', color: '#1fa596'}, shoes: '#f1f3f9', glasses: 'round', stethoscope: true},
  patient: {name: 'patient', role: 'The patient: an ordinary young man with an everyday habit that went wrong.', skin: '#eec39a', eye: '#5b7a3e', hair: {style: 'short', color: '#3b2c25'}, top: {kind: 'hoodie', color: '#ffc857'}, bottom: {kind: 'trousers', color: '#4a6fa5'}, shoes: '#f1f3f9'},
  mom: {name: 'mom', role: 'The worried parent: asks the question the viewer is thinking.', skin: '#e2a67f', eye: '#6b4423', lashes: true, hair: {style: 'long', color: '#5a3024'}, top: {kind: 'blouse', color: '#ff8a7a'}, bottom: {kind: 'skirt', color: '#5b6bbf'}, shoes: '#8a4b3a', earrings: '#ffd36e'},
  kid: {name: 'kid', role: 'The kid: curious, eats and does things he should not.', skin: '#eec39a', eye: '#3d6fa8', height: 0.76, head: 1.3, legs: 0.8, hair: {style: 'cap', color: '#22b8a8', under: '#3b2c25'}, top: {kind: 'tee', color: '#43c08a'}, bottom: {kind: 'shorts', color: '#3d5a80'}, shoes: '#ff6f7d'},
  grandpa: {name: 'grandpa', role: 'Grandpa: old habits, old remedies, a good heart.', skin: '#e8b28c', eye: '#5d7fa0', height: 0.95, hair: {style: 'balding', color: '#eceef4'}, top: {kind: 'cardigan', color: '#8d7bd1', under: '#f4f1e8'}, bottom: {kind: 'trousers', color: '#7b6a5a'}, shoes: '#5a4a3f', moustache: '#eceef4', glasses: 'square'},
  baby: {name: 'baby', role: 'The toddler: cannot explain what hurts, so the body does it for him.', skin: '#ffd9c2', eye: '#4a80b8', height: 0.64, head: 1.45, legs: 0.45, torso: 0.8, hair: {style: 'baby', color: '#b9825a'}, top: {kind: 'onesie', color: '#bfe3ff'}, bottom: {kind: 'trousers', color: '#bfe3ff'}, shoes: '#ffffff'},
};
export type PersonName = 'doctor' | 'patient' | 'mom' | 'kid' | 'grandpa' | 'baby';
export const PEOPLE = Object.fromEntries(Object.entries(SPECS).map(([k, sp]) => [k, makeHuman(sp)])) as Record<PersonName, Person>;
void Mark;
