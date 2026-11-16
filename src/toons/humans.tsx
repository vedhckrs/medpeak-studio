// MedPeak Toons people (v5): full-body, built from ONE recipe so every new person matches.
// Proportions: adults are 4 heads tall, kids 3, toddlers 2.5 (short legs via `legs`) (drawn in the same 200-unit box,
// feet on y = 96). A person is a HumanSpec: skin, hair style, top, bottom, shoes, extras.
// To add a person: write a HumanSpec, add it to PEOPLE, render the model sheet.
import React from 'react';
import {blob, circlePath, Contact, lineOf, Mark, Merge, Part, roundRect, Scaled, spline, tone, Tube, useLine} from './ink';
import {Arm, type ArmSpec, armOf, Face, Shoe} from './rig';
import type {CharProps} from './blueprint';

export type HairStyle = 'curly' | 'short' | 'long' | 'cap' | 'balding' | 'baby';
export type TopKind = 'coat' | 'hoodie' | 'tee' | 'blouse' | 'cardigan' | 'onesie';
export type BottomKind = 'trousers' | 'skirt' | 'shorts';
export type HumanSpec = {
  name: string;
  role: string;
  skin: string;
  height?: number; // 1 = adult (4 heads), 0.72 = kid, 0.5 = toddler
  head?: number; // head size multiplier (kids have bigger heads)
  legs?: number; // leg length, 1 = adult; kids 0.8, toddlers 0.45 (short legs, long body)
  hair: {style: HairStyle; color: string};
  top: {kind: TopKind; color: string; under?: string};
  bottom: {kind: BottomKind; color: string};
  shoes: string;
  glasses?: boolean;
  moustache?: string;
  earrings?: string;
  stethoscope?: boolean;
};

const HEAD = spline([[0, -23], [13, -21], [20, -10], [21, 3], [16.5, 15.5], [7.5, 22.5], [0, 23.5], [-7.5, 22.5], [-16.5, 15.5], [-21, 3], [-20, -10], [-13, -21]]);
const TORSO = 'M-21.5 -38 C-21.5 -45 -12 -46.5 0 -46.5 C12 -46.5 21.5 -45 21.5 -38 L18 12 C18 16.5 -18 16.5 -18 12 Z';
const Line: React.FC<{d: string; color: string; k?: number}> = ({d, color, k = 0.62}) => {
  const w = useLine(k);
  return <path d={d} fill="none" stroke={color} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" />;
};

// ------------------------------------------------------------------ hair (head-local: head is 42 x 46, centre 0,0)
const HairBack: React.FC<{style: HairStyle; color: string}> = ({style, color}) => {
  if (style === 'curly') {
    const pts: [number, number, number][] = [[-21, -6, 10], [-24.5, 6, 10], [-20, 17, 9], [21, -6, 10], [24.5, 6, 10], [20, 17, 9], [-15, -18, 10], [15, -18, 10], [-5, -25, 10], [5, -25, 10]];
    return <Merge>{pts.map(([x, y, r], i) => <Part key={i} d={circlePath(x, y, r)} fill={color} depth={3} />)}</Merge>;
  }
  if (style === 'long') return <Part d="M-22 -6 C-27 -32 27 -32 22 -6 C27 12 26 30 21 40 C8 44 -8 44 -21 40 C-26 30 -27 12 -22 -6 Z" fill={color} depth={4} />;
  if (style === 'balding') {
    return (
      <>
        <Part d={blob(6, 9.5, 'tl', 8, 0.1, -20.5, -1)} fill={color} depth={2} />
        <Part d={blob(6, 9.5, 'tr', 8, 0.1, 20.5, -1)} fill={color} depth={2} />
      </>
    );
  }
  return null;
};
const HairFront: React.FC<{style: HairStyle; color: string}> = ({style, color}) => {
  const hi = tone(color, -0.22);
  switch (style) {
    case 'curly':
      return (
        <>
          <Merge>
            <Part d="M-21 -4 C-23 -30 23 -30 21 -4 C16 -13 8 -17 0 -16.5 C-8 -17 -16 -13 -21 -4 Z" fill={color} depth={3} />
            {[[-13, -15], [-4.5, -18], [4.5, -18], [13, -15]].map(([x, y], i) => <Part key={i} d={circlePath(x, y, 6.5)} fill={color} depth={2} />)}
          </Merge>
          <Mark pts={[[-12, -24], [-4, -27], [4, -26]]} w={1.8} color={hi} />
          <Mark pts={[[-23, 2], [-25, 8], [-23, 13]]} w={1.6} color={hi} />
        </>
      );
    case 'short':
      return (
        <>
          <Part d="M-21.5 -2 C-25 -32 24 -34 21.5 -3 C19 -11 12 -16 3 -15 C-7 -14 -17 -11 -21.5 -2 Z" fill={color} depth={3} />
          <Mark pts={[[-10, -24], [0, -27], [12, -24]]} w={1.8} color={hi} />
          <Mark pts={[[-6, -17], [2, -19], [10, -18]]} w={1.4} color={tone(color, 0.2)} />
        </>
      );
    case 'long':
      return (
        <>
          <Part d="M-21.5 0 C-25 -30 -2 -30 0 -22 C2 -30 25 -30 21.5 0 C19 -10 10 -17 0 -18.5 C-10 -17 -19 -10 -21.5 0 Z" fill={color} depth={3} />
          <Mark pts={[[-15, -21], [-8, -25], [-2, -24]]} w={1.8} color={hi} />
        </>
      );
    case 'cap':
      return (
        <>
          <Part d="M-21.5 -5 C-22 2 -21 6 -19 8 C-18 3 -18 -2 -17.5 -5 Z" fill="#3b2c25" depth={1.5} />
          <Part d="M21.5 -5 C22 2 21 6 19 8 C18 3 18 -2 17.5 -5 Z" fill="#3b2c25" depth={1.5} />
          <Part d="M-22 -5 C-24 -32 24 -32 22 -5 Z" fill={color} shine={[-8, -22, 0.6]} depth={3} />
          <Part d="M4 -7 C22 -11 38 -7 40 -1.5 C28 -1 16 -2 4 -1.5 Z" fill={tone(color, 0.2)} depth={1.5} />
          <Part d={circlePath(0, -27.5, 2.2)} fill={tone(color, 0.2)} flat />
        </>
      );
    case 'balding':
      return <Mark pts={[[-8, -22], [0, -24.5], [8, -22]]} w={1.4} color={tone(color, 0.2)} />;
    default:
      return <Mark pts={[[0, -23], [3.6, -29], [-0.8, -31.5], [-3.2, -27.5]]} w={2.2} color={color} />;
  }
};

// ------------------------------------------------------------------ clothes
const Top: React.FC<{s: HumanSpec}> = ({s}) => {
  const c = s.top.color;
  const under = s.top.under ?? c;
  const vneck = (
    <>
      <path d="M-5.5 -47 L0 -37.5 L5.5 -47 Z" fill={s.skin} />
      <Line d="M-5.5 -46.4 L0 -37.5 L5.5 -46.4" color={lineOf(under)} />
    </>
  );
  switch (s.top.kind) {
    case 'coat':
      return (
        <>
          <Part d={TORSO} fill={under}>{vneck}</Part>
          <Part d="M-23 -38 C-23 -45.5 -15 -47.2 -6.5 -47.2 L-2.6 -22 L-3.4 37 C-10 39.5 -19 39 -22.5 36 Z" fill={c} shadow={0.11} depth={4} />
          <Part d="M23 -38 C23 -45.5 15 -47.2 6.5 -47.2 L2.6 -22 L3.4 37 C10 39.5 19 39 22.5 36 Z" fill={c} shadow={0.11} depth={4} />
          <Line d="M-6.5 -47 L-9.5 -33 L-3 -24 M6.5 -47 L9.5 -33 L3 -24" color={lineOf(c)} />
          <Line d="M8 4 H18 V16 Q13 18 8 16 Z" color={lineOf(c)} />
          <path d="M10.5 4 V-1.5 M13.5 4 V-2.5" stroke="#ea4a55" strokeWidth={1.5} strokeLinecap="round" />
          <Part d={roundRect(-18, -8, 9, 6.5, 1.4)} fill="#2ec4b6" flat />
        </>
      );
    case 'hoodie':
      return (
        <>
          <Part d="M-22.5 -38 C-22.5 -45.6 -12 -47 0 -47 C12 -47 22.5 -45.6 22.5 -38 L19.5 13 C19.5 17.5 -19.5 17.5 -19.5 13 Z" fill={c}>
            <rect x={-25} y={9} width={50} height={10} fill={tone(c, 0.1)} />
          </Part>
          <Part d="M-11.5 -4 H11.5 L14.5 8 H-14.5 Z" fill={tone(c, 0.07)} depth={2} />
          <Line d="M-9 -46 Q0 -38 9 -46" color={lineOf(c)} />
          <Line d="M-3.6 -41 V-30 M3.6 -41 V-29" color="#ffffff" k={0.7} />
        </>
      );
    case 'tee':
      return (
        <Part d={TORSO} fill={c}>
          <rect x={-25} y={-22} width={50} height={7} fill="#ffffff" opacity={0.75} />
          <path d="M-6.5 -47 Q0 -40 6.5 -47 Z" fill={s.skin} />
        </Part>
      );
    case 'blouse':
      return (
        <>
          <Part d={TORSO} fill={c}>{vneck}</Part>
          {[-26, -16, -6].map((y) => <circle key={y} cx={0} cy={y} r={1.2} fill={tone(c, -0.5)} />)}
        </>
      );
    case 'cardigan':
      return (
        <>
          <Part d={TORSO} fill={c}>
            <path d="M-7.5 -47 L0 -22 L7.5 -47 Z" fill={under} />
            <Line d="M-7.5 -46.4 L0 -22 L7.5 -46.4" color={lineOf(c)} />
            <rect x={-25} y={9} width={50} height={10} fill={tone(c, 0.1)} />
          </Part>
          <Line d="M0 -22 V14" color={lineOf(c)} />
          {[-14, -4, 6].map((y) => <circle key={y} cx={2.6} cy={y} r={1.4} fill="#ffe08a" stroke={lineOf('#ffe08a')} strokeWidth={0.5} />)}
        </>
      );
    default:
      return (
        <>
          <Part d={TORSO} fill={c} />
          {[-28, -18, -8].map((y) => <circle key={y} cx={0} cy={y} r={1.3} fill="#ffffff" />)}
        </>
      );
  }
};

const Bottom: React.FC<{s: HumanSpec; step: number; drop: number}> = ({s, step, drop}) => {
  const up = `translate(0 ${drop})`;
  const c = s.bottom.color;
  const lc = lineOf(c);
  const foot = (side: number) => {
    const sw = step * side;
    return {x: side * 9.2 + sw * 7, y: 84 - Math.max(0, sw) * 5, sw};
  };
  const legD = (side: number, y0: number, y1?: number) => {
    const f = foot(side);
    const ex = y1 === undefined ? f.x : side * 8.9;
    const ey = y1 ?? f.y;
    return `M${side * 8.6} ${y0} Q${(side * 8.8 + f.sw * 3).toFixed(1)} ${((y0 + ey) / 2).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
  };
  const shoes = [-1, 1].map((side) => {
    const f = foot(side);
    return <g key={side} transform={`translate(${(f.x - side).toFixed(1)} ${(f.y + 8.6).toFixed(1)}) scale(${side * 1.15} 1.15)`}><Shoe color={s.shoes} /></g>;
  });
  const skinLegs = (y0: number) => [-1, 1].map((side) => <Tube key={side} d={legD(side, y0 + drop)} r={4.2} fill={s.skin} />);
  if (s.bottom.kind === 'skirt') {
    return (
      <>
        {skinLegs(44)}
        {shoes}
        <g transform={up}>
          <Part d="M-18 6 L18 6 L24.5 54 C24.5 57.5 -24.5 57.5 -24.5 54 Z" fill={c} depth={5}>
            <Mark pts={[[-8, 14], [-10, 34], [-13, 54]]} w={1.8} color={tone(c, 0.16)} />
            <Mark pts={[[9, 14], [11, 34], [14, 54]]} w={1.8} color={tone(c, 0.16)} />
          </Part>
        </g>
      </>
    );
  }
  if (s.bottom.kind === 'shorts') {
    return (
      <>
        {skinLegs(30)}
        {[-1, 1].map((side) => { const f = foot(side); return <Tube key={side} d={`M${f.x.toFixed(1)} ${(f.y - 9).toFixed(1)} L${f.x.toFixed(1)} ${(f.y - 1).toFixed(1)}`} r={4.7} fill="#ffffff" cap="butt" />; })}
        {shoes}
        <Merge>
          <g transform={up}><Part d={roundRect(-17.5, 4, 35, 16, 6)} fill={c} depth={3} /></g>
          <Tube d={legD(-1, 14 + drop, 38 + drop)} r={8.2} fill={c} cap="butt" />
          <Tube d={legD(1, 14 + drop, 38 + drop)} r={8.2} fill={c} cap="butt" />
        </Merge>
        <g transform={up}><Line d="M-17.1 38 H-0.7 M0.7 38 H17.1" color={lc} k={1} /></g>
      </>
    );
  }
  return (
    <>
      {shoes}
      <Merge>
        <g transform={up}><Part d={roundRect(-17.5, 4, 35, 16, 6)} fill={c} depth={3} /></g>
        <Tube d={legD(-1, 14 + drop)} r={7.4} fill={c} cap="butt" />
        <Tube d={legD(1, 14 + drop)} r={7.4} fill={c} cap="butt" />
      </Merge>
      {[-1, 1].map((side) => { const f = foot(side); return <Line key={side} d={`M${(f.x - 7.4).toFixed(1)} ${f.y.toFixed(1)} H${(f.x + 7.4).toFixed(1)}`} color={lc} k={1} />; })}
    </>
  );
};

// ------------------------------------------------------------------ the person
export type Person = React.FC<CharProps> & {spec: HumanSpec};

export const makeHuman = (s: HumanSpec): Person => {
  const h = s.height ?? 1;
  const hs = s.head ?? 1;
  const long = s.top.kind !== 'tee';
  const drop = (1 - (s.legs ?? 1)) * 70; // short legs: the whole upper body sits lower
  const up = `translate(0 ${drop})`;
  const headT = `translate(0 -53) scale(${hs}) translate(0 53) translate(0 -74)`;
  const C = ((p: CharProps) => {
    const sq = p.squash ?? 0;
    const arms = p.arms === null ? null : p.arms ?? [97, 83];
    const arm = (i: 0 | 1, front: boolean) => {
      if (!arms) return null;
      const sp = armOf(arms[i] as ArmSpec);
      if (!!sp.front !== front) return null;
      return (
        <Arm key={`a${i}`} x={i === 0 ? -20.5 : 20.5} y={-38} spec={{bend: sp.a > 55 && sp.a < 125 ? 3 : 8, ...sp}} color={s.skin} r={3.6} len={50}
          sleeve={{color: s.top.color, r: 5.2, to: long ? 0.86 : 0.36}} handScale={0.82} />
      );
    };
    return (
      <g transform={`translate(0 96) scale(${(p.flip ? -1 : 1) * (1 + sq * 0.08)} ${1 - sq * 0.08}) translate(0 -96)`}>
        <Contact y={96} w={30 * h} />
        <Scaled s={h} transform={`translate(0 96) scale(${h}) translate(0 -96)`}>
          <Bottom s={s} step={p.step ?? 0} drop={drop} />
          <g transform={up}>
          <Scaled s={hs} transform={headT}><HairBack style={s.hair.style} color={s.hair.color} /></Scaled>
          {s.top.kind === 'hoodie' && <Part d="M-15 -42 C-17 -57 17 -57 15 -42 Z" fill={tone(s.top.color, 0.1)} depth={3} />}
          <Part d={roundRect(-4.6, -56, 9.2, 12, 3)} fill={s.skin} depth={2} />
          <Top s={s} />
          {s.stethoscope && (
            <>
              <Tube d="M-9 -45.5 C-13 -24 -10 -9 -2 -7 C6 -9 12 -24 9 -45.5" r={1.3} fill="#3a4460" line={null} flat />
              <Part d={circlePath(-2, -5.5, 3.6)} fill="#c9d3e6" depth={1.4} />
            </>
          )}
          {arm(0, false)}
          {arm(1, false)}
          <Scaled s={hs} transform={headT}>
            <Part d={circlePath(-20.5, 2.5, 4.6)} fill={s.skin} depth={1.5} />
            <Part d={circlePath(20.5, 2.5, 4.6)} fill={s.skin} depth={1.5} />
            {s.earrings && [-1, 1].map((side) => <circle key={side} cx={side * 21} cy={8.2} r={1.9} fill={s.earrings} stroke={lineOf(s.earrings as string)} strokeWidth={0.5} />)}
            <Part d={HEAD} fill={s.skin} depth={4} />
            <g transform="translate(0 2.5)"><Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} size={0.45} skin={s.skin} human /></g>
            {s.moustache && <Part d="M-9.5 14.4 C-5 9.4 -1.5 11.6 0 12.6 C1.5 11.6 5 9.4 9.5 14.4 C5 17 1.5 14.8 0 15.8 C-1.5 14.8 -5 17 -9.5 14.4 Z" fill={s.moustache} depth={1.5} />}
            <HairFront style={s.hair.style} color={s.hair.color} />
            {s.glasses && <Glasses />}
          </Scaled>
          {arm(0, true)}
          {arm(1, true)}
          </g>
        </Scaled>
      </g>
    );
  }) as Person;
  C.displayName = s.name;
  C.spec = s;
  return C;
};

const Glasses: React.FC = () => {
  const w = useLine(0.9);
  return (
    <g fill="none" stroke="#3b3654" strokeWidth={w}>
      <circle cx={-8.8} cy={2.6} r={9.2} fill="#ffffff" fillOpacity={0.14} />
      <circle cx={8.8} cy={2.6} r={9.2} fill="#ffffff" fillOpacity={0.14} />
      <path d="M-18 1 L-20.5 -0.5 M18 1 L20.5 -0.5" strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ the cast of people
export const SPECS: Record<string, HumanSpec> = {
  doctor: {name: 'doctor', role: 'Dr. Mira: explains what happened in plain words. Warm, exact, never scary.', skin: '#c58a63', hair: {style: 'curly', color: '#33221e'}, top: {kind: 'coat', color: '#ffffff', under: '#22b8a8'}, bottom: {kind: 'trousers', color: '#1fa596'}, shoes: '#f1f3f9', glasses: true, stethoscope: true},
  patient: {name: 'patient', role: 'The patient: an ordinary young man with an everyday habit that went wrong.', skin: '#eec39a', hair: {style: 'short', color: '#3b2c25'}, top: {kind: 'hoodie', color: '#ffc857'}, bottom: {kind: 'trousers', color: '#4a6fa5'}, shoes: '#f1f3f9'},
  mom: {name: 'mom', role: 'The worried parent: asks the question the viewer is thinking.', skin: '#e2a67f', hair: {style: 'long', color: '#5a3024'}, top: {kind: 'blouse', color: '#ff8a7a'}, bottom: {kind: 'skirt', color: '#5b6bbf'}, shoes: '#8a4b3a', earrings: '#ffd36e'},
  kid: {name: 'kid', role: 'The kid: curious, eats and does things he should not.', skin: '#eec39a', height: 0.76, head: 1.3, legs: 0.8, hair: {style: 'cap', color: '#22b8a8'}, top: {kind: 'tee', color: '#43c08a'}, bottom: {kind: 'shorts', color: '#3d5a80'}, shoes: '#ff6f7d'},
  grandpa: {name: 'grandpa', role: 'Grandpa: old habits, old remedies, a good heart.', skin: '#e8b28c', height: 0.95, hair: {style: 'balding', color: '#f1f2f6'}, top: {kind: 'cardigan', color: '#8d7bd1', under: '#f4f1e8'}, bottom: {kind: 'trousers', color: '#7b6a5a'}, shoes: '#5a4a3f', moustache: '#f1f2f6'},
  baby: {name: 'baby', role: 'The toddler: cannot explain what hurts, so the body does it for him.', skin: '#ffd9c2', height: 0.62, head: 1.45, legs: 0.45, hair: {style: 'baby', color: '#b9825a'}, top: {kind: 'onesie', color: '#bfe3ff'}, bottom: {kind: 'trousers', color: '#bfe3ff'}, shoes: '#ffffff'},
};
export type PersonName = 'doctor' | 'patient' | 'mom' | 'kid' | 'grandpa' | 'baby';
export const PEOPLE = Object.fromEntries(Object.entries(SPECS).map(([k, sp]) => [k, makeHuman(sp)])) as Record<PersonName, Person>;
