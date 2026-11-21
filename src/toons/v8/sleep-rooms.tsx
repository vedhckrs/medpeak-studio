/**
 * MedPeak Toons, look v8: the room of "What Happens If You Don't Sleep" (`no-sleep`): Sam's bedroom,
 * one room at two times of day. No other video has a bedroom.
 *   night  2 a.m.: deep blue walls, the moon and stars in the window, the lamp off, a digital clock "2:00",
 *          the phone's light on Sam's face (a flat pale shape, no glow)
 *   day    7 a.m.: pale butter walls, the sun and a blue sky, the clock "7:00", the duvet thrown back
 * Sam sits against the headboard on the LEFT (facing right) at night, on the bed's edge in the morning.
 */
import React from 'react';
import {CLOTH, EDGE_IN, INK, INLINE, OUTLINE, Shape, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {FLOOR_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, PersonAt} from './people-rig';
import {Melatonin} from './cells';
import {Phone} from './props';

const rr = (x: number, y: number, w: number, h: number, r: number) => `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

const ROOM = {
  night: {wall: '#34406f', wall2: '#3b4879', floor: '#4a3f5e', sky: '#1f2850', duvet: tint(CLOTH.teal, 0.15), sheet: tint(CLOTH.sky, 0.25), wood: shade(CLOTH.brown, 0.05), rug: tint(CLOTH.purple, 0.1)},
  day: {wall: tint(CLOTH.yellow, 0.72), wall2: tint(CLOTH.yellow, 0.62), floor: tint(CLOTH.tan, 0.3), sky: tint(CLOTH.sky, 0.3), duvet: tint(CLOTH.teal, 0.4), sheet: tint(CLOTH.sky, 0.6), wood: tint(CLOTH.brown, 0.3), rug: tint(CLOTH.purple, 0.45)},
};
export const BED = {head: 70, x1: 1110, top: 1300, mattress: 1350, base: 1520};

const DigitalClock: React.FC<{x: number; y: number; time: string; night: boolean}> = ({x, y, time, night}) => (
  <g>
    <Shape d={rr(x - 92, y - 52, 184, 104, 18)} fill={CLOTH.charcoal} shadow={0.6} />
    <Shape d={rr(x - 74, y - 36, 148, 72, 10)} fill={night ? '#1d2430' : '#2a3140'} shadow={0} line="in" />
    <text x={x} y={y + 22} textAnchor="middle" fontFamily="'Inter', 'Poppins', sans-serif" fontWeight={800} fontSize={60} fill={night ? '#ff7a6b' : '#f6c85f'} letterSpacing={2}>{time}</text>
    <path d={`M ${x - 70} ${y + 52} v 10 M ${x + 70} ${y + 52} v 10`} {...OUTLINE} strokeWidth={8} />
  </g>
);

const Window: React.FC<{night: boolean}> = ({night}) => {
  const x = 330, y = 250, w = 470, h = 520;
  const c = night ? ROOM.night : ROOM.day;
  return (
    <g>
      <Shape d={rr(x - 26, y - 26, w + 52, h + 52, 20)} fill={night ? tint(CLOTH.offwhite, -0.1) : CLOTH.offwhite} shadow={0.6} />
      <rect x={x} y={y} width={w} height={h} fill={c.sky} {...EDGE_IN} />
      {night ? (
        <g>
          {/* the moon: a crescent */}
          <path d={`M ${x + 330} ${y + 90} a 70 70 0 1 0 60 110 a 56 56 0 1 1 -60 -110 Z`} fill={tint(CLOTH.yellow, 0.4)} {...EDGE_IN} />
          {[[70, 80], [160, 170], [250, 60], [110, 300], [400, 330], [300, 420], [60, 440], [200, 380]].map(([sx, sy], i) => (
            <path key={i} d={`M ${x + sx} ${y + sy - 10} L ${x + sx + 3} ${y + sy - 3} L ${x + sx + 10} ${y + sy} L ${x + sx + 3} ${y + sy + 3} L ${x + sx} ${y + sy + 10} L ${x + sx - 3} ${y + sy + 3} L ${x + sx - 10} ${y + sy} L ${x + sx - 3} ${y + sy - 3} Z`} fill={tint(CLOTH.yellow, 0.55)} />
          ))}
          {/* far rooftops, all dark but one lit window */}
          <path d={`M ${x} ${y + h} V ${y + 430} H ${x + 90} V ${y + 380} H ${x + 190} V ${y + 450} H ${x + 300} V ${y + 400} H ${x + 380} V ${y + 460} H ${x + w} V ${y + h} Z`} fill="#161d3a" />
          <rect x={x + 120} y={y + 410} width={22} height={26} fill={tint(CLOTH.yellow, 0.3)} />
        </g>
      ) : (
        <g>
          <circle cx={x + 340} cy={y + 150} r={64} fill={CLOTH.yellow} {...EDGE_IN} />
          {Array.from({length: 8}, (_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${x + 340 + Math.cos(a) * 84} ${y + 150 + Math.sin(a) * 84} L ${x + 340 + Math.cos(a) * 108} ${y + 150 + Math.sin(a) * 108}`} stroke={CLOTH.yellow} strokeWidth={10} strokeLinecap="round" />; })}
          <path d={`M ${x + 60} ${y + 300} q 20 -30 50 -14 q 18 -24 46 -4 q 26 0 20 18 h -116 Z`} fill="#ffffff" {...EDGE_IN} />
          <path d={`M ${x} ${y + h} V ${y + 430} H ${x + 90} V ${y + 380} H ${x + 190} V ${y + 450} H ${x + 300} V ${y + 400} H ${x + 380} V ${y + 460} H ${x + w} V ${y + h} Z`} fill={tint(CLOTH.blue, 0.55)} {...EDGE_IN} />
        </g>
      )}
      <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}`} stroke={INK} strokeWidth={16} />
      <path d={`M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}`} stroke={CLOTH.offwhite} strokeWidth={11} />
      <rect x={x} y={y} width={w} height={h} {...OUTLINE} />
      {/* curtains, gathered to the sides */}
      {[x - 70, x + w + 10].map((cx, i) => (
        <Shape key={i} d={`M ${cx} ${y - 50} H ${cx + 60} Q ${cx + (i ? 20 : 40)} ${y + 300} ${cx + 66} ${y + h + 70} H ${cx - 6} Q ${cx + (i ? 30 : 20)} ${y + 300} ${cx} ${y - 50} Z`} fill={night ? tint(CLOTH.purple, -0.05) : tint(CLOTH.purple, 0.5)}>
          <path d={`M ${cx + 22} ${y - 40} Q ${cx + 26} ${y + 300} ${cx + 30} ${y + h + 60}`} {...INLINE} />
        </Shape>
      ))}
      <Shape d={rr(x - 110, y - 70, w + 220, 26, 10)} fill={CLOTH.charcoal} shadow={0} />
    </g>
  );
};

export const BedroomRoom: React.FC<{night: boolean}> = ({night}) => {
  const c = night ? ROOM.night : ROOM.day;
  const b = BED;
  return (
    <Layer>
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={c.wall} />
      {/* a wide soft band of wallpaper stripes, tone on tone */}
      {Array.from({length: 14}, (_, i) => <rect key={i} x={i * 80} y={0} width={36} height={FLOOR_Y} fill={c.wall2} />)}
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={c.floor} />
      <rect x={0} y={FLOOR_Y - 20} width={1080} height={20} fill={shade(c.wall, 0.15)} />
      <path d={`M 0 ${FLOOR_Y} H 1080`} {...INLINE} />
      {[1500, 1640, 1800].map((y) => <path key={y} d={`M 0 ${y} H 1080`} stroke={shade(c.floor, 0.08)} strokeWidth={2} />)}
      <Window night={night} />
      {/* a small framed picture of mountains, right */}
      <Shape d={rr(860, 330, 170, 210, 8)} fill={CLOTH.offwhite} shadow={0.5} />
      <rect x={880} y={350} width={130} height={170} fill={night ? '#2a3360' : tint(CLOTH.sky, 0.4)} {...EDGE_IN} />
      <path d="M 880 520 L 930 430 L 960 470 L 990 410 L 1010 450 V 520 Z" fill={night ? '#3d4a7a' : tint(CLOTH.green, 0.3)} {...EDGE_IN} />
      {/* the rug */}
      <Shape d={rr(140, 1700, 800, 140, 70)} fill={c.rug} shadow={0.4}>
        <path d="M 200 1770 H 880" {...INLINE} strokeDasharray="18 14" />
      </Shape>
      {/* the bed: headboard left, mattress, duvet, its foot off the right edge */}
      <Shape d={rr(b.head - 70, 980, 110, b.base - 980 + 40, 20)} fill={c.wood} />
      <Shape d={rr(b.head, b.base - 30, b.x1 - b.head, 60, 8)} fill={c.wood} />
      <Shape d={rr(b.head, b.mattress - 40, b.x1 - b.head, b.base - b.mattress + 20, 18)} fill={c.sheet} shadow={0.6}>
        <path d={`M ${b.head} ${b.mattress + 40} H ${b.x1}`} {...INLINE} />
      </Shape>
      <Shape d={`M ${b.head + 10} ${b.mattress - 120} Q ${b.head + 110} ${b.mattress - 170} ${b.head + 220} ${b.mattress - 120} Q ${b.head + 240} ${b.mattress - 60} ${b.head + 220} ${b.mattress - 20} Q ${b.head + 110} ${b.mattress} ${b.head + 10} ${b.mattress - 20} Q ${b.head - 10} ${b.mattress - 70} ${b.head + 10} ${b.mattress - 120} Z`} fill={CLOTH.offwhite} shadow={1} />
      {/* nightstand with the clock and a lamp, right of the bed's head is the window: it stands at the right */}
      <Shape d={rr(800, 1080, 240, 270, 12)} fill={c.wood} />
      <path d="M 816 1210 H 1024" {...INLINE} />
      <circle cx={920} cy={1170} r={9} fill={CLOTH.offwhite} {...EDGE_IN} />
      <circle cx={920} cy={1280} r={9} fill={CLOTH.offwhite} {...EDGE_IN} />
      <DigitalClock x={870} y={1018} time={night ? '2:00' : '7:00'} night={night} />
      {/* the lamp: off at night (no light), the same in the morning */}
      <Shape d={rr(990, 960, 16, 110, 6)} fill={CLOTH.grey} shadow={0} />
      <Shape d="M 950 870 H 1046 L 1070 970 H 926 Z" fill={night ? tint(CLOTH.orange, 0.2) : tint(CLOTH.orange, 0.55)} />
      <Shape d={rr(966, 1062, 64, 18, 6)} fill={CLOTH.charcoal} shadow={0} />
    </Layer>
  );
};

/** The duvet, drawn AFTER Sam so it covers the legs. thrown: thrown back toward the foot (morning). */
export const Duvet: React.FC<{night: boolean; thrown?: boolean}> = ({night, thrown}) => {
  const c = night ? ROOM.night : ROOM.day;
  const b = BED;
  const x0 = thrown ? 600 : b.head + 150;
  return (
    <Layer>
      <Shape d={`M ${x0} ${b.mattress - (thrown ? 70 : 90)} Q ${x0 + 200} ${b.mattress - (thrown ? 140 : 120)} ${x0 + 420} ${b.mattress - 80} Q ${b.x1 - 60} ${b.mattress - 60} ${b.x1 + 20} ${b.mattress - 50} L ${b.x1 + 20} ${b.base - 10} Q ${(x0 + b.x1) / 2} ${b.base + 16} ${x0 - 30} ${b.base - 20} Q ${x0 - 50} ${b.mattress} ${x0} ${b.mattress - (thrown ? 70 : 90)} Z`} fill={c.duvet} shadow={1.2}>
        <path d={`M ${x0 + 120} ${b.mattress - 70} Q ${x0 + 160} ${b.mattress + 20} ${x0 + 130} ${b.base - 10} M ${x0 + 360} ${b.mattress - 60} Q ${x0 + 390} ${b.mattress + 20} ${x0 + 370} ${b.base}`} {...INLINE} />
        {/* a band of small stars on the cover */}
        {Array.from({length: 8}, (_, i) => <circle key={i} cx={x0 + 40 + i * 70} cy={b.mattress + 20 + (i % 2) * 40} r={7} fill={tint(c.duvet, 0.4)} />)}
      </Shape>
    </Layer>
  );
};

/** The bed's front side (mattress edge, frame, the sheet hanging to the floor), drawn AFTER Sam at night so
 * his legs are inside the bed, not dangling below it. */
export const BedFront: React.FC<{night: boolean}> = ({night}) => {
  const c = night ? ROOM.night : ROOM.day;
  const b = BED;
  return (
    <Layer>
      <Shape d={rr(b.head, b.mattress - 30, b.x1 - b.head, 110, 16)} fill={c.sheet} shadow={0.5}>
        <path d={`M ${b.head} ${b.mattress + 40} H ${b.x1}`} {...INLINE} />
      </Shape>
      <Shape d={rr(b.head, b.mattress + 70, b.x1 - b.head, 110, 8)} fill={c.wood} />
      {/* the sheet hanging down to the floor (a valance): it hides the legs and feet inside the bed */}
      <Shape d={`M ${b.head + 40} ${b.mattress + 160} H ${b.x1} V ${FLOOR_Y + 250} Q ${(b.head + b.x1) / 2} ${FLOOR_Y + 262} ${b.head + 40} ${FLOOR_Y + 250} Z`} fill={c.sheet} shadow={0.4}>
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${b.head + 120 + i * 110} ${b.mattress + 180} Q ${b.head + 126 + i * 110} ${FLOOR_Y + 160} ${b.head + 116 + i * 110} ${FLOOR_Y + 250}`} {...INLINE} />)}
      </Shape>
      <path d={`M ${b.head + 30} ${b.mattress + 180} V ${FLOOR_Y + 260} M ${b.x1 - 60} ${b.mattress + 180} V ${FLOOR_Y + 260}`} stroke={INK} strokeWidth={30} strokeLinecap="round" />
      <path d={`M ${b.head + 30} ${b.mattress + 180} V ${FLOOR_Y + 260} M ${b.x1 - 60} ${b.mattress + 180} V ${FLOOR_Y + 260}`} stroke={c.wood} strokeWidth={24} strokeLinecap="round" />
      <Shape d={rr(b.head - 70, 980, 110, b.base - 980 + 260, 20)} fill={c.wood} />
    </Layer>
  );
};

// ------------------------------------------------------------------ the two moments for the sheet
const SAM = castById('patient');
/** B: 2 a.m., Sam sits up in bed on the phone; Melatonin floats in, yawning. */
export const MomentNight: React.FC = () => {
  const o = {pose: 'sitPhone' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 300, y: 1560, scale: PEOPLE_SCALE};
  const h = handAt(SAM, o).R;
  return (
    <Scene bg={ROOM.night.wall}>
      <BedroomRoom night />
      {/* the phone's light: a flat pale wedge from the screen to the face, no blur */}
      <svg style={{position: 'absolute', left: 0, top: 0}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <path d={`M ${h.palm[0] + 30} ${h.palm[1] - 70} L ${h.palm[0] - 150} ${h.palm[1] - 330} L ${h.palm[0] - 230} ${h.palm[1] - 120} Z`} fill={tint(CLOTH.sky, 0.5)} opacity={0.28} />
      </svg>
      <PersonAt spec={SAM} {...o} expr="happy" look={[0.6, 0.3]} />
      <Put x={h.palm[0] + 10} y={h.palm[1] - 40} size={120} rot={-24}><Phone /></Put>
      <BedFront night />
      <Duvet night />
      <Put x={700} y={640} size={300} rot={-6}><Melatonin mood="sleepy" mouth="o" look={[-0.6, 0.4]} /></Put>
    </Scene>
  );
};
/** D: 7 a.m. after a night awake, Sam slumps on the bed's edge, eyes half shut. */
export const MomentMorning: React.FC = () => (
  <Scene bg={ROOM.day.wall}>
    <BedroomRoom night={false} />
    <Duvet night={false} thrown />
    <PersonAt spec={SAM} pose="sitSlump" view="three-quarter" facing="right" expr="sleepy" look={[0.3, 0.6]} x={420} y={1660} scale={PEOPLE_SCALE} />
  </Scene>
);
