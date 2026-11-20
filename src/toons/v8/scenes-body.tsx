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
import {IconBadge} from './hud';
import {Vaccine, Virus} from './germs';
import {Antibody, RedCell, WhiteCell} from './cells';
import {Brain} from './organs-a';
import {blink, bodyFace, talk, clamp01, go, lerp, pop, since, sway, type Focus, type LineNow, type ShotDef, type ShotNow, type Word} from './play';

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
const Lock: React.FC<{x: number; y: number; s: number; glint?: boolean}> = ({x, y, s, glint}) => {
  const h = s * 1.1;
  const body = `M ${x - s / 2 + 6} ${y - h / 2} L ${x + s / 2 - 6} ${y - h / 2} Q ${x + s / 2} ${y - h / 2} ${x + s / 2} ${y - h / 2 + 6} L ${x + s / 2 - 2} ${y + h / 2 - 6} Q ${x + s / 2 - 2} ${y + h / 2} ${x + s / 2 - 8} ${y + h / 2} L ${x - s / 2 + 8} ${y + h / 2} Q ${x - s / 2 + 2} ${y + h / 2} ${x - s / 2 + 2} ${y + h / 2 - 6} L ${x - s / 2} ${y - h / 2 + 6} Q ${x - s / 2} ${y - h / 2} ${x - s / 2 + 6} ${y - h / 2} Z`;
  const r = s * 0.15;
  return (
    <g>
      <Shape d={body} fill={glint ? tint(LOCK, 0.6) : LOCK} shadow={0.8} />
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

// =================================================================== the places (each split into its depth planes)
export type MicroView = 'wound' | 'junction' | 'axon' | 'tissue';

/** The body's heartbeat, 0..1: a double thump (lub-dub) about 75 times a minute. */
const beat = (t: number) => {
  const u = (t * 1.25) % 1;
  const thump = (c: number, w: number) => Math.max(0, 1 - Math.abs(u - c) / w);
  return Math.max(thump(0.06, 0.07), thump(0.24, 0.06) * 0.6);
};
/** One depth plane: everything inside moves together by (dx, dy) frame pixels. With `pulse` (the shot's
 * time) the plane swells a hair on every heartbeat, so the tissue looks alive. */
const Plane: React.FC<{d: P; pulse?: number; children: React.ReactNode}> = ({d, pulse, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, transformOrigin: '540px 960px', transform: `translate(${f(d[0])}px, ${f(d[1])}px)${pulse === undefined ? '' : ` scale(${(1 + beat(pulse) * 0.012).toFixed(4)})`}`}}>{children}</div>
);

/**
 * The life of the fluid between cells: specks, little protein strands and tiny bubbles drifting with the
 * current at their own speeds, a few big soft ones close to the lens (`near`). Flat colour, kit outline.
 */
export const MicroLife: React.FC<{t: number; seed?: number; near?: boolean; flow?: P}> = ({t, seed = 1, near, flow = [18, -26]}) => {
  const n = near ? 6 : 26;
  return (
    <Layer>
      {Array.from({length: n}, (_, i) => {
        const r0 = rnd(i, seed), r1 = rnd(i + 40, seed), r2 = rnd(i + 80, seed);
        const sp = (near ? 2.2 : 0.6 + r2 * 0.9);
        const x = (((r0 * 1300 + t * flow[0] * sp + sway(t, 3 + r1 * 3, i) * 14) % 1300) + 1300) % 1300 - 110;
        const y = (((r1 * 2100 + t * flow[1] * sp) % 2100) + 2100) % 2100 - 90;
        const k = near ? 30 + r2 * 26 : 4 + r2 * 9;
        const kind = i % 4;
        const fill = kind === 1 ? tint(FLESH.butter, 0.5) : kind === 2 ? tint(FLESH.coral, 0.45) : tint(FLUID, 0.45);
        const rot = t * (20 + r0 * 40) * (i % 2 ? 1 : -1);
        if (kind === 3 && !near) return <path key={i} transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`} d={`M ${-k * 1.6} 0 Q ${-k * 0.5} ${-k} 0 0 T ${k * 1.6} 0`} stroke={shade(FLUID, 0.1)} strokeWidth={3} strokeLinecap="round" fill="none" />;
        return <ellipse key={i} cx={f(x)} cy={f(y)} rx={f(k)} ry={f(k * (0.75 + r1 * 0.25))} transform={`rotate(${f(rot)} ${f(x)} ${f(y)})`} fill={fill} opacity={near ? 0.55 : 0.9} {...(near ? {} : EDGE_IN)} />;
      })}
    </Layer>
  );
};
/** The slow float of the three planes (a camera drifting in fluid): back a little, front more. */
const drift = (t: number) => {
  const x = sway(t, 9, 1), y = sway(t, 11.5, 2);
  return {back: [x * 3, y * 2] as P, mid: [x * 6, y * 4] as P, front: [x * 13, y * 9] as P};
};
/** Small red cells (the cast figure) drifting along a capillary: y(x) follows the vessel's line. */
const RedCells: React.FC<{t: number; xs: number[]; y: (x: number) => number; speed?: number}> = ({t, xs, y, speed = 46}) => (
  <>
    {xs.map((x0, i) => {
      const x = ((x0 + t * speed + 160) % 1400) - 160;
      return <Put key={i} x={x} y={y(x) + sway(t, 1.7, i) * 3} size={96} rot={sway(t, 2.3, i + 4) * 6}><RedCell mood="open" mouth="flat" look={[0.8, 0]} /></Put>;
    })}
  </>
);

// ---- junction: the nerve ending on a muscle fibre, its locks in a row
export const JUNCTION = {foot: [650, 920, 250, 128] as C, locks: [548, 618, 688, 758] as number[], lockY: 978};
const JunctionBack: React.FC = () => (
  <Layer>
    <rect x={-40} y={-40} width={SCENE_W + 80} height={SCENE_H + 80} fill={FLUID} />
    <BackCells seed={3} cells={[[560, 230, 120, 95], [790, 260, 110, 90], [1010, 330, 100, 110], [470, 470, 95, 80], [690, 470, 80, 70], [60, 700, 100, 120], [990, 620, 90, 80], [-10, 1060, 90, 100], [1060, 1340, 80, 90], [140, 1880, 150, 110], [520, 1900, 160, 100], [920, 1860, 150, 110]]} />
    <BackCells seed={13} cells={[[100, 1420, 110, 85], [330, 1450, 100, 80], [560, 1430, 115, 85], [790, 1460, 105, 80], [1010, 1430, 100, 90], [230, 1640, 105, 80], [460, 1660, 100, 78], [700, 1640, 110, 82], [930, 1660, 100, 80]]} />
  </Layer>
);
/** glint: which lock flicks lighter now (-1 = none). */
const JunctionMid: React.FC<{glint?: number}> = ({glint = -1}) => {
  const [fx, fy, frx, fry] = JUNCTION.foot;
  return (
    <Layer>
      <MidCell c={[1060, 700, 200, 230]} seed={21} nuc={[30, -20, 80]} />
      <Fibre pts={[[-80, 1150], [320, 1110], [720, 1130], [1160, 1090]]} w={330} seed={4} />
      <Axon pts={[[930, -80], [900, 240], [830, 520], [740, 740], [670, 860]]} w={132} />
      <Shape d={lobe(fx, fy, frx, fry, 33, 10)} fill={NERVE} shadow={3}>
        {[[-120, -30, 13], [-60, -50, 11], [10, -40, 14], [80, -55, 10], [140, -20, 12]].map(([dx, dy, r]) => <path key={dx} d={lobe(fx + dx, fy + dy, r, r, dx, 7)} fill={tint(NERVE, 0.5)} {...EDGE_IN} />)}
      </Shape>
      {JUNCTION.locks.map((x, i) => <Lock key={x} x={x} y={JUNCTION.lockY} s={54} glint={i === glint} />)}
    </Layer>
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
const woundVessel = (x: number) => 1236 + ((x + 60) / 1200) * 118 + Math.sin((x + 60) / 380) * 18;
const WoundBack: React.FC<{t: number}> = ({t}) => (
  <>
    <Layer>
      <rect x={-40} y={-40} width={SCENE_W + 80} height={SCENE_H + 80} fill={FLUID} />
      <rect x={-40} y={-40} width={SCENE_W + 80} height={SKIN_TOP + 60} fill={AIR} />
      <BackCells seed={9} cells={[[100, 640, 110, 80], [860, 620, 120, 85], [300, 1520, 130, 90], [760, 1560, 140, 95], [1030, 1420, 90, 100], [60, 1300, 80, 90]]} />
      <Fibre back pts={[[-60, 690], [500, 672], [1140, 700]]} w={120} />
      <BackCells seed={19} cells={[[120, 1460, 105, 80], [350, 1500, 100, 78], [580, 1470, 110, 82], [820, 1500, 105, 80], [1040, 1470, 95, 82], [240, 1690, 105, 80], [480, 1700, 100, 76], [720, 1690, 108, 80]]} />
      <Capillary pts={[[-60, 1230], [400, 1290], [760, 1300], [1140, 1360]]} w={120} />
    </Layer>
    <RedCells t={t} xs={[200, 640, 1060]} y={woundVessel} />
  </>
);
const SKIN_CELLS = (() => {
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
  return cells;
})();
/** The fang tip and the saliva clinging to it, moved down by `dy` (0 = in the wound). */
const Fang: React.FC<{dy: number}> = ({dy}) => (
  <g transform={`translate(0 ${f(dy)})`}>
    <Shape d={loop([[452, 300], [520, 330], [640, 300], [662, 420], [628, 540], [600, 640], [584, 720], [560, 800], [536, 730], [510, 650], [470, 560], [436, 430]])} fill={SPIT} shadow={2.5} />
    <Shape d="M 330 -400 C 330 -200 350 140 420 360 C 450 450 490 520 520 590 C 530 610 552 612 560 592 C 640 400 720 170 770 -400 Z" fill={FANG} shadow={5}>
      <path d="M 420 -400 C 420 -100 440 140 474 280 C 490 340 505 380 520 420" {...INLINE} />
    </Shape>
  </g>
);
/** The middle plane of the wound: torn fibres and skin bricks. The fang is drawn by the shot (it moves). */
const WoundMid: React.FC = () => (
  <Layer>
    <Fibre pts={[[-80, 830], [380, 810], [760, 850], [1160, 820]]} w={200} seed={11} />
    <Fibre pts={[[-80, 1080], [180, 1060], [395, 1075]]} w={210} ends={['cut', 'torn']} seed={12} />
    <Fibre pts={[[700, 1090], [920, 1110], [1160, 1080]]} w={210} ends={['torn', 'cut']} seed={13} />
    {SKIN_CELLS.map((c, i) => (
      <Shape key={i} d={c.d} fill={SKINCELL} shadow={1.2}>
        {c.n && <path d={c.n} fill={tint(NUC, 0.25)} {...EDGE_IN} />}
      </Shape>
    ))}
  </Layer>
);
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
const RINGS = 7; // depth steps from the far end (0) to the nearest ring (7)
/** A ring of the tunnel at depth u (0 = far end, RINGS = near): its centre, radii and flat tone. */
const ringAt = (u: number) => {
  const [vx, vy] = AXON.vp;
  const k = Math.max(0, u) / (RINGS - 1);
  const r = 46 * Math.pow(1.78, u);
  const cx = vx + (540 - vx) * Math.min(1, k), cy = vy + (1230 - vy) * Math.pow(Math.min(1.25, k), 1.4);
  const tone = mix(TUNNEL_NEAR, TUNNEL_FAR, Math.max(0, Math.min(1, 1 - u / (RINGS - 1))));
  return {cx, cy, rx: r, ry: r * 1.18, tone};
};
/** The tunnel at time t: the rings slowly grow toward us and new ones open at the far end (a seamless loop). */
const AxonTunnel: React.FC<{t: number; speed?: number}> = ({t, speed = 0.28}) => {
  const [vx, vy] = AXON.vp;
  const ph = (t * speed) % 1;
  const us = Array.from({length: RINGS + 1}, (_, k) => k + ph).reverse();
  // things drifting past: [angle, depth offset, kind (0 vesicle, 1 mitochondrion), size, turn]
  const items: [number, number, number, number, number][] = [
    [200, 0.3, 1, 1, 40], [-30, 1.4, 1, 0.9, -50], [140, 2.6, 0, 1, 0], [20, 3.2, 1, 1.1, 60], [250, 4.1, 0, 1.2, 0],
    [100, 4.9, 0, 0.8, 0], [-60, 5.6, 1, 1, -62], [170, 6.3, 0, 1, 0], [300, 2.0, 0, 0.9, 0],
  ];
  return (
    <Layer>
      <rect x={-40} y={-40} width={SCENE_W + 80} height={SCENE_H + 80} fill={ringAt(RINGS).tone} />
      {us.map((u) => {
        const g = ringAt(u);
        const id = (((Math.round(u - ph) - Math.floor(t * speed)) % 8) + 8) % 8; // the same ring keeps its shape as it grows
        return <path key={u.toFixed(3)} d={lobe(g.cx, g.cy, g.rx, g.ry, 80 + id, 12)} fill={g.tone} {...EDGE_IN} />;
      })}
      <path d={lobe(vx, vy, 26, 30, 99, 8)} fill={shade(TUNNEL_FAR, 0.25)} {...EDGE_IN} />
      {items.map(([ang, u0, kind, size, turn], i) => {
        const u = (u0 + t * speed) % RINGS;
        const g = ringAt(u);
        const a = (ang * Math.PI) / 180;
        if (u > 5.8) return null; // by then it has drifted out of the frame
        const x = g.cx + Math.cos(a) * g.rx * 0.8, y = g.cy + Math.sin(a) * g.ry * 0.8;
        const s = Math.min(2.2, (g.rx / 240) * size);
        if (kind === 1) return <Mito key={i} x={x} y={y} rx={60 * s} ry={24 * s} rot={turn} seed={i + 2} />;
        return <path key={i} d={lobe(x, y, 14 * s, 14 * s, i + 3, 7)} fill={tint(TUNNEL_NEAR, 0.5)} {...EDGE_IN} />;
      })}
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
/**
 * The little motor that walks the rail, carrying the Virus. (x, y) = where it stands on the rail; `step`
 * counts steps (fractional): its two feet take turns, each lifting and moving a step up the rail.
 */
const Carrier: React.FC<{x: number; y: number; step: number}> = ({x, y, step}) => {
  const ph = step % 1;
  const foot = (lead: boolean): P => {
    // lead foot: from the back (0) to the front (-60) during the first half; the other during the second half
    const k = lead ? Math.min(1, ph * 2) : Math.max(0, ph * 2 - 1);
    const s = k * k * (3 - 2 * k);
    const startY = lead ? 0 : -60, endY = lead ? -60 : 0;
    const lift = Math.sin(Math.PI * s) * 16;
    return [x + (lead ? -8 : 10) + lift * 0.6, y + startY + (endY - startY) * s - lift];
  };
  const even = Math.floor(step) % 2 === 0;
  const a = foot(even), b = foot(!even);
  const bob = -Math.abs(Math.sin(Math.PI * ph * 2)) * 5;
  return (
    <g>
      <TinyLeg from={[x - 32, y - 112 + bob]} to={a} fill={CARRIER} w={13} foot={-1} />
      <TinyLeg from={[x + 32, y - 112 + bob]} to={b} fill={CARRIER} w={13} />
      <Shape d={lobe(x, y - 142 + bob, 92, 40, 5, 10)} fill={CARRIER} shadow={1.6} />
    </g>
  );
};

// ---- tissue: the fluid-filled space between cells, a capillary passing behind
const tissueVessel = (x: number) => 500 - ((x + 60) / 1200) * 40 + Math.sin((x + 60) / 300) * 14;
const TissueBack: React.FC<{t: number}> = ({t}) => (
  <>
    <Layer>
      <rect x={-40} y={-40} width={SCENE_W + 80} height={SCENE_H + 80} fill={FLUID} />
      <BackCells seed={30} cells={[[140, 260, 120, 90], [420, 230, 110, 80], [700, 250, 120, 90], [960, 230, 110, 95], [300, 1360, 110, 90], [780, 1380, 120, 90], [540, 1600, 130, 90], [100, 1700, 100, 90], [1000, 1700, 110, 90]]} />
      <Capillary pts={[[-60, 520], [300, 470], [700, 500], [1140, 450]]} w={170} />
    </Layer>
    <RedCells t={t} xs={[180, 560, 930]} y={tissueVessel} speed={52} />
  </>
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

/** A whole empty place at a moment (for the place sheets). */
const PlaceAt: React.FC<{view: MicroView; t: number}> = ({view, t}) => {
  const d = drift(t);
  if (view === 'junction') return <><Plane d={d.back}><JunctionBack /></Plane><Plane d={d.mid}><JunctionMid /></Plane><Plane d={d.front}><JunctionFront /></Plane></>;
  if (view === 'axon') return <><Plane d={d.back}><AxonTunnel t={t} /></Plane><Plane d={d.front}><AxonFront /></Plane></>;
  if (view === 'tissue') return <><Plane d={d.back}><TissueBack t={t} /></Plane><Plane d={d.mid}><TissueMid /></Plane><Plane d={d.front}><TissueFront /></Plane></>;
  return <><Plane d={d.back}><WoundBack t={t} /></Plane><Plane d={d.mid}><WoundMid /><Layer><Fang dy={0} /></Layer></Plane><Plane d={d.front}><WoundFront /></Plane></>;
};

// =================================================================== the shots (play.tsx): a pure function of `s`
/** The Virus squashes and stretches with its own voice (bouncy, cartoon-alive). */
const squash = (s: ShotNow) => { const k = talk(s, 'virus'); return k > 0 ? (k - 0.35) * 0.12 : Math.sin(s.t * 5.2) * 0.018; };
const breathe = (t: number, seed: number, px = 3) => sway(t, 2.6 + (seed % 3) * 0.3, seed) * px;
/** Where a spike ball of a Virus (centre x, y; figure size `size`) is, at angle `deg`. */
const spikeBall = (x: number, y: number, size: number, deg: number): P => {
  const k = size / 200, r = (deg * Math.PI) / 180;
  return [x + Math.cos(r) * 65 * k, y + (-4 + Math.sin(r) * 65) * k];
};
/** A lighter, quick label pop on the screen (labels never move with the camera). */
const ScreenLabel: React.FC<{s: ShotNow; text: string}> = ({s, text}) => (
  <div style={{position: 'absolute', inset: 0, opacity: go(s.t, 0.05, 0.25)}}><Label x={250} y={250} text={text} /></div>
);
/** Scale a group about a point (frame pixels). */
const Scaled: React.FC<{k: number; ox: number; oy: number; children: React.ReactNode}> = ({k, ox, oy, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: SCENE_W, height: SCENE_H, transform: `scale(${f(k * 1000) / 1000})`, transformOrigin: `${ox}px ${oy}px`}}>{children}</div>
);

// ---- A: the hook (junction)
const posA = (s: ShotNow) => {
  const t = s.t;
  const k = go(t, 0, 0.36);
  const u = since(s, 'A1', 'rabies');
  const shake = u >= 0 && u < 0.6 ? Math.sin(u * Math.PI * 7) * 8 * (1 - u / 0.6) : 0;
  const tapping = since(s, 'A2') >= 0 && since(s, 'A2', 'brain') < 0;
  const tap = tapping ? -Math.abs(Math.sin(s.t * Math.PI * 3.2)) * 7 : 0;
  return {x: lerp(236, 330, k), y: 800 - Math.sin(Math.PI * k) * 70 + breathe(t, 1) + tap, rot: shake + (1 - k) * -8};
};
const ShotA: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, d = drift(t), v = posA(s);
  const face = bodyFace(s, 'virus', 1, 'angry');
  const ub = since(s, 'A2', 'brain');
  const g = (t * 1.6) % 5;
  const glint = g % 1 < 0.22 ? Math.floor(g) : -1;
  return (
    <Scene bg={FLUID}>
      <Plane d={d.back} pulse={t}><JunctionBack /></Plane>
      <Plane d={d.mid}>
        <JunctionMid glint={glint} />
        <Put x={v.x} y={v.y} size={440} rot={v.rot} sq={squash(s)}><Virus mood={face.mood} mouth={face.mouth} look={ub >= 0 ? [-0.3, -0.7] : [0.35, 0.15]} /></Put>
        {ub >= 0 && (
          <Scaled k={pop(ub, 0, 0.32)} ox={300} oy={600}>
            <Layer><Bubble x={300} y={400} w={330} h={250} tx={300} ty={598} /></Layer>
            <Put x={296 + Math.sin(t * 38) * 2} y={398 + Math.sin(t * 31 + 1) * 1.5} size={200}><Brain mood={blink(t, 7) > 0.5 ? 'closed' : 'scared'} mouth="wavy" look={[0.2, 0.8]} /></Put>
          </Scaled>
        )}
      </Plane>
      <Plane d={d.mid}><MicroLife t={t} seed={1} /></Plane>
      <Plane d={d.front}><JunctionFront /></Plane>
      <Plane d={d.front}><MicroLife t={t} seed={11} near /></Plane>
    </Scene>
  );
};

// ---- B: that morning (wound)
const posB = (s: ShotNow) => {
  const t = s.t;
  const tn = since(s, 'B1', 'dog');
  let fang = lerp(-470 + sway(t, 1.6, 2) * 10, 0, go(tn, -0.1, 0.16));
  fang = lerp(fang, -250, go(since(s, 'B1', 'scratch'), 0.5, 0.7));
  const ub = since(s, 'B2');
  const kr = go(ub, 0, 1.1);
  const rx = 548 + Math.sin(kr * Math.PI) * 30, ry = lerp(560, 1092, kr) + (ub > 1.1 ? breathe(t, 3, 3) : 0);
  const point = go(since(s, 'B2', 'nerve'), -0.1, 0.3);
  return {fang, tn, ub, rx, ry, raftRot: lerp(-26, -8, kr) + sway(t, 2.2, 5) * 2, vx: rx, vy: ry - 106, vrot: lerp(-4, -16, point) + sway(t, 2.4, 6) * 2, point};
};
const ShotB: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, d = drift(t), b = posB(s);
  const face = bodyFace(s, 'virus', 2, 'happy');
  const tip = 600 + b.fang;
  // drips falling off the fang tip after the bite
  const drips = b.tn > 0.25 ? [0, 1, 2].map((i) => {
    const ph = ((b.tn - 0.25) * 0.8 + i / 3) % 1;
    return {x: 556 + (i - 1) * 16 + Math.sin(ph * 3 + i) * 6, y: tip + 220 + ph * 260, r: 8 + ph * 7, on: ph < 0.9};
  }) : [];
  // the splash when the raft lands
  const us = b.ub - 1.05;
  const splash = us >= 0 && us < 0.6 ? [[-1, -0.4], [1, -0.5], [0.4, -1]].map(([dx, dy]) => ({x: b.rx + dx * (100 + us * 160), y: b.ry + dy * (30 + us * 110), r: 13 * (1 - us / 0.6) + 2})) : [];
  return (
    <Scene bg={FLUID}>
      <Plane d={d.back} pulse={t}><WoundBack t={t} /></Plane>
      <Plane d={d.mid}>
        <WoundMid />
        <Layer>
          {drips.filter((p) => p.on).map((p, i) => <SpitDrop key={i} x={p.x} y={p.y} r={p.r} />)}
          <Fang dy={b.fang} />
          {b.ub >= 0 && <SpitRaft x={b.rx} y={b.ry} w={260} rot={b.raftRot} />}
          {splash.map((p, i) => <SpitDrop key={'s' + i} x={p.x} y={p.y} r={p.r} rot={i ? 30 : -30} />)}
        </Layer>
        {b.ub >= 0 && <Put x={b.vx} y={b.vy} size={250} rot={b.vrot} sq={squash(s)}><Virus mood={face.mood} mouth={face.mouth} look={b.point > 0.5 ? [0.9, -0.6] : [0.5, 0.5]} /></Put>}
      </Plane>
      <Plane d={d.mid}><MicroLife t={t} seed={2} /></Plane>
      <Plane d={d.front}><WoundFront /></Plane>
      <Plane d={d.front}><MicroLife t={t} seed={12} near /></Plane>
    </Scene>
  );
};

// ---- M2: the long way (axon)
const posM2 = (s: ShotNow) => {
  const step = s.t * 0.95;
  const ph = step % 1;
  const bob = -Math.abs(Math.sin(Math.PI * ph * 2)) * 5;
  return {cx: 552, cy: 1340, step, vx: 552, vy: 1064 + bob, vrot: Math.sin(Math.PI * 2 * ph) * 4};
};
const ShotM2: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, d = drift(t), m = posM2(s);
  const face = bodyFace(s, 'virus', 3, 'smug');
  return (
    <Scene bg={AXO}>
      <Plane d={d.back} pulse={t}><AxonTunnel t={t} /></Plane>
      <Plane d={d.mid}>
        <Layer><Carrier x={m.cx} y={m.cy} step={m.step} /></Layer>
        <Put x={m.vx} y={m.vy} size={280} rot={m.vrot} sq={squash(s)}><Virus mood={face.mood} mouth={face.mouth} look={[0.1, -0.8]} /></Put>
      </Plane>
      <Plane d={d.mid}><MicroLife t={t} seed={3} /></Plane>
      <Plane d={d.front}><AxonFront /></Plane>
      <Plane d={d.front}><MicroLife t={t} seed={13} near /></Plane>
    </Scene>
  );
};
const ScreenM2: React.FC<{s: ShotNow}> = ({s}) => {
  const u = since(s, 'B3', 'two');
  if (u < 0) return null;
  return <IconBadge icon="calendar" t={u} x={540} y={420} />;
};

// ---- E: after the vaccine (junction)
const WALL = [585, 715, 845];
const posE = (s: ShotNow) => {
  const t = s.t;
  const k = go(t, 0, 0.42);
  const strut = (1 - k) * -Math.abs(Math.sin(t * Math.PI * 5)) * 10;
  const jolt = Math.sin(clamp01((t - 0.42) / 0.3) * Math.PI) * 7;
  const dizzy = since(s, 'E2', 'no') >= 0;
  return {x: lerp(170, 300, k), y: 700 + strut + breathe(t, 4), rot: (1 - k) * 6 - jolt + (dizzy ? Math.sin(t * 6.5) * 3 : 0), dizzy};
};
const ShotE: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, d = drift(t), v = posE(s);
  const f0 = bodyFace(s, 'virus', 4, 'shocked');
  const face = v.dizzy ? {mood: 'dizzy' as const, mouth: f0.mouth === 'open' ? ('open' as const) : ('o' as const)} : f0;
  const [rbx, rby] = spikeBall(v.x, v.y, 340, 54), [lbx, lby] = spikeBall(v.x, v.y, 340, 128);
  const uw = since(s, 'E2', 'wall');
  const kg = go(uw, -0.7, 0.7);
  const hop = (u: number, k: number) => -Math.abs(Math.sin(u * Math.PI * 3)) * 14 * (1 - k);
  return (
    <Scene bg={FLUID}>
      <Plane d={d.back} pulse={t}><JunctionBack /></Plane>
      <Plane d={d.mid}>
        <JunctionMid />
        <Put x={985} y={620 - Math.abs(Math.sin(t * Math.PI * 1.3)) * 12} size={250}><Vaccine mood={blink(t, 8) > 0.5 ? 'closed' : 'happy'} mouth="smile" /></Put>
        <Put x={v.x} y={v.y} size={340} rot={v.rot} sq={squash(s)}><Virus mood={face.mood} mouth={face.mouth} look={[0.8, 0.1]} /></Put>
        {/* the wall marches in from the right during "Who are all of you?" */}
        {WALL.map((x, i) => {
          const u = since(s, 'E1', 'who') - i * 0.32;
          const k = go(u, 0, 0.8);
          if (k <= 0) return null;
          return <Put key={x} x={lerp(1250, x, k)} y={1010 + (i % 2) * 10 + hop(u, k) + breathe(t, 10 + i, 2)} size={190}><Antibody color={CLOTH.teal} mood={blink(t, 11 + i) > 0.5 ? 'closed' : 'angry'} mouth={i === 1 ? 'grit' : 'flat'} look={[-0.7, -0.2]} /></Put>;
        })}
        {/* two grab its lower spikes on "A wall?" */}
        {kg > 0 && <Put x={lerp(1260, rbx + 78, kg)} y={rby + 70 + hop(uw, kg)} size={200}><Antibody color={CLOTH.teal} mood="angry" mouth="grit" look={[-0.6, -0.6]} /></Put>}
        {kg > 0 && <Put x={lerp(-180, lbx - 78, kg)} y={lby + 70 + hop(uw + 0.2, kg)} size={200}><Antibody color={CLOTH.teal} mood="angry" mouth="flat" look={[0.6, -0.6]} /></Put>}
        <Put x={170} y={1190 - Math.abs(Math.sin(t * Math.PI * 1.3 + 1.2)) * 12} size={240}><Vaccine mood={blink(t, 9) > 0.5 ? 'closed' : 'open'} mouth="big" look={[0.6, -0.4]} /></Put>
      </Plane>
      <Plane d={d.mid}><MicroLife t={t} seed={4} /></Plane>
      <Plane d={d.front}><JunctionFront /></Plane>
      <Plane d={d.front}><MicroLife t={t} seed={14} near /></Plane>
    </Scene>
  );
};

// ---- M3: caught (tissue)
const posM3 = (s: ShotNow) => {
  const t = s.t;
  const k = go(t, 0, 0.4);
  const fight = since(s, 'X1', 'freeze') >= 0.3 && since(s, 'E3') < 0 ? Math.sin(t * 26) * 4 * clamp01(-since(s, 'E3') / 0.4) : 0;
  const sag = go(since(s, 'E3'), 0, 0.8);
  const nodU = since(s, 'E3', 'rabies');
  const nod = nodU >= 0 && nodU < 0.55 ? Math.sin((nodU / 0.55) * Math.PI) * 16 : 0;
  return {k, vx: 540 + fight, vy: 820 + sag * 16 + breathe(t, 6, 2), vrot: -sag * 4 + fight * 0.6, sag, nod, front: {x: 540, y: 1170 + nod + breathe(t, 7)}};
};
const ShotM3: React.FC<{s: ShotNow}> = ({s}) => {
  const t = s.t, d = drift(t), m = posM3(s);
  const vf = bodyFace(s, 'virus', 5, 'sad');
  const wf = bodyFace(s, 'whitecell', 6, 'angry');
  const [ax, ay] = spikeBall(m.vx, m.vy, 300, -166), [bx, by] = spikeBall(m.vx, m.vy, 300, 54);
  const hold = m.sag * 12;
  return (
    <Scene bg={FLUID}>
      <Plane d={d.back} pulse={t}><TissueBack t={t} /></Plane>
      <Plane d={d.mid}>
        <TissueMid />
        <Put x={m.vx} y={m.vy} size={300} rot={m.vrot} sq={squash(s)}><Virus mood={vf.mood} mouth={vf.mouth} look={[0, 0.5]} /></Put>
        <Put x={ax - 47} y={ay + 42 + sway(t, 1.9, 3) * 2} size={120}><Antibody color={CLOTH.teal} mood={blink(t, 12) > 0.5 ? 'closed' : 'open'} mouth="flat" look={[0.6, -0.4]} /></Put>
        <Put x={bx + 47} y={by + 42 + sway(t, 2.1, 4) * 2} size={120}><Antibody color={CLOTH.teal} mood={blink(t, 13) > 0.5 ? 'closed' : 'open'} mouth="flat" look={[-0.6, -0.4]} /></Put>
        <Put x={lerp(130, 341, m.k)} y={645 + hold + breathe(t, 8, 2)} size={340} flip><WhiteCell mood={blink(t, 14) > 0.5 ? 'closed' : 'angry'} mouth="flat" look={[0.5, 0.6]} /></Put>
        <Put x={lerp(950, 739, m.k)} y={645 + hold + breathe(t, 9, 2)} size={340}><WhiteCell mood={blink(t, 15) > 0.5 ? 'closed' : 'angry'} mouth="flat" look={[-0.5, 0.6]} /></Put>
        <Put x={m.front.x} y={m.front.y} size={400}><WhiteCell mood={wf.mood} mouth={wf.mouth === 'smile' ? 'grit' : wf.mouth} look={[0, -0.2]} /></Put>
      </Plane>
      <Plane d={d.mid}><MicroLife t={t} seed={5} /></Plane>
      <Plane d={d.front}><TissueFront /></Plane>
      <Plane d={d.front}><MicroLife t={t} seed={15} near /></Plane>
    </Scene>
  );
};

const virusFocus = (x: number, y: number, size: number): Focus => ({x, y: y - size * 0.08, r: size * 0.3});
export const BODY_SHOTS: Record<string, ShotDef> = {
  A: {Scene: ShotA, focus: (who, s) => { if (who === 'brain' && since(s, 'A2', 'brain') >= 0) return {x: 300, y: 400, r: 120}; const v = posA(s); return virusFocus(v.x, v.y, 440); }},
  B: {Scene: ShotB, Screen: ({s}) => <IconBadge icon="sunrise" t={s.t - 0.05} x={250} y={420} out={2.4} />, focus: (_who, s) => { const b = posB(s); return b.ub >= 0 ? virusFocus(b.vx, b.vy, 250) : {x: 548, y: Math.max(400, 560 + b.fang), r: 140}; }},
  M2: {Scene: ShotM2, Screen: ScreenM2, focus: (_who, s) => { const m = posM2(s); return virusFocus(m.vx, m.vy, 280); }},
  E: {Scene: ShotE, Screen: ({s}) => <IconBadge icon="vaccine" t={s.t - 0.05} x={540} y={430} />, focus: (_who, s) => { const v = posE(s); return virusFocus(v.x, v.y, 340); }},
  M3: {Scene: ShotM3, focus: (who, s) => { const m = posM3(s); return who === 'whitecell' ? {x: m.front.x, y: m.front.y - 30, r: 130} : virusFocus(m.vx, m.vy, 300); }},
};

// =================================================================== stills: the shots at a good moment (for the sheets)
/** The script's lines with their word timings (for stills only; the video uses the real voice timings). */
const lineSpec = (id: string, who: string, from: number, emotion: string, words: string, next: number): LineNow => {
  let last = 0;
  const ws: Word[] = words.split(' ').map((tok) => {
    const m = tok.match(/^(.*)\(([\d.]+)\)$/);
    last = m ? parseFloat(m[2]) : last + 0.25;
    return {w: m ? m[1] : tok, start: last, end: last + 0.2};
  });
  ws.forEach((w, i) => { w.end = i + 1 < ws.length ? ws[i + 1].start - 0.02 : w.start + 0.4; });
  return {id, who, text: ws.map((w) => w.w).join(' '), from, to: next, voice: ws[ws.length - 1].end, emotion, words: ws};
};
const STILL_LINES: Record<string, {dur: number; lines: LineNow[]}> = {
  A: {dur: 4.73, lines: [lineSpec('A1', 'virus', 0, 'angry', 'You(0) get(.23) rabies.(.41) Time(.93) runs(1.18) out.(1.43)', 2.07), lineSpec('A2', 'virus', 2.07, 'angry', 'Can(0) you(.23) stop(.37) me(.66) before(.79) the(1.09) brain?(1.2)', 4.73)]},
  B: {dur: 6.83, lines: [lineSpec('B1', 'virus', 0, 'smug', 'A(0) stray(.16) dog.(.48) A(1.02) little(1.16) nip.(1.38) A(1.92) tiny(2.04) scratch.(2.32)', 3.63), lineSpec('B2', 'virus', 3.63, 'happy', 'I(0) ride(.2) in(.44) on(.57) its(.69) spit.(.84) Now,(1.39) up(1.74) this(1.94) nerve!(2.17)', 6.83)]},
  M2: {dur: 3.77, lines: [lineSpec('B3', 'virus', 0, 'smug', 'Slowly.(0) Usually(.94) two(1.41) to(1.61) three(1.71) months(1.93) to(2.21) the(2.35) brain.(2.44)', 3.77)]},
  E: {dur: 5.4, lines: [lineSpec('E1', 'virus', 0, 'shocked', 'Wait.(0) Who(.44) are(.64) all(.77) of(.91) you?(1) What(1.53) is(1.78) this?(1.95)', 2.5), lineSpec('E2', 'virus', 2.5, 'angry', 'A(0) wall?(.16) They(.77) stopped(.97) me(1.32) before(1.45) the(1.73) brain!(1.83)', 5.4)]},
  M3: {dur: 5.93, lines: [lineSpec('X1', 'whitecell', 0, 'angry', 'Got(0) you!(.35) You(.5) go(.66) no(.82) further.(.99)', 1.77), lineSpec('E3', 'virus', 1.77, 'sad', 'One(0) bite,(.24) but(.63) you(.81) did(.94) not(1.13) get(1.26) rabies.(1.46) The(2.21) vaccine(2.37) came(2.81) in(3.03) time!', 5.93)]},
};
const nowAt = (id: string, t: number): ShotNow => {
  const {dur, lines} = STILL_LINES[id];
  const cur = [...lines].reverse().find((l) => l.from <= t) ?? null;
  return {id, t, dur, lines, cur};
};
const StillOf: React.FC<{id: string; t: number}> = ({id, t}) => {
  const def = BODY_SHOTS[id];
  const s = nowAt(id, t);
  return <><def.Scene s={s} />{def.Screen && <def.Screen s={s} />}</>;
};
export const V8SceneA: React.FC = () => <StillOf id="A" t={4.2} />;
export const V8SceneB: React.FC = () => <StillOf id="B" t={6.6} />;
export const V8SceneM2: React.FC = () => <StillOf id="M2" t={3.2} />;
export const V8SceneE: React.FC = () => <StillOf id="E" t={4.9} />;
export const V8SceneM3: React.FC = () => <StillOf id="M3" t={2.4} />;
const Empty: React.FC<{view: MicroView}> = ({view}) => <Scene bg={view === 'axon' ? AXO : FLUID}><PlaceAt view={view} t={0} /></Scene>;
export const V8PlaceWound: React.FC = () => <Empty view="wound" />;
export const V8PlaceJunction: React.FC = () => <Empty view="junction" />;
export const V8PlaceAxon: React.FC = () => <Empty view="axon" />;
export const V8PlaceTissue: React.FC = () => <Empty view="tissue" />;
