/**
 * MedPeak Toons, look v8: the micro places of "What Happens When You Take Creatine" (`creatine`).
 * Each a full 1080 x 1920 frame in depth planes (far, middle, floating life, near framing), alive with `t`.
 *
 *   BloodPlace        inside a blood vessel, looking down it: wall rings rush at the lens, red cells and
 *                     creatine grains stream toward us, the vessel forks at the far end ("to the muscles").
 *     crea   0..1     how many grains ride the stream
 *   MuscleCellPlace   inside one muscle cell: four thick striped myofibrils, the batteries (ATP) docked in the
 *                     gaps between them, mitochondria, the cell's membrane at top and bottom.
 *     flex   0..1     the stripes squeeze together (the muscle contracts: a lift)
 *     drain  0..1     the batteries empty (green -> red)
 *     charge 0..1     sparks refill them (Crea's phosphate), from the drained level back to full
 *     water  0..1     water drops drift in and the membranes bulge outward (the cell swells a little)
 *   KidneyFilterPlace one filter of the kidney (a glomerulus): a tuft of looping capillaries in a cup; the blood
 *                     flows through; small grey-blue chips (creatinine) pass the filter and run down the tube.
 *     bits   0..1     how many creatinine chips
 *
 * Drawn with the kit only: one outline colour, flat fills, one darker tone, no gradients, no blur, no glow.
 */
import React from 'react';
import {EDGE, EDGE_IN, FLESH, INLINE, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {f, lobe, open, rnd, tube, type P} from './scenes-body';
import {Bits, Depth} from './micro3';
import {RedCell} from './cells';
import {Battery, Crea, CREA_COL, Grain, Muscle, roundPoly, Spark} from './crea-cast';
import {Kidney} from './organs-a';

const sway = (t: number, period: number, seed = 0) => Math.sin((t / period) * Math.PI * 2 + seed * 1.7);
const float = (t: number, depth: number) => ({dx: sway(t, 9, 1) * (3 + depth * 16), dy: sway(t, 11.5, 2) * (2 + depth * 11), d: depth});
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** Near framing: big dark shapes cut by the frame edge, no outline (out of focus). */
const Near: React.FC<{shapes: [number, number, number, number, number][]; col: string}> = ({shapes, col}) => (
  <>
    {shapes.map(([x, y, rx, ry, s], i) => (
      <g key={i}><path d={lobe(x, y, rx, ry, s, 9)} fill={col} /><path d={lobe(x + rx * 0.1, y + ry * 0.14, rx * 0.8, ry * 0.76, s + 1, 9)} fill={shade(col, 0.12)} /></g>
    ))}
  </>
);

// =================================================================== 1. the blood
export const BLOOD = {plasma: '#f3c7a8', wall: '#e58f7f', wall2: '#d9776a', deep: '#7c2f35', vp: [540, 760] as P};

export const BloodPlace: React.FC<{t: number; crea?: number}> = ({t, crea = 0.6}) => {
  const [vx, vy] = BLOOD.vp;
  // the wall rings: each ring's depth z (0 far .. 1 at the lens) moves toward us with t
  const N = 9;
  const rings = Array.from({length: N}, (_, i) => ((i / N + t * 0.11) % 1 + 1) % 1).sort((a, b) => b - a);
  const R = (z: number) => 70 + z * z * 1500;
  // things in the stream: lanes around the centre, z grows with t
  const items = Array.from({length: 16}, (_, i) => {
    const z = ((rnd(i, 801) + t * (0.16 + rnd(i, 802) * 0.06)) % 1 + 1) % 1;
    const a = rnd(i, 803) * Math.PI * 2;
    const spread = 0.25 + rnd(i, 804) * 0.55;
    const r = R(z) * spread;
    return {i, z, x: vx + Math.cos(a) * r, y: vy + Math.sin(a) * r * 1.1, s: 30 + z * z * 330, grain: rnd(i, 805) < crea * 0.6, rot: (rnd(i, 806) - 0.5) * 60 + t * 20 * (rnd(i, 807) - 0.5)};
  }).sort((a, b) => a.z - b.z);
  return (
    <Scene bg={BLOOD.wall}>
      <Depth {...float(t, 0)}>
        <Layer>
          {/* the rings, far to near: each a wall band (outer ellipse) over the next */}
          {rings.map((z, i) => (
            <g key={i}>
              <ellipse cx={vx} cy={vy} rx={f(R(z))} ry={f(R(z) * 1.12)} fill={i % 2 ? BLOOD.wall : BLOOD.wall2} stroke={shade(BLOOD.wall2, 0.2)} strokeWidth={2 + z * 3} />
            </g>
          ))}
          {/* the plasma: the open middle of the tube */}
          <ellipse cx={vx} cy={vy} rx={120} ry={136} fill={BLOOD.plasma} {...EDGE_IN} />
          {/* the fork at the far end: two openings, the right one toward the muscles */}
          <path d={lobe(vx - 44, vy + 4, 34, 46, 811, 8)} fill={BLOOD.deep} {...EDGE_IN} />
          <path d={lobe(vx + 46, vy - 2, 40, 52, 812, 8)} fill={BLOOD.deep} {...EDGE_IN} />
          <path d={`M ${vx + 2} ${vy - 60} Q ${vx} ${vy} ${vx + 4} ${vy + 64}`} stroke={tint(BLOOD.wall, 0.2)} strokeWidth={14} strokeLinecap="round" />
        </Layer>
      </Depth>
      <Depth {...float(t, 0.5)}>
        <Layer>
          {items.map((it) => (
            <g key={it.i} transform={`translate(${f(it.x)} ${f(it.y)}) rotate(${f(it.rot)}) scale(${f(it.s / 200)})`}>
              {it.grain ? <Grain seed={it.i} /> : <RedCell mood="closed" mouth="flat" />}
            </g>
          ))}
        </Layer>
      </Depth>
      <Depth {...float(t, 0.8)}>
        <Layer>
          <Bits t={t} n={14} seed={821} col={tint(BLOOD.plasma, 0.3)} size={10} />
        </Layer>
      </Depth>
      <Depth {...float(t, 1)}>
        <Layer>
          <Near shapes={[[-80, 200, 230, 260, 831], [1160, 1500, 220, 300, 832], [-40, 1900, 260, 160, 833]]} col={shade(BLOOD.wall2, 0.3)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 2. inside a muscle cell
export const CELL = {cyto: '#f7c4ad', fibril: '#cf5a62', band: '#a9434d', light: '#e98a8a', mem: '#f0d6a8', mito: tint(FLESH.coral, 0.1), water: '#bfe3f2'};
/** The myofibrils' centre lines (y at x = 0 and x = 1080) and their half height. */
export const FIBRILS: {y0: number; y1: number; h: number}[] = [
  {y0: 350, y1: 270, h: 112},
  {y0: 820, y1: 750, h: 120},
  {y0: 1280, y1: 1220, h: 112},
  {y0: 1750, y1: 1680, h: 116},
];
/** The middle line of the gap below fibril g, at x (the gaps tilt with the fibrils). */
export const gapY = (g: number, x: number) => {
  const a = FIBRILS[g], b = FIBRILS[g + 1];
  const y0 = (a.y0 + b.y0) / 2, y1 = (a.y1 + b.y1) / 2;
  return y0 + ((y1 - y0) * (x + 100)) / 1280;
};
/** Where the battery docks are (in the gaps between the fibrils). */
export const DOCKS: P[] = ([[0, 150], [0, 400], [0, 660], [0, 920], [1, 130], [1, 380], [1, 640], [1, 900], [2, 260], [2, 800]] as P[]).map(([g, x]) => [x, gapY(g, x) - 10]);

const Fibril: React.FC<{y0: number; y1: number; h: number; flex: number; seed: number}> = ({y0, y1, h, flex, seed}) => {
  const yAt = (x: number) => y0 + ((y1 - y0) * (x + 100)) / 1280;
  const period = 128 * (1 - flex * 0.28); // a sarcomere: shorter when it contracts
  const hh = h * (1 + flex * 0.08);
  const d = tube([[-100, yAt(-100)], [540, yAt(540) + sway(seed, 1) * 6], [1180, yAt(1180)]], [hh * 2, hh * 2, hh * 2], ['cut', 'cut'], 10, seed).d;
  const stripes: React.ReactNode[] = [];
  // the bands wrap round the rod: each edge is a curve bowing toward the lens (c), so the fibre reads as round
  const c = period * 0.22;
  const band = (x1: number, x2: number) => {
    const ya = yAt(x1), yb = yAt(x2);
    return `M ${f(x1)} ${f(ya - hh - 4)} Q ${f(x1 + c)} ${f(ya)} ${f(x1)} ${f(ya + hh + 4)} L ${f(x2)} ${f(yb + hh + 4)} Q ${f(x2 + c)} ${f(yb)} ${f(x2)} ${f(yb - hh - 4)} Z`;
  };
  for (let i = 0, x = -140 + (seed % 3) * 20; x < 1200; i++, x += period) {
    const y = yAt(x);
    // the dark A band (thick filaments), with the pale H zone in its middle, and the thin Z line between
    stripes.push(<path key={`a${i}`} d={band(x + period * 0.22, x + period * 0.72)} fill={CELL.band} />);
    stripes.push(<path key={`h${i}`} d={band(x + period * 0.43, x + period * 0.51)} fill={shade(CELL.fibril, 0.04)} />);
    stripes.push(<path key={`z${i}`} d={`M ${f(x)} ${f(y - hh - 4)} Q ${f(x + c)} ${f(y)} ${f(x)} ${f(y + hh + 4)}`} stroke={tint(CELL.light, 0.25)} strokeWidth={5} fill="none" />);
  }
  const id = `fib${seed}`;
  return (
    <g>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill={CELL.fibril} />
      <g clipPath={`url(#${id})`}>
        {stripes}
        {/* the top highlight and the bottom shade: the fibril is a round rod */}
        <path d={open([[-100, yAt(-100) - hh * 0.62], [1180, yAt(1180) - hh * 0.62]])} stroke={tint(CELL.light, 0.45)} strokeWidth={hh * 0.16} fill="none" />
        <path d={open([[-100, yAt(-100) + hh * 0.78], [1180, yAt(1180) + hh * 0.78]])} stroke={shade(CELL.band, 0.28)} strokeWidth={hh * 0.44} fill="none" />
      </g>
      <path d={d} {...EDGE} fill="none" />
    </g>
  );
};

/** The cell membrane at the top or bottom edge; `bulge` pushes it outward (the cell swells with water). */
const Membrane: React.FC<{top: boolean; bulge: number; t: number}> = ({top, bulge, t}) => {
  const s = top ? 1 : -1;
  const yb = top ? 70 - bulge * 46 : 1850 + bulge * 46;
  const pts: P[] = Array.from({length: 7}, (_, i) => [-60 + i * 200, yb + Math.sin(i * 1.3 + t * 0.8) * 10 - s * Math.sin((i / 6) * Math.PI) * bulge * 30]);
  const edge = top ? -200 : 2120;
  const d = `${open(pts)} L 1140 ${edge} L -60 ${edge} Z`;
  return (
    <g>
      <path d={d} fill={CELL.mem} {...EDGE} />
      <path d={open(pts.map(([x, y]) => [x, y - s * 22] as P))} stroke={shade(CELL.mem, 0.12)} strokeWidth={10} fill="none" strokeDasharray="3 16" strokeLinecap="round" />
    </g>
  );
};

export const MuscleCellPlace: React.FC<{t: number; flex?: number; drain?: number; charge?: number; water?: number}> = ({t, flex = 0, drain = 0, charge = 0, water = 0}) => {
  const level = (i: number) => clamp01(1 - drain * (0.85 + rnd(i, 901) * 0.15) + charge * drain);
  return (
    <Scene bg={CELL.cyto}>
      <Depth {...float(t, 0)}>
        <Layer>
          {/* far: faint fibrils deeper in the cell */}
          {Array.from({length: 6}, (_, i) => <path key={i} d={tube([[-100, 120 + i * 330], [1180, 80 + i * 330]], [90, 90], ['cut', 'cut'], 6, i).d} fill={tint(CELL.fibril, 0.62)} />)}
        </Layer>
      </Depth>
      <Depth {...float(t, 0.4)}>
        <Layer>
          {FIBRILS.map((fb, i) => <Fibril key={i} {...fb} flex={flex} seed={i + 1} />)}
          {/* mitochondria (the cell's power plants) between the docks */}
          {([[1, 280], [0, 770], [2, 520], [1, 1010]] as P[]).map(([g, x]) => [x, gapY(g, x)] as P).map(([x, y], i) => (
            <g key={i} transform={`rotate(${f(-12 + i * 9)} ${x} ${y})`}>
              <path d={lobe(x, y + sway(t, 3, i) * 4, 54, 26, i + 910, 10)} fill={CELL.mito} {...EDGE_IN} />
              <path d={open([[x - 38, y], [x - 24, y - 12], [x - 10, y + 12], [x + 4, y - 12], [x + 18, y + 12], [x + 32, y - 10], [x + 42, y]])} {...INLINE} />
            </g>
          ))}
          {/* the batteries in their docks (faceless crowd); the shot puts the speaking ones on top */}
          {DOCKS.map(([x, y], i) => (
            <g key={i} transform={`translate(${f(x)} ${f(y + sway(t, 2.6, i) * 3)}) scale(0.5)`}>
              <Battery face={false} charge={level(i)} />
              {charge > 0.05 && charge < 0.98 && <g transform="translate(58 -40) rotate(12)" opacity={clamp01(charge * 3)}><Spark s={0.7} /></g>}
            </g>
          ))}
          <Membrane top bulge={water} t={t} />
          <Membrane top={false} bulge={water} t={t} />
        </Layer>
      </Depth>
      <Depth {...float(t, 0.8)}>
        <Layer>
          {/* water drawn in with the creatine: pale blue drops drifting from the edges into the gaps */}
          {Array.from({length: Math.round(water * 22)}, (_, i) => {
            const g = i % 3;
            const u = ((rnd(i, 921) + t * 0.05) % 1 + 1) % 1;
            const x = (i % 2 ? u : 1 - u) * 1180 - 50;
            const y = gapY(g, x) + (rnd(i, 922) - 0.5) * 120 + sway(t, 3, i) * 8;
            const s = 14 + rnd(i, 923) * 12;
            return <path key={i} d={`M ${f(x)} ${f(y - s * 1.4)} C ${f(x + s * 0.5)} ${f(y - s * 0.6)} ${f(x + s)} ${f(y)} ${f(x + s)} ${f(y + s * 0.3)} A ${f(s)} ${f(s)} 0 0 1 ${f(x - s)} ${f(y + s * 0.3)} C ${f(x - s)} ${f(y)} ${f(x - s * 0.5)} ${f(y - s * 0.6)} ${f(x)} ${f(y - s * 1.4)} Z`} fill={CELL.water} {...EDGE_IN} />;
          })}
          <Bits t={t} n={12} seed={931} col={tint(CELL.cyto, 0.4)} size={9} />
        </Layer>
      </Depth>
      <Depth {...float(t, 1)}>
        <Layer>
          <Near shapes={[[-90, 760, 200, 240, 941], [1170, 1240, 190, 260, 942]]} col={shade(CELL.fibril, 0.35)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 3. the kidney filter
export const FILTER = {space: '#f6e5b4', cup: '#e9c08a', cap: '#d4605a', lumen: '#8e2f35', tubule: '#efcf96', urine: '#f8eaa0', chip: '#8fa3bd', far: '#ecd6a0'};
const TUFT: P = [540, 760];
/** The tubule's centre line: from the cup's exit down out of the frame. */
export const TUBULE: P[] = [[760, 1100], [860, 1260], [800, 1460], [640, 1640], [560, 1820], [580, 2020]];

const Chip: React.FC<{x: number; y: number; s: number; rot: number}> = ({x, y, s, rot}) => (
  <g transform={`translate(${f(x)} ${f(y)}) rotate(${f(rot)})`}>
    <path d={roundPoly(Array.from({length: 5}, (_, k) => [Math.cos((k / 5) * Math.PI * 2) * s, Math.sin((k / 5) * Math.PI * 2) * s] as P), s * 0.2)} fill={FILTER.chip} {...EDGE_IN} />
    <path d={`M ${f(-s * 0.4)} ${f(-s * 0.2)} L ${f(s * 0.1)} ${f(-s * 0.5)}`} stroke="#ffffff" strokeWidth={2.4} strokeLinecap="round" />
  </g>
);

export const KidneyFilterPlace: React.FC<{t: number; bits?: number}> = ({t, bits = 0.5}) => {
  // the capillary loops of the tuft: each a closed loop of tube around the tuft's centre
  const loops = Array.from({length: 7}, (_, i) => {
    const a = (i / 7) * Math.PI * 2 + 0.3;
    const cx = TUFT[0] + Math.cos(a) * 150, cy = TUFT[1] + Math.sin(a) * 140;
    const pts: P[] = Array.from({length: 7}, (_, k) => {
      const b = (k / 6) * Math.PI * 2;
      return [cx + Math.cos(b) * (110 + rnd(k, 950 + i) * 30), cy + Math.sin(b) * (90 + rnd(k, 960 + i) * 30)];
    });
    return {pts, i};
  });
  const chips = Array.from({length: Math.round(bits * 16)}, (_, i) => {
    const u = ((rnd(i, 971) + t * 0.09) % 1 + 1) % 1;
    if (u < 0.35) {
      // still crossing the cup from the tuft to the exit
      const k = u / 0.35;
      const sx = TUFT[0] + (rnd(i, 972) - 0.5) * 300, sy = TUFT[1] + 220 + rnd(i, 973) * 60;
      return {x: sx + (TUBULE[0][0] - sx) * k, y: sy + (TUBULE[0][1] - sy) * k, i};
    }
    const k = (u - 0.35) / 0.65 * (TUBULE.length - 1);
    const j = Math.min(TUBULE.length - 2, Math.floor(k)), r = k - j;
    return {x: TUBULE[j][0] + (TUBULE[j + 1][0] - TUBULE[j][0]) * r + (rnd(i, 974) - 0.5) * 70, y: TUBULE[j][1] + (TUBULE[j + 1][1] - TUBULE[j][1]) * r, i};
  });
  return (
    <Scene bg={FILTER.space}>
      <Depth {...float(t, 0)}>
        <Layer>
          {/* far: other tubules, pale */}
          {Array.from({length: 5}, (_, i) => <path key={i} d={tube([[-80, 200 + i * 400], [400, 260 + i * 380], [1160, 150 + i * 410]], [120, 110, 120], ['cut', 'cut'], 8, i + 40).d} fill={FILTER.far} stroke={shade(FILTER.far, 0.1)} strokeWidth={2} />)}
        </Layer>
      </Depth>
      <Depth {...float(t, 0.4)} k={1 + sway(t, 1.1) * 0.004}>
        <Layer>
          {/* the tubule (filtered fluid runs down it) */}
          <path d={tube(TUBULE, [230, 220, 210, 210, 220, 230], ['cut', 'cut'], 14, 7).d} fill={FILTER.cup} {...EDGE} />
          <path d={tube(TUBULE, [150, 140, 130, 130, 140, 150], ['cut', 'cut'], 14, 7).d} fill={FILTER.urine} {...EDGE_IN} />
          {/* the cup (Bowman's capsule): a thick wall round the tuft, open toward the tubule */}
          <circle cx={TUFT[0]} cy={TUFT[1]} r={430} fill={FILTER.cup} {...EDGE} />
          <circle cx={TUFT[0]} cy={TUFT[1]} r={370} fill={tint(FILTER.urine, 0.3)} {...EDGE_IN} />
          <path d={tube([[TUFT[0] + 230, TUFT[1] + 260], [TUBULE[0][0], TUBULE[0][1]], [TUBULE[1][0], TUBULE[1][1]]], [150, 150, 140], ['round', 'cut'], 8, 3).d} fill={FILTER.urine} />
          {/* the two small arteries into the tuft, from the top */}
          <path d={tube([[470, -60], [480, 200], [500, 420]], [110, 100, 90], ['cut', 'round'], 8, 1).d} fill={FILTER.cap} {...EDGE} />
          <path d={tube([[640, -60], [620, 200], [590, 420]], [90, 84, 76], ['cut', 'round'], 8, 2).d} fill={shade(FILTER.cap, 0.1)} {...EDGE} />
          {/* the tuft: looping capillaries with red cells moving through */}
          {loops.map(({pts, i}) => {
            const d = tube([...pts, pts[0]], pts.map(() => 70).concat(70), ['round', 'round'], 10, i + 980).d;
            return (
              <g key={i}>
                <path d={d} fill={FILTER.cap} {...EDGE} />
                <path d={open([...pts, pts[0]])} stroke={FILTER.lumen} strokeWidth={26} fill="none" strokeLinecap="round" />
                <path d={open([...pts, pts[0]])} stroke={tint(FILTER.cap, 0.5)} strokeWidth={12} fill="none" strokeDasharray="22 40" strokeDashoffset={f(-t * 90 - i * 17)} strokeLinecap="round" />
                {/* pores in the filter wall */}
                {pts.map(([x, y], k) => <circle key={k} cx={f(x)} cy={f(y)} r={5} fill={tint(FILTER.urine, 0.4)} stroke={shade(FILTER.cap, 0.25)} strokeWidth={1.6} />)}
              </g>
            );
          })}
          {chips.map((c) => <Chip key={c.i} x={c.x} y={c.y} s={16 + rnd(c.i, 975) * 6} rot={t * 40 + c.i * 30} />)}
        </Layer>
      </Depth>
      <Depth {...float(t, 0.8)}>
        <Layer>
          <Bits t={t} n={12} seed={991} col={tint(FILTER.space, 0.5)} size={9} />
        </Layer>
      </Depth>
      <Depth {...float(t, 1)}>
        <Layer>
          <Near shapes={[[-90, 1300, 210, 280, 995], [1160, 260, 200, 240, 996]]} col={shade(FILTER.cup, 0.4)} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== the moments for the sheet
/** B: in the blood, Crea rides the stream toward the fork (the right branch: to the muscles). */
export const MomentBlood: React.FC = () => (
  <>
    <BloodPlace t={1.4} crea={0.7} />
    <Put x={600} y={1120} size={420} rot={-6}><Crea mood="happy" mouth="big" look={[-0.2, -0.6]} /></Put>
  </>
);
/** C, the lift: the fibrils squeeze, the batteries drain red; one battery panics. */
export const MomentDrain: React.FC = () => (
  <>
    <MuscleCellPlace t={2} flex={1} drain={1} />
    <Put x={540} y={1010} size={330}><Battery charge={0.1} mood="scared" mouth="wavy" look={[0, -0.6]} /></Put>
  </>
);
/** C, the recharge: Crea brings a spark, the batteries refill, water drifts in. */
export const MomentCharge: React.FC = () => (
  <>
    <MuscleCellPlace t={3} flex={0.4} drain={1} charge={0.7} water={0.8} />
    <Put x={380} y={1000} size={320}><Crea carry mood="angry" mouth="grit" look={[0.6, -0.2]} /></Put>
    <Put x={720} y={1010} size={300}><Battery charge={0.7} charging mood="happy" mouth="big" look={[-0.6, -0.2]} /></Put>
  </>
);
/** C, Muscle speaks: a fibre with a face in the gap (for "a bit more power"). */
export const MomentMuscle: React.FC = () => (
  <>
    <MuscleCellPlace t={4} flex={1} drain={0.3} charge={1} water={0.5} />
    <Put x={540} y={1010} size={380}><Muscle flex={1} mood="happy" mouth="open" look={[0, 0.2]} /></Put>
  </>
);
/** D: the kidney filter; creatinine chips pass into the tube; Kidney worried. */
export const MomentFilter: React.FC = () => (
  <>
    <KidneyFilterPlace t={2.2} bits={1} />
    <Put x={250} y={1210} size={380}><Kidney mood="sad" mouth="wavy" look={[0.6, -0.4]} /></Put>
  </>
);
export {CREA_COL};
