// MedPeak Toons cast (body parts, cells, germs, pills). Each one is drawn in code in a 200x200 box
// centred on (0,0), cel-shaded with light from the top-left, and takes the same props so the
// director can pose any of them the same way. People live in humans.tsx.
import React from 'react';
import {Arm, Face, INK, LINE, type Emotion} from './rig';
import {GroundShadow, Legs, Shaded, Shine, shade} from './paint';

export type CharProps = {
  emotion?: Emotion;
  talk?: number;
  blink?: number;
  look?: {x: number; y: number};
  arms?: [number, number]; // left / right arm angles in degrees (0 = right, 90 = down); omit for none
  squash?: number; // >0 squashed (landing), <0 stretched (jump)
  step?: number; // -1..1 leg swing for walking
  t?: number; // seconds, for idle details (cilia, tails, spikes)
  noLegs?: boolean;
};

const Body: React.FC<{squash?: number; children: React.ReactNode}> = ({squash = 0, children}) => (
  <g transform={`translate(0 ${squash * 10}) scale(${1 + squash * 0.12} ${1 - squash * 0.12})`}>{children}</g>
);
const face = (p: CharProps, skin: string, size = 1) => <Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} skin={skin} size={size} />;
const arms = (p: CharProps, l: [number, number], r: [number, number], color: string, len = 34) =>
  p.arms && <><Arm x={l[0]} y={l[1]} angle={p.arms[0]} color={color} len={len} /><Arm x={r[0]} y={r[1]} angle={p.arms[1]} color={color} len={len} /></>;
const legs = (p: CharProps, y: number, color: string, gap = 22) => !p.noLegs && <Legs y={y} gap={gap} color={color} step={p.step} />;

// ---------------------------------------------------------------- pills and digestion

export const Pill: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={70} w={60} />
    {legs(p, 30, '#ffffff', 26)}
    {arms(p, [-50, 6], [50, 6], '#ffffff')}
    <Shaded d="M-28 -34 H28 A34 34 0 0 1 28 34 H-28 A34 34 0 0 1 -28 -34 Z" color="#ffffff" shadow={0.1}>
      <path d="M2 -40 H70 V40 H2 Z" fill="#2ec4b6" />
      <path d="M2 -40 H70 V40 H2 Z" fill={shade('#2ec4b6', 0.2)} transform="translate(8 10)" />
    </Shaded>
    <line x1={2} x2={2} y1={-34} y2={34} stroke={INK} strokeWidth={LINE} />
    <Shine x={-40} y={-20} w={10} h={5} />
    <g transform="translate(-16 -2)">{face(p, '#ffffff', 0.85)}</g>
  </Body>
);

export const Stomach: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={96} />
    {legs(p, 70, '#ff9ea6')}
    {arms(p, [-62, 10], [74, 0], '#ff9ea6')}
    <path d="M-38 -96 C-36 -80 -30 -74 -28 -70" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
    <path d="M-38 -96 C-36 -80 -30 -74 -28 -70" fill="none" stroke="#f08a93" strokeWidth={15} strokeLinecap="round" />
    <Shaded d="M-30 -80 C-28 -58 -10 -55 10 -58 C55 -64 85 -30 78 10 C70 60 25 84 -20 80 C-62 76 -80 40 -66 5 C-58 -15 -40 -30 -44 -60 C-46 -75 -40 -82 -30 -80 Z" color="#ff9ea6">
      {['M-50 30 C-20 50 30 46 58 24', 'M-40 52 C-10 66 24 62 44 48', 'M30 -40 C50 -36 66 -20 68 0'].map((d, i) => <path key={i} d={d} fill="none" stroke={shade('#ff9ea6', 0.22)} strokeWidth={5} strokeLinecap="round" />)}
    </Shaded>
    <Shine x={-20} y={-40} />
    <g transform="translate(10 -8)">{face(p, '#ff9ea6')}</g>
  </Body>
);

export const Intestine: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={96} w={74} />
    {legs(p, 74, '#f7a7a0', 28)}
    {arms(p, [-74, 0], [74, 0], '#f7a7a0')}
    <Shaded d="M-76 -10 C-80 -60 -30 -84 0 -80 C40 -86 82 -56 78 -6 C82 40 46 82 0 80 C-46 82 -76 40 -76 -10 Z" color="#f7a7a0">
      {['M-60 -40 C-30 -60 30 -60 60 -40', 'M-66 -6 C-40 -26 -10 -10 10 -24 C30 -38 50 -20 66 -10', 'M-62 30 C-40 14 -20 34 0 24 C20 12 44 30 62 22', 'M-46 60 C-20 48 20 54 44 60'].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={shade('#f7a7a0', 0.25)} strokeWidth={7} strokeLinecap="round" />
      ))}
    </Shaded>
    <Shine x={-40} y={-50} />
    <g transform="translate(0 2)">{face(p, '#f7a7a0')}</g>
  </Body>
);

export const Liver: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={78} w={80} />
    {legs(p, 50, '#c8584c', 30)}
    {arms(p, [-80, -10], [70, 6], '#c8584c')}
    <Shaded d="M-92 -10 C-96 -50 -40 -66 20 -62 C70 -60 96 -44 94 -20 C92 10 50 26 10 40 C-30 54 -70 60 -84 40 C-92 28 -90 10 -92 -10 Z" color="#c8584c">
      <path d="M10 -62 C4 -30 -4 0 -20 46" fill="none" stroke={shade('#c8584c', 0.3)} strokeWidth={5} />
    </Shaded>
    <Shine x={-50} y={-38} />
    <g transform="translate(-24 -8)">{face(p, '#c8584c')}</g>
  </Body>
);

export const Kidney: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={96} w={56} />
    {legs(p, 72, '#b8475a', 20)}
    {arms(p, [-52, 0], [40, -40], '#b8475a')}
    <path d="M30 4 C50 20 40 70 54 96" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d="M30 4 C50 20 40 70 54 96" fill="none" stroke="#f3d2b4" strokeWidth={7} strokeLinecap="round" />
    <Shaded d="M-10 -84 C40 -90 66 -50 52 -26 C42 -10 26 -6 28 10 C30 26 46 40 40 60 C30 90 -30 90 -54 56 C-74 26 -70 -70 -10 -84 Z" color="#b8475a">
      <path d="M30 -20 C10 -6 10 20 30 30" fill="none" stroke={shade('#b8475a', 0.3)} strokeWidth={6} />
    </Shaded>
    <Shine x={-30} y={-56} />
    <g transform="translate(-14 -8)">{face(p, '#b8475a', 0.95)}</g>
  </Body>
);

export const Bladder: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={98} w={58} />
    {arms(p, [-62, 6], [62, 6], '#ffd36e')}
    <path d="M0 70 V96" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d="M0 70 V96" stroke="#ffcf6a" strokeWidth={10} strokeLinecap="round" />
    <Shaded d="M0 -82 C52 -82 76 -36 70 10 C64 50 30 78 0 78 C-30 78 -64 50 -70 10 C-76 -36 -52 -82 0 -82 Z" color="#ffd36e">
      <path d={`M-80 ${18 - (p.t ? Math.sin(p.t * 3) * 4 : 0)} Q0 ${8 + (p.t ? Math.sin(p.t * 3) * 6 : 0)} 80 18 V90 H-80 Z`} fill="#ffc140" opacity={0.6} />
    </Shaded>
    <Shine x={-34} y={-46} />
    <g transform="translate(0 -14)">{face(p, '#ffd36e')}</g>
  </Body>
);

export const Poop: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={88} w={76} />
    {arms(p, [-60, 42], [60, 42], '#9b6a43')}
    <Shaded d="M-72 58 C-72 40 -40 30 0 30 C40 30 72 40 72 58 C72 76 40 86 0 86 C-40 86 -72 76 -72 58 Z" color="#8a5a36" />
    <Shaded d="M-56 22 C-56 6 -30 -4 0 -4 C30 -4 56 6 56 22 C56 40 30 48 0 48 C-30 48 -56 40 -56 22 Z" color="#9b6a43" />
    <Shaded d="M-40 -10 C-40 -24 -20 -32 0 -32 C20 -32 40 -24 40 -10 C40 4 20 12 0 12 C-20 12 -40 4 -40 -10 Z" color="#a87547" />
    <Shaded d="M-8 -28 Q4 -62 28 -68 Q14 -50 18 -28 Z" color="#a87547" />
    <Shine x={-30} y={-18} w={9} h={4} />
    <g transform="translate(0 32)">{face(p, '#9b6a43', 0.92)}</g>
  </Body>
);

// ---------------------------------------------------------------- organs

export const Tooth: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={96} w={56} />
    {arms(p, [-54, 0], [54, 0], '#ffffff')}
    <Shaded d="M-52 -60 C-30 -78 -8 -66 0 -62 C8 -66 30 -78 52 -60 C70 -40 60 10 52 40 C46 70 40 90 26 90 C12 90 12 54 0 54 C-12 54 -12 90 -26 90 C-40 90 -46 70 -52 40 C-60 10 -70 -40 -52 -60 Z" color="#fdfbf4" shadow={0.12} />
    <Shine x={-34} y={-50} w={12} h={6} />
    <g transform="translate(0 -6)">{face(p, '#fdfbf4')}</g>
  </Body>
);

export const Lung: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={98} w={56} />
    {legs(p, 76, '#ff9fb4', 18)}
    {arms(p, [-40, 10], [36, 10], '#ff9fb4')}
    <path d="M30 -100 V-60" stroke={INK} strokeWidth={20} strokeLinecap="round" />
    <path d="M30 -100 V-60" stroke="#c8d6e5" strokeWidth={13} strokeLinecap="round" />
    {[-90, -80, -70].map((y) => <line key={y} x1={22} x2={38} y1={y} y2={y} stroke="#9fb3c8" strokeWidth={3} />)}
    <Shaded d="M30 -60 C18 -76 -26 -72 -38 -30 C-50 10 -46 70 -16 86 C14 100 34 86 38 60 C42 20 40 -40 30 -60 Z" color="#ff9fb4">
      <path d="M30 -56 C20 -30 0 -10 -16 0 M8 -24 C0 -4 6 20 -2 40 M-16 0 C-26 10 -30 30 -24 50" fill="none" stroke={shade('#ff9fb4', 0.25)} strokeWidth={4} strokeLinecap="round" />
    </Shaded>
    <Shine x={-22} y={-34} />
    <g transform="translate(2 8)">{face(p, '#ff9fb4', 0.9)}</g>
  </Body>
);

export const Brain: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={96} w={70} />
    {legs(p, 56, '#ffc2d1', 24)}
    {arms(p, [-74, 20], [74, 20], '#ffc2d1')}
    <Shaded d="M-78 10 C-96 -20 -70 -60 -40 -62 C-30 -86 10 -88 22 -66 C50 -82 90 -60 82 -26 C100 -6 90 36 60 44 C50 66 10 70 -6 56 C-30 72 -70 58 -66 36 C-82 32 -86 22 -78 10 Z" color="#ffc2d1">
      {['M-50 -30 C-40 -44 -24 -40 -22 -26', 'M10 -60 C4 -46 18 -36 30 -42', 'M44 -20 C58 -26 66 -8 58 4', 'M-60 20 C-50 10 -38 18 -36 30', 'M30 40 C40 26 56 30 56 40', 'M0 -76 C-6 -40 6 -10 -2 30', 'M-70 -6 C-60 -14 -50 -6 -46 4'].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={shade('#ffc2d1', 0.28)} strokeWidth={5} strokeLinecap="round" />
      ))}
    </Shaded>
    <Shine x={-46} y={-48} />
    <g transform="translate(0 6)">{face(p, '#ffc2d1')}</g>
  </Body>
);

export const Heart: React.FC<CharProps> = (p) => {
  const beat = p.t ? 1 + Math.max(0, Math.sin(p.t * Math.PI * 2.2)) ** 8 * 0.05 : 1;
  return (
    <Body squash={p.squash}>
      <GroundShadow y={98} w={60} />
      {legs(p, 70, '#ff6f7d', 20)}
      {arms(p, [-72, -4], [72, -4], '#ff6f7d')}
      <g transform={`scale(${beat})`}>
        <path d="M-14 -50 C-16 -80 4 -96 30 -92 C50 -88 56 -70 52 -54" fill="none" stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d="M-14 -50 C-16 -80 4 -96 30 -92 C50 -88 56 -70 52 -54" fill="none" stroke="#e8505f" strokeWidth={15} strokeLinecap="round" />
        <path d="M18 -48 V-84" stroke={INK} strokeWidth={18} strokeLinecap="round" />
        <path d="M18 -48 V-84" stroke="#5b8de0" strokeWidth={11} strokeLinecap="round" />
        <Shaded d="M0 86 C-60 50 -92 10 -84 -28 C-76 -66 -30 -74 0 -40 C30 -74 76 -66 84 -28 C92 10 60 50 0 86 Z" color="#ff6f7d">
          <path d="M-10 -36 C-20 0 -10 40 0 80" fill="none" stroke={shade('#ff6f7d', 0.25)} strokeWidth={5} />
        </Shaded>
        <Shine x={-56} y={-38} />
      </g>
      <g transform="translate(0 0)">{face(p, '#ff6f7d')}</g>
    </Body>
  );
};

// ---------------------------------------------------------------- cells and germs

export const RedCell: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={70} w={70} />
    {legs(p, 44, '#e2493f', 24)}
    {arms(p, [-78, 0], [78, 0], '#e2493f')}
    <Shaded d="M-86 0 C-86 -46 -46 -60 0 -60 C46 -60 86 -46 86 0 C86 46 46 60 0 60 C-46 60 -86 46 -86 0 Z" color="#e2493f">
      <ellipse cx={0} cy={2} rx={52} ry={30} fill={shade('#e2493f', 0.18)} />
    </Shaded>
    <Shine x={-56} y={-32} />
    <g transform="translate(0 0)">{face(p, '#e2493f')}</g>
  </Body>
);

export const WhiteCell: React.FC<CharProps> = (p) => {
  const t = p.t ?? 0;
  const wob = (i: number) => Math.sin(t * 2.4 + i) * 3;
  return (
    <Body squash={p.squash}>
      <GroundShadow y={96} w={70} />
      {legs(p, 70, '#eef0ff', 26)}
      {arms(p, [-76, 10], [76, 10], '#eef0ff', 38)}
      <Shaded d={`M-80 ${-6 + wob(1)} C-84 -56 -40 ${-84 + wob(2)} 0 -80 C44 ${-86 + wob(3)} 86 -50 80 ${-4 + wob(4)} C${86 + wob(5)} 46 44 82 0 80 C-44 ${84 + wob(6)} -80 46 -80 -6 Z`} color="#eef0ff" shadow={0.14}>
        <path d="M-40 34 C-20 20 10 50 30 30 C46 16 30 -4 14 4 C-6 14 -30 10 -40 34 Z" fill="#b8a9f5" opacity={0.8} />
        {[[-46, -40], [50, -30], [56, 40], [-20, 58], [36, 60]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill="#c9bdf7" />)}
      </Shaded>
      {/* helmet: our white cells are the body's security team */}
      <path d="M-46 -66 C-40 -100 40 -100 46 -66 Z" fill="#2ec4b6" stroke={INK} strokeWidth={LINE} />
      <rect x={-52} y={-70} width={104} height={10} rx={5} fill="#1fa596" stroke={INK} strokeWidth={LINE} />
      <Shine x={-50} y={-44} />
      <g transform="translate(0 -14)">{face(p, '#eef0ff')}</g>
    </Body>
  );
};

export const Virus: React.FC<CharProps> = (p) => {
  const t = p.t ?? 0;
  return (
    <Body squash={p.squash}>
      <GroundShadow y={96} w={58} />
      {Array.from({length: 12}).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 + t * 0.4;
        const r1 = 62;
        const r2 = 84 + Math.sin(t * 4 + i) * 3;
        return (
          <g key={i}>
            <line x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke={INK} strokeWidth={LINE * 2.2} strokeLinecap="round" />
            <line x1={Math.cos(a) * r1} y1={Math.sin(a) * r1} x2={Math.cos(a) * r2} y2={Math.sin(a) * r2} stroke="#c56bff" strokeWidth={LINE * 0.9} strokeLinecap="round" />
            <circle cx={Math.cos(a) * r2} cy={Math.sin(a) * r2} r={9} fill="#ff5fa2" stroke={INK} strokeWidth={LINE} />
          </g>
        );
      })}
      {arms(p, [-54, 26], [54, 26], '#9d5cf0')}
      <Shaded d="M-66 0 C-66 -40 -36 -66 0 -66 C36 -66 66 -40 66 0 C66 40 36 66 0 66 C-36 66 -66 40 -66 0 Z" color="#9d5cf0">
        {[[-30, -30, 8], [36, -24, 6], [30, 36, 7], [-36, 34, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={shade('#9d5cf0', 0.2)} />)}
      </Shaded>
      <Shine x={-34} y={-36} />
      <g>{face(p, '#9d5cf0', 0.95)}</g>
    </Body>
  );
};

export const Bacteria: React.FC<CharProps> = (p) => {
  const t = p.t ?? 0;
  return (
    <Body squash={p.squash}>
      <GroundShadow y={72} w={70} />
      {Array.from({length: 16}).map((_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const w = Math.sin(t * 8 + i) * 4;
        return <line key={i} x1={Math.cos(a) * 66} y1={Math.sin(a) * 44} x2={Math.cos(a) * (80 + w)} y2={Math.sin(a) * (58 + w)} stroke={INK} strokeWidth={LINE} strokeLinecap="round" />;
      })}
      <path d={`M72 0 C92 ${10 + Math.sin(t * 6) * 12} 102 ${-10 - Math.sin(t * 6) * 12} 124 0`} fill="none" stroke={INK} strokeWidth={LINE * 1.4} strokeLinecap="round" />
      {arms(p, [-44, 26], [44, 26], '#8fd66a')}
      <Shaded d="M-24 -48 H24 A48 48 0 0 1 24 48 H-24 A48 48 0 0 1 -24 -48 Z" color="#8fd66a">
        {[[-44, -22, 7], [38, 24, 6], [46, -26, 4], [-10, 34, 5]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={shade('#8fd66a', 0.2)} />)}
      </Shaded>
      <Shine x={-46} y={-26} w={10} h={5} />
      <g>{face(p, '#8fd66a')}</g>
    </Body>
  );
};

export const Platelet: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={70} w={50} />
    {legs(p, 40, '#ffb44d', 18)}
    {arms(p, [-52, 6], [52, 6], '#ffb44d', 28)}
    <Shaded d="M-58 0 C-62 -30 -30 -46 0 -40 C26 -50 62 -34 58 -4 C64 26 34 46 4 40 C-26 50 -56 30 -58 0 Z" color="#ffb44d">
      {[[-26, -18], [20, 16], [26, -20]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={5} fill={shade('#ffb44d', 0.25)} />)}
    </Shaded>
    <Shine x={-34} y={-22} w={9} h={4} />
    <g>{face(p, '#ffb44d', 0.85)}</g>
  </Body>
);

export const Egg: React.FC<CharProps> = (p) => (
  <Body squash={p.squash}>
    <GroundShadow y={98} w={70} />
    {Array.from({length: 16}).map((_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return <circle key={i} cx={Math.cos(a) * 82} cy={Math.sin(a) * 82} r={11} fill="#ffe3a8" stroke={INK} strokeWidth={LINE * 0.8} />;
    })}
    {arms(p, [-66, 14], [66, 14], '#ffd9c2')}
    <Shaded d="M-72 0 C-72 -44 -40 -72 0 -72 C40 -72 72 -44 72 0 C72 44 40 72 0 72 C-40 72 -72 44 -72 0 Z" color="#ffd9c2" shadow={0.14}>
      <circle cx={18} cy={30} r={16} fill="#ffc29a" opacity={0.8} />
    </Shaded>
    <Shine x={-40} y={-40} />
    {/* a little bow: the egg cell is our "lady in waiting" */}
    <path d="M-12 -70 L-30 -84 L-30 -58 Z M12 -70 L30 -84 L30 -58 Z" fill="#ff7bac" stroke={INK} strokeWidth={LINE} strokeLinejoin="round" />
    <circle cx={0} cy={-70} r={7} fill="#ff7bac" stroke={INK} strokeWidth={LINE} />
    <g transform="translate(0 -4)">{face(p, '#ffd9c2')}</g>
  </Body>
);

export const Sperm: React.FC<CharProps> = (p) => {
  const t = p.t ?? 0;
  const tail = Array.from({length: 9}).map((_, i) => `${i === 0 ? 'M' : 'L'}${30 + i * 9} ${Math.sin(t * 10 - i * 0.9) * (3 + i * 1.2)}`).join(' ');
  return (
    <Body squash={p.squash}>
     <g transform="scale(1.6) translate(-14 0)">
      <path d={tail} fill="none" stroke={INK} strokeWidth={LINE * 2.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d={tail} fill="none" stroke="#f4f7ff" strokeWidth={LINE} strokeLinecap="round" strokeLinejoin="round" />
      <Shaded d="M-50 0 C-50 -26 -26 -38 0 -36 C22 -34 36 -16 36 0 C36 16 22 34 0 36 C-26 38 -50 26 -50 0 Z" color="#f4f7ff" shadow={0.12} />
      <path d="M-20 -36 C-14 -50 14 -50 20 -34" fill="#2ec4b6" stroke={INK} strokeWidth={LINE} />
      <Shine x={-30} y={-18} w={8} h={4} />
      <g transform="translate(-8 0)">{face(p, '#f4f7ff', 0.72)}</g>
     </g>
    </Body>
  );
};

export const CAST = {
  pill: Pill, stomach: Stomach, intestine: Intestine, liver: Liver, kidney: Kidney, bladder: Bladder, poop: Poop,
  tooth: Tooth, lung: Lung, brain: Brain, heart: Heart,
  redcell: RedCell, whitecell: WhiteCell, platelet: Platelet, virus: Virus, bacteria: Bacteria, egg: Egg, sperm: Sperm,
};
export type CastName = keyof typeof CAST;
export type {Emotion};
