/**
 * "What Happens When You Stop Drinking Alcohol" (`stop-alcohol`), engine v9: this video's new drawings and its moments,
 * for the owner's look sheets and the shots.
 *   Booze        the intruder with a face: a round amber drink drop with a white foam cap, bubbles inside, tiny arms
 *   Mop          the Liver's mop (held BEHIND his hand, the hand one piece with the arm)
 *   Spill        amber puddles on the liver's surface (the night's mess), placed clear of the face
 * The place: the whole Liver (sugar-organs `LiverFull`, the full-organ rule) on ONE flat colour that tells the time:
 *   NIGHT a dusky indigo, MORNING a warm sunrise (the place changes, the framing holds).
 * Moments: the hook (Booze splashes down, "Drink number four!"), the next morning (clean, Booze shrunk), the twist
 * (Grandpa's "all at once": the Liver drops the mop), the clinic (Dad, Grandpa, the new doctor).
 */
import React from 'react';
import {Scene} from './scene';
import {EDGE_IN, Eyes, Highlight, INLINE, Mouth, Shape, shade, smoothD, tint, TinyArm, V9, type Mood, type MouthKind} from './kit';
import {LiverFull} from './sugar-organs';
import {castById, PersonAt} from './people-rig';
import {DoctorAt} from './doctor-new';
import {PaleClinicRoom} from './scenes-rooms';
import {FrameMove, matMul, matScale, matTranslate, matRotate} from './play';
import {type ArmPose, type Gesture} from './organ-act';

export const PLACE_NIGHT = '#7b7db6', PLACE_MORNING = '#f3c58c';
/** The liver's framing (LiverFull's own default: centre 540, 960, scale 6.2); its face sits at about (317, 786). */
const LIVER_X = 540, LIVER_Y = 960, LIVER_S = 6.2;
const atLiver = (u: number, v: number): [number, number] => [LIVER_X + u * LIVER_S, LIVER_Y + v * LIVER_S];

export const Svg: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}} width={1080} height={1920} viewBox="0 0 1080 1920">{children}</svg>
);

// ------------------------------------------------------------------ Booze
const AMBER = '#e9a43a', AMBER_DEEP = '#c47a1f', FOAM = '#fbf6ea';
export type BoozeArms = 'rest' | 'cheer' | 'point' | 'shrink';
/** Drawn with its origin at the bottom of the drop (it stands on that point); about 220 units tall. */
export const Booze: React.FC<{mood?: Mood; mouth?: MouthKind; look?: [number, number]; arms?: BoozeArms; squash?: number}> = ({
  mood = 'wink', mouth = 'smile', look = [0, 0.2], arms = 'rest', squash = 0,
}) => {
  const sx = 1 + 0.18 * squash, sy = 1 - 0.18 * squash;
  const body = smoothD([[0, 0], [62, -14], [96, -62], [100, -118], [74, -164], [0, -184], [-74, -164], [-100, -118], [-96, -62], [-62, -14]]);
  const foam = smoothD([[-92, -150], [-70, -196], [-30, -214], [4, -230], [44, -214], [82, -200], [100, -160], [70, -150], [30, -160], [-10, -150], [-50, -158]]);
  const arm = (side: 1 | -1): {to: [number, number]; bend: [number, number]} => {
    if (arms === 'cheer') return {to: [side * 150, -210], bend: [side * 136, -140]};
    if (arms === 'point') return side > 0 ? {to: [170, -150], bend: [128, -112]} : {to: [-120, -40], bend: [-118, -82]};
    if (arms === 'shrink') return {to: [side * 34, -70], bend: [side * 108, -64]};
    return {to: [side * 128, -40], bend: [side * 118, -86]};
  };
  return (
    <g transform={`scale(${sx} ${sy})`}>
      {([-1, 1] as const).map((side) => { const a = arm(side); return <TinyArm key={side} from={[side * 86, -96]} to={a.to} bend={a.bend} fill={AMBER} w={11} hand="mitten" />; })}
      <Shape d={body} fill={AMBER} shadow={1.2}>
        {/* the deeper drink low in the drop, a few rising bubbles clear of the face */}
        <path d={smoothD([[0, -6], [58, -20], [88, -58], [0, -70], [-88, -58], [-58, -20]])} fill={AMBER_DEEP} opacity={0.45} />
        {[[-66, -56, 7], [-54, -88, 5], [64, -60, 6], [72, -96, 4.5], [50, -30, 5]].map(([x, y, r], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill={tint(AMBER, 0.45)} {...EDGE_IN} />
        ))}
        <Highlight x={-58} y={-128} w={30} rot={-50} />
      </Shape>
      <Shape d={foam} fill={FOAM} shadow={0.8}>
        <path d="M -54 -186 Q -30 -198 -8 -190 M 20 -202 Q 44 -210 62 -196" {...INLINE} />
      </Shape>
      <Eyes x={0} y={-112} r={24} gap={6} mood={mood} look={look} />
      <Mouth x={2} y={-64} w={32} kind={mouth} />
    </g>
  );
};
export const BoozeAt: React.FC<React.ComponentProps<typeof Booze> & {x: number; y: number; scale?: number; rot?: number}> = ({x, y, scale = 1, rot = 0, ...p}) => (
  <FrameMove m={matMul(matMul(matTranslate(x, y), matRotate(rot)), matScale(scale))} who="booze">
    <Svg><g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}><Booze {...p} /></g></Svg>
  </FrameMove>
);
/** A plain falling drop (no face): the stream that keeps arriving. */
const Drop: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <Shape d={smoothD([[0, -40], [16, -10], [22, 10], [12, 28], [0, 32], [-12, 28], [-22, 10], [-16, -10]])} fill={AMBER} shadow={0.6}>
      <Highlight x={-8} y={4} w={10} rot={-60} />
    </Shape>
  </g>
);
/** The splash ring where Booze lands. */
const Splash: React.FC<{x: number; y: number}> = ({x, y}) => (
  <g>
    {[[-120, -50, -40], [-70, -96, -20], [70, -100, 20], [124, -56, 40]].map(([dx, dy, r], i) => (
      <g key={i} transform={`translate(${x + dx} ${y + dy}) rotate(${r})`}>
        <Shape d={smoothD([[0, -22], [11, -4], [8, 14], [0, 18], [-8, 14], [-11, -4]])} fill={AMBER} shadow={0.5} />
      </g>
    ))}
  </g>
);

// ------------------------------------------------------------------ the spill and the mop
/** Amber puddles on the liver (frame pixels), all clear of the face box around (317, 786). k 0..1 = how much mess. */
const PUDDLES: [number, number, number][] = [[640, 690, 70], [860, 770, 56], [590, 960, 64], [900, 920, 48], [470, 1080, 46], [1000, 840, 34]];
export const Spill: React.FC<{k: number}> = ({k}) => (
  <Svg>
    {PUDDLES.slice(0, Math.round(PUDDLES.length * k)).map(([x, y, r], i) => {
      const pts = Array.from({length: 8}, (_, j): [number, number] => {
        const a = (j / 8) * Math.PI * 2, q = 1 + ((j * 37 + i * 11) % 7 - 3) * 0.06;
        return [x + Math.cos(a) * r * q, y + Math.sin(a) * r * 0.62 * q];
      });
      return (
        <g key={i}>
          <path d={smoothD(pts)} fill={shade(AMBER, 0.06)} opacity={0.92} {...EDGE_IN} />
          <ellipse cx={x - r * 0.3} cy={y - r * 0.2} rx={r * 0.22} ry={r * 0.1} fill="#ffffff" opacity={0.75} />
        </g>
      );
    })}
  </Svg>
);
const WOOD = '#c99a62', STRING = '#f1e7cf';
/** The mop in pixels around the gripping hand (0, 0): handle up and down from the hand, the string head at the bottom. `fall` 0..1 tips it over. */
export const MopBody: React.FC<{fall?: number}> = ({fall = 0}) => {
  const ang = 18 + 70 * fall; // degrees from vertical
  const len = 520, r = (ang * Math.PI) / 180;
  const foot: [number, number] = [Math.sin(r) * len * 0.75, Math.cos(r) * len * 0.75];
  const top: [number, number] = [-Math.sin(r) * len * 0.25, -Math.cos(r) * len * 0.25];
  return (
    <g>
      <path d={`M ${top[0]} ${top[1]} L ${foot[0]} ${foot[1]}`} stroke={shade(WOOD, 0.3)} strokeWidth={26} strokeLinecap="round" />
      <path d={`M ${top[0]} ${top[1]} L ${foot[0]} ${foot[1]}`} stroke={WOOD} strokeWidth={18} strokeLinecap="round" />
      <g transform={`translate(${foot[0]} ${foot[1]}) rotate(${-ang})`}>
        <Shape d={smoothD([[-70, 0], [-40, -18], [0, -24], [40, -18], [70, 0], [80, 60], [50, 96], [0, 104], [-50, 96], [-80, 60]])} fill={STRING} shadow={1}>
          {[-48, -24, 0, 24, 48].map((x) => <path key={x} d={`M ${x} -10 Q ${x + 6} 40 ${x} 96`} {...INLINE} />)}
        </Shape>
      </g>
    </g>
  );
};
/** The mop held in the Liver's right hand ('rest' arm: the hand at liver units (26, 58)), for LiverFull's `held` slot. */
export const HeldMop: React.FC = () => <g transform={`translate(26 58) scale(${1 / LIVER_S})`}><MopBody /></g>;
/** The dropped mop, on its own in frame pixels. */
export const DroppedMop: React.FC<{x: number; y: number}> = ({x, y}) => <Svg><g transform={`translate(${x} ${y})`}><MopBody fall={0.85} /></g></Svg>;

// ------------------------------------------------------------------ the liver with its acting, on the time-of-day place
type LiverMoment = {held?: boolean; place: string; mood: Mood; mouth: MouthKind; look: [number, number]; armL?: ArmPose | Gesture; armR?: ArmPose | Gesture; sq?: number};
const LiverHere: React.FC<LiverMoment & {t: number}> = ({t, ...m}) => (
  <div style={{position: 'absolute', inset: 0}}>
    <LiverFull t={t} fat={0} place={m.place} mood={m.mood} mouth={m.mouth} look={m.look} armL={m.armL} armR={m.armR} sq={m.sq ?? 0} held={m.held ? <HeldMop /> : undefined} />
  </div>
);
/** Where the Liver's right hand is for the 'rest' and 'reach' arms (the mop goes behind it). */
const HAND_REST = atLiver(26, 58);

/** A1: NIGHT. Booze splashes down onto the liver top right and grins at the lens; the Liver mops, eyes heavy, puddles everywhere, more drops falling. */
export const MomentHook: React.FC = () => (
  <Scene bg={PLACE_NIGHT}><V9>
    <LiverHere t={1} place={PLACE_NIGHT} mood="sleepy" mouth="wavy" look={[0.5, 0.4]} held />
    <Spill k={1} />
    <Svg>
      {[[180, 240, 0.9], [420, 140, 1.1], [980, 300, 0.8], [620, 330, 0.7]].map(([x, y, s], i) => <Drop key={i} x={x} y={y} s={s} />)}
      <Splash x={790} y={600} />
    </Svg>
    <BoozeAt x={790} y={600} scale={1.15} mood="wink" mouth="big" look={[0, 0.3]} arms="cheer" squash={0.5} />
  </V9></Scene>
);
/** A3-A4: Dad's voice from above; Booze points up and laughs "he'll be back by Friday". */
export const MomentBack: React.FC = () => (
  <Scene bg={PLACE_NIGHT}><V9>
    <LiverHere t={2} place={PLACE_NIGHT} mood="open" mouth="o" look={[0.2, -0.9]} held />
    <Spill k={1} />
    <BoozeAt x={800} y={610} scale={1.1} mood="happy" mouth="big" look={[-0.6, 0.1]} arms="point" />
  </V9></Scene>
);
/** B1-B3: THE NEXT MORNING, the same framing on the sunrise place: no new drops, the puddles gone, the Liver bright; Booze shrunk in the corner. */
export const MomentMorning: React.FC = () => (
  <Scene bg={PLACE_MORNING}><V9>
    <LiverHere t={3} place={PLACE_MORNING} mood="happy" mouth="big" look={[0.4, -0.3]} armL="up" held />
    <Spill k={0.15} />
    <BoozeAt x={940} y={560} scale={0.55} mood="scared" mouth="frown" look={[-0.8, 0.2]} arms="shrink" />
  </V9></Scene>
);
/** C1-C3: Grandpa's "all at once, tonight!": the Liver drops the mop, both hands up; Booze, small, "this could get bumpy". */
export const MomentTwist: React.FC = () => (
  <Scene bg={PLACE_MORNING}><V9>
    <LiverHere t={4} place={PLACE_MORNING} mood="shock" mouth="o" look={[0.3, -0.9]} armL="up" armR="up" sq={-0.04} />
    <DroppedMop x={470} y={1480} />
    <BoozeAt x={940} y={560} scale={0.62} mood="side" mouth="smile" look={[-0.9, 0]} arms="rest" />
  </V9></Scene>
);
/** D: the clinic (a cream wall, new for this video): Dad, Grandpa, the new doctor. */
export const MomentClinic: React.FC = () => {
  const dad = castById('dad'), grandpa = castById('grandpa');
  return (
    <Scene bg="#f1ede4"><V9>
      <PaleClinicRoom wall="cream" items={['door', 'plant']} />
      <PersonAt spec={grandpa} pose="worried" view="three-quarter" facing="right" expr="worried" lookAt={[860, 1000]} x={200} y={2050} scale={3.4} />
      <PersonAt spec={dad} pose="think" view="three-quarter" facing="right" expr="neutral" lookAt={[860, 1000]} x={470} y={2050} scale={3.4} />
      <DoctorAt view="three-quarter" facing="left" expr="neutral" lookAt={[420, 1000]} x={880} y={2050} scale={3.4} />
    </V9></Scene>
  );
};
/** The Booze model sheet: four moods. */
export const BoozeSheet: React.FC = () => (
  <Scene bg="#efe9f6"><V9>
    {([[230, 'wink', 'big', 'cheer'], [870, 'happy', 'big', 'point'], [230, 'side', 'smile', 'rest']] as [number, Mood, MouthKind, BoozeArms][]).map(([x, mood, mouth, arms], i) => (
      <BoozeAt key={i} x={x} y={i < 2 ? 900 : 1500} scale={1.1} mood={mood} mouth={mouth} arms={arms} look={[0, 0.2]} />
    ))}
    <BoozeAt x={850} y={1500} scale={1.1} mood="scared" mouth="frown" arms="shrink" look={[0.6, 0]} />
  </V9></Scene>
);
