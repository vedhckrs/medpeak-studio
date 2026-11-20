/**
 * MedPeak Toons, look v8: the NEW microscopic world (rabies version 3, the owner, 2026-11-20:
 * "new microscopic world, new animation, more interesting visual").
 *
 * Five places, each a full 1080 x 1920 frame in three or more depth planes, everything alive with `t`:
 *   BitePlace     the bite in cross-section: skin layers, a hair, a sweat gland, a capillary loop with red
 *                 cells streaming, a nerve twig, fat below; the fang plunges in with saliva drops.
 *   MusclePlace   striped muscle fibres that contract in waves, mitochondria, a capillary; the virus copies.
 *   DoorPlace     the nerve ending on the muscle: a big terminal bulb full of vesicles that move and pop,
 *                 signal sparks across the gap, the lock sockets on the muscle side.
 *   HighwayPlace  inside the nerve: myelin rings rushing at the lens, rails in perspective, signal pulses
 *                 racing along the walls, the brain waiting at the far end.
 *   BattlePlace   the defence: a defence cell "factory" firing antibodies, a swarm of them, the vessel wall.
 * Drawn with the kit only: one outline, flat colour with one darker tone, no gradients, no blur.
 */
import React, {useId} from 'react';
import {EDGE, EDGE_IN, FLESH, INK, INLINE, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {f, lobe, loop, open, rnd, tube, type P} from './scenes-body';
import {RedCell, Antibody, WhiteCell} from './cells';
import {Brain} from './organs-a';

const sway = (t: number, period: number, seed = 0) => Math.sin((t / period) * Math.PI * 2 + seed * 1.7);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const beat = (t: number) => { const u = (t * 1.25) % 1; const k = (c: number, w: number) => Math.max(0, 1 - Math.abs(u - c) / w); return Math.max(k(0.06, 0.07), k(0.24, 0.06) * 0.6); };

/**
 * v4 (the owner, 2026-11-20: "inside the body a continuous dive from the first frame to the last, through the
 * depth layers"): a shot sets how far the camera has dived (0..1, eased over the whole shot) with DiveCtx;
 * every depth plane then grows by its own amount, the near planes most, so the camera floats IN between them.
 */
export const DiveCtx = React.createContext(0);
export const DIVE = {far: 0.06, near: 0.42};
/** A depth plane: moves by (dx, dy) and scales about the frame centre (camera dolly); `d` its depth (0 far .. 1 near). */
export const Depth: React.FC<{dx?: number; dy?: number; k?: number; d?: number; o?: P; children: React.ReactNode}> = ({dx = 0, dy = 0, k = 1, d = 0, o = [540, 960], children}) => {
  const dive = React.useContext(DiveCtx);
  const kk = k * (1 + dive * (DIVE.far + d * (DIVE.near - DIVE.far)));
  return <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: `${o[0]}px ${o[1]}px`, transform: `translate(${f(dx)}px, ${f(dy)}px) scale(${kk.toFixed(4)})`}}>{children}</div>;
};
/** The slow float of the camera in fluid, per plane depth (0 far .. 1 near). */
const float = (t: number, depth: number): {dx: number; dy: number; d: number} => ({dx: sway(t, 9, 1) * (3 + depth * 16), dy: sway(t, 11.5, 2) * (2 + depth * 11), d: depth});

// ------------------------------------------------------------------ shared pieces
const RED = FLESH.artery;
/** A flowing red blood cell, flat disc seen at an angle (small, no face: background life). */
const Disc: React.FC<{x: number; y: number; r: number; rot: number}> = ({x, y, r, rot}) => (
  <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
    <ellipse rx={r} ry={r * 0.62} fill={tint(RED, 0.15)} {...EDGE_IN} />
    <ellipse rx={r * 0.5} ry={r * 0.26} fill={shade(tint(RED, 0.15), 0.14)} />
  </g>
);
/** Red cells streaming along a sampled path (pts), `n` of them, speed in path-fractions a second. */
const Stream: React.FC<{pts: P[]; t: number; n: number; r: number; speed?: number; seed?: number}> = ({pts, t, n, r, speed = 0.08, seed = 1}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const u = ((i / n + t * speed + rnd(i, seed) * 0.03) % 1 + 1) % 1;
      const k = u * (pts.length - 1), a = Math.floor(k), b = Math.min(pts.length - 1, a + 1), w = k - a;
      const x = pts[a][0] + (pts[b][0] - pts[a][0]) * w, y = pts[a][1] + (pts[b][1] - pts[a][1]) * w;
      const ang = (Math.atan2(pts[b][1] - pts[a][1], pts[b][0] - pts[a][0]) * 180) / Math.PI;
      return <Disc key={i} x={x + (rnd(i, seed + 3) - 0.5) * r * 0.8} y={y + (rnd(i, seed + 5) - 0.5) * r * 0.6} r={r * (0.85 + rnd(i, seed + 9) * 0.3)} rot={ang + sway(t, 1.3, i) * 25} />;
    })}
  </>
);
/** Little floating specks of the fluid (life everywhere). */
const Specks: React.FC<{t: number; n: number; seed: number; col: string; size?: number; flow?: P}> = ({t, n, seed, col, size = 7, flow = [14, -22]}) => (
  <>
    {Array.from({length: n}, (_, i) => {
      const x = ((rnd(i, seed) * 1250 + t * flow[0] * (0.5 + rnd(i, seed + 1)) + sway(t, 3 + rnd(i, 4) * 3, i) * 12) % 1250 + 1250) % 1250 - 85;
      const y = ((rnd(i, seed + 2) * 2060 + t * flow[1] * (0.5 + rnd(i, seed + 3))) % 2060 + 2060) % 2060 - 70;
      const s = size * (0.6 + rnd(i, seed + 6) * 0.9);
      return <ellipse key={i} cx={f(x)} cy={f(y)} rx={f(s)} ry={f(s * 0.8)} fill={col} {...EDGE_IN} />;
    })}
  </>
);
/** A path sampled to points (for streams), along straight segments. */
const pathPts = (ctrl: P[], steps = 18): P[] => {
  const out: P[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) for (let s = 0; s < steps; s++) { const u = s / steps; out.push([ctrl[i][0] + (ctrl[i + 1][0] - ctrl[i][0]) * u, ctrl[i][1] + (ctrl[i + 1][1] - ctrl[i][1]) * u]); }
  out.push(ctrl[ctrl.length - 1]);
  return out;
};

// ------------------------------------------------------------------ v4 detail pieces (the owner, 2026-11-20:
// "the micro world is poor, not detailed"). Still the kit: one outline colour, flat fills, flat light and
// shade bands, no blur. Far things get thinner or no outline; near framing shapes have no outline.
/** A tiny capsule (mitochondrion) with its cristae zig-zag. */
const Mito: React.FC<{x: number; y: number; l: number; rot: number; col: string}> = ({x, y, l, rot, col}) => {
  const w = l * 0.42;
  const zig: P[] = Array.from({length: 7}, (_, i): P => [-l * 0.36 + (i * l * 0.72) / 6, i % 2 ? w * 0.22 : -w * 0.22]);
  return (
    <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
      <rect x={-l / 2} y={-w / 2} width={l} height={w} rx={w / 2} fill={col} {...EDGE_IN} />
      <rect x={-l / 2 + w * 0.2} y={0} width={l - w * 0.4} height={w * 0.3} rx={w * 0.15} fill={shade(col, 0.1)} />
      <path d={zig.map((q, i) => `${i ? 'L' : 'M'} ${f(q[0])} ${f(q[1])}`).join(' ')} stroke={shade(col, 0.32)} strokeWidth={2.4} fill="none" strokeLinejoin="round" />
    </g>
  );
};
/** A cell seen in section: double membrane, a shade band on the lower right, a nucleus with nucleolus and
 * chromatin, rough ER with ribosome dots, mitochondria and vesicles. `detail` 0 draws only the body. */
export const CellBody: React.FC<{x: number; y: number; rx: number; ry: number; seed: number; fill: string; rot?: number; detail?: number; line?: 'out' | 'in' | 'none'; nuc?: [number, number]}> = ({x, y, rx, ry, seed, fill, rot = 0, detail = 1, line = 'in', nuc = [0.12, -0.05]}) => {
  const d = lobe(x, y, rx, ry, seed, 10, rot);
  const id = 'm3' + useId().replace(/:/g, '');
  const stroke = line === 'out' ? EDGE : line === 'in' ? EDGE_IN : {};
  const nx = x + rx * nuc[0], ny = y + ry * nuc[1], nr = Math.min(rx, ry) * 0.36;
  const er = shade(fill, 0.2);
  return (
    <g>
      <clipPath id={id}><path d={d} /></clipPath>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${id})`}>
        <path d={lobe(x + rx * 0.22, y + ry * 0.26, rx * 0.95, ry * 0.9, seed + 1, 10, rot)} fill={shade(fill, 0.07)} transform={`translate(${f(rx * 0.12)} ${f(ry * 0.14)})`} />
        <path d={lobe(x - rx * 0.3, y - ry * 0.36, rx * 0.5, ry * 0.32, seed + 2, 8, rot)} fill={tint(fill, 0.16)} />
        {detail > 0 && (
          <>
            <path d={lobe(x, y, rx * 0.9, ry * 0.88, seed, 10, rot)} fill="none" stroke={shade(fill, 0.14)} strokeWidth={2.6} />
            {/* rough ER around the nucleus, ribosome dots on it */}
            {[0, 1, 2].map((k) => {
              const r0 = nr * (1.35 + k * 0.32), a0 = rnd(k, seed) * 6, pts: P[] = Array.from({length: 7}, (_, i): P => {
                const a = a0 + i * 0.42, w = Math.sin(i * 2.1 + k) * nr * 0.08;
                return [nx + Math.cos(a) * (r0 + w), ny + Math.sin(a) * (r0 + w) * (ry / rx)];
              });
              return <g key={k}><path d={open(pts)} stroke={er} strokeWidth={3} fill="none" strokeLinecap="round" />{pts.filter((_, i) => i % 2).map((q, i) => <circle key={i} cx={f(q[0])} cy={f(q[1] - 4)} r={2.6} fill={shade(fill, 0.36)} />)}</g>;
            })}
            {Array.from({length: detail > 1 ? 3 : 2}, (_, k) => {
              const a = rnd(k, seed + 7) * 6.28, r = 0.55 + rnd(k, seed + 8) * 0.22;
              return <Mito key={k} x={x + Math.cos(a) * rx * r} y={y + Math.sin(a) * ry * r} l={nr * 0.9} rot={rnd(k, seed + 9) * 180} col={tint(FLESH.coral, 0.25)} />;
            })}
            {Array.from({length: 6}, (_, k) => {
              const a = rnd(k, seed + 11) * 6.28, r = 0.4 + rnd(k, seed + 12) * 0.4;
              return <circle key={k} cx={f(x + Math.cos(a) * rx * r)} cy={f(y + Math.sin(a) * ry * r)} r={f(nr * 0.12 + 2)} fill={tint(fill, 0.4)} stroke={shade(fill, 0.22)} strokeWidth={1.6} />;
            })}
          </>
        )}
      </g>
      <path d={d} fill="none" {...stroke} />
      {detail > 0 && (
        <g>
          <path d={lobe(nx, ny, nr, nr * 0.9, seed + 3, 8)} fill={shade(fill, 0.2)} {...EDGE_IN} />
          <path d={lobe(nx + nr * 0.15, ny + nr * 0.18, nr * 0.75, nr * 0.62, seed + 4, 8)} fill={shade(fill, 0.27)} />
          <circle cx={f(nx - nr * 0.2)} cy={f(ny - nr * 0.15)} r={f(nr * 0.26)} fill={shade(fill, 0.42)} />
          {Array.from({length: 6}, (_, k) => <circle key={k} cx={f(nx + (rnd(k, seed + 5) - 0.4) * nr * 1.2)} cy={f(ny + (rnd(k, seed + 6) - 0.4) * nr * 1.1)} r={2.4} fill={shade(fill, 0.45)} />)}
        </g>
      )}
    </g>
  );
};
/** A wavy fibre bundle (collagen, connective tissue): a ribbon with strand lines inside and a shade band. */
const Bundle: React.FC<{pts: P[]; w: number; col: string; line?: boolean}> = ({pts, w, col, line = true}) => {
  const off = (dy: number) => open(pts.map(([x, y]) => [x, y + dy] as P));
  return (
    <g>
      <path d={off(0)} stroke={line ? INK : shade(col, 0.1)} strokeWidth={w + (line ? 3 : 0)} strokeLinecap="round" fill="none" />
      <path d={off(0)} stroke={col} strokeWidth={w - (line ? 2 : 0)} strokeLinecap="round" fill="none" />
      <path d={off(w * 0.2)} stroke={shade(col, 0.1)} strokeWidth={w * 0.42} strokeLinecap="round" fill="none" />
      <path d={off(-w * 0.26)} stroke={tint(col, 0.22)} strokeWidth={w * 0.14} strokeLinecap="round" fill="none" />
      {[-0.12, 0.1, 0.3].map((k, i) => <path key={i} d={off(w * k)} stroke={shade(col, 0.2)} strokeWidth={1.8} fill="none" strokeDasharray={`${40 + i * 13} ${14 + i * 5}`} />)}
    </g>
  );
};
/** A fibroblast: a spindle cell lying in the fibres, nucleus in the middle. */
const Spindle: React.FC<{x: number; y: number; l: number; rot: number; col: string}> = ({x, y, l, rot, col}) => (
  <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
    <path d={`M ${-l / 2} 0 Q ${-l / 4} ${-l * 0.13} 0 ${-l * 0.12} Q ${l / 4} ${-l * 0.12} ${l / 2} 0 Q ${l / 4} ${l * 0.12} 0 ${l * 0.12} Q ${-l / 4} ${l * 0.13} ${-l / 2} 0 Z`} fill={col} {...EDGE_IN} />
    <ellipse rx={l * 0.16} ry={l * 0.07} fill={shade(col, 0.22)} {...EDGE_IN} />
    <circle cx={-l * 0.04} cy={-l * 0.01} r={l * 0.025} fill={shade(col, 0.42)} />
  </g>
);
/** Denser life: tiny proteins, bead chains and droplets floating in the fluid (deterministic, they drift). */
export const Bits: React.FC<{t: number; n: number; seed: number; col: string; size?: number; flow?: P; area?: [number, number, number, number]}> = ({t, n, seed, col, size = 10, flow = [10, -16], area = [0, 0, 1080, 1920]}) => {
  const [ax, ay, aw, ah] = area;
  return (
    <>
      {Array.from({length: n}, (_, i) => {
        const ux = ((((rnd(i, seed) * aw + t * flow[0] * (0.5 + rnd(i, seed + 1))) % aw) + aw) % aw) / aw;
        const uy = ((((rnd(i, seed + 2) * ah + t * flow[1] * (0.5 + rnd(i, seed + 3))) % ah) + ah) % ah) / ah;
        const x = ax + ux * aw + sway(t, 4 + rnd(i, seed + 4) * 3, i) * 10;
        const y = ay + uy * ah;
        // v4: fade out near the edges of the area, so a bit that wraps around never blinks
        const op = Math.min(1, 6 * Math.min(ux, 1 - ux), 6 * Math.min(uy, 1 - uy));
        const s = size * (0.7 + rnd(i, seed + 5) * 0.8), r = rnd(i, seed + 6) * 360 + t * 20 * (rnd(i, seed + 7) - 0.5);
        const kind = i % 4;
        return (
          <g key={i} opacity={op} transform={`translate(${f(x)} ${f(y)}) rotate(${f(r)})`}>
            {kind === 0 && [0, 1, 2].map((j) => <circle key={j} cx={(j - 1) * s * 0.9} cy={j === 1 ? -s * 0.3 : 0} r={s * 0.5} fill={col} {...EDGE_IN} />)}
            {kind === 1 && <path d={`M 0 ${-s} L ${s * 0.9} ${s * 0.6} L ${-s * 0.9} ${s * 0.6} Z`} fill={col} {...EDGE_IN} strokeLinejoin="round" />}
            {kind === 2 && <><ellipse rx={s * 0.9} ry={s * 0.6} fill={tint(col, 0.3)} {...EDGE_IN} /><ellipse cx={-s * 0.2} cy={-s * 0.15} rx={s * 0.3} ry={s * 0.18} fill="#ffffff" /></>}
            {kind === 3 && <path d={`M ${-s} 0 Q ${-s * 0.5} ${-s * 0.8} 0 0 Q ${s * 0.5} ${s * 0.8} ${s} 0`} stroke={INK} strokeWidth={s * 0.5 + 2} fill="none" strokeLinecap="round" />}
            {kind === 3 && <path d={`M ${-s} 0 Q ${-s * 0.5} ${-s * 0.8} 0 0 Q ${s * 0.5} ${s * 0.8} ${s} 0`} stroke={col} strokeWidth={s * 0.5 - 1} fill="none" strokeLinecap="round" />}
          </g>
        );
      })}
    </>
  );
};
/** Far haze: big soft shapes a little lighter than the ground, no outline (depth). */
const Haze: React.FC<{seed: number; col: string; n?: number; y0?: number; y1?: number}> = ({seed, col, n = 7, y0 = 0, y1 = 1920}) => (
  <>{Array.from({length: n}, (_, i) => <path key={i} d={lobe(rnd(i, seed) * 1080, y0 + 140 + rnd(i, seed + 1) * (y1 - y0 - 280), 160 + rnd(i, seed + 2) * 140, 120 + rnd(i, seed + 3) * 120, seed + i, 9)} fill={col} />)}</>
);
/** Near framing: big out-of-focus shapes cut by the frame edge, no outline, a flat shade band. */
const Frame: React.FC<{shapes: [number, number, number, number, number][]; col: string}> = ({shapes, col}) => (
  <>{shapes.map(([x, y, rx, ry, seed], i) => <g key={i}><path d={lobe(x, y, rx, ry, seed, 9)} fill={col} /><path d={lobe(x + rx * 0.1, y + ry * 0.14, rx * 0.8, ry * 0.76, seed + 1, 9)} fill={shade(col, 0.08)} /></g>)}</>
);
/** Points along a polyline with the unit normal at each, every `step` px. */
const along = (ctrl: P[], step: number): {p: P; n: P; a: number}[] => {
  const out: {p: P; n: P; a: number}[] = [];
  for (let i = 0; i < ctrl.length - 1; i++) {
    const [x0, y0] = ctrl[i], [x1, y1] = ctrl[i + 1], L = Math.hypot(x1 - x0, y1 - y0), ux = (x1 - x0) / L, uy = (y1 - y0) / L;
    for (let s = 0; s < L; s += step) out.push({p: [x0 + ux * s, y0 + uy * s], n: [-uy, ux], a: (Math.atan2(uy, ux) * 180) / Math.PI});
  }
  return out;
};

// =================================================================== 1. the bite, in cross-section
const SKY = '#cfe8f2';
const EPI = tint('#f0c39d', 0.12), EPI_TOP = tint('#e6b48b', 0.05), DERMIS = tint(FLESH.coral, 0.32), FAT = tint(FLESH.butter, 0.35);
const COLLAGEN = shade(DERMIS, 0.1);
const NERVE_Y = tint(FLESH.butter, 0.1);
export const BitePlace: React.FC<{t: number; fang?: number; drops?: number}> = ({t, fang = 0, drops = 0}) => {
  const fl = (d: number) => float(t, d);
  const loopV: P[] = [[-60, 1290], [180, 1230], [300, 1080], [380, 980], [470, 1000], [520, 1120], [640, 1270], [860, 1240], [960, 1110], [1040, 1060], [1160, 1080]];
  const vessel = tube(loopV, Array(loopV.length).fill(92), ['cut', 'cut'], 10, 3);
  const hair = (x: number, sw: number) => `M ${x} 560 Q ${x + 8} 420 ${x + 10 + sw} 300 Q ${x + 20 + sw * 1.4} 160 ${x + 60 + sw * 2} 30`;
  const fangY = -420 + fang * 1120; // the tip goes from above the frame into the dermis
  const nerve = 'M 1140 1380 C 900 1330 700 1180 620 900 M 760 1250 C 690 1150 560 1120 470 980 M 640 960 C 600 860 610 760 650 640 M 520 1040 C 440 940 380 860 360 720';
  const vSmooth = pathPts(loopV, 6);
  return (
    <Scene bg={DERMIS}>
      {/* far: haze, a second deep capillary, collagen bundles with fibroblasts, fat lobules with septa */}
      <Depth {...fl(0)}>
        <Layer>
          <rect x={-60} y={0} width={1200} height={300} fill={SKY} />
          {[[120, 120, 90], [520, 60, 60], [880, 170, 110]].map(([x, y, r], i) => <ellipse key={i} cx={x + sway(t, 14, i) * 30} cy={y} rx={r} ry={r * 0.32} fill={tint(SKY, 0.4)} />)}
          <Haze seed={300} col={tint(DERMIS, 0.1)} n={8} y0={600} y1={1500} />
          <path d={tube([[-60, 900], [300, 860], [700, 930], [1140, 880]], [44, 44, 44, 44], ['cut', 'cut'], 10, 9).d} fill={tint(RED, 0.62)} stroke={shade(DERMIS, 0.12)} strokeWidth={2} />
          {Array.from({length: 7}, (_, i) => <Bundle key={i} pts={Array.from({length: 8}, (_, j): P => [-60 + j * 175, 650 + i * 120 + Math.sin(j * 1.3 + i * 1.7 + t * 0.5) * 18])} w={26 + (i % 3) * 6} col={i % 2 ? COLLAGEN : tint(COLLAGEN, 0.12)} line={false} />)}
          {Array.from({length: 7}, (_, i) => <Spindle key={i} x={80 + rnd(i, 71) * 940} y={700 + rnd(i, 72) * 720} l={90 + rnd(i, 73) * 40} rot={(rnd(i, 74) - 0.5) * 30} col={tint(DERMIS, 0.3)} />)}
          <rect x={-60} y={1500} width={1200} height={520} fill={shade(FAT, 0.05)} />
          {Array.from({length: 11}, (_, i) => {
            const x = 40 + (i % 6) * 200 + (i > 5 ? 100 : 0), y = 1600 + (i > 5 ? 190 : 0);
            return (
              <g key={i}>
                <path d={lobe(x, y, 102, 88, i + 40)} fill={tint(FAT, 0.25)} {...EDGE_IN} />
                <path d={lobe(x + 14, y + 16, 78, 64, i + 41)} fill={tint(FAT, 0.12)} />
                <path d={lobe(x - 22, y - 26, 44, 22, i + 42, 7)} fill={tint(FAT, 0.5)} />
                <path d={`M ${x + 70} ${y + 34} Q ${x + 92} ${y + 4} ${x + 84} ${y - 30}`} stroke={shade(FAT, 0.3)} strokeWidth={9} strokeLinecap="round" fill="none" />
              </g>
            );
          })}
          <path d="M -60 1500 Q 270 1470 540 1505 Q 820 1540 1140 1495" {...INLINE} />
          <path d={tube([[-60, 1700], [380, 1690], [700, 1720], [1140, 1690]], [30, 30, 30, 30], ['cut', 'cut'], 10, 5).d} fill={tint(RED, 0.4)} {...EDGE_IN} />
        </Layer>
      </Depth>
      {/* mid: the capillary loop (wall cells, red cells streaming), the sweat gland, the nerve twig, the hair */}
      <Depth {...fl(0.4)}>
        <Layer>
          <path d={vessel.d} fill={tint(RED, 0.55)} {...EDGE} />
          <path d={tube(loopV, Array(loopV.length).fill(64), ['cut', 'cut'], 10, 3).d} fill={tint(FLESH.maroon, 0.25)} />
          <path d={tube(loopV, Array(loopV.length).fill(26), ['cut', 'cut'], 10, 3).d} fill={tint(FLESH.maroon, 0.32)} transform="translate(0 12)" />
          {along(vSmooth, 70).map(({p, n, a}, i) => i % 2 ? null : <ellipse key={i} cx={f(p[0] + n[0] * 38 * (i % 4 ? 1 : -1))} cy={f(p[1] + n[1] * 38 * (i % 4 ? 1 : -1))} rx={18} ry={6} transform={`rotate(${f(a)} ${f(p[0] + n[0] * 38 * (i % 4 ? 1 : -1))} ${f(p[1] + n[1] * 38 * (i % 4 ? 1 : -1))})`} fill={shade(tint(RED, 0.55), 0.22)} />)}
          <Stream pts={pathPts(loopV, 12)} t={t} n={16} r={22} speed={0.06} />
          {/* sweat gland coil and its duct to a pore */}
          <path d={`M 820 560 C 830 760 760 900 800 1040`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={`M 820 560 C 830 760 760 900 800 1040`} stroke={tint('#bfe3f5', 0.2)} strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d={`M 820 560 C 830 760 760 900 800 1040`} stroke={tint('#bfe3f5', 0.6)} strokeWidth={4} fill="none" strokeDasharray="14 18" />
          {Array.from({length: 7}, (_, i) => <g key={i}><ellipse cx={800 + Math.cos(i * 1.9) * 40} cy={1080 + Math.sin(i * 1.9) * 30} rx={34} ry={22} fill={tint('#bfe3f5', 0.2)} {...EDGE_IN} /><ellipse cx={800 + Math.cos(i * 1.9) * 40} cy={1080 + Math.sin(i * 1.9) * 30} rx={14} ry={8} fill={tint('#bfe3f5', 0.65)} /></g>)}
          {/* a sweat bead travels up the duct */}
          <circle cx={f(812 - ((t * 0.35) % 1) * 4)} cy={f(1030 - ((t * 0.35) % 1) * 460)} r={7} fill="#ffffff" {...EDGE_IN} />
          {/* the hair: root bulb, follicle sleeve, sebaceous gland, shaft out into the air */}
          <path d="M 160 1090 Q 120 900 150 560 L 210 560 Q 236 900 214 1090 Q 188 1124 160 1090 Z" fill={tint(DERMIS, 0.3)} {...EDGE_IN} />
          <path d="M 168 1060 Q 138 900 162 600 L 176 600 Q 160 900 186 1070 Z" fill={tint(DERMIS, 0.46)} />
          {[[262, 740, 38, 30], [290, 790, 32, 26], [256, 812, 30, 24], [236, 770, 22, 20]].map(([x, y, rx, ry], i) => <g key={i}><path d={lobe(x, y, rx, ry, 120 + i, 8)} fill={tint(FLESH.butter, 0.25)} {...EDGE_IN} /><circle cx={x} cy={y} r={5} fill={shade(FLESH.butter, 0.2)} /></g>)}
          <ellipse cx={186} cy={1080} rx={40} ry={32} fill={tint('#8a5a3c', 0.25)} {...EDGE_IN} />
          <ellipse cx={176} cy={1072} rx={18} ry={12} fill={tint('#8a5a3c', 0.45)} />
          <path d={hair(180, sway(t, 3.2, 1) * 10)} stroke={INK} strokeWidth={20} strokeLinecap="round" fill="none" />
          <path d={hair(180, sway(t, 3.2, 1) * 10)} stroke="#5a3a2a" strokeWidth={12} strokeLinecap="round" fill="none" />
          <path d={hair(178, sway(t, 3.2, 1) * 10)} stroke="#7a5640" strokeWidth={3} strokeLinecap="round" fill="none" />
          {/* the nerve twig: sheath, a dashed axon line inside, little ending knobs */}
          <path d={nerve} stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d={nerve} stroke={NERVE_Y} strokeWidth={11} fill="none" strokeLinecap="round" />
          <path d={nerve} stroke={shade(NERVE_Y, 0.2)} strokeWidth={2.4} fill="none" strokeDasharray="22 12" />
          {[[620, 900], [470, 980], [650, 640], [360, 720]].map(([x, y], i) => <g key={i}><circle cx={x} cy={y} r={13} fill={NERVE_Y} {...EDGE_IN} /><circle cx={x - 3} cy={y - 3} r={4} fill={tint(NERVE_Y, 0.6)} /></g>)}
          {/* a signal flash running down the twig */}
          {(() => { const u = (t * 0.7) % 1; const x = 1140 - u * 520, y = 1380 - u * 480 + Math.sin(u * 3) * 40; return <circle cx={f(x)} cy={f(y)} r={9} fill="#ffffff" {...EDGE_IN} />; })()}
          <Bits t={t} n={14} seed={301} col={tint(DERMIS, 0.35)} size={8} area={[0, 620, 1080, 860]} />
        </Layer>
      </Depth>
      {/* near: the epidermis layers (flat top cells, round middle cells with granules, the basal row), the fang, saliva */}
      <Depth {...fl(0.7)}>
        <Layer>
          {Array.from({length: 4}, (_, row) => Array.from({length: 9}, (_, i) => {
            const w = 150, h = 58 - row * 6, x = -40 + i * w + (row % 2 ? 70 : 0), y = 300 + row * 62 + (row === 0 ? sway(t, 4, i) * 3 : 0);
            const col = row === 0 ? EPI_TOP : row === 1 ? tint(EPI, 0.04) : EPI;
            return (
              <g key={row + '-' + i}>
                <rect x={x} y={y} width={w - 8} height={h} rx={row === 0 ? 10 : 22} fill={col} {...EDGE_IN} />
                <rect x={x + 10} y={y + h * 0.58} width={w - 28} height={h * 0.26} rx={h * 0.13} fill={shade(col, 0.07)} />
                {row > 0 && Array.from({length: 4}, (_, k) => <circle key={k} cx={x + 22 + k * 30 + rnd(k + i, row) * 10} cy={y + 12 + rnd(k, i + row) * (h - 24)} r={3} fill={shade(col, row === 1 ? 0.3 : 0.18)} />)}
              </g>
            );
          }))}
          {Array.from({length: 4}, (_, row) => Array.from({length: 9}, (_, i) => row === 0 ? null : <ellipse key={'n' + row + i} cx={-40 + i * 150 + (row % 2 ? 70 : 0) + 70} cy={300 + row * 62 + 26 - row * 2} rx={12} ry={8} fill={shade(EPI, 0.2)} />))}
          {/* the basal row: tall dark cells with melanin caps */}
          {Array.from({length: 18}, (_, i) => {
            const x = -30 + i * 64, y = 548;
            return <g key={'b' + i}><rect x={x} y={y} width={58} height={44} rx={16} fill={shade(EPI, 0.1)} {...EDGE_IN} /><ellipse cx={x + 29} cy={y + 26} rx={11} ry={13} fill={shade(EPI, 0.3)} /><path d={`M ${x + 16} ${y + 12} Q ${x + 29} ${y + 4} ${x + 42} ${y + 12}`} stroke="#7a4e36" strokeWidth={5} strokeLinecap="round" fill="none" /></g>;
          })}
          <path d="M -60 594 Q 140 604 300 594 Q 520 584 760 598 Q 960 608 1140 594" stroke={INK} strokeWidth={2.2} fill="none" />
          {/* a few dead flakes lifting off the top */}
          {[0, 1, 2].map((i) => { const u = ((t * 0.12 + i / 3) % 1); return <rect key={i} x={120 + i * 330 + u * 40} y={292 - u * 240} width={70} height={18} rx={8} transform={`rotate(${f(u * 50 - 10)} ${120 + i * 330} ${292 - u * 240})`} fill={EPI_TOP} opacity={1 - u} {...EDGE_IN} />; })}
          {/* the fang */}
          <path d={`M 400 ${f(fangY - 900)} L 720 ${f(fangY - 900)} Q 700 ${f(fangY - 260)} 572 ${f(fangY)} Q 550 ${f(fangY + 16)} 536 ${f(fangY - 12)} Q 430 ${f(fangY - 300)} 400 ${f(fangY - 900)} Z`} fill="#fbf6ea" {...EDGE} />
          <path d={`M 640 ${f(fangY - 880)} Q 640 ${f(fangY - 300)} 562 ${f(fangY - 34)}`} stroke={shade('#fbf6ea', 0.12)} strokeWidth={14} strokeLinecap="round" fill="none" />
          <path d={`M 452 ${f(fangY - 860)} Q 470 ${f(fangY - 420)} 540 ${f(fangY - 90)}`} stroke="#ffffff" strokeWidth={9} strokeLinecap="round" fill="none" />
          {[0.35, 0.55, 0.72].map((u, i) => <path key={i} d={`M ${f(430 + u * 120)} ${f(fangY - 900 + u * 760)} q 30 -8 60 0`} stroke={shade('#fbf6ea', 0.18)} strokeWidth={2.2} fill="none" />)}
          {/* saliva drops with tiny viruses inside */}
          {Array.from({length: Math.round(drops * 6)}, (_, i) => {
            const u = ((t * 0.5 + i / 6) % 1);
            const x = 540 + (i - 2.5) * 46 + Math.sin(u * 4 + i) * 20, y = fangY + 30 + u * 520;
            return (
              <g key={i} opacity={Math.min(1, u * 8) * (1 - u * 0.6)}>
                <path d={`M ${f(x)} ${f(y - 34)} Q ${f(x + 26)} ${f(y)} ${f(x)} ${f(y + 22)} Q ${f(x - 26)} ${f(y)} ${f(x)} ${f(y - 34)} Z`} fill="#e9f1f2" {...EDGE_IN} />
                <circle cx={f(x)} cy={f(y + 4)} r={7} fill="#9d8cc2" {...EDGE_IN} />
              </g>
            );
          })}
        </Layer>
      </Depth>
      {/* nearest: out-of-focus framing at the lower corners */}
      <Depth {...fl(1)}>
        <Layer>
          <Frame shapes={[[-70, 1880, 230, 170, 501], [1150, 1790, 210, 220, 502]]} col={tint(FAT, 0.12)} />
          <Bits t={t} n={6} seed={311} col={tint(DERMIS, 0.5)} size={18} area={[0, 1300, 1080, 600]} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 2. the muscle
const MUS = tint('#c95c61', 0.14), MUS_B = shade(MUS, 0.12), MUS_GAP = tint(FLESH.maroon, 0.42);
const MITO = tint(FLESH.coral, 0.1);
/** One striped muscle fibre band (horizontal, slight tilt) that contracts in a travelling wave: a sheath
 * around it, myofibril lines along it, light and dark bands with Z-lines across, nuclei at the edge. */
const FibreBand: React.FC<{y: number; h: number; t: number; seed: number; tilt?: number}> = ({y, h, t, seed, tilt = 0}) => {
  const squeeze = (x: number) => 1 + Math.sin(x / 140 - t * 3 + seed) * 0.08;
  const edge = (k: number) => Array.from({length: 10}, (_, i): P => [-80 + i * 140, y + k * (h / 2) * squeeze(-80 + i * 140) + (i * 140) * tilt]);
  const id = 'fb' + useId().replace(/:/g, '');
  const body = loop([...edge(-1), ...edge(1).reverse()]);
  return (
    <g>
      <path d={loop([...edge(-1.12), ...edge(1.12).reverse()])} fill={tint(MUS_GAP, 0.16)} {...EDGE_IN} />
      <clipPath id={id}><path d={body} /></clipPath>
      <path d={body} fill={MUS} />
      <g clipPath={`url(#${id})`}>
        {Array.from({length: 44}, (_, i) => {
          const x = -80 + i * 30 + Math.sin(i / 4.6 - t * 3 + seed) * 6;
          const hh = (h / 2) * squeeze(x) * 1.1;
          const yy = (x + 80) * tilt;
          return (
            <g key={i}>
              <path d={`M ${f(x)} ${f(y - hh + yy)} L ${f(x)} ${f(y + hh + yy)}`} stroke={i % 2 ? MUS_B : tint(MUS, 0.18)} strokeWidth={i % 2 ? 9 : 5} />
              {i % 4 === 0 && <path d={`M ${f(x + 8)} ${f(y - hh + yy)} L ${f(x + 8)} ${f(y + hh + yy)}`} stroke={shade(MUS, 0.3)} strokeWidth={1.8} />}
            </g>
          );
        })}
        {/* myofibrils: thin lines along the fibre */}
        {[-0.5, 0, 0.5].map((k, i) => <path key={i} d={open(edge(k))} stroke={shade(MUS, 0.12)} strokeWidth={1.6} fill="none" strokeDasharray="60 22" />)}
        {/* flat light band on top, shade band at the bottom */}
        <path d={open(edge(-0.78))} stroke={tint(MUS, 0.2)} strokeWidth={h * 0.1} fill="none" opacity={0.8} />
        <path d={open(edge(0.86))} stroke={shade(MUS, 0.12)} strokeWidth={h * 0.16} fill="none" />
        {/* tiny mitochondria between the myofibrils */}
        {Array.from({length: 9}, (_, i) => <ellipse key={i} cx={f(-40 + i * 140 + rnd(i, seed) * 60)} cy={f(y + (rnd(i, seed + 1) - 0.5) * h * 0.6 + (i * 140) * tilt)} rx={14} ry={5} fill={tint(FLESH.coral, 0.2)} stroke={shade(MUS, 0.3)} strokeWidth={1.4} />)}
      </g>
      <path d={body} fill="none" {...EDGE} />
      {[0.2, 0.55, 0.85].map((u, i) => <g key={i}><ellipse cx={f(-80 + u * 1260)} cy={f(y - h * 0.4 + (u * 1260) * tilt)} rx={50} ry={15} fill={shade(MUS, 0.24)} {...EDGE_IN} /><ellipse cx={f(-90 + u * 1260)} cy={f(y - h * 0.4 + (u * 1260) * tilt - 3)} rx={14} ry={5} fill={shade(MUS, 0.4)} /></g>)}
    </g>
  );
};
export const MusclePlace: React.FC<{t: number}> = ({t}) => {
  const fl = (d: number) => float(t, d);
  return (
    <Scene bg={MUS_GAP}>
      <Depth {...fl(0)} k={1 + beat(t) * 0.01}>
        <Layer>
          <Haze seed={330} col={tint(MUS_GAP, 0.08)} n={9} />
          {Array.from({length: 7}, (_, i) => {
            const y0 = 160 + i * 290;
            return (
              <g key={i}>
                <path d={tube([[-80, y0], [1160, y0 - 40]], [150, 150], ['cut', 'cut'], 6, i).d} fill={shade(MUS_GAP, 0.12)} stroke={shade(MUS_GAP, 0.24)} strokeWidth={2} />
                {Array.from({length: 26}, (_, j) => <path key={j} d={`M ${-60 + j * 48} ${f(y0 - 60 - j * 1.6)} L ${-60 + j * 48} ${f(y0 + 60 - j * 1.6)}`} stroke={shade(MUS_GAP, 0.19)} strokeWidth={6} />)}
              </g>
            );
          })}
        </Layer>
      </Depth>
      <Depth {...fl(0.4)}>
        <Layer>
          {/* connective tissue strands in the gaps */}
          {[640, 700, 1500, 1720].map((yy, i) => <Bundle key={i} pts={Array.from({length: 8}, (_, j): P => [-80 + j * 180, yy + Math.sin(j * 1.4 + i * 2 + t * 0.6) * 14])} w={12} col={tint(MUS_GAP, 0.3)} line={false} />)}
          <FibreBand y={430} h={300} t={t} seed={1} tilt={-0.03} />
          {/* the capillary between the fibres */}
          <path d={tube([[-80, 820], [400, 790], [800, 840], [1160, 800]], [96, 96, 96, 96], ['cut', 'cut'], 12, 4).d} fill={tint(RED, 0.55)} {...EDGE} />
          <path d={tube([[-80, 820], [400, 790], [800, 840], [1160, 800]], [66, 66, 66, 66], ['cut', 'cut'], 12, 4).d} fill={tint(FLESH.maroon, 0.25)} />
          <path d={tube([[-80, 830], [400, 800], [800, 850], [1160, 810]], [22, 22, 22, 22], ['cut', 'cut'], 12, 4).d} fill={tint(FLESH.maroon, 0.32)} />
          {along(pathPts([[-80, 820], [400, 790], [800, 840], [1160, 800]], 8), 90).map(({p, n, a}, i) => <ellipse key={i} cx={f(p[0] + n[0] * 40 * (i % 2 ? 1 : -1))} cy={f(p[1] + n[1] * 40 * (i % 2 ? 1 : -1))} rx={20} ry={6} transform={`rotate(${f(a)} ${f(p[0] + n[0] * 40 * (i % 2 ? 1 : -1))} ${f(p[1] + n[1] * 40 * (i % 2 ? 1 : -1))})`} fill={shade(tint(RED, 0.55), 0.22)} />)}
          <Stream pts={pathPts([[-80, 820], [400, 790], [800, 840], [1160, 800]], 14)} t={t} n={10} r={24} speed={0.09} seed={4} />
          <FibreBand y={1200} h={360} t={t + 0.6} seed={2} tilt={0.02} />
          {/* mitochondria and glycogen in the gaps */}
          {Array.from({length: 7}, (_, i) => {
            const x = 80 + i * 150, y = 1600 + Math.sin(i * 2.1) * 40 + sway(t, 3, i) * 6;
            return <g key={i} transform={`rotate(${f(-20 + i * 9)} ${x} ${y})`}><path d={lobe(x, y, 64, 30, i + 70, 10)} fill={MITO} {...EDGE_IN} /><path d={lobe(x + 6, y + 8, 54, 18, i + 71, 10)} fill={shade(MITO, 0.08)} /><path d={open([[x - 46, y], [x - 30, y - 16], [x - 14, y + 14], [x + 2, y - 16], [x + 18, y + 14], [x + 34, y - 14], [x + 48, y]])} {...INLINE} /></g>;
          })}
          {Array.from({length: 30}, (_, i) => <circle key={i} cx={f(rnd(i, 341) * 1080)} cy={f(i % 2 ? 640 + rnd(i, 342) * 80 : 1430 + rnd(i, 343) * 300)} r={4 + rnd(i, 344) * 3} fill={tint(MUS_GAP, 0.5)} stroke={shade(MUS_GAP, 0.2)} strokeWidth={1.4} />)}
          <Spindle x={880} y={1450} l={120} rot={6} col={tint(MUS_GAP, 0.35)} />
          <Spindle x={170} y={690} l={110} rot={-4} col={tint(MUS_GAP, 0.35)} />
        </Layer>
      </Depth>
      <Depth {...fl(0.8)}>
        <Layer>
          <Specks t={t} n={22} seed={11} col={tint(MUS_GAP, 0.4)} size={8} />
          <Bits t={t} n={12} seed={351} col={tint(MUS_GAP, 0.45)} size={11} />
          <path d={tube([[-80, 1850], [600, 1800], [1160, 1880]], [210, 210, 210], ['cut', 'cut'], 10, 9).d} fill={shade(MUS, 0.2)} {...EDGE} />
          {Array.from({length: 40}, (_, j) => <path key={j} d={`M ${-80 + j * 32} ${f(1760 + Math.abs(j - 21) * 0.4)} L ${-80 + j * 32} 1960`} stroke={j % 2 ? shade(MUS, 0.3) : shade(MUS, 0.15)} strokeWidth={j % 2 ? 9 : 5} />)}
        </Layer>
      </Depth>
      <Depth {...fl(1)}>
        <Layer>
          <Frame shapes={[[-60, 60, 220, 170, 521], [1130, 20, 170, 150, 522]]} col={shade(MUS, 0.26)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 3. the door: the nerve ending on the muscle
const BULB = tint(FLESH.butter, 0.45), BULB_IN = tint(FLESH.butter, 0.62), VES = '#ffffff', CLEFT = tint(FLESH.maroon, 0.5);
const LOCK = tint('#e2bf63', 0.3);
export const DOOR = {locks: [300, 440, 580, 720, 860], lockY: 1250};
export const DoorPlace: React.FC<{t: number; open?: number}> = ({t, open: unlocked = -1}) => {
  const fl = (d: number) => float(t, d);
  const fibre: P[] = [[700, -60], [660, 220], [600, 420]];
  return (
    <Scene bg={CLEFT}>
      <Depth {...fl(0)}>
        <Layer>
          <Haze seed={360} col={tint(CLEFT, 0.07)} n={6} y0={0} y1={1100} />
          {/* far: Schwann and muscle cells around the ending, each with its nucleus and organelles */}
          {Array.from({length: 14}, (_, i) => <CellBody key={i} x={(i % 5) * 260 + (i > 9 ? 130 : 0) - 20} y={140 + Math.floor(i / 5) * 230} rx={112} ry={82} seed={i + 90} fill={shade(CLEFT, 0.06)} detail={i % 3 === 0 ? 1 : 0} />)}
        </Layer>
      </Depth>
      <Depth {...fl(0.35)}>
        <Layer>
          {/* the nerve fibre coming down: myelin wraps with a node, microtubules inside */}
          <path d={tube(fibre, [170, 190, 260], ['cut', 'round'], 10, 2).d} fill={tint(FLESH.cream, 0.2)} {...EDGE} />
          {[-0.28, -0.1, 0.1, 0.28].map((k, i) => <path key={i} d={open(fibre.map(([x, y], j): P => [x + k * [170, 190, 230][j], y]))} stroke={shade(FLESH.cream, 0.12)} strokeWidth={2} fill="none" strokeDasharray="30 10" />)}
          {[0, 1, 2].map((i) => <path key={i} d={`M ${626 - i * 18} ${20 + i * 130} Q ${700 - i * 18} ${0 + i * 130} ${760 - i * 22} ${40 + i * 130}`} {...INLINE} />)}
          {[[690, 60], [672, 190]].map(([x, y], i) => <path key={'m' + i} d={`M ${x - 92} ${y - 30} Q ${x} ${y - 52} ${x + 92} ${y - 30} L ${x + 92} ${y + 30} Q ${x} ${y + 8} ${x - 92} ${y + 30} Z`} fill={tint(FLESH.butter, 0.55)} {...EDGE_IN} />)}
          <path d="M 120 1080 C 80 760 260 470 560 420 C 860 380 1040 640 1000 1080 Q 560 1150 120 1080 Z" fill={BULB} {...EDGE} />
          <path d="M 200 1050 C 180 800 330 560 560 520 C 800 490 940 700 920 1050 Q 560 1100 200 1050 Z" fill={BULB_IN} />
          <path d="M 860 1060 C 940 860 900 660 780 540 C 930 620 990 800 960 1066 Z" fill={shade(BULB, 0.07)} />
          {/* mitochondria and microtubule tracks in the bulb */}
          {[[-0.2, 0], [0, 0], [0.2, 0]].map(([k], i) => <path key={'t' + i} d={`M ${600 + k * 300} 470 Q ${560 + k * 600} 640 ${540 + k * 900} 860`} stroke={shade(BULB_IN, 0.1)} strokeWidth={2.4} fill="none" strokeDasharray="26 12" />)}
          {[[420, 640, 30], [720, 610, -24], [560, 560, 8], [330, 820, 60], [820, 800, -60]].map(([x, y, r], i) => <Mito key={'mi' + i} x={x + sway(t, 5, i) * 6} y={y} l={74} rot={r} col={tint(FLESH.coral, 0.3)} />)}
          {/* vesicles: drift down to the membrane, touch it and pop into sparks across the gap */}
          {Array.from({length: 16}, (_, i) => {
            const cyc = (t * 0.45 + rnd(i, 3)) % 1;
            const x = 260 + rnd(i, 5) * 600, y0 = 600 + rnd(i, 7) * 220, y = y0 + cyc * (1040 - y0);
            const popped = cyc > 0.9;
            return popped ? (
              <g key={i}>{[0, 1, 2, 3, 4].map((j) => { const a = (j / 5) * Math.PI + Math.PI * 0.05; const r = 20 + (cyc - 0.9) * 600; return <circle key={j} cx={f(x + Math.cos(a) * r * 0.6)} cy={f(1080 + Math.sin(a) * r)} r={6} fill="#ffe27a" {...EDGE_IN} />; })}</g>
            ) : (
              <g key={i} opacity={Math.min(1, cyc * 10)}><circle cx={f(x)} cy={f(y)} r={30} fill={VES} {...EDGE_IN} /><circle cx={f(x + 6)} cy={f(y + 8)} r={22} fill={shade(VES, 0.05)} />{[0, 1, 2].map((j) => <circle key={j} cx={f(x - 9 + j * 9)} cy={f(y + (j === 1 ? -6 : 5))} r={4.5} fill="#ffe27a" />)}</g>
            );
          })}
          {/* active zones: dark bars on the inside of the bulb membrane, over the locks */}
          {DOOR.locks.map((x, i) => <rect key={'az' + i} x={x - 30} y={1062 + Math.abs(x - 560) * 0.02} width={60} height={12} rx={6} fill={shade(BULB, 0.3)} {...EDGE_IN} />)}
          {/* the cleft: a dotted basal lamina across it */}
          <path d="M -80 1166 Q 540 1140 1160 1166" stroke={tint(CLEFT, 0.4)} strokeWidth={4} strokeDasharray="4 14" strokeLinecap="round" fill="none" />
          {/* the muscle membrane: junctional folds under the locks, then the striped muscle */}
          <path d="M -80 1220 Q 540 1180 1160 1220 L 1160 2000 L -80 2000 Z" fill={MUS} {...EDGE} />
          {Array.from({length: 40}, (_, i) => <path key={i} d={`M ${-80 + i * 32} 1440 L ${-80 + i * 32} 2000`} stroke={i % 2 ? MUS_B : tint(MUS, 0.18)} strokeWidth={i % 2 ? 8 : 4} />)}
          {Array.from({length: 10}, (_, i) => <path key={'z' + i} d={`M ${-80 + i * 128 + 16} 1440 L ${-80 + i * 128 + 16} 2000`} stroke={shade(MUS, 0.3)} strokeWidth={2} />)}
          <path d="M -80 1440 Q 540 1420 1160 1440" {...INLINE} />
          {[230, 370, 510, 650, 790, 930].map((x, i) => <path key={'fold' + i} d={`M ${x - 26} 1226 Q ${x - 22} 1300 ${x} 1318 Q ${x + 22} 1300 ${x + 26} 1226`} fill={shade(MUS, 0.1)} stroke={shade(MUS, 0.3)} strokeWidth={2.4} />)}
          {Array.from({length: 5}, (_, i) => <g key={'nu' + i}><ellipse cx={100 + i * 220} cy={1560 + (i % 2) * 180} rx={56} ry={18} fill={shade(MUS, 0.24)} {...EDGE_IN} /><ellipse cx={86 + i * 220} cy={1556 + (i % 2) * 180} rx={14} ry={5} fill={shade(MUS, 0.42)} /></g>)}
          {DOOR.locks.map((x, i) => (
            <g key={i}>
              <rect x={x - 42} y={DOOR.lockY - 70} width={84} height={96} rx={14} fill={i === unlocked ? tint(LOCK, 0.4) : LOCK} {...EDGE} />
              <rect x={x - 32} y={DOOR.lockY + 4} width={64} height={14} rx={7} fill={shade(i === unlocked ? tint(LOCK, 0.4) : LOCK, 0.12)} />
              <rect x={x - 34} y={DOOR.lockY - 62} width={14} height={60} rx={7} fill={tint(LOCK, 0.45)} />
              <path d={`M ${x} ${DOOR.lockY - 48} m -12 0 a 12 12 0 1 1 24 0 Q ${x + 10} ${DOOR.lockY - 30} ${x + 8} ${DOOR.lockY - 6} L ${x - 8} ${DOOR.lockY - 6} Q ${x - 10} ${DOOR.lockY - 30} ${x - 12} ${DOOR.lockY - 48} Z`} fill={i === unlocked ? '#ffffff' : shade(FLESH.maroon, 0.1)} {...EDGE_IN} />
            </g>
          ))}
          <Bits t={t} n={10} seed={371} col={tint(CLEFT, 0.45)} size={9} area={[0, 1090, 1080, 110]} flow={[22, 0]} />
        </Layer>
      </Depth>
      <Depth {...fl(0.85)}>
        <Layer>
          <Specks t={t} n={14} seed={21} col={tint(CLEFT, 0.5)} size={10} flow={[20, -10]} />
          <path d={lobe(-40, 1820, 260, 200, 7)} fill={shade(MUS, 0.22)} {...EDGE} />
          <path d={lobe(-10, 1850, 200, 140, 17)} fill={shade(MUS, 0.3)} />
          <path d={lobe(1120, 1760, 240, 220, 8)} fill={shade(MUS, 0.22)} {...EDGE} />
          <path d={lobe(1140, 1800, 180, 160, 18)} fill={shade(MUS, 0.3)} />
        </Layer>
      </Depth>
      <Depth {...fl(1)}>
        <Layer>
          <Bits t={t} n={5} seed={381} col={tint(CLEFT, 0.55)} size={20} area={[0, 200, 1080, 900]} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 4. the highway: inside the nerve
const TUBE_NEAR = tint(FLESH.cream, 0.15), TUBE_FAR = '#7c4b52', RAIL = '#b8845e';
const mixC = (a: string, b: string, k: number) => {
  const h = (c: string) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  const A = h(a), B = h(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, '0')).join('');
};
export const HIGHWAY = {vp: [540, 700] as P};
/** `run`: the distance travelled (for a speed that changes: integrate it, or the rings jump); default t * 0.55 * speed. */
export const HighwayPlace: React.FC<{t: number; speed?: number; run?: number}> = ({t, speed = 1, run: runIn}) => {
  const [vx, vy] = HIGHWAY.vp;
  const N = 12;
  const ring = (u: number) => { const s = Math.pow(u, 1.6); return {rx: 50 + s * 1150, ry: 70 + s * 1700, cy: vy + s * 420}; };
  const run = runIn ?? t * 0.55 * speed;
  return (
    <Scene bg={TUBE_FAR}>
      {/* v4: the tunnel walls and the brain are a far plane that dives about the vanishing point */}
      <Depth d={0.2} o={[vx, vy]}>
      <Layer>
        {/* rings from far to near, sliding toward the lens */}
        {Array.from({length: N}, (_, i) => {
          const u = (N - i - (run % 1)) / N; // 1 = nearest
          const r = ring(u), col = mixC(TUBE_FAR, TUBE_NEAR, Math.pow(u, 0.9));
          const band = (i + Math.floor(run)) % 2 === 0; // myelin segments: two tones, so the rush reads
          return (
            <g key={i}>
              <ellipse cx={vx} cy={r.cy} rx={r.rx} ry={r.ry} fill={band ? col : shade(col, 0.1)} {...EDGE} />
              <ellipse cx={vx} cy={r.cy} rx={r.rx * 0.93} ry={r.ry * 0.93} fill="none" stroke={shade(col, 0.16)} strokeWidth={6 + u * 10} />
              {/* myelin lamellae: thin wraps inside each ring; a node of Ranvier every fourth ring */}
              {u > 0.25 && [0.965, 0.9].map((k, j) => <ellipse key={j} cx={vx} cy={r.cy} rx={r.rx * k} ry={r.ry * k} fill="none" stroke={j ? tint(col, 0.12) : shade(col, 0.26)} strokeWidth={j ? 3 + u * 6 : 1.6 + u * 2} />)}
              {(i + Math.floor(run)) % 4 === 0 && <ellipse cx={vx} cy={r.cy} rx={r.rx * 0.95} ry={r.ry * 0.95} fill="none" stroke={shade(col, 0.32)} strokeWidth={10 + u * 26} />}
            </g>
          );
        })}
        {/* microtubule tracks along the walls, their dashes streaming out toward the lens */}
        {Array.from({length: 22}, (_, i) => {
          const a = (i / 22) * Math.PI * 2 + 0.13, r0 = ring(0.05), r1 = ring(1.05);
          return <path key={'mt' + i} d={`M ${f(vx + Math.cos(a) * r0.rx * 0.9)} ${f(r0.cy + Math.sin(a) * r0.ry * 0.9)} L ${f(vx + Math.cos(a) * r1.rx * 0.9)} ${f(r1.cy + Math.sin(a) * r1.ry * 0.9)}`}
            stroke={i % 2 ? shade(TUBE_NEAR, 0.2) : tint(TUBE_FAR, 0.25)} strokeWidth={i % 2 ? 3 : 5} strokeDasharray="70 40" strokeDashoffset={f(-run * 220 * (i % 3 + 1))} opacity={0.75} />;
        })}
        {/* mitochondria riding the tracks out toward us (cargo on the axon) */}
        {Array.from({length: 7}, (_, i) => {
          const u = Math.pow((t * 0.16 * speed + i / 7) % 1, 1.15), r = ring(u), a = (i / 7) * Math.PI * 2 + 0.6;
          const x = vx + Math.cos(a) * r.rx * 0.82, y = r.cy + Math.sin(a) * r.ry * 0.82;
          return <Mito key={'mc' + i} x={x} y={y} l={14 + u * 120} rot={(a * 180) / Math.PI + 90} col={tint(FLESH.coral, 0.22)} />;
        })}
        {/* neurofilament dots drifting */}
        {Array.from({length: 26}, (_, i) => {
          const u = (t * 0.22 * speed + rnd(i, 391)) % 1, r = ring(u), a = rnd(i, 392) * Math.PI * 2;
          return <circle key={'nf' + i} cx={f(vx + Math.cos(a) * r.rx * (0.3 + rnd(i, 393) * 0.5))} cy={f(r.cy + Math.sin(a) * r.ry * (0.3 + rnd(i, 393) * 0.5))} r={f(2 + u * 9)} fill={tint(TUBE_NEAR, 0.4)} stroke={INK} strokeWidth={1.4} opacity={0.4 + u * 0.6} />;
        })}
        {/* the brain, far away at the end of the tunnel */}
      </Layer>
      <Put x={vx} y={vy - 10} size={120}><Brain mood="scared" mouth="wavy" look={[0, 0.6]} /></Put>
      </Depth>
      {/* the rails stay on the ground plane (the Virus stands on them) */}
      <Layer>
        {/* three rails in perspective, with sleepers rushing past */}
        {[-1, 0, 1].map((k) => (
          <g key={k}>
            <path d={`M ${vx + k * 16} ${vy + 40} L ${vx + k * 520} 2000`} stroke={INK} strokeWidth={26} />
            <path d={`M ${vx + k * 16} ${vy + 40} L ${vx + k * 520} 2000`} stroke={RAIL} strokeWidth={16} />
            {Array.from({length: 8}, (_, j) => {
              const u = Math.pow(((j + (run * 2) % 1) / 8), 2);
              const y = vy + 40 + u * 1300, x = vx + k * (16 + u * 504);
              return <rect key={j} x={f(x - 10 - u * 40)} y={f(y - 4 - u * 8)} width={f(20 + u * 80)} height={f(8 + u * 16)} rx={4} fill={shade(RAIL, 0.2)} {...EDGE_IN} />;
            })}
          </g>
        ))}
        {/* signal pulses racing along the walls, out to the brain */}
        {Array.from({length: 5}, (_, i) => {
          const u = 1 - ((t * 0.9 + i / 5) % 1);
          const r = ring(u), a = (i * 1.3) % (Math.PI * 2);
          return <ellipse key={i} cx={f(vx + Math.cos(a) * r.rx * 0.92)} cy={f(r.cy + Math.sin(a) * r.ry * 0.92)} rx={f(8 + u * 50)} ry={f(4 + u * 22)} transform={`rotate(${f((a * 180) / Math.PI + 90)} ${f(vx + Math.cos(a) * r.rx * 0.92)} ${f(r.cy + Math.sin(a) * r.ry * 0.92)})`} fill="#ffe27a" {...EDGE_IN} />;
        })}
        {/* speed lines at the edges */}
        {Array.from({length: 12}, (_, i) => {
          const a = (i / 12) * Math.PI * 2 + 0.2, u = (t * 1.6 + rnd(i, 2)) % 1;
          const r0 = 380 + u * 700, r1 = r0 + 160 * speed;
          return <path key={i} d={`M ${f(vx + Math.cos(a) * r0)} ${f(vy + Math.sin(a) * r0 * 1.5)} L ${f(vx + Math.cos(a) * r1)} ${f(vy + Math.sin(a) * r1 * 1.5)}`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.6 * Math.sin(Math.PI * u)} />; // v4: fades in and out (no pop)
        })}
      </Layer>
      {/* near plane: floating bits close to the lens, they rush past fastest */}
      <Depth d={1} o={[vx, vy]}>
        <Layer><Bits t={t} n={10} seed={461} col={tint(TUBE_NEAR, 0.3)} size={16} flow={[0, 30 * speed]} area={[0, 200, 1080, 1100]} /></Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 5. the battle: the defence
const PLASMA = tint('#e9a0a6', 0.25), WALL = tint(FLESH.salmon, 0.12);
/** A defence cell (B cell) as a factory: a big round cell with a hatch that fires antibodies. */
const Factory: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const kick = Math.max(0, Math.sin(t * Math.PI * 2.4)) ** 6;
  return (
    <g transform={`translate(${x} ${y}) scale(${(1 + kick * 0.04).toFixed(3)} ${(1 - kick * 0.04).toFixed(3)})`}>
      <path d={lobe(0, 0, 200, 186, 33, 11)} fill="#e7e2f4" {...EDGE} />
      <path d={lobe(-20, 20, 120, 104, 34, 9)} fill={shade('#e7e2f4', 0.12)} />
      {/* the antibody factory inside: rough ER sheets with ribosomes, a Golgi stack, vesicles to the hatch */}
      {[0, 1, 2].map((k) => <path key={k} d={`M ${-160 + k * 22} ${40 + k * 22} Q ${-120 + k * 18} ${110 + k * 10} ${-40 + k * 8} ${130 + k * 14}`} stroke="#9b8cc8" strokeWidth={7} fill="none" strokeLinecap="round" />)}
      {[0, 1, 2].map((k) => [0, 1, 2].map((j) => <circle key={k + '-' + j} cx={-150 + k * 22 + j * 30} cy={58 + k * 22 + j * 26} r={3.4} fill="#6f5fa8" />))}
      {[0, 1, 2].map((k) => <path key={'g' + k} d={`M ${70 + k * 14} ${70 - k * 2} Q ${110 + k * 14} ${110} ${150 + k * 6} ${60 - k * 8}`} stroke="#c7b6ee" strokeWidth={11 - k * 2} fill="none" strokeLinecap="round" />)}
      {[0, 1, 2].map((k) => { const u = (t * 0.8 + k / 3) % 1; return <circle key={'v' + k} cx={f(150 + u * 40)} cy={f(40 - u * 90)} r={7} fill="#ffffff" {...EDGE_IN} />; })}
      <path d={lobe(-10, 6, 74, 64, 35, 8)} fill="#b9a8e0" {...EDGE_IN} />
      <path d={lobe(4, 20, 54, 44, 36, 8)} fill={shade('#b9a8e0', 0.1)} />
      <path d="M 150 -80 L 236 -110 L 250 -40 L 176 -14 Z" fill="#c9ccd3" {...EDGE} />
      <circle cx={-60} cy={-60} r={16} fill="#ffffff" {...EDGE_IN} /><circle cx={30} cy={-80} r={16} fill="#ffffff" {...EDGE_IN} />
      <circle cx={-58} cy={-58} r={6} fill={INK} /><circle cx={32} cy={-78} r={6} fill={INK} />
      <path d="M -40 -20 Q -10 4 22 -22" {...INLINE} />
    </g>
  );
};
export const BattlePlace: React.FC<{t: number; fire?: boolean; factory?: boolean}> = ({t, fire = true, factory = true}) => {
  const fl = (d: number) => float(t, d);
  return (
    <Scene bg={PLASMA}>
      <Depth {...fl(0)}>
        <Layer>
          {/* the vessel wall cells behind, brick-like and big, each with its nucleus and organelles */}
          <path d="M -80 -80 L 1160 -80 L 1160 640 Q 980 700 800 668 Q 560 630 300 690 Q 100 730 -80 680 Z" fill={shade(WALL, 0.14)} />
          {Array.from({length: 12}, (_, i) => <CellBody key={i} x={(i % 4) * 300 + (Math.floor(i / 4) % 2 ? 150 : 0)} y={120 + Math.floor(i / 4) * 230} rx={156} ry={106} seed={i + 50} fill={WALL} detail={1} nuc={[0, 0]} />)}
          <Haze seed={410} col={tint(PLASMA, 0.12)} n={6} y0={700} y1={1920} />
          {/* far plasma: small faceless cells drifting, platelets */}
          {Array.from({length: 5}, (_, i) => <g key={'fc' + i} opacity={0.75}><path d={lobe(f(((rnd(i, 421) * 1200 + t * 18) % 1200) - 60), 980 + rnd(i, 422) * 760, 46, 40, i + 423, 9)} fill={tint(PLASMA, 0.3)} stroke={shade(PLASMA, 0.16)} strokeWidth={2} /></g>)}
          <Stream pts={pathPts([[-80, 760], [1160, 700]], 20)} t={t} n={12} r={26} speed={0.12} seed={8} />
          <Bits t={t} n={14} seed={431} col={tint('#f2d16b', 0.3)} size={9} flow={[40, -4]} area={[0, 680, 1080, 160]} />
        </Layer>
      </Depth>
      <Depth {...fl(0.35)}>
        <Layer>
          {factory && <Factory x={220} y={1240} t={t} />}
        </Layer>
        {/* antibodies fired from the hatch, flying up-right in a stream */}
        {fire && factory && Array.from({length: 7}, (_, i) => {
          const u = (t * 0.55 + i / 7) % 1;
          const x = 440 + u * 560 + Math.sin(u * 6 + i) * 30, y = 1120 - u * 760 + Math.cos(u * 5 + i) * 30;
          return <Put key={i} x={x} y={y} size={110 + u * 40} rot={u * 360 + i * 40}><Antibody mood="angry" mouth="grit" /></Put>;
        })}
      </Depth>
      <Depth {...fl(0.8)}>
        <Layer>
          <Specks t={t} n={16} seed={31} col={tint(PLASMA, 0.45)} size={10} />
          <Bits t={t} n={12} seed={441} col={tint(PLASMA, 0.4)} size={11} />
          <path d={lobe(1040, 1860, 260, 210, 61)} fill={shade(WALL, 0.1)} {...EDGE} />
          <path d={lobe(1070, 1890, 200, 150, 62)} fill={shade(WALL, 0.18)} />
          {[0, 1, 2].map((k) => <ellipse key={k} cx={940 + k * 60} cy={1740 + k * 30} rx={20} ry={12} fill={shade(WALL, 0.28)} />)}
        </Layer>
      </Depth>
      <Depth {...fl(1)}>
        <Layer>
          {/* an out-of-focus red cell drifting across the top-right corner */}
          <g transform={`translate(${f(1060 + sway(t, 7, 3) * 20)} ${f(40 + sway(t, 9, 1) * 14)}) rotate(-20)`}><ellipse rx={190} ry={120} fill={tint(RED, 0.3)} /><ellipse rx={100} ry={52} fill={shade(tint(RED, 0.3), 0.1)} /></g>
        </Layer>
      </Depth>
    </Scene>
  );
};

// re-export for the sheet
export {WhiteCell, RedCell};
