/**
 * MedPeak Toons, look v8: the INSIDE-THE-BODY scenes of the rabies video (1080 x 1920 stills).
 *
 * Two reusable places (backgrounds without characters, drawn in a <Layer> in frame pixels):
 *   - ArmPlace {bite, wall}: a close side cut through the forearm where the dog bit. The arm runs
 *     diagonally up to the right (toward the shoulder, and the brain): air on the upper left, then the
 *     skin surface with a few hairs, outer skin, deeper skin, fat, muscle, and the NERVE, a cream cord in
 *     the top of the muscle that leaves the frame at the top right. `bite` opens two tooth marks;
 *     `wall` stands a row of Antibodies (the cast figure) across the nerve.
 *   - NervePlace {view, far}: the inside at the scale of the cells. 'entry' (just under the wound),
 *     'road' (the nerve as a long winding cord up to the Brain; `far` = the same road seen from further
 *     out, thinner and longer) and 'caught' (an open space in tissue).
 *
 * The places follow the cast's drawing rules but stay QUIETER than the cast: big flat fields in the body
 * palette, at most one darker tone per shape, few inner lines, no faces, no gradients, no glow.
 *
 * Built here because the kit has no such pieces (the kit and the cast are untouched):
 *   - wobbly lines and bands (hand-drawn layer borders), a tapering tube along a smooth centre line
 *     (the nerve cord, vessels), a spit drop, rounded tissue lobes.
 */
import React, {useId} from 'react';
import {CLOTH, EDGE_IN, FLESH, INK, INLINE, OUTLINE, SKIN, Shape, shade, tint} from './kit';
import {Label, Layer, Put, Scene, SCENE_H, SCENE_W, Tag} from './scene';
import {Vaccine, Virus} from './germs';
import {Antibody, WhiteCell} from './cells';
import {Brain} from './organs-a';
import {Dog} from './animals';


// ------------------------------------------------------------------ geometry helpers
type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** Smooth curve segments (Catmull-Rom as cubics) through the points, without the opening M. */
const curve = (p: P[]): string => {
  let d = '';
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i], p1 = p[i], p2 = p[i + 1], p3 = p[i + 2] ?? p[i + 1];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d;
};
const open = (p: P[]) => `M ${f(p[0][0])} ${f(p[0][1])}${curve(p)}`;
/** A closed smooth outline through the points. */
const loop = (p: P[]): string => {
  const n = p.length;
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};
/** A repeatable pseudo-random number 0..1. */
const rnd = (i: number, seed: number) => { const x = Math.sin(i * 127.1 + seed * 311.7) * 43758.5453; return x - Math.floor(x); };
/** A hand-drawn, slightly uneven line from x0 to x1 around height y. */
const wob = (x0: number, x1: number, y: number, amp: number, seed: number, step = 140): P[] => {
  const out: P[] = [];
  const n = Math.max(2, Math.round((x1 - x0) / step));
  for (let i = 0; i <= n; i++) out.push([x0 + ((x1 - x0) * i) / n, y + (rnd(i, seed) - 0.5) * 2 * amp]);
  return out;
};
/** The area from a top line down to `bottom` (layers are drawn top first, each next one covering). */
const below = (top: P[], bottom: number) => `${open(top)} L ${top[top.length - 1][0]} ${bottom} L ${top[0][0]} ${bottom} Z`;
/** A slightly uneven round lobe. */
const lobe = (cx: number, cy: number, rx: number, ry: number, seed: number, n = 9): string =>
  loop(Array.from({length: n}, (_, i): P => {
    const a = (i * 2 * Math.PI) / n;
    const k = 1 + (rnd(i, seed) - 0.5) * 0.14;
    return [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  }));

/** Sample a smooth centre line (Catmull-Rom) into many points. */
const sample = (pts: P[], steps = 14): P[] => {
  const out: P[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] ?? pts[i + 1];
    for (let s = 0; s < steps; s++) {
      const t = s / steps, t2 = t * t, t3 = t2 * t;
      const c = (a: number, b: number, cc: number, d: number) => 0.5 * (2 * b + (-a + cc) * t + (2 * a - 5 * b + 4 * cc - d) * t2 + (-a + 3 * b - 3 * cc + d) * t3);
      out.push([c(p0[0], p1[0], p2[0], p3[0]), c(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};
type Cord = {d: string; c: P[]; L: P[]; R: P[]; w: number[]};
/** A closed tube along a smooth centre line; widths (full) given per control point, interpolated. */
const cord = (pts: P[], widths: number[], steps = 14, capEnds = true): Cord => {
  const c = sample(pts, steps);
  const n = c.length;
  const w = c.map((_, i) => {
    const u = (i / (n - 1)) * (widths.length - 1);
    const a = Math.floor(u), b = Math.min(widths.length - 1, a + 1);
    return widths[a] + (widths[b] - widths[a]) * (u - a);
  });
  const L: P[] = [], R: P[] = [];
  c.forEach((p, i) => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    const h = w[i] / 2;
    L.push([p[0] - (dy / l) * h, p[1] + (dx / l) * h]);
    R.push([p[0] + (dy / l) * h, p[1] - (dx / l) * h]);
  });
  const pathPts = [...L, ...R.slice().reverse()];
  const d = capEnds ? loop(pathPts.filter((_, i) => i % 2 === 0)) : `${open(L)} L ${f(R[n - 1][0])} ${f(R[n - 1][1])}${curve(R.slice().reverse())} Z`;
  return {d, c, L, R, w};
};

/** Thin branch (nerve ending, small vessel): ink pass then colour pass, like the cast's tubes. */
const Branch: React.FC<{d: string; w: number; fill: string}> = ({d, w, fill}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 6} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

// ------------------------------------------------------------------ colours of the places
const AIR = '#e4eef1'; // the pale air over the skin
const EPI = SKIN.warm; // outer skin (as on the cast's Skin)
const DERM = FLESH.coral; // deeper skin
const FAT = tint(FLESH.butter, 0.15); // fat
const MUSCLE = tint('#c95c61', 0.22); // the cast's muscle red, a step calmer
const NERVE = tint(FLESH.butter, 0.4); // the cast's nerve cream
const MYELIN = FLESH.cream;
const WOUND = '#b9474f'; // inside the bite: red, not gory
const SPIT = '#e9f1f2'; // dog spit
const TISSUE_BASE = tint(FLESH.maroon, 0.3); // deep tissue behind everything, cell scale
const TISSUE = tint(FLESH.salmon, 0.08); // the soft lobes of tissue
const TISSUE_FAR = shade(TISSUE_BASE, 0.06); // lobes further back
const VESSEL = tint('#cf5560', 0.12); // small blood vessels

// ------------------------------------------------------------------ a drop of spit (frame pixels)
/** A drop of dog spit: pointed tail toward `rot` degrees (0 = tail up). r = its round half width. */
export const SpitDrop: React.FC<{x: number; y: number; r: number; rot?: number}> = ({x, y, r, rot = 0}) => {
  const d = `M 0 ${-r * 1.7} C ${r * 0.35} ${-r * 1.05} ${r} ${-r * 0.55} ${r} ${r * 0.12} C ${r} ${r * 0.7} ${r * 0.52} ${r} 0 ${r} C ${-r * 0.55} ${r} ${-r} ${r * 0.68} ${-r} ${r * 0.1} C ${-r} ${-r * 0.55} ${-r * 0.32} ${-r * 1.08} 0 ${-r * 1.7} Z`;
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><Shape d={d} fill={SPIT} shadow={Math.max(0.4, r / 22)} /></g>;
};
/** A flat puddle of spit the virus rides on (frame pixels, centred on x, y). */
const SpitRaft: React.FC<{x: number; y: number; w: number; rot?: number}> = ({x, y, w, rot = 0}) => {
  const h = w * 0.3;
  const d = loop([[-w / 2, 0], [-w * 0.36, -h * 0.55], [-w * 0.1, -h * 0.62], [w * 0.2, -h * 0.58], [w * 0.44, -h * 0.35], [w / 2, h * 0.05], [w * 0.36, h * 0.45], [0, h * 0.5], [-w * 0.38, h * 0.4]]);
  return <g transform={`translate(${x} ${y}) rotate(${rot})`}><Shape d={d} fill={SPIT} shadow={2} /></g>;
};

// =================================================================== PLACE 1: the forearm, cut open
// The arm is drawn in its own frame: a = along the arm (+ toward the shoulder), d = depth under the skin
// surface (0 = the surface). The arm climbs to the upper right and bends straight up past the bite, so
// the nerve leaves the frame at the top ("up this nerve, to the brain").
const ARM = {x: 230, y: 760, ang: -45}; // the bite sits at (x, y) in frame pixels
const BEND = {from: 100, len: 520, slope: 1.15}; // where the arm starts to bend up, and how much
const RAD = (ARM.ang * Math.PI) / 180;
const CA = Math.cos(RAD), SA = Math.sin(RAD);
const bend = (a: number) => {
  const {from, len, slope} = BEND;
  if (a <= from) return 0;
  if (a < from + len) return (slope * (a - from) ** 2) / (2 * len);
  return (slope * len) / 2 + slope * (a - from - len);
};
/** Frame pixels of a point given along the arm (a) and under the surface (depth). */
export const armPt = (a: number, depth: number): P => {
  const d = depth - bend(a);
  return [ARM.x + a * CA - d * SA, ARM.y + a * SA + d * CA];
};
const mapPts = (p: P[]): P[] => p.map(([a, d]) => armPt(a, d));
/** The direction of the arm (degrees, frame) at a point along it: for small pieces drawn at an angle. */
const armAng = (a: number) => {
  const [x0, y0] = armPt(a - 4, 0), [x1, y1] = armPt(a + 4, 0);
  return (Math.atan2(y1 - y0, x1 - x0) * 180) / Math.PI;
};
/** The two tooth punctures sit at -PUNCTURE and +PUNCTURE along the arm from the bite point. */
export const PUNCTURE = 28;
/** Depths of the layer borders and of the nerve's centre line. */
export const LAYERS = {epi: 46, derm: 230, fat: 410, nerve: 510, nerveW: 118};

const A0 = -1400, A1 = 1700, DEEP = 2600;
const SURFACE = wob(A0, A1, 0, 6, 1, 90);
const EPI_LINE = (() => { // the wavy border under the outer skin (the papillae)
  const out: P[] = [];
  for (let a = A0; a <= A1; a += 30) out.push([a, LAYERS.epi + Math.sin(a / 22) * 8 + (rnd(a, 2) - 0.5) * 3]);
  return out;
})();
const DERM_LINE = wob(A0, A1, LAYERS.derm, 10, 3, 110);
const FAT_LINE = wob(A0, A1, LAYERS.fat, 12, 4, 120);
const NERVE_C = wob(A0, A1, LAYERS.nerve, 9, 5, 150);
/** The area from a line (in arm coordinates) down to the deep end, in frame pixels. */
const layer = (top: P[]) => {
  const deep = wob(A0, A1, DEEP, 0, 0, 200).reverse();
  return `${open(mapPts(top))} L ${f(armPt(A1, DEEP)[0])} ${f(armPt(A1, DEEP)[1])}${curve(mapPts(deep))} Z`;
};

export const ArmPlace: React.FC<{bite?: boolean; wall?: boolean; air?: boolean; punctures?: [number, number]}> = ({bite = true, wall = false, air = true, punctures = [-PUNCTURE, PUNCTURE]}) => {
  const nc = mapPts(NERVE_C);
  const nerve = cord(nc, nc.map((_, i) => LAYERS.nerveW + (rnd(i, 9) - 0.5) * 8), 8, false);
  // the fat lobules: loose scallops in rows
  const fatArcs: string[] = [];
  for (let row = 0; row < 2; row++) {
    for (let a = A0 + (row ? 70 : 0); a < A1; a += 140) {
      const d = LAYERS.derm + 60 + row * 86 + (rnd(a, 11 + row) - 0.5) * 16;
      if (bite && Math.abs(a) < 110) continue;
      fatArcs.push(open(mapPts([[a - 46, d + 18], [a - 20, d - 6], [a + 22, d - 7], [a + 46, d + 16]])));
    }
  }
  const fibres = ([
    [-1300, -560, 600], [-300, 500, 600], [760, 1600, 610],
    [-1400, -800, 780], [-560, 300, 790], [560, 1500, 770],
    [-1300, -400, 980], [0, 1100, 970],
    [-1000, 100, 1180], [400, 1500, 1190],
  ] as [number, number, number][]).map(([a, b, d], i) => open(mapPts(wob(a, b, d, 8, 20 + i, 110))));
  // the nodes of the nerve's fatty sleeve: short lines across the cord
  const nodes: string[] = [];
  for (let i = 6; i < nerve.c.length - 2; i += 11) nodes.push(open([nerve.L[i], nerve.c[i], nerve.R[i]]));
  const hairs = [-900, -560, -260, 330];
  const ends: P[][] = [ // the nerve's fine endings, a little up the arm from the bite
    [[150, 490], [150, 410], [132, 340], [112, 290]],
    [[148, 400], [176, 352], [196, 304]],
    [[236, 490], [244, 420], [236, 356], [220, 306]],
    [[242, 424], [272, 378], [288, 330]],
  ];
  const clip = 'sk' + useId().replace(/:/g, '');
  return (
    <>
      <Layer>
        {air && <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={AIR} />}
        {/* hairs standing out into the air (drawn first, the skin covers their roots) */}
        {hairs.map((a, i) => <path key={a} d={open(mapPts([[a, 10], [a + 8, -30], [a - 8, -64], [a + 6 + (i % 2) * 8, -96 - (i % 3) * 12]]))} {...OUTLINE} />)}
        {/* the layers, top first, each next one covering the one above */}
        <path d={layer(SURFACE)} fill={EPI} />
        <path d={layer(EPI_LINE)} fill={DERM} />
        <path d={layer(DERM_LINE)} fill={FAT} />
        <path d={layer(FAT_LINE)} fill={MUSCLE} />
        {/* the one darker tone of the muscle: a band deep down */}
        <path d={layer(wob(A0, A1, 1300, 16, 7, 160))} fill={shade(MUSCLE, 0.1)} />
        {fatArcs.map((d) => <path key={d} d={d} {...INLINE} />)}
        {fibres.map((d) => <path key={d} d={d} {...INLINE} />)}
        {/* hair roots down to their bulbs in the deeper skin */}
        {[-560, 330].map((a) => {
          const [bx, by] = armPt(a + 2, 160);
          return <g key={a}><path d={open(mapPts([[a, 6], [a + 4, 60], [a - 4, 110], [a + 2, 146]]))} {...INLINE} /><path d={lobe(bx, by, 13, 14, a)} fill={shade(DERM, 0.18)} {...EDGE_IN} /></g>;
        })}
        <path d={open(mapPts(EPI_LINE))} {...INLINE} />
        <path d={open(mapPts(DERM_LINE))} {...INLINE} />
        <path d={open(mapPts(FAT_LINE))} {...INLINE} />
        {/* the nerve endings rising from the cord toward the skin under the bite */}
        {ends.map((p, i) => <Branch key={i} d={open(mapPts(p))} w={i % 2 ? 9 : 14} fill={NERVE} />)}
        {/* the nerve: a cream cord with its fatty sleeve marked by short lines across */}
        <Shape d={nerve.d} fill={NERVE} shadow={2.4}>
          {nodes.map((d) => <path key={d} d={d} {...INLINE} />)}
        </Shape>
        {/* the skin surface */}
        <path d={open(mapPts(SURFACE))} {...OUTLINE} />
        {bite && (
          <g>
            <defs><clipPath id={clip}><path d={layer(SURFACE)} /></clipPath></defs>
            {/* everything of the bite stays inside the skin (clipped to it) */}
            <g clipPath={`url(#${clip})`}>
              <g transform={`translate(${ARM.x} ${ARM.y}) rotate(${armAng(0)})`}>
                {/* a little swelling round the bite: one pinker tone of the outer and deeper skin */}
                <path d="M -96 -30 C -72 34 -26 46 0 46 C 28 46 74 34 98 -30 Z" fill={tint(WOUND, 0.6)} />
                {/* the short shallow tear between the two punctures */}
                <path d="M -18 6 C -8 15 8 15 18 6 C 8 22 -8 22 -18 6 Z" fill={WOUND} {...EDGE_IN} />
                {/* two tooth punctures, cut into the outer skin: a short oval, red, dark at the bottom */}
                {[[punctures[0], 12, 11, 27], [punctures[1], 13, 12, 29]].map(([x, y, rx, ry]) => (
                  <g key={x}>
                    <path d={lobe(x, y, rx, ry, x + 3, 8)} fill={WOUND} />
                    <path d={lobe(x + 2, y + 5, rx * 0.55, ry * 0.6, x + 5, 7)} fill={shade(WOUND, 0.3)} />
                    <path d={lobe(x, y, rx, ry, x + 3, 8)} {...OUTLINE} />
                  </g>
                ))}
              </g>
            </g>
          </g>
        )}
      </Layer>
      {wall && <AntibodyWall />}
    </>
  );
};

/** Where the wall stands: the nerve runs straight up there, so the wall is a level row across it. */
export const WALL = {y: 470, xs: [566, 683, 800, 917, 1034], size: 186};
const AntibodyWall: React.FC = () => (
  <>
    {WALL.xs.map((x, i) => (
      <Put key={x} x={x} y={WALL.y + (i % 2) * 8} size={WALL.size}><Antibody color={CLOTH.teal} mood="angry" mouth={i === 2 ? 'grit' : 'flat'} look={[(800 - x) / 400, 0.6]} /></Put>
    ))}
  </>
);

// =================================================================== PLACE 2: inside, at the scale of the cells
/** The soft tissue all round: a deep base and rounded lobes, drawn calm. scale < 1 = seen from further out. */
const Tissue: React.FC<{lobes: [number, number, number, number][]; back?: [number, number, number, number][]; vessels?: {pts: P[]; w: number}[]}> = ({lobes, back = [], vessels = []}) => (
  <g>
    <rect x={0} y={0} width={SCENE_W} height={SCENE_H} fill={TISSUE_BASE} />
    {back.map(([x, y, rx, ry], i) => <path key={'b' + i} d={lobe(x, y, rx, ry, 40 + i)} fill={TISSUE_FAR} {...EDGE_IN} />)}
    {vessels.map((v, i) => {
      const c = cord(v.pts, v.pts.map(() => v.w), 12);
      return <Shape key={'v' + i} d={c.d} fill={VESSEL} shadow={1.2} />;
    })}
    {lobes.map(([x, y, rx, ry], i) => (
      <Shape key={'l' + i} d={lobe(x, y, rx, ry, 10 + i)} fill={TISSUE} shadow={2.4}>
        <path d={`M ${x - rx * 0.5} ${y - ry * 0.35} Q ${x - rx * 0.1} ${y - ry * 0.55} ${x + rx * 0.3} ${y - ry * 0.42}`} {...INLINE} />
      </Shape>
    ))}
  </g>
);

/** The nerve cord as a road: a tapering cream tube with the short lines of its sleeve across it. */
const NerveRoad: React.FC<{pts: P[]; widths: number[]; every?: number}> = ({pts, widths, every = 8}) => {
  const c = cord(pts, widths, 14, false);
  const nodes: string[] = [];
  for (let i = 3; i < c.c.length - 3; i += every) {
    const [l, m, r] = [c.L[i], c.c[i], c.R[i]];
    const a = c.c[Math.min(c.c.length - 1, i + 1)];
    const dx = a[0] - m[0], dy = a[1] - m[1], len = Math.hypot(dx, dy) || 1;
    const bulge = c.w[i] * 0.08;
    nodes.push(open([l, [m[0] + (dx / len) * bulge, m[1] + (dy / len) * bulge], r]));
  }
  return (
    <Shape d={c.d} fill={NERVE} shadow={2.6}>
      {nodes.map((d) => <path key={d} d={d} {...INLINE} />)}
    </Shape>
  );
};

/** Where the Brain sits on each road (its stem ends on the top of the cord). */
export const ROAD = {
  near: {brain: [540, 300, 220] as [number, number, number]},
  far: {brain: [600, 520, 170] as [number, number, number]},
};
const stemEnd = ([x, y, s]: [number, number, number]): P => [x + 10 * (s / 200), y + 86 * (s / 200)];

export const NervePlace: React.FC<{view: 'entry' | 'road' | 'caught'; far?: boolean}> = ({view, far = false}) => {
  if (view === 'road' && !far) {
    const top = stemEnd(ROAD.near.brain);
    return (
      <Layer>
        <Tissue
          back={[[300, 560, 240, 150], [800, 520, 230, 140], [180, 820, 200, 160], [920, 760, 210, 170]]}
          vessels={[{pts: [[-60, 640], [200, 600], [420, 680], [700, 610], [1140, 660]], w: 34}]}
          lobes={[[-60, 1080, 300, 380], [1140, 1000, 300, 360], [-40, 1700, 320, 360], [1120, 1740, 300, 340], [90, 360, 220, 200], [1000, 330, 230, 210]]}
        />
        <NerveRoad pts={[[560, 2060], [500, 1700], [560, 1330], [660, 1010], [600, 760], [500, 560], top]} widths={[820, 660, 470, 300, 170, 90, 44]} every={10} />
      </Layer>
    );
  }
  if (view === 'road' && far) {
    const top = stemEnd(ROAD.far.brain);
    // seen from further out: the cord is thin and long, and the tissue round it is smaller
    const lobes: [number, number, number, number][] = [
      [40, 900, 150, 170], [1060, 860, 150, 180], [80, 1300, 130, 120], [1040, 1340, 150, 140],
      [-10, 1750, 180, 170], [1090, 1720, 170, 170], [300, 1880, 160, 110], [820, 1920, 170, 120],
      [70, 520, 140, 130], [1040, 470, 150, 140], [880, 1120, 90, 80], [190, 1110, 80, 80],
    ];
    const back: [number, number, number, number][] = [[330, 700, 120, 80], [880, 690, 110, 80], [540, 1080, 70, 60], [280, 1540, 90, 70], [800, 1560, 100, 70]];
    return (
      <Layer>
        <Tissue lobes={lobes} back={back}
          vessels={[{pts: [[-40, 1010], [260, 960], [520, 1010], [780, 940], [1120, 990]], w: 20}, {pts: [[-40, 1460], [300, 1420], [640, 1470], [1120, 1430]], w: 16}]} />
        <NerveRoad pts={[[330, 2000], [420, 1700], [700, 1480], [740, 1250], [430, 1060], [350, 850], [520, 700], top]} widths={[170, 150, 124, 104, 86, 70, 54, 34]} every={7} />
      </Layer>
    );
  }
  if (view === 'entry') {
    // just under the bite: the underside of the deeper skin at the top, the hole, fat lobules, and the
    // nerve's ending rising toward the hole
    const dermBottom = wob(-40, 1120, 230, 14, 61, 120);
    return (
      <Layer>
        <Tissue lobes={[[-40, 1150, 240, 300], [1120, 1200, 230, 320], [60, 1820, 260, 220]]} back={[[260, 1500, 160, 120], [860, 1560, 150, 120]]} />
        {/* fat lobules under the skin */}
        {[[80, 330, 120, 90], [280, 360, 110, 86], [800, 360, 116, 90], [1000, 330, 120, 92], [150, 520, 110, 80], [930, 530, 110, 82]].map(([x, y, rx, ry], i) => (
          <Shape key={i} d={lobe(x, y, rx, ry, 70 + i)} fill={FAT} shadow={1.6} />
        ))}
        {/* the deeper skin overhead, with the hole the teeth made */}
        <Shape d={`${open(dermBottom)} L 1120 -40 L -40 -40 Z`} fill={DERM} shadow={0} line="none" />
        <path d={open(dermBottom)} {...OUTLINE} />
        <path d="M 470 -10 C 480 80 500 170 530 238 C 560 170 590 80 610 -10 Z" fill={WOUND} />
        <path d="M 470 -10 C 480 80 500 170 530 238 C 560 170 590 80 610 -10" {...OUTLINE} />
        {/* the nerve coming up from below, opening into its fine endings */}
        <NerveRoad pts={[[900, 2000], [820, 1600], [640, 1240], [560, 960], [548, 820]]} widths={[300, 250, 190, 140, 110]} every={9} />
        <Branch d="M 548 840 C 520 720 470 640 420 560" w={22} fill={NERVE} />
        <Branch d="M 556 830 C 560 700 560 620 548 520" w={20} fill={NERVE} />
        <Branch d="M 566 840 C 610 730 660 660 700 590" w={20} fill={NERVE} />
        <Branch d="M 470 640 C 440 610 410 600 380 600" w={12} fill={NERVE} />
        <Branch d="M 650 680 C 680 650 720 640 740 646" w={12} fill={NERVE} />
      </Layer>
    );
  }
  // caught: an open space in the tissue, a paler floor in the middle
  return (
    <Layer>
      <Tissue
        back={[[260, 420, 220, 140], [820, 400, 230, 150]]}
        vessels={[{pts: [[-60, 330], [300, 280], [640, 340], [1140, 290]], w: 30}]}
        lobes={[[-80, 700, 260, 340], [1160, 650, 260, 330], [-60, 1320, 240, 260], [1140, 1300, 250, 260], [-40, 1850, 300, 220], [1120, 1860, 300, 220], [540, 1980, 300, 160]]}
      />
      {/* a calm hollow in the tissue, the darker tone of the far lobes */}
      <path d={lobe(540, 1000, 480, 360, 90, 11)} fill={TISSUE_FAR} {...EDGE_IN} />
    </Layer>
  );
};

// =================================================================== the five storyboard frames
/** A: the hook. The Virus, big and angry, on the nerve road; the Brain small and worried at the top. */
export const V8SceneA: React.FC = () => {
  const [bx, by, bs] = ROAD.near.brain;
  return (
    <Scene bg={TISSUE_BASE}>
      <NervePlace view="road" />
      <Put x={bx} y={by} size={bs}><Brain mood="scared" mouth="wavy" look={[0.1, 0.8]} /></Put>
      <Put x={560} y={1030} size={440}><Virus mood="angry" mouth="grit" look={[-0.2, 0.2]} /></Put>
    </Scene>
  );
};

/** B: that morning. The dog's muzzle at the bite; spit drops carry the Virus in toward the nerve. */
export const V8SceneB: React.FC = () => {
  const [rx, ry] = armPt(64, 196); // the raft, in the deeper skin just inside the bite
  // The dog bites the arm: the cast's head close-up, turned and sized so its whole face stays in frame.
  // Its place is solved from two tooth tips (head units, with the head's own offset): the upper front
  // fang and the lower canine sit on the skin, and the punctures are drawn exactly under them.
  const K = 2.3, ROT = 35, r = (ROT * Math.PI) / 180;
  const turn = ([x, y]: P): P => [(x * Math.cos(r) - y * Math.sin(r)) * K, (x * Math.sin(r) + y * Math.cos(r)) * K];
  const up = turn([77 - 4, -4 + 2]), low = turn([67 - 4, 15 + 2]);
  const [mx, my] = armPt(0, 8);
  const cx = mx - (up[0] + low[0]) / 2, cy = my - (up[1] + low[1]) / 2;
  const along = ([x, y]: P) => (cx + x - armPt(0, 0)[0]) * Math.cos((-45 * Math.PI) / 180) + (cy + y - armPt(0, 0)[1]) * Math.sin((-45 * Math.PI) / 180);
  const holes: [number, number] = [along(low), along(up)].sort((a, b) => a - b) as [number, number];
  // the trail of spit: from between the teeth, through the bite, down to the raft; bigger as it comes
  const trail: [number, number, number][] = [[-6, -96, 7], [-2, -42, 8], [6, 22, 10], [20, 84, 12], [36, 140, 14]];
  return (
    <Scene bg={AIR}>
      {/* the dog's head, BEHIND the cut skin: its jaws close on the arm past the cut */}
      <Put x={cx} y={cy} size={K * 200} rot={ROT}><Dog pose="head" /></Put>
      <ArmPlace bite air={false} punctures={holes} />
      <Layer>
        {trail.map(([a, d, rr]) => { const [x, y] = armPt(a, d); return <SpitDrop key={a + ',' + d} x={x} y={y} r={rr} rot={-45} />; })}
        <SpitRaft x={rx} y={ry} w={230} rot={-24} />
      </Layer>
      <Put x={rx + 2} y={ry - 92} size={220} rot={-6}><Virus mood="wink" mouth="smile" look={[0.7, 0.4]} /></Put>
      <Label x={220} y={250} text="That morning" />
    </Scene>
  );
};

/** M2: the long way. Seen further out; the Virus small and smug on the long nerve; the Brain at the top. */
export const V8SceneM2: React.FC = () => {
  const [bx, by, bs] = ROAD.far.brain;
  return (
    <Scene bg={TISSUE_BASE}>
      <NervePlace view="road" far />
      <Put x={bx} y={by} size={bs}><Brain mood="sad" mouth="frown" look={[-0.3, 0.8]} /></Put>
      <Put x={720} y={1180} size={190}><Virus mood="bored" look={[-0.5, -0.6]} /></Put>
      <Tag x={540} y={330} text="2-3 months" />
    </Scene>
  );
};

/** E: after the vaccine. The wall of Antibodies across the nerve; the Virus stopped in front of it. */
export const V8SceneE: React.FC = () => (
  <Scene bg={AIR}>
    <ArmPlace bite wall />
    <Put x={690} y={280} size={200}><Vaccine mood="happy" mouth="smile" /></Put>
    <Put x={925} y={286} size={186}><Vaccine mood="open" mouth="smile" look={[-0.4, 0.5]} /></Put>
    <Put x={800} y={790} size={290}><Virus mood="dizzy" mouth="o" /></Put>
    <Label x={230} y={250} text="After the vaccine" />
  </Scene>
);

/** M3: caught. Two White cells grip the Virus by its top spikes; one angry White cell in front. */
export const V8SceneM3: React.FC = () => (
  <Scene bg={TISSUE_BASE}>
    <NervePlace view="caught" />
    <Put x={540} y={820} size={300}><Virus mood="sad" mouth="frown" look={[0, 0.5]} /></Put>
    <Put x={341} y={645} size={340} flip><WhiteCell mood="angry" mouth="flat" look={[0.5, 0.6]} /></Put>
    <Put x={739} y={645} size={340}><WhiteCell mood="angry" mouth="flat" look={[-0.5, 0.6]} /></Put>
    <Put x={540} y={1170} size={380}><WhiteCell mood="angry" mouth="grit" look={[0, -0.2]} /></Put>
  </Scene>
);

// =================================================================== the empty places, for checking
export const V8PlaceArm: React.FC = () => <Scene bg={AIR}><ArmPlace bite /></Scene>;
export const V8PlaceNerve: React.FC = () => <Scene bg={TISSUE_BASE}><NervePlace view="road" /></Scene>;
export const V8PlaceNerveFar: React.FC = () => <Scene bg={TISSUE_BASE}><NervePlace view="road" far /></Scene>;
export const V8PlaceEntry: React.FC = () => <Scene bg={TISSUE_BASE}><NervePlace view="entry" /></Scene>;
export const V8PlaceCaught: React.FC = () => <Scene bg={TISSUE_BASE}><NervePlace view="caught" /></Scene>;
export const V8PlaceArmWall: React.FC = () => <Scene bg={AIR}><ArmPlace bite wall /></Scene>;
