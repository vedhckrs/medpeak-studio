/**
 * MedPeak Toons, look v8: the new cast of "What Happens If You Don't Sleep" (`no-sleep`).
 *   Gunk        the brain's waste (beta-amyloid), the villain; it GROWS: stage 0 small, 1 piled, 2 huge
 *   NightCrew   three droplets of brain fluid with one job piece each (mop, bucket, scrub brush) and
 *               the crew's uniform: a night-shift headband with a small lamp
 * Drawn only with the shared kit (./kit): flat fill, one shade crescent, the ink outline, the kit face.
 */
import React from 'react';
import {Board, Caption, CLOTH, EDGE_IN, Eyes, Fig, INK, INLINE, Mouth, Panel, Shape, shade, tint, TinyArm, TinyLeg, type V8Props} from './kit';
import {Brain} from './organs-a';
import {Melatonin} from './cells';

type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;

/** A puffy outline: soft scallops round an ellipse (each radius nudged by k). */
const puff = (cx: number, cy: number, rx: number, ry: number, k: number[], bulge = 1.26, a0 = -Math.PI / 2): string => {
  const n = k.length;
  const pt = (a: number, m: number): P => [cx + Math.cos(a) * rx * m, cy + Math.sin(a) * ry * m];
  const ang = (i: number) => a0 + (i * 2 * Math.PI) / n;
  const p0 = pt(ang(0), k[0]);
  let d = `M ${f(p0[0])} ${f(p0[1])}`;
  for (let i = 0; i < n; i++) {
    const c = pt((ang(i) + ang(i + 1)) / 2, ((k[i] + k[(i + 1) % n]) / 2) * bulge);
    const e = pt(ang(i + 1), k[(i + 1) % n]);
    d += ` Q ${f(c[0])} ${f(c[1])} ${f(e[0])} ${f(e[1])}`;
  }
  return d + ' Z';
};

/** A thin coloured line with the ink outline round it (a strand, a mop handle). */
const Rod: React.FC<{d: string; fill: string; w?: number}> = ({d, fill, w = 4.5}) => (
  <g>
    <path d={d} stroke={INK} strokeWidth={w + 2.4} strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <path d={d} stroke={fill} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" fill="none" />
  </g>
);

const ER = 11;
const MW = 12;

export const SLEEP_COL = {
  gunk: '#a89c8f', // grey-taupe grime (dust and dirt): not the virus purple, not the cholesterol beige, not a green plant
  gunkSpot: '#8a7d70',
  fluid: '#bfe8e6', // brain fluid: paler and greener than the drinking-water blue
  lamp: '#ffe08a',
  band: CLOTH.navy,
  mop: '#f1ede4',
  wood: '#b98a5a',
  bucket: CLOTH.orange,
  brush: CLOTH.yellow,
};

// ================================================================== Gunk: the waste that piles up
/**
 * stage 0: one small lump (the start of the night). 1: piled, three lumps and sticky strands.
 * 2: huge, five lumps, strands reaching out both sides, drips. The face stays on the front lump,
 * the same size at every stage (the kit face), so the growth reads as MORE GUNK, not a bigger face.
 */
export const Gunk: React.FC<V8Props & {stage?: 0 | 1 | 2}> = ({mood = 'angry', mouth = 'grit', look = [0.2, 0.2], stage = 1}) => {
  const C = SLEEP_COL.gunk;
  const front = puff(0, 16, 54, 44, [1, 0.95, 1.04, 0.97, 1.02, 0.96, 1.03], 1.12);
  const back: {d: string; s: number; c: P; r: number}[] = [];
  const lump = (cx: number, cy: number, rx: number, ry: number, k: number[]) => ({d: puff(cx, cy, rx, ry, k, 1.1), s: 0.6, c: [cx, cy] as P, r: rx});
  if (stage >= 1) {
    back.push(lump(-50, 0, 36, 30, [1, 0.94, 1.05, 0.97, 1.02]));
    back.push(lump(48, -6, 32, 28, [0.97, 1.04, 0.95, 1.03, 0.99]));
  }
  if (stage >= 2) {
    back.unshift(lump(-4, -40, 46, 34, [1, 0.95, 1.04, 0.96, 1.03, 0.97]));
    back.unshift(lump(-80, 30, 30, 26, [1.03, 0.95, 1.02, 0.97, 1.01]));
    back.push(lump(80, 28, 28, 24, [0.98, 1.03, 0.96, 1.02, 0.99]));
  }
  const strands = stage >= 1 ? ['M -66 -10 Q -90 -2 -96 18', 'M 66 -14 Q 92 -10 98 6'] : [];
  if (stage >= 2) strands.push('M -100 30 Q -112 44 -108 60', 'M 102 26 Q 114 42 110 58');
  const spots: P[] = [[-30, 34], [28, 40], [38, 4]];
  return (
    <g transform={`translate(0 ${stage === 2 ? 4 : 0})`}>
      {strands.map((d, i) => <Rod key={i} d={d} fill={C} w={4} />)}
      {back.map((b, i) => (
        <g key={i}>
          <Shape d={b.d} fill={shade(C, 0.04)} shadow={b.s} />
          <path d={`M ${b.c[0] - b.r * 0.5} ${b.c[1] - b.r * 0.35} q ${b.r * 0.2} ${-b.r * 0.3} ${b.r * 0.5} ${-b.r * 0.38}`} stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" opacity={0.85} />
          <path d={`M ${b.c[0] + b.r * 0.3} ${b.c[1] + b.r * 0.75} C ${b.c[0] + b.r * 0.34} ${b.c[1] + b.r * 0.95} ${b.c[0] + b.r * 0.36} ${b.c[1] + b.r * 1.05} ${b.c[0] + b.r * 0.36} ${b.c[1] + b.r * 1.12} a 5 5 0 0 1 -10 0 C ${b.c[0] + b.r * 0.36 - 10} ${b.c[1] + b.r * 1.0} ${b.c[0] + b.r * 0.3 - 3} ${b.c[1] + b.r * 0.9} ${b.c[0] + b.r * 0.3} ${b.c[1] + b.r * 0.75} Z`} fill={shade(C, 0.04)} {...EDGE_IN} />
        </g>
      ))}
      <TinyArm from={[-46, 20]} to={[-70, -6]} bend={[-72, 18]} fill={C} hand="fist" />
      <TinyLeg from={[-20, 56]} to={[-24, 80]} fill={C} foot={-1} />
      <TinyLeg from={[20, 56]} to={[24, 80]} fill={C} />
      <Shape d={front} fill={C} shadow={1.1}>
        {spots.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 2 ? 4.5 : 6} fill={SLEEP_COL.gunkSpot} />)}
        <path d="M -34 -12 q 8 -14 24 -16" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" />
        <path d="M -18 -2 q 2 -4 6 -6" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" fill="none" />
      </Shape>
      {/* the sticky drip under the front lump */}
      <path d="M 40 50 C 44 58 46 64 46 68 A 6 6 0 0 1 34 68 C 34 64 36 58 40 50 Z" fill={C} {...EDGE_IN} />
      {stage >= 2 && <path d="M -44 46 C -41 52 -40 56 -40 59 A 5 5 0 0 1 -50 59 C -50 56 -48 52 -44 46 Z" fill={C} {...EDGE_IN} />}
      <TinyArm from={[46, 18]} to={[72, -8]} bend={[74, 16]} fill={C} hand="fist" />
      <Eyes x={0} y={-2} r={ER} mood={mood} look={look} brows />
      <Mouth x={0} y={26} w={MW + 2} kind={mouth} />
    </g>
  );
};

// ================================================================== the night crew: three droplets of brain fluid
const DROP = 'M 2 -64 C 14 -42 44 -12 44 18 C 44 46 24 60 0 60 C -24 60 -44 46 -44 18 C -44 -12 -10 -42 2 -64 Z';

/** The crew's uniform: a navy headband with a small lamp in front (the night shift). */
const Headlamp: React.FC = () => (
  <g>
    <path d="M -34 -20 Q 0 -30 34 -20 L 32 -10 Q 0 -20 -32 -10 Z" fill={SLEEP_COL.band} {...EDGE_IN} />
    <rect x={-9} y={-34} width={18} height={14} rx={4} fill={CLOTH.charcoal} {...EDGE_IN} />
    <circle cx={0} cy={-27} r={5} fill={SLEEP_COL.lamp} {...EDGE_IN} />
  </g>
);

type Job = 'mop' | 'bucket' | 'brush';
export const NightCrew: React.FC<V8Props & {job?: Job}> = ({mood = 'open', mouth = 'smile', look = [0.3, 0.1], job = 'mop'}) => {
  const W = SLEEP_COL.fluid;
  return (
    <g>
      <TinyLeg from={[-16, 54]} to={[-20, 82]} fill={W} foot={-1} />
      <TinyLeg from={[16, 54]} to={[20, 82]} fill={W} />
      {job === 'mop' && (
        <g>
          <Rod d="M 58 -60 L 50 66" fill={SLEEP_COL.wood} w={4.5} />
          {/* the mop head: soft strands */}
          <Shape d="M 34 64 Q 50 58 66 64 L 72 88 Q 64 84 60 90 Q 54 84 48 90 Q 42 84 36 90 Q 30 84 28 88 Z" fill={SLEEP_COL.mop} shadow={0.5}>
            <path d="M 42 68 L 40 86 M 50 66 L 50 86 M 58 68 L 60 86" {...INLINE} />
          </Shape>
        </g>
      )}
      {job === 'brush' && (
        <g transform="translate(-62 26) rotate(-28)">
          <Shape d="M -26 -10 L 26 -10 Q 30 -10 30 -6 L 30 6 Q 30 10 26 10 L -26 10 Q -30 10 -30 6 L -30 -6 Q -30 -10 -26 -10 Z" fill={SLEEP_COL.brush} shadow={0.5} />
          <path d="M -24 10 L -24 22 M -14 10 L -14 22 M -4 10 L -4 22 M 6 10 L 6 22 M 16 10 L 16 22 M 26 10 L 26 22" {...INLINE} />
        </g>
      )}
      <TinyArm from={[-38, 8]} to={job === 'brush' ? [-58, 24] : [-62, -10]} bend={job === 'brush' ? [-56, 4] : [-62, 10]} fill={W} hand={job === 'brush' ? 'fist' : 'open'} />
      <Shape d={DROP} fill={W} shadow={1.1}>
        <path d="M -24 -6 q 4 -14 14 -22" {...INLINE} stroke="#ffffff" strokeWidth={4} />
      </Shape>
      <g transform="translate(0 -6)"><Headlamp /></g>
      <Eyes x={0} y={6} r={ER - 1} mood={mood} look={look} />
      <Mouth x={0} y={28} w={MW} kind={mouth} />
      {job === 'bucket' && (
        <g transform="translate(62 30)">
          <path d="M -16 -20 Q 0 -44 16 -20" {...INLINE} />
          <Shape d="M -20 -20 L 20 -20 L 15 22 Q 0 26 -15 22 Z" fill={SLEEP_COL.bucket} shadow={0.6}>
            <path d="M -19 -12 L 19 -12" {...INLINE} />
          </Shape>
          {/* splashing fluid over the rim */}
          <path d="M -12 -20 Q -8 -32 0 -24 Q 8 -34 12 -20 Z" fill={tint(W, 0.2)} {...EDGE_IN} />
        </g>
      )}
      <TinyArm from={[38, 8]} to={job === 'mop' ? [54, -14] : job === 'bucket' ? [58, 6] : [62, -6]} bend={job === 'mop' ? [58, 6] : [54, 22]} fill={W} hand="fist" />
    </g>
  );
};

// ================================================================== the approval sheet
const FIG = 250;
export const SleepCastBoard: React.FC = () => {
  const gunk: {s: 0 | 1 | 2; name: string; note: string; mood: V8Props['mood']; mouth: V8Props['mouth']}[] = [
    {s: 0, name: 'Gunk, evening', note: 'one small lump: the day\'s waste', mood: 'angry', mouth: 'smile'},
    {s: 1, name: 'Gunk, 2 a.m.', note: 'no sleep, no wash: it piles up', mood: 'angry', mouth: 'grit'},
    {s: 2, name: 'Gunk, morning', note: 'after a night awake: huge, sticky', mood: 'happy', mouth: 'big'},
  ];
  const crew: {job: Job; name: string; note: string}[] = [
    {job: 'mop', name: 'Crew: the mopper', note: 'mops the gaps between cells'},
    {job: 'bucket', name: 'Crew: the carrier', note: 'carries the waste away'},
    {job: 'brush', name: 'Crew: the scrubber', note: 'scrubs off the sticky bits'},
  ];
  const fy = 200 + 60 + FIG / 2;
  return (
    <Board
      kicker="No sleep · new cast · sheet 1"
      title="Gunk and the night crew"
      note="Gunk is the brain's waste (beta-amyloid) and grows each scene: more lumps, not a bigger face. The night crew are droplets of brain fluid that wash the gaps while you sleep; uniform: a night-shift headband with a lamp."
      page="no-sleep · cast"
    >
      <Panel x={56} y={200} w={880} h={480} label="Gunk grows" />
      {gunk.map((g, i) => {
        const x = 56 + 150 + i * 290;
        return (
          <React.Fragment key={g.name}>
            <Fig x={x} y={fy} size={FIG}><Gunk stage={g.s} mood={g.mood} mouth={g.mouth} /></Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={g.name} note={g.note} size={21} w={270} />
          </React.Fragment>
        );
      })}
      <Panel x={984} y={200} w={880} h={480} label="The night crew" />
      {crew.map((c, i) => {
        const x = 984 + 150 + i * 290;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}><NightCrew job={c.job} mood={i === 1 ? 'happy' : 'open'} look={i === 2 ? [-0.5, 0.2] : [0.3, 0.1]} /></Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={270} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={712} w={1808} h={330} label="With the existing cast, at the same size (one family)" />
      {[
        {el: <Gunk stage={1} />, name: 'Gunk'},
        {el: <NightCrew job="mop" />, name: 'Night crew'},
        {el: <Brain mood="scared" mouth="o" />, name: 'Brain (exists)'},
        {el: <Melatonin />, name: 'Melatonin (exists)'},
      ].map((c, i) => {
        const x = 56 + 260 + i * 430;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={862} size={200}>{c.el}</Fig>
            <Caption x={x} y={968} name={c.name} size={20} w={300} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
