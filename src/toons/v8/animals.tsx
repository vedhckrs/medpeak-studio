/**
 * MedPeak Toons, look v8: the ANIMALS (dog, snake, bee, mosquito), drawn with the shared kit.
 * 100% code-drawn SVG, hand-tuned paths in the 200-unit figure space centred on (0, 0).
 *
 * Pieces built here because the kit does not have them (the kit itself is untouched):
 *   - OneEye: ONE kit eye for an animal seen from the side. It is the kit <Eyes> itself, with the
 *     second eye pushed away and clipped off, so lids, pupils and brows are exactly the kit's.
 *   - tube / tubeSide / tubeTicks: a closed outline built along a smooth centre line with a width that
 *     can taper (snake bodies, insect legs, a mosquito's abdomen), so every shape is a filled path
 *     carrying the kit outline, never a stroked line pretending to be a shape.
 *   - Coil: a true snake coil, one tube spiralling up, its back and front halves re-laid in depth order
 *     as open pieces (outline only along the sides), so each loop overlaps the one behind it.
 */
import React, {useId} from 'react';
import {Board, Caption, CLOTH, EDGE, EDGE_IN, Eyes, Fig, FLESH, INK, INLINE, Mouth, OUTLINE, Panel, Shape, SKIN, shade, tint, type Mood} from './kit';

// ------------------------------------------------------------------ colours (one family per animal)
const DOG = '#d29a5f'; // sandy brown street dog
const DOG_LT = tint(DOG, 0.55); // lighter muzzle, chest and belly
const DOG_FAR = shade(DOG); // the far legs and far ear
const NOSE = '#4a302a';
const SNAKE = '#7f9550'; // olive green
const SNAKE_LT = '#e3dfa6'; // paler belly
const BEE = '#f2b23e'; // amber
const BEE_DK = '#5a3a28'; // dark brown stripes, head, legs
const BEE_FUR = '#c98a45'; // the furry thorax
const BEE_FACE = CLOTH.brown; // the head
const BEE_MUZZLE = tint(BEE, 0.25); // the lighter face patch round the mouth
const WING = '#e9f2f6';
const MOS = '#8d8173'; // grey-brown mosquito
const TOOTH = '#ffffff';

// ------------------------------------------------------------------ geometry helpers
type P = [number, number];
const f = (n: number) => Math.round(n * 100) / 100;

/** A smooth centre line (Catmull-Rom) through the given points. */
const sample = (pts: P[], steps = 12): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? pts[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

type Frame = {c: P[]; n: P[]; t: P[]; w: number[]};
/** The centre line with its normals and the width at each sample (w: one width, or widths spread along it). */
const frame = (pts: P[], w: number | number[], steps = 12): Frame => {
  const c = sample(pts, steps);
  const N = c.length;
  const ws = Array.isArray(w) ? w : [w, w];
  const width = (i: number) => {
    const u = (i / (N - 1)) * (ws.length - 1);
    const k = Math.min(ws.length - 2, Math.floor(u));
    return ws[k] + (ws[k + 1] - ws[k]) * (u - k);
  };
  const t: P[] = c.map((_, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(N - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  });
  const n: P[] = t.map(([tx, ty]) => [-ty, tx]);
  return {c, n, t, w: c.map((_, i) => width(i))};
};

/** A closed tube outline with round ends around a centre line. */
const tube = (pts: P[], w: number | number[], steps = 12) => {
  const {c, n, w: ws} = frame(pts, w, steps);
  const L = c.map((p, i) => [p[0] + n[i][0] * ws[i] / 2, p[1] + n[i][1] * ws[i] / 2] as P);
  const R = c.map((p, i) => [p[0] - n[i][0] * ws[i] / 2, p[1] - n[i][1] * ws[i] / 2] as P);
  const N = c.length;
  const re = Math.max(0.3, ws[N - 1] / 2), rs = Math.max(0.3, ws[0] / 2);
  return (
    `M ${f(L[0][0])} ${f(L[0][1])} ` +
    L.slice(1).map((p) => `L ${f(p[0])} ${f(p[1])}`).join(' ') +
    ` A ${f(re)} ${f(re)} 0 0 0 ${f(R[N - 1][0])} ${f(R[N - 1][1])} ` +
    R.slice(0, -1).reverse().map((p) => `L ${f(p[0])} ${f(p[1])}`).join(' ') +
    ` A ${f(rs)} ${f(rs)} 0 0 0 ${f(L[0][0])} ${f(L[0][1])} Z`
  );
};

/** A band running along one side of a tube (a belly), off = where across (-0.5..0.5), share = how wide. */
const tubeSide = (pts: P[], w: number | number[], off: number, share: number, steps = 12) => {
  const {c, n, w: ws} = frame(pts, w, steps);
  const L = c.map((p, i) => [p[0] + n[i][0] * ws[i] * (off + share / 2), p[1] + n[i][1] * ws[i] * (off + share / 2)] as P);
  const R = c.map((p, i) => [p[0] + n[i][0] * ws[i] * (off - share / 2), p[1] + n[i][1] * ws[i] * (off - share / 2)] as P);
  return `M ${L.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L ')} L ${R.reverse().map((p) => `${f(p[0])} ${f(p[1])}`).join(' L ')} Z`;
};

/** Lines across a tube (scale rows on a belly, segments of an abdomen), from side a to side b of it. */
const tubeTicks = (pts: P[], w: number | number[], at: number[], a: number, b: number, steps = 12) => {
  const {c, n, w: ws} = frame(pts, w, steps);
  return at.map((u) => {
    const i = Math.round(u * (c.length - 1));
    const [x, y] = c[i], [nx, ny] = n[i], h = ws[i];
    return `M ${f(x + nx * h * a)} ${f(y + ny * h * a)} L ${f(x + nx * h * b)} ${f(y + ny * h * b)}`;
  }).join(' ');
};

/** Points on the lower half of an ellipse, left to right (a coil seen from the front). */
const arc = (cx: number, cy: number, a: number, b: number, k = 7): P[] =>
  Array.from({length: k}, (_, i) => {
    const th = Math.PI - (Math.PI * i) / (k - 1);
    return [cx + a * Math.cos(th), cy + b * Math.sin(th)] as P;
  });

/** Rotate a point about a pivot (degrees, SVG direction: positive = clockwise on screen). */
const rot = (p: P, deg: number, o: P = [0, 0]): P => {
  const r = (deg * Math.PI) / 180, dx = p[0] - o[0], dy = p[1] - o[1];
  return [o[0] + dx * Math.cos(r) - dy * Math.sin(r), o[1] + dx * Math.sin(r) + dy * Math.cos(r)];
};

// ------------------------------------------------------------------ one kit eye (side view)
/**
 * ONE kit eye centred on (x, y): the kit's own <Eyes>, with the second eye pushed three radii away and
 * clipped off, so the white, the pupil, the lid of a mood and the brow are exactly the kit's.
 */
const OneEye: React.FC<{x: number; y: number; r: number; look?: [number, number]; mood?: Mood}> = ({x, y, r, look = [0.5, 0], mood = 'open'}) => {
  const id = 'oe' + useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={id}><rect x={x - r * 2.2} y={y - r * 3} width={r * 4.4} height={r * 6} /></clipPath></defs>
      <g clipPath={`url(#${id})`}>
        <Eyes x={x + r * 3} y={y} r={r} gap={r * 4} look={look} mood={mood} />
      </g>
    </g>
  );
};

// ================================================================== DOG
// A medium street dog seen from the side, facing right: deep chest, tucked belly, hocks on the hind
// legs, half-up ears with folded tips. The far legs and far ear are the one darker tone.

// The body is ONE silhouette with the near legs in it (no seams): neck, withers, a slightly arched loin,
// sloping croup, the thigh and hock of the near hind leg, the tucked belly, the near fore leg, deep chest.
const DOG_LEGS_MID = ' C -64 -27 -74 -18 -76 -4 C -77 8 -74 22 -69 32 C -66 38 -72 46 -74 52 C -68 58 -62 62 -60 70 C -62 76 -61 81 -57 81 L -45 81 C -42 81 -39 80 -39 77 C -39 74 -43 71 -48 70 C -50 64 -52 58 -54 50 C -48 42 -38 34 -32 26 C -30 18 -28 10 -24 6 C -8 6 4 16 12 20 C 14 34 20 48 22 62 C 22 68 21 72 22 76 C 22 80 26 81 28 81 L 40 81 C 46 81 46 73 38 70 C 34 68 32 64 32 58 C 32 44 34 34 38 24';
const DOG_BODY = 'M 54 -62 C 44 -54 34 -40 22 -32 C 0 -27 -30 -31 -50 -28' + DOG_LEGS_MID + ' C 46 20 52 12 52 4 C 56 -10 57 -26 60 -40 Z';
// inner lines: the front of the thigh down to the stifle, the elbow
const DOG_INNER = 'M -50 -16 C -36 -8 -31 8 -32 24 M 12 20 C 13 14 16 10 20 8 M -64 48 q -2 4 -4 6';
// the light underside: throat, chest and belly
const DOG_UNDER = 'M 66 -40 C 54 -16 46 8 26 14 C 8 12 -10 2 -28 6 L -26 14 C -10 10 2 16 12 22 C 20 26 30 28 40 27 C 52 20 60 4 66 -40 Z';
// fore leg: elbow under the chest, straight forearm, the pastern a little forward, a round paw
const FORELEG = 'M 12 0 C 14 24 20 46 22 62 C 22 68 21 72 22 76 C 22 80 26 81 28 81 L 40 81 C 46 81 46 73 38 70 C 34 68 32 64 32 58 C 32 40 34 20 38 0 Z';
// the near hind leg carries its own thigh (drawn over the body): stifle forward, hock back, paw forward
const HINDLEG = 'M -50 -24 C -34 -16 -28 10 -32 26 C -38 34 -48 42 -54 50 C -52 58 -50 64 -48 70 C -43 71 -39 74 -39 77 C -39 80 -42 81 -45 81 L -57 81 C -61 81 -62 76 -60 70 C -62 62 -68 58 -74 52 C -72 46 -66 38 -69 32 C -74 22 -77 8 -76 -4 C -74 -16 -66 -24 -60 -24 C -57 -25 -53 -25 -50 -24 Z';
const TOES_F = 'M 34 75 q 1 3 0 6 M 39 74 q 1 3 0 6';
const TOES_H = 'M -51 75 q 1 3 0 6 M -46 75 q 1 3 0 6';
// sickle tail curling up over the back
const TAIL_UP = 'M -66 -24 C -82 -36 -90 -56 -80 -70 C -74 -78 -62 -77 -60 -68 C -66 -70 -71 -66 -73 -58 C -75 -46 -68 -34 -56 -28 Z';

// the head in its own space: origin in the middle of the skull, nose to the right
const HEAD = 'M -16 0 C -16 -14 -2 -20 10 -16 C 16 -14 18 -8 22 -4 C 28 -2 36 -2 39 4 C 41 9 38 13 32 14 C 24 19 14 22 6 18 C -4 20 -14 12 -16 0 Z';
const MUZZLE = 'M 17 -7 C 22 1 30 -1 44 -4 L 44 30 L -4 30 C 6 22 14 12 17 -7 Z';
const NOSE_SIDE = 'M 33 -3 C 37 -5 41 -2 41 2 C 41 6 37 7 34 5 C 32 3 31 -1 33 -3 Z';
// half-up ear: a wide base, the upper third folded forward
const EAR_UP = 'M -13 -12 C -15 -22 -12 -31 -7 -36 C -4 -39 0 -38 2 -35 C 3 -28 4 -20 5 -15 Z';
const EAR_FLAP = 'M -8 -34 C -4 -39 1 -38 3 -35 C 6 -32 9 -28 10 -23 C 4 -25 -3 -29 -8 -34 Z';
const EAR_BACK = 'M -4 -13 C -12 -20 -24 -22 -33 -16 C -26 -11 -16 -8 -6 -7 Z';

const DogLegsFar: React.FC<{front?: number; hind?: number}> = ({front = 0, hind = 0}) => (
  <>
    <g transform={`translate(-11 -3) rotate(${front} 26 0)`}><Shape d={FORELEG} fill={DOG_FAR} shadow={0} /></g>
    <g transform={`translate(12 -3) rotate(${hind} -50 0)`}><Shape d={HINDLEG} fill={DOG_FAR} shadow={0} /></g>
  </>
);

const DogStand: React.FC = () => (
  <g transform="translate(-6 6)">
    <Shape d={TAIL_UP} fill={DOG} shadow={0.5} />
    <DogLegsFar />
    <Shape d={DOG_BODY} fill={DOG}>
      <path d={DOG_UNDER} fill={DOG_LT} />
      <path d={DOG_INNER} {...INLINE} />
      <path d="M 48 0 l -4 4 M 42 10 l -4 4" {...INLINE} />
    </Shape>
    <path d={TOES_F} {...INLINE} />
    <path d={TOES_H} {...INLINE} />
    {/* head */}
    <g transform="translate(58 -58) scale(1.15)">
      <g transform="translate(9 2)"><Shape d={EAR_UP} fill={DOG_FAR} shadow={0} /><Shape d={EAR_FLAP} fill={DOG_FAR} shadow={0} /></g>
      <g transform="translate(1 3)"><Shape d={EAR_UP} fill={DOG} shadow={0.4} /></g>
      <Shape d={HEAD} fill={DOG}>
        <path d={MUZZLE} fill={DOG_LT} />
      </Shape>
      <g transform="translate(1 3)"><Shape d={EAR_FLAP} fill={DOG} shadow={0.3} /></g>
      <path d={NOSE_SIDE} fill={NOSE} {...EDGE_IN} />
      <path d="M 37 8 C 33 11 27 12 20 10 Q 16 9 17 6" {...INLINE} />
      <path d="M -12 8 q 3 4 8 4" {...INLINE} />
      <OneEye x={10} y={-6} r={7} look={[0.5, 0]} />
    </g>
  </g>
);

// ---- the snarl: a real crouch. Front end low, elbows bent and the fore paws forward, hind legs braced
// back, the rump higher than the withers, rounded hackle tufts along the neck and withers.
/** Rounded fur tufts between the given points (from right to left along a back line). */
const tufts = (pts: P[]) =>
  pts.slice(1).map((p, i) => {
    const q = pts[i];
    return `C ${f(q[0] - 1)} ${f(q[1] - 11)} ${f(p[0] + 5)} ${f(p[1] - 12)} ${f(p[0])} ${f(p[1])}`;
  }).join(' ');
const HACKLES: P[] = [[50, -16], [41, -19], [32, -21], [23, -23], [14, -24], [5, -25], [-4, -25], [-13, -26]];
const DOG_BODY_SNARL =
  `M 50 -16 ${tufts(HACKLES)} C -30 -28 -46 -32 -56 -32 C -70 -31 -80 -22 -82 -8` +
  // braced hind leg: thigh, a clear hock point, the paw planted behind
  ' C -84 6 -84 20 -80 30 C -78 38 -84 44 -86 52 C -83 60 -80 68 -80 74 C -82 80 -80 82 -76 82 L -64 82 C -60 82 -58 79 -60 76 C -62 73 -66 72 -68 70 C -70 64 -70 58 -71 52 C -66 44 -58 36 -52 28 C -48 22 -46 14 -40 8' +
  // tucked belly, then the fore leg: elbow bent back, forearm angled forward, paw forward
  ' C -26 6 -8 12 2 20 C 2 28 -2 36 0 42 C 4 50 18 60 28 68 C 30 72 30 76 32 78 C 32 82 34 82 38 82 L 50 82 C 56 82 56 74 48 72 C 44 70 42 68 40 64 C 34 56 26 46 24 38 C 24 32 26 28 30 26 C 38 22 44 14 48 6 L 60 -4 Z';
const SNARL_FORE_FAR = 'M -4 10 C 2 28 -2 36 0 42 C 4 50 18 60 28 68 C 30 72 30 76 32 78 C 32 82 34 82 38 82 L 50 82 C 56 82 56 74 48 72 C 44 70 42 68 40 64 C 34 56 26 46 24 38 C 24 30 22 20 20 10 Z';
const SNARL_HIND_FAR = 'M -70 -20 C -84 -14 -84 20 -80 30 C -78 38 -84 44 -86 52 C -83 60 -80 68 -80 74 C -82 80 -80 82 -76 82 L -64 82 C -60 82 -58 79 -60 76 C -62 73 -66 72 -68 70 C -70 64 -70 58 -71 52 C -66 44 -58 36 -52 28 C -46 18 -50 0 -56 -16 Z';

const DogSnarl: React.FC = () => (
  <g transform="translate(-6 2)">
    {/* tail low and stiff */}
    <Shape d="M -78 -24 C -86 -18 -92 -8 -96 2 C -97 6 -93 8 -91 4 C -86 -4 -80 -12 -72 -18 Z" fill={DOG} shadow={0.5} />
    <g transform="translate(-12 -1)"><Shape d={SNARL_FORE_FAR} fill={DOG_FAR} shadow={0} /></g>
    <g transform="translate(13 -1)"><Shape d={SNARL_HIND_FAR} fill={DOG_FAR} shadow={0} /></g>
    <Shape d={DOG_BODY_SNARL} fill={DOG}>
      <path d="M 72 -10 C 60 4 50 14 30 20 C 10 14 -10 4 -40 8 L -38 14 C -20 10 -6 14 2 22 C 10 28 20 30 30 30 C 46 22 62 8 72 -10 Z" fill={DOG_LT} />
      <path d="M -60 -20 C -50 -8 -48 12 -52 26 M 6 34 q 6 4 10 10 M -72 46 q -3 3 -4 6" {...INLINE} />
    </Shape>
    <path d="M 42 76 q 1 3 0 6 M 47 76 q 1 3 0 6 M -72 76 q 1 3 0 6 M -67 76 q 1 3 0 6" {...INLINE} />
    {/* head lowered and thrust forward, lips curled, teeth bared, ears pinned back */}
    <g transform="translate(56 -4) rotate(12) scale(1.15)">
      <g transform="translate(3 -1)"><Shape d={EAR_BACK} fill={DOG_FAR} shadow={0} /></g>
      <path d="M 8 9 L 30 3 C 38 3 42 9 40 14 L 37 23 C 26 23 14 19 6 16 Z" fill={FLESH.maroon} {...EDGE_IN} />
      <path d="M 20 19 L 24 19 L 22 13 Z M 27 21 L 32 21 L 29.5 12 Z" fill={TOOTH} {...EDGE_IN} />
      <Shape d="M 6 12 C 16 16 26 20 34 21 C 39 22 39 27 34 28 C 24 30 12 26 2 20 Z" fill={DOG_LT} shadow={0.4} />
      <path d="M 12 12 C 18 7 26 5 39 8 L 39 12 C 28 10 20 11 12 14 Z" fill={FLESH.coral} />
      <path d="M 18 11 L 23 11 L 20.5 17 Z M 29 10 L 35 10 L 32.5 20.5 Z M 35.5 10 L 39 10 L 37.5 15 Z" fill={TOOTH} {...EDGE_IN} />
      <Shape d="M -16 0 C -16 -14 -2 -20 10 -16 C 16 -14 18 -8 22 -4 C 28 -2 36 -2 39 4 C 41 9 39 12 36 12 C 32 12 28 6 24 6 C 20 6 16 10 12 13 C 6 16 -4 18 -10 12 C -14 8 -16 4 -16 0 Z" fill={DOG}>
        <path d="M 17 -7 C 22 1 30 -1 44 -4 L 44 30 L -4 30 C 6 22 12 14 17 -7 Z" fill={DOG_LT} />
      </Shape>
      <g transform="translate(-4 2)"><Shape d={EAR_BACK} fill={DOG} shadow={0.4} /></g>
      <path d={NOSE_SIDE} fill={NOSE} {...EDGE_IN} />
      <path d="M 19 -6 q 2.5 3 0.5 6 M 24 -4.5 q 2.5 3 0.5 6 M 29 -3 q 2 2.5 0.5 5" {...INLINE} />
      <OneEye x={9} y={-6} r={7} look={[0.6, 0.1]} mood="angry" />
    </g>
  </g>
);

// ---- the head alone: the SAME dog, three-quarter, larger. Flat skull, clear stop, long narrow muzzle,
// the same half-up ears, light muzzle and jaw, mouth open: fangs, tongue, the lip curled off the gum.
const HEAD_SKULL = 'M -74 -14 C -78 -40 -62 -62 -36 -64 C -16 -66 4 -60 16 -50 C 22 -45 26 -42 34 -41 C 52 -38 72 -36 86 -34 C 96 -32 98 -20 90 -16 C 86 -14 82 -13 78 -13 C 74 -14 70 -18 64 -17 C 58 -16 52 -10 44 -6 C 34 -2 24 2 14 8 C -10 16 -40 22 -60 14 C -70 8 -74 0 -74 -14 Z';

const DogHead: React.FC = () => (
  <g transform="translate(-4 2)">
    {/* neck, cut clean */}
    <Shape d="M -66 -4 C -78 24 -82 56 -80 84 L -6 84 C -8 64 -4 40 12 14 Z" fill={DOG}>
      <path d="M 4 18 C -8 44 -14 64 -16 90 L 20 90 Z" fill={DOG_LT} />
    </Shape>
    {/* ears: the far one, then the near one behind the skull */}
    <g transform="translate(-2 -24) scale(1.6)"><Shape d={EAR_UP} fill={DOG_FAR} shadow={0} /><Shape d={EAR_FLAP} fill={DOG_FAR} shadow={0} /></g>
    <g transform="translate(-40 -22) scale(1.9)"><Shape d={EAR_UP} fill={DOG} shadow={0.4} /></g>
    {/* the open mouth */}
    <path d="M 6 6 C 30 -4 60 -20 90 -20 C 87 -2 80 14 72 27 C 50 20 28 12 6 6 Z" fill={FLESH.maroon} {...EDGE_IN} />
    <path d="M 10 6 C 30 4 54 10 70 18 C 64 30 34 26 14 18 Z" fill={FLESH.salmon} {...EDGE_IN} />
    <path d="M 52 20 L 60 22 L 57 5 Z M 64 23 L 69 24 L 67 15 Z" fill={TOOTH} {...EDGE_IN} />
    <Shape d="M 2 2 C 22 10 46 18 68 24 C 76 26 78 34 72 37 C 56 41 30 37 10 29 C -4 23 -6 10 2 2 Z" fill={DOG_LT} shadow={0.5} />
    <path d="M 62 -12 L 70 -12 L 66.5 7 Z M 74 -12 L 79 -12 L 77 -4 Z M 80 -12 L 85 -13 L 83 -5 Z M 42 -4 L 49 -6 L 46 3 Z" fill={TOOTH} {...EDGE_IN} />
    <path d="M 18 6 C 34 -2 52 -12 64 -20 C 72 -21 80 -18 90 -19 L 89 -11 C 78 -10 66 -11 52 -6 C 40 -2 30 2 20 8 Z" fill={FLESH.coral} />
    {/* skull and upper muzzle */}
    <Shape d={HEAD_SKULL} fill={DOG}>
      <path d="M 22 -44 C 32 -32 56 -28 104 -28 L 104 40 L -10 40 C 6 22 16 -12 22 -44 Z" fill={DOG_LT} />
    </Shape>
    <g transform="translate(-40 -22) scale(1.9)"><Shape d={EAR_FLAP} fill={DOG} shadow={0.3} /></g>
    <path d="M 80 -40 C 88 -44 99 -40 99 -32 C 99 -25 93 -23 87 -25 C 81 -27 78 -35 80 -40 Z" fill={NOSE} {...EDGE_IN} />
    <path d="M 36 -38 q 2 4 0 8 M 44 -37 q 2 4 0 8 M 52 -36 q 2 3.5 0 7" {...INLINE} />
    <path d="M -58 -2 q 4 6 10 7" {...INLINE} />
    <Eyes x={-6} y={-40} r={12} mood="angry" look={[0.8, 0.15]} />
  </g>
);

export const Dog: React.FC<{pose?: 'stand' | 'snarl' | 'head'}> = ({pose = 'stand'}) =>
  pose === 'snarl' ? <DogSnarl /> : pose === 'head' ? <DogHead /> : <DogStand />;

// ================================================================== SNAKE
// Olive green with a paler belly and darker cross bands (the one darker tone).

// ---- a true coil: one body spiralling up from the tail (outside, on the ground) to the neck (inside, on
// top). It is drawn as one outlined tube, then its back halves and front halves are laid over it in
// depth order (open pieces, outline only along the sides) so each loop overlaps the one behind it.
type CoilSpec = {cx: number; cy0: number; cy1: number; a0: number; a1: number; k: number; phi0: number; phi1: number; w: number; neck: P[]; neckW: number};

const buildCoil = (s: CoilSpec) => {
  const pts: P[] = [];
  const ws: number[] = [];
  const front: boolean[] = [];
  const n = Math.ceil((s.phi1 - s.phi0) / 0.05);
  for (let i = 0; i <= n; i++) {
    const p = i / n;
    const phi = s.phi0 + (s.phi1 - s.phi0) * p;
    const a = s.a0 + (s.a1 - s.a0) * p;
    const cy = s.cy0 + (s.cy1 - s.cy0) * p;
    pts.push([s.cx + a * Math.cos(phi), cy + a * s.k * Math.sin(phi)]);
    ws.push(s.w * (0.18 + 0.82 * Math.min(1, p / 0.16))); // the tail tapers
    front.push(Math.sin(phi) > 0);
  }
  const nk = sample([pts[n], ...s.neck], 10).slice(1);
  nk.forEach((q, j) => {
    pts.push(q);
    ws.push(s.w + (s.neckW - s.w) * (j / (nk.length - 1)));
    front.push(false);
  });
  // runs of the coil that are all front or all back, then the neck
  const runs: {i0: number; i1: number; kind: 'front' | 'back' | 'neck'}[] = [];
  let start = 0;
  for (let i = 1; i <= n; i++) {
    if (i === n || front[i] !== front[start]) {
      runs.push({i0: start, i1: i, kind: front[start] ? 'front' : 'back'});
      start = i;
    }
  }
  runs.push({i0: n, i1: pts.length - 1, kind: 'neck'});
  return {pts, ws, runs, n};
};

/** An open piece of a tube (no end caps): the fill polygon and the two side lines. */
const piece = (fr: Frame, i0: number, i1: number) => {
  const a = Math.max(0, i0), b = Math.min(fr.c.length - 1, i1);
  const L: P[] = [], R: P[] = [];
  for (let i = a; i <= b; i++) {
    const [x, y] = fr.c[i], [nx, ny] = fr.n[i], h = fr.w[i] / 2;
    L.push([x + nx * h, y + ny * h]);
    R.push([x - nx * h, y - ny * h]);
  }
  const line = (q: P[]) => 'M ' + q.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L ');
  return {fill: `${line(L)} L ${[...R].reverse().map((p) => `${f(p[0])} ${f(p[1])}`).join(' L ')} Z`, sides: `${line(L)} ${line(R)}`};
};

/** Cross bands at the given sample indices of a frame. */
const bandsAt = (fr: Frame, idx: number[], bw: number) =>
  idx.map((i) => {
    const [x, y] = fr.c[i], [nx, ny] = fr.n[i], [tx, ty] = fr.t[i], h = fr.w[i];
    const p = (s: number, q: number) => `${f(x + tx * s + nx * q)} ${f(y + ty * s + ny * q)}`;
    return `M ${p(-bw / 2, -h)} L ${p(bw / 2, -h)} L ${p(bw / 2 + bw * 0.25, h)} L ${p(-bw / 2 + bw * 0.25, h)} Z`;
  }).join(' ');

/** A band along one side of a frame between two indices (the belly), and scale lines across it. */
const bellyAt = (fr: Frame, i0: number, i1: number, off: number, share: number) => {
  const L: string[] = [], R: string[] = [];
  for (let i = i0; i <= i1; i++) {
    const [x, y] = fr.c[i], [nx, ny] = fr.n[i], h = fr.w[i];
    L.push(`${f(x + nx * h * (off + share / 2))} ${f(y + ny * h * (off + share / 2))}`);
    R.push(`${f(x + nx * h * (off - share / 2))} ${f(y + ny * h * (off - share / 2))}`);
  }
  return `M ${L.join(' L ')} L ${R.reverse().join(' L ')} Z`;
};
const scalesAt = (fr: Frame, idx: number[], off: number, share: number) =>
  idx.map((i) => {
    const [x, y] = fr.c[i], [nx, ny] = fr.n[i], h = fr.w[i];
    return `M ${f(x + nx * h * (off - share / 2))} ${f(y + ny * h * (off - share / 2))} L ${f(x + nx * h * (off + share / 2))} ${f(y + ny * h * (off + share / 2))}`;
  }).join(' ');

const Coil: React.FC<{spec: CoilSpec}> = ({spec}) => {
  const {pts, ws, runs, n} = buildCoil(spec);
  const fr = frame(pts, ws, 1);
  const N = pts.length;
  const full = tube(pts, ws, 1);
  const bandIdx: number[] = [];
  for (let i = 9; i < N - 4; i += 11) bandIdx.push(i);
  const BELLY = 0.28, SHARE = 0.42;
  const scaleIdx: number[] = [];
  for (let i = n + 2; i < N - 2; i += 3) scaleIdx.push(i);
  const shading = (
    <>
      <path d={full} fill={shade(SNAKE)} />
      <path d={full} fill={SNAKE} transform="translate(-2.5 -3)" />
    </>
  );
  const drawPiece = (r: {i0: number; i1: number; kind: string}, key: string) => {
    const pc = piece(fr, r.i0 - 1, r.kind === 'neck' ? r.i1 - 2 : r.i1 + 1);
    const near = bandIdx.filter((i) => i >= r.i0 - 2 && i <= r.i1 + 2);
    return (
      <g key={key}>
        <Shape d={pc.fill} fill={SNAKE} shadow={0} line="none">
          {shading}
          {near.length > 0 && <path d={bandsAt(fr, near, 6)} fill={shade(SNAKE)} />}
          {r.kind === 'neck' && <path d={bellyAt(fr, r.i0, N - 1, BELLY, SHARE)} fill={SNAKE_LT} />}
          {r.kind === 'neck' && <path d={scalesAt(fr, scaleIdx, BELLY, SHARE)} {...INLINE} />}
        </Shape>
        <path d={pc.sides} {...OUTLINE} />
      </g>
    );
  };
  return (
    <g>
      <Shape d={full} fill={SNAKE} shadow={0.5}>
        <path d={bandsAt(fr, bandIdx, 6)} fill={shade(SNAKE)} />
      </Shape>
      {runs.filter((r) => r.kind === 'back').map((r, i) => drawPiece(r, 'b' + i))}
      {runs.filter((r) => r.kind === 'neck').map((r, i) => drawPiece(r, 'n' + i))}
      {runs.filter((r) => r.kind === 'front').map((r, i) => drawPiece(r, 'f' + i))}
    </g>
  );
};

const SnakeCoiled: React.FC = () => (
  <g transform="translate(-4 2)">
    <Coil spec={{cx: 0, cy0: 60, cy1: 26, a0: 74, a1: 30, k: 0.24, phi0: Math.PI / 2 - 0.7, phi1: Math.PI * 1.5 + Math.PI * 4, w: 20, neck: [[14, 14], [24, -4], [14, -26], [8, -44], [18, -60]], neckW: 16}} />
    {/* head, calm, tongue out */}
    <path d="M 54 -62 L 66 -61 L 74 -66 L 67.5 -60 L 74 -55 L 66 -58.5 L 54 -58.5 Z" fill={FLESH.artery} {...EDGE_IN} />
    <Shape d="M 4 -64 C 2 -78 16 -86 32 -84 C 46 -82 57 -73 57 -64 C 57 -56 46 -52 34 -52 C 22 -52 6 -54 4 -64 Z" fill={SNAKE} shadow={0.5}>
      <path d="M 0 -56 C 20 -58 40 -60 60 -60 L 60 -40 L 0 -40 Z" fill={SNAKE_LT} />
    </Shape>
    <path d="M 54 -60 C 46 -58 40 -58 34 -60" {...INLINE} />
    <circle cx={52} cy={-70} r={1.2} fill={INK} />
    <OneEye x={31} y={-71} r={7.5} look={[0.6, 0]} />
  </g>
);

const SnakeStrike: React.FC = () => (
  <g transform="translate(12 4)">
    <Coil spec={{cx: -8, cy0: 68, cy1: 52, a0: 70, a1: 44, k: 0.24, phi0: Math.PI / 2 - 0.6, phi1: Math.PI * 1.5 + Math.PI * 2, w: 20, neck: [[10, 34], [22, 14], [8, -10], [-24, -28], [-34, -50], [-22, -72]], neckW: 15}} />
    {/* head: jaws wide open, two fangs */}
    <path d="M -18 -76 L 30 -82 L 26 -52 L -18 -66 Z" fill={FLESH.maroon} {...EDGE_IN} />
    <path d="M -10 -72 C 2 -72 12 -68 20 -64 C 12 -61 2 -64 -10 -68 Z" fill={FLESH.coral} {...EDGE_IN} />
    <Shape d="M -22 -70 C -10 -68 6 -62 22 -54 C 27 -52 25 -47 20 -47 C 4 -49 -12 -55 -26 -62 Z" fill={SNAKE_LT} shadow={0.4} />
    <path d="M 18 -79 L 23.5 -79.5 C 23 -73 21.5 -68.5 18.5 -65 C 18.5 -70 18 -74 18 -79 Z M 9 -78 L 14 -78.5 C 13.5 -73 12 -69.5 9.5 -67 C 9.5 -71 9 -74 9 -78 Z" fill={TOOTH} {...EDGE_IN} />
    <Shape d="M -32 -78 C -34 -90 -18 -96 -2 -94 C 12 -92 26 -88 32 -82 C 34 -79 31 -76 27 -77 L -6 -74 C -18 -70 -30 -70 -32 -78 Z" fill={SNAKE} shadow={0.5} />
    <circle cx={26} cy={-87} r={1.2} fill={INK} />
    <OneEye x={-6} y={-84} r={7} look={[0.6, 0.1]} mood="angry" />
  </g>
);

export const Snake: React.FC<{pose?: 'coiled' | 'strike'}> = ({pose = 'coiled'}) => (pose === 'strike' ? <SnakeStrike /> : <SnakeCoiled />);

// ================================================================== BEE
// A honey bee from the side, facing right: dark head, furry brown thorax, amber abdomen with dark
// bands, two pale wings on the thorax, four of the six legs, elbowed antennae.

const BEE_ABDOMEN = 'M -2 -6 C -14 -18 -48 -18 -64 0 C -74 12 -72 30 -60 38 C -48 46 -20 40 -6 26 C 2 18 4 4 -2 -6 Z';
const BEE_STRIPES = 'M -16 -30 C -22 0 -24 20 -20 50 L -9 50 C -13 20 -11 0 -5 -30 Z M -36 -30 C -42 0 -44 20 -40 50 L -29 50 C -33 20 -31 0 -25 -30 Z M -56 -30 C -62 0 -64 20 -60 50 L -50 50 C -54 20 -51 0 -45 -30 Z';
const BEE_THORAX = 'M -8 -4 C -9 -18 4 -24 14 -22 C 26 -20 30 -8 27 4 C 24 14 12 19 2 16 C -6 13 -8 6 -8 -4 Z';
const BEE_HEAD = 'M 24 -6 C 24 -18 34 -24 44 -22 C 54 -20 59 -10 57 0 C 55 10 46 15 37 13 C 29 11 24 4 24 -6 Z';
const BEE_WING_F = 'M 6 -20 C -2 -40 -22 -64 -40 -66 C -52 -67 -54 -54 -46 -46 C -34 -32 -14 -24 6 -20 Z';
const BEE_WING_H = 'M 2 -18 C -8 -30 -26 -42 -38 -40 C -46 -38 -42 -28 -32 -24 C -22 -20 -10 -18 2 -18 Z';

const BeeLegs: React.FC = () => {
  const legs: {pts: P[]; far: boolean; w: number[]}[] = [
    {pts: [[4, 12], [2, 26], [-2, 36]], far: true, w: [4, 3]},
    {pts: [[16, 12], [26, 22], [26, 34]], far: true, w: [4, 3]},
    {pts: [[0, 14], [-10, 26], [-8, 40]], far: false, w: [5, 5.5, 3.5]},
    {pts: [[12, 14], [18, 28], [14, 40]], far: false, w: [4, 3]},
  ];
  return (
    <>
      {legs.map((l, i) => <path key={i} d={tube(l.pts, l.w, 8)} fill={l.far ? shade(BEE_DK, 0.1) : BEE_DK} {...EDGE_IN} />)}
    </>
  );
};

const BeeHead: React.FC<{mood?: Mood}> = ({mood = 'open'}) => (
  <>
    <path d="M 42 -20 C 42 -28 44 -34 46 -38 C 50 -40 54 -40 60 -42 M 34 -20 C 32 -28 34 -36 38 -40 C 42 -42 46 -44 50 -48" {...INLINE} strokeWidth={2.6} />
    <circle cx={60.5} cy={-42} r={2.4} fill={BEE_DK} {...EDGE_IN} />
    <circle cx={50.5} cy={-48.5} r={2.4} fill={BEE_DK} {...EDGE_IN} />
    <Shape d={BEE_HEAD} fill={BEE_FACE} shadow={0.4}>
      <path d="M 38 -2 C 44 2 52 0 62 -5 L 62 22 L 28 22 C 34 16 38 8 38 -2 Z" fill={BEE_MUZZLE} />
    </Shape>
    <OneEye x={41} y={-7} r={mood === 'angry' ? 10 : 9} look={[0.5, 0]} mood={mood} />
    {mood === 'angry' ? <Mouth x={50} y={7} w={11} kind="grit" /> : <path d="M 44 5 Q 50 12 56 4" {...OUTLINE} />}
  </>
);

const BeeFly: React.FC = () => (
  <g transform="translate(6 12) rotate(-6)">
    <path d="M -60 32 L -77 42 L -62 40 Z" fill={BEE_DK} {...EDGE_IN} />
    <BeeLegs />
    <Shape d={BEE_ABDOMEN} fill={BEE}>
      <path d={BEE_STRIPES} fill={BEE_DK} />
    </Shape>
    <Shape d={BEE_THORAX} fill={BEE_FUR} shadow={0.5}>
      <path d="M 2 -14 l 2 3 M 10 -16 l 1 3 M 18 -14 l 1 3" {...INLINE} />
    </Shape>
    <BeeHead />
    <Shape d={BEE_WING_H} fill={WING} shadow={0} line="in" />
    <Shape d={BEE_WING_F} fill={WING} shadow={0}>
      <path d="M 4 -21 C -14 -32 -28 -46 -40 -58" {...INLINE} />
    </Shape>
  </g>
);

const BeeAngry: React.FC = () => (
  <g transform="translate(4 -2) rotate(-6)">
    <BeeLegs />
    {/* the abdomen bends a little at the waist, the stinger points forward and down */}
    <g transform="rotate(-26 -2 6)">
      <path d="M -64 32 L -51 40 L -57 56 Z" fill={BEE_DK} {...EDGE_IN} />
      <Shape d={BEE_ABDOMEN} fill={BEE}>
        <path d={BEE_STRIPES} fill={BEE_DK} />
      </Shape>
    </g>
    <Shape d={BEE_THORAX} fill={BEE_FUR} shadow={0.5}>
      <path d="M 2 -14 l 2 3 M 10 -16 l 1 3 M 18 -14 l 1 3" {...INLINE} />
    </Shape>
    <BeeHead mood="angry" />
    <g transform="rotate(-24 4 -18)">
      <Shape d={BEE_WING_H} fill={WING} shadow={0} line="in" />
      <Shape d={BEE_WING_F} fill={WING} shadow={0}>
        <path d="M 4 -21 C -14 -32 -28 -46 -40 -58" {...INLINE} />
      </Shape>
    </g>
  </g>
);

export const Bee: React.FC<{pose?: 'fly' | 'angry'}> = ({pose = 'fly'}) => (pose === 'angry' ? <BeeAngry /> : <BeeFly />);

// ================================================================== MOSQUITO
// Grey-brown, side view facing right: humped thorax, small head with one kit eye, a long needle mouth,
// a long slim abdomen with segment lines, two narrow wings, six long thin legs (ink lines).

const MOS_THORAX = 'M -8 -6 C -10 -22 8 -28 20 -20 C 28 -14 28 0 20 6 C 10 12 -6 8 -8 -6 Z';
const MOS_HEAD = 'M 24 -4 C 24 -13 31 -16 37 -14 C 43 -12 45 -5 43 1 C 41 6 35 8 30 6 C 26 4 24 1 24 -4 Z';
const MOS_ABD: P[] = [[-4, 0], [-28, 8], [-52, 14], [-72, 16]];
const MOS_WING = 'M 6 -20 C -16 -28 -44 -32 -62 -28 C -70 -26 -68 -18 -58 -17 C -36 -15 -14 -16 6 -18 Z';

/** One mosquito, drawn around its thorax; legs are given as ink lines so they can reach a surface. */
const MosquitoBody: React.FC<{tilt?: number; wingUp?: number; legs: P[][]; needle: P[]}> = ({tilt = 0, wingUp = 18, legs, needle}) => (
  <g>
    {legs.map((l, i) => <path key={i} d={`M ${l.map((p) => `${f(p[0])} ${f(p[1])}`).join(' L ')}`} {...INLINE} strokeWidth={2.6} />)}
    <g transform={`rotate(${tilt})`}>
      <g transform={`rotate(${wingUp} 4 -18)`}><Shape d={MOS_WING} fill={WING} shadow={0} line="in" /></g>
      <Shape d={tube(MOS_ABD, [16, 14, 9, 5])} fill={MOS} shadow={0.5}>
        <path d={tubeTicks(MOS_ABD, [16, 14, 9, 5], [0.18, 0.34, 0.5, 0.66, 0.82], -0.6, 0.6)} {...INLINE} />
        <path d={tubeSide(MOS_ABD, [16, 14, 9, 5], 0.36, 0.3)} fill={tint(MOS, 0.4)} />
      </Shape>
      <Shape d={MOS_THORAX} fill={MOS} shadow={0.6}>
        <path d="M 2 -18 C 8 -14 10 -6 8 2" {...INLINE} />
      </Shape>
      <path d="M 38 -12 C 44 -20 48 -26 50 -32 M 36 -13 C 38 -22 40 -28 40 -34" {...INLINE} />
      <path d="M 46 -24 l 4 1 M 44 -20 l 4 1 M 40 -27 l 3 1 M 39 -22 l 3 1" {...INLINE} strokeWidth={1.4} />
    </g>
    <path d={tube(needle, [3.2, 1.6, 0.8], 8)} fill={MOS} {...EDGE_IN} />
    <g transform={`rotate(${tilt})`}>
      <Shape d={MOS_HEAD} fill={MOS} shadow={0.4} />
      <g transform="rotate(-14 4 -18)"><Shape d={MOS_WING} fill={WING} shadow={0}><path d="M 4 -19 C -20 -24 -40 -26 -58 -24" {...INLINE} /></Shape></g>
      <OneEye x={34} y={-5} r={6.5} look={[0.5, 0.1]} />
    </g>
  </g>
);

const MosquitoFly: React.FC = () => {
  const legs: P[][] = [
    [[16, 6], [30, 18], [38, 46]],
    [[12, 8], [20, 22], [24, 52]],
    [[8, 8], [6, 24], [0, 50]],
    [[4, 8], [-4, 22], [-14, 46]],
    [[2, 6], [-20, 0], [-40, 20]],
    [[0, 6], [-24, 6], [-50, 32]],
  ];
  return (
    <g transform="translate(2 -8)">
      <MosquitoBody legs={legs} needle={[[42, -1], [58, 9], [72, 19]]} wingUp={30} />
    </g>
  );
};

const MosquitoBite: React.FC = () => {
  const tilt = 22; // head down to the skin
  const T = (p: P) => rot(p, tilt);
  const S = 54; // the skin surface (local y of the mosquito group)
  const legs: P[][] = [
    [T([16, 6]), [34, 26], [40, S - 2]],
    [T([12, 8]), [22, 30], [20, S - 1]],
    [T([8, 8]), [-2, 26], [0, S]],
    [T([4, 8]), [-18, 28], [-20, S]],
    [T([2, 6]), [-26, 4], [-48, -14]],
    [T([0, 6]), [-32, 12], [-60, -2]],
  ];
  const tip = T([42, -1]);
  return (
    <g transform="translate(6 -6)">
      {/* a patch of skin */}
      <Shape d="M -72 60 C -46 50 -10 48 24 50 C 48 52 62 54 74 60 C 78 72 76 84 70 90 C 36 96 -32 96 -66 90 C -74 84 -76 72 -72 60 Z" fill={SKIN.warm} shadow={1}>
        <path d="M -54 74 q 8 3 16 1 M 40 80 q 8 3 16 1 M -16 82 q 8 3 16 1" {...INLINE} />
      </Shape>
      <path d="M 54 52 C 58 47 68 47 72 52 Z" fill={tint(FLESH.artery, 0.45)} {...EDGE_IN} />
      <MosquitoBody tilt={tilt} legs={legs} needle={[tip, [52, 30], [63, 51]]} wingUp={34} />
    </g>
  );
};

export const Mosquito: React.FC<{pose?: 'fly' | 'bite'}> = ({pose = 'fly'}) => (pose === 'bite' ? <MosquitoBite /> : <MosquitoFly />);

// ------------------------------------------------------------------ the record
export const ANIMALS = {dog: Dog, snake: Snake, bee: Bee, mosquito: Mosquito} as const;

// ------------------------------------------------------------------ the board
export const AnimalsBoard: React.FC = () => (
  <Board kicker="Cast · animals" title="The animals: dog, snake, bee, mosquito" note="Same line, flat colour and one darker tone as the cast · one kit eye in side view, two in a front view · real anatomy, simplified">
    {/* DOG */}
    <Panel x={56} y={170} w={800} h={860} label="Dog · street dog (rabies video)" />
    <Fig x={256} y={416} size={390}><Dog pose="stand" /></Fig>
    <Caption x={256} y={598} name="stand" note="friendly, tail up" />
    <Fig x={658} y={416} size={390}><Dog pose="snarl" /></Fig>
    <Caption x={658} y={598} name="snarl" note="crouched, hackles up, teeth bared" w={300} />
    <Fig x={456} y={822} size={360}><Dog pose="head" /></Fig>
    <Caption x={456} y={980} name="head" note="close-up, about to bite" />
    {/* SNAKE */}
    <Panel x={886} y={170} w={978} h={420} label="Snake" />
    <Fig x={1131} y={364} size={300}><Snake pose="coiled" /></Fig>
    <Caption x={1131} y={518} name="coiled" note="calm, tongue out" />
    <Fig x={1619} y={364} size={300}><Snake pose="strike" /></Fig>
    <Caption x={1619} y={518} name="strike" note="reared up, fangs out" />
    {/* BEE */}
    <Panel x={886} y={610} w={474} h={420} label="Bee" />
    <Fig x={1008} y={800} size={300}><Bee pose="fly" /></Fig>
    <Caption x={1008} y={946} name="fly" w={200} />
    <Fig x={1240} y={800} size={300}><Bee pose="angry" /></Fig>
    <Caption x={1240} y={946} name="angry" note="stinger forward" w={200} />
    {/* MOSQUITO */}
    <Panel x={1390} y={610} w={474} h={420} label="Mosquito" />
    <Fig x={1508} y={800} size={300}><Mosquito pose="fly" /></Fig>
    <Caption x={1508} y={946} name="fly" w={200} />
    <Fig x={1730} y={792} size={300}><Mosquito pose="bite" /></Fig>
    <Caption x={1730} y={946} name="bite" note="on a patch of skin" w={200} />
  </Board>
);
