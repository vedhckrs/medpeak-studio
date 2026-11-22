/**
 * MedPeak Toons, look v8: the new drawings of "What Happens to Your Body When You Fast" (`fasting`).
 *
 *   Lardo        a fat cell: round and cosy, pale butter yellow, one big glossy fat drop filling him (the face sits on
 *                it), his small nucleus pushed to the side (as in a real fat cell), a thin membrane rim.
 *     size 0..1    1 = full; toward 0.7 he gets smaller as he gives out fuel
 *     drops 0..1   little fuel drops popping off his top (burning fat)
 *   StomachFull  the whole stomach filling the frame (the owner's full-organ rule): the cast Stomach's outline about
 *                6 times bigger, the gullet coming down into it, the diaphragm's muscle above, the liver's edge on the
 *                left, the spleen on the right, the duodenum leaving low left, gut loops below; the folds (rugae) on
 *                its wall; the face on its own big bulge.
 *     growl 0..1   it shakes and ripple arcs spread from its wall
 *   SugarJar     the liver's sugar store: a glass jar of round sugar beads (glycogen) with a lid, "SUGAR STORE".
 *     store 0..1   how full it is; the last bead hangs at the neck when it is nearly empty
 *   FastRoom     Grandpa's living room at night: warm plum walls with a stripe, a floor lamp's flat pale pool, an
 *                armchair, the big wall clock with the red FAST ring (`hours` of 16), a side table with the plate.
 *
 * Kit only: one outline colour, flat fills, one shade crescent, white shine strokes and dots, the kit face.
 */
import React from 'react';
import {CLOTH, EDGE, EDGE_IN, Eyes, FLESH, FONT, INK, INLINE, Mouth, Shape, shade, tint, TinyArm, TinyLeg, type V8Props} from './kit';
import {Layer, Scene} from './scene';
import {f, open, rnd, type P} from './scenes-body';
import {ORGAN_COL, smooth} from './organs-a';
import {FLOOR_Y} from './scenes-rooms';
import {bodyTx, OrganArm, type ArmPose, type Gesture} from './organ-act';

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const Shine: React.FC<{d: string; w?: number; o?: number}> = ({d, w = 10, o = 0.85}) => <path d={d} stroke="#ffffff" strokeWidth={w} strokeLinecap="round" fill="none" opacity={o} />;
const rr = (x: number, y: number, w: number, h: number, r: number) => `M ${x + r} ${y} H ${x + w - r} Q ${x + w} ${y} ${x + w} ${y + r} V ${y + h - r} Q ${x + w} ${y + h} ${x + w - r} ${y + h} H ${x + r} Q ${x} ${y + h} ${x} ${y + h - r} V ${y + r} Q ${x} ${y} ${x + r} ${y} Z`;

// =================================================================== 1. Lardo, the fat cell
export const LARDO = {cell: '#fbe3a0', drop: '#f8d27a', rim: '#f0c978', nucleus: '#c98fb8', cheek: tint(CLOTH.orange, 0.45), fuel: '#f6c85f'};

export const Lardo: React.FC<V8Props & {size?: number; drops?: number; arms?: 'out' | 'hips' | 'up' | 'down'}> = ({mood = 'happy', mouth = 'smile', look = [0, 0], size = 1, drops = 0, arms = 'hips'}) => {
  const s = 0.7 + 0.3 * clamp01(size);
  const d = clamp01(drops);
  // a soft, slightly lumpy round body (cells are never perfect circles)
  const body: P[] = Array.from({length: 10}, (_, i): P => {
    const a = (i / 10) * Math.PI * 2 - Math.PI / 2, q = 1 + (rnd(i, 91) - 0.5) * 0.08;
    return [Math.cos(a) * 66 * q, Math.sin(a) * 60 * q];
  });
  const armAt = (side: -1 | 1) => {
    const from: P = [side * 60, 10];
    if (arms === 'up') return {from, bend: [side * 84, -6] as P, to: [side * 80, -40] as P, hand: 'open' as const};
    if (arms === 'out') return {from, bend: [side * 86, 6] as P, to: [side * 104, -6] as P, hand: 'open' as const};
    if (arms === 'down') return {from, bend: [side * 72, 34] as P, to: [side * 74, 58] as P, hand: 'mitten' as const};
    return {from, bend: [side * 88, 2] as P, to: [side * 66, 34] as P, hand: 'fist' as const};
  };
  const L = armAt(-1), R = armAt(1);
  return (
    <g transform={`scale(${f(s)})`}>
      {/* fuel drops popping off his top */}
      {d > 0 && [[-30, -76, 9], [6, -92, 11], [40, -74, 8]].map(([x, y, r], i) => {
        const k = clamp01(d * 3 - i);
        return k > 0 && (
          <g key={i} transform={`translate(${f(x * (1 + k * 0.2))} ${f(y - k * 26)})`} opacity={k}>
            <path d={`M 0 ${-r * 1.5} Q ${r} ${-r * 0.2} ${r} ${r * 0.3} A ${r} ${r} 0 1 1 ${-r} ${r * 0.3} Q ${-r} ${-r * 0.2} 0 ${-r * 1.5} Z`} fill={LARDO.fuel} {...EDGE_IN} />
            <circle cx={-r * 0.3} cy={0} r={r * 0.25} fill="#ffffff" opacity={0.9} />
          </g>
        );
      })}
      <TinyLeg from={[-24, 54]} to={[-28, 82]} fill={LARDO.cell} foot={-1} />
      <TinyLeg from={[22, 54]} to={[26, 82]} fill={LARDO.cell} />
      <TinyArm from={L.from} bend={L.bend} to={L.to} fill={LARDO.cell} hand={L.hand} />
      <Shape d={smooth(body)} fill={LARDO.cell} shadow={0.9}>
        {/* the one big fat drop filling the cell, with its rim and a big shine */}
        <ellipse cx={4} cy={-2} rx={54} ry={48} fill={LARDO.drop} />
        <ellipse cx={4} cy={-2} rx={54} ry={48} fill="none" stroke={LARDO.rim} strokeWidth={3} />
        <path d="M -34 -26 Q -22 -42 -2 -44" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" fill="none" opacity={0.9} />
        <circle cx={30} cy={-34} r={3.2} fill="#ffffff" opacity={0.9} />
        {/* the nucleus, squeezed to the edge (a real fat cell's 'signet ring') */}
        <path d="M -62 6 Q -60 -14 -50 -22 Q -46 -4 -50 14 Q -56 22 -62 6 Z" fill={LARDO.nucleus} {...EDGE_IN} />
        <circle cx={-56} cy={-2} r={2.4} fill={shade(LARDO.nucleus, 0.25)} />
      </Shape>
      <ellipse cx={-28} cy={22} rx={8} ry={5} fill={LARDO.cheek} />
      <ellipse cx={36} cy={22} rx={8} ry={5} fill={LARDO.cheek} />
      <Eyes x={4} y={-6} r={14} mood={mood} look={look} brows />
      <Mouth x={4} y={22} w={15} kind={mouth} />
      <TinyArm from={R.from} bend={R.bend} to={R.to} fill={LARDO.cell} hand={R.hand} />
    </g>
  );
};

// =================================================================== quiet places and the new story pictures (2026-11-22, the owner on
// the first fasting cut: "not interesting and not visual, confusion"): one colour per place, big physical metaphors.
export const PLACE = {stomach: '#f7ad6a', liver: '#6cc3bd', brain: '#ab9ce4'};
/** The stomach's surroundings as quiet tone-on-tone shapes (no outline, no shine). */
const PlainStomachBack: React.FC<{c: string}> = ({c}) => (
  <g>
    <path d="M -40 -40 L 1120 -40 L 1120 400 Q 540 280 -40 400 Z" fill={shade(c, 0.1)} />
    <path d="M -60 380 Q 200 330 420 420 Q 470 500 380 600 Q 220 720 -60 760 Z" fill={tint(c, 0.14)} />
    {[[80, 1760, 230, 110], [480, 1790, 250, 115], [900, 1770, 230, 110], [280, 1960, 260, 120], [720, 1960, 260, 120]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={tint(c, 0.12)} />)}
  </g>
);
/** "Hunger comes in waves": a real blue wave rising across the frame behind the stomach (k 0..1: how high). */
export const HungerWave: React.FC<{c: string; k: number; t: number}> = ({k, t}) => {
  const y0 = 1700 - k * 620, amp = 70 * k;
  const pts = Array.from({length: 13}, (_, i) => { const x = -60 + i * 100; return [x, y0 + Math.sin(i * 0.9 + t * 1.2) * amp] as [number, number]; });
  const d = `M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')} L 1140 2000 L -60 2000 Z`;
  return (
    <g>
      <path d={d} fill={tint(CLOTH.sky, 0.15)} opacity={0.9} />
      <path d={`M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')}`} stroke="#ffffff" strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" fill="none" />
      <path d={`M ${pts.map(([x, y]) => `${f(x)} ${f(y)}`).join(' L ')}`} {...INLINE} fill="none" />
    </g>
  );
};
/** The liver's sugar store as a giant FUEL GAUGE: the needle from FULL to EMPTY, a red alarm lamp on top (alarm 0..1 flashes). */
export const FuelGauge: React.FC<{level: number; alarm?: number}> = ({level, alarm = 0}) => {
  const a = Math.PI * (1 - clamp01(level)); // 0 = right (FULL), pi = left (EMPTY)
  const R = 150;
  const arcPt = (u: number, r: number) => [Math.cos(Math.PI * (1 - u)) * r, -Math.sin(Math.PI * (1 - u)) * r];
  const seg = (u0: number, u1: number, col: string) => { const [x0, y0] = arcPt(u0, R), [x1, y1] = arcPt(u1, R), [x2, y2] = arcPt(u1, R - 40), [x3, y3] = arcPt(u0, R - 40); return <path d={`M ${f(x0)} ${f(y0)} A ${R} ${R} 0 0 1 ${f(x1)} ${f(y1)} L ${f(x2)} ${f(y2)} A ${R - 40} ${R - 40} 0 0 0 ${f(x3)} ${f(y3)} Z`} fill={col} />; };
  const on = alarm > 0 && Math.floor(alarm * 6) % 2 === 0;
  return (
    <g>
      <Shape d={rr(-200, -230, 400, 330, 40)} fill={CLOTH.offwhite} shadow={0.7} />
      {seg(0, 0.22, CLOTH.red)}{seg(0.22, 0.6, CLOTH.yellow)}{seg(0.6, 1, CLOTH.green)}
      <path d={`M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0`} {...INLINE} fill="none" />
      <text x={-168} y={70} fontFamily={FONT} fontWeight={900} fontSize={44} fill={CLOTH.red}>E</text>
      <text x={140} y={70} fontFamily={FONT} fontWeight={900} fontSize={44} fill={INK}>F</text>
      <text x={0} y={70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={40} fill={INK} letterSpacing={2}>SUGAR</text>
      <g transform={`rotate(${f(-a * 180 / Math.PI)})`}>
        <path d="M -10 0 L 0 -132 L 10 0 Z" fill={CLOTH.red} {...EDGE_IN} />
      </g>
      <circle cx={0} cy={0} r={22} fill={CLOTH.charcoal} {...EDGE_IN} />
      {/* the alarm lamp */}
      <Shape d={rr(-50, -300, 100, 70, 30)} fill={on ? '#ff3b30' : shade(CLOTH.red, 0.3)} shadow={0.4} />
      {on && [[-90, -300], [0, -350], [90, -300]].map(([x, y], i) => <path key={i} d={`M ${x * 0.6} ${y + 20} L ${x} ${y - 10}`} stroke="#ff3b30" strokeWidth={10} strokeLinecap="round" />)}
    </g>
  );
};
/** The body's furnace: a round iron stove; `fire` 0..1 from a small blue flame to a roaring orange blaze; a lever SUGAR / FAT. */
export const Furnace: React.FC<{fire: number; lever: number; t: number}> = ({fire, lever, t}) => {
  const k = clamp01(fire);
  const flick = (i: number) => Math.sin(t * 9 + i * 1.7) * 10 * (0.4 + k);
  const flames = [-60, -20, 20, 60].map((x, i) => {
    const h = 40 + k * 120 + flick(i);
    return <path key={i} d={`M ${x - 34} 70 Q ${x - 40} ${70 - h * 0.5} ${x} ${70 - h} Q ${x + 40} ${70 - h * 0.5} ${x + 34} 70 Z`} fill={k > 0.5 ? CLOTH.orange : '#6fa8dc'} {...EDGE_IN} />;
  });
  return (
    <g>
      <Shape d="M -190 200 L -190 -80 Q -190 -230 0 -230 Q 190 -230 190 -80 L 190 200 Z" fill={CLOTH.charcoal} shadow={0.8} />
      <path d="M -150 120 L -150 -40 Q -150 -150 0 -150 Q 150 -150 150 -40 L 150 120 Z" fill="#1d2430" {...EDGE_IN} />
      <g transform="translate(0 40)">{flames}{k > 0.5 && [-30, 30].map((x, i) => <path key={i} d={`M ${x - 18} 30 Q ${x} ${-30 - k * 50 + flick(i + 4) * 0.5} ${x + 18} 30 Z`} fill={CLOTH.yellow} />)}</g>
      <path d="M -190 140 H 190" {...INLINE} />
      {[-120, 120].map((x) => <rect key={x} x={x - 22} y={200} width={44} height={40} rx={6} fill={CLOTH.charcoal} {...EDGE_IN} />)}
      {/* the chimney */}
      <Shape d="M 60 -220 L 60 -330 L 120 -330 L 120 -200 Z" fill={CLOTH.charcoal} shadow={0.4} />
      {/* the lever on the side: up = SUGAR, down = FAT */}
      <g transform={`translate(210 0) rotate(${f(lerpN(-40, 40, clamp01(lever)))})`}>
        <path d="M 0 0 L 70 0" stroke={INK} strokeWidth={22} strokeLinecap="round" />
        <path d="M 0 0 L 70 0" stroke={tint(CLOTH.grey, 0.3)} strokeWidth={14} strokeLinecap="round" />
        <circle cx={76} cy={0} r={22} fill={CLOTH.red} {...EDGE_IN} />
      </g>
      <circle cx={210} cy={0} r={18} fill={CLOTH.charcoal} {...EDGE_IN} />
      <text x={262} y={-70} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={lever < 0.5 ? INK : tint(INK, 0.55)}>SUGAR</text>
      <text x={262} y={100} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={30} fill={lever >= 0.5 ? CLOTH.orange : tint(INK, 0.55)}>FAT</text>
    </g>
  );
};
const lerpN = (a: number, b: number, k: number) => a + (b - a) * k;
/** A biscuit tin on the side table (4 h: Grandpa reaches for it); `open` lifts the lid. */
export const BiscuitTin: React.FC<{open?: number}> = ({open = 0}) => (
  <g>
    <Shape d={rr(-70, -60, 140, 80, 14)} fill={CLOTH.blue} shadow={0.6}>
      <path d="M -70 -28 H 70" stroke={CLOTH.yellow} strokeWidth={10} />
    </Shape>
    <g transform={`translate(${f(open * 20)} ${f(-open * 30)}) rotate(${f(open * 18)})`}>
      <Shape d={rr(-78, -76, 156, 22, 8)} fill={shade(CLOTH.blue, 0.12)} shadow={0} />
    </g>
    {open > 0.3 && [-30, 10, 40].map((x) => <circle key={x} cx={x} cy={-58} r={16} fill={CLOTH.tan} {...EDGE_IN} />)}
  </g>
);
/** "Z z z" over a sleeper (t in seconds: the letters float up and fade, one after another). */
export const Snore: React.FC<{t: number; x: number; y: number}> = ({t, x, y}) => (
  <g>
    {[0, 1, 2].map((i) => {
      const u = ((t * 0.7 + i / 3) % 1);
      return <text key={i} x={f(x + u * 70 + i * 6)} y={f(y - u * 160)} fontFamily={FONT} fontWeight={900} fontSize={f(36 + i * 14)} fill="#ffffff" stroke={INK} strokeWidth={5} paintOrder="stroke" opacity={f(1 - u)}>Z</text>;
    })}
  </g>
);

// =================================================================== 2. the whole stomach
export const STOMACH_FULL = {
  cavity: '#f2c4b5', cavity2: '#e8ab9b', muscle: '#d8737a', muscle2: '#c8636c', tendon: '#eab3b2',
  wall: ORGAN_COL.stomach, fold: shade(ORGAN_COL.stomach, 0.12), liver: ORGAN_COL.liver, spleen: '#9a5a7a',
  gut: FLESH.coral, gullet: tint(ORGAN_COL.stomach, 0.1), vesselR: '#d6646a', vesselB: '#8a90c4',
};
// the cast Stomach's outline (organs-a), so the big stomach is the same character
const STOMACH_BODY: P[] = [[-2, -48], [10, -58], [26, -68], [48, -69], [66, -54], [75, -28], [73, 4], [63, 30], [43, 50], [14, 61], [-16, 61], [-42, 53], [-60, 44], [-71, 33], [-68, 20], [-52, 18], [-32, 15], [-17, 5], [-9, -13], [-7, -33]];
// the folds (rugae) on its wall, in its own units, kept off the face (around 36, -20)
const RUGAE = ['M -54 30 Q -36 24 -18 30 Q 0 36 16 30', 'M -40 44 Q -16 38 8 46 Q 26 52 40 42', 'M 0 -40 Q 4 -20 0 0 Q -4 14 2 26', 'M 60 20 Q 44 34 24 38', 'M 70 -6 Q 64 8 52 16', 'M 12 -58 Q 6 -48 8 -38'];

export const StomachFull: React.FC<V8Props & {t: number; growl?: number; armL?: ArmPose | Gesture; armR?: ArmPose | Gesture; sq?: number; rot?: number; place?: string; wave?: number}> = ({t, growl = 0, mood = 'angry', mouth = 'open', look = [-0.4, 0.2], armL, armR, sq = 0, rot = 0, place, wave = 0}) => {
  const g = clamp01(growl);
  const S = 6.0;
  // the growl is a squash pulse of the body (below), not a jitter of the whole organ (2026-11-22: the jitter kept most of the frame moving)
  const sx = 0, sy = 0;
  return (
    <Scene bg={place ?? STOMACH_FULL.cavity}>
      <Layer>
        {place ? <PlainStomachBack c={place} /> : (<>
        {/* the back wall: soft folds and thin vessels */}
        {[[160, 1300, 250, 110], [920, 1240, 220, 90], [560, 1560, 320, 90]].map(([x, y, rx, ry], i) => <ellipse key={i} cx={x} cy={y} rx={rx} ry={ry} fill={STOMACH_FULL.cavity2} />)}
        {([[[30, 1000], [140, 1080], [190, 1220]], [[1060, 1100], [980, 1180], [960, 1320]]] as P[][]).map((pts, i) => (
          <path key={i} d={open(pts)} stroke={i ? STOMACH_FULL.vesselB : STOMACH_FULL.vesselR} strokeWidth={9} strokeLinecap="round" fill="none" />
        ))}
        {/* the diaphragm across the top, with the gullet coming down through it */}
        <Shape d="M -40 -40 L 1120 -40 L 1120 420 Q 540 290 -40 420 Z" fill={STOMACH_FULL.muscle} shadow={4}>
          {Array.from({length: 11}, (_, i) => {
            const u = -1 + i * 0.2;
            return <path key={i} d={`M ${f(540 + u * 600)} -40 Q ${f(540 + u * 440)} 200 ${f(540 + u * 540)} ${f(400 - (1 - Math.abs(u)) * 80)}`} stroke={i % 2 ? STOMACH_FULL.muscle2 : tint(STOMACH_FULL.muscle, 0.12)} strokeWidth={i % 2 ? 26 : 8} fill="none" />;
          })}
          <Shine d="M 120 300 Q 300 250 420 250" w={10} o={0.5} />
        </Shape>
        {/* the liver's edge, left, over the top of the stomach */}
        <Shape d="M -60 380 Q 200 330 420 420 Q 470 500 380 600 Q 220 720 -60 760 Z" fill={STOMACH_FULL.liver} shadow={3}>
          <Shine d="M 40 430 Q 180 400 300 430" w={10} o={0.55} />
        </Shape>
        {/* the spleen, right, tucked behind */}
        <Shape d="M 1140 560 Q 960 560 930 720 Q 920 860 1040 900 Q 1110 910 1140 880 Z" fill={STOMACH_FULL.spleen} shadow={3}>
          <Shine d="M 970 660 Q 1010 610 1080 600" w={9} o={0.5} />
        </Shape>
        {/* gut loops below */}
        {([[80, 1720, 190, 80, -12], [420, 1700, 200, 84, 8], [780, 1710, 200, 82, -6], [1070, 1730, 170, 80, 14], [-20, 1890, 200, 84, 6], [320, 1880, 200, 84, -10], [660, 1890, 210, 86, 6], [1000, 1900, 200, 84, -8]] as [number, number, number, number, number][]).map(([x, y, rx, ry, r], i) => (
          <g key={i} transform={`rotate(${r} ${x} ${y})`}>
            <Shape d={`M ${x - rx} ${y} C ${x - rx} ${y - ry * 1.1} ${x + rx} ${y - ry * 1.1} ${x + rx} ${y} C ${x + rx} ${y + ry * 1.1} ${x - rx} ${y + ry * 1.1} ${x - rx} ${y} Z`} fill={STOMACH_FULL.gut} shadow={3}>
              <path d={`M ${x - rx * 0.55} ${y + ry * 0.1} Q ${x} ${y - ry * 0.35} ${x + rx * 0.55} ${y + ry * 0.1}`} {...INLINE} />
              <Shine d={`M ${x - rx * 0.6} ${y - ry * 0.5} Q ${x - rx * 0.2} ${y - ry * 0.78} ${x + rx * 0.2} ${y - ry * 0.74}`} w={9} o={0.6} />
            </Shape>
          </g>
        ))}
        </>)}
        {wave > 0 && <HungerWave c={place ?? STOMACH_FULL.cavity} k={wave} t={t} />}
      </Layer>

      <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">
        {/* the growl: ripple arcs spreading out from the wall */}
        {false && g > 0.3 && [0, 1].map((i) => { // the ripple rings: off (2026-11-22, they kept a third of the frame moving)
          const k = ((t * 1.6 + i / 3) % 1);
          const r = 520 + k * 220;
          return <path key={i} d={`M ${f(540 - r * 0.86)} ${f(1000 + r * 0.2)} A ${r} ${r * 0.9} 0 0 1 ${f(540 + r * 0.86)} ${f(1000 + r * 0.2)}`} stroke="#ffffff" strokeWidth={14} strokeLinecap="round" fill="none" opacity={g * (1 - k) * 0.8} />;
        })}
        <g transform={`translate(${f(500 + sx)} ${f(1040 + sy)}) scale(${S}) ${bodyTx(sq + g * 0.03 * Math.max(0, Math.sin(t * 11)), rot, 60)}`}>
          {/* the gullet down into the top, the duodenum out low left */}
          <path d="M -10 -200 C -12 -140 -8 -90 2 -54" stroke={INK} strokeWidth={24} strokeLinecap="round" fill="none" />
          <path d="M -10 -200 C -12 -140 -8 -90 2 -54" stroke={STOMACH_FULL.gullet} strokeWidth={19} strokeLinecap="round" fill="none" />
          <path d="M -58 34 C -80 40 -92 60 -88 84 C -84 104 -70 120 -72 160" stroke={INK} strokeWidth={21} strokeLinecap="round" fill="none" />
          <path d="M -58 34 C -80 40 -92 60 -88 84 C -84 104 -70 120 -72 160" stroke={STOMACH_FULL.gullet} strokeWidth={16} strokeLinecap="round" fill="none" />
          {armL ? <OrganArm from={[-36, 56]} s={-1} pose={armL} fill={STOMACH_FULL.wall} /> : <TinyArm from={[-36, 56]} bend={[-46, 76]} to={[-28, 84]} fill={STOMACH_FULL.wall} hand="fist" />}
          <Shape d={smooth(STOMACH_BODY)} fill={STOMACH_FULL.wall}>
            {RUGAE.map((d, i) => <path key={'r' + i} d={d} stroke={tint(STOMACH_FULL.wall, 0.3)} strokeWidth={2.4} fill="none" transform="translate(-1 -1)" />)}
            {RUGAE.map((d, i) => <path key={'g' + i} d={d} {...INLINE} />)}
            {/* the darker lower curve, turning away */}
            <path d="M -60 46 Q -20 64 20 60 Q 50 54 66 32" stroke={shade(STOMACH_FULL.wall, 0.14)} strokeWidth={6} fill="none" />
            <Shine d="M 18 -62 Q 40 -70 60 -58" w={2.6} o={0.8} />
            <Shine d="M 70 -30 Q 74 -14 72 0" w={2} o={0.6} />
            <circle cx={-2} cy={-40} r={1.5} fill="#ffffff" opacity={0.9} />
          </Shape>
          {armR ? <OrganArm from={[71, 6]} s={1} pose={armR} fill={STOMACH_FULL.wall} len={0.9} /> : <TinyArm from={[71, 6]} bend={[g > 0 ? 88 : 90, g > 0 ? -6 : 8]} to={[g > 0 ? 84 : 88, g > 0 ? -34 : -16]} fill={STOMACH_FULL.wall} hand={g > 0 ? 'fist' : 'mitten'} />}
          <Eyes x={36} y={-30} r={14} mood={mood} look={look} brows />
          <Mouth x={36} y={-4} w={15} kind={mouth} />
        </g>
      </svg>
    </Scene>
  );
};

// =================================================================== 3. the liver's sugar store
const BEADS: P[] = (() => {
  const out: P[] = [];
  for (let row = 0; row < 8; row++) for (let i = 0; i < 6; i++) out.push([-75 + i * 30 + (row % 2) * 15 + (rnd(row * 6 + i, 33) - 0.5) * 6, 150 - row * 30]);
  return out;
})();
/** A glass jar of sugar beads (frame units: about 260 wide, 380 tall, origin at the jar's middle). */
export const SugarJar: React.FC<{store?: number; label?: boolean}> = ({store = 1, label = true}) => {
  const k = clamp01(store);
  const n = Math.round(k * BEADS.length);
  return (
    <g>
      {/* the glass: a pale blue fill, the beads inside, then the outline and shine on top */}
      <path d="M -110 -120 Q -120 -100 -120 -70 L -120 160 Q -120 190 -90 190 L 90 190 Q 120 190 120 160 L 120 -70 Q 120 -100 110 -120 Z" fill={tint(CLOTH.sky, 0.55)} />
      {BEADS.slice(0, n).map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={14} fill={i % 3 ? '#ffffff' : '#fff6e2'} {...EDGE_IN} />
          <circle cx={x - 4} cy={y - 4} r={3.5} fill={tint(CLOTH.sky, 0.3)} />
        </g>
      ))}
      {/* nearly empty: the last bead hangs at the bottom, shaking */}
      {k > 0 && k < 0.08 && <circle cx={0} cy={150} r={14} fill="#ffffff" {...EDGE_IN} />}
      <path d="M -110 -120 Q -120 -100 -120 -70 L -120 160 Q -120 190 -90 190 L 90 190 Q 120 190 120 160 L 120 -70 Q 120 -100 110 -120" fill="none" {...EDGE} />
      <Shine d="M -96 -60 L -96 120" w={12} o={0.75} />
      <Shine d="M 96 -40 L 96 20" w={7} o={0.5} />
      {/* the lid */}
      <Shape d={rr(-124, -156, 248, 46, 12)} fill={CLOTH.red} shadow={0.6}>
        <path d="M -100 -132 H 100" stroke={shade(CLOTH.red, 0.15)} strokeWidth={6} />
      </Shape>
      {label && (
        <g>
          <Shape d={rr(-92, -6, 184, 64, 10)} fill={CLOTH.offwhite} shadow={0} line="in" />
          <text x={0} y={21} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={INK} letterSpacing={1}>SUGAR</text>
          <text x={0} y={47} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={INK} letterSpacing={1}>STORE</text>
        </g>
      )}
    </g>
  );
};

// =================================================================== 4. Grandpa's living room at night
export const FAST_ROOM = {
  wall: '#6a4f78', wall2: '#614871', floor: '#7a5d4c', floor2: '#6c5142', rug: '#3f7d86', rug2: '#4c8f98',
  pool: '#8a6e86', lamp: '#f7e1a6', chair: '#c0563f', chair2: '#a84a37', wood: '#8a5a3c', clock: '#fbf6ea',
};
/** The big wall clock with the red FAST ring: `hours` of 16 filled, the hours in its middle. */
export const FastClock: React.FC<{hours: number; sec?: number}> = ({hours, sec}) => {
  const k = clamp01(hours / 16);
  const R = 118;
  const a1 = -Math.PI / 2 + k * Math.PI * 2;
  const arc = k >= 0.999 ? `M 0 ${-R} A ${R} ${R} 0 1 1 -0.01 ${-R} Z` : `M 0 0 L 0 ${-R} A ${R} ${R} 0 ${k > 0.5 ? 1 : 0} 1 ${f(Math.cos(a1) * R)} ${f(Math.sin(a1) * R)} Z`;
  return (
    <g>
      <Shape d={`M -150 0 A 150 150 0 1 1 150 0 A 150 150 0 1 1 -150 0 Z`} fill={FAST_ROOM.wood} shadow={0.6} />
      <circle cx={0} cy={0} r={128} fill={FAST_ROOM.clock} {...EDGE_IN} />
      {k > 0 && <path d={arc} fill={tint(CLOTH.red, 0.15)} opacity={0.9} />}
      {Array.from({length: 16}, (_, i) => {
        const a = -Math.PI / 2 + (i / 16) * Math.PI * 2, r1 = i % 4 ? 112 : 104;
        return <path key={i} d={`M ${f(Math.cos(a) * r1)} ${f(Math.sin(a) * r1)} L ${f(Math.cos(a) * 124)} ${f(Math.sin(a) * 124)}`} stroke={INK} strokeWidth={i % 4 ? 4 : 8} strokeLinecap="round" />;
      })}
      {sec !== undefined && (() => { const a = (sec / 60) * Math.PI * 2 - Math.PI / 2; return <g><path d={`M ${f(-Math.cos(a) * 14)} ${f(-Math.sin(a) * 14)} L ${f(Math.cos(a) * 118)} ${f(Math.sin(a) * 118)}`} stroke={INK} strokeWidth={9} strokeLinecap="round" /><path d={`M ${f(-Math.cos(a) * 14)} ${f(-Math.sin(a) * 14)} L ${f(Math.cos(a) * 118)} ${f(Math.sin(a) * 118)}`} stroke={CLOTH.red} strokeWidth={4} strokeLinecap="round" /></g>; })()}
      <circle cx={0} cy={0} r={74} fill={FAST_ROOM.clock} {...EDGE_IN} />
      <text x={0} y={-24} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={CLOTH.red} letterSpacing={2}>FAST</text>
      <text x={0} y={34} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={hours >= 10 ? 58 : 64} fill={INK}>{Math.round(hours)}h</text>
    </g>
  );
};
/** A dinner plate: rice, a chicken leg and peas (or `empty`). */
export const DinnerPlate: React.FC<{empty?: boolean; breakfast?: boolean}> = ({empty, breakfast}) => (
  <g>
    <ellipse cx={0} cy={6} rx={118} ry={40} fill={shade(CLOTH.offwhite, 0.18)} />
    <ellipse cx={0} cy={0} rx={118} ry={38} fill="#ffffff" {...EDGE_IN} />
    <ellipse cx={0} cy={0} rx={84} ry={26} fill="none" stroke={CLOTH.offwhite} strokeWidth={5} />
    {!empty && !breakfast && (
      <g>
        <path d="M -70 -2 Q -60 -30 -20 -26 Q 6 -22 4 -2 Z" fill="#ffffff" {...EDGE_IN} />
        <path d="M 10 -6 Q 30 -30 60 -22 Q 76 -14 64 -2 Q 40 6 10 -6 Z" fill={CLOTH.brown} {...EDGE_IN} />
        {[[-10, 8], [6, 12], [-24, 12], [22, 10]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={7} fill={CLOTH.green} {...EDGE_IN} />)}
      </g>
    )}
    {breakfast && (
      <g>
        <ellipse cx={-30} cy={-6} rx={36} ry={16} fill="#ffffff" {...EDGE_IN} />
        <circle cx={-30} cy={-8} r={11} fill={CLOTH.yellow} {...EDGE_IN} />
        <path d="M 14 -16 Q 40 -30 70 -16 L 66 6 Q 40 14 16 6 Z" fill={CLOTH.tan} {...EDGE_IN} />
      </g>
    )}
  </g>
);

export const FastRoom: React.FC<{hours?: number; plate?: 'full' | 'away' | 'breakfast'; lamp?: boolean; plateX?: number; clockShake?: number; sec?: number}> = ({hours = 0, plate = 'full', lamp = true, plateX, clockShake = 0, sec}) => (
  <Layer>
    <rect x={0} y={0} width={1080} height={FLOOR_Y} fill={FAST_ROOM.wall} />
    {/* a wide stripe of wallpaper with a small diamond pattern */}
    <rect x={0} y={760} width={1080} height={70} fill={FAST_ROOM.wall2} />
    {Array.from({length: 12}, (_, i) => <path key={i} d={`M ${i * 96 + 30} 795 l 16 -16 l 16 16 l -16 16 Z`} fill={tint(FAST_ROOM.wall, 0.12)} />)}
    <rect x={0} y={FLOOR_Y} width={1080} height={1920 - FLOOR_Y} fill={FAST_ROOM.floor} />
    {[1480, 1620, 1800].map((y) => <path key={y} d={`M 0 ${y} H 1080`} stroke={FAST_ROOM.floor2} strokeWidth={5} />)}
    <path d={`M 0 ${FLOOR_Y} H 1080`} {...INLINE} />
    {/* the round rug */}
    <ellipse cx={560} cy={1720} rx={430} ry={110} fill={FAST_ROOM.rug} {...EDGE_IN} />
    <ellipse cx={560} cy={1720} rx={330} ry={78} fill="none" stroke={FAST_ROOM.rug2} strokeWidth={16} />

    {/* the floor lamp, left: a flat pale pool on the wall and floor, no glow */}
    {lamp && <path d="M 40 520 L 330 520 L 520 1920 L -100 1920 Z" fill={FAST_ROOM.pool} opacity={0.55} />}
    <path d="M 180 560 V 1640" stroke={INK} strokeWidth={14} />
    <path d="M 180 560 V 1640" stroke={CLOTH.charcoal} strokeWidth={8} />
    <Shape d="M 100 1650 Q 180 1620 260 1650 L 260 1666 L 100 1666 Z" fill={CLOTH.charcoal} shadow={0} />
    <Shape d="M 110 420 L 250 420 L 290 570 L 70 570 Z" fill={FAST_ROOM.lamp} shadow={0.4}>
      <path d="M 92 500 H 268" stroke={shade(FAST_ROOM.lamp, 0.1)} strokeWidth={8} />
    </Shape>

    {/* the big wall clock, middle-right, high */}
    <g transform={`translate(860 385) rotate(${clockShake.toFixed(2)}) scale(1.0)`}><FastClock hours={hours} sec={sec} /></g>

    {/* the armchair, left of middle, behind where Grandpa stands */}
    <Shape d="M 230 980 Q 230 880 330 880 L 560 880 Q 660 880 660 980 L 660 1420 L 230 1420 Z" fill={FAST_ROOM.chair} shadow={0.6}>
      <path d="M 300 960 Q 445 930 590 960" stroke={FAST_ROOM.chair2} strokeWidth={12} fill="none" />
    </Shape>
    <Shape d="M 200 1120 Q 200 1060 260 1060 L 300 1060 L 300 1440 L 200 1440 Z" fill={FAST_ROOM.chair2} shadow={0.4} />
    <Shape d="M 590 1120 Q 590 1060 650 1060 L 690 1060 Q 690 1060 690 1120 L 690 1440 L 590 1440 Z" fill={FAST_ROOM.chair2} shadow={0.4} />
    <Shape d={rr(270, 1250, 360, 110, 20)} fill={tint(FAST_ROOM.chair, 0.12)} shadow={0.4} />

    {/* the side table on the right with the plate */}
    <Shape d={rr(770, 1200, 260, 30, 8)} fill={FAST_ROOM.wood} shadow={0.4} />
    <path d="M 800 1230 L 790 1520 M 1000 1230 L 1010 1520" stroke={INK} strokeWidth={16} strokeLinecap="round" />
    <path d="M 800 1230 L 790 1520 M 1000 1230 L 1010 1520" stroke={FAST_ROOM.wood} strokeWidth={10} strokeLinecap="round" />
    {/* the plate: in the middle of the table, or pushed away to its far edge */}
    <g transform={`translate(${plateX ?? (plate === 'away' ? 958 : 900)} 1186) scale(0.95)`}><DinnerPlate breakfast={plate === 'breakfast'} /></g>
  </Layer>
);
