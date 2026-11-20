/**
 * MedPeak Toons, look v8: the INSIDE-THE-BODY scenes of the rabies video (1080 x 1920 stills), at the
 * scale of the cells: we are INSIDE the tissue, under a microscope.
 *
 * The biology, simplified and true:
 *   - the virus comes in with dog saliva into torn MUSCLE at the bite (place 'wound');
 *   - it reaches a NERVE ENDING sitting on a muscle fibre (the junction). The ending carries receptors,
 *     drawn as little LOCKS; the cast Virus carries a gold KEY (place 'junction');
 *   - inside the nerve fibre (the AXON) it is carried slowly along thin RAILS (microtubules) toward the
 *     spinal cord and the brain: the 2-3 months (place 'axon');
 *   - after the vaccine, ANTIBODIES meet it in the tissue fluid before it gets into the nerve, stick to its
 *     spikes and block the locks; white cells then swallow it (places 'junction' and 'tissue').
 *
 * Every place is built in three planes, flat colour only:
 *   back  - small cells, darker and close together, thin inner lines only;
 *   mid   - where the action is, the full kit outline;
 *   front - one or two big cell edges in a darker tone, cropped by the frame corners (<MicroFront>,
 *           drawn AFTER the characters so things clearly pass in front of each other).
 * The places stay quieter than the cast: calm colour fields, no faces, no gradients, no glow, no blur.
 *
 * Built here because the kit has no such pieces (kit and cast untouched): uneven lobes (cells, nuclei),
 * a tube along a smooth centre line (fibres, axons, capillaries, rails), muscle fibres with stripes and
 * torn ends, myelin segments, receptor locks, a fang tip, saliva, mitochondria, a little rail carrier.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FLESH, INK, INLINE, OUTLINE, Shape, TinyLeg, shade, tint} from './kit';
import {Bubble, Label, Layer, Put, Scene, SCENE_H, SCENE_W, Tag} from './scene';
import {Vaccine, Virus} from './germs';
import {Antibody, RedCell, WhiteCell} from './cells';
import {Brain} from './organs-a';

// ------------------------------------------------------------------ geometry helpers
type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth curve segments (Catmull-Rom as cubics) through the points, without the opening M. */
const curve = (p: P[]): string => {
  let d = '';
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p[i + 1];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};
const open = (p: P[]) => `M ${f(p[0][0])} ${f(p[0][1])}${curve(p)}`;
/** A closed smooth outline through the points. */
const loop = (p: P[]): string => {
  const n = p.length;
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};
/** A repeatable pseudo-random number 0..1. */
const rnd = (i: number, seed: number) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
/** A slightly uneven round lobe (a cell, a nucleus), optionally turned by rot degrees. */
const lobe = (cx: number, cy: number, rx: number, ry: number, seed: number, n = 9, rot = 0): string => {
  const r = (rot * Math.PI) / 180;
  return loop(Array.from({length: n}, (_, i): P => {
    const a = (i * 2 * Math.PI) / n;
    const k = 1 + (rnd(i, seed) - 0.5) * 0.14;
    const x = Math.cos(a) * rx * k, y = Math.sin(a) * ry * k;
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  }));
};
/** Sample a smooth centre line (Catmull-Rom) into many points. */
const sample = (pts: P[], steps = 14): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? pts[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
type Tube = {d: string; c: P[]; L: P[]; R: P[]; w: number[]; t: P[]};
/**
 * A closed tube along a smooth centre line; full widths per control point, interpolated.
 * ends: 'round' | 'cut' (straight across, for ends outside the frame) | 'torn' (ragged), per end.
 */
const tube = (pts: P[], widths: number[], ends: [string, string] = ['round', 'round'], steps = 14, seed = 1): Tube => {
  const c = sample(pts, steps);
  const n = c.length;
  const w = c.map((_, i) => {
    const u = (i / (n - 1)) * (widths.length - 1);
    const a = Math.floor(u), b = Math.min(widths.length - 1, a + 1);
    return widths[a] + (widths[b] - widths[a]) * (u - a);
  });
  const L: P[] = [], R: P[] = [], t: P[] = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    t.push([dx / l, dy / l]);
    const h = w[i] / 2;
    L.push([p[0] - (dy / l) * h, p[1] + (dx / l) * h]);
    R.push([p[0] + (dy / l) * h, p[1] - (dx / l) * h]);
  });
  const cap = (end: string, from: P, to: P, mid: P, dir: P, h: number, s: number): string => {
    if (end === 'cut') return ` L ${f(to[0])} ${f(to[1])}`;
    if (end === 'round') return ` C ${f(from[0] + dir[0] * h * 1.3)} ${f(from[1] + dir[1] * h * 1.3)} ${f(to[0] + dir[0] * h * 1.3)} ${f(to[1] + dir[1] * h * 1.3)} ${f(to[0])} ${f(to[1])}`;
    // torn: a ragged edge of short fibrils
    let d = '';
    const k = 6;
    for (let i = 1; i <= k; i++) {
      const u = i / (k + 1);
      const x = from[0] + (to[0] - from[0]) * u, y = from[1] + (to[1] - from[1]) * u;
      const out = (i % 2 ? 0.32 : 0.06) * h * (0.7 + rnd(i, s) * 0.6);
      d += ` L ${f(x + dir[0] * out)} ${f(y + dir[1] * out)}`;
    }
    return d + ` L ${f(to[0])} ${f(to[1])}`;
  };
  const tE = t[n - 1], tS: P = [-t[0][0], -t[0][1]];
  const d = `${open(L)}${cap(ends[1], L[n - 1], R[n - 1], c[n - 1], tE, w[n - 1] / 2, seed)}${curve(R.slice().reverse())}${cap(ends[0], R[0], L[0], c[0], tS, w[0] / 2, seed + 7)} Z`;
  return {d, c, L, R, w, t};
};

// ------------------------------------------------------------------ colours of the micro world
const FLUID = tint(FLESH.maroon, 0.4); // the tissue fluid between cells
const BACK = shade(FLUID, 0.07); // back-plane cells: darker, close together
const BACK_NUC = shade(FLUID, 0.2);
const CELL = tint(FLESH.salmon, 0.18); // mid-plane cells
const NUC = tint(FLESH.maroon, 0.3); // their nuclei
const FRONT = shade(FLESH.salmon, 0.32); // the big near cell edges
const FRONT_NUC = shade(FRONT, 0.16);
const MUSCLE = tint('#c95c61', 0.12); // a muscle fibre (the cast's muscle red, calmer)
const MUSCLE_BACK = shade(FLUID, 0.12);
const NERVE = tint(FLESH.butter, 0.4); // the cast's nerve cream: the axon
const MYELIN = tint(FLESH.cream, 0.2); // its fatty sleeve
const LOCK = tint('#e2bf63', 0.3); // the receptor sockets (gold, like the Virus's key)
const VESSEL = tint('#cf5560', 0.3); // capillary wall
const LUMEN = tint(FLESH.maroon, 0.18); // inside the capillary
const SPIT = '#e9f1f2'; // dog saliva
const FANG = '#fbf6ea'; // the tooth
const AIR = '#e4eef1'; // outside the skin
const SKINCELL = tint('#f0c39d', 0.1); // the skin's brick cells (the cast's warm skin)
const AXO = tint(NERVE, 0.25); // the inside of the axon
const MITO = tint(FLESH.coral, 0.1); // mitochondria
const CARRIER = '#e2a45a'; // the little motor that walks the rail: a golden tan, unlike the tunnel

// ------------------------------------------------------------------ the pieces of the micro world
type C = [number, number, number, number]; // x, y, rx, ry
/** Back-plane cells: darker fill, a nucleus, thin inner lines only. */
const BackCells: React.FC<{cells: C[]; seed?: number}> = ({cells, seed = 0}) => (
  <g>
    {cells.map(([x, y, rx, ry], i) => (
      <g key={i}>
        <path d={lobe(x, y, rx, ry, seed + i * 3)} fill={BACK} {...EDGE_IN} />
        <path d={lobe(x + rx * 0.12, y - ry * 0.06, Math.min(rx, ry) * 0.36, Math.min(rx, ry) * 0.32, seed + i * 3 + 1, 7)} fill={BACK_NUC} {...EDGE_IN} />
      </g>
    ))}
  </g>
);
/** A mid-plane cell: full outline, one darker crescent, a big nucleus (about the size of a virus). */
const MidCell: React.FC<{c: C; seed: number; nuc?: [number, number, number]; fill?: string}> = ({c: [x, y, rx, ry], seed, nuc, fill = CELL}) => {
  const [nx, ny, nr] = nuc ?? [rx * 0.1, -ry * 0.05, Math.min(rx, ry) * 0.38];
  return (
    <Shape d={lobe(x, y, rx, ry, seed, 10)} fill={fill} shadow={3}>
      <path d={lobe(x + nx, y + ny, nr * 1.08, nr, seed + 5, 8)} fill={NUC} {...EDGE_IN} />
      <path d={lobe(x + nx + nr * 0.25, y + ny - nr * 0.2, nr * 0.2, nr * 0.18, seed + 6, 6)} fill={shade(NUC, 0.18)} />
    </Shape>
  );
};
/** A near cell edge, cropped by the frame: darker, outlined, part of its nucleus. */
const FrontCell: React.FC<{c: C; seed: number; nuc?: [number, number, number]}> = ({c: [x, y, rx, ry], seed, nuc}) => (
  <Shape d={lobe(x, y, rx, ry, seed, 10)} fill={FRONT} shadow={0}>
    {nuc && <path d={lobe(x + nuc[0], y + nuc[1], nuc[2] * 1.1, nuc[2], seed + 3, 8)} fill={FRONT_NUC} {...EDGE_IN} />}
  </Shape>
);
/** A muscle fibre: a long rounded band with fine cross-stripes (its one darker tone) and flat nuclei at its edge. */
const Fibre: React.FC<{pts: P[]; w: number; ends?: [string, string]; seed?: number; back?: boolean; every?: number}> = ({pts, w, ends = ['cut', 'cut'], seed = 1, back, every = 3}) => {
  const tb = tube(pts, [w, w * 0.97, w * 1.02, w], ends, 16, seed);
  const fill = back ? MUSCLE_BACK : MUSCLE;
  const stripes: string[] = [];
  for (let i = 2; i < tb.c.length - 2; i += every) stripes.push(`M ${f(tb.L[i][0])} ${f(tb.L[i][1])} L ${f(tb.R[i][0])} ${f(tb.R[i][1])}`);
  const nuclei: string[] = [];
  for (let i = 8; i < tb.c.length - 6; i += 23) {
    const side = (i / 23) % 2 ? 1 : -1;
    const [cx, cy] = tb.c[i], [tx, ty] = tb.t[i];
    const off = (w / 2 - 16) * side;
    nuclei.push(lobe(cx - ty * off, cy + tx * off, 38, 9, seed + i, 8, (Math.atan2(ty, tx) * 180) / Math.PI));
  }
  if (back) return (
    <g>
      <path d={tb.d} fill={fill} {...EDGE_IN} />
    </g>
  );
  // a torn end frays into a few loose fibrils
  const frays: string[] = [];
  ends.forEach((e, k) => {
    if (e !== 'torn') return;
    const i = k ? tb.c.length - 1 : 0;
    const [cx, cy] = tb.c[i];
    const dir: P = k ? tb.t[i] : [-tb.t[i][0], -tb.t[i][1]];
    const nx = -dir[1], ny = dir[0];
    [-0.62, -0.25, 0.12, 0.5].forEach((u, j) => {
      const len = w * (0.32 + rnd(j, seed + k) * 0.28);
      const bx = cx + nx * u * w * 0.5, by = cy + ny * u * w * 0.5;
      const sway = (rnd(j + 3, seed) - 0.5) * 40;
      frays.push(`M ${f(bx - dir[0] * 10)} ${f(by - dir[1] * 10)} Q ${f(bx + dir[0] * len * 0.5 + nx * sway)} ${f(by + dir[1] * len * 0.5 + ny * sway)} ${f(bx + dir[0] * len + nx * sway * 0.4)} ${f(by + dir[1] * len + ny * sway * 0.4)}`);
    });
  });
  return (
    <g>
      {frays.map((d) => <path key={'o' + d} d={d} stroke={INK} strokeWidth={18} strokeLinecap="round" fill="none" />)}
      {frays.map((d) => <path key={'f' + d} d={d} stroke={fill} strokeWidth={12} strokeLinecap="round" fill="none" />)}
      <Shape d={tb.d} fill={fill} shadow={2}>
        {stripes.map((d) => <path key={d} d={d} stroke={shade(fill, 0.08)} strokeWidth={7} fill="none" />)}
        {nuclei.map((d) => <path key={d} d={d} fill={tint(NUC, 0.1)} {...EDGE_IN} />)}
      </Shape>
    </g>
  );
};
/** A capillary: a wall band with its lumen (red cells, the cast figure, ride in it; place them yourself). */
const Capillary: React.FC<{pts: P[]; w: number}> = ({pts, w}) => {
  const wall = tube(pts, [w, w], ['cut', 'cut'], 14);
  const lumen = tube(pts, [w * 0.66, w * 0.66], ['cut', 'cut'], 14);
  return (
    <g>
      <path d={wall.d} fill={VESSEL} {...EDGE_IN} />
      <path d={lumen.d} fill={LUMEN} {...EDGE_IN} />
    </g>
  );
};
/** An axon with its myelin sleeve as soft sausage segments; the bare axon shows at the gaps. */
const Axon: React.FC<{pts: P[]; w: number; seg?: number; stopAt?: number}> = ({pts, w, seg = 11, stopAt = 1}) => {
  const core = tube(pts, [w * 0.55, w * 0.55], ['cut', 'round'], 18);
  const n = core.c.length;
  const last = Math.floor((n - 1) * stopAt);
  const segs: string[] = [];
  for (let i = 0; i + seg <= last; i += seg + 2) segs.push(tube(core.c.slice(i, i + seg + 1), [w, w], ['round', 'round'], 1).d);
  return (
    <g>
      <Shape d={core.d} fill={NERVE} shadow={1.5} />
      {segs.map((d) => <Shape key={d} d={d} fill={MYELIN} shadow={2.2} />)}
    </g>
  );
};
/** A receptor socket on the nerve ending: a little gold lock with a keyhole. */
const Lock: React.FC<{x: number; y: number; s: number}> = ({x, y, s}) => {
  const h = s * 1.1;
  const body = `M ${x - s / 2 + 6} ${y - h / 2} L ${x + s / 2 - 6} ${y - h / 2} Q ${x + s / 2} ${y - h / 2} ${x + s / 2} ${y - h / 2 + 6} L ${x + s / 2 - 2} ${y + h / 2 - 6} Q ${x + s / 2 - 2} ${y + h / 2} ${x + s / 2 - 8} ${y + h / 2} L ${x - s / 2 + 8} ${y + h / 2} Q ${x - s / 2 + 2} ${y + h / 2} ${x - s / 2 + 2} ${y + h / 2 - 6} L ${x - s / 2} ${y - h / 2 + 6} Q ${x - s / 2} ${y - h / 2} ${x - s / 2 + 6} ${y - h / 2} Z`;
  const r = s * 0.15;
  return (
    <g>
      <Shape d={body} fill={LOCK} shadow={0.8} />
      <path d={`M ${x - r} ${y - h * 0.1} A ${r} ${r} 0 1 1 ${x + r} ${y - h * 0.1} L ${x + r * 0.7} ${y + h * 0.28} L ${x - r * 0.7} ${y + h * 0.28} Z`} fill={FLESH.deep} {...EDGE_IN} />
    </g>
  );
};
/** A mitochondrion: a bean with one wavy inner fold line. */
const Mito: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number; seed?: number; fill?: string}> = ({x, y, rx, ry, rot = 0, seed = 1, fill = MITO}) => {
  const r = (rot * Math.PI) / 180;
  const pt = (u: number, v: number): P => [x + u * Math.cos(r) - v * Math.sin(r), y + u * Math.sin(r) + v * Math.cos(r)];
  const fold: P[] = [];
  for (let i = 0; i <= 8; i++) fold.push(pt(-rx * 0.7 + (rx * 1.4 * i) / 8, (i % 2 ? -1 : 1) * ry * 0.45));
  return (
    <Shape d={lobe(x, y, rx, ry, seed, 9, rot)} fill={fill} shadow={Math.max(0.5, rx / 70)}>
      <path d={open(fold)} {...INLINE} />
    </Shape>
  );
};
/** A drop of dog saliva: pointed tail toward `rot` degrees (0 = tail up). r = its round half width. */
const SpitDrop: React.FC<{x: number; y: number; r: number; rot?: number}> = ({x, y, r, rot = 0}) => {
  const d = `M 0 ${-r * 1.7} C ${r * 0.35} ${-r * 1.05} ${r} ${-r * 0.55} ${r} ${r * 0.12} C ${r} ${r * 0.7} ${r * 0.52} ${r} 0 ${r} C ${-r * 0.55} ${r} ${-r} ${r * 0.68} ${-r} ${r * 0.1} C ${-r} ${-r * 0.55} ${-r * 0.32} ${-r * 1.08} 0 ${-r * 1.7} Z`;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><Shape d={d} fill={SPIT} shadow={Math.max(0.4, r / 22)} /></g>;
};
/** A flat drop of saliva the Virus surfs on. */
const SpitRaft: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => {
  const h = w * 0.3;
  const d = loop([[-w / 2, 0], [-w * 0.36, -h * 0.55], [-w * 0.1, -h * 0.62], [w * 0.2, -h * 0.58], [w * 0.44, -h * 0.35], [w / 2, h * 0.05], [w * 0.36, h * 0.45], [0, h * 0.5], [-w * 0.38, h * 0.4]]);
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><Shape d={d} fill={SPIT} shadow={2} /></g>;
};

// =================================================================== the places
export type MicroView = 'wound' | 'junction' | 'axon' | 'tissue';

// ---- junction: the nerve ending on a muscle fibre, its locks in a row
export const JUNCTION = {
  foot: [650, 920, 250, 128] as C,
  locks: [548, 618, 688, 758] as number[],
  lockY: 978,
};
const Junction: React.FC = () => {
  const [fx, fy, frx, fry] = JUNCTION.foot;
  return (
    <>
      <Layer>
        <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={FLUID} />
        {/* back plane: small cells and a far muscle fibre */}
        <BackCells seed={3} cells={[[560, 230, 120, 95], [790, 260, 110, 90], [1010, 330, 100, 110], [470, 470, 95, 80], [690, 470, 80, 70], [60, 700, 100, 120], [990, 620, 90, 80], [-10, 1060, 90, 100], [1060, 1340, 80, 90], [140, 1880, 150, 110], [520, 1900, 160, 100], [920, 1860, 150, 110]]} />
        <BackCells seed={13} cells={[[100, 1420, 110, 85], [330, 1450, 100, 80], [560, 1430, 115, 85], [790, 1460, 105, 80], [1010, 1430, 100, 90], [230, 1640, 105, 80], [460, 1660, 100, 78], [700, 1640, 110, 82], [930, 1660, 100, 80]]} />
        {/* mid plane: the muscle fibre the nerve sits on, and a big neighbour cell */}
        <MidCell c={[1060, 700, 200, 230]} seed={21} nuc={[30, -20, 80]} />
        <Fibre pts={[[-80, 1150], [320, 1110], [720, 1130], [1160, 1090]]} w={330} seed={4} />
        {/* the axon comes in from the far top right, in its myelin sleeve, and ends in a rounded foot */}
        <Axon pts={[[930, -80], [900, 240], [830, 520], [740, 740], [670, 860]]} w={132} />
        <Shape d={lobe(fx, fy, frx, fry, 33, 10)} fill={NERVE} shadow={3}>
          {/* tiny vesicles of messenger inside the foot */}
          {[[-120, -30, 13], [-60, -50, 11], [10, -40, 14], [80, -55, 10], [140, -20, 12]].map(([dx, dy, r]) => <path key={dx} d={lobe(fx + dx, fy + dy, r, r, dx, 7)} fill={tint(NERVE, 0.5)} {...EDGE_IN} />)}
        </Shape>
        {JUNCTION.locks.map((x) => <Lock key={x} x={x} y={JUNCTION.lockY} s={54} />)}
      </Layer>
    </>
  );
};
const JunctionFront: React.FC = () => (
  <Layer>
    <FrontCell c={[-120, 1930, 420, 300]} seed={51} nuc={[150, -120, 90]} />
    <FrontCell c={[1200, 1380, 260, 380]} seed={52} />
  </Layer>
);

// ---- wound: just under a tooth puncture; the fang tip through torn skin, saliva, torn muscle fibres
const SKIN_TOP = 300;
const Wound: React.FC = () => {
  return (
    <Layer>
      <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={FLUID} />
      <rect x={0} y={0} width={SCENE_W} height={SKIN_TOP + 20} fill={AIR} />
      {/* back plane: small cells and far fibres, a capillary crossing behind */}
      <BackCells seed={9} cells={[[100, 640, 110, 80], [860, 620, 120, 85], [300, 1520, 130, 90], [760, 1560, 140, 95], [1030, 1420, 90, 100], [60, 1300, 80, 90]]} />
      <Fibre back pts={[[-60, 690], [500, 672], [1140, 700]]} w={120} />
      <BackCells seed={19} cells={[[120, 1460, 105, 80], [350, 1500, 100, 78], [580, 1470, 110, 82], [820, 1500, 105, 80], [1040, 1470, 95, 82], [240, 1690, 105, 80], [480, 1700, 100, 76], [720, 1690, 108, 80]]} />
      <Capillary pts={[[-60, 1230], [400, 1290], [760, 1300], [1140, 1360]]} w={120} />
    </Layer>
  );
};
/** The middle plane of the wound: the skin bricks, the torn fibres, the fang tip and the saliva. */
const WoundMid: React.FC = () => {
  const rows: [number, number, number][] = [[SKIN_TOP, 40, 150], [SKIN_TOP + 44, 82, 170], [SKIN_TOP + 130, 92, 160]];
  const cells: {d: string; n?: string}[] = [];
  rows.forEach(([y, h, w], r) => {
    for (let x = -60 + (r % 2) * 70; x < 1140; x += w) {
      const cx = x + w / 2;
      const gap = r === 2 ? [360, 720] : [400, 690];
      if (cx > gap[0] && cx < gap[1]) continue;
      cells.push({d: lobe(cx, y + h / 2, w / 2 - 3, h / 2 - 2, r * 50 + x, 10), n: r ? lobe(cx + 12, y + h / 2, 17, 12, x + r, 7) : undefined});
    }
  });
  return (
    <Layer>
      {/* torn muscle fibres: one whole above, one torn across the middle, one whole below */}
      <Fibre pts={[[-80, 830], [380, 810], [760, 850], [1160, 820]]} w={200} seed={11} />
      <Fibre pts={[[-80, 1080], [180, 1060], [395, 1075]]} w={210} ends={['cut', 'torn']} seed={12} />
      <Fibre pts={[[700, 1090], [920, 1110], [1160, 1080]]} w={210} ends={['torn', 'cut']} seed={13} />
      {/* the skin's brick cells, torn open */}
      {cells.map((c, i) => (
        <Shape key={i} d={c.d} fill={SKINCELL} shadow={1.2}>
          {c.n && <path d={c.n} fill={tint(NUC, 0.25)} {...EDGE_IN} />}
        </Shape>
      ))}
      {/* saliva clinging round the fang tip (drawn behind the tooth) and pouring off it into the tissue */}
      <Shape d={loop([[452, 300], [520, 330], [640, 300], [662, 420], [628, 540], [600, 640], [584, 720], [560, 800], [536, 730], [510, 650], [470, 560], [436, 430]])} fill={SPIT} shadow={2.5} />
      {/* the TIP of the dog's fang, enormous at this scale */}
      <Shape d="M 330 -40 C 350 140 420 360 520 590 C 530 610 552 612 560 592 C 640 400 720 170 770 -40 Z" fill={FANG} shadow={5}>
        <path d="M 420 -40 C 436 120 474 280 520 420" {...INLINE} />
      </Shape>
    </Layer>
  );
};
const WoundFront: React.FC = () => (
  <Layer>
    <FrontCell c={[-140, 1900, 420, 320]} seed={61} nuc={[170, -110, 80]} />
    <FrontCell c={[1220, 1700, 260, 360]} seed={62} />
  </Layer>
);

// ---- axon: inside the nerve fibre, a long tunnel with rails running away to the far end
export const AXON = {vp: [560, 560] as P, rails: [[230, 2000], [545, 2000], [860, 2000]] as P[]};
/** Mix two colours (t = 0 gives a, 1 gives b): for the flat steps of the tunnel going into the distance. */
const mix = (a: string, b: string, t: number) => {
  const h = (c: string) => [1, 3, 5].map((k) => parseInt(c.slice(k, k + 2), 16));
  const [x, y] = [h(a), h(b)];
  return '#' + x.map((v, k) => Math.round(v + (y[k] - v) * t).toString(16).padStart(2, '0')).join('');
};
const TUNNEL_NEAR = tint(NERVE, 0.25); // the near wall: light nerve cream
const TUNNEL_FAR = '#8a5a55'; // the far end: deep brown-rose
const RAIL_TAN = '#b8845e'; // the rails: a mid tan, clearly visible on every step
const AxonInside: React.FC = () => {
  const [vx, vy] = AXON.vp;
  // the tube's wall as nested hoops: small, far and dark at the vanishing point; big, near and light at
  // the bottom. Each hoop one flat step darker and warmer than the one before it.
  const N = 7;
  const hoops = Array.from({length: N}, (_, k) => {
    const t = k / (N - 1);
    const r = [46, 82, 145, 245, 380, 560, 1000][k]; // sized so no ring edge crosses the tag zone (y 290..370)
    const cx = vx + (540 - vx) * t, cy = vy + (1230 - vy) * Math.pow(t, 1.4);
    return {cx, cy, rx: r, ry: r * 1.18, k, fill: mix(TUNNEL_NEAR, TUNNEL_FAR, (N - 1 - k) / (N - 1))};
  }).reverse();
  return (
    <Layer>
      {/* outside the last hoop: the near wall, with the myelin wraps hinted at the corners */}
      <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={tint(TUNNEL_NEAR, 0.3)} />
      {[1.3, 1.2].map((s2, i) => <path key={s2} d={lobe(540, 1230, 1380 * s2 * 0.62, 1380 * s2 * 0.73, 70 + i, 12)} {...INLINE} />)}
      {hoops.map(({cx, cy, rx, ry, k, fill}) => <path key={k} d={lobe(cx, cy, rx, ry, 80 + k, 12)} fill={fill} {...EDGE_IN} />)}
      {/* the far cell body, small, at the vanishing point */}
      <path d={lobe(vx, vy, 26, 30, 99, 8)} fill={shade(TUNNEL_FAR, 0.25)} {...EDGE_IN} />
      {/* small vesicles and mitochondria along the way, smaller further off */}
      {[[640, 640, 7], [470, 700, 9], [700, 820, 12], [380, 900, 14], [880, 1300, 22], [180, 1180, 20], [760, 1640, 28]].map(([x, y, r], i) => <path key={i} d={lobe(x, y, r, r, i + 3, 7)} fill={tint(TUNNEL_NEAR, 0.5)} {...EDGE_IN} />)}
      <Mito x={660} y={700} rx={30} ry={12} rot={40} seed={2} />
      <Mito x={440} y={760} rx={44} ry={17} rot={-50} seed={3} />
      <Mito x={850} y={1000} rx={92} ry={36} rot={60} seed={4} />
      <Mito x={190} y={1420} rx={130} ry={50} rot={-62} seed={5} />
      {/* the rails (microtubules) running from near to far, thinner into the distance */}
      {AXON.rails.map((end, i) => {
        const pts: P[] = [end, [end[0] + (vx - end[0]) * 0.45, 2000 + (vy - 2000) * 0.45], [vx + (end[0] - vx) * 0.1, vy + 50]];
        const tb = tube(pts, [40, 20, 7], ['cut', 'round'], 20);
        const ticks: string[] = [];
        for (let j = 3; j < tb.c.length - 8; j += 3) ticks.push(`M ${f(tb.L[j][0])} ${f(tb.L[j][1])} L ${f(tb.R[j][0])} ${f(tb.R[j][1])}`);
        return (
          <Shape key={i} d={tb.d} fill={RAIL_TAN} shadow={0.8}>
            {ticks.map((d) => <path key={d} d={d} {...INLINE} />)}
          </Shape>
        );
      })}
    </Layer>
  );
};
const AxonFront: React.FC = () => (
  <Layer>
    <Mito x={1020} y={1880} rx={260} ry={110} rot={-30} seed={7} fill={shade(MITO, 0.14)} />
  </Layer>
);
/** The little motor that walks the rail, carrying the Virus (frame pixels; x, y = where its feet stand). */
const Carrier: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    {/* two little legs walking up the rail: the back foot at (x, y), the front foot a step further up it */}
    <TinyLeg from={[x - 34, y - 112]} to={[x - 10, y - 4]} fill={CARRIER} w={13} foot={-1} />
    <TinyLeg from={[x + 34, y - 112]} to={[x + 12, y - 62]} fill={CARRIER} w={13} />
    <Shape d={lobe(x, y - 142, 92, 40, 5, 10)} fill={CARRIER} shadow={1.6} />
  </g>
);

// ---- tissue: the fluid-filled space between cells, a capillary passing behind
const Tissue: React.FC = () => (
  <Layer>
    <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={FLUID} />
    <BackCells seed={30} cells={[[140, 260, 120, 90], [420, 230, 110, 80], [700, 250, 120, 90], [960, 230, 110, 95], [300, 1360, 110, 90], [780, 1380, 120, 90], [540, 1600, 130, 90], [100, 1700, 100, 90], [1000, 1700, 110, 90]]} />
    <Capillary pts={[[-60, 520], [300, 470], [700, 500], [1140, 450]]} w={170} />
  </Layer>
);
const TissueMid: React.FC = () => (
  <Layer>
    <MidCell c={[-40, 900, 280, 330]} seed={41} nuc={[90, -40, 92]} />
    <MidCell c={[1120, 880, 270, 320]} seed={42} nuc={[-90, 20, 90]} />
    <MidCell c={[120, 1530, 290, 210]} seed={43} nuc={[70, -30, 80]} />
    <MidCell c={[980, 1560, 300, 220]} seed={44} nuc={[-80, -30, 82]} />
  </Layer>
);
const TissueFront: React.FC = () => (
  <Layer>
    <FrontCell c={[-160, 1960, 430, 320]} seed={71} nuc={[180, -120, 80]} />
    <FrontCell c={[1230, 140, 280, 300]} seed={72} />
  </Layer>
);

/** The background of a micro place (everything behind the characters). */
export const MicroPlace: React.FC<{view: MicroView}> = ({view}) => {
  if (view === 'junction') return <Junction />;
  if (view === 'axon') return <AxonInside />;
  if (view === 'tissue') return <><Tissue /><RedCells at={[[180, 492, -4], [560, 486, 2], [930, 470, -6]]} /><TissueMid /></>;
  return <><Wound /><RedCells at={[[200, 1268, 6], [620, 1300, 2]]} /><WoundMid /></>;
};
/** The near plane of a micro place: big cell edges cropped by the corners (draw after the characters). */
export const MicroFront: React.FC<{view: MicroView}> = ({view}) =>
  view === 'junction' ? <JunctionFront /> : view === 'axon' ? <AxonFront /> : view === 'tissue' ? <TissueFront /> : <WoundFront />;
/** Small red cells (the cast figure) passing along a capillary. */
const RedCells: React.FC<{at: [number, number, number][]}> = ({at}) => (
  <>{at.map(([x, y, r]) => <Put key={x} x={x} y={y} size={96} rot={r}><RedCell mood="open" mouth="flat" look={[0.8, 0]} /></Put>)}</>
);

// =================================================================== the five storyboard frames
/** A: the hook. The Virus, big and angry, key raised before the nerve ending's locks; it dreams of the brain. */
export const V8SceneA: React.FC = () => (
  <Scene bg={FLUID}>
    <MicroPlace view="junction" />
    <Put x={330} y={800} size={440}><Virus mood="angry" mouth="grit" look={[0.6, 0.3]} /></Put>
    <MicroFront view="junction" />
    <Layer><Bubble x={300} y={400} w={330} h={250} tx={300} ty={598} /></Layer>
    <Put x={296} y={398} size={200}><Brain mood="scared" mouth="wavy" look={[0.2, 0.8]} /></Put>
  </Scene>
);

/** B: that morning. The fang tip through the skin, a pour of saliva; the Virus surfs in between torn fibres. */
export const V8SceneB: React.FC = () => (
  <Scene bg={FLUID}>
    <MicroPlace view="wound" />
    <Layer>
      <SpitDrop x={630} y={850} r={15} rot={20} />
      <SpitDrop x={452} y={900} r={18} rot={-20} />
      <SpitDrop x={700} y={980} r={22} rot={25} />
      <SpitRaft x={548} y={1092} w={260} rot={-8} />
    </Layer>
    <Put x={548} y={986} size={250} rot={-4}><Virus mood="wink" mouth="smile" look={[0.6, 0.5]} /></Put>
    <MicroFront view="wound" />
    <Label x={230} y={236} text="That morning" />
  </Scene>
);

/** M2: the long way. Inside the axon; the Virus, smug, rides a little carrier up a rail into the distance. */
export const V8SceneM2: React.FC = () => (
  <Scene bg={AXO}>
    <MicroPlace view="axon" />
    <Layer><Carrier x={552} y={1340} /></Layer>
    <Put x={552} y={1064} size={280}><Virus mood="bored" look={[0.1, -0.8]} /></Put>
    <MicroFront view="axon" />
    <Tag x={540} y={330} text="2-3 months" />
  </Scene>
);

/** E: after the vaccine. Antibodies stand before the locks; two have grabbed the Virus by its spikes. */
export const V8SceneE: React.FC = () => {
  const vx = 300, vy = 700, k = 1.7; // the Virus (size 340)
  const ball = (deg: number): P => { const r = (deg * Math.PI) / 180; return [vx + Math.cos(r) * 65 * k, vy + (-4 + Math.sin(r) * 65) * k]; };
  const [rbx, rby] = ball(54), [lbx, lby] = ball(128);
  return (
    <Scene bg={FLUID}>
      <MicroPlace view="junction" />
      <Put x={985} y={620} size={250}><Vaccine mood="happy" mouth="smile" /></Put>
      <Put x={vx} y={vy} size={340}><Virus mood="dizzy" mouth="o" /></Put>
      {/* the wall in front of the locks */}
      {[585, 715, 845].map((x, i) => <Put key={x} x={x} y={1010 + (i % 2) * 10} size={190}><Antibody color={CLOTH.teal} mood="angry" mouth={i === 1 ? 'grit' : 'flat'} look={[-0.7, -0.2]} /></Put>)}
      {/* two have grabbed its lower spikes with their Y hands (hand tips sit on the spike balls) */}
      <Put x={rbx + 78} y={rby + 70} size={200}><Antibody color={CLOTH.teal} mood="angry" mouth="grit" look={[-0.6, -0.6]} /></Put>
      <Put x={lbx - 78} y={lby + 70} size={200}><Antibody color={CLOTH.teal} mood="angry" mouth="flat" look={[0.6, -0.6]} /></Put>
      <Put x={170} y={1190} size={240}><Vaccine mood="open" mouth="big" look={[0.6, -0.4]} /></Put>
      <MicroFront view="junction" />
      <Label x={250} y={250} text="After the vaccine" />
    </Scene>
  );
};

/** M3: caught. Two White cells hold the Virus by its top spikes, Antibodies stuck on it; one angry in front. */
export const V8SceneM3: React.FC = () => {
  const vx = 540, vy = 820, k = 1.5; // the Virus (size 300)
  const ball = (deg: number): P => { const r = (deg * Math.PI) / 180; return [vx + Math.cos(r) * 65 * k, vy + (-4 + Math.sin(r) * 65) * k]; };
  const [ax, ay] = ball(-166), [bx, by] = ball(54);
  return (
    <Scene bg={FLUID}>
      <MicroPlace view="tissue" />
      <Put x={vx} y={vy} size={300}><Virus mood="sad" mouth="frown" look={[0, 0.5]} /></Put>
      {/* two Antibodies stuck on its spikes (their hand tips on the spike balls) */}
      <Put x={ax - 47} y={ay + 42} size={120}><Antibody color={CLOTH.teal} mood="open" mouth="flat" look={[0.6, -0.4]} /></Put>
      <Put x={bx + 47} y={by + 42} size={120}><Antibody color={CLOTH.teal} mood="open" mouth="flat" look={[-0.6, -0.4]} /></Put>
      <Put x={341} y={645} size={340} flip><WhiteCell mood="angry" mouth="flat" look={[0.5, 0.6]} /></Put>
      <Put x={739} y={645} size={340}><WhiteCell mood="angry" mouth="flat" look={[-0.5, 0.6]} /></Put>
      <Put x={540} y={1170} size={400}><WhiteCell mood="angry" mouth="grit" look={[0, -0.2]} /></Put>
      <MicroFront view="tissue" />
    </Scene>
  );
};

// =================================================================== the empty places, for checking
const Empty: React.FC<{view: MicroView}> = ({view}) => (
  <Scene bg={view === 'axon' ? AXO : FLUID}><MicroPlace view={view} /><MicroFront view={view} /></Scene>
);
export const V8PlaceWound: React.FC = () => <Empty view="wound" />;
export const V8PlaceJunction: React.FC = () => <Empty view="junction" />;
export const V8PlaceAxon: React.FC = () => <Empty view="axon" />;
export const V8PlaceTissue: React.FC = () => <Empty view="tissue" />;
