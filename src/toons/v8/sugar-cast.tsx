/**
 * MedPeak Toons, look v8: the new cast of "What Happens If You Quit Sugar for 30 Days" (`quit-sugar`).
 *   Sweetie   the villain: one sugar cube (white, faceted, a sparkle of crystals on each face), sly and
 *             cheeky. He fights for 30 days to win Dad back, and changes costume per trick:
 *     wear   'none'   the plain cube
 *            'juice'  a juice box worn like a barrel (straw, an orange on the label): "I'm juice now!"
 *            'diet'   a silver can marked ZERO worn the same way: "my sweet cousin"
 *     arms   'hips'   both fists on his sides (smug)
 *            'wave'   one open hand up (hello, the hook)
 *            'point'  one hand pointing (at Dad, at the lens)
 *            'droop'  both arms hanging (he is losing)
 * Drawn only with the shared kit (./kit): flat fill, one shade crescent, the ink outline, the kit face.
 */
import React from 'react';
import {Board, Caption, CLOTH, EDGE_IN, Eyes, Fig, FONT, INK, INLINE, Mouth, Panel, Shape, shade, tint, TinyArm, TinyLeg, type V8Props} from './kit';
import {roundPoly} from './crea-cast';
import {Brain, Liver, Tooth} from './organs-a';
import {Tongue} from './organs-b';

type P = [number, number];

export const SWEET = {
  front: '#fbf8f2', // a warm white, so the cube reads on the white board and on pink tissue
  top: '#ffffff',
  side: '#e7dfd2',
  grain: '#efe7da', // the crystals pressed into each face
  juice: CLOTH.orange,
  juice2: tint(CLOTH.yellow, 0.2),
  can: tint(CLOTH.grey, 0.35),
  can2: tint(CLOTH.grey, 0.6),
};

// the cube: the front face, the top facet, the right facet
const FRONT: P[] = [[-56, -28], [40, -28], [40, 68], [-56, 68]];
const TOP: P[] = [[-56, -28], [-30, -58], [66, -58], [40, -28]];
const SIDE: P[] = [[40, -28], [66, -58], [66, 40], [40, 68]];
const SIL: P[] = [[-56, -28], [-30, -58], [66, -58], [66, 40], [40, 68], [-56, 68]];

/** Little pressed crystals on a face: small rounded squares in a slightly darker white. */
const Crystals: React.FC<{pts: P[]; col: string}> = ({pts, col}) => (
  <>
    {pts.map(([x, y], i) => (
      <rect key={i} x={x - 4} y={y - 4} width={8} height={8} rx={2} fill={col} transform={`rotate(${(i * 37) % 90} ${x} ${y})`} />
    ))}
  </>
);

type Arms = 'hips' | 'wave' | 'point' | 'droop';
type Wear = 'none' | 'juice' | 'diet';

/** Arm ends for each pose, [from, bend, to, hand] for the left (s = -1) and right (s = 1) arm. */
const armOf = (arms: Arms, s: -1 | 1): {from: P; bend: P; to: P; hand: 'mitten' | 'fist' | 'open'} => {
  const sx = s < 0 ? -56 : 66;
  const from: P = [sx, 14];
  if (arms === 'hips') return {from, bend: [sx + s * 30, 4], to: [sx + s * 4, 40], hand: 'fist'};
  if (arms === 'droop') return {from, bend: [sx + s * 14, 40], to: [sx + s * 18, 70], hand: 'mitten'};
  if (arms === 'wave' && s > 0) return {from, bend: [sx + 30, 0], to: [sx + 24, -40], hand: 'open'};
  if (arms === 'point' && s > 0) return {from, bend: [sx + 22, 14], to: [sx + 54, 2], hand: 'open'};
  return {from, bend: [sx + s * 30, 4], to: [sx + s * 4, 40], hand: 'fist'};
};

export const Sweetie: React.FC<V8Props & {wear?: Wear; arms?: Arms}> = ({mood = 'wink', mouth = 'big', look = [0.3, 0.1], wear = 'none', arms = 'hips'}) => {
  const L = armOf(arms, -1), R = armOf(arms, 1);
  const col = wear === 'juice' ? SWEET.juice : wear === 'diet' ? SWEET.can : SWEET.front;
  const dressed = wear !== 'none';
  // in a costume the face sits higher, so the barrel's rim never covers the mouth
  const ey = dressed ? -6 : 10, my = dressed ? 18 : 38;
  return (
    <g transform="translate(-5 -4)">
      <TinyLeg from={[-30, 66]} to={[-34, 90]} fill={wear === 'none' ? SWEET.front : col} foot={-1} />
      <TinyLeg from={[18, 66]} to={[22, 90]} fill={wear === 'none' ? SWEET.front : col} />
      <TinyArm from={L.from} bend={L.bend} to={L.to} fill={SWEET.front} hand={L.hand} />
      <Shape d={roundPoly(SIL, 6)} fill={SWEET.front} shadow={0.9}>
        <path d={roundPoly(TOP, 3)} fill={SWEET.top} />
        <path d={roundPoly(SIDE, 3)} fill={SWEET.side} />
        <path d="M -56 -28 L 40 -28 L 66 -58 M 40 -28 L 40 68" {...INLINE} />
        <Crystals pts={[[-44, -12], [28, 54], [-42, 56], [24, -14], [-10, 60]]} col={SWEET.grain} />
        <Crystals pts={[[52, -18], [54, 22], [48, 50]]} col={shade(SWEET.side, 0.06)} />
        {/* the sparkle: a four-point star on the top facet */}
        <path d="M 30 -50 L 33 -43 L 40 -40 L 33 -37 L 30 -30 L 27 -37 L 20 -40 L 27 -43 Z" fill="#ffffff" {...EDGE_IN} />
      </Shape>

      {/* the costume, worn like a barrel over the lower body: the face stays clear above it */}
      {wear === 'juice' && (
        <g>
          <Shape d={roundPoly([[-66, 36], [50, 36], [76, 14], [76, 82], [50, 104], [-66, 104]], 5)} fill={SWEET.juice} shadow={0.9}>
            <path d={roundPoly([[50, 36], [76, 14], [76, 82], [50, 104]], 3)} fill={shade(SWEET.juice, 0.12)} />
            <path d="M 50 36 L 50 104" {...INLINE} />
            {/* the label: an orange slice and JUICE */}
            <rect x={-58} y={48} width={100} height={46} rx={8} fill={SWEET.juice2} />
            <circle cx={-38} cy={71} r={14} fill={CLOTH.orange} {...EDGE_IN} />
            <path d="M -38 59 V 83 M -50 71 H -26 M -46 63 L -30 79 M -30 63 L -46 79" stroke={tint(CLOTH.yellow, 0.5)} strokeWidth={2.4} />
            <text x={12} y={77} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={16} fill={INK} letterSpacing={0.5}>JUICE</text>
          </Shape>
          {/* the straw, bent, out of the box's top corner */}
          <path d="M 62 22 L 62 -74 L 84 -92" stroke={INK} strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <path d="M 62 22 L 62 -74 L 84 -92" stroke={CLOTH.pink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </g>
      )}
      {wear === 'diet' && (
        <g>
          <Shape d="M -68 36 Q -6 26 62 36 L 70 46 L 70 92 Q 70 104 58 106 Q -6 112 -64 106 Q -76 104 -76 92 L -76 46 Z" fill={SWEET.can} shadow={0.9}>
            <path d="M -76 52 Q -4 42 70 52 L 70 62 Q -4 52 -76 62 Z" fill={SWEET.can2} />
            <text x={-4} y={92} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={24} fill={INK} letterSpacing={1.5}>ZERO</text>
          </Shape>
          <path d="M -70 43 Q -4 33 66 43" {...INLINE} />
        </g>
      )}

      <Eyes x={-8} y={ey} r={13} mood={mood} look={look} brows />
      <Mouth x={-8} y={my} w={15} kind={mouth} />
      {/* a sly blush on the cheeks */}
      {wear === 'none' && <ellipse cx={-40} cy={36} rx={8} ry={5} fill={tint(CLOTH.pink, 0.2)} />}
      <TinyArm from={R.from} bend={R.bend} to={R.to} fill={SWEET.front} hand={R.hand} />
    </g>
  );
};

/** A soda can that Sweetie bursts out of in the hook: torn open at the top, foam spilling. */
export const BurstCan: React.FC<{burst?: number}> = ({burst = 1}) => (
  <g transform="translate(0 20)">
    <Shape d="M -40 -40 L -30 -52 L -18 -38 L -4 -54 L 10 -38 L 24 -54 L 40 -40 L 46 -30 L 46 70 Q 46 78 38 80 L -38 80 Q -46 78 -46 70 L -46 -30 Z" fill={CLOTH.red} shadow={0.9}>
      <path d="M -60 18 Q 0 0 60 26 L 60 38 Q 0 14 -60 30 Z" fill={CLOTH.white} />
      <text x={0} y={-6} textAnchor="middle" fontFamily={FONT} fontWeight={900} fontSize={26} letterSpacing={1} fill={CLOTH.white}>SODA</text>
    </Shape>
    {burst > 0 && (
      <g opacity={Math.min(1, burst * 1.5)}>
        {[[-34, -60, 14], [-6, -70, 18], [22, -64, 15], [40, -52, 10]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y - burst * 10} r={r} fill="#ffffff" {...EDGE_IN} />
        ))}
      </g>
    )}
  </g>
);

// ================================================================== the approval sheet
const FIG = 250;
export const SugarCastBoard: React.FC = () => {
  const fy = 200 + 60 + FIG / 2;
  const looks: {el: React.ReactNode; name: string; note: string}[] = [
    {el: <Sweetie mood="wink" mouth="big" arms="wave" />, name: 'Sweetie, the hook', note: '"Quit me for thirty days? Ha!"'},
    {el: <Sweetie mood="angry" mouth="grit" arms="point" look={[0.6, 0]} />, name: 'Sweetie, scheming', note: '"Here come the cravings!"'},
    {el: <Sweetie wear="juice" mood="happy" mouth="smile" arms="hips" look={[-0.3, 0]} />, name: 'Trick 2: juice', note: '"Relax. I\'m juice now."'},
    {el: <Sweetie wear="diet" mood="wink" mouth="tongue" arms="wave" />, name: 'Trick 3: zero', note: '"Have my sweet cousin!"'},
    {el: <Sweetie mood="sad" mouth="frown" arms="droop" look={[0, 0.5]} />, name: 'Day 30, beaten', note: '"...I\'ll be back."'},
  ];
  return (
    <Board
      kicker="Quit sugar · new cast · sheet 1"
      title="Sweetie, the sugar cube who wants Dad back"
      note="One sugar cube: a warm white front, a bright top, a grey-cream side, tiny pressed crystals on each face, one sparkle. Sly brows and a big grin. For each trick he wears a costume like a barrel (a juice box, a ZERO can), so his face always stays clear."
      page="quit sugar · cast"
    >
      <Panel x={56} y={200} w={1808} h={480} label="Sweetie, his moods and costumes" />
      {looks.map((c, i) => {
        const x = 56 + 190 + i * 357;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}>{c.el}</Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={320} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={712} w={1808} h={330} label="With the cast he fights (they exist), all at the same size" />
      {[
        {el: <Sweetie mood="wink" mouth="big" />, name: 'Sweetie'},
        {el: <BurstCan />, name: 'The soda can', note: 'he bursts out of it'},
        {el: <Brain mood="bored" mouth="flat" />, name: 'Brain', note: 'unimpressed'},
        {el: <Tooth mood="angry" mouth="grit" />, name: 'Tooth', note: 'the bouncer'},
        {el: <Liver mood="happy" mouth="big" />, name: 'Liver', note: 'gets lighter'},
        {el: <Tongue mood="open" mouth="o" />, name: 'Tongue', note: 'the surprise'},
      ].map((c, i) => {
        const x = 56 + 160 + i * 298;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={862} size={200}>{c.el}</Fig>
            <Caption x={x} y={968} name={c.name} note={c.note} size={20} w={270} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
