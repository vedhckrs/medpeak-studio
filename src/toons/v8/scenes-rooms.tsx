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
 * tap), handAt (where a pose puts a hand, in frame pixels, so props and marks sit on the hand or the
 * forearm instead of floating).
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, INK, INLINE, OUTLINE, Shape, shade, tint} from './kit';
import {Layer, Put, Scene, Tag} from './scene';
import {castById, PersonAt, POSES, type Expr, type PersonSpec, type PoseName, type View} from './people-rig';
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

// ------------------------------------------------------------------ where a pose puts a hand
type P = [number, number];
/**
 * The wrist and the forearm direction of one arm, in frame pixels, for a person placed with PersonAt
 * (the same arithmetic as the rig's arm, standing poses only). side: 1 = the far arm in a turned view
 * (the person's left, the arm pose `L`), -1 = the near arm (`R`).
 */
export const handAt = (spec: PersonSpec, view: View, pose: PoseName, side: 1 | -1, x: number, y: number, scale: number, flip = false) => {
  const b = spec.build, R = b.R;
  const Ht = b.heads * 2.15 * R;
  const headCY = -Ht + R, chinY = headCY + 1.18 * R, yS = chinY + b.neckLen * R, yC = -b.legFrac * Ht;
  const S = b.shoulder * R, armR0 = 0.17 * R * b.limb;
  const th = view === 'front' ? 0 : view === 'three-quarter' ? Math.PI / 4 : Math.PI / 2;
  const c = Math.cos(th), s = Math.sin(th);
  const proj = (p: [number, number, number]): P => [p[0] * c + p[2] * s, p[1] + 0.1 * (-p[0] * s + p[2] * c)];
  const ap = side === -1 ? POSES[pose].R : POSES[pose].L;
  const nb = (a: number[]): [number, number, number] => { const v = [a[0] * side, a[1], a[2]]; const l = Math.hypot(v[0], v[1], v[2]); return [v[0] / l, v[1] / l, v[2] / l]; };
  const sh: [number, number, number] = [side * (S - armR0 * 1.05), yS + armR0 * 1.1, 0];
  const armLen = (yC + 0.2 * R - (yS + armR0 * 1.1)) * (b.arm ?? 1);
  const u = nb(ap.up), f = nb(ap.fore);
  const e3: [number, number, number] = [sh[0] + u[0] * armLen * 0.52, sh[1] + u[1] * armLen * 0.52, sh[2] + u[2] * armLen * 0.52];
  const w3: [number, number, number] = [e3[0] + f[0] * armLen * 0.5, e3[1] + f[1] * armLen * 0.5, e3[2] + f[2] * armLen * 0.5];
  const m = flip ? -1 : 1;
  const toPx = (p: P): P => [x + m * p[0] * scale, y + p[1] * scale];
  const e = toPx(proj(e3)), w = toPx(proj(w3));
  const handK = (R / 40) * (b.hand ?? 1) * scale;
  const dir: P = [(w[0] - e[0]) / Math.hypot(w[0] - e[0], w[1] - e[1]), (w[1] - e[1]) / Math.hypot(w[0] - e[0], w[1] - e[1])];
  const ang = (Math.atan2(dir[1], dir[0]) * 180) / Math.PI;
  /** the middle of the palm */
  const palm: P = [w[0] + dir[0] * 12 * handK, w[1] + dir[1] * 12 * handK];
  /** a point a fraction t along the forearm, elbow (0) to wrist (1) */
  const fore = (t: number): P => [e[0] + (w[0] - e[0]) * t, e[1] + (w[1] - e[1]) * t];
  return {elbow: e, wrist: w, palm, dir, ang, fore, handK};
};

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
type Who = {id: string; view?: View; pose?: PoseName; expr?: Expr; look?: [number, number]; x: number; y?: number; flip?: boolean};
const Person: React.FC<Who> = ({id, view = 'three-quarter', pose = 'rest', expr = 'neutral', look, x, y = FEET_Y, flip}) => (
  <PersonAt spec={castById(id)} view={view} pose={pose} expr={expr} look={look} x={x} y={y} scale={PEOPLE_SCALE} flip={flip} />
);
const hand = (w: Who, side: 1 | -1) => handAt(castById(w.id), w.view ?? 'three-quarter', w.pose ?? 'rest', side, w.x, w.y ?? FEET_Y, PEOPLE_SCALE, w.flip);

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

// ------------------------------------------------------------------ the stills
// Staging (owner, round 2): the ADULT on the LEFT in the real three-quarter view (never flipped), the
// KID on the RIGHT, flipped to face left (he has no one-sided detail). The Kid's hurt arm is always his
// far arm (side 1): held out in C1, under the tap in C2, with the plaster in D1 and D3.
export const V8RoomKitchen: React.FC = () => <Scene bg={K.wall}><KitchenRoom /></Scene>;
export const V8RoomClinic: React.FC = () => <Scene bg={C.wall}><ClinicRoom /></Scene>;

/** C1: "It's just a little scratch, Mum." The Kid holds up his forearm, relaxed; Mom, worried, points at the scratch without touching. */
export const V8SceneC1: React.FC = () => {
  const kid: Who = {id: 'kid', pose: 'showArmUp', expr: 'talking', look: [0.6, -0.2], x: 880, y: 1700, flip: true};
  const mom: Who = {id: 'mom', pose: 'worriedPoint', expr: 'worried', look: [0.7, 0.5], x: 296};
  const h = hand(kid, 1);
  return (
    <Scene bg={K.wall}>
      <KitchenRoom />
      <Person {...kid} />
      <Layer><Scratch at={h.fore(0.42)} ang={h.ang} /></Layer>
      <Person {...mom} />
    </Scene>
  );
};

/** C2: "Wash it now. Soap and water, fifteen minutes." The Kid's hand under the running tap; Mom brings the soap. */
export const V8SceneC2: React.FC = () => {
  const stoolTop = 1600;
  const kid: Who = {id: 'kid', pose: 'tapHand', expr: 'surprised', look: [0.7, 0.5], x: 858, y: stoolTop, flip: true};
  const mom: Who = {id: 'mom', pose: 'offer', expr: 'talking', look: [0.6, 0.6], x: 198};
  const hm = hand(mom, 1);
  const hk = hand(kid, 1);
  return (
    <Scene bg={K.wall}>
      <KitchenRoom tapOn />
      <StepStool x={858} top={stoolTop} />
      <Person {...kid} />
      {/* the stream lands ON the Kid's hand: drawn again over the hand, with a few splashes */}
      <Layer>
        <Water x={KITCHEN.spout[0]} y0={KITCHEN.spout[1] + 2} y1={hk.palm[1] - 6} />
        {[[-34, -2, 7], [30, -8, 6], [38, 16, 5], [-26, 20, 5]].map(([dx, dy, r], i) => <circle key={i} cx={hk.palm[0] + dx} cy={hk.palm[1] + dy} r={r} fill={K.water} {...EDGE_IN} />)}
      </Layer>
      <Person {...mom} />
      <Put x={hm.palm[0]} y={hm.palm[1] - 30} size={104}><Soap /></Put>
      <Tag x={540} y={330} text="15 minutes" />
    </Scene>
  );
};

/** D1: "Your mum was right. Washing first, then a doctor, today." Dr. Mira explains; the Kid shows his plaster, a little scared. */
export const V8SceneD1: React.FC = () => {
  const kid: Who = {id: 'kid', pose: 'showArm', expr: 'worried', look: [0.6, -0.6], x: 860, y: 1720, flip: true};
  const doc: Who = {id: 'doctor', pose: 'youSee', expr: 'talking', look: [0.6, 0.4], x: 280};
  const h = hand(kid, 1);
  const at = h.fore(0.5);
  return (
    <Scene bg={C.wall}>
      <ClinicRoom />
      <Person {...kid} />
      <Put x={at[0]} y={at[1]} size={66} rot={h.ang + 28}><Plaster /></Put>
      <Person {...doc} />
    </Scene>
  );
};

/** D3: "Act in time and treatment works almost every time." Dr. Mira, thumbs up, holds the vaccine; the Kid, happy, thumbs up. */
export const V8SceneD3: React.FC = () => {
  const kid: Who = {id: 'kid', pose: 'thumbsUp', expr: 'happy', x: 820, flip: true};
  const doc: Who = {id: 'doctor', pose: 'thumbsHold', expr: 'happy', x: 300};
  const hk = hand(kid, 1);
  const hd = hand(doc, -1);
  const at = hk.fore(0.45);
  return (
    <Scene bg={C.wall}>
      <ClinicRoom />
      <Person {...kid} />
      <Put x={at[0]} y={at[1]} size={66} rot={hk.ang + 28}><Plaster /></Put>
      <Person {...doc} />
      <Put x={hd.palm[0]} y={hd.palm[1] - 38} size={110}><VaccineVial /></Put>
    </Scene>
  );
};
