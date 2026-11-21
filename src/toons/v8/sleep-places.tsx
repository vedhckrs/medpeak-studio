/**
 * MedPeak Toons, look v8: the micro place of "What Happens If You Don't Sleep" (`no-sleep`).
 *
 *   BrainGapPlace  among brain cells, microscopic, 1080 x 1920, four depth planes (far haze and far cells,
 *                  the big brain cells, the floating life, near framing). Its dials:
 *     gap    0 awake: the cells sit close, the channels between them are narrow
 *            1 asleep: the cells draw apart and the channels open (Xie 2013: about 60% more space, in mice)
 *     wash   0..1 brain fluid streams through the channels (pale aqua specks, flow lines)
 *     dirt   0..1 how much waste (small grey sticky bits) is stuck in the channels
 *
 * Drawn with the kit only: one outline colour, flat fills, one darker tone, no gradients, no blur, no glow.
 */
import React from 'react';
import {EDGE_IN, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {f, lobe, open, rnd, tube, type P} from './scenes-body';
import {Bits, CellBody, Depth} from './micro3';
import {Gunk, NightCrew, SLEEP_COL} from './sleep-cast';

const sway = (t: number, period: number, seed = 0) => Math.sin((t / period) * Math.PI * 2 + seed * 1.7);
const float = (t: number, depth: number) => ({dx: sway(t, 9, 1) * (3 + depth * 16), dy: sway(t, 11.5, 2) * (2 + depth * 11), d: depth});

// the night palette of the brain: the fluid space a deep blue-violet, the cells a soft lilac-pink
export const BRAIN = {
  space: '#3f4a7e',
  far: '#4c5890',
  farCell: '#6a6fa6',
  cell: '#e7b9cf',
  glia: '#b7c7e6',
  den: '#d9a6c0',
  near: '#2c3561',
  dirt: '#a89c8f',
};

/** Where the big cells sit at gap 0, and how they move apart as the gap opens (away from the channels). */
const CELLS: {x: number; y: number; rx: number; ry: number; seed: number; rot: number; push: P}[] = [
  {x: 262, y: 400, rx: 268, ry: 238, seed: 11, rot: -8, push: [-1, -0.6]},
  {x: 822, y: 372, rx: 262, ry: 232, seed: 12, rot: 10, push: [1, -0.6]},
  {x: 262, y: 1010, rx: 262, ry: 248, seed: 13, rot: 6, push: [-1, 0]},
  {x: 822, y: 1020, rx: 266, ry: 240, seed: 14, rot: -6, push: [1, 0]},
  {x: 266, y: 1630, rx: 266, ry: 240, seed: 15, rot: 8, push: [-1, 0.6]},
  {x: 818, y: 1640, rx: 262, ry: 238, seed: 16, rot: -10, push: [1, 0.6]},
];
const OPEN = 70; // how far each cell moves back at gap 1 (px)
const cellAt = (i: number, gap: number) => {
  const c = CELLS[i];
  return {...c, x: c.x + c.push[0] * OPEN * gap, y: c.y + c.push[1] * OPEN * gap * 0.9, rx: c.rx * (1 - gap * 0.1), ry: c.ry * (1 - gap * 0.1)};
};

/** The channels: the spaces the fluid runs through (one down the middle, two across). */
export const CHANNELS: P[][] = [
  [[540, -60], [550, 300], [530, 700], [545, 1000], [535, 1330], [548, 1650], [540, 1980]],
  [[-60, 700], [300, 720], [540, 700], [800, 690], [1140, 710]],
  [[-60, 1320], [300, 1300], [540, 1330], [800, 1345], [1140, 1325]],
];

/** Points along a polyline, every `step` px. */
const sampleLine = (ctrl: P[], step: number): P[] => {
  const out: P[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const [x0, y0] = ctrl[i], [x1, y1] = ctrl[i + 1], L = Math.hypot(x1 - x0, y1 - y0);
    for (let s = 0; s < L; s += step) out.push([x0 + ((x1 - x0) * s) / L, y0 + ((y1 - y0) * s) / L]);
  }
  return out;
};

/** A neuron's dendrite: a branching tapered tube from the cell out to (and past) the frame edge. */
const Dendrite: React.FC<{from: P; to: P; w: number; seed: number; col: string}> = ({from, to, w, seed, col}) => {
  const mid: P = [(from[0] + to[0]) / 2 + (rnd(1, seed) - 0.5) * 120, (from[1] + to[1]) / 2 + (rnd(2, seed) - 0.5) * 120];
  const main = tube([from, mid, to], [w, w * 0.6, w * 0.3], ['round', 'cut'], 12, seed);
  const twig = (u: P, v: P, ww: number, s: number) => tube([u, [(u[0] + v[0]) / 2 + (rnd(3, s) - 0.5) * 50, (u[1] + v[1]) / 2], v], [ww, ww * 0.6, ww * 0.3], ['round', 'round'], 8, s);
  const b1: P = [mid[0] + (rnd(4, seed) - 0.5) * 220, mid[1] + (rnd(5, seed) - 0.5) * 220];
  return (
    <g>
      <path d={twig(mid, b1, w * 0.45, seed + 1).d} fill={col} {...EDGE_IN} />
      <path d={main.d} fill={col} {...EDGE_IN} />
      {/* small spines on the dendrite */}
      {[0.3, 0.55, 0.8].map((u, i) => {
        const p: P = [from[0] + (to[0] - from[0]) * u + (mid[0] - (from[0] + to[0]) / 2) * Math.sin(u * Math.PI), from[1] + (to[1] - from[1]) * u + (mid[1] - (from[1] + to[1]) / 2) * Math.sin(u * Math.PI)];
        return <circle key={i} cx={f(p[0] + (i % 2 ? 1 : -1) * w * 0.45)} cy={f(p[1])} r={w * 0.14 + 2} fill={col} {...EDGE_IN} />;
      })}
    </g>
  );
};

/** A glial cell (astrocyte): a small star with a face-less body, its feet reaching the channel walls. */
const Glia: React.FC<{x: number; y: number; r: number; seed: number; t: number}> = ({x, y, r, seed, t}) => (
  <g>
    {Array.from({length: 6}, (_, i) => {
      const a = (i / 6) * Math.PI * 2 + rnd(i, seed) * 0.5;
      const L = r * (2 + rnd(i, seed + 1) * 0.9) + sway(t, 3, i + seed) * 4;
      return <path key={i} d={tube([[x, y], [x + Math.cos(a) * L * 0.55, y + Math.sin(a) * L * 0.55 + 8], [x + Math.cos(a) * L, y + Math.sin(a) * L]], [r * 0.7, r * 0.35, r * 0.22], ['round', 'round'], 8, seed + i).d} fill={BRAIN.glia} {...EDGE_IN} />;
    })}
    <path d={lobe(x, y, r, r * 0.9, seed, 8)} fill={BRAIN.glia} {...EDGE_IN} />
    <path d={lobe(x + r * 0.15, y + r * 0.1, r * 0.45, r * 0.38, seed + 2, 7)} fill={shade(BRAIN.glia, 0.18)} />
  </g>
);

/** Waste stuck in the channels: small grey sticky bits, more of them as `dirt` rises (they never blink in). */
const Dirt: React.FC<{dirt: number; t: number; gap: number}> = ({dirt, t, gap}) => {
  const spots = CHANNELS.flatMap((ch, c) => sampleLine(ch, 110).map((p, i) => ({p, c, i})));
  return (
    <>
      {spots.map(({p, c, i}, k) => {
        const show = Math.max(0, Math.min(1, dirt * 1.6 - rnd(k, 71) * 0.9));
        if (show <= 0) return null;
        const s = (10 + rnd(k, 72) * 14) * (0.4 + show * 0.6);
        const off = (rnd(k, 73) - 0.5) * (28 + gap * 30);
        const x = p[0] + (c === 0 ? off : 0) + sway(t, 4, k) * 3;
        const y = p[1] + (c === 0 ? 0 : off);
        return (
          <g key={k} transform={`translate(${f(x)} ${f(y)})`} opacity={Math.min(1, show * 2)}>
            <path d={lobe(0, 0, s, s * 0.8, k + 700, 7)} fill={BRAIN.dirt} {...EDGE_IN} />
            <path d={lobe(s * 0.4, s * 0.2, s * 0.5, s * 0.4, k + 701, 6)} fill={BRAIN.dirt} {...EDGE_IN} />
            <path d={`M ${f(-s * 0.4)} ${f(-s * 0.3)} q ${f(s * 0.2)} ${f(-s * 0.25)} ${f(s * 0.5)} ${f(-s * 0.2)}`} stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
          </g>
        );
      })}
    </>
  );
};

/** The fluid washing through the channels: flow lines and pale aqua droplets moving along each channel. */
const Wash: React.FC<{wash: number; t: number; gap: number}> = ({wash, t, gap}) => {
  if (wash <= 0) return null;
  const w = 26 + gap * 40;
  return (
    <g opacity={Math.min(1, wash * 1.5)}>
      {CHANNELS.map((ch, c) => (
        <g key={c}>
          <path d={open(ch)} stroke={tint(SLEEP_COL.fluid, 0.1)} strokeWidth={w} strokeLinecap="round" fill="none" opacity={0.35} />
          {[-0.28, 0.28].map((k, j) => (
            <path key={j} d={open(ch.map(([x, y]) => [x + (c === 0 ? k * w : 0), y + (c === 0 ? 0 : k * w)] as P))} stroke="#ffffff" strokeWidth={3} fill="none" strokeDasharray="34 46" strokeDashoffset={f(-t * 160 - j * 40)} strokeLinecap="round" />
          ))}
          {sampleLine(ch, 150).map((p, i) => {
            const L = sampleLine(ch, 150).length;
            const u = ((i / L + t * 0.12 * wash) % 1 + 1) % 1;
            const q = sampleLine(ch, 150)[Math.floor(u * L)] ?? p;
            const s = 9 + rnd(i, 80 + c) * 7;
            return <ellipse key={i} cx={f(q[0] + (c === 0 ? (rnd(i, 81) - 0.5) * w * 0.6 : 0))} cy={f(q[1] + (c === 0 ? 0 : (rnd(i, 82) - 0.5) * w * 0.6))} rx={s} ry={s * 0.8} fill={SLEEP_COL.fluid} {...EDGE_IN} />;
          })}
        </g>
      ))}
    </g>
  );
};

export const BrainGapPlace: React.FC<{t: number; gap?: number; wash?: number; dirt?: number}> = ({t, gap = 0, wash = 0, dirt = 0}) => {
  const fl = (d: number) => float(t, d);
  const breathe = 1 + sway(t, 5) * 0.004;
  return (
    <Scene bg={BRAIN.space}>
      {/* far: haze and far cells, thin lines */}
      <Depth {...fl(0)}>
        <Layer>
          {Array.from({length: 8}, (_, i) => <path key={i} d={lobe(rnd(i, 401) * 1080, 140 + rnd(i, 402) * 1640, 170 + rnd(i, 403) * 120, 130 + rnd(i, 404) * 110, 410 + i, 9)} fill={BRAIN.far} />)}
          {Array.from({length: 9}, (_, i) => {
            const x = rnd(i, 421) * 1080, y = 100 + rnd(i, 422) * 1720, r = 50 + rnd(i, 423) * 40;
            return (
              <g key={i}>
                {[0, 1, 2].map((j) => <path key={j} d={tube([[x, y], [x + Math.cos(j * 2.1 + i) * r * 2.4, y + Math.sin(j * 2.1 + i) * r * 2.4]], [r * 0.45, r * 0.12], ['round', 'round'], 6, i + j).d} fill={BRAIN.farCell} />)}
                <path d={lobe(x, y, r, r * 0.85, 430 + i, 8)} fill={BRAIN.farCell} stroke={shade(BRAIN.far, 0.2)} strokeWidth={1.6} />
              </g>
            );
          })}
        </Layer>
      </Depth>
      {/* middle: the big brain cells, their dendrites, the glia, and what is in the channels */}
      <Depth {...fl(0.45)} k={breathe}>
        <Layer>
          {CELLS.flatMap((_, i) => {
            const c = cellAt(i, gap);
            const a0 = Math.atan2(c.push[1] || (i % 2 ? 0.5 : -0.5), c.push[0]);
            return [-1.15, 0, 1.15].map((da, j) => {
              const a = a0 + da + (rnd(j, 520 + i) - 0.5) * 0.4 + Math.PI * (j === 1 ? 0 : 0);
              const L = c.rx * (1.75 + rnd(j, 530 + i) * 0.4);
              return <Dendrite key={`${i}-${j}`} from={[c.x, c.y]} to={[c.x + Math.cos(a) * L, c.y + Math.sin(a) * L]} w={j === 1 ? 64 : 48} seed={500 + i * 3 + j} col={BRAIN.den} />;
            });
          })}
          <Wash wash={wash} t={t} gap={gap} />
          {CELLS.map((_, i) => {
            const c = cellAt(i, gap);
            return <CellBody key={i} x={c.x} y={c.y} rx={c.rx} ry={c.ry} seed={c.seed} rot={c.rot} fill={BRAIN.cell} line="out" detail={1} nuc={[c.push[0] * -0.08, 0]} />;
          })}
          <Glia x={540 + sway(t, 6) * 4} y={330} r={30} seed={601} t={t} />
          <Glia x={540} y={1660 + sway(t, 7) * 4} r={28} seed={602} t={t} />
          <Dirt dirt={dirt} t={t} gap={gap} />
        </Layer>
      </Depth>
      {/* floating life */}
      <Depth {...fl(0.8)}>
        <Layer>
          <Bits t={t} n={14} seed={611} col={tint(BRAIN.space, 0.45)} size={11} />
        </Layer>
      </Depth>
      {/* near framing: big dark out-of-focus cell edges cut by the frame, no outline */}
      <Depth {...fl(1)}>
        <Layer>
          {([[-90, 120, 230, 190, 621], [1170, 860, 200, 260, 622], [-60, 1880, 260, 180, 623]] as const).map(([x, y, rx, ry, s], i) => (
            <g key={i}><path d={lobe(x, y, rx, ry, s, 9)} fill={BRAIN.near} /><path d={lobe(x + rx * 0.1, y + ry * 0.14, rx * 0.8, ry * 0.76, s + 1, 9)} fill={shade(BRAIN.near, 0.12)} /></g>
          ))}
        </Layer>
      </Depth>
    </Scene>
  );
};

// ------------------------------------------------------------------ the three moments for the sheet
/** A: the hook, 2 a.m., awake: narrow gaps, Gunk piled up in the middle channel. */
export const MomentAwake: React.FC = () => (
  <>
    <BrainGapPlace t={1.2} gap={0} dirt={0.55} />
    <Put x={545} y={1010} size={420}><Gunk stage={1} mood="angry" mouth="grit" look={[0, 0.4]} /></Put>
  </>
);
/** C: asleep: gaps open, the night crew rushes through and washes. */
export const MomentAsleep: React.FC = () => (
  <>
    <BrainGapPlace t={2.4} gap={1} wash={1} dirt={0.2} />
    <Put x={540} y={560} size={250} rot={-6}><NightCrew job="mop" mood="happy" look={[0, 0.6]} /></Put>
    <Put x={300} y={1325} size={230} rot={4}><NightCrew job="bucket" mood="open" look={[0.6, 0.1]} /></Put>
    <Put x={800} y={1340} size={230} rot={-4}><NightCrew job="brush" mood="open" look={[-0.6, 0.1]} /></Put>
  </>
);
/** D: the morning after a night awake: gaps narrow, dirt everywhere, Gunk huge. */
export const MomentMorning: React.FC = () => (
  <>
    <BrainGapPlace t={3.6} gap={0} dirt={1} />
    <Put x={545} y={1000} size={560}><Gunk stage={2} mood="happy" mouth="big" look={[0, 0.3]} /></Put>
  </>
);
