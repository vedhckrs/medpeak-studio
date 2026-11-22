/**
 * MedPeak Toons, look v8: the new cast of "What Happens When a Snake Bites You" (`snake-bite`).
 *   The venom gang: three venom DROPS with two small fangs in a sly grin. Each one heads for its own damage.
 *     Numb   blue   attacks the nerves (paralysis)
 *     Bleed  red    stops the blood clotting
 *     Crush  green  wrecks the tissue
 *   Antivenom: the calm hero, a rounded Y-shaped antibody (a shield with two arms), pale gold with a soft white shine.
 * Props: mood, mouth, look (the kit face), arms ('hips' | 'wave' | 'point' | 'cheer' | 'droop', Antivenom also 'punch'),
 * knocked 0..1 (dizzy eyes, tilted, little stars).
 * Drawn only with the shared kit (./kit): flat fill, one shade crescent, the ink outline, the kit face.
 */
import React from 'react';
import {Board, Caption, EDGE_IN, Eyes, Fig, INLINE, Mouth, Panel, Shape, tint, TinyArm, TinyLeg, type V8Props} from './kit';
import {castById, PersonAt} from './people-rig';

type P = [number, number];
export type GangArms = 'hips' | 'wave' | 'point' | 'cheer' | 'droop';
export type HeroArms = GangArms | 'punch';

export const VENOM = {
  numb: '#6fa8dc',
  bleed: '#d9534f',
  crush: '#58b56e',
  hero: '#f3d98a',
};

/** Arm ends for each pose: the left (s = -1) and the right (s = 1) arm, from the body's side at (sx, sy). */
const armOf = (arms: HeroArms, s: -1 | 1, sx: number, sy: number): {from: P; bend: P; to: P; hand: 'mitten' | 'fist' | 'open'} => {
  const x = s * sx;
  const from: P = [x, sy];
  if (arms === 'hips') return {from, bend: [x + s * 26, sy - 8], to: [x + s * 4, sy + 24], hand: 'fist'};
  if (arms === 'droop') return {from, bend: [x + s * 12, sy + 24], to: [x + s * 14, sy + 50], hand: 'mitten'};
  if (arms === 'cheer') return {from, bend: [x + s * 26, sy - 20], to: [x + s * 30, sy - 56], hand: 'fist'};
  if (arms === 'wave' && s > 0) return {from, bend: [x + 28, sy - 10], to: [x + 24, sy - 50], hand: 'open'};
  if (arms === 'point' && s > 0) return {from, bend: [x + 22, sy], to: [x + 54, sy - 10], hand: 'open'};
  if (arms === 'punch' && s > 0) return {from, bend: [x + 28, sy - 4], to: [x + 62, sy - 8], hand: 'fist'};
  return {from, bend: [x + s * 26, sy - 8], to: [x + s * 4, sy + 24], hand: 'fist'};
};

/** Little stars circling a knocked-out head. */
const Stars: React.FC<{k: number; y: number}> = ({k, y}) => {
  if (k <= 0.05) return null;
  const star = (cx: number, cy: number, r: number) => {
    const pts = Array.from({length: 10}, (_, i) => {
      const a = (i * Math.PI) / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
    });
    return `M ${pts.join(' L ')} Z`;
  };
  return (
    <g opacity={Math.min(1, k * 1.6)}>
      <ellipse cx={0} cy={y} rx={46} ry={11} {...INLINE} strokeDasharray="6 8" />
      {[[-40, y - 4, 9], [6, y + 10, 8], [42, y - 6, 9]].map(([x, yy, r], i) => <path key={i} d={star(x, yy, r)} fill="#ffe27a" {...EDGE_IN} />)}
    </g>
  );
};

/** The sly grin's two small fangs, hanging from the top lip. */
const Fangs: React.FC<{x: number; y: number; w: number}> = ({x, y, w}) => (
  <g>
    {[-1, 1].map((s) => (
      <path key={s} d={`M ${x + s * w * 0.55 - 4} ${y} L ${x + s * w * 0.55 + 4} ${y} L ${x + s * w * 0.55} ${y + 9} Z`} fill="#ffffff" {...EDGE_IN} />
    ))}
  </g>
);

// the drop: a round belly, a soft point on top that leans back
const DROP = 'M 4 -82 Q 20 -46 50 -6 Q 74 28 66 58 Q 56 92 0 94 Q -56 92 -66 58 Q -74 28 -50 -6 Q -18 -48 4 -82 Z';

export const VenomDrop: React.FC<V8Props & {color: string; arms?: GangArms; knocked?: number}> = ({color, mood = 'wink', mouth = 'big', look = [0.2, 0.1], arms = 'hips', knocked = 0}) => {
  const L = armOf(arms, -1, 62, 34), R = armOf(arms, 1, 62, 34);
  const m = knocked > 0.5 ? 'dizzy' : mood;
  const mk = knocked > 0.5 ? 'wavy' : mouth;
  return (
    <g transform={`rotate(${(knocked * 18).toFixed(1)} 0 90)`}>
      <TinyLeg from={[-24, 88]} to={[-28, 104]} fill={color} foot={-1} />
      <TinyLeg from={[24, 88]} to={[28, 104]} fill={color} />
      <TinyArm from={L.from} bend={L.bend} to={L.to} fill={color} hand={L.hand} />
      <Shape d={DROP} fill={color} shadow={0.9}>
        {/* the wet shine: one soft highlight on the upper left */}
        <path d="M -34 -2 Q -26 -22 -12 -34" stroke={tint(color, 0.55)} strokeWidth={9} strokeLinecap="round" fill="none" />
      </Shape>
      <Eyes x={0} y={22} r={14} mood={m} look={look} brows={knocked < 0.5} />
      <Mouth x={0} y={56} w={16} kind={mk} />
      {knocked < 0.5 && (mk === 'big' || mk === 'smile' || mk === 'grit') && <Fangs x={0} y={51} w={16} />}
      <TinyArm from={R.from} bend={R.bend} to={R.to} fill={color} hand={R.hand} />
      <Stars k={knocked} y={-90} />
    </g>
  );
};

export const Numb: React.FC<V8Props & {arms?: GangArms; knocked?: number}> = (p) => <VenomDrop {...p} color={VENOM.numb} />;
export const Bleed: React.FC<V8Props & {arms?: GangArms; knocked?: number}> = (p) => <VenomDrop {...p} color={VENOM.bleed} />;
export const Crush: React.FC<V8Props & {arms?: GangArms; knocked?: number}> = (p) => <VenomDrop {...p} color={VENOM.crush} />;

// the antibody: a rounded Y, two short arms of the Y up top, a broad shield body below
const HERO = 'M -30 92 Q -56 70 -54 28 L -54 6 L -88 -42 Q -98 -64 -78 -76 Q -60 -84 -48 -66 L -16 -24 Q 0 -18 16 -24 L 48 -66 Q 60 -84 78 -76 Q 98 -64 88 -42 L 54 6 L 54 28 Q 56 70 30 92 Q 0 106 -30 92 Z';

export const Antivenom: React.FC<V8Props & {arms?: HeroArms; knocked?: number}> = ({mood = 'happy', mouth = 'smile', look = [0, 0], arms = 'hips', knocked = 0}) => {
  const L = armOf(arms, -1, 54, 44), R = armOf(arms, 1, 54, 44);
  const col = VENOM.hero;
  return (
    <g transform={`rotate(${(knocked * 18).toFixed(1)} 0 96)`}>
      <TinyLeg from={[-22, 94]} to={[-26, 108]} fill={col} foot={-1} />
      <TinyLeg from={[22, 94]} to={[26, 108]} fill={col} />
      <TinyArm from={L.from} bend={L.bend} to={L.to} fill={col} hand={L.hand} />
      <Shape d={HERO} fill={col} shadow={0.9}>
        {/* the soft white shine down the left arm of the Y */}
        <path d="M -76 -60 L -48 -22" stroke="#ffffff" strokeWidth={10} strokeLinecap="round" fill="none" opacity={0.85} />
        <path d="M -42 10 Q -44 40 -32 64" stroke={tint(col, 0.6)} strokeWidth={8} strokeLinecap="round" fill="none" />
        {/* the shield's rim: a thin inner line round the body */}
        <path d="M -16 -24 Q 0 -18 16 -24" {...INLINE} />
      </Shape>
      <Eyes x={0} y={18} r={14} mood={knocked > 0.5 ? 'dizzy' : mood} look={look} />
      <Mouth x={0} y={56} w={16} kind={knocked > 0.5 ? 'wavy' : mouth} />
      <TinyArm from={R.from} bend={R.bend} to={R.to} fill={col} hand={R.hand} />
      <Stars k={knocked} y={-96} />
    </g>
  );
};

// ================================================================== the approval sheet
const FIG = 250;
export const SnakeCastBoard: React.FC = () => {
  const fy = 200 + 60 + FIG / 2;
  const looks: {el: React.ReactNode; name: string; note: string}[] = [
    {el: <Numb mood="wink" mouth="big" arms="wave" />, name: 'Numb, the hook', note: '"Nerves? Mine."'},
    {el: <Bleed mood="angry" mouth="grit" arms="point" look={[0.6, 0]} />, name: 'Bleed, scheming', note: '"No clotting today!"'},
    {el: <Crush mood="happy" mouth="big" arms="cheer" look={[0, -0.4]} />, name: 'Crush, cheering', note: '"Cut it! Yes! Tie it!"'},
    {el: <Antivenom mood="angry" mouth="flat" arms="punch" look={[0.6, 0]} />, name: 'Antivenom, the hero', note: 'calm, then one punch'},
    {el: <Numb mood="sad" mouth="frown" arms="droop" knocked={1} />, name: 'Knocked out', note: '"...ow."'},
  ];
  const people = [
    {id: 'patient', name: 'Sam', note: 'the hiker'},
    {id: 'mom', name: 'Mom', note: 'shouts the myths'},
    {id: 'doctor', name: 'Dr. Mira', note: 'the hospital'},
  ];
  return (
    <Board
      kicker="Snake bite · new cast · sheet 1"
      title="The venom gang, and the antivenom"
      note="Three venom drops, one colour each (Numb blue for the nerves, Bleed red for the blood, Crush green for the tissue): the kit face, two small fangs in a sly grin, tiny arms and legs, one shine. The antivenom is a rounded Y, an antibody like a shield with two arms, pale gold with a soft white shine: calm, until it punches."
      page="snake bite · cast"
    >
      <Panel x={56} y={200} w={1808} h={480} label="The gang and the hero: moods and poses" />
      {looks.map((c, i) => {
        const x = 56 + 190 + i * 357;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={fy} size={FIG}>{c.el}</Fig>
            <Caption x={x} y={fy + FIG / 2 + 6} name={c.name} note={c.note} size={21} w={320} />
          </React.Fragment>
        );
      })}
      <Panel x={56} y={712} w={1808} h={330} label="With the people (they exist), the gang at one size" />
      {[
        {el: <Numb mood="wink" mouth="big" />, name: 'Numb', note: 'nerves'},
        {el: <Bleed mood="wink" mouth="big" />, name: 'Bleed', note: 'blood'},
        {el: <Crush mood="wink" mouth="big" />, name: 'Crush', note: 'tissue'},
        {el: <Antivenom />, name: 'Antivenom', note: 'the drip'},
      ].map((c, i) => {
        const x = 56 + 140 + i * 230;
        return (
          <React.Fragment key={c.name}>
            <Fig x={x} y={862} size={190}>{c.el}</Fig>
            <Caption x={x} y={968} name={c.name} note={c.note} size={20} w={220} />
          </React.Fragment>
        );
      })}
      {people.map((c, i) => {
        const x = 56 + 1110 + i * 250;
        return (
          <React.Fragment key={c.id}>
            <PersonAt spec={castById(c.id)} view="three-quarter" pose="rest" expr={c.id === 'mom' ? 'worried' : 'neutral'} x={x} y={958} scale={0.57} />
            <Caption x={x} y={968} name={c.name} note={c.note} size={20} w={230} />
          </React.Fragment>
        );
      })}
    </Board>
  );
};
