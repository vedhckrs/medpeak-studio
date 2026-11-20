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
import React from 'react';
import {EDGE, EDGE_IN, FLESH, INK, INLINE, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {f, lobe, loop, open, rnd, tube, type P} from './scenes-body';
import {RedCell, Antibody, WhiteCell} from './cells';
import {Brain} from './organs-a';

const sway = (t: number, period: number, seed = 0) => Math.sin((t / period) * Math.PI * 2 + seed * 1.7);
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const beat = (t: number) => { const u = (t * 1.25) % 1; const k = (c: number, w: number) => Math.max(0, 1 - Math.abs(u - c) / w); return Math.max(k(0.06, 0.07), k(0.24, 0.06) * 0.6); };

/** A depth plane: moves by (dx, dy) and scales about the frame centre (camera dolly). */
export const Depth: React.FC<{dx?: number; dy?: number; k?: number; children: React.ReactNode}> = ({dx = 0, dy = 0, k = 1, children}) => (
  <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transformOrigin: '540px 960px', transform: `translate(${f(dx)}px, ${f(dy)}px) scale(${k.toFixed(4)})`}}>{children}</div>
);
/** The slow float of the camera in fluid, per plane depth (0 far .. 1 near). */
const float = (t: number, depth: number): {dx: number; dy: number} => ({dx: sway(t, 9, 1) * (3 + depth * 16), dy: sway(t, 11.5, 2) * (2 + depth * 11)});

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
  return (
    <Scene bg={DERMIS}>
      {/* far: dermis with collagen waves, fat lobules at the bottom */}
      <Depth {...fl(0)}>
        <Layer>
          <rect x={-60} y={0} width={1200} height={300} fill={SKY} />
          {Array.from({length: 9}, (_, i) => <path key={i} d={open(Array.from({length: 8}, (_, j): P => [-60 + j * 170, 640 + i * 90 + Math.sin(j * 1.3 + i + t * 0.6) * 16]))} stroke={COLLAGEN} strokeWidth={7} strokeLinecap="round" fill="none" />)}
          <rect x={-60} y={1500} width={1200} height={520} fill={FAT} />
          {Array.from({length: 11}, (_, i) => <path key={i} d={lobe(40 + (i % 6) * 200 + (i > 5 ? 100 : 0), 1600 + (i > 5 ? 190 : 0), 108, 92, i + 40)} fill={tint(FAT, 0.25)} {...EDGE_IN} />)}
          <path d="M -60 1500 Q 270 1470 540 1505 Q 820 1540 1140 1495" {...INLINE} />
        </Layer>
      </Depth>
      {/* mid: the capillary loop with streaming red cells, the sweat gland, the nerve twig, the hair */}
      <Depth {...fl(0.4)}>
        <Layer>
          <path d={vessel.d} fill={tint(RED, 0.55)} {...EDGE} />
          <path d={tube(loopV, Array(loopV.length).fill(64), ['cut', 'cut'], 10, 3).d} fill={tint(FLESH.maroon, 0.25)} />
          <Stream pts={pathPts(loopV, 12)} t={t} n={16} r={22} speed={0.06} />
          {/* sweat gland coil and its duct to a pore */}
          <path d={`M 820 560 C 830 760 760 900 800 1040`} stroke={INK} strokeWidth={22} fill="none" strokeLinecap="round" />
          <path d={`M 820 560 C 830 760 760 900 800 1040`} stroke={tint('#bfe3f5', 0.2)} strokeWidth={14} fill="none" strokeLinecap="round" />
          {Array.from({length: 5}, (_, i) => <ellipse key={i} cx={800 + Math.cos(i * 1.9) * 34} cy={1080 + Math.sin(i * 1.9) * 26} rx={34} ry={22} fill={tint('#bfe3f5', 0.2)} {...EDGE_IN} />)}
          {/* a sweat bead travels up the duct */}
          <circle cx={f(812 - ((t * 0.35) % 1) * 4)} cy={f(1030 - ((t * 0.35) % 1) * 460)} r={7} fill="#ffffff" {...EDGE_IN} />
          {/* the hair: root bulb, follicle sleeve, shaft out into the air */}
          <path d="M 160 1090 Q 120 900 150 560 L 210 560 Q 236 900 214 1090 Q 188 1124 160 1090 Z" fill={tint(DERMIS, 0.3)} {...EDGE_IN} />
          <ellipse cx={186} cy={1080} rx={40} ry={32} fill={tint('#8a5a3c', 0.25)} {...EDGE_IN} />
          <path d={hair(180, sway(t, 3.2, 1) * 10)} stroke={INK} strokeWidth={20} strokeLinecap="round" fill="none" />
          <path d={hair(180, sway(t, 3.2, 1) * 10)} stroke="#5a3a2a" strokeWidth={12} strokeLinecap="round" fill="none" />
          {/* the nerve twig: a yellow branch ending in fine endings under the skin */}
          <path d="M 1140 1380 C 900 1330 700 1180 620 900 M 760 1250 C 690 1150 560 1120 470 980 M 640 960 C 600 860 610 760 650 640 M 520 1040 C 440 940 380 860 360 720" stroke={INK} strokeWidth={18} fill="none" strokeLinecap="round" />
          <path d="M 1140 1380 C 900 1330 700 1180 620 900 M 760 1250 C 690 1150 560 1120 470 980 M 640 960 C 600 860 610 760 650 640 M 520 1040 C 440 940 380 860 360 720" stroke={NERVE_Y} strokeWidth={11} fill="none" strokeLinecap="round" />
          {/* a signal flash running down the twig */}
          {(() => { const u = (t * 0.7) % 1; const x = 1140 - u * 520, y = 1380 - u * 480 + Math.sin(u * 3) * 40; return <circle cx={f(x)} cy={f(y)} r={9} fill="#ffffff" {...EDGE_IN} />; })()}
        </Layer>
      </Depth>
      {/* near: the epidermis brick layers, the fang, saliva drops */}
      <Depth {...fl(0.7)}>
        <Layer>
          {Array.from({length: 4}, (_, row) => Array.from({length: 9}, (_, i) => {
            const w = 150, h = 58 - row * 6, x = -40 + i * w + (row % 2 ? 70 : 0), y = 300 + row * 62 + (row === 0 ? sway(t, 4, i) * 3 : 0);
            return <rect key={row + '-' + i} x={x} y={y} width={w - 8} height={h} rx={row === 0 ? 10 : 22} fill={row === 0 ? EPI_TOP : EPI} {...EDGE_IN} />;
          }))}
          {Array.from({length: 4}, (_, row) => Array.from({length: 9}, (_, i) => <ellipse key={'n' + row + i} cx={-40 + i * 150 + (row % 2 ? 70 : 0) + 70} cy={300 + row * 62 + 26} rx={12} ry={8} fill={shade(EPI, 0.16)} />))}
          {/* a few dead flakes lifting off the top */}
          {[0, 1, 2].map((i) => { const u = ((t * 0.12 + i / 3) % 1); return <rect key={i} x={120 + i * 330 + u * 40} y={292 - u * 240} width={70} height={18} rx={8} transform={`rotate(${f(u * 50 - 10)} ${120 + i * 330} ${292 - u * 240})`} fill={EPI_TOP} opacity={1 - u} {...EDGE_IN} />; })}
          {/* the fang */}
          <path d={`M 400 ${f(fangY - 900)} L 720 ${f(fangY - 900)} Q 700 ${f(fangY - 260)} 572 ${f(fangY)} Q 550 ${f(fangY + 16)} 536 ${f(fangY - 12)} Q 430 ${f(fangY - 300)} 400 ${f(fangY - 900)} Z`} fill="#fbf6ea" {...EDGE} />
          <path d={`M 640 ${f(fangY - 880)} Q 640 ${f(fangY - 300)} 562 ${f(fangY - 34)}`} stroke={shade('#fbf6ea', 0.12)} strokeWidth={14} strokeLinecap="round" fill="none" />
          {/* saliva drops with tiny viruses inside */}
          {Array.from({length: Math.round(drops * 6)}, (_, i) => {
            const u = ((t * 0.5 + i / 6) % 1);
            const x = 540 + (i - 2.5) * 46 + Math.sin(u * 4 + i) * 20, y = fangY + 30 + u * 520;
            return (
              <g key={i} opacity={1 - u * 0.6}>
                <path d={`M ${f(x)} ${f(y - 34)} Q ${f(x + 26)} ${f(y)} ${f(x)} ${f(y + 22)} Q ${f(x - 26)} ${f(y)} ${f(x)} ${f(y - 34)} Z`} fill="#e9f1f2" {...EDGE_IN} />
                <circle cx={f(x)} cy={f(y + 4)} r={7} fill="#9d8cc2" {...EDGE_IN} />
              </g>
            );
          })}
        </Layer>
      </Depth>
    </Scene>
  );
};

// =================================================================== 2. the muscle
const MUS = tint('#c95c61', 0.14), MUS_B = shade(MUS, 0.12), MUS_GAP = tint(FLESH.maroon, 0.42);
const MITO = tint(FLESH.coral, 0.1);
/** One striped muscle fibre band (horizontal, slight tilt) that contracts in a travelling wave. */
const FibreBand: React.FC<{y: number; h: number; t: number; seed: number; tilt?: number}> = ({y, h, t, seed, tilt = 0}) => {
  const squeeze = (x: number) => 1 + Math.sin(x / 140 - t * 3 + seed) * 0.08;
  const top: P[] = Array.from({length: 10}, (_, i): P => [-80 + i * 140, y - (h / 2) * squeeze(-80 + i * 140) + (i * 140) * tilt]);
  const bot: P[] = Array.from({length: 10}, (_, i): P => [-80 + i * 140, y + (h / 2) * squeeze(-80 + i * 140) + (i * 140) * tilt]).reverse();
  return (
    <g>
      <path d={loop([...top, ...bot])} fill={MUS} {...EDGE} />
      {Array.from({length: 44}, (_, i) => {
        const x = -80 + i * 30 + Math.sin(i / 4.6 - t * 3 + seed) * 6;
        const hh = (h / 2) * squeeze(x) * 0.86;
        return <path key={i} d={`M ${f(x)} ${f(y - hh + (x + 80) * tilt)} L ${f(x)} ${f(y + hh + (x + 80) * tilt)}`} stroke={i % 2 ? MUS_B : tint(MUS, 0.18)} strokeWidth={i % 2 ? 7 : 4} />;
      })}
      {[0.2, 0.55, 0.85].map((u, i) => <ellipse key={i} cx={f(-80 + u * 1260)} cy={f(y - h * 0.36 + (u * 1260) * tilt)} rx={46} ry={14} fill={shade(MUS, 0.24)} {...EDGE_IN} />)}
    </g>
  );
};
export const MusclePlace: React.FC<{t: number}> = ({t}) => {
  const fl = (d: number) => float(t, d);
  return (
    <Scene bg={MUS_GAP}>
      <Depth {...fl(0)} k={1 + beat(t) * 0.01}>
        <Layer>
          {Array.from({length: 7}, (_, i) => <path key={i} d={tube([[-80, 160 + i * 290], [1160, 120 + i * 290]], [150, 150], ['cut', 'cut'], 6, i).d} fill={shade(MUS_GAP, 0.12)} {...EDGE_IN} />)}
        </Layer>
      </Depth>
      <Depth {...fl(0.4)}>
        <Layer>
          <FibreBand y={430} h={300} t={t} seed={1} tilt={-0.03} />
          {/* the capillary between the fibres */}
          <path d={tube([[-80, 820], [400, 790], [800, 840], [1160, 800]], [96, 96, 96, 96], ['cut', 'cut'], 12, 4).d} fill={tint(RED, 0.55)} {...EDGE} />
          <path d={tube([[-80, 820], [400, 790], [800, 840], [1160, 800]], [66, 66, 66, 66], ['cut', 'cut'], 12, 4).d} fill={tint(FLESH.maroon, 0.25)} />
          <Stream pts={pathPts([[-80, 820], [400, 790], [800, 840], [1160, 800]], 14)} t={t} n={10} r={24} speed={0.09} seed={4} />
          <FibreBand y={1200} h={360} t={t + 0.6} seed={2} tilt={0.02} />
          {/* mitochondria in the gaps */}
          {Array.from({length: 7}, (_, i) => {
            const x = 80 + i * 150, y = 1600 + Math.sin(i * 2.1) * 40 + sway(t, 3, i) * 6;
            return <g key={i} transform={`rotate(${f(-20 + i * 9)} ${x} ${y})`}><path d={lobe(x, y, 64, 30, i + 70, 10)} fill={MITO} {...EDGE_IN} /><path d={open([[x - 46, y], [x - 30, y - 16], [x - 14, y + 14], [x + 2, y - 16], [x + 18, y + 14], [x + 34, y - 14], [x + 48, y]])} {...INLINE} /></g>;
          })}
        </Layer>
      </Depth>
      <Depth {...fl(0.8)}>
        <Layer>
          <Specks t={t} n={22} seed={11} col={tint(MUS_GAP, 0.4)} size={8} />
          <path d={tube([[-80, 1850], [600, 1800], [1160, 1880]], [210, 210, 210], ['cut', 'cut'], 10, 9).d} fill={shade(MUS, 0.2)} {...EDGE} />
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
  return (
    <Scene bg={CLEFT}>
      <Depth {...fl(0)}>
        <Layer>
          {Array.from({length: 14}, (_, i) => <path key={i} d={lobe((i % 5) * 260 + (i > 9 ? 130 : 0) - 20, 140 + Math.floor(i / 5) * 230, 110, 80, i + 90)} fill={shade(CLEFT, 0.08)} {...EDGE_IN} />)}
        </Layer>
      </Depth>
      <Depth {...fl(0.35)}>
        <Layer>
          {/* the nerve fibre coming down into the big terminal bulb */}
          <path d={tube([[700, -60], [660, 220], [600, 420]], [170, 190, 260], ['cut', 'round'], 10, 2).d} fill={tint(FLESH.cream, 0.2)} {...EDGE} />
          {[0, 1, 2].map((i) => <path key={i} d={`M ${626 - i * 18} ${20 + i * 130} Q ${700 - i * 18} ${0 + i * 130} ${760 - i * 22} ${40 + i * 130}`} {...INLINE} />)}
          <path d="M 120 1080 C 80 760 260 470 560 420 C 860 380 1040 640 1000 1080 Q 560 1150 120 1080 Z" fill={BULB} {...EDGE} />
          <path d="M 200 1050 C 180 800 330 560 560 520 C 800 490 940 700 920 1050 Q 560 1100 200 1050 Z" fill={BULB_IN} />
          {/* vesicles: drift down to the membrane, touch it and pop into sparks across the gap */}
          {Array.from({length: 16}, (_, i) => {
            const cyc = (t * 0.45 + rnd(i, 3)) % 1;
            const x = 260 + rnd(i, 5) * 600, y0 = 600 + rnd(i, 7) * 220, y = y0 + cyc * (1040 - y0);
            const popped = cyc > 0.9;
            return popped ? (
              <g key={i}>{[0, 1, 2, 3, 4].map((j) => { const a = (j / 5) * Math.PI + Math.PI * 0.05; const r = 20 + (cyc - 0.9) * 600; return <circle key={j} cx={f(x + Math.cos(a) * r * 0.6)} cy={f(1080 + Math.sin(a) * r)} r={6} fill="#ffe27a" {...EDGE_IN} />; })}</g>
            ) : (
              <g key={i}><circle cx={f(x)} cy={f(y)} r={30} fill={VES} {...EDGE_IN} />{[0, 1, 2].map((j) => <circle key={j} cx={f(x - 9 + j * 9)} cy={f(y + (j === 1 ? -6 : 5))} r={4.5} fill="#ffe27a" />)}</g>
            );
          })}
          {/* the muscle membrane with its lock sockets */}
          <path d="M -80 1220 Q 540 1180 1160 1220 L 1160 2000 L -80 2000 Z" fill={MUS} {...EDGE} />
          {Array.from({length: 40}, (_, i) => <path key={i} d={`M ${-80 + i * 32} 1300 L ${-80 + i * 32} 2000`} stroke={i % 2 ? MUS_B : tint(MUS, 0.18)} strokeWidth={i % 2 ? 8 : 4} />)}
          {DOOR.locks.map((x, i) => (
            <g key={i}>
              <rect x={x - 42} y={DOOR.lockY - 70} width={84} height={96} rx={14} fill={i === unlocked ? tint(LOCK, 0.4) : LOCK} {...EDGE} />
              <path d={`M ${x} ${DOOR.lockY - 48} m -12 0 a 12 12 0 1 1 24 0 Q ${x + 10} ${DOOR.lockY - 30} ${x + 8} ${DOOR.lockY - 6} L ${x - 8} ${DOOR.lockY - 6} Q ${x - 10} ${DOOR.lockY - 30} ${x - 12} ${DOOR.lockY - 48} Z`} fill={i === unlocked ? '#ffffff' : shade(FLESH.maroon, 0.1)} {...EDGE_IN} />
            </g>
          ))}
        </Layer>
      </Depth>
      <Depth {...fl(0.85)}>
        <Layer>
          <Specks t={t} n={14} seed={21} col={tint(CLEFT, 0.5)} size={10} flow={[20, -10]} />
          <path d={lobe(-40, 1820, 260, 200, 7)} fill={shade(MUS, 0.22)} {...EDGE} />
          <path d={lobe(1120, 1760, 240, 220, 8)} fill={shade(MUS, 0.22)} {...EDGE} />
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
export const HighwayPlace: React.FC<{t: number; speed?: number}> = ({t, speed = 1}) => {
  const [vx, vy] = HIGHWAY.vp;
  const N = 12;
  const ring = (u: number) => { const s = Math.pow(u, 1.6); return {rx: 50 + s * 1150, ry: 70 + s * 1700, cy: vy + s * 420}; };
  const run = t * 0.55 * speed;
  return (
    <Scene bg={TUBE_FAR}>
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
            </g>
          );
        })}
        {/* the brain, far away at the end of the tunnel */}
      </Layer>
      <Put x={vx} y={vy - 10} size={120}><Brain mood="scared" mouth="wavy" look={[0, 0.6]} /></Put>
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
          return <path key={i} d={`M ${f(vx + Math.cos(a) * r0)} ${f(vy + Math.sin(a) * r0 * 1.5)} L ${f(vx + Math.cos(a) * r1)} ${f(vy + Math.sin(a) * r1 * 1.5)}`} stroke="#ffffff" strokeWidth={8} strokeLinecap="round" opacity={0.7 * (1 - u)} />;
        })}
      </Layer>
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
      <path d={lobe(-10, 6, 74, 64, 35, 8)} fill="#b9a8e0" {...EDGE_IN} />
      <path d="M 150 -80 L 236 -110 L 250 -40 L 176 -14 Z" fill="#c9ccd3" {...EDGE} />
      <circle cx={-60} cy={-60} r={16} fill="#ffffff" {...EDGE_IN} /><circle cx={30} cy={-80} r={16} fill="#ffffff" {...EDGE_IN} />
      <circle cx={-58} cy={-58} r={6} fill={INK} /><circle cx={32} cy={-78} r={6} fill={INK} />
      <path d="M -40 -20 Q -10 4 22 -22" {...INLINE} />
    </g>
  );
};
export const BattlePlace: React.FC<{t: number; fire?: boolean}> = ({t, fire = true}) => {
  const fl = (d: number) => float(t, d);
  return (
    <Scene bg={PLASMA}>
      <Depth {...fl(0)}>
        <Layer>
          {/* the vessel wall cells behind, brick-like and big */}
          {Array.from({length: 12}, (_, i) => <path key={i} d={lobe((i % 4) * 300 + (Math.floor(i / 4) % 2 ? 150 : 0), 120 + Math.floor(i / 4) * 230, 150, 100, i + 50, 10)} fill={WALL} {...EDGE_IN} />)}
          {Array.from({length: 12}, (_, i) => <ellipse key={'n' + i} cx={(i % 4) * 300 + (Math.floor(i / 4) % 2 ? 150 : 0)} cy={120 + Math.floor(i / 4) * 230} rx={40} ry={26} fill={shade(WALL, 0.16)} />)}
          <Stream pts={pathPts([[-80, 760], [1160, 700]], 20)} t={t} n={12} r={26} speed={0.12} seed={8} />
        </Layer>
      </Depth>
      <Depth {...fl(0.35)}>
        <Layer>
          <Factory x={220} y={1240} t={t} />
        </Layer>
        {/* antibodies fired from the hatch, flying up-right in a stream */}
        {fire && Array.from({length: 7}, (_, i) => {
          const u = (t * 0.55 + i / 7) % 1;
          const x = 440 + u * 560 + Math.sin(u * 6 + i) * 30, y = 1120 - u * 760 + Math.cos(u * 5 + i) * 30;
          return <Put key={i} x={x} y={y} size={110 + u * 40} rot={u * 360 + i * 40}><Antibody mood="angry" mouth="grit" /></Put>;
        })}
      </Depth>
      <Depth {...fl(0.8)}>
        <Layer>
          <Specks t={t} n={16} seed={31} col={tint(PLASMA, 0.45)} size={10} />
          <path d={lobe(1040, 1860, 260, 210, 61)} fill={shade(WALL, 0.1)} {...EDGE} />
        </Layer>
      </Depth>
    </Scene>
  );
};

// re-export for the sheet
export {WhiteCell, RedCell};
