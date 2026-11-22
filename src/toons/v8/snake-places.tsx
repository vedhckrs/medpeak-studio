/**
 * MedPeak Toons, look v8: the places of "What Happens When a Snake Bites You" (`snake-bite`). One colour per place,
 * quiet tone-on-tone backgrounds (like `PlainBack` in sugar-organs.tsx), one or two characters per frame.
 *   TrailScene   warm green day: a dirt path, a few big simple leaves, the rock where the snake hid (only its tail slips away)
 *   LegInside    deep red-brown tissue; the two fang holes as a big shaft of light from above; a nerve cable left, a blood
 *                river right; `swell` 0..1 makes the tissue bulge
 *   HospitalBed  pale blue: Sam in bed, the drip stand, the line into his arm
 * The moments (for the sheet): the hook, the split, the myths, the hospital drip.
 */
import React from 'react';
import {CLOTH, EDGE_IN, FONT, INK, INLINE, OUTLINE, Shape, shade, tint} from './kit';
import {Layer, Put, Scene} from './scene';
import {FEET_Y, PEOPLE_SCALE} from './scenes-rooms';
import {castById, handAt, PersonAt} from './people-rig';
import {Antivenom, Bleed, Crush, Numb} from './snake-cast';

export const SNAKE_PLACE = {trail: '#a9cf7a', leg: '#7a3a32', ward: '#cfe3f1'};

// ================================================================== the trail
export const TrailScene: React.FC<{tail?: number}> = ({tail = 1}) => {
  const c = SNAKE_PLACE.trail;
  return (
    <Layer>
      {/* far trees: soft rounded shapes, one tone lighter */}
      {[[80, 520, 240], [360, 470, 260], [700, 500, 250], [1000, 520, 240]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={tint(c, 0.16)} />)}
      <path d="M -40 760 Q 540 680 1120 760 L 1120 1960 L -40 1960 Z" fill={shade(c, 0.06)} />
      {/* the dirt path, wide at the front, narrowing to the back */}
      <path d="M 200 1960 Q 420 1300 500 760 L 600 760 Q 720 1300 960 1960 Z" fill="#d8b98a" />
      <path d="M 360 1700 Q 380 1600 420 1560 M 690 1500 Q 720 1440 700 1380" {...INLINE} stroke={shade('#d8b98a', 0.25)} />
      {/* big simple leaves at the edges */}
      {[[-30, 1020, 30, 1], [1110, 980, -30, -1], [-20, 1500, 10, 1], [1100, 1560, -10, -1]].map(([x, y, rot, s], i) => (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot}) scale(${s} 1)`}>
          <Shape d="M 0 0 Q 120 -140 300 -60 Q 160 60 0 0 Z" fill={shade(c, 0.2)} shadow={0.5}>
            <path d="M 0 0 Q 140 -50 290 -60" {...INLINE} />
          </Shape>
        </g>
      ))}
      {/* the rock where the snake hid: the tail slipping under it */}
      <g transform="translate(830 1300)">
        {tail > 0 && (
          <path d={`M 40 40 Q ${-60 - tail * 30} ${70} ${-110 - tail * 50} ${20}`} stroke={INK} strokeWidth={30} strokeLinecap="round" fill="none" />
        )}
        {tail > 0 && (
          <path d={`M 40 40 Q ${-60 - tail * 30} ${70} ${-110 - tail * 50} ${20}`} stroke="#8a6a3a" strokeWidth={19} strokeLinecap="round" fill="none" />
        )}
        <Shape d="M -110 60 Q -120 -40 -20 -80 Q 100 -110 170 -20 Q 200 50 160 70 Q 20 90 -110 60 Z" fill="#9a958a" shadow={1.2}>
          <path d="M -40 -40 Q 0 -60 40 -50" {...INLINE} />
        </Shape>
      </g>
    </Layer>
  );
};

// ================================================================== inside the leg
export const LegInside: React.FC<{swell?: number; light?: number}> = ({swell = 0, light = 1}) => {
  const c = SNAKE_PLACE.leg;
  const b = 1 + swell * 0.18;
  return (
    <Layer>
      {/* the tissue: big soft bulges, tone on tone; they grow with the swelling */}
      {[[160, 520, 230], [900, 620, 250], [300, 1180, 260], [820, 1300, 240], [520, 1760, 300]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r * b} fill={tint(c, 0.08 + (i % 2) * 0.04)} />
      ))}
      {/* the nerve cable, left: a pale yellow bundle with its fibres */}
      <Shape d="M 60 -40 Q 170 600 120 1100 Q 80 1500 150 1980 L 30 1980 Q -40 1500 0 1100 Q 40 600 -60 -40 Z" fill="#f2d98d" shadow={1}>
        {[20, 60, 100].map((x) => <path key={x} d={`M ${x - 60} 0 Q ${x + 50} 600 ${x} 1100 Q ${x - 40} 1500 ${x + 30} 1960`} {...INLINE} opacity={0.5} />)}
      </Shape>
      {/* the blood river, right */}
      <Shape d="M 900 -40 Q 1010 600 940 1100 Q 880 1500 960 1980 L 1140 1980 L 1140 -40 Z" fill="#c8342e" shadow={1}>
        {[[1000, 400], [1050, 900], [990, 1400], [1060, 1750]].map(([x, y], i) => <ellipse key={i} cx={x} cy={y} rx={34} ry={14} fill={tint('#c8342e', 0.25)} {...EDGE_IN} />)}
      </Shape>
      {/* the two fang holes, a big shaft of light down from above */}
      <path d="M 380 -40 L 700 -40 L 820 1400 L 260 1400 Z" fill="#fff3d6" opacity={0.22 * light} />
      {[440, 640].map((x) => (
        <g key={x}>
          <path d={`M ${x - 40} -40 L ${x + 40} -40 L ${x + 90} 1300 L ${x - 90} 1300 Z`} fill="#fff6e0" opacity={0.3 * light} />
          <ellipse cx={x} cy={40} rx={58} ry={26} fill="#fff8ea" {...EDGE_IN} />
        </g>
      ))}
    </Layer>
  );
};

/** The two fangs punching down through the skin (the hook). */
const Fangs: React.FC<{y: number}> = ({y}) => (
  <Layer>
    {[440, 640].map((x) => (
      <Shape key={x} d={`M ${x - 56} -60 L ${x + 56} -60 Q ${x + 40} ${y - 160} ${x} ${y} Q ${x - 40} ${y - 160} ${x - 56} -60 Z`} fill="#fbf6ea" shadow={0.8} />
    ))}
  </Layer>
);

// ================================================================== the hospital
const DripStand: React.FC<{x: number; foot: number}> = ({x, foot}) => (
  <g>
    <path d={`M ${x} ${foot} L ${x} 420 M ${x - 70} 420 L ${x + 70} 420 M ${x - 80} ${foot} L ${x + 80} ${foot}`} stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d={`M ${x} ${foot} L ${x} 420 M ${x - 70} 420 L ${x + 70} 420 M ${x - 80} ${foot} L ${x + 80} ${foot}`} stroke={tint(CLOTH.grey, 0.4)} strokeWidth={8} strokeLinecap="round" />
    {/* the bag */}
    <Shape d={`M ${x - 60} 450 L ${x + 60} 450 L ${x + 64} 680 Q ${x} 740 ${x - 64} 680 Z`} fill="#eef6fb" shadow={0.6}>
      <path d={`M ${x - 58} 560 L ${x + 60} 560 L ${x + 62} 680 Q ${x} 736 ${x - 62} 680 Z`} fill={tint(VENOM_GOLD, 0.3)} />
      <text x={x} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={INK}>AV</text>
    </Shape>
  </g>
);
const VENOM_GOLD = '#f3d98a';

const SAM_BED = {pose: 'sitSlump' as const, view: 'three-quarter' as const, facing: 'right' as const, x: 360, y: 1470, scale: 2.6};
/** Where the drip goes in: the inside of Sam's forearm, just above the wrist of the hand nearer the stand. */
const dripEnd = (): [number, number] => {
  const h = handAt(castById('patient'), SAM_BED);
  const w = h.R.wrist[0] > h.L.wrist[0] ? h.R : h.L;
  return [w.wrist[0] - 18, w.wrist[1] - 14];
};
const dripPath = () => { const [x, y] = dripEnd(); return `M 870 740 Q 870 980 ${(x + 160).toFixed(0)} ${(y - 80).toFixed(0)} Q ${(x + 40).toFixed(0)} ${(y - 20).toFixed(0)} ${x.toFixed(0)} ${y.toFixed(0)}`; };
export const HospitalBed: React.FC<{expr?: 'worried' | 'happy' | 'neutral'}> = ({expr = 'worried'}) => {
  const c = SNAKE_PLACE.ward;
  const sam = castById('patient');
  return (
    <>
      <Layer>
        <path d="M -40 1300 L 1120 1300 L 1120 1960 L -40 1960 Z" fill={shade(c, 0.08)} />
        {[[180, 360, 260], [880, 300, 220]].map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill={tint(c, 0.25)} />)}
        <DripStand x={870} foot={1560} />
        {/* the bed: the head board, the mattress */}
        <Shape d="M 60 880 Q 60 840 100 840 L 150 840 Q 190 840 190 880 L 190 1560 L 60 1560 Z" fill={tint(CLOTH.grey, 0.5)} shadow={0.6} />
        <Shape d="M 90 1260 L 980 1260 L 980 1400 L 90 1400 Z" fill="#ffffff" shadow={0.8} />
        <path d="M 150 1400 L 150 1580 M 920 1400 L 920 1580" stroke={INK} strokeWidth={14} strokeLinecap="round" />
        <Shape d="M 170 980 Q 170 940 220 940 L 330 940 Q 380 940 380 990 L 380 1140 L 170 1140 Z" fill="#ffffff" shadow={0.5} />
      </Layer>
      {/* sitting up IN the bed (no chair, no prop): the slumped sit, hips on the mattress, legs under the blanket */}
      <PersonAt spec={sam} {...SAM_BED} expr={expr} look={[0.6, -0.3]} />
      <Layer>
        {/* the blanket over his legs */}
        <Shape d="M 300 1200 Q 520 1150 960 1190 Q 1000 1260 970 1330 L 300 1330 Q 270 1260 300 1200 Z" fill={tint(CLOTH.blue, 0.45)} shadow={0.8}>
          <path d="M 440 1220 Q 560 1250 680 1220" {...INLINE} />
        </Shape>
        {/* the drip line: from the bag down into the inside of his forearm (a white plaster holds it) */}
        <path d={dripPath()} {...OUTLINE} strokeWidth={6} />
        <path d={dripPath()} stroke="#f6fbff" strokeWidth={3} fill="none" />
        {(() => { const [x, y] = dripEnd(); return <rect x={x - 16} y={y - 10} width={32} height={20} rx={4} fill="#ffffff" stroke={INK} strokeWidth={3} />; })()}
      </Layer>
    </>
  );
};

// ================================================================== the moments for the sheet
const Knife: React.FC = () => (
  <g>
    <Shape d="M -20 -10 L 90 -10 Q 70 14 -20 14 Z" fill={tint(CLOTH.grey, 0.6)} shadow={0.4} />
    <Shape d="M -90 -14 L -20 -14 L -20 18 L -90 18 Q -100 2 -90 -14 Z" fill="#7a4e36" shadow={0.4} />
  </g>
);
const Rope: React.FC = () => (
  <g>
    <path d="M -80 30 Q -40 -60 20 -10 Q 70 30 40 70 Q 10 100 -30 70 Q -60 40 -10 20 Q 50 0 90 -50" stroke={INK} strokeWidth={22} strokeLinecap="round" fill="none" />
    <path d="M -80 30 Q -40 -60 20 -10 Q 70 30 40 70 Q 10 100 -30 70 Q -60 40 -10 20 Q 50 0 90 -50" stroke="#d6b27a" strokeWidth={13} strokeLinecap="round" fill="none" />
  </g>
);

/** The hook: the fangs punch down through the skin and the gang bursts out at the lens. */
export const MomentSnakeHook: React.FC = () => (
  <Scene bg={SNAKE_PLACE.leg}>
    <LegInside swell={0.2} />
    <Fangs y={560} />
    <Put x={300} y={1000} size={420} rot={-10}><Bleed mood="angry" mouth="grit" arms="cheer" look={[0.3, 0.4]} /></Put>
    <Put x={790} y={1020} size={420} rot={8}><Crush mood="wink" mouth="big" arms="wave" look={[-0.3, 0.4]} /></Put>
    <Put x={540} y={1460} size={640}><Numb mood="wink" mouth="big" arms="point" look={[0, 0.5]} /></Put>
  </Scene>
);
/** The split: Numb to the nerve (left), Bleed to the blood (right), Crush stays and wrecks the tissue (it swells). */
export const MomentSplit: React.FC = () => (
  <Scene bg={SNAKE_PLACE.leg}>
    <LegInside swell={0.7} light={0.6} />
    <Put x={270} y={760} size={340} rot={-14}><Numb mood="happy" mouth="big" arms="wave" look={[-0.8, 0]} /></Put>
    <Put x={800} y={1060} size={340} rot={12}><Bleed mood="wink" mouth="big" arms="point" look={[0.8, 0]} /></Put>
    <Put x={500} y={1500} size={420}><Crush mood="angry" mouth="grit" arms="hips" look={[0, 0.5]} /></Put>
  </Scene>
);
/** The myths: Mom shouts "Cut it! Tie it!" with a knife and a rope; the gang cheers. */
export const MomentMyths: React.FC = () => (
  <Scene bg={SNAKE_PLACE.trail}>
    <TrailScene tail={0.6} />
    <PersonAt spec={castById('mom')} pose="point" view="three-quarter" facing="right" expr="angry" look={[0.6, 0.3]} x={330} y={FEET_Y - 60} scale={PEOPLE_SCALE * 0.9} />
    {/* the shout bubble: the knife and the rope she waves about */}
    <Layer>
      <Shape d="M 560 280 Q 560 200 640 200 L 980 200 Q 1050 200 1050 280 L 1050 480 Q 1050 550 980 550 L 700 550 L 620 620 L 640 550 Q 560 550 560 480 Z" fill="#ffffff" shadow={0} />
      <text x={805} y={290} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>CUT IT!</text>
      <text x={805} y={530} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={54} fill={INK}>TIE IT!</text>
    </Layer>
    <Put x={700} y={400} size={170} rot={-20}><Knife /></Put>
    <Put x={910} y={400} size={170}><Rope /></Put>
    <Put x={830} y={1500} size={380}><Crush mood="happy" mouth="big" arms="cheer" look={[-0.5, -0.4]} /></Put>
  </Scene>
);
/** The hospital: Sam in bed, the antivenom drip running into his arm; the hero waits in the bag. */
export const MomentDrip: React.FC = () => (
  <Scene bg={SNAKE_PLACE.ward}>
    <HospitalBed expr="worried" />
    <Put x={870} y={640} size={110}><Antivenom mood="happy" mouth="smile" arms="wave" look={[-0.6, 0.3]} /></Put>
  </Scene>
);
/** The hero arrives inside the leg and punches; Bleed is knocked out. */
export const MomentPunch: React.FC = () => (
  <Scene bg={SNAKE_PLACE.leg}>
    <LegInside swell={0.4} light={0.4} />
    <Put x={380} y={1120} size={460}><Antivenom mood="angry" mouth="flat" arms="punch" look={[0.7, 0]} /></Put>
    <Put x={790} y={1180} size={360} rot={6}><Bleed mood="sad" mouth="frown" arms="droop" knocked={1} /></Put>
  </Scene>
);
