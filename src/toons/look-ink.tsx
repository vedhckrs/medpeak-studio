/**
 * MedPeak Toons - THE INK LOOK (proposal, 2026-11-17): one finished still of the rabies arm, drawn the
 * way the reference study says works (plans/reference-deep-study-2026-11-17.md):
 *   - the anatomy fills the frame (the camera is inside the arm, layers run off every edge);
 *   - bold dark outlines with a slight hand-drawn variation;
 *   - body characters are anatomy plus two plain eyes (black ring, black dot) and a tiny mouth;
 *   - depth inside tissue: a dark band inside every wall, a lighter lining, irregular fat lobules;
 *   - one muted colour family (salmon, coral, maroon, cream);
 *   - labels in white boxes with black text.
 * Our own drawing; only the kind of look follows the study. Not approved yet.
 */
import React, {useId} from 'react';
import {AbsoluteFill, random} from 'remotion';
import {type P, spline} from './ink';
import {theme} from '../brand/theme';

const W = 1080;
const H = 1920;
export const INK = {line: '#2b1a17', w: 7, wIn: 4};

/** Points jittered a little, seeded, so a code-drawn outline wavers like a hand-drawn one. */
const wob = (pts: P[], seed: string, amp = 6): P[] => pts.map(([x, y], i) => [x + (random(`${seed}x${i}`) - 0.5) * 2 * amp, y + (random(`${seed}y${i}`) - 0.5) * 2 * amp]);
/** A closed organic shape around a centre (an ellipse with an uneven edge). */
const lump = (cx: number, cy: number, rx: number, ry: number, seed: string, n = 14, irr = 0.12): P[] =>
  Array.from({length: n}, (_, i) => { const a = (i / n) * Math.PI * 2; const k = 1 + (random(`${seed}${i}`) - 0.5) * 2 * irr; return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k] as P; });
/** A ribbon (a tube seen from the side) along a centre line, as one closed outline. */
const ribbon = (line: P[], w0: number, w1: number): P[] => {
  const n = line.length;
  const side = (s: number) => line.map(([x, y], i) => {
    const [ax, ay] = line[Math.max(0, i - 1)];
    const [bx, by] = line[Math.min(n - 1, i + 1)];
    const len = Math.hypot(bx - ax, by - ay) || 1;
    const w = (w0 + (w1 - w0) * (i / (n - 1))) / 2;
    return [x + (-(by - ay) / len) * w * s, y + ((bx - ax) / len) * w * s] as P;
  });
  return [...side(1), ...side(-1).reverse()];
};

/**
 * A piece of tissue: its fill, a dark band inside its wall (depth), a lighter lining band, and a bold
 * outline. `d` is a closed path.
 */
const Tissue: React.FC<{d: string; fill: string; deep: string; lining?: string; band?: number; line?: number}> = ({d, fill, deep, lining, band = 46, line = INK.w}) => {
  const id = `ti${useId().replace(/:/g, '')}`;
  return (
    <g>
      <defs>
        <clipPath id={`${id}c`}><path d={d} /></clipPath>
        <filter id={`${id}f`} x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation={band * 0.32} /></filter>
      </defs>
      <path d={d} fill={fill} />
      <g clipPath={`url(#${id}c)`}>
        <path d={d} fill="none" stroke={deep} strokeWidth={band * 1.6} filter={`url(#${id}f)`} opacity={0.75} />
        {lining && <path d={d} fill="none" stroke={lining} strokeWidth={band * 0.34} opacity={0.65} transform="translate(0 0)" />}
      </g>
      <path d={d} fill="none" stroke={INK.line} strokeWidth={line} strokeLinejoin="round" />
    </g>
  );
};

/** Two plain eyes: black ring, white, a black dot; no shine. `look` moves the dots. */
export const InkEyes: React.FC<{x: number; y: number; r: number; gap?: number; look?: [number, number]; lid?: number}> = ({x, y, r, gap = 0.98, look = [0, -0.35], lid = 0}) => (
  <g>
    {[-1, 1].map((s) => {
      const cx = x + s * r * gap;
      return (
        <g key={s}>
          <circle cx={cx} cy={y} r={r} fill="#ffffff" stroke={INK.line} strokeWidth={INK.wIn} />
          <circle cx={cx + look[0] * r * 0.42} cy={y + look[1] * r * 0.42} r={r * 0.27} fill={INK.line} />
          {lid > 0 && <path d={`M${cx - r} ${y} A${r} ${r} 0 0 1 ${cx + r} ${y} Z`} transform={`translate(0 ${-r * (1 - lid)})`} fill="#c97b62" stroke={INK.line} strokeWidth={INK.wIn} />}
        </g>
      );
    })}
  </g>
);

/** A white label box with black text, as on an anatomy chart. */
const Label: React.FC<{x: number; y: number; text: string; size?: number; rot?: number}> = ({x, y, text, size = 34, rot = 0}) => {
  const w = text.length * size * 0.62 + size * 0.9;
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot})`}>
      <rect x={-w / 2} y={-size * 0.8} width={w} height={size * 1.6} fill="#ffffff" stroke={INK.line} strokeWidth={4} />
      <text x={0} y={size * 0.36} textAnchor="middle" fontFamily={theme.font} fontWeight={800} fontSize={size} fill={INK.line} letterSpacing={1}>{text}</text>
    </g>
  );
};

// ------------------------------------------------------------------ the arm, from inside
const SURFACE = 1500; // the skin's surface: below it is the air outside
const SCRATCH: P = [452, SURFACE + 4];
const NERVE: P[] = [[468, 1412], [478, 1300], [520, 1180], [598, 1040], [628, 880], [586, 700], [520, 540], [512, 380], [560, 220], [610, 60], [630, -60]];
const ARTERY: P[] = [[735, 1240], [740, 1100], [770, 940], [790, 760], [760, 560], [700, 400], [690, 220], [712, 40], [720, -60]];

export const InkArmLook: React.FC<{t?: number}> = ({t = 1.2}) => {
  // muscle bundles: four long fleshy columns that fill the frame above the fat
  const bundles: {pts: P[]; seed: string}[] = [
    {seed: 'm1', pts: [[-60, -80], [250, -80], [262, 300], [250, 700], [276, 1060], [252, 1250], [-60, 1250]]},
    {seed: 'm2', pts: [[290, -80], [500, -80], [470, 300], [430, 640], [494, 960], [440, 1215], [300, 1240], [296, 900], [306, 500]]},
    {seed: 'm3', pts: [[560, 260], [640, 140], [670, 420], [700, 680], [690, 940], [640, 1120], [560, 1210], [600, 980], [660, 760], [602, 560]]},
    {seed: 'm4', pts: [[840, -80], [1140, -80], [1140, 1250], [830, 1250], [880, 1000], [850, 640], [880, 300]]},
  ];
  const fat = Array.from({length: 22}).map((_, i) => ({i, x: -20 + (i % 11) * 108 + (Math.floor(i / 11) % 2) * 54, y: 1290 + Math.floor(i / 11) * 82, rx: 58 + random(`fr${i}`) * 18, ry: 40 + random(`fy${i}`) * 10}));
  const nerveD = spline(wob(ribbon(NERVE, 54, 86), 'nv', 2.5), true, 0.5);
  const arteryD = spline(wob(ribbon(ARTERY, 50, 64), 'ar', 2.5), true, 0.5);
  // the virus: bullet-shaped (rabies virus is), knobs all round, eyes and a tiny mouth
  const V: P = [470, 1236];
  const bullet = (k: number) => `M${-58 * k} ${70 * k} L${-58 * k} ${-28 * k} Q${-58 * k} ${-96 * k} 0 ${-100 * k} Q${58 * k} ${-96 * k} ${58 * k} ${-28 * k} L${58 * k} ${70 * k} Z`;
  return (
    <AbsoluteFill style={{background: '#e9eef0'}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        {/* outside: the air, light and plain */}
        <rect x={0} y={0} width={W} height={H} fill="#dde9ee" />

        {/* deep tissue behind everything: the dark between the muscles */}
        <rect x={-40} y={-80} width={W + 80} height={1360} fill="#7d2633" />
        {bundles.map((b) => <Tissue key={b.seed} d={spline(wob(b.pts, b.seed, 8), true, 0.55)} fill="#d4626a" deep="#8e2f3b" lining="#f0a29c" band={58} />)}
        {/* fibre lines along each muscle */}
        {[[60, 0.0], [150, 0.4], [360, 0.2], [420, 0.6], [640, 0.1], [930, 0.3], [1010, 0.5]].map(([x, s], i) => <path key={i} d={spline(wob([[x, -40], [x + 12, 300], [x - 8, 640], [x + 10, 980], [x, 1220]], `fb${i}`, 10), false, 0.5)} fill="none" stroke="#a9414c" strokeWidth={4} strokeLinecap="round" opacity={0.55 + s * 0.2} />)}

        {/* the artery beside the nerve, and the nerve itself: a pale cord with its bundles inside */}
        <Tissue d={arteryD} fill="#b8414f" deep="#6e1e2a" lining="#e98a8f" band={22} />
        <Tissue d={nerveD} fill="#f6e3a4" deep="#c9a856" lining="#fff7d6" band={26} />
        {[-14, 0, 14].map((o, i) => <path key={i} d={spline(NERVE.map(([x, y], j) => [x + o * (1 - j / NERVE.length * 0.4), y] as P), false, 0.5)} fill="none" stroke="#d7b964" strokeWidth={3} opacity={0.8} />)}

        {/* fat: soft cream lobules packed under the skin */}
        <path d={`M-40 1262 Q540 1240 1120 1262 L1120 1420 L-40 1420 Z`} fill="#e9c97a" />
        {fat.map((f) => <Tissue key={f.i} d={spline(lump(f.x, f.y, f.rx, f.ry, `fl${f.i}`, 12, 0.12), true, 0.6)} fill="#f6dc95" deep="#d4b060" band={18} line={INK.wIn} />)}
        <path d="M-40 1262 Q540 1240 1120 1262" fill="none" stroke={INK.line} strokeWidth={INK.w} />

        {/* skin: the dermis, the thin outer layer, then the surface */}
        <Tissue d={spline(wob([[-60, 1410], [300, 1398], [700, 1414], [1140, 1402], [1140, SURFACE + 2], [700, SURFACE + 8], [300, SURFACE - 2], [-60, SURFACE + 6]], 'derm', 4), true, 0.4)} fill="#efb39c" deep="#c97b62" band={22} />
        <path d={spline(wob([[-60, SURFACE - 14], [300, SURFACE - 22], [700, SURFACE - 12], [1140, SURFACE - 20]], 'epi', 3), false, 0.5)} fill="none" stroke="#c98a6c" strokeWidth={3} />
        {/* the nerve's fine endings in the skin, branching to the scratch */}
        {[[[468, 1412], [454, 1450], [440, 1484]], [[468, 1412], [490, 1452], [508, 1482]], [[468, 1412], [470, 1460]]].map((pts, i) => <path key={i} d={spline(pts as P[], false, 0.5)} fill="none" stroke="#e8cf86" strokeWidth={6} strokeLinecap="round" />)}

        {/* the scratch: a small notch in the surface, no blood */}
        <path d={`M${SCRATCH[0] - 46} ${SURFACE + 2} L${SCRATCH[0] - 10} ${SURFACE - 30} L${SCRATCH[0] + 8} ${SURFACE - 6} L${SCRATCH[0] + 30} ${SURFACE - 26} L${SCRATCH[0] + 50} ${SURFACE + 4} Z`} fill="#e2858a" stroke={INK.line} strokeWidth={INK.wIn} strokeLinejoin="round" />

        {/* the dog, from outside: a big friendly head at the lower right, its nose at the scratch */}
        <g>
          <path d={spline(wob([[1010, 1555], [1050, 1470], [1110, 1470], [1120, 1600], [1060, 1610]], 'ear', 4), true, 0.6)} fill="#9c6438" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
          <path d={spline(wob([[592, 1606], [660, 1560], [780, 1546], [930, 1570], [1140, 1600], [1140, 1980], [780, 1980], [660, 1820], [610, 1710]], 'dog', 5), true, 0.5)} fill="#c98c55" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
          <path d={spline(wob([[640, 1660], [700, 1700], [780, 1720], [860, 1716]], 'muz', 3), false, 0.5)} fill="none" stroke="#9c6438" strokeWidth={5} strokeLinecap="round" />
          <path d={spline(wob([[574, 1590], [600, 1566], [640, 1570], [652, 1604], [624, 1630], [588, 1624]], 'nose', 2), true, 0.6)} fill={INK.line} />
          <path d="M630 1668 Q700 1740 800 1730" fill="none" stroke={INK.line} strokeWidth={INK.wIn} strokeLinecap="round" />
          <path d="M700 1722 Q712 1764 742 1752 Q748 1736 740 1728" fill="#e27a82" stroke={INK.line} strokeWidth={INK.wIn} strokeLinejoin="round" />
          <InkEyes x={880} y={1640} r={28} gap={0} look={[-0.6, -0.4]} />
          {[[690, 1660], [720, 1684], [750, 1664]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4} fill="#7d5130" />)}
        </g>
        {/* saliva: two clear drops at the notch */}
        {[[420, SURFACE + 30, 14], [480, SURFACE + 58, 11]].map(([x, y, r], i) => <path key={i} d={`M${x} ${y - r * 1.8} C${x + r} ${y - r * 0.4} ${x + r} ${y + r} ${x} ${y + r} C${x - r} ${y + r} ${x - r} ${y - r * 0.4} ${x} ${y - r * 1.8} Z`} fill="#eef8fc" stroke={INK.line} strokeWidth={3} />)}

        {/* the virus: a bullet shape on the nerve, knobbed coat, two eyes and a tiny mouth */}
        <g transform={`translate(${V[0]} ${V[1]}) rotate(-8)`}>
          {Array.from({length: 18}).map((_, i) => { const a = (i / 18) * Math.PI * 2; const r = 1; const px = Math.cos(a) * 66 * r; const py = Math.sin(a) * 86 * r - 6; return <g key={i}><path d={`M${px * 0.86} ${py * 0.86} L${px * 1.12} ${py * 1.12}`} stroke={INK.line} strokeWidth={4} /><circle cx={px * 1.16} cy={py * 1.16} r={7} fill="#7f9a62" stroke={INK.line} strokeWidth={3} /></g>; })}
          <path d={bullet(1)} fill="#9db57a" stroke={INK.line} strokeWidth={INK.w} strokeLinejoin="round" />
          <path d={bullet(0.78)} fill="none" stroke="#7f9a62" strokeWidth={10} opacity={0.6} />
          <InkEyes x={0} y={-30} r={20} look={[0.1, -0.6]} />
          <path d="M-12 18 Q2 26 16 16" fill="none" stroke={INK.line} strokeWidth={INK.wIn} strokeLinecap="round" />
        </g>

        {/* labels, like an anatomy chart */}
        <Label x={190} y={180} text="MUSCLE" />
        <Label x={330} y={760} text="NERVE" rot={-4} />
        <path d="M400 760 L560 760" stroke={INK.line} strokeWidth={4} />
        <Label x={880} y={1330} text="FAT" />
        <Label x={175} y={1455} text="SKIN" size={30} />
        <g transform="translate(830 140)">
          <Label x={0} y={0} text="TO THE BRAIN" size={36} />
          <path d="M-190 -50 L-190 -130 M-214 -104 L-190 -132 L-166 -104" fill="none" stroke={INK.line} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" transform="translate(-10 40)" />
        </g>
        {/* a sample caption word, as in a video */}
        <text x={290} y={1700} textAnchor="middle" fontFamily={theme.font} fontWeight={900} fontSize={84} fill="#ffffff" stroke={INK.line} strokeWidth={12} paintOrder="stroke" letterSpacing={2}>SCRATCH</text>
      </svg>
    </AbsoluteFill>
  );
};
