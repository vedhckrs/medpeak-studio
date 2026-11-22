/**
 * MedPeak Toons, look v8: the room of "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`): Dad's
 * kitchen at night. Not the rabies kitchen (a cream daytime kitchen): deep blue-green walls, the moon in a
 * square window high over the fridge, and one warm light, the open fridge, laid on the floor as a flat pale shape (no glow).
 *   fridge on the LEFT (door opens toward the lens), Dad stands in its light, facing right
 *   the wall calendar in the middle: a red "NO SUGAR" header and the day as one big number (`day`)
 *   the bin and a bathroom scale on the RIGHT (Day 30: Dad steps on it; `kg` shows on its little screen)
 * Kept tidy: no clutter, no clock, no certificates.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FONT, INK, INLINE, OUTLINE, Shape, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {FEET_Y, FLOOR_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, type PersonSpec, PersonAt} from './people-rig';
import {BurstCan, Sweetie} from './sugar-cast';

const rr = (x: number, y: number, w: number, h: number, r: number) => `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

export const NIGHT = {
  wall: '#2f5260', wall2: '#2a4957', floor: '#3b3a4a', floor2: '#34333f', sky: '#1d2a4a',
  fridge: '#e9eef2', fridge2: '#cfd8df', inside: '#fff3cf', light: '#57707a', lightFloor: '#5a5f6a',
  unit: '#3e6b73', top: tint(CLOTH.grey, 0.2),
};

/** Dad at home at night: the same face and hair, in a tee and trousers. */
const DAD = castById('dad');
export const DAD_HOME: PersonSpec = {...DAD, top: {kind: 'tee', color: CLOTH.navy, sleeve: 'short'}, extras: {...DAD.extras, belt: undefined}};

/** The wall calendar: rings, a red header, the day as one big number. */
export const WallCalendar: React.FC<{day: number}> = ({day}) => (
  <g>
    <Shape d={rr(-110, -120, 220, 250, 10)} fill="#ffffff" shadow={0.5} />
    <Shape d={rr(-110, -120, 220, 64, 10)} fill={CLOTH.red} shadow={0} line="in" />
    <rect x={-110} y={-80} width={220} height={24} fill={CLOTH.red} />
    <path d="M -110 -56 H 110" {...INLINE} />
    <text x={0} y={-76} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} fill="#ffffff" letterSpacing={1.5}>NO SUGAR</text>
    <text x={0} y={-18} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={24} fill={tint(INK, 0.35)} letterSpacing={3}>DAY</text>
    <text x={0} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={day >= 10 ? 120 : 130} fill={INK}>{day}</text>
    {[-60, 0, 60].map((x) => <rect key={x} x={x - 7} y={-136} width={14} height={32} rx={7} fill={CLOTH.charcoal} {...EDGE_IN} />)}
  </g>
);

/** A flat bathroom scale on the floor, its little screen showing `kg` (or blank). */
export const BathScale: React.FC<{kg?: string}> = ({kg}) => (
  <g>
    <Shape d={rr(-120, -26, 240, 52, 18)} fill={tint(CLOTH.sky, 0.4)} shadow={0.6} />
    <Shape d={rr(-46, -18, 92, 30, 6)} fill="#1d2430" shadow={0} line="in" />
    {kg && <text x={0} y={7} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={22} fill={CLOTH.yellow}>{kg}</text>}
  </g>
);

const FRIDGE = {x: 0, w: 330, y: 380};
export const NightKitchen: React.FC<{open?: boolean; day?: number; kg?: string; scaleAt?: number}> = ({open = true, day = 1, kg, scaleAt}) => {
  const fr = FRIDGE;
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={NIGHT.wall} />
      {Array.from({length: 6}, (_, i) => <rect key={i} x={i * 200 + 60} y={0} width={90} height={FLOOR_Y} fill={NIGHT.wall2} />)}
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={NIGHT.floor} />
      {[1500, 1650, 1830].map((y) => <path key={y} d={`M 0 ${y} H 1080`} stroke={NIGHT.floor2} strokeWidth={5} />)}
      <path d={`M 0 ${FLOOR_Y} H 1080`} {...INLINE} />

      {/* the square window, high on the right: the moon and three stars */}
      <g>
        <Shape d={rr(50, 100, 240, 240, 14)} fill={NIGHT.fridge2} shadow={0.4} />
        <rect x={70} y={120} width={200} height={200} fill={NIGHT.sky} />
        <path d="M 210 156 A 40 40 0 1 0 236 224 A 31 31 0 1 1 210 156 Z" fill={tint(CLOTH.yellow, 0.4)} {...EDGE_IN} />
        {[[106, 156], [130, 282], [240, 298]].map(([x, y], i) => <path key={i} d={`M ${x} ${y - 10} L ${x + 3} ${y - 3} L ${x + 10} ${y} L ${x + 3} ${y + 3} L ${x} ${y + 10} L ${x - 3} ${y + 3} L ${x - 10} ${y} L ${x - 3} ${y - 3} Z`} fill="#ffffff" />)}
        <path d="M 170 120 V 320 M 70 220 H 270" stroke={NIGHT.fridge2} strokeWidth={11} />
        <rect x={70} y={120} width={200} height={200} {...INLINE} fill="none" />
      </g>

      {/* the counter on the right, low and plain */}
      <Shape d={rr(560, 1110, 540, FLOOR_Y - 1110 + 10, 6)} fill={NIGHT.unit} shadow={0.5}>
        <path d="M 820 1150 V 1370" {...INLINE} />
        <circle cx={790} cy={1230} r={8} fill={NIGHT.top} {...EDGE_IN} />
        <circle cx={850} cy={1230} r={8} fill={NIGHT.top} {...EDGE_IN} />
      </Shape>
      <Shape d={rr(540, 1086, 560, 30, 6)} fill={NIGHT.top} shadow={0} />

      {/* the calendar on the wall, middle */}
      <g transform="translate(780 360) scale(1.2)"><WallCalendar day={day} /></g>

      {/* the fridge's light on the floor: one flat pale wedge */}
      {open && <path d={`M ${fr.w} ${FLOOR_Y} L 760 1920 L ${fr.w - 80} 1920 Z`} fill={NIGHT.lightFloor} />}
      {/* the fridge, left; the door swung toward us */}
      <Shape d={rr(fr.x - 20, fr.y, fr.w + 20, FEET_Y - 60 - fr.y, 18)} fill={NIGHT.fridge} shadow={0.7}>
        {open ? (
          <g>
            <rect x={fr.x + 10} y={fr.y + 30} width={fr.w - 40} height={FEET_Y - 140 - fr.y} fill={NIGHT.inside} />
            {[720, 980, 1220].map((y) => <path key={y} d={`M ${fr.x + 10} ${y} H ${fr.w - 30}`} stroke={NIGHT.fridge2} strokeWidth={10} />)}
            <rect x={fr.x + 10} y={fr.y + 30} width={fr.w - 40} height={FEET_Y - 140 - fr.y} {...INLINE} fill="none" />
          </g>
        ) : (
          <g>
            <path d={`M ${fr.x - 20} 820 H ${fr.w}`} {...INLINE} />
            <rect x={fr.w - 50} y={560} width={14} height={180} rx={7} fill={NIGHT.fridge2} {...EDGE_IN} />
          </g>
        )}
      </Shape>
      {/* what is inside: a milk bottle and a bowl (never sweets: those are Sweetie's) */}
      {open && (
        <g>
          <Shape d={rr(60, 600, 60, 116, 12)} fill="#ffffff" shadow={0.4} />
          <Shape d="M 160 940 Q 210 990 260 940 Z" fill={tint(CLOTH.teal, 0.3)} shadow={0.4} />
        </g>
      )}

      {/* the bin and the bathroom scale, right */}
      <Shape d="M 900 1560 L 1010 1560 L 996 1760 Q 994 1772 982 1772 L 928 1772 Q 916 1772 914 1760 Z" fill={tint(CLOTH.grey, 0.1)} shadow={0.6} />
      <Shape d={rr(890, 1540, 130, 26, 8)} fill={CLOTH.charcoal} shadow={0} />
      {scaleAt !== undefined && <g transform={`translate(${scaleAt} ${FEET_Y - 4}) scale(1.25)`}><BathScale kg={kg} /></g>}
    </Layer>
  );
};

// ------------------------------------------------------------------ the moments for the sheet
/** A, Day 1, the hook: Dad at the open fridge; Sweetie bursts out of a soda can right at the lens. */
export const MomentHook: React.FC = () => (
  <Scene bg={NIGHT.wall}>
    <NightKitchen open day={1} />
    <PersonAt spec={DAD_HOME} pose="worried" view="three-quarter" facing="right" expr="surprised" look={[0.6, 0.4]} x={380} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
    <Put x={640} y={1640} size={420}><BurstCan burst={1} /></Put>
    <Put x={640} y={1300} size={620} rot={-6}><Sweetie mood="wink" mouth="big" arms="wave" look={[-0.2, 0.3]} /></Put>
  </Scene>
);
/** E, Day 20: Sweetie in his ZERO can on the counter; Dad thinks about it. */
export const MomentZero: React.FC = () => (
  <Scene bg={NIGHT.wall}>
    <NightKitchen open={false} day={20} />
    <PersonAt spec={DAD_HOME} pose="think" view="three-quarter" facing="right" expr="worried" look={[0.8, 0]} x={360} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
    <Put x={830} y={960} size={300}><Sweetie wear="diet" mood="wink" mouth="tongue" arms="wave" look={[-0.7, 0.1]} /></Put>
  </Scene>
);
/** F, Day 30: Dad on the scale. */
export const MomentScaleDay30: React.FC = () => (
  <Scene bg={NIGHT.wall}>
    <NightKitchen open={false} day={30} scaleAt={470} />
    <PersonAt spec={DAD_HOME} pose="worried" view="three-quarter" facing="right" expr="surprised" look={[0.2, 0.9]} x={470} y={FEET_Y - 22} scale={PEOPLE_SCALE} />
  </Scene>
);
