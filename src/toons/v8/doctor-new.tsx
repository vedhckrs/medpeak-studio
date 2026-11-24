/**
 * MedPeak Toons v8: THE NEW DOCTOR, second version (2026-11-24). A completely new figure with her own small rig, drawn
 * start to end in this file; she does not use the shared person rig's body, coat, hair or poses.
 *
 * The owner on the first version: "its look child not doctor", "arm hand overlap the shoulders and chest i dont want line
 * mix". So, this version:
 *   - AN ADULT: about 5 heads tall (Mom 4.3, Dad 4.6), a smaller head on a taller body, a longer face with a jaw and a chin,
 *     a longer neck, eyes at the small end of the cast's range, collar-length hair tucked behind the ears.
 *   - A REAL COAT: square shoulders, a white collar and lapel (one clean edge each side), a teal scrub top in the opening,
 *     one closing line with three buttons, two patch pockets, the coat fitted at the waist and falling straight.
 *   - ONE SILHOUETTE: the coat and its sleeves are drawn as ONE outlined form (one ink pass under all the fills), so no
 *     outline crosses the shoulder. Below the armpit an arm that lies over the coat keeps only its own outline, and its
 *     fill covers every coat line under it (no line shows through, no double line). Arms at rest hang beside the coat.
 *
 * What she SHARES with the cast, on purpose: the kit's line (OUT / IN), the kit's eyes and brows, the cast's ear and nose
 * family, the cast's hands (`Hand` of the person rig) and the cast's talking-mouth shapes.
 *
 * Units: person units, y down, the ground at y = 0. <DoctorAt> places her like the rig's <PersonAt>: x = the middle,
 * y = the ground line, scale = px per unit.
 *
 *   view     'front' | 'three-quarter' (real views; no squeeze)
 *   facing   'right' | 'left' for the three-quarter view: left is her mirror twin drawn with the one-sided things (the hair
 *            parting, the buttons, the badge) moved to the twin's other side and then flipped, so they stay on HER OWN side
 *   pose     'rest' | 'explain' | 'point', or a blend {a, b, k}: every angle blends; the hand shape and the thumb side
 *            switch at k = 0.5 (ease k through the middle, e.g. go(t, t0, 0.35))
 *   expr     'neutral' | 'happy' | 'concerned'
 *   look / lookAt   pupils: an offset -1..1, or a point in frame pixels she looks at
 *   talk     0..1 mouth opening (play.tsx talkSmooth); undefined = the still mouth
 *   blink    0..1 (1 = shut), a continuous lid
 *   bob      -1..1 a small breathing lift (feet stay planted)
 *   extra    'none' (default) | 'steth' | 'badge': the owner's choice of one doctor's sign on the chest
 *
 * The layout log (engine v9): she reports head, face (with the pupils' real screen direction) and both hands in frame
 * pixels, and her eyes and mouth report themselves inside the drawing, like the person rig. who = 'doctor'.
 * doctorHeadAt / doctorHandAt give the same points to a shot (the same arithmetic as the drawing).
 */
import React, {useId} from 'react';
import {CLOTH, EDGE, EDGE_IN, Eyes, FaceOwned, FLESH, IN, INK, INLINE, OUT, OUTLINE, shade, SKIN, V9, type Mood} from './kit';
import {capsule, closedSmooth, Hand, openSmooth, type HandKind} from './people-rig';
import {circleBox, FrameMove, IDENTITY, useReport} from './play';

type P = [number, number];
const f1 = (n: number) => (Math.round(n * 100) / 100).toString();
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const rad = (d: number) => (d * Math.PI) / 180;
const polar = (p: P, a: number, l: number): P => [p[0] + Math.cos(rad(a)) * l, p[1] + Math.sin(rad(a)) * l];
const rot = (p: P, c: P, d: number): P => { const a = rad(d), x = p[0] - c[0], y = p[1] - c[1]; return [c[0] + x * Math.cos(a) - y * Math.sin(a), c[1] + x * Math.sin(a) + y * Math.cos(a)]; };
const poly = (p: P[]) => 'M ' + p.map((q) => `${f1(q[0])} ${f1(q[1])}`).join(' L ') + ' Z';
const circle = (c: P, r: number) => `M ${f1(c[0] + r)} ${f1(c[1])} A ${r} ${r} 0 1 0 ${f1(c[0] - r)} ${f1(c[1])} A ${r} ${r} 0 1 0 ${f1(c[0] + r)} ${f1(c[1])} Z`;

// ================================================================== who she is
export const DOCTOR_ID = 'doctor';
export const DOCTOR_LOOK = {
  skin: SKIN.brown,
  hair: '#2a2120',
  coat: '#ffffff',
  scrub: CLOTH.teal,
  trousers: shade(CLOTH.teal, 0.08),
  shoes: '#ffffff',
};
const HEIGHT = 392; // the top of her skull (Mom 365, Dad 405)
const HS = 0.86; // her head is drawn in the cast's head space (a skull of radius 40) at this size: a smaller, adult head
const HEAD_CY = -HEIGHT + 40 * HS;
const NECK_Y = -300; // where the head turns
const ARMPIT = -266; // above it the sleeve and the coat are one form; below it an arm has its own outline
const SH: P = [-2.2, -2.6]; // the one darker tone sits on the lower right (the cast's offset)

export type DrView = 'front' | 'three-quarter';
export type DrFacing = 'right' | 'left';
export type DrPose = 'rest' | 'explain' | 'point';
export type DrPoseIn = DrPose | {a: DrPose; b: DrPose; k: number};
export type DrExpr = 'neutral' | 'happy' | 'concerned';
export type DrExtra = 'none' | 'steth' | 'badge';
export const DR_POSES: DrPose[] = ['rest', 'explain', 'point'];
export const DR_EXPRS: DrExpr[] = ['neutral', 'happy', 'concerned'];

// ================================================================== one flat piece with one outline
/** Overlapping paths drawn as ONE outlined form (a fat ink pass, then the fills), the darker tone as a crescent. */
const Piece: React.FC<{d: string[]; fill: string; shadow?: number; shadeBy?: number; line?: 'out' | 'in'; children?: React.ReactNode}> = ({d, fill, shadow = 1, shadeBy = 0.14, line = 'out', children}) => {
  const id = 'dn' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const sw = (line === 'out' ? OUT : IN) * 2;
  return (
    <g>
      {d.map((p, i) => <path key={'o' + i} d={p} fill={fill} stroke={INK} strokeWidth={sw} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
      <defs><clipPath id={id}>{d.map((p, i) => <path key={i} d={p} />)}</clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {shadow > 0 ? (
          <>
            <rect x={-3000} y={-3000} width={6000} height={6000} fill={shade(fill, shadeBy)} />
            {d.map((p, i) => <path key={'f' + i} d={p} fill={fill} transform={`translate(${f1(SH[0] * shadow)} ${f1(SH[1] * shadow)})`} />)}
          </>
        ) : d.map((p, i) => <path key={'f' + i} d={p} fill={fill} />)}
        {children}
      </g>
    </g>
  );
};
/** The fat ink pass of a form (drawn UNDER the fills that follow). */
const Ink: React.FC<{d: string[]}> = ({d}) => <>{d.map((p, i) => <path key={i} d={p} fill={INK} stroke={INK} strokeWidth={OUT * 2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}</>;
const Fill: React.FC<{d: string[]; fill: string}> = ({d, fill}) => <>{d.map((p, i) => <path key={i} d={p} fill={fill} />)}</>;

// ================================================================== the poses (screen angles: 0 = right, 90 = down)
type Arm = {up: number; fore: number; hand: HandKind; turn?: number; thumb: 'in' | 'up'};
type Pose = {near: Arm; far: Arm; tilt?: number};
const HANG = (up: number, fore: number): Arm => ({up, fore, hand: 'relaxed', thumb: 'in'});
/** Front view: `near` is her right arm (screen left), `far` her left arm (screen right); angles for the screen-right arm, mirrored for the other. */
const POSE_F: Record<DrPose, Pose> = {
  rest: {near: HANG(88, 90), far: HANG(88, 90)},
  explain: {near: HANG(88, 90), far: {up: 76, fore: -32, hand: 'open', turn: 20, thumb: 'up'}, tilt: -3},
  point: {near: HANG(88, 90), far: {up: 36, fore: -2, hand: 'point', thumb: 'up'}},
};
/** Three-quarter, facing right: `near` is the arm toward us (it lies on the coat), `far` the arm on the side she faces (it gestures, clear of the body). */
const POSE_Q: Record<DrPose, Pose> = {
  rest: {near: HANG(94, 88), far: HANG(79, 84)},
  explain: {near: HANG(94, 88), far: {up: 82, fore: -44, hand: 'open', turn: 30, thumb: 'up'}, tilt: -3},
  point: {near: HANG(94, 88), far: {up: 42, fore: -4, hand: 'point', thumb: 'up'}},
};
const UP_L = 60, FORE_L = 54;

type ArmGeo = {key: 'near' | 'far'; s: P; e: P; w: P; fore: number; ang: number; m: number; hand: HandKind; behind: boolean};
type Geo = {q: boolean; mir: boolean; lift: number; tilt: number; headX: number; neck: P; arms: ArmGeo[]};
const armOf = (a: Arm, b: Arm, k: number): Arm => ({up: lerp(a.up, b.up, k), fore: lerp(a.fore, b.fore, k), turn: lerp(a.turn ?? 0, b.turn ?? 0, k), hand: k < 0.5 ? a.hand : b.hand, thumb: k < 0.5 ? a.thumb : b.thumb});
/** Everything in person units WITHOUT the breathing lift (the drawing moves the upper body by `lift`; the reports add it). */
const geoOf = (view: DrView, facing: DrFacing, pose: DrPoseIn, bob = 0): Geo => {
  const q = view === 'three-quarter';
  const mir = q && facing === 'left';
  const T = q ? POSE_Q : POSE_F;
  const A = typeof pose === 'string' ? T[pose] : T[pose.a], B = typeof pose === 'string' ? A : T[pose.b];
  const k = typeof pose === 'string' ? 0 : clamp01(pose.k);
  const tilt = lerp(A.tilt ?? 0, B.tilt ?? 0, k);
  const one = (key: 'near' | 'far'): ArmGeo => {
    const a = armOf(A[key], B[key], k);
    // front: the near arm is the far arm's mirror image (angles measured from the other side)
    const flip = !q && key === 'near';
    const up = flip ? 180 - a.up : a.up, fore = flip ? 180 - a.fore : a.fore;
    const s: P = q ? (key === 'near' ? [-27, -282] : [27, -282]) : [key === 'near' ? -40 : 40, -282];
    const e = polar(s, up, UP_L), w = polar(e, fore, FORE_L);
    const ang = fore + (flip ? -(a.turn ?? 0) : (a.turn ?? 0));
    // the thumb: a hanging hand keeps it on the inner side, toward the body; a raised hand keeps it on top
    const m = a.thumb === 'in' ? (w[0] < (q ? 2 : 0) ? -1 : 1) : (Math.cos(rad(ang)) >= 0 ? -1 : 1);
    return {key, s, e, w, fore, ang, m, hand: a.hand, behind: q && key === 'far'};
  };
  return {q, mir, lift: -1.4 * bob, tilt, headX: q ? 5 : 0, neck: [q ? 3 : 0, NECK_Y], arms: [one('near'), one('far')]};
};

// ================================================================== where things are (frame pixels)
export type DrPlace = {x: number; y: number; scale: number; view?: DrView; facing?: DrFacing; pose?: DrPoseIn; bob?: number};
const FACE = {f: {eye: [0, 3] as P, mouth: [0, 32.5] as P, mw: 1}, q: {eye: [14, 3] as P, mouth: [21.5, 33] as P, mw: 0.85}};
/** Her face: its centre (between the eyes and the mouth) and a radius, in frame pixels. */
export const doctorHeadAt = (o: DrPlace): {x: number; y: number; r: number} => {
  const g = geoOf(o.view ?? 'front', o.facing ?? 'right', o.pose ?? 'rest', o.bob);
  const c0 = rot([g.headX + FACE[g.q ? 'q' : 'f'].eye[0] * HS, HEAD_CY + 14 * HS], g.neck, g.tilt);
  const c: P = [c0[0], c0[1] + g.lift];
  return {x: o.x + o.scale * (g.mir ? -c[0] : c[0]), y: o.y + o.scale * c[1], r: 1.3 * 40 * HS * o.scale};
};
export type DrHandPoint = {wrist: [number, number]; palm: [number, number]; dir: [number, number]; hand: HandKind};
/** Both hands in frame pixels; R / L are her OWN right and left hand. */
export const doctorHandAt = (o: DrPlace): {R: DrHandPoint; L: DrHandPoint} => {
  const g = geoOf(o.view ?? 'front', o.facing ?? 'right', o.pose ?? 'rest', o.bob);
  const X = (p: P): [number, number] => [o.x + o.scale * (g.mir ? -p[0] : p[0]), o.y + o.scale * (p[1] + g.lift)];
  const one = (a: ArmGeo): DrHandPoint => {
    const d: P = [Math.cos(rad(a.fore)), Math.sin(rad(a.fore))];
    return {wrist: X(a.w), palm: X(polar(a.w, a.ang, 12)), dir: [g.mir ? -d[0] : d[0], d[1]], hand: a.hand};
  };
  const near = one(g.arms[0]), far = one(g.arms[1]);
  // facing right (and front) the near arm is her right; her mirror twin's near arm is her own left
  return g.mir ? {R: far, L: near} : {R: near, L: far};
};
/** The pupils' offset that looks at a frame point (0.8 of the way to the rim), in her own drawing frame. */
const lookFrom = (o: DrPlace, at: [number, number]): [number, number] => {
  const h = doctorHeadAt(o);
  const mir = (o.view ?? 'front') === 'three-quarter' && (o.facing ?? 'right') === 'left';
  const dx = at[0] - h.x, dy = at[1] - h.y, l = Math.hypot(dx, dy) || 1;
  return [((mir ? -dx : dx) / l) * 0.8, (dy / l) * 0.8];
};

// ================================================================== the mouth (the cast's talking shapes, continuous)
const MOUTH: Record<DrExpr, {yc: number; bow: number; H0: number; w: number}> = {
  neutral: {yc: -0.2, bow: 0.475, H0: 0, w: 1},
  happy: {yc: -0.3, bow: 0, H0: 0.9, w: 1.25},
  concerned: {yc: 0.1, bow: -0.16, H0: 0, w: 0.9},
};
const DrMouth: React.FC<{x: number; y: number; w: number; expr: DrExpr; open: number}> = ({x, y, w: w0, expr, open}) => {
  const id = 'dm' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const report = useReport();
  const M = MOUTH[expr];
  const t0 = clamp01(open);
  const w = w0 * M.w;
  const h = (w / 2) * (1 + 0.12 * t0);
  const H0 = M.H0 * h;
  const H = H0 + (Math.max(2.0 * h, H0 * 1.35) - H0) * t0;
  const bow = M.bow * h * (1 - 0.45 * t0);
  const yc = y + M.yc * h;
  report({kind: 'mouth', box: {x0: x - w / 2, y0: y - w / 2, x1: x + w / 2, y1: y + w * 0.8}, open: H > 0.5 * h});
  const N = 16;
  const up: P[] = [], lo: P[] = [];
  for (let i = 0; i <= N; i++) {
    const tt = -1 + (2 * i) / N;
    const yu = yc + bow * (1 - tt * tt);
    up.push([x + h * tt, yu]);
    lo.push([x + h * tt, yu + H * Math.max(0, 1 - tt * tt)]);
  }
  const line = 'M ' + up.map((p) => `${f1(p[0])} ${f1(p[1])}`).join(' L ');
  if (H < 0.35) return <path d={line} {...OUTLINE} />;
  const d = poly([...up, ...lo.reverse()]);
  return (
    <g>
      <path d={d} fill={FLESH.deep} />
      <defs><clipPath id={id}><path d={d} /></clipPath></defs>
      <g clipPath={`url(#${id})`}><ellipse cx={x} cy={yc + bow + H * 0.95} rx={h * 0.6} ry={H * 0.42} fill={FLESH.salmon} /></g>
      <path d={d} {...OUTLINE} />
    </g>
  );
};

// ================================================================== the head (the cast's head space: the skull's centre at 0, radius 40)
// an ADULT head: the cast's skull, but a longer face with a jaw corner and a chin (the cast's chin is at 48, hers at 55)
const HEAD_F: P[] = [[0, -40], [22, -37], [35, -25], [39.5, -7], [39, 10], [36.5, 24], [31.5, 36.5], [23, 46.5], [11, 53.5], [0, 55], [-11, 53.5], [-23, 46.5], [-31.5, 36.5], [-36.5, 24], [-39, 10], [-39.5, -7], [-35, -25], [-22, -37]];
const HEAD_Q: P[] = [[-2, -40.5], [21, -37.5], [35, -25], [40.5, -8], [41, 8], [39, 22], [34.5, 35], [27, 46], [17.5, 53.5], [7.5, 55], [-3, 51], [-14, 43.5], [-25, 33.5], [-34, 20], [-39.5, 4], [-39.5, -14], [-32, -30], [-18, -38.5]];
// her hair: collar length, a side parting on HER OWN left, tucked behind the ears
const HAIR_BACK_F: P[] = [[0, -50], [26, -45], [41, -28], [45, -4], [45.5, 22], [43, 44], [37, 57], [26, 62], [0, 63], [-26, 62], [-37, 57], [-43, 44], [-45.5, 22], [-45, -4], [-41, -28], [-26, -45]];
const HAIR_BACK_Q: P[] = [[-4, -50], [-26, -44], [-40, -29], [-45, -6], [-46, 20], [-44, 42], [-38, 55], [-28, 62], [-16, 63], [-7, 58], [-3, 46], [-4, 20], [4, -20], [10, -44]];
const HAIR_F: P[] = [[-38.5, 7], [-41, 5], [-43.5, -10], [-41.5, -28], [-32, -41.5], [-16, -49.5], [1, -51.5], [18, -49], [33, -41.5], [42, -28], [43.5, -10], [41, 5], [38.5, 7], [37.5, -5], [33.5, -17], [26, -26], [15, -31], [3, -30.5], [-10, -27.5], [-22, -21.5], [-31, -12.5], [-36, -2]];
/** three-quarter, facing right, the parting on the far side (her own left) */
const HAIR_Q: P[] = [[-22, 31], [-27, 32], [-38, 21], [-44, 4], [-44.5, -15], [-38, -33], [-23, -46], [-4, -51.5], [16, -49.5], [30, -41.5], [39, -30], [43, -15], [42, -8], [38, -19], [31, -27], [20, -30], [8, -29.5], [-3, -25.5], [-10, -17], [-14, -6], [-16.5, 5], [-18, 14], [-19.5, 22]];
/** the mirror twin (drawn facing right, then flipped to face left): the parting on the twin's near side, her own left after the flip */
const HAIR_QM: P[] = [[-22, 31], [-27, 32], [-38, 21], [-44, 4], [-44.5, -15], [-38, -33], [-23, -46], [-4, -51.5], [16, -49.5], [30, -41.5], [39, -30], [43, -15], [43.5, -6], [39.5, -16], [31, -24], [19, -29], [6, -31.5], [-4, -29], [-10, -20], [-14, -8], [-16.5, 4], [-18, 14], [-19.5, 22]];

type HeadProps = {q: boolean; mir: boolean; expr: DrExpr; look?: [number, number]; talk?: number; blink?: number; skin: string; hair: string; faceClass: string};
const Head: React.FC<HeadProps> = ({q, mir, expr, look, talk, blink, skin, hair, faceClass}) => {
  const fc = q ? FACE.q : FACE.f;
  const eyeR = 9.8, gap = eyeR * 0.5;
  const lk: [number, number] = look ?? (q ? [0.45, 0.05] : [0, 0.05]);
  const mood: Mood = expr === 'happy' ? 'happy' : expr === 'concerned' ? 'sad' : 'open';
  const lid = blink && blink > 0 && mood !== 'happy' ? blink : undefined;
  return (
    <g>
      {!q && ([-1, 1] as const).map((sd) => (
        <g key={sd} transform={`${sd === -1 ? 'scale(-1 1) ' : ''}translate(-0.5 2)`}>
          <path d="M 37 -1 C 46 -6 50.5 12 44 19 C 41 22 37 20 36 17 Z" fill={skin} {...EDGE} />
          <path d="M 40.5 4 Q 45 8 41.5 14" {...INLINE} />
        </g>
      ))}
      <Piece d={[closedSmooth(q ? HEAD_Q : HEAD_F)]} fill={skin} shadow={0.8} />
      <Piece d={[closedSmooth(q ? (mir ? HAIR_QM : HAIR_Q) : HAIR_F)]} fill={hair} shadow={0} />
      {q && (
        <g transform="translate(-23 10)">
          <path d="M 4 -10 C -8 -14 -12 8 -4 12 C 0 14 4 12 5 8 Z" fill={skin} {...EDGE} />
          <path d="M 0 -4 Q -5 0 -1 5" {...INLINE} />
        </g>
      )}
      <g className={faceClass}>
        <Eyes x={fc.eye[0]} y={fc.eye[1]} r={eyeR} gap={gap} look={lk} mood={mood} brows lid={lid} />
        {/* a real nose in both views (the cast's nose family, a little longer on her longer face) */}
        {!q && <path transform="translate(0 2.5) scale(1 1.15)" d="M -1.6 12.8 Q 5.6 16.2 2 20.8 Q -0.2 22.4 -3.2 21" {...INLINE} />}
        {q && (
          <g transform="translate(20.5 21) scale(1.2 1.3) translate(-31 -19)">
            <path d="M 27.6 14.2 C 32.6 14.2 38 17.2 37.8 20.6 C 37.6 23.8 33 24.8 29.2 23.5 C 27.2 21 26.8 17 27.6 14.2 Z" fill={skin} />
            <path d="M 32.4 15.2 C 35.8 16.4 38 18.6 37.8 20.6 C 37.6 23.8 33 24.8 29.2 23.5" {...INLINE} />
            <path d="M 31.2 21.3 Q 32.9 20.5 34.2 21.9" {...INLINE} />
          </g>
        )}
        <DrMouth x={fc.mouth[0]} y={fc.mouth[1]} w={12.5 * fc.mw} expr={expr} open={talk ?? 0} />
      </g>
    </g>
  );
};

// ================================================================== the body
/** A side of the coat, top to bottom (then the hem straight across, then the other side back up). */
const side = (down: P[], up: P[]) => openSmooth(down) + ' ' + openSmooth(up).replace(/^M/, 'L') + ' Z';
const mirX = (p: P[]) => p.map(([x, y]) => [-x, y] as P).reverse();
const COAT_F_L: P[] = [[-11, -298], [-26, -295.5], [-41.8, -292.9], [-43, -283], [-40, -268], [-39, -254], [-36, -238], [-34, -222], [-34.5, -204], [-36.5, -185], [-37, -150], [-37.5, -112]];
const COAT_F = side(COAT_F_L, mirX(COAT_F_L));
const COAT_Q = side(
  [[-7, -298], [-18, -295.4], [-29.5, -292.7], [-33, -283], [-31, -268], [-30, -250], [-27.5, -234], [-26.5, -222], [-27.5, -204], [-30, -185], [-31, -150], [-31.5, -112]],
  [[36, -112], [35.5, -150], [34.5, -185], [32, -204], [31, -222], [33, -238], [36.5, -254], [36, -268], [35, -283], [30.5, -292.4], [22, -295.2], [14, -298]],
);
const SHOE_F: P[] = [[-12, -11], [-3, -15], [8, -13], [14, -6], [13, -1], [12, 0], [-12, 0], [-13.5, -1], [-14, -6]];
const SHOE_Q: P[] = [[-12, -11], [-4, -15], [7, -14], [18, -9], [25, -4], [25, -1], [24, 0], [-11, 0], [-12.5, -1], [-13, -6]];
const pocket = (x0: number, x1: number) => `M ${x0} -172 H ${x1} V -150 Q ${x1} -146 ${x1 - 4} -146 H ${x0 + 4} Q ${x0} -146 ${x0} -150 Z`;
const BELOW = `M -3000 ${ARMPIT} H 3000 V 3000 H -3000 Z`; // everything below the armpit line

export type DoctorProps = {
  view?: DrView; facing?: DrFacing; pose?: DrPoseIn; expr?: DrExpr; look?: [number, number]; talk?: number; blink?: number; bob?: number;
  /** px per unit where she is drawn (thins the eye ring and the inner lines on a small figure, as the cast does) */ px?: number;
  /** ONE doctor's sign on the chest, the owner's choice: nothing (default), a neat stethoscope, or a small badge */ extra?: DrExtra;
  /** a skin tone other than her own (for the option strip on her sheet) */ skin?: string;
  headOnly?: boolean;
};
/** The doctor in person units (the ground at y = 0). Use <DoctorAt> in a scene. */
export const Doctor: React.FC<DoctorProps> = ({view = 'front', facing = 'right', pose = 'rest', expr = 'neutral', look, talk, blink, bob, px = 1.5, extra = 'none', skin = DOCTOR_LOOK.skin, headOnly}) => {
  const uid = 'dr' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const g = geoOf(view, facing, pose, bob);
  const {q, mir, lift} = g;
  const L = DOCTOR_LOOK;
  // small figures: the eye ring and the inner lines thin down with the eye (the cast's rule), and follow the camera's ink zoom
  const eyePx = 9.8 * HS * px;
  const eyeW = Math.min(OUT, eyePx * 0.28), inW = Math.min(IN, eyePx * 0.2);
  const W = (w: number) => `calc(${f1(w)}px * var(--ink-k, 1))`;
  const css = (eyeW < OUT ? `.${uid}f [stroke-width="${OUT}"]{stroke-width:${W(eyeW)}}` : '')
    + (inW < IN ? `.${uid}b [stroke-width="${IN}"]{stroke-width:${W(inW)}} .${uid}b [stroke-width="${IN * 2}"]{stroke-width:${W(inW * 2)}}` : '');
  const headT = `rotate(${f1(g.tilt)} ${f1(g.neck[0])} ${f1(g.neck[1])}) translate(${f1(g.headX)} ${f1(HEAD_CY)}) scale(${HS})`;
  const head = <g transform={headT}><Head q={q} mir={mir} expr={expr} look={look} talk={talk} blink={blink} skin={skin} hair={L.hair} faceClass={uid + 'f'} /></g>;
  const backHair = <g transform={headT}><Piece d={[closedSmooth(q ? HAIR_BACK_Q : HAIR_BACK_F)]} fill={L.hair} shadow={0} /></g>;
  if (headOnly) return <V9><g className={uid + 'b'} transform={mir ? 'scale(-1 1)' : undefined}>{css && <style>{css}</style>}{backHair}{head}</g></V9>;

  const coat = q ? COAT_Q : COAT_F;
  const sleeve = (a: ArmGeo): string[] => {
    const turned = Math.abs(a.ang - a.fore) > 12;
    return [capsule(a.s, 11, a.e, 9.4), capsule(a.e, 9.4, polar(a.w, a.fore, turned ? 2.5 : -2), 8, 'flat')];
  };
  const sleeves = g.arms.map(sleeve);
  /**
   * One arm: the hand, then the sleeve's own ink BELOW THE ARMPIT ONLY (its edge where it lies on the coat, and the cuff
   * over the hand), then the sleeve's fill. Above the armpit there is no ink between sleeve and coat: one silhouette.
   */
  const arm = (a: ArmGeo, i: number) => {
    const turned = Math.abs(a.ang - a.fore) > 12;
    return (
      <g key={a.key}>
        <g transform={`translate(${f1(a.w[0])} ${f1(a.w[1])}) rotate(${f1(a.ang)}) scale(1 ${a.m})`}><Hand kind={a.hand} skin={skin} wristR={turned ? undefined : 5} /></g>
        <g clipPath={`url(#${uid}below)`}><Ink d={sleeves[i]} /></g>
        <Fill d={sleeves[i]} fill={L.coat} />
      </g>
    );
  };
  // the legs and shoes (teal trousers under the coat, white shoes with a sole line)
  const legX = q ? [15, -8] : [14, -14]; // the far leg first
  const legs = legX.map((x, i) => {
    const toe = q ? 1 : x > 0 ? 1 : -1;
    const shoe = (q ? SHOE_Q : SHOE_F).map(([sx, sy]) => [x + toe * sx + (q ? 0 : toe * 1.5), sy] as P);
    return (
      <g key={i}>
        <Piece d={[capsule([x, -124], 12, [x, -10], 9.6, 'flat')]} fill={L.trousers} shadow={0.7} />
        <Piece d={[closedSmooth(shoe)]} fill={L.shoes} shadow={0.6} shadeBy={0.09}>
          <path d={`M ${x - 30} -3.6 H ${x + 30}`} {...INLINE} />
        </Piece>
      </g>
    );
  });
  // the coat's own lines: a lapel edge each side, the closing line, three buttons, two patch pockets
  const cx = q ? 9 : 0; // where the coat closes
  const own = mir ? 1 : -1; // the buttons sit on her own right of the closing line; the badge on her own left
  const vL: P = q ? [-8, -298] : [-12, -298], vR: P = q ? [15, -298] : [12, -298], vTip: P = [cx, -246];
  const nx = g.neck[0];
  const closeX = (y: number) => (q ? cx + 4 * Math.sin(((y + 246) / -134) * Math.PI) * 0.9 + (y + 246) * -0.015 : 0);
  const before = g.arms.map((a, i) => [a, i] as const).filter(([a]) => a.behind), after = g.arms.map((a, i) => [a, i] as const).filter(([a]) => !a.behind);
  const upper = (
    <g transform={lift ? `translate(0 ${f1(lift)})` : undefined}>
      <defs>
        <clipPath id={uid + 'below'}><path d={BELOW} /></clipPath>
        <clipPath id={uid + 'coat'}><path d={coat} /></clipPath>
      </defs>
      {backHair}
      {/* ONE ink pass for the coat and both sleeves: the whole upper body is one silhouette */}
      <Ink d={[coat, ...sleeves.flat()]} />
      {before.map(([a, i]) => arm(a, i))}
      {/* the coat's edge where it lies over the arm behind it (below the armpit only), then its fill */}
      <g clipPath={`url(#${uid}below)`}><Ink d={[coat]} /></g>
      <Fill d={[coat]} fill={L.coat} />
      <g clipPath={`url(#${uid}coat)`}>
        <path d={q ? `M ${cx} -246 Q ${cx + 5} -180 ${cx + 2} -112` : 'M 0 -246 V -112'} {...INLINE} />
        {(q ? [[-10, 5], [16, 30]] : [[-28, -10], [10, 28]]).map(([a, b], i) => <path key={i} d={pocket(a, b)} {...INLINE} />)}
        {[-231, -207, -183].map((y) => <circle key={y} cx={(q ? cx + 2.5 + (y + 246) * -0.02 : 0) + own * 5.5} cy={y} r={2.6} fill={L.coat} {...EDGE_IN} />)}
      </g>
      {/* the scrub top in the coat's opening, her neck in the scrub's own V, then the white lapels: one clean edge each side */}
      <path d={poly([vL, vR, vTip])} fill={L.scrub} {...EDGE_IN} />
      <Piece d={[capsule([nx, -326], 9.6, [nx, -294], 9.6, 'flat'), poly([[nx - 9.6, -295], [nx + 9.6, -295], [nx + (q ? 3 : 0), -277]])]} fill={skin} shadow={0.6} line="in" />
      {(q ? [`M -15 -296.5 Q -15 -270 ${cx - 2.5} -250.5`, `M 21 -296 Q 26 -272 ${cx + 2.5} -250.5`] : ['M -20 -296.5 Q -23 -270 -2.5 -250.5', 'M 20 -296.5 Q 23 -270 2.5 -250.5']).map((d, i) => <path key={i} d={d} {...INLINE} />)}
      {extra === 'steth' && <Steth q={q} />}
      {extra === 'badge' && <Badge x={(q ? cx : 0) + -own * (q ? 15 : 22) - 5.5} y={-246} />}
      {after.map(([a, i]) => arm(a, i))}
      {head}
    </g>
  );
  void closeX;
  return (
    <V9>
      <g className={uid + 'b'} transform={mir ? 'scale(-1 1)' : undefined}>
        {css && <style>{css}</style>}
        {legs}
        {upper}
      </g>
    </V9>
  );
};
/** Choice B: one dark tube round the neck, lying on the lapels, ONE small chest piece. */
const Steth: React.FC<{q: boolean}> = ({q}) => {
  const a: P[] = q ? [[-10, -298], [-9, -276], [-3, -258], [3, -246]] : [[-14, -298], [-14, -278], [-10, -260], [-6, -246]];
  const b: P[] = q ? [[17, -298], [19, -278], [17, -262]] : [[14, -298], [14, -278], [11, -262]];
  const tube = (p: P[]) => p.slice(1).map((e, i) => capsule(p[i], 2.4, e, 2.4));
  const end = a[a.length - 1];
  return (
    <g>
      <Piece d={[...tube(a), ...tube(b)]} fill={CLOTH.charcoal} shadow={0} line="in" />
      <circle cx={end[0] + 0.5} cy={end[1] + 5} r={5.4} fill="#c9d3da" {...EDGE_IN} />
    </g>
  );
};
/** Choice C: a small name badge clipped on her own left chest. */
const Badge: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    <rect x={x} y={y} width={11} height={14} rx={1.6} fill="#eaf4f6" {...EDGE_IN} />
    <rect x={x + 3.5} y={y - 2.6} width={4} height={3.6} rx={0.8} fill={CLOTH.charcoal} />
    <rect x={x + 2.4} y={y + 3} width={6.2} height={4.4} fill={CLOTH.teal} />
    <path d={`M ${x + 2.6} ${y + 10.4} H ${x + 8.4}`} stroke={INK} strokeWidth={0.9} strokeLinecap="round" />
  </g>
);

// ================================================================== placing her in a scene, with the layout log
const DoctorReport: React.FC<{o: DrPlace; look?: [number, number]}> = ({o, look}) => {
  const report = useReport();
  const h = doctorHeadAt(o);
  report({kind: 'head', box: circleBox(h.x, h.y, h.r)});
  // `look` is in her own frame (mirrored when she faces left): the log wants the SCREEN direction
  const mir = (o.view ?? 'front') === 'three-quarter' && (o.facing ?? 'right') === 'left';
  const dir: [number, number] | undefined = look && (mir ? [-look[0], look[1]] : look);
  report({kind: 'face', box: {x0: h.x - 0.55 * h.r, y0: h.y - 0.45 * h.r, x1: h.x + 0.55 * h.r, y1: h.y + 0.6 * h.r}, dir: dir ?? [0, 0.05], id: look ? 'look' : 'default-look'});
  const hands = doctorHandAt(o);
  for (const id of ['R', 'L'] as const) report({kind: 'hand', id, box: circleBox(hands[id].palm[0], hands[id].palm[1], 12.8 * o.scale), open: hands[id].hand === 'open'});
  return null;
};
/** The doctor on a board or in a shot: x = her middle, y = the ground line, scale = px per unit (a drop-in for the rig's PersonAt). */
export const DoctorAt: React.FC<Omit<DoctorProps, 'px' | 'headOnly'> & {x: number; y: number; scale: number; lookAt?: [number, number]; who?: string}> = ({x, y, scale, lookAt, who = DOCTOR_ID, ...p}) => {
  const o: DrPlace = {x, y, scale, view: p.view, facing: p.facing, pose: p.pose, bob: p.bob};
  const look = lookAt ? lookFrom(o, lookAt) : p.look;
  return (
    <FrameMove m={IDENTITY} who={who} body>
      <DoctorReport o={o} look={look} />
      <FaceOwned>
        <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
          <g transform={`scale(${scale})`}>
            <Doctor {...p} look={look} px={scale} />
          </g>
        </svg>
      </FaceOwned>
    </FrameMove>
  );
};
/** Just her head and hair, the face centred near (x, y); px = the skull's radius in pixels (for expression rows). */
export const DoctorHeadAt: React.FC<Pick<DoctorProps, 'view' | 'facing' | 'expr' | 'look' | 'talk' | 'blink' | 'skin'> & {x: number; y: number; px: number}> = ({x, y, px, ...p}) => {
  const k = px / (40 * HS);
  return (
    <FaceOwned>
      <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
        <g transform={`scale(${f1(k)}) translate(0 ${f1(-HEAD_CY - 8)})`}>
          <Doctor {...p} px={k} headOnly />
        </g>
      </svg>
    </FaceOwned>
  );
};
export const DOCTOR_UNITS_TALL = HEIGHT;
