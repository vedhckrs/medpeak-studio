/**
 * MedPeak Toons - PEOPLE LOOK SHEET (proposal, not approved yet; owner, 2026-11-18: "human character hand and
 * arm design not proper", then "Yes, doctor first").
 *
 * What changes against the people in humans.tsx, after a look at the reference Shorts and at a stock
 * character sheet the owner sent (style only: Dr. Mira stays our own design):
 *   - about 4.2 heads tall (was 3.6): a natural body under a still-large head;
 *   - arms of normal thickness that taper, a sleeve that is part of the coat, a soft elbow;
 *   - small mitten hands: a rounded palm, a thumb, two or three finger lines (was a big hand, every finger outlined);
 *   - hands that DO things: hold a clipboard, rest on a knee;
 *   - she can sit, and stand in three-quarter view;
 *   - a thin even outline (was the bold ink line).
 * This file only draws the sheet. Nothing in the videos uses it until the owner says yes.
 */
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {theme} from '../brand/theme';

const LINE = '#2b1a17';
const LW = 3.2; // the thin, even outline
const SKIN = '#f8d3b8';
const SKIN_D = '#eab99a';
const HAIR = '#4a2f22';
const COAT = '#ffffff';
const COAT_D = '#e6eaf2';
const SCRUB = '#22b8a8';
const SCRUB_D = '#178f83';
const SHOE = '#f1f3f9';
type V = [number, number];
const rad = (d: number) => (d * Math.PI) / 180;
const at = (p: V, deg: number, len: number): V => [p[0] + Math.cos(rad(deg)) * len, p[1] + Math.sin(rad(deg)) * len];
const f = (n: number) => n.toFixed(1);

/**
 * A limb: joints `pts` with a half-width at each. Drawn in two passes (every outline, then every fill), so
 * the parts join into ONE shape with one thin outline: no ring at the elbow or the knee. It tapers.
 */
const Limb: React.FC<{pts: V[]; w: number[]; fill: string}> = ({pts, w, fill}) => {
  const quad = (a: V, b: V, w0: number, w1: number) => {
    const ang = Math.atan2(b[1] - a[1], b[0] - a[0]);
    const nx = -Math.sin(ang);
    const ny = Math.cos(ang);
    return `M${f(a[0] + nx * w0)} ${f(a[1] + ny * w0)} L${f(b[0] + nx * w1)} ${f(b[1] + ny * w1)} L${f(b[0] - nx * w1)} ${f(b[1] - ny * w1)} L${f(a[0] - nx * w0)} ${f(a[1] - ny * w0)} Z`;
  };
  const segs = pts.slice(0, -1).map((p, i) => quad(p, pts[i + 1], w[i], w[i + 1]));
  return (
    <g>
      {segs.map((d, i) => <path key={`o${i}`} d={d} fill={LINE} stroke={LINE} strokeWidth={LW * 2} strokeLinejoin="round" />)}
      {pts.map((p, i) => <circle key={`oc${i}`} cx={p[0]} cy={p[1]} r={w[i] + LW} fill={LINE} />)}
      {segs.map((d, i) => <path key={`f${i}`} d={d} fill={fill} />)}
      {pts.map((p, i) => <circle key={`fc${i}`} cx={p[0]} cy={p[1]} r={w[i]} fill={fill} />)}
    </g>
  );
};
export type HandPose = 'relaxed' | 'open' | 'point' | 'thumb' | 'fist' | 'flat' | 'round' | 'knee';
/** A small mitten hand. Wrist at (0,0), fingers toward +x, thumb on the -y side. About 30 units long. */
export const LookHand: React.FC<{pose?: HandPose; flip?: boolean}> = ({pose = 'relaxed', flip = false}) => {
  const st = {fill: SKIN, stroke: LINE, strokeWidth: LW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const};
  const ln = {fill: 'none', stroke: LINE, strokeWidth: LW * 0.75, strokeLinecap: 'round' as const, vectorEffect: 'non-scaling-stroke' as const};
  const thumbSide = <path d="M6 -8 Q12 -19 20 -16 Q22 -11 14 -8 Z" {...st} />;
  const thumbUp = <path d="M5 -9 Q3 -27 10 -29 Q17 -27 14 -9 Z" {...st} />;
  const body = (() => {
    switch (pose) {
      case 'open': // the fingers a little apart: four soft lobes
        return (<>{thumbSide}<path d="M0 -9 Q10 -12 18 -10 L32 -12 Q36 -9 32 -6 L22 -4 L35 -2 Q39 1 35 4 L22 4 L33 8 Q36 12 31 13 L18 10 Q8 13 0 9 Z" {...st} /></>);
      case 'point': // the first finger out, the rest curled
        return (<>{thumbSide}<path d="M0 -9 Q10 -12 18 -10 L38 -9 Q42 -6 38 -3 L22 -2 Q26 2 24 9 Q12 13 0 9 Z" {...st} /><path d="M17 1 Q21 3 20 7" {...ln} /></>);
      case 'thumb': // a fist with the thumb up
        return (<>{thumbUp}<path d="M0 -9 Q12 -12 22 -8 Q27 0 22 9 Q12 13 0 9 Z" {...st} /><path d="M14 -4 Q19 -3 21 -1 M14 1 Q19 2 21 4" {...ln} /></>);
      case 'fist':
        return (<><path d="M0 -9 Q12 -12 22 -8 Q27 0 22 9 Q12 13 0 9 Z" {...st} /><path d="M6 -8 Q14 -5 20 -9" {...ln} /><path d="M14 -3 Q19 -2 21 0 M14 2 Q19 3 21 5" {...ln} /></>);
      case 'flat': // holding something flat (a clipboard): the thumb lies over its edge
        return (<><path d="M0 -8 Q12 -11 26 -8 Q31 0 26 8 Q12 12 0 8 Z" {...st} /><path d="M4 -8 Q12 -16 22 -12 Q20 -7 12 -6 Z" {...st} /></>);
      case 'round': // holding something round (a glass): the fingers wrap
        return (<><path d="M0 -9 Q10 -13 20 -11 Q30 -4 28 6 Q22 13 12 12 Q4 12 0 9 Z" {...st} /><path d="M16 -6 Q22 -5 25 -2 M15 0 Q22 1 25 4 M14 6 Q20 7 23 9" {...ln} /></>);
      case 'knee': // resting flat on a knee, seen from above
        return (<>{thumbSide}<path d="M0 -9 Q12 -12 30 -9 Q35 0 30 9 Q12 13 0 9 Z" {...st} /><path d="M21 -4 L30 -4 M21 1 L31 1 M21 6 L29 6" {...ln} /></>);
      default: // relaxed: one soft mitten with two finger lines
        return (<>{thumbSide}<path d="M0 -9 Q12 -12 28 -9 Q34 0 28 9 Q12 13 0 9 Z" {...st} /><path d="M21 -3 L29 -3 M21 3 L28 3" {...ln} /></>);
    }
  })();
  return <g transform={flip ? 'scale(1 -1)' : undefined}>{body}</g>;
};

type ArmPose = {up: number; fore: number; hand?: HandPose}; // degrees: 90 = straight down, 0 = toward screen right
type Fig = {l?: ArmPose; r?: ArmPose; turn?: number; sit?: boolean; clipboard?: boolean; mouth?: 'smile' | 'talk' | 'flat'; brows?: number; look?: [number, number]};
const REST_L: ArmPose = {up: 97, fore: 88};
const REST_R: ArmPose = {up: 83, fore: 92};

/**
 * Dr. Mira, about 4.2 heads tall. Feet on (0,0), she is 420 units high. `turn` 0 = front, 1 = three-quarter
 * to screen right. `sit` = on a chair, thighs toward the viewer's right.
 */
export const LookDoctor: React.FC<Fig> = ({l = REST_L, r = REST_R, turn = 0, sit = false, clipboard = false, mouth = 'smile', brows = 0, look = [0.25, 0.1]}) => {
  const hipY = sit ? -150 : -178;
  const shY = hipY - 132; // shoulders
  const headY = shY - 62; // centre of the head
  const half = 44 - turn * 8; // half the shoulder width
  const tx = turn * 10; // the face and the chest slide toward the side she turns to
  const st = {stroke: LINE, strokeWidth: LW, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};
  const arm = (side: -1 | 1, p: ArmPose, key: string) => {
    const S: V = [side * (half + 9) + tx * 0.4, shY + 16]; // at the edge of the coat, so the sleeve grows out of the shoulder
    const up = side < 0 ? 180 - p.up : p.up; // mirror the left arm
    const fo = side < 0 ? 180 - p.fore : p.fore;
    const E = at(S, up, 58);
    const W = at(E, fo, 54);
    const ang = (Math.atan2(W[1] - E[1], W[0] - E[0]) * 180) / Math.PI;
    return (
      <g key={key}>
        <Limb pts={[S, E, W]} w={[16.5, 14, 11.5]} fill={COAT} />
        {/* the elbow: one soft fold, not a corner */}
        <path d={`M${f(E[0] - 7)} ${f(E[1] - 2)} Q${f(E[0])} ${f(E[1] + 4)} ${f(E[0] + 7)} ${f(E[1] - 2)}`} fill="none" stroke={COAT_D} strokeWidth={2.4} strokeLinecap="round" />
        <g transform={`translate(${f(W[0])} ${f(W[1])}) rotate(${f(ang)})`}>
          <rect x={-5} y={-12.5} width={9} height={25} rx={3} fill={COAT_D} {...st} />
          <g transform="translate(3 0)"><LookHand pose={p.hand ?? 'relaxed'} flip={side > 0 ? Math.cos(rad(ang)) < -0.2 : Math.cos(rad(ang)) > 0.2} /></g>
        </g>
      </g>
    );
  };
  const legs = sit ? (
    <g>
      {/* the chair */}
      <path d={`M-70 ${hipY + 26} H64 M-66 ${hipY + 26} V0 M60 ${hipY + 26} V0 M-70 ${hipY + 26} V${hipY - 120}`} fill="none" stroke="#5a4a44" strokeWidth={9} strokeLinecap="round" />
      {[-1, 1].map((s) => { const H: V = [s * 18, hipY + 4]; const K: V = [H[0] + 78, hipY + 8 + s * 4]; const A: V = [K[0] + 4, -14]; return (
        <g key={s}><Limb pts={[H, K, A]} w={[20, 17.5, 14]} fill={SCRUB} /><path d={`M${A[0] - 14} -12 Q${A[0] - 16} 0 ${A[0]} 0 H${A[0] + 30} Q${A[0] + 34} -12 ${A[0] + 14} -14 Z`} fill={SHOE} {...st} /></g>
      ); })}
    </g>
  ) : (
    <g>
      {[-1, 1].map((s) => { const H: V = [s * 20 + tx * 0.2, hipY + 6]; const K: V = [s * 21 + tx * 0.2, -92]; const A: V = [s * 21 + tx * 0.2, -16]; return (
        <g key={s}><Limb pts={[H, K, A]} w={[20, 17.5, 15]} fill={SCRUB} /><path d={`M${A[0] - 16} -12 Q${A[0] - 19} 0 ${A[0] - 4} 0 H${A[0] + 22 + turn * 6} Q${A[0] + 27 + turn * 6} -10 ${A[0] + 13} -14 Z`} fill={SHOE} {...st} /></g>
      ); })}
    </g>
  );
  const hem = sit ? hipY + 30 : hipY + 62;
  return (
    <g>
      {!sit && <ellipse cx={0} cy={2} rx={78} ry={10} fill="#2a2440" opacity={0.14} />}
      {legs}
      {/* in three-quarter view the far arm goes behind the body */}
      {turn > 0.5 && arm(-1, l, 'l')}
      {/* the coat: shoulders, a straight fall to the hem, open at the front over the scrubs */}
      <path d={`M${-half - 6} ${shY + 10} Q${-half - 2} ${shY - 8} ${-18 + tx} ${shY - 12} H${18 + tx} Q${half + 2} ${shY - 8} ${half + 6} ${shY + 10} L${half + 12} ${hem} H${-half - 12} Z`} fill={COAT} {...st} />
      <path d={`M${-13 + tx} ${shY - 12} L${tx} ${shY + 44} L${13 + tx} ${shY - 12} Z`} fill={SCRUB} {...st} />
      <path d={`M${tx} ${shY + 44} V${hem}`} fill="none" stroke={LINE} strokeWidth={LW * 0.8} />
      <path d={`M${-13 + tx} ${shY - 12} L${-26 + tx} ${shY + 20} L${tx} ${shY + 44} M${13 + tx} ${shY - 12} L${26 + tx} ${shY + 20} L${tx} ${shY + 44}`} fill="none" stroke={LINE} strokeWidth={LW * 0.8} strokeLinejoin="round" />
      <rect x={18 + tx} y={shY + 44} width={22} height={24} rx={3} fill={COAT} stroke={LINE} strokeWidth={LW * 0.8} />
      <path d={`M${24 + tx} ${shY + 44} v-9 M${31 + tx} ${shY + 44} v-12`} stroke="#e2283c" strokeWidth={3} strokeLinecap="round" />
      {[0, 1, 2].map((i) => <circle key={i} cx={6 + tx} cy={shY + 62 + i * 26} r={2.6} fill={COAT_D} stroke={LINE} strokeWidth={1.2} />)}
      {/* the stethoscope round the neck */}
      <path d={`M${-16 + tx} ${shY - 6} Q${-20 + tx} ${shY + 44} ${-4 + tx} ${shY + 58} M${16 + tx} ${shY - 6} Q${22 + tx} ${shY + 40} ${-4 + tx} ${shY + 58}`} fill="none" stroke="#3b4a6b" strokeWidth={4} strokeLinecap="round" />
      <circle cx={-4 + tx} cy={shY + 62} r={7} fill="#c9d2e6" stroke={LINE} strokeWidth={LW * 0.8} />
      {/* neck and head */}
      <path d={`M${-10 + tx} ${shY - 26} V${shY - 10} H${10 + tx} V${shY - 26} Z`} fill={SKIN_D} {...st} />
      {/* the hair behind the head: one curly mass */}
      <path d={`M${-58 + tx} ${headY + 34} Q${-78 + tx} ${headY - 10} ${-62 + tx} ${headY - 42} Q${-52 + tx} ${headY - 78} ${-10 + tx} ${headY - 74} Q${30 + tx} ${headY - 86} ${54 + tx} ${headY - 52} Q${80 + tx} ${headY - 14} ${60 + tx} ${headY + 34} Q${40 + tx} ${headY + 48} ${36 + tx} ${headY + 20} H${-36 + tx} Q${-40 + tx} ${headY + 48} ${-58 + tx} ${headY + 34} Z`} fill={HAIR} {...st} />
      {turn < 0.5 && <ellipse cx={-43 + tx} cy={headY + 4} rx={7} ry={10} fill={SKIN} {...st} />}
      <ellipse cx={43 + tx - turn * 6} cy={headY + 4} rx={7} ry={10} fill={SKIN} {...st} />
      <path d={`M${-42 + tx} ${headY - 6} Q${-44 + tx} ${headY + 44} ${tx} ${headY + 48} Q${44 + tx} ${headY + 44} ${42 + tx} ${headY - 6} Q${40 + tx} ${headY - 46} ${tx} ${headY - 46} Q${-40 + tx} ${headY - 46} ${-42 + tx} ${headY - 6} Z`} fill={SKIN} {...st} />
      {/* the fringe: curls over the forehead */}
      <path d={`M${-44 + tx} ${headY - 8} Q${-46 + tx} ${headY - 50} ${tx} ${headY - 52} Q${46 + tx} ${headY - 50} ${44 + tx} ${headY - 8} Q${34 + tx} ${headY - 30} ${20 + tx} ${headY - 24} Q${10 + tx} ${headY - 36} ${-4 + tx} ${headY - 24} Q${-18 + tx} ${headY - 36} ${-28 + tx} ${headY - 22} Q${-38 + tx} ${headY - 28} ${-44 + tx} ${headY - 8} Z`} fill={HAIR} {...st} />
      {[[-30, -56], [-6, -62], [20, -58], [-50, -30], [50, -26], [-56, 6], [56, 8]].map(([x, y], i) => <path key={i} d={`M${x - 8 + tx} ${headY + y} q8 -9 16 0`} fill="none" stroke="#7a5238" strokeWidth={2.6} strokeLinecap="round" />)}
      {/* the face: round eyes with a dot, thin brows, a small nose line, a small mouth */}
      {[-1, 1].map((s) => { const ex = s * 17 + tx + turn * 8; const r = 13 - (s < 0 ? turn * 2 : 0); return (
        <g key={s}>
          <circle cx={ex} cy={headY + 2} r={r} fill="#ffffff" stroke={LINE} strokeWidth={LW * 0.8} />
          <circle cx={ex + look[0] * 6} cy={headY + 2 + look[1] * 6} r={4.2} fill={LINE} />
          <circle cx={ex} cy={headY + 2} r={r + 4} fill="none" stroke="#5b607c" strokeWidth={2.4} />
          <path d={`M${ex - 9} ${headY - 19 - brows * s * 3} Q${ex} ${headY - 23} ${ex + 9} ${headY - 19 + brows * s * 3}`} fill="none" stroke={HAIR} strokeWidth={3} strokeLinecap="round" />
        </g>
      ); })}
      <path d={`M${-4 + tx + turn * 8} ${headY + 2} h8`} stroke="#5b607c" strokeWidth={2.4} />
      <path d={`M${2 + tx + turn * 10} ${headY + 14} q5 6 -2 8`} fill="none" stroke={SKIN_D} strokeWidth={3} strokeLinecap="round" />
      {mouth === 'talk'
        ? <path d={`M${-9 + tx + turn * 8} ${headY + 28} Q${tx + turn * 8} ${headY + 25} ${9 + tx + turn * 8} ${headY + 28} Q${tx + turn * 8} ${headY + 42} ${-9 + tx + turn * 8} ${headY + 28} Z`} fill="#5d1a2d" stroke={LINE} strokeWidth={LW * 0.8} strokeLinejoin="round" />
        : mouth === 'flat' ? <path d={`M${-7 + tx + turn * 8} ${headY + 30} h14`} stroke={LINE} strokeWidth={LW} strokeLinecap="round" />
        : <path d={`M${-9 + tx + turn * 8} ${headY + 28} Q${tx + turn * 8} ${headY + 37} ${9 + tx + turn * 8} ${headY + 28}`} fill="none" stroke={LINE} strokeWidth={LW} strokeLinecap="round" />}
      {/* the clipboard she holds against her chest */}
      {clipboard && (<g transform={`translate(${-34 + tx} ${shY + 66}) rotate(-8)`}><rect x={-22} y={-30} width={44} height={58} rx={4} fill="#c9a26b" {...st} /><rect x={-17} y={-22} width={34} height={46} fill="#ffffff" stroke={LINE} strokeWidth={1.4} /><path d="M-11 -12 h22 M-11 -3 h22 M-11 6 h14" stroke="#9aa3c2" strokeWidth={2.4} strokeLinecap="round" /><rect x={-9} y={-35} width={18} height={9} rx={3} fill="#8a8f9f" stroke={LINE} strokeWidth={1.6} /></g>)}
      {/* from the front both arms are in front of the body */}
      {turn <= 0.5 && arm(-1, l, 'l')}
      {/* the near arm goes over the body */}
      {arm(1, r, 'r')}
    </g>
  );
};

const POSES: {label: string; fig: Fig}[] = [
  {label: 'rest', fig: {}},
  {label: 'point', fig: {r: {up: 20, fore: -8, hand: 'point'}, mouth: 'talk'}},
  {label: 'explain', fig: {l: {up: 120, fore: 30, hand: 'open'}, r: {up: 60, fore: -20, hand: 'open'}, mouth: 'talk'}},
  {label: 'thumbs up', fig: {r: {up: 40, fore: -70, hand: 'thumb'}}},
  {label: 'shrug', fig: {l: {up: 100, fore: 20, hand: 'open'}, r: {up: 80, fore: -10, hand: 'open'}, mouth: 'flat', brows: -1}},
  {label: 'think', fig: {r: {up: 70, fore: -100, hand: 'fist'}, l: {up: 96, fore: 60}, mouth: 'flat', look: [0.6, -0.6]}},
];
const HANDS: {label: string; pose: HandPose}[] = [
  {label: 'relaxed', pose: 'relaxed'}, {label: 'open', pose: 'open'}, {label: 'point', pose: 'point'}, {label: 'thumbs up', pose: 'thumb'},
  {label: 'fist', pose: 'fist'}, {label: 'holds flat', pose: 'flat'}, {label: 'holds round', pose: 'round'}, {label: 'on a knee', pose: 'knee'},
];

const T: React.FC<{x: number; y: number; size?: number; weight?: number; color?: string; children: React.ReactNode; anchor?: 'start' | 'middle'}> = ({x, y, size = 24, weight = 800, color = '#2a2440', children, anchor = 'start'}) => (
  <text x={x} y={y} fontFamily={theme.font} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor}>{children}</text>
);

/** The sheet: three big views, six poses, eight hands. 1920 x 1080. */
export const PeopleLook: React.FC = () => (
  <AbsoluteFill style={{background: '#faf6ef'}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">
      <rect x={0} y={0} width={1920} height={12} fill="#2ec4b6" />
      <T x={60} y={78} size={22} color="#2ec4b6">MEDPEAK TOONS · PEOPLE LOOK · PROPOSAL</T>
      <T x={60} y={136} size={56} weight={900}>Dr. Mira</T>
      <T x={60} y={176} size={21} weight={600} color="#6f6880">about 4.2 heads tall · arms that taper · small mitten hands · a thin even outline · she sits, turns and holds things</T>
      {[['front', 250, {}], ['three-quarter', 560, {turn: 1, r: {up: 70, fore: 60}}], ['sitting, with her clipboard', 900, {sit: true, clipboard: true, l: {up: 110, fore: 20, hand: 'flat'}, r: {up: 70, fore: 30, hand: 'knee'}}]].map(([label, x, fig], i) => (
        <g key={i}>
          <rect x={(x as number) - 150} y={210} width={300} height={560} rx={18} fill="#ffffff" stroke="#e6dfd2" strokeWidth={2} />
          <g transform={`translate(${x as number} 730) scale(1.16)`}><LookDoctor {...(fig as Fig)} /></g>
          <T x={x as number} y={806} size={22} anchor="middle">{label as string}</T>
        </g>
      ))}
      <T x={1100} y={236} size={22} color="#2ec4b6">POSES</T>
      {POSES.map((p, i) => { const x = 1200 + (i % 3) * 250; const y = 520 + Math.floor(i / 3) * 290; return (
        <g key={p.label}>
          <g transform={`translate(${x} ${y}) scale(0.56)`}><LookDoctor {...p.fig} /></g>
          <T x={x} y={y + 30} size={19} anchor="middle">{p.label}</T>
        </g>
      ); })}
      <T x={60} y={880} size={22} color="#2ec4b6">HANDS · shared by all six people</T>
      {HANDS.map((h, i) => (
        <g key={h.label}>
          <g transform={`translate(${110 + i * 226} 960) scale(3)`}><LookHand pose={h.pose} /></g>
          <T x={150 + i * 226} y={1050} size={18} anchor="middle" weight={700}>{h.label}</T>
        </g>
      ))}
    </svg>
  </AbsoluteFill>
);
