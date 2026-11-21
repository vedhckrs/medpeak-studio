/**
 * MedPeak Toons, look v8: the room of "What Happens When You Take Creatine" (`creatine`): a gym.
 * No other video has a gym. Kept clean (the owner's tidy rooms, 2026-11-17): a slate wall with one yellow
 * stripe, a rubber floor, a weight rack on the right, and the hero prop, an upright scale with a big dial
 * whose needle can slam over (`needle` 0..1).
 * The lifter is Mom from the people rig in gym clothes (a tee, trousers, trainers), so she reads as the same
 * person at phone size.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FONT, INK, INLINE, OUTLINE, Shape, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {FEET_Y, FLOOR_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, HandAt, type PersonSpec, PersonAt} from './people-rig';
import {Crea} from './crea-cast';

const rr = (x: number, y: number, w: number, h: number, r: number) => `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

export const GYM = {wall: '#45596b', wall2: '#3d5061', stripe: CLOTH.yellow, floor: '#3a3d45', tile: '#33363d', rack: CLOTH.charcoal, steel: tint(CLOTH.grey, 0.3)};

/** Mom for the gym: the same face, hair and skin, in a tee, trousers and trainers. */
const MOM = castById('mom');
export const LIFTER: PersonSpec = {
  ...MOM,
  top: {kind: 'tee', color: CLOTH.teal, sleeve: 'short'},
  bottom: {kind: 'trousers', color: CLOTH.charcoal},
  shoes: {kind: 'trainer', color: '#ffffff'},
  extras: {...MOM.extras, sash: undefined},
};

/** The scale's dial: where it is and how the needle turns (-130 deg at 0 kg, +130 deg at the top of the scale). */
export const SCALE = {x: 640, y: 820, r: 128, platform: [200, 640] as [number, number]};
const needleDeg = (k: number) => -130 + k * 260;

const UprightScale: React.FC<{needle: number}> = ({needle}) => {
  const {x, y, r} = SCALE;
  const [p0, p1] = SCALE.platform;
  const a = (needleDeg(needle) * Math.PI) / 180;
  return (
    <g>
      {/* the column */}
      <Shape d={rr(x - 22, y + r - 10, 44, FEET_Y - (y + r) - 10, 10)} fill={GYM.steel} shadow={0.6} />
      {/* the dial head */}
      <circle cx={x} cy={y} r={r + 22} {...OUTLINE} fill={CLOTH.charcoal} />
      <circle cx={x} cy={y} r={r} fill={CLOTH.offwhite} {...EDGE_IN} />
      {/* the red zone at the top of the scale */}
      <path d={`M ${x + Math.sin((100 * Math.PI) / 180) * (r - 8)} ${y - Math.cos((100 * Math.PI) / 180) * (r - 8)} A ${r - 8} ${r - 8} 0 0 1 ${x + Math.sin((130 * Math.PI) / 180) * (r - 8)} ${y - Math.cos((130 * Math.PI) / 180) * (r - 8)}`} stroke={tint(CLOTH.red, 0.2)} strokeWidth={14} fill="none" />
      {Array.from({length: 27}, (_, i) => {
        const b = ((-130 + i * 10) * Math.PI) / 180;
        const L = i % 5 === 0 ? 22 : 11;
        return <path key={i} d={`M ${x + Math.sin(b) * (r - 6)} ${y - Math.cos(b) * (r - 6)} L ${x + Math.sin(b) * (r - 6 - L)} ${y - Math.cos(b) * (r - 6 - L)}`} stroke={INK} strokeWidth={i % 5 === 0 ? 4 : 2.4} strokeLinecap="round" />;
      })}
      <text x={x} y={y + 62} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK} letterSpacing={1}>KG</text>
      {/* the needle */}
      <path d={`M ${x - Math.sin(a) * 22} ${y + Math.cos(a) * 22} L ${x + Math.sin(a) * (r - 16)} ${y - Math.cos(a) * (r - 16)}`} stroke={INK} strokeWidth={13} strokeLinecap="round" />
      <path d={`M ${x - Math.sin(a) * 22} ${y + Math.cos(a) * 22} L ${x + Math.sin(a) * (r - 16)} ${y - Math.cos(a) * (r - 16)}`} stroke={CLOTH.red} strokeWidth={7} strokeLinecap="round" />
      <circle cx={x} cy={y} r={14} fill={CLOTH.charcoal} {...EDGE_IN} />
      {/* the platform she stands on */}
      <Shape d={rr(p0, FEET_Y - 26, p1 - p0, 46, 12)} fill={GYM.steel} shadow={0.6}>
        <path d={`M ${p0 + 20} ${FEET_Y - 8} H ${p1 - 20}`} {...INLINE} strokeDasharray="10 10" />
      </Shape>
    </g>
  );
};

const Plate: React.FC<{x: number; y: number; r: number; col: string}> = ({x, y, r, col}) => (
  <g>
    <circle cx={x} cy={y} r={r} {...OUTLINE} fill={col} />
    <circle cx={x} cy={y} r={r * 0.62} fill={shade(col, 0.12)} {...EDGE_IN} />
    <circle cx={x} cy={y} r={r * 0.16} fill={GYM.steel} {...EDGE_IN} />
  </g>
);

export const GymRoom: React.FC<{needle?: number}> = ({needle = 0.3}) => (
  <Layer>
    <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={GYM.wall} />
    {Array.from({length: 7}, (_, i) => <rect key={i} x={i * 170 - 20} y={0} width={70} height={FLOOR_Y} fill={GYM.wall2} />)}
    {/* one bold stripe across the wall */}
    <rect x={0} y={1060} width={1080} height={64} fill={GYM.stripe} />
    <path d="M 0 1060 H 1080 M 0 1124 H 1080" {...INLINE} />
    <rect x={0} y={FLOOR_Y - 24} width={1080} height={24} fill={shade(GYM.wall, 0.25)} />
    {/* the rubber floor with tile seams */}
    <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={GYM.floor} />
    {[1480, 1610, 1780].map((y) => <path key={y} d={`M 0 ${y} H 1080`} stroke={GYM.tile} strokeWidth={4} />)}
    {[180, 460, 760].map((x, i) => <path key={x} d={`M ${x + i * 20} ${FLOOR_Y} L ${x - 60 + i * 10} 1920`} stroke={GYM.tile} strokeWidth={4} />)}
    <path d={`M 0 ${FLOOR_Y} H 1080`} {...INLINE} />
    {/* the weight rack on the right: two uprights, plates hanging, a bar across */}
    <Shape d={rr(860, 700, 34, FLOOR_Y - 700 + 20, 8)} fill={GYM.rack} shadow={0.3} />
    <Shape d={rr(1040, 700, 34, FLOOR_Y - 700 + 20, 8)} fill={GYM.rack} shadow={0.3} />
    <Shape d={rr(820, 780, 290, 22, 10)} fill={GYM.steel} shadow={0} />
    <Plate x={900} y={1000} r={92} col={CLOTH.red} />
    <Plate x={1010} y={1010} r={82} col={CLOTH.blue} />
    <Plate x={950} y={1220} r={70} col={CLOTH.yellow} />
    <Plate x={1050} y={1250} r={58} col={CLOTH.green} />
    <UprightScale needle={needle} />
  </Layer>
);

/** The shaker bottle (creatine mixed in water): a tall cup with a cap, held by the hand drawn over it. */
export const Shaker: React.FC = () => (
  <g>
    <Shape d={rr(-28, -60, 56, 112, 12)} fill={CLOTH.orange} shadow={0.6}>
      <rect x={-28} y={-6} width={56} height={58} fill="#ffffff" opacity={0.75} />
      <path d="M -28 -6 H 28" {...INLINE} />
      {[-20, -30, -40].map((yy) => <path key={yy} d={`M 14 ${yy} H 24`} {...INLINE} />)}
    </Shape>
    <Shape d={rr(-32, -82, 64, 26, 8)} fill={CLOTH.charcoal} shadow={0} />
    <Shape d={rr(-10, -96, 20, 16, 5)} fill={CLOTH.charcoal} shadow={0} />
  </g>
);

// ------------------------------------------------------------------ the two moments for the sheet
/** A, the hook: Mom steps on the scale, the needle slams to the red; Crea stands proud on the dial. */
export const MomentScale: React.FC = () => (
  <Scene bg={GYM.wall}>
    <GymRoom needle={0.97} />
    <PersonAt spec={LIFTER} pose="worried" view="three-quarter" facing="right" expr="surprised" look={[0.8, 0.2]} x={400} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
    <Put x={SCALE.x} y={SCALE.y - SCALE.r - 110} size={250} rot={4}><Crea mood="happy" mouth="big" look={[-0.6, 0.3]} /></Put>
  </Scene>
);

/** The gym before: Mom with her shaker, thumbs up, the needle where it was. */
export const MomentShaker: React.FC = () => {
  const o = {pose: 'thumbsHold' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 400, y: FEET_Y - 22, scale: PEOPLE_SCALE};
  const h = handAt(LIFTER, o).R;
  const rot = (Math.atan2(h.dir[1], h.dir[0]) * 180) / Math.PI;
  return (
    <Scene bg={GYM.wall}>
      <GymRoom needle={0.3} />
      <PersonAt spec={LIFTER} {...o} expr="happy" look={[0.4, 0.1]} />
      <Put x={h.palm[0]} y={h.palm[1] - 30} size={185}><Shaker /></Put>
      <HandAt x={h.wrist[0]} y={h.wrist[1]} px={PEOPLE_SCALE * 30} kind="hold" skin={LIFTER.skin} rot={rot} rod={false} />
    </Scene>
  );
};

// ================================================================== the clinic of this video
/**
 * Dr. Mira's room in the creatine video (every video has a clinic of its own): a peach wall over white panelling,
 * a checker floor, a round window high on the left with the city outside, a cabinet on the right with a body chart
 * above it. Kept tidy (no clock, no certificates). The doctor stands left, Mom right.
 */
export const CLINIC = {wall: '#ffe3cf', wall2: '#fbd2b6', panel: '#fff8ee', floorA: '#efe7dc', floorB: '#d9cdbd', cab: tint(CLOTH.teal, 0.55), sky: tint(CLOTH.sky, 0.35)};
export const CreaClinic: React.FC = () => {
  const P = 1000; // the panelling's top
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={CLINIC.wall} />
      <rect x={0} y={P} width={1080} height={FLOOR_Y - P} fill={CLINIC.panel} />
      {Array.from({length: 6}, (_, i) => <path key={i} d={rr(20 + i * 180, P + 50, 140, FLOOR_Y - P - 100, 10)} {...INLINE} />)}
      <Shape d={rr(-10, P - 14, 1100, 24, 6)} fill={CLINIC.panel} shadow={0} line="in" />
      {/* the checker floor */}
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={CLINIC.floorB} />
      {[0, 1, 2, 3, 4].map((row) => {
        const ys = [FLOOR_Y, 1480, 1600, 1740, 1900, 2060];
        return Array.from({length: 10}, (_, i) => ((i + row) % 2 === 0 ? <rect key={`f${row}-${i}`} x={i * 120 - 60} y={ys[row]} width={120} height={ys[row + 1] - ys[row]} fill={CLINIC.floorA} /> : null));
      })}
      <path d={`M 0 ${FLOOR_Y} H 1080`} {...INLINE} />
      {/* the round window, high on the left: the city */}
      <g>
        <circle cx={230} cy={330} r={170} {...OUTLINE} fill={CLOTH.offwhite} />
        <circle cx={230} cy={330} r={146} fill={CLINIC.sky} {...EDGE_IN} />
        <path d="M 96 420 V 360 H 150 V 300 H 210 V 380 H 260 V 330 H 320 V 400 H 364 V 420 Q 230 500 96 420 Z" fill={tint(CLOTH.blue, 0.5)} {...EDGE_IN} />
        {[[170, 320], [180, 345], [280, 350], [290, 375]].map(([x, y], i) => <rect key={i} x={x} y={y} width={12} height={12} fill={tint(CLOTH.yellow, 0.4)} />)}
        <path d="M 120 250 q 14 -16 32 -6 q 16 -14 32 2 q 14 2 10 10 h -74 Z" fill="#ffffff" {...EDGE_IN} />
        <path d="M 230 184 V 476 M 84 330 H 376" stroke={INK} strokeWidth={14} />
        <path d="M 230 184 V 476 M 84 330 H 376" stroke={CLOTH.offwhite} strokeWidth={9} />
        <circle cx={230} cy={330} r={146} {...INLINE} />
      </g>
      {/* the body chart, high on the right */}
      <g>
        <Shape d={rr(690, 200, 220, 300, 6)} fill="#ffffff" shadow={0.5} />
        <circle cx={800} cy={196} r={8} fill={CLOTH.red} {...EDGE_IN} />
        <circle cx={770} cy={250} r={22} fill={tint(CLOTH.teal, 0.4)} {...EDGE_IN} />
        <path d="M 770 300 Q 742 302 738 332 L 732 398 Q 734 406 742 402 L 750 350 L 752 470 Q 760 476 766 470 L 770 412 L 774 470 Q 780 476 788 470 L 790 350 L 798 402 Q 806 406 808 398 L 802 332 Q 798 302 770 300 Z" fill={tint(CLOTH.teal, 0.4)} {...EDGE_IN} />
        {[270, 310, 350, 390, 430].map((y, i) => <path key={y} d={`M 830 ${y} H ${i % 2 ? 880 : 896}`} {...INLINE} />)}
      </g>
      {/* the cabinet on the right, a plant-free top with one jar */}
      <Shape d={rr(800, 1030, 300, FLOOR_Y - 1030 + 10, 10)} fill={CLINIC.cab} shadow={0.6}>
        <path d="M 950 1050 V 1380 M 810 1200 H 1090" {...INLINE} />
        <circle cx={930} cy={1120} r={8} fill={CLOTH.offwhite} {...EDGE_IN} />
        <circle cx={970} cy={1120} r={8} fill={CLOTH.offwhite} {...EDGE_IN} />
      </Shape>
      <Shape d={rr(870, 960, 70, 72, 12)} fill={tint(CLOTH.sky, 0.6)} />
      <Shape d={rr(862, 944, 86, 22, 6)} fill={CLOTH.offwhite} shadow={0} />
    </Layer>
  );
};
export const V8CreaClinic: React.FC = () => <Scene bg={CLINIC.wall}><CreaClinic /></Scene>;
