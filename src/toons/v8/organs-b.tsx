/**
 * MedPeak Toons, look v8: organ and body-part characters, set B (12). Drawn with the shared kit only.
 * Each one is its real anatomy, simplified, with the small kit face in the upper half of the body
 * (the eye is the exception: its own iris and pupil are its face).
 *
 * Pieces built here because the kit has no such piece (kit.tsx is not changed):
 *   - oval(): a slightly uneven hand-drawn oval path (for openings, cut ends, the eyeball)
 *   - Tube: a thick stroked tube with the outline round it (nerve branches, the optic nerve)
 *   - three local colours: the eye's iris brown, a muscle red and the thyroid plum, all muted.
 */
import React, {useId} from 'react';
import {
  Board, Caption, EDGE, EDGE_IN, Eyes, Fig, FLESH, INK, INLINE, Mouth, OUTLINE, Panel, Shape, SKIN, TinyArm,
  shade, tint, type V8Props,
} from './kit';

// ------------------------------------------------------------------ local helpers
/** A hand-drawn oval: four quarter curves with slightly different radii, so it is never a perfect ellipse. */
const oval = (cx: number, cy: number, rx: number, ry: number, w = 0.04) => {
  const k = 0.5523;
  const rr = rx * (1 + w), rl = rx * (1 - w), rt = ry * (1 - w * 0.6), rb = ry * (1 + w * 0.6);
  return `M ${cx + rr} ${cy} C ${cx + rr} ${cy + k * rb} ${cx + k * rr} ${cy + rb} ${cx} ${cy + rb} `
    + `C ${cx - k * rl} ${cy + rb} ${cx - rl} ${cy + k * rb} ${cx - rl} ${cy} `
    + `C ${cx - rl} ${cy - k * rt} ${cx - k * rl} ${cy - rt} ${cx} ${cy - rt} `
    + `C ${cx + k * rr} ${cy - rt} ${cx + rr} ${cy - k * rt} ${cx + rr} ${cy} Z`;
};
/** Outline width in figure units at the board size we use (about 1.3 px a unit), for stroked tubes. */
const RIM = 2.6;
/** A tube drawn as a stroke with the outline round it. Draw all `ink` passes before all `fill` passes when tubes join. */
const Tube: React.FC<{d: string; w: number; fill: string; pass?: 'both' | 'ink' | 'fill'; cap?: 'round' | 'butt'}> = ({d, w, fill, pass = 'both', cap = 'round'}) => (
  <g>
    {pass !== 'fill' && <path d={d} stroke={INK} strokeWidth={w + RIM} strokeLinecap={cap} strokeLinejoin="round" fill="none" />}
    {pass !== 'ink' && <path d={d} stroke={fill} strokeWidth={w} strokeLinecap={cap} strokeLinejoin="round" fill="none" />}
  </g>
);
/** A cut end of a tube: an oval with a rim and a dark hole, turned by `rot` degrees. */
const CutEnd: React.FC<{x: number; y: number; rx: number; ry: number; rot?: number; rim: string; hole?: string; holeK?: number}> = ({x, y, rx, ry, rot = 0, rim, hole = FLESH.deep, holeK = 0.62}) => (
  <g transform={`translate(${x} ${y}) rotate(${rot})`}>
    <path d={oval(0, 0, rx, ry, 0.03)} fill={rim} {...EDGE} />
    {hole !== 'none' && <path d={oval(0, ry * 0.08, rx * holeK, ry * holeK, 0.05)} fill={hole} {...EDGE_IN} />}
  </g>
);

const SCLERA = '#fbf3e8';
const IRIS = '#9a7a56';
const MUSCLE = '#c95c61';
const PLUM = '#b25a6e';
const NERVE = tint(FLESH.butter, 0.4);
const LIP = '#d9737b';
const VESSEL = '#cf5560';

// ------------------------------------------------------------------ 1. the eye
export const EyeBall: React.FC<V8Props> = ({mood = 'open', mouth = 'o', look = [0.4, -0.35]}) => {
  const R = 22;
  const ix = -26 + look[0] * 6;
  const iy = -10 + look[1] * 6;
  const id = 'ib' + useId().replace(/:/g, '');
  const BALL = 'M -58 -6 C -58 -42 -32 -66 2 -66 C 36 -66 60 -40 60 -6 C 60 30 36 54 2 54 C -32 54 -58 30 -58 -6 Z';
  // the clear dome of the cornea, bulging out of the ball at the front-left
  const CORNEA = oval(-30, -10, 37, 35, 0.03);
  // where the iris is cut by a lid line (y at the left and right), by mood
  const lid: Record<string, [number, number] | undefined> = {
    sleepy: [iy - R * 0.05, iy - R * 0.05], bored: [iy - R * 0.4, iy - R * 0.4],
    angry: [iy - R * 0.85, iy - R * 0.05], sad: [iy - R * 0.05, iy - R * 0.85],
  };
  const lids = lid[mood];
  const ly = lids ? (lids[0] + lids[1]) / 2 : undefined;
  // the lid line, cut where it meets the iris circle
  const lidLine = (y0: number, y1: number) => {
    const x0 = ix - R - 3, x1 = ix + R + 3, dx = x1 - x0, dy = y1 - y0, fx = x0 - ix, fy = y0 - iy;
    const A = dx * dx + dy * dy, B = 2 * (fx * dx + fy * dy), Cc = fx * fx + fy * fy - R * R;
    const D = Math.sqrt(Math.max(0, B * B - 4 * A * Cc));
    const t0 = (-B - D) / (2 * A), t1 = (-B + D) / (2 * A);
    return `M ${x0 + dx * t0} ${y0 + dy * t0} L ${x0 + dx * t1} ${y0 + dy * t1}`;
  };
  const shut = mood === 'closed' || mood === 'wink';
  const happy = mood === 'happy';
  const browTilt = mood === 'angry' ? 0.5 : mood === 'sad' || mood === 'scared' ? -0.5 : -0.25;
  // the brow sits on the ball just above the dome of the cornea
  const by = -52 - (mood === 'scared' ? 3 : mood === 'angry' ? -2 : 0);
  return (
    <g>
      {/* the optic nerve leaves the back of the ball */}
      <Tube d="M 18 18 C 44 28 64 48 72 72" w={22} fill={FLESH.cream} cap="butt" />
      <path d="M 44 36 C 56 44 64 54 68 64" {...INLINE} />
      <CutEnd x={72} y={72} rx={12.5} ry={5} rot={-20} rim={FLESH.cream} hole={shade(FLESH.cream)} holeK={0.55} />
      {/* the ball */}
      <Shape d={BALL} fill={SCLERA} shadow={1.2}>
        {/* two thin lines of the eye's own muscles at the side */}
        <path d="M 38 -50 C 48 -36 52 -22 52 -6 M 28 42 C 38 36 46 26 50 14" {...INLINE} />
      </Shape>
      {/* the cornea: outside the ball it is the outline, over the ball only a thin inner line */}
      <defs>
        <clipPath id={id + 'o'}><path d={`M -200 -200 H 200 V 200 H -200 Z ${BALL}`} clipRule="evenodd" /></clipPath>
        <clipPath id={id + 'i'}><path d={BALL} /></clipPath>
      </defs>
      <path d={CORNEA} fill={SCLERA} />
      <path d={CORNEA} {...OUTLINE} clipPath={`url(#${id}o)`} />
      <path d={CORNEA} {...INLINE} clipPath={`url(#${id}i)`} />
      {/* the face: the iris and pupil */}
      {shut ? (
        <path d={`M ${ix - R * 0.85} ${iy} Q ${ix} ${iy + R * 0.55} ${ix + R * 0.85} ${iy}`} {...OUTLINE} />
      ) : (
        <g>
          <defs>
            <clipPath id={id}>
              {lids
                ? <path d={`M ${ix - R - 3} ${lids[0]} L ${ix + R + 3} ${lids[1]} L ${ix + R + 3} ${iy + R + 3} L ${ix - R - 3} ${iy + R + 3} Z`} />
                : happy
                  ? <path d={`M ${ix - R - 3} ${iy - R - 3} L ${ix + R + 3} ${iy - R - 3} L ${ix + R + 3} ${iy + R * 0.42} Q ${ix} ${iy - R * 0.05} ${ix - R - 3} ${iy + R * 0.42} Z`} />
                  : <circle cx={ix} cy={iy} r={R + 4} />}
            </clipPath>
          </defs>
          <g clipPath={`url(#${id})`}>
            <circle cx={ix} cy={iy} r={R} fill={IRIS} />
            {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
              const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
              return <path key={a} d={`M ${ix + c * 12} ${iy + s * 12} L ${ix + c * 19} ${iy + s * 19}`} {...INLINE} />;
            })}
            {mood === 'dizzy'
              ? <path d={`M ${ix - 2} ${iy} a 4 4 0 1 1 6 2 a 8 8 0 1 1 -12 -6`} {...INLINE} strokeWidth={3} />
              : <circle cx={ix + look[0] * 2} cy={iy + look[1] * 2 + (ly !== undefined ? 4 : 0)} r={mood === 'scared' ? 5 : 8.5} fill={INK} />}
            <circle cx={ix} cy={iy} r={R} {...OUTLINE} />
          </g>
          {lids && <path d={lidLine(lids[0], lids[1])} {...OUTLINE} />}
          {happy && <path d={`M ${ix - R * 0.95} ${iy + R * 0.32} Q ${ix} ${iy - R * 0.02} ${ix + R * 0.95} ${iy + R * 0.32}`} {...OUTLINE} />}
        </g>
      )}
      {/* one thin brow, raised: curious */}
      <path d={`M ${ix - R * 0.75} ${by - browTilt * 6} Q ${ix} ${by - 7} ${ix + R * 0.75} ${by + browTilt * 6}`} {...INLINE} />
      <Mouth x={-22} y={36} w={12} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 2. the nose
export const Nose: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [-0.4, 0]}) => {
  const C = SKIN.warm;
  return (
    <g>
      <Shape d="M -16 -86 C -18 -56 -30 -20 -48 14 C -60 34 -62 58 -40 64 C -28 67 -16 60 -6 62 C 6 72 32 74 48 62 C 66 48 62 22 46 12 C 40 -22 30 -60 22 -86 C 10 -92 -6 -92 -16 -86 Z" fill={C} shadow={1.2}>
        {/* the wing of the nostril */}
        <path d="M 34 14 C 18 20 16 46 28 60" {...INLINE} />
        {/* the ridge of the bridge, running down to the tip */}
        <path d="M -24 4 C -30 12 -36 18 -40 24" {...INLINE} />
        <path d="M 8 -84 C 10 -76 10 -68 9 -62" {...INLINE} />
        {/* the tip */}
        <path d="M -42 26 C -36 20 -26 22 -22 30" {...INLINE} />
        {/* nostrils, seen from a little below */}
        <path d="M -16 58 C -10 50 8 49 16 56 C 10 63 -8 64 -16 58 Z" fill={FLESH.deep} {...EDGE_IN} />
        <path d="M -48 56 C -44 51 -36 52 -32 57 C -36 61 -44 61 -48 56 Z" fill={FLESH.deep} {...EDGE_IN} />
      </Shape>
      <Eyes x={-1} y={-40} r={10} look={look} mood={mood} brows={mood === 'open' ? true : undefined} />
      <Mouth x={-6} y={-12} w={11} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 3. the ear
export const Ear: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [-0.6, 0.1]}) => {
  const C = SKIN.warm;
  return (
    <g>
      <Shape d="M -34 -62 C -14 -90 44 -94 64 -60 C 80 -32 72 -2 54 18 C 40 32 36 46 32 62 C 28 86 0 94 -14 80 C -24 68 -16 56 -24 42 C -32 32 -40 28 -38 16 C -36 4 -42 -6 -44 -18 C -46 -36 -44 -48 -34 -62 Z" fill={C} shadow={1.2}>
        {/* the inner edge of the rim (helix) */}
        <path d="M -30 -50 C -10 -78 38 -78 52 -50 C 62 -28 56 -4 42 10 C 32 20 26 36 22 54" {...INLINE} />
        {/* the hollow (concha), the one darker tone */}
        <path d="M -24 -4 C -14 -16 8 -14 16 0 C 22 14 14 30 -2 32 C -14 33 -20 26 -24 18 C -28 10 -28 2 -24 -4 Z" fill={shade(C)} {...EDGE_IN} />
        {/* the root of the rim dipping into the hollow, and the opening of the ear canal */}
        <path d="M -40 -30 C -28 -20 -12 -14 4 -12" {...INLINE} />
        <path d={oval(-16, 16, 5, 6.5)} fill={FLESH.deep} {...EDGE_IN} />
        {/* the antihelix ridge and its fork */}
        <path d="M 34 4 C 40 -10 36 -24 26 -30" {...INLINE} />
        <path d="M 26 -30 C 30 -42 28 -54 20 -60 M 26 -30 C 14 -28 0 -24 -14 -24" {...INLINE} />
        {/* the other edge of the ridge, so it reads as a raised Y, and the small notch-bump opposite the tragus */}
        <path d="M 24 6 C 30 -6 28 -16 20 -22 C 10 -20 -2 -18 -12 -18" {...INLINE} />
        <path d="M 30 -34 C 34 -46 34 -56 30 -62" {...INLINE} />
        <path d="M -4 40 C 4 36 12 36 16 30" {...INLINE} />
        {/* the tragus flap and the lobe */}
        <path d="M -36 18 C -28 12 -24 26 -30 34" {...INLINE} />
        <path d="M 4 66 C 10 74 18 72 22 64" {...INLINE} />
      </Shape>
      <Eyes x={2} y={-46} r={10} look={look} mood={mood} />
      <Mouth x={6} y={-32} w={8} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 4. the tongue
export const Tongue: React.FC<V8Props> = ({mood = 'happy', mouth = 'open', look = [0, 0]}) => {
  const C = FLESH.salmon;
  const dots: [number, number][] = [[-30, -4], [-22, 14], [-34, 26], [-14, 30], [24, -2], [32, 16], [18, 22], [30, 34], [-26, 42], [26, 46], [-8, 50], [8, 40], [-36, 8], [36, 0]];
  return (
    <g>
      {/* the mouth base: lips with the dark inside, the upper lip behind the tongue */}
      <path d="M -70 72 C -60 54 -30 48 0 52 C 30 48 60 54 70 72 C 56 92 24 96 0 94 C -24 96 -56 92 -70 72 Z" fill={LIP} {...EDGE} />
      <path d="M -54 72 C -40 62 -18 60 0 63 C 18 60 40 62 54 72 C 40 80 18 82 0 82 C -18 82 -40 80 -54 72 Z" fill={FLESH.deep} {...EDGE_IN} />
      <TinyArm from={[-40, 8]} to={[-74, -26]} bend={[-70, 6]} fill={C} hand="open" />
      <TinyArm from={[40, 8]} to={[76, -24]} bend={[72, 8]} fill={C} hand="open" />
      <Shape d="M -40 74 C -54 36 -54 -30 -38 -60 C -28 -80 -10 -84 0 -72 C 10 -84 28 -80 38 -60 C 54 -30 54 36 40 74 C 20 80 -20 80 -40 74 Z" fill={C} shadow={1.1}>
        {/* the groove down the middle, and the taste dots */}
        <path d="M 0 -4 C -2 16 2 40 0 76" {...INLINE} />
        {dots.map(([x, y]) => <circle key={`${x},${y}`} cx={x} cy={y} r={2.3} fill={shade(C, 0.22)} />)}
      </Shape>
      {/* the lower lip in front of the tongue */}
      <path d="M -70 72 C -56 92 -24 96 0 94 C 24 96 56 92 70 72 C 60 70 52 72 46 76 C 30 82 -30 82 -46 76 C -52 72 -60 70 -70 72 Z" fill={LIP} {...EDGE} />
      <Eyes x={0} y={-42} r={11} look={look} mood={mood} />
      <Mouth x={0} y={-20} w={14} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 5. the skin
export const Skin: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [0.3, -0.2]}) => {
  const C = SKIN.warm, D = FLESH.coral, F = FLESH.butter;
  const front = 'M -84 -24 C -46 -20 -6 -14 30 -8 C 32 20 28 50 30 74 C -8 68 -48 64 -84 60 C -86 30 -82 6 -84 -24 Z';
  const side = 'M 30 -8 C 46 -18 64 -30 80 -40 C 82 -6 78 18 80 40 C 64 52 46 64 30 74 C 28 50 32 20 30 -8 Z';
  const top = 'M -84 -24 C -62 -36 -48 -48 -30 -58 C 6 -54 44 -46 80 -40 C 62 -28 46 -18 30 -8 C -6 -14 -46 -20 -84 -24 Z';
  // layer borders on the front: under the top layer (wavy, the papillae) and the top of the fat
  const epi = 'M -90 -10 C -78 -4 -70 -12 -58 -6 C -46 0 -38 -8 -26 -2 C -14 4 -4 -4 8 2 C 18 6 26 0 40 6';
  const fat = 'M -90 34 C -60 38 -30 40 0 42 C 14 43 26 44 40 46';
  const sideEpi = 'M 30 6 C 46 -4 64 -16 84 -28';
  const sideFat = 'M 30 46 C 46 36 64 24 84 12';
  return (
    <g>
      {/* hairs standing out of the surface */}
      <path d="M -62 -22 C -66 -40 -56 -50 -62 -70" {...OUTLINE} />
      <path d="M 20 -30 C 18 -46 28 -56 22 -74" {...OUTLINE} />
      <path d="M 54 -40 C 54 -54 62 -60 58 -76" {...OUTLINE} />
      {/* the front cut: top layer, pink layer, fat */}
      <Shape d={front} fill={F} shadow={0}>
        <path d={`${fat} L 40 -40 L -90 -40 Z`} fill={D} />
        <path d={`${epi} L 40 -40 L -90 -40 Z`} fill={C} />
        <path d={epi} {...INLINE} />
        <path d={fat} {...INLINE} />
        {/* fat cells */}
        <path d="M -78 46 C -70 40 -60 44 -58 52 M -50 50 C -42 42 -30 46 -30 56 M -20 52 C -12 46 0 48 2 58 M 10 54 C 16 50 24 52 26 60 M -70 62 C -66 56 -56 56 -54 62" {...INLINE} />
        {/* a hair root running down to its bulb in the pink layer */}
        <path d="M -62 -22 C -60 -6 -62 6 -60 20" {...INLINE} />
        <path d={oval(-60, 23, 5, 5.5)} fill={shade(D, 0.2)} {...EDGE_IN} />
      </Shape>
      {/* the side cut: the same layers, in their darker tone */}
      <Shape d={side} fill={shade(F)} shadow={0}>
        <path d={`${sideFat} L 90 -60 L 20 -60 Z`} fill={shade(D)} />
        <path d={`${sideEpi} L 90 -60 L 20 -60 Z`} fill={shade(C)} />
        <path d={sideEpi} {...INLINE} />
        <path d={sideFat} {...INLINE} />
      </Shape>
      {/* the surface, with a few skin creases */}
      <Shape d={top} fill={C} shadow={0}>
        <path d="M -40 -40 l 10 4 M -10 -44 l 12 4 M 36 -40 l 10 3 M -54 -30 l 8 3" {...INLINE} />
      </Shape>
      <Eyes x={-18} y={8} r={11} look={look} mood={mood} brows={mood === 'open' ? true : undefined} />
      <Mouth x={-18} y={27} w={12} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 6. the nail
export const Nail: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [0.2, 0]}) => {
  const C = SKIN.warm, N = FLESH.rose;
  const plate = 'M -34 -72 C -34 -86 -18 -92 4 -92 C 26 -92 38 -86 38 -72 C 38 -58 34 -44 28 -33 C 12 -27 -8 -27 -24 -33 C -30 -44 -34 -58 -34 -72 Z';
  return (
    <g>
      <Shape d="M -40 92 C -40 62 -46 32 -50 2 C -54 -30 -52 -62 -40 -80 C -26 -98 22 -98 38 -82 C 52 -66 56 -34 52 -2 C 50 30 44 62 44 92 C 20 96 -18 96 -40 92 Z" fill={C} shadow={1.2}>
        {/* the skin folds along the sides of the nail and over its root */}
        <path d="M -41 -70 C -39 -54 -35 -42 -29 -32 M 45 -70 C 43 -54 39 -42 33 -32 M -26 -27 C -10 -20 14 -20 30 -27" {...INLINE} />
        {/* knuckle creases */}
        <path d="M -30 62 C -14 68 14 68 32 60 M -22 72 C -6 76 10 76 24 70" {...INLINE} />
      </Shape>
      <Shape d={plate} fill={N} shadow={0.9}>
        {/* the free edge, white, and the pale half-moon at the root */}
        <path d="M -40 -100 L 44 -100 L 44 -84 C 22 -87 -16 -87 -40 -83 Z" fill={SCLERA} />
        <path d="M -40 -83 C -16 -87 22 -87 44 -84" {...INLINE} />
        <path d="M -12 -28 C -10 -40 14 -40 16 -28 Z" fill={SCLERA} />
        <path d="M -12 -28 C -10 -40 14 -40 16 -28" {...INLINE} />      </Shape>
      <Eyes x={2} y={0} r={10} look={look} mood={mood} brows={mood === 'open' ? true : undefined} />
      <Mouth x={2} y={20} w={11} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 7. the throat (the voice box, seen from the front and a little above)
export const Throat: React.FC<V8Props> = ({mood = 'open', mouth = 'flat', look = [0.3, 0]}) => {
  const C = FLESH.salmon;
  return (
    <g>
      {/* the opening seen at a slight angle from above, with the two vocal folds in a V; its front is hidden by the shield */}
      <path d={oval(0, -58, 34, 12, 0.03)} fill={FLESH.maroon} {...EDGE} />
      <path d="M -3 -48 C -10 -54 -15 -59 -18 -64 C -21 -61 -21 -56 -16 -53 C -11 -51 -7 -49 -3 -48 Z" fill={FLESH.cream} {...EDGE_IN} />
      <path d="M 3 -48 C 10 -54 15 -59 18 -64 C 21 -61 21 -56 16 -53 C 11 -51 7 -49 3 -48 Z" fill={FLESH.cream} {...EDGE_IN} />
      <path d="M -2 -49 L 0 -65 L 2 -49 Z" fill={FLESH.deep} />
      <path d="M -7 -48 L 0 -38 L 7 -48 Z" fill={shade(C)} />
      {/* the tube: the shield of cartilage with its notch, the ring below it and a short piece of windpipe */}
      <Shape d="M -35 -58 C -37 -32 -34 -10 -26 6 C -25 34 -24 62 -24 90 C -8 94 8 94 24 90 C 24 62 25 34 26 6 C 34 -10 37 -32 35 -58 C 29 -50 16 -47 6 -47 L 0 -39 L -6 -47 C -16 -47 -29 -50 -35 -58 Z" fill={C} shadow={1.1}>
        {/* the edges of the shield wings */}
        <path d="M -29 -38 C -27 -20 -24 -6 -21 6 M 29 -38 C 27 -20 24 -6 21 6" {...INLINE} />
        {/* the ring below and the windpipe rings */}
        <path d="M -26 22 C -10 28 10 28 26 22 M -25 34 C -10 40 10 40 25 34" {...INLINE} />
        <path d="M -24 52 C -8 57 8 57 24 52 M -24 64 C -8 69 8 69 24 64 M -24 76 C -8 81 8 81 24 76" {...INLINE} />
      </Shape>
      {/* the epiglottis: a leaf-shaped lid hinged at the front rim, swung half open */}
      <g transform="translate(-12 -48) rotate(-48)">
        <Shape d="M -3 0 C -16 -8 -21 -28 -15 -42 C -10 -52 10 -52 15 -42 C 21 -28 16 -8 3 0 Z" fill={FLESH.rose} shadow={0.6}>
          <path d="M 0 -4 C 1 -16 1 -28 0 -40 M -13 -40 C -6 -36 6 -36 13 -40" {...INLINE} />
        </Shape>
      </g>
      <TinyArm from={[33, -26]} to={[72, -52]} bend={[64, -18]} fill={C} hand="open" />
      <Eyes x={0} y={-14} r={10} look={look} mood={mood} brows={mood === 'open' ? true : undefined} />
      <Mouth x={0} y={6} w={11} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 8. the windpipe
const RingBand: React.FC<{p: [number, number]; dir: [number, number]; half: number}> = ({p, dir, half}) => {
  const n = [-dir[1], dir[0]];
  const a = [p[0] - n[0] * half, p[1] - n[1] * half], b = [p[0] + n[0] * half, p[1] + n[1] * half];
  const c = [p[0] + dir[0] * 4, p[1] + dir[1] * 4];
  const o = [dir[0] * 6, dir[1] * 6];
  const l1 = `M ${a[0]} ${a[1]} Q ${c[0]} ${c[1]} ${b[0]} ${b[1]}`;
  const band = `${l1} L ${b[0] + o[0]} ${b[1] + o[1]} Q ${c[0] + o[0]} ${c[1] + o[1]} ${a[0] + o[0]} ${a[1] + o[1]} Z`;
  return (
    <g>
      <path d={band} fill={FLESH.rose} />
      <path d={l1} {...INLINE} />
      <path d={`M ${a[0] + o[0]} ${a[1] + o[1]} Q ${c[0] + o[0]} ${c[1] + o[1]} ${b[0] + o[0]} ${b[1] + o[1]}`} {...INLINE} />
    </g>
  );
};
const TRACHEA_RINGS = (ys: number[], half: number) => ys.map((y) => <RingBand key={y} p={[0, y]} dir={[0, 1]} half={half} />);

export const Windpipe: React.FC<V8Props> = ({mood = 'angry', mouth = 'o', look = [0, 0]}) => {
  const C = FLESH.coral;
  const L: [number, number] = [-0.62, 0.78], R: [number, number] = [0.62, 0.78];
  return (
    <g>
      <Shape d="M -26 -84 C -27 -40 -25 -10 -26 10 C -36 28 -56 50 -68 72 L -48 88 C -34 66 -18 48 -6 38 C -2 34 2 34 6 38 C 18 48 34 66 48 88 L 68 72 C 56 50 36 28 26 10 C 25 -10 27 -40 26 -84 C 26 -93 -26 -93 -26 -84 Z" fill={C} shadow={1}>
        {TRACHEA_RINGS([-78, -66, -4, 8], 30)}
        {[0.3, 0.55].map((t) => <RingBand key={'l' + t} p={[-16 - 42 * t, 26 + 52 * t]} dir={[L[0], L[1]]} half={16} />)}
        {[0.3, 0.55].map((t) => <RingBand key={'r' + t} p={[16 + 42 * t, 26 + 52 * t]} dir={[R[0], R[1]]} half={16} />)}
      </Shape>
      <CutEnd x={0} y={-84} rx={26} ry={7} rim={FLESH.rose} />
      <CutEnd x={-58} y={80} rx={13} ry={5} rot={38} rim={FLESH.rose} />
      <CutEnd x={58} y={80} rx={13} ry={5} rot={-38} rim={FLESH.rose} />
      <TinyArm from={[-26, -2]} to={[-38, -22]} bend={[-60, 0]} fill={C} hand="fist" />
      <Eyes x={0} y={-40} r={10} look={look} mood={mood} />
      <Mouth x={2} y={-18} w={11} kind={mouth} />
      {/* the cough: three short puff lines */}
      <path d="M 10 -24 l 7 -3 M 11 -18 l 8 0 M 10 -12 l 7 3" {...INLINE} />
    </g>
  );
};

// ------------------------------------------------------------------ 9. the thyroid
export const Thyroid: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.2, 0]}) => {
  const T = FLESH.coral;
  return (
    <g>
      {/* the short piece of windpipe behind the gland */}
      <Shape d="M -24 -80 C -25 -40 -23 40 -24 86 C -8 90 8 90 24 86 C 23 40 25 -40 24 -80 C 24 -89 -24 -89 -24 -80 Z" fill={T} shadow={0.8}>
        {TRACHEA_RINGS([-72, -60, 52, 64, 76], 28)}
      </Shape>
      <CutEnd x={0} y={-80} rx={24} ry={6.5} rim={FLESH.rose} />
      <TinyArm from={[-66, 10]} to={[-88, 38]} bend={[-90, 8]} fill={PLUM} hand="open" />
      <TinyArm from={[66, 0]} to={[86, -32]} bend={[92, 2]} fill={PLUM} hand="open" />
      {/* the butterfly: two lobes joined by the bridge (isthmus) across the windpipe */}
      <Shape d="M 0 -22 C 10 -24 18 -32 22 -46 C 26 -64 38 -74 50 -70 C 64 -62 72 -26 70 8 C 68 42 58 66 42 66 C 28 66 22 44 14 30 C 8 26 -8 26 -14 30 C -22 44 -30 68 -44 66 C -60 64 -70 40 -70 6 C -72 -28 -62 -62 -48 -70 C -38 -76 -26 -66 -22 -46 C -18 -32 -10 -24 0 -22 Z" fill={PLUM} shadow={1.1}>
        <path d="M -44 -48 C -52 -16 -50 22 -40 50 M 46 -48 C 54 -16 52 22 42 50" {...INLINE} />
      </Shape>
      <Eyes x={0} y={-6} r={10} look={look} mood={mood} />
      <Mouth x={0} y={14} w={11} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 10. the muscle
export const Muscle: React.FC<V8Props> = ({mood = 'happy', mouth = 'big', look = [0, 0]}) => {
  const C = MUSCLE, TD = FLESH.cream;
  return (
    <g>
      {/* the pale tendons at both ends */}
      <Shape d="M -9 -56 C -10 -70 -12 -80 -13 -90 C -5 -94 5 -94 12 -90 C 10 -80 9 -70 9 -56 Z" fill={TD} shadow={0.5}>
        <path d="M -2 -86 L -1 -62 M 5 -86 L 4 -64" {...INLINE} />
      </Shape>
      <Shape d="M -8 56 C -10 70 -11 80 -12 90 C -4 94 6 94 13 90 C 11 80 10 70 9 56 Z" fill={TD} shadow={0.5}>
        <path d="M -1 62 L -2 86 M 5 64 L 6 86" {...INLINE} />
      </Shape>
      <TinyArm from={[-40, 2]} to={[-70, -36]} bend={[-84, 4]} fill={C} hand="fist" />
      <TinyArm from={[42, 2]} to={[72, -36]} bend={[86, 4]} fill={C} hand="fist" />
      {/* the belly: a spindle, fatter in the middle */}
      <Shape d="M -8 -62 C -12 -50 -30 -42 -40 -22 C -50 0 -46 28 -26 48 C -18 56 -12 60 -8 64 C -2 67 4 67 9 64 C 13 58 20 54 28 46 C 46 26 52 -2 42 -24 C 32 -44 14 -50 9 -62 C 4 -65 -4 -65 -8 -62 Z" fill={C} shadow={1.2}>
        {/* fibre lines along the length, and the tendon spreading into both ends */}
        <path d="M -26 -36 C -40 -12 -38 22 -18 46 M 28 -36 C 42 -12 40 20 20 46 M -8 46 C -6 52 -4 56 -2 62 M 8 46 C 6 52 5 56 4 62" {...INLINE} />
        <path d="M -8 -62 C -6 -50 6 -50 9 -62 Z M -8 64 C -6 54 6 54 9 64 Z" fill={TD} {...EDGE_IN} />
      </Shape>
      <Eyes x={0} y={-20} r={11} look={look} mood={mood} />
      <Mouth x={0} y={2} w={14} kind={mouth} />
    </g>
  );
};

// ------------------------------------------------------------------ 11. the nerve cell
const DENDRITES: [string, number][] = [
  ['M -34 -24 C -50 -40 -58 -56 -70 -62', 8],
  ['M -60 -52 C -66 -46 -76 -44 -86 -46', 4.5],
  ['M -64 -58 C -64 -70 -60 -78 -62 -88', 4.5],
  ['M -20 -42 C -18 -60 -10 -72 -14 -86', 7.5],
  ['M -15 -70 C -6 -76 2 -80 10 -88', 4.5],
  ['M -46 -6 C -62 -4 -74 4 -88 -2', 7],
  ['M -72 1 C -78 10 -84 16 -88 26', 4.5],
  ['M -36 14 C -46 28 -50 40 -64 50', 7],
  ['M -52 36 C -48 46 -46 54 -48 64', 4.5],
  ['M 4 -36 C 18 -48 24 -60 36 -66', 6],
];
export const Nerve: React.FC<V8Props> = ({mood = 'scared', mouth = 'o', look = [0.6, -0.1]}) => {
  const C = NERVE;
  const soma = 'M -38 -30 C -34 -36 -28 -40 -22 -46 C -14 -42 -4 -42 4 -38 C 8 -34 12 -32 14 -26 C 16 -14 14 -2 8 6 C -2 14 -14 18 -26 16 C -32 18 -38 20 -42 18 C -42 10 -46 4 -52 -4 C -50 -14 -44 -22 -38 -30 Z';
  const axon = 'M 4 6 C 24 18 34 30 44 44 C 54 58 62 66 74 72';
  const myelin = ['M 15 12 C 19 15 22 18 25 21', 'M 33 30 C 36 34 39 38 42 42', 'M 50 53 C 53 57 56 60 60 63'];
  const ends = 'M 74 72 C 80 74 86 72 90 66 M 74 72 C 80 78 82 84 86 90 M 74 72 C 72 80 70 86 66 90';
  return (
    <g>
      {/* ink pass of every branch and the cell body, then the colour pass, so the joins stay open */}
      {DENDRITES.map(([d, w]) => <Tube key={d} d={d} w={w} fill={C} pass="ink" />)}
      <Tube d={axon} w={5} fill={C} pass="ink" />
      <Tube d={ends} w={3.5} fill={C} pass="ink" />
      <path d={soma} fill={C} stroke={INK} strokeWidth={RIM * 1.0} strokeLinejoin="round" />
      {DENDRITES.map(([d, w]) => <Tube key={d} d={d} w={w} fill={C} pass="fill" />)}
      <Tube d={axon} w={5} fill={C} pass="fill" />
      <Tube d={ends} w={3.5} fill={C} pass="fill" />
      <Shape d={soma} fill={C} line="none" shadow={1} />
      {/* the fatty sleeve (myelin) round the long tail, in beads */}
      {myelin.map((d) => <Tube key={d} d={d} w={12} fill={FLESH.cream} />)}
      {/* small knobs at the tail tips */}
      {[[90, 66], [86, 90], [66, 90]].map(([x, y]) => <path key={x + ',' + y} d={oval(x, y, 4, 3.6)} fill={C} {...EDGE_IN} />)}
      <Eyes x={-18} y={-22} r={10} look={look} mood={mood} />
      <Mouth x={-17} y={0} w={10} kind={mouth} />
      {/* jumpy: two little shake marks */}
      <path d="M -58 -30 l -8 -3 M 20 -40 l 8 -4" {...INLINE} />
    </g>
  );
};

// ------------------------------------------------------------------ 12. the blood vessel
export const BloodVessel: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [-0.2, 0]}) => {
  const C = VESSEL;
  return (
    <g>
      <Shape d="M -36 -42 C -6 -52 30 -50 58 -42 C 74 -40 84 -22 82 -4 C 80 14 72 28 58 28 C 28 34 0 50 -36 62 C -54 62 -68 40 -68 10 C -68 -20 -54 -42 -36 -42 Z" fill={C} shadow={1.2}>
        {/* the far cut end, just showing */}
        <path d="M 60 -40 C 50 -30 48 14 58 28" {...INLINE} />
      </Shape>
      {/* the near opening: the wall cut through, the pale lining, the dark inside */}
      <path d={oval(-36, 10, 31, 52, 0.03)} fill={tint(C, 0.32)} {...EDGE} />
      <path d={oval(-35, 11, 23, 42, 0.03)} fill={FLESH.rose} {...EDGE_IN} />
      <path d={oval(-34, 12, 17, 35, 0.04)} fill={FLESH.deep} {...EDGE_IN} />
      {/* two red cells riding inside */}
      <g transform="rotate(-20 -36 24)">
        <path d={oval(-36, 24, 7.5, 4.5)} fill={C} {...EDGE_IN} />
        <path d="M -39 24 L -33 24" {...INLINE} />
      </g>
      <g transform="rotate(25 -30 -6)">
        <path d={oval(-30, -6, 6, 3.6)} fill={C} {...EDGE_IN} />
      </g>
      <Eyes x={22} y={-20} r={10} look={look} mood={mood} />
      <Mouth x={22} y={0} w={11} kind={mouth} />
    </g>
  );
};

/** A check still, not part of the sheet: the eye's own lid logic in several moods. */
export const EyeMoodCheck: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, background: '#fbf7f0'}}>
    {(['open', 'angry', 'sleepy', 'closed', 'happy', 'sad'] as const).map((m, i) => (
      <React.Fragment key={m}>
        <Fig x={160 + i * 300} y={200} size={260}><EyeBall mood={m} /></Fig>
        <Caption x={160 + i * 300} y={340} name={m} />
      </React.Fragment>
    ))}
  </div>
);

// ------------------------------------------------------------------ registry and board
export const ORGANS_B: Record<string, React.FC<V8Props>> = {
  eye: EyeBall, nose: Nose, ear: Ear, tongue: Tongue, skin: Skin, nail: Nail,
  throat: Throat, windpipe: Windpipe, thyroid: Thyroid, muscle: Muscle, nerve: Nerve, bloodVessel: BloodVessel,
};

const ROWS: {label: string; items: {C: React.FC<V8Props>; name: string; role: string}[]}[] = [
  {label: 'Senses and surface', items: [
    {C: EyeBall, name: 'Eye', role: 'curious, hates being touched'},
    {C: Nose, name: 'Nose', role: 'the guard at the door'},
    {C: Ear, name: 'Ear', role: 'the listener'},
    {C: Tongue, name: 'Tongue', role: 'the taster who loves sweet'},
    {C: Skin, name: 'Skin', role: 'the wall, first to get hurt'},
    {C: Nail, name: 'Nail', role: 'a tough little shield'},
  ]},
  {label: 'Neck and inside the body', items: [
    {C: Throat, name: 'Throat', role: 'the gatekeeper'},
    {C: Windpipe, name: 'Windpipe', role: 'coughs when annoyed'},
    {C: Thyroid, name: 'Thyroid', role: 'the speed controller'},
    {C: Muscle, name: 'Muscle', role: 'strong and proud'},
    {C: Nerve, name: 'Nerve', role: 'the fast, jumpy messenger'},
    {C: BloodVessel, name: 'Blood vessel', role: 'the calm highway'},
  ]},
];

const FIG = 268;
const COL = (1864 - 56) / 6;
export const OrgansB: React.FC = () => (
  <Board kicker="Cast · organs 2 of 2" title="Body parts: senses, neck and tissues" note="Twelve body characters · real anatomy, simplified · one outline, flat colour, one darker tone · a small kit face in the upper half">
    {ROWS.map((row, r) => {
      const top = 168 + r * 432;
      const cy = top + 44 + FIG / 2;
      return (
        <React.Fragment key={row.label}>
          <Panel x={56} y={top} w={1808} h={410} label={row.label} />
          {row.items.map(({C, name, role}, i) => {
            const cx = 56 + COL * (i + 0.5);
            return (
              <React.Fragment key={name}>
                <Fig x={cx} y={cy} size={FIG}><C /></Fig>
                <Caption x={cx} y={cy + FIG / 2 + 6} name={name} note={role} w={280} />
              </React.Fragment>
            );
          })}
        </React.Fragment>
      );
    })}
  </Board>
);
