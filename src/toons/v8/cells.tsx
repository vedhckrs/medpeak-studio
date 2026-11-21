/**
 * MedPeak Toons, look v8: the CELLS AND BODY CHEMICALS (small job characters).
 * Drawn only with the shared kit (./kit). Each one: a simple body whose SHAPE says what it is, the kit
 * face (two touching white eyes, small pupil, tiny mouth), thin little limbs, ONE job piece (costume or
 * prop), and for the chemicals a small white name tag. Muted colours, one family per character.
 *
 * Small helpers that the kit does not have (closed smooth blob through points, a tapering tube, a
 * scalloped puff, a two-stroke outlined line) live in this file.
 */
import React from 'react';
import {Board, Caption, CLOTH, EDGE, EDGE_IN, Eyes, Fig, FLESH, INK, INLINE, Mouth, NameTag, OUTLINE, Panel, Shape, shade, tint, TinyArm, TinyLeg, type V8Props} from './kit';

// ------------------------------------------------------------------ local helpers
type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** A closed, smooth outline through hand-placed points (Catmull-Rom turned into cubic curves). */
const loop = (pts: P[], t = 1): string => {
  const n = pts.length;
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: P = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};

/** Points round an ellipse, each radius nudged by its factor in k (so no shape is a perfect ellipse). */
const ring = (cx: number, cy: number, rx: number, ry: number, k: number[], a0 = 0): P[] =>
  k.map((m, i) => {
    const a = a0 + (i * 2 * Math.PI) / k.length;
    return [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m];
  });

const bez = (p: P[], t: number): P => {
  const u = 1 - t;
  return [
    u * u * u * p[0][0] + 3 * u * u * t * p[1][0] + 3 * u * t * t * p[2][0] + t * t * t * p[3][0],
    u * u * u * p[0][1] + 3 * u * u * t * p[1][1] + 3 * u * t * t * p[2][1] + t * t * t * p[3][1],
  ];
};

/** A closed tube along a cubic curve that tapers from width w0 to w1 (a sperm tail). */
const taper = (p: P[], w0: number, w1: number, n = 40): string => {
  const L: P[] = [];
  const R: P[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = bez(p, t);
    const b = bez(p, Math.min(1, t + 0.01));
    const c = bez(p, Math.max(0, t - 0.01));
    const dx = b[0] - c[0], dy = b[1] - c[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const w = (w0 + (w1 - w0) * t) / 2;
    L.push([a[0] + nx * w, a[1] + ny * w]);
    R.push([a[0] - nx * w, a[1] - ny * w]);
  }
  let d = `M ${f(L[0][0])} ${f(L[0][1])}`;
  for (let i = 1; i <= n; i++) d += ` L ${f(L[i][0])} ${f(L[i][1])}`;
  d += ` L ${f(R[n][0])} ${f(R[n][1])}`;
  for (let i = n - 1; i >= 0; i--) d += ` L ${f(R[i][0])} ${f(R[i][1])}`;
  return d + ' Z';
};

/** A puffy outline: n soft scallops round an ellipse, meeting in small inward points. */
const puff = (cx: number, cy: number, rx: number, ry: number, k: number[], bulge = 1.28, a0 = -Math.PI / 2): string => {
  const n = k.length;
  const pt = (a: number, m: number): P => [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m];
  const angle = (i: number) => a0 + (i * 2 * Math.PI) / n;
  const p0 = pt(angle(0), k[0]);
  let d = `M ${f(p0[0])} ${f(p0[1])}`;
  for (let i = 0; i < n; i++) {
    const am = (angle(i) + angle(i + 1)) / 2;
    const m = ((k[i] + k[(i + 1) % n]) / 2) * bulge;
    const c = pt(am, m);
    const e = pt(angle(i + 1), k[(i + 1) % n]);
    d += ` Q ${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`;
  }
  return d + ' Z';
};

/** A thin coloured line with the ink outline round it (hairs, steam, a broom handle). */
const Tube: React.FC<{d: string; fill: string; w?: number}> = ({d, fill, w = 4.5}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// the face sizes, the same on all fifteen
const ER = 11; // eye radius
const MW = 12; // mouth width

// ------------------------------------------------------------------ colours (one muted family each)
const C = {
  red: '#d65a56',
  white: '#e6e3ef',
  platelet: '#f7edc8',
  egg: FLESH.cream,
  halo: '#f8d8d6',
  sperm: CLOTH.offwhite,
  fat: '#efc96c',
  antibody: '#2fb5a6', // teal (CLOTH.teal): it was a purple almost like the virus; changed with the owner's approval of the storyboard, 2026-11-20
  sugar: '#fbf8f2',
  insulin: CLOTH.sky,
  melatonin: '#5d6f9e',
  cortisol: '#ee9b55',
  acid: '#bccf6a',
  histamine: '#e98a95',
  cilia: FLESH.coral,
  cholesterol: '#d8cfb6',
  kraft: '#d8b58a', // parcels, sacks, broom straw
  brass: '#e8bd5c',
};

// ================================================================== 1 red cell: the delivery driver
export const RedCell: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.35, 0.1]}) => {
  const body = loop(ring(-6, 2, 76, 60, [1, 0.98, 1.02, 1, 0.99, 1.01, 1, 0.98, 1.03, 1, 1.01, 0.99]));
  const dimple = loop(ring(-6, 2, 50, 38, [1, 1.03, 0.98, 1, 1.02, 0.97, 1, 1.01]));
  return (
    <g>
      <TinyLeg from={[-28, 52]} to={[-32, 80]} fill={C.red} foot={-1} />
      <TinyLeg from={[14, 54]} to={[18, 80]} fill={C.red} />
      <TinyArm from={[-78, 10]} to={[-88, 40]} bend={[-94, 22]} fill={C.red} />
      <Shape d={body} fill={C.red}>
        <path d={dimple} fill={shade(C.red)} />
        <path d={'M -54 -4 Q -50 -34 -6 -36 Q 38 -34 42 -6'} {...INLINE} />
      </Shape>
      <Eyes x={-6} y={-8} r={ER} mood={mood} look={look} />
      <Mouth x={-4} y={18} w={MW} kind={mouth} />
      {/* the job piece: an oxygen parcel under the arm */}
      <g transform="translate(66 34) rotate(-6)">
        <rect x={-19} y={-16} width={38} height={32} rx={3} fill={C.kraft} />
        <rect x={6} y={-16} width={13} height={32} fill={shade(C.kraft)} />
        <path d="M -19 -3 H 19" {...INLINE} />
        <rect x={-19} y={-16} width={38} height={32} rx={3} {...OUTLINE} />
        <rect x={-12} y={-11} width={20} height={14} rx={2} fill="#ffffff" {...EDGE_IN} />
        <text x={-2} y={0.5} textAnchor="middle" fontWeight={900} fontSize={10} fill={INK} fontFamily="inherit">O₂</text>
      </g>
      <TinyArm from={[64, -14]} to={[56, 22]} bend={[84, 0]} fill={C.red} />
    </g>
  );
};

// ================================================================== 2 white cell: the security guard
export const WhiteCell: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [0.3, 0.1]}) => {
  const k = [1, 0.9, 1.04, 0.92, 1.02, 0.9, 1.05, 0.93, 1, 0.9, 1.04, 0.91, 1.02, 0.9];
  const body = loop(ring(0, 10, 72, 66, k, -Math.PI / 2 + 0.2));
  return (
    <g>
      <TinyLeg from={[-22, 66]} to={[-24, 86]} fill={C.white} foot={-1} />
      <TinyLeg from={[22, 66]} to={[24, 86]} fill={C.white} />
      <TinyArm from={[-60, 16]} to={[-82, 54]} bend={[-88, 26]} fill={C.white} />
      <Shape d={body} fill={C.white} shadeBy={0.12} />
      <TinyArm from={[66, 0]} to={[84, -32]} bend={[90, -4]} fill={C.white} hand="open" />
      {/* the job piece: a guard's peaked cap with a badge */}
      <path d="M -44 -50 C -50 -76 -22 -90 4 -88 C 32 -86 50 -74 46 -50 Z" fill={CLOTH.navy} {...EDGE} />
      <path d="M -50 -52 Q 0 -40 52 -52 Q 50 -38 0 -36 Q -48 -38 -50 -52 Z" fill={shade(CLOTH.navy, 0.2)} {...EDGE} />
      <path d="M 0 -78 l 7 4 l -1 8 l -6 4 l -6 -4 l -1 -8 Z" fill={CLOTH.yellow} {...EDGE_IN} />
      <Eyes x={0} y={-18} r={ER} mood={mood} look={look} />
      <Mouth x={2} y={12} w={MW} kind={mouth} />
    </g>
  );
};

// ================================================================== 3 platelet: the first-aid crew
export const Platelet: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.4, -0.3]}) => {
  const body = loop([[-62, -2], [-50, -36], [-16, -50], [18, -42], [50, -38], [64, -6], [56, 30], [22, 48], [-18, 46], [-52, 34]]);
  return (
    <g transform="translate(-8 4) scale(1.1)">
      <TinyLeg from={[-20, 40]} to={[-22, 70]} fill={C.platelet} foot={-1} />
      <TinyLeg from={[18, 40]} to={[20, 70]} fill={C.platelet} />
      <TinyArm from={[-58, 8]} to={[-82, 26]} bend={[-76, 4]} fill={C.platelet} />
      <Shape d={body} fill={C.platelet} shadeBy={0.12}>
        <circle cx={-38} cy={26} r={3.6} fill={shade(C.platelet, 0.12)} {...EDGE_IN} />
        <circle cx={34} cy={28} r={3} fill={shade(C.platelet, 0.12)} {...EDGE_IN} />
      </Shape>
      <Eyes x={-2} y={-14} r={ER} mood={mood} look={look} />
      <Mouth x={0} y={14} w={MW} kind={mouth} />
      {/* the job piece: a sticking plaster held up */}
      <TinyArm from={[54, -22]} to={[60, -48]} bend={[70, -30]} fill={C.platelet} />
      <g transform="translate(64 -58) rotate(-28)">
        <rect x={-30} y={-10} width={60} height={20} rx={10} fill="#e9c79c" {...EDGE} />
        <rect x={-10} y={-7} width={20} height={14} rx={2} fill="#f8ecd6" {...EDGE_IN} />
        {[-22, -16, 16, 22].map((x) => <g key={x}><circle cx={x} cy={-3} r={1.1} fill={INK} /><circle cx={x} cy={3} r={1.1} fill={INK} /></g>)}
      </g>
    </g>
  );
};

// ================================================================== 4 egg cell: calm
export const EggCell: React.FC<V8Props> = ({mood = 'closed', mouth = 'smile', look = [0, 0]}) => {
  const halo = puff(0, 2, 79, 77, [1, 0.98, 1.01, 0.99, 1, 1.02, 0.98, 1, 1.01, 0.99, 1, 0.98, 1.02, 1, 0.99, 1.01], 1.06);
  const body = loop(ring(0, 4, 66, 64, [1, 1.02, 0.98, 1.01, 0.99, 1.02, 1, 0.98, 1.01, 0.99]));
  return (
    <g transform="translate(0 2) scale(0.9)">
      <Shape d={halo} fill={C.halo} shadow={0} />
      <Shape d={body} fill={C.egg} shadeBy={0.1} />
      <TinyArm from={[-50, 30]} to={[-20, 46]} bend={[-50, 50]} fill={C.egg} />
      <TinyArm from={[50, 30]} to={[20, 46]} bend={[50, 50]} fill={C.egg} />
      <Eyes x={0} y={-16} r={ER} mood={mood} look={look} />
      <Mouth x={0} y={12} w={MW} kind={mouth} />
    </g>
  );
};

// ================================================================== 5 sperm: the determined swimmer
export const Sperm: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [-0.75, 0]}) => {
  const head = loop([[-84, -4], [-72, -34], [-40, -42], [-8, -32], [10, -6], [4, 22], [-24, 36], [-60, 34], [-80, 20]]);
  const tail = taper([[6, 4], [36, -36], [52, 46], [76, 6]], 13, 1.5);
  const ex = -38, ey = -8;
  return (
    <g transform="translate(6 -10) scale(1.18)">
      <Shape d={tail} fill={C.sperm} shadow={0} />
      <TinyArm from={[-16, 26]} to={[10, 40]} bend={[-8, 46]} fill={C.sperm} />
      <Shape d={head} fill={C.sperm} shadeBy={0.12}>
        <rect x={-100} y={ey - 6} width={130} height={11} fill={CLOTH.teal} />
        <path d={`M -100 ${ey - 6} H 30 M -100 ${ey + 5} H 30`} {...INLINE} />
      </Shape>
      {/* the job piece: swimming goggles */}
      <circle cx={ex - ER} cy={ey} r={ER + 4.5} fill={CLOTH.teal} {...EDGE} />
      <circle cx={ex + ER} cy={ey} r={ER + 4.5} fill={CLOTH.teal} {...EDGE} />
      <Eyes x={ex} y={ey} r={ER - 1} gap={2} mood={mood} look={look} />
      <Mouth x={-42} y={18} w={MW - 2} kind={mouth} />
      <TinyArm from={[-70, 24]} to={[-86, 8]} bend={[-86, 28]} fill={C.sperm} hand="open" />
    </g>
  );
};

// ================================================================== 6 fat cell: the saver who hoards
export const FatCell: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.2, 0.3]}) => {
  const body = loop(ring(0, 2, 80, 74, [1, 1.01, 0.99, 1.02, 1, 0.98, 1.01, 1, 0.99, 1.02, 1, 0.98]));
  return (
    <g>
      <TinyLeg from={[-28, 68]} to={[-30, 86]} fill={C.fat} foot={-1} />
      <TinyLeg from={[28, 68]} to={[30, 86]} fill={C.fat} />
      <Shape d={body} fill={C.fat} shadeBy={0.12}>
        {/* the tiny nucleus, squeezed flat against one edge */}
        <path d="M -70 -50 Q -86 -18 -76 16 Q -60 -16 -70 -50 Z" fill={shade(C.fat, 0.12)} {...EDGE_IN} />
      </Shape>
      <Eyes x={4} y={-34} r={ER} mood={mood} look={look} />
      <Mouth x={6} y={-8} w={MW} kind={mouth} />
      {/* the job piece: a sack of savings, hugged tight */}
      <g transform="translate(6 46)">
        <path d="M -12 -18 C -30 -12 -34 18 -22 26 C -10 33 10 33 22 26 C 34 18 30 -12 12 -18 Z" fill={C.kraft} />
        <path d="M 6 -17 C 26 -8 28 18 18 27 C 24 30 30 22 30 10 C 30 -4 22 -14 12 -18 Z" fill={shade(C.kraft)} />
        <path d="M -12 -18 C -30 -12 -34 18 -22 26 C -10 33 10 33 22 26 C 34 18 30 -12 12 -18 Z" {...OUTLINE} />
        <path d="M -12 -18 L -16 -28 Q 0 -24 16 -28 L 12 -18 Z" fill={C.kraft} {...EDGE_IN} />
        <path d="M -13 -18 Q 0 -15 13 -18" {...INLINE} />
        <path d="M 0 -4 C 4 2 8 6 8 11 A 8 8 0 0 1 -8 11 C -8 6 -4 2 0 -4 Z" fill={C.fat} {...EDGE_IN} />
      </g>
      <TinyArm from={[-72, 12]} to={[-18, 38]} bend={[-66, 46]} fill={C.fat} />
      <TinyArm from={[74, 10]} to={[30, 38]} bend={[74, 46]} fill={C.fat} />
    </g>
  );
};

// ================================================================== 7 antibody: the trained hunter
/** `color`: another body colour for a scene (the default is the sheet's own). */
export const Antibody: React.FC<V8Props & {color?: string}> = ({mood = 'open', mouth = 'smile', look = [0.2, -0.4], color = C.antibody}) => {
  const body = [
    'M -20 70',
    'C -22 52 -22 34 -22 22',
    'C -38 8 -56 -12 -70 -34',
    'C -78 -46 -82 -58 -74 -66',
    'C -66 -74 -54 -70 -48 -60',
    'C -36 -42 -16 -26 0 -24',
    'C 16 -26 36 -42 48 -60',
    'C 54 -70 66 -74 74 -66',
    'C 82 -58 78 -46 70 -34',
    'C 56 -12 38 8 22 22',
    'C 22 34 22 52 20 70',
    'C 14 78 -14 78 -20 70 Z',
  ].join(' ');
  return (
    <g transform="translate(0 6)">
      <TinyLeg from={[-11, 70]} to={[-13, 86]} fill={color} foot={-1} />
      <TinyLeg from={[11, 70]} to={[13, 86]} fill={color} />
      {/* the two tips of the Y are its grabbing hands */}
      <TinyArm from={[-60, -54]} to={[-78, -76]} fill={color} w={9} hand="open" />
      <TinyArm from={[60, -54]} to={[78, -76]} fill={color} w={9} hand="open" />
      <Shape d={body} fill={color}>
        <path d="M -38 -22 Q -52 -36 -62 -54 M 38 -22 Q 52 -36 62 -54" {...INLINE} />
      </Shape>
      <Eyes x={0} y={-2} r={ER - 0.5} mood={mood} look={look} />
      <Mouth x={0} y={24} w={MW - 1} kind={mouth} />
    </g>
  );
};

// ================================================================== 8 sugar (glucose): fast and fun
export const Sugar: React.FC<V8Props> = ({mood = 'open', mouth = 'big', look = [0.6, 0]}) => {
  const front = 'M -46 -26 Q -6 -28 36 -26 Q 38 14 36 56 Q -6 58 -46 56 Q -48 14 -46 -26 Z';
  const top = 'M -46 -26 L -20 -52 Q 20 -54 62 -52 L 36 -26 Q -6 -28 -46 -26 Z';
  const side = 'M 36 -26 L 62 -52 Q 64 -14 62 28 L 36 56 Q 38 14 36 -26 Z';
  const sil = 'M -46 -26 L -20 -52 Q 20 -54 62 -52 Q 64 -14 62 28 L 36 56 Q -6 58 -46 56 Q -48 14 -46 -26 Z';
  return (
    <g transform="translate(-2 2)">
      {/* speed lines */}
      <path d="M -92 -10 H -66 M -86 8 H -62 M -92 26 H -70" {...INLINE} />
      <TinyLeg from={[-26, 54]} to={[-42, 78]} fill={C.sugar} foot={-1} />
      <TinyLeg from={[14, 54]} to={[28, 76]} fill={C.sugar} />
      <TinyArm from={[-44, 10]} to={[-60, 34]} bend={[-64, 14]} fill={C.sugar} hand="fist" />
      <path d={front} fill={C.sugar} />
      <path d={top} fill="#ffffff" />
      <path d={side} fill={shade(C.sugar, 0.12)} />
      <path d="M -46 -26 Q -6 -28 36 -26 L 62 -52 M 36 -26 Q 38 14 36 56" {...INLINE} />
      <path d={sil} {...OUTLINE} />
      <TinyArm from={[60, -6]} to={[80, -30]} bend={[84, -8]} fill={C.sugar} hand="fist" />
      <Eyes x={-6} y={-4} r={ER} mood={mood} look={look} />
      <Mouth x={-4} y={20} w={MW} kind={mouth} />
      <NameTag x={-6} y={44} text="Glucose" size={10.5} />
    </g>
  );
};

// ================================================================== 9 insulin: opens the door for sugar
export const Insulin: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.5, -0.3]}) => {
  const body = loop([[-14, -66], [24, -58], [46, -26], [50, 18], [34, 56], [-12, 66], [-56, 54], [-72, 14], [-66, -32], [-44, -60]]);
  // a brass key, drawn lying along +x with its bow at (0, 0)
  const key = 'M 12 -5 L 62 -5 Q 66 -5 66 -1 L 66 14 L 59 14 L 59 8 L 53 8 L 53 14 L 46 14 L 46 5 L 12 5 A 13 13 0 1 1 12 -5 Z M -5 0 A 5 5 0 1 0 5 0 A 5 5 0 1 0 -5 0 Z';
  return (
    <g transform="translate(-4 4)">
      <TinyLeg from={[-30, 58]} to={[-32, 80]} fill={C.insulin} foot={-1} />
      <TinyLeg from={[8, 60]} to={[10, 80]} fill={C.insulin} />
      <TinyArm from={[-68, 10]} to={[-86, 34]} bend={[-88, 14]} fill={C.insulin} />
      <Shape d={body} fill={C.insulin} shadeBy={0.12} />
      <Eyes x={-12} y={-24} r={ER} mood={mood} look={look} />
      <Mouth x={-10} y={4} w={MW} kind={mouth} />
      <NameTag x={-12} y={32} text="Insulin" size={10.5} />
      {/* the job piece: the key that opens a cell for sugar */}
      <g transform="translate(62 -70) rotate(68) scale(1.05)">
        <path d={key} fill={C.brass} fillRule="evenodd" {...EDGE} />
      </g>
      <TinyArm from={[48, 2]} to={[66, -34]} bend={[80, -2]} fill={C.insulin} />
    </g>
  );
};

// ================================================================== 10 melatonin: the night-shift worker
export const Melatonin: React.FC<V8Props> = ({mood = 'sleepy', mouth = 'smile', look = [0, 0.2]}) => {
  const body = 'M 22 -76 C -36 -88 -84 -42 -82 6 C -80 52 -40 86 26 76 C 4 64 -2 34 0 4 C 2 -28 0 -58 22 -76 Z';
  return (
    <g transform="translate(14 8)">
      <TinyArm from={[-74, 30]} to={[-86, 56]} bend={[-92, 40]} fill={C.melatonin} />
      <Shape d={body} fill={C.melatonin} />
      {/* the job piece: a floppy night cap over the top horn */}
      <path d="M -50 -60 C -30 -96 26 -104 52 -84 C 62 -76 66 -64 60 -52 C 50 -66 34 -72 18 -70 C 0 -68 -20 -62 -50 -60 Z" fill={CLOTH.sky} {...EDGE} />
      <path d="M -56 -64 C -30 -66 -2 -76 16 -78 Q 20 -70 16 -64 C -4 -64 -30 -54 -52 -52 Q -60 -56 -56 -64 Z" fill="#ffffff" {...EDGE} />
      <circle cx={62} cy={-46} r={8} fill="#ffffff" {...EDGE} />
      <Eyes x={-40} y={-20} r={ER} mood={mood} look={look} />
      <Mouth x={-38} y={6} w={MW} kind={mouth} />
      <NameTag x={-38} y={30} text="Melatonin" size={10.5} />
      <text x={22} y={-14} fontWeight={900} fontSize={13} fill={INK} fontFamily="inherit">z</text>
      <text x={32} y={-28} fontWeight={900} fontSize={10} fill={INK} fontFamily="inherit">z</text>
    </g>
  );
};

// ================================================================== 11 cortisol: the alarm that will not switch off
export const Cortisol: React.FC<V8Props> = ({mood = 'scared', mouth = 'open', look = [0, 0]}) => {
  const pts: P[] = [];
  const n = 18;
  const rr = [74, 58, 70, 57, 76, 58, 69, 56, 74, 58, 71, 57, 75, 58, 70, 56, 73, 58];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    pts.push([4 + Math.cos(a) * rr[i] * 1.02, 10 + Math.sin(a) * rr[i] * 0.94]);
  }
  const body = loop(pts, 0.55);
  return (
    <g>
      <TinyLeg from={[-20, 66]} to={[-24, 86]} fill={C.cortisol} foot={-1} />
      <TinyLeg from={[24, 66]} to={[28, 86]} fill={C.cortisol} />
      <Shape d={body} fill={C.cortisol} />
      <TinyArm from={[64, 14]} to={[86, -6]} bend={[86, 16]} fill={C.cortisol} hand="open" />
      <Eyes x={4} y={-14} r={ER} mood={mood} look={look} />
      <Mouth x={6} y={14} w={MW} kind={mouth} />
      <NameTag x={4} y={42} text="Cortisol" size={10.5} />
      {/* the job piece: an alarm bell, ringing */}
      <g transform="translate(-66 -60) rotate(-14)">
        <path d="M -22 -12 q -6 7 0 14 M -28 -16 q -9 11 0 22 M 22 -12 q 6 7 0 14 M 28 -16 q 9 11 0 22" {...INLINE} />
        <circle cx={0} cy={14} r={4} fill={INK} />
        <path d="M -14 8 C -14 -6 -10 -16 0 -16 C 10 -16 14 -6 14 8 Z" fill={C.brass} {...EDGE} />
        <path d="M -18 7 L 18 7 Q 20 12 17 13 L -17 13 Q -20 12 -18 7 Z" fill={shade(C.brass)} {...EDGE} />
        <circle cx={0} cy={-18} r={3.5} fill={C.brass} {...EDGE_IN} />
      </g>
      <TinyArm from={[-50, -18]} to={[-64, -42]} bend={[-70, -20]} fill={C.cortisol} />
    </g>
  );
};

// ================================================================== 12 stomach acid: hot-tempered
export const Acid: React.FC<V8Props> = ({mood = 'angry', mouth = 'grit', look = [0, 0.1]}) => {
  const body = 'M 6 -70 C 22 -46 64 -14 64 26 C 64 60 36 80 0 80 C -36 80 -64 60 -62 26 C -60 -12 -14 -44 6 -70 Z';
  return (
    <g>
      {/* steam curls: the temper */}
      <Tube d="M -22 -50 C -34 -58 -20 -66 -30 -76 C -36 -82 -30 -88 -26 -90" fill="#ffffff" w={4} />
      <Tube d="M 30 -48 C 42 -56 28 -64 38 -74 C 44 -80 38 -86 34 -88" fill="#ffffff" w={4} />
      <TinyLeg from={[-20, 72]} to={[-22, 88]} fill={C.acid} foot={-1} />
      <TinyLeg from={[20, 72]} to={[22, 88]} fill={C.acid} />
      <TinyArm from={[-60, 26]} to={[-76, 50]} bend={[-82, 30]} fill={C.acid} hand="fist" />
      <TinyArm from={[62, 26]} to={[78, 50]} bend={[84, 30]} fill={C.acid} hand="fist" />
      <Shape d={body} fill={C.acid} />
      <Eyes x={0} y={-2} r={ER} mood={mood} look={look} />
      <Mouth x={0} y={26} w={MW + 2} kind={mouth} />
      <NameTag x={0} y={54} text="Acid" size={10.5} />
    </g>
  );
};

// ================================================================== 13 histamine: the over-reactor
export const Histamine: React.FC<V8Props> = ({mood = 'scared', mouth = 'big', look = [0.3, 0]}) => {
  const body = puff(-8, 8, 70, 66, [1, 0.97, 1.03, 0.98, 1.02, 0.97, 1.03, 0.99, 1.01, 0.98], 1.2);
  return (
    <g>
      <TinyLeg from={[-28, 66]} to={[-30, 86]} fill={C.histamine} foot={-1} />
      <TinyLeg from={[12, 68]} to={[14, 86]} fill={C.histamine} />
      <TinyArm from={[-70, -4]} to={[-80, -40]} bend={[-94, -14]} fill={C.histamine} hand="open" />
      <Shape d={body} fill={C.histamine} />
      <Eyes x={-12} y={-20} r={ER} mood={mood} look={look} />
      <Mouth x={-10} y={8} w={MW} kind={mouth} />
      <NameTag x={-10} y={42} text="Histamine" size={10.5} />
      {/* the job piece: a megaphone, much too loud */}
      <g transform="translate(16 2) rotate(-28)">
        <path d="M 0 -5 L 46 -19 Q 51 0 46 19 L 0 5 Q -2 0 0 -5 Z" fill="#ffffff" {...EDGE} />
        <path d="M 4 4 L 46 17 Q 48 10 48 4 Z" fill={shade('#ffffff', 0.1)} />
        <ellipse cx={46} cy={0} rx={5} ry={19} fill={shade('#ffffff', 0.1)} {...EDGE} />
        <path d="M 58 -12 Q 64 0 58 12 M 66 -18 Q 74 0 66 18" {...INLINE} />
      </g>
      <TinyArm from={[54, 34]} to={[38, 8]} bend={[68, 18]} fill={C.histamine} />
    </g>
  );
};

// ================================================================== 14 cilia: the sweepers
export const Cilia: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.4, -0.2]}) => {
  const slab = 'M -66 -2 Q -34 -6 0 -2 Q 34 2 64 -4 Q 68 30 64 66 Q 32 70 0 66 Q -34 62 -64 66 Q -70 30 -66 -2 Z';
  const hairs = [-56, -42, -28, -14, 0, 14, 28, 42, 54];
  return (
    <g transform="translate(-14 10)">
      {hairs.map((x, i) => {
        const h = 50 + ((i * 7) % 3) * 4;
        const lean = 10 + (i % 2) * 4;
        return <Tube key={x} d={`M ${x} 0 C ${x - 8} ${-h * 0.35} ${x + 8} ${-h * 0.6} ${x + lean} ${-h}`} fill={tint(C.cilia, 0.3)} w={4.5} />;
      })}
      <Shape d={slab} fill={C.cilia}>
        <path d="M -30 0 Q -32 32 -28 66 M 30 0 Q 32 32 30 66" {...INLINE} />
        <ellipse cx={-48} cy={40} rx={8} ry={10} fill={shade(C.cilia)} {...EDGE_IN} />
        <ellipse cx={48} cy={36} rx={8} ry={10} fill={shade(C.cilia)} {...EDGE_IN} />
      </Shape>
      <Eyes x={0} y={22} r={ER} mood={mood} look={look} />
      <Mouth x={0} y={48} w={MW} kind={mouth} />
      {/* the job piece: a tiny broom, sweeping outward */}
      <g transform="translate(94 -36) rotate(8)">
        <Tube d="M 0 0 L 0 62" fill={C.kraft} w={4} />
        <path d="M -9 60 L 9 60 L 15 84 Q 0 88 -15 84 Z" fill={C.brass} {...EDGE} />
        <path d="M -4 66 L -6 82 M 0 66 L 0 85 M 4 66 L 6 82" {...INLINE} />
        <path d="M -10 58 H 10 V 65 H -10 Z" fill={shade(C.brass)} {...EDGE_IN} />
      </g>
      <TinyArm from={[62, 24]} to={[84, -2]} bend={[82, 24]} fill={C.cilia} hand="fist" />
    </g>
  );
};

// ================================================================== 15 cholesterol: the sticky blocker
export const Cholesterol: React.FC<V8Props> = ({mood = 'bored', mouth = 'wavy', look = [-0.2, 0.3]}) => {
  const body = [
    'M -48 -50',
    'C -30 -72 12 -70 30 -50',
    'C 48 -30 70 -6 72 24',
    'C 74 44 66 56 54 60',
    'C 50 62 48 66 48 74',
    'C 48 84 36 84 36 74',
    'C 36 66 32 62 22 62',
    'C 8 62 2 64 0 70',
    'C -2 76 -2 86 -10 86',
    'C -18 86 -18 76 -18 70',
    'C -18 64 -24 62 -36 62',
    'C -56 62 -72 50 -72 26',
    'C -72 2 -62 -32 -48 -50 Z',
  ].join(' ');
  return (
    <g transform="translate(0 0)">
      <TinyArm from={[-66, 4]} to={[-80, 40]} bend={[-86, 14]} fill={C.cholesterol} />
      <TinyArm from={[68, 10]} to={[84, 44]} bend={[88, 20]} fill={C.cholesterol} />
      <Shape d={body} fill={C.cholesterol}>
        <path d="M -40 -40 q 8 -6 16 -4 M 40 -8 q 8 6 10 14" {...INLINE} />
      </Shape>
      {/* a sticky drip that has already let go */}
      <path d="M 62 72 C 66 78 68 82 68 85 A 6 6 0 0 1 56 85 C 56 82 58 78 62 72 Z" fill={C.cholesterol} {...EDGE_IN} />
      <Eyes x={-6} y={-26} r={ER} mood={mood} look={look} />
      <Mouth x={-4} y={2} w={MW + 2} kind={mouth} />
      <NameTag x={-2} y={34} text="Cholesterol" size={10.5} />
    </g>
  );
};

// ------------------------------------------------------------------ the set and the board
export const CELLS: Record<string, React.FC<V8Props>> = {
  redCell: RedCell,
  whiteCell: WhiteCell,
  platelet: Platelet,
  eggCell: EggCell,
  sperm: Sperm,
  fatCell: FatCell,
  antibody: Antibody,
  sugar: Sugar,
  insulin: Insulin,
  melatonin: Melatonin,
  cortisol: Cortisol,
  acid: Acid,
  histamine: Histamine,
  cilia: Cilia,
  cholesterol: Cholesterol,
};

type Entry = {C: React.FC<V8Props>; name: string; note: string};
const CELL_LIST: Entry[] = [
  {C: RedCell, name: 'Red cell', note: 'delivers the oxygen'},
  {C: WhiteCell, name: 'White cell', note: 'the security guard'},
  {C: Platelet, name: 'Platelet', note: 'first aid for cuts'},
  {C: EggCell, name: 'Egg cell', note: 'calm, waits to be met'},
  {C: Sperm, name: 'Sperm', note: 'the determined swimmer'},
  {C: FatCell, name: 'Fat cell', note: 'saves energy, hoards it'},
  {C: Antibody, name: 'Antibody', note: 'the trained germ hunter'},
  {C: Cilia, name: 'Cilia', note: 'sweep the airways clean'},
];
const CHEM_LIST: Entry[] = [
  {C: Sugar, name: 'Sugar (glucose)', note: 'fast energy, always running'},
  {C: Insulin, name: 'Insulin', note: 'unlocks cells for sugar'},
  {C: Melatonin, name: 'Melatonin', note: 'the night-shift sleep signal'},
  {C: Cortisol, name: 'Cortisol', note: 'the stress alarm'},
  {C: Acid, name: 'Stomach acid', note: 'hot-tempered digester'},
  {C: Histamine, name: 'Histamine', note: 'the allergy over-reactor'},
  {C: Cholesterol, name: 'Cholesterol', note: 'the sticky artery blocker'},
];

// layout: two white panels stacked, one row of figures in each, all figures the same size
const FIG = 216;
const PX = 56, PW = 1808, PH = 422;
const PANELS: {label: string; y: number; list: Entry[]}[] = [
  {label: 'Cells', y: 170, list: CELL_LIST},
  {label: 'Body chemicals', y: 612, list: CHEM_LIST},
];

export const CellsBoard: React.FC = () => (
  <Board
    kicker="Cast · cells and body chemicals"
    title="Fifteen job characters, one family"
    note="A shape that says what it is · one costume piece or one prop for its job · the shared face · chemicals carry a name tag"
  >
    {PANELS.map(({label, y: py, list}) => {
      const pitch = (PW - 20) / list.length;
      const fy = py + 40 + 50 + FIG / 2;
      return (
        <React.Fragment key={label}>
          <Panel x={PX} y={py} w={PW} h={PH} label={label} />
          {list.map(({C: Ch, name, note}, i) => {
            const x = PX + 10 + pitch * (i + 0.5);
            return (
              <React.Fragment key={name}>
                <Fig x={x} y={fy} size={FIG}>
                  <Ch />
                </Fig>
                <Caption x={x} y={fy + FIG / 2 - 2} name={name} note={note} size={20} w={pitch - 8} />
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    })}
  </Board>
);
