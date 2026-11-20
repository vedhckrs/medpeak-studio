/**
 * MedPeak Toons v8: the PERSON rig. One parametric person, drawn in code with the shared kit's line,
 * colours, eyes and mouths. Every person is built in a light 3D frame (a few cross-sections for the
 * torso, joints for arms and legs) and projected for the view, so the front, three-quarter and side
 * views are truly turned, not flipped or squashed. Parts that overlap are drawn as one outlined union
 * (a fat outline pass, then the fills on top), so arms have a real elbow, hands have a thumb and
 * fingers, and clothes join without seams showing.
 *
 * Units: person units, y down, the ground at y = 0. A woman's head radius is about 40 units.
 * <PersonAt> places a person on a board: x = the middle, y = the ground line, scale = px per unit.
 *
 * ANIMATING A PERSON (all optional; with none of them given a person draws exactly as on the sheets)
 *   <PersonAt spec x y scale view pose expr look  talk blink facing bob />
 *   talk?: number    0..1, how far the mouth is open (from play.tsx `talk(s, who)`). 0 = the expression's own
 *                    mouth; the shape opens continuously (dark inside, a tongue when wide), on every
 *                    expression and in every view. Undefined = the still mouth of the sheets.
 *   blink?: number   0..1, 1 = shut (from play.tsx `blink(t, seed)`). Skin lids come down with the INK lash
 *                    line, behind glasses too. Ignored on eyes that are already shut arcs (happy).
 *   pose?: PoseName | {a: PoseName; b: PoseName; k: number}
 *                    a blend: k = 0 is pose a, 1 is pose b. Every number blends (arm and leg directions
 *                    on an arc, wrist bend, hand angle, head tilt); the hand KIND, the thumb side, the prop
 *                    and the arm's in-front-of-body layer switch at k = 0.5, so ease k quickly through the
 *                    middle (e.g. k = go(t, t0, 0.35) from play.tsx). 'sit' <-> standing does not blend
 *                    (it jumps at 0.5): cut, or switch while the body is hidden.
 *   facing?: 'right' | 'left'   default 'right'. 'left' is a real left-facing three-quarter / side view
 *                    (drawn as the person's mirror twin, then flipped): one-sided details stay on the
 *                    person's OWN side (pocket and pens, stethoscope chest piece, hair parting, buttons,
 *                    the hand that holds the clipboard, folds). A pose's R / L arm stays the person's own
 *                    right / left arm. The front view ignores `facing`.
 *   bob?: number     -1..1, a small breathing / speaking lift of the chest and the head; feet stay planted.
 *   (flip?: boolean on <PersonAt> is the old blind mirror; do not use it for characters, use facing.)
 *
 * WHERE THINGS ARE (frame pixels, same arithmetic as the drawing; pass the same options as <PersonAt>):
 *   handAt(spec, {pose, view, facing, x, y, scale, bob}) -> {R, L: {wrist, palm, dir}}  (the person's own
 *     right / left hand: wrist point, palm centre, forearm direction as a unit vector)
 *   headAt(spec, {pose, view, facing, x, y, scale, bob}) -> {x, y, r}  (the face centre and a radius)
 */
import React, {useId} from 'react';
import {INK, OUT, IN, OUTLINE, INLINE, EDGE, EDGE_IN, shade, tint, SKIN, CLOTH, FLESH, Eyes, Mouth, type Mood, type MouthKind} from './kit';

// ================================================================== small geometry
type P = [number, number];
type V3 = [number, number, number];
const f1 = (n: number) => (Math.round(n * 100) / 100).toString();
const pt = (p: P) => `${f1(p[0])} ${f1(p[1])}`;
const add = (a: P, b: P): P => [a[0] + b[0], a[1] + b[1]];
const sub = (a: P, b: P): P => [a[0] - b[0], a[1] - b[1]];
const mul = (a: P, k: number): P => [a[0] * k, a[1] * k];
const len = (a: P) => Math.hypot(a[0], a[1]);
const nrm = (a: P): P => { const l = len(a) || 1; return [a[0] / l, a[1] / l]; };
const perp = (a: P): P => [-a[1], a[0]];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpP = (a: P, b: P, t: number): P => [lerp(a[0], b[0], t), lerp(a[1], b[1], t)];
const v3add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const v3mul = (a: V3, k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const v3norm = (a: V3): V3 => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const deg = (a: P) => (Math.atan2(a[1], a[0]) * 180) / Math.PI;

/** Closed smooth path through points (Catmull-Rom). */
export const closedSmooth = (p: P[]): string => {
  const n = p.length;
  let d = `M ${pt(p[0])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d + ' Z';
};
/** Open smooth curve segments through points (no leading M). */
const crSeg = (p: P[]): string => {
  let d = '';
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p[i + 1];
    const c1 = add(p1, mul(sub(p2, p0), 1 / 6));
    const c2 = sub(p2, mul(sub(p3, p1), 1 / 6));
    d += ` C ${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
};
export const openSmooth = (p: P[]) => `M ${pt(p[0])}` + crSeg(p);
type Chain = {pts: P[]; smooth: boolean};
const chainPath = (chains: Chain[]): string => {
  let d = '';
  chains.forEach((ch, k) => {
    if (k === 0) d += `M ${pt(ch.pts[0])}`;
    if (ch.smooth) d += crSeg(ch.pts);
    else for (let i = 1; i < ch.pts.length; i++) d += ` L ${pt(ch.pts[i])}`;
  });
  return d + ' Z';
};
const poly = (p: P[]) => 'M ' + p.map(pt).join(' L ') + ' Z';

/** Points on an arc around c from vector a to vector b, the way that passes `via`. */
const arcPts = (c: P, r: number, a: P, b: P, via: P, n = 10): P[] => {
  const TAU = Math.PI * 2;
  const A = Math.atan2(a[1], a[0]), B = Math.atan2(b[1], b[0]), V = Math.atan2(via[1], via[0]);
  const m = (x: number) => ((x % TAU) + TAU) % TAU;
  const ccw = m(B - A);
  const span = m(V - A) < ccw ? ccw : ccw - TAU;
  const out: P[] = [];
  for (let i = 0; i <= n; i++) { const t = A + (span * i) / n; out.push([c[0] + r * Math.cos(t), c[1] + r * Math.sin(t)]); }
  return out;
};
/** A tapered capsule from a (radius ra) to b (radius rb). An end can be 'flat' (a cut sleeve or hem). */
export const capsule = (a: P, ra: number, b: P, rb: number, endB: 'round' | 'flat' = 'round', endA: 'round' | 'flat' = 'round'): string => {
  const dv = sub(b, a);
  const L = Math.max(len(dv), 0.001);
  const u = mul(dv, 1 / L), v = perp(u);
  const k = Math.max(-0.9, Math.min(0.9, (ra - rb) / L));
  const s = Math.sqrt(1 - k * k);
  const m1 = add(mul(u, k), mul(v, s)), m2 = add(mul(u, k), mul(v, -s));
  const pts: P[] = [];
  const mA1 = endA === 'flat' ? v : m1, mA2 = endA === 'flat' ? mul(v, -1) : m2;
  const mB1 = endB === 'flat' ? v : m1, mB2 = endB === 'flat' ? mul(v, -1) : m2;
  pts.push(add(a, mul(mA1, ra)));
  if (endB === 'flat') { pts.push(add(b, mul(mB1, rb))); pts.push(add(b, mul(mB2, rb))); }
  else pts.push(...arcPts(b, rb, m1, m2, u));
  if (endA === 'flat') { pts.push(add(a, mul(mA2, ra))); }
  else pts.push(...arcPts(a, ra, m2, m1, mul(u, -1)));
  return poly(pts);
};
/** A ribbon of half-width w along a smooth line (straps, tubes, strings). */
const ribbon = (line: P[], w: number, w2 = w): string => {
  // densify with Catmull-Rom
  const dense: P[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const p0 = line[i - 1] ?? line[i], p1 = line[i], p2 = line[i + 1], p3 = line[i + 2] ?? line[i + 1];
    for (let j = 0; j < 8; j++) {
      const t = j / 8, t2 = t * t, t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      dense.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  dense.push(line[line.length - 1]);
  const L: P[] = [], R: P[] = [];
  dense.forEach((p, i) => {
    const a = dense[Math.max(0, i - 1)], b = dense[Math.min(dense.length - 1, i + 1)];
    const n = perp(nrm(sub(b, a)));
    const ww = lerp(w, w2, i / (dense.length - 1));
    L.push(add(p, mul(n, ww))); R.push(add(p, mul(n, -ww)));
  });
  return poly([...L, ...R.reverse()]);
};

// ================================================================== drawing primitives
let SH: P = [-2.2, -2.6]; // the shadow offset of the current person (set per person, scales with the head)

/**
 * One flat-coloured piece made of several overlapping paths, drawn with ONE outer outline (a fat
 * outline pass, then the fills), and the one darker tone as a crescent on the lower right.
 */
type UPart = string | {d: string; t: string};
const Union: React.FC<{d: UPart[]; fill: string; shadow?: number; line?: 'out' | 'in'; children?: React.ReactNode; shadeBy?: number; holes?: boolean}> = ({d: parts, fill, shadow = 1, line = 'out', children, shadeBy = 0.14, holes}) => {
  const id = 'u' + useId().replace(/:/g, '');
  const sw = (line === 'out' ? OUT : IN) * 2;
  const fr = holes ? 'evenodd' : undefined;
  const d = parts.map((q) => (typeof q === 'string' ? {d: q, t: ''} : q));
  const off = `translate(${f1(SH[0] * shadow)} ${f1(SH[1] * shadow)})`;
  return (
    <g>
      {d.map((p, i) => <path key={'o' + i} d={p.d} transform={p.t || undefined} fill={fill} fillRule={fr} stroke={INK} strokeWidth={sw} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />)}
      <defs><clipPath id={id}>{d.map((p, i) => <path key={i} d={p.d} transform={p.t || undefined} clipRule={fr} />)}</clipPath></defs>
      <g clipPath={`url(#${id})`}>
        {shadow > 0 ? (
          <>
            <rect x={-5000} y={-5000} width={10000} height={10000} fill={shade(fill, shadeBy)} />
            {d.map((p, i) => <path key={'f' + i} d={p.d} fill={fill} fillRule={fr} transform={`${off} ${p.t}`} />)}
          </>
        ) : d.map((p, i) => <path key={'f' + i} d={p.d} fill={fill} fillRule={fr} transform={p.t || undefined} />)}
        {children}
      </g>
    </g>
  );
};
/** Clip children to a path. */
const Clip: React.FC<{d: string; children: React.ReactNode}> = ({d, children}) => {
  const id = 'c' + useId().replace(/:/g, '');
  return <g><defs><clipPath id={id}><path d={d} /></clipPath></defs><g clipPath={`url(#${id})`}>{children}</g></g>;
};

// ================================================================== the hands
export type HandKind = 'relaxed' | 'open' | 'point' | 'thumbs' | 'fist' | 'hold' | 'rest';
export const HAND_KINDS: HandKind[] = ['relaxed', 'open', 'point', 'thumbs', 'fist', 'hold', 'rest'];
/** A finger: a slightly tapered capsule from its base at angle a (degrees) for length l. */
const finger = (x: number, y: number, a: number, l: number, r = 1.85): string => {
  const t = (a * Math.PI) / 180;
  return capsule([x, y], r, [x + Math.cos(t) * l, y + Math.sin(t) * l], r * 0.9);
};
/**
 * The shared hands. Drawn in a local frame: the wrist at (0, 0), the hand pointing along +x, the
 * thumb on the +y side, about 30 units long. `wristR` adds a wrist stub so the hand merges into a bare
 * forearm without a seam.
 */
/** The geometry of one hand shape (hand space), shared by the free hand and the arm-merged hand. */
const handGeom = (kind: HandKind, free = true) => {
  const lines: string[] = [];
  let parts: string[] = [];
  let over: string[] = []; // a thumb lying over the fist, outlined on its own
  let holes = false;
  switch (kind) {
    case 'relaxed': {
      parts = [
        closedSmooth([[-3, -4.2], [3, -5.4], [8, -6.4], [14, -6.2], [17.4, -2.4], [17, 3.6], [11, 5.8], [4, 5.2], [-3, 4.2]]),
        finger(14.6, -4.0, 16, 10.4, 1.95), finger(15.4, -0.8, 20, 11.0, 2.0), finger(14.8, 2.4, 26, 9.6, 1.95),
        capsule([4, 4.2], 2.6, [12.6, 8.6], 2.15),
      ];
      lines.push('M 24.4 -0.6 Q 21.5 -1.8 19 -1.6', 'M 23 3.4 Q 20.5 2.2 18.4 2.2');
      break;
    }
    case 'rest': {
      // a hand lying on the body or on a thing: fingers together (a soft mitten), finger lines, a clear thumb
      parts = [
        closedSmooth([[-3, -4.2], [3, -5.8], [9, -6.8], [16, -6.8], [23, -6.4], [27.6, -4.6], [29.4, -1.2], [28.8, 2.4], [25.6, 4.6], [17, 5.6], [9, 5.6], [3, 5.2], [-3, 4.2]]),
        capsule([5, 4.6], 2.7, [13.6, 9.6], 2.2),
      ];
      lines.push('M 28.6 -3.2 L 20.4 -3.6', 'M 29.2 0 L 20.8 0', 'M 27.4 3.2 L 20.6 3.0');
      break;
    }
    case 'open': {
      parts = [
        closedSmooth([[-3, -4.2], [3, -6.2], [8, -7.8], [13.5, -7.6], [16.6, -3.5], [16.8, 3], [13.6, 7], [7, 7.4], [3, 6], [-3, 4.2]]),
        finger(13.6, -5.6, -20, 9.5, 1.85), finger(15.4, -2.1, -7, 12, 1.95), finger(15.8, 1.4, 4, 12.6, 1.95), finger(14.8, 4.8, 16, 11.2, 1.9),
        capsule([5, 5.2], 2.7, [13.2, 13.6], 2.15),
      ];
      lines.push('M 4.5 3.2 Q 9.5 1.5 11 -3.6', 'M 12.3 -3.2 L 15 -3.6', 'M 13 0 L 15.6 0', 'M 12.8 3.3 L 15.2 3.6');
      break;
    }
    case 'point': {
      parts = [
        closedSmooth([[-3, -4.2], [3, -6], [8, -7.4], [13.4, -7], [16.8, -3.6], [17, 2], [14, 5.4], [7, 6.4], [3, 5.4], [-3, 4.2]]),
        finger(14.4, 3.2, -2, 14.5, 1.9),
      ];
      lines.push('M 13.4 -4.2 Q 16.4 -4.4 16.9 -2.6', 'M 13.2 -0.8 Q 16.4 -1 17 0.8');
      over = [capsule([5.5, 5.4], 2.2, [12.2, 1.8], 1.9)];
      break;
    }
    case 'thumbs': {
      parts = [
        closedSmooth([[-3, -4.2], [3, -6.4], [7, -8.2], [12.6, -8], [15.6, -5], [15.8, 1.5], [13, 6.8], [7, 7.4], [3, 6], [-3, 4.2]]),
        capsule([9.5, 4.2], 3.1, [23, 4.6], 2.8),
      ];
      lines.push('M 3.5 -7.6 Q 2.6 -2 4.6 1.6', 'M 7.4 -8 Q 6.4 -2.4 8.4 1.8', 'M 11.2 -7.8 Q 10.4 -2.6 12 2', 'M 21.6 2.6 Q 20.4 4.4 21.4 6.2');
      break;
    }
    case 'fist': {
      // a rounded block, four knuckle bumps at the top, finger lines across, the thumb folded over the front
      parts = [
        closedSmooth([[-3, -4.2], [3, -6.4], [7, -8.4], [12, -8.2], [14.6, -6], [15, 2], [14, 6.2], [7, 7.4], [3, 6], [-3, 4.2]]),
        capsule([14.4, -5.7], 2.35, [14.4, -5.7], 2.35), capsule([15.4, -2.1], 2.4, [15.4, -2.1], 2.4),
        capsule([15.4, 1.5], 2.4, [15.4, 1.5], 2.4), capsule([14.4, 4.9], 2.25, [14.4, 4.9], 2.25),
      ];
      lines.push('M 16.9 -3.9 L 11.4 -4.1', 'M 17.6 -0.3 L 11.6 -0.3', 'M 16.8 3.3 L 11.4 3.4', 'M 10.6 -7.6 Q 9.6 -1 10.8 5.4');
      over = [capsule([4.4, 6.0], 2.5, [11.6, 2.6], 2.15)];
      break;
    }
    case 'hold': {
      // fingers curled round a bar (the hole is the bar), the thumb along the near side
      const hc: P = [13.2, -0.6], hr = 3.7;
      const block = closedSmooth([[-3, -4.2], [3, -6.2], [7, -8], [13, -8.4], [18.4, -5.6], [20, -0.4], [18.6, 4.8], [13.6, 7.6], [7, 7.4], [3, 6], [-3, 4.2]]);
      if (!free) {
        // on an arm the hand grips a real object (the object shows the gap): curled fingers, no hole
        parts = [block];
        lines.push('M 19.4 -3.4 L 13.6 -3.6', 'M 19.9 -0.2 L 13.8 -0.2', 'M 19.2 3 L 13.6 3.2', 'M 12.8 -7.6 Q 11.6 -1.2 12.8 5.6');
        over = [capsule([5, 6.0], 2.4, [15.4, 6.2], 2.1)];
        break;
      }
      parts = [block + ` M ${hc[0] + hr} ${hc[1]} A ${hr} ${hr} 0 1 0 ${hc[0] - hr} ${hc[1]} A ${hr} ${hr} 0 1 0 ${hc[0] + hr} ${hc[1]} Z`];
      for (const a of [-58, -18, 22]) { const t = (a * Math.PI) / 180; lines.push(`M ${f1(hc[0] + Math.cos(t) * (hr + 0.8))} ${f1(hc[1] + Math.sin(t) * (hr + 0.8))} L ${f1(hc[0] + Math.cos(t) * (hr + 3.6))} ${f1(hc[1] + Math.sin(t) * (hr + 3.6))}`); }
      over = [capsule([5, 6.0], 2.4, [15.4, 6.2], 2.1)];
      holes = true;
      break;
    }
  }
  return {parts, lines, over, holes};
};
export const Hand: React.FC<{kind: HandKind; skin: string; wristR?: number}> = ({kind, skin, wristR}) => {
  const stub = wristR ? [capsule([-9, 0], wristR, [1, 0], wristR)] : [];
  const {parts, lines, over, holes} = handGeom(kind);
  return (
    <g>
      <Union d={[...stub, ...parts]} fill={skin} shadow={0.55} holes={holes}>
        {lines.map((l, i) => <path key={i} d={l} {...INLINE} />)}
      </Union>
      {over.length > 0 && <Union d={over} fill={skin} shadow={0} line="in" />}
    </g>
  );
};

// ================================================================== the face pieces
export type View = 'front' | 'three-quarter' | 'side';
export type Expr = 'neutral' | 'happy' | 'worried' | 'angry' | 'surprised' | 'sleepy' | 'talking' | 'crying';
export const EXPRS: Expr[] = ['neutral', 'happy', 'talking', 'worried', 'angry', 'surprised', 'sleepy'];
const EXPR: Record<Expr, {mood: Mood; mouth: MouthKind; mw?: number}> = {
  neutral: {mood: 'open', mouth: 'smile'},
  happy: {mood: 'happy', mouth: 'open', mw: 1.25},
  talking: {mood: 'open', mouth: 'open', mw: 1.1},
  worried: {mood: 'sad', mouth: 'wavy'},
  angry: {mood: 'angry', mouth: 'frown'},
  surprised: {mood: 'scared', mouth: 'o', mw: 1.1},
  sleepy: {mood: 'sleepy', mouth: 'flat', mw: 0.8},
  crying: {mood: 'sad', mouth: 'big', mw: 1.2},
};

type VK = 'f' | 'q' | 's';
const vk = (v: View): VK => (v === 'front' ? 'f' : v === 'three-quarter' ? 'q' : 's');

// The head outline in head space (cranium radius 40, centre at 0, y down, facing right for q and s).
/** The nose in the profile (side view), scaled by k: a dip at the eye, a rounded nose, then the lip. */
const SIDE_NOSE = (k: number): P[] => [[41 + 3 * k, 7.6], [41 + 8.6 * k, 11.8], [41 + 11 * k, 15.6], [41 + 9.4 * k, 19], [41 + 3.6 * k, 20.4]];
const HEAD: Record<VK, P[]> = {
  f: [[0, -40], [23, -36.5], [37, -23], [40.5, -4], [39.5, 13], [35, 28], [25.5, 39.5], [13, 46], [0, 48], [-13, 46], [-25.5, 39.5], [-35, 28], [-39.5, 13], [-40.5, -4], [-37, -23], [-23, -36.5]],
  q: [[-2, -40.5], [21, -37.5], [36, -25], [41.5, -7], [42, 9], [38.5, 24], [31, 36], [21, 44.5], [10, 47.5], [-1, 45.5], [-13, 40], [-25, 32], [-35, 20], [-40.5, 4], [-40.5, -14], [-32.5, -30], [-18, -38.5]],
  s: [[-4, -41], [18, -38.5], [33, -28], [40, -13], [41.2, -3], [40.4, 4], ...SIDE_NOSE(1), [43.2, 23.6], [42, 29.4], [42.4, 33.4], [38.5, 39.5], [31.5, 45], [19, 46.5], [6, 41.5], [-6, 34], [-22, 30], [-36, 20], [-43.5, 2], [-41.5, -18], [-28.5, -35]],
};
const FACE: Record<VK, {eye: P; mouth: P; mw: number; ear: P | null}> = {
  f: {eye: [0, 5], mouth: [0, 28.5], mw: 1, ear: null},
  q: {eye: [15, 5], mouth: [23, 29], mw: 0.85, ear: [-24, 9]},
  s: {eye: [27, 5], mouth: [38.6, 29], mw: 0.6, ear: [-9, 9]},
};
/** Where the neck meets the head, in head space. */
const NECK_AT: Record<VK, P> = {f: [0, 40], q: [-3, 39], s: [-11, 33]};

// ================================================================== hair
export type HairStyle = 'curlyBob' | 'shortMan' | 'long' | 'neat' | 'kid' | 'balding' | 'bun' | 'tuft';
type HairDraw = {back?: P[][]; front?: P[][]; lines?: string[]; backLines?: string[]; bun?: P; bunR?: number};
const mirrorX = (p: P[]): P[] => p.map(([x, y]) => [-x, y] as P).reverse();
/** A lobed edge from a to b: n round lobes bulging along dir (curly hair ends, tufts). */
const lobes = (a: P, b: P, n: number, depth: number, dir: P): P[] => {
  const dn = nrm(dir);
  const out: P[] = [a];
  for (let i = 0; i < n; i++) {
    const at = (t: number, k: number) => add(lerpP(a, b, (i + t) / n), mul(dn, depth * k));
    out.push(at(0.2, 0.7), at(0.5, 1), at(0.8, 0.7));
    out.push(i === n - 1 ? b : lerpP(a, b, (i + 1) / n));
  }
  return out;
};
// the right half of Dr. Mira's curly bob, front view, from the crown to behind the chin
const BOB_R: P[] = [[0, -58], ...lobes([0, -58], [44, -42], 2, 4.5, [0.6, -1]).slice(1), ...lobes([44, -42], [56, -6], 2, 5, [1, -0.2]).slice(1), ...lobes([56, -6], [58, 24], 2, 5.5, [1, 0.1]).slice(1), ...lobes([58, 24], [32, 42], 3, 8.5, [0.4, 1]).slice(1), [0, 38]];
const HAIR: Record<HairStyle, Record<VK, HairDraw>> = {
  curlyBob: {
    f: {
      back: [[...BOB_R, ...mirrorX(BOB_R).slice(1, -1)]],
      front: [[[-44, -2], [-47, -22], [-39, -42], [-19, -55], [8, -57], [31, -51], [45, -37], [48, -18], [45, -2], ...lobes([44, -3], [-6, -27], 4, 8.5, [0, 1]).slice(1), [-14, -24], ...lobes([-15, -23], [-43, -3], 2, 6, [0.3, 1]).slice(1)]],
      lines: ['M -6 -27 Q -4 -40 4 -50', 'M -30 -40 q -6 -6 0 -10 q 5 -2 6 3', 'M 22 -40 q 6 -6 11 -1 q 2 5 -3 6'],
      backLines: ['M -52 28 q -4 6 1 10 q 4 2 5 -3', 'M 52 28 q 4 6 -1 10 q -4 2 -5 -3'],
    },
    q: {
      back: [[[-8, -58], ...lobes([-8, -58], [40, -42], 2, 4.5, [0.5, -1]).slice(1), ...lobes([40, -42], [50, 22], 3, 5, [1, 0]).slice(1), ...lobes([50, 24], [32, 40], 1, 7, [0.5, 1]), [12, 40], [-10, 44], ...lobes([-12, 46], [-58, 28], 4, 8.5, [-0.3, 1]), ...lobes([-58, 26], [-50, -36], 3, 5, [-1, 0]).slice(1), [-30, -52]]],
      front: [[[-34, 30], [-46, 14], [-50, -10], [-43, -35], [-25, -52], [2, -57], [26, -52], [42, -39], [47, -21], [45, -5], ...lobes([45, -5], [4, -28], 4, 8.5, [0, 1]).slice(1), [-6, -24], [-12, -16], [-15, -4], [-17, 8], [-21, 20], [-27, 28]]],
      lines: ['M 4 -28 Q 4 -42 12 -52', 'M -30 -36 q -6 -6 0 -10 q 5 -2 6 3', 'M -42 2 q -6 5 -2 10 q 4 2 6 -2', 'M 22 -42 q 6 -6 11 -1 q 2 5 -3 6'],
      backLines: ['M -50 36 q -4 6 1 10 q 4 2 5 -3'],
    },
    s: {
      back: [[[-6, -58], ...lobes([-6, -58], [-52, -35], 2, 5, [-0.5, -1]).slice(1), ...lobes([-52, -35], [-62, 14], 3, 5, [-1, 0]).slice(1), ...lobes([-61, 18], [-10, 40], 4, 8.5, [0, 1]), [-4, 30], [-2, 0]]],
      front: [[[-12, 28], [-34, 32], [-50, 18], [-57, -6], [-51, -32], [-33, -51], [-4, -57], [20, -52], [35, -39], [42, -23], [41, -12], ...lobes([41, -12], [6, -25], 3, 7, [0, 1]).slice(1), [0, -14], [0, 0], [-2, 12], [-5, 22]]],
      lines: ['M -34 -36 q -6 -6 0 -10 q 5 -2 6 3', 'M -40 6 q -6 5 -2 10 q 4 2 6 -2', 'M 10 -44 q 6 -6 11 -1 q 2 5 -3 6'],
      backLines: ['M -48 38 q -4 6 1 10 q 4 2 5 -3'],
    },
  },
  shortMan: {
    f: {front: [[[-42, 4], [-44, -20], [-36, -40], [-16, -50], [8, -51], [30, -45], [43, -30], [45, -10], [42, 4], [39, -6], [37, -18], [26, -23], [12, -21], [0, -27], [-10, -22], [-24, -21], [-36, -14], [-38, -4]]],
      lines: ['M -22 -38 Q -4 -46 14 -42', 'M 24 -36 Q 34 -32 38 -22']},
    q: {front: [[[-27, 26], [-40, 14], [-45, -8], [-40, -32], [-24, -47], [0, -52], [22, -48], [38, -36], [44, -20], [42, -10], [35, -18], [24, -22], [12, -20], [2, -25], [-8, -19], [-13, -12], [-14, 2], [-17, 14], [-21, 22]]],
      lines: ['M -30 -36 Q -14 -46 6 -44', 'M -38 -12 Q -34 0 -36 10']},
    s: {front: [[[-12, 26], [-30, 28], [-44, 14], [-48, -12], [-38, -36], [-16, -50], [10, -50], [28, -42], [38, -28], [40, -18], [32, -20], [22, -22], [12, -20], [4, -16], [-1, -8], [-1, 4], [-4, 16]]],
      lines: ['M -36 -26 Q -22 -40 -2 -44', 'M -42 -2 Q -36 10 -38 18']},
  },
  long: {
    f: {
      back: [[[0, -52], [28, -48], [46, -32], [52, -8], [53, 30], [54, 70], [56, 104], [44, 112], [34, 106], [26, 82], [22, 50], [0, 46], [-22, 50], [-26, 82], [-34, 106], [-44, 112], [-56, 104], [-54, 70], [-53, 30], [-52, -8], [-46, -32], [-28, -48]]],
      front: [[[-42, 2], [-46, -22], [-36, -42], [-14, -51], [12, -51], [32, -44], [44, -28], [44, -6], [42, 4], [38, -10], [30, -20], [16, -26], [2, -26], [-6, -30], [-12, -22], [-20, -16], [-30, -10], [-38, -2]]],
      lines: ['M -6 -30 Q -2 -40 4 -46', 'M -16 -40 Q -26 -36 -34 -26', 'M 46 20 Q 42 50 46 80', 'M -46 20 Q -42 50 -46 80', 'M 18 -38 Q 30 -34 38 -22'],
    },
    q: {
      back: [[[-4, -53], [22, -49], [40, -36], [46, -16], [47, 10], [46, 30], [40, 40], [20, 42], [0, 50], [-18, 66], [-26, 96], [-34, 112], [-46, 114], [-56, 102], [-60, 70], [-60, 30], [-58, -6], [-50, -32], [-30, -49]]],
      front: [[[-30, 30], [-44, 12], [-47, -14], [-40, -36], [-22, -49], [2, -52], [24, -47], [39, -34], [44, -16], [42, -6], [36, -16], [26, -23], [14, -24], [4, -28], [-4, -22], [-10, -14], [-14, -2], [-16, 10], [-20, 22]]],
      lines: ['M -2 -40 Q 4 -46 10 -48', 'M -36 -20 Q -30 0 -34 14', 'M -50 40 Q -46 70 -50 96', 'M 18 -40 Q 30 -36 38 -26'],
    },
    s: {
      back: [[[-6, -53], [-30, -48], [-50, -30], [-58, -2], [-58, 34], [-56, 70], [-54, 104], [-42, 112], [-30, 104], [-24, 80], [-18, 50], [-8, 32], [-2, 0]]],
      front: [[[-14, 26], [-32, 30], [-46, 16], [-52, -8], [-46, -32], [-28, -48], [-2, -52], [20, -47], [34, -36], [40, -22], [40, -12], [32, -20], [22, -24], [12, -22], [4, -16], [-1, -6], [-1, 6], [-4, 18]]],
      lines: ['M -40 -30 Q -24 -44 -6 -46', 'M -48 30 Q -44 64 -48 96', 'M -36 40 Q -32 70 -36 100'],
    },
  },
  neat: {
    f: {front: [[[-42, 0], [-45, -22], [-38, -42], [-18, -53], [8, -54], [30, -48], [43, -32], [45, -12], [42, 0], [38, -14], [30, -22], [14, -26], [-4, -26], [-12, -32], [-18, -24], [-30, -20], [-38, -10]]],
      lines: ['M -12 -32 Q -8 -44 0 -50', 'M 6 -44 Q 24 -44 36 -32', 'M -22 -42 Q -32 -36 -38 -26']},
    q: {front: [[[-27, 26], [-40, 14], [-45, -10], [-40, -34], [-24, -50], [0, -55], [22, -51], [38, -38], [44, -20], [42, -8], [36, -18], [24, -24], [10, -26], [0, -32], [-6, -24], [-12, -14], [-14, 0], [-17, 14], [-21, 22]]],
      lines: ['M 0 -32 Q 2 -44 8 -52', 'M 14 -44 Q 28 -42 38 -30', 'M -30 -40 Q -38 -24 -38 -8']},
    s: {front: [[[-12, 26], [-30, 28], [-44, 14], [-48, -12], [-40, -38], [-18, -52], [8, -53], [27, -45], [38, -30], [41, -18], [33, -22], [22, -25], [10, -24], [2, -18], [-1, -8], [-1, 4], [-4, 16]]],
      lines: ['M -36 -30 Q -20 -44 2 -48', 'M -42 -4 Q -36 8 -38 18']},
  },
  kid: {
    f: {front: [[[-42, 6], [-44, -12], [-40, -22], [40, -22], [44, -12], [42, 6], [38, -4], [34, -14], [-34, -14], [-38, -4]]], lines: []},
    q: {front: [[[-27, 26], [-40, 14], [-45, -6], [-42, -20], [38, -22], [42, -12], [36, -14], [-10, -14], [-13, -2], [-15, 10], [-20, 20]]], lines: []},
    s: {front: [[[-12, 26], [-30, 28], [-44, 14], [-47, -6], [-42, -22], [30, -22], [34, -18], [10, -16], [0, -12], [-1, 2], [-4, 16]]], lines: []},
  },
  balding: {
    f: {
      back: [
        [[-32, -26], ...lobes([-37, -27], [-50, -6], 1, 4, [-1, -0.4]).slice(1), ...lobes([-50, -6], [-45, 24], 2, 4.5, [-1, 0.1]).slice(1), [-34, 26], [-28, 0]],
        mirrorX([[-32, -26], ...lobes([-37, -27], [-50, -6], 1, 4, [-1, -0.4]).slice(1), ...lobes([-50, -6], [-45, 24], 2, 4.5, [-1, 0.1]).slice(1), [-34, 26], [-28, 0]]),
      ],
      front: [
        [[-31, -27], ...lobes([-36, -28], [-46, -9], 1, 4, [-1, -0.3]).slice(1), ...lobes([-46, -9], [-41, 2], 1, 3, [-1, 0.4]).slice(1), [-38.5, -4], [-36, -14]],
        mirrorX([[-31, -27], ...lobes([-36, -28], [-46, -9], 1, 4, [-1, -0.3]).slice(1), ...lobes([-46, -9], [-41, 2], 1, 3, [-1, 0.4]).slice(1), [-38.5, -4], [-36, -14]]),
      ],
      lines: ['M 28 -32 Q 22 -36 14 -35'],
    },
    q: {
      front: [
        [[-12, -14], [-18, -24], [-28, -27], ...lobes([-32, -27], [-49, -4], 2, 4.5, [-1, -0.4]).slice(1), ...lobes([-49, -4], [-36, 28], 2, 4.5, [-1, 0.3]).slice(1), [-26, 31], [-19, 20], [-15, 6]],
        [[37, -22], ...lobes([41, -22], [45, -2], 1, 3.5, [1, 0]).slice(1), [41, 0], [40, -10]],
      ],
      lines: ['M -38 -8 Q -34 4 -38 16', 'M 10 -34 Q 18 -36 26 -32'],
    },
    s: {
      front: [[[-1, -14], [-12, -22], [-26, -26], ...lobes([-31, -26], [-50, -2], 2, 4.5, [-1, -0.4]).slice(1), ...lobes([-50, -2], [-40, 28], 2, 4.5, [-1, 0.3]).slice(1), [-24, 33], [-8, 27], [-3, 12], [-1, 0]]],
      lines: ['M -40 0 Q -36 10 -40 20', 'M 16 -34 Q 24 -34 30 -28'],
    },
  },
  bun: {
    f: {
      front: [[[-42, 0], [-45, -22], [-37, -41], [-16, -51], [16, -51], [37, -41], [45, -22], [42, 0], [38, -12], [28, -24], [10, -29], [0, -26], [-10, -29], [-28, -24], [-38, -12]]],
      lines: ['M 0 -26 Q 2 -38 0 -50', 'M -14 -28 Q -24 -36 -30 -38', 'M 14 -28 Q 24 -36 30 -38'],
      bun: [0, -54], bunR: 15,
    },
    q: {
      front: [[[-27, 26], [-40, 14], [-46, -10], [-40, -34], [-22, -49], [2, -52], [24, -48], [39, -35], [44, -18], [42, -8], [36, -18], [26, -26], [12, -28], [0, -26], [-8, -18], [-13, -8], [-14, 4], [-17, 14], [-21, 22]]],
      lines: ['M 10 -28 Q 0 -38 -16 -44', 'M 24 -26 Q 14 -38 -2 -48', 'M -8 -18 Q -22 -30 -32 -36'],
      bun: [-26, -50], bunR: 15,
    },
    s: {
      front: [[[-10, 26], [-28, 28], [-42, 14], [-48, -10], [-42, -34], [-22, -49], [4, -52], [24, -46], [36, -34], [41, -18], [38, -14], [28, -26], [14, -28], [4, -20], [-1, -8], [-1, 4], [-4, 16]]],
      lines: ['M 26 -26 Q 6 -36 -20 -42', 'M 12 -26 Q -4 -30 -24 -30'],
      bun: [-42, -40], bunR: 15,
    },
  },
  tuft: {
    f: {front: [[[-10, -38], [-6, -50], [4, -56], [12, -54], [6, -48], [8, -40], [2, -39]]], lines: ['M -18 -36 Q -16 -42 -10 -44', 'M 16 -36 Q 16 -42 12 -44']},
    q: {front: [[[-4, -39], [0, -52], [10, -57], [18, -54], [12, -48], [14, -41], [6, -40]]], lines: []},
    s: {front: [[[-4, -40], [-2, -52], [8, -57], [16, -55], [10, -48], [12, -41], [4, -41]]], lines: []},
  },
};

// ================================================================== the spec
export type TopKind = 'scrub' | 'hoodie' | 'blouse' | 'shirt' | 'tee' | 'onesie';
export type Build = {
  heads: number; // total height in head heights
  R: number; // head (cranium) radius in units: about 40 for a woman
  shoulder: number; chest: number; waist: number; hip: number; belly: number; // half-widths and depths, in R
  limb: number; // arm and leg thickness factor
  neck: number; neckLen: number; // neck half-width and length, in R
  legFrac: number; // crotch height / total height
  hand?: number; // hand size factor
  arm?: number; // arm length factor
  jaw?: number; // jaw width factor (1 = the standard head)
  nose?: number; // nose size factor (1 = the standard nose)
  tilt?: number; // a little head tilt at rest, in degrees
};
export type PersonSpec = {
  id: string; name: string; role: string;
  skin: string;
  hair: {style: HairStyle; color: string};
  top: {kind: TopKind; color: string; sleeve: 'short' | 'elbow' | 'long'; under?: string; trim?: string};
  over?: {kind: 'coat' | 'cardigan'; color: string};
  bottom: {kind: 'trousers' | 'skirt' | 'shorts' | 'onesie'; color: string; hem?: number};
  shoes: {kind: 'trainer' | 'shoe' | 'flat' | 'bare'; color: string};
  extras?: {glasses?: 'round' | 'square'; stethoscope?: boolean; moustache?: boolean; earrings?: boolean; cap?: string; stubble?: boolean; belt?: string; sash?: string; elbowPatch?: string};
  build: Build;
};

// ================================================================== poses
export type PoseName = 'rest' | 'explain' | 'point' | 'thumbs' | 'think' | 'worried' | 'clipboard' | 'sit' | 'wave'
  // scene poses (added for the rooms scenes, 2026-11-20)
  | 'showArm' | 'tapHand' | 'offer' | 'thumbsHold' | 'thumbsUp' | 'worriedHold' | 'explainLow' | 'worriedPoint' | 'youSee' | 'showArmUp'
  // the rooms shots in motion (2026-11-20): the Kid acts with his RIGHT arm (the far arm when he faces left)
  | 'showArmUpR' | 'shrugR' | 'tapHandR' | 'showArmR' | 'armInR' | 'thumbsUpR' | 'worriedPointTap' | 'soapUp' | 'meDoctor' | 'oneFinger' | 'holdVial' | 'pointTapSoap';
/** Arm: directions in the ARM frame: x = outwards from the body, y = down, z = forwards. */
type ArmPose = {up: V3; fore: V3; hand: HandKind; thumb?: V3; bend?: number; ang?: number; front?: boolean; prop?: 'clipboard'};
type LegPose = {thigh: V3; shin: V3; foot: V3};
type Pose = {R: ArmPose; L: ArmPose; legR: LegPose; legL: LegPose; sit?: boolean; tilt?: number; lean?: number};
const REST_R: ArmPose = {up: [0.14, 1, -0.06], fore: [0.02, 1, 0.3], hand: 'relaxed', thumb: [-0.4, 0, 1]};
const REST_L: ArmPose = {up: [0.18, 1, -0.04], fore: [0.06, 1, 0.24], hand: 'relaxed', thumb: [-0.4, 0, 1]};
const STAND_R: LegPose = {thigh: [0.04, 1, 0], shin: [0.02, 1, 0.0], foot: [0.28, 0, 1]};
const STAND_L: LegPose = {thigh: [0.1, 1, 0.1], shin: [0.05, 1, 0.03], foot: [0.4, 0, 1]};
export const POSES: Record<PoseName, Pose> = {
  rest: {R: REST_R, L: REST_L, legR: STAND_R, legL: STAND_L},
  explain: {R: REST_R, L: {up: [0.5, 0.86, 0.25], fore: [0.62, -0.28, 0.72], hand: 'open', thumb: [0, -1, 0.2], bend: -18}, legR: STAND_R, legL: STAND_L, tilt: -4},
  point: {R: REST_R, L: {up: [0.62, 0.28, 0.66], fore: [0.62, -0.06, 0.78], hand: 'point', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L},
  thumbs: {R: REST_R, L: {up: [0.3, 0.9, 0.45], fore: [0.35, -0.7, 0.7], hand: 'thumbs', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L, tilt: 4},
  think: {R: {up: [0.0, 1, 0.8], fore: [-0.28, -1, 0.25], hand: 'fist', thumb: [0, -1, 0.5], front: true}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: 7},
  worried: {R: {up: [0.12, 1, 0.34], fore: [-0.85, -0.62, 0.4], hand: 'rest', thumb: [0, -1, 0], front: true, bend: -48}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: -5},
  clipboard: {R: {up: [0.06, 1, 0.3], fore: [-0.55, -0.2, 0.8], hand: 'hold', thumb: [0, -1, 0], front: true, prop: 'clipboard'}, L: REST_L, legR: STAND_R, legL: STAND_L},
  sit: {
    R: {up: [0.06, 1, 0.32], fore: [-0.5, -0.5, 0.75], hand: 'hold', thumb: [0, -1, 0], front: true, prop: 'clipboard'},
    L: {up: [0.12, 1, 0.12], fore: [0.0, 0.3, 1], hand: 'relaxed', thumb: [-0.5, -0.6, 0.5]},
    legR: {thigh: [0.02, 0.04, 1], shin: [0.0, 1, 0.08], foot: [0.12, 0, 1]},
    legL: {thigh: [0.12, 0.04, 1], shin: [0.04, 1, 0.12], foot: [0.3, 0, 1]},
    sit: true,
  },
  wave: {R: REST_R, L: {up: [0.75, 0.62, 0.1], fore: [0.18, -1, 0.1], hand: 'open', thumb: [-1, 0, 0.2]}, legR: STAND_R, legL: STAND_L},
  // ---- scene poses (rooms scenes): additive, the poses above are unchanged
  /** holds the far forearm out in front, palm up, to show it */
  showArm: {R: REST_R, L: {up: [0.3, 0.6, 0.75], fore: [0.08, -0.62, 0.8], hand: 'open', thumb: [0, -1, 0.2]}, legR: STAND_R, legL: STAND_L, tilt: -3},
  /** reaches the far hand forward at shoulder height (a hand under a tap) */
  tapHand: {R: REST_R, L: {up: [0.25, 0.2, 0.95], fore: [0.05, -0.25, 1], hand: 'open', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L, tilt: 3},
  /** offers something on the far open hand, forward at waist height */
  offer: {R: REST_R, L: {up: [0.15, 1, 0.15], fore: [0.05, 0.1, 1], hand: 'open', thumb: [0, -1, 0.2]}, legR: STAND_R, legL: STAND_L, tilt: -4},
  /** thumbs up with the far hand, the near hand holds a small thing in front */
  thumbsHold: {R: {up: [0.08, 1, 0.3], fore: [-0.4, -0.4, 0.85], hand: 'hold', thumb: [0, -1, 0], front: true}, L: {up: [0.35, 0.9, 0.3], fore: [0.15, -0.95, 0.3], hand: 'thumbs', thumb: [0, -1, 0], ang: -90}, legR: STAND_R, legL: STAND_L, tilt: 4},
  /** thumbs up with the far hand, the thumb straight up over a level fist */
  thumbsUp: {R: REST_R, L: {up: [0.35, 0.9, 0.3], fore: [0.15, -0.95, 0.3], hand: 'thumbs', thumb: [0, -1, 0], ang: -90}, legR: STAND_R, legL: STAND_L, tilt: 4},
  /** worried: the near hand on the chest, the far hand held out, palm up, under someone's arm */
  worriedHold: {R: {up: [0.12, 1, 0.34], fore: [-0.85, -0.62, 0.4], hand: 'rest', thumb: [0, -1, 0], front: true, bend: -48}, L: {up: [0.2, 0.98, 0.3], fore: [0.12, 0.8, 0.6], hand: 'open', thumb: [0, -1, 0.2]}, legR: STAND_R, legL: STAND_L, tilt: -5},
  /** explains with the far open hand low, at waist height (toward a child) */
  /** worried: the near hand on the chest, the far index finger points down-forward at something (a scratch) */
  worriedPoint: {R: {up: [0.12, 1, 0.34], fore: [-0.85, -0.62, 0.4], hand: 'rest', thumb: [0, -1, 0], front: true, bend: -48}, L: {up: [0.25, 0.95, 0.35], fore: [0.3, 0.3, 0.95], hand: 'point', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L, tilt: -5},
  /** a palm-up "you see" gesture with the far hand, at chest height, close to the body */
  youSee: {R: REST_R, L: {up: [0.25, 1, 0.1], fore: [0.3, -0.5, 0.6], hand: 'open', thumb: [0, -1, 0.2], bend: -10}, legR: STAND_R, legL: STAND_L, tilt: 3},
  /** holds the far forearm up in front, nearly upright, palm toward the face (shows a mark on the forearm) */
  showArmUp: {R: REST_R, L: {up: [0.3, 0.15, 0.95], fore: [0.0, -1, 0.15], hand: 'open', thumb: [0, -1, 0.2]}, legR: STAND_R, legL: STAND_L, tilt: -3},
  explainLow: {R: REST_R, L: {up: [0.35, 0.9, 0.3], fore: [0.4, 0.35, 0.85], hand: 'open', thumb: [0, -1, 0.2], bend: -10}, legR: STAND_R, legL: STAND_L, tilt: 3},
  // ---- the rooms shots in motion: the R-arm twins of the Kid's poses (his right arm is the far arm when facing left)
  showArmUpR: {R: {up: [0.3, 0.15, 0.95], fore: [0.0, -1, 0.15], hand: 'open', thumb: [0, -1, 0.2]}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: -3},
  /** a small shrug while the forearm is up: the hand tips outwards, the head tilts */
  shrugR: {R: {up: [0.38, 0.05, 0.92], fore: [0.38, -0.92, 0.1], hand: 'open', thumb: [0, -1, 0.2]}, L: {up: [0.26, 1, -0.02], fore: [0.3, 0.9, 0.3], hand: 'relaxed', thumb: [-0.4, 0, 1]}, legR: STAND_R, legL: STAND_L, tilt: 7},
  tapHandR: {R: {up: [0.25, 0.2, 0.95], fore: [0.05, -0.25, 1], hand: 'open', thumb: [0, -1, 0]}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: 3},
  showArmR: {R: {up: [0.3, 0.6, 0.75], fore: [0.08, -0.62, 0.8], hand: 'open', thumb: [0, -1, 0.2]}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: -3},
  /** the plastered forearm pulled in, low and close to the body */
  armInR: {R: {up: [0.16, 0.97, 0.22], fore: [0.05, -0.35, 0.9], hand: 'relaxed', thumb: [0, -1, 0.2]}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: -6},
  thumbsUpR: {R: {up: [0.35, 0.9, 0.3], fore: [0.15, -0.95, 0.3], hand: 'thumbs', thumb: [0, -1, 0], ang: -90}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: 4},
  /** worried: the near hand on the chest, the far index finger points down-forward (at the tap) */
  worriedPointTap: {R: {up: [0.12, 1, 0.34], fore: [-0.85, -0.62, 0.4], hand: 'rest', thumb: [0, -1, 0], front: true, bend: -48}, L: {up: [0.3, 0.95, 0.2], fore: [0.55, -0.25, 0.5], hand: 'point', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L, tilt: -3},
  /** the near hand held up in front, palm up (a bar of soap on it) */
  soapUp: {R: {up: [0.05, 1, 0.4], fore: [-0.15, -0.35, 0.95], hand: 'open', thumb: [0, -1, 0.2], front: true}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: -2},
  /** keeps pointing at the tap with the far hand, the near hand holds up the soap */
  pointTapSoap: {R: {up: [0.05, 1, 0.4], fore: [-0.15, -0.35, 0.95], hand: 'open', thumb: [0, -1, 0.2], front: true}, L: {up: [0.3, 0.95, 0.2], fore: [0.55, -0.25, 0.5], hand: 'point', thumb: [0, -1, 0]}, legR: STAND_R, legL: STAND_L, tilt: -2},
  /** the near index finger points at her own chest ("me, the doctor") */
  meDoctor: {R: {up: [0.12, 1, 0.34], fore: [-0.85, -0.62, 0.4], hand: 'point', thumb: [0, -1, 0], front: true, ang: 170}, L: {up: [0.25, 1, 0.1], fore: [0.3, -0.5, 0.6], hand: 'open', thumb: [0, -1, 0.2], bend: -10}, legR: STAND_R, legL: STAND_L, tilt: 2},
  /** one finger raised, straight up ("one hard truth") */
  oneFinger: {R: REST_R, L: {up: [0.35, 0.9, 0.3], fore: [0.15, -0.95, 0.3], hand: 'point', thumb: [0, -1, 0], ang: -90}, legR: STAND_R, legL: STAND_L, tilt: 0},
  /** the near hand holds a small thing (the vial) up in front */
  holdVial: {R: {up: [0.08, 1, 0.3], fore: [-0.4, -0.4, 0.85], hand: 'hold', thumb: [0, -1, 0], front: true}, L: REST_L, legR: STAND_R, legL: STAND_L, tilt: 2},
};

// ================================================================== the person
type Sec = {y: number; w: number; d: number; c: number};
type Cam = {c: number; s: number};
const TILT = 0.1; // the camera looks down a little: nearer points sit a little lower
const proj = (cam: Cam, p: V3): P => { const x = p[0] * cam.c + p[2] * cam.s; const z = -p[0] * cam.s + p[2] * cam.c; return [x, p[1] + TILT * z]; };
const depth = (cam: Cam, p: V3) => -p[0] * cam.s + p[2] * cam.c;
const secAt = (secs: Sec[], y: number): Sec => {
  if (y <= secs[0].y) return secs[0];
  for (let i = 0; i < secs.length - 1; i++) {
    const a = secs[i], b = secs[i + 1];
    if (y <= b.y) { const t = (y - a.y) / (b.y - a.y || 1); return {y, w: lerp(a.w, b.w, t), d: lerp(a.d, b.d, t), c: lerp(a.c, b.c, t)}; }
  }
  return {...secs[secs.length - 1], y};
};
const surf = (secs: Sec[], x: number, y: number, lift = 0): V3 => {
  const s = secAt(secs, y);
  const k = Math.max(0, 1 - (x / (s.w + 0.001)) ** 2);
  return [x, y, s.c + (s.d + lift) * Math.sqrt(k)];
};
/** The left or right extreme of a section as seen by the camera. */
const extreme = (cam: Cam, s: Sec, side: 1 | -1): P => {
  const phi = Math.atan2(s.d * cam.s, s.w * cam.c) + (side === 1 ? 0 : Math.PI);
  return proj(cam, [s.w * Math.cos(phi), s.y, s.c + s.d * Math.sin(phi)]);
};
/** The visible front half of a section ring, from the left extreme to the right extreme. */
const ringFront = (cam: Cam, s: Sec, n = 14): P[] => {
  const phiR = Math.atan2(s.d * cam.s, s.w * cam.c);
  const z = (phi: number) => -s.w * Math.cos(phi) * cam.s + (s.c + s.d * Math.sin(phi)) * cam.c;
  const dir = z(phiR + Math.PI / 2) >= z(phiR - Math.PI / 2) ? 1 : -1;
  const out: P[] = [];
  for (let i = 0; i <= n; i++) { const phi = phiR + (dir * Math.PI * i) / n; out.push(proj(cam, [s.w * Math.cos(phi), s.y, s.c + s.d * Math.sin(phi)])); }
  return out.reverse();
};
/** A garment or body shape from sections: sides, the hem as the front of the last ring, and a top. */
const secShape = (cam: Cam, secs: Sec[], top: 'shoulder' | 'line', R: number, bottom: 'ring' | 'line' = 'ring'): string => {
  const L = secs.map((s) => extreme(cam, s, -1));
  const Rr = secs.map((s) => extreme(cam, s, 1));
  const last = secs[secs.length - 1];
  const chains: Chain[] = [{pts: L, smooth: true}];
  if (bottom === 'ring') chains.push({pts: ringFront(cam, last), smooth: false});
  else chains.push({pts: [L[L.length - 1], Rr[Rr.length - 1]], smooth: false});
  chains.push({pts: [...Rr].reverse(), smooth: true});
  if (top === 'shoulder') {
    const e = (Rr[0][0] - L[0][0]) / 2, xc = (Rr[0][0] + L[0][0]) / 2, y0 = L[0][1];
    chains.push({pts: [Rr[0], [xc + e * 0.62, y0 - 0.17 * R], [xc - e * 0.62, y0 - 0.17 * R], L[0]], smooth: true});
  }
  return chainPath(chains);
};
const inflate = (secs: Sec[], t: number, td = t): Sec[] => secs.map((s) => ({...s, w: s.w + t, d: s.d + td}));


// ================================================================== layout (shared by Person, handAt, headAt)
/** A blend of two poses: k = 0 is pose a, k = 1 is pose b. */
export type PoseBlend = {a: PoseName; b: PoseName; k: number};
export type PoseIn = PoseName | PoseBlend;
export type Facing = 'right' | 'left';
const nlerp3 = (a: V3, b: V3, k: number): V3 => { const p = v3norm(a), q = v3norm(b); return v3norm([lerp(p[0], q[0], k), lerp(p[1], q[1], k), lerp(p[2], q[2], k)]); };
const lerpAng = (a: number, b: number, k: number) => a + (((((b - a + 540) % 360) + 360) % 360) - 180) * k;
const swapPose = (p: Pose): Pose => ({...p, R: p.L, L: p.R, legR: p.legL, legL: p.legR});
const blendArm = (a: ArmPose, b: ArmPose, k: number): ArmPose => {
  const pk = k < 0.5 ? a : b;
  return {up: nlerp3(a.up, b.up, k), fore: nlerp3(a.fore, b.fore, k), hand: pk.hand, thumb: pk.thumb, front: pk.front, prop: pk.prop, bend: pk.bend, ang: pk.ang};
};
const blendLeg = (a: LegPose, b: LegPose, k: number): LegPose => ({thigh: nlerp3(a.thigh, b.thigh, k), shin: nlerp3(a.shin, b.shin, k), foot: nlerp3(a.foot, b.foot, k)});
/** The pose to draw: a named pose, or a blend of two (every number blended; the hand kind switches at k = 0.5). */
const resolvePose = (pose: PoseIn, mir: boolean, buildTilt: number) => {
  const fix = (q: Pose) => (mir ? swapPose(q) : q);
  if (typeof pose === 'string') { const P = fix(POSES[pose]); return {P, A: P, B: P, k: 0, blend: false}; }
  const A = fix(POSES[pose.a]), B = fix(POSES[pose.b]);
  const k = Math.max(0, Math.min(1, pose.k));
  const pk = k < 0.5 ? A : B;
  const P: Pose = {
    R: blendArm(A.R, B.R, k), L: blendArm(A.L, B.L, k), legR: blendLeg(A.legR, B.legR, k), legL: blendLeg(A.legL, B.legL, k),
    sit: pk.sit, tilt: lerp(A.tilt ?? buildTilt, B.tilt ?? buildTilt, k), lean: lerp(A.lean ?? 0, B.lean ?? 0, k),
  };
  return {P, A, B, k, blend: true};
};

/** Where a person's parts are (no drawing): the SAME arithmetic for drawing and for handAt / headAt. */
const layoutOf = (spec: PersonSpec, view: View, pose: PoseIn, mir: boolean, bob?: number) => {
  const b = spec.build;
  const R = b.R;
  const theta = view === 'front' ? 0 : view === 'three-quarter' ? Math.PI / 4 : Math.PI / 2;
  const cam: Cam = {c: Math.cos(theta), s: Math.sin(theta)};
  const v = vk(view);
  const rp = resolvePose(pose, mir, b.tilt ?? 0);
  const P0 = rp.P;
  const hU = 2.15 * R;
  const Ht = b.heads * hU;

  // ---------------------------------------------------------------- vertical layout (standing)
  let top = -Ht;
  let headCY = top + R;
  let chinY = headCY + 1.18 * R;
  let yS = chinY + b.neckLen * R; // the shoulder line
  let yC = -b.legFrac * Ht; // the crotch
  const T0 = yC - yS;
  const thighR = 0.34 * R * b.limb;
  let yHip = yC - thighR * 0.7;
  const ankleH = 0.24 * R;
  const legLen = yHip + ankleH; // positive length hip -> ankle (yHip is negative)
  const thighL = -legLen * 0.5, shinL = -legLen * 0.5;
  // sitting: drop the body so the shins reach the floor
  let dy = 0;
  if (P0.sit) {
    const th = v3norm(P0.legR.thigh), sh = v3norm(P0.legR.shin);
    const ankleY = yHip + th[1] * thighL + sh[1] * shinL;
    dy = -ankleH - ankleY;
  }
  top += dy; headCY += dy; chinY += dy; yS += dy; yC += dy; yHip += dy;
  // breathing / speaking: the chest and the head lift a little, the feet stay planted
  if (bob) { const lift = bob * 0.035 * R; top -= lift * 1.3; headCY -= lift * 1.3; chinY -= lift * 1.3; yS -= lift; }

  const S = b.shoulder * R;
  const secs: Sec[] = [
    {y: yS - 0.06 * R, w: S * 0.86, d: 0.48 * R, c: 0},
    {y: yS + 0.3 * T0, w: S * 0.95, d: b.chest * R, c: 0.04 * R},
    {y: yS + 0.6 * T0, w: b.waist * R, d: (0.5 + b.belly) * R, c: b.belly * 0.55 * R},
    {y: yS + 0.84 * T0, w: b.hip * R, d: (0.54 + b.belly * 0.6) * R, c: b.belly * 0.3 * R},
    {y: yC + 0.08 * R, w: b.hip * R * 0.97, d: 0.54 * R, c: 0},
  ];

  // ---------------------------------------------------------------- arms
  const armR0 = 0.17 * R * b.limb, armR1 = 0.13 * R * b.limb, armR2 = 0.11 * R * b.limb;
  const shJ = (side: 1 | -1): V3 => [side * (S - armR0 * 1.05), yS + armR0 * 1.1, 0];
  const armLen = (yC + 0.2 * R - (yS + armR0 * 1.1)) * (b.arm ?? 1);
  const upL = armLen * 0.52, foreL = armLen * 0.5;
  const handK = (R / 40) * (b.hand ?? 1);
  const armGeomOf = (ap: ArmPose, side: 1 | -1) => {
    const toBody = (a: V3): V3 => v3norm([a[0] * side, a[1], a[2]]);
    const s3 = shJ(side);
    const e3 = v3add(s3, v3mul(toBody(ap.up), upL));
    const w3 = v3add(e3, v3mul(toBody(ap.fore), foreL));
    return {ap, s3, e3, w3, s: proj(cam, s3), e: proj(cam, e3), w: proj(cam, w3), z: depth(cam, s3), toBody};
  };
  const armGeom = (side: 1 | -1) => armGeomOf(side === -1 ? P0.R : P0.L, side);
  type AG = ReturnType<typeof armGeomOf>;
  // which side of the hand the thumb is on (the hand drawing's +y side, or mirrored)
  const thumbSign = (g: AG) => {
    const fdir = nrm(sub(g.w, g.e));
    let m = 1;
    const thumb = g.ap.thumb ? g.toBody(g.ap.thumb) : null;
    const lp = perp(fdir);
    if (thumb) {
      const tp = sub(proj(cam, v3add(g.w3, thumb)), g.w);
      const dd = tp[0] * lp[0] + tp[1] * lp[1];
      if (Math.abs(dd) > 0.25 * len(tp)) m = Math.sign(dd);
      else m = Math.sign((-g.w[0]) * lp[0] + 0.0001) || 1; // tie: thumb on the inner side
    }
    return m;
  };
  // a resting hand turns in screen space (fingers follow the body up), whichever side its thumb is on
  const bendOf = (ap: ArmPose, m: number) => (ap.hand === 'rest' ? (ap.bend ?? 0) : (ap.bend ?? 0) * m);
  /** The hand on the arm of `side`: its angle, wrist bend and thumb side (a blend turns the hand smoothly). */
  const handFrame = (side: 1 | -1, g: AG) => {
    const fdir = nrm(sub(g.w, g.e));
    if (!rp.blend) {
      const ap = g.ap;
      const ang = ap.ang ?? deg(fdir);
      const m = thumbSign(g);
      return {ang, bend: bendOf(ap, m), m};
    }
    const aA = side === -1 ? rp.A.R : rp.A.L, aB = side === -1 ? rp.B.R : rp.B.L;
    const mA = thumbSign(armGeomOf(aA, side)), mB = thumbSign(armGeomOf(aB, side));
    const cur = deg(fdir);
    const ang = lerpAng(aA.ang ?? cur, aB.ang ?? cur, rp.k);
    return {ang, bend: lerp(bendOf(aA, mA), bendOf(aB, mB), rp.k), m: rp.k < 0.5 ? mA : mB};
  };
  const headX = 0.12 * R * cam.s; // the head sits a little forward when turned
  const neckX = headX + NECK_AT[v][0] * (R / 40);
  return {R, cam, v, P0, Ht, top, headCY, chinY, yS, yC, yHip, T0, thighR, ankleH, thighL, shinL, dy, S, secs, armR0, armR1, armR2, armLen, upL, foreL, handK, armGeom, handFrame, headX, neckX};
};

export type PersonProps = {spec: PersonSpec; view?: View; pose?: PoseIn; expr?: Expr; look?: [number, number]; headOnly?: boolean; px?: number; talk?: number; blink?: number; facing?: Facing; bob?: number};

export const Person: React.FC<PersonProps> = ({spec, view = 'front', pose = 'rest', expr = 'neutral', look, headOnly, px = 1.5, talk, blink, facing = 'right', bob}) => {
  const b = spec.build;
  const R = b.R;
  // Small figures: the eye ring, glasses and inner lines thin down with the eye (an eye stays an eye).
  const uid = 'p' + useId().replace(/[^a-zA-Z0-9]/g, '');
  const pcls = uid + 'b', fcls = uid + 'f';
  const eyePx = 10.2 * (R / 40) * px;
  const eyeW = Math.min(OUT, eyePx * 0.28), inW = Math.min(IN, eyePx * 0.2);
  const lineCss = (eyeW < OUT ? `.${fcls} [stroke-width="${OUT}"]{stroke-width:${f1(eyeW)}px}` : '')
    + (inW < IN ? `.${pcls} [stroke-width="${IN}"]{stroke-width:${f1(inW)}px} .${pcls} [stroke-width="${IN * 2}"]{stroke-width:${f1(inW * 2)}px}` : '');
  SH = [-0.06 * R, -0.07 * R];
  const mir = facing === 'left' && view !== 'front'; // a real left-facing view: the mirror twin, drawn and flipped
  const ms = mir ? -1 : 1; // multiplies the body-frame x of one-sided details (pocket, pens, buttons, folds)
  const Lo = layoutOf(spec, view, pose, mir, bob);
  const {cam, v, P0, Ht, dy, headCY, chinY, yS, yC, yHip, T0, thighR, ankleH, thighL, shinL, S, secs, armR0, armR1, armR2, upL, foreL, handK, armGeom, handFrame} = Lo;
  void upL;
  const skin = spec.skin;

  const sleeveT = 0.05 * R + (spec.over ? 0.03 * R : 0);
  const drawArm = (side: 1 | -1) => {
    const g = armGeom(side);
    const {ap, s, e, w} = g;
    const sleeve = spec.over ? 'long' : spec.top.sleeve;
    const col = spec.over ? spec.over.color : spec.top.color;
    const fdir = nrm(sub(w, e));
    const parts: React.ReactNode[] = [];
    // the hand's place: at the wrist, along the forearm (or the pose's own angle), thumb side by the pose
    const {ang, bend, m} = handFrame(side, g);
    const ht = `translate(${f1(w[0])} ${f1(w[1])}) rotate(${f1(ang + bend)}) scale(${f1(handK)} ${f1(handK * m)})`;
    const hg = handGeom(ap.hand, false);
    // the prop held in this hand sits behind the arm and the hand
    if (ap.prop === 'clipboard') parts.push(<Clipboard key="prop" at={w} R={R} ang={view === 'front' ? -8 : -14} />);
    // bare skin: upper arm, forearm and hand are ONE outlined form (no ring at the wrist)
    const skinD: UPart[] = [capsule(s, armR0, e, armR1), capsule(e, armR1, w, armR2), ...hg.parts.map((d) => ({d, t: ht}))];
    parts.push(
      <Union key="skin" d={skinD} fill={skin} shadow={0.6} holes={hg.holes}>
        <g transform={ht}>{hg.lines.map((l, i) => <path key={i} d={l} {...INLINE} />)}</g>
      </Union>,
    );
    // the sleeve
    const t = sleeveT;
    let sl: string[] = [];
    let cuffA: P | null = null, cuffB: P | null = null;
    if (sleeve === 'long') {
      const cuff = sub(w, mul(fdir, 0.6));
      const rc = armR2 + t + (spec.over?.kind === 'coat' ? 0.06 * R : 0.02 * R);
      sl = [capsule(s, armR0 + t, e, armR1 + t), capsule(e, armR1 + t, cuff, rc, 'flat')];
      const n = perp(fdir);
      if (spec.over?.kind === 'coat' || spec.top.kind === 'hoodie' || spec.over?.kind === 'cardigan' || (!spec.over && spec.top.kind === 'shirt')) { const c2 = sub(cuff, mul(fdir, (spec.over?.kind === 'coat' ? 0.22 : 0.18) * R)); cuffA = add(c2, mul(n, rc * 0.98)); cuffB = add(c2, mul(n, -rc * 0.98)); }
    } else if (sleeve === 'elbow') {
      const cuff = add(e, mul(fdir, 0.3 * foreL));
      sl = [capsule(s, armR0 + t, e, armR1 + t), capsule(e, armR1 + t, cuff, armR1 + t + 0.04 * R, 'flat')];
    } else {
      const ud = nrm(sub(e, s));
      const cuff = add(s, mul(ud, Math.min(len(sub(e, s)) * 0.5, 0.75 * R)));
      sl = [capsule(s, armR0 + t, cuff, armR0 + t + 0.02 * R, 'flat')];
    }
    // v4 clothes (the owner, 2026-11-20: seams and folds): elbow creases, a stitched hem on short sleeves
    const ud = nrm(sub(e, s)), un = perp(ud), fn = perp(fdir);
    const folds: React.ReactNode[] = [];
    if (sleeve === 'long') {
      const r1 = armR1 + t;
      folds.push(<path key="f1" d={openSmooth([add(sub(e, mul(ud, 0.06 * R)), mul(un, r1 * 1.05)), add(sub(e, mul(ud, 0.16 * R)), mul(un, r1 * 0.45)), add(sub(e, mul(ud, 0.2 * R)), mul(un, r1 * 0.1))])} {...INLINE} />);
      folds.push(<path key="f2" d={openSmooth([add(add(e, mul(fdir, 0.1 * R)), mul(fn, r1 * 1.05)), add(add(e, mul(fdir, 0.03 * R)), mul(fn, r1 * 0.5))])} {...INLINE} />);
      folds.push(<path key="f3" d={openSmooth([add(sub(s, mul(ud, -0.42 * R)), mul(un, -(armR0 + t) * 1.05)), add(sub(s, mul(ud, -0.3 * R)), mul(un, -(armR0 + t) * 0.5))])} {...INLINE} />);
      // the cuff band (v4, visible at phone size): ribbed on knits, a plain band on the coat and the shirt
      if (cuffA && cuffB) {
        const ex = mul(fdir, 0.5 * R);
        const knit = spec.top.kind === 'hoodie' || spec.over?.kind === 'cardigan';
        folds.push(<path key="cuff" d={poly([cuffA, cuffB, add(cuffB, ex), add(cuffA, ex)])} fill={shade(col, spec.over?.kind === 'coat' ? 0.06 : 0.12)} />);
        if (knit) for (const q of [0.25, 0.5, 0.75]) { const a = lerpP(cuffA, cuffB, q); folds.push(<path key={'rib' + q} d={`M ${pt(a)} L ${pt(add(a, mul(fdir, 0.16 * R)))}`} {...INLINE} />); }
        if (!knit) { const bt = add(lerpP(cuffA, cuffB, 0.3), mul(fdir, 0.09 * R)); folds.push(<circle key="cbtn" cx={bt[0]} cy={bt[1]} r={0.045 * R} fill={tint(col, 0.5)} {...EDGE_IN} />); }
      }
      // elbow patches (Grandpa's cardigan)
      if (spec.extras?.elbowPatch && spec.over) {
        const ang = (Math.atan2(ud[1], ud[0]) * 180) / Math.PI;
        folds.push(<ellipse key="patch" cx={e[0]} cy={e[1]} rx={0.2 * R} ry={0.12 * R} transform={`rotate(${f1(ang)} ${f1(e[0])} ${f1(e[1])})`} fill={spec.extras.elbowPatch} {...EDGE_IN} />);
      }
    } else {
      const end = sleeve === 'elbow' ? add(e, mul(fdir, 0.3 * foreL)) : add(s, mul(ud, Math.min(len(sub(e, s)) * 0.5, 0.75 * R)));
      const dir = sleeve === 'elbow' ? fdir : ud, n2 = perp(dir), r2 = (sleeve === 'elbow' ? armR1 : armR0) + t + 0.03 * R;
      const c = sub(end, mul(dir, spec.top.trim && !spec.over ? 0.17 * R : 0.13 * R));
      // a trimmed sleeve band (the Kid's ringer tee, the Baby's onesie)
      if (spec.top.trim && !spec.over) folds.push(<path key="trim" d={poly([add(c, mul(n2, r2 * 1.5)), add(c, mul(n2, -r2 * 1.5)), add(add(end, mul(dir, 0.2 * R)), mul(n2, -r2 * 1.5)), add(add(end, mul(dir, 0.2 * R)), mul(n2, r2 * 1.5))])} fill={spec.top.trim} />);
      // Mom's elbow sleeve: a turned-up cuff band
      if (sleeve === 'elbow') folds.push(<path key="turn" d={poly([add(c, mul(n2, r2 * 1.5)), add(c, mul(n2, -r2 * 1.5)), add(add(end, mul(dir, 0.2 * R)), mul(n2, -r2 * 1.5)), add(add(end, mul(dir, 0.2 * R)), mul(n2, r2 * 1.5))])} fill={shade(col, 0.1)} />);
      folds.push(<path key="hem" d={`M ${pt(add(c, mul(n2, r2 * 1.1)))} L ${pt(add(c, mul(n2, -r2 * 1.1)))}`} {...INLINE} />);
      if (sleeve === 'short') folds.push(<path key="f1" d={openSmooth([add(add(s, mul(ud, 0.12 * R)), mul(un, (armR0 + t) * 1.05)), add(add(s, mul(ud, 0.28 * R)), mul(un, (armR0 + t) * 0.45))])} {...INLINE} />);
    }
    parts.push(
      <Union key="sleeve" d={sl} fill={col}>
        {folds}
        {cuffA && cuffB && <path d={`M ${pt(cuffA)} L ${pt(cuffB)}`} {...INLINE} />}
      </Union>,
    );
    // The shoulder: the round top of the sleeve must not draw an arc ON the body (it read as the arm
    // sitting on top of the shoulder; owner, 2026-11-20). Where the top half of that round end lies over
    // the garment, it is filled with the garment's colour, so the shoulder line runs from the neck
    // straight into the outside of the arm and the arm's inner line starts at the armpit.
    {
      const rb = armR0 + t;
      const m = (OUT / px) * 1.6; // the outline lies outside the shape
      const body = shoulderPath();
      const top = poly([[s[0] - rb - m - 2, s[1] - rb - m - 2], [s[0] + rb + m + 2, s[1] - rb - m - 2], [s[0] + rb + m + 2, s[1] + rb * 0.45], [s[0] - rb - m - 2, s[1] + rb * 0.45]]);
      parts.push(
        <Clip key="shoulder" d={body}>
          <Clip d={top}><circle cx={f1(s[0])} cy={f1(s[1])} r={f1(rb + m)} fill={col} /></Clip>
        </Clip>,
      );
    }
    // a thumb lying over the fingers is drawn last, on its own thin outline
    if (hg.over.length) parts.push(<g key="thumb" transform={ht}><Union d={hg.over} fill={skin} shadow={0} line="in" /></g>);
    return <g key={'arm' + side}>{parts}</g>;
  };

  // ---------------------------------------------------------------- legs
  const kneeR = 0.24 * R * b.limb, ankR = 0.16 * R * b.limb;
  const legGeom = (side: 1 | -1) => {
    const lp = side === -1 ? P0.legR : P0.legL;
    const toBody = (a: V3): V3 => v3norm([a[0] * side, a[1], a[2]]);
    const h3: V3 = [side * (b.hip * R - thighR * 0.95), yHip, 0];
    const k3 = v3add(h3, v3mul(toBody(lp.thigh), thighL));
    const a3 = v3add(k3, v3mul(toBody(lp.shin), shinL));
    return {h3, k3, a3, h: proj(cam, h3), k: proj(cam, k3), a: proj(cam, a3), foot: toBody(lp.foot), z: depth(cam, k3)};
  };
  const shoe = (side: 1 | -1) => {
    const g = legGeom(side);
    const fd = g.foot;
    const bare = spec.shoes.kind === 'bare';
    const Lf = 0.86 * R * (b.hand ?? 1) * (bare ? 0.75 : 1);
    const hw = (bare ? 0.2 : 0.29) * R * Math.sqrt(b.limb);
    const toe3 = v3add(g.a3, v3mul(fd, Lf * 0.7));
    const heel3 = v3add(g.a3, v3mul(fd, -Lf * 0.22));
    const toe = proj(cam, [toe3[0], 0, toe3[2]]);
    const heel = proj(cam, [heel3[0], 0, heel3[2]]);
    const a = g.a;
    const sgn = toe[0] - heel[0] >= -0.5 ? 1 : -1;
    const prof = Math.min(1, Math.abs(toe[0] - heel[0]) / (Lf * 0.92));
    const q = lerp(1, 0.45, prof);
    const uB = (heel[0] - a[0]) * sgn - hw * q, uF = (toe[0] - a[0]) * sgn + hw * q;
    const yb = TILT * depth(cam, toe3) * 0.5;
    const hgt = (bare ? 0.26 : 0.34) * R;
    const X = (u: number) => a[0] + sgn * u;
    const pts: P[] = [
      [X(uB), yb - hgt * 0.45], [X(uB + hw * 0.25), yb], [X(uF - hw * 0.4), yb], [X(uF), yb - hgt * 0.42],
      [X(uF - hw * 0.65), yb - hgt * 0.88], [X(hw * 0.45), a[1] - 0.04 * R], [X(-hw * 0.6), a[1] - 0.02 * R],
    ];
    const d = closedSmooth(pts);
    const col = bare ? skin : spec.shoes.color;
    const sole = spec.shoes.kind === 'trainer' && col !== '#ffffff';
    return (
      <Union key={'shoe' + side} d={[d]} fill={col} shadow={0.8}>
        {sole && <rect x={X(uB) - 50} y={yb - hgt * 0.24} width={200} height={hgt} fill="#ffffff" />}
        {spec.shoes.kind === 'trainer' && <path d={`M ${pt([a[0] - 60, yb - hgt * 0.24])} L ${pt([a[0] + 60, yb - hgt * 0.24])}`} {...INLINE} />}
      </Union>
    );
  };
  const drawLegs = () => {
    const bk = spec.bottom.kind;
    const gs = [legGeom(-1), legGeom(1)];
    // far leg first
    const order = cam.s > 0.1 ? [1, 0] : [0, 1];
    const out: React.ReactNode[] = [];
    const pelvisSecs: Sec[] = [secAt(secs, yS + 0.62 * T0), secs[3], secs[4]];
    const bareLeg = bk === 'skirt' || bk === 'shorts';
    // bare legs and shoes
    for (const i of order) {
      const g = gs[i];
      if (bareLeg) out.push(<Union key={'bl' + i} d={[capsule(g.h, thighR * 0.92, g.k, kneeR), capsule(g.k, kneeR, g.a, ankR)]} fill={skin} shadow={0.7} />);
    }
    for (const i of order) out.push(shoe(i === 0 ? -1 : 1));
    if (bk === 'trousers' || bk === 'onesie') {
      const t = 0.04 * R;
      const pel = secShape(cam, inflate(pelvisSecs, t), 'line', R);
      for (const i of order) {
        const g = gs[i];
        const fd = nrm(sub(g.a, g.k));
        const hem = bk === 'onesie' ? sub(g.a, mul(fd, 0.05 * R)) : sub(g.a, mul(fd, 0.02 * R));
        const hemR = bk === 'onesie' ? ankR + 0.05 * R : ankR + 0.1 * R;
        out.push(
          <Union key={'tr' + i} d={[pel, capsule(g.h, thighR + t, g.k, kneeR + t + 0.02 * R), capsule(g.k, kneeR + t + 0.02 * R, hem, hemR, 'flat')]} fill={spec.bottom.color}>
            {bk === 'trousers' && <path d={openSmooth([lerpP(g.h, g.k, 0.55), lerpP(g.h, g.k, 0.75)])} {...INLINE} />}
            {bk === 'trousers' && (() => {
              // v4: two knee folds and the stitched hem
              const td = nrm(sub(g.k, g.h)), tn = perp(td), kr = kneeR + t + 0.02 * R;
              const hc = sub(hem, mul(fd, 0.14 * R)), hn = perp(fd);
              return (
                <>
                  <path d={openSmooth([add(sub(g.k, mul(td, 0.14 * R)), mul(tn, kr * 1.05)), add(sub(g.k, mul(td, 0.06 * R)), mul(tn, kr * 0.4))])} {...INLINE} />
                  <path d={openSmooth([add(add(g.k, mul(fd, 0.1 * R)), mul(tn, -kr * 1.05)), add(add(g.k, mul(fd, 0.16 * R)), mul(tn, -kr * 0.45))])} {...INLINE} />
                  <path d={`M ${pt(add(hc, mul(hn, hemR * 1.1)))} L ${pt(add(hc, mul(hn, -hemR * 1.1)))}`} {...INLINE} />
                </>
              );
            })()}
          </Union>,
        );
      }
      if (bk === 'onesie') {
        // a little cuff at each ankle
        for (const i of order) { const g = gs[i]; const fd = nrm(sub(g.a, g.k)); const c = sub(g.a, mul(fd, 0.12 * R)); const n = perp(fd); out.push(<path key={'oc' + i} d={`M ${pt(add(c, mul(n, ankR + 0.05 * R)))} L ${pt(add(c, mul(n, -ankR - 0.05 * R)))}`} {...INLINE} />); }
      }
    } else if (bk === 'shorts') {
      const t = 0.05 * R;
      const pel = secShape(cam, inflate(pelvisSecs, t), 'line', R);
      for (const i of order) {
        const g = gs[i];
        const fd = nrm(sub(g.k, g.h));
        const hem = add(g.h, mul(fd, len(sub(g.k, g.h)) * 0.62));
        const hc = sub(hem, mul(fd, 0.12 * R)), hn = perp(fd), hr = thighR + t + 0.03 * R;
        out.push(
          <Union key={'sh' + i} d={[pel, capsule(g.h, thighR + t, hem, hr, 'flat')]} fill={spec.bottom.color}>
            <path d={`M ${pt(add(hc, mul(hn, hr * 1.1)))} L ${pt(add(hc, mul(hn, -hr * 1.1)))}`} {...INLINE} />
            <path d={openSmooth([add(g.h, mul(hn, (i === 0 ? -1 : 1) * hr * 0.2)), add(add(g.h, mul(fd, len(sub(hem, g.h)) * 0.5)), mul(hn, (i === 0 ? -1 : 1) * hr * 0.55))])} {...INLINE} />
          </Union>,
        );
      }
    }
    return out;
  };

  // ---------------------------------------------------------------- torso, skirt, coat
  const topT = 0.05 * R;
  const topHemY = spec.top.kind === 'shirt' ? yS + 0.66 * T0 : yS + 0.95 * T0;
  const topSecs: Sec[] = inflate(secs.filter((s) => s.y < topHemY - 0.5).concat([secAt(secs, topHemY)]), topT).map((q, i, all) => (spec.top.kind === 'blouse' && i === all.length - 1 ? {...q, w: q.w * 1.1} : q)); // v4: the blouse flares a little at the hem
  const nw = b.neck * R; // neck half-width

  const drawSkirt = () => {
    if (spec.bottom.kind !== 'skirt') return null;
    const hemY = spec.bottom.hem !== undefined ? -spec.bottom.hem * Ht + dy : yC + 0.9 * (0 - yC) * 0.5;
    const s0 = secAt(secs, yS + 0.62 * T0);
    const sk: Sec[] = [
      {...s0, w: s0.w + 0.05 * R, d: s0.d + 0.05 * R},
      {...secs[3], w: secs[3].w + 0.08 * R, d: secs[3].d + 0.08 * R},
      {y: yC + 0.2 * R, w: b.hip * R * 1.12, d: 0.7 * R, c: 0},
      {y: hemY, w: b.hip * R * 1.3, d: 0.85 * R, c: 0.02 * R},
    ];
    const d = secShape(cam, sk, 'line', R);
    const mid = (y: number, x: number) => proj(cam, surf(sk, x, y));
    return (
      <Union key="skirt" d={[d]} fill={spec.bottom.color}>
        <path d={openSmooth([mid(yC + 0.1 * R, ms * -0.35 * R), mid(hemY - 0.05 * R, ms * -0.55 * R)])} {...INLINE} />
        <path d={openSmooth([mid(yC + 0.3 * R, ms * 0.4 * R), mid(hemY - 0.05 * R, ms * 0.62 * R)])} {...INLINE} />
        <path d={openSmooth([-1.4, -0.9, -0.3, 0.3, 0.9, 1.4].map((k) => mid(hemY - 0.15 * R, k * b.hip * R)))} {...INLINE} />
      </Union>
    );
  };

  /** The outline of the outermost garment on the upper body (the coat or cardigan, else the top). */
  function shoulderPath(): string {
    if (spec.over) return secShape(cam, overSecs(), 'shoulder', R);
    if (spec.top.kind === 'onesie') return secShape(cam, inflate(secs, topT), 'shoulder', R);
    return secShape(cam, topSecs, 'shoulder', R);
  }
  /** v4 clothes (the owner, 2026-11-20): hem stitch, waist folds, the shirt's placket and pocket, the tee's
   * print, the blouse's gathers. Drawn in the body frame, so every view and pose gets them. */
  const torsoDetail = () => {
    const k = spec.top.kind;
    const sp = (x: number, y: number, lift = topT) => proj(cam, surf(secs, x, y, lift));
    const seen = (x: number, y: number) => depth(cam, surf(secs, x, y, topT)) > 0.05 * R;
    const out: React.ReactNode[] = [];
    if (k !== 'shirt' && k !== 'hoodie') out.push(<path key="hem" d={openSmooth([-0.98, -0.6, -0.2, 0.2, 0.6, 0.98].map((q) => sp(q * S, topHemY - 0.14 * R)))} {...INLINE} />);
    for (const sd of [-1, 1] as const) {
      const y0 = yS + 0.5 * T0;
      if (!seen(sd * 0.6 * R, y0)) continue;
      out.push(<path key={'wf' + sd} d={openSmooth([sp(sd * 0.92 * S, y0 - 0.12 * R), sp(sd * 0.62 * S, y0 + 0.06 * R), sp(sd * 0.45 * S, y0 + 0.1 * R)])} {...INLINE} />);
      if (k !== 'shirt') out.push(<path key={'wg' + sd} d={openSmooth([sp(sd * 0.9 * S, y0 + 0.3 * R), sp(sd * 0.66 * S, y0 + 0.4 * R)])} {...INLINE} />);
    }
    if (k === 'hoodie') {
      // the ribbed hem band
      const yb = topHemY - 0.22 * R;
      const band = [-1.3, -0.65, 0, 0.65, 1.3].map((q) => sp(q * S, yb));
      out.push(<path key="rib" d={openSmooth(band) + ` L ${pt([band[4][0], band[4][1] + 0.8 * R])} L ${pt([band[0][0], band[0][1] + 0.8 * R])} Z`} fill={shade(spec.top.color, 0.1)} />);
      for (let i = -5; i <= 5; i++) { const q = i * 0.17 * S; if (!seen(q, yb + 0.1 * R)) continue; out.push(<path key={'rb' + i} d={openSmooth([sp(q, yb + 0.03 * R), sp(q, yb + 0.2 * R)])} {...INLINE} />); }
    }
    if (spec.extras?.sash) {
      // a sash at the waist (Mom)
      const yw = yS + 0.6 * T0;
      const up = [-1.3, -0.65, 0, 0.65, 1.3].map((q) => sp(q * S, yw - 0.1 * R)), dn = [1.3, 0.65, 0, -0.65, -1.3].map((q) => sp(q * S, yw + 0.1 * R));
      out.push(<path key="sash" d={openSmooth(up) + ' L ' + pt(dn[0]) + openSmooth(dn).slice(openSmooth(dn).indexOf(' C')) + ' Z'} fill={spec.extras.sash} {...EDGE_IN} />);
      if (seen(ms * -0.5 * R, yw)) { const kx = sp(ms * -0.5 * R, yw); out.push(<path key="knot" d={`M ${f1(kx[0])} ${f1(kx[1])} l ${-0.1 * R} ${0.34 * R} l ${0.12 * R} ${-0.04 * R} Z M ${f1(kx[0])} ${f1(kx[1])} l ${0.12 * R} ${0.32 * R} l ${0.1 * R} ${-0.06 * R} Z`} fill={spec.extras.sash} {...EDGE_IN} />); out.push(<circle key="kn" cx={kx[0]} cy={kx[1]} r={0.07 * R} fill={spec.extras.sash} {...EDGE_IN} />); }
    }
    if (k === 'shirt') {
      out.push(<path key="yoke" d={openSmooth([-0.95, -0.5, 0, 0.5, 0.95].map((q) => sp(q * S, yS + 0.3 * R + Math.abs(q) * 0.04 * R)))} {...INLINE} />);
      out.push(<path key="plk" d={openSmooth([sp(ms * 0.2 * R, yS + 0.32 * R), sp(ms * 0.2 * R, topHemY)])} {...INLINE} />);
      const x0 = ms * -0.85 * R, x1 = ms * -0.4 * R, y0 = yS + 0.62 * R, y1 = yS + 1.08 * R;
      if (seen((x0 + x1) / 2, y0)) {
        out.push(<path key="pk" d={poly([sp(x0, y0), sp(x1, y0), sp(x1, y1 - 0.08 * R), sp((x0 + x1) / 2, y1), sp(x0, y1 - 0.08 * R)])} fill={shade(spec.top.color, 0.05)} {...EDGE_IN} />);
        out.push(<path key="pkf" d={openSmooth([sp(x0, y0 + 0.13 * R), sp(x1, y0 + 0.13 * R)])} {...INLINE} />);
      }
    }
    if (k === 'tee' && seen(ms * -0.35 * R, yS + 0.9 * R)) {
      const c = sp(ms * -0.38 * R, yS + 0.95 * R), r = 0.24 * R;
      const star = Array.from({length: 10}, (_, i) => { const a = -Math.PI / 2 + (i * Math.PI) / 5, rr = i % 2 ? r * 0.42 : r * 0.92; return [c[0] + Math.cos(a) * rr * Math.max(0.35, cam.c), c[1] + Math.sin(a) * rr] as P; });
      out.push(<path key="print" d={poly(star)} fill={CLOTH.yellow} {...EDGE_IN} />);
    }
    if (k === 'blouse') {
      for (const q of [-0.3, 0, 0.3]) if (seen(q * R, yS + 0.5 * R)) out.push(<path key={'g' + q} d={openSmooth([sp(q * R, yS + 0.42 * R), sp(q * R * 1.15, yS + 0.62 * R)])} {...INLINE} />);
    }
    return out;
  };
  const drawTorso = () => {
    const out: React.ReactNode[] = [];
    const k = spec.top.kind;
    if (k === 'onesie') {
      // the onesie torso runs into the legs (drawn with the legs)
      out.push(<Union key="torso" d={[secShape(cam, inflate(secs, topT), 'shoulder', R)]} fill={spec.top.color} />);
      const sn = (x: number, y: number) => proj(cam, surf(secs, x, y, topT));
      out.push(<path key="snap" d={openSmooth([sn(0, yS + 0.3 * R), sn(0, yC)])} {...INLINE} />);
      for (const q of [0.25, 0.55, 0.85]) { const p = sn(0.08 * R, lerp(yS + 0.4 * R, yC, q)); out.push(<circle key={'sn' + q} cx={p[0]} cy={p[1]} r={0.06 * R} fill="#ffffff" {...EDGE_IN} />); }
      return out;
    }
    const d = secShape(cam, topSecs, 'shoulder', R);
    const sp = (x: number, y: number, lift = topT) => proj(cam, surf(secs, x, y, lift));
    out.push(
      <Union key="torso" d={[d]} fill={spec.top.color}>
        {k === 'hoodie' && <path d={openSmooth([sp(-S * 0.92, topHemY - 0.22 * R), sp(0, topHemY - 0.2 * R), sp(S * 0.92, topHemY - 0.22 * R)])} {...INLINE} />}
        {k === 'blouse' && <path d={openSmooth([sp(ms * -0.25 * R, yS + 0.9 * R), sp(ms * -0.15 * R, yS + 1.3 * R)])} {...INLINE} />}
        {k === 'tee' && <path d={openSmooth([sp(ms * 0.25 * R, yS + 1.0 * R), sp(ms * 0.1 * R, yS + 1.35 * R)])} {...INLINE} />}
        {k === 'shirt' && <path d={openSmooth([sp(0, yS + 0.2 * R), sp(0, topHemY)])} {...INLINE} />}
        {k === 'shirt' && [0.55, 0.95, 1.35].map((f, i) => { const p = sp(ms * 0.1 * R, yS + f * R); return <circle key={i} cx={p[0]} cy={p[1]} r={0.045 * R} fill={INK} />; })}
        {torsoDetail()}
      </Union>,
    );
    if (k === 'hoodie') {
      // the kangaroo pocket
      const y0 = yS + 0.62 * T0, y1 = topHemY - 0.3 * R;
      const pk = [sp(-0.62 * R, y1), sp(-0.5 * R, y0 + 0.1 * R), sp(-0.25 * R, y0), sp(0.25 * R, y0), sp(0.5 * R, y0 + 0.1 * R), sp(0.62 * R, y1)];
      out.push(<path key="pocket" d={openSmooth(pk) + ` L ${pt(pk[0])}`} fill={shade(spec.top.color, 0.06)} {...EDGE_IN} />);
    }
    // belt / waistband for tucked shirts
    if (k === 'shirt' && spec.extras?.belt) {
      const bs: Sec[] = [secAt(inflate(secs, topT + 0.01 * R), topHemY - 0.12 * R), secAt(inflate(secs, topT + 0.01 * R), topHemY + 0.1 * R)];
      out.push(<Union key="belt" d={[secShape(cam, bs, 'line', R)]} fill={spec.extras.belt} shadow={0} />);
      const bk = proj(cam, surf(secs, 0, topHemY, topT + 0.02 * R));
      out.push(<rect key="buckle" x={bk[0] - 0.09 * R} y={bk[1] - 0.09 * R} width={0.18 * R} height={0.16 * R} rx={1} fill={CLOTH.grey} {...EDGE_IN} />);
    }
    return out;
  };

  // the coat / cardigan (open front)
  const overSecs = (): Sec[] => {
    const isCoat = spec.over?.kind === 'coat';
    const t = isCoat ? 0.1 * R : 0.08 * R;
    // v4 coat (the owner, 2026-11-20: "fit"): close at the waist, longer, flaring to the hem
    const hemY = isCoat ? (P0.sit ? yC + 0.25 * R : yC + 0.7 * (-yC) * 0.62) : yS + 1.0 * T0;
    const base = secs.slice(0, 4).map((q, i) => ({...q, w: q.w + (isCoat && i === 2 ? t * 0.45 : t), d: q.d + t}));
    const out: Sec[] = [...base];
    if (isCoat) { out.push({y: yC + 0.1 * R, w: b.hip * R + t * 1.5, d: 0.62 * R + t, c: 0}); out.push({y: hemY, w: b.hip * R * 1.26 + t * 1.6, d: 0.76 * R + t, c: 0}); }
    else out.push({...secAt(inflate(secs, t), hemY), w: b.hip * R + t});
    return out;
  };
  const gap = (y: number) => {
    const t = (y - yS) / T0;
    if (spec.over?.kind === 'coat') return t < 0.65 ? lerp(nw * 1.05, 0.05 * R, Math.min(1, Math.max(0, t / 0.65))) : lerp(0.05 * R, 0.16 * R, Math.min(1, (t - 0.65) / 1.2));
    return lerp(nw * 1.1, 0.1 * R, Math.min(1, Math.max(0, t / 0.8)));
  };
  const drawOver = () => {
    if (!spec.over) return null;
    const os = overSecs();
    const col = spec.over.color;
    const coatD = secShape(cam, os, 'shoulder', R);
    const yTop = os[0].y - 0.3 * R, yBot = os[os.length - 1].y + 0.5 * R;
    const ys: number[] = [];
    for (let i = 0; i <= 14; i++) ys.push(lerp(os[0].y - 0.05 * R, os[os.length - 1].y + 0.4 * R, i / 14));
    const edge = (side: 1 | -1) => ys.map((y) => proj(cam, surf(os, side * gap(y), y)));
    const nearE = edge(-1), farE = edge(1);
    const clipNear = poly([[-5000, yTop - 200], [nearE[0][0], yTop - 200], ...nearE, [nearE[nearE.length - 1][0], yBot + 200], [-5000, yBot + 200]]);
    const clipFar = poly([[farE[0][0], yTop - 200], [5000, yTop - 200], [5000, yBot + 200], [farE[farE.length - 1][0], yBot + 200], ...[...farE].reverse()]);
    const sp = (x: number, y: number, lift = 0.01 * R) => proj(cam, surf(os, x, y, lift));
    const isCoat = spec.over.kind === 'coat';
    const pocket = (x0: number, x1: number, y0: number, y1: number, key: string) => {
      const pts = [sp(x0, y0), sp(x1, y0), sp(x1, y1), sp(x0, y1)];
      const vis = depth(cam, surf(os, (x0 + x1) / 2, (y0 + y1) / 2)) > -0.05 * R && (x0 + x1) / 2 * cam.s < 0.8 * R;
      if (!vis) return null;
      const fy = y0 + (isCoat ? 0.12 : 0.1) * R;
      return (
        <g key={key}>
          <path d={poly(pts)} fill={col} {...EDGE_IN} />
          <path d={openSmooth([sp(x0, fy), sp(x1, fy)])} {...INLINE} />
        </g>
      );
    };
    /** Drape folds and the stitched hem of one panel (the v4 rework). */
    const drape = (side: 1 | -1) => {
      const out: React.ReactNode[] = [];
      const seen = (x: number, y: number) => depth(cam, surf(os, x, y)) > 0.02 * R;
      if (isCoat) {
        if (seen(side * 0.7 * R, yC + 0.5 * R)) out.push(<path key="d1" d={openSmooth([sp(side * 0.62 * R, yC + 0.4 * R), sp(side * 0.7 * R, (yC + hemY) / 2 + 0.2 * R), sp(side * 0.82 * R, hemY - 0.04 * R)])} {...INLINE} />);
        if (seen(side * 1.0 * R, yS + 0.6 * T0)) out.push(<path key="d2" d={openSmooth([sp(side * 1.08 * R, yS + 0.52 * T0), sp(side * 0.86 * R, yS + 0.64 * T0), sp(side * 0.72 * R, yS + 0.68 * T0)])} {...INLINE} />);
        if (seen(side * 0.35 * R, yS + 0.75 * R)) out.push(<path key="d3" d={openSmooth([sp(side * (gap(yS + 0.9 * R) + 0.42 * R), yS + 0.85 * R), sp(side * (gap(yS + 1.3 * R) + 0.3 * R), yS + 1.35 * R)])} {...INLINE} />);
      }
      out.push(<path key="hem" d={openSmooth([0.05, 0.4, 0.8, 1.2, 1.6].map((q) => sp(side * q * R, hemY - (isCoat ? 0.16 : 0.22) * R)))} {...INLINE} />);
      return out;
    };
    const hemY = os[os.length - 1].y;
    const panel = (clip: string, key: string, side: 1 | -1) => (
      <Clip key={key} d={clip}>
        <Union d={[coatD]} fill={col} shadeBy={0.1}>
          {isCoat && side === -1 && pocket(-1.02 * R, -0.3 * R, yC - 0.28 * R, yC + 0.4 * R, 'p1')}
          {isCoat && side === 1 && pocket(0.3 * R, 1.02 * R, yC - 0.28 * R, yC + 0.4 * R, 'p2')}
          {!isCoat && side === -1 && pocket(-0.85 * R, -0.35 * R, hemY - 0.6 * R, hemY - 0.2 * R, 'p3')}
          {!isCoat && side === 1 && pocket(0.35 * R, 0.85 * R, hemY - 0.6 * R, hemY - 0.2 * R, 'p4')}
          {drape(side)}
        </Union>
      </Clip>
    );
    return (
      <g key="over">
        {panel(clipFar, 'far', 1)}
        {panel(clipNear, 'near', -1)}
        <Clip d={coatD}>
          <path d={openSmooth(nearE)} {...OUTLINE} />
          <path d={openSmooth(farE)} {...OUTLINE} />
          {isCoat && [0.0, 0.45, 0.9].map((f, i) => { const y = lerp(yS + 1.1 * R, yC + 0.3 * R, f); if (depth(cam, surf(os, ms * (gap(y) + 0.14 * R), y)) < 0.05 * R) return null; const p = sp(ms * (gap(y) + 0.14 * R), y, 0.02 * R); return <circle key={'cb' + i} cx={p[0]} cy={p[1]} r={0.055 * R} fill="#e9ecf1" {...EDGE_IN} />; })}
          {!isCoat && [0.35, 0.65, 0.92].map((f, i) => { const y = lerp(yS + 0.6 * R, hemY - 0.15 * R, f); const p = sp(ms * (-gap(y) - 0.09 * R), y, 0.02 * R); return <circle key={i} cx={p[0]} cy={p[1]} r={0.06 * R} fill={tint(col, 0.5)} {...EDGE_IN} />; })}
        </Clip>
      </g>
    );
  };
  // the collar behind the neck (coat, cardigan, hoodie hood)
  const drawBackCollar = () => {
    const k = spec.over?.kind;
    if (!k && spec.top.kind !== 'hoodie') return null;
    const col = k ? spec.over!.color : spec.top.color;
    const hood = !k && spec.top.kind === 'hoodie';
    const hgt = hood ? 0.44 * R : k === 'coat' ? 0.36 * R : 0.2 * R;
    const wid = hood ? nw * 2.05 : nw * 1.45;
    const z = -0.2 * R;
    const p = (x: number, y: number) => proj(cam, [x, y, z]);
    const pts = [p(-wid, yS + 0.05 * R), p(-wid * 0.98, yS - hgt * 0.7), p(-wid * 0.6, yS - hgt), p(wid * 0.6, yS - hgt), p(wid * 0.98, yS - hgt * 0.7), p(wid, yS + 0.05 * R)];
    return <Union key="bcollar" d={[openSmooth(pts) + ' Z']} fill={col} shadow={0.6} />;
  };

  // ---------------------------------------------------------------- neck and neckline
  const neckLine = (): P[] => {
    const k = spec.top.kind;
    const sp = (x: number, y: number) => proj(cam, surf(secs, x, y, topT));
    if (k === 'scrub') return [sp(-nw * 1.25, yS - 0.12 * R), sp(-nw * 0.55, yS + 0.32 * R), sp(0, yS + 0.62 * R), sp(nw * 0.55, yS + 0.32 * R), sp(nw * 1.25, yS - 0.12 * R)];
    if (k === 'shirt') return [sp(-nw * 1.1, yS - 0.1 * R), sp(-nw * 0.5, yS + 0.18 * R), sp(0, yS + 0.3 * R), sp(nw * 0.5, yS + 0.18 * R), sp(nw * 1.1, yS - 0.1 * R)];
    const dpt = k === 'blouse' ? 0.3 : k === 'hoodie' ? 0.1 : 0.12;
    return [sp(-nw * 1.2, yS - 0.12 * R), sp(-nw * 0.75, yS + (dpt * 0.7) * R), sp(0, yS + dpt * R), sp(nw * 0.75, yS + dpt * 0.7 * R), sp(nw * 1.2, yS - 0.12 * R)];
  };
  const headX = 0.12 * R * cam.s; // the head sits a little forward when turned
  const nAt = NECK_AT[v];
  const neckX = headX + nAt[0] * (R / 40);
  const drawNeck = () => {
    const nl = neckLine();
    const yTop = chinY - 0.55 * R;
    const lx = neckX - nw * (0.85 + 0.15 * cam.c), rx = neckX + nw * (0.85 + 0.15 * cam.c);
    const L0 = nl[0], R0 = nl[nl.length - 1];
    const d = chainPath([
      {pts: [[rx, yTop], [lx, yTop]], smooth: false},
      {pts: [[lx, yTop], [lx - 0.02 * R, yS - 0.25 * R], L0], smooth: true},
      {pts: nl, smooth: true},
      {pts: [R0, [rx + 0.02 * R, yS - 0.25 * R], [rx, yTop]], smooth: true},
    ]);
    const k = spec.top.kind;
    // the neck sides (not the top, which is under the head) are outlined; the neckline is the garment edge
    return (
      <g key="neck">
        <path d={d} fill={skin} />
        <Clip d={d}>
          <path d={`M ${lx - 20} ${yTop} L ${rx + 20} ${yTop} L ${rx + 20} ${chinY + (0.22 - 0.3 * cam.s) * R} Q ${neckX} ${chinY + (0.42 - 0.36 * cam.s) * R} ${lx - 20} ${chinY + (0.22 - 0.3 * cam.s) * R} Z`} fill={shade(skin)} />
        </Clip>
        <path d={openSmooth([[lx, yTop], [lx - 0.02 * R, yS - 0.25 * R], L0])} {...OUTLINE} />
        <path d={openSmooth([R0, [rx + 0.02 * R, yS - 0.25 * R], [rx, yTop]])} {...OUTLINE} />
        <path d={openSmooth(nl)} {...OUTLINE} />
        {spec.top.trim && (k === 'tee' || k === 'onesie') && <path d={openSmooth(nl.map((p) => [p[0], p[1] + 0.05 * R] as P))} stroke={spec.top.trim} strokeWidth={0.11 * R} fill="none" />}
        {k === 'scrub' && <path d={openSmooth(nl.map((p) => [p[0], p[1] + 0.06 * R] as P))} stroke={shade(spec.top.color, 0.22)} strokeWidth={0.1 * R} fill="none" />}
        {k === 'tee' || k === 'onesie' || k === 'hoodie' || k === 'scrub' ? <path d={openSmooth(nl.map((p) => [p[0], p[1] + (k === 'scrub' ? 0.11 : 0.1) * R] as P))} {...INLINE} /> : null}
      </g>
    );
  };
  const drawCollarFront = () => {
    const out: React.ReactNode[] = [];
    const k = spec.top.kind;
    if (k === 'shirt' || spec.top.under) {
      // shirt collar points
      const col = k === 'shirt' ? spec.top.color : spec.top.under!;
      if (k === 'shirt') {
        const sp = (x: number, y: number) => proj(cam, surf(secs, x, y, topT + 0.03 * R));
        for (const sd of [-1, 1] as const) {
          const pts = [sp(sd * nw * 1.15, yS - 0.16 * R), sp(sd * nw * 0.15, yS + 0.32 * R), sp(sd * nw * 1.4, yS + 0.22 * R)];
          out.push(<path key={'col' + sd} d={poly(pts)} fill={col} {...EDGE} strokeWidth={OUT * 0.85} />);
        }
      }
    }
    if (spec.over) {
      const os = overSecs();
      const col = spec.over.color;
      const sp = (x: number, y: number) => proj(cam, surf(os, x, y, 0.02 * R));
      const isCoat = spec.over.kind === 'coat';
      const yL = yS + (isCoat ? 0.95 : 0.7) * R;
      for (const sd of [1, -1] as const) {
        const z = depth(cam, surf(os, sd * nw * 1.4, yS + 0.3 * R));
        if (z < -0.1 * R) continue;
        if (isCoat) {
          // v4: a real notched lapel: the collar piece on top, a notch, the wide lapel rolling down to the top button
          const yB = yS + 1.05 * R;
          const collar = [sp(sd * nw * 1.1, yS - 0.2 * R), sp(sd * (nw * 1.75 + 0.16 * R), yS + 0.02 * R), sp(sd * (nw * 1.5 + 0.26 * R), yS + 0.2 * R), sp(sd * nw * 1.2, yS + 0.1 * R)];
          const lapel = [sp(sd * (nw * 1.6 + 0.36 * R), yS + 0.24 * R), sp(sd * (nw * 1.5 + 0.62 * R), yS + 0.42 * R), sp(sd * (gap(yB) + 0.03 * R), yB), sp(sd * gap(yS + 0.55 * R), yS + 0.55 * R), sp(sd * nw * 1.22, yS + 0.18 * R)];
          out.push(<path key={'lapc' + sd} d={poly(collar)} fill={shade(col, 0.16)} {...EDGE} />);
          out.push(<path key={'lap' + sd} d={poly(lapel)} fill={shade(col, 0.11)} {...EDGE} />);
          out.push(<path key={'roll' + sd} d={openSmooth([lerpP(lapel[1], lapel[4], 0.35), lerpP(lapel[2], lapel[3], 0.4)])} {...INLINE} />);
          continue;
        }
        const pts = [sp(sd * nw * 1.15, yS - 0.15 * R), sp(sd * (nw * 1.15 + 0.16 * R), yS + 0.2 * R), sp(sd * (gap(yL) + 0.1 * R), yL), sp(sd * gap(yL), yL), sp(sd * gap(yS + 0.3 * R), yS + 0.3 * R)];
        out.push(<path key={'lap' + sd} d={poly(pts)} fill={isCoat ? shade(col, 0.05) : col} {...EDGE} />);
        if (isCoat) out.push(<path key={'lapl' + sd} d={`M ${pt(pts[1])} L ${pt(sp(sd * (nw * 1.3 + 0.05 * R), yS + 0.16 * R))}`} {...INLINE} />);
      }
    }
    if (spec.top.kind === 'hoodie') {
      // the drawstrings
      const sp = (x: number, y: number) => proj(cam, surf(secs, x, y, topT + 0.02 * R));
      for (const sd of [-1, 1] as const) {
        const a = sp(sd * nw * 0.7, yS + 0.08 * R), c = sp(sd * nw * 0.8, yS + 0.95 * R);
        if (depth(cam, surf(secs, sd * nw, yS + 0.5 * R)) < 0) continue;
        out.push(<path key={'str' + sd} d={ribbon([a, lerpP(a, c, 0.5), c], 0.04 * R)} fill="#ffffff" {...EDGE_IN} />);
        out.push(<path key={'tip' + sd} d={capsule(c, 0.055 * R, add(c, [0, 0.12 * R]), 0.05 * R)} fill={CLOTH.grey} {...EDGE_IN} />);
      }
    }
    return out;
  };
  const drawStethoscope = () => {
    if (!spec.extras?.stethoscope) return null;
    const os = spec.over ? overSecs() : secs;
    const sp = (x: number, y: number) => proj(cam, surf(os, x, y, 0.05 * R));
    const w = 0.055 * R;
    const out: React.ReactNode[] = [];
    // the tube round the neck, hanging on both sides
    const lt = [sp(ms * -nw * 1.05, yS - 0.2 * R), sp(ms * -nw * 1.3, yS + 0.3 * R), sp(ms * -nw * 1.1, yS + 0.9 * R), sp(ms * -nw * 0.7, yS + 1.25 * R)];
    const rt = [sp(ms * nw * 1.05, yS - 0.2 * R), sp(ms * nw * 1.3, yS + 0.3 * R), sp(ms * nw * 1.25, yS + 0.75 * R)];
    const c = lt[lt.length - 1];
    const visL = depth(cam, surf(os, ms * -nw * 1.2, yS + 0.5 * R)) > (mir ? -0.05 : -0.1) * R;
    const visR = depth(cam, surf(os, ms * nw * 1.2, yS + 0.5 * R)) > (mir ? -0.1 : -0.05) * R;
    if (visR) {
      const e = rt[rt.length - 1];
      out.push(<path key="tr" d={ribbon(rt, w)} fill={CLOTH.charcoal} {...EDGE_IN} />);
      out.push(<path key="ear" d={`M ${pt(e)} l ${-0.1 * R} ${0.22 * R} M ${pt(e)} l ${0.1 * R} ${0.2 * R}`} stroke={INK} strokeWidth={IN} vectorEffect="non-scaling-stroke" fill="none" />);
      out.push(<path key="ear2" d={capsule(e, 0.07 * R, e, 0.07 * R)} fill={CLOTH.grey} {...EDGE_IN} />);
    }
    if (visL) {
      out.push(<path key="tl" d={ribbon(lt, w)} fill={CLOTH.charcoal} {...EDGE_IN} />);
      out.push(<circle key="bell" cx={c[0]} cy={c[1] + 0.12 * R} r={0.15 * R} fill={CLOTH.grey} {...EDGE_IN} />);
      out.push(<circle key="bell2" cx={c[0]} cy={c[1] + 0.12 * R} r={0.07 * R} fill={tint(CLOTH.grey, 0.5)} {...EDGE_IN} />);
    }
    return <g key="steth">{out}</g>;
  };
  const drawChestPocket = () => {
    if (spec.over?.kind !== 'coat') return null;
    const os = overSecs();
    const sp = (x: number, y: number) => proj(cam, surf(os, x, y, 0.02 * R));
    const x0 = ms * 0.38 * R, x1 = ms * 0.92 * R, y0 = yS + 0.92 * R, y1 = yS + 1.4 * R;
    if (depth(cam, surf(os, x0, y0)) < 0.05 * R) return null;
    const pen = (x: number, colr: string) => { const a = sp(x, y0 + 0.02 * R), b2 = sp(x, y0 - 0.22 * R); return <path key={colr} d={capsule(a, 0.045 * R, b2, 0.045 * R)} fill={colr} {...EDGE_IN} />; };
    return (
      <g key="cpocket">
        {pen(x0 + ms * 0.12 * R, CLOTH.red)}
        {pen(x0 + ms * 0.22 * R, CLOTH.blue)}
        <path d={poly([sp(x0, y0), sp(x1, y0), sp(x1, y1), sp(x0, y1)])} fill={spec.over.color} {...EDGE_IN} />
        <path d={poly([sp(x0, y0), sp(x1, y0), sp(x1, y0 + 0.12 * R), sp(x0, y0 + 0.12 * R)])} fill={shade(spec.over.color, 0.06)} {...EDGE_IN} />
      </g>
    );
  };

  // ---------------------------------------------------------------- the head
  const ex = EXPR[expr];
  const drawHead = () => {
    const sc = R / 40;
    const hair = (mir && v === 'q' && HAIR_QM[spec.hair.style]) || HAIR[spec.hair.style][v];
    const hc = spec.hair.color;
    const fc = FACE[v];
    const eyeR = 10.2;
    const gapE = eyeR * 0.5;
    const lk: [number, number] = look ?? (v === 'f' ? [0, 0.05] : [0.45, 0.05]);
    const jaw = b.jaw ?? 1;
    const nk = b.nose ?? 1;
    const headPts = v === 's' ? HEAD.s.map((p, i) => (i >= 6 && i <= 10 ? SIDE_NOSE(nk)[i - 6] : p)) : HEAD[v];
    const outline = closedSmooth(headPts.map(([x, y]) => [x * (y > 0 && !(v === 's' && x > 41 && y < 21) ? lerp(1, jaw, Math.min(1, y / 40)) : 1), y] as P));
    const tilt = P0.tilt ?? b.tilt ?? 0;
    const g = (k: string, n: React.ReactNode) => <g key={k}>{n}</g>;
    const parts: React.ReactNode[] = [];
    // ears behind the head in front view
    const earF = (sd: 1 | -1) => (
      <g key={'ear' + sd} transform={sd === -1 ? 'scale(-1 1)' : undefined}>
        <path d="M 37 -1 C 46 -6 50.5 12 44 19 C 41 22 37 20 36 17 Z" fill={skin} {...EDGE} />
        <path d="M 40.5 4 Q 45 8 41.5 14" {...INLINE} />
        {spec.extras?.earrings && <circle cx={40} cy={22.5} r={2.6} fill={CLOTH.yellow} {...EDGE_IN} />}
      </g>
    );
    const earSide = (at: P) => (
      <g key="earS" transform={`translate(${at[0]} ${at[1]})`}>
        <path d="M 4 -10 C -8 -14 -12 8 -4 12 C 0 14 4 12 5 8 Z" fill={skin} {...EDGE} />
        <path d="M 0 -4 Q -5 0 -1 5" {...INLINE} />
        {spec.extras?.earrings && <circle cx={-1} cy={15} r={2.6} fill={CLOTH.yellow} {...EDGE_IN} />}
      </g>
    );
    if (hair.back && headOnly) hair.back.forEach((p, i) => parts.push(<Union key={'hb' + i} d={[closedSmooth(p)]} fill={hc} />));
    if (hair.bun && (v !== 'f')) parts.push(<Union key="bun" d={[capsule(hair.bun, hair.bunR!, hair.bun, hair.bunR!)]} fill={hc}><path d={`M ${hair.bun[0] - 8} ${hair.bun[1] - 2} Q ${hair.bun[0]} ${hair.bun[1] - 10} ${hair.bun[0] + 8} ${hair.bun[1] - 4}`} {...INLINE} /></Union>);
    if (hair.bun && v === 'f') parts.push(<Union key="bun" d={[capsule(hair.bun, hair.bunR!, hair.bun, hair.bunR!)]} fill={hc}><path d={`M ${hair.bun[0] - 8} ${hair.bun[1] - 2} Q ${hair.bun[0]} ${hair.bun[1] - 10} ${hair.bun[0] + 8} ${hair.bun[1] - 4}`} {...INLINE} /></Union>);
    if (v === 'f') { parts.push(earF(-1)); parts.push(earF(1)); }
    // the head itself
    parts.push(
      <Union key="head" d={[outline]} fill={skin} shadow={0.8}>
        {spec.extras?.stubble && <path d={v === 'f' ? 'M -38 16 Q -34 38 -14 46 Q 0 50 14 46 Q 34 38 38 16 Q 32 32 18 34 Q 14 25 0 24 Q -14 25 -18 34 Q -32 32 -38 16 Z' : v === 'q' ? 'M -22 31 Q -6 42 10 48 Q 30 44 40 25 Q 36 31 29 29.5 Q 19 26.5 6 27.5 Q -8 29 -22 31 Z' : 'M -4 34 Q 10 44 30 46 Q 40 38 44 22 Q 38 26 32 24 Q 22 22 10 28 Q 2 32 -4 34 Z'} fill={shade(skin, 0.08)} />}
      </Union>,
    );
    // the front hair
    if (hair.front) hair.front.forEach((p, i) => parts.push(<Union key={'hf' + i} d={[closedSmooth(p)]} fill={hc}>{i === 0 && hair.lines?.map((l, j) => <path key={j} d={l} {...INLINE} />)}</Union>));
    if (!hair.front && hair.lines) parts.push(g('hl', hair.lines.map((l, j) => <path key={j} d={l} {...INLINE} />)));
    // the cap
    if (spec.extras?.cap) parts.push(<CapHat key="cap" v={v} col={spec.extras.cap} />);
    if (fc.ear) parts.push(earSide(fc.ear));
    const face: React.ReactNode[] = [];
    // blinking: lids over the eyes (not on eyes that are already shut arcs)
    const lidsOn = !!blink && blink > 0 && ex.mood !== 'happy' && ex.mood !== 'closed' && ex.mood !== 'wink';
    const lidCover = (eyeW * 0.5 + 0.8) / (px * sc); // covers the eye ring, in head units
    // the face
    const [ex0, ey0] = fc.eye;
    if (v === 's') {
      const cx = ex0 - eyeR - gapE / 2; // Eyes centre so its RIGHT eye lands on ex0
      face.push(
        <Clip key="eyes" d={`M ${ex0 - eyeR - 1.6} -60 L 80 -60 L 80 60 L ${ex0 - eyeR - 1.6} 60 Z`}>
          <Eyes x={cx} y={ey0} r={eyeR} gap={gapE} look={lk} mood={ex.mood} brows />
          {lidsOn && <Lids xs={[cx - eyeR - gapE / 2, cx + eyeR + gapE / 2]} y={ey0} r={eyeR} cover={lidCover} skin={skin} k={blink!} />}
        </Clip>,
      );
    } else {
      face.push(<Eyes key="eyes" x={ex0} y={ey0} r={eyeR} gap={gapE} look={lk} mood={ex.mood} brows />);
      if (lidsOn) face.push(<Lids key="lids" xs={[ex0 - eyeR - gapE / 2, ex0 + eyeR + gapE / 2]} y={ey0} r={eyeR} cover={lidCover} skin={skin} k={blink!} />);
    }
    // nose
    // the nose: one family in every view, scaled with the person (b.nose)
    if (v === 'f') face.push(<path key="nose" transform={`translate(0 17) scale(${nk}) translate(0 -17)`} d="M -1.6 12.8 Q 5.6 16.2 2 20.8 Q -0.2 22.4 -3.2 21" {...INLINE} />);
    if (v === 'q') face.push(
      <g key="nose" transform={`translate(21.5 18.6) scale(${f1(nk * 1.2)}) translate(-31 -19)`}>
        <path d="M 27.6 14.2 C 32.6 14.2 38 17.2 37.8 20.6 C 37.6 23.8 33 24.8 29.2 23.5 C 27.2 21 26.8 17 27.6 14.2 Z" fill={skin} />
        <path d="M 32.4 15.2 C 35.8 16.4 38 18.6 37.8 20.6 C 37.6 23.8 33 24.8 29.2 23.5" {...INLINE} />
        <path d="M 31.2 21.3 Q 32.9 20.5 34.2 21.9" {...INLINE} />
      </g>,
    );
    if (v === 's') face.push(<path key="nose" d={`M ${f1(41 + 6.4 * nk)} 17.6 Q ${f1(41 + 3.8 * nk)} 17.2 ${f1(41 + 4 * nk)} 19.6`} {...INLINE} />);
    // moustache
    if (spec.extras?.moustache) {
      const mx = fc.mouth[0], my = fc.mouth[1] - 5;
      const w = v === 's' ? 7 : v === 'q' ? 11 : 13;
      const dM = v === 's' ? `M ${mx - 8} ${my - 2} Q ${mx} ${my - 6} ${mx + 7} ${my - 3} Q ${mx + 6} ${my + 4} ${mx - 1} ${my + 3} Q ${mx - 6} ${my + 4} ${mx - 8} ${my - 2} Z`
        : `M ${mx - w} ${my + 2} Q ${mx - w * 0.5} ${my - 5} ${mx} ${my - 2.5} Q ${mx + w * 0.5} ${my - 5} ${mx + w} ${my + 2} Q ${mx + w * 0.5} ${my + 4.5} ${mx} ${my + 1.5} Q ${mx - w * 0.5} ${my + 4.5} ${mx - w} ${my + 2} Z`;
      face.push(talk === undefined ? <Mouth key="mouth" x={fc.mouth[0]} y={fc.mouth[1] + 2.5} w={11 * fc.mw * (ex.mw ?? 1)} kind={ex.mouth} /> : <TalkMouth key="mouth" x={fc.mouth[0]} y={fc.mouth[1] + 2.5} w={11 * fc.mw * (ex.mw ?? 1)} kind={ex.mouth} open={talk} />);
      face.push(<path key="mst" d={dM} fill={spec.hair.color} {...EDGE_IN} />);
    } else face.push(talk === undefined ? <Mouth key="mouth" x={fc.mouth[0]} y={fc.mouth[1]} w={11 * fc.mw * (ex.mw ?? 1)} kind={ex.mouth} /> : <TalkMouth key="mouth" x={fc.mouth[0]} y={fc.mouth[1]} w={11 * fc.mw * (ex.mw ?? 1)} kind={ex.mouth} open={talk} />);
    // glasses
    if (spec.extras?.glasses) face.push(<Glasses key="gl" v={v} eye={fc.eye} r={eyeR} gap={gapE} kind={spec.extras.glasses} />);
    parts.push(<g key="face" className={fcls}>{face}</g>);
    const neckPt: P = [neckX, chinY - 0.1 * R];
    return (
      <g key="head" transform={`rotate(${tilt} ${f1(neckPt[0])} ${f1(neckPt[1])})`}>
        <g transform={`translate(${f1(headX)} ${f1(headCY)}) scale(${f1(sc)})`}>{parts}</g>
      </g>
    );
  };

  if (headOnly) return <g className={pcls} transform={mir ? 'scale(-1 1)' : undefined}>{lineCss && <style>{lineCss}</style>}{drawHead()}</g>;

  // ---------------------------------------------------------------- assemble, back to front
  const out: React.ReactNode[] = [];
  if (P0.sit) out.push(<Chair key="chair" cam={cam} R={R} seatY={yC + 0.12 * R} hip={b.hip * R} depthF={thighL * 0.85} backTop={yS + 0.35 * T0} />);
  const farSide: 1 | -1 = 1; // her left is the far side when she turns to the right
  const farBehind = cam.s > 0.3 && !(farSide === 1 ? P0.L : P0.R).front;
  if (farBehind) out.push(drawArm(farSide));
  out.push(<g key="legs">{drawLegs()}</g>);
  out.push(drawSkirt());
  out.push(<g key="torso">{drawTorso()}</g>);
  out.push(drawBackCollar());
  out.push(drawOver());
  out.push(drawNeck());
  out.push(<g key="collar">{drawCollarFront()}</g>);
  out.push(drawChestPocket());
  out.push(drawStethoscope());
  // arms that hang at the sides come before the head; arms that reach to the face come after
  const sides: (1 | -1)[] = cam.s > 0.3 ? [-1] : [1, -1];
  if (!farBehind && cam.s > 0.3) sides.unshift(1);
  const before = sides.filter((sd) => !(sd === -1 ? P0.R : P0.L).front);
  const after = sides.filter((sd) => (sd === -1 ? P0.R : P0.L).front);
  before.forEach((sd) => out.push(drawArm(sd)));
  // back hair must sit behind the body: draw it first
  const head = drawHead();
  after.forEach((sd) => out.push(drawArm(sd)));
  return (
    <g className={pcls} transform={mir ? 'scale(-1 1)' : undefined}>
      {lineCss && <style>{lineCss}</style>}
      <BackHairOnly spec={spec} v={v} headX={headX} headCY={headCY} R={R} tilt={P0.tilt ?? b.tilt ?? 0} neckPt={[neckX, chinY - 0.1 * R]} />
      {out.slice(0, out.length - after.length)}
      {head}
      {out.slice(out.length - after.length)}
    </g>
  );
};

// ================================================================== animation pieces
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const circlePath = (cx: number, cy: number, r: number) => `M ${f1(cx + r)} ${f1(cy)} A ${f1(r)} ${f1(r)} 0 1 0 ${f1(cx - r)} ${f1(cy)} A ${f1(r)} ${f1(r)} 0 1 0 ${f1(cx + r)} ${f1(cy)} Z`;

/**
 * A talking mouth: the expression's own mouth at open = 0, opening smoothly as `open` rises (the shape
 * changes continuously, so it can be sampled every frame). Dark inside and a tongue that grow with it.
 */
const TalkMouth: React.FC<{x: number; y: number; w: number; kind: MouthKind; open: number}> = ({x, y, w, kind, open}) => {
  const t0 = clamp01(open);
  const h = (w / 2) * (1 + 0.12 * t0); // a little wider as it opens
  if (kind === 'o') {
    const rx = h * 0.5 * (1 + 0.15 * t0), ry = h * 0.62 + t0 * h * 0.8, cy = y + t0 * h * 0.45;
    const d = `M ${f1(x - rx)} ${f1(cy)} A ${f1(rx)} ${f1(ry)} 0 1 0 ${f1(x + rx)} ${f1(cy)} A ${f1(rx)} ${f1(ry)} 0 1 0 ${f1(x - rx)} ${f1(cy)} Z`;
    return (
      <g>
        <path d={d} fill={FLESH.deep} />
        {t0 > 0 && <Clip d={d}><ellipse cx={x} cy={cy + ry * 0.75} rx={rx * 0.75} ry={ry * 0.45 * t0} fill={FLESH.salmon} /></Clip>}
        <path d={d} {...OUTLINE} />
      </g>
    );
  }
  let yc = y, bow = 0, H0 = 0, wave = 0, pw = 1;
  if (kind === 'smile') { yc = y - 0.2 * h; bow = 0.475 * h; }
  else if (kind === 'frown') { yc = y + 0.35 * h; bow = -0.525 * h; }
  else if (kind === 'wavy') { wave = 0.25 * h; }
  else if (kind === 'open') { yc = y - 0.3 * h; H0 = 0.9 * h; }
  else if (kind === 'big') { yc = y - 0.5 * h; H0 = 1.75 * h; pw = 0.7; }
  else if (kind === 'grit' || kind === 'tongue') { yc = y - 0.1 * h; bow = 0.2 * h; }
  const H = H0 + (Math.max(2.0 * h, H0 * 1.35) - H0) * t0;
  const bowU = bow * (1 - 0.45 * t0); // a smile or frown flattens a little as the mouth opens
  const wav = wave * Math.max(0, 1 - t0 * 2.5); // the worried wave smooths out as it opens
  const N = 16;
  const up: P[] = [], lo: P[] = [];
  for (let i = 0; i <= N; i++) {
    const tt = -1 + (2 * i) / N;
    const yu = yc + bowU * (1 - tt * tt) - wav * Math.sin(Math.PI * 2 * (tt + 1));
    up.push([x + h * tt, yu]);
    lo.push([x + h * tt, yu + H * Math.pow(Math.max(0, 1 - tt * tt), pw)]);
  }
  const d = 'M ' + [...up, ...lo.reverse()].map(pt).join(' L ') + ' Z';
  const midLow = yc + bowU + H;
  return (
    <g>
      {H > 0.01 && <path d={d} fill={FLESH.deep} />}
      {H > 0.01 && <Clip d={d}><ellipse cx={x} cy={midLow - H * 0.05} rx={h * 0.6} ry={H * 0.42} fill={FLESH.salmon} /></Clip>}
      <path d={d} {...OUTLINE} />
    </g>
  );
};

/** Eyelids for a blink: a skin lid comes down over each eye with the INK lash line on its edge (k: 0 open .. 1 shut). */
const Lids: React.FC<{xs: number[]; y: number; r: number; cover: number; skin: string; k: number}> = ({xs, y, r, cover, skin, k}) => {
  const b = clamp01(k);
  if (b <= 0) return null;
  const ye = lerp(y - r * 1.15, y - 0.1 * r, b);
  const ym = lerp(y - r * 1.15, y + 0.6 * r, b);
  const ctrl = 2 * ym - ye; // the quadratic passes through ym in the middle
  const s2 = (() => { const q = clamp01((b - 0.6) / 0.4); return q * q * (3 - 2 * q); })();
  const w = 1.4 * r;
  return (
    <g>
      {xs.map((c, i) => {
        const upD = `M ${f1(c - w)} ${f1(y - 1.7 * r)} L ${f1(c + w)} ${f1(y - 1.7 * r)} L ${f1(c + w)} ${f1(ye)} Q ${f1(c)} ${f1(ctrl)} ${f1(c - w)} ${f1(ye)} Z`;
        const yb = lerp(y + 1.7 * r, ye, s2), cb = lerp(y + 1.7 * r, ctrl, s2);
        const loD = `M ${f1(c - w)} ${f1(y + 1.7 * r)} L ${f1(c + w)} ${f1(y + 1.7 * r)} L ${f1(c + w)} ${f1(yb)} Q ${f1(c)} ${f1(cb)} ${f1(c - w)} ${f1(yb)} Z`;
        const lash = `M ${f1(c - w)} ${f1(ye)} Q ${f1(c)} ${f1(ctrl)} ${f1(c + w)} ${f1(ye)}`;
        return (
          <g key={i}>
            <Clip d={circlePath(c, y, r + cover)}>
              <path d={upD} fill={skin} />
              {s2 > 0 && <path d={loD} fill={skin} />}
            </Clip>
            <Clip d={circlePath(c, y, r + cover * 0.3)}><path d={lash} {...OUTLINE} /></Clip>
          </g>
        );
      })}
    </g>
  );
};

/**
 * Hair seen in three-quarter by a person facing LEFT (drawn as her mirror twin facing right, then flipped):
 * the parting moves to the twin's far side, so after the flip it is on the character's own side again.
 */
const HAIR_QM: Partial<Record<HairStyle, HairDraw>> = {
  long: {
    back: HAIR.long.q.back,
    front: [[[-30, 30], [-44, 12], [-47, -14], [-40, -36], [-22, -49], [2, -52], [24, -47], [39, -34], [44, -16], [42, -6], [40, -16], [34, -26], [28, -30], [20, -24], [8, -22], [-2, -20], [-10, -14], [-14, -2], [-16, 10], [-20, 22]]],
    lines: ['M 28 -30 Q 24 -42 16 -50', 'M 12 -42 Q -4 -44 -20 -38', 'M -36 -20 Q -30 0 -34 14'],
  },
  neat: {
    front: [[[-27, 26], [-40, 14], [-45, -10], [-40, -34], [-24, -50], [0, -55], [22, -51], [38, -38], [44, -20], [42, -8], [38, -18], [32, -30], [24, -26], [12, -24], [0, -24], [-8, -20], [-12, -14], [-14, 0], [-17, 14], [-21, 22]]],
    lines: ['M 32 -30 Q 28 -42 20 -52', 'M 18 -38 Q 4 -42 -12 -42', 'M -30 -40 Q -38 -24 -38 -8'],
  },
  curlyBob: {
    back: HAIR.curlyBob.q.back,
    backLines: HAIR.curlyBob.q.backLines,
    front: [[[-34, 30], [-46, 14], [-50, -10], [-43, -35], [-25, -52], [2, -57], [26, -52], [42, -39], [47, -21], [45, -5], ...lobes([45, -5], [32, -27], 1, 6, [0.3, 1]).slice(1), ...lobes([31, -28], [-6, -24], 3, 8.5, [0, 1]), [-12, -16], [-15, -4], [-17, 8], [-21, 20], [-27, 28]]],
    lines: ['M 31 -28 Q 28 -42 20 -52', 'M -30 -36 q -6 -6 0 -10 q 5 -2 6 3', 'M -42 2 q -6 5 -2 10 q 4 2 6 -2', 'M 8 -44 q 6 -6 11 -1 q 2 5 -3 6'],
  },
};

// ================================================================== hand and face positions for scenes
export type HandPoint = {wrist: [number, number]; palm: [number, number]; dir: [number, number]};
type PlaceOpts = {pose?: PoseIn; view?: View; facing?: Facing; x: number; y: number; scale: number; bob?: number};
/**
 * Where both hands are, in frame pixels, for a person placed like <PersonAt x y scale ...>: the wrist, the
 * palm centre and the forearm direction (a unit vector). R / L are the character's OWN right and left arm.
 */
export const handAt = (spec: PersonSpec, o: PlaceOpts): {R: HandPoint; L: HandPoint} => {
  const view = o.view ?? 'front';
  const mir = (o.facing ?? 'right') === 'left' && view !== 'front';
  const Lo = layoutOf(spec, view, o.pose ?? 'rest', mir, o.bob);
  const X = (p: P): [number, number] => [o.x + o.scale * (mir ? -p[0] : p[0]), o.y + o.scale * p[1]];
  const one = (side: 1 | -1): HandPoint => {
    const g = Lo.armGeom(side);
    const f = Lo.handFrame(side, g);
    const a = ((f.ang + f.bend) * Math.PI) / 180;
    const palm = add(g.w, [Math.cos(a) * 11 * Lo.handK, Math.sin(a) * 11 * Lo.handK]);
    const d = nrm(sub(g.w, g.e));
    return {wrist: X(g.w), palm: X(palm), dir: [mir ? -d[0] : d[0], d[1]]};
  };
  // the mirror twin's left arm is the character's own right arm
  return mir ? {R: one(1), L: one(-1)} : {R: one(-1), L: one(1)};
};
/** The face of a person placed like <PersonAt>: its centre and a radius, in frame pixels (for the camera). */
export const headAt = (spec: PersonSpec, o: PlaceOpts): {x: number; y: number; r: number} => {
  const view = o.view ?? 'front';
  const mir = (o.facing ?? 'right') === 'left' && view !== 'front';
  const Lo = layoutOf(spec, view, o.pose ?? 'rest', mir, o.bob);
  const sc = Lo.R / 40;
  const tilt = ((Lo.P0.tilt ?? spec.build.tilt ?? 0) * Math.PI) / 180;
  const c: P = [Lo.headX + FACE[Lo.v].eye[0] * sc, Lo.headCY + 12 * sc];
  const n: P = [Lo.neckX, Lo.chinY - 0.1 * Lo.R];
  const dx = c[0] - n[0], dy = c[1] - n[1];
  const fx = n[0] + dx * Math.cos(tilt) - dy * Math.sin(tilt), fy = n[1] + dx * Math.sin(tilt) + dy * Math.cos(tilt);
  return {x: o.x + o.scale * (mir ? -fx : fx), y: o.y + o.scale * fy, r: 1.3 * Lo.R * o.scale};
};

/** The back hair, drawn behind the whole body (long hair hangs behind the shoulders). */
const BackHairOnly: React.FC<{spec: PersonSpec; v: VK; headX: number; headCY: number; R: number; tilt: number; neckPt: P}> = ({spec, v, headX, headCY, R, tilt, neckPt}) => {
  const hair = HAIR[spec.hair.style][v];
  if (!hair.back) return null;
  return (
    <g transform={`rotate(${tilt} ${f1(neckPt[0])} ${f1(neckPt[1])})`}>
      <g transform={`translate(${f1(headX)} ${f1(headCY)}) scale(${f1(R / 40)})`}>
        {hair.back.map((p, i) => <Union key={i} d={[closedSmooth(p)]} fill={spec.hair.color}>{i === 0 && hair.backLines?.map((l, j) => <path key={j} d={l} {...INLINE} />)}</Union>)}
      </g>
    </g>
  );
};

/** Glasses that sit AROUND the eyes (thin rims, never covering the eye). */
const Glasses: React.FC<{v: VK; eye: P; r: number; gap: number; kind: 'round' | 'square'}> = ({v, eye, r, gap, kind}) => {
  const rr = r * 1.2;
  const cx = [eye[0] - r - gap / 2, eye[0] + r + gap / 2];
  const rim = (x: number, key: string) => kind === 'round'
    ? <circle key={key} cx={x} cy={eye[1]} r={rr} fill="none" stroke={INK} strokeWidth={IN} vectorEffect="non-scaling-stroke" />
    : <rect key={key} x={x - rr} y={eye[1] - rr * 0.86} width={rr * 2} height={rr * 1.72} rx={rr * 0.42} fill="none" stroke={INK} strokeWidth={IN} vectorEffect="non-scaling-stroke" />;
  if (v === 's') {
    const x = eye[0];
    return (
      <g>
        <path d={`M ${x - rr * 0.35} ${eye[1] - rr * 0.9} Q ${x - rr * 0.55} ${eye[1]} ${x - rr * 0.35} ${eye[1] + rr * 0.9}`} {...INLINE} />
        <path d={`M ${x - rr * 0.5} ${eye[1] - 2} L -6 ${eye[1] - 1}`} {...INLINE} />
      </g>
    );
  }
  return (
    <g>
      {rim(cx[0], 'a')}
      {rim(cx[1], 'b')}
      <path d={`M ${cx[0] + rr * 0.92} ${eye[1] - rr * 0.32} Q ${eye[0]} ${eye[1] - rr * 0.62} ${cx[1] - rr * 0.92} ${eye[1] - rr * 0.32}`} {...INLINE} />
      {v === 'f' && <path d={`M ${cx[0] - rr} ${eye[1] - 2} L -39 ${eye[1] - 3} M ${cx[1] + rr} ${eye[1] - 2} L 39 ${eye[1] - 3}`} {...INLINE} />}
      {v === 'q' && <path d={`M ${cx[0] - rr} ${eye[1] - 2} L -20 ${eye[1] - 1}`} {...INLINE} />}
    </g>
  );
};

/** The kid's cap: a crown and a brim. */
const CapHat: React.FC<{v: VK; col: string}> = ({v, col}) => {
  if (v === 'f') return (
    <g>
      <Union d={[closedSmooth([[-43, -10], [-44, -30], [-32, -48], [0, -55], [32, -48], [44, -30], [43, -10], [0, -14]])]} fill={col}>
        <path d="M 0 -54 L 0 -16" {...INLINE} /><path d="M -24 -46 Q -30 -30 -30 -14" {...INLINE} /><path d="M 24 -46 Q 30 -30 30 -14" {...INLINE} />
      </Union>
      <Union d={[closedSmooth([[-40, -14], [0, -19], [40, -14], [38, -5], [0, -8], [-38, -5]])]} fill={shade(col, 0.05)} shadow={0} />
      <circle cx={0} cy={-55} r={3.2} fill={col} {...EDGE_IN} />
    </g>
  );
  if (v === 'q') return (
    <g>
      <Union d={[closedSmooth([[-44, -6], [-46, -28], [-30, -48], [0, -55], [26, -50], [40, -34], [42, -16], [10, -12]])]} fill={col}>
        <path d="M 4 -55 Q 10 -34 8 -14" {...INLINE} /><path d="M -22 -50 Q -32 -30 -30 -10" {...INLINE} />
      </Union>
      <Union d={[closedSmooth([[2, -16], [40, -20], [62, -14], [58, -8], [36, -8], [4, -10]])]} fill={shade(col, 0.05)} shadow={0} />
      <circle cx={2} cy={-55} r={3.2} fill={col} {...EDGE_IN} />
    </g>
  );
  return (
    <g>
      <Union d={[closedSmooth([[-46, -6], [-48, -28], [-32, -48], [-4, -55], [22, -50], [38, -36], [40, -18], [0, -14]])]} fill={col}>
        <path d="M -8 -55 Q 6 -36 4 -16" {...INLINE} />
      </Union>
      <Union d={[closedSmooth([[24, -18], [46, -20], [70, -16], [68, -10], [44, -10], [24, -12]])]} fill={shade(col, 0.05)} shadow={0} />
      <circle cx={-6} cy={-55} r={3.2} fill={col} {...EDGE_IN} />
    </g>
  );
};

/** A clipboard held at a hand. */
const Clipboard: React.FC<{at: P; R: number; ang: number}> = ({at, R, ang}) => {
  const w = 0.95 * R, h = 1.3 * R;
  return (
    <g transform={`translate(${f1(at[0] + 0.28 * R)} ${f1(at[1] - 0.25 * R)}) rotate(${ang})`}>
      <Union d={[poly([[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]])]} fill={CLOTH.brown} shadow={0.6} />
      <path d={poly([[-w / 2 + 0.08 * R, -h / 2 + 0.16 * R], [w / 2 - 0.08 * R, -h / 2 + 0.16 * R], [w / 2 - 0.08 * R, h / 2 - 0.08 * R], [-w / 2 + 0.08 * R, h / 2 - 0.08 * R]])} fill="#ffffff" {...EDGE_IN} />
      {[0.32, 0.5, 0.68, 0.86].map((t, i) => <path key={i} d={`M ${-w / 2 + 0.2 * R} ${-h / 2 + t * h} L ${w / 2 - (i === 3 ? 0.4 : 0.2) * R} ${-h / 2 + t * h}`} {...INLINE} />)}
      <path d={poly([[-0.2 * R, -h / 2 - 0.08 * R], [0.2 * R, -h / 2 - 0.08 * R], [0.2 * R, -h / 2 + 0.12 * R], [-0.2 * R, -h / 2 + 0.12 * R]])} fill={CLOTH.grey} {...EDGE_IN} />
    </g>
  );
};

/** A plain chair for sitting poses, built in the same turned frame. */
const Chair: React.FC<{cam: Cam; R: number; seatY: number; hip: number; depthF: number; backTop: number}> = ({cam, R, seatY, hip, depthF, backTop}) => {
  const w = hip * 1.25, z0 = -0.55 * R, z1 = depthF;
  const p = (x: number, y: number, z: number) => proj(cam, [x, y, z]);
  const col = CLOTH.charcoal;
  const th = 0.14 * R;
  const leg = (x: number, z: number, k: string) => { const a = p(x, seatY + th, z), b = p(x, 0, z); return <path key={k} d={capsule(a, 0.07 * R, b, 0.06 * R, 'flat', 'flat')} fill={shade(col)} {...EDGE_IN} />; };
  return (
    <g>
      {leg(w * 0.85, z0 + 0.1 * R, 'l1')}
      {leg(-w * 0.85, z0 + 0.1 * R, 'l2')}
      <path d={poly([p(-w, backTop, z0), p(w, backTop, z0), p(w, seatY, z0), p(-w, seatY, z0)])} fill={col} {...EDGE} />
      <path d={poly([p(-w, seatY, z0), p(w, seatY, z0), p(w, seatY, z1), p(-w, seatY, z1)])} fill={tint(col, 0.15)} {...EDGE} />
      <path d={poly([p(-w, seatY, z1), p(w, seatY, z1), p(w, seatY + th, z1), p(-w, seatY + th, z1)])} fill={shade(col)} {...EDGE} />
      {leg(w * 0.85, z1 - 0.1 * R, 'l3')}
      {leg(-w * 0.85, z1 - 0.1 * R, 'l4')}
    </g>
  );
};

// ================================================================== placing a person on a board
/** A person standing on a board: x = the middle, y = the ground line (px), scale = px per unit. */
export const PersonAt: React.FC<PersonProps & {x: number; y: number; scale: number; flip?: boolean}> = ({x, y, scale, flip, ...p}) => (
  <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
    <g transform={`scale(${scale * (flip ? -1 : 1)} ${scale})`}>
      <Person {...p} px={scale} />
    </g>
  </svg>
);
/** Just the head, centred on (x, y), for expression rows. size = px of the head radius. */
export const HeadAt: React.FC<{spec: PersonSpec; x: number; y: number; px: number; expr?: Expr; view?: View; look?: [number, number]; talk?: number; blink?: number; facing?: Facing}> = ({spec, x, y, px, expr, view = 'front', look, talk, blink, facing}) => {
  const k = px / spec.build.R;
  const Ht = spec.build.heads * 2.15 * spec.build.R;
  return (
    <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
      <defs><clipPath id={`hc-${spec.id}-${expr}-${view}`}><rect x={-3 * px} y={-3 * px} width={6 * px} height={3 * px + 1.72 * px} rx={0} /></clipPath></defs>
      <g clipPath={`url(#hc-${spec.id}-${expr}-${view})`}>
        <g transform={`scale(${k}) translate(0 ${Ht - spec.build.R - 0.15 * spec.build.R})`}>
          <Person spec={spec} expr={expr} view={view} look={look} px={k} talk={talk} blink={blink} facing={facing} />
        </g>
      </g>
    </svg>
  );
};
/** A hand drawn large on a board (for the hands sheet). */
export const HandAt: React.FC<{x: number; y: number; px: number; kind: HandKind; skin: string; rot?: number; mirror?: boolean}> = ({x, y, px, kind, skin, rot = 0, mirror}) => (
  <svg style={{position: 'absolute', left: x, top: y, overflow: 'visible'}} width={1} height={1}>
    <g transform={`rotate(${rot}) scale(${px / 30} ${(px / 30) * (mirror ? -1 : 1)}) translate(-14 0)`}>
      {kind === 'hold' && <path d={capsule([13.2, -14.6], 3.6, [13.2, 13.4], 3.6, 'flat', 'flat')} fill={CLOTH.grey} {...EDGE_IN} />}
      <Hand kind={kind} skin={skin} wristR={4.6} />
    </g>
  </svg>
);

// ================================================================== the cast
export const CAST: PersonSpec[] = [
  {
    id: 'doctor', name: 'Dr. Mira', role: 'the doctor: calm, kind, explains',
    skin: SKIN.light, hair: {style: 'curlyBob', color: '#4a2f24'},
    top: {kind: 'scrub', color: CLOTH.teal, sleeve: 'short'}, over: {kind: 'coat', color: '#ffffff'},
    bottom: {kind: 'trousers', color: shade(CLOTH.teal, 0.08)}, shoes: {kind: 'trainer', color: '#ffffff'},
    extras: {glasses: 'round', stethoscope: true},
    build: {heads: 4.35, R: 40, shoulder: 1.0, chest: 0.6, waist: 0.76, hip: 0.92, belly: 0, limb: 1, neck: 0.27, neckLen: 0.34, legFrac: 0.44, jaw: 0.96, tilt: -3},
  },
  {
    id: 'patient', name: 'Sam', role: 'the patient: young, curious, a bit nervous',
    skin: SKIN.warm, hair: {style: 'shortMan', color: '#2b2321'},
    top: {kind: 'hoodie', color: CLOTH.yellow, sleeve: 'long'},
    bottom: {kind: 'trousers', color: CLOTH.blue}, shoes: {kind: 'trainer', color: '#ffffff'},
    build: {heads: 4.5, R: 41, shoulder: 1.16, chest: 0.66, waist: 0.92, hip: 0.95, belly: 0.02, limb: 1.1, neck: 0.33, neckLen: 0.34, legFrac: 0.45, jaw: 1.03, tilt: 2},
  },
  {
    id: 'mom', name: 'Mom', role: 'the mother: warm, practical',
    skin: SKIN.tan, hair: {style: 'long', color: '#4f3324'},
    top: {kind: 'blouse', color: '#f08a76', sleeve: 'elbow'},
    bottom: {kind: 'skirt', color: '#4b4f96', hem: 0.2}, shoes: {kind: 'flat', color: CLOTH.brown},
    extras: {earrings: true, sash: '#b8564a'},
    build: {heads: 4.3, R: 39.5, shoulder: 0.97, chest: 0.62, waist: 0.74, hip: 1.0, belly: 0, limb: 0.97, neck: 0.27, neckLen: 0.34, legFrac: 0.45, jaw: 0.93, tilt: 4},
  },
  {
    id: 'dad', name: 'Dad', role: 'the father: steady, a little tired',
    skin: SKIN.tan, hair: {style: 'neat', color: '#221c1b'},
    top: {kind: 'shirt', color: CLOTH.blue, sleeve: 'long'},
    bottom: {kind: 'trousers', color: CLOTH.charcoal}, shoes: {kind: 'shoe', color: '#4a3226'},
    extras: {stubble: true, belt: '#4a3226'},
    build: {heads: 4.6, R: 41, shoulder: 1.28, chest: 0.72, waist: 1.08, hip: 1.04, belly: 0.16, limb: 1.15, neck: 0.37, neckLen: 0.34, legFrac: 0.43, jaw: 1.1, nose: 1.15},
  },
  {
    id: 'kid', name: 'Kid', role: 'the son, about 7: lively',
    skin: SKIN.warm, hair: {style: 'kid', color: '#2e2420'},
    top: {kind: 'tee', color: CLOTH.green, sleeve: 'short', trim: CLOTH.yellow},
    bottom: {kind: 'shorts', color: CLOTH.navy}, shoes: {kind: 'trainer', color: CLOTH.red},
    extras: {cap: CLOTH.teal},
    build: {heads: 3.1, R: 37, shoulder: 0.8, chest: 0.56, waist: 0.72, hip: 0.74, belly: 0.04, limb: 0.95, neck: 0.25, neckLen: 0.2, legFrac: 0.37, hand: 0.9, tilt: -5, nose: 0.85},
  },
  {
    id: 'grandpa', name: 'Grandpa', role: 'the grandfather: gentle, stubborn',
    skin: SKIN.warm, hair: {style: 'balding', color: '#f1ede4'},
    top: {kind: 'shirt', color: '#f4ead2', sleeve: 'long'}, over: {kind: 'cardigan', color: '#7d6cc0'},
    bottom: {kind: 'trousers', color: CLOTH.brown}, shoes: {kind: 'shoe', color: '#3a2a22'},
    extras: {glasses: 'square', moustache: true, elbowPatch: '#5b4c99'},
    build: {heads: 4.15, R: 41, shoulder: 1.12, chest: 0.66, waist: 1.1, hip: 1.04, belly: 0.28, limb: 1.05, neck: 0.34, neckLen: 0.26, legFrac: 0.41, jaw: 1.08, tilt: 2, nose: 1.15},
  },
  {
    id: 'grandma', name: 'Grandma', role: 'the grandmother: wise, a little worried',
    skin: SKIN.warm, hair: {style: 'bun', color: '#cfcac4'},
    top: {kind: 'blouse', color: '#f4ead2', sleeve: 'long'}, over: {kind: 'cardigan', color: '#8fae8b'},
    bottom: {kind: 'skirt', color: '#8a4a72', hem: 0.07}, shoes: {kind: 'flat', color: '#4a3226'},
    extras: {glasses: 'round'},
    build: {heads: 3.95, R: 39, shoulder: 0.94, chest: 0.64, waist: 0.96, hip: 1.08, belly: 0.14, limb: 0.98, neck: 0.28, neckLen: 0.24, legFrac: 0.4, jaw: 1.02, tilt: -4},
  },
  {
    id: 'baby', name: 'Baby', role: 'the toddler: curious about everything',
    skin: SKIN.light, hair: {style: 'tuft', color: '#a8794e'},
    top: {kind: 'onesie', color: CLOTH.sky, sleeve: 'short', trim: '#ffffff'},
    bottom: {kind: 'onesie', color: CLOTH.sky}, shoes: {kind: 'bare', color: SKIN.light},
    build: {heads: 2.45, R: 35, shoulder: 0.9, chest: 0.68, waist: 0.95, hip: 0.92, belly: 0.3, limb: 1.38, neck: 0.3, neckLen: 0.04, legFrac: 0.25, hand: 0.82, arm: 0.92, jaw: 1.06, tilt: 5, nose: 0.7},
  },
];
export const castById = (id: string) => CAST.find((c) => c.id === id)!;
void FLESH; void tint;
