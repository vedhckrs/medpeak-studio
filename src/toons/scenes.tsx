// MedPeak Toons sets, drawn in code at 1080x1920 with depth: a darker back layer, a lit mid layer
// where characters stand, blurred foreground shapes, a light pool, floating particles and a vignette.
// Our palette: warm coral body interiors, navy outlines, teal labels; real-world sets in mint/cream.
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {blob, Grain, InkBody, lineOf, spline, taperedPath, tone} from './ink';
import {theme} from '../brand/theme';
import {STYLE} from './style';

const W = 1080;
const H = 1920;
// Set outlines are thin and coloured: maroon inside the body, slate in rooms. Never heavy black.
const FLESH = STYLE.fleshLine;
const ROOM = STYLE.roomLine;
const LW = STYLE.setLinePx;
const O = {stroke: ROOM, strokeWidth: LW, strokeLinejoin: 'round' as const};

export const Label: React.FC<{text: string; x?: number; y?: number}> = ({text, x = 740, y = 170}) => (
  <div style={{position: 'absolute', left: x, top: y, background: STYLE.label, color: '#fff', fontFamily: theme.font, fontWeight: 900, fontSize: 40, padding: '10px 28px', borderRadius: 40, border: '3px solid #0f6f66', letterSpacing: 1, boxShadow: '0 8px 0 rgba(29,43,79,0.25)'}}>{text}</div>
);

/** Finishing: a soft light from the top-left, a gentle darkening at the very bottom, paper grain. */
const Atmos: React.FC<{t: number; tint: string; particles?: string; light?: [number, number]}> = ({tint, light = [380, 520]}) => {
  const id = useId().replace(/:/g, '');
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{position: 'absolute', inset: 0}}>
        <defs>
          <radialGradient id={`pool${id}`} cx={light[0] / W} cy={light[1] / H} r="0.7"><stop offset="0" stopColor="#fff6e8" stopOpacity="0.3" /><stop offset="1" stopColor="#fff6e8" stopOpacity="0" /></radialGradient>
          <linearGradient id={`bot${id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0.75" stopColor={tint} stopOpacity="0" /><stop offset="1" stopColor={tint} stopOpacity="0.25" /></linearGradient>
        </defs>
        <rect width={W} height={H} fill={`url(#pool${id})`} />
        <rect width={W} height={H} fill={`url(#bot${id})`} />
      </svg>
      <Grain opacity={0.09} />
    </>
  );
};

/**
 * A painted organic wall in flat cel style: crisp light and dark patches (no blur) and tapered
 * wrinkle marks, each with a thin light edge. `dir` = 'v' vertical folds, 'h' horizontal folds.
 */
const Painted: React.FC<{seed: string; base: string; area?: [number, number, number, number]; dir?: 'v' | 'h'; marks?: number; blotches?: number; t?: number}> = ({seed, base, area = [0, 0, W, H], dir = 'v', marks = 26, blotches = 14, t = 0}) => {
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
        return <path key={i} d={blob(dir === 'v' ? ry : rx, dir === 'v' ? rx * 1.3 : ry, `${seed}b${i}`, 9, 0.2, cx, cy)} fill={tone(base, light ? -0.1 : 0.07)} opacity={0.42} />;
      })}
      {Array.from({length: marks}).map((_, i) => {
        const cx = x0 + random(`${seed}mx${i}`) * (x1 - x0);
        const cy = y0 + random(`${seed}my${i}`) * (y1 - y0);
        const len = 50 + random(`${seed}ml${i}`) * 130;
        const wob = (k: number) => (random(`${seed}mw${i}${k}`) - 0.5) * 24 + Math.sin(t * 0.8 + i) * 2;
        const pts: [number, number][] = dir === 'v'
          ? [[cx + wob(1), cy], [cx + wob(2), cy + len * 0.5], [cx + wob(3), cy + len]]
          : [[cx, cy + wob(1)], [cx + len * 0.5, cy + wob(2)], [cx + len, cy + wob(3)]];
        const w = 4 + random(`${seed}mt${i}`) * 5;
        return (
          <g key={i}>
            <path d={taperedPath(pts, w * 0.8)} fill={tone(base, -0.16)} transform={dir === 'v' ? 'translate(5 0)' : 'translate(0 5)'} opacity={0.8} />
            <path d={taperedPath(pts, w)} fill={tone(base, 0.22)} />
          </g>
        );
      })}
    </g>
  );
};

const Blur: React.FC<{id: string; s?: number}> = ({id, s = 10}) => <filter id={id} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={s} /></filter>;

// ------------------------------------------------------------------- inside the body

/** Organic wall edge: a wavy vertical line made of bumps (for throat / vessel sides). */
const edge = (x: number, seed: string, amp = 40, bumps = 9, flip = 1): [number, number][] =>
  Array.from({length: bumps + 1}, (_, i) => [x + flip * (Math.sin(i * 1.7) * amp * 0.4 + (random(`${seed}${i}`) - 0.5) * amp), (i / bumps) * H] as [number, number]);

/** Floor: an organic band at the bottom with soft blotches and a lit top edge. */
const Floor: React.FC<{y: number; color: string; seed: string}> = ({y, color, seed}) => {
  const top = Array.from({length: 9}, (_, i) => [(i / 8) * W, y + (random(`${seed}f${i}`) - 0.5) * 50] as [number, number]);
  const d = spline([[-60, H + 60], [-60, y], ...top, [W + 60, y], [W + 60, H + 60]], true, 0.4);
  return (
    <g>
      <path d={d} fill={color} />
      <Painted seed={`${seed}fl`} base={color} area={[0, y + 40, W, H]} dir="h" marks={10} blotches={10} />
      <path d={spline(top, false)} fill="none" stroke={tone(color, -0.25)} strokeWidth={10} strokeLinecap="round" transform="translate(0 8)" opacity={0.7} />
      <path d={spline(top, false)} fill="none" stroke={FLESH} strokeWidth={LW} strokeLinecap="round" />
    </g>
  );
};

/** Inside the throat: soft mucosa walls closing in from both sides, folds receding upward. */
export const ThroatSet: React.FC<{t: number}> = ({t}) => {
  const L = edge(300, 'thl', 70, 10, 1);
  const R = edge(780, 'thr', 70, 10, -1);
  const breathe = Math.sin(t * 1.2) * 8;
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect width={W} height={H} fill="#f2a99e" />
        <Painted seed="thc" base="#f2a99e" area={[260, 0, 820, H]} dir="h" marks={18} t={t} />
        <path d={spline([[-80, -40], ...L.map(([x, y]) => [x + breathe, y] as [number, number]), [-80, H + 40]], true, 0.45)} fill="#e07a83" />
        <path d={spline([[W + 80, -40], ...R.map(([x, y]) => [x - breathe, y] as [number, number]), [W + 80, H + 40]], true, 0.45)} fill="#e07a83" />
        <Painted seed="thw1" base="#e07a83" area={[0, 0, 280, H]} t={t} />
        <Painted seed="thw2" base="#e07a83" area={[800, 0, W, H]} t={t} />
        <path d={spline(L.map(([x, y]) => [x + breathe, y] as [number, number]), false)} fill="none" stroke={FLESH} strokeWidth={LW} />
        <path d={spline(R.map(([x, y]) => [x - breathe, y] as [number, number]), false)} fill="none" stroke={FLESH} strokeWidth={LW} />
        <path d={spline(L.map(([x, y]) => [x + breathe + 18, y] as [number, number]), false)} fill="none" stroke="#f6c2b8" strokeWidth={8} opacity={0.6} />
      </svg>
      <Atmos t={t} tint="#6b1f2e" light={[540, 700]} />
      <Label text="THROAT" />
    </AbsoluteFill>
  );
};

/** The gut: a soft corridor with a back wall of folds and a floor lined with finger-like villi. */
export const GutSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#f0a8a0" />
      <Painted seed="gw" base="#f0a8a0" area={[0, 0, W, 1300]} dir="h" marks={30} t={t} />
      {Array.from({length: 9}).map((_, i) => {
        const x = 40 + i * 125;
        const h = 150 + random(`gv${i}`) * 90;
        const sway = Math.sin(t * 1.5 + i) * 10;
        return <path key={i} d={spline([[x - 38, 1290], [x - 30 + sway * 0.5, 1290 - h * 0.6], [x + sway, 1290 - h], [x + 30 + sway * 0.5, 1290 - h * 0.6], [x + 38, 1290]], false)} fill="#e4848b" stroke={FLESH} strokeWidth={LW} />;
      })}
      <Floor y={1300} color="#e88b90" seed="gf" />
    </svg>
    <Atmos t={t} tint="#6b1f2e" light={[420, 600]} />
    <Label text="GUT" />
  </AbsoluteFill>
);

/** Inside the stomach: wrinkly walls (rugae) above, a bubbling green acid pool below. */
export const StomachSet: React.FC<{t: number}> = ({t}) => {
  const surf = Array.from({length: 9}, (_, i) => [(i / 8) * W, 1420 + Math.sin(t * 2 + i * 1.3) * 16 + (random(`ss${i}`) - 0.5) * 20] as [number, number]);
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect width={W} height={H} fill="#e8909a" />
        <Painted seed="sw" base="#e8909a" area={[0, 0, W, 1420]} dir="h" marks={40} blotches={18} t={t} />
        <path d={spline([[-40, H + 40], [-40, 1420], ...surf, [W + 40, 1420], [W + 40, H + 40]], true, 0.4)} fill="#b7d65a" />
        <Painted seed="sa" base="#b7d65a" area={[0, 1460, W, H]} dir="h" marks={6} blotches={10} />
        <path d={spline(surf, false)} fill="none" stroke="#e3f39b" strokeWidth={12} transform="translate(0 10)" opacity={0.8} />
        <path d={spline(surf, false)} fill="none" stroke={FLESH} strokeWidth={LW} />
        {Array.from({length: 16}).map((_, i) => {
          const life = (t * 0.7 + random(`b${i}`) * 3) % 3;
          const r = 9 + random(`br${i}`) * 18;
          return (
            <g key={i} opacity={Math.min(1, 3 - life)}>
              <path d={blob(r, r * 0.92, `bb${i}`, 8, 0.06, 60 + random(`bx${i}`) * 960, 1880 - life * 150)} fill="#d9ef8a" stroke={lineOf('#b7d65a')} strokeWidth={2.4} />
              <circle cx={60 + random(`bx${i}`) * 960 - r * 0.35} cy={1880 - life * 150 - r * 0.35} r={r * 0.22} fill="#fff" opacity={0.8} />
            </g>
          );
        })}
      </svg>
      <Atmos t={t} tint="#5a1b2a" light={[400, 500]} />
      <Label text="STOMACH" />
    </AbsoluteFill>
  );
};

/** Inside the mouth: teeth above, the tongue as a soft floor, light from the open lips. */
export const MouthSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#7c2636" />
      <Painted seed="mw" base="#7c2636" area={[0, 300, W, 1300]} dir="v" marks={14} />
      <path d={blob(170, 240, 'thr', 10, 0.08, 540, 780)} fill="#2e0a14" />
      <path d={spline([[470, 560], [500, 690], [540, 715], [580, 690], [610, 560]], false)} fill="#ff8f9c" stroke={FLESH} strokeWidth={LW} />
      <path d={spline([[-40, 380], [200, 520], [540, 560], [880, 520], [1120, 380], [1120, -40], [-40, -40]], true, 0.4)} fill="#e8707e" />
      <Painted seed="mp" base="#e8707e" area={[0, 0, W, 460]} dir="h" marks={10} blotches={8} />
      {Array.from({length: 7}).map((_, i) => {
        const x = 90 + i * 150;
        const y = 455 + (Math.abs(3 - i) * -16);
        return <g key={i} transform={`translate(${x} ${y})`}><InkBody d={spline([[-62, -40], [-58, 40], [-30, 78], [0, 70], [30, 78], [58, 40], [62, -40]], true, 0.5)} color="#fdfbf4" shadow={0.1} /></g>;
      })}
      <Floor y={1240 + Math.sin(t * 1.5) * 10} color="#ff8a98" seed="mt" />
      <path d={spline([[540, 1280], [530, 1500], [550, 1700], [540, 1940]], false)} fill="none" stroke="#e46b7c" strokeWidth={9} strokeLinecap="round" />
    </svg>
    <Atmos t={t} tint="#2e0a14" light={[540, 260]} />
    <Label text="MOUTH" x={60} y={70} />
  </AbsoluteFill>
);

/** The bloodstream: a vessel corridor with a soft floor; red cells drift past, blurred when far. */
export const BloodSet: React.FC<{t: number}> = ({t}) => {
  const id = useId().replace(/:/g, '');
  return (
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <defs><filter id={`vb${id}`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3" /></filter></defs>
        <rect width={W} height={H} fill="#e06a6f" />
        <Painted seed="vw" base="#e06a6f" area={[0, 0, W, 1320]} dir="v" marks={34} blotches={16} t={t} />
        {Array.from({length: 7}).map((_, i) => {
          const x = ((random(`x${i}`) * 1400 + t * (50 + random(`s${i}`) * 60)) % 1400) - 160;
          const y = 260 + random(`y${i}`) * 900;
          return (
            <g key={i} transform={`translate(${x} ${y}) scale(${0.6 + random(`k${i}`) * 0.5}) rotate(${random(`r${i}`) * 40})`} filter={`url(#vb${id})`} opacity={0.5}>
              <path d={blob(70, 48, `rc${i}`, 10, 0.05)} fill="#c8333b" />
              <path d={blob(36, 22, `rd${i}`, 8, 0.05)} fill="#a82730" />
            </g>
          );
        })}
        <Floor y={1330} color="#ee8a8a" seed="vf" />
      </svg>
      <Atmos t={t} tint="#4a0d18" light={[420, 600]} />
      <Label text="BLOODSTREAM" x={590} />
    </AbsoluteFill>
  );
};

/** Inside the lungs: branching airways ending in grape-like air sacs that breathe. */
export const LungsSet: React.FC<{t: number}> = ({t}) => {
  const breathe = 1 + Math.sin(t * 1.4) * 0.04;
  const branch = (x: number, y: number, a: number, len: number, d: number, key: string): React.ReactNode[] => {
    if (d === 0) {
      return [<g key={key}>{[0, 1, 2, 3].map((k) => (
        <g key={k} transform={`translate(${x + Math.cos(a + k * 0.9 - 1.3) * 26} ${y + Math.sin(a + k * 0.9 - 1.3) * 26}) scale(${breathe})`}>
          <InkBody d={blob(24, 22, `${key}${k}`, 8, 0.08)} color="#ffb0c2" line={2.6} shadow={0.2} />
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
    <AbsoluteFill>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
        <rect width={W} height={H} fill="#eb9cb0" />
        <Painted seed="lw" base="#eb9cb0" area={[0, 0, W, H]} dir="v" marks={16} />
        {branch(540, -60, Math.PI / 2, 430, 5, 'r')}
      </svg>
      <Atmos t={t} tint="#6a1f3a" light={[540, 500]} />
      <Label text="LUNGS" />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------- the real world

/** Dr. Mira's office: mint wall with a window and body poster, a desk in front. */
export const OfficeSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><Blur id="ob" s={12} /><linearGradient id="og" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9efe6" /><stop offset="1" stopColor="#a8ddd1" /></linearGradient></defs>
      <rect width={W} height={1360} fill="url(#og)" />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 100} x2={i * 100} y1={0} y2={1360} stroke="#b6e3d8" strokeWidth={4} />)}
      <rect y={1340} width={W} height={580} fill="#e8c9a0" />
      {Array.from({length: 8}).map((_, i) => <line key={i} x1={0} x2={W} y1={1400 + i * 75} y2={1400 + i * 75} stroke="#d4b385" strokeWidth={6} />)}
      <rect y={1324} width={W} height={26} fill="#f6f1e7" {...O} />
      <g transform="translate(110 280)">
        <rect x={16} y={18} width={320} height={460} rx={18} fill="#7fb8ab" opacity={0.55} />
        <rect width={320} height={460} rx={18} fill="#fff" {...O} />
        <circle cx={160} cy={100} r={44} fill="#ffd2c4" {...O} />
        <rect x={116} y={156} width={88} height={190} rx={34} fill="#ffd2c4" {...O} />
        <circle cx={140} cy={220} r={16} fill="#ff6f7d" /><ellipse cx={178} cy={262} rx={20} ry={13} fill="#c9645a" /><circle cx={150} cy={300} r={9} fill="#f2a63c" />
        <rect x={64} y={378} width={192} height={20} rx={10} fill="#2ec4b6" /><rect x={90} y={410} width={140} height={14} rx={7} fill="#c8d6e5" />
      </g>
      <path d="M660 640 L980 640 L1080 1324 L420 1324 Z" fill="#fff8d6" opacity={0.22} />
      <g transform="translate(660 250)">
        <rect x={16} y={18} width={320} height={380} rx={22} fill="#7fb8ab" opacity={0.55} />
        <rect width={320} height={380} rx={22} fill="#e8f7ff" {...O} />
        <rect x={20} y={20} width={280} height={340} rx={12} fill="#bde6ff" />
        <circle cx={90} cy={100} r={38} fill="#ffe08a" />
        <path d={`M20 300 C90 ${250 + Math.sin(t) * 6} 160 320 300 270 V360 H20 Z`} fill="#8fd6a8" />
        <line x1={160} x2={160} y1={0} y2={380} {...O} /><line x1={0} x2={320} y1={190} y2={190} {...O} />
      </g>
      <g transform="translate(560 760)"><rect x={12} y={14} width={180} height={240} rx={10} fill="#7fb8ab" opacity={0.55} /><rect width={180} height={240} rx={10} fill="#fff" {...O} /><rect x={20} y={20} width={140} height={14} rx={7} fill="#2ec4b6" />{[60, 90, 120, 150].map((y) => <rect key={y} x={20} y={y} width={140} height={10} rx={5} fill="#c8d6e5" />)}</g>
      <g transform="translate(900 1120)">
        <path d="M-56 200 L-44 70 H44 L56 200 Z" fill="#ff9f6e" {...O} />
        {[-44, 0, 44].map((a, i) => <ellipse key={i} cx={a} cy={20 - (i === 1 ? 50 : 0)} rx={32} ry={78} fill="#43c08a" {...O} transform={`rotate(${a / 2 + Math.sin(t + i) * 2} ${a} 60)`} />)}
      </g>
          </svg>
    <Atmos t={t} tint="#3d6b66" light={[780, 400]} particles="#ffffff" />
  </AbsoluteFill>
);

/** Dr. Mira's desk: drawn in FRONT of the characters (clipboard, pill bottle, mug). */
export const OfficeDesk: React.FC<{y?: number}> = ({y = 1470}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <g transform={`translate(0 ${y})`}>
        <rect x={-20} y={34} width={W + 40} height={520} fill="#b98557" />
        <rect x={-20} y={34} width={W + 40} height={40} fill="#8f623c" opacity={0.6} />
        <rect x={-20} y={0} width={W + 40} height={44} rx={12} fill="#d9a877" {...O} />
        <rect x={-20} y={4} width={W + 40} height={10} fill="#f0c898" opacity={0.8} />
        {[140, 420, 700, 960].map((x, i) => <path key={i} d={taperedPath([[x, 120], [x + 60, 135], [x + 150, 125]], 6)} fill="#9c6c43" />)}
        {/* clipboard */}
        <g transform="translate(90 -150) rotate(-8)">
          <rect x={10} y={12} width={190} height={150} rx={10} fill="#5b4030" opacity={0.3} />
          <rect width={190} height={150} rx={10} fill="#c98b5a" {...O} />
          <rect x={14} y={16} width={162} height={122} rx={4} fill="#fff" />
          {[36, 60, 84, 108].map((yy, i) => <rect key={yy} x={28} y={yy} width={i === 3 ? 80 : 134} height={9} rx={4} fill={i === 0 ? '#2ec4b6' : '#c8d6e5'} />)}
          <rect x={70} y={-12} width={50} height={24} rx={6} fill="#9fb3c8" {...O} />
        </g>
        {/* pill bottle */}
        <g transform="translate(760 -150)">
          <ellipse cx={52} cy={152} rx={60} ry={10} fill="#5b4030" opacity={0.3} />
          <rect x={0} y={30} width={100} height={122} rx={14} fill="#ff9f43" {...O} />
          <rect x={0} y={66} width={100} height={52} fill="#fff" stroke={ROOM} strokeWidth={LW} />
          <rect x={22} y={80} width={56} height={8} rx={4} fill="#2ec4b6" /><rect x={22} y={96} width={36} height={7} rx={3} fill="#c8d6e5" />
          <rect x={-6} y={0} width={112} height={36} rx={8} fill="#fff" {...O} />
          <rect x={14} y={40} width={10} height={100} rx={5} fill="#ffd29a" opacity={0.8} />
        </g>
        {/* mug */}
        <g transform="translate(930 -110)">
          <ellipse cx={46} cy={112} rx={54} ry={9} fill="#5b4030" opacity={0.3} />
          <path d="M84 30 C120 30 120 84 84 84" fill="none" stroke={ROOM} strokeWidth={13} />
          <path d="M84 30 C120 30 120 84 84 84" fill="none" stroke="#2ec4b6" strokeWidth={6.6} />
          <rect x={0} y={0} width={90} height={112} rx={14} fill="#2ec4b6" {...O} />
          <path d="M30 60 l10 -22 l8 34 l10 -22 h12" fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          <rect x={10} y={10} width={10} height={90} rx={5} fill="#7fe3d6" opacity={0.8} />
        </g>
      </g>
    </svg>
  </AbsoluteFill>
);

/** Bathroom: tiles, mirror, sink and the toilet (for the gut stories). */
export const BathroomSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <rect width={W} height={H} fill="#e6f3fb" />
      {Array.from({length: 12}).map((_, r) => Array.from({length: 8}).map((_, c) => (
        <rect key={`${r}-${c}`} x={c * 140 + (r % 2) * 70 - 70} y={r * 120} width={136} height={116} rx={8} fill={(r + c) % 5 === 0 ? '#cfe8f6' : '#dff0fa'} />
      )))}
      <rect y={1380} width={W} height={540} fill="#9fc7e0" />
      {Array.from({length: 8}).map((_, i) => <line key={i} x1={i * 150} x2={i * 150 - 80} y1={1380} y2={1920} stroke="#8bb7d2" strokeWidth={5} />)}
      <g transform="translate(120 360)"><rect width={360} height={460} rx={180} fill="#cfefff" {...O} /><path d="M60 80 L140 160 M100 60 L180 140" stroke="#fff" strokeWidth={16} strokeLinecap="round" opacity={0.8} /></g>
      <g transform="translate(110 900)"><path d="M0 0 H380 L340 160 H40 Z" fill="#fff" {...O} /><rect x={170} y={160} width={40} height={320} fill="#fff" {...O} /><path d="M180 0 V-60 H240" fill="none" stroke="#9fb3c8" strokeWidth={16} strokeLinecap="round" /></g>
      <g transform="translate(640 940)">
        <rect x={60} y={0} width={260} height={220} rx={30} fill="#fff" {...O} />
        <path d="M0 300 C0 250 380 250 380 300 C380 420 300 470 190 470 C80 470 0 420 0 300 Z" fill="#fff" {...O} />
        <ellipse cx={190} cy={300} rx={160} ry={40} fill="#e8f2f8" {...O} />
        <rect x={130} y={460} width={120} height={60} fill="#fff" {...O} />
      </g>
      <g transform="translate(960 760)"><circle r={70} fill="#fff" {...O} /><circle r={22} fill="#e6f3fb" {...O} /></g>
    </svg>
    <Atmos t={t} tint="#3d5a80" light={[300, 400]} />
  </AbsoluteFill>
);

/** Bedroom at night: bed, lamp glow, window with the moon (sleep stories). */
export const BedroomSet: React.FC<{t: number}> = ({t}) => (
  <AbsoluteFill>
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%">
      <defs><radialGradient id="lamp" cx="0.8" cy="0.42" r="0.4"><stop offset="0" stopColor="#ffd98a" stopOpacity="0.7" /><stop offset="1" stopColor="#ffd98a" stopOpacity="0" /></radialGradient></defs>
      <rect width={W} height={H} fill="#2c3768" />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={i * 130} x2={i * 130} y1={0} y2={1300} stroke="#334075" strokeWidth={30} />)}
      <rect y={1300} width={W} height={620} fill="#5b4a6e" />
      <g transform="translate(120 240)">
        <rect width={360} height={420} rx={20} fill="#16204a" {...O} />
        <circle cx={250} cy={120} r={56} fill="#fff4c2" /><circle cx={226} cy={104} r={50} fill="#16204a" />
        {[[60, 90], [120, 220], [300, 300], [80, 340]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 + Math.sin(t * 3 + i) * 1.5} fill="#fff" />)}
        <line x1={180} x2={180} y1={0} y2={420} {...O} />
      </g>
      <rect width={W} height={H} fill="url(#lamp)" />
      <g transform="translate(820 760)"><path d="M-70 0 H70 L40 -110 H-40 Z" fill="#ffcf6e" {...O} /><rect x={-8} y={0} width={16} height={220} fill="#c8a06a" {...O} /><rect x={-90} y={220} width={180} height={300} rx={14} fill="#8c6a4e" {...O} /></g>
      <g transform="translate(0 1120)">
        <rect x={-20} y={0} width={760} height={420} rx={30} fill="#6c7fd8" {...O} />
        <rect x={20} y={-60} width={240} height={110} rx={50} fill="#fff" {...O} />
        <path d="M-20 140 C200 100 500 160 740 120 V420 H-20 Z" fill="#8d9be6" {...O} />
      </g>
    </svg>
    <Atmos t={t} tint="#0c1230" light={[860, 700]} particles="#ffe9b0" />
  </AbsoluteFill>
);

/** One word at a time: white on a navy rounded tag, the key word in amber, a small pop-in tilt. */
export const WordCaption: React.FC<{word: string; key_?: boolean; y?: number; pop?: number}> = ({word, key_, y = 1360, pop = 1}) => (
  <div style={{position: 'absolute', top: y, left: 0, right: 0, display: 'flex', justifyContent: 'center'}}>
    <div style={{background: STYLE.captionBg, color: key_ ? STYLE.captionKey : STYLE.captionText, fontFamily: theme.font, fontWeight: 900, fontSize: 96, padding: '6px 40px 14px', borderRadius: 32, letterSpacing: 1, transform: `rotate(-2deg) scale(${pop})`, boxShadow: '0 12px 0 rgba(0,0,0,0.2)', border: '5px solid #fff'}}>{word.toUpperCase()}</div>
  </div>
);

export const SETS = {throat: ThroatSet, gut: GutSet, stomach: StomachSet, mouth: MouthSet, blood: BloodSet, lungs: LungsSet, office: OfficeSet, bathroom: BathroomSet, bedroom: BedroomSet};
export type SetName = keyof typeof SETS;
