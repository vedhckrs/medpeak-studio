// MedPeak Toons sets (v6), drawn in code at 1080x1920 as LAYERS at different depths (see camera.tsx):
// a far layer, a mid layer, the plane the characters stand on, and a blurred foreground. Every set
// is alive: things drift, drip, bubble, pulse, tick and sway behind the characters, slowly and on
// purpose (never a wobble on the characters themselves). Each set has a back (SETS) and, where it
// helps the depth, a foreground (FORES) that is drawn over the characters.
import React, {useContext} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {blob, lineOf, Part, shade, lift, spline, taperedPath, tone, type P} from './ink';
import {theme} from '../brand/theme';
import {CamCtx, Canvas, H, Layer, W} from './camera';
import type {RoomLook, SetName} from './director';
import {Room, RoomFore, ROOM_FLOOR} from './rooms';
import {FoodPipeStage, ToothStage, TummyStage, type SetProps} from './stages';
import {ToothArenaStage} from './stage-arena';
import {ArmStage} from './stage-arm';
import {MacroStage} from './stage-macro';
import {STYLE} from './style';

// Set outlines are thin and coloured: maroon inside the body, slate in rooms. Never heavy black.
const FLESH = STYLE.fleshLine;
const ROOM = STYLE.roomLine;
const LW = STYLE.setLinePx;
const O = {stroke: ROOM, strokeWidth: LW, strokeLinejoin: 'round' as const};
const wrap = (v: number, m: number) => ((v % m) + m) % m;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
/** A heartbeat: two quick thumps, then a rest (0..1). */
const beat = (t: number, bpm = 68) => {
  const p = (t * bpm) / 60 % 1;
  return Math.exp(-(((p - 0.06) / 0.05) ** 2)) + 0.6 * Math.exp(-(((p - 0.3) / 0.055) ** 2));
};

export const Label: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 740, y = 170}) => (
  <div style={{position: 'absolute', left: x, top: y, background: STYLE.label, color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: '3px solid #0f6f66', letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{text}</div>
);

// ------------------------------------------------------------------- ambient life
/** Drifting specks (dust, bubbles, food, air): each one loops across the area and fades at the edges. */
const Motes: React.FC<{seed: string; n: number; t: number; area: [number, number, number, number]; vx?: number; vy?: number; r?: [number, number]; color: string | string[]; opacity?: number; ring?: boolean; sway?: number}> = ({seed, n, t, area, vx = 0, vy = 0, r = [2, 5], color, opacity = 0.7, ring = false, sway = 0}) => {
  const [x0, y0, x1, y1] = area;
  const w = x1 - x0;
  const h = y1 - y0;
  // clean 2D: no dust and no ring bubbles in the air. Bigger solid pieces (food, crumbs, oxygen) are the story and stay.
  if (STYLE.specks <= 0 && (ring || r[1] <= 4)) return null;
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const sp = 0.55 + random(`${seed}s${i}`) * 0.9;
        const fx = wrap(random(`${seed}x${i}`) + (vx * sp * t) / w, 1);
        const fy = wrap(random(`${seed}y${i}`) + (vy * sp * t) / h, 1);
        const fade = Math.min(1, vy ? Math.min(fy, 1 - fy) / 0.08 : 1, vx ? Math.min(fx, 1 - fx) / 0.08 : 1);
        const rr = r[0] + random(`${seed}r${i}`) * (r[1] - r[0]);
        const x = x0 + fx * w + Math.sin(t * 0.9 + i * 1.7) * sway;
        const y = y0 + fy * h + Math.cos(t * 0.7 + i * 2.3) * sway * 0.5;
        const c = Array.isArray(color) ? color[i % color.length] : color;
        const a = opacity * fade * (0.65 + 0.35 * Math.sin(t * 1.3 + i * 2.1));
        return ring
          ? <g key={i} opacity={a}><circle cx={x} cy={y} r={rr} fill={c} fillOpacity={0.28} stroke={c} strokeWidth={Math.max(1.2, rr * 0.16)} /><circle cx={x - rr * 0.35} cy={y - rr * 0.35} r={rr * 0.2} fill="#ffffff" /></g>
          : <circle key={i} cx={x} cy={y} r={rr} fill={c} opacity={a} />;
      })}
    </g>
  );
};
/** Drops that swell, let go and fall (saliva, acid, a leaking tap). */
const Drips: React.FC<{seed: string; t: number; xs: number[]; y0: number; y1: number; color: string; period?: number; r?: number}> = ({seed, t, xs, y0, y1, color, period = 3.4, r = 8}) => (
  <g>
    {xs.map((x, i) => {
      const ph = wrap(t / (period * (0.8 + random(`${seed}p${i}`) * 0.5)) + random(`${seed}o${i}`), 1);
      const grow = Math.min(1, ph / 0.4);
      const fall = ph < 0.4 ? 0 : ((ph - 0.4) / 0.6) ** 2;
      const y = y0 + grow * 14 + fall * (y1 - y0);
      const len = 12 + grow * 16 + fall * 34;
      const rr = r * (0.5 + grow * 0.5);
      return (
        <g key={i} opacity={ph > 0.92 ? (1 - ph) / 0.08 : 1}>
          <path d={`M${x} ${y - len} C${x + rr * 0.6} ${y - len * 0.35} ${x + rr} ${y - rr * 0.7} ${x + rr} ${y} A${rr} ${rr} 0 1 1 ${x - rr} ${y} C${x - rr} ${y - rr * 0.7} ${x - rr * 0.6} ${y - len * 0.35} ${x} ${y - len} Z`} fill={color} stroke={lineOf(color, 0.4)} strokeWidth={1.6} opacity={0.9} />
          <circle cx={x - rr * 0.32} cy={y - rr * 0.1} r={rr * 0.24} fill="#ffffff" opacity={0.85} />
        </g>
      );
    })}
  </g>
);
/** Soft light shafts from a point, breathing slowly. */
const Rays: React.FC<{id: string; t: number; from: P; to: [number, number][]; color?: string; k?: number}> = ({id, t, from, to, color = '#fff6dc', k = 0.2}) => STYLE.glow <= 0 ? null : (
  <g>
    <defs><linearGradient id={id} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={color} stopOpacity={k * STYLE.glow} /><stop offset="1" stopColor={color} stopOpacity="0" /></linearGradient></defs>
    {to.map(([a, b], i) => <path key={i} d={`M${from[0]} ${from[1]} L${a} ${H} L${b} ${H} Z`} fill={`url(#${id})`} opacity={0.6 + 0.4 * Math.sin(t * 0.6 + i * 1.9)} />)}
  </g>
);

/**
 * A painted organic wall in flat cel style: crisp light and dark patches (no blur) and tapered
 * wrinkle marks, each with a thin light edge. `dir` = 'v' vertical folds, 'h' horizontal folds.
 */
const Painted: React.FC<{seed: string; base: string; area?: [number, number, number, number]; dir?: 'v' | 'h'; marks?: number; blotches?: number}> = ({seed, base, area = [0, 0, W, H], dir = 'v', marks = 26, blotches = 14}) => {
  const [x0, y0, x1, y1] = area;
  const n = Math.max(3, Math.round(blotches * 0.6));
  return (
    <g>
      {Array.from({length: n}).map((_, i) => {
        const cx = x0 + random(`${seed}bx${i}`) * (x1 - x0);
        const cy = y0 + random(`${seed}by${i}`) * (y1 - y0);
        const light = i % 3 === 0;
        const rx = 70 + random(`${seed}br${i}`) * 150;
        const ry = 50 + random(`${seed}bq${i}`) * 110;
        return <path key={i} d={blob(dir === 'v' ? ry : rx, dir === 'v' ? rx * 1.3 : ry, `${seed}b${i}`, 9, 0.2, cx, cy)} fill={light ? lift(base, 0.16) : shade(base, 0.1)} opacity={0.42} />;
      })}
      {Array.from({length: marks}).map((_, i) => {
        const cx = x0 + random(`${seed}mx${i}`) * (x1 - x0);
        const cy = y0 + random(`${seed}my${i}`) * (y1 - y0);
        const len = 50 + random(`${seed}ml${i}`) * 130;
        const wob = (k: number) => (random(`${seed}mw${i}${k}`) - 0.5) * 24;
        const pts: P[] = dir === 'v'
          ? [[cx + wob(1), cy], [cx + wob(2), cy + len * 0.5], [cx + wob(3), cy + len]]
          : [[cx, cy + wob(1)], [cx + len * 0.5, cy + wob(2)], [cx + len, cy + wob(3)]];
        const w = 4 + random(`${seed}mt${i}`) * 5;
        return (
          <g key={i}>
            <path d={taperedPath(pts, w * 0.8)} fill={lift(base, 0.3)} transform={dir === 'v' ? 'translate(5 0)' : 'translate(0 5)'} opacity={0.8} />
            <path d={taperedPath(pts, w)} fill={shade(base, 0.26)} />
          </g>
        );
      })}
    </g>
  );
};
/** A bumpy vertical wall edge (throat and vessel sides). */
const edge = (x: number, seed: string, amp = 40, bumps = 9, flip = 1): P[] =>
  Array.from({length: bumps + 1}, (_, i) => [x + flip * (Math.sin(i * 1.7) * amp * 0.4 + (random(`${seed}${i}`) - 0.5) * amp), -80 + (i / bumps) * (H + 160)] as P);
/** Floor: an organic band at the bottom with soft blotches and a lit top edge. */
const Floor: React.FC<{y: number; color: string; seed: string}> = ({y, color, seed}) => {
  const top = Array.from({length: 11}, (_, i) => [-100 + (i / 10) * (W + 200), y + (random(`${seed}f${i}`) - 0.5) * 50] as P);
  const d = spline([[-160, H + 260], [-160, y], ...top, [W + 160, y], [W + 160, H + 260]], true, 0.4);
  return (
    <g>
      <path d={d} fill={color} />
      <Painted seed={`${seed}fl`} base={color} area={[0, y + 40, W, H]} dir="h" marks={10} blotches={10} />
      <path d={spline(top, false)} fill="none" stroke={lift(color, 0.42)} strokeWidth={10} strokeLinecap="round" transform="translate(0 8)" opacity={0.7} />
      <path d={spline(top, false)} fill="none" stroke={FLESH} strokeWidth={LW} strokeLinecap="round" />
    </g>
  );
};
/** A soft pool of light and a darker bottom, over a whole set. */
const Atmos: React.FC<{id: string; tint: string; light?: [number, number]; k?: number}> = ({id, tint, light = [380, 520], k = 0.3}) => (
  <Canvas>
    <defs>
      <radialGradient id={`pl${id}`} cx={light[0] / W} cy={light[1] / H} r="0.7"><stop offset="0" stopColor="#fff6e8" stopOpacity={k * STYLE.glow} /><stop offset="1" stopColor="#fff6e8" stopOpacity="0" /></radialGradient>
      <linearGradient id={`bt${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0.7" stopColor={tint} stopOpacity="0" /><stop offset="1" stopColor={tint} stopOpacity="0.3" /></linearGradient>
    </defs>
    <rect x={-200} y={-200} width={W + 400} height={H + 400} fill={`url(#pl${id})`} />
    <rect x={-200} y={-200} width={W + 400} height={H + 500} fill={`url(#bt${id})`} />
  </Canvas>
);
const Sky: React.FC<{x: number; y: number; w: number; h: number; fill: string}> = ({x, y, w, h, fill}) => <rect x={x} y={y} width={w} height={h} fill={fill} />;

// ------------------------------------------------------------------- inside the body

/** Inside the throat: a deep, ringed tunnel; walls that squeeze downward; bubbles and wet glints. */
export const ThroatSet: React.FC<{t: number}> = ({t}) => {
  const squeeze = (y: number, k: number) => Math.sin(y * 0.0048 - t * 1.4 + k) * 10;
  const L = edge(300, 'thl', 70, 12, 1).map(([x, y]) => [x + squeeze(y, 0), y] as P);
  const R = edge(780, 'thr', 70, 12, -1).map(([x, y]) => [x - squeeze(y, 1.4), y] as P);
  const at = (pts: P[], y: number) => {
    const i = Math.max(0, Math.min(pts.length - 2, pts.findIndex((p) => p[1] > y) - 1));
    const [a, b] = [pts[i], pts[i + 1]];
    return a[0] + ((b[0] - a[0]) * (y - a[1])) / (b[1] - a[1]);
  };
  return (
    <AbsoluteFill style={{background: '#e9938f'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs>
            <linearGradient id="thg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fdd3c2" /><stop offset="0.5" stopColor="#f2a79d" /><stop offset="1" stopColor="#c2586a" /></linearGradient>
            <radialGradient id="thk" cx="0.5" cy="-0.05" r="0.62"><stop offset="0" stopColor="#fff3df" stopOpacity={(0.5 + 0.1 * Math.sin(t * 0.9)) * STYLE.glow} /><stop offset="1" stopColor="#fff3df" stopOpacity="0" /></radialGradient>
          </defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#thg)" />
          {Array.from({length: 9}).map((_, i) => {
            const y = 180 + i * 215;
            const sag = 70 + i * 9;
            return (
              <g key={i} opacity={0.75}>
                <path d={`M120 ${y} Q540 ${y + sag} 960 ${y}`} fill="none" stroke={shade('#f2a79d', 0.16 + i * 0.022)} strokeWidth={30 - i} strokeLinecap="round" />
                <path d={`M140 ${y + 20} Q540 ${y + sag + 20} 940 ${y + 20}`} fill="none" stroke="#ffd9cc" strokeWidth={5} strokeLinecap="round" opacity={0.55} />
              </g>
            );
          })}
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#thk)" />
        </Canvas>
      </Layer>
      <Layer p={0.72}>
        <Canvas>
          <Motes seed="thb" n={15} t={t} area={[300, -60, 780, H + 60]} vy={-40} r={[5, 13]} color="#fff0e8" ring sway={9} opacity={0.7} />
          <Motes seed="thd" n={22} t={t} area={[240, -60, 840, H + 60]} vy={-16} r={[1.6, 3.4]} color="#fff8ef" sway={5} opacity={0.6} />
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <path d={spline([[-260, -200], ...L, [-260, H + 200]], true, 0.45)} fill="#e07a83" />
          <path d={spline([[W + 260, -200], ...R, [W + 260, H + 200]], true, 0.45)} fill="#e07a83" />
          <Painted seed="thw1" base="#e07a83" area={[-40, 0, 270, H]} />
          <Painted seed="thw2" base="#e07a83" area={[810, 0, W + 40, H]} />
          <path d={spline(L.map(([x, y]) => [x - 26, y] as P), false)} fill="none" stroke={shade('#e07a83', 0.2)} strokeWidth={22} opacity={0.45} />
          <path d={spline(R.map(([x, y]) => [x + 26, y] as P), false)} fill="none" stroke={shade('#e07a83', 0.2)} strokeWidth={22} opacity={0.45} />
          <path d={spline(L, false)} fill="none" stroke={FLESH} strokeWidth={LW} />
          <path d={spline(R, false)} fill="none" stroke={FLESH} strokeWidth={LW} />
          <path d={spline(L.map(([x, y]) => [x + 16, y] as P), false)} fill="none" stroke="#ffd2c6" strokeWidth={7} opacity={0.55} />
          {Array.from({length: 7}).map((_, i) => {
            const side = i % 2 === 0;
            const y = wrap(random(`tg${i}`) * (H + 300) + t * (70 + random(`ts${i}`) * 60), H + 300) - 150;
            const x = side ? at(L, y) - 14 - random(`tx${i}`) * 30 : at(R, y) + 14 + random(`tx${i}`) * 30;
            return <path key={i} d={taperedPath([[x, y - 46], [x + 2, y], [x, y + 46]], 7)} fill="#ffe4da" opacity={0.6} />;
          })}
        </Canvas>
        <Atmos id="th" tint="#6b1f2e" light={[540, 620]} k={0.2} />
        <Label text="THROAT" />
      </Layer>
    </AbsoluteFill>
  );
};
const ThroatFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.32}>
    <Canvas>
      <path d={blob(270, 330, 'tf1', 10, 0.12, -120, 1760 + Math.sin(t * 0.7) * 10)} fill="#b9485c" opacity={0.92} />
      <path d={blob(240, 300, 'tf2', 10, 0.12, 1210, 120 + Math.sin(t * 0.6 + 2) * 10)} fill="#b9485c" opacity={0.92} />
      <path d={blob(110, 130, 'tf3', 9, 0.14, -60, 1560 + Math.sin(t * 0.7) * 10)} fill="#d76a78" opacity={0.6} />
    </Canvas>
  </Layer>
);

/** The gut: a folded back wall, two rows of swaying villi, food and bubbles drifting through. */
export const GutSet: React.FC<{t: number}> = ({t}) => {
  const villi = (n: number, y: number, hMin: number, hVar: number, w: number, color: string, seed: string, phase: number, line: boolean) =>
    Array.from({length: n}).map((_, i) => {
      const x = -60 + (i / (n - 1)) * (W + 120) + (random(`${seed}x${i}`) - 0.5) * 30;
      const h = hMin + random(`${seed}h${i}`) * hVar;
      const sway = Math.sin(t * 1.1 + i * 0.9 + phase) * 12;
      const d = spline([[x - w, y + 20], [x - w * 0.8 + sway * 0.4, y - h * 0.6], [x + sway, y - h], [x + w * 0.8 + sway * 0.4, y - h * 0.6], [x + w, y + 20]], false);
      return (
        <g key={i}>
          <path d={d} fill={color} stroke={line ? FLESH : 'none'} strokeWidth={LW} />
          <path d={taperedPath([[x - w * 0.4 + sway * 0.5, y - h * 0.25], [x - w * 0.3 + sway * 0.8, y - h * 0.7], [x + sway * 0.9, y - h * 0.9]], 7)} fill={lift(color, 0.36)} opacity={0.6} />
        </g>
      );
    });
  return (
    <AbsoluteFill style={{background: '#eea19a'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs><linearGradient id="gug" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f9c3b6" /><stop offset="1" stopColor="#dd7f86" /></linearGradient></defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#gug)" />
          {Array.from({length: 7}).map((_, i) => {
            const y = 120 + i * 190;
            return (
              <g key={i} opacity={0.8}>
                <path d={`M-200 ${y} Q270 ${y - 60} 540 ${y} T1280 ${y}`} fill="none" stroke={shade('#f0a8a0', 0.16)} strokeWidth={40} strokeLinecap="round" />
                <path d={`M-200 ${y - 22} Q270 ${y - 82} 540 ${y - 22} T1280 ${y - 22}`} fill="none" stroke="#ffd8cc" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
              </g>
            );
          })}
        </Canvas>
      </Layer>
      <Layer p={0.7}>
        <Canvas>
          {villi(12, 1250, 150, 80, 34, '#d9767f', 'gv2', 1.3, false)}
          <Motes seed="gf" n={16} t={t} area={[-80, 240, W + 80, 1180]} vx={38} r={[6, 15]} color={['#ffd27d', '#b8e08a', '#fff1d0', '#ffab8a']} sway={10} opacity={0.85} />
          <Motes seed="gb" n={12} t={t} area={[-80, 200, W + 80, 1200]} vx={22} vy={-12} r={[5, 12]} color="#fff3ea" ring sway={8} opacity={0.6} />
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          {villi(9, 1300, 150, 90, 40, '#e4848b', 'gv', 0, true)}
          <Floor y={1300} color="#e88b90" seed="gf" />
          {Array.from({length: 7}).map((_, i) => {
            const x = wrap(random(`gl${i}`) * (W + 300) + t * 46, W + 300) - 150;
            const y = 1400 + random(`gy${i}`) * 420;
            return <path key={i} d={taperedPath([[x, y], [x + 50, y + 5], [x + 100, y]], 6)} fill="#ffd9d2" opacity={0.5} />;
          })}
        </Canvas>
        <Atmos id="gu" tint="#6b1f2e" light={[420, 600]} k={0.24} />
        <Label text="GUT" />
      </Layer>
    </AbsoluteFill>
  );
};
const GutFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.3}>
    <Canvas>
      {[[-40, 150, 420], [150, 110, 330], [960, 120, 360], [1130, 160, 440]].map(([x, w, h], i) => {
        const s = Math.sin(t * 0.9 + i * 1.4) * 16;
        return <path key={i} d={spline([[x - w, H + 80], [x - w * 0.8 + s * 0.4, H - h * 0.6], [x + s, H - h], [x + w * 0.8 + s * 0.4, H - h * 0.6], [x + w, H + 80]], false)} fill="#b54b5d" opacity={0.94} />;
      })}
    </Canvas>
  </Layer>
);

/** Inside the stomach: folded walls that drip, an acid pool that rolls and bubbles, rising vapour. */
export const StomachSet: React.FC<{t: number}> = ({t}) => {
  const surf = (k: number, y: number) => Array.from({length: 13}, (_, i) => [-120 + (i / 12) * (W + 240), y + Math.sin(t * 1.6 + i * 1.3 + k) * 13 + Math.sin(t * 0.7 + i * 0.6 + k) * 8] as P);
  const s1 = surf(0, 1430);
  const s2 = surf(2.2, 1392);
  return (
    <AbsoluteFill style={{background: '#e58893'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs><linearGradient id="stg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f6b2b0" /><stop offset="0.7" stopColor="#de7f8c" /><stop offset="1" stopColor="#c8cf6a" /></linearGradient></defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#stg)" />
          <Painted seed="sw" base="#e8909a" area={[-100, -60, W + 100, 1380]} dir="h" marks={34} blotches={18} />
        </Canvas>
      </Layer>
      <Layer p={0.7}>
        <Canvas>
          {[[150, 250], [470, 330], [760, 230], [1010, 310]].map(([x, h], i) => <path key={i} d={spline([[x - 150, -120], [x - 120, h * 0.6], [x, h], [x + 120, h * 0.6], [x + 150, -120]], false)} fill="#d9727f" stroke={FLESH} strokeWidth={LW} />)}
          {[[150, 250], [470, 330], [760, 230], [1010, 310]].map(([x, h], i) => <path key={i} d={taperedPath([[x - 60, h * 0.3], [x - 40, h * 0.75], [x - 6, h * 0.94]], 12)} fill="#f2a3aa" opacity={0.6} />)}
          <Drips seed="sd" t={t} xs={[150, 470, 760, 1010]} y0={250} y1={1380} color="#cfe36c" period={3.2} r={11} />
          {Array.from({length: 5}).map((_, i) => {
            const life = wrap(t * 0.12 + random(`sv${i}`), 1);
            const x = 120 + random(`svx${i}`) * 840 + Math.sin(t * 0.6 + i) * 30;
            return <path key={i} d={blob(70 + life * 60, 46 + life * 40, `svb${i}`, 9, 0.2, x, 1380 - life * 700)} fill="#eef7b5" opacity={Math.sin(life * Math.PI) * 0.18} />;
          })}
          <path d={spline([[-200, H + 300], [-200, 1392], ...s2, [W + 200, 1392], [W + 200, H + 300]], true, 0.4)} fill="#a5c64e" />
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <defs><linearGradient id="sta" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c7e35f" /><stop offset="1" stopColor="#8fb23c" /></linearGradient></defs>
          <path d={spline([[-200, H + 300], [-200, 1430], ...s1, [W + 200, 1430], [W + 200, H + 300]], true, 0.4)} fill="url(#sta)" />
          <path d={spline(s1, false)} fill="none" stroke="#eaf8a6" strokeWidth={12} transform="translate(0 10)" opacity={0.85} />
          <path d={spline(s1, false)} fill="none" stroke={lineOf('#b7d65a', 0.5)} strokeWidth={LW} />
          {Array.from({length: 16}).map((_, i) => {
            const life = wrap(t * 0.24 + random(`b${i}`), 1);
            const r = 9 + random(`br${i}`) * 18;
            const x = 40 + random(`bx${i}`) * 1000 + Math.sin(t * 1.3 + i) * 6;
            const y = 1900 - life * 440;
            const pop = life > 0.9 ? (life - 0.9) / 0.1 : 0;
            return pop > 0
              ? <circle key={i} cx={x} cy={y} r={r * (1 + pop * 0.9)} fill="none" stroke="#f2fbc0" strokeWidth={3 * (1 - pop)} opacity={1 - pop} />
              : (
                <g key={i} opacity={Math.min(1, life / 0.1)}>
                  <circle cx={x} cy={y} r={r} fill="#dff08f" fillOpacity={0.5} stroke={lineOf('#b7d65a', 0.4)} strokeWidth={2.2} />
                  <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" opacity={0.9} />
                </g>
              );
          })}
          {Array.from({length: 6}).map((_, i) => {
            const x = wrap(random(`sl${i}`) * (W + 300) - t * 30, W + 300) - 150;
            const y = 1500 + random(`sy${i}`) * 360;
            return <path key={i} d={taperedPath([[x, y], [x + 60, y + 6], [x + 120, y]], 7)} fill="#effbb2" opacity={0.5} />;
          })}
        </Canvas>
        <Atmos id="st" tint="#4a5a12" light={[400, 500]} k={0.22} />
        <Label text="STOMACH" />
      </Layer>
    </AbsoluteFill>
  );
};
const StomachFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.3}>
    <Canvas>
      <path d={blob(300, 240, 'sf1', 10, 0.14, 1180, 40 + Math.sin(t * 0.5) * 12)} fill="#b24a5e" opacity={0.94} />
      {[[90, 0.2, 60], [960, 0.65, 44]].map(([x, o, r], i) => {
        const life = wrap(t * 0.1 + o, 1);
        return <circle key={i} cx={x + Math.sin(t + i) * 20} cy={2050 - life * 900} r={r} fill="#e6f59a" fillOpacity={0.4} stroke="#c7df6a" strokeWidth={5} opacity={Math.min(1, life * 6, (1 - life) * 4)} />;
      })}
    </Canvas>
  </Layer>
);

/** Inside the mouth: the dark throat with a swinging uvula, upper teeth, saliva threads, the tongue. */
export const MouthSet: React.FC<{t: number}> = ({t}) => {
  const uv = Math.sin(t * 1.3) * 5;
  const lips = 0.28 + 0.06 * Math.sin(t * 0.8);
  return (
    <AbsoluteFill style={{background: '#7c2636'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs><radialGradient id="mog" cx="0.5" cy="0.4" r="0.6"><stop offset="0" stopColor="#3a0d19" /><stop offset="0.5" stopColor="#6b1f30" /><stop offset="1" stopColor="#8f2f42" /></radialGradient></defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#mog)" />
          <Painted seed="mw" base="#7c2636" area={[0, 300, W, 1300]} dir="v" marks={16} blotches={8} />
          <path d={blob(190, 260, 'thr', 10, 0.08, 540, 800)} fill="#240710" />
          <path d={blob(120, 170, 'thr2', 10, 0.08, 540, 830)} fill="#12030a" />
          {[-1, 1].map((k) => <path key={k} d={blob(70, 120, `ton${k}`, 9, 0.1, 540 + k * 250, 820)} fill="#b8475a" stroke={FLESH} strokeWidth={LW} />)}
        </Canvas>
      </Layer>
      <Layer p={0.7}>
        <Canvas>
          <g transform={`rotate(${uv} 540 560)`}>
            <path d={spline([[468, 540], [500, 690], [540, 722], [580, 690], [612, 540]], false)} fill="#ff8f9c" stroke={FLESH} strokeWidth={LW} />
            <path d={taperedPath([[504, 570], [516, 660], [534, 700]], 12)} fill="#ffc0c6" opacity={0.7} />
          </g>
          <path d={spline([[-200, 380], [200, 520], [540, 560], [880, 520], [1280, 380], [1280, -300], [-200, -300]], true, 0.4)} fill="#e8707e" />
          <Painted seed="mp" base="#e8707e" area={[0, -40, W, 460]} dir="h" marks={12} blotches={8} />
          {[[-1, 300], [1, 330]].map(([k, y0], i) => {
            const x = 540 + k * 400;
            const sag = Math.sin(t * 0.9 + i * 2) * 14;
            return (
              <g key={i} opacity={0.75}>
                <path d={`M${x} ${y0 + 190} Q${x + sag} 860 ${x + k * 16} 1250`} fill="none" stroke="#e9f6ff" strokeWidth={5} strokeLinecap="round" />
                <circle cx={x + sag * 0.5} cy={880 + Math.sin(t * 0.7 + i) * 60} r={10} fill="#e9f6ff" />
              </g>
            );
          })}
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          {Array.from({length: 7}).map((_, i) => {
            const x = 90 + i * 150;
            const y = 455 + Math.abs(3 - i) * -16;
            return <g key={i} transform={`translate(${x} ${y})`}><Part d={spline([[-62, -40], [-58, 40], [-30, 78], [0, 70], [30, 78], [58, 40], [62, -40]], true, 0.5)} fill="#fdfbf4" mat="hard" shadow={0.12} w={LW} /></g>;
          })}
          <Floor y={1240 + Math.sin(t * 1.1) * 7} color="#ff8a98" seed="mt" />
          <path d={spline([[540, 1280], [530, 1500], [550, 1700], [540, 2000]], false)} fill="none" stroke="#e46b7c" strokeWidth={9} strokeLinecap="round" />
          <Motes seed="mb" n={16} t={t} area={[0, 1320, W, 1900]} r={[4, 9]} color="#ffb3bd" opacity={0.5} />
          <Motes seed="mc" n={10} t={t} area={[60, 560, W - 60, 1200]} vy={26} r={[3, 8]} color={['#f6e3b4', '#fff5dc']} sway={12} opacity={0.75} />
        </Canvas>
        <Canvas>
          <defs><radialGradient id="mol" cx="0.5" cy="1.08" r="0.75"><stop offset="0" stopColor="#fff3d6" stopOpacity={lips} /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient></defs>
          <rect x={-200} y={-200} width={W + 400} height={H + 400} fill="url(#mol)" />
        </Canvas>
        <Label text="MOUTH" x={60} y={70} />
      </Layer>
    </AbsoluteFill>
  );
};

const RedCell: React.FC<{x: number; y: number; s: number; rot: number; id: string; dark?: number}> = ({x, y, s, rot, id, dark = 0}) => (
  <g transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${s}) rotate(${rot.toFixed(1)})`}>
    <path d={blob(70, 48, `rc${id}`, 10, 0.05)} fill={shade('#d43b44', dark)} />
    <path d={blob(38, 23, `rd${id}`, 8, 0.05, 2, 3)} fill={shade('#b02a35', dark)} />
    <path d="M-52 -18 Q-30 -40 6 -42" fill="none" stroke="#ff9a9a" strokeWidth={6} strokeLinecap="round" opacity={0.6} />
  </g>
);
/** The bloodstream: red cells stream past at three depths; the vessel pulses with the heartbeat. */
export const BloodSet: React.FC<{t: number}> = ({t}) => {
  const b = beat(t);
  const stream = (n: number, seed: string, speed: number, sMin: number, sVar: number, y0: number, y1: number, dark: number) =>
    Array.from({length: n}).map((_, i) => {
      const x = wrap(random(`${seed}x${i}`) * 1700 + t * speed * (0.75 + random(`${seed}s${i}`) * 0.5) * (1 + b * 0.25), 1700) - 300;
      const y = y0 + random(`${seed}y${i}`) * (y1 - y0) + Math.sin(t * 0.8 + i) * 14;
      return <RedCell key={i} id={`${seed}${i}`} x={x} y={y} s={sMin + random(`${seed}k${i}`) * sVar} rot={random(`${seed}r${i}`) * 60 - 30 + t * (10 + i * 2)} dark={dark} />;
    });
  return (
    <AbsoluteFill style={{background: '#d95f66'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs><linearGradient id="blg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c44a55" /><stop offset="0.45" stopColor="#ea7f7c" /><stop offset="1" stopColor="#c44a55" /></linearGradient></defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#blg)" />
          <Painted seed="vw" base="#e06a6f" area={[-100, -40, W + 100, 1320]} dir="h" marks={30} blotches={16} />
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="#fff1e6" opacity={0.07 * b} />
          {stream(9, 'far', 46, 0.34, 0.22, 240, 1180, 0.22)}
        </Canvas>
      </Layer>
      <Layer p={0.7}>
        <Canvas>
          {stream(6, 'mid', 92, 0.6, 0.3, 200, 1150, 0.08)}
          <Motes seed="bp" n={14} t={t} area={[-80, 200, W + 80, 1250]} vx={120} r={[5, 10]} color="#ffd9a8" opacity={0.75} />
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <Floor y={1330} color="#ee8a8a" seed="vf" />
          {Array.from({length: 8}).map((_, i) => {
            const x = wrap(random(`bl${i}`) * (W + 400) + t * 190, W + 400) - 200;
            const y = 300 + random(`by${i}`) * 900;
            return <path key={i} d={taperedPath([[x, y], [x + 90, y + 4], [x + 180, y]], 5)} fill="#ffd0c8" opacity={0.3} />;
          })}
        </Canvas>
        <Atmos id="bl" tint="#4a0d18" light={[420, 600]} k={0.2 + 0.06 * b} />
        <Label text="BLOODSTREAM" x={590} />
      </Layer>
    </AbsoluteFill>
  );
};
const BloodFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.35}>
    <Canvas>
      {[[0.1, 1650, 2.5], [0.6, 260, 2.1]].map(([o, y, s], i) => {
        const x = wrap(o * 2600 + t * 330, 2600) - 700;
        return <RedCell key={i} id={`fg${i}`} x={x} y={y + Math.sin(t + i) * 30} s={s} rot={t * 26 + i * 70} dark={0.3} />;
      })}
    </Canvas>
  </Layer>
);

/** Inside the lungs: branching airways, air sacs that fill and empty, air flowing in and out. */
export const LungsSet: React.FC<{t: number}> = ({t}) => {
  const breath = Math.sin(t * 1.25); // +1 = full of air
  const fill = 1 + breath * 0.07;
  const branch = (x: number, y: number, a: number, len: number, d: number, key: string): React.ReactNode[] => {
    if (d === 0) {
      return [<g key={key}>{[0, 1, 2, 3].map((k) => (
        <g key={k} transform={`translate(${x + Math.cos(a + k * 0.9 - 1.3) * 26} ${y + Math.sin(a + k * 0.9 - 1.3) * 26}) scale(${fill})`}>
          <Part d={blob(24, 22, `${key}${k}`, 8, 0.08)} fill="#ffb0c2" w={2.6} shadow={0.2} depth={6} />
        </g>
      ))}</g>];
    }
    const x2 = x + Math.cos(a) * len;
    const y2 = y + Math.sin(a) * len;
    return [
      <path key={`l${key}`} d={taperedPath([[x, y], [(x + x2) / 2 + Math.sin(d) * 8, (y + y2) / 2], [x2, y2]], d * 9, 0.01, 0.3)} fill="#f8d2db" stroke={FLESH} strokeWidth={2.2} />,
      ...branch(x2, y2, a - 0.48, len * 0.72, d - 1, key + 'a'),
      ...branch(x2, y2, a + 0.48, len * 0.72, d - 1, key + 'b'),
    ];
  };
  return (
    <AbsoluteFill style={{background: '#e995ab'}}>
      <Layer p={0.4}>
        <Canvas>
          <defs><radialGradient id="lug" cx="0.5" cy="0.3" r="0.8"><stop offset="0" stopColor="#f9c0cf" /><stop offset="1" stopColor="#d9738f" /></radialGradient></defs>
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#lug)" />
          <Painted seed="lw" base="#eb9cb0" area={[0, 0, W, H]} dir="v" marks={16} />
          {Array.from({length: 26}).map((_, i) => (
            <g key={i} transform={`translate(${random(`la${i}`) * W} ${random(`lb${i}`) * H}) scale(${(0.7 + random(`lc${i}`) * 0.8) * (1 + breath * 0.05)})`} opacity={0.5}>
              <circle r={34} fill="#f4a9bd" stroke="#d47a93" strokeWidth={3} />
              <circle cx={-10} cy={-10} r={9} fill="#ffd3de" opacity={0.7} />
            </g>
          ))}
        </Canvas>
      </Layer>
      <Layer p={0.75}>
        <Canvas>{branch(540, -80, Math.PI / 2, 430, 5, 'r')}</Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <Motes seed="lo" n={26} t={t} area={[40, -40, W - 40, H + 40]} r={[4, 8]} color={['#8fd3ff', '#bfe7ff', '#ffffff']} sway={26 + breath * 14} opacity={0.8} />
          {Array.from({length: 14}).map((_, i) => {
            const y = wrap(random(`ly${i}`) * (H + 200) + breath * 150 * (0.5 + random(`lz${i}`)), H + 200) - 100;
            const x = 80 + random(`lx${i}`) * 920;
            return <g key={i} opacity={0.75}><circle cx={x} cy={y} r={9} fill="#9fdcff" fillOpacity={0.4} stroke="#6fbff0" strokeWidth={2} /><text x={x} y={y + 3.5} fontSize={9} fontWeight={900} fill="#2f86c8" textAnchor="middle" fontFamily="sans-serif">O₂</text></g>;
          })}
        </Canvas>
        <Atmos id="lu" tint="#6a1f3a" light={[540, 500]} k={0.24} />
        <Label text="LUNGS" />
      </Layer>
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- the real world
const Cloud: React.FC<{x: number; y: number; s: number; o?: number}> = ({x, y, s, o = 0.95}) => (
  <g transform={`translate(${x.toFixed(1)} ${y}) scale(${s})`} opacity={o}>
    <path d="M-60 18 C-84 18 -86 -12 -60 -14 C-56 -40 -18 -46 -4 -26 C10 -44 48 -36 48 -10 C72 -10 74 18 50 18 Z" fill="#ffffff" />
    <path d="M-60 18 C-78 18 -82 4 -70 -6 C-50 8 30 10 62 2 C66 10 60 18 50 18 Z" fill="#d6ecfb" />
  </g>
);
/** A wall clock whose second hand ticks once a second. */
const Clock: React.FC<{x: number; y: number; r: number; t: number; face?: string}> = ({x, y, r, t, face = '#ffffff'}) => {
  const sec = Math.floor(t) + Math.min(1, (t % 1) / 0.12) ** 0.5 - 1;
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle cx={8} cy={10} r={r} fill="#274a47" opacity={0.18} />
      <circle r={r} fill={face} stroke={ROOM} strokeWidth={LW * 2.2} />
      <circle r={r - 9} fill="none" stroke="#e3e8f2" strokeWidth={3} />
      {Array.from({length: 12}).map((_, i) => <path key={i} d={`M0 ${-r + 16} V${-r + (i % 3 === 0 ? 30 : 23)}`} stroke={ROOM} strokeWidth={i % 3 === 0 ? 5 : 3} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
      <path d={`M0 6 V${-r * 0.46}`} stroke={STYLE.ink} strokeWidth={7} strokeLinecap="round" transform={`rotate(${305 + t * 0.008})`} />
      <path d={`M0 8 V${-r * 0.66}`} stroke={STYLE.ink} strokeWidth={5} strokeLinecap="round" transform={`rotate(${48 + t * 0.1})`} />
      <path d={`M0 16 V${-r * 0.74}`} stroke="#ea4a55" strokeWidth={2.6} strokeLinecap="round" transform={`rotate(${sec * 6})`} />
      <circle r={5} fill="#ea4a55" />
    </g>
  );
};
/** A heart monitor: the green trace scrolls, the light blinks. */
const Monitor: React.FC<{x: number; y: number; t: number}> = ({x, y, t}) => {
  const shift = wrap(t * 110, 150);
  const one = 'l28 0 l8 -9 l8 9 l10 0 l7 14 l11 -62 l11 76 l8 -28 l12 0 l10 -12 l12 12 l25 0';
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x={52} y={170} width={16} height={200} fill="#9fb3c8" {...O} />
      <path d="M-10 372 H130 L112 352 H8 Z" fill="#7f93aa" {...O} />
      <rect x={8} y={12} width={150} height={170} rx={16} fill="#274a47" opacity={0.2} />
      <rect width={150} height={170} rx={16} fill="#eef3f8" {...O} />
      <rect x={12} y={12} width={126} height={108} rx={8} fill="#0f2a33" />
      <svg x={12} y={12} width={126} height={108} viewBox="0 0 126 108">
        {[27, 54, 81].map((gy) => <path key={gy} d={`M0 ${gy} H126`} stroke="#1f4a55" strokeWidth={1} />)}
        {[31, 63, 95].map((gx) => <path key={gx} d={`M${gx} 0 V108`} stroke="#1f4a55" strokeWidth={1} />)}
        <path d={`M${-shift} 66 ${one} ${one} ${one}`} fill="none" stroke="#3dfc9b" strokeWidth={3.4} strokeLinejoin="round" strokeLinecap="round" />
        <text x={8} y={22} fontSize={16} fontWeight={900} fill="#3dfc9b" fontFamily="sans-serif">72</text>
      </svg>
      <circle cx={28} cy={144} r={8} fill={t % 0.88 < 0.2 ? '#ff5c6c' : '#8a3a44'} {...O} />
      <rect x={52} y={136} width={40} height={16} rx={8} fill="#2ec4b6" /><rect x={100} y={136} width={30} height={16} rx={8} fill="#c8d6e5" />
    </g>
  );
};
const Plant: React.FC<{x: number; y: number; t: number; s?: number}> = ({x, y, t, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <ellipse cx={0} cy={206} rx={70} ry={12} fill="#274a47" opacity={0.2} />
    {[[-52, 0.2, 86, -30], [0, 1.2, 104, 0], [48, 2.3, 84, 28], [-24, 3.1, 70, -14], [26, 4, 72, 14]].map(([a, ph, h, lean], i) => (
      <g key={i} transform={`rotate(${lean + Math.sin(t * 0.9 + ph) * 2.2} ${a * 0.3} 70)`}>
        <path d={`M${a * 0.3} 74 C${a - 30} ${40 - h * 0.3} ${a - 22} ${-h} ${a} ${-h - 10} C${a + 22} ${-h} ${a + 30} ${40 - h * 0.3} ${a * 0.3} 74 Z`} fill={i > 2 ? '#5fd09c' : '#43c08a'} {...O} />
        <path d={`M${a * 0.3} 70 Q${a * 0.7} ${-h * 0.3} ${a} ${-h + 4}`} fill="none" stroke="#2c9c6c" strokeWidth={3} />
      </g>
    ))}
    <path d="M-56 200 L-44 70 H44 L56 200 Z" fill="#ff9f6e" {...O} />
    <path d="M-50 70 H50 V92 H-50 Z" fill="#ffb58c" {...O} />
    <path d="M-36 100 L-42 190" stroke="#ffc9a8" strokeWidth={8} strokeLinecap="round" opacity={0.7} />
  </g>
);
/** What you see through a window: sky, sun, clouds that drift, hills, a tree that sways. It sits far away. */
const Outside: React.FC<{t: number; night?: boolean}> = ({t, night = false}) => (
  <Canvas>
    <defs><linearGradient id={night ? 'skn' : 'skd'} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={night ? '#0f1840' : '#8fd3ff'} /><stop offset="1" stopColor={night ? '#2a3a7a' : '#dff4ff'} /></linearGradient></defs>
    <Sky x={-200} y={-200} w={W + 400} h={1500} fill={`url(#${night ? 'skn' : 'skd'})`} />
    {night ? (
      <>
        {Array.from({length: 40}).map((_, i) => <circle key={i} cx={random(`sx${i}`) * W} cy={random(`sy${i}`) * 900} r={2 + random(`sr${i}`) * 3} fill="#fff" opacity={0.5 + 0.5 * Math.sin(t * (1.5 + random(`st${i}`) * 2) + i)} />)}
        <circle cx={330} cy={380} r={74} fill="#fff4c2" /><circle cx={298} cy={360} r={66} fill="#16204a" />
        <Cloud x={wrap(200 + t * 14, 1500) - 200} y={430} s={1.5} o={0.3} />
      </>
    ) : (
      <>
        <circle cx={760} cy={330} r={120 + Math.sin(t * 0.8) * 6} fill="#fff3b0" opacity={0.5} />
        <circle cx={760} cy={330} r={62} fill="#ffe08a" />
        <Cloud x={wrap(300 + t * 20, 1700) - 300} y={300} s={1.6} />
        <Cloud x={wrap(1100 + t * 12, 1700) - 300} y={470} s={1.1} o={0.85} />
        <Cloud x={wrap(700 + t * 28, 1700) - 300} y={210} s={0.8} o={0.8} />
      </>
    )}
    <path d="M-200 760 C100 650 330 720 560 680 C800 640 1000 700 1300 640 V1500 H-200 Z" fill={night ? '#1b2a5c' : '#8fd6a8'} />
    <path d="M-200 820 C200 760 500 820 760 770 C960 740 1100 790 1300 760 V1500 H-200 Z" fill={night ? '#16224c' : '#6cc391'} />
    <g transform={`translate(880 760) rotate(${Math.sin(t * 0.8) * 1.6})`}>
      <rect x={-12} y={-40} width={24} height={150} fill={night ? '#3a2f4a' : '#8a6a4e'} />
      {[[0, -150, 96], [-66, -90, 70], [66, -96, 74], [0, -70, 80]].map(([x, y, r], i) => <circle key={i} cx={x + Math.sin(t * 1.1 + i) * 3} cy={y} r={r} fill={night ? '#22366a' : i % 2 ? '#4fb37f' : '#3fa372'} />)}
    </g>
  </Canvas>
);

/** Dr. Mira's office: a window with drifting clouds, a ticking clock, a heart monitor, a plant, dust in the light. */
export const OfficeSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill style={{background: '#bfe9df'}}>
    <Layer p={0.35}><Outside t={t} /></Layer>
    <Layer p={0.82}>
      <Canvas>
        <defs><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#cdf1e8" /><stop offset="1" stopColor="#a6dccf" /></linearGradient></defs>
        <path d={`M-300 -300 H${W + 300} V1420 H-300 Z M640 210 V690 H1000 V210 Z`} fill="url(#og)" fillRule="evenodd" />
        {Array.from({length: 16}).map((_, i) => (i * 100 - 200 < 620 || i * 100 - 200 > 1010 ? <line key={i} x1={i * 100 - 200} x2={i * 100 - 200} y1={-300} y2={1420} stroke="#b9e5da" strokeWidth={4} /> : null))}
        <path d="M-300 1100 H1400 V1420 H-300 Z" fill="#9fd3c6" opacity={0.6} />
        <path d="M-300 1096 H1400" stroke="#f3fbf8" strokeWidth={10} />
        {/* window frame */}
        <rect x={622} y={192} width={396} height={516} rx={22} fill="none" stroke="#f6f1e7" strokeWidth={34} />
        <rect x={605} y={175} width={430} height={550} rx={30} fill="none" {...O} />
        <rect x={640} y={210} width={360} height={480} fill="#ffffff" opacity={0.1} />
        <path d="M820 210 V690 M640 450 H1000" stroke="#f6f1e7" strokeWidth={18} />
        <path d="M820 210 V690 M640 450 H1000" fill="none" stroke={ROOM} strokeWidth={2} opacity={0.5} />
        <path d="M660 250 L740 330 M700 230 L780 310" stroke="#ffffff" strokeWidth={14} strokeLinecap="round" opacity={0.5} />
        <rect x={590} y={706} width={460} height={34} rx={10} fill="#f6f1e7" {...O} />
        {/* poster */}
        <g transform="translate(236 250)">
          <rect x={14} y={16} width={300} height={430} rx={16} fill="#274a47" opacity={0.18} />
          <rect width={300} height={430} rx={16} fill="#fff" {...O} />
          <rect x={18} y={18} width={264} height={46} rx={10} fill="#2ec4b6" />
          <rect x={34} y={34} width={150} height={14} rx={7} fill="#e9fffb" />
          <circle cx={150} cy={130} r={40} fill="#ffd2c4" {...O} />
          <path d="M96 190 C96 172 204 172 204 190 L196 340 C196 356 104 356 104 340 Z" fill="#ffd2c4" {...O} />
          <path d="M128 214 C112 214 110 244 124 252 C132 256 138 250 150 236 C162 250 168 256 176 252 C190 244 188 214 172 214 C162 214 156 222 150 226 C144 222 138 214 128 214 Z" fill="#ff6f7d" stroke={FLESH} strokeWidth={2} />
          <path d={blob(26, 18, 'pl', 9, 0.1, 150, 290)} fill="#c9645a" stroke={FLESH} strokeWidth={2} />
          <path d="M150 170 V206" stroke="#f2a3a8" strokeWidth={9} strokeLinecap="round" />
          {[376, 396].map((y, i) => <rect key={y} x={40} y={y} width={i ? 150 : 220} height={11} rx={5.5} fill="#c8d6e5" />)}
        </g>
        <Clock x={130} y={300} r={86} t={t} />
        <g transform="translate(54 470)">
          <rect x={10} y={12} width={150} height={196} rx={10} fill="#274a47" opacity={0.18} />
          <rect width={150} height={196} rx={10} fill="#f7ecd2" {...O} />
          <rect x={14} y={14} width={122} height={168} rx={4} fill="#fffdf6" stroke="#d9c79a" strokeWidth={2} />
          <rect x={30} y={34} width={90} height={10} rx={5} fill="#2ec4b6" />
          {[62, 80, 98].map((y) => <rect key={y} x={30} y={y} width={90} height={7} rx={3.5} fill="#c8d6e5" />)}
          <circle cx={75} cy={140} r={18} fill="#ffc93c" stroke="#b9892c" strokeWidth={2.4} />
          <path d="M66 152 L60 176 L75 166 L90 176 L84 152 Z" fill="#ea4a55" />
        </g>
        <Rays id="ory" t={t} from={[820, 450]} to={[[260, 760], [520, 960]]} k={0.2} />
        <Motes seed="od" n={24} t={t} area={[300, 500, 980, 1400]} vy={10} vx={-6} r={[1.6, 3.6]} color="#fffbe6" sway={14} opacity={0.85} />
      </Canvas>
    </Layer>
    <Layer p={1}>
      <Canvas>
        <defs><linearGradient id="ofl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#e4c193" /><stop offset="1" stopColor="#c99e6c" /></linearGradient></defs>
        <rect x={-300} y={1340} width={W + 600} height={900} fill="url(#ofl)" />
        {Array.from({length: 9}).map((_, i) => <line key={i} x1={-300} x2={W + 300} y1={1392 + i * i * 9 + i * 30} y2={1392 + i * i * 9 + i * 30} stroke="#c9a377" strokeWidth={4} />)}
        {Array.from({length: 12}).map((_, i) => <line key={i} x1={540 + (i - 5.5) * 150} x2={540 + (i - 5.5) * 330} y1={1340} y2={2200} stroke="#c9a377" strokeWidth={3} opacity={0.6} />)}
        <path d="M300 1400 L560 1340 L900 1340 L640 1400 Z" fill="#fff4cc" opacity={0.24} />
        <rect x={-300} y={1324} width={W + 600} height={28} fill="#f6f1e7" {...O} />
        <ellipse cx={540} cy={1570} rx={470} ry={96} fill="#2ec4b6" opacity={0.28} />
        <ellipse cx={540} cy={1570} rx={470} ry={96} fill="none" stroke="#1d9c90" strokeWidth={4} strokeDasharray="16 14" opacity={0.5} />
        <ellipse cx={540} cy={1570} rx={400} ry={74} fill="none" stroke="#e9fffb" strokeWidth={5} opacity={0.5} />
        <Monitor x={8} y={966} t={t} />
        <Plant x={994} y={1150} t={t} />
      </Canvas>
      <Atmos id="of" tint="#3d6b66" light={[780, 400]} k={0.22} />
    </Layer>
  </AbsoluteFill>
);
const OfficeFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.3}>
    <Canvas>
      {[[-70, 1.9, 520, 14], [60, 0.6, 430, -6], [-150, 3, 380, 30]].map(([x, ph, h, lean], i) => (
        <g key={i} transform={`rotate(${lean + Math.sin(t * 0.8 + ph) * 2} ${x} ${H + 40})`}>
          <path d={`M${x} ${H + 60} C${x - 150} ${H - h * 0.4} ${x - 90} ${H - h} ${x} ${H - h - 30} C${x + 90} ${H - h} ${x + 150} ${H - h * 0.4} ${x} ${H + 60} Z`} fill={i === 1 ? '#2f9c74' : '#237f5e'} opacity={0.96} />
        </g>
      ))}
    </Canvas>
  </Layer>
);

/** Dr. Mira's desk: drawn in FRONT of the characters (clipboard, pill bottle, mug). */
export const OfficeDesk: React.FC<{y?: number}> = ({y = 1470}) => (
  <AbsoluteFill>
    <Canvas>
      <g transform={`translate(0 ${y})`}>
        <rect x={-220} y={34} width={W + 440} height={720} fill="#b98557" />
        <rect x={-220} y={34} width={W + 440} height={40} fill="#8f623c" opacity={0.6} />
        <rect x={-220} y={0} width={W + 440} height={44} rx={12} fill="#d9a877" {...O} />
        <rect x={-220} y={4} width={W + 440} height={10} fill="#f0c898" opacity={0.8} />
        {[140, 420, 700, 960].map((x, i) => <path key={i} d={taperedPath([[x, 120], [x + 60, 135], [x + 150, 125]], 6)} fill="#9c6c43" />)}
        <g transform="translate(90 -150) rotate(-8)">
          <rect x={10} y={12} width={190} height={150} rx={10} fill="#5b4030" opacity={0.3} />
          <rect width={190} height={150} rx={10} fill="#c98b5a" {...O} />
          <rect x={14} y={16} width={162} height={122} rx={4} fill="#fff" />
          {[36, 60, 84, 108].map((yy, i) => <rect key={yy} x={28} y={yy} width={i === 3 ? 80 : 134} height={9} rx={4} fill={i === 0 ? '#2ec4b6' : '#c8d6e5'} />)}
          <rect x={70} y={-12} width={50} height={24} rx={6} fill="#9fb3c8" {...O} />
        </g>
        <g transform="translate(760 -150)">
          <ellipse cx={52} cy={152} rx={60} ry={10} fill="#5b4030" opacity={0.3} />
          <rect x={0} y={30} width={100} height={122} rx={14} fill="#ff9f43" {...O} />
          <rect x={0} y={66} width={100} height={52} fill="#fff" stroke={ROOM} strokeWidth={LW} />
          <rect x={22} y={80} width={56} height={8} rx={4} fill="#2ec4b6" /><rect x={22} y={96} width={36} height={7} rx={3} fill="#c8d6e5" />
          <rect x={-6} y={0} width={112} height={36} rx={8} fill="#fff" {...O} />
          <rect x={14} y={40} width={10} height={100} rx={5} fill="#ffd29a" opacity={0.8} />
        </g>
        <g transform="translate(930 -110)">
          <ellipse cx={46} cy={112} rx={54} ry={9} fill="#5b4030" opacity={0.3} />
          <path d="M84 30 C120 30 120 84 84 84" fill="none" stroke={ROOM} strokeWidth={13} />
          <path d="M84 30 C120 30 120 84 84 84" fill="none" stroke="#2ec4b6" strokeWidth={6.6} />
          <rect x={0} y={0} width={90} height={112} rx={14} fill="#2ec4b6" {...O} />
          <path d="M30 60 l10 -22 l8 34 l10 -22 h12" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={10} y={10} width={10} height={90} rx={5} fill="#7fe3d6" opacity={0.8} />
        </g>
      </g>
    </Canvas>
  </AbsoluteFill>
);

/** Bathroom: tiles, a mirror with a moving glint, a dripping tap, steam, a swaying shower curtain. */
export const BathroomSet: React.FC<{t: number}> = ({t}) => {
  const glint = wrap(t * 0.16, 1);
  const drop = wrap(t / 2.2, 1);
  return (
    <AbsoluteFill style={{background: '#e6f3fb'}}>
      <Layer p={0.82}>
        <Canvas>
          <rect x={-300} y={-300} width={W + 600} height={1700} fill="#e6f3fb" />
          {Array.from({length: 13}).map((_, r) => Array.from({length: 11}).map((_, c) => (
            <rect key={`${r}-${c}`} x={c * 140 + (r % 2) * 70 - 280} y={r * 120 - 120} width={136} height={116} rx={8} fill={(r * 3 + c * 5) % 7 === 0 ? '#c5e2f3' : (r + c) % 5 === 0 ? '#cfe8f6' : '#dff0fa'} />
          )))}
          <g transform="translate(120 360)">
            <rect x={14} y={16} width={360} height={460} rx={180} fill="#3d5a80" opacity={0.16} />
            <rect width={360} height={460} rx={180} fill="#cfefff" {...O} />
            <rect x={18} y={18} width={324} height={424} rx={162} fill="#e3f6ff" />
            <svg x={18} y={18} width={324} height={424} viewBox="0 0 324 424">
              <path d={`M${-200 + glint * 700} 500 l160 -620 h60 l-160 620 Z`} fill="#ffffff" opacity={0.55} />
              <path d={`M${-90 + glint * 700} 500 l160 -620 h20 l-160 620 Z`} fill="#ffffff" opacity={0.4} />
            </svg>
          </g>
          <g transform="translate(110 900)">
            <path d="M180 0 V-64 H250 V-40" fill="none" stroke={ROOM} strokeWidth={24} strokeLinecap="round" />
            <path d="M180 0 V-64 H250 V-40" fill="none" stroke="#c9d6e4" strokeWidth={16} strokeLinecap="round" />
            <path d={`M250 ${-34 + (drop < 0.35 ? drop * 20 : 7 + ((drop - 0.35) / 0.65) ** 2 * 44)} c5 8 8 12 8 17 a8 8 0 0 1 -16 0 c0 -5 3 -9 8 -17 Z`} fill="#8fd3ff" stroke="#4a98cf" strokeWidth={1.6} opacity={drop > 0.95 ? 0 : 1} />
            <path d="M0 0 H380 L340 160 H40 Z" fill="#fff" {...O} />
            <ellipse cx={190} cy={20} rx={160} ry={16} fill="#d7ecf8" {...O} />
            <ellipse cx={250} cy={22} rx={20 + drop * 46} ry={3 + drop * 6} fill="none" stroke="#8fd3ff" strokeWidth={3} opacity={1 - drop} />
            <rect x={170} y={160} width={40} height={340} fill="#fff" {...O} />
          </g>
          <g transform="translate(960 760)"><circle cx={8} cy={10} r={70} fill="#3d5a80" opacity={0.16} /><circle r={70} fill="#fff" {...O} /><circle r={22} fill="#e6f3fb" {...O} /><path d="M0 60 V150 H40 V60" fill="#fff" {...O} /></g>
          {Array.from({length: 6}).map((_, i) => {
            const life = wrap(t * 0.09 + random(`bs${i}`), 1);
            return <path key={i} d={blob(60 + life * 70, 40 + life * 50, `bsb${i}`, 9, 0.2, 180 + random(`bsx${i}`) * 300 + Math.sin(t * 0.5 + i) * 30, 900 - life * 760)} fill="#ffffff" opacity={Math.sin(life * Math.PI) * 0.34} />;
          })}
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <rect x={-300} y={1380} width={W + 600} height={900} fill="#9fc7e0" />
          {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 150 - 200} x2={i * 150 - 320} y1={1380} y2={2200} stroke="#8bb7d2" strokeWidth={5} />)}
          {Array.from({length: 5}).map((_, i) => <line key={i} x1={-300} x2={W + 300} y1={1440 + i * i * 22 + i * 40} y2={1440 + i * i * 22 + i * 40} stroke="#8bb7d2" strokeWidth={4} />)}
          <rect x={-300} y={1366} width={W + 600} height={26} fill="#f4fbff" {...O} />
          <g transform="translate(640 940)">
            <ellipse cx={190} cy={530} rx={200} ry={22} fill="#3d5a80" opacity={0.2} />
            <rect x={60} y={0} width={260} height={220} rx={30} fill="#fff" {...O} />
            <rect x={150} y={40} width={80} height={26} rx={10} fill="#c9d6e4" {...O} />
            <path d="M0 300 C0 250 380 250 380 300 C380 420 300 470 190 470 C80 470 0 420 0 300 Z" fill="#fff" {...O} />
            <ellipse cx={190} cy={300} rx={160} ry={40} fill="#e8f2f8" {...O} />
            <path d="M40 330 C60 420 130 452 190 452" fill="none" stroke="#dbe8f2" strokeWidth={14} strokeLinecap="round" />
            <rect x={130} y={460} width={120} height={60} fill="#fff" {...O} />
          </g>
          <ellipse cx={420} cy={1640} rx={300} ry={70} fill="#ffd36e" opacity={0.75} {...O} />
          <ellipse cx={420} cy={1640} rx={240} ry={50} fill="none" stroke="#fff3c9" strokeWidth={6} strokeDasharray="14 12" />
        </Canvas>
        <Atmos id="ba" tint="#3d5a80" light={[300, 400]} k={0.2} />
      </Layer>
    </AbsoluteFill>
  );
};
const BathroomFore: React.FC<{t: number}> = ({t}) => (
  <Layer p={1.3}>
    <Canvas>
      <path d={`M880 -200 H1400 V${H + 300} H${930 + Math.sin(t * 0.7) * 12} C${900 + Math.sin(t * 0.7 + 1) * 22} 1500 ${960 + Math.sin(t * 0.8 + 2) * 20} 900 ${900 + Math.sin(t * 0.6) * 14} 300 Z`} fill="#58b9c9" opacity={0.95} />
      {[980, 1060, 1140].map((x, i) => <path key={x} d={`M${x + Math.sin(t * 0.7 + i) * 10} -200 C${x + 30} 600 ${x - 30} 1300 ${x + Math.sin(t * 0.8 + i) * 14} ${H + 300}`} fill="none" stroke="#3f9fb0" strokeWidth={14} opacity={0.8} />)}
    </Canvas>
  </Layer>
);

/** Bedroom at night: twinkling stars, a cloud crossing the moon, a breathing lamp glow, a swaying curtain. */
export const BedroomSet: React.FC<{t: number}> = ({t}) => {
  const glow = 0.62 + 0.08 * Math.sin(t * 1.1);
  return (
    <AbsoluteFill style={{background: '#2c3768'}}>
      <Layer p={0.35}><Outside t={t} night /></Layer>
      <Layer p={0.82}>
        <Canvas>
          <defs><radialGradient id="lamp" cx="0.78" cy="0.4" r="0.42"><stop offset="0" stopColor="#ffd98a" stopOpacity={glow * STYLE.glow} /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient></defs>
          <path d={`M-300 -300 H${W + 300} V1360 H-300 Z M130 250 V650 H470 V250 Z`} fill="#2c3768" fillRule="evenodd" />
          {Array.from({length: 13}).map((_, i) => (i * 130 - 200 < 110 || i * 130 - 200 > 480 ? <line key={i} x1={i * 130 - 200} x2={i * 130 - 200} y1={-300} y2={1360} stroke="#334075" strokeWidth={30} /> : null))}
          <rect x={112} y={232} width={376} height={436} rx={20} fill="none" stroke="#56609a" strokeWidth={30} />
          <path d="M300 250 V650 M130 450 H470" stroke="#56609a" strokeWidth={14} />
          <rect x={96} y={216} width={408} height={468} rx={26} fill="none" {...O} />
          {[-1, 1].map((k) => {
            const s = Math.sin(t * 0.8 + k) * 12;
            return <path key={k} d={`M${300 + k * 214} 190 C${300 + k * (150 + s)} 400 ${300 + k * (190 - s)} 560 ${300 + k * (140 + s * 1.4)} 730 L${300 + k * 236} 730 Z`} fill="#7d6bc4" stroke={ROOM} strokeWidth={LW} opacity={0.96} />;
          })}
          <rect x={60} y={170} width={480} height={30} rx={15} fill="#8c6a4e" {...O} />
          <g transform="translate(820 760)"><path d="M-70 0 H70 L40 -110 H-40 Z" fill="#ffcf6e" {...O} /><rect x={-8} y={0} width={16} height={220} fill="#c8a06a" {...O} /><rect x={-90} y={220} width={180} height={380} rx={14} fill="#8c6a4e" {...O} /><rect x={-70} y={250} width={140} height={90} rx={8} fill="#7a5a40" {...O} /><circle cx={0} cy={295} r={9} fill="#ffcf6e" /></g>
          <Clock x={720} y={380} r={64} t={t} face="#f7f1dc" />
          <rect x={-300} y={-300} width={W + 600} height={H + 600} fill="url(#lamp)" />
          <Motes seed="bd" n={18} t={t} area={[560, 500, 1060, 1300]} vy={-8} r={[1.6, 3.4]} color="#ffe9b0" sway={12} opacity={0.8} />
        </Canvas>
      </Layer>
      <Layer p={1}>
        <Canvas>
          <rect x={-300} y={1300} width={W + 600} height={1000} fill="#5b4a6e" />
          {Array.from({length: 7}).map((_, i) => <line key={i} x1={-300} x2={W + 300} y1={1360 + i * i * 12 + i * 34} y2={1360 + i * i * 12 + i * 34} stroke="#4e3f60" strokeWidth={4} />)}
          <rect x={-300} y={1286} width={W + 600} height={26} fill="#3b4a86" {...O} />
          <g transform="translate(0 1120)">
            <rect x={-220} y={0} width={960} height={520} rx={30} fill="#6c7fd8" {...O} />
            <rect x={20} y={-60} width={240} height={110} rx={50} fill="#fff" {...O} />
            <path d="M-220 140 C200 100 500 160 740 120 V520 H-220 Z" fill="#8d9be6" {...O} />
            {[[120, 220], [360, 250], [560, 210]].map(([x, y], i) => <path key={i} d={taperedPath([[x, y], [x + 70, y + 14], [x + 150, y + 4]], 9)} fill="#7888dc" />)}
          </g>
        </Canvas>
        <Atmos id="be" tint="#0c1230" light={[860, 700]} k={0.16} />
      </Layer>
    </AbsoluteFill>
  );
};

/**
 * One word at a time. Two looks: the boxed tag (white on navy, key word in amber), and `plain`:
 * smaller white words with a dark outline and no box, low in the frame, so they never hide the drawing.
 */
export const WordCaption: React.FC<{word: string; key_?: boolean; y?: number; pop?: number; plain?: boolean}> = ({word, key_, y = 1360, pop = 1, plain = false}) => {
  if (plain) {
    const o = STYLE.captionBg;
    const ring = [[5, 0], [-5, 0], [0, 5], [0, -5], [4, 4], [-4, 4], [4, -4], [-4, -4], [6, 3], [-6, 3], [3, 6], [-3, 6]].map(([x, yy]) => `${x}px ${yy}px 0 ${o}`).join(', ');
    return (
      <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
        <div style={{color: key_ ? STYLE.captionKey : STYLE.captionText, fontFamily: theme.font, fontWeight: 900, fontSize: key_ ? 92 : 78, letterSpacing: 1.5, transform: `scale(${pop})`, textShadow: `${ring}, 0 10px 0 rgba(0,0,0,0.35)`}}>{word.toUpperCase()}</div>
      </div>
    );
  }
  return (
    <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
      <div style={{background: STYLE.captionBg, color: key_ ? STYLE.captionKey : STYLE.captionText, fontFamily: theme.font, fontWeight: 900, fontSize: 96, padding: '6px 40px 14px', borderRadius: 32, letterSpacing: 1, transform: `rotate(-2deg) scale(${pop})`, boxShadow: '0 12px 0 rgba(0,0,0,0.2)', border: '5px solid #fff'}}>{word.toUpperCase()}</div>
    </div>
  );
};

/** The rooms a video gets when its script gives no recipe (previews, old scripts). */
export const DEFAULT_ROOMS: {clinic: RoomLook; home: RoomLook} = {
  clinic: {palette: 'mint', wall: 'stripes', floor: 'wood', window: {style: 'tall', side: 'right', view: 'garden'}, layout: 'exam-bed', chart: 'body', time: 'day'},
  home: {kind: 'bedroom', palette: 'nightblue', wall: 'paint', floor: 'wood', window: {style: 'tall', side: 'left', view: 'night'}, layout: 'bed-left', time: 'night'},
};
const ClinicSet: React.FC<SetProps> = ({t, look, people}) => <Room look={look ?? DEFAULT_ROOMS.clinic} role="clinic" t={t} people={people} />;
const HomeSet: React.FC<SetProps> = ({t, look, people}) => <Room look={look ?? DEFAULT_ROOMS.home} role="home" t={t} people={people} />;
const ClinicFore: React.FC<{t: number; look?: RoomLook}> = ({t, look}) => <RoomFore look={look ?? DEFAULT_ROOMS.clinic} role="clinic" t={t} />;
const HomeFore: React.FC<{t: number; look?: RoomLook}> = ({t, look}) => <RoomFore look={look ?? DEFAULT_ROOMS.home} role="home" t={t} />;

export const SETS: Record<SetName, React.FC<SetProps>> = {clinic: ClinicSet, home: HomeSet, throat: ThroatSet, gut: GutSet, stomach: StomachSet, mouth: MouthSet, blood: BloodSet, lungs: LungsSet, office: OfficeSet, bathroom: BathroomSet, bedroom: BedroomSet, foodpipe: FoodPipeStage, tooth: ToothStage, tummy: TummyStage, molar: ToothArenaStage, arm: ArmStage, macro: MacroStage};
export type {SetName};
/** The blurred foreground of each set: drawn OVER the characters, it moves faster than they do. */
export const FORES: Partial<Record<SetName, React.FC<{t: number; look?: RoomLook}>>> = {clinic: ClinicFore, home: HomeFore, throat: ThroatFore, gut: GutFore, stomach: StomachFore, blood: BloodFore, office: OfficeFore, bathroom: BathroomFore};
/** Where characters stand in each set (screen y of the floor). null = no floor: characters float. */
export const FLOORS: Record<SetName, number | null> = {throat: null, gut: 1330, stomach: 1440, mouth: 1300, blood: 1350, lungs: null, office: 1500, bathroom: 1580, bedroom: 1580, foodpipe: null, tooth: null, tummy: null, molar: null, arm: null, macro: null, clinic: ROOM_FLOOR, home: ROOM_FLOOR};
/** What moves behind the characters in each set (for the skill and the script writer). */
export const SET_LIFE: Record<SetName, string> = {
  throat: 'walls squeeze downward, bubbles rise, wet glints slide down, light breathes from above',
  gut: 'two rows of villi sway, food bits and bubbles drift past, a sheen runs along the floor',
  stomach: 'acid rolls in two layers, bubbles rise and pop, the folds drip, vapour rises',
  mouth: 'the uvula swings, saliva threads stretch, crumbs fall, light flickers from the lips',
  blood: 'red cells stream past at three depths, the vessel brightens with each heartbeat',
  lungs: 'air sacs fill and empty, oxygen drifts in and out with the breath',
  office: 'clouds drift and a tree sways outside, the clock ticks, the heart monitor scrolls, dust floats in the light, the plant moves',
  bathroom: 'the tap drips and ripples, steam rises, a glint crosses the mirror, the shower curtain sways',
  bedroom: 'stars twinkle, a cloud crosses the moon, curtains sway, the lamp glow breathes, the clock ticks',
  foodpipe: 'a STAGE: the food pipe cut open with its own face; the script makes a pill fall in, stick, melt, burn a sore, or ride down with water',
  tooth: 'the germs bob and wave their tails, acid fizzes, spit drips, the brush scrubs, fluoride sparkles',
  clinic: 'BUILT per video from a recipe: clouds, a tree or birds move outside, the clock ticks, plants sway, dust floats in the light, the monitor scrolls',
  home: 'BUILT per video from a recipe: stars or clouds outside, a lamp glows, steam rises from a pot, a tap drips, a curtain sways',
  macro: 'a MACRO close-up, the hero visual: view 0 entry, 1 inside, 2 caught; the hero virus talks, the spikes twitch, the drop wobbles, the tracks stream, the catchers grip',
  arm: 'a STAGE for a race: a hand and forearm cut open, one nerve from a scratch up to a sign TO THE BRAIN; a dog muzzle, saliva drops, the virus climbing, a calendar, the vaccine\'s defenders building a wall',
  molar: 'a STAGE for a fight: the top of a back tooth with spit guards, a gang of five germs, a dust-cloud fight, guards asleep, a night party with acid, a giant brush',
  tummy: 'the juice rolls and bubbles and always stays level, dinner bobs in it, the stomach churns, the posture sign tips over with it',
};
void tone;
void useContext;
void CamCtx;
