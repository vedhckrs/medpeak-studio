/**
 * MedPeak Toons, look v8: organ characters, set A (13 organs) and their approval board.
 * Drawn 100% in code with the shared kit (kit.tsx). Each organ is its own simplified anatomy, one muted
 * colour with one darker tone, inner fold/lobe lines, a SMALL kit face in the upper half, and thin arms
 * only where they help the character.
 *
 * Built here (not in the kit, which no sheet may change):
 *   - smooth(): a closed outline through hand-placed points (Catmull-Rom turned into cubic beziers).
 *   - cloud(): a closed outline of little outward bulges between hand-placed points (brain gyri, lumps).
 *   - Tube: a filled, outlined tube along a centreline (food pipe, vessels, ducts, windpipe, colon), with
 *     optional haustra waves, cross rings and a cut-open end (lumen).
 */
import React from 'react';
import {Board, Caption, EDGE_IN, Eyes, Fig, FLESH, INLINE, Mouth, Panel, Shape, shade, TinyArm, type V8Props} from './kit';
import {OrganArm, type ArmPose, type Gesture} from './organ-act';

type P = [number, number];

// ------------------------------------------------------------------ path helpers (local)
const f = (n: number) => Math.round(n * 100) / 100;

/** A smooth closed outline through the points (Catmull-Rom as cubic beziers). */
export const smooth = (pts: P[], k = 1): string => {
  const n = pts.length;
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
    const c1: P = [p1[0] + ((p2[0] - p0[0]) * k) / 6, p1[1] + ((p2[1] - p0[1]) * k) / 6];
    const c2: P = [p2[0] - ((p3[0] - p1[0]) * k) / 6, p2[1] - ((p3[1] - p1[1]) * k) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};

/** A closed outline made of outward bulges between the points (a lobed cloud). */
export const cloud = (pts: P[], bulge = 0.22): string => {
  const n = pts.length;
  const cx = pts.reduce((s, p) => s + p[0], 0) / n;
  const cy = pts.reduce((s, p) => s + p[1], 0) / n;
  let d = `M ${f(pts[0][0])} ${f(pts[0][1])}`;
  for (let i = 0; i < n; i++) {
    const a = pts[i], b = pts[(i + 1) % n];
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const len = Math.hypot(dx, dy);
    let nx = -dy / len, ny = dx / len;
    if ((mx - cx) * nx + (my - cy) * ny < 0) { nx = -nx; ny = -ny; }
    d += ` Q ${f(mx + nx * len * bulge)} ${f(my + ny * len * bulge)} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
};

const cr = (a: number, b: number, c: number, d: number, t: number) =>
  0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t * t + (-a + 3 * b - 3 * c + d) * t * t * t);

type Sample = {p: P; t: P; n: P; w: number; s: number};
/** Sample a smooth open centreline with a width that changes from point to point. */
const sampleTube = (pts: P[], W: number | number[], wave?: {n: number; a: number}, per = 14): Sample[] => {
  const ws = typeof W === 'number' ? pts.map(() => W) : W;
  const raw: {p: P; w: number}[] = [];
  const m = pts.length;
  for (let i = 0; i < m - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(m - 1, i + 2)];
    for (let k = 0; k < per; k++) {
      const t = k / per;
      raw.push({p: [cr(p0[0], p1[0], p2[0], p3[0], t), cr(p0[1], p1[1], p2[1], p3[1], t)], w: ws[i] * (1 - t) + ws[i + 1] * t});
    }
  }
  raw.push({p: pts[m - 1], w: ws[m - 1]});
  const N = raw.length;
  return raw.map((r, j) => {
    const a = raw[Math.max(0, j - 1)].p, b = raw[Math.min(N - 1, j + 1)].p;
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const t: P = [(b[0] - a[0]) / L, (b[1] - a[1]) / L];
    const s = j / (N - 1);
    const w = wave ? r.w * (1 + wave.a * Math.cos(2 * Math.PI * wave.n * s)) : r.w;
    return {p: r.p, t, n: [-t[1], t[0]], w, s};
  });
};

const tubePath = (S: Sample[], roundStart: boolean, roundEnd: boolean): string => {
  const L = S.map((q) => [q.p[0] + (q.n[0] * q.w) / 2, q.p[1] + (q.n[1] * q.w) / 2] as P);
  const R = S.map((q) => [q.p[0] - (q.n[0] * q.w) / 2, q.p[1] - (q.n[1] * q.w) / 2] as P);
  const e = S[S.length - 1], b = S[0];
  const ke = roundEnd ? 0.75 : 0.12, ks = roundStart ? 0.75 : 0.12;
  let d = `M ${f(L[0][0])} ${f(L[0][1])}`;
  for (let i = 1; i < L.length; i++) d += ` L ${f(L[i][0])} ${f(L[i][1])}`;
  const r1 = R[R.length - 1];
  d += ` Q ${f(e.p[0] + e.t[0] * e.w * ke)} ${f(e.p[1] + e.t[1] * e.w * ke)} ${f(r1[0])} ${f(r1[1])}`;
  for (let i = R.length - 2; i >= 0; i--) d += ` L ${f(R[i][0])} ${f(R[i][1])}`;
  d += ` Q ${f(b.p[0] - b.t[0] * b.w * ks)} ${f(b.p[1] - b.t[1] * b.w * ks)} ${f(L[0][0])} ${f(L[0][1])} Z`;
  return d;
};

/** The cut-open end of a tube: a rim ellipse with the dark hollow inside. */
const Lumen: React.FC<{q: Sample; fill: string; deep?: string}> = ({q, fill, deep = FLESH.deep}) => {
  const ang = (Math.atan2(q.n[1], q.n[0]) * 180) / Math.PI;
  const rx = q.w / 2, ry = Math.max(2.4, q.w * 0.2);
  return (
    <g transform={`translate(${f(q.p[0])} ${f(q.p[1])}) rotate(${f(ang)})`}>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill={fill} {...EDGE_IN} />
      <ellipse cx={0} cy={ry * 0.12} rx={rx * 0.64} ry={ry * 0.56} fill={deep} />
    </g>
  );
};

/**
 * A tube along a centreline. open: which ends are cut open (drawn with a lumen); a closed end is round.
 * rings: cross lines (haustra, cartilage rings, duct folds) at evenly spaced places, skipping the ends.
 */
const Tube: React.FC<{pts: P[]; w: number | number[]; fill: string; open?: 'start' | 'end' | 'both' | 'none'; wave?: {n: number; a: number}; rings?: number; ringAt?: number[]; shadow?: number; children?: React.ReactNode}> = ({pts, w, fill, open = 'none', wave, rings = 0, ringAt, shadow = 0.6, children}) => {
  const S = sampleTube(pts, w, wave);
  const os = open === 'start' || open === 'both', oe = open === 'end' || open === 'both';
  const d = tubePath(S, !os, !oe);
  const at = ringAt ?? (wave ? Array.from({length: wave.n}, (_, i) => (i + 0.5) / wave.n) : Array.from({length: rings}, (_, i) => (i + 1) / (rings + 1)));
  const ring = (s: number, i: number) => {
    const q = S[Math.round(s * (S.length - 1))];
    const h = q.w * 0.62;
    const a: P = [q.p[0] + q.n[0] * h, q.p[1] + q.n[1] * h];
    const b: P = [q.p[0] - q.n[0] * h, q.p[1] - q.n[1] * h];
    const c: P = [q.p[0] + q.t[0] * q.w * 0.22, q.p[1] + q.t[1] * q.w * 0.22];
    return <path key={i} d={`M ${f(a[0])} ${f(a[1])} Q ${f(c[0])} ${f(c[1])} ${f(b[0])} ${f(b[1])}`} {...INLINE} />;
  };
  return (
    <g>
      <Shape d={d} fill={fill} shadow={shadow}>
        {(rings > 0 || wave || ringAt) && at.map(ring)}
        {children}
      </Shape>
      {os && <Lumen q={S[0]} fill={fill} />}
      {oe && <Lumen q={S[S.length - 1]} fill={fill} />}
    </g>
  );
};

// ------------------------------------------------------------------ colours (one muted family each)
const COL = {
  stomach: FLESH.salmon,
  pipe: '#ec9c9a',
  colon: '#e3888c',
  small: FLESH.coral,
  liver: '#9d4c47',
  kidney: '#8f423f',
  kidneyArt: '#c85a5c',
  kidneyVein: '#8a90c4',
  ureter: '#e9b2a6',
  bladder: '#f3d0b6',
  urine: '#f2dc96',
  lungs: '#f2a6ac',
  windpipe: '#f0d4c8',
  heart: '#c4535a',
  aorta: '#d9686c',
  pulmo: '#b0728f',
  vein: '#8a90c4',
  brain: '#f1aab3',
  stem: '#e3909b',
  tooth: '#f8f4ea',
  root: FLESH.cream,
  bone: '#f1e0c0',
  pancreas: '#f3c89c',
  duodenum: FLESH.salmon,
  gall: '#9fb36c',
};

const R = 11; // the one eye size for an organ the width of the figure
const MW = 11; // the one mouth width

// ------------------------------------------------------------------ 1. stomach
export const Stomach: React.FC<V8Props & {armL?: ArmPose | Gesture; armR?: ArmPose | Gesture}> = ({mood = 'open', mouth = 'flat', look = [-0.4, 0.1], armL, armR}) => {
  const body = smooth([[-2, -48], [10, -58], [26, -68], [48, -69], [66, -54], [75, -28], [73, 4], [63, 30], [43, 50], [14, 61], [-16, 61], [-42, 53], [-60, 44], [-71, 33], [-68, 20], [-52, 18], [-32, 15], [-17, 5], [-9, -13], [-7, -33]]);
  return (
    <g>
      <Tube pts={[[-8, -93], [-5, -76], [3, -60], [8, -50]]} w={19} fill={COL.stomach} open="start" />
      <Tube pts={[[-58, 32], [-74, 38], [-83, 54], [-80, 72], [-68, 82]]} w={16} fill={COL.stomach} open="end" />
      <Shape d={body} fill={COL.stomach}>
        <path d="M -56 18 Q -50 31 -57 46" {...INLINE} />
        <path d="M -30 42 Q -12 33 6 42 Q 22 49 38 38" {...INLINE} />
        <path d="M -12 53 Q 6 47 22 53" {...INLINE} />
        <path d="M 14 -55 Q 4 -40 6 -26" {...INLINE} />
      </Shape>
      {armL ? <OrganArm from={[-36, 56]} s={-1} pose={armL} fill={COL.stomach} /> : <TinyArm from={[-36, 56]} bend={[-46, 76]} to={[-28, 84]} fill={COL.stomach} hand="fist" />}
      {armR ? <OrganArm from={[71, 6]} s={1} pose={armR} fill={COL.stomach} len={0.9} /> : <TinyArm from={[71, 6]} bend={[90, 8]} to={[88, -16]} fill={COL.stomach} hand="mitten" />}
      <Eyes x={36} y={-30} r={R} mood={mood} look={look} />
      <Mouth x={36} y={-8} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 2. food pipe (oesophagus)
export const FoodPipe: React.FC<V8Props> = ({mood = 'open', mouth = 'o', look = [0, 0.5]}) => (
  <g>
    <Tube pts={[[-8, -80], [5, -46], [-6, -8], [5, 30], [20, 68]]} w={[58, 54, 52, 64, 48]} fill={COL.pipe} open="both" ringAt={[0.52, 0.86]} shadow={0.8}>
    </Tube>
    <TinyArm from={[-31, -10]} bend={[-46, 0]} to={[-36, 26]} fill={COL.pipe} hand="mitten" />
    <TinyArm from={[21, -12]} bend={[40, -4]} to={[38, 24]} fill={COL.pipe} hand="mitten" />
    <Eyes x={3} y={-50} r={9} mood={mood} look={look} />
    <Mouth x={2} y={-29} w={MW} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ 3. intestine
export const Intestine: React.FC<V8Props> = ({mood = 'happy', mouth = 'smile', look = [0, 0]}) => {
  const coil = cloud([[-42, -42], [-22, -52], [-2, -47], [20, -53], [42, -42], [50, -20], [43, 0], [50, 22], [38, 44], [18, 52], [-4, 47], [-26, 54], [-44, 40], [-50, 16], [-43, -4], [-50, -24]], 0.3);
  return (
    <g>
      <Tube pts={[[-50, 74], [-44, 86], [-36, 88]]} w={7} fill={COL.colon} shadow={0} />
      <Tube pts={[[-58, 66], [-64, 30], [-66, -20], [-62, -56], [-40, -71], [0, -67], [40, -71], [62, -56], [66, -20], [64, 24], [57, 52], [36, 64], [14, 62], [6, 76], [4, 91]]} w={[24, 25, 25, 25, 25, 25, 25, 25, 25, 25, 24, 22, 20, 18, 18]} fill={COL.colon} wave={{n: 15, a: 0.11}} open="end" />
      <Shape d={coil} fill={COL.small}>
        <path d="M -8 30 Q 0 22 8 30" {...INLINE} />
        <path d="M -8 46 Q 0 40 8 46" {...INLINE} />
        <path d="M -44 -14 q 8 -8 14 0" {...INLINE} />
        <path d="M 32 -16 q 8 -6 14 2" {...INLINE} />
      </Shape>
      <Tube pts={[[-40, 46], [-42, 24], [-30, 10], [-16, 18], [-14, 36]]} w={11} fill={COL.small} shadow={0.4} />
      <Tube pts={[[-14, 36], [-18, 46], [-30, 44], [-36, 30], [-46, 16]]} w={11} fill={COL.small} shadow={0.4} />
      <Tube pts={[[40, 46], [42, 24], [30, 10], [16, 18], [14, 36]]} w={11} fill={COL.small} shadow={0.4} />
      <Tube pts={[[14, 36], [18, 46], [30, 44], [36, 30], [46, 16]]} w={11} fill={COL.small} shadow={0.4} />
      <Eyes x={0} y={-26} r={R} mood={mood} look={look} />
      <Mouth x={0} y={-5} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 4. liver
export const Liver: React.FC<V8Props> = ({mood = 'sleepy', mouth = 'smile', look = [0, 0]}) => {
  const body = smooth([[-84, -12], [-80, -40], [-60, -57], [-26, -64], [10, -62], [44, -54], [72, -42], [90, -29], [86, -18], [62, -5], [36, 9], [12, 23], [-14, 41], [-40, 53], [-63, 49], [-79, 27]]);
  return (
    <g>
      <TinyArm from={[-74, 32]} bend={[-90, 46]} to={[-78, 64]} fill={COL.liver} hand="mitten" />
      <Shape d={smooth([[-26, 36], [-10, 34], [-4, 50], [-12, 62], [-24, 58]])} fill={COL.gall} shadow={0.5} />
      <Shape d={body} fill={COL.liver}>
        <path d="M 16 -62 Q 10 -24 2 26" {...INLINE} />
        <path d="M 30 -4 Q 52 -14 72 -26" {...INLINE} />
      </Shape>
      <TinyArm from={[22, 18]} bend={[34, 38]} to={[22, 54]} fill={COL.liver} hand="mitten" />
      <Eyes x={-36} y={-26} r={R} mood={mood} look={look} />
      <Mouth x={-36} y={-4} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 5. kidney
export const Kidney: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [-0.6, -0.3]}) => {
  const body = smooth([[-8, -78], [24, -75], [45, -56], [52, -28], [42, -12], [33, 2], [41, 17], [52, 34], [46, 62], [20, 81], [-12, 82], [-40, 65], [-55, 30], [-57, -10], [-48, -50], [-30, -72]]);
  return (
    <g>
      <Tube pts={[[30, 4], [50, 30], [42, 60], [48, 92]]} w={9} fill={COL.ureter} shadow={0.4} open="end" />
      <Tube pts={[[30, -6], [58, -12], [86, -16]]} w={10} fill={COL.kidneyArt} shadow={0.4} open="end" />
      <Tube pts={[[32, 8], [60, 8], [88, 4]]} w={11} fill={COL.kidneyVein} shadow={0.4} open="end" />
      <TinyArm from={[-52, 4]} bend={[-76, 0]} to={[-82, -24]} fill={COL.kidney} hand="open" />
      <Shape d={body} fill={COL.kidney}>
        <path d="M -42 -36 Q -50 10 -32 52" {...INLINE} />
        <path d="M 30 -16 Q 22 0 30 14" {...INLINE} />
      </Shape>
      <Shape d={smooth([[-34, -70], [-24, -88], [-4, -92], [16, -84], [26, -72], [0, -74]])} fill={FLESH.butter} shadow={0.5} />
      <Eyes x={-8} y={-36} r={R} mood={mood} look={look} brows />
      <Mouth x={-8} y={-14} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 6. bladder
export const Bladder: React.FC<V8Props> = ({mood = 'scared', mouth = 'wavy', look = [0, 0]}) => {
  const body = smooth([[-12, -61], [-50, -53], [-70, -24], [-70, 10], [-56, 40], [-30, 60], [-12, 70], [12, 70], [32, 58], [58, 38], [70, 6], [68, -28], [48, -54], [14, -63]]);
  return (
    <g>
      <Tube pts={[[-80, -90], [-74, -66], [-58, -44]]} w={8} fill={COL.ureter} shadow={0.3} open="start" />
      <Tube pts={[[80, -90], [74, -66], [58, -44]]} w={8} fill={COL.ureter} shadow={0.3} open="start" />
      <Tube pts={[[0, 62], [1, 78], [2, 92]]} w={13} fill={COL.bladder} shadow={0.4} open="end" />
      <Shape d={body} fill={COL.bladder}>
        <path d="M -90 8 q 15 -7 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0 L 100 100 L -100 100 Z" fill={COL.urine} />
        <path d="M -90 8 q 15 -7 30 0 t 30 0 t 30 0 t 30 0 t 30 0 t 30 0" {...INLINE} />
        <path d="M -20 -54 Q 0 -48 20 -54" {...INLINE} />
      </Shape>
      <TinyArm from={[-62, 26]} bend={[-52, 56]} to={[-20, 50]} fill={COL.bladder} hand="mitten" />
      <TinyArm from={[62, 26]} bend={[52, 56]} to={[20, 50]} fill={COL.bladder} hand="mitten" />
      <Eyes x={0} y={-28} r={R} mood={mood} look={look} />
      <Mouth x={0} y={-8} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 7. lungs
export const Lungs: React.FC<V8Props> = ({mood = 'happy', mouth = 'open', look = [0, 0]}) => {
  const right = smooth([[-24, -64], [-42, -59], [-61, -36], [-74, 0], [-80, 36], [-76, 63], [-56, 74], [-30, 70], [-12, 65], [-8, 38], [-10, 0], [-12, -36], [-17, -57]]);
  const left = smooth([[24, -64], [42, -59], [63, -34], [77, 2], [83, 38], [77, 64], [54, 74], [30, 70], [22, 62], [26, 44], [15, 30], [12, 8], [12, -36], [17, -57]]);
  return (
    <g>
      <TinyArm from={[-76, 20]} bend={[-94, 10]} to={[-88, -14]} fill={COL.lungs} hand="open" />
      <TinyArm from={[79, 24]} bend={[95, 30]} to={[92, 52]} fill={COL.lungs} hand="mitten" />
      <Shape d={right} fill={COL.lungs}>
        <path d="M -76 22 Q -50 38 -34 70" {...INLINE} />
        <path d="M -62 40 Q -40 34 -12 38" {...INLINE} />
      </Shape>
      <Shape d={left} fill={COL.lungs}>
        <path d="M 80 20 Q 54 40 38 70" {...INLINE} />
      </Shape>
      <Tube pts={[[0, -40], [-12, -31], [-25, -16]]} w={13} fill={COL.windpipe} shadow={0.3} />
      <Tube pts={[[0, -40], [12, -31], [25, -16]]} w={13} fill={COL.windpipe} shadow={0.3} />
      <Tube pts={[[0, -93], [1, -66], [0, -38]]} w={18} fill={COL.windpipe} open="start" rings={4} shadow={0.4} />
      <Eyes x={-48} y={-8} r={9} mood={mood} look={[0.3, look[1]]} />
      <Mouth x={-48} y={11} w={10} kind={mouth} />
      <Eyes x={50} y={-8} r={9} mood={mood} look={[-0.3, look[1]]} />
      <Mouth x={50} y={11} w={10} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 8. heart
export const Heart: React.FC<V8Props> = ({mood = 'open', mouth = 'open', look = [0, -0.7]}) => {
  const body = smooth([[-30, -42], [-6, -44], [24, -40], [48, -28], [65, -8], [72, 18], [69, 46], [59, 71], [47, 88], [32, 86], [12, 76], [-12, 60], [-36, 42], [-52, 27], [-62, 16], [-77, 6], [-81, -14], [-71, -34], [-50, -42]]);
  return (
    <g>
      <Tube pts={[[-36, -30], [-38, -60], [-37, -86]]} w={16} fill={COL.vein} open="end" shadow={0.5} />
      <Tube pts={[[2, -62], [-2, -89]]} w={8} fill={COL.aorta} open="end" shadow={0} />
      <Tube pts={[[14, -68], [14, -91]]} w={8} fill={COL.aorta} open="end" shadow={0} />
      <Tube pts={[[26, -68], [31, -89]]} w={8} fill={COL.aorta} open="end" shadow={0} />
      <Tube pts={[[22, -54], [42, -58], [62, -54]]} w={13} fill={COL.pulmo} open="end" shadow={0.4} />
      <Tube pts={[[15, -28], [15, -48], [19, -64]]} w={25} fill={COL.pulmo} shadow={0.5} />
      <Tube pts={[[-6, -30], [-8, -52], [0, -68], [20, -74], [36, -66], [40, -48], [38, -30]]} w={20} fill={COL.aorta} shadow={0.6} />
      <Shape d={body} fill={COL.heart}>
        <path d="M 10 -41 Q 16 22 42 85" {...INLINE} />
        <path d="M -50 -40 Q -42 -6 -56 22" {...INLINE} />
      </Shape>
      <TinyArm from={[66, 18]} bend={[90, 14]} to={[91, -14]} fill={COL.heart} hand="open" />
      <TinyArm from={[-50, 32]} bend={[-70, 58]} to={[-34, 52]} fill={COL.heart} hand="open" />
      <Eyes x={-16} y={-6} r={R} mood={mood} look={look} brows />
      <Mouth x={-16} y={16} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 9. brain
export const Brain: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.7, -0.6]}) => {
  const cerebrum = cloud([[-80, 12], [-85, -14], [-75, -38], [-58, -56], [-34, -69], [-8, -75], [18, -73], [44, -65], [66, -49], [80, -26], [84, 0], [76, 22], [56, 30], [32, 32], [10, 38], [-14, 42], [-36, 40], [-56, 32]], 0.24);
  const cerebellum = smooth([[30, 22], [56, 18], [76, 26], [78, 42], [62, 55], [40, 53], [27, 40]]);
  return (
    <g>
      <Tube pts={[[12, 26], [12, 58], [8, 91]]} w={[22, 20, 18]} fill={COL.stem} open="end" shadow={0.6} />
      <Shape d={cerebellum} fill={COL.brain}>
        <path d="M 32 32 Q 54 28 76 34" {...INLINE} />
        <path d="M 34 43 Q 56 40 72 46" {...INLINE} />
      </Shape>
      <Shape d={cerebrum} fill={COL.brain}>
        <path d="M -56 28 Q -24 12 14 16 Q 30 16 44 8" {...INLINE} />
        <path d="M 14 -74 Q 4 -52 10 -38 Q 16 -24 6 -10" {...INLINE} />
        <path d="M -70 -26 q 10 -9 20 0" {...INLINE} />
        <path d="M -44 -58 q 6 10 18 4" {...INLINE} />
        <path d="M 40 -54 q 4 12 16 10" {...INLINE} />
        <path d="M 64 -22 q -10 6 -6 18" {...INLINE} />
        <path d="M -66 4 q 8 -8 18 -4" {...INLINE} />
        <path d="M 30 -22 q 10 -2 14 8" {...INLINE} />
      </Shape>
      <Eyes x={-22} y={-30} r={R} mood={mood} look={look} />
      <Mouth x={-20} y={-8} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 10. tooth (molar)
export const Tooth: React.FC<V8Props> = ({mood = 'scared', mouth = 'wavy', look = [0, 0]}) => {
  const roots = smooth([[-50, -4], [50, -4], [54, 30], [48, 62], [40, 84], [30, 89], [22, 75], [16, 44], [6, 26], [0, 24], [-6, 26], [-16, 44], [-22, 75], [-30, 89], [-40, 84], [-48, 62], [-54, 30]]);
  const crown = smooth([[-60, -46], [-55, -69], [-36, -78], [-18, -66], [0, -73], [18, -66], [36, -78], [55, -69], [60, -46], [62, -16], [54, 9], [0, 16], [-54, 9], [-62, -16]]);
  return (
    <g>
      <TinyArm from={[-60, -22]} bend={[-82, -22]} to={[-84, -46]} fill={COL.tooth} hand="open" />
      <TinyArm from={[60, -22]} bend={[82, -22]} to={[84, -46]} fill={COL.tooth} hand="open" />
      <Shape d={roots} fill={COL.root}>
        <path d="M -38 30 Q -32 56 -32 76" {...INLINE} />
        <path d="M 38 30 Q 32 56 32 76" {...INLINE} />
      </Shape>
      <Shape d={crown} fill={COL.tooth} shadeBy={0.1}>
        <path d="M -18 -64 Q -15 -58 -20 -52" {...INLINE} />
        <path d="M 18 -64 Q 15 -58 20 -52" {...INLINE} />
      </Shape>
      <Eyes x={0} y={-33} r={R} mood={mood} look={look} />
      <Mouth x={0} y={-8} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 11. bone (a femur)
export const Bone: React.FC<V8Props> = ({mood = 'bored', mouth = 'flat', look = [0, 0]}) => {
  const body = smooth([[-32, -86], [-46, -91], [-60, -82], [-63, -66], [-54, -54], [-36, -50], [-24, -38], [-22, -10], [-22, 30], [-26, 52], [-40, 64], [-45, 80], [-33, 92], [-12, 88], [0, 80], [12, 88], [32, 92], [44, 80], [40, 62], [26, 50], [22, 30], [22, -10], [24, -40], [34, -56], [31, -74], [15, -75], [-4, -70], [-22, -76]]);
  return (
    <g>
      <Shape d={body} fill={COL.bone} shadeBy={0.12}>
        <path d="M -40 -52 Q -32 -64 -32 -84" {...INLINE} />
        <path d="M -30 66 Q 0 58 30 66" {...INLINE} />
        <path d="M 12 0 Q 14 22 12 42" {...INLINE} />
        <path d="M -12 10 Q -14 26 -12 38" {...INLINE} />
        <path d="M 16 -40 Q 26 -54 24 -70" {...INLINE} />
        <path d="M -20 48 Q 0 42 20 48" {...INLINE} />
      </Shape>
      <TinyArm from={[-22, -4]} bend={[-46, 4]} to={[-26, 20]} fill={COL.bone} hand="fist" />
      <TinyArm from={[22, -4]} bend={[46, 4]} to={[26, 20]} fill={COL.bone} hand="fist" />
      <Eyes x={-2} y={-50} r={10} mood={mood} look={look} brows />
      <Mouth x={-2} y={-28} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 12. pancreas
export const Pancreas: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.4, 0.5]}) => {
  const body = cloud([[-62, -47], [-74, -16], [-70, 18], [-56, 42], [-38, 47], [-22, 29], [-10, 24], [0, 21], [14, 18], [28, 13], [42, 7], [56, 0], [68, -8], [80, -16], [90, -31], [80, -44], [66, -46], [54, -44], [38, -43], [24, -39], [10, -42], [-2, -44], [-12, -52], [-24, -57], [-36, -60], [-46, -60]], 0.2);
  return (
    <g>
      <Tube pts={[[-28, -74], [-64, -74], [-89, -42], [-91, 10], [-76, 48], [-46, 62], [-16, 56]]} w={18} fill={COL.duodenum} open="both" rings={5} shadow={0.5} />
      <Shape d={body} fill={COL.pancreas}>
        <path d="M -62 26 Q -30 26 0 12 Q 40 -4 82 -26" {...INLINE} />
        <path d="M 10 -36 q 6 6 0 12" {...INLINE} />
        <path d="M 46 -40 q 6 6 0 12" {...INLINE} />
      </Shape>
      <Eyes x={-34} y={-20} r={10} mood={mood} look={look} />
      <Mouth x={-34} y={1} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 13. gallbladder
export const Gallbladder: React.FC<V8Props> = ({mood = 'angry', mouth = 'frown', look = [0, 0]}) => {
  const body = smooth([[-8, -48], [8, -46], [16, -30], [30, -8], [44, 20], [48, 46], [38, 70], [12, 82], [-18, 80], [-40, 64], [-48, 36], [-42, 8], [-28, -18], [-16, -34]]);
  return (
    <g>
      <Tube pts={[[0, -40], [-3, -62], [10, -77], [30, -81], [46, -90]]} w={12} fill={COL.gall} open="end" rings={4} shadow={0.4} />
      <TinyArm from={[-44, 32]} bend={[-64, 42]} to={[-60, 64]} fill={COL.gall} hand="fist" />
      <TinyArm from={[46, 34]} bend={[66, 44]} to={[62, 66]} fill={COL.gall} hand="fist" />
      <Shape d={body} fill={COL.gall}>
        <path d="M -12 -36 Q 0 -30 12 -36" {...INLINE} />
        <path d="M -22 64 Q 0 72 24 64" {...INLINE} />
      </Shape>
      <Eyes x={0} y={10} r={9.5} mood={mood} look={look} />
      <Mouth x={0} y={32} w={MW} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ registry
export const ORGANS_A: Record<string, React.FC<V8Props>> = {
  stomach: Stomach, foodPipe: FoodPipe, intestine: Intestine, liver: Liver, kidney: Kidney, bladder: Bladder, lungs: Lungs,
  heart: Heart, brain: Brain, tooth: Tooth, bone: Bone, pancreas: Pancreas, gallbladder: Gallbladder,
};

// ------------------------------------------------------------------ the board
const ROW1: [React.FC<V8Props>, string, string][] = [
  [Stomach, 'Stomach', 'Hard-working cook'],
  [FoodPipe, 'Food pipe', 'The swallower'],
  [Intestine, 'Intestine', 'Patient conveyor belt'],
  [Liver, 'Liver', 'Calm, overworked cleaner'],
  [Kidney, 'Kidney', 'Precise, fussy filter'],
  [Bladder, 'Bladder', 'Anxious when full'],
  [Lungs, 'Lungs', 'Cheerful air team'],
];
const ROW2: [React.FC<V8Props>, string, string][] = [
  [Heart, 'Heart', 'Loyal and dramatic'],
  [Brain, 'Brain', 'Smart, easily distracted'],
  [Tooth, 'Tooth', 'Terrified of sugar'],
  [Bone, 'Bone', 'Sturdy, old-fashioned'],
  [Pancreas, 'Pancreas', 'Quiet sugar manager'],
  [Gallbladder, 'Gallbladder', 'Small grumbler'],
];
const STEP = 258;
const FIG = 240;
const MOODS: [V8Props, string][] = [
  [{mood: 'happy', mouth: 'smile'}, 'Cooking, happy'],
  [{mood: 'angry', mouth: 'grit', look: [0, 0]}, 'Overfed, grumpy'],
  [{mood: 'sad', mouth: 'frown', look: [0, 0.4]}, 'Empty, sad'],
  [{mood: 'dizzy', mouth: 'wavy'}, 'Queasy'],
];

export const OrgansA: React.FC = () => (
  <Board kicker="Cast · organs 1 of 2" title="The organ cast: thirteen body characters" note="Real anatomy, simplified · one muted colour and one darker tone each · the same small kit face on every organ">
    <Panel x={56} y={170} w={1808} h={630} label="The organs" />
    {ROW1.map(([C, name, note], i) => {
      const x = 56 + STEP * (i + 0.5);
      return (
        <React.Fragment key={name}>
          <Fig x={x} y={332} size={FIG}><C /></Fig>
          <Caption x={x} y={446} name={name} note={note} w={240} />
        </React.Fragment>
      );
    })}
    {ROW2.map(([C, name, note], i) => {
      const x = 960 + STEP * (i - 2.5);
      return (
        <React.Fragment key={name}>
          <Fig x={x} y={630} size={FIG}><C /></Fig>
          <Caption x={x} y={746} name={name} note={note} w={240} />
        </React.Fragment>
      );
    })}
    <Panel x={56} y={814} w={1808} h={220} label="One face system" />
    <div style={{position: 'absolute', left: 76, top: 866, width: 520, fontSize: 21, fontWeight: 600, color: '#75645d', lineHeight: 1.4}}>The same small kit face on every organ: moods change only the lids, brows and mouth. Here the stomach in four moods.</div>
    {MOODS.map(([p, label], i) => {
      const x = 790 + i * 300;
      return (
        <React.Fragment key={label}>
          <Fig x={x} y={908} size={150}><Stomach {...p} /></Fig>
          <Caption x={x} y={988} name={label} size={18} w={240} />
        </React.Fragment>
      );
    })}
  </Board>
);
export {COL as ORGAN_COL};
