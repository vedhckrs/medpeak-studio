/**
 * MedPeak Toons, look v8: the two ROOMS of the rabies video (a home kitchen and a doctor's room) and the
 * four storyboard frames played in them. 1080 x 1920 stills, drawn with the shared kit (kit.tsx) and the
 * scene pieces (scene.tsx); the cast comes from people-rig.tsx, the props from props.tsx.
 *
 * Background rules kept here: objects (furniture, window, sink, tap) carry the cast's INK outline
 * (OUTLINE outside, INLINE inside); big fields (wall, floor) are flat colour, their patterns (tiles,
 * stripes, checker, boards) are thin low-contrast lines or tone-on-tone bands. Everything is lighter and
 * plainer than the people, so the cast reads first. A flat, front-on stage: the wall meets the floor at
 * FLOOR_Y; furniture stands in front of the wall and is seen straight from the front.
 *
 * Pieces built here (not in the kit): rr (a rounded rectangle path), Pipe (an outlined tube, for the
 * tap). Props and marks sit on a hand or a forearm through the rig's own handAt.
 *
 * In the video (play.tsx) the two rooms are shots C (kitchen) and D (clinic): ROOM_SHOTS at the end. The
 * six stills are the same shots drawn at one good moment.
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, INK, INLINE, OUTLINE, ROOM, Shape, shade, tint, V9} from './kit';
import {Layer, Put, Scene, Tag} from './scene';
import {IconBadge} from './hud';
import {castById, handAt, headAt, PersonAt, type Expr, type Facing, type HandPoint, type PoseIn, type PoseName, type View} from './people-rig';
import {blink, EXPR_OF, feel, go, pop, since, speaking, sway, talk, type LineNow, type ShotDef, type ShotNow} from './play';
import {Plaster, Soap, VaccineVial} from './props';

// ------------------------------------------------------------------ helpers
const rr = (x: number, y: number, w: number, h: number, r: number) => {
  const k = Math.min(r, w / 2, h / 2);
  return `M ${x + k} ${y} H ${x + w - k} A ${k} ${k} 0 0 1 ${x + w} ${y + k} V ${y + h - k} A ${k} ${k} 0 0 1 ${x + w - k} ${y + h} H ${x + k} A ${k} ${k} 0 0 1 ${x} ${y + h - k} V ${y + k} A ${k} ${k} 0 0 1 ${x + k} ${y} Z`;
};
const box = (x: number, y: number, w: number, h: number) => `M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`;
/** A thin low-contrast line on a big field (tiles, boards, stripes): never ink. */
const faint = (c: string) => ({stroke: c, strokeWidth: 2, strokeLinecap: 'round', fill: 'none'} as const);
/** An outlined tube of width w along a path (the tap). */
const Pipe: React.FC<{d: string; w: number; fill: string}> = ({d, w, fill}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={fill} strokeWidth={w - 6.8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

/** The wall meets the floor here (a flat stage). */
export const FLOOR_Y = 1380;
/** People stand with their feet on this line. */
export const FEET_Y = 1740;
/** Pixels per rig unit for people in these rooms: Dr. Mira about 1197 px tall, Mom 1168, the Kid 789. */
export const PEOPLE_SCALE = 3.2;

type P = [number, number];

// ------------------------------------------------------------------ colours of the rooms (all from the kit palettes)
const K = {
  wall: tint(CLOTH.tan, 0.62), // cream
  tile: tint(CLOTH.sky, 0.55),
  floor: tint(CLOTH.tan, 0.2), // light wood
  base: CLOTH.offwhite,
  unit: tint(CLOTH.olive, 0.56), // pale sage cabinets
  top: tint(CLOTH.grey, 0.45),
  steel: tint(CLOTH.grey, 0.25),
  stove: CLOTH.offwhite,
  glass: tint(CLOTH.charcoal, 0.62),
  sky: tint(CLOTH.sky, 0.35),
  water: CLOTH.sky,
};
const C = {
  wall: tint(CLOTH.sky, 0.62),
  stripe: tint(CLOTH.sky, 0.56), // the same blue a shade deeper: soft tone-on-tone stripes
  floorA: tint(CLOTH.grey, 0.68),
  floorB: tint(CLOTH.grey, 0.78),
  wood: tint(CLOTH.brown, 0.5),
  couch: tint(CLOTH.teal, 0.5),
  frame: tint(CLOTH.grey, 0.3),
  hill: tint(CLOTH.green, 0.35),
  hill2: tint(CLOTH.green, 0.15),
};

// ------------------------------------------------------------------ the kitchen
/**
 * The adult stands on the LEFT (in front of the stove), the Kid on the RIGHT at the sink. Worktop at an
 * adult's hip (y 1140); the units stand forward of the wall, their bases at y 1610.
 */
const KITCHEN = {top: 1140, base: 1610, stoveX0: -10, stoveX1: 300, sinkX: 486, sinkW: 230, tapX: 690, spout: [600, 1052] as P};
export const KitchenRoom: React.FC<{tapOn?: boolean}> = ({tapOn}) => {
  const k = KITCHEN;
  const tileY = 860;
  const cupY = 470, cupH = 230;
  return (
    <Layer>
      {/* wall and floor (flat fields) */}
      <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={K.wall} />
      <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={K.floor} />
      {[1460, 1560, 1680, 1820].map((y) => <path key={y} d={`M 0 ${y} H 1080`} {...faint(shade(K.floor, 0.06))} />)}
      {[[180, 1380, 1460], [620, 1460, 1560], [330, 1560, 1680], [860, 1560, 1680], [120, 1680, 1820], [540, 1680, 1820], [960, 1820, 1920], [400, 1820, 1920]].map(([x, a, b2]) => <path key={`${x}${a}`} d={`M ${x} ${a} V ${b2}`} {...faint(shade(K.floor, 0.06))} />)}
      {/* the band of wall tiles behind the units, edge to edge */}
      <rect x={0} y={tileY} width={1080} height={k.top - tileY} fill={K.tile} />
      {Array.from({length: 4}, (_, i) => <path key={'th' + i} d={`M 0 ${tileY + (i + 1) * 70} H 1080`} {...faint(shade(K.tile, 0.05))} />)}
      {Array.from({length: 15}, (_, i) => <path key={'tv' + i} d={`M ${(i + 1) * 76} ${tileY} V ${k.top}`} {...faint(shade(K.tile, 0.05))} />)}
      <path d={`M 0 ${tileY} H 1080`} {...faint(shade(K.tile, 0.12))} />

      {/* the round window, high on the left, with a city outside */}
      <RoundWindow cx={150} cy={330} r={120} />

      {/* a row of plain wall cupboards on the right, two jars on top */}
      <Shape d={box(600, cupY, 490, cupH)} fill={K.unit} shadow={0}>
        <rect x={600} y={cupY + cupH - 18} width={490} height={18} fill={shade(K.unit, 0.1)} />
      </Shape>
      {[600, 763, 926].map((x, i) => (
        <g key={'cup' + i}>
          <path d={rr(x + 12, cupY + 14, 139, cupH - 44, 6)} {...INLINE} />
          <circle cx={i === 1 ? x + 30 : x + 133} cy={cupY + cupH - 52} r={7} fill={K.steel} {...EDGE_IN} />
        </g>
      ))}
      <path d={`M 763 ${cupY} V ${cupY + cupH} M 926 ${cupY} V ${cupY + cupH}`} {...INLINE} />
      <Jar x={914} y1={cupY} w={70} h={74} lid={CLOTH.red} fill={tint(CLOTH.yellow, 0.35)} />
      <Jar x={996} y1={cupY} w={60} h={60} lid={CLOTH.teal} fill={tint(CLOTH.orange, 0.45)} />

      {/* the stove on the left, with a pot and a tea towel */}
      <Shape d={box(k.stoveX0, k.top + 26, k.stoveX1 - k.stoveX0, k.base - k.top - 26)} fill={K.stove} shadow={0}>
        <rect x={k.stoveX0} y={k.top + 26} width={k.stoveX1 - k.stoveX0} height={60} fill={tint(CLOTH.grey, 0.6)} />
        <rect x={k.stoveX0} y={k.base - 26} width={k.stoveX1 - k.stoveX0} height={26} fill={shade(K.stove, 0.1)} />
      </Shape>
      <path d={`M ${k.stoveX0} ${k.top + 86} H ${k.stoveX1} M ${k.stoveX0} ${k.base - 26} H ${k.stoveX1}`} {...INLINE} />
      {[0, 1, 2, 3].map((i) => <circle key={'knob' + i} cx={k.stoveX0 + 60 + i * 64} cy={k.top + 56} r={12} fill={CLOTH.offwhite} {...EDGE_IN} />)}
      <Shape d={rr(k.stoveX0 + 30, 1270, k.stoveX1 - k.stoveX0 - 56, 280, 10)} fill={tint(CLOTH.grey, 0.7)} shadow={0} line="in" />
      <Shape d={rr(k.stoveX0 + 62, 1316, k.stoveX1 - k.stoveX0 - 120, 168, 8)} fill={K.glass} shadow={0} line="in" />
      <Pipe d={`M ${k.stoveX0 + 46} 1250 H ${k.stoveX1 - 36}`} w={15} fill={K.steel} />
      <Shape d={`M ${k.stoveX0 + 190} 1244 H ${k.stoveX0 + 266} L ${k.stoveX0 + 270} 1396 Q ${k.stoveX0 + 230} 1404 ${k.stoveX0 + 188} 1396 Z`} fill={tint(CLOTH.red, 0.4)} shadow={0.6}>
        <rect x={k.stoveX0 + 170} y={1356} width={120} height={13} fill={CLOTH.offwhite} />
      </Shape>
      <path d={`M ${k.stoveX0 + 184} 1250 Q ${k.stoveX0 + 228} 1263 ${k.stoveX0 + 272} 1250`} {...INLINE} />
      <Shape d={rr(k.stoveX0 - 4, k.top, k.stoveX1 - k.stoveX0 + 4, 28, 4)} fill={tint(CLOTH.charcoal, 0.55)} shadow={0} />
      <Shape d="M 50 1046 H 220 V 1118 Q 220 1140 198 1140 H 72 Q 50 1140 50 1118 Z" fill={K.steel} shadow={0.8} />
      <Shape d={rr(42, 1034, 186, 17, 6)} fill={tint(CLOTH.grey, 0.4)} shadow={0} />
      <Shape d={rr(118, 1016, 34, 20, 6)} fill={CLOTH.charcoal} shadow={0} line="in" />
      <path d="M 50 1072 h -26 M 220 1072 h 26" {...OUTLINE} />

      {/* the counter with the sink, to the right edge */}
      <Shape d={box(k.stoveX1, k.top + 26, 1100 - k.stoveX1, k.base - k.top - 26)} fill={K.unit} shadow={0}>
        <rect x={k.stoveX1} y={k.base - 26} width={800} height={26} fill={shade(K.unit, 0.12)} />
      </Shape>
      <path d={`M ${k.stoveX1} ${k.base - 26} H 1090`} {...INLINE} />
      {[[k.stoveX1 + 10, k.sinkX - k.stoveX1 - 20], [k.sinkX, k.sinkW], [k.sinkX + k.sinkW + 10, 190], [k.sinkX + k.sinkW + 210, 200]].map(([x, w], i) => (
        <g key={'door' + i}>
          <path d={rr(x + 6, i === 1 ? 1310 : k.top + 48, w - 12, k.base - 48 - (i === 1 ? 1310 : k.top + 48), 6)} {...INLINE} />
          <circle cx={x + (i === 0 ? w - 32 : 32)} cy={i === 1 ? 1346 : 1222} r={8} fill={K.steel} {...EDGE_IN} />
        </g>
      ))}
      {/* the sink: a white apron front in the counter, its basin behind the counter edge */}
      <Shape d={rr(k.sinkX, k.top + 20, k.sinkW, 136, 10)} fill={CLOTH.white} shadow={0.6}>
        <path d={`M ${k.sinkX + 18} ${k.top + 44} H ${k.sinkX + k.sinkW - 18}`} {...INLINE} />
      </Shape>
      <Shape d={rr(k.stoveX1, k.top, 800, 28, 4)} fill={K.top} shadow={0} />
      {/* the tap: its column right of the basin, the spout bending back over it */}
      <Pipe d={`M ${k.tapX} ${k.top + 2} V 1000 Q ${k.tapX} 966 ${(k.tapX + k.spout[0]) / 2} 966 Q ${k.spout[0]} 966 ${k.spout[0]} 1000 V ${k.spout[1]}`} w={22} fill={K.steel} />
      <Shape d={rr(k.tapX - 24, k.top - 20, 48, 22, 6)} fill={K.steel} shadow={0} />
      <Shape d={rr(k.tapX + 8, 1078, 34, 16, 5)} fill={K.steel} shadow={0} line="in" />
      {tapOn && <Water x={k.spout[0]} y0={k.spout[1] + 2} y1={k.top + 4} />}
    </Layer>
  );
};

const RoundWindow: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  const id = 'rw' + cx;
  const ri = r - 22;
  const sky = K.sky;
  const b1 = tint(CLOTH.grey, 0.45), b2 = tint(CLOTH.blue, 0.6), b3 = tint(CLOTH.tan, 0.45);
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={CLOTH.offwhite} {...EDGE} />
      <defs><clipPath id={id}><circle cx={cx} cy={cy} r={ri} /></clipPath></defs>
      <circle cx={cx} cy={cy} r={ri} fill={sky} />
      <g clipPath={`url(#${id})`}>
        {/* a plain skyline: a few blocks, the far ones paler */}
        {[[-130, 40, 70, b3], [-62, -20, 54, b1], [-6, 20, 60, b2], [56, -50, 50, b1], [106, 10, 60, b3]].map(([x, y, w, col], i) => (
          <path key={i} d={box(cx + (x as number), cy + (y as number), w as number, 200)} fill={col as string} {...EDGE_IN} />
        ))}
        {[[-48, 0], [-48, 30], [70, -30], [70, 0], [10, 40]].map(([x, y], i) => <rect key={'w' + i} x={cx + x} y={cy + y} width={12} height={14} fill={tint(CLOTH.white, 0)} opacity={0.75} />)}
        <path d={`M ${cx - 70} ${cy - 92} q 14 -16 32 -6 q 14 -14 30 0 q 16 2 12 12 h -74 Z`} fill="#ffffff" {...EDGE_IN} />
      </g>
      {/* the cross bars */}
      <path d={`M ${cx - ri} ${cy} H ${cx + ri} M ${cx} ${cy - ri} V ${cy + ri}`} stroke={INK} strokeWidth={14} />
      <path d={`M ${cx - ri} ${cy} H ${cx + ri} M ${cx} ${cy - ri} V ${cy + ri}`} stroke={CLOTH.offwhite} strokeWidth={14 - 4.4} />
      <circle cx={cx} cy={cy} r={ri} {...INLINE} />
      <circle cx={cx} cy={cy} r={r} {...OUTLINE} />
    </g>
  );
};

const Jar: React.FC<{x: number; y1: number; w: number; h: number; lid: string; fill: string}> = ({x, y1, w, h, lid, fill}) => {
  return (
    <g>
      <Shape d={rr(x, y1 - h, w, h, 14)} fill={fill} />
      <Shape d={rr(x + 6, y1 - h - 16, w - 12, 20, 5)} fill={lid} shadow={0} />
      <path d={rr(x + 14, y1 - h * 0.62, w - 28, h * 0.32, 4)} fill="#ffffff" {...EDGE_IN} />
    </g>
  );
};

/** Running water from a tap: flat light blue with the outline, a little wobble, a splash at the bottom. */
const Water: React.FC<{x: number; y0: number; y1: number}> = ({x, y0, y1}) => {
  const w = 10;
  const d = `M ${x - w} ${y0} C ${x - w - 2} ${y0 + 30} ${x - w + 3} ${y1 - 20} ${x - w - 2} ${y1} H ${x + w + 2} C ${x + w - 3} ${y1 - 20} ${x + w + 2} ${y0 + 30} ${x + w} ${y0} Z`;
  return (
    <g>
      <path d={d} fill={K.water} {...EDGE_IN} />
      <path d={`M ${x - 3} ${y0 + 10} V ${Math.min(y1 - 8, y0 + 34)}`} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />
    </g>
  );
};

// ------------------------------------------------------------------ the doctor's room
/** Dr. Mira stands on the LEFT in front of the desk, the Kid on the RIGHT in front of the couch. */
export const ClinicRoom: React.FC = () => (
  <Layer>
    <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={C.wall} />
    {/* soft vertical stripes, tone on tone */}
    {Array.from({length: 14}, (_, i) => <rect key={'st' + i} x={i * 80 + 40} y={0} width={40} height={FLOOR_Y} fill={C.stripe} />)}
    {/* the checker floor, front-on */}
    <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={C.floorB} />
    {[0, 1, 2, 3, 4, 5].map((row) => {
      const ys = [FLOOR_Y, 1460, 1550, 1650, 1760, 1880, 2000];
      return Array.from({length: 10}, (_, i) => ((i + row) % 2 === 0 ? <rect key={`f${row}-${i}`} x={i * 120 - 60} y={ys[row]} width={120} height={ys[row + 1] - ys[row]} fill={C.floorA} /> : null));
    })}
    <Shape d={box(-10, FLOOR_Y - 24, 1100, 24)} fill={CLOTH.offwhite} shadow={0} line="in" />

    {/* a round wall clock, high on the left (outside the tag zone) */}
    <g>
      <circle cx={104} cy={330} r={74} fill={CLOTH.white} {...EDGE} />
      <circle cx={104} cy={330} r={60} {...INLINE} />
      {[0, 90, 180, 270].map((a) => <path key={a} d="M 104 278 V 290" transform={`rotate(${a} 104 330)`} {...INLINE} />)}
      <path d="M 104 330 V 294 M 104 330 L 128 342" {...OUTLINE} />
      <circle cx={104} cy={330} r={5} fill={INK} />
    </g>

    {/* the wall chart: a body outline */}
    <g transform="translate(400 46)">
      <Shape d={rr(100, 430, 210, 300, 4)} fill="#ffffff" shadow={0.5} />
      <circle cx={205} cy={428} r={7} fill={CLOTH.red} {...EDGE_IN} />
      <circle cx={168} cy={476} r={22} fill={tint(CLOTH.sky, 0.3)} {...EDGE_IN} />
      <path d="M 168 528 Q 140 530 136 560 L 130 626 Q 132 634 140 630 L 148 578 L 150 710 Q 158 716 164 710 L 168 642 L 172 710 Q 178 716 186 710 L 188 578 L 196 630 Q 204 634 206 626 L 200 560 Q 196 530 168 528 Z" fill={tint(CLOTH.sky, 0.3)} {...EDGE_IN} />
      {[490, 530, 570, 610, 650].map((y, i) => <path key={y} d={`M 222 ${y} H ${i % 2 ? 272 : 290}`} {...INLINE} />)}
    </g>

    {/* the arched window on the right, green hills outside */}
    <ArchWindow x={800} y={440} w={226} h={440} />

    {/* the desk on the left, behind the doctor: a small cabinet under it with the first-aid box on top */}
    <g>
      <path d={capsuleV(530, 1214, 1600, 11)} fill={shade(C.wood, 0.08)} {...EDGE_IN} />
      <Shape d={box(-10, 1210, 230, 390)} fill={C.wood} shadow={0.6} />
      <path d="M 105 1240 V 1574" {...INLINE} />
      <path d={rr(4, 1240, 202, 334, 6)} {...INLINE} />
      <circle cx={88} cy={1400} r={7} fill={tint(CLOTH.grey, 0.3)} {...EDGE_IN} />
      <circle cx={122} cy={1400} r={7} fill={tint(CLOTH.grey, 0.3)} {...EDGE_IN} />
      <Shape d={rr(-20, 1184, 580, 32, 5)} fill={shade(C.wood, 0.06)} shadow={0} />
      <Shape d={rr(10, 1092, 132, 92, 8)} fill="#ffffff" />
      <Shape d={rr(52, 1076, 48, 18, 5)} fill={tint(CLOTH.grey, 0.4)} shadow={0} line="in" />
      <path d="M 67 1108 H 85 V 1123 H 100 V 1141 H 85 V 1156 H 67 V 1141 H 52 V 1123 H 67 Z" fill={CLOTH.red} {...EDGE_IN} />
      <Shape d={rr(476, 1112, 56, 72, 6)} fill={tint(CLOTH.teal, 0.45)} />
      <path d="M 490 1112 L 484 1072 M 506 1112 L 510 1066 M 518 1112 L 530 1080" {...OUTLINE} />
    </g>

    {/* the examination couch on the right, behind the Kid */}
    <g>
      {[620, 1020].map((x) => <path key={x} d={capsuleV(x, 1300, 1600, 10)} fill={tint(CLOTH.grey, 0.3)} {...EDGE_IN} />)}
      <Shape d={rr(596, 1300, 450, 44, 6)} fill={tint(CLOTH.grey, 0.4)} shadow={0} />
      <Shape d={rr(576, 1240, 520, 66, 24)} fill={C.couch} />
      <Shape d={box(700, 1242, 220, 62)} fill="#ffffff" shadow={0} line="in" />
      <Shape d={rr(936, 1192, 150, 56, 26)} fill={tint(C.couch, 0.2)} />
      <path d="M 620 1600 h -22 M 1020 1600 h 22" {...OUTLINE} />
    </g>
  </Layer>
);

const capsuleV = (x: number, y0: number, y1: number, r: number) => rr(x - r, y0, 2 * r, y1 - y0, r);

const ArchWindow: React.FC<{x: number; y: number; w: number; h: number}> = ({x, y, w, h}) => {
  const t = 20;
  const outer = `M ${x} ${y + h} V ${y + w / 2} A ${w / 2} ${w / 2} 0 0 1 ${x + w} ${y + w / 2} V ${y + h} Z`;
  const ix = x + t, iw = w - 2 * t, iy = y + t, ih = h - 2 * t;
  const inner = `M ${ix} ${iy + ih} V ${iy + iw / 2} A ${iw / 2} ${iw / 2} 0 0 1 ${ix + iw} ${iy + iw / 2} V ${iy + ih} Z`;
  const id = 'aw' + x;
  const hy = y + h * 0.66;
  return (
    <g>
      <path d={outer} fill={CLOTH.offwhite} {...EDGE} />
      <defs><clipPath id={id}><path d={inner} /></clipPath></defs>
      <path d={inner} fill={tint(CLOTH.sky, 0.4)} />
      <g clipPath={`url(#${id})`}>
        <path d={`M ${ix - 10} ${hy + 30} Q ${ix + iw * 0.35} ${hy - 50} ${ix + iw * 0.8} ${hy + 10} T ${ix + iw + 40} ${hy} V ${y + h + 10} H ${ix - 10} Z`} fill={C.hill2} {...EDGE_IN} />
        <path d={`M ${ix - 10} ${hy + 80} Q ${ix + iw * 0.25} ${hy + 20} ${ix + iw * 0.6} ${hy + 60} T ${ix + iw + 40} ${hy + 50} V ${y + h + 10} H ${ix - 10} Z`} fill={C.hill} {...EDGE_IN} />
        <path d={`M ${ix + iw * 0.18} ${iy + 120} q 12 -14 28 -5 q 14 -12 28 1 q 14 2 10 10 h -66 Z`} fill="#ffffff" {...EDGE_IN} />
      </g>
      <path d={`M ${x + w / 2} ${iy} V ${iy + ih} M ${ix} ${y + h * 0.5} H ${ix + iw}`} stroke={INK} strokeWidth={13} />
      <path d={`M ${x + w / 2} ${iy} V ${iy + ih} M ${ix} ${y + h * 0.5} H ${ix + iw}`} stroke={CLOTH.offwhite} strokeWidth={13 - 4.4} />
      <path d={inner} {...INLINE} />
      <path d={outer} {...OUTLINE} />
      <Shape d={rr(x - 16, y + h - 4, w + 32, 18, 4)} fill={CLOTH.offwhite} shadow={0} />
    </g>
  );
};

// ------------------------------------------------------------------ people in a room
const VIEW: View = 'three-quarter';
type Who = {id: string; pose: PoseIn; expr?: Expr; look?: [number, number]; x: number; y?: number; facing?: Facing; talk?: number; blink?: number; bob?: number};
const Person: React.FC<Who> = (w) => (
  <PersonAt spec={castById(w.id)} view={VIEW} pose={w.pose} expr={w.expr} look={w.look} x={w.x} y={w.y ?? FEET_Y} scale={PEOPLE_SCALE} facing={w.facing} talk={w.talk} blink={w.blink} bob={w.bob} />
);
const place = (w: Who) => ({pose: w.pose, view: VIEW, facing: w.facing, x: w.x, y: w.y ?? FEET_Y, scale: PEOPLE_SCALE, bob: w.bob});
const handsOf = (w: Who) => handAt(castById(w.id), place(w));
const headOf = (w: Who) => headAt(castById(w.id), place(w));
/** A point on the forearm, `px` pixels back from the wrist. */
const onFore = (h: HandPoint, px: number): P => [h.wrist[0] - h.dir[0] * px, h.wrist[1] - h.dir[1] * px];
const angOf = (h: HandPoint) => (Math.atan2(h.dir[1], h.dir[0]) * 180) / Math.PI;

/**
 * A pose over time: a list of [start second, pose, blend seconds]. Before the first step: the first pose.
 * Each step blends from the pose before it (k eased with go, so the hand kind switches quickly).
 */
type Step = [number, PoseName, number?];
const poseAt = (t: number, steps: Step[]): PoseIn => {
  let i = -1;
  for (let j = 0; j < steps.length; j++) if (t >= steps[j][0]) i = j;
  if (i <= 0) return steps[0][1];
  const [t0, b, d = 0.35] = steps[i];
  const k = go(t, t0, d);
  return k >= 1 ? b : {a: steps[i - 1][1], b, k};
};
/** A short dip of the head and chest: a nod (bob goes down and back). */
const nod = (t: number, t0: number, d = 0.36) => { const u = (t - t0) / d; return u <= 0 || u >= 1 ? 0 : -Math.sin(Math.PI * u); };
const clampBob = (v: number) => Math.max(-1, Math.min(1, v));
/** Breathing, a little more while speaking, plus any extra (a nod). */
const breath = (s: ShotNow, who: string, seed: number, extra = 0) => clampBob(0.3 * sway(s.t, 3.4, seed) + (speaking(s, who) ? 0.22 * sway(s.t, 0.9, seed + 2) : 0) + extra);

/** A small red scratch: three short red strokes along the forearm (no outline: a mark on the skin). */
const Scratch: React.FC<{at: P; ang: number}> = ({at, ang}) => (
  <g transform={`translate(${at[0]} ${at[1]}) rotate(${ang})`}>
    {[[-18, -4, 16, -9], [-14, 4, 20, -1], [-7, 10, 11, 7]].map(([x0, y0, x1, y1], i) => <path key={i} d={`M ${x0} ${y0} L ${x1} ${y1}`} stroke={CLOTH.red} strokeWidth={3.4} strokeLinecap="round" />)}
  </g>
);
/** A step stool for the Kid at the sink. */
const StepStool: React.FC<{x: number; top: number}> = ({x, top}) => (
  <Layer>
    <Shape d={rr(x - 110, top, 220, 26, 6)} fill={tint(CLOTH.blue, 0.45)} shadow={0} />
    <path d={`M ${x - 90} ${top + 26} L ${x - 104} ${FEET_Y} M ${x + 90} ${top + 26} L ${x + 104} ${FEET_Y}`} stroke={INK} strokeWidth={18} strokeLinecap="round" />
    <path d={`M ${x - 90} ${top + 26} L ${x - 104} ${FEET_Y} M ${x + 90} ${top + 26} L ${x + 104} ${FEET_Y}`} stroke={tint(CLOTH.blue, 0.3)} strokeWidth={11.2} strokeLinecap="round" />
    <path d={`M ${x - 96} ${top + 80} H ${x + 96}`} stroke={INK} strokeWidth={14} strokeLinecap="round" />
    <path d={`M ${x - 96} ${top + 80} H ${x + 96}`} stroke={tint(CLOTH.blue, 0.3)} strokeWidth={7.2} strokeLinecap="round" />
  </Layer>
);

/** Running water in motion: it grows down from the spout (len 0..1), a flat highlight runs down it. */
const Stream: React.FC<{x: number; y0: number; y1: number; t: number}> = ({x, y0, y1, t}) => {
  if (y1 <= y0 + 2) return null;
  const w = 10;
  const d = `M ${x - w} ${y0} C ${x - w - 2} ${y0 + 30} ${x - w + 3} ${y1 - 20} ${x - w - 2} ${y1} H ${x + w + 2} C ${x + w - 3} ${y1 - 20} ${x + w + 2} ${y0 + 30} ${x + w} ${y0} Z`;
  const span = y1 - y0;
  const hy = y0 + 4 + ((t * 220) % Math.max(1, span));
  const h2 = y0 + 4 + ((t * 220 + span * 0.5) % Math.max(1, span));
  return (
    <g>
      <path d={d} fill={K.water} {...EDGE_IN} />
      {[hy, h2].map((yy, i) => yy + 14 < y1 - 4 && <path key={i} d={`M ${x - 3 + i * 4} ${yy} V ${yy + 14}`} stroke="#ffffff" strokeWidth={3} strokeLinecap="round" />)}
    </g>
  );
};

// ------------------------------------------------------------------ shot C: the kitchen
const C_MOM_X = 230, C_KID_X = 858, C_STOOL = 1600;
const kitchenCast = (s: ShotNow) => {
  const t = s.t;
  const little = since(s, 'C1', 'just'), wash = since(s, 'C2', 'soap'), soap = since(s, 'C2', 'soap'), c3 = since(s, 'C3'), scratchC3 = since(s, 'C3', 'minutes');
  const T = (d: number) => t - d; // the shot second when "since" was d ago
  // the Kid: forearm up, a shrug at "little", then the hand under the tap at "Wash"
  const kidPose = poseAt(t, [[-9, 'showArmUpR'], [T(little), 'shrugR', 0.25], [T(little) + 0.5, 'showArmUpR', 0.35], [T(wash) + 0.15, 'tapHandR', 0.45]]);
  const kidFeel = feel(s, 'kid');
  const kidExpr: Expr = wash >= 0.05 ? 'surprised' : EXPR_OF[kidFeel] ?? 'neutral';
  const kidLook: [number, number] = c3 >= 0.1 ? [0.75, -0.45] : wash >= 0.1 ? [0.45, 0.55] : [0.7, -0.35];
  // "Fifteen MINUTES?!": the Kid jumps on his stool (anticipation dip, up, land, settle)
  const jump = c3 < 0 ? 0 : c3 < 0.12 ? -Math.sin((c3 / 0.12) * Math.PI) * 14 : c3 < 0.62 ? Math.sin(((c3 - 0.12) / 0.5) * Math.PI) * 95 : c3 < 0.8 ? -Math.sin(((c3 - 0.62) / 0.18) * Math.PI) * 10 : 0;
  const kid: Who = {id: 'kid', pose: kidPose, expr: c3 >= 0 && c3 < 1.4 ? 'surprised' : kidExpr, look: kidLook, x: C_KID_X, y: C_STOOL - jump, facing: 'left', talk: talk(s, 'kid'), blink: blink(t, 1.3), bob: breath(s, 'kid', 1)};
  // Mom: looks at the arm, her face falls and her hand goes to her chest; points at the tap; brings the soap
  const momPose = poseAt(t, [[-9, 'rest'], [T(little) - 0.1, 'worried', 0.45], [T(wash), 'worriedPointTap', 0.32], [T(soap) - 0.05, 'pointTapSoap', 0.45]]);
  const momExpr: Expr = little >= 0.05 ? 'worried' : 'neutral';
  const momLook: [number, number] = c3 >= 0.2 ? [0.8, 0.15] : wash >= 0 ? [0.8, 0.45] : [0.8, 0.35];
  const mom: Who = {id: 'mom', pose: momPose, expr: momExpr, look: momLook, x: C_MOM_X, facing: 'right', talk: talk(s, 'mom'), blink: blink(t, 4.1), bob: breath(s, 'mom', 3, 0.9 * nod(t, T(scratchC3)))};
  return {kid, mom, wash, soap, t};
};
const KitchenShot: React.FC<{s: ShotNow}> = ({s}) => {
  const {kid, mom, wash, soap, t} = kitchenCast(s);
  const hk = handsOf(kid).R; // his right arm: the scratch, the tap
  const hm = handsOf(mom).R; // her right (near) hand brings the soap
  const sx = KITCHEN.spout[0], sy = KITCHEN.spout[1] + 2;
  // the water starts once his hand is under the spout, grows down, then keeps running
  const grow = go(t, t - wash + 0.62, 0.22);
  const bottom = KITCHEN.top + 4;
  const yEnd = sy + (bottom - sy) * grow;
  const handTop = hk.palm[1] - 6;
  const onHand = grow > 0 && Math.abs(hk.palm[0] - sx) < 40;
  const soapK = soap < 0 ? 0 : pop(t, t - soap + 0.12, 0.35);
  return (
    <Scene bg={K.wall}>
      <KitchenRoom />
      <Layer><Stream x={sx} y0={sy} y1={yEnd} t={t} /></Layer>
      <StepStool x={C_KID_X} top={C_STOOL} />
      <Person {...kid} />
      <Layer>
        <Scratch at={onFore(hk, 58)} ang={angOf(hk)} />
        {onHand && <Stream x={sx} y0={sy} y1={Math.min(yEnd, handTop)} t={t} />}
        {onHand && yEnd > handTop && [0, 1, 2, 3].map((i) => {
          // drops thrown off the hand, falling into the sink
          const ph = (t * 1.7 + i * 0.27) % 1;
          const dx = (i % 2 ? 1 : -1) * (22 + i * 7) * (0.6 + ph * 0.6);
          return <circle key={i} cx={hk.palm[0] + dx} cy={hk.palm[1] + 4 + ph * 70} r={6 - i * 0.6 - ph * 2} fill={K.water} {...EDGE_IN} />;
        })}
      </Layer>
      <Person {...mom} />
      {soapK > 0 && (
        <>
          <Put x={hm.palm[0]} y={hm.palm[1] - 30 * soapK} size={104 * soapK}><Soap /></Put>
          <Layer>
            {[[34, -70, 9, 0.35], [58, -96, 7, 0.55], [12, -104, 6, 0.75]].map(([dx, dy, r, d0], i) => {
              // bubbles pop out of the soap and burst one after another
              const k = pop(t, t - soap + d0, 0.3) * (1 - go(t, t - soap + d0 + 0.9 + i * 0.2, 0.12));
              const rise = go(t, t - soap + d0, 1.2) * 26;
              return k > 0.02 && <circle key={i} cx={hm.palm[0] + dx} cy={hm.palm[1] + dy - rise} r={r * k} fill={tint(CLOTH.sky, 0.45)} {...EDGE_IN} />;
            })}
          </Layer>
        </>
      )}
    </Scene>
  );
};
/** The stopwatch icon rides on the screen, not in the room: it pops in at "fifteen" and stays. */
const KitchenScreen: React.FC<{s: ShotNow}> = ({s}) => {
  const f = since(s, 'C2', 'fifteen');
  return f < 0 ? null : <IconBadge icon="stopwatch" t={f} x={540} y={330} />;
};
/** v4: the dog with a warning badge on the hard truth ("fatal"), gone when the good news starts; the shield
 * only where the vaccine is named ("shots"). */
const ClinicScreen: React.FC<{s: ShotNow}> = ({s}) => {
  const f = since(s, 'D2', 'fatal');
  const d3 = since(s, 'D3');
  const shots = since(s, 'D3', 'shots');
  return (
    <>
      {f >= 0 && <IconBadge icon="dogWarning" t={f} x={540} y={330} out={d3 > -900 ? f - d3 : undefined} />}
      {shots >= 0 && <IconBadge icon="vaccine" t={shots} x={540} y={330} />}
    </>
  );
};

// ------------------------------------------------------------------ shot D: the clinic
const D_DOC_X = 280, D_KID_X = 860, D_KID_Y = 1730;
const clinicCast = (s: ShotNow) => {
  const t = s.t;
  const T = (d: number) => t - d;
  const right = since(s, 'D1', 'right'), doctorW = since(s, 'D1', 'doctor');
  const d2 = since(s, 'D2'), one = since(s, 'D2', 'hard'), fatal = since(s, 'D2', 'fatal');
  const d3 = since(s, 'D3'), treat = since(s, 'D3', 'shots'), works = since(s, 'D3', 'work'), every = since(s, 'D3', 'every');
  // Dr. Mira: "you see", a nod, "me, the doctor"; one finger up, lowered slowly on "fatal"; the vial, thumbs up
  const docPose = poseAt(t, [[-9, 'youSee'], [T(doctorW) - 0.12, 'meDoctor', 0.35], [T(doctorW) + 0.75, 'youSee', 0.4], [T(one) - 0.22, 'oneFinger', 0.3], [T(fatal), 'rest', 0.9], [T(treat) - 0.2, 'holdVial', 0.4], [T(works), 'thumbsHold', 0.32]]);
  const docExpr: Expr = works >= 0.1 ? 'happy' : d3 >= 0 ? 'talking' : d2 >= 0.05 ? 'neutral' : 'talking';
  const doc: Who = {id: 'doctor', pose: docPose, expr: docExpr, look: [0.7, 0.4], x: D_DOC_X, facing: 'right', talk: talk(s, 'doctor'), blink: blink(t, 2.2), bob: breath(s, 'doctor', 2, 0.9 * nod(t, T(right)))};
  // the Kid: shows his plaster, pulls the arm in at the hard truth, thumbs up at "every"
  const kidPose = poseAt(t, [[-9, 'showArmR'], [T(one) + 0.3, 'armInR', 0.55], [T(every), 'thumbsUpR', 0.35]]);
  const kidExpr: Expr = every >= 0 ? 'happy' : treat >= 0.2 ? 'neutral' : d2 >= 0.4 ? 'worried' : right >= 0.3 ? 'neutral' : 'neutral'; // a listener smiles with open eyes; the shut-eye smile is kept for the thumbs up
  const kidLook: [number, number] = d2 >= 0.4 && treat < 0 ? [0.5, 0.1] : [0.75, -0.6];
  const kid: Who = {id: 'kid', pose: kidPose, expr: kidExpr, look: kidLook, x: D_KID_X, y: D_KID_Y, facing: 'left', talk: talk(s, 'kid'), blink: blink(t, 0.7), bob: breath(s, 'kid', 5)};
  return {doc, kid, treat, t};
};
const ClinicShot: React.FC<{s: ShotNow}> = ({s}) => {
  const {doc, kid, treat, t} = clinicCast(s);
  const hk = handsOf(kid).R;
  const hd = handsOf(doc).R;
  const vialK = treat < 0 ? 0 : pop(t, t - treat + 0.0, 0.35);
  return (
    <Scene bg={C.wall}>
      <ClinicRoom />
      <Person {...kid} />
      <Put x={onFore(hk, 50)[0]} y={onFore(hk, 50)[1]} size={66} rot={angOf(hk) + 28}><Plaster /></Put>
      <Person {...doc} />
      {vialK > 0 && <Put x={hd.palm[0]} y={hd.palm[1] - 38 * vialK} size={110 * vialK}><VaccineVial /></Put>}
    </Scene>
  );
};

// ------------------------------------------------------------------ the shots, as the video plays them
const faceOf = (w: Who) => { const h = headOf(w); return {x: h.x, y: h.y, r: h.r}; };
export const ROOM_SHOTS: Record<string, ShotDef> = {
  C: {Scene: KitchenShot, Screen: KitchenScreen, focus: (who, s) => { const c = kitchenCast(s); return faceOf(who === 'kid' ? c.kid : c.mom); }, portal: (s) => onFore(handsOf(kitchenCast(s).kid).R, 58)},
  D: {Scene: ClinicShot, Screen: ClinicScreen, focus: (who, s) => { const c = clinicCast(s); return faceOf(who === 'kid' ? c.kid : c.doc); }, portal: (s) => onFore(handsOf(clinicCast(s).kid).R, 58)},
};

// ------------------------------------------------------------------ the stills: the same shots at one good moment
/** A stand-in "now" for a still, with the voice's word timings as recorded (seconds from each line's start). */
const line = (id: string, who: string, from: number, to: number, emotion: string, words: [string, number][], react?: Record<string, string>): LineNow => ({
  id, who, text: words.map((w) => w[0]).join(' '), from, to, emotion, react,
  voice: words[words.length - 1][1] + 0.45,
  words: words.map(([w, start], i) => ({w, start, end: (words[i + 1]?.[1] ?? start + 0.42) - 0.02})),
});
const C_LINES: LineNow[] = [
  line('C1', 'kid', 0, 1.9, 'neutral', [["It's", 0], ['just', 0.27], ['a', 0.48], ['little', 0.55], ['scratch,', 0.79], ['Mum.', 1.2]]),
  line('C2', 'mom', 1.9, 4.57, 'scared', [['Wash', 0], ['it', 0.4], ['now.', 0.52], ['Soap', 0.8], ['and', 1.04], ['water,', 1.16], ['fifteen', 1.49], ['minutes.', 1.85]], {kid: 'shocked'}),
  line('C3', 'kid', 4.57, 6.77, 'shocked', [['Fifteen', 0], ['minutes?', 0.41], ['For', 0.81], ['a', 1], ['scratch?', 1.07]]),
];
const D_LINES: LineNow[] = [
  line('D1', 'doctor', 0, 3.87, 'happy', [['Your', 0], ['mum', 0.24], ['was', 0.44], ['right.', 0.61], ['Washing', 1.16], ['first,', 1.63], ['then', 1.97], ['a', 2.17], ['doctor,', 2.24], ['today.', 2.83]], {kid: 'happy'}),
  line('D2', 'doctor', 3.87, 8.47, 'neutral', [['One', 0], ['hard', 0.24], ['truth:', 0.48], ['once', 1.39], ['symptoms', 1.71], ['start,', 2.14], ['it', 2.73], ['is', 2.89], ['almost', 3.02], ['always', 3.37], ['fatal.', 3.75]], {kid: 'scared'}),
  line('D3', 'doctor', 8.47, 12.07, 'happy', [['But', 0], ['act', 0.24], ['in', 0.48], ['time', 0.59], ['and', 0.87], ['treatment', 0.97], ['works', 1.51], ['almost', 1.83], ['every', 2.23], ['time.', 2.5]], {kid: 'happy'}),
];
const nowAt = (id: string, dur: number, lines: LineNow[], t: number): ShotNow => {
  const past = lines.filter((l) => l.from <= t);
  return {id, t, dur, lines, cur: past.length ? past[past.length - 1] : null};
};
export const V8RoomKitchen: React.FC = () => <Scene bg={K.wall}><KitchenRoom /></Scene>;
export const V8RoomClinic: React.FC = () => <Scene bg={C.wall}><ClinicRoom /></Scene>;
/** C1: "It's just a little scratch, Mum." (just after the shrug: Mom's face has fallen) */
export const V8SceneC1: React.FC = () => <KitchenShot s={nowAt('C', 6.77, C_LINES, 1.55)} />;
/** C2: "Wash it now. Soap and water, fifteen minutes." (the water runs, the soap is up, the tag is on) */
export const V8SceneC2: React.FC = () => { const s = nowAt('C', 6.77, C_LINES, 4.2); return <><KitchenShot s={s} /><KitchenScreen s={s} /></>; };
/** D1: "Your mum was right..." */
export const V8SceneD1: React.FC = () => <ClinicShot s={nowAt('D', 12.07, D_LINES, 1.3)} />;
/** D3: "...treatment works almost every time." (both thumbs up) */
export const V8SceneD3: React.FC = () => <ClinicShot s={nowAt('D', 12.07, D_LINES, 11.4)} />;

// =====================================================================================================================
// ENGINE v9 (format 6, 2026-11-23): pale, quiet rooms and tighter two-person framing (decisions 7, 12; A1 #2, #12).
// The rooms above are untouched (videos already out). A format-6 room takes its walls from the kit's ROOM palette
// (saturation 0.22 or less, brightness 165+), keeps at most 5 props, nothing strongly coloured behind a head, and frames
// a two-shot at PEOPLE_SCALE_TWO (a head about 300 px wide; the frame cuts at the knees). Rooms stay unique per video:
// `PaleClinicRoom` takes a wall colour, a floor colour and which wall items to hang, so each video picks its own.
// =====================================================================================================================
/** A two-person shot: heads at least 190 px wide (decision 12). */
export const PEOPLE_SCALE_TWO = 4.0;
/** Feet below the frame: the two-shot cuts at the knees. */
export const FEET_Y_TWO = 2150;
export type PaleRoomOpts = {wall?: keyof typeof ROOM; floor?: string; items?: ('door' | 'frame' | 'chart' | 'clock' | 'plant')[]; floorY?: number};
/** A pale clinic (or any room): a flat wall, a floor line, a door, one or two framed things. Max 5 props. */
export const PaleClinicRoom: React.FC<PaleRoomOpts> = ({wall = 'mint', floor = ROOM.floor, items = ['door', 'frame', 'chart'], floorY = 1500}) => {
  const W = ROOM[wall];
  return (
    <Layer>
      <rect x={-10} y={-10} width={1100} height={1940} fill={W} />
      {/* a soft wainscot band low on the wall, tone on tone */}
      <rect x={-10} y={floorY - 230} width={1100} height={230} fill={shade(W, 0.03)} />
      <path d={`M -10 ${floorY - 230} H 1090`} {...faint(shade(W, 0.1))} />
      <rect x={-10} y={floorY} width={1100} height={1940 - floorY} fill={floor} />
      <Shape d={box(-10, floorY - 18, 1100, 18)} fill={ROOM.trim} shadow={0} line="in" />
      {items.includes('door') && (
        <g>
          <Shape d={rr(770, 520, 300, floorY - 520, 6)} fill={ROOM.cream} shadow={0.4} />
          <path d={rr(800, 560, 240, 380, 4)} {...INLINE} />
          <path d={rr(800, 980, 240, floorY - 1010, 4)} {...INLINE} />
          <circle cx={810} cy={1000} r={11} fill={ROOM.deepest} {...EDGE_IN} />
        </g>
      )}
      {items.includes('frame') && (
        <g>
          <Shape d={rr(60, 300, 250, 190, 6)} fill={ROOM.cream} shadow={0.4} />
          <path d={rr(84, 324, 202, 142, 3)} fill={ROOM.sky} {...EDGE_IN} />
          <path d="M 84 440 Q 150 390 200 420 T 286 410 V 466 H 84 Z" fill={tint(ROOM.deepest, 0.35)} />
        </g>
      )}
      {items.includes('chart') && (
        <g>
          <Shape d={rr(380, 260, 170, 240, 4)} fill="#ffffff" shadow={0.4} />
          {[300, 340, 380, 420, 460].map((y, i) => <path key={y} d={`M 404 ${y} H ${i % 2 ? 500 : 526}`} {...faint(ROOM.deepest)} />)}
        </g>
      )}
      {items.includes('clock') && (
        <g><circle cx={640} cy={300} r={62} fill="#ffffff" {...EDGE} /><path d="M 640 300 V 262 M 640 300 L 664 312" {...OUTLINE} /></g>
      )}
      {items.includes('plant') && (
        <g>
          <Shape d="M 60 1500 L 80 1380 L 200 1380 L 220 1500 Z" fill={ROOM.wood} shadow={0.5} />
          {[[-40, -120], [10, -160], [60, -110]].map(([dx, dy], i) => <Shape key={i} d={`M 140 1380 Q ${140 + dx} ${1380 + dy * 0.6} ${140 + dx * 1.2} ${1380 + dy} Q ${140 + dx * 0.4} ${1380 + dy * 0.7} 140 1380 Z`} fill={tint('#8fae8b', 0.2)} shadow={0} line="in" />)}
        </g>
      )}
    </Layer>
  );
};
/**
 * The pale-room sample (1080 x 1920): Dr. Mira and Dad in a two-shot at PEOPLE_SCALE_TWO, cut at the knees, looking at
 * each other; Dad has a hand on his chest. No caption, no watermark (the player adds them).
 */
export const PaleRoomFull: React.FC = () => {
  const mira = castById('doctor'), dad = castById('dad');
  const m = {pose: 'clipboard' as PoseName, view: VIEW, facing: 'right' as Facing, x: 265, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO};
  const d = {pose: 'worried' as PoseName, view: VIEW, facing: 'left' as Facing, x: 835, y: FEET_Y_TWO, scale: PEOPLE_SCALE_TWO};
  const hm = headAt(mira, m), hd = headAt(dad, d);
  return (
    <V9>
      <Scene bg={ROOM.mint}>
        <PaleClinicRoom wall="mint" items={['door', 'frame', 'chart']} />
        <PersonAt spec={mira} {...m} expr="talking" lookAt={[hd.x, hd.y]} />
        <PersonAt spec={dad} {...d} expr="worried" lookAt={[hm.x, hm.y]} />
      </Scene>
    </V9>
  );
};
