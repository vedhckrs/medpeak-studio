// MedPeak Toons props: everyday objects a script can show ("props" in a shot of toon.json).
// Drawn with the same paint engine as the cast, in a 200-unit box centred on (0,0).
// To add one: add its name to PROP_NAMES in director.ts and its drawing to PROPS here.
import React from 'react';
import {circlePath, ellipsePath, lineOf, Part, roundRect, shade, spline, Tube, useLine} from './ink';
import type {PropName} from './director';
import {theme} from '../brand/theme';
import {STYLE} from './style';

const Line: React.FC<{d: string; color: string; k?: number; opacity?: number}> = ({d, color, k = 0.7, opacity}) => {
  const w = useLine(k);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} />;
};

const Glass: React.FC<{t: number}> = ({t}) => {
  const s = Math.sin(t * 2) * 1.6;
  return (
    <g>
      <ellipse cx={0} cy={76} rx={46} ry={7} fill="#2a2440" opacity={0.16} />
      <path d="M-46 -72 L-37 68 Q0 80 37 68 L46 -72 Z" fill="#eaf6ff" opacity={0.55} />
      <path d={`M-43.4 ${-34 + s} Q0 ${-28 - s} 43.4 ${-34 - s} L37 68 Q0 80 -37 68 Z`} fill="#5db8ff" opacity={0.85} />
      <path d={`M-43.4 ${-34 + s} Q0 ${-28 - s} 43.4 ${-34 - s} Q0 ${-41 + s} -43.4 ${-34 + s} Z`} fill="#b5e2ff" />
      <path d="M-24 30 Q-28 -4 -30 -26" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.75} />
      <path d="M-36 -62 L-33 -44" fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" opacity={0.8} />
      {[[10, 30, 3], [22, 4, 2.2], [-6, 50, 2.6]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y - ((t * 14 + i * 9) % 30)} r={r} fill="none" stroke="#e6f6ff" strokeWidth={1.2} opacity={0.8} />)}
      <Line d="M-46 -72 L-37 68 Q0 80 37 68 L46 -72" color="#5f8fb8" />
      <path d={ellipsePath(0, -72, 46, 7.5)} fill="#f4fbff" opacity={0.6} />
      <Line d={ellipsePath(0, -72, 46, 7.5)} color="#5f8fb8" />
    </g>
  );
};
const PillBottle: React.FC = () => (
  <g>
    <ellipse cx={0} cy={78} rx={50} ry={7} fill="#2a2440" opacity={0.16} />
    <Part d={roundRect(-40, -40, 80, 116, 12)} fill="#ff9f43" mat="hard" shine={[-22, -24, 0.8]} />
    <Part d={roundRect(-40, -12, 80, 54, 0)} fill="#ffffff" line={lineOf('#ff9f43')} flat />
    <path d={roundRect(-26, -2, 52, 8, 4)} fill="#2ec4b6" />
    <path d={roundRect(-26, 13, 34, 6, 3)} fill="#c8d6e5" />
    <path d={roundRect(-26, 25, 44, 6, 3)} fill="#c8d6e5" />
    <Part d={roundRect(-46, -76, 92, 38, 8)} fill="#ffffff" mat="hard" shadow={0.12} />
    {[-30, -15, 0, 15, 30].map((x) => <path key={x} d={`M${x} -70 V-44`} stroke="#c9d1e6" strokeWidth={1.6} strokeLinecap="round" />)}
  </g>
);
const Soda: React.FC = () => (
  <g>
    <ellipse cx={0} cy={80} rx={44} ry={7} fill="#2a2440" opacity={0.16} />
    <Part d="M-36 -64 Q-36 -74 -28 -76 H28 Q36 -74 36 -64 V66 Q36 76 26 78 H-26 Q-36 76 -36 66 Z" fill="#e8384f" mat="hard" shine={[-18, -44, 0.8]}>
      <path d="M-40 6 Q-10 -22 10 2 T40 -10 V26 Q10 10 -8 28 T-40 34 Z" fill="#ffffff" opacity={0.92} />
      <path d="M-40 -64 H40 V-56 H-40 Z M-40 62 H40 V72 H-40 Z" fill="#c9cfdd" />
    </Part>
    <Part d={ellipsePath(0, -76, 28, 6)} fill="#dfe4ee" mat="hard" depth={1.5} />
    <path d={ellipsePath(4, -76, 9, 2.6)} fill="#8f98ad" />
  </g>
);
const Candy: React.FC = () => (
  <g>
    <Tube d="M0 26 L0 84" r={3.4} fill="#fff6e6" />
    <Part d={circlePath(0, -14, 46)} fill="#ff6fa3" mat="hard" shine={[-22, -38, 0.9]}>
      <path d="M0 -14 C14 -32 40 -18 30 6 C20 30 -24 26 -28 -6 C-32 -40 12 -58 40 -34" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.95} />
      <path d="M0 -14 C14 -32 40 -18 30 6 C20 30 -24 26 -28 -6" fill="none" stroke="#ffd0e0" strokeWidth={3} strokeLinecap="round" opacity={0.9} />
    </Part>
  </g>
);
const Toothbrush: React.FC = () => (
  <g transform="rotate(-32)">
    <Part d={roundRect(-84, -8, 118, 16, 8)} fill="#2ec4b6" mat="hard" shine={[-50, -4, 0.7, 0]} />
    <path d={roundRect(-70, -3, 40, 6, 3)} fill="#ffffff" opacity={0.75} />
    <Part d={roundRect(30, -10, 54, 20, 9)} fill="#25a89c" mat="hard" depth={3} />
    {[36, 44, 52, 60, 68, 76].map((x) => <Part key={x} d={roundRect(x - 3.4, -30, 6.8, 22, 3)} fill="#ffffff" line="#9fb3c8" depth={1.4} />)}
    <Part d={spline([[34, -34], [44, -44], [58, -40], [70, -46], [80, -36], [70, -30], [46, -30]])} fill="#8fe3ff" depth={2} shine={[52, -40, 0.4, 0]}>
      <path d="M36 -34 Q58 -40 80 -34" fill="none" stroke="#ff6f9a" strokeWidth={3} opacity={0.9} />
    </Part>
  </g>
);
const Burger: React.FC = () => (
  <g>
    <ellipse cx={0} cy={66} rx={70} ry={8} fill="#2a2440" opacity={0.16} />
    <Part d={roundRect(-62, 34, 124, 30, 14)} fill="#e9a04e" mat="flesh" tex={0.5} depth={4} />
    <Part d={roundRect(-66, 14, 132, 24, 11)} fill="#7a4428" mat="flesh" depth={3} />
    <path d="M-68 14 L-50 28 L-34 12 L-18 28 L0 12 L18 28 L34 12 L50 28 L68 14 L64 6 H-64 Z" fill="#ffcf3f" stroke={lineOf('#ffcf3f')} strokeWidth={1.2} strokeLinejoin="round" />
    <path d="M-70 4 Q-58 16 -46 4 Q-34 16 -22 4 Q-10 16 2 4 Q14 16 26 4 Q38 16 50 4 Q62 16 70 4 L66 -6 H-66 Z" fill="#6ccf5f" stroke={lineOf('#6ccf5f')} strokeWidth={1.2} strokeLinejoin="round" />
    <Part d="M-64 -4 C-64 -66 64 -66 64 -4 Z" fill="#f0a94e" mat="flesh" tex={0.4} shine={[-28, -42, 0.9]}>
      {[[-30, -30], [-6, -44], [20, -34], [38, -18], [-44, -14], [4, -22]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={4} ry={2.2} transform={`rotate(${i * 37} ${x} ${y})`} fill="#fff3d0" stroke="#d9b36a" strokeWidth={0.6} />)}
    </Part>
  </g>
);
const Gum: React.FC = () => (
  <g>
    <ellipse cx={0} cy={62} rx={66} ry={8} fill="#2a2440" opacity={0.16} />
    <g transform="rotate(-18)">
      <Part d={roundRect(-74, -4, 104, 40, 6)} fill="#dfe4ee" mat="hard" depth={2} />
      <path d="M-74 -4 L-62 6 L-50 -4 L-38 6 L-26 -4 L-14 6 L-2 -4 L10 6 L22 -4 L30 2" fill="none" stroke="#aab3c5" strokeWidth={1.4} />
    </g>
    <Part d={spline([[-34, -50], [6, -62], [44, -40], [58, 0], [40, 40], [-4, 52], [-44, 34], [-56, -8]], true, 0.6)} fill="#ff8fc4" mat="flesh" shine={[-18, -30, 0.9]} depth={5}>
      <path d="M-22 6 q10 10 20 0 M14 22 q9 9 18 0 M4 -16 q9 8 18 0" fill="none" stroke="#c2578e" strokeWidth={2.4} strokeLinecap="round" opacity={0.75} />
    </Part>
  </g>
);
const Pillow: React.FC = () => (
  <g>
    <ellipse cx={0} cy={56} rx={76} ry={8} fill="#2a2440" opacity={0.14} />
    <Part d={spline([[-78, -44], [-40, -34], [0, -38], [40, -34], [78, -44], [70, 0], [78, 46], [40, 38], [0, 42], [-40, 38], [-78, 46], [-70, 0]], true, 0.6)} fill="#ffffff" mat="cloth" shadow={0.13} depth={7}>
      <path d="M-40 -20 Q0 -6 40 -20 M-44 20 Q0 6 44 20" fill="none" stroke={shade('#ffffff', 0.2)} strokeWidth={2} strokeLinecap="round" opacity={0.7} />
      <path d="M-90 -50 H90 V-30 H-90 Z" fill="#bfe3ff" opacity={0.7} />
    </Part>
  </g>
);
const ClockProp: React.FC<{t: number}> = ({t}) => (
  <g>
    <ellipse cx={0} cy={78} rx={52} ry={7} fill="#2a2440" opacity={0.16} />
    <Tube d="M-34 54 L-44 74" r={4} fill="#ea4a55" />
    <Tube d="M34 54 L44 74" r={4} fill="#ea4a55" />
    <Part d={circlePath(-40, -58, 16)} fill="#ffc93c" mat="hard" depth={3} />
    <Part d={circlePath(40, -58, 16)} fill="#ffc93c" mat="hard" depth={3} />
    <Part d={circlePath(0, 0, 62)} fill="#ea4a55" mat="hard" shine={[-34, -38, 0.9]} />
    <Part d={circlePath(0, 0, 50)} fill="#fffdf6" shadow={0.1} depth={-4} />
    {Array.from({length: 12}).map((_, i) => <path key={i} d={`M0 -44 V${i % 3 === 0 ? -34 : -38}`} stroke="#55608c" strokeWidth={i % 3 === 0 ? 3 : 1.8} strokeLinecap="round" transform={`rotate(${i * 30})`} />)}
    <path d="M0 4 V-24" stroke="#2a2440" strokeWidth={5} strokeLinecap="round" transform="rotate(-60)" />
    <path d="M0 5 V-36" stroke="#2a2440" strokeWidth={3.6} strokeLinecap="round" transform={`rotate(${(t * 40) % 360})`} />
    <circle r={4} fill="#ea4a55" />
    <path d="M-8 -72 H8" stroke="#b9892c" strokeWidth={5} strokeLinecap="round" />
  </g>
);

/** A pain flash: a jagged star with a bolt (the consequence, felt). */
const Pain: React.FC<{t: number}> = ({t}) => {
  const k = 1 + Math.sin(t * 10) * 0.06;
  return (
    <g transform={`scale(${k})`}>
      <path d="M0 -78 L18 -34 L62 -52 L40 -8 L82 12 L36 26 L48 72 L6 44 L-24 80 L-26 34 L-74 38 L-42 4 L-72 -34 L-28 -30 Z" fill="#ff5a5f" stroke="#a81f33" strokeWidth={2.4} strokeLinejoin="round" />
      <path d="M0 -52 L12 -22 L42 -34 L26 -4 L54 10 L24 18 L32 48 L4 30 L-16 52 L-18 22 L-48 26 L-28 2 L-46 -22 L-18 -20 Z" fill="#ffd23c" />
      <path d="M6 -30 L-14 4 H2 L-8 34 L18 -4 H2 Z" fill="#a81f33" />
    </g>
  );
};
/** A tiny diagram of the food pipe with a pill lodged in it and a red sore (for the doctor's bubble). */
const PipeDiagram: React.FC<{t: number}> = () => (
  <g transform="scale(1.5)">
    <path d="M-34 -80 C-40 -30 -30 30 -36 80 H36 C30 30 40 -30 34 -80 Z" fill="#f7a5a8" stroke="#8c3848" strokeWidth={2.2} />
    <path d="M-16 -80 C-20 -30 -12 30 -16 80 H16 C12 30 20 -30 16 -80 Z" fill="#fbc9bf" />
    <circle cx={-18} cy={-6} r={15} fill="#e2283c" opacity={0.75} />
    <g transform="translate(0 -8) rotate(-38)">
      <path d="M-9 -22 A9 9 0 0 1 9 -22 V0 H-9 Z" fill="#19b8a6" stroke="#0f6f66" strokeWidth={1.6} />
      <path d="M-9 0 H9 V22 A9 9 0 0 1 -9 22 Z" fill="#fffdf6" stroke="#55608c" strokeWidth={1.6} />
    </g>
  </g>
);
/** A round counting chip ("1", "2", "3") that lights up as a point is counted out loud. */
const Chip: React.FC<{t: number; text?: string}> = ({text = '1'}) => (
  <g>
    <circle cx={5} cy={8} r={72} fill="#1d2b4f" opacity={0.28} />
    <circle r={72} fill="#ffc93c" stroke="#ffffff" strokeWidth={9} />
    <circle r={72} fill="none" stroke="#b9892c" strokeWidth={2.4} />
    <text x={0} y={34} textAnchor="middle" fontSize={98} fontWeight={900} fill="#1d2b4f" fontFamily={theme.font}>{text}</text>
  </g>
);

/** A drop of spit with two mineral sparkles (the body's own repair kit). */
const Drop: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M0 -76 C34 -30 56 0 56 26 C56 58 30 80 0 80 C-30 80 -56 58 -56 26 C-56 0 -34 -30 0 -76 Z" fill="#8fd3ff" stroke="#2f86c9" strokeWidth={2.4} />
    <path d="M-30 20 C-30 44 -14 60 6 62" fill="none" stroke="#ffffff" strokeWidth={9} strokeLinecap="round" opacity={0.85} />
    {[[20, -6, 15], [-14, 40, 10]].map(([x, y, r], i) => { const k = r * (0.8 + 0.2 * Math.sin(t * 5 + i * 2)); return <path key={i} d={`M${x} ${y - k} Q${x + k * 0.16} ${y - k * 0.16} ${x + k} ${y} Q${x + k * 0.16} ${y + k * 0.16} ${x} ${y + k} Q${x - k * 0.16} ${y + k * 0.16} ${x - k} ${y} Q${x - k * 0.16} ${y - k * 0.16} ${x} ${y - k} Z`} fill="#ffffff" />; })}
  </g>
);
/** A tiny diagram of the valve between the food pipe and the stomach, open, with acid coming up through it. */
const ValveDiagram: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M-30 -84 V-6 C-70 -2 -84 30 -78 62 C-70 92 70 92 78 62 C84 30 70 -2 30 -6 V-84 Z" fill="#f7a5a8" stroke="#8c3848" strokeWidth={2.4} />
    <path d="M-16 -84 V2 C-52 8 -64 30 -60 56 C-54 76 54 76 60 56 C64 30 52 8 16 2 V-84 Z" fill="#ffd3cb" />
    <path d="M-58 44 C-54 74 54 74 58 44 Z" fill="#dfe45a" stroke="#9aa22c" strokeWidth={1.6} />
    <path d="M-16 -14 C-4 -12 -3 -2 -16 2 Z M16 -14 C4 -12 3 -2 16 2 Z" fill="#d9566e" stroke="#8c3848" strokeWidth={1.6} />
    <g transform={`translate(0 ${Math.sin(t * 5) * 4})`}>
      <path d="M0 36 V-46" stroke="#b7c02c" strokeWidth={9} strokeLinecap="round" />
      <path d="M-13 -34 L0 -56 L13 -34 Z" fill="#b7c02c" stroke="#7d8518" strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  </g>
);
/** A bed seen from the side with its head end raised on a block (the NHS advice for night-time heartburn). */
const Bed: React.FC<{t: number}> = ({t}) => (
  <g>
    <path d="M-92 62 H92" stroke="#b9ae97" strokeWidth={5} strokeLinecap="round" />
    <rect x={-85} y={45} width={26} height={17} rx={3} fill="#ffc93c" stroke="#b9892c" strokeWidth={2.4} />
    <path d="M-72 16 V45 M66 30 V62" stroke="#5a4028" strokeWidth={7} strokeLinecap="round" />
    <g transform="rotate(-6 66 28)">
      <path d="M-80 -44 V28" stroke="#5a4028" strokeWidth={8} strokeLinecap="round" />
      <rect x={-80} y={8} width={152} height={20} rx={6} fill="#8a6a4a" stroke="#5a4028" strokeWidth={2.4} />
      <rect x={-76} y={-16} width={146} height={26} rx={11} fill="#8fb4ff" stroke="#3f62b0" strokeWidth={2.4} />
      <rect x={-72} y={-32} width={46} height={20} rx={9} fill="#ffffff" stroke="#9fb3c8" strokeWidth={2.4} />
    </g>
    <g transform={`translate(-44 ${(-58 + Math.sin(t * 5) * 4).toFixed(1)})`}>
      <path d="M0 14 V-14" stroke="#2ec4b6" strokeWidth={8} strokeLinecap="round" />
      <path d="M-12 -8 L0 -28 L12 -8 Z" fill="#2ec4b6" stroke="#0f6f66" strokeWidth={1.6} strokeLinejoin="round" />
    </g>
  </g>
);
/** A name tag: a few words on a sticker (labels a thing, a moment, or a rule like "SIT UP"). */
const TagProp: React.FC<{t: number; text?: string}> = ({text = ''}) => {
  const w = Math.max(70, text.length * 19 + 34);
  return (
    <g>
      <rect x={-w / 2 + 3} y={-22} width={w} height={52} rx={26} fill="#1d2b4f" opacity={0.28} />
      <rect x={-w / 2} y={-28} width={w} height={52} rx={26} fill="#ffffff" stroke="#2ec4b6" strokeWidth={5} />
      <text x={0} y={9} textAnchor="middle" fontSize={30} fontWeight={900} fill="#1d2b4f" fontFamily={theme.font} letterSpacing={0.6}>{text.toUpperCase()}</text>
    </g>
  );
};

export const PROPS: Record<PropName, React.FC<{t: number; text?: string}>> = {tag: TagProp, drop: Drop, valve: ValveDiagram, bed: Bed, glass: Glass, pillbottle: PillBottle, soda: Soda, candy: Candy, toothbrush: Toothbrush, burger: Burger, gum: Gum, pillow: Pillow, clock: ClockProp, pain: Pain, pipe: PipeDiagram, chip: Chip};

/**
 * A prop on screen. `halo` = a soft glowing disc behind it; `bubble` = inside a thought bubble
 * (the doctor's picture of what she means); `no` = a red "not this" sign over it.
 */
export const Prop: React.FC<{kind: PropName; t: number; halo?: boolean; bubble?: boolean; no?: boolean; text?: string; flip?: boolean}> = ({kind, t, halo = false, bubble = false, no = false, text, flip = false}) => {
  const P = PROPS[kind];
  return (
    <g>
      {bubble && (
        <g transform={flip ? 'scale(-1 1)' : undefined}>
          <path d="M-96 -6 C-112 -58 -62 -100 -18 -90 C6 -118 70 -112 82 -76 C122 -70 132 -18 104 6 C122 46 82 88 40 76 C22 104 -40 104 -56 76 C-100 84 -124 34 -96 -6 Z" fill="#1d2b4f" opacity={0.22} transform="translate(5 8)" />
          <path d="M-96 -6 C-112 -58 -62 -100 -18 -90 C6 -118 70 -112 82 -76 C122 -70 132 -18 104 6 C122 46 82 88 40 76 C22 104 -40 104 -56 76 C-100 84 -124 34 -96 -6 Z" fill="#ffffff" stroke="#55608c" strokeWidth={2.4} />
          <circle cx={-84} cy={104} r={13} fill="#ffffff" stroke="#55608c" strokeWidth={2.4} />
          <circle cx={-110} cy={132} r={8} fill="#ffffff" stroke="#55608c" strokeWidth={2.4} />
        </g>
      )}
      {halo && (
        <>
          {STYLE.glow > 0 && <circle r={104} fill="#ffffff" opacity={0.3 * STYLE.glow} />}
          <circle r={92} fill="#fffbe6" opacity={0.8} />
          <circle r={92} fill="none" stroke="#ffc93c" strokeWidth={2.4} strokeDasharray="7 7" opacity={0.9} />
        </>
      )}
      <g transform={bubble ? 'scale(0.62)' : undefined}><P t={t} text={text} /></g>
      {no && (
        <g transform={bubble ? 'scale(0.62)' : undefined}>
          <circle r={88} fill="none" stroke="#e2283c" strokeWidth={13} />
          <path d="M-62 -62 L62 62" stroke="#e2283c" strokeWidth={13} strokeLinecap="round" />
        </g>
      )}
    </g>
  );
};
