// MedPeak Toons people, drawn in code in the same 200x200 box as the organs. Half-body by default
// (they stand behind a desk or the frame edge); `full` adds trousers and shoes.
import React from 'react';
import {Arm, Face, INK, LINE} from './rig';
import {GroundShadow, Legs, Shaded, Shine, shade} from './paint';
import type {CharProps} from './characters';

type HumanProps = CharProps & {full?: boolean};
const Body: React.FC<{squash?: number; children: React.ReactNode}> = ({squash = 0, children}) => (
  <g transform={`translate(0 ${squash * 8}) scale(${1 + squash * 0.08} ${1 - squash * 0.08})`}>{children}</g>
);
const S = {stroke: INK, strokeWidth: LINE, strokeLinejoin: 'round' as const};

const Head: React.FC<{p: HumanProps; skin: string; y?: number; size?: number; children?: React.ReactNode; hairBack?: React.ReactNode; hairFront?: React.ReactNode}> = ({p, skin, y = -60, size = 1, children, hairBack, hairFront}) => (
  <g transform={`translate(0 ${y}) scale(${size})`}>
    {hairBack}
    <ellipse cx={-40} cy={4} rx={7} ry={10} fill={skin} {...S} />
    <ellipse cx={40} cy={4} rx={7} ry={10} fill={skin} {...S} />
    <Shaded d="M-38 0 C-38 -30 -20 -44 0 -44 C20 -44 38 -30 38 0 C38 30 22 44 0 44 C-22 44 -38 30 -38 0 Z" color={skin} shadow={0.14} />
    {hairFront}
    <g transform="translate(0 4)"><Face emotion={p.emotion} talk={p.talk} blink={p.blink} look={p.look} skin={skin} size={0.78} /></g>
    {children}
  </g>
);

const Torso: React.FC<{color: string; children?: React.ReactNode}> = ({color, children}) => (
  <Shaded d="M-46 30 C-46 4 -22 -8 0 -8 C22 -8 46 4 46 30 L50 100 H-50 Z" color={color}>{children}</Shaded>
);

const legsFor = (p: HumanProps, trousers: string) => p.full && <Legs y={96} gap={18} len={30} color={trousers} shoe="#1d2b4f" step={p.step} />;

/** Dr. Mira, MedPeak's own doctor: white coat over teal scrubs, curly hair, round glasses. */
export const Doctor: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    {p.full && <GroundShadow y={136} w={60} />}
    {legsFor(p, '#2ec4b6')}
    <Torso color="#ffffff">
      <path d="M-16 -8 L0 34 L16 -8 Z" fill="#2ec4b6" />
      <path d="M-40 100 L-30 20 M40 100 L30 20" stroke={shade('#ffffff', 0.15)} strokeWidth={4} />
      <rect x={18} y={44} width={20} height={14} rx={3} fill="#e8f7ff" stroke={INK} strokeWidth={2} />
      <path d="M22 44 v-6 M30 44 v-8" stroke="#ff6f7d" strokeWidth={3} strokeLinecap="round" />
    </Torso>
    <path d="M-16 -8 L0 34 L16 -8" fill="none" {...S} />
    <path d="M-24 2 C-34 40 -12 56 0 44" fill="none" stroke="#33475b" strokeWidth={4} strokeLinecap="round" />
    <circle cx={0} cy={46} r={7} fill="#c8d6e5" {...S} />
    {p.arms && <><Arm x={-44} y={24} angle={p.arms[0]} len={46} color="#ffffff" /><Arm x={44} y={24} angle={p.arms[1]} len={46} color="#ffffff" /></>}
    <rect x={-10} y={-24} width={20} height={20} fill={shade('#c98b62', 0.1)} {...S} />
    <Head p={p} skin="#c98b62"
      hairBack={<>{[[-42, -10], [-46, 12], [42, -10], [46, 12], [-36, 30], [36, 30]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={15} fill="#2b1d1a" {...S} />)}</>}
      hairFront={<>
        <path d="M-42 2 C-50 -62 50 -62 42 2 C34 -20 16 -28 0 -26 C-16 -28 -34 -20 -42 2 Z" fill="#2b1d1a" {...S} />
        {[-32, -16, 0, 16, 32].map((x, i) => <circle key={i} cx={x} cy={-38 - (i === 2 ? 6 : Math.abs(x) < 20 ? 3 : -5)} r={14} fill="#2b1d1a" />)}
        <Shine x={-22} y={-40} w={8} h={3} />
      </>}>
      <g transform="translate(0 4) scale(0.78)" fill="none" stroke={INK} strokeWidth={3.4}>
        <circle cx={-15} cy={0} r={18} /><circle cx={15} cy={0} r={18} /><path d="M-3 -3 Q0 -6 3 -3" />
      </g>
    </Head>
  </Body>
);

/** Patient: young man in a yellow hoodie. */
export const Patient: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    {p.full && <GroundShadow y={136} w={60} />}
    {legsFor(p, '#3d5a80')}
    <Torso color="#ffc857">
      <path d="M-20 60 H20 V76 H-20 Z" fill={shade('#ffc857', 0.15)} />
    </Torso>
    <path d="M-18 -6 C-12 12 12 12 18 -6" fill="none" {...S} />
    <path d="M-8 6 v18 M8 6 v18" stroke={INK} strokeWidth={2.4} strokeLinecap="round" />
    {p.arms && <><Arm x={-42} y={24} angle={p.arms[0]} len={46} color="#ffc857" /><Arm x={42} y={24} angle={p.arms[1]} len={46} color="#ffc857" /></>}
    <rect x={-10} y={-24} width={20} height={20} fill={shade('#f1c19a', 0.1)} {...S} />
    <Head p={p} skin="#f1c19a" hairFront={<>
      <path d="M-40 -2 C-48 -66 46 -70 40 -4 C34 -26 6 -34 -16 -28 C-28 -24 -36 -16 -40 -2 Z" fill="#3b2c25" {...S} />
      <path d="M-16 -30 C-6 -42 10 -44 24 -38" fill="none" stroke="#5a463b" strokeWidth={4} strokeLinecap="round" />
    </>} />
  </Body>
);

/** Mum: long wavy hair, coral top. */
export const Mom: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    {p.full && <GroundShadow y={136} w={60} />}
    {legsFor(p, '#5b6bbf')}
    <Torso color="#ff8a7a">
      <circle cx={0} cy={20} r={5} fill="#fff" opacity={0.7} />
    </Torso>
    {p.arms && <><Arm x={-42} y={24} angle={p.arms[0]} len={46} color="#ff8a7a" /><Arm x={42} y={24} angle={p.arms[1]} len={46} color="#ff8a7a" /></>}
    <rect x={-10} y={-24} width={20} height={20} fill={shade('#e7a982', 0.1)} {...S} />
    <Head p={p} skin="#e7a982"
      hairBack={<path d="M-46 -10 C-60 30 -50 70 -30 76 C-20 50 20 50 30 76 C50 70 60 30 46 -10 Z" fill="#5a2f22" {...S} />}
      hairFront={<>
        <path d="M-42 4 C-50 -64 50 -64 42 4 C40 -20 20 -30 4 -26 C-10 -12 -30 -10 -42 4 Z" fill="#5a2f22" {...S} />
        <Shine x={-24} y={-36} w={9} h={3} />
      </>}>
      <circle cx={-41} cy={14} r={4} fill="#ffd36e" stroke={INK} strokeWidth={1.6} />
    </Head>
  </Body>
);

/** Kid: big head, cap, green tee. */
export const Kid: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    {p.full && <GroundShadow y={132} w={50} />}
    {p.full && <Legs y={96} gap={14} len={24} color="#f1c19a" shoe="#ff6f7d" step={p.step} />}
    <g transform="translate(0 20) scale(0.82)">
      <Torso color="#43c08a"><path d="M-30 40 H30" stroke="#fff" strokeWidth={8} opacity={0.6} /></Torso>
    </g>
    {p.arms && <><Arm x={-34} y={38} angle={p.arms[0]} len={36} color="#43c08a" /><Arm x={34} y={38} angle={p.arms[1]} len={36} color="#43c08a" /></>}
    <Head p={p} skin="#f1c19a" y={-30} size={1.12} hairFront={<>
      <path d="M-40 -6 C-40 -60 40 -60 40 -6 Z" fill="#2ec4b6" {...S} />
      <path d="M20 -10 C40 -14 62 -10 66 -2 C50 0 34 -2 20 -2 Z" fill="#1fa596" {...S} />
      <circle cx={0} cy={-46} r={5} fill="#ffc857" {...S} />
    </>} />
  </Body>
);

/** Grandpa: white hair and moustache, cardigan. */
export const Grandpa: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    {p.full && <GroundShadow y={136} w={60} />}
    {legsFor(p, '#7b6a5a')}
    <Torso color="#8d7bd1">
      {[10, 34, 58].map((y) => <circle key={y} cx={0} cy={y} r={4} fill="#ffe08a" stroke={INK} strokeWidth={1.5} />)}
      <path d="M0 -8 V100" stroke={INK} strokeWidth={2} />
    </Torso>
    {p.arms && <><Arm x={-42} y={24} angle={p.arms[0]} len={46} color="#8d7bd1" /><Arm x={42} y={24} angle={p.arms[1]} len={46} color="#8d7bd1" /></>}
    <rect x={-10} y={-24} width={20} height={20} fill={shade('#eab38c', 0.1)} {...S} />
    <Head p={p} skin="#eab38c"
      hairBack={<>{[[-40, -4], [40, -4]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={12} ry={16} fill="#f2f2f2" {...S} />)}</>}>
      <path d="M-18 22 C-8 14 8 14 18 22 C10 30 -10 30 -18 22 Z" fill="#f2f2f2" {...S} />
      <path d="M-30 -30 C-20 -40 20 -40 30 -30" fill="none" stroke="#e9d3c0" strokeWidth={4} strokeLinecap="round" />
    </Head>
  </Body>
);

/** Baby in the womb: big head, curled body, a cord. */
export const Baby: React.FC<HumanProps> = (p) => (
  <Body squash={p.squash}>
    <path d="M10 40 C40 60 60 30 90 40" fill="none" stroke={INK} strokeWidth={12} strokeLinecap="round" />
    <path d="M10 40 C40 60 60 30 90 40" fill="none" stroke="#ff9fb4" strokeWidth={7} strokeLinecap="round" />
    <Shaded d="M-40 20 C-54 50 -30 84 6 82 C40 80 52 50 36 26 C24 8 -26 0 -40 20 Z" color="#ffd9c2" shadow={0.12} />
    <ellipse cx={-26} cy={70} rx={16} ry={10} fill="#ffd9c2" {...S} />
    {p.arms && <><Arm x={-20} y={34} angle={p.arms[0]} len={24} color="#ffd9c2" /><Arm x={20} y={34} angle={p.arms[1]} len={24} color="#ffd9c2" /></>}
    <Head p={p} skin="#ffd9c2" y={-20} size={1.15}>
      <path d="M-4 -40 C0 -52 12 -50 8 -40" fill="none" stroke="#c98b62" strokeWidth={3} strokeLinecap="round" />
    </Head>
  </Body>
);

export const PEOPLE = {doctor: Doctor, patient: Patient, mom: Mom, kid: Kid, grandpa: Grandpa, baby: Baby};
export type PersonName = keyof typeof PEOPLE;
