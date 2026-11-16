// MedPeak Toons face rig: our own cartoon look (navy outlines, round "jelly" eyes with a teal
// glint, soft cheeks). Every character puts a <Face> on its body. Drawn in a local box where the
// face centre is (0,0) and the eyes sit about 20 units apart; `size` scales it.
import React from 'react';
import {taperedPath, tone} from './ink';

export type Emotion = 'neutral' | 'happy' | 'angry' | 'scared' | 'smug' | 'sick' | 'sleepy' | 'shocked' | 'sad';
export const EMOTIONS: Emotion[] = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'];

export const INK = '#1d2b4f'; // our outline colour (navy, not black)
export const LINE = 2.8;

export type FaceProps = {
  emotion?: Emotion;
  talk?: number; // 0 = mouth closed, 1 = wide open (driven by the voice)
  blink?: number; // 0 = open, 1 = closed
  look?: {x: number; y: number}; // pupils, -1..1
  size?: number; // 1 = default (eyes ~26 units tall)
  skin?: string; // eyelid colour = body colour
};

type Pose = {lid: number; lidL?: number; brow: [number, number]; browY: number; pupil: number; mouth: string; cheeks?: string; extra?: 'sweat' | 'tear' | 'zz' | 'steam'};

// brow: tilt in degrees for [left, right] (positive = inner end down = angry)
const POSES: Record<Emotion, Pose> = {
  neutral: {lid: 0.05, brow: [0, 0], browY: 0, pupil: 1, mouth: 'smile'},
  happy: {lid: 0, brow: [-8, -8], browY: -4, pupil: 1, mouth: 'grin', cheeks: '#ff9aa8'},
  angry: {lid: 0.3, brow: [26, 26], browY: 3, pupil: 0.8, mouth: 'growl'},
  scared: {lid: 0, brow: [-22, -22], browY: -6, pupil: 0.55, mouth: 'wobble', extra: 'sweat'},
  smug: {lid: 0.45, lidL: 0.3, brow: [-14, 10], browY: -2, pupil: 1, mouth: 'smirk'},
  sick: {lid: 0.5, brow: [-12, -12], browY: 0, pupil: 0.9, mouth: 'wobble', cheeks: '#9ccf6e'},
  sleepy: {lid: 0.75, brow: [-4, -4], browY: 2, pupil: 1, mouth: 'o', extra: 'zz'},
  shocked: {lid: 0, brow: [-6, -6], browY: -10, pupil: 0.45, mouth: 'O'},
  sad: {lid: 0.2, brow: [-24, -24], browY: -2, pupil: 1.05, mouth: 'frown', extra: 'tear'},
};

const egg = (rx: number, ry: number) => `M0 ${-ry} C${rx * 0.95} ${-ry} ${rx} ${ry * 0.15} ${rx * 0.8} ${ry * 0.6} C${rx * 0.55} ${ry} ${-rx * 0.55} ${ry} ${-rx * 0.8} ${ry * 0.6} C${-rx} ${ry * 0.15} ${-rx * 0.95} ${-ry} 0 ${-ry} Z`;

const Eye: React.FC<{x: number; lid: number; pupil: number; look: {x: number; y: number}; skin: string; k?: number}> = ({x, lid, pupil, look, skin, k = 1}) => {
  const rx = 12.5 * k;
  const ry = 16 * k;
  const id = `eye${x}${Math.round(k * 100)}`;
  const d = egg(rx, ry);
  const lidY = -ry - 2 + (ry * 2 + 4) * Math.min(1, lid);
  if (lid > 0.88) {
    // closed: a happy curved lash line on the skin, like a hand-drawn blink
    return (
      <g transform={`translate(${x} 0)`}>
        <path d={taperedPath([[-rx, 1], [-rx * 0.4, 5.5], [rx * 0.4, 5.5], [rx, 1]], 5, 0.25, 0.25)} fill={INK} />
        <path d={taperedPath([[rx * 0.75, 2.5], [rx + 4, -1]], 2.6, 0.3, 0.3)} fill={INK} />
      </g>
    );
  }
  return (
    <g transform={`translate(${x} 0)`}>
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <path d={d} fill="#fff" />
      <g clipPath={`url(#${id})`}>
        {/* soft shadow under the upper lid makes the eye a ball, not a sticker */}
        <path d={`M${-rx} ${-ry} H${rx} V${-ry * 0.35} C${rx * 0.4} ${-ry * 0.1} ${-rx * 0.4} ${-ry * 0.1} ${-rx} ${-ry * 0.35} Z`} fill="#dfe6f2" />
        <circle cx={look.x * 4.8} cy={look.y * 5.5 + 2} r={6.4 * pupil} fill={INK} />
        <circle cx={look.x * 4.8 + 2.4} cy={look.y * 5.5 - 1.4} r={2.4 * pupil} fill="#fff" />
        <circle cx={look.x * 4.8 - 2} cy={look.y * 5.5 + 4} r={1.1 * pupil} fill="#fff" opacity={0.8} />
        <rect x={-rx - 2} y={-ry - 2} width={rx * 2 + 4} height={(ry * 2 + 4) * Math.min(1, lid)} fill={skin} />
        <rect x={-rx - 2} y={-ry - 2} width={rx * 2 + 4} height={(ry * 2 + 4) * Math.min(1, lid)} fill={tone(skin, 0.12)} opacity={0.5} />
        {lid > 0.02 && <path d={taperedPath([[-rx, lidY], [0, lidY + 1.5], [rx, lidY]], 4.2, 0.2, 0.2)} fill={INK} />}
      </g>
      <path d={d} fill="none" stroke={INK} strokeWidth={LINE * 0.9} />
      <path d={taperedPath([[-rx * 0.6, ry * 0.95 + 3], [0, ry + 4.5], [rx * 0.6, ry * 0.95 + 3]], 2.4)} fill={tone(skin, 0.3)} opacity={0.7} />
    </g>
  );
};

const Mouth: React.FC<{shape: string; talk: number}> = ({shape, talk}) => {
  const open = Math.max(0, Math.min(1, talk));
  if (open > 0.05) {
    // talking: an open mouth whose height follows the voice; keeps the emotion's corners
    const h = 4 + open * 13;
    const corner = shape === 'frown' || shape === 'wobble' || shape === 'growl' ? 3 : shape === 'grin' ? -3 : 0;
    return (
      <g>
        <defs><clipPath id={`m${Math.round(h * 10)}${corner}`}><path d={`M-12 ${corner} Q0 ${-2 + corner * 0.3} 12 ${corner} Q0 ${h * 2} -12 ${corner} Z`} /></clipPath></defs>
        <path d={`M-12 ${corner} Q0 ${-2 + corner * 0.3} 12 ${corner} Q0 ${h * 2} -12 ${corner} Z`} fill="#5e1a2c" />
        <g clipPath={`url(#m${Math.round(h * 10)}${corner})`}>
          <rect x={-12} y={-4 + corner * 0.4} width={24} height={4.5} fill="#fff" />
          <ellipse cx={0} cy={h * 1.35} rx={8} ry={h * 0.55} fill="#ff7b93" />
        </g>
        <path d={`M-12 ${corner} Q0 ${-2 + corner * 0.3} 12 ${corner} Q0 ${h * 2} -12 ${corner} Z`} fill="none" stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
      </g>
    );
  }
  switch (shape) {
    case 'grin': return <path d="M-14 -2 Q0 18 14 -2 Z" fill="#7a2337" stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />;
    case 'growl': return <g><rect x={-11} y={-4} width={22} height={9} rx={3} fill="#fff" stroke={INK} strokeWidth={LINE} /><line x1={-11} x2={11} y1={0.5} y2={0.5} stroke={INK} strokeWidth={1.6} /></g>;
    case 'wobble': return <path d="M-12 2 q4 -5 8 0 q4 5 8 0 q4 -5 8 0" fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
    case 'smirk': return <path d="M-10 2 Q2 4 12 -5" fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
    case 'o': return <ellipse cx={0} cy={2} rx={3.5} ry={4} fill="#7a2337" stroke={INK} strokeWidth={LINE * 0.8} />;
    case 'O': return <ellipse cx={0} cy={4} rx={8} ry={10} fill="#7a2337" stroke={INK} strokeWidth={LINE} />;
    case 'frown': return <path d="M-10 5 Q0 -4 10 5" fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
    default: return <path d="M-9 -1 Q0 6 9 -1" fill="none" stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
  }
};

export const Face: React.FC<FaceProps> = ({emotion = 'neutral', talk = 0, blink = 0, look = {x: 0, y: 0}, size = 1, skin = '#f6a5a5'}) => {
  const p = POSES[emotion];
  const lidR = Math.max(p.lid, blink);
  const lidL = Math.max(p.lidL ?? p.lid, blink);
  const gap = 15;
  return (
    <g transform={`scale(${size})`}>
      {p.cheeks && <><ellipse cx={-26} cy={14} rx={7} ry={4} fill={p.cheeks} opacity={0.7} /><ellipse cx={26} cy={14} rx={7} ry={4} fill={p.cheeks} opacity={0.7} /></>}
      <Eye x={-gap} lid={lidL} pupil={p.pupil} look={look} skin={skin} k={1} />
      <Eye x={gap} lid={lidR} pupil={p.pupil} look={look} skin={skin} k={1.05} />
      {/* brows: brush strokes, thicker at the inner end */}
      {[[-1, p.brow[0]], [1, -p.brow[1]]].map(([side, rot]) => (
        <g key={side} transform={`translate(${side * gap} ${-25 + p.browY}) rotate(${rot})`}>
          <path d={taperedPath(side < 0 ? [[-10, 2], [-2, -1.5], [9, 0]] : [[-9, 0], [2, -1.5], [10, 2]], 6.5, side < 0 ? 0.5 : 0.15, side < 0 ? 0.15 : 0.5)} fill={INK} />
        </g>
      ))}
      <g transform="translate(0 25)"><Mouth shape={p.mouth} talk={talk} /></g>
      {p.extra === 'sweat' && <path d="M34 -18 q6 9 0 13 q-6 -4 0 -13 Z" fill="#8fd8ff" stroke={INK} strokeWidth={2} />}
      {p.extra === 'tear' && <path d="M-18 16 q5 8 0 12 q-5 -4 0 -12 Z" fill="#8fd8ff" stroke={INK} strokeWidth={2} />}
      {p.extra === 'zz' && <text x={30} y={-26} fontSize={16} fontWeight={900} fill={INK}>z<tspan fontSize={12} dy={-8}>z</tspan></text>}
    </g>
  );
};

/** Arm from a shoulder (`angle` in degrees, 0 = right, 90 = down): a tapered, shaded limb with a 4-finger glove hand. */
export const Arm: React.FC<{x: number; y: number; angle: number; len?: number; bend?: number; color?: string}> = ({x, y, angle, len = 34, bend = 10, color = '#fff'}) => {
  const r = (angle * Math.PI) / 180;
  const ex = x + Math.cos(r) * len;
  const ey = y + Math.sin(r) * len;
  const mx = (x + ex) / 2 - Math.sin(r) * bend;
  const my = (y + ey) / 2 + Math.cos(r) * bend;
  const limb = taperedPath([[x, y], [mx, my], [ex, ey]], 12, 0.01, 0.01);
  return (
    <g>
      <path d={limb} fill={INK} transform="translate(0 0)" stroke={INK} strokeWidth={LINE * 1.6} strokeLinejoin="round" />
      <path d={limb} fill={color} />
      <g transform={`translate(${ex} ${ey}) rotate(${angle}) scale(1.4)`}>
        {[-6, -1.5, 3].map((fy, i) => <rect key={i} x={6} y={fy - 2.4} width={9 - i} height={4.8} rx={2.4} fill="#fff" stroke={INK} strokeWidth={LINE * 0.75} />)}
        <path d="M-2 -3 C-6 -10 2 -13 5 -7" fill="#fff" stroke={INK} strokeWidth={LINE * 0.75} />
        <path d="M-6 0 C-6 -8 9 -9 10 -1 C11 6 -4 9 -6 0 Z" fill="#fff" stroke={INK} strokeWidth={LINE * 0.85} />
        <path d="M-6 0 C-6 -8 9 -9 10 -1 C11 6 -4 9 -6 0 Z" fill="none" stroke="#dfe6f2" strokeWidth={2} transform="translate(0.8 1.2) scale(0.8)" />
      </g>
    </g>
  );
};

/** Natural blinking: closed for ~4 frames every 2.5-4.5 s, offset per character `seed`. */
export const blinkAt = (frame: number, fps: number, seed = 0) => {
  const period = Math.round(fps * (2.5 + ((seed * 7919) % 20) / 10));
  const t = (frame + seed * 37) % period;
  return t < 2 ? t / 2 : t < 4 ? 1 : t < 6 ? (6 - t) / 2 : 0;
};
