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
import type {CharProps} from './blueprint';

export type HairStyle = 'curly' | 'short' | 'long' | 'cap' | 'balding' | 'baby';
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
/** A smooth curve from a to b that passes through k (the joint). `t` < 1 stops early (sleeves, shorts). */
const through = (a: V, k: V, b: V, t = 1) => {
  const c: V = [2 * k[0] - (a[0] + b[0]) / 2, 2 * k[1] - (a[1] + b[1]) / 2];
  if (t >= 1) return `M${f1(a[0])} ${f1(a[1])} Q${f1(c[0])} ${f1(c[1])} ${f1(b[0])} ${f1(b[1])}`;
  const q0: V = [a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t];
  const q1: V = [c[0] + (b[0] - c[0]) * t, c[1] + (b[1] - c[1]) * t];
  return `M${f1(a[0])} ${f1(a[1])} Q${f1(q0[0])} ${f1(q0[1])} ${f1(q0[0] + (q1[0] - q0[0]) * t)} ${f1(q0[1] + (q1[1] - q0[1]) * t)}`;
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
  if (style === 'cap') {
    const u = s.hair.under ?? '#3b2c25';
    return <Merge>{[[-22.5, 7, 5.6], [-24, -1, 5], [22.5, 7, 5.6], [24, -1, 5], [-19, 13, 4.4], [19, 13, 4.4]].map(([x, y, r], i) => <Part key={i} d={circlePath(x, y, r)} fill={u} mat="hair" depth={2} />)}</Merge>;
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
    case 'cap': {
      const dome = 'M-24.4 -14.6 C-27.5 -42 27.5 -42 24.4 -14.6 Z';
      const brim = 'M1 -19.6 C20 -24.6 38 -21 41 -14 C30 -12.6 15 -13.4 1 -12.8 Z';
      return (
        <>
          <Cast d={brim} on={HEAD} color={s.skin} dx={-1} dy={3} k={0.2} />
          <Part d={dome} fill={color} mat="cloth" shine={[-9, -31, 0.6]} depth={3.4}>
            <Line d="M0 -39 V-14 M-12.5 -36 Q-15.5 -25 -14.5 -14 M12.5 -36 Q15.5 -25 14.5 -14" color={shade(color, 0.3)} k={0.5} opacity={0.8} />
          </Part>
          <Part d={brim} fill={shade(color, 0.2)} mat="cloth" depth={1.6}>
            <Line d="M4 -16.4 C18 -20.4 32 -18 38 -15" color={lift(color, 0.3)} k={0.45} dash="2 2" opacity={0.8} />
          </Part>
          <Part d={circlePath(0, -38, 2.3)} fill={shade(color, 0.2)} flat />
          <Part d={circlePath(-11.5, -24.5, 5.4)} fill="#ffffff" depth={1} />
          <path d="M-10.4 -28.4 L-14.6 -23.8 H-11.8 L-12.8 -20.4 L-8.4 -25.2 H-11.2 Z" fill="#ffb300" />
        </>
      );
    }
    case 'balding':
      return (
        <>
          <Mark pts={[[-10, -23.6], [0, -27], [10, -23.6]]} w={1.2} color={shade(color, 0.3)} />
          <Mark pts={[[-6, -21], [1, -24], [8, -21.4]]} w={1} color={shade(color, 0.3)} opacity={0.8} />
          <ellipse cx={-7} cy={-17} rx={7} ry={2.6} transform="rotate(-18 -7 -17)" fill="#ffffff" opacity={0.3} />
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
          <path d={`${lens(k)} Z`} fill="#ffffff" fillOpacity={0.12} />
          <path d={lens(k)} fill="none" stroke={frame} strokeWidth={w} strokeLinecap="round" />
          <path d={`M${k * 8.4 - 5.6} -1.6 l3.4 -3.2`} stroke="#ffffff" strokeWidth={1.2} strokeLinecap="round" opacity={0.7} />
        </g>
      ))}
      <path d="M-17.6 0.6 L-22.6 -1.4 M17.6 0.6 L22.6 -1.4" fill="none" stroke={frame} strokeWidth={w} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ clothes (torso-local: hips at 0,0; shoulders at y = -51; neck at y = -58)
const TORSO = 'M-19.5 -50 C-19.5 -56 -12 -58.5 0 -58.5 C12 -58.5 19.5 -56 19.5 -50 L17 -18 C16.6 -10 17.6 -4 18 3 C18 7.5 -18 7.5 -18 3 C-17.6 -4 -16.6 -10 -17 -18 Z';
const WIDE = 'M-21.5 -50 C-21.5 -56.4 -13 -59 0 -59 C13 -59 21.5 -56.4 21.5 -50 L19.6 -6 C19.6 2 20 5 20 6.5 C20 10.5 -20 10.5 -20 6.5 C-20 5 -19.6 2 -19.6 -6 Z';
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
    const bob = Math.max(0, (act.bob ?? 0) + Math.abs(act.shift ?? 0) * 0.9);
    const hip: V = [(act.shift ?? 0) * 3.4, k.hipY + bob];
    const lean = (act.lean ?? 0) + (act.shift ?? 0) * -2.2;
    const torsoT = `translate(${f1(hip[0])} ${f1(hip[1])}) rotate(${lean.toFixed(2)})`;
    const headT = `${torsoT} translate(0 ${f1(-(k.torsoLen + 9))}) rotate(${((act.tilt ?? 0) + (act.shift ?? 0) * 1.6).toFixed(2)}) translate(0 ${f1(-25 * hs + (act.nod ?? 0) * 2.2)}) scale(${hs})`;
    const arms = p.arms === null ? null : p.arms ?? [95, 85];
    const shrug = (act.shrug ?? 0) * 3.4;

    // ---- legs: hips to planted feet, the knee found by the joint solver
    const legs = ([-1, 1] as const).map((side) => {
      const sw = step * side;
      const hp: V = [hip[0] + side * 8.4, hip[1]];
      const an: V = [side * 9.6 + sw * 7, 88 - Math.max(0, sw) * 5];
      const kn = joint(hp, an, thigh, thigh, [side, 0.15]);
      return {side, hp, an, kn};
    });
    const c = s.bottom.color;
    const lc = lineOf(c);
    const shoes = legs.map(({side, an}) => <g key={side} transform={`translate(${f1(an[0])} ${f1(an[1] + 4.3)}) scale(${side * 1.15} 1.15)`}><Shoe color={s.shoes} /></g>);
    const pelvis = <g transform={`translate(${f1(hip[0])} ${f1(hip[1])})`}><Part d={roundRect(-17.6, -7, 35.2, 17, 6.5)} fill={c} mat="cloth" depth={3} /></g>;
    let bottom: React.ReactNode;
    if (s.bottom.kind === 'skirt') {
      bottom = (
        <>
          {legs.map(({side, hp, kn, an}) => <Tube key={side} d={through(hp, kn, an)} r={4.5} fill={s.skin} soft />)}
          {shoes}
          <g transform={`translate(${f1(hip[0])} ${f1(hip[1])}) rotate(${(lean * 0.4).toFixed(2)})`}>
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
          {legs.map(({side, hp, kn, an}) => <Tube key={side} d={through(hp, kn, an)} r={4.5} fill={s.skin} soft />)}
          {legs.map(({side, an}) => (
            <g key={side}>
              <Tube d={`M${f1(an[0])} ${f1(an[1] - 10)} L${f1(an[0])} ${f1(an[1] - 1)}`} r={5} fill="#ffffff" cap="butt" />
              <path d={`M${f1(an[0] - 5)} ${f1(an[1] - 7.4)} H${f1(an[0] + 5)}`} stroke="#ff6f7d" strokeWidth={1.3} />
            </g>
          ))}
          {shoes}
          <Merge>
            {pelvis}
            {legs.map(({side, hp, kn, an}) => <Tube key={side} d={through(hp, kn, an, 0.46)} r={8.4} fill={c} cap="butt" soft />)}
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
            {legs.map(({side, hp, kn, an}) => <Tube key={side} d={through(hp, kn, an)} r={baby ? 7 : 7.4} fill={c} cap="butt" soft />)}
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

    // ---- arms: shoulder, elbow (joint solver), wrist; a sleeve over the skin
    const arm = (i: 0 | 1, front: boolean) => {
      if (!arms) return null;
      const sp = armOf(arms[i] as ArmSpec);
      if (!!sp.front !== front) return null;
      const side = i === 0 ? -1 : 1;
      const S: V = [side * 18.6, -50.4 * tk - shrug];
      const L = (Math.min(sp.len ?? 49.4, 49.4) * seg) / 25;
      const a = (sp.a * Math.PI) / 180;
      const H: V = [S[0] + Math.cos(a) * L, S[1] + Math.sin(a) * L];
      let n: V = [-Math.sin(a), Math.cos(a)];
      if (Math.abs(n[1]) < 0.3) n = [side, 0.2]; else if (n[1] < 0) n = [-n[0], -n[1]];
      const E = joint(S, H, seg, seg, n);
      const ang = (Math.atan2(H[1] - E[1], H[0] - E[0]) * 180) / Math.PI;
      const flip = Math.cos((ang * Math.PI) / 180) < 0;
      const sc = s.top.color;
      const cuff = long ? through(S, E, H, sleeveTo) : null;
      return (
        <g key={`a${i}`}>
          <Tube d={through(S, E, H)} r={3.7} fill={s.skin} soft />
          <Tube d={through(S, E, H, sleeveTo)} r={5.5} fill={sc} soft />
          {cuff && sleeveTo > 0.7 && <Groove pts={[[E[0] - 3.4, E[1] - 2.6], [E[0], E[1] + 0.6], [E[0] + 3.4, E[1] - 2.6]]} w={1.1} color={sc} k={0.2} />}
          <g transform={`translate(${f1(H[0])} ${f1(H[1])}) rotate(${ang.toFixed(1)}) translate(-2.6 0)`}>
            <Hand pose={sp.hand ?? 'relaxed'} fill={s.skin} s={0.84} flip={flip} />
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
export const SPECS: Record<string, HumanSpec> = {
  doctor: {name: 'doctor', role: 'Dr. Mira: explains what happened in plain words. Warm, exact, never scary.', skin: '#c58a63', eye: '#5a3a22', lashes: true, hair: {style: 'curly', color: '#33221e'}, top: {kind: 'coat', color: '#ffffff', under: '#22b8a8'}, bottom: {kind: 'trousers', color: '#1fa596'}, shoes: '#f1f3f9', glasses: 'round', stethoscope: true},
  patient: {name: 'patient', role: 'The patient: an ordinary young man with an everyday habit that went wrong.', skin: '#eec39a', eye: '#5b7a3e', hair: {style: 'short', color: '#3b2c25'}, top: {kind: 'hoodie', color: '#ffc857'}, bottom: {kind: 'trousers', color: '#4a6fa5'}, shoes: '#f1f3f9'},
  mom: {name: 'mom', role: 'The worried parent: asks the question the viewer is thinking.', skin: '#e2a67f', eye: '#6b4423', lashes: true, hair: {style: 'long', color: '#5a3024'}, top: {kind: 'blouse', color: '#ff8a7a'}, bottom: {kind: 'skirt', color: '#5b6bbf'}, shoes: '#8a4b3a', earrings: '#ffd36e'},
  kid: {name: 'kid', role: 'The kid: curious, eats and does things he should not.', skin: '#eec39a', eye: '#3d6fa8', height: 0.76, head: 1.3, legs: 0.8, hair: {style: 'cap', color: '#22b8a8', under: '#3b2c25'}, top: {kind: 'tee', color: '#43c08a'}, bottom: {kind: 'shorts', color: '#3d5a80'}, shoes: '#ff6f7d'},
  grandpa: {name: 'grandpa', role: 'Grandpa: old habits, old remedies, a good heart.', skin: '#e8b28c', eye: '#5d7fa0', height: 0.95, hair: {style: 'balding', color: '#eceef4'}, top: {kind: 'cardigan', color: '#8d7bd1', under: '#f4f1e8'}, bottom: {kind: 'trousers', color: '#7b6a5a'}, shoes: '#5a4a3f', moustache: '#eceef4', glasses: 'square'},
  baby: {name: 'baby', role: 'The toddler: cannot explain what hurts, so the body does it for him.', skin: '#ffd9c2', eye: '#4a80b8', height: 0.64, head: 1.45, legs: 0.45, torso: 0.8, hair: {style: 'baby', color: '#b9825a'}, top: {kind: 'onesie', color: '#bfe3ff'}, bottom: {kind: 'trousers', color: '#bfe3ff'}, shoes: '#ffffff'},
};
export type PersonName = 'doctor' | 'patient' | 'mom' | 'kid' | 'grandpa' | 'baby';
export const PEOPLE = Object.fromEntries(Object.entries(SPECS).map(([k, sp]) => [k, makeHuman(sp)])) as Record<PersonName, Person>;
void Mark;
