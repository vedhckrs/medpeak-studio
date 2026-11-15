// MedPeak Toons cast. Every character is drawn in code inside a 200x200 box centred on (0,0)
// and takes the same props, so the director can pose any of them the same way.
import React from 'react';
import {Arm, Face, INK, LINE, type Emotion} from './rig';

export type CharProps = {
  emotion?: Emotion;
  talk?: number;
  blink?: number;
  look?: {x: number; y: number};
  arms?: [number, number]; // left / right arm angles in degrees; omit for no arms
  squash?: number; // 0 = rest, >0 = squashed (bounce on landing), <0 = stretched
};

const Body: React.FC<{squash?: number; children: React.ReactNode}> = ({squash = 0, children}) => (
  <g transform={`scale(${1 + squash * 0.12} ${1 - squash * 0.12}) translate(0 ${squash * 10})`}>{children}</g>
);
const S = {stroke: INK, strokeWidth: LINE, strokeLinejoin: 'round' as const};
const face = (p: CharProps, skin: string, size = 1) => <Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} skin={skin} size={size} />;

export const Pill: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-46} y={8} angle={p.arms[0]} color="#ffffff" /><Arm x={46} y={8} angle={p.arms[1]} color="#ffffff" /></>}
    <rect x={-62} y={-34} width={124} height={68} rx={34} fill="#ffffff" {...S} />
    <path d="M0 -34 H28 A34 34 0 0 1 28 34 H0 Z" fill="#2ec4b6" {...S} />
    <rect x={-48} y={-26} width={30} height={8} rx={4} fill="#ffffff" opacity={0.9} />
    <g transform="translate(-14 -2)">{face(p, '#ffffff', 0.9)}</g>
  </Body>
);

export const Stomach: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-58} y={10} angle={p.arms[0]} color="#ffb3b8" /><Arm x={60} y={0} angle={p.arms[1]} color="#ffb3b8" /></>}
    <path d="M-30 -88 C-28 -60 -10 -55 10 -58 C55 -64 85 -30 78 10 C70 60 25 88 -20 82 C-62 76 -80 40 -66 5 C-58 -15 -40 -30 -44 -60 C-46 -75 -40 -88 -30 -88 Z" fill="#ff9ea6" {...S} />
    <path d="M-34 -88 h18" stroke="#e9707c" strokeWidth={10} strokeLinecap="round" />
    <path d="M-40 40 C-10 58 30 52 52 30" fill="none" stroke="#e9707c" strokeWidth={4} strokeLinecap="round" opacity={0.7} />
    <g transform="translate(8 -8)">{face(p, '#ff9ea6')}</g>
  </Body>
);

export const Poop: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-56} y={40} angle={p.arms[0]} color="#9b6a43" /><Arm x={56} y={40} angle={p.arms[1]} color="#9b6a43" /></>}
    <ellipse cx={0} cy={58} rx={72} ry={28} fill="#8a5a36" {...S} />
    <ellipse cx={0} cy={22} rx={56} ry={26} fill="#9b6a43" {...S} />
    <ellipse cx={0} cy={-10} rx={40} ry={22} fill="#a87547" {...S} />
    <path d="M-6 -30 Q4 -62 26 -66 Q14 -50 18 -30 Z" fill="#a87547" {...S} />
    <ellipse cx={-24} cy={48} rx={12} ry={4} fill="#b88760" opacity={0.6} />
    <g transform="translate(0 30)">{face(p, '#9b6a43', 0.95)}</g>
  </Body>
);

export const Tooth: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-50} y={0} angle={p.arms[0]} color="#ffffff" /><Arm x={50} y={0} angle={p.arms[1]} color="#ffffff" /></>}
    <path d="M-52 -60 C-30 -78 -8 -66 0 -62 C8 -66 30 -78 52 -60 C70 -40 60 10 52 40 C46 70 40 90 26 90 C12 90 12 54 0 54 C-12 54 -12 90 -26 90 C-40 90 -46 70 -52 40 C-60 10 -70 -40 -52 -60 Z" fill="#fdfbf4" {...S} />
    <path d="M-36 -52 C-26 -60 -16 -58 -10 -54" fill="none" stroke="#d9e6f2" strokeWidth={6} strokeLinecap="round" />
    <g transform="translate(0 -8)">{face(p, '#fdfbf4')}</g>
  </Body>
);

export const Lung: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-52} y={10} angle={p.arms[0]} color="#ffb0c0" /><Arm x={52} y={10} angle={p.arms[1]} color="#ffb0c0" /></>}
    <path d="M-6 -96 h12 v40" fill="none" stroke="#c8d6e5" strokeWidth={14} strokeLinecap="round" />
    <path d="M0 -56 C-10 -70 -50 -70 -62 -30 C-74 10 -70 70 -40 86 C-10 100 10 86 12 60 C14 20 10 -40 0 -56 Z" fill="#ff9fb4" {...S} transform="translate(26 0)" />
    <path d="M-30 20 h22 M-34 50 h24" stroke="#ef7f98" strokeWidth={4} strokeLinecap="round" transform="translate(26 0)" />
    <g transform="translate(-4 4)">{face(p, '#ff9fb4', 0.95)}</g>
  </Body>
);

export const Brain: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-70} y={20} angle={p.arms[0]} color="#ffc2d1" /><Arm x={70} y={20} angle={p.arms[1]} color="#ffc2d1" /></>}
    <path d="M-78 10 C-96 -20 -70 -60 -40 -62 C-30 -86 10 -88 22 -66 C50 -82 90 -60 82 -26 C100 -6 90 36 60 44 C50 66 10 70 -6 56 C-30 72 -70 58 -66 36 C-82 32 -86 22 -78 10 Z" fill="#ffc2d1" {...S} />
    {['M-50 -30 C-40 -44 -24 -40 -22 -26', 'M10 -60 C4 -46 18 -36 30 -42', 'M44 -20 C58 -26 66 -8 58 4', 'M-60 20 C-50 10 -38 18 -36 30', 'M30 40 C40 26 56 30 56 40'].map((d, i) => (
      <path key={i} d={d} fill="none" stroke="#e48aa4" strokeWidth={4} strokeLinecap="round" />
    ))}
    <g transform="translate(0 4)">{face(p, '#ffc2d1')}</g>
  </Body>
);

export const Bacteria: React.FC<CharProps & {t?: number}> = (p) => {
  const t = p.t ?? 0;
  return (
    <Body squash={p.squash}>
      {Array.from({length: 14}).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const w = Math.sin(t * 8 + i) * 4;
        return <line key={i} x1={Math.cos(a) * 62} y1={Math.sin(a) * 42} x2={Math.cos(a) * (76 + w)} y2={Math.sin(a) * (54 + w)} stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
      })}
      <path d={`M70 0 C90 ${10 + Math.sin(t * 6) * 10} 100 ${-10 - Math.sin(t * 6) * 10} 118 0`} fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />
      {p.arms && <><Arm x={-40} y={24} angle={p.arms[0]} color="#8fd66a" /><Arm x={40} y={24} angle={p.arms[1]} color="#8fd66a" /></>}
      <rect x={-70} y={-46} width={140} height={92} rx={46} fill="#8fd66a" {...S} />
      {[[-40, -22, 7], [36, 22, 6], [44, -24, 4]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="#6cb84a" />)}
      <g>{face(p, '#8fd66a')}</g>
    </Body>
  );
};

export const Heart: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    {p.arms && <><Arm x={-66} y={0} angle={p.arms[0]} color="#ff6f7d" /><Arm x={66} y={0} angle={p.arms[1]} color="#ff6f7d" /></>}
    <path d="M0 86 C-60 50 -92 10 -84 -28 C-76 -66 -30 -74 0 -40 C30 -74 76 -66 84 -28 C92 10 60 50 0 86 Z" fill="#ff6f7d" {...S} />
    <path d="M-56 -40 C-50 -52 -38 -56 -28 -52" fill="none" stroke="#ffb3bb" strokeWidth={7} strokeLinecap="round" />
    <g transform="translate(0 -2)">{face(p, '#ff6f7d')}</g>
  </Body>
);

/** Our doctor: Dr. Mira, teal scrubs, curly dark hair, round glasses (MedPeak's own character). */
export const Doctor: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <path d="M-46 30 C-46 6 -22 -6 0 -6 C22 -6 46 6 46 30 L52 100 H-52 Z" fill="#2ec4b6" {...S} />
    <path d="M-14 -6 L0 20 L14 -6" fill="#e9fffb" {...S} />
    <path d="M-22 6 C-30 40 -10 52 0 40" fill="none" stroke="#33475b" strokeWidth={4} />
    <circle cx={0} cy={42} r={6} fill="#c8d6e5" stroke={INK} strokeWidth={2.5} />
    {p.arms && <><Arm x={-44} y={26} angle={p.arms[0]} len={44} color="#2ec4b6" /><Arm x={44} y={26} angle={p.arms[1]} len={44} color="#2ec4b6" /></>}
    <rect x={-10} y={-22} width={20} height={20} fill="#c98b62" {...S} />
    {/* curls behind the head (sides) */}
    {[[-44, -50], [-48, -30], [44, -50], [48, -30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#2b1d1a" stroke={INK} strokeWidth={LINE} />)}
    <ellipse cx={0} cy={-60} rx={40} ry={42} fill="#d69a6e" {...S} />
    {/* curly hair cap over the top of the head */}
    <path d="M-44 -58 C-50 -130 50 -130 44 -58 C36 -78 18 -86 0 -84 C-18 -86 -36 -78 -44 -58 Z" fill="#2b1d1a" {...S} />
    {[-34, -18, 0, 18, 34].map((x, i) => <circle key={i} cx={x} cy={-96 - (i === 2 ? 6 : Math.abs(x) < 20 ? 3 : -4)} r={14} fill="#2b1d1a" />)}
    <g transform="translate(0 -58)">{face(p, '#d69a6e', 0.82)}</g>
    <g transform="translate(0 -58) scale(0.82)" fill="none" stroke={INK} strokeWidth={3}>
      <circle cx={-15} cy={0} r={17} /><circle cx={15} cy={0} r={17} /><line x1={-2} x2={2} y1={-2} y2={-2} />
    </g>
  </Body>
);

/** A patient: young man in a yellow hoodie (swap colours for other patients). */
export const Patient: React.FC<CharProps & {shirt?: string; hair?: string; skin?: string}> = ({shirt = '#ffc857', hair = '#3b2c25', skin = '#f1c19a', ...p}) => (
  <Body squash={p.squash}>
    <path d="M-44 30 C-44 6 -20 -6 0 -6 C20 -6 44 6 44 30 L48 100 H-48 Z" fill={shirt} {...S} />
    <path d="M-16 -4 C-10 12 10 12 16 -4" fill="none" stroke={INK} strokeWidth={LINE} />
    {p.arms && <><Arm x={-42} y={26} angle={p.arms[0]} len={44} color={shirt} /><Arm x={42} y={26} angle={p.arms[1]} len={44} color={shirt} /></>}
    <rect x={-10} y={-22} width={20} height={20} fill={skin} {...S} />
    <ellipse cx={0} cy={-60} rx={38} ry={42} fill={skin} {...S} />
    <path d="M-41 -58 C-48 -128 46 -132 41 -58 C34 -80 6 -90 -16 -84 C-28 -80 -36 -72 -41 -58 Z" fill={hair} {...S} />
    <path d="M-16 -84 C-6 -96 10 -98 24 -92" fill="none" stroke="#5a463b" strokeWidth={4} strokeLinecap="round" />
    <g transform="translate(0 -56)">{face(p, skin, 0.8)}</g>
  </Body>
);

export const CAST = {pill: Pill, stomach: Stomach, poop: Poop, tooth: Tooth, lung: Lung, brain: Brain, bacteria: Bacteria, heart: Heart, doctor: Doctor, patient: Patient};
export type CastName = keyof typeof CAST;
