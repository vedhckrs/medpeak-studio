/**
 * MedPeak Toons, look v8: the job characters for germs, threats and helpers (15).
 * Drawn with the shared kit (kit.tsx) only. Each one: a simple body whose SHAPE says what it is, the kit
 * face (two touching white eyes, small pupil, tiny mouth), thin limbs, ONE job piece, and a small name tag
 * where the name is not obvious. Villains are sly or mean through the eyes; helpers look kind.
 *
 * Pieces the kit does not have, built here: `closed` (a smooth closed curve through points), `ring`
 * (a slightly uneven round shape), `tube` (a bent tube outline for worms and smoke), `Rods` (thin
 * outlined sticks for spikes, cutlery, twigs, the dumbbell bar), `rr` (rounded rectangle path).
 */
import React from 'react';
import {BG, Board, Caption, CLOTH, EDGE_IN, Eyes, Fig, FLESH, INK, INLINE, Mouth, NameTag, OUT, OUTLINE, Panel, Shape, TinyArm, TinyLeg, shade, tint, type V8Props} from './kit';

// ------------------------------------------------------------------ helpers built for this sheet
type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** A smooth closed curve through the points (Catmull-Rom turned into cubic beziers). */
const closed = (p: P[], t = 1): string => {
  const n = p.length;
  let d = `M ${f(p[0][0])} ${f(p[0][1])}`;
  for (let i = 0; i < n; i++) {
    const p0 = p[(i - 1 + n) % n], p1 = p[i], p2 = p[(i + 1) % n], p3 = p[(i + 2) % n];
    const c1 = [p1[0] + ((p2[0] - p0[0]) * t) / 6, p1[1] + ((p2[1] - p0[1]) * t) / 6];
    const c2 = [p2[0] - ((p3[0] - p1[0]) * t) / 6, p2[1] - ((p3[1] - p1[1]) * t) / 6];
    d += ` C ${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(p2[0])} ${f(p2[1])}`;
  }
  return d + ' Z';
};

/** A slightly uneven round shape: one radius factor per point. */
const ring = (cx: number, cy: number, rx: number, ry: number, jit: number[], rot = -90): string =>
  closed(jit.map((j, i): P => {
    const a = ((rot + (i * 360) / jit.length) * Math.PI) / 180;
    return [cx + Math.cos(a) * rx * j, cy + Math.sin(a) * ry * j];
  }));

/** A bent tube along a centre line, with a half width per point and round ends. */
const tube = (c: P[], hw: number[]) => {
  const n = c.length;
  const dir = (i: number): P => {
    const a = c[Math.max(0, i - 1)], b = c[Math.min(n - 1, i + 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1];
    const l = Math.hypot(dx, dy) || 1;
    return [dx / l, dy / l];
  };
  const L: P[] = [], R: P[] = [];
  c.forEach((p, i) => {
    const [dx, dy] = dir(i);
    L.push([p[0] - dy * hw[i], p[1] + dx * hw[i]]);
    R.push([p[0] + dy * hw[i], p[1] - dx * hw[i]]);
  });
  const cap = (p: P, d: P, h: number): P[] => {
    const nl: P = [-d[1], d[0]];
    return [
      [p[0] + h * (0.72 * d[0] + 0.72 * nl[0]), p[1] + h * (0.72 * d[1] + 0.72 * nl[1])],
      [p[0] + h * d[0], p[1] + h * d[1]],
      [p[0] + h * (0.72 * d[0] - 0.72 * nl[0]), p[1] + h * (0.72 * d[1] - 0.72 * nl[1])],
    ];
  };
  const de = dir(n - 1), ds = dir(0);
  const endCap = cap(c[n - 1], de, hw[n - 1]);
  const startCap = cap(c[0], [-ds[0], -ds[1]], hw[0]);
  return {d: closed([...L, ...endCap, ...R.slice().reverse(), ...startCap]), L, R};
};

/** Thin outlined sticks (spikes, cutlery, twigs, bars), drawn like the kit's limbs. */
const Rods: React.FC<{d: string[]; fill: string; w?: number}> = ({d, fill, w = 4}) => (
  <g>
    {d.map((p, i) => <path key={'o' + i} d={p} stroke={INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
    {d.map((p, i) => <path key={'f' + i} d={p} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />)}
  </g>
);

/** A rounded rectangle path. */
const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M ${x + r} ${y} L ${x + w - r} ${y} Q ${x + w} ${y} ${x + w} ${y + r} L ${x + w} ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} L ${x + r} ${y + h} Q ${x} ${y + h} ${x} ${y + h - r} L ${x} ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

// one face size and one limb size for all fifteen
const ER = 10.5; // eye radius
const MW = 12; // mouth width
const LW = 5; // limb thickness

// ------------------------------------------------------------------ 1 virus: the sneaky intruder
const VIR = '#9d8cc2';
const VIRUS_BODY = ring(0, -4, 50, 48, [1, 0.96, 1.03, 0.98, 1.02, 0.97, 1.03, 0.99, 1.01, 0.96, 1.02, 0.98]);
const VIRUS_SPIKES = [-90, -52, -128, -166, 128, 54];
export const Virus: React.FC<V8Props> = ({mood = 'bored', mouth, look = [0.55, 0.25]}) => (
  <g>
    <TinyLeg from={[-18, 36]} to={[-22, 80]} fill={VIR} w={LW} foot={-1} />
    <TinyLeg from={[18, 36]} to={[22, 80]} fill={VIR} w={LW} />
    <Rods fill={VIR} w={LW} d={VIRUS_SPIKES.map((a) => {
      const r = (a * Math.PI) / 180;
      return `M ${f(Math.cos(r) * 36)} ${f(-4 + Math.sin(r) * 36)} L ${f(Math.cos(r) * 60)} ${f(-4 + Math.sin(r) * 60)}`;
    })} />
    {VIRUS_SPIKES.map((a) => {
      const r = (a * Math.PI) / 180;
      return <Shape key={a} d={ring(Math.cos(r) * 65, -4 + Math.sin(r) * 65, 7.5, 7.5, [1, 0.95, 1.04, 0.97, 1.02, 0.98])} fill={VIR} shadow={0.35} />;
    })}
    <TinyArm from={[-44, 10]} to={[-60, 38]} bend={[-76, 16]} fill={VIR} w={LW} hand="fist" />
    {/* the key he lets himself in with */}
    <Shape d={ring(73, -45, 8, 8, [1, 0.97, 1.03, 0.98, 1.02, 0.99])} fill="#e2bf63" shadow={0.3} />
    <circle cx={73} cy={-45} r={3} fill={BG} {...EDGE_IN} />
    <Shape d="M 70.5 -37.5 L 75.5 -37.5 L 75.5 -14 L 81 -14 L 81 -9 L 75.5 -9 L 75.5 -5 L 80 -5 L 80 0 L 70.5 0 Z" fill="#e2bf63" shadow={0} />
    <TinyArm from={[42, 8]} to={[72, -18]} bend={[72, 18]} fill={VIR} w={LW} hand="fist" />
    <Shape d={VIRUS_BODY} fill={VIR} shadow={1.2}>
      <circle cx={-28} cy={-24} r={3.2} fill={shade(VIR)} />
      <circle cx={-32} cy={14} r={2.6} fill={shade(VIR)} />
      <circle cx={24} cy={26} r={3} fill={shade(VIR)} />
    </Shape>
    <Eyes x={2} y={-16} r={ER} mood={mood} look={look} />
    {mood === 'bored' && <path d="M 5.5 -31 Q 13 -38 21 -33" {...INLINE} />}
    {mouth ? <Mouth x={4} y={7} w={MW} kind={mouth} /> : <path d="M -3 6 Q 5 11 11 2" {...OUTLINE} />}
  </g>
);

// ------------------------------------------------------------------ 2 bacteria: the troublemaker who loves sugar
const BAC = '#93bd7f';
const BACT_BODY = 'M -50 -38 C -16 -44 18 -44 44 -38 C 66 -33 68 18 46 24 C 18 30 -18 30 -48 24 C -72 18 -72 -32 -50 -38 Z';
export const Bacteria: React.FC<V8Props> = ({mood = 'open', mouth = 'tongue', look = [0.8, -0.3]}) => (
  <g>
    <TinyLeg from={[-20, 32]} to={[-24, 80]} fill={BAC} w={LW} foot={-1} />
    <TinyLeg from={[20, 32]} to={[22, 80]} fill={BAC} w={LW} />
    <g transform="translate(0 12)">
    {/* hairs (pili) and the tail */}
    {[[-40, -40, -42, -49], [-20, -42, -21, -51], [0, -42, 0, -51], [20, -42, 22, -51], [38, -39, 41, -47], [-62, -26, -69, -31], [-40, 25, -42, 33], [0, 26, 0, 34], [40, 25, 42, 32]].map(([a, b, c, d], i) => (
      <path key={i} d={`M ${a} ${b} L ${c} ${d}`} {...INLINE} />
    ))}
    <path d="M -64 -2 C -74 -14 -78 12 -88 0" {...OUTLINE} />
    <TinyArm from={[-40, 14]} to={[-56, 46]} bend={[-62, 26]} fill={BAC} w={LW} />
    {/* the sugar cube */}
    <path d="M 73 -22 L 77 -27 L 89 -27 L 85 -22 Z" fill="#ffffff" {...EDGE_IN} />
    <path d="M 85 -22 L 89 -27 L 89 -15 L 85 -10 Z" fill={shade(CLOTH.offwhite)} {...EDGE_IN} />
    <path d="M 73 -22 L 85 -22 L 85 -10 L 73 -10 Z" fill={CLOTH.offwhite} {...EDGE_IN} />
    <TinyArm from={[50, 8]} to={[77, -5]} bend={[76, 22]} fill={BAC} w={LW} />
    <Shape d={BACT_BODY} fill={BAC} shadow={1.1}>
      <path d="M -50 8 q 6 -6 12 0 t 12 0" {...INLINE} />
    </Shape>
    <Eyes x={12} y={-16} r={ER} mood={mood} look={look} />
    <Mouth x={14} y={4} w={MW} kind={mouth} />
    </g>
  </g>
);

// ------------------------------------------------------------------ 3 fungus (mould): the slow creeper
const FUN = '#a8b896';
/** A low mould patch: flat underside, a fuzzy top edge of many small bumps. */
const MOULD = (() => {
  const cx = 0, cy = 34, rx = 58, ry = 40, n = 17;
  const pt = (a: number, k: number): P => [cx + Math.cos(a) * rx * k, cy + Math.sin(a) * ry * k];
  const a0 = Math.PI, a1 = 2 * Math.PI;
  let d = `M ${f(pt(a0, 1)[0])} ${f(pt(a0, 1)[1])}`;
  for (let i = 1; i <= n; i++) {
    const a = a0 + ((a1 - a0) * i) / n, m = a0 + ((a1 - a0) * (i - 0.5)) / n;
    const c = pt(m, 1.12), p = pt(a, 1 + 0.02 * Math.sin(i * 1.7));
    d += ` Q ${f(c[0])} ${f(c[1])} ${f(p[0])} ${f(p[1])}`;
  }
  return d + ' C 60 46 52 54 30 55 C 10 57 -12 57 -32 55 C -52 54 -60 46 -58 34 Z';
})();
/** A small mushroom-like cap: a dome on a flat underside, (x, y) = the middle of the underside. */
const cap = (x: number, y: number, w: number, h: number) =>
  `M ${x - w / 2} ${y} C ${x - w / 2} ${y - h * 1.3} ${x + w / 2} ${y - h * 1.3} ${x + w / 2} ${y} Q ${x} ${y + h * 0.35} ${x - w / 2} ${y} Z`;
export const Fungus: React.FC<V8Props> = ({mood = 'sleepy', mouth = 'smile', look = [0.6, 0.3]}) => (
  <g>
    {/* thread-roots creeping outward along the ground */}
    <Rods fill={FUN} w={3.2} d={['M -48 50 C -62 58 -74 56 -88 64', 'M -66 57 q -4 10 -14 14', 'M -18 56 C -24 66 -34 70 -44 78', 'M 20 56 C 26 66 36 70 46 78', 'M 48 50 C 62 58 74 56 88 62', 'M 68 56 q 4 10 14 14']} />
    {/* short stalks with mushroom-like caps */}
    <Rods fill={FUN} w={5} d={['M -30 -2 Q -32 -18 -34 -30', 'M 4 -6 Q 4 -28 2 -46', 'M 32 0 Q 36 -12 40 -22']} />
    <Shape d={cap(-34, -30, 28, 15)} fill={FUN} shadow={0.5}>
      <circle cx={-40} cy={-38} r={1.8} fill={shade(FUN)} /><circle cx={-29} cy={-40} r={1.6} fill={shade(FUN)} />
    </Shape>
    <Shape d={cap(2, -46, 34, 18)} fill={FUN} shadow={0.5}>
      <circle cx={-6} cy={-55} r={2} fill={shade(FUN)} /><circle cx={8} cy={-58} r={1.8} fill={shade(FUN)} /><circle cx={12} cy={-51} r={1.5} fill={shade(FUN)} />
    </Shape>
    <Shape d={cap(40, -22, 22, 12)} fill={FUN} shadow={0.5}>
      <circle cx={38} cy={-29} r={1.5} fill={shade(FUN)} />
    </Shape>
    <TinyArm from={[-52, 28]} to={[-76, 42]} bend={[-70, 22]} fill={FUN} w={LW} hand="open" />
    <TinyArm from={[52, 26]} to={[78, 38]} bend={[70, 18]} fill={FUN} w={LW} hand="open" />
    <Shape d={MOULD} fill={FUN} shadow={1}>
      {[[-40, 20], [-30, 40], [36, 18], [42, 38], [20, 46]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.2} fill={shade(FUN)} />)}
    </Shape>
    <Eyes x={0} y={14} r={ER} mood={mood} look={look} />
    <Mouth x={6} y={35} w={MW} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ 4 parasite worm: the freeloader
const PAR = '#efc2bd';
const WORM = tube([[62, 76], [42, 80], [18, 76], [0, 62], [-8, 40], [-8, 16], [-4, -8], [-4, -34], [-6, -50]], [3, 7, 12, 16, 19, 21, 22, 23, 24]);
export const Worm: React.FC<V8Props> = ({mood = 'open', mouth = 'big', look = [0.3, -0.5]}) => (
  <g>
    {/* fork and knife, held up: dinner time at someone else's table */}
    <Rods fill={CLOTH.grey} w={3} d={['M -50 -4 L -50 -42', 'M -56 -42 L -44 -42', 'M -56 -42 L -56 -56', 'M -50 -42 L -50 -57', 'M -44 -42 L -44 -56']} />
    <Shape d="M 40 -30 L 40 -54 Q 41 -61 45 -59 Q 50 -50 48 -30 Z" fill="#dfe1e6" shadow={0} />
    <Rods fill={CLOTH.grey} w={4.5} d={['M 44 -28 L 44 -6']} />
    <TinyArm from={[-22, -2]} to={[-50, -18]} bend={[-48, 8]} fill={PAR} w={LW} hand="fist" />
    <TinyArm from={[14, -2]} to={[44, -18]} bend={[42, 8]} fill={PAR} w={LW} hand="fist" />
    <Shape d={WORM.d} fill={PAR} shadow={1}>
      {[2, 3, 4, 5, 6].map((i) => (
        <path key={i} d={`M ${f(WORM.L[i][0])} ${f(WORM.L[i][1])} L ${f(WORM.R[i][0])} ${f(WORM.R[i][1])}`} {...INLINE} />
      ))}
    </Shape>
    <Eyes x={-5} y={-46} r={ER} mood={mood} look={look} />
    <Mouth x={-4} y={-24} w={MW} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ 5 allergen (pollen grain): looks harmless
const ALG = '#ebd07c';
const scallop = (cx: number, cy: number, r: number, n: number, b: number) => {
  let d = '';
  for (let i = 0; i <= n; i++) {
    const a = ((i * 360) / n - 90) * (Math.PI / 180);
    const rr2 = r * (1 + 0.025 * Math.sin(i * 2.3));
    const x = cx + Math.cos(a) * rr2, y = cy + Math.sin(a) * rr2;
    if (i === 0) d = `M ${f(x)} ${f(y)}`;
    else {
      const m = (((i - 0.5) * 360) / n - 90) * (Math.PI / 180);
      d += ` Q ${f(cx + Math.cos(m) * (r + b * 2))} ${f(cy + Math.sin(m) * (r + b * 2))} ${f(x)} ${f(y)}`;
    }
  }
  return d + ' Z';
};
const POLLEN = scallop(0, -4, 49, 15, 5);
export const Allergen: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.1, -0.55]}) => (
  <g>
    <TinyLeg from={[-14, 44]} to={[-13, 82]} fill={ALG} w={LW} foot={1} />
    <TinyLeg from={[14, 44]} to={[13, 82]} fill={ALG} w={LW} foot={-1} />
    <TinyArm from={[-46, 8]} to={[-68, -14]} bend={[-70, 10]} fill={ALG} w={LW} hand="open" />
    <TinyArm from={[46, 10]} to={[62, 40]} bend={[66, 18]} fill={ALG} w={LW} />
    <Shape d={POLLEN} fill={ALG} shadow={1}>
      {[[-28, -26], [30, -22], [-32, 12], [32, 14], [-4, -38]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={2.4} fill={shade(ALG)} />)}
    </Shape>
    <Eyes x={0} y={-16} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={3} w={9} kind={mouth} />
    <NameTag x={0} y={24} text="Allergen" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 6 venom: silent and quick
const VEN = '#86b3a3';
const VENOM_BODY = 'M 6 -68 L 36 -22 Q 50 2 44 28 Q 36 54 4 56 Q -30 56 -40 30 Q -46 6 -30 -20 Z';
export const Venom: React.FC<V8Props> = ({mood = 'angry', mouth, look = [0.6, 0.1]}) => (
  <g>
    <TinyLeg from={[-16, 48]} to={[-26, 82]} fill={VEN} w={LW} foot={-1} />
    <TinyLeg from={[16, 48]} to={[26, 82]} fill={VEN} w={LW} />
    <TinyArm from={[-34, 10]} to={[-64, 6]} bend={[-56, 26]} fill={VEN} w={LW} hand="open" />
    {/* the fang, held like a little dagger */}
    <Shape d="M 58 -8 C 56 -22 62 -34 80 -40 C 74 -32 74 -20 76 -8 C 72 -2 62 -2 58 -8 Z" fill="#f4f0e6" shadow={0.4}>
      <path d="M 66 -10 C 66 -20 69 -29 76 -35" {...INLINE} />
    </Shape>
    <ellipse cx={76.5} cy={-35.5} rx={1.6} ry={2.2} transform="rotate(-50 76.5 -35.5)" fill={FLESH.deep} />
    <Shape d="M 87 -56 C 90 -51 92 -48 92 -46 C 92 -43 90 -41.5 87.5 -41.5 C 85 -41.5 83 -43 83 -46 C 83 -48 85 -51 87 -56 Z" fill={VEN} shadow={0} line="in" />
    <TinyArm from={[36, 8]} to={[66, -6]} bend={[62, 18]} fill={VEN} w={LW} hand="fist" />
    <Shape d={VENOM_BODY} fill={VEN} shadow={1.1} />
    <Eyes x={2} y={-14} r={ER} mood={mood} look={look} />
    {mouth ? <Mouth x={4} y={6} w={MW} kind={mouth} /> : (
      <g>
        <path d="M 5 7 L 9.5 7 L 7.4 12.5 Z" fill="#ffffff" {...EDGE_IN} />
        <path d="M -2 6 Q 4 8 11 5" {...OUTLINE} />
      </g>
    )}
    <NameTag x={2} y={28} text="Venom" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 7 nicotine: the charming trickster
const NIC = '#b4a796';
/** The smoke: overlapping puffs merged into one outlined cloud (outline under, fills over). */
const PUFFS: [number, number, number][] = [
  [0, -44, 26], [-22, -36, 16], [23, -38, 17], [-15, -15, 17], [15, -13, 17],
  [6, 6, 11], [12, 19, 9], [10, 32, 7.5], [16, 43, 6], [23, 53, 5], [29, 62, 4], [33, 70, 3.2],
];
const puffD = (x: number, y: number, r: number) => ring(x, y, r, r, [1, 0.96, 1.03, 0.98, 1.02, 0.97, 1.01, 0.98]);
const Smoke: React.FC<{fill: string}> = ({fill}) => {
  const id = 'smk' + React.useId().replace(/:/g, '');
  return (
    <g>
      <defs><clipPath id={id}>{PUFFS.map(([x, y, r], i) => <path key={i} d={puffD(x, y, r)} />)}</clipPath></defs>
      {PUFFS.map(([x, y, r], i) => <path key={'o' + i} d={puffD(x, y, r)} stroke={INK} strokeWidth={OUT * 2} strokeLinejoin="round" vectorEffect="non-scaling-stroke" fill="none" />)}
      {PUFFS.map(([x, y, r], i) => <path key={'s' + i} d={puffD(x, y, r)} fill={shade(fill)} />)}
      <g clipPath={`url(#${id})`}>{PUFFS.map(([x, y, r], i) => <path key={'f' + i} d={puffD(x, y, r)} fill={fill} transform="translate(-4 -5)" />)}</g>
      <path d="M -30 -32 q -3 -8 5 -9 q 6 1 2 7" {...INLINE} />
    </g>
  );
};
export const Nicotine: React.FC<V8Props> = ({mood = 'wink', mouth = 'smile', look = [0.3, 0]}) => (
  <g>
    {/* the cigarette end it rises from: filter, paper, glowing ember */}
    <Shape d="M 4 74 L 30 74 L 30 84 L 4 84 Q 1 79 4 74 Z" fill="#ffffff" shadow={0} />
    <Shape d="M 4 74 L 14 74 L 14 84 L 4 84 Q 1 79 4 74 Z" fill={CLOTH.tan} shadow={0} />
    <Shape d="M 30 74 L 36 74 Q 41 79 36 84 L 30 84 Z" fill="#df7449" shadow={0} />
    <TinyArm from={[-30, -22]} to={[-54, -4]} bend={[-52, -26]} fill={NIC} w={LW} />
    <TinyArm from={[30, -30]} to={[56, -52]} bend={[54, -28]} fill={NIC} w={LW} hand="open" />
    <Smoke fill={NIC} />
    {/* the bow tie */}
    <Shape d="M 6 2 L -8 -5 Q -10 2 -8 9 Z" fill="#c2655e" shadow={0.3} />
    <Shape d="M 6 2 L 20 -5 Q 22 2 20 9 Z" fill="#c2655e" shadow={0.3} />
    <Shape d={ring(6, 2, 3.8, 3.8, [1, 0.96, 1.03, 0.98, 1.02])} fill="#c2655e" shadow={0} />
    <Eyes x={0} y={-50} r={ER} mood={mood} look={look} />
    <Mouth x={1} y={-31} w={MW} kind={mouth} />
    <NameTag x={0} y={-15} text="Nicotine" size={8.6} />
  </g>
);

// ------------------------------------------------------------------ 8 tar: the mess left behind
const TAR = '#6a5042';
const TAR_BODY = 'M -46 30 C -54 0 -40 -44 0 -46 C 40 -48 56 -6 48 28 C 47 36 44 38 42 44 C 41 54 34 56 33 46 C 32 40 26 40 22 44 C 20 58 16 70 10 70 C 4 70 4 56 2 48 C 0 42 -10 42 -14 46 C -16 52 -22 54 -24 46 C -26 40 -32 40 -36 46 C -40 54 -48 50 -46 30 Z';
export const Tar: React.FC<V8Props> = ({mood = 'bored', mouth = 'open', look = [-0.3, 0.3]}) => (
  <g>
    <Shape d="M -54 74 C -52 64 52 64 56 74 C 52 84 -52 84 -54 74 Z" fill={TAR} shadow={0} />
    <TinyArm from={[-40, 4]} to={[-60, 34]} bend={[-60, 10]} fill={TAR} w={LW} hand="open" />
    <TinyArm from={[40, 4]} to={[60, 34]} bend={[60, 10]} fill={TAR} w={LW} hand="open" />
    <Shape d={TAR_BODY} fill={TAR} shadow={1.1}>
    </Shape>
    <Eyes x={0} y={-16} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={4} w={14} kind={mouth} />
    <NameTag x={0} y={27} text="Tar" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 9 alcohol: the party guest who wrecks the place
const ALC = '#e2ad5e';
const HAT = '#d68fa0';
const ALC_BODY = 'M 2 -56 C 12 -38 46 -12 46 18 C 46 46 26 62 0 62 C -26 62 -46 46 -46 18 C -46 -12 -8 -38 2 -56 Z';
export const Alcohol: React.FC<V8Props> = ({mood = 'dizzy', mouth = 'open', look = [0, 0]}) => (
  <g>
    <TinyLeg from={[-14, 56]} to={[8, 84]} fill={ALC} w={LW} foot={1} />
    <TinyLeg from={[14, 56]} to={[-8, 84]} fill={ALC} w={LW} foot={-1} />
    <TinyArm from={[-38, 2]} to={[-70, -18]} bend={[-64, 6]} fill={ALC} w={LW} hand="open" />
    <TinyArm from={[38, 2]} to={[66, -30]} bend={[64, -2]} fill={ALC} w={LW} hand="open" />
    <Shape d={ALC_BODY} fill={ALC} shadow={1.1} />
    {/* the party hat, slipping */}
    <Shape d="M -14 -46 L 22 -54 L 6 -84 Z" fill={HAT} shadow={0.4}>
      <path d="M -20 -60 L 30 -71 L 30 -65 L -20 -54 Z" fill={tint(HAT)} />
    </Shape>
    <Shape d={ring(6, -86, 4.5, 4.5, [1, 0.95, 1.04, 0.97, 1.02])} fill={tint(HAT)} shadow={0} />
    <Eyes x={0} y={-8} r={ER} mood={mood} look={look} />
    <Mouth x={2} y={14} w={14} kind={mouth} />
    <NameTag x={0} y={40} text="Alcohol" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 10 vaccine: the trainer
const GLASS = '#e3edf3';
const LIQ = '#9fcbe6';
const BARREL = 'M -26 -44 L 26 -44 Q 29 -44 29 -40 L 28 40 Q 28 46 22 46 L -22 46 Q -28 46 -28 40 L -29 -40 Q -29 -44 -26 -44 Z';
export const Vaccine: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.1, 0.1]}) => (
  <g>
    <Rods fill={CLOTH.grey} w={2} d={['M 0 54 L 0 74']} />
    <Shape d="M -8 45 L 8 45 L 6 55 L -6 55 Z" fill={CLOTH.grey} shadow={0} />
    <TinyLeg from={[-17, 40]} to={[-21, 82]} fill={GLASS} w={LW} foot={-1} />
    <TinyLeg from={[17, 40]} to={[21, 82]} fill={GLASS} w={LW} />
    <TinyArm from={[-24, -6]} to={[-50, 20]} bend={[-48, -4]} fill={GLASS} w={LW} hand="fist" />
    {/* the coach's whistle, raised */}
    <Shape d="M 44 -40 Q 44 -47 52 -47 L 67 -47 L 67 -42 L 59 -42 Q 60 -40.5 60 -39 Q 60 -33 52 -33 Q 44 -33 44 -40 Z" fill="#e6c25f" shadow={0.3} />
    <TinyArm from={[24, -10]} to={[50, -32]} bend={[50, -8]} fill={GLASS} w={LW} hand="fist" />
    {/* plunger */}
    <Shape d={rr(-5, -76, 10, 26, 2)} fill={CLOTH.grey} shadow={0} />
    <Shape d="M -18 -82 L 18 -82 Q 21 -79 18 -76 L -18 -76 Q -21 -79 -18 -82 Z" fill={CLOTH.grey} shadow={0} />
    <Shape d={BARREL} fill={GLASS} shadow={0.8}>
      <path d="M -40 -2 Q 0 2 40 -2 L 40 60 L -40 60 Z" fill={LIQ} />
      <path d="M 20 -2 L 40 -2 L 40 60 L 18 60 Q 23 30 20 -2 Z" fill={shade(LIQ)} />
      <path d="M -40 -2 Q 0 2 40 -2" {...INLINE} />
      {[-32, -20, -8, 4, 16, 28, 40].map((y, i) => <path key={y} d={`M -29 ${y} L ${i % 2 ? -23 : -19} ${y}`} {...INLINE} />)}
    </Shape>
    <Shape d="M -38 -52 L 38 -52 Q 41 -48 38 -44 L -38 -44 Q -41 -48 -38 -52 Z" fill={GLASS} shadow={0} />
    <Eyes x={0} y={-26} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={-8} w={MW} kind={mouth} />
    <NameTag x={0} y={33} text="Vaccine" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 11 antivenom: the rescue squad
const AV = '#a9d6bc';
const HELM = '#e0904f';
const VIAL = 'M -12 -44 L 12 -44 L 12 -36 Q 34 -32 35 -14 L 34 42 Q 33 52 22 52 L -22 52 Q -33 52 -34 42 L -35 -14 Q -34 -32 -12 -36 Z';
export const Antivenom: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0, 0.1]}) => (
  <g>
    <TinyLeg from={[-16, 46]} to={[-20, 82]} fill={AV} w={LW} foot={-1} />
    <TinyLeg from={[16, 46]} to={[20, 82]} fill={AV} w={LW} />
    <TinyArm from={[-30, 6]} to={[-52, 32]} bend={[-52, 8]} fill={AV} w={LW} hand="open" />
    <TinyArm from={[30, 2]} to={[54, -22]} bend={[54, 6]} fill={AV} w={LW} hand="fist" />
    <Shape d={VIAL} fill={AV} shadow={1} />
    {/* the rescue helmet */}
    <Shape d="M -28 -40 Q -30 -76 2 -76 Q 32 -76 30 -40 Z" fill={HELM} shadow={0.6} />
    <Shape d="M -34 -43 L 36 -43 Q 39 -39.5 36 -36 L -34 -36 Q -37 -39.5 -34 -43 Z" fill={HELM} shadow={0} />
    <Shape d={ring(1, -58, 9, 9, [1, 0.97, 1.02, 0.98, 1.03, 0.99])} fill="#ffffff" shadow={0} line="in" />
    <path d="M -1.3 -64 h 4.6 v 4.7 h 4.7 v 4.6 h -4.7 v 4.7 h -4.6 v -4.7 h -4.7 v -4.6 h 4.7 Z" fill="#c9504b" />
    <Eyes x={0} y={-14} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={5} w={MW} kind={mouth} />
    <NameTag x={0} y={28} text="Antivenom" size={8.6} />
  </g>
);

// ------------------------------------------------------------------ 12 creatine: the energy booster
const CRE = '#f1ede4';
const SCOOP = '#cfd3db';
const HEAP = 'M -42 -4 C -46 -30 -24 -50 0 -50 C 24 -50 46 -32 42 -4 Z';
const BOWL = 'M -46 -6 L 46 -6 Q 46 40 2 46 Q -44 42 -46 -6 Z';
export const Creatine: React.FC<V8Props> = ({mood = 'open', mouth = 'big', look = [0, -0.5]}) => (
  <g>
    <TinyLeg from={[-16, 38]} to={[-20, 82]} fill={SCOOP} w={LW} foot={-1} />
    <TinyLeg from={[16, 38]} to={[20, 82]} fill={SCOOP} w={LW} />
    {/* the scoop's handle */}
    <Rods fill={SCOOP} w={8} d={['M -44 10 L -72 20']} />
    {/* the tiny dumbbell */}
    <Rods fill={CLOTH.grey} w={3} d={['M -44 -78 L 44 -78']} />
    <Shape d={rr(-54, -88, 10, 20, 3)} fill="#5f6573" shadow={0} />
    <Shape d={rr(44, -88, 10, 20, 3)} fill="#5f6573" shadow={0} />
    <TinyArm from={[-34, -24]} to={[-30, -74]} bend={[-60, -46]} fill={CRE} w={LW} hand="fist" />
    <TinyArm from={[34, -24]} to={[30, -74]} bend={[60, -46]} fill={CRE} w={LW} hand="fist" />
    {/* the rounded heap of white powder, the character's head and face */}
    <Shape d={HEAP} fill={CRE} shadow={0.9}>
      {[[-28, -16], [26, -22], [-14, -40], [30, -8]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={1.8} fill={shade(CRE)} />)}
    </Shape>
    <Shape d={BOWL} fill={SCOOP} shadow={1}>
      <path d="M -60 4 L 60 4" {...INLINE} />
    </Shape>
    <Eyes x={0} y={-28} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={-12} w={10} kind={mouth} />
    <NameTag x={0} y={20} text="Creatine" size={9.5} />
  </g>
);

// ------------------------------------------------------------------ 13 water drop: the peacemaker
const WAT = '#a9d3ef';
const DROP = 'M 2 -70 C 14 -48 46 -16 46 16 C 46 46 24 60 0 60 C -24 60 -46 46 -46 16 C -46 -16 -10 -48 2 -70 Z';
const leaf = (x: number, y: number, a: number) => `M ${x} ${y} ` + (() => {
  const r = (a * Math.PI) / 180, c = Math.cos(r), s = Math.sin(r);
  const pt = (u: number, v: number) => `${f(x + u * c - v * s)} ${f(y + u * s + v * c)}`;
  return `Q ${pt(7, -6)} ${pt(15, 0)} Q ${pt(7, 6)} ${pt(0, 0)} Z`;
})();
export const Water: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0, 0.1]}) => (
  <g>
    <TinyLeg from={[-16, 54]} to={[-20, 84]} fill={WAT} w={LW} foot={-1} />
    <TinyLeg from={[16, 54]} to={[20, 84]} fill={WAT} w={LW} />
    <TinyArm from={[-38, 6]} to={[-62, -14]} bend={[-62, 8]} fill={WAT} w={LW} hand="open" />
    {/* the olive branch */}
    <Rods fill="#8a6a48" w={2.6} d={['M 60 -4 Q 62 -26 70 -46']} />
    {[[62, -20, -150], [64, -28, -20], [66, -36, -160], [68, -42, -40]].map(([x, y, a], i) => <Shape key={i} d={leaf(x, y, a)} fill={CLOTH.olive} shadow={0} />)}
    <TinyArm from={[38, 6]} to={[60, -10]} bend={[62, 14]} fill={WAT} w={LW} hand="fist" />
    <Shape d={DROP} fill={WAT} shadow={1.1} />
    <Eyes x={0} y={-6} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={14} w={MW} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ 14 pill: the helper on a mission
const PTOP = '#5fae9f';
const PBOT = '#f1ede4';
export const Pill: React.FC<V8Props> = ({mood = 'open', mouth = 'smile', look = [0.7, 0.2]}) => (
  <g>
    <TinyLeg from={[-14, 50]} to={[-16, 84]} fill={PBOT} w={LW} foot={-1} />
    <TinyLeg from={[14, 50]} to={[16, 84]} fill={PBOT} w={LW} />
    <TinyArm from={[-26, 0]} to={[-60, -24]} bend={[-52, 4]} fill={PBOT} w={LW} hand="open" />
    <Shape d="M -30 -6 L -31 -38 C -31 -80 31 -80 31 -38 L 30 -6 Z" fill={PTOP} shadow={1} />
    <Shape d="M -30 -6 L 30 -6 L 30 24 C 30 64 -30 64 -30 24 Z" fill={PBOT} shadow={1} />
    {/* the map */}
    <Shape d="M 44 -6 L 56 -10 L 68 -6 L 80 -10 L 80 20 L 68 24 L 56 20 L 44 24 Z" fill="#e2c99a" shadow={0}>
      <path d="M 56 -10 L 56 20 M 68 -6 L 68 24" {...INLINE} />
      <path d="M 48 16 Q 56 4 62 12 T 74 2" {...INLINE} strokeDasharray="2.5 3" />
    </Shape>
    <path d="M 72 -2 l 5 5 M 77 -2 l -5 5" {...INLINE} />
    <TinyArm from={[26, 10]} to={[46, 4]} bend={[42, 26]} fill={PBOT} w={LW} hand="fist" />
    <Eyes x={0} y={8} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={27} w={MW} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ 15 poop: blunt and proud
const POO = '#9a6b4b';
const POOP = 'M -50 58 C -68 56 -66 28 -46 24 C -58 14 -50 -10 -30 -10 C -40 -24 -26 -42 -8 -40 C -6 -52 4 -60 14 -64 C 12 -54 20 -46 22 -38 C 36 -34 42 -18 30 -10 C 50 -8 58 12 44 24 C 66 28 68 56 50 58 C 20 62 -20 62 -50 58 Z';
export const Poop: React.FC<V8Props> = ({mood = 'happy', mouth = 'smile', look = [0, 0]}) => (
  <g>
    <TinyLeg from={[-20, 56]} to={[-22, 84]} fill={POO} w={LW} foot={-1} />
    <TinyLeg from={[20, 56]} to={[22, 84]} fill={POO} w={LW} />
    <Shape d={POOP} fill={POO} shadow={1.1}>
      <path d="M -46 24 Q 0 34 44 24" {...INLINE} />
      <path d="M -30 -10 Q 0 -2 30 -10" {...INLINE} />
    </Shape>
    {/* hands on hips */}
    <TinyArm from={[-53, 6]} to={[-58, 34]} bend={[-78, 18]} fill={POO} w={LW} hand="fist" />
    <TinyArm from={[52, 6]} to={[57, 34]} bend={[77, 18]} fill={POO} w={LW} hand="fist" />
    {/* the rosette */}
    <Shape d="M 22 44 L 18 58 L 23 55 L 26 60 L 28 46 Z" fill="#5b8cc4" shadow={0} />
    <Shape d={scallop(26, 40, 6, 9, 1.4)} fill="#5b8cc4" shadow={0} />
    <circle cx={26} cy={40} r={3} fill={tint('#5b8cc4', 0.5)} {...EDGE_IN} />
    <Eyes x={0} y={-4} r={ER} mood={mood} look={look} />
    <Mouth x={0} y={13} w={14} kind={mouth} />
  </g>
);

// ------------------------------------------------------------------ registry and board
export const GERMS: Record<string, React.FC<V8Props>> = {
  virus: Virus, bacteria: Bacteria, fungus: Fungus, worm: Worm, allergen: Allergen,
  venom: Venom, nicotine: Nicotine, tar: Tar, alcohol: Alcohol, poop: Poop,
  vaccine: Vaccine, antivenom: Antivenom, creatine: Creatine, water: Water, pill: Pill,
};

const CELLS: {C: React.FC<V8Props>; name: string; role: string; extra?: 'angry' | 'scared'}[] = [
  {C: Virus, name: 'Virus', role: 'the sneaky intruder', extra: 'angry'},
  {C: Bacteria, name: 'Bacteria', role: 'the sugar-loving troublemaker', extra: 'scared'},
  {C: Fungus, name: 'Fungus', role: 'the slow creeper'},
  {C: Worm, name: 'Parasite worm', role: 'the freeloader at your table'},
  {C: Allergen, name: 'Allergen', role: 'looks harmless, is not'},
  {C: Venom, name: 'Venom', role: 'silent and quick'},
  {C: Nicotine, name: 'Nicotine', role: 'the charming trickster'},
  {C: Tar, name: 'Tar', role: 'the mess left behind'},
  {C: Alcohol, name: 'Alcohol', role: 'the party guest who wrecks it'},
  {C: Poop, name: 'Poop', role: 'blunt and proud'},
  {C: Vaccine, name: 'Vaccine', role: 'the immune system’s trainer'},
  {C: Antivenom, name: 'Antivenom', role: 'the rescue squad'},
  {C: Creatine, name: 'Creatine', role: 'the energy booster'},
  {C: Water, name: 'Water drop', role: 'the peacemaker'},
  {C: Pill, name: 'Pill', role: 'the helper on a mission'},
];

// two white panels: villains and threats (two rows), helpers (one row)
const P1 = {y: 170, h: 564};
const P2 = {y: 750, h: 284};
const COL = (i: number) => 56 + 180.8 + i * 361.6;
const ROWY = [P1.y + 128, P1.y + 128 + 276, P2.y + 128];
const SIZE = 220;
const MINI = 150;

export const GermsBoard: React.FC = () => (
  <Board
    kicker="Cast · germs, threats and helpers"
    title="Fifteen job characters: villains, threats and helpers"
    note="Villains and threats look sly or mean through the eyes · helpers look kind · a body that says what it is, one job piece, a name tag where needed"
  >
    <Panel x={56} y={P1.y} w={1808} h={P1.h} label="Villains and threats" />
    <Panel x={56} y={P2.y} w={1808} h={P2.h} label="Helpers" />
    {CELLS.map(({C, name, role, extra}, k) => {
      const cx = COL(k % 5), cy = ROWY[Math.floor(k / 5)];
      return (
        <React.Fragment key={name}>
          <Fig x={extra ? cx - 70 : cx} y={cy} size={SIZE}><C /></Fig>
          {extra && (
            <Fig x={cx + 110} y={cy - 4} size={MINI}>
              {extra === 'angry' ? <C mood="angry" mouth="grit" look={[0, 0.2]} /> : <C mood="scared" mouth="o" look={[0, 0]} />}
            </Fig>
          )}
          <Caption x={cx} y={cy + 100} name={name} note={role} w={320} size={22} />
        </React.Fragment>
      );
    })}
  </Board>
);
