// MedPeak Toons face rig: our own cartoon look (navy outlines, round "jelly" eyes with a teal
// glint, soft cheeks). Every character puts a <Face> on its body. Drawn in a local box where the
// face centre is (0,0) and the eyes sit about 20 units apart; `size` scales it.
import React from 'react';

export type Emotion = 'neutral' | 'happy' | 'angry' | 'scared' | 'smug' | 'sick' | 'sleepy' | 'shocked' | 'sad';
export const EMOTIONS: Emotion[] = ['neutral', 'happy', 'angry', 'scared', 'smug', 'sick', 'sleepy', 'shocked', 'sad'];

export const INK = '#1d2b4f'; // our outline colour (navy, not black)
export const LINE = 3.2;

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

const Eye: React.FC<{x: number; lid: number; pupil: number; look: {x: number; y: number}; skin: string; flip?: boolean}> = ({x, lid, pupil, look, skin}) => {
  const rx = 12;
  const ry = 15;
  const id = `eye${x}`;
  return (
    <g transform={`translate(${x} 0)`}>
      <defs><clipPath id={id}><ellipse cx={0} cy={0} rx={rx} ry={ry} /></clipPath></defs>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="#fff" stroke={INK} strokeWidth={LINE} />
      <g clipPath={`url(#${id})`}>
        <circle cx={look.x * 4.5} cy={look.y * 5 + 2} r={6.5 * pupil} fill={INK} />
        <circle cx={look.x * 4.5 + 2.6} cy={look.y * 5 - 1.5} r={2.3 * pupil} fill="#7fe3d6" />
        {/* eyelid: body-coloured, comes down from the top */}
        <rect x={-rx - 2} y={-ry - 2} width={rx * 2 + 4} height={(ry * 2 + 4) * Math.min(1, lid)} fill={skin} />
        {lid > 0.02 && <line x1={-rx} x2={rx} y1={-ry - 2 + (ry * 2 + 4) * Math.min(1, lid)} y2={-ry - 2 + (ry * 2 + 4) * Math.min(1, lid)} stroke={INK} strokeWidth={LINE} />}
      </g>
      <ellipse cx={0} cy={0} rx={rx} ry={ry} fill="none" stroke={INK} strokeWidth={LINE} />
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
        <path d={`M-12 ${corner} Q0 ${-2 + corner * 0.3} 12 ${corner} Q0 ${h * 2} -12 ${corner} Z`} fill="#7a2337" stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
        <path d={`M-6 ${h * 1.2} Q0 ${h * 0.7} 6 ${h * 1.2}`} fill="#ff7b93" />
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
      <Eye x={-gap} lid={lidL} pupil={p.pupil} look={look} skin={skin} />
      <Eye x={gap} lid={lidR} pupil={p.pupil} look={look} skin={skin} />
      {/* brows */}
      <g stroke={INK} strokeWidth={LINE + 0.6} strokeLinecap="round">
        <line x1={-gap - 9} x2={-gap + 9} y1={-23 + p.browY} y2={-23 + p.browY} transform={`rotate(${p.brow[0]} ${-gap} ${-23 + p.browY})`} />
        <line x1={gap - 9} x2={gap + 9} y1={-23 + p.browY} y2={-23 + p.browY} transform={`rotate(${-p.brow[1]} ${gap} ${-23 + p.browY})`} />
      </g>
      <g transform="translate(0 25)"><Mouth shape={p.mouth} talk={talk} /></g>
      {p.extra === 'sweat' && <path d="M34 -18 q6 9 0 13 q-6 -4 0 -13 Z" fill="#8fd8ff" stroke={INK} strokeWidth={2} />}
      {p.extra === 'tear' && <path d="M-18 16 q5 8 0 12 q-5 -4 0 -12 Z" fill="#8fd8ff" stroke={INK} strokeWidth={2} />}
      {p.extra === 'zz' && <text x={30} y={-26} fontSize={16} fontWeight={900} fill={INK}>z<tspan fontSize={12} dy={-8}>z</tspan></text>}
    </g>
  );
};

/** Noodle arm from a shoulder, `angle` in degrees (0 = straight out to the right), with a round hand. */
export const Arm: React.FC<{x: number; y: number; angle: number; len?: number; bend?: number; color?: string}> = ({x, y, angle, len = 34, bend = 10, color = '#fff'}) => {
  const r = (angle * Math.PI) / 180;
  const ex = x + Math.cos(r) * len;
  const ey = y + Math.sin(r) * len;
  const mx = (x + ex) / 2 - Math.sin(r) * bend;
  const my = (y + ey) / 2 + Math.cos(r) * bend;
  return (
    <g>
      <path d={`M${x} ${y} Q${mx} ${my} ${ex} ${ey}`} fill="none" stroke={INK} strokeWidth={LINE * 2.4} strokeLinecap="round" />
      <path d={`M${x} ${y} Q${mx} ${my} ${ex} ${ey}`} fill="none" stroke={color} strokeWidth={LINE * 1.1} strokeLinecap="round" />
      <circle cx={ex} cy={ey} r={6} fill={color} stroke={INK} strokeWidth={LINE} />
    </g>
  );
};

/** Natural blinking: closed for ~4 frames every 2.5-4.5 s, offset per character `seed`. */
export const blinkAt = (frame: number, fps: number, seed = 0) => {
  const period = Math.round(fps * (2.5 + ((seed * 7919) % 20) / 10));
  const t = (frame + seed * 37) % period;
  return t < 2 ? t / 2 : t < 4 ? 1 : t < 6 ? (6 - t) / 2 : 0;
};
