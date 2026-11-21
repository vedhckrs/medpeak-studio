/**
 * MedPeak Toons, look v8: the new cast of "What Happens When You Take Creatine" (`creatine`).
 *   Crea      the hero: one white crystal grain of creatine (it is a white crystalline powder), faceted,
 *             cheeky and proud. `carry` puts a yellow spark (the energy it hands over) in its arms.
 *   Battery   the muscle's tiny battery (ATP). The shell fills from the bottom with its charge:
 *             green full, yellow half, red flat. `charging` adds a small bolt beside it.
 *             `face={false}` is the faceless crowd version for the background of the muscle cell.
 *   Muscle    one muscle fibre with a face: a striped spindle with pale tendons at both ends.
 *             `flex` 0..1 shortens and thickens it (a contraction).
 * Drawn only with the shared kit (./kit): flat fill, one shade crescent, the ink outline, the kit face.
 */
import React from 'react';
import {Board, Caption, CLOTH, EDGE_IN, Eyes, Fig, FONT, INK, INLINE, Mouth, Panel, Shape, shade, tint, TinyArm, TinyLeg, type V8Props} from './kit';
import {Kidney} from './organs-a';

type P = [number, number];
const f = (n: number) => Math.round(n * 10) / 10;
const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

/** A polygon with softly rounded corners (r = how far each corner is cut). */
export const roundPoly = (pts: P[], r: number): string => {
  const n = pts.length;
  const cut = (a: P, b: P, k: number): P => {
    const L = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const u = Math.min(k, L / 2) / L;
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  };
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = pts[i], prev = pts[(i - 1 + n) % n], next = pts[(i + 1) % n];
    const a = cut(p, prev, r), b = cut(p, next, r);
    d += `${i ? ' L' : 'M'} ${f(a[0])} ${f(a[1])} Q ${f(p[0])} ${f(p[1])} ${f(b[0])} ${f(b[1])}`;
  }
  return d + ' Z';
};

export const CREA_COL = {
  crystal: '#eef4fb', // the front face: white with a cool touch, so it reads on a white board and on pink tissue
  top: '#ffffff', // the top facet catches the light
  side: '#d3e0ee', // the left facet
  spark: CLOTH.yellow,
  full: '#5cc46a',
  half: '#f2c94c',
  flat: '#e8574f',
  shell: '#e9e4dc',
  muscle: '#d8666b',
  tendon: '#f2e6d4',
};

// ================================================================== the spark (the energy Crea hands to a battery)
/** A chunky lightning bolt, about 60 units tall, centred on (0, 0). */
export const Spark: React.FC<{s?: number}> = ({s = 1}) => (
  <g transform={`scale(${s})`}>
    <Shape d={roundPoly([[8, -32], [-16, 4], [-2, 4], [-10, 32], [16, -6], [2, -6]], 2.5)} fill={CREA_COL.spark} shadow={0.5} />
  </g>
);

// ================================================================== Crea: one crystal grain
// the outline of the grain and its two upper facets (the front is what is left)
const GRAIN: P[] = [[-56, -26], [-22, -64], [34, -62], [62, -24], [58, 44], [18, 68], [-38, 64], [-62, 28]];
const TOP: P[] = [[-56, -26], [-22, -64], [34, -62], [62, -24], [14, -14], [-34, -16]];
const LEFT: P[] = [[-56, -26], [-34, -16], [-40, 58], [-38, 64], [-62, 28]];

export const Crea: React.FC<V8Props & {carry?: boolean}> = ({mood = 'happy', mouth = 'smile', look = [0.2, 0.1], carry}) => {
  const C = CREA_COL.crystal;
  return (
    <g>
      <TinyLeg from={[-18, 62]} to={[-22, 86]} fill={C} foot={-1} />
      <TinyLeg from={[22, 62]} to={[26, 86]} fill={C} />
      {!carry && <TinyArm from={[-56, 10]} to={[-80, -14]} bend={[-82, 10]} fill={C} hand="open" />}
      <Shape d={roundPoly(GRAIN, 7)} fill={C} shadow={1}>
        <path d={roundPoly(TOP, 3)} fill={CREA_COL.top} />
        <path d={roundPoly(LEFT, 3)} fill={CREA_COL.side} />
        <path d="M -56 -26 L -34 -16 L 14 -14 L 62 -24 M -34 -16 L -40 60" {...INLINE} />
        {/* the glint: a small four-point star on the top facet */}
        <path d="M 28 -50 L 31 -42 L 39 -39 L 31 -36 L 28 -28 L 25 -36 L 17 -39 L 25 -42 Z" fill="#ffffff" {...EDGE_IN} />
        <path d="M 40 4 L 46 -2 M 44 18 L 52 10" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" />
      </Shape>
      <Eyes x={10} y={10} r={12} mood={mood} look={look} brows />
      <Mouth x={10} y={36} w={13} kind={mouth} />
      {carry ? (
        <g>
          <g transform="translate(-2 -86) rotate(8)"><Spark s={1.15} /></g>
          <TinyArm from={[-50, -6]} to={[-22, -66]} bend={[-56, -40]} fill={C} hand="mitten" />
          <TinyArm from={[54, -8]} to={[22, -66]} bend={[62, -40]} fill={C} hand="mitten" />
        </g>
      ) : (
        <TinyArm from={[58, 8]} to={[84, 30]} bend={[82, 4]} fill={C} hand="fist" />
      )}
    </g>
  );
};

/** A faceless small grain for crowds (the stream in the blood, the scoop). */
export const Grain: React.FC<{seed?: number}> = ({seed = 0}) => {
  const k = (i: number) => 1 + Math.sin(i * 2.3 + seed * 1.7) * 0.12;
  const pts = GRAIN.map(([x, y], i) => [x * k(i), y * k(i + 3)] as P);
  return (
    <Shape d={roundPoly(pts, 7)} fill={CREA_COL.crystal} shadow={1}>
      <path d={roundPoly(TOP.map(([x, y], i) => [x * k(i), y * k(i + 3)] as P), 3)} fill={CREA_COL.top} />
      <path d="M -56 -26 L -34 -16 L 14 -14 L 62 -24" {...INLINE} />
    </Shape>
  );
};

// ================================================================== the battery (ATP)
export const chargeColour = (c: number) => (c > 0.6 ? CREA_COL.full : c > 0.3 ? CREA_COL.half : CREA_COL.flat);
const SHELL = 'M -40 -50 Q -40 -64 -26 -64 L 26 -64 Q 40 -64 40 -50 L 40 58 Q 40 72 26 72 L -26 72 Q -40 72 -40 58 Z';

export const Battery: React.FC<V8Props & {charge?: number; charging?: boolean; face?: boolean}> = ({mood = 'open', mouth = 'smile', look = [0, 0], charge = 1, charging, face = true}) => {
  const c = clamp01(charge);
  const top = 70 - c * 128; // the level, from y 70 (empty) to y -58 (full)
  const col = chargeColour(c);
  return (
    <g>
      {face && <TinyLeg from={[-16, 70]} to={[-18, 90]} fill={CREA_COL.shell} foot={-1} />}
      {face && <TinyLeg from={[16, 70]} to={[18, 90]} fill={CREA_COL.shell} />}
      {face && <TinyArm from={[-38, 8]} to={[-62, c < 0.3 ? 30 : -14]} bend={[-62, 10]} fill={CREA_COL.shell} hand={c < 0.3 ? 'mitten' : 'open'} />}
      <Shape d="M -16 -64 L -16 -74 Q -16 -78 -12 -78 L 12 -78 Q 16 -78 16 -74 L 16 -64 Z" fill={CLOTH.charcoal} shadow={0} />
      <Shape d={SHELL} fill={CREA_COL.shell} shadow={1}>
        {c > 0.01 && <path d={`M -44 ${f(top)} Q -20 ${f(top - 6)} 0 ${f(top)} T 44 ${f(top)} L 44 80 L -44 80 Z`} fill={col} />}
        {c > 0.01 && <path d={`M -44 ${f(top)} Q -20 ${f(top - 6)} 0 ${f(top)} T 44 ${f(top)}`} {...INLINE} />}
        {/* the label band: ATP, the battery's real name */}
        <rect x={-40} y={-56} width={80} height={20} fill="#ffffff" />
        <path d="M -40 -56 H 40 M -40 -36 H 40" {...INLINE} />
        <text x={0} y={-40.5} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={15} fill={INK} letterSpacing={1}>ATP</text>
        <path d="M -28 -26 Q -32 0 -28 40" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.7} />
      </Shape>
      {face && (
        <>
          <Eyes x={0} y={4} r={11} mood={mood} look={look} brows={mood === 'scared' || mood === 'angry'} />
          <Mouth x={0} y={28} w={12} kind={mouth} />
          <TinyArm from={[38, 8]} to={[62, c < 0.3 ? 30 : -14]} bend={[62, 10]} fill={CREA_COL.shell} hand={c < 0.3 ? 'mitten' : 'open'} />
        </>
      )}
      {charging && <g transform="translate(62 -50) rotate(14)"><Spark s={0.8} /></g>}
    </g>
  );
};

// ================================================================== Muscle: one muscle fibre with a face
export const Muscle: React.FC<V8Props & {flex?: number}> = ({mood = 'open', mouth = 'smile', look = [0, 0], flex = 0}) => {
  const k = clamp01(flex);
  const half = 70 - k * 12; // half length of the belly
  const thick = 46 + k * 16; // half height at the middle
  const M = CREA_COL.muscle;
  const body = `M ${-half - 18} 0 C ${-half} ${-thick * 0.5} ${-half * 0.55} ${-thick} 0 ${-thick} C ${half * 0.55} ${-thick} ${half} ${-thick * 0.5} ${half + 18} 0 C ${half} ${thick * 0.5} ${half * 0.55} ${thick} 0 ${thick} C ${-half * 0.55} ${thick} ${-half} ${thick * 0.5} ${-half - 18} 0 Z`;
  const tendon = (s: 1 | -1) => `M ${s * (half + 6)} -10 L ${s * (half + 34)} -7 Q ${s * (half + 40)} 0 ${s * (half + 34)} 7 L ${s * (half + 6)} 10 Z`;
  const stripes: number[] = [];
  for (let x = -half + 2; x <= half - 2; x += 11) if (Math.abs(x) > 36) stripes.push(x);
  return (
    <g>
      <TinyLeg from={[-16, thick - 6]} to={[-20, thick + 22]} fill={M} foot={-1} />
      <TinyLeg from={[16, thick - 6]} to={[20, thick + 22]} fill={M} />
      <Shape d={tendon(-1)} fill={CREA_COL.tendon} shadow={0.4} />
      <Shape d={tendon(1)} fill={CREA_COL.tendon} shadow={0.4} />
      <Shape d={body} fill={M} shadow={1.1}>
        {stripes.map((x, i) => {
          const h = thick * Math.sqrt(Math.max(0, 1 - (x / (half + 10)) ** 2));
          return <path key={i} d={`M ${f(x)} ${f(-h)} Q ${f(x + 3)} 0 ${f(x)} ${f(h)}`} stroke={i % 2 ? shade(M, 0.18) : tint(M, 0.18)} strokeWidth={i % 2 ? 4.5 : 3} fill="none" />;
        })}
        <path d={`M ${-half * 0.6} ${-thick * 0.62} Q 0 ${-thick * 0.9} ${half * 0.6} ${-thick * 0.62}`} stroke="#ffffff" strokeWidth={4.5} strokeLinecap="round" fill="none" opacity={0.8} />
      </Shape>
      {/* arms from the upper sides: flexed = elbow out, fist up beside the face; relaxed = hanging at the lower sides */}
      {([-1, 1] as const).map((s) => k > 0.4 ? (
        <TinyArm key={s} from={[s * half * 0.62, -thick * 0.55]} bend={[s * (half + 56), -thick * 0.15]} to={[s * (half + 16), -thick - 16]} fill={M} hand="fist" />
      ) : (
        <TinyArm key={s} from={[s * half * 0.6, thick * 0.6]} bend={[s * (half * 0.8 + 10), thick * 0.95]} to={[s * (half * 0.9 + 14), thick + 8]} fill={M} hand="mitten" />
      ))}
      <Eyes x={0} y={-6} r={11} mood={mood} look={look} brows />
      <Mouth x={0} y={18} w={12} kind={mouth} />
    </g>
  );
};

// ================================================================== the approval sheet
const FIG = 250;
export const CreaCastBoard: React.FC = () => {
  const fy = 200 + 60 + FIG / 2;
  const crea: {el: React.ReactNode; name: string; note: string}[] = [
    {el: <Crea mood="happy" mouth="big" />, name: 'Crea, proud', note: '"Take me? The scale jumps!"'},
    {el: <Crea carry mood="angry" mouth="grit" look={[0.4, -0.4]} />, name: 'Crea, carrying a spark', note: 'hands energy to a battery'},
    {el: <Crea mood="wink" mouth="tongue" look={[-0.3, 0.2]} />, name: 'Crea, cheeky', note: 'the loop line at the end'},
  ];
  const batt: {el: React.ReactNode; name: string; note: string}[] = [
    {el: <Battery charge={1} mood="happy" mouth="open" />, name: 'Battery, full', note: 'green: ready for a lift'},
    {el: <Battery charge={0.12} mood="scared" mouth="wavy" look={[0, -0.5]} />, name: 'Battery, going flat', note: 'red: "We\'re going flat!"'},
    {el: <Battery charge={0.55} charging mood="happy" mouth="big" look={[0.5, -0.4]} />, name: 'Battery, recharging', note: 'Crea\'s spark refills it'},
  ];
  return (
    <Board
      kicker="Creatine · new cast · sheet 1"
      title="Crea, the batteries and Muscle"
      note="Crea is one white crystal grain of creatine (the real thing is a white crystalline powder). The batteries are the muscle's energy (ATP, printed on each): they fill green when full and drain to red in a hard lift. Muscle is one striped muscle fibre with pale tendons."
      page="creatine · cast"
    >
      <Panel x={56} y={200} w={880} h={480} label="Crea" />
      {crea.map((c, i) => {
        const x = 56 + 150 + i * 290;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}>{c.el}</Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={270} />
          </React.Fragment>
        );
      })}
      <Panel x={984} y={200} w={880} h={480} label="The batteries (ATP)" />
      {batt.map((c, i) => {
        const x = 984 + 150 + i * 290;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}>{c.el}</Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={270} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={712} w={1808} h={330} label="Muscle, and the whole family at the same size" />
      {[
        {el: <Muscle mood="scared" mouth="grit" flex={1} look={[0, -0.5]} />, name: 'Muscle, mid-lift', note: 'flexed: shorter, thicker'},
        {el: <Muscle mood="happy" mouth="open" />, name: 'Muscle, relaxed'},
        {el: <Crea />, name: 'Crea'},
        {el: <Battery charge={1} />, name: 'Battery'},
        {el: <Kidney mood="sad" mouth="wavy" />, name: 'Kidney (exists)'},
      ].map((c, i) => {
        const x = 56 + 190 + i * 357;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={862} size={200}>{c.el}</Fig>
            <Caption x={x} y={968} name={c.name} note={c.note} size={20} w={300} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
