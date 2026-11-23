/**
 * Engine v9 (format 6): ANATOMY STAGES (blueprint Part 4.4; A1 #1, #3, #4, #7; decisions 6-9).
 *
 * A stage is a whole 1080 x 1920 place inside the body, in three planes: the cavity behind, the hero organ with its real
 * neighbours, a cropped near edge. It is built to HOLD 20 s or more while its STATE changes (dials 0..1: tar spreads, a
 * level rises, the airway widens): the story is drawn on the organ, never on a gauge. One warm flesh family (FLESH9);
 * any other colour is kept for the intruder. Faces sit high (above y 800), one eye 120-170 px, out of the caption band
 * (y 1290-1470). Every stage wraps itself in <V9>, so its faces are the v9 eye.
 *
 *   <STAGES.chest.Stage t={s.t} state={{tar: 0.8, cough: k}} faces={{lungR: {mood: 'pain'}, lungL: {mood: 'open', lookAt: [300, 650]}}}>
 *     ...characters and the intruder, placed in frame pixels (slots tell where things enter)...
 *   </STAGES.chest.Stage>
 *
 * Stages: chest (pilot), vesselInside (pilot), tissue, upperBelly, throatSide, skullSide, skinSection.
 */
import React from 'react';
import {
  Acting, Cutaway, EDGE, EDGE_IN, Eyes, FLESH9 as F, Folds, Highlight, INK, INLINE, Lobes, Liquid, Mouth, OUTLINE, Patch, Shape,
  shade, smoothD, openD, Sore, Speckle, Swelling, tint, V9, Wall, Wound, seeded, type Box, type FaceExtras, type V8Props,
} from './kit';
import {OrganArm, type ArmPose, type Gesture} from './organ-act';
import {FrameMove, IDENTITY, useReport} from './play';

type P = [number, number];
export type StageName = 'chest' | 'upperBelly' | 'throatSide' | 'skullSide' | 'vesselInside' | 'tissue' | 'skinSection';
/** A face's acting on a stage: the kit face (mood, mouth, look) plus v9 extras and, for organs with arms, gestures. */
export type StageFace = V8Props & FaceExtras & {lookAt?: [number, number]; armL?: ArmPose | Gesture; armR?: ArmPose | Gesture};
/**
 * `children`: things placed in frame pixels as HTML (Put, PersonAt, Intruder, IconBadge...), over the stage.
 * `layer`: SVG content in frame pixels (a CoEgg, a Patch) drawn inside the stage's own SVG, over the stage.
 */
export type StageProps = {t: number; state?: Record<string, number>; faces?: Record<string, StageFace>; layer?: React.ReactNode; children?: React.ReactNode};
export type Focus = {x: number; y: number; r: number};
export type Slot = {x: number; y: number; dir: [number, number]};
export type StageDef = {
  Stage: React.FC<StageProps>;
  /** every state dial, 0..1, with what it does */
  dials: Record<string, string>;
  /** where intruders enter (frame pixels, and the direction they move in) */
  slots: Record<'top' | 'left' | 'right' | 'bottom' | 'window', Slot>;
  /** each face's centre and eye radius at rest (for gaze and staging) */
  faces: Record<string, Focus>;
  /** boxes nothing of the contents may enter (the faces, padded) */
  faceRoom: Record<string, Box>;
  /** the named structures besides the hero (3 or more) */
  neighbours: string[];
};

// ------------------------------------------------------------------ helpers
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const r2 = (n: number) => Math.round(n * 10) / 10;
const hexRgb = (c: string) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
/** Mix two colours (k = 0 is a, 1 is b). */
export const mix = (a: string, b: string, k: number) => {
  const A = hexRgb(a), B = hexRgb(b), q = clamp01(k);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * q).toString(16).padStart(2, '0')).join('');
};
const dial = (s: Record<string, number> | undefined, k: string, d = 0) => clamp01(s?.[k] ?? d);
/** A band (rib, vessel, duct) along a quadratic curve a -> c -> b, w wide, flat ends: a closed path. */
const bandD = (a: P, c: P, b: P, w: number, w2 = w) => {
  const n = 16, L: P[] = [], R: P[] = [];
  const at = (u: number): P => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
  for (let i = 0; i <= n; i++) {
    const u = i / n, p = at(u), q = at(Math.min(1, u + 0.01)), o = at(Math.max(0, u - 0.01));
    const tx = q[0] - o[0], ty = q[1] - o[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l, ww = (w + (w2 - w) * u) / 2;
    L.push([p[0] + nx * ww, p[1] + ny * ww]); R.push([p[0] - nx * ww, p[1] - ny * ww]);
  }
  return 'M ' + [...L, ...R.reverse()].map((p) => `${r2(p[0])} ${r2(p[1])}`).join(' L ') + ' Z';
};
const qPt = (a: P, c: P, b: P, u: number): P => [(1 - u) ** 2 * a[0] + 2 * (1 - u) * u * c[0] + u * u * b[0], (1 - u) ** 2 * a[1] + 2 * (1 - u) * u * c[1] + u * u * b[1]];
const padBox = (f: Focus, k = 1.6): Box => ({x0: f.x - f.r * 2 * k, y0: f.y - f.r * 1.6 * k, x1: f.x + f.r * 2 * k, y1: f.y + f.r * 2.6 * k});
/** The stage's SVG canvas: 1080 x 1920 in frame pixels, its own <V9>. */
const Canvas: React.FC<{bg: string; layer?: React.ReactNode; kids?: React.ReactNode; children: React.ReactNode}> = ({bg, layer, kids, children}) => (
  <V9>
    <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, overflow: 'hidden'}}>
      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'hidden'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        <rect x={-20} y={-20} width={1120} height={1960} fill={bg} />
        {children}
        {layer}
      </svg>
      {kids}
    </div>
  </V9>
);
/** A stage face: the v9 kit eyes and mouth at a focus, with its acting. Mouth at most 0.6 of one eye wide. */
const Face: React.FC<{at: Focus; f?: StageFace; mouthDy?: number; who?: string}> = ({at, f, mouthDy = 1.75, who}) => {
  if (!f) return null;
  // the layout log: the face belongs to the stage character named by its key (lungR, stomach...), a figure of its own
  return (
    <FrameMove m={IDENTITY} who={who} body={!!who}>
      <Acting lid={f.lid} turn={f.turn} overlap={f.overlap}>
        <Eyes x={at.x} y={at.y} r={at.r} mood={f.mood ?? 'open'} look={f.look} lookAt={f.lookAt} />
        <Mouth x={at.x + (f.turn ?? 0) * at.r * 0.35} y={at.y + at.r * mouthDy} w={at.r * 0.95} kind={f.mouth ?? 'flat'} />
      </Acting>
    </FrameMove>
  );
};
/** Organ arms at stage scale (the cast arm, drawn in a 4x group so its line stays the kit's). */
const StageArm: React.FC<{at: P; s: -1 | 1; pose?: ArmPose | Gesture; fill: string; k?: number}> = ({at, s, pose, fill, k = 4}) => {
  if (!pose) return null;
  return <g transform={`translate(${at[0]} ${at[1]}) scale(${k})`}><OrganArm from={[0, 0]} s={s} pose={pose} fill={fill} /></g>;
};

// ==================================================================== 1. CHEST (pilot)
const CHEST_FACES = {lungR: {x: 290, y: 640, r: 62}, lungL: {x: 800, y: 650, r: 62}};
const LUNG_R: P[] = [[470, 392], [360, 420], [236, 548], [146, 752], [100, 978], [94, 1176], [158, 1286], [298, 1312], [428, 1292], [488, 1222], [500, 1000], [494, 700]];
const LUNG_L: P[] = [[610, 392], [720, 420], [846, 548], [936, 752], [982, 978], [988, 1176], [920, 1286], [782, 1312], [694, 1292], [646, 1250], [664, 1128], [602, 1046], [586, 700]];
export const ChestStage: React.FC<StageProps> = ({t, state, faces, layer, children}) => {
  const tar = dial(state, 'tar'), mucus = dial(state, 'mucus'), airway = dial(state, 'airway', 1), cough = dial(state, 'cough');
  const pink = dial(state, 'pink', 1), cilia = dial(state, 'cilia', 1);
  const lung = mix('#9a8486', F.wall, pink);
  const lungShade = shade(lung, 0.12);
  const sx = 1 - 0.06 * cough, sy = 1 + 0.025 * cough;
  const squeeze = `translate(540 860) scale(${sx.toFixed(4)} ${sy.toFixed(4)}) translate(-540 -860)`;
  const avoid = Object.values(CHEST_FACES).map((f) => padBox(f, 1.3));
  const rnd = seeded(41);
  const patches = Array.from({length: 18}, (_, i) => {
    const left = i % 2 === 0;
    const x = left ? 130 + rnd() * 330 : 640 + rnd() * 320, y = 780 + rnd() * 470;
    return {x, y, r: 34 + rnd() * 46, seed: 50 + i};
  }).filter((p) => !avoid.some((b) => p.x > b.x0 && p.x < b.x1 && p.y > b.y0 && p.y < b.y1));
  const bw = 0.55 + 0.45 * airway; // bronchi width: narrow and swollen when inflamed
  const brL: [P, P, P] = [[536, 600], [450, 640], [356, 770]];
  const brR: [P, P, P] = [[544, 600], [630, 640], [724, 770]];
  const twigs: [P, P, P][] = [[[356, 770], [300, 830], [262, 940]], [[356, 770], [400, 860], [392, 990]], [[724, 770], [780, 830], [818, 940]], [[724, 770], [690, 870], [700, 990]]];
  const hairs = (a: P, c: P, b: P, w: number, n: number, seed: number) => {
    const awake = Math.round(n * cilia);
    return Array.from({length: n}, (_, i) => {
      const u = 0.15 + (0.75 * i) / n, p = qPt(a, c, b, u), q = qPt(a, c, b, u + 0.02);
      const tx = q[0] - p[0], ty = q[1] - p[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
      const up = i < awake;
      // the cilia beat in waves: a 0.9 s wave every 6 s, then they hold (one action, then a hold; the picture can rest)
      const wave = Math.sin(Math.PI * Math.min(1, ((t + seed * 0.3) % 6) / 0.9)) ** 2;
      const sway = up ? Math.sin(t * 7 + i * 0.9 + seed) * 4 * wave : 0;
      const base: P = [p[0] + nx * (w / 2 - 4), p[1] + ny * (w / 2 - 4)];
      const tip: P = up ? [base[0] - nx * 18 + (tx / l) * sway, base[1] - ny * 18 + (ty / l) * sway] : [base[0] + (tx / l) * 14 - nx * 4, base[1] + (ty / l) * 14 - ny * 4];
      return <path key={seed + '-' + i} d={`M ${r2(base[0])} ${r2(base[1])} L ${r2(tip[0])} ${r2(tip[1])}`} stroke={INK} strokeWidth={3.2} strokeLinecap="round" vectorEffect="non-scaling-stroke" />;
    });
  };
  const blobs = (a: P, c: P, b: P, n: number, seed: number) => Array.from({length: n}, (_, i) => {
    const p = qPt(a, c, b, 0.2 + (0.7 * (i + 0.5)) / Math.max(1, n));
    const r = 9 + ((seed * 7 + i * 13) % 7);
    return <ellipse key={seed + 'm' + i} cx={r2(p[0])} cy={r2(p[1])} rx={r} ry={r * 0.8} fill={F.bile} {...EDGE_IN} />;
  });
  return (
    <Canvas bg={F.cavity} layer={layer} kids={children}>
      {/* the back: the apex hollows at the top corners and the ribs behind the lungs */}
      <path d="M -20 -20 L 400 -20 Q 380 150 250 210 Q 120 262 -20 262 Z" fill={F.cavityDeep} {...EDGE} />
      <path d="M 1100 -20 L 680 -20 Q 700 150 830 210 Q 960 262 1100 262 Z" fill={F.cavityDeep} {...EDGE} />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={i}>
          <path d={bandD([-30, 330 + i * 200], [200, 290 + i * 200], [420, 430 + i * 205], 42, 30)} fill={F.bone} {...EDGE} />
          <path d={bandD([1110, 330 + i * 200], [880, 290 + i * 200], [660, 430 + i * 205], 42, 30)} fill={F.bone} {...EDGE} />
        </g>
      ))}
      {/* the heart, peeking between the lungs, and the aorta arching up behind the windpipe */}
      <path d={bandD([560, 980], [600, 760], [470, 690], 62, 56)} fill={F.organRed} {...EDGE} />
      <Shape d={smoothD([[520, 960], [640, 930], [720, 1020], [700, 1180], [600, 1290], [470, 1250], [430, 1120], [450, 1000]])} fill={F.organRed} shadow={1.4}>
        <path d="M 560 960 Q 600 1100 660 1240" {...INLINE} />
        <Highlight x={520} y={1010} w={50} rot={-30} />
      </Shape>
      {/* the lungs (state: colour, tar patches, the cough squeeze) */}
      <g transform={squeeze}>
        <Shape d={smoothD(LUNG_R)} fill={lung} shadow={2}>
          <path d="M 120 830 Q 300 812 488 808" {...INLINE} />
          <path d="M 150 880 Q 320 1060 430 1290" {...INLINE} />
          <Folds box={{x0: 110, y0: 440, x1: 480, y1: 1280}} seed={3} density={0.55} avoid={avoid} clip={smoothD(LUNG_R)} len={[40, 90]} angle={60} opacity={0.6} />
          {patches.filter((p) => p.x < 540).map((p, i) => <Patch key={i} x={p.x} y={p.y} r={p.r * (0.4 + 0.6 * tar)} seed={p.seed} k={tar} color="#3d2b28" />)}
          <Highlight x={210} y={600} w={70} rot={-55} />
        </Shape>
        <Shape d={smoothD(LUNG_L)} fill={lung} shadow={2}>
          <path d="M 960 820 Q 800 1000 700 1270" {...INLINE} />
          <Folds box={{x0: 600, y0: 440, x1: 980, y1: 1280}} seed={9} density={0.55} avoid={avoid} clip={smoothD(LUNG_L)} len={[40, 90]} angle={120} opacity={0.6} />
          {patches.filter((p) => p.x >= 540).map((p, i) => <Patch key={i} x={p.x} y={p.y} r={p.r * (0.4 + 0.6 * tar)} seed={p.seed} k={tar} color="#3d2b28" />)}
        </Shape>
        <path d={smoothD(LUNG_R)} fill="none" stroke={lungShade} strokeWidth={0} />
      </g>
      {/* the windpipe with its rings, splitting into the bronchi (state: width, mucus, the cilia sweepers) */}
      {twigs.map(([a, c, b], i) => <Wall key={i} d={bandD(a, c, b, 40 * bw, 26 * bw)} fill="#efc9c3" rim={7}>{null}</Wall>)}
      <Wall d={bandD(...brL, 78 * bw, 58 * bw)} fill="#f2d4cc" rim={12} />
      <Wall d={bandD(...brR, 78 * bw, 58 * bw)} fill="#f2d4cc" rim={12} />
      {hairs(...brL, 78 * bw, 9, 1)}{hairs(...brR, 78 * bw, 9, 2)}
      {mucus > 0.02 && <>{blobs(...brL, Math.round(mucus * 5), 3)}{blobs(...brR, Math.round(mucus * 5), 7)}</>}
      <Shape d="M 482 -30 L 598 -30 L 600 590 Q 540 630 480 590 Z" fill="#f2d4cc" shadow={0.8}>
        {Array.from({length: 13}, (_, i) => <path key={i} d={`M 482 ${10 + i * 46} Q 540 ${30 + i * 46} 600 ${10 + i * 46}`} stroke={shade('#f2d4cc', 0.16)} strokeWidth={14} fill="none" />)}
        {Array.from({length: 13}, (_, i) => <path key={'l' + i} d={`M 482 ${17 + i * 46} Q 540 ${37 + i * 46} 600 ${17 + i * 46}`} {...INLINE} />)}
      </Shape>
      {/* the diaphragm under the lungs, the liver and stomach below it */}
      <Shape d="M -30 1330 Q 270 1180 540 1300 Q 810 1180 1110 1330 L 1110 1470 Q 540 1390 -30 1470 Z" fill="#b95660" shadow={1}>
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${-20 + i * 140} 1260 Q ${40 + i * 140} 1380 ${10 + i * 140} 1480`} {...INLINE} />)}
      </Shape>
      <Shape d={smoothD([[-40, 1480], [300, 1440], [560, 1520], [600, 1700], [480, 1960], [-40, 1960]])} fill="#8f3a42" shadow={2}>
        <Folds box={{x0: 0, y0: 1560, x1: 540, y1: 1900}} seed={45} density={0.5} len={[80, 160]} angle={10} opacity={0.7} />
        <Highlight x={180} y={1540} w={90} rot={-8} />
      </Shape>
      <Shape d={smoothD([[640, 1520], [860, 1450], [1120, 1480], [1120, 1960], [700, 1960], [600, 1760]])} fill={F.gut} shadow={1.5}>
        <Folds box={{x0: 660, y0: 1540, x1: 1080, y1: 1900}} seed={47} density={0.6} len={[70, 140]} angle={-20} opacity={0.7} />
      </Shape>
      {/* the faces, high on each lung */}
      <g transform={squeeze}>
        <StageArm at={[120, 980]} s={-1} pose={faces?.lungR?.armR} fill={lung} />
        <StageArm at={[966, 990]} s={1} pose={faces?.lungL?.armL} fill={lung} />
        <Face who="lungR" at={CHEST_FACES.lungR} f={faces?.lungR} />
        <Face who="lungL" at={CHEST_FACES.lungL} f={faces?.lungL} />
      </g>
    </Canvas>
  );
};

// ==================================================================== 2. VESSEL INSIDE (pilot)
const FLOOR_Y = 1240;
/** A red cell seen from the side (no face): a flat disc with a dimple. */
export const RedDisc: React.FC<{x: number; y: number; w: number; c: string; rot?: number}> = ({x, y, w, c, rot = 0}) => (
  <g transform={`translate(${r2(x)} ${r2(y)}) rotate(${rot})`}>
    <path d={`M ${-w / 2} 0 Q ${-w / 2} ${-w * 0.24} 0 ${-w * 0.16} Q ${w / 2} ${-w * 0.24} ${w / 2} 0 Q ${w / 2} ${w * 0.24} 0 ${w * 0.16} Q ${-w / 2} ${w * 0.24} ${-w / 2} 0 Z`} fill={c} {...EDGE} />
    <path d={`M ${-w * 0.22} ${-w * 0.02} Q 0 ${w * 0.06} ${w * 0.22} ${-w * 0.02}`} {...INLINE} />
  </g>
);
/** The carbon-monoxide rider: a small grey egg (the intruder colour) with its name on a band (decision 13). */
export const CoEgg: React.FC<{x: number; y: number; s?: number; face?: StageFace}> = ({x, y, s = 1, face}) => (
  <g transform={`translate(${r2(x)} ${r2(y)}) scale(${s})`}>
    <Shape d={smoothD([[0, -62], [38, -44], [48, 4], [34, 46], [0, 58], [-34, 46], [-48, 4], [-38, -44]])} fill="#8e98a8" shadow={1}>
      <Highlight x={-18} y={-34} w={22} rot={-40} />
    </Shape>
    <path d="M -48 18 Q 0 34 48 18 L 47 38 Q 0 54 -47 38 Z" fill="#fbf4e4" {...EDGE_IN} />
    <text x={0} y={41} textAnchor="middle" fontFamily="'Poppins', sans-serif" fontWeight={900} fontSize={17} fill={INK}>CO</text>
    {face && <Face at={{x: 0, y: -14, r: 15}} f={face} mouthDy={1.2} />}
  </g>
);
export const VesselStage: React.FC<StageProps> = ({t, state, faces, layer, children}) => {
  const flow = dial(state, 'flow', 1), co = dial(state, 'co'), pink = dial(state, 'pink', 1);
  const plasma = mix('#b97f86', '#e89a9a', pink);
  const cell = mix('#9c4a5a', '#d9434f', pink);
  const wall = mix('#b86d74', F.wall, pink);
  // a few cells in a band (decision 19: 5% of the frame at most), moving with the flow
  const band = {y0: 690, y1: 790};
  const speed = 140 * (0.3 + 0.7 * flow);
  const cells = Array.from({length: 7}, (_, i) => {
    const x = ((i * 190 + t * speed) % 1330) - 120;
    const y = band.y0 + ((i * 37) % (band.y1 - band.y0));
    return {x, y, i};
  });
  return (
    <Canvas bg={plasma} layer={layer} kids={children}>
      {/* the far wall: one soft lighter centre (decision 8 c), then faint far cells */}
      <defs><radialGradient id="vs-far" cx="50%" cy="42%" r="55%"><stop offset="0%" stopColor={tint(plasma, 0.35)} /><stop offset="100%" stopColor={plasma} /></radialGradient></defs>
      <rect x={0} y={0} width={1080} height={1920} fill="url(#vs-far)" />
      <Folds box={{x0: 40, y0: 420, x1: 1040, y1: 1160}} seed={17} density={0.18} color={shade(plasma, 0.16)} len={[120, 220]} angle={0} />
      {/* the ceiling: the vessel wall from inside, rim band and folds */}
      <Wall d="M -40 -40 L 1120 -40 L 1120 300 Q 820 380 540 350 Q 260 330 -40 390 Z" fill={wall} rim={22}>
        {Array.from({length: 7}, (_, i) => {
          const r = seeded(71 + i);
          const x = 60 + ((i * 163) % 980), y = 70 + ((i * 89) % 200), rx = 110 + r() * 90, ry = 34 + r() * 26;
          return <ellipse key={'m' + i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? shade(wall, 0.07) : tint(wall, 0.08)} transform={`rotate(${(r() - 0.5) * 12} ${x} ${y})`} />;
        })}
        <Folds box={{x0: 0, y0: 40, x1: 1080, y1: 290}} seed={21} density={0.55} color={shade(wall, 0.35)} len={[110, 200]} angle={6} />
      </Wall>
      {/* the flow: a few cells in one band */}
      {cells.map((c) => <g key={c.i}><RedDisc x={c.x} y={c.y} w={92} c={cell} rot={(c.i * 23) % 40 - 20} />{co > 0.02 && c.i % 2 === 0 && <CoEgg x={c.x + 4} y={c.y - 46} s={0.62 * clamp01(co * 1.4)} />}</g>)}
      {/* the floor the characters stand on, a lighter top edge */}
      <Wall d={`M -40 ${FLOOR_Y + 20} Q 300 ${FLOOR_Y - 30} 600 ${FLOOR_Y} Q 860 ${FLOOR_Y + 24} 1120 ${FLOOR_Y - 10} L 1120 1960 L -40 1960 Z`} fill={wall} rim={18}>
        {/* tissue mottling: soft tonal patches in the wall's own family, so the floor is tissue, not one flat field (check C7) */}
        {Array.from({length: 11}, (_, i) => {
          const r = seeded(91 + i);
          const x = 40 + ((i * 197) % 1000), y = FLOOR_Y + 170 + ((i * 131) % 560), rx = 120 + r() * 110, ry = 50 + r() * 40;
          return <ellipse key={'m' + i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? shade(wall, 0.07) : tint(wall, 0.08)} transform={`rotate(${(r() - 0.5) * 14} ${x} ${y})`} />;
        })}
        <Folds box={{x0: 0, y0: FLOOR_Y + 140, x1: 1080, y1: 1900}} seed={23} density={0.7} color={shade(wall, 0.35)} len={[120, 220]} angle={-4} />
      </Wall>
      <path d={`M -40 ${FLOOR_Y + 44} Q 300 ${FLOOR_Y - 6} 600 ${FLOOR_Y + 24} Q 860 ${FLOOR_Y + 48} 1120 ${FLOOR_Y + 14}`} stroke={tint(wall, 0.45)} strokeWidth={10} fill="none" />
      {/* a branch opening in the far wall (the slot the intruder comes through) */}
      <ellipse cx={890} cy={520} rx={90} ry={130} fill={shade(plasma, 0.3)} {...EDGE} />
      <ellipse cx={898} cy={530} rx={64} ry={104} fill={shade(plasma, 0.45)} />
      {faces?.cell && <g><RedDisc x={300} y={1080} w={300} c={cell} /><Face who="cell" at={{x: 300, y: 1050, r: 36}} f={faces.cell} mouthDy={1.4} /></g>}
    </Canvas>
  );
};

// ==================================================================== 3. TISSUE (a floor for cells and germs)
const T_FLOOR = 1230;
export const TissueStage: React.FC<StageProps> = ({t, state, layer, children}) => {
  const damage = dial(state, 'damage'), swelling = dial(state, 'swelling');
  const wall = F.wall, deep = F.cavity;
  void t;
  return (
    <Canvas bg={deep} layer={layer} kids={children}>
      {/* far background: faint blurred pale vessels (decision 8 c, the one soft layer) */}
      <defs><filter id="ts-blur" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="9" /></filter></defs>
      <g filter="url(#ts-blur)" opacity={0.45}>
        {[[[-20, 420], [300, 520], [620, 440]], [[460, 700], [760, 620], [1100, 720]], [[-20, 900], [400, 980], [800, 860]]].map((p, i) => <path key={i} d={openD(p as P[])} stroke={tint(deep, 0.4)} strokeWidth={36} fill="none" strokeLinecap="round" />)}
      </g>
      {/* the folded curtain wall */}
      <Shape d="M -40 230 Q 540 300 1120 230 L 1120 1260 L -40 1260 Z" fill={wall} shadow={0} line="none">
        {Array.from({length: 9}, (_, i) => <path key={i} d={`M ${60 + i * 120} 260 C ${30 + i * 120} 560 ${110 + i * 120} 860 ${70 + i * 120} 1240`} stroke={shade(wall, 0.1)} strokeWidth={22} fill="none" />)}
        {/* the 9 long fold lines are the shot's main lines: a mid weight, so the picture reads 4 px+ (check C6; at IN it read 3 px) */}
        {Array.from({length: 9}, (_, i) => <path key={'l' + i} d={`M ${60 + i * 120} 260 C ${30 + i * 120} 560 ${110 + i * 120} 860 ${70 + i * 120} 1240`} {...INLINE} strokeWidth={4.4} />)}
        {Array.from({length: 4}, (_, i) => <Patch key={'d' + i} x={180 + i * 240} y={560 + (i % 2) * 260} r={70} seed={80 + i} k={damage} color="#6e3a3c" />)}
      </Shape>
      {/* the ceiling band with a scalloped lower edge */}
      <Shape d={`M -40 -40 L 1120 -40 L 1120 230 ${Array.from({length: 8}, (_, i) => `Q ${1050 - i * 145} 330 ${980 - i * 145} 240`).join(' ')} L -40 240 Z`} fill={F.organRed} shadow={1.2}>
        <Folds box={{x0: 0, y0: 30, x1: 1080, y1: 200}} seed={11} density={0.6} color={shade(F.organRed, 0.35)} len={[90, 160]} />
      </Shape>
      {/* the floor, its lighter top edge */}
      <Shape d={`M -40 ${T_FLOOR} Q 540 ${T_FLOOR - 50} 1120 ${T_FLOOR} L 1120 1960 L -40 1960 Z`} fill={F.gut} shadow={0}>
        <path d={`M -40 ${T_FLOOR + 14} Q 540 ${T_FLOOR - 36} 1120 ${T_FLOOR + 14}`} stroke={tint(F.gut, 0.4)} strokeWidth={22} fill="none" />
        {/* tissue mottling, as on the vessel floor (bee-sting, 2026-11-23: the plain floor was one 25% flat field, check C7) */}
        {Array.from({length: 16}, (_, i) => {
          const r = seeded(131 + i);
          const x = 40 + ((i * 173) % 1000), y = T_FLOOR + 90 + ((i * 97) % 620), rx = 130 + r() * 110, ry = 50 + r() * 40;
          return <ellipse key={'m' + i} cx={x} cy={y} rx={rx} ry={ry} fill={i % 2 ? shade(F.gut, 0.07) : tint(F.gut, 0.08)} transform={`rotate(${(r() - 0.5) * 12} ${x} ${y})`} />;
        })}
        <Folds box={{x0: 0, y0: T_FLOOR + 120, x1: 1080, y1: 1900}} seed={13} density={0.7} color={shade(F.gut, 0.35)} len={[120, 220]} angle={-3} />
        {damage > 0.05 && [[220, 1500], [760, 1620]].map(([x, y], i) => <Sore key={i} x={x} y={y} r={26 + 20 * damage} />)}
      </Shape>
      {swelling > 0.01 && <Swelling x={540} y={900} r={460} k={swelling} />}
    </Canvas>
  );
};

// ==================================================================== 4. UPPER BELLY
const BELLY_FACE = {x: 650, y: 690, r: 62};
const STOMACH: P[] = [[480, 450], [610, 395], [790, 415], [930, 520], [1000, 700], [990, 910], [915, 1085], [780, 1205], [590, 1262], [390, 1258], [230, 1205], [130, 1120], [150, 1040], [280, 1040], [400, 990], [470, 870], [480, 680]];
export const BellyStage: React.FC<StageProps> = ({t, state, faces, layer, children}) => {
  const fill = dial(state, 'fill', 0.4), contents = dial(state, 'contents'), acid = dial(state, 'acid'), gas = dial(state, 'gas');
  const damage = dial(state, 'damage'), cut = dial(state, 'cut', 1);
  const body = smoothD(STOMACH);
  const liquidC = mix('#f2b48a', '#f08a3c', acid);
  // the cut window in the lower stomach (grows with `cut`)
  const win = smoothD([[330, 1140], [470, 1040], [660, 1010], [860, 1040], [910, 1120], [790, 1200], [580, 1232], [400, 1210]].map(([x, y]) => [620 + (x - 620) * (0.4 + 0.6 * cut), 1120 + (y - 1120) * (0.4 + 0.6 * cut)] as P));
  const foods = Math.round(contents * 4);
  return (
    <Canvas bg={F.cavity} layer={layer} kids={children}>
      {/* the liver, big and dark behind, top left; the spleen edge right */}
      <Shape d={smoothD([[-60, -40], [700, -40], [780, 120], [640, 330], [420, 420], [180, 520], [-60, 560]])} fill={F.organRed} shadow={2}>
        <Folds box={{x0: 0, y0: 40, x1: 640, y1: 420}} seed={31} density={0.5} len={[80, 150]} angle={20} />
        <Highlight x={220} y={150} w={110} rot={-12} />
      </Shape>
      <Shape d={smoothD([[1120, 260], [1000, 300], [960, 430], [1010, 560], [1120, 600]])} fill="#9c4a5a" shadow={1} />
      {/* the food pipe coming down, the bile duct beside it */}
      <path d={bandD([380, -40], [420, 260], [520, 470], 26, 26)} fill={F.bile} {...EDGE} />
      <Wall d={bandD([560, -40], [560, 250], [600, 470], 120, 130)} fill={F.wall} rim={18} />
      {/* the gut below, lobed, two tones */}
      <Lobes points={[[-40, 1500], [300, 1460], [620, 1520], [1120, 1460]]} w={170} tones={[F.gut, tint(F.gut, 0.18)]} seed={4} />
      <Lobes points={[[-40, 1760], [360, 1720], [760, 1780], [1120, 1740]]} w={190} tones={[shade(F.gut, 0.06), F.gut]} seed={6} />
      <Lobes points={[[-40, 1960], [540, 1940], [1120, 1960]]} w={200} tones={[F.gut, tint(F.gut, 0.12)]} seed={8} />
      {/* the stomach: its wall, a cut window with the contents and the liquid */}
      <Wall d={body} fill={F.wall} rim={22}>
        <Folds box={{x0: 500, y0: 450, x1: 960, y1: 950}} seed={33} density={0.45} avoid={[padBox(BELLY_FACE, 1.1)]} len={[60, 120]} angle={-10} opacity={0.7} />
        {damage > 0.02 && [[820, 860], [560, 940], [880, 700]].map(([x, y], i) => <Sore key={i} x={x} y={y} r={14 + 16 * damage} />)}
        <Highlight x={600} y={490} w={120} rot={-8} />
      </Wall>
      {cut > 0.02 && (
        <Cutaway d={win} fill={F.wall} inside={F.wallRim}>
          {Array.from({length: foods}, (_, i) => <FoodBit key={i} kind={(['burger', 'egg', 'bread', 'drum'] as const)[i % 4]} x={460 + i * 125} y={1150 - (i % 2) * 40} s={0.95} />)}
          <Liquid clip={win} box={{x0: 320, y0: 1000, x1: 920, y1: 1240}} level={fill} color={liquidC} t={t} />
          {gas > 0.02 && Array.from({length: 6}, (_, i) => <circle key={i} cx={440 + i * 80} cy={1040 + ((i * 53 + t * 40) % 160) * -0.4 + 150 * (1 - fill)} r={12 + (i % 3) * 6} fill="#b6c98a" opacity={0.7 * gas} {...EDGE_IN} />)}
        </Cutaway>
      )}
      <StageArm at={[995, 760]} s={1} pose={faces?.stomach?.armR} fill={F.wall} />
      <StageArm at={[480, 820]} s={-1} pose={faces?.stomach?.armL} fill={F.wall} />
      <Face who="stomach" at={BELLY_FACE} f={faces?.stomach} />
    </Canvas>
  );
};
/** Food inside a stomach (cut window), simple and flat. */
export const FoodBit: React.FC<{kind: 'burger' | 'egg' | 'bread' | 'drum'; x: number; y: number; s?: number}> = ({kind, x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {kind === 'burger' && <>
      <path d="M -50 0 Q -50 -42 0 -44 Q 50 -42 50 0 Z" fill="#e0a45e" {...EDGE} />
      <path d="M -54 2 Q -20 14 0 4 Q 26 16 54 2 L 52 12 L -52 12 Z" fill="#7fae5a" {...EDGE_IN} />
      <rect x={-50} y={12} width={100} height={14} rx={6} fill="#8a4a35" {...EDGE_IN} />
      <path d="M -50 28 L 50 28 Q 48 46 0 46 Q -48 46 -50 28 Z" fill="#e0a45e" {...EDGE} />
    </>}
    {kind === 'egg' && <>
      <path d={smoothD([[-46, -6], [-28, -32], [8, -30], [44, -18], [48, 12], [20, 30], [-20, 28], [-48, 18]])} fill="#fbf4e4" {...EDGE} />
      <circle cx={2} cy={-2} r={16} fill="#f2c24e" {...EDGE_IN} />
    </>}
    {kind === 'bread' && <path d={smoothD([[-44, -30], [0, -44], [44, -30], [40, 30], [-40, 30]])} fill="#e9c58a" {...EDGE} />}
    {kind === 'drum' && <>
      <path d={smoothD([[-40, -20], [0, -36], [30, -16], [20, 20], [-28, 22]])} fill="#b8743f" {...EDGE} />
      <path d="M 24 2 L 56 14" stroke={INK} strokeWidth={16} strokeLinecap="round" /><path d="M 24 2 L 56 14" stroke="#fbf4e4" strokeWidth={9} strokeLinecap="round" />
    </>}
  </g>
);

// ==================================================================== 5. THROAT, SIDE CUT
const TONGUE_FACE = {x: 720, y: 690, r: 60};
export const ThroatStage: React.FC<StageProps> = ({t, state, faces, layer, children}) => {
  const stuck = dial(state, 'stuck'), sore = dial(state, 'sore'), swallow = dial(state, 'swallow');
  void t;
  const lift = swallow * 60;
  const tongue = smoothD([[330, 1000], [360, 760], [470, 560], [680, 500 - lift], [900, 540 - lift], [1010, 640], [1030, 820], [960, 940], [760, 1000], [520, 1040]]);
  return (
    <Canvas bg={F.cavity} layer={layer} kids={children}>
      {/* the spine: a column of bones with discs, at the back (left) */}
      {Array.from({length: 9}, (_, i) => (
        <g key={i}>
          <Shape d={`M 40 ${300 + i * 190} L 210 ${310 + i * 190} Q 232 ${380 + i * 190} 210 ${450 + i * 190} L 40 ${460 + i * 190} Q 20 ${380 + i * 190} 40 ${300 + i * 190} Z`} fill={F.bone} shadow={1}>
            <Speckle box={{x0: 40, y0: 310 + i * 190, x1: 210, y1: 450 + i * 190}} seed={90 + i} n={8} color={shade(F.bone, 0.12)} />
          </Shape>
          <rect x={46} y={462 + i * 190} width={160} height={26} rx={10} fill="#e7b9a6" {...EDGE_IN} />
        </g>
      ))}
      {/* the back of the throat (pharynx) wall, then the food pipe (behind) and the windpipe (front) going down */}
      <Wall d={smoothD([[240, 300], [330, 320], [340, 900], [300, 1960], [240, 1960]])} fill={F.wall} rim={14} />
      <Wall d={`M 260 960 Q 330 1000 420 980 L 430 1960 L 270 1960 Z`} fill={F.wall} rim={18}>
        {stuck > 0.02 && <g transform={`translate(345 ${r2(1060 + (1 - stuck) * 300)}) rotate(80)`}><rect x={-46} y={-22} width={92} height={44} rx={22} fill="#fbfbf6" {...EDGE} /><path d="M 0 -22 L 0 22" {...INLINE} /></g>}
      </Wall>
      <Shape d="M 470 1040 Q 560 1000 650 1040 L 660 1960 L 470 1960 Z" fill="#f2d4cc" shadow={0.8}>
        {Array.from({length: 18}, (_, i) => <path key={i} d={`M 468 ${1080 + i * 50} Q 565 ${1100 + i * 50} 662 ${1080 + i * 50}`} {...INLINE} />)}
      </Shape>
      {/* the epiglottis: a flap over the windpipe, closed while swallowing */}
      <g transform={`rotate(${r2(-10 - 55 * swallow)} 470 1000)`}><path d="M 470 1000 Q 500 880 560 860 Q 560 930 490 1010 Z" fill={tint(F.wall, 0.2)} {...EDGE} /></g>
      {/* the palate (hard, pale bone, then soft) and the nose space above */}
      <Shape d="M 300 -40 L 1120 -40 L 1120 380 Q 800 420 560 400 Q 420 390 330 470 Q 300 300 300 -40 Z" fill={F.cavityDeep} shadow={0} />
      <path d={bandD([1120, 400], [760, 430], [520, 410], 70, 60)} fill={F.bone} {...EDGE} />
      <Wall d={bandD([540, 410], [400, 400], [330, 520], 70, 50)} fill={F.wall} rim={10} />
      {/* the floor of the mouth and the lower jaw bone under the tongue, the teeth and a lip at the front (right edge) */}
      <Shape d="M 420 1010 Q 700 1080 1120 1000 L 1120 1180 Q 760 1220 440 1140 Z" fill={F.gutShade} shadow={0} />
      <path d={bandD([480, 1150], [800, 1210], [1120, 1140], 70, 80)} fill={F.bone} {...EDGE} />
      {[0, 1, 2].map((i) => <path key={i} d={`M ${952 + i * 44} 432 l 38 0 l -3 92 q -16 16 -32 0 Z`} fill="#fbf7ef" {...EDGE_IN} />)}
      {[0, 1, 2].map((i) => <path key={'b' + i} d={`M ${940 + i * 44} 1060 l 38 0 l -3 -86 q -16 -16 -32 0 Z`} fill="#fbf7ef" {...EDGE_IN} />)}
      <path d="M 1120 300 Q 1080 380 1084 440 L 1120 440 Z" fill={F.wallRim} {...EDGE} />
      <path d="M 1120 1180 Q 1080 1120 1084 1060 L 1120 1060 Z" fill={F.wallRim} {...EDGE} />
      {/* the tongue: the hero */}
      <Shape d={tongue} fill={F.wall} shadow={1.6}>
        <path d="M 560 620 Q 700 760 720 980" {...INLINE} />
        <Speckle box={{x0: 420, y0: 560, x1: 1000, y1: 980}} seed={77} n={40} color={tint(F.wall, 0.3)} r={[4, 7]} clip={tongue} />
        <Highlight x={760} y={560 - lift} w={110} rot={4} />
      </Shape>
      {sore > 0.02 && <Swelling x={330} y={760} r={140} k={sore} />}
      {sore > 0.02 && <Sore x={320} y={780} r={18 + 12 * sore} />}
      <StageArm at={[1000, 800]} s={1} pose={faces?.tongue?.armR} fill={F.wall} />
      <Face who="tongue" at={{...TONGUE_FACE, y: TONGUE_FACE.y - lift}} f={faces?.tongue} />
    </Canvas>
  );
};

// ==================================================================== 6. SKULL, SIDE CUT
const BRAIN_FACE = {x: 720, y: 720, r: 64};
export const SkullStage: React.FC<StageProps> = ({t, state, faces, layer, children}) => {
  const fog = dial(state, 'fog'), glow = dial(state, 'glow'), sleep = dial(state, 'sleep');
  const brainC = mix(mix('#eaa2b0', '#f6b7c3', glow), '#b98f9c', sleep * 0.6);
  const brain = smoothD([[70, 800], [130, 560], [330, 400], [600, 370], [850, 440], [990, 640], [1000, 880], [900, 1060], [680, 1120], [440, 1110], [220, 1060], [100, 960]]);
  const space = mix(F.cavity, '#7d5d62', sleep);
  return (
    <Canvas bg={space} layer={layer} kids={children}>
      {/* the skull: a bone shell with a marrow band, the meninges inside it */}
      <Shape d="M -60 1260 Q -80 200 540 160 Q 1160 200 1140 1260 L 1140 1060 Q 1080 330 540 300 Q 0 330 -60 1060 Z" fill={F.bone} shadow={0.6}>
        <Speckle box={{x0: -60, y0: 160, x1: 1140, y1: 420}} seed={5} n={60} color={shade(F.bone, 0.14)} />
      </Shape>
      <path d="M -40 1060 Q 20 360 540 330 Q 1060 360 1120 1060" stroke={F.wallRim} strokeWidth={10} fill="none" />
      {/* the skull floor the brain sits on, the hole the stem goes down through */}
      {/* below the skull floor: the neck's spine (vertebrae either side of the cord) and the cord going down */}
      {Array.from({length: 4}, (_, i) => (
        <g key={i}>
          <Shape d={`M 330 ${1380 + i * 150} L 462 ${1388 + i * 150} L 462 ${1500 + i * 150} L 330 ${1508 + i * 150} Z`} fill={F.bone} shadow={0.8} />
          <Shape d={`M 618 ${1388 + i * 150} L 750 ${1380 + i * 150} L 750 ${1508 + i * 150} L 618 ${1500 + i * 150} Z`} fill={F.bone} shadow={0.8} />
        </g>
      ))}
      <Wall d="M 460 1040 Q 540 1010 620 1040 L 612 1960 L 468 1960 Z" fill={tint(F.wall, 0.2)} rim={12} />
      <Shape d="M -60 1150 Q 240 1090 455 1130 L 470 1340 L -60 1360 Z" fill={F.bone} shadow={0.8}><Speckle box={{x0: 0, y0: 1150, x1: 460, y1: 1340}} seed={12} n={22} color={shade(F.bone, 0.14)} /></Shape>
      <Shape d="M 1140 1150 Q 840 1090 625 1130 L 610 1340 L 1140 1360 Z" fill={F.bone} shadow={0.8}><Speckle box={{x0: 620, y0: 1150, x1: 1080, y1: 1340}} seed={13} n={22} color={shade(F.bone, 0.14)} /></Shape>
      {/* the cerebellum behind and under */}
      <Lobes points={[[150, 1080], [280, 1120], [420, 1130]]} w={100} tones={[shade(brainC, 0.06), brainC]} seed={3} highlight={false} />
      {/* the brain: folds (gyri) drawn as long curls, kept off the face */}
      <Shape d={brain} fill={brainC} shadow={1.6}>
        {[[[160, 640], [270, 560], [250, 460]], [[300, 760], [400, 650], [480, 520]], [[180, 900], [320, 860], [420, 980]], [[540, 440], [620, 520], [700, 450]], [[860, 520], [930, 620], [950, 720]], [[480, 1040], [620, 1000], [760, 1060]], [[820, 980], [900, 920], [960, 960]]].map((p, i) => <path key={i} d={openD(p as P[])} {...INLINE} />)}
        {[[360, 430], [460, 880], [880, 860], [250, 1000], [560, 640]].map(([x, y], i) => <path key={'c' + i} d={`M ${x} ${y} q 30 -30 60 0 q 30 30 60 0`} {...INLINE} />)}
        <Folds box={{x0: 90, y0: 400, x1: 990, y1: 1090}} seed={71} density={0.7} avoid={[padBox(BRAIN_FACE, 1.0)]} clip={brain} len={[60, 120]} angle={30} />
        <Highlight x={560} y={410} w={110} rot={-4} />
      </Shape>
      {fog > 0.02 && [[300, 600, 130], [720, 520, 110], [480, 860, 150], [860, 880, 90]].map(([x, y, r], i) => <ellipse key={i} cx={x + Math.sin(t * 0.6 + i) * 20} cy={y} rx={r} ry={r * 0.55} fill="#d9d2d6" opacity={0.6 * fog} />)}
      {glow > 0.02 && [[880, 440], [940, 560], [180, 560]].map(([x, y], i) => <path key={i} d={`M ${x} ${y} l ${i === 2 ? -36 : 36} -30 M ${x + 6} ${y + 26} l ${i === 2 ? -44 : 44} 4`} stroke={INK} strokeWidth={5.6} strokeLinecap="round" opacity={glow} vectorEffect="non-scaling-stroke" />)}
      <StageArm at={[985, 900]} s={1} pose={faces?.brain?.armR} fill={brainC} />
      <Face who="brain" at={BRAIN_FACE} f={faces?.brain} />
    </Canvas>
  );
};

// ==================================================================== 7. SKIN IN SECTION
const SKIN_Y = 250; // the surface
export const SkinStage: React.FC<StageProps> = ({t, state, layer, children}) => {
  const wound = dial(state, 'wound'), swelling = dial(state, 'swelling');
  void t;
  const skin = '#e9b48f';
  return (
    <Canvas bg="#f1ebe0" layer={layer} kids={children}>
      {/* outside: a thin band of air above the skin (under 12% of the frame), a few hairs */}
      {[130, 340, 700, 930].map((x, i) => <path key={i} d={`M ${x} ${SKIN_Y + 10} Q ${x + 30} ${SKIN_Y - 90} ${x + 8} ${SKIN_Y - 170 + i * 8}`} stroke={INK} strokeWidth={6} fill="none" strokeLinecap="round" />)}
      {/* the layers: muscle at the bottom, fat lobules, the dermis with folds, the surface */}
      <Shape d="M -40 1430 L 1120 1430 L 1120 1960 L -40 1960 Z" fill={F.organRed} shadow={0}>
        {Array.from({length: 16}, (_, i) => <path key={i} d={`M -40 ${1462 + i * 32} Q 540 ${1440 + i * 32} 1120 ${1462 + i * 32}`} {...INLINE} />)}
      </Shape>
      <Shape d="M -40 880 L 1120 880 L 1120 1450 L -40 1450 Z" fill={F.fat} shadow={0}>
        {Array.from({length: 20}, (_, i) => <ellipse key={i} cx={30 + (i % 5) * 230 + (Math.floor(i / 5) % 2) * 110} cy={950 + Math.floor(i / 5) * 140} rx={104} ry={66} fill={i % 2 ? tint(F.fat, 0.25) : F.fat} {...EDGE_IN} />)}
      </Shape>
      <Shape d={`M -40 ${SKIN_Y + 50} Q 540 ${SKIN_Y + 20} 1120 ${SKIN_Y + 50} L 1120 900 L -40 900 Z`} fill={F.wall} shadow={0}>
        <Folds box={{x0: 0, y0: SKIN_Y + 120, x1: 1080, y1: 860}} seed={61} density={0.45} color={shade(F.wall, 0.35)} len={[100, 200]} />
        {/* hair roots in the dermis */}
        {[130, 340, 700, 930].map((x, i) => <path key={i} d={`M ${x} ${SKIN_Y + 40} Q ${x - 10} ${SKIN_Y + 150} ${x + 6} ${SKIN_Y + 230}`} stroke={INK} strokeWidth={5} fill="none" strokeLinecap="round" />)}
        {[130, 340, 700, 930].map((x, i) => <ellipse key={'b' + i} cx={x + 6} cy={SKIN_Y + 240} rx={20} ry={26} fill={tint(F.wall, 0.4)} {...EDGE_IN} />)}
      </Shape>
      <Shape d={`M -40 ${SKIN_Y} Q 540 ${SKIN_Y - 30} 1120 ${SKIN_Y} L 1120 ${SKIN_Y + 60} Q 540 ${SKIN_Y + 30} -40 ${SKIN_Y + 60} Z`} fill={skin} shadow={0} />
      {/* a vessel running through the dermis */}
      <Wall d={bandD([-40, 640], [540, 600], [1120, 660], 70, 70)} fill={F.artery} rim={10} />
      {wound > 0.02 && <>
        <path d={`M 500 ${SKIN_Y + 20} Q 520 ${SKIN_Y + 30 + 150 * wound} 540 ${SKIN_Y + 30 + 260 * wound} Q 560 ${SKIN_Y + 30 + 150 * wound} 580 ${SKIN_Y + 20} Z`} fill={F.deep} {...EDGE_IN} />
        <Wound x={540} y={SKIN_Y + 14} len={180} rot={0} open={wound} />
      </>}
      {swelling > 0.01 && <Swelling x={540} y={SKIN_Y + 200} r={380} k={swelling} />}
    </Canvas>
  );
};

// ==================================================================== the table of stages
const SLOTS = (window: Slot): StageDef['slots'] => ({top: {x: 540, y: -120, dir: [0, 1]}, left: {x: -160, y: 900, dir: [1, 0]}, right: {x: 1240, y: 900, dir: [-1, 0]}, bottom: {x: 540, y: 2040, dir: [0, -1]}, window});
export const STAGES: Record<StageName, StageDef> = {
  chest: {
    Stage: ChestStage,
    dials: {tar: 'dark tar patches on both lungs, and their colour greys', mucus: 'yellow mucus blobs in the bronchi', airway: 'bronchi width (1 open, 0 swollen narrow)', cough: 'one squeeze of both lungs', pink: 'healthy pink colour back (0 grey)', cilia: 'how many cilia hairs stand up and sweep'},
    slots: SLOTS({x: 540, y: -80, dir: [0, 1]}), faces: CHEST_FACES,
    faceRoom: {lungR: padBox(CHEST_FACES.lungR), lungL: padBox(CHEST_FACES.lungL)},
    neighbours: ['windpipe', 'bronchi', 'heart', 'ribs', 'diaphragm', 'liver'],
  },
  vesselInside: {
    Stage: VesselStage,
    dials: {flow: 'speed of the cells in their band (never stops)', co: 'carbon-monoxide riders on the red cells', pink: 'bright red cells and plasma (0 dull)'},
    slots: SLOTS({x: 890, y: 520, dir: [-0.6, 0.8]}), faces: {cell: {x: 300, y: 1050, r: 36}},
    faceRoom: {cell: padBox({x: 300, y: 1050, r: 36})},
    neighbours: ['vessel wall', 'floor', 'red cells', 'branch opening'],
  },
  tissue: {
    Stage: TissueStage,
    dials: {damage: 'dark patches on the wall, sores on the floor', swelling: 'one soft redness over the middle'},
    slots: SLOTS({x: 540, y: 240, dir: [0, 1]}), faces: {},
    faceRoom: {stand: {x0: 60, y0: 760, x1: 1020, y1: T_FLOOR}},
    neighbours: ['ceiling', 'curtain wall', 'floor', 'far vessels'],
  },
  upperBelly: {
    Stage: BellyStage,
    dials: {fill: 'liquid level in the stomach', contents: 'food pieces (0-4)', acid: 'liquid turns from pale to acid orange', gas: 'gas bubbles', damage: 'sores on the stomach wall', cut: 'the cut window opens'},
    slots: SLOTS({x: 580, y: -60, dir: [0, 1]}), faces: {stomach: BELLY_FACE},
    faceRoom: {stomach: padBox(BELLY_FACE)},
    neighbours: ['liver', 'food pipe', 'bile duct', 'gut', 'spleen'],
  },
  throatSide: {
    Stage: ThroatStage,
    dials: {stuck: 'a pill stuck in the food pipe (1 high up)', sore: 'redness and a sore on the back of the throat', swallow: 'the tongue lifts, the epiglottis closes'},
    slots: SLOTS({x: 1000, y: 700, dir: [-1, 0]}), faces: {tongue: TONGUE_FACE},
    faceRoom: {tongue: padBox(TONGUE_FACE)},
    neighbours: ['palate', 'teeth', 'epiglottis', 'windpipe', 'food pipe', 'spine'],
  },
  skullSide: {
    Stage: SkullStage,
    dials: {fog: 'grey fog patches over the brain', glow: 'a brighter brain with spark lines (flat, no glow)', sleep: 'the brain and the space dim'},
    slots: SLOTS({x: 540, y: 300, dir: [0, 1]}), faces: {brain: BRAIN_FACE},
    faceRoom: {brain: padBox(BRAIN_FACE)},
    neighbours: ['skull', 'meninges', 'skull floor', 'cerebellum', 'brain stem'],
  },
  skinSection: {
    Stage: SkinStage,
    dials: {wound: 'a bite or cut opens in the surface', swelling: 'soft redness under the surface'},
    slots: SLOTS({x: 540, y: 200, dir: [0, 1]}), faces: {},
    faceRoom: {stand: {x0: 60, y0: 340, x1: 1020, y1: 880}},
    neighbours: ['surface', 'dermis', 'fat', 'muscle', 'vessel'],
  },
};
/**
 * The layout log of a stage (07-layout-log-wiring.md): each named neighbour as a `body` (id 'neighbour:<name>', the whole
 * frame: the scoreboard counts them) and each face room ('faceRoom:<who>', a box nothing of the contents may enter).
 * Every stage of the table reports through this wrapper; nothing changes on the page.
 */
const StageReport: React.FC<{def: Omit<StageDef, 'Stage'>}> = ({def}) => {
  const report = useReport();
  for (const n of def.neighbours) report({kind: 'body', id: 'neighbour:' + n, box: {x0: 0, y0: 0, x1: 1080, y1: 1920}});
  for (const [who, box] of Object.entries(def.faceRoom)) report({kind: 'body', id: 'faceRoom:' + who, box});
  return null;
};
for (const def of Object.values(STAGES)) {
  const Inner = def.Stage;
  const Wrapped: React.FC<StageProps> = (p) => <><StageReport def={def} /><Inner {...p} /></>;
  Wrapped.displayName = `Stage(${Inner.displayName ?? Inner.name})`;
  def.Stage = Wrapped;
}
void OUTLINE; void EDGE_IN;
